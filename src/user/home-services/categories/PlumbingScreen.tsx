// ─── Electrician, Plumber & Carpenter → Plumbing ────────────────────────
//
// Built from a real-page reference PDF the user supplied (UB-PLU22) — a
// real Plumber category page: page-level rating "4.78 (3.1M
// bookings)", a real "Super saver — Affordable repairs starting at
// just ₹49" banner, 9 real sections (Tap & mixer, Toilet, Bath &
// shower, Bath accessories, Basin & sink, Drainage & blockage,
// Leakage & connections, Water tank & motor, Book a consultation) and
// every one of their 33 real line items with its own real rating/
// reviews/price/duration, taken as given.
//
// Same "N options" honesty rule as the Electrician page: the reference
// shows each item's own real options-tile count next to "Add", but the
// capture never scrolled into any single item's own options breakdown,
// so the count is kept as a real, informational tag next to the
// item's own real "Starts at ₹X" price, and Add books that same real
// starting price rather than fabricating the options themselves.
// Items with a flat real price + duration use the plain Add pattern
// every other duration-bearing line item in this app uses.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own "UC warranty & damage cover" expandable row, its own
// "Earliest — Sun, 8:00 AM" slot chip, footer, and whatever was in its
// own cart at capture time — this page's own HeroBanner/
// CategoryBanners use original Houzeify copy instead, same as every
// sibling screen.
//
// Honesty note: no real plumbing-service photography exists in this
// project, so every image slot uses this app's own icon-on-gradient
// placeholder pattern, same as every sibling screen.

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
const IcoCheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.3L5.3 10L11.5 3.5" />
  </svg>
)
// Section-nav & item icons
const IcoTapMixer = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4.5h5v3.5a2.8 2.8 0 002.8 2.8v0a2.8 2.8 0 002.8-2.8V6.5" />
    <path d="M6.5 4.5v3.5M11.5 10.8V17M8.7 17h5.6" />
  </svg>
)
const IcoToilet = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2.5h6v3.5H6z" />
    <path d="M5 8.5h8c1 0 1.8 3 1.3 5.5C13.7 16.5 12 17.5 10 17.5s-3.7-1-4.3-3.5C5.2 11.5 6 8.5 6 8.5z" />
  </svg>
)
const IcoShower = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 6.5L8 3h4l3.5 3.5" />
    <circle cx="10" cy="9.5" r="3.2" />
    <path d="M7.5 15v1.5M10 15.5V17M12.5 15v1.5" />
  </svg>
)
const IcoBathAccessories = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6.5h12" />
    <path d="M3.5 6.5V5a1.5 1.5 0 013 0v1.5M13.5 6.5V5a1.5 1.5 0 013 0v1.5" />
    <path d="M4.5 6.5v6.5a2 2 0 002 2h7a2 2 0 002-2V6.5" />
  </svg>
)
const IcoBasinSink = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5h15" />
    <path d="M4.5 9.5v3a2 2 0 002 2h7a2 2 0 002-2v-3" />
    <path d="M10 6.5V2.5M10 2.5h2.5" />
  </svg>
)
const IcoDrainage = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="14" rx="1.5" />
    <circle cx="10" cy="10" r="3.5" />
    <path d="M10 6.5v1M10 12.5v1M6.5 10h1M12.5 10h1" />
  </svg>
)
const IcoLeakageConnections = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5s5 6.2 5 9.8a5 5 0 01-10 0C5 8.7 10 2.5 10 2.5z" />
  </svg>
)
const IcoWaterTankMotor = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4.5h10l1 3.5-1 8.5H5l-1-8.5z" />
    <path d="M4.5 8h11" />
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
// given item (e.g. its own options breakdown) stays undefined and is
// never rendered or invented. ──────────────────────────────────────────

type PlumbingSection = 'tap-mixer' | 'toilet' | 'bath-shower' | 'bath-accessories' | 'basin-sink' | 'drainage-blockage' | 'leakage-connections' | 'water-tank-motor' | 'consultation'

