// ─── Home Intent — typed data model + service ───────────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "save home intent" API replaces; the screen must only ever
// read/write this data through the functions here, never inline in a
// component.
//
// This captures the homeowner's SPECIFIC need after Screen 007's broad
// primaryIntent — never a duplicate of it. Reuses PrimaryIntent and
// ConstructionStage/ServiceCategory straight from homeownerOnboarding.ts
// (Screen 008's own model) rather than redefining overlapping types, so a
// value already captured there can be reused and preselected here instead
// of asked twice.

import {
  type PrimaryIntent,
  type ConstructionStage,
  type ServiceCategory as BaseServiceCategory,
  CONSTRUCTION_STAGE_OPTIONS,
} from './homeownerOnboarding'

export type { PrimaryIntent, ConstructionStage }

export type HomeType = 'independent-house' | 'villa' | 'duplex' | 'apartment' | 'extension' | 'other'
export type ImprovementType = 'renovation' | 'extension' | 'remodel' | 'repair' | 'upgrade' | 'other'
export type HomeArea = 'whole-home' | 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior' | 'roof' | 'other'

// ─── Batch B — basic "Your Home" attributes (build-home only) ──────────────
// No existing field anywhere in the codebase carries BHK, built-up area, or
// floor count as real data (confirmed repo-wide before adding these) — this
// is genuinely new information, not a duplicate of anything. All three stay
// entirely optional: a homeowner who doesn't know these yet must be able to
// say so honestly ('unknown'/blank) rather than being blocked or having a
// value guessed for them. Scoped to the build-home branch only — improve-
// home and home-service capture a different kind of information (what
// needs work, not what the home physically is) and are deliberately left
// untouched.
export type HomeBHK = '1' | '2' | '3' | '4' | '5+' | 'unknown'
export type HomeFloorCount = 'ground' | 'g-plus-1' | 'g-plus-2' | 'g-plus-3-plus' | 'unknown'

// Screen 011's service list is a superset of Screen 008's (adds false
// ceiling, glass & aluminium, solar, HVAC) — same underlying concept, just
// more complete, so it extends rather than redefines the base type.
//
// ─── Home Services / Cleaning Services separation ──────────────────────────
// Extends the SAME ServiceCategory union rather than inventing a second,
// competing category type — the existing ServiceRequest model, provider/
// quote/job pipeline and Screens 014/015/016 all stay generic over ONE
// ServiceCategory. Six real-world matches are reused verbatim from the base
// type (plumbing, electrical, carpentry, painting, waterproofing,
// windows-doors) rather than minted as new ids for the same underlying
// service. Every id below belongs to exactly one catalogue — see
// homeServices.ts's `catalogue` field on ServiceCategoryMeta, the actual
// enforcement point (this type only says an id is valid, not which
// catalogue owns it).
export type CleaningCategory =
  | 'full-home-cleaning'
  | 'living-bedroom-cleaning'
  | 'deep-cleaning'
  | 'bathroom-cleaning'
  | 'kitchen-cleaning'
  | 'sofa-cleaning'
  | 'mattress-cleaning'
  | 'window-cleaning'
  | 'move-in-move-out-cleaning'
  | 'water-tank-cleaning'
  | 'other-cleaning'

export type HomeServiceOnlyCategory =
  // Personal Care at Home
  | 'salon-spa-women' | 'spa-for-women' | 'hair-studio-women' | 'makeup-saree-styling' | 'salon-for-men' | 'massage-for-men'
  // AC & Appliance Repair
  | 'ac-service-repair' | 'washing-machine' | 'refrigerator' | 'television' | 'chimney' | 'microwave' | 'stove' | 'laptop' | 'ro-water-purifier' | 'geyser' | 'air-cooler'
  // Electrician, Plumber & Carpenter (new items only — plumbing/electrical/carpentry reused from the base type)
  | 'fan-installation' | 'furniture-assembly' | 'geyser-service-repair' | 'lights-installation' | 'civil-work'
  // Home Services (new items only — painting/waterproofing/windows-doors reused from the base type)
  | 'tile-grouting' | 'wall-panels-installation' | 'masonry-civil-work' | 'home-maintenance' | 'other-home-services'
  // Pest Control
  | 'cockroach-control' | 'termite-control' | 'ants-bedbugs-control'

