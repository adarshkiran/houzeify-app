import { useEffect, useMemo, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import {
  BASE_ASSUMPTIONS,
  BUILT_UP_AREA_MAX,
  BUILT_UP_AREA_MIN,
  BUILT_UP_AREA_STEP,
  CONTINGENCY_MAX,
  CONTINGENCY_MIN,
  calculateRevisedEstimate,
  describeChanges,
  type FloorsOption,
  type MaterialTier,
  type QualityTier,
  type RevisionAssumptions,
  type RevisedEstimateResult,
} from '@/data/estimateRevision'
import { boqOverview } from '@/data/boqOverview'
import Sidebar from '@/shared/components/Sidebar'
import { getHouseRequirementsForProject, houseRequirementsToRevisionAssumptions, deriveCostBreakdown, BUILDING_TYPE_LABELS, FINISH_LEVEL_LABELS } from '@/data/houseRequirements'
import { createEstimateVersion, getLatestEstimateVersion } from '@/data/estimateVersions'

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
const IcoDownload = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 2v7M4.5 6.5l2.5 2.5 2.5-2.5"/><path d="M2 11h10"/>
  </svg>
)
const IcoChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3L5 7l4 4"/>
  </svg>
)
const IcoMinus = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2.5" y1="7" x2="11.5" y2="7"/></svg>
)
const IcoPlus = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2.5" y1="7" x2="11.5" y2="7"/><line x1="7" y1="2.5" x2="7" y2="11.5"/></svg>
)
const IcoAlert = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5L18 17H2L10 2.5z"/><line x1="10" y1="8" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="7" x2="12" y2="7"/><path d="M8 3l4 4-4 4"/>
  </svg>
)

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
      <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{label}</span>
    </button>
  )
}

// Sidebar (desktop left rail) lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never
// drifts or changes shape as you navigate between screens.



// ─── Segmented control (keyboard-accessible native buttons) ─────────────────

function SegmentedControl<T extends string>({ label, options, value, onChange }: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1 p-1 rounded-[10px] overflow-x-auto" style={{ backgroundColor: '#F4F0EC', scrollbarWidth: 'none' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="h-8 px-3 rounded-[8px] text-[12px] font-semibold cursor-pointer border-0 shrink-0 transition-all"
          style={{
            fontFamily: '"Open Sans:Regular", sans-serif',
            backgroundColor: value === opt.value ? '#FFFFFF' : 'transparent',
            color: value === opt.value ? '#722ED1' : '#808080',
            boxShadow: value === opt.value ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Assumption card wrapper ──────────────────────────────────────────────────

function AssumptionField({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E3DDD7] p-4 sm:p-5 flex flex-col gap-3">
      <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{title}</span>
      {children}
      {helper && <p className="text-[11px] text-[#9A949D] leading-[1.5] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{helper}</p>}
    </div>
  )
}

// ─── Numeric stepper (built-up area) ──────────────────────────────────────────

function AreaStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(BUILT_UP_AREA_MAX, Math.max(BUILT_UP_AREA_MIN, v))
  // Free-typing text buffer, separate from the committed `value` — clamping
  // on every keystroke (the old behavior) snapped the field back to MIN/MAX
  // mid-entry (e.g. typing "800" clamped after the first "8" to 800, then
  // typing "0" appended to "8000" which clamped to the MAX), making it
  // impossible to type a number outside the bounds even transiently. Now
  // clamping (and the onChange commit) only happens on blur/Enter; the
  // field freely shows whatever digits are typed until then.
  const [text, setText] = useState(String(value))
  useEffect(() => { setText(String(value)) }, [value])

  function commit() {
    const parsed = Number(text)
    const next = clamp(Number.isFinite(parsed) && text.trim() !== '' ? parsed : BUILT_UP_AREA_MIN)
    setText(String(next))
    if (next !== value) onChange(next)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(clamp(value - BUILT_UP_AREA_STEP))}
        aria-label="Decrease built-up area"
        disabled={value <= BUILT_UP_AREA_MIN}
        className="w-9 h-9 rounded-[9px] border border-[#E3DDD7] flex items-center justify-center cursor-pointer bg-white hover:bg-[#F4F0EC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <IcoMinus />
      </button>
      <label className="relative flex-1">
        <span className="sr-only">Built-up area in square feet</span>
        <input
          type="number"
          value={text}
          min={BUILT_UP_AREA_MIN}
          max={BUILT_UP_AREA_MAX}
          step={BUILT_UP_AREA_STEP}
          onChange={e => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
          className="w-full h-9 px-3 text-center rounded-[9px] border border-[#E3DDD7] text-[14px] font-semibold text-[#242326] outline-none focus:border-[#722ED1]"
          style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>SQ FT</span>
      </label>
      <button
        onClick={() => onChange(clamp(value + BUILT_UP_AREA_STEP))}
        aria-label="Increase built-up area"
        disabled={value >= BUILT_UP_AREA_MAX}
        className="w-9 h-9 rounded-[9px] border border-[#E3DDD7] flex items-center justify-center cursor-pointer bg-white hover:bg-[#F4F0EC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <IcoPlus />
      </button>
    </div>
  )
}

// ─── Contingency slider ───────────────────────────────────────────────────────

function ContingencySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const pct = ((value - CONTINGENCY_MIN) / (CONTINGENCY_MAX - CONTINGENCY_MIN)) * 100
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{CONTINGENCY_MIN}%</span>
        <span className="text-[14px] font-semibold" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif', color: '#722ED1' }}>{value}%</span>
        <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{CONTINGENCY_MAX}%</span>
      </div>
      <input
        type="range"
        min={CONTINGENCY_MIN}
        max={CONTINGENCY_MAX}
        step={1}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label="Contingency percentage"
        aria-valuemin={CONTINGENCY_MIN}
        aria-valuemax={CONTINGENCY_MAX}
        aria-valuenow={value}
        style={{ accentColor: '#722ED1', width: '100%', cursor: 'pointer' }}
      />
    </div>
  )
}

