// ─── Contractor Directory — read/query layer over EXISTING professional
// entities ─────────────────────────────────────────────────────────────────
// UI demonstration data only — there is no backend yet for a real multi-
// tenant directory. This module is NOT a new taxonomy and NOT a duplicate of
// ContractorDirectory/ContractorSearch/BuilderDirectory architecture
// (Screen 060's brief explicitly forbids that) — it is a display PROJECTION
// over types that already exist elsewhere: organization identity
// (organization.ts, backed for real by 12G-B/C3's Organization), individual
// professional identity (backed for real by 12G-C2's PartnerProfile),
// ProfessionalType (professionalType.ts), ServiceCategoryType
// (serviceCategories.ts), VerificationStatus (organizationSetup.ts).
//
// WHY THIS CAN ONLY EVER SURFACE 0–1 LISTINGS: this demo app has no
// multi-tenant user store and no persisted "all organizations"/"all
// professionals" list anywhere in the codebase. The only real, queryable
// professional data that exists is whatever the CURRENT authenticated
// session's own real identity says — the organization branch already reads
// this via `input.companyName` (bridged from the real Organization/
// PartnerProfile in App.tsx); the individual branch now does the same
// (12G-D1 — previously it read a separate, legacy in-memory
// professionalProfile.ts record that could silently go stale on refresh or
// under a different authenticated user; see that phase's report). This
// module never invents a second (or any fake) contractor to pad the list.

import { type ServiceCategoryType } from './serviceCategories'
import { parseVerificationStatus, type VerificationStatus } from './organizationSetup'
import { type ProfessionalType } from './professionalType'
import type { AccountType } from './accountType'

export interface ContractorListing {
  /** organizationId for an organization professional, userId for an
   *  individual — the id Screen 061 (Contractor Profile) needs. */
  id: string
  kind: AccountType // 'individual' | 'organization'
  name: string
  professionalType: ProfessionalType | null
  location: string | null
  serviceCities: string[]
  serviceCategories: ServiceCategoryType[]
  verificationStatus: VerificationStatus
  portfolioProjectCount: number
  organizationId: string | null
  professionalId: string | null
  about: string | null
}

export interface ContractorDirectoryInput {
  userId: string
  accountType: AccountType | undefined
  organizationId: string | undefined
  companyName: string | undefined
  professionalType: ProfessionalType | undefined
  location: string | undefined
  serviceCategories: string | undefined // comma-joined ServiceCategoryType, from projectData.service_categories (Screen 024's own format)
  serviceLocations: string | undefined // comma-joined city names, from projectData.service_locations (Screen 025's own format)
  verificationStatus: string | undefined
  portfolioProjectCount: string | undefined
  /** Organizations only — no dedicated "company description" field survives
   *  into projectData (CompanyInformationScreen collects one, but never
   *  forwards it onward via onNavigate), so this reuses the closest real,
   *  self-authored text that does: Screen 024's own service_description
   *  ("how you'd describe your services to potential clients"). Never a
   *  fabricated bio. */
  serviceDescription?: string | undefined
  /** 12G-D1 — Individual professionals only. The real, backend-persisted
   *  PartnerProfile.about for the CURRENT authenticated professional —
   *  explicitly injected by the one or two callers that actually render an
   *  individual listing's "about" text (see this file's header). Optional:
   *  callers that never display about (the many transactional bid/project
   *  screens that only need name/location) simply omit it. */
  partnerAbout?: string | null | undefined
}

function parseList(value: string | undefined): string[] {
  return (value ?? '').split(',').map(s => s.trim()).filter(Boolean)
}

/** The only real professional data this demo can ever surface. Returns []
 *  whenever the current session never produced a genuine professional
 *  identity — the honest empty directory, never a fabricated one. Never
 *  returns more than one listing (see this file's header). */
