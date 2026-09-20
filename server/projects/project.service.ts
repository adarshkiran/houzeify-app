// ─── Project business logic — 12H-B, extended Module 03 ────────────────────
// Authorization boundary, extended: a project is still owned by exactly one
// user (owner_id — the creator), but Module 03 adds a second, optional
// boundary: organization membership, for a project that belongs to a
// company (organization_id). Every read/update is scoped in the SQL query
// itself (never "fetch by id, then check ownership in application code" —
// 12H-A's own explicit warning). A non-owner/non-member (or non-existent
// id) gets 404, never 403 — same "don't reveal more than necessary"
// principle organization.service.ts and 12E's OTP errors already use.
//
// Access rule (getProjectForAccess/listProjectsForOrganization):
//   - the creator (ownerId === userId) always has access — unchanged from
//     12H-B, covers every existing homeowner project (organizationId null).
//   - for an organization project, any member of that organization (any
//     role, including 'viewer') has READ access — mirrors
//     organization.service.ts's listOrganizationMembers() precisely: "any
//     member may list the roster; role only gates mutation, not visibility."
// Mutation rule (updateProject): the creator, OR an organization member
// whose role is 'owner'/'admin' — reuses organization.service.ts's own
// MUTATION_ROLES concept verbatim rather than inventing a second
// permission framework. This is deliberately not yet the full future
// role/permission matrix (e.g. a project-manager role assigned to THIS
// project specifically) — see the Module 03 report.

import { and, desc, eq, or } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { organizationMembers, projects, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { ORGANIZATION_MUTATION_ROLES } from '../organizations/organization.service.js'

export interface ProjectInput {
  name: string
  organizationId?: string
  type?: string
  location?: string
  propertyType?: string
  stage?: string
  status?: string
  timelineStart?: string
  timelineCompletion?: string
  summary?: string
}

async function findMembership(env: Env, organizationId: string, userId: string) {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId)))
    .limit(1)
  return rows[0]
}

/** Every project the authenticated user owns, most recently updated first —
 *  matches projects.ts's own getAllProjects() ordering exactly, so
 *  ProjectsListScreen's existing sort/grouping behavior is unchanged once
 *  this becomes the real source. Unchanged from 12H-B — the homeowner
 *  flow's own project list, never organization-scoped. */
export async function listProjectsForUser(env: Env, ownerId: string): Promise<ProjectRow[]> {
  const db = getDb(env)
  return db.select().from(projects).where(eq(projects.ownerId, ownerId)).orderBy(desc(projects.updatedAt))
}

/** Every project belonging to `organizationId`, most recently updated first
 *  — only for an authenticated member of that organization (any role);
 *  throws NOT_FOUND (never FORBIDDEN) for a non-member, so a client-
 *  controlled organization id can't even confirm the organization exists. */
export async function listProjectsForOrganization(env: Env, organizationId: string, userId: string): Promise<ProjectRow[]> {
  const membership = await findMembership(env, organizationId, userId)
  if (!membership) {
    throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  }
  const db = getDb(env)
  return db.select().from(projects).where(eq(projects.organizationId, organizationId)).orderBy(desc(projects.updatedAt))
}

/** `ownerId` is always the authenticated caller — never client-supplied.
 *  When `input.organizationId` is provided, membership is verified first;
 *  a non-member gets the same NOT_FOUND treatment as every other
 *  organization-scoped access check, never a fabricated project. */
export async function createProject(env: Env, ownerId: string, input: ProjectInput): Promise<ProjectRow> {
  if (input.organizationId) {
    const membership = await findMembership(env, input.organizationId, ownerId)
    if (!membership) {
      throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
    }
  }

  const db = getDb(env)
  const created = await db
    .insert(projects)
    .values({
      ownerId,
      organizationId: input.organizationId || null,
      name: input.name.trim(),
      type: input.type?.trim() || null,
      location: input.location?.trim() || null,
      propertyType: input.propertyType?.trim() || null,
      stage: input.stage?.trim() || null,
      status: input.status?.trim() || null,
      timelineStart: input.timelineStart?.trim() || null,
      timelineCompletion: input.timelineCompletion?.trim() || null,
      summary: input.summary?.trim() || null,
    })
    .returning()
  return created[0]
}

