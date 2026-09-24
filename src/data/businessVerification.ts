// ─── Business Verification — typed data model + service ────────────────────
// UI demonstration data only — there is no real verification backend yet.
// This module is the seam submitBusinessVerification()/getVerificationStatus()
// get replaced by a real provider; the screen must only ever read/write
// verification data through the functions here, never inline in a
// component.
//
// SECURITY NOTE: registration numbers must never be displayed in full once
// entered into a summary/preview surface — only maskRegistrationNumber()'s
// output may be rendered outside the live input field itself. Document
// storageUrl is likewise never rendered in the UI.

export type RegistrationType = 'gstin' | 'cin' | 'business-registration' | 'other'
export type VerificationStatus = 'not-started' | 'pending' | 'verified' | 'rejected' | 'needs-information'

export interface BusinessVerification {
  id: string
  organizationId: string
  registrationType: RegistrationType
  registrationNumber: string
  documentId: string | null
  ownerId: string
  status: VerificationStatus
  submittedAt: string | null
  reviewedAt: string | null
  reviewerNote: string | null
  createdAt: string
  updatedAt: string
}

export type VerificationDocumentStatus = 'uploaded' | 'processing' | 'accepted' | 'rejected'

export interface VerificationDocument {
  id: string
  verificationId: string
  fileName: string
  fileType: string
  fileSize: number
  storageUrl: string
  uploadedAt: string
  status: VerificationDocumentStatus
}

export const REGISTRATION_TYPE_OPTIONS: RegistrationType[] = ['gstin', 'cin', 'business-registration', 'other']

export const REGISTRATION_TYPE_LABELS: Record<RegistrationType, string> = {
  gstin: 'GSTIN',
  cin: 'CIN',
  'business-registration': 'Business Registration',
  other: 'Other registration',
}

export const REGISTRATION_TYPE_PLACEHOLDERS: Record<RegistrationType, string> = {
  gstin: 'e.g. 29AAAAA0000A1Z5',
  cin: 'e.g. U45201TG2015PTC098765',
  'business-registration': 'Enter registration number',
  other: 'Enter registration number',
}

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  'not-started': 'Not verified',
  pending: 'Verification pending',
  verified: 'Verified',
  rejected: 'Verification rejected',
  'needs-information': 'Needs more information',
}

// ─── Per-area verification status (Partner UX Architecture) ────────────────
// Moved here from BusinessVerificationScreen.tsx (was screen-local) so a
// future Partner Dashboard status widget can reuse it instead of redefining
// its own copy. This is a SEPARATE, finer-grained status than
// VerificationStatus above — VerificationStatus is the one org-level
// verification record's status; this is the status of each of an
// INDIVIDUAL professional's four independent verification areas (Identity,
// Professional Credentials, Business, Experience — not every area applies
// to every profession, hence 'not-applicable'). Never fabricated: 'verified'
// is never reached anywhere in this codebase since no real backend exists
// yet to confirm it.
export type ProfessionalVerificationAreaStatus =
  | 'not-submitted'
  | 'under-review'
  | 'verified'
  | 'needs-attention'
  | 'not-applicable'

export const VERIFICATION_AREA_STATUS_LABELS: Record<ProfessionalVerificationAreaStatus, string> = {
  'not-submitted': 'Not started',
  'under-review': 'Under review',
  verified: 'Verified',
  'needs-attention': 'Needs attention',
  'not-applicable': 'Not applicable',
}

export const VERIFICATION_AREA_STATUS_COLORS: Record<ProfessionalVerificationAreaStatus, { bg: string; fg: string; dot: string }> = {
  'not-submitted': { bg: '#CAC7C6', fg: '#808080', dot: '#A1A1A1' },
  'under-review': { bg: '#FEF3C7', fg: '#D97706', dot: '#D97706' },
  verified: { bg: '#DCFCE7', fg: '#16A34A', dot: '#16A34A' },
  'needs-attention': { bg: '#FEE2E2', fg: 'var(--hz-danger)', dot: 'var(--hz-danger)' },
  'not-applicable': { bg: '#e9e9e9', fg: '#999999', dot: '#999999' },
}

// ─── Account access status (Partner UX Architecture — item 26) ─────────────
// Deliberately separate from VerificationStatus above: verification asks
// "has this Partner's identity/business/credentials been confirmed?";
// account status asks "can this Partner sign in and use Houzeify at all?"
// A verified Partner can still be suspended, and a not-yet-verified Partner
// is still 'active' (just with limited access, enforced by whatever reads
// VerificationStatus). Nothing in this codebase currently sets or reads
// this — it exists as documented, backend-ready scaffolding for the day a
// real backend needs to suspend an account independently of verification.
export type PartnerAccountStatus = 'active' | 'suspended'

