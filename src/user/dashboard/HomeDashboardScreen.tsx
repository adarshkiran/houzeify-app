import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import HozieInsightCard from '@/shared/components/HozieInsightCard'
import Sidebar from '@/shared/components/Sidebar'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { initials } from '@/data/homeownerProfile'
import {
  isHomeownerIntent,
  getHomeownerDashboardConfiguration,
  getServiceEntryHeroContent,
  projectStageLabel,
  greetingWord,
  DASHBOARD_ROUTES,
  type HomeownerDashboardState,
} from '@/data/homeownerDashboard'
import { resolveServiceEntry } from '@/data/serviceEntry'
// Customer Implementation 09C — Home's project + estimate state reads the
// canonical stores (same ones Projects / Project Workspace / 08C Profile
// card use), never the ambient projectData bag.
import { resolveProjectStatus } from '@/data/projects'
import { useProjects } from '@/data/projectState'
import { useCustomerProjects } from '@/data/customerProjectsState'
import { acceptProjectCustomerInvite, describeCustomerError } from '@/data/projectCustomerApi'
import { getEstimateVersionsForProject } from '@/data/estimateVersions'

// Destinations the customer Home may still link to from its config-driven
// CTAs. Everything else in homeownerDashboard.ts's DASHBOARD_ROUTES is a
// pre-2.0 product area (Build/Renovate, estimates, BOQ, contractors, bids,
// plan upload, Home Services) and is not offered from the active Home.
const ACTIVE_DASHBOARD_DESTS: ReadonlySet<string> = new Set([
  DASHBOARD_ROUTES.aiAdvisor,
  'projects-list',
  'notifications',
])

// ─── Sidebar Icons ─────────────────────────────────────────────────────────────

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9L9 3l7 6"/>
    <path d="M4 8v8h3.5v-4h3v4H14V8"/>
  </svg>
)
const IcoProjects = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z"/>
  </svg>
)
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

const IcoProfile = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="6" r="3"/>
    <path d="M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
  </svg>
)

// Sidebar (desktop left rail) now lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never drifts
// or changes shape as you navigate (see that file's header comment for why).

// ─── Mobile Top Bar ────────────────────────────────────────────────────────────
// Mobile header per brief: Logo, Notifications, Profile.

function MobileTopBar({ userInitials, onNavigate }: { userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          Home
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate('notifications')} aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent">
          <IcoBell />
        </button>
        <button onClick={() => onNavigate('homeowner-profile')} aria-label="Open profile" className="w-8 h-8 rounded-full bg-[#722ED1] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer border-0" style={{ fontFamily: '"Google Sans Flex:Bold", sans-serif' }}>
          {userInitials}
        </button>
      </div>
    </div>
  )
}

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────
// The only primary navigation mobile had until now was the top bar's back/
// profile controls. Fixed 3-item bar (Home / Projects / Profile) mirrors the
// desktop Sidebar's primary items exactly (same ids/destinations), mobile
// only. Build and Services were removed with the pre-2.0 product areas.

