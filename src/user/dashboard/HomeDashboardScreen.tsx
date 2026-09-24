import { useEffect, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
import { initials } from '@/data/homeownerProfile'
import { greetingWord, DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useAuth } from '@/data/authState'
import { useCustomerProjects } from '@/data/customerProjectsState'
import { acceptProjectCustomerInvite, describeCustomerError } from '@/data/projectCustomerApi'
import {
  CUSTOMER_HOME_AI_PROMPT_EXAMPLES,
  customerHomeProjectNavData,
  partitionCustomerHomeProjects,
  type CustomerHomeProject,
} from '@/data/customerHomeProjects'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Icons ────────────────────────────────────────────────────────────────────

const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2a6 6 0 016 6v2.5l1.5 3h-15L4 10.5V8a6 6 0 016-6z"/>
    <path d="M8 16a2 2 0 004 0"/>
  </svg>
)
const IcoCircleHelp = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8"/>
    <path d="M7.5 8a2.5 2.5 0 014.5 1.5c0 2-2.5 2.5-2.5 3.5"/>
    <circle cx="10" cy="15.5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoSend = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 2L2 7.5l5 1.5L9.5 14 14 2z" fill="white"/>
    <path d="M7 9l4-7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IcoMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z"/>
    <circle cx="7" cy="5.5" r="1.5"/>
  </svg>
)

// ─── Chrome ───────────────────────────────────────────────────────────────────

function MobileTopBar({ userInitials, onNavigate }: { userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
          Home
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onNavigate('notifications')} aria-label="Notifications" className="min-w-11 min-h-11 w-11 h-11 flex items-center justify-center text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] transition-colors cursor-pointer border-0 bg-transparent rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2">
          <IcoBell />
        </button>
        <button type="button" onClick={() => onNavigate('homeowner-profile')} aria-label="Open profile" className="min-w-11 min-h-11 w-11 h-11 rounded-full bg-[var(--hz-primary)] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          {userInitials}
        </button>
      </div>
    </div>
  )
}

