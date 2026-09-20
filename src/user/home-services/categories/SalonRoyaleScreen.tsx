// ─── Salon Royale — Men's Salon & Massage → Salon for Men → Royale ────────
//
// Built from a real-page reference PDF the user supplied (UB06) — used
// for its "Select a service" catalogue (7 sections: Packages, Pedicure,
// Hair care, Face care, Shave/beard grooming, Hair color, Massage) and
// every service's own rating/reviews/price/original price/duration/
// description, taken as given. Values the reference didn't show are
// never invented — simply omitted. Real, named products/techniques
// (L'Oréal Inoa, O3+, Repechage, Beardo golden glow facial) are kept as
// given — the same treatment Hair Studio for Women's own colour
// catalogue already uses for L'Oréal — but the Beardo campaign's own
// marketing creative/logo banner isn't reproduced, the same honest
// departure the Salon for Men tier picker's own header comment already
// documents for a different real-brand creative. Five "Packages"
// entries have a real breakdown + "Edit your package"; none carry a
// meaningful discount (a couple show a few rupees off), so unlike Salon
// Luxe's own packages there's no "X% OFF" panel here — same reasoning
// Makeup, Saree & Styling's own two real packages already followed.
// Three items show only an "N options" count in the reference (the
// real variants sit behind a click this single-page capture doesn't
// reach) — same "N options available" placeholder discipline as every
// other page, until real data arrives.
//
// PAGE ITSELF follows the exact same house system as every other
// service-detail screen: sticky/glass "Select a service" nav,
// scrollMarginTop 230, CategoryBanner + 128×128 icon panels,
// CARD_SURFACE line-item rows, right-column Houzeify Promise/Cart/Ask
// Hozie shell.
//
// Not carried over from the reference (site chrome, not catalogue
// data): its own page-level aggregate rating/"earliest slot" header,
// its "Checkout our Royale Salon Range" cross-sell banner, footer,
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
// Section-nav icons
const IcoPackage = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6.5L10 3l7 3.5-7 3.5-7-3.5Z" />
    <path d="M3 6.5V14l7 3.5 7-3.5V6.5" />
    <path d="M10 10v7.5" />
  </svg>
)
const IcoFoot = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 17.5c-1.7 0-3-1.2-3-3.2 0-2 .9-3 .9-5.3 0-2.5-1.1-3-1.1-5A2.5 2.5 0 017.3 1.5c2 0 2.7 1.7 2.9 3.3.3 2.5 1.8 4 3.4 5.6 1.3 1.3 2.4 2.7 2.4 4.4 0 1.6-1.3 2.7-3 2.7-2.2 0-2.7-1.2-5-1.2Z" />
  </svg>
)
const IcoScissors = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="5" r="2" />
    <circle cx="5" cy="15" r="2" />
    <path d="M6.6 6.3L17 16.5M6.6 13.7L17 3.5" />
  </svg>
)
const IcoGlow = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="4" />
    <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6L4.2 4.2" />
  </svg>
)
const IcoRazor = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3.5h6v4H5z" />
    <path d="M5 7.5v9a1.5 1.5 0 003 0v-9M8 7.5v9a1.5 1.5 0 003 0v-9" />
    <path d="M11 3.5h4v2h-4z" />
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

/** One real selectable variant under an item that has more than one way
 *  to book it — same idea as every sibling screen's own options item. */
interface RoyaleItemOption {
  id: string
  label: string
  price: number
  durationMin?: number
  rating?: string
  note?: string
}
interface RoyaleItem {
  id: string
  title: string
  section: 'packages' | 'pedicure' | 'hair-care' | 'face-care' | 'shave-beard' | 'hair-color' | 'massage'
  rating: string
  price: number
  priceLabel?: 'starts-at'
  originalPrice?: number
  durationMin?: number
  description?: string
  includes?: string[]
  editable?: boolean
  /** The reference only shows a count for these until real per-option
   *  data is supplied (see `options` below) — then it's replaced. */
  optionsCount?: number
  /** Real per-option data — "Select" opens a picker of these instead of
   *  adding this item directly. */
  options?: RoyaleItemOption[]
  icon: React.ReactNode
}

