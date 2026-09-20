// ─── Estimate Revision — typed data model + calculation service ────────────
// UI demonstration data only — there is no real recalculation backend yet.
// This module is the seam generateEstimateRevision() gets replaced by a real
// pricing/quantity engine; screens must only ever read the revision through
// the functions here, never compute totals inline in a component.
//
// IMPORTANT DATA RULE: only homeowner-approved changes (carried over from
// Screen 068) may enter Estimate V3 — needs-review/low-confidence/
// unapproved plan findings must never be applied automatically. This screen
// only ever produces a DRAFT revision; Estimate V2 is never overwritten, and
// V3 only becomes active after explicit homeowner confirmation.
// Flow: Plan findings → user approval → Estimate V3 draft → review →
// Estimate V3 active → BOQ V4 draft.

import { versionTwo, type EstimateVersion, type VersionAssumptions } from './estimateVersions'
import { boqActiveVersion } from './boqVersionHistory'

export type EstimateRevisionStatus = 'draft' | 'active' | 'superseded'
export type RevisionCategory = 'foundation' | 'structure' | 'masonry' | 'flooring' | 'plastering' | 'painting' | 'electrical' | 'other'

export interface ApprovedChange {
  id: string
  category: RevisionCategory
  label: string
  currentValue: string
  planValue: string
  impact: number
  confidence: number
}

export interface CategoryBreakdownRow {
  category: RevisionCategory
  label: string
  before: number
  after: number
}

export interface EstimateRevision {
  id: string
  projectId: string
  parentEstimateVersionId: string
  versionNumber: number
  planAnalysisId: string
  approvedChanges: ApprovedChange[]
  status: EstimateRevisionStatus
  previousTotal: number
  newTotal: number
  previousRange: { min: number; max: number }
  newRange: { min: number; max: number }
  materialCostBefore: number
  materialCostAfter: number
  labourCostBefore: number
  labourCostAfter: number
  confidenceBefore: number
  confidenceAfter: number
  categoryBreakdown: CategoryBreakdownRow[]
  unchangedCategories: string[]
  assumptions: VersionAssumptions & { planSource: string; boqSource: string; priceBasis: string }
  createdAt: string
}

const CATEGORY_LABELS: Record<RevisionCategory, string> = {
  foundation: 'Foundation',
  structure: 'Structure',
  masonry: 'Masonry',
  flooring: 'Flooring',
  plastering: 'Plastering',
  painting: 'Painting',
  electrical: 'Electrical',
  other: 'Other',
}

export function categoryLabel(category: RevisionCategory): string {
  return CATEGORY_LABELS[category]
}

// ─── Calculation service — kept outside UI components ───────────────────────

export interface RevisionCalculationResult {
  updatedEstimate: number
  updatedRange: { min: number; max: number }
  materialCost: number
  labourCost: number
  costDifference: number
  confidence: number
}

/** Applies a set of already-approved changes on top of the current estimate.
 *  Only ever called with homeowner-approved items — never with raw
 *  needs-review or low-confidence findings. */
export function generateEstimateRevision(
  currentEstimate: EstimateVersion,
  approvedPlanChanges: ApprovedChange[],
  newConfidence: number,
): RevisionCalculationResult {
  const costDifference = approvedPlanChanges.reduce((sum, c) => sum + c.impact, 0)
  return {
    updatedEstimate: currentEstimate.averageCost + costDifference,
    updatedRange: { min: currentEstimate.minCost + costDifference, max: currentEstimate.maxCost + costDifference },
    materialCost: currentEstimate.costBreakdown.materialCost + Math.round(costDifference * 0.75),
    labourCost: currentEstimate.costBreakdown.labourCost + Math.round(costDifference * 0.25),
    costDifference,
    confidence: newConfidence,
  }
}

export function formatLakh(amountRupees: number): string {
  const hundredsOfRupees = Math.round(amountRupees / 1000)
  return `₹${(hundredsOfRupees / 100).toFixed(1)}L`
}

