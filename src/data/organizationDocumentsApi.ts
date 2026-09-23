import { ApiError, apiGet } from './apiClient'

export interface OrganizationDocumentsRecent {
  id: string
  title: string
  category: string
  fileName: string
  visibility: string
  createdAt: string
}

export interface OrganizationDocumentsProject {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  activeCount: number
  sharedWithCustomerCount: number
  recent: OrganizationDocumentsRecent[]
}

export interface OrganizationDocumentsSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    projectsWithDocuments: number
    activeDocuments: number
    sharedWithCustomer: number
  }
  projects: OrganizationDocumentsProject[]
}

export async function getOrganizationDocumentsSummary(
  organizationId: string,
): Promise<OrganizationDocumentsSummary> {
  const res = await apiGet<{ data: { summary: OrganizationDocumentsSummary } }>(
    `/api/v1/organizations/${organizationId}/documents-summary`,
  )
  return res.data.summary
}

export function describeOrganizationDocumentsError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Sign in to view company documents.'
    if (err.status === 404) return 'Organization documents are not available for this account.'
    if (err.code === 'NETWORK_ERROR') return err.message
    return err.message
  }
  return 'Unable to load company documents right now.'
}

export function formatDocumentCategory(category: string): string {
  return category
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
