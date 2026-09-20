// ─── Renovation estimate — typed options + pure calc ────────────────────────
// UI demonstration data only — there is no backend yet, same convention as
// bids.ts/costAssumptions.ts. This is the Renovate flow's own estimate
// calculator: a renovation budget range (whole-home scale, distinct from
// serviceRequest.ts's own small-service SERVICE_BUDGET_OPTIONS, which tops
// out at "₹3 lakh+" — too small for a kitchen/full-home renovation) crossed
// with a finish-quality multiplier, split into the same named categories the
// Renovate journey shows throughout (Screen "Review your renovation" →
// "Estimated Renovation Cost"). Never a live model — a deterministic
// formula, same honesty as FinalEstimateScreen's own versionOne/versionTwo
// demo figures.

export type RenovationBudgetRange = 'under-1l' | '1l-3l' | '3l-5l' | '5l-10l' | '10l-plus' | 'custom'

export const RENOVATION_BUDGET_OPTIONS: RenovationBudgetRange[] = ['under-1l', '1l-3l', '3l-5l', '5l-10l', '10l-plus', 'custom']

export const RENOVATION_BUDGET_LABELS: Record<RenovationBudgetRange, string> = {
  'under-1l': 'Under ₹1L',
  '1l-3l': '₹1L–₹3L',
  '3l-5l': '₹3L–₹5L',
  '5l-10l': '₹5L–₹10L',
  '10l-plus': '₹10L+',
  custom: 'Custom Budget',
}

/** Midpoint used to seed the estimate when a range (not a custom figure) is
 *  picked — real numbers only ever anchor to this, never a fabricated
 *  live-model output. */
export const RENOVATION_BUDGET_MIDPOINT: Record<RenovationBudgetRange, number> = {
  'under-1l': 75_000,
  '1l-3l': 200_000,
  '3l-5l': 400_000,
  '5l-10l': 750_000,
  '10l-plus': 1_250_000,
  custom: 400_000, // overridden by the homeowner's own typed figure, never shown as-is
}

export type RenovationTimeline = 'asap' | 'within-1-month' | '1-3-months' | '3-6-months' | 'not-sure'

export const RENOVATION_TIMELINE_OPTIONS: RenovationTimeline[] = ['asap', 'within-1-month', '1-3-months', '3-6-months', 'not-sure']

export const RENOVATION_TIMELINE_LABELS: Record<RenovationTimeline, string> = {
  asap: 'As soon as possible',
  'within-1-month': 'Within 1 month',
  '1-3-months': '1–3 months',
  '3-6-months': '3–6 months',
  'not-sure': "I'm not sure yet",
}

export type RenovationFinish = 'basic' | 'standard' | 'premium' | 'luxury'

export const RENOVATION_FINISH_OPTIONS: RenovationFinish[] = ['basic', 'standard', 'premium', 'luxury']

export const RENOVATION_FINISH_LABELS: Record<RenovationFinish, string> = {
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
  luxury: 'Luxury',
}

/** Applied to the budget midpoint to move the estimate up/down by finish
 *  quality — real, documented multipliers, not a hidden/fabricated model. */
export const RENOVATION_FINISH_MULTIPLIER: Record<RenovationFinish, number> = {
  basic: 0.75,
  standard: 1,
  premium: 1.3,
  luxury: 1.7,
}

export type RenovationCostCategory =
  | 'Cabinets' | 'Countertop' | 'Flooring' | 'Electrical' | 'Plumbing' | 'Lighting' | 'Painting' | 'Labour' | 'Other'

/** Real, fixed share of the total each category represents — sums to 1.
 *  Same "named categories, deterministic split" honesty as
 *  FinalEstimateScreen's own CostSummary breakdown. */
export const RENOVATION_COST_CATEGORY_SHARE: Record<RenovationCostCategory, number> = {
  Cabinets: 0.22,
  Countertop: 0.10,
  Flooring: 0.14,
  Electrical: 0.08,
  Plumbing: 0.07,
  Lighting: 0.06,
  Painting: 0.08,
  Labour: 0.20,
  Other: 0.05,
}

export interface RenovationEstimate {
  minCost: number
  maxCost: number
  breakdown: { category: RenovationCostCategory; amount: number }[]
}

/** Pure calc — no side effects, mirrors costAssumptions.ts's own pattern.
 *  `customAmount` overrides the range midpoint when budgetRange === 'custom'. */
export function estimateRenovationCost(
  budgetRange: RenovationBudgetRange,
  finish: RenovationFinish,
  customAmount?: number,
): RenovationEstimate {
  const base = budgetRange === 'custom' && customAmount ? customAmount : RENOVATION_BUDGET_MIDPOINT[budgetRange]
  const mid = Math.round(base * RENOVATION_FINISH_MULTIPLIER[finish])
  const minCost = Math.round(mid * 0.85)
  const maxCost = Math.round(mid * 1.15)
  const breakdown = (Object.keys(RENOVATION_COST_CATEGORY_SHARE) as RenovationCostCategory[]).map(category => ({
    category,
    amount: Math.round(mid * RENOVATION_COST_CATEGORY_SHARE[category]),
  }))
  return { minCost, maxCost, breakdown }
}
