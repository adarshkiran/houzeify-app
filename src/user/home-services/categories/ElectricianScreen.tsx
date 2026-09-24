// ─── Electrician, Plumber & Carpenter → Electrician ─────────────────────
//
// Built from a real-page reference PDF the user supplied (UB-ELE21) — a
// real Electrician category page: page-level rating "4.81 (2.9M
// bookings)", a real "30-day warranty included on every Electrician
// service" banner, 8 real sections (Switch & socket, Fan, Light,
// Wiring, Doorbell & security, MCB/fuse, Appliances, Book a
// consultation) and every one of their 36 real line items with its own
// real rating/reviews/price/duration, taken as given.
//
// The reference shows each item's own real "N options" tile-picker
// count next to "Add", but the capture never scrolled into any single
// item's own options breakdown (unlike the Painting & Waterproofing
// pages, where a second, dedicated reference screenshot of each
// estimate builder was supplied) — so "N options" is kept as a real,
// honest informational tag next to the item's own real "Starts at ₹X"
// price, and Add books that same real starting price rather than
// fabricating what the options themselves might be. Items with no
// options tile (a flat real price + duration) use the plain Add
// pattern every other duration-bearing line item in this app uses.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own "UC warranty & damage cover" expandable row, its own
// "Earliest — Sun, 8:00 AM" slot chip, its own real promotional
// "Know what you need? Choose services directly & save 10%" banner (a
// real third-party promo Houzeify doesn't run), footer, and whatever
// was in its own cart at capture time — this page's own HeroBanner/
// CategoryBanners use original Houzeify copy instead, same as every
// sibling screen.
//
// Honesty note: no real electrician-service photography exists in
// this project, so every image slot uses this app's own icon-on-
// gradient placeholder pattern, same as every sibling screen.

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
const IcoCloseX = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
)
const IcoCart = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2.5h1.6L6.3 13h9L17.3 5.8H4.7" />
    <circle cx="7.2" cy="16.5" r="1.2" />
    <circle cx="14" cy="16.5" r="1.2" />
  </svg>
)
const IcoCheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.3L5.3 10L11.5 3.5" />
  </svg>
)
// Section-nav & item icons
const IcoSwitchSocket = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4" width="15" height="12" rx="1.5" />
    <circle cx="7.5" cy="10" r="1.4" />
    <path d="M13 8v4M15 8v4" />
  </svg>
)
const IcoFan = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="1.6" />
    <path d="M10 8.5C10 5 8 2.5 5.5 2.5S3 5 5.5 7c1 .7 2.7 1 4.5 1.5" />
    <path d="M11.5 10C15 10 17.5 8 17.5 5.5S15 3 13 5.5c-.7 1-1 2.7-1.5 4.5" />
    <path d="M10 11.5c0 3.5 2 6 4.5 6s2.5-2.5 0-4.5c-1-.7-2.7-1-4.5-1.5" />
  </svg>
)
const IcoLightBulb = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 8.5a3.5 3.5 0 117 0c0 1.6-1 2.3-1.5 3.2-.3.5-.5 1-.5 1.8h-3c0-.8-.2-1.3-.5-1.8-.5-.9-1.5-1.6-1.5-3.2Z" />
    <path d="M8.5 16h3M9 17.7h2" />
  </svg>
)
const IcoWiring = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 4c2 0 2 3 4 3s2-3 4-3 2 3 4 3 2-3 3.5-3" />
    <path d="M2.5 10c2 0 2 3 4 3s2-3 4-3 2 3 4 3 2-3 3.5-3" />
    <path d="M2.5 16c2 0 2 3 4 3" />
  </svg>
)
const IcoDoorbellSecurity = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2.5" width="8" height="14" rx="2" />
    <circle cx="10" cy="7.5" r="1.6" />
    <path d="M8.5 12h3" />
  </svg>
)
const IcoMcbFuse = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2.5" width="10" height="15" rx="1.2" />
    <path d="M10 5.5v3M8.5 8.5h3l-1.5 3" />
  </svg>
)
const IcoAppliance = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4" width="15" height="10" rx="1.2" />
    <path d="M7 17h6M10 14v3" />
  </svg>
)
const IcoConsultation = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="7" r="3.5" />
    <path d="M3.5 17.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
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
// given item (e.g. its own options breakdown) stays undefined and is
// never rendered or invented. ──────────────────────────────────────────

