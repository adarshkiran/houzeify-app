// Pure tests for the BOQ money math (spec §16). No database, no Fastify —
// these run even when DATABASE_URL is unset.
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BoqNumberError,
  MAX_AMOUNT_PAISE,
  MAX_QUANTITY,
  MAX_RATE,
  computeAmountPaise,
  milliToQuantity,
  paiseToRupees,
  quantityToMilli,
  rateToPaise,
} from './boqMoney.js'

/** Assert `fn` throws a BoqNumberError carrying exactly `code`. */
function assertBoqError(fn: () => unknown, code: string, label: string) {
  assert.throws(
    fn,
    (err: unknown) => {
      assert.ok(err instanceof BoqNumberError, `${label}: expected BoqNumberError`)
      assert.ok(err instanceof Error, `${label}: expected an Error subclass`)
      assert.equal((err as BoqNumberError).code, code, `${label}: wrong code`)
      return true
    },
    label,
  )
}

test('constants match spec §16', () => {
  assert.equal(MAX_QUANTITY, 10_000_000)
  assert.equal(MAX_RATE, 100_000_000)
  assert.equal(MAX_AMOUNT_PAISE, 100_000_000_000) // ₹1,000,000,000 = ₹100 crore
})

test('BoqNumberError carries its code and is an Error', () => {
  const err = new BoqNumberError('INVALID_RATE')
  assert.ok(err instanceof Error)
  assert.ok(err instanceof BoqNumberError)
  assert.equal(err.code, 'INVALID_RATE')
  assert.equal(err.name, 'BoqNumberError')
})

test('12.5 x 1234.56 = 15432.00 exactly', () => {
  const milli = quantityToMilli(12.5)
  const paise = rateToPaise(1234.56)
  assert.equal(milli, 12_500)
  assert.equal(paise, 123_456)
  const amount = computeAmountPaise(milli, paise)
  assert.equal(amount, 1_543_200)
  assert.equal(paiseToRupees(amount), 15432)
})

test('half-up rounding boundaries (product / 1000, in paise)', async (t) => {
  const amount = (q: number, r: number) => computeAmountPaise(quantityToMilli(q), rateToPaise(r))

  await t.test('0.001 x 5.00 = 0.5 paisa -> rounds UP to 1 paisa (Rs 0.01)', () => {
    assert.equal(amount(0.001, 5.0), 1)
    assert.equal(paiseToRupees(amount(0.001, 5.0)), 0.01)
  })
  await t.test('0.001 x 4.99 = 0.499 paisa -> 0', () => {
    assert.equal(amount(0.001, 4.99), 0)
  })
  await t.test('0.003 x 1.67 = 0.501 paisa -> 1', () => {
    assert.equal(amount(0.003, 1.67), 1)
  })
  await t.test('0.003 x 1.50 = 0.45 paisa -> 0', () => {
    assert.equal(amount(0.003, 1.5), 0)
  })
  await t.test('exact integer case: 2 x 3.50 = 700 paise', () => {
    assert.equal(amount(2, 3.5), 700)
  })
  await t.test('large exact case: 123456.789 x 1000.00 = 12,345,678,900 paise', () => {
    assert.equal(amount(123_456.789, 1000), 12_345_678_900)
    assert.equal(paiseToRupees(amount(123_456.789, 1000)), 123_456_789)
  })
})

test('zero rate (unpriced item) gives amount 0', () => {
  assert.equal(rateToPaise(0), 0)
  assert.equal(computeAmountPaise(quantityToMilli(250.5), rateToPaise(0)), 0)
})

test('negative zero rate normalises to +0', () => {
  assert.ok(Object.is(rateToPaise(-0), 0))
})

test('smallest quantity 0.001 is accepted', () => {
  assert.equal(quantityToMilli(0.001), 1)
})

