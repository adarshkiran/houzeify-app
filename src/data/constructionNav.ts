// ─── Houzeify 2.0 — Construction Platform Navigation (Module 01) ───────────
// Central registry for the three navigation architectures this module
// introduces: the company/partner primary nav (PartnerNavRail), the
// project-context sub-nav (ProjectSubNav), and the new customer-facing
// nav items layered onto the existing homeowner Sidebar. Follows the same
// "*_ROUTES, only ever navigate to an id with a real render block" contract
// already established by homeownerDashboard.ts's DASHBOARD_ROUTES and
// professionalDashboard.ts's PROFESSIONAL_DASHBOARD_ROUTES.
//
// Every route below either points at an existing, working screen (reused
// as-is — see each comment) or at a NEW placeholder id backed by the
// shared ComingSoonScreen (src/shared/screens/ComingSoonScreen.tsx) and
// registered in App.tsx this same module. None of the placeholder ids
// build the real feature behind them (Daily Progress, Workforce tracking,
// Live Site cameras, advanced Reports/BOQ, ...) — that is explicitly out
// of scope for Module 01; see the ticket's "DO NOT BUILD YET" list.

// ─── Company / Partner primary navigation ──────────────────────────────────
// Replaces the three independently-duplicated local sidebars in
// ProfessionalDashboardScreen / DiscoverProjectsScreen / MyBidsScreen
// (see PartnerNavRail.tsx) with one shared rail, same consolidation the
// homeowner side already went through for shared/components/Sidebar.tsx.

export const COMPANY_NAV_ROUTES = {
  home: 'professional-dashboard', // existing
  // Module 03 — real, organization-scoped company Projects List (was a
  // ComingSoonScreen placeholder through Module 01/02).
  projects: 'company-projects',
  progress: 'company-progress', // C19 — Company Progress Rollup (real)
  siteOperations: 'site-operations', // C23 — Company Site Operations (real)
  workforce: 'workforce', // NEW placeholder
  liveSite: 'live-site', // S18 — KEEP COMING SOON until camera/storage infra
  documents: 'company-documents', // NEW placeholder
  reports: 'company-reports', // C20 — Construction Record index (real)
  // Module 02 fix — these two previously pointed at the wrong screens
  // (inherited unchanged from PROFESSIONAL_DASHBOARD_ROUTES, which predates
  // the Company Workspace concept): 'team-setup' is the invite-composer
  // onboarding flow, not a roster; 'business-verification' is the
  // verification form, not a profile view. TeamManagementScreen and
  // CompanyProfileScreen are the closer canonical fits (see each screen's
  // own header comment for the full reasoning).
  team: 'team-management',
  profile: 'company-profile',
  aiAdvisor: 'ai-advisor', // S19 — mock Hozie with honest copy until LLM seam exists
  settings: 'account-settings', // existing — already branches on role; not previously wired from the partner dashboard's own sidebar (its old Settings item was a dead '' stub)
  // Business Development — moved out of the primary rail into its own
  // demoted section (still fully reachable, never deleted).
  discoverProjects: 'discover-projects', // S20 — C12 protected BD; empty mock until marketplace API
  myBids: 'my-bids', // S20 — C12 protected BD; empty mock until marketplace API
  plansBilling: 'plans-billing', // existing, shared with the homeowner side
} as const

export type CompanyNavId =
  | 'home' | 'projects' | 'progress' | 'site-operations' | 'workforce' | 'live-site'
  | 'documents' | 'reports' | 'team' | 'profile' | 'advisor'

// ─── Project-context navigation ─────────────────────────────────────────────
// No shared project-level sub-nav existed before this module — every
// project screen was reachable only one-way, from ProjectWorkspaceScreen's
// launcher grid (see the Module 01 survey). ProjectSubNav.tsx is the new
// shared tab strip; mounted into ProjectWorkspaceScreen and the five
// existing project sub-screens (Overview/Team/Documents/Tasks/Progress),
// additive — none of those screens' own content is removed or replaced.

