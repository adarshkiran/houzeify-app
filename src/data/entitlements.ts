// ─── Subscription Entitlements — typed capability map (data foundation only) ─
// UI demonstration data only — there is no billing/payment backend yet, and
// no feature gate anywhere reads this file yet either. This module defines
// WHAT each subscription plan (subscriptionPlans.ts) actually unlocks — never
// who currently holds a subscription, never a live usage counter. Screens
// must eventually read entitlement data only through the lookups at the
// bottom of this file, never inline — the same seam convention every module
// in this folder already follows.
//
// SCOPE (15A): this file and subscriptionPlans.ts are the only two files
// this task adds. No feature gate is wired into any existing screen, no
// React Context, no usage-tracking store (the USAGE LIMITS section below is
// static catalogue data — "what the cap is per plan" — never a live "how
// much has this user actually used" counter; that is later, separate work).
//
// HOME SERVICES HAS NO ENTITLEMENTS — this file is never imported by
// homeServices.ts, customerCart.tsx, customerBooking.ts, any service-category
// screen, or anywhere in the Home Services booking flow. The one Home
// Services row present below (`home-services.booking`) exists solely to
// document that exclusion explicitly, per the approved 15/15A audit — it is
// not the start of gating Home Services and must never become one.
//
// TYPE SAFETY: HomeownerCapabilityKey/HOMEOWNER_ENTITLEMENTS are keyed by
// HomeownerPlanId; PartnerCapabilityKey/PARTNER_ENTITLEMENTS are keyed by
// PartnerPlanId. Those two plan-id unions share no members (see
// subscriptionPlans.ts), so a partner plan id can never be used to look up a
// homeowner entitlement, and vice versa — enforced at compile time by
// getHomeownerEntitlement()/getPartnerEntitlement()'s own signatures below.

import { HOMEOWNER_PLAN_IDS, PARTNER_PLAN_IDS, type HomeownerPlanId, type PartnerPlanId } from './subscriptionPlans'

// ─── Entitlement value ──────────────────────────────────────────────────────

export type EntitlementAccess = 'included' | 'limited' | 'locked' | 'not-applicable'

export interface EntitlementValue {
  access: EntitlementAccess
  /** Present ONLY for a genuinely usage-shaped capability (see the USAGE
   *  LIMITS sections below). Convention, applied consistently everywhere in
   *  this file:
   *    - omitted entirely  → this capability has no usage dimension at all
   *    - a number          → the capped monthly/concurrent limit
   *    - `null`            → usage-shaped, but unlimited at this plan
   *  Never a magic sentinel (e.g. -1) for "unlimited", and never attached to
   *  a `locked` row (locked already means "no access", so a limit would be
   *  redundant noise). */
  limit?: number | null
  /** Free-text, used only to say something the access/limit fields alone
   *  can't — most importantly to flag a capability that represents a
   *  FUTURE product capability rather than something the app already does
   *  today (see §"Important future gaps" in the 15A report). Never
   *  marketing copy. */
  note?: string
}

const INCLUDED: EntitlementValue = { access: 'included' }
const LOCKED: EntitlementValue = { access: 'locked' }
const NOT_APPLICABLE: EntitlementValue = { access: 'not-applicable' }

// ════════════════════════════════════════════════════════════════════════
// HOMEOWNER
// ════════════════════════════════════════════════════════════════════════

// ─── Homeowner usage limits ─────────────────────────────────────────────────
// The only genuinely commercial, usage-shaped Homeowner limits approved in
// the 15 pricing audit — deliberately NOT a generic metering system (no
// counters for dashboard views, profile edits, BOQ views, notifications, or
// anything else that doesn't cost the business anything real or signal plan
// fit). This table is the single source for these four numbers;
// HOMEOWNER_ENTITLEMENTS below references it rather than repeating them.

export type HomeownerUsageLimitKey =
  | 'active_projects'
  | 'estimate_revision_runs'
  | 'plan_analysis_runs'
  | 'project_invitations'

