// ─── Primary Intent — typed data model ──────────────────────────────────────
// This screen is intent-first, not role-first: it captures what the user is
// trying to accomplish, never a professional role. Role/professional-type
// selection is a separate, later concern (Screen 018 — Professional Type),
// only reached via the 'professional' intent.

export type PrimaryIntent = 'build-home' | 'improve-home' | 'home-service' | 'professional'

export interface IntentContent {
  title: string
  description: string
  supportingLabel: string
  cta: string
}

export const PRIMARY_INTENT_OPTIONS: PrimaryIntent[] = ['build-home', 'improve-home', 'home-service', 'professional']

export const INTENT_CONTENT: Record<PrimaryIntent, IntentContent> = {
  'build-home': {
    title: 'Build a New Home',
    description: 'Plan, estimate and find professionals to build your house from the ground up.',
    supportingLabel: 'New Construction',
    cta: 'Start building',
  },
  'improve-home': {
    title: 'Improve My Home',
    description: 'Renovation, remodeling, extensions and structural upgrades to your existing home.',
    supportingLabel: 'Renovation & Improvement',
    cta: 'Improve my home',
  },
  'home-service': {
    title: 'Home Services',
    description: 'Book trusted professionals for repairs, maintenance and other home services.',
    supportingLabel: 'Home Services',
    cta: 'Find a home service',
  },
  professional: {
    title: "I'm a Construction Professional",
    description: 'Find projects, submit bids, manage work and grow your business.',
    supportingLabel: 'Professional',
    cta: 'Find projects',
  },
}

/** The intent-routing service — homeowner-shaped intents (build/improve/
 *  service) all continue into the same homeowner onboarding; only
 *  'professional' branches away into the professional-type flow. Never
 *  routes a professional through homeowner onboarding. */
export function nextScreenForIntent(intent: PrimaryIntent): 'onboarding-homeowner' | 'professional-type' {
  return intent === 'professional' ? 'professional-type' : 'onboarding-homeowner'
}

// ─── Canonical user role ────────────────────────────────────────────────────
// USER
//   ├── role              'homeowner' | 'professional' — the top-level
//   │                     persona, decided once here on Screen 007 and
//   │                     persisted for the rest of the session.
//   ├── professionalType  secondary attribute (professionalType.ts) — never
//   │                     a substitute for role.
//   └── accountType       secondary attribute (accountType.ts) — never a
//                         substitute for role.
//
// Every other screen/route that needs to know "is this user a homeowner or
// a professional" must read the persisted `role` field — never re-derive it
// from Boolean(professionalType) or primaryIntent === 'professional'.

export type UserRole = 'homeowner' | 'professional'

/** The canonical role for a given Screen 007 choice — every homeowner-shaped
 *  intent (build/improve/service) is role 'homeowner'; only 'professional'
 *  is role 'professional'. */
export function roleForIntent(intent: PrimaryIntent): UserRole {
  return intent === 'professional' ? 'professional' : 'homeowner'
}

/** Migration-only fallback for sessions that predate the canonical `role`
 *  field — infers a role from the older signals (primaryIntent, then
 *  professionalType) exactly once, so existing in-flight sessions still
 *  route correctly. Never used to override an already-persisted role, and
 *  never the source of truth for new sessions — those always get an
 *  explicit role from roleForIntent() on Screen 007. */
export function resolveUserRole(role: string | undefined, primaryIntent: string | undefined, professionalType: string | undefined): UserRole {
  if (role === 'homeowner' || role === 'professional') return role
  if (primaryIntent === 'professional') return 'professional'
  if (professionalType) return 'professional'
  return 'homeowner'
}
