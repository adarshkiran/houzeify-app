// ─── Project Bill of Quantities frontend state — Module 07 ─────────────────
// Mirrors projectDocumentsState.ts: status machine 'idle' | 'loading' |
// 'loaded' | 'error', one shared `load(silent)` used by the mount effect and
// (silently) after every mutation. Consumers MUST check status before reading
// `boq` — the empty BOQ during 'idle'/'loading' is not an empty Bill of
// Quantities.
//
// The hook never fetches (stays 'idle') unless `projectId` is a real server
// UUID — homeowner New-Build projects use client-local ids.
//
// Mutation errors PROPAGATE to the caller (screens catch them and show
// describeBoqError()). `refetch` is a wrapper so the internal `silent` flag is
// not part of the public contract.

import { useCallback, useEffect, useRef, useState } from 'react'
import { isServerProjectId } from './projectIds'
import {
  createBoqItem,
  createBoqSection,
  deleteBoqItem,
  deleteBoqSection,
  getBoq,
  renameBoqSection,
  updateBoqItem,
  type BoqDto,
  type CreateBoqItemInput,
  type UpdateBoqItemInput,
} from './projectBoqApi'

export type ProjectBoqStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseProjectBoqResult {
  status: ProjectBoqStatus
  boq: BoqDto
  error: string | null
  /** True once a BOQ has been loaded for the current project. Stays true
   *  through a failed silent refetch, so a screen can keep showing the
   *  last-good BOQ next to an error banner ("never loaded" vs "loaded
   *  before"). Reset when a non-silent load starts. */
  hasLoaded: boolean
  addSection: (name: string) => Promise<void>
  renameSection: (id: string, name: string) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  addItem: (input: CreateBoqItemInput) => Promise<void>
  updateItem: (id: string, patch: UpdateBoqItemInput) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refetch: () => Promise<void>
  /** Silent reload: keeps the current BOQ on screen (no 'loading' state). */
  refresh: () => Promise<void>
}

const EMPTY_BOQ: BoqDto = {
  currency: 'INR',
  sections: [],
  totals: { sectionCount: 0, itemCount: 0, total: 0 },
}

export function useProjectBoq(projectId?: string): UseProjectBoqResult {
  const [status, setStatus] = useState<ProjectBoqStatus>('idle')
  const [boq, setBoq] = useState<BoqDto>(EMPTY_BOQ)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  // Monotonic request counter: a load whose id is no longer current (a newer
  // load started, or projectId changed) must not write state.
  const requestId = useRef(0)

  // `silent` skips the 'loading' transition so a mutation's own refetch does
  // not blank the rendered BOQ.
  const load = useCallback(
    async (silent = false) => {
      const myRequest = ++requestId.current
      if (!isServerProjectId(projectId)) {
        setStatus('idle')
        setBoq(EMPTY_BOQ)
        setError(null)
        setHasLoaded(false)
        return
      }
      if (!silent) {
        setStatus('loading')
        setHasLoaded(false)
      }
      setError(null)
      try {
        const next = await getBoq(projectId as string)
        if (myRequest !== requestId.current) return
        setBoq(next)
        setStatus('loaded')
        setHasLoaded(true)
      } catch (err) {
        if (myRequest !== requestId.current) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unable to load the Bill of Quantities right now.')
      }
    },
    [projectId],
  )

  useEffect(() => {
    load()
    // Invalidate any in-flight load when projectId changes or on unmount.
    return () => {
      requestId.current++
    }
  }, [load])

  // The write has already reached the server when this runs, so a failed
  // reload must not turn the mutation into a failure (the caller would keep
  // its editor open and the user would save the same change twice). load()
  // records the failure itself (status 'error' + the last-good BOQ stays), so
  // the screen surfaces it through its banner. The catch is belt-and-braces.
  const reload = useCallback(async () => {
    try {
      await load(true)
    } catch {
      // load() already set the error state.
    }
  }, [load])

  const addSection = useCallback(
    async (name: string) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await createBoqSection(projectId as string, name)
      await reload()
    },
    [projectId, load, reload],
  )

  const renameSection = useCallback(
    async (id: string, name: string) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await renameBoqSection(projectId as string, id, name)
      await reload()
    },
    [projectId, load, reload],
  )

  const deleteSection = useCallback(
    async (id: string) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await deleteBoqSection(projectId as string, id)
      await reload()
    },
    [projectId, load, reload],
  )

  const addItem = useCallback(
    async (input: CreateBoqItemInput) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await createBoqItem(projectId as string, input)
      await reload()
    },
    [projectId, load, reload],
  )

  const updateItem = useCallback(
    async (id: string, patch: UpdateBoqItemInput) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await updateBoqItem(projectId as string, id, patch)
      await reload()
    },
    [projectId, load, reload],
  )

  const deleteItem = useCallback(
    async (id: string) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await deleteBoqItem(projectId as string, id)
      await reload()
    },
    [projectId, load, reload],
  )

  const refetch = useCallback(() => load(), [load])
  const refresh = useCallback(() => load(true), [load])

  return { status, boq, error, hasLoaded, addSection, renameSection, deleteSection, addItem, updateItem, deleteItem, refetch, refresh }
}
