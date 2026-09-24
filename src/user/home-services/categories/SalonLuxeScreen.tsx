// ─── Salon Luxe — detail/booking page ───────────────────────────────────
// Reached from HomeServicesScreen.tsx's Salon for Women popup, picking the
// "Luxe" tier. Matched section-by-section against the reference's actual
// category list (Super Saver Packages, Waxing, Korean Facial, Japanese
// Rituals, Signature Facials, Cleanup, Pedicure & Manicure, Threading &
// Face Wax, Bleach/Detan & Massage) — every one of those categories is
// now a real section here, each with its own real items and cart
// behaviour, restyled entirely in Houzeify's own design language (purple/
// cream tokens, Google Sans Flex / Open Sans, rounded-[Npx] cards) rather
// than the reference's black/gold Urban Company chrome, reusing the exact
// cart pattern already built for HozieHelp Gold/Standard (see that file's
// own header comment). Honest departures that remain from the reference:
//   - Trimmed each section's near-duplicate variants to a representative
//     set rather than a 1:1 catalogue clone — still the same real
//     category structure and shape, just not every SKU the reference
//     lists.
//   - The reference's own hero ("Japanese glow rituals / New launch") and
//     its named product-brand tags (RICA, Gold Tin, etc.) are real
//     marketing/brand creative for a real company — this page's top hero
//     keeps its own fresh Houzeify copy instead of reusing that title
//     (see HeroBanner), and the dedicated "Japanese Rituals" category
//     further down uses fresh names for its two rituals (Yuzu / Mochi-
//     soft) rather than the reference's campaign wording. Package
//     "includes" name this app's own services, never a real product
//     brand.
//   - Ratings/prices/durations are this app's own consistent demo values
//     (kept modest, not copied digit-for-digit from the reference), same
//     discipline as every other catalogue page in this app. Every
//     package's price/discount/duration is COMPUTED from its real
//     component items below (see getPackageTotals) — never a separate,
//     hand-typed figure that could drift out of sync with them.
//   - "Edit your package" has no real per-package item-swap configurator
//     behind it in this app (that's a whole separate flow the reference
//     hides behind the same button) — rather than fake a modal with no
//     real effect, it scrolls down to the real, working itemised
//     sections below so the homeowner can assemble the same combination
//     themselves, one real Add button at a time.
//   - No real photography exists for any of these categories or services
//     (unlike the Luxe/Prime tier photos one level up, which are real
//     supplied assets) — every line item and every category banner
//     (Waxing, Japanese Rituals, Pedicure & Manicure) uses the same
//     icon-on-gradient honesty as the rest of this app, sized up for the
//     banners rather than a fabricated stock photo. See CategoryBanner's
//     own comment.
// "Add" adds a line to the real cart built for this flow; "View Cart"
// hands off into the existing, real Checkout page (Screen 017), exactly
// like HozieHelp Gold/Standard's own cart already does.

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ServiceImage from '@/shared/components/ServiceImage'
import HIcon from '@/shared/components/HIcon'
import luxeHeroImg from '@/imports/Services icons/Salon-for-Women-real1.png'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Icons ──────────────────────────────────────────────────────────────

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L4 8l6 5"/></svg>
)
const IcoCart = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2.5h1.6L6.3 13h9L17.3 5.8H4.7" />
    <circle cx="7.2" cy="16.5" r="1.2" />
    <circle cx="14" cy="16.5" r="1.2" />
  </svg>
)
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2a6 6 0 016 6v2.5l1.5 3h-15L4 10.5V8a6 6 0 016-6z"/>
    <path d="M8 16a2 2 0 004 0"/>
  </svg>
)
const IcoStar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor"><path d="M6 0.8l1.5 3.3 3.6.4-2.7 2.5.7 3.6L6 8.8 2.9 10.6l.7-3.6L.9 4.5l3.6-.4L6 .8Z"/></svg>
)
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--hz-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5"/></svg>
)
const IcoBolt = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M6.5 0.5L1.5 7h3.2l-.8 4.5L9.5 5H6.3l.2-4.5Z"/></svg>
)
const IcoShield = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" stroke="var(--hz-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3.5l8 3v5.5c0 5-3.4 8.7-8 10.5-4.6-1.8-8-5.5-8-10.5V6.5l8-3Z"/>
    <path d="M9.5 13l2.5 2.5 5-5"/>
  </svg>
)

// One honest, representative icon per section — never a fabricated photo
// per individual service (see header comment).
const IcoWaxStrip = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="14" height="8" rx="2"/>
    <path d="M13 6c1.5-2 3-2.5 4-1.5"/>
  </svg>
)
const IcoThreading = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="2.5"/>
    <path d="M8 8l8 8M13 12l3 3"/>
  </svg>
)
const IcoFacial = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7"/>
    <path d="M7.2 9h.01M12.8 9h.01M7.5 13c1 1 4 1 5 0"/>
  </svg>
)
const IcoNailPolish = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3h4v3l1.5 2v8a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 016.5 16V8L8 6V3z"/>
    <path d="M8 3h4"/>
  </svg>
)
const IcoDetan = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5s5 6.2 5 9.8a5 5 0 01-10 0C5 8.7 10 2.5 10 2.5z"/>
  </svg>
)
const IcoPackage = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="14" height="10" rx="1.5"/>
    <path d="M3 7l7-4 7 4M10 7v10"/>
  </svg>
)
const IcoSparkle = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14l-1.6-4.4L4 8l4.4-1.6L10 2Z"/>
  </svg>
)
const IcoFacialGlow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="11" r="6"/>
    <path d="M7 10h.01M11 10h.01M7.5 13.5c1 1 3.5 1 4.5 0"/>
    <path d="M15 4l.8 2.2L18 7l-2.2.8L15 10l-.8-2.2L12 7l2.2-.8L15 4Z"/>
  </svg>
)
const IcoCleanupBubbles = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="12" r="4.5"/>
    <circle cx="14" cy="7" r="2.5"/>
  </svg>
)
const IcoFoot = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 17.5c-1.7 0-3-1.2-3-3.2 0-2 .9-3 .9-5.3 0-2.5-1.1-3-1.1-5A2.5 2.5 0 017.3 1.5c2 0 2.7 1.7 2.9 3.3.3 2.5 1.8 4 3.4 5.6 1.3 1.3 2.4 2.7 2.4 4.4 0 1.6-1.3 2.7-3 2.7-2.2 0-2.7-1.2-5-1.2Z"/>
  </svg>
)
// Close (×) icon for the options picker modal below.
const IcoCloseX = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5l10 10M15 5L5 15"/>
  </svg>
)
// Small check mark for the "selected option" tag on a line item card —
// currentColor (not hardcoded like IcoCheck above) so it can be tinted
// green to read as a confirmed selection.
const IcoCheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.3L5.3 10L11.5 3.5"/>
  </svg>
)
// Chevron for the package customiser's "[Selected type ▼]" buttons.
const IcoChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 4.5L6 8L9.5 4.5"/>
  </svg>
)
// mm:ss-free, human duration text ("30 mins" / "1 hr" / "2 hrs 30 mins") —
// the one place duration text is generated, so a package's summed
// duration and a single item's own duration always read the same way.
function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} mins`
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`
  return `${h} hr${h > 1 ? 's' : ''} ${m} mins`
}

// ─── Data ───────────────────────────────────────────────────────────────

/** One selectable variant under an item that has more than one way to
 *  book it (a wax type, a body area, a duration, etc.) — same idea as
 *  HozieHelp Gold/Standard's own DurationOption, just for this file's
 *  simpler "pick one, add it" case (no Later/subscription-plan combos). */
interface SalonItemOption {
  id: string
  label: string
  price: number
  originalPrice: number
  durationMin: number
}

interface SalonLineItem {
  id: string
  title: string
  rating: string
  price: number
  originalPrice: number
  durationMin: number
  /** Short "what's included" line — real informational content (not
   *  decorative), same idea as the reference's own bullet under each
   *  item, just one line instead of a list. */
  blurb: string
  /** When present, "Add" opens a picker of these instead of adding this
   *  item directly — this item's own price/duration above become its
   *  "starting from" figures (its cheapest option), same convention as
   *  HozieHelp's own options items. */
  options?: SalonItemOption[]
}

interface SalonSection {
  id: string
  label: string
  icon: React.ReactNode
  items: SalonLineItem[]
}

