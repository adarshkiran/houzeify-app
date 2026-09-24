// ─── Spa Prime — Women's Salon & Spa → Spa for Women → Prime ──────────────
//
// Built against a data table the user supplied directly for this exact
// page (20 services across 6 sections: Stress relief, Pain relief, Skin
// care scrubs, Post natal, Elderly care, Add-ons) — used as given where
// legible; where the user's own source had an illegible price/duration,
// this file authors a reasonable original figure in line with the rest
// of the app's economics (same modest 5-25% discount range as every
// other screen), never a wild or copied number. Ratings/review counts
// are lightly rounded to this app's own "4.8 (31K reviews)" format.
//
// Same shell/chrome/cart/options architecture as SpaLuxeScreen.tsx and
// SalonLuxeScreen.tsx (own file, own data model, own components) — the
// "Scrub" item's three variants reuse Salon Luxe's options-picker
// pattern (SpaPrimeItemOption + OptionsModal) rather than inventing a
// new one, and the Bestseller/Value Saver/Newly Launched badges reuse
// the same small gold-pill language as every other tier/bestseller tag
// in the app, just in three colours instead of one.

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
const IcoCheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.3L5.3 10L11.5 3.5" />
  </svg>
)
// Stress relief — a calm ripple/wave motif, distinct from the
// deep-pressure "hands" icon used for Pain relief.
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
const IcoGlow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="4" />
    <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6L4.2 4.2" />
  </svg>
)
// Post natal — a simple leaf, symbolising gentle renewal/care rather
// than any literal imagery.
const IcoLeaf = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16c-1-6 2-11 12-12 1 10-4 13-12 12Z" />
    <path d="M5 15c3-3 5-6 9-10" />
  </svg>
)
// Elderly care — a heart, standing in for gentle/attentive care.
const IcoHeartCare = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17S3 12.5 3 7.8A3.8 3.8 0 0110 5a3.8 3.8 0 017 2.8C17 12.5 10 17 10 17Z" />
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

// ─── Data model — six original service groups. `badge` covers the three
// callouts the source table uses (Bestseller / Value Saver / Newly
// Launched); `options`, only set on "Scrub", opens the same picker
// pattern as Salon Luxe's own multi-option items. ──────────────────────

interface SpaPrimeItemOption {
  id: string
  label: string
  price: number
  /** Not every option has a real discount — a plain duration/variant
   *  choice (e.g. "60 mins" vs "90 mins") just has its own price. */
  originalPrice?: number
  durationMin?: number
  /** Only set on options that are themselves a distinct bookable
   *  service with its own rating (e.g. Scrub's body-area choices) —
   *  a plain duration choice (60 mins / 90 mins) doesn't have one. */
  rating?: string
}
interface SpaPrimeItem {
  id: string
  title: string
  badge?: 'bestseller' | 'value-saver' | 'new'
  rating: string
  price: number
  originalPrice?: number
  durationMin: number
  bullets: string[]
  options?: SpaPrimeItemOption[]
}
interface SpaPrimeSection {
  id: string
  label: string
  icon: React.ReactNode
  items: SpaPrimeItem[]
}

const BADGE_STYLES: Record<NonNullable<SpaPrimeItem['badge']>, { bg: string; label: string }> = {
  bestseller: { bg: '#D4A017', label: '★ Bestseller' },
  'value-saver': { bg: '#2B6CB0', label: '✦ Value Saver' },
  new: { bg: '#722ED1', label: '✦ Newly Launched' },
}

