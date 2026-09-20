// ─── /api/v1/projects/:projectId/workforce routes — Module 06 ─────────────
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { addProjectWorkforceMemberBodySchema, patchProjectWorkforceMemberBodySchema } from './projectWorkforce.schemas.js'
import {
  addWorkforceMember,
  listWorkforceForProject,
  removeWorkforceMember,
  updateWorkforceMemberRole,
} from './projectWorkforce.service.js'
import { serializeProjectWorkforceMember } from './projectWorkforce.types.js'
import type { ProjectWorkforceMemberInput, ProjectWorkforceMemberPatch } from './projectWorkforce.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function projectWorkforceRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/workforce', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const members = await listWorkforceForProject(env, projectId, request.user!.id)
    return { data: { members: members.map(serializeProjectWorkforceMember) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/workforce',
    { schema: { body: addProjectWorkforceMemberBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as ProjectWorkforceMemberInput
      const row = await addWorkforceMember(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { member: serializeProjectWorkforceMember(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; memberId: string } }>(
    '/:projectId/workforce/:memberId',
    { schema: { body: patchProjectWorkforceMemberBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const memberId = requireValidId(request.params.memberId, 'workforce member')
      const patch = request.body as ProjectWorkforceMemberPatch
      const row = await updateWorkforceMemberRole(env, projectId, memberId, request.user!.id, patch)
      return { data: { member: serializeProjectWorkforceMember(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; memberId: string } }>(
    '/:projectId/workforce/:memberId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const memberId = requireValidId(request.params.memberId, 'workforce member')
      await removeWorkforceMember(env, projectId, memberId, request.user!.id)
      reply.code(204)
      return null
    },
  )
}