const SALON_LUXE_SECTIONS: SalonSection[] = [
  {
    id: 'waxing',
    label: 'Waxing',
    icon: <IcoWaxStrip />,
    items: [
      { id: 'wax-spatula', title: 'Spatula Waxing', rating: '4.8 (860 reviews)', price: 449, originalPrice: 599, durationMin: 45, blurb: 'Full arms, legs & underarms with spatula wax', options: [
        { id: 'wax-spatula-classic', label: 'Classic Wax', price: 449, originalPrice: 599, durationMin: 45 },
        { id: 'wax-spatula-chocolate', label: 'Chocolate Wax', price: 499, originalPrice: 649, durationMin: 45 },
        { id: 'wax-spatula-honey', label: 'Honey Wax', price: 479, originalPrice: 629, durationMin: 45 },
      ] },
      { id: 'wax-rollon', title: 'Roll-on Waxing', rating: '4.8 (720 reviews)', price: 399, originalPrice: 549, durationMin: 40, blurb: 'Full arms, legs & underarms with roll-on wax' },
      { id: 'wax-arms', title: 'Full Arms & Underarms Waxing', rating: '4.8 (1.1K reviews)', price: 249, originalPrice: 349, durationMin: 30, blurb: 'Covers full arms, including underarms', options: [
        { id: 'wax-arms-classic', label: 'Classic Wax', price: 249, originalPrice: 349, durationMin: 30 },
        { id: 'wax-arms-chocolate', label: 'Chocolate Wax', price: 279, originalPrice: 389, durationMin: 30 },
        { id: 'wax-arms-honey', label: 'Honey Wax', price: 269, originalPrice: 379, durationMin: 30 },
        { id: 'wax-arms-rollon', label: 'Roll-on Wax', price: 259, originalPrice: 359, durationMin: 25 },
        { id: 'wax-arms-strip', label: 'Strip Wax', price: 239, originalPrice: 329, durationMin: 25 },
        { id: 'wax-arms-sugar', label: 'Sugar Wax', price: 289, originalPrice: 399, durationMin: 35 },
        { id: 'wax-arms-fruit', label: 'Fruit Wax', price: 279, originalPrice: 389, durationMin: 30 },
      ] },
      { id: 'wax-legs', title: 'Full Legs Waxing', rating: '4.8 (980 reviews)', price: 299, originalPrice: 399, durationMin: 40, blurb: 'Covers full legs, including feet', options: [
        { id: 'wax-legs-classic', label: 'Classic Wax', price: 299, originalPrice: 399, durationMin: 40 },
        { id: 'wax-legs-chocolate', label: 'Chocolate Wax', price: 339, originalPrice: 449, durationMin: 40 },
        { id: 'wax-legs-honey', label: 'Honey Wax', price: 319, originalPrice: 429, durationMin: 40 },
        { id: 'wax-legs-rollon', label: 'Roll-on Wax', price: 309, originalPrice: 419, durationMin: 35 },
        { id: 'wax-legs-strip', label: 'Strip Wax', price: 289, originalPrice: 389, durationMin: 35 },
        { id: 'wax-legs-sugar', label: 'Sugar Wax', price: 349, originalPrice: 459, durationMin: 45 },
        { id: 'wax-legs-fruit', label: 'Fruit Wax', price: 329, originalPrice: 439, durationMin: 40 },
      ] },
      { id: 'wax-half-legs', title: 'Half Legs Waxing', rating: '4.8 (610 reviews)', price: 199, originalPrice: 269, durationMin: 20, blurb: 'Covers legs from knee to ankle', options: [
        { id: 'wax-half-legs-classic', label: 'Classic Wax', price: 199, originalPrice: 269, durationMin: 20 },
        { id: 'wax-half-legs-chocolate', label: 'Chocolate Wax', price: 229, originalPrice: 299, durationMin: 20 },
        { id: 'wax-half-legs-honey', label: 'Honey Wax', price: 219, originalPrice: 289, durationMin: 20 },
        { id: 'wax-half-legs-rollon', label: 'Roll-on Wax', price: 209, originalPrice: 279, durationMin: 18 },
      ] },
      { id: 'wax-back', title: 'Back Waxing', rating: '4.7 (340 reviews)', price: 349, originalPrice: 469, durationMin: 30, blurb: 'Covers the area from shoulders to the pelvis', options: [
        { id: 'wax-back-classic', label: 'Classic Wax', price: 349, originalPrice: 469, durationMin: 30 },
        { id: 'wax-back-chocolate', label: 'Chocolate Wax', price: 389, originalPrice: 519, durationMin: 30 },
        { id: 'wax-back-honey', label: 'Honey Wax', price: 369, originalPrice: 499, durationMin: 30 },
        { id: 'wax-back-rollon', label: 'Roll-on Wax', price: 359, originalPrice: 479, durationMin: 28 },
        { id: 'wax-back-strip', label: 'Strip Wax', price: 339, originalPrice: 449, durationMin: 28 },
        { id: 'wax-back-sugar', label: 'Sugar Wax', price: 399, originalPrice: 529, durationMin: 35 },
        { id: 'wax-back-fruit', label: 'Fruit Wax', price: 379, originalPrice: 509, durationMin: 30 },
      ] },
      { id: 'wax-stomach', title: 'Stomach Waxing', rating: '4.7 (290 reviews)', price: 249, originalPrice: 329, durationMin: 20, blurb: 'Covers the area below the bust to the pelvis', options: [
        { id: 'wax-stomach-classic', label: 'Classic Wax', price: 249, originalPrice: 329, durationMin: 20 },
        { id: 'wax-stomach-chocolate', label: 'Chocolate Wax', price: 279, originalPrice: 369, durationMin: 20 },
        { id: 'wax-stomach-honey', label: 'Honey Wax', price: 269, originalPrice: 359, durationMin: 20 },
        { id: 'wax-stomach-rollon', label: 'Roll-on Wax', price: 259, originalPrice: 349, durationMin: 18 },
        { id: 'wax-stomach-strip', label: 'Strip Wax', price: 239, originalPrice: 319, durationMin: 18 },
        { id: 'wax-stomach-sugar', label: 'Sugar Wax', price: 289, originalPrice: 379, durationMin: 25 },
        { id: 'wax-stomach-fruit', label: 'Fruit Wax', price: 279, originalPrice: 369, durationMin: 20 },
      ] },
      { id: 'wax-bikini', title: 'Bikini Waxing', rating: '4.8 (455 reviews)', price: 349, originalPrice: 469, durationMin: 25, blurb: 'Covers the full pubic area (buttocks not included)', options: [
        { id: 'wax-bikini-classic', label: 'Classic Wax', price: 349, originalPrice: 469, durationMin: 25 },
        { id: 'wax-bikini-chocolate', label: 'Chocolate Wax', price: 399, originalPrice: 529, durationMin: 25 },
      ] },
      { id: 'wax-butt', title: 'Butt Waxing', rating: '4.7 (210 reviews)', price: 249, originalPrice: 329, durationMin: 20, blurb: 'Covers the buttocks; bikini line not included', options: [
        { id: 'wax-butt-classic', label: 'Classic Wax', price: 249, originalPrice: 329, durationMin: 20 },
        { id: 'wax-butt-chocolate', label: 'Chocolate Wax', price: 279, originalPrice: 369, durationMin: 20 },
        { id: 'wax-butt-honey', label: 'Honey Wax', price: 269, originalPrice: 359, durationMin: 20 },
      ] },
      { id: 'wax-bikini-line', title: 'Bikini Line Waxing', rating: '4.7 (380 reviews)', price: 179, originalPrice: 239, durationMin: 15, blurb: 'Covers the area around the pelvis, not the pubic area', options: [
        { id: 'wax-bikini-line-classic', label: 'Classic Wax', price: 179, originalPrice: 239, durationMin: 15 },
        { id: 'wax-bikini-line-chocolate', label: 'Chocolate Wax', price: 199, originalPrice: 269, durationMin: 15 },
      ] },
      { id: 'wax-underarms', title: 'Underarms Waxing', rating: '4.8 (930 reviews)', price: 99, originalPrice: 139, durationMin: 10, blurb: 'Quick underarm clean-up', options: [
        { id: 'wax-underarms-classic', label: 'Classic Wax', price: 99, originalPrice: 139, durationMin: 10 },
        { id: 'wax-underarms-rollon', label: 'Roll-on Wax', price: 109, originalPrice: 149, durationMin: 10 },
      ] },
      { id: 'wax-full-body', title: 'Full Body Waxing', rating: '4.9 (410 reviews)', price: 899, originalPrice: 1299, durationMin: 90, blurb: 'Covers arms, legs, back & underarms', options: [
        { id: 'wax-full-body-classic', label: 'Classic Wax', price: 899, originalPrice: 1299, durationMin: 90 },
        { id: 'wax-full-body-chocolate', label: 'Chocolate Wax', price: 999, originalPrice: 1399, durationMin: 95 },
        { id: 'wax-full-body-honey', label: 'Honey Wax', price: 949, originalPrice: 1349, durationMin: 90 },
        { id: 'wax-full-body-rollon', label: 'Roll-on Wax', price: 929, originalPrice: 1329, durationMin: 85 },
      ] },
    ],
  },
  {
    id: 'korean-facial',
    label: 'Korean Facial',
    icon: <IcoFacial />,
    items: [
      { id: 'facial-korean-glass-skin', title: 'Korean Glass Skin Facial', rating: '4.9 (410 reviews)', price: 999, originalPrice: 1399, durationMin: 60, blurb: 'Multi-step routine for dewy, glass-like skin' },
      { id: 'facial-glow-renewal', title: 'Glow Renewal Facial', rating: '4.8 (300 reviews)', price: 799, originalPrice: 1099, durationMin: 50, blurb: 'Gentle exfoliation for renewed radiance' },
      { id: 'facial-sea-algae-hydration', title: 'Sea-Algae Hydration Facial', rating: '4.8 (255 reviews)', price: 899, originalPrice: 1249, durationMin: 55, blurb: 'Algae-infused mask for deep hydration' },
    ],
  },
  {
    id: 'japanese-rituals',
    label: 'Japanese Rituals',
    icon: <IcoSparkle />,
    items: [
      { id: 'ritual-yuzu-glow', title: 'Glass-Skin Glow with Yuzu', rating: '4.9 (180 reviews)', price: 1099, originalPrice: 1499, durationMin: 60, blurb: 'A citrus-bright ritual for a luminous glow' },
      { id: 'ritual-mochi-soft', title: 'Mochi-Soft, Bouncy Skin Ritual', rating: '4.9 (150 reviews)', price: 1199, originalPrice: 1599, durationMin: 65, blurb: 'A deeply nourishing ritual for soft, bouncy-feeling skin' },
    ],
  },
  {
    id: 'signature-facials',
    label: 'Signature Facials',
    icon: <IcoFacialGlow />,
    items: [
      { id: 'facial-radiance-renewal', title: 'Radiance Renewal Facial', rating: '4.7 (380 reviews)', price: 749, originalPrice: 1049, durationMin: 50, blurb: 'Restores natural radiance with active serums' },
      { id: 'facial-brightening', title: 'Brightening Facial', rating: '4.7 (455 reviews)', price: 699, originalPrice: 999, durationMin: 50, blurb: 'Deep cleanse for an instant glow' },
      { id: 'facial-complexion-polish', title: 'Complexion Polish Facial', rating: '4.7 (240 reviews)', price: 649, originalPrice: 899, durationMin: 45, blurb: 'Gentle polish for an even-toned complexion' },
      { id: 'facial-oil-control', title: 'Oil-Control Facial', rating: '4.6 (295 reviews)', price: 599, originalPrice: 849, durationMin: 45, blurb: 'Balances oily and combination skin' },
      { id: 'facial-multi-peptide', title: 'Multi-Peptide Renewal Facial', rating: '4.8 (165 reviews)', price: 1299, originalPrice: 1799, durationMin: 65, blurb: 'Peptide-rich treatment for firmer-looking skin' },
      { id: 'facial-age-defence', title: 'Age-Defence Facial', rating: '4.8 (190 reviews)', price: 1199, originalPrice: 1649, durationMin: 60, blurb: 'Targets fine lines for a smoother-looking finish' },
      { id: 'facial-hydration', title: 'Hydration Facial', rating: '4.7 (410 reviews)', price: 699, originalPrice: 949, durationMin: 45, blurb: 'Replenishes moisture for soft, supple skin' },
      { id: 'facial-deep-hydration', title: 'Deep Hydration Facial', rating: '4.7 (260 reviews)', price: 899, originalPrice: 1199, durationMin: 55, blurb: 'Intensive hydration for very dry skin' },
      { id: 'facial-kumkumadi-glow', title: 'Kumkumadi Glow Facial', rating: '4.8 (335 reviews)', price: 999, originalPrice: 1349, durationMin: 55, blurb: 'Ayurvedic kumkumadi oil for a natural glow' },
      { id: 'facial-gold-radiance', title: 'Gold Radiance Facial', rating: '4.8 (390 reviews)', price: 899, originalPrice: 1299, durationMin: 60, blurb: 'Brightening facial with a gold-infused cream' },
      { id: 'facial-radiance-luxury', title: 'Radiance Luxury Facial', rating: '4.9 (140 reviews)', price: 1499, originalPrice: 1999, durationMin: 75, blurb: "Salon Luxe's most indulgent facial, top to toe" },
    ],
  },
  {
    id: 'cleanup',
    label: 'Cleanup',
    icon: <IcoCleanupBubbles />,
    items: [
      { id: 'facial-fruit-cleanup', title: 'Fruit Cleanup', rating: '4.7 (620 reviews)', price: 399, originalPrice: 549, durationMin: 40, blurb: 'Gentle cleanup with a fruit-based scrub' },
      { id: 'cleanup-hydra-glow', title: 'Hydra Glow Cleanup', rating: '4.7 (350 reviews)', price: 449, originalPrice: 599, durationMin: 40, blurb: 'Hydrating cleanup for a fresh, dewy look' },
      { id: 'cleanup-detox-mud', title: 'Detox Mud Cleanup', rating: '4.6 (275 reviews)', price: 499, originalPrice: 679, durationMin: 45, blurb: 'Mud-based cleanup to draw out impurities' },
      { id: 'cleanup-hydra-boost', title: 'Hydra-Boost Cleanup', rating: '4.7 (200 reviews)', price: 469, originalPrice: 629, durationMin: 40, blurb: 'Boosts hydration while gently cleansing' },
      { id: 'cleanup-brightening', title: 'Brightening Cleanup', rating: '4.6 (315 reviews)', price: 429, originalPrice: 579, durationMin: 40, blurb: 'Gentle cleanup for brighter-looking skin' },
    ],
  },
  {
    id: 'mani-pedi',
    label: 'Pedicure & Manicure',
    icon: <IcoNailPolish />,
    items: [
      { id: 'mani-pedi-signature-combo', title: 'Signature Mani-Pedi Combo', rating: '4.9 (240 reviews)', price: 999, originalPrice: 1349, durationMin: 100, blurb: "Salon Luxe's most complete mani-pedi experience" },
      { id: 'pedicure-classic', title: 'Classic Pedicure', rating: '4.8 (860 reviews)', price: 399, originalPrice: 549, durationMin: 45, blurb: 'Soak, scrub, buff & polish' },
      { id: 'pedicure-icecream', title: 'Ice-Cream Delight Pedicure', rating: '4.8 (300 reviews)', price: 549, originalPrice: 749, durationMin: 55, blurb: 'A fun, dessert-inspired pampering pedicure' },
      { id: 'pedicure-crystal-spa', title: 'Crystal Spa Pedicure', rating: '4.8 (220 reviews)', price: 649, originalPrice: 899, durationMin: 60, blurb: 'Crystal-infused spa pedicure for tired feet', options: [
        { id: 'pedicure-crystal-spa-rose', label: 'Crystal Rose', price: 649, originalPrice: 899, durationMin: 60 },
        { id: 'pedicure-crystal-spa-luxury', label: 'Luxury Spa', price: 749, originalPrice: 999, durationMin: 70 },
      ] },
      { id: 'pedicure-cut-file-polish', title: 'Cut, File & Polish — Feet', rating: '4.7 (390 reviews)', price: 249, originalPrice: 329, durationMin: 25, blurb: 'A quick, no-fuss pedicure essential' },
      { id: 'manicure-classic', title: 'Classic Manicure', rating: '4.8 (710 reviews)', price: 349, originalPrice: 499, durationMin: 40, blurb: 'Soak, scrub, buff & polish' },
      { id: 'manicure-icecream', title: 'Ice-Cream Delight Manicure', rating: '4.8 (265 reviews)', price: 449, originalPrice: 599, durationMin: 45, blurb: 'A fun, dessert-inspired pampering manicure' },
      { id: 'manicure-sea-algae', title: 'Sea-Algae Manicure', rating: '4.7 (185 reviews)', price: 549, originalPrice: 749, durationMin: 50, blurb: 'Algae-infused manicure for soft hands' },
      { id: 'manicure-cut-file-polish', title: 'Cut, File & Polish — Hands', rating: '4.7 (410 reviews)', price: 199, originalPrice: 269, durationMin: 20, blurb: 'A quick, no-fuss manicure essential' },
      { id: 'mani-pedi-combo', title: 'Spa Pedicure & Manicure Combo', rating: '4.9 (320 reviews)', price: 799, originalPrice: 1099, durationMin: 90, blurb: 'Classic pedicure and manicure, together' },
    ],
  },
  {
    id: 'threading-face-wax',
    label: 'Threading & Face Wax',
    icon: <IcoThreading />,
    items: [
      { id: 'thread-general', title: 'Threading', rating: '4.9 (1.8K reviews)', price: 29, originalPrice: 49, durationMin: 5, blurb: 'Pick the area — brows, lip, chin & more', options: [
        { id: 'thread-general-eyebrows', label: 'Eyebrows', price: 49, originalPrice: 79, durationMin: 10 },
        { id: 'thread-general-upperlip', label: 'Upper Lip', price: 29, originalPrice: 49, durationMin: 5 },
        { id: 'thread-general-chin', label: 'Chin', price: 29, originalPrice: 49, durationMin: 5 },
        { id: 'thread-general-forehead', label: 'Forehead', price: 29, originalPrice: 49, durationMin: 5 },
        { id: 'thread-general-eyebrows-upperlip', label: 'Eyebrows + Upper Lip', price: 69, originalPrice: 109, durationMin: 12 },
        { id: 'thread-general-neck', label: 'Neck', price: 39, originalPrice: 59, durationMin: 8 },
        { id: 'thread-general-sidelocks', label: 'Side Locks', price: 29, originalPrice: 49, durationMin: 5 },
        { id: 'thread-general-fullface', label: 'Full Face', price: 99, originalPrice: 149, durationMin: 20 },
      ] },
      { id: 'thread-eyebrow', title: 'Eyebrow Threading', rating: '4.9 (2.3K reviews)', price: 49, originalPrice: 79, durationMin: 10, blurb: 'Shapes and cleans up the brow line' },
      { id: 'thread-upperlip', title: 'Upper Lip Threading', rating: '4.9 (2.0K reviews)', price: 29, originalPrice: 49, durationMin: 5, blurb: 'Quick upper-lip clean-up' },
      { id: 'thread-face', title: 'Full Face Threading', rating: '4.8 (740 reviews)', price: 99, originalPrice: 149, durationMin: 20, blurb: 'Eyebrows, upper lip & chin' },
      { id: 'wax-full-face', title: 'Premium Face Wax', rating: '4.7 (260 reviews)', price: 79, originalPrice: 109, durationMin: 10, blurb: 'Gentle face waxing for smooth, hair-free skin', options: [
        { id: 'wax-full-face-upperlip', label: 'Upper Lip Wax', price: 79, originalPrice: 109, durationMin: 10 },
        { id: 'wax-full-face-chin', label: 'Chin Wax', price: 79, originalPrice: 109, durationMin: 10 },
        { id: 'wax-full-face-forehead', label: 'Forehead Wax', price: 79, originalPrice: 109, durationMin: 10 },
        { id: 'wax-full-face-cheeks', label: 'Cheeks Wax', price: 99, originalPrice: 139, durationMin: 12 },
        { id: 'wax-full-face-classic', label: 'Full Face Wax — Classic', price: 149, originalPrice: 199, durationMin: 20 },
        { id: 'wax-full-face-chocolate', label: 'Full Face Wax — Chocolate', price: 179, originalPrice: 239, durationMin: 20 },
        { id: 'wax-full-face-honey', label: 'Full Face Wax — Honey', price: 169, originalPrice: 229, durationMin: 20 },
      ] },
    ],
  },
  {
    id: 'bleach-detan-massage',
    label: 'Bleach, Detan & Massage',
    icon: <IcoDetan />,
    items: [
      { id: 'bleach-face', title: 'Bleach', rating: '4.7 (540 reviews)', price: 199, originalPrice: 279, durationMin: 20, blurb: 'Instant brightening, no redness — pick the area', options: [
        { id: 'bleach-face-face', label: 'Face', price: 199, originalPrice: 279, durationMin: 20 },
        { id: 'bleach-face-arms', label: 'Full Arms', price: 249, originalPrice: 329, durationMin: 25 },
        { id: 'bleach-face-legs', label: 'Full Legs', price: 279, originalPrice: 369, durationMin: 30 },
        { id: 'bleach-face-back', label: 'Back', price: 269, originalPrice: 359, durationMin: 25 },
        { id: 'bleach-face-stomach', label: 'Stomach', price: 229, originalPrice: 309, durationMin: 20 },
        { id: 'bleach-face-fullbody', label: 'Full Body', price: 599, originalPrice: 799, durationMin: 60 },
      ] },
      { id: 'detan-full-body', title: 'Detan', rating: '4.8 (300 reviews)', price: 249, originalPrice: 349, durationMin: 20, blurb: 'Removes tan — pick the area', options: [
        { id: 'detan-full-body-face', label: 'Face', price: 249, originalPrice: 349, durationMin: 20 },
        { id: 'detan-full-body-arms', label: 'Full Arms', price: 349, originalPrice: 469, durationMin: 30 },
        { id: 'detan-full-body-legs', label: 'Full Legs', price: 399, originalPrice: 529, durationMin: 35 },
        { id: 'detan-full-body-back', label: 'Back', price: 349, originalPrice: 469, durationMin: 30 },
        { id: 'detan-full-body-stomach', label: 'Stomach', price: 299, originalPrice: 399, durationMin: 25 },
        { id: 'detan-full-body-fullbody', label: 'Full Body', price: 699, originalPrice: 999, durationMin: 60 },
      ] },
      { id: 'massage-head', title: 'Head Massage', rating: '4.8 (410 reviews)', price: 349, originalPrice: 469, durationMin: 30, blurb: 'A relaxing head massage to ease tension', options: [
        { id: 'massage-head-30', label: '30 mins', price: 349, originalPrice: 469, durationMin: 30 },
        { id: 'massage-head-45', label: '45 mins', price: 449, originalPrice: 599, durationMin: 45 },
      ] },
      { id: 'massage-foot', title: 'Foot Massage', rating: '4.7 (300 reviews)', price: 399, originalPrice: 529, durationMin: 30, blurb: 'A soothing massage to relax tired feet' },
    ],
  },
]

