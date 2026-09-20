// ─── Project route validation — 12H-B ──────────────────────────────────────
// `type`/`stage`/`propertyType`/`status` are intentionally open strings, not
// closed enums — mirrors organization.schemas.ts's own `type` rationale: the
// frontend (src/data/projects.ts) never enforces these as a closed union at
// the storage layer either (ProjectType is a TS-only hint, `stage` is a
// free string). `ownerId` is never a property here — creation always takes
// the owner from request.user.id (project.service.ts). Fastify's default
// AJV config (removeAdditional:true + additionalProperties:false) silently
// strips a client-supplied `ownerId` before it ever reaches request.body.
//
// Module 03 — `organizationId` accepted on create only (never patch: a
// project's company is set once at creation, changing it later is a
// transfer-ownership operation this phase doesn't build); membership is
// verified server-side in project.service.ts's createProject(), never
// trusted from the body alone. `status`/`timelineStart`/`timelineCompletion`
// accepted on both, same open-string convention as `stage`.

const ORGANIZATION_ID_PATTERN = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'

export const createProjectBodySchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    organizationId: { type: 'string', pattern: ORGANIZATION_ID_PATTERN },
    type: { type: 'string', maxLength: 40 },
    location: { type: 'string', maxLength: 200 },
    propertyType: { type: 'string', maxLength: 60 },
    stage: { type: 'string', maxLength: 60 },
    status: { type: 'string', maxLength: 40 },
    timelineStart: { type: 'string', maxLength: 40 },
    timelineCompletion: { type: 'string', maxLength: 40 },
    summary: { type: 'string', maxLength: 500 },
  },
} as const

export const patchProjectBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    type: { type: 'string', maxLength: 40 },
    location: { type: 'string', maxLength: 200 },
    propertyType: { type: 'string', maxLength: 60 },
    stage: { type: 'string', maxLength: 60 },
    status: { type: 'string', maxLength: 40 },
    timelineStart: { type: 'string', maxLength: 40 },
    timelineCompletion: { type: 'string', maxLength: 40 },
    summary: { type: 'string', maxLength: 500 },
  },
} as const
