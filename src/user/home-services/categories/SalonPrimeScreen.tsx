// ─── Salon Prime — Men's Salon & Massage → Salon for Men → Prime ──────────
//
// Built from a real-page reference PDF the user supplied (UB07) — used
// for its "Select a service" catalogue (7 sections: Packages, Haircut &
// beard styling, Detan, Facial & cleanup, Manicure & pedicure, Hair
// color, Massage) and every service's own rating/reviews/price/original
// price/duration/description, taken as given. Values the reference
// didn't show are never invented — simply omitted. Real, named products
// (Ustraa, Bombay Shaving Company, Garnier, L'Oréal Matrix) are kept as
// given — the same treatment every sibling screen's own real-product
// catalogue already uses. Six "Packages" entries are real, editable
// packages; five of them carry a genuine 10–15% discount shown as an
// "X% OFF" panel (same PackageCard pattern Salon Luxe's own packages
// use) — the sixth ("Haircut & massage") has no discount, so it keeps a
// plain icon panel instead. Four items show only an "N options" count
// in the reference (the real variants sit behind a click this
// single-page capture doesn't reach) — same "N options available"
// placeholder discipline as every other page, until real data arrives.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own page-level aggregate rating/"earliest slot" header,
// its own "Introducing Salon for men at home" marketing video, footer,
// brand promise card, and whatever was in its own cart at capture time.
//
// Honesty note: no real grooming photography exists in this project, so
// every image slot uses this app's own icon-on-gradient placeholder
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
const IcoPackage = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6.5L10 3l7 3.5-7 3.5-7-3.5Z" />
    <path d="M3 6.5V14l7 3.5 7-3.5V6.5" />
    <path d="M10 10v7.5" />
  </svg>
)
const IcoScissors = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="5" r="2" />
    <circle cx="5" cy="15" r="2" />
    <path d="M6.6 6.3L17 16.5M6.6 13.7L17 3.5" />
  </svg>
)
const IcoSun = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="3.5" />
    <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.4 4.6l-1.4 1.4M6 14l-1.4 1.4M15.4 15.4L14 14M6 6L4.6 4.6" />
  </svg>
)
const IcoGlow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="4" />
    <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6L4.2 4.2" />
  </svg>
)
const IcoFoot = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 17.5c-1.7 0-3-1.2-3-3.2 0-2 .9-3 .9-5.3 0-2.5-1.1-3-1.1-5A2.5 2.5 0 017.3 1.5c2 0 2.7 1.7 2.9 3.3.3 2.5 1.8 4 3.4 5.6 1.3 1.3 2.4 2.7 2.4 4.4 0 1.6-1.3 2.7-3 2.7-2.2 0-2.7-1.2-5-1.2Z" />
  </svg>
)
const IcoPalette = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5a7.5 7.5 0 000 15c1 0 1.7-.7 1.7-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H14a3.5 3.5 0 003.5-3.5C17.5 5.6 14.1 2.5 10 2.5Z" />
    <circle cx="6.5" cy="8.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="6" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="13" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
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

interface PrimeItemOption {
  id: string
  label: string
  price: number
  durationMin?: number
  rating?: string
  note?: string
}
interface PrimeItem {
  id: string
  title: string
  section: 'haircut-beard' | 'detan' | 'facial-cleanup' | 'manicure-pedicure' | 'hair-color' | 'massage'
  bestseller?: boolean
  rating: string
  price: number
  priceLabel?: 'starts-at'
  originalPrice?: number
  durationMin?: number
  description?: string
  note?: string
  optionsCount?: number
  options?: PrimeItemOption[]
  icon: React.ReactNode
}
interface PrimePackage {
  id: string
  name: string
  badge: 'PACKAGE' | 'VALUE SAVER'
  rating: string
  price: number
  originalPrice?: number
  durationMin: number
  includes: string[]
}

