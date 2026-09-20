// ─── Estimate Revision (interactive what-if tool) — typed data model ───────
// Powers the "Revision Controls" screen where a homeowner drags/toggles
// assumptions (quality, area, floors, finishing, material, contingency) and
// sees a live recalculated estimate. UI demonstration data only — no backend
// yet. Screens must only ever compute the revised estimate through
// calculateRevisedEstimate(), never inline in a component.

export type QualityTier = 'basic' | 'standard' | 'premium' | 'luxury'
export type MaterialTier = 'economy' | 'standard' | 'premium'
export type FloorsOption = 'G' | 'G+1' | 'G+2' | 'G+3'

export interface RevisionAssumptions {
  constructionQuality: QualityTier
  builtUpArea: number
  floors: FloorsOption
  finishingLevel: QualityTier
  materialQuality: MaterialTier
  contingency: number
}

export const BASE_ASSUMPTIONS: RevisionAssumptions = {
  constructionQuality: 'standard',
  builtUpArea: 2400,
  floors: 'G+1',
  finishingLevel: 'standard',
  materialQuality: 'standard',
  contingency: 5,
}

/** The starting estimate this tool revises from — matches Estimate V1's
 *  real, established figures (versionOne in estimateVersions.ts), which
 *  also uses a 2,400 sq ft / Standard baseline. */
export const BASE_ESTIMATE = {
  minTotal: 2980000,
  maxTotal: 3520000,
  confidence: 86,
}

export const BUILT_UP_AREA_MIN = 800
export const BUILT_UP_AREA_MAX = 6000
export const BUILT_UP_AREA_STEP = 100

export const CONTINGENCY_MIN = 3
export const CONTINGENCY_MAX = 15

const QUALITY_MULTIPLIER: Record<QualityTier, number> = { basic: 0.85, standard: 1, premium: 1.2, luxury: 1.4 }
const MATERIAL_MULTIPLIER: Record<MaterialTier, number> = { economy: 0.9, standard: 1, premium: 1.2 }
const FLOORS_MULTIPLIER: Record<FloorsOption, number> = { G: 0.95, 'G+1': 1, 'G+2': 1.08, 'G+3': 1.15 }

const TIER_LABEL: Record<QualityTier, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium', luxury: 'Luxury' }
const MATERIAL_LABEL: Record<MaterialTier, string> = { economy: 'Economy', standard: 'Standard', premium: 'Premium' }

export interface RevisionChange {
  field: keyof RevisionAssumptions
  label: string
  from: string
  to: string
}

export interface RevisedEstimateResult {
  minTotal: number
  maxTotal: number
  avgTotal: number
  confidence: number
  costPerSqFt: number
  materialDelta: number
  labourDelta: number
  finishingDelta: number
  changes: RevisionChange[]
}

// Roughly matches the real cost-breakdown proportions used elsewhere in the
// app (materialCost/labourCost/finishingCost as a share of total) so a swing
// in the total splits out into plausible category deltas.
// Exported so screens that need an ABSOLUTE category breakdown (not just a
// delta) can derive one from a real avgTotal — see houseRequirements.ts's
// deriveCostBreakdown(). Same values, same meaning, nothing here changes.
export const MATERIAL_SHARE = 0.55
export const LABOUR_SHARE = 0.25
export const FINISHING_SHARE = 0.20

/** The calculation service — screens must recompute the revised estimate
 *  only through this function, never inline. Deterministic: the same
 *  assumptions always produce the same result. */
