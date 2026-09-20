import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import HIcon from '@/shared/components/HIcon'
import HozieInsightCard from '@/shared/components/HozieInsightCard'
import Sidebar from '@/shared/components/Sidebar'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import buildRenovateBg from '@/imports/Services icons/Build-Renovate-bg.png'
import homeServicesBg from '@/imports/Services icons/Home-Services-bg.png'
import SelectAServiceSection, { type SelectAServiceTile } from '@/user/home-services/SelectAServiceSection'
import iconHoziehelper from '@/imports/Services icons/hozie-helper-avatar.png'
import iconSalonForWomen from '@/imports/Services icons/salon-for-women.png'
import iconSalonForMen from '@/imports/Services icons/Thoughtful curations/SalonforMen.png'
import iconFullHomeCleaning from '@/imports/Services icons/New and noteworthy/Full Home-By Room Cleaning.png'
import { initials } from '@/data/homeownerProfile'
import {
  isHomeownerIntent,
  getHomeownerDashboardConfiguration,
  getServiceEntryHeroContent,
  projectStageLabel,
  greetingWord,
  DASHBOARD_ROUTES,
  type HomeownerDashboardState,
} from '@/data/homeownerDashboard'
import { resolveServiceEntry } from '@/data/serviceEntry'
// Customer Implementation 09C — Home's project + estimate state reads the
// canonical stores (same ones Projects / Project Workspace / 08C Profile
// card use), never the ambient projectData bag.
import { resolveProjectStatus } from '@/data/projects'
import { useProjects } from '@/data/projectState'
import { useCustomerProjects } from '@/data/customerProjectsState'
import { acceptProjectCustomerInvite, describeCustomerError } from '@/data/projectCustomerApi'
import { getEstimateVersionsForProject } from '@/data/estimateVersions'

// ─── Sidebar Icons ─────────────────────────────────────────────────────────────

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9L9 3l7 6"/>
    <path d="M4 8v8h3.5v-4h3v4H14V8"/>
  </svg>
)
const IcoProjects = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a1.5 1.5 0 011.5-1.5H7l1.5 2H16a1.5 1.5 0 011.5 1.5V14A1.5 1.5 0 0116 15.5H2A1.5 1.5 0 01.5 14V6z"/>
  </svg>
)
const IcoEstimates = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="1.5"/>
    <line x1="6" y1="6.5" x2="12" y2="6.5"/>
    <line x1="6" y1="9.5" x2="12" y2="9.5"/>
    <line x1="6" y1="12.5" x2="10" y2="12.5"/>
  </svg>
)
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2a6 6 0 016 6v2.5l1.5 3h-15L4 10.5V8a6 6 0 016-6z"/>
    <path d="M8 16a2 2 0 004 0"/>
  </svg>
)
const IcoCircleHelp = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8"/>
    <path d="M7.5 8a2.5 2.5 0 014.5 1.5c0 2-2.5 2.5-2.5 3.5"/>
    <circle cx="10" cy="15.5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoSend = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 2L2 7.5l5 1.5L9.5 14 14 2z" fill="white"/>
    <path d="M7 9l4-7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IcoMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z"/>
    <circle cx="7" cy="5.5" r="1.5"/>
  </svg>
)

// ─── Batch D — primary navigation icons (Build, Profile) ────────────────────
// Same 18x18 / stroke-only convention as every other Sidebar icon on this
// screen — local duplicates, matching this codebase's established per-screen
// icon convention rather than a shared import.

const IcoBuild = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13h12"/>
    <path d="M5 13V9a4 4 0 018 0v4"/>
    <line x1="9" y1="4" x2="9" y2="6.5"/>
  </svg>
)
const IcoProfile = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="6" r="3"/>
    <path d="M3.5 15.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
  </svg>
)

// ─── "Select a service" tile fallback icons ─────────────────────────────────
// Same SVG paths as HomeServicesScreen's own icon set — used only for the
// dashboard tiles that have no real branded image (the cleaning types and
// electrical/plumbing); tiles with real art pass an `image` instead.
const IcoTileCleaning = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.3 4.4L15.7 7.7l-4.4 1.3L10 13.4l-1.3-4.4L4.3 7.7l4.4-1.3L10 2Z"/>
    <path d="M15.5 13l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z"/>
  </svg>
)
const IcoTileElectrical = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2.5L4.5 11.5H9.5L8.5 17.5L15.5 8H10.5L11 2.5z"/>
  </svg>
)
const IcoTilePlumbing = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3.5h5v4a3 3 0 003 3v0a3 3 0 003-3v-1.5"/>
    <path d="M6.5 3.5v4M12 10.5V17M9.2 17h5.6"/>
  </svg>
)

// ─── Batch E — Search chrome icon ───────────────────────────────────────────
const IcoSearch = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="5.5"/>
    <line x1="16" y1="16" x2="12.2" y2="12.2"/>
  </svg>
)


// Sidebar (desktop left rail) now lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never drifts
// or changes shape as you navigate (see that file's header comment for why).

// ─── Mobile Top Bar ────────────────────────────────────────────────────────────
// Mobile header per brief: Logo, Notifications, Profile.

function MobileTopBar({ userInitials, onNavigate }: { userInitials: string; onNavigate: (s: string) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          Home
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate('notifications')} aria-label="Notifications" className="w-8 h-8 flex items-center justify-center text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent">
          <IcoBell />
        </button>
        <button onClick={() => onNavigate('homeowner-profile')} aria-label="Open profile" className="w-8 h-8 rounded-full bg-[#722ED1] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer border-0" style={{ fontFamily: '"Google Sans Flex:Bold", sans-serif' }}>
          {userInitials}
        </button>
      </div>
    </div>
  )
}

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────
// The only primary navigation mobile had until now was the top bar's back/
// profile controls — no way to reach Build/Services/Projects without going
// through Home's page content. Fixed 5-item bar mirrors the desktop
// Sidebar's primary items exactly (same ids/destinations), mobile only.

