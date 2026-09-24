// ─── Makeup, Saree & Styling — Women's Salon & Spa → Makeup, Saree & Styling ─
//
// Built from a real-page reference PDF the user supplied (UB05) — used
// for its "Select a service" catalogue (7 sections: Packages, Group
// deals, Saree draping, Wedding combos, Party makeup, Hair styling,
// Add-ons) and every service's own rating/reviews/price/original
// price/duration/description, taken as given. Values the reference
// didn't show (e.g. an item with no duration) are never invented —
// simply omitted. Two "Packages" entries (Saree draping & hair styling
// / Saree draping & basic makeup) have a real breakdown + an "Edit
// your package" button — same idea as every other page's editable
// package, except neither carries a discount here, so there's no "X%
// OFF" photo panel to show; "Edit your package" scrolls to a relevant
// section, the same honest fallback every sibling screen uses for a
// package without a bespoke customiser. "Makeup pack trio" only shows
// an "N options" count in the reference (the real variants sit behind
// a click this single-page capture doesn't reach) — same as the other
// pages' "N options available" placeholders, until real data arrives.
//
// PAGE ITSELF follows the exact same house system as every other
// Women's Salon & Spa screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own page-level aggregate rating/"earliest slot" header,
// footer, brand promise card, cashback promo banner, and whatever was
// in its own cart at capture time.
//
// Honesty note: no real makeup/styling photography exists in this
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
// Section-nav icons
const IcoPackage = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6.5L10 3l7 3.5-7 3.5-7-3.5Z" />
    <path d="M3 6.5V14l7 3.5 7-3.5V6.5" />
    <path d="M10 10v7.5" />
  </svg>
)
const IcoGroup = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="2.5" />
    <circle cx="14" cy="8" r="2" />
    <path d="M2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
    <path d="M12 12.5c2 0 3.5 1.3 3.5 3.5" />
  </svg>
)
const IcoSaree = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 2.5c-1 3-1 12-2.5 15M7 2.5c1.5 2 1.5 11 0 15M7 2.5c2 1.5 5.5 3 7 2" />
    <path d="M8.5 6c1.5 1 4 2 5.5 1.3" />
    <path d="M9.5 10c1.5 1 3.7 1.8 5 1.2" />
  </svg>
)
const IcoRings = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="11" r="4.5" />
    <circle cx="12.5" cy="11" r="4.5" />
    <path d="M8.5 3.5L10 6l1.5-2.5" />
  </svg>
)
const IcoLipstick = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 11h4v5a2 2 0 01-2 2 2 2 0 01-2-2v-5Z" />
    <path d="M8 11c0-3 .5-6 2-8 1.5 2 2 5 2 8" />
  </svg>
)
const IcoComb = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 5.5h13v3h-13z" />
    <path d="M5 8.5v8M7.5 8.5v8M10 8.5v8M12.5 8.5v8M15 8.5v8" />
  </svg>
)
const IcoPlus = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 6.5v7M6.5 10h7" />
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

interface MakeupItem {
  id: string
  title: string
  section: 'packages' | 'group-deals' | 'saree-draping' | 'wedding-combos' | 'party-makeup' | 'hair-styling' | 'add-ons'
  rating: string
  price: number
  priceLabel?: 'starts-at'
  originalPrice?: number
  durationMin?: number
  description?: string
  note?: string
  /** "Label: Value" breakdown lines — only the two real editable
   *  packages have these. */
  includes?: string[]
  /** Shows "Edit your package" alongside Add — only set with `includes`. */
  editable?: boolean
  optionsCount?: number
  icon: React.ReactNode
}

