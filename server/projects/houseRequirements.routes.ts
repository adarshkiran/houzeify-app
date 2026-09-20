// ─── /api/v1/projects/:projectId/requirements routes — 12H-C ──────────────
// Registered with the same `/projects` prefix as project.routes.ts (see
// server/app.ts) — a separate plugin/file, same final path. Every route
// requires authentication; ownership is resolved exclusively through the
// owning Project (see houseRequirements.service.ts's requireOwnedProject())
// — never a client-supplied projectId/ownerId in the body. No POST/DELETE:
// House Requirements are strictly 1:1 with a Project, so GET/PUT is the
// complete, correct surface (create-or-replace via PUT's own upsert).

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { HttpError } from '../errors/httpError.js'
import { putHouseRequirementsBodySchema } from './houseRequirements.schemas.js'
import {
  getHouseRequirementsForOwnedProject,
  putHouseRequirementsForOwnedProject,
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
    const requirements = await getHouseRequirementsForOwnedProject(env, projectId, request.user!.id)
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
      const requirements = await putHouseRequirementsForOwnedProject(env, projectId, request.user!.id, input)
      return { data: { houseRequirements: serializeHouseRequirements(requirements) } }
    },
  )
}