export function getContractorListings(input: ContractorDirectoryInput): ContractorListing[] {
  const isOrganization = input.accountType === 'organization'

  if (isOrganization) {
    if (!input.companyName) return []
    return [{
      id: input.organizationId ?? input.userId,
      kind: 'organization',
      name: input.companyName,
      professionalType: (input.professionalType as ProfessionalType | undefined) ?? null,
      location: input.location || null,
      serviceCities: parseList(input.serviceLocations),
      serviceCategories: parseList(input.serviceCategories) as ServiceCategoryType[],
      verificationStatus: parseVerificationStatus(input.verificationStatus),
      portfolioProjectCount: Number(input.portfolioProjectCount) || 0,
      organizationId: input.organizationId ?? null,
      professionalId: null,
      about: input.serviceDescription || null,
    }]
  }

  // Individual professional — 12G-D1: real display name now comes from
  // `input.companyName`, exactly the same real, backend-persisted field the
  // organization branch above already uses. It's real for individuals too:
  // App.tsx's PartnerProfile -> projectData.company_name bridge (12G-C2)
  // writes `displayName || fullName` for ANY loaded PartnerProfile,
  // regardless of accountType — every one of this function's ~20 real
  // callers already threads it in as `companyName`. No saved PartnerProfile
  // means no real listing to show, mirroring the organization branch's own
  // `if (!input.companyName) return []` gate exactly (this file no longer
  // reads the legacy professionalProfile.ts in-memory store at all — see
  // the 12G-D1 report for why that store went stale on refresh/user-switch).
  if (!input.companyName) return []
  return [{
    id: input.userId,
    kind: 'individual',
    name: input.companyName,
    professionalType: (input.professionalType as ProfessionalType | undefined) ?? null,
    location: input.location || null,
    serviceCities: parseList(input.serviceLocations),
    serviceCategories: parseList(input.serviceCategories) as ServiceCategoryType[],
    // Individual professionals never create an organization in this app's
    // current flows (accountType.ts routes them straight to profile setup),
    // so there is no organizationId to look up verification/portfolio
    // against — both stay at their honest defaults, never inferred.
    verificationStatus: 'not-started',
    portfolioProjectCount: 0,
    organizationId: null,
    professionalId: input.userId,
    // Real PartnerProfile.about, explicitly injected by the one or two
    // callers that render it (see ContractorDirectoryInput.partnerAbout) —
    // null (never a stale local-store value) for every other caller, which
    // never displays this field anyway.
    about: input.partnerAbout || null,
  }]
}

/** Screen 061's own lookup — reuses getContractorListings() rather than a
 *  second "fetch one contractor" implementation. Returns undefined for an
 *  id that doesn't match the current session's real listing (invalid/stale
 *  id) — Screen 061 renders its own "Profile not found." for that, never a
 *  crash. */
export function getContractorListingById(id: string, input: ContractorDirectoryInput): ContractorListing | undefined {
  return getContractorListings(input).find(l => l.id === id)
}

// ─── Matching — real, deterministic, honest. Never claims "AI matching." ──
// Mirrors projectOpportunities.ts's isGoodMatch() exactly in spirit: a plain
// comparison against the homeowner's real, already-known project location,
// never a fabricated recommendation engine.

export interface ContractorMatchContext {
  /** The homeowner's active project's city, if one exists. */
  city: string | null
}

export function isGoodMatch(listing: ContractorListing, context: ContractorMatchContext): boolean {
  if (!context.city) return false
  if (listing.serviceCities.length === 0) return false
  return listing.serviceCities.some(c => c.toLowerCase() === context.city!.toLowerCase())
}

// ─── Filters ────────────────────────────────────────────────────────────
// Service reuses ServiceCategoryType (Screen 024's own taxonomy). Location
// is a plain city-name match — there is no cross-organization location
// index to search against (see this file's header), so this compares
// against each listing's own saved service-location names, the same shape
// Screen 025 saves. Professional Type reuses ProfessionalType (professional
// onboarding's own taxonomy). Verification compares against the real
// VerificationStatus. No Rating filter exists — no Review/Rating model
// exists anywhere in this codebase, and this module never wires a filter
// against data that can't ever be real.

export interface ContractorFilters {
  query: string
  serviceCategory: ServiceCategoryType | null
  city: string | null
  professionalType: ProfessionalType | null
  verifiedOnly: boolean
}

export const EMPTY_CONTRACTOR_FILTERS: ContractorFilters = {
  query: '',
  serviceCategory: null,
  city: null,
  professionalType: null,
  verifiedOnly: false,
}

export function filterContractors(listings: ContractorListing[], filters: ContractorFilters): ContractorListing[] {
  const q = filters.query.trim().toLowerCase()
  return listings.filter(l => {
    if (q) {
      const haystack = `${l.name} ${l.location ?? ''} ${l.serviceCities.join(' ')}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filters.serviceCategory && !l.serviceCategories.includes(filters.serviceCategory)) return false
    if (filters.city && !l.serviceCities.some(c => c.toLowerCase().includes(filters.city!.toLowerCase()))) return false
    if (filters.professionalType && l.professionalType !== filters.professionalType) return false
    if (filters.verifiedOnly && l.verificationStatus !== 'verified') return false
    return true
  })
}

/** Recommended-first sort — real matches (per isGoodMatch) before
 *  everything else, stable otherwise. Never a fabricated ranking. */
export function sortContractors(listings: ContractorListing[], context: ContractorMatchContext): ContractorListing[] {
  return [...listings].sort((a, b) => Number(isGoodMatch(b, context)) - Number(isGoodMatch(a, context)))
}
