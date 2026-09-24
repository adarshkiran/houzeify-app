/** Screen 13 — Customer Profile + Settings SHARED polish routes. */
export const CUSTOMER_PROFILE_ROUTE = 'homeowner-profile' as const

export const SHARED_SETTINGS_ROUTES = [
  'account-settings',
  'personal-profile',
  'plans-billing',
  'ai-advisor',
] as const

export type SharedSettingsRoute = (typeof SHARED_SETTINGS_ROUTES)[number]

/** Construction-record oriented Hozie chips on Customer Profile — no estimate/build/HS. */
export const CUSTOMER_PROFILE_HOZIE_USES = [
  'Shared progress updates',
  'Project stage questions',
  'Construction record clarity',
] as const

/**
 * Profile "Current Project" prefers an active linked project, then an invite.
 * Never invents a row when the customer has no linked projects.
 */
export function pickCustomerProfileCurrentProject<T extends { customerStatus: string }>(
  projects: readonly T[],
): T | null {
  const active = projects.find(p => p.customerStatus === 'active')
  if (active) return active
  const invited = projects.find(p => p.customerStatus === 'invited')
  return invited ?? null
}

/** Role-aware home for SHARED Settings / Hozie back affordances. */
export function sharedSettingsHomeRoute(
  role: string | undefined,
): 'professional-dashboard' | 'dashboard-home' {
  return role === 'professional' ? 'professional-dashboard' : 'dashboard-home'
}

/** Same S11 binding: idle is loading only while authenticated. */
export function customerProfileProjectsLoading(
  authStatus: string,
  projectsStatus: string,
): boolean {
  return (
    authStatus === 'loading'
    || projectsStatus === 'loading'
    || (authStatus === 'authenticated' && projectsStatus === 'idle')
  )
}

/** Customer Sidebar highlight for Account Settings (navBottom). */
export function customerSidebarSettingsActive(): 'settings' {
  return 'settings'
}
