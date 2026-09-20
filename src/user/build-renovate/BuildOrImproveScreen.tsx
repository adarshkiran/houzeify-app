// ─── Build / Renovate chooser ────────────────────────────────────────────
// Reached from the Home dashboard's "Build / Renovate" primary action card
// (previously a direct jump to Screen 035 Create Project, skipping the
// existing homeowner-intent chain entirely). This screen asks the one
// question that chain already exists to answer — new construction or an
// improvement to an existing home — then feeds the same real onboarding
// chain Screen 007 (PrimaryIntentScreen) already uses:
//
//   Build a New Home   → Flow 04's own dedicated New Build journey, starting
//                         directly at House Requirements (HouseRequirements
//                         Screen.tsx) — Screens 008/009/010/011/035
//                         (Homeowner Setup, Your Profile, Location, Home
//                         Project, Create Project) are no longer part of
//                         this path: profile/location now live at signup
//                         (see AccountCreatedScreen.tsx), building type is
//                         its own section inside House Requirements, and
//                         that screen mints the project itself.
//   Improve My Home    → Flow 03's own dedicated Renovate journey
//                         (RenovateSelectAreaScreen.tsx onward) — its own
//                         area picker, space details, requirements,
//                         budget/timeline, uploads, AI plan, estimate and
//                         Package/Professional/Custom-Quote decision,
//                         never the generic homeowner-intent chain above.
//
// Screen 007 (PrimaryIntentScreen)'s own "Build a New Home"/"Improve My
// Home" cards are untouched — they still use nextScreenForIntent() and the
// original full onboarding chain, exactly as before. Only THIS screen's own
// cards are special-cased below.
//
// Content and visual
// language are lifted directly from Screen 007's own "For Your Home" cards
// (INTENT_CONTENT, icons, card styling) for exact consistency — this is
// deliberately a focused, single-click variant of that screen (no Home
// Services / Professional cards, no separate Continue step) since a user
// who already clicked "Build / Renovate" has told us they want one of
// these two, not a full re-ask of Screen 007's four options.

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import buildNewHomeBg from '@/imports/Services icons/Build-New-Home-bg.png'
import improveMyHomeBg from '@/imports/Services icons/Improve-My-Home-bg.png'
import { INTENT_CONTENT, nextScreenForIntent, roleForIntent, type PrimaryIntent } from '@/data/primaryIntent'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Icons — same marks as Screen 007's own Build/Improve cards ───────────

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8h11M9 3.5L13.5 8L9 12.5" /></svg>
)
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8H3M7 3.5L2.5 8L7 12.5" /></svg>
)
interface ChooserCard {
  intent: PrimaryIntent
  /** Real illustration the user supplied for this exact card (a
   *  matching-style 3D house render — under-construction w/ crane for
   *  Build a New Home, mid-renovation w/ scaffolding + trade-icon
   *  chips for Improve My Home) — same ≈2.68:1 wide-panorama shape as
   *  the Home dashboard's own glass cards. */
  image: string
}

const CARDS: ChooserCard[] = [
  { intent: 'build-home', image: buildNewHomeBg },
  { intent: 'improve-home', image: improveMyHomeBg },
]

// Procedural grain — same inline feTurbulence data URI as the Home
// dashboard's own glass cards (PrimaryActionImageCard in
// HomeDashboardScreen.tsx), so both screens' glass panels match
// exactly with no external asset dependency.
const GLASS_NOISE_BG = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
)}")`

// ─── Glass chooser card ─────────────────────────────────────────────────
// Same "liquid glass" system as the Home dashboard's PrimaryActionImageCard
// (HomeDashboardScreen.tsx) — real photo backdrop, frosted panel (blur +
// soft purple highlight + procedural grain), GSAP entrance animation, and
// a soft mouse-parallax drift on the background photo — reproduced here
// with this screen's own content shape (eyebrow + title + description +
// arrow-link, not title + subtext + button) and real INTENT_CONTENT copy.