export type ServiceCategory = BaseServiceCategory | 'false-ceiling' | 'glass-aluminium' | 'solar' | 'hvac' | CleaningCategory | HomeServiceOnlyCategory
export type ServiceNeed = 'install' | 'replace' | 'repair' | 'not-sure'

export interface HomeIntent {
  userId: string
  primaryIntent: PrimaryIntent
  homeType: HomeType | null
  constructionStage: ConstructionStage | null
  homeBHK: HomeBHK | null
  homeBuiltUpArea: string
  homeFloorCount: HomeFloorCount | null
  improvementTypes: ImprovementType[]
  homeAreas: HomeArea[]
  serviceCategory: ServiceCategory | null
  serviceNeed: ServiceNeed | null
  otherDescription: string
  completedAt: string
}

// ─── Header content per intent ───────────────────────────────────────────

export interface IntentHeaderContent {
  eyebrow: string
  title: string
  description: string
  hozieMessage: string
}

export const HOME_INTENT_HEADER_CONTENT: Record<PrimaryIntent, IntentHeaderContent> = {
  'build-home': {
    eyebrow: 'Home Project',
    title: 'What are you planning to build?',
    description: 'Tell Hozie a little more about your new home so we can prepare your next steps.',
    hozieMessage: "Great. I'll use this to personalize your project setup and estimate.",
  },
  'improve-home': {
    eyebrow: 'Home Improvement',
    title: 'What would you like to improve?',
    description: 'Choose what you want to renovate, upgrade or extend.',
    hozieMessage: "Got it. I'll help you break the improvement into manageable work.",
  },
  'home-service': {
    eyebrow: 'Home Service',
    title: 'What do you need help with?',
    description: "Choose the service you need and we'll help you find the right professionals.",
    hozieMessage: "I'll help you find the right professionals for this service.",
  },
}

// ─── Build home ────────────────────────────────────────────────────────────

interface OptionContent<V extends string> {
  value: V
  title: string
  description: string
}

export const HOME_TYPE_OPTIONS: OptionContent<HomeType>[] = [
  { value: 'independent-house', title: 'Independent House', description: 'A standalone home on your plot.' },
  { value: 'villa', title: 'Villa', description: 'A planned villa or gated-community home.' },
  { value: 'duplex', title: 'Duplex', description: 'A two-level home with independent or shared access.' },
  { value: 'apartment', title: 'Apartment / Flat', description: 'Interior or construction-related work for an apartment.' },
  { value: 'extension', title: 'Extension / Additional Floor', description: 'Adding space or another floor to an existing property.' },
  { value: 'other', title: 'Other', description: 'Something different.' },
]

// Reuse Screen 008's construction-stage catalogue directly — same options,
// same values, so a value captured there can be preselected here as-is.
export const HOME_INTENT_STAGE_OPTIONS = CONSTRUCTION_STAGE_OPTIONS

// "I don't know yet" is a real, explicit answer here — never omitted in
// favour of silently leaving the question blank, and never a reason to
// block Continue (isHomeIntentValid never requires any of these three).
export const HOME_BHK_OPTIONS: { value: HomeBHK; label: string }[] = [
  { value: '1', label: '1 BHK' },
  { value: '2', label: '2 BHK' },
  { value: '3', label: '3 BHK' },
  { value: '4', label: '4 BHK' },
  { value: '5+', label: '5+ BHK' },
  { value: 'unknown', label: "I don't know yet" },
]

// "G+1"/"G+2" mirrors the exact terminology already used elsewhere in this
// app (Material Calculator's own Floors field, BOQ assumptions) rather than
// inventing new phrasing for the same concept.
export const HOME_FLOOR_COUNT_OPTIONS: { value: HomeFloorCount; label: string }[] = [
  { value: 'ground', label: 'Ground floor only' },
  { value: 'g-plus-1', label: 'G+1' },
  { value: 'g-plus-2', label: 'G+2' },
  { value: 'g-plus-3-plus', label: 'G+3 or more' },
  { value: 'unknown', label: 'Not decided yet' },
]

// ─── Improve home ──────────────────────────────────────────────────────────

export const IMPROVEMENT_TYPE_OPTIONS: OptionContent<ImprovementType>[] = [
  { value: 'renovation', title: 'Renovation', description: 'Upgrade one or more areas of the home.' },
  { value: 'extension', title: 'Extension', description: 'Add new space or extend the building.' },
  { value: 'remodel', title: 'Remodel', description: 'Change the layout or functionality.' },
  { value: 'repair', title: 'Repair', description: 'Fix existing construction problems.' },
  { value: 'upgrade', title: 'Upgrade', description: 'Improve specific parts of the home.' },
  { value: 'other', title: 'Not Sure', description: 'I need help deciding.' },
]

