import { and, desc, eq, inArray, ne, sql } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  customerProfiles,
  organizations,
  projectCustomers,
  projects,
  type CustomerProfileRow,
  type ProjectCustomerRow,
  type ProjectRow,
} from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { isAuthorizedProjectParticipant } from './project.service.js'
import { requireProjectAccess, requireProjectMutation } from './projectAccess.js'
import {
  ALREADY_PARTICIPANT_MESSAGE,
  NOT_COMPANY_PROJECT_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from './projectCustomer.types.js'

/** Rows with customerStatus 'invited' carry only id, name, organizationName,
 *  customerStatus and invitedAt; every other field is null (spec §11). */
export interface CustomerProjectListItem {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  timelineStart: string | null
  timelineCompletion: string | null
  organizationId: string | null
  organizationName: string | null
  customerStatus: string
  invitedAt: string
  acceptedAt: string | null
}

async function requireCompanyProject(project: ProjectRow): Promise<void> {
  if (!project.organizationId) {
    throw new HttpError('NOT_COMPANY_PROJECT', NOT_COMPANY_PROJECT_MESSAGE, 409)
  }
}

async function findCustomerProfileByEmail(env: Env, email: string): Promise<CustomerProfileRow> {
  const normalized = email.trim().toLowerCase()
  const db = getDb(env)
  const rows = await db
    .select()
    .from(customerProfiles)
    .where(sql`lower(${customerProfiles.email}) = ${normalized}`)
    .limit(1)
  const profile = rows[0]
  if (!profile) {
    throw new HttpError('USER_NOT_FOUND', USER_NOT_FOUND_MESSAGE, 404)
  }
  return profile
}

async function loadProfile(env: Env, userId: string): Promise<CustomerProfileRow | undefined> {
  const db = getDb(env)
  const rows = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1)
  return rows[0]
}

export async function inviteProjectCustomer(env: Env, projectId: string, actorId: string, email: string): Promise<ProjectCustomerRow> {
  const project = await requireProjectAccess(env, projectId, actorId)
  await requireProjectMutation(env, project, actorId)
  await requireCompanyProject(project)

  const profile = await findCustomerProfileByEmail(env, email)
  if (await isAuthorizedProjectParticipant(env, project, profile.userId)) {
    throw new HttpError('ALREADY_PARTICIPANT', ALREADY_PARTICIPANT_MESSAGE, 409)
  }

  const db = getDb(env)
  const existing = await db.select().from(projectCustomers).where(eq(projectCustomers.projectId, projectId)).limit(1)
  const now = new Date()

  if (existing[0]) {
    const updated = await db
      .update(projectCustomers)
      .set({
        userId: profile.userId,
        status: 'invited',
        invitedBy: actorId,
        invitedAt: now,
        acceptedAt: null,
        removedAt: null,
        updatedAt: now,
      })
      .where(eq(projectCustomers.id, existing[0].id))
      .returning()
    return updated[0]
  }

  const created = await db
    .insert(projectCustomers)
    .values({
      projectId,
      userId: profile.userId,
      status: 'invited',
      invitedBy: actorId,
    })
    .returning()
  return created[0]
}

export async function getProjectCustomer(
  env: Env,
  projectId: string,
  actorId: string,
): Promise<{ row: ProjectCustomerRow; profile: CustomerProfileRow | undefined }> {
  await requireProjectAccess(env, projectId, actorId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(projectCustomers)
    .where(and(eq(projectCustomers.projectId, projectId), ne(projectCustomers.status, 'removed')))
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return { row, profile: await loadProfile(env, row.userId) }
}

export async function removeProjectCustomer(env: Env, projectId: string, actorId: string): Promise<void> {
  const project = await requireProjectAccess(env, projectId, actorId)
  await requireProjectMutation(env, project, actorId)
  const db = getDb(env)
  const now = new Date()
  const updated = await db
    .update(projectCustomers)
    .set({ status: 'removed', removedAt: now, updatedAt: now })
    .where(and(eq(projectCustomers.projectId, projectId), ne(projectCustomers.status, 'removed')))
    .returning({ id: projectCustomers.id })
  if (!updated[0]) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
}

export async function acceptProjectCustomerInvite(env: Env, projectId: string, userId: string): Promise<ProjectCustomerRow> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(projectCustomers)
    .where(
      and(eq(projectCustomers.projectId, projectId), eq(projectCustomers.userId, userId), eq(projectCustomers.status, 'invited')),
    )
    .limit(1)
  const row = rows[0]
  if (!row) throw new HttpError('NOT_FOUND', 'Project not found.', 404)

  // Re-assert the company-owned invariant on this path too: a project that
  // no longer belongs to an organization cannot be accepted into.
  const projectRows = await db.select({ organizationId: projects.organizationId }).from(projects).where(eq(projects.id, projectId)).limit(1)
  if (!projectRows[0]?.organizationId) throw new HttpError('NOT_FOUND', 'Project not found.', 404)

  const now = new Date()
  const updated = await db
    .update(projectCustomers)
    .set({ status: 'active', acceptedAt: now, updatedAt: now })
    .where(and(eq(projectCustomers.id, row.id), eq(projectCustomers.projectId, projectId), eq(projectCustomers.status, 'invited')))
    .returning()
  if (!updated[0]) throw new HttpError('NOT_FOUND', 'Project not found.', 404)
  return updated[0]
}

export async function listCustomerProjectsForUser(env: Env, userId: string): Promise<CustomerProjectListItem[]> {
  const db = getDb(env)
  const rows = await db
    .select({
      project: projects,
      link: projectCustomers,
      organizationName: organizations.name,
    })
    .from(projectCustomers)
    .innerJoin(projects, eq(projects.id, projectCustomers.projectId))
    .leftJoin(organizations, eq(organizations.id, projects.organizationId))
    .where(and(eq(projectCustomers.userId, userId), inArray(projectCustomers.status, ['invited', 'active'])))
    .orderBy(desc(projectCustomers.updatedAt), desc(projectCustomers.id))

  return rows.map(({ project, link, organizationName }) => {
    const invitedAt = link.invitedAt.toISOString()
    if (link.status === 'invited') {
      // Pre-acceptance the invitee sees an invitation only (spec §11): name,
      // organization display name and invitedAt. Every other key is present
      // (so the client type stays stable) but withheld.
      return {
        id: project.id,
        name: project.name,
        location: null,
        propertyType: null,
        stage: null,
        status: null,
        timelineStart: null,
        timelineCompletion: null,
        organizationId: null,
        organizationName: organizationName ?? null,
        customerStatus: link.status,
        invitedAt,
        acceptedAt: null,
      }
    }
    return {
      id: project.id,
      name: project.name,
      location: project.location,
      propertyType: project.propertyType,
      stage: project.stage,
      status: project.status,
      timelineStart: project.timelineStart,
      timelineCompletion: project.timelineCompletion,
      organizationId: project.organizationId,
      organizationName: organizationName ?? null,
      customerStatus: link.status,
      invitedAt,
      acceptedAt: link.acceptedAt ? link.acceptedAt.toISOString() : null,
    }
  })
}

export async function loadCustomerProfileForUser(env: Env, userId: string): Promise<CustomerProfileRow | undefined> {
  return loadProfile(env, userId)
}
