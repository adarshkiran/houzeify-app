// ─── Hair Studio for Women — Women's Salon & Spa → Hair Studio for Women ──
//
// Rebuilt from a real-page reference PDF the user supplied (UB04) — used
// for its "Select a service" catalogue (8 sections: Packages, Blow-dry &
// style, Cut & trim, Hair care, Keratin & botox, Hair colour, Fashion
// color, Hair extensions) and every service's own rating/reviews/price/
// original price/duration/description/badge, taken as given. Values the
// reference didn't show for a given service (a missing duration, a
// missing rating, a fine-print note like "Hair wash not included") are
// never invented — simply omitted, same discipline as the Spa Ayurveda
// build. Items whose reference only shows an "N options" count (the
// actual variants sit behind a click this single-page capture didn't
// reach) are rendered on their own "starts at" price with that count as
// a plain informational note, rather than a picker built from guessed
// option data.
//
// PAGE ITSELF still follows the exact same house system as every other
// Women's Salon & Spa screen (Salon Luxe / Spa Luxe / Spa Prime / Spa
// Ayurveda): sticky/glass "Select a service" nav, scrollMarginTop 230,
// CategoryBanner + 128×128 icon panels, CARD_SURFACE line-item rows,
// right-column Houzeify Promise/Cart/Ask Hozie shell. The reference's
// own "Packages" cards (editable bundles with a discount-% panel) reuse
// Salon Luxe's own PackageCard pattern; "Edit your package" scrolls to
// a relevant section rather than opening a bespoke customiser, the same
// honest fallback Salon Luxe itself uses for packages that don't have
// one.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own page-level aggregate rating/"earliest slot" header,
// footer, brand promise card, cashback promo banner, and whatever was
// in its own cart at capture time.
//
// Honesty note: no real hair-studio photography exists in this project,
// so every image slot uses this app's own icon-on-gradient placeholder
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
const IcoCart = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2.5h1.6L6.3 13h9L17.3 5.8H4.7" />
    <circle cx="7.2" cy="16.5" r="1.2" />
    <circle cx="14" cy="16.5" r="1.2" />
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
// Section-nav icons
const IcoPackage = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6.5L10 3l7 3.5-7 3.5-7-3.5Z" />
    <path d="M3 6.5V14l7 3.5 7-3.5V6.5" />
    <path d="M10 10v7.5" />
  </svg>
)
const IcoHairDryer = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4.5a5 5 0 015 5v1.2l4 1.3v1.5l-4-.7v.7a2 2 0 01-2 2H9" />
    <path d="M8 4.5a3.2 3.2 0 00-3.2 3.2c0 1.6 1 2.3 1 3.8v3a1.5 1.5 0 003 0v-3" />
    <path d="M13.5 15v2.5" />
  </svg>
)
const IcoScissors = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="5" r="2" />
    <circle cx="5" cy="15" r="2" />
    <path d="M6.6 6.3L17 16.5M6.6 13.7L17 3.5" />
  </svg>
)
const IcoSteam = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8c-1 1.5-1 3 0 4.5M10 8c-1 1.5-1 3 0 4.5M14 8c-1 1.5-1 3 0 4.5" />
    <path d="M4 15.5h12" />
    <path d="M5.5 15.5V17M14.5 15.5V17" />
  </svg>
)
const IcoFlask = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2.5h4M8.5 2.5v4.8L4.8 14a2 2 0 001.7 3h7a2 2 0 001.7-3l-3.7-6.7V2.5" />
    <path d="M6.2 12h7.6" />
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
const IcoSparkle = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14l-1.6-4.4L4 8l4.4-1.6L10 2Z" />
  </svg>
)
const IcoExtension = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3c0 5 -1.5 9 0 14M10 3c0 5 -0.7 9 0 14M14 3c0 5 1.5 9 0 14" />
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

/** One real selectable variant under an item that has more than one way
 *  to book it — same idea as Salon Luxe's own SalonItemOption. `rating`
 *  is per-option (each variant has its own, seen in the user's own
 *  screenshot), so it's optional and never backfilled from the parent
 *  item's own rating. */
interface HairItemOption {
  id: string
  label: string
  price: number
  rating?: string
}
interface HairStudioItem {
  id: string
  title: string
  bestseller?: boolean
  rating?: string
  price: number
  priceLabel?: 'starts-at'
  originalPrice?: number
  durationMin?: number
  description?: string
  note?: string
  /** The reference only shows a count for these — the actual variant
   *  names/prices sit behind a click this single-page capture doesn't
   *  reach, so this stays a plain "N options available" hint until the
   *  user supplies the real per-option data (see `options` below). */
  optionsCount?: number
  /** Real per-option data, once supplied — "Select" opens a picker of
   *  these instead of adding this item directly. */
  options?: HairItemOption[]
}
interface HairStudioSection {
  id: string
  label: string
  icon: React.ReactNode
  items: HairStudioItem[]
}
/** One selectable option inside a customiser category (e.g. "Haircut"
 *  under "Haircut or trim"). */
