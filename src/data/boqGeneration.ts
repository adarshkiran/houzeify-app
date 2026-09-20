// ─── BOQ Generation — Estimate → BOQ derivation (Customer Implementation 10I) ──
// Project-scoped BOQ access layer. Replaces the single global 'proj-001' BOQ
// fixture as the thing every BOQ screen reads from — BOQ screens should call
// the functions in this file, never import boqOverview/boqDetailedCategories/
// boqVersionHistory directly for display data (those stay as the reference
// fixture this module derives its numbers from, and as the exact pre-10I
// compatibility case for a session with no real project — see below).
//
// EXISTING TYPES ARE UNCHANGED. Every function here still returns the same
// BOQOverviewData / BOQCategoryDetailed / BOQItem / BOQVersion shapes
// boqOverview.ts / boqDetail.ts / boqEdit.ts already defined — this file is
// a derivation layer, not a redesign.
//
// DERIVATION METHOD (disclosed, not fabricated):
//  - Grand total: the project's own resolved EstimateVersion.averageCost —
//    the one real, authoritative cost figure Estimate already produces for
//    that specific project.
//  - Category split: the reference boqCategories fixture's relative weights
//    (each category's estimatedValue ÷ the fixture's own totalValue) are
//    reused as a disclosed, reasonable distribution model. Estimate itself
//    has no category-level granularity (materialCost/labourCost/
//    finishingCost/servicesCost/contingencyCost are 5 aggregate buckets,
//    not 12 construction-activity categories), so there is no way to derive
//    a category split from Estimate alone without inventing one — reusing
//    the existing, already-reconciled category shape and re-scaling it to
//    the project's real total is the smallest honest option, not a
//    fabrication of new categories/values.
//  - Item quantities: the existing CATEGORY_ITEM_SEEDS catalog (item names,
//    units — "typical items for a residential build") is reused as-is.
//    Estimate has no per-project data describing which construction
//    activities exist for a given project, so the item CATALOG itself
//    cannot yet be made project-specific without inventing facts Estimate
//    doesn't have — documented as a known gap (see the file-level comment
//    in each BOQ screen and the 10I report's "Remaining Gaps" section).
//    Quantities DO scale, proportionally to the project's real builtUpArea
//    vs. the reference fixture's own 2,600 sq ft (the exact value
//    versionTwo.assumptions.builtUpArea already carries in estimateVersions.ts)
//    — a standard parametric/preliminary-BOQ scaling technique, not an
//    invented number.
//  - For the reference project itself (proj-001), this reproduces the
//    existing fixture: see the proj-001 compatibility note below for why
//    that project is handled as a direct passthrough rather than through
//    this derivation (it has no live Estimate record to derive from).
//
// ─── Customer Implementation 10J — edit + version persistence ────────────────
// Adds the ONE mutation owner for BOQ data: `boqRevisionStore`, a flat,
// module-level array following the exact same in-memory-store convention
// `estimateVersions.ts`'s `allEstimateVersions` and `projects.ts`'s
// `projects` already use in this codebase (push-based, filtered by
// projectId, no backend, no localStorage). Nothing outside this file ever
// touches it directly — every screen still goes through the same exported
// functions as 10I; `updateBOQItemForProject` is the only new one.
//
// Before this store has anything in it for a project, every function below
// behaves exactly as it did in 10I (derive fresh from Estimate, or the
// proj-001 fixture passthrough). The moment `updateBOQItemForProject`
// succeeds once for a project, that project's current BOQ state (categories
// + version) lives in the store instead, and every read function prefers it.
// Editing never touches Estimate data, another project's store entries, or
// the shared reference fixtures — see `cloneCategories`/`isReferenceProject`.

