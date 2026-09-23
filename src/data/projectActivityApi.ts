import { ApiError, apiGet } from './apiClient'

export type ProjectActivityKind =
  | 'progress'
  | 'evidence'
  | 'task'
  | 'task_completed'
  | 'issue'
  | 'issue_resolved'
  | 'document'
  | 'workforce'

export interface ProjectActivityEvent {
  id: string
  kind: ProjectActivityKind
  title: string
  summary: string | null
  occurredAt: string
  stage: string | null
  visibility: 'internal' | 'customer' | null
  entityId: string
}

export interface ProjectActivityFeed {
  projectId: string
  projectName: string
  audience: 'company' | 'customer'
  generatedAt: string
  events: ProjectActivityEvent[]
}

export async function getProjectActivity(projectId: string): Promise<ProjectActivityFeed> {
  const res = await apiGet<{ data: { activity: ProjectActivityFeed } }>(
    `/api/v1/projects/${projectId}/activity`,
  )
  return res.data.activity
}

export function describeProjectActivityError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Sign in to view project activity.'
    if (err.status === 404) return 'Project activity is not available for this account.'
    if (err.code === 'NETWORK_ERROR') return err.message
    return err.message
  }
  return 'Unable to load project activity right now.'
}

export function formatActivityKind(kind: ProjectActivityKind): string {
  switch (kind) {
    case 'progress':
      return 'Progress'
    case 'evidence':
      return 'Evidence'
    case 'task':
      return 'Task'
    case 'task_completed':
      return 'Task completed'
    case 'issue':
      return 'Issue'
    case 'issue_resolved':
      return 'Issue resolved'
    case 'document':
      return 'Document'
    case 'workforce':
      return 'Workforce'
    default:
      return kind
  }
}

export function formatActivityWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
