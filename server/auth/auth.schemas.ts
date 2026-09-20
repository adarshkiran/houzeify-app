// ─── Fastify route-level JSON Schema validation ─────────────────────────────
// No validation library is added — Fastify's built-in AJV integration is
// enough for two small request bodies. Malformed input never reaches
// auth.service.ts; Fastify rejects it before the handler runs.

export const requestOtpBodySchema = {
  type: 'object',
  required: ['phoneNumber'],
  additionalProperties: false,
  properties: {
    phoneNumber: { type: 'string', minLength: 4, maxLength: 20 },
  },
} as const

export const verifyOtpBodySchema = {
  type: 'object',
  required: ['phoneNumber', 'otp'],
  additionalProperties: false,
  properties: {
    phoneNumber: { type: 'string', minLength: 4, maxLength: 20 },
    otp: { type: 'string', pattern: '^\\d{6}$' },
  },
} as const
