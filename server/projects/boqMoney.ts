// ─── BOQ money math (spec §16) ─────────────────────────────────────────────
// Exact, scaled-integer arithmetic — no floating-point money anywhere:
//   quantity_milli = quantity × 1000  (3 dp)   integer
//   rate_paise     = rate × 100       (2 dp)   integer
//   amount_paise   = round_half_up(quantity_milli × rate_paise ÷ 1000), via BigInt
// Rounding is half-up to the nearest paisa, applied ONCE per item. Totals are
// plain sums of stored amount_paise (never re-rounded), so total == Σ subtotals
// == Σ items always. This is the ONLY place money arithmetic lives: the DB
// stores the integers and everything else just adds or formats them.
//
// The caps keep every stored/summed value below Number.MAX_SAFE_INTEGER:
// 1,000 items × ₹100 crore (1e11 paise) = 1e14 paise, ~90× below 2^53.

export type BoqNumberErrorCode = 'INVALID_QUANTITY' | 'INVALID_RATE' | 'AMOUNT_TOO_LARGE'

export class BoqNumberError extends Error {
  readonly code: BoqNumberErrorCode

  constructor(code: BoqNumberErrorCode) {
    super(code)
    this.name = 'BoqNumberError'
    this.code = code
  }
}

/** Largest accepted quantity (units). */
export const MAX_QUANTITY = 10_000_000
/** Largest accepted rate (₹ per unit). */
export const MAX_RATE = 100_000_000
/** Largest accepted line amount: ₹1,000,000,000 (₹100 crore) in paise. */
export const MAX_AMOUNT_PAISE = 100_000_000_000

const MILLI_PER_UNIT = 1000
const PAISE_PER_RUPEE = 100

/**
 * Scale a finite number by `factor` and return the exact integer result, or
 * `null` if the number has more decimals than `factor` allows (or cannot be
 * scaled to a safe integer).
 *
 * Decimal places are checked numerically, not by parsing float strings: scale,
 * round, then require the scaled value to sit within float noise of that
 * integer. `x * factor` for a genuine k-dp decimal is off from the integer by
 * at most ~2 half-ulps (one from the input's own binary representation, one
 * from the multiply) = ~2.2e-16 relative, so the tolerance is 4 EPSILON
 * relative to the scaled magnitude. A relative tolerance (no absolute floor)
 * keeps the check tight for small values (1.0000000001 is rejected) while
 * still accepting large ones (9,999,999.999 scaled is ~1e10, where the
 * absolute float noise is ~1e-6).
 */
function scaleExact(value: number, factor: number): number | null {
  const scaled = value * factor
  const rounded = Math.round(scaled)
  if (!Number.isSafeInteger(rounded)) return null
  if (Math.abs(scaled - rounded) > Math.abs(scaled) * 4 * Number.EPSILON) return null
  return rounded + 0 // normalises -0 to +0
}

/** Validate a quantity and return it as an integer number of milli-units. */
export function quantityToMilli(q: unknown): number {
  if (typeof q !== 'number' || !Number.isFinite(q)) throw new BoqNumberError('INVALID_QUANTITY')
  // Raw-value cap BEFORE scaling: without it 10000000.000000001 scales to the
  // cap's integer within float noise and would be silently snapped to it.
  if (q > MAX_QUANTITY) throw new BoqNumberError('INVALID_QUANTITY')
  const milli = scaleExact(q, MILLI_PER_UNIT)
  if (milli === null || milli <= 0 || milli > MAX_QUANTITY * MILLI_PER_UNIT) {
    throw new BoqNumberError('INVALID_QUANTITY')
  }
  return milli
}

/** Validate a rate and return it as an integer number of paise (0 = unpriced). */
export function rateToPaise(r: unknown): number {
  if (typeof r !== 'number' || !Number.isFinite(r)) throw new BoqNumberError('INVALID_RATE')
  // Raw-value cap BEFORE scaling (see quantityToMilli).
  if (r > MAX_RATE) throw new BoqNumberError('INVALID_RATE')
  const paise = scaleExact(r, PAISE_PER_RUPEE)
  if (paise === null || paise < 0 || paise > MAX_RATE * PAISE_PER_RUPEE) {
    throw new BoqNumberError('INVALID_RATE')
  }
  return paise
}

/**
 * amount_paise = round_half_up(quantityMilli × ratePaise ÷ 1000), exact.
 * The product can exceed 2^53, so it is computed in BigInt. Inputs are
 * already-validated non-negative integers (a violation is a programmer error
 * and throws RangeError, not BoqNumberError). Throws AMOUNT_TOO_LARGE if the
 * rounded result exceeds MAX_AMOUNT_PAISE.
 */
export function computeAmountPaise(quantityMilli: number, ratePaise: number): number {
  if (!Number.isSafeInteger(quantityMilli) || quantityMilli < 0) {
    throw new RangeError('quantityMilli must be a non-negative safe integer')
  }
  if (!Number.isSafeInteger(ratePaise) || ratePaise < 0) {
    throw new RangeError('ratePaise must be a non-negative safe integer')
  }
  // Non-negative operands, so adding half the divisor then truncating is half-up.
  const amount = (BigInt(quantityMilli) * BigInt(ratePaise) + 500n) / 1000n
  if (amount > BigInt(MAX_AMOUNT_PAISE)) throw new BoqNumberError('AMOUNT_TOO_LARGE')
  return Number(amount)
}

/** Stored paise → rupees for the wire (exact for values within the caps). */
export function paiseToRupees(paise: number): number {
  return paise / PAISE_PER_RUPEE
}

/** Stored milli-units → quantity for the wire. */
export function milliToQuantity(milli: number): number {
  return milli / MILLI_PER_UNIT
}
