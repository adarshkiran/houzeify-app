// ─── /api/v1/projects/:projectId/daily-progress routes — Module 04 ────────
// Registered at the same '/api/v1/projects' prefix as project.routes.ts
// and houseRequirements.routes.ts — mounted as its own plugin sharing that
// prefix (server/app.ts), not a second top-level route tree. Every route
// requires authentication; every authorization decision is resolved in
// dailyProgress.service.ts, never here.

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import {
  addDailyProgressPhotoBodySchema,
  createDailyProgressBodySchema,
  patchDailyProgressBodySchema,
} from './dailyProgress.schemas.js'
import {
  addDailyProgressPhoto,
  createDailyProgress,
  deleteDailyProgress,
  listDailyProgressForProject,
  updateDailyProgress,
  type DailyProgressInput,
  type DailyProgressPhotoInput,
} from './dailyProgress.service.js'
import { serializeDailyProgress, serializeDailyProgressPhoto } from './dailyProgress.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function dailyProgressRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/daily-progress', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const { progress, photosByProgressId } = await listDailyProgressForProject(env, projectId, request.user!.id)
    return { data: { progress: progress.map(row => serializeDailyProgress(row, photosByProgressId.get(row.id) ?? [])) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/daily-progress',
    { schema: { body: createDailyProgressBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as DailyProgressInput
      const row = await createDailyProgress(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { progress: serializeDailyProgress(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; progressId: string } }>(
    '/:projectId/daily-progress/:progressId',
    { schema: { body: patchDailyProgressBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const progressId = requireValidId(request.params.progressId, 'progress')
      const patch = request.body as Partial<DailyProgressInput>
      const row = await updateDailyProgress(env, projectId, progressId, request.user!.id, patch)
      return { data: { progress: serializeDailyProgress(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; progressId: string } }>(
    '/:projectId/daily-progress/:progressId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const progressId = requireValidId(request.params.progressId, 'progress')
      await deleteDailyProgress(env, projectId, progressId, request.user!.id)
      reply.code(204)
      return null
    },
  )

  app.post<{ Params: { projectId: string; progressId: string } }>(
    '/:projectId/daily-progress/:progressId/photos',
    { schema: { body: addDailyProgressPhotoBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const progressId = requireValidId(request.params.progressId, 'progress')
      const input = request.body as DailyProgressPhotoInput
      const row = await addDailyProgressPhoto(env, projectId, progressId, request.user!.id, input)
      reply.code(201)
      return { data: { photo: serializeDailyProgressPhoto(row) } }
    },
  )
}
