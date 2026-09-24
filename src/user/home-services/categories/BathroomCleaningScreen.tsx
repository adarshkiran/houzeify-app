// ─── Bathroom Cleaning — Cleaning & Pest Control → Cleaning → Bathroom
// Cleaning ───────────────────────────────────────────────────────────
//
// Built from a real-page reference PDF the user supplied (UB-BR12) —
// used for its "Select a service" catalogue (4 sections: 3-visit
// packs, Value deals, One time deep clean, Mini services) and every
// service's own rating/reviews/price/original price/duration/
// description, taken as given. Values the reference didn't show are
// never invented — simply omitted. A "Add more & save up to X%" line
// under a few items is a real bundle upsell the reference shows, kept
// as a plain note rather than built into a bespoke packs feature this
// page doesn't otherwise have. Three items ("3 sessions (Mon-Fri
// only)…", "3 sessions (All Days)…", "Ceiling fan cleaning") show only
// a "6 options" count in the reference — the real variants sit behind
// a click this single-page capture doesn't reach — so they keep the
// same "N options available" placeholder hint (Select button, base
// price on Add) every other page in this app uses until real option
// data is supplied.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell. "Intense bathroom cleaning" (One time deep clean) is the
// reference's own real "BESTSELLER" tag, shown here with the same gold
// "★ Bestseller" pill every other page already uses. The two "N
// BATHROOMS" and "Extra 30 mins" tags are shown as small dark corner
// badges — a new but minimal badge treatment, since neither the gold
// bestseller pill nor the green discount tag fit their meaning.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own page-level aggregate rating/"earliest slot" header,
// its own real cleaning-crew marketing video, footer, brand promise
// card, and whatever was in its own cart at capture time.
//
// Honesty note: no real cleaning photography exists in this project,
// so every image slot uses this app's own icon-on-gradient placeholder
// pattern, same as every sibling screen.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

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
const IcoCheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.3L5.3 10L11.5 3.5" />
  </svg>
)
const IcoBolt = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M6.5 0.5L1.5 7h3.2l-.8 4.5L9.5 5H6.3l.2-4.5Z" /></svg>
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
const IcoToiletBrush = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8.5c0-2.2 1.8-4 4-4s4 1.8 4 4v1.5a4.5 4.5 0 01-4.5 4.5H10a4 4 0 01-4-4V8.5Z" />
    <path d="M8 17.5h4M10 14.5v3" />
  </svg>
)
const IcoScrubMachine = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="7" r="3.5" />
    <path d="M10 10.5v3M7.5 17.5h5M12 13.5l3-3M12.7 15.6l2.6-1.4" />
  </svg>
)
const IcoDeepClean = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2.5s-2.5 3.2-2.5 6a2.5 2.5 0 005 0c0-2.8-2.5-6-2.5-6Z" />
    <path d="M3.5 13h13M5 16h10" />
  </svg>
)
const IcoMiniServices = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="6.5" r="3" />
    <circle cx="13.5" cy="13.5" r="3" />
    <path d="M8.6 8.6l2.8 2.8" />
  </svg>
)
const IcoFan = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="1.4" />
    <path d="M10 8.8C8.5 5.5 9 3 10 2c1.5 1.5 2 4 0 6.8ZM11.2 10c3.3-1.5 5.8-1 6.8 0-1.5 1.5-4 2-6.8 0ZM10 11.2c1.5 3.3 1 5.8 0 6.8-1.5-1.5-2-4 0-6.8ZM8.8 10C5.5 11.5 3 11 2 10c1.5-1.5 4-2 6.8 0Z" />
  </svg>
)
const IcoMirror = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="2.5" width="11" height="13" rx="1.5" />
    <path d="M7.5 17.5h5" />
  </svg>
)
const IcoDoor = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="10" height="16" rx="1" />
    <circle cx="12" cy="10" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)
const IcoWashbasin = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h14" />
    <path d="M4 9a6 6 0 0012 0" />
    <path d="M10 9V3M10 3l-1.5 1.5M10 3l1.5 1.5" />
    <path d="M8 17.5h4" />
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

