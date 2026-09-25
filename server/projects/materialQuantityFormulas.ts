// ─── Material quantity formulas — server port of src/data/materialCalculator ─
// Pure quantity math only. No demo rates, no fabricated costs.
// Keep factors aligned with the client Material Calculator (S25).

export type ConstructionLevel = 'Basic' | 'Standard' | 'Premium'

export type MaterialCalcId =
  | 'cement'
  | 'steel'
  | 'sand'
  | 'aggregate'
  | 'aac-blocks'
  | 'concrete'
  | 'mortar'

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
  consumptionFactor: number
  unitConversionDivisor: number
  defaultWastagePct: number
  roundingStep: number
  includeInSummary: boolean
}

export const CONSTRUCTION_LEVEL_MULTIPLIER: Record<ConstructionLevel, number> = {
  Basic: 0.92,
  Standard: 1.0,
  Premium: 1.12,
}

/** Default floor baseline (G+1) — same as client calculator. */
export const DEFAULT_FLOORS = 2

export const materialCalcDefinitions: MaterialCalcDefinition[] = [
  {
    id: 'cement',
    name: 'Cement',
    unit: 'bags',
    consumptionFactor: 0.71,
    unitConversionDivisor: 1,
    defaultWastagePct: 5,
    roundingStep: 50,
    includeInSummary: true,
  },
  {
    id: 'steel',
    name: 'Steel',
    unit: 'MT',
    consumptionFactor: 1.96,
    unitConversionDivisor: 1000,
    defaultWastagePct: 3,
    roundingStep: 0.1,
    includeInSummary: true,
  },
  {
    id: 'sand',
    name: 'Sand',
    unit: 'cu ft',
    consumptionFactor: 0.94,
    unitConversionDivisor: 1,
    defaultWastagePct: 8,
    roundingStep: 50,
    includeInSummary: true,
  },
  {
    id: 'aggregate',
    name: 'Aggregate',
    unit: 'cu ft',
    consumptionFactor: 0.66,
    unitConversionDivisor: 1,
    defaultWastagePct: 5,
    roundingStep: 20,
    includeInSummary: true,
  },
  {
    id: 'aac-blocks',
    name: 'AAC Blocks',
    unit: 'nos',
    consumptionFactor: 1.1,
    unitConversionDivisor: 1,
    defaultWastagePct: 5,
    roundingStep: 50,
    includeInSummary: true,
  },
  {
    id: 'concrete',
    name: 'Concrete',
    unit: 'm³',
    consumptionFactor: 0.16,
    unitConversionDivisor: 1,
    defaultWastagePct: 3,
    roundingStep: 10,
    includeInSummary: false,
  },
  {
    id: 'mortar',
    name: 'Mortar',
    unit: 'm³',
    consumptionFactor: 0.12,
    unitConversionDivisor: 1,
    defaultWastagePct: 8,
    roundingStep: 10,
    includeInSummary: false,
  },
]

export function defaultAssumptionsFor(material: MaterialCalcDefinition): MaterialAssumptions {
  return { consumptionFactor: material.consumptionFactor, wastagePct: material.defaultWastagePct }
}

function roundToStep(n: number, step: number): number {
  const r = Math.round(n / step) * step
  return Math.round(r * 1000) / 1000
}

export function calculateMaterialQuantity(
  project: ProjectCalcInput,
  material: MaterialCalcDefinition,
  assumptions: MaterialAssumptions,
): { quantity: number; unit: string } {
  const levelMultiplier = CONSTRUCTION_LEVEL_MULTIPLIER[project.constructionLevel] ?? 1
  const floorMultiplier = 1 + (project.floors - DEFAULT_FLOORS) * 0.08
  const wastageDelta = (assumptions.wastagePct - material.defaultWastagePct) / 100
  const effectiveFactor =
    assumptions.consumptionFactor * levelMultiplier * floorMultiplier * (1 + wastageDelta)
  const rawQuantity = (project.builtUpArea * effectiveFactor) / material.unitConversionDivisor
  return {
    quantity: roundToStep(rawQuantity, material.roundingStep),
    unit: material.unit,
  }
}

export function buildSummaryMaterialQuantities(project: ProjectCalcInput): Array<{
  materialId: MaterialCalcId
  name: string
  quantity: number
  unit: string
}> {
  const out: Array<{ materialId: MaterialCalcId; name: string; quantity: number; unit: string }> =
    []
  for (const def of materialCalcDefinitions) {
    if (!def.includeInSummary) continue
    const result = calculateMaterialQuantity(project, def, defaultAssumptionsFor(def))
    out.push({
      materialId: def.id,
      name: def.name,
      quantity: result.quantity,
      unit: result.unit,
    })
  }
  return out
}
