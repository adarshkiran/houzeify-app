import { useState, useEffect } from 'react'
import HIcon from '@/shared/components/HIcon'
import { getHouseRequirementsForProject, estimateForRequirements, BUILDING_TYPE_LABELS, FINISH_LEVEL_LABELS } from '@/data/houseRequirements'
import { createEstimateVersion, getLatestEstimateVersion } from '@/data/estimateVersions'

// ─── Processing state machine ──────────────────────────────────────────────────

interface ProcessingPhase {
  stateLabel: string
  statusSub: string
  progress: number
  doneCount: number   // how many steps are ✓
}

const phases: ProcessingPhase[] = [
  { stateLabel: 'PREPARING PROJECT DATA',               statusSub: 'Initialising estimate generation',                        progress: 14,  doneCount: 0 },
  { stateLabel: 'CALCULATING CONSTRUCTION QUANTITIES',  statusSub: 'Analysing structural parameters and floor layout',        progress: 38,  doneCount: 1 },
  { stateLabel: 'ESTIMATING MATERIALS + LABOUR',        statusSub: 'Analysing approximately 120+ construction parameters',    progress: 72,  doneCount: 2 },
  { stateLabel: 'PREPARING YOUR ESTIMATE',              statusSub: 'Compiling cost breakdown and contingency values',         progress: 92,  doneCount: 3 },
  { stateLabel: 'ESTIMATE READY',                       statusSub: 'Your construction estimate has been generated',           progress: 100, doneCount: 5 },
]

const STEP_LABELS = [
  'Understanding project requirements',
  'Calculating construction quantities',
  'Estimating materials and labour',
  'Preparing cost breakdown',
  'Generating BOQ',
]

// Cumulative delay in ms to move to each phase (0-indexed)
const PHASE_TIMINGS = [1800, 3800, 6400, 8600]   // transitions: 0→1, 1→2, 2→3, 3→4

// ─── Step Icon ────────────────────────────────────────────────────────────────

function StepIcon({ status }: { status: 'done' | 'active' | 'pending' }) {
  if (status === 'done') {
    return (
      <div className="w-5 h-5 rounded-full bg-[#722ED1] flex items-center justify-center shrink-0">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5.2l2.2 2.2 3.8-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    )
  }
  if (status === 'active') {
    return (
      <div
        className="w-5 h-5 rounded-full bg-[#722ED1] flex items-center justify-center shrink-0"
        style={{ animation: 'estimatePulse 1.4s ease-in-out infinite' }}
      >
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    )
  }
  return (
    <div className="w-5 h-5 rounded-full border-2 border-[#E3DDD7] shrink-0" />
  )
}

// ─── Processing Icon ──────────────────────────────────────────────────────────