const ALL_SALON_ITEMS = SALON_LUXE_SECTIONS.flatMap(s => s.items)
function getSalonItem(id: string): SalonLineItem {
  const item = ALL_SALON_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown salon item id: ${id}`)
  return item
}
/** This item's own section icon — the same visual every LineItemRow
 *  already shows for it, reused on its options picker too. */
function getSalonItemIcon(id: string): React.ReactNode {
  return SALON_LUXE_SECTIONS.find(s => s.items.some(i => i.id === id))?.icon
}

// ─── Super saver packages — bundles of the real items above, at a
// discount, matching the reference's own "Super saver packages" section
// (see this file's header comment for what's kept honest about it). ──────

interface SalonPackage {
  id: string
  name: string
  rating: string
  discountPct: number
  /** What the bundle includes, as {label, itemId} — the display name for
   *  each line is the REAL item's own title, read live off
   *  SALON_LUXE_SECTIONS, never a second hand-typed copy of it. */
  includes: { label: string; itemId: string }[]
}

const SALON_LUXE_PACKAGES: SalonPackage[] = [
  {
    id: 'pkg-monthly-maintenance',
    name: 'Monthly Maintenance Package',
    rating: '4.9 (410 reviews)',
    discountPct: 10,
    includes: [
      { label: 'Cleanup', itemId: 'facial-fruit-cleanup' },
      { label: 'Waxing — arms', itemId: 'wax-arms' },
      { label: 'Waxing — legs', itemId: 'wax-legs' },
      { label: 'Facial hair removal', itemId: 'thread-eyebrow' },
    ],
  },
  {
    id: 'pkg-wax-glow',
    name: 'Wax & Glow Package',
    rating: '4.9 (365 reviews)',
    discountPct: 15,
    includes: [
      { label: 'Waxing — arms', itemId: 'wax-arms' },
      { label: 'Waxing — legs', itemId: 'wax-legs' },
      { label: 'Facial hair removal', itemId: 'thread-eyebrow' },
      { label: 'Facial', itemId: 'facial-brightening' },
    ],
  },
  {
    id: 'pkg-build-your-own',
    name: 'Build Your Own Package',
    rating: '4.9 (280 reviews)',
    discountPct: 20,
    includes: [
      { label: 'Waxing — arms', itemId: 'wax-arms' },
      { label: 'Waxing — legs', itemId: 'wax-legs' },
      { label: 'Facial & cleanup', itemId: 'facial-brightening' },
      { label: 'Manicure', itemId: 'manicure-classic' },
      { label: 'Pedicure', itemId: 'pedicure-classic' },
      { label: 'Facial hair removal', itemId: 'thread-eyebrow' },
    ],
  },
]

// Every package's price/discount/duration is computed from its real
// component items — never a separate, hand-typed figure that could drift
// out of sync with the individual service prices shown further down.
function getPackageTotals(pkg: SalonPackage) {
  const items = pkg.includes.map(inc => getSalonItem(inc.itemId))
  const originalPrice = items.reduce((sum, i) => sum + i.originalPrice, 0)
  const durationMin = items.reduce((sum, i) => sum + i.durationMin, 0)
  const price = Math.round(originalPrice * (1 - pkg.discountPct / 100))
  return { originalPrice, price, durationMin }
}

// ─── Monthly Maintenance Package customiser ────────────────────────────
// A dedicated "Edit your package" flow for the Monthly Maintenance
// Package card only — every other package still uses the plain
// scroll-to-the-list "Edit your package" behaviour above. Every choice
// below is either a REAL catalogue item/option (Cleanup, Mani-pedi, and
// every waxing "type" — waxing reuses each area's own real .options
// array rather than a second, parallel wax-type naming scheme) or, for
// the handful of facial-hair-removal area × method combinations the
// catalogue has no entry for at all (Jawline, and Neck/Sidelocks' wax
// option), a freshly authored price scaled consistently with its
// nearest real neighbour — this file's own established "original
// demo-data" convention, never a fabricated rating or discount.

interface PkgChoice {
  id: string
  title: string
  price: number
  originalPrice: number
  durationMin: number
}

const PKG_CLEANUP_CHOICES: PkgChoice[] = [
  { id: 'cleanup-hydra-glow', title: 'Hydra Glow Cleanup', price: 449, originalPrice: 599, durationMin: 40 },
  { id: 'cleanup-hydra-boost', title: 'Hydra-Boost Cleanup', price: 469, originalPrice: 629, durationMin: 40 },
  { id: 'cleanup-brightening', title: 'Brightening Cleanup', price: 429, originalPrice: 579, durationMin: 40 },
  { id: 'cleanup-detox-mud', title: 'Detox Mud Cleanup', price: 499, originalPrice: 679, durationMin: 45 },
]

const PKG_MANI_PEDI_CHOICES: PkgChoice[] = [
  { id: 'pedicure-cut-file-polish', title: 'Cut, File & Polish — Feet', price: 249, originalPrice: 329, durationMin: 25 },
  { id: 'manicure-cut-file-polish', title: 'Cut, File & Polish — Hands', price: 199, originalPrice: 269, durationMin: 20 },
  { id: 'mani-pedi-signature-combo', title: 'Signature Mani-Pedi Combo', price: 999, originalPrice: 1349, durationMin: 100 },
]

/** A waxing area IS a real SalonLineItem — its own `options` array (see
 *  the Waxing section above) already lists the real wax types with real
 *  prices, so the "choose the type of waxing" sub-picker just reads
 *  `getSalonItem(id).options` directly instead of a second data set. */
interface PkgWaxArea {
  id: string
  title: string
}
const PKG_WAX_AREAS: PkgWaxArea[] = [
  { id: 'wax-arms', title: 'Full Arms & Underarms' },
  { id: 'wax-back', title: 'Back' },
  { id: 'wax-stomach', title: 'Stomach' },
  { id: 'wax-half-legs', title: 'Half Legs' },
  { id: 'wax-legs', title: 'Full Legs' },
  { id: 'wax-underarms', title: 'Underarms' },
  { id: 'wax-bikini-line', title: 'Bikini Line' },
  { id: 'wax-bikini', title: 'Bikini' },
  { id: 'wax-full-body', title: 'Full Body' },
]

interface PkgFaceMethod {
  id: string
  label: string
  price: number
  originalPrice: number
  durationMin: number
}
interface PkgFaceArea {
  id: string
  title: string
  methods: PkgFaceMethod[]
}
// Threading prices/durations below are the real thread-eyebrow /
// thread-upperlip / thread-face items and thread-general's own
// chin/forehead/neck/side-locks options (see the Threading & Face Wax
// section above); Face Wax prices are the real wax-full-face options.
// Jawline and Neck/Sidelocks' wax are the only entries with no real
// catalogue counterpart at all — see this section's header comment.
const PKG_FACE_AREAS: PkgFaceArea[] = [
  { id: 'face-upperlip', title: 'Upper Lip', methods: [
    { id: 'face-upperlip-threading', label: 'Precision Threading', price: 29, originalPrice: 49, durationMin: 5 },
    { id: 'face-upperlip-wax', label: 'Gentle Face Wax', price: 79, originalPrice: 109, durationMin: 10 },
  ] },
  { id: 'face-chin', title: 'Chin', methods: [
    { id: 'face-chin-threading', label: 'Precision Threading', price: 29, originalPrice: 49, durationMin: 5 },
    { id: 'face-chin-wax', label: 'Gentle Face Wax', price: 79, originalPrice: 109, durationMin: 10 },
  ] },
  { id: 'face-forehead', title: 'Forehead', methods: [
    { id: 'face-forehead-threading', label: 'Precision Threading', price: 29, originalPrice: 49, durationMin: 5 },
    { id: 'face-forehead-wax', label: 'Gentle Face Wax', price: 79, originalPrice: 109, durationMin: 10 },
  ] },
  { id: 'face-fullface', title: 'Full Face', methods: [
    { id: 'face-fullface-threading', label: 'Precision Threading', price: 99, originalPrice: 149, durationMin: 20 },
    { id: 'face-fullface-wax', label: 'Gentle Face Wax', price: 149, originalPrice: 199, durationMin: 20 },
  ] },
  { id: 'face-jawline', title: 'Jawline', methods: [
    { id: 'face-jawline-wax', label: 'Gentle Face Wax', price: 89, originalPrice: 119, durationMin: 12 },
  ] },
  { id: 'face-neck', title: 'Neck', methods: [
    { id: 'face-neck-threading', label: 'Precision Threading', price: 39, originalPrice: 59, durationMin: 8 },
    { id: 'face-neck-wax', label: 'Gentle Face Wax', price: 99, originalPrice: 129, durationMin: 14 },
  ] },
  { id: 'face-sidelocks', title: 'Sidelocks', methods: [
    { id: 'face-sidelocks-threading', label: 'Precision Threading', price: 29, originalPrice: 49, durationMin: 5 },
  ] },
  { id: 'face-eyebrows', title: 'Eyebrows', methods: [
    // Face wax is deliberately not offered here — the catalogue has no
    // eyebrow-waxing item, and the work order calls that out explicitly.
    { id: 'face-eyebrows-threading', label: 'Precision Threading', price: 49, originalPrice: 79, durationMin: 10 },
  ] },
]
function faceMethodNote(label: string): string {
  return label === 'Precision Threading' ? 'Precise, hair-by-hair removal' : 'Faster for larger areas'
}

interface PkgWaxSelection { areaId: string; typeId: string }
interface PkgFaceSelection { areaId: string; methodId: string }
interface PkgSelectionState {
  cleanupId: string | null
  waxSelections: PkgWaxSelection[]
  faceSelections: PkgFaceSelection[]
  maniPediId: string | null
}

// The work order's own default configuration — a practical maintenance
// combination, all editable/removable once the modal is open.
const PKG_DEFAULT_SELECTION: PkgSelectionState = {
  cleanupId: 'cleanup-hydra-glow',
  waxSelections: [{ areaId: 'wax-arms', typeId: 'wax-arms-classic' }],
  faceSelections: [{ areaId: 'face-eyebrows', methodId: 'face-eyebrows-threading' }],
  maniPediId: 'pedicure-cut-file-polish',
}

interface PkgSummaryLine { title: string; price: number; originalPrice: number; durationMin: number }

// Single source of truth for the modal's running price/duration —
// re-derives everything from the real (or, where noted above,
// originally-authored) per-choice data on every selection change, same
// "never a separate hand-typed total" discipline as getPackageTotals.
function getPackageSelectionSummary(sel: PkgSelectionState): { lines: PkgSummaryLine[]; totalPrice: number; totalOriginal: number; totalDuration: number } {
  const lines: PkgSummaryLine[] = []

  if (sel.cleanupId) {
    const c = PKG_CLEANUP_CHOICES.find(x => x.id === sel.cleanupId)
    if (c) lines.push({ title: `Cleanup: ${c.title}`, price: c.price, originalPrice: c.originalPrice, durationMin: c.durationMin })
  }

  for (const ws of sel.waxSelections) {
    const area = PKG_WAX_AREAS.find(a => a.id === ws.areaId)
    const opt = area?.id ? getSalonItem(area.id).options?.find(o => o.id === ws.typeId) : undefined
    if (area && opt) lines.push({ title: `Waxing — ${area.title}: ${opt.label}`, price: opt.price, originalPrice: opt.originalPrice, durationMin: opt.durationMin })
  }

  for (const fs of sel.faceSelections) {
    const area = PKG_FACE_AREAS.find(a => a.id === fs.areaId)
    const method = area?.methods.find(m => m.id === fs.methodId)
    if (area && method) lines.push({ title: `Facial hair removal — ${area.title}: ${method.label}`, price: method.price, originalPrice: method.originalPrice, durationMin: method.durationMin })
  }

  if (sel.maniPediId) {
    const m = PKG_MANI_PEDI_CHOICES.find(x => x.id === sel.maniPediId)
    if (m) lines.push({ title: `Mani-pedi: ${m.title}`, price: m.price, originalPrice: m.originalPrice, durationMin: m.durationMin })
  }

  const totalPrice = lines.reduce((s, l) => s + l.price, 0)
  const totalOriginal = lines.reduce((s, l) => s + l.originalPrice, 0)
  const totalDuration = lines.reduce((s, l) => s + l.durationMin, 0)
  return { lines, totalPrice, totalOriginal, totalDuration }
}

// ─── Wax & Glow Package customiser ─────────────────────────────────────
// A second, sibling "Edit your package" flow, for the Wax & Glow card
// only — reuses PKG_WAX_AREAS, the PkgChoice/PkgFaceMethod/PkgFaceArea/
// PkgSummaryLine shapes, PKG_ROW_*, IcoChevronDown/IcoCloseX, and
// PkgTypePickerModal (now in its 'confirm' mode — see that component)
// from the Monthly Maintenance customiser above; nothing there was
// duplicated, only extended. Two things ARE package-specific and get
// their own data below: (1) the work order mandates five specific
// original wax-product NAMES for this package (unlike Monthly, which
// reuses each item's own real wax-type options) — their per-area prices
// are computed from each area's own real price/duration with a fixed
// per-product multiplier, never hand-typed per area; (2) the
// facial-hair-removal method matrix has its own three-tier rule set
// (Threading / Gentle Face Wax / Sensitive Skin Face Wax) — real
// catalogue prices are reused wherever a combination already has one
// (same source values as Monthly's own PKG_FACE_AREAS, kept identical
// on purpose so the same real service costs the same in both package
// flows); "Sensitive Skin Face Wax" and Sidelocks' Gentle Face Wax have
// no catalogue counterpart at all and are freshly authored, scaled
// consistently with their nearest real neighbour.

type WgWaxProductId = 'silk-gold' | 'mojito-rollon' | 'aloe-comfort' | 'gold-rollon' | 'honey-care'
interface WgWaxProduct { id: WgWaxProductId; label: string; priceMultiplier: number; durationDeltaMin: number }
const WG_WAX_PRODUCTS: Record<WgWaxProductId, WgWaxProduct> = {
  'silk-gold': { id: 'silk-gold', label: 'Silk Gold Soft Wax', priceMultiplier: 1, durationDeltaMin: 0 },
  'mojito-rollon': { id: 'mojito-rollon', label: 'Mojito Roll-On Wax', priceMultiplier: 0.95, durationDeltaMin: -2 },
  'aloe-comfort': { id: 'aloe-comfort', label: 'Aloe Comfort Soft Wax', priceMultiplier: 1.05, durationDeltaMin: 0 },
  'gold-rollon': { id: 'gold-rollon', label: 'Gold Roll-On Wax', priceMultiplier: 0.97, durationDeltaMin: -2 },
  'honey-care': { id: 'honey-care', label: 'Honey Care Wax', priceMultiplier: 1.08, durationDeltaMin: 0 },
}
// The work order's own availability matrix.
const WG_WAX_AVAILABILITY: Record<string, WgWaxProductId[]> = {
  'wax-arms': ['silk-gold', 'mojito-rollon', 'aloe-comfort', 'gold-rollon', 'honey-care'],
  'wax-half-legs': ['silk-gold', 'mojito-rollon', 'aloe-comfort', 'gold-rollon', 'honey-care'],
  'wax-legs': ['silk-gold', 'mojito-rollon', 'aloe-comfort', 'gold-rollon', 'honey-care'],
  'wax-back': ['silk-gold', 'aloe-comfort', 'honey-care'],
  'wax-stomach': ['silk-gold', 'aloe-comfort', 'honey-care'],
  'wax-underarms': ['silk-gold', 'aloe-comfort', 'honey-care'],
  'wax-bikini-line': ['aloe-comfort', 'honey-care'],
  'wax-bikini': ['aloe-comfort', 'honey-care'],
  'wax-full-body': ['silk-gold', 'aloe-comfort', 'honey-care'],
}
/** Every wax-type option for one area — each area's real base
 *  price/originalPrice/durationMin (from the real SalonLineItem) scaled
 *  by the product's multiplier, so "Silk Gold Soft Wax" on the arms and
 *  on the back are each priced off THAT area's own real rate, never a
 *  single flat price pretending to fit every body area. */
interface WgWaxTypeOption { id: string; label: string; price: number; originalPrice: number; durationMin: number }
function wgWaxOptionsForArea(areaId: string): WgWaxTypeOption[] {
  const base = getSalonItem(areaId)
  const discountRatio = base.originalPrice / base.price
  const productIds = WG_WAX_AVAILABILITY[areaId] ?? []
  return productIds.map(pid => {
    const product = WG_WAX_PRODUCTS[pid]
    const price = Math.round(base.price * product.priceMultiplier)
    const originalPrice = Math.round(price * discountRatio)
    const durationMin = Math.max(5, base.durationMin + product.durationDeltaMin)
    return { id: `${areaId}-${pid}`, label: product.label, price, originalPrice, durationMin }
  })
}

// Real threading/wax prices below match Monthly's own PKG_FACE_AREAS
// values on purpose (see this section's header comment); Sensitive Skin
// Face Wax and Sidelocks' Gentle Face Wax are the only freshly authored
// entries, since neither has a real catalogue counterpart.
const WG_FACE_AREAS: PkgFaceArea[] = [
  { id: 'face-eyebrows', title: 'Eyebrows', methods: [
    { id: 'wg-face-eyebrows-threading', label: 'Precision Threading', price: 49, originalPrice: 79, durationMin: 10 },
  ] },
  { id: 'face-upperlip', title: 'Upper Lip', methods: [
    { id: 'wg-face-upperlip-threading', label: 'Precision Threading', price: 29, originalPrice: 49, durationMin: 5 },
    { id: 'wg-face-upperlip-gentlewax', label: 'Gentle Face Wax', price: 79, originalPrice: 109, durationMin: 10 },
  ] },
  { id: 'face-chin', title: 'Chin', methods: [
    { id: 'wg-face-chin-threading', label: 'Precision Threading', price: 29, originalPrice: 49, durationMin: 5 },
    { id: 'wg-face-chin-gentlewax', label: 'Gentle Face Wax', price: 79, originalPrice: 109, durationMin: 10 },
  ] },
  { id: 'face-forehead', title: 'Forehead', methods: [
    { id: 'wg-face-forehead-threading', label: 'Precision Threading', price: 29, originalPrice: 49, durationMin: 5 },
    { id: 'wg-face-forehead-gentlewax', label: 'Gentle Face Wax', price: 79, originalPrice: 109, durationMin: 10 },
  ] },
  { id: 'face-fullface', title: 'Full Face', methods: [
    { id: 'wg-face-fullface-gentlewax', label: 'Gentle Face Wax', price: 149, originalPrice: 199, durationMin: 20 },
    { id: 'wg-face-fullface-sensitivewax', label: 'Sensitive Skin Face Wax', price: 179, originalPrice: 239, durationMin: 22 },
  ] },
  { id: 'face-jawline', title: 'Jawline', methods: [
    { id: 'wg-face-jawline-gentlewax', label: 'Gentle Face Wax', price: 89, originalPrice: 119, durationMin: 12 },
    { id: 'wg-face-jawline-sensitivewax', label: 'Sensitive Skin Face Wax', price: 109, originalPrice: 145, durationMin: 14 },
  ] },
  { id: 'face-neck', title: 'Neck', methods: [
    { id: 'wg-face-neck-gentlewax', label: 'Gentle Face Wax', price: 99, originalPrice: 129, durationMin: 14 },
    { id: 'wg-face-neck-sensitivewax', label: 'Sensitive Skin Face Wax', price: 119, originalPrice: 155, durationMin: 16 },
  ] },
  { id: 'face-sidelocks', title: 'Sidelocks', methods: [
    { id: 'wg-face-sidelocks-threading', label: 'Precision Threading', price: 29, originalPrice: 49, durationMin: 5 },
    { id: 'wg-face-sidelocks-gentlewax', label: 'Gentle Face Wax', price: 69, originalPrice: 95, durationMin: 8 },
  ] },
]

// The six real facials this section offers — three requested titles had
// no exact catalogue match, so the nearest real item was substituted
// (see this file's final report for the specific swaps): "Signature
// Brightening Facial" → the real "Brightening Facial"; "Age-Rewind
// Facial" → the real "Age-Defence Facial"; "Brightening Cleanup" (which
// is actually a Cleanup-section item, not a facial) → the real
// "Radiance Renewal Facial".
const WG_FACIAL_CHOICES: PkgChoice[] = [
  { id: 'facial-korean-glass-skin', title: 'Korean Glass Skin Facial', price: 999, originalPrice: 1399, durationMin: 60 },
  { id: 'facial-glow-renewal', title: 'Glow Renewal Facial', price: 799, originalPrice: 1099, durationMin: 50 },
  { id: 'facial-kumkumadi-glow', title: 'Kumkumadi Glow Facial', price: 999, originalPrice: 1349, durationMin: 55 },
  { id: 'facial-brightening', title: 'Brightening Facial', price: 699, originalPrice: 999, durationMin: 50 },
  { id: 'facial-age-defence', title: 'Age-Defence Facial', price: 1199, originalPrice: 1649, durationMin: 60 },
  { id: 'facial-radiance-renewal', title: 'Radiance Renewal Facial', price: 749, originalPrice: 1049, durationMin: 50 },
]

interface WgWaxSelection { areaId: string; productId: WgWaxProductId }
interface WgFaceSelection { areaId: string; methodId: string }
interface WgSelectionState {
  waxSelections: WgWaxSelection[]
  faceSelections: WgFaceSelection[]
  facialId: string | null
}
// The work order's own default configuration.
const WG_DEFAULT_SELECTION: WgSelectionState = {
  waxSelections: [
    { areaId: 'wax-arms', productId: 'silk-gold' },
    { areaId: 'wax-legs', productId: 'silk-gold' },
  ],
  faceSelections: [{ areaId: 'face-eyebrows', methodId: 'wg-face-eyebrows-threading' }],
  facialId: 'facial-korean-glass-skin',
}

function getWgSelectionSummary(sel: WgSelectionState): { lines: PkgSummaryLine[]; totalPrice: number; totalOriginal: number; totalDuration: number } {
  const lines: PkgSummaryLine[] = []

  for (const ws of sel.waxSelections) {
    const area = PKG_WAX_AREAS.find(a => a.id === ws.areaId)
    const opt = area ? wgWaxOptionsForArea(area.id).find(o => o.id === `${area.id}-${ws.productId}`) : undefined
    if (area && opt) lines.push({ title: `Waxing — ${area.title}: ${opt.label}`, price: opt.price, originalPrice: opt.originalPrice, durationMin: opt.durationMin })
  }

  for (const fs of sel.faceSelections) {
    const area = WG_FACE_AREAS.find(a => a.id === fs.areaId)
    const method = area?.methods.find(m => m.id === fs.methodId)
    if (area && method) lines.push({ title: `Facial hair removal — ${area.title}: ${method.label}`, price: method.price, originalPrice: method.originalPrice, durationMin: method.durationMin })
  }

  if (sel.facialId) {
    const f = WG_FACIAL_CHOICES.find(x => x.id === sel.facialId)
    if (f) lines.push({ title: `Facial: ${f.title}`, price: f.price, originalPrice: f.originalPrice, durationMin: f.durationMin })
  }

  const totalPrice = lines.reduce((s, l) => s + l.price, 0)
  const totalOriginal = lines.reduce((s, l) => s + l.originalPrice, 0)
  const totalDuration = lines.reduce((s, l) => s + l.durationMin, 0)
  return { lines, totalPrice, totalOriginal, totalDuration }
}

// ─── Build Your Own Package customiser ─────────────────────────────────
// A third "Edit your package" flow, for the Build Your Own card — this
// one is a genuinely DATA-DRIVEN extension of the same system: its 7
// categories render through two generic, reusable section components
// (SingleSelectSection, VariantMultiSection — defined just below) fed
// by plain data, rather than 7 hand-copied JSX blocks. Waxing reuses
// PKG_WAX_AREAS/WG_WAX_PRODUCTS/wgWaxOptionsForArea outright; Facial
// Hair Removal reuses WG_FACE_AREAS outright (just its own display
// order — see BYO_FACE_AREA_ORDER); only Facial & Cleanup, Manicure,
// Pedicure, Head Massage, and Bleach & Detan needed their own package-
// specific choice lists below, and every one of those is either a real
// catalogue item/option or (Bleach & Detan's three named treatment
// types, same idea as Wax & Glow's wax products) a small multiplier on
// top of a real per-area price. See this file's final report for the
// handful of requested names with no real catalogue counterpart and
// what they were substituted with.

// Requested titles with no exact catalogue match, substituted with the
// nearest real item (kept in this comment, not fabricated data):
// "Glow Age-Rewind Facial" → Age-Defence Facial; "Korean Sea-Algae
// Facial" → Sea-Algae Hydration Facial; "Signature Brightening Facial"
// → Gold Radiance Facial; "Hydra Mud Glow Cleanup" → Hydra Glow Cleanup
// (same substitution as Monthly Maintenance's own customiser).
const BYO_FACIAL_CLEANUP_CHOICES: PkgChoice[] = [
  { id: 'facial-korean-glass-skin', title: 'Korean Glass Skin Facial', price: 999, originalPrice: 1399, durationMin: 60 },
  { id: 'facial-age-defence', title: 'Age-Defence Facial', price: 1199, originalPrice: 1649, durationMin: 60 },
  { id: 'facial-sea-algae-hydration', title: 'Sea-Algae Hydration Facial', price: 899, originalPrice: 1249, durationMin: 55 },
  { id: 'facial-brightening', title: 'Brightening Facial', price: 699, originalPrice: 999, durationMin: 50 },
  { id: 'facial-multi-peptide', title: 'Multi-Peptide Renewal Facial', price: 1299, originalPrice: 1799, durationMin: 65 },
  { id: 'facial-gold-radiance', title: 'Gold Radiance Facial', price: 899, originalPrice: 1299, durationMin: 60 },
  { id: 'facial-kumkumadi-glow', title: 'Kumkumadi Glow Facial', price: 999, originalPrice: 1349, durationMin: 55 },
  { id: 'cleanup-hydra-glow', title: 'Hydra Glow Cleanup', price: 449, originalPrice: 599, durationMin: 40 },
  { id: 'cleanup-brightening', title: 'Brightening Cleanup', price: 429, originalPrice: 579, durationMin: 40 },
]

const BYO_MANICURE_CHOICES: PkgChoice[] = [
  { id: 'manicure-icecream', title: 'Ice-Cream Delight Manicure', price: 449, originalPrice: 599, durationMin: 45 },
  { id: 'manicure-sea-algae', title: 'Sea-Algae Manicure', price: 549, originalPrice: 749, durationMin: 50 },
  { id: 'manicure-cut-file-polish', title: 'Cut, File & Polish — Hands', price: 199, originalPrice: 269, durationMin: 20 },
]

// "Ice Cream Delight Pedicure with Heel Care" and "Crystal Spa Pedicure
// with Heel Care" are dropped — the real catalogue has no heel-care
// variant of either pedicure, and the work order explicitly says not
// to add one it doesn't support.
const BYO_PEDICURE_CHOICES: PkgChoice[] = [
  { id: 'pedicure-icecream', title: 'Ice-Cream Delight Pedicure', price: 549, originalPrice: 749, durationMin: 55 },
  { id: 'pedicure-crystal-spa', title: 'Crystal Spa Pedicure', price: 649, originalPrice: 899, durationMin: 60 },
  { id: 'pedicure-cut-file-polish', title: 'Cut, File & Polish — Feet', price: 249, originalPrice: 329, durationMin: 25 },
]

// The real catalogue's massage-head item only has 30/45-minute options
// (not the requested 10/20) — reused at their real durations under the
// requested names rather than inventing new, shorter durations/prices.
const BYO_HEAD_MASSAGE_CHOICES: PkgChoice[] = [
  { id: 'massage-head-30', title: 'Relaxing Head Massage — 30 mins', price: 349, originalPrice: 469, durationMin: 30 },
  { id: 'massage-head-45', title: 'Restorative Head Massage — 45 mins', price: 449, originalPrice: 599, durationMin: 45 },
]

// Facial Hair Removal reuses WG_FACE_AREAS outright (same real areas,
// same three-tier method rules) — only the on-screen ORDER differs
// here, per this work order's own listed order.
const BYO_FACE_AREA_ORDER = ['face-eyebrows', 'face-upperlip', 'face-chin', 'face-sidelocks', 'face-neck', 'face-fullface', 'face-forehead', 'face-jawline']
const BYO_FACE_AREAS: PkgFaceArea[] = BYO_FACE_AREA_ORDER.map(id => WG_FACE_AREAS.find(a => a.id === id)!).filter(Boolean)

// Bleach & Detan — real per-area Bleach/Detan option prices (see the
// Bleach, Detan & Massage section above), read live via getSalonItem so
// they can never drift out of sync with those items' own prices. Two
// requested area names have no real counterpart: "Face & Neck" reuses
// the real "Face" area's data (displayed with the fuller name); "Chest"
// isn't part of the approved area vocabulary at all (the catalogue has
// Stomach, not Chest) so it's shown under its real name, Stomach,
// rather than a Chest service that doesn't actually exist.
interface ByoBleachDetanArea { id: string; title: string; bleachOptionId: string; detanOptionId: string }
const BYO_BLEACH_DETAN_AREAS: ByoBleachDetanArea[] = [
  { id: 'byo-bd-face', title: 'Face & Neck', bleachOptionId: 'bleach-face-face', detanOptionId: 'detan-full-body-face' },
  { id: 'byo-bd-arms', title: 'Full Arms', bleachOptionId: 'bleach-face-arms', detanOptionId: 'detan-full-body-arms' },
  { id: 'byo-bd-stomach', title: 'Stomach', bleachOptionId: 'bleach-face-stomach', detanOptionId: 'detan-full-body-stomach' },
  { id: 'byo-bd-back', title: 'Back', bleachOptionId: 'bleach-face-back', detanOptionId: 'detan-full-body-back' },
  { id: 'byo-bd-legs', title: 'Full Legs', bleachOptionId: 'bleach-face-legs', detanOptionId: 'detan-full-body-legs' },
  { id: 'byo-bd-fullbody', title: 'Full Body', bleachOptionId: 'bleach-face-fullbody', detanOptionId: 'detan-full-body-fullbody' },
]
type ByoTreatmentId = 'gentle-detan' | 'sensitive-detan' | 'brightening-bleach'
// The work order's own availability matrix — Face & Neck gets both
// Detan tiers but no Bleach (no real face-bleach-as-brightening data
// distinct from Detan); every other area gets Gentle Detan or
// Brightening Bleach.
const BYO_TREATMENT_AVAILABILITY: Record<string, ByoTreatmentId[]> = {
  'byo-bd-face': ['gentle-detan', 'sensitive-detan'],
  'byo-bd-arms': ['gentle-detan', 'brightening-bleach'],
  'byo-bd-stomach': ['gentle-detan', 'brightening-bleach'],
  'byo-bd-back': ['gentle-detan', 'brightening-bleach'],
  'byo-bd-legs': ['gentle-detan', 'brightening-bleach'],
  'byo-bd-fullbody': ['gentle-detan', 'brightening-bleach'],
}
interface ByoTreatmentOption { id: string; label: string; price: number; originalPrice: number; durationMin: number; note?: string }
function byoTreatmentOptionsForArea(areaId: string): ByoTreatmentOption[] {
  const area = BYO_BLEACH_DETAN_AREAS.find(a => a.id === areaId)
  if (!area) return []
  const detanBase = getSalonItem('detan-full-body').options?.find(o => o.id === area.detanOptionId)
  const bleachBase = getSalonItem('bleach-face').options?.find(o => o.id === area.bleachOptionId)
  const treatmentIds = BYO_TREATMENT_AVAILABILITY[areaId] ?? []
  return treatmentIds.map((tid): ByoTreatmentOption | null => {
    if (tid === 'gentle-detan' && detanBase) {
      return { id: `${areaId}-gentle-detan`, label: 'Gentle Detan', price: detanBase.price, originalPrice: detanBase.originalPrice, durationMin: detanBase.durationMin, note: 'A gentle, everyday detan' }
    }
    if (tid === 'sensitive-detan' && detanBase) {
      const price = Math.round(detanBase.price * 1.15)
      const originalPrice = Math.round(price * (detanBase.originalPrice / detanBase.price))
      return { id: `${areaId}-sensitive-detan`, label: 'Sensitive-Skin Detan', price, originalPrice, durationMin: detanBase.durationMin + 2, note: 'A gentler formula for sensitive skin' }
    }
    if (tid === 'brightening-bleach' && bleachBase) {
      return { id: `${areaId}-brightening-bleach`, label: 'Brightening Bleach', price: bleachBase.price, originalPrice: bleachBase.originalPrice, durationMin: bleachBase.durationMin, note: 'Instant brightening, no redness' }
    }
    return null
  }).filter((o): o is ByoTreatmentOption => o !== null)
}

interface ByoWaxSelection { areaId: string; productId: WgWaxProductId }
interface ByoFaceSelection { areaId: string; methodId: string }
interface ByoBleachDetanSelection { areaId: string; treatmentId: string }
interface ByoSelectionState {
  waxSelections: ByoWaxSelection[]
  facialCleanupId: string | null
  manicureId: string | null
  pedicureId: string | null
  faceSelections: ByoFaceSelection[]
  headMassageId: string | null
  bleachDetanSelections: ByoBleachDetanSelection[]
}
// The work order's own six named defaults; Head Massage and Bleach &
// Detan aren't among them, so both start opted out.
const BYO_DEFAULT_SELECTION: ByoSelectionState = {
  waxSelections: [
    { areaId: 'wax-arms', productId: 'silk-gold' },
    { areaId: 'wax-legs', productId: 'silk-gold' },
  ],
  facialCleanupId: 'facial-korean-glass-skin',
  manicureId: 'manicure-icecream',
  pedicureId: 'pedicure-icecream',
  faceSelections: [{ areaId: 'face-eyebrows', methodId: 'wg-face-eyebrows-threading' }],
  headMassageId: null,
  bleachDetanSelections: [],
}

function getByoSelectionSummary(sel: ByoSelectionState): { lines: PkgSummaryLine[]; totalPrice: number; totalOriginal: number; totalDuration: number } {
  const lines: PkgSummaryLine[] = []

  for (const ws of sel.waxSelections) {
    const area = PKG_WAX_AREAS.find(a => a.id === ws.areaId)
    const opt = area ? wgWaxOptionsForArea(area.id).find(o => o.id === `${area.id}-${ws.productId}`) : undefined
    if (area && opt) lines.push({ title: `Waxing — ${area.title}: ${opt.label}`, price: opt.price, originalPrice: opt.originalPrice, durationMin: opt.durationMin })
  }

  if (sel.facialCleanupId) {
    const f = BYO_FACIAL_CLEANUP_CHOICES.find(x => x.id === sel.facialCleanupId)
    if (f) lines.push({ title: `Facial & Cleanup: ${f.title}`, price: f.price, originalPrice: f.originalPrice, durationMin: f.durationMin })
  }
  if (sel.manicureId) {
    const m = BYO_MANICURE_CHOICES.find(x => x.id === sel.manicureId)
    if (m) lines.push({ title: `Manicure: ${m.title}`, price: m.price, originalPrice: m.originalPrice, durationMin: m.durationMin })
  }
  if (sel.pedicureId) {
    const p = BYO_PEDICURE_CHOICES.find(x => x.id === sel.pedicureId)
    if (p) lines.push({ title: `Pedicure: ${p.title}`, price: p.price, originalPrice: p.originalPrice, durationMin: p.durationMin })
  }

  for (const fs of sel.faceSelections) {
    const area = WG_FACE_AREAS.find(a => a.id === fs.areaId)
    const method = area?.methods.find(m => m.id === fs.methodId)
    if (area && method) lines.push({ title: `Facial hair removal — ${area.title}: ${method.label}`, price: method.price, originalPrice: method.originalPrice, durationMin: method.durationMin })
  }

  if (sel.headMassageId) {
    const hm = BYO_HEAD_MASSAGE_CHOICES.find(x => x.id === sel.headMassageId)
    if (hm) lines.push({ title: hm.title, price: hm.price, originalPrice: hm.originalPrice, durationMin: hm.durationMin })
  }

  for (const bd of sel.bleachDetanSelections) {
    const area = BYO_BLEACH_DETAN_AREAS.find(a => a.id === bd.areaId)
    const opt = area ? byoTreatmentOptionsForArea(area.id).find(o => o.id === `${area.id}-${bd.treatmentId}`) : undefined
    if (area && opt) lines.push({ title: `Bleach & Detan — ${area.title}: ${opt.label}`, price: opt.price, originalPrice: opt.originalPrice, durationMin: opt.durationMin })
  }

  const totalPrice = lines.reduce((s, l) => s + l.price, 0)
  const totalOriginal = lines.reduce((s, l) => s + l.originalPrice, 0)
  const totalDuration = lines.reduce((s, l) => s + l.durationMin, 0)
  return { lines, totalPrice, totalOriginal, totalDuration }
}

// A customised package builds its own real total from whichever options
// were actually picked — kept as this small, local shape (not the shared
// CustomerCartItem, which has no `breakdown` field) and folded into the
// cart line's own title by addCustomPackageToCart below, the same "no
// second cart item type" discipline every other migrated screen follows.
interface CustomPackageCartInput {
  cartId: string
  title: string
  duration: string
  price: number
  originalPrice: number
  /** The plain-English list of what was actually picked ("Cleanup:
   *  Hydra Glow Cleanup", "Waxing — Back: Chocolate Wax", …), so the
   *  cart line stays legible about what's really being booked instead
   *  of collapsing to a single opaque package name. */
  breakdown: string[]
}

/** Shape addToCart needs — a SalonLineItem already satisfies this; a
 *  package is turned into one via getPackageTotals() at the call site. */
interface Addable {
  id: string
  title: string
  price: number
  originalPrice: number
  durationMin: number
}

// ─── Chrome — same shell shape as HomeServicesScreen.tsx / HozieHelp ──────

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Salon Luxe</span>
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
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Salon Luxe</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'salon-luxe' })}
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

// ─── "Select a service" jump chips — 3-column grid, "Packages" leading
// the list, matching the reference's own sidebar shape. ─────────────────

const JUMP_TARGETS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'packages', label: 'Super Saver Packages', icon: <IcoPackage /> },
  ...SALON_LUXE_SECTIONS.map(s => ({ id: s.id, label: s.label, icon: s.icon })),
]

function ServiceTabs({ onJump }: { onJump: (id: string) => void }) {
  return (
    // Sticky within `main` (the scrolling ancestor, overflow-y-auto) so
    // this stays reachable while the long section list scrolls past
    // underneath it. `top-0` (not main's own 28px padding-top) — that
    // padding scrolls away like any other content once the page moves,
    // so a positive top offset here left a gap once scrolled, with
    // whatever card was passing underneath showing through it. Frosted
    // glass background (translucent white + blur) so that gap reads as
    // deliberate rather than as a rendering bug either way.
    <div className="bg-[var(--hz-surface)]/70 backdrop-blur-md border border-[var(--hz-border)] rounded-[16px] p-4 flex flex-col gap-3 sticky top-0 z-10" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[11px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] font-semibold" style={{ fontFamily: FONT_MONO }}>Select a service</span>
      {/* Single scrollable row instead of a 3-column grid — all targets
          stay reachable via horizontal scroll/swipe, each one keeping a
          fixed width so labels don't get squeezed. Scrollbar hidden the
          same way this file already hides it on `main`. */}
      <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {JUMP_TARGETS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            // justify-between (not the default top-aligned stretch) — the
            // row stretches every chip to match the tallest label, and
            // without this a short one-line label was left floating near
            // the icon with dead space below it before the card's real
            // bottom edge, while the tallest chip's label sat flush with
            // it. This keeps every icon pinned to the same top row and
            // every label's BOTTOM flush with the same line.
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

// ─── Hero banner — real supplied Luxe photo, fresh Houzeify copy ──────────

function HeroBanner() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px] h-[170px] sm:h-[200px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="absolute inset-0 flex items-center px-5 sm:px-10 lg:px-12">
        <h2 className="text-[20px] sm:text-[28px] lg:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[150px] sm:max-w-[380px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Top-rated care,<br />tailored for you
        </h2>
      </div>
      <img
        src={luxeHeroImg}
        alt="Salon Luxe"
        className="absolute right-0 bottom-0 h-full object-cover w-[34%] sm:w-[38%]"
        style={{ objectPosition: '50% 12%', maskImage: 'linear-gradient(90deg, transparent, black 12%)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%)' }}
      />
    </div>
  )
}

// ─── Category banner — sits directly under a section's title, above its
// cards, for the categories the screenshot gives real extra visual
// weight to (Waxing, Japanese Rituals, Pedicure & Manicure). No real
// photography exists for these categories (unlike the hero above, which
// uses a real supplied photo) — same icon-on-gradient honesty as every
// other placeholder in this app, just sized up to banner scale rather
// than a fabricated stock photo. ───────────────────────────────────────

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

// ─── Card chrome shared by both card types below ───────────────────────
// Matched pixel-for-pixel against a Figma spec the user supplied for this
// exact card (exported CSS + a rendered screenshot) — a calm, minimal
// row: a subtle white-to-lavender card, a photo/placeholder panel, plain
// black content type, and neutral off-white/gray-bordered buttons (never
// a loud filled-purple CTA) with purple reserved for the small eyebrow/
// rating/duration accents. Replaces this file's earlier, louder
// glassmorphic-card pass — that one didn't match what the user actually
// wanted.

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, var(--hz-surface) 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const PHOTO_PANEL: React.CSSProperties = {
  background: '#F9F4FF',
  border: '1px solid #EFE4FF',
}
// Same button as the "Ask Hozie →" one in the right-column card below
// (h-8, rounded-[10px], border-[var(--hz-border)], purple text on white, same
// hover) — colors live in the className (not inline style) specifically
// so the hover: variants can actually win the cascade; an inline style
// applies unconditionally and would silently block any hover: class from
// ever showing, which is exactly the bug this replaced.
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-[var(--hz-surface)] border-[var(--hz-border)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)]'
const NEUTRAL_BTN_ADDED = 'bg-[var(--hz-primary-soft)] border-[var(--hz-primary)] text-[var(--hz-primary)] hover:bg-[var(--hz-primary-soft)]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

// ─── Line item card ─────────────────────────────────────────────────────

function LineItemRow({ item, icon, onSelect, cartCount, getCartCount }: {
  item: SalonLineItem
  icon: React.ReactNode
  onSelect: () => void
  cartCount: number
  /** Looks up how many of a given cart-line id are in the cart — reused
   *  here to check each of this item's OPTION ids (not just the item's
   *  own id) so a selected variant can be called out on the card. */
  getCartCount: (id: string) => number
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <ServiceImage icon={icon} alt={item.title} className="w-32 h-32 rounded-[8px] shrink-0 mx-auto sm:mx-0" />

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        <span className="text-[12px] text-[var(--hz-ink-muted)] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.blurb}</span>
        {/* When this item has selectable variants, its own price/duration
            above are its cheapest option's "starting from" figures. Before
            anything is picked, an "N options" hint tells the user there's
            a choice to make; once one (or more) is added, that hint is
            replaced by a green check + the option's own name, same idea
            as HozieHelp's own options items. */}
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
// card language as the rest of this file (CARD_SURFACE, NEUTRAL_BTN),
// not a separate visual system. ────────────────────────────────────────

function OptionsModal({ item, icon, cartCountForOption, onAddOption, onClose }: {
  item: SalonLineItem
  icon: React.ReactNode
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: SalonItemOption) => void
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

// ─── Package card ───────────────────────────────────────────────────────

function PackageCard({ pkg, onAdd, onEdit, cartCount, editButtonRef }: {
  pkg: SalonPackage
  onAdd: () => void
  onEdit: () => void
  cartCount: number
  /** Only set for the Monthly Maintenance Package — lets the customiser
   *  modal return focus to this exact button when it closes. */
  editButtonRef?: React.RefObject<HTMLButtonElement | null>
}) {
  const { originalPrice, price, durationMin } = getPackageTotals(pkg)
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-[12px] p-4" style={CARD_SURFACE}>
      {/* Photo panel — the discount is drawn directly on it (large, black,
          two lines) rather than a separate colored badge, since there's
          no real photo behind it to badge over. */}
      <div className="relative shrink-0 w-full h-[100px] sm:w-[170px] sm:h-auto rounded-[8px] flex items-center justify-center" style={PHOTO_PANEL}>
        <div className="text-center leading-[1.05]">
          <span className="block text-[28px] sm:text-[38px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{pkg.discountPct}%</span>
          <span className="block text-[28px] sm:text-[38px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>OFF</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4">
        {/* Middle: package info */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[0.06em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Package</span>
            <span className="text-[17px] sm:text-[18px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{pkg.name}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {pkg.rating}</span>
          </div>
          <ul className="flex flex-col gap-1 pl-4 m-0" style={{ listStyle: 'disc' }}>
            {pkg.includes.map(inc => (
              <li key={inc.label} className="text-[12px] text-[var(--hz-ink)] leading-snug" style={{ fontFamily: FONT_BODY }}>
                <span className="font-semibold">{inc.label}:</span> {getSalonItem(inc.itemId).title}
              </li>
            ))}
          </ul>
          <button ref={editButtonRef} onClick={onEdit} className={`self-start ${NEUTRAL_BTN} ${NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
            Edit your package
          </button>
        </div>

        {/* Right: price + Add — a fixed-width column on desktop
            (stretches to the row's full height so price sits at the top
            and the button at the bottom, matching the reference exactly),
            a plain horizontal row on mobile. */}
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

// ─── Package customiser modal ────────────────────────────────────────────
// Row chrome shared by every checkbox/radio row across the four sections
// below — a flatter, denser surface than CARD_SURFACE since a settings
// list reads better than a stack of elevated cards at this density.
const PKG_ROW_BASE = 'flex items-center gap-3 rounded-[10px] border px-3.5 py-3 transition-all'
const PKG_ROW_DEFAULT = 'bg-[var(--hz-surface)] border-[var(--hz-border)] hover:border-[var(--hz-primary)] cursor-pointer'
const PKG_ROW_SELECTED = 'bg-[#F9F5FF] border-[var(--hz-primary)] cursor-pointer'

/** Generic single-select sub-picker — reused for both the waxing
 *  "choose the type of waxing" list (real per-area SalonItemOption[])
 *  and the facial-hair-removal "choose your hair-removal method" list
 *  (PkgFaceMethod[]) so the two don't need near-duplicate components.
 *  Selection is immediate (click a row = pick it and close), matching
 *  this file's existing OptionsModal pattern rather than adding a
 *  separate Cancel/Apply step. */
function PkgTypePickerModal({ title, options, currentId, onSelect, onClose, mode = 'immediate' }: {
  title: string
  options: { id: string; label: string; price: number; originalPrice: number; durationMin: number; note?: string }[]
  currentId: string | undefined
  onSelect: (id: string) => void
  onClose: () => void
  /** 'immediate' (default — unchanged from this component's original
   *  behaviour, used by the Monthly Maintenance Package customiser):
   *  tapping a row selects it and closes right away. 'confirm' (used by
   *  the Wax & Glow customiser below): tapping a row only stages it —
   *  the parent selection isn't touched until Apply; Cancel discards the
   *  staged pick and closes without calling onSelect at all. */
  mode?: 'immediate' | 'confirm'
}) {
  // Only meaningful in 'confirm' mode — starts at whatever's already
  // selected so "preserve the current selection until Apply" holds even
  // if the customer opens and immediately closes without picking.
  const [staged, setStaged] = useState<string | undefined>(currentId)
  const activeId = mode === 'confirm' ? staged : currentId

  const handleRowClick = (id: string) => {
    if (mode === 'confirm') setStaged(id)
    else onSelect(id)
  }
  const handleApply = () => { if (staged) onSelect(staged) }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[420px] max-h-[70vh] rounded-[16px] bg-[var(--hz-surface)] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--hz-surface-muted)] shrink-0">
          <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{title}</span>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>
        <div className="flex flex-col gap-2 p-4 overflow-y-auto">
          {options.map(opt => {
            const selected = opt.id === activeId
            return (
              <button
                key={opt.id}
                onClick={() => handleRowClick(opt.id)}
                aria-pressed={selected}
                className={`${PKG_ROW_BASE} text-left ${selected ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}
              >
                <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? 'border-[var(--hz-primary)]' : 'border-[#DAD2E4]'}`}>
                  {selected && <span className="w-2 h-2 rounded-full bg-[var(--hz-primary)]" />}
                </span>
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[13.5px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{opt.label}</span>
                  {opt.note && <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{opt.note}</span>}
                </span>
                <span className="text-[13px] font-semibold text-[var(--hz-ink)] shrink-0" style={{ fontFamily: FONT_BODY }}>₹{opt.price}</span>
              </button>
            )
          })}
        </div>
        {mode === 'confirm' && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--hz-surface-muted)] shrink-0">
            <button onClick={onClose} className={`${NEUTRAL_BTN} ${NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>Cancel</button>
            <button
              onClick={handleApply}
              disabled={!staged}
              className="h-8 px-4 rounded-[10px] bg-[var(--hz-primary)] text-white text-[12px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
              style={{ fontFamily: FONT_BODY }}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/** The "Edit your package" flow for the Monthly Maintenance Package
 *  card — see this file's header comment near PKG_CLEANUP_CHOICES for
 *  what's real data vs. freshly authored. Fresh selection state on
 *  every open (this component is only ever mounted while the modal is
 *  showing), defaulting to PKG_DEFAULT_SELECTION. */
function PackageCustomiserModal({ onAddToCart, onClose }: {
  onAddToCart: (item: CustomPackageCartInput) => void
  onClose: () => void
}) {
  const [sel, setSel] = useState<PkgSelectionState>(PKG_DEFAULT_SELECTION)
  const [activeSubPicker, setActiveSubPicker] = useState<{ kind: 'wax' | 'face'; areaId: string } | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Focus moves into the modal on open (per the work order's a11y spec).
  useEffect(() => { titleRef.current?.focus() }, [])

  // Escape closes the top-level modal; while a sub-picker is open it
  // closes just that and returns focus to the selector button that
  // opened it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (activeSubPicker) {
        const areaId = activeSubPicker.areaId
        setActiveSubPicker(null)
        triggerRefs.current[areaId]?.focus()
      } else {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSubPicker, onClose])

  const { lines, totalPrice, totalOriginal, totalDuration } = getPackageSelectionSummary(sel)
  const saved = totalOriginal - totalPrice

  const selectCleanup = (id: string | null) => { setValidationMessage(null); setSel(prev => ({ ...prev, cleanupId: id })) }
  const selectManiPedi = (id: string | null) => { setValidationMessage(null); setSel(prev => ({ ...prev, maniPediId: id })) }

  const isWaxSelected = (areaId: string) => sel.waxSelections.some(w => w.areaId === areaId)
  const waxTypeFor = (areaId: string) => sel.waxSelections.find(w => w.areaId === areaId)?.typeId

  const toggleWaxArea = (areaId: string) => {
    setValidationMessage(null)
    setSel(prev => {
      if (prev.waxSelections.some(w => w.areaId === areaId)) {
        return { ...prev, waxSelections: prev.waxSelections.filter(w => w.areaId !== areaId) }
      }
      const defaultType = getSalonItem(areaId).options?.[0]?.id
      if (!defaultType) return prev
      // Full body can't combine with individual areas (see work order) —
      // picking one clears the other.
      const kept = areaId === 'wax-full-body' ? [] : prev.waxSelections.filter(w => w.areaId !== 'wax-full-body')
      return { ...prev, waxSelections: [...kept, { areaId, typeId: defaultType }] }
    })
  }
  const clearWaxing = () => { setValidationMessage(null); setSel(prev => ({ ...prev, waxSelections: [] })) }
  const setWaxType = (areaId: string, typeId: string) => {
    setSel(prev => ({ ...prev, waxSelections: prev.waxSelections.map(w => (w.areaId === areaId ? { ...w, typeId } : w)) }))
    setActiveSubPicker(null)
    triggerRefs.current[areaId]?.focus()
  }

  const isFaceSelected = (areaId: string) => sel.faceSelections.some(f => f.areaId === areaId)
  const faceMethodFor = (areaId: string) => sel.faceSelections.find(f => f.areaId === areaId)?.methodId

  const toggleFaceArea = (areaId: string) => {
    setValidationMessage(null)
    setSel(prev => {
      if (prev.faceSelections.some(f => f.areaId === areaId)) {
        return { ...prev, faceSelections: prev.faceSelections.filter(f => f.areaId !== areaId) }
      }
      const defaultMethod = PKG_FACE_AREAS.find(a => a.id === areaId)?.methods[0]?.id
      if (!defaultMethod) return prev
      return { ...prev, faceSelections: [...prev.faceSelections, { areaId, methodId: defaultMethod }] }
    })
  }
  const clearFaceRemoval = () => { setValidationMessage(null); setSel(prev => ({ ...prev, faceSelections: [] })) }
  const setFaceMethod = (areaId: string, methodId: string) => {
    setSel(prev => ({ ...prev, faceSelections: prev.faceSelections.map(f => (f.areaId === areaId ? { ...f, methodId } : f)) }))
    setActiveSubPicker(null)
    triggerRefs.current[areaId]?.focus()
  }

  const handleAddToCart = () => {
    if (lines.length === 0) {
      setValidationMessage('Pick at least one service to add this package.')
      return
    }
    onAddToCart({
      cartId: `pkg-monthly-maintenance-custom-${Date.now()}`,
      title: 'Monthly Maintenance Package (customised)',
      duration: formatDuration(totalDuration),
      price: totalPrice,
      originalPrice: totalOriginal,
      breakdown: lines.map(l => l.title),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pkg-customiser-title"
        className="w-full sm:max-w-[640px] h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[20px] sm:rounded-[16px] bg-[var(--hz-surface)] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--hz-surface-muted)] shrink-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2
              id="pkg-customiser-title"
              ref={titleRef}
              tabIndex={-1}
              className="text-[17px] font-semibold text-[var(--hz-ink)] leading-tight m-0 outline-none"
              style={{ fontFamily: FONT_HEAD }}
            >
              Monthly maintenance package
            </h2>
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
              {lines.length > 0 ? `Est. ${formatDuration(totalDuration)} total` : 'Pick your services below'}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close package editor" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Cleanup — single-select */}
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Cleanup</legend>
            {PKG_CLEANUP_CHOICES.map(c => (
              <label key={c.id} className={`${PKG_ROW_BASE} ${sel.cleanupId === c.id ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                <input type="radio" name="pkg-cleanup" checked={sel.cleanupId === c.id} onChange={() => selectCleanup(c.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
                <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{c.title}</span>
                <span className="text-[13px] font-semibold text-[var(--hz-ink)] shrink-0" style={{ fontFamily: FONT_BODY }}>₹{c.price}</span>
              </label>
            ))}
            <label className={`${PKG_ROW_BASE} ${sel.cleanupId === null ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
              <input type="radio" name="pkg-cleanup" checked={sel.cleanupId === null} onChange={() => selectCleanup(null)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
              <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>I don't need cleanup</span>
            </label>
          </fieldset>

          {/* Waxing — multi-select, each area gets its own type picker */}
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Waxing</legend>
            {PKG_WAX_AREAS.map(area => {
              const item = getSalonItem(area.id)
              const selected = isWaxSelected(area.id)
              const type = item.options?.find(o => o.id === waxTypeFor(area.id))
              return (
                <div key={area.id} className="flex flex-col gap-1.5">
                  <div className={`${PKG_ROW_BASE} ${selected ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                    <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                      <input type="checkbox" checked={selected} onChange={() => toggleWaxArea(area.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
                      <span className="flex-1 min-w-0 text-[13.5px] font-medium text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{area.title}</span>
                    </label>
                    {selected && type ? (
                      <button
                        ref={el => { triggerRefs.current[area.id] = el }}
                        onClick={() => setActiveSubPicker({ kind: 'wax', areaId: area.id })}
                        aria-label={`Wax type for ${area.title}: ${type.label}. Change.`}
                        className="flex items-center gap-1 h-7 px-2.5 rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[11.5px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        {type.label} <IcoChevronDown />
                      </button>
                    ) : (
                      <span className="text-[12px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY }}>from ₹{item.price}</span>
                    )}
                  </div>
                  {/* Full body — real blurb, not fabricated copy, explains
                      what it replaces. */}
                  {area.id === 'wax-full-body' && selected && (
                    <span className="text-[11px] text-[var(--hz-ink-subtle)] pl-3.5" style={{ fontFamily: FONT_BODY }}>{item.blurb} — replaces any individual areas above.</span>
                  )}
                </div>
              )
            })}
            <label className={`${PKG_ROW_BASE} ${sel.waxSelections.length === 0 ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
              <input type="checkbox" checked={sel.waxSelections.length === 0} onChange={clearWaxing} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
              <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>I don't need waxing</span>
            </label>
          </fieldset>

          {/* Facial Hair Removal — multi-select, each area gets its own
              method picker */}
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Facial Hair Removal</legend>
            {PKG_FACE_AREAS.map(area => {
              const selected = isFaceSelected(area.id)
              const method = area.methods.find(m => m.id === faceMethodFor(area.id))
              return (
                <div key={area.id} className={`${PKG_ROW_BASE} ${selected ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                  <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" checked={selected} onChange={() => toggleFaceArea(area.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
                    <span className="flex-1 min-w-0 text-[13.5px] font-medium text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{area.title}</span>
                  </label>
                  {selected && method ? (
                    area.methods.length > 1 ? (
                      <button
                        ref={el => { triggerRefs.current[area.id] = el }}
                        onClick={() => setActiveSubPicker({ kind: 'face', areaId: area.id })}
                        aria-label={`Hair-removal method for ${area.title}: ${method.label}. Change.`}
                        className="flex items-center gap-1 h-7 px-2.5 rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[11.5px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        {method.label} <IcoChevronDown />
                      </button>
                    ) : (
                      <span className="text-[12px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY }}>{method.label}</span>
                    )
                  ) : (
                    <span className="text-[12px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY }}>from ₹{area.methods[0].price}</span>
                  )}
                </div>
              )
            })}
            <label className={`${PKG_ROW_BASE} ${sel.faceSelections.length === 0 ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
              <input type="checkbox" checked={sel.faceSelections.length === 0} onChange={clearFaceRemoval} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
              <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>I don't need facial hair removal</span>
            </label>
          </fieldset>

          {/* Mani-pedi — single-select */}
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Mani-pedi</legend>
            {PKG_MANI_PEDI_CHOICES.map(m => (
              <label key={m.id} className={`${PKG_ROW_BASE} ${sel.maniPediId === m.id ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                <input type="radio" name="pkg-mani-pedi" checked={sel.maniPediId === m.id} onChange={() => selectManiPedi(m.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
                <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{m.title}</span>
                <span className="text-[13px] font-semibold text-[var(--hz-ink)] shrink-0" style={{ fontFamily: FONT_BODY }}>₹{m.price}</span>
              </label>
            ))}
            <label className={`${PKG_ROW_BASE} ${sel.maniPediId === null ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
              <input type="radio" name="pkg-mani-pedi" checked={sel.maniPediId === null} onChange={() => selectManiPedi(null)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
              <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>I don't need mani-pedi</span>
            </label>
          </fieldset>
        </div>

        {/* Sticky bottom summary */}
        <div className="shrink-0 border-t border-[var(--hz-surface-muted)] bg-[var(--hz-surface)] px-5 py-4 flex flex-col gap-2">
          {validationMessage && (
            <span role="alert" className="text-[12px] text-[#B3261E] font-medium" style={{ fontFamily: FONT_BODY }}>{validationMessage}</span>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[18px] font-semibold text-[var(--hz-ink)] whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>
                ₹{totalPrice}{saved > 0 && <span className="line-through text-[var(--hz-ink-subtle)] text-[13px] font-normal ml-1.5">₹{totalOriginal}</span>}
              </span>
              {saved > 0 && <span className="text-[11.5px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_BODY }}>You save ₹{saved}</span>}
            </div>
            <button
              onClick={handleAddToCart}
              className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              Add package to cart
            </button>
          </div>
        </div>
      </div>

      {activeSubPicker?.kind === 'wax' && (() => {
        const area = PKG_WAX_AREAS.find(a => a.id === activeSubPicker.areaId)
        if (!area) return null
        const item = getSalonItem(area.id)
        return (
          <PkgTypePickerModal
            title="Choose the type of waxing"
            options={item.options ?? []}
            currentId={waxTypeFor(area.id)}
            onSelect={id => setWaxType(area.id, id)}
            onClose={() => { setActiveSubPicker(null); triggerRefs.current[area.id]?.focus() }}
          />
        )
      })()}
      {activeSubPicker?.kind === 'face' && (() => {
        const area = PKG_FACE_AREAS.find(a => a.id === activeSubPicker.areaId)
        if (!area) return null
        return (
          <PkgTypePickerModal
            title="Choose your hair-removal method"
            options={area.methods.map(m => ({ ...m, note: faceMethodNote(m.label) }))}
            currentId={faceMethodFor(area.id)}
            onSelect={id => setFaceMethod(area.id, id)}
            onClose={() => { setActiveSubPicker(null); triggerRefs.current[area.id]?.focus() }}
          />
        )
      })()}
    </div>
  )
}

/** The "Edit your package" flow for the Wax & Glow Package card — see
 *  this file's header comment near WG_WAX_PRODUCTS for what's real data
 *  vs. freshly authored. Structurally mirrors PackageCustomiserModal
 *  above (same shell/row/footer shapes, same fresh-state-per-open
 *  discipline) with three sections instead of four, and its wax-type /
 *  hair-removal-method sub-pickers run PkgTypePickerModal in 'confirm'
 *  mode (Cancel/Apply) rather than Monthly's immediate-select. */
function WaxGlowCustomiserModal({ onAddToCart, onClose }: {
  onAddToCart: (item: CustomPackageCartInput) => void
  onClose: () => void
}) {
  const [sel, setSel] = useState<WgSelectionState>(WG_DEFAULT_SELECTION)
  const [activeSubPicker, setActiveSubPicker] = useState<{ kind: 'wax' | 'face'; areaId: string } | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => { titleRef.current?.focus() }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (activeSubPicker) {
        const areaId = activeSubPicker.areaId
        setActiveSubPicker(null)
        triggerRefs.current[areaId]?.focus()
      } else {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSubPicker, onClose])

  const { lines, totalPrice, totalOriginal, totalDuration } = getWgSelectionSummary(sel)
  const saved = totalOriginal - totalPrice

  const isWaxSelected = (areaId: string) => sel.waxSelections.some(w => w.areaId === areaId)
  const waxProductFor = (areaId: string) => sel.waxSelections.find(w => w.areaId === areaId)?.productId

  const toggleWaxArea = (areaId: string) => {
    setValidationMessage(null)
    setSel(prev => {
      if (prev.waxSelections.some(w => w.areaId === areaId)) {
        return { ...prev, waxSelections: prev.waxSelections.filter(w => w.areaId !== areaId) }
      }
      const defaultProduct = WG_WAX_AVAILABILITY[areaId]?.[0]
      if (!defaultProduct) return prev
      // Full body can't combine with individual areas (see work order).
      const kept = areaId === 'wax-full-body' ? [] : prev.waxSelections.filter(w => w.areaId !== 'wax-full-body')
      return { ...prev, waxSelections: [...kept, { areaId, productId: defaultProduct }] }
    })
  }
  const clearWaxing = () => { setValidationMessage(null); setSel(prev => ({ ...prev, waxSelections: [] })) }
  const setWaxProduct = (areaId: string, productId: string) => {
    setSel(prev => ({ ...prev, waxSelections: prev.waxSelections.map(w => (w.areaId === areaId ? { ...w, productId: productId as WgWaxProductId } : w)) }))
    setActiveSubPicker(null)
    triggerRefs.current[areaId]?.focus()
  }

  const isFaceSelected = (areaId: string) => sel.faceSelections.some(f => f.areaId === areaId)
  const faceMethodFor = (areaId: string) => sel.faceSelections.find(f => f.areaId === areaId)?.methodId

  const toggleFaceArea = (areaId: string) => {
    setValidationMessage(null)
    setSel(prev => {
      if (prev.faceSelections.some(f => f.areaId === areaId)) {
        return { ...prev, faceSelections: prev.faceSelections.filter(f => f.areaId !== areaId) }
      }
      const defaultMethod = WG_FACE_AREAS.find(a => a.id === areaId)?.methods[0]?.id
      if (!defaultMethod) return prev
      return { ...prev, faceSelections: [...prev.faceSelections, { areaId, methodId: defaultMethod }] }
    })
  }
  const clearFaceRemoval = () => { setValidationMessage(null); setSel(prev => ({ ...prev, faceSelections: [] })) }
  const setFaceMethod = (areaId: string, methodId: string) => {
    setSel(prev => ({ ...prev, faceSelections: prev.faceSelections.map(f => (f.areaId === areaId ? { ...f, methodId } : f)) }))
    setActiveSubPicker(null)
    triggerRefs.current[areaId]?.focus()
  }

  const selectFacial = (id: string | null) => { setValidationMessage(null); setSel(prev => ({ ...prev, facialId: id })) }

  const handleAddToCart = () => {
    if (lines.length === 0) {
      setValidationMessage('Pick at least one service to add this package.')
      return
    }
    onAddToCart({
      cartId: `pkg-wax-glow-custom-${Date.now()}`,
      title: 'Wax & Glow Package (customised)',
      duration: formatDuration(totalDuration),
      price: totalPrice,
      originalPrice: totalOriginal,
      breakdown: lines.map(l => l.title),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wg-customiser-title"
        className="w-full sm:max-w-[640px] h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[20px] sm:rounded-[16px] bg-[var(--hz-surface)] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--hz-surface-muted)] shrink-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2
              id="wg-customiser-title"
              ref={titleRef}
              tabIndex={-1}
              className="text-[17px] font-semibold text-[var(--hz-ink)] leading-tight m-0 outline-none"
              style={{ fontFamily: FONT_HEAD }}
            >
              Wax &amp; Glow
            </h2>
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
              {lines.length > 0 ? `Service time: ${formatDuration(totalDuration)}` : 'Pick your services below'}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close package editor" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Waxing — multi-select, each area gets its own wax-type
              picker (Cancel/Apply, per the work order) */}
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Waxing</legend>
            {PKG_WAX_AREAS.map(area => {
              const base = getSalonItem(area.id)
              const selected = isWaxSelected(area.id)
              const options = wgWaxOptionsForArea(area.id)
              const product = options.find(o => o.id === `${area.id}-${waxProductFor(area.id)}`)
              return (
                <div key={area.id} className="flex flex-col gap-1.5">
                  <div className={`${PKG_ROW_BASE} ${selected ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                    <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                      <input type="checkbox" checked={selected} onChange={() => toggleWaxArea(area.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
                      <span className="flex-1 min-w-0 text-[13.5px] font-medium text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{area.title}</span>
                    </label>
                    {selected && product ? (
                      <button
                        ref={el => { triggerRefs.current[area.id] = el }}
                        onClick={() => setActiveSubPicker({ kind: 'wax', areaId: area.id })}
                        aria-label={`Wax type for ${area.title}: ${product.label}. Change.`}
                        className="flex items-center gap-1 h-7 px-2.5 rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[11.5px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        {product.label} <IcoChevronDown />
                      </button>
                    ) : (
                      <span className="text-[12px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY }}>from ₹{base.price}</span>
                    )}
                  </div>
                  {area.id === 'wax-full-body' && selected && (
                    <span className="text-[11px] text-[var(--hz-ink-subtle)] pl-3.5" style={{ fontFamily: FONT_BODY }}>{base.blurb} — replaces any individual areas above.</span>
                  )}
                </div>
              )
            })}
            <label className={`${PKG_ROW_BASE} ${sel.waxSelections.length === 0 ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
              <input type="checkbox" checked={sel.waxSelections.length === 0} onChange={clearWaxing} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
              <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>I don't need waxing</span>
            </label>
          </fieldset>

          {/* Facial Hair Removal — multi-select, each area gets its own
              method picker (Cancel/Apply) */}
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Facial Hair Removal</legend>
            {WG_FACE_AREAS.map(area => {
              const selected = isFaceSelected(area.id)
              const method = area.methods.find(m => m.id === faceMethodFor(area.id))
              return (
                <div key={area.id} className={`${PKG_ROW_BASE} ${selected ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                  <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" checked={selected} onChange={() => toggleFaceArea(area.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
                    <span className="flex-1 min-w-0 text-[13.5px] font-medium text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{area.title}</span>
                  </label>
                  {selected && method ? (
                    area.methods.length > 1 ? (
                      <button
                        ref={el => { triggerRefs.current[area.id] = el }}
                        onClick={() => setActiveSubPicker({ kind: 'face', areaId: area.id })}
                        aria-label={`Hair-removal method for ${area.title}: ${method.label}. Change.`}
                        className="flex items-center gap-1 h-7 px-2.5 rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[11.5px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
                        style={{ fontFamily: FONT_BODY }}
                      >
                        {method.label} <IcoChevronDown />
                      </button>
                    ) : (
                      <span className="text-[12px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY }}>{method.label}</span>
                    )
                  ) : (
                    <span className="text-[12px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY }}>from ₹{area.methods[0].price}</span>
                  )}
                </div>
              )
            })}
            <label className={`${PKG_ROW_BASE} ${sel.faceSelections.length === 0 ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
              <input type="checkbox" checked={sel.faceSelections.length === 0} onChange={clearFaceRemoval} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
              <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>I don't need facial hair removal</span>
            </label>
          </fieldset>

          {/* Facials — single-select */}
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Facials</legend>
            {WG_FACIAL_CHOICES.map(f => (
              <label key={f.id} className={`${PKG_ROW_BASE} ${sel.facialId === f.id ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                <input type="radio" name="wg-facial" checked={sel.facialId === f.id} onChange={() => selectFacial(f.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
                <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{f.title}</span>
                <span className="text-[13px] font-semibold text-[var(--hz-ink)] shrink-0" style={{ fontFamily: FONT_BODY }}>₹{f.price}</span>
              </label>
            ))}
            <label className={`${PKG_ROW_BASE} ${sel.facialId === null ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
              <input type="radio" name="wg-facial" checked={sel.facialId === null} onChange={() => selectFacial(null)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
              <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>I don't need facials</span>
            </label>
          </fieldset>
        </div>

        {/* Sticky bottom summary */}
        <div className="shrink-0 border-t border-[var(--hz-surface-muted)] bg-[var(--hz-surface)] px-5 py-4 flex flex-col gap-2">
          {validationMessage && (
            <span role="alert" className="text-[12px] text-[#B3261E] font-medium" style={{ fontFamily: FONT_BODY }}>{validationMessage}</span>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[18px] font-semibold text-[var(--hz-ink)] whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>
                ₹{totalPrice}{saved > 0 && <span className="line-through text-[var(--hz-ink-subtle)] text-[13px] font-normal ml-1.5">₹{totalOriginal}</span>}
              </span>
              {saved > 0 && <span className="text-[11.5px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_BODY }}>You save ₹{saved}</span>}
            </div>
            <button
              onClick={handleAddToCart}
              className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              Add package to cart
            </button>
          </div>
        </div>
      </div>

      {activeSubPicker?.kind === 'wax' && (() => {
        const area = PKG_WAX_AREAS.find(a => a.id === activeSubPicker.areaId)
        if (!area) return null
        return (
          <PkgTypePickerModal
            title="Choose the type of waxing"
            options={wgWaxOptionsForArea(area.id)}
            currentId={waxProductFor(area.id) ? `${area.id}-${waxProductFor(area.id)}` : undefined}
            onSelect={id => setWaxProduct(area.id, id.slice(area.id.length + 1))}
            onClose={() => { setActiveSubPicker(null); triggerRefs.current[area.id]?.focus() }}
            mode="confirm"
          />
        )
      })()}
      {activeSubPicker?.kind === 'face' && (() => {
        const area = WG_FACE_AREAS.find(a => a.id === activeSubPicker.areaId)
        if (!area) return null
        return (
          <PkgTypePickerModal
            title="Choose the type of facial hair removal"
            options={area.methods.map(m => ({ ...m, note: faceMethodNote(m.label) }))}
            currentId={faceMethodFor(area.id)}
            onSelect={id => setFaceMethod(area.id, id)}
            onClose={() => { setActiveSubPicker(null); triggerRefs.current[area.id]?.focus() }}
            mode="confirm"
          />
        )
      })()}
    </div>
  )
}

// ─── Generic package-customiser sections ───────────────────────────────
// The two shapes every category in Build Your Own Package reduces to —
// a plain radio list with an opt-out (Facial & Cleanup, Manicure,
// Pedicure, Head Massage), or a checkbox list where a selected item
// opens a variant picker (Waxing, Facial Hair Removal, Bleach & Detan).
// Built here as data-driven components (fed arrays of real/scaled
// choices, not hand-copied per-category JSX) rather than a third
// separately-built modal system; Monthly's and Wax & Glow's own section
// markup is left exactly as shipped, per this file's own "don't touch
// working, already-verified flows" scoping.

function SingleSelectSection({ legend, groupName, choices, selectedId, onSelect, optOutLabel }: {
  legend: string
  groupName: string
  choices: PkgChoice[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  optOutLabel: string
}) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
      <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>{legend}</legend>
      {choices.map(c => (
        <label key={c.id} className={`${PKG_ROW_BASE} ${selectedId === c.id ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
          <input type="radio" name={groupName} checked={selectedId === c.id} onChange={() => onSelect(c.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
          <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{c.title}</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)] shrink-0" style={{ fontFamily: FONT_BODY }}>₹{c.price}</span>
        </label>
      ))}
      <label className={`${PKG_ROW_BASE} ${selectedId === null ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
        <input type="radio" name={groupName} checked={selectedId === null} onChange={() => onSelect(null)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
        <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{optOutLabel}</span>
      </label>
    </fieldset>
  )
}

interface VariantMultiOption { id: string; label: string; price: number; originalPrice: number; durationMin: number }

function VariantMultiSection({
  legend, areas, isSelected, getVariants, variantIdFor, onToggle, onOpenPicker, onClear, optOutLabel,
  ariaLabelPrefix, triggerRefs, fullBodyId, fullBodyNote, noneSelected,
}: {
  legend: string
  areas: { id: string; title: string }[]
  isSelected: (areaId: string) => boolean
  getVariants: (areaId: string) => VariantMultiOption[]
  variantIdFor: (areaId: string) => string | undefined
  onToggle: (areaId: string) => void
  onOpenPicker: (areaId: string) => void
  onClear: () => void
  optOutLabel: string
  ariaLabelPrefix: string
  triggerRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>
  fullBodyId?: string
  fullBodyNote?: string
  noneSelected: boolean
}) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
      <legend className="text-[13px] font-semibold text-[var(--hz-ink)] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>{legend}</legend>
      {areas.map(area => {
        const selected = isSelected(area.id)
        const variants = getVariants(area.id)
        const current = variants.find(v => v.id === variantIdFor(area.id))
        return (
          <div key={area.id} className="flex flex-col gap-1.5">
            <div className={`${PKG_ROW_BASE} ${selected ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
              <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                <input type="checkbox" checked={selected} onChange={() => onToggle(area.id)} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
                <span className="flex-1 min-w-0 text-[13.5px] font-medium text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_BODY }}>{area.title}</span>
              </label>
              {selected && current ? (
                variants.length > 1 ? (
                  <button
                    ref={el => { triggerRefs.current[area.id] = el }}
                    onClick={() => onOpenPicker(area.id)}
                    aria-label={`${ariaLabelPrefix} for ${area.title}: ${current.label}. Change.`}
                    className="flex items-center gap-1 h-7 px-2.5 rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[11.5px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    {current.label} <IcoChevronDown />
                  </button>
                ) : (
                  <span className="text-[12px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY }}>{current.label}</span>
                )
              ) : (
                <span className="text-[12px] text-[var(--hz-ink-subtle)] shrink-0" style={{ fontFamily: FONT_BODY }}>from ₹{variants[0]?.price ?? 0}</span>
              )}
            </div>
            {fullBodyId === area.id && selected && fullBodyNote && (
              <span className="text-[11px] text-[var(--hz-ink-subtle)] pl-3.5" style={{ fontFamily: FONT_BODY }}>{fullBodyNote}</span>
            )}
          </div>
        )
      })}
      <label className={`${PKG_ROW_BASE} ${noneSelected ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
        <input type="checkbox" checked={noneSelected} onChange={onClear} className="w-4 h-4 shrink-0" style={{ accentColor: 'var(--hz-primary)' }} />
        <span className="flex-1 text-[13.5px] font-medium text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{optOutLabel}</span>
      </label>
    </fieldset>
  )
}

/** The "Edit your package" flow for the Build Your Own Package card —
 *  see this file's header comment near BYO_FACIAL_CLEANUP_CHOICES for
 *  what's real data vs. freshly authored. Same shell/lifecycle as
 *  PackageCustomiserModal/WaxGlowCustomiserModal (fresh state per open,
 *  focus-in/focus-return, Escape-closes-top-layer-first); its 7
 *  sections render through SingleSelectSection/VariantMultiSection
 *  above rather than being individually hand-written. */
function BuildYourOwnCustomiserModal({ onAddToCart, onClose }: {
  onAddToCart: (item: CustomPackageCartInput) => void
  onClose: () => void
}) {
  const [sel, setSel] = useState<ByoSelectionState>(BYO_DEFAULT_SELECTION)
  const [activeSubPicker, setActiveSubPicker] = useState<{ kind: 'wax' | 'face' | 'bleach'; areaId: string } | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => { titleRef.current?.focus() }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (activeSubPicker) {
        const areaId = activeSubPicker.areaId
        setActiveSubPicker(null)
        triggerRefs.current[areaId]?.focus()
      } else {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSubPicker, onClose])

  const { lines, totalPrice, totalOriginal, totalDuration } = getByoSelectionSummary(sel)
  const saved = totalOriginal - totalPrice

  // Waxing
  const isWaxSelected = (areaId: string) => sel.waxSelections.some(w => w.areaId === areaId)
  const waxVariantIdFor = (areaId: string) => {
    const productId = sel.waxSelections.find(w => w.areaId === areaId)?.productId
    return productId ? `${areaId}-${productId}` : undefined
  }
  const toggleWaxArea = (areaId: string) => {
    setValidationMessage(null)
    setSel(prev => {
      if (prev.waxSelections.some(w => w.areaId === areaId)) {
        return { ...prev, waxSelections: prev.waxSelections.filter(w => w.areaId !== areaId) }
      }
      const defaultProduct = WG_WAX_AVAILABILITY[areaId]?.[0]
      if (!defaultProduct) return prev
      const kept = areaId === 'wax-full-body' ? [] : prev.waxSelections.filter(w => w.areaId !== 'wax-full-body')
      return { ...prev, waxSelections: [...kept, { areaId, productId: defaultProduct }] }
    })
  }
  const clearWaxing = () => { setValidationMessage(null); setSel(prev => ({ ...prev, waxSelections: [] })) }
  const setWaxProduct = (areaId: string, productId: string) => {
    setSel(prev => ({ ...prev, waxSelections: prev.waxSelections.map(w => (w.areaId === areaId ? { ...w, productId: productId as WgWaxProductId } : w)) }))
    setActiveSubPicker(null)
    triggerRefs.current[areaId]?.focus()
  }

  // Facial Hair Removal
  const isFaceSelected = (areaId: string) => sel.faceSelections.some(f => f.areaId === areaId)
  const faceVariantIdFor = (areaId: string) => sel.faceSelections.find(f => f.areaId === areaId)?.methodId
  const toggleFaceArea = (areaId: string) => {
    setValidationMessage(null)
    setSel(prev => {
      if (prev.faceSelections.some(f => f.areaId === areaId)) {
        return { ...prev, faceSelections: prev.faceSelections.filter(f => f.areaId !== areaId) }
      }
      const defaultMethod = BYO_FACE_AREAS.find(a => a.id === areaId)?.methods[0]?.id
      if (!defaultMethod) return prev
      return { ...prev, faceSelections: [...prev.faceSelections, { areaId, methodId: defaultMethod }] }
    })
  }
  const clearFaceRemoval = () => { setValidationMessage(null); setSel(prev => ({ ...prev, faceSelections: [] })) }
  const setFaceMethod = (areaId: string, methodId: string) => {
    setSel(prev => ({ ...prev, faceSelections: prev.faceSelections.map(f => (f.areaId === areaId ? { ...f, methodId } : f)) }))
    setActiveSubPicker(null)
    triggerRefs.current[areaId]?.focus()
  }

  // Bleach & Detan
  const isBleachDetanSelected = (areaId: string) => sel.bleachDetanSelections.some(b => b.areaId === areaId)
  const bleachDetanVariantIdFor = (areaId: string) => {
    const treatmentId = sel.bleachDetanSelections.find(b => b.areaId === areaId)?.treatmentId
    return treatmentId ? `${areaId}-${treatmentId}` : undefined
  }
  const toggleBleachDetanArea = (areaId: string) => {
    setValidationMessage(null)
    setSel(prev => {
      if (prev.bleachDetanSelections.some(b => b.areaId === areaId)) {
        return { ...prev, bleachDetanSelections: prev.bleachDetanSelections.filter(b => b.areaId !== areaId) }
      }
      const defaultTreatment = BYO_TREATMENT_AVAILABILITY[areaId]?.[0]
      if (!defaultTreatment) return prev
      return { ...prev, bleachDetanSelections: [...prev.bleachDetanSelections, { areaId, treatmentId: defaultTreatment }] }
    })
  }
  const clearBleachDetan = () => { setValidationMessage(null); setSel(prev => ({ ...prev, bleachDetanSelections: [] })) }
  const setTreatment = (areaId: string, treatmentId: string) => {
    setSel(prev => ({ ...prev, bleachDetanSelections: prev.bleachDetanSelections.map(b => (b.areaId === areaId ? { ...b, treatmentId } : b)) }))
    setActiveSubPicker(null)
    triggerRefs.current[areaId]?.focus()
  }

  const handleAddToCart = () => {
    if (lines.length === 0) {
      setValidationMessage('Pick at least one service to add this package.')
      return
    }
    onAddToCart({
      cartId: `pkg-build-your-own-custom-${Date.now()}`,
      title: 'Build Your Own Package (customised)',
      duration: formatDuration(totalDuration),
      price: totalPrice,
      originalPrice: totalOriginal,
      breakdown: lines.map(l => l.title),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="byo-customiser-title"
        className="w-full sm:max-w-[640px] h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[20px] sm:rounded-[16px] bg-[var(--hz-surface)] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--hz-surface-muted)] shrink-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2
              id="byo-customiser-title"
              ref={titleRef}
              tabIndex={-1}
              className="text-[17px] font-semibold text-[var(--hz-ink)] leading-tight m-0 outline-none"
              style={{ fontFamily: FONT_HEAD }}
            >
              Build Your Own Package
            </h2>
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
              {lines.length > 0 ? `Service time: ${formatDuration(totalDuration)}` : 'Pick your services below'}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close package editor" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* 1. Waxing */}
          <VariantMultiSection
            legend="Waxing"
            areas={PKG_WAX_AREAS}
            isSelected={isWaxSelected}
            getVariants={wgWaxOptionsForArea}
            variantIdFor={waxVariantIdFor}
            onToggle={toggleWaxArea}
            onOpenPicker={areaId => setActiveSubPicker({ kind: 'wax', areaId })}
            onClear={clearWaxing}
            optOutLabel="I Don't Need Waxing"
            ariaLabelPrefix="Wax type"
            triggerRefs={triggerRefs}
            fullBodyId="wax-full-body"
            fullBodyNote={`${getSalonItem('wax-full-body').blurb} — replaces any individual areas above.`}
            noneSelected={sel.waxSelections.length === 0}
          />
          <div className="border-t border-[var(--hz-surface-muted)]" />

          {/* 2. Facial & Cleanup */}
          <SingleSelectSection
            legend="Facial & Cleanup"
            groupName="byo-facial-cleanup"
            choices={BYO_FACIAL_CLEANUP_CHOICES}
            selectedId={sel.facialCleanupId}
            onSelect={id => { setValidationMessage(null); setSel(prev => ({ ...prev, facialCleanupId: id })) }}
            optOutLabel="I Don't Need Facial & Cleanup"
          />
          <div className="border-t border-[var(--hz-surface-muted)]" />

          {/* 3. Manicure */}
          <SingleSelectSection
            legend="Manicure"
            groupName="byo-manicure"
            choices={BYO_MANICURE_CHOICES}
            selectedId={sel.manicureId}
            onSelect={id => { setValidationMessage(null); setSel(prev => ({ ...prev, manicureId: id })) }}
            optOutLabel="I Don't Need Manicure"
          />
          <div className="border-t border-[var(--hz-surface-muted)]" />

          {/* 4. Pedicure */}
          <SingleSelectSection
            legend="Pedicure"
            groupName="byo-pedicure"
            choices={BYO_PEDICURE_CHOICES}
            selectedId={sel.pedicureId}
            onSelect={id => { setValidationMessage(null); setSel(prev => ({ ...prev, pedicureId: id })) }}
            optOutLabel="I Don't Need Pedicure"
          />
          <div className="border-t border-[var(--hz-surface-muted)]" />

          {/* 5. Facial Hair Removal */}
          <VariantMultiSection
            legend="Facial Hair Removal"
            areas={BYO_FACE_AREAS}
            isSelected={isFaceSelected}
            getVariants={areaId => BYO_FACE_AREAS.find(a => a.id === areaId)?.methods ?? []}
            variantIdFor={faceVariantIdFor}
            onToggle={toggleFaceArea}
            onOpenPicker={areaId => setActiveSubPicker({ kind: 'face', areaId })}
            onClear={clearFaceRemoval}
            optOutLabel="I Don't Need Facial Hair Removal"
            ariaLabelPrefix="Hair-removal method"
            triggerRefs={triggerRefs}
            noneSelected={sel.faceSelections.length === 0}
          />
          <div className="border-t border-[var(--hz-surface-muted)]" />

          {/* 6. Head Massage */}
          <SingleSelectSection
            legend="Head Massage"
            groupName="byo-head-massage"
            choices={BYO_HEAD_MASSAGE_CHOICES}
            selectedId={sel.headMassageId}
            onSelect={id => { setValidationMessage(null); setSel(prev => ({ ...prev, headMassageId: id })) }}
            optOutLabel="I Don't Need Head Massage"
          />
          <div className="border-t border-[var(--hz-surface-muted)]" />

          {/* 7. Bleach & Detan */}
          <VariantMultiSection
            legend="Bleach & Detan"
            areas={BYO_BLEACH_DETAN_AREAS}
            isSelected={isBleachDetanSelected}
            getVariants={byoTreatmentOptionsForArea}
            variantIdFor={bleachDetanVariantIdFor}
            onToggle={toggleBleachDetanArea}
            onOpenPicker={areaId => setActiveSubPicker({ kind: 'bleach', areaId })}
            onClear={clearBleachDetan}
            optOutLabel="I Don't Need Bleach & Detan"
            ariaLabelPrefix="Treatment type"
            triggerRefs={triggerRefs}
            noneSelected={sel.bleachDetanSelections.length === 0}
          />
        </div>

        {/* 8. Sticky package summary */}
        <div className="shrink-0 border-t border-[var(--hz-surface-muted)] bg-[var(--hz-surface)] px-5 py-4 flex flex-col gap-2">
          {validationMessage && (
            <span role="alert" className="text-[12px] text-[#B3261E] font-medium" style={{ fontFamily: FONT_BODY }}>{validationMessage}</span>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[18px] font-semibold text-[var(--hz-ink)] whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>
                ₹{totalPrice}{saved > 0 && <span className="line-through text-[var(--hz-ink-subtle)] text-[13px] font-normal ml-1.5">₹{totalOriginal}</span>}
              </span>
              <span className="text-[11.5px] font-semibold text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                {lines.length} service{lines.length !== 1 ? 's' : ''} selected{saved > 0 ? ` · You save ₹${saved}` : ''}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className="h-10 px-5 rounded-[10px] bg-[var(--hz-primary)] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
              style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
            >
              Add package to cart
            </button>
          </div>
        </div>
      </div>

      {activeSubPicker?.kind === 'wax' && (() => {
        const area = PKG_WAX_AREAS.find(a => a.id === activeSubPicker.areaId)
        if (!area) return null
        return (
          <PkgTypePickerModal
            title="Choose the type of waxing"
            options={wgWaxOptionsForArea(area.id)}
            currentId={waxVariantIdFor(area.id)}
            onSelect={id => setWaxProduct(area.id, id.slice(area.id.length + 1))}
            onClose={() => { setActiveSubPicker(null); triggerRefs.current[area.id]?.focus() }}
            mode="confirm"
          />
        )
      })()}
      {activeSubPicker?.kind === 'face' && (() => {
        const area = BYO_FACE_AREAS.find(a => a.id === activeSubPicker.areaId)
        if (!area) return null
        return (
          <PkgTypePickerModal
            title="Choose the type of facial hair removal"
            options={area.methods.map(m => ({ ...m, note: faceMethodNote(m.label) }))}
            currentId={faceVariantIdFor(area.id)}
            onSelect={id => setFaceMethod(area.id, id)}
            onClose={() => { setActiveSubPicker(null); triggerRefs.current[area.id]?.focus() }}
            mode="confirm"
          />
        )
      })()}
      {activeSubPicker?.kind === 'bleach' && (() => {
        const area = BYO_BLEACH_DETAN_AREAS.find(a => a.id === activeSubPicker.areaId)
        if (!area) return null
        return (
          <PkgTypePickerModal
            title="Choose treatment type"
            options={byoTreatmentOptionsForArea(area.id)}
            currentId={bleachDetanVariantIdFor(area.id)}
            onSelect={id => setTreatment(area.id, id.slice(area.id.length + 1))}
            onClose={() => { setActiveSubPicker(null); triggerRefs.current[area.id]?.focus() }}
            mode="confirm"
          />
        )
      })()}
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

export default function SalonLuxeScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  // Id of the item whose options picker is currently open (see
  // OptionsModal) — null means no modal is showing.
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  // Whether the Monthly Maintenance Package's "Edit your package" flow
  // (see PackageCustomiserModal) is open. That one package card gets a
  // ref on its own "Edit your package" button so focus can return there
  // when the modal closes.
  const [packageCustomiserOpen, setPackageCustomiserOpen] = useState(false)
  const packageEditButtonRef = useRef<HTMLButtonElement>(null)
  const closePackageCustomiser = () => {
    setPackageCustomiserOpen(false)
    packageEditButtonRef.current?.focus()
  }
  // Same idea, for the Wax & Glow Package's own "Edit your package" flow
  // (see WaxGlowCustomiserModal) — a separate open/close state and
  // button ref, since it's a distinct package card with its own trigger.
  const [waxGlowCustomiserOpen, setWaxGlowCustomiserOpen] = useState(false)
  const waxGlowEditButtonRef = useRef<HTMLButtonElement>(null)
  const closeWaxGlowCustomiser = () => {
    setWaxGlowCustomiserOpen(false)
    waxGlowEditButtonRef.current?.focus()
  }
  // Same idea, for Build Your Own Package's own "Edit your package" flow
  // (see BuildYourOwnCustomiserModal).
  const [buildYourOwnCustomiserOpen, setBuildYourOwnCustomiserOpen] = useState(false)
  const buildYourOwnEditButtonRef = useRef<HTMLButtonElement>(null)
  const closeBuildYourOwnCustomiser = () => {
    setBuildYourOwnCustomiserOpen(false)
    buildYourOwnEditButtonRef.current?.focus()
  }

  // Takes either a real SalonLineItem or a package's computed totals
  // (see getPackageTotals) — same cart, same "Add → Edit, qty stepper"
  // behaviour either way.
  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'salon-luxe',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.originalPrice,
      duration: formatDuration(entry.durationMin),
    })
  }

  // A selected option becomes its own cart line — titled "Item — Option"
  // so the cart stays legible about exactly what was booked — then the
  // picker closes.
  const addOptionToCart = (item: SalonLineItem, option: SalonItemOption) => {
    addToCart({ id: option.id, title: `${item.title} — ${option.label}`, price: option.price, originalPrice: option.originalPrice, durationMin: option.durationMin })
    setExpandedItemId(null)
  }

  // The package customiser builds its own real total from whichever
  // options were actually picked — its breakdown has no field on the
  // shared cart's own item type, so it's folded into this line's own
  // title instead (never a second, richer cart-item type).
  const addCustomPackageToCart = (item: CustomPackageCartInput) => {
    addItem({
      cartId: item.cartId,
      serviceEntry: 'home-services',
      categoryId: 'salon-luxe',
      serviceId: item.cartId,
      serviceName: item.title,
      title: item.breakdown.length > 0 ? `${item.title} — ${item.breakdown.join(', ')}` : item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      duration: item.duration,
    })
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`salon-luxe-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // "Edit your package" — see this file's header comment for why this
  // scrolls to the real itemised list rather than opening a fake
  // per-package item-swap modal this app has no real logic behind.
  const editPackage = () => jumpToSection('waxing')

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  // Hands off to the existing, real Checkout page — same real flow every
  // other cart in this app already uses.
  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'salon-luxe',
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

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Women's Salon &amp; Spa</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Salon Luxe
                </h1>
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                  <span className="flex items-center gap-1 text-[var(--hz-primary)] font-semibold"><IcoStar /> 4.8</span> (1.8K bookings)
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner />
                  <ServiceTabs onJump={jumpToSection} />

                  <div id="salon-luxe-section-packages" className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                    <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Super Saver Packages</h2>
                    <div className="flex flex-col gap-3">
                      {SALON_LUXE_PACKAGES.map(pkg => (
                        <PackageCard
                          key={pkg.id}
                          pkg={pkg}
                          cartCount={cartCountForItem(pkg.id)}
                          onAdd={() => addToCart({ id: pkg.id, title: pkg.name, ...getPackageTotals(pkg) })}
                          onEdit={
                            pkg.id === 'pkg-monthly-maintenance' ? () => setPackageCustomiserOpen(true)
                            : pkg.id === 'pkg-wax-glow' ? () => setWaxGlowCustomiserOpen(true)
                            : pkg.id === 'pkg-build-your-own' ? () => setBuildYourOwnCustomiserOpen(true)
                            : editPackage
                          }
                          editButtonRef={
                            pkg.id === 'pkg-monthly-maintenance' ? packageEditButtonRef
                            : pkg.id === 'pkg-wax-glow' ? waxGlowEditButtonRef
                            : pkg.id === 'pkg-build-your-own' ? buildYourOwnEditButtonRef
                            : undefined
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {SALON_LUXE_SECTIONS.map(section => (
                    <div key={section.id} id={`salon-luxe-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>

                      {section.id === 'waxing' && (
                        <CategoryBanner
                          icon={<IcoWaxStrip />}
                          title="Smooth, salon-fresh skin"
                          subtitle="Professional waxing for arms, legs & more, at home."
                        />
                      )}

                      {section.id === 'mani-pedi' && (
                        <CategoryBanner icon={<IcoNailPolish />} title="Spa mani-pedi, from home" subtitle="A full hand and foot spa ritual, at your convenience." />
                      )}

                      {section.id === 'japanese-rituals' ? (
                        // Each item gets its own large banner directly above
                        // it — "two large editorial banner/service
                        // combinations" — rather than one shared banner for
                        // the whole section.
                        <div className="flex flex-col gap-4">
                          {section.items.map(item => (
                            <div key={item.id} className="flex flex-col gap-3">
                              <CategoryBanner icon={<IcoSparkle />} title={item.title} subtitle={item.blurb} />
                              <LineItemRow item={item} icon={section.icon} cartCount={cartCountForItem(item.id)} getCartCount={cartCountForItem} onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {section.items.map(item => (
                            <div key={item.id} className="flex flex-col gap-3">
                              {/* "Restorative foot care" sits directly
                                  above the item it introduces (Crystal Spa
                                  Pedicure), not bunched with the section's
                                  main banner at the top. */}
                              {section.id === 'mani-pedi' && item.id === 'pedicure-crystal-spa' && (
                                <CategoryBanner icon={<IcoFoot />} title="Restorative foot care" subtitle="Soothing treatments for tired, hardworking feet." />
                              )}
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
                      )}
                    </div>
                  ))}
                </div>

                {/* Right column — pinned in place on desktop (Houzeify
                    Promise, Cart, Ask Hozie stay put as the left column's
                    item list scrolls past); on mobile it's a single
                    column so it just stacks in normal flow like before.
                    `main`, not the window, is the scrolling ancestor here
                    (it's the element with overflow-y-auto), so `sticky`
                    pins relative to it — capped to the viewport height so
                    a long cart never grows taller than the screen. */}
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
          item={getSalonItem(expandedItemId)}
          icon={getSalonItemIcon(expandedItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getSalonItem(expandedItemId), option)}
          onClose={() => setExpandedItemId(null)}
        />
      )}

      {packageCustomiserOpen && (
        <PackageCustomiserModal
          onAddToCart={addCustomPackageToCart}
          onClose={closePackageCustomiser}
        />
      )}

      {waxGlowCustomiserOpen && (
        <WaxGlowCustomiserModal
          onAddToCart={addCustomPackageToCart}
          onClose={closeWaxGlowCustomiser}
        />
      )}

      {buildYourOwnCustomiserOpen && (
        <BuildYourOwnCustomiserModal
          onAddToCart={addCustomPackageToCart}
          onClose={closeBuildYourOwnCustomiser}
        />
      )}
    </div>
  )
}
