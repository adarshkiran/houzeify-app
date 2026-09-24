// ─── Electrician, Plumber & Carpenter → Carpentry ───────────────────────
//
// Built from a real-page reference PDF the user supplied (UB-CP23) — a
// real Carpenter category page: page-level rating "4.78 (2.9M
// bookings)", a real "30-day warranty included on every Carpenter
// service" banner, 12 real sections (Wooden door, Cupboard & drawer,
// Décor & mirror, Shelf & cabinet, Lock & Hinge, Curtain & window,
// Furniture repair, Furniture assembly, Kitchen fittings, Bath
// fittings & mirrors, Balcony fittings, At home consultation) and
// every one of their real line items with its own real rating/
// reviews/price/duration, taken as given.
//
// Same "N options" honesty rule as Electrician/Plumbing: the
// reference shows each item's own real options-tile count next to
// "Add", but the capture never scrolled into any single item's own
// options breakdown, so the count is kept as a real, informational tag
// next to the item's own real "Starts at ₹X" price, and Add books that
// same real starting price rather than fabricating the options
// themselves. Items with a flat real price + duration use the plain
// Add pattern every other duration-bearing line item in this app
// uses. Several real "Combo for X" package rows also carry their own
// real "10% off" tag — kept as a small badge, same treatment as the
// Electrician page's own real "Super saver" tag.
//
// A handful of real items are genuinely cross-listed across two
// sections in the reference itself (e.g. "Door locks & latches
// repair" under both Wooden door and Lock & Hinge, "Mirror
// installation" under both Décor & mirror and Bath fittings &
// mirrors) — kept as one real item appearing under every section its
// own reference shows it in (item.sections is an array), rather than
// arbitrarily dropped from one.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own "UC warranty & damage cover" expandable row, its own
// "Earliest — Sun, 8:00 AM" slot chip, its own real "Get visitation
// fee off" progress chip, footer, and whatever was in its own cart at
// capture time — this page's own HeroBanner/CategoryBanners use
// original Houzeify copy instead, same as every sibling screen.
//
// Honesty note: no real carpentry-service photography exists in this
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
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--hz-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5" /></svg>
)
const IcoShield = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="var(--hz-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
const IcoCart = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2.5h1.6L6.3 13h9L17.3 5.8H4.7" />
    <circle cx="7.2" cy="16.5" r="1.2" />
    <circle cx="14" cy="16.5" r="1.2" />
  </svg>
)
const IcoCheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.3L5.3 10L11.5 3.5" />
  </svg>
)
// Section-nav & item icons
const IcoWoodenDoor = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="10" height="16" rx="1" />
    <circle cx="12" cy="10" r="0.6" fill="currentColor" stroke="none" />
  </svg>
)
const IcoCupboardDrawer = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="2.5" width="13" height="15" rx="1" />
    <path d="M3.5 9h13" />
    <path d="M8.5 6h3M8.5 12.5h3" />
  </svg>
)
const IcoDecorMirror = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 2.5h7a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 13V4a1.5 1.5 0 011.5-1.5z" />
    <path d="M7.5 17.5h5" />
  </svg>
)
const IcoShelfCabinet = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="14" height="12" rx="1.2" />
    <path d="M3 9.5h14" />
    <path d="M7 4v5.5M13 4v5.5" />
  </svg>
)
const IcoLockHinge = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="9" width="10" height="8" rx="1.2" />
    <path d="M7 9V6a3 3 0 016 0v3" />
    <circle cx="10" cy="12.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)
const IcoCurtainWindow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="14" height="12" rx="1" />
    <path d="M3 4h14M10 4v12" />
  </svg>
)
const IcoFurnitureRepair = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12.5l6-6 2 2-6 6a1.4 1.4 0 01-2-2z" />
    <path d="M11 6.5l2.5-2.5 3 3-2.5 2.5" />
  </svg>
)
const IcoFurnitureAssembly = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 17v-6a3 3 0 013-3h6a3 3 0 013 3v6" />
    <path d="M4 14h12M5 17v-1.5M15 17v-1.5" />
  </svg>
)
const IcoKitchenFittings = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.5a6.5 6.5 0 0113 0" />
    <path d="M2.5 8.5h15M4.5 8.5V16h11V8.5" />
    <line x1="10" y1="3" x2="10" y2="1.5" />
  </svg>
)
const IcoBathFittingsMirrors = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h14v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z" />
    <path d="M4.5 10V4.8A1.8 1.8 0 016.3 3v0c.7 0 1.3.4 1.6 1" />
  </svg>
)
const IcoBalconyFittings = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h14" />
    <path d="M10 6v2.5l-4 5M10 8.5l4 5" />
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
// never rendered or invented. `sections` is an array because a
// handful of real items are genuinely cross-listed under two real
// sections in the reference itself. ────────────────────────────────────

type CarpentrySection =
  | 'wooden-door'
  | 'cupboard-drawer'
  | 'decor-mirror'
  | 'shelf-cabinet'
  | 'lock-hinge'
  | 'curtain-window'
  | 'furniture-repair'
  | 'furniture-assembly'
  | 'kitchen-fittings'
  | 'bath-fittings-mirrors'
  | 'balcony-fittings'
  | 'consultation'

// A real, named option within a multi-option item's own breakdown —
// for the 7 items a second reference pass actually scrolled into, each
// field is taken as given from that reference (its own label/price/
// rating), never invented. For every other multi-option item the
// reference still never showed a breakdown for, this same shape carries
// originally-authored demo options instead (own plausible labels, own
// prices that keep the item's existing "Starts at ₹X" as the cheapest
// tier) — explicitly authorized in place of the plain "N options" tag,
// so every "Select" button on this page opens a real picker.
interface CarpentryItemOption {
  id: string
  label: string
  price: number
  rating?: string
}

interface CarpentryItem {
  id: string
  title: string
  sections: CarpentrySection[]
  rating?: string
  price: number
  priceLabel?: 'starts-at'
  durationMin?: number
  /** Real "N options" count — legacy fallback, unused once `options`
   *  (below) is populated for an item. */
  optionsCount?: number
  /** The item's own options breakdown — see the interface comment
   *  above for which items' options are real (reference-sourced,
   *  carrying a `rating`) vs. originally-authored demo data (no
   *  `rating`, since no real per-option rating exists for those). */
  options?: CarpentryItemOption[]
  note?: string
  notes?: string[]
  badge?: string
  icon: React.ReactNode
}