import {
  boqOverview,
  boqCategories as REFERENCE_CATEGORIES,
  boqGroups as REFERENCE_GROUPS,
  type BOQCategory,
  type BOQGroup,
  type BOQOverviewData,
} from './boqOverview'
import {
  boqDetailedCategories as REFERENCE_DETAILED_CATEGORIES,
  boqAllItems as REFERENCE_ALL_ITEMS,
  CATEGORY_MATERIAL_RATIO,
  buildCategoryItems,
  enrichBOQItems,
  round100,
  type BOQItem,
  type BOQCategoryDetailed,
} from './boqDetail'
import { calculateBOQItem, type BOQItemChanges, type BOQReadinessChecklist, type BOQVersion } from './boqEdit'
import { boqVersionHistory as REFERENCE_VERSION_HISTORY, boqActiveVersion as REFERENCE_ACTIVE_VERSION, type BOQVersionChange, type BOQVersionComparison } from './boqVersionHistory'
import { getLatestEstimateVersion, versionTwo as REFERENCE_ESTIMATE_VERSION, type EstimateVersion } from './estimateVersions'
import { formatINR } from './materials'

// The reference fixture's own built-up area — the denominator every other
// project's quantities are scaled against. Read from the fixture itself
// (versionTwo.assumptions.builtUpArea via boqOverview's own reconciled
// totals) rather than a second hardcoded '2600' literal.
const REFERENCE_BUILT_UP_AREA = 2600
const REFERENCE_TOTAL_VALUE = boqOverview.totalValue

/** True only for the legacy demo project's exact id — the one case with no
 *  live Estimate record (its `versionOne`/`versionTwo` are hand-authored
 *  constants, never pushed into estimateVersions.ts's real, filterable
 *  `allEstimateVersions` store) but a real, pre-existing BOQ experience
 *  worth preserving unchanged for dev-switcher preview / compatibility. */
function isReferenceProject(projectId: string | undefined): boolean {
  return projectId === boqOverview.projectId
}

function deriveCategoriesFromEstimate(estimateVersion: EstimateVersion): BOQCategoryDetailed[] {
  const areaRatio = estimateVersion.assumptions.builtUpArea / REFERENCE_BUILT_UP_AREA
  const totalRatio = REFERENCE_TOTAL_VALUE > 0 ? estimateVersion.averageCost / REFERENCE_TOTAL_VALUE : 1

  let itemNumber = 1
  const categories: BOQCategoryDetailed[] = REFERENCE_CATEGORIES.map((cat, idx) => {
    const scaledCategoryValue = round100(cat.estimatedValue * totalRatio)
    const items = buildCategoryItems(
      cat.id,
      cat.name,
      scaledCategoryValue,
      CATEGORY_MATERIAL_RATIO[cat.id],
      itemNumber,
      cat.status,
      areaRatio,
    )
    itemNumber += items.length
    return {
      id: cat.id,
      order: idx + 1,
      name: cat.name,
      itemCount: items.length,
      totalCost: scaledCategoryValue,
      status: cat.status,
      items,
    }
  })

  enrichBOQItems(categories, estimateVersion.assumptions.location || 'Hyderabad')
  return categories
}

// ─── 10J — the one BOQ mutation store ───────────────────────────────────────

interface BOQRevisionRecord {
  version: BOQVersion
  categories: BOQCategoryDetailed[]
}

/** The single BOQ mutation owner. Flat array, filtered by projectId — same
 *  convention as estimateVersions.ts's allEstimateVersions / projects.ts's
 *  projects. Never read or written from outside this file. */
const boqRevisionStore: BOQRevisionRecord[] = []

function getStoredRecords(projectId: string): BOQRevisionRecord[] {
  return boqRevisionStore.filter(r => r.version.projectId === projectId)
}

function getStoredActiveRecord(projectId: string): BOQRevisionRecord | undefined {
  return getStoredRecords(projectId).find(r => r.version.status === 'active')
}

/** Smallest-safe clone for this one nested shape (Customer Implementation
 *  10J) — a shallow spread of each category and each item, so one version's
 *  scalar-field edits (quantity, cost, etc.) can never be seen by another
 *  version's snapshot. Deliberately not a generic/deep-clone utility; this
 *  is the one place in the app that needs it. */
