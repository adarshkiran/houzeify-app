import { ApiError, apiGet } from './apiClient'

export interface OrganizationProgressLatestUpdate {
  id: string
  date: string
  title: string
  stage: string | null
  visibility: string
  createdAt: string
}

export interface OrganizationProgressProject {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  updateCount: number
  sharedWithCustomerCount: number
  photoCount: number
  videoCount: number
  latestUpdate: OrganizationProgressLatestUpdate | null
}

export interface OrganizationProgressSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    projectsWithUpdates: number
    updateCount: number
    sharedWithCustomerCount: number
    photoCount: number
    videoCount: number
  }
  projects: OrganizationProgressProject[]
}

export async function getOrganizationProgressSummary(
  organizationId: string,
): Promise<OrganizationProgressSummary> {
  const res = await apiGet<{ data: { summary: OrganizationProgressSummary } }>(
    `/api/v1/organizations/${organizationId}/progress-summary`,
  )
  return res.data.summary
}

export function describeOrganizationProgressError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Sign in to view company progress.'
    if (err.status === 404) return 'Organization progress is not available for this account.'
    if (err.code === 'NETWORK_ERROR') return err.message
    return err.message
  }
  return 'Unable to load company progress right now.'
}
