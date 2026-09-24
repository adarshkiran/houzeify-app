// ─── S14 — Site Operations client filters (CompanyOpenWorkScreen) ───────────
// Pure helpers over C23 OrganizationOpsSummary. No API / schema changes.
// Filters: project · type (task|issue) · status · overdue-only.
// Preserves C23 pour-slab / water-seepage style fixtures in tests.

import type {
  OrganizationOpsIssue,
  OrganizationOpsProject,
  OrganizationOpsSummary,
  OrganizationOpsTask,
} from './organizationOpsApi'

export type OpsWorkTypeFilter = 'all' | 'tasks' | 'issues'

export type OpsFilterState = {
  projectId: 'all' | string
  type: OpsWorkTypeFilter
  status: 'all' | string
  overdueOnly: boolean
}

export const DEFAULT_OPS_FILTERS: OpsFilterState = {
  projectId: 'all',
  type: 'all',
  status: 'all',
  overdueOnly: false,
}

/** Calendar day (local) for due-date comparison — matches ProjectWorkspaceScreen. */
export function todayIsoDate(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isTaskOverdue(task: OrganizationOpsTask, today = todayIsoDate()): boolean {
  if (!task.dueDate) return false
  return task.dueDate < today
}

export function collectOpsStatuses(projects: OrganizationOpsProject[]): string[] {
  const set = new Set<string>()
  for (const project of projects) {
    for (const task of project.openTasks) set.add(task.status)
    for (const issue of project.openIssues) set.add(issue.status)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

function filterTasks(
  tasks: OrganizationOpsTask[],
  filters: OpsFilterState,
  today: string,
): OrganizationOpsTask[] {
  if (filters.type === 'issues') return []
  let next = tasks
  if (filters.status !== 'all') next = next.filter(t => t.status === filters.status)
  if (filters.overdueOnly) next = next.filter(t => isTaskOverdue(t, today))
  // Overdue first, then title.
  return [...next].sort((a, b) => {
    const aOver = isTaskOverdue(a, today) ? 0 : 1
    const bOver = isTaskOverdue(b, today) ? 0 : 1
    if (aOver !== bOver) return aOver - bOver
    return a.title.localeCompare(b.title)
  })
}

function filterIssues(
  issues: OrganizationOpsIssue[],
  filters: OpsFilterState,
): OrganizationOpsIssue[] {
  if (filters.type === 'tasks') return []
  // Overdue-only is task-only (issues have no dueDate in C23).
  if (filters.overdueOnly) return []
  let next = issues
  if (filters.status !== 'all') next = next.filter(i => i.status === filters.status)
  return [...next].sort((a, b) => a.title.localeCompare(b.title))
}

export type FilteredOpsProject = OrganizationOpsProject & {
  overdueTaskCount: number
  filteredTasks: OrganizationOpsTask[]
  filteredIssues: OrganizationOpsIssue[]
}

/**
 * Apply S14 filters to a C23 summary. Projects with no matching items after
 * filters are omitted (except when filters are all-default — then keep every
 * project so empty open-work cards still show).
 */
export function filterOpsProjects(
  summary: OrganizationOpsSummary,
  filters: OpsFilterState,
  today = todayIsoDate(),
): FilteredOpsProject[] {
  const defaults =
    filters.projectId === 'all'
    && filters.type === 'all'
    && filters.status === 'all'
    && !filters.overdueOnly

  const source =
    filters.projectId === 'all'
      ? summary.projects
      : summary.projects.filter(p => p.id === filters.projectId)

  const mapped: FilteredOpsProject[] = source.map(project => {
    const filteredTasks = filterTasks(project.openTasks, filters, today)
    const filteredIssues = filterIssues(project.openIssues, filters)
    const overdueTaskCount = project.openTasks.filter(t => isTaskOverdue(t, today)).length
    return {
      ...project,
      overdueTaskCount,
      filteredTasks,
      filteredIssues,
    }
  })

  if (defaults) return mapped

  return mapped.filter(p => p.filteredTasks.length > 0 || p.filteredIssues.length > 0)
}

export function countFilteredOpenWork(projects: FilteredOpsProject[]): {
  tasks: number
  issues: number
  overdue: number
} {
  let tasks = 0
  let issues = 0
  let overdue = 0
  for (const p of projects) {
    tasks += p.filteredTasks.length
    issues += p.filteredIssues.length
    overdue += p.filteredTasks.filter(t => isTaskOverdue(t)).length
  }
  return { tasks, issues, overdue }
}
