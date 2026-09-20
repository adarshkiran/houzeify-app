// ─── Renovate → Select area(s) ───────────────────────────────────────────
// Screen 02 of the Renovate journey (Flow 03) — "What would you like to
// renovate?". Reached from BuildOrImproveScreen's "Improve My Home" card
// (repointed there specifically for this flow) instead of the generic
// homeowner-intent chain. Same visual language as every other multi-step
// homeowner screen in this app: Sidebar + header + thin progress strip +
// centered content column (CreateProjectScreen's own shell), and the same
// MultiOptionCard tile picker ConstructionIntentScreen's own "What areas do
// you want to improve" section already uses — no new visual pattern.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const TOTAL_STEPS = 9

// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 9 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IcoKitchen = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.5a6.5 6.5 0 0113 0" /><path d="M2.5 8.5h15M4.5 8.5V16h11V8.5" /><line x1="10" y1="3" x2="10" y2="1.5" />
  </svg>
)
const IcoBathroom = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h14v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z" /><path d="M4.5 10V4.8A1.8 1.8 0 016.3 3v0c.7 0 1.3.4 1.6 1" />
  </svg>
)
const IcoBedroom = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 16v-5.5a2 2 0 012-2h11a2 2 0 012 2V16" /><path d="M2.5 13.5h15M4 8.5V5.5M4 5.5h4v3" />
  </svg>
)
const IcoLivingRoom = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="4" width="15" height="10" rx="1.2" /><path d="M7 17h6M10 14v3" />
  </svg>
)
const IcoFullHome = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5L10 3l7.5 6.5" /><path d="M4.5 8v8a1 1 0 001 1h9a1 1 0 001-1V8" /><path d="M8 17v-5h4v5" />
  </svg>
)
const IcoBalcony = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h14" /><path d="M4.5 6v10M15.5 6v10" /><path d="M4.5 10h11" />
  </svg>
)
const IcoExterior = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 9.5L10 3l7.5 6.5" /><path d="M4.5 8v8a1 1 0 001 1h9a1 1 0 001-1V8" /><path d="M13 6.5V4h2.5v4.7" />
  </svg>
)
const IcoOther = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="4.5" cy="10" r="1.1" fill="currentColor" stroke="none" /><circle cx="10" cy="10" r="1.1" fill="currentColor" stroke="none" /><circle cx="15.5" cy="10" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

export type RenovationArea = 'kitchen' | 'bathroom' | 'bedroom' | 'living-room' | 'full-home' | 'balcony' | 'exterior' | 'other'

export const RENOVATION_AREA_OPTIONS: { id: RenovationArea; label: string; icon: React.ReactNode }[] = [
  { id: 'kitchen', label: 'Kitchen', icon: <IcoKitchen /> },
  { id: 'bathroom', label: 'Bathroom', icon: <IcoBathroom /> },
  { id: 'bedroom', label: 'Bedroom', icon: <IcoBedroom /> },
  { id: 'living-room', label: 'Living Room', icon: <IcoLivingRoom /> },
  { id: 'full-home', label: 'Full Home', icon: <IcoFullHome /> },
  { id: 'balcony', label: 'Balcony', icon: <IcoBalcony /> },
  { id: 'exterior', label: 'Exterior', icon: <IcoExterior /> },
  { id: 'other', label: 'Other', icon: <IcoOther /> },
]

export const RENOVATION_AREA_LABELS: Record<RenovationArea, string> = {
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  'living-room': 'Living Room',
  'full-home': 'Full Home',
  balcony: 'Balcony',
  exterior: 'Exterior',
  other: 'Other',
}

// ─── Tile picker — same multi-select checkbox-card pattern as
// ConstructionIntentScreen's own "What areas do you want to improve"
// section. Picking "Full Home" clears every other selection (they'd be
// redundant) and vice versa. ────────────────────────────────────────────

function AreaTile({ area, selected, onToggle }: { area: typeof RENOVATION_AREA_OPTIONS[number]; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={[
        'relative flex flex-col items-center gap-2 text-center rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer',
        selected ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:border-[#722ED1]',
      ].join(' ')}
    >
      <div className={['w-11 h-11 rounded-[10px] flex items-center justify-center', selected ? 'bg-white text-[#722ED1]' : 'bg-[#F9F5FF] text-[#722ED1]'].join(' ')}>
        {area.icon}
      </div>
      <span className={['text-[13px] font-semibold leading-tight', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
        {area.label}
      </span>
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-[16px] h-[16px] rounded-[5px] bg-[#722ED1] flex items-center justify-center" aria-hidden="true">
          <CheckIcon />
        </span>
      )}
    </button>
  )
}

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Renovate</span>
      </div>
      <button onClick={onBack} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Cancel</button>
    </div>
  )
}

export default function RenovateSelectAreaScreen({
  onNavigate,
  initialAreas,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  initialAreas?: string
}) {
  const [areas, setAreas] = useState<RenovationArea[]>(
    (initialAreas?.split(',').filter(Boolean) as RenovationArea[]) ?? []
  )

  function toggle(area: RenovationArea) {
    setAreas(prev => {
      if (area === 'full-home') return prev.includes('full-home') ? [] : ['full-home']
      const withoutFullHome = prev.filter(a => a !== 'full-home')
      return withoutFullHome.includes(area) ? withoutFullHome.filter(a => a !== area) : [...withoutFullHome, area]
    })
  }

  const canContinue = areas.length > 0

  function handleContinue() {
    if (!canContinue) return
    onNavigate('renovate-space-details', { renovation_areas: areas.join(',') })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('build-or-improve')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('build-or-improve')} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Cancel
            </button>
          </header>

          <div className="hidden md:block h-[2px] bg-[#F4F0EC] w-full shrink-0">
            <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: `${(1 / TOTAL_STEPS) * 100}%` }} />
          </div>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[900px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 1 of {TOTAL_STEPS}</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>What would you like to renovate?</h2>
                <p className="text-[13.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Select one or more areas — you can pick "Full Home" if you're renovating everything.</p>
              </div>

              <div role="group" aria-label="Areas to renovate" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {RENOVATION_AREA_OPTIONS.map(area => (
                  <AreaTile key={area.id} area={area} selected={areas.includes(area.id)} onToggle={() => toggle(area.id)} />
                ))}
              </div>

              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={[
                  'h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[240px]',
                  canContinue ? 'bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]' : 'bg-[#F4F0EC] text-[#9A949D] cursor-not-allowed',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                Continue →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
