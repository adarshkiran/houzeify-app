// ─── Organization Setup Status — typed data model ───────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "organization setup status" API replaces.
//
// IMPORTANT — reaching this screen means onboarding is COMPLETE, but that
// never implies business verification is approved. Verification is a
// separate, independent status that this module must never overwrite to
// 'verified' on its own — only ever read forward from whatever the
// verification screen actually produced (or 'not-started' if skipped).

export type SetupStatus = 'draft' | 'complete'
export type VerificationStatus = 'not-started' | 'pending' | 'verified' | 'rejected' | 'needs-information'

export interface OrganizationSetupStatus {
  organizationId: string
  /** Only true when the professional flow (Screen 018-020) was actually
   *  taken — the legacy homeowner-organization path never collects a
   *  professional profile, so this must never be assumed true for it. */
  professionalProfileComplete: boolean
  companyInformationComplete: boolean
  servicesComplete: boolean
  serviceLocationsComplete: boolean
  portfolioComplete: boolean
  teamSetupComplete: boolean
  verificationStatus: VerificationStatus
  setupStatus: SetupStatus
  completedAt: string
}

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  'not-started': 'Not verified',
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
  'needs-information': 'Needs information',
}

/** Assembles the organization's setup status on reaching the completion
 *  screen — every onboarding step is complete simply by virtue of having
 *  reached here (whether a step was filled in or deliberately skipped),
 *  but verificationStatus is only ever carried forward from whatever the
 *  business-verification screen actually produced, never invented as
 *  'verified' here. */
export function buildOrganizationSetupStatus(organizationId: string, verificationStatus: VerificationStatus, hasProfessionalProfile: boolean): OrganizationSetupStatus {
  return {
    organizationId,
    professionalProfileComplete: hasProfessionalProfile,
    companyInformationComplete: true,
    servicesComplete: true,
    serviceLocationsComplete: true,
    portfolioComplete: true,
    teamSetupComplete: true,
    verificationStatus,
    setupStatus: 'complete',
    completedAt: new Date().toISOString(),
  }
}

export function parseVerificationStatus(value: string | undefined): VerificationStatus {
  const known: VerificationStatus[] = ['not-started', 'pending', 'verified', 'rejected', 'needs-information']
  return known.includes(value as VerificationStatus) ? (value as VerificationStatus) : 'not-started'
}

/** Parses a comma-joined list (as produced by earlier onboarding screens'
 *  navigation payloads) into a count — never invents a number when the
 *  field is missing or empty. */
export function parseListCount(value: string | undefined): number {
  if (!value || value.trim().length === 0) return 0
  return value.split(',').map(s => s.trim()).filter(Boolean).length
}

export function parseIntSafe(value: string | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}