export const PROJECT_NAV_ROUTES = {
  overview: 'project-overview', // existing
  progress: 'project-progress', // existing
  timeline: 'project-timeline', // NEW placeholder
  tasks: 'project-tasks', // existing
  issues: 'project-issues', // NEW placeholder
  workforce: 'project-workforce', // NEW placeholder
  liveSite: 'project-live-site', // S18 — KEEP COMING SOON until camera/storage infra
  documents: 'project-documents', // existing
  boq: 'project-boq', // renders ProjectBoqScreen — deliberately distinct from the homeowner New-Build BOQ flow (boq-overview/detailed-boq/...), which is estimate-authoring, not a project-workspace record
  team: 'project-team', // existing
  customer: 'project-customer',
  photos: 'project-photos',
  reports: 'project-reports',
  settings: 'project-settings', // S15 — ProjectSettingsScreen (name / stage / location)
} as const

export type ProjectNavId = keyof typeof PROJECT_NAV_ROUTES

// ─── Customer-facing navigation additions ──────────────────────────────────
// Layered onto the existing shared Sidebar.tsx (src/shared/components/
// Sidebar.tsx) — every existing item/destination there stays exactly as
// it is; these are additive new items, plus 'services' is demoted out of
// the primary section (still reachable, never deleted — see Sidebar.tsx).
// Progress/Documents/Questions deliberately reuse the real project screens
// (now also carrying ProjectSubNav) rather than minting parallel copies.

export const CUSTOMER_NAV_ROUTES = {
  progress: 'project-progress', // existing — reused
  timeline: 'project-timeline', // NEW placeholder — shared with the project-nav Timeline tab
  photos: 'project-photos', // NEW placeholder
  liveSite: 'project-live-site', // S18 — KEEP COMING SOON (shared with project-nav Live Site tab)
  documents: 'project-documents', // existing — reused
  questions: 'project-messages', // S16 — honest empty shell until message persistence exists
  notifications: 'notifications', // S17 — honest empty shell until notification events exist
} as const

// ─── Placeholder content — one shared ComingSoonScreen renders all of the
// NEW ids above; this map is its only per-id content. Keep entries terse —
// this is a nav-architecture placeholder, not real feature copy. ──────────

import { LIVE_SITE_COMING_SOON } from './liveSiteShell'

export interface NavPlaceholderContent {
  title: string
  description: string
}

export const NAV_PLACEHOLDER_CONTENT: Record<string, NavPlaceholderContent> = {
  'company-progress': { title: 'Progress', description: 'Daily progress and construction evidence across every project in your company.' },
  'site-operations': { title: 'Site Operations', description: 'Open tasks and issues across your company’s projects — operational site work from the Digital Construction Record.' },
  'workforce': { title: 'Workforce', description: 'Active site-team assignments across your company’s projects.' },
  'live-site': LIVE_SITE_COMING_SOON.company,
  'company-documents': { title: 'Documents', description: 'Active construction documents across your company’s projects — plans, contracts, and approvals.' },
  'company-reports': { title: 'Reports', description: 'Construction Record index across your company’s projects — stage, progress, documents, and operations.' },
  'project-timeline': { title: 'Timeline', description: 'Construction stage journey and chronological project activity from the Digital Construction Record.' },
  'project-workforce': { title: 'Workforce', description: "This project's on-site crew will appear here." },
  'project-live-site': LIVE_SITE_COMING_SOON.project,
  'project-boq': { title: 'Bill of Quantities', description: "This project's Bill of Quantities — sections, quantities and amounts — lives here." },
  'project-customer': { title: 'Customer', description: "Invite the homeowner and manage what they can see on this project." },
  'project-reports': { title: 'Construction Record', description: 'Assembled progress, evidence, documents, and stage for this project.' },
  'project-settings': { title: 'Settings', description: 'Edit this project’s name, construction stage, and location.' },
  'project-photos': { title: 'Photos', description: 'Photos and videos shared from your project site will appear here.' },
  // Module 02 — Home Services is no longer part of the active Houzeify
  // product experience (see homeownerDashboard.ts's DASHBOARD_ROUTES.
  // homeServices, now redirected here). The underlying booking flow is
  // untouched and still exists in the codebase, just not linked to from
  // active navigation — this is the one unavoidable entry point (the
  // "Services" item under Sidebar's Tools section) users can still reach.
  'home-services-coming-soon': { title: 'Home Services', description: "Home Services is being reimagined as part of Houzeify's new construction platform. Check back soon." },
}
