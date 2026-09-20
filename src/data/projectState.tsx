// ─── Project State (12H-B, extended Module 03) — real backend projects ────
// Same Context/Provider/hook pattern as organizationState.tsx (12G-C3): a
// project is a LIST resource (a homeowner can have many real projects — the
// 12H-A audit confirmed multi-project support is genuine, not incidental),
// so this provider bootstraps the user's full project list, not a single
// 0..1 profile. `type`/`stage`/`status`/`propertyType`/`summary` stay plain
// nullable strings end-to-end (API -> state -> screens) — this layer never
// invents a closed taxonomy stricter than what src/data/projects.ts's own
// frontend Project type or the real backend schema already enforce.
//
// Deliberately its own provider, never merged into CustomerProfileProvider/
// PartnerProfileProvider/OrganizationProvider — Project identity is a
// fourth, separate concept (owned by a User, not identity itself).
//
// Module 03 — organization-awareness, additive: this provider now also
// reads `useOrganizations().currentOrganization` (main.tsx already mounts
// OrganizationProvider as ProjectProvider's parent, so this is a normal
// context read, never a second organization-context mechanism). When a
// current organization exists, the bootstrap list is that organization's
// projects (`listProjects({organizationId})`) instead of the caller's own
// owner-scoped list. For every existing homeowner consumer
// (ProjectsListScreen, HouseRequirementsScreen, RenovateProjectCreatedScreen,
// HomeDashboardScreen, HomeownerProfileScreen) `currentOrganization` is
// always null — a homeowner never joins an organization — so this is a
// strict no-op for all of them; only the new company-side Projects List
// screen actually exercises the organization-scoped branch.
//
// 12G-D cross-user leak guard, applied here from the start (not bolted on
// after finding a bug, unlike 12G-D's own history): the bootstrap effect is
// keyed on the authenticated user's real id (`auth.user?.id`), not just
// `authStatus`, so a fresh login over a still-'authenticated' stale session
// for a *different* user correctly reloads — never keeps showing the
// previous user's real projects. See customerProfileState.tsx's identical
// comment for the full incident this pattern was proven against.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './authState'
import { useOrganizations } from './organizationState'
import {
  createProject,
  listProjects,
  updateProject,
  type Project,
  type ProjectInput,
} from './projectApi'

export type ProjectsStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface ProjectContextValue {
  status: ProjectsStatus
  /** Every project the authenticated user owns, most recently updated
   *  first — matches the real backend's own ordering (project.service.ts's
   *  listProjectsForUser), which itself matches the pre-existing frontend
   *  getAllProjects() convention. */
  projects: Project[]
  errorMessage: string | null
  /** Synchronous lookup against the already-loaded list — never a network
   *  call of its own. Returns undefined both while still loading and when
   *  genuinely not found/not owned; callers that need to distinguish those
   *  two honest states should also consult `status`, exactly like every
   *  other "Project not found" empty state already in this codebase. */
  getProject: (projectId: string) => Project | undefined
  createProject: (input: ProjectInput) => Promise<Project>
  updateProject: (projectId: string, patch: Partial<ProjectInput>) => Promise<Project>
  refreshProjects: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user: authUser } = useAuth()
  const authUserId = authUser?.id
  const organizations = useOrganizations()
  const currentOrganizationId = organizations.currentOrganization?.id
  const [status, setStatus] = useState<ProjectsStatus>('idle')
  const [projects, setProjects] = useState<Project[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // create()/update() must never race the initial GET — a screen calling
  // either while the bootstrap list fetch is still in flight awaits this
  // rather than working from a not-yet-loaded projects array.
  const loadPromiseRef = useRef<Promise<Project[]> | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setErrorMessage(null)
    const promise = listProjects(currentOrganizationId ? { organizationId: currentOrganizationId } : undefined)
    loadPromiseRef.current = promise
    try {
      const result = await promise
      setProjects(result)
      setStatus('loaded')
      return result
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load your projects right now.')
      throw err
    }
  }, [currentOrganizationId])

  useEffect(() => {
    if (authStatus === 'authenticated') {
      load().catch(() => {})
    } else if (authStatus === 'unauthenticated') {
      loadPromiseRef.current = null
      setProjects([])
      setErrorMessage(null)
      setStatus('idle')
    }
    // authStatus === 'loading': stay 'idle' until auth itself resolves.
    // currentOrganizationId in deps: once OrganizationProvider finishes
    // loading (it mounts as this provider's parent but resolves
    // asynchronously), the list reloads scoped to the now-known current
    // organization — see this file's header comment.
  }, [authStatus, authUserId, currentOrganizationId, load])

  const create = useCallback(async (input: ProjectInput): Promise<Project> => {
    if (status === 'loading' && loadPromiseRef.current) {
      await loadPromiseRef.current.catch(() => null)
    }
    // Module 03 — a caller that already knows which organization it means
    // (or explicitly means none) keeps that value; otherwise, when a
    // current organization exists, it's the natural default (this hook's
    // own list is already scoped to it). Never overrides an explicit
    // caller value — this is a default, not a forced injection.
    const resolvedInput = input.organizationId !== undefined
      ? input
      : currentOrganizationId
        ? { ...input, organizationId: currentOrganizationId }
        : input
    const result = await createProject(resolvedInput)
    setProjects(prev => [result, ...prev])
    setStatus('loaded')
    return result
  }, [status, currentOrganizationId])

  const update = useCallback(async (projectId: string, patch: Partial<ProjectInput>): Promise<Project> => {
    if (status === 'loading' && loadPromiseRef.current) {
      await loadPromiseRef.current.catch(() => null)
    }
    const result = await updateProject(projectId, patch)
    setProjects(prev => {
      // A real update also changes updatedAt, which moves it to the front
      // of the "most recently updated first" ordering the real backend
      // itself already returns on the next full load — re-sort here too so
      // ProjectsListScreen's ordering stays correct without waiting for a
      // refresh.
      const next = prev.map(p => (p.id === result.id ? result : p))
      return [...next].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    })
    setStatus('loaded')
    return result
  }, [status])

  const getProject = useCallback((projectId: string) => projects.find(p => p.id === projectId), [projects])

  const refresh = useCallback(async () => {
    await load()
  }, [load])

  const value = useMemo<ProjectContextValue>(
    () => ({ status, projects, errorMessage, getProject, createProject: create, updateProject: update, refreshProjects: refresh }),
    [status, projects, errorMessage, getProject, create, update, refresh],
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects must be used within a ProjectProvider')
  return ctx
}
