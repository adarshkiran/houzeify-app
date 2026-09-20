// ─── HozieHelp Standard — detail/booking page ───────────────────────────
// Sibling of HoziehelperGoldScreen.tsx, reached from the HozieHelp
// popup's "HozieHelp Standard" row instead of the Gold one — same shape
// (Select-a-service tabs, hero banner, per-section line items, expandable
// options drill-down, sidebar), same reasoning for what's kept/dropped from
// the reference (see that file's own header comment), just Standard's own
// content:
//   - No "Top rated" badge anywhere — the popup never showed one on
//     Standard either, only Gold.
//   - Instant price matches the ₹49/visit the HozieHelp popup already
//     promised for Standard, same "the two screens never disagree" rule
//     Gold's page follows. Multi-day starts at ₹69/day, matching this
//     page's own "Later"/"Multi-day" rows further down.
//   - The two real HozieHelp photos are reused in the opposite pairing
//     from Gold's page (Standard photo leads, Gold photo covers the
//     "Saver Pack" rows) — still only ever these two real assets, never a
//     third invented one.
//   - The Instant row's "7 options" and Multi-day row's "6 options" both
//     expand in place on Add, exactly like Gold's page — a duration/price
//     ladder anchored to THIS row's own starting price (never Gold's
//     numbers), the same task list / excluded list / time breakdown / FAQ
//     / rating breakdown / openly-labelled sample reviews. The rating
//     breakdown below is scaled to sum to this row's own "(410 reviews)"
//     summary figure, never a borrowed or invented total.

import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
import goldImg from '@/imports/Hoziehelper/Hozie Helper Gold.png'
import standardImg from '@/imports/Hoziehelper/Hozie Helper Standard.png'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// Same calm card surface as Salon Luxe/Prime's own line-item rows — a
// subtle white-to-lavender gradient + hairline border, so each service
// reads as its own card instead of a plain divider-separated list row.
const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)',
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#722ED1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5"/></svg>
)
const IcoShield = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="#722ED1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
// these small chips). Same set as Gold's page — the tasks a HozieHelp
// covers don't change by tier.
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
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><path d="M2.5 2.5l10 10M12.5 2.5l-10 10"/></svg>
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
  /** The N behind optionsCount — same duration/price ladder shape Gold's
   *  page uses, scaled to start from THIS row's own price/rating figures
   *  (never Gold's, different numbers for that duration) so the two tiers
   *  never contradict each other. */
  durationOptions?: DurationOption[]
  /** The Saver Pack's subscription option — "N services in a month" at a
   *  further discount, shown as a second "Select a plan" section under
   *  "Select duration", anchored to THIS row's own price/originalPrice —
   *  same shape as Gold's page, never Gold's numbers. */
  plans?: SaverPlan[]
  /** The "Later" row's own combo flow — select a duration, THEN select a
   *  plan, ending in one real "Done" that books the combined choice.
   *  Same two shapes as Gold's page: `laterOptions` alone is a live
   *  "One time" vs. 3-service-pack toggle recomputed off the selected
   *  duration; `laterOptions` + `plans` together (the Saver Pack's Later
   *  row) is duration selection paired with the single, fixed pack from
   *  `plans[0]`, unaffected by which duration is picked. */
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
// cross-screen Customer cart (useCustomerCart, src/data/customerCart.tsx),
// same as Gold's page (see that file's own comment for the full
// reasoning) — no second cart-item type. ─────────────────────────────────

const STANDARD_INSTANT_DURATIONS: DurationOption[] = [
  { id: '30m', duration: '30 mins', rating: '4.65 (110 reviews)', price: 49, originalPrice: 120 },
  { id: '1h', duration: '1 hour', rating: '4.68 (130 reviews)', price: 65, originalPrice: 150 },
  { id: '2h', duration: '2 hours', rating: '4.70 (90 reviews)', price: 89, originalPrice: 200 },
  { id: '2.5h', duration: '2.5 hours', rating: '4.68 (40 reviews)', price: 109, originalPrice: 240 },
  { id: '3h', duration: '3 hours', rating: '4.72 (20 reviews)', price: 129, originalPrice: 280 },
  { id: '4h', duration: '4 hours', rating: '4.65 (10 reviews)', price: 155, originalPrice: 320 },
  { id: 'full-day', duration: 'Full day', rating: '4.60 (5 reviews)', price: 219, originalPrice: 450 },
]