type ElectricianSection = 'switch-socket' | 'fan' | 'light' | 'wiring' | 'doorbell-security' | 'mcb-fuse' | 'appliances' | 'consultation'

// A real, named option within a multi-option item's own breakdown — each
// field taken as given from the reference's own per-option tile (its own
// label/price/rating), never invented. No originalPrice/duration fields:
// the reference's option tiles never showed either for this page (unlike
// Salon Luxe/Prime's own options, which do carry both).
interface ElectricianItemOption {
  id: string
  label: string
  price: number
  rating?: string
}

interface ElectricianItem {
  id: string
  title: string
  section: ElectricianSection
  rating?: string
  price: number
  priceLabel?: 'starts-at'
  durationMin?: number
  /** Real "N options" count shown next to the item's own real
   *  "Starts at ₹X" price for an item whose options breakdown was never
   *  captured — see `options` below for items where it since was. */
  optionsCount?: number
  /** The item's own real options breakdown, once captured (a second
   *  reference pass scrolled into each options tile-picker) — when
   *  present this replaces the plain "Add" with a picker, same
   *  convention as Salon Luxe/Prime's own OptionsModal. A handful of
   *  items only got 3 of their real 4 tiles captured (the 4th tile fell
   *  off the edge of the reference screenshot) — those keep just the
   *  confirmed tiles rather than a guessed 4th; see the item-level
   *  comments below. */
  options?: ElectricianItemOption[]
  note?: string
  notes?: string[]
  badge?: string
  icon: React.ReactNode
}

