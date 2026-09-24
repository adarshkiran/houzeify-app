// ─── Plans & Billing — presentation layer over the 15A catalogue ───────────
// UI demonstration data only — there is no subscription/payment backend yet.
// This screen is the seam a real subscription-purchase flow eventually
// replaces; it must only ever read plan/entitlement data through
// subscriptionPlans.ts / entitlements.ts (never a second, duplicated pricing
// configuration), and it must never represent a subscription as active or
// purchased — there is no Subscription record anywhere in this codebase to
// read one from. See this file's own CTA handling below.
//
// VISUAL REDESIGN (user-supplied reference, a Creator/Pro/Business SaaS
// pricing page): pill billing toggle with an inline live savings figure, a
// softly-tinted "Recommended" card, and per-plan feature checklists. Two
// things from that reference were deliberately NOT copied because they'd be
// dishonest here: a flat "(Save 50%)" (our real saving varies 15.1%-16.4%
// per plan — see calculateAnnualSavings(); the toggle shows the true
// highest figure, never a fixed number), and a free-trial line / "Current
// Plan" button (this app has no trial system and no real subscription
// record to know a "current" plan from).
//
// SHARED between both personas, same convention as AccountSettingsScreen.tsx
// — Plans & Billing is legitimately relevant to homeowners (Build/Renovation
// plans) and partners (professional/business plans) alike, never one screen
// silently reused for the wrong catalogue. `role` alone decides which
// catalogue renders; HOMEOWNER_PLANS and PARTNER_PLANS are two disjoint,
// separately-typed catalogues (see subscriptionPlans.ts), so there is no
// code path here that could hand a homeowner a partner plan or vice versa.
//
// HOME SERVICES HAS NO SUBSCRIPTION — this screen only ever names Home
// Services in one small, unobtrusive clarification note; it never gates,
// prices or upsells a Home Services capability, and the existing Hozie
// Saver Pack (a one-time multi-visit booking discount, unrelated to this
// subscription system) is untouched.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import {
  HOMEOWNER_PLANS,
  PARTNER_PLANS,
  HOMEOWNER_PLAN_IDS,
  PARTNER_PLAN_IDS,
  calculateAnnualSavings,
  type BillingCycle,
  type HomeownerPlan,
  type PartnerPlan,
  type HomeownerPlanId,
  type PartnerPlanId,
} from '@/data/subscriptionPlans'
import {
  HOMEOWNER_ENTITLEMENTS,
  PARTNER_ENTITLEMENTS,
  type EntitlementValue,
  type HomeownerCapabilityKey,
  type PartnerCapabilityKey,
} from '@/data/entitlements'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Icons ──────────────────────────────────────────────────────────────

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoCheckCircle = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7.2" /><path d="M5.8 9.2l2.1 2.1L12.3 6.8" />
  </svg>
)
const IcoStar = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0.8l1.5 3.3 3.6.4-2.7 2.5.7 3.6L6 8.8 2.9 10.6l.7-3.6L.9 4.5l3.6-.4L6 .8Z" /></svg>
)
const IcoInfo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6.5" /><line x1="8" y1="7.2" x2="8" y2="11" /><circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)
const IcoClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l8 8M11 3L3 11" /></svg>
)

// ─── "Coming soon" notice — same dismissible bottom toast HomeownerProfile-
// Screen.tsx already established for every other not-yet-available action
// in this app (e.g. "Role changes are not available yet.") — reused here
// rather than inventing a second pattern. ───────────────────────────────────
function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-[12px] px-4 py-3 bg-[var(--hz-surface)] border border-[var(--hz-border)] max-w-[92vw]" style={{ boxShadow: '0 8px 30px rgba(36,35,38,0.14)' }}>
      <span style={{ color: 'var(--hz-primary)' }} className="shrink-0"><IcoInfo /></span>
      <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors shrink-0"><IcoClose /></button>
    </div>
  )
}

// ─── Feature checklist — curated, per-plan, marketing-shaped ───────────────
// Unlike an entitlement-comparison table (every row on every card, flagged
// included/limited/locked), each plan card here lists ONLY what that plan
// actually gives you — a locked or not-applicable capability is simply
// omitted, never shown crossed out. Nothing is fabricated: every visible
// line, including the "(up to N)"/"(unlimited)" suffix, is read live from
// entitlements.ts, never re-typed. A curated subset (not all 34/20 keys)
// keeps each card legible, same "don't dump the whole matrix" rule 15B
// already established.

interface FeatureKeyDef<K> {
  key: K
  label: string
  /** Only for the handful of capabilities whose tier-to-tier difference is
   *  qualitative rather than a plain number (e.g. Hozie's context depth) —
   *  everything else uses describeFeature()'s generic phrasing below. */
  describe?: (value: EntitlementValue) => string
}

