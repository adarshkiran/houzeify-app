// ─── Subscription State — frontend-only contract for a future backend (15D) ─
// UI demonstration data only — there is no subscription backend, payment
// gateway, checkout, billing history, renewal handling, cancellation flow,
// usage persistence, or server-side entitlement enforcement anywhere in this
// codebase. This module does not invent any of those. Its only job is the
// contract 15C's EntitlementGate consumes: "what plan, if any, does the
// current session have?" — and today the only honest answer is "we don't
// know yet", every time, for every session.
//
// Same Context pattern customerCart.tsx/customerAddress.tsx already
// established (plain React Context, no external library, mounted once in
// App.tsx) — reused here rather than inventing a second state-management
// approach for one more cross-screen value.
//
// READ-ONLY BY DESIGN — unlike customerCart/customerAddress (which have real
// write operations because carts and address books are genuinely mutable
// today), there is nothing real to write here yet. This file exposes no
// activateSubscription()/purchasePlan()/cancelSubscription()/upgrade()/
// downgrade() of any kind. The only way a real subscription should ever
// become 'active' is a future backend hydrating this Provider's value —
// Plans & Billing's "Get started" stays exactly what 15B built: an honest
// "available soon" notice, never a write into this state.
//
// SECURITY BOUNDARY — this is UX state only, never a security boundary. A
// malicious client is never meaningfully "prevented" from anything by a
// SubscriptionRecord living in this Context; the entitlement checks this
// enables are for presentation only. Real enforcement is backend work
// (15E+) this file does not attempt.

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { getHomeownerEntitlement, getPartnerEntitlement, type EntitlementValue, type HomeownerCapabilityKey, type PartnerCapabilityKey } from './entitlements'
import type { HomeownerPlanId, PartnerPlanId } from './subscriptionPlans'

// ─── Record shape ───────────────────────────────────────────────────────────

/** Matches EntitlementGate.tsx's own `audience` discriminant exactly — 'partner'
 *  (not 'professional'), the vocabulary the 15A/15C entitlement system already
 *  uses. Translated from the app-wide `role` ('homeowner' | 'professional')
 *  once, in SubscriptionProvider below — nowhere else needs to know both
 *  vocabularies exist. */
export type SubscriptionAudience = 'homeowner' | 'partner'

/** The full future lifecycle this type is shaped to support — see 15D's own
 *  brief. Only 'unresolved' is ever actually constructed anywhere in this
 *  codebase today; the others exist so the pure resolver logic below (and
 *  a future backend integration) have a real type to target, not so this
 *  file can simulate reaching them. */
export type SubscriptionStatus = 'unresolved' | 'none' | 'active' | 'cancelled' | 'expired' | 'payment_failed' | 'grace_period'

/** Audience-discriminated on purpose (same reasoning as EntitlementGate.tsx's
 *  own EntitlementAccessQuery): a 'partner' record can never carry a
 *  HomeownerPlanId, and vice versa — enforced at compile time, not by
 *  convention. `audience` is optional on 'unresolved' only, since we may not
 *  even know the session's role yet (a fresh, unauthenticated moment). */
export type SubscriptionRecord =
  | { status: 'unresolved'; audience?: SubscriptionAudience }
  | { status: Exclude<SubscriptionStatus, 'unresolved' | 'active'>; audience: SubscriptionAudience }
  | { status: 'active'; audience: 'homeowner'; planId: HomeownerPlanId }
  | { status: 'active'; audience: 'partner'; planId: PartnerPlanId }

/** Deliberately NOT included: renewalDate, paymentMethod, transactionId,
 *  billingCycle, trialEndsAt, cancelledAt, usage counters. None of those
 *  have a real source yet — adding them now would just be typed noise a
 *  future backend integration has to reconcile with real fields anyway. */

const UNRESOLVED: SubscriptionRecord = { status: 'unresolved' }

// ─── Pure helpers — audience-safe, no React needed to use these ───────────

/** `undefined` whenever there is no active homeowner plan to read — covers
 *  'unresolved' and every non-active status, and a partner-audience record,
 *  all in one check. Never returns a plan id for a status that isn't
 *  actually 'active'. */
export function getActiveHomeownerPlanId(record: SubscriptionRecord): HomeownerPlanId | undefined {
  return record.status === 'active' && record.audience === 'homeowner' ? record.planId : undefined
}