export const HOME_AREA_LABELS: Record<HomeArea, string> = {
  'whole-home': 'Whole Home',
  'living-room': 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  exterior: 'Exterior',
  roof: 'Roof',
  other: 'Other',
}
export const HOME_AREA_OPTIONS: HomeArea[] = ['whole-home', 'living-room', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'roof', 'other']

// ─── Home service ────────────────────────────────────────────────────────
// This legacy 16-category label/option list is scoped to categories that
// predate the Home Services / Cleaning Services split — the new 40
// cleaning + home-service-only categories are NOT added here (their names
// live once, canonically, in homeServices.ts's SERVICE_CATEGORIES — never
// duplicated in a second label map). ConstructionIntentScreen.tsx (011)
// reads THIS map only for its 'other'/legacy path; its new cleaning/
// home-services branches read homeServices.ts directly instead.
export type LegacyServiceCategory = Exclude<ServiceCategory, CleaningCategory | HomeServiceOnlyCategory>

export const SERVICE_CATEGORY_LABELS: Record<LegacyServiceCategory, string> = {
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
  'false-ceiling': 'False Ceiling',
  'glass-aluminium': 'Glass & Aluminium',
  solar: 'Solar',
  hvac: 'HVAC',
  other: 'Other',
}
export const SERVICE_CATEGORY_OPTIONS: LegacyServiceCategory[] = [
  'flooring', 'windows-doors', 'painting', 'electrical', 'plumbing', 'waterproofing',
  'kitchen', 'bathroom', 'roofing', 'carpentry', 'cleaning', 'false-ceiling', 'glass-aluminium', 'solar', 'hvac', 'other',
]

// A single reusable service-intent configuration — never one hand-built
// page per service. The category name is substituted into a shared
// template, matching the brief's "Install new flooring / Install new
// windows" style examples without hardcoding each one.
export const SERVICE_NEED_LABELS: Record<ServiceNeed, string> = {
  install: 'Install new',
  replace: 'Replace existing',
  repair: 'Repair',
  'not-sure': 'Not sure',
}
export const SERVICE_NEED_OPTIONS: ServiceNeed[] = ['install', 'replace', 'repair', 'not-sure']

export function serviceNeedLabel(need: ServiceNeed, category: LegacyServiceCategory): string {
  if (need === 'not-sure') return 'Not sure'
  const categoryLabel = SERVICE_CATEGORY_LABELS[category].toLowerCase()
  return `${SERVICE_NEED_LABELS[need]} ${categoryLabel}`
}

// ─── Validation ──────────────────────────────────────────────────────────

export interface HomeIntentFormValues {
  primaryIntent: PrimaryIntent
  homeType: HomeType | null
  constructionStage: ConstructionStage | null
  homeBHK: HomeBHK | null
  homeBuiltUpArea: string
  homeFloorCount: HomeFloorCount | null
  improvementTypes: ImprovementType[]
  homeAreas: HomeArea[]
  serviceCategory: ServiceCategory | null
  serviceNeed: ServiceNeed | null
  otherDescription: string
}

/** Legacy categories that actually render the install/replace/repair
 *  "what do you want to do?" chips in ConstructionIntentScreen.tsx — every
 *  other value (legacy 'other'/'cleaning', and every category introduced by
 *  the Home Services / Cleaning Services split) shows a free-text box
 *  instead, so Continue must never require a `serviceNeed` those screens
 *  never ask for. */
const LEGACY_CATEGORIES_WITH_NEED_DRILLDOWN = new Set<ServiceCategory>([
  'flooring', 'windows-doors', 'painting', 'electrical', 'plumbing', 'waterproofing',
  'kitchen', 'bathroom', 'roofing', 'carpentry', 'false-ceiling', 'glass-aluminium', 'solar', 'hvac',
])

