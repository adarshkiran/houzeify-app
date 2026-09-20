import { ApiError, apiDelete, apiGet, apiPost, apiPut } from './apiClient'

export interface ProjectCustomer {
  userId: string
  status: string
  email: string | null
  fullName: string | null
  preferredName: string | null
  invitedAt: string
  acceptedAt: string | null
}

export interface CustomerProjectListItem {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  timelineStart: string | null
  timelineCompletion: string | null
  organizationId: string | null
  organizationName: string | null
  customerStatus: 'invited' | 'active' | string
  invitedAt: string
  acceptedAt: string | null
}

interface CustomerEnvelope {
  data: { customer: ProjectCustomer }
}
interface CustomerProjectListEnvelope {
  data: { projects: CustomerProjectListItem[] }
}

export async function getProjectCustomer(projectId: string): Promise<ProjectCustomer | null> {
  try {
    const res = await apiGet<CustomerEnvelope>(`/api/v1/projects/${projectId}/customer`)
    return res.data.customer
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function inviteProjectCustomer(projectId: string, email: string): Promise<ProjectCustomer> {
  const res = await apiPut<CustomerEnvelope>(`/api/v1/projects/${projectId}/customer`, { email })
  return res.data.customer
}

export async function removeProjectCustomer(projectId: string): Promise<void> {
  await apiDelete<null>(`/api/v1/projects/${projectId}/customer`)
}

export async function acceptProjectCustomerInvite(projectId: string): Promise<ProjectCustomer> {
  const res = await apiPost<CustomerEnvelope>(`/api/v1/projects/${projectId}/customer/accept`)
  return res.data.customer
}

export async function listCustomerProjects(): Promise<CustomerProjectListItem[]> {
  const res = await apiGet<CustomerProjectListEnvelope>('/api/v1/projects?as=customer')
  return res.data.projects
}

export function describeCustomerError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  switch (err.code) {
    case 'USER_NOT_FOUND':
    case 'ALREADY_PARTICIPANT':
    case 'NOT_COMPANY_PROJECT':
    case 'NOT_FOUND':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
    case 'INVALID_ID':
    case 'EMPTY_PATCH':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
