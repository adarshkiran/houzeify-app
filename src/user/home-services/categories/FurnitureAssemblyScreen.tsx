// ─── Electrician, Plumber & Carpenter → Furniture Assembly ──────────────
//
// Built from a real-page reference PDF the user supplied (UB-FA24) — a
// real Furniture Assembly category page: page-level rating "4.85
// (321K bookings)", a real "60 days warranty on all services" banner,
// 9 real sections (Wooden bed, Wardrobe, Dining & kitchen, Tables &
// chairs, Children, Living & TV, Outdoor, Religious, Cabinet/shelving
// unit) and every one of their 61 real line items with its own real
// rating/reviews/price/duration, taken as given. One item ("Bar table
// set assembly") showed no rating/reviews in the reference at all —
// kept undefined rather than invented.
//
// Same "N options" honesty rule as every sibling real-data screen: the
// reference shows each item's own real options-tile count next to
// "Add", but the capture never scrolled into any single item's own
// options breakdown, so the count is kept as a real, informational tag
// next to the item's own real "Starts at ₹X" price, and Add books that
// same real starting price rather than fabricating the options
// themselves. Items with a flat real price + duration use the plain
// Add pattern every other duration-bearing line item in this app uses.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own "UC COVER" expandable row, its own "Earliest — Sun,
// 8:00 AM" slot chip, its own real "Flat ₹50 Off + ₹50 cashback via
// CRED pay" promo (a real third-party payment partner Houzeify
// doesn't have), footer, and whatever was in its own cart at capture
// time — this page's own HeroBanner/CategoryBanners use original
// Houzeify copy instead, same as every sibling screen.
//
// Honesty note: no real furniture-assembly photography exists in this
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
// Section-nav & item icons
const IcoWoodenBed = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 16v-5.5a2 2 0 012-2h11a2 2 0 012 2V16" />
    <path d="M2.5 13.5h15M4 8.5V5.5M4 5.5h4v3" />
  </svg>
)
const IcoWardrobe = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="2.5" width="13" height="15" rx="1" />
    <path d="M10 2.5v15" />
    <circle cx="8.7" cy="10" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="11.3" cy="10" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)
const IcoDiningKitchen = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 8.5h9v9M2.5 8.5V3M6.5 8.5V3M2.5 5.5h4" />
    <path d="M14.5 3v6M14.5 3c0 1.5 1.5 2 1.5 3.5S14.5 8.5 14.5 8.5M14.5 8.5V17" />
  </svg>
)
const IcoTablesChairs = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h14M3 8v2M17 8v2" />
    <path d="M5 10v6M15 10v6" />
  </svg>
)
const IcoChildren = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="6" width="12" height="10" rx="1" />
    <path d="M4 6V4M7.5 6V4M12.5 6V4M16 6V4" />
  </svg>
)
const IcoLivingTv = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4" width="15" height="10" rx="1.2" />
    <path d="M7 17h6M10 14v3" />
  </svg>
)
const IcoOutdoor = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h14" />
    <path d="M10 6v2.5l-4 5M10 8.5l4 5" />
  </svg>
)
const IcoReligious = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 17V9a4 4 0 018 0v8" />
    <path d="M4 17h12M10 9V3M8 5.5h4" />
  </svg>
)
const IcoCabinetShelving = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="14" height="15" rx="1" />
    <path d="M3 8h14M3 13h14M8 2.5v15" />
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
// given item (e.g. its own options breakdown, or "Bar table set
// assembly"'s own missing rating) stays undefined and is never
// rendered or invented. ─────────────────────────────────────────────

type FurnitureAssemblySection =
  | 'wooden-bed'
  | 'wardrobe'
  | 'dining-kitchen'
  | 'tables-chairs'
  | 'children'
  | 'living-tv'
  | 'outdoor'
  | 'religious'
  | 'cabinet-shelving'

interface FurnitureAssemblyItem {
  id: string
  title: string
  section: FurnitureAssemblySection
  rating?: string
  price: number
  priceLabel?: 'starts-at'
  durationMin?: number
  /** Real "N options" count shown next to the item's own real
   *  "Starts at ₹X" price — the reference never scrolled into any
   *  single item's own options breakdown, so only the count is kept,
   *  never fabricated tile data. */
  optionsCount?: number
  icon: React.ReactNode
}

