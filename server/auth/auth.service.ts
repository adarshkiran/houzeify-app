// ─── Auth business logic — OTP request/verify, user find-or-create ────────
// Route handlers (auth.routes.ts) stay thin; this is where the actual flow
// lives: cooldown -> generate -> hash -> store challenge -> deliver (all
// outside a DB transaction, since SMS delivery is external) and
// verify -> consume -> find-or-create user -> create session (all inside
// one DB transaction, so a failure partway through never leaves a
// partially-authenticated state).

import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { otpChallenges, users, sessions, type UserRow } from '../db/schema.js'
import { normalizePhoneNumber } from './phone.js'
import { generateOtp, hashOtp, isValidOtpFormat, verifyOtp } from './otp.js'
import { generateSessionToken, hashSessionToken, sessionExpiryDate } from './session.js'
import type { OtpProvider } from './providers/otpProvider.js'
import type { AuthenticatedUser } from './auth.types.js'

export class AuthError extends Error {
  readonly statusCode: number
  readonly code: string
  constructor(code: string, message: string, statusCode = 400) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.statusCode = statusCode
  }
}

// One generic message for every OTP-verification failure reason (missing
// challenge, expired, attempts exceeded, wrong code) — deliberately
// indistinguishable to the caller, so a response never hints at *why* a
// code failed.
const OTP_INVALID_MESSAGE = 'That code is invalid or has expired.'

function toAuthenticatedUser(user: UserRow): AuthenticatedUser {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    phoneVerifiedAt: user.phoneVerifiedAt,
    createdAt: user.createdAt,
  }
}

/** Requests a new OTP for `phoneRaw`. Never reveals whether the phone
 *  number belongs to an existing user (this function creates users, it
 *  doesn't need to know) and never returns the OTP itself. */
export async function requestOtp(env: Env, provider: OtpProvider, phoneRaw: unknown): Promise<void> {
  const phone = normalizePhoneNumber(phoneRaw)
  const db = getDb(env)

  const cooldownStart = new Date(Date.now() - env.OTP_REQUEST_COOLDOWN_SECONDS * 1000)
  const recentChallenges = await db
    .select({ id: otpChallenges.id })
    .from(otpChallenges)
    .where(and(eq(otpChallenges.phoneNumberNormalized, phone), gt(otpChallenges.createdAt, cooldownStart)))
    .orderBy(desc(otpChallenges.createdAt))
    .limit(1)

  if (recentChallenges.length > 0) {
    throw new AuthError('OTP_COOLDOWN', 'Please wait before requesting another code.', 429)
  }

  const otp = generateOtp()
  const otpHash = hashOtp(otp)
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000)

  await db.insert(otpChallenges).values({
    phoneNumberNormalized: phone,
    otpHash,
    expiresAt,
    maxAttempts: env.OTP_MAX_ATTEMPTS,
  })

  // SMS delivery is external and deliberately outside any DB transaction —
  // the challenge already exists in the database; on delivery failure we
  // do not retry and do not delete the challenge (it simply expires on
  // its own), and we never claim success to the caller.
  await provider.sendOtp(phone, otp)
}

/** Verifies `otpRaw` for `phoneRaw`. On success: consumes the challenge,
 *  finds or creates the user, creates a session — atomically. Returns the
 *  authenticated user and the raw session token (caller sets the cookie;
 *  this function never touches HTTP concerns). */
export async function verifyOtpAndCreateSession(
  env: Env,
  phoneRaw: unknown,
  otpRaw: unknown,
): Promise<{ user: AuthenticatedUser; token: string }> {
  if (!isValidOtpFormat(otpRaw)) {
    throw new AuthError('OTP_INVALID', OTP_INVALID_MESSAGE, 400)
  }
  const phone = normalizePhoneNumber(phoneRaw)
  const db = getDb(env)

  const activeChallenges = await db
    .select()
    .from(otpChallenges)
    .where(and(eq(otpChallenges.phoneNumberNormalized, phone), isNull(otpChallenges.consumedAt)))
    .orderBy(desc(otpChallenges.createdAt))
    .limit(1)

  const challenge = activeChallenges[0]
  if (!challenge || challenge.expiresAt.getTime() <= Date.now() || challenge.attempts >= challenge.maxAttempts) {
    throw new AuthError('OTP_INVALID', OTP_INVALID_MESSAGE, 400)
  }

  if (!verifyOtp(otpRaw, challenge.otpHash)) {
    await db
      .update(otpChallenges)
      .set({ attempts: challenge.attempts + 1 })
      .where(eq(otpChallenges.id, challenge.id))
    throw new AuthError('OTP_INVALID', OTP_INVALID_MESSAGE, 400)
  }

  const result = await db.transaction(async tx => {
    await tx.update(otpChallenges).set({ consumedAt: new Date() }).where(eq(otpChallenges.id, challenge.id))

    const existingRows = await tx.select().from(users).where(eq(users.phoneNumberNormalized, phone)).limit(1)
    const existingUser = existingRows[0]

    let user: UserRow
    if (!existingUser) {
      const created = await tx
        .insert(users)
        .values({ phoneNumber: String(phoneRaw), phoneNumberNormalized: phone, phoneVerifiedAt: new Date() })
        .returning()
      user = created[0]
    } else if (!existingUser.phoneVerifiedAt) {
      const updated = await tx
        .update(users)
        .set({ phoneVerifiedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, existingUser.id))
        .returning()
      user = updated[0]
    } else {
      user = existingUser
    }

    const token = generateSessionToken()
    const tokenHash = hashSessionToken(token)
    await tx.insert(sessions).values({ userId: user.id, tokenHash, expiresAt: sessionExpiryDate(env) })

    return { user, token }
  })

  return { user: toAuthenticatedUser(result.user), token: result.token }
}