// Multi-day's own 6-option ladder — a recurring-visit plan (more days
// booked at once, a lower per-day rate), anchored to THIS row's own
// ₹69/day, ₹165 original and "4.65" rating rather than Gold's figures,
// same discipline as STANDARD_INSTANT_DURATIONS above.
const STANDARD_MULTIDAY_DURATIONS: DurationOption[] = [
  { id: '3d', duration: '3 days/week', rating: '4.62 (15 reviews)', price: 69, originalPrice: 165 },
  { id: '5d', duration: '5 days/week', rating: '4.64 (18 reviews)', price: 62, originalPrice: 150 },
  { id: '6d', duration: '6 days/week', rating: '4.65 (18 reviews)', price: 59, originalPrice: 145 },
  { id: '15d', duration: '15 days', rating: '4.66 (12 reviews)', price: 55, originalPrice: 135 },
  { id: '30d', duration: '30 days', rating: '4.68 (12 reviews)', price: 49, originalPrice: 120 },
  { id: 'custom', duration: 'Custom plan', rating: '4.60 (10 reviews)', price: 69, originalPrice: 165 },
]

// Saver Pack's own 7-option duration ladder — prices matched exactly to
// the reference screenshot the user shared (45 mins ₹109 → 4 hours ₹569),
// same figures as Gold's page since the Saver Pack is one flat-rate tier
// in the reference, not scaled per Gold/Standard. Original/strike prices
// and per-option ratings aren't visible in that screenshot, so those two
// fields stay this app's own consistent figures.
const STANDARD_SAVER_DURATIONS: DurationOption[] = [
  { id: '45m', duration: '45 mins', rating: '4.65 (140 reviews)', price: 109, originalPrice: 249 },
  { id: '1h', duration: '1 hour', rating: '4.68 (110 reviews)', price: 139, originalPrice: 319 },
  { id: '1.5h', duration: '1.5 hours', rating: '4.70 (90 reviews)', price: 209, originalPrice: 479 },
  { id: '2h', duration: '2 hours', rating: '4.72 (70 reviews)', price: 279, originalPrice: 639 },
  { id: '2.5h', duration: '2.5 hours', rating: '4.74 (50 reviews)', price: 349, originalPrice: 799 },
  { id: '3h', duration: '3 hours', rating: '4.76 (30 reviews)', price: 419, originalPrice: 959 },
  { id: '4h', duration: '4 hours', rating: '4.78 (15 reviews)', price: 569, originalPrice: 1299 },
]

