import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  analyzePlan,
  ANALYSIS_STEPS,
  type PlanAnalysisStatus,
  type PlanAnalysisFinding,
  type FindingStatus,
  type AnalysisController,
} from '@/data/planAnalysis'
import { isPreviewableImage, isPdf, isCad, formatFileSize } from '@/data/documentUpload'
import { boqOverview } from '@/data/boqOverview'
import Sidebar from '@/shared/components/Sidebar'

// ─── Sidebar & shell icons (kept local — matches existing screen convention) ──

const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9L9 3l7 6"/><path d="M4 8v8h3.5v-4h3v4H14V8"/>
  </svg>
)
const IcoAdvisor = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 1.5L10.6 5.4L14.5 7 10.6 8.6 9 12.5 7.4 8.6 3.5 7l3.9-1.6L9 1.5z"/>
    <path d="M14 12l.9 1.9 1.6.6-1.6.6-.9 1.9-.9-1.9-1.6-.6 1.6-.6.9-1.9z" strokeWidth="1.2"/>
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
    <line x1="6" y1="6.5" x2="12" y2="6.5"/><line x1="6" y1="9.5" x2="12" y2="9.5"/><line x1="6" y1="12.5" x2="10" y2="12.5"/>
  </svg>
)
const IcoBOQ = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3.5" cy="5" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="5" x2="15" y2="5"/>
    <circle cx="3.5" cy="9" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="9" x2="15" y2="9"/>
    <circle cx="3.5" cy="13" r="0.8" fill="currentColor" stroke="none"/>
    <line x1="6.5" y1="13" x2="15" y2="13"/>
  </svg>
)
const IcoPlan = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="14" height="14" rx="2"/>
    <line x1="2" y1="7.5" x2="16" y2="7.5"/>
    <line x1="7.5" y1="7.5" x2="7.5" y2="16"/>
  </svg>
)
const IcoCalc = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="12" height="14" rx="1.5"/>
    <rect x="5.5" y="4.5" width="7" height="2.5" rx="0.5"/>
    <circle cx="6" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="10" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="6" cy="13" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="13" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="13" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoReports = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="15.5" x2="15" y2="15.5"/>
    <line x1="4" y1="15.5" x2="4" y2="9"/>
    <line x1="7.5" y1="15.5" x2="7.5" y2="5"/>
    <line x1="11" y1="15.5" x2="11" y2="8"/>
    <line x1="14.5" y1="15.5" x2="14.5" y2="3"/>
  </svg>
)
const IcoHelp = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M6.5 6.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 3.5"/>
    <circle cx="9" cy="14" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoSettings = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="2.5"/>
    <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.06 1.06M12.84 12.84l1.06 1.06M4.1 13.9l1.06-1.06M12.84 5.16l1.06-1.06"/>
  </svg>
)
const IcoFile = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2.5h7l3 3V17a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-14a.5.5 0 01.5-.5z"/><path d="M12 2.5V6h3"/>
  </svg>
)
const IcoFileCad = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2.5h7l3 3V17a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-14a.5.5 0 01.5-.5z"/><path d="M12 2.5V6h3"/>
    <path d="M6.5 13.5l1.8-3.2 1.4 2 1.3-2.4 1.5 3.6" strokeWidth="1.1"/>
  </svg>
)
const IcoImage = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="3.5" width="15" height="13" rx="1.5"/><circle cx="7" cy="8" r="1.3"/><path d="M3 14.5l4-4 3 3 3.5-4.5L17.5 14"/>
  </svg>
)
const IcoClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l8 8M11 3L3 11"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoWarning = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L15 14H1L8 2z"/><line x1="8" y1="6.5" x2="8" y2="9.5"/><circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoRoomLayout = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/><line x1="10" y1="2.5" x2="10" y2="10.5"/><line x1="2.5" y1="10.5" x2="17.5" y2="10.5"/><line x1="10" y1="10.5" x2="10" y2="17.5"/>
  </svg>
)
const IcoRuler = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="6.5" width="15" height="7" rx="1.2" transform="rotate(-8 10 10)"/>
    <line x1="6" y1="7.5" x2="6.6" y2="9.3" strokeWidth="1.1"/><line x1="9" y1="7" x2="9.6" y2="8.8" strokeWidth="1.1"/><line x1="12" y1="6.6" x2="12.6" y2="8.4" strokeWidth="1.1"/>
  </svg>
)
const IcoAreaScan = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6V3.5H5M15 3.5h2.5V6M17.5 14v2.5H15M5 16.5H2.5V14"/>
    <rect x="6" y="6" width="8" height="8" rx="1"/>
  </svg>
)
const IcoScope = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="10" y1="16" x2="10" y2="19"/><line x1="1" y1="10" x2="4" y2="10"/><line x1="16" y1="10" x2="19" y2="10"/>
  </svg>
)
const IcoFloors = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="4.5" rx="1"/>
    <rect x="3" y="9" width="14" height="4.5" rx="1"/>
    <line x1="3" y1="16.5" x2="17" y2="16.5"/>
  </svg>
)
const IcoBOQChange = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2.5" width="14" height="15" rx="1.5"/>
    <line x1="6" y1="7" x2="14" y2="7"/><line x1="6" y1="10" x2="14" y2="10"/><line x1="6" y1="13" x2="11" y2="13"/>
  </svg>
)

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Reduced motion ──────────────────────────────────────────────────────────

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={[
        'w-full flex items-center border-0 cursor-pointer rounded-[12px] transition-all duration-150 outline-none',
        'md:justify-center md:w-[40px] md:h-[40px] md:mx-auto md:p-0',
        'lg:justify-start lg:w-full lg:h-auto lg:mx-0 lg:px-3 lg:py-[9px] lg:gap-3',
        active ? 'bg-[#F3EAFF] text-[#722ED1]' : 'bg-transparent text-[#68636D] hover:bg-[#F4F0EC] hover:text-[#242326]',
      ].join(' ')}
    >
      <span className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">{icon}</span>
      <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </button>
  )
}