interface CleaningItem {
  id: string
  title: string
  section: 'value-deals' | 'one-time-deep-clean' | 'mini-services'
  bestseller?: boolean
  cornerBadge?: { label: string; color: string }
  rating: string
  price: number
  priceLabel?: 'starts-at'
  originalPrice?: number
  durationMin?: number
  description?: string
  note?: string
  optionsCount?: number
  options?: CleaningItemOption[]
  icon: React.ReactNode
}
// A real, concrete sub-option — e.g. "3 Bathrooms" under a 3-visit pack,
// or "3 Ceiling fans" under Ceiling fan cleaning — each with its own
// real rating/price/original price, taken from a reference screenshot
// the user supplied.
interface CleaningItemOption {
  id: string
  label: string
  price: number
  originalPrice?: number
  rating?: string
}
interface CleaningPackage {
  id: string
  name: string
  itemTitle: string
  rating: string
  price: number
  originalPrice: number
  note?: string
  includes: string[]
  options: CleaningItemOption[]
  /** The real "Get ₹X off" headline shown at the top of this pack's own
   *  options picker in the reference — a different, real framing of the
   *  same discount from the row's own "Add more & save up to X%" note,
   *  not a duplicate of it. */
  pickerNote: string
  /** Same bathroom-cleaning icon used for the "3-visit packs" jump chip —
   *  these packs don't have their own photo, so the options picker (which
   *  needs one icon per option row, same as every line-item's own picker)
   *  reuses it rather than going icon-less. */
  icon: React.ReactNode
}

