// ─── /api/v1/organizations routes — 12G-B ──────────────────────────────────
// Every route requires authentication. Creation always takes the owner
// from request.user.id. Read/update/members all resolve access through
// organization_members (see organization.service.ts) — never trust an id
// in the URL alone.

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import {
  addOrganizationMemberBodySchema,
  createOrganizationBodySchema,
  patchOrganizationBodySchema,
  patchOrganizationMemberBodySchema,
} from './organization.schemas.js'
import {
  addOrganizationMember,
  createOrganization,
  getOrganizationForMember,
  listOrganizationMembers,
  listOrganizationsForUser,
  removeOrganizationMember,
  updateOrganization,
  updateOrganizationMember,
  type OrganizationInput,
  type OrganizationMemberRole,
  type OrganizationMemberStatus,
} from './organization.service.js'
import { getOrganizationProgressSummary } from './organizationProgress.service.js'
import { getOrganizationReportsSummary } from './organizationReports.service.js'
import { serializeOrganization, serializeOrganizationMember } from './organization.types.js'

interface AddOrganizationMemberBody {
  email: string
  role: Exclude<OrganizationMemberRole, 'owner'>
}

interface PatchOrganizationMemberBody {
  role?: Exclude<OrganizationMemberRole, 'owner'>
  status?: Exclude<OrganizationMemberStatus, 'invited'>
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidOrganizationId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', 'Invalid organization id.', 400)
  }
  return value
}

function requireValidMemberId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', 'Invalid member id.', 400)
  }
  return value
}

export async function organizationRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get('/', { preHandler: requireAuth }, async request => {
    const orgs = await listOrganizationsForUser(env, request.user!.id)
    return { data: { organizations: orgs.map(serializeOrganization) } }
  })

  app.post('/', { schema: { body: createOrganizationBodySchema }, preHandler: requireAuth }, async (request, reply) => {
    const input = request.body as OrganizationInput
    const organization = await createOrganization(env, request.user!.id, input)
    reply.code(201)
    return { data: { organization: serializeOrganization(organization) } }
  })

  app.get<{ Params: { organizationId: string } }>('/:organizationId', { preHandler: requireAuth }, async request => {
    const organizationId = requireValidOrganizationId(request.params.organizationId)
    const organization = await getOrganizationForMember(env, organizationId, request.user!.id)
    if (!organization) {
      throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
    }
    return { data: { organization: serializeOrganization(organization) } }
  })

  app.patch<{ Params: { organizationId: string } }>(
    '/:organizationId',
    { schema: { body: patchOrganizationBodySchema }, preHandler: requireAuth },
    async request => {
      const organizationId = requireValidOrganizationId(request.params.organizationId)
      const patch = request.body as Partial<OrganizationInput>
      const organization = await updateOrganization(env, organizationId, request.user!.id, patch)
      return { data: { organization: serializeOrganization(organization) } }
    },
  )

  // C19 — company Progress rail rollup (read-only; membership-gated).
  app.get<{ Params: { organizationId: string } }>(
    '/:organizationId/progress-summary',
    { preHandler: requireAuth },
    async request => {
      const organizationId = requireValidOrganizationId(request.params.organizationId)
      const summary = await getOrganizationProgressSummary(env, organizationId, request.user!.id)
      return { data: { summary } }
    },
  )

  // C20 — company Reports rail: Construction Record index (read-only).
  app.get<{ Params: { organizationId: string } }>(
    '/:organizationId/reports-summary',
    { preHandler: requireAuth },
    async request => {
      const organizationId = requireValidOrganizationId(request.params.organizationId)
      const summary = await getOrganizationReportsSummary(env, organizationId, request.user!.id)
      return { data: { summary } }
    },
  )

  app.get<{ Params: { organizationId: string } }>('/:organizationId/members', { preHandler: requireAuth }, async request => {
    const organizationId = requireValidOrganizationId(request.params.organizationId)
    const members = await listOrganizationMembers(env, organizationId, request.user!.id)
    return { data: { members: members.map(serializeOrganizationMember) } }
  })

  app.post<{ Params: { organizationId: string } }>(
    '/:organizationId/members',
    { schema: { body: addOrganizationMemberBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const organizationId = requireValidOrganizationId(request.params.organizationId)
      const { email, role } = request.body as AddOrganizationMemberBody
      const member = await addOrganizationMember(env, organizationId, request.user!.id, email, role)
      reply.code(201)
      return { data: { member: serializeOrganizationMember(member) } }
    },
  )

  app.patch<{ Params: { organizationId: string; memberId: string } }>(
    '/:organizationId/members/:memberId',
    { schema: { body: patchOrganizationMemberBodySchema }, preHandler: requireAuth },
    async request => {
      const organizationId = requireValidOrganizationId(request.params.organizationId)
      const memberId = requireValidMemberId(request.params.memberId)
      const patch = request.body as PatchOrganizationMemberBody
      const member = await updateOrganizationMember(env, organizationId, request.user!.id, memberId, patch)
      return { data: { member: serializeOrganizationMember(member) } }
    },
  )

  app.delete<{ Params: { organizationId: string; memberId: string } }>(
    '/:organizationId/members/:memberId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const organizationId = requireValidOrganizationId(request.params.organizationId)
      const memberId = requireValidMemberId(request.params.memberId)
      await removeOrganizationMember(env, organizationId, request.user!.id, memberId)
      reply.code(204)
      return null
    },
  )
}