interface FeatureLine {
  text: string
  note?: string
}

function describeFeature(label: string, value: EntitlementValue): string {
  if (value.access === 'included') return value.limit === null ? `${label} — unlimited` : label
  // limited
  if (typeof value.limit === 'number') return value.limit === 0 ? `${label} — owner only` : `${label} — up to ${value.limit}`
  return label
}

const HOMEOWNER_FEATURE_KEYS: FeatureKeyDef<HomeownerCapabilityKey>[] = [
  { key: 'account.basics', label: 'Dashboard, profile & settings' },
  { key: 'project.active-limit', label: 'Active projects' },
  { key: 'house-requirements.manage', label: 'House requirements' },
  { key: 'estimate.view', label: 'Initial estimate' },
  { key: 'labour.estimate', label: 'Labour estimate' },
  { key: 'contractor.discovery', label: 'Contractor discovery' },
  {
    key: 'hozie.access',
    label: 'Hozie',
    describe: v => {
      if (v.access === 'included') return 'Hozie — full context & priority'
      // Starter's own note ("...no project context.") also contains the
      // substring "project" — match the more specific "project-aware"
      // phrase Build's note actually uses, not a bare "project" check.
      return v.note?.toLowerCase().includes('project-aware') ? 'Hozie — project-aware context' : 'Hozie — basic Q&A'
    },
  },
  { key: 'estimate.assumptions.edit', label: 'Edit estimate assumptions' },
  { key: 'estimate.revision', label: 'Estimate revisions' },
  { key: 'material.detail', label: 'Material detail' },
  { key: 'boq.view', label: 'BOQ overview' },
  { key: 'contractor.invitation.create', label: 'Contractor invitations' },
  { key: 'boq.edit', label: 'BOQ editing & versions' },
  { key: 'estimate.final-lock', label: 'Final estimate lock' },
]

// Every one of these is 'included'/'limited' at every Partner tier today
// (never 'locked') — the visible quantity changes, the list itself doesn't
// shrink, unlike Homeowner's Starter card. `partner.visibility.priority`,
// `partner.analytics` and `partner.hozie` are deliberately NOT in this list:
// entitlements.ts flags all three as future/unimplemented capabilities, and
// a checkmarked marketing list is exactly the place that must never imply
// they work today (15C §2) — they stay visible on the fuller comparison a
// future task may add, never here.
const PARTNER_FEATURE_KEYS: FeatureKeyDef<PartnerCapabilityKey>[] = [
  { key: 'partner.profile', label: 'Professional / organization profile' },
  { key: 'partner.discovery.browse', label: 'Project discovery' },
  { key: 'partner.services.offered', label: 'Service categories' },
  { key: 'partner.service-locations', label: 'Service locations' },
  { key: 'partner.portfolio.projects', label: 'Portfolio projects' },
  { key: 'partner.team.members', label: 'Team members' },
  { key: 'partner.bid.submit', label: 'Bids per month' },
  { key: 'partner.payment-tracking', label: 'Payment tracking' },
]

function homeownerFeatureLines(planId: HomeownerPlanId): FeatureLine[] {
  return HOMEOWNER_FEATURE_KEYS
    .map((def): FeatureLine | null => {
      const value = HOMEOWNER_ENTITLEMENTS[def.key][planId]
      if (value.access === 'locked' || value.access === 'not-applicable') return null
      return { text: def.describe ? def.describe(value) : describeFeature(def.label, value), note: value.note }
    })
    .filter((l): l is FeatureLine => l !== null)
}

function partnerFeatureLines(planId: PartnerPlanId): FeatureLine[] {
  return PARTNER_FEATURE_KEYS
    .map((def): FeatureLine | null => {
      const value = PARTNER_ENTITLEMENTS[def.key][planId]
      if (value.access === 'locked' || value.access === 'not-applicable') return null
      return { text: def.describe ? def.describe(value) : describeFeature(def.label, value), note: value.note }
    })
    .filter((l): l is FeatureLine => l !== null)
}

// ─── Plan card ──────────────────────────────────────────────────────────────

