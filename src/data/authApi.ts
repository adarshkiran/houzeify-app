// ─── Auth API layer (12F) — typed calls against the real 12E backend ──────
// Every screen goes through these functions instead of scattering raw
// fetch() calls — the exact shapes here match server/auth/auth.routes.ts
// and server/auth/auth.types.ts's serializeUser() as actually implemented
// (read, not assumed) at integration time.

import { ApiError, apiGet, apiPost } from './apiClient'

/** Mirrors server/auth/auth.types.ts's serializeUser() output exactly —
 *  the only fields GET /auth/me and POST /auth/otp/verify ever return.
 *  Never a session token, never internal fields. */
export interface AuthenticatedUser {
  id: string
  phoneNumber: string
  phoneVerifiedAt: string | null
  createdAt: string
}

interface UserEnvelope {
  data: { user: AuthenticatedUser }
}

interface StatusEnvelope {
  data: { status: string }
}

/** POST /api/v1/auth/otp/request — never returns the OTP or reveals
 *  whether the phone belongs to an existing user (by design, see 12E). */
export async function requestOtp(phoneNumber: string): Promise<void> {
  await apiPost<StatusEnvelope>('/api/v1/auth/otp/request', { phoneNumber })
}

/** POST /api/v1/auth/otp/verify — on success the backend has already set
 *  the HTTP-only session cookie; this only returns the identity for the UI
 *  to render. */
export async function verifyOtp(phoneNumber: string, otp: string): Promise<AuthenticatedUser> {
  const res = await apiPost<UserEnvelope>('/api/v1/auth/otp/verify', { phoneNumber, otp })
  return res.data.user
}

/** GET /api/v1/auth/me — resolves `null` (not a thrown error) for the
 *  ordinary "no active session" case (401), which is exactly what a
 *  logged-out visitor's first load looks like. Any other failure
 *  (network, 5xx) still throws, so a real outage isn't silently treated
 *  as "logged out". */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const res = await apiGet<UserEnvelope>('/api/v1/auth/me')
    return res.data.user
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err
  }
}

/** POST /api/v1/auth/logout — the backend clears the cookie and is
 *  idempotent even with no valid session; this never throws on that
 *  "already logged out" case since the backend itself always answers 200. */
export async function logout(): Promise<void> {
  await apiPost<StatusEnvelope>('/api/v1/auth/logout')
}

/** Maps a caught error to a short, user-safe message — never a raw
 *  server/database/provider detail. Backend messages for the codes below
 *  are already written to be shown directly (see server/auth/*); anything
 *  else (an AJV validation message, an unmapped code, a network failure)
 *  gets a generic fallback instead of leaking internal wording. */
export function describeAuthError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'

  switch (err.code) {
    case 'INVALID_PHONE':
    case 'OTP_INVALID':
    case 'OTP_COOLDOWN':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
