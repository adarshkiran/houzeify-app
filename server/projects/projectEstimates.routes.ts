// ─── /api/v1/projects/:projectId/estimates — foundation + S27 builder ──────

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import {
  createEstimateBodySchema,
  createEstimateItemBodySchema,
  patchEstimateItemBodySchema,
  shareEstimateBodySchema,
} from './projectEstimates.schemas.js'
import {
  getEstimateBuilderDetail,
  listEstimateVersions,
  // used by create/share flows
  applyResolvedRateToEstimateItem,
  createEstimateItem,
  createEstimateVersion,
  deleteEstimateItem,
  getCompanyCustomerPreview,
  getCustomerSharedEstimate,
  shareEstimateWithCustomer,
  updateEstimateItem,
} from './projectEstimateBuilder.service.js'
import {
  createEstimateForProject,
  listEstimatesForProject,
} from './projectEstimates.service.js'
import type {
  CreateEstimateInput,
  CreateEstimateItemInput,
  PatchEstimateItemInput,
  ShareEstimateInput,
} from './projectEstimates.types.js'

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

  // Customer shared estimate (linked homeowner) — must register before :estimateId.
  app.get<{ Params: { projectId: string } }>(
    '/:projectId/estimates/shared',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimate = await getCustomerSharedEstimate(env, projectId, request.user!.id)
      return { data: { estimate } }
    },
  )

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

  app.get<{ Params: { projectId: string; estimateId: string }; Querystring: { versionId?: string } }>(
    '/:projectId/estimates/:estimateId',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      if (request.query.versionId) requireValidId(request.query.versionId, 'version')
      // Full builder detail when versionId omitted still returns items/summary.
      const estimate = await getEstimateBuilderDetail(
        env,
        projectId,
        estimateId,
        request.user!.id,
        request.query.versionId ? { versionId: request.query.versionId } : undefined,
      )
      return { data: { estimate } }
    },
  )

  app.get<{ Params: { projectId: string; estimateId: string } }>(
    '/:projectId/estimates/:estimateId/versions',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const versions = await listEstimateVersions(env, projectId, estimateId, request.user!.id)
      return { data: { versions } }
    },
  )

  app.post<{ Params: { projectId: string; estimateId: string } }>(
    '/:projectId/estimates/:estimateId/versions',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const estimate = await createEstimateVersion(env, projectId, estimateId, request.user!.id)
      reply.code(201)
      return { data: { estimate } }
    },
  )

  app.post<{ Params: { projectId: string; estimateId: string } }>(
    '/:projectId/estimates/:estimateId/items',
    { schema: { body: createEstimateItemBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const item = await createEstimateItem(
        env,
        projectId,
        estimateId,
        request.user!.id,
        request.body as CreateEstimateItemInput,
      )
      reply.code(201)
      return { data: { item } }
    },
  )

  app.patch<{ Params: { projectId: string; estimateId: string; itemId: string } }>(
    '/:projectId/estimates/:estimateId/items/:itemId',
    { schema: { body: patchEstimateItemBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const itemId = requireValidId(request.params.itemId, 'item')
      const item = await updateEstimateItem(
        env,
        projectId,
        estimateId,
        itemId,
        request.user!.id,
        request.body as PatchEstimateItemInput,
      )
      return { data: { item } }
    },
  )

  app.delete<{ Params: { projectId: string; estimateId: string; itemId: string } }>(
    '/:projectId/estimates/:estimateId/items/:itemId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const itemId = requireValidId(request.params.itemId, 'item')
      await deleteEstimateItem(env, projectId, estimateId, itemId, request.user!.id)
      reply.code(204)
      return null
    },
  )

  app.post<{ Params: { projectId: string; estimateId: string; itemId: string } }>(
    '/:projectId/estimates/:estimateId/items/:itemId/resolve-rate',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const itemId = requireValidId(request.params.itemId, 'item')
      const item = await applyResolvedRateToEstimateItem(
        env,
        projectId,
        estimateId,
        itemId,
        request.user!.id,
      )
      return { data: { item } }
    },
  )

  app.post<{ Params: { projectId: string; estimateId: string } }>(
    '/:projectId/estimates/:estimateId/share',
    { schema: { body: shareEstimateBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const body = (request.body as ShareEstimateInput | null | undefined) ?? {}
      const estimate = await shareEstimateWithCustomer(
        env,
        projectId,
        estimateId,
        request.user!.id,
        body,
      )
      return { data: { estimate } }
    },
  )

  app.get<{ Params: { projectId: string; estimateId: string } }>(
    '/:projectId/estimates/:estimateId/customer-preview',
    { preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const estimateId = requireValidId(request.params.estimateId, 'estimate')
      const estimate = await getCompanyCustomerPreview(
        env,
        projectId,
        estimateId,
        request.user!.id,
      )
      return { data: { estimate } }
    },
  )
}