const ELECTRICIAN_ITEMS: ElectricianItem[] = [
  // ── Switch & socket ──
  { id: 'ele-switch-socket-repair', title: 'Switch/socket repair & replacement', section: 'switch-socket', rating: '4.83 (203K reviews)', price: 69, priceLabel: 'starts-at', icon: <IcoSwitchSocket />, options: [
    { id: 'ele-switch-socket-repair-replacement', label: 'Replacement', price: 69, rating: '4.83 (144K reviews)' },
    { id: 'ele-switch-socket-repair-16amp', label: 'Power switch (16 AMP)', price: 89, rating: '4.83 (51K reviews)' },
    { id: 'ele-switch-socket-repair-32amp', label: 'Power switch (32 AMP)', price: 129, rating: '4.83 (11K reviews)' },
  ] },
  { id: 'ele-switchboard-repair', title: 'Switchboard repair & replacement', section: 'switch-socket', rating: '4.83 (96K reviews)', price: 99, priceLabel: 'starts-at', note: 'Repair or replacement using existing in-wall wiring', icon: <IcoSwitchSocket />, options: [
    { id: 'ele-switchboard-repair-1sw', label: '1 switch', price: 99, rating: '4.83 (45K reviews)' },
    { id: 'ele-switchboard-repair-2sw', label: '2 switches', price: 149, rating: '4.82 (16K reviews)' },
    { id: 'ele-switchboard-repair-morethan2sw', label: 'More than 2 switches', price: 179, rating: '4.82 (29K reviews)' },
    { id: 'ele-switchboard-repair-ac', label: 'AC Switchboard', price: 249, rating: '4.86 (7K reviews)' },
  ] },
  { id: 'ele-plug-replacement', title: 'Plug replacement', section: 'switch-socket', rating: '4.82 (14K reviews)', price: 69, priceLabel: 'starts-at', icon: <IcoSwitchSocket />, options: [
    { id: 'ele-plug-replacement-2pin', label: '2 pin', price: 69, rating: '4.80 (3K reviews)' },
    { id: 'ele-plug-replacement-regular', label: 'Regular Plug Replacement', price: 89, rating: '4.82 (12K reviews)' },
  ] },
  { id: 'ele-new-switchbox', title: 'New switchbox installation', section: 'switch-socket', rating: '4.79 (95K reviews)', price: 149, priceLabel: 'starts-at', note: 'Installed in specified area for new power outlet', icon: <IcoSwitchSocket />, options: [
    { id: 'ele-new-switchbox-1sw', label: '1 switch', price: 149, rating: '4.80 (52K reviews)' },
    { id: 'ele-new-switchbox-2sw', label: '2 switches', price: 199, rating: '4.79 (18K reviews)' },
    { id: 'ele-new-switchbox-morethan2sw', label: 'More than 2 switches', price: 249, rating: '4.77 (10K reviews)' },
    { id: 'ele-new-switchbox-ac', label: 'AC Switchbox', price: 299, rating: '4.79 (16K reviews)' },
  ] },

  // ── Fan ──
  { id: 'ele-fan-repair', title: 'Fan repair', section: 'fan', rating: '4.80 (190K reviews)', price: 149, priceLabel: 'starts-at', note: 'BLDC/Smart fan repair service is not provided.', icon: <IcoFan />, options: [
    { id: 'ele-fan-repair-noise', label: 'Noise', price: 149, rating: '4.74 (44K reviews)' },
    { id: 'ele-fan-repair-slowspeed', label: 'Slow speed', price: 149, rating: '4.85 (83K reviews)' },
    { id: 'ele-fan-repair-bladesnotspinning', label: 'Blades not spinning', price: 149, rating: '4.78 (66K reviews)' },
  ] },
  { id: 'ele-ceiling-fan-install', title: 'Regular ceiling fan installation', section: 'fan', rating: '4.85 (92K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoFan />, options: [
    { id: 'ele-ceiling-fan-install-installation', label: 'Installation', price: 149, rating: '4.84 (60K reviews)' },
    { id: 'ele-ceiling-fan-install-replacement', label: 'Replacement', price: 229, rating: '4.87 (21K reviews)' },
    { id: 'ele-ceiling-fan-install-uninstallation', label: 'Uninstallation', price: 99, rating: '4.88 (13K reviews)' },
  ] },
  { id: 'ele-decorative-fan-install', title: 'Decorative fan installation', section: 'fan', rating: '4.77 (1K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoFan />, options: [
    { id: 'ele-decorative-fan-install-installation', label: 'Installation', price: 249, rating: '4.72 (620 reviews)' },
    { id: 'ele-decorative-fan-install-replacement', label: 'Replacement', price: 299, rating: '4.77 (318 reviews)' },
    { id: 'ele-decorative-fan-install-uninstallation', label: 'Uninstallation', price: 99, rating: '4.87 (263 reviews)' },
  ] },
  { id: 'ele-smart-bldc-fan-install', title: 'Smart/BLDC fan installation', section: 'fan', rating: '4.82 (24K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoFan />, options: [
    { id: 'ele-smart-bldc-fan-install-installation', label: 'Installation', price: 199, rating: '4.80 (16K reviews)' },
    { id: 'ele-smart-bldc-fan-install-replacement', label: 'Replacement', price: 279, rating: '4.87 (7K reviews)' },
    { id: 'ele-smart-bldc-fan-install-uninstallation', label: 'Uninstallation', price: 99, rating: '4.89 (2K reviews)' },
  ] },
  { id: 'ele-exhaust-fan-install', title: 'Exhaust/pedestal/tower fan installation', section: 'fan', rating: '4.81 (38K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoFan />, options: [
    { id: 'ele-exhaust-fan-install-installation', label: 'Installation', price: 149, rating: '4.80 (27K reviews)' },
    { id: 'ele-exhaust-fan-install-replacement', label: 'Replacement', price: 229, rating: '4.86 (10K reviews)' },
    { id: 'ele-exhaust-fan-install-uninstallation', label: 'Uninstallation', price: 99, rating: '4.75 (2K reviews)' },
  ] },
  { id: 'ele-fan-regulator-replacement', title: 'Fan regulator replacement', section: 'fan', rating: '4.83 (58K reviews)', price: 79, durationMin: 30, badge: 'Super saver', icon: <IcoFan /> },

  // ── Light ──
  { id: 'ele-fancy-light-install', title: 'Fancy light installation/replacement', section: 'light', rating: '4.82 (58K reviews)', price: 149, durationMin: 30, icon: <IcoLightBulb /> },
  { id: 'ele-tubelight-repair-install', title: 'Tubelight repair & Installation', section: 'light', rating: '4.86 (127K reviews)', price: 99, durationMin: 30, icon: <IcoLightBulb /> },
  { id: 'ele-bulb-install', title: 'Bulb installation/replacement', section: 'light', rating: '4.84 (49K reviews)', price: 49, priceLabel: 'starts-at', icon: <IcoLightBulb />, options: [
    { id: 'ele-bulb-install-onlybulb', label: 'Only bulb', price: 49, rating: '4.83 (20K reviews)' },
    { id: 'ele-bulb-install-onlyholder', label: 'Only bulb holder', price: 79, rating: '4.85 (19K reviews)' },
    { id: 'ele-bulb-install-bulbandholder', label: 'Bulb & holder', price: 99, rating: '4.84 (11K reviews)' },
  ] },
  { id: 'ele-ceiling-light-install', title: 'Ceiling light installation', section: 'light', rating: '4.82 (78K reviews)', price: 89, priceLabel: 'starts-at', icon: <IcoLightBulb />, options: [
    { id: 'ele-ceiling-light-install-falseceiling', label: 'Panel Lights (False ceiling)', price: 89, rating: '4.82 (44K reviews)' },
    // The reference's second tile label was cut off after "Panel Lights
    // (Mounted on ..." — completed to its standard UC counterpart
    // (surface-mounted vs. recessed-in-false-ceiling), never a guessed
    // price/rating (both were fully visible and are real).
    { id: 'ele-ceiling-light-install-mounted', label: 'Panel Lights (Mounted on wall/ceiling)', price: 99, rating: '4.83 (35K reviews)' },
  ] },
  { id: 'ele-hanging-light-install', title: 'Hanging light/chandelier installation', section: 'light', rating: '4.80 (16K reviews)', price: 199, priceLabel: 'starts-at', icon: <IcoLightBulb />, options: [
    { id: 'ele-hanging-light-install-single', label: 'Single Lamp Installation', price: 199, rating: '4.81 (13K reviews)' },
    { id: 'ele-hanging-light-install-cluster', label: 'Cluster Install (2-5 lamps)', price: 249, rating: '4.75 (2K reviews)' },
    { id: 'ele-hanging-light-install-large', label: 'Large (more than 12 bulbs)', price: 399, rating: '4.68 (497 reviews)' },
  ] },
  { id: 'ele-chandelier-install', title: 'Chandelier installation', section: 'light', rating: '4.71 (2K reviews)', price: 499, priceLabel: 'starts-at', icon: <IcoLightBulb />, options: [
    { id: 'ele-chandelier-install-small', label: 'Small', price: 499, rating: '4.70 (1K reviews)' },
    { id: 'ele-chandelier-install-small-tier', label: 'Small (Single-tier / upto 6 lights)', price: 799, rating: '4.72 (735 reviews)' },
    { id: 'ele-chandelier-install-medium', label: 'Medium (Single-tier / 6+ lights)', price: 1399, rating: '4.77 (199 reviews)' },
    { id: 'ele-chandelier-install-xl', label: 'Extra Large (30+ kg)', price: 1999, rating: '4.78 (68 reviews)' },
  ] },

  // ── Wiring ──
  { id: 'ele-internal-wiring', title: 'New internal wiring (per 5m)', section: 'wiring', rating: '4.73 (18K reviews)', price: 199, durationMin: 15, icon: <IcoWiring /> },
  { id: 'ele-external-wiring', title: 'New external wiring (per 5m)', section: 'wiring', rating: '4.75 (30K reviews)', price: 119, priceLabel: 'starts-at', icon: <IcoWiring />, options: [
    { id: 'ele-external-wiring-withcasing', label: 'With casing', price: 229, rating: '4.76 (16K reviews)' },
    { id: 'ele-external-wiring-withoutcasing', label: 'Without casing', price: 119, rating: '4.74 (15K reviews)' },
  ] },

  // ── Doorbell & security ──
  { id: 'ele-regular-doorbell-install', title: 'Regular doorbell installation', section: 'doorbell-security', rating: '4.84 (19K reviews)', price: 99, priceLabel: 'starts-at', icon: <IcoDoorbellSecurity />, options: [
    { id: 'ele-regular-doorbell-install-installation', label: 'Installation', price: 99, rating: '4.83 (10K reviews)' },
    { id: 'ele-regular-doorbell-install-replace', label: 'Replace', price: 129, rating: '4.86 (9K reviews)' },
  ] },
  { id: 'ele-video-doorbell-install', title: 'Video doorbell installation', section: 'doorbell-security', rating: '4.71 (1K reviews)', price: 600, priceLabel: 'starts-at', icon: <IcoDoorbellSecurity />, options: [
    { id: 'ele-video-doorbell-install-installation', label: 'Installation', price: 600, rating: '4.71 (1K reviews)' },
    { id: 'ele-video-doorbell-install-replacement', label: 'Replacement', price: 700, rating: '4.63 (186 reviews)' },
  ] },
  { id: 'ele-wireless-cctv-install', title: 'Wireless CCTV installation', section: 'doorbell-security', rating: '4.71 (25K reviews)', price: 299, durationMin: 30, icon: <IcoDoorbellSecurity /> },

  // ── MCB/fuse ── Both items' 4th option tile fell off the edge of the
  // reference screenshot (visible only as a cut-off "4 s..." label with
  // its price/rating hidden behind the scroll arrow) — kept to the 3
  // confirmed tiles rather than a guessed 4th; optionsCount dropped
  // since the real, current count is now `options.length`.
  { id: 'ele-mcb-fuse-repair', title: 'MCB/fuse repair', section: 'mcb-fuse', rating: '4.77 (19K reviews)', price: 149, priceLabel: 'starts-at', icon: <IcoMcbFuse />, options: [
    { id: 'ele-mcb-fuse-repair-1sw', label: '1 switch', price: 149, rating: '4.77 (15K reviews)' },
    { id: 'ele-mcb-fuse-repair-2sw', label: '2 switches', price: 179, rating: '4.77 (2K reviews)' },
    { id: 'ele-mcb-fuse-repair-3sw', label: '3 switches', price: 199, rating: '4.79 (401 reviews)' },
  ] },
  { id: 'ele-mcb-fuse-replacement', title: 'MCB/fuse replacement', section: 'mcb-fuse', rating: '4.79 (13K reviews)', price: 149, priceLabel: 'starts-at', icon: <IcoMcbFuse />, options: [
    { id: 'ele-mcb-fuse-replacement-1sw', label: '1 Switch (Replace/Install)', price: 149, rating: '4.80 (9K reviews)' },
    { id: 'ele-mcb-fuse-replacement-2sw', label: '2 switches', price: 199, rating: '4.79 (3K reviews)' },
    { id: 'ele-mcb-fuse-replacement-3sw', label: '3 switches', price: 229, rating: '4.68 (409 reviews)' },
  ] },
  { id: 'ele-submeter-install', title: 'Submeter installation', section: 'mcb-fuse', rating: '4.78 (2K reviews)', price: 249, durationMin: 60, icon: <IcoMcbFuse /> },

  // ── Appliances ──
  { id: 'ele-home-theatre-install', title: 'Home theatre installation', section: 'appliances', rating: '4.76 (6K reviews)', price: 399, durationMin: 80, note: 'Installation of 2 speakers, 1 sound bar & 1 subwoofer', icon: <IcoAppliance /> },
  { id: 'ele-tv-install', title: 'TV installation', section: 'appliances', rating: '4.85 (42K reviews)', price: 399, priceLabel: 'starts-at', icon: <IcoAppliance />, options: [
    { id: 'ele-tv-install-upto26', label: 'Upto 26 inch', price: 399, rating: '4.82 (4K reviews)' },
    { id: 'ele-tv-install-32to43', label: '32 - 43 inch', price: 599, rating: '4.86 (21K reviews)' },
    { id: 'ele-tv-install-46to55', label: '46 - 55 inch', price: 749, rating: '4.85 (14K reviews)' },
    { id: 'ele-tv-install-56to65', label: '56 - 65 inch', price: 949, rating: '4.82 (3K reviews)' },
    { id: 'ele-tv-install-over75', label: 'Over 75 inch', price: 1999, rating: '4.86 (336 reviews)' },
  ] },
  // 4th tile ("Ov...") fell off the edge of the reference screenshot —
  // kept to the 3 confirmed tiles rather than a guessed one.
  { id: 'ele-tv-uninstall', title: 'TV uninstallation', section: 'appliances', rating: '4.86 (6K reviews)', price: 249, priceLabel: 'starts-at', icon: <IcoAppliance />, options: [
    { id: 'ele-tv-uninstall-below46', label: 'Below 46 inch', price: 249, rating: '4.86 (3K reviews)' },
    { id: 'ele-tv-uninstall-46to55', label: '46 - 55 inch', price: 299, rating: '4.88 (2K reviews)' },
    { id: 'ele-tv-uninstall-56to65', label: '56 - 65 inch', price: 599, rating: '4.87 (501 reviews)' },
  ] },
  { id: 'ele-soundbar-install', title: 'Sound bar installation', section: 'appliances', rating: '4.89 (7K reviews)', price: 99, durationMin: 60, icon: <IcoAppliance /> },
  { id: 'ele-karban-airzone-install', title: 'Karban Airzone installation', section: 'appliances', rating: '4.67 (47 reviews)', price: 399, priceLabel: 'starts-at', optionsCount: 1, note: 'Includes electrical connection and remote testing', icon: <IcoAppliance /> },
  { id: 'ele-inverter-install', title: 'Inverter installation', section: 'appliances', rating: '4.73 (8K reviews)', price: 485, priceLabel: 'starts-at', optionsCount: 2, icon: <IcoAppliance /> },
  { id: 'ele-stabiliser-install', title: 'Stabiliser installation', section: 'appliances', rating: '4.84 (7K reviews)', price: 149, durationMin: 45, icon: <IcoAppliance /> },
  { id: 'ele-inverter-fuse-replacement', title: 'Inverter fuse replacement', section: 'appliances', rating: '4.66 (2K reviews)', price: 99, durationMin: 15, icon: <IcoAppliance /> },
  { id: 'ele-inverter-servicing', title: 'Inverter servicing', section: 'appliances', rating: '4.76 (14K reviews)', price: 249, durationMin: 60, note: 'Terminal dust removal & distilled water top-up', icon: <IcoAppliance /> },
  { id: 'ele-inverter-checkup', title: 'Inverter check-up', section: 'appliances', rating: '4.71 (18K reviews)', price: 160, durationMin: 40, note: 'Complete check-up to identify issues before repair', icon: <IcoAppliance /> },
  { id: 'ele-inverter-uninstall', title: 'Inverter uninstallation', section: 'appliances', rating: '4.92 (2K reviews)', price: 499, durationMin: 30, icon: <IcoAppliance /> },

  // ── Book a consultation ──
  { id: 'ele-consultation', title: 'Electrician consultation', section: 'consultation', rating: '4.75 (170K reviews)', price: 49, durationMin: 35, notes: ['An electrician will assess your needs upon arrival at your home', 'A quote will be provided before the service begins'], icon: <IcoConsultation /> },
]

