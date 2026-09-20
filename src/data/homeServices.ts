// ─── Home Services — homeowner service discovery ────────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// SINGLE source of truth for every homeowner-facing service category —
// both catalogues (Cleaning Services and general Home Services) are built
// from the ONE ServiceCategory union and the ONE SERVICE_CATEGORIES array
// below; there is no second, competing category list anywhere else.
//
// CATALOGUE OWNERSHIP — the hard rule: every category's `catalogue` field
// below assigns it to exactly one of 'cleaning' | 'home-services' | null
// (null = legacy/inactive, kept only so old stored values and this file's
// own exhaustive Record types keep compiling — never shown in any browse
// UI). Screens must always filter by `catalogue`, never render the raw
// unfiltered list, so a category can never appear in both catalogues.
//
// The 16 pre-split categories (constructionIntent.ts's LegacyServiceCategory)
// are NOT deleted or renamed — 6 of them (plumbing, electrical, carpentry,
// painting, waterproofing, windows-doors) are real, still-active Home
// Services categories reused verbatim; the remaining 10 (flooring, kitchen,
// bathroom, roofing, false-ceiling, glass-aluminium, solar, hvac, cleaning,
// other) are marked inactive/catalogue:null — no longer shown in new
// browse UI, but the type stays valid so an existing stored ServiceRequest
// never crashes anything that reads it back.

import {
  type ServiceCategory,
  type LegacyServiceCategory,
  type CleaningCategory,
  type HomeServiceOnlyCategory,
  SERVICE_CATEGORY_OPTIONS as LEGACY_SERVICE_CATEGORY_OPTIONS,
  SERVICE_CATEGORY_LABELS as LEGACY_SERVICE_CATEGORY_LABELS,
} from './constructionIntent'
import type { ServiceEntry } from './serviceEntry'

export type { ServiceCategory }

// ─── Cleaning Services catalogue (11) ───────────────────────────────────────

export const CLEANING_CATEGORY_OPTIONS: CleaningCategory[] = [
  'full-home-cleaning', 'living-bedroom-cleaning', 'deep-cleaning', 'bathroom-cleaning', 'kitchen-cleaning',
  'sofa-cleaning', 'mattress-cleaning', 'window-cleaning', 'move-in-move-out-cleaning', 'water-tank-cleaning', 'other-cleaning',
]

// ─── Home Services catalogue groups (35, incl. 6 reused legacy ids) ────────

export type HomeServiceGroup = 'personal-care-at-home' | 'ac-appliance-repair' | 'electrician-plumber-carpenter' | 'home-services-general' | 'pest-control'

// "Essential Home Repairs" — renamed from "Electrician, Plumber & Carpenter"
// (this task) now that Civil Work sits alongside those three. Only this one
// group label changes; every individual category name (Electrician,
// Plumbing, Carpentry, Civil Work, ...) is unaffected.
export const HOME_SERVICE_GROUP_LABELS: Record<HomeServiceGroup, string> = {
  'personal-care-at-home': 'Personal Care at Home',
  'ac-appliance-repair': 'AC & Appliance Repair',
  'electrician-plumber-carpenter': 'Essential Home Repairs',
  'home-services-general': 'Home Services',
  'pest-control': 'Pest Control',
}

const HOME_SERVICE_GROUP_MEMBERS: Record<HomeServiceGroup, (HomeServiceOnlyCategory | LegacyServiceCategory)[]> = {
  'personal-care-at-home': ['salon-spa-women', 'spa-for-women', 'hair-studio-women', 'makeup-saree-styling', 'salon-for-men', 'massage-for-men'],
  'ac-appliance-repair': ['ac-service-repair', 'washing-machine', 'refrigerator', 'television', 'chimney', 'microwave', 'stove', 'laptop', 'ro-water-purifier', 'geyser', 'air-cooler'],
  'electrician-plumber-carpenter': ['plumbing', 'electrical', 'carpentry', 'civil-work', 'fan-installation', 'furniture-assembly', 'geyser-service-repair', 'lights-installation'],
  'home-services-general': ['painting', 'waterproofing', 'windows-doors', 'tile-grouting', 'wall-panels-installation', 'masonry-civil-work', 'home-maintenance', 'other-home-services'],
  'pest-control': ['cockroach-control', 'termite-control', 'ants-bedbugs-control'],
}

export const HOME_SERVICE_GROUP_ORDER: HomeServiceGroup[] = [
  'personal-care-at-home', 'ac-appliance-repair', 'electrician-plumber-carpenter', 'home-services-general', 'pest-control',
]

