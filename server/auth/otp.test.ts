import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateOtp, hashOtp, isValidOtpFormat, verifyOtp } from './otp.js'

test('generateOtp: always returns a 6-digit numeric string', () => {
  for (let i = 0; i < 200; i++) {
    const otp = generateOtp()
    assert.match(otp, /^\d{6}$/)
  }
})

test('generateOtp: is not obviously predictable (200 draws produce many distinct values)', () => {
  const values = new Set(Array.from({ length: 200 }, () => generateOtp()))
  // Birthday-paradox collisions are expected among 1e6 possibilities over
  // 200 draws — this only guards against a broken generator returning a
  // constant or near-constant value.
  assert.ok(values.size > 150, `expected high cardinality, got ${values.size} distinct values`)
})

test('isValidOtpFormat: accepts exactly 6 digits', () => {
  assert.equal(isValidOtpFormat('123456'), true)
})

test('isValidOtpFormat: rejects wrong length, non-digits, non-strings', () => {
  assert.equal(isValidOtpFormat('12345'), false)
  assert.equal(isValidOtpFormat('1234567'), false)
  assert.equal(isValidOtpFormat('12a456'), false)
  assert.equal(isValidOtpFormat(123456), false)
  assert.equal(isValidOtpFormat(undefined), false)
})

test('hashOtp/verifyOtp: correct OTP verifies against its own hash', () => {
  const otp = '482913'
  const hash = hashOtp(otp)
  assert.equal(verifyOtp(otp, hash), true)
})

test('hashOtp/verifyOtp: wrong OTP fails verification', () => {
  const hash = hashOtp('482913')
  assert.equal(verifyOtp('482914', hash), false)
})

test('hashOtp: never stores the plaintext OTP in the hash output', () => {
  const otp = '482913'
  const hash = hashOtp(otp)
  assert.equal(hash.includes(otp), false)
})

test('hashOtp: two hashes of the same OTP differ (random salt per challenge)', () => {
  const otp = '482913'
  assert.notEqual(hashOtp(otp), hashOtp(otp))
})

test('verifyOtp: malformed stored hash fails closed rather than throwing', () => {
  assert.equal(verifyOtp('123456', 'not-a-real-hash'), false)
  assert.equal(verifyOtp('123456', ''), false)
})
