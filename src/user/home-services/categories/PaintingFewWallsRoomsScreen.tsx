// ─── Painting & Waterproofing → Few walls & rooms — "Walls & rooms
// painting" ────────────────────────────────────────────────────────
//
// Built from a real-page reference PDF the user supplied (UB-WRP20) —
// used for its "Select a service" catalogue (7 sections: Few walls
// painting, One room painting, Two or more rooms painting, Doors/
// Grills & Cabinets, Waterproofing & grouting, Upgrade to full home,
// Add-on) and every service's own rating/reviews/price/duration/note,
// taken as given. No per-tier options exist in this reference — every
// line item already carries its own real price and duration, so this
// page uses the same plain Add-button pattern FullHomeCleaningScreen's
// own duration-bearing rows use, not an options picker.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome or real third-
// party brand claims, not catalogue data): its own page-level real
// promotional video ("For the first time ever… Pay only after
// satisfaction"), its own real "Zydex" waterproofing-brand banner (a
// real partner Houzeify doesn't have — reusing it would claim a
// partnership this app doesn't have, same "no false brand/product
// claims" rule this app's other pages already follow), footer, and
// whatever was in its own cart at capture time — this page's own
// HeroBanner/CategoryBanners use original Houzeify copy instead, same
// as every sibling screen.
//
// Honesty note: no real painting/waterproofing photography exists in
// this project, so every image slot uses this app's own icon-on-
// gradient placeholder pattern, same as every sibling screen.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Icons ──────────────────────────────────────────────────────────────

const IcoBack = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.5 15L7.5 10L12.5 5" />
  </svg>
)
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8a5 5 0 0110 0c0 4 1.5 5 1.5 5h-13S5 12 5 8Z" />
    <path d="M8.5 16a1.7 1.7 0 003 0" />
  </svg>
)
const IcoCart = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2.5h1.6L6.3 13h9L17.3 5.8H4.7" />
    <circle cx="7.2" cy="16.5" r="1.2" />
    <circle cx="14" cy="16.5" r="1.2" />
  </svg>
)
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#722ED1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5" /></svg>
)
const IcoShield = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="#722ED1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3.5l8 3v5.5c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5V6.5l8-3Z" />
    <path d="M9.5 13l2.5 2.5 5-5" />
  </svg>
)
const IcoStar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor"><path d="M6 0.8l1.5 3.3 3.6.4-2.7 2.5.7 3.6L6 8.8 2.9 10.6l.7-3.6L.9 4.5l3.6-.4L6 .8Z" /></svg>
)
const IcoCloseX = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
)
// Section-nav & item icons
const IcoWallPaint = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="14" height="15" rx="1" />
    <path d="M3 11.5h9" />
  </svg>
)
const IcoRoom = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 8L10 3l7.5 5" />
    <path d="M4 8v8a1 1 0 001 1h10a1 1 0 001-1V8" />
    <path d="M8 17v-5h4v5" />
  </svg>
)
const IcoRooms = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4" width="7" height="12" rx="0.8" />
    <rect x="10.5" y="4" width="7" height="12" rx="0.8" />
    <path d="M2.5 9.5h7M10.5 9.5h7" />
  </svg>
)
const IcoDoor = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="10" height="16" rx="1" />
    <circle cx="12" cy="10" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)
const IcoWaterproofing = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5s5 6.2 5 9.8a5 5 0 01-10 0C5 8.7 10 2.5 10 2.5z" />
  </svg>
)
const IcoHomeUpgrade = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5L10 3l7.5 6.5" />
    <path d="M4.5 8v8a1 1 0 001 1h9a1 1 0 001-1V8" />
    <path d="M8 17v-5h4v5" />
    <path d="M13 6.5V4h2.5v4.7" />
  </svg>
)
const IcoConsultation = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="7" r="3.5" />
    <path d="M3.5 17.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
  </svg>
)

function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} mins`
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`
  return `${h} hr${h > 1 ? 's' : ''} ${m} mins`
}

// ─── Data model — every field preserved exactly as given in the
// reference where present; anything the reference didn't show for a
// given service stays undefined and is never rendered. ────────────────

type PaintingSection =
  | 'few-walls'
  | 'one-room'
  | 'two-plus-rooms'
  | 'doors-grills-cabinets'
  | 'waterproofing-grouting'
  | 'upgrade-full-home'
  | 'add-on'

interface PaintingItem {
  id: string
  title: string
  section: PaintingSection
  rating?: string
  price: number
  priceLabel?: 'starts-at'
  durationMin: number
  note?: string
  icon: React.ReactNode
  /** Only "1 wall painting" has real "Get an estimate" configurator
   *  data (a reference screenshot of its own estimate builder) — every
   *  other item still uses the plain Add/View-details pattern until
   *  its own configurator data is supplied. */
  hasEstimateBuilder?: boolean
}

// ─── "1 wall painting" and "2 or more walls painting" estimate
// configurators — real data from two reference screenshots, each the
// item's own "Get an estimate" popup. Both share the same shape (a
// number-of-walls choice where it exists, a paint type, a damage/
// seepage option, and add-ons with a qty each), so one config-driven
// modal serves both rather than two near-duplicate components.
//
// "1 wall painting" has no wall-count picker — its own paint-type
// prices are the absolute total (₹2,999/₹3,499/₹5,499). "2 or more
// walls painting" has a real wall-count picker carrying the absolute
// price (2/3/4/5 walls), with paint type and damage priced as add-ons
// on top of it — kept exactly as each reference shows rather than
// forcing one pricing shape onto both.
//
// Both references' horizontal carousels ran one tile past the edge of
// the captured screen for "Select paint type" (a 4th "Super …" tile)
// — name and price cut off mid-word/mid-number — so it's left out of
// both configs rather than guessing the rest. "2 or more walls"' own
// "Select add-ons" carousel also cut off a 4th "Full wa…" tile the
// same way; its first 3 add-ons carry the exact same real prices as
// "1 wall painting"'s own add-ons, so both configs share one add-on
// list instead of duplicating it. "1 wall painting"'s own reference
// showed "Balcony grill paint" pre-set to qty 1, and "2 or more
// walls"' own reference showed no default color/selection on its
// damage tiles — both read as whatever the capture happened to show
// mid-session rather than each modal's true starting state, so every
// option here defaults to its first/cheapest choice (or zero, for
// add-ons), same as every other picker in this app. "2 or more
// walls"' own 5-wall tile price was cut off after "₹6,99" — the exact
// digit is unambiguous given the reference's own +₹1,000-per-wall
// pattern (3,999 → 4,999 → 5,999 → 6,999), so ₹6,999 is used rather
// than omitting a tile the pattern already fixes. ────────────────────

