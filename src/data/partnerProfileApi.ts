// ─── Partner profile API layer (12G-C2) — typed calls against 12G-B ───────
// Mirrors customerProfileApi.ts's shape exactly (see 12G-C1). Backend
// contract read directly from server/profiles/partnerProfile.routes.ts and
// profile.types.ts — GET/POST/PATCH /api/v1/partner-profile, all requiring
// the session cookie, ownership always from request.user.id.

import { ApiError, apiGet, apiPatch, apiPost } from './apiClient'

/** Mirrors server/profiles/profile.types.ts's serializePartnerProfile()
 *  output exactly. */
export interface PartnerProfile {
  id: string
  userId: string
  professionalType: string
  professionalTypeOther: string | null
  specialization: string | null
  fullName: string
  displayName: string | null
  about: string | null
  contactEmail: string | null
  contactPhone: string | null
  yearsOfExperience: string | null
  languages: string[] | null
  accountType: string
  createdAt: string
  updatedAt: string
}

export interface PartnerProfileInput {
  professionalType: string
  professionalTypeOther?: string
  specialization?: string
  fullName: string
  displayName?: string
  about?: string
  contactEmail?: string
  contactPhone?: string
  yearsOfExperience?: string
  languages?: string[]
  accountType: string
}

interface PartnerProfileEnvelope {
  data: { partnerProfile: PartnerProfile }
}

/** Resolves `null` for the ordinary "no profile yet" case (404) — a valid
 *  state for a brand-new professional, not an error. */
export async function getPartnerProfile(): Promise<PartnerProfile | null> {
  try {
    const res = await apiGet<PartnerProfileEnvelope>('/api/v1/partner-profile')
    return res.data.partnerProfile
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function createPartnerProfile(input: PartnerProfileInput): Promise<PartnerProfile> {
  const res = await apiPost<PartnerProfileEnvelope>('/api/v1/partner-profile', input)
  return res.data.partnerProfile
}

export async function updatePartnerProfile(patch: Partial<PartnerProfileInput>): Promise<PartnerProfile> {
  const res = await apiPatch<PartnerProfileEnvelope>('/api/v1/partner-profile', patch)
  return res.data.partnerProfile
}

/** Same convention as authApi.ts's describeAuthError() /
 *  customerProfileApi.ts's describeCustomerProfileError(). */
export function describePartnerProfileError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'

  switch (err.code) {
    case 'INVALID_EMAIL':
    case 'PARTNER_PROFILE_EXISTS':
    case 'EMPTY_PATCH':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
