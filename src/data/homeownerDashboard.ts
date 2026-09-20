// ─── Homeowner AI Dashboard — configuration ─────────────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "dashboard state" API replaces; HomeDashboardScreen must only
// ever read its next-action, quick-actions, empty-state and insight copy
// through the functions here, never inline in the component.
//
// This is Screen 012's own configuration mechanism — no getDashboardConfiguration()
// existed anywhere in the codebase to extend, so getHomeownerDashboardConfiguration()
// is the seam future dashboard work (professional dashboard, etc.) should follow.
//
// CORE PRODUCT PRINCIPLE: the dashboard is intent-aware, not intent-specific —
// one configuration function branches on primaryIntent, never three separate
// dashboards. It also never invents data: every derived flag below reflects a
// real signal already written into projectData by an earlier screen (011's
// HomeIntent, 035's Create Project) — when that signal doesn't exist yet, the
// honest answer is "no", which naturally produces the empty state.

import type { PrimaryIntent } from './primaryIntent'

export type HomeownerIntent = Exclude<PrimaryIntent, 'professional'>

export const HOMEOWNER_INTENTS: HomeownerIntent[] = ['build-home', 'improve-home', 'home-service']

export function isHomeownerIntent(value: string | undefined): value is HomeownerIntent {
  return HOMEOWNER_INTENTS.includes(value as HomeownerIntent)
}

// ─── Routing ─────────────────────────────────────────────────────────────
// Centralised so every card/action reads a destination from here, never a
// hardcoded string sprinkled through JSX. Screens marked "not yet built" are
// forward references — the same accepted pattern already used by
// primaryIntent.ts's 'professional-type' target — App.tsx's router simply
// renders nothing for an id it doesn't yet recognise.

export const DASHBOARD_ROUTES = {
  buildOrImprove: 'build-or-improve', // Build/Renovate chooser — new construction vs. improvement, ahead of the onboarding-intent chain
  renovate: 'renovate-select-area', // Flow 03 — the dedicated Renovate journey's own first screen
  createProject: 'create-project', // 035 — existing
  aiAdvisor: 'ai-advisor', // 013 — existing
  // Houzeify 2.0 Module 02 — Home Services is no longer part of the active
  // product experience (see constructionNav.ts's NAV_PLACEHOLDER_CONTENT
  // header comment). Redirected to the shared "Coming Soon" placeholder;
  // the real 'home-services' screen id and its whole booking flow are
  // untouched in the codebase, just no longer linked to from here.
  homeServices: 'home-services-coming-soon',
  findContractors: 'find-contractors', // 060 — existing
  bidsReceived: 'bids-received', // 063 — existing
  estimateDashboard: 'estimate-dashboard', // 042 — existing
  boqOverview: 'boq-overview', // 047 — existing
  uploadPlan: 'upload-plan', // 037 — existing
  // uploadPhotos intentionally has no entry here (11C) — 'upload-photos' was never a real AppScreen
  // route and this constant had zero consumers anywhere in the codebase. Service/booking photo
  // capture is real and live, just via a different, already-built seam: servicePhotoUpload.ts,
  // used inline by BookingDetailsScreen — never this dangling dashboard route.
  locationSetup: 'location-setup', // existing
  professionalDashboard: 'professional-dashboard', // 029 — existing (ProfessionalDashboardScreen.tsx)
} as const

// ─── Real state signals ────────────────────────────────────────────────────
// Everything here is derived from projectData in App.tsx — never fabricated.

export interface HomeownerDashboardState {
  primaryIntent: HomeownerIntent
  preferredName: string
  city?: string
  state?: string
  /** build-home: a real project was created via 035 Create Project. */
  hasProject: boolean
  projectName?: string
  projectLocation?: string
  /** stage id from Create Project, e.g. 'planning' | 'have-plan' | 'ready-estimate' | 'ready-build'. */
  projectStage?: string
  /** build-home: plan uploaded against the project — no upload flow writes this yet, kept for when it does. */
  hasPlan: boolean
  /** build-home: an estimate exists — in this app creating a project always generates one, so this tracks hasProject. */
  hasEstimate: boolean
  /** build-home: a BOQ has been generated for the project — no flow writes this yet. */
  hasBoq: boolean
  /** build-home: contractor bids have come in — no bids model exists yet. */
  hasBids: boolean
}

// ─── Hozie hero copy ───────────────────────────────────────────────────────

export interface HozieHeroContent {
  title: string
  message: string
  ctaLabel: string
  ctaDest: string
}

export const HOZIE_HERO_CONTENT: Record<HomeownerIntent, HozieHeroContent> = {
  'build-home': {
    title: "Let's build your home.",
    message: "I can help you plan your project, estimate construction costs and find the right professionals.",
    ctaLabel: 'Start your project →',
    ctaDest: DASHBOARD_ROUTES.createProject,
  },
  'improve-home': {
    title: "Let's improve your home.",
    message: "Tell me what you'd like to renovate or upgrade and I'll help you plan the work.",
    ctaLabel: 'Plan an improvement →',
    ctaDest: DASHBOARD_ROUTES.homeServices,
  },
  'home-service': {
    title: "Let's get the right professional.",
    message: "Tell me what service you need and I'll help you find the right people nearby.",
    ctaLabel: 'Find a service →',
    ctaDest: DASHBOARD_ROUTES.homeServices,
  },
}