interface WallPaintingOption {
  id: string
  label: string
  price: number
  /** Real short descriptive tag shown on some paint-type tiles (e.g.
   *  "Slightly smooth", "Velvet smooth") — only "Wall waterproofing"'s
   *  own reference showed these, so it stays optional. */
  note?: string
}

interface WallEstimateConfig {
  title: string
  startsAtNote: string
  /** Absolute base price used when there's no wall-count picker (every
   *  "One room painting" item's own real starting price, or 0 for "1
   *  wall painting" where paint type itself already carries the full
   *  absolute price). Ignored when wallCountOptions is present — the
   *  selected wall-count's own price is the base there instead. */
  basePrice: number
  /** Single-select, absolute-price tier (e.g. "2 walls"/"3 walls", or
   *  "Terrace water proofing"'s own real area tiers) — its own real
   *  section label defaults to "Select number of walls" but can be
   *  overridden (wallCountLabel) for a differently-worded real picker
   *  that behaves the same way. */
  wallCountOptions?: WallPaintingOption[]
  wallCountLabel?: string
  /** Not every item's reference showed a paint-type carousel. */
  paintTypeOptions?: WallPaintingOption[]
  /** Only some items' references showed a damage/seepage-shaped
   *  section ("Wall waterproofing"'s own reference didn't have one at
   *  all; "Terrace water proofing"'s own is really a real "boundary
   *  wall inclusion" choice, same single-select shape under a
   *  different real label) — omitted rather than fabricated when
   *  there's no evidence for it; damageLabel overrides the header
   *  text for the boundary-wall case. */
  damageOptions?: WallPaintingOption[]
  damageLabel?: string
  /** Multi-select, qty-based "areas" that themselves make up the base
   *  price — "Tile grouting"'s own real "Select area" section (its
   *  base price comes entirely from these, not from basePrice/
   *  wallCountOptions), sized to defaultZoneQty. Distinct from
   *  addonOptions below, which is a separate, second multi-select
   *  section in the same reference. */
  zoneOptions?: WallPaintingOption[]
  zoneLabel?: string
  defaultZoneQty?: Record<string, number>
  /** Omitted entirely when a reference showed no add-ons section at
   *  all (e.g. "Terrace water proofing"'s own capture never reached
   *  one) — never defaulted to a shared list without real evidence. */
  addonOptions?: WallPaintingOption[]
}

// Shared default add-ons — the real prices "1 wall painting" and "2 or
// more walls painting"'s own references both show, reused across every
// other room-painting config below (none of their own references
// showed a different add-on set, so the same real one applies).
const WALL_PAINTING_ADDONS: WallPaintingOption[] = [
  { id: 'balcony-grill', label: 'Balcony grill paint', price: 1999 },
  { id: 'single-door-cabinet', label: 'Single door cabinet paint', price: 1999 },
  { id: 'door-paint', label: 'Door paint', price: 2199 },
]

// "Wall waterproofing"'s own real add-ons — different service,
// different real add-on catalogue.
const WALL_WATERPROOFING_ADDONS: WallPaintingOption[] = [
  { id: 'bathroom-floor-grouting', label: 'Bathroom floor grouting', price: 2499 },
  { id: 'bathroom-wall-grouting', label: 'Bathroom wall grouting', price: 2999 },
  { id: 'kitchen-wall-grouting', label: 'Kitchen wall grouting', price: 2999 },
]

// Real paint-type and damage options shared by "2 or more walls
// painting" — reused verbatim (same options, additive pricing) across
// every "One room painting" item per the user's own instruction, since
// none of those items have their own distinct picker data yet.
const WALL_2PLUS_PAINT_TYPES: WallPaintingOption[] = [
  { id: 'economy', label: 'Economy (non-washable)', price: 0 },
  { id: 'premium', label: 'Premium (semi-washable)', price: 1000 },
  { id: 'luxury', label: 'Luxury (washable)', price: 2000 },
]
const WALL_2PLUS_DAMAGE_OPTIONS: WallPaintingOption[] = [
  { id: 'no-damage', label: 'No damage', price: 0 },
  { id: 'heavy-breakage', label: 'Heavy wall breakage', price: 2499 },
  { id: 'seepage', label: 'Wall with seepage', price: 2999 },
]

/** Builds a "One room painting" item's own estimate config — same
 *  real "2 or more walls" paint-type/damage options and shared
 *  add-ons applied on top of that room's own real starting price. */
function roomEstimateConfig(roomTitle: string, basePrice: number, durationLabel: string): WallEstimateConfig {
  return {
    title: `${roomTitle} estimate`,
    startsAtNote: `Starts at ₹${basePrice.toLocaleString('en-IN')} · ${durationLabel}`,
    basePrice,
    paintTypeOptions: WALL_2PLUS_PAINT_TYPES,
    damageOptions: WALL_2PLUS_DAMAGE_OPTIONS,
    addonOptions: WALL_PAINTING_ADDONS,
  }
}

// Real "Price includes" checklist — same in both references.
const WALL_PAINTING_PRICE_INCLUDES = [
  'All materials & labour cost',
  'Painting of wall of any size',
  'Packing & masking of furniture',
  'Post-service cleaning',
  '1 coat of primer & 2 coats of paint',
  'Original paints from Asian Paints, Berger or Dulux',
]

// Real threshold discount from both references ("Get 10% off on all
// quotations above ₹10,000") — a genuine, computable rule, not a
// fabricated one.
const WALL_PAINTING_DISCOUNT_THRESHOLD = 10000
const WALL_PAINTING_DISCOUNT_RATE = 0.1

