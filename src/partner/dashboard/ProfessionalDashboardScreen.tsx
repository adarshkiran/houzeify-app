import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { greetingWord } from '@/data/homeownerDashboard'
import { companyInitials } from '@/data/companyInformation'
import { parseVerificationStatus, VERIFICATION_STATUS_LABELS } from '@/data/organizationSetup'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { SPECIALIZATION_LABELS, type Specialization } from '@/data/professionalSpecialization'
import {
  getIdentityVerificationStatus,
  resolvePartnerAccessLevel,
  devSimulateIdentityApproval,
} from '@/data/identityVerification'
import {
  PROFESSIONAL_DASHBOARD_ROUTES,
  getProfessionalDashboardStats,
  buildProfileChecklist,
  profileCompletionPercent,
  nextIncompleteProfileScreen,
  opportunityLabelForProfessionalType,
} from '@/data/professionalDashboard'
import { getInvitationsForProfessional, INVITATION_STATUS_LABELS } from '@/data/invitations'
import { getBidsForProfessional } from '@/data/bids'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 029 — Professional AI Dashboard ─────────────────────────────────
// Replaces the earlier temporary placeholder (which existed only to fix
// professional routing). role stays the sole decision for which dashboard a
// user lands on — this screen never re-derives or overrides it; it only
// personalizes content using professionalType/accountType, exactly as its
// brief requires.
//
// No Opportunity/Message/Notification model exists yet anywhere in this
// codebase, so those sections always show their real empty state — never
// fabricated counts or cards.
//
// "Project Invitations" (added alongside the 062/063 invitation flow) is
// one exception — invitations.ts is real, and getInvitationsForProfessional()
// reads this professional's own real, active invitations. Never a second
// invitation model.
//
// "Active Projects" is the other exception — an accepted Bid (bids.ts's own
// getBidsForProfessional(), filtered to status 'accepted') already IS this
// professional's real active-project record (see bids.ts's own comment: no
// separate Award/ActiveProject model exists, or is needed). Each card links
// into UpdateProgressScreen.tsx, the seam projectProgress.ts's own
// createProgressUpdate() was reserved for.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention


// ─── Icons ──────────────────────────────────────────────────────────────

const PinIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const CheckIcon = ({ size = 9 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M8 3l4 4-4 4" /></svg>
)
const LockIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6.5" width="8" height="6" rx="1.2" /><path d="M4.7 6.5V4.5a2.3 2.3 0 0 1 4.6 0v2" /></svg>
)

// ─── Sidebar ────────────────────────────────────────────────────────────
// Houzeify 2.0 Module 01 — this screen's own local Sidebar/NavItem (byte-
// different from DiscoverProjectsScreen's and MyBidsScreen's own copies)
// has been replaced by the shared PartnerNavRail, the same consolidation
// the homeowner side already went through for shared/components/Sidebar.tsx.
// See PartnerNavRail.tsx for the new construction-platform primary nav.

function MobileTopBar({ userInitials, onNavigate }: { userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Home</span>
      </div>
      <button onClick={() => onNavigate(PROFESSIONAL_DASHBOARD_ROUTES.manageProfile)} aria-label="Open profile" className="w-8 h-8 rounded-full bg-[#722ED1] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer border-0" style={{ fontFamily: '"Google Sans Flex:Bold", sans-serif' }}>
        {userInitials}
      </button>
    </div>
  )
}

// ─── Shared bits ────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] bg-white border border-[#E3DDD7] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[22px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{value}</span>
      <span className="text-[11.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </div>
  )
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

