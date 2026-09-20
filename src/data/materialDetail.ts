// ─── Material Detail — typed data model + service ──────────────────────────
// UI demonstration data only. Composes the Material Calculator's live
// calculation service with static per-material reference content (spec,
// usage split, confidence narrative, cost sensitivity). Screens must only
// ever read material detail through `buildMaterialDetail`, never assemble
// it inline.

import type { ConfidenceLevel } from './materials'
import type { CostSensitivityFactor } from './boqDetail'
import { getBOQItemById } from './boqDetail'
import {
  getMaterialDefinition,
  defaultProjectInput,
  calculateMaterialQuantity,
  type MaterialCalcId,
  type ProjectCalcInput,
} from './materialCalculator'

export interface MaterialDetail {
  id: MaterialCalcId
  name: string
  category: string
  quantity: number
  unit: string
  minQuantity: number
  maxQuantity: number
  unitRate: number
  rateMin: number
  rateMax: number
  estimatedCost: number
  specification: string
  applications: string[]
  consumptionFactor: number
  wastage: number
  wastageRangeMin: number
  wastageRangeMax: number
  priceBasis: string
  location: string
  confidence: ConfidenceLevel
  confidenceScore: number
  confidenceWhy: string[]
  confidenceImprove: string[]
  usageBreakdown: { label: string; percent: number }[]
  costSensitivity: CostSensitivityFactor[]
  boqItemId?: string
  relatedMaterialIds: MaterialCalcId[]
  packaging?: string
  suggestedType?: string
  rawQuantity: number
  approxWeightMT?: number
}

interface MaterialDetailMeta {
  category: string
  specification: string
  applications: string[]
  packaging?: string
  suggestedType?: string
  usageBreakdown: { label: string; percent: number }[]
  wastageRangeMin: number
  wastageRangeMax: number
  rateMin: number
  rateMax: number
  confidenceScore: number
  confidenceWhy: string[]
  confidenceImprove: string[]
  costSensitivity: CostSensitivityFactor[]
  boqItemId?: string
  relatedMaterialIds: MaterialCalcId[]
  importantNote: string
}

