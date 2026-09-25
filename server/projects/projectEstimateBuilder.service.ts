// ─── Estimate Builder service — S27 ────────────────────────────────────────
// Editable items on the current draft version, version forking (immutable
// prior versions), S26 price resolve → rate snapshot, and customer share
// pinned to a specific version. No BOQ / lock / acceptance workflows.

import { and, asc, desc, eq, max } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  estimateItems,
  estimateVersions,
  estimates,
  organizations,
  type EstimateItemRow,
  type EstimateRow,
} from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import {
  resolveOrganizationPrice,
  snapshotResolvedRateForEstimate,
} from '../pricing/priceIntelligence.service.js'
import {
  BoqNumberError,
  computeAmountPaise,
  quantityToMilli,
  rateToPaise,
} from './boqMoney.js'
import { requireCompanyOrCustomerRead, requireProjectAccess, requireProjectMutation } from './projectAccess.js'
import {
  getEstimateForProject,
  customerLabelForUser,
  versionNumberFor,
} from './projectEstimates.service.js'
import {
  buildEstimateSummary,
  serializeEstimateItem,
  serializeEstimateListItem,
  serializeEstimateVersion,
  toCustomerEstimateItem,
  type CreateEstimateItemInput,
  type CustomerEstimateDto,
  type EstimateDetailDto,
  type EstimateItemDto,
  type EstimateVersionDto,
  type PatchEstimateItemInput,
  type ShareEstimateInput,
} from './projectEstimates.types.js'

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function moneyError(err: unknown): never {
  if (err instanceof BoqNumberError) {
    const messages: Record<string, string> = {
      INVALID_QUANTITY: 'Quantity must be a positive number with at most 3 decimal places.',
      INVALID_RATE: 'Rate must be a non-negative number with at most 2 decimal places.',
      AMOUNT_TOO_LARGE: 'Line amount is too large.',
    }
    throw new HttpError(err.code, messages[err.code] || err.message, 400)
  }
  throw err
}

async function loadEstimateRow(
  env: Env,
  projectId: string,
  estimateId: string,
): Promise<EstimateRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(estimates)
    .where(and(eq(estimates.id, estimateId), eq(estimates.projectId, projectId)))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Estimate not found.', 404)
  return row
}

async function requireMutableCurrentVersion(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
): Promise<{ project: Awaited<ReturnType<typeof requireProjectAccess>>; estimate: EstimateRow; versionId: string }> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)
  const estimate = await loadEstimateRow(env, projectId, estimateId)
  if (estimate.status === 'locked') {
    throw new HttpError(
      'ESTIMATE_LOCKED',
      'This estimate is locked. Create a new version to make changes.',
      409,
    )
  }
  if (!estimate.currentVersionId) {
    throw new HttpError('NO_CURRENT_VERSION', 'Estimate has no current version.', 400)
  }
  return { project, estimate, versionId: estimate.currentVersionId }
}

function computeLineAmount(
  quantityMilli: number | null,
  ratePaise: number | null,
): number | null {
  if (quantityMilli == null || ratePaise == null) return null
  try {
    return computeAmountPaise(quantityMilli, ratePaise)
  } catch (err) {
    moneyError(err)
  }
}

async function itemsForVersion(env: Env, versionId: string): Promise<EstimateItemRow[]> {
  const db = getDb(env)
  return db
    .select()
    .from(estimateItems)
    .where(eq(estimateItems.estimateVersionId, versionId))
    .orderBy(asc(estimateItems.sortOrder), asc(estimateItems.createdAt))
}

function totalPaiseFromRows(rows: EstimateItemRow[]): number | null {
  let sum = 0
  let any = false
  for (const row of rows) {
    if (row.amountPaise != null) {
      any = true
      sum += row.amountPaise
    }
  }
  return any ? sum : null
}

async function versionExtras(env: Env, versionId: string): Promise<{ itemCount: number; totalAmountPaise: number | null }> {
  const rows = await itemsForVersion(env, versionId)
  return { itemCount: rows.length, totalAmountPaise: totalPaiseFromRows(rows) }
}

