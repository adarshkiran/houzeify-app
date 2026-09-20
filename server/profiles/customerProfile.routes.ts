// ─── /api/v1/customer-profile routes — 12G-B ────────────────────────────────
// Every route requires authentication (requireAuth). Ownership always comes
// from request.user.id — the service functions never accept a userId from
// the request body. Belt-and-braces: the JSON schemas don't list `userId`
// either, and Fastify's default AJV config (removeAdditional:true +
// additionalProperties:false) silently strips it if a client sends one
// anyway — it never reaches request.body at all, let alone the service.

import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { createRequireAuth } from '../auth/session.js'
import { createCustomerProfileBodySchema, patchCustomerProfileBodySchema } from './customerProfile.schemas.js'
import { createCustomerProfile, getCustomerProfile, updateCustomerProfile, type CustomerProfileInput } from './customerProfile.service.js'
import { serializeCustomerProfile } from './profile.types.js'

export async function customerProfileRoutes(app: FastifyInstance, opts: { env: Env }) {
  const { env } = opts
  const requireAuth = createRequireAuth(env)

  app.get('/', { preHandler: requireAuth }, async request => {
    const profile = await getCustomerProfile(env, request.user!.id)
    return { data: { customerProfile: serializeCustomerProfile(profile) } }
  })

  app.post('/', { schema: { body: createCustomerProfileBodySchema }, preHandler: requireAuth }, async (request, reply) => {
    const input = request.body as CustomerProfileInput
    const profile = await createCustomerProfile(env, request.user!.id, input)
    reply.code(201)
    return { data: { customerProfile: serializeCustomerProfile(profile) } }
  })

  app.patch('/', { schema: { body: patchCustomerProfileBodySchema }, preHandler: requireAuth }, async request => {
    const patch = request.body as Partial<CustomerProfileInput>
    const profile = await updateCustomerProfile(env, request.user!.id, patch)
    return { data: { customerProfile: serializeCustomerProfile(profile) } }
  })
}
