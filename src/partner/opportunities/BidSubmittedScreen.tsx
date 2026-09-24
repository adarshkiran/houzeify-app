import { useEffect } from 'react'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { getBidById, formatBidAmount, formatBidDuration, BID_STATUS_LABELS } from '@/data/bids'
import { getOpportunityById, OPPORTUNITY_PROJECT_TYPE_LABELS } from '@/data/projectOpportunities'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 033 — Bid Submitted ─────────────────────────────────────────────
// Pure confirmation screen — no bid form here. Loads the actual Bid (and its
// Opportunity) from the existing stores created by Screen 032; never
// creates a new bid or opportunity. role stays the sole canonical persona
// check, mirroring Screens 029-032.


// ─── Icons — same success-check shape already established on Screen 028 ────

const BigCheckIcon = () => (
  <svg width="30" height="30" viewBox="0 0 34 34" fill="none"><path d="M8 17.5L14 23.5L26 10.5" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const PinIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const HomeIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8L8 3l6 5" /><path d="M3.5 7v6h9V7" /></svg>
)
const BellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a3.5 3.5 0 0 0-3.5 3.5v2c0 .7-.3 1.4-.8 1.9L3 10.5h10L12.3 9.4c-.5-.5-.8-1.2-.8-1.9v-2A3.5 3.5 0 0 0 8 2Z" /><path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" /></svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M8 3l4 4-4 4" /></svg>
)
const EmptyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5l5 5M14.5 9.5l-5 5" /></svg>
)

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

function formatSubmittedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function BidSubmittedScreen({
  bidId,
  role,
  companyName,
  onNavigate,
}: {
  bidId?: string
  /** Canonical top-level persona ('homeowner' | 'professional'), resolved
   *  once at Screen 007 and passed down by App.tsx — the sole check for
   *  whether this screen is reachable. Never primaryIntent, never
   *  Boolean(professionalType). */
  role?: string
  companyName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // ROLE SAFETY — same reverse guard as Screens 029-032.
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const bid = bidId ? getBidById(bidId) : undefined
  const opportunity = bid ? getOpportunityById(bid.opportunityId) : undefined

  function handleBackToProjects() {
    onNavigate('discover-projects')
  }

  if (!bid) {
    return (
      <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>
        <header className="shrink-0 relative z-10">
          <div className="flex items-center justify-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
            <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-5 py-10 text-center relative z-10">
          <span className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: '#F4F0EC', color: '#9A949D' }}><EmptyIcon /></span>
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Bid not found.</p>
          <button type="button" onClick={handleBackToProjects} className="h-10 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>
            ← Back to Projects
          </button>
        </main>
      </div>
    )
  }

  function handleViewMyBids() {
    onNavigate('my-bids', { bid_id: bid!.id })
  }
  function handleDiscoverMore() {
    onNavigate('discover-projects')
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col items-center gap-6" style={{ maxWidth: 700 }}>

          {/* Success visual */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative w-[72px] h-[72px] flex items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(243,234,255,0.10)', filter: 'blur(16px)' }} />
              <span className="relative w-[62px] h-[62px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#722ED1', boxShadow: '0 8px 26px rgba(243,234,255,0.10)' }}>
                <BigCheckIcon />
              </span>
            </div>
            <div className="flex flex-col items-center gap-2.5">
              <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Bid Submitted</span>
              <h1 className="text-[24px] sm:text-[30px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                Bid submitted successfully
              </h1>
              <p className="text-[13.5px] sm:text-[14.5px] text-[#68636D] leading-[1.6] m-0 max-w-[440px]" style={{ fontFamily: FONT_BODY }}>
                Your bid has been sent to the homeowner.
              </p>
            </div>
          </div>

          {/* Bid summary card */}
          <div className="w-full rounded-[18px] bg-white border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            {opportunity && (
              <div className="flex flex-col gap-1 pb-3 border-b border-[#E3DDD7]">
                <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{opportunity.title}</span>
                <div className="flex items-center gap-1.5 flex-wrap text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                  <span className="flex items-center gap-1"><HomeIconSmall /> {OPPORTUNITY_PROJECT_TYPE_LABELS[opportunity.projectType]}</span>
                  <span className="text-[#CAC7C6]">·</span>
                  <span className="flex items-center gap-1"><PinIcon /> {opportunity.location}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col divide-y divide-[#CAC7C6]">
              <SummaryRow label="Your bid" value={formatBidAmount(bid.amount)} />
              <SummaryRow label="Duration" value={formatBidDuration(bid.duration, bid.durationUnit)} />
              {bid.proposedStartDate && <SummaryRow label="Proposed start" value={formatSubmittedDate(bid.proposedStartDate)} />}
              <SummaryRow label="Submitted" value={formatSubmittedDate(bid.createdAt)} />
              {companyName && <SummaryRow label="Submitted by" value={companyName} />}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11.5px] font-semibold" style={{ fontFamily: FONT_MONO, backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                {BID_STATUS_LABELS[bid.status]}
              </span>
            </div>
          </div>

          {/* What happens next */}
          <div className="w-full rounded-[16px] p-5 flex flex-col gap-2" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
            <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>What happens next?</span>
            <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
              The homeowner can review your proposal and compare it with other bids. You&apos;ll be notified if they respond or select your bid.
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[#722ED1] shrink-0"><BellIcon /></span>
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>You&apos;ll receive notifications about updates to this bid.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto pt-1">
            <button
              type="button"
              onClick={handleViewMyBids}
              aria-label="View my bids"
              className="h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 px-6 flex items-center justify-center gap-2 bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99] w-full sm:w-auto"
              style={{ fontFamily: FONT_BODY }}
            >
              View My Bids <ArrowRightIcon />
            </button>
            <button
              type="button"
              onClick={handleDiscoverMore}
              aria-label="Discover more projects"
              className="h-[52px] text-[13.5px] font-medium rounded-[12px] px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#242326] hover:border-[#722ED1] transition-colors w-full sm:w-auto"
              style={{ fontFamily: FONT_BODY }}
            >
              Discover More Projects →
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 flex justify-center items-center gap-2.5 pb-6 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
