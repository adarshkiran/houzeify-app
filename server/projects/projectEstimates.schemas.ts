// ─── Project estimates request schemas — foundation + S27 builder ──────────

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

export const createEstimateItemBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    category: { type: ['string', 'null'], maxLength: 32 },
    description: { type: ['string', 'null'], maxLength: 2000 },
    quantity: { type: ['number', 'null'], exclusiveMinimum: 0, maximum: 10_000_000 },
    unit: { type: ['string', 'null'], maxLength: 32 },
    rate: { type: ['number', 'null'], minimum: 0, maximum: 100_000_000 },
    ratePaise: { type: ['integer', 'null'], minimum: 0, maximum: 10_000_000_000 },
    rateSource: { type: ['string', 'null'], maxLength: 64 },
    effectiveDate: { type: ['string', 'null'], pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    confidence: { type: ['string', 'null'], maxLength: 32 },
    sourceReference: { type: ['string', 'null'], maxLength: 300 },
    notes: { type: ['string', 'null'], maxLength: 2000 },
    sortOrder: { type: 'integer', minimum: 0, maximum: 100_000 },
  },
} as const

export const patchEstimateItemBodySchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    category: { type: ['string', 'null'], maxLength: 32 },
    description: { type: ['string', 'null'], maxLength: 2000 },
    quantity: { type: ['number', 'null'], exclusiveMinimum: 0, maximum: 10_000_000 },
    unit: { type: ['string', 'null'], maxLength: 32 },
    rate: { type: ['number', 'null'], minimum: 0, maximum: 100_000_000 },
    ratePaise: { type: ['integer', 'null'], minimum: 0, maximum: 10_000_000_000 },
    rateSource: { type: ['string', 'null'], maxLength: 64 },
    effectiveDate: { type: ['string', 'null'], pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    confidence: { type: ['string', 'null'], maxLength: 32 },
    sourceReference: { type: ['string', 'null'], maxLength: 300 },
    notes: { type: ['string', 'null'], maxLength: 2000 },
    sortOrder: { type: 'integer', minimum: 0, maximum: 100_000 },
    clearRate: { type: 'boolean' },
  },
} as const

export const shareEstimateBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    versionId: { type: 'string', format: 'uuid' },
  },
} as const

export const generateEstimateBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    builtUpArea: { type: 'number', exclusiveMinimum: 0, maximum: 10_000_000 },
    floors: { type: 'integer', minimum: 1, maximum: 100 },
    constructionLevel: { type: 'string', enum: ['Basic', 'Standard', 'Premium'] },
    location: { type: 'string', maxLength: 300 },
    replaceItems: { type: 'boolean' },
  },
} as const
