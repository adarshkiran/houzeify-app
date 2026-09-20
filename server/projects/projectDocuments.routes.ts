// ─── /api/v1/projects/:projectId/documents routes — Module 07 ─────────────
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { createProjectDocumentBodySchema, patchProjectDocumentBodySchema } from './projectDocuments.schemas.js'
import { archiveDocument, createDocument, listDocuments, updateDocument } from './projectDocuments.service.js'
import { serializeProjectDocument } from './projectDocuments.types.js'
import type { ProjectDocumentInput, ProjectDocumentPatch } from './projectDocuments.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function projectDocumentsRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/documents', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const documents = await listDocuments(env, projectId, request.user!.id)
    return { data: { documents: documents.map(serializeProjectDocument) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/documents',
    { schema: { body: createProjectDocumentBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as ProjectDocumentInput
      const row = await createDocument(env, projectId, request.user!.id, input)
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
}