interface PkgCustomiserOption {
  id: string
  label: string
  price: number
}
/** One category inside a package's "Edit your package" popup — a
 *  single-select radio group, plus a "none" choice whose label is
 *  given per-category (e.g. "I don't need hair styling"). A category
 *  can default to a real option (Haircut, Ayurvedic spa) or to "none"
 *  (Hair styling starts unpicked in the reference). */
interface PkgCustomiserCategory {
  id: string
  label: string
  options: PkgCustomiserOption[]
  defaultOptionId: string | null
  noneLabel: string
}
interface HairPackage {
  id: string
  name: string
  rating: string
  price: number
  originalPrice: number
  durationMin: number
  includes: string[]
  /** Only set for a package with a real "Edit your package" popup (see
   *  PackageCustomiserModal below) — a package without one keeps the
   *  simpler "jump to a relevant section" fallback. */
  customiser?: PkgCustomiserCategory[]
}

// "Cut, trim, spa & style" — the one package the user supplied a real
// "Edit your package" screenshot for. Category options/prices and the
// default selection (Haircut + Ayurvedic strengthening spa, hair
// styling left unpicked) are taken exactly as shown; the discount is
// preserved as the same fraction the reference's own default totals
// imply (₹150 off ₹1,848 ≈ 8.12%), applied to whatever the shopper
// configures.
const HS_PKG1_CUSTOMISER: PkgCustomiserCategory[] = [
  {
    id: 'haircut-trim', label: 'Haircut or trim', noneLabel: "I don't need haircut or trim", defaultOptionId: 'hs-pkg1-haircut',
    options: [
      { id: 'hs-pkg1-hairtrim', label: 'Hair trim', price: 449 },
      { id: 'hs-pkg1-haircut', label: 'Haircut', price: 549 },
    ],
  },
  {
    id: 'hair-styling', label: 'Hair styling', noneLabel: "I don't need hair styling", defaultOptionId: null,
    options: [
      { id: 'hs-pkg1-straighten-curl', label: 'Straightening / Curling', price: 549 },
      { id: 'hs-pkg1-curls-waves', label: 'Curls & waves', price: 549 },
      { id: 'hs-pkg1-blowdry-straight', label: 'Blowdry: Straight & smooth', price: 399 },
      { id: 'hs-pkg1-incurl-outcurl', label: 'In-curl / out-curl', price: 399 },
    ],
  },
  {
    id: 'hair-spa', label: 'Hair spa', noneLabel: "I don't need hair spa", defaultOptionId: 'hs-pkg1-ayurvedic-spa',
    options: [
      { id: 'hs-pkg1-ayurvedic-spa', label: 'Ayurvedic strengthening spa', price: 1299 },
      { id: 'hs-pkg1-keratin-spa', label: 'Keratin Hair spa', price: 1299 },
      { id: 'hs-pkg1-loreal-spa', label: "L'Oreal hair spa", price: 1299 },
      { id: 'hs-pkg1-nutripearl-spa', label: 'Nutri Pearl Hair Spa', price: 1299 },
    ],
  },
]

const HAIR_STUDIO_PACKAGES: HairPackage[] = [
  { id: 'hs-pkg-cut-trim-spa-style', name: 'Cut, trim, spa & style', rating: '4.81 (369K reviews)', price: 1698, originalPrice: 1848, durationMin: 105, includes: ['Haircut or trim: Haircut', 'Hair spa: Ayurvedic strengthening spa'], customiser: HS_PKG1_CUSTOMISER },
  { id: 'hs-pkg-cut-trim-style', name: 'Cut, trim & style', rating: '4.82 (304K reviews)', price: 998, originalPrice: 1098, durationMin: 90, includes: ['Haircut or trim: Haircut', 'Hair styling: Straightening'] },
  { id: 'hs-pkg-cut-trim-spa-style-colour', name: 'Cut, trim, spa, style, colour (roots touch up)', rating: '4.80 (398K reviews)', price: 2172, originalPrice: 2397, durationMin: 150, includes: ['Haircut or trim: Haircut', 'Hair spa: L’Oreal hair spa', 'Hair styling: Straightening / Curling'] },
  { id: 'hs-pkg-haircut-botox-keratin', name: 'Haircut & botox/keratin', rating: '4.81 (178K reviews)', price: 5248, originalPrice: 5548, durationMin: 225, includes: ['Keratin: Long-length', 'Haircut or trim: Haircut'] },
  { id: 'hs-pkg-haircut-color', name: 'Haircut & color', rating: '4.80 (167K reviews)', price: 2697, originalPrice: 2847, durationMin: 105, includes: ['Roots: Color (L’Oréal Inoa): Shade 2: Darkest Brown', 'Roots: Color (L’Oréal Majriel): Shade 3: Dark Brown', 'Haircut or trim: Haircut'] },
]