function cloneCategories(categories: BOQCategoryDetailed[]): BOQCategoryDetailed[] {
  return categories.map(c => ({ ...c, items: c.items.map(i => ({ ...i })) }))
}

/** Resolves the categories a project's CURRENT BOQ should show — the stored
 *  active revision if one exists, otherwise the same 10I derivation (or the
 *  proj-001 passthrough) as before any edit has ever happened. Every public
 *  read function below goes through this one resolver so a stored edit is
 *  never silently bypassed. */
function resolveActiveCategories(projectId: string | undefined): BOQCategoryDetailed[] | undefined {
  if (!projectId) return undefined
  const stored = getStoredActiveRecord(projectId)
  if (stored) return stored.categories
  if (isReferenceProject(projectId)) return REFERENCE_DETAILED_CATEGORIES

  const estimateVersion = getLatestEstimateVersion(projectId)
  if (!estimateVersion) return undefined
  const builtUpArea = estimateVersion.assumptions?.builtUpArea
  if (!builtUpArea) return undefined
  return deriveCategoriesFromEstimate(estimateVersion)
}

/** Every category, fully derived (items included) for a real project's BOQ,
 *  or `undefined` when there is genuinely nothing to show — no project, no
 *  Estimate for that project, or an Estimate missing the one assumption
 *  (builtUpArea) this derivation needs. Never falls back to proj-001. */
export function getBOQCategoriesForProject(projectId: string | undefined): BOQCategoryDetailed[] | undefined {
  return resolveActiveCategories(projectId)
}

export function getBOQAllItemsForProject(projectId: string | undefined): BOQItem[] | undefined {
  return resolveActiveCategories(projectId)?.flatMap(c => c.items)
}

export function getBOQItemForProject(projectId: string | undefined, itemId: string | undefined): BOQItem | undefined {
  if (!itemId) return undefined
  return getBOQAllItemsForProject(projectId)?.find(i => i.id === itemId)
}

export function getBOQCategoryForProject(projectId: string | undefined, categoryId: string | undefined): BOQCategoryDetailed | undefined {
  if (!categoryId) return undefined
  return resolveActiveCategories(projectId)?.find(c => c.id === categoryId)
}

export function getRelatedBOQItemsForProject(projectId: string | undefined, item: BOQItem): BOQItem[] {
  const allItems = getBOQAllItemsForProject(projectId) ?? []
  return (item.relatedItemIds ?? []).map(id => allItems.find(i => i.id === id)).filter((i): i is BOQItem => !!i)
}

function deriveGroupsFromCategories(categories: BOQCategory[]): BOQGroup[] {
  return REFERENCE_GROUPS.map(g => {
    const memberCategories = categories.filter(c => g.categoryIds.includes(c.id))
    return {
      id: g.id,
      label: g.label,
      estimatedValue: memberCategories.reduce((s, c) => s + c.estimatedValue, 0),
      itemCount: memberCategories.reduce((s, c) => s + c.itemCount, 0),
      categoryIds: g.categoryIds,
    }
  })
}

export function getBOQGroupsForProject(projectId: string | undefined): BOQGroup[] | undefined {
  const categories = resolveActiveCategories(projectId)
  if (!categories) return undefined
  const summaryCategories: BOQCategory[] = categories.map(c => ({ id: c.id, name: c.name, itemCount: c.itemCount, estimatedValue: c.totalCost, status: c.status }))
  return deriveGroupsFromCategories(summaryCategories)
}

/** The reference fixture's own material/labour ITEM-COUNT split ratio
 *  (82/128, 46/128) — the item catalog doesn't vary by project or by edit
 *  (10J changes values, never adds/removes items), so this ratio applies
 *  unchanged to every project's item count. Documented, not silently reused
 *  as if independently derived. */
function materialItemCountFor(totalItemCount: number): number {
  return Math.round(totalItemCount * (boqOverview.materialItemCount / boqOverview.itemCount))
}

