// ─── Shared company/partner Nav Rail ────────────────────────────────────────
// Construction-platform primary nav for company/partner users. Destinations
// unchanged; chrome comes from AppNavShell.

import { COMPANY_NAV_ROUTES } from '@/data/constructionNav'
import { useOrganizations } from '@/data/organizationState'
import { usePartnerProfile } from '@/data/partnerProfileState'
import AppNavShell, { type AppNavSection } from './AppNavShell'
import { type MobilePrimaryNavItemId } from './MobilePrimaryNav'

export type PartnerNavId =
  | 'home' | 'projects' | 'progress' | 'site-operations' | 'workforce' | 'live-site'
  | 'documents' | 'reports' | 'team' | 'estimation' | 'profile' | 'advisor' | 'settings'
  | 'opportunities' | 'bids' | 'billing'

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
const IcoEstimation = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3.5h10v11H4z" /><path d="M6.5 7h5M6.5 10h5M6.5 13h3" /></svg>
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

function toMobileActive(active: PartnerNavId): MobilePrimaryNavItemId {
  if (active === 'home') return 'home'
  if (active === 'profile') return 'profile'
  return 'projects'
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
  organizationId?: string
  opportunitiesLocked?: boolean
  onSignOut?: () => void
}) {
  const { currentOrganization } = useOrganizations()
  const partnerProfile = usePartnerProfile()

  const go = (dest: string) => onNavigate(dest, organizationId ? { organization_id: organizationId } : undefined)

  const sections: AppNavSection[] = [
    {
      id: 'company',
      items: [
        { id: 'home', icon: <IcoHome />, label: 'Home', active: active === 'home', onClick: () => go(COMPANY_NAV_ROUTES.home) },
        { id: 'projects', icon: <IcoProjects />, label: 'Projects', active: active === 'projects', onClick: () => go(COMPANY_NAV_ROUTES.projects) },
        { id: 'progress', icon: <IcoProgress />, label: 'Progress', active: active === 'progress', onClick: () => go(COMPANY_NAV_ROUTES.progress) },
        { id: 'site-operations', icon: <IcoSiteOps />, label: 'Site Operations', active: active === 'site-operations', onClick: () => go(COMPANY_NAV_ROUTES.siteOperations) },
        { id: 'workforce', icon: <IcoWorkforce />, label: 'Workforce', active: active === 'workforce', onClick: () => go(COMPANY_NAV_ROUTES.workforce) },
        { id: 'live-site', icon: <IcoLiveSite />, label: 'Live Site', active: active === 'live-site', onClick: () => go(COMPANY_NAV_ROUTES.liveSite) },
        { id: 'documents', icon: <IcoDocuments />, label: 'Documents', active: active === 'documents', onClick: () => go(COMPANY_NAV_ROUTES.documents) },
        { id: 'reports', icon: <IcoReports />, label: 'Reports', active: active === 'reports', onClick: () => go(COMPANY_NAV_ROUTES.reports) },
        { id: 'team', icon: <IcoTeam />, label: 'Team', active: active === 'team', onClick: () => go(COMPANY_NAV_ROUTES.team) },
        { id: 'estimation', icon: <IcoEstimation />, label: 'Estimation', active: active === 'estimation', onClick: () => go(COMPANY_NAV_ROUTES.estimation) },
        { id: 'profile', icon: <IcoProfile />, label: 'Profile', active: active === 'profile', onClick: () => go(COMPANY_NAV_ROUTES.profile) },
      ],
    },
    {
      id: 'business',
      label: 'Business Development',
      defaultOpen: true,
      items: [
        {
          id: 'opportunities',
          icon: <IcoOpportunities />,
          label: 'Opportunities',
          active: active === 'opportunities',
          locked: opportunitiesLocked,
          onClick: opportunitiesLocked ? undefined : () => go(COMPANY_NAV_ROUTES.discoverProjects),
        },
        { id: 'bids', icon: <IcoBids />, label: 'My Bids', active: active === 'bids', onClick: () => go(COMPANY_NAV_ROUTES.myBids) },
      ],
    },
  ]

  const footerItems = [
    { id: 'advisor', icon: <IcoAdvisor />, label: 'Hozie', active: active === 'advisor', onClick: () => go(COMPANY_NAV_ROUTES.aiAdvisor) },
    { id: 'billing', icon: <IcoBilling />, label: 'Plans & Billing', active: active === 'billing', onClick: () => go(COMPANY_NAV_ROUTES.plansBilling) },
    { id: 'settings', icon: <IcoSettings />, label: 'Settings', active: active === 'settings', onClick: () => go(COMPANY_NAV_ROUTES.settings) },
  ]

  const orgName = currentOrganization?.name
  const displayName =
    orgName ||
    partnerProfile.profile?.displayName ||
    partnerProfile.profile?.fullName ||
    'Your company'
  const subtitle =
    partnerProfile.profile?.contactEmail ||
    (orgName ? 'Organization' : undefined)

  const onMobileNavigate = (id: MobilePrimaryNavItemId) => {
    if (id === 'home') go(COMPANY_NAV_ROUTES.home)
    else if (id === 'projects') go(COMPANY_NAV_ROUTES.projects)
    else go(COMPANY_NAV_ROUTES.profile)
  }

  return (
    <AppNavShell
      ariaLabel="Company"
      sections={sections}
      footerItems={footerItems}
      profile={{
        name: displayName,
        subtitle,
        onClick: () => go(COMPANY_NAV_ROUTES.profile),
      }}
      onSignOut={onSignOut}
      mobileActive={toMobileActive(active)}
      onMobileNavigate={onMobileNavigate}
    />
  )
}