const PRIME_PACKAGES: PrimePackage[] = [
  { id: 'pr-pkg-haircut-massage', name: 'Haircut & massage', badge: 'PACKAGE', rating: '4.85 (764K reviews)', price: 368, durationMin: 40, includes: ['Haircut: Haircut for men', 'Massage: 10 min Relaxing Head massage'] },
  { id: 'pr-pkg-grooming-essentials', name: 'Grooming essentials', badge: 'VALUE SAVER', rating: '4.85 (1M reviews)', price: 512, originalPrice: 567, durationMin: 65, includes: ['Haircut: Haircut for men', 'Beard or shaving grooming: Beard trimming & styling', 'Massage: Head massage (10 mins)'] },
  { id: 'pr-pkg-haircut-color', name: 'Haircut & color', badge: 'VALUE SAVER', rating: '4.85 (546K reviews)', price: 503, originalPrice: 558, durationMin: 60, includes: ['Haircut or color: Haircut for men', 'Hair color (Garnier): Brown black (shade 3)'] },
  { id: 'pr-pkg-hair-care', name: 'Hair & care', badge: 'VALUE SAVER', rating: '4.84 (850K reviews)', price: 728, originalPrice: 808, durationMin: 65, includes: ['Haircut: Haircut for men', 'Pedicure: Brightening lemon express pedicure'] },
  { id: 'pr-pkg-face-care-beyond', name: 'Face care & beyond', badge: 'VALUE SAVER', rating: '4.84 (1.1M reviews)', price: 788, originalPrice: 858, durationMin: 65, includes: ['Haircut: Haircut for men', 'Facial or cleanup: Charcoal De-toxifying Cleanup'] },
  { id: 'pr-pkg-make-your-own', name: 'Make your own package', badge: 'VALUE SAVER', rating: '4.83 (1.2M reviews)', price: 1386, originalPrice: 1606, durationMin: 125, includes: ['Haircut: Haircut for men', 'Shave or beard grooming: Beard trimming & styling', 'Facial or cleanup: Charcoal de-toxifying cleanup', 'Pedicure: Brightening lemon express pedicure'] },
]