const HAIR_STUDIO_SECTIONS: HairStudioSection[] = [
  {
    id: 'blow-dry-style',
    label: 'Blow-dry & style',
    icon: <IcoHairDryer />,
    items: [
      { id: 'hs-curl-blowdry', title: 'In curl/out curl blow-dry', rating: '4.78 (67K reviews)', price: 399, durationMin: 45, description: 'Beautiful curls, styled in or out, with a perfect blow-dry finish' },
      { id: 'hs-straight-blowdry', title: 'Straight & smooth blow-dry', rating: '4.85 (62K reviews)', price: 399, durationMin: 45, description: 'Sleek, smooth & straight hair with a professional blow-dry' },
      { id: 'hs-advanced-styling', title: 'Advanced Styling', rating: '4.65 (1K reviews)', price: 1000, priceLabel: 'starts-at', durationMin: 60 },
      { id: 'hs-straightening', title: 'Hair straightening', rating: '4.86 (19K reviews)', price: 549, durationMin: 45, description: 'Transform your hair into a sleek, straight look with long-lasting results' },
      { id: 'hs-curls-waves', title: 'Curls & waves', rating: '4.73 (16K reviews)', price: 549, durationMin: 60, description: 'Soft curls or waves for a natural, voluminous hairstyle' },
    ],
  },
  {
    id: 'cut-trim',
    label: 'Cut & trim',
    icon: <IcoScissors />,
    items: [
      { id: 'hs-haircut-women', title: 'Haircut for women', rating: '4.81 (138K reviews)', price: 549, durationMin: 45, description: 'Expert haircut tailored to your style. Blow-dry not included.' },
      { id: 'hs-haircut-girls', title: 'Haircut for girls', rating: '4.82 (8K reviews)', price: 649, durationMin: 45, description: 'A gentle, stylish haircut with care & precision. For girls aged 6-15.' },
      { id: 'hs-haircut-mom-daughter', title: 'Haircut for mom & daughter', rating: '4.80 (6K reviews)', price: 1049, originalPrice: 1299, durationMin: 120 },
      { id: 'hs-hair-trim', title: 'Hair trim', rating: '4.80 (146K reviews)', price: 449, priceLabel: 'starts-at', durationMin: 20, description: 'Split-end removal with minimal length reduction. Blow-dry not included.' },
    ],
  },
  {
    id: 'hair-care',
    label: 'Hair care',
    icon: <IcoSteam />,
    items: [
      {
        id: 'hs-hair-spa', title: 'Hair Spa', bestseller: true, rating: '4.78 (32K reviews)', price: 1299, priceLabel: 'starts-at',
        description: 'Steam therapy to deeply nourish hair from scalp to ends, restoring natural shine',
        // Real variants/ratings/prices from the user's own options-picker screenshot.
        options: [
          { id: 'hs-hairspa-loreal', label: "L'Oréal hair spa", price: 1299, rating: '4.78 (16K reviews)' },
          { id: 'hs-hairspa-keratin', label: 'Keratin hair spa', price: 1299, rating: '4.80 (9K reviews)' },
          { id: 'hs-hairspa-korean', label: 'Korean hair spa', price: 1299, rating: '4.64 (168 reviews)' },
          { id: 'hs-hairspa-ayurvedic', label: 'Ayurvedic strengthening spa', price: 1299 },
        ],
      },
      { id: 'hs-loreal-repair-mask', title: "L'Oréal hair repair mask", rating: '4.77 (4K reviews)', price: 649, durationMin: 40, description: 'Intensive repair mask therapy to strengthen & restore hair' },
      { id: 'hs-head-massage', title: 'Head massage', rating: '4.78 (5K reviews)', price: 349, durationMin: 20, description: 'Gentle massage to help promote blood flow, reduce stress & nourish the scalp', note: 'Hair wash & blow-dry not included' },
    ],
  },
  {
    id: 'keratin-botox',
    label: 'Keratin & botox',
    icon: <IcoFlask />,
    items: [
      {
        id: 'hs-hair-keratin', title: 'Hair keratin', rating: '4.61 (2K reviews)', price: 3999, priceLabel: 'starts-at',
        description: 'Keratin treatment smoothens hair for a shiny, frizz-free look',
        options: [
          { id: 'hs-keratin-shoulder', label: 'Shoulder-length', price: 3999, rating: '4.62 (832 reviews)' },
          { id: 'hs-keratin-long', label: 'Long-length', price: 4999, rating: '4.59 (955 reviews)' },
        ],
      },
      { id: 'hs-hair-botox', title: 'Hair botox', bestseller: true, rating: '4.53 (3K reviews)', price: 5499, durationMin: 180, description: 'Single-session treatment to repair damaged, frizzy hair & promote healthy scalp' },
    ],
  },
  {
    id: 'hair-colour',
    label: 'Hair colour',
    icon: <IcoPalette />,
    items: [
      {
        id: 'hs-colour-application', title: 'Hair colour (application only)', rating: '4.80 (53K reviews)', price: 399, priceLabel: 'starts-at',
        description: 'Even application of the chosen shade from root to tip',
        options: [
          { id: 'hs-colourapp-roots', label: 'Roots colour', price: 399, rating: '4.81 (38K reviews)' },
          { id: 'hs-colourapp-global', label: 'Global colour', price: 699, rating: '4.76 (15K reviews)' },
        ],
      },
      { id: 'hs-loreal-global-colour', title: "L'Oréal Global color", rating: '4.64 (6K reviews)', price: 2399, priceLabel: 'starts-at', durationMin: 60, description: 'Even application of the chosen shade from root to tip' },
      { id: 'hs-loreal-global-fashion', title: "L'Oréal Global fashion hair colour", rating: '4.56 (1K reviews)', price: 2599, priceLabel: 'starts-at', durationMin: 120 },
      { id: 'hs-loreal-root-touchup', title: "L'Oréal root touch up", rating: '4.71 (30K reviews)', price: 999, priceLabel: 'starts-at', durationMin: 30, description: "Gentle, long-lasting root touch-up with L'Oréal Inoa and Majirel shades" },
      {
        id: 'hs-loreal-majirel-touchup', title: "L'Oréal Majirel root touch-up", rating: '4.65 (595 reviews)', price: 1299, priceLabel: 'starts-at',
        description: 'Base hair colour of L’Oréal Inoa or L’Oréal Majirel will be used with the fashion shade', note: 'Hair wash not included',
        options: [
          { id: 'hs-majirel-mahogany-ash', label: 'Mahogany ash brown (shade 4.15)', price: 1299, rating: '4.66 (271 reviews)' },
          { id: 'hs-majirel-light-golden-mahogany', label: 'Light golden mahogany brown (shade 5.35)', price: 1299, rating: '4.59 (161 reviews)' },
          { id: 'hs-majirel-extra-burgundy', label: 'Extra burgundy brown (shade 4.2)', price: 1299, rating: '4.69 (163 reviews)' },
        ],
      },
      {
        id: 'hs-loreal-inoa-touchup', title: "L'Oréal Inoa root touch-up", rating: '4.69 (942 reviews)', price: 1499, priceLabel: 'starts-at',
        description: 'Base hair colour of L’Oréal Inoa or L’Oréal Majirel will be used with the fashion shade', note: 'Hair wash not included',
        // Same shade catalogue as L'Oréal Majirel root touch-up, per the
        // user's own confirmation — priced at this item's own ₹1,499
        // base rather than Majirel's ₹1,299, since shade choice itself
        // doesn't change price on either item.
        options: [
          { id: 'hs-inoa-mahogany-ash', label: 'Mahogany ash brown (shade 4.15)', price: 1499, rating: '4.66 (271 reviews)' },
          { id: 'hs-inoa-light-golden-mahogany', label: 'Light golden mahogany brown (shade 5.35)', price: 1499, rating: '4.59 (161 reviews)' },
          { id: 'hs-inoa-extra-burgundy', label: 'Extra burgundy brown (shade 4.2)', price: 1499, rating: '4.69 (163 reviews)' },
        ],
      },
    ],
  },
  {
    id: 'fashion-color',
    label: 'Fashion color',
    icon: <IcoSparkle />,
    items: [
      {
        id: 'hs-loreal-highlights', title: 'Loreal Hair Highlights', rating: '4.59 (994 reviews)', price: 3499, priceLabel: 'starts-at',
        description: 'Precise application of chosen shade on closely spaced sections', note: 'Blow-dry & hair wash is not included',
        options: [
          { id: 'hs-highlights-mocha-blonde', label: 'Mocha blonde (shade 7.8)', price: 3499, rating: '4.61 (287 reviews)' },
          { id: 'hs-highlights-blonde-golden-iridescent', label: 'Blonde with golden iridescent (shade 7.23)', price: 3499, rating: '4.54 (349 reviews)' },
          { id: 'hs-highlights-magenta-red', label: 'Magenta red', price: 3499, rating: '4.72 (115 reviews)' },
          { id: 'hs-highlights-dark-golden-mahogany', label: 'Dark golden mahogany blonde (shade 6.35)', price: 3499 },
        ],
      },
      {
        id: 'hs-loreal-balayage', title: "L'Oréal balayage/ombre color", rating: '4.51 (1K reviews)', price: 3899, priceLabel: 'starts-at',
        description: 'Seamless application of the chosen shade with a soft colour transition', note: 'Blow-dry & hair wash is not included',
        // Same shade catalogue as Loreal Hair Highlights, per the user's
        // own "same as above" — priced at this item's own ₹3,899 base
        // rather than Highlights' ₹3,499, since shade choice itself
        // doesn't change price on either item.
        options: [
          { id: 'hs-balayage-mocha-blonde', label: 'Mocha blonde (shade 7.8)', price: 3899, rating: '4.61 (287 reviews)' },
          { id: 'hs-balayage-blonde-golden-iridescent', label: 'Blonde with golden iridescent (shade 7.23)', price: 3899, rating: '4.54 (349 reviews)' },
          { id: 'hs-balayage-magenta-red', label: 'Magenta red', price: 3899, rating: '4.72 (115 reviews)' },
          { id: 'hs-balayage-dark-golden-mahogany', label: 'Dark golden mahogany blonde (shade 6.35)', price: 3899 },
        ],
      },
    ],
  },
  {
    id: 'hair-extensions',
    label: 'Hair extensions',
    icon: <IcoExtension />,
    items: [
      {
        id: 'hs-scalp-toppers', title: 'Scalp toppers', price: 6499, priceLabel: 'starts-at', durationMin: 60,
        description: 'Conceals thinning & bald patches on your scalp', note: '100% human hair & silk base toppers by Hair Originals',
        options: [
          { id: 'hs-scalptoppers-14in', label: '14 inches', price: 6499 },
          { id: 'hs-scalptoppers-16in', label: '16 inches', price: 8299 },
          { id: 'hs-scalptoppers-18in', label: '18 inches', price: 8999 },
          { id: 'hs-scalptoppers-20in', label: '20 inches', price: 10999 },
          { id: 'hs-scalptoppers-22in', label: '22 inches', price: 11499 },
        ],
      },
    ],
  },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other Women's Salon & Spa screen.
const SECTION_BANNERS: Record<string, { title: string; subtitle: string }> = {
  'blow-dry-style': { title: 'Finish it off right', subtitle: 'Blow-dry, curls, waves & straightening for any occasion.' },
  'cut-trim': { title: 'A cut made for you', subtitle: 'Precision haircuts and trims from trained stylists.' },
  'hair-care': { title: 'Give your hair some love', subtitle: 'Nourishing spa & repair therapies for softer, healthier hair.' },
  'keratin-botox': { title: 'Smooth, frizz-free hair', subtitle: 'Keratin & botox treatments for lasting shine.' },
  'hair-colour': { title: 'Colour that suits you', subtitle: 'From root touch-ups to a full global colour, done at home.' },
  'fashion-color': { title: 'Make a statement', subtitle: 'Highlights, balayage & ombre for a bolder look.' },
  'hair-extensions': { title: 'Instantly fuller hair', subtitle: 'Toppers and extensions for natural-looking volume.' },
}

const JUMP_TARGETS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'packages', label: 'Packages', icon: <IcoPackage /> },
  ...HAIR_STUDIO_SECTIONS.map(s => ({ id: s.id, label: s.label, icon: s.icon })),
]