function ProcessingIcon({ complete }: { complete: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 192, height: 192 }}>
      {/* Rings — 3 expanding outward, staggered */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            inset: 0,
            border: `1.5px solid rgba(243,234,255,${0.22 - i * 0.05})`,
            animation: complete
              ? undefined
              : `estimateRingExpand 3s ease-out ${i * 1}s infinite`,
            opacity: complete ? 0 : undefined,
            transition: 'opacity 0.6s ease',
          }}
        />
      ))}

      {/* Soft lavender glow disc */}
      <div
        className="absolute rounded-full bg-[#F3EAFF]"
        style={{ width: 120, height: 120, filter: 'blur(16px)', opacity: 0.85 }}
      />

      {/* Icon tile */}
      <div
        className="relative flex items-center justify-center rounded-[24px] bg-[#F3EAFF] z-10"
        style={{
          width: 88,
          height: 88,
          boxShadow: complete
            ? '0 0 0 4px #722ED1, 0 0 40px rgba(243,234,255,0.10)'
            : '0 0 32px rgba(243,234,255,0.10)',
          animation: complete ? undefined : 'estimatePulse 2.8s ease-in-out infinite',
          transition: 'box-shadow 0.6s ease',
        }}
      >
        <HIcon size={52} />
      </div>

      {/* Complete checkmark overlay */}
      {complete && (
        <div
          className="absolute bottom-8 right-8 w-7 h-7 rounded-full bg-[#722ED1] flex items-center justify-center z-20"
          style={{ animation: 'estimateButtonPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2.5 6.5l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}


// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col gap-2">
      <div className="h-1.5 w-full bg-[#F4F0EC] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#722ED1] rounded-full"
          style={{ width: `${value}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EstimateLoadingScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  area = '2,400 SQ FT',
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  area?: string
  /** Real project id — when a real HouseRequirements record exists for it,
   *  this screen's animated delay does real work: computing v1 of this
   *  project's estimate via the real calculateRevisedEstimate() (through
   *  houseRequirements.ts's estimateForRequirements()) and persisting it
   *  via estimateVersions.ts's createEstimateVersion(), so every
   *  downstream Estimate screen reads a real, requirements-driven number
   *  instead of the hardcoded demo figures. Never recomputed on re-mount
   *  if a version already exists — Estimate Revision (042) is the only
   *  screen that creates later versions. */
  projectId?: string
}) {
  const [phaseIdx, setPhaseIdx] = useState(0)

  useEffect(() => {
    if (projectId && !getLatestEstimateVersion(projectId)) {
      const req = getHouseRequirementsForProject(projectId)
      if (req) {
        const { assumptions, result, breakdown } = estimateForRequirements(req)
        createEstimateVersion({
          projectId,
          minCost: result.minTotal,
          maxCost: result.maxTotal,
          averageCost: result.avgTotal,
          costPerSqFtMin: Math.round(result.costPerSqFt * 0.93),
          costPerSqFtMax: Math.round(result.costPerSqFt * 1.07),
          confidence: result.confidence,
          assumptions: {
            builtUpArea: assumptions.builtUpArea,
            floors: assumptions.floors,
            constructionLevel: FINISH_LEVEL_LABELS[req.finishLevel],
            materialQuality: assumptions.materialQuality,
            finishingLevel: FINISH_LEVEL_LABELS[req.finishLevel],
            location,
            projectType: BUILDING_TYPE_LABELS[req.buildingType],
          },
          costBreakdown: breakdown,
          createdFromVersionId: null,
        })
      }
    }
  }, [projectId, location])

  useEffect(() => {
    const timers = PHASE_TIMINGS.map((delay, i) =>
      setTimeout(() => setPhaseIdx(i + 1), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const phase = phases[phaseIdx]
  const complete = phaseIdx === phases.length - 1
return (
    <div
      className="min-h-full flex flex-col items-center justify-between relative"
      style={{ backgroundColor: '#FFFFFF' }}
    >

      {/* Spacer */}
      <div />

      {/* Main centered column */}
      <div
        className="relative z-10 flex flex-col items-center gap-8 px-5 sm:px-8 w-full py-12"
        style={{ maxWidth: 600 }}
      >

        {/* Processing icon */}
        <div style={{ animation: 'estimateReveal 0.5s ease-out 0.1s both' }}>
          <ProcessingIcon complete={complete} />
        </div>

        {/* Eyebrow */}
        <div
          className="flex flex-col items-center gap-1"
          style={{ animation: 'estimateReveal 0.5s ease-out 0.18s both' }}
        >
          <span
            className="text-[12px] tracking-[0.10em] text-[#722ED1]"
            style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
          >
            HOZIE · AI CONSTRUCTION ADVISOR
          </span>
        </div>

        {/* Headline + description */}
        <div
          className="flex flex-col items-center gap-3 text-center"
          style={{ animation: 'estimateReveal 0.5s ease-out 0.26s both' }}
        >
          <h1
            className="text-[32px] sm:text-[44px] font-semibold text-[#242326] m-0 leading-[1.08]"
            style={{ fontFamily: '"Geist Variable", sans-serif' }}
          >
            {complete ? 'Estimate ready.' : 'Building your estimate.'}
          </h1>
          <p
            className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0"
            style={{ fontFamily: '"Inter Variable", sans-serif', maxWidth: 480 }}
          >
            {complete
              ? 'Hozie has finished analysing your project. Your initial construction estimate is ready to view.'
              : 'Hozie is analysing your project and preparing an initial construction estimate.'}
          </p>
        </div>

        {/* Project context card */}
        <div
          className="w-full bg-white rounded-[16px] border border-[#E3DDD7] px-5 py-4 flex items-center justify-between gap-4"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)', animation: 'estimateReveal 0.5s ease-out 0.32s both' }}
        >
          <div className="flex flex-col gap-1">
            <span
              className="text-[13px] font-semibold text-[#242326]"
              style={{ fontFamily: '"Geist Variable", sans-serif' }}
            >
              {projectName}
            </span>
            <span
              className="text-[11px] text-[#68636D]"
              style={{ fontFamily: '"Inter Variable", sans-serif' }}
            >
              {location} · {area}
            </span>
          </div>
          <span
            className={[
              'shrink-0 text-[12px] tracking-[0.06em] px-2.5 py-1 rounded-full',
              complete ? 'text-[#722ED1] bg-[#F3EAFF]' : 'text-[#9A949D] bg-[#F4F0EC]',
            ].join(' ')}
            style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', transition: 'all 0.5s ease' }}
          >
            {complete ? 'ESTIMATE READY' : 'GENERATING ESTIMATE'}
          </span>
        </div>

        {/* Processing steps */}
        <div
          className="w-full flex flex-col gap-3"
          style={{ animation: 'estimateReveal 0.5s ease-out 0.38s both' }}
        >
          {STEP_LABELS.map((label, i) => {
            const status: 'done' | 'active' | 'pending' =
              i < phase.doneCount ? 'done'
              : i === phase.doneCount && !complete ? 'active'
              : 'pending'
            return (
              <div key={label} className="flex items-center gap-3">
                <StepIcon status={status} />
                <span
                  className="text-[13px] leading-none"
                  style={{
                    fontFamily: '"Inter Variable", sans-serif',
                    color: status === 'pending' ? '#A1A1A1' : '#1E1E1E',
                    transition: 'color 0.4s ease',
                  }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Current status */}
        <div
          className="flex flex-col items-center gap-1.5 text-center"
          style={{ animation: 'estimateReveal 0.4s ease-out 0.44s both' }}
        >
          <span
            className="text-[12px] tracking-[0.10em] text-[#722ED1]"
            style={{
              fontFamily: '"Sometype Mono:SemiBold", monospace',
              animation: complete ? undefined : 'hozieStatusPulse 2s ease-in-out infinite',
              transition: 'opacity 0.4s',
            }}
          >
            {phase.stateLabel}
          </span>
          <span
            className="text-[12px] text-[#9A949D]"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            {phase.statusSub}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full"
          style={{ animation: 'estimateReveal 0.4s ease-out 0.5s both' }}
        >
          <ProgressBar value={phase.progress} />
        </div>

        {/* View estimate button — appears only on complete */}
        {complete && (
          <button
            onClick={() => onNavigate('estimate-dashboard', { project_stage: 'estimate-ready' })}
            className="h-[52px] px-8 rounded-[12px] bg-[#722ED1] text-white text-[15px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.98] transition-all border-0"
            style={{
              fontFamily: '"Geist Variable", sans-serif',
              animation: 'estimateButtonPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
              minWidth: 220,
            }}
          >
            View estimate →
          </button>
        )}

        {/* Hozie message card */}
        <div
          className="w-full flex items-start gap-3 bg-white border border-[#E3DDD7] rounded-[12px] px-4 py-3.5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)', animation: 'estimateReveal 0.4s ease-out 0.55s both' }}
        >
          <div className="shrink-0 w-7 h-7 rounded-[8px] bg-[#F3EAFF] flex items-center justify-center">
            <HIcon size={18} />
          </div>
          <p
            className="text-[13px] text-[#242326] leading-[1.6] m-0"
            style={{ fontFamily: '"Inter Variable", sans-serif' }}
          >
            Your estimate will include materials, labour, finishing and contingency — covering all major cost categories.
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer
        className="relative z-10 flex justify-center items-center gap-2.5 pb-6"
        style={{ animation: 'estimateReveal 0.4s ease-out 0.6s both' }}
      >
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span
              className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]"
              style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
            >
              {item}
            </span>
            {i < arr.length - 1 && (
              <span className="text-[12px] text-[#CAC7C6]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>/</span>
            )}
          </span>
        ))}
      </footer>
    </div>
  )
}