function PlanCard({
  plan, cycle, featureLines, footerNote, featuresSubtitle, onSelect,
}: {
  plan: HomeownerPlan | PartnerPlan
  cycle: BillingCycle
  featureLines: FeatureLine[]
  footerNote: string
  featuresSubtitle: string
  onSelect: () => void
}) {
  const isCustom = plan.customPricing || plan.monthlyPrice === null || plan.yearlyPrice === null
  const price = !isCustom ? (cycle === 'monthly' ? plan.monthlyPrice as number : plan.yearlyPrice as number) : null

  return (
    <div
      className="flex flex-col rounded-[20px] overflow-hidden"
      style={{
        border: plan.recommended ? '2px solid var(--hz-primary)' : '1px solid var(--hz-border)',
        background: plan.recommended ? 'linear-gradient(180deg, var(--hz-primary-wash) 0%, var(--hz-surface) 55%)' : 'var(--hz-surface)',
        boxShadow: plan.recommended ? '0 10px 30px -12px rgba(114,46,209,0.22)' : '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[22px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{plan.name}</span>
          {plan.recommended && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', border: '1px solid #E3C9FF', fontFamily: FONT_MONO }}>
              <IcoStar /> Recommended
            </span>
          )}
        </div>

        <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 leading-relaxed min-h-[40px]" style={{ fontFamily: FONT_BODY }}>{plan.positioning}</p>

        {isCustom ? (
          <div className="flex flex-col gap-0.5 min-h-[64px] justify-end">
            <span className="text-[36px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>Custom pricing</span>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 min-h-[64px] justify-end">
            <div className="flex items-start gap-0.5">
              <span className="text-[20px] font-semibold text-[var(--hz-ink)] mt-1.5" style={{ fontFamily: FONT_HEAD }}>₹</span>
              <span className="text-[40px] font-semibold text-[var(--hz-ink)] leading-none tabular-nums" style={{ fontFamily: FONT_HEAD }}>{(price as number).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
        <span className="text-[12.5px] text-[var(--hz-ink-subtle)] -mt-3" style={{ fontFamily: FONT_BODY }}>{footerNote}</span>

        <button
          type="button"
          onClick={onSelect}
          className="h-12 rounded-[12px] text-[14px] font-semibold cursor-pointer transition-all active:scale-[0.99]"
          style={
            plan.recommended || isCustom
              ? { backgroundColor: 'var(--hz-primary)', color: 'var(--hz-on-primary)', border: '0' }
              : { backgroundColor: 'transparent', color: 'var(--hz-primary)', border: '1.5px solid var(--hz-primary)' }
          }
        >
          {isCustom ? 'Coming soon' : 'Get started'}
        </button>
      </div>

      <div className="h-px" style={{ backgroundColor: '#EFE9E2' }} />

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Features</span>
          <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{featuresSubtitle}</span>
        </div>
        <ul className="flex flex-col gap-3.5 m-0 p-0" style={{ listStyle: 'none' }}>
          {featureLines.map(f => (
            <li key={f.text} className="flex items-start gap-2.5" title={f.note}>
              <span className="shrink-0 mt-[1px]" style={{ color: 'var(--hz-primary)' }}><IcoCheckCircle /></span>
              <span className="text-[13.5px] text-[#3A363D] leading-snug" style={{ fontFamily: FONT_BODY }}>{f.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Billing cycle toggle ───────────────────────────────────────────────────

function CycleToggle({ cycle, onChange, maxSavingsPct }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void; maxSavingsPct: number | null }) {
  return (
    <div role="group" aria-label="Billing cycle" className="inline-flex p-1.5 rounded-full gap-1 self-start" style={{ backgroundColor: 'var(--hz-primary-soft)' }}>
      <button
        type="button"
        aria-pressed={cycle === 'monthly'}
        onClick={() => onChange('monthly')}
        className="h-10 px-5 rounded-full text-[13.5px] font-semibold cursor-pointer border-0 transition-colors"
        style={{
          backgroundColor: cycle === 'monthly' ? 'var(--hz-primary)' : 'transparent',
          color: cycle === 'monthly' ? 'var(--hz-surface)' : '#5B4A78',
          fontFamily: FONT_BODY,
        }}
      >
        Monthly
      </button>
      <button
        type="button"
        aria-pressed={cycle === 'yearly'}
        onClick={() => onChange('yearly')}
        className="h-10 px-5 rounded-full text-[13.5px] font-semibold cursor-pointer border-0 transition-colors flex items-center gap-1.5"
        style={{
          backgroundColor: cycle === 'yearly' ? 'var(--hz-primary)' : 'transparent',
          color: cycle === 'yearly' ? 'var(--hz-surface)' : '#5B4A78',
          fontFamily: FONT_BODY,
        }}
      >
        Yearly
        {maxSavingsPct !== null && (
          <span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: cycle === 'yearly' ? 'rgba(255,255,255,0.22)' : '#E3C9FF', color: cycle === 'yearly' ? 'var(--hz-surface)' : 'var(--hz-primary)', fontFamily: FONT_MONO }}
          >
            Save up to {maxSavingsPct}%
          </span>
        )}
      </button>
    </div>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────────

export default function PlansBillingScreen({
  role,
  onNavigate,
}: {
  role?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessional = role === 'professional'
  const { currentOrganization } = useOrganizations()
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [notice, setNotice] = useState<string | null>(null)

  function goBack() {
    onNavigate(isProfessional ? 'professional-dashboard' : 'dashboard-home')
  }

  // No subscription/payment backend exists anywhere in this app — every CTA
  // is honest about that rather than faking a checkout, activation or
  // contact-sales workflow that doesn't exist (no such route was found).
  function selectPlan(planName: string, isCustom: boolean) {
    setNotice(isCustom
      ? `${planName} is a custom, organization-level plan — reach out once billing launches. Coming soon.`
      : `Subscription checkout for ${planName} will be available soon.`)
  }

  function billedNote(plan: HomeownerPlan | PartnerPlan): string {
    if (plan.customPricing || plan.monthlyPrice === null) return 'Custom pricing, custom billing'
    return cycle === 'monthly' ? 'Billed monthly' : 'Billed annually'
  }

  // Honest structural copy only ("plan N includes everything plan N-1
  // does" is how the entitlement catalogue is actually built — every
  // capability that's included/limited at a cheaper plan stays that way or
  // better at every plan above it) — never a specific feature claim.
  function homeownerFeaturesSubtitle(id: HomeownerPlanId): string {
    if (id === 'starter') return 'Core planning tools'
    if (id === 'build') return 'Everything in Starter, plus'
    return 'Everything in Build, plus'
  }
  function partnerFeaturesSubtitle(id: PartnerPlanId): string {
    if (id === 'basic') return 'Core partner tools'
    if (id === 'standard') return 'Everything in Basic, plus'
    if (id === 'reach') return 'Everything in Standard, plus'
    return 'Everything in Reach, plus organization-scale controls'
  }

  // The real, non-uniform saving (15.1%-16.4% across plans, see
  // calculateAnnualSavings) — the toggle shows the true ceiling across the
  // current audience's plans, computed live, never a flat marketing number.
  const currentPlans: (HomeownerPlan | PartnerPlan)[] = isProfessional ? PARTNER_PLAN_IDS.map(id => PARTNER_PLANS[id]) : HOMEOWNER_PLAN_IDS.map(id => HOMEOWNER_PLANS[id])
  const savingsPcts = currentPlans.map(p => calculateAnnualSavings(p)?.percentage).filter((n): n is number => typeof n === 'number')
  const maxSavingsPct = savingsPcts.length ? Math.round(Math.max(...savingsPcts)) : null

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Shared screen — professionals get the company PartnerNavRail
            (Plans & Billing highlighted), homeowners the customer Sidebar. */}
        {isProfessional
          ? <PartnerNavRail active="billing" onNavigate={onNavigate} organizationId={currentOrganization?.id} />
          : <Sidebar active="billing" onNavigate={onNavigate} />}

        <div className="flex flex-col flex-1 min-h-0">
          <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
            <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
              <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                <IcoBack /> Back
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-10">
            <div className="max-w-[1160px] mx-auto flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>Plans &amp; Billing</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                  {isProfessional ? 'Choose your partner plan' : 'Choose your plan'}
                </h1>
                <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 max-w-[600px] leading-relaxed" style={{ fontFamily: FONT_BODY }}>
                  {isProfessional
                    ? 'Pick the plan that fits how you use Houzeify to find, bid on and deliver projects — upgrade any time as your business grows.'
                    : 'Pick the plan that fits how you use Houzeify to plan, price and manage your build or renovation — upgrade any time as your project moves forward.'}
                </p>
              </div>

              <CycleToggle cycle={cycle} onChange={setCycle} maxSavingsPct={maxSavingsPct} />

              {isProfessional ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {PARTNER_PLAN_IDS.map(id => {
                    const plan = PARTNER_PLANS[id]
                    return (
                      <PlanCard
                        key={id}
                        plan={plan}
                        cycle={cycle}
                        featureLines={partnerFeatureLines(id)}
                        footerNote={billedNote(plan)}
                        featuresSubtitle={partnerFeaturesSubtitle(id)}
                        onSelect={() => selectPlan(plan.name, plan.customPricing)}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {HOMEOWNER_PLAN_IDS.map(id => {
                    const plan = HOMEOWNER_PLANS[id]
                    return (
                      <PlanCard
                        key={id}
                        plan={plan}
                        cycle={cycle}
                        featureLines={homeownerFeatureLines(id)}
                        footerNote={billedNote(plan)}
                        featuresSubtitle={homeownerFeaturesSubtitle(id)}
                        onSelect={() => selectPlan(plan.name, plan.customPricing)}
                      />
                    )
                  })}
                </div>
              )}

              <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px]" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid color-mix(in oklch, var(--hz-primary) 20%, transparent)' }}>
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--hz-primary)' }}><IcoInfo /></span>
                <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 leading-relaxed" style={{ fontFamily: FONT_BODY }}>
                  Home Services are pay-per-booking and don&apos;t require a Houzeify subscription.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {notice && <Notice message={notice} onDismiss={() => setNotice(null)} />}
    </div>
  )
}