export const HOMEOWNER_USAGE_LIMITS: Record<HomeownerUsageLimitKey, Record<HomeownerPlanId, number | null>> = {
  active_projects: { starter: 1, build: 3, 'build-pro': null },
  // NOTE: the approved model specifies only "limited" for Build here, with
  // no exact figure given. 3/month below is this task's own placeholder —
  // the same order of magnitude as project_invitations' explicit 2/month —
  // not a number from the approved brief. Confirm the real cap with product
  // before any real metering ever reads this value.
  estimate_revision_runs: { starter: 0, build: 3, 'build-pro': null },
  plan_analysis_runs: { starter: 0, build: 3, 'build-pro': null },
  project_invitations: { starter: 0, build: 2, 'build-pro': null },
}

// ─── Homeowner capability keys ──────────────────────────────────────────────
// Product capability names, never route/screen names — e.g. `boq.edit`, not
// `boq-edit-screen`, so this map stays meaningful even if a screen is ever
// renamed or split.

export type HomeownerCapabilityKey =
  // Core project & planning
  | 'account.basics'
  | 'project.create'
  | 'project.active-limit'
  | 'house-requirements.manage'
  | 'estimate.view'
  | 'estimate.assumptions.view'
  | 'estimate.assumptions.edit'
  | 'estimate.revision'
  | 'estimate.comparison'
  | 'estimate.final-lock'
  // Materials / labour / BOQ
  | 'material.estimate-summary'
  | 'material.detail'
  | 'material.calculator'
  | 'labour.estimate'
  | 'construction.stages'
  | 'boq.view'
  | 'boq.detail'
  | 'boq.edit'
  | 'boq.version-history'
  | 'boq.version-comparison'
  // Plan analysis / Hozie / contractors
  | 'plan.upload'
  | 'plan-analysis.run'
  | 'plan-analysis.estimate-update'
  | 'hozie.access'
  | 'contractor.discovery'
  | 'contractor.invitation.create'
  | 'contractor.bid.review'
  | 'agreement.manage'
  | 'payment.project'
  // Project execution
  | 'project.workspace'
  | 'project.tasks'
  | 'project.documents'
  | 'project.progress'
  // Home Services — documented exclusion only, see this file's header
  | 'home-services.booking'

