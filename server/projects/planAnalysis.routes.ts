// ─── /api/v1/projects/:projectId/plan-analyses — S24 Plan Analyzer ─────────

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import {
  createPlanAnalysisBodySchema,
  patchPlanAnalysisBodySchema,
} from './planAnalysis.schemas.js'
import {
  createPlanAnalysisForProject,
  getPlanAnalysisForProject,
  listPlanAnalysesForProject,
  patchPlanAnalysisForProject,
} from './planAnalysis.service.js'
import type { CreatePlanAnalysisInput, PatchPlanAnalysisInput } from './planAnalysis.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function planAnalysisRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>(
    '/:projectId/plan-analyses',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const analyses = await listPlanAnalysesForProject(env, projectId, request.user!.id)
      return { data: { analyses } }
    },
  )

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/plan-analyses',
    { schema: { body: createPlanAnalysisBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const body = request.body as CreatePlanAnalysisInput
      const analysis = await createPlanAnalysisForProject(env, projectId, request.user!.id, body)
      reply.code(201)
      return { data: { analysis } }
    },
  )

  app.get<{ Params: { projectId: string; analysisId: string } }>(
    '/:projectId/plan-analyses/:analysisId',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const analysisId = requireValidId(request.params.analysisId, 'analysis')
      const analysis = await getPlanAnalysisForProject(
        env,
        projectId,
        analysisId,
        request.user!.id,
      )
      return { data: { analysis } }
    },
  )

  app.patch<{ Params: { projectId: string; analysisId: string } }>(
    '/:projectId/plan-analyses/:analysisId',
    { schema: { body: patchPlanAnalysisBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const analysisId = requireValidId(request.params.analysisId, 'analysis')
      const body = request.body as PatchPlanAnalysisInput
      const analysis = await patchPlanAnalysisForProject(
        env,
        projectId,
        analysisId,
        request.user!.id,
        body,
      )
      return { data: { analysis } }
    },
  )
}
