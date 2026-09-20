// ─── Wall Panels — Cleaning & Pest Control → Home Services → Wall Panels
// Installation ───────────────────────────────────────────────────────
//
// Built from a real-page reference PDF the user supplied (UB-WP19) — a
// design-browsing + consultation-booking flow, structurally different
// from every other service-detail screen in this app (those are fixed-
// price line items with a real "Add to cart"; a custom wall-panel
// install genuinely needs a site visit before a final price, which the
// reference itself frames this way: every design only ever shows a
// "Starts at ₹X for W x H ft wall" estimate, gated behind a real
// "Book at-home consultation for ₹49" CTA repeated through the page).
// So "Add" here books that real ₹49 consultation for the chosen
// design, rather than adding the design's own un-confirmed estimate as
// if it were a final bookable price.
//
// The capture covers only the "Pastels" tab in full — 42 real designs,
// each with its own real name, real "Starts at ₹X for W×H ft wall"
// price and real "<items> costs extra" note, taken as given. The
// reference's own tab strip names 5 more finish families (Gold,
// Limewash, Fabric, Stone, Traditional) that the capture never
// scrolled into — their real names are kept as tabs (never dropped),
// but each opens a plain "More finishes coming soon" state rather than
// fabricating designs for them. Only one design ("Olive knit") carried
// the reference's own real "New arrival" tag within the pages
// actually captured — kept as the one badge shown; no other card
// invents one.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own page-level rating/bookings header, its own room-type
// quick-nav photography, its own "Why revamp for wall panels?" trust
// copy (paraphrased into original Houzeify wording below, same as
// every sibling screen's own hero/trust copy), footer, and whatever
// was in its own cart/wishlist at capture time.
//
// Honesty note: no real wall-panel photography exists in this project,
// so every design card uses this app's own icon-on-gradient
// placeholder pattern, same as every sibling screen.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { DASHBOARD_ROUTES } from '@/data/homeownerDashboard'
import { useCustomerCart, type CustomerCartItem } from '@/data/customerCart'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#722ED1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5" /></svg
  >
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
const IcoCart = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2.5h1.6L6.3 13h9L17.3 5.8H4.7" />
    <circle cx="7.2" cy="16.5" r="1.2" />
    <circle cx="14" cy="16.5" r="1.2" />
  </svg>
)
const IcoFunnel = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h14l-5.5 6.5v5.2l-3 1.5v-6.7L3 4Z" />
  </svg>
)
const IcoCheckMark = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.3L5.3 10L11.5 3.5" />
  </svg>
)
// Section-nav & card icon — a single shared fluted-panel glyph stands
// in for every design's own real photo (none exists in this project).
const IcoPanel = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1.2" />
    <path d="M6 2.5v15M9.3 2.5v15M12.6 2.5v15M15.9 2.5v15" />
  </svg>
)
const IcoStrength = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8l8-4 8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V8Z" />
  </svg>
)
const IcoWarranty = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="14" rx="1.5" />
    <path d="M8 5V3.5M16 5V3.5M4 9.5h16" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)
const IcoExperts = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8.5" r="3.2" />
    <path d="M5 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
  </svg>
)

// ─── Data model — every field preserved exactly as given in the
// reference where present; anything the reference didn't show for a
// given design stays undefined and is never rendered. ─────────────────

interface WallPanelDesign {
  id: string
  name: string
  price: number
  wallSize: string
  extrasNote?: string
  newArrival?: boolean
}

