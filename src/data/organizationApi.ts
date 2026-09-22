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

import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

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

/** TABLE C — the roles addOrganizationMember/updateOrganizationMember will
 *  accept; 'owner' is excluded everywhere on this path (mirrors
 *  server/organizations/organization.schemas.ts's enum exactly —
 *  ownership transfer isn't built). */
export type InvitableOrganizationMemberRole = 'admin' | 'project-manager' | 'team-member' | 'viewer'
export type SettableOrganizationMemberStatus = 'active' | 'suspended' | 'removed'

interface OrganizationListEnvelope {
  data: { organizations: Organization[] }
}
interface OrganizationEnvelope {
  data: { organization: Organization }
}
interface OrganizationMemberListEnvelope {
  data: { members: OrganizationMember[] }
}
interface OrganizationMemberEnvelope {
  data: { member: OrganizationMember }
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

/** POST /:organizationId/members (TABLE C) — adds the person with this
 *  partner-profile email to the roster, or reactivates a previously
 *  suspended/removed membership, immediately as `status:'active'` (no
 *  separate accept step — see organization.service.ts's own comment on
 *  addOrganizationMember). Owner/admin only; the server 404s for anyone
 *  else, same convention as every other mutation here. */
export async function addOrganizationMember(
  organizationId: string,
  email: string,
  role: InvitableOrganizationMemberRole,
): Promise<OrganizationMember> {
  const res = await apiPost<OrganizationMemberEnvelope>(`/api/v1/organizations/${organizationId}/members`, { email, role })
  return res.data.member
}

/** PATCH /:organizationId/members/:memberId (TABLE C) — role and/or status
 *  change. The server rejects a change that would leave zero active
 *  owners with `LAST_OWNER` (409). */
export async function updateOrganizationMember(
  organizationId: string,
  memberId: string,
  patch: { role?: InvitableOrganizationMemberRole; status?: SettableOrganizationMemberStatus },
): Promise<OrganizationMember> {
  const res = await apiPatch<OrganizationMemberEnvelope>(`/api/v1/organizations/${organizationId}/members/${memberId}`, patch)
  return res.data.member
}

/** DELETE /:organizationId/members/:memberId (TABLE C) — soft-removes the
 *  member (`status:'removed'`); same `LAST_OWNER` protection as above. */
export async function removeOrganizationMember(organizationId: string, memberId: string): Promise<void> {
  await apiDelete<void>(`/api/v1/organizations/${organizationId}/members/${memberId}`)
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
    // TABLE C — member management error codes; each backend message is
    // already written to be shown directly (see organization.service.ts).
    case 'USER_NOT_FOUND':
    case 'ALREADY_MEMBER':
    case 'LAST_OWNER':
    case 'VALIDATION_ERROR':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
