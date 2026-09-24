import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { getBidById, formatBidAmount, formatBidDuration, isProjectAwarded, awardBid } from '@/data/bids'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 066 — Award Contractor (confirm) ────────────────────────────────
// A HOMEOWNER screen — the actual award decision. Reuses bids.ts (032) for
// the Bid — no second Bid/Award model. "This project is awarded" is
// represented purely as the chosen bid reaching status 'accepted' (see
// bids.ts's own header note); no ContractorAward/ProjectAward store exists
// or is created here. Never navigates straight to a project workspace —
// success always lands on 067 (not built), the dedicated confirmation
// screen.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const InfoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="14" cy="14" r="11" /><line x1="14" y1="12.5" x2="14" y2="19" /><circle cx="14" cy="9" r="0.6" fill="#A1A1A1" stroke="none" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
      {title && <h2 className="text-[13px] font-semibold text-[var(--hz-ink)] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface AwardContractorScreenProps {
  role?: string
  userId?: string
  bidId?: string
  projectId?: string
  projectName?: string
  propertyType?: string
  location?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  professionalType?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  serviceDescription?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function AwardContractorScreen({
  role,
  userId,
  bidId,
  projectId,
  projectName,
  propertyType,
  location,
  organizationId,
  companyName,
  accountType,
  professionalType,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  serviceDescription,
  onNavigate,
}: AwardContractorScreenProps) {
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  if (!isHomeowner) return null

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bid = useMemo(() => (bidId ? getBidById(bidId) : undefined), [bidId])

  // The bid's own opportunityId is the authoritative project reference —
  // projectId (carried from Screen 065) is only used to detect a stale/
  // mismatched navigation before treating the bid as valid. Never a
  // fabricated fallback id.
  const effectiveProjectId = bid?.opportunityId ?? projectId
  const projectMismatch = Boolean(bid && projectId && bid.opportunityId !== projectId)
  const bidIneligible = bid ? (bid.status === 'rejected' || bid.status === 'withdrawn') : false
  const hasValidContext = Boolean(bidId) && Boolean(bid) && !projectMismatch && !bidIneligible

  const alreadyAwarded = useMemo(
    () => (effectiveProjectId ? isProjectAwarded(effectiveProjectId) : false),
    [effectiveProjectId]
  )

  const directoryInput: ContractorDirectoryInput = {
    userId: userId || CURRENT_USER_ID,
    accountType: accountType as AccountType | undefined,
    organizationId,
    companyName,
    professionalType: professionalType as ProfessionalType | undefined,
    location,
    serviceCategories,
    serviceLocations,
    verificationStatus,
    portfolioProjectCount,
    serviceDescription,
  }

  const listing = useMemo(
    () => (bid ? getContractorListingById(bid.organizationId ?? bid.userId, directoryInput) : undefined),
    [bid, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceLocations, directoryInput.verificationStatus,
      directoryInput.portfolioProjectCount, directoryInput.serviceDescription]
  )

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'

  function backToCompare() {
    onNavigate('compare-bids', effectiveProjectId ? { project_id: effectiveProjectId } : undefined)
  }
  function viewFullBid() {
    if (!bid) return
    onNavigate('bid-detail', { bid_id: bid.id, project_id: effectiveProjectId ?? '' })
  }
  function viewProject() {
    onNavigate('estimate-dashboard')
  }

  function handleAward() {
    if (!bid || sending || alreadyAwarded || !hasValidContext) return
    setSending(true)
    setError(null)
    try {
      const result = awardBid(bid.id)
      if (!result) {
        setSending(false)
        setError('Unable to award this contractor.')
        return
      }
      onNavigate('contractor-selected', {
        project_id: effectiveProjectId as string,
        bid_id: bid.id,
        project_stage: 'contractor-selected',
      })
    } catch {
      setSending(false)
      setError('Unable to award this contractor.')
    }
  }

  // ─── Invalid / ineligible — never crash, never mutate anything ────────
  if (!hasValidContext) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Unable to award this contractor.</p>
          <button type="button" onClick={backToCompare} className={selectClass} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
            Back to Compare Bids
          </button>
        </div>
      </div>
    )
  }

  // ─── Duplicate-award protection ────────────────────────────────────────
  if (alreadyAwarded) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-[380px]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)' }}><InfoIcon /></div>
          <p className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Contractor already selected</p>
          <button type="button" onClick={viewProject} className={`mt-1 ${selectClass}`} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
            View Project →
          </button>
        </div>
      </div>
    )
  }

  const name = listing?.name ?? 'Professional'
  const kind = listing?.kind ?? (bid!.organizationId ? 'organization' : 'individual')
  const initials = kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')
  const proposalPreview = bid!.proposal ? (bid!.proposal.length > 160 ? `${bid!.proposal.slice(0, 160)}…` : bid!.proposal) : 'No proposal message provided.'

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="bids" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">

      <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={backToCompare} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Back to Compare Bids
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Award Contractor</h1>
            <p className="text-[13.5px] text-[var(--hz-ink-muted)] mt-1.5 mb-0" style={{ fontFamily: FONT_BODY }}>
              Review the final details before awarding this project.
            </p>
          </div>

          <SectionCard>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project</p>
            <p className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your project'}</p>
            {propertyType && <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{propertyType}</p>}
            {location && (
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink-muted)] mt-1" style={{ fontFamily: FONT_BODY }}>
                <IcoMapPin /> {location}
              </span>
            )}
          </SectionCard>

          <SectionCard title="Selected Contractor">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[14.5px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{name}</p>
                  {listing?.verificationStatus === 'verified' && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A]" style={{ fontFamily: FONT_BODY }}><CheckBadgeIcon /> Verified</span>
                  )}
                </div>
                <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{typeLabel} · {kind === 'organization' ? 'Organization' : 'Individual'}</p>
                {listing?.location && (
                  <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink-muted)] mt-1" style={{ fontFamily: FONT_BODY }}>
                    <IcoMapPin /> {listing.location}
                  </span>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-2" style={{ fontFamily: FONT_MONO }}>Your Selected Bid</p>
            <p className="text-[26px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{formatBidAmount(bid!.amount)}</p>

            <div className="flex flex-wrap gap-6 mt-4 pt-4" style={{ borderTop: '1px solid var(--hz-surface-muted)' }}>
              <div>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Duration</p>
                <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{formatBidDuration(bid!.duration, bid!.durationUnit)}</p>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Proposed Start Date</p>
                <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                  {bid!.proposedStartDate ? formatDate(bid!.proposedStartDate) : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--hz-surface-muted)' }}>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Proposal</p>
              <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>{proposalPreview}</p>
              <button type="button" onClick={viewFullBid} className="mt-1.5 text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                View Full Bid →
              </button>
            </div>
          </SectionCard>

          <div className="rounded-[16px] p-5" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCE7C2' }}>
            <p className="text-[13px] text-[var(--hz-ink)] m-0 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
              You're about to award this project to <strong>{name}</strong>. Their submitted bid of <strong>{formatBidAmount(bid!.amount)}</strong> will become the selected proposal for this project.
            </p>
            <p className="text-[12px] text-[#D97706] m-0 mt-3 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
              After awarding, other submitted bids will no longer be considered active for this project. Their history is preserved, not deleted.
            </p>
          </div>

          {error && (
            <div className="rounded-[12px] p-4" style={{ backgroundColor: '#FEE2E2', border: '1px solid #F3D2D2' }}>
              <p className="text-[13px] font-medium text-[var(--hz-danger)] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={backToCompare} disabled={sending} className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-[var(--hz-surface)]" style={{ border: '1px solid var(--hz-border)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}>
              Cancel
            </button>
            <button type="button" onClick={handleAward} disabled={sending} className="h-11 px-6 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0 disabled:opacity-60" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
              {sending ? 'Awarding...' : 'Award Contractor →'}
            </button>
          </div>
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