const MATERIAL_DETAIL_META: Record<MaterialCalcId, MaterialDetailMeta> = {
  cement: {
    category: 'Structure',
    specification: 'General purpose Portland cement for structural and masonry work.',
    applications: ['RCC', 'Masonry', 'Plastering', 'Flooring'],
    packaging: '50 kg bag',
    suggestedType: 'OPC / PPC based on application',
    usageBreakdown: [
      { label: 'RCC Structure', percent: 45 },
      { label: 'Masonry', percent: 25 },
      { label: 'Plastering', percent: 20 },
      { label: 'Other Work', percent: 10 },
    ],
    wastageRangeMin: 3,
    wastageRangeMax: 7,
    rateMin: 350,
    rateMax: 420,
    confidenceScore: 82,
    confidenceWhy: ['Project area available', 'Construction type known', 'Construction level known'],
    confidenceImprove: ['Final floor plan', 'Structural drawings', 'Detailed BOQ', 'Material specifications'],
    costSensitivity: [
      { factor: 'Quantity', impact: 'high' },
      { factor: 'Cement price', impact: 'high' },
      { factor: 'Construction mix', impact: 'medium' },
      { factor: 'Wastage', impact: 'medium' },
      { factor: 'Project changes', impact: 'high' },
    ],
    relatedMaterialIds: ['steel', 'sand', 'aggregate', 'aac-blocks'],
    importantNote: 'Final cement type and grade should be confirmed against structural and project specifications.',
  },
  steel: {
    category: 'Structure',
    specification: 'Fe500D TMT reinforcement steel for RCC structural work.',
    applications: ['Footings', 'Columns', 'Beams', 'Slabs'],
    suggestedType: 'Fe500D (Fe550 for taller structures)',
    usageBreakdown: [
      { label: 'Footings', percent: 20 },
      { label: 'Columns', percent: 25 },
      { label: 'Beams', percent: 25 },
      { label: 'Slabs', percent: 30 },
    ],
    wastageRangeMin: 2,
    wastageRangeMax: 5,
    rateMin: 65000,
    rateMax: 72000,
    confidenceScore: 78,
    confidenceWhy: ['Project area available', 'Typical structural assumptions available'],
    confidenceImprove: ['Structural drawings', 'Engineer-approved reinforcement schedule', 'Material brand selection'],
    costSensitivity: [
      { factor: 'Quantity', impact: 'high' },
      { factor: 'Steel price', impact: 'high' },
      { factor: 'Structural design', impact: 'high' },
      { factor: 'Wastage', impact: 'low' },
      { factor: 'Project changes', impact: 'medium' },
    ],
    boqItemId: 'rcc-structure-1',
    relatedMaterialIds: ['cement', 'aggregate', 'concrete'],
    importantNote: 'Final reinforcement quantity and grade must be confirmed by the structural engineer and structural drawings.',
  },
  sand: {
    category: 'Masonry',
    specification: 'River / M-sand for concrete, masonry and plaster mix.',
    applications: ['RCC', 'Masonry', 'Plastering'],
    packaging: 'Sold by cu ft / truck load',
    suggestedType: 'M-Sand (manufactured sand)',
    usageBreakdown: [
      { label: 'RCC Structure', percent: 35 },
      { label: 'Masonry', percent: 35 },
      { label: 'Plastering', percent: 30 },
    ],
    wastageRangeMin: 5,
    wastageRangeMax: 10,
    rateMin: 65,
    rateMax: 85,
    confidenceScore: 76,
    confidenceWhy: ['Project area available', 'Construction level known'],
    confidenceImprove: ['Detailed BOQ', 'Site survey', 'Material specifications'],
    costSensitivity: [
      { factor: 'Quantity', impact: 'high' },
      { factor: 'Sand price', impact: 'medium' },
      { factor: 'Mix ratio', impact: 'medium' },
      { factor: 'Transport distance', impact: 'medium' },
      { factor: 'Wastage', impact: 'low' },
    ],
    relatedMaterialIds: ['cement', 'aggregate', 'aac-blocks'],
    importantNote: 'Final sand quantity should be confirmed against structural drawings and approved mix design.',
  },
  aggregate: {
    category: 'Structure',
    specification: '20mm graded aggregate for RCC concrete work.',
    applications: ['RCC', 'Concrete'],
    packaging: 'Sold by cu ft / truck load',
    suggestedType: '20mm graded aggregate',
    usageBreakdown: [
      { label: 'RCC Structure', percent: 70 },
      { label: 'Flooring Base', percent: 20 },
      { label: 'Other Work', percent: 10 },
    ],
    wastageRangeMin: 3,
    wastageRangeMax: 6,
    rateMin: 62,
    rateMax: 78,
    confidenceScore: 76,
    confidenceWhy: ['Project area available', 'Construction type known'],
    confidenceImprove: ['Structural drawings', 'Detailed BOQ'],
    costSensitivity: [
      { factor: 'Quantity', impact: 'high' },
      { factor: 'Aggregate price', impact: 'medium' },
      { factor: 'Concrete mix', impact: 'medium' },
      { factor: 'Transport distance', impact: 'medium' },
      { factor: 'Wastage', impact: 'low' },
    ],
    relatedMaterialIds: ['cement', 'sand', 'steel'],
    importantNote: 'Final aggregate quantity should be confirmed against structural drawings and approved mix design.',
  },
  'aac-blocks': {
    category: 'Masonry',
    specification: 'Autoclaved aerated concrete blocks for internal and external walls.',
    applications: ['External Walls', 'Internal Walls'],
    packaging: 'Standard block, 600 × 200mm, 100-200mm thick',
    suggestedType: '600mm × 200mm, thickness per wall type',
    usageBreakdown: [
      { label: 'External Walls', percent: 55 },
      { label: 'Internal Walls', percent: 45 },
    ],
    wastageRangeMin: 3,
    wastageRangeMax: 6,
    rateMin: 72,
    rateMax: 85,
    confidenceScore: 88,
    confidenceWhy: ['Wall area scales directly with built-up area', 'Construction level known', 'Standard block size assumed'],
    confidenceImprove: ['Final wall layout', 'Detailed BOQ'],
    costSensitivity: [
      { factor: 'Wall area', impact: 'high' },
      { factor: 'Block price', impact: 'medium' },
      { factor: 'Design changes', impact: 'medium' },
      { factor: 'Wastage', impact: 'low' },
      { factor: 'Project changes', impact: 'medium' },
    ],
    relatedMaterialIds: ['cement', 'sand', 'steel'],
    importantNote: 'Final block quantity should be confirmed against the approved wall layout.',
  },
  concrete: {
    category: 'Structure',
    specification: 'Ready-mix or site-mix concrete for footings, columns and slabs.',
    applications: ['Footings', 'Columns', 'Slabs'],
    suggestedType: 'M20 grade (typical residential)',
    usageBreakdown: [
      { label: 'Footings', percent: 20 },
      { label: 'Columns', percent: 20 },
      { label: 'Slabs', percent: 60 },
    ],
    wastageRangeMin: 2,
    wastageRangeMax: 5,
    rateMin: 5800,
    rateMax: 6800,
    confidenceScore: 74,
    confidenceWhy: ['Project area available', 'Typical structural assumptions available'],
    confidenceImprove: ['Structural drawings', 'Engineer-approved mix design'],
    costSensitivity: [
      { factor: 'Volume', impact: 'high' },
      { factor: 'Concrete grade', impact: 'high' },
      { factor: 'Structural design', impact: 'high' },
      { factor: 'Wastage', impact: 'low' },
      { factor: 'Project changes', impact: 'medium' },
    ],
    relatedMaterialIds: ['cement', 'steel', 'aggregate'],
    importantNote: 'Final concrete grade and volume must be confirmed by the structural engineer.',
  },
  mortar: {
    category: 'Masonry',
    specification: 'Cement-sand mortar for masonry joints and plaster.',
    applications: ['Masonry Joints', 'Plastering'],
    suggestedType: '1:6 (masonry) / 1:4 (plaster) mix',
    usageBreakdown: [
      { label: 'Masonry Joints', percent: 50 },
      { label: 'Plastering', percent: 50 },
    ],
    wastageRangeMin: 5,
    wastageRangeMax: 10,
    rateMin: 3400,
    rateMax: 4200,
    confidenceScore: 74,
    confidenceWhy: ['Wall area available', 'Construction level known'],
    confidenceImprove: ['Detailed BOQ', 'Finish specifications'],
    costSensitivity: [
      { factor: 'Wall area', impact: 'high' },
      { factor: 'Mix ratio', impact: 'medium' },
      { factor: 'Material price', impact: 'medium' },
      { factor: 'Wastage', impact: 'medium' },
      { factor: 'Project changes', impact: 'low' },
    ],
    relatedMaterialIds: ['cement', 'sand', 'aac-blocks'],
    importantNote: 'Final mortar quantity should be confirmed against the approved wall layout and finish specification.',
  },
}