const WALL_ESTIMATE_CONFIGS: Record<string, WallEstimateConfig> = {
  'wr-1-wall': {
    title: '1 wall painting estimate',
    startsAtNote: 'Starts at ₹2,999 · 12 hrs',
    basePrice: 0,
    paintTypeOptions: [
      { id: 'economy', label: 'Economy (non-washable)', price: 2999 },
      { id: 'premium', label: 'Premium (semi-washable)', price: 3499 },
      { id: 'luxury', label: 'Luxury (washable)', price: 5499 },
    ],
    damageOptions: [
      { id: 'no-damage', label: 'No damage', price: 0 },
      { id: 'seepage', label: 'Wall with seepage', price: 2999 },
    ],
    addonOptions: WALL_PAINTING_ADDONS,
  },
  'wr-2-plus-walls': {
    title: '2 or more walls painting estimate',
    startsAtNote: 'Starts at ₹3,999 · 18 hrs',
    basePrice: 0,
    wallCountOptions: [
      { id: '2-walls', label: '2 walls', price: 3999 },
      { id: '3-walls', label: '3 walls', price: 4999 },
      { id: '4-walls', label: '4 walls', price: 5999 },
      { id: '5-walls', label: '5 walls', price: 6999 },
    ],
    paintTypeOptions: WALL_2PLUS_PAINT_TYPES,
    damageOptions: WALL_2PLUS_DAMAGE_OPTIONS,
    addonOptions: WALL_PAINTING_ADDONS,
  },

  // ── One room painting — real "2 or more walls" paint-type/damage
  // options + shared add-ons, applied on top of each room's own real
  // starting price, per the user's own instruction. ──────────────────
  'wr-bedroom': roomEstimateConfig('Bedroom Painting', 5499, '18 hrs'),
  'wr-living-room': roomEstimateConfig('Living room painting', 6499, '18 hrs'),
  'wr-living-dining': roomEstimateConfig('Living & dining room painting', 9499, '18 hrs'),
  'wr-lobby-passage': roomEstimateConfig('Lobby / passage painting', 3499, '18 hrs'),
  'wr-kitchen': roomEstimateConfig('Kitchen painting', 3499, '18 hrs'),
  'wr-bathroom': roomEstimateConfig('Bathroom painting', 2499, '9 hrs'),
  'wr-store-room': roomEstimateConfig('Store room painting', 2499, '9 hrs'),
  'wr-washing-area': roomEstimateConfig('Washing area painting', 2499, '9 hrs'),
  'wr-balcony': roomEstimateConfig('Balcony painting', 3499, '9 hrs'),
  'wr-terrace-exterior': roomEstimateConfig('Terrace/Exterior Painting', 1999, '9 hrs'),

  // ── Two or more rooms painting — same real "2 or more walls"
  // paint-type/damage options + shared add-ons, applied on top of
  // each real "Any N rooms" starting price, per the user's own
  // instruction. ───────────────────────────────────────────────────
  'wr-any-2-rooms': roomEstimateConfig('Any 2 rooms', 9999, '27 hrs'),
  'wr-any-3-rooms': roomEstimateConfig('Any 3 rooms', 14499, '27 hrs'),

  // ── Upgrade to full home — same real "2 or more walls" paint-type/
  // damage options + shared add-ons, applied on top of each real BHK
  // package's own starting price, per the user's own instruction. ───
  'wr-unfurnished-1bhk': roomEstimateConfig('Unfurnished 1 BHK painting', 10999, '9 hrs'),
  'wr-unfurnished-2bhk': roomEstimateConfig('Unfurnished 2 BHK painting', 14499, '27 hrs'),
  'wr-unfurnished-3bhk': roomEstimateConfig('Unfurnished 3 BHK painting', 18999, '36 hrs'),
  'wr-furnished-1bhk': roomEstimateConfig('Furnished 1 BHK painting', 8999, '27 hrs'),
  'wr-furnished-2bhk': roomEstimateConfig('Furnished 2 BHK painting', 12499, '36 hrs'),
  'wr-furnished-3bhk': roomEstimateConfig('Furnished 3 BHK painting', 16999, '45 hrs'),

  // ── Wall waterproofing — its own real 4-tier paint-type carousel
  // (fully visible this time, including the "Super luxury (washable)"
  // tile a screenshot revealed) and its own real add-ons. Its own
  // reference showed no damage/seepage section, so none is added
  // here. ─────────────────────────────────────────────────────────────
  'wr-wall-waterproofing': {
    title: 'Wall waterproofing estimate',
    startsAtNote: 'Starts at ₹4,998 · 9 hrs',
    basePrice: 0,
    paintTypeOptions: [
      { id: 'economy', label: 'Economy (non-washable)', price: 4998, note: 'Slightly smooth' },
      { id: 'premium', label: 'Premium (semi-washable)', price: 5499, note: 'Smooth' },
      { id: 'luxury', label: 'Luxury (washable)', price: 6999, note: 'Velvet smooth' },
      { id: 'super-luxury', label: 'Super luxury (washable)', price: 11999 },
    ],
    addonOptions: WALL_WATERPROOFING_ADDONS,
  },

  // ── Terrace water proofing — its own real area-based tiers (relabels
  // the shared "wall count" single-select as "Select area") and its
  // own real "boundary wall inclusion" choice (same single-select
  // shape as "damage/seepage", relabeled). Its own reference's capture
  // ended before reaching an add-ons section, so none is added here
  // rather than assumed. ─────────────────────────────────────────────
  'wr-terrace-waterproofing': {
    title: 'Terrace water proofing estimate',
    startsAtNote: 'Starts at ₹5,499 · 9 hrs 10 mins',
    basePrice: 0,
    wallCountLabel: 'Select area',
    wallCountOptions: [
      { id: 'upto-100', label: 'Upto 100 sq.ft.', price: 5499 },
      { id: '100-400', label: '100 - 400 sq.ft.', price: 13999 },
      { id: '400-700', label: '400 - 700 sq.ft.', price: 24999 },
      { id: '700-1000', label: '700 - 1000 sq.ft.', price: 36999 },
      { id: 'upto-1500', label: 'Upto 1500 sq.ft.', price: 53999 },
    ],
    damageLabel: 'Select boundary wall inclusion',
    damageOptions: [
      { id: 'without-boundary', label: 'Without boundary', price: 0 },
      { id: 'with-boundary', label: 'With boundary', price: 2500 },
    ],
  },

  // ── Tile grouting — its own real "Select area" section is actually
  // a second multi-select, qty-based group (not a single-select tier
  // like every other item's own "wall count"/"area" picker) — the same
  // 3 real zones "Wall waterproofing" already uses (Bathroom floor/
  // wall grouting, Kitchen wall grouting), with "Bathroom floor
  // grouting" defaulted to qty 1 to match this item's own real
  // "Starts at ₹2,499" base. Its own "Select add-ons" section reuses
  // the same shared real add-ons every painting item does. ──────────
  'wr-tile-grouting': {
    title: 'Tile grouting estimate',
    startsAtNote: 'Starts at ₹2,499 · 6 hrs',
    basePrice: 0,
    zoneOptions: WALL_WATERPROOFING_ADDONS,
    defaultZoneQty: { 'bathroom-floor-grouting': 1 },
    addonOptions: WALL_PAINTING_ADDONS,
  },
}

