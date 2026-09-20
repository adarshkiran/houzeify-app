// ─── Organization business logic — 12G-B ───────────────────────────────────
// Authorization boundary for every function here:
//   - creation: the owner is always the authenticated caller (userId param),
//     never a client-supplied value.
//   - read/list/update/members: membership in organization_members is the
//     access boundary — request.user.id must have a row in that table for
//     the organization in question. A non-member gets 404 (not 403) so a
//     private organization's existence isn't confirmed to an outsider —
//     same "don't reveal more than necessary" principle 12E's OTP errors
//     already use.

import { and, eq } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { organizationMembers, organizations, type OrganizationMemberRow, type OrganizationRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'

export const ORGANIZATION_MEMBER_ROLES = ['owner', 'admin', 'project-manager', 'team-member', 'viewer'] as const
export type OrganizationMemberRole = (typeof ORGANIZATION_MEMBER_ROLES)[number]

export const ORGANIZATION_MEMBER_STATUSES = ['invited', 'active', 'suspended', 'removed'] as const
export type OrganizationMemberStatus = (typeof ORGANIZATION_MEMBER_STATUSES)[number]

// Only owner/admin may mutate the organization's own identity fields.
// Exported (Module 03) so project.service.ts can reuse the exact same
// mutation boundary for an organization-owned project, rather than
// inventing a second permission framework.
export const ORGANIZATION_MUTATION_ROLES: OrganizationMemberRole[] = ['owner', 'admin']

export interface OrganizationInput {
  name: string
  type?: string
  phone?: string
  email?: string
  website?: string
  location?: string
  logoUrl?: string
}

async function findMembership(env: Env, organizationId: string, userId: string): Promise<OrganizationMemberRow | undefined> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId)))
    .limit(1)
  return rows[0]
}

export async function listOrganizationsForUser(env: Env, userId: string): Promise<OrganizationRow[]> {
  const db = getDb(env)
  const rows = await db
    .select({ organization: organizations })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId))
  return rows.map(r => r.organization)
}

/** Creates an organization and its owner membership atomically — a
 *  transaction failure partway through must never leave an
 *  organization with no owner membership, or vice versa. */
export async function createOrganization(env: Env, ownerId: string, input: OrganizationInput): Promise<OrganizationRow> {
  const db = getDb(env)
  const now = new Date()

  return db.transaction(async tx => {
    const created = await tx
      .insert(organizations)
      .values({
        ownerId,
        name: input.name.trim(),
        type: input.type?.trim() || null,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        website: input.website?.trim() || null,
        location: input.location?.trim() || null,
        logoUrl: input.logoUrl?.trim() || null,
      })
      .returning()
    const organization = created[0]

    await tx.insert(organizationMembers).values({
      organizationId: organization.id,
      userId: ownerId,
      role: 'owner',
      status: 'active',
      invitedBy: null,
      joinedAt: now,
    })

    return organization
  })
}

/** Returns the organization only if `userId` is a member — undefined
 *  otherwise (the route maps that to 404, never 403, for a non-member). */
export async function getOrganizationForMember(env: Env, organizationId: string, userId: string): Promise<OrganizationRow | undefined> {
  const membership = await findMembership(env, organizationId, userId)
  if (!membership) return undefined

  const db = getDb(env)
  const rows = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1)
  return rows[0]
}

export async function updateOrganization(env: Env, organizationId: string, userId: string, patch: Partial<OrganizationInput>): Promise<OrganizationRow> {
  const membership = await findMembership(env, organizationId, userId)
  if (!membership) {
    throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  }
  if (!ORGANIZATION_MUTATION_ROLES.includes(membership.role as OrganizationMemberRole)) {
    throw new HttpError('FORBIDDEN', 'Only an organization owner or admin can update this organization.', 403)
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError('EMPTY_PATCH', 'Provide at least one field to update.', 400)
  }

  const db = getDb(env)
  const values: Partial<typeof organizations.$inferInsert> = { updatedAt: new Date() }
  if (patch.name !== undefined) values.name = patch.name.trim()
  if (patch.type !== undefined) values.type = patch.type.trim() || null
  if (patch.phone !== undefined) values.phone = patch.phone.trim() || null
  if (patch.email !== undefined) values.email = patch.email.trim() || null
  if (patch.website !== undefined) values.website = patch.website.trim() || null
  if (patch.location !== undefined) values.location = patch.location.trim() || null
  if (patch.logoUrl !== undefined) values.logoUrl = patch.logoUrl.trim() || null

  const updated = await db.update(organizations).set(values).where(eq(organizations.id, organizationId)).returning()
  return updated[0]
}

/** Any member (including 'viewer') may list the roster — membership itself
 *  is the read boundary; role only gates mutation, not visibility. */
export async function listOrganizationMembers(env: Env, organizationId: string, userId: string): Promise<OrganizationMemberRow[]> {
  const membership = await findMembership(env, organizationId, userId)
  if (!membership) {
    throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  }

  const db = getDb(env)
  return db.select().from(organizationMembers).where(eq(organizationMembers.organizationId, organizationId))
}