function TopHeader({ userInitials, onNavigate }: { userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
      <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
        Home
      </h1>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onNavigate('notifications')} aria-label="Notifications" className="min-w-11 min-h-11 w-11 h-11 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2">
          <IcoBell />
        </button>
        <button type="button" aria-label="Help" className="min-w-11 min-h-11 w-11 h-11 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2">
          <IcoCircleHelp />
        </button>
        <button type="button" onClick={() => onNavigate('homeowner-profile')} aria-label="Open profile" className="flex items-center gap-2 ml-1 min-h-11 px-2 py-1 rounded-[10px] hover:bg-[var(--hz-surface-muted)] transition-all cursor-pointer border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2">
          <div className="w-8 h-8 rounded-full bg-[var(--hz-primary)] flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
            {userInitials}
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#808080" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 5l4 4 4-4"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

function GreetingSection({ preferredName, city, state }: { preferredName: string; city?: string; state?: string }) {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <span
        className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase"
        style={{ fontFamily: FONT_MONO, animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}
      >
        Your Construction Workspace
      </span>
      <div style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.12s both' }}>
        <h1
          className="text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] leading-[1.1] m-0"
          style={{ fontFamily: FONT_HEAD }}
        >
          {greetingWord()}{preferredName ? `, ${preferredName}` : ''}.
        </h1>
      </div>
      <p
        className="text-[14px] text-[var(--hz-ink-muted)] leading-[1.6] m-0"
        style={{ fontFamily: FONT_BODY, animation: 'welcomeFadeUp 0.45s ease-out 0.2s both' }}
      >
        Linked projects and shared construction progress show up here.
      </p>
      {city && (
        <div className="flex items-center gap-2 mt-1" style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.24s both' }}>
          <span className="flex items-center gap-1 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
            <IcoMapPin /> {[city, state].filter(Boolean).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}

function HozieHeroCard({ onAsk }: { onAsk: () => void }) {
  return (
    <div
      className="w-full bg-[var(--hz-surface)] rounded-[24px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4"
      style={{ boxShadow: '0 2px 20px rgba(243,234,255,0.07), 0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center rounded-[14px] bg-[var(--hz-primary-soft)] shrink-0" style={{ width: 44, height: 44 }}>
          <HIcon size={28} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>
            HOZIE
          </span>
          <span className="text-[11px] tracking-[0.08em] text-[var(--hz-primary)] leading-none" style={{ fontFamily: FONT_MONO }}>
            AI CONSTRUCTION ADVISOR
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--hz-primary)] shrink-0" style={{ animation: 'hozieStatusPulse 2.2s ease-in-out infinite' }} />
          <span className="text-[12px] text-[var(--hz-primary)] tracking-[0.06em]" style={{ fontFamily: FONT_MONO }}>READY</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[20px] sm:text-[24px] font-medium text-[var(--hz-ink)] leading-tight m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Questions about your construction record?
        </h2>
        <p className="text-[14px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Ask about shared progress, project stages, or what to review next on a linked project.
        </p>
      </div>

      <button
        type="button"
        onClick={onAsk}
        className="self-start min-h-11 px-5 rounded-[12px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2"
        style={{ fontFamily: FONT_BODY }}
      >
        Ask Hozie
      </button>
    </div>
  )
}

function AiPromptEntry({ onSubmit }: { onSubmit: (query: string) => void }) {
  const [value, setValue] = useState('')

  const submit = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="w-full bg-[var(--hz-surface)] rounded-[20px] border border-[var(--hz-border)] p-4 sm:p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <label htmlFor="ai-prompt-input" className="text-[12px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>
        Ask Hozie
      </label>
      <div className="flex items-center gap-3 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[14px] px-4 h-[52px] focus-within:border-[var(--hz-primary)] focus-within:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all">
        <div className="shrink-0 flex items-center justify-center opacity-60">
          <HIcon size={16} />
        </div>
        <input
          id="ai-prompt-input"
          type="text"
          placeholder="Ask about your construction progress…"
          aria-label="Ask Hozie about your construction progress"
          className="flex-1 bg-transparent outline-none text-[14px] text-[var(--hz-ink)] placeholder-[var(--hz-ink-subtle)]"
          style={{ fontFamily: FONT_BODY }}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(value) }}
        />
        <button
          type="button"
          onClick={() => submit(value)}
          disabled={!value.trim()}
          aria-label="Send to Hozie"
          className={[
            'min-w-9 min-h-9 w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-150 border-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2',
            value.trim() ? 'bg-[var(--hz-primary)] cursor-pointer hover:brightness-90 active:scale-95' : 'bg-[var(--hz-surface-muted)] cursor-not-allowed',
          ].join(' ')}
        >
          <IcoSend />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CUSTOMER_HOME_AI_PROMPT_EXAMPLES.map(example => (
          <button
            key={example}
            type="button"
            onClick={() => submit(example)}
            className="text-[11.5px] text-[var(--hz-ink-muted)] bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-full px-3 py-1.5 min-h-11 hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2"
            style={{ fontFamily: FONT_BODY }}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProjectsLoadingState() {
  return (
    <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }} role="status" aria-live="polite">
      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Loading your linked projects…</p>
    </div>
  )
}

function ProjectsErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }} role="alert">
      <HIcon size={36} />
      <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Couldn’t load projects</p>
      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
        {message ?? 'Something went wrong loading your linked projects. Please try again.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-medium cursor-pointer hover:brightness-90 transition-all border-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2"
        style={{ fontFamily: FONT_BODY }}
      >
        Try again
      </button>
    </div>
  )
}

function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }}>
      <HIcon size={36} />
      <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>No linked projects yet</p>
      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
        When a builder shares a project with you, it will appear here with Overview and Progress.
      </p>
    </div>
  )
}

function InviteProjectCard({
  project,
  busy,
  error,
  onAccept,
}: {
  project: CustomerHomeProject
  busy: boolean
  error: string | null
  onAccept: () => void
}) {
  return (
    <div className="rounded-[14px] bg-[var(--hz-surface)] p-4 sm:p-5" style={{ border: '1px solid var(--hz-border)' }}>
      <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-2" style={{ fontFamily: FONT_MONO }}>Invite</p>
      <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
        Join {project.name}
      </h3>
      <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
        {project.organizationName ?? 'Your builder'} invited you to follow this project.
      </p>
      {error && <p className="text-[13px] text-[#B91C1C] m-0 mt-2" role="alert">{error}</p>}
      <button
        type="button"
        disabled={busy}
        onClick={onAccept}
        className="min-h-11 px-5 mt-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2"
        style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
      >
        {busy ? 'Joining…' : 'Join this project'}
      </button>
    </div>
  )
}

