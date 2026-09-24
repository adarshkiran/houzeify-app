// ─── Cockroach Control — Cleaning & Pest Control → Pest Control →
// Cockroach Control ──────────────────────────────────────────────────
//
// Built from a real-page reference PDF the user supplied (UB-CC16) —
// used for its "Select a service" catalogue (2 sections: Kitchen/
// Bathroom, Apartment/Bungalow) and every service's own rating/
// reviews/price/description, taken as given. Its own real "60 days
// warranty" note is kept as a badge under the page title.
//
// Each of the 6 items' own real per-tier options (e.g. "Only kitchen"
// … "5 bathrooms & kitchen") were later supplied via reference
// screenshots and are wired in as a real OptionsModal picker — same
// component and pattern BathroomCleaningScreen's own options-bearing
// rows use — rather than the plain "N options" hint this page used
// before that data existed.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own page-level aggregate rating/"earliest slot" header,
// its own real-brand promotional video banner ("2. Gel treatment to
// break the lifecycle" / "Book Urban Company — Smart Pest Control"),
// footer, brand promise card, and whatever was in its own cart at
// capture time — this page's own HeroBanner/CategoryBanners use
// original Houzeify copy instead, same as every sibling screen.
//
// Honesty note: no real pest-control photography exists in this
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
const IcoKitchenBath = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h14M3 8v7a1 1 0 001 1h10a1 1 0 001-1V8M3 8l1-4h12l1 4" />
    <path d="M8 12.5h4" />
  </svg>
)
const IcoApartmentBungalow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="6" width="7" height="11.5" rx="0.8" />
    <path d="M11 17.5V9l7-4.5v13H11z" />
    <path d="M5 9h.01M5 12h.01M5 15h.01" />
  </svg>
)
const IcoSprayBottle = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2.5h3M9.5 2.5V5" />
    <rect x="6" y="5" width="4.5" height="3" rx="0.6" />
    <path d="M7 8h2.5l1.5 2v7.5a1 1 0 01-1 1H6.5a1 1 0 01-1-1V10L7 8z" />
  </svg>
)

// ─── Data model — every field preserved exactly as given in the
// reference where present; anything the reference didn't show for a
// given service stays undefined and is never rendered. ────────────────

interface CockroachItem {
  id: string
  title: string
  section: 'kitchen-bathroom' | 'apartment-bungalow'
  rating: string
  price: number
  priceLabel?: 'starts-at'
  description?: string
  note?: string
  options?: CockroachItemOption[]
  icon: React.ReactNode
}
// A real, concrete sub-option — e.g. "Only kitchen" … "5 bathrooms &
// kitchen" under a Kitchen/Bathroom item, or "1 bhk" … "5 bhk" under an
// Apartment item — each with its own real rating/price, taken from a
// reference screenshot the user supplied.
interface CockroachItemOption {
  id: string
  label: string
  price: number
  rating?: string
}

