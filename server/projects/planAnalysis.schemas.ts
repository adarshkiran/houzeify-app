// ─── Plan analysis request schemas — S24 ───────────────────────────────────

const planFieldSource = { type: 'string', enum: ['extracted', 'user'] } as const

const planSpaceSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name', 'kind', 'source'],
  properties: {
    id: { type: 'string', minLength: 1, maxLength: 64 },
    name: { type: 'string', maxLength: 120 },
    kind: { type: 'string', maxLength: 64 },
    source: planFieldSource,
  },
} as const

const planOpeningSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'kind', 'label', 'source'],
  properties: {
    id: { type: 'string', minLength: 1, maxLength: 64 },
    kind: { type: 'string', enum: ['door', 'window', 'other'] },
    label: { type: 'string', maxLength: 120 },
    source: planFieldSource,
  },
} as const

const planDimensionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'label', 'value', 'unit', 'source'],
  properties: {
    id: { type: 'string', minLength: 1, maxLength: 64 },
    label: { type: 'string', maxLength: 120 },
    value: { type: 'string', maxLength: 64 },
    unit: { type: 'string', maxLength: 32 },
    source: planFieldSource,
  },
} as const

export const planExtractedDataSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'projectType',
    'builtUpAreaSqft',
    'floors',
    'spaces',
    'openings',
    'dimensions',
    'notes',
  ],
  properties: {
    projectType: { type: ['string', 'null'], maxLength: 80 },
    builtUpAreaSqft: { type: ['number', 'null'], minimum: 0 },
    floors: { type: ['integer', 'null'], minimum: 1 },
    spaces: { type: 'array', maxItems: 100, items: planSpaceSchema },
    openings: { type: 'array', maxItems: 200, items: planOpeningSchema },
    dimensions: { type: 'array', maxItems: 200, items: planDimensionSchema },
    notes: { type: ['string', 'null'], maxLength: 4000 },
  },
} as const

export const createPlanAnalysisBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['documentId'],
  properties: {
    documentId: { type: 'string', format: 'uuid' },
  },
} as const

export const patchPlanAnalysisBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    extractedData: planExtractedDataSchema,
  },
} as const