function ActiveProjectCard({
  project,
  onNavigate,
}: {
  project: CustomerHomeProject
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  const nav = customerHomeProjectNavData(project)
  return (
    <div className="rounded-[14px] bg-[var(--hz-surface)] p-4 sm:p-5 flex flex-col gap-3" style={{ border: '1px solid var(--hz-border)' }}>
      <div className="min-w-0">
        <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>
          {project.name}
        </h3>
        <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
          {project.stage ?? 'Construction in progress'}
          {project.organizationName ? ` · ${project.organizationName}` : ''}
        </p>
        {project.location && (
          <span className="flex items-center gap-1 text-[12.5px] text-[var(--hz-ink-muted)] mt-1.5" style={{ fontFamily: FONT_BODY }}>
            <IcoMapPin /> {project.location}
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => onNavigate('project-overview', nav)}
          className="min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2"
          style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => onNavigate('project-progress', nav)}
          className="min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-[var(--hz-surface)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2"
          style={{ border: '1px solid var(--hz-border)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}
        >
          Progress
        </button>
      </div>
    </div>
  )
}

function LinkedProjectsSection({
  invited,
  active,
  inviteBusyId,
  inviteError,
  onAcceptInvite,
  onNavigate,
}: {
  invited: CustomerHomeProject[]
  active: CustomerHomeProject[]
  inviteBusyId: string | null
  inviteError: { id: string; message: string } | null
  onAcceptInvite: (projectId: string) => void
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  const total = invited.length + active.length
  return (
    <section className="flex flex-col gap-4" aria-labelledby="linked-projects-heading" style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.18s both' }}>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>
          Construction
        </span>
        <h2 id="linked-projects-heading" className="text-[18px] sm:text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
          {total === 1 ? '1 linked project' : `${total} linked projects`}
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {invited.map(project => (
          <InviteProjectCard
            key={project.id}
            project={project}
            busy={inviteBusyId === project.id}
            error={inviteError?.id === project.id ? inviteError.message : null}
            onAccept={() => onAcceptInvite(project.id)}
          />
        ))}
        {active.map(project => (
          <ActiveProjectCard key={project.id} project={project} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
// S11 — Customer Home is a construction-record landing for linked projects.
// Legacy Build / Estimate / Home Services ladder content is not rendered here.

export default function HomeDashboardScreen({
  onNavigate,
  role,
  preferredName,
  fullName,
  city,
  state,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  role?: string
  primaryIntent?: string
  preferredName?: string
  fullName?: string
  city?: string
  state?: string
  projectName?: string
  projectLocation?: string
  projectStage?: string
  projectId?: string
  homeType?: string
  constructionStage?: string
  homeBHK?: string
  homeBuiltUpArea?: string
  homeFloorCount?: string
  serviceEntry?: string
}) {
  const isProfessional = role === 'professional'
  const { status: authStatus } = useAuth()
  const sharedProjects = useCustomerProjects()
  const { invited, active, hasAny } = partitionCustomerHomeProjects(sharedProjects.projects)
  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<{ id: string; message: string } | null>(null)

  useEffect(() => {
    if (isProfessional) onNavigate(DASHBOARD_ROUTES.professionalDashboard)
  }, [isProfessional, onNavigate])

  if (isProfessional) return null

  const userInitials = initials(fullName?.trim() || preferredName?.trim() || '')
  const displayName = preferredName?.trim() || fullName?.trim().split(' ')[0] || ''

  const handleAiPromptSubmit = (query: string) => {
    onNavigate(DASHBOARD_ROUTES.aiAdvisor, { ai_query: query })
  }

  const acceptInvite = (projectId: string) => {
    setInviteBusyId(projectId)
    setInviteError(null)
    acceptProjectCustomerInvite(projectId)
      .then(() => sharedProjects.refresh())
      .catch(err => setInviteError({ id: projectId, message: describeCustomerError(err) }))
      .finally(() => setInviteBusyId(null))
  }

  // Auth still resolving, or authenticated and customer projects still idle/loading.
  // Unauthenticated → honest empty (not an infinite skeleton).
  const projectsLoading =
    authStatus === 'loading'
    || sharedProjects.status === 'loading'
    || (authStatus === 'authenticated' && sharedProjects.status === 'idle')
  const projectsError = sharedProjects.status === 'error'

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar userInitials={userInitials} onNavigate={onNavigate} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="home" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader userInitials={userInitials} onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-7 pb-24" style={{ scrollbarWidth: 'none' }}>
            <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
              <GreetingSection preferredName={displayName} city={city} state={state} />

              <div className="flex flex-col gap-4" style={{ animation: 'welcomeFadeUp 0.5s ease-out 0.16s both' }}>
                <AiPromptEntry onSubmit={handleAiPromptSubmit} />
                <HozieHeroCard onAsk={() => onNavigate(DASHBOARD_ROUTES.aiAdvisor)} />
              </div>

              {projectsLoading && <ProjectsLoadingState />}
              {projectsError && (
                <ProjectsErrorState
                  message={sharedProjects.errorMessage}
                  onRetry={() => { void sharedProjects.refresh() }}
                />
              )}
              {!projectsLoading && !projectsError && !hasAny && <ProjectsEmptyState />}
              {!projectsLoading && !projectsError && hasAny && (
                <LinkedProjectsSection
                  invited={invited}
                  active={active}
                  inviteBusyId={inviteBusyId}
                  inviteError={inviteError}
                  onAcceptInvite={acceptInvite}
                  onNavigate={onNavigate}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
