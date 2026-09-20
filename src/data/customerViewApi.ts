import { ApiError, apiGet } from './apiClient'

export interface CustomerViewHeader {
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
  latestProgress: { id: string; date: string; title: string; stage: string | null } | null
}

export interface CustomerViewPhoto {
  id: string
  fileName: string
  mimeType: string
  size: number
  createdAt: string
}

export interface CustomerViewProgress {
  id: string
  projectId: string
  date: string
  stage: string | null
  title: string
  description: string | null
  publishedAt: string | null
  photos: CustomerViewPhoto[]
  createdAt: string
  updatedAt: string
}

export interface CustomerViewDocument {
  id: string
  projectId: string
  category: string
  title: string
  description: string | null
  fileName: string
  mimeType: string
  size: number
  fileAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerViewWorkforceMember {
  displayName: string
  role: string
}

export interface CustomerViewTimelineStage {
  id: string
  name: string
  state: 'completed' | 'current' | 'upcoming'
  latestPublishedDate: string | null
}

export async function getCustomerView(projectId: string): Promise<CustomerViewHeader> {
  const res = await apiGet<{ data: { project: CustomerViewHeader } }>(`/api/v1/projects/${projectId}/customer-view`)
  return res.data.project
}

export async function listCustomerViewProgress(projectId: string): Promise<CustomerViewProgress[]> {
  const res = await apiGet<{ data: { progress: CustomerViewProgress[] } }>(`/api/v1/projects/${projectId}/customer-view/progress`)
  return res.data.progress
}

export async function listCustomerViewDocuments(projectId: string): Promise<CustomerViewDocument[]> {
  const res = await apiGet<{ data: { documents: CustomerViewDocument[] } }>(`/api/v1/projects/${projectId}/customer-view/documents`)
  return res.data.documents
}

export async function listCustomerViewWorkforce(projectId: string): Promise<CustomerViewWorkforceMember[]> {
  const res = await apiGet<{ data: { workforce: CustomerViewWorkforceMember[] } }>(`/api/v1/projects/${projectId}/customer-view/workforce`)
  return res.data.workforce
}

export async function getCustomerViewTimeline(projectId: string): Promise<CustomerViewTimelineStage[]> {
  const res = await apiGet<{ data: { timeline: CustomerViewTimelineStage[] } }>(`/api/v1/projects/${projectId}/customer-view/timeline`)
  return res.data.timeline
}

export function describeCustomerViewError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  if (err.code === 'NOT_FOUND') return 'This project is no longer shared with you.'
  return err.message
}
