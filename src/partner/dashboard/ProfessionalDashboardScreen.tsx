// ─── Screen 01 — Company Home (MODIFY) ───────────────────────────────────────
// PartnerNavRail Home. Construction Record landing for the company:
// real org rollups from C19 progress-summary + C23 ops-summary.
// Business Development (invitations/bids/opportunities) stays reachable but
// is demoted — never the hero when the org has real projects (C12 protect).

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
  buildProfileChecklist,
  profileCompletionPercent,
  nextIncompleteProfileScreen,
} from '@/data/professionalDashboard'
import { useOrganizations } from '@/data/organizationState'
import {
  describeOrganizationProgressError,
  getOrganizationProgressSummary,
  type OrganizationProgressSummary,
} from '@/data/organizationProgressApi'
import {
  describeOrganizationOpsError,
  formatOpsPriority,
  formatOpsStatus,
  getOrganizationOpsSummary,
  type OrganizationOpsSummary,
} from '@/data/organizationOpsApi'
import {
  buildCompanyHomeOpenItems,
  buildCompanyHomeRecentProgress,
  buildCompanyHomeStats,
} from '@/data/companyHomeRollup'
import { constructionStages } from '@/data/constructionStages'
import { COMPANY_NAV_ROUTES } from '@/data/constructionNav'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

/** Demo identity used only for local identity-verification gating of BD. */
const IDENTITY_USER_ID = 'user-demo-001'

const PinIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const CheckIcon = ({ size = 9 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" /></svg>
)
const LockIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6.5" width="8" height="6" rx="1.2" /><path d="M4.7 6.5V4.5a2.3 2.3 0 0 1 4.6 0v2" /></svg>
)

function stageLabel(stage: string | null): string {
  if (!stage) return 'Stage not set'
  return constructionStages.find(s => s.id === stage)?.name ?? stage
}

function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function MobileTopBar({ userInitials, onNavigate }: { userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Home</span>
      </div>
      <button
        type="button"
        onClick={() => onNavigate(COMPANY_NAV_ROUTES.profile)}
        aria-label="Open company profile"
        className="min-w-11 min-h-11 w-11 h-11 rounded-full bg-[var(--hz-primary)] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer border-0"
        style={{ fontFamily: '"Geist Variable", sans-serif' }}
      >
        {userInitials}
      </button>
    </div>
  )
}

