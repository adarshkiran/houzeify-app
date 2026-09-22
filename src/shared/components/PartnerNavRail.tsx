// ─── Shared company/partner Nav Rail ────────────────────────────────────────
// Houzeify 2.0 Module 01 — the construction-platform primary nav for
// company/partner users. Before this module, ProfessionalDashboardScreen,
// DiscoverProjectsScreen and MyBidsScreen each carried their own
// byte-different local `Sidebar`/`NavItem` pair (confirmed by inspection —
// same drift risk shared/components/Sidebar.tsx's own header comment
// documents for the homeowner side, which is exactly why that one was
// centralized). This is the same fix, applied here: one item list, one set
// of destinations, used by all three screens.
//
// IA: Home / Projects / Progress / Site Operations / Workforce / Live Site /
// Documents / Reports / Team / Profile as primary nav, Hozie / Settings at
// the tail — matching the Module 01 brief's company-side navigation. Bids/
// Opportunities marketplace items ("Business Development") are demoted into
// their own secondary section, never deleted — still one click away.

import { COMPANY_NAV_ROUTES } from '@/data/constructionNav'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import HIcon from './HIcon'
import { MobilePrimaryNav, type MobilePrimaryNavItemId } from './MobilePrimaryNav'

export type PartnerNavId =
  | 'home' | 'projects' | 'progress' | 'site-operations' | 'workforce' | 'live-site'
  | 'documents' | 'reports' | 'team' | 'profile' | 'advisor' | 'settings'
  | 'opportunities' | 'bids' | 'billing'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9L9 3l7 6" /><path d="M4 8v8h3.5v-4h3v4H14V8" /></svg>
)
const IcoProjects = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z" /></svg>
)
const IcoProgress = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M9 5v4l3 2" /></svg>
)
const IcoSiteOps = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13h12" /><path d="M5 13V9a4 4 0 018 0v4" /><line x1="9" y1="4" x2="9" y2="6.5" /></svg>
)
const IcoWorkforce = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.25" /><path d="M2 15v-1a4.5 4.5 0 019 0v1" /><circle cx="13" cy="6.5" r="1.9" /><path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" /></svg>
)
const IcoLiveSite = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="3.2" /><circle cx="9" cy="9" r="7" strokeDasharray="1.5 2.5" /></svg>
)
const IcoDocuments = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M11 2v4h4" /></svg>
)
const IcoReports = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="12" height="14" rx="1.5" /><line x1="6" y1="6.5" x2="12" y2="6.5" /><line x1="6" y1="9.5" x2="12" y2="9.5" /><line x1="6" y1="12.5" x2="10" y2="12.5" /></svg>
)
const IcoTeam = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="6.5" r="2.6" /><circle cx="13" cy="7.3" r="2" /><path d="M2.2 16c0-2.6 2-4.6 4.8-4.6s4.8 2 4.8 4.6" /><path d="M12 11.6c1.9.3 3.3 1.8 3.3 3.7" /></svg>
)
const IcoProfile = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="3" /><path d="M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /></svg>
)
const IcoAdvisor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1.5L10.6 5.4L14.5 7 10.6 8.6 9 12.5 7.4 8.6 3.5 7l3.9-1.6L9 1.5z" /></svg>
)
const IcoSettings = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="2.5" /><path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.06 1.06M12.84 12.84l1.06 1.06M4.1 13.9l1.06-1.06M12.84 5.16l1.06-1.06" /></svg>
)
const IcoOpportunities = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="6.5" /><path d="M9 5.5v3.5l2.5 1.5" /></svg>
)
const IcoBids = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15.5V9.5L9 3l6 6.5v6" /><path d="M6.5 15.5V11h5v4.5" /></svg>
)
const IcoBilling = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="14" height="10.5" rx="1.5" /><line x1="2" y1="7.5" x2="16" y2="7.5" /><line x1="4.5" y1="11.5" x2="8" y2="11.5" /></svg>
)
const LockIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6.5" width="8" height="6" rx="1.2" /><path d="M4.7 6.5V4.5a2.3 2.3 0 0 1 4.6 0v2" /></svg>
)

