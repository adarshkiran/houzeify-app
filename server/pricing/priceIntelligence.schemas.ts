// ─── Price Intelligence request schemas — S26 ──────────────────────────────

import { RATE_KINDS, RATE_SOURCE_TYPES } from './priceIntelligence.types.js'

export const createOrganizationRateBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['kind', 'name', 'unit', 'ratePaise', 'effectiveFrom'],
  properties: {
    kind: { type: 'string', enum: [...RATE_KINDS] },
    name: { type: 'string', minLength: 1, maxLength: 120 },
    unit: { type: 'string', minLength: 1, maxLength: 32 },
    ratePaise: { type: 'integer', minimum: 1, maximum: 100_000_000_000 },
    currency: { type: 'string', minLength: 3, maxLength: 8 },
    sourceType: { type: 'string', enum: [...RATE_SOURCE_TYPES] },
    sourceReference: { type: 'string', maxLength: 300 },
    location: { type: 'string', maxLength: 300 },
    projectId: { type: 'string', format: 'uuid' },
    effectiveFrom: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    effectiveTo: { type: ['string', 'null'], pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    confidence: { type: ['string', 'null'], maxLength: 32 },
  },
} as const