const PAINTING_ITEMS: PaintingItem[] = [
  // ── Few walls painting ──
  { id: 'wr-1-wall', title: '1 wall painting', section: 'few-walls', rating: '4.82 (8K reviews)', price: 2999, priceLabel: 'starts-at', durationMin: 540, icon: <IcoWallPaint />, hasEstimateBuilder: true },
  { id: 'wr-2-plus-walls', title: '2 or more walls painting', section: 'few-walls', rating: '4.81 (9K reviews)', price: 3999, priceLabel: 'starts-at', durationMin: 1080, icon: <IcoWallPaint />, hasEstimateBuilder: true },

  // ── One room painting — each gets the same real "2 or more walls"
  // estimate configurator per the user's own instruction. ────────────
  { id: 'wr-bedroom', title: 'Bedroom Painting', section: 'one-room', rating: '4.81 (9K reviews)', price: 5499, priceLabel: 'starts-at', durationMin: 1080, icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-living-room', title: 'Living room painting', section: 'one-room', rating: '4.81 (8K reviews)', price: 6499, priceLabel: 'starts-at', durationMin: 1080, icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-living-dining', title: 'Living & dining room painting', section: 'one-room', rating: '4.81 (8K reviews)', price: 9499, priceLabel: 'starts-at', durationMin: 1080, icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-lobby-passage', title: 'Lobby / passage painting', section: 'one-room', rating: '4.81 (8K reviews)', price: 3499, priceLabel: 'starts-at', durationMin: 1080, note: 'Suitable for pathways & adjacent areas between rooms', icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-kitchen', title: 'Kitchen painting', section: 'one-room', rating: '4.82 (8K reviews)', price: 3499, priceLabel: 'starts-at', durationMin: 1080, icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-bathroom', title: 'Bathroom painting', section: 'one-room', rating: '4.84 (8K reviews)', price: 2499, priceLabel: 'starts-at', durationMin: 540, icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-store-room', title: 'Store room painting', section: 'one-room', rating: '4.82 (7K reviews)', price: 2499, priceLabel: 'starts-at', durationMin: 540, icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-washing-area', title: 'Washing area painting', section: 'one-room', rating: '4.82 (7K reviews)', price: 2499, priceLabel: 'starts-at', durationMin: 540, icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-balcony', title: 'Balcony painting', section: 'one-room', rating: '4.81 (9K reviews)', price: 3499, priceLabel: 'starts-at', durationMin: 540, icon: <IcoRoom />, hasEstimateBuilder: true },
  { id: 'wr-terrace-exterior', title: 'Terrace/Exterior Painting', section: 'one-room', rating: '5.00 (12 reviews)', price: 1999, priceLabel: 'starts-at', durationMin: 540, note: 'Ideal for exterior walls/terrace painting & waterproofing', icon: <IcoRoom />, hasEstimateBuilder: true },

  // ── Two or more rooms painting ──
  { id: 'wr-any-2-rooms', title: 'Any 2 rooms', section: 'two-plus-rooms', rating: '4.81 (8K reviews)', price: 9999, priceLabel: 'starts-at', durationMin: 1620, note: 'Includes painting 2 rooms, such as the bedroom, living room or others', icon: <IcoRooms />, hasEstimateBuilder: true },
  { id: 'wr-any-3-rooms', title: 'Any 3 rooms', section: 'two-plus-rooms', rating: '4.81 (8K reviews)', price: 14499, priceLabel: 'starts-at', durationMin: 1620, note: 'Includes painting 3 rooms, such as the bedroom, living room or others', icon: <IcoRooms />, hasEstimateBuilder: true },

  // ── Doors, Grills & Cabinets ──
  { id: 'wr-door', title: 'Door painting', section: 'doors-grills-cabinets', rating: '4.78 (2K reviews)', price: 1999, priceLabel: 'starts-at', durationMin: 540, icon: <IcoDoor /> },
  { id: 'wr-grill', title: 'Grill painting', section: 'doors-grills-cabinets', rating: '4.77 (1K reviews)', price: 1999, priceLabel: 'starts-at', durationMin: 180, icon: <IcoDoor /> },
  { id: 'wr-cabinet', title: 'Cabinet painting', section: 'doors-grills-cabinets', rating: '4.77 (1K reviews)', price: 1999, priceLabel: 'starts-at', durationMin: 180, icon: <IcoDoor /> },
  { id: 'wr-metal-gate-shutter', title: 'Metal gate/shutter painting', section: 'doors-grills-cabinets', rating: '4.76 (1K reviews)', price: 2499, priceLabel: 'starts-at', durationMin: 540, icon: <IcoDoor /> },

  // ── Waterproofing & grouting ──
  { id: 'wr-wall-waterproofing', title: 'Wall waterproofing', section: 'waterproofing-grouting', rating: '4.87 (2K reviews)', price: 4998, priceLabel: 'starts-at', durationMin: 540, note: 'Not intended for active leakage conditions', icon: <IcoWaterproofing />, hasEstimateBuilder: true },
  { id: 'wr-terrace-waterproofing', title: 'Terrace water proofing', section: 'waterproofing-grouting', rating: '4.77 (1K reviews)', price: 5499, priceLabel: 'starts-at', durationMin: 550, icon: <IcoWaterproofing />, hasEstimateBuilder: true },
  { id: 'wr-tile-grouting', title: 'Tile grouting', section: 'waterproofing-grouting', rating: '4.82 (3K reviews)', price: 2499, priceLabel: 'starts-at', durationMin: 180, icon: <IcoWaterproofing />, hasEstimateBuilder: true },

  // ── Upgrade to full home ──
  { id: 'wr-unfurnished-1bhk', title: 'Unfurnished 1 BHK painting', section: 'upgrade-full-home', rating: '4.82 (7K reviews)', price: 10999, priceLabel: 'starts-at', durationMin: 540, note: 'Includes painting of a bedroom, living room, kitchen & bathroom', icon: <IcoHomeUpgrade />, hasEstimateBuilder: true },
  { id: 'wr-unfurnished-2bhk', title: 'Unfurnished 2 BHK painting', section: 'upgrade-full-home', rating: '4.82 (8K reviews)', price: 14499, priceLabel: 'starts-at', durationMin: 1620, note: 'Includes painting of 2 bedrooms, living room, kitchen & 2 bathrooms', icon: <IcoHomeUpgrade />, hasEstimateBuilder: true },
  { id: 'wr-unfurnished-3bhk', title: 'Unfurnished 3 BHK painting', section: 'upgrade-full-home', rating: '4.82 (7K reviews)', price: 18999, priceLabel: 'starts-at', durationMin: 2160, note: 'Includes painting of 3 bedrooms, living room, kitchen & 3 bathrooms', icon: <IcoHomeUpgrade />, hasEstimateBuilder: true },
  { id: 'wr-furnished-1bhk', title: 'Furnished 1 BHK painting', section: 'upgrade-full-home', rating: '4.82 (7K reviews)', price: 8999, priceLabel: 'starts-at', durationMin: 1620, note: 'Includes painting of a bedroom, living room, kitchen & bathroom', icon: <IcoHomeUpgrade />, hasEstimateBuilder: true },
  { id: 'wr-furnished-2bhk', title: 'Furnished 2 BHK painting', section: 'upgrade-full-home', rating: '4.81 (7K reviews)', price: 12499, priceLabel: 'starts-at', durationMin: 2160, note: 'Includes painting of 2 bedrooms, living room, kitchen & 2 bathrooms', icon: <IcoHomeUpgrade />, hasEstimateBuilder: true },
  { id: 'wr-furnished-3bhk', title: 'Furnished 3 BHK painting', section: 'upgrade-full-home', rating: '4.82 (7K reviews)', price: 16999, priceLabel: 'starts-at', durationMin: 2700, note: 'Includes painting of 3 bedrooms, living room, kitchen & 3 bathrooms', icon: <IcoHomeUpgrade />, hasEstimateBuilder: true },

  // ── Add-on ──
  { id: 'wr-home-painting-consultation', title: 'Home Painting Consultation', section: 'add-on', price: 49, durationMin: 60, icon: <IcoConsultation /> },
  { id: 'wr-at-home-consultation', title: 'At home consultation', section: 'add-on', price: 49, durationMin: 60, icon: <IcoConsultation /> },
  { id: 'wr-waterproofing-consultation', title: 'Waterproofing consultation', section: 'add-on', price: 49, durationMin: 60, icon: <IcoConsultation /> },
]

