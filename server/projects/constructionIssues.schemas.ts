// ─── Construction Issue route validation — Module 05 ───────────────────────
// Same conventions as constructionTasks.schemas.ts. `resolvedAt` is
// deliberately absent from BOTH schemas below — there is no request-body
// path by which a client can set it; constructionIssues.service.ts sets it
// server-side, only on the transition to 'resolved'.

import { VALID_STAGE_IDS } from './constructionStageIds.js'

export const ISSUE_STATUSES = ['open', 'in_progress', 'resolved'] as const
export const ISSUE_PRIORITIES = ['low', 'medium', 'high'] as const

export const createConstructionIssueBodySchema = {
  type: 'object',
  required: ['title'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    stage: { type: 'string', enum: VALID_STAGE_IDS },
    status: { type: 'string', enum: ISSUE_STATUSES },
    priority: { type: 'string', enum: ISSUE_PRIORITIES },
    assigneeId: { type: 'string', minLength: 1 },
  },
} as const

export const patchConstructionIssueBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 2000 },
    stage: { type: 'string', enum: VALID_STAGE_IDS },
    status: { type: 'string', enum: ISSUE_STATUSES },
    priority: { type: 'string', enum: ISSUE_PRIORITIES },
    assigneeId: { type: 'string', minLength: 1 },
  },
} as const