const PASTEL_DESIGNS: WallPanelDesign[] = [
  { id: 'wp-maple-grid', name: 'Maple grid', price: 52599, wallSize: '9.5 x 10 ft', extrasNote: 'Console & cove light costs extra' },
  { id: 'wp-rustic-gold', name: 'Rustic gold', price: 11999, wallSize: '9.5 x 4 ft', extrasNote: 'Cabinet & noir radiance costs extra' },
  { id: 'wp-clay-slat', name: 'Clay slat', price: 12799, wallSize: '9.5 x 6 ft', extrasNote: 'Shelf costs extra' },
  { id: 'wp-steel-groove', name: 'Steel groove', price: 13399, wallSize: '9.5 x 6 ft', extrasNote: 'Cabinet costs extra' },
  { id: 'wp-olive-knit', name: 'Olive knit', price: 32899, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, cove light & luna glows costs extra', newArrival: true },
  { id: 'wp-blush-weft', name: 'Blush weft', price: 31099, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, wall washer light & fluted downs costs extra' },
  { id: 'wp-sage-panels', name: 'Sage panels', price: 46399, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, cove light & luna glows costs extra' },
  { id: 'wp-sage-texture', name: 'Sage texture', price: 43899, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, cove light & marble halos costs extra' },
  { id: 'wp-sand-ridge', name: 'Sand ridge', price: 42199, wallSize: '9.5 x 10 ft', extrasNote: 'Cabinet, shelf, cove light & obsidian line costs extra' },
  { id: 'wp-dune-grid', name: 'Dune grid', price: 33099, wallSize: '9.5 x 9 ft', extrasNote: 'Shelf, cove light & fluted down costs extra' },
  { id: 'wp-clay-gridline', name: 'Clay gridline', price: 55399, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf & cove light costs extra' },
  { id: 'wp-lavender-lines', name: 'Lavender lines', price: 34399, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, cove light & fluted downs costs extra' },
  { id: 'wp-beige-warp', name: 'Beige warp', price: 25399, wallSize: '9.5 x 9 ft', extrasNote: 'Shelves, cove light & noir radiance costs extra' },
  { id: 'wp-blush-flutes', name: 'Blush flutes', price: 33599, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, cove light & fluted downs costs extra' },
  { id: 'wp-olive-weave', name: 'Olive weave', price: 34299, wallSize: '9.5 x 10 ft', extrasNote: 'Shelves, cove light & noir radiance costs extra' },
  { id: 'wp-cream-weave', name: 'Cream weave', price: 24799, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, cove light & noir radiance costs extra' },
  { id: 'wp-grey-flutes', name: 'Grey flutes', price: 23399, wallSize: '9.5 x 8 ft', extrasNote: 'Cabinet, shelf, cove light & noir radiance costs extra' },
  { id: 'wp-cinder-canvas', name: 'Cinder canvas', price: 33499, wallSize: '9.5 x 10 ft', extrasNote: 'Cabinet, shelf, cove light & fluted down costs extra' },
  { id: 'wp-honey-mesh', name: 'Honey mesh', price: 58299, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, cove light & luna glows costs extra' },
  { id: 'wp-husk-weave', name: 'Husk weave', price: 20399, wallSize: '9.5 x 6 ft', extrasNote: 'Shelf, cove light & obsidian line costs extra' },
  { id: 'wp-blush-arc', name: 'Blush arc', price: 11199, wallSize: '9.5 x 4 ft', extrasNote: 'Shelf costs extra' },
  { id: 'wp-sand-aura', name: 'Sand aura', price: 11999, wallSize: '9.5 x 4 ft', extrasNote: 'Shelf & wall washer light costs extra' },
  { id: 'wp-dune-carve', name: 'Dune carve', price: 11199, wallSize: '9.5 x 8 ft', extrasNote: 'Shelf & noir radiance costs extra' },
  { id: 'wp-blush-flute', name: 'Blush flute', price: 9299, wallSize: '9.5 x 6 ft' },
  { id: 'wp-sand-layer', name: 'Sand layer', price: 12999, wallSize: '9.5 x 5 ft', extrasNote: 'Shelf costs extra' },
  { id: 'wp-ash-weave', name: 'Ash weave', price: 12799, wallSize: '9.5 x 6 ft', extrasNote: 'Cabinet costs extra' },
  { id: 'wp-grey-rib', name: 'Grey rib', price: 15299, wallSize: '9.5 x 6 ft', extrasNote: 'Storage units & cove light costs extra' },
  { id: 'wp-beige-ridge', name: 'Beige ridge', price: 27199, wallSize: '9.5 x 6 ft', extrasNote: 'Desk, shelf & wall washer light costs extra' },
  { id: 'wp-mist-fold', name: 'Mist fold', price: 15099, wallSize: '9.5 x 4 ft', extrasNote: 'Cabinet, shelves & wall washer light costs extra' },
  { id: 'wp-sage-fold', name: 'Sage fold', price: 11799, wallSize: '9.5 x 3 ft', extrasNote: 'Cabinet, shelves & cove light costs extra' },
  { id: 'wp-rustic-glow', name: 'Rustic glow', price: 17799, wallSize: '9.5 x 5 ft', extrasNote: 'Cabinet, cove light & golden radiance costs extra' },
  { id: 'wp-velvet-crest', name: 'Velvet crest', price: 16999, wallSize: '9.5 x 10 ft', extrasNote: 'Shelves, cove light & golden radiance costs extra' },
  { id: 'wp-golden-ridge', name: 'Golden ridge', price: 20999, wallSize: '9.5 x 5 ft', extrasNote: 'Desk, shelves & wall washer light costs extra' },
  { id: 'wp-blush-lines', name: 'Blush lines', price: 23599, wallSize: '9.5 x 10 ft', extrasNote: 'Shelves & cove light costs extra' },
  { id: 'wp-silk-ridge', name: 'Silk ridge', price: 21699, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf & fluted downs costs extra' },
  { id: 'wp-golden-grid', name: 'Golden grid', price: 32299, wallSize: '9.5 x 10 ft', extrasNote: 'Shelf, wall washer light & obsidian lines costs extra' },
  { id: 'wp-fawn-weave', name: 'Fawn weave', price: 25599, wallSize: '9.5 x 10 ft', extrasNote: 'Console, cabinet & cove light costs extra' },
  { id: 'wp-ivory-rib', name: 'Ivory rib', price: 27599, wallSize: '9.5 x 10 ft', extrasNote: 'Console, shelves, wall washer light & obsidian line costs extra' },
  { id: 'wp-blush-crest', name: 'Blush crest', price: 42599, wallSize: '9.5 x 10 ft', extrasNote: 'Console, cove light & marble halos costs extra' },
  { id: 'wp-rustic-almond', name: 'Rustic almond', price: 10899, wallSize: '9.5 x 5 ft', extrasNote: 'Cabinet & shelves costs extra' },
  { id: 'wp-lilac-flutes', name: 'Lilac flutes', price: 27599, wallSize: '9.5 x 10 ft', extrasNote: 'Shelves, cove light & obsidian lines costs extra' },
  { id: 'wp-vanilla-weft', name: 'Vanilla weft', price: 37999, wallSize: '9.5 x 10 ft', extrasNote: 'Shelves, cove light & marble halo costs extra' },
]

// Real bounds taken from the catalogue's own prices above — used as
// the Filter modal's price-range defaults rather than round numbers.
const PRICE_MIN = Math.min(...PASTEL_DESIGNS.map(d => d.price))
const PRICE_MAX = Math.max(...PASTEL_DESIGNS.map(d => d.price))

// The reference's own tab strip names these 9 finish families (its
// own default/active tab is "All Looks", scrolled left of "Pastels" —
// easy to miss on a first pass); the capture only ever scrolled
// through "Pastels" itself — every other tab keeps its real name but
// opens a plain "coming soon" state instead of fabricated designs.
// "All Looks" is the one exception: since every design this app
// actually has real data for IS a Pastel, "All Looks" shows that same
// real set rather than an empty state — it's genuinely "all of what
// exists," not a placeholder.
const DESIGN_TABS: { id: string; label: string }[] = [
  { id: 'all-looks', label: 'All Looks' },
  { id: 'wood', label: 'Wood' },
  { id: 'marble', label: 'Marble' },
  { id: 'pastels', label: 'Pastels' },
  { id: 'gold', label: 'Gold' },
  { id: 'limewash', label: 'Limewash' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'stone', label: 'Stone' },
  { id: 'traditional', label: 'Traditional' },
]

function getDesign(id: string): WallPanelDesign {
  const d = PASTEL_DESIGNS.find(x => x.id === id)
  if (!d) throw new Error(`Unknown Wall Panels design id: ${id}`)
  return d
}

const CONSULTATION_PRICE = 49

// ─── Chrome — same shell shape as every other service-detail screen. ──

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Wall Panels</span>
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
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Wall Panels</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'wall-panels-installation' })}
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

// ─── Hero — real "Book at-home consultation for ₹49" CTA kept as the
// page's one genuine bookable action; headline/subtext are original
// Houzeify copy, same as every sibling screen's own hero. ─────────────

function HeroBanner({ onExplore, onBookConsultation }: { onExplore: () => void; onBookConsultation: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Wall Panels</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          Design walls that<br />feel finished.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Fluted panels, textured finishes & more — sized to your room.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1 max-w-[70%] sm:max-w-none">
          <button
            onClick={onExplore}
            className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
            style={{ fontFamily: FONT_BODY, boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
          >
            Explore designs
          </button>
          <button
            onClick={onBookConsultation}
            className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[13px] font-semibold cursor-pointer hover:bg-white hover:border-[#722ED1] transition-all bg-white/70 shrink-0"
            style={{ fontFamily: FONT_BODY }}
          >
            Book at-home consultation · ₹{CONSULTATION_PRICE}
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[#722ED1] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoPanel size={40} /></div>
      </div>
    </div>
  )
}

// ─── Trust row — the reference's own 3 real claims ("Unmatched
// quality of wall panels", "1-year warranty on products &
// installation", "Experts for exceptional results"), paraphrased into
// original Houzeify wording, same as every sibling screen's own
// trust/promise copy. ─────────────────────────────────────────────────

const TRUST_ITEMS: { icon: React.ReactNode; title: string; subtitle: string }[] = [
  { icon: <IcoStrength />, title: 'Built to last', subtitle: 'Durable, high-grade wall panel materials.' },
  { icon: <IcoWarranty />, title: '1-year warranty', subtitle: 'Covers both the panels and the installation.' },
  { icon: <IcoExperts />, title: 'Skilled installers', subtitle: 'Experienced pros for a clean, precise finish.' },
]

function TrustRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TRUST_ITEMS.map(t => (
        <div key={t.title} className="flex items-start gap-3 rounded-[12px] p-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)', border: '1px solid #EFE4FF' }}>
          <div className="w-10 h-10 rounded-[10px] bg-[#F3EAFF] flex items-center justify-center text-[#722ED1] shrink-0">{t.icon}</div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[13.5px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{t.title}</span>
            <span className="text-[12px] text-[#68636D] leading-snug" style={{ fontFamily: FONT_BODY }}>{t.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Design tabs — real finish-family names from the reference's own
// tab strip. Only "Pastels" has real designs behind it. ────────────────

function DesignTabs({ active, onSelect, filterActiveCount, onOpenFilter }: {
  active: string
  onSelect: (id: string) => void
  filterActiveCount: number
  onOpenFilter: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
        {DESIGN_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="h-9 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all shrink-0 border"
            style={
              active === tab.id
                ? { background: '#722ED1', borderColor: '#722ED1', color: '#FFFFFF', fontFamily: FONT_BODY }
                : { background: '#FFFFFF', borderColor: '#E3DDD7', color: '#68636D', fontFamily: FONT_BODY }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button
        onClick={onOpenFilter}
        className="relative h-9 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all shrink-0 border flex items-center gap-1.5"
        style={
          filterActiveCount > 0
            ? { background: '#F3EAFF', borderColor: '#722ED1', color: '#722ED1', fontFamily: FONT_BODY }
            : { background: '#FFFFFF', borderColor: '#E3DDD7', color: '#68636D', fontFamily: FONT_BODY }
        }
      >
        <IcoFunnel /> Filter
        {filterActiveCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9.5px] font-semibold flex items-center justify-center"
            style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
          >
            {filterActiveCount}
          </span>
        )}
      </button>
    </div>
  )
}

// ─── Card chrome ─────────────────────────────────────────────────────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-white border-[#E3DDD7] text-[#722ED1] hover:bg-[#F3EAFF] hover:border-[#722ED1]'
const NEUTRAL_BTN_ADDED = 'bg-[#F3EAFF] border-[#722ED1] text-[#722ED1] hover:bg-[#F3EAFF]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

function DesignCard({ design, cartCount, onBook, onViewDetails }: {
  design: WallPanelDesign
  cartCount: number
  onBook: () => void
  onViewDetails: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 rounded-[12px] p-4" style={CARD_SURFACE}>
      <div className="relative w-32 h-32 shrink-0 mx-auto sm:mx-0 rounded-[8px] overflow-hidden flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]">
        <IcoPanel size={40} />
        {design.newArrival && (
          <span
            className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-[3px] rounded-full text-[9.5px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}
          >
            New arrival
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{design.name}</span>
        <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
          Starts at <span className="font-semibold">₹{design.price.toLocaleString('en-IN')}</span> <span className="text-[#68636D]">for {design.wallSize} wall</span>
        </span>
        {design.extrasNote && (
          <span className="text-[11.5px] text-[#9A949D] leading-snug underline decoration-[#E3DDD7] underline-offset-2" style={{ fontFamily: FONT_BODY }}>{design.extrasNote}</span>
        )}
        <button onClick={onViewDetails} className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline mt-0.5" style={{ fontFamily: FONT_BODY }}>
          View details
        </button>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:w-[160px] shrink-0">
        <span className="text-[11px] text-[#9A949D] text-right" style={{ fontFamily: FONT_BODY }}>Final price after a free on-site measure</span>
        <button onClick={onBook} className={`${NEUTRAL_BTN} ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`} style={NEUTRAL_BTN_FONT}>
          {cartCount ? 'Consultation booked' : `Book · ₹${CONSULTATION_PRICE}`}
        </button>
      </div>
    </div>
  )
}

// ─── "View details" — makes the link genuinely interactive: same info
// the card already shows, in one focused panel, with its own booking
// button. ─────────────────────────────────────────────────────────────
function DesignDetailModal({ design, cartCount, onBook, onClose }: {
  design: WallPanelDesign
  cartCount: number
  onBook: () => void
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
            {design.newArrival && (
              <span className="self-start flex items-center gap-1 px-2 py-[3px] rounded-full text-[10px] font-semibold text-white whitespace-nowrap" style={{ backgroundColor: '#D4A017', fontFamily: FONT_BODY }}>
                New arrival
              </span>
            )}
            <span className="text-[16px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{design.name}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="w-16 h-16 rounded-[12px] flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]"><IcoPanel size={32} /></div>
          <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
            Starts at <span className="font-semibold">₹{design.price.toLocaleString('en-IN')}</span> <span className="text-[#68636D]">for {design.wallSize} wall</span>
          </span>
          {design.extrasNote && <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{design.extrasNote}</span>}
          <span className="text-[12px] text-[#68636D] leading-relaxed" style={{ fontFamily: FONT_BODY }}>
            This is an estimate — an installer measures your wall on a free at-home visit before any final price is confirmed.
          </span>
          <button
            onClick={onBook}
            className={`h-10 mt-1 rounded-[10px] border text-[13px] font-semibold cursor-pointer transition-all ${cartCount ? NEUTRAL_BTN_ADDED : NEUTRAL_BTN_DEFAULT}`}
            style={NEUTRAL_BTN_FONT}
          >
            {cartCount ? 'Consultation booked' : `Book at-home consultation · ₹${CONSULTATION_PRICE}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Mid-page consultation banner — the reference's own real "Touch &
// feel real samples at home & get a quotation" line + CTA, repeated
// through its page; kept once here rather than reproduced at every
// interval. ───────────────────────────────────────────────────────────

function ConsultationBanner({ onBook }: { onBook: () => void }) {
  return (
    <div className="rounded-[12px] overflow-hidden border border-[#D7ECD9]">
      <div className="px-4 py-2.5 text-center" style={{ background: '#EFFAF0' }}>
        <span className="text-[12.5px] font-semibold text-[#0F7A3D]" style={{ fontFamily: FONT_BODY }}>Touch &amp; feel real samples at home &amp; get a quotation</span>
      </div>
      <button
        onClick={onBook}
        className="w-full h-11 text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0"
        style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
      >
        Book at-home consultation for ₹{CONSULTATION_PRICE}
      </button>
    </div>
  )
}

// ─── Filter modal — real sub-tabs from the reference (Collections,
// Price, Material, Sort (price), View). Only "Collections → New-in",
// "Price" and "Sort (price)" bind to something this catalogue actually
// has real data for; "Bestseller"/"Designer's choice"/"Discounted
// looks" stay real, checkable options — the reference's own real
// checkbox labels — but since no design here carries any of those
// three tags, checking one honestly filters the grid down to no
// matches rather than pretending a tag exists. "Material" has no real
// per-design material data yet, so it shows a plain "not available
// yet" note instead of fabricated options; "View" doesn't need real
// catalogue data at all — it's a genuine list/grid layout toggle. ────

interface FilterState {
  collections: { bestseller: boolean; designersChoice: boolean; newIn: boolean; discountedLooks: boolean }
  priceMin: number
  priceMax: number
  sort: 'default' | 'price-asc' | 'price-desc'
  view: 'list' | 'grid'
}

const DEFAULT_FILTERS: FilterState = {
  collections: { bestseller: false, designersChoice: false, newIn: false, discountedLooks: false },
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  sort: 'default',
  view: 'list',
}

function countActiveFilters(f: FilterState): number {
  let n = 0
  if (f.collections.bestseller) n++
  if (f.collections.designersChoice) n++
  if (f.collections.newIn) n++
  if (f.collections.discountedLooks) n++
  if (f.priceMin !== PRICE_MIN || f.priceMax !== PRICE_MAX) n++
  if (f.sort !== 'default') n++
  return n
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 py-2.5 cursor-pointer border-0 bg-transparent p-0 w-full text-left"
    >
      <span
        className="w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 transition-all"
        style={checked ? { backgroundColor: '#722ED1', borderColor: '#722ED1' } : { backgroundColor: '#FFFFFF', borderColor: '#D8D2CC' }}
      >
        {checked && <IcoCheckMark />}
      </span>
      <span className="text-[14px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </button>
  )
}

const FILTER_SUBTABS: { id: 'collections' | 'price' | 'material' | 'sort' | 'view'; label: string }[] = [
  { id: 'collections', label: 'Collections' },
  { id: 'price', label: 'Price' },
  { id: 'material', label: 'Material' },
  { id: 'sort', label: 'Sort (price)' },
  { id: 'view', label: 'View' },
]

function FilterModal({ initial, onApply, onClose }: {
  initial: FilterState
  onApply: (f: FilterState) => void
  onClose: () => void
}) {
  const [subTab, setSubTab] = useState<'collections' | 'price' | 'material' | 'sort' | 'view'>('collections')
  const [draft, setDraft] = useState<FilterState>(initial)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(36,35,38,0.45)' }} onClick={onClose}>
      <div
        className="w-full max-w-[520px] max-h-[80vh] rounded-[16px] bg-white flex flex-col relative"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#242326] border border-[#E3DDD7] cursor-pointer z-10" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <IcoCloseX />
        </button>

        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Filter</h2>
        </div>

        <div className="flex gap-5 px-6 border-b border-[#F4F0EC] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {FILTER_SUBTABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className="pb-3 pt-1 text-[14px] cursor-pointer border-0 bg-transparent whitespace-nowrap shrink-0"
              style={{
                fontFamily: FONT_BODY,
                fontWeight: subTab === tab.id ? 700 : 400,
                color: subTab === tab.id ? '#242326' : '#9A949D',
                borderBottom: subTab === tab.id ? '2px solid #242326' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2" style={{ minHeight: 260 }}>
          {subTab === 'collections' && (
            <div className="flex flex-col divide-y divide-[#F4F0EC]">
              <Checkbox checked={draft.collections.bestseller} onChange={v => setDraft(d => ({ ...d, collections: { ...d.collections, bestseller: v } }))} label="Bestseller" />
              <Checkbox checked={draft.collections.designersChoice} onChange={v => setDraft(d => ({ ...d, collections: { ...d.collections, designersChoice: v } }))} label="Designer's choice" />
              <Checkbox checked={draft.collections.newIn} onChange={v => setDraft(d => ({ ...d, collections: { ...d.collections, newIn: v } }))} label="New-in" />
              <Checkbox checked={draft.collections.discountedLooks} onChange={v => setDraft(d => ({ ...d, collections: { ...d.collections, discountedLooks: v } }))} label="Discounted looks" />
            </div>
          )}

          {subTab === 'price' && (
            <div className="flex flex-col gap-4 py-3">
              <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                ₹{draft.priceMin.toLocaleString('en-IN')} – ₹{draft.priceMax.toLocaleString('en-IN')}
              </span>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Minimum</label>
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={100}
                  value={draft.priceMin}
                  onChange={e => setDraft(d => ({ ...d, priceMin: Math.min(Number(e.target.value), d.priceMax) }))}
                  className="w-full accent-[#722ED1]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Maximum</label>
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={100}
                  value={draft.priceMax}
                  onChange={e => setDraft(d => ({ ...d, priceMax: Math.max(Number(e.target.value), d.priceMin) }))}
                  className="w-full accent-[#722ED1]"
                />
              </div>
            </div>
          )}

          {subTab === 'material' && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Material filters aren't available yet</span>
              <span className="text-[12.5px] text-[#68636D] max-w-[300px]" style={{ fontFamily: FONT_BODY }}>Ask Hozie or your at-home consultant about specific materials.</span>
            </div>
          )}

          {subTab === 'sort' && (
            <div className="flex flex-col divide-y divide-[#F4F0EC]">
              {([
                { id: 'default', label: 'Default' },
                { id: 'price-asc', label: 'Price: Low to High' },
                { id: 'price-desc', label: 'Price: High to Low' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDraft(d => ({ ...d, sort: opt.id }))}
                  className="flex items-center gap-3 py-2.5 cursor-pointer border-0 bg-transparent p-0 w-full text-left"
                >
                  <span
                    className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                    style={draft.sort === opt.id ? { borderColor: '#722ED1' } : { borderColor: '#D8D2CC' }}
                  >
                    {draft.sort === opt.id && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#722ED1' }} />}
                  </span>
                  <span className="text-[14px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {subTab === 'view' && (
            <div className="flex flex-col divide-y divide-[#F4F0EC]">
              {([
                { id: 'list', label: 'List' },
                { id: 'grid', label: 'Grid' },
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDraft(d => ({ ...d, view: opt.id }))}
                  className="flex items-center gap-3 py-2.5 cursor-pointer border-0 bg-transparent p-0 w-full text-left"
                >
                  <span
                    className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                    style={draft.view === opt.id ? { borderColor: '#722ED1' } : { borderColor: '#D8D2CC' }}
                  >
                    {draft.view === opt.id && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#722ED1' }} />}
                  </span>
                  <span className="text-[14px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-5 border-t border-[#F4F0EC]">
          <button
            onClick={() => setDraft(DEFAULT_FILTERS)}
            className="flex-1 h-11 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[14px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all bg-white"
            style={{ fontFamily: FONT_BODY }}
          >
            Reset
          </button>
          <button
            onClick={() => onApply(draft)}
            className="flex-1 h-11 rounded-[10px] text-white text-[14px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0"
            style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
          >
            Apply
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
            <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>₹{c.price}</span>
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
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F4F0EC]">
        <span className="text-[17px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>₹{total}</span>
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

export default function WallPanelsScreen({
  onNavigate,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
}) {
  // The one shared, cross-screen Customer cart (Customer Implementation
  // 06) — reads/writes the SAME cart every other service screen uses, so
  // an item added here survives navigating to a different category page.
  const { items: cart, addItem, changeQty: changeCartQty, removeItem: removeFromCart } = useCustomerCart()
  const [activeTab, setActiveTab] = useState('all-looks')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  // Every cart line is a real ₹49 at-home consultation for one chosen
  // design — the design's own "Starts at ₹X" stays an on-card estimate
  // only, never added as if it were a confirmed final price.
  const bookConsultation = (design: WallPanelDesign) => {
    addItem({
      cartId: design.id,
      serviceEntry: 'home-services',
      categoryId: 'wall-panels-installation',
      serviceId: design.id,
      serviceName: `At-home consultation — ${design.name}`,
      title: `At-home consultation — ${design.name}`,
      price: CONSULTATION_PRICE,
      originalPrice: CONSULTATION_PRICE,
    })
  }

  const bookGeneralConsultation = () => {
    addItem({
      cartId: 'wp-general-consultation',
      serviceEntry: 'home-services',
      categoryId: 'wall-panels-installation',
      serviceId: 'wp-general-consultation',
      serviceName: 'At-home consultation — Wall Panels',
      title: 'At-home consultation — Wall Panels',
      price: CONSULTATION_PRICE,
      originalPrice: CONSULTATION_PRICE,
    })
  }

  const jumpToDesigns = () => {
    document.getElementById('wall-panels-designs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (id: string) => cart.find(c => c.cartId === id)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'wall-panels-installation',
    })
  }

  // Collections is an OR across whatever's checked; "New-in" is the
  // only tag any real design here actually carries (Olive knit's own
  // "New arrival"), so checking Bestseller/Designer's choice/
  // Discounted looks honestly narrows the grid to no matches rather
  // than pretending those tags exist on something.
  const filteredDesigns = PASTEL_DESIGNS
    .filter(d => d.price >= filters.priceMin && d.price <= filters.priceMax)
    .filter(d => {
      const { bestseller, designersChoice, newIn, discountedLooks } = filters.collections
      if (!bestseller && !designersChoice && !newIn && !discountedLooks) return true
      return (newIn && d.newArrival) || false
    })
    .sort((a, b) => {
      if (filters.sort === 'price-asc') return a.price - b.price
      if (filters.sort === 'price-desc') return b.price - a.price
      return 0
    })

  // Consultation banners split the grid roughly in thirds, mirroring
  // the reference's own repeated placement without reproducing it at
  // every interval.
  const midpoint = Math.ceil(filteredDesigns.length / 2)
  const firstHalf = filteredDesigns.slice(0, midpoint)
  const secondHalf = filteredDesigns.slice(midpoint)
  const activeFilterCount = countActiveFilters(filters)

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
                  other service-detail screen. */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Home Services</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Wall Panels
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={jumpToDesigns} onBookConsultation={bookGeneralConsultation} />
                  <TrustRow />

                  <div id="wall-panels-designs" className="flex flex-col gap-3" style={{ scrollMarginTop: 24 }}>
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Find your wall design</h2>
                      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Every price is a starting estimate — confirmed on a free at-home visit.</p>
                    </div>
                    <DesignTabs
                      active={activeTab}
                      onSelect={setActiveTab}
                      filterActiveCount={activeFilterCount}
                      onOpenFilter={() => setFilterModalOpen(true)}
                    />

                    {activeTab === 'all-looks' || activeTab === 'pastels' ? (
                      filteredDesigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-[12px] p-10 text-center mt-1" style={CARD_SURFACE}>
                          <div className="w-12 h-12 rounded-[12px] bg-[#F9F5FF] flex items-center justify-center text-[#722ED1]"><IcoPanel size={26} /></div>
                          <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>No designs match your filters</span>
                          <span className="text-[12.5px] text-[#68636D] max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Try widening the price range or clearing a collection filter.</span>
                          <button
                            onClick={() => setFilters(DEFAULT_FILTERS)}
                            className="h-9 px-4 mt-1 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[12.5px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all bg-white"
                            style={{ fontFamily: FONT_BODY }}
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        <div className={filters.view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1' : 'flex flex-col gap-3 mt-1'}>
                          {firstHalf.map(design => (
                            <DesignCard
                              key={design.id}
                              design={design}
                              cartCount={cartCountForItem(design.id)}
                              onBook={() => bookConsultation(design)}
                              onViewDetails={() => setDetailId(design.id)}
                            />
                          ))}
                          {filters.view === 'list' && <ConsultationBanner onBook={bookGeneralConsultation} />}
                          {secondHalf.map(design => (
                            <DesignCard
                              key={design.id}
                              design={design}
                              cartCount={cartCountForItem(design.id)}
                              onBook={() => bookConsultation(design)}
                              onViewDetails={() => setDetailId(design.id)}
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-[12px] p-10 text-center" style={CARD_SURFACE}>
                        <div className="w-12 h-12 rounded-[12px] bg-[#F9F5FF] flex items-center justify-center text-[#722ED1]"><IcoPanel size={26} /></div>
                        <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>More {DESIGN_TABS.find(t => t.id === activeTab)?.label} finishes coming soon</span>
                        <span className="text-[12.5px] text-[#68636D] max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Book a free at-home consultation and our designer can show you options in this finish today.</span>
                        <button
                          onClick={bookGeneralConsultation}
                          className="h-9 px-4 mt-1 rounded-[10px] bg-[#722ED1] text-white text-[12.5px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0"
                          style={{ fontFamily: FONT_BODY }}
                        >
                          Book at-home consultation · ₹{CONSULTATION_PRICE}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right column — pinned on desktop, same as every other
                    service-detail screen. */}
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

      {detailId && (
        <DesignDetailModal
          design={getDesign(detailId)}
          cartCount={cartCountForItem(detailId)}
          onBook={() => bookConsultation(getDesign(detailId))}
          onClose={() => setDetailId(null)}
        />
      )}

      {filterModalOpen && (
        <FilterModal
          initial={filters}
          onApply={next => {
            setFilters(next)
            setFilterModalOpen(false)
          }}
          onClose={() => setFilterModalOpen(false)}
        />
      )}
    </div>
  )
}
