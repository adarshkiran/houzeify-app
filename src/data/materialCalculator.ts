// ─── Material Calculator — typed data model + calculation service ──────────
// UI demonstration data only. This module is the seam the future Hozie
// estimation engine replaces — screens must only ever read quantities
// through `calculateMaterialQuantity`, never derive them inline.
//
// The default "Project" inputs reuse `versionTwo.assumptions` (the same
// built-up area / construction level already shown across screens 052-060)
// so this calculator's defaults stay consistent with the rest of the app.

import type { ConfidenceLevel } from './materials'
import { versionTwo } from './estimateVersions'
import { getBOQItemById } from './boqDetail'

export type MaterialCalcId = 'cement' | 'steel' | 'sand' | 'aggregate' | 'aac-blocks' | 'concrete' | 'mortar'
export type CalculatorMode = 'project' | 'custom'
export type ConstructionLevel = 'Basic' | 'Standard' | 'Premium'

export interface ProjectCalcInput {
  builtUpArea: number
  floors: number
  constructionLevel: ConstructionLevel
  location: string
}

export interface MaterialAssumptions {
  consumptionFactor: number
  wastagePct: number
}

export interface MaterialCalcDefinition {
  id: MaterialCalcId
  name: string
  unit: string
  altUnits: string[]
  consumptionFactor: number // per sq ft, at 'Standard' construction level, in the consumptionUnit's numerator
  consumptionUnit: string // display label, e.g. "bags / sq ft"
  unitConversionDivisor: number // divides the raw (area × factor) figure into the display `unit` — e.g. steel's factor is kg/sq ft but its unit is MT, so this is 1000
  defaultWastagePct: number
  roundingStep: number
  rate: number // ₹ per unit
  confidence: ConfidenceLevel
  constructionTypeLabel: string
  weightPerUnitKg?: number // e.g. cement bag weight, for "approximate weight"
  includeInSummary: boolean // the 5 raw materials the brief's summary table lists — concrete/mortar are derived volumes, kept off the summary to avoid double-counting
}

export const CONSTRUCTION_LEVEL_MULTIPLIER: Record<ConstructionLevel, number> = {
  Basic: 0.92,
  Standard: 1.0,
  Premium: 1.12,
}

export const defaultProjectInput: ProjectCalcInput = {
  builtUpArea: versionTwo.assumptions.builtUpArea,
  floors: 2, // G+1
  constructionLevel: versionTwo.assumptions.constructionLevel as ConstructionLevel,
  location: versionTwo.assumptions.location,
}

export const materialCalcDefinitions: MaterialCalcDefinition[] = [
  {
    id: 'cement',
    name: 'Cement',
    unit: 'bags',
    altUnits: ['bags', 'kg', 'MT'],
    consumptionFactor: 0.71,
    consumptionUnit: 'bags / sq ft',
    unitConversionDivisor: 1,
    defaultWastagePct: 5,
    roundingStep: 50,
    rate: 380,
    confidence: 'medium',
    constructionTypeLabel: 'G+1 RCC residential',
    weightPerUnitKg: 50,
    includeInSummary: true,
  },
  {
    id: 'steel',
    name: 'Steel',
    unit: 'MT',
    altUnits: ['kg', 'MT'],
    consumptionFactor: 1.96, // kg / sq ft (converted to MT for display)
    consumptionUnit: 'kg / sq ft',
    unitConversionDivisor: 1000, // kg → MT
    defaultWastagePct: 3,
    roundingStep: 0.1,
    rate: 68750,
    confidence: 'medium',
    constructionTypeLabel: 'G+1 RCC residential',
    includeInSummary: true,
  },
  {
    id: 'sand',
    name: 'Sand',
    unit: 'cu ft',
    altUnits: ['cu ft', 'm³'],
    consumptionFactor: 0.94,
    consumptionUnit: 'cu ft / sq ft',
    unitConversionDivisor: 1,
    defaultWastagePct: 8,
    roundingStep: 50,
    rate: 73,
    confidence: 'medium',
    constructionTypeLabel: 'RCC + masonry + plaster mix',
    includeInSummary: true,
  },
  {
    id: 'aggregate',
    name: 'Aggregate',
    unit: 'cu ft',
    altUnits: ['cu ft', 'm³'],
    consumptionFactor: 0.66,
    consumptionUnit: 'cu ft / sq ft',
    unitConversionDivisor: 1,
    defaultWastagePct: 5,
    roundingStep: 20,
    rate: 70,
    confidence: 'medium',
    constructionTypeLabel: 'RCC concrete work',
    includeInSummary: true,
  },
  {
    id: 'aac-blocks',
    name: 'AAC Blocks',
    unit: 'nos',
    altUnits: ['nos', 'sq ft'],
    consumptionFactor: 1.10,
    consumptionUnit: 'blocks / sq ft',
    unitConversionDivisor: 1,
    defaultWastagePct: 5,
    roundingStep: 50,
    rate: 78,
    confidence: 'high',
    constructionTypeLabel: 'Internal + external masonry',
    includeInSummary: true,
  },
  {
    id: 'concrete',
    name: 'Concrete',
    unit: 'm³',
    altUnits: ['m³'],
    consumptionFactor: 0.16,
    consumptionUnit: 'm³ / sq ft',
    unitConversionDivisor: 1,
    defaultWastagePct: 3,
    roundingStep: 10,
    rate: 6200,
    confidence: 'medium',
    constructionTypeLabel: 'Footings, columns, slabs',
    includeInSummary: false,
  },
  {
    id: 'mortar',
    name: 'Mortar',
    unit: 'm³',
    altUnits: ['m³'],
    consumptionFactor: 0.12,
    consumptionUnit: 'm³ / sq ft',
    unitConversionDivisor: 1,
    defaultWastagePct: 8,
    roundingStep: 10,
    rate: 3800,
    confidence: 'medium',
    constructionTypeLabel: 'Masonry + plaster joints',
    includeInSummary: false,
  },
]

