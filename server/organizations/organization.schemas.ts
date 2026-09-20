// ─── Organization route validation — 12G-B ─────────────────────────────────
// `type` is intentionally an open string here, not a closed enum — see the
// schema.ts comment on organizations.type for why (two incompatible
// frontend taxonomies, reconciled in a later frontend-wiring phase).
// `ownerId` is never a property here — creation always takes the owner
// from request.user.id (organization.service.ts). Fastify's default AJV
// config (removeAdditional:true + additionalProperties:false) silently
// strips a client-supplied `ownerId` before it ever reaches request.body,
// but the real guarantee is that the service layer never reads ownerId
// from anywhere except its own explicit parameter.

export const createOrganizationBodySchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 200 },
    type: { type: 'string', maxLength: 60 },
    phone: { type: 'string', maxLength: 30 },
    email: { type: 'string', maxLength: 254 },
    website: { type: 'string', maxLength: 300 },
    location: { type: 'string', maxLength: 200 },
    logoUrl: { type: 'string', maxLength: 2000 },
  },
} as const

export const patchOrganizationBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 200 },
    type: { type: 'string', maxLength: 60 },
    phone: { type: 'string', maxLength: 30 },
    email: { type: 'string', maxLength: 254 },
    website: { type: 'string', maxLength: 300 },
    location: { type: 'string', maxLength: 200 },
    logoUrl: { type: 'string', maxLength: 2000 },
  },
} as const
