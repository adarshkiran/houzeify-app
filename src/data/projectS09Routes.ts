/** Screen 09 — four project modules on the Phase 2 spine. */
export const PROJECT_S09_ROUTES = [
  'project-workforce',
  'project-documents',
  'project-boq',
  'project-customer',
] as const

export type ProjectS09Route = (typeof PROJECT_S09_ROUTES)[number]
