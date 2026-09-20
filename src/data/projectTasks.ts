// ─── Project Tasks — typed data model + service ─────────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "project tasks" API replaces; Screen 073 must only ever
// create, read or update a task through the functions here, never inline in
// the component.
//
// No task/checklist/project-management model existed anywhere in the
// codebase before this file (confirmed via repo-wide search) — this is the
// smallest reusable model the brief asks for, matching bids.ts's own
// conventions (in-memory array store, `<prefix>-<epoch-ms>-<counter>` ids,
// create/get functions, never a delete). Every task is scoped to a real
// projectId — there is no "global task" concept.

export type TaskStatus = 'todo' | 'in-progress' | 'completed'
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'completed']
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export type TaskPriority = 'low' | 'medium' | 'high'
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export interface ProjectTask {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority | null
  /** Free-text label only — e.g. a homeowner name or contractor/org name.
   *  No separate assignee/user-id linkage exists, matching how this app has
   *  no project-member model (confirmed again during Screen 070's build). */
  assignedTo: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

// ─── In-memory demo store ───────────────────────────────────────────────────

const allTasks: ProjectTask[] = []

let counter = 0
function nextId(): string {
  counter += 1
  return `task-${Date.now()}-${counter}`
}

/** Every task belonging to one project — Screen 073's own read path. */
export function getTasksForProject(projectId: string): ProjectTask[] {
  return allTasks.filter(t => t.projectId === projectId)
}

export function getTaskById(id: string): ProjectTask | undefined {
  return allTasks.find(t => t.id === id)
}

export interface CreateTaskInput {
  projectId: string
  title: string
  description?: string
  assignedTo?: string | null
  dueDate?: string | null
  priority?: TaskPriority | null
}

export interface TaskFormErrors {
  title?: string
}

export function validateTaskForm(title: string): TaskFormErrors {
  return title.trim() ? {} : { title: 'Task title is required.' }
}

/** Assembles and stores a new task — the seam a real "create task" API call
 *  replaces. Always creates status 'todo'. Requires a real projectId; never
 *  creates a task without one. */
export function createTask(data: CreateTaskInput): ProjectTask {
  const now = new Date().toISOString()
  const task: ProjectTask = {
    id: nextId(),
    projectId: data.projectId,
    title: data.title.trim(),
    description: (data.description ?? '').trim(),
    status: 'todo',
    priority: data.priority ?? null,
    assignedTo: data.assignedTo?.trim() || null,
    dueDate: data.dueDate || null,
    createdAt: now,
    updatedAt: now,
  }
  allTasks.push(task)
  return task
}

/** Updates a task's status only — never deletes a task, completed tasks
 *  remain part of project history. Free movement between all three
 *  statuses is supported (this is the whole architecture, so "backward
 *  movement" is simply allowed rather than restricted). */
export function updateTaskStatus(id: string, status: TaskStatus): ProjectTask | undefined {
  const task = allTasks.find(t => t.id === id)
  if (!task) return undefined
  task.status = status
  task.updatedAt = new Date().toISOString()
  return task
}

export function formatTaskDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