// Sidebar (desktop left rail) lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never
// drifts or changes shape as you navigate between screens.



// ─── Shared bits ────────────────────────────────────────────────────────────

function SectionCard({ eyebrow, tag, children, className }: { eyebrow: string; tag?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={['bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>{eyebrow}</span>
        {tag}
      </div>
      {children}
    </div>
  )
}

const FINDING_STATUS_STYLES: Record<FindingStatus, { bg: string; color: string; label: string }> = {
  confirmed: { bg: '#DCFCE7', color: '#16A34A', label: 'Detected' },
  likely: { bg: '#FEF3C7', color: '#D97706', label: 'Likely' },
  'needs-review': { bg: '#FEE2E2', color: '#DC2626', label: 'Needs review' },
}

function FindingStatusBadge({ status }: { status: FindingStatus }) {
  const s = FINDING_STATUS_STYLES[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.04em] shrink-0 whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color, fontFamily: FONT_MONO }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} aria-hidden="true" />
      {s.label}
    </span>
  )
}

// ─── Step icon ────────────────────────────────────────────────────────────────

function StepIcon({ status, reducedMotion }: { status: 'done' | 'active' | 'pending'; reducedMotion: boolean }) {
  if (status === 'done') {
    return (
      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#722ED1' }}>
        <IcoCheck />
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#722ED1', animation: reducedMotion ? undefined : 'estimatePulse 1.4s ease-in-out infinite' }}
      >
        <span className="w-2 h-2 rounded-full bg-white" />
      </span>
    )
  }
  return <span className="w-5 h-5 rounded-full border-2 border-[#E3DDD7] shrink-0" />
}

// ─── Hozie progress hero ───────────────────────────────────────────────────

