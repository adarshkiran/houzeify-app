// ─── Electrician, Plumber & Carpenter → Festival Lights Installation ────
//
// Built from a real-page reference PDF the user supplied (UB-FL25) — a
// real "Festival Lights" category page: page-level rating "4.69 (34K
// bookings)", 9 real sections (Light uninstallations, Balcony lights,
// Railing lights, Room lights, Mandir lights, Outdoor lights, Garden
// lights, Xmas light decor, Custom services) and every one of their
// real line items with its own real rating/reviews/price/duration/
// bullets, taken as given. "Light uninstallation (per light)" is a
// real item genuinely cross-listed under both "Light uninstallations"
// and "Custom services" in the reference itself — kept under both,
// same real cart line, same pattern as Carpentry's own cross-listed
// items.
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
// data): its own "Earliest — Sun, 9:00 AM" slot chip, footer, and
// whatever was in its own cart at capture time — this page's own
// HeroBanner/CategoryBanners use original Houzeify copy instead, same
// as every sibling screen.
//
// Honesty note: no real festival-lights photography exists in this
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
const IcoCart = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2.5h1.6L6.3 13h9L17.3 5.8H4.7" />
    <circle cx="7.2" cy="16.5" r="1.2" />
    <circle cx="14" cy="16.5" r="1.2" />
  </svg>
)
// Section-nav & item icons
const IcoLightUninstall = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5.5c3-2 5 1.5 8 0s6-1.5 6-1.5" />
    <circle cx="6" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="11" cy="5.8" r="0.9" fill="currentColor" stroke="none" />
    <path d="M4 16L16 4" />
  </svg>
)
const IcoBalconyLights = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5.5c3-2 5 1.5 8 0s6-1.5 6-1.5" />
    <circle cx="4.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="9" cy="6" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="5" r="0.9" fill="currentColor" stroke="none" />
    <path d="M4 17V9M16 17V4" />
  </svg>
)
const IcoRailingLights = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 14h15" />
    <path d="M4.5 14V6M8 14V6M11.5 14V6M15 14V6" />
    <path d="M4.5 6l1.7 1.7M8 6l1.7 1.7M11.5 6l1.7 1.7" />
  </svg>
)
const IcoRoomLights = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="14" rx="1" />
    <path d="M6 6l1.3 1.3M14 6l-1.3 1.3M6 14l1.3-1.3M14 14l-1.3-1.3" />
    <circle cx="10" cy="10" r="1.2" />
  </svg>
)
const IcoMandirLights = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 17V9a4 4 0 018 0v8" />
    <path d="M4 17h12M10 9V3M8 5.5h4" />
  </svg>
)
const IcoOutdoorLights = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5L10 3l7.5 6.5" />
    <path d="M4.5 8V16h11V8" />
    <circle cx="7.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
  </svg>
)
const IcoGardenLights = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17v-8" />
    <path d="M10 9c0-3 -2-4.5 -5-4.5C5 7.5 7 9 10 9zM10 9c0-3 2-4.5 5-4.5C15 7.5 13 9 10 9z" />
    <circle cx="10" cy="4.5" r="1.2" />
  </svg>
)
const IcoXmasLightDecor = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5l3 5h-6l3-5zM10 7l3.8 5.5H6.2L10 7zM10 12.5L14 17H6l4-4.5z" />
    <path d="M10 17v1.5" />
  </svg>
)
const IcoCustomServices = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.3 4.4L15.7 7.7l-4.4 1.3L10 13.4l-1.3-4.4L4.3 7.7l4.4-1.3L10 2Z" />
    <path d="M15.5 13l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z" />
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
// never rendered or invented. `sections` is an array because one real
// item is genuinely cross-listed under two real sections in the
// reference itself. ─────────────────────────────────────────────────

type LightsSection =
  | 'light-uninstallations'
  | 'balcony-lights'
  | 'railing-lights'
  | 'room-lights'
  | 'mandir-lights'
  | 'outdoor-lights'
  | 'garden-lights'
  | 'xmas-light-decor'
  | 'custom-services'

interface LightsItem {
  id: string
  title: string
  sections: LightsSection[]
  rating?: string
  price: number
  priceLabel?: 'starts-at'
  durationMin?: number
  /** Real "N options" count shown next to the item's own real
   *  "Starts at ₹X" price — the reference never scrolled into any
   *  single item's own options breakdown, so only the count is kept,
   *  never fabricated tile data. */
  optionsCount?: number
  notes?: string[]
  icon: React.ReactNode
}

