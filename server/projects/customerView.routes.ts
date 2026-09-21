import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import {
  getCustomerViewHeader,
  getCustomerViewTimeline,
  listCustomerViewDocuments,
  listCustomerViewProgress,
  listCustomerViewWorkforce,
} from './customerView.service.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidProjectId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', 'Invalid project id.', 400)
  }
  return value
}

export async function customerViewRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/customer-view', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const header = await getCustomerViewHeader(env, projectId, request.user!.id)
    return { data: { project: header } }
  })

  app.get<{ Params: { projectId: string } }>('/:projectId/customer-view/progress', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const progress = await listCustomerViewProgress(env, projectId, request.user!.id)
    return { data: { progress } }
  })

  app.get<{ Params: { projectId: string } }>('/:projectId/customer-view/documents', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const documents = await listCustomerViewDocuments(env, projectId, request.user!.id)
    return { data: { documents } }
  })

  app.get<{ Params: { projectId: string } }>('/:projectId/customer-view/workforce', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const workforce = await listCustomerViewWorkforce(env, projectId, request.user!.id)
    return { data: { workforce } }
  })

  app.get<{ Params: { projectId: string } }>('/:projectId/customer-view/timeline', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const timeline = await getCustomerViewTimeline(env, projectId, request.user!.id)
    return { data: { timeline } }
  })
}