const CARPENTRY_ITEMS: CarpentryItem[] = [
  // ── Wooden door ──
  { id: 'car-combo-wooden-door', title: 'Combo for wooden door', sections: ['wooden-door'], rating: '4.78 (160K reviews)', price: 999, durationMin: 150, badge: 'Package · 10% off', icon: <IcoWoodenDoor /> },
  { id: 'car-door-repair', title: 'Door repair', sections: ['wooden-door'], rating: '4.78 (159K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoWoodenDoor />, options: [
    { id: 'car-door-repair-towerbolt', label: 'Tower bolt/Latch repair', price: 99, rating: '4.75 (2K reviews)' },
    { id: 'car-door-repair-bottomstopper', label: 'Bottom stopper repair', price: 99, rating: '4.82 (529 reviews)' },
    { id: 'car-door-repair-handlelock', label: 'Handle lock repair', price: 199, rating: '4.79 (75K reviews)' },
    { id: 'car-door-repair-hinge', label: 'Hinge repair (per Hinge)', price: 199, rating: '4.83 (1K reviews)' },
    { id: 'car-door-repair-misalignment', label: 'Misalignment issues', price: 199, rating: '4.77 (51K reviews)' },
    { id: 'car-door-repair-notclosing', label: 'Door not closing (Swelling)', price: 299, rating: '4.78 (29K reviews)' },
    { id: 'car-door-repair-sliding', label: 'Sliding wooden door repair', price: 299, rating: '4.84 (895 reviews)' },
  ] },
  { id: 'car-new-door-install', title: 'New door installation', sections: ['wooden-door'], rating: '4.71 (7K reviews)', price: 999, priceLabel: 'starts-at', icon: <IcoWoodenDoor />, options: [
    { id: 'car-new-door-install-wooden', label: 'Wooden door', price: 999, rating: '4.70 (6K reviews)' },
    { id: 'car-new-door-install-sliding', label: 'Sliding wooden door', price: 999, rating: '4.87 (494 reviews)' },
  ] },
  { id: 'car-door-locks-latches-repair', title: 'Door locks & latches repair', sections: ['wooden-door', 'lock-hinge'], rating: '4.81 (12K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoWoodenDoor />, options: [
    { id: 'car-door-locks-latches-repair-chain', label: 'Chain latch', price: 99, rating: '4.75 (355 reviews)' },
    { id: 'car-door-locks-latches-repair-lockable', label: 'Lockable latch', price: 99, rating: '4.79 (2K reviews)' },
    { id: 'car-door-locks-latches-repair-towerbolt', label: 'Tower bolt', price: 99, rating: '4.81 (2K reviews)' },
    { id: 'car-door-locks-latches-repair-handle', label: 'Handle lock', price: 199, rating: '4.81 (7K reviews)' },
    { id: 'car-door-locks-latches-repair-roundknob', label: 'Round knob lock', price: 249, rating: '4.83 (2K reviews)' },
  ] },
  { id: 'car-door-lock-replace-install', title: 'Door lock replace/install', sections: ['wooden-door', 'lock-hinge'], rating: '4.81 (7K reviews)', price: 129, priceLabel: 'starts-at', icon: <IcoWoodenDoor />, options: [
    { id: 'car-door-lock-replace-install-lockable', label: 'Lockable latch', price: 129, rating: '4.84 (929 reviews)' },
    { id: 'car-door-lock-replace-install-towerbolt', label: 'Tower bolt', price: 129, rating: '4.85 (879 reviews)' },
    { id: 'car-door-lock-replace-install-chain', label: 'Chain latch', price: 129, rating: '4.79 (118 reviews)' },
    { id: 'car-door-lock-replace-install-roundknob', label: 'Round knob', price: 499, rating: '4.79 (852 reviews)' },
    { id: 'car-door-lock-replace-install-handlereplace', label: 'Handle lock replacement', price: 299, rating: '4.80 (4K reviews)' },
    { id: 'car-door-lock-replace-install-handleinstall', label: 'Handle lock installation', price: 699, rating: '4.73 (688 reviews)' },
  ] },
  { id: 'car-door-hinges-repair-replacement', title: 'Door hinges repair/replacement', sections: ['wooden-door'], rating: '4.81 (2K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoWoodenDoor />, options: [
    { id: 'car-door-hinges-repair-replacement-repair', label: 'Repair (per Hinge)', price: 199, rating: '4.81 (1K reviews)' },
    { id: 'car-door-hinges-repair-replacement-replace', label: 'Replacement (per Hinge)', price: 269, rating: '4.82 (642 reviews)' },
  ] },
  { id: 'car-door-accessories-mesh-install', title: 'Door accessories & mesh installation', sections: ['wooden-door'], rating: '4.79 (76K reviews)', price: 129, priceLabel: 'starts-at', icon: <IcoWoodenDoor />, options: [
    { id: 'car-door-accessories-mesh-install-chain', label: 'Chain latch', price: 129, rating: '4.89 (119 reviews)' },
    { id: 'car-door-accessories-mesh-install-lockable', label: 'Lockable latch', price: 129, rating: '4.81 (23K reviews)' },
    { id: 'car-door-accessories-mesh-install-towerbolt', label: 'Tower bolt', price: 129, rating: '4.85 (226 reviews)' },
    { id: 'car-door-accessories-mesh-install-bottomstopper', label: 'Bottom stopper', price: 129, rating: '4.81 (32K reviews)' },
    { id: 'car-door-accessories-mesh-install-peephole', label: 'Peephole', price: 129, rating: '4.78 (4K reviews)' },
    { id: 'car-door-accessories-mesh-install-closer', label: 'Overhead/ wall-mounted closer', price: 199, rating: '4.73 (14K reviews)' },
    { id: 'car-door-accessories-mesh-install-concealedcloser', label: 'Concealed closer', price: 299, rating: '4.71 (2K reviews)' },
    { id: 'car-door-accessories-mesh-install-mesh', label: 'Mesh replacement', price: 349, rating: '4.65 (2K reviews)' },
  ] },

  // ── Cupboard & drawer ──
  { id: 'car-combo-cupboard-drawer', title: 'Combo for cupboard & drawer', sections: ['cupboard-drawer'], rating: '4.78 (175K reviews)', price: 149, durationMin: 40, badge: 'Package · 10% off', icon: <IcoCupboardDrawer /> },
  { id: 'car-cupboard-repair-install', title: 'Cupboard repair & installation', sections: ['cupboard-drawer'], rating: '4.80 (120K reviews)', price: 89, priceLabel: 'starts-at', icon: <IcoCupboardDrawer />, options: [
    { id: 'car-cupboard-repair-install-handle', label: 'Handle repair/replacement', price: 89, rating: '4.78 (9K reviews)' },
    { id: 'car-cupboard-repair-install-rod', label: 'Cupboard rod installation', price: 99, rating: '4.74 (6K reviews)' },
    { id: 'car-cupboard-repair-install-hinge', label: 'Hinge repair/replace (upto 2)', price: 149, rating: '4.81 (57K reviews)' },
    { id: 'car-cupboard-repair-install-regularchannel', label: 'Regular channel repair', price: 199, rating: '4.79 (18K reviews)' },
    { id: 'car-cupboard-repair-install-softclosechannel', label: 'Soft close channel repair', price: 299, rating: '4.79 (6K reviews)' },
    { id: 'car-cupboard-repair-install-slidingdoor', label: 'Cupboard sliding door repair', price: 349, rating: '4.79 (28K reviews)' },
  ] },
  // Demo options below (this item's own breakdown was never captured in
  // any reference pass) — own plausible labels/prices, cheapest tier
  // matching this item's existing "Starts at ₹X", no rating (no real
  // per-option rating source exists for these).
  { id: 'car-cupboard-drawer-locks', title: 'Cupboard & drawer locks', sections: ['cupboard-drawer', 'lock-hinge'], rating: '4.75 (43K reviews)', price: 79, priceLabel: 'starts-at', icon: <IcoCupboardDrawer />, options: [
    { id: 'car-cupboard-drawer-locks-drawer', label: 'Drawer lock', price: 79 },
    { id: 'car-cupboard-drawer-locks-cupboard', label: 'Cupboard lock', price: 89 },
    { id: 'car-cupboard-drawer-locks-sliding', label: 'Sliding door lock', price: 99 },
    { id: 'car-cupboard-drawer-locks-multipoint', label: 'Multi-point lock', price: 149 },
  ] },
  { id: 'car-drawer-repair-install', title: 'Drawer repair & installation', sections: ['cupboard-drawer'], rating: '4.78 (34K reviews)', price: 89, priceLabel: 'starts-at', icon: <IcoCupboardDrawer />, options: [
    { id: 'car-drawer-repair-install-channel', label: 'Channel repair', price: 89 },
    { id: 'car-drawer-repair-install-handle', label: 'Handle repair', price: 99 },
    { id: 'car-drawer-repair-install-bottom', label: 'Drawer bottom repair', price: 129 },
    { id: 'car-drawer-repair-install-install', label: 'Drawer installation', price: 199 },
  ] },

  // ── Décor & mirror ──
  { id: 'car-combo-decor-install', title: 'Combo for decor installation', sections: ['decor-mirror'], rating: '4.82 (318K reviews)', price: 79, durationMin: 10, badge: 'Package · 10% off', icon: <IcoDecorMirror /> },
  { id: 'car-decor-install-small', title: 'Décor installation (Small)', sections: ['decor-mirror'], rating: '4.84 (116K reviews)', price: 79, priceLabel: 'starts-at', notes: ['For item sizes upto 8 x 8 inch', 'Items such as photo frames, clocks, key holder etc.'], icon: <IcoDecorMirror />, options: [
    { id: 'car-decor-install-small-photoframe', label: 'Photo frame', price: 79 },
    { id: 'car-decor-install-small-clock', label: 'Wall clock', price: 79 },
    { id: 'car-decor-install-small-keyholder', label: 'Key holder', price: 79 },
    { id: 'car-decor-install-small-hook', label: 'Wall hook', price: 79 },
    { id: 'car-decor-install-small-nameplate', label: 'Nameplate', price: 89 },
    { id: 'car-decor-install-small-calendar', label: 'Calendar holder', price: 89 },
    { id: 'car-decor-install-small-mirror', label: 'Small mirror', price: 99 },
    { id: 'car-decor-install-small-artpanel', label: 'Wall art panel', price: 99 },
  ] },
  { id: 'car-decor-install-large', title: 'Décor installation (Large)', sections: ['decor-mirror'], rating: '4.84 (56K reviews)', price: 129, priceLabel: 'starts-at', notes: ['For item sizes more than 8 x 8 inch', 'Includes items such as photo frames, clocks, key holder etc.'], icon: <IcoDecorMirror />, options: [
    { id: 'car-decor-install-large-photoframe', label: 'Large photo frame', price: 129 },
    { id: 'car-decor-install-large-clock', label: 'Large wall clock', price: 129 },
    { id: 'car-decor-install-large-mirror', label: 'Large mirror', price: 149 },
    { id: 'car-decor-install-large-artpanel', label: 'Wall art panel (large)', price: 149 },
    { id: 'car-decor-install-large-woodpanel', label: 'Wooden wall panel', price: 179 },
    { id: 'car-decor-install-large-shelf', label: 'Decorative shelf', price: 179 },
    { id: 'car-decor-install-large-sculpture', label: 'Wall-mounted sculpture', price: 199 },
    { id: 'car-decor-install-large-plaque', label: 'Large nameplate/plaque', price: 199 },
  ] },
  { id: 'car-mirror-install', title: 'Mirror installation', sections: ['decor-mirror', 'bath-fittings-mirrors'], rating: '4.80 (47K reviews)', price: 149, priceLabel: 'starts-at', note: 'Porcelain Tiles may require additional material cost (i.e. drilling)', icon: <IcoDecorMirror />, options: [
    { id: 'car-mirror-install-wall', label: 'Wall mirror', price: 149 },
    { id: 'car-mirror-install-fulllength', label: 'Full-length mirror', price: 249 },
  ] },
  { id: 'car-ceiling-hook-fastener-install', title: 'Ceiling Hook/Fastener Installation', sections: ['decor-mirror', 'balcony-fittings'], rating: '4.72 (3K reviews)', price: 99, durationMin: 20, note: 'For hanging lights, ceiling hangers, planters, swings, etc.', icon: <IcoDecorMirror /> },

  // ── Shelf & cabinet ──
  { id: 'car-combo-shelves-cabinets', title: 'Combo for shelves & cabinets', sections: ['shelf-cabinet'], rating: '4.80 (104K reviews)', price: 99, durationMin: 15, badge: 'Package · 10% off', icon: <IcoShelfCabinet /> },
  { id: 'car-shelf-install-general', title: 'Shelf installation', sections: ['shelf-cabinet'], rating: '4.80 (98K reviews)', price: 99, priceLabel: 'starts-at', note: 'Porcelain tiles may require additional material cost (i.e., spl. drilling bits)', icon: <IcoShelfCabinet />, options: [
    { id: 'car-shelf-install-general-wooden', label: 'Wooden shelf', price: 99 },
    { id: 'car-shelf-install-general-glass', label: 'Glass shelf', price: 129 },
    { id: 'car-shelf-install-general-floating', label: 'Floating shelf', price: 149 },
  ] },
  { id: 'car-wall-cabinet-assembly-install', title: 'Wall cabinet assembly & installation', sections: ['shelf-cabinet'], rating: '4.72 (2K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoShelfCabinet />, options: [
    { id: 'car-wall-cabinet-assembly-install-small', label: 'Small cabinet', price: 199 },
    { id: 'car-wall-cabinet-assembly-install-large', label: 'Large cabinet', price: 349 },
  ] },
  { id: 'car-bathroom-mirror-cabinet-install', title: 'Bathroom mirror cabinet installation', sections: ['shelf-cabinet', 'bath-fittings-mirrors'], rating: '4.86 (3K reviews)', price: 499, priceLabel: 'starts-at', icon: <IcoShelfCabinet />, options: [
    { id: 'car-bathroom-mirror-cabinet-install-nolight', label: 'Without light', price: 499 },
    { id: 'car-bathroom-mirror-cabinet-install-light', label: 'With light', price: 649 },
  ] },

  // ── Lock & Hinge (own new items — the 3 cross-listed ones are
  // defined above and simply carry 'lock-hinge' in their own sections) ──
  { id: 'car-combo-door-locks', title: 'Combo for door locks', sections: ['lock-hinge'], rating: '4.77 (59K reviews)', price: 99, durationMin: 10, badge: 'Package · 10% off', icon: <IcoLockHinge /> },
  { id: 'car-combo-hinges-channels', title: 'Combo for hinges & channels', sections: ['lock-hinge'], rating: '4.79 (92K reviews)', price: 149, durationMin: 40, badge: 'Package · 10% off', icon: <IcoLockHinge /> },
  { id: 'car-hinge-repair-replacement', title: 'Hinge repair & replacement', sections: ['lock-hinge'], rating: '4.81 (57K reviews)', price: 149, priceLabel: 'starts-at', icon: <IcoLockHinge />, options: [
    { id: 'car-hinge-repair-replacement-repair', label: 'Repair (per hinge)', price: 149 },
    { id: 'car-hinge-repair-replacement-replace', label: 'Replacement (per hinge)', price: 199 },
    { id: 'car-hinge-repair-replacement-concealedrepair', label: 'Concealed hinge repair', price: 199 },
    { id: 'car-hinge-repair-replacement-concealedreplace', label: 'Concealed hinge replacement', price: 249 },
  ] },
  { id: 'car-channel-repair-replacement', title: 'Channel repair & replacement', sections: ['lock-hinge'], rating: '4.79 (23K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoLockHinge />, options: [
    { id: 'car-channel-repair-replacement-repair', label: 'Repair', price: 199 },
    { id: 'car-channel-repair-replacement-replace', label: 'Replacement', price: 299 },
  ] },

  // ── Curtain & window ──
  { id: 'car-combo-curtains-windows', title: 'Combo for curtains & windows', sections: ['curtain-window'], rating: '4.70 (53K reviews)', price: 49, durationMin: 10, badge: 'Package · 10% off', icon: <IcoCurtainWindow /> },
  { id: 'car-curtain-rod-install', title: 'Curtain rod installation', sections: ['curtain-window'], rating: '4.82 (9K reviews)', price: 199, durationMin: 20, icon: <IcoCurtainWindow /> },
  { id: 'car-mosquito-net-install', title: 'Mosquito net installation', sections: ['curtain-window'], rating: '4.60 (10K reviews)', price: 149, priceLabel: 'starts-at', icon: <IcoCurtainWindow />, options: [
    { id: 'car-mosquito-net-install-fixed', label: 'Fixed mesh', price: 149 },
    { id: 'car-mosquito-net-install-sliding', label: 'Sliding mesh', price: 199 },
    { id: 'car-mosquito-net-install-roller', label: 'Roller mesh', price: 299 },
  ] },
  { id: 'car-blinds-fitting-inspection', title: 'Blinds fitting inspection & measurement', sections: ['curtain-window'], rating: '4.68 (15K reviews)', price: 49, priceLabel: 'starts-at', icon: <IcoCurtainWindow />, options: [
    { id: 'car-blinds-fitting-inspection-roller', label: 'Roller blinds', price: 49 },
    { id: 'car-blinds-fitting-inspection-vertical', label: 'Vertical blinds', price: 59 },
    { id: 'car-blinds-fitting-inspection-venetian', label: 'Venetian blinds', price: 69 },
  ] },
  { id: 'car-window-accessories', title: 'Window accessories', sections: ['curtain-window'], rating: '4.77 (6K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoCurtainWindow />, options: [
    { id: 'car-window-accessories-handle', label: 'Window handle', price: 99 },
    { id: 'car-window-accessories-stopper', label: 'Window stopper', price: 99 },
    { id: 'car-window-accessories-lock', label: 'Window lock', price: 129 },
  ] },
  { id: 'car-window-ac-frame-install-uninstall', title: 'Window AC frame install/ uninstall', sections: ['curtain-window'], rating: '4.69 (5K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoCurtainWindow />, options: [
    { id: 'car-window-ac-frame-install-uninstall-uninstall', label: 'Uninstallation', price: 99 },
    { id: 'car-window-ac-frame-install-uninstall-install', label: 'Installation', price: 149 },
  ] },
  { id: 'car-window-misalignment-jam-repair', title: 'Window misalignment/ jam repair', sections: ['curtain-window'], rating: '4.68 (9K reviews)', price: 149, priceLabel: 'starts-at', icon: <IcoCurtainWindow />, options: [
    { id: 'car-window-misalignment-jam-repair-minor', label: 'Minor misalignment', price: 149 },
    { id: 'car-window-misalignment-jam-repair-jammed', label: 'Jammed window repair', price: 199 },
  ] },

  // ── Furniture repair ──
  { id: 'car-combo-furniture-repair', title: 'Combo for furniture repair', sections: ['furniture-repair'], rating: '4.79 (73K reviews)', price: 199, durationMin: 20, badge: 'Package · 10% off', icon: <IcoFurnitureRepair /> },
  { id: 'car-wooden-bed-repair', title: 'Wooden bed repair', sections: ['furniture-repair'], rating: '4.80 (43K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoFurnitureRepair />, options: [
    { id: 'car-wooden-bed-repair-minor', label: 'Minor repair', price: 199 },
    { id: 'car-wooden-bed-repair-major', label: 'Major repair', price: 349 },
  ] },
  { id: 'car-wooden-chair-table-sofa-repair', title: 'Wooden chair, table, sofa repair', sections: ['furniture-repair'], rating: '4.79 (28K reviews)', price: 49, priceLabel: 'starts-at', icon: <IcoFurnitureRepair />, options: [
    { id: 'car-wooden-chair-table-sofa-repair-chair', label: 'Chair repair', price: 49 },
    { id: 'car-wooden-chair-table-sofa-repair-stool', label: 'Stool repair', price: 49 },
    { id: 'car-wooden-chair-table-sofa-repair-table', label: 'Table repair', price: 99 },
    { id: 'car-wooden-chair-table-sofa-repair-sofa', label: 'Sofa frame repair', price: 199 },
  ] },

  // ── Furniture assembly ──
  { id: 'car-single-bed-assembly', title: 'Single bed assembly', sections: ['furniture-assembly'], rating: '4.84 (4K reviews)', price: 449, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-single-bed-assembly-nostorage', label: 'Without storage', price: 449 },
    { id: 'car-single-bed-assembly-storage', label: 'With storage', price: 599 },
  ] },
  { id: 'car-double-bed-assembly', title: 'Double bed assembly', sections: ['furniture-assembly'], rating: '4.86 (17K reviews)', price: 599, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-double-bed-assembly-nostorage', label: 'Without storage', price: 599 },
    { id: 'car-double-bed-assembly-storage', label: 'With storage', price: 799 },
  ] },
  { id: 'car-hydraulic-bed-assembly', title: 'Hydraulic bed assembly', sections: ['furniture-assembly'], rating: '4.86 (4K reviews)', price: 1299, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-hydraulic-bed-assembly-single', label: 'Single', price: 1299 },
    { id: 'car-hydraulic-bed-assembly-double', label: 'Double', price: 1599 },
  ] },
  { id: 'car-study-table-assembly', title: 'Study table assembly', sections: ['furniture-assembly'], rating: '4.89 (10K reviews)', price: 449, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-study-table-assembly-nodrawers', label: 'Without drawers', price: 449 },
    { id: 'car-study-table-assembly-drawers', label: 'With drawers', price: 599 },
  ] },
  { id: 'car-coffee-table-assembly', title: 'Coffee table assembly', sections: ['furniture-assembly'], rating: '4.85 (3K reviews)', price: 269, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-coffee-table-assembly-small', label: 'Small', price: 269 },
    { id: 'car-coffee-table-assembly-medium', label: 'Medium', price: 349 },
    { id: 'car-coffee-table-assembly-large', label: 'Large', price: 449 },
  ] },
  { id: 'car-cabinet-assembly', title: 'Cabinet assembly', sections: ['furniture-assembly'], rating: '4.87 (6K reviews)', price: 499, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-cabinet-assembly-2door', label: '2-door', price: 499 },
    { id: 'car-cabinet-assembly-3door', label: '3-door', price: 699 },
    { id: 'car-cabinet-assembly-4door', label: '4-door', price: 899 },
    { id: 'car-cabinet-assembly-corner', label: 'Corner cabinet', price: 999 },
  ] },
  { id: 'car-shelving-unit-assembly-install', title: 'Shelving unit assembly & installation', sections: ['furniture-assembly'], rating: '4.84 (6K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-shelving-unit-assembly-install-3tier', label: '3-tier', price: 199 },
    { id: 'car-shelving-unit-assembly-install-5tier', label: '5-tier', price: 299 },
    { id: 'car-shelving-unit-assembly-install-modular', label: 'Modular', price: 399 },
  ] },
  { id: 'car-mandir-assembly-install', title: 'Mandir assembly & installation', sections: ['furniture-assembly'], rating: '4.82 (3K reviews)', price: 199, durationMin: 20, icon: <IcoFurnitureAssembly /> },
  { id: 'car-double-door-wardrobe-assembly', title: 'Double door wardrobe assembly', sections: ['furniture-assembly'], rating: '4.82 (2K reviews)', price: 849, durationMin: 120, icon: <IcoFurnitureAssembly /> },
  { id: 'car-three-door-wardrobe-assembly', title: 'Three door wardrobe assembly', sections: ['furniture-assembly'], rating: '4.81 (4K reviews)', price: 949, durationMin: 150, icon: <IcoFurnitureAssembly /> },
  { id: 'car-office-chair-assembly', title: 'Office chair assembly', sections: ['furniture-assembly'], rating: '4.85 (8K reviews)', price: 249, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-office-chair-assembly-basic', label: 'Basic', price: 249 },
    { id: 'car-office-chair-assembly-ergonomic', label: 'Ergonomic', price: 349 },
    { id: 'car-office-chair-assembly-executive', label: 'Executive', price: 449 },
  ] },
  { id: 'car-bookshelf-assembly-install', title: 'Book shelf/bookcase assembly & installation', sections: ['furniture-assembly'], rating: '4.84 (4K reviews)', price: 249, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-bookshelf-assembly-install-2tier', label: '2-tier', price: 249 },
    { id: 'car-bookshelf-assembly-install-3tier', label: '3-tier', price: 349 },
    { id: 'car-bookshelf-assembly-install-4tier', label: '4-tier', price: 449 },
    { id: 'car-bookshelf-assembly-install-5tier', label: '5-tier', price: 549 },
    { id: 'car-bookshelf-assembly-install-corner', label: 'Corner bookcase', price: 649 },
  ] },
  { id: 'car-cot-assembly', title: 'Cot assembly', sections: ['furniture-assembly'], rating: '4.83 (1K reviews)', price: 399, durationMin: 30, icon: <IcoFurnitureAssembly /> },
  { id: 'car-single-door-wardrobe-assembly', title: 'Single door wardrobe assembly', sections: ['furniture-assembly'], rating: '4.83 (1K reviews)', price: 599, durationMin: 120, icon: <IcoFurnitureAssembly /> },
  { id: 'car-table-chair-wheel-fitting', title: 'Table/chair wheel fitting', sections: ['furniture-assembly'], rating: '4.77 (9K reviews)', price: 119, durationMin: 15, icon: <IcoFurnitureAssembly /> },
  { id: 'car-four-door-wardrobe-assembly', title: 'Four door wardrobe assembly', sections: ['furniture-assembly'], rating: '4.79 (2K reviews)', price: 1049, durationMin: 180, icon: <IcoFurnitureAssembly /> },
  { id: 'car-shoe-rack-assembly', title: 'Shoe rack assembly', sections: ['furniture-assembly'], rating: '4.79 (3K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-shoe-rack-assembly-small', label: 'Small', price: 199 },
    { id: 'car-shoe-rack-assembly-large', label: 'Large', price: 349 },
  ] },
  { id: 'car-standing-table-assembly', title: 'Standing table assembly', sections: ['furniture-assembly'], rating: '4.86 (1K reviews)', price: 999, durationMin: 150, icon: <IcoFurnitureAssembly /> },
  { id: 'car-shoe-cabinet-assembly', title: 'Shoe cabinet assembly', sections: ['furniture-assembly'], rating: '4.86 (3K reviews)', price: 299, priceLabel: 'starts-at', icon: <IcoFurnitureAssembly />, options: [
    { id: 'car-shoe-cabinet-assembly-2tier', label: '2-tier', price: 299 },
    { id: 'car-shoe-cabinet-assembly-3tier', label: '3-tier', price: 399 },
    { id: 'car-shoe-cabinet-assembly-4tier', label: '4-tier', price: 499 },
    { id: 'car-shoe-cabinet-assembly-5tier', label: '5-tier', price: 599 },
  ] },

  // ── Kitchen fittings ──
  { id: 'car-combo-kitchen-fittings', title: 'Combo for kitchen fittings', sections: ['kitchen-fittings'], rating: '4.80 (192K reviews)', price: 149, durationMin: 15, badge: 'Package · 10% off', icon: <IcoKitchenFittings /> },
  { id: 'car-drawer-cabinet', title: 'Drawer & cabinet', sections: ['kitchen-fittings'], rating: '4.79 (101K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoKitchenFittings />, options: [
    { id: 'car-drawer-cabinet-channel', label: 'Drawer channel repair', price: 99 },
    { id: 'car-drawer-cabinet-hinge', label: 'Cabinet hinge repair', price: 99 },
    { id: 'car-drawer-cabinet-handle', label: 'Cabinet handle install', price: 99 },
    { id: 'car-drawer-cabinet-install', label: 'Drawer installation', price: 199 },
  ] },
  { id: 'car-utensil-rack-install', title: 'Utensil rack installation', sections: ['kitchen-fittings'], rating: '4.83 (9K reviews)', price: 199, durationMin: 10, icon: <IcoKitchenFittings /> },
  { id: 'car-shelf-install-kitchen', title: 'Shelf installation', sections: ['kitchen-fittings'], rating: '4.80 (81K reviews)', price: 149, priceLabel: 'starts-at', icon: <IcoKitchenFittings />, options: [
    { id: 'car-shelf-install-kitchen-wooden', label: 'Wooden shelf', price: 149 },
    { id: 'car-shelf-install-kitchen-modular', label: 'Modular shelf', price: 249 },
  ] },

  // ── Bath fittings & mirrors (own new items — the 2 cross-listed
  // ones are defined above and simply carry 'bath-fittings-mirrors' in
  // their own sections) ──
  { id: 'car-combo-bath-fittings', title: 'Combo for bath fittings', sections: ['bath-fittings-mirrors'], rating: '4.79 (97K reviews)', price: 99, durationMin: 15, badge: 'Package · 10% off', icon: <IcoBathFittingsMirrors /> },
  { id: 'car-bath-accessories-install', title: 'Bath accessories installation', sections: ['bath-fittings-mirrors'], rating: '4.79 (15K reviews)', price: 99, priceLabel: 'starts-at', note: 'Porcelain Tiles may require additional material cost (i.e. specialized drilling)', icon: <IcoBathFittingsMirrors />, options: [
    { id: 'car-bath-accessories-install-towelrack', label: 'Towel rack', price: 99 },
    { id: 'car-bath-accessories-install-robehook', label: 'Robe hook', price: 99 },
    { id: 'car-bath-accessories-install-paperholder', label: 'Toilet paper holder', price: 99 },
    { id: 'car-bath-accessories-install-soapdispenser', label: 'Soap dispenser holder', price: 129 },
  ] },
  { id: 'car-shelf-install-bath', title: 'Shelf installation', sections: ['bath-fittings-mirrors'], rating: '4.78 (32K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoBathFittingsMirrors />, options: [
    { id: 'car-shelf-install-bath-glass', label: 'Glass shelf', price: 99 },
    { id: 'car-shelf-install-bath-corner', label: 'Corner shelf', price: 119 },
  ] },

  // ── Balcony fittings (own new items — Ceiling Hook/Fastener
  // Installation is defined above and cross-listed here) ──
  { id: 'car-clothes-hanger-install', title: 'Clothes hanger installation', sections: ['balcony-fittings'], rating: '4.80 (33K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoBalconyFittings />, options: [
    { id: 'car-clothes-hanger-install-wall', label: 'Wall-mounted', price: 199 },
    { id: 'car-clothes-hanger-install-ceiling', label: 'Ceiling-mounted', price: 249 },
    { id: 'car-clothes-hanger-install-retractable', label: 'Retractable', price: 349 },
  ] },
  { id: 'car-cloth-drying-rope-install', title: 'Cloth drying rope installation', sections: ['balcony-fittings'], rating: '4.68 (9K reviews)', price: 159, durationMin: 15, icon: <IcoBalconyFittings /> },

  // ── At home consultation ──
  { id: 'car-book-carpenter', title: 'Book a carpenter', sections: ['consultation'], rating: '4.66 (183K reviews)', price: 49, durationMin: 20, notes: ['Expert evaluates your requirements and shares quote', 'Service begins immediately after acceptance'], icon: <IcoConsultation /> },
]