function StatCard({
  value,
  label,
  onOpen,
}: {
  value: string
  label: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-1 rounded-[14px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-4 text-left cursor-pointer min-h-[88px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)] hover:border-[var(--hz-primary)] transition-colors"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <span className="text-[22px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{value}</span>
      <span className="text-[11.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </button>
  )
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function EmptyState({
  message,
  ctaLabel,
  onCtaClick,
}: {
  message: string
  ctaLabel?: string
  onCtaClick?: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center gap-2.5 py-6">
      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>{message}</p>
      {ctaLabel && onCtaClick && (
        <button
          type="button"
          onClick={onCtaClick}
          className="min-h-11 h-11 px-4 rounded-[10px] text-[12.5px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-primary)] hover:border-[var(--hz-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
          style={{ fontFamily: FONT_BODY }}
        >
          {ctaLabel}
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
      <span className="text-[13px]" style={{ fontFamily: FONT_BODY, color: item.complete ? 'var(--hz-black)' : '#A1A1A1' }}>{item.label}</span>
    </div>
  )
}

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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-signout-title"
        aria-describedby="partner-signout-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="partner-signout-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Sign out of Houzeify?</h2>
        <p id="partner-signout-desc" className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>You can sign back in anytime to access your company workspace.</p>
        <div className="flex gap-2.5 justify-end">
          <button type="button" onClick={onCancel} className="min-h-11 h-11 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} type="button" onClick={onConfirm} className="min-h-11 h-11 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-danger)', fontFamily: FONT_BODY }}>Sign out</button>
        </div>
      </div>
    </>
  )
}

export default function ProfessionalDashboardScreen({
  organizationId: organizationIdProp,
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
  role,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  location?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  specialization?: string
  specializationOther?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  invitedCount?: string
  role?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessional = role === undefined || role === 'professional'
  useEffect(() => {
    if (role !== undefined && !isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate, role])

  const organizations = useOrganizations()
  const currentOrganization = organizations.currentOrganization
  const organizationId = currentOrganization?.id ?? organizationIdProp ?? null
  const orgName = currentOrganization?.name ?? companyName ?? 'Your company'

  const [askInput, setAskInput] = useState('')
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const signOutConfirmed = () => { setShowSignOutModal(false); onNavigate('welcome') }

  const [identityStatus, setIdentityStatus] = useState(() => getIdentityVerificationStatus(IDENTITY_USER_ID).status)
  const accessLevel = resolvePartnerAccessLevel(identityStatus)
  const opportunitiesLocked = accessLevel === 'limited'
  function handleSimulateIdentityApproval() {
    const record = devSimulateIdentityApproval(IDENTITY_USER_ID)
    setIdentityStatus(record.status)
  }

  const [progress, setProgress] = useState<OrganizationProgressSummary | null>(null)
  const [ops, setOps] = useState<OrganizationOpsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!organizationId) {
      setProgress(null)
      setOps(null)
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      getOrganizationProgressSummary(organizationId),
      getOrganizationOpsSummary(organizationId),
    ])
      .then(([progressRow, opsRow]) => {
        if (cancelled) return
        setProgress(progressRow)
        setOps(opsRow)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setProgress(null)
        setOps(null)
        const progressMsg = describeOrganizationProgressError(err)
        const opsMsg = describeOrganizationOpsError(err)
        setError(progressMsg || opsMsg)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [organizationId])

  const isOrganization = accountType === 'organization'
  const resolvedVerification = parseVerificationStatus(verificationStatus)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title
  const specializationLabel = specialization === 'other-specialization'
    ? (specializationOther || 'Other')
    : specialization ? SPECIALIZATION_LABELS[specialization as Specialization] : undefined
  const displayProfessionLabel = specializationLabel ?? professionalTypeLabel
  const displayName = orgName || (isOrganization ? 'Your organization' : 'there')
  const initials = companyInitials(displayName)

  const checklist = buildProfileChecklist({
    hasProfessionalType: Boolean(professionalType),
    isOrganization,
    hasCompanyName: Boolean(companyName || currentOrganization?.name),
    verificationStatus: resolvedVerification,
    hasServices: Boolean(serviceCategories),
    hasServiceLocations: Boolean(serviceLocations),
    hasPortfolioProjects: Number(portfolioProjectCount) > 0,
    hasTeamMembers: Number(invitedCount) > 0,
  })
  const strengthPct = profileCompletionPercent(checklist)
  const nextProfileScreen = nextIncompleteProfileScreen(checklist)

  const stats = buildCompanyHomeStats(progress, ops)
  const recentProgress = buildCompanyHomeRecentProgress(progress)
  const openItems = buildCompanyHomeOpenItems(ops)
  const projectCount = progress?.totals.projectCount ?? ops?.totals.projectCount ?? 0

  function orgNav(screen: string, extra?: Record<string, string>) {
    onNavigate(screen, {
      organization_id: organizationId ?? '',
      company_name: orgName,
      ...extra,
    })
  }

  function openProject(
    screen: string,
    project: {
      projectId: string
      projectName: string
      location: string | null
      propertyType: string | null
      type: string | null
      stage: string | null
      status: string | null
    },
  ) {
    onNavigate(screen, {
      project_id: project.projectId,
      project_name: project.projectName,
      project_type: project.type ?? '',
      location: project.location ?? '',
      property_type: project.propertyType ?? '',
      project_stage: project.stage ?? '',
      project_status: project.status ?? '',
      organization_id: organizationId ?? '',
      company_name: orgName,
    })
  }

  function handleAskHozie(prompt?: string) {
    onNavigate(PROFESSIONAL_DASHBOARD_ROUTES.aiAdvisor, {
      onboarding_context: 'professional-dashboard',
      organization_id: organizationId ?? '',
      ...(professionalType ? { professional_type: professionalType } : {}),
      ...(prompt ? { prompt } : {}),
    })
  }

  if (role !== undefined && !isProfessional) return null

  return (
    <>
      <div className="h-full flex" style={{ backgroundColor: '#FBF9F7' }}>
        <PartnerNavRail
          active="home"
          onNavigate={onNavigate}
          organizationId={organizationId ?? undefined}
          opportunitiesLocked={opportunitiesLocked}
          onSignOut={() => setShowSignOutModal(true)}
        />

        <div className="flex-1 flex flex-col min-w-0 relative overflow-y-auto">
          <MobileTopBar userInitials={initials} onNavigate={onNavigate} />

          <main className="flex-1 relative z-10 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 w-full">
            <div className="w-full flex flex-col gap-6" style={{ maxWidth: 1100, margin: '0 auto' }}>

              <header className="flex flex-col gap-2">
                <p className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-primary)] m-0" style={{ fontFamily: FONT_MONO }}>
                  Company Home
                </p>
                <h1 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  {greetingWord()}, {displayName}.
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  {displayProfessionLabel && (
                    <span className="flex items-center gap-1.5 min-h-7 h-7 px-2.5 rounded-full bg-[var(--hz-surface)] border border-[var(--hz-border)] text-[var(--hz-ink)] font-semibold text-[12px]" style={{ fontFamily: FONT_BODY }}>
                      {displayProfessionLabel}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 min-h-7 h-7 px-2.5 rounded-full bg-[var(--hz-surface)] border border-[var(--hz-border)] text-[var(--hz-ink)] font-semibold text-[12px]" style={{ fontFamily: FONT_BODY }}>
                    {isOrganization ? 'Organization' : 'Individual Professional'}
                  </span>
                  {(location || currentOrganization) && (
                    <span className="flex items-center gap-1 text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                      <PinIcon /> {location || 'Company workspace'}
                    </span>
                  )}
                </div>
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
                  Construction progress, open site work, and project records across your organization.
                </p>
              </header>

              {opportunitiesLocked && (
                <div className="flex items-center justify-between gap-3 flex-wrap rounded-[12px] border border-[#F5CD7C] bg-[#FFF8E8] px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LockIcon size={14} />
                    <p className="text-[12.5px] text-[#8A6116] m-0" style={{ fontFamily: FONT_BODY }}>
                      Verification pending — Business Development opportunities stay limited until identity is verified. Construction Record screens remain available.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateIdentityApproval}
                    className="shrink-0 min-h-11 h-11 px-3 rounded-[10px] text-[12px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:text-[var(--hz-primary)] hover:border-[var(--hz-primary)] transition-colors"
                    style={{ fontFamily: FONT_BODY }}
                    title="Development-only affordance — simulates identity verification approval."
                  >
                    DEV · Simulate approval
                  </button>
                </div>
              )}

              {!organizationId ? (
                <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }}>
                  <HIcon size={36} />
                  <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                    Organization information unavailable.
                  </p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
                    Company Home belongs to your organization workspace — set up your organization first.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('create-organization')}
                    className="min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white"
                    style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                  >
                    Set up organization
                  </button>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }} aria-live="polite">
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                    Loading company construction record…
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }} role="alert">
                  <HIcon size={36} />
                  <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                    Couldn’t load company home
                  </p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true)
                      setError(null)
                      Promise.all([
                        getOrganizationProgressSummary(organizationId),
                        getOrganizationOpsSummary(organizationId),
                      ])
                        .then(([progressRow, opsRow]) => {
                          setProgress(progressRow)
                          setOps(opsRow)
                          setLoading(false)
                        })
                        .catch(err => {
                          setError(describeOrganizationProgressError(err))
                          setLoading(false)
                        })
                    }}
                    className="min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white"
                    style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Company construction summary">
                    {stats.map(stat => (
                      <StatCard
                        key={stat.label}
                        value={stat.value}
                        label={stat.label}
                        onOpen={() => orgNav(stat.dest)}
                      />
                    ))}
                  </div>

                  {projectCount === 0 ? (
                    <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }}>
                      <HIcon size={36} />
                      <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                        No construction projects yet.
                      </p>
                      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                        Create a project to start the Digital Construction Record for your company.
                      </p>
                      <button
                        type="button"
                        onClick={() => orgNav('create-construction-project')}
                        className="min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white"
                        style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                      >
                        Create Project
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <SectionCard
                        title="Recent progress"
                        action={(
                          <button
                            type="button"
                            onClick={() => orgNav(COMPANY_NAV_ROUTES.progress)}
                            className="min-h-11 px-2 text-[12.5px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline"
                            style={{ fontFamily: FONT_BODY }}
                          >
                            View all
                          </button>
                        )}
                      >
                        {recentProgress.length === 0 ? (
                          <EmptyState
                            message="No progress updates yet across your projects."
                            ctaLabel="Open Progress"
                            onCtaClick={() => orgNav(COMPANY_NAV_ROUTES.progress)}
                          />
                        ) : (
                          <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
                            {recentProgress.map(item => (
                              <li key={`${item.projectId}-${item.date}-${item.title}`}>
                                <button
                                  type="button"
                                  onClick={() => openProject('project-progress', item)}
                                  className="w-full flex items-start justify-between gap-3 rounded-[12px] border border-[var(--hz-border)] p-3 text-left cursor-pointer bg-[var(--hz-surface)] hover:border-[var(--hz-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
                                >
                                  <div className="min-w-0 flex flex-col gap-0.5">
                                    <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
                                    <span className="text-[11.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                                      {item.projectName} · {formatDate(item.date)}
                                      {item.visibility === 'customer' ? ' · Shared' : ' · Internal'}
                                    </span>
                                    <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>
                                      {stageLabel(item.stage)}
                                    </span>
                                  </div>
                                  <span className="shrink-0 text-[var(--hz-primary)] mt-1" aria-hidden="true"><ArrowRightIcon /></span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </SectionCard>

                      <SectionCard
                        title="Open site work"
                        action={(
                          <button
                            type="button"
                            onClick={() => orgNav(COMPANY_NAV_ROUTES.siteOperations)}
                            className="min-h-11 px-2 text-[12.5px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline"
                            style={{ fontFamily: FONT_BODY }}
                          >
                            Site Operations
                          </button>
                        )}
                      >
                        {openItems.length === 0 ? (
                          <EmptyState
                            message="No open tasks or issues right now."
                            ctaLabel="Open Site Operations"
                            onCtaClick={() => orgNav(COMPANY_NAV_ROUTES.siteOperations)}
                          />
                        ) : (
                          <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
                            {openItems.map(item => (
                              <li key={`${item.kind}-${item.id}`}>
                                <button
                                  type="button"
                                  onClick={() => openProject(item.kind === 'task' ? 'project-tasks' : 'project-issues', {
                                    projectId: item.projectId,
                                    projectName: item.projectName,
                                    location: item.location,
                                    propertyType: item.propertyType,
                                    type: item.type,
                                    stage: item.stage,
                                    status: item.projectStatus,
                                  })}
                                  className="w-full flex items-start justify-between gap-3 rounded-[12px] border border-[var(--hz-border)] p-3 text-left cursor-pointer bg-[var(--hz-surface)] hover:border-[var(--hz-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
                                >
                                  <div className="min-w-0 flex flex-col gap-0.5">
                                    <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
                                    <span className="text-[11.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                                      {item.projectName} · {item.kind === 'task' ? 'Task' : 'Issue'} · {formatOpsStatus(item.status)}
                                    </span>
                                    <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>
                                      {formatOpsPriority(item.priority)}
                                    </span>
                                  </div>
                                  <span className="shrink-0 text-[var(--hz-primary)] mt-1" aria-hidden="true"><ArrowRightIcon /></span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </SectionCard>
                    </div>
                  )}

                  <SectionCard title="Construction Record shortcuts">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { label: 'Projects', dest: COMPANY_NAV_ROUTES.projects },
                        { label: 'Progress', dest: COMPANY_NAV_ROUTES.progress },
                        { label: 'Site Operations', dest: COMPANY_NAV_ROUTES.siteOperations },
                        { label: 'Workforce', dest: COMPANY_NAV_ROUTES.workforce },
                        { label: 'Documents', dest: COMPANY_NAV_ROUTES.documents },
                        { label: 'Reports', dest: COMPANY_NAV_ROUTES.reports },
                      ].map(action => (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => orgNav(action.dest)}
                          className="min-h-11 h-11 px-3 rounded-[10px] text-[12.5px] font-semibold border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink)] cursor-pointer hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)] text-left"
                          style={{ fontFamily: FONT_BODY }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </>
              )}

              <div className="rounded-[18px] p-5 sm:p-6 flex flex-col gap-4" style={{ background: 'linear-gradient(135deg, #F9F5FF 0%, var(--hz-primary-soft) 100%)', border: '1px solid rgba(114,46,209,0.12)' }}>
                <div className="flex items-center gap-3">
                  <HIcon size={36} />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Hozie</span>
                    <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Your AI construction assistant</span>
                  </div>
                </div>
                <p className="text-[14px] text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_BODY }}>What would you like to work on today?</p>
                <div className="flex items-center border rounded-[12px] bg-[var(--hz-surface)] min-h-[48px] overflow-hidden border-[var(--hz-border)] focus-within:border-[var(--hz-primary)] transition-colors">
                  <input
                    type="text"
                    value={askInput}
                    onChange={e => setAskInput(e.target.value)}
                    placeholder="Ask Hozie..."
                    aria-label="Ask Hozie"
                    className="flex-1 min-h-[48px] h-full px-4 text-[14px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                    style={{ fontFamily: FONT_BODY }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAskHozie(askInput.trim() || undefined)}
                    className="min-h-[48px] h-full px-5 shrink-0 text-[13px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 transition-all flex items-center gap-1.5"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Ask Hozie <ArrowRightIcon />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Summarize company progress', 'What open site work needs attention?', 'Help me improve my profile'].map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAskHozie(suggestion)}
                      className="min-h-11 h-11 px-3 rounded-full text-[12px] font-semibold cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink)] hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)] transition-colors"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionCard
                  title="Complete your professional profile"
                  action={<span className="text-[12px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>{strengthPct}%</span>}
                >
                  <div className="flex flex-col divide-y divide-[var(--hz-border)]">
                    {checklist.map(item => <ChecklistRow key={item.id} item={item} />)}
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(nextProfileScreen, { organization_id: organizationId ?? '' })}
                    className="self-start mt-1 min-h-11 text-[13px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline p-0"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Complete profile →
                  </button>
                </SectionCard>

                <SectionCard title="Business Development">
                  <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                    Opportunities and bids remain available under Business Development. They are not part of the Construction Record home.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                    <button
                      type="button"
                      disabled={opportunitiesLocked}
                      title={opportunitiesLocked ? 'Locked until your identity is verified' : undefined}
                      onClick={() => !opportunitiesLocked && orgNav(COMPANY_NAV_ROUTES.discoverProjects)}
                      className={[
                        'min-h-11 h-11 px-3 rounded-[10px] text-[12.5px] font-semibold border text-left',
                        opportunitiesLocked
                          ? 'cursor-not-allowed border-[var(--hz-border)] text-[var(--hz-ink-subtle)] bg-[var(--hz-surface)]'
                          : 'cursor-pointer border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink)] hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)]',
                      ].join(' ')}
                      style={{ fontFamily: FONT_BODY }}
                    >
                      <span className="flex items-center gap-1.5">Discover Projects{opportunitiesLocked && <LockIcon size={10} />}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => orgNav(COMPANY_NAV_ROUTES.myBids)}
                      className="min-h-11 h-11 px-3 rounded-[10px] text-[12.5px] font-semibold border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink)] cursor-pointer hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)] text-left"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      My Bids
                    </button>
                  </div>
                </SectionCard>
              </div>

              {resolvedVerification !== 'verified' && (
                <p className="text-[12px] text-[var(--hz-ink-subtle)] text-center m-0" style={{ fontFamily: FONT_BODY }}>
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
