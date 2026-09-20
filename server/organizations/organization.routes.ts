// ─── /api/v1/organizations routes — 12G-B ──────────────────────────────────
// Every route requires authentication. Creation always takes the owner
// from request.user.id. Read/update/members all resolve access through
// organization_members (see organization.service.ts) — never trust an id
// in the URL alone.

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { createOrganizationBodySchema, patchOrganizationBodySchema } from './organization.schemas.js'
import {
  createOrganization,
  getOrganizationForMember,
  listOrganizationMembers,
  listOrganizationsForUser,
  updateOrganization,
  type OrganizationInput,
} from './organization.service.js'
import { serializeOrganization, serializeOrganizationMember } from './organization.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidOrganizationId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', 'Invalid organization id.', 400)
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

  app.get<{ Params: { organizationId: string } }>('/:organizationId/members', { preHandler: requireAuth }, async request => {
    const organizationId = requireValidOrganizationId(request.params.organizationId)
    const members = await listOrganizationMembers(env, organizationId, request.user!.id)
    return { data: { members: members.map(serializeOrganizationMember) } }
  })
}
