// ─── /api/v1/partner-profile routes — 12G-B ─────────────────────────────────
// Same ownership rules as customerProfile.routes.ts: requireAuth on every
// route, userId always from request.user.id, never the request body.

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { createPartnerProfileBodySchema, patchPartnerProfileBodySchema } from './partnerProfile.schemas.js'
import { createPartnerProfile, getPartnerProfile, updatePartnerProfile, type PartnerProfileInput } from './partnerProfile.service.js'
import { serializePartnerProfile } from './profile.types.js'

export async function partnerProfileRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get('/', { preHandler: requireAuth }, async request => {
    const profile = await getPartnerProfile(env, request.user!.id)
    return { data: { partnerProfile: serializePartnerProfile(profile) } }
  })

  app.post('/', { schema: { body: createPartnerProfileBodySchema }, preHandler: requireAuth }, async (request, reply) => {
    const input = request.body as PartnerProfileInput
    const profile = await createPartnerProfile(env, request.user!.id, input)
    reply.code(201)
    return { data: { partnerProfile: serializePartnerProfile(profile) } }
  })

  app.patch('/', { schema: { body: patchPartnerProfileBodySchema }, preHandler: requireAuth }, async request => {
    const patch = request.body as Partial<PartnerProfileInput>
    const profile = await updatePartnerProfile(env, request.user!.id, patch)
    return { data: { partnerProfile: serializePartnerProfile(profile) } }
  })
}
