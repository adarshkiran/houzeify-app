// ─── Spa Ayurveda — Women's Salon & Spa → Spa for Women → Ayurveda ────────
//
// Built strictly from the "UB03 SERVICE DATA" work order the user
// supplied for this page: exact section names/order, exact service
// names/order, exact ratings/reviews/prices/original prices/durations/
// pressure/coverage/badges/descriptions/pack info, and an explicit
// featured-vs-compact card assignment per service. No value the work
// order left unspecified (e.g. a "Not specified" duration) is invented
// here — that field is simply omitted from the card, per the order's
// own "Do not invent missing values" rule.
//
// No reference image/PDF was actually attached to the work order, so
// imagery follows this app's own established convention (icon-on-
// gradient placeholder, one icon per treatment family per the order's
// own "VISUAL CONTENT" section) rather than a fabricated or borrowed
// photo. Everything else — sticky/glass nav, scrollMarginTop, 128×128
// icon panels, CARD_SURFACE line/photo panels, right-column shell — is
// the same house system as SpaLuxeScreen.tsx / SpaPrimeScreen.tsx.
//
// Per the work order's own suggested architecture (PromoBanner,
// CategoryNavigation, ServiceSection, PromiseCard, CartSummary) this
// page has NO hero banner — the promo banner takes that top-of-page
// slot instead.

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
// Section-nav icons
const IcoWave = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0" />
    <path d="M2 13c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0" />
  </svg>
)
const IcoHands = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11V5.5a1.5 1.5 0 013 0V10" />
    <path d="M7 10V4a1.5 1.5 0 013 0v6.5" />
    <path d="M10 10.2V5a1.5 1.5 0 013 0v6" />
    <path d="M13 11V7.5a1.5 1.5 0 013 0V13c0 3-2 5.5-5 5.5H8c-1.5 0-2.7-.7-3.6-1.8L2 13.5" />
  </svg>
)
const IcoPlus = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 6.5v7M6.5 10h7" />
  </svg>
)
// Per-treatment icons (see the work order's own "VISUAL CONTENT" list)
const IcoDroplet = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5S4.5 9 4.5 12.5a5.5 5.5 0 0011 0C15.5 9 10 2.5 10 2.5Z" />
  </svg>
)
const IcoPotli = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8.5c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5" />
    <path d="M4.5 8.5h11l-1 8a2 2 0 01-2 1.8H7.5a2 2 0 01-2-1.8l-1-8Z" />
    <path d="M8 8.5v2M12 8.5v2" />
  </svg>
)
const IcoFoot = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 17.5c-1.7 0-3-1.2-3-3.2 0-2 .9-3 .9-5.3 0-2.5-1.1-3-1.1-5A2.5 2.5 0 017.3 1.5c2 0 2.7 1.7 2.9 3.3.3 2.5 1.8 4 3.4 5.6 1.3 1.3 2.4 2.7 2.4 4.4 0 1.6-1.3 2.7-3 2.7-2.2 0-2.7-1.2-5-1.2Z" />
  </svg>
)
const IcoGlow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="4" />
    <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6L4.2 4.2" />
  </svg>
)
const IcoStretch = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="3.5" r="1.6" />
    <path d="M10 5.5v6M10 5.5L4.5 8M10 5.5L15.5 8M10 11.5L5.5 17.5M10 11.5l4.5 6" />
  </svg>
)
const IcoClock = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 5.5V10l3 2" />
  </svg>
)
const IcoFlame = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2s4 4 4 8a4 4 0 01-8 0c0-1 .5-2 1-2.5 0 1.5 1 2 1.5 1.5C8 8 8 5 10 2Z" />
  </svg>
)

function formatRating(rating: number, reviews: string): string {
  return `${rating.toFixed(2)} (${reviews} reviews)`
}

// ─── Data model — exact fields per the work order's own suggested
// model, plus `icon` (this app's own placeholder convention) and
// `featured` (explicit assignment from the order's card-type list).
// Any field the order didn't provide for a given service (duration,
// pressure, type, coverage, originalPrice, badge, benefits, packInfo)
// is simply left undefined and never rendered — never invented. ───────

/** One real selectable variant under an item that has more than one way
 *  to book it — same idea as every sibling screen's own options item. */
