// ─── Project Opportunities — typed data model + service ────────────────────
// UI demonstration data only — there is no backend yet, and no homeowner
// "post a project for bids" screen exists yet either, so this in-memory
// store starts genuinely empty. This module is the seam a real
// opportunities API replaces (S20); Screen 030 must only ever read this data
// through the functions here, never inline, and must never be seeded with
// fabricated projects.
//
// IMPORTANT DISTINCTION (per Screen 030's own brief):
//   PROJECT OPPORTUNITY   a homeowner's posted project, open for
//                         professionals to discover — Screens 030/031.
//   BID                   a professional's submitted response to one
//                         opportunity — Screen 032, never built or touched
//                         here. This module never stores bids.
//
// Reuses the SAME taxonomies already established elsewhere — never a
// duplicate category/location model:
//   ServiceCategoryType   from serviceCategories.ts (Screen 024)
//   location shape        "City, State" strings + a bare city name, matching
//                         the ServiceLocation shape from serviceLocations.ts
//                         (Screen 025)

import { SERVICE_CATEGORY_LABELS, type ServiceCategoryType } from './serviceCategories'
import type { ProjectDocument } from './documentUpload'

export type OpportunityStatus = 'open' | 'accepting-bids' | 'closing-soon' | 'awarded' | 'completed' | 'cancelled'

// Only these are ever eligible for discovery — "never show Awarded/
// Completed/Cancelled as active opportunities" per Screen 030's brief.
export const DISCOVERABLE_STATUSES: OpportunityStatus[] = ['open', 'accepting-bids', 'closing-soon']

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  open: 'Open',
  'accepting-bids': 'Accepting Bids',
  'closing-soon': 'Closing Soon',
  awarded: 'Awarded',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export type OpportunityProjectType = 'new-construction' | 'renovation' | 'interior-design' | 'architectural' | 'specialized-service' | 'material-supply'

export const OPPORTUNITY_PROJECT_TYPE_LABELS: Record<OpportunityProjectType, string> = {
  'new-construction': 'New Home Construction',
  renovation: 'Renovation & Remodeling',
  'interior-design': 'Interior Design',
  architectural: 'Architectural Services',
  'specialized-service': 'Specialized Service',
  'material-supply': 'Material Supply',
}

// ─── Optional Screen 031 detail fields ──────────────────────────────────────
// All optional/nullable — a posted opportunity may or may not include any of
// these, and Screen 031 must only ever display a field that's genuinely
// present, never invent one. Reuses the existing ProjectDocument type
// (documentUpload.ts, Screen 037's own model) rather than a new document
// architecture.

export interface OpportunityRequirements {
  builtUpAreaSqft: number | null
  floors: number | null
  bedrooms: number | null
  bathrooms: number | null
  constructionRequirements: string | null
}

export interface OpportunityPlanAnalysisSummary {
  builtUpAreaSqft: number | null
  floors: number | null
  rooms: number | null
}

export interface ProjectOpportunity {
  id: string
  title: string
  serviceCategory: ServiceCategoryType
  projectType: OpportunityProjectType
  location: string // "City, State" — same shape Screen 025 saves
  city: string
  budgetMin: number | null
  budgetMax: number | null
  postedAt: string // ISO date
  status: OpportunityStatus
  description: string
  requirements: OpportunityRequirements | null
  documents: ProjectDocument[]
  planAnalysis: OpportunityPlanAnalysisSummary | null
  estimateMin: number | null
  estimateMax: number | null
  expectedStartDate: string | null
  expectedCompletionDate: string | null
}

// ─── In-memory demo store — starts genuinely empty. No homeowner "post a
// project" screen exists yet to populate this, and this module must never
// fabricate projects to fill that gap. ─────────────────────────────────────

const allOpportunities: ProjectOpportunity[] = []

let counter = 0
function nextId(): string {
  counter += 1
  return `opportunity-${Date.now()}-${counter}`
}

export interface CreateOpportunityInput {
  title: string
  serviceCategory: ServiceCategoryType
  projectType: OpportunityProjectType
  location: string
  city: string
  budgetMin: number | null
  budgetMax: number | null
  status: OpportunityStatus
  description: string
  requirements?: OpportunityRequirements | null
  documents?: ProjectDocument[]
  planAnalysis?: OpportunityPlanAnalysisSummary | null
  estimateMin?: number | null
  estimateMax?: number | null
  expectedStartDate?: string | null
  expectedCompletionDate?: string | null
}

/** Assembles and stores a new opportunity — the seam a real "homeowner
 *  posts a project" flow replaces. Nothing in Screen 030/031 calls this; it
 *  exists only so a future posting screen (and this module's own tests)
 *  have somewhere real to write to. Optional detail fields default to
 *  absent, never fabricated. */
export function createProjectOpportunity(data: CreateOpportunityInput): ProjectOpportunity {
  const now = new Date().toISOString()
  const opportunity: ProjectOpportunity = {
    id: nextId(),
    postedAt: now,
    requirements: null,
    documents: [],
    planAnalysis: null,
    estimateMin: null,
    estimateMax: null,
    expectedStartDate: null,
    expectedCompletionDate: null,
    ...data,
  }
  allOpportunities.push(opportunity)
  return opportunity
}