const SECTIONS: { id: PaintingSection; label: string; icon: React.ReactNode }[] = [
  { id: 'few-walls', label: 'Few walls painting', icon: <IcoWallPaint /> },
  { id: 'one-room', label: 'One room painting', icon: <IcoRoom /> },
  { id: 'two-plus-rooms', label: 'Two or more rooms', icon: <IcoRooms /> },
  { id: 'doors-grills-cabinets', label: 'Doors, Grills & Cabinets', icon: <IcoDoor /> },
  { id: 'waterproofing-grouting', label: 'Waterproofing & grouting', icon: <IcoWaterproofing /> },
  { id: 'upgrade-full-home', label: 'Upgrade to full home', icon: <IcoHomeUpgrade /> },
  { id: 'add-on', label: 'Add-on', icon: <IcoConsultation /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<PaintingSection, { title: string; subtitle: string }> = {
  'few-walls': { title: 'Touch up just what needs it', subtitle: 'Fresh paint for one wall or a few — no full room required.' },
  'one-room': { title: 'One room, fully refreshed', subtitle: 'Real coverage for bedrooms, living rooms, kitchens & more.' },
  'two-plus-rooms': { title: 'Multiple rooms, one visit', subtitle: 'Bundle 2 or 3 rooms together for your whole floor.' },
  'doors-grills-cabinets': { title: 'The small details count too', subtitle: 'Doors, grills, cabinets & metal gates, painted to last.' },
  'waterproofing-grouting': { title: 'Stop damp before it spreads', subtitle: 'Wall & terrace waterproofing, plus tile grouting.' },
  'upgrade-full-home': { title: 'Ready to do the whole home?', subtitle: 'Furnished or unfurnished, sized to your BHK.' },
  'add-on': { title: 'Get expert advice first', subtitle: 'Book a consultation before you commit to a plan.' },
}

function getPaintingItem(id: string): PaintingItem {
  const item = PAINTING_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Walls & rooms painting item id: ${id}`)
  return item
}

interface Addable {
  id: string
  title: string
  price: number
  durationMin?: number
}

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Walls &amp; Rooms Painting</span>
      </div>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBell /></button>
    </div>
  )
}

function TopHeader({ onNavigate }: { onNavigate: (s: string, data?: Record<string, string>) => void }) {
  // Profile is already reachable from the Sidebar's own "Profile" item, so
  // this header slot carries the Cart instead — a real, live count from the
  // one shared Customer cart (Customer Implementation 06A), not a
  // decorative avatar.
  const { itemCount } = useCustomerCart()
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#E3DDD7]">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('home-services')} aria-label="Back to Services" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent"><IcoBack /></button>
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Walls &amp; Rooms Painting</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'painting-few-walls-rooms' })}
          aria-label={itemCount ? `Cart (${itemCount} item${itemCount === 1 ? '' : 's'})` : 'Cart'}
          className="relative w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent"
        >
          <IcoCart />
          {itemCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-[#722ED1] text-white flex items-center justify-center text-[9px] font-bold leading-none"
              style={{ fontFamily: FONT_MONO }}
              aria-hidden="true"
            >
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

// ─── "Select a service" jump chips — same sticky/glass/alignment recipe
// as every other service-detail screen in this app. ────────────────────

function ServiceTabs({ onJump }: { onJump: (id: string) => void }) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-[#E3DDD7] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[#9A949D] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0 shrink-0 w-[86px]"
          >
            <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[#E3DDD7] flex items-center justify-center bg-[#F9F5FF] text-[#722ED1] shrink-0">
              {s.icon}
            </div>
            <span className="text-[12px] text-[#242326] text-center leading-tight break-words w-full" style={{ fontFamily: FONT_BODY }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Hero — no real painting photo exists in this project, so this
// uses the same warm-gradient + icon placeholder every other missing-
// photo surface in this app falls back to (the reference's own hero
// here is a real promotional video for a real campaign, not catalogue
// data). ─────────────────────────────────────────────────────────────

function HeroBanner({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Walls &amp; Rooms Painting</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          Paint just what<br />needs it.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          One wall, one room, or a few — sized to exactly what you need.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore services
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[#722ED1] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoWallPaint /></div>
      </div>
    </div>
  )
}

// ─── Category banner — 128×128px icon panel, same component/placement
// as every other service-detail screen's own CategoryBanner. ──────────

function CategoryBanner({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-[16px] flex items-center gap-4 px-5 sm:px-8 py-5"
      style={{ background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 60%, #FFF3EA 100%)' }}
    >
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[14px] bg-white/70 flex items-center justify-center text-[#722ED1] shrink-0 shadow-sm">{icon}</div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[16px] sm:text-[19px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{title}</span>
        <span className="text-[12.5px] sm:text-[13px] text-[#68636D] leading-snug" style={{ fontFamily: FONT_BODY }}>{subtitle}</span>
      </div>
    </div>
  )
}

// ─── Card chrome ─────────────────────────────────────────────────────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-white border-[#E3DDD7] text-[#722ED1] hover:bg-[#F3EAFF] hover:border-[#722ED1]'
const NEUTRAL_BTN_ADDED = 'bg-[#F3EAFF] border-[#722ED1] text-[#722ED1] hover:bg-[#F3EAFF]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

function PaintingLineItemRow({ item, cartCount, onAdd, onViewDetails }: {
  item: PaintingItem
  cartCount: number
  onAdd: () => void
  onViewDetails: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="w-32 h-32 shrink-0 mx-auto sm:mx-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]">
        {item.icon}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        {item.rating && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        )}
        {item.note && (
          <span className="text-[11.5px] text-[#9A949D] leading-snug italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          {item.hasEstimateBuilder ? 'View details and estimate' : 'View details'}
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
            {item.priceLabel === 'starts-at' && <span className="text-[#68636D]">Starts at </span>}
            <span className="font-semibold text-[#242326]">₹{item.price.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-[11px] font-semibold text-[#722ED1] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
        </div>
        <button onClick={onAdd} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : item.hasEstimateBuilder ? 'Get estimate' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── "View details" — makes the link genuinely interactive: same info
// the row already shows, in one focused panel, with its own Add button.
function ServiceDetailModal({ item, cartCount, onAdd, onClose }: {
  item: PaintingItem
  cartCount: number
  onAdd: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        className="w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-[16px] bg-white flex flex-col"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#F4F0EC] sticky top-0 bg-white">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[16px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            {item.rating && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="w-16 h-16 rounded-[12px] flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]">{item.icon}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
              {item.priceLabel === 'starts-at' && <span className="text-[#68636D]">Starts at </span>}
              <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
            </span>
            <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>
          </div>
          {item.note && <span className="text-[12px] text-[#9A949D] italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>}
          <button
            onClick={onAdd}
            className={`h-10 mt-1 rounded-[10px] border text-[13px] font-semibold cursor-pointer transition-all ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`}
            style={NEUTRAL_BTN_FONT}
          >
            {cartCount ? `Added ×${cartCount}` : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── "1 wall painting" — real "Get an estimate" configurator: choose a
// paint type, a damage/seepage option, and any add-ons, with a live
// running total, the real "Price includes" checklist, and the real
// "10% off above ₹10,000" threshold discount computed on the actual
// total rather than shown as a flat, unconditional badge. ────────────

interface WallPaintingSelection {
  wallCountId?: string
  paintTypeId?: string
  damageId?: string
  zoneQty: Record<string, number>
  addonQty: Record<string, number>
}

function initialWallPaintingSelection(config: WallEstimateConfig): WallPaintingSelection {
  return {
    wallCountId: config.wallCountOptions?.[0]?.id,
    paintTypeId: config.paintTypeOptions?.[0]?.id,
    damageId: config.damageOptions?.[0]?.id,
    zoneQty: { ...(config.defaultZoneQty ?? {}) },
    addonQty: {},
  }
}

// A wall-count option (when present) carries the absolute base price;
// paint type and damage are priced as add-ons on top of it. When no
// wall-count picker exists, config.basePrice is the base instead (0
// for "1 wall painting", where paint type itself already carries the
// full absolute price; each room's own real starting price for "One
// room painting" items; also 0 for "Tile grouting", whose base comes
// entirely from its own zoneOptions instead) — one formula covers
// every real pricing shape these references show. addonOptions is
// never defaulted to a shared list — a config that showed no add-ons
// section in its own reference simply has none to add here either.
function wallPaintingTotal(config: WallEstimateConfig, sel: WallPaintingSelection): number {
  const wallCount = config.wallCountOptions?.find(w => w.id === sel.wallCountId)
  const paint = config.paintTypeOptions?.find(p => p.id === sel.paintTypeId)
  const damage = config.damageOptions?.find(d => d.id === sel.damageId)
  const zones = (config.zoneOptions ?? []).reduce((sum, z) => sum + z.price * (sel.zoneQty[z.id] ?? 0), 0)
  const addons = (config.addonOptions ?? []).reduce((sum, a) => sum + a.price * (sel.addonQty[a.id] ?? 0), 0)
  const base = wallCount?.price ?? config.basePrice
  return base + (paint?.price ?? 0) + (damage?.price ?? 0) + zones + addons
}

function OptionTile({ label, price, note, selected, onSelect }: { label: string; price: number; note?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col gap-2 text-left rounded-[12px] p-3 cursor-pointer transition-all shrink-0 w-[140px] border"
      style={selected ? { borderColor: '#722ED1', background: '#F9F5FF' } : { borderColor: '#E3DDD7', background: '#FFFFFF' }}
    >
      {note && <span className="self-start px-1.5 py-[2px] rounded-[5px] bg-[#F4F0EC] text-[10px] text-[#68636D] font-semibold" style={{ fontFamily: FONT_BODY }}>{note}</span>}
      <span className="text-[13px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{label}</span>
      <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}</span>
    </button>
  )
}

function AddonTile({ label, price, qty, onChangeQty }: { label: string; price: number; qty: number; onChangeQty: (qty: number) => void }) {
  return (
    <div className="flex flex-col gap-2 text-left rounded-[12px] p-3 shrink-0 w-[150px] border" style={{ borderColor: qty > 0 ? '#722ED1' : '#E3DDD7', background: qty > 0 ? '#F9F5FF' : '#FFFFFF' }}>
      <span className="text-[13px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{label}</span>
      <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>+ ₹{price.toLocaleString('en-IN')}</span>
      {qty > 0 ? (
        <div className="self-start">
          <CartStepper qty={qty} onDecrement={() => onChangeQty(qty - 1)} onIncrement={() => onChangeQty(qty + 1)} />
        </div>
      ) : (
        <button onClick={() => onChangeQty(1)} className={`${NEUTRAL_BTN} ${NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          Add
        </button>
      )}
    </div>
  )
}

