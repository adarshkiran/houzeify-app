// ─── Screen 01 — Company Home rollup helpers ────────────────────────────────
// Pure aggregation over existing C19/C23 summary payloads. No new API.

export interface CompanyHomeProgressLatestUpdate {
  id: string
  date: string
  title: string
  stage: string | null
  visibility: string
  createdAt: string
}

export interface CompanyHomeProgressProject {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  latestUpdate: CompanyHomeProgressLatestUpdate | null
}

export interface CompanyHomeProgressSummary {
  totals: {
    projectCount: number
    updateCount: number
  }
  projects: CompanyHomeProgressProject[]
}

export interface CompanyHomeOpsTask {
  id: string
  title: string
  status: string
  priority: string | null
}

export interface CompanyHomeOpsIssue {
  id: string
  title: string
  status: string
  priority: string | null
}

export interface CompanyHomeOpsProject {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  openTasks: CompanyHomeOpsTask[]
  openIssues: CompanyHomeOpsIssue[]
}

export interface CompanyHomeOpsSummary {
  totals: {
    projectCount: number
    openTasks: number
    openIssues: number
  }
  projects: CompanyHomeOpsProject[]
}

export interface CompanyHomeStat {
  label: string
  value: string
  dest: string
}

export interface CompanyHomeRecentProgress {
  projectId: string
  projectName: string
  title: string
  date: string
  visibility: string
  stage: string | null
  location: string | null
  propertyType: string | null
  type: string | null
  status: string | null
}

export interface CompanyHomeOpenItem {
  kind: 'task' | 'issue'
  id: string
  title: string
  projectId: string
  projectName: string
  status: string
  priority: string | null
  location: string | null
  propertyType: string | null
  type: string | null
  stage: string | null
  projectStatus: string | null
}

export function buildCompanyHomeStats(
  progress: CompanyHomeProgressSummary | null,
  ops: CompanyHomeOpsSummary | null,
): CompanyHomeStat[] {
  const projectCount = progress?.totals.projectCount ?? ops?.totals.projectCount ?? 0
  return [
    { label: 'Projects', value: String(projectCount), dest: 'company-projects' },
    { label: 'Open tasks', value: String(ops?.totals.openTasks ?? 0), dest: 'site-operations' },
    { label: 'Open issues', value: String(ops?.totals.openIssues ?? 0), dest: 'site-operations' },
    { label: 'Progress updates', value: String(progress?.totals.updateCount ?? 0), dest: 'company-progress' },
  ]
}

export function buildCompanyHomeRecentProgress(
  progress: CompanyHomeProgressSummary | null,
  limit = 5,
): CompanyHomeRecentProgress[] {
  if (!progress) return []
  return progress.projects
    .filter((p): p is CompanyHomeProgressProject & { latestUpdate: CompanyHomeProgressLatestUpdate } => Boolean(p.latestUpdate))
    .map(p => ({
      projectId: p.id,
      projectName: p.name,
      title: p.latestUpdate.title,
      date: p.latestUpdate.date,
      visibility: p.latestUpdate.visibility,
      stage: p.stage,
      location: p.location,
      propertyType: p.propertyType,
      type: p.type,
      status: p.status,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}

export function buildCompanyHomeOpenItems(
  ops: CompanyHomeOpsSummary | null,
  limit = 6,
): CompanyHomeOpenItem[] {
  if (!ops) return []
  const items: CompanyHomeOpenItem[] = []
  for (const project of ops.projects) {
    for (const task of project.openTasks) {
      items.push({
        kind: 'task',
        id: task.id,
        title: task.title,
        projectId: project.id,
        projectName: project.name,
        status: task.status,
        priority: task.priority,
        location: project.location,
        propertyType: project.propertyType,
        type: project.type,
        stage: project.stage,
        projectStatus: project.status,
      })
    }
    for (const issue of project.openIssues) {
      items.push({
        kind: 'issue',
        id: issue.id,
        title: issue.title,
        projectId: project.id,
        projectName: project.name,
        status: issue.status,
        priority: issue.priority,
        location: project.location,
        propertyType: project.propertyType,
        type: project.type,
        stage: project.stage,
        projectStatus: project.status,
      })
    }
  }
  return items
    .sort((a, b) => {
      const aHigh = a.priority === 'high' ? 0 : 1
      const bHigh = b.priority === 'high' ? 0 : 1
      if (aHigh !== bHigh) return aHigh - bHigh
      return a.projectName.localeCompare(b.projectName)
    })
    .slice(0, limit)
}
