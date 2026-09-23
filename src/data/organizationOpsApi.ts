import { ApiError, apiGet } from './apiClient'

export interface OrganizationOpsTask {
  id: string
  title: string
  status: string
  priority: string | null
  stage: string | null
  dueDate: string | null
  updatedAt: string
}

export interface OrganizationOpsIssue {
  id: string
  title: string
  status: string
  priority: string | null
  stage: string | null
  updatedAt: string
}

export interface OrganizationOpsProject {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  openTaskCount: number
  openIssueCount: number
  highOpenIssueCount: number
  openTasks: OrganizationOpsTask[]
  openIssues: OrganizationOpsIssue[]
}

export interface OrganizationOpsSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    projectsWithOpenWork: number
    openTasks: number
    openIssues: number
    highOpenIssues: number
  }
  projects: OrganizationOpsProject[]
}

export async function getOrganizationOpsSummary(organizationId: string): Promise<OrganizationOpsSummary> {
  const res = await apiGet<{ data: { summary: OrganizationOpsSummary } }>(
    `/api/v1/organizations/${organizationId}/ops-summary`,
  )
  return res.data.summary
}

export function describeOrganizationOpsError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Sign in to view site operations.'
    if (err.status === 404) return 'Organization site operations are not available for this account.'
    if (err.code === 'NETWORK_ERROR') return err.message
    return err.message
  }
  return 'Unable to load site operations right now.'
}

export function formatOpsStatus(status: string): string {
  return status
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatOpsPriority(priority: string | null): string {
  if (!priority) return 'No priority'
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}
