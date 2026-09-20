// ─── Customer profile business logic — 12G-B ───────────────────────────────
// Ownership is never taken from the request body — every function here
// takes userId as an explicit parameter, and every route (customerProfile
// .routes.ts) passes request.user.id, never a client-supplied value.

import { eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { customerProfiles, type CustomerProfileRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface CustomerProfileInput {
  fullName: string
  preferredName?: string
  email?: string
  location?: string
  language?: string
  unitPreference?: string
  currencyPreference?: string
}

function validateEmail(email: string | undefined): void {
  if (email !== undefined && !EMAIL_PATTERN.test(email)) {
    throw new HttpError('INVALID_EMAIL', 'Please enter a valid email address.', 400)
  }
}

export async function getCustomerProfile(env: Env, userId: string): Promise<CustomerProfileRow> {
  const db = getDb(env)
  const rows = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1)
  const profile = rows[0]
  if (!profile) {
    throw new HttpError('NOT_FOUND', 'No customer profile exists yet.', 404)
  }
  return profile
}

export async function createCustomerProfile(env: Env, userId: string, input: CustomerProfileInput): Promise<CustomerProfileRow> {
  validateEmail(input.email)
  const db = getDb(env)

  const existing = await db.select({ id: customerProfiles.id }).from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1)
  if (existing.length > 0) {
    throw new HttpError('CUSTOMER_PROFILE_EXISTS', 'A customer profile already exists for this account.', 409)
  }

  const created = await db
    .insert(customerProfiles)
    .values({
      userId,
      fullName: input.fullName.trim(),
      preferredName: input.preferredName?.trim() || null,
      email: input.email?.trim() || null,
      location: input.location?.trim() || null,
      language: input.language?.trim() || null,
      unitPreference: input.unitPreference ?? null,
      currencyPreference: input.currencyPreference ?? null,
    })
    .returning()

  return created[0]
}

export async function updateCustomerProfile(env: Env, userId: string, patch: Partial<CustomerProfileInput>): Promise<CustomerProfileRow> {
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }
  validateEmail(patch.email)
  const db = getDb(env)

  const existing = await db.select({ id: customerProfiles.id }).from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1)
  if (existing.length === 0) {
    throw new HttpError('NOT_FOUND', 'No customer profile exists yet.', 404)
  }

  const values: Partial<typeof customerProfiles.$inferInsert> = { updatedAt: new Date() }
  if (patch.fullName !== undefined) values.fullName = patch.fullName.trim()
  if (patch.preferredName !== undefined) values.preferredName = patch.preferredName.trim() || null
  if (patch.email !== undefined) values.email = patch.email.trim() || null
  if (patch.location !== undefined) values.location = patch.location.trim() || null
  if (patch.language !== undefined) values.language = patch.language.trim() || null
  if (patch.unitPreference !== undefined) values.unitPreference = patch.unitPreference
  if (patch.currencyPreference !== undefined) values.currencyPreference = patch.currencyPreference

  const updated = await db.update(customerProfiles).set(values).where(eq(customerProfiles.userId, userId)).returning()
  return updated[0]
}
