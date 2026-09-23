// ─── /api/v1/projects/:projectId/documents routes — Module 07 / C16 ────────
// Create is multipart (real bytes). JSON metadata-only create is no longer
// accepted — C16 requires persistent object storage.

import type { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { patchProjectDocumentBodySchema } from './projectDocuments.schemas.js'
import {
  archiveDocument,
  createDocument,
  getDocumentContent,
  listDocuments,
  updateDocument,
} from './projectDocuments.service.js'
import { serializeProjectDocument } from './projectDocuments.types.js'
import type { ProjectDocumentPatch } from './projectDocuments.types.js'
import { DOCUMENT_CATEGORIES, MAX_DOCUMENT_SIZE_BYTES } from './documentFileTypes.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

function fieldString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Buffer.isBuffer(value)) return value.toString('utf8')
  return undefined
}

export async function projectDocumentsRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  await app.register(multipart, {
    limits: {
      fileSize: MAX_DOCUMENT_SIZE_BYTES,
      files: 1,
      fields: 8,
    },
  })

  app.get<{ Params: { projectId: string } }>('/:projectId/documents', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const documents = await listDocuments(env, projectId, request.user!.id)
    return { data: { documents: documents.map(serializeProjectDocument) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/documents',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')

      const parts = request.parts()
      let fileBuffer: Buffer | null = null
      let fileName = 'document'
      let claimedMime = 'application/octet-stream'
      let category = ''
      let title: string | undefined
      let description: string | undefined

      for await (const part of parts) {
        if (part.type === 'file') {
          try {
            fileBuffer = await part.toBuffer()
          } catch (err) {
            const e = err as { code?: string; statusCode?: number }
            if (e.code === 'FST_REQ_FILE_TOO_LARGE' || e.statusCode === 413) {
              throw new HttpError('FILE_TOO_LARGE', 'Document exceeds the 25 MB upload limit.', 400)
            }
            throw err
          }
          fileName = part.filename || fileName
          claimedMime = part.mimetype || claimedMime
        } else {
          const value = fieldString(part.value)?.trim()
          if (part.fieldname === 'category' && value) category = value
          if (part.fieldname === 'title' && value) title = value
          if (part.fieldname === 'description' && value) description = value
        }
      }

      if (!fileBuffer) {
        throw new HttpError('INVALID_FILE', 'A document file is required.', 400)
      }
      if (!(DOCUMENT_CATEGORIES as readonly string[]).includes(category)) {
        throw new HttpError(
          'VALIDATION_ERROR',
          `Category must be one of: ${DOCUMENT_CATEGORIES.join(', ')}.`,
          400,
        )
      }

      const row = await createDocument(env, projectId, request.user!.id, {
        category,
        fileName,
        mimeType: claimedMime,
        size: fileBuffer.length,
        title,
        description,
        buffer: fileBuffer,
      })
      reply.code(201)
      return { data: { document: serializeProjectDocument(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; documentId: string } }>(
    '/:projectId/documents/:documentId',
    { schema: { body: patchProjectDocumentBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const documentId = requireValidId(request.params.documentId, 'document')
      const patch = request.body as ProjectDocumentPatch
      const row = await updateDocument(env, projectId, documentId, request.user!.id, patch)
      return { data: { document: serializeProjectDocument(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; documentId: string } }>(
    '/:projectId/documents/:documentId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const documentId = requireValidId(request.params.documentId, 'document')
      await archiveDocument(env, projectId, documentId, request.user!.id)
      reply.code(204)
      return null
    },
  )

  app.get<{ Params: { projectId: string; documentId: string } }>(
    '/:projectId/documents/:documentId/content',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const documentId = requireValidId(request.params.documentId, 'document')
      const content = await getDocumentContent(env, projectId, documentId, request.user!.id)
      reply
        .header('Content-Type', content.contentType)
        .header('Content-Disposition', `inline; filename="${content.fileName.replace(/"/g, '')}"`)
        .header('Cache-Control', 'private, max-age=300')
      return reply.send(content.body)
    },
  )
}