const FURNITURE_ASSEMBLY_ITEMS: FurnitureAssemblyItem[] = [
  // ── Wooden bed ──
  { id: 'fa-single-bed', title: 'Single bed assembly', section: 'wooden-bed', rating: '4.84 (4K reviews)', price: 449, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoWoodenBed /> },
  { id: 'fa-double-bed', title: 'Double bed assembly', section: 'wooden-bed', rating: '4.86 (17K reviews)', price: 599, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoWoodenBed /> },
  { id: 'fa-hydraulic-bed', title: 'Hydraulic bed assembly', section: 'wooden-bed', rating: '4.86 (4K reviews)', price: 1299, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoWoodenBed /> },
  { id: 'fa-day-diwan-bed', title: 'Day/diwan bed assembly', section: 'wooden-bed', rating: '4.79 (532 reviews)', price: 549, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoWoodenBed /> },
  { id: 'fa-loft-bunk-bed', title: 'Loft/bunk bed assembly', section: 'wooden-bed', rating: '4.83 (672 reviews)', price: 929, durationMin: 150, icon: <IcoWoodenBed /> },

  // ── Wardrobe ──
  { id: 'fa-single-door-wardrobe', title: 'Single door wardrobe assembly', section: 'wardrobe', rating: '4.83 (1K reviews)', price: 599, durationMin: 120, icon: <IcoWardrobe /> },
  { id: 'fa-double-door-wardrobe', title: 'Double door wardrobe assembly', section: 'wardrobe', rating: '4.82 (2K reviews)', price: 849, durationMin: 120, icon: <IcoWardrobe /> },
  { id: 'fa-three-door-wardrobe', title: 'Three door wardrobe assembly', section: 'wardrobe', rating: '4.81 (4K reviews)', price: 949, durationMin: 150, icon: <IcoWardrobe /> },
  { id: 'fa-four-door-wardrobe', title: 'Four door wardrobe assembly', section: 'wardrobe', rating: '4.79 (2K reviews)', price: 1049, durationMin: 180, icon: <IcoWardrobe /> },
  { id: 'fa-sliding-door-wardrobe', title: 'Sliding door wardrobe assembly', section: 'wardrobe', rating: '4.81 (1K reviews)', price: 799, durationMin: 210, icon: <IcoWardrobe /> },

  // ── Dining & kitchen ──
  { id: 'fa-wooden-dining-table', title: 'Wooden dining table assembly', section: 'dining-kitchen', rating: '4.86 (2K reviews)', price: 349, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoDiningKitchen /> },
  { id: 'fa-extendable-dining-table', title: 'Extendable dining table assembly', section: 'dining-kitchen', rating: '4.76 (276 reviews)', price: 499, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoDiningKitchen /> },
  { id: 'fa-dining-chair', title: 'Dining chair assembly', section: 'dining-kitchen', rating: '4.84 (813 reviews)', price: 199, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoDiningKitchen /> },
  { id: 'fa-dining-table-with-chair', title: 'Dining table with chair assembly', section: 'dining-kitchen', rating: '4.90 (1K reviews)', price: 699, priceLabel: 'starts-at', optionsCount: 4, icon: <IcoDiningKitchen /> },
  { id: 'fa-utensil-rack', title: 'Utensil rack assembly', section: 'dining-kitchen', rating: '4.77 (1K reviews)', price: 269, durationMin: 30, icon: <IcoDiningKitchen /> },
  { id: 'fa-bar-trolley', title: 'Bar trolley assembly', section: 'dining-kitchen', rating: '4.84 (40 reviews)', price: 699, durationMin: 90, icon: <IcoDiningKitchen /> },
  { id: 'fa-bar-cabinet', title: 'Bar cabinet assembly', section: 'dining-kitchen', rating: '4.77 (164 reviews)', price: 449, durationMin: 60, icon: <IcoDiningKitchen /> },
  { id: 'fa-bar-stool', title: 'Bar stool assembly', section: 'dining-kitchen', rating: '4.87 (121 reviews)', price: 399, durationMin: 60, icon: <IcoDiningKitchen /> },
  { id: 'fa-bar-table', title: 'Bar table assembly', section: 'dining-kitchen', rating: '4.84 (64 reviews)', price: 699, durationMin: 90, icon: <IcoDiningKitchen /> },
  { id: 'fa-bar-table-set', title: 'Bar table set assembly', section: 'dining-kitchen', price: 1099, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoDiningKitchen /> },

  // ── Tables & chairs ──
  { id: 'fa-study-table', title: 'Study table assembly', section: 'tables-chairs', rating: '4.89 (10K reviews)', price: 449, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoTablesChairs /> },
  { id: 'fa-standing-table', title: 'Standing table assembly', section: 'tables-chairs', rating: '4.86 (1K reviews)', price: 999, durationMin: 150, icon: <IcoTablesChairs /> },
  { id: 'fa-coffee-table', title: 'Coffee table assembly', section: 'tables-chairs', rating: '4.85 (3K reviews)', price: 269, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoTablesChairs /> },
  { id: 'fa-side-table', title: 'Side table assembly', section: 'tables-chairs', rating: '4.84 (2K reviews)', price: 199, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoTablesChairs /> },
  { id: 'fa-office-chair', title: 'Office chair assembly', section: 'tables-chairs', rating: '4.85 (8K reviews)', price: 249, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoTablesChairs /> },
  { id: 'fa-gaming-chair', title: 'Gaming chair assembly', section: 'tables-chairs', rating: '4.87 (837 reviews)', price: 799, durationMin: 60, icon: <IcoTablesChairs /> },
  { id: 'fa-chair', title: 'Chair assembly', section: 'tables-chairs', rating: '4.87 (1K reviews)', price: 249, durationMin: 45, icon: <IcoTablesChairs /> },
  { id: 'fa-table-chair-wheels-fitting', title: 'Table/chair wheels fitting', section: 'tables-chairs', rating: '4.78 (2K reviews)', price: 199, durationMin: 30, icon: <IcoTablesChairs /> },
  { id: 'fa-stool', title: 'Stool assembly', section: 'tables-chairs', rating: '4.90 (212 reviews)', price: 179, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoTablesChairs /> },
  { id: 'fa-bench', title: 'Bench assembly', section: 'tables-chairs', rating: '4.85 (334 reviews)', price: 249, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoTablesChairs /> },

  // ── Children ──
  { id: 'fa-changing-table', title: 'Changing table assembly', section: 'children', rating: '4.82 (320 reviews)', price: 299, durationMin: 30, icon: <IcoChildren /> },
  { id: 'fa-cot', title: 'Cot assembly', section: 'children', rating: '4.83 (1K reviews)', price: 399, durationMin: 30, icon: <IcoChildren /> },
  { id: 'fa-high-chair', title: 'High chair assembly', section: 'children', rating: '4.76 (157 reviews)', price: 279, durationMin: 30, icon: <IcoChildren /> },
  { id: 'fa-childrens-bed', title: "Children's bed assembly", section: 'children', rating: '4.82 (241 reviews)', price: 449, priceLabel: 'starts-at', optionsCount: 4, icon: <IcoChildren /> },
  { id: 'fa-childrens-desk-chair', title: "Children's desk & chair assembly", section: 'children', rating: '4.80 (370 reviews)', price: 729, durationMin: 90, icon: <IcoChildren /> },

  // ── Living & TV ──
  { id: 'fa-sofa', title: 'Sofa assembly', section: 'living-tv', rating: '4.85 (1K reviews)', price: 449, priceLabel: 'starts-at', optionsCount: 4, icon: <IcoLivingTv /> },
  { id: 'fa-chaise-lounger', title: 'Chaise lounger assembly', section: 'living-tv', rating: '4.71 (75 reviews)', price: 449, durationMin: 75, icon: <IcoLivingTv /> },
  { id: 'fa-l-shaped-sofa', title: 'L-shaped sofa assembly', section: 'living-tv', rating: '4.77 (433 reviews)', price: 599, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoLivingTv /> },
  { id: 'fa-corner-sofa', title: 'Corner sofa assembly', section: 'living-tv', rating: '4.69 (251 reviews)', price: 599, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoLivingTv /> },
  { id: 'fa-sofa-cum-bed', title: 'Sofa cum bed assembly', section: 'living-tv', rating: '4.82 (984 reviews)', price: 549, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoLivingTv /> },
  { id: 'fa-recliner', title: 'Recliner assembly', section: 'living-tv', rating: '4.80 (681 reviews)', price: 399, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoLivingTv /> },
  { id: 'fa-tv-bench', title: 'TV bench assembly', section: 'living-tv', rating: '4.86 (3K reviews)', price: 449, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoLivingTv /> },
  { id: 'fa-tv-unit', title: 'TV unit assembly', section: 'living-tv', rating: '4.84 (2K reviews)', price: 699, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoLivingTv /> },

  // ── Outdoor ──
  { id: 'fa-swing-chair', title: 'Swing chair assembly & installation', section: 'outdoor', rating: '4.67 (1K reviews)', price: 449, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoOutdoor /> },
  { id: 'fa-outdoor-table-chairs', title: 'Outdoor table & chairs assembly', section: 'outdoor', rating: '4.91 (136 reviews)', price: 219, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoOutdoor /> },
  { id: 'fa-patio-dining-set', title: 'Patio dining set assembly', section: 'outdoor', rating: '4.98 (22 reviews)', price: 749, durationMin: 120, icon: <IcoOutdoor /> },

  // ── Religious ──
  { id: 'fa-mandir', title: 'Mandir assembly & installation', section: 'religious', rating: '4.82 (3K reviews)', price: 199, durationMin: 20, icon: <IcoReligious /> },
  { id: 'fa-pooja-shelf', title: 'Pooja shelf assembly & installation', section: 'religious', rating: '4.82 (709 reviews)', price: 279, durationMin: 40, icon: <IcoReligious /> },

  // ── Cabinet/shelving unit ──
  { id: 'fa-cabinet', title: 'Cabinet assembly', section: 'cabinet-shelving', rating: '4.87 (6K reviews)', price: 499, priceLabel: 'starts-at', optionsCount: 4, icon: <IcoCabinetShelving /> },
  { id: 'fa-wall-shelf', title: 'Wall shelf installation', section: 'cabinet-shelving', rating: '4.82 (5K reviews)', price: 249, durationMin: 30, icon: <IcoCabinetShelving /> },
  { id: 'fa-shelving-unit', title: 'Shelving unit assembly & installation', section: 'cabinet-shelving', rating: '4.84 (6K reviews)', price: 199, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoCabinetShelving /> },
  { id: 'fa-wall-cabinet', title: 'Wall cabinet assembly & installation', section: 'cabinet-shelving', rating: '4.75 (2K reviews)', price: 249, priceLabel: 'starts-at', optionsCount: 3, icon: <IcoCabinetShelving /> },
  { id: 'fa-mirror-cabinet', title: 'Mirror cabinet assembly & installation', section: 'cabinet-shelving', rating: '4.84 (517 reviews)', price: 499, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoCabinetShelving /> },
  { id: 'fa-wash-basin-cabinet', title: 'Wash basin cabinet assembly & installation', section: 'cabinet-shelving', rating: '4.77 (287 reviews)', price: 449, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoCabinetShelving /> },
  { id: 'fa-dresser-cabinet', title: 'Dresser/dressing cabinet assembly & installation', section: 'cabinet-shelving', rating: '4.86 (1K reviews)', price: 499, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoCabinetShelving /> },
  { id: 'fa-magazine-rack', title: 'Magazine & newspaper rack assembly', section: 'cabinet-shelving', rating: '4.88 (177 reviews)', price: 299, durationMin: 45, icon: <IcoCabinetShelving /> },
  { id: 'fa-hanging-screen-dividers', title: 'Hanging screen & dividers assembly & installation', section: 'cabinet-shelving', rating: '4.88 (114 reviews)', price: 649, durationMin: 60, icon: <IcoCabinetShelving /> },
  { id: 'fa-shoe-rack', title: 'Shoe rack assembly', section: 'cabinet-shelving', rating: '4.79 (3K reviews)', price: 199, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoCabinetShelving /> },
  { id: 'fa-shoe-cabinet', title: 'Shoe cabinet assembly', section: 'cabinet-shelving', rating: '4.86 (3K reviews)', price: 299, priceLabel: 'starts-at', optionsCount: 4, icon: <IcoCabinetShelving /> },
  { id: 'fa-bookshelf', title: 'Book shelf/bookcase assembly & installation', section: 'cabinet-shelving', rating: '4.84 (4K reviews)', price: 249, priceLabel: 'starts-at', optionsCount: 5, icon: <IcoCabinetShelving /> },
  { id: 'fa-bookcase-with-door', title: 'Bookcase with door assembly & installation', section: 'cabinet-shelving', rating: '4.78 (1K reviews)', price: 499, priceLabel: 'starts-at', optionsCount: 5, icon: <IcoCabinetShelving /> },
]

