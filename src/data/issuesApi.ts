// ─── Construction Issue API layer — Module 05 ──────────────────────────────
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from './apiClient'

export type IssueStatus = 'open' | 'in_progress' | 'resolved'
export const ISSUE_STATUSES: IssueStatus[] = ['open', 'in_progress', 'resolved']
export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

export type IssuePriority = 'low' | 'medium' | 'high'
export const ISSUE_PRIORITIES: IssuePriority[] = ['low', 'medium', 'high']
export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export interface ConstructionIssue {
  id: string
  projectId: string
  reportedBy: string
  title: string
  description: string | null
  stage: string | null
  status: IssueStatus
  priority: IssuePriority | null
  assigneeId: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ConstructionIssueInput {
  title: string
  description?: string
  stage?: string
  status?: IssueStatus
  priority?: IssuePriority
  assigneeId?: string
}

interface IssueEnvelope {
  data: { issue: ConstructionIssue }
}
interface IssueListEnvelope {
  data: { issues: ConstructionIssue[] }
}

export async function listIssues(projectId: string): Promise<ConstructionIssue[]> {
  const result = await apiGet<IssueListEnvelope>(`/api/v1/projects/${projectId}/issues`)
  return result.data.issues
}

export async function createIssue(projectId: string, input: ConstructionIssueInput): Promise<ConstructionIssue> {
  const result = await apiPost<IssueEnvelope>(`/api/v1/projects/${projectId}/issues`, input)
  return result.data.issue
}

export async function updateIssue(projectId: string, issueId: string, patch: Partial<ConstructionIssueInput>): Promise<ConstructionIssue> {
  const result = await apiPatch<IssueEnvelope>(`/api/v1/projects/${projectId}/issues/${issueId}`, patch)
  return result.data.issue
}

export async function deleteIssue(projectId: string, issueId: string): Promise<void> {
  await apiDelete(`/api/v1/projects/${projectId}/issues/${issueId}`)
}

export function describeIssueError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return 'Something went wrong. Please try again.'
}
