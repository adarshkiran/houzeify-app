// ─── Construction Issue business logic — Module 05 ─────────────────────────
// Identical authorization shape to constructionTasks.service.ts. One extra
// rule: resolvedAt is managed here, server-side, based on a patch's status
// value — set exactly when status transitions to 'resolved' from a
// non-'resolved' value, and cleared whenever the new status is anything
// other than 'resolved' — never settable or clearable directly by a client
// (no schema property exists for it at all).

import { and, desc, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { constructionIssues, organizationMembers, type ConstructionIssueRow, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getProjectForAccess, isAuthorizedProjectParticipant } from './project.service.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'

export interface ConstructionIssueInput {
  title: string
  description?: string
  stage?: string
  status?: string
  priority?: string
  assigneeId?: string
}

async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function requireIssueRow(env: Env, projectId: string, issueId: string): Promise<ConstructionIssueRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(constructionIssues)
    .where(and(eq(constructionIssues.id, issueId), eq(constructionIssues.projectId, projectId)))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Issue not found.', 404)
  return row
}

async function canMutateIssue(env: Env, project: ProjectRow, row: ConstructionIssueRow, userId: string): Promise<boolean> {
  if (row.reportedBy === userId) return true
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

async function requireMutationAccess(env: Env, project: ProjectRow, row: ConstructionIssueRow, userId: string): Promise<void> {
  if (!(await canMutateIssue(env, project, row, userId))) {
    throw new HttpError('NOT_FOUND', 'Issue not found.', 404)
  }
}

async function requireValidAssignee(env: Env, project: ProjectRow, assigneeId: string | undefined): Promise<void> {
  if (assigneeId === undefined) return
  if (!(await isAuthorizedProjectParticipant(env, project, assigneeId))) {
    throw new HttpError('INVALID_ASSIGNEE', 'Assignee is not an authorized participant of this project.', 400)
  }
}

export async function listIssuesForProject(env: Env, projectId: string, userId: string): Promise<ConstructionIssueRow[]> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  return db.select().from(constructionIssues).where(eq(constructionIssues.projectId, projectId)).orderBy(desc(constructionIssues.createdAt))
}

export async function createIssue(env: Env, projectId: string, userId: string, input: ConstructionIssueInput): Promise<ConstructionIssueRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireValidAssignee(env, project, input.assigneeId)
  const db = getDb(env)
  const created = await db
    .insert(constructionIssues)
    .values({
      projectId,
      reportedBy: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      stage: input.stage ?? null,
      status: input.status ?? 'open',
      priority: input.priority ?? null,
      assigneeId: input.assigneeId ?? null,
    })
    .returning()
  return created[0]
}

export async function updateIssue(
  env: Env,
  projectId: string,
  issueId: string,
  userId: string,
  patch: Partial<ConstructionIssueInput>,
): Promise<ConstructionIssueRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireIssueRow(env, projectId, issueId)
  await requireMutationAccess(env, project, existing, userId)
  await requireValidAssignee(env, project, patch.assigneeId)
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }

  const db = getDb(env)
  const values: Partial<typeof constructionIssues.$inferInsert> = { updatedAt: new Date() }
  if (patch.title !== undefined) values.title = patch.title.trim()
  if (patch.description !== undefined) values.description = patch.description.trim() || null
  if (patch.stage !== undefined) values.stage = patch.stage
  if (patch.priority !== undefined) values.priority = patch.priority
  if (patch.assigneeId !== undefined) values.assigneeId = patch.assigneeId
  if (patch.status !== undefined) {
    values.status = patch.status
    if (patch.status === 'resolved') {
      if (existing.status !== 'resolved') {
        values.resolvedAt = new Date()
      }
    } else {
      values.resolvedAt = null
    }
  }

  const updated = await db.update(constructionIssues).set(values).where(eq(constructionIssues.id, issueId)).returning()
  return updated[0]
}

export async function deleteIssue(env: Env, projectId: string, issueId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  const existing = await requireIssueRow(env, projectId, issueId)
  await requireMutationAccess(env, project, existing, userId)
  const db = getDb(env)
  await db.delete(constructionIssues).where(eq(constructionIssues.id, issueId))
}