/** The only real read path for Screen 030 — always filters to discoverable
 *  statuses. */
export function getDiscoverableOpportunities(): ProjectOpportunity[] {
  return allOpportunities.filter(o => DISCOVERABLE_STATUSES.includes(o.status))
}

export function getOpportunityById(id: string): ProjectOpportunity | undefined {
  return allOpportunities.find(o => o.id === id)
}

// ─── Matching — real, deterministic, honest. Never claims "AI matching." ──

export interface ProfessionalMatchProfile {
  serviceCategories: ServiceCategoryType[]
  serviceCities: string[] // parsed from the professional's own saved service-location names
}

/** Whether an opportunity is a genuine match for this professional's real,
 *  already-saved service categories/locations — a plain set-intersection,
 *  never a fabricated "AI recommendation." A professional with no saved
 *  locations yet is treated as open to any location (nothing to narrow by),
 *  never silently excluded. */
export function isGoodMatch(opportunity: ProjectOpportunity, profile: ProfessionalMatchProfile): boolean {
  const categoryMatch = profile.serviceCategories.includes(opportunity.serviceCategory)
  const locationMatch = profile.serviceCities.length === 0 || profile.serviceCities.some(city => city.toLowerCase() === opportunity.city.toLowerCase())
  return categoryMatch && locationMatch
}

// ─── Sort ──────────────────────────────────────────────────────────────────

export type OpportunitySort = 'recommended' | 'newest' | 'budget' | 'closing-soon'
export const SORT_OPTIONS: OpportunitySort[] = ['recommended', 'newest', 'budget', 'closing-soon']
export const SORT_OPTION_LABELS: Record<OpportunitySort, string> = {
  recommended: 'Recommended',
  newest: 'Newest',
  budget: 'Budget',
  'closing-soon': 'Closing Soon',
}

/** Never a complex recommendation engine — "recommended" is just a stable
 *  sort putting real matches first, then newest first within each group. */
export function sortOpportunities(opportunities: ProjectOpportunity[], sort: OpportunitySort, profile: ProfessionalMatchProfile): ProjectOpportunity[] {
  const byNewest = (a: ProjectOpportunity, b: ProjectOpportunity) => +new Date(b.postedAt) - +new Date(a.postedAt)
  switch (sort) {
    case 'recommended':
      return [...opportunities].sort((a, b) => {
        const matchDiff = Number(isGoodMatch(b, profile)) - Number(isGoodMatch(a, profile))
        return matchDiff !== 0 ? matchDiff : byNewest(a, b)
      })
    case 'newest':
      return [...opportunities].sort(byNewest)
    case 'budget':
      return [...opportunities].sort((a, b) => (b.budgetMax ?? b.budgetMin ?? 0) - (a.budgetMax ?? a.budgetMin ?? 0))
    case 'closing-soon':
      return [...opportunities].sort((a, b) => Number(b.status === 'closing-soon') - Number(a.status === 'closing-soon') || byNewest(a, b))
    default:
      return opportunities
  }
}

// ─── Filters ────────────────────────────────────────────────────────────

export interface OpportunityFilters {
  query: string
  serviceCategory: ServiceCategoryType | null
  city: string | null
  projectType: OpportunityProjectType | null
  minBudget: number | null
}

export const EMPTY_FILTERS: OpportunityFilters = { query: '', serviceCategory: null, city: null, projectType: null, minBudget: null }

export function filterOpportunities(opportunities: ProjectOpportunity[], filters: OpportunityFilters): ProjectOpportunity[] {
  const q = filters.query.trim().toLowerCase()
  return opportunities.filter(o => {
    if (q) {
      const haystack = `${o.title} ${o.location} ${o.city} ${SERVICE_CATEGORY_LABELS[o.serviceCategory]}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filters.serviceCategory && o.serviceCategory !== filters.serviceCategory) return false
    if (filters.city && o.city.toLowerCase() !== filters.city.toLowerCase()) return false
    if (filters.projectType && o.projectType !== filters.projectType) return false
    if (filters.minBudget !== null && (o.budgetMax ?? o.budgetMin ?? 0) < filters.minBudget) return false
    return true
  })
}

// ─── Formatting helpers ────────────────────────────────────────────────────

/** Matches the brief's own worked example shape exactly: "₹35–45 Lakhs". */
export function formatBudgetRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null
  const lakhs = (n: number) => Math.round(n / 100000)
  if (min !== null && max !== null) return `₹${lakhs(min)}–${lakhs(max)} Lakhs`
  if (max !== null) return `Up to ₹${lakhs(max)} Lakhs`
  return `From ₹${lakhs(min as number)} Lakhs`
}

export function formatOpportunityDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatPostedDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  if (days < 30) return `Posted ${days} days ago`
  const months = Math.floor(days / 30)
  return `Posted ${months} month${months === 1 ? '' : 's'} ago`
}
