// ─── Pure price resolution — S26 ───────────────────────────────────────────
// Single hierarchy for all screens. Market / AI sources are never invented.

import {
  RATE_SOURCE_LABELS,
  type RateSourceType,
  type ResolveRateResult,
  type ResolvedRate,
} from './priceIntelligence.types.js'

/** Honest readiness — no live market feed in S26. */
export function isMarketReferenceConnected(): boolean {
  return false
}

/** Honest readiness — no AI pricing service in S26. */
export function isAiReferencePricingConnected(): boolean {
  return false
}

export interface RateCandidate {
  id: string
  name: string
  unit: string
  ratePaise: number
  currency: string
  sourceType: RateSourceType
  sourceReference: string | null
  location: string | null
  projectId: string | null
  effectiveFrom: string
  effectiveTo: string | null
  confidence: string | null
}

export interface ResolvePriceInput {
  name: string
  unit: string
  projectId?: string | null
  location?: string | null
  /** ISO date YYYY-MM-DD — defaults to today in callers. */
  asOf: string
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeLocation(location: string | null | undefined): string | null {
  if (!location?.trim()) return null
  return location.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Inclusive effective window: effectiveFrom <= asOf && (effectiveTo == null || asOf <= effectiveTo). */
export function isRateEffectiveOn(row: Pick<RateCandidate, 'effectiveFrom' | 'effectiveTo'>, asOf: string): boolean {
  if (row.effectiveFrom > asOf) return false
  if (row.effectiveTo != null && row.effectiveTo < asOf) return false
  return true
}

function dayBefore(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

export { dayBefore }

/**
 * Classify an org-controlled row into a hierarchy tier for ranking.
 * Project-scoped rows always rank as project_specific regardless of stored sourceType.
 * Location-specific open rates stay organization_price_book.
 * Closed (historical) org rates without project become organization_historical
 * when used as fallback after no current org rate exists — handled by caller order.
 */
function tierForCandidate(
  row: RateCandidate,
  opts: { projectId?: string | null; location?: string | null },
): RateSourceType | null {
  if (opts.projectId && row.projectId === opts.projectId) {
    return 'project_specific'
  }
  if (row.projectId) {
    // Project-specific rate for a different project — not applicable.
    return null
  }
  if (row.sourceType === 'market_reference' || row.sourceType === 'ai_reference') {
    return row.sourceType
  }
  if (row.sourceType === 'supplier') {
    // Supplier entries participate as organization-controlled location/global book rates.
    return 'organization_price_book'
  }
  if (row.effectiveTo != null) {
    return 'organization_historical'
  }
  return 'organization_price_book'
}

function priorityRank(source: RateSourceType, locationMatch: 'exact' | 'global' | 'none'): number {
  // Base ranks: project=1, org book=2, historical=3, market=4, ai=5
  const base: Record<RateSourceType, number> = {
    project_specific: 1,
    organization_price_book: 2,
    organization_historical: 3,
    market_reference: 4,
    ai_reference: 5,
    supplier: 2,
  }
  let rank = base[source]
  // Within org book, prefer location match over global.
  if (source === 'organization_price_book' || source === 'supplier') {
    if (locationMatch === 'exact') rank = 2
    else if (locationMatch === 'global') rank = 2.5
    else rank = 99
  }
  if (source === 'organization_historical') {
    if (locationMatch === 'exact') rank = 3
    else if (locationMatch === 'global') rank = 3.5
    else rank = 99
  }
  return rank
}

function locationMatch(
  row: RateCandidate,
  want: string | null,
): 'exact' | 'global' | 'none' {
  const rowLoc = normalizeLocation(row.location)
  if (rowLoc && want && rowLoc === want) return 'exact'
  if (!rowLoc) return 'global'
  return 'none'
}

/**
 * Resolve a rate from candidate rows using the S26 hierarchy.
 * Does not invent market/AI rates when those feeds are disconnected.
 */
export function resolvePriceFromCandidates(
  candidates: RateCandidate[],
  input: ResolvePriceInput,
): ResolveRateResult {
  const wantName = normalizeName(input.name)
  const wantUnit = input.unit.trim().toLowerCase()
  const wantLoc = normalizeLocation(input.location)
  const asOf = input.asOf

  const matching = candidates.filter(
    c =>
      normalizeName(c.name) === wantName &&
      c.unit.trim().toLowerCase() === wantUnit &&
      isRateEffectiveOn(c, asOf),
  )

  type Scored = { row: RateCandidate; tier: RateSourceType; rank: number; loc: 'exact' | 'global' | 'none' }
  const scored: Scored[] = []

  for (const row of matching) {
    const tier = tierForCandidate(row, { projectId: input.projectId, location: wantLoc })
    if (!tier) continue

    if (tier === 'market_reference' && !isMarketReferenceConnected()) continue
    if (tier === 'ai_reference' && !isAiReferencePricingConnected()) continue

    const loc = locationMatch(row, wantLoc)
    // Project-specific ignores location match for ranking.
    if (tier === 'project_specific') {
      scored.push({ row, tier, rank: 1, loc })
      continue
    }
    if (loc === 'none') continue
    // Prefer current org book over historical when both exist:
    // historical tier only if no open org book candidate will win — we still
    // score them; lower rank loses automatically.
    scored.push({ row, tier, rank: priorityRank(tier, loc), loc })
  }

  if (scored.length === 0) {
    return {
      found: false,
      reason: 'No reliable rate available for this item, unit, and date.',
      marketReferenceConnected: false,
      aiReferenceConnected: false,
    }
  }

  scored.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    // Newer effectiveFrom wins within the same tier.
    if (a.row.effectiveFrom !== b.row.effectiveFrom) {
      return a.row.effectiveFrom < b.row.effectiveFrom ? 1 : -1
    }
    return a.row.id < b.row.id ? -1 : 1
  })

  const best = scored[0]
  const displaySource: RateSourceType =
    best.tier === 'organization_price_book' && best.row.sourceType === 'supplier'
      ? 'supplier'
      : best.tier

  const resolved: ResolvedRate = {
    found: true,
    ratePaise: best.row.ratePaise,
    unit: best.row.unit,
    currency: best.row.currency,
    sourceType: displaySource,
    sourceLabel: RATE_SOURCE_LABELS[displaySource],
    sourceReference: best.row.sourceReference,
    rateEntryId: best.row.id,
    location: best.row.location,
    effectiveFrom: best.row.effectiveFrom,
    effectiveTo: best.row.effectiveTo,
    confidence: best.row.confidence,
    priorityRank: Math.floor(best.rank),
  }
  return resolved
}