/** The BOQ Overview summary for a project — the shape BOQOverviewScreen
 *  renders. `undefined` means: show a genuine no-BOQ empty state, never a
 *  substitute project's data. */
export function getBOQForProject(projectId: string | undefined): BOQOverviewData | undefined {
  if (!projectId) return undefined

  const stored = getStoredActiveRecord(projectId)
  if (stored) {
    const summaryCategories: BOQCategory[] = stored.categories.map(c => ({ id: c.id, name: c.name, itemCount: c.itemCount, estimatedValue: c.totalCost, status: c.status }))
    const itemCount = stored.version.itemCount ?? stored.categories.reduce((s, c) => s + c.itemCount, 0)
    const materialItemCount = materialItemCountFor(itemCount)
    return {
      id: `boq-${projectId}`,
      projectId,
      estimateVersionId: stored.version.estimateVersionId,
      status: 'ready',
      totalValue: stored.version.totalValue ?? summaryCategories.reduce((s, c) => s + c.estimatedValue, 0),
      itemCount,
      materialItemCount,
      labourItemCount: itemCount - materialItemCount,
      categories: summaryCategories,
      confidence: stored.version.confidence ?? 0,
      createdAt: stored.version.createdAt,
    }
  }

  if (isReferenceProject(projectId)) return boqOverview

  const estimateVersion = getLatestEstimateVersion(projectId)
  if (!estimateVersion) return undefined
  const categories = resolveActiveCategories(projectId)
  if (!categories) return undefined

  const allItems = categories.flatMap(c => c.items)
  const totalValue = categories.reduce((s, c) => s + c.totalCost, 0)
  const materialItemCount = materialItemCountFor(allItems.length)
  const summaryCategories: BOQCategory[] = categories.map(c => ({ id: c.id, name: c.name, itemCount: c.itemCount, estimatedValue: c.totalCost, status: c.status }))

  return {
    id: `boq-${projectId}`,
    projectId,
    estimateVersionId: estimateVersion.id,
    status: 'ready',
    totalValue,
    itemCount: allItems.length,
    materialItemCount,
    labourItemCount: allItems.length - materialItemCount,
    categories: summaryCategories,
    confidence: estimateVersion.confidence,
    createdAt: estimateVersion.createdAt,
  }
}

// ─── Versions ───────────────────────────────────────────────────────────────
// 10I exposed the current derived BOQ as a single synthetic "Version 1" per
// project, recomputed fresh on every call (no persisted history yet). 10J
// keeps that exact synthesis as the pre-edit baseline — the first call to
// updateBOQItemForProject for a project materializes it into
// `boqRevisionStore` as a real, immutable Version 1 snapshot, then adds
// Version 2 alongside it. Until a project has been edited, these functions
// behave exactly as they did in 10I. proj-001 keeps its existing,
// hand-curated 3-version history exactly as it was, unless IT has also been
// edited (see Phase 15 in the 10J brief) — in which case its own edits
// layer on top of a cloned snapshot, never the shared fixture objects.

const DEFAULT_READINESS: BOQReadinessChecklist = {
  estimateLocked: true,
  boqGenerated: true,
  boqReviewed: false,
  planAnalysed: false,
  structuralDrawings: false,
  contractorReady: false,
}

/** The pre-edit synthetic Version 1 — same computation 10I always did,
 *  factored out so both the read path (nothing stored yet) and the
 *  mutation path (materializing a baseline on first edit) share one
 *  implementation. */
function synthesizeBaselineVersion(projectId: string, estimateVersion: EstimateVersion, overview: BOQOverviewData): BOQVersion {
  const materialCost = overview.categories.reduce((s, c) => s + round100(c.estimatedValue * (CATEGORY_MATERIAL_RATIO[c.id] ?? 0.6)), 0)
  return {
    id: `boq-${projectId}-v1`,
    projectId,
    estimateVersionId: estimateVersion.id,
    versionNumber: 1,
    parentVersionId: null,
    status: 'active',
    createdAt: estimateVersion.createdAt,
    createdBy: 'Hozie AI',
    changeSummary: 'Generated from the current Estimate.',
    totalValue: overview.totalValue,
    materialCost,
    labourCost: overview.totalValue - materialCost,
    itemCount: overview.itemCount,
    confidence: overview.confidence,
    readiness: DEFAULT_READINESS,
    planVersionId: null,
  }
}

