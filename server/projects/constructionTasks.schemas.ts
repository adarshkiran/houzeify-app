// ─── Construction Task route validation — Module 05 ────────────────────────
// `stage`/`status`/`priority` are closed AJV enums — unlike daily_progress's
// open-string `stage` (a gap flagged as technical debt in Module 04's final
// review), this module validates all three at the schema layer. `assigneeId`
// is shape-only here (a non-empty string) — whether it's a REAL, authorized
// participant is a service-layer check (constructionTasks.service.ts),
// since AJV cannot express that. `createdBy` is never a body property on
// any schema — always server-set from request.user.id.

import { VALID_STAGE_IDS } from './constructionStageIds.js'

const DATE_PATTERN = '^\\d{4}-\\d{2}-\\d{2}$'
export const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'completed'] as const
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const

export const createConstructionTaskBodySchema = {
  type: 'object',
  required: ['title'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    stage: { type: 'string', enum: VALID_STAGE_IDS },
    status: { type: 'string', enum: TASK_STATUSES },
    priority: { type: 'string', enum: TASK_PRIORITIES },
    assigneeId: { type: 'string', minLength: 1 },
    dueDate: { type: 'string', pattern: DATE_PATTERN },
  },
} as const

export const patchConstructionTaskBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    stage: { type: 'string', enum: VALID_STAGE_IDS },
    status: { type: 'string', enum: TASK_STATUSES },
    priority: { type: 'string', enum: TASK_PRIORITIES },
    assigneeId: { type: 'string', minLength: 1 },
    dueDate: { type: 'string', pattern: DATE_PATTERN },
  },
} as const
