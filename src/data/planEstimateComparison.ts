// ─── Plan vs Estimate — typed data model + comparison service ──────────────
// UI demonstration data only — there is no real comparison backend yet. This
// module is the seam the real comparePlanWithEstimate() service replaces;
// screens must only ever read the finished comparison through the functions
// here, and only ever compute derived numbers (impact, revised ranges)
// through the calculation functions below — never inline in a component.
//
// IMPORTANT DATA RULE: this screen produces a PROPOSED CHANGE SET only. It
// must never modify the estimate, BOQ, project, or material quantities.
// Only Screen 069 (Estimate Update), after explicit homeowner approval, may
// create the new estimate/BOQ revision. Flow: Analysis → Review → Compare →
// Approve → Apply.

import { getPlanMeasurements } from './planMeasurement'
import { versionTwo, type EstimateVersion } from './estimateVersions'
import { boqActiveVersion } from './boqVersionHistory'
import type { BOQVersion } from './boqEdit'

export type ComparisonStatus = 'matched' | 'review' | 'significant-difference' | 'unavailable'
export type ComparisonCategory = 'project-area' | 'structure' | 'masonry' | 'flooring' | 'plastering' | 'painting' | 'electrical' | 'other'
export type OverallImpactLevel = 'minor' | 'moderate' | 'major'

export interface ComparisonItem {
  id: string
  category: ComparisonCategory
  boqItemId?: string
  label: string
  estimateValue: string
  planValue: string
  unit: string
  difference: string
  rate?: number
  /** Which cost bucket this item's impact belongs to — kept explicit (rather
   *  than inferred from materialImpact/labourImpact > 0) because several
   *  items have a $0 impact but still count toward the "Material Items" /
   *  "Labour Items" summary totals. */
  impactType: 'material' | 'labour'
  materialImpact: number
  labourImpact: number
  totalImpact: number
  confidence: number
  status: ComparisonStatus
  reason?: string
  selected: boolean
}

export interface PlanEstimateComparison {
  id: string
  projectId: string
  planAnalysisId: string
  estimateVersionId: string
  boqVersionId: string
  status: 'loading' | 'comparison-ready' | 'no-differences' | 'error'
  overallConfidence: number
  overallImpact: OverallImpactLevel
  estimateTotal: number
  estimateMin: number
  estimateMax: number
  potentialImpact: number
  materialImpact: number
  labourImpact: number
  affectedItemCount: number
  matchedItemCount: number
  reviewItemCount: number
  significantItemCount: number
  planAreaSqft: number
  estimateAreaSqft: number
  comparisons: ComparisonItem[]
  createdAt: string
}

const CATEGORY_LABELS: Record<ComparisonCategory, string> = {
  'project-area': 'Project Area',
  structure: 'Structure',
  masonry: 'Masonry',
  flooring: 'Flooring',
  plastering: 'Plastering',
  painting: 'Painting',
  electrical: 'Electrical',
  other: 'Other',
}

export function categoryLabel(category: ComparisonCategory): string {
  return CATEGORY_LABELS[category]
}

// ─── Calculation service — kept outside UI components ───────────────────────

export function calculatePotentialImpact(currentValue: number, proposedValue: number, rate: number): number {
  return Math.round((proposedValue - currentValue) * rate)
}

export function calculateRevisedRange(estimateMin: number, estimateMax: number, impact: number): { min: number; max: number } {
  return { min: estimateMin + impact, max: estimateMax + impact }
}

export function formatLakh(amountRupees: number): string {
  const hundredsOfRupees = Math.round(amountRupees / 1000)
  return `₹${(hundredsOfRupees / 100).toFixed(1)}L`
}

export function confidenceLabel(confidence: number): 'High' | 'Medium' | 'Needs review' {
  if (confidence >= 85) return 'High'
  if (confidence >= 60) return 'Medium'
  return 'Needs review'
}