export function getActivePartnerPlanId(record: SubscriptionRecord): PartnerPlanId | undefined {
  return record.status === 'active' && record.audience === 'partner' ? record.planId : undefined
}

/** The actual "connect subscription state to the 15A/15C entitlement
 *  catalogue" seam. Returns `undefined` — never a fabricated 'locked' — when
 *  there is no active plan to resolve against; a gate/caller receiving
 *  `undefined` must treat that as "nothing known yet", i.e. pass through,
 *  exactly like EntitlementGate already does when `planId` is omitted. */
export function resolveHomeownerEntitlement(record: SubscriptionRecord, capability: HomeownerCapabilityKey): EntitlementValue | undefined {
  const planId = getActiveHomeownerPlanId(record)
  return planId ? getHomeownerEntitlement(planId, capability) : undefined
}

export function resolvePartnerEntitlement(record: SubscriptionRecord, capability: PartnerCapabilityKey): EntitlementValue | undefined {
  const planId = getActivePartnerPlanId(record)
  return planId ? getPartnerEntitlement(planId, capability) : undefined
}

// ─── Context / Provider / hook ──────────────────────────────────────────────

/** Default value is UNRESOLVED itself, not `null` — unlike
 *  useCustomerCart()/useCustomerAddress() (which throw outside their
 *  Provider, since a missing cart/address book is a real bug to surface
 *  loudly), a missing SubscriptionProvider should degrade to the same
 *  honest "we don't know" state EntitlementGate already treats as
 *  pass-through, never crash a page over a presentation-only value. */
const SubscriptionContext = createContext<SubscriptionRecord>(UNRESOLVED)

/** `role` is the same app-wide value App.tsx already resolves via
 *  resolveUserRole() (primaryIntent.ts) and threads into every other
 *  role-aware screen — reused here, never a second role source. This
 *  Provider does not hydrate anything: it only ever produces 'unresolved',
 *  now correctly tagged with the current audience so a future real
 *  hydration effect has something to key off of. If `role` changes (a
 *  homeowner session somehow becoming a professional one, or vice versa),
 *  this recomputes via useMemo and the record simply stays 'unresolved'
 *  under the new audience — there is no stale cross-audience plan id for
 *  it to carry over, because none was ever set. */
export function SubscriptionProvider({ role, children }: { role?: string; children: ReactNode }) {
  const value = useMemo<SubscriptionRecord>(() => {
    if (role === 'homeowner') return { status: 'unresolved', audience: 'homeowner' }
    if (role === 'professional') return { status: 'unresolved', audience: 'partner' }
    return UNRESOLVED
  }, [role])

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export interface SubscriptionSnapshot {
  /** The raw record, for a caller that needs the full discriminated shape
   *  (e.g. to branch on `status` itself). */
  record: SubscriptionRecord
  /** `false` only for 'unresolved' — every other status counts as "we do
   *  know something", even a non-active one like 'expired'. */
  isResolved: boolean
  audience: SubscriptionAudience | undefined
  /** `undefined` unless `record` is an active homeowner/partner plan —
   *  never both set at once (audience-exclusive by construction). */
  homeownerPlanId: HomeownerPlanId | undefined
  partnerPlanId: PartnerPlanId | undefined
  /** Read-only entitlement resolvers, pre-bound to the current record —
   *  `undefined` whenever there's no active plan of that audience to
   *  resolve against. No mutation surface of any kind is exposed here. */
  resolveHomeownerEntitlement: (capability: HomeownerCapabilityKey) => EntitlementValue | undefined
  resolvePartnerEntitlement: (capability: PartnerCapabilityKey) => EntitlementValue | undefined
}

/** The one intended read seam for this state — every homeowner screen,
 *  partner screen, Plans & Billing, and EntitlementGate reads subscription
 *  state through this hook, never by reaching into SubscriptionContext
 *  directly. Exposes no setter, no mutation function, nothing a screen
 *  could use to fake a purchase. */
export function useSubscription(): SubscriptionSnapshot {
  const record = useContext(SubscriptionContext)
  return useMemo<SubscriptionSnapshot>(() => ({
    record,
    isResolved: record.status !== 'unresolved',
    audience: record.audience,
    homeownerPlanId: getActiveHomeownerPlanId(record),
    partnerPlanId: getActivePartnerPlanId(record),
    resolveHomeownerEntitlement: capability => resolveHomeownerEntitlement(record, capability),
    resolvePartnerEntitlement: capability => resolvePartnerEntitlement(record, capability),
  }), [record])
}