export const HOMEOWNER_ENTITLEMENTS: Record<HomeownerCapabilityKey, Record<HomeownerPlanId, EntitlementValue>> = {
  'account.basics': { starter: INCLUDED, build: INCLUDED, 'build-pro': INCLUDED },
  'project.create': { starter: INCLUDED, build: INCLUDED, 'build-pro': INCLUDED },
  'project.active-limit': {
    starter: { access: 'limited', limit: HOMEOWNER_USAGE_LIMITS.active_projects.starter },
    build: { access: 'limited', limit: HOMEOWNER_USAGE_LIMITS.active_projects.build },
    'build-pro': { access: 'included', limit: HOMEOWNER_USAGE_LIMITS.active_projects['build-pro'] },
  },
  'house-requirements.manage': { starter: INCLUDED, build: INCLUDED, 'build-pro': INCLUDED },
  'estimate.view': { starter: INCLUDED, build: INCLUDED, 'build-pro': INCLUDED },
  'estimate.assumptions.view': { starter: INCLUDED, build: INCLUDED, 'build-pro': INCLUDED },
  'estimate.assumptions.edit': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'estimate.revision': {
    starter: LOCKED,
    build: {
      access: 'limited',
      limit: HOMEOWNER_USAGE_LIMITS.estimate_revision_runs.build,
      note: 'Exact monthly cap not finalized by product — see HOMEOWNER_USAGE_LIMITS.estimate_revision_runs.',
    },
    'build-pro': { access: 'included', limit: HOMEOWNER_USAGE_LIMITS.estimate_revision_runs['build-pro'] },
  },
  'estimate.comparison': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'estimate.final-lock': { starter: LOCKED, build: LOCKED, 'build-pro': INCLUDED },

  'material.estimate-summary': {
    starter: { access: 'limited', note: 'Category-level summary only, no numeric cap — a reduced view, not a usage limit.' },
    build: INCLUDED,
    'build-pro': INCLUDED,
  },
  'material.detail': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'material.calculator': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'labour.estimate': { starter: INCLUDED, build: INCLUDED, 'build-pro': INCLUDED },
  'construction.stages': { starter: INCLUDED, build: INCLUDED, 'build-pro': INCLUDED },
  'boq.view': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'boq.detail': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'boq.edit': { starter: LOCKED, build: LOCKED, 'build-pro': INCLUDED },
  'boq.version-history': { starter: LOCKED, build: LOCKED, 'build-pro': INCLUDED },
  'boq.version-comparison': { starter: LOCKED, build: LOCKED, 'build-pro': INCLUDED },

  'plan.upload': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'plan-analysis.run': {
    starter: LOCKED,
    build: {
      access: 'limited',
      limit: HOMEOWNER_USAGE_LIMITS.plan_analysis_runs.build,
      note: 'Exact monthly cap not finalized by product — see HOMEOWNER_USAGE_LIMITS.plan_analysis_runs.',
    },
    'build-pro': { access: 'included', limit: HOMEOWNER_USAGE_LIMITS.plan_analysis_runs['build-pro'] },
  },
  'plan-analysis.estimate-update': {
    starter: LOCKED,
    build: { access: 'limited', note: 'Tracks plan-analysis.run\'s own cap — not a separate number.' },
    'build-pro': INCLUDED,
  },
  'hozie.access': {
    // No message-count limit anywhere here, by design — the approved model
    // explicitly differentiates CONTEXT DEPTH per tier, never a message cap.
    starter: { access: 'limited', note: 'Basic Q&A, no project context.' },
    build: { access: 'limited', note: 'Project-aware context.' },
    'build-pro': { access: 'included', note: 'Full context and priority handling.' },
  },
  'contractor.discovery': { starter: INCLUDED, build: INCLUDED, 'build-pro': INCLUDED },
  'contractor.invitation.create': {
    starter: LOCKED,
    build: { access: 'limited', limit: HOMEOWNER_USAGE_LIMITS.project_invitations.build },
    'build-pro': { access: 'included', limit: HOMEOWNER_USAGE_LIMITS.project_invitations['build-pro'] },
  },
  'contractor.bid.review': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'agreement.manage': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'payment.project': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },

  'project.workspace': {
    starter: {
      access: 'not-applicable',
      note: 'Not really plan-gated — the workspace only becomes relevant once a project reaches award/execution stage, which Starter\'s locked invitations/bids/agreements mean it never reaches today.',
    },
    build: INCLUDED,
    'build-pro': INCLUDED,
  },
  'project.tasks': {
    starter: LOCKED,
    build: { access: 'limited', note: 'Basic checklist only.' },
    'build-pro': INCLUDED,
  },
  'project.documents': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },
  'project.progress': { starter: LOCKED, build: INCLUDED, 'build-pro': INCLUDED },

  'home-services.booking': {
    starter: { access: 'not-applicable', note: 'Home Services has no subscription at any tier — this row exists only to document that exclusion explicitly, per the 15/15A audit. Never gate Home Services from here.' },
    build: { access: 'not-applicable', note: 'See \'starter\'.' },
    'build-pro': { access: 'not-applicable', note: 'See \'starter\'.' },
  },
}

// ════════════════════════════════════════════════════════════════════════
// PARTNER
// ════════════════════════════════════════════════════════════════════════

// ─── Partner usage limits ───────────────────────────────────────────────────

export type PartnerUsageLimitKey =
  | 'service_categories'
  | 'service_locations'
  | 'portfolio_projects'
  | 'team_members'
  | 'bids_per_month'

export const PARTNER_USAGE_LIMITS: Record<PartnerUsageLimitKey, Record<PartnerPlanId, number | null>> = {
  service_categories: { basic: 2, standard: 5, reach: null, enterprise: null },
  service_locations: { basic: 1, standard: 5, reach: null, enterprise: null },
  portfolio_projects: { basic: 3, standard: 10, reach: null, enterprise: null },
  // Basic is "owner only" — the product model treats the owner as the
  // account itself, never as one of the counted team members, so this is
  // 0 ADDITIONAL members, not "team size of 1".
  team_members: { basic: 0, standard: 3, reach: 10, enterprise: null },
  bids_per_month: { basic: 5, standard: 20, reach: null, enterprise: null },
}

// ─── Partner capability keys ────────────────────────────────────────────────

