// ─── Living & Bedroom Cleaning — Cleaning & Pest Control → Cleaning →
// Living & Bedroom Cleaning ──────────────────────────────────────────
//
// Built from a real-page reference PDF the user supplied (UB-LR14) —
// used for its "Select a service" catalogue (10 sections: Super saver
// deals, Cleaning & stain protection, Sofa & carpet, Curtain cleaning,
// Living room care, Bedroom care, Mattress & bed, Dining table &
// chairs, Other furniture, Windows & fan) and every service's own
// rating/reviews/price/original price/duration/description, taken as
// given. Values the reference didn't show are never invented — simply
// omitted. "Sofa cleaning & stain protection coating" is the
// reference's own real cross-listed item — it appears under both
// Cleaning & stain protection and Sofa & carpet with identical data, so
// both rows here share one catalogue id/cart line rather than being
// treated as two services (same pattern as Kitchen Cleaning's own
// cross-listed "Regular chimney & stove cleaning").
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell. Five items ("2 visits: Fabric sofa cleaning", "3
// visits: Mattress cleaning", "Curtain deep cleaning", "Dining table &
// chairs cleaning", "Recliner/ lounge chair") show only an "N options"
// count in the reference — the real variants sit behind a click this
// single-page capture doesn't reach — so they keep the same "N options
// available" placeholder hint (Select button, base price on Add) every
// other page in this app uses until real option data is supplied.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own page-level aggregate rating/"earliest slot" header,
// its own "Make your living space look..." marketing video, footer,
// brand promise card, and whatever was in its own cart at capture
// time.
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--hz-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5" /></svg>
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
// Section-nav & item icons
const IcoSofa = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 11V8a1.5 1.5 0 013 0v2M13.5 11V8a1.5 1.5 0 013 0v2" />
    <path d="M3.5 11h13v3a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 013.5 14v-3Z" />
    <path d="M4.5 15.5v1.5M15.5 15.5v1.5" />
  </svg>
)
const IcoMattress = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="8" width="15" height="7" rx="1.5" />
    <path d="M2.5 11h15" />
  </svg>
)
const IcoCarpet = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" />
    <rect x="5" y="7" width="10" height="6" rx="0.5" />
  </svg>
)
const IcoCurtain = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h14" />
    <path d="M5 3c0 5-1.5 6-1.5 12M9 3c0 6 1 7 1 12M13 3c0 5 1.5 6 1.5 12" />
  </svg>
)
const IcoLivingRoom = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6.5L10 2l7.5 4.5" />
    <path d="M4 6v9a1 1 0 001 1h10a1 1 0 001-1V6" />
    <path d="M7.5 12h5" />
  </svg>
)
const IcoBedroom = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17V9a1.5 1.5 0 011.5-1.5h12A1.5 1.5 0 0117.5 9v8" />
    <path d="M2.5 13.5h15" />
    <path d="M5 7.5V6a1 1 0 011-1h1.5a1 1 0 011 1v1.5" />
  </svg>
)
const IcoDiningTable = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="14" height="2.5" rx="0.5" />
    <path d="M5 8.5V16M15 8.5V16" />
    <path d="M2 4.5h3v3H2zM15 4.5h3v3h-3zM2 12.5h3v3H2zM15 12.5h3v3h-3z" />
  </svg>
)
const IcoOttoman = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="13" height="9" rx="1.5" />
    <path d="M5 14v2M15 14v2" />
  </svg>
)
const IcoCabinet = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="14" rx="1.5" />
    <path d="M10 3v14M6.5 8.5v.01M13.5 8.5v.01" />
  </svg>
)
const IcoTable = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6h15" />
    <path d="M4 6v10M16 6v10" />
    <path d="M8 12h6" />
  </svg>
)
const IcoRecliner = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9V5.5a1.5 1.5 0 013 0V9" />
    <path d="M13 9V5.5a1.5 1.5 0 013 0V9" />
    <path d="M3 9h14v4a2 2 0 01-2 2H5a2 2 0 01-2-2V9Z" />
    <path d="M4 15v2M16 15v2" />
  </svg>
)
const IcoWindow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="14" rx="1" />
    <path d="M10 3v14M3 10h14" />
  </svg>
)
const IcoMirror = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="2.5" width="11" height="13" rx="1.5" />
    <path d="M7.5 17.5h5" />
  </svg>
)
const IcoFan = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="1.4" />
    <path d="M10 8.8C8.5 5.5 9 3 10 2c1.5 1.5 2 4 0 6.8ZM11.2 10c3.3-1.5 5.8-1 6.8 0-1.5 1.5-4 2-6.8 0ZM10 11.2c1.5 3.3 1 5.8 0 6.8-1.5-1.5-2-4 0-6.8ZM8.8 10C5.5 11.5 3 11 2 10c1.5-1.5 4-2 6.8 0Z" />
  </svg>
)
const IcoSuperSaver = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M13.5 6.5l-7 7M7 7h.01M13 13h.01" />
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

