// ─── Price Intelligence types — S26 ────────────────────────────────────────

export const RATE_KINDS = ['material', 'labour'] as const
export type RateKind = (typeof RATE_KINDS)[number]

export const RATE_SOURCE_TYPES = [
  'project_specific',
  'organization_price_book',
  'organization_historical',
  'market_reference',
  'ai_reference',
  'supplier',
] as const
export type RateSourceType = (typeof RATE_SOURCE_TYPES)[number]

/** Deterministic resolution priority — lower index wins. */
export const RATE_RESOLUTION_PRIORITY: RateSourceType[] = [
  'project_specific',
  'organization_price_book', // location-specific rows preferred within this tier by resolver
  'organization_historical',
  'market_reference',
  'ai_reference',
]

export const RATE_SOURCE_LABELS: Record<RateSourceType, string> = {
  project_specific: 'Project-specific Rate',
  organization_price_book: 'Organization Price Book',
  organization_historical: 'Historical Organization Rate',
  market_reference: 'Market Reference',
  ai_reference: 'AI / Reference Estimate',
  supplier: 'Supplier Rate',
}

export interface OrganizationRateEntryDto {
  id: string
  organizationId: string
  projectId: string | null
  kind: RateKind
  name: string
  unit: string
  ratePaise: number
  currency: string
  sourceType: RateSourceType
  sourceReference: string | null
  location: string | null
  effectiveFrom: string
  effectiveTo: string | null
  confidence: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ResolvedRate {
  found: true
  ratePaise: number
  unit: string
  currency: string
  sourceType: RateSourceType
  sourceLabel: string
  sourceReference: string | null
  rateEntryId: string
  location: string | null
  effectiveFrom: string
  effectiveTo: string | null
  confidence: string | null
  /** How the resolver ranked this hit (1 = highest). */
  priorityRank: number
}

export interface UnresolvedRate {
  found: false
  reason: string
  marketReferenceConnected: false
  aiReferenceConnected: false
}

export type ResolveRateResult = ResolvedRate | UnresolvedRate

/** Snapshot fields copied onto estimate_items when a rate is applied (S27). */
export interface EstimateRateSnapshot {
  ratePaise: number
  rateSource: RateSourceType
  effectiveDate: string
  confidence: string | null
  sourceReference: string | null
}

export interface CreateOrganizationRateInput {
  kind: RateKind
  name: string
  unit: string
  ratePaise: number
  currency?: string
  sourceType?: RateSourceType
  sourceReference?: string
  location?: string
  projectId?: string
  effectiveFrom: string
  effectiveTo?: string | null
  confidence?: string | null
}

export function serializeOrganizationRateEntry(row: {
  id: string
  organizationId: string
  projectId: string | null
  kind: string
  name: string
  unit: string
  ratePaise: number
  currency: string
  sourceType: string
  sourceReference: string | null
  location: string | null
  effectiveFrom: string
  effectiveTo: string | null
  confidence: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}): OrganizationRateEntryDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    projectId: row.projectId,
    kind: row.kind as RateKind,
    name: row.name,
    unit: row.unit,
    ratePaise: row.ratePaise,
    currency: row.currency,
    sourceType: row.sourceType as RateSourceType,
    sourceReference: row.sourceReference,
    location: row.location,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    confidence: row.confidence,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function resolvedRateToEstimateSnapshot(resolved: ResolvedRate): EstimateRateSnapshot {
  return {
    ratePaise: resolved.ratePaise,
    rateSource: resolved.sourceType,
    effectiveDate: resolved.effectiveFrom,
    confidence: resolved.confidence,
    sourceReference: resolved.sourceReference,
  }
}
