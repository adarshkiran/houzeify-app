// ─── Shared homeowner Sidebar ───────────────────────────────────────────────
// Single source of truth for the left nav rail on every homeowner-facing
// screen. Company (professional-role) users: for the 'partner' subscription
// audience this renders PartnerNavRail instead.

import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { CUSTOMER_NAV_ROUTES } from '@/data/constructionNav'
import { useSoleActiveCustomerProjectId } from '@/data/customerProjectsState'
import { useCustomerProfile } from '@/data/customerProfileState'
import { useSubscription } from '@/data/subscriptionState'
import { useOrganizations } from '@/data/organizationState'
import AppNavShell, { type AppNavSection } from './AppNavShell'
import { type MobilePrimaryNavItemId } from './MobilePrimaryNav'
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
  const customerProfile = useCustomerProfile()

  if (audience === 'partner') {
    return (
      <PartnerNavRail
        active={toPartnerActive(active)}
        onNavigate={onNavigate}
        organizationId={currentOrganization?.id}
      />
    )
  }

  const goProject = (dest: string, id: SidebarNavId) => {
    const needsProject =
      id === 'progress' || id === 'timeline' || id === 'photos' || id === 'documents' || id === 'live-site'
    if (needsProject && soleCustomerProjectId) onNavigate(dest, { project_id: soleCustomerProjectId })
    else if (needsProject) onNavigate('projects-list')
    else onNavigate(dest)
  }

  const sections: AppNavSection[] = [
    {
      id: 'primary',
      items: [
        { id: 'home', icon: <IcoHome />, label: 'Home', active: active === 'home', onClick: () => onNavigate('dashboard-home') },
        { id: 'projects', icon: <IcoProjects />, label: 'Projects', active: active === 'projects', onClick: () => onNavigate('projects-list') },
        { id: 'profile', icon: <IcoProfile />, label: 'Profile', active: active === 'profile', onClick: () => onNavigate('homeowner-profile') },
      ],
    },
    {
      id: 'project',
      label: 'Project',
      defaultOpen: true,
      items: [
        { id: 'progress', icon: <IcoProgress />, label: 'Progress', active: active === 'progress', onClick: () => goProject(CUSTOMER_NAV_ROUTES.progress, 'progress') },
        { id: 'timeline', icon: <IcoTimeline />, label: 'Timeline', active: active === 'timeline', onClick: () => goProject(CUSTOMER_NAV_ROUTES.timeline, 'timeline') },
        { id: 'photos', icon: <IcoPhotos />, label: 'Photos', active: active === 'photos', onClick: () => goProject(CUSTOMER_NAV_ROUTES.photos, 'photos') },
        { id: 'live-site', icon: <IcoLiveSite />, label: 'Live Site', active: active === 'live-site', onClick: () => goProject(CUSTOMER_NAV_ROUTES.liveSite, 'live-site') },
        { id: 'documents', icon: <IcoDocuments />, label: 'Documents', active: active === 'documents', onClick: () => goProject(CUSTOMER_NAV_ROUTES.documents, 'documents') },
        { id: 'questions', icon: <IcoQuestions />, label: 'Questions', active: active === 'questions', onClick: () => onNavigate(CUSTOMER_NAV_ROUTES.questions) },
      ],
    },
    {
      id: 'assistant',
      label: 'Assistant',
      defaultOpen: true,
      items: [
        { id: 'advisor', icon: <IcoAdvisor />, label: 'Hozie', active: active === 'advisor', onClick: () => onNavigate(DASHBOARD_ROUTES.aiAdvisor) },
      ],
    },
  ]

  const footerItems = [
    { id: 'billing', icon: <IcoBilling />, label: 'Plans & Billing', active: active === 'billing', onClick: () => onNavigate('plans-billing') },
    { id: 'notifications', icon: <IcoNotifications />, label: 'Notifications', active: active === 'notifications', onClick: () => onNavigate(CUSTOMER_NAV_ROUTES.notifications) },
    { id: 'settings', icon: <IcoSettings />, label: 'Settings', active: active === 'settings', onClick: () => onNavigate('account-settings') },
  ]

  const displayName =
    customerProfile.profile?.preferredName ||
    customerProfile.profile?.fullName ||
    'Homeowner'
  const subtitle = customerProfile.profile?.email ?? undefined

  const onMobileNavigate = (id: MobilePrimaryNavItemId) => {
    if (id === 'home') onNavigate('dashboard-home')
    else if (id === 'projects') onNavigate('projects-list')
    else onNavigate('homeowner-profile')
  }

  return (
    <AppNavShell
      ariaLabel="Customer"
      sections={sections}
      footerItems={footerItems}
      profile={{
        name: displayName,
        subtitle,
        onClick: () => onNavigate('homeowner-profile'),
      }}
      mobileActive={toMobileActive(active)}
      onMobileNavigate={onMobileNavigate}
    />
  )
}
