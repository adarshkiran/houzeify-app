// ─── Prime — Women's Salon & Spa → Salon for Women → Prime ────────────────
//
// The everyday/affordable sibling of Salon Luxe (see SalonLuxeScreen.tsx for
// the premium tier) — same shell, chrome, and cart architecture, but its own
// original data set at a more accessible price band, matching the tier
// picker's own positioning ("Trained professionals", "Affordable care",
// starting ₹599 — see SALON_TIERS in HomeServicesScreen.tsx).
//
// Catalogue depth: rebuilt to mirror Salon Luxe's own 8-category taxonomy
// (Waxing, Korean Facial, Glow Rituals, Signature Facials, Cleanup,
// Pedicure & Manicure, Threading & Face Wax, Bleach/Detan/Massage) per an
// explicit work order asking Prime to match that same information
// architecture — every item below is original Prime-tier content (own
// names, own pricing, roughly 55-70% of Luxe's price points), never a
// copy of Luxe's own catalogue.
//
// Options: several items (mostly waxing, plus one pedicure item) carry an
// optional `options` array — same pattern as Salon Luxe's own SalonItemOption
// system: the card shows "N options" instead of a price-only row, and "Add"
// opens OptionsModal (below) instead of adding the base item directly. A
// selected option becomes its own cart line and shows as a green-check tag
// on the card, same convention as Luxe.
//
// Honesty/data-integrity notes (this file was built against an explicit,
// repeated "do not fabricate ratings/reviews/booking counts" instruction —
// stricter than earlier screens in this app):
//   - No per-item star ratings or review counts anywhere on this page —
//     unlike Salon Luxe/HozieHelp, which do carry originally-authored demo
//     ratings, Prime deliberately omits them since no real ratings data
//     source exists for it and the work order explicitly called this out.
//   - Every price/duration below is originally-authored demo data (this
//     app's established convention — see SalonLuxeScreen.tsx's own header
//     comment), scaled to read as more affordable than Salon Luxe's own
//     pricing. Never a fabricated discount, guarantee, or availability claim.
//   - No new photographic assets were created — this environment has no
//     image-generation capability. The hero reuses the real photo already
//     assigned to the Prime tier card (Salon-for-Women-real2.png); every
//     other visual falls back to the same icon-on-gradient placeholder
//     pattern (ServiceImage/CategoryBanner) already established throughout
//     this app, exactly as Salon Luxe does wherever it has no real photo.
//   - Section 01 (breadcrumb/page context) reuses Salon Luxe's own eyebrow +
//     title treatment verbatim rather than a separate breadcrumb component,
//     per explicit instruction ("Same as Salon Luxe").

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ServiceImage from '@/shared/components/ServiceImage'
import HIcon from '@/shared/components/HIcon'
import primeHeroImg from '@/imports/Services icons/Salon-for-Women-real2.png'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Icons — small inline line icons, same visual language as Salon Luxe ──

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
const IcoWax = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="14" height="8" rx="2" />
    <path d="M13 6c1.5-2 3-2.5 4-1.5" />
  </svg>
)
const IcoFacial = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7" />
    <path d="M7.5 9h.01M12.5 9h.01" />
    <path d="M7.5 12.5c.8.8 4.2.8 5 0" />
  </svg>
)
const IcoSparkle = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.6 5.4L17 9l-5.4 1.6L10 16l-1.6-5.4L3 9l5.4-1.6L10 2Z" />
  </svg>
)
const IcoGlow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="4" />
    <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6L4.2 4.2" />
  </svg>
)
const IcoCleanupBubbles = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="12" r="4.5" />
    <circle cx="14" cy="7" r="2.5" />
  </svg>
)
const IcoNail = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="2" width="6" height="16" rx="3" />
  </svg>
)
const IcoThread = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="14" r="2.5" />
    <path d="M8 12.5C11 9 13 7 17 3" />
  </svg>
)
const IcoDroplet = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5S4.5 9 4.5 12.5a5.5 5.5 0 0011 0C15.5 9 10 2.5 10 2.5Z" />
  </svg>
)
const IcoPackage = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="14" height="10" rx="1.5" />
    <path d="M3 7l7-4 7 4M10 7v10" />
  </svg>
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

