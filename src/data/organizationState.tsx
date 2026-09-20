// ─── Organization State (12G-C3) — real backend organizations ─────────────
// Same Context/Provider/hook pattern as customerProfileState.tsx /
// partnerProfileState.tsx, with one structural difference: an organization
// is a LIST resource (12G-B's model allows multi-org membership), so this
// provider bootstraps the user's full membership list, not a single 0..1
// profile, and derives one "current organization" from it for every
// existing screen that only ever deals with one org at a time.
//
// "Current organization" rule (deliberate, documented placeholder — see
// organizationApi.ts's listOrganizations() comment): the backend's
// GET /organizations has no server-side ordering guarantee
// (organization.service.ts's listOrganizationsForUser() has no ORDER BY),
// so this provider sorts the returned list by createdAt descending and
// treats the first (most recently created) as "current." This is never a
// hardcoded organizations[0] trusting server order — it's an explicit,
// stated rule, chosen because the frontend has no organization-switching
// UI anywhere yet. If multi-org switching is ever built, replace this
// derivation with a real user selection, not a different implicit guess.
//
// Deliberately its own provider, never merged into CustomerProfileProvider
// or PartnerProfileProvider — Organization identity is a third, separate
// concept from both (see the 12G-A/12G-B architecture notes in
// organization.ts), even though a PartnerProfile in the "organization"
// accountType branch is closely related to one.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './authState'
import {
  createOrganization,
  listOrganizations,
  updateOrganization,
  type Organization,
  type OrganizationInput,
} from './organizationApi'

export type OrganizationsStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface OrganizationContextValue {
  status: OrganizationsStatus
  /** Every organization the authenticated user belongs to. */
  organizations: Organization[]
  /** The most recently created organization the user belongs to, or null
   *  if they belong to none yet. See the "Current organization" rule
   *  above. */
  currentOrganization: Organization | null
  errorMessage: string | null
  /** Always a real POST — callers (CreateOrganizationScreen) are
   *  responsible for calling update() instead when an existingOrganizationId
   *  is already known, exactly like today's local-fixture duplicate-
   *  protection case. */
  create: (input: OrganizationInput) => Promise<Organization>
  update: (organizationId: string, patch: Partial<OrganizationInput>) => Promise<Organization>
  refresh: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null)

function sortByCreatedAtDesc(orgs: Organization[]): Organization[] {
  return [...orgs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user: authUser } = useAuth()
  // 12G-D — see customerProfileState.tsx's identical comment: keying the
  // bootstrap effect on the user id too (not just authStatus) closes a
  // real cross-user leak when a new OTP login lands over a still-
  // 'authenticated' stale session for a different user.
  const authUserId = authUser?.id
  const [status, setStatus] = useState<OrganizationsStatus>('idle')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // create()/update() must never race the initial GET — a screen calling
  // either while the bootstrap list fetch is still in flight awaits this
  // rather than working from a not-yet-loaded organizations array.
  const loadPromiseRef = useRef<Promise<Organization[]> | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setErrorMessage(null)
    const promise = listOrganizations()
    loadPromiseRef.current = promise
    try {
      const result = await promise
      setOrganizations(result)
      setStatus('loaded')
      return result
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load your organizations right now.')
      throw err
    }
  }, [])

  useEffect(() => {
    if (authStatus === 'authenticated') {
      load().catch(() => {})
    } else if (authStatus === 'unauthenticated') {
      loadPromiseRef.current = null
      setOrganizations([])
      setErrorMessage(null)
      setStatus('idle')
    }
  }, [authStatus, authUserId, load])

  const create = useCallback(async (input: OrganizationInput): Promise<Organization> => {
    if (status === 'loading' && loadPromiseRef.current) {
      await loadPromiseRef.current.catch(() => null)
    }
    const result = await createOrganization(input)
    setOrganizations(prev => [...prev, result])
    setStatus('loaded')
    return result
  }, [status])

  const update = useCallback(async (organizationId: string, patch: Partial<OrganizationInput>): Promise<Organization> => {
    if (status === 'loading' && loadPromiseRef.current) {
      await loadPromiseRef.current.catch(() => null)
    }
    const result = await updateOrganization(organizationId, patch)
    setOrganizations(prev => prev.map(org => (org.id === result.id ? result : org)))
    setStatus('loaded')
    return result
  }, [status])

  const refresh = useCallback(async () => {
    await load()
  }, [load])

  const currentOrganization = useMemo(
    () => (organizations.length > 0 ? sortByCreatedAtDesc(organizations)[0] : null),
    [organizations],
  )

  const value = useMemo<OrganizationContextValue>(
    () => ({ status, organizations, currentOrganization, errorMessage, create, update, refresh }),
    [status, organizations, currentOrganization, errorMessage, create, update, refresh],
  )

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganizations(): OrganizationContextValue {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error('useOrganizations must be used within an OrganizationProvider')
  return ctx
}
