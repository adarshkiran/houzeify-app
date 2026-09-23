import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { getProjectActivity } from './projectActivity.service.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidProjectId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', 'Invalid project id.', 400)
  }
  return value
}

export async function projectActivityRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>(
    '/:projectId/activity',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidProjectId(request.params.projectId)
      const activity = await getProjectActivity(env, projectId, request.user!.id)
      return { data: { activity } }
    },
  )
}
