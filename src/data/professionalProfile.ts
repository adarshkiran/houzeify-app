// ─── Individual Professional Profile — typed data model + service ──────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "save professional profile" API replaces; the screen must
// only ever read/write this data through the functions here, never inline.
//
// WHY THIS IS A NEW MODEL (not a duplicate): no ProfessionalProfile/User
// model exists anywhere in this codebase yet. The closest existing models —
// homeownerProfile.ts's HomeownerProfile and companyInformation.ts's
// CompanyInformation — are both explicitly scoped elsewhere (homeowner
// account profile; a homeowner-organization's company identity). Neither
// fits an INDIVIDUAL professional (a sole contractor/architect/etc. with no
// organization). This is that missing piece — attached to the user, never a
// second "IndividualProfile"/"ProfessionalProfileSetup" model layered on
// top of it.
//
// ORGANIZATION professionals do NOT use this model — Screen 019 routes them
// straight into the existing companyInformation.ts flow instead (see
// accountType.ts's nextScreenForAccountType), since that already collects
// the exact same basic-identity information for a company. This file's
// screen (020) still renders an organization-shaped variant of its form for
// direct/dev access, but reuses companyInformation.ts's own save function
// for that branch rather than duplicating it here.

import type { YearsInBusiness } from './serviceCategories'

export interface ProfessionalProfile {
  id: string
  userId: string
  fullName: string
  /** The name homeowners see — defaults to fullName when left blank. */
  displayName: string
  profileImage: string | null
  about: string
  contactEmail: string
  contactPhone: string
  /** Partner UX Architecture — item 11's core-profile fields that were
   *  missing for an INDIVIDUAL professional (an organization already gets
   *  the equivalent via serviceCategories.ts's OrganizationServiceProfile.
   *  yearsInBusiness). Reuses that same YearsInBusiness type/options/labels
   *  rather than a second, duplicate "years" enum for individuals. */
  yearsOfExperience: YearsInBusiness | null
  languages: string[] | null
  /** Always null here — set only for organization accounts, which use
   *  companyInformation.ts's own organizationId instead of this model. */
  organizationId: string | null
  createdAt: string
  updatedAt: string
}

export const ABOUT_MIN = 20
export const ABOUT_MAX = 300

export interface ProfileFormErrors {
  fullName?: string
  about?: string
}

export interface ProfessionalProfileFormValues {
  fullName: string
  displayName: string
  about: string
}

export function validateProfessionalProfileForm(values: ProfessionalProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {}
  if (values.fullName.trim().length === 0) errors.fullName = 'Full name is required.'
  const aboutLen = values.about.trim().length
  if (aboutLen > 0 && (aboutLen < ABOUT_MIN || aboutLen > ABOUT_MAX)) {
    errors.about = `About should be between ${ABOUT_MIN}–${ABOUT_MAX} characters.`
  }
  return errors
}

export function isProfessionalProfileFormValid(values: ProfessionalProfileFormValues): boolean {
  return values.fullName.trim().length > 0 && Object.keys(validateProfessionalProfileForm(values)).length === 0
}

// ─── Profile photo upload — mirrors homeownerProfile.ts's validateAvatarFile
// rules exactly (JPG/PNG, 5 MB) rather than redefining them. ────────────────

export function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export interface UploadedPhotoResult {
  url: string
  fileName: string
  fileSize: number
}

/** The photo upload service — mirrors serviceRequest.ts's
 *  uploadServicePhoto() pattern (validate → read as data URL). The screen
 *  must validate with homeownerProfile.ts's validateAvatarFile() first. */
export function uploadProfilePhoto(file: File): Promise<UploadedPhotoResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ url: String(reader.result), fileName: file.name, fileSize: file.size })
    reader.onerror = () => reject(new Error("Couldn't upload the image."))
    reader.readAsDataURL(file)
  })
}

// ─── Save ──────────────────────────────────────────────────────────────────

export interface SaveProfessionalProfileInput {
  userId: string
  fullName: string
  displayName: string
  profileImage: string | null
  about: string
  contactEmail: string
  contactPhone: string
  yearsOfExperience: YearsInBusiness | null
  languages: string[] | null
}

let counter = 0
function nextId(): string {
  counter += 1
  return `professional-profile-${Date.now()}-${counter}`
}

// In-memory store — one profile per userId, mirrors the established
// single-record-per-user pattern (e.g. homeownerProfile.ts's singleton).
const profilesByUser = new Map<string, ProfessionalProfile>()

/** Creates or updates the individual professional's profile — the seam a
 *  real "save professional profile" API call replaces. Re-saving (e.g. the
 *  homeowner navigates Back then Continue again) updates the SAME record
 *  rather than creating a second one. */
export function saveProfessionalProfile(input: SaveProfessionalProfileInput): ProfessionalProfile {
  const now = new Date().toISOString()
  const existing = profilesByUser.get(input.userId)
  const record: ProfessionalProfile = {
    id: existing?.id ?? nextId(),
    userId: input.userId,
    fullName: input.fullName.trim(),
    displayName: input.displayName.trim(),
    profileImage: input.profileImage,
    about: input.about.trim(),
    contactEmail: input.contactEmail.trim(),
    contactPhone: input.contactPhone.trim(),
    yearsOfExperience: input.yearsOfExperience,
    languages: input.languages,
    organizationId: null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  profilesByUser.set(input.userId, record)
  return record
}

export function getProfessionalProfile(userId: string): ProfessionalProfile | undefined {
  return profilesByUser.get(userId)
}