export async function listEstimateVersions(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
): Promise<EstimateVersionDto[]> {
  await requireProjectAccess(env, projectId, userId)
  await loadEstimateRow(env, projectId, estimateId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(estimateVersions)
    .where(eq(estimateVersions.estimateId, estimateId))
    .orderBy(desc(estimateVersions.versionNumber))
  const out: EstimateVersionDto[] = []
  for (const row of rows) {
    const extras = await versionExtras(env, row.id)
    out.push(serializeEstimateVersion(row, extras))
  }
  return out
}

export async function getEstimateBuilderDetail(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
  opts?: { versionId?: string },
): Promise<EstimateDetailDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  const estimate = await loadEstimateRow(env, projectId, estimateId)
  const db = getDb(env)

  const versionId = opts?.versionId || estimate.currentVersionId
  if (!versionId) {
    throw new HttpError('NO_CURRENT_VERSION', 'Estimate has no current version.', 400)
  }

  const vrows = await db
    .select()
    .from(estimateVersions)
    .where(and(eq(estimateVersions.id, versionId), eq(estimateVersions.estimateId, estimate.id)))
    .limit(1)
  const version = vrows[0]
  if (!version) throw new HttpError('NOT_FOUND', 'Estimate version not found.', 404)

  const itemRows = await itemsForVersion(env, version.id)
  const items = itemRows.map(serializeEstimateItem)
  const summary = buildEstimateSummary(items, estimate.areaSqft)
  const versions = await listEstimateVersions(env, projectId, estimateId, userId)

  let sharedVersionNumber: number | null = null
  if (estimate.sharedVersionId) {
    const srows = await db
      .select({ versionNumber: estimateVersions.versionNumber })
      .from(estimateVersions)
      .where(eq(estimateVersions.id, estimate.sharedVersionId))
      .limit(1)
    sharedVersionNumber = srows[0]?.versionNumber ?? null
  }

  const customerLabel = await customerLabelForUser(env, estimate.customerUserId)
  const base = serializeEstimateListItem(estimate, {
    projectName: project.name,
    customerLabel,
    currentVersionNumber: await versionNumberFor(env, estimate),
    sharedVersionNumber,
    totalAmountPaise: summary.grandTotalPaise,
  })

  return {
    ...base,
    currentVersion: serializeEstimateVersion(version, {
      itemCount: summary.itemCount,
      totalAmountPaise: summary.grandTotalPaise,
    }),
    itemCount: summary.itemCount,
    items,
    summary,
    versions,
  }
}

export async function createEstimateItem(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
  input: CreateEstimateItemInput,
): Promise<EstimateItemDto> {
  const { versionId } = await requireMutableCurrentVersion(env, projectId, estimateId, userId)
  const name = normalizeName(input.name)
  if (!name) throw new HttpError('INVALID_NAME', 'Item name is required.', 400)

  let quantityMilli: number | null = null
  if (input.quantity != null) {
    try {
      quantityMilli = quantityToMilli(input.quantity)
    } catch (err) {
      moneyError(err)
    }
  }

  let ratePaise: number | null = null
  if (input.ratePaise != null) {
    if (!Number.isInteger(input.ratePaise) || input.ratePaise < 0) {
      throw new HttpError('INVALID_RATE', 'ratePaise must be a non-negative integer.', 400)
    }
    ratePaise = input.ratePaise
  } else if (input.rate != null) {
    try {
      ratePaise = rateToPaise(input.rate)
    } catch (err) {
      moneyError(err)
    }
  }

  const amountPaise = computeLineAmount(quantityMilli, ratePaise)
  const db = getDb(env)
  const existing = await itemsForVersion(env, versionId)
  const sortOrder = input.sortOrder ?? existing.length

  const [row] = await db
    .insert(estimateItems)
    .values({
      estimateVersionId: versionId,
      category: input.category?.trim() || null,
      name,
      description: input.description?.trim() || null,
      quantityMilli,
      unit: input.unit?.trim() || null,
      ratePaise,
      amountPaise,
      rateSource: input.rateSource ?? (ratePaise != null ? 'manual_override' : null),
      effectiveDate: input.effectiveDate ?? null,
      confidence: input.confidence ?? null,
      sourceReference: input.sourceReference ?? null,
      notes: input.notes?.trim() || null,
      sortOrder,
    })
    .returning()

  await db
    .update(estimates)
    .set({ updatedAt: new Date() })
    .where(eq(estimates.id, estimateId))

  return serializeEstimateItem(row)
}

