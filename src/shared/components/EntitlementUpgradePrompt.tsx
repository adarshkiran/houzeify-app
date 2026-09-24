// ─── Entitlement Upgrade Prompt — presentational only (15C) ────────────────
// A small, reusable "this is available on a higher plan" note, driven
// entirely by real catalogue data (subscriptionPlans.ts) — never hardcoded
// pricing, never a fabricated plan name. Companion to EntitlementGate.tsx,
// but intentionally NOT imported by it — the two compose (a gate's
// `fallback` prop can be one of these), they don't couple to each other.
//
// NOT WIRED INTO ANY EXISTING SCREEN — nothing in the current product
// renders this yet, per 15C's scope. It exists so a future task has a ready
// presentational component instead of a decision to make from scratch.
//
// COMMERCIAL LANGUAGE — only ever "Available on {Plan}" / "Included with
// {Plan}"-shaped copy (15C §16). Never "Upgrade now to continue", "Your
// subscription has expired", or anything implying a real subscription
// exists — there is none.
//
// FUTURE CAPABILITIES — a `requiredPlanId` of `null` (e.g. from
// getMinimumPartnerPlanForCapability() on one of the Partner capabilities
// entitlements.ts itself flags as not-yet-implemented — priority placement,
// analytics, partner-aware Hozie) renders nothing here. This component must
// never be the thing that turns "Planned" into "Upgrade to Reach" — that
// would claim a capability exists when it doesn't (15C §2). Callers showing
// a future capability should use their own "Planned" treatment, not this
// component.

import { getHomeownerPlan, getPartnerPlan, type HomeownerPlanId, type PartnerPlanId } from '@/data/subscriptionPlans'

const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const IcoLock = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6.3" width="8" height="5.4" rx="1" /><path d="M4.5 6.3V4.4a2.5 2.5 0 015 0v1.9" />
  </svg>
)
const IcoArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h7M6 2.5L9.5 6L6 9.5" /></svg>
)

export type EntitlementUpgradePromptProps =
  | {
      audience: 'homeowner'
      /** From getMinimumHomeownerPlanForCapability() (entitlements.ts) —
       *  `null` means no plan unlocks this capability; the component
       *  renders nothing rather than invent a target. */
      requiredPlanId: HomeownerPlanId | null
      /** Human label for the gated capability, e.g. "Detailed BOQ" —
       *  content copy, never a route or capability key. */
      capabilityLabel: string
      /** Lets a caller route to Plans & Billing without this shared
       *  component importing App.tsx/router internals directly. */
      onViewPlans?: () => void
    }
  | {
      audience: 'partner'
      requiredPlanId: PartnerPlanId | null
      capabilityLabel: string
      onViewPlans?: () => void
    }

export default function EntitlementUpgradePrompt(props: EntitlementUpgradePromptProps) {
  if (!props.requiredPlanId) return null
  const plan = props.audience === 'homeowner' ? getHomeownerPlan(props.requiredPlanId) : getPartnerPlan(props.requiredPlanId)

  return (
    <div role="note" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px]" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(114,46,209,0.14)' }}>
      <span className="shrink-0" style={{ color: 'var(--hz-primary)' }}><IcoLock /></span>
      <span className="text-[12.5px] text-[var(--hz-ink-muted)] flex-1 leading-snug" style={{ fontFamily: FONT_BODY }}>
        <span className="text-[var(--hz-ink)] font-semibold" style={{ fontFamily: FONT_HEAD }}>{props.capabilityLabel}</span>
        {' '}is available on <span className="font-semibold text-[var(--hz-ink)]">{plan.name}</span>.
      </span>
      {props.onViewPlans && (
        <button
          type="button"
          onClick={props.onViewPlans}
          aria-label={`View plans — ${props.capabilityLabel} is available on ${plan.name}`}
          className="shrink-0 flex items-center gap-1 text-[12px] font-semibold cursor-pointer border-0 bg-transparent px-2 py-1 rounded-[6px] hover:bg-[var(--hz-primary-soft)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY, outlineColor: 'var(--hz-primary)' }}
        >
          View plans <IcoArrowRight />
        </button>
      )}
    </div>
  )
}