// A real, named option within a multi-option item's own breakdown — each
// field taken as given from a second reference pass's own per-option
// tile (its own label/price/rating), never invented. No originalPrice/
// duration fields: the reference's option tiles never showed either for
// this page (unlike Salon Luxe/Prime's own options, which do carry both).
interface PlumbingItemOption {
  id: string
  label: string
  price: number
  rating?: string
}

interface PlumbingItem {
  id: string
  title: string
  section: PlumbingSection
  rating?: string
  price: number
  priceLabel?: 'starts-at'
  durationMin?: number
  /** Real "N options" count shown next to the item's own real
   *  "Starts at ₹X" price for an item whose options breakdown was never
   *  captured — see `options` below for items where it since was. */
  optionsCount?: number
  /** The item's own real options breakdown, once captured — when
   *  present this replaces the plain "Add" with a picker, same
   *  convention as Salon Luxe/Prime/Electrician's own OptionsModal. */
  options?: PlumbingItemOption[]
  note?: string
  notes?: string[]
  icon: React.ReactNode
}

const PLUMBING_ITEMS: PlumbingItem[] = [
  // ── Tap & mixer ──
  { id: 'plu-tap-repair', title: 'Tap repair', section: 'tap-mixer', rating: '4.80 (259K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoTapMixer />, options: [
    { id: 'plu-tap-repair-regular', label: 'Regular', price: 99, rating: '4.80 (188K reviews)' },
    { id: 'plu-tap-repair-swan', label: 'Swan Tap Repair', price: 99, rating: '4.80 (34K reviews)' },
    { id: 'plu-tap-repair-showermixer', label: 'Shower mixer repair', price: 229, rating: '4.77 (10K reviews)' },
    { id: 'plu-tap-repair-hotcold', label: 'Hot & cold mixer', price: 199, rating: '4.76 (27K reviews)' },
  ] },
  { id: 'plu-tap-accessory-install', title: 'Tap accessory installation', section: 'tap-mixer', rating: '4.83 (20K reviews)', price: 79, priceLabel: 'starts-at', icon: <IcoTapMixer />, options: [
    { id: 'plu-tap-accessory-install-filter', label: 'Filter', price: 79, rating: '4.85 (11K reviews)' },
    { id: 'plu-tap-accessory-install-extender', label: 'Extender', price: 89, rating: '4.82 (3K reviews)' },
    { id: 'plu-tap-accessory-install-watersaving', label: 'Water-saving nozzle', price: 99, rating: '4.82 (2K reviews)' },
    { id: 'plu-tap-accessory-install-doubleconn', label: 'Tap double connection', price: 99, rating: '4.79 (3K reviews)' },
  ] },
  { id: 'plu-tap-install-replacement', title: 'Tap installation/replacement', section: 'tap-mixer', rating: '4.80 (232K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoTapMixer />, options: [
    { id: 'plu-tap-install-replacement-regular', label: 'Regular', price: 99, rating: '4.80 (188K reviews)' },
    { id: 'plu-tap-install-replacement-hotcold', label: 'Hot & cold mixer', price: 199, rating: '4.76 (27K reviews)' },
    { id: 'plu-tap-install-replacement-showermixer', label: 'Shower mixer repair', price: 229, rating: '4.77 (10K reviews)' },
    // Label's tail ("...repla...") ran off the edge of the reference
    // screenshot — completed to match this same item's own title
    // ("installation/replacement"), never a guessed price/rating (both
    // were fully visible and are real).
    { id: 'plu-tap-install-replacement-swan', label: 'Swan Tap installation/replacement', price: 249, rating: '4.80 (7K reviews)' },
  ] },

  // ── Toilet ──
  { id: 'plu-jet-spray-repair', title: 'Jet spray repair/replacement', section: 'toilet', rating: '4.82 (155K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoToilet />, options: [
    { id: 'plu-jet-spray-repair-jetspray', label: 'Jet spray', price: 99, rating: '4.82 (151K reviews)' },
    { id: 'plu-jet-spray-repair-bidet', label: 'Bidet', price: 99, rating: '4.76 (4K reviews)' },
  ] },
  { id: 'plu-toilet-seat-cover-install', title: 'Toilet seat cover installation', section: 'toilet', rating: '4.79 (44K reviews)', price: 99, durationMin: 30, icon: <IcoToilet /> },
  { id: 'plu-flush-tank-repair', title: 'Flush tank repair', section: 'toilet', rating: '4.76 (157K reviews)', price: 149, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoToilet /> },
  { id: 'plu-external-flush-tank-replacement', title: 'External flush tank replacement', section: 'toilet', rating: '4.82 (7K reviews)', price: 449, durationMin: 60, icon: <IcoToilet /> },
  { id: 'plu-indian-toilet-repair-install', title: 'Indian toilet repair/installation', section: 'toilet', rating: '4.76 (4K reviews)', price: 699, priceLabel: 'starts-at', icon: <IcoToilet />, options: [
    { id: 'plu-indian-toilet-repair-install-install', label: 'Installation/replacement', price: 1699, rating: '4.82 (507 reviews)' },
    { id: 'plu-indian-toilet-repair-install-repair', label: 'Repair', price: 699, rating: '4.85 (479 reviews)' },
    { id: 'plu-indian-toilet-repair-install-blockage', label: 'Pot blockage removal', price: 1299, rating: '4.74 (3K reviews)' },
  ] },
  { id: 'plu-western-toilet-repair-wall', title: 'Western toilet repair (wall-mounted)', section: 'toilet', rating: '4.75 (23K reviews)', price: 699, priceLabel: 'starts-at', icon: <IcoToilet />, options: [
    { id: 'plu-western-toilet-repair-wall-install', label: 'Installation/replacement', price: 1899, rating: '4.80 (2K reviews)' },
    { id: 'plu-western-toilet-repair-wall-repair', label: 'Repair', price: 699, rating: '4.75 (17K reviews)' },
    { id: 'plu-western-toilet-repair-wall-blockage', label: 'Pot blockage removal', price: 1299, rating: '4.74 (3K reviews)' },
  ] },
  { id: 'plu-western-toilet-repair-floor', title: 'Western toilet repair (floor-mounted)', section: 'toilet', rating: '4.75 (22K reviews)', price: 699, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoToilet /> },

  // ── Bath & shower ──
  { id: 'plu-shower-mixer-tap-install', title: 'Shower mixer tap installation', section: 'bath-shower', rating: '4.74 (8K reviews)', price: 228, durationMin: 60, icon: <IcoShower /> },
  { id: 'plu-shower-install', title: 'Shower installation', section: 'bath-shower', rating: '4.82 (23K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoShower />, options: [
    { id: 'plu-shower-install-handheld', label: 'Handheld', price: 99, rating: '4.75 (3K reviews)' },
    { id: 'plu-shower-install-wallmounted', label: 'Wall mounted', price: 139, rating: '4.84 (18K reviews)' },
    { id: 'plu-shower-install-ceilingmounted', label: 'Ceiling mounted', price: 149, rating: '4.80 (1K reviews)' },
  ] },
  { id: 'plu-shower-filter-install', title: 'Shower filter installation', section: 'bath-shower', rating: '4.87 (12K reviews)', price: 99, durationMin: 30, icon: <IcoShower /> },
  { id: 'plu-shower-repair', title: 'Shower repair', section: 'bath-shower', rating: '4.79 (25K reviews)', price: 99, durationMin: 30, icon: <IcoShower /> },

  // ── Bath accessories ──
  { id: 'plu-soap-holder-install', title: 'Soap holder installation', section: 'bath-accessories', rating: '4.74 (6K reviews)', price: 99, durationMin: 30, icon: <IcoBathAccessories /> },
  { id: 'plu-towel-holder-install', title: 'Towel holder installation', section: 'bath-accessories', rating: '4.72 (14K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoBathAccessories />, options: [
    { id: 'plu-towel-holder-install-rack', label: 'Towel rack', price: 149, rating: '4.72 (5K reviews)' },
    { id: 'plu-towel-holder-install-rod', label: 'Holding rod', price: 129, rating: '4.72 (6K reviews)' },
    { id: 'plu-towel-holder-install-smallholder', label: 'Small holder', price: 99, rating: '4.69 (3K reviews)' },
  ] },
  { id: 'plu-shelf-install', title: 'Shelf installation', section: 'bath-accessories', rating: '4.71 (8K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoBathAccessories />, options: [
    { id: 'plu-shelf-install-floatingglass', label: 'Floating glass shelf', price: 119, rating: '4.74 (3K reviews)' },
    { id: 'plu-shelf-install-corner', label: 'Corner shelf', price: 99, rating: '4.69 (5K reviews)' },
  ] },

  // ── Basin & sink ──
  { id: 'plu-wash-basin-leakage-repair', title: 'Wash basin leakage repair', section: 'basin-sink', rating: '4.78 (69K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoBasinSink />, options: [
    { id: 'plu-wash-basin-leakage-repair-wastepipe', label: 'Waste pipe', price: 99, rating: '4.78 (57K reviews)' },
    { id: 'plu-wash-basin-leakage-repair-bottletrap', label: 'Bottle trap', price: 199, rating: '4.76 (12K reviews)' },
  ] },
  { id: 'plu-wash-basin-blockage-removal', title: 'Wash basin blockage removal', section: 'basin-sink', rating: '4.79 (41K reviews)', price: 199, durationMin: 30, icon: <IcoBasinSink /> },
  { id: 'plu-wash-basin-install', title: 'Wash basin installation', section: 'basin-sink', rating: '4.76 (15K reviews)', price: 469, durationMin: 60, icon: <IcoBasinSink /> },
  { id: 'plu-waste-coupling-install', title: 'Waste coupling installation', section: 'basin-sink', rating: '4.81 (11K reviews)', price: 149, priceLabel: 'starts-at', icon: <IcoBasinSink />, options: [
    { id: 'plu-waste-coupling-install-bottletrap', label: 'Bottle trap basin', price: 219, rating: '4.79 (2K reviews)' },
    { id: 'plu-waste-coupling-install-wastepipe', label: 'Waste pipe basin', price: 149, rating: '4.81 (9K reviews)' },
  ] },

  // ── Drainage & blockage ──
  { id: 'plu-drain-cover-install', title: 'Drain cover installation', section: 'drainage-blockage', rating: '4.78 (15K reviews)', price: 149, durationMin: 20, icon: <IcoDrainage /> },
  { id: 'plu-drain-blockage-removal', title: 'Drain blockage removal', section: 'drainage-blockage', rating: '4.77 (89K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoDrainage />, options: [
    { id: 'plu-drain-blockage-removal-bathroom', label: 'Bathroom/balcony', price: 199, rating: '4.78 (44K reviews)' },
    { id: 'plu-drain-blockage-removal-toiletpot', label: 'Toilet pot', price: 1299, rating: '4.75 (4K reviews)' },
    { id: 'plu-drain-blockage-removal-kitchensink', label: 'Kitchen sink', price: 199, rating: '4.76 (35K reviews)' },
    { id: 'plu-drain-blockage-removal-washbasin', label: 'Wash basin', price: 199, rating: '4.79 (5K reviews)' },
  ] },

  // ── Leakage & connections ──
  { id: 'plu-connection-hose-install', title: 'Connection hose installation', section: 'leakage-connections', rating: '4.78 (67K reviews)', price: 89, durationMin: 15, icon: <IcoLeakageConnections /> },
  { id: 'plu-washing-machine-inlet-install', title: 'Washing machine inlet installation', section: 'leakage-connections', rating: '4.81 (57K reviews)', price: 99, durationMin: 30, icon: <IcoLeakageConnections /> },
  { id: 'plu-ro-water-connection-install', title: 'RO water connection installation', section: 'leakage-connections', rating: '4.64 (12K reviews)', price: 99, durationMin: 30, icon: <IcoLeakageConnections /> },
  { id: 'plu-geyser-connection-leakage-repair', title: 'Geyser connection leakage repair', section: 'leakage-connections', rating: '4.73 (21K reviews)', price: 99, durationMin: 20, icon: <IcoLeakageConnections /> },
  { id: 'plu-shutoff-valve-leakage-repair', title: 'Shut-off valve leakage repair', section: 'leakage-connections', rating: '4.77 (41K reviews)', price: 99, durationMin: 30, icon: <IcoLeakageConnections /> },

  // ── Water tank & motor ──
  { id: 'plu-overhead-water-tank-install', title: 'Overhead water tank installation', section: 'water-tank-motor', rating: '4.67 (1K reviews)', price: 699, priceLabel: 'starts-at', icon: <IcoWaterTankMotor />, options: [
    { id: 'plu-overhead-water-tank-install-upto500l', label: 'Upto 500L', price: 699, rating: '4.66 (511 reviews)' },
    { id: 'plu-overhead-water-tank-install-500to2000l', label: '500 to 2000L', price: 1199, rating: '4.68 (611 reviews)' },
  ] },
  { id: 'plu-water-tank-repair', title: 'Water tank repair', section: 'water-tank-motor', rating: '4.64 (9K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoWaterTankMotor />, options: [
    { id: 'plu-water-tank-repair-coverchange', label: 'Cover change', price: 99, rating: '4.65 (638 reviews)' },
    { id: 'plu-water-tank-repair-connectionleakage', label: 'Connection leakage', price: 99, rating: '4.64 (6K reviews)' },
    { id: 'plu-water-tank-repair-overflow', label: 'Water overflow', price: 149, rating: '4.62 (2K reviews)' },
  ] },
  { id: 'plu-motor-install', title: 'Motor installation', section: 'water-tank-motor', rating: '4.65 (4K reviews)', price: 449, durationMin: 60, icon: <IcoWaterTankMotor /> },
  { id: 'plu-motor-air-cavity-removal', title: 'Motor air cavity removal', section: 'water-tank-motor', rating: '4.64 (13K reviews)', price: 99, durationMin: 30, icon: <IcoWaterTankMotor /> },

  // ── Book a consultation ──
  { id: 'plu-consultation', title: 'Plumber consultation', section: 'consultation', rating: '4.74 (206K reviews)', price: 49, durationMin: 30, notes: ['A plumber will assess your needs upon arrival at your home', 'A quote will be provided before the service begins'], icon: <IcoConsultation /> },
]

