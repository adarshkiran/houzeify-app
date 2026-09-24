// ─── Essential Home Repairs → Civil Work ────────────────────────────────
//
// Same house system as every sibling service-detail screen (Plumbing,
// Electrician, Carpentry): sticky/glass "Select a service" nav,
// CategoryBanner + icon panels, CARD_SURFACE line-item rows, right-column
// Houzeify Promise/Cart/Ask Hozie shell, the one shared Customer cart
// (useCustomerCart) — never a second cart or a second catalogue.
//
// UI demonstration data only — there is no backend yet. Every price below
// is a suggested REFERENCE value for the frontend prototype (never claimed
// as a live/verified/supplier price), computed as rate × quantity for the
// hourly and sq.ft services — same "starts at" honesty convention as
// Plumbing's own reference prices. Ratings are the same reference-data
// convention every sibling category already uses, never claimed as live.
//
// Pricing models: HOURLY and SQ_FT services offer a real, pre-computed
// price tier per selectable quantity (chips on the card, matching this
// brief's own mockup) — the same "each option is its own flatly-priced
// choice" shape Plumbing's own PlumbingItemOption already uses, just
// labelled by quantity instead of by named variant, so no new pricing
// engine is introduced. PER_JOB services show a flat "From ₹X / job"
// starting price — the exact scope is captured after Add/at booking, same
// as every other per-job item in this app. SITE_ASSESSMENT services never
// show a fabricated fixed price — "Assessment required" only.
//
// Every hourly/sq.ft item also carries a real "beyond the standard range"
// tier (8+ hrs / 1000+ sq.ft) that never gets a fabricated price either —
// selecting it switches the card to "Request Assessment", same honest
// pattern as the dedicated Structural Assessment service.
//
// HOURLY_RATE sourcing: the two hourly rates below (₹113/hr, ₹188/hr) are
// derived from real, cited Indian construction daily-wage references
// (nirmansetu.in/construction-wages-india, aecord.com/blog/labour-rates-
// for-house-construction-india-2026) — a single Mason/Raj Mistri's real
// ₹700–1,100/day skilled rate (midpoint ~₹900/day) and a real Mason +
// Unskilled Helper couple team's ₹1,200–1,800/day+₹450–750/day combined
// rate (midpoint ~₹1,500/day), each divided by a standard 8-hour workday
// — never an invented number. Finishing-only jobs (wall repair, cracks)
// use the single-Mason rate; jobs that realistically need a two-person
// team (masonry/construction, general repair) use the Mason+Helper rate.
//
// SQFT/PER_JOB_RATE derivation: unlike the hourly rates above, the sq.ft
// and per-job prices below are NOT fully sourced. Each still starts from
// the same real, cited team day-rate (Mason+Helper ~₹1,500/day, Mason
// alone ~₹900/day, or Tile & Marble Fitter ~₹950/day alone / ~₹1,550/day
// with a helper — all from the same cited wage references above), but
// then divides that day-rate by an assumed sq.ft-per-day productivity
// figure (sq.ft items) or multiplies it by an assumed job-duration in
// days (per-job items) — neither productivity nor duration has a cited
// source, so treat these as the assistant's own reasonable estimates,
// not verified data, same "reference value" honesty this file already
// applies to ratings and prices generally.

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
const IcoShield = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="var(--hz-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3.5l8 3v5.5c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5V6.5l8-3Z" />
    <path d="M9.5 13l2.5 2.5 5-5" />
  </svg>
)
const IcoStar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor"><path d="M6 0.8l1.5 3.3 3.6.4-2.7 2.5.7 3.6L6 8.8 2.9 10.6l.7-3.6L.9 4.5l3.6-.4L6 .8Z" /></svg>
)
// Section-nav & item icons — one shared icon per section, same convention
// every sibling screen uses (Plumbing's own IcoTapMixer etc. cover several
// line items each, never one bespoke icon per item).
const IcoWallRepair = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="14" rx="1" />
    <path d="M3 8h14M3 13h14M8.5 3v5M13.5 8v5M6 13v4M14 13v4" />
    <path d="M9 5.5l1.5 2-1 1.5 1.5 1.5" />
  </svg>
)
const IcoMasonry = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="3" width="6" height="4" /><rect x="9" y="3" width="6.5" height="4" />
    <rect x="2.5" y="7.5" width="6" height="4" /><rect x="9" y="7.5" width="6.5" height="4" />
    <rect x="2.5" y="12" width="6" height="4" /><rect x="9" y="12" width="6.5" height="4" />
  </svg>
)
const IcoTiling = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="6.2" height="6.2" /><rect x="11.3" y="2.5" width="6.2" height="6.2" />
    <rect x="2.5" y="11.3" width="6.2" height="6.2" /><rect x="11.3" y="11.3" width="6.2" height="6.2" />
  </svg>
)
const IcoWaterproofing = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5s5 5.6 5 9.3a5 5 0 01-10 0c0-3.7 5-9.3 5-9.3z" />
  </svg>
)
const IcoBathroomKitchen = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9h14v3a4 4 0 01-4 4H7a4 4 0 01-4-4V9z" />
    <path d="M5 9V5.5A2.5 2.5 0 017.5 3v0" />
    <path d="M7 16v1.5M13 16v1.5" />
  </svg>
)
const IcoGeneralRepairs = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.5l4.5 4.5-8 8H4.5v-4l7.5-7.5z" />
    <path d="M10 5.5l4.5 4.5" />
  </svg>
)
const IcoAssessment = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="6.5" />
    <path d="M9 5.5v4l2.5 1.5" />
    <path d="M15.5 15.5l2.5 2.5" />
  </svg>
)
const IcoConsultation = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 4.5A1.5 1.5 0 014 3h12a1.5 1.5 0 011.5 1.5v7A1.5 1.5 0 0116 13H7l-3 3v-3H4a1.5 1.5 0 01-1.5-1.5v-7z" />
  </svg>
)

