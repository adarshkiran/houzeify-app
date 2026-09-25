/** Estimation foundation — route ids for ProjectSubNav Estimates. */

export const ESTIMATE_ROUTES = {
  list: 'project-estimates',
  create: 'project-estimate-create',
  workspace: 'project-estimate-workspace',
} as const

export const ESTIMATE_FOUNDATION_NOTE =
  'Foundation only: list/create/workspace. S23 adds a guided Estimation Advisor (no LLM). No live pricing or customer share.'
