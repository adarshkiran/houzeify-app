// ─── Organization — typed data model + creation service ────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "create organization" API replaces; the screen must only ever
// create/read organization data through the functions here, never inline in
// a component.
//
// ARCHITECTURE NOTE — keep these entities separate, never merge them:
//   USER                the human account (e.g. "Raja Shaker Reddy") — note
//                       this is a distinct identity from the homeowner
//                       persona ("Adarsh Kiran") used elsewhere in the app;
//                       the same person is not required to be both
//   ROLE                homeowner — set earlier in onboarding, unaffected
//                       by organization creation
//   ACCOUNT TYPE        organization — decided on Screen 012
//   ORGANIZATION        the shared workspace created on this screen
//   ORGANIZATION MEMBER the relationship between a user and an organization
//                       (e.g. "Raja Shaker Reddy is the Owner of Kiran
//                       Properties")
//   PROJECT             a construction project belonging to the
//                       organization — created later, never here

// Demo persona for the organization owner. Kept separate from
// `homeownerProfile` (src/data/homeownerProfile.ts) — the person creating
// the organization is not assumed to be the same person as the homeowner
// persona used on other screens.
export const ORGANIZATION_OWNER_NAME = 'Raja Shaker Reddy'

export type OrganizationType = 'property-owner' | 'real-estate-company' | 'family-business' | 'property-group' | 'other'
export type OrganizationStatus = 'active' | 'pending' | 'suspended'

export interface Organization {
  id: string
  name: string
  slug: string
  type: OrganizationType
  logoUrl: string | null
  website: string | null
  location: string
  ownerId: string
  /** The person responsible for this organization — editable on Screen 021,
   *  distinct from ownerId (the account that owns the workspace). Defaults
   *  to the same person, but the two are allowed to differ. */
  primaryContactName: string
  status: OrganizationStatus
  createdAt: string
  updatedAt: string
}

export type MembershipRole = 'owner' | 'admin' | 'member'
export type MembershipStatus = 'active' | 'pending' | 'removed'

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  membershipRole: MembershipRole
  status: MembershipStatus
  joinedAt: string
}

// ─── Organization type options ───────────────────────────────────────────

export const ORGANIZATION_TYPE_OPTIONS: OrganizationType[] = [
  'property-owner', 'real-estate-company', 'family-business', 'property-group', 'other',
]

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  'property-owner': 'Property Owner',
  'real-estate-company': 'Real Estate Company',
  'family-business': 'Family Business',
  'property-group': 'Property Group',
  other: 'Other',
}

export const ORGANIZATION_TYPE_DESCRIPTIONS: Record<OrganizationType, string> = {
  'property-owner': 'Manage your own properties or family projects.',
  'real-estate-company': 'Manage multiple property development projects.',
  'family-business': 'Manage construction through a family-owned business.',
  'property-group': 'Manage multiple properties or investments.',
  other: 'Another type of organization.',
}

// ─── Validation ──────────────────────────────────────────────────────────

const NAME_MIN = 2
const NAME_MAX = 100

// A person's name — the same 2-character floor as organization name, so
// "Primary contact" gets the same "min 2 characters" rule Screen 021 asks for.
const CONTACT_NAME_MIN = 2

export interface OrganizationFormValues {
  name: string
  type: OrganizationType | null
  location: string
  website: string
  primaryContactName: string
}

export interface OrganizationFormErrors {
  name?: string
  location?: string
  website?: string
  primaryContactName?: string
}

export function validateOrganizationForm(values: OrganizationFormValues): OrganizationFormErrors {
  const errors: OrganizationFormErrors = {}
  const name = values.name.trim()
  if (name.length === 0) errors.name = 'Organization name is required.'
  else if (name.length < NAME_MIN) errors.name = `Organization name must be at least ${NAME_MIN} characters.`
  else if (name.length > NAME_MAX) errors.name = `Organization name must be under ${NAME_MAX} characters.`

  if (values.location.trim().length === 0) errors.location = 'Organization location is required.'

  const website = values.website.trim()
  if (website.length > 0 && !isValidWebsite(website)) errors.website = 'Please enter a valid website URL.'

  const contact = values.primaryContactName.trim()
  if (contact.length === 0) errors.primaryContactName = 'Primary contact is required.'
  else if (contact.length < CONTACT_NAME_MIN) errors.primaryContactName = `Primary contact must be at least ${CONTACT_NAME_MIN} characters.`

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

export function isOrganizationFormValid(values: OrganizationFormValues): boolean {
  return values.name.trim().length >= NAME_MIN && values.name.trim().length <= NAME_MAX
    && values.type !== null
    && values.location.trim().length > 0
    && values.primaryContactName.trim().length >= CONTACT_NAME_MIN
    && Object.keys(validateOrganizationForm(values)).length === 0
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
export function validateLogoFile(file: File): LogoValidationResult {
  if (!SUPPORTED_LOGO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please choose a PNG, JPG or SVG image.' }
  }
  if (file.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Logo must be smaller than ${MAX_LOGO_SIZE_MB} MB.` }
  }
  return { valid: true }
}

/** Generates display initials from an organization name (e.g. "Kiran
 *  Properties" → "KP") — used whenever no logo has been uploaded. */
export function organizationInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'organization'
}

// ─── Organization creation service ────────────────────────────────────────

export interface CreateOrganizationInput {
  name: string
  type: OrganizationType
  location: string
  website?: string | null
  logoUrl?: string | null
  ownerId: string
  primaryContactName: string
  /** Pass the organization's existing id to UPDATE that same record instead
   *  of creating a second one — Screen 021's duplicate-protection. Omit
   *  only when no organization exists yet for this onboarding session. */
  organizationId?: string
}

export interface CreateOrganizationResult {
  organizationId: string
  organization: Organization
  membership: OrganizationMember
}

let orgCounter = 0
let memberCounter = 0
function nextOrgId(): string {
  orgCounter += 1
  return `org-${Date.now()}-${orgCounter}`
}
function nextMemberId(): string {
  memberCounter += 1
  return `member-${Date.now()}-${memberCounter}`
}

/** The organization creation service — screens must never assemble an
 *  Organization/OrganizationMember record inline; this is the sole seam a
 *  real "create organization" API call replaces. Creates exactly one
 *  membership record (the owner) — no other members are created here.
 *  Reuses data.organizationId when provided (Screen 021's duplicate
 *  protection — re-submitting after Back updates the SAME organization
 *  rather than minting a new id) instead of always generating a fresh id. */
export function createOrganization(data: CreateOrganizationInput): CreateOrganizationResult {
  const now = new Date().toISOString()
  const organizationId = data.organizationId || nextOrgId()

  const organization: Organization = {
    id: organizationId,
    name: data.name.trim(),
    slug: slugify(data.name),
    type: data.type,
    logoUrl: data.logoUrl ?? null,
    website: data.website?.trim() ? (/^https?:\/\//i.test(data.website.trim()) ? data.website.trim() : `https://${data.website.trim()}`) : null,
    location: data.location.trim(),
    ownerId: data.ownerId,
    primaryContactName: data.primaryContactName.trim(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }

  const membership: OrganizationMember = {
    id: nextMemberId(),
    organizationId,
    userId: data.ownerId,
    membershipRole: 'owner',
    status: 'active',
    joinedAt: now,
  }

  return { organizationId, organization, membership }
}
