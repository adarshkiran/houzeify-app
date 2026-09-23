/** Screen 07 — Timeline keeps stages + activity on one surface. */
export const PROJECT_TIMELINE_SECTIONS = ['construction-stages', 'project-activity'] as const

export type ProjectTimelineSection = (typeof PROJECT_TIMELINE_SECTIONS)[number]
