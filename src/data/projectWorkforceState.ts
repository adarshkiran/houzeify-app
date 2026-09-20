// ─── Project Workforce frontend state — Module 06 ──────────────────────────
// Same status-machine shape as dailyProgressState.ts: 'idle' | 'loading' |
// 'loaded' | 'error'. Consumers MUST check status before reading `members`
// — an empty array during 'idle'/'loading' is not the same as a genuinely
// empty site team. See ProjectOverviewScreen.tsx's own isLoading fix
// (Houzeify 2.0 corrective-fix pass) for why this matters.
//
// Deliberately a project-scoped HOOK, not a global Context/Provider — same
// rationale as useDailyProgress()/useIssues(): workforce is only ever needed
// for one project at a time, never a cross-project list.
//
// Fetch/credentials/envelope conventions are copied from dailyProgressState.ts
// + dailyProgressApi.ts (both read in full before writing this file): the
// shared apiClient.ts helpers (base URL, `credentials: 'include'`, ApiError)
// are reused as-is, and the `{ data: { members: [...] } }` /
// `{ data: { member: {...} } }` envelopes are unwrapped the same way
// dailyProgressApi.ts unwraps `{ data: { progress: ... } }`. Everything lives
// in this one file (no separate projectWorkforceApi.ts) per this task's scope
// — Task 4's brief creates exactly one file.
//
// One deliberate deviation from useDailyProgress()/useIssues(): those hooks
// splice mutation results directly into local state (no refetch after
// create/update/remove). This hook instead re-runs the same `load()` used by
// the initial effect after every mutation, per this task's brief explicitly
// asking for a single shared `load` used by both the effect and
// refetch/post-mutation. Simpler to reason about for a resource with 3
// mutation types, at the cost of one extra round-trip per mutation.

import { useCallback, useEffect, useState } from 'react'
import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export type ProjectWorkforceStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface ProjectWorkforceMember {
  id: string
  projectId: string
  userId: string
  role: string
  status: 'active' | 'removed'
  addedBy: string
  removedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UseProjectWorkforceResult {
  status: ProjectWorkforceStatus
  members: ProjectWorkforceMember[]
  error: string | null
  addMember: (input: { userId: string; role: string }) => Promise<void>
  updateRole: (id: string, role: string) => Promise<void>
  removeMember: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

interface ProjectWorkforceListEnvelope {
  data: { members: ProjectWorkforceMember[] }
}
interface ProjectWorkforceMemberEnvelope {
  data: { member: ProjectWorkforceMember }
}

export function useProjectWorkforce(projectId: string | undefined): UseProjectWorkforceResult {
  const [status, setStatus] = useState<ProjectWorkforceStatus>('idle')
  const [members, setMembers] = useState<ProjectWorkforceMember[]>([])
  const [error, setError] = useState<string | null>(null)

  // `silent` skips the `setStatus('loading')` transition — used by the
  // three mutations' own post-success refetch below so editing/removing/
  // adding one member doesn't blank the entire rendered roster (the
  // screen's `isLoading` check swaps in a "Loading site team…" placeholder
  // for the whole list whenever status === 'loading') for the length of
  // that refetch round-trip. The initial mount effect and the explicit
  // user-facing `refetch()` both still call this with the default
  // (non-silent) so they keep showing the loading state as before —
  // `members`/`error` update identically either way; only the transient
  // loading flicker is suppressed for mutation-triggered refetches.
  const load = useCallback(
    async (silent = false) => {
      if (!projectId) return
      if (!silent) setStatus('loading')
      setError(null)
      try {
        const res = await apiGet<ProjectWorkforceListEnvelope>(`/api/v1/projects/${projectId}/workforce`)
        setMembers(res.data.members)
        setStatus('loaded')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unable to load the site team right now.')
      }
    },
    [projectId],
  )

  useEffect(() => {
    load()
  }, [load])

  const addMember = useCallback(
    async (input: { userId: string; role: string }) => {
      if (!projectId) throw new Error('No project selected.')
      await apiPost<ProjectWorkforceMemberEnvelope>(`/api/v1/projects/${projectId}/workforce`, input)
      await load(true)
    },
    [projectId, load],
  )

  const updateRole = useCallback(
    async (id: string, role: string) => {
      if (!projectId) throw new Error('No project selected.')
      await apiPatch<ProjectWorkforceMemberEnvelope>(`/api/v1/projects/${projectId}/workforce/${id}`, { role })
      await load(true)
    },
    [projectId, load],
  )

  const removeMember = useCallback(
    async (id: string) => {
      if (!projectId) throw new Error('No project selected.')
      await apiDelete<null>(`/api/v1/projects/${projectId}/workforce/${id}`)
      await load(true)
    },
    [projectId, load],
  )

  return { status, members, error, addMember, updateRole, removeMember, refetch: load }
}