const SECTIONS: { id: CarpentrySection; label: string; icon: React.ReactNode }[] = [
  { id: 'wooden-door', label: 'Wooden door', icon: <IcoWoodenDoor /> },
  { id: 'cupboard-drawer', label: 'Cupboard & drawer', icon: <IcoCupboardDrawer /> },
  { id: 'decor-mirror', label: 'Décor & mirror', icon: <IcoDecorMirror /> },
  { id: 'shelf-cabinet', label: 'Shelf & cabinet', icon: <IcoShelfCabinet /> },
  { id: 'lock-hinge', label: 'Lock & Hinge', icon: <IcoLockHinge /> },
  { id: 'curtain-window', label: 'Curtain & window', icon: <IcoCurtainWindow /> },
  { id: 'furniture-repair', label: 'Furniture repair', icon: <IcoFurnitureRepair /> },
  { id: 'furniture-assembly', label: 'Furniture assembly', icon: <IcoFurnitureAssembly /> },
  { id: 'kitchen-fittings', label: 'Kitchen fittings', icon: <IcoKitchenFittings /> },
  { id: 'bath-fittings-mirrors', label: 'Bath fittings & mirrors', icon: <IcoBathFittingsMirrors /> },
  { id: 'balcony-fittings', label: 'Balcony fittings', icon: <IcoBalconyFittings /> },
  { id: 'consultation', label: 'At home consultation', icon: <IcoConsultation /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<CarpentrySection, { title: string; subtitle: string }> = {
  'wooden-door': { title: 'Doors that open right', subtitle: 'Repairs, new installs, locks & hinges for wooden doors.' },
  'cupboard-drawer': { title: 'Cupboards that close smoothly', subtitle: 'Repairs, installs & locks for cupboards and drawers.' },
  'decor-mirror': { title: 'Hang it up properly', subtitle: 'Frames, mirrors & décor, mounted the right way.' },
  'shelf-cabinet': { title: 'More storage, done neatly', subtitle: 'Shelves and cabinets, installed or assembled.' },
  'lock-hinge': { title: 'Small parts, done right', subtitle: 'Locks, hinges & channels, repaired or replaced.' },
  'curtain-window': { title: 'Windows that work well', subtitle: 'Curtain rods, mosquito nets & window fittings.' },
  'furniture-repair': { title: 'Give your furniture new life', subtitle: 'Beds, chairs, tables & sofas, repaired by a carpenter.' },
  'furniture-assembly': { title: 'Flat-packed to fully built', subtitle: 'Beds, wardrobes, tables & more, assembled for you.' },
  'kitchen-fittings': { title: 'A kitchen that works for you', subtitle: 'Drawers, cabinets & racks, fitted properly.' },
  'bath-fittings-mirrors': { title: 'The bathroom details matter', subtitle: 'Mirrors, cabinets & accessories, mounted safely.' },
  'balcony-fittings': { title: 'Make the most of your balcony', subtitle: 'Hangers, drying ropes & hooks, installed securely.' },
  consultation: { title: 'Not sure what’s wrong?', subtitle: 'Book a consultation before you commit to a repair.' },
}

function getItem(id: string): CarpentryItem {
  const item = CARPENTRY_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Carpentry item id: ${id}`)
  return item
}

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Carpentry</span>
      </div>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBell /></button>
    </div>
  )
}

function TopHeader({ onNavigate }: { onNavigate: (s: string, data?: Record<string, string>) => void }) {
  // Profile is already reachable from the Sidebar's own "Profile" item, so
  // this header slot carries the Cart instead — a real, live count from the
  // one shared Customer cart (Customer Implementation 07 parity with
  // Plumbing/Electrician), not a decorative avatar.
  const { itemCount } = useCustomerCart()
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('home-services')} aria-label="Back to Services" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"><IcoBack /></button>
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Carpentry</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'carpentry' })}
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

// ─── "Select a service" jump chips — same sticky/glass/alignment recipe
// as every other service-detail screen in this app. ────────────────────

function ServiceTabs({ onJump }: { onJump: (id: string) => void }) {
  return (
    <div className="bg-[var(--hz-surface)]/70 backdrop-blur-md border border-[var(--hz-border)] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0 shrink-0 w-[86px]"
          >
            <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[var(--hz-border)] flex items-center justify-center bg-[#F9F5FF] text-[var(--hz-primary)] shrink-0">
              {s.icon}
            </div>
            <span className="text-[12px] text-[var(--hz-ink)] text-center leading-tight break-words w-full" style={{ fontFamily: FONT_BODY }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Hero — no real carpentry photo exists in this project, so this
// uses the same warm-gradient + icon placeholder every other missing-
// photo surface in this app falls back to; the real page rating/
// bookings figure is kept as a small chip, same real data point every
// sibling screen keeps where the reference shows one. ──────────────────

function HeroBanner({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Electrician, Plumber &amp; Carpenter</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Woodwork,<br />done properly.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Doors, furniture & fittings — a 30-day warranty on every service.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <span className="flex items-center gap-1 text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={13} /> 4.78 <span className="text-[var(--hz-ink-muted)] font-normal" style={{ fontFamily: FONT_BODY }}>(2.9M bookings)</span></span>
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore services
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[var(--hz-primary)] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoWoodenDoor /></div>
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
      style={{ background: 'linear-gradient(120deg, #F9F5FF 0%, var(--hz-primary-soft) 60%, #FFF3EA 100%)' }}
    >
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[14px] bg-[var(--hz-surface)]/70 flex items-center justify-center text-[var(--hz-primary)] shrink-0 shadow-sm">{icon}</div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[16px] sm:text-[19px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{title}</span>
        <span className="text-[12.5px] sm:text-[13px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{subtitle}</span>
      </div>
    </div>
  )
}

// ─── Card chrome ─────────────────────────────────────────────────────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, var(--hz-surface) 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-[var(--hz-surface)] border-[var(--hz-border)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)]'
const NEUTRAL_BTN_ADDED = 'bg-[var(--hz-primary-soft)] border-[var(--hz-primary)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

function ItemMeta({ item }: { item: CarpentryItem }) {
  return (
    <div className="text-left sm:text-right">
      <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
        {item.priceLabel === 'starts-at' && <span className="text-[var(--hz-ink-muted)]">Starts at </span>}
        <span className="font-semibold text-[var(--hz-ink)]">₹{item.price.toLocaleString('en-IN')}</span>
      </div>
      {item.durationMin !== undefined ? (
        <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
      ) : item.options ? (
        <div className="text-[11px] text-[var(--hz-ink-subtle)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>{item.options.length} option{item.options.length > 1 ? 's' : ''}</div>
      ) : item.optionsCount !== undefined ? (
        <div className="text-[11px] text-[var(--hz-ink-subtle)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''}</div>
      ) : null}
    </div>
  )
}

function CarpentryLineItemRow({ item, cartCount, getCartCount, onAdd, onViewDetails }: {
  item: CarpentryItem
  cartCount: number
  /** Looks up how many of a given cart-line id are in the cart — reused
   *  here to check each of this item's OPTION ids too, so a selected
   *  variant can be called out on the card (same pattern as Prime/
   *  Electrician/Plumbing). */
  getCartCount: (id: string) => number
  onAdd: () => void
  onViewDetails: () => void
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative w-32 h-32 shrink-0 mx-auto sm:mx-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[var(--hz-primary)]">
        {item.icon}
        {item.badge && (
          <span
            className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-[3px] rounded-full text-[9.5px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#0F7A3D', fontFamily: FONT_BODY }}
          >
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        {item.rating && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        )}
        {item.note && (
          <span className="text-[11.5px] text-[var(--hz-ink-subtle)] leading-snug italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>
        )}
        {item.notes?.map(n => (
          <span key={n} className="text-[11.5px] text-[var(--hz-ink-subtle)] leading-snug" style={{ fontFamily: FONT_BODY }}>• {n}</span>
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
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[var(--hz-primary)] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
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
  item: CarpentryItem
  cartCount: number
  onAdd: () => void
  onSelectOptions: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        className="w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-[16px] bg-[var(--hz-surface)] flex flex-col"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--hz-surface-muted)] sticky top-0 bg-[var(--hz-surface)]">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[16px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            {item.rating && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="w-16 h-16 rounded-[12px] flex items-center justify-center bg-[#F9F5FF] text-[var(--hz-primary)]">{item.icon}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[13.5px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
              {item.priceLabel === 'starts-at' && <span className="text-[var(--hz-ink-muted)]">Starts at </span>}
              <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
            </span>
            {item.durationMin !== undefined && (
              <span className="text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>
            )}
            {item.options ? (
              <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.options.length} option{item.options.length > 1 ? 's' : ''} available at booking</span>
            ) : item.optionsCount !== undefined && (
              <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''} available at booking</span>
            )}
          </div>
          {item.note && <span className="text-[12px] text-[var(--hz-ink-subtle)] italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>}
          {item.notes?.map(n => (
            <span key={n} className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>• {n}</span>
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
// one real way to book it. Same calm card language as the rest of this
// file, immediate-select (click a row = add it and close) — same
// pattern as Salon Luxe/Prime/Electrician/Plumbing's own OptionsModal.
// Ratings render only when the option actually carries one (real,
// reference-sourced options do; originally-authored demo options — see
// the CarpentryItemOption interface comment — never fabricate one). ────

function CarpentryOptionsModal({ item, cartCountForOption, onAddOption, onClose }: {
  item: CarpentryItem
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: CarpentryItemOption) => void
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
        className="w-full max-w-[440px] max-h-[80vh] overflow-y-auto rounded-[16px] bg-[var(--hz-surface)] flex flex-col"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--hz-surface-muted)] sticky top-0 bg-[var(--hz-surface)]">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[16px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Choose an option</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>
        <div className="flex flex-col gap-2.5 p-4">
          {item.options.map(opt => {
            const cartCount = cartCountForOption(opt.id)
            return (
              <div key={opt.id} className="flex items-center gap-3 rounded-[12px] p-3" style={CARD_SURFACE}>
                <div className="w-32 h-32 rounded-[10px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[var(--hz-primary)] shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{opt.label}</span>
                  <span className="text-[13px] font-semibold text-[var(--hz-ink)] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>₹{opt.price.toLocaleString('en-IN')}</span>
                  {opt.rating && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {opt.rating}</span>
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
    <div className="flex items-center gap-1.5 rounded-[10px] border border-[var(--hz-primary)] shrink-0">
      <button onClick={onDecrement} aria-label="Decrease quantity" className="w-7 h-7 flex items-center justify-center text-[var(--hz-primary)] text-[16px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] transition-all border-0 bg-transparent rounded-l-[9px]">−</button>
      <span className="text-[13px] font-semibold text-[var(--hz-ink)] w-3 text-center" style={{ fontFamily: FONT_BODY }}>{qty}</span>
      <button onClick={onIncrement} aria-label="Increase quantity" className="w-7 h-7 flex items-center justify-center text-[var(--hz-primary)] text-[16px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] transition-all border-0 bg-transparent rounded-r-[9px]">+</button>
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
    <div className="bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Cart</span>
      <div className="flex flex-col">
        {cart.map((c, i) => (
          <div key={c.cartId} className={`flex flex-col gap-2 py-3 ${i > 0 ? 'border-t border-[var(--hz-surface-muted)]' : 'pt-0'}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{c.title}</span>
              <CartStepper qty={c.qty} onDecrement={() => onChangeQty(c.cartId, -1)} onIncrement={() => onChangeQty(c.cartId, 1)} />
            </div>
            <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>₹{c.price}</span>
            {c.duration && <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>• {c.duration}</span>}
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
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--hz-surface-muted)]">
        <span className="text-[17px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>₹{total}</span>
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

// ─── Main Screen ────────────────────────────────────────────────────────

export default function CarpentryScreen({
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
  // CarpentryOptionsModal) — null means no picker is showing.
  const [optionsItemId, setOptionsItemId] = useState<string | null>(null)

  const addToCart = (item: CarpentryItem) => {
    addItem({
      cartId: item.id,
      serviceEntry: 'home-services',
      categoryId: 'carpentry',
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
  // picker closes. Same convention as Prime/Electrician/Plumbing's own
  // addOptionToCart.
  const addOptionToCart = (item: CarpentryItem, option: CarpentryItemOption) => {
    addItem({
      cartId: option.id,
      serviceEntry: 'home-services',
      categoryId: 'carpentry',
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
    document.getElementById(`carpentry-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'carpentry',
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
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
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Electrician, Plumber &amp; Carpenter</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Carpentry
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('wooden-door')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = CARPENTRY_ITEMS.filter(i => i.sections.includes(section.id))
                    return (
                      <div key={section.id} id={`carpentry-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <CarpentryLineItemRow
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
        <CarpentryOptionsModal
          item={getItem(optionsItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getItem(optionsItemId), option)}
          onClose={() => setOptionsItemId(null)}
        />
      )}
    </div>
  )
}