// Saver Pack's subscription plan — prices matched exactly to the
// reference (₹237 pack / ₹807 original, ₹79 / ₹269 per service, 70% off).
const STANDARD_SAVER_PLAN: SaverPlan = {
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
// then pick a plan" flow — same current-price and originalPrice figures
// as Gold's page (this reference doesn't scale duration/plan pricing per
// tier, only the base tier price itself), so the "One time" plan's 60%
// off always checks out for any duration picked, on either tier.
const STANDARD_LATER_DURATIONS: DurationOption[] = [
  { id: '45m', duration: '45 mins', price: 109, originalPrice: 270 },
  { id: '1h', duration: '1 hour', price: 139, originalPrice: 350 },
  { id: '1.5h', duration: '1.5 hours', price: 209, originalPrice: 520 },
  { id: '2h', duration: '2 hours', price: 279, originalPrice: 700 },
  { id: '2.5h', duration: '2.5 hours', price: 349, originalPrice: 870 },
  { id: '3h', duration: '3 hours', price: 419, originalPrice: 1050 },
  { id: '4h', duration: '4 hours', price: 569, originalPrice: 1420 },
]

// ─── Expanded-detail content — same shape as Gold's page (see that file's
// own comment for the full reasoning on what's real vs. openly-placeholder
// here). Task list / time breakdown / cover copy are descriptive chrome,
// safe to reuse as-is since the tasks a HozieHelp covers don't change
// by tier; the rating breakdown below is scaled to sum to this row's own
// "410 reviews" figure instead of Gold's, so it never contradicts the
// summary line already shown above it. The "All reviews" list uses the
// same openly-placeholder cards ("Customer A/B/C", generic "Sample
// review" text) with a visible "Preview data" tag — never real testimony.

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

// Scaled to sum to 410 — this row's own "(410 reviews)" figure — never
// Gold's larger per-star counts.
const RATING_BREAKDOWN = [
  { stars: 5, count: 305 },
  { stars: 4, count: 60 },
  { stars: 3, count: 25 },
  { stars: 2, count: 10 },
  { stars: 1, count: 10 },
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
      { id: 'standard-instant', title: 'HozieHelp Standard', rating: '4.7 (410 reviews)', price: 49, originalPrice: 120, duration: '30 mins', image: standardImg, optionsCount: 7, durationOptions: STANDARD_INSTANT_DURATIONS },
      { id: 'saver-instant', title: 'HozieHelp Saver Pack', rating: '4.6 (290 reviews)', price: 79, originalPrice: 269, duration: '45 mins', image: goldImg, optionsCount: 7, durationOptions: STANDARD_SAVER_DURATIONS, plans: [STANDARD_SAVER_PLAN] },
    ],
  },
  {
    id: 'later',
    label: 'Later',
    items: [
      { id: 'standard-later', title: 'HozieHelp Standard', rating: '4.7 (410 reviews)', price: 59, originalPrice: 140, duration: '40 mins', image: standardImg, optionsCount: 7, laterOptions: STANDARD_LATER_DURATIONS },
      { id: 'saver-later', title: 'HozieHelp Saver Pack', rating: '4.6 (290 reviews)', price: 49, originalPrice: 120, duration: '30 mins', image: goldImg, optionsCount: 7, laterOptions: STANDARD_SAVER_DURATIONS, plans: [STANDARD_SAVER_PLAN] },
    ],
  },
  {
    id: 'multiday',
    label: 'Multi-day',
    items: [
      { id: 'standard-multiday', title: 'HozieHelp Standard — Multi-Day', rating: '4.65 (95 reviews)', price: 69, originalPrice: 165, duration: 'per day', image: standardImg, optionsCount: 6, durationOptions: STANDARD_MULTIDAY_DURATIONS },
    ],
  },
]

// ─── Chrome — same shell shape as HomeServicesScreen.tsx / HoziehelperGoldScreen.tsx ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>HozieHelp Standard</span>
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
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>HozieHelp Standard</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'hoziehelper-standard' })}
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
    <div className="bg-white/70 backdrop-blur-md border border-[#E3DDD7] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[#9A949D] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      <div className="flex gap-3">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0"
          >
            <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[#E3DDD7]">
              <img src={s.items[0].image} alt={s.label} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
            </div>
            <span className="text-[12px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{s.label}</span>
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
      style={{ maxWidth: 990, height: 300, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="absolute inset-0 flex items-center px-5 sm:px-10 lg:px-12">
        <h2 className="text-[22px] sm:text-[32px] lg:text-[40px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[150px] sm:max-w-[420px]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          Everyday help.<br />Honest pricing.
        </h2>
      </div>
      <img
        src={standardImg}
        alt="HozieHelp Standard"
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
        {/* Green check badge — this tier already has at least one line in
            the cart, same as Gold's page. */}
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
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
          <span className="flex items-center gap-1 text-[#722ED1] font-semibold"><IcoStar /> {item.rating}</span>
        </span>
        <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
          Starts at <span className="font-semibold">₹{item.price}</span>{' '}
          <span className="line-through text-[#9A949D]">₹{item.originalPrice}</span>
          <span className="flex items-center gap-1 text-[#68636D] mt-0.5"><IcoClock /> {item.duration}</span>
        </span>
      </div>
      <div className="shrink-0 flex flex-col items-center gap-1.5">
        <button
          onClick={onSelect}
          className={
            cartCount
              ? 'h-9 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0'
              : 'h-9 px-5 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[13px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white'
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
            <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} options</span>
          )
        )}
      </div>
    </div>
  )
}