const MAKEUP_ITEMS: MakeupItem[] = [
  // ── Packages ──
  { id: 'ms-basic-makeup-pkg', title: 'Basic makeup package', section: 'packages', rating: '4.72 (12K reviews)', price: 2099, durationMin: 90, description: 'Ideal for daytime events, office occasions & brunches', note: 'Includes basic makeup & basic hairstyling', icon: <IcoLipstick /> },
  { id: 'ms-luxe-makeup-pkg', title: 'Luxe makeup package', section: 'packages', rating: '4.67 (2K reviews)', price: 3799, durationMin: 120, description: 'Ideal for festive gatherings, parties & wedding celebrations', note: 'Includes Luxury makeup & advance hairstyling', icon: <IcoLipstick /> },
  { id: 'ms-hd-makeup-pkg', title: 'HD makeup package', section: 'packages', rating: '4.73 (1K reviews)', price: 3299, durationMin: 105, description: 'Ideal for formal events, evening functions & photoshoots', note: 'Includes HD makeup & advance hairstyling', icon: <IcoLipstick /> },
  {
    id: 'ms-saree-hairstyling-pkg', title: 'Saree draping & hair styling', section: 'packages', rating: '4.73 (82K reviews)', price: 1498, durationMin: 80,
    includes: ['Saree draping: Basic saree draping', 'Hair styling: Advance hairstyling'], editable: true, icon: <IcoSaree />,
  },
  {
    id: 'ms-saree-makeup-pkg', title: 'Saree draping & basic makeup', section: 'packages', rating: '4.73 (60K reviews)', price: 2098, durationMin: 65,
    includes: ['Makeup: Basic makeup', 'Saree draping: Basic saree draping'], editable: true, icon: <IcoSaree />,
  },

  // ── Group deals ──
  { id: 'ms-makeup-trio', title: 'Makeup pack trio', section: 'group-deals', rating: '4.90 (81 reviews)', price: 4317, priceLabel: 'starts-at', description: 'Makeup for 3 at a special price — ideal for parties & celebrations.', optionsCount: 3, icon: <IcoGroup /> },
  { id: 'ms-hairstyling-trio', title: 'Advanced hair styling trio', section: 'group-deals', rating: '4.76 (137 reviews)', price: 2797, originalPrice: 2997, durationMin: 160, description: 'Advanced hairstyles for 3 - perfect for parties & events.', note: 'Get a flat ₹200 off with this exclusive deal.', icon: <IcoGroup /> },

  // ── Saree draping ──
  { id: 'ms-basic-saree', title: 'Basic saree draping', section: 'saree-draping', rating: '4.73 (39K reviews)', price: 499, durationMin: 20, description: 'Choose any saree/sari or lehenga draping style', icon: <IcoSaree /> },
  { id: 'ms-advanced-saree', title: 'Advanced saree draping', section: 'saree-draping', rating: '4.77 (2K reviews)', price: 699, durationMin: 30, description: 'Choose from double-pallu, heavy dupatta, or a lehenga style draping', icon: <IcoSaree /> },

  // ── Wedding combos ──
  { id: 'ms-premium-wedding', title: 'Premium wedding combo', section: 'wedding-combos', rating: '4.73 (65K reviews)', price: 4249, originalPrice: 4497, durationMin: 160, description: 'Luxe full-glam glow with high-end products for radiant, long-lasting perfection', icon: <IcoRings /> },
  { id: 'ms-complete-event', title: 'Complete event combo', section: 'wedding-combos', rating: '4.73 (66K reviews)', price: 3749, originalPrice: 3997, durationMin: 140, description: "A flawless, high-definition finish that's picture-perfect for every camera angle", icon: <IcoRings /> },
  { id: 'ms-glow-smart', title: 'Glow smart combo', section: 'wedding-combos', rating: '4.73 (70K reviews)', price: 2599, originalPrice: 2697, durationMin: 110, description: 'Soft, fresh glam for day events and celebrations - subtle, polished & wearable.', icon: <IcoRings /> },

  // ── Party makeup ──
  { id: 'ms-basic-makeup', title: 'Basic makeup', section: 'party-makeup', rating: '4.74 (12K reviews)', price: 1599, durationMin: 45, description: 'Get a natural, everyday glow with lightweight formula', note: 'Ideal for daytime events, office occasions & brunches', icon: <IcoLipstick /> },
  { id: 'ms-hd-finish-makeup', title: 'HD finish makeup', section: 'party-makeup', rating: '4.71 (4K reviews)', price: 2499, durationMin: 60, description: 'Get a perfect photo-ready glow with HD products', note: 'Ideal for formal events, evening functions & photoshoots', icon: <IcoLipstick /> },
  { id: 'ms-luxe-glamup', title: 'Luxe glam-up makeup', section: 'party-makeup', rating: '4.68 (2K reviews)', price: 2999, durationMin: 80, description: 'Get a full-glam, luminous finish with premium products', note: 'Ideal for festive gatherings, parties & wedding celebrations', icon: <IcoLipstick /> },

  // ── Hair styling ──
  { id: 'ms-basic-hairstyling', title: 'Basic hairstyling', section: 'hair-styling', rating: '4.72 (18K reviews)', price: 599, durationMin: 45, description: 'Choose any basic style from open, soft buns, pony & braid', icon: <IcoComb /> },
  { id: 'ms-advance-hairstyling', title: 'Advance hairstyling', section: 'hair-styling', rating: '4.73 (23K reviews)', price: 999, durationMin: 60, description: 'Choose from braids, curls, waves, low buns, up-dos & party hairstyles', icon: <IcoComb /> },

  // ── Add-ons ──
  { id: 'ms-basic-eye-makeup', title: 'Basic eye makeup', section: 'add-ons', rating: '4.71 (5K reviews)', price: 599, durationMin: 20, description: 'Pick your style from 1-shade wash, soft smokey, classic blend', icon: <IcoPlus /> },
  { id: 'ms-advanced-eye-makeup', title: 'Advanced Eye Makeup', section: 'add-ons', rating: '4.76 (1K reviews)', price: 799, durationMin: 30, description: 'Pick your look from cut crease, smokey, spotlight or glitter', icon: <IcoPlus /> },
  { id: 'ms-blast-dry', title: 'Blast dry', section: 'add-ons', rating: '4.84 (1K reviews)', price: 159, durationMin: 15, description: 'Fast blow-dry to remove excess moisture after your hair wash', icon: <IcoPlus /> },
]

