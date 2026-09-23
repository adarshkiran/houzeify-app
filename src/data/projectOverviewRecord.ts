/** Screen 05 — Project Overview record helpers (canonical project fields only). */

const PROJECT_TYPE_LABELS: Record<string, string> = {
  'new-build': 'New Construction',
  renovation: 'Renovation',
}

/** Human label for projects.type — never invents unknown values. */
export function projectTypeLabel(type: string | null | undefined): string | undefined {
  if (!type?.trim()) return undefined
  return PROJECT_TYPE_LABELS[type] ?? type
}

/**
 * Overview is the project record; Workspace is the operational hub.
 * These sections belong on Overview (not Workspace module cards).
 */
export const PROJECT_OVERVIEW_RECORD_SECTIONS = [
  'project-details',
  'about',
  'stage-in-plan',
  'latest-update',
] as const

export type ProjectOverviewRecordSection = (typeof PROJECT_OVERVIEW_RECORD_SECTIONS)[number]
