// ─── BOQ Edit — typed data model + calculation service ──────────────────────
// UI demonstration data only — no backend yet. This module is the seam a real
// BOQ revision/versioning service replaces. Screens must only ever read
// recalculated numbers through `calculateBOQItem`, never compute them inline.

import type { BOQItem } from './boqDetail'
import type { ConfidenceLevel } from './materials'
import { boqOverview } from './boqOverview'

export type BOQItemScope = 'included' | 'excluded' | 'optional'

export interface BOQItemChanges {
  quantity?: number
  materialRate?: number
  labourCost?: number
  specification?: string
  materialSelection?: string
  scope?: BOQItemScope
}

export interface BOQItemCalculationResult {
  materialCost: number
  labourCost: number
  totalCost: number
  costDifference: number
  percentageDifference: number
  validationWarnings: string[]
  confidence: ConfidenceLevel
}

function round100(n: number): number {
  return Math.round(n / 100) * 100
}

/** The BOQ calculation service — screens read through this, never recompute cost themselves. */
export function calculateBOQItem(item: BOQItem, changes: BOQItemChanges): BOQItemCalculationResult {
  const quantity = changes.quantity ?? item.quantity
  const materialRate = changes.materialRate ?? item.materialRate
  const labourCostInput = changes.labourCost ?? item.labourCost
  const scope = changes.scope ?? 'included'

  const excluded = scope === 'excluded'
  const materialCost = excluded ? 0 : round100(quantity * materialRate)
  const labourCost = excluded ? 0 : Math.max(0, Math.round(labourCostInput))
  const totalCost = materialCost + labourCost

  const costDifference = totalCost - item.totalCost
  const percentageDifference = item.totalCost ? (costDifference / item.totalCost) * 100 : 0

  const validationWarnings: string[] = []
  if (!excluded && item.rateMin != null && item.rateMax != null && (materialRate < item.rateMin || materialRate > item.rateMax)) {
    validationWarnings.push('This rate is significantly different from the regional reference range.')
  }
  if (!excluded && item.quantity > 0) {
    const qtyDeltaPct = Math.abs(quantity - item.quantity) / item.quantity
    if (qtyDeltaPct > 0.15) {
      validationWarnings.push('This quantity is higher than the typical range for this project.')
    }
  }

  const confidence: ConfidenceLevel = excluded ? item.confidence : validationWarnings.length > 0 ? 'medium' : item.confidence

  return { materialCost, labourCost, totalCost, costDifference, percentageDifference, validationWarnings, confidence }
}

// ─── BOQ versions ─────────────────────────────────────────────────────────────

export type BOQVersionStatus = 'draft' | 'active' | 'superseded'

export interface BOQReadinessChecklist {
  estimateLocked: boolean
  boqGenerated: boolean
  boqReviewed: boolean
  planAnalysed: boolean
  structuralDrawings: boolean
  contractorReady: boolean
}

export interface BOQVersion {
  id: string
  projectId: string
  estimateVersionId: string
  versionNumber: number
  parentVersionId: string | null
  status: BOQVersionStatus
  createdAt: string
  createdBy: string
  changeSummary: string
  // Screen 060 (BOQ Version History) extensions — optional so 059's ephemeral
  // draft-creation path doesn't need to populate them.
  totalValue?: number
  materialCost?: number
  labourCost?: number
  itemCount?: number
  confidence?: number
  readiness?: BOQReadinessChecklist
  planVersionId?: string | null
}

export const boqVersionOne: BOQVersion = {
  id: 'boq-v1',
  projectId: boqOverview.projectId,
  estimateVersionId: 'est-v1',
  versionNumber: 1,
  parentVersionId: null,
  status: 'superseded',
  createdAt: '2026-08-05',
  createdBy: 'Hozie AI',
  changeSummary: 'Initial estimate-based BOQ.',
  totalValue: 3380000,
  materialCost: 2100000,
  labourCost: 1280000,
  itemCount: 124,
  confidence: 86,
  readiness: {
    estimateLocked: true,
    boqGenerated: true,
    boqReviewed: false,
    planAnalysed: false,
    structuralDrawings: false,
    contractorReady: false,
  },
  planVersionId: null,
}

export const boqVersionTwo: BOQVersion = {
  id: 'boq-001',
  projectId: boqOverview.projectId,
  estimateVersionId: boqOverview.estimateVersionId,
  versionNumber: 2,
  parentVersionId: boqVersionOne.id,
  status: 'active',
  createdAt: boqOverview.createdAt,
  createdBy: 'Hozie AI',
  changeSummary: 'Regenerated from Estimate Version 2 (built-up area and finishing updated).',
  totalValue: boqOverview.totalValue,
  materialCost: 2112900,
  labourCost: 1297100,
  itemCount: boqOverview.itemCount,
  confidence: boqOverview.confidence,
  readiness: {
    estimateLocked: true,
    boqGenerated: true,
    boqReviewed: true,
    planAnalysed: false,
    structuralDrawings: false,
    contractorReady: false,
  },
  planVersionId: null,
}

/** Builds the next draft BOQ version from a confirmed item revision — does not touch the active version. */
export function createBOQVersionDraft(parent: BOQVersion, changeSummary: string): BOQVersion {
  return {
    id: `boq-v${parent.versionNumber + 1}-draft`,
    projectId: parent.projectId,
    estimateVersionId: parent.estimateVersionId,
    versionNumber: parent.versionNumber + 1,
    parentVersionId: parent.id,
    status: 'draft',
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: 'Homeowner edit',
    changeSummary,
  }
}

// ─── BOQ item revisions ─────────────────────────────────────────────────────

export interface BOQFieldChange {
  field: keyof BOQItemChanges
  label: string
  before: string
  after: string
  changed: boolean
}

export interface BOQItemRevision {
  itemId: string
  boqVersionId: string
  oldValues: BOQItemChanges
  newValues: BOQItemChanges
  changes: BOQFieldChange[]
  materialCostBefore: number
  materialCostAfter: number
  labourCostBefore: number
  labourCostAfter: number
  totalCostBefore: number
  totalCostAfter: number
  reason: string
  status: 'draft' | 'applied'
  createdAt: string
}

export function buildBOQItemRevision(
  item: BOQItem,
  boqVersionId: string,
  oldValues: BOQItemChanges,
  newValues: BOQItemChanges,
  changes: BOQFieldChange[],
  result: BOQItemCalculationResult,
  reason: string,
): BOQItemRevision {
  return {
    itemId: item.id,
    boqVersionId,
    oldValues,
    newValues,
    changes,
    materialCostBefore: item.materialCost,
    materialCostAfter: result.materialCost,
    labourCostBefore: item.labourCost,
    labourCostAfter: result.labourCost,
    totalCostBefore: item.totalCost,
    totalCostAfter: result.totalCost,
    reason,
    status: 'draft',
    createdAt: new Date().toISOString().slice(0, 10),
  }
}
