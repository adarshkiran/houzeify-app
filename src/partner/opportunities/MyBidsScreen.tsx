import { useEffect, useMemo, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { getVisibleBids, formatBidAmount, formatBidDuration, BID_STATUS_LABELS, type Bid, type BidStatus } from '@/data/bids'
import { getOpportunityById, OPPORTUNITY_PROJECT_TYPE_LABELS, type ProjectOpportunity } from '@/data/projectOpportunities'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention (matches Screens 032/033)

// Real statuses only — 'Under Review' is not a value the existing Bid model
// supports (only the homeowner-controlled accept/reject step, not yet
// built, would ever set anything beyond 'submitted'), so it's never shown
// as a tab/filter here. 'withdrawn' has no UI that can set it yet either,
// so it's likewise omitted from the tab list — never inventing a status a
// bid can't actually reach.
const TAB_STATUSES: BidStatus[] = ['submitted', 'accepted', 'rejected']

// ─── Screen 034 — My Bids ────────────────────────────────────────────────────
// Read-only list of the current professional's own submitted bids — reuses
// the Bid store created by Screen 032, never a second bid model. role stays
// the sole canonical persona check, mirroring Screens 029-033.


// ─── Icons ──────────────────────────────────────────────────────────────

const IcoBids = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="12" height="14" rx="1.5" /><line x1="6" y1="6.5" x2="12" y2="6.5" /><line x1="6" y1="9.5" x2="12" y2="9.5" /><line x1="6" y1="12.5" x2="10" y2="12.5" /></svg>
)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7.5" cy="7.5" r="5.5" /><line x1="11.5" y1="11.5" x2="15.5" y2="15.5" /></svg>
)
const PinIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const HomeIconSmall = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8L8 3l6 5" /><path d="M3.5 7v6h9V7" /></svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M8 3l4 4-4 4" /></svg>
)

function statusColor(status: BidStatus): { bg: string; fg: string; dot: string } {
  if (status === 'accepted') return { bg: '#DCFCE7', fg: '#16A34A', dot: '#16A34A' }
  if (status === 'rejected') return { bg: '#FEE2E2', fg: '#DC2626', dot: '#DC2626' }
  if (status === 'withdrawn') return { bg: '#CAC7C6', fg: '#808080', dot: '#A1A1A1' }
  return { bg: '#CAC7C6', fg: '#808080', dot: '#A1A1A1' } // submitted
}

// ─── Sidebar ────────────────────────────────────────────────────────────
// Houzeify 2.0 Module 01 — replaced by the shared PartnerNavRail (see
// ProfessionalDashboardScreen.tsx's matching comment).

// ─── Shared bits ────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] bg-white border border-[#E3DDD7] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[20px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{value}</span>
      <span className="text-[11.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </div>
  )
}

function FilterChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="h-8 px-3 rounded-full text-[12px] font-semibold cursor-pointer border transition-all"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? '#F3EAFF' : '#FFFFFF',
        borderColor: selected ? '#722ED1' : '#CAC7C6',
        color: selected ? '#722ED1' : '#1E1E1E',
      }}
    >
      {label}
    </button>
  )
}

function formatSubmittedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function BidCard({ bid, opportunity, onViewProject, onViewBid }: { bid: Bid; opportunity: ProjectOpportunity | undefined; onViewProject: () => void; onViewBid: () => void }) {
  const colors = statusColor(bid.status)
  return (
    <div className="flex flex-col gap-2.5 rounded-[16px] bg-white border border-[#E3DDD7] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onViewProject} className="text-left text-[14.5px] font-semibold text-[#242326] leading-tight cursor-pointer bg-transparent border-0 p-0 hover:text-[#722ED1] hover:underline" style={{ fontFamily: FONT_HEAD }}>
          {opportunity?.title ?? 'Project no longer available'}
        </button>
        <span className="shrink-0 flex items-center gap-1.5 h-6 px-2 rounded-full text-[10.5px] font-semibold tracking-[0.04em] uppercase" style={{ fontFamily: FONT_MONO, backgroundColor: colors.bg, color: colors.fg }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
          {BID_STATUS_LABELS[bid.status]}
        </span>
      </div>

      {opportunity && (
        <div className="flex items-center gap-1.5 flex-wrap text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
          <span className="flex items-center gap-1"><HomeIconSmall /> {OPPORTUNITY_PROJECT_TYPE_LABELS[opportunity.projectType]}</span>
          <span className="text-[#CAC7C6]">·</span>
          <span className="flex items-center gap-1"><PinIcon /> {opportunity.city}</span>
        </div>
      )}

      <div className="flex flex-col gap-0.5 pt-1">
        <span className="text-[10px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Your bid</span>
        <span className="text-[17px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{formatBidAmount(bid.amount)}</span>
      </div>

      <div className="flex items-center justify-between text-[12.5px]" style={{ fontFamily: FONT_BODY }}>
        <span className="text-[#68636D]">{formatBidDuration(bid.duration, bid.durationUnit)}</span>
        <span className="text-[#9A949D]">Submitted {formatSubmittedDate(bid.createdAt)}</span>
      </div>

      <button
        type="button"
        onClick={onViewBid}
        className="self-start mt-1 flex items-center gap-1.5 h-9 px-3.5 rounded-[9px] text-[12.5px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all"
        style={{ fontFamily: FONT_BODY }}
      >
        View Bid <ArrowRightIcon />
      </button>
    </div>
  )
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest'
const SORT_LABELS: Record<SortOption, string> = { newest: 'Newest', oldest: 'Oldest', highest: 'Highest Bid', lowest: 'Lowest Bid' }

// ─── Main screen ──────────────────────────────────────────────────────────

export default function MyBidsScreen({
  role,
  organizationId,
  companyName,
  accountType,
  onNavigate,
}: {
  /** Canonical top-level persona ('homeowner' | 'professional'), resolved
   *  once at Screen 007 and passed down by App.tsx. Never primaryIntent,
   *  never Boolean(professionalType). */
  role?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // ROLE SAFETY — same reverse guard as Screens 029-033.
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const isOrganization = accountType === 'organization'
  const bidOrganizationId = isOrganization ? (organizationId ?? null) : null

  const [query, setQuery] = useState('')
  const [statusTab, setStatusTab] = useState<'all' | BidStatus>('all')
  const [sort, setSort] = useState<SortOption>('newest')

  const myBids = useMemo(() => getVisibleBids(CURRENT_USER_ID, bidOrganizationId), [bidOrganizationId])
  const opportunitiesById = useMemo(() => {
    const map = new Map<string, ProjectOpportunity | undefined>()
    for (const bid of myBids) if (!map.has(bid.opportunityId)) map.set(bid.opportunityId, getOpportunityById(bid.opportunityId))
    return map
  }, [myBids])

  const counts = useMemo(() => ({
    total: myBids.length,
    submitted: myBids.filter(b => b.status === 'submitted').length,
    accepted: myBids.filter(b => b.status === 'accepted').length,
    rejected: myBids.filter(b => b.status === 'rejected').length,
  }), [myBids])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = myBids
    if (statusTab !== 'all') list = list.filter(b => b.status === statusTab)
    if (q) {
      list = list.filter(b => {
        const opp = opportunitiesById.get(b.opportunityId)
        const haystack = `${opp?.title ?? ''} ${opp?.location ?? ''} ${opp?.city ?? ''}`.toLowerCase()
        return haystack.includes(q)
      })
    }
    const sorted = [...list]
    switch (sort) {
      case 'newest': sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break
      case 'oldest': sorted.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)); break
      case 'highest': sorted.sort((a, b) => b.amount - a.amount); break
      case 'lowest': sorted.sort((a, b) => a.amount - b.amount); break
    }
    return sorted
  }, [myBids, statusTab, query, sort, opportunitiesById])

  function handleBack() {
    onNavigate('professional-dashboard')
  }
  function handleDiscoverProjects() {
    onNavigate('discover-projects')
  }
  function handleViewProject(bid: Bid) {
    onNavigate('project-opportunity-detail', { opportunity_id: bid.opportunityId })
  }
  // No dedicated bid-detail screen exists yet — reuse the existing
  // opportunity detail, the smallest existing navigation available, rather
  // than inventing Screen 035.
  function handleViewBid(bid: Bid) {
    onNavigate('project-opportunity-detail', { opportunity_id: bid.opportunityId, bid_id: bid.id })
  }

  const hasAnyFilter = query.trim() !== '' || statusTab !== 'all'

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <PartnerNavRail active="bids" onNavigate={onNavigate} organizationId={organizationId} />

      <div className="flex-1 flex flex-col min-w-0 relative overflow-y-auto">

        <main className="flex-1 relative z-10 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 w-full">
          <div className="w-full flex flex-col gap-6" style={{ maxWidth: 1100, margin: '0 auto' }}>

            {/* Header */}
            <div className="flex flex-col gap-2">
              <button type="button" onClick={handleBack} className="self-start text-[12.5px] font-semibold text-[#68636D] cursor-pointer bg-transparent border-0 hover:text-[#242326] hover:underline p-0 mb-1" style={{ fontFamily: FONT_BODY }}>
                ← Back to Dashboard
              </button>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  My Bids
                </h1>
                {isOrganization && companyName && (
                  <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white border border-[#E3DDD7] text-[#722ED1] font-semibold text-[12px]" style={{ fontFamily: FONT_BODY }}>
                    {companyName}
                  </span>
                )}
              </div>
              <p className="text-[13.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                Track the projects you&apos;ve submitted proposals for.
              </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard value={String(counts.total)} label="Total Bids" />
              <StatCard value={String(counts.submitted)} label="Submitted" />
              <StatCard value={String(counts.accepted)} label="Accepted" />
              <StatCard value={String(counts.rejected)} label="Rejected" />
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <FilterChip label="All" selected={statusTab === 'all'} onClick={() => setStatusTab('all')} />
              {TAB_STATUSES.map(s => (
                <FilterChip key={s} label={BID_STATUS_LABELS[s]} selected={statusTab === s} onClick={() => setStatusTab(s)} />
              ))}
            </div>

            {/* Search + sort */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center border rounded-[12px] bg-white h-[44px] overflow-hidden transition-colors border-[#E3DDD7] focus-within:border-[#722ED1]" style={{ maxWidth: 420, flex: 1, minWidth: 220 }}>
                <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[#9A949D]"><SearchIcon /></div>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search bids..."
                  aria-label="Search bids by project name or location"
                  className="flex-1 h-full pr-4 text-[14px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                  style={{ fontFamily: FONT_BODY }}
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                  <FilterChip key={opt} label={SORT_LABELS[opt]} selected={sort === opt} onClick={() => setSort(opt)} />
                ))}
              </div>
            </div>

            {hasAnyFilter && (
              <button
                type="button"
                onClick={() => { setQuery(''); setStatusTab('all') }}
                className="self-start -mt-3 text-[12px] font-semibold text-[#722ED1] cursor-pointer bg-transparent border-0 hover:underline p-0"
                style={{ fontFamily: FONT_BODY }}
              >
                Clear all filters
              </button>
            )}

            {/* Bid list */}
            {myBids.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white border border-dashed border-[#E3DDD7] p-10">
                <span className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}><IcoBids /></span>
                <p className="text-[14px] text-[#242326] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>No bids yet</p>
                <p className="text-[13px] text-[#68636D] leading-[1.6] m-0 max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
                  Projects you bid on will appear here.
                </p>
                <button type="button" onClick={handleDiscoverProjects} className="h-10 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all flex items-center gap-1.5 mt-1" style={{ fontFamily: FONT_BODY }}>
                  Discover Projects <ArrowRightIcon />
                </button>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-2.5 rounded-[16px] bg-white border border-dashed border-[#E3DDD7] p-10">
                <p className="text-[13.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No bids match your filters.</p>
                <button type="button" onClick={() => { setQuery(''); setStatusTab('all') }} className="text-[12.5px] font-semibold text-[#722ED1] cursor-pointer bg-transparent border-0 hover:underline p-0" style={{ fontFamily: FONT_BODY }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map(bid => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    opportunity={opportunitiesById.get(bid.opportunityId)}
                    onViewProject={() => handleViewProject(bid)}
                    onViewBid={() => handleViewBid(bid)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