export async function updateEstimateItem(
  env: Env,
  projectId: string,
  estimateId: string,
  itemId: string,
  userId: string,
  input: PatchEstimateItemInput,
): Promise<EstimateItemDto> {
  const { versionId } = await requireMutableCurrentVersion(env, projectId, estimateId, userId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(estimateItems)
    .where(and(eq(estimateItems.id, itemId), eq(estimateItems.estimateVersionId, versionId)))
    .limit(1)
  const existing = rows[0]
  if (!existing) throw new HttpError('NOT_FOUND', 'Estimate item not found.', 404)

  let quantityMilli = existing.quantityMilli
  let ratePaise = existing.ratePaise
  let rateSource = existing.rateSource
  let effectiveDate = existing.effectiveDate
  let confidence = existing.confidence
  let sourceReference = existing.sourceReference

  if (input.quantity !== undefined) {
    if (input.quantity == null) quantityMilli = null
    else {
      try {
        quantityMilli = quantityToMilli(input.quantity)
      } catch (err) {
        moneyError(err)
      }
    }
  }

  if (input.clearRate) {
    ratePaise = null
    rateSource = null
    effectiveDate = null
    confidence = null
    sourceReference = null
  } else if (input.ratePaise !== undefined) {
    if (input.ratePaise == null) ratePaise = null
    else {
      if (!Number.isInteger(input.ratePaise) || input.ratePaise < 0) {
        throw new HttpError('INVALID_RATE', 'ratePaise must be a non-negative integer.', 400)
      }
      ratePaise = input.ratePaise
      rateSource = input.rateSource ?? 'manual_override'
      if (input.effectiveDate !== undefined) effectiveDate = input.effectiveDate
      if (input.confidence !== undefined) confidence = input.confidence
      if (input.sourceReference !== undefined) sourceReference = input.sourceReference
    }
  } else if (input.rate !== undefined) {
    if (input.rate == null) ratePaise = null
    else {
      try {
        ratePaise = rateToPaise(input.rate)
      } catch (err) {
        moneyError(err)
      }
      rateSource = input.rateSource ?? 'manual_override'
      if (input.effectiveDate !== undefined) effectiveDate = input.effectiveDate
      if (input.confidence !== undefined) confidence = input.confidence
      if (input.sourceReference !== undefined) sourceReference = input.sourceReference
    }
  } else {
    if (input.rateSource !== undefined) rateSource = input.rateSource
    if (input.effectiveDate !== undefined) effectiveDate = input.effectiveDate
    if (input.confidence !== undefined) confidence = input.confidence
    if (input.sourceReference !== undefined) sourceReference = input.sourceReference
  }

  const amountPaise = computeLineAmount(quantityMilli, ratePaise)
  const [row] = await db
    .update(estimateItems)
    .set({
      name: input.name !== undefined ? normalizeName(input.name) || existing.name : existing.name,
      category: input.category !== undefined ? input.category?.trim() || null : existing.category,
      description:
        input.description !== undefined ? input.description?.trim() || null : existing.description,
      quantityMilli,
      unit: input.unit !== undefined ? input.unit?.trim() || null : existing.unit,
      ratePaise,
      amountPaise,
      rateSource,
      effectiveDate,
      confidence,
      sourceReference,
      notes: input.notes !== undefined ? input.notes?.trim() || null : existing.notes,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(estimateItems.id, itemId))
    .returning()

  await db
    .update(estimates)
    .set({ updatedAt: new Date() })
    .where(eq(estimates.id, estimateId))

  return serializeEstimateItem(row)
}

export async function deleteEstimateItem(
  env: Env,
  projectId: string,
  estimateId: string,
  itemId: string,
  userId: string,
): Promise<void> {
  const { versionId } = await requireMutableCurrentVersion(env, projectId, estimateId, userId)
  const db = getDb(env)
  const deleted = await db
    .delete(estimateItems)
    .where(and(eq(estimateItems.id, itemId), eq(estimateItems.estimateVersionId, versionId)))
    .returning({ id: estimateItems.id })
  if (!deleted[0]) throw new HttpError('NOT_FOUND', 'Estimate item not found.', 404)
  await db
    .update(estimates)
    .set({ updatedAt: new Date() })
    .where(eq(estimates.id, estimateId))
}

/** Apply S26 resolver rate snapshot onto an item on the current version. */
export async function applyResolvedRateToEstimateItem(
  env: Env,
  projectId: string,
  estimateId: string,
  itemId: string,
  userId: string,
): Promise<EstimateItemDto> {
  const { project, estimate, versionId } = await requireMutableCurrentVersion(
    env,
    projectId,
    estimateId,
    userId,
  )
  const db = getDb(env)
  const rows = await db
    .select()
    .from(estimateItems)
    .where(and(eq(estimateItems.id, itemId), eq(estimateItems.estimateVersionId, versionId)))
    .limit(1)
  const item = rows[0]
  if (!item) throw new HttpError('NOT_FOUND', 'Estimate item not found.', 404)
  if (!item.unit?.trim()) {
    throw new HttpError('VALIDATION_ERROR', 'Item unit is required before resolving a rate.', 400)
  }

  const resolved = await resolveOrganizationPrice(env, estimate.organizationId, userId, {
    name: item.name,
    unit: item.unit,
    projectId,
    location: estimate.location ?? project.location ?? undefined,
  })

  if (!resolved.found) {
    throw new HttpError('RATE_UNAVAILABLE', resolved.reason, 404)
  }

  const snap = snapshotResolvedRateForEstimate(resolved)
  if (!snap) throw new HttpError('RATE_UNAVAILABLE', 'No reliable rate available.', 404)

  const amountPaise = computeLineAmount(item.quantityMilli, snap.ratePaise)
  const [row] = await db
    .update(estimateItems)
    .set({
      ratePaise: snap.ratePaise,
      amountPaise,
      rateSource: snap.rateSource,
      effectiveDate: snap.effectiveDate,
      confidence: snap.confidence,
      sourceReference: snap.sourceReference,
      updatedAt: new Date(),
    })
    .where(eq(estimateItems.id, itemId))
    .returning()

  await db
    .update(estimates)
    .set({ updatedAt: new Date() })
    .where(eq(estimates.id, estimateId))

  return serializeEstimateItem(row)
}

/**
 * Fork the current version into a new version (copy items). Prior version
 * rows and items remain untouched — immutability by append-only copies.
 * Allowed on locked estimates: unlocks the parent to draft and clears lock
 * metadata while preserving the previous version row as status=locked.
 */
export async function createEstimateVersion(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
): Promise<EstimateDetailDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)
  const estimate = await loadEstimateRow(env, projectId, estimateId)
  if (!estimate.currentVersionId) {
    throw new HttpError('NO_CURRENT_VERSION', 'Estimate has no current version.', 400)
  }
  const versionId = estimate.currentVersionId
  const db = getDb(env)
  const maxRows = await db
    .select({ n: max(estimateVersions.versionNumber) })
    .from(estimateVersions)
    .where(eq(estimateVersions.estimateId, estimate.id))
  const nextNumber = (maxRows[0]?.n ?? 0) + 1
  const newVersionId = randomUUID()
  const now = new Date()

  await db.insert(estimateVersions).values({
    id: newVersionId,
    estimateId: estimate.id,
    versionNumber: nextNumber,
    status: 'draft',
    createdBy: userId,
    createdAt: now,
  })

  const sourceItems = await itemsForVersion(env, versionId)
  for (const item of sourceItems) {
    await db.insert(estimateItems).values({
      estimateVersionId: newVersionId,
      category: item.category,
      name: item.name,
      description: item.description,
      quantityMilli: item.quantityMilli,
      unit: item.unit,
      ratePaise: item.ratePaise,
      amountPaise: item.amountPaise,
      rateSource: item.rateSource,
      effectiveDate: item.effectiveDate,
      confidence: item.confidence,
      sourceReference: item.sourceReference,
      notes: item.notes,
      sortOrder: item.sortOrder,
      createdAt: now,
      updatedAt: now,
    })
  }

  if (estimate.status === 'locked') {
    // Preserve locked snapshot status on the prior version row.
    await db
      .update(estimateVersions)
      .set({ status: 'locked' })
      .where(eq(estimateVersions.id, versionId))
  }

  await db
    .update(estimates)
    .set({
      currentVersionId: newVersionId,
      // Unlock parent when forking from a locked snapshot.
      status: estimate.status === 'locked' ? 'draft' : estimate.status,
      lockedAt: estimate.status === 'locked' ? null : estimate.lockedAt,
      lockedBy: estimate.status === 'locked' ? null : estimate.lockedBy,
      // Keep customer-visible share pinned; do not demote 'shared' when forking.
      updatedAt: now,
    })
    .where(eq(estimates.id, estimate.id))

  return getEstimateBuilderDetail(env, projectId, estimateId, userId)
}

