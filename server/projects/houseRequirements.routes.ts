// ─── /api/v1/projects/:projectId/requirements routes — 12H-C / C13 ─────────
// Registered with the same `/projects` prefix as project.routes.ts (see
// server/app.ts). Every route requires authentication. C13: authorization
// uses requireProjectAccess / requireProjectMutation (org-aware), never a
// client-supplied ownerId/organizationId. No POST/DELETE: House Requirements
// are strictly 1:1 with a Project (GET + PUT upsert).

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { putHouseRequirementsBodySchema } from './houseRequirements.schemas.js'
import {
  getHouseRequirementsForProject,
  putHouseRequirementsForProject,
  type HouseRequirementsInput,
} from './houseRequirements.service.js'
import { serializeHouseRequirements } from './houseRequirements.types.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireValidProjectId(value: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new HttpError('INVALID_ID', 'Invalid project id.', 400)
  }
  return value
}

export async function houseRequirementsRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get<{ Params: { projectId: string } }>('/:projectId/requirements', { preHandler: requireAuth }, async request => {
    const projectId = requireValidProjectId(request.params.projectId)
    const requirements = await getHouseRequirementsForProject(env, projectId, request.user!.id)
    if (!requirements) {
      throw new HttpError('NOT_FOUND', 'No house requirements exist yet for this project.', 404)
    }
    return { data: { houseRequirements: serializeHouseRequirements(requirements) } }
  })

  app.put<{ Params: { projectId: string } }>(
    '/:projectId/requirements',
    { schema: { body: putHouseRequirementsBodySchema }, preHandler: requireAuth },
    async request => {
      const projectId = requireValidProjectId(request.params.projectId)
      const input = request.body as HouseRequirementsInput
      const requirements = await putHouseRequirementsForProject(env, projectId, request.user!.id, input)
      return { data: { houseRequirements: serializeHouseRequirements(requirements) } }
    },
  )
}
