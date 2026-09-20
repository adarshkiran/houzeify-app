// ─── Entitlement Gate — reusable contextual gating architecture (15C/15D) ──
// NOT subscription enforcement. There is no backend subscription state, no
// payment gateway, no subscription lifecycle, and no server-side enforcement
// anywhere in this codebase yet (15E-15G). This component is the UX seam
// that future real subscription state plugs into — never a security
// boundary (see resolveEntitlementAccess()'s own doc comment below).
//
// NOT WIRED INTO ANY EXISTING SCREEN. This file exists so a future task can
// wrap a real feature with it; nothing in the current product imports or
// renders <EntitlementGate> yet, so shipping this file changes zero current
// behavior.
//
// THE PASS-THROUGH CONTRACT — read this before touching resolveEntitlement-
// Access(): a gate only ever computes real access when it has a real
// `planId`. As of 15D, that comes from one of two places: an explicit
// `planId` prop (mainly for tests/future overrides), or — when the prop is
// omitted, the normal case — the ambient SubscriptionRecord from
// useSubscription() (subscriptionState.tsx). That record's status is
// 'unresolved' everywhere in the running app today (no backend has ever
// hydrated it), so `homeownerPlanId`/`partnerPlanId` are always `undefined`,
// and every gate still always renders `children`. That isn't a special case
// in the code below — it falls out naturally from "no plan id means nothing
// is known to be locked yet".
//
// FUTURE ARCHITECTURE:
//   Subscription → active plan ID → audience → entitlement resolver
//   → EntitlementGate → UI
// A later backend task (15E+) starts actually hydrating SubscriptionProvider
// with a real record; the moment it does, gates that don't pass an explicit
// `planId` start resolving real access automatically — no change needed
// here or at any call site.
//
// TYPE SAFETY: `audience` is a discriminant — TypeScript narrows `capability`
// to HomeownerCapabilityKey when audience is 'homeowner' and to
// PartnerCapabilityKey when audience is 'partner' (and `planId` narrows the
// same way). A Partner plan id or capability key is a compile error on the
// homeowner branch, and vice versa — the exact same guarantee
// entitlements.ts's own getHomeownerEntitlement()/getPartnerEntitlement()
// already provide, preserved here rather than weakened to `string`.

import type { ReactNode } from 'react'
import {
  getHomeownerEntitlement,
  getPartnerEntitlement,
  type EntitlementValue,
  type HomeownerCapabilityKey,
  type PartnerCapabilityKey,
} from '@/data/entitlements'
import type { HomeownerPlanId, PartnerPlanId } from '@/data/subscriptionPlans'
import { useSubscription } from '@/data/subscriptionState'

/** Presentation mode for a FUTURE, real gate — has no effect today (every
 *  mode currently renders exactly the same pass-through output). Kept small
 *  on purpose per 15C's own "do not overengineer" scope:
 *    block  — the gated content is fully replaced by `fallback`.
 *    soft   — the gated content still renders, `fallback` (if any) renders
 *             alongside it as a supplementary note rather than a
 *             replacement.
 *    inline — same as `soft`, reserved for a visually more compact caller
 *             (e.g. a single row vs. a whole card) — no behavioral
 *             difference from `soft` yet; kept as a distinct value only so
 *             a future caller can style by mode without a second prop. */
export type EntitlementGateMode = 'block' | 'soft' | 'inline'

interface EntitlementGateSharedProps {
  mode?: EntitlementGateMode
  /** Rendered per `mode` only when a future caller supplies a real `planId`
   *  AND that plan's access for this capability is 'locked'. Ignored today
   *  — see this file's header. Typically an <EntitlementUpgradePrompt/>,
   *  but this component never imports or assumes that one specifically. */
  fallback?: ReactNode
  children: ReactNode
}

/** The audience/capability/planId discriminant alone — kept as its own
 *  exported union (rather than inlined into EntitlementGateProps or derived
 *  via `Pick<EntitlementGateProps, ...>`) because `Pick` over a union type
 *  flattens each picked field into its own independent union, which would
 *  silently let a 'homeowner' audience pair with a Partner capability/plan
 *  id — exactly the cross-audience leak this file exists to prevent. */
export type EntitlementAccessQuery =
  | { audience: 'homeowner'; capability: HomeownerCapabilityKey; planId?: HomeownerPlanId }
  | { audience: 'partner'; capability: PartnerCapabilityKey; planId?: PartnerPlanId }

export type EntitlementGateProps = EntitlementAccessQuery & EntitlementGateSharedProps

export interface EntitlementDecision {
  /** Whether the gated content should render/behave normally right now.
   *  `true` whenever `planId` is omitted (the only way this app calls a
   *  gate today) — this is a UX signal only, never a security check; real
   *  enforcement belongs server-side once it exists (15E+). */
  allowed: boolean
  /** The real EntitlementValue this decision was computed from — absent
   *  when `planId` was omitted, since there was nothing to look up. */
  entitlement?: EntitlementValue
}

/** Pure and deterministic — the seam a future real resolver (backed by
 *  actual subscription state) replaces. Exported directly so it stays
 *  testable without mounting a component (15C's own "testable pure logic"
 *  requirement). */
export function resolveEntitlementAccess(props: EntitlementAccessQuery): EntitlementDecision {
  if (props.planId == null) return { allowed: true }
  const entitlement = props.audience === 'homeowner'
    ? getHomeownerEntitlement(props.planId, props.capability)
    : getPartnerEntitlement(props.planId, props.capability)
  // 'included', 'limited' and 'not-applicable' all render the gated content
  // normally — only 'locked' is ever a real block. A merely usage-capped
  // ('limited') capability is available, not locked (15C §10); a future
  // usage counter, not this gate, is what would eventually constrain it
  // further.
  return { allowed: entitlement.access !== 'locked', entitlement }
}

/** Today: always renders `children`, for every capability, on every screen
 *  that might one day use it — see this file's header for why. An explicit
 *  `planId` prop always wins (test/override use); otherwise the gate reads
 *  the ambient subscription state itself, so a caller never has to thread
 *  useSubscription() through by hand. */
export default function EntitlementGate(props: EntitlementGateProps) {
  const subscription = useSubscription()
  const decision = props.audience === 'homeowner'
    ? resolveEntitlementAccess({ audience: 'homeowner', capability: props.capability, planId: props.planId ?? subscription.homeownerPlanId })
    : resolveEntitlementAccess({ audience: 'partner', capability: props.capability, planId: props.planId ?? subscription.partnerPlanId })
  if (decision.allowed || !props.fallback) return <>{props.children}</>
  if (props.mode === 'block') return <>{props.fallback}</>
  // 'soft' / 'inline' (and the default when `mode` is omitted): show both —
  // never hide already-visible product surface (15C §3) even once a future
  // caller starts supplying real plan ids.
  return (
    <>
      {props.children}
      {props.fallback}
    </>
  )
}