// ─── Data model — pricing kept minimal and additive: every hourly/sq.ft
// item's `tiers` are pre-computed flat prices (rate × quantity), the same
// shape as PlumbingItemOption (id/label/price), just labelled by quantity.
// No live calculation engine, no new cart schema. ──────────────────────

type CivilWorkSection = 'wall-surface-repair' | 'masonry-construction' | 'flooring-tiling' | 'waterproofing-protection' | 'bathroom-kitchen-civil' | 'general-civil-repairs'
type PricingModel = 'hourly' | 'sqft' | 'per-job' | 'site-assessment'

interface CivilWorkTier {
  id: string
  label: string
  price: number
}

interface CivilWorkItem {
  id: string
  title: string
  section: CivilWorkSection
  description: string
  rating?: string
  pricingModel: PricingModel
  /** e.g. "₹113/hr" or "₹18/sq.ft" — shown only for hourly/sqft items. */
  unitRateLabel?: string
  /** e.g. "Minimum 3 hrs" or "Minimum 50 sq.ft". */
  minLabel?: string
  tiers?: CivilWorkTier[]
  /** The honest "beyond the standard range" tier — e.g. "8+ hrs" or
   *  "1000+ sq.ft" — never priced, always routes to "Request Assessment". */
  assessmentTierLabel?: string
  /** PER_JOB flat starting price. */
  flatPrice?: number
  /** Shown under a PER_JOB or SITE_ASSESSMENT card — e.g. "Site assessment
   *  may be required" — never implies automatic safety or availability. */
  noteLabel?: string
  icon: React.ReactNode
}

function hourlyTiers(ratePerHour: number): CivilWorkTier[] {
  return [3, 4, 5, 6, 7, 8].map(h => ({ id: `${h}hrs`, label: `${h} hrs`, price: ratePerHour * h }))
}
function sqftTiers(ratePerSqft: number, areas: number[]): CivilWorkTier[] {
  return areas.map(a => ({ id: `${a}sqft`, label: `${a} sq.ft`, price: Math.round(ratePerSqft * a) }))
}

