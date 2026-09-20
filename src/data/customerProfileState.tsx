// ─── Customer Profile State (12G-C1) — real backend profile, homeowner-only ─
// Same Context/Provider/hook pattern authState.tsx already established.
// Deliberately CustomerProfile-only — never merged with partner/organization
// state (12G-B's approved model keeps CustomerProfile and PartnerProfile as
// two independent 0..1 relationships on one User; mixing them into one
// generic "Profile" provider here would blur that on the frontend too).
//
// Bootstraps only once there is a real authenticated user (useAuth()) — no
// profile request is ever made while unauthenticated. When auth is lost
// (logout, session expiry), this resets to 'idle' rather than leaving a
// stale profile visible to whatever loads next in the same tab.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './authState'
import {
  createCustomerProfile,
  getCustomerProfile,
  updateCustomerProfile,
  type CustomerProfile,
  type CustomerProfileInput,
} from './customerProfileApi'

export type CustomerProfileStatus = 'idle' | 'loading' | 'loaded' | 'not-found' | 'error'

interface CustomerProfileContextValue {
  /** 'idle' while there is no authenticated user yet (or after logout);
   *  'loading' only for the initial GET; 'loaded' / 'not-found' are both
   *  fully-resolved, valid states (a brand-new homeowner is legitimately
   *  'not-found', not an error); 'error' is a real failure to reach the
   *  backend — never silently treated as an empty profile. */
  status: CustomerProfileStatus
  profile: CustomerProfile | null
  errorMessage: string | null
  /** Create-or-update, decided automatically from the current resolved
   *  status (POST when 'not-found', PATCH when 'loaded') — screens never
   *  need to know which one applies, so the same call is safe to make
   *  from both the first-time onboarding step and the ongoing edit
   *  screen without ever risking a duplicate-profile POST. */
  save: (input: CustomerProfileInput) => Promise<CustomerProfile>
  refresh: () => Promise<void>
}

const CustomerProfileContext = createContext<CustomerProfileContextValue | null>(null)

export function CustomerProfileProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user: authUser } = useAuth()
  // 12G-D — the authenticated USER's id, not just the auth status string.
  // Real bug found live: a stale session cookie's bootstrap GET /auth/me
  // can resolve authStatus to 'authenticated' for User A, and a *later*
  // OTP login as a different User B (without ever passing through
  // 'unauthenticated' in between — e.g. logging in over a still-valid
  // session) keeps authStatus at the same 'authenticated' string the whole
  // time. An effect keyed only on authStatus never re-fires, so this
  // provider kept showing User A's real profile under User B's real
  // session. Keying the bootstrap effect on the user id too closes that
  // cross-user leak without needing an explicit logout in between.
  const authUserId = authUser?.id
  const [status, setStatus] = useState<CustomerProfileStatus>('idle')
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // save() must never race the initial GET — if a screen calls save()
  // while the bootstrap fetch is still in flight, it awaits this instead
  // of guessing create-vs-update from a not-yet-resolved status.
  const loadPromiseRef = useRef<Promise<CustomerProfile | null> | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setErrorMessage(null)
    const promise = getCustomerProfile()
    loadPromiseRef.current = promise
    try {
      const result = await promise
      setProfile(result)
      setStatus(result ? 'loaded' : 'not-found')
      return result
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load your profile right now.')
      throw err
    }
  }, [])

  useEffect(() => {
    if (authStatus === 'authenticated') {
      load().catch(() => {})
    } else if (authStatus === 'unauthenticated') {
      loadPromiseRef.current = null
      setProfile(null)
      setErrorMessage(null)
      setStatus('idle')
    }
    // authStatus === 'loading': stay 'idle' until auth itself resolves.
  }, [authStatus, authUserId, load])

  const save = useCallback(
    async (input: CustomerProfileInput): Promise<CustomerProfile> => {
      // Resolve any in-flight bootstrap first so create-vs-update is
      // decided from a real, known state — never guessed. Critically, use
      // the AWAITED result itself to decide, not the `status` closure
      // variable — that would still read the stale 'loading' value right
      // after the await, since closures don't update mid-execution.
      let alreadyExists = status === 'loaded'
      if (status === 'loading' && loadPromiseRef.current) {
        const resolved = await loadPromiseRef.current.catch(() => null)
        alreadyExists = Boolean(resolved)
      }
      const result = alreadyExists ? await updateCustomerProfile(input) : await createCustomerProfile(input)
      setProfile(result)
      setStatus('loaded')
      return result
    },
    [status],
  )

  const refresh = useCallback(async () => {
    await load()
  }, [load])

  const value = useMemo<CustomerProfileContextValue>(
    () => ({ status, profile, errorMessage, save, refresh }),
    [status, profile, errorMessage, save, refresh],
  )

  return <CustomerProfileContext.Provider value={value}>{children}</CustomerProfileContext.Provider>
}

export function useCustomerProfile(): CustomerProfileContextValue {
  const ctx = useContext(CustomerProfileContext)
  if (!ctx) throw new Error('useCustomerProfile must be used within a CustomerProfileProvider')
  return ctx
}