function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} mins`
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`
  return `${h} hr${h > 1 ? 's' : ''} ${m} mins`
}

// ─── Data model — eight original service groups mirroring Salon Luxe's own
// catalogue taxonomy, all originally-authored demo pricing/duration (never
// a real rating/review — see header comment), scaled to read as more
// affordable than Salon Luxe. ───────────────────────────────────────────

interface PrimeItemOption {
  id: string
  label: string
  price: number
  originalPrice: number
  durationMin: number
}
interface PrimeLineItem {
  id: string
  title: string
  blurb: string
  price: number
  originalPrice: number
  durationMin: number
  /** When present, "Add" opens a picker of these instead of adding this
   *  item directly — this item's own price/duration above become its
   *  "starting from" figures (its cheapest option). Same convention as
   *  Salon Luxe's own options items. */
  options?: PrimeItemOption[]
}
interface PrimeSection {
  id: string
  label: string
  icon: React.ReactNode
  items: PrimeLineItem[]
}

const PRIME_SECTIONS: PrimeSection[] = [
  {
    id: 'waxing',
    label: 'Waxing',
    icon: <IcoWax />,
    items: [
      { id: 'prime-wax-arms', title: 'Full Arms & Underarms Waxing', blurb: 'Covers full arms, including underarms', price: 149, originalPrice: 199, durationMin: 25, options: [
        { id: 'prime-wax-arms-classic', label: 'Classic Wax', price: 149, originalPrice: 199, durationMin: 25 },
        { id: 'prime-wax-arms-chocolate', label: 'Chocolate Wax', price: 169, originalPrice: 229, durationMin: 25 },
        { id: 'prime-wax-arms-rollon', label: 'Roll-on Wax', price: 159, originalPrice: 219, durationMin: 22 },
      ] },
      { id: 'prime-wax-legs', title: 'Full Legs Waxing', blurb: 'Covers full legs, including feet', price: 179, originalPrice: 249, durationMin: 30, options: [
        { id: 'prime-wax-legs-classic', label: 'Classic Wax', price: 179, originalPrice: 249, durationMin: 30 },
        { id: 'prime-wax-legs-chocolate', label: 'Chocolate Wax', price: 199, originalPrice: 279, durationMin: 30 },
        { id: 'prime-wax-legs-rollon', label: 'Roll-on Wax', price: 189, originalPrice: 259, durationMin: 27 },
      ] },
      { id: 'prime-wax-underarms', title: 'Underarms Waxing', blurb: 'Quick underarm clean-up', price: 59, originalPrice: 89, durationMin: 8 },
      { id: 'prime-wax-back', title: 'Back Waxing', blurb: 'Covers the area from shoulders to the pelvis', price: 199, originalPrice: 279, durationMin: 25, options: [
        { id: 'prime-wax-back-classic', label: 'Classic Wax', price: 199, originalPrice: 279, durationMin: 25 },
        { id: 'prime-wax-back-chocolate', label: 'Chocolate Wax', price: 229, originalPrice: 309, durationMin: 25 },
      ] },
      { id: 'prime-wax-bikini', title: 'Bikini Waxing', blurb: 'Covers the full pubic area (buttocks not included)', price: 199, originalPrice: 269, durationMin: 20 },
      { id: 'prime-wax-fullbody', title: 'Full Body Waxing', blurb: 'Covers arms, legs, back & underarms', price: 549, originalPrice: 799, durationMin: 75, options: [
        { id: 'prime-wax-fullbody-classic', label: 'Classic Wax', price: 549, originalPrice: 799, durationMin: 75 },
        { id: 'prime-wax-fullbody-chocolate', label: 'Chocolate Wax', price: 599, originalPrice: 849, durationMin: 78 },
        { id: 'prime-wax-fullbody-honey', label: 'Honey Wax', price: 579, originalPrice: 829, durationMin: 75 },
      ] },
    ],
  },
  {
    id: 'korean-facial',
    label: 'Korean Facial',
    icon: <IcoFacial />,
    items: [
      { id: 'prime-kf-glow', title: 'Korean Glow Facial', blurb: 'A multi-step routine for dewy, radiant skin', price: 599, originalPrice: 849, durationMin: 50 },
      { id: 'prime-kf-hydra', title: 'Korean Hydra Facial', blurb: 'A deep hydration boost for thirsty skin', price: 499, originalPrice: 699, durationMin: 45 },
      { id: 'prime-kf-brightening', title: 'Korean Brightening Facial', blurb: 'For a brighter, more even-toned look', price: 549, originalPrice: 749, durationMin: 45 },
    ],
  },
  {
    id: 'glow-rituals',
    label: 'Glow Rituals',
    icon: <IcoSparkle />,
    items: [
      { id: 'prime-gr-rice', title: 'Rice Glow Ritual', blurb: 'A calming ritual for soft, luminous skin', price: 649, originalPrice: 899, durationMin: 55 },
      { id: 'prime-gr-silk', title: 'Silk Touch Ritual', blurb: 'A gentle, nourishing ritual for smoother skin', price: 699, originalPrice: 949, durationMin: 60 },
    ],
  },
  {
    id: 'signature-facials',
    label: 'Signature Facials',
    icon: <IcoGlow />,
    items: [
      { id: 'prime-sf-radiance', title: 'Radiance Facial', blurb: 'Restores natural radiance with active serums', price: 399, originalPrice: 549, durationMin: 45 },
      { id: 'prime-sf-brightening', title: 'Brightening Facial', blurb: 'Deep cleanse for an instant glow', price: 449, originalPrice: 599, durationMin: 45 },
      { id: 'prime-sf-hydration', title: 'Hydration Facial', blurb: 'Replenishes moisture for soft, supple skin', price: 429, originalPrice: 579, durationMin: 40 },
      { id: 'prime-sf-antiageing', title: 'Anti-Ageing Facial', blurb: 'Targets fine lines for a smoother-looking finish', price: 599, originalPrice: 799, durationMin: 50 },
      { id: 'prime-sf-oxyglow', title: 'Oxy Glow Facial', blurb: 'An oxygenating treatment for fresher-looking skin', price: 499, originalPrice: 669, durationMin: 45 },
      { id: 'prime-sf-gold', title: 'Gold Facial', blurb: 'A brightening facial with a gold-infused cream', price: 649, originalPrice: 899, durationMin: 55 },
    ],
  },
  {
    id: 'cleanup',
    label: 'Cleanup',
    icon: <IcoCleanupBubbles />,
    items: [
      { id: 'prime-cl-fruit', title: 'Fruit Cleanup', blurb: 'Gentle cleanup with a fruit-based scrub', price: 249, originalPrice: 329, durationMin: 30 },
      { id: 'prime-cl-detan', title: 'De-Tan Cleanup', blurb: 'Helps even out sun tan', price: 279, originalPrice: 369, durationMin: 30 },
      { id: 'prime-cl-instantglow', title: 'Instant Glow Cleanup', blurb: 'A quick refresh for a brighter look', price: 299, originalPrice: 399, durationMin: 35 },
      { id: 'prime-cl-deep', title: 'Deep Cleanup', blurb: 'A more thorough cleanup for clearer-looking skin', price: 329, originalPrice: 439, durationMin: 35 },
    ],
  },
  {
    id: 'mani-pedi',
    label: 'Pedicure & Manicure',
    icon: <IcoNail />,
    items: [
      { id: 'prime-mp-manicure-classic', title: 'Classic Manicure', blurb: 'Soak, scrub, buff & polish', price: 199, originalPrice: 269, durationMin: 30 },
      { id: 'prime-mp-pedicure-classic', title: 'Classic Pedicure', blurb: 'Soak, scrub, buff & polish', price: 249, originalPrice: 329, durationMin: 35 },
      { id: 'prime-mp-manicure-spa', title: 'Spa Manicure', blurb: 'A more complete hand-care routine', price: 349, originalPrice: 469, durationMin: 40 },
      { id: 'prime-mp-pedicure-spa', title: 'Spa Pedicure', blurb: 'A more complete foot-care routine', price: 399, originalPrice: 549, durationMin: 45, options: [
        { id: 'prime-mp-pedicure-spa-classic', label: 'Classic Spa', price: 399, originalPrice: 549, durationMin: 45 },
        { id: 'prime-mp-pedicure-spa-crystal', label: 'Crystal Spa', price: 469, originalPrice: 629, durationMin: 55 },
      ] },
      { id: 'prime-mp-nailcare', title: 'Nail Care & Polish', blurb: 'A quick, no-fuss nail-care essential', price: 149, originalPrice: 199, durationMin: 20 },
    ],
  },
  {
    id: 'threading-facewax',
    label: 'Threading & Face Wax',
    icon: <IcoThread />,
    items: [
      { id: 'prime-tf-eyebrow', title: 'Eyebrow Threading', blurb: 'Shapes and cleans up the brow line', price: 39, originalPrice: 59, durationMin: 8 },
      { id: 'prime-tf-upperlip', title: 'Upper Lip Threading', blurb: 'Quick upper-lip clean-up', price: 25, originalPrice: 39, durationMin: 5 },
      { id: 'prime-tf-chin', title: 'Chin Threading', blurb: 'Shapes and cleans the chin area', price: 25, originalPrice: 39, durationMin: 5 },
      { id: 'prime-tf-fullface', title: 'Full Face Threading', blurb: 'Eyebrows, upper lip & chin', price: 79, originalPrice: 109, durationMin: 18 },
      { id: 'prime-tf-facewax', title: 'Face Wax', blurb: 'Gentle waxing for smooth, hair-free skin', price: 129, originalPrice: 179, durationMin: 20 },
    ],
  },
  {
    id: 'bleach-detan-massage',
    label: 'Bleach, Detan & Massage',
    icon: <IcoDroplet />,
    items: [
      { id: 'prime-bdm-bleach', title: 'Face Bleach', blurb: 'Instant brightening, no redness', price: 149, originalPrice: 199, durationMin: 20 },
      { id: 'prime-bdm-detan', title: 'Full Body De-tan', blurb: 'Removes tan from arms, legs & back', price: 449, originalPrice: 599, durationMin: 55 },
      { id: 'prime-bdm-headmassage', title: 'Head Massage', blurb: 'A relaxing head massage to ease tension', price: 249, originalPrice: 349, durationMin: 30 },
      { id: 'prime-bdm-footmassage', title: 'Foot Massage', blurb: 'A soothing massage to relax tired feet', price: 279, originalPrice: 379, durationMin: 30 },
      { id: 'prime-bdm-backmassage', title: 'Back Massage', blurb: 'Eases tension in the back and shoulders', price: 349, originalPrice: 469, durationMin: 35 },
    ],
  },
]

