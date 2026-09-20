// ─── Construction Issue state — Module 05 ──────────────────────────────────
import { useCallback, useEffect, useState } from 'react'
import {
  createIssue as apiCreate,
  deleteIssue as apiDeleteIssue,
  listIssues,
  updateIssue as apiUpdate,
  type ConstructionIssue,
  type ConstructionIssueInput,
} from './issuesApi'

export type IssuesStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseIssuesResult {
  status: IssuesStatus
  issues: ConstructionIssue[]
  errorMessage: string | null
  refresh: () => Promise<void>
  create: (input: ConstructionIssueInput) => Promise<ConstructionIssue>
  update: (issueId: string, patch: Partial<ConstructionIssueInput>) => Promise<ConstructionIssue>
  remove: (issueId: string) => Promise<void>
}

export function useIssues(projectId: string | undefined): UseIssuesResult {
  const [status, setStatus] = useState<IssuesStatus>('idle')
  const [issues, setIssues] = useState<ConstructionIssue[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!projectId) return
    setStatus('loading')
    setErrorMessage(null)
    try {
      const result = await listIssues(projectId)
      setIssues(result)
      setStatus('loaded')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load issues right now.')
    }
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (input: ConstructionIssueInput) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiCreate(projectId, input)
      setIssues(prev => [result, ...prev])
      return result
    },
    [projectId],
  )

  const update = useCallback(
    async (issueId: string, patch: Partial<ConstructionIssueInput>) => {
      if (!projectId) throw new Error('No project selected.')
      const result = await apiUpdate(projectId, issueId, patch)
      setIssues(prev => prev.map(i => (i.id === result.id ? result : i)))
      return result
    },
    [projectId],
  )

  const remove = useCallback(
    async (issueId: string) => {
      if (!projectId) throw new Error('No project selected.')
      await apiDeleteIssue(projectId, issueId)
      setIssues(prev => prev.filter(i => i.id !== issueId))
    },
    [projectId],
  )

  return { status, issues, errorMessage, refresh, create, update, remove }
}
