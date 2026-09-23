import { ApiError, apiGet } from './apiClient'

export interface OrganizationReportsProject {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  stageIndex: number | null
  stageTotal: number
  stageName: string | null
  progress: {
    totalCount: number
    publishedCount: number
    photoCount: number
    videoCount: number
  }
  documents: {
    totalActive: number
    sharedWithCustomer: number
  }
  workforceActiveCount: number
  operations: {
    tasksOpen: number
    tasksTotal: number
    issuesOpen: number
    issuesTotal: number
    boqItemCount: number
    boqTotalAmountPaise: number
  }
}

export interface OrganizationReportsSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    progressUpdates: number
    sharedProgress: number
    photos: number
    videos: number
    activeDocuments: number
    sharedDocuments: number
    openTasks: number
    openIssues: number
  }
  projects: OrganizationReportsProject[]
}

export async function getOrganizationReportsSummary(
  organizationId: string,
): Promise<OrganizationReportsSummary> {
  const res = await apiGet<{ data: { summary: OrganizationReportsSummary } }>(
    `/api/v1/organizations/${organizationId}/reports-summary`,
  )
  return res.data.summary
}

export function describeOrganizationReportsError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Sign in to view company reports.'
    if (err.status === 404) return 'Organization reports are not available for this account.'
    if (err.code === 'NETWORK_ERROR') return err.message
    return err.message
  }
  return 'Unable to load company reports right now.'
}

export function formatBoqRupees(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}
