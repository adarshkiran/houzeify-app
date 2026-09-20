// ─── /api/v1/projects/:projectId/issues routes — Module 05 ────────────────
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { createConstructionIssueBodySchema, patchConstructionIssueBodySchema } from './constructionIssues.schemas.js'
import { createIssue, deleteIssue, listIssuesForProject, updateIssue, type ConstructionIssueInput } from './constructionIssues.service.js'
import { serializeConstructionIssue } from './constructionIssues.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function constructionIssuesRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/issues', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const issues = await listIssuesForProject(env, projectId, request.user!.id)
    return { data: { issues: issues.map(serializeConstructionIssue) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/issues',
    { schema: { body: createConstructionIssueBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as ConstructionIssueInput
      const row = await createIssue(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { issue: serializeConstructionIssue(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; issueId: string } }>(
    '/:projectId/issues/:issueId',
    { schema: { body: patchConstructionIssueBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const issueId = requireValidId(request.params.issueId, 'issue')
      const patch = request.body as Partial<ConstructionIssueInput>
      const row = await updateIssue(env, projectId, issueId, request.user!.id, patch)
      return { data: { issue: serializeConstructionIssue(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; issueId: string } }>(
    '/:projectId/issues/:issueId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const issueId = requireValidId(request.params.issueId, 'issue')
      await deleteIssue(env, projectId, issueId, request.user!.id)
      reply.code(204)
      return null
    },
  )
}
