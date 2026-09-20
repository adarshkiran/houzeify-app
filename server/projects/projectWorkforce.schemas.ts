// ─── Project Workforce route validation — Module 06 ────────────────────────
// `role` is a free-text field (no DB enum, same convention as
// constructionTasks.priority/stage) — validated only for non-empty/length
// here. `userId` is shape-only (a non-empty string) — whether it's a REAL,
// authorized project participant is a service-layer check
// (projectWorkforce.service.ts), since AJV cannot express that.
// `addedBy`/`status`/`removedAt` are never body properties on any schema —
// always server-set.

export const addProjectWorkforceMemberBodySchema = {
  type: 'object',
  required: ['userId', 'role'],
  additionalProperties: false,
  properties: {
    userId: { type: 'string', minLength: 1 },
    role: { type: 'string', minLength: 1, maxLength: 100 },
  },
} as const

export const patchProjectWorkforceMemberBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    role: { type: 'string', minLength: 1, maxLength: 100 },
  },
} as const
