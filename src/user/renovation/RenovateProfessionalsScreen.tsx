// ─── Renovate → Recommended Professionals ────────────────────────────────
// Screen 11B of the Renovate journey. Purpose changed from "Contractor
// Bids" to "Recommended Professionals" per the new flow — same
// rating/experience card pattern as ServiceProvidersScreen's own
// ProviderCard, plus a real "Starting from ₹X" price line (styled like
// HomeServicesScreen's own tier `startingPrice`) so picking one never
// means waiting for a bid — every professional here already has a listed
// starting price (renovationProfessionals.ts, "UI demonstration data
// only" convention). No bidding language anywhere on this screen.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { RENOVATION_PROFESSIONALS } from '@/data/renovationProfessionals'
import { formatINR } from '@/data/materials'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const IcoStar = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor"><path d="M6 0.8l1.5 3.3 3.6.4-2.7 2.5.7 3.6L6 8.8 2.9 10.6l.7-3.6L.9 4.5l3.6-.4L6 .8Z" /></svg>
)

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Renovate</span>
      </div>
      <button onClick={onBack} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function RenovateProfessionalsScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function select(id: string) {
    onNavigate('renovate-selection-review', { renovation_professional_id: id, renovation_package_id: '' })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-proceed')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-proceed')} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[820px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Choose a Professional</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Recommended Professionals</h2>
              </div>

              <div className="flex flex-col gap-4">
                {RENOVATION_PROFESSIONALS.map(pro => {
                  const expanded = expandedId === pro.id
                  return (
                    <div key={pro.id} className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                      <div className="flex items-start gap-3">
                        <span className="w-11 h-11 rounded-[12px] bg-[#F3EAFF] flex items-center justify-center text-[#722ED1] font-semibold text-[15px] shrink-0" style={{ fontFamily: FONT_HEAD }}>
                          {pro.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-[14.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{pro.name}</span>
                          <div className="flex items-center gap-3 flex-wrap text-[12.5px]" style={{ fontFamily: FONT_BODY }}>
                            <span className="flex items-center gap-1 text-[#242326] font-medium"><IcoStar /> {pro.rating.toFixed(1)} <span className="text-[#9A949D] font-normal">({pro.reviewCount} reviews)</span></span>
                            <span className="text-[#CAC7C6]">·</span>
                            <span className="text-[#242326]">{pro.experienceYears} years experience</span>
                            <span className="text-[#CAC7C6]">·</span>
                            <span className="text-[#242326]">{pro.projectsCompleted.toLocaleString('en-IN')}+ projects</span>
                          </div>
                        </div>
                        <span className="text-right shrink-0">
                          <span className="block text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Starting from</span>
                          <span className="block text-[15px] font-semibold" style={{ fontFamily: FONT_HEAD, color: '#722ED1' }}>{formatINR(pro.startingPrice)}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {pro.specializations.map(s => (
                          <span key={s} className="h-6 px-2.5 rounded-full bg-[#F4F0EC] border border-[#E3DDD7] text-[11.5px] text-[#242326] flex items-center" style={{ fontFamily: FONT_BODY }}>{s}</span>
                        ))}
                      </div>

                      {expanded && (
                        <p className="text-[12.5px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>{pro.about}</p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button onClick={() => setExpandedId(expanded ? null : pro.id)} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] bg-white text-[#242326] text-[13px] font-medium cursor-pointer hover:bg-[#F4F0EC] transition-all flex-1" style={{ fontFamily: FONT_BODY }}>
                          {expanded ? 'Hide Profile' : 'View Profile'}
                        </button>
                        <button onClick={() => select(pro.id)} className="h-10 px-4 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-semibold cursor-pointer hover:brightness-90 transition-all border-0 flex-1" style={{ fontFamily: FONT_BODY }}>
                          Select
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
