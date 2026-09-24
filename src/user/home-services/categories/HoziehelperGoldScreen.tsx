// ─── HozieHelp Gold — detail/booking page ───────────────────────────────
// Reached from the HozieHelp popup's "HozieHelp Gold" row (see
// HomeServicesScreen.tsx's HoziehelperModal). Same content shape as the
// reference page — a "Select a service" tab row (Instant / Later /
// Multi-day, each an anchor into its own section below, not a filter — no
// backend to filter against), a hero banner, and per-tier line items with a
// real photo, price and duration — restyled entirely in Houzeify's own
// design language (purple/cream tokens, Google Sans Flex / Open Sans,
// rounded-[Npx] cards) rather than the reference's black/gold Urban
// Company chrome. Ratings/prices/durations are demo values, consistent
// with the rest of this UI-only app (no bookings/reviews backend exists
// anywhere here) — kept modest rather than the reference's inflated
// "12.2M bookings", and the Gold "Instant" price matches the ₹79/visit the
// HozieHelp popup already promised, so the two screens never disagree.
// "View details" / cart / variant-count chrome from the reference has no
// real destination in this app and is left out rather than faked; each
// line item is itself the real action — clicking it hands off into the
// existing Create Service Request flow, exactly like every other tile in
// this Services area.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
import goldImg from '@/imports/Hoziehelper/Hozie Helper Gold.png'
import standardImg from '@/imports/Hoziehelper/Hozie Helper Standard.png'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// Same calm card surface as Salon Luxe/Prime's own line-item rows — a
// subtle white-to-lavender gradient + hairline border, so each service
// reads as its own card instead of a plain divider-separated list row.
const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, var(--hz-surface) 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}

// ─── Icons ──────────────────────────────────────────────────────────────

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
)
const IcoCart = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2.5h1.6L6.3 13h9L17.3 5.8H4.7" />
    <circle cx="7.2" cy="16.5" r="1.2" />
    <circle cx="14" cy="16.5" r="1.2" />
  </svg>
)
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2a6 6 0 016 6v2.5l1.5 3h-15L4 10.5V8a6 6 0 016-6z"/>
    <path d="M8 16a2 2 0 004 0"/>
  </svg>
)
const IcoStar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor"><path d="M6 0.8l1.5 3.3 3.6.4-2.7 2.5.7 3.6L6 8.8 2.9 10.6l.7-3.6L.9 4.5l3.6-.4L6 .8Z"/></svg>
)
const IcoClock = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="5.8"/>
    <path d="M7 3.8V7l2.3 1.3"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--hz-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5"/></svg>
)
const IcoShield = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="var(--hz-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3.5l8 3v5.5c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5V6.5l8-3Z"/>
    <path d="M9.5 13l2.5 2.5 5-5"/>
  </svg>
)
const IcoChevronRight = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
)
const IcoChevronLeft = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
)
const IcoChevronDown = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l4 4 4-4"/></svg>
)
// Task-row icons — simple, generic, line-only marks (no photos needed for
// these small chips).
const IcoTaskKitchen = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3v7a3 3 0 003 3v6"/><path d="M7 3v6"/><path d="M4 3v6"/>
    <path d="M15 3c-1.7 0-3 2-3 5s1.3 5 3 5v6"/>
  </svg>
)
const IcoTaskMeal = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="16" height="3" rx="1"/><path d="M4 12v3a3 3 0 003 3h8a3 3 0 003-3v-3"/>
    <line x1="11" y1="3" x2="11" y2="9"/>
  </svg>
)
const IcoTaskMop = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3L6 15"/><path d="M4 15h8l2 4H6l-2-4Z"/>
  </svg>
)
const IcoTaskBathroom = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 10h12a1 1 0 011 1c0 4-2.7 7-6 7s-6-3-6-7a1 1 0 011-1Z"/>
    <path d="M6 10V6a2 2 0 012-2"/>
  </svg>
)
const IcoTaskLaundry = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="16" height="16" rx="2"/><circle cx="11" cy="12" r="4.5"/><path d="M8 6h.01M11 6h.01"/>
  </svg>
)
const IcoTaskPacking = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="7" width="12" height="12" rx="1.5"/><path d="M8 7V5a3 3 0 016 0v2"/>
  </svg>
)
const IcoCross = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="var(--hz-danger)" strokeWidth="2" strokeLinecap="round"><path d="M2.5 2.5l10 10M12.5 2.5l-10 10"/></svg>
)
const IcoCloseX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
)
const IcoBolt = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M6.5 0.5L1.5 7h3.2l-.8 4.5L9.5 5H6.3l.2-4.5Z"/></svg>
)
const IcoCheckSmall = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5"/></svg>
)

// ─── Data ───────────────────────────────────────────────────────────────

interface HoziehelperLineItem {
  id: string
  title: string
  topRated?: boolean
  rating: string
  price: number
  originalPrice: number
  duration: string
  image: string
  /** Matches the reference page's own "N options" caption under Add —
   *  present only on the same two rows the reference showed it on
   *  (Instant's first item, Multi-day's item); left off every row the
   *  reference itself left blank, rather than inventing a count for all. */
  optionsCount?: number
  /** The N behind optionsCount — same duration/price ladder shape the
   *  reference shows on click, scaled to start from THIS row's own
   *  ₹79/45-min figures (never the reference's own, different numbers for
   *  that duration) so the two never contradict each other, and to keep
   *  the total review count in the same modest range as this row's own
   *  "(620 reviews)" rather than the reference's much larger figures. */
  durationOptions?: DurationOption[]
  /** The Saver Pack's subscription option — "N services in a month" at a
   *  further discount, shown as a second "Select a plan" section under
   *  "Select duration" (matching the reference's own two-part "Select
   *  requirements" step), anchored to THIS row's own price/originalPrice
   *  so the discount is always independently verifiable from numbers
   *  already on the page, never a borrowed reference figure. */
  plans?: SaverPlan[]
  /** The "Later" row's own combo flow — select a duration, THEN select a
   *  plan, ending in one real "Done" that books the combined choice.
   *  Distinct from `durationOptions` (each duration books immediately via
   *  its own "Add"). Two shapes, both driven by this one field:
   *  - `laterOptions` alone (no `plans`): plan is a live TOGGLE between
   *    "One time" and a 3-service pack, recomputed off whichever duration
   *    is selected (Gold/Standard's plain Later row).
   *  - `laterOptions` + `plans` together: the plan is the single, static,
   *    already-known pack from `plans[0]` (Saver Pack's fixed pack price
   *    doesn't change with duration) — duration selection is real here
   *    too (it sets what gets booked), just not linked to the plan's own
   *    numbers the way the toggle case is. */
  laterOptions?: DurationOption[]
}

