// ─── Construction Task API layer — Module 05 ───────────────────────────────
// Mirrors dailyProgressApi.ts's shape exactly. Backend contract read
// directly from server/projects/constructionTasks.types.ts's
// serializeConstructionTask() output.

import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from './apiClient'

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed'
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'completed']
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
}

export type TaskPriority = 'low' | 'medium' | 'high'
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export interface ConstructionTask {
  id: string
  projectId: string
  createdBy: string
  title: string
  description: string | null
  stage: string | null
  status: TaskStatus
  priority: TaskPriority | null
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface ConstructionTaskInput {
  title: string
  description?: string
  stage?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  dueDate?: string
}

interface TaskEnvelope {
  data: { task: ConstructionTask }
}
interface TaskListEnvelope {
  data: { tasks: ConstructionTask[] }
}

export async function listTasks(projectId: string): Promise<ConstructionTask[]> {
  const result = await apiGet<TaskListEnvelope>(`/api/v1/projects/${projectId}/tasks`)
  return result.data.tasks
}

export async function createTask(projectId: string, input: ConstructionTaskInput): Promise<ConstructionTask> {
  const result = await apiPost<TaskEnvelope>(`/api/v1/projects/${projectId}/tasks`, input)
  return result.data.task
}

export async function updateTask(projectId: string, taskId: string, patch: Partial<ConstructionTaskInput>): Promise<ConstructionTask> {
  const result = await apiPatch<TaskEnvelope>(`/api/v1/projects/${projectId}/tasks/${taskId}`, patch)
  return result.data.task
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  await apiDelete(`/api/v1/projects/${projectId}/tasks/${taskId}`)
}

export function describeTaskError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return 'Something went wrong. Please try again.'
}
