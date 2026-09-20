// ─── Professional Type — typed data model ───────────────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "save professional classification" API replaces; the screen
// must only ever read/write this data through the functions here, never
// inline in a component.
//
// WHAT THIS IS: a pure classification answered once, early in the
// PROFESSIONAL onboarding path (primaryIntent.ts's 'professional' intent →
// this screen). It flows through App.tsx's onboarding data bag exactly like
// primary_intent and account_type already do — there is no persisted
// "professional profile" record yet for it to attach to (no such model
// exists anywhere in this codebase today), so inventing one here would be
// exactly the "disconnected project" this app's conventions avoid. Once a
// real professional-profile/organization-creation step is built later in
// this flow, it reads professionalType back out of onboarding data — the
// same pattern createAccountStructure() already uses for account type.
//
// WHY THIS IS NOT A DUPLICATE OF EXISTING TAXONOMIES — three different
// concepts already exist in this codebase and must stay separate:
//   organization.ts's OrganizationType      ('property-owner' | 'family-business' | ...)
//     — classifies a HOMEOWNER's account structure (individual vs
//       organization managing their OWN properties). Role: homeowner.
//   companyInformation.ts's CompanyType     ('developer' | 'builder' | ...)
//     — the homeowner-organization's own company identity. Role: homeowner.
//   serviceCategories.ts's ServiceCategoryType ('general-construction' | ...)
//     — what construction services that SAME homeowner-organization is
//       involved in. Explicitly documented there as "NOT professional role
//       selection." Role: homeowner.
//   ProfessionalType (this file)
//     — classifies an actual MARKETPLACE PROFESSIONAL (a person/company that
//       gets matched to leads, bids and service requests). Role:
//       professional. A fundamentally different user journey from all three
//       above, so a new, non-overlapping type is correct here, not a
//       duplicate.

export type ProfessionalType =
  | 'builder-construction-company'
  | 'general-contractor'
  | 'specialist-contractor'
  | 'architect-designer'
  | 'interior-designer'
  | 'home-service-professional'
  | 'beauty-wellness-professional'
  | 'supplier-material-provider'
  | 'other'

export const PROFESSIONAL_TYPE_OPTIONS: ProfessionalType[] = [
  'builder-construction-company',
  'general-contractor',
  'specialist-contractor',
  'architect-designer',
  'interior-designer',
  'home-service-professional',
  'beauty-wellness-professional',
  'supplier-material-provider',
  'other',
]

export interface ProfessionalTypeContent {
  title: string
  description: string
}

export const PROFESSIONAL_TYPE_CONTENT: Record<ProfessionalType, ProfessionalTypeContent> = {
  'builder-construction-company': {
    title: 'Builder / Construction Company',
    description: 'For companies that manage and build complete residential or commercial projects.',
  },
  'general-contractor': {
    title: 'General Contractor',
    description: 'For professionals who manage construction work and coordinate multiple trades.',
  },
  'specialist-contractor': {
    title: 'Specialist Contractor',
    description: 'For professionals focused on a specific construction trade or service.',
  },
  'architect-designer': {
    title: 'Architect / Designer',
    description: 'For professionals providing architecture, planning or design services.',
  },
  'interior-designer': {
    title: 'Interior Designer',
    description: 'For professionals providing interior design, renovation and interior execution services.',
  },
  'home-service-professional': {
    title: 'Home Service Professional',
    description: 'For professionals providing services such as plumbing, electrical, painting, flooring, carpentry, windows & doors, waterproofing and more.',
  },
  'beauty-wellness-professional': {
    title: 'Beauty & Wellness Professional',
    description: 'For salons, spas and independent professionals providing hair, beauty, makeup, massage and wellness services.',
  },
  'supplier-material-provider': {
    title: 'Supplier / Material Provider',
    description: 'For businesses supplying construction or home-improvement materials.',
  },
  other: {
    title: 'Other',
    description: 'For professional types not listed above.',
  },
}

