import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput, type ContractorListing } from '@/data/contractorDirectory'
import { getBidsForOpportunity, formatBidAmount, formatBidDuration, type Bid } from '@/data/bids'
import { getInvitationsForProject, type ProjectInvitation } from '@/data/invitations'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 063 — Bids Received ─────────────────────────────────────────────
// A HOMEOWNER screen — the central place to track contractor invitations and
// bids for ONE project. Reuses invitations.ts (062) and bids.ts (032) — no
// new Invitation or Bid model. An invitation and a bid from the SAME
// professional/organization combine into ONE card; a contractor never
// appears twice. Never treats an invitation as a bid, never awards anyone
// here (that's 066).

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention

// Mirrors InviteContractorScreen.tsx's own reasoning exactly: no screen in
// this codebase ever actually writes projectData.project_id, so this reuses
// the same real fallback id (boqOverview.ts's own 'proj-001') once a real
// project is confirmed to exist (projectName present) — never a fabricated
// id, and Screen 062 already navigates here with this exact id when it was
// used to create the invitation, so this only ever matters for a direct or
// stale visit.
const DEFAULT_PROJECT_ID = 'proj-001'


const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="var(--hz-success)" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const EmptyIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="15" cy="12" r="5" /><path d="M4 32v-2.3A10 10 0 0115 20" /><circle cx="25" cy="14" r="4" /><path d="M21.5 21a7.2 7.2 0 017.5 7.2" /></svg>
)
const ClockIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="17" cy="17" r="13" /><path d="M17 10v7l5 3" /></svg>
)

// ─── Time-ago — same day-count math projectOpportunities.ts's own
// formatPostedDate() already uses, worded for "invited" rather than
// "posted" since this screen is never about a posted opportunity. ─────────
function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Combined contractor response — Invitation + Bid, never duplicated ─────

interface ContractorResponse {
  key: string
  professionalId: string | null
  organizationId: string | null
  invitation: ProjectInvitation | null
  bid: Bid | null
  listing: ContractorListing | undefined
  respondedAt: string
}

type ResponseState = 'awaiting' | 'received' | 'accepted' | 'rejected'

function stateFor(response: ContractorResponse): ResponseState {
  if (!response.bid) return 'awaiting'
  if (response.bid.status === 'accepted') return 'accepted'
  if (response.bid.status === 'rejected') return 'rejected'
  return 'received'
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>{children}</div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <SectionCard>
      <p className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{value}</p>
      <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{label}</p>
    </SectionCard>
  )
}

function ResponseCard({ response, onViewProfile, onViewBid }: { response: ContractorResponse; onViewProfile: () => void; onViewBid: () => void }) {
  const state = stateFor(response)
  const name = response.listing?.name ?? 'Professional'
  const kind = response.listing?.kind ?? (response.organizationId ? 'organization' : 'individual')
  const initials = kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = response.listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[response.listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')

  const statusBadge: Record<ResponseState, { label: string; bg: string; fg: string }> = {
    awaiting: { label: 'INVITED', bg: 'var(--hz-primary-soft)', fg: 'var(--hz-primary)' },
    received: { label: 'BID RECEIVED', bg: '#DCFCE7', fg: 'var(--hz-success)' },
    accepted: { label: 'BID ACCEPTED', bg: '#DCFCE7', fg: 'var(--hz-success)' },
    rejected: { label: 'BID REJECTED', bg: '#FEE2E2', fg: 'var(--hz-danger)' },
  }
  const badge = statusBadge[state]

  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-3" style={{ border: '1px solid var(--hz-border)' }}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[14.5px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{name}</p>
            {response.listing?.verificationStatus === 'verified' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--hz-success)]" style={{ fontFamily: FONT_BODY }}><CheckBadgeIcon /> Verified</span>
            )}
          </div>
          <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>
            {typeLabel} · {kind === 'organization' ? 'Organization' : 'Individual'}
          </p>
        </div>
      </div>

      <span className="self-start px-2 py-1 rounded-full text-[10.5px] font-semibold tracking-[0.03em]" style={{ backgroundColor: badge.bg, color: badge.fg, fontFamily: FONT_MONO }}>
        {badge.label}
      </span>

      {response.bid ? (
        <div className="flex flex-col gap-0.5">
          <p className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{formatBidAmount(response.bid.amount)}</p>
          <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>{formatBidDuration(response.bid.duration, response.bid.durationUnit)}</p>
          <p className="text-[11.5px] text-[var(--hz-ink-subtle)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Submitted {formatDate(response.bid.createdAt)}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Awaiting bid</p>
          <p className="text-[11.5px] text-[var(--hz-ink-subtle)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Invited {timeAgo(response.respondedAt)}</p>
        </div>
      )}

      <button
        type="button"
        onClick={response.bid ? onViewBid : onViewProfile}
        className="self-start text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0 mt-1"
        style={{ fontFamily: FONT_BODY }}
      >
        {response.bid ? 'View Bid →' : 'View Profile →'}
      </button>
    </div>
  )
}