interface AyurvedaItemOption {
  id: string
  label: string
  price: number
  rating?: string
}
interface AyurvedaService {
  id: string
  title: string
  section: 'stress-relief' | 'pain-relief' | 'add-ons'
  badge?: 'BESTSELLER' | 'VALUE-SAVER'
  rating: number
  reviews: string
  price: number
  priceLabel?: 'starts-at'
  originalPrice?: number
  duration?: string
  pressure?: string
  type?: string
  coverage?: string
  description: string
  benefits?: string[]
  packInfo?: string
  featured: boolean
  icon: React.ReactNode
  /** Real per-option data — "Select" opens a picker of these instead of
   *  adding this item directly. */
  options?: AyurvedaItemOption[]
}

const AYURVEDA_SERVICES: AyurvedaService[] = [
  // ── Section 01 — Stress relief ──
  {
    id: 'ayu-abhyangam-neck-toe', title: 'Abhyangam neck-to-toe stress relief massage', section: 'stress-relief',
    rating: 4.81, reviews: '65K', price: 899, duration: '40 mins', pressure: 'Medium pressure', coverage: 'Neck to toe',
    description: 'Medium pressure neck-to-toe massage with herbal oil.',
    benefits: ["Ashwagandha's muscle-balancing properties", 'Helps you unwind', 'Promotes relaxation'],
    featured: false, icon: <IcoDroplet />,
  },
  {
    id: 'ayu-abhyangam-fullbody', title: 'Abhyangam full body stress relief massage', section: 'stress-relief', badge: 'BESTSELLER',
    rating: 4.80, reviews: '160K', price: 1329, priceLabel: 'starts-at', duration: '60 mins', type: 'Herbal oil', coverage: 'Full body',
    description: 'Herbal oil massage for deep relaxation.',
    packInfo: 'Add pack of 4 to unlock ₹1029/massage.',
    featured: true, icon: <IcoDroplet />,
    options: [
      { id: 'ayu-abhyangam-fullbody-60', label: '60 mins', price: 1329 },
      { id: 'ayu-abhyangam-fullbody-90', label: '90 mins', price: 1729 },
    ],
  },
  {
    id: 'ayu-abhyangam-foot', title: 'Abhyangam with foot massage', section: 'stress-relief',
    rating: 4.82, reviews: '10K', price: 1729, originalPrice: 1829, duration: '1 hr 20 mins',
    description: '60 mins Ashwagandha massage & 20 mins foot massage.',
    packInfo: 'Add pack of 4 to unlock ₹1529/massage.',
    featured: false, icon: <IcoDroplet />,
  },

  // ── Section 02 — Pain relief ──
  {
    id: 'ayu-vedic-signature', title: 'Vedic signature massage', section: 'pain-relief', badge: 'BESTSELLER',
    rating: 4.82, reviews: '81K', price: 1489, priceLabel: 'starts-at', duration: '60 mins', pressure: 'High pressure', coverage: 'Full body',
    description: 'Supports post-workout relaxation.',
    packInfo: 'Add pack of 4 to unlock ₹1139/massage.',
    featured: true, icon: <IcoHands />,
  },
  {
    id: 'ayu-vedic-signature-head', title: 'Vedic signature with head massage', section: 'pain-relief', badge: 'VALUE-SAVER',
    rating: 4.80, reviews: '7K', price: 1788, originalPrice: 1888, duration: '1 hr 20 mins',
    description: '60 mins Vedic massage & 20 mins head massage.',
    packInfo: 'Add pack of 4 to unlock ₹1588/massage.',
    featured: false, icon: <IcoHands />,
  },
  {
    id: 'ayu-potli-deepcleanse', title: 'Potli deep cleanse massage', section: 'pain-relief',
    rating: 4.80, reviews: '33K', price: 1649, priceLabel: 'starts-at', duration: '60 mins', pressure: 'Medium pressure', coverage: 'Full body',
    description: 'Herbal potlis soaked in warm oils for comfort and post-workout relaxation.',
    featured: true, icon: <IcoPotli />,
  },

  // ── Section 03 — Add-ons ──
  {
    id: 'ayu-paada-abhyanga', title: 'Paada abhyanga relaxing foot massage', section: 'add-ons',
    rating: 4.81, reviews: '35K', price: 499, duration: '20 mins',
    description: 'Helps ease discomfort & muscle stiffness, helps you wind down & invigorate.',
    benefits: ['Targets 5 Marma pressure points of the feet', 'Promotes overall well-being & health'],
    featured: false, icon: <IcoFoot />,
  },
  {
    id: 'ayu-shiro-abhyanga', title: 'Shiro abhyanga head, neck & shoulder massage', section: 'add-ons',
    rating: 4.80, reviews: '20K', price: 698, duration: '30 mins',
    description: 'Helps with eyestrain & fatigue, helps you wind down & nourishes healthy-looking hair.',
    benefits: ['Pressure-point massage', 'Uses 5 Marma points', 'Helps refresh the central nervous system'],
    featured: false, icon: <IcoHands />,
  },
  {
    id: 'ayu-kumkumadi', title: 'Kumkumadi brightening face massage', section: 'add-ons',
    rating: 4.81, reviews: '29K', price: 399, duration: '20 mins', pressure: 'Low pressure', coverage: 'All skin types',
    description: 'Refreshes the skin, hydrates, prevents signs of aging & refreshes dull-looking skin.',
    benefits: ['Helps relax facial muscles', 'Provides a warming sensation'],
    featured: true, icon: <IcoGlow />,
  },
  {
    id: 'ayu-bhringadi', title: 'Bhringadi head massage', section: 'add-ons',
    rating: 4.82, reviews: '21K', price: 399, duration: '20 mins', pressure: 'Medium pressure',
    description: 'Pressure-point focused head massage.',
    benefits: ['Provides a warming sensation', 'Nourishes the scalp', 'Supports healthy-looking hair'],
    featured: false, icon: <IcoHands />,
  },
  {
    id: 'ayu-warm-potli', title: 'Warm potli massage', section: 'add-ons',
    rating: 4.81, reviews: '19K', price: 499, priceLabel: 'starts-at',
    description: '22 herb-infused warm potli massage for easing chronic muscle & joint discomfort.',
    benefits: ['Helps tone muscles', 'Provides a deeply refreshing experience'],
    featured: false, icon: <IcoPotli />,
    options: [
      { id: 'ayu-warmpotli-neckshoulder', label: 'Neck & shoulder', price: 499, rating: '4.82 (7K reviews)' },
      { id: 'ayu-warmpotli-back', label: 'Back', price: 499, rating: '4.81 (6K reviews)' },
      { id: 'ayu-warmpotli-legs', label: 'Legs', price: 499, rating: '4.80 (6K reviews)' },
    ],
  },
  {
    id: 'ayu-stretch-therapy', title: 'Stretch therapy', section: 'add-ons',
    rating: 4.84, reviews: '3K', price: 379, duration: '15 mins', pressure: 'Low pressure', coverage: 'Full body',
    description: 'Full-body low-pressure stretch eases tension and boosts mobility.',
    benefits: ['Eases muscle tightness', 'Boosts overall mobility'],
    featured: false, icon: <IcoStretch />,
  },
  {
    id: 'ayu-massage-topup', title: 'Massage top-up (15 mins)', section: 'add-ons',
    rating: 4.79, reviews: '13K', price: 199, duration: '15 mins',
    description: 'Extend your relaxation with 15 extra minutes of massage therapy.',
    featured: false, icon: <IcoClock />,
  },
  {
    id: 'ayu-hot-bed', title: 'Hot bed', section: 'add-ons',
    rating: 4.79, reviews: '13K', price: 49,
    description: 'Advanced technology for ambient massage temperature.',
    benefits: ['Provides a warming sensation', 'Helps remove stiffness'],
    featured: true, icon: <IcoFlame />,
  },
]

