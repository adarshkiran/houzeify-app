// ─── Shared homeowner Sidebar ───────────────────────────────────────────────
// Single source of truth for the left nav rail on every homeowner-facing
// screen. Previously each screen kept its own local copy of this component
// (this codebase's usual per-screen duplication convention) and they had
// drifted out of sync — different item sets, different labels ("Hozie" vs
// "AI Advisor"), some destinations wired and some dead (dest: '') — so the
// rail visibly changed shape as you navigated between screens (e.g. it
// looked like it was "changing" when you asked Hozie something and landed
// on AI Advisor). Centralizing it here is the fix: one item list, one set
// of destinations, used everywhere, so the rail never changes shape across
// a homeowner's screens — only which item is highlighted changes.
//
// IA (customer transparency): Home / Projects / Profile as primary nav, the
// Project group (Progress / Timeline / Photos / Live Site / Documents /
// Questions), and Hozie under "Assistant". The pre-2.0 Build / Contractors /
// Bids / BOQ / Plan Analysis / Material Calculator / Services entries were
// removed from this rail (their screens still exist, reachable only through
// the dev screen switcher).
//
// Company (professional-role) users: this component is mounted by every
// project sub-screen, so for the 'partner' subscription audience (the same
// app-wide role App.tsx resolves via resolveUserRole and hands to
// SubscriptionProvider) it renders the shared PartnerNavRail instead, so
// company users keep the construction-platform nav while inside a project.

import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { CUSTOMER_NAV_ROUTES } from '@/data/constructionNav'
import { useSoleActiveCustomerProjectId } from '@/data/customerProjectsState'
import { useSubscription } from '@/data/subscriptionState'
import { useOrganizations } from '@/data/organizationState'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import HIcon from './HIcon'
import { MobilePrimaryNav, type MobilePrimaryNavItemId } from './MobilePrimaryNav'
import PartnerNavRail, { type PartnerNavId } from './PartnerNavRail'

export type SidebarNavId =
  | 'home'
  | 'build'
  | 'services'
  | 'projects'
  | 'profile'
  | 'advisor'
  | 'contractors'
  | 'bids'
  | 'boq'
  | 'plan'
  | 'calc'
  | 'billing'
  | 'settings'
  // Houzeify 2.0 Module 01 — construction-progress-transparency items, new
  // for the customer-facing nav (see constructionNav.ts's CUSTOMER_NAV_ROUTES).
  | 'progress'
  | 'timeline'
  | 'photos'
  | 'live-site'
  | 'documents'
  | 'questions'
  | 'notifications'

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9L9 3l7 6" />
    <path d="M4 8v8h3.5v-4h3v4H14V8" />
  </svg>
)
const IcoProjects = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z" />
  </svg>
)
const IcoProfile = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="6" r="3" />
    <path d="M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
  </svg>
)
const IcoAdvisor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 1.5L10.6 5.4L14.5 7 10.6 8.6 9 12.5 7.4 8.6 3.5 7l3.9-1.6L9 1.5z" />
    <path d="M14 12l.9 1.9 1.6.6-1.6.6-.9 1.9-.9-1.9-1.6-.6 1.6-.6.9-1.9z" strokeWidth="1.2" />
  </svg>
)
const IcoSettings = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="2.5" />
    <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.06 1.06M12.84 12.84l1.06 1.06M4.1 13.9l1.06-1.06M12.84 5.16l1.06-1.06" />
  </svg>
)
const IcoBilling = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="14" height="10.5" rx="1.5" />
    <line x1="2" y1="7.5" x2="16" y2="7.5" />
    <line x1="4.5" y1="11.5" x2="8" y2="11.5" />
  </svg>
)
// ─── Houzeify 2.0 Module 01 — new construction-progress-transparency icons ──
const IcoProgress = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" />
    <path d="M9 5v4l3 2" />
  </svg>
)
const IcoTimeline = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="9" x2="15" y2="9" />
    <circle cx="4.5" cy="9" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="9" r="1.3" fill="currentColor" stroke="none" />
  </svg>
)
const IcoPhotos = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="14" height="11" rx="1.5" />
    <circle cx="6.5" cy="8.5" r="1.5" />
    <path d="M3 14l3.5-3.5 2.5 2.5 3-3.5 3 3.5" />
  </svg>
)
const IcoLiveSite = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="3" />
    <circle cx="9" cy="9" r="7" strokeDasharray="1.4 2.4" />
  </svg>
)
const IcoDocuments = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2h7l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
    <path d="M11 2v4h4" />
  </svg>
)
const IcoQuestions = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4.5A1.5 1.5 0 013.5 3h11A1.5 1.5 0 0116 4.5v7a1.5 1.5 0 01-1.5 1.5H6l-3.5 3v-3H3.5A1.5 1.5 0 012 11.5v-7z" />
  </svg>
)
const IcoNotifications = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 7.5a4.5 4.5 0 019 0v3l1.5 2h-12l1.5-2v-3z" />
    <path d="M7.5 14.5a1.5 1.5 0 003 0" />
  </svg>
)

