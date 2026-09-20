// ─── /api/v1/projects/:projectId/tasks routes — Module 05 ─────────────────
import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { createConstructionTaskBodySchema, patchConstructionTaskBodySchema } from './constructionTasks.schemas.js'
import { createTask, deleteTask, listTasksForProject, updateTask, type ConstructionTaskInput } from './constructionTasks.service.js'
import { serializeConstructionTask } from './constructionTasks.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidId(value: string, label: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', `Invalid ${label} id.`, 400)
  }
  return value
}

export async function constructionTasksRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/tasks', { preHandler: requireAuth }, async request => {
    const projectId = requireValidId(request.params.projectId, 'project')
    const tasks = await listTasksForProject(env, projectId, request.user!.id)
    return { data: { tasks: tasks.map(serializeConstructionTask) } }
  })

  app.post<{ Params: { projectId: string } }>(
    '/:projectId/tasks',
    { schema: { body: createConstructionTaskBodySchema }, preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const input = request.body as ConstructionTaskInput
      const row = await createTask(env, projectId, request.user!.id, input)
      reply.code(201)
      return { data: { task: serializeConstructionTask(row) } }
    },
  )

  app.patch<{ Params: { projectId: string; taskId: string } }>(
    '/:projectId/tasks/:taskId',
    { schema: { body: patchConstructionTaskBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const taskId = requireValidId(request.params.taskId, 'task')
      const patch = request.body as Partial<ConstructionTaskInput>
      const row = await updateTask(env, projectId, taskId, request.user!.id, patch)
      return { data: { task: serializeConstructionTask(row) } }
    },
  )

  app.delete<{ Params: { projectId: string; taskId: string } }>(
    '/:projectId/tasks/:taskId',
    { preHandler: requireAuth },
    async (request, reply) => {
      const projectId = requireValidId(request.params.projectId, 'project')
      const taskId = requireValidId(request.params.taskId, 'task')
      await deleteTask(env, projectId, taskId, request.user!.id)
      reply.code(204)
      return null
    },
  )
}