/** Mark estimate as final — still editable until lock. */
export async function finalizeEstimate(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
): Promise<EstimateDetailDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)
  const estimate = await loadEstimateRow(env, projectId, estimateId)
  if (estimate.status === 'locked') {
    throw new HttpError('ESTIMATE_LOCKED', 'Locked estimates cannot be marked final again.', 409)
  }
  if (!estimate.currentVersionId) {
    throw new HttpError('NO_CURRENT_VERSION', 'Estimate has no current version.', 400)
  }

  const detail = await getEstimateBuilderDetail(env, projectId, estimateId, userId)
  if (detail.summary.itemCount === 0) {
    throw new HttpError('ESTIMATE_EMPTY', 'Add estimate items before marking final.', 400)
  }

  const db = getDb(env)
  const now = new Date()
  await db
    .update(estimates)
    .set({ status: 'final', updatedAt: now })
    .where(eq(estimates.id, estimate.id))
  await db
    .update(estimateVersions)
    .set({ status: 'final' })
    .where(eq(estimateVersions.id, estimate.currentVersionId))

  return getEstimateBuilderDetail(env, projectId, estimateId, userId)
}

/**
 * Lock current estimate version. Rates/quantities become immutable via mutate APIs.
 * Requires readyToShare (all qty + rates present).
 */
