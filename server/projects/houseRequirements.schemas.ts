// ─── House Requirements route validation — 12H-C ───────────────────────────
// Enum lists mirror src/data/houseRequirements.ts's own option arrays
// exactly (BUILDING_TYPE_OPTIONS, FLOORS_OPTIONS from estimateRevision.ts,
// FINISH_LEVEL_OPTIONS, SPECIAL_REQUIREMENT_OPTIONS) — never a guessed or
// stricter taxonomy. `projectId` is never a body property — it comes only
// from the URL param, resolved against the authenticated user's own
// Project server-side (see houseRequirements.service.ts). Fastify's default
// AJV config (removeAdditional:true + additionalProperties:false) silently
// strips any unlisted property (e.g. a client-supplied projectId/ownerId in
// the body) rather than rejecting the request outright.

const BUILDING_TYPE_ENUM = ['independent-house', 'villa', 'duplex', 'apartment', 'other']
const FLOORS_ENUM = ['G', 'G+1', 'G+2', 'G+3']
const FINISH_LEVEL_ENUM = ['basic', 'standard', 'premium', 'luxury']
const SPECIAL_REQUIREMENT_ENUM = [
  'home-office', 'pooja-room', 'servant-room', 'swimming-pool', 'garden',
  'lift', 'solar', 'smart-home', 'modular-kitchen', 'premium-bathroom', 'other',
]

export const putHouseRequirementsBodySchema = {
  type: 'object',
  required: ['buildingType', 'builtUpArea', 'floors', 'finishLevel'],
  additionalProperties: false,
  properties: {
    buildingType: { type: 'string', enum: BUILDING_TYPE_ENUM },
    plotArea: { type: ['integer', 'null'] },
    plotDimensions: { type: 'string', maxLength: 100 },
    siteConditions: { type: 'string', maxLength: 1000 },
    builtUpArea: { type: 'integer', minimum: 1 },
    floors: { type: 'string', enum: FLOORS_ENUM },
    bhk: { type: 'string', maxLength: 20 },
    bedrooms: { type: ['integer', 'null'] },
    bathrooms: { type: ['integer', 'null'] },
    hasLivingRoom: { type: 'boolean' },
    hasDiningArea: { type: 'boolean' },
    hasKitchen: { type: 'boolean' },
    hasUtilityArea: { type: 'boolean' },
    hasBalcony: { type: 'boolean' },
    hasStaircase: { type: 'boolean' },
    hasTerrace: { type: 'boolean' },
    parking: { type: ['integer', 'null'] },
    finishLevel: { type: 'string', enum: FINISH_LEVEL_ENUM },
    specialRequirements: { type: 'array', items: { type: 'string', enum: SPECIAL_REQUIREMENT_ENUM } },
    budgetExpected: { type: ['integer', 'null'] },
    budgetMin: { type: ['integer', 'null'] },
    budgetMax: { type: ['integer', 'null'] },
    timelineStart: { type: 'string', maxLength: 40 },
    timelineCompletion: { type: 'string', maxLength: 40 },
  },
} as const