// ─── Current / Live estimate cards ────────────────────────────────────────────

function CurrentEstimateCard({ version, base }: { version: number; base: RevisedEstimateResult }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Current Estimate</span>
        <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: '"Sometype Mono:SemiBold", monospace' }}>VERSION {version}</span>
      </div>
      <span className="text-[26px] sm:text-[28px] font-semibold leading-none" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif', color: '#242326' }}>
        {formatINR(base.minTotal)} — {formatINR(base.maxTotal)}
      </span>
      <div className="flex items-center gap-4">
        <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>Average: <strong style={{ color: '#242326' }}>{formatINR(base.avgTotal)}</strong></span>
        <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>Confidence: <strong style={{ color: '#242326' }}>{base.confidence}%</strong></span>
      </div>
      <span className="inline-flex items-center gap-1.5 self-start text-[11px] px-2 py-1 rounded-full" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#722ED1' }} />
        Current version
      </span>
    </div>
  )
}

function RecalculatingPanel() {
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-6 flex flex-col items-center text-center gap-3">
      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3EAFF', animation: 'aiIconGlow 1.6s ease-in-out infinite' }}>
        <HIcon size={24} />
      </div>
      <span className="text-[12px] uppercase tracking-[0.10em]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: '#722ED1' }}>Recalculating</span>
      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>Hozie is updating materials, labour and finishing costs…</p>
    </div>
  )
}

