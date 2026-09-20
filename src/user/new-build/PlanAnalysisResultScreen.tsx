import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  getPlanAnalysisResult,
  areaDifference,
  statusLabel,
  type PlanAnalysisResult,
  type PlanFinding,
  type FindingStatus,
  type FindingCategory,
} from '@/data/planAnalysisResult'
import { boqOverview } from '@/data/boqOverview'
import { boqActiveVersion } from '@/data/boqVersionHistory'
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
const IcoCheck = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoWarning = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L15 14H1L8 2z"/><line x1="8" y1="6.5" x2="8" y2="9.5"/><circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoFile = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2.5h7l3 3V17a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-14a.5.5 0 01.5-.5z"/><path d="M12 2.5V6h3"/>
  </svg>
)
const IcoZoomIn = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="5.5"/><line x1="12.2" y1="12.2" x2="16" y2="16"/><line x1="8" y1="5.5" x2="8" y2="10.5"/><line x1="5.5" y1="8" x2="10.5" y2="8"/>
  </svg>
)
const IcoZoomOut = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="5.5"/><line x1="12.2" y1="12.2" x2="16" y2="16"/><line x1="5.5" y1="8" x2="10.5" y2="8"/>
  </svg>
)
const IcoFit = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 2.5H3.5a1 1 0 00-1 1v3M11.5 2.5h3a1 1 0 011 1v3M15.5 11.5v3a1 1 0 01-1 1h-3M2.5 11.5v3a1 1 0 001 1h3"/>
  </svg>
)
const IcoReset = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9a6 6 0 1 1 1.8 4.3"/><path d="M3 13.5V9h4.5"/>
  </svg>
)
const IcoDownload = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2.5v9M5.5 8l3.5 3.5L12.5 8"/><path d="M3 14h12"/>
  </svg>
)
const IcoExternal = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V10"/><path d="M9.5 2.5H13.5V6.5"/><path d="M7 9L13.2 2.8"/>
  </svg>
)
const IcoRoomLayout = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/><line x1="10" y1="2.5" x2="10" y2="10.5"/><line x1="2.5" y1="10.5" x2="17.5" y2="10.5"/><line x1="10" y1="10.5" x2="10" y2="17.5"/>
  </svg>
)
const IcoAreaScan = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6V3.5H5M15 3.5h2.5V6M17.5 14v2.5H15M5 16.5H2.5V14"/>
    <rect x="6" y="6" width="8" height="8" rx="1"/>
  </svg>
)
const IcoFloors = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="4.5" rx="1"/>
    <rect x="3" y="9" width="14" height="4.5" rx="1"/>
    <line x1="3" y1="16.5" x2="17" y2="16.5"/>
  </svg>
)
const IcoRuler = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="6.5" width="15" height="7" rx="1.2" transform="rotate(-8 10 10)"/>
    <line x1="6" y1="7.5" x2="6.6" y2="9.3" strokeWidth="1.1"/><line x1="9" y1="7" x2="9.6" y2="8.8" strokeWidth="1.1"/><line x1="12" y1="6.6" x2="12.6" y2="8.4" strokeWidth="1.1"/>
  </svg>
)

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

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

const STATUS_STYLES: Record<FindingStatus, { bg: string; color: string; dot: string }> = {
  confirmed: { bg: '#DCFCE7', color: '#16A34A', dot: '#16A34A' },
  likely: { bg: '#FEF3C7', color: '#D97706', dot: '#D97706' },
  'needs-review': { bg: '#FEE2E2', color: '#DC2626', dot: '#DC2626' },
}

function StatusBadge({ status }: { status: FindingStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.04em] shrink-0 whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color, fontFamily: FONT_MONO }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} aria-hidden="true" />
      {statusLabel(status)}
    </span>
  )
}

function ProgressStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{label}</span>
        <span className="text-[12px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_MONO }}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#F4F0EC] rounded-full overflow-hidden">
        <div className="h-full bg-[#722ED1] rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ─── Analysis summary ────────────────────────────────────────────────────────