export function formatChange(amountRupees: number): string {
  if (amountRupees === 0) return '₹0'
  const sign = amountRupees > 0 ? '+' : '−'
  const abs = Math.abs(amountRupees)
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`
  return `${sign}₹${abs}`
}

// ─── Demo revision ───────────────────────────────────────────────────────
// Reconciled against real, established data: Estimate V2's min/max/average
// (₹31.4L–₹36.8L, versionTwo.minCost/maxCost) and its own material/labour
// cost breakdown (₹19.1L / ₹8.8L — versionTwo.costBreakdown, summing to the
// ₹27.9L this screen's Cost Summary shows). The 7 approved changes below sum
// to exactly +₹40,000, matching the Update Summary and Hozie's quote; the
// per-category breakdown sums to the same +₹40,000 independently, and its
// V2 column sums to exactly ₹31.4L (Estimate V2's own minCost) — verified
// with a script before committing these figures.

const APPROVED_CHANGES: ApprovedChange[] = [
  { id: 'chg-flooring', category: 'flooring', label: 'Flooring — Floor Area', currentValue: '2,400 sq ft', planValue: '2,440 sq ft', impact: 4600, confidence: 91 },
  { id: 'chg-plastering', category: 'plastering', label: 'Plastering — Wall Area', currentValue: '7,800 sq ft', planValue: '8,050 sq ft', impact: 6500, confidence: 84 },
  { id: 'chg-painting', category: 'painting', label: 'Painting — Paint Area', currentValue: '8,100 sq ft', planValue: '8,350 sq ft', impact: 7500, confidence: 89 },
  { id: 'chg-aac', category: 'masonry', label: 'AAC Blocks Quantity', currentValue: '2,850 nos', planValue: '2,910 nos', impact: 7200, confidence: 88 },
  { id: 'chg-electrical', category: 'electrical', label: 'Electrical Points', currentValue: '78', planValue: '82', impact: 3600, confidence: 72 },
  { id: 'chg-mortar', category: 'masonry', label: 'Cement Mortar Quantity', currentValue: '42 cu.m', planValue: '43.5 cu.m', impact: 3600, confidence: 79 },
  { id: 'chg-blockwork', category: 'masonry', label: 'Masonry — Blockwork Labour', currentValue: '2,850 nos', planValue: '2,910 nos', impact: 7000, confidence: 85 },
]

function buildDemoRevision(planAnalysisId: string, projectId: string): EstimateRevision {
  const current = versionTwo
  const result = generateEstimateRevision(current, APPROVED_CHANGES, 91)

  const categoryV2: Record<RevisionCategory, number> = {
    foundation: 480000,
    structure: 960000,
    masonry: 420000,
    flooring: 280000,
    plastering: 190000,
    painting: 240000,
    electrical: 240000,
    other: 330000,
  }
  const changeByCategory: Record<RevisionCategory, number> = { foundation: 0, structure: 0, masonry: 0, flooring: 0, plastering: 0, painting: 0, electrical: 0, other: 0 }
  for (const c of APPROVED_CHANGES) changeByCategory[c.category] += c.impact

  const categoryBreakdown: CategoryBreakdownRow[] = (Object.keys(categoryV2) as RevisionCategory[]).map(category => ({
    category,
    label: categoryLabel(category),
    before: categoryV2[category],
    after: categoryV2[category] + changeByCategory[category],
  }))

  return {
    id: `rev-${projectId}-v3`,
    projectId,
    parentEstimateVersionId: current.id,
    versionNumber: 3,
    planAnalysisId,
    approvedChanges: APPROVED_CHANGES,
    status: 'draft',
    previousTotal: current.averageCost,
    newTotal: result.updatedEstimate,
    previousRange: { min: current.minCost, max: current.maxCost },
    newRange: result.updatedRange,
    materialCostBefore: current.costBreakdown.materialCost,
    materialCostAfter: result.materialCost,
    labourCostBefore: current.costBreakdown.labourCost,
    labourCostAfter: result.labourCost,
    confidenceBefore: current.confidence,
    confidenceAfter: result.confidence,
    categoryBreakdown,
    unchangedCategories: ['Foundation', 'RCC Structure', 'Doors & Windows', 'Plumbing', 'External Works'],
    assumptions: {
      ...current.assumptions,
      builtUpArea: 2640,
      planSource: 'House_Floor_Plan.pdf',
      boqSource: `BOQ V${boqActiveVersion.versionNumber}`,
      priceBasis: 'Current project reference rates',
    },
    createdAt: '2026-08-15T09:40:00+05:30',
  }
}

/** The revision service — screens must read the draft revision only through
 *  this function. For MVP this returns fixed, internally-consistent demo
 *  data derived via generateEstimateRevision(); a real backend swaps in
 *  here without changing the UI. */
export function getEstimateRevision(planAnalysisId?: string, projectId?: string): EstimateRevision {
  return buildDemoRevision(planAnalysisId || 'analysis-doc-demo-house-floor-plan', projectId || 'proj-001')
}
