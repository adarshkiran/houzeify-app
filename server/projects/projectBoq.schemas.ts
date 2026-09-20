// ─── Project BOQ route validation — Module 07 ──────────────────────────────
// `createdBy` / `projectId` are never body properties: always server-set.
// Fastify's default AJV config (removeAdditional:true + additionalProperties:
// false) silently strips a client-supplied one instead of rejecting it.
// `name` uses pattern '\\S' so a whitespace-only name is rejected; the service
// trims it before storing.
//
// Fastify's default AJV runs with coerceTypes, so a bare `type: 'string'`
// silently accepts `{ name: 123 }` as "123" (and true, ['a'] likewise).
// AJV cannot be told per-schema not to coerce, so `rejectNonStringFields`
// (a preValidation hook, which sees the RAW body) rejects those first. It
// answers with the same FST_ERR_VALIDATION code AJV uses, so clients handle
// one validation shape.
import type { FastifyReply, FastifyRequest } from 'fastify'
import { HttpError } from '../errors/httpError.js'
import { VALID_STAGE_IDS } from './constructionStageIds.js'

export function rejectNonStringFields(...fields: string[]) {
  return async function rejectNonString(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const body = request.body
    if (body === null || typeof body !== 'object') return // AJV reports a missing/invalid body
    for (const field of fields) {
      const value = (body as Record<string, unknown>)[field]
      if (value !== undefined && value !== null && typeof value !== 'string') {
        throw new HttpError('FST_ERR_VALIDATION', `body/${field} must be string`, 400)
      }
    }
  }
}

/** Same idea for numbers: AJV would coerce "12.5" -> 12.5 and null/false -> 0
 *  (a silently free rate), so a PRESENT numeric field must be a real JSON number
 *  in the raw body. null is rejected too. The numeric range / precision rules
 *  live in boqMoney.ts, which yields the specific INVALID_QUANTITY / INVALID_RATE
 *  codes. A missing or non-object body is left to AJV (400), never a crash. */
export function rejectNonNumberFields(...fields: string[]) {
  return async function rejectNonNumber(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const body = request.body
    if (body === null || typeof body !== 'object') return // AJV reports a missing/invalid body
    for (const field of fields) {
      const value = (body as Record<string, unknown>)[field]
      if (value !== undefined && typeof value !== 'number') {
        throw new HttpError('FST_ERR_VALIDATION', `body/${field} must be number`, 400)
      }
    }
  }
}

const sectionNameSchema = { type: 'string', minLength: 1, maxLength: 120, pattern: '\\S' } as const

export const createBoqSectionBodySchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: sectionNameSchema,
  },
} as const

export const patchBoqSectionBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: sectionNameSchema,
  },
} as const

// ─── Items ────────────────────────────────────────────────────────────────
// `amount`, `createdBy`, `projectId`, `id` are never body properties: the amount
// is computed by the server (boqMoney.ts) and the rest are server-set. Text
// fields are guarded with rejectNonStringFields, quantity/rate with
// rejectNonNumberFields (see above); the schema's `type: 'number'` is only the
// second line of defence. Names/units are trimmed by the service.
const itemProperties = {
  sectionId: { type: 'string', minLength: 1, maxLength: 64 },
  name: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
  description: { type: 'string', maxLength: 2000 },
  stage: { type: 'string', enum: [...VALID_STAGE_IDS] },
  quantity: { type: 'number' },
  unit: { type: 'string', minLength: 1, maxLength: 20, pattern: '\\S' },
  rate: { type: 'number' },
} as const

export const BOQ_ITEM_TEXT_FIELDS = ['sectionId', 'name', 'description', 'stage', 'unit'] as const
export const BOQ_ITEM_NUMBER_FIELDS = ['quantity', 'rate'] as const

export const createBoqItemBodySchema = {
  type: 'object',
  required: ['sectionId', 'name', 'quantity', 'unit', 'rate'],
  additionalProperties: false,
  properties: itemProperties,
} as const

export const patchBoqItemBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: itemProperties,
} as const