function MobileBottomNav({ activeNav, onNav, onNavigate }: { activeNav: string; onNav: (id: string) => void; onNavigate: (s: string, data?: Record<string, string>) => void }) {
  const items = [
    { id: 'home', icon: <IcoHome />, label: 'Home', dest: '' },
    // Customer Implementation 09D — canonical customer Projects hub is
    // 'projects-list' (ProjectsListScreen, the getAllProjects() list), the
    // same destination the desktop Sidebar's Projects item uses. Previously
    // this pointed at 'project-workspace', a project-SPECIFIC screen, so
    // mobile and desktop disagreed. Project Workspace stays project-specific
    // and is still reached by opening a project from the list.
    { id: 'projects', icon: <IcoProjects />, label: 'Projects', dest: 'projects-list' },
    { id: 'profile', icon: <IcoProfile />, label: 'Profile', dest: 'homeowner-profile' },
  ]
  return (
    <nav
      className="flex md:hidden items-stretch justify-between bg-white border-t border-[#E3DDD7] shrink-0 z-10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {items.map(item => {
        const active = activeNav === item.id
        return (
          <button
            key={item.id}
            onClick={() => { item.dest ? onNavigate(item.dest) : onNav(item.id) }}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 border-0 bg-transparent cursor-pointer"
            style={{ color: active ? '#722ED1' : '#808080' }}
          >
            <span className="w-[20px] h-[20px] flex items-center justify-center">{item.icon}</span>
            <span className="text-[11px] leading-none" style={{ fontFamily: '"Open Sans:Regular", sans-serif', fontWeight: active ? 600 : 400 }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── Top Header ───────────────────────────────────────────────────────────────

function TopHeader({ userInitials, onNavigate }: { userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#E3DDD7]">
      <h1
        className="text-[20px] font-semibold text-[#242326] m-0"
        style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}
      >
        Home
      </h1>
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('notifications')} aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent">
          <IcoBell />
        </button>
        <button aria-label="Help" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all">
          <IcoCircleHelp />
        </button>
        <button onClick={() => onNavigate('homeowner-profile')} aria-label="Open profile" className="flex items-center gap-2 ml-1 px-2 py-1 rounded-[10px] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-transparent">
          <div className="w-8 h-8 rounded-full bg-[#722ED1] flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ fontFamily: '"Google Sans Flex:Bold", sans-serif' }}>
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

// ─── Greeting + location ────────────────────────────────────────────────────

function GreetingSection({ preferredName, city, state, onNavigate }: { preferredName: string; city?: string; state?: string; onNavigate: (s: string) => void }) {
  const secondary: Record<string, string> = {
    'build-home': "Here's what's happening with your home today.",
    'improve-home': "Here's what's happening with your home today.",
    'home-service': "Here's what's happening with your home today.",
  }
  return (
    <div className="flex flex-col gap-2 mb-6">
      <span
        className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase"
        style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}
      >
        Your Construction Workspace
      </span>
      <div style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.12s both' }}>
        <h1
          className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.1] m-0"
          style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}
        >
          {/* Customer Implementation 09B — name only when a real one exists;
              otherwise an honest "Good evening." with no fabricated name. */}
          {greetingWord()}{preferredName ? `, ${preferredName}` : ''}.
        </h1>
      </div>
      <p
        className="text-[14px] text-[#68636D] leading-[1.6] m-0"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif', animation: 'welcomeFadeUp 0.45s ease-out 0.2s both' }}
      >
        {secondary['build-home']}
      </p>
      {city && (
        <div className="flex items-center gap-2 mt-1" style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.24s both' }}>
          <span className="flex items-center gap-1 text-[12.5px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
            <IcoMapPin /> {[city, state].filter(Boolean).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Hozie hero — compact, intent-aware; NOT a full chat experience ───────────

function HozieHeroCard({
  title,
  message,
  ctaLabel,
  onCta,
}: {
  title: string
  message: string
  ctaLabel?: string
  onCta?: () => void
}) {
  return (
    <div
      className="w-full bg-white rounded-[24px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4"
      style={{ boxShadow: '0 2px 20px rgba(243,234,255,0.07), 0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center rounded-[14px] bg-[#F3EAFF] shrink-0" style={{ width: 44, height: 44 }}>
          <HIcon size={28} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold text-[#242326] leading-none" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
            HOZIE
          </span>
          <span className="text-[11px] tracking-[0.08em] text-[#722ED1] leading-none" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
            AI CONSTRUCTION ADVISOR
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[#722ED1] shrink-0" style={{ animation: 'hozieStatusPulse 2.2s ease-in-out infinite' }} />
          <span className="text-[12px] text-[#722ED1] tracking-[0.06em]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>READY</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[20px] sm:text-[24px] font-medium text-[#242326] leading-tight m-0" style={{ fontFamily: '"Google Sans Flex:Medium", sans-serif' }}>
          {title}
        </h2>
        <p className="text-[14px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
          {message}
        </p>
      </div>

      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="self-start h-[42px] px-5 rounded-[12px] bg-[#722ED1] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}

// ─── AI conversation entry — opens 013 AI Advisor, no inline chat here ────────

const AI_PROMPT_EXAMPLES = [
  'How much will my house cost?',
  'Find flooring professionals near me',
  'Is this contractor quote reasonable?',
]

function AiPromptEntry({ onSubmit }: { onSubmit: (query: string) => void }) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="w-full bg-white rounded-[20px] border border-[#E3DDD7] p-4 sm:p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <label htmlFor="ai-prompt-input" className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
        Ask Hozie
      </label>
      <div className="flex items-center gap-3 bg-[#FFFFFF] border border-[#E3DDD7] rounded-[14px] px-4 h-[52px] focus-within:border-[#722ED1] focus-within:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all">
        <div className="shrink-0 flex items-center justify-center opacity-60">
          <HIcon size={16} />
        </div>
        <input
          ref={inputRef}
          id="ai-prompt-input"
          type="text"
          placeholder="Ask Hozie anything about your home..."
          aria-label="Ask Hozie anything about your home"
          className="flex-1 bg-transparent outline-none text-[14px] text-[#242326] placeholder-[#9A949D]"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(value) }}
        />
        <button
          onClick={() => submit(value)}
          disabled={!value.trim()}
          aria-label="Send to Hozie"
          className={[
            'w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-150',
            value.trim() ? 'bg-[#722ED1] cursor-pointer hover:brightness-90 active:scale-95' : 'bg-[#F4F0EC] cursor-not-allowed',
          ].join(' ')}
        >
          <IcoSend />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {AI_PROMPT_EXAMPLES.map(example => (
          <button
            key={example}
            onClick={() => submit(example)}
            className="text-[11.5px] text-[#68636D] bg-[#FFFFFF] border border-[#E3DDD7] rounded-full px-3 py-1.5 hover:border-[#722ED1] hover:text-[#722ED1] transition-colors cursor-pointer"
            style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Next best action — the single primary CTA ────────────────────────────────

function NextActionCard({ eyebrow, title, body, ctaLabel, onCta }: { eyebrow: string; title: string; body: string; ctaLabel: string; onCta: () => void }) {
  return (
    <div
      className="w-full rounded-[20px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
      style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}
    >
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span className="text-[11.5px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
          {eyebrow}
        </span>
        <h3 className="text-[19px] sm:text-[21px] font-semibold text-[#242326] leading-snug m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          {title}
        </h3>
        <p className="text-[13.5px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
          {body}
        </p>
      </div>
      <button
        onClick={onCta}
        className="shrink-0 h-[46px] px-6 rounded-[12px] bg-[#722ED1] text-white text-[14px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 w-full sm:w-auto"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

// ─── Quick actions — secondary; Next Step remains the primary CTA ────────────

function QuickActionsCard({ actions, onNavigate }: { actions: { label: string; dest: string }[]; onNavigate: (s: string) => void }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-4 h-full" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
        Quick Actions
      </span>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(action => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.dest)}
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-[12px] border border-[#E3DDD7] bg-[#FFFFFF] hover:bg-[#F9F5FF] hover:border-[#722ED1] hover:text-[#722ED1] text-[#68636D] transition-all cursor-pointer text-center"
          >
            <span className="text-[12px] leading-tight" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Loading skeleton — lightweight, never fake data ──────────────────────────

function DashboardSkeleton() {
  const bar = (w: string, h = 14) => <div className="rounded-full bg-[#F4F0EC]" style={{ width: w, height: h, animation: 'hozieStatusPulse 1.6s ease-in-out infinite' }} />
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="flex flex-col gap-2">{bar('40%', 12)}{bar('55%', 30)}{bar('35%', 14)}</div>
      <div className="rounded-[24px] border border-[#E3DDD7] p-6 flex flex-col gap-3">{bar('30%')}{bar('60%', 24)}{bar('80%')}</div>
      <div className="rounded-[20px] border border-[#E3DDD7] p-6 flex flex-col gap-3">{bar('25%')}{bar('50%', 20)}</div>
      <div className="rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3">{bar('20%')}{bar('70%')}</div>
    </div>
  )
}

// ─── Error state ────────────────────────────────────────────────────────────

function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-20" style={{ maxWidth: 420, margin: '0 auto' }}>
      <p className="text-[15px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        We couldn&apos;t load your workspace.
      </p>
      <button
        onClick={onRetry}
        className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-medium cursor-pointer hover:brightness-90 transition-all border-0"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        Try again
      </button>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
// Screen 012 — Homeowner AI Dashboard. One reusable dashboard, dynamic per
// primaryIntent (build-home / improve-home / home-service) — never three
// separate dashboards. Reads exclusively from getHomeownerDashboardConfiguration().

export default function HomeDashboardScreen({
  onNavigate,
  role,
  primaryIntent,
  preferredName,
  fullName,
  city,
  state,
  projectName,
  projectLocation,
  projectStage,
  projectId,
  homeType,
  constructionStage,
  homeBHK,
  homeBuiltUpArea,
  homeFloorCount,
  serviceEntry,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  /** The canonical top-level persona ('homeowner' | 'professional'),
   *  resolved once on Screen 007 and passed down by App.tsx — the sole
   *  source of truth for the role-safety check below. primaryIntent is
   *  still used further down to shape which homeowner intent is shown; it
   *  is never the top-level role decision. */
  role?: string
  primaryIntent?: string
  preferredName?: string
  fullName?: string
  city?: string
  state?: string
  projectName?: string
  projectLocation?: string
  projectStage?: string
  /** Batch C — real project_id, set only once Screen 035 (Create Project)
   *  has actually run. Never minted here; only read. */
  projectId?: string
  /** Batch C — real Screen 011 "Your Home" fields, read as-is from
   *  projectData. All optional; none are fabricated when absent. */
  homeType?: string
  constructionStage?: string
  homeBHK?: string
  homeBuiltUpArea?: string
  homeFloorCount?: string
  /** Which of the two service destinations (Screen 007) this session
   *  entered through — only meaningful when resolvedIntent === 'home-service'. */
  serviceEntry?: string
}) {
  const [activeNav, setActiveNav] = useState('home')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  // ROLE SAFETY: a professional must never see homeowner dashboard content.
  // Redirect via the existing navigation mechanism, not a duplicated
  // professional-dashboard implementation. Driven by the canonical `role`
  // only — never primaryIntent, which is a secondary, homeowner-shaped
  // field that can be blank even for a genuine professional.
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (isProfessional) onNavigate(DASHBOARD_ROUTES.professionalDashboard)
  }, [isProfessional, onNavigate])
  // 12H-B — real, owner-scoped backend project list (see
  // src/data/projectState.tsx), replacing getAllProjects(). Always called
  // (rules of hooks), only consulted below for the build-home canonical
  // project shortcut.
  const projectsCtx = useProjects()
  const sharedProjects = useCustomerProjects()
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const pendingInvite = sharedProjects.projects.find(p => p.customerStatus === 'invited')
  const activeShared = sharedProjects.projects.find(p => p.customerStatus === 'active')

  // Lightweight simulated workspace load — skeleton only, never fake data.
  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [attempt])

  if (isProfessional) return null

  // No valid homeowner intent yet (e.g. a direct jump before onboarding) —
  // default to build-home rather than showing a dead-end, matching the rest
  // of the app's existing "House / Hyderabad" default project data.
  const resolvedIntent = isHomeownerIntent(primaryIntent) ? primaryIntent : 'build-home'

  // improve-home / home-service used to surface the most-recent RFQ
  // ServiceRequest here; that flow has been removed, so these branches have
  // no project name / stage to show.

  // ─── Customer Implementation 09C — canonical project + estimate state ────
  // build-home project + estimate info now comes from the same canonical
  // stores Projects, Project Workspace and the 08C Profile card read —
  // projects.ts (getAllProjects / resolveProjectStatus) and
  // estimateVersions.ts (getEstimateVersionsForProject) — never the ambient
  // projectData bag, and never "a project name exists ⇒ an estimate is
  // ready". Current project = the most recently updated one, the same
  // selection ProjectsListScreen and the 08C Profile card make. Only
  // consulted for build-home; the improve-home / home-service branches keep
  // reading the real ServiceRequest exactly as before.
  // 12H-B — projectsCtx.projects is already sorted most-recently-updated
  // first by the real backend (matches the old getAllProjects() ordering
  // exactly), so [0] is still the same "canonical project" this dashboard
  // card has always meant — never reinterpreted as "the user's only
  // project" (12H-A's own explicit warning).
  const canonicalProject = resolvedIntent === 'build-home' ? projectsCtx.projects[0] : undefined
  const canonicalProjectStatus = canonicalProject
    ? resolveProjectStatus(canonicalProject.id, canonicalProject.stage ?? undefined)
    : undefined
  const hasRealEstimate = Boolean(
    canonicalProject && getEstimateVersionsForProject(canonicalProject.id).length > 0,
  )

  const state_: HomeownerDashboardState = {
    primaryIntent: resolvedIntent,
    // Customer Implementation 09B — real onboarding identity only; never the
    // hardcoded homeownerProfile demo person. (This field is currently unread
    // by getHomeownerDashboardConfiguration, but it stays honest regardless.)
    preferredName: preferredName || fullName || '',
    city,
    state,
    hasProject: resolvedIntent === 'build-home' ? Boolean(canonicalProject) : Boolean(projectName),
    projectName: resolvedIntent === 'build-home' ? canonicalProject?.name : undefined,
    projectLocation: resolvedIntent === 'build-home' ? (canonicalProject?.location ?? undefined) : undefined,
    // Live resolved status id (resolveProjectStatus), consistent with
    // Projects / Project Workspace — never the raw stage stored at creation.
    projectStage: resolvedIntent === 'build-home' ? canonicalProjectStatus : undefined,
    hasPlan: false,
    hasEstimate: resolvedIntent === 'build-home' && hasRealEstimate,
    hasBoq: false,
    hasBids: false,
  }

  let config
  try {
    config = getHomeownerDashboardConfiguration(state_)
    // Home Services / Cleaning Services: swap in the real, service_entry-
    // specific hero copy — minimum change necessary, everything else about
    // the configuration (next action, empty state, insight) stays exactly
    // as getHomeownerDashboardConfiguration() already computed it.
    if (config && resolvedIntent === 'home-service') {
      config = { ...config, hero: getServiceEntryHeroContent(resolveServiceEntry(serviceEntry)) }
    }
  } catch {
    config = null
  }

  // Customer Implementation 09H — the config-driven Home CTAs (Next Action,
  // Hozie Insight, Quick Actions) carry only a route string. When that route
  // is the Estimate flow and a canonical Build-Home project exists (09C),
  // attach its real id — the same `canonicalProject.id` the main
  // EstimateSnapshot CTA already passes — so estimate-dashboard renders the
  // genuine version data rather than its no-id demo fallback. Every other
  // destination navigates unchanged.
  const navFromConfig = (dest: string) => {
    if (dest === DASHBOARD_ROUTES.estimateDashboard && canonicalProject) {
      onNavigate(dest, { project_id: canonicalProject.id })
      return
    }
    onNavigate(dest)
  }

  // Customer Implementation 09B — greeting + avatar derive from the real
  // onboarding identity (projectData.preferred_name / full_name). When
  // neither exists the greeting drops the name entirely ("Good evening.")
  // and initials() returns its own neutral "?" — never "Adarsh" / "AK".
  const userInitials = initials(fullName?.trim() || preferredName?.trim() || '')
  const displayName = preferredName?.trim() || fullName?.trim().split(' ')[0] || ''

  const handleAiPromptSubmit = (query: string) => {
    onNavigate(DASHBOARD_ROUTES.aiAdvisor, { ai_query: query })
  }
  // Table B navigation cleanup — the config-driven CTAs (hero, next step,
  // quick actions, Hozie insight) still carry pre-2.0 destinations
  // (create-project, estimate-dashboard, upload-plan, find-contractors,
  // bids-received, renovate, Home Services, ...). Only destinations that
  // belong to the active product are rendered; the rest are hidden here so
  // homeownerDashboard.ts (and every legacy screen that reads it) stays
  // untouched.
  const isActiveDest = (dest: string) => ACTIVE_DASHBOARD_DESTS.has(dest)
  const visibleQuickActions = config ? config.quickActions.filter(a => isActiveDest(a.dest)) : []

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar userInitials={userInitials} onNavigate={onNavigate} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="home" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader userInitials={userInitials} onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto px-6 py-7 pb-24 md:pb-7" style={{ scrollbarWidth: 'none' }}>
            {loading && <DashboardSkeleton />}

            {!loading && (loadError || !config) && (
              <DashboardErrorState onRetry={() => setAttempt(a => a + 1)} />
            )}

            {!loading && !loadError && config && (
              <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* 1. Header — greeting + location (notifications live in
                    MobileTopBar/TopHeader above, unchanged) */}
                <GreetingSection preferredName={displayName} city={city} state={state} onNavigate={onNavigate} />

                {/* 3. Ask Hozie — reuses the existing Hozie hero + AI
                    conversation entry components unchanged; moved up to sit
                    directly below Search per request. AiPromptEntry sits
                    above HozieHeroCard per follow-up request. */}
                <div className="flex flex-col gap-4" style={{ animation: 'welcomeFadeUp 0.5s ease-out 0.16s both' }}>
                  <AiPromptEntry onSubmit={handleAiPromptSubmit} />
                  <HozieHeroCard
                    title={config.hero.title}
                    message={config.hero.message}
                    ctaLabel={isActiveDest(config.hero.ctaDest) ? config.hero.ctaLabel : undefined}
                    onCta={isActiveDest(config.hero.ctaDest) ? () => onNavigate(config.hero.ctaDest) : undefined}
                  />
                </div>

                {(pendingInvite || activeShared) && (
                  <div className="rounded-[16px] bg-white p-5 min-w-0" style={{ border: '1px solid #E3DDD7', animation: 'welcomeFadeUp 0.45s ease-out 0.18s both' }}>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-2" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Construction</p>
                    {pendingInvite ? (
                      <>
                        <h2 className="text-[18px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>Join {pendingInvite.name}</h2>
                        <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                          {pendingInvite.organizationName ?? 'Your builder'} invited you to follow this project.
                        </p>
                        {inviteError && <p className="text-[13px] text-[#B91C1C] m-0 mt-2">{inviteError}</p>}
                        <button
                          type="button"
                          disabled={inviteBusy}
                          onClick={() => {
                            setInviteBusy(true)
                            setInviteError(null)
                            acceptProjectCustomerInvite(pendingInvite.id)
                              .then(() => sharedProjects.refresh())
                              .catch(err => setInviteError(describeCustomerError(err)))
                              .finally(() => setInviteBusy(false))
                          }}
                          className="h-11 px-5 mt-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                          style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: '"Open Sans:Regular", sans-serif' }}
                        >
                          Join this project
                        </button>
                      </>
                    ) : activeShared ? (
                      <>
                        <h2 className="text-[18px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{activeShared.name}</h2>
                        <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                          {activeShared.stage ?? 'Construction in progress'}
                          {activeShared.organizationName ? ` · ${activeShared.organizationName}` : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() => onNavigate('project-progress', { project_id: activeShared.id, project_name: activeShared.name })}
                          className="h-11 px-5 mt-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                          style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: '"Open Sans:Regular", sans-serif' }}
                        >
                          View progress
                        </button>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Next best action — config-driven; hidden unless its
                    destination belongs to the active product. */}
                {isActiveDest(config.nextAction.ctaDest) && (
                  <NextActionCard
                    eyebrow={config.nextAction.eyebrow}
                    title={config.nextAction.title}
                    body={config.nextAction.body}
                    ctaLabel={config.nextAction.ctaLabel}
                    onCta={() => navFromConfig(config.nextAction.ctaDest)}
                  />
                )}

                {/* Quick actions — only the active-product destinations */}
                {visibleQuickActions.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    <QuickActionsCard actions={visibleQuickActions} onNavigate={navFromConfig} />
                  </div>
                )}

                {/* Hozie insight (Estimate / BOQ / Marketplace snapshot cards
                    removed — they led to the pre-2.0 estimate / BOQ /
                    contractor screens). */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <div className="flex-1 min-w-[240px]">
                    <HozieInsightCard
                      message={config.insight.message}
                      actionLabel={isActiveDest(config.insight.actionDest) ? config.insight.actionLabel : undefined}
                      onAction={isActiveDest(config.insight.actionDest) ? () => navFromConfig(config.insight.actionDest) : undefined}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav activeNav={activeNav} onNav={setActiveNav} onNavigate={onNavigate} />
    </div>
  )
}
