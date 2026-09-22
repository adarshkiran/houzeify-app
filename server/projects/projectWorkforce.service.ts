// ─── Project Workforce business logic — Module 06 ──────────────────────────
// Authorization, reusing Module 05's exact boundaries (same shape as
// constructionTasks.service.ts):
//   - READ (list): getProjectForAccess() — creator or any org member, any
//     role including 'viewer'.
//   - CREATE/UPDATE/DELETE: creator, OR an org member whose role is in
//     ORGANIZATION_MUTATION_ROLES. No self-add path for a plain member —
//     matches how this codebase never authorizes by assignment.
// Every read/write is scoped in the query itself. A non-owner/non-member/
// non-existent id is 404, never 403.

import { and, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { organizationMembers, projectWorkforceMembers, type ProjectRow, type ProjectWorkforceMemberRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'
import { getProjectForAccess, isAuthorizedProjectParticipant } from './project.service.js'
import type { ProjectWorkforceMemberInput, ProjectWorkforceMemberPatch } from './projectWorkforce.types.js'

async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

async function requireActiveMemberRow(env: Env, projectId: string, memberId: string): Promise<ProjectWorkforceMemberRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(projectWorkforceMembers)
    .where(
      and(
        eq(projectWorkforceMembers.id, memberId),
        eq(projectWorkforceMembers.projectId, projectId),
        eq(projectWorkforceMembers.status, 'active'),
      ),
    )
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Workforce member not found.', 404)
  return row
}

async function canMutateWorkforce(env: Env, project: ProjectRow, userId: string): Promise<boolean> {
  if (project.ownerId === userId) return true
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

async function requireMutationAccess(env: Env, project: ProjectRow, userId: string): Promise<void> {
  if (!(await canMutateWorkforce(env, project, userId))) {
    throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  }
}

async function requireValidWorkforceUser(env: Env, project: ProjectRow, candidateUserId: string): Promise<void> {
  if (!(await isAuthorizedProjectParticipant(env, project, candidateUserId))) {
    throw new HttpError('INVALID_WORKFORCE_MEMBER', 'This person is not an authorized participant of this project.', 400)
  }
}

export async function listWorkforceForProject(env: Env, projectId: string, userId: string): Promise<ProjectWorkforceMemberRow[]> {
  await requireProjectAccess(env, projectId, userId)
  const db = getDb(env)
  return db
    .select()
    .from(projectWorkforceMembers)
    .where(and(eq(projectWorkforceMembers.projectId, projectId), eq(projectWorkforceMembers.status, 'active')))
    .orderBy(projectWorkforceMembers.createdAt)
}

export async function addWorkforceMember(
  env: Env,
  projectId: string,
  userId: string,
  input: ProjectWorkforceMemberInput,
): Promise<ProjectWorkforceMemberRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireMutationAccess(env, project, userId)
  await requireValidWorkforceUser(env, project, input.userId)

  const db = getDb(env)
  const existingActive = await db
    .select()
    .from(projectWorkforceMembers)
    .where(
      and(
        eq(projectWorkforceMembers.projectId, projectId),
        eq(projectWorkforceMembers.userId, input.userId),
        eq(projectWorkforceMembers.status, 'active'),
      ),
    )
    .limit(1)
  if (existingActive[0]) {
    throw new HttpError('CONFLICT', 'This person is already on the site team.', 409)
  }

  const created = await db
    .insert(projectWorkforceMembers)
    .values({
      projectId,
      userId: input.userId,
      role: input.role.trim(),
      status: 'active',
      addedBy: userId,
    })
    .returning()
  return created[0]
}

export async function updateWorkforceMemberRole(
  env: Env,
  projectId: string,
  memberId: string,
  userId: string,
  patch: ProjectWorkforceMemberPatch,
): Promise<ProjectWorkforceMemberRow> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireMutationAccess(env, project, userId)
  await requireActiveMemberRow(env, projectId, memberId)
  if (patch.role === undefined) {
    throw new HttpError('EMPTY_PATCH', 'Provide a role to update.', 400)
  }

  const db = getDb(env)
  const updated = await db
    .update(projectWorkforceMembers)
    .set({ role: patch.role.trim(), updatedAt: new Date() })
    .where(eq(projectWorkforceMembers.id, memberId))
    .returning()
  return updated[0]
}

export async function removeWorkforceMember(env: Env, projectId: string, memberId: string, userId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, userId)
  await requireMutationAccess(env, project, userId)
  await requireActiveMemberRow(env, projectId, memberId)

  const db = getDb(env)
  await db
    .update(projectWorkforceMembers)
    .set({ status: 'removed', removedAt: new Date(), updatedAt: new Date() })
    .where(eq(projectWorkforceMembers.id, memberId))
}
