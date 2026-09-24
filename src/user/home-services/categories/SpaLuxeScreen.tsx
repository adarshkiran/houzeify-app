// ─── Spa Luxe — Women's Salon & Spa → Spa for Women → Luxe ────────────────
//
// Built against a full-page reference capture the user supplied (a real
// spa/massage marketplace listing) — used only for its information
// architecture and page rhythm (sidebar categories, a hero, four
// sections — Pain relief / Signature therapy / Natural skincare /
// Add-ons — a persistent trust/cart card on the right). The reference's
// own per-item large photo-banner card treatment was tried here first,
// then dropped in favour of the SAME line-item card language as
// SalonLuxeScreen.tsx (CARD_SURFACE row, icon panel + content +
// price/button) — this house's visual system takes priority over
// matching the reference card-for-card once the two disagree. Every
// piece of CONTENT below is original Houzeify copy: no competitor name,
// logo, exact sentence, exact rating, or exact price was carried over.
//
// Same shell/chrome/cart architecture as SalonLuxeScreen.tsx and
// PrimeScreen.tsx (own file, own data model, own components) — nothing
// shared is duplicated logic, just the same established visual language.
//
// Honesty/data-integrity notes:
//   - No new photographic assets were created — this environment has no
//     image-generation capability. Every image slot (hero watermark,
//     line-item icon panels) uses this app's own icon-on-gradient
//     placeholder pattern instead of a fabricated or borrowed photo.
//   - Every price/rating/review-count/duration below is originally
//     authored demo data (this app's established convention), not a
//     copy of the reference's own figures.
//   - Bullet copy is paraphrased in Houzeify's own words, never a
//     verbatim copy of the reference's sentences.

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
const IcoHands = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11V5.5a1.5 1.5 0 013 0V10" />
    <path d="M7 10V4a1.5 1.5 0 013 0v6.5" />
    <path d="M10 10.2V5a1.5 1.5 0 013 0v6" />
    <path d="M13 11V7.5a1.5 1.5 0 013 0V13c0 3-2 5.5-5 5.5H8c-1.5 0-2.7-.7-3.6-1.8L2 13.5" />
  </svg>
)
const IcoDroplet = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5S4.5 9 4.5 12.5a5.5 5.5 0 0011 0C15.5 9 10 2.5 10 2.5Z" />
  </svg>
)
const IcoGlow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="4" />
    <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6L4.2 4.2" />
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

// ─── Data model — four original service groups, all originally-authored
// demo pricing/rating/duration and paraphrased benefit copy (see header
// comment). ──────────────────────────────────────────────────────────

interface SpaLuxeItem {
  id: string
  title: string
  bestseller?: boolean
  rating: string
  price: number
  originalPrice?: number
  durationMin: number
  bullets: string[]
}
interface SpaLuxeSection {
  id: string
  label: string
  icon: React.ReactNode
  items: SpaLuxeItem[]
}