// ─── Home Services / Cleaning Services — dashboard content adapts by
// service_entry, minimum change necessary. Additive only — the Record
// above stays the generic 'home-service' fallback (used before
// service_entry exists on a session), this is consulted only once a real
// service_entry is known. ────────────────────────────────────────────────

export function getServiceEntryHeroContent(entry: 'cleaning' | 'home-services'): HozieHeroContent {
  if (entry === 'cleaning') {
    return {
      title: "Let's find you a cleaning professional.",
      message: "Tell me what needs cleaning and I'll help you find trusted professionals nearby.",
      ctaLabel: 'Find cleaning services →',
      ctaDest: DASHBOARD_ROUTES.homeServices,
    }
  }
  return HOZIE_HERO_CONTENT['home-service']
}

// ─── Next best action ──────────────────────────────────────────────────────
// "Show ONE primary next action" — the ladder always resolves to the single
// most-advanced true state, never a list of every possible step.

export interface NextActionContent {
  eyebrow: string
  title: string
  body: string
  ctaLabel: string
  ctaDest: string
}

function buildHomeNextAction(state: HomeownerDashboardState): NextActionContent {
  if (state.hasBids) {
    return { eyebrow: 'Your Next Step', title: 'Compare contractor bids', body: 'Review who bid on your project and compare their pricing.', ctaLabel: 'Compare Bids →', ctaDest: DASHBOARD_ROUTES.bidsReceived }
  }
  if (state.hasEstimate) {
    return { eyebrow: 'Your Next Step', title: 'Review your estimate', body: `Your estimate for ${state.projectName ?? 'your project'} is ready to review.`, ctaLabel: 'View Estimate →', ctaDest: DASHBOARD_ROUTES.estimateDashboard }
  }
  if (state.hasProject && !state.hasPlan) {
    return { eyebrow: 'Your Next Step', title: 'Upload your house plan', body: "Share your plan and I'll analyze it to sharpen your estimate.", ctaLabel: 'Upload Plan →', ctaDest: DASHBOARD_ROUTES.uploadPlan }
  }
  return { eyebrow: 'Your Next Step', title: 'Create your home project', body: "Start with your project details and let Hozie guide you.", ctaLabel: 'Create Project →', ctaDest: DASHBOARD_ROUTES.createProject }
}

function improveHomeNextAction(): NextActionContent {
  // The RFQ request/quotes pipeline was removed — this is always the real
  // "first ask", the dedicated Renovate journey (Flow 03) rather than the
  // flat Home Services catalogue.
  return { eyebrow: 'Your Next Step', title: 'Plan your home improvement', body: "Tell Hozie what you'd like to renovate or upgrade.", ctaLabel: 'Get Started →', ctaDest: DASHBOARD_ROUTES.renovate }
}

function homeServiceNextAction(): NextActionContent {
  return { eyebrow: 'Your Next Step', title: 'Tell us what you need', body: "Describe the service you're looking for and Hozie will find the right people.", ctaLabel: 'Find a Service →', ctaDest: DASHBOARD_ROUTES.homeServices }
}

export function getNextAction(state: HomeownerDashboardState): NextActionContent {
  if (state.primaryIntent === 'build-home') return buildHomeNextAction(state)
  if (state.primaryIntent === 'improve-home') return improveHomeNextAction()
  return homeServiceNextAction()
}

// ─── Empty state (Current Work section) ────────────────────────────────────

export interface EmptyStateContent {
  title: string
  body: string
  ctaLabel: string
  ctaDest: string
}

export const EMPTY_STATE_CONTENT: Record<HomeownerIntent, EmptyStateContent> = {
  'build-home': {
    title: 'Your home project starts here.',
    body: 'Create a project to begin planning, estimating and finding professionals.',
    ctaLabel: 'Create Project →',
    ctaDest: DASHBOARD_ROUTES.createProject,
  },
  'improve-home': {
    title: 'Ready to improve your home?',
    body: "Tell us what you'd like to change.",
    ctaLabel: 'Start Improvement →',
    ctaDest: DASHBOARD_ROUTES.renovate,
  },
  'home-service': {
    title: 'Need help with something at home?',
    body: 'Find the right professional for your job.',
    ctaLabel: 'Find a Service →',
    ctaDest: DASHBOARD_ROUTES.homeServices,
  },
}

// ─── Quick actions (secondary — Next Step remains the primary CTA) ────────

export interface QuickActionContent {
  label: string
  dest: string
}

