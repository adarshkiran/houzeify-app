// ─── Account Type — typed data model + service ──────────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "create account structure" API replaces; the screen must only
// ever read/write this data through the functions here, never inline.
//
// ARCHITECTURE NOTE — keep these concepts separate, never merge them into
// one "user" object:
//   USER          the human identity (e.g. "Adarsh")
//   ROLE          what the user does in Houzeify (homeowner or
//                 professional) — set once, earlier in onboarding
//                 (primaryIntent.ts), and unaffected by this screen
//   ACCOUNT TYPE  how the workspace is structured (individual vs
//                 organization) — decided on this screen
//   ORGANIZATION  the company/group the account belongs to — created on
//                 the existing Create Organization screen, never here
//   PROJECT       a construction project, owned by either an individual
//                 account or an organization
//
// Screen 019 — Individual vs Organization reuses this SAME screen + model
// for the professional onboarding path (professionals also choose
// individual vs organization) rather than a duplicate component — see
// AccountTypeScreen's role-aware rendering. This type has no importers
// outside this module + AccountTypeScreen, so widening `role` below has no
// ripple effect elsewhere.

export type AccountType = 'individual' | 'organization'

// Widened from the original 'homeowner'-only role to also cover the
// professional onboarding path (Screen 018 → 019 reusing this same screen).
export type AccountRole = 'homeowner' | 'professional'

export interface AccountStructure {
  id: string
  userId: string
  accountType: AccountType
  role: AccountRole
  organizationId: string | null
  createdAt: string
  updatedAt: string
}

export interface AccountTypeFeatureSet {
  title: string
  description: string
  exampleLabel: string
  features: string[]
}

export const ACCOUNT_TYPE_OPTIONS: AccountType[] = ['individual', 'organization']

export const ACCOUNT_TYPE_CONTENT: Record<AccountType, AccountTypeFeatureSet> = {
  individual: {
    title: 'Personal account',
    description: 'Manage your own home construction projects as an individual homeowner.',
    exampleLabel: 'For homeowners managing their own projects.',
    features: [
      'Personal project workspace',
      'AI construction advisor',
      'Estimates and BOQ',
      'Plan analysis',
      'Material calculations',
      'Contractor collaboration',
    ],
  },
  organization: {
    title: 'Organization account',
    description: 'Manage construction projects through a company, family business, property group or organization.',
    exampleLabel: 'For teams or organizations managing projects.',
    features: [
      'Organization workspace',
      'Multiple projects',
      'Team members',
      'Shared project access',
      'Role-based permissions',
      'Organization-level collaboration',
    ],
  },
}

// The SAME individual/organization decision, framed for a professional
// instead of a homeowner (Screen 019's own copy) — reuses AccountTypeFeatureSet
// so AccountTypeScreen's existing card component needs no second variant;
// only the content differs. "features" holds each option's example list here.
export const PROFESSIONAL_ACCOUNT_TYPE_CONTENT: Record<AccountType, AccountTypeFeatureSet> = {
  individual: {
    title: 'Individual Professional',
    description: 'Work independently under your own professional identity.',
    exampleLabel: 'Independent',
    features: ['Independent contractor', 'Architect', 'Interior designer', 'Electrician', 'Plumber', 'Carpenter', 'Consultant', 'Specialist'],
  },
  organization: {
    title: 'Organization / Company',
    description: 'Operate as a business, company or professional team.',
    exampleLabel: 'Business / Team',
    features: ['Construction company', 'Builder', 'Contracting company', 'Interior design firm', 'Home services company', 'Developer', 'Material supplier'],
  },
}

export function isAccountTypeValid(accountType: AccountType | null): accountType is AccountType {
  return accountType !== null
}

/** Routing service — the next screen depends on account type AND which
 *  onboarding path (role) is asking. Never creates organization data here;
 *  that only happens once the user reaches the existing Create Organization
 *  screen.
 *
 *  Homeowner + organization goes straight to Create Organization, unchanged.
 *  Professional (either account type) continues into Screen 020 —
 *  Professional Profile Setup first: for individuals that's the whole
 *  identity step; for organizations it collects the same lean identity
 *  basics before Screen 021 — Create Organization asks the
 *  organization-specific questions (location, org type) Screen 020 doesn't
 *  ask. See ProfessionalProfileSetupScreen's own Continue handler for the
 *  org-branch handoff into 'create-organization'. */
export function nextScreenForAccountType(accountType: AccountType, role: AccountRole = 'homeowner'): 'dashboard-home' | 'create-organization' | 'professional-profile-setup' {
  if (role === 'professional') return 'professional-profile-setup'
  return accountType === 'organization' ? 'create-organization' : 'dashboard-home'
}

let counter = 0
function nextId(): string {
  counter += 1
  return `account-${Date.now()}-${counter}`
}

/** Assembles the saved account-structure record — the seam a real
 *  "create account structure" API call replaces. organizationId is always
 *  null here: the organization itself is only created on the existing
 *  Create Organization screen. role defaults to 'homeowner' — the
 *  screen passes 'professional' explicitly when reached via Screen 018. */
export function createAccountStructure(accountType: AccountType, userId: string, role: AccountRole = 'homeowner'): AccountStructure {
  const now = new Date().toISOString()
  return {
    id: nextId(),
    userId,
    accountType,
    role,
    organizationId: null,
    createdAt: now,
    updatedAt: now,
  }
}
