// ─── House Requirements — typed data model + service ───────────────────────
// UI demonstration data only — there is no backend yet, same convention as
// bids.ts/projectProgress.ts. This is Flow 04's single source of truth: the
// one structured record every downstream New Build screen (estimate,
// materials, labour, comparison, revision, final estimate) reads through —
// never a second, competing shape. No equivalent model existed anywhere in
// the codebase before this (confirmed by a repo-wide search during planning
// — the closest existing fields, constructionIntent.ts's HomeIntent and
// CreateProjectScreen's local state, only cover home type/BHK/built-up
// area/floors/project name, never plot/room counts/finish level/special
// requirements/budget/timeline).

import type { FloorsOption, MaterialTier, QualityTier, RevisionAssumptions } from './estimateRevision'
import { MATERIAL_SHARE, LABOUR_SHARE, FINISHING_SHARE, calculateRevisedEstimate, type RevisedEstimateResult } from './estimateRevision'
import type { CostBreakdown } from './estimateVersions'

export type BuildingType = 'independent-house' | 'villa' | 'duplex' | 'apartment' | 'other'
export const BUILDING_TYPE_OPTIONS: BuildingType[] = ['independent-house', 'villa', 'duplex', 'apartment', 'other']
export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  'independent-house': 'Independent House',
  villa: 'Villa',
  duplex: 'Duplex',
  apartment: 'Apartment / Flat',
  other: 'Other',
}

// Reuses estimateRevision.ts's own QualityTier (basic/standard/premium/
// luxury) as the finish-level vocabulary — never a third, parallel tier
// type for what is conceptually the same "how finished should this be"
// choice already used to drive the real cost calculator.
export type FinishLevel = QualityTier
export const FINISH_LEVEL_OPTIONS: FinishLevel[] = ['basic', 'standard', 'premium', 'luxury']
export const FINISH_LEVEL_LABELS: Record<FinishLevel, string> = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  luxury: 'Luxury',
}

export type SpecialRequirement =
  | 'home-office' | 'pooja-room' | 'servant-room' | 'swimming-pool' | 'garden'
  | 'lift' | 'solar' | 'smart-home' | 'modular-kitchen' | 'premium-bathroom' | 'other'
export const SPECIAL_REQUIREMENT_OPTIONS: SpecialRequirement[] = [
  'home-office', 'pooja-room', 'servant-room', 'swimming-pool', 'garden',
  'lift', 'solar', 'smart-home', 'modular-kitchen', 'premium-bathroom', 'other',
]
export const SPECIAL_REQUIREMENT_LABELS: Record<SpecialRequirement, string> = {
  'home-office': 'Home Office',
  'pooja-room': 'Pooja Room',
  'servant-room': 'Servant Room',
  'swimming-pool': 'Swimming Pool',
  garden: 'Garden',
  lift: 'Lift',
  solar: 'Solar',
  'smart-home': 'Smart Home',
  'modular-kitchen': 'Modular Kitchen',
  'premium-bathroom': 'Premium Bathroom',
  other: 'Other',
}

export interface HouseRequirements {
  projectId: string
  buildingType: BuildingType
  plotArea: number | null
  plotDimensions: string
  siteConditions: string
  builtUpArea: number
  floors: FloorsOption
  bhk: string
  bedrooms: number | null
  bathrooms: number | null
  hasLivingRoom: boolean
  hasDiningArea: boolean
  hasKitchen: boolean
  hasUtilityArea: boolean
  hasBalcony: boolean
  hasStaircase: boolean
  hasTerrace: boolean
  parking: number | null
  finishLevel: FinishLevel
  specialRequirements: SpecialRequirement[]
  budgetExpected: number | null
  budgetMin: number | null
  budgetMax: number | null
  timelineStart: string
  timelineCompletion: string
  createdAt: string
  updatedAt: string
}

export interface HouseRequirementsInput {
  projectId: string
  buildingType: BuildingType
  plotArea?: number | null
  plotDimensions?: string
  siteConditions?: string
  builtUpArea: number
  floors: FloorsOption
  bhk?: string
  bedrooms?: number | null
  bathrooms?: number | null
  hasLivingRoom?: boolean
  hasDiningArea?: boolean
  hasKitchen?: boolean
  hasUtilityArea?: boolean
  hasBalcony?: boolean
  hasStaircase?: boolean
  hasTerrace?: boolean
  parking?: number | null
  finishLevel: FinishLevel
  specialRequirements?: SpecialRequirement[]
  budgetExpected?: number | null
  budgetMin?: number | null
  budgetMax?: number | null
  timelineStart?: string
  timelineCompletion?: string
}

// ─── In-memory demo store — one record per project, matching how every
// other project-scoped module here (documentUpload.ts's ProjectDocument,
// projectProgress.ts's updates) keys off a real projectId. ───────────────

const allRequirements: HouseRequirements[] = []