export const QUICK_ACTIONS: Record<HomeownerIntent, QuickActionContent[]> = {
  'build-home': [
    { label: 'Create Project', dest: DASHBOARD_ROUTES.createProject },
    { label: 'Upload Plan', dest: DASHBOARD_ROUTES.uploadPlan },
    { label: 'Get Estimate', dest: DASHBOARD_ROUTES.estimateDashboard },
    { label: 'Find Contractors', dest: DASHBOARD_ROUTES.findContractors },
  ],
  'improve-home': [
    { label: 'Start Improvement', dest: DASHBOARD_ROUTES.renovate },
    { label: 'Get Estimate', dest: DASHBOARD_ROUTES.estimateDashboard },
    { label: 'Find Professionals', dest: DASHBOARD_ROUTES.findContractors },
    { label: 'Ask Hozie', dest: DASHBOARD_ROUTES.aiAdvisor },
  ],
  'home-service': [
    { label: 'Find a Service', dest: DASHBOARD_ROUTES.homeServices },
    // Customer Implementation 09D — "Upload Photos" removed (dead route).
    // "Get Quotes" removed with the RFQ flow (no serviceQuotes screen).
    { label: 'Ask Hozie', dest: DASHBOARD_ROUTES.aiAdvisor },
  ],
}

// ─── Project stage labels (Create Project's stage ids → display labels) ───

export const PROJECT_STAGE_LABELS: Record<string, string> = {
  planning: 'Planning',
  'have-plan': 'Have a plan',
  'ready-estimate': 'Ready to estimate',
  'ready-build': 'Ready to build',
  // ─── Flow 04 — New Build lifecycle (post-project-creation progress
  // through the canonical journey) — additive, the 4 pre-project values
  // above are untouched and still mean what they always meant. ──────────
  'requirements-completed': 'Requirements Completed',
  'estimate-ready': 'Estimate Ready',
  'finding-contractors': 'Finding Contractors',
  bidding: 'Bidding',
  'contractor-selected': 'Contractor Selected',
  'agreement-pending': 'Agreement Pending',
  'agreement-accepted': 'Agreement Accepted',
  'payment-pending': 'Payment Pending',
  'project-ready': 'Project Ready',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export function projectStageLabel(stage?: string): string | undefined {
  if (!stage) return undefined
  return PROJECT_STAGE_LABELS[stage] ?? stage
}

// ─── Hozie insight — deterministic, never a fabricated AI generation ──────

export interface HozieInsightContent {
  message: string
  actionLabel: string
  actionDest: string
}

export function getHozieInsight(state: HomeownerDashboardState): HozieInsightContent {
  if (state.primaryIntent === 'build-home') {
    if (state.hasEstimate) {
      return {
        message: `Your estimate for ${state.projectName ?? 'your project'} is ready. Reviewing it now can help you plan your next steps with more confidence.`,
        actionLabel: 'View estimate →',
        actionDest: DASHBOARD_ROUTES.estimateDashboard,
      }
    }
    if (state.city) {
      return {
        message: `Starting with your project details helps me give you a more accurate estimate for ${state.city}.`,
        actionLabel: 'Create project →',
        actionDest: DASHBOARD_ROUTES.createProject,
      }
    }
    return {
      message: 'Once you create your project, I can help you estimate costs and find the right professionals.',
      actionLabel: 'Create project →',
      actionDest: DASHBOARD_ROUTES.createProject,
    }
  }
  if (state.primaryIntent === 'improve-home') {
    return {
      message: "Tell me what you'd like to renovate and I can help you scope the work before you talk to professionals.",
      actionLabel: 'Plan an improvement →',
      actionDest: DASHBOARD_ROUTES.homeServices,
    }
  }
  return {
    message: 'Sharing a bit more detail about the service you need helps me match you with the right professionals faster.',
    actionLabel: 'Find a service →',
    actionDest: DASHBOARD_ROUTES.homeServices,
  }
}

// ─── Time-of-day greeting ──────────────────────────────────────────────────

export function greetingWord(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Full configuration ────────────────────────────────────────────────────
// The single seam HomeDashboardScreen reads from — extend this, not the
// component, when dashboard behaviour needs to change.

export interface HomeownerDashboardConfiguration {
  hero: HozieHeroContent
  nextAction: NextActionContent
  emptyState: EmptyStateContent
  quickActions: QuickActionContent[]
  insight: HozieInsightContent
  hasCurrentWork: boolean
}

export function getHomeownerDashboardConfiguration(state: HomeownerDashboardState): HomeownerDashboardConfiguration {
  const hasCurrentWork = state.primaryIntent === 'build-home' && state.hasProject
  return {
    hero: HOZIE_HERO_CONTENT[state.primaryIntent],
    nextAction: getNextAction(state),
    emptyState: EMPTY_STATE_CONTENT[state.primaryIntent],
    quickActions: QUICK_ACTIONS[state.primaryIntent],
    insight: getHozieInsight(state),
    hasCurrentWork,
  }
}
