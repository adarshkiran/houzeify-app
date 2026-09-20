// ─── Customer profile route validation — 12G-B ─────────────────────────────
// `userId` is deliberately absent from `properties` below, and
// `additionalProperties: false` means Fastify's default AJV config
// (removeAdditional:true) silently strips a client-supplied `userId` (or
// any other unlisted field) before request.body is even populated — it
// never reaches the route or service layer. Ownership is only ever taken
// from request.user.id (see customerProfile.service.ts).

const UNIT_PREFERENCE_OPTIONS = ['sq ft', 'sq m'] as const
const CURRENCY_PREFERENCE_OPTIONS = ['INR'] as const

export const createCustomerProfileBodySchema = {
  type: 'object',
  required: ['fullName'],
  additionalProperties: false,
  properties: {
    fullName: { type: 'string', minLength: 1, maxLength: 200 },
    preferredName: { type: 'string', maxLength: 100 },
    // Not `format: 'email'` — Fastify's default AJV instance doesn't
    // register ajv-formats, so that keyword would silently validate
    // nothing. Real email shape is checked in the service layer instead
    // (see isValidEmail in customerProfile.service.ts).
    email: { type: 'string', maxLength: 254 },
    location: { type: 'string', maxLength: 200 },
    language: { type: 'string', maxLength: 50 },
    unitPreference: { type: 'string', enum: [...UNIT_PREFERENCE_OPTIONS] },
    currencyPreference: { type: 'string', enum: [...CURRENCY_PREFERENCE_OPTIONS] },
  },
} as const

export const patchCustomerProfileBodySchema = {
  type: 'object',
  // No `required` — a partial update. The route itself rejects an empty
  // body (see customerProfile.routes.ts) rather than expressing "at least
  // one property" in JSON Schema.
  additionalProperties: false,
  properties: {
    fullName: { type: 'string', minLength: 1, maxLength: 200 },
    preferredName: { type: 'string', maxLength: 100 },
    // Not `format: 'email'` — Fastify's default AJV instance doesn't
    // register ajv-formats, so that keyword would silently validate
    // nothing. Real email shape is checked in the service layer instead
    // (see isValidEmail in customerProfile.service.ts).
    email: { type: 'string', maxLength: 254 },
    location: { type: 'string', maxLength: 200 },
    language: { type: 'string', maxLength: 50 },
    unitPreference: { type: 'string', enum: [...UNIT_PREFERENCE_OPTIONS] },
    currencyPreference: { type: 'string', enum: [...CURRENCY_PREFERENCE_OPTIONS] },
  },
} as const
