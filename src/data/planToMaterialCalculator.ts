// ─── Plan Analysis → Material Calculator adapter (S25) ──────────────────────
// Maps S24 PlanExtractedData into the existing ProjectCalcInput contract.
// Does NOT invent missing values. Does NOT run quantity formulas.

import {
  defaultProjectInput,
  type ConstructionLevel,
  type ProjectCalcInput,
} from './materialCalculator.ts'
import type { PlanExtractedData } from './planAnalysisApi.ts'

export type MaterialCalcFieldSource = 'plan' | 'user' | 'default' | 'unavailable'

export interface MaterialCalculatorFieldSources {
  builtUpArea: MaterialCalcFieldSource
  floors: MaterialCalcFieldSource
  constructionLevel: MaterialCalcFieldSource
  location: MaterialCalcFieldSource
}

export interface MaterialCalculatorSeed {
  projectId?: string
  planAnalysisId?: string
  input: ProjectCalcInput
  fieldSources: MaterialCalculatorFieldSources
  /** Human-readable list of calculator fields the plan did not supply. */
  missingPlanFields: string[]
}

export interface PlanAnalysisSeedSource {
  id: string
  projectId: string
  extractedData: PlanExtractedData
}

/**
 * Builds calculator inputs from plan analysis. Missing plan fields fall back
 * to calculator defaults and are listed in `missingPlanFields` — never fabricated.
 */
export function planAnalysisToMaterialCalculatorSeed(
  analysis: PlanAnalysisSeedSource,
  opts?: {
    location?: string
    constructionLevel?: ConstructionLevel
  },
): MaterialCalculatorSeed {
  const data = analysis.extractedData
  const missingPlanFields: string[] = []

  let builtUpArea = defaultProjectInput.builtUpArea
  let builtUpAreaSource: MaterialCalcFieldSource = 'default'
  if (data.builtUpAreaSqft != null && data.builtUpAreaSqft > 0) {
    builtUpArea = data.builtUpAreaSqft
    builtUpAreaSource = 'plan'
  } else {
    missingPlanFields.push('builtUpArea')
    builtUpAreaSource = 'unavailable'
  }

  let floors = defaultProjectInput.floors
  let floorsSource: MaterialCalcFieldSource = 'default'
  if (data.floors != null && data.floors >= 1) {
    floors = data.floors
    floorsSource = 'plan'
  } else {
    missingPlanFields.push('floors')
    floorsSource = 'unavailable'
  }

  // Plan analysis does not currently carry construction level or location.
  missingPlanFields.push('constructionLevel')
  if (!opts?.location) missingPlanFields.push('location')

  const location = opts?.location?.trim() || defaultProjectInput.location
  const constructionLevel = opts?.constructionLevel ?? defaultProjectInput.constructionLevel

  return {
    projectId: analysis.projectId,
    planAnalysisId: analysis.id,
    input: {
      builtUpArea,
      floors,
      constructionLevel,
      location,
    },
    fieldSources: {
      builtUpArea: builtUpAreaSource === 'unavailable' ? 'default' : builtUpAreaSource,
      floors: floorsSource === 'unavailable' ? 'default' : floorsSource,
      constructionLevel: 'default',
      location: opts?.location?.trim() ? 'user' : 'default',
    },
    missingPlanFields,
  }
}

/** Navigation payload keys for App projectData → Material Calculator. */
export const MATERIAL_CALC_NAV = {
  planAnalysisId: 'plan_analysis_id',
  builtUpArea: 'calc_built_up_area',
  floors: 'calc_floors',
  fromPlan: 'calc_from_plan',
  returnScreen: 'return_screen',
} as const

export function materialCalculatorSeedToNavData(
  seed: MaterialCalculatorSeed,
  extra?: Record<string, string>,
): Record<string, string> {
  const data: Record<string, string> = {
    [MATERIAL_CALC_NAV.fromPlan]: '1',
    [MATERIAL_CALC_NAV.builtUpArea]: String(seed.input.builtUpArea),
    [MATERIAL_CALC_NAV.floors]: String(seed.input.floors),
  }
  if (seed.planAnalysisId) data[MATERIAL_CALC_NAV.planAnalysisId] = seed.planAnalysisId
  if (seed.projectId) data.project_id = seed.projectId
  if (seed.fieldSources.builtUpArea === 'plan') data.calc_area_source = 'plan'
  if (seed.fieldSources.floors === 'plan') data.calc_floors_source = 'plan'
  if (extra) Object.assign(data, extra)
  return data
}

export function parseMaterialCalculatorNavSeed(data: {
  calc_from_plan?: string
  calc_built_up_area?: string
  calc_floors?: string
  calc_area_source?: string
  calc_floors_source?: string
  plan_analysis_id?: string
  project_id?: string
  location?: string
}): MaterialCalculatorSeed | null {
  if (data.calc_from_plan !== '1') return null

  const areaRaw = data.calc_built_up_area
  const floorsRaw = data.calc_floors
  const areaParsed = areaRaw != null && areaRaw !== '' ? Number(areaRaw) : NaN
  const floorsParsed = floorsRaw != null && floorsRaw !== '' ? Number(floorsRaw) : NaN

  const areaSource: MaterialCalcFieldSource =
    data.calc_area_source === 'plan' && Number.isFinite(areaParsed) && areaParsed > 0
      ? 'plan'
      : 'default'
  const floorsSource: MaterialCalcFieldSource =
    data.calc_floors_source === 'plan' && Number.isFinite(floorsParsed) && floorsParsed >= 1
      ? 'plan'
      : 'default'

  return {
    projectId: data.project_id,
    planAnalysisId: data.plan_analysis_id,
    input: {
      builtUpArea:
        areaSource === 'plan' ? areaParsed : defaultProjectInput.builtUpArea,
      floors: floorsSource === 'plan' ? floorsParsed : defaultProjectInput.floors,
      constructionLevel: defaultProjectInput.constructionLevel,
      location: data.location?.trim() || defaultProjectInput.location,
    },
    fieldSources: {
      builtUpArea: areaSource,
      floors: floorsSource,
      constructionLevel: 'default',
      location: data.location?.trim() ? 'user' : 'default',
    },
    missingPlanFields: [
      ...(areaSource !== 'plan' ? ['builtUpArea'] : []),
      ...(floorsSource !== 'plan' ? ['floors'] : []),
      'constructionLevel',
    ],
  }
}

export function fieldSourceLabel(source: MaterialCalcFieldSource): string | null {
  if (source === 'plan') return 'Source: House Plan'
  if (source === 'user') return 'Source: Edited'
  return null
}
