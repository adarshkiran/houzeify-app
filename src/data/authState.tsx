// ─── Auth State (12F) — real backend identity, never a stored credential ──
// Same Context pattern customerCart.tsx/subscriptionState.tsx already
// established (plain React Context, mounted once — see src/main.tsx —
// rather than a second state-management approach for one more value).
//
// CRITICAL BOUNDARY: the only persistent auth credential is the backend's
// HTTP-only `houzeify_session` cookie (server/auth/session.ts). This file
// never reads it, never stores a token/JWT of any kind in
// localStorage/sessionStorage/React state/the URL, and never fabricates an
// authenticated user. `user` here is the backend's real identity, cached
// in memory only for rendering — losing it (a refresh) just means
// re-asking GET /auth/me, which the HTTP-only cookie answers correctly on
// its own.
//
// This module answers "who is this?" only. It does not decide
// homeowner/partner role, and does not gate any existing route — see the
// 12F implementation report for what route-protection scope was
// deliberately left for a later phase.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, logout as apiLogout, requestOtp as apiRequestOtp, verifyOtp as apiVerifyOtp, type AuthenticatedUser } from './authApi'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  /** 'loading' only until the one bootstrap GET /auth/me call (see
   *  AuthProvider below) resolves — public screens (splash/welcome/login/
   *  otp/...) render regardless of this value; nothing in 12F blocks on it. */
  status: AuthStatus
  /** The real backend user once authenticated — id/phoneNumber/
   *  phoneVerifiedAt/createdAt only, never a session token. `null` while
   *  loading or unauthenticated. */
  user: AuthenticatedUser | null
  requestOtp: (phoneNumber: string) => Promise<void>
  verifyOtp: (phoneNumber: string, otp: string) => Promise<AuthenticatedUser>
  /** Best-effort: always clears local `user`/`status` even if the network
   *  call itself fails, since the existing Sign Out UI (three call sites —
   *  HomeownerProfileScreen, AccountSettingsScreen,
   *  ProfessionalDashboardScreen, all via App.tsx's navigateTo('welcome'))
   *  has no error-surfacing affordance to report a failed logout through,
   *  and the user's own intent to sign out locally should never get stuck
   *  behind a flaky request. */
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthenticatedUser | null>(null)

  // App startup bootstrap: check GET /auth/me once. A page refresh must
  // not log the user out while the backend session cookie is still valid —
  // this is the only source of truth, never a localStorage flag.
  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then(resolvedUser => {
        if (cancelled) return
        setUser(resolvedUser)
        setStatus(resolvedUser ? 'authenticated' : 'unauthenticated')
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setStatus('unauthenticated')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const requestOtp = useCallback((phoneNumber: string) => apiRequestOtp(phoneNumber), [])

  const verifyOtp = useCallback(async (phoneNumber: string, otp: string) => {
    const authenticatedUser = await apiVerifyOtp(phoneNumber, otp)
    setUser(authenticatedUser)
    setStatus('authenticated')
    return authenticatedUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, requestOtp, verifyOtp, logout }),
    [status, user, requestOtp, verifyOtp, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
