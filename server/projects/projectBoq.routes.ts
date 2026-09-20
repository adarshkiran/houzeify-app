// ─── /api/v1/projects/:projectId/boq routes — Module 07 ────────────────────
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import {
  BOQ_ITEM_NUMBER_FIELDS,
  BOQ_ITEM_TEXT_FIELDS,
  createBoqItemBodySchema,
  createBoqSectionBodySchema,
  patchBoqItemBodySchema,
  patchBoqSectionBodySchema,
  rejectNonNumberFields,
  rejectNonStringFields,
} from './projectBoq.schemas.js'
import {
  createItem,
  createSection,
  deleteItem,
  deleteSection,
  getBoq,
  renameSection,
  updateItem,
} from './projectBoq.service.js'
import { serializeBoqItem, serializeBoqSection } from './projectBoq.types.js'
import type { BoqItemInput, BoqItemPatch, BoqSectionInput, BoqSectionPatch } from './projectBoq.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function projectBoqRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)
  // Runs after auth (so 401 still wins) but BEFORE AJV coerces the body.
  const sectionNameIsString = rejectNonStringFields('name')
  const itemTextIsString = rejectNonStringFields(...BOQ_ITEM_TEXT_FIELDS)
  const itemNumbersAreNumbers = rejectNonNumberFields(...BOQ_ITEM_NUMBER_FIELDS)

  app.get<{ Params: { projectId: string } }>('/:projectId/boq', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const boq = await getBoq(env, projectId, request.user!.id)
    return { data: { boq } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/boq/sections',
    { schema: { body: createBoqSectionBodySchema }, preValidation: [requireAuth, sectionNameIsString] },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as BoqSectionInput
      const row = await createSection(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { section: serializeBoqSection(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; sectionId: string } }>(
    '/:projectId/boq/sections/:sectionId',
    { schema: { body: patchBoqSectionBodySchema }, preValidation: [requireAuth, sectionNameIsString] },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const sectionId = requireValidId(request.params.sectionId, 'section')
      const patch = request.body as BoqSectionPatch
      const row = await renameSection(env, projectId, sectionId, request.user!.id, patch)
      return { data: { section: serializeBoqSection(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; sectionId: string } }>(
    '/:projectId/boq/sections/:sectionId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const sectionId = requireValidId(request.params.sectionId, 'section')
      await deleteSection(env, projectId, sectionId, request.user!.id)
      reply.code(204)
      return null
    },
  )

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/boq/items',
    {
      schema: { body: createBoqItemBodySchema },
      preValidation: [requireAuth, itemTextIsString, itemNumbersAreNumbers],
    },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as BoqItemInput
      const row = await createItem(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { item: serializeBoqItem(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; itemId: string } }>(
    '/:projectId/boq/items/:itemId',
    {
      schema: { body: patchBoqItemBodySchema },
      preValidation: [requireAuth, itemTextIsString, itemNumbersAreNumbers],
    },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const itemId = requireValidId(request.params.itemId, 'item')
      const patch = request.body as BoqItemPatch
      const row = await updateItem(env, projectId, itemId, request.user!.id, patch)
      return { data: { item: serializeBoqItem(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; itemId: string } }>(
    '/:projectId/boq/items/:itemId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const itemId = requireValidId(request.params.itemId, 'item')
      await deleteItem(env, projectId, itemId, request.user!.id)
      reply.code(204)
      return null
    },
  )
}