const SECTIONS: { id: ElectricianSection; label: string; icon: React.ReactNode }[] = [
  { id: 'switch-socket', label: 'Switch & socket', icon: <IcoSwitchSocket /> },
  { id: 'fan', label: 'Fan', icon: <IcoFan /> },
  { id: 'light', label: 'Light', icon: <IcoLightBulb /> },
  { id: 'wiring', label: 'Wiring', icon: <IcoWiring /> },
  { id: 'doorbell-security', label: 'Doorbell & security', icon: <IcoDoorbellSecurity /> },
  { id: 'mcb-fuse', label: 'MCB/fuse', icon: <IcoMcbFuse /> },
  { id: 'appliances', label: 'Appliances', icon: <IcoAppliance /> },
  { id: 'consultation', label: 'Book a consultation', icon: <IcoConsultation /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<ElectricianSection, { title: string; subtitle: string }> = {
  'switch-socket': { title: 'Small fixes, done right', subtitle: 'Switches, sockets & switchboards, repaired or replaced.' },
  fan: { title: 'Keep the air moving', subtitle: 'Repairs and installs for every kind of fan.' },
  light: { title: 'Light up every room', subtitle: 'Bulbs, tubelights, fancy fittings & chandeliers.' },
  wiring: { title: 'Wiring you can trust', subtitle: 'Fresh internal & external wiring, done safely.' },
  'doorbell-security': { title: 'Know who’s at the door', subtitle: 'Doorbells and wireless CCTV, installed properly.' },
  'mcb-fuse': { title: 'Keep your circuits safe', subtitle: 'MCB, fuse & submeter work by a qualified electrician.' },
  appliances: { title: 'Set up your appliances', subtitle: 'TVs, home theatres, inverters & more, installed and serviced.' },
  consultation: { title: 'Not sure what’s wrong?', subtitle: 'Book a consultation before you commit to a repair.' },
}

function getItem(id: string): ElectricianItem {
  const item = ELECTRICIAN_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Electrician item id: ${id}`)
  return item
}


// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Electrician</span>
      </div>
      <button aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoBell /></button>
    </div>
  )
}

function TopHeader({ onNavigate }: { onNavigate: (s: string, data?: Record<string, string>) => void }) {
  // Profile is already reachable from the Sidebar's own "Profile" item, so
  // this header slot carries the Cart instead — a real, live count from the
  // one shared Customer cart (Customer Implementation 07 parity with
  // Plumbing/Prime/Bathroom Cleaning), not a decorative avatar.
  const { itemCount } = useCustomerCart()
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('home-services')} aria-label="Back to Services" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all cursor-pointer border-0 bg-transparent"><IcoBack /></button>
        <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Electrician</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'electrician' })}
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

// ─── Hero — no real electrician photo exists in this project, so this
// uses the same warm-gradient + icon placeholder every other missing-
// photo surface in this app falls back to; the real page rating/
// bookings figure is kept as a small chip, same real data point every
// sibling screen keeps where the reference shows one. ──────────────────

function HeroBanner({ onExplore }: { onExplore: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, var(--hz-primary-wash) 0%, var(--hz-primary-soft) 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Electrician, Plumber &amp; Carpenter</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[var(--hz-ink)] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
          Wiring & fittings,<br />fixed for good.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Switches, fans, lights & appliances — a 30-day warranty on every service.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <span className="flex items-center gap-1 text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={13} /> 4.81 <span className="text-[var(--hz-ink-muted)] font-normal" style={{ fontFamily: FONT_BODY }}>(2.9M bookings)</span></span>
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
        <div style={{ transform: 'scale(3.2)' }}><IcoSwitchSocket /></div>
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

function ItemMeta({ item }: { item: ElectricianItem }) {
  return (
    <div className="text-left sm:text-right">
      <div className="text-[14px] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>
        {item.priceLabel === 'starts-at' && <span className="text-[var(--hz-ink-muted)]">Starts at </span>}
        <span className="font-semibold text-[var(--hz-ink)]">₹{item.price.toLocaleString('en-IN')}</span>
      </div>
      {item.durationMin !== undefined ? (
        <div className="text-[11px] font-semibold text-[var(--hz-primary)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</div>
      ) : item.options ? (
        <div className="text-[11px] text-[var(--hz-ink-subtle)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>{item.options.length} option{item.options.length > 1 ? 's' : ''}</div>
      ) : item.optionsCount !== undefined ? (
        <div className="text-[11px] text-[var(--hz-ink-subtle)] mt-0.5 whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''}</div>
      ) : null}
    </div>
  )
}

function ElectricianLineItemRow({ item, cartCount, getCartCount, onAdd, onViewDetails }: {
  item: ElectricianItem
  cartCount: number
  /** Looks up how many of a given cart-line id are in the cart — reused
   *  here to check each of this item's OPTION ids too, so a selected
   *  variant can be called out on the card (same pattern as Prime). */
  getCartCount: (id: string) => number
  onAdd: () => void
  onViewDetails: () => void
}) {
  const selectedOptions = item.options?.filter(o => getCartCount(o.id) > 0) ?? []
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative w-32 h-32 shrink-0 mx-auto sm:mx-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[var(--hz-primary-wash)] text-[var(--hz-primary)]">
        {item.icon}
        {item.badge && (
          <span
            className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-[3px] rounded-full text-[9.5px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#0F7A3D', fontFamily: FONT_BODY }}
          >
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        {item.rating && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        )}
        {item.note && (
          <span className="text-[11.5px] text-[var(--hz-ink-subtle)] leading-snug italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>
        )}
        {item.notes?.map(n => (
          <span key={n} className="text-[11.5px] text-[var(--hz-ink-subtle)] leading-snug" style={{ fontFamily: FONT_BODY }}>• {n}</span>
        ))}
        {selectedOptions.length > 0 && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {selectedOptions.map(o => (
              <span key={o.id} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_BODY }}>
                <IcoCheckSmall /> {o.label}{getCartCount(o.id) > 1 ? ` ×${getCartCount(o.id)}` : ''}
              </span>
            ))}
          </div>
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[var(--hz-primary)] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          View details
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[130px] shrink-0">
        <ItemMeta item={item} />
        <button onClick={onAdd} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? `Added ×${cartCount}` : item.options ? 'Select' : 'Add'}
        </button>
      </div>
    </div>
  )
}

// ─── "View details" — makes the link genuinely interactive: same info
// the row already shows, in one focused panel. Its bottom button either
// adds the item directly, or — for an item with a real options
// breakdown — opens the options picker instead (closing this panel
// first), same "Select" convention as the row itself.
function ServiceDetailModal({ item, cartCount, onAdd, onSelectOptions, onClose }: {
  item: ElectricianItem
  cartCount: number
  onAdd: () => void
  onSelectOptions: () => void
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
            {item.rating && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
            )}
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
            {item.durationMin !== undefined && (
              <span className="text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>
            )}
            {item.options ? (
              <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.options.length} option{item.options.length > 1 ? 's' : ''} available at booking</span>
            ) : item.optionsCount !== undefined && (
              <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} option{item.optionsCount > 1 ? 's' : ''} available at booking</span>
            )}
          </div>
          {item.note && <span className="text-[12px] text-[var(--hz-ink-subtle)] italic" style={{ fontFamily: FONT_BODY }}>{item.note}</span>}
          {item.notes?.map(n => (
            <span key={n} className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>• {n}</span>
          ))}
          <button
            onClick={item.options ? onSelectOptions : onAdd}
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

// ─── Options picker modal — opened from a line item that has more than
// one real way to book it (a switch count, a size tier, an install vs.
// replace vs. uninstall action). Same calm card language as the rest of
// this file, immediate-select (click a row = add it and close) — same
// pattern as Salon Luxe/Prime's own OptionsModal. ──────────────────────

function ElectricianOptionsModal({ item, cartCountForOption, onAddOption, onClose }: {
  item: ElectricianItem
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: ElectricianItemOption) => void
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
                  <span className="text-[13px] font-semibold text-[var(--hz-ink)] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>₹{opt.price.toLocaleString('en-IN')}</span>
                  {opt.rating && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hz-primary)]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {opt.rating}</span>
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

export default function ElectricianScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [detailItem, setDetailItem] = useState<string | null>(null)
  // Id of the item whose options picker is currently open (see
  // ElectricianOptionsModal) — null means no picker is showing.
  const [optionsItemId, setOptionsItemId] = useState<string | null>(null)

  const addToCart = (item: ElectricianItem) => {
    addItem({
      cartId: item.id,
      serviceEntry: 'home-services',
      categoryId: 'electrician',
      serviceId: item.id,
      serviceName: item.title,
      title: item.title,
      price: item.price,
      originalPrice: item.price,
      duration: item.durationMin !== undefined ? formatDuration(item.durationMin) : undefined,
    })
  }

  // A selected option becomes its own cart line — titled "Item — Option"
  // so the cart stays legible about exactly what was booked — then the
  // picker closes. Same convention as Prime's own addOptionToCart.
  const addOptionToCart = (item: ElectricianItem, option: ElectricianItemOption) => {
    addItem({
      cartId: option.id,
      serviceEntry: 'home-services',
      categoryId: 'electrician',
      serviceId: item.id,
      serviceName: item.title,
      optionId: option.id,
      optionName: option.label,
      title: `${item.title} — ${option.label}`,
      price: option.price,
      originalPrice: option.price,
    })
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`electrician-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'electrician',
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
                <span className="text-[12px] tracking-[0.10em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Electrician, Plumber &amp; Carpenter</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Electrician
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('switch-socket')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = ELECTRICIAN_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`electrician-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <ElectricianLineItemRow
                            key={item.id}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onAdd={() => (item.options ? setOptionsItemId(item.id) : addToCart(item))}
                            onViewDetails={() => setDetailItem(item.id)}
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
          item={getItem(detailItem)}
          cartCount={cartCountForItem(detailItem)}
          onAdd={() => addToCart(getItem(detailItem))}
          onSelectOptions={() => { setOptionsItemId(detailItem); setDetailItem(null) }}
          onClose={() => setDetailItem(null)}
        />
      )}

      {optionsItemId && (
        <ElectricianOptionsModal
          item={getItem(optionsItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getItem(optionsItemId), option)}
          onClose={() => setOptionsItemId(null)}
        />
      )}
    </div>
  )
}
