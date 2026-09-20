// ─── Homeowner Onboarding — typed data model + validation service ──────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "save homeowner onboarding" API replaces; the screen must
// only ever validate/assemble this data through the functions here, never
// inline in the component.
//
// UX PRINCIPLE — this is a lightweight personalization step, not a project
// creation form. One reusable model with nullable, intent-specific fields
// — never three separate duplicated models for build/improve/service.

export type PrimaryIntent = 'build-home' | 'improve-home' | 'home-service'

export type PlotStatus = 'owned' | 'looking' | 'family-land' | 'not-sure'
export type ConstructionStage = 'exploring' | 'planning' | 'has-plan' | 'ready-to-build'
export type HasHousePlan = 'yes' | 'in-progress' | 'no' | 'not-sure'
export type HomeStatus = 'existing' | 'recently-purchased' | 'investment' | 'family-home'
export type ImprovementIntent = 'renovate' | 'extend' | 'remodel' | 'upgrade' | 'not-sure'
export type ServiceCategory = 'flooring' | 'windows-doors' | 'painting' | 'electrical' | 'plumbing' | 'waterproofing' | 'kitchen' | 'bathroom' | 'roofing' | 'carpentry' | 'cleaning' | 'other'
export type ServiceUrgency = 'not-urgent' | 'soon' | 'urgent'

export interface HomeownerOnboarding {
  userId: string
  primaryIntent: PrimaryIntent
  name: string
  plotStatus: PlotStatus | null
  constructionStage: ConstructionStage | null
  hasHousePlan: HasHousePlan | null
  homeStatus: HomeStatus | null
  improvementIntent: ImprovementIntent | null
  /** A homeowner-facing category id from the real, canonical catalogue in
   *  homeServices.ts (Cleaning Services or Home Services, per Screen 007's
   *  service_entry) — typed loosely as `string` here rather than this
   *  file's own 12-value ServiceCategory to avoid a circular import (this
   *  file is itself the base that catalogue extends). Never a fabricated
   *  or freeform value — always one of homeServices.ts's real ids. */
  serviceCategory: string | null
  serviceUrgency: ServiceUrgency | null
  completedAt: string
}

// ─── Header content per intent ───────────────────────────────────────────

export interface IntentHeaderContent {
  title: string
  description: string
  hozieMessage: string
}

export const INTENT_HEADER_CONTENT: Record<PrimaryIntent, IntentHeaderContent> = {
  'build-home': {
    title: "Let's get your home project started.",
    description: 'A few quick details will help Hozie personalize your experience.',
    hozieMessage: "Hi! I'll use these details to guide you through planning, estimating and finding the right professionals.",
  },
  'improve-home': {
    title: "Let's understand your home.",
    description: "A few quick details will help Hozie understand what you'd like to improve.",
    hozieMessage: "Hi! I'll use these details to help you plan the right renovation, upgrade or extension.",
  },
  'home-service': {
    title: "Let's understand what you need.",
    description: 'A few quick details will help Hozie find the right service and professionals.',
    hozieMessage: "Hi! I'll use these details to help match you with the right service and professionals.",
  },
}

// ─── Option catalogues (title + description shown on each card, plus a
// short label used only in the personalization summary) ──────────────────

interface OptionContent<V extends string> {
  value: V
  title: string
  description: string
  summaryLabel: string
}

export const PLOT_STATUS_OPTIONS: OptionContent<PlotStatus>[] = [
  { value: 'owned', title: 'Yes, I have a plot', description: 'I already own the land where I want to build.', summaryLabel: 'Plot owned' },
  { value: 'looking', title: 'Looking for a plot', description: "I haven't purchased land yet.", summaryLabel: 'Looking for a plot' },
  { value: 'family-land', title: 'Building on family land', description: 'The land belongs to my family.', summaryLabel: 'Building on family land' },
  { value: 'not-sure', title: 'Not sure yet', description: "I'm still figuring it out.", summaryLabel: 'Plot status not sure' },
]

export const CONSTRUCTION_STAGE_OPTIONS: OptionContent<ConstructionStage>[] = [
  { value: 'exploring', title: 'Just exploring', description: "I'm researching costs and possibilities.", summaryLabel: 'Just exploring' },
  { value: 'planning', title: 'Planning', description: "I have decided to build and I'm planning the project.", summaryLabel: 'Planning stage' },
  { value: 'has-plan', title: 'Have a plan', description: 'I already have a house plan or drawing.', summaryLabel: 'Have a plan' },
  { value: 'ready-to-build', title: 'Ready to build', description: "I'm ready to find professionals and start construction.", summaryLabel: 'Ready to build' },
]

export const HAS_HOUSE_PLAN_OPTIONS: OptionContent<HasHousePlan>[] = [
  { value: 'yes', title: 'Yes, I have a plan', description: 'I have a PDF, image or CAD drawing.', summaryLabel: 'Plan ready' },
  { value: 'in-progress', title: 'Working on a plan', description: 'My plan is being prepared.', summaryLabel: 'Plan in progress' },
  { value: 'no', title: 'No plan yet', description: 'I need help getting started.', summaryLabel: 'Plan not ready' },
  { value: 'not-sure', title: 'Not sure', description: 'I need guidance.', summaryLabel: 'Plan status unclear' },
]

export const HOME_STATUS_OPTIONS: OptionContent<HomeStatus>[] = [
  { value: 'existing', title: 'Existing house', description: 'I already live in the house.', summaryLabel: 'Existing house' },
  { value: 'recently-purchased', title: 'Recently purchased', description: 'I recently bought the property.', summaryLabel: 'Recently purchased' },
  { value: 'investment', title: 'Investment property', description: 'I own the property but may not live there.', summaryLabel: 'Investment property' },
  { value: 'family-home', title: 'Family home', description: "It's a family property.", summaryLabel: 'Family home' },
]