interface BidsReceivedScreenProps {
  role?: string
  userId?: string
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

type FilterId = 'all' | 'awaiting' | 'received' | 'accepted' | 'rejected'
type SortId = 'newest' | 'oldest' | 'highest' | 'lowest'

export default function BidsReceivedScreen({
  role,
  userId,
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
}: BidsReceivedScreenProps) {
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  if (!isHomeowner) return null

  const [filter, setFilter] = useState<FilterId>('all')
  const [sort, setSort] = useState<SortId>('newest')

  const effectiveProjectId = projectId || (projectName ? DEFAULT_PROJECT_ID : undefined)

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

  const invitations = useMemo(() => (effectiveProjectId ? getInvitationsForProject(effectiveProjectId) : []), [effectiveProjectId])
  const bids = useMemo(() => (effectiveProjectId ? getBidsForOpportunity(effectiveProjectId) : []), [effectiveProjectId])

  const responses = useMemo<ContractorResponse[]>(() => {
    const byKey = new Map<string, ContractorResponse>()
    const keyFor = (professionalId: string | null, organizationId: string | null) => organizationId ? `org:${organizationId}` : `pro:${professionalId}`

    for (const invitation of invitations) {
      const key = keyFor(invitation.professionalId, invitation.organizationId)
      byKey.set(key, {
        key,
        professionalId: invitation.professionalId,
        organizationId: invitation.organizationId,
        invitation,
        bid: null,
        listing: getContractorListingById(invitation.organizationId ?? invitation.professionalId ?? '', directoryInput),
        respondedAt: invitation.createdAt,
      })
    }
    for (const bid of bids) {
      const key = keyFor(bid.userId, bid.organizationId)
      const existing = byKey.get(key)
      if (existing) {
        existing.bid = bid
        existing.respondedAt = bid.createdAt
      } else {
        // A submitted bid with no matching invitation on record — still a
        // real contractor response, never hidden.
        byKey.set(key, {
          key,
          professionalId: bid.organizationId ? null : bid.userId,
          organizationId: bid.organizationId,
          invitation: null,
          bid,
          listing: getContractorListingById(bid.organizationId ?? bid.userId, directoryInput),
          respondedAt: bid.createdAt,
        })
      }
    }
    return Array.from(byKey.values())
  }, [invitations, bids, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
    directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceLocations, directoryInput.verificationStatus,
    directoryInput.portfolioProjectCount, directoryInput.serviceDescription])

  const counts = useMemo(() => ({
    invited: responses.length,
    received: responses.filter(r => stateFor(r) === 'received' || stateFor(r) === 'accepted' || stateFor(r) === 'rejected').length,
    awaiting: responses.filter(r => stateFor(r) === 'awaiting').length,
    accepted: responses.filter(r => stateFor(r) === 'accepted').length,
  }), [responses])

  const filtered = useMemo(() => {
    let list = responses
    if (filter !== 'all') list = list.filter(r => stateFor(r) === filter)
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest': return +new Date(a.respondedAt) - +new Date(b.respondedAt)
        case 'highest': return (b.bid?.amount ?? -1) - (a.bid?.amount ?? -1)
        case 'lowest': {
          const av = a.bid?.amount ?? Infinity
          const bv = b.bid?.amount ?? Infinity
          return av - bv
        }
        case 'newest':
        default: return +new Date(b.respondedAt) - +new Date(a.respondedAt)
      }
    })
    return sorted
  }, [responses, filter, sort])

  const awardedResponse = responses.find(r => stateFor(r) === 'accepted')
  const canCompare = responses.filter(r => r.bid).length >= 2

  const selectStyle = { border: '1px solid var(--hz-border)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }

  function viewProfile(r: ContractorResponse) {
    onNavigate('contractor-profile', {
      professional_id: r.professionalId ?? '',
      organization_id: r.organizationId ?? '',
      ...(effectiveProjectId ? { project_id: effectiveProjectId } : {}),
    })
  }
  function viewBid(r: ContractorResponse) {
    if (!r.bid) return
    onNavigate('bid-detail', { bid_id: r.bid.id, project_id: effectiveProjectId ?? '' })
  }

  const filters: { id: FilterId; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'awaiting', label: 'Awaiting Response' },
    { id: 'received', label: 'Bids Received' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="bids" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
      <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="h-14 flex items-center px-4 sm:px-6 lg:px-8">
          <HIcon size={26} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[980px] mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Bids Received</h1>
            <p className="text-[13.5px] text-[var(--hz-ink-muted)] mt-1.5 mb-0" style={{ fontFamily: FONT_BODY }}>
              Review contractor responses and compare proposals for your project.
            </p>
          </div>

          {!effectiveProjectId ? (
            <SectionCard>
              <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Select a project to view contractor responses.</p>
            </SectionCard>
          ) : (
            <>
              {/* Project context */}
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

              {awardedResponse ? (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-14">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}><CheckBadgeIcon size={22} /></div>
                  <p className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Contractor selected</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('estimate-dashboard')}
                    className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0"
                    style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                  >
                    View Project →
                  </button>
                </div>
              ) : responses.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-surface-muted)' }}><EmptyIcon /></div>
                  <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>No contractors invited yet.</p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[340px]" style={{ fontFamily: FONT_BODY }}>
                    Find contractors for your project and invite them to submit proposals.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('find-contractors')}
                    className="mt-1 h-10 px-5 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0"
                    style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                  >
                    Find Contractors →
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Contractors Invited" value={counts.invited} />
                    <StatCard label="Bids Received" value={counts.received} />
                    <StatCard label="Awaiting Response" value={counts.awaiting} />
                    <StatCard label="Accepted" value={counts.accepted} />
                  </div>

                  {counts.received === 0 && (
                    <div className="rounded-[14px] p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
                      <ClockIcon />
                      <div>
                        <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Waiting for contractor responses</p>
                        <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>
                          You have invited contractors to this project. Their proposals will appear here when submitted.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Filters + sort */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {filters.map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFilter(f.id)}
                          className={`h-9 px-3.5 rounded-[10px] text-[12.5px] font-medium cursor-pointer ${filter === f.id ? 'bg-[var(--hz-primary-soft)] text-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] text-[var(--hz-ink-muted)]'}`}
                          style={{ border: filter === f.id ? '1px solid var(--hz-primary)' : '1px solid var(--hz-border-strong)', fontFamily: FONT_BODY }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value as SortId)} className="h-9 rounded-[10px] px-3 text-[12.5px] bg-[var(--hz-surface)] cursor-pointer" style={selectStyle}>
                      <option value="newest">Newest response first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest">Highest bid</option>
                      <option value="lowest">Lowest bid</option>
                    </select>
                  </div>

                  {canCompare && (
                    <button
                      type="button"
                      onClick={() => onNavigate('compare-bids', { project_id: effectiveProjectId })}
                      className="self-start h-10 px-5 rounded-[12px] text-[13px] font-semibold text-white cursor-pointer border-0"
                      style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                    >
                      Compare Bids →
                    </button>
                  )}

                  {/* Response list */}
                  {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filtered.map(r => (
                        <ResponseCard key={r.key} response={r} onViewProfile={() => viewProfile(r)} onViewBid={() => viewBid(r)} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-[var(--hz-ink-subtle)] text-center py-8" style={{ fontFamily: FONT_BODY }}>No responses match this filter.</p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