const CIVIL_WORK_ITEMS: CivilWorkItem[] = [
  // ── Wall & Surface Repair ──
  {
    id: 'civ-wall-repair-patchwork', title: 'Wall Repair & Patchwork', section: 'wall-surface-repair',
    description: 'Repair cracks, holes and damaged wall surfaces with professional finishing.',
    rating: '4.8 (reference)', pricingModel: 'hourly', unitRateLabel: '₹113/hr', minLabel: 'Minimum 3 hrs',
    tiers: hourlyTiers(113), assessmentTierLabel: '8+ hrs', icon: <IcoWallRepair />,
  },
  {
    id: 'civ-crack-repair', title: 'Crack Repair', section: 'wall-surface-repair',
    description: 'Repair common wall cracks and prepare surfaces for finishing.',
    rating: '4.7 (reference)', pricingModel: 'hourly', unitRateLabel: '₹113/hr', minLabel: 'Minimum 3 hrs',
    tiers: hourlyTiers(113), assessmentTierLabel: '8+ hrs', icon: <IcoWallRepair />,
  },
  {
    id: 'civ-plastering', title: 'Plastering & Re-plastering', section: 'wall-surface-repair',
    description: 'Restore uneven, damaged or worn wall plaster.',
    rating: '4.7 (reference)', pricingModel: 'sqft', unitRateLabel: '₹13/sq.ft', minLabel: 'Minimum 50 sq.ft',
    tiers: sqftTiers(13, [50, 100, 250, 500]), assessmentTierLabel: '1000+ sq.ft', icon: <IcoWallRepair />,
  },

  // ── Masonry & Construction ──
  {
    id: 'civ-brick-block-work', title: 'Brick / Block Work', section: 'masonry-construction',
    description: 'Brick and block masonry for walls, partitions and small construction work.',
    rating: '4.8 (reference)', pricingModel: 'sqft', unitRateLabel: '₹15/sq.ft', minLabel: 'Minimum 25 sq.ft',
    tiers: sqftTiers(15, [25, 50, 100, 250, 500]), assessmentTierLabel: '1000+ sq.ft', icon: <IcoMasonry />,
  },
  {
    id: 'civ-minor-construction', title: 'Minor Civil Construction', section: 'masonry-construction',
    description: 'Small masonry and construction jobs around your home.',
    rating: '4.7 (reference)', pricingModel: 'hourly', unitRateLabel: '₹188/hr', minLabel: 'Minimum 3 hrs',
    tiers: hourlyTiers(188), assessmentTierLabel: '8+ hrs', icon: <IcoMasonry />,
  },
  {
    id: 'civ-door-window-opening', title: 'Door / Window Opening Modifications', section: 'masonry-construction',
    description: 'Modify or prepare wall openings for doors and windows.',
    rating: '4.6 (reference)', pricingModel: 'per-job', flatPrice: 1499,
    noteLabel: 'Site assessment may be required', icon: <IcoMasonry />,
  },

  // ── Flooring & Tiling ──
  {
    id: 'civ-floor-tile-install', title: 'Floor Tile Installation', section: 'flooring-tiling',
    description: 'Professional floor tile installation with proper alignment and finishing.',
    rating: '4.7 (reference)', pricingModel: 'sqft', unitRateLabel: '₹19/sq.ft', minLabel: 'Minimum 50 sq.ft',
    tiers: sqftTiers(19, [50, 100, 250, 500]), assessmentTierLabel: '1000+ sq.ft', icon: <IcoTiling />,
  },
  {
    id: 'civ-tile-replacement-repair', title: 'Tile Replacement & Repair', section: 'flooring-tiling',
    description: 'Replace broken or damaged tiles without disturbing the surrounding area.',
    rating: '4.8 (reference)', pricingModel: 'per-job', flatPrice: 799, icon: <IcoTiling />,
  },
  {
    id: 'civ-tile-grouting', title: 'Tile Grouting / Re-grouting', section: 'flooring-tiling',
    description: 'Refresh worn or damaged tile joints for a cleaner finish.',
    rating: '4.7 (reference)', pricingModel: 'sqft', unitRateLabel: '₹4/sq.ft', minLabel: 'Minimum 50 sq.ft',
    tiers: sqftTiers(4, [50, 100, 250, 500]), assessmentTierLabel: '1000+ sq.ft', icon: <IcoTiling />,
  },
  {
    id: 'civ-floor-levelling', title: 'Floor Levelling', section: 'flooring-tiling',
    description: 'Prepare uneven floors before flooring or tile installation.',
    rating: '4.6 (reference)', pricingModel: 'sqft', unitRateLabel: '₹10/sq.ft', minLabel: 'Minimum 50 sq.ft',
    tiers: sqftTiers(10, [50, 100, 250, 500]), assessmentTierLabel: '1000+ sq.ft', icon: <IcoTiling />,
  },

  // ── Waterproofing & Protection ──
  {
    id: 'civ-bathroom-waterproofing', title: 'Bathroom Waterproofing Repair', section: 'waterproofing-protection',
    description: 'Repair common bathroom seepage and waterproofing problems.',
    rating: '4.7 (reference)', pricingModel: 'sqft', unitRateLabel: '₹25/sq.ft', minLabel: 'Minimum 50 sq.ft',
    tiers: sqftTiers(25, [50, 100, 250, 500]), assessmentTierLabel: '1000+ sq.ft', icon: <IcoWaterproofing />,
  },
  {
    id: 'civ-kitchen-waterproofing', title: 'Kitchen Waterproofing Repair', section: 'waterproofing-protection',
    description: 'Repair common kitchen seepage and waterproofing problems.',
    rating: '4.6 (reference)', pricingModel: 'sqft', unitRateLabel: '₹25/sq.ft', minLabel: 'Minimum 50 sq.ft',
    tiers: sqftTiers(25, [50, 100, 250, 500]), assessmentTierLabel: '1000+ sq.ft', icon: <IcoWaterproofing />,
  },
  {
    id: 'civ-terrace-balcony-waterproofing', title: 'Terrace / Balcony Waterproofing Repair', section: 'waterproofing-protection',
    description: 'Repair common terrace and balcony seepage and waterproofing problems.',
    rating: '4.7 (reference)', pricingModel: 'sqft', unitRateLabel: '₹15/sq.ft', minLabel: 'Minimum 100 sq.ft',
    tiers: sqftTiers(15, [100, 250, 500]), assessmentTierLabel: '1000+ sq.ft', icon: <IcoWaterproofing />,
  },
  {
    id: 'civ-dampness-seepage', title: 'Dampness & Seepage Repair', section: 'waterproofing-protection',
    description: 'Repair common dampness and seepage problems around your home.',
    rating: '4.6 (reference)', pricingModel: 'per-job', flatPrice: 1099,
    noteLabel: 'Inspection may be required', icon: <IcoWaterproofing />,
  },

  // ── Bathroom & Kitchen Civil Work ──
  {
    id: 'civ-bathroom-civil-mods', title: 'Bathroom Civil Modifications', section: 'bathroom-kitchen-civil',
    description: 'Small masonry, wall and floor modifications for bathroom upgrades.',
    rating: '4.8 (reference)', pricingModel: 'per-job', flatPrice: 1499, icon: <IcoBathroomKitchen />,
  },
  {
    id: 'civ-kitchen-civil-mods', title: 'Kitchen Civil Modifications', section: 'bathroom-kitchen-civil',
    description: 'Small civil modifications for kitchen upgrades and remodeling.',
    rating: '4.7 (reference)', pricingModel: 'per-job', flatPrice: 1499, icon: <IcoBathroomKitchen />,
  },
  {
    id: 'civ-countertop-platform', title: 'Countertop / Platform Civil Work', section: 'bathroom-kitchen-civil',
    description: 'Build or modify kitchen platforms and countertop support areas.',
    rating: '4.7 (reference)', pricingModel: 'sqft', unitRateLabel: '₹75/sq.ft', minLabel: 'Minimum 10 sq.ft',
    tiers: sqftTiers(75, [10, 25, 50, 100]), assessmentTierLabel: '100+ sq.ft', icon: <IcoBathroomKitchen />,
  },
  {
    id: 'civ-sink-fixture-opening', title: 'Sink / Fixture Opening Modifications', section: 'bathroom-kitchen-civil',
    description: 'Create or modify openings for sinks and home fixtures.',
    rating: '4.6 (reference)', pricingModel: 'per-job', flatPrice: 749, icon: <IcoBathroomKitchen />,
  },

  // ── General Civil Repairs ──
  {
    id: 'civ-non-structural-repair', title: 'Non-Structural Repair Work', section: 'general-civil-repairs',
    description: 'General non-structural repair work around your home.',
    rating: '4.6 (reference)', pricingModel: 'hourly', unitRateLabel: '₹188/hr', minLabel: 'Minimum 3 hrs',
    tiers: hourlyTiers(188), assessmentTierLabel: '8+ hrs', icon: <IcoGeneralRepairs />,
  },
  {
    id: 'civ-concrete-rcc-repair', title: 'Concrete / RCC Repair', section: 'general-civil-repairs',
    description: 'Repair damaged concrete surfaces and minor non-structural concrete areas.',
    rating: '4.6 (reference)', pricingModel: 'per-job', flatPrice: 1499,
    noteLabel: 'Site assessment may be required', icon: <IcoGeneralRepairs />,
  },
  {
    id: 'civ-structural-assessment', title: 'Structural Assessment / Repair', section: 'general-civil-repairs',
    description: 'For structural concerns, a qualified professional assessment may be required.',
    pricingModel: 'site-assessment', icon: <IcoAssessment />,
  },
]