function HozieProgress({ snapshot, currentStepLabel, reducedMotion, onReview }: {
  snapshot: PlanAnalysisStatus
  currentStepLabel?: string
  reducedMotion: boolean
  onReview: () => void
}) {
  const complete = snapshot.status === 'complete'
  return (
    <div
      className="w-full bg-white rounded-[24px] border border-[#E3DDD7] px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-6"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      {/* Soft circular blurred glow behind the H icon — never a floor-plan graphic */}
      <div className="relative flex items-center justify-center shrink-0" style={{ width: 140, height: 140 }}>
        {!complete && !reducedMotion && [0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{ inset: 0, border: `1.5px solid rgba(243,234,255,${0.22 - i * 0.05})`, animation: `estimateRingExpand 3s ease-out ${i * 1}s infinite` }}
          />
        ))}
        <div className="absolute rounded-full bg-[#F3EAFF]" style={{ width: 100, height: 100, filter: 'blur(16px)', opacity: 0.85 }} />
        <div
          className="relative flex items-center justify-center rounded-[20px] bg-[#F3EAFF] z-10"
          style={{
            width: 72,
            height: 72,
            boxShadow: complete ? '0 0 0 4px #722ED1, 0 0 32px rgba(243,234,255,0.10)' : '0 0 28px rgba(243,234,255,0.10)',
            animation: !complete && !reducedMotion ? 'estimatePulse 2.8s ease-in-out infinite' : undefined,
            transition: 'box-shadow 0.6s ease',
          }}
        >
          <HIcon size={42} />
        </div>
        {complete && (
          <div
            className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#722ED1] flex items-center justify-center z-20"
            style={{ animation: reducedMotion ? undefined : 'estimateButtonPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
          >
            <IcoCheck />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <span
          className="text-[11px] tracking-[0.10em] uppercase"
          style={{ color: '#722ED1', fontFamily: FONT_MONO, animation: !complete && !reducedMotion ? 'hozieStatusPulse 2.2s ease-in-out infinite' : undefined }}
        >
          {complete ? 'Analysis Complete ✓' : 'Analysing Your Plan'}
        </span>
        <p className="text-[16px] text-[#242326] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
          {complete ? 'Your plan is ready for review.' : 'Finding the details that can improve your estimate.'}
        </p>
      </div>

      {!complete && (
        <div className="w-full flex flex-col gap-2" style={{ maxWidth: 420 }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-[#9A949D] truncate text-left" style={{ fontFamily: FONT_BODY }}>{currentStepLabel ?? 'Starting…'}</span>
            <span className="text-[13px] font-semibold shrink-0" style={{ color: '#722ED1', fontFamily: FONT_MONO }}>{snapshot.progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Plan analysis progress"
            aria-valuenow={snapshot.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full bg-[#F4F0EC] rounded-full overflow-hidden"
          >
            <div className="h-full bg-[#722ED1] rounded-full" style={{ width: `${snapshot.progress}%`, transition: 'width 0.3s ease' }} />
          </div>
          <span className="text-[11px] text-[#9A949D] text-center pt-1" style={{ fontFamily: FONT_BODY }}>Usually takes less than a minute.</span>
        </div>
      )}

      {complete && (
        <button
          onClick={onReview}
          className="h-12 px-8 rounded-[12px] bg-[#722ED1] text-white text-[14px] font-semibold cursor-pointer hover:brightness-90 active:scale-[0.98] transition-all border-0"
          style={{ fontFamily: FONT_HEAD, animation: reducedMotion ? undefined : 'estimateButtonPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}
        >
          Review findings →
        </button>
      )}
    </div>
  )
}

// ─── Analysis steps checklist ───────────────────────────────────────────────

function AnalysisStepList({ currentStepKey, completedSteps, reducedMotion, className }: {
  currentStepKey: string | null
  completedSteps: string[]
  reducedMotion: boolean
  className?: string
}) {
  const currentLabel = ANALYSIS_STEPS.find(s => s.key === currentStepKey)?.label
  const liveText = currentLabel
    ? `Current step: ${currentLabel}`
    : completedSteps.length >= ANALYSIS_STEPS.length
      ? 'Analysis complete'
      : 'Starting analysis'
  return (
    <SectionCard eyebrow="Analysis Steps" className={className}>
      <div aria-live="polite" className="sr-only">{liveText}</div>
      {/* Two columns on the wide desktop card (4 steps each) so the list fills
          the card's width instead of a single narrow column of short labels. */}
      <ul className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-4 lg:grid-flow-col gap-x-8 gap-y-3 m-0 p-0" style={{ listStyle: 'none' }}>
        {ANALYSIS_STEPS.map(step => {
          const isDone = completedSteps.includes(step.key)
          const isCurrent = step.key === currentStepKey
          const state: 'done' | 'active' | 'pending' = isDone ? 'done' : isCurrent ? 'active' : 'pending'
          return (
            <li key={step.key} className="flex items-center gap-3">
              <StepIcon status={state} reducedMotion={reducedMotion} />
              <span className="text-[13px]" style={{ fontFamily: FONT_BODY, color: state === 'pending' ? '#A1A1A1' : '#1E1E1E' }}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}

// ─── Live findings ───────────────────────────────────────────────────────────

function LiveFindings({ findings, className }: { findings: PlanAnalysisFinding[]; className?: string }) {
  return (
    <SectionCard eyebrow="Found So Far" className={className}>
      {findings.length === 0 ? (
        <p className="text-[12px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Findings will appear here as Hozie reads your plan.
        </p>
      ) : (
        <ul className="flex flex-col gap-3 m-0 p-0" style={{ listStyle: 'none' }}>
          {findings.map(f => (
            <li key={f.id} className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{f.label}</span>
                <span className="text-[13px] font-medium text-[#242326] leading-[1.4]" style={{ fontFamily: FONT_BODY }}>{f.value}</span>
              </div>
              <FindingStatusBadge status={f.status} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

// ─── Plan preview ────────────────────────────────────────────────────────────

function PlanPreview({ documentName, isImage, isPdfDoc, isCadDoc, previewUrl, pageCount, sizeLabel, reducedMotion, isComplete, className }: {
  documentName: string
  isImage: boolean
  isPdfDoc: boolean
  isCadDoc: boolean
  previewUrl?: string
  pageCount?: number
  sizeLabel: string
  reducedMotion: boolean
  isComplete: boolean
  className?: string
}) {
  return (
    <SectionCard
      eyebrow="Plan Preview"
      className={className}
      tag={
        <span
          className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em]"
          style={{ backgroundColor: isComplete ? '#DCFCE7' : '#F3EAFF', color: isComplete ? '#16A34A' : '#722ED1', fontFamily: FONT_MONO }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: isComplete ? '#16A34A' : '#722ED1', animation: !isComplete && !reducedMotion ? 'estimatePulse 1.6s ease-in-out infinite' : undefined }}
            aria-hidden="true"
          />
          {isComplete ? 'Analysed' : 'Analysing'}
        </span>
      }
    >
      <div className="relative rounded-[12px] overflow-hidden flex items-center justify-center" style={{ height: 200, backgroundColor: '#F4F0EC' }}>
        {isImage && previewUrl ? (
          <img src={previewUrl} alt={`Preview of ${documentName}`} className="w-full h-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2" style={{ color: '#9A949D' }}>
            <span style={{ transform: 'scale(1.6)' }}>{isPdfDoc ? <IcoFile /> : isCadDoc ? <IcoFileCad /> : <IcoImage />}</span>
            <span className="text-[10px] uppercase tracking-[0.06em]" style={{ fontFamily: FONT_MONO }}>
              {isPdfDoc ? 'First page preview' : isCadDoc ? 'Document preview' : 'Preview unavailable'}
            </span>
          </span>
        )}
        {/* Subtle scanning indicator — overlays, never obscures, the plan */}
        {!isComplete && !reducedMotion && (
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(243,234,255,0.10), transparent)', animation: 'planScanSweep 2.6s ease-in-out infinite' }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{documentName}</span>
        <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
          {pageCount ? `${pageCount} page${pageCount > 1 ? 's' : ''} · ` : ''}{sizeLabel}
        </span>
      </div>
    </SectionCard>
  )
}

// ─── What Hozie is checking ──────────────────────────────────────────────────

const SCOPE_ITEMS: { key: string; icon: React.ReactNode; label: string; stepKey: string }[] = [
  { key: 'rooms',  icon: <IcoRoomLayout />, label: 'Rooms and layout',     stepKey: 'identifying-rooms' },
  { key: 'dims',   icon: <IcoRuler />,      label: 'Dimensions',           stepKey: 'extracting-dims' },
  { key: 'area',   icon: <IcoAreaScan />,   label: 'Built-up area',        stepKey: 'checking-area' },
  { key: 'floors', icon: <IcoFloors />,     label: 'Floor count',          stepKey: 'extracting-dims' },
  { key: 'scope',  icon: <IcoScope />,      label: 'Construction scope',   stepKey: 'reviewing-scope' },
  { key: 'boq',    icon: <IcoBOQChange />,  label: 'Potential BOQ changes', stepKey: 'comparing-boq' },
]

function AnalysisScope({ completedSteps, className }: { completedSteps: string[]; className?: string }) {
  return (
    <SectionCard eyebrow="What Hozie Is Checking" className={className}>
      <div className="grid grid-cols-2 gap-3">
        {SCOPE_ITEMS.map(item => {
          const done = completedSteps.includes(item.stepKey)
          return (
            <div key={item.key} className="relative flex flex-col gap-1.5 p-3 rounded-[12px]" style={{ backgroundColor: '#FFFFFF' }}>
              <span style={{ color: done ? '#16A34A' : '#722ED1' }}>{item.icon}</span>
              <span className="text-[12px] font-medium text-[#242326] leading-[1.3]" style={{ fontFamily: FONT_BODY }}>{item.label}</span>
              {done && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#16A34A' }} aria-hidden="true">
                  <IcoCheck />
                </span>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Hozie message ───────────────────────────────────────────────────────────

function HozieMessage({ className }: { className?: string }) {
  return (
    <div className={['rounded-[16px] p-5 flex flex-col gap-3', className].filter(Boolean).join(' ')} style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
        "I'm checking your plan against the project information and current BOQ. I'll show you what I found before changing anything."
      </p>
    </div>
  )
}

// ─── Cancel modal ────────────────────────────────────────────────────────────

function CancelAnalysisModal({ onContinue, onConfirmCancel }: { onContinue: () => void; onConfirmCancel: () => void }) {
  const continueRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    continueRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onContinue() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onContinue])
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onContinue} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-analysis-title"
        aria-describedby="cancel-analysis-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="cancel-analysis-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Cancel plan analysis?</h2>
          <button onClick={onContinue} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer border-0 bg-transparent transition-colors shrink-0"><IcoClose /></button>
        </div>
        <p id="cancel-analysis-desc" className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Your uploaded plan will remain attached to the project.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button ref={continueRef} onClick={onContinue} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>
            Continue analysis
          </button>
          <button onClick={onConfirmCancel} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#DC2626', fontFamily: FONT_BODY }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Error state ─────────────────────────────────────────────────────────────

function AnalysisError({ onRetry, onUploadAnother }: { onRetry: () => void; onUploadAnother: () => void }) {
  return (
    <div
      role="alert"
      className="w-full max-w-[560px] bg-white rounded-[24px] border border-[#E3DDD7] px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center text-center gap-4"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
        <IcoWarning />
      </span>
      <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>We couldn't complete the analysis.</h2>
      <p className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY, maxWidth: 400 }}>
        The plan is still uploaded. You can retry the analysis or upload another file.
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1 w-full sm:w-auto">
        <button onClick={onUploadAnother} className="h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>
          Upload another plan
        </button>
        <button onClick={onRetry} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
          Retry analysis
        </button>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

const RUN_ENDED: PlanAnalysisStatus['status'][] = ['complete', 'error', 'cancelled']

export default function PlanAnalysisLoadingScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  documentId,
  documentName,
  documentMimeType,
  documentPageCount,
  documentSize,
  documentPreviewUrl,
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  documentId?: string
  documentName?: string
  documentMimeType?: string
  documentPageCount?: string
  documentSize?: string
  documentPreviewUrl?: string
  projectId?: string
}) {
  const reducedMotion = usePrefersReducedMotion()

  // Demo defaults reproduce the brief's own example plan so this screen can
  // be opened directly (dev switcher / review) without walking through the
  // upload flow first — same convention as every other screen in the app.
  const docId = documentId || 'doc-demo-house-floor-plan'
  const docName = documentName || 'House_Floor_Plan.pdf'
  const docMime = documentMimeType || 'application/pdf'
  // Only fall back to the brief's demo page count when there's no real
  // document at all — a real image/CAD upload genuinely has no page count
  // and shouldn't claim one.
  const docPageCount = documentPageCount ? Number(documentPageCount) : (documentId ? undefined : 3)
  const docSizeBytes = documentSize ? Number(documentSize) : Math.round(4.8 * 1024 * 1024)
  const resolvedProjectId = projectId || boqOverview.projectId

  const isImage = isPreviewableImage(docMime)
  const isPdfDoc = isPdf(docMime, docName)
  const isCadDoc = isCad(docName)

  const [snapshot, setSnapshot] = useState<PlanAnalysisStatus>(() => ({
    documentId: docId,
    projectId: resolvedProjectId,
    status: 'starting',
    progress: 0,
    currentStep: null,
    completedSteps: [],
    findings: [],
    startedAt: new Date().toISOString(),
  }))
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const controllerRef = useRef<AnalysisController | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const controller = analyzePlan(docId, resolvedProjectId, s => { if (mountedRef.current) setSnapshot(s) })
    controllerRef.current = controller
    return () => {
      mountedRef.current = false
      controller.cancel()
    }
    // Re-run only when a retry is requested — documentId/projectId are stable per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey])

  const retryAnalysis = () => {
    controllerRef.current?.cancel()
    setRunKey(k => k + 1)
  }

  const confirmCancel = () => {
    controllerRef.current?.cancel()
    setShowCancelModal(false)
    onNavigate('upload-plan')
  }

  const reviewFindings = () => {
    onNavigate('plan-analysis-result', { document_id: docId, project_id: resolvedProjectId })
  }

  const currentStepLabel = ANALYSIS_STEPS.find(s => s.key === snapshot.currentStep)?.label
  const isRunning = !RUN_ENDED.includes(snapshot.status)
  const isError = snapshot.status === 'error'
  const isComplete = snapshot.status === 'complete'
  const sizeLabel = formatFileSize(docSizeBytes)
  const kindLabel = isPdfDoc ? 'PDF' : isCadDoc ? 'CAD' : isImage ? 'Image' : 'File'
  const headerBadgeLabel = isComplete ? 'Analysis Complete' : isError ? 'Analysis Failed' : `Analysing · ${snapshot.progress}%`
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Plan Analysis</span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>{snapshot.progress}%</span>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="plan" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Analysing Plan</h1>
              <span className="text-[13px] text-[#68636D] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
              {headerBadgeLabel}
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 pb-10">

              {/* Page header */}
              <div className="flex flex-col gap-3" style={{ animation: reducedMotion ? undefined : 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Plan Analysis</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>Hozie is reading your plan.</h1>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[620px]" style={{ fontFamily: FONT_BODY }}>
                  We're analysing the drawing to understand the layout, dimensions and construction scope.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                    <span className="shrink-0" style={{ color: '#722ED1' }}>{isPdfDoc ? <IcoFile /> : isCadDoc ? <IcoFileCad /> : <IcoImage />}</span>
                    {docName}
                  </span>
                  <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{docPageCount ? `${docPageCount} page${docPageCount > 1 ? 's' : ''} · ` : ''}{kindLabel}</span>
                  <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
                </div>
              </div>

              {isError ? (
                <>
                  <AnalysisError onRetry={retryAnalysis} onUploadAnother={() => onNavigate('upload-plan')} />
                  <div className="max-w-[560px] w-full">
                    <PlanPreview
                      documentName={docName}
                      isImage={isImage}
                      isPdfDoc={isPdfDoc}
                      isCadDoc={isCadDoc}
                      previewUrl={documentPreviewUrl}
                      pageCount={docPageCount}
                      sizeLabel={sizeLabel}
                      reducedMotion
                      isComplete={false}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ animation: reducedMotion ? undefined : 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                    <HozieProgress snapshot={snapshot} currentStepLabel={currentStepLabel} reducedMotion={reducedMotion} onReview={reviewFindings} />
                  </div>

                  <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[360px_1fr_1fr] lg:gap-6" style={{ animation: reducedMotion ? undefined : 'welcomeFadeUp 0.4s ease-out 0.16s both' }}>
                    <AnalysisStepList
                      className="lg:col-start-2 lg:col-span-2 lg:row-start-1 lg:self-start"
                      currentStepKey={snapshot.currentStep}
                      completedSteps={snapshot.completedSteps}
                      reducedMotion={reducedMotion}
                    />
                    <PlanPreview
                      className="lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:self-start"
                      documentName={docName}
                      isImage={isImage}
                      isPdfDoc={isPdfDoc}
                      isCadDoc={isCadDoc}
                      previewUrl={documentPreviewUrl}
                      pageCount={docPageCount}
                      sizeLabel={sizeLabel}
                      reducedMotion={reducedMotion}
                      isComplete={isComplete}
                    />
                    <LiveFindings className="lg:col-start-2 lg:row-start-2 lg:self-start" findings={snapshot.findings} />
                    <AnalysisScope className="lg:col-start-3 lg:row-start-2 lg:self-start" completedSteps={snapshot.completedSteps} />
                    <HozieMessage className="lg:col-start-1 lg:col-span-3 lg:row-start-3" />
                  </div>

                  {isRunning && (
                    <div className="flex justify-center" style={{ animation: reducedMotion ? undefined : 'welcomeFadeUp 0.4s ease-out 0.22s both' }}>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="text-[13px] font-medium cursor-pointer border-0 bg-transparent p-0 hover:underline"
                        style={{ color: '#68636D', fontFamily: FONT_BODY }}
                      >
                        Cancel analysis
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {showCancelModal && <CancelAnalysisModal onContinue={() => setShowCancelModal(false)} onConfirmCancel={confirmCancel} />}
    </div>
  )
}