// ─── Options row — the "N options" drill-down, horizontally scrollable
// with side arrows that scroll the row rather than paginate it. ─────────

function OptionsRow({ options, onSelect, isInCart }: { options: DurationOption[]; onSelect: (opt: DurationOption) => void; isInCart?: (opt: DurationOption) => number }) {
  const scrollerId = 'hoziehelper-standard-options-scroller'
  const scrollByCard = (dir: 1 | -1) => {
    const el = document.getElementById(scrollerId)
    el?.scrollBy({ left: dir * 190, behavior: 'smooth' })
  }
  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => scrollByCard(-1)}
        aria-label="Scroll options left"
        className="hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#722ED1] hover:text-[#722ED1] transition-all cursor-pointer"
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
              <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{opt.duration}</span>
              <span className="flex items-center gap-1 text-[11.5px] text-[#722ED1] font-semibold" style={{ fontFamily: FONT_BODY }}><IcoStar size={10} /> {opt.rating}</span>
              <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                ₹{opt.price} <span className="line-through text-[#9A949D]">₹{opt.originalPrice}</span>
              </span>
              <button
                onClick={() => onSelect(opt)}
                className="h-8 rounded-[8px] border border-[#E3DDD7] text-[#722ED1] text-[12.5px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white"
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
        className="hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#722ED1] hover:text-[#722ED1] transition-all cursor-pointer"
      >
        <IcoChevronRight />
      </button>
    </div>
  )
}

// ─── Saver Pack's subscription plan card — same as Gold's page: shown,
// pre-selected (purple border), only for rows that carry a `plans` entry.
// Informational only — the actual booking action stays the "Add" buttons
// on the duration cards above. ───────────────────────────────────────────

function PlanCard({ plan }: { plan: SaverPlan }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5 rounded-[14px] p-4" style={{ width: 200, border: '2px solid #722ED1', backgroundColor: '#F9F5FF' }}>
        <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{plan.label}</span>
        <span className="text-[15px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
          <span className="font-semibold">₹{plan.packPrice}</span>{' '}
          <span className="line-through text-[#9A949D] text-[12.5px]">₹{plan.packOriginalPrice}</span>
        </span>
        <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>₹{plan.perServicePrice}/service</span>
        <span
          className="inline-flex items-center gap-1 self-start text-[11px] font-semibold px-2 py-[3px] rounded-full"
          style={{ backgroundColor: '#E9FBEF', color: '#1E8E3E', fontFamily: FONT_BODY }}
        >
          <IcoBolt /> {plan.discountPct}% off
        </span>
      </div>
      <span className="flex items-center gap-2 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
        <span className="w-4 h-4 rounded-full border border-[#9A949D] flex items-center justify-center shrink-0 text-[10px]">i</span>
        Get a pack & pay just ₹{plan.perServicePrice}{' '}
        <span className="line-through">₹{plan.perServiceOriginalPrice}</span> per service
      </span>
    </div>
  )
}

// ─── "Later" combo selector — a duration row and a plan row, BOTH
// clickable-to-select (no "Add" per card), same as Gold's page. ─────────