interface DurationOption {
  id: string
  duration: string
  /** Omitted by `laterOptions` — that reference didn't show a per-card
   *  rating, only duration + price. */
  rating?: string
  price: number
  originalPrice: number
}

interface SaverPlan {
  id: string
  label: string
  servicesCount: number
  packPrice: number
  packOriginalPrice: number
  perServicePrice: number
  perServiceOriginalPrice: number
  discountPct: number
}

// ─── Cart — Customer Implementation 06A: migrated onto the ONE shared
// cross-screen Customer cart (useCustomerCart, src/data/customerCart.tsx)
// instead of this screen's own local state. `cartId` still distinguishes
// lines that share a tier but differ by duration/plan (e.g. Gold at 45
// mins vs. Gold at 1 hour are two separate lines, each with its own
// quantity) — the shared cart's own CustomerCartItem shape already
// carries every field this screen's own cart lines need (title, image,
// duration, price, originalPrice, qty), so no second cart-item type. ────

const GOLD_INSTANT_DURATIONS: DurationOption[] = [
  { id: '45m', duration: '45 mins', rating: '4.78 (180 reviews)', price: 79, originalPrice: 190 },
  { id: '1h', duration: '1 hour', rating: '4.83 (210 reviews)', price: 99, originalPrice: 230 },
  { id: '2h', duration: '2 hours', rating: '4.83 (140 reviews)', price: 139, originalPrice: 310 },
  { id: '2.5h', duration: '2.5 hours', rating: '4.82 (60 reviews)', price: 169, originalPrice: 370 },
  { id: '3h', duration: '3 hours', rating: '4.85 (30 reviews)', price: 199, originalPrice: 430 },
  { id: '4h', duration: '4 hours', rating: '4.80 (15 reviews)', price: 239, originalPrice: 490 },
  { id: 'full-day', duration: 'Full day', rating: '4.75 (5 reviews)', price: 349, originalPrice: 690 },
]

// Multi-day's own 6-option ladder — a recurring-visit plan (more days
// booked at once, a lower per-day rate), anchored to THIS row's own
// ₹119/day, ₹280 original and "4.85" rating rather than any reference
// figures, same discipline as GOLD_INSTANT_DURATIONS above.
const GOLD_MULTIDAY_DURATIONS: DurationOption[] = [
  { id: '3d', duration: '3 days/week', rating: '4.82 (25 reviews)', price: 119, originalPrice: 280 },
  { id: '5d', duration: '5 days/week', rating: '4.84 (30 reviews)', price: 109, originalPrice: 260 },
  { id: '6d', duration: '6 days/week', rating: '4.85 (30 reviews)', price: 105, originalPrice: 250 },
  { id: '15d', duration: '15 days', rating: '4.86 (20 reviews)', price: 99, originalPrice: 230 },
  { id: '30d', duration: '30 days', rating: '4.88 (20 reviews)', price: 89, originalPrice: 210 },
  { id: 'custom', duration: 'Custom plan', rating: '4.80 (15 reviews)', price: 119, originalPrice: 280 },
]

// Saver Pack's own 7-option duration ladder — prices matched exactly to
// the reference screenshot the user shared (45 mins ₹109 → 4 hours ₹569).
// Original/strike prices and per-option ratings aren't visible in that
// screenshot, so those two fields stay this app's own consistent figures
// (same ~2.3× markup and modest, decreasing review counts as every other
// duration ladder on this page) — only the current price is copied.
const GOLD_SAVER_DURATIONS: DurationOption[] = [
  { id: '45m', duration: '45 mins', rating: '4.65 (140 reviews)', price: 109, originalPrice: 249 },
  { id: '1h', duration: '1 hour', rating: '4.68 (110 reviews)', price: 139, originalPrice: 319 },
  { id: '1.5h', duration: '1.5 hours', rating: '4.70 (90 reviews)', price: 209, originalPrice: 479 },
  { id: '2h', duration: '2 hours', rating: '4.72 (70 reviews)', price: 279, originalPrice: 639 },
  { id: '2.5h', duration: '2.5 hours', rating: '4.74 (50 reviews)', price: 349, originalPrice: 799 },
  { id: '3h', duration: '3 hours', rating: '4.76 (30 reviews)', price: 419, originalPrice: 959 },
  { id: '4h', duration: '4 hours', rating: '4.78 (15 reviews)', price: 569, originalPrice: 1299 },
]

// Saver Pack's subscription plan — "3 services in 1 month" — prices
// matched exactly to the reference (₹237 pack / ₹807 original, ₹79 /
// ₹269 per service, 70% off — internally consistent: (269-79)/269 ≈ 70%).
const GOLD_SAVER_PLAN: SaverPlan = {
  id: 'saver-3x1m',
  label: '3 services in 1 month',
  servicesCount: 3,
  packPrice: 237,
  packOriginalPrice: 807,
  perServicePrice: 79,
  perServiceOriginalPrice: 269,
  discountPct: 70,
}

// Later's own 7-option duration ladder for the combo "pick a duration,
// then pick a plan" flow — current prices match the reference exactly
// (45 mins ₹109 → 4 hours ₹569, same figures as the Saver Pack ladder —
// this reference showed the same duration/price steps). originalPrice is
// this app's own consistent figure: the reference's one visible data
// point (1 hour: ₹139, "One time" plan ₹139 / ₹350, "60% off") implies a
// flat 350/139 ≈ 2.5× markup, i.e. originalPrice = price / 0.4 — applied
// to every duration here so the "One time" plan's 60% off always checks
// out against the numbers on the page, for any duration picked.
const GOLD_LATER_DURATIONS: DurationOption[] = [
  { id: '45m', duration: '45 mins', price: 109, originalPrice: 270 },
  { id: '1h', duration: '1 hour', price: 139, originalPrice: 350 },
  { id: '1.5h', duration: '1.5 hours', price: 209, originalPrice: 520 },
  { id: '2h', duration: '2 hours', price: 279, originalPrice: 700 },
  { id: '2.5h', duration: '2.5 hours', price: 349, originalPrice: 870 },
  { id: '3h', duration: '3 hours', price: 419, originalPrice: 1050 },
  { id: '4h', duration: '4 hours', price: 569, originalPrice: 1420 },
]