const LIGHTS_ITEMS: LightsItem[] = [
  // ── Light uninstallations (also real-cross-listed under Custom
  // services in the reference) ──
  { id: 'fl-light-uninstall-per-light', title: 'Light uninstallation (per light)', sections: ['light-uninstallations', 'custom-services'], rating: '4.79 (4K reviews)', price: 124, durationMin: 30, notes: ['1 string length can be upto 12m', 'Uninstallation charges for 1 light string'], icon: <IcoLightUninstall /> },

  // ── Balcony lights ──
  { id: 'fl-balcony-starry', title: 'Balcony lights installation (Starry)', sections: ['balcony-lights'], rating: '4.66 (2K reviews)', price: 248, priceLabel: 'starts-at', optionsCount: 2, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoBalconyLights /> },
  { id: 'fl-balcony-string', title: 'Balcony lights installation (String)', sections: ['balcony-lights'], rating: '4.69 (6K reviews)', price: 495, priceLabel: 'starts-at', optionsCount: 2, notes: ['1 string length can be upto 12m', 'Charges cover installation only'], icon: <IcoBalconyLights /> },

  // ── Railing lights ──
  { id: 'fl-railing-rope', title: 'Railing lights installation (Rope)', sections: ['railing-lights'], rating: '4.55 (788 reviews)', price: 248, priceLabel: 'starts-at', optionsCount: 2, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoRailingLights /> },
  { id: 'fl-railing-string', title: 'Railing lights installation (String)', sections: ['railing-lights'], rating: '4.63 (522 reviews)', price: 495, priceLabel: 'starts-at', optionsCount: 2, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoRailingLights /> },
  { id: 'fl-railing-starry', title: 'Railing lights installation (Starry)', sections: ['railing-lights'], rating: '4.68 (219 reviews)', price: 198, priceLabel: 'starts-at', optionsCount: 2, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoRailingLights /> },

  // ── Room lights ──
  { id: 'fl-room-starry', title: 'Room lights installation (Starry)', sections: ['room-lights'], rating: '4.86 (338 reviews)', price: 198, priceLabel: 'starts-at', optionsCount: 2, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoRoomLights /> },
  { id: 'fl-room-string', title: 'Room lights installation (String)', sections: ['room-lights'], rating: '4.73 (478 reviews)', price: 198, priceLabel: 'starts-at', optionsCount: 3, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoRoomLights /> },

  // ── Mandir lights ──
  { id: 'fl-mandir-lights', title: 'Mandir lights installation', sections: ['mandir-lights'], rating: '4.63 (950 reviews)', price: 124, priceLabel: 'starts-at', optionsCount: 3, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoMandirLights /> },

  // ── Outdoor lights ──
  { id: 'fl-outdoor-lights', title: 'Outdoor lights installation', sections: ['outdoor-lights'], rating: '4.56 (490 reviews)', price: 1560, priceLabel: 'starts-at', optionsCount: 2, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoOutdoorLights /> },

  // ── Garden lights ──
  { id: 'fl-garden-lights', title: 'Garden lights installation', sections: ['garden-lights'], rating: '4.64 (538 reviews)', price: 198, priceLabel: 'starts-at', optionsCount: 3, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoGardenLights /> },

  // ── Xmas light decor ──
  { id: 'fl-xmas-tree-lights', title: 'Xmas tree lights installation', sections: ['xmas-light-decor'], rating: '5.00 (34 reviews)', price: 99, priceLabel: 'starts-at', optionsCount: 3, notes: ['1 string length can be up to 12m', 'Charges cover installation only'], icon: <IcoXmasLightDecor /> },

  // ── Custom services (own new items — Light uninstallation is
  // defined above and cross-listed here) ──
  { id: 'fl-xmas-lantern', title: 'Xmas lantern installation', sections: ['custom-services'], rating: '4.91 (252 reviews)', price: 99, durationMin: 30, notes: ['Charges cover installation only'], icon: <IcoCustomServices /> },
  { id: 'fl-lantern-per-lantern', title: 'Lantern installation (per lantern)', sections: ['custom-services'], rating: '4.78 (1K reviews)', price: 124, durationMin: 30, notes: ['Charges cover installation only'], icon: <IcoCustomServices /> },
  { id: 'fl-light-install-per-string', title: 'Light installation (per string)', sections: ['custom-services'], rating: '4.67 (6K reviews)', price: 124, durationMin: 30, notes: ['1 string length can be upto 12m', 'Installation charges for 1 light string'], icon: <IcoCustomServices /> },
]

