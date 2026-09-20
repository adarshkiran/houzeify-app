// ─── Construction Task state — Module 05 ───────────────────────────────────
// Plain project-scoped hook, not a global Context — mirrors
// dailyProgressState.ts's useDailyProgress() shape exactly.

import { useCallback, useEffect, useState } from 'react'
import {
  createTask as apiCreate,
  deleteTask as apiDeleteTask,
  listTasks,
  updateTask as apiUpdate,
  type ConstructionTask,
  type ConstructionTaskInput,
} from './tasksApi'

export type TasksStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseTasksResult {
  status: TasksStatus
  tasks: ConstructionTask[]
  errorMessage: string | null
  refresh: () => Promise<void>
  create: (input: ConstructionTaskInput) => Promise<ConstructionTask>
  update: (taskId: string, patch: Partial<ConstructionTaskInput>) => Promise<ConstructionTask>
  remove: (taskId: string) => Promise<void>
}

export function useTasks(projectId: string | undefined): UseTasksResult {
  const [status, setStatus] = useState<TasksStatus>('idle')
  const [tasks, setTasks] = useState<ConstructionTask[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) return
    setStatus('loading')
    setErrorMessage(null)
    try {
      const result = await listTasks(projectId)
      setTasks(result)
      setStatus('loaded')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load tasks right now.')
    }
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (input: ConstructionTaskInput) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiCreate(projectId, input)
      setTasks(prev => [result, ...prev])
      return result
    },
    [projectId],
  )

  const update = useCallback(
    async (taskId: string, patch: Partial<ConstructionTaskInput>) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiUpdate(projectId, taskId, patch)
      setTasks(prev => prev.map(t => (t.id === result.id ? result : t)))
      return result
    },
    [projectId],
  )

  const remove = useCallback(
    async (taskId: string) => {
      if (!projectId) throw new Error('No project selected.')
      await apiDeleteTask(projectId, taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    },
    [projectId],
  )

  return { status, tasks, errorMessage, refresh, create, update, remove }
}
