// ─── Shared project-access helper — Module 07 ──────────────────────────────
// One place for the project authorization boundary that Modules 03/05/06
// each carry a local copy of (constructionTasks.service.ts,
// projectWorkforce.service.ts, ...). This adds NO new rule:
//   - READ: getProjectForAccess() — the creator, or any member of the
//     project's organization (any role, including 'viewer').
//   - MUTATE: the creator, OR an organization member whose role is in
//     ORGANIZATION_MUTATION_ROLES.
// A non-owner/non-member/non-existent id is 404, never 403. TABLE C: the
// membership lookup now requires status:'active' — an invited/suspended/
// removed row no longer grants access (previously recorded as inherited
// debt; fixed uniformly across every membership-lookup copy in this
// codebase, see the TABLE C plan/audit).
// The existing services are not refactored onto this helper yet.

import { and, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { organizationMembers, projectCustomers, projects, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { ORGANIZATION_MUTATION_ROLES, type OrganizationMemberRole } from '../organizations/organization.service.js'
import { getProjectForAccess } from './project.service.js'

export type ProjectAccessKind = 'company' | 'customer'

export interface ProjectAccess {
  project: ProjectRow
  kind: ProjectAccessKind
}

export async function resolveProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectAccess | undefined> {
  const companyProject = await getProjectForAccess(env, projectId, userId)
  if (companyProject) return { project: companyProject, kind: 'company' }

  const db = getDb(env)
  const links = await db
    .select({ project: projects, link: projectCustomers })
    .from(projectCustomers)
    .innerJoin(projects, eq(projects.id, projectCustomers.projectId))
    .where(
      and(
        eq(projectCustomers.projectId, projectId),
        eq(projectCustomers.userId, userId),
        eq(projectCustomers.status, 'active'),
      ),
    )
    .limit(1)
  const hit = links[0]
  if (!hit?.project.organizationId) return undefined
  return { project: hit.project, kind: 'customer' }
}

export async function requireProjectAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow> {
  const project = await getProjectForAccess(env, projectId, userId)
  if (!project) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return project
}

export const requireCompanyRead = requireProjectAccess

export async function requireCompanyOrCustomerRead(env: Env, projectId: string, userId: string): Promise<ProjectAccess> {
  const access = await resolveProjectAccess(env, projectId, userId)
  if (!access) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return access
}

export async function canMutateAtProjectLevel(env: Env, project: ProjectRow, userId: string): Promise<boolean> {
  if (project.ownerId === userId) return true
  if (!project.organizationId) return false
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
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

export async function requireProjectMutation(env: Env, project: ProjectRow, userId: string): Promise<void> {
  if (!(await canMutateAtProjectLevel(env, project, userId))) {
    throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  }
}