export async function lockEstimate(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
): Promise<EstimateDetailDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)
  const estimate = await loadEstimateRow(env, projectId, estimateId)
  if (estimate.status === 'locked') {
    throw new HttpError('ESTIMATE_LOCKED', 'Estimate is already locked.', 409)
  }
  if (!estimate.currentVersionId) {
    throw new HttpError('NO_CURRENT_VERSION', 'Estimate has no current version.', 400)
  }

  const detail = await getEstimateBuilderDetail(env, projectId, estimateId, userId)
  if (!detail.summary.readyToShare) {
    throw new HttpError(
      'ESTIMATE_INCOMPLETE',
      `${detail.summary.missingQuantityCount + detail.summary.missingRateCount} items need pricing or quantities before this estimate can be locked.`,
      400,
    )
  }

  const db = getDb(env)
  const now = new Date()
  await db
    .update(estimates)
    .set({
      status: 'locked',
      lockedAt: now,
      lockedBy: userId,
      updatedAt: now,
    })
    .where(eq(estimates.id, estimate.id))
  await db
    .update(estimateVersions)
    .set({ status: 'locked' })
    .where(eq(estimateVersions.id, estimate.currentVersionId))

  return getEstimateBuilderDetail(env, projectId, estimateId, userId)
}

export async function shareEstimateWithCustomer(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
  input: ShareEstimateInput = {},
): Promise<EstimateDetailDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)
  const estimate = await loadEstimateRow(env, projectId, estimateId)

  const versionId = input.versionId || estimate.currentVersionId
  if (!versionId) throw new HttpError('NO_CURRENT_VERSION', 'Estimate has no version to share.', 400)

  const db = getDb(env)
  const vrows = await db
    .select()
    .from(estimateVersions)
    .where(and(eq(estimateVersions.id, versionId), eq(estimateVersions.estimateId, estimate.id)))
    .limit(1)
  if (!vrows[0]) throw new HttpError('NOT_FOUND', 'Estimate version not found.', 404)

  const detail = await getEstimateBuilderDetail(env, projectId, estimateId, userId, { versionId })
  if (!detail.summary.readyToShare) {
    throw new HttpError(
      'ESTIMATE_INCOMPLETE',
      `${detail.summary.missingQuantityCount + detail.summary.missingRateCount} items need pricing or quantities before this estimate can be shared.`,
      400,
    )
  }

  if (!estimate.customerUserId) {
    throw new HttpError(
      'NO_CUSTOMER',
      'Link a project customer before sharing an estimate.',
      400,
    )
  }

  const now = new Date()
  await db
    .update(estimates)
    .set({
      // Keep locked estimates locked; otherwise mark shared for customer visibility.
      status: estimate.status === 'locked' ? 'locked' : 'shared',
      sharedVersionId: versionId,
      updatedAt: now,
    })
    .where(eq(estimates.id, estimate.id))

  // Do not demote a locked version row to 'shared'.
  if (estimate.status !== 'locked') {
    await db
      .update(estimateVersions)
      .set({ status: 'shared' })
      .where(eq(estimateVersions.id, versionId))
  }

  return getEstimateBuilderDetail(env, projectId, estimateId, userId)
}

