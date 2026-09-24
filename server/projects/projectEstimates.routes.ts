// ─── /api/v1/projects/:projectId/estimates routes — estimation foundation ──
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { createEstimateBodySchema } from './projectEstimates.schemas.js'
import {
  createEstimateForProject,
  getEstimateForProject,
  listEstimatesForProject,
} from './projectEstimates.service.js'
import type { CreateEstimateInput } from './projectEstimates.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function projectEstimatesRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>(
    '/:projectId/estimates',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const list = await listEstimatesForProject(env, projectId, request.user!.id)
      return { data: { estimates: list } }
    },
  )

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/estimates',
    { schema: { body: createEstimateBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const body = request.body as CreateEstimateInput
      const estimate = await createEstimateForProject(env, projectId, request.user!.id, body)
      reply.code(201)
      return { data: { estimate } }
    },
  )

  app.get<{ Params: { projectId: string; estimateId: string } }>(
    '/:projectId/estimates/:estimateId',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const estimate = await getEstimateForProject(env, projectId, estimateId, request.user!.id)
      return { data: { estimate } }
    },
  )
}
