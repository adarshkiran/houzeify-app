// ─── Identity Verification — typed data model + service ─────────────────────
// UI demonstration data only — there is no real KYC/verification backend
// yet. This module is the seam a real ID-verification provider (and its
// review workflow) replaces; the screen must only ever read/write this
// data through the functions here, never inline in a component. Same
// conventions as businessVerification.ts: metadata-only documents (no
// public URL ever exposed to the UI), masked ID display, and every status
// this file can produce is honest — 'verified' is only ever reached via
// the clearly-marked dev-only simulateApproval() below, never as a side
// effect of submitting.
//
// Reuses businessVerification.ts's own VerificationStatus rather than a
// second, competing status enum — this is a different VERIFICATION AREA
// (identity vs business), not a different state machine.

import type { VerificationStatus, VerificationStatusResult } from './businessVerification'

export type GovernmentIdType = 'aadhaar' | 'pan' | 'passport' | 'driving-license' | 'voter-id' | 'other'

export const GOVERNMENT_ID_TYPE_OPTIONS: GovernmentIdType[] = ['aadhaar', 'pan', 'passport', 'driving-license', 'voter-id', 'other']

export const GOVERNMENT_ID_TYPE_LABELS: Record<GovernmentIdType, string> = {
  aadhaar: 'Aadhaar',
  pan: 'PAN Card',
  passport: 'Passport',
  'driving-license': 'Driving Licence',
  'voter-id': 'Voter ID',
  other: 'Other government ID',
}

export const GOVERNMENT_ID_TYPE_PLACEHOLDERS: Record<GovernmentIdType, string> = {
  aadhaar: 'e.g. 1234 5678 9012',
  pan: 'e.g. ABCDE1234F',
  passport: 'e.g. A1234567',
  'driving-license': 'Enter licence number',
  'voter-id': 'Enter voter ID number',
  other: 'Enter ID number',
}

/** Card-style IDs (front + back both carry real information) need a
 *  back-side capture; a booklet-style Passport or a PAN's single printed
 *  face don't. */
export const ID_TYPES_REQUIRING_BACK: GovernmentIdType[] = ['aadhaar', 'driving-license', 'voter-id']

// A single government ID reaches the "everyone has one" bar, but a
// determined bad actor can source one fake ID relatively easily — two
// INDEPENDENT, DIFFERENT-TYPE government IDs (e.g. Aadhaar + PAN) raises
// that bar meaningfully and is the standard stronger-KYC pattern. Both are
// required; there is no "primary/optional secondary" here.
export interface IdentityVerification {
  id: string
  userId: string
  idType: GovernmentIdType
  idNumber: string
  frontDocumentId: string
  backDocumentId: string | null
  /** The second, independent proof — must be a different GovernmentIdType
   *  from `idType` (see isIdentityFormValid). Never optional. */
  secondaryIdType: GovernmentIdType
  secondaryIdNumber: string
  secondaryFrontDocumentId: string
  secondaryBackDocumentId: string | null
  selfieDocumentId: string | null
  status: VerificationStatus
  submittedAt: string | null
  reviewedAt: string | null
  reviewerNote: string | null
  createdAt: string
  updatedAt: string
}

// ─── ID number masking ──────────────────────────────────────────────────
// Keeps only the last 4 characters visible (e.g. "XXXX XXXX 9012" for a
// 12-digit Aadhaar) — never render a full ID number anywhere outside the
// live editable input itself.

export function maskGovernmentId(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length <= 4) return trimmed.length === 0 ? '' : 'X'.repeat(trimmed.length)
  const tail = trimmed.slice(-4)
  return `${'X'.repeat(trimmed.length - 4)}${tail}`
}

export interface IdentityFormValues {
  idType: GovernmentIdType | null
  idNumber: string
  hasFrontDocument: boolean
  hasBackDocument: boolean
  secondaryIdType: GovernmentIdType | null
  secondaryIdNumber: string
  hasSecondaryFrontDocument: boolean
  hasSecondaryBackDocument: boolean
}

function isSingleIdComplete(idType: GovernmentIdType | null, idNumber: string, hasFront: boolean, hasBack: boolean): boolean {
  if (!idType || idNumber.trim().length < 4 || !hasFront) return false
  if (ID_TYPES_REQUIRING_BACK.includes(idType) && !hasBack) return false
  return true
}

/** Both government IDs are required, and they must be two DIFFERENT
 *  GovernmentIdTypes — two copies of the same document isn't a second,
 *  independent proof. */
export function isIdentityFormValid(values: IdentityFormValues): boolean {
  if (!isSingleIdComplete(values.idType, values.idNumber, values.hasFrontDocument, values.hasBackDocument)) return false
  if (!isSingleIdComplete(values.secondaryIdType, values.secondaryIdNumber, values.hasSecondaryFrontDocument, values.hasSecondaryBackDocument)) return false
  if (values.idType === values.secondaryIdType) return false
  return true
}

