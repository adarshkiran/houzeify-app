import { useEffect, useMemo } from 'react'
import HIcon from '@/shared/components/HIcon'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { getBidById, getBidsForOpportunity, formatBidAmount, formatBidDuration, BID_STATUS_LABELS } from '@/data/bids'
import { formatFileSize, isPreviewableImage, isPdf, DOCUMENT_TYPE_LABELS } from '@/data/documentUpload'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 064 — Bid Detail ─────────────────────────────────────────────
// A HOMEOWNER, READ-ONLY screen — reviews ONE submitted bid in full before
// comparing it with others. Reuses bids.ts (032) for the Bid itself — no
// second Bid model — and contractorDirectory.ts (060/061) for the
// submitting professional's identity — no second contractor-profile system.
// Never awards, never changes bid status, never compares bids against each
// other (that's 065).

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
const IcoImage = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#808080" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="14" height="12" rx="1.5" /><circle cx="6.5" cy="7.5" r="1.3" /><path d="M2 13l4-4 3 3 3-3.5 4 4.5" /></svg>
)
const IcoFile = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="#808080" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M11 2v4h4" /></svg>
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

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  submitted: { bg: 'var(--hz-primary-soft)', fg: 'var(--hz-primary)' },
  accepted: { bg: '#DCFCE7', fg: '#16A34A' },
  rejected: { bg: '#FEE2E2', fg: 'var(--hz-danger)' },
  withdrawn: { bg: '#CAC7C6', fg: '#808080' },
}

interface BidDetailScreenProps {
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

export default function BidDetailScreen({
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
}: BidDetailScreenProps) {
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  if (!isHomeowner) return null

  const bid = useMemo(() => (bidId ? getBidById(bidId) : undefined), [bidId])

  // The bid's own opportunityId is the authoritative project reference —
  // projectId (carried from Screen 063) is only a fallback for the "Back
  // to Bids" link before/without a loaded bid. Never a fabricated id.
  const effectiveProjectId = bid?.opportunityId ?? projectId

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

  const canCompare = useMemo(
    () => (effectiveProjectId ? getBidsForOpportunity(effectiveProjectId).length >= 2 : false),
    [effectiveProjectId]
  )

  function backToBids() {
    onNavigate('bids-received', effectiveProjectId ? { project_id: effectiveProjectId } : undefined)
  }

  const selectClass = 'h-10 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'

  if (!bid) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Bid not found.</p>
          <button type="button" onClick={backToBids} className={selectClass} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
            Back to Bids
          </button>
        </div>
      </div>
    )
  }

  const name = listing?.name ?? 'Professional'
  const kind = listing?.kind ?? (bid.organizationId ? 'organization' : 'individual')
  const initials = kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')
  const statusStyle = STATUS_STYLE[bid.status] ?? STATUS_STYLE.submitted

  function viewProfile() {
    onNavigate('contractor-profile', {
      professional_id: bid!.organizationId ? '' : bid!.userId,
      organization_id: bid!.organizationId ?? '',
      ...(effectiveProjectId ? { project_id: effectiveProjectId } : {}),
    })
  }
  function compareBids() {
    if (!effectiveProjectId) return
    onNavigate('compare-bids', { project_id: effectiveProjectId })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      <header className="shrink-0 relative z-10 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={backToBids} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Back to Bids
          </button>
          <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)] hidden sm:block" style={{ fontFamily: FONT_MONO }}>Bid Detail</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[980px] mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your project'}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {propertyType && <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{propertyType}</span>}
              {location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> {location}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
            {/* LEFT */}
            <div className="flex flex-col gap-5 min-w-0">
              <SectionCard>
                <span className="inline-block px-2 py-1 rounded-full text-[10.5px] font-semibold tracking-[0.03em] mb-3" style={{ backgroundColor: statusStyle.bg, color: statusStyle.fg, fontFamily: FONT_MONO }}>
                  {BID_STATUS_LABELS[bid.status].toUpperCase()}
                </span>
                <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Your Proposed Price</p>
                <p className="text-[30px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{formatBidAmount(bid.amount)}</p>

                <div className="flex flex-wrap gap-6 mt-4 pt-4" style={{ borderTop: '1px solid var(--hz-surface-muted)' }}>
                  <div>
                    <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Estimated Duration</p>
                    <p className="text-[14.5px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{formatBidDuration(bid.duration, bid.durationUnit)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Proposed Start Date</p>
                    <p className="text-[14.5px] font-semibold text-[var(--hz-ink)] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                      {bid.proposedStartDate ? formatDate(bid.proposedStartDate) : 'Start date not specified.'}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Contractor's Proposal">
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 whitespace-pre-wrap">{bid.proposal || 'No proposal message provided.'}</p>
              </SectionCard>

              <SectionCard title="What's Included">
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 whitespace-pre-wrap">{bid.included || 'No inclusions specified.'}</p>
              </SectionCard>

              <SectionCard title="Exclusions / Notes">
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 whitespace-pre-wrap">{bid.exclusions || 'No exclusions or additional notes specified.'}</p>
              </SectionCard>

              {bid.attachments.length > 0 && (
                <SectionCard title="Attachments">
                  <div className="flex flex-col gap-2">
                    {bid.attachments.map(doc => (
                      <div key={doc.id} className="flex items-center gap-2.5 px-3 py-2 rounded-[10px]" style={{ border: '1px solid var(--hz-border)' }}>
                        {isPreviewableImage(doc.mimeType) ? <IcoImage /> : isPdf(doc.mimeType, doc.name) ? <IcoFile /> : <IcoFile />}
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-medium text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_BODY }}>{doc.name}</p>
                          <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{DOCUMENT_TYPE_LABELS[doc.type]} · {formatFileSize(doc.size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-5 min-w-0">
              <SectionCard title="Contractor">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{name}</p>
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
                <button
                  type="button"
                  onClick={viewProfile}
                  className="mt-3 text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0"
                  style={{ fontFamily: FONT_BODY }}
                >
                  View Contractor Profile →
                </button>
              </SectionCard>

              <SectionCard title="Project">
                <div className="flex flex-col gap-1">
                  <p className="text-[13px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your project'}</p>
                  {propertyType && <p className="text-[12px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>{propertyType}</p>}
                  {location && (
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink-muted)] mt-0.5" style={{ fontFamily: FONT_BODY }}>
                      <IcoMapPin /> {location}
                    </span>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Timeline">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[12.5px] font-medium text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_BODY }}>Submitted</p>
                  <p className="text-[12px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>{formatDate(bid.createdAt)}</p>
                </div>
              </SectionCard>

              {canCompare && (
                <button
                  type="button"
                  onClick={compareBids}
                  className="h-11 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0"
                  style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                >
                  Compare Bids →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
