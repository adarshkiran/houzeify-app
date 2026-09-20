// ─── /api/v1/projects routes — 12H-B, extended Module 03 ───────────────────
// Every route requires authentication. Read/write authorization is resolved
// entirely in project.service.ts (never here, never "fetch then check") —
// either the caller created the project, or (for an organization project)
// is a member of its organization. No DELETE route: the 12H-A audit found
// no real delete flow anywhere in the current frontend (confirmed again
// during this phase's own consumer audit) — not added speculatively, per
// this ticket's own Phase 7 instruction ("do NOT create a delete API just
// because CRUD convention suggests it").
//
// Module 03 — GET / accepts an optional `?organizationId=` query param.
// Omitted: unchanged 12H-B behavior (the homeowner flow's own projects,
// never organization-scoped). Present: lists that organization's projects
// instead — membership is verified in project.service.ts, a non-member
// gets 404, never a client-trusted organization id.

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { createProjectBodySchema, patchProjectBodySchema } from './project.schemas.js'
import {
  createProject,
  getProjectForAccess,
  listProjectsForOrganization,
  listProjectsForUser,
  updateProject,
  type ProjectInput,
} from './project.service.js'
import { listCustomerProjectsForUser } from './projectCustomer.service.js'
import { serializeProject } from './project.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidProjectId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', 'Invalid project id.', 400)
  }
  return value
}

export async function projectRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Querystring: { organizationId?: string; as?: string } }>('/', { preHandler: requireAuth }, async request => {
    const organizationId = request.query.organizationId
    const as = request.query.as
    if (as !== undefined && as !== 'customer') {
      throw new HttpError('INVALID_QUERY', 'Unknown list mode.', 400)
    }
    if (as === 'customer' && organizationId) {
      throw new HttpError('INVALID_QUERY', 'as=customer cannot be combined with organizationId.', 400)
    }
    if (as === 'customer') {
      const rows = await listCustomerProjectsForUser(env, request.user!.id)
      return { data: { projects: rows } }
    }
    if (organizationId) {
      if (!UUID_PATTERN.test(organizationId)) {
        throw new HttpError('INVALID_ID', 'Invalid organization id.', 400)
      }
      const rows = await listProjectsForOrganization(env, organizationId, request.user!.id)
      return { data: { projects: rows.map(serializeProject) } }
    }
    const rows = await listProjectsForUser(env, request.user!.id)
    return { data: { projects: rows.map(serializeProject) } }
  })

  app.post('/', { schema: { body: createProjectBodySchema }, preHandler: requireAuth }, async (request, reply) => {
    const input = request.body as ProjectInput
    const project = await createProject(env, request.user!.id, input)
    reply.code(201)
    return { data: { project: serializeProject(project) } }
  })

  app.get<{ Params: { projectId: string } }>('/:projectId', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const project = await getProjectForAccess(env, projectId, request.user!.id)
    if (!project) {
      throw new HttpError('NOT_FOUND', 'Project not found.', 404)
    }
    return { data: { project: serializeProject(project) } }
  })

  app.patch<{ Params: { projectId: string } }>(
    '/:projectId',
    { schema: { body: patchProjectBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidProjectId(request.params.projectId)
      const patch = request.body as Partial<ProjectInput>
      const project = await updateProject(env, projectId, request.user!.id, patch)
      return { data: { project: serializeProject(project) } }
    },
  )
}
