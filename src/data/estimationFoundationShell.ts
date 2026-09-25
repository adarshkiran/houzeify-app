/** Estimation foundation — route ids for the Estimation module. */

export const ESTIMATE_ROUTES = {
  overview: 'estimation-overview',
  list: 'project-estimates',
  create: 'project-estimate-create',
  workspace: 'project-estimate-workspace',
} as const

export const ESTIMATE_FOUNDATION_NOTE =
  'Foundation: list/create/workspace + guided Advisor (S23) + house plan upload/analyzer seam (S24) + Material Calculator plan handoff (S25). Estimation is a main Side Nav module. No live OCR, Price Intelligence, or customer share.'
