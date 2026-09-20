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
// IA: Home / Build / Services / Projects / Profile as primary nav, with
// Hozie / Contractors / Bids / BOQ / Plan Analysis / Material Calculator
// under "Tools" — matching the dashboard's own target customer IA.
//
// Not used by the professional-role screens (ProfessionalDashboardScreen,
// DiscoverProjectsScreen, MyBidsScreen), which have a distinct nav for a
// distinct role and stay as their own local components.

import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { CUSTOMER_NAV_ROUTES } from '@/data/constructionNav'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import HIcon from './HIcon'

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
const IcoBuild = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13h12" />
    <path d="M5 13V9a4 4 0 018 0v4" />
    <line x1="9" y1="4" x2="9" y2="6.5" />
  </svg>
)
const IcoServices = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="1.5" />
    <line x1="6" y1="6.5" x2="12" y2="6.5" />
    <line x1="6" y1="9.5" x2="12" y2="9.5" />
    <line x1="6" y1="12.5" x2="10" y2="12.5" />
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
const IcoContractors = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="5.5" r="2.25" />
    <path d="M2 15v-1a4.5 4.5 0 019 0v1" />
    <circle cx="13" cy="6.5" r="1.9" />
    <path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" />
  </svg>
)
const IcoBids = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 15.5V9.5L9 3l6 6.5v6" />
    <path d="M6.5 15.5V11h5v4.5" />
  </svg>
)
const IcoBOQ = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3.5" cy="5" r="0.8" fill="currentColor" stroke="none" />
    <line x1="6.5" y1="5" x2="15" y2="5" />
    <circle cx="3.5" cy="9" r="0.8" fill="currentColor" stroke="none" />
    <line x1="6.5" y1="9" x2="15" y2="9" />
    <circle cx="3.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
    <line x1="6.5" y1="13" x2="15" y2="13" />
  </svg>
)
const IcoPlan = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="14" rx="2" />
    <line x1="2" y1="7.5" x2="16" y2="7.5" />
    <line x1="7.5" y1="7.5" x2="7.5" y2="16" />
  </svg>
)
const IcoCalc = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="1.5" />
    <rect x="5.5" y="4.5" width="7" height="2.5" rx="0.5" />
    <circle cx="6" cy="10" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="9" cy="10" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="6" cy="13" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="9" cy="13" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="12" cy="13" r="0.7" fill="currentColor" stroke="none" />
  </svg>
)
const IcoHelp = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7" />
    <path d="M6.5 6.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 3.5" />
    <circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none" />
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

function NavItem({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={[
        'w-full flex items-center border-0 cursor-pointer rounded-[12px] transition-all duration-150 outline-none',
        'md:justify-center md:w-[40px] md:h-[40px] md:mx-auto md:p-0',
        'lg:justify-start lg:w-full lg:h-auto lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3',
        active
          ? 'bg-[#F3EAFF] text-[#722ED1]'
          : 'bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326]',
      ].join(' ')}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">
        {icon}
      </span>
      <span
        className="hidden lg:block text-[13px] leading-none"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        {label}
      </span>
    </button>
  )
}

export default function Sidebar({
  active,
  onNavigate,
}: {
  active: SidebarNavId
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  const navMain = [
    { id: 'home' as const, icon: <IcoHome />, label: 'Home', dest: 'dashboard-home' },
    { id: 'build' as const, icon: <IcoBuild />, label: 'Build', dest: DASHBOARD_ROUTES.buildOrImprove },
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
    { id: 'contractors' as const, icon: <IcoContractors />, label: 'Contractors', dest: DASHBOARD_ROUTES.findContractors },
    { id: 'bids' as const, icon: <IcoBids />, label: 'Bids', dest: DASHBOARD_ROUTES.bidsReceived },
    { id: 'boq' as const, icon: <IcoBOQ />, label: 'BOQ', dest: DASHBOARD_ROUTES.boqOverview },
    { id: 'plan' as const, icon: <IcoPlan />, label: 'Plan Analysis', dest: DASHBOARD_ROUTES.uploadPlan },
    { id: 'calc' as const, icon: <IcoCalc />, label: 'Material Calculator', dest: 'material-calculator' },
    // Houzeify 2.0 Module 01 — Home Services is now LEGACY: the "Home
    // Services marketplace" concept this app started as is being replaced
    // by the construction-progress-transparency platform (see
    // constructionNav.ts's header comment). Demoted out of the primary
    // nav section into Tools per the module brief ("remove from PRIMARY
    // navigation only, without deleting or breaking shared code") — every
    // Home Services screen, booking flow and store is untouched and still
    // fully reachable from here.
    { id: 'services' as const, icon: <IcoServices />, label: 'Services', dest: DASHBOARD_ROUTES.homeServices, data: { service_entry: '', service_group: '', open_picker: '', search_query: '' } },
  ]
  const navBottom = [
    // Customer Implementation 08E — Settings now reaches the existing
    // shared Account Settings screen (App.tsx routes it with
    // role={resolvedRole}, so a homeowner lands on the homeowner branch;
    // this rail is homeowner-only and never rendered for Partner). Help
    // stays intentionally inert — no Help screen exists to wire it to.
    { id: 'help', icon: <IcoHelp />, label: 'Help', dest: '' },
    // 15B — Plans & Billing. Same "never highlighted" convention as Help/
    // Settings above (navBottom items don't pass `active` to NavItem);
    // matches this rail's own existing behavior rather than fixing it here.
    { id: 'billing', icon: <IcoBilling />, label: 'Plans & Billing', dest: 'plans-billing' },
    // Houzeify 2.0 Module 01 — new customer nav item; routes to the
    // existing, already-built NotificationsScreen (previously reachable
    // only via a bell icon elsewhere, never from this rail).
    { id: 'notifications' as const, icon: <IcoNotifications />, label: 'Notifications', dest: CUSTOMER_NAV_ROUTES.notifications },
    { id: 'settings', icon: <IcoSettings />, label: 'Settings', dest: 'account-settings' },
  ]

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 bg-white z-10"
      style={{ borderRight: '1px solid #F4F0EC' }}
    >
      <div className="flex flex-col h-full md:w-[72px] lg:w-[240px]">
        {/* Logo */}
        <div className="h-[64px] shrink-0 flex items-center border-b border-[#E3DDD7] md:justify-center lg:justify-start lg:px-5">
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
        <nav className="flex-1 overflow-y-auto md:p-2 lg:p-3 flex flex-col gap-0.5 scrollbar-hide">
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

          <div className="my-3 border-t border-[#E3DDD7]" />
          <p className="hidden lg:block text-[12px] tracking-[0.08em] uppercase text-[#9A949D] px-3 mb-1.5" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
            Project
          </p>
          <div className="flex flex-col gap-0.5">
            {navProject.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={active === item.id}
                onClick={() => onNavigate(item.dest)}
              />
            ))}
          </div>

          <div className="my-3 border-t border-[#E3DDD7]" />
          <p className="hidden lg:block text-[12px] tracking-[0.08em] uppercase text-[#9A949D] px-3 mb-1.5" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
            Tools
          </p>
          <div className="flex flex-col gap-0.5">
            {navTools.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={active === item.id}
                onClick={() => onNavigate(item.dest, 'data' in item ? item.data : undefined)}
              />
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-[#E3DDD7] md:p-2 lg:p-3 flex flex-col gap-0.5">
          {navBottom.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              onClick={item.dest ? () => onNavigate(item.dest) : undefined}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