// ─── Expanded-detail content — everything under an options card, shown
// only for the one row this screen lets you drill into (Gold's Instant
// item, matching the reference). Task list / time breakdown / cover copy
// are descriptive chrome, safe to include as-is; the rating breakdown
// below is scaled to sum to this row's own "620 reviews" instead of the
// reference's much larger figures, so it never contradicts the summary
// line already shown above it. The reference's named, dated customer
// reviews are NOT reproduced — this app has no real review data, and
// inventing testimonials attributed to named people would be fabricating
// user content, not filling in a visual placeholder. The "All reviews"
// list below instead uses openly-placeholder cards ("Customer A/B/C",
// generic "Sample review" text) with a visible "Preview data" tag on the
// section, so nothing here can be mistaken for a real review. The
// reference's "Most detailed / In my area / Frequent users" filter chips
// are still left out — there's no real dataset for them to filter.

const TASK_LIST = [
  { id: 'kitchen', label: 'Kitchen & utensil cleaning', icon: <IcoTaskKitchen /> },
  { id: 'meal', label: 'Meal prep & serving', icon: <IcoTaskMeal /> },
  { id: 'mop', label: 'Mopping, dusting & wiping', icon: <IcoTaskMop /> },
  { id: 'bathroom', label: 'Bathroom cleaning', icon: <IcoTaskBathroom /> },
  { id: 'laundry', label: 'Laundry', icon: <IcoTaskLaundry /> },
  { id: 'packing', label: 'Packing & un-packing', icon: <IcoTaskPacking /> },
]

const EXCLUDED_LIST = [
  'Removal of hard stains',
  'Cleaning of any home appliances',
  'Cooking meals',
  'Hand-washing clothes',
]

const TIME_BREAKDOWN = [
  { id: 'kitchen', label: 'Kitchen & Dishwashing', note: 'For 3-4 members', minutes: '25 mins', icon: <IcoTaskKitchen /> },
  { id: 'bathroom', label: '1 Bathroom cleaning', note: 'Mopping & toilet seat cleaning', minutes: '15 mins', icon: <IcoTaskBathroom /> },
  { id: 'mop', label: 'Mopping, dusting & wiping', note: 'For 3 bedrooms & living room', minutes: '55 mins', icon: <IcoTaskMop /> },
  { id: 'laundry', label: 'Laundry', note: 'For 3-4 members', minutes: '30 mins', icon: <IcoTaskLaundry /> },
]

const FAQS = [
  { q: 'Is the professional trained and verified?', a: 'Yes — every HozieHelp professional is background-checked and trained for quality and safety before taking bookings.' },
  { q: 'Will the professional bring cleaning supplies?', a: 'Not by default — please have your usual cleaning equipment and supplies ready for the help to use.' },
  { q: "What if the cleaning isn't complete within the selected time?", a: 'You can extend the booking on the spot, or schedule a follow-up visit to finish the remaining work.' },
  { q: 'Can I request the same professional for my next booking?', a: "You'll be able to note a preferred professional when you book, subject to their availability." },
  { q: 'Can I schedule the service instead of booking instantly?', a: 'Yes — use the "Later" tab above to pick a future date and time for the same service.' },
]

// Scaled to sum to 620 — this row's own "(620 reviews)" figure — never the
// reference's much larger per-star counts.
const RATING_BREAKDOWN = [
  { stars: 5, count: 460 },
  { stars: 4, count: 90 },
  { stars: 3, count: 40 },
  { stars: 2, count: 15 },
  { stars: 1, count: 15 },
]

// Openly-placeholder review cards — "Customer A/B/C", generic "Sample
// review" copy, no invented names/dates/personal stories. Tagged "Preview
// data" on the section itself so nothing here can be mistaken for a real
// customer's words.
const SAMPLE_REVIEWS = [
  { id: 'a', name: 'Customer A', stars: 5, text: 'Sample review — replace with a real customer review when one exists.' },
  { id: 'b', name: 'Customer B', stars: 4, text: 'Sample review — replace with a real customer review when one exists.' },
  { id: 'c', name: 'Customer C', stars: 5, text: 'Sample review — replace with a real customer review when one exists.' },
]

interface HoziehelperSection {
  id: 'instant' | 'later' | 'multiday'
  label: string
  items: HoziehelperLineItem[]
}

const SECTIONS: HoziehelperSection[] = [
  {
    id: 'instant',
    label: 'Instant',
    items: [
      { id: 'gold-instant', title: 'HozieHelp Gold', topRated: true, rating: '4.8 (620 reviews)', price: 79, originalPrice: 190, duration: '45 mins', image: goldImg, optionsCount: 7, durationOptions: GOLD_INSTANT_DURATIONS },
      { id: 'saver-instant', title: 'HozieHelp Saver Pack', rating: '4.7 (410 reviews)', price: 79, originalPrice: 269, duration: '45 mins', image: standardImg, optionsCount: 7, durationOptions: GOLD_SAVER_DURATIONS, plans: [GOLD_SAVER_PLAN] },
    ],
  },
  {
    id: 'later',
    label: 'Later',
    items: [
      { id: 'gold-later', title: 'HozieHelp Gold', topRated: true, rating: '4.8 (620 reviews)', price: 99, originalPrice: 230, duration: '60 mins', image: goldImg, optionsCount: 7, laterOptions: GOLD_LATER_DURATIONS },
      { id: 'saver-later', title: 'HozieHelp Saver Pack', rating: '4.7 (410 reviews)', price: 79, originalPrice: 190, duration: '45 mins', image: standardImg, optionsCount: 7, laterOptions: GOLD_SAVER_DURATIONS, plans: [GOLD_SAVER_PLAN] },
    ],
  },
  {
    id: 'multiday',
    label: 'Multi-day',
    items: [
      { id: 'gold-multiday', title: 'HozieHelp Gold — Multi-Day', topRated: true, rating: '4.85 (140 reviews)', price: 119, originalPrice: 280, duration: 'per day', image: goldImg, optionsCount: 6, durationOptions: GOLD_MULTIDAY_DURATIONS },
    ],
  },
]