export function statusLabel(status: ComparisonStatus): string {
  switch (status) {
    case 'matched': return 'Matched'
    case 'significant-difference': return 'Significant'
    case 'unavailable': return 'Unavailable'
    default: return 'Review'
  }
}

// ─── Demo comparison ─────────────────────────────────────────────────────
// Every number below reconciles against the real, established data this app
// already uses: built-up area 2,640 (plan) vs 2,600 sq ft (Estimate V2 /
// estimateVersions.ts), cost range ₹31.4L–₹36.8L (versionTwo.minCost/maxCost),
// and BOQ V3 (boqActiveVersion). The 12 affected items' impacts sum to
// exactly +₹42,000 (₹28,000 material + ₹14,000 labour), and the category
// breakdown (Flooring/Plastering/Painting/AAC Blocks/Electrical/Other) sums
// to the same total — verified with a script before committing these figures.

interface ComparisonItemDef extends Omit<ComparisonItem, 'selected'> {}

const AFFECTED_ITEMS: ComparisonItemDef[] = [
  {
    id: 'cmp-project-area', category: 'project-area', label: 'Project Area',
    estimateValue: '2,600 sq ft', planValue: '2,640 sq ft', unit: 'sq ft', difference: '+40 sq ft',
    impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 91, status: 'review',
    reason: 'Plan built-up area is slightly higher than the current estimate assumption.',
  },
  {
    id: 'cmp-structure-slab', category: 'structure', boqItemId: 'rcc-structure-1', label: 'Slab Concrete Volume',
    estimateValue: '620 cu.ft', planValue: '636 cu.ft', unit: 'cu.ft', difference: '+16 cu.ft', rate: 338,
    impactType: 'material', materialImpact: 5400, labourImpact: 0, totalImpact: 5400, confidence: 85, status: 'review',
    reason: 'Slab area scales with the larger detected built-up area.',
  },
  {
    id: 'cmp-structure-column', category: 'structure', boqItemId: 'rcc-structure-1', label: 'Column Concrete Volume',
    estimateValue: '210 cu.ft', planValue: '216 cu.ft', unit: 'cu.ft', difference: '+6 cu.ft', rate: 600,
    impactType: 'material', materialImpact: 3600, labourImpact: 0, totalImpact: 3600, confidence: 82, status: 'review',
    reason: 'Minor increase consistent with the revised floor plate size.',
  },
  {
    id: 'cmp-masonry-aac', category: 'masonry', label: 'AAC Blocks Quantity',
    estimateValue: '2,850 nos', planValue: '2,910 nos', unit: 'nos', difference: '+60 nos', rate: 120,
    impactType: 'material', materialImpact: 7200, labourImpact: 0, totalImpact: 7200, confidence: 88, status: 'review',
    reason: 'Additional wall length detected around the larger floor plate.',
  },
  {
    id: 'cmp-masonry-mortar', category: 'masonry', label: 'Cement Mortar Quantity',
    estimateValue: '42 cu.m', planValue: '43.5 cu.m', unit: 'cu.m', difference: '+1.5 cu.m', rate: 2400,
    impactType: 'material', materialImpact: 3600, labourImpact: 0, totalImpact: 3600, confidence: 79, status: 'review',
    reason: 'Scales with the additional masonry quantity above.',
  },
  {
    id: 'cmp-flooring-area', category: 'flooring', boqItemId: 'flooring-1', label: 'Floor Area',
    estimateValue: '2,400 sq ft', planValue: '2,440 sq ft', unit: 'sq ft', difference: '+40 sq ft', rate: 115,
    impactType: 'material', materialImpact: 4600, labourImpact: 0, totalImpact: 4600, confidence: 91, status: 'review',
    reason: 'Plan floor area is slightly higher than the current estimate assumption.',
  },
  {
    id: 'cmp-flooring-skirting', category: 'flooring', label: 'Skirting Length',
    estimateValue: '180 rft', planValue: '184 rft', unit: 'rft', difference: '+4 rft',
    impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 80, status: 'review',
    reason: 'Small increase — below the threshold for a cost line on its own.',
  },
  {
    id: 'cmp-plastering-wall', category: 'plastering', boqItemId: 'plastering-1', label: 'Wall Plaster Area',
    estimateValue: '7,800 sq ft', planValue: '8,050 sq ft', unit: 'sq ft', difference: '+250 sq ft', rate: 26,
    impactType: 'labour', materialImpact: 0, labourImpact: 6500, totalImpact: 6500, confidence: 84, status: 'significant-difference',
    reason: 'Larger wall surface area detected across the additional floor space.',
  },
  {
    id: 'cmp-plastering-ceiling', category: 'plastering', label: 'Ceiling Plaster Area',
    estimateValue: '2,400 sq ft', planValue: '2,420 sq ft', unit: 'sq ft', difference: '+20 sq ft',
    impactType: 'labour', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 81, status: 'review',
    reason: 'Small increase — below the threshold for a cost line on its own.',
  },
  {
    id: 'cmp-painting-area', category: 'painting', boqItemId: 'painting-1', label: 'Paint Area',
    estimateValue: '8,100 sq ft', planValue: '8,350 sq ft', unit: 'sq ft', difference: '+250 sq ft', rate: 30,
    impactType: 'labour', materialImpact: 0, labourImpact: 7500, totalImpact: 7500, confidence: 89, status: 'significant-difference',
    reason: 'Follows the plastering area increase — paint area scales with wall surface.',
  },
  {
    id: 'cmp-painting-touchup', category: 'painting', label: 'Touch-up Allowance',
    estimateValue: '8,100 sq ft basis', planValue: '8,350 sq ft basis', unit: 'sq ft', difference: '+250 sq ft',
    impactType: 'labour', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 75, status: 'review',
    reason: 'Allowance scales with paint area — no separate cost line yet.',
  },
  {
    id: 'cmp-electrical-points', category: 'electrical', boqItemId: 'electrical-1', label: 'Point Count',
    estimateValue: '78', planValue: '82', unit: 'points', difference: '+4', rate: 900,
    impactType: 'material', materialImpact: 3600, labourImpact: 0, totalImpact: 3600, confidence: 72, status: 'review',
    reason: 'A few additional electrical points inferred from the larger room layout.',
  },
]

