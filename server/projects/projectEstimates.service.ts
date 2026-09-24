// ─── Project estimates service — foundation ────────────────────────────────
// Company project participants only (requireProjectAccess). Customers never
// see internal estimates through these endpoints. Create requires mutation
// role (creator or org owner/admin), matching project settings / BOQ mutate.

import { and, desc, eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  customerProfiles,
  estimateVersions,
  estimates,
  projectCustomers,
  users,
  type EstimateRow,
} from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { requireProjectAccess, requireProjectMutation } from './projectAccess.js'
import {
  serializeEstimateListItem,
  serializeEstimateVersion,
  type CreateEstimateInput,
  type EstimateDetailDto,
  type EstimateDto,
  type EstimatePricingMethod,
} from './projectEstimates.types.js'

const DEFAULT_CURRENCY = 'INR'

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

async function resolveCustomerUserId(env: Env, projectId: string): Promise<string | null> {
  const db = getDb(env)
  const rows = await db
    .select({ userId: projectCustomers.userId })
    .from(projectCustomers)
    .where(
      and(
        eq(projectCustomers.projectId, projectId),
        inArray(projectCustomers.status, ['invited', 'active']),
      ),
    )
    .limit(1)
  return rows[0]?.userId ?? null
}

async function customerLabelForUser(env: Env, userId: string | null): Promise<string | null> {
  if (!userId) return null
  const db = getDb(env)
  const profiles = await db
    .select({ fullName: customerProfiles.fullName, preferredName: customerProfiles.preferredName })
    .from(customerProfiles)
    .where(eq(customerProfiles.userId, userId))
    .limit(1)
  const profile = profiles[0]
  if (profile?.fullName?.trim()) return profile.fullName.trim()
  if (profile?.preferredName?.trim()) return profile.preferredName.trim()
  const phoneRows = await db
    .select({ phoneNumber: users.phoneNumber })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return phoneRows[0]?.phoneNumber ?? null
}

async function versionNumberFor(env: Env, estimate: EstimateRow): Promise<number | null> {
  if (!estimate.currentVersionId) return null
  const db = getDb(env)
  const rows = await db
    .select({ versionNumber: estimateVersions.versionNumber })
    .from(estimateVersions)
    .where(eq(estimateVersions.id, estimate.currentVersionId))
    .limit(1)
  return rows[0]?.versionNumber ?? null
}

export async function listEstimatesForProject(
  env: Env,
  projectId: string,
  userId: string,
): Promise<EstimateDto[]> {
  const project = await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(estimates)
    .where(eq(estimates.projectId, projectId))
    .orderBy(desc(estimates.updatedAt))

  const out: EstimateDto[] = []
  for (const row of rows) {
    const customerLabel = await customerLabelForUser(env, row.customerUserId)
    const currentVersionNumber = await versionNumberFor(env, row)
    out.push(
      serializeEstimateListItem(row, {
        projectName: project.name,
        customerLabel,
        currentVersionNumber,
      }),
    )
  }
  return out
}

export async function getEstimateForProject(
  env: Env,
  projectId: string,
  estimateId: string,
  userId: string,
): Promise<EstimateDetailDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(estimates)
    .where(and(eq(estimates.id, estimateId), eq(estimates.projectId, projectId)))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Estimate not found.', 404)

  const customerLabel = await customerLabelForUser(env, row.customerUserId)
  const currentVersionNumber = await versionNumberFor(env, row)
  const base = serializeEstimateListItem(row, {
    projectName: project.name,
    customerLabel,
    currentVersionNumber,
  })

  let currentVersion = null
  if (row.currentVersionId) {
    const vrows = await db
      .select()
      .from(estimateVersions)
      .where(and(eq(estimateVersions.id, row.currentVersionId), eq(estimateVersions.estimateId, row.id)))
      .limit(1)
    if (vrows[0]) currentVersion = serializeEstimateVersion(vrows[0])
  }

  return {
    ...base,
    currentVersion,
    itemCount: 0,
  }
}

export async function createEstimateForProject(
  env: Env,
  projectId: string,
  userId: string,
  input: CreateEstimateInput,
): Promise<EstimateDetailDto> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireProjectMutation(env, project, userId)

  if (!project.organizationId) {
    throw new HttpError(
      'PROJECT_NOT_IN_ORGANIZATION',
      'Estimates require a project that belongs to an organization.',
      400,
    )
  }

  const name = normalizeName(input.name)
  if (!name) throw new HttpError('INVALID_NAME', 'Estimate name is required.', 400)

  const pricingMethod = input.pricingMethod as EstimatePricingMethod
  const currency = (input.currency?.trim().toUpperCase() || DEFAULT_CURRENCY).slice(0, 8)
  const location =
    input.location !== undefined ? input.location.trim() || null : project.location ?? null
  const areaSqft = input.areaSqft ?? null
  const customerUserId = await resolveCustomerUserId(env, projectId)

  const db = getDb(env)
  const estimateId = randomUUID()
  const versionId = randomUUID()
  const now = new Date()

  await db.insert(estimates).values({
    id: estimateId,
    organizationId: project.organizationId,
    projectId,
    customerUserId,
    name,
    status: 'draft',
    pricingMethod,
    currency,
    location,
    areaSqft,
    currentVersionId: null,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  })

  await db.insert(estimateVersions).values({
    id: versionId,
    estimateId,
    versionNumber: 1,
    status: 'draft',
    createdBy: userId,
    createdAt: now,
  })

  await db
    .update(estimates)
    .set({ currentVersionId: versionId, updatedAt: now })
    .where(eq(estimates.id, estimateId))

  return getEstimateForProject(env, projectId, estimateId, userId)
}