const BADGE_STYLES: Record<NonNullable<AyurvedaService['badge']>, { bg: string; label: string }> = {
  BESTSELLER: { bg: '#D4A017', label: '★ Bestseller' },
  'VALUE-SAVER': { bg: '#2B6CB0', label: '✦ Value Saver' },
}

// Section order + nav icon, exactly as specified ("1. Stress relief,
// 2. Pain relief, 3. Add-ons").
const SECTIONS: { id: AyurvedaService['section']; label: string; icon: React.ReactNode }[] = [
  { id: 'stress-relief', label: 'Stress relief', icon: <IcoWave /> },
  { id: 'pain-relief', label: 'Pain relief', icon: <IcoHands /> },
  { id: 'add-ons', label: 'Add-ons', icon: <IcoPlus /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// "small icon-on-gradient banner introduces the section" pattern as
// every other Women's Salon & Spa screen (Salon Luxe/Spa Luxe/Spa
// Prime), so this page's sections read as the same house system.
const SECTION_BANNERS: Record<AyurvedaService['section'], { title: string; subtitle: string }> = {
  'stress-relief': { title: 'Ancient oils, deep relaxation', subtitle: 'Warm herbal-oil massages rooted in Ayurvedic tradition.' },
  'pain-relief': { title: 'Time-tested relief techniques', subtitle: 'Vedic and potli therapies for lasting muscle relief.' },
  'add-ons': { title: 'Round out your ritual', subtitle: 'Focused Ayurvedic add-ons for face, scalp, feet & more.' },
}

function getAyurvedaItem(id: string): AyurvedaService {
  const item = AYURVEDA_SERVICES.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Ayurveda service id: ${id}`)
  return item
}

interface Addable {
  id: string
  title: string
  price: number
  originalPrice?: number
  duration?: string
}

// ─── Chrome — same shell shape as Salon Luxe / Prime / Spa Luxe / Spa
// Prime. ─────────────────────────────────────────────────────────────

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Spa Ayurveda</span>
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
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Spa Ayurveda</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'spa-ayurveda' })}
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

// ─── Promotional banner — takes the top-of-page slot a hero would
// normally use (this page's own suggested component tree has no hero,
// only PromoBanner). Rakhi/festive warm palette, distinct from this
// app's usual brand-purple hero gradient, so it reads as a genuine
// limited-time offer rather than routine page chrome. ─────────────────

function PromoBanner() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] flex flex-col sm:flex-row sm:items-center gap-4 px-5 sm:px-10 py-6 sm:py-7"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #FFF3EA 0%, #FFE3D0 55%, #FDEBEF 100%)' }}
    >
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#B85C00] font-semibold" style={{ fontFamily: FONT_MONO }}>Limited-time offer</span>
        <h2 className="text-[20px] sm:text-[24px] font-semibold text-[var(--hz-ink)] leading-[1.2] m-0" style={{ fontFamily: FONT_HEAD }}>
          Pamper your Sister this Rakhi
        </h2>
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
          Get 25% off on your first booking
        </p>
      </div>
      <div
        className="flex items-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-[10px] bg-[var(--hz-surface)]/80 shrink-0"
        style={{ border: '1.5px dashed #B85C00' }}
      >
        <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Use code</span>
        <span className="text-[15px] font-semibold tracking-[0.05em] text-[#B85C00]" style={{ fontFamily: FONT_HEAD }}>RAKHI25</span>
      </div>
    </div>
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

// ─── Category banner — sits directly under a section's title, above
// its cards, 128×128px icon panel — same component/placement/size as
// every other Women's Salon & Spa screen's own CategoryBanner. ────────

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

function metaLine(item: AyurvedaService): string {
  return [item.pressure, item.type, item.coverage].filter(Boolean).join(' · ')
}
function PriceBlock({ item }: { item: AyurvedaService }) {
  return (
    <span className="text-[13.5px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
      {item.priceLabel === 'starts-at' && <span className="text-[var(--hz-ink-muted)]">Starts at </span>}
      {item.originalPrice && <span className="line-through text-[var(--hz-ink-subtle)] mr-1">₹{item.originalPrice.toLocaleString('en-IN')}</span>}
      <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
    </span>
  )
}

// Line item card — matches every other Women's Salon & Spa screen's own
// line-item row exactly (128×128 icon panel left, content middle,
// price/duration/button right, badge overlay top-left of the icon
// panel), so this page's sections read as the same house card as Salon
// Luxe/Spa Luxe/Spa Prime rather than a one-off "featured vs compact"
// treatment. Benefits, pack info and "View details" are additive
// content inside that same row, not a different card shape.
function SpaLineItemRow({ item, cartCount, onSelect, onViewDetails, getCartCount }: {
  item: AyurvedaService
  cartCount: number
  onSelect: () => void
  onViewDetails: () => void
  /** Looks up how many of a given cart-line id are in the cart — used
   *  here to check each of this item's OPTION ids (not just the item's
   *  own id) so a selected variant can be called out on the card. */
  getCartCount: (id: string) => number
}) {
  const meta = metaLine(item)
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 mx-auto sm:mx-0">
        <div className="w-32 h-32 shrink-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)]">
          {item.icon}
        </div>
        {item.badge && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: BADGE_STYLES[item.badge].bg, fontFamily: FONT_BODY }}
          >
            {BADGE_STYLES[item.badge].label}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {formatRating(item.rating, item.reviews)}</span>
        {meta && <span className="text-[12px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{meta}</span>}
        <span className="text-[12px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.description}</span>
        {item.benefits && (
          <ul className="flex flex-col gap-0.5 pl-4 m-0 mt-0.5" style={{ listStyle: 'disc' }}>
            {item.benefits.map(b => (
              <li key={b} className="text-[12px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{b}</li>
            ))}
          </ul>
        )}
        {item.packInfo && (
          <span className="text-[11.5px] font-semibold text-[#0F7A3D] mt-0.5" style={{ fontFamily: FONT_BODY }}>{item.packInfo}</span>
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
          <PriceBlock item={item} />
          {item.duration && (
            <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{item.duration}</div>
          )}
        </div>
        <button onClick={onSelect} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : item.options ? 'Select' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── Options picker modal — opened from an item that has real,
// user-supplied option data (currently "Warm potli massage"). Same
// calm card language as the rest of this file (CARD_SURFACE,
// NEUTRAL_BTN), same component every sibling screen uses for its own
// options items — not a separate visual system.
function OptionsModal({ item, cartCountForOption, onAddOption, onClose }: {
  item: AyurvedaService
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: AyurvedaItemOption) => void
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
                <div className="w-32 h-32 rounded-[10px] overflow-hidden flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)] shrink-0">
                  {item.icon}
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

// ─── "View details" — makes the link genuinely interactive (the work
// order requires this) without duplicating cart logic: same info the
// card already shows, in one focused panel, with its own Add button.
function ServiceDetailModal({ item, cartCount, onSelect, onClose }: {
  item: AyurvedaService
  cartCount: number
  onSelect: () => void
  onClose: () => void
}) {
  const meta = metaLine(item)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        className="w-full max-w-[440px] max-h-[85vh] overflow-y-auto rounded-[16px] bg-[var(--hz-surface)] flex flex-col"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--hz-surface-muted)] sticky top-0 bg-[var(--hz-surface)]">
          <div className="flex flex-col gap-1 min-w-0">
            {item.badge && (
              <span
                className="self-start flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
                style={{ backgroundColor: BADGE_STYLES[item.badge].bg, fontFamily: FONT_BODY }}
              >
                {BADGE_STYLES[item.badge].label}
              </span>
            )}
            <span className="text-[16px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {formatRating(item.rating, item.reviews)}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="w-16 h-16 rounded-[12px] flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)]">{item.icon}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <PriceBlock item={item} />
            {item.duration && <span className="text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{item.duration}</span>}
          </div>
          {meta && <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{meta}</span>}
          <p className="text-[13px] text-[var(--hz-ink)] leading-relaxed m-0" style={{ fontFamily: FONT_BODY }}>{item.description}</p>
          {item.benefits && (
            <ul className="flex flex-col gap-1 pl-4 m-0" style={{ listStyle: 'disc' }}>
              {item.benefits.map(b => (
                <li key={b} className="text-[12.5px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{b}</li>
              ))}
            </ul>
          )}
          {item.packInfo && <span className="text-[12px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_BODY }}>{item.packInfo}</span>}
          {item.options && <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.options.length} options available</span>}
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

export default function SpaAyurvedaScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItemId, setDetailItemId] = useState<string | null>(null)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'spa-ayurveda',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.originalPrice ?? entry.price,
      duration: entry.duration,
    })
  }

  // A selected option becomes its own cart line — titled "Item — Option"
  // so the cart stays legible about exactly what was booked — then the
  // picker closes.
  const addOptionToCart = (item: AyurvedaService, option: AyurvedaItemOption) => {
    addToCart({ id: option.id, title: `${item.title} — ${option.label}`, price: option.price })
    setExpandedItemId(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`spa-ayurveda-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'spa-ayurveda',
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
                  Spa Ayurveda
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <PromoBanner />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = AYURVEDA_SERVICES.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`spa-ayurveda-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <SpaLineItemRow
                            key={item.id}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))}
                            onViewDetails={() => setDetailItemId(item.id)}
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
          item={getAyurvedaItem(detailItemId)}
          cartCount={cartCountForItem(detailItemId)}
          onSelect={() => {
            const item = getAyurvedaItem(detailItemId)
            if (item.options) {
              setDetailItemId(null)
              setExpandedItemId(item.id)
            } else {
              addToCart(item)
            }
          }}
          onClose={() => setDetailItemId(null)}
        />
      )}

      {expandedItemId && (
        <OptionsModal
          item={getAyurvedaItem(expandedItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getAyurvedaItem(expandedItemId), option)}
          onClose={() => setExpandedItemId(null)}
        />
      )}
    </div>
  )
}
