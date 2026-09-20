// ─── Project Documents frontend state — Module 07 ──────────────────────────
// Mirrors projectWorkforceState.ts: status machine 'idle' | 'loading' |
// 'loaded' | 'error', one shared `load(silent)` used by the mount effect and
// (silently) after every mutation. Consumers MUST check status before reading
// `documents` — an empty array during 'idle'/'loading' is not an empty
// repository.
//
// The hook never fetches (stays 'idle') unless `projectId` is a real server
// UUID — homeowner New-Build projects use client-local ids.
//
// Mutation errors PROPAGATE to the caller (screens catch them and show
// describeDocumentError()). `refetch` is a wrapper so the internal `silent`
// flag is not part of the public contract.

import { useCallback, useEffect, useRef, useState } from 'react'
import { isServerProjectId } from './projectIds'
import {
  archiveProjectDocument,
  createProjectDocument,
  listProjectDocuments,
  updateProjectDocument,
  type CreateProjectDocumentInput,
  type ProjectDocumentDto,
  type UpdateProjectDocumentInput,
} from './projectDocumentsApi'

export type ProjectDocumentsStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UseProjectDocumentsResult {
  status: ProjectDocumentsStatus
  documents: ProjectDocumentDto[]
  error: string | null
  addDocument: (input: CreateProjectDocumentInput) => Promise<void>
  updateDocument: (id: string, patch: UpdateProjectDocumentInput) => Promise<void>
  archiveDocument: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useProjectDocuments(projectId?: string): UseProjectDocumentsResult {
  const [status, setStatus] = useState<ProjectDocumentsStatus>('idle')
  const [documents, setDocuments] = useState<ProjectDocumentDto[]>([])
  const [error, setError] = useState<string | null>(null)
  // Monotonic request counter: a load whose id is no longer current (a newer
  // load started, or projectId changed) must not write state.
  const requestId = useRef(0)

  // `silent` skips the 'loading' transition so a mutation's own refetch does
  // not blank the rendered list.
  const load = useCallback(
    async (silent = false) => {
      const myRequest = ++requestId.current
      if (!isServerProjectId(projectId)) {
        setStatus('idle')
        setDocuments([])
        setError(null)
        return
      }
      if (!silent) setStatus('loading')
      setError(null)
      try {
        const list = await listProjectDocuments(projectId as string)
        if (myRequest !== requestId.current) return
        setDocuments(list)
        setStatus('loaded')
      } catch (err) {
        if (myRequest !== requestId.current) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Unable to load documents right now.')
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

  const addDocument = useCallback(
    async (input: CreateProjectDocumentInput) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await createProjectDocument(projectId as string, input)
      await load(true)
    },
    [projectId, load],
  )

  const updateDocument = useCallback(
    async (id: string, patch: UpdateProjectDocumentInput) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await updateProjectDocument(projectId as string, id, patch)
      await load(true)
    },
    [projectId, load],
  )

  const archiveDocument = useCallback(
    async (id: string) => {
      if (!isServerProjectId(projectId)) throw new Error('No project selected.')
      await archiveProjectDocument(projectId as string, id)
      await load(true)
    },
    [projectId, load],
  )

  const refetch = useCallback(() => load(), [load])

  return { status, documents, error, addDocument, updateDocument, archiveDocument, refetch }
}