const SECTIONS: { id: LightsSection; label: string; icon: React.ReactNode }[] = [
  { id: 'light-uninstallations', label: 'Light uninstallations', icon: <IcoLightUninstall /> },
  { id: 'balcony-lights', label: 'Balcony lights', icon: <IcoBalconyLights /> },
  { id: 'railing-lights', label: 'Railing lights', icon: <IcoRailingLights /> },
  { id: 'room-lights', label: 'Room lights', icon: <IcoRoomLights /> },
  { id: 'mandir-lights', label: 'Mandir lights', icon: <IcoMandirLights /> },
  { id: 'outdoor-lights', label: 'Outdoor lights', icon: <IcoOutdoorLights /> },
  { id: 'garden-lights', label: 'Garden lights', icon: <IcoGardenLights /> },
  { id: 'xmas-light-decor', label: 'Xmas light decor', icon: <IcoXmasLightDecor /> },
  { id: 'custom-services', label: 'Custom services', icon: <IcoCustomServices /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<LightsSection, { title: string; subtitle: string }> = {
  'light-uninstallations': { title: 'Take it all down safely', subtitle: 'Light strings removed cleanly once the festival ends.' },
  'balcony-lights': { title: 'Light up your balcony', subtitle: 'Starry and string lights, installed securely.' },
  'railing-lights': { title: 'Railings that glow', subtitle: 'Rope, string & starry lights for every railing.' },
  'room-lights': { title: 'Bring the festive mood indoors', subtitle: 'Starry and string lights for any room.' },
  'mandir-lights': { title: 'Light up your mandir', subtitle: 'Festive lighting installed with care.' },
  'outdoor-lights': { title: 'Make your home shine', subtitle: 'Outdoor light installations for the whole house.' },
  'garden-lights': { title: 'A garden that glows', subtitle: 'Festive lighting for gardens and pathways.' },
  'xmas-light-decor': { title: 'Trim the tree with light', subtitle: 'Xmas tree light installation, done neatly.' },
  'custom-services': { title: 'Anything else lighting-related', subtitle: 'Lanterns and per-string installs & uninstalls.' },
}

function getItem(id: string): LightsItem {
  const item = LIGHTS_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Festival Lights item id: ${id}`)
  return item
}

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Festival Lights Installation</span>
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
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Festival Lights Installation</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'lights-installation' })}
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

// ─── Hero — no real festival-lights photo exists in this project, so
// this uses the same warm-gradient + icon placeholder every other
// missing-photo surface in this app falls back to; the real page
// rating/bookings figure is kept as a small chip, same real data point
// every sibling screen keeps where the reference shows one. ───────────

function HeroBanner({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Electrician, Plumber &amp; Carpenter</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Light up the<br />occasion.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Balcony, railing, room & outdoor lights — installed and removed safely.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <span className="flex items-center gap-1 text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={13} /> 4.69 <span className="text-[#68636D] font-normal" style={{ fontFamily: FONT_BODY }}>(34K bookings)</span></span>
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
        <div style={{ transform: 'scale(3.2)' }}><IcoXmasLightDecor /></div>
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

function ItemMeta({ item }: { item: LightsItem }) {
  return (
    <div className="text-left sm:text-right">
      <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
        {item.priceLabel === 'starts-at' && <span className="text-[#68636D]">Starts at </span>}
        <span className="font-semibold text-[#242326]">₹{item.price.toLocaleString('en-IN')}</span>
      </div>
      {item.durationMin !== undefined ? (
        <div className="text-[11px] font-semibold text-[#722ED1] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
      ) : item.optionsCount !== undefined ? (
        <div className="text-[11px] text-[#9A949D] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''}</div>
      ) : null}
    </div>
  )
}

function LightsLineItemRow({ item, cartCount, onAdd, onViewDetails }: {
  item: LightsItem
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
        {item.notes?.map(n => (
          <span key={n} className="text-[11.5px] text-[#9A949D] leading-snug" style={{ fontFamily: FONT_BODY }}>• {n}</span>
        ))}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
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
  item: LightsItem
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
            {item.durationMin !== undefined && (
              <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>
            )}
            {item.optionsCount !== undefined && (
              <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''} available at booking</span>
            )}
          </div>
          {item.notes?.map(n => (
            <span key={n} className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>• {n}</span>
          ))}
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

export default function LightsInstallationScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItem, setDetailItem] = useState<string | null>(null)

  const addToCart = (item: LightsItem) => {
    addItem({
      cartId: item.id,
      serviceEntry: 'home-services',
      categoryId: 'lights-installation',
      serviceId: item.id,
      serviceName: item.title,
      title: item.title,
      price: item.price,
      originalPrice: item.price,
      duration: item.durationMin !== undefined ? formatDuration(item.durationMin) : undefined,
    })
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`lights-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'lights-installation',
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
                  Festival Lights Installation
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('balcony-lights')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = LIGHTS_ITEMS.filter(i => i.sections.includes(section.id))
                    return (
                      <div key={section.id} id={`lights-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <LightsLineItemRow
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
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  )
}
