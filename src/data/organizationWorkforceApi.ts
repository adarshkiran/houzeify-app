import { ApiError, apiGet } from './apiClient'

export interface OrganizationWorkforceMember {
  displayName: string
  role: string
  assignedAt: string
}

export interface OrganizationWorkforceProject {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  activeCount: number
  members: OrganizationWorkforceMember[]
}

export interface OrganizationWorkforceSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    projectsWithCrew: number
    assignmentCount: number
    uniquePeopleCount: number
  }
  projects: OrganizationWorkforceProject[]
}

export async function getOrganizationWorkforceSummary(
  organizationId: string,
): Promise<OrganizationWorkforceSummary> {
  const res = await apiGet<{ data: { summary: OrganizationWorkforceSummary } }>(
    `/api/v1/organizations/${organizationId}/workforce-summary`,
  )
  return res.data.summary
}

export function describeOrganizationWorkforceError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Sign in to view company workforce.'
    if (err.status === 404) return 'Organization workforce is not available for this account.'
    if (err.code === 'NETWORK_ERROR') return err.message
    return err.message
  }
  return 'Unable to load company workforce right now.'
}
