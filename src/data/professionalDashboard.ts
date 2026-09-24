// ─── Professional Dashboard — typed data model + service ───────────────────
// UI demonstration data only — there is no backend yet, and no Opportunity /
// Bid / Message / Notification model exists anywhere in this codebase (the
// same gap HomeDashboardScreen already documents for the homeowner side:
// "No Contractor/Bid data model exists in the codebase yet"). This module
// never fabricates any of them — those quick-stat counts are always 0 and
// their sections always render their real empty state, exactly as the
// Screen 029 brief requires.
//
// IMPORTANT — role stays the sole top-level routing decision (App.tsx /
// primaryIntent.ts). Nothing here decides which dashboard a user lands on;
// this module only shapes what's shown once a professional is already here.

import type { VerificationStatus } from './organizationSetup'
import type { ProfessionalType } from './professionalType'

// ─── Routes — only ever navigate to an id that actually has a render block
// in App.tsx. Entries commented "not yet built" must never be passed to
// onNavigate from this screen; the screen falls back to a disabled/"coming
// soon" affordance instead, mirroring the DASHBOARD_ROUTES convention
// already established in homeownerDashboard.ts. ────────────────────────────
export const PROFESSIONAL_DASHBOARD_ROUTES = {
  aiAdvisor: 'ai-advisor', // S19 — mock Hozie with honest copy until LLM seam exists
  manageProfile: 'business-verification', // 081 — not yet built; closest existing screen that actually shows the professional's saved profile (same fallback Screen 028 already uses for "View Organization Profile")
  team: 'team-setup', // 089 — not yet built as its own screen; reuses the existing team-setup flow
  services: 'service-categories', // existing
  serviceLocations: 'service-locations', // existing
  portfolio: 'portfolio-setup', // existing
  discoverProjects: 'discover-projects', // 030 — existing, wired from this dashboard's sidebar and Quick Actions
  myBids: 'my-bids', // 034 — existing, wired from this dashboard's Quick Actions (11B)
  plansBilling: 'plans-billing', // 15B — existing, shared with the homeowner side (PlansBillingScreen branches by role)
  // messages (094) intentionally has no entry here — 11C retired the global Messages/Conversation
  // Detail screens (they were homeowner-only-gated, had zero real production entry point anywhere,
  // and duplicated what project-messages already covers). The Partner Dashboard's "Messages" quick
  // action stays a plain, unrouted "Coming soon" tile; a real Partner-facing messaging surface would
  // be a new product decision, not a routing fix.
} as const

// ─── Quick stats ────────────────────────────────────────────────────────────

export interface ProfessionalDashboardStats {
  newOpportunities: number
  activeBids: number
  activeProjects: number
  /** null when there isn't enough onboarding data to compute anything real
   *  — never a fabricated percentage. */
  profileStrengthPct: number | null
}

export function getProfessionalDashboardStats(profileStrengthPct: number | null): ProfessionalDashboardStats {
  return {
    // Honest zeros — no opportunity/bid/active-project data model exists
    // yet for this to read from.
    newOpportunities: 0,
    activeBids: 0,
    activeProjects: 0,
    profileStrengthPct,
  }
}

// ─── Profile completion checklist ───────────────────────────────────────────
// Deliberately NOT organizationSetup.ts's buildOrganizationSetupStatus() —
// that function's own doc comment says every step is "complete simply by
// virtue of having reached" the onboarding-complete screen, which is the
// right assumption there but the wrong one here: the professional dashboard
// can be reached before onboarding is fully finished, so this checklist
// reads what's actually present in projectData instead of assuming it.

export interface ProfileChecklistItem {
  id: string
  label: string
  complete: boolean
  /** Where "Complete profile →" sends the user for this specific item. */
  screen: string
}

export interface ProfileChecklistInput {
  hasProfessionalType: boolean
  isOrganization: boolean
  hasCompanyName: boolean
  verificationStatus: VerificationStatus
  hasServices: boolean
  hasServiceLocations: boolean
  hasPortfolioProjects: boolean
  hasTeamMembers: boolean
}

export function buildProfileChecklist(input: ProfileChecklistInput): ProfileChecklistItem[] {
  const items: ProfileChecklistItem[] = [
    { id: 'professional-profile', label: 'Professional profile', complete: input.hasProfessionalType, screen: 'professional-type' },
  ]
  // Organization identity only applies to organization accounts — an
  // individual professional never creates one, so never show it as an
  // incomplete (or complete) step that doesn't apply to them.
  if (input.isOrganization) {
    items.push({ id: 'organization', label: 'Organization', complete: input.hasCompanyName, screen: 'create-organization' })
  }
  items.push(
    { id: 'verification', label: 'Verification', complete: input.verificationStatus === 'verified', screen: 'business-verification' },
    { id: 'services', label: 'Services', complete: input.hasServices, screen: PROFESSIONAL_DASHBOARD_ROUTES.services },
    { id: 'service-locations', label: 'Service locations', complete: input.hasServiceLocations, screen: PROFESSIONAL_DASHBOARD_ROUTES.serviceLocations },
    { id: 'portfolio', label: 'Portfolio', complete: input.hasPortfolioProjects, screen: PROFESSIONAL_DASHBOARD_ROUTES.portfolio },
    { id: 'team', label: 'Team', complete: input.hasTeamMembers, screen: PROFESSIONAL_DASHBOARD_ROUTES.team },
  )
  return items
}

export function profileCompletionPercent(items: ProfileChecklistItem[]): number {
  if (items.length === 0) return 0
  return Math.round((items.filter(i => i.complete).length / items.length) * 100)
}

/** Where "Complete profile →" navigates — the first incomplete item's
 *  screen, or the profile view itself once everything is done. */
export function nextIncompleteProfileScreen(items: ProfileChecklistItem[]): string {
  return items.find(i => !i.complete)?.screen ?? PROFESSIONAL_DASHBOARD_ROUTES.manageProfile
}

// ─── Professional-type personalization — content only, never routing ──────
// professionalType must never decide the top-level dashboard route (role
// alone does that); this only adapts copy within the already-routed
// professional dashboard.

export function opportunityLabelForProfessionalType(type: ProfessionalType | undefined): string {
  switch (type) {
    case 'builder-construction-company':
      return 'Construction opportunities'
    case 'general-contractor':
      return 'Construction & contracting opportunities'
    case 'specialist-contractor':
      return 'Specialist trade opportunities'
    case 'architect-designer':
      return 'Architecture & design opportunities'
    case 'interior-designer':
      return 'Interior/design opportunities'
    case 'home-service-professional':
      return 'Service opportunities'
    case 'supplier-material-provider':
      return 'Material supply opportunities'
    default:
      return 'Project opportunities'
  }
}
