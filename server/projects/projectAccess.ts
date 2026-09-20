// ─── Shared project-access helper — Module 07 ──────────────────────────────
// One place for the project authorization boundary that Modules 03/05/06
// each carry a local copy of (constructionTasks.service.ts,
// projectWorkforce.service.ts, ...). This adds NO new rule:
//   - READ: getProjectForAccess() — the creator, or any member of the
//     project's organization (any role, including 'viewer').
//   - MUTATE: the creator, OR an organization member whose role is in
//     ORGANIZATION_MUTATION_ROLES.
// A non-owner/non-member/non-existent id is 404, never 403. There is
// deliberately no status filter on the membership lookup — that matches
// the existing behavior (inherited debt, recorded).
// The existing services are not refactored onto this helper yet.

import { and, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { organizationMembers, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'
import { getProjectForAccess } from './project.service.js'

export async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

export async function canMutateAtProjectLevel(env: Env, project: ProjectRow, userId: string): Promise<boolean> {
  if (project.ownerId === userId) return true
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

export async function requireProjectMutation(env: Env, project: ProjectRow, userId: string): Promise<void> {
  if (!(await canMutateAtProjectLevel(env, project, userId))) {
    throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  }
}
