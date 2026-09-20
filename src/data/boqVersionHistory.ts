// ─── BOQ Version History — typed data model + service ───────────────────────
// UI demonstration data only — no backend yet. This module is the seam a real
// BOQ versioning/audit-trail service replaces. Screens must only ever read
// version and change data through the exports/helpers here, never recompute
// diffs inline.
//
// NOTE ON NUMBERS: Version 2's totalValue/itemCount/confidence are the real,
// reconciled figures from `boqOverview`/`boqDetail` (the same 128-item BOQ
// used by screens 056-059) — material/labour cost is the item-level sum of
// all 128 items (not the Estimate's own cost-breakdown split, which uses a
// different denominator elsewhere in the app). Version 3 is a curated
// successor built from concrete, traceable changes (see `boqVersionChanges`
// below) so its totals reconcile exactly to Version 2 + those changes,
// rather than the brief's illustrative (and not internally consistent)
// example figures.

import { boqOverview } from './boqOverview'
import { boqVersionOne, boqVersionTwo, type BOQVersion, type BOQReadinessChecklist } from './boqEdit'

export type BOQChangeType = 'added' | 'modified' | 'removed'

export interface BOQVersionChange {
  id: string
  versionId: string
  itemId: string
  itemName: string
  changeType: BOQChangeType
  field?: string
  oldValue?: string
  newValue?: string
  costDifference: number
}

const v3Readiness: BOQReadinessChecklist = {
  estimateLocked: true,
  boqGenerated: true,
  boqReviewed: true,
  planAnalysed: false,
  structuralDrawings: false,
  contractorReady: false,
}

export const boqVersionThree: BOQVersion = {
  id: 'boq-v3',
  projectId: boqOverview.projectId,
  estimateVersionId: boqOverview.estimateVersionId, // same estimate as V2 — BOQ adjustment only
  versionNumber: 3,
  parentVersionId: boqVersionTwo.id,
  status: 'active',
  createdAt: '2026-08-14',
  createdBy: 'Homeowner edit',
  changeSummary: 'Adjusted TMT reinforcement quantity and Beam casting labour rate; added 3 reinforcement accessory items.',
  totalValue: 3435100,
  materialCost: 2126800,
  labourCost: 1308300,
  itemCount: 131,
  confidence: 90,
  readiness: v3Readiness,
  planVersionId: null,
}

/** Presentational history list — newest first. V2 is overridden to 'superseded' here only;
 *  the shared `boqVersionTwo` export used by Screen 059 is left untouched. */
export const boqVersionHistory: BOQVersion[] = [
  boqVersionThree,
  { ...boqVersionTwo, status: 'superseded' },
  boqVersionOne,
]

export const boqActiveVersion: BOQVersion = boqVersionThree

export const boqVersionChanges: BOQVersionChange[] = [
  {
    id: 'chg-1',
    versionId: boqVersionThree.id,
    itemId: 'rcc-structure-1',
    itemName: 'TMT Reinforcement Steel',
    changeType: 'modified',
    field: 'Quantity',
    oldValue: '4.8 MT',
    newValue: '5.2 MT',
    costDifference: 4100,
  },
  {
    id: 'chg-2',
    versionId: boqVersionThree.id,
    itemId: 'rcc-structure-6',
    itemName: 'Beam casting',
    changeType: 'modified',
    field: 'Labour rate',
    oldValue: '₹17,400',
    newValue: '₹20,400',
    costDifference: 3000,
  },
  {
    id: 'chg-3',
    versionId: boqVersionThree.id,
    itemId: 'rcc-structure-21',
    itemName: 'Rebar chairs & spacers',
    changeType: 'added',
    newValue: '₹8,000',
    costDifference: 8000,
  },
  {
    id: 'chg-4',
    versionId: boqVersionThree.id,
    itemId: 'rcc-structure-22',
    itemName: 'Additional tie wire',
    changeType: 'added',
    newValue: '₹6,000',
    costDifference: 6000,
  },
  {
    id: 'chg-5',
    versionId: boqVersionThree.id,
    itemId: 'rcc-structure-23',
    itemName: 'Reinforcement inspection & testing',
    changeType: 'added',
    newValue: '₹4,000',
    costDifference: 4000,
  },
]

export function getBOQVersionById(id: string): BOQVersion | undefined {
  return boqVersionHistory.find(v => v.id === id)
}

export function getParentVersion(version: BOQVersion): BOQVersion | undefined {
  return version.parentVersionId ? getBOQVersionById(version.parentVersionId) : undefined
}

export function getVersionChanges(versionId: string): BOQVersionChange[] {
  return boqVersionChanges.filter(c => c.versionId === versionId)
}

export interface BOQVersionComparison {
  from: BOQVersion
  to: BOQVersion
  totalValueDiff: number
  itemCountDiff: number
  materialCostDiff: number
  labourCostDiff: number
  added: BOQVersionChange[]
  modified: BOQVersionChange[]
  removed: BOQVersionChange[]
  isAdjustmentOnly: boolean
}

/** The comparison service — screens read the diff through this, never recompute it themselves. */
export function compareVersions(from: BOQVersion, to: BOQVersion): BOQVersionComparison {
  const changes = getVersionChanges(to.id)
  return {
    from,
    to,
    totalValueDiff: (to.totalValue ?? 0) - (from.totalValue ?? 0),
    itemCountDiff: (to.itemCount ?? 0) - (from.itemCount ?? 0),
    materialCostDiff: (to.materialCost ?? 0) - (from.materialCost ?? 0),
    labourCostDiff: (to.labourCost ?? 0) - (from.labourCost ?? 0),
    added: changes.filter(c => c.changeType === 'added'),
    modified: changes.filter(c => c.changeType === 'modified'),
    removed: changes.filter(c => c.changeType === 'removed'),
    isAdjustmentOnly: from.estimateVersionId === to.estimateVersionId,
  }
}
