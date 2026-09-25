// ─── /api/v1/organizations/:organizationId/rates — S26 Price Intelligence ──

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { getOrganizationForMember } from '../organizations/organization.service.js'
import { createOrganizationRateBodySchema } from './priceIntelligence.schemas.js'
import {
  PRICE_INTELLIGENCE_CATALOG,
  createOrganizationRate,
  getPriceIntelligenceSourceStatus,
  listOrganizationRates,
  resolveOrganizationPrice,
} from './priceIntelligence.service.js'
import type { CreateOrganizationRateInput } from './priceIntelligence.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function priceIntelligenceRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { organizationId: string } }>(
    '/:organizationId/price-intelligence',
    { preHandler: requireAuth },
    async request => {
      requireValidId(request.params.organizationId, 'organization')
      const org = await getOrganizationForMember(env, request.params.organizationId, request.user!.id)
      if (!org) throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
      return {
        data: {
          sources: getPriceIntelligenceSourceStatus(),
          catalog: PRICE_INTELLIGENCE_CATALOG,
        },
      }
    },
  )

  app.get<{ Params: { organizationId: string }; Querystring: { name?: string; kind?: string } }>(
    '/:organizationId/rates',
    { preHandler: requireAuth },
    async request => {
      const organizationId = requireValidId(request.params.organizationId, 'organization')
      const rates = await listOrganizationRates(env, organizationId, request.user!.id, {
        name: request.query.name,
        kind: request.query.kind,
      })
      return { data: { rates } }
    },
  )

  app.post<{ Params: { organizationId: string } }>(
    '/:organizationId/rates',
    { schema: { body: createOrganizationRateBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const organizationId = requireValidId(request.params.organizationId, 'organization')
      const body = request.body as CreateOrganizationRateInput
      const rate = await createOrganizationRate(env, organizationId, request.user!.id, body)
      reply.code(201)
      return { data: { rate } }
    },
  )

  app.get<{
    Params: { organizationId: string }
    Querystring: { name?: string; unit?: string; projectId?: string; location?: string; asOf?: string }
  }>(
    '/:organizationId/rates/resolve',
    { preHandler: requireAuth },
    async request => {
      const organizationId = requireValidId(request.params.organizationId, 'organization')
      const name = request.query.name?.trim()
      const unit = request.query.unit?.trim()
      if (!name || !unit) {
        throw new HttpError('VALIDATION_ERROR', 'Query params name and unit are required.', 400)
      }
      if (request.query.projectId) requireValidId(request.query.projectId, 'project')
      const resolved = await resolveOrganizationPrice(env, organizationId, request.user!.id, {
        name,
        unit,
        projectId: request.query.projectId,
        location: request.query.location,
        asOf: request.query.asOf,
      })
      return { data: { resolved } }
    },
  )
}