test('quantity cap boundary', () => {
  assert.equal(quantityToMilli(10_000_000), 10_000_000_000)
  assertBoqError(() => quantityToMilli(10_000_000.001), 'INVALID_QUANTITY', '10,000,000.001')
  assertBoqError(() => quantityToMilli(10_000_001), 'INVALID_QUANTITY', '10,000,001')
  assertBoqError(() => quantityToMilli(Number.MAX_VALUE), 'INVALID_QUANTITY', 'MAX_VALUE')
})

test('rate cap boundary', () => {
  assert.equal(rateToPaise(100_000_000), 10_000_000_000)
  assertBoqError(() => rateToPaise(100_000_000.01), 'INVALID_RATE', '100,000,000.01')
  assertBoqError(() => rateToPaise(100_000_001), 'INVALID_RATE', '100,000,001')
  assertBoqError(() => rateToPaise(Number.MAX_VALUE), 'INVALID_RATE', 'MAX_VALUE')
})

test('tricky binary-float decimals are handled exactly', async (t) => {
  await t.test('accepted quantities', () => {
    assert.equal(quantityToMilli(12.5), 12_500)
    assert.equal(quantityToMilli(0.001), 1)
    assert.equal(quantityToMilli(1.005), 1005)
    assert.equal(quantityToMilli(1234.567), 1_234_567)
    assert.equal(quantityToMilli(4.35), 4350)
    assert.equal(quantityToMilli(9_999_999.999), 9_999_999_999)
  })
  await t.test('accepted rates', () => {
    assert.equal(rateToPaise(1234.56), 123_456)
    assert.equal(rateToPaise(4.35), 435)
    assert.equal(rateToPaise(0.1), 10)
    assert.equal(rateToPaise(0.07), 7)
    assert.equal(rateToPaise(99_999_999.99), 9_999_999_999)
    assert.equal(rateToPaise(1.1), 110)
  })
  await t.test('0.1 + 0.2 (0.30000000000000004, one ulp off 0.3) is float noise, read as 0.3', () => {
    assert.equal(0.1 + 0.2 === 0.3, false)
    assert.equal(quantityToMilli(0.1 + 0.2), 300)
    assert.equal(rateToPaise(0.1 + 0.2), 30)
  })
  await t.test('rejected: more decimals than allowed', () => {
    assertBoqError(() => quantityToMilli(0.0005), 'INVALID_QUANTITY', 'qty 0.0005')
    assertBoqError(() => quantityToMilli(1.0005), 'INVALID_QUANTITY', 'qty 1.0005')
    assertBoqError(() => quantityToMilli(1.0000000001), 'INVALID_QUANTITY', 'qty 1.0000000001')
    assertBoqError(() => rateToPaise(0.005), 'INVALID_RATE', 'rate 0.005')
    assertBoqError(() => rateToPaise(1.005), 'INVALID_RATE', 'rate 1.005')
    assertBoqError(() => rateToPaise(1234.567), 'INVALID_RATE', 'rate 1234.567')
    assertBoqError(() => rateToPaise(0.0000001), 'INVALID_RATE', 'rate 1e-7')
  })
})

test('every 3-dp quantity and 2-dp rate near the small end round-trips', () => {
  // Sweep: k/1000 and k/100 must scale back to exactly k despite float noise.
  for (let k = 1; k <= 20_000; k++) {
    assert.equal(quantityToMilli(k / 1000), k, `quantity ${k}/1000`)
    assert.equal(rateToPaise(k / 100), k, `rate ${k}/100`)
  }
})

test('invalid quantity -> INVALID_QUANTITY', async (t) => {
  const bad: Array<[string, unknown]> = [
    ['0', 0],
    ['-1', -1],
    ['-0.001', -0.001],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    ['string "5"', '5'],
    ['null', null],
    ['undefined', undefined],
    ['true', true],
    ['false', false],
    ['object', {}],
    ['array', [5]],
    ['bigint', 5n],
    ['4 decimals (1.0005)', 1.0005],
    ['over cap (10,000,000.001)', 10_000_000.001],
  ]
  for (const [label, value] of bad) {
    await t.test(label, () => assertBoqError(() => quantityToMilli(value), 'INVALID_QUANTITY', label))
  }
})