// ─── Registration number masking ──────────────────────────────────────────
// Keeps the first 2 and last 4 characters visible (matching the app's
// "29XXXXXXXXXX1234" example), masks everything else. Never render a full
// registration number outside the live editable input.

export function maskRegistrationNumber(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length <= 6) return trimmed.length === 0 ? '' : 'X'.repeat(trimmed.length)
  const head = trimmed.slice(0, 2)
  const tail = trimmed.slice(-4)
  const maskedLength = trimmed.length - head.length - tail.length
  return `${head}${'X'.repeat(maskedLength)}${tail}`
}

// ─── Validation ──────────────────────────────────────────────────────────

export interface VerificationFormValues {
  registrationType: RegistrationType | null
  registrationNumber: string
  hasDocument: boolean
}

export function isVerificationFormValid(values: VerificationFormValues): boolean {
  return values.registrationType !== null
    && values.registrationNumber.trim().length >= 4
    && values.hasDocument
}

// ─── Document upload ─────────────────────────────────────────────────────

const MAX_DOCUMENT_SIZE_MB = 10
const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export interface DocumentValidationResult {
  valid: boolean
  error?: string
}

/** The document validation service — the screen checks a chosen file only
 *  through this function, never inline. */
export function validateVerificationDocumentFile(file: File): DocumentValidationResult {
  if (!SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a PDF, JPG or PNG file.' }
  }
  if (file.size > MAX_DOCUMENT_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Document must be smaller than ${MAX_DOCUMENT_SIZE_MB} MB.` }
  }
  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Verification service ─────────────────────────────────────────────────

export interface SubmitVerificationInput {
  organizationId: string
  registrationType: RegistrationType
  registrationNumber: string
  document: { fileName: string; fileType: string; fileSize: number }
  ownerId: string
}

export interface SubmitVerificationResult {
  verificationId: string
  status: VerificationStatus
}

export interface VerificationStatusResult {
  status: VerificationStatus
  reviewerNote: string | null
  needsInformation: boolean
}

let verificationCounter = 0
let documentCounter = 0
function nextVerificationId(): string {
  verificationCounter += 1
  return `verification-${Date.now()}-${verificationCounter}`
}
function nextDocumentId(): string {
  documentCounter += 1
  return `verification-doc-${Date.now()}-${documentCounter}`
}

// In-memory demo store — the seam a real backend replaces. Keyed by
// organizationId so getVerificationStatus() can look submissions back up.
const verificationStore = new Map<string, BusinessVerification>()

/** The verification submission service — screens must never assemble a
 *  BusinessVerification record inline; this is the sole seam a real
 *  verification backend call replaces. Never persists the document's bytes
 *  here — only its metadata, behind a document record the UI never
 *  exposes a URL for. */
export function submitBusinessVerification(data: SubmitVerificationInput): SubmitVerificationResult {
  const now = new Date().toISOString()
  const verificationId = nextVerificationId()
  const documentId = nextDocumentId()

  // Document metadata is tracked as its own record (never inline on the
  // verification, and its storageUrl is never surfaced to the UI).
  const document: VerificationDocument = {
    id: documentId,
    verificationId,
    fileName: data.document.fileName,
    fileType: data.document.fileType,
    fileSize: data.document.fileSize,
    storageUrl: `internal://verification-documents/${documentId}`,
    uploadedAt: now,
    status: 'uploaded',
  }
  void document // stored conceptually; not persisted further in this MVP

  const verification: BusinessVerification = {
    id: verificationId,
    organizationId: data.organizationId,
    registrationType: data.registrationType,
    registrationNumber: data.registrationNumber.trim(),
    documentId,
    ownerId: data.ownerId,
    status: 'pending',
    submittedAt: now,
    reviewedAt: null,
    reviewerNote: null,
    createdAt: now,
    updatedAt: now,
  }
  verificationStore.set(data.organizationId, verification)

  return { verificationId, status: verification.status }
}

/** The verification status lookup service — screens must only ever read
 *  status through this function. */
export function getVerificationStatus(organizationId: string): VerificationStatusResult {
  const record = verificationStore.get(organizationId)
  if (!record) {
    return { status: 'not-started', reviewerNote: null, needsInformation: false }
  }
  return { status: record.status, reviewerNote: record.reviewerNote, needsInformation: record.status === 'needs-information' }
}