const ALL_PRIME_ITEMS = PRIME_SECTIONS.flatMap(s => s.items)
function getPrimeItem(id: string): PrimeLineItem {
  const item = ALL_PRIME_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown prime item id: ${id}`)
  return item
}
/** This item's own section icon — the same visual every LineItemRow
 *  already shows for it, reused on its options picker too. */
function getPrimeItemIcon(id: string): React.ReactNode {
  return PRIME_SECTIONS.find(s => s.items.some(i => i.id === id))?.icon
}

// ─── Packages — bundles of the real items above, same "never a separate
// hand-typed total" discipline as Salon Luxe's own packages. Names follow
// the work order's own suggested originals. ────────────────────────────

interface PrimePackage {
  id: string
  name: string
  discountPct: number
  includes: { label: string; itemId: string }[]
}

const PRIME_PACKAGES: PrimePackage[] = [
  {
    id: 'prime-pkg-refresh',
    name: 'Prime Refresh',
    discountPct: 10,
    includes: [
      { label: 'Cleanup', itemId: 'prime-cl-fruit' },
      { label: 'Waxing — arms', itemId: 'prime-wax-arms' },
      { label: 'Waxing — legs', itemId: 'prime-wax-legs' },
      { label: 'Facial hair removal', itemId: 'prime-tf-eyebrow' },
    ],
  },
  {
    id: 'prime-pkg-glowgroom',
    name: 'Glow & Groom',
    discountPct: 15,
    includes: [
      { label: 'Waxing — arms', itemId: 'prime-wax-arms' },
      { label: 'Waxing — legs', itemId: 'prime-wax-legs' },
      { label: 'Facial', itemId: 'prime-sf-brightening' },
      { label: 'Facial hair removal', itemId: 'prime-tf-eyebrow' },
    ],
  },
  {
    id: 'prime-pkg-skincare',
    name: 'Skin Care Ritual',
    discountPct: 12,
    includes: [
      { label: 'Facial', itemId: 'prime-kf-glow' },
      { label: 'Cleanup', itemId: 'prime-cl-instantglow' },
    ],
  },
  {
    id: 'prime-pkg-handsfeet',
    name: 'Hands & Feet Care',
    discountPct: 12,
    includes: [
      { label: 'Manicure', itemId: 'prime-mp-manicure-classic' },
      { label: 'Pedicure', itemId: 'prime-mp-pedicure-classic' },
    ],
  },
]

function getPackageTotals(pkg: PrimePackage) {
  const items = pkg.includes.map(inc => getPrimeItem(inc.itemId))
  const originalPrice = items.reduce((sum, i) => sum + i.originalPrice, 0)
  const durationMin = items.reduce((sum, i) => sum + i.durationMin, 0)
  const price = Math.round(originalPrice * (1 - pkg.discountPct / 100))
  return { originalPrice, price, durationMin }
}

// Curated highlight rows — id references into the real data above, never a
// second hand-typed copy of an item's title/price.
const POPULAR_ITEM_IDS = ['prime-wax-arms', 'prime-kf-glow', 'prime-mp-pedicure-classic', 'prime-sf-brightening']
const MORE_FOR_YOU_ITEM_IDS = ['prime-cl-fruit', 'prime-tf-eyebrow', 'prime-bdm-headmassage', 'prime-wax-underarms']

interface Addable {
  id: string
  title: string
  price: number
  originalPrice: number
  durationMin: number
  /** The underlying service's own id, when this Addable represents one
   *  specific option of it (id is the OPTION's id in that case) — falls
   *  back to `id` itself for a plain, option-less add. */
  serviceId?: string
  optionId?: string
  optionName?: string
}

// ─── Chrome — same shell shape as Salon Luxe / HozieHelp ──────────────────

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Prime</span>
      </div>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBell /></button>
    </div>
  )
}

function TopHeader({ onNavigate }: { onNavigate: (s: string, data?: Record<string, string>) => void }) {
  // Profile is already reachable from the Sidebar's own "Profile" item, so
  // this header slot carries the Cart instead — a real, live count from the
  // one shared Customer cart, not a decorative icon.
  const { itemCount } = useCustomerCart()
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('home-services')} aria-label="Back to Services" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"><IcoBack /></button>
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Prime</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'prime' })}
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

// ─── "Select a service" jump chips — sticky, frosted-glass, same fix
// applied to every "Select a service" panel in this app (Salon Luxe,
// HozieHelp Gold/Standard) and the standing convention for new ones.
// "Packages" leads the list, matching Salon Luxe's own ServiceTabs. ───────

const JUMP_TARGETS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'packages', label: 'Packages', icon: <IcoPackage /> },
  ...PRIME_SECTIONS.map(s => ({ id: s.id, label: s.label, icon: s.icon })),
]

function ServiceTabs({ onJump }: { onJump: (id: string) => void }) {
  return (
    <div className="bg-[var(--hz-surface)]/70 backdrop-blur-md border border-[var(--hz-border)] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {JUMP_TARGETS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            // justify-between (not the default top-aligned stretch) — the
            // row stretches every chip to match the tallest label ("Bleach,
            // Detan & Massage", 3 lines), and without this a 1-line label
            // like "Waxing" was left floating near the top with 15-30px of
            // dead space below it before the card's real bottom edge, while
            // the 3-line chip's label sat flush with it — this keeps every
            // icon pinned to the same top row and every label's BOTTOM
            // flush with the same line, so short and tall chips both read
            // as ending at the same place.
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

// ─── Hero — real supplied Prime photo (the same one already used on its
// own tier-picker card), fresh Houzeify copy. ──────────────────────────────

function HeroBanner({ onExplore, onViewPackages }: { onExplore: () => void; onViewPackages: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Prime</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Everyday beauty,<br />thoughtfully done.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Professional salon services for hair, skin, hands, feet and more.
        </p>
        {/* flex-wrap + the same 70%-on-mobile cap as the heading/copy
            above it — without this the row ran full-width behind the
            absolutely-positioned photo and "View packages" got visually
            clipped under it on narrow screens. */}
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore services
          </button>
          <button
            onClick={onViewPackages}
            className="h-10 px-5 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[13px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
            style={{ fontFamily: FONT_BODY }}
          >
            View packages
          </button>
        </div>
      </div>
      <img
        src={primeHeroImg}
        alt="Prime salon services"
        className="absolute right-0 bottom-0 top-0 h-full object-cover w-[34%] sm:w-[38%]"
        style={{ objectPosition: '50% 12%', maskImage: 'linear-gradient(90deg, transparent, black 12%)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%)' }}
      />
    </div>
  )
}

// ─── Category banner — same icon-on-gradient placeholder pattern used
// everywhere in this app where no real photography exists. ────────────────

function CategoryBanner({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-[16px] flex items-center gap-4 px-5 sm:px-8 py-5"
      style={{ background: 'linear-gradient(120deg, #F9F5FF 0%, var(--hz-primary-soft) 60%, #FFF3EA 100%)' }}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[14px] bg-[var(--hz-surface)]/70 flex items-center justify-center text-[var(--hz-primary)] shrink-0 shadow-sm">{icon}</div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[16px] sm:text-[19px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{title}</span>
        <span className="text-[12.5px] sm:text-[13px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{subtitle}</span>
      </div>
    </div>
  )
}

const SECTION_SUBTITLES: Record<string, string> = {
  'waxing': 'Professional waxing for smooth, comfortable grooming.',
  'korean-facial': 'Modern facial rituals for a fresh, refreshed look.',
  'glow-rituals': 'Premium facial rituals for a calm, luminous self-care experience.',
  'signature-facials': 'Explore facial care for different skin and beauty routines.',
  'cleanup': 'Quick facial care when you want a fresh, refreshed feel.',
  'mani-pedi': 'Professional care for your hands and feet, from quick grooming to premium rituals.',
  'threading-facewax': 'Quick grooming services for brows and facial care.',
  'bleach-detan-massage': 'Complete your salon routine with additional care and relaxation.',
}

// ─── Card chrome — same calm, neutral language as Salon Luxe's own cards ──

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

function LineItemRow({ item, icon, onSelect, cartCount, getCartCount }: {
  item: PrimeLineItem
  icon: React.ReactNode
  onSelect: () => void
  cartCount: number
  /** Looks up how many of a given cart-line id are in the cart — reused
   *  here to check each of this item's OPTION ids too, so a selected
   *  variant can be called out on the card. */
  getCartCount: (id: string) => number
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <ServiceImage icon={icon} alt={item.title} className="w-32 h-32 rounded-[8px] shrink-0 mx-auto sm:mx-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="text-[12px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.blurb}</span>
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
            <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.options.length} options</span>
          )
        )}
      </div>
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
            <span className="line-through text-[var(--hz-ink-subtle)]">₹{item.originalPrice}</span> <span className="font-semibold text-[var(--hz-ink)]">₹{item.price}</span>
          </div>
          <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
        </div>
        <button onClick={onSelect} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : item.options ? 'Select' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── Options picker modal — opened from a line item that has more than
// one way to book it (a wax type, a body area, a duration). Same calm
// card language as the rest of this file, immediate-select (click a row
// = add it and close) — same pattern as Salon Luxe's own OptionsModal. ────

function OptionsModal({ item, icon, cartCountForOption, onAddOption, onClose }: {
  item: PrimeLineItem
  icon: React.ReactNode
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
                <div className="w-32 h-32 rounded-[10px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[var(--hz-primary)] shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[13.5px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{opt.label}</span>
                  <span className="text-[13px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
                    <span className="line-through text-[var(--hz-ink-subtle)]">₹{opt.originalPrice}</span> <span className="font-semibold text-[var(--hz-ink)]">₹{opt.price}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(opt.durationMin)}</span>
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

function PackageCard({ pkg, onAdd, cartCount }: { pkg: PrimePackage; onAdd: () => void; cartCount: number }) {
  const { originalPrice, price, durationMin } = getPackageTotals(pkg)
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 w-full h-[100px] sm:w-[170px] sm:h-auto rounded-[8px] flex items-center justify-center" style={PHOTO_PANEL}>
        <div className="text-center leading-[1.05]">
          <span className="block text-[28px] sm:text-[38px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{pkg.discountPct}%</span>
          <span className="block text-[28px] sm:text-[38px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>OFF</span>
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[0.06em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Package</span>
            <span className="text-[17px] sm:text-[18px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{pkg.name}</span>
          </div>
          <ul className="flex flex-col gap-1 pl-4 m-0" style={{ listStyle: 'disc' }}>
            {pkg.includes.map(inc => (
              <li key={inc.label} className="text-[12px] text-[var(--hz-ink)] leading-snug" style={{ fontFamily: FONT_BODY }}>
                <span className="font-semibold">{inc.label}:</span> {getPrimeItem(inc.itemId).title}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 sm:w-[140px] gap-3">
          <div className="text-left sm:text-right">
            <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
              <span className="line-through text-[var(--hz-ink-subtle)]">₹{originalPrice}</span> <span className="font-semibold text-[var(--hz-ink)]">₹{price}</span>
            </div>
            <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(durationMin)}</div>
          </div>
          <button onClick={onAdd} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
            {cartCount ? `Added ×${cartCount}` : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Editorial feature block — large visual section, no fake offers ───────

function EditorialFeature({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] flex items-center"
      style={{ minHeight: 200, background: 'linear-gradient(120deg, #FFF3EA 0%, var(--hz-primary-soft) 55%, #F9F5FF 100%)' }}
    >
      <div className="flex flex-col gap-3 px-6 sm:px-10 py-8 max-w-[420px]">
        <h2 className="text-[20px] sm:text-[26px] font-semibold text-[var(--hz-ink)] leading-[1.15] m-0" style={{ fontFamily: FONT_HEAD }}>Ready for Your Next Appointment</h2>
        <p className="text-[13px] sm:text-[14px] text-[var(--hz-ink-muted)] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
          Complete your routine with facials, waxing and finishing touches — all in one easy visit.
        </p>
        <button
          onClick={onExplore}
          className="self-start h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 mt-1"
          style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
        >
          Explore beauty services
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

export default function PrimeScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  // Id of the item whose options picker is currently open (see
  // OptionsModal) — null means no modal is showing.
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'prime',
      serviceId: entry.serviceId ?? entry.id,
      serviceName: entry.title,
      optionId: entry.optionId,
      optionName: entry.optionName,
      title: entry.title,
      duration: formatDuration(entry.durationMin),
      price: entry.price,
      originalPrice: entry.originalPrice,
    })
  }

  // A selected option becomes its own cart line — titled "Item — Option"
  // so the cart stays legible about exactly what was booked — then the
  // picker closes.
  const addOptionToCart = (item: PrimeLineItem, option: PrimeItemOption) => {
    addToCart({
      id: option.id,
      title: `${item.title} — ${option.label}`,
      price: option.price,
      originalPrice: option.originalPrice,
      durationMin: option.durationMin,
      serviceId: item.id,
      optionId: option.id,
      optionName: option.label,
    })
    setExpandedItemId(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`prime-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'prime',
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

              {/* 01 — Page context: same eyebrow + title treatment as
                  Salon Luxe, per explicit instruction. */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Women's Salon &amp; Spa</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Prime
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  {/* 02 — Hero */}
                  <HeroBanner onExplore={() => jumpToSection('waxing')} onViewPackages={() => jumpToSection('packages')} />

                  {/* 03 — Quick service navigation (category shortcuts) */}
                  <ServiceTabs onJump={jumpToSection} />

                  {/* Prime Packages — super saver / featured packages, near
                      the top of the page, above the individual catalogue
                      sections, matching the reference's own placement. */}
                  <div id="prime-section-packages" className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Prime Packages</h2>
                      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Curated combinations for a complete salon experience.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {PRIME_PACKAGES.map(pkg => (
                        <PackageCard
                          key={pkg.id}
                          pkg={pkg}
                          cartCount={cartCountForItem(pkg.id)}
                          onAdd={() => addToCart({ id: pkg.id, title: pkg.name, ...getPackageTotals(pkg) })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Popular services */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Popular services</h2>
                      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Easy-to-book beauty services for your everyday needs.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {POPULAR_ITEM_IDS.map(id => {
                        const item = getPrimeItem(id)
                        const section = PRIME_SECTIONS.find(s => s.items.some(i => i.id === id))!
                        return (
                          <LineItemRow
                            key={item.id}
                            item={item}
                            icon={section.icon}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Waxing → Korean Facial → Glow Rituals → Signature
                      Facials → Cleanup → Pedicure & Manicure → Threading &
                      Face Wax → Bleach, Detan & Massage — mirrors Salon
                      Luxe's own catalogue order exactly. */}
                  {PRIME_SECTIONS.map(section => (
                    <div key={section.id} id={`prime-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>

                      {section.id === 'glow-rituals' ? (
                        // Each item gets its own large banner directly above
                        // it, rather than one shared banner for the whole
                        // section — matching Salon Luxe's own Japanese
                        // Rituals treatment for this same slot.
                        <div className="flex flex-col gap-4">
                          {section.items.map(item => (
                            <div key={item.id} className="flex flex-col gap-3">
                              <CategoryBanner icon={section.icon} title={item.title} subtitle={item.blurb} />
                              <LineItemRow
                                item={item}
                                icon={section.icon}
                                cartCount={cartCountForItem(item.id)}
                                getCartCount={cartCountForItem}
                                onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <CategoryBanner icon={section.icon} title={section.label} subtitle={SECTION_SUBTITLES[section.id]} />
                          <div className="flex flex-col gap-3">
                            {section.items.map(item => (
                              <LineItemRow
                                key={item.id}
                                item={item}
                                icon={section.icon}
                                cartCount={cartCountForItem(item.id)}
                                getCartCount={cartCountForItem}
                                onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Featured editorial section */}
                  <EditorialFeature onExplore={() => jumpToSection('signature-facials')} />

                  {/* Additional Prime services */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>More for you</h2>
                      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>A few more everyday services worth adding on.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {MORE_FOR_YOU_ITEM_IDS.map(id => {
                        const item = getPrimeItem(id)
                        const section = PRIME_SECTIONS.find(s => s.items.some(i => i.id === id))!
                        return (
                          <LineItemRow
                            key={item.id}
                            item={item}
                            icon={section.icon}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right column — pinned on desktop, same as Salon Luxe */}
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

      {expandedItemId && (
        <OptionsModal
          item={getPrimeItem(expandedItemId)}
          icon={getPrimeItemIcon(expandedItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getPrimeItem(expandedItemId), option)}
          onClose={() => setExpandedItemId(null)}
        />
      )}
    </div>
  )
}