const ROYALE_ITEMS: RoyaleItem[] = [
  // ── Packages ──
  { id: 'ry-grooming-essentials', title: 'Grooming essentials', section: 'packages', rating: '4.89 (252K reviews)', price: 758, durationMin: 75, includes: ['Haircut: Haircut for men', 'Shave/beard grooming: Beard trimming & styling'], editable: true, icon: <IcoPackage /> },
  { id: 'ry-complete-care', title: 'Complete care', section: 'packages', rating: '4.90 (210K reviews)', price: 1158, durationMin: 75, includes: ['Haircut: Haircut for men', 'Detan (O3+): Face & neck detan'], editable: true, icon: <IcoPackage /> },
  { id: 'ry-glow-getter', title: 'Glow getter', section: 'packages', rating: '4.89 (212K reviews)', price: 2798, originalPrice: 2858, durationMin: 135, includes: ['Face care: Repechage skin brightening facial', 'Shave/beard grooming: Beard trimming & styling', 'Haircut: Haircut for men'], editable: true, icon: <IcoPackage /> },
  { id: 'ry-haircut-color', title: 'Haircut & color', section: 'packages', rating: '4.88 (151K reviews)', price: 1108, originalPrice: 1208, durationMin: 75, includes: ['Haircut: Haircut for men', "Inoa colors (L'Oreal): Dark brown (shade 3)"], editable: true, icon: <IcoPackage /> },
  { id: 'ry-hair-care-pkg', title: 'Hair & care', section: 'packages', rating: '4.89 (192K reviews)', price: 1977, originalPrice: 2027, durationMin: 135, includes: ['Haircut: Haircut for men', 'Massage: 15 mins head massage', 'Pedicure: Aroma bomb pedicure'], editable: true, icon: <IcoPackage /> },

  // ── Pedicure ──
  { id: 'ry-aroma-bomb-pedicure', title: 'Aroma bomb pedicure', section: 'pedicure', rating: '4.82 (14K reviews)', price: 1299, originalPrice: 1349, durationMin: 75, description: 'Revitalise your feet with a soothing aroma bomb pedicure for fresh, soft soles', icon: <IcoFoot /> },
  { id: 'ry-nail-cut-feet', title: 'Nail cut & file (feet)', section: 'pedicure', rating: '4.86 (3K reviews)', price: 120, durationMin: 10, description: 'Quick & basic nail grooming of your feet', icon: <IcoFoot /> },
  { id: 'ry-nail-cut-hands', title: 'Nail cut & file (hands)', section: 'pedicure', rating: '4.85 (3K reviews)', price: 100, durationMin: 10, description: 'Quick & basic nail grooming of your hands', icon: <IcoFoot /> },

  // ── Hair care ──
  {
    id: 'ry-haircut-men', title: 'Haircut for men', section: 'hair-care', rating: '4.91 (7K reviews)', price: 459, priceLabel: 'starts-at',
    description: 'Bespoke haircut with hairspray, blow dry & a dry head massage', icon: <IcoScissors />,
    options: [
      { id: 'ry-haircut-men-with-massage', label: 'With 15 min Head Massage', price: 679, durationMin: 60, rating: '4.91 (1K reviews)' },
      { id: 'ry-haircut-men-without-massage', label: 'Without 15 min Head Massage', price: 459, durationMin: 45, rating: '4.91 (5K reviews)' },
    ],
  },
  { id: 'ry-haircut-boys', title: 'Haircut for boys', section: 'hair-care', rating: '4.89 (20K reviews)', price: 459, durationMin: 45, description: 'Specially trained stylists for boys aged 2 years & above', icon: <IcoScissors /> },

  // ── Face care ──
  { id: 'ry-beardo-glow-facial', title: 'Beardo golden glow facial', section: 'face-care', rating: '4.80 (3K reviews)', price: 1599, durationMin: 65, description: 'Instant glow & boosted collagen, leaving skin bright, supple & hydrated', icon: <IcoGlow /> },
  { id: 'ry-o3-skin-brightening', title: 'O3+ skin brightening facial', section: 'face-care', rating: '4.79 (9K reviews)', price: 2000, originalPrice: 2100, durationMin: 65, description: 'Enhances the skin texture & boosting the glow of the skin for a longer period', icon: <IcoGlow /> },
  { id: 'ry-repechage-skin-brightening', title: 'Repechage skin brightening facial', section: 'face-care', rating: '4.81 (6K reviews)', price: 2000, originalPrice: 2100, durationMin: 60, description: 'Power-packed seaweed to improve skin texture & fight ageing', icon: <IcoGlow /> },
  { id: 'ry-o3-face-neck-detan', title: 'O3+ face & neck detan', section: 'face-care', rating: '4.83 (11K reviews)', price: 699, durationMin: 30, description: 'Tan removal with reduction of dark spots, blemishes & pigmentation', icon: <IcoGlow /> },
  { id: 'ry-o3-cleanup', title: 'O3+ cleanup', section: 'face-care', rating: '4.83 (6K reviews)', price: 1299, durationMin: 40, description: 'A routine deep cleansing ritual to remove dirt, oil & toxins', icon: <IcoGlow /> },

  // ── Shave/beard grooming ──
  { id: 'ry-clean-shave', title: 'Clean shave', section: 'shave-beard', rating: '4.88 (15K reviews)', price: 299, durationMin: 30, description: 'Effortless shave with pre-shave oil, face cleansing & a relaxing face massage', icon: <IcoRazor /> },
  { id: 'ry-beard-trimming', title: 'Beard trimming & styling', section: 'shave-beard', rating: '4.90 (59K reviews)', price: 299, durationMin: 30, description: 'Bespoke beard styling, pre & post-shave conditioning with relaxing face massage', icon: <IcoRazor /> },
  { id: 'ry-beard-colour-application', title: 'Beard colour (only application)', section: 'shave-beard', rating: '4.88 (4K reviews)', price: 199, durationMin: 25, description: "Please provide your own hair colour, we'll bring everything else.", icon: <IcoRazor /> },

  // ── Hair color ──
  { id: 'ry-hair-colour-application', title: 'Hair colour (only application)', section: 'hair-color', rating: '4.87 (8K reviews)', price: 349, durationMin: 30, description: "Please provide your own hair colour, we'll bring everything else.", icon: <IcoPalette /> },
  {
    id: 'ry-loreal-inoa-hair-colour', title: "L'Oreal Inoa hair colour", section: 'hair-color', rating: '4.74 (9K reviews)', price: 749, priceLabel: 'starts-at', icon: <IcoPalette />,
    options: [
      { id: 'ry-inoa-dark-brown', label: 'Dark brown (shade 3)', price: 749, durationMin: 30, rating: '4.76 (5K reviews)' },
      { id: 'ry-inoa-darkest-brown', label: 'Darkest brown (shade 2)', price: 749, durationMin: 30, rating: '4.73 (3K reviews)', note: 'Recommended for black shade' },
      { id: 'ry-inoa-light-brown', label: 'Light brown (shade 5)', price: 749, durationMin: 30, rating: '4.69 (193 reviews)' },
      { id: 'ry-inoa-medium-brown', label: 'Medium brown (shade 4)', price: 749, durationMin: 30, rating: '4.66 (663 reviews)' },
    ],
  },

  // ── Massage ──
  {
    id: 'ry-head-massage', title: 'Head massage', section: 'massage', rating: '4.90 (26K reviews)', price: 219, priceLabel: 'starts-at',
    description: 'Revitalising ritual to stimulate the scalp & nourish the hair with premium oil', icon: <IcoHands />,
    options: [
      { id: 'ry-head-massage-15', label: '15 mins', price: 219, durationMin: 15, rating: '4.90 (22K reviews)' },
      { id: 'ry-head-massage-25', label: '25 mins', price: 349, durationMin: 25, rating: '4.89 (4K reviews)' },
    ],
  },
  { id: 'ry-head-neck-shoulder-massage', title: 'Head, neck & shoulder massage', section: 'massage', rating: '4.86 (20K reviews)', price: 449, durationMin: 40, description: 'Head oil massage along with neck and shoulder dry massage. Perfect to maintain upper body health for people who sit & work for longer hours', icon: <IcoHands /> },
]