interface LivingBedroomItem {
  id: string
  title: string
  section: 'super-saver-deals' | 'cleaning-stain-protection' | 'sofa-carpet' | 'curtain-cleaning' | 'living-room-care' | 'bedroom-care' | 'mattress-bed' | 'dining-table-chairs' | 'other-furniture' | 'windows-fan'
  rating: string
  price: number
  priceLabel?: 'starts-at'
  originalPrice?: number
  durationMin?: number
  description?: string
  note?: string
  optionsCount?: number
  options?: LivingBedroomItemOption[]
  /** The real promo note shown at the top of this item's own options
   *  picker in the reference (e.g. "Up to ₹520 off") — distinct from
   *  the row's own `note`. */
  pickerNote?: string
  icon: React.ReactNode
}
// A real, concrete sub-option — e.g. "6 seats" under the 2-visit sofa
// pack, or "Full-length (floor touching)" under Curtain deep cleaning
// — each with its own real price (and rating/duration where the
// reference showed one), taken from a reference screenshot the user
// supplied.
interface LivingBedroomItemOption {
  id: string
  label: string
  price: number
  originalPrice?: number
  rating?: string
  durationMin?: number
}

const LIVING_BEDROOM_ITEMS: LivingBedroomItem[] = [
  // ── Super saver deals ──
  {
    id: 'lb-2visit-fabric-sofa', title: '2 visits: Fabric sofa cleaning', section: 'super-saver-deals', rating: '4.88 (184K reviews)', price: 638, priceLabel: 'starts-at', originalPrice: 798, description: 'Suitable for houses with toddlers and pets', note: 'Avail first visit now and the remaining within 6 months. Starts at ₹319/service', pickerNote: 'Up to ₹520 off', icon: <IcoSofa />,
    options: [
      { id: 'lb-2visit-sofa-3seat', label: '3 seats', price: 638, originalPrice: 798, rating: '4.88 (52K reviews)' },
      { id: 'lb-2visit-sofa-4seat', label: '4 seats', price: 798, originalPrice: 998, rating: '4.88 (20K reviews)' },
      { id: 'lb-2visit-sofa-5seat', label: '5 seats', price: 958, originalPrice: 1198, rating: '4.88 (63K reviews)' },
      { id: 'lb-2visit-sofa-6seat', label: '6 seats', price: 1118, originalPrice: 1398, rating: '4.87 (21K reviews)' },
      { id: 'lb-2visit-sofa-7seat', label: '7 seats', price: 1278, originalPrice: 1598, rating: '4.86 (15K reviews)' },
      { id: 'lb-2visit-sofa-8seat', label: '8 seats', price: 1438, originalPrice: 1798, rating: '4.86 (6K reviews)' },
      { id: 'lb-2visit-sofa-9seat', label: '9 seats', price: 1598, originalPrice: 1998, rating: '4.86 (3K reviews)' },
      { id: 'lb-2visit-sofa-10seat', label: '10 seats', price: 1758, originalPrice: 2198, rating: '4.83 (2K reviews)' },
      { id: 'lb-2visit-sofa-11seat', label: '11 seats', price: 1918, originalPrice: 2398, rating: '4.88 (784 reviews)' },
      { id: 'lb-2visit-sofa-12seat', label: '12 seats', price: 2078, originalPrice: 2598 },
    ],
  },
  {
    id: 'lb-3visit-mattress', title: '3 visits: Mattress cleaning', section: 'super-saver-deals', rating: '4.86 (38K reviews)', price: 957, priceLabel: 'starts-at', originalPrice: 1197, description: 'Keep the mattress fresh and hygienic with regular cleaning', note: 'Avail first visit now and the remaining within 6 months. Starts at ₹319/service', pickerNote: 'Up to ₹360 off', icon: <IcoMattress />,
    options: [
      { id: 'lb-3visit-mattress-single', label: 'Single Mattress', price: 957, originalPrice: 1197, rating: '4.88 (10K reviews)' },
      { id: 'lb-3visit-mattress-double', label: 'Double Mattress', price: 1437, originalPrice: 1797, rating: '4.85 (27K reviews)' },
    ],
  },

  // ── Cleaning & stain protection ──
  { id: 'lb-sofa-stain-protection', title: 'Sofa cleaning & stain protection coating', section: 'cleaning-stain-protection', rating: '4.87 (52K reviews)', price: 2199, priceLabel: 'starts-at', durationMin: 45, description: 'Nano-coating that repels spills & resists stains up to 12 months', note: 'Includes vacuuming & foam-based shampooing before coating', icon: <IcoSofa /> },

  // ── Sofa & carpet ──
  { id: 'lb-fabric-sofa-cleaning', title: 'Fabric sofa cleaning', section: 'sofa-carpet', rating: '4.88 (229K reviews)', price: 399, priceLabel: 'starts-at', durationMin: 45, description: 'Vacuuming & foam based shampooing for stain removal', note: 'Recliner is not included & to be booked separately', icon: <IcoSofa /> },
  { id: 'lb-sofa-stain-protection', title: 'Sofa cleaning & stain protection coating', section: 'sofa-carpet', rating: '4.87 (52K reviews)', price: 2199, priceLabel: 'starts-at', durationMin: 45, description: 'Nano-coating that repels spills & resists stains up to 12 months', note: 'Includes vacuuming & foam-based shampooing before coating', icon: <IcoSofa /> },
  { id: 'lb-leather-sofa-cleaning', title: 'Leather sofa cleaning & polishing', section: 'sofa-carpet', rating: '4.87 (52K reviews)', price: 399, priceLabel: 'starts-at', durationMin: 45, description: 'Recliner is not included & to be booked separately', note: 'Leather moisturization to enhance appearance', icon: <IcoSofa /> },
  { id: 'lb-sofa-cum-bed', title: 'Sofa cum bed', section: 'sofa-carpet', rating: '4.88 (51K reviews)', price: 399, priceLabel: 'starts-at', durationMin: 40, description: 'Vacuuming & foam based shampooing for stain removal', note: 'Applying shiner to wooden surface for a fresh look', icon: <IcoSofa /> },
  { id: 'lb-carpet-cleaning', title: 'Carpet cleaning', section: 'sofa-carpet', rating: '4.83 (37K reviews)', price: 399, priceLabel: 'starts-at', durationMin: 45, description: 'Vacuuming & foam based shampooing for stain removal', note: '2-3 hrs of dry time under the fan', icon: <IcoCarpet /> },

  // ── Curtain cleaning ──
  {
    id: 'lb-curtain-deep-cleaning', title: 'Curtain deep cleaning', section: 'curtain-cleaning', rating: '4.85 (12K reviews)', price: 150, priceLabel: 'starts-at', icon: <IcoCurtain />,
    options: [
      { id: 'lb-curtain-window-sill', label: 'Window (sill-length)', price: 150, durationMin: 15 },
      { id: 'lb-curtain-full-length', label: 'Full-length (floor touching)', price: 200, durationMin: 20 },
    ],
  },

  // ── Living room care ──
  { id: 'lb-sofa-windows-cobweb', title: 'Sofa, windows & cobweb cleaning', section: 'living-room-care', rating: '4.87 (204K reviews)', price: 742, originalPrice: 928, durationMin: 105, description: 'Deep cleaning of sofa, windows, cobweb and fans', note: 'Excludes cleaning of bathroom and kitchen windows', icon: <IcoLivingRoom /> },

  // ── Bedroom care ──
  { id: 'lb-bedroom-essential-cleaning', title: 'Bedroom essential cleaning', section: 'bedroom-care', rating: '4.86 (158K reviews)', price: 799, priceLabel: 'starts-at', durationMin: 150, description: 'Upholstery vacuuming, furniture shining & cleaning all surfaces', note: 'Excludes cleaning of bathroom, balcony & emptying of cabinets', icon: <IcoBedroom /> },

  // ── Mattress & bed ──
  { id: 'lb-mattress-cleaning', title: 'Mattress cleaning', section: 'mattress-bed', rating: '4.86 (38K reviews)', price: 399, priceLabel: 'starts-at', durationMin: 25, description: 'Vacuuming & foam based shampooing on both sides', note: 'Minimal water usage, mattress ready to use in 1 to 2 hours', icon: <IcoMattress /> },
  { id: 'lb-bed-cleaning', title: 'Bed cleaning', section: 'mattress-bed', rating: '4.84 (10K reviews)', price: 449, priceLabel: 'starts-at', durationMin: 40, description: 'Includes mattress, headboard & bedframe cleaning', note: 'Vacuuming and foam based shampooing to remove stains', icon: <IcoBedroom /> },
  { id: 'lb-fabric-headboard', title: 'Fabric headboard', section: 'mattress-bed', rating: '4.84 (6K reviews)', price: 249, durationMin: 25, description: 'Vacuuming & foam based shampooing on headboard', note: 'Minimal water usage, headboard ready to use in 1 to 2 hours', icon: <IcoBedroom /> },

  // ── Dining table & chairs ──
  {
    id: 'lb-dining-table-chairs', title: 'Dining table & chairs cleaning', section: 'dining-table-chairs', rating: '4.84 (14K reviews)', price: 499, priceLabel: 'starts-at', icon: <IcoDiningTable />,
    options: [
      { id: 'lb-dining-4seater', label: 'Dining table 4 seater', price: 499, rating: '4.84 (5K reviews)' },
      { id: 'lb-dining-5seater', label: 'Dining table 5 seater', price: 549, rating: '4.85 (699 reviews)' },
      { id: 'lb-dining-6seater', label: 'Dining table 6 seater', price: 599, rating: '4.84 (7K reviews)' },
      { id: 'lb-dining-7seater', label: 'Dining table 7 seater', price: 649, rating: '4.73 (159 reviews)' },
      { id: 'lb-dining-8seater', label: 'Dining table 8 seater', price: 699, rating: '4.82 (795 reviews)' },
      { id: 'lb-dining-9seater', label: 'Dining table 9 seater', price: 749, rating: '4.77 (43 reviews)' },
      { id: 'lb-dining-10seater', label: 'Dining table 10 seater', price: 799, rating: '4.86 (178 reviews)' },
    ],
  },

  // ── Other furniture ──
  { id: 'lb-ottoman', title: 'Ottoman', section: 'other-furniture', rating: '4.86 (8K reviews)', price: 119, durationMin: 15, description: 'Dry & wet vacuuming to remove stains & spillage', icon: <IcoOttoman /> },
  { id: 'lb-showcase-cabinet', title: 'Showcase/ cabinet', section: 'other-furniture', rating: '4.78 (5K reviews)', price: 199, durationMin: 20, description: 'Dry dusting & wet wiping of exterior surface & glass', note: 'Includes applying wood shiner to give fresh look', icon: <IcoCabinet /> },
  { id: 'lb-sofa-center-table', title: 'Sofa center table', section: 'other-furniture', rating: '4.81 (900 reviews)', price: 199, durationMin: 30, description: 'Dry & wet vacuuming to remove stain & spillage', note: 'Applying shiner to wooden surface for a fresh look', icon: <IcoTable /> },
  { id: 'lb-study-table-chair', title: 'Study table & chair', section: 'other-furniture', rating: '4.87 (4K reviews)', price: 249, durationMin: 30, description: 'Dry dusting & wet wiping of study table & chairs', note: 'Includes applying wood shiner to give fresh look', icon: <IcoTable /> },
  {
    id: 'lb-recliner-lounge-chair', title: 'Recliner/ lounge chair', section: 'other-furniture', rating: '4.86 (6K reviews)', price: 249, priceLabel: 'starts-at', description: 'Dry & wet vacuuming to remove stains & spillage', icon: <IcoRecliner />,
    options: [
      { id: 'lb-recliner-1seater', label: '1 Seater', price: 249, rating: '4.88 (5K reviews)' },
      { id: 'lb-recliner-2seater', label: '2 Seater', price: 449, rating: '4.82 (1K reviews)' },
      { id: 'lb-recliner-3seater', label: '3 Seater', price: 599, rating: '4.81 (650 reviews)' },
    ],
  },

  // ── Windows & fan ──
  { id: 'lb-windows-without-grill', title: 'Windows (without grill) & glass doors cleaning', section: 'windows-fan', rating: '4.82 (15K reviews)', price: 449, priceLabel: 'starts-at', durationMin: 55, description: 'Removal of smudge, stains and watermarks from glass', note: 'Cleaning of window body to eliminate dust & dirt', icon: <IcoWindow /> },
  { id: 'lb-windows-with-grills', title: 'Windows (with grills) & glass doors cleaning', section: 'windows-fan', rating: '4.81 (17K reviews)', price: 599, priceLabel: 'starts-at', durationMin: 80, description: 'Deep cleaning of metal grill & window nets for dust & dirt', note: 'Removal of smudges, stains & watermarks from glass', icon: <IcoWindow /> },
  { id: 'lb-mirror-cleaning', title: 'Mirror cleaning', section: 'windows-fan', rating: '4.83 (4K reviews)', price: 49, durationMin: 15, description: 'Cleaning of mirror to remove smudges, stains and watermarks', icon: <IcoMirror /> },
  { id: 'lb-fan-cleaning', title: 'Fan cleaning', section: 'windows-fan', rating: '4.88 (87K reviews)', price: 89, durationMin: 10, description: 'Cleaning of fan blades to remove surface dust & dirt', note: 'Stain removal from fan using professional chemicals', icon: <IcoFan /> },
]