function WallPaintingEstimateModal({ itemId, initialCartCount, onAddToCart, onClose }: {
  itemId: string
  initialCartCount: number
  onAddToCart: (selection: WallPaintingSelection, title: string, total: number) => void
  onClose: () => void
}) {
  const config = WALL_ESTIMATE_CONFIGS[itemId]
  const [sel, setSel] = useState<WallPaintingSelection>(() => initialWallPaintingSelection(config))
  const total = wallPaintingTotal(config, sel)
  const discount = total > WALL_PAINTING_DISCOUNT_THRESHOLD ? Math.round(total * WALL_PAINTING_DISCOUNT_RATE) : 0
  const finalTotal = total - discount

  const zoneOptions = config.zoneOptions ?? []
  const addonOptions = config.addonOptions ?? []
  const wallCount = config.wallCountOptions?.find(w => w.id === sel.wallCountId)
  const paint = config.paintTypeOptions?.find(p => p.id === sel.paintTypeId)
  const damage = config.damageOptions?.find(d => d.id === sel.damageId)
  const chosenZones = zoneOptions.filter(z => (sel.zoneQty[z.id] ?? 0) > 0)
  const chosenAddons = addonOptions.filter(a => (sel.addonQty[a.id] ?? 0) > 0)

  const handleAdd = () => {
    const parts: string[] = []
    if (wallCount) parts.push(wallCount.label)
    if (paint) parts.push(paint.label)
    if (damage && damage.id !== config.damageOptions?.[0]?.id) parts.push(damage.label)
    chosenZones.forEach(z => parts.push(`${z.label} ×${sel.zoneQty[z.id]}`))
    chosenAddons.forEach(a => parts.push(`${a.label} ×${sel.addonQty[a.id]}`))
    onAddToCart(sel, `${config.title.replace(' estimate', '')} — ${parts.join(', ')}`, finalTotal)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        className="w-full max-w-[560px] max-h-[85vh] rounded-[16px] bg-white flex flex-col relative"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#F4F0EC] sticky top-0 bg-white z-10">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[18px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{config.title}</span>
            <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{config.startsAtNote}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>
          {config.wallCountOptions && (
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{config.wallCountLabel ?? 'Select number of walls'}</span>
              <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {config.wallCountOptions.map(w => (
                  <OptionTile key={w.id} label={w.label} price={w.price} selected={sel.wallCountId === w.id} onSelect={() => setSel(s => ({ ...s, wallCountId: w.id }))} />
                ))}
              </div>
            </div>
          )}

          {config.paintTypeOptions && (
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Select paint type</span>
              <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {config.paintTypeOptions.map(p => (
                  <OptionTile key={p.id} label={p.label} price={p.price} note={p.note} selected={sel.paintTypeId === p.id} onSelect={() => setSel(s => ({ ...s, paintTypeId: p.id }))} />
                ))}
              </div>
            </div>
          )}

          {config.damageOptions && (
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{config.damageLabel ?? 'Select any damage/seepage issue'}</span>
              <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {config.damageOptions.map(d => (
                  <OptionTile key={d.id} label={d.label} price={d.price} selected={sel.damageId === d.id} onSelect={() => setSel(s => ({ ...s, damageId: d.id }))} />
                ))}
              </div>
            </div>
          )}

          {zoneOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{config.zoneLabel ?? 'Select area'}</span>
              <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {zoneOptions.map(z => (
                  <AddonTile
                    key={z.id}
                    label={z.label}
                    price={z.price}
                    qty={sel.zoneQty[z.id] ?? 0}
                    onChangeQty={qty => setSel(s => ({ ...s, zoneQty: { ...s.zoneQty, [z.id]: Math.max(0, qty) } }))}
                  />
                ))}
              </div>
            </div>
          )}

          {addonOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Select add-ons</span>
              <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {addonOptions.map(a => (
                  <AddonTile
                    key={a.id}
                    label={a.label}
                    price={a.price}
                    qty={sel.addonQty[a.id] ?? 0}
                    onChangeQty={qty => setSel(s => ({ ...s, addonQty: { ...s.addonQty, [a.id]: Math.max(0, qty) } }))}
                  />
                ))}
              </div>
            </div>
          )}

          {discount === 0 && (
            <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: '#F4F0EC' }}>
              <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Add ₹{(WALL_PAINTING_DISCOUNT_THRESHOLD + 1 - total).toLocaleString('en-IN')} more to get 10% off</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: '#0F7A3D' }}>
              <span className="text-[12.5px] text-white font-medium" style={{ fontFamily: FONT_BODY }}>10% off applied — you saved ₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-[#F4F0EC]">
            <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Price includes</span>
            <div className="flex flex-col gap-1.5">
              {WALL_PAINTING_PRICE_INCLUDES.map(t => (
                <span key={t} className="flex items-center gap-2 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                  <IcoCheck /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[#F4F0EC] sticky bottom-0 bg-white">
          <div className="flex flex-col">
            {discount > 0 && <span className="text-[12px] line-through text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>₹{total.toLocaleString('en-IN')}</span>}
            <span className="text-[19px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={handleAdd}
            className="h-11 px-6 rounded-[10px] bg-[#722ED1] text-white text-[14px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            {initialCartCount ? `Added ×${initialCartCount} · Add another` : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Cart ───────────────────────────────────────────────────────────────

function CartStepper({ qty, onDecrement, onIncrement }: { qty: number; onDecrement: () => void; onIncrement: () => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[10px] border border-[#722ED1] shrink-0">
      <button onClick={onDecrement} aria-label="Decrease quantity" className="w-7 h-7 flex items-center justify-center text-[#722ED1] text-[16px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all border-0 bg-transparent rounded-l-[9px]">−</button>
      <span className="text-[13px] font-semibold text-[#242326] w-3 text-center" style={{ fontFamily: FONT_BODY }}>{qty}</span>
      <button onClick={onIncrement} aria-label="Increase quantity" className="w-7 h-7 flex items-center justify-center text-[#722ED1] text-[16px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all border-0 bg-transparent rounded-r-[9px]">+</button>
    </div>
  )
}

function CartCard({ cart, onChangeQty, onRemove, onViewCart }: {
  cart: CustomerCartItem[]
  onChangeQty: (cartId: string, delta: number) => void
  onRemove: (cartId: string) => void
  onViewCart: () => void
}) {
  if (cart.length === 0) return null
  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0)

  return (
    <div className="bg-white border border-[#E3DDD7] rounded-[16px] p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Cart</span>
      <div className="flex flex-col">
        {cart.map((c, i) => (
          <div key={c.cartId} className={`flex flex-col gap-2 py-3 ${i > 0 ? 'border-t border-[#F4F0EC]' : 'pt-0'}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{c.title}</span>
              <CartStepper qty={c.qty} onDecrement={() => onChangeQty(c.cartId, -1)} onIncrement={() => onChangeQty(c.cartId, 1)} />
            </div>
            <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>₹{c.price}</span>
            {c.duration && <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>• {c.duration}</span>}
            <button
              onClick={() => onRemove(c.cartId)}
              className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
              style={{ fontFamily: FONT_BODY }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F4F0EC]">
        <span className="text-[17px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{total}</span>
        <button
          onClick={onViewCart}
          className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
          style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
        >
          View Cart
        </button>
      </div>
    </div>
  )
}

// ─── Main Screen ────────────────────────────────────────────────────────

export default function PaintingFewWallsRoomsScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItem, setDetailItem] = useState<string | null>(null)
  const [estimateItemId, setEstimateItemId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'painting-few-walls-rooms',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.price,
      duration: entry.durationMin ? formatDuration(entry.durationMin) : undefined,
    })
  }

  // Each distinct wall-count/paint-type/damage/add-on combination
  // becomes its own cart line (same "one line per real configuration"
  // pattern the options-bearing pest-control pages use), so two
  // different estimates for the same item can sit in the cart side by
  // side.
  const addWallPaintingEstimateToCart = (itemId: string, selection: WallPaintingSelection, title: string, total: number) => {
    const zoneKey = Object.entries(selection.zoneQty)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => `${id}x${qty}`)
      .sort()
      .join('-')
    const addonKey = Object.entries(selection.addonQty)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => `${id}x${qty}`)
      .sort()
      .join('-')
    const cartId = `${itemId}-estimate__${selection.wallCountId ?? ''}__${selection.paintTypeId ?? ''}__${selection.damageId ?? ''}${zoneKey ? `__z-${zoneKey}` : ''}${addonKey ? `__a-${addonKey}` : ''}`
    addToCart({ id: cartId, title, price: total })
    setEstimateItemId(null)
  }

  const cartCountForPrefix = (prefix: string) => cart.filter(c => c.cartId.startsWith(prefix)).reduce((sum, c) => sum + c.qty, 0)

  const jumpToSection = (id: string) => {
    document.getElementById(`painting-wr-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'painting-few-walls-rooms',
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('home-services')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="services" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto" style={{ padding: '28px 24px', scrollbarWidth: 'none' }}>
            <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>

              {/* Page context — same eyebrow + title treatment as every
                  other service-detail screen. */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Painting &amp; Waterproofing</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Walls &amp; Rooms Painting
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('few-walls')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = PAINTING_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`painting-wr-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <PaintingLineItemRow
                            key={item.id}
                            item={item}
                            cartCount={item.hasEstimateBuilder ? cartCountForPrefix(`${item.id}-estimate__`) : cartCountForItem(item.id)}
                            onAdd={() => (item.hasEstimateBuilder ? setEstimateItemId(item.id) : addToCart(item))}
                            onViewDetails={() => (item.hasEstimateBuilder ? setEstimateItemId(item.id) : setDetailItem(item.id))}
                          />
                        ))}
                      </div>
                    )
                  })}
                </div>

                {/* Right column — pinned on desktop, same as every other
                    service-detail screen. */}
                <div className="flex flex-col gap-4 lg:sticky lg:top-[28px] lg:self-start lg:max-h-[calc(100vh-56px)] lg:overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  <div className="bg-white border border-[#E3DDD7] rounded-[16px] p-5 flex items-start gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    <div className="flex flex-col gap-2.5 flex-1">
                      <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Houzeify Promise</span>
                      {['Verified Professionals', 'Hassle Free Booking', 'Transparent Pricing'].map(t => (
                        <span key={t} className="flex items-center gap-2 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                          <IcoCheck /> {t}
                        </span>
                      ))}
                    </div>
                    <div className="w-11 h-11 rounded-full bg-[#F3EAFF] flex items-center justify-center shrink-0"><IcoShield /></div>
                  </div>

                  <CartCard cart={cart} onChangeQty={changeCartQty} onRemove={removeFromCart} onViewCart={viewCart} />

                  <div className="bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-4 flex items-center gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    <div className="w-10 h-10 rounded-[12px] bg-[#F3EAFF] flex items-center justify-center shrink-0"><HIcon size={24} /></div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Not sure which one?</span>
                      <span className="text-[12px] text-[#68636D] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>Ask Hozie to help you pick.</span>
                    </div>
                    <button
                      onClick={() => onNavigate(DASHBOARD_ROUTES.aiAdvisor)}
                      className="h-8 px-3 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[12px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
                      style={{ fontFamily: FONT_BODY }}
                    >
                      Ask Hozie →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {detailItem && (
        <ServiceDetailModal
          item={getPaintingItem(detailItem)}
          cartCount={cartCountForItem(detailItem)}
          onAdd={() => addToCart(getPaintingItem(detailItem))}
          onClose={() => setDetailItem(null)}
        />
      )}

      {estimateItemId && (
        <WallPaintingEstimateModal
          itemId={estimateItemId}
          initialCartCount={cartCountForPrefix(`${estimateItemId}-estimate__`)}
          onAddToCart={(selection, title, total) => addWallPaintingEstimateToCart(estimateItemId, selection, title, total)}
          onClose={() => setEstimateItemId(null)}
        />
      )}
    </div>
  )
}