const SECTIONS: { id: RoyaleItem['section']; label: string; icon: React.ReactNode }[] = [
  { id: 'packages', label: 'Packages', icon: <IcoPackage /> },
  { id: 'pedicure', label: 'Pedicure', icon: <IcoFoot /> },
  { id: 'hair-care', label: 'Hair care', icon: <IcoScissors /> },
  { id: 'face-care', label: 'Face care', icon: <IcoGlow /> },
  { id: 'shave-beard', label: 'Shave/beard grooming', icon: <IcoRazor /> },
  { id: 'hair-color', label: 'Hair color', icon: <IcoPalette /> },
  { id: 'massage', label: 'Massage', icon: <IcoHands /> },
]

// Original Houzeify copy for each section's CategoryBanner — same
// pattern as every other service-detail screen.
const SECTION_BANNERS: Record<RoyaleItem['section'], { title: string; subtitle: string }> = {
  packages: { title: 'Everything in one booking', subtitle: 'Curated grooming packages for every occasion.' },
  pedicure: { title: 'Feet that feel as good as they look', subtitle: 'Quick grooming to full spa-style pedicures.' },
  'hair-care': { title: 'A cut made for you', subtitle: 'Precision haircuts from trained stylists, for men and boys.' },
  'face-care': { title: 'Fresh, healthy skin', subtitle: 'Facials, detan & cleanups from certified experts.' },
  'shave-beard': { title: 'Sharp, every time', subtitle: 'Shaves and beard styling with a relaxing finish.' },
  'hair-color': { title: 'Colour that suits you', subtitle: 'Application-only or full L’Oréal Inoa colour, done at home.' },
  massage: { title: 'Unwind after a long day', subtitle: 'Head, neck & shoulder massages to ease everyday tension.' },
}

