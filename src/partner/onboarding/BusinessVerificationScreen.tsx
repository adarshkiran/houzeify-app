import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { COMPANY_TYPE_LABELS, type CompanyType } from '@/data/companyInformation'
import { PROFESSIONAL_TYPE_CONTENT, PROFESSIONAL_CREDENTIAL_GUIDANCE, type ProfessionalType } from '@/data/professionalType'
import {
  REGISTRATION_TYPE_OPTIONS,
  REGISTRATION_TYPE_LABELS,
  REGISTRATION_TYPE_PLACEHOLDERS,
  VERIFICATION_STATUS_LABELS,
  maskRegistrationNumber,
  isVerificationFormValid,
  validateVerificationDocumentFile,
  formatFileSize,
  submitBusinessVerification,
  getVerificationStatus,
  VERIFICATION_AREA_STATUS_LABELS,
  VERIFICATION_AREA_STATUS_COLORS,
  type RegistrationType,
  type VerificationStatus,
  type ProfessionalVerificationAreaStatus,
} from '@/data/businessVerification'
import {
  GOVERNMENT_ID_TYPE_OPTIONS,
  GOVERNMENT_ID_TYPE_LABELS,
  GOVERNMENT_ID_TYPE_PLACEHOLDERS,
  ID_TYPES_REQUIRING_BACK,
  maskGovernmentId,
  isIdentityFormValid,
  submitIdentityVerification,
  getIdentityVerificationStatus,
  type GovernmentIdType,
} from '@/data/identityVerification'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const OWNER_ID = 'user-demo-001'
const DEFAULT_COMPANY_NAME = 'Mantoor Developers'
const DEFAULT_COMPANY_TYPE: CompanyType = 'developer'
const DEFAULT_LOCATION = 'Hyderabad, Telangana'
const DEFAULT_PHONE = '+91 98765 43210'
const DEFAULT_EMAIL = 'contact@mantoordevelopers.com'


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const FeatureCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="var(--hz-primary-soft)" /><path d="M4 7L6 9L10 4.5" stroke="var(--hz-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V2.5M5 5.5L8 2.5L11 5.5" /><path d="M2.5 10.5V13a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2.5" /></svg>
)
const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 3L11 11M11 3L3 11" /></svg>
)
const DocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h9l5 5v15H6Z" /><path d="M15 2v5h5" /></svg>
)
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6Z" /><path d="M9 12l2 2l4-4" /></svg>
)
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><line x1="8" y1="7.2" x2="8" y2="11.2" /><circle cx="8" cy="4.8" r="0.2" fill="currentColor" /></svg>
)
const CircleDotIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="6" r="5" /></svg>
)
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.3" /><path d="M5 7V4.5a3 3 0 0 1 6 0V7" /></svg>
)
const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2.5L18 17H2L10 2.5z"/><line x1="10" y1="8" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.7" fill="currentColor" stroke="none"/></svg>
)
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 5.5V10l3 2"/></svg>
)

// ─── Icons — individual verification cards (Identity / Credentials /
// Business / Experience) ──────────────────────────────────────────────────
const IdentityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="2.6"/><path d="M3.5 15c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>
)
const CredentialIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4c0 0 2 0.4 2.4 2.4C13.8 8.4 12.2 10 10 10.4L6.5 14L3 10.4L6.5 6.8C6.5 6.8 8 4 11 4Z"/></svg>
)
const BusinessAreaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="12" height="9" rx="1"/><path d="M6 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
)
const ExperienceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="3" width="13" height="12" rx="1.5"/><line x1="5.5" y1="7" x2="12.5" y2="7"/><line x1="5.5" y1="10" x2="10.5" y2="10"/></svg>
)

// ─── Shared bits ────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{children}</label>
      {optional && <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
    </div>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p id={id} role="alert" className="text-[12px] mt-1.5 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{message}</p>
}

function RegistrationTypeChip({ type, selected, onSelect }: { type: RegistrationType; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
        borderColor: selected ? 'var(--hz-primary)' : 'var(--hz-border-strong)',
        color: selected ? 'var(--hz-primary)' : 'var(--hz-black)',
      }}
    >
      {selected && (
        <span className="w-[14px] h-[14px] rounded-full bg-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true">
          <CheckIcon size={8} />
        </span>
      )}
      {REGISTRATION_TYPE_LABELS[type]}
    </button>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[var(--hz-ink)] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

function SkipVerificationModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-verification-title"
        aria-describedby="skip-verification-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="skip-verification-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Skip business verification?</h2>
        <p id="skip-verification-desc" className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          You can complete verification later from your organization settings.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>
            Go back
          </button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>
            Continue without verification
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Verification checklist — only real, actually-tracked items; never a
// fabricated 4-item progress list for steps that aren't wired to anything ──

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[13px]" style={{ fontFamily: FONT_BODY }}>
      {done ? (
        <span className="w-4 h-4 rounded-full bg-[var(--hz-success)] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>
      ) : (
        <span className="w-4 h-4 rounded-full border border-[var(--hz-border)] shrink-0" aria-hidden="true" />
      )}
      <span style={{ color: done ? 'var(--hz-black)' : '#808080' }}>{label}</span>
    </div>
  )
}

function ChecklistCard({ isIndividual, hasDocument }: { isIndividual: boolean; hasDocument: boolean }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
      <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Verification checklist</span>
      <ChecklistRow label={isIndividual ? 'Profile information' : 'Company information'} done />
      <ChecklistRow label={isIndividual ? 'Identity document' : 'Business document'} done={hasDocument} />
    </div>
  )
}

function PrivacyNote() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
      <span className="text-[var(--hz-ink-muted)] mt-0.5 shrink-0"><LockIcon /></span>
      <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
        Your verification documents are used to verify your professional account and are not displayed publicly on your profile.
      </p>
    </div>
  )
}

// ─── Individual professional verification — four independent, honest areas.
// No area implies a universal mandatory licence; status is never fabricated
// — "verified" only ever means a real backend confirmed it, which doesn't
// exist yet, so no area here ever reaches that status. Status type/labels/
// colors now live in businessVerification.ts (ProfessionalVerificationAreaStatus)
// so a future Partner Dashboard widget can reuse them instead of redefining. ──

