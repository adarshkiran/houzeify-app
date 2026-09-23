// ─── Daily Progress state — Module 04 ──────────────────────────────────────
// Deliberately a project-scoped HOOK, not a global Context/Provider like
// useProjects()/useOrganizations(). Daily Progress is only ever needed for
// one project at a time — a Provider would be premature architecture for
// data that is never a cross-project list. Mirrors useProjects()'s status/
// error/CRUD shape for consistency.

import { useCallback, useEffect, useState } from 'react'
import {
  addDailyProgressPhoto as apiAddPhoto,
  createDailyProgress as apiCreate,
  deleteDailyProgress as apiDeleteProgress,
  listDailyProgress,
  updateDailyProgress as apiUpdate,
  type DailyProgress,
  type DailyProgressInput,
} from './dailyProgressApi'

export type DailyProgressStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseDailyProgressResult {
  status: DailyProgressStatus
  progress: DailyProgress[]
  errorMessage: string | null
  refresh: () => Promise<void>
  create: (input: DailyProgressInput) => Promise<DailyProgress>
  update: (progressId: string, patch: Partial<DailyProgressInput>) => Promise<DailyProgress>
  remove: (progressId: string) => Promise<void>
  addPhoto: (progressId: string, file: File) => Promise<void>
}

export function useDailyProgress(projectId: string | undefined): UseDailyProgressResult {
  const [status, setStatus] = useState<DailyProgressStatus>('idle')
  const [progress, setProgress] = useState<DailyProgress[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) return
    setStatus('loading')
    setErrorMessage(null)
    try {
      const result = await listDailyProgress(projectId)
      setProgress(result)
      setStatus('loaded')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load progress right now.')
    }
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (input: DailyProgressInput) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiCreate(projectId, input)
      setProgress(prev => [result, ...prev])
      return result
    },
    [projectId],
  )

  const update = useCallback(
    async (progressId: string, patch: Partial<DailyProgressInput>) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiUpdate(projectId, progressId, patch)
      setProgress(prev => prev.map(p => (p.id === result.id ? result : p)))
      return result
    },
    [projectId],
  )

  const remove = useCallback(
    async (progressId: string) => {
      if (!projectId) throw new Error('No project selected.')
      await apiDeleteProgress(projectId, progressId)
      setProgress(prev => prev.filter(p => p.id !== progressId))
    },
    [projectId],
  )

  const addPhoto = useCallback(
    async (progressId: string, file: File) => {
      if (!projectId) throw new Error('No project selected.')
      const photo = await apiAddPhoto(projectId, progressId, file)
      setProgress(prev => prev.map(p => (p.id === progressId ? { ...p, photos: [...p.photos, photo] } : p)))
    },
    [projectId],
  )

  return { status, progress, errorMessage, refresh, create, update, remove, addPhoto }
}