export async function getCustomerSharedEstimate(
  env: Env,
  projectId: string,
  userId: string,
): Promise<CustomerEstimateDto> {
  const access = await requireCompanyOrCustomerRead(env, projectId, userId)
  if (access.kind !== 'customer') {
    // Company users use the company preview endpoint instead.
    throw new HttpError('NOT_FOUND', 'Shared estimate not found.', 404)
  }

  const db = getDb(env)
  const rows = await db
    .select()
    .from(estimates)
    .where(eq(estimates.projectId, projectId))
    .orderBy(desc(estimates.updatedAt))

  const estimate = rows.find(
    r =>
      r.sharedVersionId != null && (r.status === 'shared' || r.status === 'locked'),
  )
  if (!estimate?.sharedVersionId) {
    throw new HttpError('NOT_FOUND', 'Shared estimate not found.', 404)
  }

  return buildCustomerEstimateDto(env, estimate, estimate.sharedVersionId, access.project.name)
}

export async function getCompanyCustomerPreview(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
): Promise<CustomerEstimateDto> {
  await requireProjectAccess(env, projectId, userId)
  const estimate = await loadEstimateRow(env, projectId, estimateId)
  const versionId = estimate.sharedVersionId || estimate.currentVersionId
  if (!versionId) throw new HttpError('NO_CURRENT_VERSION', 'Estimate has no version.', 400)
  const project = await requireProjectAccess(env, projectId, userId)
  return buildCustomerEstimateDto(env, estimate, versionId, project.name)
}

async function buildCustomerEstimateDto(
  env: Env,
  estimate: EstimateRow,
  versionId: string,
  projectName: string,
): Promise<CustomerEstimateDto> {
  const db = getDb(env)
  const vrows = await db
    .select()
    .from(estimateVersions)
    .where(and(eq(estimateVersions.id, versionId), eq(estimateVersions.estimateId, estimate.id)))
    .limit(1)
  const version = vrows[0]
  if (!version) throw new HttpError('NOT_FOUND', 'Estimate version not found.', 404)

  const itemRows = await itemsForVersion(env, version.id)
  const items = itemRows.map(serializeEstimateItem)
  const summary = buildEstimateSummary(items, estimate.areaSqft)

  let organizationName: string | null = null
  const orgs = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, estimate.organizationId))
    .limit(1)
  organizationName = orgs[0]?.name ?? null

  return {
    estimateId: estimate.id,
    projectId: estimate.projectId,
    projectName,
    organizationName,
    name: estimate.name,
    currency: estimate.currency,
    location: estimate.location,
    areaSqft: estimate.areaSqft,
    versionNumber: version.versionNumber,
    preparedAt: version.createdAt.toISOString(),
    status: 'shared',
    materialTotal: summary.materialTotalPaise / 100,
    labourTotal: summary.labourTotalPaise / 100,
    otherTotal: summary.otherTotalPaise / 100,
    grandTotal: summary.grandTotalPaise == null ? null : summary.grandTotalPaise / 100,
    costPerSqft: summary.costPerSqftPaise == null ? null : summary.costPerSqftPaise / 100,
    items: items.map(toCustomerEstimateItem),
    disclaimer:
      'This is a construction estimate for planning purposes. It is not a final BOQ, contract, or invoice.',
  }
}

// Re-export getEstimateForProject for callers that still want the light detail.
export { getEstimateForProject }
