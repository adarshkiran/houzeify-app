// ─── Project estimates request schemas ─────────────────────────────────────

import { ESTIMATE_PRICING_METHODS } from './projectEstimates.types.js'

export const createEstimateBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'pricingMethod'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    pricingMethod: { type: 'string', enum: [...ESTIMATE_PRICING_METHODS] },
    currency: { type: 'string', minLength: 3, maxLength: 8 },
    location: { type: 'string', maxLength: 300 },
    areaSqft: { type: 'integer', minimum: 1, maximum: 10_000_000 },
  },
} as const
