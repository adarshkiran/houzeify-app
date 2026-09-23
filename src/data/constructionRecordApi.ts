import { ApiError, apiGet } from './apiClient'

export interface ConstructionRecordTimelineStage {
  id: string
  name: string
  state: 'completed' | 'current' | 'upcoming'
  latestPublishedDate: string | null
}

export interface ConstructionRecord {
  audience: 'company' | 'customer'
  generatedAt: string
  project: {
    id: string
    name: string
    location: string | null
    propertyType: string | null
    status: string | null
    stage: string | null
    timelineStart: string | null
    timelineCompletion: string | null
    summary: string | null
    organizationName: string | null
  }
  stage: {
    currentId: string | null
    currentName: string | null
    index: number | null
    total: number
  }
  timeline: ConstructionRecordTimelineStage[]
  progress: {
    totalCount: number
    publishedCount: number
    photoCount: number
    videoCount: number
    latest: {
      id: string
      date: string
      title: string
      stage: string | null
      visibility?: string
    } | null
    recent: Array<{
      id: string
      date: string
      title: string
      stage: string | null
      photoCount: number
      videoCount: number
      visibility?: string
    }>
  }
  documents: {
    totalActive: number
    sharedWithCustomer: number
    recent: Array<{
      id: string
      title: string
      category: string
      fileName: string
      visibility?: string
    }>
  }
  workforce: {
    activeCount: number
    members: Array<{ displayName: string; role: string }>
  }
  operations?: {
    tasks: { total: number; open: number; completed: number }
    issues: { total: number; open: number; highOpen: number }
    boq: { sectionCount: number; itemCount: number; totalAmountPaise: number }
  }
}

export async function getConstructionRecord(projectId: string): Promise<ConstructionRecord> {
  const res = await apiGet<{ data: { record: ConstructionRecord } }>(
    `/api/v1/projects/${projectId}/construction-record`,
  )
  return res.data.record
}

export function describeConstructionRecordError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Unable to load the construction record.'
  switch (err.code) {
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
    case 'NOT_FOUND':
    case 'INVALID_ID':
      return err.message
    default:
      return 'Unable to load the construction record.'
  }
}