function AreaStatusPill({ status }: { status: ProfessionalVerificationAreaStatus }) {
  const c = VERIFICATION_AREA_STATUS_COLORS[status]
  return (
    <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11.5px] font-semibold shrink-0" style={{ fontFamily: FONT_BODY, backgroundColor: c.bg, color: c.fg }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
      {VERIFICATION_AREA_STATUS_LABELS[status]}
    </span>
  )
}

function VerificationAreaCard({ icon, title, description, status, children }: {
  icon: React.ReactNode; title: string; description: string; status: ProfessionalVerificationAreaStatus; children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 text-[var(--hz-primary)]" style={{ backgroundColor: 'var(--hz-primary-soft)' }}>{icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[14.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{title}</span>
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{description}</span>
          </div>
        </div>
        <AreaStatusPill status={status} />
      </div>
      {children}
    </div>
  )
}

// ─── One government-ID capture block — reused twice inside the Identity
// card (Part 2's "two independent IDs" requirement) so the chips/number
// field/front-back upload markup exists only once. `excludeIdType` disables
// the ID type already used by the OTHER block, so the two proofs are always
// genuinely different documents. `idPrefix` keeps each block's file-input
// DOM ids unique.
function GovernmentIdBlock({
  idPrefix, label, idType, idNumber, onIdTypeChange, onIdNumberChange,
  frontDocument, backDocument, onDocumentChange, excludeIdType,
}: {
  idPrefix: string
  label: string
  idType: GovernmentIdType | null
  idNumber: string
  onIdTypeChange: (t: GovernmentIdType) => void
  onIdNumberChange: (value: string) => void
  frontDocument: { fileName: string; fileType: string; fileSize: number } | null
  backDocument: { fileName: string; fileType: string; fileSize: number } | null
  onDocumentChange: (slot: 'front' | 'back', file: File | undefined) => void
  excludeIdType: GovernmentIdType | null
}) {
  const requiresBack = idType ? ID_TYPES_REQUIRING_BACK.includes(idType) : false
  const frontInputId = `${idPrefix}-front-input`
  const backInputId = `${idPrefix}-back-input`
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>{label}</span>
      <div role="radiogroup" aria-label={`${label} type`} className="flex flex-wrap gap-2">
        {GOVERNMENT_ID_TYPE_OPTIONS.map(t => {
          const disabled = t === excludeIdType
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={idType === t}
              disabled={disabled}
              title={disabled ? 'Already used for your other ID — choose a different type' : undefined}
              onClick={() => onIdTypeChange(t)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold transition-all border disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: FONT_BODY,
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: idType === t ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
                borderColor: idType === t ? 'var(--hz-primary)' : 'var(--hz-border-strong)',
                color: idType === t ? 'var(--hz-primary)' : 'var(--hz-black)',
              }}
            >
              {idType === t && (
                <span className="w-[14px] h-[14px] rounded-full bg-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>
              )}
              {GOVERNMENT_ID_TYPE_LABELS[t]}
            </button>
          )
        })}
      </div>
      <input
        type="text"
        value={idNumber}
        onChange={e => onIdNumberChange(e.target.value)}
        placeholder={idType ? GOVERNMENT_ID_TYPE_PLACEHOLDERS[idType] : 'Enter ID number'}
        className="w-full h-[44px] px-3.5 rounded-[10px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] outline-none focus:border-[var(--hz-primary)] transition-colors"
        style={{ fontFamily: FONT_BODY }}
      />
      {idNumber.trim().length > 0 && (
        <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Will be stored as {maskGovernmentId(idNumber)}</p>
      )}

      {/* Front */}
      {!frontDocument ? (
        <label htmlFor={frontInputId} className="flex items-center gap-2.5 h-[48px] px-4 rounded-[12px] border border-dashed border-[var(--hz-border)] cursor-pointer transition-colors" style={{ fontFamily: FONT_BODY }}>
          <span className="text-[var(--hz-primary)]"><UploadIcon /></span>
          <span className="text-[13px] font-semibold text-[var(--hz-primary)]">Upload ID — front</span>
          <span className="text-[11px] text-[var(--hz-ink-subtle)] ml-auto">PDF, JPG or PNG · up to 10 MB</span>
        </label>
      ) : (
        <div className="flex items-center gap-3 h-[56px] px-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)]">
          <span className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><DocIcon /></span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{frontDocument.fileName}</span>
            <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(frontDocument.fileSize)} · Front</span>
          </div>
        </div>
      )}
      <input id={frontInputId} type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" onChange={e => onDocumentChange('front', e.target.files?.[0])} />

      {/* Back — only for card-style IDs */}
      {requiresBack && (
        !backDocument ? (
          <label htmlFor={backInputId} className="flex items-center gap-2.5 h-[48px] px-4 rounded-[12px] border border-dashed border-[var(--hz-border)] cursor-pointer transition-colors" style={{ fontFamily: FONT_BODY }}>
            <span className="text-[var(--hz-primary)]"><UploadIcon /></span>
            <span className="text-[13px] font-semibold text-[var(--hz-primary)]">Upload ID — back</span>
            <span className="text-[11px] text-[var(--hz-ink-subtle)] ml-auto">PDF, JPG or PNG · up to 10 MB</span>
          </label>
        ) : (
          <div className="flex items-center gap-3 h-[56px] px-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)]">
            <span className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><DocIcon /></span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{backDocument.fileName}</span>
              <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(backDocument.fileSize)} · Back</span>
            </div>
          </div>
        )
      )}
      {requiresBack && <input id={backInputId} type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" onChange={e => onDocumentChange('back', e.target.files?.[0])} />}
    </div>
  )
}

function HozieAssist({ onAskHozie }: { onAskHozie: () => void }) {
  return (
    <div className="w-full flex items-center gap-3 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[14px] px-4 py-3 flex-wrap" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="shrink-0"><HIcon size={24} /></div>
      <span className="text-[12.5px] text-[var(--hz-ink)] flex-1 min-w-[200px]" style={{ fontFamily: FONT_BODY }}>Not sure what document is required?</span>
      <button
        onClick={onAskHozie}
        className="h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[12px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
        style={{ fontFamily: FONT_BODY }}
      >
        Ask Hozie →
      </button>
    </div>
  )
}