function toMobileActive(active: SidebarNavId): MobilePrimaryNavItemId {
  if (active === 'home') return 'home'
  if (active === 'profile') return 'profile'
  return 'projects'
}

function NavItem({
  icon, label, active, onClick, disabled,
}: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      disabled={disabled || !onClick}
      className={[
        'w-full flex items-center border-0 cursor-pointer rounded-xl transition-all duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'md:justify-center md:min-w-11 md:min-h-11 md:w-11 md:h-11 md:mx-auto md:p-0',
        'lg:justify-start lg:w-full lg:h-auto lg:min-w-0 lg:min-h-0 lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3',
        disabled || !onClick ? 'cursor-not-allowed opacity-40' : '',
        active
          ? 'bg-sidebar-accent text-sidebar-primary'
          : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <span
        className="hidden lg:block text-[13px] leading-none font-sans"
      >
        {label}
      </span>
    </button>
  )
}

// Maps this rail's active ids onto the company rail's. Anything without a
// direct equivalent (project sub-screens, Photos, Timeline, ...) is
// highlighted as 'projects', since the company user is inside a project.
function toPartnerActive(active: SidebarNavId): PartnerNavId {
  switch (active) {
    case 'home': return 'home'
    case 'profile': return 'profile'
    case 'advisor': return 'advisor'
    case 'billing': return 'billing'
    case 'settings': return 'settings'
    default: return 'projects'
  }
}

export default function Sidebar({
  active,
  onNavigate,
}: {
  active: SidebarNavId
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  const soleCustomerProjectId = useSoleActiveCustomerProjectId()
  const { audience } = useSubscription()
  const { currentOrganization } = useOrganizations()
  if (audience === 'partner') {
    return <PartnerNavRail active={toPartnerActive(active)} onNavigate={onNavigate} organizationId={currentOrganization?.id} />
  }
  const navMain = [
    { id: 'home' as const, icon: <IcoHome />, label: 'Home', dest: 'dashboard-home' },
    { id: 'projects' as const, icon: <IcoProjects />, label: 'Projects', dest: 'projects-list' },
    { id: 'profile' as const, icon: <IcoProfile />, label: 'Profile', dest: 'homeowner-profile' },
  ]
  // Houzeify 2.0 Module 01 — construction-progress-transparency items, new
  // for the customer-facing nav (constructionNav.ts's CUSTOMER_NAV_ROUTES).
  // Progress/Documents/Questions reuse the real, existing project screens
  // (which now also carry the new ProjectSubNav tab strip); Timeline/Photos/
  // Live Site route to the shared ComingSoonScreen placeholder.
  const navProject = [
    { id: 'progress' as const, icon: <IcoProgress />, label: 'Progress', dest: CUSTOMER_NAV_ROUTES.progress },
    { id: 'timeline' as const, icon: <IcoTimeline />, label: 'Timeline', dest: CUSTOMER_NAV_ROUTES.timeline },
    { id: 'photos' as const, icon: <IcoPhotos />, label: 'Photos', dest: CUSTOMER_NAV_ROUTES.photos },
    { id: 'live-site' as const, icon: <IcoLiveSite />, label: 'Live Site', dest: CUSTOMER_NAV_ROUTES.liveSite },
    { id: 'documents' as const, icon: <IcoDocuments />, label: 'Documents', dest: CUSTOMER_NAV_ROUTES.documents },
    { id: 'questions' as const, icon: <IcoQuestions />, label: 'Questions', dest: CUSTOMER_NAV_ROUTES.questions },
  ]
  const navTools = [
    { id: 'advisor' as const, icon: <IcoAdvisor />, label: 'Hozie', dest: DASHBOARD_ROUTES.aiAdvisor },
  ]
  const navBottom = [
    // Customer Implementation 08E — Settings reaches shared Account Settings
    // (App.tsx role={resolvedRole}). S13 — navBottom now highlights billing /
    // settings / notifications like the rest of this rail.
    { id: 'billing' as const, icon: <IcoBilling />, label: 'Plans & Billing', dest: 'plans-billing' },
    // Houzeify 2.0 Module 01 — new customer nav item; routes to the
    // existing, already-built NotificationsScreen (previously reachable
    // only via a bell icon elsewhere, never from this rail).
    { id: 'notifications' as const, icon: <IcoNotifications />, label: 'Notifications', dest: CUSTOMER_NAV_ROUTES.notifications },
    { id: 'settings' as const, icon: <IcoSettings />, label: 'Settings', dest: 'account-settings' },
  ]

  const onMobileNavigate = (id: MobilePrimaryNavItemId) => {
    if (id === 'home') onNavigate('dashboard-home')
    else if (id === 'projects') onNavigate('projects-list')
    else onNavigate('homeowner-profile')
  }

  return (
    <>
      <aside
        className="hidden md:flex flex-col shrink-0 bg-sidebar text-sidebar-foreground z-10 border-r border-sidebar-border"
      >
        <div className="flex flex-col h-full md:w-[72px] lg:w-[240px]">
          {/* Logo */}
          <div className="h-[64px] shrink-0 flex items-center border-b border-sidebar-border md:justify-center lg:justify-start lg:px-5">
            <img
              src={logoHorizontal}
              alt="Houzeify"
              className="hidden lg:block w-[150px] h-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
            <div className="flex lg:hidden">
              <HIcon size={31} />
            </div>
          </div>

          {/* Main nav */}
          <nav className="flex-1 overflow-y-auto md:p-2 lg:p-3 flex flex-col gap-0.5 scrollbar-hide" aria-label="Customer">
            <div className="flex flex-col gap-0.5">
              {navMain.map(item => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={active === item.id}
                  onClick={() => onNavigate(item.dest)}
                />
              ))}
            </div>

            <div className="my-3 border-t border-sidebar-border" />
            <p className="hidden lg:block text-[12px] tracking-[0.08em] uppercase text-muted-foreground px-3 mb-1.5 font-mono">
              Project
            </p>
            <div className="flex flex-col gap-0.5">
              {navProject.map(item => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={active === item.id}
                  onClick={() => {
                    const needsProject = item.id === 'progress' || item.id === 'timeline' || item.id === 'photos' || item.id === 'documents' || item.id === 'live-site'
                    if (needsProject && soleCustomerProjectId) onNavigate(item.dest, { project_id: soleCustomerProjectId })
                    else if (needsProject) onNavigate('projects-list')
                    else onNavigate(item.dest)
                  }}
                />
              ))}
            </div>

            <div className="my-3 border-t border-sidebar-border" />
            <p className="hidden lg:block text-[12px] tracking-[0.08em] uppercase text-muted-foreground px-3 mb-1.5 font-mono">
              Assistant
            </p>
            <div className="flex flex-col gap-0.5">
              {navTools.map(item => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={active === item.id}
                  onClick={() => onNavigate(item.dest)}
                />
              ))}
            </div>
          </nav>

          <div className="shrink-0 border-t border-sidebar-border md:p-2 lg:p-3 flex flex-col gap-0.5">
            {navBottom.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={active === item.id}
                onClick={item.dest ? () => onNavigate(item.dest) : undefined}
              />
            ))}
          </div>
        </div>
      </aside>
      <MobilePrimaryNav active={toMobileActive(active)} onNavigate={onMobileNavigate} />
    </>
  )
}