function toMobileActive(active: PartnerNavId): MobilePrimaryNavItemId {
  if (active === 'home') return 'home'
  if (active === 'profile') return 'profile'
  return 'projects'
}

function NavItem({
  icon, label, active, disabled, locked, onClick,
}: {
  icon: React.ReactNode; label: string; active?: boolean; disabled?: boolean; locked?: boolean; onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={locked ? `${label} — locked until your identity is verified` : label}
      aria-label={locked ? `${label} — locked until your identity is verified` : label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-full flex items-center border-0 cursor-pointer rounded-[12px] transition-all duration-150 text-left',
        'outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2',
        'md:justify-center md:min-w-11 md:min-h-11 md:w-11 md:h-11 md:mx-auto md:p-0',
        'lg:justify-start lg:w-full lg:h-auto lg:min-w-0 lg:min-h-0 lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3',
        disabled ? 'cursor-not-allowed opacity-40' : '',
        active
          ? 'bg-[#F3EAFF] text-[#722ED1]'
          : disabled ? 'bg-transparent text-[#9A949D]' : 'bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326]',
      ].join(' ')}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center" aria-hidden="true">{icon}</span>
      <span className="hidden lg:flex items-center gap-1.5 text-[13px] leading-none" style={{ fontFamily: FONT_BODY }}>
        {label}
        {locked && <LockIcon />}
      </span>
    </button>
  )
}

