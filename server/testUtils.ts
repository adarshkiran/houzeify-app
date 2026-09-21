// ─── Shared test helpers — 12G-B ────────────────────────────────────────────
// NOT a *.test.ts file itself (so `server:test`'s glob never tries to run
// it directly) — imported by the real DB-backed integration tests in
// server/profiles/*.test.ts and server/organizations/*.test.ts.
//
// Test users/sessions are created by inserting rows directly (bypassing the
// real OTP flow entirely) using the exact same exported primitives
// auth.service.ts itself uses (generateSessionToken/hashSessionToken) — this
// is not a parallel auth mechanism, just a shortcut around SMS delivery for
// test setup. Phone numbers live in a reserved test range
// (+9199000000XXXXX) that never collides with real/manual test numbers used
// elsewhere in this project.

import { randomInt, randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { generateSessionToken, hashSessionToken } from './auth/session.js'
import { loadEnv, type Env } from './config/env.js'
import { getDb } from './db/client.js'
import { organizations, projectCustomers, sessions, users, type UserRow } from './db/schema.js'

/** Returns a usable Env only when DATABASE_URL is actually configured —
 *  every DB-backed test in this phase calls this first and skips cleanly
 *  (never fakes a pass) when it returns null. */
export function loadTestEnv(): Env | null {
  const env = loadEnv()
  return env.DATABASE_URL ? env : null
}

/** A fresh, guaranteed-unique test phone number — reserved +9199000... range. */
function testPhoneNumber(): string {
  return `+9199000${randomInt(0, 1_000_000).toString().padStart(6, '0')}`
}

export async function createTestUser(env: Env): Promise<UserRow> {
  const db = getDb(env)
  const phone = testPhoneNumber()
  const created = await db
    .insert(users)
    .values({ phoneNumber: phone, phoneNumberNormalized: phone, phoneVerifiedAt: new Date() })
    .returning()
  return created[0]
}

/** Creates a real session row (hashed token, matching auth/session.ts
 *  exactly) and returns the raw token to send as the session cookie. */
export async function createTestSessionToken(env: Env, userId: string): Promise<string> {
  const db = getDb(env)
  const token = generateSessionToken()
  const tokenHash = hashSessionToken(token)
  await db.insert(sessions).values({ userId, tokenHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) })
  return token
}

export function sessionCookieHeader(token: string): string {
  return `houzeify_session=${token}`
}

/** Cleans up a test user and everything that depends on it. Organizations
 *  the user OWNS must be deleted first — organizations.owner_id is
 *  ON DELETE RESTRICT by design (see schema.ts), so deleting the user
 *  before their owned organizations would fail, not cascade. Everything
 *  else (sessions, customer_profiles, partner_profiles, memberships in
 *  other people's organizations) cascades from the user delete itself.
 *  project_customers.invited_by is ON DELETE RESTRICT (Module 08), so links
 *  this user created are removed first. */
export async function cleanupTestUser(env: Env, userId: string): Promise<void> {
  const db = getDb(env)
  await db.delete(projectCustomers).where(eq(projectCustomers.invitedBy, userId))
  await db.delete(organizations).where(eq(organizations.ownerId, userId))
  await db.delete(users).where(eq(users.id, userId))
}

export function uniqueName(prefix: string): string {
  return `${prefix} ${randomUUID().slice(0, 8)}`
}
