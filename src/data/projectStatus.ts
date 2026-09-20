// ─── Project Status — Houzeify 2.0 Module 03 ────────────────────────────────
// The real backend `projects.status` column (added this module) has no DB
// enum — same established convention as `type`/`stage`/`propertyType` (see
// server/db/schema.ts's own comment on why). This is the one, canonical
// status taxonomy for it — confirmed via inspection that nothing else in
// the codebase already covers this concept: portfolio.ts's own
// `ProjectStatus` type is a different thing entirely (a partner's past-work
// showcase item's status, not a construction project's lifecycle state).
// A homeowner's own project (no `status` set) keeps using the existing,
// unrelated `resolveProjectStatus()` derivation in projects.ts — this
// taxonomy is only ever written/read for a company-owned construction
// project, never retrofitted onto the homeowner flow.

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived'

export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ['planning', 'active', 'on-hold', 'completed', 'archived']

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
}

export function isProjectStatus(value: string | null | undefined): value is ProjectStatus {
  return Boolean(value) && (PROJECT_STATUS_OPTIONS as string[]).includes(value as string)
}