export default function PartnerNavRail({
  active,
  onNavigate,
  organizationId,
  opportunitiesLocked,
  onSignOut,
}: {
  active: PartnerNavId
  onNavigate: (s: string, data?: Record<string, string>) => void
  /** Threaded into Opportunities/My Bids so the marketplace surfaces keep
   *  the organization context they already relied on from the old local
   *  sidebars (ProfessionalDashboardScreen passed `{organization_id}` on
   *  every navMain click). */
  organizationId?: string
  /** True while identity verification hasn't reached 'verified' — locks
   *  the Opportunities item, same gating ProfessionalDashboardScreen's old
   *  local sidebar already had (identityVerification.ts's
   *  resolvePartnerAccessLevel). Undefined/false everywhere else. */
  opportunitiesLocked?: boolean
  /** Only ProfessionalDashboardScreen has a real Sign Out modal today;
   *  DiscoverProjectsScreen/MyBidsScreen render the rail without this and
   *  simply don't show the Sign Out row, unchanged from their prior
   *  behavior (neither had one before). */
  onSignOut?: () => void
}) {
  const navMain = [
    { id: 'home' as const, icon: <IcoHome />, label: 'Home', dest: COMPANY_NAV_ROUTES.home },
    { id: 'projects' as const, icon: <IcoProjects />, label: 'Projects', dest: COMPANY_NAV_ROUTES.projects },
    { id: 'progress' as const, icon: <IcoProgress />, label: 'Progress', dest: COMPANY_NAV_ROUTES.progress },
    { id: 'site-operations' as const, icon: <IcoSiteOps />, label: 'Site Operations', dest: COMPANY_NAV_ROUTES.siteOperations },
    { id: 'workforce' as const, icon: <IcoWorkforce />, label: 'Workforce', dest: COMPANY_NAV_ROUTES.workforce },
    { id: 'live-site' as const, icon: <IcoLiveSite />, label: 'Live Site', dest: COMPANY_NAV_ROUTES.liveSite },
    { id: 'documents' as const, icon: <IcoDocuments />, label: 'Documents', dest: COMPANY_NAV_ROUTES.documents },
    { id: 'reports' as const, icon: <IcoReports />, label: 'Reports', dest: COMPANY_NAV_ROUTES.reports },
    { id: 'team' as const, icon: <IcoTeam />, label: 'Team', dest: COMPANY_NAV_ROUTES.team },
    { id: 'profile' as const, icon: <IcoProfile />, label: 'Profile', dest: COMPANY_NAV_ROUTES.profile },
  ]
  const navBusiness = [
    { id: 'opportunities' as const, icon: <IcoOpportunities />, label: 'Opportunities', dest: COMPANY_NAV_ROUTES.discoverProjects, locked: opportunitiesLocked },
    { id: 'bids' as const, icon: <IcoBids />, label: 'My Bids', dest: COMPANY_NAV_ROUTES.myBids },
  ]
  const navBottom = [
    { id: 'advisor' as const, icon: <IcoAdvisor />, label: 'Hozie', dest: COMPANY_NAV_ROUTES.aiAdvisor },
    { id: 'billing' as const, icon: <IcoBilling />, label: 'Plans & Billing', dest: COMPANY_NAV_ROUTES.plansBilling },
    { id: 'settings' as const, icon: <IcoSettings />, label: 'Settings', dest: COMPANY_NAV_ROUTES.settings },
  ]

  const go = (dest: string) => onNavigate(dest, organizationId ? { organization_id: organizationId } : undefined)

  const onMobileNavigate = (id: MobilePrimaryNavItemId) => {
    if (id === 'home') go(COMPANY_NAV_ROUTES.home)
    else if (id === 'projects') go(COMPANY_NAV_ROUTES.projects)
    else go(COMPANY_NAV_ROUTES.profile)
  }

  return (
    <>
      <aside className="hidden md:flex flex-col shrink-0 bg-white z-10" style={{ borderRight: '1px solid #F4F0EC' }}>
        <div className="flex flex-col h-full md:w-[72px] lg:w-[240px]">
          <div className="h-[64px] shrink-0 flex items-center border-b border-[#E3DDD7] md:justify-center lg:justify-start lg:px-5">
            <img src={logoHorizontal} alt="Houzeify" className="hidden lg:block w-[150px] h-auto" style={{ mixBlendMode: 'multiply' }} />
            <div className="flex lg:hidden"><HIcon size={31} /></div>
          </div>

          <nav className="flex-1 overflow-y-auto md:p-2 lg:p-3 flex flex-col gap-0.5 scrollbar-hide" aria-label="Company">
            <div className="flex flex-col gap-0.5">
              {navMain.map(item => (
                <NavItem key={item.id} icon={item.icon} label={item.label} active={active === item.id} onClick={() => go(item.dest)} />
              ))}
            </div>

            <div className="my-3 border-t border-[#E3DDD7]" />
            <p className="hidden lg:block text-[12px] tracking-[0.08em] uppercase text-[#9A949D] px-3 mb-1.5" style={{ fontFamily: FONT_MONO }}>
              Business Development
            </p>
            <div className="flex flex-col gap-0.5">
              {navBusiness.map(item => (
                <NavItem key={item.id} icon={item.icon} label={item.label} active={active === item.id} locked={item.locked} onClick={() => { if (item.locked) return; go(item.dest) }} />
              ))}
            </div>
          </nav>

          <div className="shrink-0 border-t border-[#E3DDD7] md:p-2 lg:p-3 flex flex-col gap-0.5">
            {navBottom.map(item => (
              <NavItem key={item.id} icon={item.icon} label={item.label} active={active === item.id} onClick={() => go(item.dest)} />
            ))}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out"
                className="w-full flex items-center border-0 cursor-pointer rounded-[12px] transition-all duration-150 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2 md:justify-center md:min-w-11 md:min-h-11 md:w-11 md:h-11 md:mx-auto md:p-0 lg:justify-start lg:w-full lg:h-auto lg:min-w-0 lg:min-h-0 lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3 bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#DC2626]"
              >
                <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 15.5H4a1.5 1.5 0 01-1.5-1.5V4A1.5 1.5 0 014 2.5h3" /><path d="M12 12.5l4-3.5-4-3.5" /><line x1="16" y1="9" x2="6.5" y2="9" /></svg>
                </span>
                <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: FONT_BODY }}>Sign out</span>
              </button>
            )}
          </div>
        </div>
      </aside>
      <MobilePrimaryNav active={toMobileActive(active)} onNavigate={onMobileNavigate} />
    </>
  )
}