function defaults(input: HouseRequirementsInput): HouseRequirements {
  const now = new Date().toISOString()
  return {
    projectId: input.projectId,
    buildingType: input.buildingType,
    plotArea: input.plotArea ?? null,
    plotDimensions: input.plotDimensions ?? '',
    siteConditions: input.siteConditions ?? '',
    builtUpArea: input.builtUpArea,
    floors: input.floors,
    bhk: input.bhk ?? '',
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    hasLivingRoom: input.hasLivingRoom ?? true,
    hasDiningArea: input.hasDiningArea ?? true,
    hasKitchen: input.hasKitchen ?? true,
    hasUtilityArea: input.hasUtilityArea ?? false,
    hasBalcony: input.hasBalcony ?? false,
    hasStaircase: input.hasStaircase ?? false,
    hasTerrace: input.hasTerrace ?? false,
    parking: input.parking ?? null,
    finishLevel: input.finishLevel,
    specialRequirements: input.specialRequirements ?? [],
    budgetExpected: input.budgetExpected ?? null,
    budgetMin: input.budgetMin ?? null,
    budgetMax: input.budgetMax ?? null,
    timelineStart: input.timelineStart ?? '',
    timelineCompletion: input.timelineCompletion ?? '',
    createdAt: now,
    updatedAt: now,
  }
}

/** Creates (or, if one already exists for this projectId, replaces) the
 *  requirements record for a project — a homeowner revisiting House
 *  Requirements to edit always supersedes the previous record rather than
 *  accumulating duplicates, matching this screen's own "Edit Requirements"
 *  affordance. */
export function createHouseRequirements(input: HouseRequirementsInput): HouseRequirements {
  const record = defaults(input)
  const existingIndex = allRequirements.findIndex(r => r.projectId === input.projectId)
  if (existingIndex >= 0) allRequirements[existingIndex] = record
  else allRequirements.push(record)
  return record
}

export function getHouseRequirementsForProject(projectId: string): HouseRequirements | undefined {
  return allRequirements.find(r => r.projectId === projectId)
}

export function updateHouseRequirements(projectId: string, patch: Partial<HouseRequirementsInput>): HouseRequirements | undefined {
  const existing = getHouseRequirementsForProject(projectId)
  if (!existing) return undefined
  const updated: HouseRequirements = { ...existing, ...patch, updatedAt: new Date().toISOString() }
  const index = allRequirements.findIndex(r => r.projectId === projectId)
  allRequirements[index] = updated
  return updated
}

// ─── Bridge into the real estimate calculator ───────────────────────────────
// estimateRevision.ts's calculateRevisedEstimate() is the one real,
// deterministic calculation engine in this codebase — every New Build
// estimate screen must go through THIS function to reach it, never
// recompute independently, so every screen the homeowner sees stays
// consistent with the others.

const FINISH_TO_MATERIAL_TIER: Record<FinishLevel, MaterialTier> = {
  basic: 'economy',
  standard: 'standard',
  premium: 'premium',
  luxury: 'premium', // no separate "luxury" material-tier multiplier exists — luxury's extra
  // cost comes from QUALITY_MULTIPLIER.luxury (construction+finishing), not a fabricated
  // fourth material tier; premium materials priced at the luxury quality multiplier is the
  // real, honest number, not a guess.
}

export function houseRequirementsToRevisionAssumptions(req: HouseRequirements): RevisionAssumptions {
  return {
    constructionQuality: req.finishLevel,
    builtUpArea: req.builtUpArea,
    floors: req.floors,
    finishingLevel: req.finishLevel,
    materialQuality: FINISH_TO_MATERIAL_TIER[req.finishLevel],
    contingency: 5, // matches BASE_ASSUMPTIONS.contingency — no requirements field collects a
    // custom contingency percentage, so this is the same honest default the rest of the app uses.
  }
}

/** Derives an ABSOLUTE category breakdown (materials/labour/finishing/
 *  services/contingency) from a real calculateRevisedEstimate() result —
 *  that function's own MATERIAL_SHARE/LABOUR_SHARE/FINISHING_SHARE are
 *  designed for deltas, not absolute splits, so this reconstructs the
 *  pre-contingency subtotal from avgTotal + the known contingency % and
 *  applies the same three shares to it (they sum to exactly 1.00), then
 *  splits the FINISHING_SHARE bucket 65/35 into finishing/services — the
 *  same ~2:1 ratio the original versionOne demo figures use. */
export function deriveCostBreakdown(result: RevisedEstimateResult, assumptions: RevisionAssumptions): CostBreakdown {
  const subtotal = result.avgTotal / (1 + assumptions.contingency / 100)
  const contingencyCost = Math.round(result.avgTotal - subtotal)
  const materialCost = Math.round(subtotal * MATERIAL_SHARE)
  const labourCost = Math.round(subtotal * LABOUR_SHARE)
  const financeShareTotal = subtotal * FINISHING_SHARE
  const finishingCost = Math.round(financeShareTotal * 0.65)
  const servicesCost = Math.round(financeShareTotal * 0.35)
  return { materialCost, labourCost, finishingCost, servicesCost, contingencyCost }
}

/** One-call convenience: real requirements in, real estimate result +
 *  breakdown out. Every estimate screen should call this rather than
 *  re-deriving assumptions inline. */
export function estimateForRequirements(req: HouseRequirements): { assumptions: RevisionAssumptions; result: RevisedEstimateResult; breakdown: CostBreakdown } {
  const assumptions = houseRequirementsToRevisionAssumptions(req)
  const result = calculateRevisedEstimate(assumptions)
  const breakdown = deriveCostBreakdown(result, assumptions)
  return { assumptions, result, breakdown }
}
