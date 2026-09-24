/** Screen 10 — Construction Record stays on the existing C18 package route. */
export const PROJECT_CONSTRUCTION_RECORD_ROUTE = 'project-reports' as const

export const PROJECT_CONSTRUCTION_RECORD_SECTIONS = [
  'project',
  'stage-journey',
  'daily-progress-evidence',
  'documents',
  'workforce',
  'operations-company-only',
] as const

export type ProjectConstructionRecordSection = (typeof PROJECT_CONSTRUCTION_RECORD_SECTIONS)[number]