/** The material detail service — screens read through this, never assemble detail data inline. */
export function buildMaterialDetail(
  materialId: MaterialCalcId,
  project: ProjectCalcInput = defaultProjectInput,
  wastageOverridePct?: number,
): MaterialDetail {
  const def = getMaterialDefinition(materialId)
  const meta = MATERIAL_DETAIL_META[materialId]
  const assumptions = { consumptionFactor: def.consumptionFactor, wastagePct: wastageOverridePct ?? def.defaultWastagePct }
  const result = calculateMaterialQuantity(project, def, assumptions)

  return {
    id: def.id,
    name: def.name,
    category: meta.category,
    quantity: result.quantity,
    unit: def.unit,
    minQuantity: result.minQuantity,
    maxQuantity: result.maxQuantity,
    unitRate: def.rate,
    rateMin: meta.rateMin,
    rateMax: meta.rateMax,
    estimatedCost: result.estimatedCost,
    specification: meta.specification,
    applications: meta.applications,
    consumptionFactor: result.consumptionFactor,
    wastage: result.wastage,
    wastageRangeMin: meta.wastageRangeMin,
    wastageRangeMax: meta.wastageRangeMax,
    priceBasis: 'Regional planning estimate',
    location: project.location,
    confidence: def.confidence,
    confidenceScore: meta.confidenceScore,
    confidenceWhy: meta.confidenceWhy,
    confidenceImprove: meta.confidenceImprove,
    usageBreakdown: meta.usageBreakdown,
    costSensitivity: meta.costSensitivity,
    boqItemId: meta.boqItemId,
    relatedMaterialIds: meta.relatedMaterialIds,
    packaging: meta.packaging,
    suggestedType: meta.suggestedType,
    rawQuantity: result.rawQuantity,
    approxWeightMT: result.approxWeightMT,
  }
}

export function getImportantNote(materialId: MaterialCalcId): string {
  return MATERIAL_DETAIL_META[materialId].importantNote
}

export function getRelatedMaterials(detail: MaterialDetail, project: ProjectCalcInput = defaultProjectInput) {
  return detail.relatedMaterialIds.map(id => {
    const def = getMaterialDefinition(id)
    const result = calculateMaterialQuantity(project, def, { consumptionFactor: def.consumptionFactor, wastagePct: def.defaultWastagePct })
    return { id, name: def.name, quantity: result.quantity, unit: def.unit }
  })
}

// ─── BOQ connection ──────────────────────────────────────────────────────────
// Steel maps cleanly onto a single BOQ line item (TMT Reinforcement Steel).
// Every other calculator material is a raw component spread across several
// BOQ work-package items, so there's no single honest line item to point
// to — those instead show how the material's own usage is distributed.

export type MaterialBOQConnection =
  | { type: 'item'; itemId: string; itemName: string; boqQuantity: number; unit: string; boqCost: number; calculatorQuantity: number; difference: number }
  | { type: 'distributed'; categories: { label: string; percent: number }[] }

export function getMaterialBOQConnection(detail: MaterialDetail): MaterialBOQConnection {
  if (detail.boqItemId) {
    const item = getBOQItemById(detail.boqItemId)
    if (item) {
      return {
        type: 'item',
        itemId: item.id,
        itemName: item.name,
        boqQuantity: item.quantity,
        unit: item.unit,
        boqCost: item.totalCost,
        calculatorQuantity: detail.quantity,
        difference: Math.round((detail.quantity - item.quantity) * 100) / 100,
      }
    }
  }
  return { type: 'distributed', categories: detail.usageBreakdown }
}
