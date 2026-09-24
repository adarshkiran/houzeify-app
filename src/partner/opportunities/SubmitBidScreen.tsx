import { useEffect, useRef, useState } from 'react'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { getOpportunityById, OPPORTUNITY_PROJECT_TYPE_LABELS, formatBudgetRange } from '@/data/projectOpportunities'
import { getInvitationById } from '@/data/invitations'
import {
  BID_DURATION_UNIT_OPTIONS,
  BID_DURATION_UNIT_LABELS,
  EMPTY_BID_DRAFT,
  PROPOSAL_MAX,
  INCLUDED_MAX,
  EXCLUSIONS_MAX,
  validateBidForm,
  isBidFormValid,
  getActiveBidForProfessional,
  createBid,
  formatBidAmount,
  formatBidDuration,
  type BidFormValues,
  type BidDurationUnit,
} from '@/data/bids'
import { validateFile, createProjectDocument, formatFileSize, DOCUMENT_TYPE_LABELS, isPreviewableImage, isPdf, type ProjectDocument } from '@/data/documentUpload'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention (matches every other professional-flow screen)

// ─── Screen 032 — Submit Bid ─────────────────────────────────────────────────
// Creates a BID for an existing Project Opportunity — never a new Project or
// Opportunity. role stays the sole canonical persona check (never
// primaryIntent/Boolean(professionalType)), mirroring Screens 029-031.


// ─── Icons ──────────────────────────────────────────────────────────────

const PinIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const HomeIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8L8 3l6 5" /><path d="M3.5 7v6h9V7" /></svg>
)
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V2.5M5 5.5L8 2.5L11 5.5" /><path d="M2.5 10.5V13a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2.5" /></svg>
)
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3L11 11M11 3L3 11" /></svg>
)
const IcoImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.1 0L4 19" /></svg>
)
const IcoFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v6h6" /></svg>
)
const EmptyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5l5 5M14.5 9.5l-5 5" /></svg>
)

function fileIcon(doc: { mimeType: string; name: string }) {
  if (isPreviewableImage(doc.mimeType)) return <IcoImage />
  if (isPdf(doc.mimeType, doc.name)) return <IcoFile />
  return <IcoFile />
}

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
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{title}</span>
      {children}
    </div>
  )
}
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[var(--hz-ink)] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

type SubmitStage = 'idle' | 'submitting'

// ─── Main screen ──────────────────────────────────────────────────────────