export type PartnerCapabilityKey =
  // Profile / trust — never paywalled
  | 'partner.profile'
  | 'partner.verification.business'
  | 'partner.verification.identity'
  // Service footprint
  | 'partner.services.offered'
  | 'partner.service-locations'
  | 'partner.portfolio.projects'
  // Team
  | 'partner.team.members'
  | 'partner.roles-permissions'
  // Project discovery / bids
  | 'partner.discovery.browse'
  | 'partner.invitation.received'
  | 'partner.bid.submit'
  // Visibility
  | 'partner.visibility.priority'
  // Project execution
  | 'partner.agreement'
  | 'partner.project-workspace'
  | 'partner.tasks'
  | 'partner.documents'
  | 'partner.progress'
  // Payment tracking
  | 'partner.payment-tracking'
  // Analytics
  | 'partner.analytics'
  // Hozie
  | 'partner.hozie'

export const PARTNER_ENTITLEMENTS: Record<PartnerCapabilityKey, Record<PartnerPlanId, EntitlementValue>> = {
  'partner.profile': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },
  'partner.verification.business': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },
  'partner.verification.identity': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },

  'partner.services.offered': {
    basic: { access: 'limited', limit: PARTNER_USAGE_LIMITS.service_categories.basic },
    standard: { access: 'limited', limit: PARTNER_USAGE_LIMITS.service_categories.standard },
    reach: { access: 'included', limit: PARTNER_USAGE_LIMITS.service_categories.reach },
    enterprise: { access: 'included', limit: PARTNER_USAGE_LIMITS.service_categories.enterprise },
  },
  'partner.service-locations': {
    basic: { access: 'limited', limit: PARTNER_USAGE_LIMITS.service_locations.basic },
    standard: { access: 'limited', limit: PARTNER_USAGE_LIMITS.service_locations.standard },
    reach: { access: 'included', limit: PARTNER_USAGE_LIMITS.service_locations.reach },
    enterprise: { access: 'included', limit: PARTNER_USAGE_LIMITS.service_locations.enterprise },
  },
  'partner.portfolio.projects': {
    basic: { access: 'limited', limit: PARTNER_USAGE_LIMITS.portfolio_projects.basic },
    standard: { access: 'limited', limit: PARTNER_USAGE_LIMITS.portfolio_projects.standard },
    reach: { access: 'included', limit: PARTNER_USAGE_LIMITS.portfolio_projects.reach },
    enterprise: { access: 'included', limit: PARTNER_USAGE_LIMITS.portfolio_projects.enterprise },
  },

  'partner.team.members': {
    basic: {
      access: 'limited',
      limit: PARTNER_USAGE_LIMITS.team_members.basic,
      note: 'Owner only — 0 additional members on this plan.',
    },
    standard: { access: 'limited', limit: PARTNER_USAGE_LIMITS.team_members.standard },
    reach: { access: 'limited', limit: PARTNER_USAGE_LIMITS.team_members.reach },
    enterprise: { access: 'included', limit: PARTNER_USAGE_LIMITS.team_members.enterprise },
  },
  'partner.roles-permissions': {
    basic: { access: 'not-applicable', note: 'No team to assign roles to on this plan.' },
    standard: { access: 'limited', note: 'Basic roles only.' },
    reach: INCLUDED,
    enterprise: {
      access: 'included',
      note: 'Commercial entitlement definition only — organization-level role customization/editing is not implemented today (teamSetup.ts\'s ROLE_PERMISSIONS map is fixed, not user-editable).',
    },
  },

  'partner.discovery.browse': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },
  'partner.invitation.received': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },
  'partner.bid.submit': {
    basic: { access: 'limited', limit: PARTNER_USAGE_LIMITS.bids_per_month.basic },
    standard: { access: 'limited', limit: PARTNER_USAGE_LIMITS.bids_per_month.standard },
    reach: { access: 'included', limit: PARTNER_USAGE_LIMITS.bids_per_month.reach },
    enterprise: { access: 'included', limit: PARTNER_USAGE_LIMITS.bids_per_month.enterprise, note: 'Custom terms may apply at organization scale.' },
  },

  'partner.visibility.priority': {
    // FUTURE CAPABILITY — contractorDirectory.ts has no boost/sponsored/
    // priority-sort concept of any kind today (confirmed by inspection: its
    // only sort is "real city match first"). This entry documents an
    // approved future entitlement only; nothing here makes it work.
    basic: { access: 'locked', note: 'FUTURE CAPABILITY — priority/featured placement does not exist in the app today. Do not present this as working.' },
    standard: { access: 'locked', note: 'FUTURE CAPABILITY — see note on \'basic\'.' },
    reach: { access: 'included', note: 'FUTURE CAPABILITY — documents the planned entitlement only; contractorDirectory.ts is unmodified and has nothing to enable.' },
    enterprise: { access: 'included', note: 'FUTURE CAPABILITY — see note on \'reach\'.' },
  },

  'partner.agreement': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },
  'partner.project-workspace': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },
  'partner.tasks': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },
  'partner.documents': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },
  'partner.progress': { basic: INCLUDED, standard: INCLUDED, reach: INCLUDED, enterprise: INCLUDED },

  'partner.payment-tracking': {
    basic: {
      access: 'limited',
      note: 'View-only by plan design. The partner-facing payment UI itself is incomplete in the current app (no dedicated screen found) — this entry reflects the target commercial model, not a working feature today.',
    },
    standard: INCLUDED,
    reach: INCLUDED,
    enterprise: INCLUDED,
  },

  'partner.analytics': {
    // FUTURE CAPABILITY — no analytics/insights screen or data module exists
    // on the partner side today. ProfessionalDashboardScreen.tsx is
    // unmodified by this task.
    basic: { access: 'locked', note: 'FUTURE CAPABILITY — no analytics/insights implementation exists today.' },
    standard: { access: 'limited', note: 'FUTURE CAPABILITY — see note on \'basic\'.' },
    reach: { access: 'included', note: 'FUTURE CAPABILITY — see note on \'basic\'.' },
    enterprise: { access: 'included', note: 'FUTURE CAPABILITY — see note on \'basic\'.' },
  },

  'partner.hozie': {
    // Hozie is reachable by a partner today (same ai-advisor screen), but
    // its context model is entirely homeowner-shaped — no partner-specific
    // context exists. AIAdvisorScreen.tsx is unmodified by this task.
    basic: { access: 'limited', note: 'Reachable today, but with homeowner-shaped context only — no partner-specific context exists yet.' },
    standard: { access: 'limited', note: '"Enhanced" context is aspirational, not implemented — see note on \'basic\'.' },
    reach: { access: 'included', note: 'See note on \'basic\' — full partner context is future work.' },
    enterprise: { access: 'included', note: 'See note on \'basic\'.' },
  },
}