const MATCHED_ITEMS: ComparisonItemDef[] = [
  { id: 'cmp-m-site-prep', category: 'other', label: 'Site Preparation', estimateValue: '—', planValue: '—', unit: '', difference: 'No change', impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 90, status: 'matched' },
  { id: 'cmp-m-foundation', category: 'structure', label: 'Foundation', estimateValue: '—', planValue: '—', unit: '', difference: 'No change', impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 88, status: 'matched' },
  { id: 'cmp-m-footing', category: 'structure', label: 'RCC Structure — Footing Concrete', estimateValue: '—', planValue: '—', unit: '', difference: 'No change', impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 87, status: 'matched' },
  { id: 'cmp-m-blockwork-labour', category: 'masonry', label: 'Masonry — Blockwork Labour', estimateValue: '—', planValue: '—', unit: '', difference: 'No change', impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 86, status: 'matched' },
  { id: 'cmp-m-doors-windows', category: 'other', label: 'Doors & Windows', estimateValue: '—', planValue: '—', unit: '', difference: 'No change', impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 90, status: 'matched' },
  { id: 'cmp-m-plumbing', category: 'other', label: 'Plumbing', estimateValue: '—', planValue: '—', unit: '', difference: 'No change', impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 89, status: 'matched' },
  { id: 'cmp-m-fixtures', category: 'other', label: 'Fixtures & Finishing', estimateValue: '—', planValue: '—', unit: '', difference: 'No change', impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 88, status: 'matched' },
  { id: 'cmp-m-external', category: 'other', label: 'External Works', estimateValue: '—', planValue: '—', unit: '', difference: 'No change', impactType: 'material', materialImpact: 0, labourImpact: 0, totalImpact: 0, confidence: 91, status: 'matched' },
]

