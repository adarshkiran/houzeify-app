// ─── Project Documents route validation — Module 07 ────────────────────────
// `uploadedBy` / `storageRef` / `status` / `archivedAt` are never body
// properties on any schema — always server-set. Fastify's default AJV config
// (removeAdditional:true + additionalProperties:false) silently strips a
// client-supplied one instead of rejecting it, so a forged value is ignored.
// The file-extension rule is a service-layer check (AJV cannot express
// "ends with one of"); category/size/mimeType shape is validated here.
// `title` uses pattern '\\S' so a whitespace-only title is rejected.
import { DOCUMENT_CATEGORIES, MAX_DOCUMENT_SIZE_BYTES } from './documentFileTypes.js'

const categoryEnum = [...DOCUMENT_CATEGORIES]

export const createProjectDocumentBodySchema = {
  type: 'object',
  required: ['category', 'fileName', 'mimeType', 'size'],
  additionalProperties: false,
  properties: {
    category: { type: 'string', enum: categoryEnum },
    fileName: { type: 'string', minLength: 1, maxLength: 255 },
    mimeType: { type: 'string', maxLength: 100, pattern: '^[\\w.+-]+/[\\w.+-]+$' },
    size: { type: 'integer', minimum: 1, maximum: MAX_DOCUMENT_SIZE_BYTES },
    title: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
    description: { type: 'string', maxLength: 2000 },
  },
} as const

export const patchProjectDocumentBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
    description: { type: 'string', maxLength: 2000 },
    category: { type: 'string', enum: categoryEnum },
    visibility: { type: 'string', enum: ['internal', 'customer'] },
  },
} as const