// ─── Lookups ────────────────────────────────────────────────────────────────
// The only intended read seam for this data — a HomeownerPlanId can never be
// passed to getPartnerEntitlement() or vice versa; that's a compile error,
// not a runtime check.

export function getHomeownerEntitlement(planId: HomeownerPlanId, key: HomeownerCapabilityKey): EntitlementValue {
  return HOMEOWNER_ENTITLEMENTS[key][planId]
}

export function getPartnerEntitlement(planId: PartnerPlanId, key: PartnerCapabilityKey): EntitlementValue {
  return PARTNER_ENTITLEMENTS[key][planId]
}

// ─── Minimum unlocking plan (15C) ───────────────────────────────────────────
// Pure, deterministic helpers a future entitlement gate can use to answer
// "which plan is the cheapest one where this capability becomes available?"
// — never a security check, and never a new commercial rule: both functions
// only ever read HOMEOWNER_ENTITLEMENTS/PARTNER_ENTITLEMENTS and the real,
// price-ordered HOMEOWNER_PLAN_IDS/PARTNER_PLAN_IDS arrays already defined
// above/in subscriptionPlans.ts.
//
// 'included' AND 'limited' both count as "available" — a capability that's
// merely usage-capped (e.g. Build's estimate.revision) is never treated as
// locked, so this never returns a more expensive plan than the cheapest one
// that already grants access, even a constrained one. Returns `null` when no
// plan in the catalogue ever makes the capability available (every plan is
// 'locked' and/or 'not-applicable' for it) — callers must treat `null` as
// "nothing to upgrade to", never as "requires the top plan".

export function getMinimumHomeownerPlanForCapability(capability: HomeownerCapabilityKey): HomeownerPlanId | null {
  for (const planId of HOMEOWNER_PLAN_IDS) {
    const access = getHomeownerEntitlement(planId, capability).access
    if (access === 'included' || access === 'limited') return planId
  }
  return null
}

export function getMinimumPartnerPlanForCapability(capability: PartnerCapabilityKey): PartnerPlanId | null {
  for (const planId of PARTNER_PLAN_IDS) {
    const access = getPartnerEntitlement(planId, capability).access
    if (access === 'included' || access === 'limited') return planId
  }
  return null
}