export function isHomeIntentValid(values: HomeIntentFormValues): boolean {
  if (values.primaryIntent === 'build-home') return values.homeType !== null
  if (values.primaryIntent === 'improve-home') return values.improvementTypes.length > 0
  // home-service
  if (values.serviceCategory === null) return false
  if (values.serviceCategory === 'other') return values.otherDescription.trim().length > 0
  if (LEGACY_CATEGORIES_WITH_NEED_DRILLDOWN.has(values.serviceCategory)) return values.serviceNeed !== null
  // Legacy 'cleaning' and every new Cleaning Services / Home Services
  // category collect no drilldown field in this screen — the selection
  // itself is enough, never blocking Continue on a field never shown.
  return true
}

/** True for the 16 pre-split categories this file's own label map covers —
 *  false for any of the 40 new cleaning/home-service-only categories, whose
 *  names live once, canonically, in homeServices.ts instead. Lets
 *  getHomeIntentSummaryLines() stay type-safe and crash-free for every
 *  ServiceCategory value without duplicating the new names here. */
function isLegacyServiceCategory(id: ServiceCategory): id is LegacyServiceCategory {
  return id in SERVICE_CATEGORY_LABELS
}

/** Builds the dynamic "Your plan" / "Your request" summary lines — every
 *  line reflects a real selection, never an invented default. */
export function getHomeIntentSummaryLines(values: HomeIntentFormValues, location?: string): string[] {
  if (values.primaryIntent === 'build-home') {
    return [
      values.homeType && HOME_TYPE_OPTIONS.find(o => o.value === values.homeType)!.title,
      values.constructionStage && HOME_INTENT_STAGE_OPTIONS.find(o => o.value === values.constructionStage)!.title,
      values.homeBHK && values.homeBHK !== 'unknown' ? HOME_BHK_OPTIONS.find(o => o.value === values.homeBHK)!.label : null,
      values.homeBuiltUpArea.trim() ? `${values.homeBuiltUpArea.trim()} sq ft` : null,
      values.homeFloorCount && values.homeFloorCount !== 'unknown' ? HOME_FLOOR_COUNT_OPTIONS.find(o => o.value === values.homeFloorCount)!.label : null,
      location,
    ].filter((l): l is string => Boolean(l))
  }
  if (values.primaryIntent === 'improve-home') {
    return [
      ...values.improvementTypes.map(t => IMPROVEMENT_TYPE_OPTIONS.find(o => o.value === t)!.title),
      ...values.homeAreas.map(a => HOME_AREA_LABELS[a]),
    ]
  }
  // New (cleaning / general home-service) categories are summarised by
  // ConstructionIntentScreen.tsx directly from homeServices.ts instead —
  // this branch only ever resolves a label for the 16 legacy categories it
  // already knows, and never crashes or fabricates a label for the rest.
  const category = values.serviceCategory
  const isLegacy = category !== null && isLegacyServiceCategory(category)
  return [
    isLegacy ? SERVICE_CATEGORY_LABELS[category] : null,
    category === 'other' ? (values.otherDescription.trim() || null) : (isLegacy && values.serviceNeed ? serviceNeedLabel(values.serviceNeed, category) : null),
    location,
  ].filter((l): l is string => Boolean(l))
}

export function homeIntentSummaryTitle(primaryIntent: PrimaryIntent): string {
  return primaryIntent === 'home-service' ? 'Your Request' : 'Your Plan'
}

/** Assembles the saved home-intent record — the seam a real "save home
 *  intent" API call replaces. */
export function createHomeIntent(values: HomeIntentFormValues, userId: string): HomeIntent {
  return {
    userId,
    primaryIntent: values.primaryIntent,
    homeType: values.primaryIntent === 'build-home' ? values.homeType : null,
    constructionStage: values.primaryIntent === 'build-home' ? values.constructionStage : null,
    homeBHK: values.primaryIntent === 'build-home' ? values.homeBHK : null,
    homeBuiltUpArea: values.primaryIntent === 'build-home' ? values.homeBuiltUpArea.trim() : '',
    homeFloorCount: values.primaryIntent === 'build-home' ? values.homeFloorCount : null,
    improvementTypes: values.primaryIntent === 'improve-home' ? values.improvementTypes : [],
    homeAreas: values.primaryIntent === 'improve-home' ? values.homeAreas : [],
    serviceCategory: values.primaryIntent === 'home-service' ? values.serviceCategory : null,
    serviceNeed: values.primaryIntent === 'home-service' ? values.serviceNeed : null,
    otherDescription: values.primaryIntent === 'home-service' ? values.otherDescription.trim() : '',
    completedAt: new Date().toISOString(),
  }
}