function AnalysisSummary({ result }: { result: PlanAnalysisResult }) {
  const { deltaSqft, deltaPct } = areaDifference(result)
  const detected = [
    `${result.bedroomCount} Bedrooms`,
    `${result.bathroomCount} Bathrooms`,
    `${result.kitchenCount} Kitchen`,
    `${result.livingAreaCount} Living Area`,
    `${result.staircaseCount} Staircase`,
    result.floorCount,
  ]
  return (
    <div className="w-full bg-white rounded-[24px] border border-[#E3DDD7] p-6 sm:p-8" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Confidence dial */}
        <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-3 shrink-0">
          <div className="relative flex items-center justify-center shrink-0" style={{ width: 96, height: 96 }}>
            <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
              <circle cx="48" cy="48" r="42" fill="none" stroke="#CAC7C6" strokeWidth="8" />
              <circle
                cx="48" cy="48" r="42" fill="none" stroke="#722ED1" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.overallConfidence / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-semibold text-[#242326] leading-none" style={{ fontFamily: FONT_HEAD }}>{result.overallConfidence}%</span>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-center gap-1">
            <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>Analysis Confidence</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.04em]" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_MONO }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#16A34A' }} aria-hidden="true" /> High
            </span>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-[#F4F0EC] shrink-0" />
        <div className="lg:hidden h-px bg-[#F4F0EC] w-full" />

        {/* Detected */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>Detected</span>
          <div className="flex flex-wrap gap-2">
            {detected.map(d => (
              <span key={d} className="px-3 py-1.5 rounded-full text-[12px] font-medium text-[#242326]" style={{ backgroundColor: '#F4F0EC', fontFamily: FONT_BODY }}>{d}</span>
            ))}
          </div>
        </div>

        <div className="hidden lg:block w-px bg-[#F4F0EC] shrink-0" />
        <div className="lg:hidden h-px bg-[#F4F0EC] w-full" />

        {/* Area comparison */}
        <div className="flex flex-col gap-3 shrink-0 lg:w-[200px]">
          <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>Built-Up Area</span>
          <div className="flex flex-col gap-1">
            <span className="text-[22px] font-semibold text-[#242326] leading-none" style={{ fontFamily: FONT_HEAD }}>{result.builtUpAreaSqft.toLocaleString('en-IN')} sq ft</span>
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Current project: {result.currentProjectAreaSqft.toLocaleString('en-IN')} sq ft</span>
          </div>
          <span
            className="inline-flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontFamily: FONT_MONO }}
          >
            +{deltaSqft} sq ft · +{deltaPct}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Plan viewer ─────────────────────────────────────────────────────────────

const CATEGORY_TINT: Record<FindingCategory, string> = {
  room: 'rgba(243,234,255,0.07)',
  bathroom: 'rgba(37,99,235,0.07)',
  kitchen: 'rgba(217,119,6,0.08)',
  circulation: 'rgba(22,163,74,0.07)',
  dimension: 'rgba(243,234,255,0.07)',
  area: 'rgba(243,234,255,0.07)',
  floor: 'rgba(243,234,255,0.07)',
  structure: 'rgba(104,99,109,0.08)',
  other: 'rgba(243,234,255,0.07)',
}

function PlanViewer({ result, className }: { result: PlanAnalysisResult; className?: string }) {
  const [zoom, setZoom] = useState(100)
  const [showOverlay, setShowOverlay] = useState(true)
  const viewerRef = useRef<HTMLDivElement>(null)

  const zoomIn = () => setZoom(z => Math.min(200, z + 25))
  const zoomOut = () => setZoom(z => Math.max(50, z - 25))
  const fit = () => setZoom(100)
  const reset = () => { setZoom(100); viewerRef.current?.scrollTo({ top: 0, left: 0 }) }

  return (
    <div className={['w-full bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>Plan Viewer</span>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-[10px] border border-[#E3DDD7] overflow-hidden">
            <button aria-label="Zoom out" onClick={zoomOut} className="w-8 h-8 flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer border-0 bg-transparent transition-colors"><IcoZoomOut /></button>
            <span className="text-[11px] px-2 min-w-[38px] text-center text-[#68636D]" style={{ fontFamily: FONT_MONO }}>{zoom}%</span>
            <button aria-label="Zoom in" onClick={zoomIn} className="w-8 h-8 flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer border-0 bg-transparent transition-colors"><IcoZoomIn /></button>
          </div>
          <button aria-label="Fit to screen" onClick={fit} className="h-8 px-2.5 rounded-[10px] border border-[#E3DDD7] flex items-center gap-1.5 text-[11px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-colors" style={{ fontFamily: FONT_BODY }}>
            <IcoFit /> Fit
          </button>
          <button aria-label="Reset view" onClick={reset} className="h-8 px-2.5 rounded-[10px] border border-[#E3DDD7] flex items-center gap-1.5 text-[11px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-colors" style={{ fontFamily: FONT_BODY }}>
            <IcoReset /> Reset
          </button>
        </div>
      </div>

      <button
        role="switch"
        aria-checked={showOverlay}
        onClick={() => setShowOverlay(v => !v)}
        className="self-start inline-flex items-center gap-2 cursor-pointer border-0 bg-transparent p-0"
      >
        <span
          className="relative rounded-full transition-colors shrink-0"
          style={{ width: 34, height: 20, backgroundColor: showOverlay ? '#722ED1' : '#CAC7C6' }}
        >
          <span
            className="absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all"
            style={{ left: showOverlay ? 16 : 2, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
          />
        </span>
        <span className="text-[12px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>Show AI findings</span>
      </button>

      <div ref={viewerRef} className="rounded-[12px] border border-[#E3DDD7] overflow-auto" style={{ height: 500, backgroundColor: '#FFFFFF' }}>
        <div style={{ width: `${zoom}%`, minWidth: 320, padding: 16 }}>
          <div className="relative w-full" style={{ aspectRatio: '7 / 5', backgroundColor: '#FFFFFF', border: '1px solid #E3DDD7', borderRadius: 8 }}>
            {result.annotations.map(a => (
              <div
                key={a.id}
                className="absolute flex items-end"
                style={{
                  left: `${a.x * 100}%`, top: `${a.y * 100}%`, width: `${a.width * 100}%`, height: `${a.height * 100}%`,
                  border: '1px solid #E3DDD7', borderRadius: 4,
                  backgroundColor: showOverlay ? CATEGORY_TINT[a.type] : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {showOverlay && (
                  <span
                    className="m-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] text-[9px] font-medium leading-tight max-w-full truncate"
                    style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#242326', fontFamily: FONT_BODY }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_STYLES[a.status].dot }} aria-hidden="true" />
                    {a.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Schematic representation of your uploaded plan, drawn from Hozie's analysis — not a redrawn or altered copy of the original file.
      </p>
    </div>
  )
}

// ─── AI findings panel ───────────────────────────────────────────────────────

function FindingItem({ finding }: { finding: PlanFinding }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="flex items-start gap-2 min-w-0">
        <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: STATUS_STYLES[finding.status].dot }} aria-hidden="true">
          {finding.status !== 'needs-review' && <IcoCheck />}
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-medium text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{finding.label}</span>
          <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{finding.value} · {finding.confidence}%</span>
        </div>
      </div>
      <StatusBadge status={finding.status} />
    </li>
  )
}

function FindingGroup({ title, findings }: { title: string; findings: PlanFinding[] }) {
  if (findings.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{title}</span>
      <ul className="flex flex-col divide-y m-0 p-0" style={{ listStyle: 'none', borderColor: '#FFFFFF' }}>
        {findings.map(f => <FindingItem key={f.id} finding={f} />)}
      </ul>
    </div>
  )
}

function FindingsPanel({ result, className }: { result: PlanAnalysisResult; className?: string }) {
  const rooms = result.findings.filter(f => f.category === 'room')
  const bathrooms = result.findings.filter(f => f.category === 'bathroom')
  const common = result.findings.filter(f => ['kitchen', 'other'].includes(f.category))
  const circulation = result.findings.filter(f => f.category === 'circulation')
  return (
    <SectionCard eyebrow="What Hozie Understood" className={className}>
      <div className="flex flex-col gap-4">
        <FindingGroup title="Rooms" findings={rooms} />
        <FindingGroup title="Bathrooms" findings={bathrooms} />
        <FindingGroup title="Common Areas" findings={common} />
        <FindingGroup title="Circulation" findings={circulation} />
      </div>
    </SectionCard>
  )
}

// ─── Project information ─────────────────────────────────────────────────────

function ProjectInformation({ result, className }: { result: PlanAnalysisResult; className?: string }) {
  const rows: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <IcoFloors />, label: 'Detected floor configuration', value: result.floorCount },
    { icon: <IcoRoomLayout />, label: 'Detected bedrooms', value: String(result.bedroomCount) },
    { icon: <IcoRoomLayout />, label: 'Detected bathrooms', value: String(result.bathroomCount) },
    { icon: <IcoRoomLayout />, label: 'Detected kitchen', value: String(result.kitchenCount) },
    { icon: <IcoRoomLayout />, label: 'Detected staircase', value: String(result.staircaseCount) },
    { icon: <IcoAreaScan />, label: 'Detected built-up area', value: `${result.builtUpAreaSqft.toLocaleString('en-IN')} sq ft` },
  ]
  return (
    <SectionCard eyebrow="Project Information" className={className}>
      <ul className="flex flex-col divide-y m-0 p-0" style={{ listStyle: 'none', borderColor: '#FFFFFF' }}>
        {rows.map(r => (
          <li key={r.label} className="flex items-center justify-between gap-3 py-2">
            <span className="flex items-center gap-2 text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
              <span style={{ color: '#722ED1' }}>{r.icon}</span> {r.label}
            </span>
            <span className="text-[13px] font-semibold text-[#242326] shrink-0" style={{ fontFamily: FONT_BODY }}>{r.value}</span>
          </li>
        ))}
        {result.floorAreas && result.floorAreas.map(fa => (
          <li key={fa.label} className="flex items-center justify-between gap-3 py-2">
            <span className="flex items-center gap-2 text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
              <span style={{ color: '#722ED1' }}><IcoAreaScan /></span> {fa.label} area
            </span>
            <span className="text-[13px] font-semibold text-[#242326] shrink-0" style={{ fontFamily: FONT_BODY }}>{fa.sqft.toLocaleString('en-IN')} sq ft</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

// ─── Dimension findings ──────────────────────────────────────────────────────

function DimensionSummary({ result, onViewMeasurements, className }: { result: PlanAnalysisResult; onViewMeasurements: () => void; className?: string }) {
  return (
    <SectionCard eyebrow="Dimensions Detected" className={className}>
      <ul className="flex flex-col divide-y m-0 p-0" style={{ listStyle: 'none', borderColor: '#FFFFFF' }}>
        {result.dimensions.map(d => (
          <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2">
              <span style={{ color: '#722ED1' }}><IcoRuler /></span>
              <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{d.label}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_MONO }}>{d.widthFt} × {d.depthFt} ft</span>
              <StatusBadge status={d.status} />
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={onViewMeasurements}
        className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
        style={{ color: '#722ED1', fontFamily: FONT_BODY }}
      >
        View measurements →
      </button>
    </SectionCard>
  )
}

// ─── Confidence breakdown ─────────────────────────────────────────────────────

function ConfidenceSection({ result, className }: { result: PlanAnalysisResult; className?: string }) {
  const c = result.confidence
  return (
    <SectionCard eyebrow="AI Confidence" className={className}>
      <div className="flex flex-col gap-3.5">
        <ProgressStat label="Room detection" value={c.roomDetection} />
        <ProgressStat label="Dimension extraction" value={c.dimensionExtraction} />
        <ProgressStat label="Area detection" value={c.areaDetection} />
        <ProgressStat label="Floor detection" value={c.floorDetection} />
        <div className="pt-1 border-t border-[#FFFFFF]">
          <ProgressStat label="Overall" value={c.overall} />
        </div>
      </div>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0">
        Confidence reflects how clearly the information could be interpreted from the uploaded drawing. It does not replace professional verification.
      </p>
    </SectionCard>
  )
}

// ─── Needs review ─────────────────────────────────────────────────────────────

function NeedsReview({ result, onReviewDifference, onAskHozie, className }: {
  result: PlanAnalysisResult
  onReviewDifference: () => void
  onAskHozie: () => void
  className?: string
}) {
  if (result.needsReview.length === 0) return null
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-4', className].filter(Boolean).join(' ')} style={{ backgroundColor: '#FFF9EF', border: '1px solid #F3D9A8' }}>
      <div className="flex items-center gap-2">
        <span className="shrink-0" style={{ color: '#D97706' }}><IcoWarning /></span>
        <span className="text-[10px] tracking-[0.10em] uppercase" style={{ color: '#D97706', fontFamily: FONT_MONO }}>Needs Your Review</span>
      </div>
      <div className="flex flex-col gap-4">
        {result.needsReview.map(item => (
          <div key={item.id} className="flex flex-col gap-2">
            <p className="text-[13px] font-medium text-[#242326] m-0 leading-[1.5]" style={{ fontFamily: FONT_BODY }}>{item.title}</p>
            <p className="text-[12px] text-[#68636D] m-0 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>{item.detail}</p>
            {item.current && item.planValue && (
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px]" style={{ backgroundColor: '#FFFFFF', color: '#68636D', fontFamily: FONT_BODY }}>Current: {item.current}</span>
                <span className="px-2.5 py-1 rounded-full text-[11px]" style={{ backgroundColor: '#FFFFFF', color: '#68636D', fontFamily: FONT_BODY }}>Plan: {item.planValue}</span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: '#FFFFFF', color: '#D97706', fontFamily: FONT_BODY }}>{item.difference}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2.5 pt-1">
        <button
          onClick={onReviewDifference}
          className="h-9 px-4 rounded-[10px] text-[12px] font-semibold cursor-pointer border-0 hover:brightness-95 transition-all"
          style={{ backgroundColor: '#D97706', color: 'white', fontFamily: FONT_BODY }}
        >
          Review difference
        </button>
        <button
          onClick={onAskHozie}
          className="h-9 px-4 rounded-[10px] text-[12px] font-semibold cursor-pointer border border-[#F3D9A8] bg-transparent hover:bg-white transition-colors"
          style={{ color: '#D97706', fontFamily: FONT_BODY }}
        >
          Ask Hozie
        </button>
      </div>
    </div>
  )
}

// ─── BOQ impact preview ───────────────────────────────────────────────────────

function BOQImpactPreview({ result, onCompare, className }: { result: PlanAnalysisResult; onCompare: () => void; className?: string }) {
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-4 bg-white border border-[#E3DDD7]', className].filter(Boolean).join(' ')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>Potential BOQ Impact</span>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>BOQ V{boqActiveVersion.versionNumber} · ACTIVE</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Hozie found information that may affect:</p>
      <div className="flex flex-wrap gap-2">
        {result.potentialBOQImpact.map(a => (
          <span key={a.id} className="px-3 py-1.5 rounded-full text-[12px] font-medium text-[#242326]" style={{ backgroundColor: '#F4F0EC', fontFamily: FONT_BODY }}>{a.label}</span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Potential changes</span>
          <span className="text-[18px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{result.potentialBOQItemCount} BOQ items</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Estimated impact</span>
          <span className="text-[18px] font-semibold text-[#9A949D]" style={{ fontFamily: FONT_HEAD }}>Needs calculation</span>
        </div>
      </div>
      <button
        onClick={onCompare}
        className="self-start h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
        style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
      >
        Compare with BOQ →
      </button>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0">Nothing has been changed. Comparing shows what would change — you decide what to apply.</p>
    </div>
  )
}

// ─── Hozie summary ───────────────────────────────────────────────────────────

function HozieSummary({ result, onAskHozie, className }: { result: PlanAnalysisResult; onAskHozie: () => void; className?: string }) {
  const { deltaSqft } = areaDifference(result)
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-3', className].filter(Boolean).join(' ')} style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Summary</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
        "I found a {result.builtUpAreaSqft.toLocaleString('en-IN')} sq ft built-up area, which is slightly higher (+{deltaSqft} sq ft) than the {result.currentProjectAreaSqft.toLocaleString('en-IN')} sq ft currently used in your project estimate. I also identified {result.bedroomCount} bedrooms, {result.bathroomCount} bathrooms and a {result.floorCount} layout."
      </p>
      <button onClick={onAskHozie} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>Ask Hozie →</button>
    </div>
  )
}

// ─── Source information ──────────────────────────────────────────────────────

function SourceInformation({ result, className }: { result: PlanAnalysisResult; className?: string }) {
  const uploaded = new Date(result.source.uploadedAt)
  const uploadedLabel = uploaded.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <div className={['flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[12px] p-4', className].filter(Boolean).join(' ')} style={{ backgroundColor: '#F4F0EC' }}>
      <span className="text-[10px] uppercase tracking-[0.06em] font-semibold text-[#68636D] shrink-0" style={{ fontFamily: FONT_MONO }}>Source</span>
      <span className="flex items-center gap-1.5 text-[12px] text-[#242326]" style={{ fontFamily: FONT_BODY }}><IcoFile /> {result.source.documentName}</span>
      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Pages analysed: {result.source.pagesAnalysed}</span>
      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Uploaded: {uploadedLabel}</span>
      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Analysis: {result.source.analysisEngine}</span>
    </div>
  )
}

// ─── Error / partial states ──────────────────────────────────────────────────

function ResultError({ onRetry, onUploadAnother }: { onRetry: () => void; onUploadAnother: () => void }) {
  return (
    <div role="alert" className="w-full max-w-[560px] mx-auto bg-white rounded-[24px] border border-[#E3DDD7] px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}><IcoWarning /></span>
      <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>We couldn't interpret enough information from this plan.</h2>
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1 w-full sm:w-auto">
        <button onClick={onUploadAnother} className="h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Upload another plan</button>
        <button onClick={onRetry} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>Try again</button>
      </div>
    </div>
  )
}

function PartialBanner() {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-[12px] p-4" style={{ backgroundColor: '#FEF3C7' }}>
      <span className="shrink-0" style={{ color: '#D97706' }}><IcoWarning /></span>
      <p className="text-[13px] text-[#D97706] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Some information could not be reliably read from this plan. Findings below are marked Confirmed, Likely, or Needs review so you know what to double-check.
      </p>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function downloadAnalysis(result: PlanAnalysisResult) {
  const lines = [
    `Houzeify — Plan Analysis Result`,
    `Document: ${result.source.documentName}`,
    `Analysed: ${result.createdAt}`,
    `Overall confidence: ${result.overallConfidence}%`,
    ``,
    `Floor configuration: ${result.floorCount}`,
    `Bedrooms: ${result.bedroomCount}`,
    `Bathrooms: ${result.bathroomCount}`,
    `Kitchen: ${result.kitchenCount}`,
    `Built-up area: ${result.builtUpAreaSqft} sq ft (project record: ${result.currentProjectAreaSqft} sq ft)`,
    ``,
    `Findings:`,
    ...result.findings.map(f => `  - ${f.label}: ${f.value} (${statusLabel(f.status)}, ${f.confidence}%)`),
    ``,
    `Needs review:`,
    ...result.needsReview.map(r => `  - ${r.title}`),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${result.source.documentName.replace(/\.[^.]+$/, '')}-analysis.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function PlanAnalysisResultScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  documentId,
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  documentId?: string
  projectId?: string
}) {
  const [result] = useState<PlanAnalysisResult>(() => getPlanAnalysisResult(documentId, projectId))
  const viewerSectionRef = useRef<HTMLDivElement>(null)

  const askHozie = () => onNavigate('ai-advisor', {
    project_id: projectId || boqOverview.projectId,
    estimate_version_id: boqActiveVersion.estimateVersionId,
    boq_version_id: boqActiveVersion.id,
    plan_document_id: result.documentId,
  })

  const compareWithBOQ = () => onNavigate('plan-vs-estimate', { document_id: result.documentId, project_id: result.projectId })
  const viewMeasurements = () => onNavigate('plan-measurement', { document_id: result.documentId, project_id: result.projectId })
  const uploadAnother = () => onNavigate('upload-plan')
  const retry = () => onNavigate('plan-analysis-loading', { document_id: result.documentId, project_id: result.projectId })

  const scrollToViewer = () => viewerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  if (result.status === 'error') {
 return (
      <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
        <div className="flex flex-1 min-h-0 relative z-10">
          <Sidebar active="plan" onNavigate={onNavigate} />
          <div className="flex flex-col flex-1 min-h-0">
            <main className="flex-1 overflow-y-auto flex items-center justify-center px-4">
              <ResultError onRetry={retry} onUploadAnother={uploadAnother} />
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Plan Analysis Result</span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_MONO }}>COMPLETE</span>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="plan" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Plan Analysis Result</h1>
              <span className="text-[13px] text-[#68636D] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_MONO }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#16A34A' }} aria-hidden="true" /> Analysis Complete
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 pb-28 lg:pb-8">

              {/* Page header */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Plan Analysis Result</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>Here's what Hozie found.</h1>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[620px]" style={{ fontFamily: FONT_BODY }}>
                  Hozie analysed your uploaded plan and identified the following project information.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                    <span className="shrink-0" style={{ color: '#722ED1' }}><IcoFile /></span> {result.source.documentName}
                  </span>
                  <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button onClick={scrollToViewer} className="h-9 px-4 rounded-[10px] border border-[#E3DDD7] text-[12px] font-medium text-[#242326] cursor-pointer bg-white hover:bg-[#F4F0EC] transition-colors inline-flex items-center gap-1.5" style={{ fontFamily: FONT_BODY }}>
                    <IcoExternal /> View original plan
                  </button>
                  <button onClick={() => downloadAnalysis(result)} className="h-9 px-4 rounded-[10px] border border-[#E3DDD7] text-[12px] font-medium text-[#242326] cursor-pointer bg-white hover:bg-[#F4F0EC] transition-colors inline-flex items-center gap-1.5" style={{ fontFamily: FONT_BODY }}>
                    <IcoDownload /> Download analysis
                  </button>
                </div>
              </div>

              {result.status === 'partial' && <PartialBanner />}

              {/* Analysis summary */}
              <AnalysisSummary result={result} />

              {/* Plan viewer + findings */}
              <div ref={viewerSectionRef} className="flex flex-col lg:flex-row gap-6 items-start scroll-mt-6">
                <PlanViewer result={result} className="w-full lg:flex-1 min-w-0" />
                <FindingsPanel result={result} className="w-full lg:w-[380px] lg:shrink-0" />
              </div>

              {/* Project info + dimensions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProjectInformation result={result} className="lg:self-start" />
                <DimensionSummary result={result} onViewMeasurements={viewMeasurements} className="lg:self-start" />
              </div>

              {/* Confidence + needs review */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConfidenceSection result={result} className="lg:self-start" />
                <NeedsReview result={result} onReviewDifference={compareWithBOQ} onAskHozie={askHozie} className="lg:self-start" />
              </div>

              <BOQImpactPreview result={result} onCompare={compareWithBOQ} />
              <HozieSummary result={result} onAskHozie={askHozie} />
              <SourceInformation result={result} />
            </div>
          </main>

          {/* Sticky actions (mobile) */}
          <div className="lg:hidden sticky bottom-0 z-20 bg-white border-t border-[#E3DDD7] px-4 py-3 flex items-center gap-2.5" style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}>
            <button onClick={viewMeasurements} className="h-11 px-5 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors shrink-0" style={{ fontFamily: FONT_BODY }}>
              Measurements
            </button>
            <button onClick={compareWithBOQ} className="flex-1 h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
              Compare with BOQ →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