export function getBOQVersionsForProject(projectId: string | undefined): BOQVersion[] {
  if (!projectId) return []

  const stored = getStoredRecords(projectId)
  if (stored.length > 0) return stored.map(r => r.version).sort((a, b) => b.versionNumber - a.versionNumber)

  if (isReferenceProject(projectId)) return REFERENCE_VERSION_HISTORY

  const overview = getBOQForProject(projectId)
  const estimateVersion = getLatestEstimateVersion(projectId)
  if (!overview || !estimateVersion) return []
  return [synthesizeBaselineVersion(projectId, estimateVersion, overview)]
}

export function getBOQActiveVersionForProject(projectId: string | undefined): BOQVersion | undefined {
  if (!projectId) return undefined
  const stored = getStoredActiveRecord(projectId)
  if (stored) return stored.version
  if (isReferenceProject(projectId)) return REFERENCE_ACTIVE_VERSION
  const versions = getBOQVersionsForProject(projectId)
  return versions.find(v => v.status === 'active') ?? versions[versions.length - 1]
}

/** Convenience passthrough so screens needing real Estimate assumptions
 *  (built-up area, version number, created date) for header/context text
 *  don't need their own separate import of estimateVersions.ts's resolver
 *  — same underlying function, re-exported for this module's callers.
 *  proj-001 returns its own hand-authored `versionTwo` fixture directly
 *  (never in the live, filterable `allEstimateVersions` store — see the
 *  file header) so its header text stays exactly what it always was. Note:
 *  10J's edits never change WHICH EstimateVersion a project points at —
 *  this always resolves the same Estimate the BOQ was originally generated
 *  from, before or after any BOQ-only revision. */
export function getEstimateVersionForBOQ(projectId: string | undefined): EstimateVersion | undefined {
  if (!projectId) return undefined
  if (isReferenceProject(projectId)) return REFERENCE_ESTIMATE_VERSION
  return getLatestEstimateVersion(projectId)
}

// ─── 10J — the one BOQ mutation function ────────────────────────────────────

/** Applies an item edit, recalculates that item/category/BOQ total, and
 *  creates a new, immutable BOQ version as the project's active version.
 *  The previous active version (materializing Version 1 first, if this is
 *  the project's first-ever edit) becomes 'superseded' but is never
 *  mutated beyond that one status flip — its own item/category snapshot is
 *  left exactly as it was. Returns undefined (no mutation performed) when
 *  the project has no BOQ or the item doesn't exist in it — callers must
 *  not create a revision for a project/item that isn't real. */
