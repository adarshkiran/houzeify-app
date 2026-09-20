// ─── Subscription Plans — typed plan catalogue (data foundation only) ──────
// UI demonstration data only — there is no billing/payment backend yet, same
// convention as every other module in this folder. This file defines WHAT
// Houzeify's subscription plans are (id, name, price, positioning) — it does
// NOT define who currently holds a subscription. No such record exists
// anywhere in this app yet, and this task deliberately does not create one
// (no Subscription/SubscriptionContext/currentUserSubscription — that is
// later, separate work). See entitlements.ts's own header for the other half
// of this same foundation (what each plan actually unlocks).
//
// SCOPE (15A — Subscription Plan Catalogue + Entitlement Definitions): this
// file and entitlements.ts are the only two files this task adds. No pricing
// UI, no Plans & Billing screen, no subscription state, no payment
// integration, and no feature gate in any existing screen — those are later,
// separate tasks building on top of this static foundation.
//
// TWO COMPLETELY SEPARATE CATALOGUES, NEVER ONE SHARED PlanId — Houzeify has
// two independent subscription products that must never be interchangeable:
//   HomeownerPlanId  'starter' | 'build' | 'build-pro'
//     — gates Build a New Home / Improve My Home (Renovation) planning
//       features only. Never Home Services. Never anything on the
//       partner/professional side.
//   PartnerPlanId    'basic' | 'standard' | 'reach' | 'enterprise'
//     — gates the professional/business (builder, contractor, real-estate
//       company) ecosystem only. Never anything on the homeowner side.
// These two unions share no members, so a HomeownerPlanId value can never be
// assigned where a PartnerPlanId is expected, and vice versa — TypeScript
// enforces "a homeowner subscription must never grant partner privileges"
// (and the reverse) at compile time, not merely by convention or comment.
//
// HOME SERVICES HAS NO SUBSCRIPTION — never import this file (or
// entitlements.ts) from homeServices.ts, customerCart.tsx, customerBooking.ts,
// any service-category screen (Electrician/Plumber/Civil Work/cleaning/salon/
// etc.), or anywhere in the Home Services booking flow (Service → Select
// Service → Cart → Address → Date/Time → Checkout → Booking). That flow stays
// entirely outside this system, by construction, per the approved 15/15A
// pricing audit.

import type { Currency } from './homeownerProfile'

// ─── Plan IDs ───────────────────────────────────────────────────────────────

export type HomeownerPlanId = 'starter' | 'build' | 'build-pro'
export const HOMEOWNER_PLAN_IDS: HomeownerPlanId[] = ['starter', 'build', 'build-pro']

export type PartnerPlanId = 'basic' | 'standard' | 'reach' | 'enterprise'
export const PARTNER_PLAN_IDS: PartnerPlanId[] = ['basic', 'standard', 'reach', 'enterprise']

// ─── Shared shape ───────────────────────────────────────────────────────────

export type BillingCycle = 'monthly' | 'yearly'

/** Not exported — a private mixin for the fields both catalogues share.
 *  HomeownerPlan and PartnerPlan below each pin their own `id`/`audience`
 *  literal type, so extending this common shape never makes the two plan
 *  types assignable to each other. */
interface PlanBase {
  name: string
  /** One-line positioning copy, approved in the 15/15A pricing audit —
   *  content only, no UI implied here. */
  positioning: string
  /** Numeric INR values only — never a formatted string like "₹99/month".
   *  Both `null` for a custom-pricing plan (Enterprise) rather than a
   *  fabricated number standing in for "contact us". */
  monthlyPrice: number | null
  yearlyPrice: number | null
  currency: Currency
  /** Which billing cycles this plan can actually be bought on. Empty for a
   *  custom-pricing plan — 'monthly'/'yearly' don't apply to a negotiated
   *  Enterprise contract. */
  billingOptions: BillingCycle[]
  /** True for exactly one plan per catalogue (Homeowner: Build; Partner:
   *  Standard) — a "most popular"-style flag. Data only; no UI reads this
   *  yet. */
  recommended: boolean
  /** True only for Enterprise. When true, monthlyPrice/yearlyPrice are both
   *  `null` and billingOptions is empty — a real "contact sales" flow is
   *  future work, not part of this data foundation. */
  customPricing: boolean
}

export interface HomeownerPlan extends PlanBase {
  id: HomeownerPlanId
  audience: 'homeowner'
}

export interface PartnerPlan extends PlanBase {
  id: PartnerPlanId
  audience: 'partner'
}

