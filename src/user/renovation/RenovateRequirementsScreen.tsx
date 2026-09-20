// ─── Renovate → Requirements ──────────────────────────────────────────────
// Screen 04 of the Renovate journey — "What would you like to change?".
// Same MultiOptionCard pattern as ConstructionIntentScreen's own
// improvement-type picker, plus a free-text goal textarea. "Ask AI for
// suggestions" hands off to the real, existing AIAdvisorScreen (via
// projectData.ai_query, the same key App.tsx already threads into it) —
// never a second AI system.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const TOTAL_STEPS = 9

const CheckIcon = ({ size = 9 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IcoSparkle = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2l1.3 4.4L15.7 7.7l-4.4 1.3L10 13.4l-1.3-4.4L4.3 7.7l4.4-1.3L10 2Z" />
  </svg>
)

export type RequirementTag =
  | 'layout' | 'cabinets' | 'flooring' | 'painting' | 'electrical' | 'plumbing' | 'lighting' | 'storage' | 'fixtures' | 'appliances' | 'other'

const REQUIREMENT_OPTIONS: { id: RequirementTag; title: string; description: string }[] = [
  { id: 'layout', title: 'Change layout', description: 'Rework the space plan or move fixtures.' },
  { id: 'cabinets', title: 'New cabinets', description: 'Replace or add storage cabinetry.' },
  { id: 'flooring', title: 'New flooring', description: 'Replace tiles, marble, wood or vinyl.' },
  { id: 'painting', title: 'Painting', description: 'Fresh paint for walls or ceilings.' },
  { id: 'electrical', title: 'Electrical work', description: 'Wiring, switches or new points.' },
  { id: 'plumbing', title: 'Plumbing', description: 'Pipe, fitting or fixture work.' },
  { id: 'lighting', title: 'Lighting', description: 'New fixtures or better lighting design.' },
  { id: 'storage', title: 'Storage', description: 'More or better-organized storage.' },
  { id: 'fixtures', title: 'Fixtures', description: 'Taps, handles, hardware and fittings.' },
  { id: 'appliances', title: 'Appliances', description: 'New or upgraded appliances.' },
  { id: 'other', title: 'Other', description: "Anything else you'd like to change." },
]

export const REQUIREMENT_LABELS: Record<RequirementTag, string> = {
  layout: 'Change layout', cabinets: 'New cabinets', flooring: 'New flooring', painting: 'Painting',
  electrical: 'Electrical work', plumbing: 'Plumbing', lighting: 'Lighting', storage: 'Storage',
  fixtures: 'Fixtures', appliances: 'Appliances', other: 'Other',
}

function MultiOptionCard({ title, description, selected, onToggle }: { title: string; description: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={[
        'relative text-left flex flex-col gap-1 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer h-full',
        selected ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:border-[#722ED1]',
      ].join(' ')}
    >
      <span className={['text-[13.5px] font-semibold leading-tight', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>{title}</span>
      <span className="text-[12px] text-[#68636D] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>{description}</span>
      {selected && (
        <span className="absolute top-3 right-3 w-[16px] h-[16px] rounded-[5px] bg-[#722ED1] flex items-center justify-center" aria-hidden="true">
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
      <button onClick={onBack} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function RenovateRequirementsScreen({
  onNavigate,
  initialGoal,
  initialTags,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  initialGoal?: string
  initialTags?: string
}) {
  const [goal, setGoal] = useState(initialGoal ?? '')
  const [tags, setTags] = useState<RequirementTag[]>((initialTags?.split(',').filter(Boolean) as RequirementTag[]) ?? [])

  function toggleTag(tag: RequirementTag) {
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
  }

  const canContinue = goal.trim().length > 0 || tags.length > 0

  function handleContinue() {
    if (!canContinue) return
    onNavigate('renovate-budget-timeline', {
      renovation_goal: goal.trim(),
      renovation_requirement_tags: tags.join(','),
    })
  }

  function askAI() {
    const tagText = tags.length ? ` I'm also interested in: ${tags.map(t => REQUIREMENT_LABELS[t]).join(', ')}.` : ''
    onNavigate('ai-advisor', {
      ai_query: `I'm planning a renovation. ${goal.trim() || 'Can you suggest what I should consider?'}${tagText}`,
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-space-details')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-space-details')} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <div className="hidden md:block h-[2px] bg-[#F4F0EC] w-full shrink-0">
            <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: `${(3 / TOTAL_STEPS) * 100}%` }} />
          </div>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[900px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 3 of {TOTAL_STEPS}</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>What would you like to change?</h2>
              </div>

              <div className="flex flex-col gap-3 max-w-[720px]">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Tell us what you want to achieve</span>
                <textarea
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="I want a modern modular kitchen with more storage, a new countertop, better lighting, and easy-to-clean flooring."
                  rows={4}
                  className="rounded-[12px] border border-[#E3DDD7] p-4 text-[14px] text-[#242326] outline-none focus:border-[#722ED1] transition-colors resize-none"
                  style={{ fontFamily: FONT_BODY }}
                />
                <button
                  onClick={askAI}
                  className="self-start flex items-center gap-1.5 h-9 px-4 rounded-full border border-[#722ED1] text-[#722ED1] text-[12.5px] font-semibold cursor-pointer hover:bg-[#F3EAFF] transition-all bg-white"
                  style={{ fontFamily: FONT_BODY }}
                >
                  <IcoSparkle /> Ask AI for suggestions
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Or pick what applies</span>
                <div role="group" aria-label="What would you like to change" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {REQUIREMENT_OPTIONS.map(opt => (
                    <MultiOptionCard key={opt.id} title={opt.title} description={opt.description} selected={tags.includes(opt.id)} onToggle={() => toggleTag(opt.id)} />
                  ))}
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