function MobileBottomNav({ activeNav, onNav, onNavigate }: { activeNav: string; onNav: (id: string) => void; onNavigate: (s: string, data?: Record<string, string>) => void }) {
  const items = [
    { id: 'home', icon: <IcoHome />, label: 'Home', dest: '' },
    { id: 'build', icon: <IcoBuild />, label: 'Build', dest: DASHBOARD_ROUTES.buildOrImprove },
    // Clears any leftover service_entry/service_group from a previous visit
    // — see the matching Sidebar.tsx comment — so this always lands on the
    // Services landing grid, not a stale catalogue view.
    { id: 'services', icon: <IcoEstimates />, label: 'Services', dest: DASHBOARD_ROUTES.homeServices, data: { service_entry: '', service_group: '' } },
    // Customer Implementation 09D — canonical customer Projects hub is
    // 'projects-list' (ProjectsListScreen, the getAllProjects() list), the
    // same destination the desktop Sidebar's Projects item uses. Previously
    // this pointed at 'project-workspace', a project-SPECIFIC screen, so
    // mobile and desktop disagreed. Project Workspace stays project-specific
    // and is still reached by opening a project from the list.
    { id: 'projects', icon: <IcoProjects />, label: 'Projects', dest: 'projects-list' },
    { id: 'profile', icon: <IcoProfile />, label: 'Profile', dest: 'homeowner-profile' },
  ]
  return (
    <nav
      className="flex md:hidden items-stretch justify-between bg-white border-t border-[#E3DDD7] shrink-0 z-10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {items.map(item => {
        const active = activeNav === item.id
        return (
          <button
            key={item.id}
            onClick={() => { item.dest ? onNavigate(item.dest, 'data' in item ? item.data : undefined) : onNav(item.id) }}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 border-0 bg-transparent cursor-pointer"
            style={{ color: active ? '#722ED1' : '#808080' }}
          >
            <span className="w-[20px] h-[20px] flex items-center justify-center">{item.icon}</span>
            <span className="text-[11px] leading-none" style={{ fontFamily: '"Open Sans:Regular", sans-serif', fontWeight: active ? 600 : 400 }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── Top Header ───────────────────────────────────────────────────────────────

function TopHeader({ userInitials, onNavigate, onSearch }: { userInitials: string; onNavigate: (s: string) => void; onSearch: (query: string) => void }) {
  return (
    <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[#FFFFFF] border-b border-[#E3DDD7]">
      <h1
        className="text-[20px] font-semibold text-[#242326] m-0"
        style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}
      >
        Home
      </h1>
      <div className="flex items-center gap-3">
        <div className="w-[220px] lg:w-[280px]">
          <SearchField onSearch={onSearch} />
        </div>
        <button onClick={() => onNavigate('notifications')} aria-label="Notifications" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all cursor-pointer border-0 bg-transparent">
          <IcoBell />
        </button>
        <button aria-label="Help" className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326] transition-all">
          <IcoCircleHelp />
        </button>
        <button onClick={() => onNavigate('homeowner-profile')} aria-label="Open profile" className="flex items-center gap-2 ml-1 px-2 py-1 rounded-[10px] hover:bg-[#F4F0EC] transition-all cursor-pointer border-0 bg-transparent">
          <div className="w-8 h-8 rounded-full bg-[#722ED1] flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ fontFamily: '"Google Sans Flex:Bold", sans-serif' }}>
            {userInitials}
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#808080" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 5l4 4 4-4"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

// ─── Greeting + location ────────────────────────────────────────────────────

function GreetingSection({ preferredName, city, state, onNavigate }: { preferredName: string; city?: string; state?: string; onNavigate: (s: string) => void }) {
  const secondary: Record<string, string> = {
    'build-home': "Here's what's happening with your home today.",
    'improve-home': "Here's what's happening with your home today.",
    'home-service': "Here's what's happening with your home today.",
  }
  return (
    <div className="flex flex-col gap-2 mb-6">
      <span
        className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase"
        style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}
      >
        Your Construction Workspace
      </span>
      <div style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.12s both' }}>
        <h1
          className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.1] m-0"
          style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}
        >
          {/* Customer Implementation 09B — name only when a real one exists;
              otherwise an honest "Good evening." with no fabricated name. */}
          {greetingWord()}{preferredName ? `, ${preferredName}` : ''}.
        </h1>
      </div>
      <p
        className="text-[14px] text-[#68636D] leading-[1.6] m-0"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif', animation: 'welcomeFadeUp 0.45s ease-out 0.2s both' }}
      >
        {secondary['build-home']}
      </p>
      {city && (
        <div className="flex items-center gap-2 mt-1" style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.24s both' }}>
          <span className="flex items-center gap-1 text-[12.5px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
            <IcoMapPin /> {[city, state].filter(Boolean).join(', ')}
          </span>
          <button
            onClick={() => onNavigate(DASHBOARD_ROUTES.locationSetup)}
            className="text-[12px] text-[#722ED1] font-medium hover:underline cursor-pointer border-0 bg-transparent p-0"
            style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
          >
            Change location
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Customer Implementation 09I — Home search ─────────────────────────────
// Wired to the real Home Services catalogue: Enter submits the trimmed query
// to HomeServicesScreen's own existing search (ServiceSearch/SearchResults/
// handleSelect) via a one-shot search_query nav param — no new results
// surface, no new route, never projects/estimates/BOQ/bookings/Hozie.

function SearchField({ onSearch }: { onSearch: (query: string) => void }) {
  const [value, setValue] = useState('')
  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSearch(trimmed)
  }
  return (
    <div className="flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[12px] px-4 h-[44px] focus-within:border-[#722ED1] focus-within:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all">
      <span className="shrink-0 text-[#9A949D]"><IcoSearch /></span>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Search services, ideas, or ask Hozie..."
        aria-label="Search services, ideas, or ask Hozie"
        className="flex-1 bg-transparent outline-none text-[14px] text-[#242326] placeholder-[#9A949D]"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
      />
    </div>
  )
}

// ─── Batch E — Primary actions ────────────────────────────────────────────────
// The two fixed discovery doors every homeowner needs regardless of which
// intent they picked on Screen 007 — always visible, unlike the existing
// config-driven NextActionCard further down (kept, unchanged, as a
// secondary contextual nudge). Both destinations already exist and are
// already reachable elsewhere (HozieHeroCard's build-home CTA, the Services
// nav item) — this only adds a front door, no new screen.
//
// Build/Renovate uses a real supplied background illustration (a
// flattened 590×220 Figma export — gradient + 3D skyline already baked
// in) behind a frosted "liquid glass" content panel, reproducing the
// user's own Figma spec (panel ≈232×183 at 21,18 on the 590×220 frame,
// layered translucent-white gradient + backdrop blur, 18px/14px/12px
// type, #722ED1 button) — translated to percentages so it scales at
// every breakpoint instead of staying pinned to the exact px frame.
//
// The glass panel's look is adapted from a reference CodePen the user
// supplied (a GSAP glassmorphic credit-card demo) — with every
// credit-card-specific element dropped per the user's own instruction
// (the two colored circles, the Visa logo, chip, card number/name
// text) and only the reusable technique kept:
//  - a frosted panel that blurs the *real* content behind it — the
//    CodePen sampled this via an SVG <mask> + a separately-supplied
//    blurred image; here `backdrop-filter: blur()` does the same job
//    natively (it blurs whatever is actually composited behind the
//    element), so no duplicate/cropped image or SVG mask is needed
//  - a subtle grain/noise texture over the glass (the CodePen blended
//    two external noise PNGs via an SVG <pattern>; here it's generated
//    procedurally with an inline SVG feTurbulence data URI, so there's
//    no dependency on a third-party asset host)
//  - the CodePen's own entrance animation (skew/scale/rotate settling
//    in on mount) — kept, on the glass panel.
//  - the CodePen's own `.bg` mousemove parallax (background image
//    drifting opposite the cursor) — kept, on the background photo,
//    rescoped from `window` to this card's own bounds. Its panel-tilt
//    + light-sheen mousemove behavior was tried and then explicitly
//    removed per the user's follow-up — the glass panel itself stays
//    still; only the photo underneath drifts.
// Home Services shares this exact same treatment now, with its own
// supplied background (a matching 2052×766 illustration — house +
// floating electrician/painter/plumber/carpenter service-icon chips),
// plus its own second button ("Ask Hozie") the plain gradient-panel
// version already had.

const GLASS_NOISE_BG = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
)}")`

function PrimaryActionImageCard({
  image, title, body, ctaLabel, onClick, secondaryLabel, onSecondaryClick,
}: {
  /** Fully composed background — gradient + illustration already baked
   *  into one asset (590×220 in the Build/Renovate reference; Home
   *  Services' own is 2052×766, same ≈2.68:1 wide-panorama shape). The
   *  card holds a fixed 240px height at any width — object-cover just
   *  extends the gradient sideways past what the illustration itself
   *  covers, same as any responsive hero-image card. */
  image: string
  title: string
  body: string
  ctaLabel: string
  onClick: () => void
  /** Second action, styled like Salon Royale's hero secondary button —
   *  optional (Build/Renovate has none; Home Services keeps its own
   *  "Ask Hozie"). */
  secondaryLabel?: string
  onSecondaryClick?: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLImageElement>(null)

  // Entrance — the CodePen's own `.card` fromTo (skewed/scaled/rotated
  // and faded in, settling with a power4 ease), applied to the glass
  // panel on mount. Uses GSAP's own React hook (`useGSAP`, the
  // officially recommended way to run GSAP inside a component — it
  // scopes selectors/cleanup to `cardRef` and reverts correctly on
  // unmount).
  useGSAP(
    () => {
      if (!panelRef.current) return
      gsap.fromTo(
        panelRef.current,
        { x: 24, y: 10, rotation: -4, skewX: 6, skewY: 2, scale: 1.12, opacity: 0, transformOrigin: '50% 50%' },
        { duration: 1, x: 0, y: 0, rotation: 0, skewX: 0, skewY: 0, scale: 1, opacity: 1, ease: 'power4.out' },
      )
      // Base scale for the bg image — enlarged slightly so a few px of
      // mouse-parallax drift never reveals empty space at the edges.
      gsap.set(bgRef.current, { scale: 1.08, transformOrigin: '50% 50%' })
    },
    { scope: cardRef },
  )

  // Background parallax — the CodePen's own `.bg` mousemove tween
  // (image drifting opposite the cursor), rescoped from `window` to
  // this card's own bounds and kept soft (small range, slow ease) so
  // it reads as a gentle drift rather than the earlier panel tilt,
  // which stays still now.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !bgRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    gsap.to(bgRef.current, {
      x: (0.5 - relX) * 18,
      y: (0.5 - relY) * 12,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }
  const handleMouseLeave = () => {
    if (!bgRef.current) return
    gsap.to(bgRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.out' })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full overflow-hidden rounded-[24px]"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="relative w-full h-[240px] overflow-hidden">
        <img ref={bgRef} src={image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />

        {/* Glass content panel — positioned/sized as percentages of
            the reference frame (left 21/590, top 18/220, width
            232/590), with a taller min-height than the reference's own
            183px so it holds its place on the illustration at any
            card width. */}
        <div
          ref={panelRef}
          className="absolute left-[3.5%] top-[8%] w-[calc(39%+20px)] min-w-[150px] min-h-[68%] rounded-[20px] overflow-hidden"
          style={{ isolation: 'isolate', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 24px rgba(114,46,209,0.08)' }}
        >
          {/* Blur-through-glass — natively samples/blurs whatever is
              actually behind the panel (the CodePen's masked/blurred
              duplicate image, done natively). */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(113deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 100%)',
              backdropFilter: 'blur(18px) saturate(160%)',
              WebkitBackdropFilter: 'blur(18px) saturate(160%)',
            }}
          />
          {/* Soft purple highlight, upper-left (the CodePen's own
              Rectangle 1 radial tint). */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 90% 143% at 15% 21%, rgba(205,169,255,0.22) 0%, rgba(255,255,255,0.06) 54%, rgba(255,255,255,0) 100%)',
              backgroundBlendMode: 'overlay',
            }}
          />
          {/* Grain — procedural (feTurbulence), no external asset; a
              fixed opacity now that it's no longer mouse-reactive. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: GLASS_NOISE_BG, opacity: 0.06, mixBlendMode: 'overlay' }}
          />

          {/* Content, stacked above the glass layers — title/subtext/
              button typography shared by both cards on this row, for
              consistency. */}
          <div className="relative flex flex-col items-start gap-2 sm:gap-2.5 px-4 py-[31px] sm:px-5 sm:py-[35px]">
            <span
              className="text-[16px] sm:text-[19px] font-semibold text-[#242326] leading-[1.2]"
              style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}
            >
              {title}
            </span>
            <span
              className="text-[12.5px] sm:text-[13px] text-[#68636D] leading-snug"
              style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
            >
              {body}
            </span>
            <div className="flex flex-wrap items-center gap-2.5 mt-[15px]">
              <button
                onClick={onClick}
                className="h-9 sm:h-10 px-4 sm:px-5 rounded-[10px] bg-[#722ED1] text-white text-[12.5px] sm:text-[13px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 shrink-0"
                style={{ fontFamily: '"Open Sans:Regular", sans-serif', boxShadow: '0 2px 8px rgba(114,46,209,0.25)' }}
              >
                {ctaLabel}
              </button>
              {secondaryLabel && (
                <button
                  onClick={onSecondaryClick}
                  className="h-9 sm:h-10 px-4 sm:px-5 rounded-[10px] border border-[#E3DDD7] text-[#722ED1] text-[12.5px] sm:text-[13px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
                  style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
                >
                  {secondaryLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PrimaryActionsRow({
  onBuild, onServices,
}: {
  onBuild: () => void
  onServices: () => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PrimaryActionImageCard
        image={buildRenovateBg}
        title="Build / Renovate"
        body="Plan, estimate and build your dream home."
        ctaLabel="Get Started →"
        onClick={onBuild}
      />
      <PrimaryActionImageCard
        image={homeServicesBg}
        title="Home Services"
        body="Book trusted professionals for your home."
        ctaLabel="Book a Service →"
        onClick={onServices}
      />
    </div>
  )
}

// ─── Service discovery — "Select a service" ─────────────────────────────────
// The dashboard reuses HomeServicesScreen's "Select a service" section
// (shared SelectAServiceSection component) with its own curated tile list:
// personal-care tiles open a pick-a-tier picker on the Services landing
// (open_picker → HomeServicesScreen's effect); cleaning and trade tiles go
// straight to their dedicated screens. The list is built in the component
// body so it can close over `onNavigate`.

// ─── Hozie hero — compact, intent-aware; NOT a full chat experience ───────────

function HozieHeroCard({
  title,
  message,
  ctaLabel,
  onCta,
}: {
  title: string
  message: string
  ctaLabel: string
  onCta: () => void
}) {
  return (
    <div
      className="w-full bg-white rounded-[24px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4"
      style={{ boxShadow: '0 2px 20px rgba(243,234,255,0.07), 0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center rounded-[14px] bg-[#F3EAFF] shrink-0" style={{ width: 44, height: 44 }}>
          <HIcon size={28} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold text-[#242326] leading-none" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
            HOZIE
          </span>
          <span className="text-[11px] tracking-[0.08em] text-[#722ED1] leading-none" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
            AI CONSTRUCTION ADVISOR
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-[#722ED1] shrink-0" style={{ animation: 'hozieStatusPulse 2.2s ease-in-out infinite' }} />
          <span className="text-[12px] text-[#722ED1] tracking-[0.06em]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>READY</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[20px] sm:text-[24px] font-medium text-[#242326] leading-tight m-0" style={{ fontFamily: '"Google Sans Flex:Medium", sans-serif' }}>
          {title}
        </h2>
        <p className="text-[14px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
          {message}
        </p>
      </div>

      <button
        onClick={onCta}
        className="self-start h-[42px] px-5 rounded-[12px] bg-[#722ED1] text-white text-[13.5px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

// ─── AI conversation entry — opens 013 AI Advisor, no inline chat here ────────

const AI_PROMPT_EXAMPLES = [
  'How much will my house cost?',
  'Find flooring professionals near me',
  'Is this contractor quote reasonable?',
]

function AiPromptEntry({ onSubmit }: { onSubmit: (query: string) => void }) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="w-full bg-white rounded-[20px] border border-[#E3DDD7] p-4 sm:p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <label htmlFor="ai-prompt-input" className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
        Ask Hozie
      </label>
      <div className="flex items-center gap-3 bg-[#FFFFFF] border border-[#E3DDD7] rounded-[14px] px-4 h-[52px] focus-within:border-[#722ED1] focus-within:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all">
        <div className="shrink-0 flex items-center justify-center opacity-60">
          <HIcon size={16} />
        </div>
        <input
          ref={inputRef}
          id="ai-prompt-input"
          type="text"
          placeholder="Ask Hozie anything about your home..."
          aria-label="Ask Hozie anything about your home"
          className="flex-1 bg-transparent outline-none text-[14px] text-[#242326] placeholder-[#9A949D]"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(value) }}
        />
        <button
          onClick={() => submit(value)}
          disabled={!value.trim()}
          aria-label="Send to Hozie"
          className={[
            'w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-150',
            value.trim() ? 'bg-[#722ED1] cursor-pointer hover:brightness-90 active:scale-95' : 'bg-[#F4F0EC] cursor-not-allowed',
          ].join(' ')}
        >
          <IcoSend />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {AI_PROMPT_EXAMPLES.map(example => (
          <button
            key={example}
            onClick={() => submit(example)}
            className="text-[11.5px] text-[#68636D] bg-[#FFFFFF] border border-[#E3DDD7] rounded-full px-3 py-1.5 hover:border-[#722ED1] hover:text-[#722ED1] transition-colors cursor-pointer"
            style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Next best action — the single primary CTA ────────────────────────────────

function NextActionCard({ eyebrow, title, body, ctaLabel, onCta }: { eyebrow: string; title: string; body: string; ctaLabel: string; onCta: () => void }) {
  return (
    <div
      className="w-full rounded-[20px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
      style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}
    >
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span className="text-[11.5px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
          {eyebrow}
        </span>
        <h3 className="text-[19px] sm:text-[21px] font-semibold text-[#242326] leading-snug m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
          {title}
        </h3>
        <p className="text-[13.5px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
          {body}
        </p>
      </div>
      <button
        onClick={onCta}
        className="shrink-0 h-[46px] px-6 rounded-[12px] bg-[#722ED1] text-white text-[14px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.99] transition-all border-0 w-full sm:w-auto"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

// ─── Quick actions — secondary; Next Step remains the primary CTA ────────────

function QuickActionsCard({ actions, onNavigate }: { actions: { label: string; dest: string }[]; onNavigate: (s: string) => void }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-4 h-full" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
        Quick Actions
      </span>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(action => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.dest)}
            className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-[12px] border border-[#E3DDD7] bg-[#FFFFFF] hover:bg-[#F9F5FF] hover:border-[#722ED1] hover:text-[#722ED1] text-[#68636D] transition-all cursor-pointer text-center"
          >
            <span className="text-[12px] leading-tight" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Marketplace snapshot — only when real contractor/bid/quote data exists ──
// No Contractor/Bid/Quote model exists in the codebase yet, so `items` is
// always empty today; the component stays ready for when one does, matching
// "Do not show marketplace cards when there is no relevant data."

function MarketplaceSnapshot({ kind, items, onViewAll }: { kind: 'contractors' | 'bids'; items: string[]; onViewAll: () => void }) {
  if (items.length === 0) return null
  const heading = kind === 'contractors' ? 'Contractors For You' : 'Bids Received'
  const subheading = kind === 'contractors' ? `${items.length} professionals match your project.` : `${items.length} bids received.`
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-4 h-full" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{heading}</span>
        <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{subheading}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.slice(0, 3).map(name => (
          <div key={name} className="text-[13px] text-[#242326] px-3 py-2 rounded-[10px] bg-[#FFFFFF]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{name}</div>
        ))}
      </div>
      <button onClick={onViewAll} className="self-start text-[13px] text-[#722ED1] font-medium hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        {kind === 'contractors' ? 'View all contractors →' : 'Compare bids →'}
      </button>
    </div>
  )
}

// ─── Estimate snapshot — only when an estimate exists; no invented ₹ figure ──

function EstimateSnapshot({ projectName, onView }: { projectName?: string; onView: () => void }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3 flex-1 min-w-[240px]" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
        Your Estimate
      </span>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        Your estimate for {projectName ?? 'your project'} is ready to review.
      </p>
      <button onClick={onView} className="self-start text-[13px] text-[#722ED1] font-medium hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        View estimate →
      </button>
    </div>
  )
}

// ─── BOQ snapshot — only when a BOQ has actually been generated ──────────────
// No flow writes a "BOQ generated" flag yet, so this stays dark for now —
// present in the structure, gated correctly, ready for when one does.

function BOQSnapshot({ itemCount, onView }: { itemCount: number; onView: () => void }) {
  if (itemCount <= 0) return null
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3 flex-1 min-w-[240px]" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
        Your BOQ
      </span>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        {itemCount} items ready to review.
      </p>
      <button onClick={onView} className="self-start text-[13px] text-[#722ED1] font-medium hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        View BOQ →
      </button>
    </div>
  )
}

// ─── Loading skeleton — lightweight, never fake data ──────────────────────────

function DashboardSkeleton() {
  const bar = (w: string, h = 14) => <div className="rounded-full bg-[#F4F0EC]" style={{ width: w, height: h, animation: 'hozieStatusPulse 1.6s ease-in-out infinite' }} />
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="flex flex-col gap-2">{bar('40%', 12)}{bar('55%', 30)}{bar('35%', 14)}</div>
      <div className="rounded-[24px] border border-[#E3DDD7] p-6 flex flex-col gap-3">{bar('30%')}{bar('60%', 24)}{bar('80%')}</div>
      <div className="rounded-[20px] border border-[#E3DDD7] p-6 flex flex-col gap-3">{bar('25%')}{bar('50%', 20)}</div>
      <div className="rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3">{bar('20%')}{bar('70%')}</div>
    </div>
  )
}

// ─── Error state ────────────────────────────────────────────────────────────

function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-20" style={{ maxWidth: 420, margin: '0 auto' }}>
      <p className="text-[15px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        We couldn&apos;t load your workspace.
      </p>
      <button
        onClick={onRetry}
        className="h-10 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-medium cursor-pointer hover:brightness-90 transition-all border-0"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        Try again
      </button>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
// Screen 012 — Homeowner AI Dashboard. One reusable dashboard, dynamic per
// primaryIntent (build-home / improve-home / home-service) — never three
// separate dashboards. Reads exclusively from getHomeownerDashboardConfiguration().

export default function HomeDashboardScreen({
  onNavigate,
  role,
  primaryIntent,
  preferredName,
  fullName,
  city,
  state,
  projectName,
  projectLocation,
  projectStage,
  projectId,
  homeType,
  constructionStage,
  homeBHK,
  homeBuiltUpArea,
  homeFloorCount,
  serviceEntry,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  /** The canonical top-level persona ('homeowner' | 'professional'),
   *  resolved once on Screen 007 and passed down by App.tsx — the sole
   *  source of truth for the role-safety check below. primaryIntent is
   *  still used further down to shape which homeowner intent is shown; it
   *  is never the top-level role decision. */
  role?: string
  primaryIntent?: string
  preferredName?: string
  fullName?: string
  city?: string
  state?: string
  projectName?: string
  projectLocation?: string
  projectStage?: string
  /** Batch C — real project_id, set only once Screen 035 (Create Project)
   *  has actually run. Never minted here; only read. */
  projectId?: string
  /** Batch C — real Screen 011 "Your Home" fields, read as-is from
   *  projectData. All optional; none are fabricated when absent. */
  homeType?: string
  constructionStage?: string
  homeBHK?: string
  homeBuiltUpArea?: string
  homeFloorCount?: string
  /** Which of the two service destinations (Screen 007) this session
   *  entered through — only meaningful when resolvedIntent === 'home-service'. */
  serviceEntry?: string
}) {
  const [activeNav, setActiveNav] = useState('home')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  // ROLE SAFETY: a professional must never see homeowner dashboard content.
  // Redirect via the existing navigation mechanism, not a duplicated
  // professional-dashboard implementation. Driven by the canonical `role`
  // only — never primaryIntent, which is a secondary, homeowner-shaped
  // field that can be blank even for a genuine professional.
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (isProfessional) onNavigate(DASHBOARD_ROUTES.professionalDashboard)
  }, [isProfessional, onNavigate])
  // 12H-B — real, owner-scoped backend project list (see
  // src/data/projectState.tsx), replacing getAllProjects(). Always called
  // (rules of hooks), only consulted below for the build-home canonical
  // project shortcut.
  const projectsCtx = useProjects()
  const sharedProjects = useCustomerProjects()
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const pendingInvite = sharedProjects.projects.find(p => p.customerStatus === 'invited')
  const activeShared = sharedProjects.projects.find(p => p.customerStatus === 'active')

  // Lightweight simulated workspace load — skeleton only, never fake data.
  useEffect(() => {
    setLoading(true)
    setLoadError(false)
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [attempt])

  if (isProfessional) return null

  // No valid homeowner intent yet (e.g. a direct jump before onboarding) —
  // default to build-home rather than showing a dead-end, matching the rest
  // of the app's existing "House / Hyderabad" default project data.
  const resolvedIntent = isHomeownerIntent(primaryIntent) ? primaryIntent : 'build-home'

  // improve-home / home-service used to surface the most-recent RFQ
  // ServiceRequest here; that flow has been removed, so these branches have
  // no project name / stage to show.

  // ─── Customer Implementation 09C — canonical project + estimate state ────
  // build-home project + estimate info now comes from the same canonical
  // stores Projects, Project Workspace and the 08C Profile card read —
  // projects.ts (getAllProjects / resolveProjectStatus) and
  // estimateVersions.ts (getEstimateVersionsForProject) — never the ambient
  // projectData bag, and never "a project name exists ⇒ an estimate is
  // ready". Current project = the most recently updated one, the same
  // selection ProjectsListScreen and the 08C Profile card make. Only
  // consulted for build-home; the improve-home / home-service branches keep
  // reading the real ServiceRequest exactly as before.
  // 12H-B — projectsCtx.projects is already sorted most-recently-updated
  // first by the real backend (matches the old getAllProjects() ordering
  // exactly), so [0] is still the same "canonical project" this dashboard
  // card has always meant — never reinterpreted as "the user's only
  // project" (12H-A's own explicit warning).
  const canonicalProject = resolvedIntent === 'build-home' ? projectsCtx.projects[0] : undefined
  const canonicalProjectStatus = canonicalProject
    ? resolveProjectStatus(canonicalProject.id, canonicalProject.stage ?? undefined)
    : undefined
  const hasRealEstimate = Boolean(
    canonicalProject && getEstimateVersionsForProject(canonicalProject.id).length > 0,
  )

  const state_: HomeownerDashboardState = {
    primaryIntent: resolvedIntent,
    // Customer Implementation 09B — real onboarding identity only; never the
    // hardcoded homeownerProfile demo person. (This field is currently unread
    // by getHomeownerDashboardConfiguration, but it stays honest regardless.)
    preferredName: preferredName || fullName || '',
    city,
    state,
    hasProject: resolvedIntent === 'build-home' ? Boolean(canonicalProject) : Boolean(projectName),
    projectName: resolvedIntent === 'build-home' ? canonicalProject?.name : undefined,
    projectLocation: resolvedIntent === 'build-home' ? (canonicalProject?.location ?? undefined) : undefined,
    // Live resolved status id (resolveProjectStatus), consistent with
    // Projects / Project Workspace — never the raw stage stored at creation.
    projectStage: resolvedIntent === 'build-home' ? canonicalProjectStatus : undefined,
    hasPlan: false,
    hasEstimate: resolvedIntent === 'build-home' && hasRealEstimate,
    hasBoq: false,
    hasBids: false,
  }

  let config
  try {
    config = getHomeownerDashboardConfiguration(state_)
    // Home Services / Cleaning Services: swap in the real, service_entry-
    // specific hero copy — minimum change necessary, everything else about
    // the configuration (next action, empty state, insight) stays exactly
    // as getHomeownerDashboardConfiguration() already computed it.
    if (config && resolvedIntent === 'home-service') {
      config = { ...config, hero: getServiceEntryHeroContent(resolveServiceEntry(serviceEntry)) }
    }
  } catch {
    config = null
  }

  // Customer Implementation 09H — the config-driven Home CTAs (Next Action,
  // Hozie Insight, Quick Actions) carry only a route string. When that route
  // is the Estimate flow and a canonical Build-Home project exists (09C),
  // attach its real id — the same `canonicalProject.id` the main
  // EstimateSnapshot CTA already passes — so estimate-dashboard renders the
  // genuine version data rather than its no-id demo fallback. Every other
  // destination navigates unchanged.
  const navFromConfig = (dest: string) => {
    if (dest === DASHBOARD_ROUTES.estimateDashboard && canonicalProject) {
      onNavigate(dest, { project_id: canonicalProject.id })
      return
    }
    onNavigate(dest)
  }

  // Customer Implementation 09B — greeting + avatar derive from the real
  // onboarding identity (projectData.preferred_name / full_name). When
  // neither exists the greeting drops the name entirely ("Good evening.")
  // and initials() returns its own neutral "?" — never "Adarsh" / "AK".
  const userInitials = initials(fullName?.trim() || preferredName?.trim() || '')
  const displayName = preferredName?.trim() || fullName?.trim().split(' ')[0] || ''

  // No Contractor/Bid data model exists in the codebase yet — always empty
  // until a real matching/bidding flow writes real names here.
  const marketplaceItems: string[] = []

  const handleAiPromptSubmit = (query: string) => {
    onNavigate(DASHBOARD_ROUTES.aiAdvisor, { ai_query: query })
  }
  // Customer Implementation 09I — Home search targets the Home Services
  // catalogue only (never Cleaning, never projects/estimates/BOQ/bookings/
  // Hozie). Carries the query to HomeServicesScreen the same one-shot way
  // "Select a service" tiles already carry open_picker.
  const handleSearch = (query: string) =>
    onNavigate(DASHBOARD_ROUTES.homeServices, { service_entry: 'home-services', service_group: '', open_picker: '', search_query: query })
  // The dashboard's curated "Select a service" tiles. Personal-care tiles
  // open their pick-a-tier picker on the Services landing (open_picker →
  // HomeServicesScreen's effect); the cleaning and trade tiles go straight
  // to their dedicated screens. Tiles with real branded art pass an `image`;
  // the rest fall back to a line icon (SelectAServiceSection handles both).
  const goServicePicker = (openPicker: string) =>
    onNavigate(DASHBOARD_ROUTES.homeServices, { service_entry: '', service_group: '', open_picker: openPicker })
  const selectAServiceTiles: SelectAServiceTile[] = [
    { id: 'hoziehelp', label: 'HozieHelp', image: iconHoziehelper, onClick: () => goServicePicker('hoziehelper') },
    { id: 'salon-for-women', label: 'Salon for Women', image: iconSalonForWomen, onClick: () => goServicePicker('salon-for-women') },
    { id: 'salon-for-men', label: 'Salon for Men', image: iconSalonForMen, onClick: () => goServicePicker('salon-for-men') },
    // Houzeify 2.0 Module 02 — these 5 tiles used to route straight to
    // their own category screens, bypassing DASHBOARD_ROUTES.homeServices
    // entirely; now routed through the same constant so Home Services stays
    // fully hidden from this dashboard (see homeownerDashboard.ts's own
    // comment on homeServices).
    { id: 'bathroom-cleaning', label: 'Bathroom Cleaning', icon: <IcoTileCleaning />, onClick: () => onNavigate(DASHBOARD_ROUTES.homeServices) },
    { id: 'kitchen-cleaning', label: 'Kitchen Cleaning', icon: <IcoTileCleaning />, onClick: () => onNavigate(DASHBOARD_ROUTES.homeServices) },
    { id: 'full-home-cleaning', label: 'Full Home Cleaning', image: iconFullHomeCleaning, onClick: () => onNavigate(DASHBOARD_ROUTES.homeServices) },
    { id: 'electrical', label: 'Electrical', icon: <IcoTileElectrical />, onClick: () => onNavigate(DASHBOARD_ROUTES.homeServices) },
    { id: 'plumbing', label: 'Plumbing', icon: <IcoTilePlumbing />, onClick: () => onNavigate(DASHBOARD_ROUTES.homeServices) },
  ]

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar userInitials={userInitials} onNavigate={onNavigate} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="home" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader userInitials={userInitials} onNavigate={onNavigate} onSearch={handleSearch} />

          <main className="flex-1 overflow-y-auto px-6 py-7 pb-24 md:pb-7" style={{ scrollbarWidth: 'none' }}>
            {loading && <DashboardSkeleton />}

            {!loading && (loadError || !config) && (
              <DashboardErrorState onRetry={() => setAttempt(a => a + 1)} />
            )}

            {!loading && !loadError && config && (
              <div className="flex flex-col gap-6" style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* 1. Header — greeting + location (notifications live in
                    MobileTopBar/TopHeader above, unchanged) */}
                <GreetingSection preferredName={displayName} city={city} state={state} onNavigate={onNavigate} />

                {/* 2. Search — UI only, no backend search yet. Desktop now
                    has this in TopHeader instead (beside notifications);
                    mobile keeps it here since MobileTopBar has no room. */}
                <div className="md:hidden" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.12s both' }}>
                  <SearchField onSearch={handleSearch} />
                </div>

                {/* 3. Ask Hozie — reuses the existing Hozie hero + AI
                    conversation entry components unchanged; moved up to sit
                    directly below Search per request. AiPromptEntry sits
                    above HozieHeroCard per follow-up request. */}
                <div className="flex flex-col gap-4" style={{ animation: 'welcomeFadeUp 0.5s ease-out 0.16s both' }}>
                  <AiPromptEntry onSubmit={handleAiPromptSubmit} />
                  <HozieHeroCard
                    title={config.hero.title}
                    message={config.hero.message}
                    ctaLabel={config.hero.ctaLabel}
                    onCta={() => onNavigate(config.hero.ctaDest)}
                  />
                </div>

                {/* 4. Primary image-led actions — Build/Renovate, Home Services */}
                <div style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.2s both' }}>
                  <PrimaryActionsRow
                    onBuild={() => onNavigate(DASHBOARD_ROUTES.buildOrImprove)}
                    onServices={() => onNavigate(DASHBOARD_ROUTES.homeServices, { service_entry: '', service_group: '' })}
                  />
                </div>

                {/* 4b. Service discovery — HomeServicesScreen's "Select a
                    service" section (shared component) with the dashboard's
                    own curated tile list. Replaces the earlier bespoke
                    Popular/Cleaning rows. */}
                <div style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.24s both' }}>
                  <SelectAServiceSection tiles={selectAServiceTiles} />
                </div>

                {(pendingInvite || activeShared) && (
                  <div className="rounded-[16px] bg-white p-5 min-w-0" style={{ border: '1px solid #E3DDD7', animation: 'welcomeFadeUp 0.45s ease-out 0.18s both' }}>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-2" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Construction</p>
                    {pendingInvite ? (
                      <>
                        <h2 className="text-[18px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>Join {pendingInvite.name}</h2>
                        <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                          {pendingInvite.organizationName ?? 'Your builder'} invited you to follow this project.
                        </p>
                        {inviteError && <p className="text-[13px] text-[#B91C1C] m-0 mt-2">{inviteError}</p>}
                        <button
                          type="button"
                          disabled={inviteBusy}
                          onClick={() => {
                            setInviteBusy(true)
                            setInviteError(null)
                            acceptProjectCustomerInvite(pendingInvite.id)
                              .then(() => sharedProjects.refresh())
                              .catch(err => setInviteError(describeCustomerError(err)))
                              .finally(() => setInviteBusy(false))
                          }}
                          className="h-11 px-5 mt-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                          style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: '"Open Sans:Regular", sans-serif' }}
                        >
                          Join this project
                        </button>
                      </>
                    ) : activeShared ? (
                      <>
                        <h2 className="text-[18px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{activeShared.name}</h2>
                        <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                          {activeShared.stage ?? 'Construction in progress'}
                          {activeShared.organizationName ? ` · ${activeShared.organizationName}` : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() => onNavigate('project-progress', { project_id: activeShared.id, project_name: activeShared.name })}
                          className="h-11 px-5 mt-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                          style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: '"Open Sans:Regular", sans-serif' }}
                        >
                          View progress
                        </button>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Next best action — existing config-driven contextual CTA,
                    kept as a secondary nudge below the primary sections */}
                <NextActionCard
                  eyebrow={config.nextAction.eyebrow}
                  title={config.nextAction.title}
                  body={config.nextAction.body}
                  ctaLabel={config.nextAction.ctaLabel}
                  onCta={() => navFromConfig(config.nextAction.ctaDest)}
                />

                {/* Marketplace (only if relevant) + Quick actions */}
                <div className={marketplaceItems.length > 0 ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'}>
                  {marketplaceItems.length > 0 && (
                    <div className="lg:order-2">
                      <MarketplaceSnapshot kind={resolvedIntent === 'build-home' ? 'contractors' : 'bids'} items={marketplaceItems} onViewAll={() => onNavigate(DASHBOARD_ROUTES.findContractors)} />
                    </div>
                  )}
                  <div className="lg:order-1">
                    <QuickActionsCard actions={config.quickActions} onNavigate={navFromConfig} />
                  </div>
                </div>

                {/* Estimate / BOQ / Insight */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  {/* Customer Implementation 09C — shown ONLY when a real
                      EstimateVersion exists for the canonical project (see
                      hasRealEstimate above), and its CTA carries that real
                      project id so estimate-dashboard renders the genuine
                      version data rather than its no-id demo fallback. A
                      project with no estimate yet shows no estimate card;
                      the Next Step / Hozie insight cards already guide that
                      state honestly. */}
                  {state_.hasEstimate && canonicalProject && (
                    <EstimateSnapshot
                      projectName={state_.projectName}
                      onView={() => onNavigate(DASHBOARD_ROUTES.estimateDashboard, { project_id: canonicalProject.id })}
                    />
                  )}
                  <BOQSnapshot itemCount={0} onView={() => onNavigate(DASHBOARD_ROUTES.boqOverview)} />
                  <div className="flex-1 min-w-[240px]">
                    <HozieInsightCard
                      message={config.insight.message}
                      actionLabel={config.insight.actionLabel}
                      onAction={() => navFromConfig(config.insight.actionDest)}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav activeNav={activeNav} onNav={setActiveNav} onNavigate={onNavigate} />
    </div>
  )
}
