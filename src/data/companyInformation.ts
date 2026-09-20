// ─── Company Information — typed data model + service ──────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "save company information" API replaces; the screen must only
// ever read/write this data through the functions here, never inline in a
// component.
//
// ORGANIZATION RELATIONSHIP — keep these entities separate, never merge them:
//   USER                 Raja Shaker Reddy — the human account
//   ROLE                 Homeowner (this screen's original path) or
//                        Professional (Screen 022 reuses this SAME screen —
//                        see CompanyInformationScreen's role-aware
//                        rendering) — set earlier in onboarding, unaffected
//   ACCOUNT TYPE         Organization — decided on the account-type screen
//   ORGANIZATION         Mantoor Developers — the shared workspace, created
//                        on the create-organization screen
//   MEMBERSHIP           Owner — the user's relationship to the
//                        organization
//   COMPANY INFORMATION  business identity + contact information — this
//                        screen, never merged into the user's profile
//   PROJECT              an individual construction project — created
//                        later, never here

import type { ProfessionalType } from './professionalType'

export type CompanyType = 'developer' | 'construction-company' | 'real-estate-company' | 'property-developer' | 'builder' | 'other'

export interface CompanyInformation {
  id: string
  organizationId: string
  companyName: string
  companyOwnerId: string
  companyOwnerName: string
  companyType: CompanyType
  logoUrl: string | null
  description: string
  businessLocation: string
  phone: string
  email: string
  website: string | null
  /** Optional — a 4-digit year, never in the future. */
  yearEstablished: string | null
  createdAt: string
  updatedAt: string
}

export const COMPANY_TYPE_OPTIONS: CompanyType[] = [
  'developer', 'construction-company', 'real-estate-company', 'property-developer', 'builder', 'other',
]

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  developer: 'Developer',
  'construction-company': 'Construction Company',
  'real-estate-company': 'Real Estate Company',
  'property-developer': 'Property Developer',
  builder: 'Builder',
  other: 'Other',
}

// ─── Validation ──────────────────────────────────────────────────────────

const NAME_MAX = 120
const DESCRIPTION_MAX = 500
const CONTACT_NAME_MIN = 2
const CURRENT_YEAR = new Date().getFullYear()

export interface CompanyFormValues {
  companyName: string
  companyOwnerName: string
  companyType: CompanyType | null
  businessLocation: string
  phone: string
  email: string
  website: string
  yearEstablished: string
  description: string
}

export interface CompanyFormErrors {
  companyName?: string
  companyOwnerName?: string
  businessLocation?: string
  phone?: string
  email?: string
  website?: string
  yearEstablished?: string
  description?: string
}

export function validateCompanyForm(values: CompanyFormValues): CompanyFormErrors {
  const errors: CompanyFormErrors = {}
  const name = values.companyName.trim()
  if (name.length === 0) errors.companyName = 'Company name is required.'
  else if (name.length > NAME_MAX) errors.companyName = `Company name must be under ${NAME_MAX} characters.`

  const owner = values.companyOwnerName.trim()
  if (owner.length === 0) errors.companyOwnerName = 'Company owner / primary contact is required.'
  else if (owner.length < CONTACT_NAME_MIN) errors.companyOwnerName = `Primary contact must be at least ${CONTACT_NAME_MIN} characters.`

  if (values.businessLocation.trim().length === 0) errors.businessLocation = 'Company location is required.'

  if (values.phone.trim().length === 0) errors.phone = 'Business phone is required.'

  const email = values.email.trim()
  if (email.length === 0) errors.email = 'Business email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.'

  const website = values.website.trim()
  if (website.length > 0 && !isValidWebsite(website)) errors.website = 'Please enter a valid website URL.'

  const year = values.yearEstablished.trim()
  if (year.length > 0) {
    const parsed = Number(year)
    if (!/^\d{4}$/.test(year) || Number.isNaN(parsed)) errors.yearEstablished = 'Enter a valid 4-digit year.'
    else if (parsed > CURRENT_YEAR) errors.yearEstablished = 'Year established cannot be in the future.'
  }

  if (values.description.length > DESCRIPTION_MAX) errors.description = `Description must be under ${DESCRIPTION_MAX} characters.`

  return errors
}