function SelectableDurationRow({ options, selectedId, onSelect }: { options: DurationOption[]; selectedId: string; onSelect: (id: string) => void }) {
  const scrollerId = 'hoziehelper-standard-later-scroller'
  const scrollByCard = (dir: 1 | -1) => {
    document.getElementById(scrollerId)?.scrollBy({ left: dir * 150, behavior: 'smooth' })
  }
  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => scrollByCard(-1)}
        aria-label="Scroll durations left"
        className="hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#722ED1] hover:text-[#722ED1] transition-all cursor-pointer"
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
              style={{ width: 132, border: active ? '2px solid #722ED1' : '1px solid #E3DDD7', backgroundColor: active ? '#F3EAFF' : '#FFFFFF' }}
            >
              <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{opt.duration}</span>
              <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>₹{opt.price}</span>
            </button>
          )
        })}
      </div>
      <button
        onClick={() => scrollByCard(1)}
        aria-label="Scroll durations right"
        className="hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#722ED1] hover:text-[#722ED1] transition-all cursor-pointer"
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
      style={{ width: 190, border: active ? '2px solid #722ED1' : '1px solid #E3DDD7', backgroundColor: active ? '#F9F5FF' : '#FFFFFF' }}
    >
      <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{label}</span>
      {sublabel && <span className="text-[12px] text-[#68636D] -mt-1" style={{ fontFamily: FONT_BODY }}>{sublabel}</span>}
      <span className="text-[15px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
        <span className="font-semibold">₹{price}</span>{' '}
        <span className="line-through text-[#9A949D] text-[12.5px]">₹{originalPrice}</span>
      </span>
      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>₹{perService}/service</span>
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
    <div className="border-b border-[#F4F0EC] last:border-b-0 py-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer border-0 bg-transparent p-0"
      >
        <span className="text-[13.5px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>{q}</span>
        <span className={`shrink-0 text-[#9A949D] transition-transform ${open ? 'rotate-180' : ''}`}><IcoChevronDown /></span>
      </button>
      {open && <p className="text-[13px] text-[#68636D] leading-[1.55] mt-2 mb-0" style={{ fontFamily: FONT_BODY }}>{a}</p>}
    </div>
  )
}