const ALL_HAIR_STUDIO_ITEMS = HAIR_STUDIO_SECTIONS.flatMap(s => s.items)
function getHairStudioItem(id: string): HairStudioItem {
  const item = ALL_HAIR_STUDIO_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown hair studio item id: ${id}`)
  return item
}
/** This item's own section icon — the same visual every HairLineItemRow
 *  already shows for it, reused on its options picker too. */
function getHairStudioItemIcon(id: string): React.ReactNode {
  return HAIR_STUDIO_SECTIONS.find(s => s.items.some(i => i.id === id))?.icon
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
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Hair Studio</span>
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
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Hair Studio for Women</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'hair-studio-for-women' })}
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

// ─── Hero — no real hair-studio photo exists in this project, so this
// uses the same warm-gradient + icon placeholder every other missing-
// photo surface in this app falls back to. ─────────────────────────

function HeroBanner({ onExplore, onViewAddOns }: { onExplore: () => void; onViewAddOns: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Hair Studio</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Salon-fresh hair,<br />without leaving home.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Cuts, colour &amp; hair spa treatments from trained stylists.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore services
          </button>
          <button
            onClick={onViewAddOns}
            className="h-10 px-5 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[13px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
            style={{ fontFamily: FONT_BODY }}
          >
            View packages
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[#722ED1] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoScissors /></div>
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

// ─── Card chrome — same "calm card" language as every other Women's
// Salon & Spa screen: CARD_SURFACE row (128×128 icon panel + content +
// price/button). ─────────────────────────────────────────────────────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const PHOTO_PANEL: React.CSSProperties = {
  background: '#F9F4FF',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-white border-[#E3DDD7] text-[#722ED1] hover:bg-[#F3EAFF] hover:border-[#722ED1]'
const NEUTRAL_BTN_ADDED = 'bg-[#F3EAFF] border-[#722ED1] text-[#722ED1] hover:bg-[#F3EAFF]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

// Package card — same layout as Salon Luxe's own PackageCard: a photo
// panel with the discount % drawn directly on it, breakdown bullets,
// an "Edit your package" button (scrolls to a relevant section, same
// honest fallback Salon Luxe uses for its own non-customised packages
// rather than a bespoke customiser per package), price + Add on the
// right.
function PackageCard({ pkg, cartCount, onAdd, onEdit }: {
  pkg: HairPackage
  cartCount: number
  onAdd: () => void
  onEdit: () => void
}) {
  const discountPct = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 w-full h-[100px] sm:w-[170px] sm:h-auto rounded-[8px] flex items-center justify-center" style={PHOTO_PANEL}>
        <div className="text-center leading-[1.05]">
          <span className="block text-[28px] sm:text-[38px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{discountPct}%</span>
          <span className="block text-[28px] sm:text-[38px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>OFF</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[0.06em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Package</span>
            <span className="text-[17px] sm:text-[18px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{pkg.name}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {pkg.rating}</span>
          </div>
          <ul className="flex flex-col gap-1 pl-4 m-0" style={{ listStyle: 'disc' }}>
            {pkg.includes.map(inc => (
              <li key={inc} className="text-[12px] text-[#242326] leading-snug" style={{ fontFamily: FONT_BODY }}>{inc}</li>
            ))}
          </ul>
          <button onClick={onEdit} className={`self-start ${NEUTRAL_BTN} ${NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
            Edit your package
          </button>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 sm:w-[140px] gap-3">
          <div className="text-left sm:text-right">
            <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
              <span className="line-through text-[#9A949D]">₹{pkg.originalPrice.toLocaleString('en-IN')}</span> <span className="font-semibold text-[#242326]">₹{pkg.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] font-semibold text-[#722ED1] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(pkg.durationMin)}</div>
          </div>
          <button onClick={onAdd} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
            {cartCount ? `Added ×${cartCount}` : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Package customiser — the real "Edit your package" popup, built
// from the user's own screenshot. Data-driven (any package with a
// `customiser` config can reuse this), same row/fieldset/footer shapes
// as Salon Luxe's own PackageCustomiserModal: a radio group per
// category (plus a "none" row), a live total, and an "Add to cart"
// footer. The package's own discount is preserved as a fraction of
// whatever raw total gets configured — not a flat rupee amount — so it
// scales sensibly as items are added or removed. ──────────────────────

const PKG_ROW_BASE = 'flex items-center gap-3 rounded-[10px] border px-3.5 py-3 transition-all cursor-pointer'
const PKG_ROW_DEFAULT = 'bg-white border-[#E3DDD7] hover:border-[#722ED1]'
const PKG_ROW_SELECTED = 'bg-[#F9F5FF] border-[#722ED1]'

// A customised package builds its own real total from whichever options
// were actually picked — kept as this small, local shape (not the shared
// CustomerCartItem, which has no `breakdown` field) and folded into the
// cart line's own title by addCustomPackageToCart below, the same "no
// second cart item type" discipline every other migrated screen follows.
interface CustomPackageCartInput {
  cartId: string
  title: string
  duration?: string
  price: number
  originalPrice: number
  breakdown: string[]
}

function PackageCustomiserModal({ pkg, onAddToCart, onClose }: {
  pkg: HairPackage
  onAddToCart: (item: CustomPackageCartInput) => void
  onClose: () => void
}) {
  const categories = pkg.customiser ?? []
  const [sel, setSel] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(categories.map(c => [c.id, c.defaultOptionId]))
  )
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  const select = (categoryId: string, optionId: string | null) => {
    setValidationMessage(null)
    setSel(prev => ({ ...prev, [categoryId]: optionId }))
  }

  const chosen = categories.map(cat => ({
    category: cat,
    option: cat.options.find(o => o.id === sel[cat.id]) ?? null,
  }))
  const rawTotal = chosen.reduce((sum, c) => sum + (c.option?.price ?? 0), 0)
  const discountFraction = (pkg.originalPrice - pkg.price) / pkg.originalPrice
  const finalPrice = Math.round(rawTotal * (1 - discountFraction))
  const saved = rawTotal - finalPrice

  const handleAddToCart = () => {
    if (rawTotal === 0) {
      setValidationMessage('Pick at least one service to add this package.')
      return
    }
    onAddToCart({
      cartId: `${pkg.id}-custom-${Date.now()}`,
      title: `${pkg.name} (customised)`,
      duration: formatDuration(pkg.durationMin),
      price: finalPrice,
      originalPrice: rawTotal,
      breakdown: chosen.filter(c => c.option).map(c => `${c.category.label}: ${c.option!.label}`),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hair-pkg-customiser-title"
        className="w-full sm:max-w-[560px] h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-[20px] sm:rounded-[16px] bg-white flex flex-col overflow-hidden"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1.5 px-5 py-5 border-b border-[#F4F0EC] shrink-0" style={{ background: 'linear-gradient(120deg, #FFF3EA 0%, #FDEBEF 100%)' }}>
          <div className="flex items-start justify-between gap-3">
            <h2 id="hair-pkg-customiser-title" className="text-[20px] font-semibold text-[#242326] leading-tight m-0" style={{ fontFamily: FONT_HEAD }}>{pkg.name}</h2>
            <button onClick={onClose} aria-label="Close package editor" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[#68636D] hover:bg-white/70 hover:text-[#242326] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
              <IcoCloseX />
            </button>
          </div>
          <span className="flex items-center gap-1.5 text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
            Service time: {formatDuration(pkg.durationMin)}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {categories.map(cat => (
            <fieldset key={cat.id} className="flex flex-col gap-2 border-0 p-0 m-0">
              <legend className="text-[16px] font-semibold text-[#242326] px-0 mb-1" style={{ fontFamily: FONT_HEAD }}>{cat.label}</legend>
              {cat.options.map(opt => (
                <label key={opt.id} className={`${PKG_ROW_BASE} ${sel[cat.id] === opt.id ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                  <input type="radio" name={`hair-pkg-${cat.id}`} checked={sel[cat.id] === opt.id} onChange={() => select(cat.id, opt.id)} className="w-4 h-4 shrink-0" style={{ accentColor: '#242326' }} />
                  <span className="flex-1 text-[14.5px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>{opt.label}</span>
                  <span className="text-[13px] text-[#9A949D] shrink-0" style={{ fontFamily: FONT_BODY }}>₹{opt.price.toLocaleString('en-IN')}</span>
                </label>
              ))}
              <label className={`${PKG_ROW_BASE} ${sel[cat.id] === null ? PKG_ROW_SELECTED : PKG_ROW_DEFAULT}`}>
                <input type="radio" name={`hair-pkg-${cat.id}`} checked={sel[cat.id] === null} onChange={() => select(cat.id, null)} className="w-4 h-4 shrink-0" style={{ accentColor: '#242326' }} />
                <span className="flex-1 text-[14.5px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>{cat.noneLabel}</span>
              </label>
            </fieldset>
          ))}
        </div>

        <div className="shrink-0 flex flex-col gap-0">
          {saved > 0 && (
            <div className="flex items-center gap-2 px-5 py-2.5" style={{ backgroundColor: '#0F7A3D' }}>
              <span className="text-white shrink-0"><IcoBolt /></span>
              <span className="text-[12.5px] text-white font-medium" style={{ fontFamily: FONT_BODY }}>You are saving ₹{saved} in this package</span>
            </div>
          )}
          <div className="border-t border-[#F4F0EC] bg-white px-5 py-4 flex flex-col gap-2">
            {validationMessage && (
              <span role="alert" className="text-[12px] text-[#B3261E] font-medium" style={{ fontFamily: FONT_BODY }}>{validationMessage}</span>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[19px] font-semibold text-[#242326] whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>
                ₹{finalPrice.toLocaleString('en-IN')}{saved > 0 && <span className="line-through text-[#9A949D] text-[14px] font-normal ml-1.5">₹{rawTotal.toLocaleString('en-IN')}</span>}
              </span>
              <button
                onClick={handleAddToCart}
                className="h-11 px-6 rounded-[10px] bg-[#722ED1] text-white text-[14px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
                style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HairLineItemRow({ item, icon, onSelect, onViewDetails, cartCount, getCartCount }: {
  item: HairStudioItem
  icon: React.ReactNode
  onSelect: () => void
  onViewDetails: () => void
  cartCount: number
  /** Looks up how many of a given cart-line id are in the cart — used
   *  here to check each of this item's OPTION ids (not just the item's
   *  own id) so a selected variant can be called out on the card. */
  getCartCount: (id: string) => number
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative shrink-0 mx-auto sm:mx-0">
        <div className="w-32 h-32 shrink-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]">
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
        <span className="text-[15px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        {item.rating && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        )}
        {item.description && (
          <span className="text-[12px] text-[#68636D] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.description}</span>
        )}
        {item.note && (
          <span className="text-[11.5px] text-[#9A949D] leading-snug italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>
        )}
        {/* Once one (or more) real options are selected, that replaces
            the plain "N options" hint with what was actually picked —
            same idea as Salon Luxe's own options items. */}
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
            <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.options.length} options available</span>
          )
        ) : item.optionsCount && (
          <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} options available</span>
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          View details
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
            {item.priceLabel === 'starts-at' && <span className="text-[#68636D]">Starts at </span>}
            {item.originalPrice && <span className="line-through text-[#9A949D]">₹{item.originalPrice.toLocaleString('en-IN')}</span>} <span className="font-semibold text-[#242326]">₹{item.price.toLocaleString('en-IN')}</span>
          </div>
          {item.durationMin && (
            <div className="text-[11px] font-semibold text-[#722ED1] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
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
// user-supplied option data (currently just "Hair Spa"). Same calm
// card language as the rest of this file (CARD_SURFACE, NEUTRAL_BTN),
// same component Salon Luxe/Spa Prime use for their own options items —
// not a separate visual system, and not the reference's own horizontal
// photo-carousel widget. ────────────────────────────────────────────

function OptionsModal({ item, icon, cartCountForOption, onAddOption, onClose }: {
  item: HairStudioItem
  icon: React.ReactNode
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: HairItemOption) => void
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
                  <span className="text-[13px] font-semibold text-[#242326] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>₹{opt.price.toLocaleString('en-IN')}</span>
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

// ─── "View details" — same focused-modal pattern as Spa Ayurveda's own
// ServiceDetailModal: the same info the row already shows, plus its own
// Add button, so the link is genuinely interactive rather than inert.
function ServiceDetailModal({ item, cartCount, onSelect, onClose }: {
  item: HairStudioItem
  cartCount: number
  onSelect: () => void
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
            {item.bestseller && (
              <span className="self-start flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap" style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}>
                ★ Bestseller
              </span>
            )}
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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
              {item.priceLabel === 'starts-at' && <span className="text-[#68636D]">Starts at </span>}
              {item.originalPrice && <span className="line-through text-[#9A949D] mr-1">₹{item.originalPrice.toLocaleString('en-IN')}</span>}
              <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
            </span>
            {item.durationMin && <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>}
          </div>
          {item.description && <p className="text-[13px] text-[#242326] leading-relaxed m-0" style={{ fontFamily: FONT_BODY }}>{item.description}</p>}
          {item.note && <span className="text-[12px] text-[#9A949D] italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>}
          {(item.options?.length || item.optionsCount) && (
            <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.options?.length ?? item.optionsCount} options available</span>
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

export default function HairStudioForWomenScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItemId, setDetailItemId] = useState<string | null>(null)
  const [customiserPkgId, setCustomiserPkgId] = useState<string | null>(null)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  const addToCart = (entry: Addable) => {
    addItem({
      cartId: entry.id,
      serviceEntry: 'home-services',
      categoryId: 'hair-studio-for-women',
      serviceId: entry.id,
      serviceName: entry.title,
      title: entry.title,
      price: entry.price,
      originalPrice: entry.originalPrice ?? entry.price,
      duration: entry.durationMin ? formatDuration(entry.durationMin) : undefined,
    })
  }

  // The package customiser builds its own real total from whichever
  // options were actually picked — its breakdown has no field on the
  // shared cart's own item type, so it's folded into this line's own
  // title instead (never a second, richer cart-item type).
  const addCustomPackageToCart = (item: CustomPackageCartInput) => {
    addItem({
      cartId: item.cartId,
      serviceEntry: 'home-services',
      categoryId: 'hair-studio-for-women',
      serviceId: item.cartId,
      serviceName: item.title,
      title: item.breakdown.length > 0 ? `${item.title} — ${item.breakdown.join(', ')}` : item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      duration: item.duration,
    })
  }

  // A selected option becomes its own cart line — titled "Item — Option"
  // so the cart stays legible about exactly what was booked — then the
  // picker closes.
  const addOptionToCart = (item: HairStudioItem, option: HairItemOption) => {
    addToCart({ id: option.id, title: `${item.title} — ${option.label}`, price: option.price })
    setExpandedItemId(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`hair-studio-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'hair-studio-for-women',
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
                  other Women's Salon & Spa screen. */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Women's Salon &amp; Spa</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Hair Studio for Women
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('cut-trim')} onViewAddOns={() => jumpToSection('packages')} />
                  <ServiceTabs onJump={jumpToSection} />

                  <div id="hair-studio-section-packages" className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                    <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Packages</h2>
                    <div className="flex flex-col gap-3">
                      {HAIR_STUDIO_PACKAGES.map(pkg => (
                        <PackageCard
                          key={pkg.id}
                          pkg={pkg}
                          cartCount={cartCountForItem(pkg.id)}
                          onAdd={() => addToCart({ id: pkg.id, title: pkg.name, price: pkg.price, originalPrice: pkg.originalPrice, durationMin: pkg.durationMin })}
                          onEdit={pkg.customiser ? () => setCustomiserPkgId(pkg.id) : () => jumpToSection('cut-trim')}
                        />
                      ))}
                    </div>
                  </div>

                  {HAIR_STUDIO_SECTIONS.map(section => (
                    <div key={section.id} id={`hair-studio-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                      <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                      <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                      {section.items.map(item => (
                        <HairLineItemRow
                          key={item.id}
                          item={item}
                          icon={section.icon}
                          cartCount={cartCountForItem(item.id)}
                          getCartCount={cartCountForItem}
                          onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))}
                          onViewDetails={() => setDetailItemId(item.id)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Right column — pinned on desktop, same as every other
                    Women's Salon & Spa screen. */}
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

      {detailItemId && (
        <ServiceDetailModal
          item={getHairStudioItem(detailItemId)}
          cartCount={cartCountForItem(detailItemId)}
          onSelect={() => {
            const item = getHairStudioItem(detailItemId)
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
          item={getHairStudioItem(expandedItemId)}
          icon={getHairStudioItemIcon(expandedItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getHairStudioItem(expandedItemId), option)}
          onClose={() => setExpandedItemId(null)}
        />
      )}

      {customiserPkgId && (() => {
        const pkg = HAIR_STUDIO_PACKAGES.find(p => p.id === customiserPkgId)
        if (!pkg) return null
        return (
          <PackageCustomiserModal
            pkg={pkg}
            onAddToCart={addCustomPackageToCart}
            onClose={() => setCustomiserPkgId(null)}
          />
        )
      })()}
    </div>
  )
}
