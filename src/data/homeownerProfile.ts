// ─── Homeowner Profile — typed data model + service ─────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real account-profile API replaces; the screen must only ever read
// or update the profile through the functions here, never inline in the
// component.
//
// UX PRINCIPLE: Profile is account information ("who I am") — it must stay
// separate from project-specific information ("what I am building"), which
// belongs to the project itself and is never made editable from here.

export type HomeownerRole = 'homeowner'
export type UnitPreference = 'sq ft' | 'sq m'
export type Currency = 'INR'

export interface HomeownerProfile {
  id: string
  userId: string
  fullName: string
  preferredName: string
  email: string
  emailVerified: boolean
  mobile: string
  mobileVerified: boolean
  avatarUrl: string | null
  role: HomeownerRole
  location: string
  language: string
  unitPreference: UnitPreference
  currency: Currency
  notificationsEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectSummary {
  label: string
  location: string
  approximateArea: string
  floors: string
  stage: string
}

export interface EditableProfileFields {
  fullName: string
  preferredName: string
  location: string
  language: string
}

// ─── Demo profile ────────────────────────────────────────────────────────
// Reuses the app's existing established demo persona — same "AK" initials
// shown in the dashboard header avatar, and the same +91 98765 43210
// mobile number used throughout the login/OTP/create-account flow.

export const homeownerProfile: HomeownerProfile = {
  id: 'profile-001',
  userId: 'user-demo-001',
  fullName: 'Adarsh Kiran',
  preferredName: 'Adarsh',
  email: 'adarsh@example.com',
  emailVerified: true,
  mobile: '+91 98765 43210',
  mobileVerified: true,
  avatarUrl: null,
  role: 'homeowner',
  location: 'Hyderabad',
  language: 'English',
  unitPreference: 'sq ft',
  currency: 'INR',
  notificationsEnabled: true,
  createdAt: '2026-08-05',
  updatedAt: '2026-08-05',
}

export const currentProjectSummary: ProjectSummary = {
  label: '3 BHK Independent House',
  location: 'Hyderabad',
  approximateArea: '2,600 sq ft',
  floors: 'G+1',
  stage: 'Planning',
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ─── First/last name helpers ──────────────────────────────────────────────
// The stored identity field remains the single `fullName` string (never
// duplicated into separate persisted firstName/lastName fields) — these are
// pure display/edit helpers so a screen can offer First name + Last name
// inputs while still reading and writing the same underlying field.

export interface SplitName {
  firstName: string
  lastName: string
}

export function splitName(fullName: string): SplitName {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function joinName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
}

export function formatMemberSince(createdAt: string): string {
  const d = new Date(createdAt)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const MAX_AVATAR_SIZE_MB = 5
const SUPPORTED_AVATAR_TYPES = ['image/jpeg', 'image/png']

export interface AvatarValidationResult {
  valid: boolean
  error?: string
}

/** The avatar validation service — the screen checks a chosen file only
 *  through this function, never inline. */
export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!SUPPORTED_AVATAR_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please choose a JPG or PNG image.' }
  }
  if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Image must be smaller than ${MAX_AVATAR_SIZE_MB} MB.` }
  }
  return { valid: true }
}

/** Applies edited personal-detail fields onto a profile — the seam a real
 *  "update profile" API call replaces. Never touches email/mobile/role,
 *  which are read-only from this screen by design. */
export function applyProfileEdits(profile: HomeownerProfile, edits: EditableProfileFields): HomeownerProfile {
  return {
    ...profile,
    fullName: edits.fullName.trim(),
    preferredName: edits.preferredName.trim(),
    location: edits.location.trim(),
    language: edits.language.trim(),
    updatedAt: new Date().toISOString(),
  }
}