const SECTIONS: { id: LivingBedroomItem['section']; label: string; icon: React.ReactNode }[] = [
  { id: 'super-saver-deals', label: 'Super saver deals', icon: <IcoSuperSaver /> },
  { id: 'cleaning-stain-protection', label: 'Cleaning & stain protection', icon: <IcoSofa /> },
  { id: 'sofa-carpet', label: 'Sofa & carpet', icon: <IcoSofa /> },
  { id: 'curtain-cleaning', label: 'Curtain cleaning', icon: <IcoCurtain /> },
  { id: 'living-room-care', label: 'Living room care', icon: <IcoLivingRoom /> },
  { id: 'bedroom-care', label: 'Bedroom care', icon: <IcoBedroom /> },
  { id: 'mattress-bed', label: 'Mattress & bed', icon: <IcoMattress /> },
  { id: 'dining-table-chairs', label: 'Dining table & chairs', icon: <IcoDiningTable /> },
  { id: 'other-furniture', label: 'Other furniture', icon: <IcoOttoman /> },
  { id: 'windows-fan', label: 'Windows & fan', icon: <IcoWindow /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<LivingBedroomItem['section'], { title: string; subtitle: string }> = {
  'super-saver-deals': { title: 'More visits, better value', subtitle: 'Multi-visit cleaning packs at a lower per-service price.' },
  'cleaning-stain-protection': { title: 'Protection that lasts', subtitle: 'Nano-coating to keep spills and stains off your sofa.' },
  'sofa-carpet': { title: 'Fresh fabric, every time', subtitle: 'Deep cleaning for sofas, carpets & everything in between.' },
  'curtain-cleaning': { title: 'Steam-cleaned, in place', subtitle: 'Remove dust and allergens without taking curtains down.' },
  'living-room-care': { title: 'A room that feels new', subtitle: 'Combo cleaning for sofa, windows, cobwebs & fans.' },
  'bedroom-care': { title: 'Rest easy', subtitle: 'A full sweep of your bedroom furniture and surfaces.' },
  'mattress-bed': { title: 'Cleaner sleep', subtitle: 'Steam and shampoo cleaning for mattress, bed & headboard.' },
  'dining-table-chairs': { title: 'A table worth gathering at', subtitle: 'Deep cleaning for your dining table and chairs.' },
  'other-furniture': { title: 'Every piece, cared for', subtitle: 'Cleaning for ottomans, cabinets, tables & recliners.' },
  'windows-fan': { title: 'Let the light in', subtitle: 'Streak-free windows, mirrors and dust-free fans.' },
}

function getLivingBedroomItem(id: string, section: LivingBedroomItem['section']): LivingBedroomItem {
  const item = LIVING_BEDROOM_ITEMS.find(i => i.id === id && i.section === section)
  if (!item) throw new Error(`Unknown Living & Bedroom Cleaning item id: ${id} in section ${section}`)
  return item
}
/** A single lookup point for "what has options" — none of the 5
 *  options-bearing items are cross-listed, so a lookup by id alone is
 *  unambiguous here (unlike getLivingBedroomItem, which needs the
 *  section too because the one cross-listed item shares an id across
 *  two sections). */
function getOptionsSource(id: string): { title: string; options: LivingBedroomItemOption[]; pickerNote?: string; icon: React.ReactNode } {
  const item = LIVING_BEDROOM_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Living & Bedroom Cleaning item id: ${id}`)
  return { title: item.title, options: item.options ?? [], pickerNote: item.pickerNote, icon: item.icon }
}

interface Addable {
  id: string
  title: string
  price: number
  originalPrice?: number
  durationMin?: number
}

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Living &amp; Bedroom</span>
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
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Living &amp; Bedroom Cleaning</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'living-bedroom-cleaning' })}
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
            className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0 shrink-0 w-[76px]"
          >
            <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[var(--hz-border)] flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)] shrink-0">
              {s.icon}
            </div>
            <span className="text-[12px] text-[var(--hz-ink)] text-center leading-tight" style={{ fontFamily: FONT_BODY }}>{s.label}</span>
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

function HeroBanner({ onExplore, onViewWindows }: { onExplore: () => void; onViewWindows: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, var(--hz-primary-wash) 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Living &amp; Bedroom Cleaning</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Make your living<br />space look new.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Sofa, mattress, carpet & furniture deep-cleaned, at home.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore services
          </button>
          <button
            onClick={onViewWindows}
            className="h-10 px-5 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[13px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
            style={{ fontFamily: FONT_BODY }}
          >
            View windows &amp; fan
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[var(--hz-primary)] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoSofa /></div>
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
      style={{ background: 'linear-gradient(120deg, var(--hz-primary-wash) 0%, var(--hz-primary-soft) 60%, #FFF3EA 100%)' }}
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

function LivingBedroomLineItemRow({ item, cartCount, onSelect, onViewDetails, getCartCount }: {
  item: LivingBedroomItem
  cartCount: number
  onSelect: () => void
  onViewDetails: () => void
  getCartCount: (id: string) => number
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 mx-auto sm:mx-0">
        <div className="w-32 h-32 shrink-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)]">
          {item.icon}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        {item.description && (
          <span className="text-[12px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.description}</span>
        )}
        {item.note && (
          <span className="text-[11.5px] text-[var(--hz-ink-subtle)] leading-snug italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>
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
            <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.options.length} options available</span>
          )
        ) : item.optionsCount && (
          <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} options available</span>
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[var(--hz-primary)] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          View details
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
            {item.priceLabel === 'starts-at' && <span className="text-[var(--hz-ink-muted)]">Starts at </span>}
            {item.originalPrice && <span className="line-through text-[var(--hz-ink-subtle)]">₹{item.originalPrice.toLocaleString('en-IN')}</span>} <span className="font-semibold text-[var(--hz-ink)]">₹{item.price.toLocaleString('en-IN')}</span>
          </div>
          {item.durationMin && (
            <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
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
  item: LivingBedroomItem
  cartCount: number
  onSelect: () => void
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
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="w-16 h-16 rounded-[12px] flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)]">{item.icon}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[13.5px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
              {item.priceLabel === 'starts-at' && <span className="text-[var(--hz-ink-muted)]">Starts at </span>}
              {item.originalPrice && <span className="line-through text-[var(--hz-ink-subtle)] mr-1">₹{item.originalPrice.toLocaleString('en-IN')}</span>}
              <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
            </span>
            {item.durationMin && <span className="text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>}
          </div>
          {item.description && <p className="text-[13px] text-[var(--hz-ink)] leading-relaxed m-0" style={{ fontFamily: FONT_BODY }}>{item.description}</p>}
          {item.note && <span className="text-[12px] text-[var(--hz-ink-subtle)] italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>}
          {(item.options?.length || item.optionsCount) && (
            <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.options?.length ?? item.optionsCount} options available</span>
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

// ─── Options picker modal — opened from a line item that has real,
// user-supplied option data (e.g. "6 seats" under the 2-visit sofa
// pack, "Full-length (floor touching)" under Curtain deep cleaning).
// Same calm card language as the rest of this file, same component
// every other options-bearing page in this app uses — not a separate
// visual system. ─────────────────────────────────────────────────────

function OptionsModal({ sourceId, cartCountForOption, onAddOption, onClose }: {
  sourceId: string
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: LivingBedroomItemOption) => void
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
        className="w-full max-w-[440px] max-h-[80vh] overflow-y-auto rounded-[16px] bg-[var(--hz-surface)] flex flex-col"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--hz-surface-muted)] sticky top-0 bg-[var(--hz-surface)]">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[16px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{title}</span>
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
              {pickerNote ? <span className="text-[#0F7A3D] font-semibold">{pickerNote} · </span> : null}Choose an option
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 p-4">
          {options.map(opt => {
            const cartCount = cartCountForOption(opt.id)
            return (
              <div key={opt.id} className="flex items-center gap-3 rounded-[12px] p-3" style={CARD_SURFACE}>
                <div className="w-32 h-32 rounded-[10px] overflow-hidden flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)] shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{opt.label}</span>
                  {opt.rating && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {opt.rating}</span>
                  )}
                  <span className="text-[13px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
                    {opt.originalPrice && <span className="line-through text-[var(--hz-ink-subtle)]">₹{opt.originalPrice.toLocaleString('en-IN')}</span>} <span className="font-semibold text-[var(--hz-ink)]">₹{opt.price.toLocaleString('en-IN')}</span>
                  </span>
                  {opt.durationMin && (
                    <span className="text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(opt.durationMin)}</span>
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
              {c.originalPrice > c.price && <span className="line-through text-[var(--hz-ink-subtle)] text-[12px]">₹{c.originalPrice}</span>}
            </span>
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
      {saved > 0 && (
        <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: '#0F7A3D' }}>
          <span className="text-white shrink-0"><IcoBolt /></span>
          <span className="text-[12.5px] text-white font-medium" style={{ fontFamily: FONT_BODY }}>Congratulations! ₹{saved} saved on this order</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--hz-surface-muted)]">
        <span className="text-[17px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
          ₹{total}{totalOriginal > total && <span className="line-through text-[var(--hz-ink-subtle)] text-[13px] font-normal"> ₹{totalOriginal}</span>}
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

// ─── Main Screen ────────────────────────────────────────────────────────

export default function LivingBedroomCleaningScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItem, setDetailItem] = useState<{ id: string; section: LivingBedroomItem['section'] } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'cleaning',
      categoryId: 'living-bedroom-cleaning',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.originalPrice ?? entry.price,
      duration: entry.durationMin ? formatDuration(entry.durationMin) : undefined,
    })
  }

  // A selected option becomes its own cart line — titled "Item —
  // Option" so the cart stays legible about exactly what was booked —
  // then the picker closes.
  const addOptionToCart = (sourceId: string, option: LivingBedroomItemOption) => {
    const { title } = getOptionsSource(sourceId)
    addToCart({ id: option.id, title: `${title} — ${option.label}`, price: option.price, originalPrice: option.originalPrice, durationMin: option.durationMin })
    setExpandedId(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`living-bedroom-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'living-bedroom-cleaning',
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
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Cleaning &amp; Pest Control</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Living &amp; Bedroom Cleaning
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('super-saver-deals')} onViewWindows={() => jumpToSection('windows-fan')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = LIVING_BEDROOM_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`living-bedroom-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <LivingBedroomLineItemRow
                            key={`${section.id}-${item.id}`}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onSelect={() => (item.options ? setExpandedId(item.id) : addToCart(item))}
                            onViewDetails={() => setDetailItem({ id: item.id, section: section.id })}
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
          item={getLivingBedroomItem(detailItem.id, detailItem.section)}
          cartCount={cartCountForItem(detailItem.id)}
          onSelect={() => {
            const item = getLivingBedroomItem(detailItem.id, detailItem.section)
            if (item.options) {
              setDetailItem(null)
              setExpandedId(item.id)
            } else {
              addToCart(item)
            }
          }}
          onClose={() => setDetailItem(null)}
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
