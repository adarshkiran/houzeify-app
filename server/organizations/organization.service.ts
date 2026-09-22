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

import { and, eq, sql } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  organizationMembers,
  organizations,
  partnerProfiles,
  type OrganizationMemberRow,
  type OrganizationRow,
  type PartnerProfileRow,
} from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'

export const ORGANIZATION_MEMBER_ROLES = ['owner', 'admin', 'project-manager', 'team-member', 'viewer'] as const
export type OrganizationMemberRole = (typeof ORGANIZATION_MEMBER_ROLES)[number]

// A member can be invited directly onto the roster (TABLE C: no separate
// accept step exists yet — see addOrganizationMember below), but never
// promoted straight to 'owner' through that path; ownership transfer is a
// deliberately separate, unbuilt concern.
export const INVITABLE_ORGANIZATION_MEMBER_ROLES = ['admin', 'project-manager', 'team-member', 'viewer'] as const

export const ORGANIZATION_MEMBER_STATUSES = ['invited', 'active', 'suspended', 'removed'] as const
export type OrganizationMemberStatus = (typeof ORGANIZATION_MEMBER_STATUSES)[number]

// Statuses a member-management PATCH/DELETE may set. Never 'invited' here —
// that value is only ever produced internally (see addOrganizationMember).
export const SETTABLE_ORGANIZATION_MEMBER_STATUSES = ['active', 'suspended', 'removed'] as const

// Only owner/admin may mutate the organization's own identity fields.
// Exported (Module 03) so project.service.ts can reuse the exact same
// mutation boundary for an organization-owned project, rather than
// inventing a second permission framework.
export const ORGANIZATION_MUTATION_ROLES: OrganizationMemberRole[] = ['owner', 'admin']

export const USER_NOT_FOUND_MESSAGE = 'No Houzeify professional was found with that email.'
export const ALREADY_MEMBER_MESSAGE = 'This person is already a member of the organization.'
export const LAST_OWNER_MESSAGE = 'An organization must keep at least one active owner.'

export interface OrganizationInput {
  name: string
  type?: string
  phone?: string
  email?: string
  website?: string
  location?: string
  logoUrl?: string
}

// The access boundary everywhere this module (and every other module that
// copies this pattern — project.service.ts, projectAccess.ts,
// projectWorkforce.service.ts, constructionTasks.service.ts,
// constructionIssues.service.ts, dailyProgress.service.ts) checks "is this
// user really a member": status must be 'active'. An 'invited' membership
// hasn't been accepted (TABLE C doesn't add an accept step, so this value
// is presently unused, but the check stays correct if one is added later);
// 'suspended'/'removed' must not continue granting access merely because
// the row exists (TABLE C finding).
async function findMembership(env: Env, organizationId: string, userId: string): Promise<OrganizationMemberRow | undefined> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, 'active'),
      ),
    )
    .limit(1)
  return rows[0]
}

/** Unlike findMembership, this is NOT an access check — it looks up a
 *  membership row regardless of status, for member-management itself
 *  (reactivating a removed/suspended row, or targeting a row to mutate). */
async function findMembershipRowByUser(env: Env, organizationId: string, userId: string): Promise<OrganizationMemberRow | undefined> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId)))
    .limit(1)
  return rows[0]
}

async function findMembershipRowById(env: Env, organizationId: string, memberId: string): Promise<OrganizationMemberRow | undefined> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, organizationId)))
    .limit(1)
  return rows[0]
}

async function findPartnerProfileByEmail(env: Env, email: string): Promise<PartnerProfileRow> {
  const normalized = email.trim().toLowerCase()
  const db = getDb(env)
  const rows = await db
    .select()
    .from(partnerProfiles)
    .where(sql`lower(${partnerProfiles.contactEmail}) = ${normalized}`)
    .limit(1)
  const profile = rows[0]
  if (!profile) {
    throw new HttpError('USER_NOT_FOUND', USER_NOT_FOUND_MESSAGE, 404)
  }
  return profile
}

/** True if changing/removing `memberId` would leave the organization with
 *  zero active owners. Counts active owners other than `memberId` itself,
 *  so demoting/removing the last one is rejected but demoting one of two
 *  is fine. */
async function wouldRemoveLastActiveOwner(env: Env, organizationId: string, memberId: string): Promise<boolean> {
  const db = getDb(env)
  const rows = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.role, 'owner'),
        eq(organizationMembers.status, 'active'),
      ),
    )
  return rows.every(row => row.id === memberId)
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

