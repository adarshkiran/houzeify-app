// ─── Organization DTOs — 12G-B ──────────────────────────────────────────────

import type { OrganizationMemberRow, OrganizationRow } from '../db/schema.js'

export function serializeOrganization(row: OrganizationRow) {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    type: row.type,
    phone: row.phone,
    email: row.email,
    website: row.website,
    location: row.location,
    logoUrl: row.logoUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function serializeOrganizationMember(row: OrganizationMemberRow) {
  return {
    id: row.id,
    organizationId: row.organizationId,
    userId: row.userId,
    role: row.role,
    status: row.status,
    invitedBy: row.invitedBy,
    invitedAt: row.invitedAt ? row.invitedAt.toISOString() : null,
    joinedAt: row.joinedAt ? row.joinedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