// ─── Verification guidance per professional type ────────────────────────────
// UX PRINCIPLE (Professional Verification UX update): Houzeify does not
// assume every individual professional holds one universal "contractor
// licence" — different professional types have different applicable
// credentials, or none at all. This is guidance copy only, shown on the
// verification screen to help a professional understand what's typically
// relevant to their type — it never implies a credential is legally
// required, and never gates verification on any specific document. Kept
// here (not a new file/model) because it's sibling content to
// PROFESSIONAL_TYPE_CONTENT above, describing the same existing taxonomy.
export const PROFESSIONAL_CREDENTIAL_GUIDANCE: Record<ProfessionalType, string> = {
  'builder-construction-company': 'Applicable business or contractor registration, where your business has one.',
  'general-contractor': 'Applicable contractor registration or supporting professional credentials, where they apply to your work.',
  'specialist-contractor': 'Applicable trade credentials or registration, where one exists for your specialty.',
  'architect-designer': 'Your relevant professional registration or credential, where applicable.',
  'interior-designer': 'Relevant design credentials or professional registration, where you hold one — many interior designers verify through portfolio and experience instead.',
  'home-service-professional': 'Applicable licence or certification for your trade (e.g. electrical, plumbing), where your work requires one — otherwise, experience and profile information can verify your work.',
  'beauty-wellness-professional': 'Relevant salon/trade licence or certification, where your work requires one — otherwise, your portfolio and experience can verify your work.',
  'supplier-material-provider': 'Applicable business or supplier registration, where your business has one.',
  other: "Credentials that apply to your profession, if any — otherwise, your experience and profile can verify your work.",
}

export const PROFESSIONAL_TYPE_OTHER_MAX = 80

export function isProfessionalTypeOtherValid(value: string): boolean {
  const len = value.trim().length
  return len > 0 && len <= PROFESSIONAL_TYPE_OTHER_MAX
}

/** Continue is enabled only once the classification is genuinely complete —
 *  a type is chosen, and if that type is 'other', the free-text description
 *  is filled in too. */
export function isProfessionalTypeSelectionValid(type: ProfessionalType | null, otherText: string): boolean {
  if (!type) return false
  if (type === 'other') return isProfessionalTypeOtherValid(otherText)
  return true
}

// ─── Profession hierarchy (Partner UX Architecture) ─────────────────────────
// ProfessionalType above stays flat and untouched — every existing screen
// already reads it directly and it's small enough (9 values) to present as
// one grid. This is a purely additive second tier sitting ABOVE it: which
// broad group a given ProfessionalType belongs to, used so far by
// serviceCategories.ts's own recommendation lookups (grouping related
// professions' relevant categories/service-modes/pricing models together)
// without needing a second parallel taxonomy. Never used to gate or hide a
// ProfessionalType option itself — selection stays exactly as it is today.
export type ProfessionGroup =
  | 'construction'
  | 'architecture-design'
  | 'home-services'
  | 'beauty-wellness'
  | 'materials-suppliers'
  | 'other'

export const PROFESSION_GROUP_FOR_TYPE: Record<ProfessionalType, ProfessionGroup> = {
  'builder-construction-company': 'construction',
  'general-contractor': 'construction',
  'specialist-contractor': 'construction',
  'architect-designer': 'architecture-design',
  'interior-designer': 'architecture-design',
  'home-service-professional': 'home-services',
  'beauty-wellness-professional': 'beauty-wellness',
  'supplier-material-provider': 'materials-suppliers',
  other: 'other',
}

// ─── Multiple professions / additional capabilities (data shape only) ──────
// Item 10 of the Partner UX Architecture brief: a Partner should eventually
// be able to hold a primary profession plus additional capabilities (e.g.
// primary Electrician + additional AC Technician) without creating a
// second account. This is the shape that will back that — no screen reads
// or writes `additional` yet (the existing onboarding chain still only
// ever sets `primary` via ProfessionalTypeScreen), so it's ready for a
// future "add another profession" step to attach to without a data-model
// change at that point.
export interface ProfessionalCapabilities {
  primary: ProfessionalType
  additional: ProfessionalType[]
}
