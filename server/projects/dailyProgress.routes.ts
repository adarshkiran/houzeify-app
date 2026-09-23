// ─── /api/v1/projects/:projectId/daily-progress routes — Module 04 / C15 ───
// Photo upload is multipart (real bytes). JSON metadata-only upload is no
 // longer accepted — C15 requires persistent object storage.

import type { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import {
  createDailyProgressBodySchema,
  patchDailyProgressBodySchema,
} from './dailyProgress.schemas.js'
import {
  addDailyProgressPhoto,
  createDailyProgress,
  deleteDailyProgress,
  getDailyProgressPhotoContent,
  listDailyProgressForProject,
  updateDailyProgress,
  type DailyProgressInput,
  type DailyProgressPatch,
} from './dailyProgress.service.js'
import { serializeDailyProgress, serializeDailyProgressPhoto } from './dailyProgress.types.js'
import { MAX_CONSTRUCTION_EVIDENCE_BYTES, MAX_CONSTRUCTION_PHOTO_BYTES, MAX_CONSTRUCTION_VIDEO_BYTES } from '../storage/mediaValidation.js'

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

  await app.register(multipart, {
    limits: {
      fileSize: MAX_CONSTRUCTION_EVIDENCE_BYTES,
      files: 1,
    },
  })

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
      const patch = request.body as Partial<DailyProgressPatch>
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
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const progressId = requireValidId(request.params.progressId, 'progress')

      const file = await request.file()
      if (!file) {
        throw new HttpError('INVALID_FILE', 'A construction evidence file is required.', 400)
      }
      let buffer: Buffer
      try {
        buffer = await file.toBuffer()
      } catch (err) {
        const e = err as { code?: string; statusCode?: number }
        if (e.code === 'FST_REQ_FILE_TOO_LARGE' || e.statusCode === 413) {
          const isVideo = Boolean(file.mimetype?.startsWith('video/'))
          const limitMb = Math.round(
            (isVideo ? MAX_CONSTRUCTION_VIDEO_BYTES : MAX_CONSTRUCTION_PHOTO_BYTES) / (1024 * 1024),
          )
          throw new HttpError(
            'FILE_TOO_LARGE',
            isVideo
              ? `Video exceeds the ${limitMb} MB upload limit.`
              : `Photo exceeds the ${limitMb} MB upload limit.`,
            400,
          )
        }
        throw err
      }
      const row = await addDailyProgressPhoto(env, projectId, progressId, request.user!.id, {
        fileName: file.filename || 'evidence',
        buffer,
        claimedMimeType: file.mimetype,
      })
      reply.code(201)
      return { data: { photo: serializeDailyProgressPhoto(row, projectId) } }
    },
  )

  app.get<{ Params: { projectId: string; photoId: string } }>(
    '/:projectId/daily-progress-photos/:photoId/content',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const photoId = requireValidId(request.params.photoId, 'photo')
      const content = await getDailyProgressPhotoContent(env, projectId, photoId, request.user!.id)
      reply
        .header('Content-Type', content.contentType)
        .header('Content-Disposition', `inline; filename="${content.fileName.replace(/"/g, '')}"`)
        .header('Cache-Control', 'private, max-age=300')
      return reply.send(content.body)
    },
  )
}
