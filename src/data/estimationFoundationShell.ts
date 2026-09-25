/** Estimation foundation — route ids for the Estimation module. */

export const ESTIMATE_ROUTES = {
  overview: 'estimation-overview',
  list: 'project-estimates',
  create: 'project-estimate-create',
  workspace: 'project-estimate-workspace',
} as const

export const ESTIMATE_FOUNDATION_NOTE =
  'Foundation only: list/create/workspace. S23 adds a guided Estimation Advisor (no LLM). Estimation is a main Side Nav module. No live pricing or customer share.'