const SPA_LUXE_SECTIONS: SpaLuxeSection[] = [
  {
    id: 'pain-relief',
    label: 'Pain relief',
    icon: <IcoHands />,
    items: [
      { id: 'spa-pr-swedish', title: 'Sublime Swedish Massage', bestseller: true, rating: '4.8 (2.1K reviews)', price: 999, originalPrice: 1299, durationMin: 60, bullets: ['Eases muscle tightness and everyday tension', 'Add a pack of 4 to unlock extra savings'] },
      { id: 'spa-pr-swedish-head', title: 'Sublime Swedish with Head Massage', rating: '4.8 (410 reviews)', price: 1599, originalPrice: 1699, durationMin: 80, bullets: ['60 min Swedish massage plus a 20 min head massage', 'Add a pack of 4 to save more per session'] },
      { id: 'spa-pr-deeptissue', title: 'Deep Tissue Healing Therapy', bestseller: true, rating: '4.9 (3.4K reviews)', price: 1299, originalPrice: 1549, durationMin: 60, bullets: ['Eases discomfort from everyday muscle soreness'] },
      { id: 'spa-pr-deeptissue-foot', title: 'Deep Tissue with Foot Reflexology', rating: '4.8 (290 reviews)', price: 1799, originalPrice: 1899, durationMin: 80, bullets: ['60 min deep tissue massage plus 20 min foot reflexology', 'Add a pack of 4 to save more per session'] },
    ],
  },
  {
    id: 'signature-therapy',
    label: 'Signature therapy',
    icon: <IcoDroplet />,
    items: [
      { id: 'spa-sig-aroma', title: 'Holistic Aromatherapy', rating: '4.8 (680 reviews)', price: 1199, originalPrice: 1449, durationMin: 60, bullets: ['Eases tension and supports gentle lymphatic flow', 'Add a pack of 4 for a better rate'] },
      { id: 'spa-sig-nirvana', title: 'Nirvana Therapy', rating: '4.9 (1.5K reviews)', price: 1599, durationMin: 90, bullets: ['Eases lower back and shoulder stiffness', 'Helps even out skin tone over time'] },
      { id: 'spa-sig-balinese', title: 'Balinese Therapy', rating: '4.8 (450 reviews)', price: 1199, durationMin: 60, bullets: ['Warms muscles and eases tension for deep relaxation'] },
      { id: 'spa-sig-abhyanga', title: 'Abhyanga Therapy', rating: '4.8 (310 reviews)', price: 1349, durationMin: 60, bullets: ['Ayurvedic technique that supports restful sleep and everyday vitality'] },
    ],
  },
  {
    id: 'natural-skincare',
    label: 'Natural skincare',
    icon: <IcoGlow />,
    items: [
      { id: 'spa-sk-scrub', title: 'Exfoliating Scrub & Massage', rating: '4.8 (420 reviews)', price: 1599, originalPrice: 1899, durationMin: 90, bullets: ['Removes dead skin cells for softer, more hydrated skin', 'Add a pack of 4 to save on every session'] },
    ],
  },
  {
    id: 'add-ons',
    label: 'Add-ons',
    icon: <IcoPlus />,
    items: [
      { id: 'spa-ad-footreflex', title: 'Foot Reflexology', rating: '4.8 (2K reviews)', price: 449, durationMin: 20, bullets: ['A pressure-point massage that helps the body unwind', 'May also help with mild sleep trouble and tension headaches'] },
      { id: 'spa-ad-headshoulder', title: 'Head & Shoulder Massage', rating: '4.8 (1.1K reviews)', price: 449, durationMin: 20, bullets: ['A gentle massage to ease tension and soothe the body'] },
      { id: 'spa-ad-face', title: 'Face Massage', rating: '4.8 (890 reviews)', price: 449, durationMin: 20, bullets: ['Helps improve skin health with gentle, nourishing strokes'] },
      { id: 'spa-ad-head', title: 'Head Massage', rating: '4.9 (1K reviews)', price: 379, durationMin: 20, bullets: ['Gentle massage to ease tension in the scalp and neck'] },
      { id: 'spa-ad-stretch', title: 'Stretch Therapy', rating: '4.9 (410 reviews)', price: 369, durationMin: 15, bullets: ['A full-body, low-pressure stretch to boost mobility'] },
      { id: 'spa-ad-topup', title: 'Massage Top-Up (15 mins)', rating: '4.9 (520 reviews)', price: 149, durationMin: 15, bullets: ['Extend your relaxation with 15 extra minutes of massage'] },
      { id: 'spa-ad-warmbed', title: 'Warm Bed', rating: '4.8 (610 reviews)', price: 49, durationMin: 0, bullets: ['A gently warmed table for added comfort', 'Helps you settle in and unwind faster'] },
    ],
  },
]

// Original Houzeify copy for each section's CategoryBanner — same
// "small icon-on-gradient banner introduces the section" pattern as
// Salon Luxe's Waxing/Mani-Pedi/Japanese Rituals banners.
const SPA_LUXE_SECTION_BANNERS: Record<string, { title: string; subtitle: string }> = {
  'pain-relief': { title: 'Ease everyday tension', subtitle: 'Deep-pressure massage therapies, delivered at home.' },
  'signature-therapy': { title: 'Curated therapies, tailored to you', subtitle: 'Aromatherapy, Balinese & Ayurvedic techniques from trained therapists.' },
  'natural-skincare': { title: 'Reveal softer, radiant skin', subtitle: 'Gentle exfoliation paired with a nourishing massage.' },
  'add-ons': { title: 'Make your session even better', subtitle: 'Extend, enhance, or add a finishing touch to any therapy.' },
}