export function calculateRevisedEstimate(assumptions: RevisionAssumptions): RevisedEstimateResult {
  const baseAvg = (BASE_ESTIMATE.minTotal + BASE_ESTIMATE.maxTotal) / 2
  const baseCostPerSqFt = baseAvg / BASE_ASSUMPTIONS.builtUpArea

  const multiplier =
    QUALITY_MULTIPLIER[assumptions.constructionQuality] *
    QUALITY_MULTIPLIER[assumptions.finishingLevel] *
    MATERIAL_MULTIPLIER[assumptions.materialQuality] *
    FLOORS_MULTIPLIER[assumptions.floors]

  const subtotal = baseCostPerSqFt * assumptions.builtUpArea * multiplier
  const withContingency = subtotal * (1 + assumptions.contingency / 100)
  const avgTotal = Math.round(withContingency)

  const spread = (BASE_ESTIMATE.maxTotal - BASE_ESTIMATE.minTotal) / 2 / baseAvg // ≈ 8.3%, same relative spread as the base estimate
  const minTotal = Math.round(avgTotal * (1 - spread))
  const maxTotal = Math.round(avgTotal * (1 + spread))

  const deltaAvg = avgTotal - baseAvg
  const confidenceAdjustment = assumptions.builtUpArea !== BASE_ASSUMPTIONS.builtUpArea ? -1 : 0
  const confidence = Math.max(70, Math.min(95, BASE_ESTIMATE.confidence + confidenceAdjustment))

  const changes: RevisionChange[] = []
  if (assumptions.constructionQuality !== BASE_ASSUMPTIONS.constructionQuality) {
    changes.push({ field: 'constructionQuality', label: 'Construction quality', from: TIER_LABEL[BASE_ASSUMPTIONS.constructionQuality], to: TIER_LABEL[assumptions.constructionQuality] })
  }
  if (assumptions.builtUpArea !== BASE_ASSUMPTIONS.builtUpArea) {
    changes.push({ field: 'builtUpArea', label: 'Built-up area', from: `${BASE_ASSUMPTIONS.builtUpArea.toLocaleString('en-IN')} sq ft`, to: `${assumptions.builtUpArea.toLocaleString('en-IN')} sq ft` })
  }
  if (assumptions.floors !== BASE_ASSUMPTIONS.floors) {
    changes.push({ field: 'floors', label: 'Floors', from: BASE_ASSUMPTIONS.floors, to: assumptions.floors })
  }
  if (assumptions.finishingLevel !== BASE_ASSUMPTIONS.finishingLevel) {
    changes.push({ field: 'finishingLevel', label: 'Finishing level', from: TIER_LABEL[BASE_ASSUMPTIONS.finishingLevel], to: TIER_LABEL[assumptions.finishingLevel] })
  }
  if (assumptions.materialQuality !== BASE_ASSUMPTIONS.materialQuality) {
    changes.push({ field: 'materialQuality', label: 'Material quality', from: MATERIAL_LABEL[BASE_ASSUMPTIONS.materialQuality], to: MATERIAL_LABEL[assumptions.materialQuality] })
  }
  if (assumptions.contingency !== BASE_ASSUMPTIONS.contingency) {
    changes.push({ field: 'contingency', label: 'Contingency', from: `${BASE_ASSUMPTIONS.contingency}%`, to: `${assumptions.contingency}%` })
  }

  return {
    minTotal,
    maxTotal,
    avgTotal,
    confidence,
    costPerSqFt: Math.round(avgTotal / assumptions.builtUpArea),
    materialDelta: Math.round(deltaAvg * MATERIAL_SHARE),
    labourDelta: Math.round(deltaAvg * LABOUR_SHARE),
    finishingDelta: Math.round(deltaAvg * FINISHING_SHARE),
    changes,
  }
}

/** A short natural-language summary of what changed, for the "Hozie Explains" card. */
export function describeChanges(changes: RevisionChange[], deltaAvg: number): string {
  if (changes.length === 0) return "No assumptions have changed yet — adjust one on the left to see its cost impact."
  const direction = deltaAvg === 0 ? 'kept the estimate about the same' : deltaAvg > 0 ? 'increased the estimate' : 'reduced the estimate'
  const fieldList = changes.map(c => c.label.toLowerCase()).join(', ')
  return `You changed ${changes.length} assumption${changes.length > 1 ? 's' : ''} — ${fieldList}. This ${direction} by approximately ₹${Math.abs(Math.round(deltaAvg)).toLocaleString('en-IN')}.`
}