const PRIME_ITEMS: PrimeItem[] = [
  // ── Haircut & beard styling ──
  { id: 'pr-haircut-men', title: 'Haircut for men', section: 'haircut-beard', bestseller: true, rating: '4.84 (26K reviews)', price: 259, priceLabel: 'starts-at', description: 'Professional haircut that suits your face shape', options: [
    { id: 'pr-haircut-men-with-massage', label: 'With 10 mins head massage', price: 369, durationMin: 40, rating: '4.84 (4K reviews)' },
    { id: 'pr-haircut-men-without-massage', label: 'Without 10 mins head massage', price: 259, durationMin: 30, rating: '4.84 (22K reviews)' },
  ], icon: <IcoScissors /> },
  { id: 'pr-haircut-boys', title: 'Haircut for boys', section: 'haircut-beard', rating: '4.83 (109K reviews)', price: 259, durationMin: 30, description: 'Specially trained stylists for boys aged 2 years and above', icon: <IcoScissors /> },
  { id: 'pr-clean-shave', title: 'Clean shave', section: 'haircut-beard', rating: '4.85 (77K reviews)', price: 199, durationMin: 20, description: 'Ustraa shave with a single-use blade for the closest shave', icon: <IcoScissors /> },
  { id: 'pr-beard-trimming', title: 'Beard trimming & styling', section: 'haircut-beard', bestseller: true, rating: '4.85 (151K reviews)', price: 199, durationMin: 25, description: 'Get customized beard shaping from trained stylists', icon: <IcoScissors /> },
  { id: 'pr-beard-color', title: 'Beard color (with product)', section: 'haircut-beard', rating: '4.73 (8K reviews)', price: 199, durationMin: 30, description: 'Even & mess-free colour application', icon: <IcoScissors /> },

  // ── Detan ──
  { id: 'pr-face-neck-detan', title: 'Face & neck detan', section: 'detan', rating: '4.79 (25K reviews)', price: 399, durationMin: 20, icon: <IcoSun /> },
  { id: 'pr-hands-detan', title: 'Hands detan', section: 'detan', rating: '4.76 (6K reviews)', price: 399, durationMin: 30, icon: <IcoSun /> },

  // ── Facial & cleanup ──
  { id: 'pr-skin-brightening-facial', title: 'Skin brightening facial', section: 'facial-cleanup', bestseller: true, rating: '4.72 (18K reviews)', price: 1399, durationMin: 65, description: 'Orange peel extracts, vit C, green tea enriched facial to reduce dullness', icon: <IcoGlow /> },
  { id: 'pr-skin-hydrating-facial', title: 'Skin hydrating facial', section: 'facial-cleanup', rating: '4.73 (5K reviews)', price: 1399, durationMin: 65, description: 'Mulberry, saffron, arbutin enriched facial for deep cleansing & boosted hydration', icon: <IcoGlow /> },
  { id: 'pr-office-ready-cleanup', title: 'Office-ready cleanup', section: 'facial-cleanup', rating: '4.78 (8K reviews)', price: 699, durationMin: 35, description: 'Vit-E, charcoal extracts, lemon enriched cleanup to cleanse & soften the skin', icon: <IcoGlow /> },
  { id: 'pr-oil-free-vacation-cleanup', title: 'Oil-free vacation cleanup', section: 'facial-cleanup', rating: '4.76 (5K reviews)', price: 699, durationMin: 35, description: 'Vit-C, green tea, grapefruit enriched cleanup to absorb oil & control sebum', icon: <IcoGlow /> },
  { id: 'pr-charcoal-detox-cleanup', title: 'Charcoal de-toxifying cleanup', section: 'facial-cleanup', rating: '4.73 (11K reviews)', price: 599, durationMin: 35, description: 'Vit-E, charcoal extracts for deep cleansing, dead skin removal & soft skin', note: 'Product used is of Bombay Shaving Company', icon: <IcoGlow /> },

  // ── Manicure & pedicure ──
  { id: 'pr-foot-calf-massage', title: 'Foot & calf massage', section: 'manicure-pedicure', rating: '4.77 (19K reviews)', price: 199, durationMin: 10, description: 'Oil massage to treat chronic foot pain & stiff calf muscles', icon: <IcoFoot /> },
  { id: 'pr-express-manicure', title: 'Express manicure', section: 'manicure-pedicure', rating: '4.73 (10K reviews)', price: 499, durationMin: 30, description: 'Nail & hand care for regular maintenance', note: 'Includes warm water soak, cleansing & massage', icon: <IcoFoot /> },
  { id: 'pr-nail-cut-hands', title: 'Nail cut & file (hands)', section: 'manicure-pedicure', rating: '4.81 (6K reviews)', price: 99, durationMin: 10, description: 'Quick & basic nail grooming of your hands', icon: <IcoFoot /> },
  { id: 'pr-nail-cut-feet', title: 'Nail cut & file (feet)', section: 'manicure-pedicure', rating: '4.79 (6K reviews)', price: 99, durationMin: 10, description: 'Quick & basic nail grooming of your feet', icon: <IcoFoot /> },
  { id: 'pr-brightening-lemon-deep-pedicure', title: 'Brightening lemon deep cleanse pedicure', section: 'manicure-pedicure', bestseller: true, rating: '4.78 (29K reviews)', price: 799, durationMin: 60, description: 'Premium nail & foot care to remove dead skin, calluses & odour', note: 'Includes smoothie mask, relaxing warm water soak, scrub, cream massage', icon: <IcoFoot /> },
  { id: 'pr-brightening-lemon-express-pedicure', title: 'Brightening lemon express pedicure', section: 'manicure-pedicure', rating: '4.76 (26K reviews)', price: 549, durationMin: 35, description: 'Nail & foot care for regular maintenance', note: 'Includes warm water soak, cleansing & massage', icon: <IcoFoot /> },

  // ── Hair color ──
  { id: 'pr-hair-color-application', title: 'Hair color (only application)', section: 'hair-color', rating: '4.81 (34K reviews)', price: 199, durationMin: 30, description: "Please provide your own hair colour; we'll bring everything else", icon: <IcoPalette /> },
  { id: 'pr-garnier-hair-color', title: 'Garnier hair color', section: 'hair-color', rating: '4.76 (14K reviews)', price: 299, priceLabel: 'starts-at', description: 'Even & mess-free colour application', options: [
    { id: 'pr-garnier-brown-black', label: 'Brown black (shade 3)', price: 299, durationMin: 30, rating: '4.77 (9K reviews)' },
    { id: 'pr-garnier-deep-black', label: 'Deep black (shade 1)', price: 299, durationMin: 30, rating: '4.78 (5K reviews)' },
    { id: 'pr-garnier-natural-brown', label: 'Natural brown (shade 4)', price: 299, durationMin: 30, rating: '4.68 (1K reviews)' },
  ], icon: <IcoPalette /> },
  { id: 'pr-loreal-matrix-hair-color', title: "L'Oreal matrix hair color", section: 'hair-color', rating: '4.76 (9K reviews)', price: 449, priceLabel: 'starts-at', description: 'Even & mess-free colour application', options: [
    { id: 'pr-matrix-dark-brown', label: 'Dark brown (shade 3)', price: 449, durationMin: 30, rating: '4.78 (4K reviews)' },
    { id: 'pr-matrix-darkest-brown-black', label: 'Darkest brown/black (shade 2)', price: 449, durationMin: 30, rating: '4.76 (4K reviews)', note: 'Recommended for black shade' },
    { id: 'pr-matrix-medium-brown', label: 'Medium brown (shade 4)', price: 449, durationMin: 30, rating: '4.68 (989 reviews)' },
  ], icon: <IcoPalette /> },

  // ── Massage ──
  { id: 'pr-head-massage', title: 'Head massage', section: 'massage', rating: '4.84 (91K reviews)', price: 109, priceLabel: 'starts-at', description: 'Choose from different types of head massages', options: [
    { id: 'pr-head-massage-10', label: 'Head massage (10 mins)', price: 109, durationMin: 10, rating: '4.85 (72K reviews)' },
    { id: 'pr-head-massage-20', label: 'Head massage (20 mins)', price: 199, durationMin: 20, rating: '4.82 (14K reviews)' },
    { id: 'pr-head-massage-strengthening-10', label: 'Hair strengthening & head massage (10 mins)', price: 149, durationMin: 10, rating: '4.82 (2K reviews)' },
    { id: 'pr-head-massage-strengthening-20', label: 'Hair strengthening & head massage (20 mins)', price: 249, durationMin: 20, rating: '4.83 (2K reviews)' },
  ], icon: <IcoHands /> },
  { id: 'pr-head-neck-shoulder-massage', title: 'Head, neck & shoulder massage', section: 'massage', rating: '4.81 (56K reviews)', price: 299, durationMin: 30, description: 'Relaxing oil massage to promote hair growth, treat stiff muscle & relieve stress', icon: <IcoHands /> },
  { id: 'pr-hydrating-face-massage', title: 'Hydrating face massage (10 mins)', section: 'massage', rating: '4.80 (12K reviews)', price: 149, durationMin: 10, description: 'Refreshing massage with a moisturiser to improve blood flow & enhance glow', icon: <IcoHands /> },
  { id: 'pr-neck-shoulder-massage', title: 'Neck & shoulder massage', section: 'massage', rating: '4.81 (13K reviews)', price: 199, durationMin: 20, description: 'Relaxing oil massage to treat stiff/tense muscles & relieve stress', icon: <IcoHands /> },
]