// ─── Chrome — same shell shape as HomeServicesScreen.tsx ───────────────────

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>HozieHelp Gold</span>
      </div>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBell /></button>
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
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('home-services')} aria-label="Back to Services" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"><IcoBack /></button>
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>HozieHelp Gold</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'hoziehelper-gold' })}
          aria-label={itemCount ? `Cart (${itemCount} item${itemCount === 1 ? '' : 's'})` : 'Cart'}
          className="relative w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"
        >
          <IcoCart />
          {itemCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-[var(--hz-primary)] text-white flex items-center justify-center text-[9px] font-bold leading-none"
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

// ─── "Select a service" tabs — anchor into the section below, not a filter ──

function ServiceTabs({ onJump }: { onJump: (id: HoziehelperSection['id']) => void }) {
  return (
    // Sticky within `main` (the scrolling ancestor, overflow-y-auto) so
    // this stays reachable while the section list scrolls past
    // underneath it. `top-0`, not a positive offset — main's own
    // padding-top scrolls away like any other content, so a positive
    // top here would leave a gap once stuck, with whatever card is
    // passing underneath showing through it. Frosted glass background
    // (translucent white + blur) — same fix applied across every
    // "Select a service" panel in this app (Salon Luxe, HozieHelp Gold/
    // Standard) and the pattern to reuse for any future one.
    <div className="bg-[var(--hz-surface)]/70 backdrop-blur-md border border-[var(--hz-border)] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      <div className="flex gap-3">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0"
          >
            <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[var(--hz-border)]">
              <img src={s.items[0].image} alt={s.label} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
            </div>
            <span className="text-[12px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Hero banner — 990×300 ───────────────────────────────────────────────

function HeroBanner() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, height: 300, background: 'linear-gradient(120deg, #F9F5FF 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="absolute inset-0 flex items-center px-5 sm:px-10 lg:px-12">
        <h2 className="text-[22px] sm:text-[32px] lg:text-[40px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[150px] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Top rated Help.<br />Premium service
        </h2>
      </div>
      <img
        src={goldImg}
        alt="HozieHelp Gold"
        className="absolute right-0 bottom-0 h-full object-cover w-[38%] sm:w-[46%]"
        style={{ objectPosition: '60% 15%', maskImage: 'linear-gradient(90deg, transparent, black 12%)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%)' }}
      />
    </div>
  )
}

// ─── Line item row ──────────────────────────────────────────────────────

function LineItemRow({ item, onSelect, cartCount }: { item: HoziehelperLineItem; onSelect: () => void; cartCount?: number }) {
  return (
    <div className="w-full flex items-center gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0">
        <div className="w-[88px] h-[112px] rounded-[14px] overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
        </div>
        {item.topRated && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}
          >
            ★ Top rated
          </span>
        )}
        {/* Green check badge — this tier already has at least one line in
            the cart, so the section you picked from is visibly marked at
            a glance, not just reflected in the (easy-to-miss) cart panel. */}
        {!!cartCount && (
          <span
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: '#0F7A3D', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
            aria-label="Added to cart"
          >
            <IcoCheckSmall size={13} />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
          <span className="flex items-center gap-1 text-[var(--hz-primary)] font-semibold"><IcoStar /> {item.rating}</span>
        </span>
        <span className="text-[13.5px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
          Starts at <span className="font-semibold">₹{item.price}</span>{' '}
          <span className="line-through text-[var(--hz-ink-subtle)]">₹{item.originalPrice}</span>
          <span className="flex items-center gap-1 text-[var(--hz-ink-muted)] mt-0.5"><IcoClock /> {item.duration}</span>
        </span>
      </div>
      <div className="shrink-0 flex flex-col items-center gap-1.5">
        <button
          onClick={onSelect}
          className={
            cartCount
              ? 'h-9 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0'
              : 'h-9 px-5 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[13px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)]'
          }
          style={cartCount ? { fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' } : { fontFamily: FONT_BODY }}
        >
          {cartCount ? 'Edit' : 'Add'}
        </button>
        {!!cartCount ? (
          <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#0F7A3D', fontFamily: FONT_BODY }}>
            <IcoCheckSmall size={11} /> Added{cartCount > 1 ? ` ×${cartCount}` : ''}
          </span>
        ) : (
          item.optionsCount && (
            <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} options</span>
          )
        )}
      </div>
    </div>
  )
}

// ─── Options row — the "7 options" drill-down, horizontally scrollable
// with side arrows that scroll the row rather than paginate it (simplest
// honest match for "side arrows" with only 7 short cards). ───────────────

function OptionsRow({ options, onSelect, isInCart }: { options: DurationOption[]; onSelect: (opt: DurationOption) => void; isInCart?: (opt: DurationOption) => number }) {
  const scrollerId = 'hoziehelper-options-scroller'
  const scrollByCard = (dir: 1 | -1) => {
    const el = document.getElementById(scrollerId)
    el?.scrollBy({ left: dir * 190, behavior: 'smooth' })
  }
  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => scrollByCard(-1)}
        aria-label="Scroll options left"
        className="hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)] transition-all cursor-pointer"
      >
        <IcoChevronLeft />
      </button>
      <div id={scrollerId} className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {options.map(opt => {
          const qty = isInCart?.(opt) ?? 0
          return (
            <div key={opt.id} className="relative shrink-0 flex flex-col gap-2 rounded-[14px] p-3" style={{ width: 168, ...CARD_SURFACE }}>
              {!!qty && (
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: '#0F7A3D', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
                  aria-label="Added to cart"
                >
                  <IcoCheckSmall size={13} />
                </span>
              )}
              <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{opt.duration}</span>
              <span className="flex items-center gap-1 text-[11.5px] text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_BODY }}><IcoStar size={10} /> {opt.rating}</span>
              <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                ₹{opt.price} <span className="line-through text-[var(--hz-ink-subtle)]">₹{opt.originalPrice}</span>
              </span>
              <button
                onClick={() => onSelect(opt)}
                className="h-8 rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[12.5px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)]"
                style={{ fontFamily: FONT_BODY }}
              >
                Add
              </button>
              {!!qty && (
                <span className="text-[11px] font-semibold text-center" style={{ color: '#0F7A3D', fontFamily: FONT_BODY }}>Added ×{qty}</span>
              )}
            </div>
          )
        })}
      </div>
      <button
        onClick={() => scrollByCard(1)}
        aria-label="Scroll options right"
        className="hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)] transition-all cursor-pointer"
      >
        <IcoChevronRight />
      </button>
    </div>
  )
}

// ─── Saver Pack's subscription plan card — shown, pre-selected (purple
// border), only for rows that carry a `plans` entry. Informational only:
// the actual booking action stays the "Add" buttons on the duration cards
// above, same as everywhere else in this app — there's no real pack/cart
// backend here to check out a multi-visit subscription against. ─────────