function buildDemoComparison(documentId: string, projectId: string, estimate: EstimateVersion, boq: BOQVersion): PlanEstimateComparison {
  const measurements = getPlanMeasurements(documentId, projectId)
  const allItems: ComparisonItem[] = [...AFFECTED_ITEMS, ...MATCHED_ITEMS].map(i => ({ ...i, selected: false }))

  const affected = allItems.filter(i => i.status !== 'matched')
  const materialImpact = affected.reduce((sum, i) => sum + i.materialImpact, 0)
  const labourImpact = affected.reduce((sum, i) => sum + i.labourImpact, 0)
  const potentialImpact = materialImpact + labourImpact

  return {
    id: `cmp-${documentId}`,
    projectId,
    planAnalysisId: `analysis-${documentId}`,
    estimateVersionId: estimate.id,
    boqVersionId: boq.id,
    status: 'comparison-ready',
    overallConfidence: 88,
    overallImpact: 'minor',
    estimateTotal: estimate.averageCost,
    estimateMin: estimate.minCost,
    estimateMax: estimate.maxCost,
    potentialImpact,
    materialImpact,
    labourImpact,
    affectedItemCount: affected.length,
    matchedItemCount: allItems.filter(i => i.status === 'matched').length,
    reviewItemCount: affected.filter(i => i.status === 'review').length,
    significantItemCount: affected.filter(i => i.status === 'significant-difference').length,
    planAreaSqft: measurements.builtUpArea.value,
    estimateAreaSqft: estimate.assumptions.builtUpArea,
    comparisons: allItems,
    createdAt: '2026-08-14T11:05:00+05:30',
  }
}

/** The comparison service — screens must read the finished comparison only
 *  through this function (mirrors the future comparePlanWithEstimate()
 *  signature: plan measurements + estimate + BOQ in, a typed comparison
 *  out). For MVP this returns fixed, internally-consistent demo data. */
export function comparePlanWithEstimate(documentId?: string, projectId?: string): PlanEstimateComparison {
  return buildDemoComparison(documentId || 'doc-demo-house-floor-plan', projectId || 'proj-001', versionTwo, boqActiveVersion)
}

export function categorySubtotal(items: ComparisonItem[], category: ComparisonCategory): number {
  return items.filter(i => i.category === category).reduce((sum, i) => sum + i.totalImpact, 0)
}

export const IMPACT_BREAKDOWN_ORDER: { key: string; label: string }[] = [
  { key: 'flooring', label: 'Flooring' },
  { key: 'plastering', label: 'Plastering' },
  { key: 'painting', label: 'Painting' },
  { key: 'masonry-aac', label: 'AAC Blocks' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'other', label: 'Other' },
]

/** Named breakdown lines for the Impact Breakdown card — "AAC Blocks" is
 *  called out on its own (as the brief specifies) even though it's part of
 *  the Masonry category; "Other" absorbs Project Area (₹0), the remaining
 *  Structure items and the remaining Masonry item so the lines still sum to
 *  the same total as `potentialImpact`. */
export function impactBreakdownLines(items: ComparisonItem[]): { label: string; amount: number }[] {
  const flooring = categorySubtotal(items, 'flooring')
  const plastering = categorySubtotal(items, 'plastering')
  const painting = categorySubtotal(items, 'painting')
  const electrical = categorySubtotal(items, 'electrical')
  const aac = items.find(i => i.id === 'cmp-masonry-aac')?.totalImpact ?? 0
  const masonryOther = categorySubtotal(items, 'masonry') - aac
  const structure = categorySubtotal(items, 'structure')
  const projectArea = categorySubtotal(items, 'project-area')
  const other = structure + masonryOther + projectArea
  return [
    { label: 'Flooring', amount: flooring },
    { label: 'Plastering', amount: plastering },
    { label: 'Painting', amount: painting },
    { label: 'AAC Blocks', amount: aac },
    { label: 'Electrical', amount: electrical },
    { label: 'Other', amount: other },
  ]
}