const COCKROACH_ITEMS: CockroachItem[] = [
  // ── Kitchen/Bathroom ──
  {
    id: 'cc-kb-with-utensil-removal', title: 'Pest control (includes utensil removal)', section: 'kitchen-bathroom', rating: '4.79 (166K reviews)', price: 1399, priceLabel: 'starts-at', description: 'Treatment will be completed in 2 visits with 2 weeks of gap', note: "We'll remove utensils before the service begins", icon: <IcoSprayBottle />,
    options: [
      { id: 'cc-kb-wu-only-kitchen', label: 'Only kitchen', price: 1399, rating: '4.79 (109K reviews)' },
      { id: 'cc-kb-wu-1bath-kitchen', label: '1 bathroom & kitchen', price: 1549, rating: '4.78 (19K reviews)' },
      { id: 'cc-kb-wu-2bath-kitchen', label: '2 bathrooms & kitchen', price: 1699, rating: '4.78 (27K reviews)' },
      { id: 'cc-kb-wu-3bath-kitchen', label: '3 bathrooms & kitchen', price: 1749, rating: '4.76 (9K reviews)' },
      { id: 'cc-kb-wu-4bath-kitchen', label: '4 bathrooms & kitchen', price: 1799, rating: '4.72 (1K reviews)' },
      { id: 'cc-kb-wu-5bath-kitchen', label: '5 bathrooms & kitchen', price: 1849, rating: '4.67 (496 reviews)' },
    ],
  },
  {
    id: 'cc-kb-no-utensil-removal', title: 'Pest control (no utensil removal)', section: 'kitchen-bathroom', rating: '4.80 (95K reviews)', price: 1099, priceLabel: 'starts-at', description: 'Treatment will be completed in 2 visits with 2 weeks of gap', note: 'Excludes removal of utensils & objects before the service begins', icon: <IcoSprayBottle />,
    options: [
      { id: 'cc-kb-nu-only-kitchen', label: 'Only kitchen', price: 1099, rating: '4.81 (59K reviews)' },
      { id: 'cc-kb-nu-1bath-kitchen', label: '1 bathroom & kitchen', price: 1249, rating: '4.79 (12K reviews)' },
      { id: 'cc-kb-nu-2bath-kitchen', label: '2 bathrooms & kitchen', price: 1399, rating: '4.80 (17K reviews)' },
      { id: 'cc-kb-nu-3bath-kitchen', label: '3 bathrooms & kitchen', price: 1449, rating: '4.78 (5K reviews)' },
      { id: 'cc-kb-nu-4bath-kitchen', label: '4 bathrooms & kitchen', price: 1499, rating: '4.77 (835 reviews)' },
      { id: 'cc-kb-nu-5bath-kitchen', label: '5 bathrooms & kitchen', price: 1549, rating: '4.76 (309 reviews)' },
    ],
  },

  // ── Apartment/Bungalow ──
  {
    id: 'cc-apt-utensil-by-customer', title: 'Apartment pest control (utensil removal by customer)', section: 'apartment-bungalow', rating: '4.81 (75K reviews)', price: 1749, priceLabel: 'starts-at', description: 'Spray treatment followed by gel treatment after 2 weeks', note: 'Excludes removal of utensils & objects before the service begins', icon: <IcoApartmentBungalow />,
    options: [
      { id: 'cc-apt-cust-1bhk', label: '1 bhk', price: 1749, rating: '4.82 (14K reviews)' },
      { id: 'cc-apt-cust-2bhk', label: '2 bhk', price: 1849, rating: '4.80 (35K reviews)' },
      { id: 'cc-apt-cust-3bhk', label: '3 bhk', price: 1949, rating: '4.80 (23K reviews)' },
      { id: 'cc-apt-cust-4bhk', label: '4 bhk', price: 2149, rating: '4.76 (2K reviews)' },
      { id: 'cc-apt-cust-5bhk', label: '5 bhk', price: 2399, rating: '4.79 (389 reviews)' },
    ],
  },
  {
    id: 'cc-apt-with-utensil-removal', title: 'Apartment pest control (includes utensil removal)', section: 'apartment-bungalow', rating: '4.79 (105K reviews)', price: 2049, priceLabel: 'starts-at', description: 'Spray treatment followed by gel treatment after 2 weeks', note: "We'll remove utensils before the service begins", icon: <IcoApartmentBungalow />,
    options: [
      { id: 'cc-apt-wu-1bhk', label: '1 bhk', price: 2049, rating: '4.80 (20K reviews)' },
      { id: 'cc-apt-wu-2bhk', label: '2 bhk', price: 2149, rating: '4.79 (50K reviews)' },
      { id: 'cc-apt-wu-3bhk', label: '3 bhk', price: 2249, rating: '4.78 (31K reviews)' },
      { id: 'cc-apt-wu-4bhk', label: '4 bhk', price: 2449, rating: '4.73 (3K reviews)' },
      { id: 'cc-apt-wu-5bhk', label: '5 bhk', price: 2699, rating: '4.74 (471 reviews)' },
    ],
  },
  {
    id: 'cc-bungalow-utensil-by-customer', title: 'Bungalow pest control (utensil removal by customer)', section: 'apartment-bungalow', rating: '4.74 (2K reviews)', price: 2349, priceLabel: 'starts-at', description: 'Spray treatment followed by gel treatment after 2 weeks', note: 'Excludes removal of utensils & objects before the service begins', icon: <IcoApartmentBungalow />,
    options: [
      { id: 'cc-bng-cust-2000-3000', label: '2000-3000 sq. ft.', price: 2349, rating: '4.77 (2K reviews)' },
      { id: 'cc-bng-cust-3000-4000', label: '3000-4000 sq. ft.', price: 2549, rating: '4.67 (350 reviews)' },
      { id: 'cc-bng-cust-4000-5000', label: '4000-5000 sq. ft.', price: 2849, rating: '4.79 (107 reviews)' },
      { id: 'cc-bng-cust-5000-plus', label: '5000+ sq. ft.', price: 3049, rating: '4.52 (89 reviews)' },
    ],
  },
  {
    id: 'cc-bungalow-with-utensil-removal', title: 'Bungalow pest control (includes utensil removal)', section: 'apartment-bungalow', rating: '4.73 (3K reviews)', price: 2649, priceLabel: 'starts-at', description: 'Spray treatment followed by gel treatment after 2 weeks', note: "We'll remove utensils before the service begins", icon: <IcoApartmentBungalow />,
    options: [
      { id: 'cc-bng-wu-2000-3000', label: '2000-3000 sq. ft.', price: 2649, rating: '4.74 (2K reviews)' },
      { id: 'cc-bng-wu-3000-4000', label: '3000-4000 sq. ft.', price: 2849, rating: '4.73 (493 reviews)' },
      { id: 'cc-bng-wu-4000-5000', label: '4000-5000 sq. ft.', price: 3149, rating: '4.77 (102 reviews)' },
      { id: 'cc-bng-wu-5000-plus', label: '5000+ sq. ft.', price: 3349, rating: '4.47 (140 reviews)' },
    ],
  },
]