function PlanCard({ plan }: { plan: SaverPlan }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5 rounded-[14px] p-4" style={{ width: 200, border: '2px solid var(--hz-primary)', backgroundColor: '#F9F5FF' }}>
        <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{plan.label}</span>
        <span className="text-[15px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
          <span className="font-semibold">₹{plan.packPrice}</span>{' '}
          <span className="line-through text-[var(--hz-ink-subtle)] text-[12.5px]">₹{plan.packOriginalPrice}</span>
        </span>
        <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>₹{plan.perServicePrice}/service</span>
        <span
          className="inline-flex items-center gap-1 self-start text-[11px] font-semibold px-2 py-[3px] rounded-full"
          style={{ backgroundColor: '#E9FBEF', color: '#1E8E3E', fontFamily: FONT_BODY }}
        >
          <IcoBolt /> {plan.discountPct}% off
        </span>
      </div>
      <span className="flex items-center gap-2 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
        <span className="w-4 h-4 rounded-full border border-[var(--hz-ink-subtle)] flex items-center justify-center shrink-0 text-[10px]">i</span>
        Get a pack & pay just ₹{plan.perServicePrice}{' '}
        <span className="line-through">₹{plan.perServiceOriginalPrice}</span> per service
      </span>
    </div>
  )
}

// ─── "Later" combo selector — a duration row and a plan row, BOTH
// clickable-to-select (no "Add" per card), with the plan cards' numbers
// recomputed live off whichever duration is currently picked. Distinct
// from OptionsRow (each duration books immediately) and PlanCard above
// (one static, pre-selected pack) — this is the one flow where duration
// and plan are linked and neither alone is bookable; "Done" in the
// footer below carries both choices at once. ────────────────────────────

function SelectableDurationRow({ options, selectedId, onSelect }: { options: DurationOption[]; selectedId: string; onSelect: (id: string) => void }) {
  const scrollerId = 'hoziehelper-later-scroller'
  const scrollByCard = (dir: 1 | -1) => {
    document.getElementById(scrollerId)?.scrollBy({ left: dir * 150, behavior: 'smooth' })
  }
  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => scrollByCard(-1)}
        aria-label="Scroll durations left"
        className="hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)] transition-all cursor-pointer"
      >
        <IcoChevronLeft />
      </button>
      <div id={scrollerId} className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {options.map(opt => {
          const active = opt.id === selectedId
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="shrink-0 flex flex-col gap-1 rounded-[14px] p-3 text-left cursor-pointer transition-all"
              style={{ width: 132, border: active ? '2px solid var(--hz-primary)' : '1px solid var(--hz-border)', backgroundColor: active ? 'var(--hz-primary-soft)' : 'var(--hz-surface)' }}
            >
              <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{opt.duration}</span>
              <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>₹{opt.price}</span>
            </button>
          )
        })}
      </div>
      <button
        onClick={() => scrollByCard(1)}
        aria-label="Scroll durations right"
        className="hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)] transition-all cursor-pointer"
      >
        <IcoChevronRight />
      </button>
    </div>
  )
}

function SelectablePlanCard({ active, onClick, label, sublabel, price, originalPrice, perService, discountPct }: {
  active: boolean
  onClick: () => void
  label: string
  sublabel?: string
  price: number
  originalPrice: number
  perService: number
  discountPct: number
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-1.5 rounded-[14px] p-4 text-left cursor-pointer transition-all"
      style={{ width: 190, border: active ? '2px solid var(--hz-primary)' : '1px solid var(--hz-border)', backgroundColor: active ? '#F9F5FF' : 'var(--hz-surface)' }}
    >
      <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{label}</span>
      {sublabel && <span className="text-[12px] text-[var(--hz-ink-muted)] -mt-1" style={{ fontFamily: FONT_BODY }}>{sublabel}</span>}
      <span className="text-[15px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
        <span className="font-semibold">₹{price}</span>{' '}
        <span className="line-through text-[var(--hz-ink-subtle)] text-[12.5px]">₹{originalPrice}</span>
      </span>
      <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>₹{perService}/service</span>
      <span
        className="inline-flex items-center gap-1 self-start text-[11px] font-semibold px-2 py-[3px] rounded-full"
        style={{ backgroundColor: '#E9FBEF', color: '#1E8E3E', fontFamily: FONT_BODY }}
      >
        <IcoBolt /> {discountPct}% off
      </span>
    </button>
  )
}

function FaqRow({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <div className="border-b border-[var(--hz-surface-muted)] last:border-b-0 py-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer border-0 bg-transparent p-0"
      >
        <span className="text-[13.5px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{q}</span>
        <span className={`shrink-0 text-[var(--hz-ink-subtle)] transition-transform ${open ? 'rotate-180' : ''}`}><IcoChevronDown /></span>
      </button>
      {open && <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.55] mt-2 mb-0" style={{ fontFamily: FONT_BODY }}>{a}</p>}
    </div>
  )
}

// ─── Options modal — the "N options" drill-down now opens as a centred
// popup over the page (backdrop click / ✕ both close it) instead of
// expanding inline in the list, per explicit request. Content is the same
// as before, just reflowed into a modal header (photo/title/rating/close)
// + one scrollable body, rather than a row-attached accordion panel. ───