export function getMaterialDefinition(id: MaterialCalcId): MaterialCalcDefinition {
  const def = materialCalcDefinitions.find(m => m.id === id)
  if (!def) throw new Error(`Unknown material: ${id}`)
  return def
}

export function defaultAssumptionsFor(material: MaterialCalcDefinition): MaterialAssumptions {
  return { consumptionFactor: material.consumptionFactor, wastagePct: material.defaultWastagePct }
}

const CONFIDENCE_RANGE_PCT: Record<ConfidenceLevel, number> = { high: 3, medium: 5.5, low: 9 }

function roundToStep(n: number, step: number): number {
  const r = Math.round(n / step) * step
  return Math.round(r * 1000) / 1000
}

export interface MaterialCalcResult {
  quantity: number
  unit: string
  minQuantity: number
  maxQuantity: number
  consumptionFactor: number
  wastage: number
  confidence: ConfidenceLevel
  estimatedCost: number
  rawQuantity: number // area × factor, before rounding — the "2,600 × 0.71 ≈ 1,846" line
  approxWeightMT?: number
}

/** The material calculation service — screens read quantities through this, never derive them inline. */
export function calculateMaterialQuantity(
  project: ProjectCalcInput,
  material: MaterialCalcDefinition,
  assumptions: MaterialAssumptions,
): MaterialCalcResult {
  // Construction level shifts material consumption (thicker walls, richer mixes for Premium,
  // leaner specs for Basic). Floor count is normalized against the default project's 2 floors
  // (G+1) — more floors means more structural load stacking up per sq ft of built-up area, fewer
  // floors means less — so at the default floor count this multiplier is exactly 1 (Project mode,
  // which always uses the fixed G+1 default, is unaffected), while Custom mode's floor count
  // input now visibly changes the result.
  const levelMultiplier = CONSTRUCTION_LEVEL_MULTIPLIER[project.constructionLevel] ?? 1
  const floorMultiplier = 1 + (project.floors - defaultProjectInput.floors) * 0.08
  const wastageDelta = (assumptions.wastagePct - material.defaultWastagePct) / 100

  const effectiveFactor = assumptions.consumptionFactor * levelMultiplier * floorMultiplier * (1 + wastageDelta)
  const rawQuantity = (project.builtUpArea * effectiveFactor) / material.unitConversionDivisor
  const quantity = roundToStep(rawQuantity, material.roundingStep)

  const rangePct = CONFIDENCE_RANGE_PCT[material.confidence] / 100
  const minQuantity = roundToStep(quantity * (1 - rangePct), material.roundingStep)
  const maxQuantity = roundToStep(quantity * (1 + rangePct), material.roundingStep)

  const estimatedCost = Math.round(quantity * material.rate)
  const approxWeightMT = material.weightPerUnitKg != null ? Math.round((quantity * material.weightPerUnitKg / 1000) * 10) / 10 : undefined

  return {
    quantity,
    unit: material.unit,
    minQuantity,
    maxQuantity,
    consumptionFactor: assumptions.consumptionFactor,
    wastage: assumptions.wastagePct,
    confidence: material.confidence,
    estimatedCost,
    rawQuantity: Math.round((project.builtUpArea * assumptions.consumptionFactor * levelMultiplier * floorMultiplier) / material.unitConversionDivisor),
    approxWeightMT,
  }
}

// ─── BOQ connection ──────────────────────────────────────────────────────────
// Only Steel maps cleanly onto a single, directly comparable BOQ line item
// (TMT Reinforcement Steel) — the other calculator materials are dry
// components spread across multiple BOQ work packages, so there's no honest
// 1:1 BOQ quantity to compare them against.

const BOQ_ITEM_BY_MATERIAL: Partial<Record<MaterialCalcId, string>> = {
  steel: 'rcc-structure-1',
}

export interface BOQMaterialComparison {
  boqItemId: string
  boqItemName: string
  boqQuantity: number
  boqUnit: string
  calculatorQuantity: number
  difference: number
}

export function getBOQComparisonForMaterial(materialId: MaterialCalcId, calculatorQuantity: number): BOQMaterialComparison | null {
  const itemId = BOQ_ITEM_BY_MATERIAL[materialId]
  if (!itemId) return null
  const item = getBOQItemById(itemId)
  if (!item) return null
  return {
    boqItemId: item.id,
    boqItemName: item.name,
    boqQuantity: item.quantity,
    boqUnit: item.unit,
    calculatorQuantity,
    difference: Math.round((calculatorQuantity - item.quantity) * 100) / 100,
  }
}