const SECTIONS: { id: CockroachItem['section']; label: string; icon: React.ReactNode }[] = [
  { id: 'kitchen-bathroom', label: 'Kitchen/Bathroom', icon: <IcoKitchenBath /> },
  { id: 'apartment-bungalow', label: 'Apartment/Bungalow', icon: <IcoApartmentBungalow /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<CockroachItem['section'], { title: string; subtitle: string }> = {
  'kitchen-bathroom': { title: 'Keep pests off the counter', subtitle: 'Targeted cockroach treatment for kitchens and bathrooms.' },
  'apartment-bungalow': { title: 'Whole-home roach protection', subtitle: 'Complete treatment sized to your apartment or bungalow.' },
}

function getCockroachItem(id: string, section: CockroachItem['section']): CockroachItem {
  const item = COCKROACH_ITEMS.find(i => i.id === id && i.section === section)
  if (!item) throw new Error(`Unknown Cockroach Control item id: ${id} in section ${section}`)
  return item
}
/** A single lookup point for "what has options" — mirrors
 *  BathroomCleaningScreen's own getOptionsSource, minus the
 *  package/item split this page doesn't have. */
function getOptionsSource(id: string, section: CockroachItem['section']): { title: string; rating: string; options: CockroachItemOption[]; icon: React.ReactNode } {
  const item = getCockroachItem(id, section)
  return { title: item.title, rating: item.rating, options: item.options ?? [], icon: item.icon }
}

interface Addable {
  id: string
  title: string
  price: number
}

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Cockroach Control</span>
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
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Cockroach Control</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'cockroach-control' })}
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
            <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[var(--hz-border)] flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)] shrink-0">
              {s.icon}
            </div>
            <span className="text-[12px] text-[var(--hz-ink)] text-center leading-tight break-words w-full" style={{ fontFamily: FONT_BODY }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Hero — no real pest-control photo exists in this project, so this
// uses the same warm-gradient + icon placeholder every other missing-
// photo surface in this app falls back to (the reference's own hero
// here is a real promotional video for a real campaign, not catalogue
// data). Its real "60 days warranty" note is kept as a badge. ────────

function HeroBanner({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, var(--hz-primary-wash) 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Cockroach Control</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Send cockroaches<br />packing.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Safe, effective spray & gel treatment — backed by a 60-day warranty.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore services
          </button>
          <span
            className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[#0F7A3D] text-[13px] font-semibold bg-[var(--hz-surface)] shrink-0"
            style={{ fontFamily: FONT_BODY }}
          >
            <IcoShield size={16} /> 60 days warranty
          </span>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[var(--hz-primary)] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoSprayBottle size={40} /></div>
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

function CockroachLineItemRow({ item, cartCount, getCartCount, onSelect, onViewDetails }: {
  item: CockroachItem
  cartCount: number
  getCartCount: (id: string) => number
  onSelect: () => void
  onViewDetails: () => void
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="w-32 h-32 shrink-0 mx-auto sm:mx-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)]">
        {item.icon}
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
        {item.options && (
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
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[var(--hz-primary)] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          View details
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
            {item.priceLabel === 'starts-at' && <span className="text-[var(--hz-ink-muted)]">Starts at </span>}
            <span className="font-semibold text-[var(--hz-ink)]">₹{item.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <button onClick={onSelect} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : item.options ? 'Select' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── "View details" — makes the link genuinely interactive: same info
// the row already shows, in one focused panel, with its own Add button.
function ServiceDetailModal({ item, cartCount, onSelect, onClose }: {
  item: CockroachItem
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
              <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
            </span>
          </div>
          {item.description && <p className="text-[13px] text-[var(--hz-ink)] leading-relaxed m-0" style={{ fontFamily: FONT_BODY }}>{item.description}</p>}
          {item.note && <span className="text-[12px] text-[var(--hz-ink-subtle)] italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>}
          {item.options && (
            <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.options.length} options available</span>
          )}
          <button
            onClick={onSelect}
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

// ─── Options picker modal — opened from a line item that has real,
// user-supplied option data (e.g. "Only kitchen" … "5 bathrooms &
// kitchen"). Same calm card language as the rest of this file, same
// component every other options-bearing page in this app uses — not a
// separate visual system. ─────────────────────────────────────────────

function OptionsModal({ source, cartCountForOption, onAddOption, onClose }: {
  source: { id: string; section: CockroachItem['section'] }
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: CockroachItemOption) => void
  onClose: () => void
}) {
  const { title, options, icon } = getOptionsSource(source.id, source.section)
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
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Choose an option</span>
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
                  <span className="text-[13px] font-semibold text-[var(--hz-ink)] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>₹{opt.price.toLocaleString('en-IN')}</span>
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

export default function CockroachControlScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItem, setDetailItem] = useState<{ id: string; section: CockroachItem['section'] } | null>(null)
  const [expandedItem, setExpandedItem] = useState<{ id: string; section: CockroachItem['section'] } | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'cockroach-control',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.price,
    })
  }

  // A selected option becomes its own cart line — titled "Item —
  // Option" so the cart stays legible about exactly what was booked —
  // then the picker closes.
  const addOptionToCart = (source: { id: string; section: CockroachItem['section'] }, option: CockroachItemOption) => {
    const { title } = getOptionsSource(source.id, source.section)
    addToCart({ id: option.id, title: `${title} — ${option.label}`, price: option.price })
    setExpandedItem(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`cockroach-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'cockroach-control',
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
                  Cockroach Control
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('kitchen-bathroom')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = COCKROACH_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`cockroach-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <CockroachLineItemRow
                            key={`${section.id}-${item.id}`}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onSelect={() => (item.options ? setExpandedItem({ id: item.id, section: section.id }) : addToCart(item))}
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
          item={getCockroachItem(detailItem.id, detailItem.section)}
          cartCount={cartCountForItem(detailItem.id)}
          onSelect={() => {
            const item = getCockroachItem(detailItem.id, detailItem.section)
            if (item.options) {
              setExpandedItem(detailItem)
              setDetailItem(null)
            } else {
              addToCart(item)
            }
          }}
          onClose={() => setDetailItem(null)}
        />
      )}

      {expandedItem && (
        <OptionsModal
          source={expandedItem}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(expandedItem, option)}
          onClose={() => setExpandedItem(null)}
        />
      )}
    </div>
  )
}