// ─── Homeowner catalogue ────────────────────────────────────────────────────
// Applies ONLY to Build a New Home / Improve My Home (Renovation) — never to
// Home Services (see this file's header).

export const HOMEOWNER_PLANS: Record<HomeownerPlanId, HomeownerPlan> = {
  starter: {
    id: 'starter',
    audience: 'homeowner',
    name: 'Starter',
    positioning: 'Plan your project.',
    monthlyPrice: 49,
    yearlyPrice: 499,
    currency: 'INR',
    billingOptions: ['monthly', 'yearly'],
    recommended: false,
    customPricing: false,
  },
  build: {
    id: 'build',
    audience: 'homeowner',
    name: 'Build',
    positioning: 'Plan, price, and prepare your build in detail.',
    monthlyPrice: 99,
    yearlyPrice: 999,
    currency: 'INR',
    billingOptions: ['monthly', 'yearly'],
    recommended: true,
    customPricing: false,
  },
  'build-pro': {
    id: 'build-pro',
    audience: 'homeowner',
    name: 'Build Pro',
    positioning: 'Own every revision, every version, every decision.',
    monthlyPrice: 199,
    yearlyPrice: 1999,
    currency: 'INR',
    billingOptions: ['monthly', 'yearly'],
    recommended: false,
    customPricing: false,
  },
}

// ─── Partner catalogue ──────────────────────────────────────────────────────
// Applies to the professional/business ecosystem (builders, contractors,
// real-estate companies) — never grants any Homeowner Build/Renovation
// privilege (see this file's header).

export const PARTNER_PLANS: Record<PartnerPlanId, PartnerPlan> = {
  basic: {
    id: 'basic',
    audience: 'partner',
    name: 'Basic',
    positioning: 'Get discovered and start bidding.',
    monthlyPrice: 99,
    yearlyPrice: 999,
    currency: 'INR',
    billingOptions: ['monthly', 'yearly'],
    recommended: false,
    customPricing: false,
  },
  standard: {
    id: 'standard',
    audience: 'partner',
    name: 'Standard',
    positioning: 'Grow your service footprint.',
    monthlyPrice: 199,
    yearlyPrice: 1999,
    currency: 'INR',
    billingOptions: ['monthly', 'yearly'],
    recommended: true,
    customPricing: false,
  },
  reach: {
    id: 'reach',
    audience: 'partner',
    name: 'Reach',
    positioning: 'Get more visibility and reach.',
    monthlyPrice: 299,
    yearlyPrice: 2999,
    currency: 'INR',
    billingOptions: ['monthly', 'yearly'],
    recommended: false,
    customPricing: false,
  },
  enterprise: {
    id: 'enterprise',
    audience: 'partner',
    name: 'Enterprise',
    positioning: 'Run your whole organization on Houzeify.',
    monthlyPrice: null,
    yearlyPrice: null,
    currency: 'INR',
    billingOptions: [],
    recommended: false,
    customPricing: true,
  },
}

// ─── Annual savings — computed, never duplicated ───────────────────────────
// The rounded monthly/yearly prices above produce a real ~15-16% annual
// saving that varies slightly per plan — never a flat, marketable "10%" or
// "20%" (confirmed in the 15 pricing audit). Never hardcode a saving
// anywhere; always derive it from the one price already on the plan, so it
// can never drift out of sync with a future price change.

export interface AnnualSavings {
  /** INR saved per year vs. paying monthly for 12 months. */
  amount: number
  /** Percentage discount, rounded to 2 decimal places. */
  percentage: number
}

/** `null` for a plan with no numeric price (Enterprise) — there is no
 *  saving to compute against a custom quote. */
export function calculateAnnualSavings(plan: HomeownerPlan | PartnerPlan): AnnualSavings | null {
  const { monthlyPrice, yearlyPrice } = plan
  if (monthlyPrice === null || yearlyPrice === null) return null
  const annualSaving = monthlyPrice * 12 - yearlyPrice
  // Single division at the end, then rounded to 2 decimals via integer
  // scaling — avoids compounding floating-point error across the
  // calculation rather than rounding at every intermediate step.
  const annualDiscountPercentage = Math.round((annualSaving / (monthlyPrice * 12)) * 10000) / 100
  return { amount: annualSaving, percentage: annualDiscountPercentage }
}

// ─── Lookups ────────────────────────────────────────────────────────────────

export function getHomeownerPlan(id: HomeownerPlanId): HomeownerPlan {
  return HOMEOWNER_PLANS[id]
}

export function getPartnerPlan(id: PartnerPlanId): PartnerPlan {
  return PARTNER_PLANS[id]
}