const SECTIONS: { id: PrimeItem['section']; label: string; icon: React.ReactNode }[] = [
  { id: 'haircut-beard', label: 'Haircut & beard styling', icon: <IcoScissors /> },
  { id: 'detan', label: 'Detan', icon: <IcoSun /> },
  { id: 'facial-cleanup', label: 'Facial & cleanup', icon: <IcoGlow /> },
  { id: 'manicure-pedicure', label: 'Manicure & pedicure', icon: <IcoFoot /> },
  { id: 'hair-color', label: 'Hair color', icon: <IcoPalette /> },
  { id: 'massage', label: 'Massage', icon: <IcoHands /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<PrimeItem['section'], { title: string; subtitle: string }> = {
  'haircut-beard': { title: 'A cut made for you', subtitle: 'Precision haircuts and beard styling, for men and boys.' },
  detan: { title: 'Fresh, even-toned skin', subtitle: 'Quick detan treatments for face, neck & hands.' },
  'facial-cleanup': { title: 'Fresh, healthy skin', subtitle: 'Facials and cleanups from trained professionals.' },
  'manicure-pedicure': { title: 'Hands and feet that feel as good as they look', subtitle: 'Quick grooming to full spa-style pedicures.' },
  'hair-color': { title: 'Colour that suits you', subtitle: 'Application-only or full Garnier & L’Oréal Matrix colour, done at home.' },
  massage: { title: 'Unwind after a long day', subtitle: 'Head, neck, shoulder & face massages to ease everyday tension.' },
}

function getPrimeItem(id: string): PrimeItem {
  const item = PRIME_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Prime item id: ${id}`)
  return item
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
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Salon Prime</span>
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
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Salon Prime</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'salon-prime' })}
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
        <button
          onClick={() => onJump('packages')}
          className="flex flex-col items-center justify-between gap-1.5 cursor-pointer border-0 bg-transparent p-0 shrink-0 w-[76px]"
        >
          <div className="w-14 h-14 rounded-[12px] overflow-hidden border border-[var(--hz-border)] flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)] shrink-0"><IcoPackage /></div>
          <span className="text-[12px] text-[var(--hz-ink)] text-center leading-tight" style={{ fontFamily: FONT_BODY }}>Packages</span>
        </button>
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

// ─── Hero — no real grooming photo exists in this project, so this uses
// the same warm-gradient + icon placeholder every other missing-photo
// surface in this app falls back to (the reference's own hero here is a
// marketing video for a real campaign, not catalogue data). ────────────

function HeroBanner({ onExplore, onViewAddOns }: { onExplore: () => void; onViewAddOns: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, var(--hz-primary-wash) 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Salon Prime</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Everyday grooming,<br />done right.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Trained professionals for cuts, colour & cleanups, at home.
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
            View massage
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[var(--hz-primary)] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoScissors /></div>
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
const PHOTO_PANEL: React.CSSProperties = {
  background: '#F9F4FF',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-[var(--hz-surface)] border-[var(--hz-border)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)]'
const NEUTRAL_BTN_ADDED = 'bg-[var(--hz-primary-soft)] border-[var(--hz-primary)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

// Package card — same layout as Salon Luxe's own PackageCard: a photo
// panel with the discount % drawn directly on it, breakdown bullets, an
// "Edit your package" button (scrolls to a relevant section — the same
// honest fallback every sibling screen uses for a package without a
// bespoke customiser), price + Add on the right. A package with no real
// discount (Haircut & massage) keeps a plain icon panel instead of a
// fabricated "0% OFF".
function PackageCard({ pkg, cartCount, onAdd, onEdit }: {
  pkg: PrimePackage
  cartCount: number
  onAdd: () => void
  onEdit: () => void
}) {
  const discountPct = pkg.originalPrice ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100) : null
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 w-full h-[100px] sm:w-[170px] sm:h-auto rounded-[8px] flex items-center justify-center" style={PHOTO_PANEL}>
        {discountPct ? (
          <div className="text-center leading-[1.05]">
            <span className="block text-[28px] sm:text-[32px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_HEAD }}>{discountPct}%</span>
            <span className="block text-[28px] sm:text-[32px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_HEAD }}>OFF</span>
          </div>
        ) : (
          <div className="text-[var(--hz-primary)] opacity-60"><IcoPackage /></div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[0.06em] uppercase text-[#0F7A3D] font-semibold" style={{ fontFamily: FONT_MONO }}>{pkg.badge}</span>
            <span className="text-[17px] sm:text-[18px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{pkg.name}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {pkg.rating}</span>
          </div>
          <ul className="flex flex-col gap-1 pl-4 m-0" style={{ listStyle: 'disc' }}>
            {pkg.includes.map(inc => (
              <li key={inc} className="text-[12px] text-[var(--hz-ink)] leading-snug" style={{ fontFamily: FONT_BODY }}>{inc}</li>
            ))}
          </ul>
          <button onClick={onEdit} className={`self-start ${NEUTRAL_BTN} ${NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
            Edit your package
          </button>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 sm:w-[140px] gap-3">
          <div className="text-left sm:text-right">
            <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
              {pkg.originalPrice && <span className="line-through text-[var(--hz-ink-subtle)]">₹{pkg.originalPrice.toLocaleString('en-IN')}</span>} <span className="font-semibold text-[var(--hz-ink)]">₹{pkg.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(pkg.durationMin)}</div>
          </div>
          <button onClick={onAdd} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
            {cartCount ? `Added ×${cartCount}` : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PrimeLineItemRow({ item, cartCount, onSelect, onViewDetails, getCartCount }: {
  item: PrimeItem
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

// ─── Options picker modal — opened from an item that has real,
// user-supplied option data. Same calm card language as the rest of
// this file, same component every sibling screen uses for its own
// options items — not a separate visual system. ────────────────────────

function OptionsModal({ item, cartCountForOption, onAddOption, onClose }: {
  item: PrimeItem
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: PrimeItemOption) => void
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
                  {opt.durationMin && (
                    <span className="text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(opt.durationMin)}</span>
                  )}
                  {opt.note && (
                    <span className="text-[11px] text-[var(--hz-ink-subtle)] italic" style={{ fontFamily: FONT_BODY }}>{opt.note}</span>
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

// ─── "View details" — makes the link genuinely interactive: same info
// the row already shows, in one focused panel, with its own Add button.
function ServiceDetailModal({ item, cartCount, onSelect, onClose }: {
  item: PrimeItem
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
            {item.bestseller && (
              <span className="self-start flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap" style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}>
                ★ Bestseller
              </span>
            )}
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

export default function SalonPrimeScreen({
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
  const [customiserPkgId, setCustomiserPkgId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'salon-prime',
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
  // picker closes.
  const addOptionToCart = (item: PrimeItem, option: PrimeItemOption) => {
    addToCart({ id: option.id, title: `${item.title} — ${option.label}`, price: option.price, durationMin: option.durationMin })
    setExpandedItemId(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`prime-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'salon-prime',
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
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Men's Salon &amp; Massage</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Salon Prime
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('haircut-beard')} onViewAddOns={() => jumpToSection('massage')} />
                  <ServiceTabs onJump={jumpToSection} />

                  <div id="prime-section-packages" className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                    <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Packages</h2>
                    <div className="flex flex-col gap-3">
                      {PRIME_PACKAGES.map(pkg => (
                        <PackageCard
                          key={pkg.id}
                          pkg={pkg}
                          cartCount={cartCountForItem(pkg.id)}
                          onAdd={() => addToCart({ id: pkg.id, title: pkg.name, price: pkg.price, originalPrice: pkg.originalPrice, durationMin: pkg.durationMin })}
                          onEdit={() => jumpToSection('haircut-beard')}
                        />
                      ))}
                    </div>
                  </div>

                  {SECTIONS.map(section => {
                    const items = PRIME_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`prime-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <PrimeLineItemRow
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

      {detailItemId && (
        <ServiceDetailModal
          item={getPrimeItem(detailItemId)}
          cartCount={cartCountForItem(detailItemId)}
          onSelect={() => {
            const item = getPrimeItem(detailItemId)
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
          item={getPrimeItem(expandedItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getPrimeItem(expandedItemId), option)}
          onClose={() => setExpandedItemId(null)}
        />
      )}
    </div>
  )
}
