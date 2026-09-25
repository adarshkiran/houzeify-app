// ─── Estimate generation — Post-S27 Slice 1 ────────────────────────────────
// Seeds material quantities from S25 formulas, resolves rates via S26.
// Does not fabricate market/AI prices or labour day counts.

import { and, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { estimateItems, estimates } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import {
  resolveOrganizationPrice,
  snapshotResolvedRateForEstimate,
} from '../pricing/priceIntelligence.service.js'
import {
  buildSummaryMaterialQuantities,
  DEFAULT_FLOORS,
  type ConstructionLevel,
} from './materialQuantityFormulas.js'
import {
  createEstimateItem,
  getEstimateBuilderDetail,
} from './projectEstimateBuilder.service.js'
import { requireProjectAccess, requireProjectMutation } from './projectAccess.js'
import type {
  EstimateGenerateStage,
  GenerateEstimateInput,
  GenerateEstimateResult,
} from './projectEstimates.types.js'

function assertNotLocked(status: string): void {
  if (status === 'locked') {
    throw new HttpError(
      'ESTIMATE_LOCKED',
      'This estimate is locked. Create a new version to make changes.',
      409,
    )
  }
}

export async function generateEstimateItems(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
  input: GenerateEstimateInput = {},
): Promise<GenerateEstimateResult> {
  const stagesCompleted: EstimateGenerateStage[] = []
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  const db = getDb(env)
  const rows = await db
    .select()
    .from(estimates)
    .where(and(eq(estimates.id, estimateId), eq(estimates.projectId, projectId)))
    .limit(1)
  const estimate = rows[0]
  if (!estimate) throw new HttpError('NOT_FOUND', 'Estimate not found.', 404)
  assertNotLocked(estimate.status)

  if (!estimate.currentVersionId) {
    throw new HttpError('NO_CURRENT_VERSION', 'Estimate has no current version.', 400)
  }

  stagesCompleted.push('requirements')

  const builtUpArea = input.builtUpArea ?? estimate.areaSqft
  if (builtUpArea == null || builtUpArea <= 0) {
    throw new HttpError(
      'MISSING_AREA',
      'Built-up area is required to generate material quantities.',
      400,
    )
  }

  const floors = input.floors ?? DEFAULT_FLOORS
  if (!Number.isInteger(floors) || floors < 1 || floors > 100) {
    throw new HttpError('INVALID_FLOORS', 'floors must be an integer between 1 and 100.', 400)
  }

  const constructionLevel = (input.constructionLevel ?? 'Standard') as ConstructionLevel
  const location = (input.location ?? estimate.location ?? project.location ?? '').trim()

  const existing = await db
    .select({ id: estimateItems.id })
    .from(estimateItems)
    .where(eq(estimateItems.estimateVersionId, estimate.currentVersionId))
    .limit(1)

  const replaceItems = input.replaceItems ?? existing.length === 0
  if (existing.length > 0 && !replaceItems) {
    throw new HttpError(
      'ITEMS_EXIST',
      'Estimate already has items. Pass replaceItems: true to regenerate, or edit in the builder.',
      409,
    )
  }

  if (existing.length > 0 && replaceItems) {
    await db
      .delete(estimateItems)
      .where(eq(estimateItems.estimateVersionId, estimate.currentVersionId))
  }

  // Persist area/location hints used for generation when provided.
  const patch: Partial<typeof estimates.$inferInsert> = { updatedAt: new Date() }
  if (input.builtUpArea != null) patch.areaSqft = Math.round(input.builtUpArea)
  else if (estimate.areaSqft == null) patch.areaSqft = Math.round(builtUpArea)
  if (input.location != null) patch.location = input.location.trim() || null
  else if (!estimate.location && location) patch.location = location
  await db.update(estimates).set(patch).where(eq(estimates.id, estimate.id))

  const quantities = buildSummaryMaterialQuantities({
    builtUpArea,
    floors,
    constructionLevel,
    location,
  })
  stagesCompleted.push('quantities')

  let ratesResolved = 0
  let ratesUnresolved = 0
  let sortOrder = 0

  for (const line of quantities) {
    const resolved = await resolveOrganizationPrice(env, estimate.organizationId, userId, {
      name: line.name,
      unit: line.unit,
      projectId,
      location: location || undefined,
    })
    const snap = snapshotResolvedRateForEstimate(resolved)
    if (snap) ratesResolved += 1
    else ratesUnresolved += 1

    await createEstimateItem(env, projectId, estimateId, userId, {
      name: line.name,
      category: 'material',
      quantity: line.quantity,
      unit: line.unit,
      ratePaise: snap?.ratePaise ?? null,
      rateSource: snap?.rateSource ?? null,
      effectiveDate: snap?.effectiveDate ?? null,
      confidence: snap?.confidence ?? null,
      sourceReference: snap?.sourceReference ?? null,
      notes: `Generated from Material Calculator (${constructionLevel}, ${floors} floors).`,
      sortOrder: sortOrder++,
    })
  }

  stagesCompleted.push('rates')

  const detail = await getEstimateBuilderDetail(env, projectId, estimateId, userId)
  stagesCompleted.push('summary')

  return {
    estimate: detail,
    stagesCompleted,
    quantitiesSeeded: quantities.length,
    ratesResolved,
    ratesUnresolved,
  }
}
