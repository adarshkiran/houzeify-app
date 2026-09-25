// ─── Price Intelligence client API — S26 ───────────────────────────────────

import { ApiError, apiGet, apiPost } from './apiClient'

export type RateKind = 'material' | 'labour'

export type RateSourceType =
  | 'project_specific'
  | 'organization_price_book'
  | 'organization_historical'
  | 'market_reference'
  | 'ai_reference'
  | 'supplier'

export interface OrganizationRateEntry {
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
  priorityRank: number
}

export interface UnresolvedRate {
  found: false
  reason: string
  marketReferenceConnected: false
  aiReferenceConnected: false
}

export type ResolveRateResult = ResolvedRate | UnresolvedRate

export interface PriceIntelligenceStatus {
  sources: {
    projectRates: boolean
    organizationPriceBook: boolean
    historicalRates: boolean
    marketReference: boolean
    aiReference: boolean
  }
  catalog: {
    materials: string[]
    labour: string[]
  }
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

export function formatRateInr(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export async function getPriceIntelligenceStatus(organizationId: string): Promise<PriceIntelligenceStatus> {
  const res = await apiGet<{ data: PriceIntelligenceStatus }>(
    `/api/v1/organizations/${organizationId}/price-intelligence`,
  )
  return res.data
}

export async function listOrganizationRates(
  organizationId: string,
  opts?: { name?: string; kind?: string },
): Promise<OrganizationRateEntry[]> {
  const q = new URLSearchParams()
  if (opts?.name) q.set('name', opts.name)
  if (opts?.kind) q.set('kind', opts.kind)
  const suffix = q.toString() ? `?${q}` : ''
  const res = await apiGet<{ data: { rates: OrganizationRateEntry[] } }>(
    `/api/v1/organizations/${organizationId}/rates${suffix}`,
  )
  return res.data.rates
}

export async function createOrganizationRate(
  organizationId: string,
  input: CreateOrganizationRateInput,
): Promise<OrganizationRateEntry> {
  const res = await apiPost<{ data: { rate: OrganizationRateEntry } }>(
    `/api/v1/organizations/${organizationId}/rates`,
    input,
  )
  return res.data.rate
}

export async function resolveOrganizationRate(
  organizationId: string,
  opts: { name: string; unit: string; projectId?: string; location?: string; asOf?: string },
): Promise<ResolveRateResult> {
  const q = new URLSearchParams({ name: opts.name, unit: opts.unit })
  if (opts.projectId) q.set('projectId', opts.projectId)
  if (opts.location) q.set('location', opts.location)
  if (opts.asOf) q.set('asOf', opts.asOf)
  const res = await apiGet<{ data: { resolved: ResolveRateResult } }>(
    `/api/v1/organizations/${organizationId}/rates/resolve?${q}`,
  )
  return res.data.resolved
}

export function describePriceIntelligenceError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'MARKET_REFERENCE_UNAVAILABLE' || err.code === 'AI_REFERENCE_UNAVAILABLE') {
      return err.message
    }
    if (err.code === 'NOT_FOUND') {
      return "You don't have access to this organization's rates."
    }
    if (err.message) return err.message
  }
  return 'Something went wrong. Please try again.'
}