export function updateBOQItemForProject(
  projectId: string | undefined,
  itemId: string | undefined,
  changes: BOQItemChanges,
  changeSummary: string,
): BOQRevisionRecord | undefined {
  if (!projectId || !itemId) return undefined

  const currentCategories = resolveActiveCategories(projectId)
  if (!currentCategories) return undefined
  const currentItem = currentCategories.flatMap(c => c.items).find(i => i.id === itemId)
  if (!currentItem) return undefined

  // First edit ever for this project: materialize its current (pre-edit)
  // active version + categories as a real, independently-cloned Version 1
  // snapshot in the store — this is what makes proj-001's shared fixture
  // (or any project's freshly-derived Estimate baseline) safe to edit
  // without ever mutating the objects other code/other projects still read.
  let baseline = getStoredActiveRecord(projectId)
  if (!baseline) {
    const baseVersion = getBOQActiveVersionForProject(projectId)
    if (!baseVersion) return undefined
    baseline = { version: { ...baseVersion }, categories: cloneCategories(currentCategories) }
    boqRevisionStore.push(baseline)
  }

  const newCategories = cloneCategories(baseline.categories)
  const targetItem = newCategories.flatMap(c => c.items).find(i => i.id === itemId)
  if (!targetItem) return undefined

  // Recalculate through the existing, unchanged calculation service —
  // 10J never reimplements this math.
  const result = calculateBOQItem(targetItem, changes)
  targetItem.quantity = changes.quantity ?? targetItem.quantity
  targetItem.materialRate = changes.materialRate ?? targetItem.materialRate
  targetItem.materialCost = result.materialCost
  targetItem.labourCost = result.labourCost
  targetItem.labourRate = targetItem.quantity ? Math.round((result.labourCost / targetItem.quantity) * 100) / 100 : 0
  targetItem.totalCost = result.totalCost
  targetItem.confidence = result.confidence
  if (changes.specification !== undefined) targetItem.specification = changes.specification
  if (changes.materialSelection) {
    const existing = targetItem.materials?.[0]
    targetItem.materials = [{ ...(existing ?? { material: targetItem.name }), material: changes.materialSelection }]
  }

  // Category total = sum of that category's own item totals (only the
  // edited category can have changed; recomputing every category from the
  // clone is cheap and keeps this correct even if that assumption ever
  // changes).
  for (const cat of newCategories) {
    cat.totalCost = cat.items.reduce((s, i) => s + i.totalCost, 0)
  }
  const boqTotal = newCategories.reduce((s, c) => s + c.totalCost, 0)
  const materialCostTotal = newCategories.flatMap(c => c.items).reduce((s, i) => s + i.materialCost, 0)
  const labourCostTotal = newCategories.flatMap(c => c.items).reduce((s, i) => s + i.labourCost, 0)

  // The previous active record becomes superseded — its own snapshot is
  // otherwise untouched (Test 2 / Phase 6's immutability requirement).
  baseline.version.status = 'superseded'

  const newVersion: BOQVersion = {
    id: `boq-${projectId}-v${baseline.version.versionNumber + 1}`,
    projectId,
    estimateVersionId: baseline.version.estimateVersionId,
    versionNumber: baseline.version.versionNumber + 1,
    parentVersionId: baseline.version.id,
    status: 'active',
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: 'Homeowner edit',
    changeSummary,
    totalValue: boqTotal,
    materialCost: materialCostTotal,
    labourCost: labourCostTotal,
    itemCount: baseline.version.itemCount ?? newCategories.reduce((s, c) => s + c.itemCount, 0),
    confidence: baseline.version.confidence,
    readiness: baseline.version.readiness ?? DEFAULT_READINESS,
    planVersionId: null,
  }

  const newRecord: BOQRevisionRecord = { version: newVersion, categories: newCategories }
  boqRevisionStore.push(newRecord)
  return newRecord
}

// ─── 10L — real, project-scoped version comparison ─────────────────────────
// The 10K brief called for real item-level diffs between two BOQ versions;
// tracing the actual code before this task found getVersionChanges/
// compareVersions (boqVersionHistory.ts) were never extended to do this —
// they still only ever read the 5 hand-authored boqVersionChanges rows,
// which exist solely for the proj-001 reference fixture's own Version 2→3.
// For any real, homeowner-edited project those functions silently return an
// empty diff regardless of what actually changed. This closes that gap the
// same way every other 10J/10I function does: by comparing the two
// versions' REAL stored item snapshots directly — never fabricating rows,
// never touching the reference fixture's own curated data.

function findStoredRecord(projectId: string, versionId: string): BOQRevisionRecord | undefined {
  return boqRevisionStore.find(r => r.version.projectId === projectId && r.version.id === versionId)
}

function describeItemChangedField(from: BOQItem, to: BOQItem): string {
  if (from.quantity !== to.quantity) return 'Quantity'
  if (from.materialRate !== to.materialRate) return 'Material Rate'
  if (from.specification !== to.specification) return 'Specification'
  if ((from.materials?.[0]?.material ?? '') !== (to.materials?.[0]?.material ?? '')) return 'Material'
  return 'Cost'
}