const SECTIONS: { id: FurnitureAssemblySection; label: string; icon: React.ReactNode }[] = [
  { id: 'wooden-bed', label: 'Wooden bed', icon: <IcoWoodenBed /> },
  { id: 'wardrobe', label: 'Wardrobe', icon: <IcoWardrobe /> },
  { id: 'dining-kitchen', label: 'Dining & kitchen', icon: <IcoDiningKitchen /> },
  { id: 'tables-chairs', label: 'Tables & chairs', icon: <IcoTablesChairs /> },
  { id: 'children', label: 'Children', icon: <IcoChildren /> },
  { id: 'living-tv', label: 'Living & TV', icon: <IcoLivingTv /> },
  { id: 'outdoor', label: 'Outdoor', icon: <IcoOutdoor /> },
  { id: 'religious', label: 'Religious', icon: <IcoReligious /> },
  { id: 'cabinet-shelving', label: 'Cabinet/shelving unit', icon: <IcoCabinetShelving /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<FurnitureAssemblySection, { title: string; subtitle: string }> = {
  'wooden-bed': { title: 'A bed built to last', subtitle: 'Single, double, hydraulic & bunk beds, assembled right.' },
  wardrobe: { title: 'More space, sorted', subtitle: 'Every wardrobe style, assembled by an expert.' },
  'dining-kitchen': { title: 'Set the table', subtitle: 'Dining tables, chairs, bar units & kitchen racks.' },
  'tables-chairs': { title: 'Work, sit, relax', subtitle: 'Study tables, office chairs & everything in between.' },
  children: { title: "Built for your little one", subtitle: 'Cots, cribs & children’s furniture, assembled safely.' },
  'living-tv': { title: 'Your living room, ready', subtitle: 'Sofas, recliners & TV units, assembled for you.' },
  outdoor: { title: 'Enjoy the outdoors', subtitle: 'Swing chairs, patio sets & outdoor furniture.' },
  religious: { title: 'A space for what matters', subtitle: 'Mandir & pooja shelf assembly, done with care.' },
  'cabinet-shelving': { title: 'Storage, sorted', subtitle: 'Cabinets, shelves & racks, assembled and installed.' },
}

function getItem(id: string): FurnitureAssemblyItem {
  const item = FURNITURE_ASSEMBLY_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Furniture Assembly item id: ${id}`)
  return item
}

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Furniture Assembly</span>
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
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Furniture Assembly</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'furniture-assembly' })}
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

// ─── Hero — no real furniture-assembly photo exists in this project,
// so this uses the same warm-gradient + icon placeholder every other
// missing-photo surface in this app falls back to; the real page
// rating/bookings figure is kept as a small chip, same real data point
// every sibling screen keeps where the reference shows one. ───────────

function HeroBanner({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Electrician, Plumber &amp; Carpenter</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Flat-pack, fully<br />assembled.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Beds, wardrobes, sofas & more — a 60-day warranty on every service.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <span className="flex items-center gap-1 text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={13} /> 4.85 <span className="text-[var(--hz-ink-muted)] font-normal" style={{ fontFamily: FONT_BODY }}>(321K bookings)</span></span>
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
        <div style={{ transform: 'scale(3.2)' }}><IcoWoodenBed /></div>
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

function ItemMeta({ item }: { item: FurnitureAssemblyItem }) {
  return (
    <div className="text-left sm:text-right">
      <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
        {item.priceLabel === 'starts-at' && <span className="text-[var(--hz-ink-muted)]">Starts at </span>}
        <span className="font-semibold text-[var(--hz-ink)]">₹{item.price.toLocaleString('en-IN')}</span>
      </div>
      {item.durationMin !== undefined ? (
        <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
      ) : item.optionsCount !== undefined ? (
        <div className="text-[11px] text-[var(--hz-ink-subtle)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''}</div>
      ) : null}
    </div>
  )
}

function FurnitureAssemblyLineItemRow({ item, cartCount, onAdd, onViewDetails }: {
  item: FurnitureAssemblyItem
  cartCount: number
  onAdd: () => void
  onViewDetails: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="w-32 h-32 shrink-0 mx-auto sm:mx-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[var(--hz-primary)]">
        {item.icon}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        {item.rating && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[var(--hz-primary)] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          View details
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <ItemMeta item={item} />
        <button onClick={onAdd} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── "View details" — makes the link genuinely interactive: same info
// the row already shows, in one focused panel, with its own Add button.
function ServiceDetailModal({ item, cartCount, onAdd, onClose }: {
  item: FurnitureAssemblyItem
  cartCount: number
  onAdd: () => void
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
            {item.optionsCount !== undefined && (
              <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''} available at booking</span>
            )}
          </div>
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

export default function FurnitureAssemblyScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItem, setDetailItem] = useState<string | null>(null)

  const addToCart = (item: FurnitureAssemblyItem) => {
    addItem({
      cartId: item.id,
      serviceEntry: 'home-services',
      categoryId: 'furniture-assembly',
      serviceId: item.id,
      serviceName: item.title,
      title: item.title,
      price: item.price,
      originalPrice: item.price,
      duration: item.durationMin !== undefined ? formatDuration(item.durationMin) : undefined,
    })
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`furniture-assembly-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'furniture-assembly',
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
                  Furniture Assembly
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('wooden-bed')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = FURNITURE_ASSEMBLY_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`furniture-assembly-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <FurnitureAssemblyLineItemRow
                            key={item.id}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            onAdd={() => addToCart(item)}
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
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  )
}
