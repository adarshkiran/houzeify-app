/** Screen 03 — shared view-phase resolution for company rollup screens (C19–C23). */

export type CompanyRollupPhase =
  | 'no-org'
  | 'loading'
  | 'error'
  | 'empty-projects'
  | 'ready'
  | 'idle'

/**
 * Resolve the KEEP-polish shell phase for company Progress / Ops / Workforce /
 * Documents / Reports. Does not invent data — only maps org + fetch state.
 */
export function resolveCompanyRollupPhase(input: {
  hasOrganization: boolean
  loading: boolean
  error: string | null
  /** null when summary has not loaded yet */
  projectCount: number | null
}): CompanyRollupPhase {
  if (!input.hasOrganization) return 'no-org'
  if (input.loading) return 'loading'
  if (input.error) return 'error'
  if (input.projectCount === null) return 'idle'
  if (input.projectCount === 0) return 'empty-projects'
  return 'ready'
}