test('invalid rate -> INVALID_RATE', async (t) => {
  const bad: Array<[string, unknown]> = [
    ['-0.01', -0.01],
    ['-1', -1],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    ['string "10"', '10'],
    ['null', null],
    ['undefined', undefined],
    ['true', true],
    ['object', {}],
    ['bigint', 10n],
    ['3 decimals (0.005)', 0.005],
    ['3 decimals (1234.567)', 1234.567],
    ['over cap (100,000,000.01)', 100_000_000.01],
  ]
  for (const [label, value] of bad) {
    await t.test(label, () => assertBoqError(() => rateToPaise(value), 'INVALID_RATE', label))
  }
})

test('AMOUNT_TOO_LARGE', async (t) => {
  await t.test('10,000,000 x 100,000,000 (product ~1e20, far beyond 2^53) is rejected', () => {
    const milli = quantityToMilli(10_000_000)
    const paise = rateToPaise(100_000_000)
    assert.ok(milli * paise > Number.MAX_SAFE_INTEGER, 'sanity: a float product would be unsafe')
    assertBoqError(() => computeAmountPaise(milli, paise), 'AMOUNT_TOO_LARGE', 'max x max')
  })

  await t.test('exactly at the cap (10 x 100,000,000 = Rs 1,000,000,000) is accepted', () => {
    const amount = computeAmountPaise(quantityToMilli(10), rateToPaise(100_000_000))
    assert.equal(amount, MAX_AMOUNT_PAISE)
    assert.equal(paiseToRupees(amount), 1_000_000_000)
  })

  await t.test('cap reached by other factor pairs (1,000,000 x 1,000.00) is accepted', () => {
    assert.equal(
      computeAmountPaise(quantityToMilli(1_000_000), rateToPaise(1000)),
      MAX_AMOUNT_PAISE,
    )
  })

  await t.test('just over the cap (10.001 x 100,000,000) is rejected', () => {
    assertBoqError(
      () => computeAmountPaise(quantityToMilli(10.001), rateToPaise(100_000_000)),
      'AMOUNT_TOO_LARGE',
      'just over cap',
    )
  })

  await t.test('rounding happens before the cap check (cap + 0.4 paisa ok, cap + 0.5 rejected)', () => {
    // product = 2 x (5e13 + k) = 1e14 + 2k; /1000 = 1e11 + 2k/1000. k = 249 gives
    // a .498 fraction (rounds down to the cap); k = 250 gives .500 (rounds up past it).
    assert.equal(computeAmountPaise(2, 50_000_000_000_249), MAX_AMOUNT_PAISE) // 1e11 + 0.498
    assertBoqError(
      () => computeAmountPaise(2, 50_000_000_000_250), // 1e11 + 0.500 -> 1e11 + 1
      'AMOUNT_TOO_LARGE',
      'cap + 0.5',
    )
  })
})

test('computeAmountPaise rejects non-integer / negative inputs (programmer error)', () => {
  assert.throws(() => computeAmountPaise(1.5, 100), RangeError)
  assert.throws(() => computeAmountPaise(1000, 100.5), RangeError)
  assert.throws(() => computeAmountPaise(-1, 100), RangeError)
  assert.throws(() => computeAmountPaise(1000, -100), RangeError)
  assert.throws(() => computeAmountPaise(NaN, 100), RangeError)
  assert.throws(() => computeAmountPaise(Number.MAX_SAFE_INTEGER + 2, 100), RangeError)
})

