// ─── Renovate → Budget & Timeline ────────────────────────────────────────
// Screen 05 of the Renovate journey — "Set your renovation budget". Same
// Chip single-select pattern as ConstructionIntentScreen/
// CreateServiceRequestScreen's own budget picker, sized for whole-home
// renovation (serviceRequest.ts's own SERVICE_BUDGET_OPTIONS top out at
// "₹3 lakh+", too small here — this screen's own real range list instead,
// see renovationEstimate.ts).

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import {
  RENOVATION_BUDGET_OPTIONS, RENOVATION_BUDGET_LABELS, type RenovationBudgetRange,
  RENOVATION_TIMELINE_OPTIONS, RENOVATION_TIMELINE_LABELS, type RenovationTimeline,
  RENOVATION_FINISH_OPTIONS, RENOVATION_FINISH_LABELS, type RenovationFinish,
} from '@/data/renovationEstimate'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const TOTAL_STEPS = 9

const CheckIcon = ({ size = 8 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function FormLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{children}</span>
}

function Chip({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex items-center gap-1.5 h-10 px-4 rounded-full text-[13px] font-semibold cursor-pointer transition-all border"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? '#F3EAFF' : '#FFFFFF',
        borderColor: selected ? '#722ED1' : '#CAC7C6',
        color: selected ? '#722ED1' : '#1E1E1E',
      }}
    >
      {selected && <span className="w-[14px] h-[14px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon /></span>}
      {label}
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
      <button onClick={onBack} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function RenovateBudgetTimelineScreen({
  onNavigate,
  initialBudget,
  initialCustomBudget,
  initialTimeline,
  initialFinish,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  initialBudget?: string
  initialCustomBudget?: string
  initialTimeline?: string
  initialFinish?: string
}) {
  const [budget, setBudget] = useState<RenovationBudgetRange | null>((initialBudget as RenovationBudgetRange) ?? null)
  const [customBudget, setCustomBudget] = useState(initialCustomBudget ?? '')
  const [timeline, setTimeline] = useState<RenovationTimeline | null>((initialTimeline as RenovationTimeline) ?? null)
  const [finish, setFinish] = useState<RenovationFinish | null>((initialFinish as RenovationFinish) ?? null)

  const canContinue = Boolean(budget) && (budget !== 'custom' || customBudget.trim().length > 0) && Boolean(timeline) && Boolean(finish)

  function handleContinue() {
    if (!canContinue) return
    onNavigate('renovate-upload', {
      renovation_budget_range: budget!,
      renovation_budget_custom: budget === 'custom' ? customBudget.trim() : '',
      renovation_timeline: timeline!,
      renovation_finish: finish!,
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-requirements')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-requirements')} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <div className="hidden md:block h-[2px] bg-[#F4F0EC] w-full shrink-0">
            <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: `${(4 / TOTAL_STEPS) * 100}%` }} />
          </div>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[900px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 4 of {TOTAL_STEPS}</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Set your renovation budget</h2>
              </div>

              <div className="flex flex-col gap-6 max-w-[640px]">
                <div className="flex flex-col gap-3">
                  <FormLabel>Budget</FormLabel>
                  <div role="radiogroup" aria-label="Budget" className="flex flex-wrap gap-2">
                    {RENOVATION_BUDGET_OPTIONS.map(opt => (
                      <Chip key={opt} label={RENOVATION_BUDGET_LABELS[opt]} selected={budget === opt} onSelect={() => setBudget(opt)} />
                    ))}
                  </div>
                  {budget === 'custom' && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[14px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customBudget}
                        onChange={e => setCustomBudget(e.target.value)}
                        placeholder="e.g. 450000"
                        className="h-11 px-4 rounded-[10px] border border-[#E3DDD7] text-[14px] text-[#242326] outline-none focus:border-[#722ED1] transition-colors w-[200px]"
                        style={{ fontFamily: FONT_BODY }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <FormLabel>When would you like to renovate?</FormLabel>
                  <div role="radiogroup" aria-label="Timeline" className="flex flex-wrap gap-2">
                    {RENOVATION_TIMELINE_OPTIONS.map(opt => (
                      <Chip key={opt} label={RENOVATION_TIMELINE_LABELS[opt]} selected={timeline === opt} onSelect={() => setTimeline(opt)} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <FormLabel>Preferred finish</FormLabel>
                  <div role="radiogroup" aria-label="Preferred finish" className="flex flex-wrap gap-2">
                    {RENOVATION_FINISH_OPTIONS.map(opt => (
                      <Chip key={opt} label={RENOVATION_FINISH_LABELS[opt]} selected={finish === opt} onSelect={() => setFinish(opt)} />
                    ))}
                  </div>
                </div>
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
