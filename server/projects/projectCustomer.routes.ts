import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { putProjectCustomerBodySchema } from './projectCustomer.schemas.js'
import {
  acceptProjectCustomerInvite,
  getProjectCustomer,
  inviteProjectCustomer,
  loadCustomerProfileForUser,
  removeProjectCustomer,
} from './projectCustomer.service.js'
import { serializeProjectCustomer } from './projectCustomer.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidProjectId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', 'Invalid project id.', 400)
  }
  return value
}

export async function projectCustomerRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.put<{ Params: { projectId: string } }>(
    '/:projectId/customer',
    { schema: { body: putProjectCustomerBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidProjectId(request.params.projectId)
      const email = (request.body as { email: string }).email
      const row = await inviteProjectCustomer(env, projectId, request.user!.id, email)
      const profile = await loadCustomerProfileForUser(env, row.userId)
      return { data: { customer: serializeProjectCustomer(row, profile) } }
    },
  )

  app.get<{ Params: { projectId: string } }>('/:projectId/customer', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const { row, profile } = await getProjectCustomer(env, projectId, request.user!.id)
    return { data: { customer: serializeProjectCustomer(row, profile) } }
  })

  app.delete<{ Params: { projectId: string } }>('/:projectId/customer', { preHandler: requireAuth }, async (request, reply) => {
    const projectId = requireValidProjectId(request.params.projectId)
    await removeProjectCustomer(env, projectId, request.user!.id)
    reply.code(204)
    return null
  })

  app.post<{ Params: { projectId: string } }>('/:projectId/customer/accept', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const row = await acceptProjectCustomerInvite(env, projectId, request.user!.id)
    const profile = await loadCustomerProfileForUser(env, row.userId)
    return { data: { customer: serializeProjectCustomer(row, profile) } }
  })
}