test('paiseToRupees / milliToQuantity round trips', () => {
  assert.equal(paiseToRupees(1_543_200), 15432)
  assert.equal(paiseToRupees(1), 0.01)
  assert.equal(paiseToRupees(0), 0)
  assert.equal(milliToQuantity(12_500), 12.5)
  assert.equal(milliToQuantity(1), 0.001)
  assert.equal(milliToQuantity(0), 0)
  for (const q of [0.001, 0.5, 1, 12.5, 1234.567, 9_999_999.999, 10_000_000]) {
    assert.equal(milliToQuantity(quantityToMilli(q)), q)
  }
  for (const r of [0, 0.01, 0.5, 1, 1234.56, 99_999_999.99, 100_000_000]) {
    assert.equal(paiseToRupees(rateToPaise(r)), r)
  }
})

test('sum safety: 1,000 items at the amount cap stay below MAX_SAFE_INTEGER', () => {
  // Why these caps: each item <= 1e11 paise, so 1,000 items <= 1e14 paise, ~90x
  // below 2^53 - 1 (~9.007e15). Section/project totals are plain Number sums of
  // stored amount_paise integers and remain exact.
  const items = 1000
  assert.ok(MAX_AMOUNT_PAISE * items < Number.MAX_SAFE_INTEGER)
  assert.ok(MAX_AMOUNT_PAISE * items * 90 < Number.MAX_SAFE_INTEGER, '>= 90x headroom')

  const atCap = computeAmountPaise(quantityToMilli(10), rateToPaise(100_000_000))
  assert.equal(atCap, MAX_AMOUNT_PAISE)
  let sum = 0
  for (let i = 0; i < items; i++) sum += atCap
  assert.equal(sum, 100_000_000_000_000) // 1e14 paise = Rs 1e12
  assert.ok(Number.isSafeInteger(sum))
  assert.ok(sum < Number.MAX_SAFE_INTEGER)
})

// ─── Ruling R6: raw-value cap guards run BEFORE scaling ─────────────────────
test('values a hair over the cap are rejected, not snapped to it (JSON.parse-able inputs)', () => {
  // These parse to distinct doubles just above the cap; without the raw guard
  // they scale to the cap's integer within float noise and were accepted.
  assertBoqError(() => quantityToMilli(JSON.parse('10000000.000000001')), 'INVALID_QUANTITY', '10000000.000000001')
  // NB: the literal 100000000.000000001 is below half an ulp at 1e8 (ulp ~1.5e-8),
  // so it parses to exactly 1e8 (== MAX_RATE) and is legitimately accepted; the
  // smallest distinguishable over-cap literals sit one ulp above.
  assert.equal(JSON.parse('100000000.000000001'), MAX_RATE)
  assert.ok(JSON.parse('100000000.00000002') > MAX_RATE)
  assertBoqError(() => rateToPaise(JSON.parse('100000000.00000002')), 'INVALID_RATE', '100000000.00000002')
  // The caps themselves are still accepted.
  assert.equal(quantityToMilli(MAX_QUANTITY), MAX_QUANTITY * 1000)
  assert.equal(rateToPaise(MAX_RATE), MAX_RATE * 100)
})

test('half-unit fractions at the top of the range are rejected (too many decimals)', () => {
  assertBoqError(() => quantityToMilli(9_999_999.9995), 'INVALID_QUANTITY', '9999999.9995')
  assertBoqError(() => rateToPaise(99_999_999.995), 'INVALID_RATE', '99999999.995')
})

test('paise -> rupees -> JSON -> paise is idempotent', () => {
  for (const paise of [0, 1, 7, 99, 100, 101, 123_456, 1_543_200, 9_999_999_999, MAX_RATE * 100]) {
    const viaJson = JSON.parse(JSON.stringify(paiseToRupees(paise))) as number
    assert.equal(rateToPaise(viaJson), paise, `rate ${paise}`)
  }
  for (const milli of [1, 7, 999, 1000, 12_500, 1_234_567, 9_999_999_999, MAX_QUANTITY * 1000]) {
    const viaJson = JSON.parse(JSON.stringify(milliToQuantity(milli))) as number
    assert.equal(quantityToMilli(viaJson), milli, `quantity ${milli}`)
  }
})