export interface ServiceCategoryMeta {
  id: ServiceCategory
  name: string
  description: string
  /** Which catalogue owns this category — the enforcement point for the
   *  "never shown in both" rule. null = legacy/inactive. */
  catalogue: ServiceEntry | null
  /** Only meaningful when catalogue === 'home-services'. */
  group: HomeServiceGroup | null
  popular: boolean
  active: boolean
}

type ServiceCategoryMetaInput = Omit<ServiceCategoryMeta, 'id' | 'name'>

const SERVICE_META: Record<ServiceCategory, ServiceCategoryMetaInput> = {
  // ── Reused legacy ids, now real active Home Services categories ──
  plumbing: { description: 'Pipes, fittings & leak repair', catalogue: 'home-services', group: 'electrician-plumber-carpenter', popular: true, active: true },
  electrical: { description: 'Wiring, fittings & repairs', catalogue: 'home-services', group: 'electrician-plumber-carpenter', popular: true, active: true },
  carpentry: { description: 'Furniture, doors & woodwork', catalogue: 'home-services', group: 'electrician-plumber-carpenter', popular: false, active: true },
  painting: { description: 'Interior, exterior & texture work', catalogue: 'home-services', group: 'home-services-general', popular: true, active: true },
  waterproofing: { description: 'Roof, wall & bathroom leaks', catalogue: 'home-services', group: 'home-services-general', popular: false, active: true },
  'windows-doors': { description: 'Doors & windows — install, replace or repair', catalogue: 'home-services', group: 'home-services-general', popular: false, active: true },

  // ── Legacy ids no longer part of either new catalogue — kept for type/
  //    backward compatibility with old stored records only, never shown ──
  flooring: { description: 'Tiles, marble, wood & more', catalogue: null, group: null, popular: false, active: false },
  kitchen: { description: 'Modular kitchen & fittings', catalogue: null, group: null, popular: false, active: false },
  bathroom: { description: 'Fittings, tiling & renovation', catalogue: null, group: null, popular: false, active: false },
  roofing: { description: 'Repair, sheets & waterproofing', catalogue: null, group: null, popular: false, active: false },
  'false-ceiling': { description: 'Gypsum, POP & panel ceilings', catalogue: null, group: null, popular: false, active: false },
  'glass-aluminium': { description: 'Partitions, railings & facades', catalogue: null, group: null, popular: false, active: false },
  solar: { description: 'Panels, inverters & installation', catalogue: null, group: null, popular: false, active: false },
  hvac: { description: 'Air conditioning & ventilation', catalogue: null, group: null, popular: false, active: false },
  cleaning: { description: 'Full home, sofa, mattress & carpet cleaning', catalogue: null, group: null, popular: false, active: false },
  other: { description: "Something else? Tell Hozie.", catalogue: null, group: null, popular: false, active: false },

  // ── Cleaning Services (11) ──
  'full-home-cleaning': { description: 'A complete clean of your entire home', catalogue: 'cleaning', group: null, popular: true, active: true },
  'living-bedroom-cleaning': { description: 'Living room and bedroom deep clean', catalogue: 'cleaning', group: null, popular: false, active: true },
  'deep-cleaning': { description: 'Thorough, top-to-bottom deep clean', catalogue: 'cleaning', group: null, popular: true, active: true },
  'bathroom-cleaning': { description: 'Deep clean for one or more bathrooms', catalogue: 'cleaning', group: null, popular: true, active: true },
  'kitchen-cleaning': { description: 'Deep clean for your kitchen', catalogue: 'cleaning', group: null, popular: true, active: true },
  'sofa-cleaning': { description: 'Shampoo and deep clean for sofas & upholstery', catalogue: 'cleaning', group: null, popular: false, active: true },
  'mattress-cleaning': { description: 'Deep clean and sanitize your mattress', catalogue: 'cleaning', group: null, popular: false, active: true },
  'window-cleaning': { description: 'Interior and exterior window cleaning', catalogue: 'cleaning', group: null, popular: false, active: true },
  'move-in-move-out-cleaning': { description: 'A full clean before you move in or out', catalogue: 'cleaning', group: null, popular: false, active: true },
  'water-tank-cleaning': { description: 'Clean and sanitize your water tank', catalogue: 'cleaning', group: null, popular: false, active: true },
  'other-cleaning': { description: "Something else? Tell Hozie.", catalogue: 'cleaning', group: null, popular: false, active: true },

  // ── Home Services — Personal Care at Home (6) ──
  'salon-spa-women': { description: 'Salon and spa services for women, at home', catalogue: 'home-services', group: 'personal-care-at-home', popular: false, active: true },
  'spa-for-women': { description: 'Spa treatments for women, at home', catalogue: 'home-services', group: 'personal-care-at-home', popular: false, active: true },
  'hair-studio-women': { description: 'Hair styling and treatments for women', catalogue: 'home-services', group: 'personal-care-at-home', popular: false, active: true },
  'makeup-saree-styling': { description: 'Makeup, saree and styling services', catalogue: 'home-services', group: 'personal-care-at-home', popular: false, active: true },
  'salon-for-men': { description: 'Salon services for men, at home', catalogue: 'home-services', group: 'personal-care-at-home', popular: false, active: true },
  'massage-for-men': { description: 'Massage services for men, at home', catalogue: 'home-services', group: 'personal-care-at-home', popular: false, active: true },

  // ── Home Services — AC & Appliance Repair (11) ──
  'ac-service-repair': { description: 'AC service, repair and gas refill', catalogue: 'home-services', group: 'ac-appliance-repair', popular: true, active: true },
  'washing-machine': { description: 'Washing machine repair and service', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  refrigerator: { description: 'Refrigerator repair and service', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  television: { description: 'Television repair and installation', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  chimney: { description: 'Kitchen chimney repair and cleaning', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  microwave: { description: 'Microwave repair and service', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  stove: { description: 'Gas stove and cooktop repair', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  laptop: { description: 'Laptop repair and service', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  'ro-water-purifier': { description: 'RO / water purifier service and repair', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  geyser: { description: 'Geyser installation and repair', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },
  'air-cooler': { description: 'Air cooler service and repair', catalogue: 'home-services', group: 'ac-appliance-repair', popular: false, active: true },

  // ── Home Services — Electrician, Plumber & Carpenter (new items) ──
  'civil-work': { description: 'Repairs, finishing and small construction work', catalogue: 'home-services', group: 'electrician-plumber-carpenter', popular: false, active: true },
  'fan-installation': { description: 'Ceiling and wall fan installation', catalogue: 'home-services', group: 'electrician-plumber-carpenter', popular: false, active: true },
  'furniture-assembly': { description: 'Furniture assembly and fitting', catalogue: 'home-services', group: 'electrician-plumber-carpenter', popular: false, active: true },
  'geyser-service-repair': { description: 'Geyser service and repair', catalogue: 'home-services', group: 'electrician-plumber-carpenter', popular: false, active: true },
  'lights-installation': { description: 'Light fixture installation', catalogue: 'home-services', group: 'electrician-plumber-carpenter', popular: false, active: true },

  // ── Home Services — general (new items) ──
  'tile-grouting': { description: 'Tile grouting and re-grouting', catalogue: 'home-services', group: 'home-services-general', popular: false, active: true },
  'wall-panels-installation': { description: 'Wall panel installation', catalogue: 'home-services', group: 'home-services-general', popular: false, active: true },
  'masonry-civil-work': { description: 'Masonry and general civil work', catalogue: 'home-services', group: 'home-services-general', popular: false, active: true },
  'home-maintenance': { description: 'General, everyday home maintenance', catalogue: 'home-services', group: 'home-services-general', popular: true, active: true },
  'other-home-services': { description: "Something else? Tell Hozie.", catalogue: 'home-services', group: 'home-services-general', popular: false, active: true },

  // ── Home Services — Pest Control (3) ──
  'cockroach-control': { description: 'Cockroach pest control treatment', catalogue: 'home-services', group: 'pest-control', popular: false, active: true },
  'termite-control': { description: 'Termite pest control treatment', catalogue: 'home-services', group: 'pest-control', popular: false, active: true },
  'ants-bedbugs-control': { description: 'Ants and bed bugs pest control', catalogue: 'home-services', group: 'pest-control', popular: false, active: true },
}

const SERVICE_CATEGORY_NAMES: Record<ServiceCategory, string> = {
  ...LEGACY_SERVICE_CATEGORY_LABELS,
  'full-home-cleaning': 'Full Home Cleaning',
  'living-bedroom-cleaning': 'Living & Bedroom Cleaning',
  'deep-cleaning': 'Deep Cleaning',
  'bathroom-cleaning': 'Bathroom Cleaning',
  'kitchen-cleaning': 'Kitchen Cleaning',
  'sofa-cleaning': 'Sofa Cleaning',
  'mattress-cleaning': 'Mattress Cleaning',
  'window-cleaning': 'Window Cleaning',
  'move-in-move-out-cleaning': 'Move-in / Move-out Cleaning',
  'water-tank-cleaning': 'Water Tank Cleaning',
  'other-cleaning': 'Other Cleaning',
  'salon-spa-women': 'Salon for Women',
  'spa-for-women': 'Spa for Women',
  'hair-studio-women': 'Hair Studio for Women',
  'makeup-saree-styling': 'Makeup, Saree & Styling',
  'salon-for-men': 'Salon for Men',
  'massage-for-men': 'Massage for Men',
  'ac-service-repair': 'AC Service & Repair',
  'washing-machine': 'Washing Machine',
  refrigerator: 'Refrigerator',
  television: 'Television',
  chimney: 'Chimney',
  microwave: 'Microwave',
  stove: 'Stove',
  laptop: 'Laptop',
  'ro-water-purifier': 'RO / Water Purifier',
  geyser: 'Geyser',
  'air-cooler': 'Air Cooler',
  'civil-work': 'Civil Work',
  'fan-installation': 'Fan Installation',
  'furniture-assembly': 'Furniture Assembly',
  'geyser-service-repair': 'Geyser Service & Repair',
  'lights-installation': 'Lights Installation',
  'tile-grouting': 'Tile Grouting',
  'wall-panels-installation': 'Wall Panels Installation',
  'masonry-civil-work': 'Masonry / Civil Work',
  'home-maintenance': 'Home Maintenance',
  'other-home-services': 'Other Home Services',
  'cockroach-control': 'Cockroach Control',
  'termite-control': 'Termite Control',
  'ants-bedbugs-control': 'Ants & Bed Bugs Control',
  // 'windows-doors' is relabeled here (the legacy label is "Windows & Doors")
  // to match this brief's exact Home Services display name.
  'windows-doors': 'Doors & Windows',
}

/** The one homeowner service-category catalogue — built once from every
 *  known ServiceCategory id, never a second hardcoded list. */
export const SERVICE_CATEGORIES: ServiceCategoryMeta[] = (Object.keys(SERVICE_META) as ServiceCategory[]).map(id => ({
  id,
  name: SERVICE_CATEGORY_NAMES[id],
  ...SERVICE_META[id],
}))

export function getServiceCategory(id: string): ServiceCategoryMeta | undefined {
  return SERVICE_CATEGORIES.find(c => c.id === id)
}

/** Real, active categories for one catalogue only — the enforcement point
 *  every browse/search screen must render through. Never returns a
 *  category belonging to the other catalogue. */
export function getCategoriesForEntry(entry: ServiceEntry): ServiceCategoryMeta[] {
  return SERVICE_CATEGORIES.filter(c => c.active && c.catalogue === entry)
}

export function getPopularServiceCategories(entry: ServiceEntry): ServiceCategoryMeta[] {
  return getCategoriesForEntry(entry).filter(c => c.popular)
}

export interface ServiceCategoryGroupEntry {
  group: HomeServiceGroup
  label: string
  categories: ServiceCategoryMeta[]
}

/** Groups the Home Services catalogue only — Cleaning Services has no
 *  sub-grouping (a flat 11-item list, per spec). */
export function getHomeServiceCategoriesByGroup(): ServiceCategoryGroupEntry[] {
  return HOME_SERVICE_GROUP_ORDER.map(group => ({
    group,
    label: HOME_SERVICE_GROUP_LABELS[group],
    categories: HOME_SERVICE_GROUP_MEMBERS[group]
      .map(id => getServiceCategory(id))
      .filter((c): c is ServiceCategoryMeta => Boolean(c) && c!.active),
  })).filter(g => g.categories.length > 0)
}

export function getCleaningCategories(): ServiceCategoryMeta[] {
  return CLEANING_CATEGORY_OPTIONS
    .map(id => getServiceCategory(id))
    .filter((c): c is ServiceCategoryMeta => Boolean(c) && c!.active)
}

/** The search service — screens must look up services only through this
 *  function, never a separate hardcoded search list. Scoped to one
 *  catalogue at a time, so a Cleaning search never surfaces a Home
 *  Services result and vice versa. Matches name or description
 *  (case-insensitive, substring). */
export function searchServiceCategories(query: string, entry: ServiceEntry): ServiceCategoryMeta[] {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return []
  return getCategoriesForEntry(entry).filter(c =>
    c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
  )
}

// ─── Screen 015 — Service Category Detail ──────────────────────────────────
// Adds the "what kind of work" configuration Screen 015 needs on top of the
// same catalogue above — never a second taxonomy, never a per-category
// screen or model (FlooringIntent/PlumbingIntent/...). One generic
// ServiceIntent record covers every category.

/** Screen 015's own longer hero sentence — distinct from the short catalogue
 *  descriptor above. Every new (post-split) category gets a real, honest
 *  one-line description — never left blank, never guessed at a legal/
 *  technical requirement. */
export const SERVICE_HERO_DESCRIPTIONS: Record<ServiceCategory, string> = {
  flooring: 'Improve your floors with the right materials and professionals.',
  'windows-doors': 'Install, replace or repair doors and windows with the right professional.',
  painting: "Refresh, repair or repaint your home's interior or exterior.",
  electrical: 'Get wiring, fittings and repairs handled safely by a qualified electrician.',
  plumbing: 'Fix leaks, install fittings or handle any plumbing work around your home.',
  waterproofing: 'Stop leaks and dampness with the right waterproofing for the job.',
  kitchen: 'Plan a new kitchen or renovate your existing one with the right professionals.',
  bathroom: 'Renovate, fix or refresh your bathroom with the right professionals.',
  roofing: 'Repair, replace or waterproof your roof with the right professional.',
  carpentry: 'Get doors, furniture and woodwork built, fixed or installed.',
  cleaning: 'Get your home, furniture and surfaces professionally cleaned.',
  'false-ceiling': 'Add or repair a false ceiling with the right professional.',
  'glass-aluminium': 'Install or repair glass and aluminium work around your home.',
  solar: 'Install, expand or maintain solar power for your home.',
  hvac: 'Install, repair or maintain your home cooling and ventilation.',
  other: "Tell us what you need and we'll help you find the right professional.",
  'full-home-cleaning': 'A complete, professional clean of your entire home.',
  'living-bedroom-cleaning': 'A deep clean for your living room and bedrooms.',
  'deep-cleaning': 'A thorough, top-to-bottom deep clean for your home.',
  'bathroom-cleaning': 'A deep clean for one or more of your bathrooms.',
  'kitchen-cleaning': 'A deep clean for your kitchen, top to bottom.',
  'sofa-cleaning': 'A shampoo and deep clean for your sofas and upholstery.',
  'mattress-cleaning': 'A deep clean and sanitization for your mattress.',
  'window-cleaning': 'Interior and exterior window cleaning for your home.',
  'move-in-move-out-cleaning': 'A full clean before you move into or out of a home.',
  'water-tank-cleaning': 'A clean and sanitized water tank for your home.',
  'other-cleaning': "Tell us what you'd like cleaned and we'll help you find the right professional.",
  'salon-spa-women': 'Salon and spa services for women, in the comfort of your home.',
  'spa-for-women': 'Spa treatments for women, in the comfort of your home.',
  'hair-studio-women': 'Hair styling and treatments for women, at home.',
  'makeup-saree-styling': 'Makeup, saree draping and styling services, at home.',
  'salon-for-men': 'Salon services for men, in the comfort of your home.',
  'massage-for-men': 'Massage services for men, in the comfort of your home.',
  'ac-service-repair': 'AC service, repair and gas refill by a qualified technician.',
  'washing-machine': 'Washing machine repair and service at home.',
  refrigerator: 'Refrigerator repair and service at home.',
  television: 'Television repair and installation at home.',
  chimney: 'Kitchen chimney repair and cleaning at home.',
  microwave: 'Microwave repair and service at home.',
  stove: 'Gas stove and cooktop repair at home.',
  laptop: 'Laptop repair and service at home.',
  'ro-water-purifier': 'RO / water purifier service and repair at home.',
  geyser: 'Geyser installation and repair at home.',
  'air-cooler': 'Air cooler service and repair at home.',
  'civil-work': 'Repairs, finishing and small construction work by verified professionals.',
  'fan-installation': 'Ceiling or wall fan installation at home.',
  'furniture-assembly': 'Furniture assembly and fitting at home.',
  'geyser-service-repair': 'Geyser service and repair by a qualified professional.',
  'lights-installation': 'Light fixture installation at home.',
  'tile-grouting': 'Tile grouting and re-grouting for your home.',
  'wall-panels-installation': 'Wall panel installation for your home.',
  'masonry-civil-work': 'Masonry and general civil work for your home.',
  'home-maintenance': 'General, everyday maintenance for your home.',
  'other-home-services': "Tell us what you need and we'll help you find the right professional.",
  'cockroach-control': 'Professional cockroach pest control treatment.',
  'termite-control': 'Professional termite pest control treatment.',
  'ants-bedbugs-control': 'Professional ants and bed bugs pest control treatment.',
}

export interface ServiceIntentOption {
  id: string
  label: string
  description?: string
}

export type ServiceIntentSelectionMode = 'single' | 'multiple'

/** Painting is the one legacy category where more than one option can
 *  genuinely apply at once. Every new (post-split) category has NO
 *  structured "kind of work" options at all (see SERVICE_INTENT_OPTIONS
 *  below) — they're atomic, bookable services described directly, the
 *  same honest pattern the pre-existing 'other' category already used
 *  rather than inventing arbitrary sub-choices with no real product
 *  basis. Selection mode is irrelevant where there are no options. */
export const SERVICE_INTENT_SELECTION_MODE: Record<ServiceCategory, ServiceIntentSelectionMode> = {
  flooring: 'single', 'windows-doors': 'single', painting: 'multiple', electrical: 'single', plumbing: 'single',
  waterproofing: 'single', kitchen: 'single', bathroom: 'single', roofing: 'single', carpentry: 'single',
  cleaning: 'single', 'false-ceiling': 'single', 'glass-aluminium': 'single', solar: 'single', hvac: 'single', other: 'single',
  'full-home-cleaning': 'single', 'living-bedroom-cleaning': 'single', 'deep-cleaning': 'single', 'bathroom-cleaning': 'single',
  'kitchen-cleaning': 'single', 'sofa-cleaning': 'single', 'mattress-cleaning': 'single', 'window-cleaning': 'single',
  'move-in-move-out-cleaning': 'single', 'water-tank-cleaning': 'single', 'other-cleaning': 'single',
  'salon-spa-women': 'single', 'spa-for-women': 'single', 'hair-studio-women': 'single', 'makeup-saree-styling': 'single',
  'salon-for-men': 'single', 'massage-for-men': 'single', 'ac-service-repair': 'single', 'washing-machine': 'single',
  refrigerator: 'single', television: 'single', chimney: 'single', microwave: 'single', stove: 'single', laptop: 'single',
  'ro-water-purifier': 'single', geyser: 'single', 'air-cooler': 'single', 'fan-installation': 'single',
  'furniture-assembly': 'single', 'geyser-service-repair': 'single', 'lights-installation': 'single', 'tile-grouting': 'single',
  'wall-panels-installation': 'single', 'masonry-civil-work': 'single', 'civil-work': 'single', 'home-maintenance': 'single', 'other-home-services': 'single',
  'cockroach-control': 'single', 'termite-control': 'single', 'ants-bedbugs-control': 'single',
}

const NEW_CATEGORY_IDS: ServiceCategory[] = [...CLEANING_CATEGORY_OPTIONS, ...Object.keys(HOME_SERVICE_GROUP_MEMBERS).flatMap(g => HOME_SERVICE_GROUP_MEMBERS[g as HomeServiceGroup]).filter(id => !(LEGACY_SERVICE_CATEGORY_OPTIONS as string[]).includes(id))]

/** "What kind of work do you need?" — per-category options, legacy
 *  categories only. New categories intentionally have no entries here
 *  (empty array) — see `usesFreeTextIntent()` below, the single place
 *  that decides "structured chips" vs "free-text description" so no
 *  screen has to special-case category ids directly. */
export const SERVICE_INTENT_OPTIONS: Record<ServiceCategory, ServiceIntentOption[]> = {
  flooring: [
    { id: 'install-new', label: 'Install new flooring', description: "A space that doesn't have flooring yet." },
    { id: 'replace-existing', label: 'Replace existing flooring', description: 'Remove old flooring and install new flooring.' },
    { id: 'repair', label: 'Repair flooring', description: 'Fix cracks, damage or loose tiles.' },
    { id: 'not-sure', label: 'Not sure', description: 'I need help deciding.' },
  ],
  'windows-doors': [
    { id: 'install-new', label: 'Install new', description: 'Add windows or doors where there are none.' },
    { id: 'replace-existing', label: 'Replace existing', description: 'Swap out old windows or doors.' },
    { id: 'repair', label: 'Repair', description: 'Fix damage, leaks or hardware issues.' },
    { id: 'upgrade', label: 'Upgrade', description: 'Move to better materials or glazing.' },
    { id: 'not-sure', label: 'Not sure', description: 'I need help deciding.' },
  ],
  painting: [
    { id: 'paint-new-space', label: 'Paint new space', description: "A space that hasn't been painted before." },
    { id: 'repaint-existing', label: 'Repaint existing space', description: "Refresh a space that's already painted." },
    { id: 'interior', label: 'Interior painting' },
    { id: 'exterior', label: 'Exterior painting' },
    { id: 'repair-paint', label: 'Repair + paint', description: 'Fix wall damage before painting.' },
    { id: 'not-sure', label: 'Not sure', description: 'I need help deciding.' },
  ],
  plumbing: [
    { id: 'new-installation', label: 'New installation' },
    { id: 'repair', label: 'Repair' },
    { id: 'replacement', label: 'Replacement' },
    { id: 'leak', label: 'Leak / water issue' },
    { id: 'bathroom', label: 'Bathroom plumbing' },
    { id: 'kitchen', label: 'Kitchen plumbing' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  electrical: [
    { id: 'new-installation', label: 'New installation' },
    { id: 'repair', label: 'Repair' },
    { id: 'wiring', label: 'Wiring' },
    { id: 'lighting', label: 'Lighting' },
    { id: 'upgrade', label: 'Electrical upgrade' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  waterproofing: [
    { id: 'terrace-roof', label: 'Terrace / roof' },
    { id: 'bathroom', label: 'Bathroom' },
    { id: 'walls', label: 'Walls' },
    { id: 'basement', label: 'Basement' },
    { id: 'leak-repair', label: 'Leak repair' },
    { id: 'new-waterproofing', label: 'New waterproofing' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  kitchen: [
    { id: 'new-kitchen', label: 'New kitchen' },
    { id: 'renovation', label: 'Kitchen renovation' },
    { id: 'cabinet-work', label: 'Cabinet work' },
    { id: 'countertop', label: 'Countertop' },
    { id: 'storage', label: 'Storage' },
    { id: 'other', label: 'Other' },
  ],
  bathroom: [
    { id: 'new-bathroom', label: 'New bathroom' },
    { id: 'renovation', label: 'Bathroom renovation' },
    { id: 'fixtures', label: 'Fixtures' },
    { id: 'tiles', label: 'Tiles' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'waterproofing', label: 'Waterproofing' },
    { id: 'other', label: 'Other' },
  ],
  roofing: [
    { id: 'new-roof', label: 'New roof' },
    { id: 'repair', label: 'Roof repair' },
    { id: 'replacement', label: 'Roof replacement' },
    { id: 'waterproofing', label: 'Waterproofing' },
    { id: 'other', label: 'Other' },
  ],
  carpentry: [
    { id: 'doors', label: 'Doors' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'storage', label: 'Storage' },
    { id: 'wardrobes', label: 'Wardrobes' },
    { id: 'repair', label: 'Repair' },
    { id: 'custom', label: 'Custom work' },
    { id: 'other', label: 'Other' },
  ],
  cleaning: [
    { id: 'full-home', label: 'Full Home Cleaning', description: 'A complete clean of your entire home.' },
    { id: 'bathroom', label: 'Bathroom Cleaning', description: 'Deep clean for one or more bathrooms.' },
    { id: 'kitchen', label: 'Kitchen Cleaning', description: 'Deep clean for your kitchen.' },
    { id: 'sofa', label: 'Sofa Cleaning', description: 'Shampoo and deep clean for sofas and upholstery.' },
    { id: 'mattress', label: 'Mattress Cleaning', description: 'Deep clean and sanitize your mattress.' },
    { id: 'carpet', label: 'Carpet Cleaning', description: 'Shampoo and deep clean for carpets and rugs.' },
    { id: 'not-sure', label: 'Not sure', description: 'I need help deciding.' },
  ],
  'false-ceiling': [
    { id: 'new', label: 'New false ceiling' },
    { id: 'repair', label: 'Repair' },
    { id: 'lighting', label: 'Lighting integration' },
    { id: 'design-upgrade', label: 'Design upgrade' },
    { id: 'other', label: 'Other' },
  ],
  'glass-aluminium': [
    { id: 'install-new', label: 'Install new' },
    { id: 'replace-existing', label: 'Replace existing' },
    { id: 'repair', label: 'Repair' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  solar: [
    { id: 'new-installation', label: 'New installation' },
    { id: 'expansion', label: 'Expansion' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'replacement', label: 'Replacement' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  hvac: [
    { id: 'new-installation', label: 'New installation' },
    { id: 'replacement', label: 'Replacement' },
    { id: 'repair', label: 'Repair' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'not-sure', label: 'Not sure' },
  ],
  other: [],
  // Every category introduced by the Home Services / Cleaning Services
  // split is a single, atomic, bookable service — deliberately no invented
  // sub-menu (see the file-level comment above SERVICE_INTENT_OPTIONS).
  'full-home-cleaning': [], 'living-bedroom-cleaning': [], 'deep-cleaning': [], 'bathroom-cleaning': [], 'kitchen-cleaning': [],
  'sofa-cleaning': [], 'mattress-cleaning': [], 'window-cleaning': [], 'move-in-move-out-cleaning': [], 'water-tank-cleaning': [], 'other-cleaning': [],
  'salon-spa-women': [], 'spa-for-women': [], 'hair-studio-women': [], 'makeup-saree-styling': [], 'salon-for-men': [], 'massage-for-men': [],
  'ac-service-repair': [], 'washing-machine': [], refrigerator: [], television: [], chimney: [], microwave: [], stove: [], laptop: [],
  'ro-water-purifier': [], geyser: [], 'air-cooler': [], 'fan-installation': [], 'furniture-assembly': [], 'geyser-service-repair': [], 'lights-installation': [],
  'tile-grouting': [], 'wall-panels-installation': [], 'masonry-civil-work': [], 'civil-work': [], 'home-maintenance': [], 'other-home-services': [],
  'cockroach-control': [], 'termite-control': [], 'ants-bedbugs-control': [],
}

/** True whenever a category has no structured "kind of work" chips —
 *  the ONE place that decides "show chips" vs "show a free-text box",
 *  so screens never hardcode `=== 'other'` again. Covers legacy 'other'
 *  and every new post-split category uniformly. */
export function usesFreeTextIntent(category: ServiceCategory): boolean {
  return SERVICE_INTENT_OPTIONS[category].length === 0
}
void NEW_CATEGORY_IDS // referenced for documentation/verification only

// ─── "What you'll get" — informational only, never a guaranteed promise ────

export const SERVICE_BENEFITS = [
  'Professional recommendations',
  'Estimated service pricing',
  'Quote comparison',
]

// ─── ServiceIntent — one generic model, reused for every category ─────────
// Never FlooringIntent/PlumbingIntent/PaintingIntent — a single record shape
// covers "what kind of work" for every category, old and new.

export interface ServiceIntent {
  serviceCategoryId: ServiceCategory
  serviceIntentIds: string[]
  otherDescription: string
  locationId?: string
  createdAt: string
}

export function isServiceIntentValid(categoryId: ServiceCategory, serviceIntentIds: string[], otherDescription: string): boolean {
  if (usesFreeTextIntent(categoryId)) return otherDescription.trim().length > 0
  return serviceIntentIds.length > 0
}

/** Assembles the saved service intent — the seam a real "save service
 *  intent" API call replaces. */
export function createServiceIntent(categoryId: ServiceCategory, serviceIntentIds: string[], otherDescription: string, locationId?: string): ServiceIntent {
  const freeText = usesFreeTextIntent(categoryId)
  return {
    serviceCategoryId: categoryId,
    serviceIntentIds: freeText ? [] : serviceIntentIds,
    otherDescription: freeText ? otherDescription.trim() : '',
    locationId,
    createdAt: new Date().toISOString(),
  }
}

/** Builds the dynamic "Your Service" summary lines — every line reflects a
 *  real selection, never an invented default. */
export function getServiceIntentSummaryLines(categoryId: ServiceCategory, serviceIntentIds: string[], otherDescription: string, location?: string): string[] {
  const lines: string[] = []
  if (usesFreeTextIntent(categoryId)) {
    if (otherDescription.trim()) lines.push(otherDescription.trim())
    else lines.push(SERVICE_CATEGORY_NAMES[categoryId])
  } else {
    const options = SERVICE_INTENT_OPTIONS[categoryId]
    for (const id of serviceIntentIds) {
      const opt = options.find(o => o.id === id)
      if (opt) lines.push(opt.label)
    }
  }
  if (location) lines.push(location)
  return lines
}
