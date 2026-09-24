import { useMemo, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  getPlanMeasurements,
  calculateMeasurementDifference,
  confidenceLabel,
  statusLabel,
  type PlanMeasurementResult,
  type RoomMeasurement,
  type MeasurementStatus,
} from '@/data/planMeasurement'
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
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
const IcoBack = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3L4.5 8L10 13"/>
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
const IcoFloors = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="14" height="4.5" rx="1"/>
    <rect x="3" y="9" width="14" height="4.5" rx="1"/>
    <line x1="3" y1="16.5" x2="17" y2="16.5"/>
  </svg>
)
const IcoBed = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 15.5V8a1.5 1.5 0 011.5-1.5h12A1.5 1.5 0 0117.5 8v7.5"/>
    <path d="M2.5 13h15"/><rect x="4" y="9" width="5" height="2.5" rx="0.6"/><rect x="11" y="9" width="5" height="2.5" rx="0.6"/>
  </svg>
)
const IcoBath = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h14v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2z"/><path d="M4 10V5.5A1.5 1.5 0 015.5 4c.9 0 1.5.7 1.5 1.5" /><line x1="3" y1="16.5" x2="17" y2="16.5"/>
  </svg>
)
const IcoLayers = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5L18 7l-8 4.5L2 7l8-4.5z"/><path d="M2 12l8 4.5L18 12"/>
  </svg>
)

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

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
        active ? 'bg-[var(--hz-primary-soft)] text-[var(--hz-primary)]' : 'bg-transparent text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)]',
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
    <div className={['bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: FONT_MONO }}>{eyebrow}</span>
        {tag}
      </div>
      {children}
    </div>
  )
}