function ChangeBadge({ deltaAvg, deltaPct }: { deltaAvg: number; deltaPct: number }) {
  const isUp = deltaAvg > 0
  const isFlat = deltaAvg === 0
  const color = isFlat ? '#808080' : isUp ? '#DC2626' : '#16A34A'
  const bg = isFlat ? '#CAC7C6' : isUp ? '#FEE2E2' : '#DCFCE7'
  const sign = isFlat ? '' : isUp ? '+' : '−'
  return (
    <span
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[12px] font-semibold"
      style={{ backgroundColor: bg, color, fontFamily: '"Sometype Mono:SemiBold", monospace' }}
    >
      <span aria-hidden="true">{isFlat ? '•' : isUp ? '▲' : '▼'}</span>
      {sign}{formatINR(Math.abs(deltaAvg))} ({sign}{Math.abs(deltaPct).toFixed(1)}%)
    </span>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type CalcStatus = 'idle' | 'calculating' | 'done'

export default function EstimateRevisionScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  area = '2,400 sq ft',
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  area?: string
  /** Real id from projectData.project_id, if one already exists in this
   *  session. Always preferred over boqOverview.projectId ('proj-001'). */
  projectId?: string
}) {
  // Real House Requirements (when this project has any) replace the fixed
  // BASE_ASSUMPTIONS as the seed a homeowner revises from — this is what
  // makes "Changing requirements produces an updated estimate" true for a
  // real project rather than always starting from the same demo baseline.
  const houseRequirements = projectId ? getHouseRequirementsForProject(projectId) : undefined
  const baseAssumptions = houseRequirements ? houseRequirementsToRevisionAssumptions(houseRequirements) : BASE_ASSUMPTIONS

  const [assumptions, setAssumptions] = useState<RevisionAssumptions>(baseAssumptions)
  const [calcStatus, setCalcStatus] = useState<CalcStatus>('idle')
  const [errored, setErrored] = useState(false)
  const previousVersion = projectId ? getLatestEstimateVersion(projectId) : undefined
  const [version, setVersion] = useState(previousVersion?.versionNumber ?? 1)

  const hasChanges = useMemo(
    () => JSON.stringify(assumptions) !== JSON.stringify(baseAssumptions),
    [assumptions, baseAssumptions],
  )

  // 11G — calculateRevisedEstimate() (used below to compute `revised`) is
  // already a synchronous formula, so the revision result is available the
  // instant assumptions change; calcStatus no longer gates it behind an
  // artificial 700ms delay.
  useEffect(() => {
    setCalcStatus(hasChanges ? 'done' : 'idle')
    setErrored(false)
  }, [hasChanges])

  const revised = useMemo(() => calculateRevisedEstimate(assumptions), [assumptions])
  // The real, un-changed baseline this revision started from — equals
  // `revised` whenever hasChanges is false, and is what "Current
  // Estimate"/"Before" must show instead of the fixed BASE_ESTIMATE demo
  // constant once a real project is in context.
  const baseResult = useMemo(() => calculateRevisedEstimate(baseAssumptions), [baseAssumptions])
  const baseAvg = baseResult.avgTotal
  const deltaAvg = revised.avgTotal - baseAvg
  const deltaPct = (deltaAvg / baseAvg) * 100

  const updateField = <K extends keyof RevisionAssumptions>(field: K, value: RevisionAssumptions[K]) => {
    setAssumptions(prev => ({ ...prev, [field]: value }))
  }

  const resetChanges = () => {
    setAssumptions(baseAssumptions)
    setCalcStatus('idle')
  }

  const applyRevision = () => {
    const nextVersion = version + 1
    setVersion(nextVersion)
    if (projectId) {
      const breakdown = deriveCostBreakdown(revised, assumptions)
      createEstimateVersion({
        projectId,
        minCost: revised.minTotal,
        maxCost: revised.maxTotal,
        averageCost: revised.avgTotal,
        costPerSqFtMin: Math.round(revised.costPerSqFt * 0.93),
        costPerSqFtMax: Math.round(revised.costPerSqFt * 1.07),
        confidence: revised.confidence,
        assumptions: {
          builtUpArea: assumptions.builtUpArea,
          floors: assumptions.floors,
          constructionLevel: houseRequirements ? BUILDING_TYPE_LABELS[houseRequirements.buildingType] : 'House',
          materialQuality: assumptions.materialQuality,
          finishingLevel: FINISH_LEVEL_LABELS[assumptions.finishingLevel] ?? assumptions.finishingLevel,
          location,
          projectType: houseRequirements ? BUILDING_TYPE_LABELS[houseRequirements.buildingType] : 'House',
        },
        costBreakdown: breakdown,
        createdFromVersionId: previousVersion?.id ?? null,
      })
    }
    onNavigate('final-estimate', {
      project_name: projectName,
      location,
      quality_level: assumptions.constructionQuality,
      version: String(nextVersion),
      ...(projectId ? { project_id: projectId } : {}),
    })
  }

  const askHozie = () => onNavigate('ai-advisor', { project_id: projectId || boqOverview.projectId })
  const showRevisionResult = hasChanges && calcStatus === 'done' && !errored
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <button
          onClick={() => onNavigate('estimate-comparison')}
          aria-label="Back to comparison"
          className="flex items-center gap-1 text-[#68636D] border-0 bg-transparent cursor-pointer text-[13px]"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
        >
          <IcoChevronLeft /> Comparison
        </button>
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>Estimate Revision</span>
        <button aria-label="Download PDF" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
                Estimate Revision
              </h1>
              <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                {projectName} · {location} · {area}
              </span>
            </div>
            <button
              onClick={() => onNavigate('estimate-comparison')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all"
              style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
            >
              <IcoChevronLeft /> Back to comparison
            </button>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Intro */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                  Estimate Revision
                </span>
                <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
                  Let&apos;s fine-tune your estimate.
                </h2>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 mt-2 max-w-[560px]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                  Change the assumptions below and Hozie will recalculate the construction estimate.
                </p>
              </div>

              {/* Mobile-only: Current estimate right after header */}
              <div className="lg:hidden" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.08s both' }}>
                <CurrentEstimateCard version={version} base={baseResult} />
              </div>

              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Left — Revision controls */}
                <div className="flex flex-col gap-4 w-full min-w-0" style={{ flex: '58 58 0' }}>
                  <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Revision Controls</span>

                  <AssumptionField title="Construction quality">
                    <SegmentedControl
                      label="Construction quality"
                      value={assumptions.constructionQuality}
                      onChange={(v: QualityTier) => updateField('constructionQuality', v)}
                      options={[{ value: 'basic', label: 'Basic' }, { value: 'standard', label: 'Standard' }, { value: 'premium', label: 'Premium' }]}
                    />
                  </AssumptionField>

                  <AssumptionField title="Built-up area" helper="Changing built-up area affects materials, labour and finishing.">
                    <AreaStepper value={assumptions.builtUpArea} onChange={v => updateField('builtUpArea', v)} />
                  </AssumptionField>

                  <AssumptionField title="Number of floors">
                    <SegmentedControl
                      label="Number of floors"
                      value={assumptions.floors}
                      onChange={(v: FloorsOption) => updateField('floors', v)}
                      options={[{ value: 'G', label: 'G' }, { value: 'G+1', label: 'G+1' }, { value: 'G+2', label: 'G+2' }, { value: 'G+3', label: 'G+3' }]}
                    />
                  </AssumptionField>

                  <AssumptionField title="Finishing level">
                    <SegmentedControl
                      label="Finishing level"
                      value={assumptions.finishingLevel}
                      onChange={(v: QualityTier) => updateField('finishingLevel', v)}
                      options={[{ value: 'basic', label: 'Basic' }, { value: 'standard', label: 'Standard' }, { value: 'premium', label: 'Premium' }]}
                    />
                  </AssumptionField>

                  <AssumptionField title="Material quality">
                    <SegmentedControl
                      label="Material quality"
                      value={assumptions.materialQuality}
                      onChange={(v: MaterialTier) => updateField('materialQuality', v)}
                      options={[{ value: 'economy', label: 'Economy' }, { value: 'standard', label: 'Standard' }, { value: 'premium', label: 'Premium' }]}
                    />
                  </AssumptionField>

                  <AssumptionField title="Contingency" helper="Estimated impact updates live as you adjust the buffer.">
                    <ContingencySlider value={assumptions.contingency} onChange={v => updateField('contingency', v)} />
                  </AssumptionField>
                </div>

                {/* Right — Live estimate summary */}
                <div className="flex flex-col gap-4 w-full lg:shrink-0 lg:sticky lg:top-6" style={{ flex: '42 42 0', minWidth: 0 }}>
                  <div className="hidden lg:block">
                    <CurrentEstimateCard version={version} base={baseResult} />
                  </div>

                  {!hasChanges && (
                    <div className="bg-white rounded-[16px] border border-[#E3DDD7] border-dashed p-5 text-center">
                      <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                        No changes yet — adjust an assumption on the left to see its cost impact.
                      </p>
                    </div>
                  )}

                  {hasChanges && calcStatus === 'calculating' && <RecalculatingPanel />}

                  {showRevisionResult && (
                    <>
                      {/* Revised estimate */}
                      <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
                        <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Revised Estimate</span>
                        <span className="text-[26px] sm:text-[28px] font-semibold leading-none" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif', color: '#242326' }}>
                          {formatINR(revised.minTotal)} — {formatINR(revised.maxTotal)}
                        </span>
                        <ChangeBadge deltaAvg={deltaAvg} deltaPct={deltaPct} />
                        <span className="text-[11px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>Confidence: {revised.confidence}% · ₹{revised.costPerSqFt.toLocaleString('en-IN')}/sq ft</span>
                      </div>

                      {/* Before / After */}
                      <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3">
                        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Before / After</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[12px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Current</span>
                            <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{formatINR(baseResult.minTotal)} — {formatINR(baseResult.maxTotal)}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[12px] uppercase tracking-[0.06em] text-[#722ED1]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Revised</span>
                            <span className="text-[14px] font-semibold" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif', color: '#722ED1' }}>{formatINR(revised.minTotal)} — {formatINR(revised.maxTotal)}</span>
                          </div>
                        </div>
                        <div className="h-px bg-[#FFFFFF]" />
                        <div className="flex flex-col gap-2">
                          {[
                            ['Materials', revised.materialDelta],
                            ['Labour', revised.labourDelta],
                            ['Finishing', revised.finishingDelta],
                          ].map(([label, delta]) => (
                            <div key={label as string} className="flex items-center justify-between">
                              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{label}</span>
                              <span className="text-[12px] font-semibold" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: (delta as number) === 0 ? '#A1A1A1' : (delta as number) > 0 ? '#DC2626' : '#16A34A' }}>
                                {(delta as number) === 0 ? '—' : `${(delta as number) > 0 ? '+' : '−'}${formatINR(Math.abs(delta as number))}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hozie explanation */}
                      <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-[9px] bg-white flex items-center justify-center shrink-0"><HIcon size={16} /></span>
                          <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Explains</span>
                        </div>
                        <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                          “{describeChanges(revised.changes, deltaAvg)}”
                        </p>
                        <button
                          onClick={askHozie}
                          className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
                          style={{ color: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}
                        >
                          Ask Hozie →
                        </button>
                      </div>

                      {/* Change summary */}
                      <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-3">
                        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>What Changed</span>
                        <div className="flex flex-col gap-2.5">
                          {revised.changes.map(c => (
                            <div key={c.field} className="flex items-center justify-between gap-3">
                              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{c.label}</span>
                              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                                {c.from} <IcoArrowRight /> <span style={{ color: '#722ED1' }}>{c.to}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {errored && (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 px-5 text-center bg-white rounded-[16px] border border-[#E3DDD7]">
                      <span style={{ color: '#DC2626' }}><IcoAlert /></span>
                      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                        Unable to recalculate the estimate. Your current estimate has not changed.
                      </p>
                    </div>
                  )}

                  {/* Revision history */}
                  <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-2.5">
                    <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimate Version</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>Version {version}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}>Current</span>
                    </div>
                    {hasChanges && (
                      <div className="flex items-center justify-between opacity-60">
                        <span className="text-[13px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>Version {version + 1}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: '"Open Sans:Regular", sans-serif' }}>After applying</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </main>

          {/* Actions */}
          <div
            className="sticky bottom-0 z-20 bg-white border-t border-[#E3DDD7] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5"
            style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}
          >
            <button
              onClick={() => onNavigate('estimate-comparison')}
              className="h-11 px-5 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors order-3 sm:order-1"
              style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
            >
              Back to comparison
            </button>
            <button
              onClick={resetChanges}
              disabled={!hasChanges}
              className="h-11 px-5 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors order-2"
              style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
            >
              Reset changes
            </button>
            <button
              onClick={applyRevision}
              disabled={!showRevisionResult}
              className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all order-1 sm:order-3"
              style={{ backgroundColor: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}
            >
              Apply revised estimate →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
