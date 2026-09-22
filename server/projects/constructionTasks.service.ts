// ─── Construction Task business logic — Module 05 ──────────────────────────
// Authorization, reusing Module 03's exact boundaries (same shape as
// dailyProgress.service.ts):
//   - READ (list) and CREATE: getProjectForAccess() — creator or any org
//     member, any role, including 'viewer' — the realistic capture persona
//     (a site engineer) is a team-member, not an owner/admin.
//   - UPDATE/DELETE: creator, OR an org member whose role is in
//     ORGANIZATION_MUTATION_ROLES. No "assignee can update their own
//     assigned task" path — nothing else in this codebase authorizes by
//     assignment, and this module does not invent that rule.
// Every read/write is scoped in the query itself. A non-owner/non-member/
// non-existent id is 404, never 403.

import { and, desc, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { constructionTasks, type ConstructionTaskRow, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getProjectForAccess, isAuthorizedProjectParticipant } from './project.service.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'
import { organizationMembers } from '../db/schema.js'

export interface ConstructionTaskInput {
  title: string
  description?: string
  stage?: string
  status?: string
  priority?: string
  assigneeId?: string
  dueDate?: string
}

async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function requireTaskRow(env: Env, projectId: string, taskId: string): Promise<ConstructionTaskRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(constructionTasks)
    .where(and(eq(constructionTasks.id, taskId), eq(constructionTasks.projectId, projectId)))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Task not found.', 404)
  return row
}

async function canMutateTask(env: Env, project: ProjectRow, row: ConstructionTaskRow, userId: string): Promise<boolean> {
  if (row.createdBy === userId) return true
  if (!project.organizationId) return false
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    // TABLE C: status must be 'active' — see organization.service.ts's findMembership.
    .where(
      and(
        eq(organizationMembers.organizationId, project.organizationId),
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, 'active'),
      ),
    )
    .limit(1)
  const membership = rows[0]
  return Boolean(membership) && ORGANIZATION_MUTATION_ROLES.includes(membership.role as OrganizationMemberRole)
}

async function requireMutationAccess(env: Env, project: ProjectRow, row: ConstructionTaskRow, userId: string): Promise<void> {
  if (!(await canMutateTask(env, project, row, userId))) {
    throw new HttpError('NOT_FOUND', 'Task not found.', 404)
  }
}

async function requireValidAssignee(env: Env, project: ProjectRow, assigneeId: string | undefined): Promise<void> {
  if (assigneeId === undefined) return
  if (!(await isAuthorizedProjectParticipant(env, project, assigneeId))) {
    throw new HttpError('INVALID_ASSIGNEE', 'Assignee is not an authorized participant of this project.', 400)
  }
}

export async function listTasksForProject(env: Env, projectId: string, userId: string): Promise<ConstructionTaskRow[]> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  return db.select().from(constructionTasks).where(eq(constructionTasks.projectId, projectId)).orderBy(desc(constructionTasks.createdAt))
}

export async function createTask(env: Env, projectId: string, userId: string, input: ConstructionTaskInput): Promise<ConstructionTaskRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireValidAssignee(env, project, input.assigneeId)
  const db = getDb(env)
  const created = await db
    .insert(constructionTasks)
    .values({
      projectId,
      createdBy: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      stage: input.stage ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? null,
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ?? null,
    })
    .returning()
  return created[0]
}

export async function updateTask(
  env: Env,
  projectId: string,
  taskId: string,
  userId: string,
  patch: Partial<ConstructionTaskInput>,
): Promise<ConstructionTaskRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireTaskRow(env, projectId, taskId)
  await requireMutationAccess(env, project, existing, userId)
  await requireValidAssignee(env, project, patch.assigneeId)
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }

  const db = getDb(env)
  const values: Partial<typeof constructionTasks.$inferInsert> = { updatedAt: new Date() }
  if (patch.title !== undefined) values.title = patch.title.trim()
  if (patch.description !== undefined) values.description = patch.description.trim() || null
  if (patch.stage !== undefined) values.stage = patch.stage
  if (patch.status !== undefined) values.status = patch.status
  if (patch.priority !== undefined) values.priority = patch.priority
  if (patch.assigneeId !== undefined) values.assigneeId = patch.assigneeId
  if (patch.dueDate !== undefined) values.dueDate = patch.dueDate

  const updated = await db.update(constructionTasks).set(values).where(eq(constructionTasks.id, taskId)).returning()
  return updated[0]
}

export async function deleteTask(env: Env, projectId: string, taskId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireTaskRow(env, projectId, taskId)
  await requireMutationAccess(env, project, existing, userId)
  const db = getDb(env)
  await db.delete(constructionTasks).where(eq(constructionTasks.id, taskId))
}
