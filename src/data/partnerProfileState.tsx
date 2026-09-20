// ─── Partner Profile State (12G-C2) — real backend profile, partner-only ──
// Same Context/Provider/hook pattern as customerProfileState.tsx (12G-C1).
// Deliberately PartnerProfile-only — never merged with CustomerProfile or
// Organization state. The approved 12G-A/12G-B model lets one authenticated
// User hold both a CustomerProfile and a PartnerProfile at once, so this
// provider is mounted independently, alongside CustomerProfileProvider,
// never replacing or gating it.
//
// Bootstraps only once there is a real authenticated user (useAuth()) — no
// profile request is ever made while unauthenticated. Resets to 'idle' on
// logout, same as CustomerProfileProvider.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './authState'
import {
  createPartnerProfile,
  getPartnerProfile,
  updatePartnerProfile,
  type PartnerProfile,
  type PartnerProfileInput,
} from './partnerProfileApi'

export type PartnerProfileStatus = 'idle' | 'loading' | 'loaded' | 'not-found' | 'error'

interface PartnerProfileContextValue {
  status: PartnerProfileStatus
  profile: PartnerProfile | null
  errorMessage: string | null
  /** Create-or-update, decided automatically from the current resolved
   *  status — same convention as useCustomerProfile()'s save(). */
  save: (input: PartnerProfileInput) => Promise<PartnerProfile>
  refresh: () => Promise<void>
}

const PartnerProfileContext = createContext<PartnerProfileContextValue | null>(null)

export function PartnerProfileProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user: authUser } = useAuth()
  // 12G-D — see customerProfileState.tsx's identical comment: keying the
  // bootstrap effect on the user id too (not just authStatus) closes a
  // real cross-user profile leak when a new OTP login lands over a still-
  // 'authenticated' stale session for a different user.
  const authUserId = authUser?.id
  const [status, setStatus] = useState<PartnerProfileStatus>('idle')
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadPromiseRef = useRef<Promise<PartnerProfile | null> | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setErrorMessage(null)
    const promise = getPartnerProfile()
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
  }, [authStatus, authUserId, load])

  const save = useCallback(
    async (input: PartnerProfileInput): Promise<PartnerProfile> => {
      let alreadyExists = status === 'loaded'
      if (status === 'loading' && loadPromiseRef.current) {
        const resolved = await loadPromiseRef.current.catch(() => null)
        alreadyExists = Boolean(resolved)
      }
      const result = alreadyExists ? await updatePartnerProfile(input) : await createPartnerProfile(input)
      setProfile(result)
      setStatus('loaded')
      return result
    },
    [status],
  )

  const refresh = useCallback(async () => {
    await load()
  }, [load])

  const value = useMemo<PartnerProfileContextValue>(
    () => ({ status, profile, errorMessage, save, refresh }),
    [status, profile, errorMessage, save, refresh],
  )

  return <PartnerProfileContext.Provider value={value}>{children}</PartnerProfileContext.Provider>
}

export function usePartnerProfile(): PartnerProfileContextValue {
  const ctx = useContext(PartnerProfileContext)
  if (!ctx) throw new Error('usePartnerProfile must be used within a PartnerProfileProvider')
  return ctx
}