const SPA_PRIME_SECTIONS: SpaPrimeSection[] = [
  {
    id: 'stress-relief',
    label: 'Stress relief',
    icon: <IcoWave />,
    items: [
      {
        id: 'spr-stress-swedish', title: 'Stress Relief Swedish Massage', badge: 'bestseller', rating: '4.81 (310K reviews)', price: 1319, durationMin: 60,
        bullets: ['A soothing full-body massage for total relaxation', 'Add a pack to save more'],
        options: [
          { id: 'spr-stress-swedish-60', label: '60 mins', price: 1319, durationMin: 60 },
          { id: 'spr-stress-swedish-90', label: '90 mins', price: 1629, durationMin: 90 },
        ],
      },
      { id: 'spr-quickcomfort', title: 'Quick Comfort Therapy', rating: '4.8 (20K reviews)', price: 999, originalPrice: 1249, durationMin: 45, bullets: ['Revitalising oil massage focused on key stress areas', 'Eases tension and restores energy'] },
      { id: 'spr-swedish-foot', title: 'Swedish with Foot Massage', badge: 'value-saver', rating: '4.8 (15K reviews)', price: 1769, originalPrice: 1999, durationMin: 80, bullets: ['60 min Swedish massage plus a 20 min foot massage', 'Save more with a pack'] },
      { id: 'spr-swedish-headshoulder', title: 'Swedish with Head & Shoulder Massage', rating: '4.8 (19K reviews)', price: 1769, durationMin: 80, bullets: ['60 min Swedish massage plus a 20 min head & shoulder massage'] },
      { id: 'spr-toptotoe', title: 'Top-to-Toe Stress Relief Massage', rating: '4.8 (63K reviews)', price: 1929, durationMin: 100, bullets: ['Customisable-pressure massage with scalp care & foot reflexology'] },
    ],
  },
  {
    id: 'pain-relief',
    label: 'Pain relief',
    icon: <IcoHands />,
    items: [
      {
        id: 'spr-deeptissue', title: 'Deep Tissue Massage', badge: 'bestseller', rating: '4.80 (231K reviews)', price: 1469, durationMin: 60,
        bullets: ['Supports post-workout relaxation', 'Add a pack to save more'],
        options: [
          { id: 'spr-deeptissue-60', label: '60 mins', price: 1469, durationMin: 60 },
          { id: 'spr-deeptissue-90', label: '90 mins', price: 1769, durationMin: 90 },
        ],
      },
      { id: 'spr-deeptissue-foot', title: 'Deep Tissue with Foot Massage', rating: '4.8 (14K reviews)', price: 1898, originalPrice: 2099, durationMin: 80, bullets: ['60 min deep tissue massage plus a 20 min foot massage', 'Save more with a pack'] },
      { id: 'spr-backrelief', title: 'Back Relief Massage', rating: '4.8 (12K reviews)', price: 899, originalPrice: 999, durationMin: 30, bullets: ['Focuses on lower back, spine & shoulder blades to ease tension', 'Helps ease stiffness and inflammation'] },
      { id: 'spr-legrelief', title: 'Leg Relief Massage', rating: '4.8 (18K reviews)', price: 899, originalPrice: 999, durationMin: 30, bullets: ['Focuses on thighs, calves and feet to alleviate soreness', 'Targets stiffness and discomfort'] },
    ],
  },
  {
    id: 'skin-care-scrubs',
    label: 'Skin care scrubs',
    icon: <IcoGlow />,
    items: [
      { id: 'spr-fullbody-scrub', title: 'Full Body Massage & Scrub', rating: '4.8 (58K reviews)', price: 1699, durationMin: 90, bullets: ['Removes dead skin and leaves skin soft, smooth & hydrated', 'Save more with a pack'] },
    ],
  },
  {
    id: 'post-natal',
    label: 'Post natal',
    icon: <IcoLeaf />,
    items: [
      { id: 'spr-postnatal', title: 'Post Natal Massage', rating: '4.8 (5K reviews)', price: 1369, durationMin: 60, bullets: ['Reduces water retention and eases muscle tension', 'Save more with a pack'] },
    ],
  },
  {
    id: 'elderly-care',
    label: 'Elderly care',
    icon: <IcoHeartCare />,
    items: [
      {
        id: 'spr-elderlycare', title: 'Elderly Care Massage', badge: 'new', rating: '4.86 (3K reviews)', price: 1399, durationMin: 60,
        bullets: ['Light-pressure full-body massage that eases senior aches', 'Helps ease muscle stress and promotes rest'],
        options: [
          { id: 'spr-elderlycare-60', label: '60 mins', price: 1399, durationMin: 60 },
          { id: 'spr-elderlycare-90', label: '90 mins', price: 1699, durationMin: 90 },
        ],
      },
    ],
  },
  {
    id: 'add-ons',
    label: 'Add-ons',
    icon: <IcoPlus />,
    items: [
      { id: 'spr-ad-foot', title: 'Foot Massage', rating: '4.8 (59K reviews)', price: 379, durationMin: 20, bullets: ['Uses micro-movements to target every pressure point', 'Targets stiffness and discomfort in the feet'] },
      { id: 'spr-ad-face', title: 'Face Massage', rating: '4.8 (40K reviews)', price: 379, durationMin: 20, bullets: ['Gentle massage with upward, outward circular motions', 'Reduces fine lines and puffiness for a refreshed look'] },
      { id: 'spr-ad-headshoulder', title: 'Head & Shoulder Massage', rating: '4.8 (47K reviews)', price: 379, durationMin: 20, bullets: ['Focused medium-pressure relief for head, neck & shoulders', 'Releases tension and nourishes the scalp'] },
      { id: 'spr-ad-head', title: 'Head Massage', rating: '4.8 (39K reviews)', price: 329, durationMin: 20, bullets: ['Calming massage to soothe the mind', 'Promotes healthier hair and scalp'] },
      {
        id: 'spr-ad-scrub', title: 'Scrub', rating: '4.86 (429 reviews)', price: 499, durationMin: 30,
        bullets: ['Targeted scrub to cleanse, smoothen and refresh the skin'],
        // Real body-area options/ratings/prices, replacing an earlier
        // guessed "flavour" set (Body Polish/Coffee/De-Tan) that didn't
        // match the reference.
        options: [
          { id: 'spr-ad-scrub-back', label: 'Back', price: 499, rating: '4.80 (268 reviews)' },
          { id: 'spr-ad-scrub-fulllegs', label: 'Full legs', price: 549, rating: '4.95 (82 reviews)' },
          { id: 'spr-ad-scrub-fullarms', label: 'Full arms', price: 499, rating: '4.94 (79 reviews)' },
        ],
      },
      { id: 'spr-ad-stretch', title: 'Stretch Therapy', rating: '4.9 (15K reviews)', price: 319, durationMin: 15, bullets: ['Full-body low-pressure stretch that eases tension', 'Boosts mobility and flexibility'] },
      { id: 'spr-ad-topup', title: 'Massage Top-Up (15 mins)', rating: '4.8 (21K reviews)', price: 129, durationMin: 15, bullets: ['Extend your relaxation with 15 extra minutes of massage'] },
      { id: 'spr-ad-hotbed', title: 'Hot Bed', rating: '4.8 (20K reviews)', price: 39, durationMin: 0, bullets: ['Ambient massage-table warmth for deeper relaxation', 'Helps ease stiffness before your session starts'] },
    ],
  },
]