export function isValidWebsite(url: string): boolean {
  const candidate = /^https?:\/\//i.test(url) ? url : `https://${url}`
  try {
    const parsed = new URL(candidate)
    return /\.[a-z]{2,}$/i.test(parsed.hostname)
  } catch {
    return false
  }
}

export function isCompanyFormValid(values: CompanyFormValues): boolean {
  return values.companyName.trim().length > 0
    && values.companyName.trim().length <= NAME_MAX
    && values.companyOwnerName.trim().length >= CONTACT_NAME_MIN
    && values.companyType !== null
    && values.businessLocation.trim().length > 0
    && values.phone.trim().length > 0
    && values.email.trim().length > 0
    && Object.keys(validateCompanyForm(values)).length === 0
}

// ─── Logo upload ─────────────────────────────────────────────────────────

const MAX_LOGO_SIZE_MB = 5
const SUPPORTED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

export interface LogoValidationResult {
  valid: boolean
  error?: string
}

/** The logo validation service — the screen checks a chosen file only
 *  through this function, never inline. Logo is always optional. */
export function validateCompanyLogoFile(file: File): LogoValidationResult {
  if (!SUPPORTED_LOGO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please choose a PNG, JPG or SVG image.' }
  }
  if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Logo must be smaller than ${MAX_LOGO_SIZE_MB} MB.` }
  }
  return { valid: true }
}

/** Generates display initials from a company name (e.g. "Mantoor
 *  Developers" → "MD") — used whenever no logo has been uploaded. */
export function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ─── Save service ────────────────────────────────────────────────────────

export interface SaveCompanyInformationInput {
  organizationId: string
  companyName: string
  companyOwnerId: string
  companyOwnerName: string
  companyType: CompanyType
  businessLocation: string
  phone: string
  email: string
  website?: string | null
  yearEstablished?: string | null
  description: string
  logoUrl?: string | null
}

export interface OrganizationSummary {
  id: string
  name: string
}

export interface SaveCompanyInformationResult {
  companyInformation: CompanyInformation
  organization: OrganizationSummary
}

let counter = 0
function nextId(): string {
  counter += 1
  return `company-${Date.now()}-${counter}`
}

/** The company-information persistence service — screens must never
 *  assemble a CompanyInformation record inline; this is the sole seam a
 *  real "save company information" API call replaces. */
export function saveCompanyInformation(data: SaveCompanyInformationInput): SaveCompanyInformationResult {
  const now = new Date().toISOString()

  const companyInformation: CompanyInformation = {
    id: nextId(),
    organizationId: data.organizationId,
    companyName: data.companyName.trim(),
    companyOwnerId: data.companyOwnerId,
    companyOwnerName: data.companyOwnerName,
    companyType: data.companyType,
    logoUrl: data.logoUrl ?? null,
    description: data.description.trim(),
    businessLocation: data.businessLocation.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    website: data.website?.trim() ? (/^https?:\/\//i.test(data.website.trim()) ? data.website.trim() : `https://${data.website.trim()}`) : null,
    yearEstablished: data.yearEstablished?.trim() || null,
    createdAt: now,
    updatedAt: now,
  }

  const organization: OrganizationSummary = {
    id: data.organizationId,
    name: data.companyName.trim(),
  }

  return { companyInformation, organization }
}

// ─── Screen 022 (professional path) — CompanyType is a homeowner-organization
// classification; ProfessionalType (professionalType.ts) is a different,
// already-answered question (Screen 018). Rather than asking the "what kind
// of company" question twice with two overlapping selectors, this derives a
// reasonable CompanyType from the ProfessionalType already on file — the
// professional-context screen shows Professional Type read-only instead of
// this radio selector. A real backend would drop CompanyType as a concept
// for professional organizations entirely; this mapping is the pragmatic
// seam until then.
export function deriveCompanyTypeFromProfessionalType(type: ProfessionalType): CompanyType {
  switch (type) {
    case 'builder-construction-company': return 'builder'
    case 'general-contractor': return 'construction-company'
    case 'specialist-contractor': return 'construction-company'
    default: return 'other'
  }
}