const SECTIONS: { id: CivilWorkSection; label: string; subtitle: string; icon: React.ReactNode }[] = [
  { id: 'wall-surface-repair', label: 'Wall & Surface Repair', subtitle: 'Fix damaged walls, cracks and surface problems.', icon: <IcoWallRepair /> },
  { id: 'masonry-construction', label: 'Masonry & Construction', subtitle: 'Brick, block and small civil construction work.', icon: <IcoMasonry /> },
  { id: 'flooring-tiling', label: 'Flooring & Tiling', subtitle: 'Install, repair and refresh your floors and tiles.', icon: <IcoTiling /> },
  { id: 'waterproofing-protection', label: 'Waterproofing & Protection', subtitle: 'Repair common seepage, dampness and waterproofing problems.', icon: <IcoWaterproofing /> },
  { id: 'bathroom-kitchen-civil', label: 'Bathroom & Kitchen Civil Work', subtitle: 'Small masonry and civil modifications for everyday upgrades.', icon: <IcoBathroomKitchen /> },
  { id: 'general-civil-repairs', label: 'General Civil Repairs', subtitle: 'Professional help for larger repair and modification work.', icon: <IcoGeneralRepairs /> },
]

// ─── Shell — mobile top bar, desktop header, jump chips ─────────────────

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Civil Work</span>
      </div>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBell /></button>
    </div>
  )
}

