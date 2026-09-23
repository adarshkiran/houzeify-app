// ─── Daily Progress route validation — Module 04 ───────────────────────────
// `date` is a STRICT "YYYY-MM-DD" pattern — unlike project.schemas.ts's
// `stage`/`type` free strings, this one is validated because future
// timelines/reports/AI summaries/delay analysis need a reliably parseable
// date, per the spec's own explicit correction. `stage` stays an open
// string (no DB enum), same convention as projects.stage. Photo metadata:
// `mimeType` must be an image type this module only accepts image
// evidence; `size` is capped at 15 MB. `storageRef` is never a body
// property here — it is always server-generated
// (dailyProgress.service.ts's addDailyProgressPhoto()); Fastify's default
// AJV config (removeAdditional:true + additionalProperties:false) also
// silently strips a client-supplied storageRef even if sent.

const DATE_PATTERN = '^\\d{4}-\\d{2}-\\d{2}$'
const MAX_PHOTO_SIZE_BYTES = 15 * 1024 * 1024

export const createDailyProgressBodySchema = {
  type: 'object',
  required: ['date', 'title'],
  additionalProperties: false,
  properties: {
    date: { type: 'string', pattern: DATE_PATTERN },
    stage: { type: 'string', maxLength: 60 },
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
  },
} as const

export const patchDailyProgressBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    date: { type: 'string', pattern: DATE_PATTERN },
    stage: { type: 'string', maxLength: 60 },
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    visibility: { type: 'string', enum: ['internal', 'customer'] },
  },
} as const

// Photo upload is multipart (see dailyProgress.routes.ts). The JSON body
// schema below is retained only as documentation of legacy metadata fields;
// the route no longer accepts JSON photo uploads.
export const addDailyProgressPhotoBodySchema = {
  type: 'object',
  required: ['fileName', 'mimeType', 'size'],
  additionalProperties: false,
  properties: {
    fileName: { type: 'string', minLength: 1, maxLength: 255 },
    mimeType: { type: 'string', pattern: '^image/' },
    size: { type: 'integer', minimum: 1, maximum: MAX_PHOTO_SIZE_BYTES },
  },
} as const