// ─── Options modal — the "N options" drill-down opens as a centred popup
// over the page (backdrop click / ✕ both close it), same as Gold's page.

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
  const [laterId, setLaterId] = useState(item.laterOptions?.[0]?.id ?? null)
  const [laterPlan, setLaterPlan] = useState<'onetime' | 'pack'>('pack')
  const laterSelected = item.laterOptions?.find(o => o.id === laterId) ?? item.laterOptions?.[0] ?? null
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
        className="w-full flex flex-col bg-white rounded-[20px] overflow-hidden"
        style={{ maxWidth: 760, maxHeight: '88vh', boxShadow: '0 20px 60px rgba(0,0,0,0.28)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F4F0EC] shrink-0">
          <div className="w-12 h-12 rounded-[10px] overflow-hidden shrink-0">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" style={{ objectPosition: '50% 15%' }} />
          </div>
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
            <span className="text-[15px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            <span className="flex items-center gap-1 text-[12px] text-[#722ED1] font-semibold" style={{ fontFamily: FONT_BODY }}><IcoStar size={10} /> {item.rating}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent"
          >
            <IcoCloseX />
          </button>
        </div>

        {/* Body — one scrollable panel, minimal scrollbar */}
        <div className="flex flex-col gap-6 px-6 py-5 overflow-y-auto scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E3DDD7 transparent' }}>
          {item.laterOptions && laterSelected && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Select requirements</h3>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D] font-semibold" style={{ fontFamily: FONT_MONO }}>Select duration</span>
                <SelectableDurationRow options={item.laterOptions} selectedId={laterSelected.id} onSelect={setLaterId} />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a plan</span>
                {item.plans ? (
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
                    <span className="flex items-center gap-2 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                      <span className="w-4 h-4 rounded-full border border-[#9A949D] flex items-center justify-center shrink-0 text-[10px]">i</span>
                      Get a pack & pay just ₹{packPerService} <span className="line-through">₹{laterSelected.originalPrice}</span> per service
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {item.durationOptions && (
            <div className="flex flex-col gap-4">
              {item.plans && <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Select requirements</h3>}

              <div className="flex flex-col gap-2">
                {item.plans && <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D] font-semibold" style={{ fontFamily: FONT_MONO }}>Select duration</span>}
                <OptionsRow options={item.durationOptions} onSelect={onSelectOption} isInCart={opt => cartQtyFor(`${item.id}-${opt.id}`)} />
              </div>

              {item.plans && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a plan</span>
                  <PlanCard plan={item.plans[0]} />
                </div>
              )}
            </div>
          )}

          {/* One help who can do it all + What's excluded, side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 pt-6 border-t border-[#F4F0EC]">
          <div className="flex flex-col gap-3">
            <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>One help who can do it all</h3>
            <div className="grid grid-cols-3 gap-2.5">
              {TASK_LIST.map(t => (
                <div key={t.id} className="flex flex-col gap-1.5 items-center text-center">
                  <div className="w-11 h-11 rounded-[10px] bg-[#F4F0EC] flex items-center justify-center text-[#68636D] [&_svg]:w-[16px] [&_svg]:h-[16px]">{t.icon}</div>
                  <span className="text-[11px] text-[#242326] leading-tight" style={{ fontFamily: FONT_BODY }}>{t.label}</span>
                </div>
              ))}
            </div>
            <span className="flex items-center gap-2 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
              <span className="w-4 h-4 rounded-full border border-[#9A949D] flex items-center justify-center shrink-0 text-[10px]">i</span>
              Please provide cleaning equipment & supplies to the help
            </span>
          </div>

          <div className="flex flex-col rounded-[14px] border border-[#E3DDD7] p-4 h-fit" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <span className="text-[13.5px] font-semibold text-[#242326] mb-2" style={{ fontFamily: FONT_HEAD }}>What&apos;s excluded</span>
            {EXCLUDED_LIST.map(x => (
              <span key={x} className="flex items-center gap-2 text-[13px] text-[#242326] py-1.5" style={{ fontFamily: FONT_BODY }}>
                <IcoCross /> {x}
              </span>
            ))}
          </div>
        </div>

        {/* How long does it take? */}
        <div className="flex flex-col gap-3 pt-6 border-t border-[#F4F0EC]">
          <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>How long does it take?</h3>
            <p className="text-[12.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>These are approximate times for a 3BHK home — you can ask the help to customise as per your need.</p>
          </div>
          <div className="flex flex-col">
            {TIME_BREAKDOWN.map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-[#F4F0EC] last:border-b-0">
                <span className="w-8 h-8 rounded-[8px] bg-[#F4F0EC] flex items-center justify-center text-[#68636D] shrink-0">{t.icon}</span>
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{t.label}</span>
                  <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{t.note}</span>
                </span>
                <span className="text-[13px] text-[#242326] font-medium shrink-0" style={{ fontFamily: FONT_BODY }}>{t.minutes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Houzeify Cover */}
        <div className="flex items-center gap-3 rounded-[14px] border border-[#E3DDD7] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <div className="w-11 h-11 rounded-full bg-[#F3EAFF] flex items-center justify-center shrink-0"><IcoShield size={22} /></div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Stay stress-free with Houzeify Cover</span>
            <span className="text-[12px] text-[#68636D] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>Up to ₹10,000 cover if any damage happens during the job.</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="flex flex-col rounded-[14px] border border-[#E3DDD7] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <span className="text-[13.5px] font-semibold text-[#242326] mb-1" style={{ fontFamily: FONT_HEAD }}>Frequently asked questions</span>
          {FAQS.map((f, i) => <FaqRow key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
        </div>

        {/* Rating summary */}
        <div className="flex flex-col gap-3 rounded-[14px] border border-[#E3DDD7] p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)', maxWidth: 480 }}>
          <span className="flex items-center gap-2 text-[28px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
            <IcoStar size={22} /> 4.70
          </span>
          <div className="flex flex-col gap-1.5">
            {RATING_BREAKDOWN.map(r => (
              <div key={r.stars} className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11.5px] text-[#68636D] shrink-0" style={{ fontFamily: FONT_BODY, width: 28 }}><IcoStar size={10} />{r.stars}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[#F4F0EC] overflow-hidden">
                  <div className="h-full bg-[#722ED1] rounded-full" style={{ width: `${(r.count / totalReviews) * 100}%` }} />
                </div>
                <span className="text-[11.5px] text-[#9A949D] shrink-0" style={{ fontFamily: FONT_BODY, width: 32, textAlign: 'right' }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All reviews — openly placeholder, tagged as such, never
            presented as if it were real customer feedback. */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>All reviews</h3>
            <span
              className="text-[10.5px] tracking-[0.04em] uppercase font-semibold px-2 py-[3px] rounded-full text-[#68636D]"
              style={{ fontFamily: FONT_MONO, backgroundColor: '#F4F0EC' }}
            >
              Preview data — not a real review
            </span>
          </div>
          <div className="flex flex-col">
            {SAMPLE_REVIEWS.map((r, i) => (
              <div key={r.id} className={`flex flex-col gap-1.5 py-4 ${i > 0 ? 'border-t border-[#F4F0EC]' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{r.name}</span>
                  <span className="flex items-center gap-1 text-[12px] text-[#722ED1] font-semibold shrink-0"><IcoStar size={11} /> {r.stars}</span>
                </div>
                <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Sticky footer — only for rows with a plan but no laterOptions
            (the Saver Pack's Instant row): a summary of the pre-selected
            pack + a "Done" button. Same as Gold's page — Done just closes
            the popup, no real cart to hand a pack selection off to. The
            Saver Pack's Later row has both `plans` and `laterOptions` —
            its footer is the dedicated branch further below. */}
        {item.plans && !item.laterOptions && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[#F4F0EC] shrink-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-[19px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
                ₹{item.plans[0].packPrice}{' '}
                <span className="line-through text-[#9A949D] text-[14px] font-normal">₹{item.plans[0].packOriginalPrice}</span>
              </span>
              <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{item.plans[0].servicesCount} services</span>
            </div>
            <button
              onClick={onClose}
              className="h-11 px-8 rounded-[12px] bg-[#722ED1] text-white text-[14.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              Done
            </button>
          </div>
        )}

        {/* Sticky footer — the Saver Pack's "Later" row: duration is real
            (it sets what gets booked), plan is the single fixed pack. */}
        {item.laterOptions && laterSelected && item.plans && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[#F4F0EC] shrink-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-[19px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
                ₹{item.plans[0].packPrice}{' '}
                <span className="line-through text-[#9A949D] text-[14px] font-normal">₹{item.plans[0].packOriginalPrice}</span>
              </span>
              <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{item.plans[0].servicesCount} services</span>
            </div>
            <button
              onClick={() => onSelectLaterPack(laterSelected, item.plans![0])}
              className="h-11 px-8 rounded-[12px] bg-[#722ED1] text-white text-[14.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              Done
            </button>
          </div>
        )}

        {/* Sticky footer — the plain Later row's dual-plan combo. */}
        {item.laterOptions && laterSelected && !item.plans && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[#F4F0EC] shrink-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-[19px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
                ₹{laterPlan === 'pack' ? packTotal : laterSelected.price}{' '}
                <span className="line-through text-[#9A949D] text-[14px] font-normal">
                  ₹{laterPlan === 'pack' ? packOriginalTotal : laterSelected.originalPrice}
                </span>
              </span>
              <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                {laterPlan === 'pack' ? '3 services' : '1 service'}
              </span>
            </div>
            <button
              onClick={() => onSelectLater(laterSelected, laterPlan)}
              className="h-11 px-8 rounded-[12px] bg-[#722ED1] text-white text-[14.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
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

// ─── Cart panel — right column, below Houzeify Promise. Same as Gold's
// page. Hidden entirely when empty. ──────────────────────────────────────

function CartStepper({ qty, onDecrement, onIncrement }: { qty: number; onDecrement: () => void; onIncrement: () => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[10px] border border-[#722ED1] shrink-0">
      <button
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className="w-7 h-7 flex items-center justify-center text-[#722ED1] text-[16px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all border-0 bg-transparent rounded-l-[9px]"
      >
        −
      </button>
      <span className="text-[13px] font-semibold text-[#242326] w-3 text-center" style={{ fontFamily: FONT_BODY }}>{qty}</span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="w-7 h-7 flex items-center justify-center text-[#722ED1] text-[16px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all border-0 bg-transparent rounded-r-[9px]"
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
    <div className="bg-white border border-[#E3DDD7] rounded-[16px] p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Cart</span>

      <div className="flex flex-col">
        {cart.map((c, i) => (
          <div key={c.cartId} className={`flex flex-col gap-2 py-3 ${i > 0 ? 'border-t border-[#F4F0EC]' : 'pt-0'}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{c.title}</span>
              <CartStepper qty={c.qty} onDecrement={() => onChangeQty(c.cartId, -1)} onIncrement={() => onChangeQty(c.cartId, 1)} />
            </div>
            <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
              <span className="font-semibold">₹{c.price}</span>{' '}
              <span className="line-through text-[#9A949D] text-[12px]">₹{c.originalPrice}</span>
            </span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>• {c.duration}</span>
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

      {saved > 0 && (
        <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: '#0F7A3D' }}>
          <span className="text-white shrink-0"><IcoBolt /></span>
          <span className="text-[12.5px] text-white font-medium" style={{ fontFamily: FONT_BODY }}>Congratulations! ₹{saved} saved on this order</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F4F0EC]">
        <span className="text-[17px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
          ₹{total} <span className="line-through text-[#9A949D] text-[13px] font-normal">₹{totalOriginal}</span>
        </span>
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

// ─── Main screen ────────────────────────────────────────────────────────

export default function HoziehelperStandardScreen({
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
  // booking immediately — same as Gold's page, using the shared cart's
  // own addItem semantics.
  const addToCart = (entry: { cartId: string; title: string; image: string; duration: string; price: number; originalPrice: number }) => {
    addItem({
      cartId: entry.cartId,
      serviceEntry: 'home-services',
      categoryId: 'hoziehelper-standard',
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
  // plan (One time / 3-service pack) in one cart line, same as Gold's page.
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
  // plan is the single fixed pack (`plans[0]`).
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
  // options popup on "Add" — matching Gold's page — instead of adding to
  // the cart immediately. Items with neither keep the original one-click
  // behaviour.
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

  // Hands off to the existing Create Service Request flow — same as
  // Gold's page.
  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'hoziehelper-standard',
    })
  }

  const expandedItem = SECTIONS.flatMap(s => s.items).find(i => i.id === expandedId) ?? null

  // Total quantity across every cart line that came from this row — same
  // as Gold's page.
  const cartCountForItem = (item: HoziehelperLineItem) =>
    cart
      .filter(c => c.cartId === item.id || c.cartId.startsWith(`${item.id}-`))
      .reduce((sum, c) => sum + c.qty, 0)

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('home-services')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="services" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto" style={{ padding: '28px 24px', scrollbarWidth: 'none' }}>
            <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>

              {/* Title + rating */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>HozieHelp</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  HozieHelp Standard
                </h1>
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                  <span className="flex items-center gap-1 text-[#722ED1] font-semibold"><IcoStar /> 4.7</span> (2.1K bookings)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => (
                    <div key={section.id} id={`hoziehelper-section-${section.id}`} className="flex flex-col" style={{ scrollMarginTop: 230 }}>
                      <h2 className="text-[19px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
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
