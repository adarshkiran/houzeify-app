// ─── Profile DTOs — 12G-B ───────────────────────────────────────────────────
// Serialization only: DB rows (Date objects, snake_case-derived camelCase
// via Drizzle) -> plain JSON-safe DTOs (ISO date strings). No field here is
// database-internal-only — everything on both rows is meant to be visible
// to the profile's own owner, unlike auth's session/OTP internals.

import type { CustomerProfileRow, PartnerProfileRow } from '../db/schema.js'

export function serializeCustomerProfile(row: CustomerProfileRow) {
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    preferredName: row.preferredName,
    email: row.email,
    location: row.location,
    language: row.language,
    unitPreference: row.unitPreference,
    currencyPreference: row.currencyPreference,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function serializePartnerProfile(row: PartnerProfileRow) {
  return {
    id: row.id,
    userId: row.userId,
    professionalType: row.professionalType,
    professionalTypeOther: row.professionalTypeOther,
    specialization: row.specialization,
    fullName: row.fullName,
    displayName: row.displayName,
    about: row.about,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    yearsOfExperience: row.yearsOfExperience,
    languages: row.languages,
    accountType: row.accountType,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
