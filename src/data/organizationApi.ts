// ─── Organization API layer (12G-C3) — typed calls against 12G-B ──────────
// Mirrors customerProfileApi.ts / partnerProfileApi.ts's shape, with one
// structural difference: Organization is a LIST resource (a user can belong
// to more than one), never a single 0..1 profile, so this layer has no
// "get the one" call — only list/create/update, each keyed by a real
// organization id. Backend contract read directly from
// server/organizations/organization.routes.ts and organization.types.ts —
// GET / (list), POST / (create), PATCH /:organizationId (update), all
// requiring the session cookie, ownership/membership always resolved
// server-side from request.user.id — this layer never sends an ownerId of
// its own.

import { ApiError, apiGet, apiPatch, apiPost } from './apiClient'

/** Mirrors server/organizations/organization.types.ts's
 *  serializeOrganization() output exactly. `type` is deliberately a plain
 *  nullable string, not a closed union — see organizationState.tsx's
 *  header comment on why the frontend never invents a shared taxonomy for
 *  it. */
export interface Organization {
  id: string
  ownerId: string
  name: string
  type: string | null
  phone: string | null
  email: string | null
  website: string | null
  location: string | null
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface OrganizationInput {
  name: string
  type?: string
  phone?: string
  email?: string
  website?: string
  location?: string
  logoUrl?: string
}

/** Mirrors server/organizations/organization.types.ts's
 *  serializeOrganizationMember() output exactly. No joined user name/email —
 *  the backend returns the raw membership row only (see
 *  organization.service.ts's listOrganizationMembers()); callers resolve a
 *  human-readable identity themselves (e.g. "you" for the caller's own row
 *  via useAuth()). */
export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: string
  status: string
  invitedBy: string | null
  invitedAt: string | null
  joinedAt: string | null
  createdAt: string
  updatedAt: string
}

interface OrganizationListEnvelope {
  data: { organizations: Organization[] }
}
interface OrganizationEnvelope {
  data: { organization: Organization }
}
interface OrganizationMemberListEnvelope {
  data: { members: OrganizationMember[] }
}

/** Every organization the authenticated user is a member of (any role) —
 *  never filtered to "owned" only, since a non-owner member's org is a
 *  legitimate membership too, even though 12G-C3 doesn't yet build any UI
 *  for joining someone else's. */
export async function listOrganizations(): Promise<Organization[]> {
  const res = await apiGet<OrganizationListEnvelope>('/api/v1/organizations')
  return res.data.organizations
}

export async function createOrganization(input: OrganizationInput): Promise<Organization> {
  const res = await apiPost<OrganizationEnvelope>('/api/v1/organizations', input)
  return res.data.organization
}

export async function updateOrganization(organizationId: string, patch: Partial<OrganizationInput>): Promise<Organization> {
  const res = await apiPatch<OrganizationEnvelope>(`/api/v1/organizations/${organizationId}`, patch)
  return res.data.organization
}

/** GET /:organizationId/members — real backend membership roster (12G-B),
 *  never a fabricated list. Any member (including 'viewer') can read this;
 *  the server 404s for a non-member/non-existent id, same "don't reveal
 *  more than necessary" convention as every other org endpoint. */
export async function listOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const res = await apiGet<OrganizationMemberListEnvelope>(`/api/v1/organizations/${organizationId}/members`)
  return res.data.members
}

/** Same convention as describeCustomerProfileError()/describePartnerProfileError().
 *  FORBIDDEN/NOT_FOUND are real, user-facing outcomes here (a non-owner/
 *  non-admin member attempting to edit, or a stale organization id) —
 *  their backend messages are already written to be shown directly. */
export function describeOrganizationError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'

  switch (err.code) {
    case 'EMPTY_PATCH':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
    case 'NOT_FOUND':
    case 'FORBIDDEN':
    case 'INVALID_ID':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