const SECTIONS: { id: PlumbingSection; label: string; icon: React.ReactNode }[] = [
  { id: 'tap-mixer', label: 'Tap & mixer', icon: <IcoTapMixer /> },
  { id: 'toilet', label: 'Toilet', icon: <IcoToilet /> },
  { id: 'bath-shower', label: 'Bath & shower', icon: <IcoShower /> },
  { id: 'bath-accessories', label: 'Bath accessories', icon: <IcoBathAccessories /> },
  { id: 'basin-sink', label: 'Basin & sink', icon: <IcoBasinSink /> },
  { id: 'drainage-blockage', label: 'Drainage & blockage', icon: <IcoDrainage /> },
  { id: 'leakage-connections', label: 'Leakage & connections', icon: <IcoLeakageConnections /> },
  { id: 'water-tank-motor', label: 'Water tank & motor', icon: <IcoWaterTankMotor /> },
  { id: 'consultation', label: 'Book a consultation', icon: <IcoConsultation /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<PlumbingSection, { title: string; subtitle: string }> = {
  'tap-mixer': { title: 'Stop that drip for good', subtitle: 'Tap repairs, replacements & accessory installs.' },
  toilet: { title: 'Toilet trouble, sorted', subtitle: 'Seat covers, flush tanks & full toilet repairs.' },
  'bath-shower': { title: 'A shower that just works', subtitle: 'Mixer taps, shower heads & filters, installed or repaired.' },
  'bath-accessories': { title: 'The little fittings matter', subtitle: 'Soap holders, towel rails & shelves, mounted properly.' },
  'basin-sink': { title: 'Basins that drain right', subtitle: 'Leak repairs, blockage removal & new installs.' },
  'drainage-blockage': { title: 'Clear the blockage fast', subtitle: 'Drain covers and full blockage removal.' },
  'leakage-connections': { title: 'Stop leaks at the source', subtitle: 'Hoses, inlets & connection repairs around your home.' },
  'water-tank-motor': { title: 'Keep the water flowing', subtitle: 'Tank installs, repairs & motor servicing.' },
  consultation: { title: 'Not sure what’s wrong?', subtitle: 'Book a consultation before you commit to a repair.' },
}

function getItem(id: string): PlumbingItem {
  const item = PLUMBING_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Plumbing item id: ${id}`)
  return item
}

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Plumbing</span>
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
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Plumbing</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'plumbing' })}
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

// ─── Hero — no real plumbing photo exists in this project, so this uses
// the same warm-gradient + icon placeholder every other missing-photo
// surface in this app falls back to; the real page rating/bookings
// figure is kept as a small chip, same real data point every sibling
// screen keeps where the reference shows one. ──────────────────────────

function HeroBanner({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Electrician, Plumber &amp; Carpenter</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Leaks & fittings,<br />handled fast.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Taps, toilets, drains & tanks — affordable repairs starting at just ₹49.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <span className="flex items-center gap-1 text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={13} /> 4.78 <span className="text-[#68636D] font-normal" style={{ fontFamily: FONT_BODY }}>(3.1M bookings)</span></span>
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
        <div style={{ transform: 'scale(3.2)' }}><IcoTapMixer /></div>
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

function ItemMeta({ item }: { item: PlumbingItem }) {
  return (
    <div className="text-left sm:text-right">
      <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
        {item.priceLabel === 'starts-at' && <span className="text-[#68636D]">Starts at </span>}
        <span className="font-semibold text-[#242326]">₹{item.price.toLocaleString('en-IN')}</span>
      </div>
      {item.durationMin !== undefined ? (
        <div className="text-[11px] font-semibold text-[#722ED1] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
      ) : item.options ? (
        <div className="text-[11px] text-[#9A949D] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>{item.options.length} option{item.options.length > 1 ? 's' : ''}</div>
      ) : item.optionsCount !== undefined ? (
        <div className="text-[11px] text-[#9A949D] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''}</div>
      ) : null}
    </div>
  )
}

function PlumbingLineItemRow({ item, cartCount, getCartCount, onAdd, onViewDetails }: {
  item: PlumbingItem
  cartCount: number
  /** Looks up how many of a given cart-line id are in the cart — reused
   *  here to check each of this item's OPTION ids too, so a selected
   *  variant can be called out on the card (same pattern as Prime/
   *  Electrician). */
  getCartCount: (id: string) => number
  onAdd: () => void
  onViewDetails: () => void
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
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
        {item.notes?.map(n => (
          <span key={n} className="text-[11.5px] text-[#9A949D] leading-snug" style={{ fontFamily: FONT_BODY }}>• {n}</span>
        ))}
        {selectedOptions.length > 0 && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {selectedOptions.map(o => (
              <span key={o.id} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_BODY }}>
                <IcoCheckSmall /> {o.label}{getCartCount(o.id) > 1 ? ` ×${getCartCount(o.id)}` : ''}
              </span>
            ))}
          </div>
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          View details
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <ItemMeta item={item} />
        <button onClick={onAdd} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : item.options ? 'Select' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── "View details" — makes the link genuinely interactive: same info
// the row already shows, in one focused panel. Its bottom button either
// adds the item directly, or — for an item with a real options
// breakdown — opens the options picker instead (closing this panel
// first), same "Select" convention as the row itself.
function ServiceDetailModal({ item, cartCount, onAdd, onSelectOptions, onClose }: {
  item: PlumbingItem
  cartCount: number
  onAdd: () => void
  onSelectOptions: () => void
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
            {item.durationMin !== undefined && (
              <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>
            )}
            {item.options ? (
              <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.options.length} option{item.options.length > 1 ? 's' : ''} available at booking</span>
            ) : item.optionsCount !== undefined && (
              <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''} available at booking</span>
            )}
          </div>
          {item.note && <span className="text-[12px] text-[#9A949D] italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>}
          {item.notes?.map(n => (
            <span key={n} className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>• {n}</span>
          ))}
          <button
            onClick={item.options ? onSelectOptions : onAdd}
            className={`h-10 mt-1 rounded-[10px] border text-[13px] font-semibold cursor-pointer transition-all ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`}
            style={NEUTRAL_BTN_FONT}
          >
            {cartCount ? `Added ×${cartCount}` : item.options ? 'Select' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Options picker modal — opened from a line item that has more than
// one real way to book it (a fixture type, a size tier, an install vs.
// repair action). Same calm card language as the rest of this file,
// immediate-select (click a row = add it and close) — same pattern as
// Salon Luxe/Prime/Electrician's own OptionsModal. ─────────────────────

function PlumbingOptionsModal({ item, cartCountForOption, onAddOption, onClose }: {
  item: PlumbingItem
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: PlumbingItemOption) => void
  onClose: () => void
}) {
  if (!item.options) return null
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
            <span className="text-[16px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Choose an option</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>
        <div className="flex flex-col gap-2.5 p-4">
          {item.options.map(opt => {
            const cartCount = cartCountForOption(opt.id)
            return (
              <div key={opt.id} className="flex items-center gap-3 rounded-[12px] p-3" style={CARD_SURFACE}>
                <div className="w-32 h-32 rounded-[10px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[#722ED1] shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[13.5px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{opt.label}</span>
                  <span className="text-[13px] font-semibold text-[#242326] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>₹{opt.price.toLocaleString('en-IN')}</span>
                  {opt.rating && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {opt.rating}</span>
                  )}
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

export default function PlumbingScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItem, setDetailItem] = useState<string | null>(null)
  // Id of the item whose options picker is currently open (see
  // PlumbingOptionsModal) — null means no picker is showing.
  const [optionsItemId, setOptionsItemId] = useState<string | null>(null)

  const addToCart = (item: PlumbingItem) => {
    addItem({
      cartId: item.id,
      serviceEntry: 'home-services',
      categoryId: 'plumbing',
      serviceId: item.id,
      serviceName: item.title,
      title: item.title,
      price: item.price,
      originalPrice: item.price,
      duration: item.durationMin !== undefined ? formatDuration(item.durationMin) : undefined,
    })
  }

  // A selected option becomes its own cart line — titled "Item — Option"
  // so the cart stays legible about exactly what was booked — then the
  // picker closes. Same convention as Prime/Electrician's own
  // addOptionToCart.
  const addOptionToCart = (item: PlumbingItem, option: PlumbingItemOption) => {
    addItem({
      cartId: option.id,
      serviceEntry: 'home-services',
      categoryId: 'plumbing',
      serviceId: item.id,
      serviceName: item.title,
      optionId: option.id,
      optionName: option.label,
      title: `${item.title} — ${option.label}`,
      price: option.price,
      originalPrice: option.price,
    })
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`plumbing-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'plumbing',
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
                <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Electrician, Plumber &amp; Carpenter</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Plumbing
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('tap-mixer')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = PLUMBING_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`plumbing-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <PlumbingLineItemRow
                            key={item.id}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onAdd={() => (item.options ? setOptionsItemId(item.id) : addToCart(item))}
                            onViewDetails={() => setDetailItem(item.id)}
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
          item={getItem(detailItem)}
          cartCount={cartCountForItem(detailItem)}
          onAdd={() => addToCart(getItem(detailItem))}
          onSelectOptions={() => { setOptionsItemId(detailItem); setDetailItem(null) }}
          onClose={() => setDetailItem(null)}
        />
      )}

      {optionsItemId && (
        <PlumbingOptionsModal
          item={getItem(optionsItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getItem(optionsItemId), option)}
          onClose={() => setOptionsItemId(null)}
        />
      )}
    </div>
  )
}