function ChooserCardButton({ card, onSelect }: { card: ChooserCard; onSelect: () => void }) {
  const content = INTENT_CONTENT[card.intent]
  const cardRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLImageElement>(null)

  useGSAP(
    () => {
      if (!panelRef.current) return
      gsap.fromTo(
        panelRef.current,
        { x: 24, y: 10, rotation: -4, skewX: 6, skewY: 2, scale: 1.12, opacity: 0, transformOrigin: '50% 50%' },
        { duration: 1, x: 0, y: 0, rotation: 0, skewX: 0, skewY: 0, scale: 1, opacity: 1, ease: 'power4.out' },
      )
      gsap.set(bgRef.current, { scale: 1.08, transformOrigin: '50% 50%' })
    },
    { scope: cardRef },
  )

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    <button
      ref={cardRef}
      type="button"
      aria-label={content.title}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative text-left w-full overflow-hidden rounded-[24px] cursor-pointer border-0 p-0 outline-none transition-all duration-300 ease-out hover:-translate-y-1"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="relative w-full h-[240px] overflow-hidden">
        <img ref={bgRef} src={card.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />

        {/* Glass content panel — identical recipe to the Home dashboard's
            own glass cards. */}
        <div
          ref={panelRef}
          className="absolute left-[3.5%] top-[8%] w-[calc(39%+20px)] min-w-[170px] min-h-[68%] rounded-[20px] overflow-hidden"
          style={{ isolation: 'isolate', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 24px rgba(114,46,209,0.08)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(113deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 100%)',
              backdropFilter: 'blur(18px) saturate(160%)',
              WebkitBackdropFilter: 'blur(18px) saturate(160%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 90% 143% at 15% 21%, rgba(205,169,255,0.22) 0%, rgba(255,255,255,0.06) 54%, rgba(255,255,255,0) 100%)',
              backgroundBlendMode: 'overlay',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: GLASS_NOISE_BG, opacity: 0.06, mixBlendMode: 'overlay' }}
          />

          <div className="relative flex flex-col items-start gap-1.5 px-4 py-[26px] sm:px-5 sm:py-[30px]">
            <span className="text-[10px] tracking-[0.10em] uppercase font-semibold text-[#A1A1A1]" style={{ fontFamily: FONT_MONO }}>
              {content.supportingLabel}
            </span>
            <span className="text-[16px] sm:text-[18px] font-semibold leading-[1.2] text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
              {content.title}
            </span>
            <span className="text-[12px] sm:text-[12.5px] text-[#68636D] leading-snug" style={{ fontFamily: FONT_BODY }}>
              {content.description}
            </span>
            <span className="mt-[15px] flex items-center gap-1.5 text-[12.5px] sm:text-[13px] font-semibold text-[#722ED1]" style={{ fontFamily: FONT_BODY }}>
              {content.cta} <ArrowRightIcon />
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function BuildOrImproveScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  function selectIntent(intent: PrimaryIntent) {
    // "Build a New Home" is Flow 04's own entry point — routed straight
    // into House Requirements, never the generic homeowner-intent chain.
    // Never touches nextScreenForIntent() itself, so PrimaryIntentScreen's
    // own "Build a New Home" card (Screen 007) keeps its exact current
    // behavior (full Homeowner Setup → Your Profile → Location → Home
    // Project → Create Project chain, untouched).
    if (intent === 'build-home') {
      // Clears whatever project was last active in projectData (its own
      // cumulative bag never resets itself) — otherwise, when a homeowner
      // already has a project from an earlier visit this session, House
      // Requirements would reuse that OLD project_id (its own "reuse an
      // existing id" convention, meant for revisiting the SAME project)
      // and silently overwrite it with a second project's details instead
      // of minting a genuinely new one. See the identical fix on Projects
      // List / Project Workspace's own "Create a Project" buttons.
      onNavigate('house-requirements', {
        primary_intent: intent,
        role: roleForIntent(intent),
        project_id: '', project_name: '', project_type: '', project_stage: '',
        location: '', property_type: '',
      })
      return
    }
    // "Improve My Home" is this app's own Renovate entry point (see this
    // file's own header comment / INTENT_CONTENT['improve-home']'s real
    // copy: "Renovation, remodeling, extensions and structural upgrades").
    // Routed straight into the dedicated Renovate journey (Flow 03)
    // instead of the generic homeowner-intent chain — never touches
    // nextScreenForIntent() itself, so PrimaryIntentScreen's own "Improve
    // My Home" card (Screen 007) keeps its exact current behavior.
    if (intent === 'improve-home') {
      onNavigate('renovate-select-area', {
        primary_intent: intent,
        role: roleForIntent(intent),
      })
      return
    }
    onNavigate(nextScreenForIntent(intent), {
      primary_intent: intent,
      role: roleForIntent(intent),
      // See PrimaryIntentScreen.tsx's identical comment — same flag, same
      // chain, cleared by Screen 011 once it finishes.
      onboarding_flow: 'true',
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Same shared left rail every other homeowner dashboard/flow screen
            uses (HomeDashboardScreen, HouseRequirementsScreen,
            RenovateSelectAreaScreen — both of which this chooser leads
            into) — "build" is the correct highlighted item here, same as
            its two destinations. */}
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <header className="shrink-0">
            <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
              <button
                onClick={() => onNavigate('dashboard-home')}
                aria-label="Back to Home"
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent"
                style={{ fontFamily: FONT_BODY }}
              >
                <ArrowLeftIcon /> Back
              </button>
              <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto md:hidden" style={{ mixBlendMode: 'multiply' }} />
              <span className="w-[52px]" aria-hidden="true" />
            </div>
          </header>

          {/* Main — "my-auto" (not justify-center) centers the content
              vertically ONLY when it fits: unlike `justify-content:
              center`, a flex item's auto margins collapse to 0 instead of
              overflowing symmetrically above the scroll container's top
              edge, so short-viewport/mobile scrolling still starts at the
              real top of the content instead of clipping into it. */}
          <main className="flex-1 overflow-y-auto flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 w-full" style={{ scrollbarWidth: 'none' }}>
            <div className="w-full flex flex-col gap-7 my-auto" style={{ maxWidth: 1100 }}>

              {/* Intro */}
              <div className="flex flex-col items-center text-center gap-3">
                <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Get Started</span>
                <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
                  What are you looking to do?
                </h1>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[540px]" style={{ fontFamily: FONT_BODY }}>
                  Tell Hozie what you&apos;re trying to accomplish. We&apos;ll personalize Houzeify around your needs.
                </p>
              </div>

              {/* Hozie intro */}
              <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5" style={{ maxWidth: 640, margin: '0 auto', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div className="shrink-0"><HIcon size={32} /></div>
                <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                  <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>Hi! I&apos;m Hozie.</span>{' '}
                  I&apos;ll help you find the right tools, professionals and next steps for your construction needs.
                </p>
              </div>

              {/* Choices */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] tracking-[0.10em] uppercase text-[#9A949D] font-semibold" style={{ fontFamily: FONT_MONO }}>
                  For Your Home
                </span>
                <div role="group" aria-label="For your home" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CARDS.map(card => (
                    <ChooserCardButton key={card.intent} card={card} onSelect={() => selectIntent(card.intent)} />
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="shrink-0 flex justify-center items-center gap-2.5 pb-5">
            {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
              <span key={item} className="flex items-center gap-2.5">
                <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
                {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
              </span>
            ))}
          </footer>
        </div>
      </div>
    </div>
  )
}