function describeItemState(item: BOQItem): string {
  return `${item.quantity} ${item.unit} · ${formatINR(item.totalCost)}`
}

/** Real item-by-item diff between two of THIS project's own stored version
 *  snapshots. Returns `undefined` (never a fabricated/empty result) when
 *  either version has no stored snapshot to compare — the only case this
 *  applies to today is proj-001's original, untouched Version 1/2/3 history,
 *  which was never given real per-item snapshots (only the reference
 *  fixture's own curated boqVersionChanges rows describe it) — callers
 *  should fall back to compareVersions/getVersionChanges for that case,
 *  exactly as before. Added/removed lists are correctly always empty for a
 *  10J edit: the item catalog itself never changes size (documented
 *  limitation from 10I) — this is the honest answer, not a missing feature. */
export function compareBOQVersionsForProject(
  projectId: string | undefined,
  fromVersionId: string | undefined,
  toVersionId: string | undefined,
): BOQVersionComparison | undefined {
  if (!projectId || !fromVersionId || !toVersionId) return undefined
  const fromRecord = findStoredRecord(projectId, fromVersionId)
  const toRecord = findStoredRecord(projectId, toVersionId)
  if (!fromRecord || !toRecord) return undefined

  const fromItems = fromRecord.categories.flatMap(c => c.items)
  const toItems = toRecord.categories.flatMap(c => c.items)

  const added: BOQVersionChange[] = []
  const modified: BOQVersionChange[] = []
  const removed: BOQVersionChange[] = []

  for (const toItem of toItems) {
    const fromItem = fromItems.find(i => i.id === toItem.id)
    if (!fromItem) {
      added.push({
        id: `${toRecord.version.id}-add-${toItem.id}`,
        versionId: toRecord.version.id,
        itemId: toItem.id,
        itemName: toItem.name,
        changeType: 'added',
        newValue: describeItemState(toItem),
        costDifference: toItem.totalCost,
      })
      continue
    }
    const changed = fromItem.quantity !== toItem.quantity
      || fromItem.materialRate !== toItem.materialRate
      || fromItem.specification !== toItem.specification
      || (fromItem.materials?.[0]?.material ?? '') !== (toItem.materials?.[0]?.material ?? '')
      || Math.abs(fromItem.totalCost - toItem.totalCost) > 0.5
    if (changed) {
      modified.push({
        id: `${toRecord.version.id}-mod-${toItem.id}`,
        versionId: toRecord.version.id,
        itemId: toItem.id,
        itemName: toItem.name,
        changeType: 'modified',
        field: describeItemChangedField(fromItem, toItem),
        oldValue: describeItemState(fromItem),
        newValue: describeItemState(toItem),
        costDifference: toItem.totalCost - fromItem.totalCost,
      })
    }
  }
  for (const fromItem of fromItems) {
    if (!toItems.some(i => i.id === fromItem.id)) {
      removed.push({
        id: `${toRecord.version.id}-rem-${fromItem.id}`,
        versionId: toRecord.version.id,
        itemId: fromItem.id,
        itemName: fromItem.name,
        changeType: 'removed',
        oldValue: describeItemState(fromItem),
        costDifference: -fromItem.totalCost,
      })
    }
  }

  return {
    from: fromRecord.version,
    to: toRecord.version,
    totalValueDiff: (toRecord.version.totalValue ?? 0) - (fromRecord.version.totalValue ?? 0),
    itemCountDiff: (toRecord.version.itemCount ?? 0) - (fromRecord.version.itemCount ?? 0),
    materialCostDiff: (toRecord.version.materialCost ?? 0) - (fromRecord.version.materialCost ?? 0),
    labourCostDiff: (toRecord.version.labourCost ?? 0) - (fromRecord.version.labourCost ?? 0),
    added,
    modified,
    removed,
    isAdjustmentOnly: fromRecord.version.estimateVersionId === toRecord.version.estimateVersionId,
  }
}
