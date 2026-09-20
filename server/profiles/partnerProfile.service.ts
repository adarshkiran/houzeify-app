// ─── Partner profile business logic — 12G-B ────────────────────────────────
// Ownership always comes from an explicit userId parameter, supplied by the
// route from request.user.id — never from the request body.

import { eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { partnerProfiles, type PartnerProfileRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface PartnerProfileInput {
  professionalType: string
  professionalTypeOther?: string
  specialization?: string
  fullName: string
  displayName?: string
  about?: string
  contactEmail?: string
  contactPhone?: string
  yearsOfExperience?: string
  languages?: string[]
  accountType: string
}

function validateEmail(email: string | undefined): void {
  if (email !== undefined && !EMAIL_PATTERN.test(email)) {
    throw new HttpError('INVALID_EMAIL', 'Please enter a valid email address.', 400)
  }
}

export async function getPartnerProfile(env: Env, userId: string): Promise<PartnerProfileRow> {
  const db = getDb(env)
  const rows = await db.select().from(partnerProfiles).where(eq(partnerProfiles.userId, userId)).limit(1)
  const profile = rows[0]
  if (!profile) {
    throw new HttpError('NOT_FOUND', 'No partner profile exists yet.', 404)
  }
  return profile
}

export async function createPartnerProfile(env: Env, userId: string, input: PartnerProfileInput): Promise<PartnerProfileRow> {
  validateEmail(input.contactEmail)
  const db = getDb(env)

  const existing = await db.select({ id: partnerProfiles.id }).from(partnerProfiles).where(eq(partnerProfiles.userId, userId)).limit(1)
  if (existing.length > 0) {
    throw new HttpError('PARTNER_PROFILE_EXISTS', 'A partner profile already exists for this account.', 409)
  }

  const created = await db
    .insert(partnerProfiles)
    .values({
      userId,
      professionalType: input.professionalType,
      professionalTypeOther: input.professionalTypeOther?.trim() || null,
      specialization: input.specialization ?? null,
      fullName: input.fullName.trim(),
      displayName: input.displayName?.trim() || input.fullName.trim(),
      about: input.about?.trim() || null,
      contactEmail: input.contactEmail?.trim() || null,
      contactPhone: input.contactPhone?.trim() || null,
      yearsOfExperience: input.yearsOfExperience ?? null,
      languages: input.languages ?? null,
      accountType: input.accountType,
    })
    .returning()

  return created[0]
}

export async function updatePartnerProfile(env: Env, userId: string, patch: Partial<PartnerProfileInput>): Promise<PartnerProfileRow> {
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }
  validateEmail(patch.contactEmail)
  const db = getDb(env)

  const existing = await db.select({ id: partnerProfiles.id }).from(partnerProfiles).where(eq(partnerProfiles.userId, userId)).limit(1)
  if (existing.length === 0) {
    throw new HttpError('NOT_FOUND', 'No partner profile exists yet.', 404)
  }

  const values: Partial<typeof partnerProfiles.$inferInsert> = { updatedAt: new Date() }
  if (patch.professionalType !== undefined) values.professionalType = patch.professionalType
  if (patch.professionalTypeOther !== undefined) values.professionalTypeOther = patch.professionalTypeOther.trim() || null
  if (patch.specialization !== undefined) values.specialization = patch.specialization || null
  if (patch.fullName !== undefined) values.fullName = patch.fullName.trim()
  if (patch.displayName !== undefined) values.displayName = patch.displayName.trim() || null
  if (patch.about !== undefined) values.about = patch.about.trim() || null
  if (patch.contactEmail !== undefined) values.contactEmail = patch.contactEmail.trim() || null
  if (patch.contactPhone !== undefined) values.contactPhone = patch.contactPhone.trim() || null
  if (patch.yearsOfExperience !== undefined) values.yearsOfExperience = patch.yearsOfExperience
  if (patch.languages !== undefined) values.languages = patch.languages
  if (patch.accountType !== undefined) values.accountType = patch.accountType

  const updated = await db.update(partnerProfiles).set(values).where(eq(partnerProfiles.userId, userId)).returning()
  return updated[0]
}
