// ─── Customer profile API layer (12G-C1) — typed calls against 12G-B ──────
// Mirrors authApi.ts's shape exactly. The backend contract (read directly
// from server/profiles/customerProfile.routes.ts and profile.types.ts, not
// assumed) is: GET/POST/PATCH /api/v1/customer-profile, all requiring the
// session cookie, ownership always from request.user.id — this layer never
// sends a userId of its own.

import { ApiError, apiGet, apiPatch, apiPost } from './apiClient'

/** Mirrors server/profiles/profile.types.ts's serializeCustomerProfile()
 *  output exactly. */
export interface CustomerProfile {
  id: string
  userId: string
  fullName: string
  preferredName: string | null
  email: string | null
  location: string | null
  language: string | null
  unitPreference: string | null
  currencyPreference: string | null
  createdAt: string
  updatedAt: string
}

export interface CustomerProfileInput {
  fullName: string
  preferredName?: string
  email?: string
  location?: string
  language?: string
  unitPreference?: string
  currencyPreference?: string
}

interface CustomerProfileEnvelope {
  data: { customerProfile: CustomerProfile }
}

/** Resolves `null` for the ordinary "no profile yet" case (404) — not a
 *  thrown error, since that's an expected, valid state for a brand-new
 *  homeowner. Any other failure (network, 401, 5xx) still throws. */
export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  try {
    const res = await apiGet<CustomerProfileEnvelope>('/api/v1/customer-profile')
    return res.data.customerProfile
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function createCustomerProfile(input: CustomerProfileInput): Promise<CustomerProfile> {
  const res = await apiPost<CustomerProfileEnvelope>('/api/v1/customer-profile', input)
  return res.data.customerProfile
}

export async function updateCustomerProfile(patch: Partial<CustomerProfileInput>): Promise<CustomerProfile> {
  const res = await apiPatch<CustomerProfileEnvelope>('/api/v1/customer-profile', patch)
  return res.data.customerProfile
}

/** Maps a caught error to a short, user-safe message — same convention as
 *  authApi.ts's describeAuthError(). Backend messages for these codes are
 *  already written to be shown directly. */
export function describeCustomerProfileError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'

  switch (err.code) {
    case 'INVALID_EMAIL':
    case 'CUSTOMER_PROFILE_EXISTS':
    case 'EMPTY_PATCH':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