function OptionsModal({ item, cart, onClose, onSelectOption, onSelectLater, onSelectLaterPack }: {
  item: HoziehelperLineItem
  cart: CustomerCartItem[]
  onClose: () => void
  onSelectOption: (opt: DurationOption) => void
  onSelectLater: (opt: DurationOption, plan: 'onetime' | 'pack') => void
  onSelectLaterPack: (opt: DurationOption, plan: SaverPlan) => void
}) {
  const totalReviews = RATING_BREAKDOWN.reduce((sum, r) => sum + r.count, 0)
  const cartQtyFor = (cartId: string) => cart.find(c => c.cartId === cartId)?.qty ?? 0

  // "Later" combo state — which duration and which plan are picked.
  // Defaults match the reference: first duration, pack plan pre-selected.
  const [laterId, setLaterId] = useState(item.laterOptions?.[0]?.id ?? null)
  const [laterPlan, setLaterPlan] = useState<'onetime' | 'pack'>('pack')
  const laterSelected = item.laterOptions?.find(o => o.id === laterId) ?? item.laterOptions?.[0] ?? null
  // Pack per-service rate is a flat ~71.7%-off-original rate, derived from
  // the one visible reference data point (1 hour: ₹350 original → ₹99
  // pack/service) rather than a separately stored number per duration —
  // keeps every duration's pack price honestly proportional to its own
  // originalPrice instead of a copy-pasted table.
  const packPerService = laterSelected ? Math.round(laterSelected.originalPrice * 0.283) : 0
  const packTotal = packPerService * 3
  const packOriginalTotal = laterSelected ? laterSelected.originalPrice * 3 : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(30,30,30,0.45)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="w-full flex flex-col bg-[var(--hz-surface)] rounded-[20px] overflow-hidden"
        style={{ maxWidth: 760, maxHeight: '88vh', boxShadow: '0 20px 60px rgba(0,0,0,0.28)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--hz-surface-muted)] shrink-0">
          <div className="w-12 h-12 rounded-[10px] overflow-hidden shrink-0">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
          </div>
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
            <span className="text-[15px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            <span className="flex items-center gap-1 text-[12px] text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_BODY }}><IcoStar size={10} /> {item.rating}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"
          >
            <IcoCloseX />
          </button>
        </div>

        {/* Body — one scrollable panel, minimal scrollbar */}
        <div className="flex flex-col gap-6 px-6 py-5 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--hz-border) transparent' }}>
          {item.laterOptions && laterSelected && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Select requirements</h3>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select duration</span>
                <SelectableDurationRow options={item.laterOptions} selectedId={laterSelected.id} onSelect={setLaterId} />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a plan</span>
                {item.plans ? (
                  // Fixed, single pack (Saver Pack's Later row) — the plan
                  // itself doesn't change with duration, so it's the same
                  // informational, always-selected card used on the
                  // Saver Pack's Instant row, not a toggle.
                  <div className="flex gap-3 flex-wrap">
                    <PlanCard plan={item.plans[0]} />
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 flex-wrap">
                      <SelectablePlanCard
                        active={laterPlan === 'onetime'}
                        onClick={() => setLaterPlan('onetime')}
                        label="One time"
                        price={laterSelected.price}
                        originalPrice={laterSelected.originalPrice}
                        perService={laterSelected.price}
                        discountPct={60}
                      />
                      <SelectablePlanCard
                        active={laterPlan === 'pack'}
                        onClick={() => setLaterPlan('pack')}
                        label="3 services"
                        sublabel="in 1 month"
                        price={packTotal}
                        originalPrice={packOriginalTotal}
                        perService={packPerService}
                        discountPct={71}
                      />
                    </div>
                    <span className="flex items-center gap-2 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                      <span className="w-4 h-4 rounded-full border border-[var(--hz-ink-subtle)] flex items-center justify-center shrink-0 text-[10px]">i</span>
                      Get a pack & pay just ₹{packPerService} <span className="line-through">₹{laterSelected.originalPrice}</span> per service
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {item.durationOptions && (
            <div className="flex flex-col gap-4">
              {item.plans && <h3 className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Select requirements</h3>}

              <div className="flex flex-col gap-2">
                {item.plans && <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select duration</span>}
                <OptionsRow options={item.durationOptions} onSelect={onSelectOption} isInCart={opt => cartQtyFor(`${item.id}-${opt.id}`)} />
              </div>

              {item.plans && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a plan</span>
                  <PlanCard plan={item.plans[0]} />
                </div>
              )}
            </div>
          )}

          {/* One help who can do it all + What's excluded, side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 pt-6 border-t border-[var(--hz-surface-muted)]">
          <div className="flex flex-col gap-3">
            <h3 className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>One help who can do it all</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {TASK_LIST.map(t => (
                <div key={t.id} className="flex flex-col gap-1.5 items-center text-center">
                  <div className="w-11 h-11 rounded-[10px] bg-[var(--hz-surface-muted)] flex items-center justify-center text-[var(--hz-ink-muted)] [&_svg]:w-[16px] [&_svg]:h-[16px]">{t.icon}</div>
                  <span className="text-[11px] text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_BODY }}>{t.label}</span>
                </div>
              ))}
            </div>
            <span className="flex items-center gap-2 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
              <span className="w-4 h-4 rounded-full border border-[var(--hz-ink-subtle)] flex items-center justify-center shrink-0 text-[10px]">i</span>
              Please provide cleaning equipment & supplies to the help
            </span>
          </div>

          <div className="flex flex-col rounded-[14px] border border-[var(--hz-border)] p-4 h-fit" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] mb-2" style={{ fontFamily: FONT_HEAD }}>What&apos;s excluded</span>
            {EXCLUDED_LIST.map(x => (
              <span key={x} className="flex items-center gap-2 text-[13px] text-[var(--hz-ink)] py-1.5" style={{ fontFamily: FONT_BODY }}>
                <IcoCross /> {x}
              </span>
            ))}
          </div>
        </div>

        {/* How long does it take? */}
        <div className="flex flex-col gap-3 pt-6 border-t border-[var(--hz-surface-muted)]">
          <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>How long does it take?</h3>
            <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>These are approximate times for a 3BHK home — you can ask the help to customise as per your need.</p>
          </div>
          <div className="flex flex-col">
            {TIME_BREAKDOWN.map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--hz-surface-muted)] last:border-b-0">
                <span className="w-8 h-8 rounded-[8px] bg-[var(--hz-surface-muted)] flex items-center justify-center text-[var(--hz-ink-muted)] shrink-0">{t.icon}</span>
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{t.label}</span>
                  <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{t.note}</span>
                </span>
                <span className="text-[13px] text-[var(--hz-ink)] font-medium shrink-0" style={{ fontFamily: FONT_BODY }}>{t.minutes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Houzeify Cover */}
        <div className="flex items-center gap-3 rounded-[14px] border border-[var(--hz-border)] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] flex items-center justify-center shrink-0"><IcoShield size={22} /></div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Stay stress-free with Houzeify Cover</span>
            <span className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>Up to ₹10,000 cover if any damage happens during the job.</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="flex flex-col rounded-[14px] border border-[var(--hz-border)] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] mb-1" style={{ fontFamily: FONT_HEAD }}>Frequently asked questions</span>
          {FAQS.map((f, i) => <FaqRow key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
        </div>

        {/* Rating summary */}
        <div className="flex flex-col gap-3 rounded-[14px] border border-[var(--hz-border)] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)', maxWidth: 480 }}>
          <span className="flex items-center gap-2 text-[28px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
            <IcoStar size={22} /> 4.83
          </span>
          <div className="flex flex-col gap-1.5">
            {RATING_BREAKDOWN.map(r => (
              <div key={r.stars} className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11.5px] text-[var(--hz-ink-muted)] shrink-0" style={{ fontFamily: FONT_BODY, width: 28 }}><IcoStar size={10} />{r.stars}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--hz-surface-muted)] overflow-hidden">
                  <div className="h-full bg-[var(--hz-primary)] rounded-full" style={{ width: `${(r.count / totalReviews) * 100}%` }} />
                </div>
                <span className="text-[11.5px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY, width: 32, textAlign: 'right' }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All reviews — openly placeholder, tagged as such, never
            presented as if it were real customer feedback. */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>All reviews</h3>
            <span
              className="text-[10.5px] tracking-[0.04em] uppercase font-semibold px-2 py-[3px] rounded-full text-[var(--hz-ink-muted)]"
              style={{ fontFamily: FONT_MONO, backgroundColor: 'var(--hz-surface-muted)' }}
            >
              Preview data — not a real review
            </span>
          </div>
          <div className="flex flex-col">
            {SAMPLE_REVIEWS.map((r, i) => (
              <div key={r.id} className={`flex flex-col gap-1.5 py-4 ${i > 0 ? 'border-t border-[var(--hz-surface-muted)]' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{r.name}</span>
                  <span className="flex items-center gap-1 text-[12px] text-[var(--hz-primary)] font-semibold shrink-0"><IcoStar size={11} /> {r.stars}</span>
                </div>
                <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Sticky footer — only for rows with a plan but no laterOptions
            (the Saver Pack's Instant row): a summary of the pre-selected
            pack + a "Done" button. This app has no real cart/checkout to
            hand a pack selection off to, so Done simply closes the popup,
            same as the ✕ and backdrop — it's a confirmation of what you
            saw, not a separate booking action (that stays the "Add"
            buttons on the duration cards). The Saver Pack's Later row has
            both `plans` and `laterOptions` — its footer is the dedicated
            laterOptions+plans branch further below, which books for real. */}
        {item.plans && !item.laterOptions && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[var(--hz-surface-muted)] shrink-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-[19px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
                ₹{item.plans[0].packPrice}{' '}
                <span className="line-through text-[var(--hz-ink-subtle)] text-[14px] font-normal">₹{item.plans[0].packOriginalPrice}</span>
              </span>
              <span className="text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{item.plans[0].servicesCount} services</span>
            </div>
            <button
              onClick={onClose}
              className="h-11 px-8 rounded-[12px] bg-[var(--hz-primary)] text-white text-[14.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              Done
            </button>
          </div>
        )}

        {/* Sticky footer — the "Later" combo: Done here is the real
            booking action, carrying whichever duration + plan is
            currently selected, unlike the Saver Pack's close-only Done
            above (this row has no per-card "Add" to fall back on — the
            duration cards are select-only). */}
        {item.laterOptions && laterSelected && item.plans && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[var(--hz-surface-muted)] shrink-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-[19px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
                ₹{item.plans[0].packPrice}{' '}
                <span className="line-through text-[var(--hz-ink-subtle)] text-[14px] font-normal">₹{item.plans[0].packOriginalPrice}</span>
              </span>
              <span className="text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{item.plans[0].servicesCount} services</span>
            </div>
            <button
              onClick={() => onSelectLaterPack(laterSelected, item.plans![0])}
              className="h-11 px-8 rounded-[12px] bg-[var(--hz-primary)] text-white text-[14.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              Done
            </button>
          </div>
        )}

        {item.laterOptions && laterSelected && !item.plans && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[var(--hz-surface-muted)] shrink-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-[19px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
                ₹{laterPlan === 'pack' ? packTotal : laterSelected.price}{' '}
                <span className="line-through text-[var(--hz-ink-subtle)] text-[14px] font-normal">
                  ₹{laterPlan === 'pack' ? packOriginalTotal : laterSelected.originalPrice}
                </span>
              </span>
              <span className="text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                {laterPlan === 'pack' ? '3 services' : '1 service'}
              </span>
            </div>
            <button
              onClick={() => onSelectLater(laterSelected, laterPlan)}
              className="h-11 px-8 rounded-[12px] bg-[var(--hz-primary)] text-white text-[14.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Cart panel — right column, below Houzeify Promise. Hidden entirely
// when empty rather than showing an empty state, since there's nothing
// useful to say there that the page itself doesn't already say. ────────

function CartStepper({ qty, onDecrement, onIncrement }: { qty: number; onDecrement: () => void; onIncrement: () => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[10px] border border-[var(--hz-primary)] shrink-0">
      <button
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className="w-7 h-7 flex items-center justify-center text-[var(--hz-primary)] text-[16px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] transition-all border-0 bg-transparent rounded-l-[9px]"
      >
        −
      </button>
      <span className="text-[13px] font-semibold text-[var(--hz-ink)] w-3 text-center" style={{ fontFamily: FONT_BODY }}>{qty}</span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="w-7 h-7 flex items-center justify-center text-[var(--hz-primary)] text-[16px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] transition-all border-0 bg-transparent rounded-r-[9px]"
      >
        +
      </button>
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
  const totalOriginal = cart.reduce((sum, c) => sum + c.originalPrice * c.qty, 0)
  const saved = totalOriginal - total

  return (
    <div className="bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Cart</span>

      <div className="flex flex-col">
        {cart.map((c, i) => (
          <div key={c.cartId} className={`flex flex-col gap-2 py-3 ${i > 0 ? 'border-t border-[var(--hz-surface-muted)]' : 'pt-0'}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{c.title}</span>
              <CartStepper qty={c.qty} onDecrement={() => onChangeQty(c.cartId, -1)} onIncrement={() => onChangeQty(c.cartId, 1)} />
            </div>
            <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
              <span className="font-semibold">₹{c.price}</span>{' '}
              <span className="line-through text-[var(--hz-ink-subtle)] text-[12px]">₹{c.originalPrice}</span>
            </span>
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>• {c.duration}</span>
            <button
              onClick={() => onRemove(c.cartId)}
              className="self-start text-[12.5px] text-[var(--hz-primary)] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
              style={{ fontFamily: FONT_BODY }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {saved > 0 && (
        <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: '#0F7A3D' }}>
          <span className="text-white shrink-0"><IcoBolt /></span>
          <span className="text-[12.5px] text-white font-medium" style={{ fontFamily: FONT_BODY }}>Congratulations! ₹{saved} saved on this order</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--hz-surface-muted)]">
        <span className="text-[17px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
          ₹{total} <span className="line-through text-[var(--hz-ink-subtle)] text-[13px] font-normal">₹{totalOriginal}</span>
        </span>
        <button
          onClick={onViewCart}
          className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
          style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
        >
          View Cart
        </button>
      </div>
    </div>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────

export default function HoziehelperGoldScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()

  // A finished duration+plan selection now adds to the cart instead of
  // booking immediately — matching the reference's own "Add → item lands
  // in the Cart panel" flow rather than a hand-off per click. Re-adding
  // the exact same tier+duration+plan combo (same cartId) just bumps its
  // quantity, same as the shared cart's own addItem semantics.
  const addToCart = (entry: { cartId: string; title: string; image: string; duration: string; price: number; originalPrice: number }) => {
    addItem({
      cartId: entry.cartId,
      serviceEntry: 'home-services',
      categoryId: 'hoziehelper-gold',
      serviceId: entry.cartId,
      serviceName: entry.title,
      title: entry.title,
      image: entry.image,
      duration: entry.duration,
      price: entry.price,
      originalPrice: entry.originalPrice,
    })
    setExpandedId(null)
  }

  const selectItem = (item: HoziehelperLineItem) => {
    addToCart({
      cartId: item.id,
      title: item.title,
      image: item.image,
      duration: item.duration,
      price: item.price,
      originalPrice: item.originalPrice,
    })
  }

  const selectDurationOption = (item: HoziehelperLineItem, opt: DurationOption) => {
    addToCart({
      cartId: `${item.id}-${opt.id}`,
      title: item.title,
      image: item.image,
      duration: opt.duration,
      price: opt.price,
      originalPrice: opt.originalPrice,
    })
  }

  // The "Later" combo — carries both the chosen duration AND the chosen
  // plan (One time / 3-service pack) in one cart line, unlike
  // selectDurationOption above which only ever carries a duration.
  const selectLaterOption = (item: HoziehelperLineItem, opt: DurationOption, plan: 'onetime' | 'pack') => {
    const packPerService = Math.round(opt.originalPrice * 0.283)
    const price = plan === 'pack' ? packPerService * 3 : opt.price
    const originalPrice = plan === 'pack' ? opt.originalPrice * 3 : opt.originalPrice
    addToCart({
      cartId: `${item.id}-${opt.id}-${plan}`,
      title: item.title,
      image: item.image,
      duration: plan === 'pack' ? `${opt.duration} · 3 services in 1 month` : opt.duration,
      price,
      originalPrice,
    })
  }

  // The Saver Pack's "Later" combo — duration selected from laterOptions,
  // plan is the single fixed pack (`plans[0]`), not a live toggle, so the
  // price added is always that pack's own known packPrice.
  const selectLaterPack = (item: HoziehelperLineItem, opt: DurationOption, plan: SaverPlan) => {
    addToCart({
      cartId: `${item.id}-${opt.id}-pack`,
      title: item.title,
      image: item.image,
      duration: `${opt.duration} · ${plan.label}`,
      price: plan.packPrice,
      originalPrice: plan.packOriginalPrice,
    })
  }

  // Items with real duration options (or the "Later" combo) open the
  // options popup on "Add" instead of adding to the cart immediately.
  // Items with neither keep the original one-click behaviour.
  const handleAdd = (item: HoziehelperLineItem) => {
    if (item.durationOptions || item.laterOptions) {
      setExpandedId(item.id)
      return
    }
    selectItem(item)
  }

  const jumpToSection = (id: HoziehelperSection['id']) => {
    document.getElementById(`hoziehelper-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Hands off to the existing Create Service Request flow — same
  // destination every "Add" used to go to directly before the cart
  // existed. That screen doesn't render per-item tier/price/duration
  // detail (it never did — those hoziehelper_* fields were always just
  // carried along, not displayed), so a multi-line cart hands off the
  // same way a single item always did, just after a real "review your
  // cart" step instead of on the first click.
  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'hoziehelper-gold',
    })
  }

  const expandedItem = SECTIONS.flatMap(s => s.items).find(i => i.id === expandedId) ?? null

  // Total quantity across every cart line that came from this row —
  // regardless of which duration/plan was picked — so the row itself
  // shows a green check the moment anything from it is in the cart.
  const cartCountForItem = (item: HoziehelperLineItem) =>
    cart
      .filter(c => c.cartId === item.id || c.cartId.startsWith(`${item.id}-`))
      .reduce((sum, c) => sum + c.qty, 0)

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar onBack={() => onNavigate('home-services')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="services" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto" style={{ padding: '28px 24px', scrollbarWidth: 'none' }}>
            <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>

              {/* Title + rating */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>HozieHelp</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  HozieHelp Gold
                </h1>
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                  <span className="flex items-center gap-1 text-[var(--hz-primary)] font-semibold"><IcoStar /> 4.8</span> (3.2K bookings)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => (
                    <div key={section.id} id={`hoziehelper-section-${section.id}`} className="flex flex-col" style={{ scrollMarginTop: 230 }}>
                      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                      <div className="flex flex-col gap-3">
                        {section.items.map(item => (
                          <LineItemRow key={item.id} item={item} onSelect={() => handleAdd(item)} cartCount={cartCountForItem(item)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right column — pinned in place on desktop (stays put
                    as the left column's item list scrolls past); on
                    mobile it's a single column so it just stacks in
                    normal flow. `main`, not the window, is the
                    scrolling ancestor (overflow-y-auto), so `sticky`
                    pins relative to it — capped to the viewport height
                    so a long cart never grows taller than the screen.
                    Same pattern as Salon Luxe's own right column. */}
                <div className="flex flex-col gap-4 lg:sticky lg:top-[28px] lg:self-start lg:max-h-[calc(100vh-56px)] lg:overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                  <div className="bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] p-5 flex items-start gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    <div className="flex flex-col gap-2.5 flex-1">
                      <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Houzeify Promise</span>
                      {['Verified Professionals', 'Hassle Free Booking', 'Transparent Pricing'].map(t => (
                        <span key={t} className="flex items-center gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                          <IcoCheck /> {t}
                        </span>
                      ))}
                    </div>
                    <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] flex items-center justify-center shrink-0"><IcoShield /></div>
                  </div>

                  <CartCard cart={cart} onChangeQty={changeCartQty} onRemove={removeFromCart} onViewCart={viewCart} />

                  <div className="bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] px-5 py-4 flex items-center gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    <div className="w-10 h-10 rounded-[12px] bg-[var(--hz-primary-soft)] flex items-center justify-center shrink-0"><HIcon size={24} /></div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Not sure which one?</span>
                      <span className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>Ask Hozie to help you pick.</span>
                    </div>
                    <button
                      onClick={() => onNavigate(DASHBOARD_ROUTES.aiAdvisor)}
                      className="h-8 px-3 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[12px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
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

      {expandedItem && (
        <OptionsModal
          item={expandedItem}
          cart={cart}
          onClose={() => setExpandedId(null)}
          onSelectOption={opt => selectDurationOption(expandedItem, opt)}
          onSelectLater={(opt, plan) => selectLaterOption(expandedItem, opt, plan)}
          onSelectLaterPack={(opt, plan) => selectLaterPack(expandedItem, opt, plan)}
        />
      )}
    </div>
  )
}