// ─── Post-submission states — verification already has a real status for
// this organizationId (getVerificationStatus), so the form never re-renders
// and duplicate submission is impossible. ─────────────────────────────────

function StatusScaffold({ icon, iconBg, iconColor, eyebrow, title, body, children }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; eyebrow: string; title: string; body: string; children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 rounded-[20px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-8 sm:p-10 mx-auto" style={{ maxWidth: 520, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>{icon}</span>
      <span className="text-[11px] tracking-[0.10em] uppercase" style={{ fontFamily: FONT_MONO, color: iconColor }}>{eyebrow}</span>
      <h2 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{title}</h2>
      <p className="text-[13.5px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{body}</p>
      {children}
    </div>
  )
}

type SubmitStage = 'idle' | 'submitting'

// ─── Main screen ──────────────────────────────────────────────────────────

export default function BusinessVerificationScreen({
  organizationId = 'org-demo-001',
  companyName,
  companyOwnerName,
  companyType,
  location,
  phone,
  email,
  accountType,
  professionalType,
  professionalTypeOther,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  companyOwnerName?: string
  companyType?: string
  location?: string
  phone?: string
  email?: string
  /** 'individual' | 'organization' — adapts the verification checklist per
   *  Screen 019's answer. Absent (homeowner path) behaves like 'organization'. */
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessionalContext = Boolean(professionalType)
  const isIndividual = accountType === 'individual'
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title ?? 'Not set'

  const resolvedCompanyName = companyName || DEFAULT_COMPANY_NAME
  // 12G-D — never the ORGANIZATION_OWNER_NAME fixture person; a neutral
  // label when the real primary-contact name isn't known yet.
  const resolvedOwnerName = companyOwnerName || 'Organization Owner'
  const resolvedCompanyType = (companyType as CompanyType) || DEFAULT_COMPANY_TYPE
  const resolvedLocation = location || DEFAULT_LOCATION
  const resolvedPhone = phone || DEFAULT_PHONE
  const resolvedEmail = email || DEFAULT_EMAIL

  const [loadingStatus, setLoadingStatus] = useState(true)
  const [existingStatus, setExistingStatus] = useState<VerificationStatus>('not-started')
  const [existingNote, setExistingNote] = useState<string | null>(null)

  const [registrationType, setRegistrationType] = useState<RegistrationType | null>(null)
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [document_, setDocument] = useState<{ fileName: string; fileType: string; fileSize: number } | null>(null)
  const [documentError, setDocumentError] = useState<string | undefined>(undefined)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [stage, setStage] = useState<SubmitStage>('idle')
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Individual-only verification card state — kept entirely separate
  // from the organization form's state above so the existing organization
  // branch is byte-for-byte unaffected. Nothing here ever blocks Continue;
  // "under-review" only appears once something real was actually submitted
  // — never fabricated, never defaults to "verified". ────────────────────
  // ─── Real Identity verification state — Partner UX Architecture. Same
  // "expand in place, never blocks Continue" pattern as Credential/Business
  // below; a real duplicate-submission check reads getIdentityVerificationStatus
  // the same way the organization form above reads getVerificationStatus. ──
  const [existingIdentityStatus, setExistingIdentityStatus] = useState<VerificationStatus>('not-started')
  const [showIdentityForm, setShowIdentityForm] = useState(false)
  const [idType, setIdType] = useState<GovernmentIdType | null>(null)
  const [idNumber, setIdNumber] = useState('')
  const [idFrontDocument, setIdFrontDocument] = useState<{ fileName: string; fileType: string; fileSize: number } | null>(null)
  const [idBackDocument, setIdBackDocument] = useState<{ fileName: string; fileType: string; fileSize: number } | null>(null)
  // Two INDEPENDENT, different-type government IDs are required — one alone
  // is too easy to fake; a second, different document raises the bar. Same
  // shape as the first ID, just a second copy of each piece of state.
  const [secondaryIdType, setSecondaryIdType] = useState<GovernmentIdType | null>(null)
  const [secondaryIdNumber, setSecondaryIdNumber] = useState('')
  const [secondaryIdFrontDocument, setSecondaryIdFrontDocument] = useState<{ fileName: string; fileType: string; fileSize: number } | null>(null)
  const [secondaryIdBackDocument, setSecondaryIdBackDocument] = useState<{ fileName: string; fileType: string; fileSize: number } | null>(null)
  const [idSelfieDocument, setIdSelfieDocument] = useState<{ fileName: string; fileType: string; fileSize: number } | null>(null)
  const idRequiresBack = idType ? ID_TYPES_REQUIRING_BACK.includes(idType) : false
  const secondaryIdRequiresBack = secondaryIdType ? ID_TYPES_REQUIRING_BACK.includes(secondaryIdType) : false
  const canSubmitIdentity = isIdentityFormValid({
    idType, idNumber, hasFrontDocument: idFrontDocument !== null,
    hasBackDocument: idBackDocument !== null,
    secondaryIdType, secondaryIdNumber, hasSecondaryFrontDocument: secondaryIdFrontDocument !== null,
    hasSecondaryBackDocument: secondaryIdBackDocument !== null,
  })

  useEffect(() => {
    setExistingIdentityStatus(getIdentityVerificationStatus(OWNER_ID).status)
  }, [])

  function handleIdentityDocumentChange(slot: 'front' | 'back' | 'secondary-front' | 'secondary-back' | 'selfie', file: File | undefined) {
    if (!file) return
    const result = validateVerificationDocumentFile(file)
    if (!result.valid) { setNotice(result.error ?? 'Could not use this file.'); return }
    const doc = { fileName: file.name, fileType: file.type, fileSize: file.size }
    if (slot === 'front') setIdFrontDocument(doc)
    else if (slot === 'back') setIdBackDocument(doc)
    else if (slot === 'secondary-front') setSecondaryIdFrontDocument(doc)
    else if (slot === 'secondary-back') setSecondaryIdBackDocument(doc)
    else setIdSelfieDocument(doc)
  }

  function handleSubmitIdentity() {
    if (!canSubmitIdentity || !idType || !idFrontDocument || !secondaryIdType || !secondaryIdFrontDocument) return
    const { status } = submitIdentityVerification({
      userId: OWNER_ID,
      idType,
      idNumber,
      frontDocument: idFrontDocument,
      backDocument: idRequiresBack ? idBackDocument : null,
      secondaryIdType,
      secondaryIdNumber,
      secondaryFrontDocument: secondaryIdFrontDocument,
      secondaryBackDocument: secondaryIdRequiresBack ? secondaryIdBackDocument : null,
      selfieDocument: idSelfieDocument,
    })
    setExistingIdentityStatus(status)
    setShowIdentityForm(false)
  }

  const [showCredentialUpload, setShowCredentialUpload] = useState(false)
  const [credentialDocument, setCredentialDocument] = useState<{ fileName: string; fileType: string; fileSize: number } | null>(null)
  const [credentialSubmitted, setCredentialSubmitted] = useState(false)
  const [showBusinessDetails, setShowBusinessDetails] = useState(false)
  const [businessRegistrationType, setBusinessRegistrationType] = useState<RegistrationType | null>(null)
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('')
  const [businessDocument, setBusinessDocument] = useState<{ fileName: string; fileType: string; fileSize: number } | null>(null)
  const [businessSubmitted, setBusinessSubmitted] = useState(false)

  const formValues = { registrationType, registrationNumber, hasDocument: document_ !== null }
  const canSubmit = isVerificationFormValid(formValues)
  const showRegError = (attemptedSubmit || touched.registrationNumber) && registrationNumber.trim().length > 0 && registrationNumber.trim().length < 4
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const carryContext = (extra?: Record<string, string>) => ({
    ...(professionalType ? { professional_type: professionalType } : {}),
    ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
    ...(accountType ? { account_type: accountType } : {}),
    ...extra,
  })

  // Real duplicate-submission protection: read the SAME store
  // submitBusinessVerification() writes to, keyed by this organizationId —
  // never re-render the submission form if one already exists. 11G — this
  // is a synchronous in-memory lookup (same as the identity-status read
  // just above), so it resolves immediately rather than behind an
  // artificial delay.
  useEffect(() => {
    const result = getVerificationStatus(organizationId)
    setExistingStatus(result.status)
    setExistingNote(result.reviewerNote)
    setLoadingStatus(false)
  }, [organizationId])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 2600)
    return () => clearTimeout(t)
  }, [notice])

  function handleDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = validateVerificationDocumentFile(file)
    if (!result.valid) {
      setDocumentError(result.error)
      return
    }
    setDocumentError(undefined)
    setDocument({ fileName: file.name, fileType: file.type, fileSize: file.size })
  }

  function removeDocument() {
    setDocument(null)
    setDocumentError(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleEditCompany() {
    onNavigate('company-information', carryContext({ organization_id: organizationId }))
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', carryContext({ onboarding_context: 'business-verification', organization_id: organizationId }))
  }

  function handleSubmit() {
    setAttemptedSubmit(true)
    if (!canSubmit || stage === 'submitting' || !document_) return
    setStage('submitting')
    const { verificationId, status } = submitBusinessVerification({
      organizationId,
      registrationType: registrationType as RegistrationType,
      registrationNumber,
      document: document_,
      ownerId: OWNER_ID,
    })
    setTimeout(() => {
      onNavigate('service-categories', carryContext({
        organization_id: organizationId,
        verification_id: verificationId,
        verification_status: status,
        company_name: resolvedCompanyName,
      }))
    }, 900)
  }

  function handleSkipConfirmed() {
    onNavigate('service-categories', carryContext({
      organization_id: organizationId,
      company_name: resolvedCompanyName,
      verification_status: 'not-started',
    }))
  }

  // Individual professionals: verification is never a blocking gate — none
  // of the four areas are required, so Continue always proceeds. Only
  // real, actually-submitted business details (via submitBusinessVerification,
  // the same existing service the organization branch uses) move
  // verification_status off 'not-started'; an unsubmitted credential
  // upload never fabricates a status.
  function handleIndividualContinue() {
    onNavigate('service-categories', carryContext({
      organization_id: organizationId,
      company_name: resolvedCompanyName,
      verification_status: businessSubmitted ? 'pending' : 'not-started',
    }))
  }

  function handleContinueVerified() {
    onNavigate('service-categories', carryContext({
      organization_id: organizationId,
      company_name: resolvedCompanyName,
      verification_status: existingStatus,
    }))
  }

  /** Lets a rejected/needs-information submission be replaced — clears the
   *  stored status locally back to the form. The store itself keeps no
   *  history beyond "one verification per organization," matching the
   *  existing submitBusinessVerification() contract (never a second
   *  verification record for the same org). */
  function handleResubmit() {
    setExistingStatus('not-started')
    setExistingNote(null)
  }

  const maskedRegistration = maskRegistrationNumber(registrationNumber)

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          {!isProfessionalContext && (
            <span className="text-[12px] tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Step 3 of 4</span>
          )}
        </div>
        {!isProfessionalContext && (
          <div className="h-[2px] bg-[var(--hz-surface-muted)] w-full">
            <div className="h-full bg-[var(--hz-primary)] transition-all duration-500" style={{ width: '75%' }} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 pb-28 lg:pb-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 1000 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>{isIndividual ? 'Verification' : 'Business Verification'}</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              {isIndividual ? 'Build trust with homeowners' : 'Verify your business'}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              {isIndividual
                ? "We'll verify the credentials and documents that apply to your work. Requirements may vary by profession and project type."
                : 'Verification helps homeowners know they are working with a legitimate professional or organization.'}
            </p>
            <span className="flex items-center gap-2 h-8 px-3 rounded-full bg-[var(--hz-surface)] border border-[var(--hz-border)] text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
              {resolvedCompanyName}
              <span className="flex items-center gap-1 text-[11.5px] font-medium" style={{ color: 'var(--hz-success)' }}>
                <span className="w-3.5 h-3.5 rounded-full bg-[var(--hz-success)] flex items-center justify-center" aria-hidden="true"><CheckIcon size={7} /></span>
                Profile information added
              </span>
            </span>
          </div>

          {loadingStatus ? (
            <div className="flex flex-col gap-4" style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-[16px] bg-[var(--hz-surface-muted)]" style={{ height: 72, animation: 'hozieStatusPulse 1.6s ease-in-out infinite' }} />
              ))}
            </div>
          ) : existingStatus === 'pending' ? (
            <StatusScaffold
              icon={<ClockIcon />} iconBg="#FEF3C7" iconColor="#D97706"
              eyebrow="Under Review" title="Verification submitted"
              body="Our team is reviewing your information. You can continue setting up the rest of your profile in the meantime."
            >
              <button onClick={handleContinueVerified} className="h-11 px-5 rounded-[12px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0" style={{ fontFamily: FONT_BODY }}>
                Continue →
              </button>
            </StatusScaffold>
          ) : existingStatus === 'verified' ? (
            <StatusScaffold
              icon={<CheckIcon size={26} />} iconBg="#DCFCE7" iconColor="var(--hz-success)"
              eyebrow="Verified" title="Business verified"
              body="Your business verification is complete."
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{resolvedCompanyName}</span>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--hz-success)', fontFamily: FONT_BODY }}>Verified</span>
              </div>
              <button onClick={handleContinueVerified} className="h-11 px-5 rounded-[12px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0" style={{ fontFamily: FONT_BODY }}>
                Continue →
              </button>
            </StatusScaffold>
          ) : existingStatus === 'needs-information' ? (
            <StatusScaffold
              icon={<AlertIcon />} iconBg="#FEF3C7" iconColor="#D97706"
              eyebrow="Needs More Information" title="More information is required"
              body={existingNote || 'Houzeify needs one more detail before this can move forward.'}
            >
              <button onClick={handleResubmit} className="h-11 px-5 rounded-[12px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0" style={{ fontFamily: FONT_BODY }}>
                Replace Document
              </button>
            </StatusScaffold>
          ) : existingStatus === 'rejected' ? (
            <StatusScaffold
              icon={<AlertIcon />} iconBg="#FEE2E2" iconColor="var(--hz-danger)"
              eyebrow="Rejected" title="Verification could not be completed"
              body={existingNote || 'Houzeify was unable to approve this submission. Your organization has not been affected — you can review and resubmit.'}
            >
              <button onClick={handleResubmit} className="h-11 px-5 rounded-[12px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0" style={{ fontFamily: FONT_BODY }}>
                Resubmit Verification
              </button>
            </StatusScaffold>
          ) : !isIndividual ? (
          <>
          {/* Two-column: form + summary — organization branch, unchanged */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* Form */}
            <div className="flex flex-col gap-5 order-1">

              {/* Why verify */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Why verify your business?</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 list-none m-0 p-0">
                  {[
                    'Build homeowner trust',
                    'Improve profile credibility',
                    'Access more relevant opportunities',
                  ].map(line => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0"><FeatureCheckIcon /></span>
                      <span className="text-[13px] text-[var(--hz-ink)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Professional-context summary chips — never re-ask */}
              {isProfessionalContext && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 rounded-[14px] px-4 py-3" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Professional Type</span>
                      <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-[14px] px-4 py-3" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Operating As</span>
                      <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{isIndividual ? 'Individual Professional' : 'Organization / Company'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Company details review */}
              <div className="flex flex-col gap-1 rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{isIndividual ? 'Your Details' : 'Business Information'}</span>
                  {!isIndividual && (
                    <button type="button" onClick={handleEditCompany} className="text-[12px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline" style={{ fontFamily: FONT_BODY }}>
                      Edit company information
                    </button>
                  )}
                </div>
                <div className="flex flex-col divide-y divide-[var(--hz-border-strong)]">
                  <DetailRow label={isIndividual ? 'Name' : 'Company / Organization Name'} value={resolvedCompanyName} />
                  {!isIndividual && <DetailRow label="Primary Contact" value={resolvedOwnerName} />}
                  {!isIndividual && <DetailRow label="Company type" value={COMPANY_TYPE_LABELS[resolvedCompanyType]} />}
                  <DetailRow label="Location" value={resolvedLocation} />
                  <DetailRow label="Phone" value={resolvedPhone} />
                  <DetailRow label="Email" value={resolvedEmail} />
                </div>
              </div>

              {/* Verification details */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Verification Details</span>

                <div>
                  <FieldLabel>Registration / Business ID</FieldLabel>
                  <div role="radiogroup" aria-label="Registration type" className="flex flex-wrap gap-2 mb-3">
                    {REGISTRATION_TYPE_OPTIONS.map(t => (
                      <RegistrationTypeChip key={t} type={t} selected={registrationType === t} onSelect={() => { setRegistrationType(t); markTouched('registrationType') }} />
                    ))}
                  </div>
                  <input
                    id="registration-number"
                    type="text"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    onBlur={() => markTouched('registrationNumber')}
                    placeholder={registrationType ? REGISTRATION_TYPE_PLACEHOLDERS[registrationType] : 'Enter registration number'}
                    aria-invalid={showRegError}
                    aria-describedby="registration-number-helper"
                    className={['w-full h-[48px] px-4 rounded-[12px] border bg-[var(--hz-surface)] text-[14px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] outline-none transition-colors', showRegError ? 'border-[#D97706]' : 'border-[var(--hz-border)] focus:border-[var(--hz-primary)]'].join(' ')}
                    style={{ fontFamily: FONT_BODY }}
                  />
                  {showRegError ? <FieldError id="registration-number-helper" message="Please enter a valid registration number." /> : (
                    <p id="registration-number-helper" className="text-[11px] text-[var(--hz-ink-subtle)] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>
                      CIN / GSTIN / Business Registration Number — not every organization has a CIN, so pick whichever applies to you.
                    </p>
                  )}
                </div>
              </div>

              {/* Document upload */}
              <div>
                <FieldLabel>Verification document</FieldLabel>
                {!document_ ? (
                  <>
                    <label
                      htmlFor="verification-document-input"
                      className="flex items-center gap-2.5 h-[52px] px-4 rounded-[12px] border border-dashed cursor-pointer transition-colors"
                      style={{ borderColor: attemptedSubmit && !document_ ? '#D97706' : 'var(--hz-border-strong)', fontFamily: FONT_BODY }}
                    >
                      <span className="text-[var(--hz-primary)]"><UploadIcon /></span>
                      <span className="text-[13.5px] font-semibold text-[var(--hz-primary)]">Upload document</span>
                      <span className="text-[11.5px] text-[var(--hz-ink-subtle)] ml-auto">PDF, JPG or PNG · up to 10 MB</span>
                    </label>
                    <input ref={fileInputRef} id="verification-document-input" type="file" accept="application/pdf,image/jpeg,image/png" onChange={handleDocumentChange} className="sr-only" />
                    {attemptedSubmit && !document_ && <FieldError id="verification-document-error" message="Please upload a supporting business document." />}
                    {documentError && <FieldError id="verification-document-file-error" message={documentError} />}
                  </>
                ) : (
                  <div className="flex items-center gap-3 h-[64px] px-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)]">
                    <span className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><DocIcon /></span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{document_.fileName}</span>
                      <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(document_.fileSize)}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[12px] font-semibold shrink-0" style={{ color: 'var(--hz-success)', fontFamily: FONT_BODY }}>
                      <span className="w-4 h-4 rounded-full bg-[var(--hz-success)] flex items-center justify-center" aria-hidden="true"><CheckIcon size={8} /></span>
                      Uploaded
                    </span>
                    <button type="button" onClick={removeDocument} aria-label="Remove document" className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-subtle)] hover:text-[var(--hz-ink-muted)] cursor-pointer shrink-0">
                      <CloseIcon />
                    </button>
                  </div>
                )}
              </div>

              {/* Owner / identity verification */}
              <div className="flex flex-col gap-3 rounded-[14px] p-4" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>{isIndividual ? 'Identity Information' : 'Owner Information'}</span>
                <div className="flex items-center justify-between flex-wrap gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-full bg-[var(--hz-surface)] flex items-center justify-center shrink-0 text-[12px] font-semibold text-[var(--hz-primary)] border border-[var(--hz-border)]" style={{ fontFamily: FONT_HEAD }}>
                      {resolvedOwnerName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{resolvedOwnerName}</span>
                      <span className="flex items-center gap-1 text-[11.5px]" style={{ color: 'var(--hz-success)', fontFamily: FONT_BODY }}>
                        <span className="w-3.5 h-3.5 rounded-full bg-[var(--hz-success)] flex items-center justify-center" aria-hidden="true"><CheckIcon size={7} /></span>
                        Account owner
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotice('Owner identity verification isn’t available yet.')}
                    className="h-8 px-3 rounded-full text-[12px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Verify identity
                  </button>
                </div>
                <p className="text-[11.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
                  {isIndividual ? 'Identity verification may be required for certain profile features.' : 'Owner verification may be required for certain organization features.'}
                </p>
              </div>

              <ChecklistCard isIndividual={isIndividual} hasDocument={document_ !== null} />

              <PrivacyNote />

              {/* Verification level */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Verification level</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-3.5">
                    <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Basic</span>
                    <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Business information submitted.</span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-3.5">
                    <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Verified</span>
                    <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Business information reviewed by Houzeify.</span>
                  </div>
                </div>
              </div>

              {/* Important notice */}
              <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px] border" style={{ borderColor: 'var(--hz-primary-soft)', backgroundColor: 'var(--hz-primary-wash)' }}>
                <span className="text-[var(--hz-primary)] mt-0.5 shrink-0"><InfoIcon /></span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>Verification review</span>
                  <p className="text-[12.5px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                    Submitting your information does not guarantee verification. Houzeify may review the submitted information before approving the organization.
                  </p>
                </div>
              </div>

              <HozieAssist onAskHozie={handleAskHozie} />

              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={stage === 'submitting'}
                  aria-label="Submit for verification"
                  className={[
                    'h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 px-6',
                    'flex items-center justify-center gap-2',
                    canSubmit ? 'bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-subtle)] cursor-pointer',
                  ].join(' ')}
                  style={{ fontFamily: FONT_BODY }}
                >
                  {stage === 'submitting' ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                        <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Submitting verification…
                    </>
                  ) : 'Submit for verification →'}
                </button>
                <button
                  onClick={() => setShowSkipModal(true)}
                  disabled={stage === 'submitting'}
                  className="h-[52px] text-[13.5px] font-medium rounded-[12px] px-5 cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors disabled:opacity-60"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Skip for now
                </button>
              </div>
            </div>

            {/* Verification summary */}
            <div className="order-2 lg:sticky lg:top-6">
              <div className="rounded-[18px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{isIndividual ? 'Verification Summary' : 'Company Verification Summary'}</span>

                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0 text-[14px] font-semibold text-[var(--hz-primary)]" style={{ backgroundColor: 'var(--hz-primary-soft)' }}>
                    <ShieldIcon />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_HEAD }}>{resolvedCompanyName}</span>
                    <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{isIndividual ? professionalTypeLabel : COMPANY_TYPE_LABELS[resolvedCompanyType]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11.5px] font-semibold"
                    style={{ fontFamily: FONT_BODY, backgroundColor: stage === 'submitting' ? '#FEF3C7' : '#e9e9e9', color: stage === 'submitting' ? '#D97706' : '#999999' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage === 'submitting' ? '#D97706' : '#999999' }} />
                    {stage === 'submitting' ? 'Submitting…' : 'Not verified'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--hz-border)]">
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                    <CircleDotIcon />
                    <span>Verification not started</span>
                  </div>
                  <DetailRow label={isIndividual ? 'Contact' : 'Owner'} value={resolvedOwnerName} />
                  <DetailRow label="Location" value={resolvedLocation} />
                </div>

                {registrationType && (
                  <div className="flex flex-col gap-1 pt-3 border-t border-[var(--hz-border)]">
                    <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{REGISTRATION_TYPE_LABELS[registrationType]}</span>
                    <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_MONO }}>{maskedRegistration || '—'}</span>
                  </div>
                )}

                {document_ && (
                  <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--hz-success)', fontFamily: FONT_BODY }}>
                    <span className="w-3.5 h-3.5 rounded-full bg-[var(--hz-success)] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={7} /></span>
                    Document uploaded
                  </div>
                )}

                <div className="flex flex-col gap-0.5 pt-3 border-t border-[var(--hz-border)]">
                  <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Verification level</span>
                  <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>Basic (not yet submitted)</span>
                </div>
              </div>
            </div>
          </div>
          </>
          ) : (
          <>
          {/* Individual professional — four independent, adaptive
              verification areas. Nothing here blocks Continue; nothing is
              ever labeled "Licensed" or "Verified" unless a real backend
              actually confirmed it (none exists yet, so those statuses are
              simply never reached). */}
          <div className="flex flex-col gap-5" style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>

            <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 text-center max-w-[560px]" style={{ fontFamily: FONT_BODY, alignSelf: 'center' }}>
              Verification helps homeowners choose trustworthy professionals and helps keep the Houzeify community safe.
            </p>

            {/* A. Identity — real ID capture (Partner UX Architecture). Same
                "expand in place" pattern as Credential/Business below; never
                blocks Continue, never shows 'verified' on its own. */}
            <VerificationAreaCard
              icon={<IdentityIcon />}
              title="Identity"
              description="Confirm you're a real person."
              status={
                existingIdentityStatus === 'verified' ? 'verified'
                : existingIdentityStatus === 'pending' ? 'under-review'
                : existingIdentityStatus === 'rejected' || existingIdentityStatus === 'needs-information' ? 'needs-attention'
                : 'not-submitted'
              }
            >
              {existingIdentityStatus === 'pending' || existingIdentityStatus === 'verified' ? (
                <p className="text-[12px] m-0" style={{ color: existingIdentityStatus === 'verified' ? 'var(--hz-success)' : '#D97706', fontFamily: FONT_BODY }}>
                  {existingIdentityStatus === 'verified' ? 'Your identity has been verified.' : 'Submitted — Houzeify will review your identity documents.'}
                </p>
              ) : !showIdentityForm ? (
                <button
                  type="button"
                  onClick={() => setShowIdentityForm(true)}
                  className="self-start h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Verify identity
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-[11.5px] text-[var(--hz-ink-muted)] m-0 -mt-1" style={{ fontFamily: FONT_BODY }}>
                    Two different government IDs are required, so we can independently confirm you're a real person.
                  </p>

                  <GovernmentIdBlock
                    idPrefix="id"
                    label="ID #1"
                    idType={idType}
                    idNumber={idNumber}
                    onIdTypeChange={setIdType}
                    onIdNumberChange={setIdNumber}
                    frontDocument={idFrontDocument}
                    backDocument={idBackDocument}
                    onDocumentChange={(slot, file) => handleIdentityDocumentChange(slot, file)}
                    excludeIdType={secondaryIdType}
                  />

                  <div className="border-t border-[var(--hz-border)]" />

                  <GovernmentIdBlock
                    idPrefix="id2"
                    label="ID #2"
                    idType={secondaryIdType}
                    idNumber={secondaryIdNumber}
                    onIdTypeChange={setSecondaryIdType}
                    onIdNumberChange={setSecondaryIdNumber}
                    frontDocument={secondaryIdFrontDocument}
                    backDocument={secondaryIdBackDocument}
                    onDocumentChange={(slot, file) => handleIdentityDocumentChange(slot === 'front' ? 'secondary-front' : 'secondary-back', file)}
                    excludeIdType={idType}
                  />

                  <div className="border-t border-[var(--hz-border)]" />

                  {/* Selfie — optional, plain upload (no live camera/liveness
                      check here — that's real KYC-provider territory). */}
                  {!idSelfieDocument ? (
                    <label htmlFor="id-selfie-input" className="flex items-center gap-2.5 h-[48px] px-4 rounded-[12px] border border-dashed border-[var(--hz-border)] cursor-pointer transition-colors" style={{ fontFamily: FONT_BODY }}>
                      <span className="text-[var(--hz-primary)]"><UploadIcon /></span>
                      <span className="text-[13px] font-semibold text-[var(--hz-primary)]">Upload a selfie (optional)</span>
                      <span className="text-[11px] text-[var(--hz-ink-subtle)] ml-auto">JPG or PNG</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 h-[56px] px-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)]">
                      <span className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><DocIcon /></span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{idSelfieDocument.fileName}</span>
                        <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(idSelfieDocument.fileSize)} · Selfie</span>
                      </div>
                    </div>
                  )}
                  <input id="id-selfie-input" type="file" accept="image/jpeg,image/png" className="sr-only" onChange={e => handleIdentityDocumentChange('selfie', e.target.files?.[0])} />

                  <button
                    type="button"
                    disabled={!canSubmitIdentity}
                    onClick={handleSubmitIdentity}
                    className="self-start h-9 px-3.5 rounded-[10px] text-[12.5px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Submit identity verification
                  </button>
                </div>
              )}
            </VerificationAreaCard>

            {/* B. Professional credentials — copy + relevance adapts by professionalType, never mandatory */}
            <VerificationAreaCard
              icon={<CredentialIcon />}
              title="Professional Credentials"
              description={PROFESSIONAL_CREDENTIAL_GUIDANCE[professionalType as ProfessionalType] ?? 'Credentials relevant to your work, if any apply.'}
              status={credentialSubmitted ? 'under-review' : 'not-submitted'}
            >
              {credentialSubmitted ? (
                <p className="text-[12px] m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>Submitted — Houzeify will review this credential.</p>
              ) : !showCredentialUpload ? (
                <button
                  type="button"
                  onClick={() => setShowCredentialUpload(true)}
                  className="self-start h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Add credential (optional)
                </button>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {!credentialDocument ? (
                    <label htmlFor="credential-document-input" className="flex items-center gap-2.5 h-[48px] px-4 rounded-[12px] border border-dashed border-[var(--hz-border)] cursor-pointer transition-colors" style={{ fontFamily: FONT_BODY }}>
                      <span className="text-[var(--hz-primary)]"><UploadIcon /></span>
                      <span className="text-[13px] font-semibold text-[var(--hz-primary)]">Upload credential document</span>
                      <span className="text-[11px] text-[var(--hz-ink-subtle)] ml-auto">PDF, JPG or PNG · up to 10 MB</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 h-[56px] px-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)]">
                      <span className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><DocIcon /></span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{credentialDocument.fileName}</span>
                        <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(credentialDocument.fileSize)}</span>
                      </div>
                      <button type="button" onClick={() => setCredentialSubmitted(true)} className="h-8 px-3 rounded-[8px] text-[12px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 shrink-0" style={{ fontFamily: FONT_BODY }}>
                        Submit
                      </button>
                    </div>
                  )}
                  <input
                    id="credential-document-input" type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      const result = validateVerificationDocumentFile(f)
                      if (!result.valid) { setNotice(result.error ?? 'Could not use this file.'); return }
                      setCredentialDocument({ fileName: f.name, fileType: f.type, fileSize: f.size })
                    }}
                  />
                  <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>
                    Only add a credential if one genuinely applies to your profession — many professionals verify through experience and profile information instead.
                  </p>
                </div>
              )}
            </VerificationAreaCard>

            {/* C. Business — only if the individual actually has one; never forced */}
            <VerificationAreaCard icon={<BusinessAreaIcon />} title="Business" description="Only if you operate a registered business." status={businessSubmitted ? 'under-review' : 'not-applicable'}>
              {businessSubmitted ? (
                <p className="text-[12px] m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>Submitted — Houzeify will review this information.</p>
              ) : !showBusinessDetails ? (
                <button
                  type="button"
                  onClick={() => setShowBusinessDetails(true)}
                  className="self-start text-[12.5px] font-medium text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0"
                  style={{ fontFamily: FONT_BODY }}
                >
                  I have a registered business →
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <div role="radiogroup" aria-label="Registration type" className="flex flex-wrap gap-2">
                    {REGISTRATION_TYPE_OPTIONS.map(t => (
                      <RegistrationTypeChip key={t} type={t} selected={businessRegistrationType === t} onSelect={() => setBusinessRegistrationType(t)} />
                    ))}
                  </div>
                  <input
                    type="text"
                    value={businessRegistrationNumber}
                    onChange={e => setBusinessRegistrationNumber(e.target.value)}
                    placeholder={businessRegistrationType ? REGISTRATION_TYPE_PLACEHOLDERS[businessRegistrationType] : 'Enter registration number'}
                    className="w-full h-[44px] px-3.5 rounded-[10px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] outline-none focus:border-[var(--hz-primary)] transition-colors"
                    style={{ fontFamily: FONT_BODY }}
                  />
                  {!businessDocument ? (
                    <label htmlFor="business-document-input" className="flex items-center gap-2.5 h-[48px] px-4 rounded-[12px] border border-dashed border-[var(--hz-border)] cursor-pointer transition-colors" style={{ fontFamily: FONT_BODY }}>
                      <span className="text-[var(--hz-primary)]"><UploadIcon /></span>
                      <span className="text-[13px] font-semibold text-[var(--hz-primary)]">Upload business document</span>
                      <span className="text-[11px] text-[var(--hz-ink-subtle)] ml-auto">PDF, JPG or PNG · up to 10 MB</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 h-[56px] px-4 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)]">
                      <span className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><DocIcon /></span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{businessDocument.fileName}</span>
                        <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{formatFileSize(businessDocument.fileSize)}</span>
                      </div>
                    </div>
                  )}
                  <input
                    id="business-document-input" type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      const result = validateVerificationDocumentFile(f)
                      if (!result.valid) { setNotice(result.error ?? 'Could not use this file.'); return }
                      setBusinessDocument({ fileName: f.name, fileType: f.type, fileSize: f.size })
                    }}
                  />
                  <button
                    type="button"
                    disabled={!businessRegistrationType || businessRegistrationNumber.trim().length < 4 || !businessDocument}
                    onClick={() => {
                      submitBusinessVerification({
                        organizationId,
                        registrationType: businessRegistrationType as RegistrationType,
                        registrationNumber: businessRegistrationNumber,
                        document: businessDocument as { fileName: string; fileType: string; fileSize: number },
                        ownerId: OWNER_ID,
                      })
                      setBusinessSubmitted(true)
                    }}
                    className="self-start h-9 px-3.5 rounded-[10px] text-[12.5px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Submit business details
                  </button>
                </div>
              )}
            </VerificationAreaCard>

            {/* D. Experience — points to real data collected later (Services & Portfolio), never fabricated here */}
            <VerificationAreaCard
              icon={<ExperienceIcon />}
              title="Experience"
              description="Your services and portfolio, once added."
              status="not-applicable"
            />

            <PrivacyNote />

            <HozieAssist onAskHozie={handleAskHozie} />

            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                onClick={handleIndividualContinue}
                className="h-[52px] px-8 rounded-[12px] text-[14px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 active:scale-[0.99] transition-all w-full sm:w-auto sm:min-w-[240px]"
                style={{ fontFamily: FONT_BODY }}
              >
                Continue →
              </button>
              <p className="text-[11.5px] text-[var(--hz-ink-subtle)] text-center m-0" style={{ fontFamily: FONT_BODY }}>
                You can add or update verification details anytime from your professional settings.
              </p>
            </div>
          </div>
          </>
          )}
        </div>
      </main>

      {/* Mobile sticky actions — organization branch only; the individual
          branch has its own inline, always-enabled Continue button since
          nothing there is required or skippable. */}
      {!loadingStatus && existingStatus === 'not-started' && !isIndividual && (
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--hz-surface)] border-t border-[var(--hz-border)] px-5 py-3 flex items-center gap-2.5" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button
          onClick={() => setShowSkipModal(true)}
          disabled={stage === 'submitting'}
          className="h-[48px] px-4 rounded-[12px] text-[13px] font-medium cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] disabled:opacity-60 shrink-0"
          style={{ fontFamily: FONT_BODY }}
        >
          Skip
        </button>
        <button
          onClick={handleSubmit}
          disabled={stage === 'submitting'}
          aria-label="Submit for verification"
          className={[
            'flex-1 h-[48px] text-[13.5px] font-semibold rounded-[12px] transition-all duration-200',
            'flex items-center justify-center gap-2',
            canSubmit ? 'bg-[var(--hz-primary)] text-white cursor-pointer' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-subtle)] cursor-pointer',
          ].join(' ')}
          style={{ fontFamily: FONT_BODY }}
        >
          {stage === 'submitting' ? 'Submitting…' : 'Submit for verification →'}
        </button>
      </div>
      )}

      {/* Toast notice */}
      {notice && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--hz-black)] text-white text-[13px] px-4 py-2.5 rounded-[10px]" style={{ fontFamily: FONT_BODY, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          {notice}
        </div>
      )}

      {showSkipModal && (
        <SkipVerificationModal onCancel={() => setShowSkipModal(false)} onConfirm={handleSkipConfirmed} />
      )}

      {/* Footer (desktop only — mobile uses the sticky action bar) */}
      <footer className="hidden lg:flex shrink-0 justify-center items-center gap-2.5 pb-5 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
