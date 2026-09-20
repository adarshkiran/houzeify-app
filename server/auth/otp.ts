// ─── OTP generation, hashing, verification — pure crypto, no DB/IO here ────
// Security model: challenge expiration + attempt limits + rate limiting +
// secure generation + hashed storage — NOT password-grade hashing. A short
// numeric OTP has only 1e6 possibilities, so its hash is salted with scrypt
// (Node's built-in, no new dependency) specifically to slow down offline
// guessing if the otp_challenges table were ever exfiltrated; the OTP
// itself still becomes unusable after OTP_EXPIRES_MINUTES or
// OTP_MAX_ATTEMPTS regardless.
//
// NEVER log the plaintext OTP. NEVER return it from an API response. Only
// server/auth/providers/* ever see the plaintext value, to hand it to an
// SMS provider (or, in development only, a clearly-marked log line).

import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'

export const OTP_LENGTH = 6
const SCRYPT_KEYLEN = 32
const SCRYPT_SALT_BYTES = 16

/** Cryptographically secure 6-digit numeric string (zero-padded), using
 *  Node's CSPRNG-backed randomInt — not Math.random(). */
export function generateOtp(): string {
  const value = randomInt(0, 10 ** OTP_LENGTH)
  return value.toString().padStart(OTP_LENGTH, '0')
}

export function isValidOtpFormat(value: unknown): value is string {
  return typeof value === 'string' && /^\d{6}$/.test(value)
}

/** Returns `<saltHex>:<derivedHex>` — never the plaintext OTP. */
export function hashOtp(otp: string): string {
  const salt = randomBytes(SCRYPT_SALT_BYTES)
  const derived = scryptSync(otp, salt, SCRYPT_KEYLEN)
  return `${salt.toString('hex')}:${derived.toString('hex')}`
}

/** Constant-time comparison against a hash produced by hashOtp(). Returns
 *  false (never throws) for a malformed stored hash. */
export function verifyOtp(otp: string, storedHash: string): boolean {
  const [saltHex, derivedHex] = storedHash.split(':')
  if (!saltHex || !derivedHex) return false

  try {
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(derivedHex, 'hex')
    const actual = scryptSync(otp, salt, expected.length)
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