async function requireMutationMembership(env: Env, organizationId: string, actorId: string): Promise<OrganizationMemberRow> {
  const membership = await findMembership(env, organizationId, actorId)
  if (!membership) {
    throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  }
  if (!ORGANIZATION_MUTATION_ROLES.includes(membership.role as OrganizationMemberRole)) {
    throw new HttpError('FORBIDDEN', 'Only an organization owner or admin can manage members.', 403)
  }
  return membership
}

/** Adds a person to the organization roster by their partner-profile email,
 *  or reactivates a previously suspended/removed membership. Grants
 *  `status: 'active'` immediately — there is deliberately no separate
 *  invite/accept step yet (no notification-delivery mechanism exists to
 *  make one meaningful); see the TABLE C plan for that scoping decision. */
export async function addOrganizationMember(
  env: Env,
  organizationId: string,
  actorId: string,
  email: string,
  role: (typeof INVITABLE_ORGANIZATION_MEMBER_ROLES)[number],
): Promise<OrganizationMemberRow> {
  await requireMutationMembership(env, organizationId, actorId)

  const profile = await findPartnerProfileByEmail(env, email)
  const db = getDb(env)
  const now = new Date()
  const existing = await findMembershipRowByUser(env, organizationId, profile.userId)

  if (existing) {
    if (existing.status === 'active' || existing.status === 'invited') {
      throw new HttpError('ALREADY_MEMBER', ALREADY_MEMBER_MESSAGE, 409)
    }
    const updated = await db
      .update(organizationMembers)
      .set({ role, status: 'active', invitedBy: actorId, invitedAt: now, joinedAt: now, updatedAt: now })
      .where(eq(organizationMembers.id, existing.id))
      .returning()
    return updated[0]
  }

  const created = await db
    .insert(organizationMembers)
    .values({
      organizationId,
      userId: profile.userId,
      role,
      status: 'active',
      invitedBy: actorId,
      invitedAt: now,
      joinedAt: now,
    })
    .returning()
  return created[0]
}

export async function updateOrganizationMember(
  env: Env,
  organizationId: string,
  actorId: string,
  memberId: string,
  patch: { role?: OrganizationMemberRole; status?: (typeof SETTABLE_ORGANIZATION_MEMBER_STATUSES)[number] },
): Promise<OrganizationMemberRow> {
  await requireMutationMembership(env, organizationId, actorId)

  if (patch.role === undefined && patch.status === undefined) {
    throw new HttpError('EMPTY_PATCH', 'Provide a role or a status to update.', 400)
  }
  if (patch.role === 'owner') {
    throw new HttpError('VALIDATION_ERROR', 'Ownership cannot be granted through this endpoint.', 400)
  }

  const target = await findMembershipRowById(env, organizationId, memberId)
  if (!target) {
    throw new HttpError('NOT_FOUND', 'Member not found.', 404)
  }

  // patch.role can no longer be 'owner' here (rejected above), so any
  // defined role change necessarily moves the target away from ownership.
  const wouldLeaveOwnership = target.role === 'owner' && (patch.role !== undefined || patch.status === 'suspended' || patch.status === 'removed')
  if (wouldLeaveOwnership && (await wouldRemoveLastActiveOwner(env, organizationId, memberId))) {
    throw new HttpError('LAST_OWNER', LAST_OWNER_MESSAGE, 409)
  }

  const db = getDb(env)
  const values: Partial<typeof organizationMembers.$inferInsert> = { updatedAt: new Date() }
  if (patch.role !== undefined) values.role = patch.role
  if (patch.status !== undefined) values.status = patch.status

  const updated = await db.update(organizationMembers).set(values).where(eq(organizationMembers.id, memberId)).returning()
  return updated[0]
}

export async function removeOrganizationMember(env: Env, organizationId: string, actorId: string, memberId: string): Promise<void> {
  await requireMutationMembership(env, organizationId, actorId)

  const target = await findMembershipRowById(env, organizationId, memberId)
  if (!target) {
    throw new HttpError('NOT_FOUND', 'Member not found.', 404)
  }
  if (target.role === 'owner' && (await wouldRemoveLastActiveOwner(env, organizationId, memberId))) {
    throw new HttpError('LAST_OWNER', LAST_OWNER_MESSAGE, 409)
  }

  const db = getDb(env)
  await db
    .update(organizationMembers)
    .set({ status: 'removed', updatedAt: new Date() })
    .where(eq(organizationMembers.id, memberId))
}