const ALL_SPA_LUXE_ITEMS = SPA_LUXE_SECTIONS.flatMap(s => s.items)
function getSpaLuxeItem(id: string): SpaLuxeItem {
  const item = ALL_SPA_LUXE_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown spa luxe item id: ${id}`)
  return item
}

interface Addable {
  id: string
  title: string
  price: number
  originalPrice?: number
  durationMin: number
}

// ─── Chrome — same shell shape as Salon Luxe / Prime ───────────────────

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Spa Luxe</span>
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
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Spa Luxe</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'spa-luxe' })}
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

const JUMP_TARGETS: { id: string; label: string; icon: React.ReactNode }[] = SPA_LUXE_SECTIONS.map(s => ({ id: s.id, label: s.label, icon: s.icon }))

function ServiceTabs({ onJump }: { onJump: (id: string) => void }) {
  return (
    <div className="bg-[var(--hz-surface)]/70 backdrop-blur-md border border-[var(--hz-border)] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {JUMP_TARGETS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0 shrink-0 w-[76px]"
          >
            <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[var(--hz-border)] flex items-center justify-center bg-[#F9F5FF] text-[var(--hz-primary)] shrink-0">
              {s.icon}
            </div>
            <span className="text-[12px] text-[var(--hz-ink)] text-center leading-tight" style={{ fontFamily: FONT_BODY }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Hero — no real spa photo exists in this project, so this uses the
// same warm-gradient + icon placeholder every other missing-photo
// surface in this app falls back to, not a fabricated or borrowed
// photo. ─────────────────────────────────────────────────────────────

function HeroBanner({ onExplore, onViewAddOns }: { onExplore: () => void; onViewAddOns: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Spa Luxe</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Deep relaxation,<br />expertly delivered.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Premium massage &amp; spa therapies, in the comfort of your home.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore therapies
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
        <div style={{ transform: 'scale(3.2)' }}><IcoHands /></div>
      </div>
    </div>
  )
}

// ─── Category banner — sits directly under a section's title, above its
// cards, same component/placement as SalonLuxeScreen.tsx's own
// CategoryBanner (icon-on-gradient, no fabricated photo). One per
// section here, reusing each section's own icon so the banner and the
// "Select a service" chip agree. Icon panel is 128×128px on desktop
// (96px on mobile), matching the size fixed on Salon Luxe's banner. ───

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

// ─── Card chrome — same "calm card" language as SalonLuxeScreen.tsx:
// CARD_SURFACE row (icon panel + content + price/button), never a loud
// full-bleed banner card. ────────────────────────────────────────────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, var(--hz-surface) 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-[var(--hz-surface)] border-[var(--hz-border)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)]'
const NEUTRAL_BTN_ADDED = 'bg-[var(--hz-primary-soft)] border-[var(--hz-primary)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

// Line item card — matches SalonLuxeScreen.tsx's LineItemRow exactly
// (icon panel left, content middle, price/duration/button right), so
// every section on this page reads as the same house card, not a
// one-off. The "Bestseller" callout reuses the same gold pill already
// used for HozieHelp Gold / Salon Luxe / Spa tier rows elsewhere in the
// app (HomeServicesScreen.tsx), rather than inventing a new badge.
function SpaLineItemRow({ item, icon, onSelect, cartCount }: {
  item: SpaLuxeItem
  icon: React.ReactNode
  onSelect: () => void
  cartCount: number
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 mx-auto sm:mx-0">
        <div className="w-32 h-32 shrink-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[var(--hz-primary)]">
          {icon}
        </div>
        {item.bestseller && (
          <span
            className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}
          >
            ★ Bestseller
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        <span className="text-[12px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.bullets.join(' • ')}</span>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
            {item.originalPrice && <span className="line-through text-[var(--hz-ink-subtle)]">₹{item.originalPrice}</span>} <span className="font-semibold text-[var(--hz-ink)]">₹{item.price}</span>
          </div>
          {item.durationMin > 0 && (
            <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
          )}
        </div>
        <button onClick={onSelect} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : 'Add'}
        </button>
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
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>• {c.duration}</span>
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

export default function SpaLuxeScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'spa-luxe',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.originalPrice ?? entry.price,
      duration: entry.durationMin !== undefined ? formatDuration(entry.durationMin) : undefined,
    })
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`spa-luxe-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'spa-luxe',
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

              {/* Page context — same eyebrow + title treatment as
                  Salon Luxe/Prime. */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Women's Salon &amp; Spa</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Spa Luxe
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('pain-relief')} onViewAddOns={() => jumpToSection('add-ons')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SPA_LUXE_SECTIONS.map(section => (
                    <div key={section.id} id={`spa-luxe-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                      <CategoryBanner icon={section.icon} title={SPA_LUXE_SECTION_BANNERS[section.id].title} subtitle={SPA_LUXE_SECTION_BANNERS[section.id].subtitle} />
                      {section.items.map(item => (
                        <SpaLineItemRow
                          key={item.id}
                          item={item}
                          icon={section.icon}
                          cartCount={cartCountForItem(item.id)}
                          onSelect={() => addToCart(item)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Right column — pinned on desktop, same as Salon Luxe/Prime */}
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
    </div>
  )
}