let idCounter = 0
function nextIdentityId(): string {
  idCounter += 1
  return `identity-verification-${Date.now()}-${idCounter}`
}
let idDocCounter = 0
function nextIdentityDocumentId(): string {
  idDocCounter += 1
  return `identity-document-${Date.now()}-${idDocCounter}`
}

// In-memory demo store — one identity verification per userId, mirrors
// businessVerification.ts's own per-organizationId store.
const identityStore = new Map<string, IdentityVerification>()

export interface SubmitIdentityVerificationInput {
  userId: string
  idType: GovernmentIdType
  idNumber: string
  frontDocument: { fileName: string; fileType: string; fileSize: number }
  backDocument: { fileName: string; fileType: string; fileSize: number } | null
  secondaryIdType: GovernmentIdType
  secondaryIdNumber: string
  secondaryFrontDocument: { fileName: string; fileType: string; fileSize: number }
  secondaryBackDocument: { fileName: string; fileType: string; fileSize: number } | null
  selfieDocument: { fileName: string; fileType: string; fileSize: number } | null
}

export interface SubmitIdentityVerificationResult {
  verificationId: string
  status: VerificationStatus
}

/** The identity submission service — screens must never assemble an
 *  IdentityVerification record inline. Always starts 'pending' (renders
 *  as "under review" in the UI) — never fabricates 'verified'. */
export function submitIdentityVerification(data: SubmitIdentityVerificationInput): SubmitIdentityVerificationResult {
  const now = new Date().toISOString()
  const verificationId = nextIdentityId()
  const record: IdentityVerification = {
    id: verificationId,
    userId: data.userId,
    idType: data.idType,
    idNumber: data.idNumber.trim(),
    frontDocumentId: nextIdentityDocumentId(),
    backDocumentId: data.backDocument ? nextIdentityDocumentId() : null,
    secondaryIdType: data.secondaryIdType,
    secondaryIdNumber: data.secondaryIdNumber.trim(),
    secondaryFrontDocumentId: nextIdentityDocumentId(),
    secondaryBackDocumentId: data.secondaryBackDocument ? nextIdentityDocumentId() : null,
    selfieDocumentId: data.selfieDocument ? nextIdentityDocumentId() : null,
    status: 'pending',
    submittedAt: now,
    reviewedAt: null,
    reviewerNote: null,
    createdAt: now,
    updatedAt: now,
  }
  identityStore.set(data.userId, record)
  return { verificationId, status: record.status }
}

export function getIdentityVerificationStatus(userId: string): VerificationStatusResult {
  const record = identityStore.get(userId)
  if (!record) return { status: 'not-started', reviewerNote: null, needsInformation: false }
  return { status: record.status, reviewerNote: record.reviewerNote, needsInformation: record.status === 'needs-information' }
}

// ─── Access gating ("limited access until verified") ────────────────────────
// The frontend gate a Partner's own Dashboard reads to decide what to
// show. Never the authoritative security mechanism — a real backend must
// enforce this independently once one exists (see submitIdentityVerification's
// own header note: nothing here ever fabricates 'verified' on its own).

export type PartnerAccessLevel = 'full' | 'limited'

export function resolvePartnerAccessLevel(identityStatus: VerificationStatus): PartnerAccessLevel {
  return identityStatus === 'verified' ? 'full' : 'limited'
}

// ─── DEV-ONLY simulate approval ──────────────────────────────────────────
// There is no backend to ever actually approve a submission in this demo
// — without this, the 'limited access' gate above would be a one-way dead
// end nobody could ever see the far side of. This exists purely so the
// gated experience stays demoable; it is never presented as a real
// approval action (see ProfessionalDashboardScreen's own "DEV" badge on
// the button that calls it) and must be deleted once a real
// backend/reviewer workflow exists.
export function devSimulateIdentityApproval(userId: string): IdentityVerification {
  const now = new Date().toISOString()
  const existing = identityStore.get(userId)
  // Bootstraps a record if the Partner never actually submitted identity
  // documents — the demo affordance must work regardless of whether
  // submission happened, since gating shows up on the Dashboard whether
  // or not the Partner has gotten to Business Verification yet.
  const record: IdentityVerification = existing ?? {
    id: nextIdentityId(),
    userId,
    idType: 'other',
    idNumber: '',
    frontDocumentId: '',
    backDocumentId: null,
    secondaryIdType: 'other',
    secondaryIdNumber: '',
    secondaryFrontDocumentId: '',
    secondaryBackDocumentId: null,
    selfieDocumentId: null,
    status: 'pending',
    submittedAt: now,
    reviewedAt: null,
    createdAt: now,
    updatedAt: now,
    reviewerNote: null,
  }
  record.status = 'verified'
  record.reviewedAt = now
  record.updatedAt = now
  identityStore.set(userId, record)
  return record
}
