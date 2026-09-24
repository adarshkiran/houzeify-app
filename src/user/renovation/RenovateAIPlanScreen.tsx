// ─── Renovate → AI Renovation Plan ───────────────────────────────────────
// Screen 08 of the Renovate journey — "Your renovation plan is ready".
// Reuses the real shared HozieInsightCard/MetricCard components (the same
// ones every Estimate/Material/Labour/BOQ screen already uses) rather than
// a new AI-output visual — the "plan" itself is a deterministic template
// keyed off the areas/requirements already collected, same honest
// "simulated, not a live model" convention as every other Estimate screen
// in this app (FinalEstimateScreen's own versionOne/versionTwo are just as
// deterministic).

import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import HozieInsightCard from '@/shared/components/HozieInsightCard'
import MetricCard from '@/shared/components/MetricCard'
import { RENOVATION_AREA_LABELS, type RenovationArea } from './RenovateSelectAreaScreen'
import { type RequirementTag } from './RenovateRequirementsScreen'
import { RENOVATION_FINISH_LABELS, type RenovationFinish } from '@/data/renovationEstimate'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const IcoCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="3" width="13" height="12" rx="1.5" /><path d="M2.5 7h13M6 1.5v3M12 1.5v3" /></svg>
)
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#722ED1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.3L5.3 10L11.5 3.5" /></svg>
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

// Recommended-work items are built from the requirement tags actually
// picked in Screen 04 — never a fixed list unrelated to what the homeowner
// asked for. Falls back to the spec's own base example list when no tags
// were picked, so the screen never renders empty.
const WORK_FROM_TAG: Partial<Record<RequirementTag, string[]>> = {
  layout: ['Layout redesign'],
  cabinets: ['Remove existing cabinets', 'New cabinets'],
  flooring: ['Flooring replacement'],
  painting: ['Painting & finishing'],
  electrical: ['Electrical modifications'],
  plumbing: ['Plumbing modifications'],
  lighting: ['Lighting upgrade'],
  storage: ['New storage units'],
  fixtures: ['Fixture & hardware replacement'],
  appliances: ['Appliance installation'],
}

const DEFAULT_WORK = ['Remove existing cabinets', 'Electrical modifications', 'Plumbing modifications', 'New cabinets', 'Countertop', 'Flooring', 'Lighting', 'Finishing']

function timelineFor(areas: RenovationArea[], finish: RenovationFinish | undefined): string {
  const isFullHome = areas.includes('full-home')
  const base = isFullHome ? 10 : areas.length > 1 ? 6 : 4
  const finishBump = finish === 'premium' ? 2 : finish === 'luxury' ? 4 : 0
  return `${base + finishBump}–${base + finishBump + 2} weeks`
}

export default function RenovateAIPlanScreen({
  onNavigate,
  renovationAreas,
  goal,
  requirementTags,
  finish,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  renovationAreas?: string
  goal?: string
  requirementTags?: string
  finish?: string
}) {
  const areas = (renovationAreas?.split(',').filter(Boolean) as RenovationArea[]) ?? []
  const tags = (requirementTags?.split(',').filter(Boolean) as RequirementTag[]) ?? []
  const finishValue = finish as RenovationFinish | undefined
  const areaLabel = areas.length > 0 ? areas.map(a => RENOVATION_AREA_LABELS[a]).join(' & ') : 'your space'
  const finishLabel = finishValue ? RENOVATION_FINISH_LABELS[finishValue].toLowerCase() : 'standard'

  const recommendedWork = tags.length > 0
    ? Array.from(new Set(tags.flatMap(t => WORK_FROM_TAG[t] ?? [])))
    : DEFAULT_WORK
  const timeline = timelineFor(areas, finishValue)

  const approach = goal?.trim()
    ? goal.trim()
    : `A ${finishLabel}-finish renovation for ${areaLabel}, focused on the changes you selected.`

  function handleContinue() {
    onNavigate('renovate-estimate')
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-review')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-review')} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[720px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>AI Renovation Plan</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Your renovation plan is ready</h2>
              </div>

              <HozieInsightCard message={approach} />

              <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3" style={{ border: '1px solid #E3DDD7' }}>
                <h2 className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Recommended Work</h2>
                <ul className="flex flex-col gap-2 m-0 p-0" style={{ listStyle: 'none' }}>
                  {recommendedWork.map(item => (
                    <li key={item} className="flex items-center gap-2 text-[13.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                      <IcoCheck /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <MetricCard eyebrow="Estimated Timeline" value={timeline} icon={<IcoCalendar />} />

              <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3" style={{ border: '1px solid #E3DDD7' }}>
                <h2 className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Key Considerations</h2>
                <ul className="flex flex-col gap-1.5 m-0 pl-4">
                  <li className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Final costs may vary based on actual site conditions.</li>
                  <li className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Structural changes, if any, may require society/local approvals.</li>
                  <li className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Material availability can affect the overall timeline.</li>
                </ul>
              </div>

              <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3" style={{ border: '1px solid #E3DDD7' }}>
                <h2 className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Potential Additional Costs</h2>
                <ul className="flex flex-col gap-1.5 m-0 pl-4">
                  <li className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Structural or plumbing surprises found once work begins.</li>
                  <li className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Upgrading to premium fixtures or materials.</li>
                  <li className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Permit or approval fees, where applicable.</li>
                </ul>
              </div>

              <button
                onClick={handleContinue}
                className="h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[240px] bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]"
                style={{ fontFamily: FONT_BODY }}
              >
                View Estimated Cost →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