const BATHROOM_PACKAGES: CleaningPackage[] = [
  {
    id: 'bc-pkg-3visit-weekdays', name: 'Bathroom cleaning pack (Weekdays only)', itemTitle: '3 sessions (Mon-Fri only): Intense bathroom cleaning', rating: '4.80 (7M reviews)', price: 1287, originalPrice: 1587, note: 'Add more & save up to 9%', pickerNote: 'Get ₹300 off', icon: <IcoToiletBrush />,
    includes: ['Book 3 visits intense bathroom cleaning at discounted price', 'Avail first visit now & remaining within 6 months'],
    options: [
      { id: 'bc-pkg-weekdays-1bath', label: '1 Bathroom', price: 1287, originalPrice: 1587, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-weekdays-2bath', label: '2 Bathrooms', price: 2334, originalPrice: 3174, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-weekdays-3bath', label: '3 Bathrooms', price: 3411, originalPrice: 4761, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-weekdays-4bath', label: '4 Bathrooms', price: 4548, originalPrice: 6348, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-weekdays-5bath', label: '5 Bathrooms', price: 5685, originalPrice: 7935, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-weekdays-6bath', label: '6 Bathrooms', price: 6822, originalPrice: 9522, rating: '4.80 (7M reviews)' },
    ],
  },
  {
    id: 'bc-pkg-3visit-alldays', name: 'Bathroom cleaning pack (All days)', itemTitle: '3 sessions (All Days): Intense bathroom cleaning', rating: '4.80 (7M reviews)', price: 1512, originalPrice: 1587, note: 'Add more & save up to 9%', pickerNote: 'Get ₹75 off', icon: <IcoToiletBrush />,
    includes: ['Book 3 visits intense bathroom cleaning at discounted price', 'Avail first visit now & remaining within 6 months'],
    options: [
      { id: 'bc-pkg-alldays-1bath', label: '1 Bathroom', price: 1512, originalPrice: 1587, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-alldays-2bath', label: '2 Bathrooms', price: 2784, originalPrice: 3174, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-alldays-3bath', label: '3 Bathrooms', price: 4086, originalPrice: 4761, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-alldays-4bath', label: '4 Bathrooms', price: 5448, originalPrice: 6348, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-alldays-5bath', label: '5 Bathrooms', price: 6810, originalPrice: 7935, rating: '4.80 (7M reviews)' },
      { id: 'bc-pkg-alldays-6bath', label: '6 Bathrooms', price: 8172, originalPrice: 9522, rating: '4.80 (7M reviews)' },
    ],
  },
]

const CLEANING_ITEMS: CleaningItem[] = [
  // ── Value deals ──
  { id: 'bc-intense-2bath', title: 'Intense cleaning (2 bathroom)', section: 'value-deals', cornerBadge: { label: '2 BATHROOMS', color: '#242326' }, rating: '4.80 (7M reviews)', price: 978, originalPrice: 1058, durationMin: 120, description: 'Floor & tile cleaning with a scrub machine', note: '₹489 per bathroom', icon: <IcoScrubMachine /> },
  { id: 'bc-intense-3bath', title: 'Intense cleaning (3 bathroom)', section: 'value-deals', cornerBadge: { label: '3 BATHROOMS', color: '#242326' }, rating: '4.80 (7M reviews)', price: 1437, originalPrice: 1587, durationMin: 180, description: 'Floor & tile cleaning with a scrub machine', note: '₹479 per bathroom', icon: <IcoScrubMachine /> },
  { id: 'bc-intense-bath-fan-pack2', title: 'Intense Bathroom & ceiling fan cleaning (pack of 2)', section: 'value-deals', rating: '4.80 (7M reviews)', price: 1176, originalPrice: 1256, durationMin: 140, description: 'Includes 2 intense bathroom & 2 ceiling fans cleaning', icon: <IcoScrubMachine /> },

  // ── One time deep clean ──
  { id: 'bc-intense-bathroom-cleaning', title: 'Intense bathroom cleaning', section: 'one-time-deep-clean', bestseller: true, rating: '4.81 (7.4M reviews)', price: 529, priceLabel: 'starts-at', durationMin: 60, description: 'Floor & tile cleaning with scrubbing machine', note: 'Recommended for deep-cleaning and tough stains', icon: <IcoDeepClean /> },
  { id: 'bc-move-in-cleaning', title: 'Move-in bathroom cleaning', section: 'one-time-deep-clean', cornerBadge: { label: 'Extra 30 mins', color: '#0F7A3D' }, rating: '4.82 (1.6M reviews)', price: 599, priceLabel: 'starts-at', durationMin: 90, description: 'Extra 30 mins of machine scrubbing of floor and tiles', note: 'Recommended before moving into a new or unused bathroom', icon: <IcoDeepClean /> },

  // ── Mini services ──
  { id: 'bc-exhaust-fan-additional', title: 'Bathroom exhaust fan cleaning (additional)', section: 'mini-services', rating: '4.79 (115K reviews)', price: 129, durationMin: 15, description: 'Additional, one fan is already covered in bathroom service', icon: <IcoFan /> },
  { id: 'bc-door-cleaning', title: 'Door cleaning (upto 1)', section: 'mini-services', rating: '4.79 (44K reviews)', price: 89, durationMin: 10, description: 'Additional, bathroom door is covered in bathroom service', icon: <IcoDoor /> },
  { id: 'bc-mirror-cleaning', title: 'Mirror cleaning (upto 1)', section: 'mini-services', rating: '4.83 (51K reviews)', price: 59, durationMin: 10, description: 'Additional, one mirror is already covered in bathroom service', icon: <IcoMirror /> },
  { id: 'bc-washbasin-cleaning', title: 'Washbasin cleaning (additional)', section: 'mini-services', rating: '4.86 (8K reviews)', price: 89, durationMin: 10, description: 'Additional, one washbasin is already covered in bathroom service', icon: <IcoWashbasin /> },
  {
    id: 'bc-ceiling-fan-cleaning', title: 'Ceiling fan cleaning', section: 'mini-services', rating: '4.87 (74K reviews)', price: 99, priceLabel: 'starts-at', description: 'Not covered in bathroom service', note: 'Add more & save up to 51%', icon: <IcoFan />,
    options: [
      { id: 'bc-fan-1', label: '1 Ceiling fan', price: 99, rating: '4.87 (74K reviews)' },
      { id: 'bc-fan-2', label: '2 Ceiling fans', price: 198, rating: '4.87 (74K reviews)' },
      { id: 'bc-fan-3', label: '3 Ceiling fans', price: 297, rating: '4.87 (74K reviews)' },
      { id: 'bc-fan-4', label: '4 Ceiling fans', price: 396, rating: '4.87 (74K reviews)' },
      { id: 'bc-fan-5', label: '5 Ceiling fans', price: 495, rating: '4.87 (74K reviews)' },
      { id: 'bc-fan-6', label: '6 Ceiling fans', price: 594, rating: '4.87 (74K reviews)' },
    ],
  },
]

const SECTIONS: { id: CleaningItem['section']; label: string; icon: React.ReactNode }[] = [
  { id: 'value-deals', label: 'Value deals', icon: <IcoToiletBrush /> },
  { id: 'one-time-deep-clean', label: 'One time deep clean', icon: <IcoDeepClean /> },
  { id: 'mini-services', label: 'Mini services', icon: <IcoMiniServices /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<CleaningItem['section'], { title: string; subtitle: string }> = {
  'value-deals': { title: 'More bathrooms, better value', subtitle: 'Multi-bathroom cleaning packs at a lower per-bathroom price.' },
  'one-time-deep-clean': { title: 'A deep clean, done once', subtitle: 'Intense scrub-machine cleaning for tough stains and move-ins.' },
  'mini-services': { title: 'Extra touches for your bathroom', subtitle: 'Add-on cleaning for fans, doors, mirrors & more.' },
}

function getCleaningItem(id: string): CleaningItem {
  const item = CLEANING_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Bathroom Cleaning item id: ${id}`)
  return item
}
function getCleaningPackage(id: string): CleaningPackage {
  const pkg = BATHROOM_PACKAGES.find(p => p.id === id)
  if (!pkg) throw new Error(`Unknown Bathroom Cleaning package id: ${id}`)
  return pkg
}
/** A single lookup point for "what has options" — a package or a line
 *  item — so one OptionsModal can serve both without knowing which. */
function getOptionsSource(id: string): { title: string; rating: string; options: CleaningItemOption[]; pickerNote?: string; icon: React.ReactNode } {
  const pkg = BATHROOM_PACKAGES.find(p => p.id === id)
  if (pkg) return { title: pkg.name, rating: pkg.rating, options: pkg.options, pickerNote: pkg.pickerNote, icon: pkg.icon }
  const item = getCleaningItem(id)
  return { title: item.title, rating: item.rating, options: item.options ?? [], icon: item.icon }
}

interface Addable {
  id: string
  title: string
  price: number
  originalPrice?: number
  durationMin?: number
  /** The underlying service's own id, when this Addable represents one
   *  specific option of it (id is the OPTION's id in that case) — falls
   *  back to `id` itself for a plain, option-less add. */
  serviceId?: string
  optionId?: string
  optionName?: string
}

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Bathroom Cleaning</span>
      </div>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBell /></button>
    </div>
  )
}

function TopHeader({ onNavigate }: { onNavigate: (s: string, data?: Record<string, string>) => void }) {
  // Profile is already reachable from the Sidebar's own "Profile" item, so
  // this header slot carries the Cart instead — a real, live count from the
  // one shared Customer cart, not a decorative icon.
  const { itemCount } = useCustomerCart()
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#E3DDD7]">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('home-services')} aria-label="Back to Services" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent"><IcoBack /></button>
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Bathroom Cleaning</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'bathroom-cleaning' })}
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
        <button
          onClick={() => onJump('packs')}
          className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0 shrink-0 w-[76px]"
        >
          <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[#E3DDD7] flex items-center justify-center bg-[#F9F5FF] text-[#722ED1] shrink-0"><IcoToiletBrush /></div>
          <span className="text-[12px] text-[#242326] text-center leading-tight" style={{ fontFamily: FONT_BODY }}>3-visit packs</span>
        </button>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0 shrink-0 w-[76px]"
          >
            <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[#E3DDD7] flex items-center justify-center bg-[#F9F5FF] text-[#722ED1] shrink-0">
              {s.icon}
            </div>
            <span className="text-[12px] text-[#242326] text-center leading-tight" style={{ fontFamily: FONT_BODY }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Hero — no real cleaning photo exists in this project, so this uses
// the same warm-gradient + icon placeholder every other missing-photo
// surface in this app falls back to (the reference's own hero here is a
// marketing video for a real campaign, not catalogue data). ────────────

function HeroBanner({ onExplore, onViewMini }: { onExplore: () => void; onViewMini: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Bathroom Cleaning</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          A deep clean for<br />every bathroom.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Scrub-machine deep cleaning, at home.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore services
          </button>
          <button
            onClick={onViewMini}
            className="h-10 px-5 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[13px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
            style={{ fontFamily: FONT_BODY }}
          >
            View mini services
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[#722ED1] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoScrubMachine /></div>
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
const PHOTO_PANEL: React.CSSProperties = {
  background: '#F9F4FF',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-white border-[#E3DDD7] text-[#722ED1] hover:bg-[#F3EAFF] hover:border-[#722ED1]'
const NEUTRAL_BTN_ADDED = 'bg-[#F3EAFF] border-[#722ED1] text-[#722ED1] hover:bg-[#F3EAFF]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

// Package card — same layout as Salon Prime's own PackageCard: a photo
// panel with the discount % computed from the real price/original
// price (not the reference's own printed, rounded badge — the exact
// figures are the more honest source of truth), breakdown bullets, a
// "6 options available" hint since these packs' real sub-options sit
// behind a click this capture didn't reach, price + Add on the right.
function PackageCard({ pkg, onSelect, getCartCount }: {
  pkg: CleaningPackage
  onSelect: () => void
  /** Looks up how many of a given cart-line id are in the cart — used
   *  here to check each of this pack's OPTION ids so a picked
   *  bathroom-count can be called out on the card, same pattern every
   *  other options-bearing row on this page uses. */
  getCartCount: (id: string) => number
}) {
  const discountPct = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
  const selectedOptions = pkg.options.filter(o => getCartCount(o.id) > 0)
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 w-full h-[100px] sm:w-[170px] sm:h-auto rounded-[8px] flex items-center justify-center" style={PHOTO_PANEL}>
        <div className="text-center leading-[1.05]">
          <span className="block text-[28px] sm:text-[32px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_HEAD }}>{discountPct}%</span>
          <span className="block text-[28px] sm:text-[32px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_HEAD }}>OFF</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <span className="text-[13px] tracking-[0.06em] uppercase text-[#0F7A3D] font-semibold" style={{ fontFamily: FONT_MONO }}>PACKAGE</span>
          <span className="text-[17px] sm:text-[18px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{pkg.name}</span>
          <span className="text-[13px] text-[#68636D] leading-snug" style={{ fontFamily: FONT_BODY }}>{pkg.itemTitle}</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {pkg.rating}</span>
          <ul className="flex flex-col gap-1 pl-4 m-0" style={{ listStyle: 'disc' }}>
            {pkg.includes.map(inc => (
              <li key={inc} className="text-[12px] text-[#242326] leading-snug" style={{ fontFamily: FONT_BODY }}>{inc}</li>
            ))}
          </ul>
          {selectedOptions.length > 0 ? (
            <div className="flex flex-col gap-0.5 mt-0.5">
              {selectedOptions.map(o => (
                <span key={o.id} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_BODY }}>
                  <IcoCheckSmall /> {o.label}{getCartCount(o.id) > 1 ? ` ×${getCartCount(o.id)}` : ''}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-[#9A949D] mt-0.5" style={{ fontFamily: FONT_BODY }}>{pkg.options.length} options available</span>
          )}
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 sm:w-[140px] gap-3">
          <div className="text-left sm:text-right">
            <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
              <span className="line-through text-[#9A949D]">₹{pkg.originalPrice.toLocaleString('en-IN')}</span> <span className="font-semibold text-[#242326]">₹{pkg.price.toLocaleString('en-IN')}</span>
            </div>
            {pkg.note && <div className="text-[11px] font-semibold text-[#0F7A3D] mt-0.5 whitespace-nowrap">{pkg.note}</div>}
          </div>
          <button onClick={onSelect} className={`${NEUTRAL_BTN} ${NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
            Select
          </button>
        </div>
      </div>
    </div>
  )
}

function CleaningLineItemRow({ item, cartCount, onSelect, onViewDetails, getCartCount }: {
  item: CleaningItem
  cartCount: number
  onSelect: () => void
  onViewDetails: () => void
  getCartCount: (id: string) => number
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 mx-auto sm:mx-0">
        <div className="w-32 h-32 shrink-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]">
          {item.icon}
        </div>
        {item.bestseller && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}
          >
            ★ Bestseller
          </span>
        )}
        {item.cornerBadge && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: item.cornerBadge.color, fontFamily: FONT_BODY }}
          >
            {item.cornerBadge.label}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        {item.description && (
          <span className="text-[12px] text-[#68636D] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.description}</span>
        )}
        {item.note && (
          <span className="text-[11.5px] text-[#0F7A3D] leading-snug font-semibold" style={{ fontFamily: FONT_BODY }}>{item.note}</span>
        )}
        {item.options ? (
          selectedOptions.length > 0 ? (
            <div className="flex flex-col gap-0.5 mt-0.5">
              {selectedOptions.map(o => (
                <span key={o.id} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_BODY }}>
                  <IcoCheckSmall /> {o.label}{getCartCount(o.id) > 1 ? ` ×${getCartCount(o.id)}` : ''}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.options.length} options available</span>
          )
        ) : item.optionsCount && (
          <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} options available</span>
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          View details
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
            {item.priceLabel === 'starts-at' && <span className="text-[#68636D]">Starts at </span>}
            {item.originalPrice && <span className="line-through text-[#9A949D]">₹{item.originalPrice.toLocaleString('en-IN')}</span>} <span className="font-semibold text-[#242326]">₹{item.price.toLocaleString('en-IN')}</span>
          </div>
          {item.durationMin && (
            <div className="text-[11px] font-semibold text-[#722ED1] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
          )}
        </div>
        <button onClick={onSelect} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : (item.options || item.optionsCount) ? 'Select' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── "View details" — makes the link genuinely interactive: same info
// the row already shows, in one focused panel, with its own Add button.
function ServiceDetailModal({ item, cartCount, onSelect, onClose }: {
  item: CleaningItem
  cartCount: number
  onSelect: () => void
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
            {item.bestseller && (
              <span className="self-start flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap" style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}>
                ★ Bestseller
              </span>
            )}
            {item.cornerBadge && (
              <span className="self-start flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap" style={{ backgroundColor: item.cornerBadge.color, fontFamily: FONT_BODY }}>
                {item.cornerBadge.label}
              </span>
            )}
            <span className="text-[16px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
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
              {item.originalPrice && <span className="line-through text-[#9A949D] mr-1">₹{item.originalPrice.toLocaleString('en-IN')}</span>}
              <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
            </span>
            {item.durationMin && <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>}
          </div>
          {item.description && <p className="text-[13px] text-[#242326] leading-relaxed m-0" style={{ fontFamily: FONT_BODY }}>{item.description}</p>}
          {item.note && <span className="text-[12px] text-[#0F7A3D] font-semibold" style={{ fontFamily: FONT_BODY }}>{item.note}</span>}
          {(item.options?.length || item.optionsCount) && (
            <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.options?.length ?? item.optionsCount} options available</span>
          )}
          <button
            onClick={onSelect}
            className={`h-10 mt-1 rounded-[10px] border text-[13px] font-semibold cursor-pointer transition-all ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`}
            style={NEUTRAL_BTN_FONT}
          >
            {cartCount ? `Added ×${cartCount}` : (item.options || item.optionsCount) ? 'Select' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Options picker modal — opened from a package or line item that has
// real, user-supplied option data (e.g. "1 Bathroom" … "6 Bathrooms"
// under a 3-visit pack, "1 Ceiling fan" … "6 Ceiling fans" under
// Ceiling fan cleaning). Same calm card language as the rest of this
// file, same component every other options-bearing page in this app
// uses — not a separate visual system. Works for either a package or a
// line item via getOptionsSource, so one modal serves both. ───────────

function OptionsModal({ sourceId, cartCountForOption, onAddOption, onClose }: {
  sourceId: string
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: CleaningItemOption) => void
  onClose: () => void
}) {
  const { title, options, pickerNote, icon } = getOptionsSource(sourceId)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(36,35,38,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] max-h-[80vh] overflow-y-auto rounded-[16px] bg-white flex flex-col"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#F4F0EC] sticky top-0 bg-white">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[16px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{title}</span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
              {pickerNote ? <span className="text-[#0F7A3D] font-semibold">{pickerNote} · </span> : null}Choose an option
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 p-4">
          {options.map(opt => {
            const cartCount = cartCountForOption(opt.id)
            return (
              <div key={opt.id} className="flex items-center gap-3 rounded-[12px] p-3" style={CARD_SURFACE}>
                <div className="w-32 h-32 rounded-[10px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[#722ED1] shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[13.5px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{opt.label}</span>
                  {opt.rating && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {opt.rating}</span>
                  )}
                  <span className="text-[13px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
                    {opt.originalPrice && <span className="line-through text-[#9A949D]">₹{opt.originalPrice.toLocaleString('en-IN')}</span>} <span className="font-semibold text-[#242326]">₹{opt.price.toLocaleString('en-IN')}</span>
                  </span>
                </div>
                <button onClick={() => onAddOption(opt)} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
                  {cartCount ? `Added ×${cartCount}` : 'Add'}
                </button>
              </div>
            )
          })}
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
              {c.originalPrice > c.price && <span className="line-through text-[#9A949D] text-[12px]">₹{c.originalPrice}</span>}
            </span>
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
      {saved > 0 && (
        <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: '#0F7A3D' }}>
          <span className="text-white shrink-0"><IcoBolt /></span>
          <span className="text-[12.5px] text-white font-medium" style={{ fontFamily: FONT_BODY }}>Congratulations! ₹{saved} saved on this order</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F4F0EC]">
        <span className="text-[17px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
          ₹{total}{totalOriginal > total && <span className="line-through text-[#9A949D] text-[13px] font-normal"> ₹{totalOriginal}</span>}
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

// ─── Main Screen ────────────────────────────────────────────────────────

export default function BathroomCleaningScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses.
  // serviceEntry is 'cleaning' throughout this screen — the Cleaning
  // Services catalogue, kept separate from the Home Services one.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItemId, setDetailItemId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'cleaning',
      categoryId: 'bathroom-cleaning',
      serviceId: entry.serviceId ?? entry.id,
      serviceName: entry.title,
      optionId: entry.optionId,
      optionName: entry.optionName,
      title: entry.title,
      duration: entry.durationMin ? formatDuration(entry.durationMin) : undefined,
      price: entry.price,
      originalPrice: entry.originalPrice ?? entry.price,
    })
  }

  // A selected option becomes its own cart line — titled "Item —
  // Option" so the cart stays legible about exactly what was booked —
  // then the picker closes.
  const addOptionToCart = (sourceId: string, option: CleaningItemOption) => {
    const { title } = getOptionsSource(sourceId)
    addToCart({
      id: option.id,
      title: `${title} — ${option.label}`,
      price: option.price,
      originalPrice: option.originalPrice,
      serviceId: sourceId,
      optionId: option.id,
      optionName: option.label,
    })
    setExpandedId(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`bathroom-cleaning-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'bathroom-cleaning',
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
                <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Cleaning &amp; Pest Control</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Bathroom Cleaning
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('value-deals')} onViewMini={() => jumpToSection('mini-services')} />
                  <ServiceTabs onJump={jumpToSection} />

                  <div id="bathroom-cleaning-section-packs" className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                    <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>3-visit packs</h2>
                    <div className="flex flex-col gap-3">
                      {BATHROOM_PACKAGES.map(pkg => (
                        <PackageCard
                          key={pkg.id}
                          pkg={pkg}
                          getCartCount={cartCountForItem}
                          onSelect={() => setExpandedId(pkg.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {SECTIONS.map(section => {
                    const items = CLEANING_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`bathroom-cleaning-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <CleaningLineItemRow
                            key={item.id}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onSelect={() => (item.options ? setExpandedId(item.id) : addToCart(item))}
                            onViewDetails={() => setDetailItemId(item.id)}
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

      {detailItemId && (
        <ServiceDetailModal
          item={getCleaningItem(detailItemId)}
          cartCount={cartCountForItem(detailItemId)}
          onSelect={() => {
            const item = getCleaningItem(detailItemId)
            if (item.options) {
              setDetailItemId(null)
              setExpandedId(item.id)
            } else {
              addToCart(item)
            }
          }}
          onClose={() => setDetailItemId(null)}
        />
      )}

      {expandedId && (
        <OptionsModal
          sourceId={expandedId}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(expandedId, option)}
          onClose={() => setExpandedId(null)}
        />
      )}
    </div>
  )
}