export const IMPROVEMENT_INTENT_OPTIONS: OptionContent<ImprovementIntent>[] = [
  { value: 'renovate', title: 'Renovate', description: 'Upgrade one or more areas.', summaryLabel: 'Renovation' },
  { value: 'extend', title: 'Extend', description: 'Add space or extend the building.', summaryLabel: 'Extension' },
  { value: 'remodel', title: 'Remodel', description: 'Change the layout or functionality.', summaryLabel: 'Remodel' },
  { value: 'upgrade', title: 'Upgrade', description: 'Improve specific elements.', summaryLabel: 'Upgrade' },
  { value: 'not-sure', title: 'Not sure', description: 'I need guidance.', summaryLabel: 'Not sure yet' },
]

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  flooring: 'Flooring',
  'windows-doors': 'Windows & Doors',
  painting: 'Painting',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  waterproofing: 'Waterproofing',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  roofing: 'Roofing',
  carpentry: 'Carpentry',
  cleaning: 'Cleaning',
  other: 'Other',
}
export const SERVICE_CATEGORY_OPTIONS: ServiceCategory[] = ['flooring', 'windows-doors', 'painting', 'electrical', 'plumbing', 'waterproofing', 'kitchen', 'bathroom', 'roofing', 'carpentry', 'cleaning', 'other']

export const SERVICE_URGENCY_OPTIONS: OptionContent<ServiceUrgency>[] = [
  { value: 'not-urgent', title: 'Not urgent', description: "I'm planning ahead.", summaryLabel: 'Planning ahead' },
  { value: 'soon', title: 'Soon', description: "I'd like to start within the next few weeks.", summaryLabel: 'Starting soon' },
  { value: 'urgent', title: 'Urgent', description: 'I need help as soon as possible.', summaryLabel: 'Urgent' },
]

// ─── Form values + validation ─────────────────────────────────────────────

export interface OnboardingFormValues {
  name: string
  primaryIntent: PrimaryIntent
  plotStatus: PlotStatus | null
  constructionStage: ConstructionStage | null
  hasHousePlan: HasHousePlan | null
  homeStatus: HomeStatus | null
  improvementIntent: ImprovementIntent | null
  serviceCategory: string | null
  serviceUrgency: ServiceUrgency | null
}

/** The validation service — the screen reads whether it can continue only
 *  through this function, never inline. Only the fields relevant to the
 *  selected intent are required. */
export function isOnboardingFormValid(values: OnboardingFormValues): boolean {
  if (values.name.trim().length < 2) return false
  if (values.primaryIntent === 'build-home') {
    return values.plotStatus !== null && values.constructionStage !== null && values.hasHousePlan !== null
  }
  if (values.primaryIntent === 'improve-home') {
    return values.homeStatus !== null && values.improvementIntent !== null
  }
  return values.serviceCategory !== null && values.serviceUrgency !== null
}

/** Builds the "Your starting point" summary lines — every line reflects a
 *  real answer, never an invented default. */
export function getSummaryLines(values: OnboardingFormValues): string[] {
  if (values.primaryIntent === 'build-home') {
    return [
      values.plotStatus && PLOT_STATUS_OPTIONS.find(o => o.value === values.plotStatus)!.summaryLabel,
      values.constructionStage && CONSTRUCTION_STAGE_OPTIONS.find(o => o.value === values.constructionStage)!.summaryLabel,
      values.hasHousePlan && HAS_HOUSE_PLAN_OPTIONS.find(o => o.value === values.hasHousePlan)!.summaryLabel,
    ].filter((l): l is string => Boolean(l))
  }
  if (values.primaryIntent === 'improve-home') {
    return [
      values.homeStatus && HOME_STATUS_OPTIONS.find(o => o.value === values.homeStatus)!.summaryLabel,
      values.improvementIntent && IMPROVEMENT_INTENT_OPTIONS.find(o => o.value === values.improvementIntent)!.summaryLabel,
    ].filter((l): l is string => Boolean(l))
  }
  // The service category's real display name is resolved by the screen
  // itself from homeServices.ts's canonical catalogue (Cleaning Services /
  // Home Services) and prepended there — this function never fabricates a
  // label for an id it doesn't own, avoiding a circular import back into
  // the file that catalogue itself extends.
  return [
    values.serviceUrgency && SERVICE_URGENCY_OPTIONS.find(o => o.value === values.serviceUrgency)!.summaryLabel,
  ].filter((l): l is string => Boolean(l))
}

/** Assembles the onboarding record from validated form values — the screen
 *  must call this only after isOnboardingFormValid() confirms the form is
 *  complete. No persistence yet; this is the seam a real "save onboarding"
 *  API call replaces. */
export function createHomeownerOnboarding(values: OnboardingFormValues, userId: string): HomeownerOnboarding {
  return {
    userId,
    primaryIntent: values.primaryIntent,
    name: values.name.trim(),
    plotStatus: values.primaryIntent === 'build-home' ? values.plotStatus : null,
    constructionStage: values.primaryIntent === 'build-home' ? values.constructionStage : null,
    hasHousePlan: values.primaryIntent === 'build-home' ? values.hasHousePlan : null,
    homeStatus: values.primaryIntent === 'improve-home' ? values.homeStatus : null,
    improvementIntent: values.primaryIntent === 'improve-home' ? values.improvementIntent : null,
    serviceCategory: values.primaryIntent === 'home-service' ? values.serviceCategory : null,
    serviceUrgency: values.primaryIntent === 'home-service' ? values.serviceUrgency : null,
    completedAt: new Date().toISOString(),
  }
}