// 11G — onCtaClick lets a caller wire this button to a real, already-existing
// destination (Discover Projects) instead of the default "Coming soon" stub.
// Callers that don't pass it (Project Invitations, Active Projects) are
// completely unaffected.
function EmptyState({ message, ctaLabel, onCtaClick, ctaLocked }: { message: string; ctaLabel?: string; onCtaClick?: () => void; ctaLocked?: boolean }) {
  const isDisabled = !onCtaClick || ctaLocked
  return (
    <div className="flex flex-col items-center text-center gap-2.5 py-6">
      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{message}</p>
      {ctaLabel && (
        <button
          type="button"
          disabled={isDisabled}
          aria-disabled={isDisabled}
          title={ctaLocked ? 'Locked until your identity is verified' : onCtaClick ? undefined : 'Coming soon'}
          onClick={onCtaClick && !ctaLocked ? onCtaClick : undefined}
          className={[
            'h-9 px-3.5 rounded-[9px] text-[12.5px] font-semibold border transition-colors',
            !isDisabled ? 'cursor-pointer border-[#E3DDD7] bg-white text-[#722ED1] hover:border-[#722ED1]' : 'cursor-not-allowed border-[#E3DDD7] bg-[#FFFFFF] text-[#9A949D]',
          ].join(' ')}
          style={{ fontFamily: FONT_BODY }}
        >
          {ctaLabel}{!onCtaClick && ' · Coming soon'}
        </button>
      )}
    </div>
  )
}

type ChecklistItemView = { id: string; label: string; complete: boolean }

function ChecklistRow({ item }: { item: ChecklistItemView }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: item.complete ? '#16A34A' : 'transparent', border: item.complete ? 'none' : '1.5px solid #CAC7C6' }}
        aria-hidden="true"
      >
        {item.complete && <CheckIcon size={8} />}
      </span>
      <span className="text-[13px]" style={{ fontFamily: FONT_BODY, color: item.complete ? '#1E1E1E' : '#A1A1A1' }}>{item.label}</span>
    </div>
  )
}

// ─── Sign out — Flow 05 (Partner Authentication & Entry) ───────────────────
// Same confirm-modal pattern as HomeownerProfileScreen's own SignOutModal
// (this codebase's established per-file-duplication convention), not a
// shared component — copy adjusted for the professional context.

function SignOutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
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
      <div role="dialog" aria-modal="true" aria-labelledby="partner-signout-title" aria-describedby="partner-signout-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="partner-signout-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Sign out of Houzeify?</h2>
        <p id="partner-signout-desc" className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>You can sign back in anytime to access your professional workspace.</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#DC2626', fontFamily: FONT_BODY }}>Sign out</button>
        </div>
      </div>
    </>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function ProfessionalDashboardScreen({
  organizationId = 'org-demo-001',
  companyName,
  location,
  accountType,
  professionalType,
  professionalTypeOther,
  specialization,
  specializationOther,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  invitedCount,
  projectId,
  projectName,
  propertyType,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  location?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  /** Real value from the Professional Specialization step — only set for
   *  the 4 professional types that have one. Absent otherwise, in which
   *  case the badge below falls back to the professional-type label
   *  exactly as it always has. */
  specialization?: string
  specializationOther?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  invitedCount?: string
  /** The current session's own homeowner project context (same shared
   *  projectData bag, same single-persona-demo convention already used by
   *  contractorDirectory.ts) — used only to render real project name/type
   *  for this professional's real invitations below. */
  projectId?: string
  projectName?: string
  propertyType?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const [askInput, setAskInput] = useState('')
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const signOutConfirmed = () => { setShowSignOutModal(false); onNavigate('welcome') }

  // Part 3 — access gating. Identity verification (a separate, real-ID
  // check — not the existing Business `verificationStatus` prop above)
  // gates only the Discover Projects/Opportunities surface. Loaded the
  // same way BusinessVerificationScreen loads its own identity status.
  const [identityStatus, setIdentityStatus] = useState(() => getIdentityVerificationStatus(CURRENT_USER_ID).status)
  const accessLevel = resolvePartnerAccessLevel(identityStatus)
  const opportunitiesLocked = accessLevel === 'limited'
  function handleSimulateIdentityApproval() {
    const record = devSimulateIdentityApproval(CURRENT_USER_ID)
    setIdentityStatus(record.status)
  }

  const isOrganization = accountType === 'organization'
  const invitations = getInvitationsForProfessional(isOrganization ? null : CURRENT_USER_ID, isOrganization ? organizationId : null)
  // This session's own accepted bids — each one is a real active project
  // this professional is currently working (see the header comment above).
  const activeProjectBids = getBidsForProfessional(CURRENT_USER_ID).filter(b => b.status === 'accepted')
  const resolvedVerification = parseVerificationStatus(verificationStatus)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title
  const specializationLabel = specialization === 'other-specialization'
    ? (specializationOther || 'Other')
    : specialization ? SPECIALIZATION_LABELS[specialization as Specialization] : undefined
  const displayProfessionLabel = specializationLabel ?? professionalTypeLabel
  const displayName = companyName || (isOrganization ? 'Your organization' : 'there')
  const initials = companyInitials(displayName)

  const checklist = buildProfileChecklist({
    hasProfessionalType: Boolean(professionalType),
    isOrganization,
    hasCompanyName: Boolean(companyName),
    verificationStatus: resolvedVerification,
    hasServices: Boolean(serviceCategories),
    hasServiceLocations: Boolean(serviceLocations),
    hasPortfolioProjects: Number(portfolioProjectCount) > 0,
    hasTeamMembers: Number(invitedCount) > 0,
  })
  const strengthPct = profileCompletionPercent(checklist)
  const stats = getProfessionalDashboardStats(strengthPct)
  const nextProfileScreen = nextIncompleteProfileScreen(checklist)
  const opportunitiesLabel = opportunityLabelForProfessionalType(professionalType as ProfessionalType | undefined)

  function handleAskHozie(prompt?: string) {
    onNavigate(PROFESSIONAL_DASHBOARD_ROUTES.aiAdvisor, {
      onboarding_context: 'professional-dashboard',
      organization_id: organizationId,
      ...(professionalType ? { professional_type: professionalType } : {}),
      ...(prompt ? { prompt } : {}),
    })
  }

  // Bridges a direct invitation into the existing Submit Bid screen (032) —
  // opportunity_id carries the invitation's own real projectId, so the
  // resulting Bid.opportunityId equals ProjectInvitation.projectId, never a
  // fabricated id. invitation_id lets 032 source its header from real
  // project context instead of a ProjectOpportunity lookup.
  function handleSubmitProposal(invitationId: string, invitationProjectId: string) {
    onNavigate('submit-bid', { opportunity_id: invitationProjectId, invitation_id: invitationId })
  }

  return (
    <>
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <PartnerNavRail active="home" onNavigate={onNavigate} organizationId={organizationId} opportunitiesLocked={opportunitiesLocked} onSignOut={() => setShowSignOutModal(true)} />

      <div className="flex-1 flex flex-col min-w-0 relative overflow-y-auto">
        <MobileTopBar userInitials={initials} onNavigate={onNavigate} />

        <main className="flex-1 relative z-10 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 w-full">
          <div className="w-full flex flex-col gap-6" style={{ maxWidth: 1100, margin: '0 auto' }}>

            {/* Greeting */}
            <div className="flex flex-col gap-2">
              <h1 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                {greetingWord()}, {displayName}.
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {displayProfessionLabel && (
                  <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white border border-[#E3DDD7] text-[#242326] font-semibold text-[12px]" style={{ fontFamily: FONT_BODY }}>
                    {displayProfessionLabel}
                  </span>
                )}
                <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white border border-[#E3DDD7] text-[#242326] font-semibold text-[12px]" style={{ fontFamily: FONT_BODY }}>
                  {isOrganization ? 'Organization' : 'Individual Professional'}
                </span>
                {location && (
                  <span className="flex items-center gap-1 text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                    <PinIcon /> {location}
                  </span>
                )}
              </div>
            </div>

            {/* Identity verification gate — Part 3 of the access-gating plan.
                Shown whenever accessLevel is 'limited'; disappears the moment
                identity status becomes 'verified'. The dev-only affordance is
                the sole way to reach 'verified' in this backend-less demo. */}
            {opportunitiesLocked && (
              <div className="flex items-center justify-between gap-3 flex-wrap rounded-[12px] border border-[#F5CD7C] bg-[#FFF8E8] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <LockIcon size={14} />
                  <p className="text-[12.5px] text-[#8A6116] m-0" style={{ fontFamily: FONT_BODY }}>
                    Verification pending — Houzeify is reviewing your identity. Some features are limited until you're verified.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateIdentityApproval}
                  className="shrink-0 h-7 px-2.5 rounded-full text-[10.5px] font-semibold cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:text-[#722ED1] hover:border-[#722ED1] transition-colors"
                  style={{ fontFamily: FONT_BODY }}
                  title="Development-only affordance — simulates a backend approving your identity verification."
                >
                  DEV · Simulate approval
                </button>
              </div>
            )}

            {/* Hozie AI card */}
            <div className="rounded-[18px] p-5 sm:p-6 flex flex-col gap-4" style={{ background: 'linear-gradient(135deg, #F9F5FF 0%, #F3EAFF 100%)', border: '1px solid rgba(243,234,255,0.10)' }}>
              <div className="flex items-center gap-3">
                <HIcon size={36} />
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Hozie</span>
                  <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Your AI construction assistant</span>
                </div>
              </div>
              <p className="text-[14px] text-[#242326] m-0" style={{ fontFamily: FONT_BODY }}>What would you like to work on today?</p>
              <div className="flex items-center border rounded-[12px] bg-white h-[48px] overflow-hidden border-[#E3DDD7] focus-within:border-[#722ED1] transition-colors">
                <input
                  type="text"
                  value={askInput}
                  onChange={e => setAskInput(e.target.value)}
                  placeholder="Ask Hozie..."
                  className="flex-1 h-full px-4 text-[14px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                  style={{ fontFamily: FONT_BODY }}
                />
                <button
                  type="button"
                  onClick={() => handleAskHozie(askInput.trim() || undefined)}
                  className="h-full px-5 shrink-0 text-[13px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all flex items-center gap-1.5"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Ask Hozie <ArrowRightIcon />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Review my opportunities', 'Help me prepare a bid', 'Analyze a project', 'Help me improve my profile'].map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAskHozie(suggestion)}
                    className="h-8 px-3 rounded-full text-[12px] font-semibold cursor-pointer border border-[#E3DDD7] bg-white text-[#242326] hover:border-[#722ED1] hover:text-[#722ED1] transition-colors"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard value={String(stats.newOpportunities)} label="New Opportunities" />
              <StatCard value={String(stats.activeBids)} label="Active Bids" />
              {/* Real count from activeProjectBids — not stats.activeProjects,
                  whose own module still honestly zeros it (see that
                  function's comment); this screen now has a real source. */}
              <StatCard value={String(activeProjectBids.length)} label="Active Projects" />
              <StatCard value={stats.profileStrengthPct !== null ? `${stats.profileStrengthPct}%` : '—'} label="Profile Strength" />
            </div>

            {/* Opportunities + Bids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard title="Project Opportunities">
                <p className="text-[12px] text-[#9A949D] -mt-1 m-0" style={{ fontFamily: FONT_BODY }}>{opportunitiesLabel}</p>
                <EmptyState
                  message="No new opportunities yet."
                  ctaLabel="Discover Projects"
                  onCtaClick={() => onNavigate('discover-projects', { organization_id: organizationId })}
                  ctaLocked={opportunitiesLocked}
                />
              </SectionCard>
              <SectionCard title="My Bids">
                <EmptyState
                  message="You haven't submitted any bids yet."
                  ctaLabel="Find Projects"
                  onCtaClick={() => onNavigate('discover-projects', { organization_id: organizationId })}
                  ctaLocked={opportunitiesLocked}
                />
              </SectionCard>
            </div>

            {/* Project Invitations — real invitations.ts data, never fabricated */}
            <SectionCard title="Project Invitations">
              {invitations.length === 0 ? (
                <EmptyState message="No project invitations yet." />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {invitations.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between gap-3 rounded-[12px] border border-[#E3DDD7] p-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Homeowner Project'}</span>
                        <div className="flex items-center gap-1.5 flex-wrap text-[11.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                          {location && <span className="flex items-center gap-1"><PinIcon /> {location}</span>}
                          <span className="text-[#9A949D]">{INVITATION_STATUS_LABELS[inv.status]}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSubmitProposal(inv.id, inv.projectId)}
                        className="shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-[9px] text-[12.5px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        Submit Proposal <ArrowRightIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Active Projects — one card per accepted bid (real, see the
                header comment above) */}
            <SectionCard title="Active Projects">
              {activeProjectBids.length === 0 ? (
                <EmptyState message="No active projects yet." />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {activeProjectBids.map(bid => (
                    <div key={bid.id} className="flex items-center justify-between gap-3 rounded-[12px] border border-[#E3DDD7] p-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Homeowner Project'}</span>
                        <div className="flex items-center gap-1.5 flex-wrap text-[11.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                          {location && <span className="flex items-center gap-1"><PinIcon /> {location}</span>}
                          <span className="text-[#9A949D]">Contractor Selected</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        // Finding 4 fix (Task 9 round 1) — 'update-progress'
                        // (UpdateProgressScreen.tsx) writes to the old
                        // in-memory projectProgress.ts store, which
                        // ProjectProgressScreen.tsx no longer reads from
                        // (Task 6 rewired it to the real daily_progress
                        // backend via useDailyProgress). Routing here
                        // instead, matching the param shape
                        // CreateDailyProgressScreen.tsx/App.tsx's
                        // 'create-daily-progress' registration expects
                        // (project_id/project_name merge straight into
                        // projectData, same as every other project nav
                        // call in this file).
                        onClick={() => onNavigate('create-daily-progress', { project_id: bid.opportunityId, project_name: projectName || 'Homeowner Project' })}
                        className="shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-[9px] text-[12.5px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        Update Progress <ArrowRightIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Profile completion + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SectionCard
                title="Complete your professional profile"
                action={<span className="text-[12px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>{strengthPct}%</span>}
              >
                <div className="flex flex-col divide-y divide-[#CAC7C6]">
                  {checklist.map(item => <ChecklistRow key={item.id} item={item} />)}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(nextProfileScreen, { organization_id: organizationId })}
                  className="self-start mt-1 text-[13px] font-semibold text-[#722ED1] cursor-pointer bg-transparent border-0 hover:underline p-0"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Complete profile →
                </button>
              </SectionCard>

              <SectionCard title="Quick Actions">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Discover Projects', dest: 'discover-projects', locked: opportunitiesLocked },
                    { label: 'My Bids', dest: PROFESSIONAL_DASHBOARD_ROUTES.myBids },
                    { label: 'My Projects', dest: null },
                    { label: 'Manage Profile', dest: PROFESSIONAL_DASHBOARD_ROUTES.manageProfile },
                    { label: 'Team', dest: PROFESSIONAL_DASHBOARD_ROUTES.team },
                    { label: 'Messages', dest: null },
                  ].map(action => {
                    const isDisabled = !action.dest || action.locked
                    return (
                    <button
                      key={action.label}
                      type="button"
                      disabled={isDisabled}
                      title={action.locked ? 'Locked until your identity is verified' : action.dest ? undefined : 'Coming soon'}
                      onClick={() => action.dest && !action.locked && onNavigate(action.dest, { organization_id: organizationId })}
                      className={[
                        'h-10 px-3 rounded-[10px] text-[12.5px] font-semibold border transition-colors text-left',
                        !isDisabled ? 'cursor-pointer border-[#E3DDD7] bg-white text-[#242326] hover:border-[#722ED1] hover:text-[#722ED1]' : 'cursor-not-allowed border-[#E3DDD7] bg-[#FFFFFF] text-[#9A949D]',
                      ].join(' ')}
                      style={{ fontFamily: FONT_BODY }}
                    >
                      <span className="flex items-center gap-1.5">{action.label}{action.locked && <LockIcon size={10} />}</span>
                      {!action.dest && <span className="block text-[10px] text-[#CAC7C6]">Coming soon</span>}
                    </button>
                    )
                  })}
                </div>
              </SectionCard>
            </div>

            {resolvedVerification !== 'verified' && (
              <p className="text-[12px] text-[#9A949D] text-center m-0" style={{ fontFamily: FONT_BODY }}>
                Verification status: {VERIFICATION_STATUS_LABELS[resolvedVerification]}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
    {showSignOutModal && <SignOutModal onCancel={() => setShowSignOutModal(false)} onConfirm={signOutConfirmed} />}
    </>
  )
}