const STATUS_STYLES: Record<MeasurementStatus, { bg: string; color: string; dot: string }> = {
  confirmed: { bg: '#DCFCE7', color: 'var(--hz-success)', dot: 'var(--hz-success)' },
  'needs-review': { bg: '#FEF3C7', color: '#D97706', dot: '#D97706' },
  'user-adjusted': { bg: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', dot: 'var(--hz-primary)' },
  unavailable: { bg: 'var(--hz-border-strong)', color: 'var(--hz-ink-subtle)', dot: '#A1A1A1' },
}

function StatusBadge({ status }: { status: MeasurementStatus }) {
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

function SourceLevelBadge({ level }: { level: 'ai-measured' | 'user-verified' }) {
  const style = level === 'ai-measured'
    ? { bg: 'var(--hz-border-strong)', color: 'var(--hz-ink-muted)', label: 'AI Measured' }
    : { bg: '#DCFCE7', color: 'var(--hz-success)', label: 'User Verified' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-[0.05em]" style={{ backgroundColor: style.bg, color: style.color, fontFamily: FONT_MONO }}>
      {style.label}
    </span>
  )
}

function ProgressStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-[var(--hz-surface-muted)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--hz-primary)] rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ─── Measurement summary ──────────────────────────────────────────────────────

function MeasurementMetric({ icon, eyebrow, value, sub, className }: { icon: React.ReactNode; eyebrow: string; value: string; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={['bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-4 sm:p-5 flex flex-col gap-2', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--hz-primary)' }}>{icon}</span>
        <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{eyebrow}</span>
      </div>
      <span className="text-[22px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{value}</span>
      {sub}
    </div>
  )
}

function MeasurementSummary({ result }: { result: PlanMeasurementResult }) {
  const { deltaValue } = calculateMeasurementDifference(result.currentProjectAreaSqft, result.builtUpArea.value)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <MeasurementMetric
        icon={<IcoAreaScan />}
        eyebrow="Built-Up Area"
        value={`${result.builtUpArea.value.toLocaleString('en-IN')} sq ft`}
        sub={<span className="text-[11px] text-[#D97706]" style={{ fontFamily: FONT_BODY }}>+{deltaValue} sq ft vs current</span>}
        className="col-span-2 lg:col-span-1"
      />
      <MeasurementMetric icon={<IcoFloors />} eyebrow="Floors" value={result.floorCount} sub={<span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{result.floorCountNumber} floors</span>} />
      <MeasurementMetric icon={<IcoBed />} eyebrow="Bedrooms" value={String(result.bedroomCount)} />
      <MeasurementMetric icon={<IcoBath />} eyebrow="Bathrooms" value={String(result.bathroomCount)} />
      <MeasurementMetric icon={<IcoLayers />} eyebrow="Rooms Measured" value={String(result.rooms.length)} />
    </div>
  )
}

// ─── Plan measurement viewer ──────────────────────────────────────────────────

function MeasurementViewer({ result, selectedRoomId, onSelectRoom, className }: {
  result: PlanMeasurementResult
  selectedRoomId: string | null
  onSelectRoom: (id: string) => void
  className?: string
}) {
  const [zoom, setZoom] = useState(100)
  const [showDimensions, setShowDimensions] = useState(true)
  const [showAreas, setShowAreas] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const viewerRef = useRef<HTMLDivElement>(null)

  const zoomIn = () => setZoom(z => Math.min(200, z + 25))
  const zoomOut = () => setZoom(z => Math.max(50, z - 25))
  const fit = () => setZoom(100)
  const reset = () => { setZoom(100); viewerRef.current?.scrollTo({ top: 0, left: 0 }) }

  const roomsWithBox = result.rooms.filter(r => r.boundingBox)

  return (
    <div className={['w-full bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: FONT_MONO }}>Plan Measurement Viewer</span>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-[10px] border border-[var(--hz-border)] overflow-hidden">
            <button aria-label="Zoom out" onClick={zoomOut} className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors"><IcoZoomOut /></button>
            <span className="text-[11px] px-2 min-w-[38px] text-center text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>{zoom}%</span>
            <button aria-label="Zoom in" onClick={zoomIn} className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors"><IcoZoomIn /></button>
          </div>
          <button aria-label="Fit to screen" onClick={fit} className="h-8 px-2.5 rounded-[10px] border border-[var(--hz-border)] flex items-center gap-1.5 text-[11px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-colors" style={{ fontFamily: FONT_BODY }}>
            <IcoFit /> Fit
          </button>
          <button aria-label="Reset view" onClick={reset} className="h-8 px-2.5 rounded-[10px] border border-[var(--hz-border)] flex items-center gap-1.5 text-[11px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-colors" style={{ fontFamily: FONT_BODY }}>
            <IcoReset /> Reset
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {[
          { key: 'dims', label: 'Show dimensions', value: showDimensions, set: setShowDimensions },
          { key: 'areas', label: 'Show room areas', value: showAreas, set: setShowAreas },
          { key: 'labels', label: 'Show room labels', value: showLabels, set: setShowLabels },
        ].map(t => (
          <button key={t.key} role="switch" aria-checked={t.value} onClick={() => t.set(v => !v)} className="inline-flex items-center gap-2 cursor-pointer border-0 bg-transparent p-0">
            <span className="relative rounded-full transition-colors shrink-0" style={{ width: 30, height: 18, backgroundColor: t.value ? 'var(--hz-primary)' : 'var(--hz-border-strong)' }}>
              <span className="absolute top-[2px] w-3.5 h-3.5 rounded-full bg-[var(--hz-surface)] transition-all" style={{ left: t.value ? 14 : 2, boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
            </span>
            <span className="text-[12px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div ref={viewerRef} className="rounded-[12px] border border-[var(--hz-border)] overflow-auto" style={{ height: 500, backgroundColor: 'var(--hz-surface)' }}>
        <div style={{ width: `${zoom}%`, minWidth: 320, padding: 16 }}>
          <div className="relative w-full" style={{ aspectRatio: '7 / 5', backgroundColor: 'var(--hz-surface)', border: '1px solid var(--hz-border)', borderRadius: 8 }}>
            {roomsWithBox.map(r => {
              const box = r.boundingBox!
              const isSelected = r.roomId === selectedRoomId
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRoom(r.roomId)}
                  aria-label={`Select ${r.name} on plan`}
                  aria-pressed={isSelected}
                  className="absolute flex flex-col items-start justify-end text-left cursor-pointer border-0 p-0"
                  style={{
                    left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.width * 100}%`, height: `${box.height * 100}%`,
                    border: isSelected ? '2px solid var(--hz-primary)' : '1px solid var(--hz-border-strong)',
                    borderRadius: 4,
                    backgroundColor: isSelected ? 'var(--hz-primary-soft)' : 'rgba(243,234,255,0.04)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span className="m-1 flex flex-col gap-0.5 max-w-full">
                    {showLabels && (
                      <span className="inline-block px-1.5 py-0.5 rounded-[6px] text-[9px] font-semibold uppercase leading-tight truncate max-w-full" style={{ backgroundColor: 'rgba(255,255,255,0.94)', color: 'var(--hz-ink)', fontFamily: FONT_MONO }}>
                        {r.name}
                      </span>
                    )}
                    {showDimensions && (
                      <span className="inline-block px-1.5 py-0.5 rounded-[6px] text-[9px] leading-tight truncate max-w-full" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}>
                        {r.length} × {r.width} ft
                      </span>
                    )}
                    {showAreas && (
                      <span className="inline-block px-1.5 py-0.5 rounded-[6px] text-[9px] leading-tight truncate max-w-full" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
                        {r.area} sq ft
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Schematic representation with measurement overlays — the underlying drawing is never redrawn or altered. Click a room to select it.
      </p>
    </div>
  )
}

// ─── Built-up area card ───────────────────────────────────────────────────────

function BuiltUpAreaCard({ result, confirmed, onConfirm, adjustment, onAdjust, className }: {
  result: PlanMeasurementResult
  confirmed: boolean
  onConfirm: () => void
  adjustment: { value: number; reason: string } | null
  onAdjust: (value: number, reason: string) => void
  className?: string
}) {
  const [adjusting, setAdjusting] = useState(false)
  const [inputValue, setInputValue] = useState(String(result.builtUpArea.value))
  const [inputReason, setInputReason] = useState('')
  const { deltaValue, deltaPct } = calculateMeasurementDifference(result.currentProjectAreaSqft, result.builtUpArea.value)
  const displayValue = adjustment ? adjustment.value : result.builtUpArea.value
  const status: MeasurementStatus = adjustment ? 'user-adjusted' : confirmed ? 'confirmed' : 'needs-review'

  const submit = () => {
    const n = Number(inputValue)
    if (!Number.isFinite(n) || n <= 0) return
    onAdjust(n, inputReason.trim())
    setAdjusting(false)
  }

  return (
    <SectionCard
      eyebrow="Built-Up Area"
      tag={<SourceLevelBadge level={adjustment ? 'user-verified' : 'ai-measured'} />}
      className={className}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[26px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{displayValue.toLocaleString('en-IN')} sq ft</span>
        {adjustment && (
          <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>AI measured: {result.builtUpArea.value.toLocaleString('en-IN')} sq ft</span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 text-[12px]" style={{ fontFamily: FONT_BODY }}>
        <div className="flex items-center justify-between"><span className="text-[var(--hz-ink-muted)]">Current project</span><span className="text-[var(--hz-ink)] font-medium">{result.currentProjectAreaSqft.toLocaleString('en-IN')} sq ft</span></div>
        <div className="flex items-center justify-between"><span className="text-[var(--hz-ink-muted)]">Difference</span><span className="font-semibold" style={{ color: '#D97706' }}>+{deltaValue} sq ft · +{deltaPct}%</span></div>
        <div className="flex items-center justify-between"><span className="text-[var(--hz-ink-muted)]">Confidence</span><span className="text-[var(--hz-ink)] font-medium">{result.builtUpArea.confidence}% · {confidenceLabel(result.builtUpArea.confidence)}</span></div>
      </div>
      <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Basis: Detected external plan boundary and available dimensions.</p>
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
      </div>

      {adjusting ? (
        <div className="flex flex-col gap-2.5 pt-1 border-t border-[var(--hz-surface)]">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Built-up area (sq ft)</span>
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="h-9 px-2.5 rounded-[8px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13px] text-[var(--hz-ink)] outline-none focus:border-[var(--hz-primary)] transition-colors"
              style={{ fontFamily: FONT_BODY }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Reason (optional)</span>
            <input
              type="text"
              value={inputReason}
              onChange={e => setInputReason(e.target.value)}
              placeholder="e.g. Measured on-site"
              className="h-9 px-2.5 rounded-[8px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13px] text-[var(--hz-ink)] outline-none focus:border-[var(--hz-primary)] transition-colors placeholder:text-[var(--hz-ink-subtle)]"
              style={{ fontFamily: FONT_BODY }}
            />
          </label>
          <div className="flex gap-2">
            <button onClick={() => setAdjusting(false)} className="h-9 px-3.5 rounded-[8px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
            <button onClick={submit} className="h-9 px-3.5 rounded-[8px] text-[12px] font-semibold text-white cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Save adjustment</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {!confirmed && !adjustment && (
            <button onClick={onConfirm} className="h-9 px-4 rounded-[10px] text-[12px] font-semibold cursor-pointer border-0 text-white hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
              Confirm area
            </button>
          )}
          <button onClick={() => { setAdjusting(true); setInputValue(String(displayValue)) }} className="h-9 px-4 rounded-[10px] text-[12px] font-medium cursor-pointer border border-[var(--hz-border)] bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>
            Adjust measurement
          </button>
        </div>
      )}
      {!adjusting && (confirmed || adjustment) && (
        <p className="text-[11px] leading-[1.6] m-0" style={{ color: 'var(--hz-success)', fontFamily: FONT_BODY }}>
          {adjustment ? "Your value is saved locally — nothing in your project has changed yet." : "Marked as reviewed — this doesn't change your project area yet."}
        </p>
      )}
    </SectionCard>
  )
}

// ─── Floor breakdown ──────────────────────────────────────────────────────────

function FloorBreakdown({ result, className }: { result: PlanMeasurementResult; className?: string }) {
  return (
    <SectionCard eyebrow="Floor Area" className={className}>
      {!result.floorAreasAvailable || result.floorAreas.length === 0 ? (
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Floor-level measurement unavailable from this drawing.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {result.floorAreas.map(f => (
            <div key={f.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{f.label}</span>
                {f.status === 'needs-review' && <StatusBadge status="needs-review" />}
              </div>
              <span className="text-[20px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{f.value.toLocaleString('en-IN')} sq ft</span>
            </div>
          ))}
          <div className="flex flex-col gap-1.5 sm:border-l sm:border-[var(--hz-surface)] sm:pl-4">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Total</span>
            <span className="text-[20px] font-semibold text-[var(--hz-primary)] leading-none" style={{ fontFamily: FONT_HEAD }}>{result.builtUpArea.value.toLocaleString('en-IN')} sq ft</span>
          </div>
        </div>
      )}
    </SectionCard>
  )
}

// ─── Room measurement table ───────────────────────────────────────────────────

function RoomMeasurementTable({ rooms, selectedRoomId, onSelectRoom, className }: {
  rooms: RoomMeasurement[]
  selectedRoomId: string | null
  onSelectRoom: (id: string) => void
  className?: string
}) {
  return (
    <SectionCard eyebrow="Room Measurements" className={className}>
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontFamily: FONT_BODY }}>
          <thead>
            <tr className="border-b border-[var(--hz-border)]">
              {['Room', 'Floor', 'Dimensions', 'Area', 'Confidence', 'Status'].map(h => (
                <th key={h} className="text-left py-2 px-2 text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)] font-medium" style={{ fontFamily: FONT_MONO }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => {
              const isSelected = r.roomId === selectedRoomId
              return (
                <tr key={r.id} style={{ backgroundColor: isSelected ? 'var(--hz-primary-wash)' : undefined }} className="border-b border-[var(--hz-surface)] transition-colors hover:bg-[var(--hz-surface)]">
                  <td className="py-2.5 px-2">
                    <button onClick={() => onSelectRoom(r.roomId)} aria-pressed={isSelected} className="text-[13px] font-medium text-left cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>
                      {r.name}
                    </button>
                  </td>
                  <td className="py-2.5 px-2 text-[13px] text-[var(--hz-ink-muted)]">{r.floor}</td>
                  <td className="py-2.5 px-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_MONO }}>{r.length} × {r.width} ft</td>
                  <td className="py-2.5 px-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_MONO }}>{r.area} sq ft</td>
                  <td className="py-2.5 px-2 text-[13px] text-[var(--hz-ink)]">{r.confidence}% · {confidenceLabel(r.confidence)}</td>
                  <td className="py-2.5 px-2"><StatusBadge status={r.status} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex lg:hidden flex-col gap-3">
        {rooms.map(r => {
          const isSelected = r.roomId === selectedRoomId
          return (
            <button
              key={r.id}
              onClick={() => onSelectRoom(r.roomId)}
              aria-pressed={isSelected}
              className="flex flex-col gap-2 rounded-[12px] p-3.5 text-left cursor-pointer border transition-colors"
              style={{ borderColor: isSelected ? 'var(--hz-primary)' : 'var(--hz-border-strong)', backgroundColor: isSelected ? 'var(--hz-primary-wash)' : 'var(--hz-surface)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{r.name}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="flex items-center justify-between gap-2 text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                <span>{r.floor} · {r.length} × {r.width} ft</span>
                <span style={{ fontFamily: FONT_MONO }}>{r.area} sq ft</span>
              </div>
              <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{r.confidence}% confidence · {confidenceLabel(r.confidence)}</span>
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Room detail panel ────────────────────────────────────────────────────────

function RoomDetailPanel({ room, onViewOnPlan, onMarkForReview, className }: {
  room: RoomMeasurement
  onViewOnPlan: () => void
  onMarkForReview: () => void
  className?: string
}) {
  return (
    <SectionCard eyebrow="Selected Room" tag={<StatusBadge status={room.status} />} className={className}>
      <span className="text-[18px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{room.name}</span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Floor</span>
          <span className="text-[13px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{room.floor}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Dimensions</span>
          <span className="text-[13px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_MONO }}>{room.length} × {room.width} ft</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Area</span>
          <span className="text-[13px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_MONO }}>{room.area} sq ft</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Confidence</span>
          <span className="text-[13px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{room.confidence}%</span>
        </div>
      </div>
      <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Measurement source: Dimension labels detected from drawing.
        {room.reviewReason && <span> {room.reviewReason}</span>}
      </p>
      <div className="flex flex-wrap gap-2.5">
        <button onClick={onViewOnPlan} className="h-9 px-4 rounded-[10px] text-[12px] font-semibold cursor-pointer border-0 text-white hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
          View on plan
        </button>
        {room.status !== 'needs-review' && (
          <button onClick={onMarkForReview} className="h-9 px-4 rounded-[10px] text-[12px] font-medium cursor-pointer border border-[var(--hz-border)] bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>
            Mark for review
          </button>
        )}
      </div>
    </SectionCard>
  )
}

// ─── Confidence breakdown ─────────────────────────────────────────────────────

function ConfidenceSection({ result, className }: { result: PlanMeasurementResult; className?: string }) {
  const c = result.confidence
  return (
    <SectionCard eyebrow="Measurement Confidence" className={className}>
      <div className="flex flex-col gap-3.5">
        <ProgressStat label="Built-up area" value={c.builtUpArea} />
        <ProgressStat label="Room dimensions" value={c.roomDimensions} />
        <ProgressStat label="Room areas" value={c.roomAreas} />
        <ProgressStat label="Floor areas" value={c.floorAreas} />
        <div className="pt-1 border-t border-[var(--hz-surface)]">
          <ProgressStat label="Overall" value={c.overall} />
        </div>
      </div>
      <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Confidence indicates how clearly Hozie could interpret the drawing. It does not replace architectural or engineering verification.
      </p>
    </SectionCard>
  )
}

// ─── Needs review ─────────────────────────────────────────────────────────────

function NeedsReview({ result, onReview, className }: { result: PlanMeasurementResult; onReview: (roomId?: string) => void; className?: string }) {
  if (result.needsReview.length === 0) return null
  return (
    <SectionCard
      eyebrow="Needs Review"
      tag={<span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{result.needsReview.length} measurements</span>}
      className={className}
    >
      <ul className="flex flex-col divide-y m-0 p-0" style={{ listStyle: 'none', borderColor: 'var(--hz-surface)' }}>
        {result.needsReview.map((item, i) => (
          <li key={item.id} className="flex items-start justify-between gap-3 py-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontFamily: FONT_MONO }}>{i + 1}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{item.measurementLabel}</span>
                <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{item.reason}</span>
                <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{item.confidence}% confidence</span>
              </div>
            </div>
            <button onClick={() => onReview(item.roomId)} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline shrink-0" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
              Review →
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}

// ─── Measurement source ───────────────────────────────────────────────────────

function MeasurementSourceCard({ result, className }: { result: PlanMeasurementResult; className?: string }) {
  return (
    <div className={['flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[12px] p-4', className].filter(Boolean).join(' ')} style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
      <span className="text-[10px] uppercase tracking-[0.06em] font-semibold text-[var(--hz-ink-muted)] shrink-0" style={{ fontFamily: FONT_MONO }}>Source</span>
      <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}><IcoFile /> {result.source.documentName}</span>
      <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Pages: {result.source.pages}</span>
      <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Method: {result.source.method}</span>
      <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Scale: {result.source.scaleDetected ? 'Detected' : 'Not detected'}</span>
      {!result.source.scaleDetected && (
        <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0 basis-full" style={{ fontFamily: FONT_BODY }}>
          Measurements are based on visible dimensions and proportional interpretation.
        </p>
      )}
    </div>
  )
}

// ─── Hozie insight ────────────────────────────────────────────────────────────

function HozieInsight({ result, onCompare, onContinueToEstimate, className }: { result: PlanMeasurementResult; onCompare: () => void; onContinueToEstimate: () => void; className?: string }) {
  const { deltaValue } = calculateMeasurementDifference(result.currentProjectAreaSqft, result.builtUpArea.value)
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-3', className].filter(Boolean).join(' ')} style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Measurement Note</span>
      </div>
      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
        "I found a built-up area of approximately {result.builtUpArea.value.toLocaleString('en-IN')} sq ft, which is {deltaValue} sq ft higher than the {result.currentProjectAreaSqft.toLocaleString('en-IN')} sq ft currently used in your project estimate."
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={onCompare} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
          Compare with BOQ →
        </button>
        <button onClick={onContinueToEstimate} className="h-11 px-6 rounded-[12px] text-[var(--hz-primary)] text-[13px] font-semibold cursor-pointer border border-[var(--hz-primary)] bg-transparent hover:bg-[var(--hz-surface)] transition-colors" style={{ fontFamily: FONT_BODY }}>
          Continue to Estimate →
        </button>
        <span className="text-[11px] text-[var(--hz-primary)] opacity-70" style={{ fontFamily: FONT_BODY }}>Nothing has changed in your estimate or BOQ yet.</span>
      </div>
    </div>
  )
}

// ─── Error / partial / loading states ────────────────────────────────────────

function MeasurementError({ onRetry, onUploadClearer }: { onRetry: () => void; onUploadClearer: () => void }) {
  return (
    <div role="alert" className="w-full max-w-[560px] mx-auto bg-[var(--hz-surface)] rounded-[24px] border border-[var(--hz-border)] px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: 'var(--hz-danger)' }}><IcoWarning /></span>
      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>We couldn't extract reliable measurements from this plan.</h2>
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1 w-full sm:w-auto">
        <button onClick={onUploadClearer} className="h-11 px-6 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Upload clearer plan</button>
        <button onClick={onRetry} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Retry</button>
      </div>
    </div>
  )
}

function MeasurementLoading() {
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col items-center text-center gap-4 py-16">
      <div className="w-14 h-14 rounded-[16px] flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', animation: 'estimatePulse 2s ease-in-out infinite' }}>
        <HIcon size={32} />
      </div>
      <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Extracting measurements…</span>
    </div>
  )
}

function PartialBanner() {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-[12px] p-4" style={{ backgroundColor: '#FEF3C7' }}>
      <span className="shrink-0" style={{ color: '#D97706' }}><IcoWarning /></span>
      <p className="text-[13px] text-[#D97706] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Some dimensions could not be reliably extracted. Measurements below are marked Confirmed or Needs review so you know what to double-check.
      </p>
    </div>
  )
}

// ─── Download ─────────────────────────────────────────────────────────────────

function downloadMeasurements(result: PlanMeasurementResult, builtUpAdjustment: { value: number; reason: string } | null) {
  const lines = [
    `Houzeify — Plan Measurement Report`,
    `Document: ${result.source.documentName}`,
    `Generated: ${result.createdAt}`,
    ``,
    `Built-up area (AI): ${result.builtUpArea.value} sq ft`,
    ...(builtUpAdjustment ? [`Built-up area (user-adjusted): ${builtUpAdjustment.value} sq ft — ${builtUpAdjustment.reason || 'no reason given'}`] : []),
    `Current project area: ${result.currentProjectAreaSqft} sq ft`,
    ``,
    `Floor areas:`,
    ...result.floorAreas.map(f => `  - ${f.label}: ${f.value} sq ft`),
    ``,
    `Room measurements:`,
    ...result.rooms.map(r => `  - ${r.name} (${r.floor}): ${r.length} × ${r.width} ft = ${r.area} sq ft (${statusLabel(r.status)}, ${r.confidence}%)`),
    ``,
    `Confidence — overall: ${result.confidence.overall}%`,
    ``,
    `Needs review (${result.needsReview.length}):`,
    ...result.needsReview.map(r => `  - ${r.measurementLabel}: ${r.reason}`),
    ``,
    `Disclaimer: these are AI-interpreted measurements from the uploaded drawing. They do not replace architectural or engineering verification.`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${result.source.documentName.replace(/\.[^.]+$/, '')}-measurements.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PlanMeasurementScreen({
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
  const [result] = useState<PlanMeasurementResult>(() => getPlanMeasurements(documentId, projectId))
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [builtUpConfirmed, setBuiltUpConfirmed] = useState(false)
  const [builtUpAdjustment, setBuiltUpAdjustment] = useState<{ value: number; reason: string } | null>(null)
  const [roomStatusOverrides, setRoomStatusOverrides] = useState<Record<string, MeasurementStatus>>({})
  const viewerRef = useRef<HTMLDivElement>(null)
  const roomDetailRef = useRef<HTMLDivElement>(null)

  const rooms = useMemo(
    () => result.rooms.map(r => (roomStatusOverrides[r.roomId] ? { ...r, status: roomStatusOverrides[r.roomId] } : r)),
    [result.rooms, roomStatusOverrides],
  )
  const selectedRoom = rooms.find(r => r.roomId === selectedRoomId) ?? null

  const selectRoom = (id: string) => {
    setSelectedRoomId(id)
    requestAnimationFrame(() => roomDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  const backToAnalysis = () => onNavigate('plan-analysis-result', { document_id: result.documentId, project_id: result.projectId })
  const compareWithBOQ = () => onNavigate('plan-vs-estimate', { document_id: result.documentId, project_id: result.projectId })
  const uploadClearer = () => onNavigate('upload-plan')
  const retry = () => onNavigate('plan-analysis-loading', { document_id: result.documentId, project_id: result.projectId })
  // Batch 1 (P0-1) — closes the loop back into the Estimate cluster for a
  // homeowner who reached the plan-analysis sub-flow via Create Project's
  // new "Have a plan? Upload it →" branch. Forwards the same real
  // project_id result already resolved with (never a hardcoded fallback).
  const continueToEstimate = () => onNavigate('estimate-loading', { project_id: result.projectId, project_name: projectName, location })
  const askHozie = () => onNavigate('ai-advisor', {
    project_id: projectId || boqOverview.projectId,
    estimate_version_id: boqActiveVersion.estimateVersionId,
    boq_version_id: boqActiveVersion.id,
    plan_document_id: result.documentId,
  })

  const scrollToViewer = () => viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const markRoomForReview = (roomId: string) => setRoomStatusOverrides(prev => ({ ...prev, [roomId]: 'needs-review' }))
  const reviewFromList = (roomId?: string) => {
    if (roomId) selectRoom(roomId)
    else scrollToViewer()
  }

  if (result.status === 'error') {
 return (
      <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
        <div className="flex flex-1 min-h-0 relative z-10">
          <Sidebar active="plan" onNavigate={onNavigate} />
          <div className="flex flex-col flex-1 min-h-0">
            <main className="flex-1 overflow-y-auto flex items-center justify-center px-4">
              <MeasurementError onRetry={retry} onUploadClearer={uploadClearer} />
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Plan Measurements</span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>AI MEASURED</span>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="plan" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Plan Measurements</h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>
              AI Measured
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 pb-28 lg:pb-8">

              {/* Page header */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Plan Measurements</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>Let's measure your plan.</h1>
                <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[620px]" style={{ fontFamily: FONT_BODY }}>
                  Hozie extracted these measurements from your uploaded drawing. Review them before using them to update your estimate.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                    <span className="shrink-0" style={{ color: 'var(--hz-primary)' }}><IcoFile /></span> {result.source.documentName}
                  </span>
                  <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button onClick={backToAnalysis} className="h-9 px-4 rounded-[10px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] cursor-pointer bg-[var(--hz-surface)] hover:bg-[var(--hz-surface-muted)] transition-colors inline-flex items-center gap-1.5" style={{ fontFamily: FONT_BODY }}>
                    <IcoBack /> Back to Analysis
                  </button>
                  <button onClick={() => downloadMeasurements(result, builtUpAdjustment)} className="h-9 px-4 rounded-[10px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] cursor-pointer bg-[var(--hz-surface)] hover:bg-[var(--hz-surface-muted)] transition-colors inline-flex items-center gap-1.5" style={{ fontFamily: FONT_BODY }}>
                    <IcoDownload /> Download Measurements
                  </button>
                </div>
              </div>

              {result.status === 'partial' && <PartialBanner />}

              {result.status === 'loading' ? (
                <MeasurementLoading />
              ) : (
                <>
                  {/* Measurement summary */}
                  <MeasurementSummary result={result} />

                  {/* Viewer + right column (built-up area) */}
                  <div ref={viewerRef} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 scroll-mt-6">
                    <MeasurementViewer result={result} selectedRoomId={selectedRoomId} onSelectRoom={selectRoom} className="lg:col-start-1 lg:row-start-1 lg:self-start" />
                    <BuiltUpAreaCard
                      result={result}
                      confirmed={builtUpConfirmed}
                      onConfirm={() => setBuiltUpConfirmed(true)}
                      adjustment={builtUpAdjustment}
                      onAdjust={(value, reason) => setBuiltUpAdjustment({ value, reason })}
                      className="lg:col-start-2 lg:row-start-1 lg:self-start"
                    />
                    <FloorBreakdown result={result} className="lg:col-start-1 lg:col-span-2 lg:row-start-2" />
                    <RoomMeasurementTable rooms={rooms} selectedRoomId={selectedRoomId} onSelectRoom={selectRoom} className="lg:col-start-1 lg:col-span-2 lg:row-start-3" />
                    {selectedRoom && (
                      <div ref={roomDetailRef} className="lg:col-start-1 lg:col-span-2 lg:row-start-4">
                        <RoomDetailPanel
                          room={selectedRoom}
                          onViewOnPlan={scrollToViewer}
                          onMarkForReview={() => markRoomForReview(selectedRoom.roomId)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Confidence + needs review */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ConfidenceSection result={result} className="lg:self-start" />
                    <NeedsReview result={result} onReview={reviewFromList} className="lg:self-start" />
                  </div>

                  <MeasurementSourceCard result={result} />
                  <HozieInsight result={result} onCompare={compareWithBOQ} onContinueToEstimate={continueToEstimate} />
                </>
              )}
            </div>
          </main>

          {/* Sticky actions (mobile) */}
          {result.status !== 'loading' && (
            <div className="lg:hidden sticky bottom-0 z-20 bg-[var(--hz-surface)] border-t border-[var(--hz-border)] px-4 py-3 flex items-center gap-2.5" style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}>
              <button onClick={askHozie} className="h-11 px-5 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors shrink-0" style={{ fontFamily: FONT_BODY }}>
                Ask Hozie
              </button>
              <button onClick={compareWithBOQ} className="flex-1 h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
                Compare with BOQ →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