function TopHeader({ onNavigate }: { onNavigate: (s: string, data?: Record<string, string>) => void }) {
  const { itemCount } = useCustomerCart()
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('home-services')} aria-label="Back to Services" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"><IcoBack /></button>
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Civil Work</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'civil-work' })}
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

function ServiceTabs({ onJump }: { onJump: (id: string) => void }) {
  return (
    <div className="bg-[var(--hz-surface)]/70 backdrop-blur-md border border-[var(--hz-border)] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0 shrink-0 w-[92px]"
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

function HeroBanner({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, var(--hz-primary-wash) 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Essential Home Repairs</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Civil Work
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Repairs, finishing &amp; small construction work by verified professionals.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
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
        <div style={{ transform: 'scale(3.2)' }}><IcoMasonry /></div>
      </div>
    </div>
  )
}

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

// ─── Card chrome — same visual language as every sibling screen ────────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, var(--hz-surface) 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const CHIP_DEFAULT = 'h-8 px-3 rounded-[9px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0 bg-[var(--hz-surface)] border-[var(--hz-border)] text-[var(--hz-ink)] hover:border-[var(--hz-primary)] hover:text-[var(--hz-primary)]'
const CHIP_SELECTED = 'h-8 px-3 rounded-[9px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0 bg-[var(--hz-primary)] border-[var(--hz-primary)] text-white'
const ADD_BTN_DEFAULT = 'h-9 px-4 rounded-[10px] border text-[12.5px] font-semibold cursor-pointer transition-all bg-[var(--hz-surface)] border-[var(--hz-border)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)]'
const ADD_BTN_ADDED = 'h-9 px-4 rounded-[10px] border text-[12.5px] font-semibold cursor-pointer transition-all bg-[var(--hz-primary-soft)] border-[var(--hz-primary)] text-[var(--hz-primary)]'

/** One card per service. Hourly/sq.ft services show a real, honest
 *  inline-chip quantity picker (this brief's own mockup) — each chip is a
 *  pre-computed flat price, same shape as every sibling screen's own
 *  named-variant options, just labelled by quantity. Selecting the
 *  "8+ hrs" / "1000+ sq.ft" chip switches Add to "Request Assessment" and
 *  never shows a fabricated price. */
function CivilWorkServiceCard({ item, cartQtyForOption, onAddTier, onAddFlat, onRequestAssessment }: {
  item: CivilWorkItem
  cartQtyForOption: (optionId: string) => number
  onAddTier: (item: CivilWorkItem, tier: CivilWorkTier) => void
  onAddFlat: (item: CivilWorkItem) => void
  onRequestAssessment: (item: CivilWorkItem) => void
}) {
  const hasTiers = item.tiers && item.tiers.length > 0
  const [selectedTierId, setSelectedTierId] = useState<string | null>(hasTiers ? item.tiers![0].id : null)
  const [assessmentSelected, setAssessmentSelected] = useState(false)

  const selectedTier = item.tiers?.find(t => t.id === selectedTierId)
  const selectedCartQty = selectedTier ? cartQtyForOption(selectedTier.id) : 0

  return (
    <div className="flex flex-col gap-3 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 shrink-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)]">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
          <span className="text-[12.5px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.description}</span>
          {item.rating && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
          )}
        </div>
      </div>

      {(item.pricingModel === 'hourly' || item.pricingModel === 'sqft') && hasTiers && (
        <>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{item.unitRateLabel}</span>
            {item.minLabel && <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.minLabel}</span>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {item.tiers!.map(tier => (
              <button
                key={tier.id}
                onClick={() => { setSelectedTierId(tier.id); setAssessmentSelected(false) }}
                className={!assessmentSelected && selectedTierId === tier.id ? CHIP_SELECTED : CHIP_DEFAULT}
                style={{ fontFamily: FONT_BODY }}
              >
                {tier.label}
              </button>
            ))}
            {item.assessmentTierLabel && (
              <button
                onClick={() => setAssessmentSelected(true)}
                className={assessmentSelected ? CHIP_SELECTED : CHIP_DEFAULT}
                style={{ fontFamily: FONT_BODY }}
              >
                {item.assessmentTierLabel} — Site assessment
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            {assessmentSelected ? (
              <span className="text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Price after site assessment</span>
            ) : selectedTier ? (
              <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>₹{selectedTier.price.toLocaleString('en-IN')}</span>
            ) : <span />}
            <button
              onClick={() => (assessmentSelected ? onRequestAssessment(item) : selectedTier && onAddTier(item, selectedTier))}
              className={selectedCartQty && !assessmentSelected ? ADD_BTN_ADDED : ADD_BTN_DEFAULT}
              style={{ fontFamily: FONT_BODY }}
            >
              {assessmentSelected ? 'Request Assessment' : selectedCartQty ? `Added ×${selectedCartQty}` : 'Add'}
            </button>
          </div>
        </>
      )}

      {item.pricingModel === 'per-job' && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>From ₹{item.flatPrice!.toLocaleString('en-IN')} / job</span>
            {item.noteLabel && <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.noteLabel}</span>}
          </div>
          <button
            onClick={() => onAddFlat(item)}
            className={cartQtyForOption(item.id) ? ADD_BTN_ADDED : ADD_BTN_DEFAULT}
            style={{ fontFamily: FONT_BODY }}
          >
            {cartQtyForOption(item.id) ? `Added ×${cartQtyForOption(item.id)}` : 'Add'}
          </button>
        </div>
      )}

      {item.pricingModel === 'site-assessment' && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[13px] font-semibold text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Assessment required</span>
          <button
            onClick={() => onRequestAssessment(item)}
            className={cartQtyForOption(item.id) ? ADD_BTN_ADDED : ADD_BTN_DEFAULT}
            style={{ fontFamily: FONT_BODY }}
          >
            {cartQtyForOption(item.id) ? `Requested ×${cartQtyForOption(item.id)}` : 'Request Assessment'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Cart card — identical shape/behaviour to every sibling screen's own
// CartCard, reading/writing the one shared Customer cart. ───────────────

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
            <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{c.price === 0 ? 'Price after assessment' : `₹${c.price.toLocaleString('en-IN')}`}</span>
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
        <span className="text-[17px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>₹{total.toLocaleString('en-IN')}</span>
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

export default function CivilWorkScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart — same instance every
  // other service screen reads/writes, so an item added here survives
  // navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()

  const cartQtyForOption = (optionId: string) => cart.find(c => c.cartId === optionId)?.qty ?? 0

  const addTierToCart = (item: CivilWorkItem, tier: CivilWorkTier) => {
    addItem({
      cartId: tier.id,
      serviceEntry: 'home-services',
      categoryId: 'civil-work',
      serviceId: item.id,
      serviceName: item.title,
      optionId: tier.id,
      optionName: tier.label,
      title: `${item.title} — ${tier.label}`,
      price: tier.price,
      originalPrice: tier.price,
    })
  }

  const addFlatToCart = (item: CivilWorkItem) => {
    addItem({
      cartId: item.id,
      serviceEntry: 'home-services',
      categoryId: 'civil-work',
      serviceId: item.id,
      serviceName: item.title,
      title: item.title,
      price: item.flatPrice ?? 0,
      originalPrice: item.flatPrice ?? 0,
    })
  }

  // A site-assessment request is added as a real, honest ₹0 cart line —
  // never a fabricated price — so the booking flow can carry it forward
  // without inventing a cost this screen has no real way to know yet.
  const requestAssessment = (item: CivilWorkItem) => {
    addItem({
      cartId: `${item.id}-assessment`,
      serviceEntry: 'home-services',
      categoryId: 'civil-work',
      serviceId: item.id,
      serviceName: item.title,
      optionId: 'site-assessment',
      optionName: 'Site assessment',
      title: `${item.title} — Site assessment`,
      price: 0,
      originalPrice: 0,
    })
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`civil-work-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const viewCart = () => {
    onNavigate('booking-details', { hoziehelper_checkout_origin: 'civil-work' })
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

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Essential Home Repairs</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Civil Work
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('wall-surface-repair')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = CIVIL_WORK_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`civil-work-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={section.label} subtitle={section.subtitle} />
                        {items.map(item => (
                          <CivilWorkServiceCard
                            key={item.id}
                            item={item}
                            cartQtyForOption={cartQtyForOption}
                            onAddTier={addTierToCart}
                            onAddFlat={addFlatToCart}
                            onRequestAssessment={requestAssessment}
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
    </div>
  )
}