/** Returns the project if `userId` created it, OR (for an organization
 *  project) is a member of that organization — undefined otherwise (the
 *  route maps that to 404). Scoped in the query itself: a single SQL OR,
 *  never "fetch unscoped, then check in application code". */
export async function getProjectForAccess(env: Env, projectId: string, userId: string): Promise<ProjectRow | undefined> {
  const db = getDb(env)
  const rows = await db
    .select({ project: projects, membership: organizationMembers })
    .from(projects)
    .leftJoin(
      organizationMembers,
      and(eq(organizationMembers.organizationId, projects.organizationId), eq(organizationMembers.userId, userId)),
    )
    .where(and(eq(projects.id, projectId), or(eq(projects.ownerId, userId), eq(organizationMembers.userId, userId))))
    .limit(1)
  return rows[0]?.project
}

/** True if candidateUserId is a real, authorized participant of this
 *  project — its own creator, or (for an organization project) any
 *  member of that organization, any role. Used to validate a client-
 *  supplied assigneeId/reportedBy on Task/Issue create-or-update; never
 *  trust a client-supplied user id without this check. */
export async function isAuthorizedProjectParticipant(env: Env, project: ProjectRow, candidateUserId: string): Promise<boolean> {
  if (project.ownerId === candidateUserId) return true
  if (!project.organizationId) return false
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, project.organizationId), eq(organizationMembers.userId, candidateUserId)))
    .limit(1)
  return rows.length > 0
}

/** Update authorization: the project's creator, or (for an organization
 *  project) a member whose role is 'owner'/'admin' — reuses
 *  organization.service.ts's own ORGANIZATION_MUTATION_ROLES, never a
 *  second permission framework. */
export async function updateProject(env: Env, projectId: string, userId: string, patch: Partial<ProjectInput>): Promise<ProjectRow> {
  const db = getDb(env)
  const rows = await db
    .select({ project: projects, membership: organizationMembers })
    .from(projects)
    .leftJoin(
      organizationMembers,
      and(eq(organizationMembers.organizationId, projects.organizationId), eq(organizationMembers.userId, userId)),
    )
    .where(eq(projects.id, projectId))
    .limit(1)
  const existing = rows[0]
  if (!existing) {
    throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  }
  const isCreator = existing.project.ownerId === userId
  const isOrgMutator = Boolean(existing.membership) && ORGANIZATION_MUTATION_ROLES.includes(existing.membership!.role as (typeof ORGANIZATION_MUTATION_ROLES)[number])
  if (!isCreator && !isOrgMutator) {
    throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }

  const values: Partial<typeof projects.$inferInsert> = { updatedAt: new Date() }
  if (patch.name !== undefined) values.name = patch.name.trim()
  if (patch.type !== undefined) values.type = patch.type.trim() || null
  if (patch.location !== undefined) values.location = patch.location.trim() || null
  if (patch.propertyType !== undefined) values.propertyType = patch.propertyType.trim() || null
  if (patch.stage !== undefined) values.stage = patch.stage.trim() || null
  if (patch.status !== undefined) values.status = patch.status.trim() || null
  if (patch.timelineStart !== undefined) values.timelineStart = patch.timelineStart.trim() || null
  if (patch.timelineCompletion !== undefined) values.timelineCompletion = patch.timelineCompletion.trim() || null
  if (patch.summary !== undefined) values.summary = patch.summary.trim() || null

  const updated = await db.update(projects).set(values).where(eq(projects.id, projectId)).returning()
  return updated[0]
}
