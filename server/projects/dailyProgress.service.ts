// ─── Daily Progress business logic — Module 04 ──────────────────────────────
// Authorization, reusing Module 03's exact boundaries rather than a second
// framework:
//   - READ (list) and CREATE: getProjectForAccess() — the project's
//     creator, or any member of its organization (any role, including
//     'viewer'). Creation is intentionally this broad: the primary capture
//     persona is a site engineer/supervisor, realistically a team-member
//     role, not an org owner/admin — restricting creation to mutation
//     roles would make the feature unusable by its own intended user.
//   - UPDATE/DELETE/photo-attach: the entry's own creator, OR an org
//     member whose role is in ORGANIZATION_MUTATION_ROLES (reused from
//     organization.service.ts, exported in Module 03) — same rule Module
//     03 used for updateProject(). Attaching a photo to an existing entry
//     is treated as a modification of that entry, so it uses this same
//     (stricter) rule rather than the broader create/read one.
// Every read/write is scoped in the query itself — never "fetch unscoped,
// then check in application code." A non-owner/non-member/non-existent id
// is 404, never 403 — same "don't reveal more than necessary" convention
// as every other resource in this backend.

import { randomUUID } from 'node:crypto'
import { and, desc, eq, inArray } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  dailyProgress,
  dailyProgressPhotos,
  organizationMembers,
  type DailyProgressPhotoRow,
  type DailyProgressRow,
  type ProjectRow,
} from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getProjectForAccess } from './project.service.js'
import { canMutateAtProjectLevel } from './projectAccess.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'

export interface DailyProgressInput {
  date: string
  stage?: string
  title: string
  description?: string
}

export interface DailyProgressPatch {
  date?: string
  stage?: string
  title?: string
  description?: string
  visibility?: 'internal' | 'customer'
}

export interface DailyProgressPhotoInput {
  fileName: string
  mimeType: string
  size: number
}

async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function requireDailyProgressRow(env: Env, projectId: string, progressId: string): Promise<DailyProgressRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(dailyProgress)
    .where(and(eq(dailyProgress.id, progressId), eq(dailyProgress.projectId, projectId)))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Progress update not found.', 404)
  return row
}

/** Creator, or an organization member with a mutation role — the same
 *  boundary Module 03's updateProject() uses, reused verbatim. */
async function canMutateDailyProgress(env: Env, project: ProjectRow, row: DailyProgressRow, userId: string): Promise<boolean> {
  if (row.createdBy === userId) return true
  if (!project.organizationId) return false
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, project.organizationId), eq(organizationMembers.userId, userId)))
    .limit(1)
  const membership = rows[0]
  return Boolean(membership) && ORGANIZATION_MUTATION_ROLES.includes(membership.role as OrganizationMemberRole)
}

async function requireMutationAccess(env: Env, project: ProjectRow, row: DailyProgressRow, userId: string): Promise<void> {
  if (!(await canMutateDailyProgress(env, project, row, userId))) {
    throw new HttpError('NOT_FOUND', 'Progress update not found.', 404)
  }
}

/** Every progress entry for a project, most recent date first, each with
 *  its own photos attached — the caller must have read access (creator or
 *  any org member). */
export async function listDailyProgressForProject(
  env: Env,
  projectId: string,
  userId: string,
): Promise<{ progress: DailyProgressRow[]; photosByProgressId: Map<string, DailyProgressPhotoRow[]> }> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(dailyProgress)
    .where(eq(dailyProgress.projectId, projectId))
    .orderBy(desc(dailyProgress.date), desc(dailyProgress.createdAt))

  const photosByProgressId = new Map<string, DailyProgressPhotoRow[]>()
  if (rows.length > 0) {
    const photoRows = await db
      .select()
      .from(dailyProgressPhotos)
      .where(inArray(dailyProgressPhotos.dailyProgressId, rows.map(r => r.id)))
    for (const photo of photoRows) {
      const list = photosByProgressId.get(photo.dailyProgressId) ?? []
      list.push(photo)
      photosByProgressId.set(photo.dailyProgressId, list)
    }
  }
  return { progress: rows, photosByProgressId }
}

export async function createDailyProgress(env: Env, projectId: string, userId: string, input: DailyProgressInput): Promise<DailyProgressRow> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  const created = await db
    .insert(dailyProgress)
    .values({
      projectId,
      createdBy: userId,
      date: input.date,
      stage: input.stage?.trim() || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
    })
    .returning()
  return created[0]
}

export async function updateDailyProgress(
  env: Env,
  projectId: string,
  progressId: string,
  userId: string,
  patch: Partial<DailyProgressPatch>,
): Promise<DailyProgressRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireDailyProgressRow(env, projectId, progressId)
  await requireMutationAccess(env, project, existing, userId)
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }

  if (patch.visibility !== undefined) {
    if (!(await canMutateAtProjectLevel(env, project, userId))) {
      throw new HttpError('NOT_FOUND', 'Progress update not found.', 404)
    }
  }

  const db = getDb(env)
  const values: Partial<typeof dailyProgress.$inferInsert> = { updatedAt: new Date() }
  if (patch.date !== undefined) values.date = patch.date
  if (patch.stage !== undefined) values.stage = patch.stage.trim() || null
  if (patch.title !== undefined) values.title = patch.title.trim()
  if (patch.description !== undefined) values.description = patch.description.trim() || null
  if (patch.visibility !== undefined) {
    values.visibility = patch.visibility
    if (patch.visibility === 'customer') {
      values.publishedAt = new Date()
      values.publishedBy = userId
    }
  }

  const updated = await db.update(dailyProgress).set(values).where(eq(dailyProgress.id, progressId)).returning()
  return updated[0]
}

export async function deleteDailyProgress(env: Env, projectId: string, progressId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireDailyProgressRow(env, projectId, progressId)
  await requireMutationAccess(env, project, existing, userId)
  const db = getDb(env)
  await db.delete(dailyProgress).where(eq(dailyProgress.id, progressId))
}

/** storageRef is always minted here, from this new row's own id — never
 *  accepted from the caller (see dailyProgress.schemas.ts's own comment;
 *  the input type below has no storageRef field at all, so there is
 *  nothing for a caller to even attempt to pass through). */
export async function addDailyProgressPhoto(
  env: Env,
  projectId: string,
  progressId: string,
  userId: string,
  input: DailyProgressPhotoInput,
): Promise<DailyProgressPhotoRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireDailyProgressRow(env, projectId, progressId)
  await requireMutationAccess(env, project, existing, userId)

  const db = getDb(env)
  const id = randomUUID()
  const created = await db
    .insert(dailyProgressPhotos)
    .values({
      id,
      dailyProgressId: progressId,
      fileName: input.fileName.trim(),
      mimeType: input.mimeType,
      size: input.size,
      uploadedBy: userId,
      storageRef: `internal://daily-progress-photos/${id}`,
    })
    .returning()
  return created[0]
}