export default function SubmitBidScreen({
  opportunityId,
  invitationId,
  projectName,
  propertyType,
  location,
  role,
  organizationId,
  accountType,
  onNavigate,
}: {
  opportunityId?: string
  /** Set when this bid responds to a direct homeowner invitation
   *  (062/Professional Dashboard's "Project Invitations") rather than a
   *  marketplace ProjectOpportunity. When present and valid, opportunityId
   *  is expected to equal that invitation's own projectId — see
   *  invitations.ts's own "never conflate" header note. Never a second
   *  Bid/Opportunity model; createBid() below is called identically
   *  either way. */
  invitationId?: string
  /** The homeowner's real project context (projectData.project_name/
   *  property_type/location) — only used to render the header for the
   *  invitation path, since no ProjectOpportunity record exists for it. */
  projectName?: string
  propertyType?: string
  location?: string
  /** Canonical top-level persona ('homeowner' | 'professional'), resolved
   *  once at Screen 007 and passed down by App.tsx — the sole check for
   *  whether this screen is reachable. Never primaryIntent, never
   *  Boolean(professionalType). */
  role?: string
  organizationId?: string
  accountType?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // ROLE SAFETY — same reverse guard as Screens 029-031.
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const opportunity = opportunityId ? getOpportunityById(opportunityId) : undefined
  // Direct-invitation path — real only when the invitation actually exists
  // and its own projectId matches the id we were navigated with (never
  // trusted blindly). Bid.opportunityId ends up equal to
  // ProjectInvitation.projectId, exactly as intended.
  const invitation = (!opportunity && invitationId) ? getInvitationById(invitationId) : undefined
  const invitationValid = Boolean(invitation && opportunityId && invitation.projectId === opportunityId)
  const isOrganization = accountType === 'organization'
  const bidOrganizationId = isOrganization ? (organizationId ?? null) : null

  function handleBackToProjects() {
    onNavigate('discover-projects')
  }

  if (!opportunity && !invitationValid) {
    return (
      <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <header className="shrink-0 relative z-10">
          <div className="flex items-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
            <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-5 py-10 text-center relative z-10">
          <span className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-subtle)' }}><EmptyIcon /></span>
          <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
          <button type="button" onClick={handleBackToProjects} className="h-10 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>
            ← Back to Projects
          </button>
        </main>
      </div>
    )
  }

  if (invitationValid) {
    return (
      <BidForm
        opportunityId={invitation!.projectId}
        opportunityTitle={projectName || 'Homeowner Project'}
        opportunityProjectType={propertyType || 'Construction Project'}
        opportunityLocation={location || 'Location not specified'}
        opportunityBudget={null}
        bidOrganizationId={bidOrganizationId}
        isInvitationResponse
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <BidForm
      opportunityId={opportunity!.id}
      opportunityTitle={opportunity!.title}
      opportunityProjectType={OPPORTUNITY_PROJECT_TYPE_LABELS[opportunity!.projectType]}
      opportunityLocation={opportunity!.location}
      opportunityBudget={formatBudgetRange(opportunity!.budgetMin, opportunity!.budgetMax)}
      bidOrganizationId={bidOrganizationId}
      onNavigate={onNavigate}
    />
  )
}

function BidForm({
  opportunityId,
  opportunityTitle,
  opportunityProjectType,
  opportunityLocation,
  opportunityBudget,
  bidOrganizationId,
  isInvitationResponse,
  onNavigate,
}: {
  opportunityId: string
  opportunityTitle: string
  opportunityProjectType: string
  opportunityLocation: string
  opportunityBudget: string | null
  bidOrganizationId: string | null
  /** True only for the direct-invitation path — there's no
   *  ProjectOpportunityDetail (031) to go "back" to, so Back/duplicate
   *  states route to the Professional Dashboard instead. */
  isInvitationResponse?: boolean
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // Duplicate-bid protection — checked once on mount against the real bid
  // store, mirroring the existing duplicate-submission pattern already
  // established in Screen 023 (business verification).
  const existingBid = getActiveBidForProfessional(opportunityId, CURRENT_USER_ID)

  const [values, setValues] = useState<BidFormValues>(EMPTY_BID_DRAFT)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [attachments, setAttachments] = useState<ProjectDocument[]>([])
  const [attachmentError, setAttachmentError] = useState<string | undefined>(undefined)
  const [stage, setStage] = useState<SubmitStage>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleBack() {
    if (isInvitationResponse) onNavigate('professional-dashboard')
    else onNavigate('project-opportunity-detail', { opportunity_id: opportunityId })
  }

  if (existingBid) {
    return (
      <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <header className="shrink-0 relative z-10">
          <div className="flex items-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
            <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-5 py-10 text-center relative z-10">
          <span className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </span>
          <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0 max-w-[360px]" style={{ fontFamily: FONT_HEAD }}>You have already submitted a bid for this project.</p>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => onNavigate('my-bids', { bid_id: existingBid.id })} className="h-10 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>
              View My Bid
            </button>
            <button type="button" onClick={handleBack} className="h-10 px-4 rounded-[10px] text-[13px] font-medium cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors" style={{ fontFamily: FONT_BODY }}>
              ← Back to Project
            </button>
          </div>
        </main>
      </div>
    )
  }

  const errors = validateBidForm(values)
  const showError = (field: keyof typeof errors) => (touched[field] || attemptedSubmit) && !!errors[field]
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setAttachmentError(undefined)
    for (const file of files) {
      const validation = validateFile(file)
      if (!validation.valid) {
        setAttachmentError(validation.error)
        continue
      }
      const doc = createProjectDocument(file, opportunityId)
      setAttachments(prev => [...prev, { ...doc, status: 'ready' }])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  function handleSubmit() {
    setAttemptedSubmit(true)
    if (!isBidFormValid(values) || stage === 'submitting') return
    setStage('submitting')
    const bid = createBid({
      opportunityId,
      userId: CURRENT_USER_ID,
      organizationId: bidOrganizationId,
      amount: Number(values.amount),
      duration: Number(values.duration),
      durationUnit: values.durationUnit,
      proposedStartDate: values.proposedStartDate.trim() || null,
      proposal: values.proposal,
      included: values.included,
      exclusions: values.exclusions,
      attachments,
    })
    setTimeout(() => {
      onNavigate('bid-submitted', { bid_id: bid.id, opportunity_id: opportunityId })
    }, 600)
  }

  const durationSummary = values.duration.trim() && !errors.duration ? formatBidDuration(Number(values.duration), values.durationUnit) : '—'
  const amountSummary = values.amount.trim() && !errors.amount ? formatBidAmount(Number(values.amount)) : '—'

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      <header className="shrink-0 relative z-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
        <div className="flex items-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </header>

      <main className="flex-1 relative z-10 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 w-full pb-28 lg:pb-8">
        <div className="w-full flex flex-col gap-6" style={{ maxWidth: 1100, margin: '0 auto' }}>

          <button type="button" onClick={handleBack} className="self-start text-[12.5px] font-semibold text-[var(--hz-ink-muted)] cursor-pointer bg-transparent border-0 hover:text-[var(--hz-ink)] hover:underline p-0" style={{ fontFamily: FONT_BODY }}>
            ← Back to Project
          </button>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Submit Bid</span>
            <h1 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>Submit your bid</h1>
            <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Review your proposal details before sending it to the homeowner.</p>
            <div className="flex items-center gap-1.5 flex-wrap text-[12.5px] text-[var(--hz-ink-muted)] mt-1" style={{ fontFamily: FONT_BODY }}>
              <span className="font-semibold text-[var(--hz-ink)]">{opportunityTitle}</span>
              <span className="text-[var(--hz-border-strong)]">·</span>
              <span className="flex items-center gap-1"><HomeIconSmall /> {opportunityProjectType}</span>
              <span className="text-[var(--hz-border-strong)]">·</span>
              <span className="flex items-center gap-1"><PinIcon /> {opportunityLocation}</span>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* Left — bid form */}
            <div className="flex flex-col gap-5 order-1">

              <SectionCard title="Bid Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Your bid amount</FieldLabel>
                    <div className="flex items-center border rounded-[10px] bg-[var(--hz-surface)] h-[44px] overflow-hidden transition-colors" style={{ borderColor: showError('amount') ? '#D97706' : 'var(--hz-border-strong)' }}>
                      <div className="flex items-center pl-3.5 pr-1 shrink-0 text-[var(--hz-ink-muted)] font-semibold text-[14px]" style={{ fontFamily: FONT_BODY }}>₹</div>
                      <input
                        id="bid-amount"
                        type="number"
                        min="1"
                        step="1"
                        inputMode="decimal"
                        value={values.amount}
                        onChange={e => setValues(p => ({ ...p, amount: e.target.value }))}
                        onBlur={() => markTouched('amount')}
                        placeholder="e.g. 4200000"
                        aria-invalid={showError('amount')}
                        aria-describedby={showError('amount') ? 'bid-amount-error' : undefined}
                        className="flex-1 h-full pr-3 text-[14px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] bg-transparent outline-none border-none"
                        style={{ fontFamily: FONT_BODY }}
                      />
                    </div>
                    {showError('amount') && <FieldError id="bid-amount-error" message={errors.amount} />}
                  </div>

                  <div>
                    <FieldLabel>Estimated duration</FieldLabel>
                    <div className="flex items-stretch gap-2">
                      <input
                        id="bid-duration"
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={values.duration}
                        onChange={e => setValues(p => ({ ...p, duration: e.target.value }))}
                        onBlur={() => markTouched('duration')}
                        placeholder="e.g. 12"
                        aria-invalid={showError('duration')}
                        aria-describedby={showError('duration') ? 'bid-duration-error' : undefined}
                        className={['w-[84px] h-[44px] px-3 rounded-[10px] border bg-[var(--hz-surface)] text-[14px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] outline-none transition-colors', showError('duration') ? 'border-[#D97706]' : 'border-[var(--hz-border)] focus:border-[var(--hz-primary)]'].join(' ')}
                        style={{ fontFamily: FONT_BODY }}
                      />
                      <select
                        aria-label="Duration unit"
                        value={values.durationUnit}
                        onChange={e => setValues(p => ({ ...p, durationUnit: e.target.value as BidDurationUnit }))}
                        className="flex-1 h-[44px] px-3 rounded-[10px] border border-[var(--hz-border)] focus:border-[var(--hz-primary)] bg-[var(--hz-surface)] text-[14px] text-[var(--hz-ink)] outline-none transition-colors cursor-pointer"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        {BID_DURATION_UNIT_OPTIONS.map(u => <option key={u} value={u}>{BID_DURATION_UNIT_LABELS[u]}</option>)}
                      </select>
                    </div>
                    {showError('duration') && <FieldError id="bid-duration-error" message={errors.duration} />}
                  </div>
                </div>

                <div>
                  <FieldLabel optional>Proposed start date</FieldLabel>
                  <input
                    id="bid-start-date"
                    type="date"
                    value={values.proposedStartDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setValues(p => ({ ...p, proposedStartDate: e.target.value }))}
                    onBlur={() => markTouched('proposedStartDate')}
                    aria-invalid={showError('proposedStartDate')}
                    aria-describedby={showError('proposedStartDate') ? 'bid-start-date-error' : undefined}
                    className={['w-full sm:w-[220px] h-[44px] px-3.5 rounded-[10px] border bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] outline-none transition-colors', showError('proposedStartDate') ? 'border-[#D97706]' : 'border-[var(--hz-border)] focus:border-[var(--hz-primary)]'].join(' ')}
                    style={{ fontFamily: FONT_BODY }}
                  />
                  {showError('proposedStartDate') && <FieldError id="bid-start-date-error" message={errors.proposedStartDate} />}
                </div>
              </SectionCard>

              <SectionCard title="Your Proposal">
                <FieldLabel optional>Explain your approach</FieldLabel>
                <textarea
                  value={values.proposal}
                  onChange={e => setValues(p => ({ ...p, proposal: e.target.value.slice(0, PROPOSAL_MAX) }))}
                  placeholder="Explain your approach, experience and what you propose to deliver."
                  rows={4}
                  maxLength={PROPOSAL_MAX}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--hz-border)] focus:border-[var(--hz-primary)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] outline-none transition-colors resize-none"
                  style={{ fontFamily: FONT_BODY }}
                />
                <div className="flex justify-end -mt-1"><span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{values.proposal.length}/{PROPOSAL_MAX}</span></div>
              </SectionCard>

              <SectionCard title="What's Included">
                <textarea
                  value={values.included}
                  onChange={e => setValues(p => ({ ...p, included: e.target.value.slice(0, INCLUDED_MAX) }))}
                  placeholder="Materials, labour, site supervision, execution..."
                  rows={3}
                  maxLength={INCLUDED_MAX}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--hz-border)] focus:border-[var(--hz-primary)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] outline-none transition-colors resize-none"
                  style={{ fontFamily: FONT_BODY }}
                />
                <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>Descriptive information only — this isn&apos;t a BOQ.</p>
              </SectionCard>

              <SectionCard title="Exclusions / Notes">
                <textarea
                  value={values.exclusions}
                  onChange={e => setValues(p => ({ ...p, exclusions: e.target.value.slice(0, EXCLUSIONS_MAX) }))}
                  placeholder="Mention anything that is not included in your proposed price."
                  rows={3}
                  maxLength={EXCLUSIONS_MAX}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--hz-border)] focus:border-[var(--hz-primary)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[var(--hz-border-strong)] outline-none transition-colors resize-none"
                  style={{ fontFamily: FONT_BODY }}
                />
              </SectionCard>

              <SectionCard title="Attachments">
                {attachments.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {attachments.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 rounded-[10px] border border-[var(--hz-border)] p-2.5">
                        <span className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)' }}>{fileIcon(doc)}</span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{doc.name}</span>
                          <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{DOCUMENT_TYPE_LABELS[doc.type]} · {formatFileSize(doc.size)}</span>
                        </div>
                        <button type="button" onClick={() => removeAttachment(doc.id)} aria-label={`Remove ${doc.name}`} className="flex items-center justify-center w-7 h-7 rounded-full border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-subtle)] hover:text-[var(--hz-ink-muted)] cursor-pointer shrink-0">
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label htmlFor="bid-attachment-input" className="self-start flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-primary)] hover:border-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)] transition-colors" style={{ fontFamily: FONT_BODY }}>
                  <UploadIcon /> Add supporting document
                </label>
                <input ref={fileInputRef} id="bid-attachment-input" type="file" multiple accept="application/pdf,image/jpeg,image/png,.dwg,.dxf" onChange={handleFilesSelected} className="sr-only" />
                <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>Optional — PDF, JPG, PNG, DWG or DXF, up to 25 MB each.</p>
                {attachmentError && <FieldError id="bid-attachment-error" message={attachmentError} />}
              </SectionCard>
            </div>

            {/* Right — project context, bid summary, submit (sticky) */}
            <div className="flex flex-col gap-5 order-2 lg:sticky lg:top-6">

              <SectionCard title="Project">
                <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{opportunityTitle}</span>
                <div className="flex flex-col divide-y divide-[var(--hz-border-strong)]">
                  <SummaryRow label="Budget" value={opportunityBudget ?? 'Not specified'} />
                  <SummaryRow label="Location" value={opportunityLocation} />
                </div>
              </SectionCard>

              <SectionCard title="Your Bid">
                <div className="flex flex-col divide-y divide-[var(--hz-border-strong)]">
                  <SummaryRow label="Bid amount" value={amountSummary} />
                  <SummaryRow label="Duration" value={durationSummary} />
                  <SummaryRow label="Start" value={values.proposedStartDate ? values.proposedStartDate : 'Not specified'} />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A1A1A1]" />
                  <span className="text-[12px] font-semibold text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Draft</span>
                </div>
              </SectionCard>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={stage === 'submitting'}
                aria-label="Submit bid"
                className="hidden lg:flex items-center justify-center gap-2 h-[52px] text-[14px] font-semibold rounded-[12px] cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 active:scale-[0.99] transition-all disabled:opacity-70"
                style={{ fontFamily: FONT_BODY }}
              >
                {stage === 'submitting' ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" /><path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                    Submitting...
                  </>
                ) : 'Submit Bid →'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky submit */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--hz-surface)] border-t border-[var(--hz-border)] px-5 py-3" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={stage === 'submitting'}
          aria-label="Submit bid"
          className="w-full h-[48px] text-[13.5px] font-semibold rounded-[12px] cursor-pointer border-0 bg-[var(--hz-primary)] text-white flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ fontFamily: FONT_BODY }}
        >
          {stage === 'submitting' ? 'Submitting...' : 'Submit Bid →'}
        </button>
      </div>
    </div>
  )
}
