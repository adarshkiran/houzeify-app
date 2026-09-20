// ─── Opaque session tokens, hashed storage, HTTP-only cookie, requireAuth ──
// Flow: random token -> sha256(token) -> store hash in DB; raw token only
// ever lives in the client's secure cookie. The raw token is NEVER stored,
// returned in JSON, or logged.
//
// sha256 (fast hash) is intentional here, unlike otp.ts's scrypt: the
// session token itself already carries 256 bits of CSPRNG entropy, so
// there is nothing for a slow KDF to protect against that the token's own
// entropy doesn't already — this mirrors how most opaque-session-token
// systems hash their tokens.

import { createHash, randomBytes } from 'node:crypto'
import { and, eq, gt, isNull } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { sessions, users } from '../db/schema.js'
import type { AuthenticatedUser } from './auth.types.js'

export const SESSION_COOKIE_NAME = 'houzeify_session'
const SESSION_TOKEN_BYTES = 32

export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString('base64url')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** Session lifetime from creation — see auth.service.ts, where a session
 *  row is inserted using this same expiry inside the OTP-verification
 *  transaction. No automatic renewal in 12E. */
export function sessionExpiryDate(env: Pick<Env, 'SESSION_EXPIRES_DAYS'>): Date {
  return new Date(Date.now() + env.SESSION_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
}

/** Resolves the authenticated user for a raw cookie token, or null when the
 *  token is missing, unknown, revoked, or expired. Revoked/expired
 *  sessions never authenticate — enforced directly in the WHERE clause,
 *  not as a separate application-code check that could be forgotten. */
export async function resolveSessionUser(env: Env, token: string): Promise<AuthenticatedUser | null> {
  const db = getDb(env)
  const tokenHash = hashSessionToken(token)
  const now = new Date()

  const rows = await db
    .select({ user: users, sessionId: sessions.id })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt), gt(sessions.expiresAt, now)))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  // Best-effort last_used_at refresh — never extends expiresAt. Failure
  // here must never fail the request that is already authenticated.
  db.update(sessions)
    .set({ lastUsedAt: now })
    .where(eq(sessions.id, row.sessionId))
    .catch(() => {})

  return {
    id: row.user.id,
    phoneNumber: row.user.phoneNumber,
    phoneVerifiedAt: row.user.phoneVerifiedAt,
    createdAt: row.user.createdAt,
  }
}

/** Revokes the session matching a raw cookie token, if any. A no-op (not
 *  an error) when the token is unknown or already revoked — logout must
 *  stay idempotent and must never reveal session validity to the caller. */
export async function revokeSessionByToken(env: Env, token: string): Promise<void> {
  const db = getDb(env)
  const tokenHash = hashSessionToken(token)
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)))
}

function sessionCookieOptions(env: Pick<Env, 'NODE_ENV' | 'SESSION_EXPIRES_DAYS'>) {
  return {
    httpOnly: true,
    // Secure must stay true in production; local HTTP-only development is
    // the one deliberate exception (see 12E ticket, "COOKIE SECURITY").
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: env.SESSION_EXPIRES_DAYS * 24 * 60 * 60,
  }
}

export function setSessionCookie(reply: FastifyReply, env: Env, token: string): void {
  reply.setCookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(env))
}

export function clearSessionCookie(reply: FastifyReply, env: Env): void {
  reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' })
}

/** Fastify preHandler factory: reads the session cookie, validates it,
 *  attaches the authenticated user to the request, or replies 401. This is
 *  authentication only ("who is this?") — no role/authorization check. */
export function createRequireAuth(env: Env) {
  return async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const token = request.cookies[SESSION_COOKIE_NAME]
    if (!token) {
      reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } })
      return
    }

    const user = await resolveSessionUser(env, token)
    if (!user) {
      reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } })
      return
    }

    request.user = user
  }
}
