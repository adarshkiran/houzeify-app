// ─── Material Calculator → Estimate handoff seam (S25) ─────────────────────
// Quantities only. No market pricing. Estimate Builder / Price Intelligence
// are out of scope — this seam documents the future handoff shape.

import {
  calculateMaterialQuantity,
  defaultAssumptionsFor,
  materialCalcDefinitions,
  type MaterialCalcId,
  type MaterialCalcResult,
  type ProjectCalcInput,
} from './materialCalculator.ts'
import type { CreateEstimateInput } from './projectEstimatesApi.ts'

export interface MaterialQuantityLine {
  materialId: MaterialCalcId
  name: string
  quantity: number
  unit: string
  minQuantity: number
  maxQuantity: number
}

export interface MaterialCalcEstimateHandoff {
  projectId?: string
  planAnalysisId?: string | null
  input: ProjectCalcInput
  quantities: MaterialQuantityLine[]
  /** Explicit: pricing is not part of this handoff. */
  includesPricing: false
  note: string
}

export const MATERIAL_CALC_ESTIMATE_HANDOFF_NOTE =
  'Material quantities only. Market rates and estimate line pricing belong to future Price Intelligence / Estimate Builder work.'

export function materialResultToQuantityLine(
  materialId: MaterialCalcId,
  name: string,
  result: MaterialCalcResult,
): MaterialQuantityLine {
  return {
    materialId,
    name,
    quantity: result.quantity,
    unit: result.unit,
    minQuantity: result.minQuantity,
    maxQuantity: result.maxQuantity,
  }
}

/** Runs existing formulas and strips to quantity lines (no rates). */
export function buildMaterialCalcEstimateHandoff(opts: {
  project: ProjectCalcInput
  projectId?: string
  planAnalysisId?: string | null
}): MaterialCalcEstimateHandoff {
  const quantities: MaterialQuantityLine[] = []
  for (const def of materialCalcDefinitions) {
    if (!def.includeInSummary) continue
    const result = calculateMaterialQuantity(opts.project, def, defaultAssumptionsFor(def))
    quantities.push(materialResultToQuantityLine(def.id, def.name, result))
  }
  return {
    projectId: opts.projectId,
    planAnalysisId: opts.planAnalysisId ?? null,
    input: { ...opts.project },
    quantities,
    includesPricing: false,
    note: MATERIAL_CALC_ESTIMATE_HANDOFF_NOTE,
  }
}

/**
 * Soft bridge into S22 create-estimate fields. Does not invent pricingMethod
 * totals or material line items — only safe scalar hints.
 */
export function materialCalcHandoffToEstimateCreateHints(
  handoff: MaterialCalcEstimateHandoff,
): Pick<CreateEstimateInput, 'areaSqft' | 'location'> {
  return {
    areaSqft: handoff.input.builtUpArea > 0 ? handoff.input.builtUpArea : undefined,
    location: handoff.input.location || undefined,
  }
}