// Original Houzeify copy for each section's CategoryBanner — same
// "small icon-on-gradient banner introduces the section" pattern as
// Salon Luxe/Spa Luxe.
const SPA_PRIME_SECTION_BANNERS: Record<string, { title: string; subtitle: string }> = {
  'stress-relief': { title: 'Unwind after a long day', subtitle: 'Relaxing full-body massages using classic techniques.' },
  'pain-relief': { title: 'Targeted relief, where you need it', subtitle: 'Focused massage therapies for everyday aches and stiffness.' },
  'skin-care-scrubs': { title: 'Smoother skin, from home', subtitle: 'A nourishing scrub paired with a relaxing massage.' },
  'post-natal': { title: 'Gentle care for new mothers', subtitle: 'A soothing massage designed for the post-pregnancy body.' },
  'elderly-care': { title: 'Comfort designed for seniors', subtitle: 'Light-pressure massage therapy for restful, gentle relief.' },
  'add-ons': { title: 'Make your session even better', subtitle: 'Extend, enhance, or add a finishing touch to any therapy.' },
}

const ALL_SPA_PRIME_ITEMS = SPA_PRIME_SECTIONS.flatMap(s => s.items)
function getSpaPrimeItem(id: string): SpaPrimeItem {
  const item = ALL_SPA_PRIME_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown spa prime item id: ${id}`)
  return item
}
/** This item's own section icon — the same visual every SpaLineItemRow
 *  already shows for it, reused on its options picker too. */
function getSpaPrimeItemIcon(id: string): React.ReactNode {
  return SPA_PRIME_SECTIONS.find(s => s.items.some(i => i.id === id))?.icon
}

interface Addable {
  id: string
  title: string
  price: number
  originalPrice?: number
  durationMin?: number
}

// ─── Chrome — same shell shape as Salon Luxe / Prime / Spa Luxe ───────

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Spa Prime</span>
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
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Spa Prime</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'spa-prime' })}
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

const JUMP_TARGETS: { id: string; label: string; icon: React.ReactNode }[] = SPA_PRIME_SECTIONS.map(s => ({ id: s.id, label: s.label, icon: s.icon }))

function ServiceTabs({ onJump }: { onJump: (id: string) => void }) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-[#E3DDD7] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[#9A949D] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {JUMP_TARGETS.map(s => (
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

// ─── Hero — no real spa photo exists in this project, so this uses the
// same warm-gradient + icon placeholder every other missing-photo
// surface in this app falls back to, not a fabricated or borrowed
// photo. Copy leans on the Prime tier's own positioning (trained
// professionals, affordable care) already established for Prime tiers
// elsewhere in HomeServicesScreen.tsx. ──────────────────────────────

function HeroBanner({ onExplore, onViewAddOns }: { onExplore: () => void; onViewAddOns: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Spa Prime</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Everyday relief,<br />thoughtfully delivered.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Affordable massage &amp; spa therapies from trained professionals, at home.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore therapies
          </button>
          <button
            onClick={onViewAddOns}
            className="h-10 px-5 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[13px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
            style={{ fontFamily: FONT_BODY }}
          >
            View add-ons
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[#722ED1] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoWave /></div>
      </div>
    </div>
  )
}

// ─── Category banner — 128×128px icon panel, same component/placement
// as Salon Luxe / Spa Luxe's own CategoryBanner. ───────────────────────

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

// ─── Card chrome — same "calm card" language as Salon Luxe/Spa Luxe:
// CARD_SURFACE row (128×128 icon panel + content + price/button). ─────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-white border-[#E3DDD7] text-[#722ED1] hover:bg-[#F3EAFF] hover:border-[#722ED1]'
const NEUTRAL_BTN_ADDED = 'bg-[#F3EAFF] border-[#722ED1] text-[#722ED1] hover:bg-[#F3EAFF]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

// Line item card — matches Salon Luxe/Spa Luxe's line-item row exactly.
// `badge` picks one of three small pills (see BADGE_STYLES); an item
// with `options` shows an "N options" hint instead of a plain price
// button and opens the shared OptionsModal, same as Salon Luxe.
function SpaLineItemRow({ item, icon, onSelect, cartCount, getCartCount }: {
  item: SpaPrimeItem
  icon: React.ReactNode
  onSelect: () => void
  cartCount: number
  getCartCount: (id: string) => number
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 mx-auto sm:mx-0">
        <div className="w-32 h-32 shrink-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]">
          {icon}
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
        <span className="text-[15px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        <span className="text-[12px] text-[#68636D] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.bullets.join(' • ')}</span>
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
            <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.options.length} options</span>
          )
        )}
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
            {item.originalPrice && <span className="line-through text-[#9A949D]">₹{item.originalPrice}</span>} <span className="font-semibold text-[#242326]">₹{item.price}</span>
          </div>
          {item.durationMin > 0 && (
            <div className="text-[11px] font-semibold text-[#722ED1] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
          )}
        </div>
        <button onClick={onSelect} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : item.options ? 'Select' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── Options picker modal — opened from "Scrub", the one item on this
// page with more than one way to book it. Same calm card language as
// the rest of this file, not a separate visual system — same component
// Salon Luxe uses for its own Waxing/Threading options. ────────────────

function OptionsModal({ item, icon, cartCountForOption, onAddOption, onClose }: {
  item: SpaPrimeItem
  icon: React.ReactNode
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: SpaPrimeItemOption) => void
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
                  {icon}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[13.5px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{opt.label}</span>
                  {opt.rating && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {opt.rating}</span>
                  )}
                  <span className="text-[13px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
                    {opt.originalPrice && <span className="line-through text-[#9A949D]">₹{opt.originalPrice}</span>} <span className="font-semibold text-[#242326]">₹{opt.price}</span>
                  </span>
                  {opt.durationMin && (
                    <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(opt.durationMin)}</span>
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

// ─── Main Screen ────────────────────────────────────────────────────────

export default function SpaPrimeScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'spa-prime',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.originalPrice ?? entry.price,
      duration: entry.durationMin ? formatDuration(entry.durationMin) : undefined,
    })
  }

  // A selected option becomes its own cart line — titled "Item — Option"
  // so the cart stays legible about exactly what was booked — then the
  // picker closes, same as Salon Luxe.
  const addOptionToCart = (item: SpaPrimeItem, option: SpaPrimeItemOption) => {
    addToCart({ id: option.id, title: `${item.title} — ${option.label}`, price: option.price, originalPrice: option.originalPrice, durationMin: option.durationMin })
    setExpandedItemId(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`spa-prime-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'spa-prime',
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

              {/* Page context — same eyebrow + title treatment as
                  Salon Luxe/Prime/Spa Luxe. */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Women's Salon &amp; Spa</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Spa Prime
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('stress-relief')} onViewAddOns={() => jumpToSection('add-ons')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SPA_PRIME_SECTIONS.map(section => (
                    <div key={section.id} id={`spa-prime-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                      <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                      <CategoryBanner icon={section.icon} title={SPA_PRIME_SECTION_BANNERS[section.id].title} subtitle={SPA_PRIME_SECTION_BANNERS[section.id].subtitle} />
                      {section.items.map(item => (
                        <SpaLineItemRow
                          key={item.id}
                          item={item}
                          icon={section.icon}
                          cartCount={cartCountForItem(item.id)}
                          getCartCount={cartCountForItem}
                          onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Right column — pinned on desktop, same as Salon Luxe/Prime/Spa Luxe */}
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

      {expandedItemId && (
        <OptionsModal
          item={getSpaPrimeItem(expandedItemId)}
          icon={getSpaPrimeItemIcon(expandedItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getSpaPrimeItem(expandedItemId), option)}
          onClose={() => setExpandedItemId(null)}
        />
      )}
    </div>
  )
}