function getRoyaleItem(id: string): RoyaleItem {
  const item = ROYALE_ITEMS.find(i => i.id === id)
  if (!item) throw new Error(`Unknown Royale item id: ${id}`)
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
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button onClick={onBack} aria-label="Back to Services" className="w-8 h-8 -ml-1 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoBack /></button>
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Salon Royale</span>
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
        <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Salon Royale</h1>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all"><IcoBell /></button>
        <button
          onClick={() => onNavigate('booking-details', { hoziehelper_checkout_origin: 'salon-royale' })}
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
        {SECTIONS.map(s => (
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

// ─── Hero — no real grooming photo exists in this project, so this uses
// the same warm-gradient + icon placeholder every other missing-photo
// surface in this app falls back to. ──────────────────────────────────

function HeroBanner({ onExplore, onViewAddOns }: { onExplore: () => void; onViewAddOns: () => void }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{ maxWidth: 990, background: 'linear-gradient(120deg, #F9F5FF 0%, #F3EAFF 45%, #FFF3EA 100%)' }}
    >
      <div className="relative flex flex-col gap-4 px-5 sm:px-10 lg:px-12 py-8 sm:py-10">
        <span className="text-[11px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Salon Royale</span>
        <h2 className="text-[22px] sm:text-[30px] lg:text-[34px] font-semibold text-[#242326] leading-[1.15] tracking-[-0.01em] m-0 max-w-[70%] sm:max-w-[420px]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          Sharp cuts,<br />top-rated pros.
        </h2>
        <p className="text-[13px] sm:text-[14.5px] text-[#68636D] leading-[1.5] m-0 max-w-[70%] sm:max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
          Advanced cuts, beard styling &amp; facials from only top-rated professionals.
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
            View massage
          </button>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-[34%] sm:w-[38%] flex items-center justify-center text-[#722ED1] opacity-20">
        <div style={{ transform: 'scale(3.2)' }}><IcoRazor /></div>
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

// ─── Card chrome — same "calm card" language as every other screen:
// CARD_SURFACE row (128×128 icon panel + content + price/button). One
// row type covers regular services, the five real editable packages
// (via `includes`/`editable`), and "N options" placeholder items,
// rather than a separate card shape per case. ──────────────────────────

const CARD_SURFACE: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFF 100%)',
  border: '1px solid #EFE4FF',
}
const NEUTRAL_BTN = 'h-8 px-3 rounded-[10px] border text-[12px] font-semibold cursor-pointer transition-all shrink-0'
const NEUTRAL_BTN_DEFAULT = 'bg-white border-[#E3DDD7] text-[#722ED1] hover:bg-[#F3EAFF] hover:border-[#722ED1]'
const NEUTRAL_BTN_ADDED = 'bg-[#F3EAFF] border-[#722ED1] text-[#722ED1] hover:bg-[#F3EAFF]'
const NEUTRAL_BTN_FONT: React.CSSProperties = { fontFamily: FONT_BODY }

function RoyaleLineItemRow({ item, cartCount, onSelect, onViewDetails, onEdit, getCartCount }: {
  item: RoyaleItem
  cartCount: number
  onSelect: () => void
  onViewDetails: () => void
  onEdit: () => void
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
          {item.icon}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <span className="text-[15px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
        {item.description && (
          <span className="text-[12px] text-[#68636D] leading-snug" style={{ fontFamily: FONT_BODY }}>{item.description}</span>
        )}
        {item.includes && (
          <ul className="flex flex-col gap-0.5 pl-4 m-0 mt-0.5" style={{ listStyle: 'disc' }}>
            {item.includes.map(inc => (
              <li key={inc} className="text-[12px] text-[#242326] leading-snug" style={{ fontFamily: FONT_BODY }}>{inc}</li>
            ))}
          </ul>
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
            <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.options.length} options available</span>
          )
        ) : item.optionsCount && (
          <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{item.optionsCount} options available</span>
        )}
        <div className="flex items-center gap-3 mt-0.5">
          <button onClick={onViewDetails} className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ fontFamily: FONT_BODY }}>
            View details
          </button>
          {item.editable && (
            <button onClick={onEdit} className="self-start text-[12.5px] text-[#722ED1] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ fontFamily: FONT_BODY }}>
              Edit your package
            </button>
          )}
        </div>
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
// user-supplied option data. Same calm card language as the rest of
// this file (CARD_SURFACE, NEUTRAL_BTN), same component every sibling
// screen uses for its own options items — not a separate visual
// system. ────────────────────────────────────────────────────────────

function OptionsModal({ item, cartCountForOption, onAddOption, onClose }: {
  item: RoyaleItem
  cartCountForOption: (optionId: string) => number
  onAddOption: (option: RoyaleItemOption) => void
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
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[13.5px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{opt.label}</span>
                  {opt.rating && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {opt.rating}</span>
                  )}
                  <span className="text-[13px] font-semibold text-[#242326] whitespace-nowrap" style={{ fontFamily: FONT_BODY }}>₹{opt.price.toLocaleString('en-IN')}</span>
                  {opt.durationMin && (
                    <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(opt.durationMin)}</span>
                  )}
                  {opt.note && (
                    <span className="text-[11px] text-[#9A949D] italic" style={{ fontFamily: FONT_BODY }}>{opt.note}</span>
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
  item: RoyaleItem
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
            <span className="text-[16px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{item.title}</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}><IcoStar size={11} /> {item.rating}</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 -mr-1 -mt-1 shrink-0 flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] rounded-[10px] transition-all border-0 bg-transparent cursor-pointer">
            <IcoCloseX />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="w-16 h-16 rounded-[12px] flex items-center justify-center bg-[#F9F5FF] text-[#722ED1]">{item.icon}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
              {item.priceLabel === 'starts-at' && <span className="text-[#68636D]">Starts at </span>}
              {item.originalPrice && <span className="line-through text-[#9A949D] mr-1">₹{item.originalPrice.toLocaleString('en-IN')}</span>}
              <span className="font-semibold">₹{item.price.toLocaleString('en-IN')}</span>
            </span>
            {item.durationMin && <span className="text-[11px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_HEAD }}>{formatDuration(item.durationMin)}</span>}
          </div>
          {item.description && <p className="text-[13px] text-[#242326] leading-relaxed m-0" style={{ fontFamily: FONT_BODY }}>{item.description}</p>}
          {item.includes && (
            <ul className="flex flex-col gap-1 pl-4 m-0" style={{ listStyle: 'disc' }}>
              {item.includes.map(inc => (
                <li key={inc} className="text-[12.5px] text-[#242326] leading-snug" style={{ fontFamily: FONT_BODY }}>{inc}</li>
              ))}
            </ul>
          )}
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

export default function SalonRoyaleScreen({
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
      categoryId: 'salon-royale',
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
  const addOptionToCart = (item: RoyaleItem, option: RoyaleItemOption) => {
    addToCart({ id: option.id, title: `${item.title} — ${option.label}`, price: option.price, durationMin: option.durationMin })
    setExpandedItemId(null)
  }

  const jumpToSection = (id: string) => {
    document.getElementById(`royale-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartCountForItem = (itemId: string) => cart.find(c => c.cartId === itemId)?.qty ?? 0

  const viewCart = () => {
    onNavigate('booking-details', {
      hoziehelper_checkout_origin: 'salon-royale',
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
                  other service-detail screen. */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] tracking-[0.10em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Men's Salon &amp; Massage</span>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.12] tracking-[-0.01em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Salon Royale
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-6 min-w-0">
                  <HeroBanner onExplore={() => jumpToSection('hair-care')} onViewAddOns={() => jumpToSection('massage')} />
                  <ServiceTabs onJump={jumpToSection} />

                  {SECTIONS.map(section => {
                    const items = ROYALE_ITEMS.filter(i => i.section === section.id)
                    return (
                      <div key={section.id} id={`royale-section-${section.id}`} className="flex flex-col gap-3" style={{ scrollMarginTop: 230 }}>
                        <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{section.label}</h2>
                        <CategoryBanner icon={section.icon} title={SECTION_BANNERS[section.id].title} subtitle={SECTION_BANNERS[section.id].subtitle} />
                        {items.map(item => (
                          <RoyaleLineItemRow
                            key={item.id}
                            item={item}
                            cartCount={cartCountForItem(item.id)}
                            getCartCount={cartCountForItem}
                            onSelect={() => (item.options ? setExpandedItemId(item.id) : addToCart(item))}
                            onViewDetails={() => setDetailItemId(item.id)}
                            onEdit={() => jumpToSection('hair-care')}
                          />
                        ))}
                      </div>
                    )
                  })}
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

      {detailItemId && (
        <ServiceDetailModal
          item={getRoyaleItem(detailItemId)}
          cartCount={cartCountForItem(detailItemId)}
          onSelect={() => {
            const item = getRoyaleItem(detailItemId)
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
          item={getRoyaleItem(expandedItemId)}
          cartCountForOption={cartCountForItem}
          onAddOption={option => addOptionToCart(getRoyaleItem(expandedItemId), option)}
          onClose={() => setExpandedItemId(null)}
        />
      )}
    </div>
  )
}