const SECTIONS: { id: MakeupItem['section']; label: string; icon: React.ReactNode }[] = [
  { id: 'packages', label: 'Packages', icon: <IcoPackage /> },
  { id: 'group-deals', label: 'Group deals', icon: <IcoGroup /> },
  { id: 'saree-draping', label: 'Saree draping', icon: <IcoSaree /> },
  { id: 'wedding-combos', label: 'Wedding combos', icon: <IcoRings /> },
  { id: 'party-makeup', label: 'Party makeup', icon: <IcoLipstick /> },
  { id: 'hair-styling', label: 'Hair styling', icon: <IcoComb /> },
  { id: 'add-ons', label: 'Add-ons', icon: <IcoPlus /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other Women's Salon & Spa screen.
const SECTION_BANNERS: Record<MakeupItem['section'], { title: string; subtitle: string }> = {
  packages: { title: 'Everything in one booking', subtitle: 'Curated makeup, saree & styling packages for any occasion.' },
  'group-deals': { title: 'Better together', subtitle: 'Special group pricing for parties and celebrations.' },
  'saree-draping': { title: 'Perfectly draped, every time', subtitle: 'Classic and advanced draping styles from trained artists.' },
  'wedding-combos': { title: 'Your big day, sorted', subtitle: 'Complete glam combos for weddings and events.' },
  'party-makeup': { title: 'Ready for the spotlight', subtitle: 'Everyday to full-glam makeup, done at home.' },
  'hair-styling': { title: 'Style it your way', subtitle: 'Basic to advanced hairstyles for any look.' },
  'add-ons': { title: 'Finish the look', subtitle: 'Small extras to round out any makeup or styling service.' },
}

function getMakeupItem(id: string): MakeupItem {
  const item = MAKEUP_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown makeup item id: ${id}`)
  return item
}

interface Addable {
  id: string
  title: string
  price: number
  originalPrice?: number
  durationMin?: number
}

// ─── Chrome — same shell shape as every other Women's Salon & Spa
// screen. ────────────────────────────────────────────────────────────

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Makeup, Saree &amp; Styling</span>
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
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Makeup, Saree &amp; Styling</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'makeup-saree-styling' })}
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

// ─── Hero — no real makeup/styling photo exists in this project, so
// this uses the same warm-gradient + icon placeholder every other
// missing-photo surface in this app falls back to. ──────────────────

function HeroBanner({ onExplore, onViewAddOns }: { onExplore: () => void; onViewAddOns: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, var(--hz-primary-wash) 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Makeup, Saree &amp; Styling</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Look your best,<br />for every occasion.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Makeup, saree draping &amp; hair styling from trained artists.
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
            onClick={onViewAddOns}
            className="h-10 px-5 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[13px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
            style={{ fontFamily: FONT_BODY }}
          >
            View add-ons
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[var(--hz-primary)] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoLipstick /></div>
      </div>
    </div>
  )
}

// ─── Category banner — 128×128px icon panel, same component/placement
// as every other Women's Salon & Spa screen's own CategoryBanner. ─────

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

// ─── Card chrome — same "calm card" language as every other Women's
// Salon & Spa screen: CARD_SURFACE row (128×128 icon panel + content +
// price/button). One row type covers regular services, the two real
// editable packages (via `includes`/`editable`), and the "N options"
// placeholder item, rather than a separate card shape per case. ───────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, var(--hz-surface) 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-[var(--hz-surface)] border-[var(--hz-border)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)]'
const NEUTRAL_BTN_ADDED = 'bg-[var(--hz-primary-soft)] border-[var(--hz-primary)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

function MakeupLineItemRow({ item, cartCount, onSelect, onViewDetails, onEdit }: {
  item: MakeupItem
  cartCount: number
  onSelect: () => void
  onViewDetails: () => void
  onEdit: () => void
}) {
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
        {item.includes && (
          <ul className="flex flex-col gap-0.5 pl-4 m-0 mt-0.5" style={{ listStyle: 'disc' }}>
            {item.includes.map(inc => (
              <li key={inc} className="text-[12px] text-[var(--hz-ink)] leading-snug" style={{ fontFamily: FONT_BODY }}>{inc}</li>
            ))}
          </ul>
        )}
        {item.optionsCount && (
          <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} options available</span>
        )}
        <div className="flex items-center gap-3 mt-0.5">
          <button onClick={onViewDetails} className="self-start text-[12.5px] text-[var(--hz-primary)] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ fontFamily: FONT_BODY }}>
            View details
          </button>
          {item.editable && (
            <button onClick={onEdit} className="self-start text-[12.5px] text-[var(--hz-primary)] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ fontFamily: FONT_BODY }}>
              Edit your package
            </button>
          )}
        </div>
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
          {cartCount ? `Added ×${cartCount}` : item.optionsCount ? 'Select' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── "View details" — makes the link genuinely interactive: same info
// the row already shows, in one focused panel, with its own Add button.
function ServiceDetailModal({ item, cartCount, onSelect, onClose }: {
  item: MakeupItem
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
          {item.includes && (
            <ul className="flex flex-col gap-1 pl-4 m-0" style={{ listStyle: 'disc' }}>
              {item.includes.map(inc => (
                <li key={inc} className="text-[12.5px] text-[var(--hz-ink)] leading-snug" style={{ fontFamily: FONT_BODY }}>{inc}</li>
              ))}
            </ul>
          )}
          {item.optionsCount && <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} options available</span>}
          <button
            onClick={onSelect}
            className={`h-10 mt-1 rounded-[10px] border text-[13px] font-semibold cursor-pointer transition-all ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`}
            style={NEUTRAL_BTN_FONT}
          >
            {cartCount ? `Added ×${cartCount}` : item.optionsCount ? 'Select' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

const IcoCloseX = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
)

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
              <span className="line-through text-[var(--hz-ink-subtle)] text-[12px]">₹{c.originalPrice}</span>
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

// ─── Main Screen ────────────────────────────────────────────────────────

export default function MakeupSareeStylingScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItemId, setDetailItemId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'makeup-saree-styling',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.originalPrice ?? entry.price,
      duration: entry.durationMin ? formatDuration(entry.durationMin) : undefined,
    })
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`makeup-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'makeup-saree-styling',
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
                  other Women's Salon & Spa screen. */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Women's Salon &amp; Spa</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Makeup, Saree &amp; Styling
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('party-makeup')} onViewAddOns={() => jumpToSection('add-ons')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = MAKEUP_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`makeup-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <MakeupLineItemRow
                            key={item.id}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            onSelect={() => addToCart(item)}
                            onViewDetails={() => setDetailItemId(item.id)}
                            onEdit={() => jumpToSection('party-makeup')}
                          />
                        ))}
                      </div>
                    )
                  })}
                </div>

                {/* Right column — pinned on desktop, same as every other
                    Women's Salon & Spa screen. */}
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

      {detailItemId && (
        <ServiceDetailModal
          item={getMakeupItem(detailItemId)}
          cartCount={cartCountForItem(detailItemId)}
          onSelect={() => addToCart(getMakeupItem(detailItemId))}
          onClose={() => setDetailItemId(null)}
        />
      )}
    </div>
  )
}
