import { useEffect, useMemo, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import MetricCard from '@/shared/components/MetricCard'
import HozieInsightCard from '@/shared/components/HozieInsightCard'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import { constructionStages, stageDurationLabel, stageById, type ConstructionStage, type StageStatus } from '@/data/constructionStages'
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
const IcoChevronDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5l4 4 4-4"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoAlert = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5L18 17H2L10 2.5z"/><line x1="10" y1="8" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="1.5" x2="7" y2="10.5"/><path d="M3.5 7.5L7 11l3.5-3.5"/>
  </svg>
)
const IcoNoProject = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 14h8"/>
  </svg>
)
const IcoTimelineView = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="3" cy="3" r="1.4"/><circle cx="3" cy="11" r="1.4"/><line x1="3" y1="4.4" x2="3" y2="9.6"/>
    <line x1="6.5" y1="3" x2="12.5" y2="3"/><line x1="6.5" y1="11" x2="12.5" y2="11"/>
  </svg>
)
const IcoListView = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1.5" y1="3.5" x2="12.5" y2="3.5"/><line x1="1.5" y1="7" x2="12.5" y2="7"/><line x1="1.5" y1="10.5" x2="12.5" y2="10.5"/>
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
      <span className="hidden lg:block text-[13px] leading-none" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{label}</span>
    </button>
  )
}

// Sidebar (desktop left rail) lives in ../components/Sidebar — a single
// shared component used by every homeowner screen so the rail never
// drifts or changes shape as you navigate between screens.



// ─── Status badge (never color-only) ─────────────────────────────────────────

const STATUS_META: Record<StageStatus, { label: string; bg: string; fg: string; dot: string }> = {
  completed: { label: 'Completed', bg: '#E3FBF0', fg: '#0F7A4E', dot: '#16A34A' },
  'in-progress': { label: 'In Progress', bg: '#FFEEE0', fg: '#C2410C', dot: '#D97706' },
  upcoming: { label: 'Upcoming', bg: '#CAC7C6', fg: '#808080', dot: '#A1A1A1' },
}

function StageStatusBadge({ status }: { status: StageStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{ backgroundColor: meta.bg, color: meta.fg, fontFamily: '"Inter Variable", sans-serif' }}
    >
      {status === 'completed' && (
        <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: meta.dot }}><IcoCheck /></span>
      )}
      {status === 'in-progress' && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.dot, animation: 'hozieStatusPulse 2.5s ease-in-out infinite' }} />
      )}
      {status === 'upcoming' && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0 border" style={{ borderColor: meta.dot }} />
      )}
      {meta.label}
    </span>
  )
}

// ─── Progress header ──────────────────────────────────────────────────────────

function ProjectProgress({ percent }: { percent: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Project Progress</span>
        <span className="text-[13px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: '#722ED1' }}>{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F4F0EC' }}>
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: '#722ED1', transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

// ─── View toggle & filter chips ───────────────────────────────────────────────

function ViewToggle({ view, onChange }: { view: 'timeline' | 'list'; onChange: (v: 'timeline' | 'list') => void }) {
  return (
    <div role="tablist" aria-label="Stage view" className="inline-flex items-center gap-0.5 p-0.5 rounded-[10px]" style={{ backgroundColor: '#F4F0EC' }}>
      {(['timeline', 'list'] as const).map(v => (
        <button
          key={v}
          role="tab"
          aria-selected={view === v}
          onClick={() => onChange(v)}
          className="h-8 px-3 rounded-[8px] text-[12px] font-semibold cursor-pointer border-0 flex items-center gap-1.5 transition-colors"
          style={{
            fontFamily: '"Inter Variable", sans-serif',
            backgroundColor: view === v ? '#FFFFFF' : 'transparent',
            color: view === v ? '#722ED1' : '#808080',
            boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          {v === 'timeline' ? <IcoTimelineView /> : <IcoListView />}
          {v === 'timeline' ? 'Timeline' : 'List'}
        </button>
      ))}
    </div>
  )
}

function FilterChips({ value, onChange }: { value: 'all' | StageStatus; onChange: (v: 'all' | StageStatus) => void }) {
  const options: { value: 'all' | StageStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'upcoming', label: 'Upcoming' },
  ]
  return (
    <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className="h-8 px-3.5 rounded-full text-[12px] font-semibold cursor-pointer border shrink-0 transition-colors"
          style={{
            fontFamily: '"Inter Variable", sans-serif',
            backgroundColor: value === opt.value ? '#F3EAFF' : '#FFFFFF',
            color: value === opt.value ? '#722ED1' : '#808080',
            borderColor: value === opt.value ? '#722ED1' : '#CAC7C6',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Dependency indicator ─────────────────────────────────────────────────────

function DependencyIndicator({ stage }: { stage: ConstructionStage }) {
  if (stage.dependencies.length === 0) {
    return (
      <p className="text-[12px] text-[#9A949D] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        No dependencies — this is the first stage.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Depends On</span>
      {stage.dependencies.map(depId => {
        const dep = stageById(depId)
        if (!dep) return null
        return (
          <div key={depId} className="flex flex-col items-start gap-1">
            <span className="text-[13px] text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{dep.name}</span>
            <span
              aria-hidden="true"
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}
            >
              <IcoArrowDown />
            </span>
            <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{stage.name}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tag pill (activities / materials / labour lists) ────────────────────────

function TagList({ label, items, empty }: { label: string; items: string[]; empty?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{label}</span>
      {items.length === 0 ? (
        <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{empty ?? 'None'}</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map(item => (
            <span
              key={item}
              className="px-2.5 py-1 rounded-full text-[11px]"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3DDD7', color: '#242326', fontFamily: '"Inter Variable", sans-serif' }}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Stage card (timeline view) ───────────────────────────────────────────────

function StageCard({ stage, expanded, onToggle, onAskHozie }: {
  stage: ConstructionStage
  expanded: boolean
  onToggle: () => void
  onAskHozie: () => void
}) {
  const isCurrent = stage.status === 'in-progress'
  return (
    <div
      className="flex-1 min-w-0 bg-white overflow-hidden transition-all duration-200"
      style={{
        border: isCurrent ? '2px solid #D97706' : '1px solid #CAC7C6',
        borderRadius: 16,
        backgroundColor: isCurrent ? '#FFF7F0' : '#FFFFFF',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`stage-panel-${stage.id}`}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${stage.name} stage details`}
        className="w-full flex items-start gap-3 sm:gap-4 p-4 sm:p-5 text-left cursor-pointer border-0 bg-transparent"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[12px] font-semibold" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: '#9A949D' }}>
              STAGE {String(stage.order).padStart(2, '0')}
            </span>
            <StageStatusBadge status={stage.status} />
          </div>
          <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#242326] m-0 mb-1" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
            {stage.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{stageDurationLabel(stage)}</span>
            <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(stage.estimatedCost)}</span>
          </div>
          {!expanded && (
            <p className="text-[12px] text-[#9A949D] m-0 mt-2 line-clamp-1" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
              {stage.activities.join(' · ')}
            </p>
          )}
        </div>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200"
          style={{ backgroundColor: '#F4F0EC', color: '#68636D', transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          <IcoChevronDown />
        </span>
      </button>

      {expanded && (
        <div id={`stage-panel-${stage.id}`} className="px-4 sm:px-5 pb-5 flex flex-col gap-4 border-t" style={{ borderColor: '#FFFFFF' }}>
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <TagList label="Major Activities" items={stage.activities} />
            <TagList label="Materials Involved" items={stage.materials} empty="Not applicable for this stage" />
            <TagList label="Labour Involved" items={stage.labour} />
            <DependencyIndicator stage={stage} />
          </div>
          <div className="rounded-[12px] p-4" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-[6px] bg-white flex items-center justify-center shrink-0"><HIcon size={14} /></span>
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#722ED1]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Note</span>
            </div>
            <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{stage.note}</p>
          </div>
          <div className="flex gap-2.5">
            <button
              className="flex-1 h-9 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[12px] font-medium cursor-pointer bg-white hover:bg-[#F4F0EC] transition-colors"
              style={{ fontFamily: '"Inter Variable", sans-serif' }}
            >
              Edit assumption
            </button>
            <button
              onClick={onAskHozie}
              className="flex-1 h-9 rounded-[10px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
              style={{ backgroundColor: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
            >
              Ask Hozie
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Timeline indicator (line + circle) ───────────────────────────────────────

function StageIndicator({ status, isLast }: { status: StageStatus; isLast: boolean }) {
  const meta = STATUS_META[status]
  // The line below a stage reflects progress already made — only a completed
  // stage "fills" the segment beneath it; in-progress/upcoming stay neutral
  // since the path hasn't been travelled past that point yet.
  const lineColor = status === 'completed' ? meta.dot : '#CAC7C6'
  return (
    <div className="hidden sm:flex flex-col items-center shrink-0" style={{ width: 32 }}>
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{
          width: 32, height: 32,
          backgroundColor: status === 'upcoming' ? '#FFFFFF' : meta.dot,
          border: status === 'upcoming' ? '2px solid #CAC7C6' : 'none',
        }}
      >
        {status === 'completed' && <IcoCheck />}
      </div>
      {!isLast && <div className="flex-1 w-[2px] mt-1" style={{ backgroundColor: lineColor, minHeight: 24 }} />}
    </div>
  )
}

// ─── List view row ────────────────────────────────────────────────────────────

function StageListRow({ stage, onOpen }: { stage: ConstructionStage; onOpen: () => void }) {
  return (
    <tr onClick={onOpen} className="border-b border-[#FFFFFF] cursor-pointer hover:bg-[#FFFFFF] transition-colors" style={{ minHeight: 56 }}>
      <td className="px-4 py-3.5">
        <span className="text-[12px] font-semibold text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{String(stage.order).padStart(2, '0')}</span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{stage.name}</span>
      </td>
      <td className="px-4 py-3.5"><StageStatusBadge status={stage.status} /></td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{stageDurationLabel(stage)}</span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(stage.estimatedCost)}</span>
      </td>
      <td className="px-4 py-3.5 text-right">
        <button
          onClick={e => { e.stopPropagation(); onOpen() }}
          aria-label={`View details for ${stage.name}`}
          className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
          style={{ color: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
        >
          View details →
        </button>
      </td>
    </tr>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function SkeletonStage() {
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-col gap-2">
      <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: '30%' }} />
      <div className="h-4 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: '45%' }} />
      <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: '60%' }} />
    </div>
  )
}

function NoProjectState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center bg-white rounded-[16px] border border-[#E3DDD7]">
      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F4F0EC', color: '#9A949D' }}>
        <IcoNoProject />
      </div>
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        Create a project to generate your construction roadmap.
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center bg-white rounded-[16px] border border-[#E3DDD7]">
      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
        <IcoAlert />
      </div>
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        Unable to load construction stages.
      </p>
      <button
        onClick={onRetry}
        className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0"
        style={{ backgroundColor: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Retry
      </button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'loading' | 'ready' | 'error' | 'no-project'

export default function ConstructionStagesScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  area = '2,400 sq ft',
  hasProject = true,
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  area?: string
  hasProject?: boolean
  /** Real id from projectData.project_id, if one already exists in this
   *  session. Always preferred over boqOverview.projectId ('proj-001'). */
  projectId?: string
}) {
  // 11D — hasProject is already known synchronously (a plain prop), so status
  // resolves to its real value immediately instead of behind an artificial
  // delay. 'error' stays defined but unreachable, same as elsewhere in this
  // codebase, in case a real failure path is ever wired.
  const [status, setStatus] = useState<ScreenStatus>(hasProject ? 'ready' : 'no-project')
  const [view, setView] = useState<'timeline' | 'list'>('timeline')
  const [filter, setFilter] = useState<'all' | StageStatus>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setStatus(hasProject ? 'ready' : 'no-project')
  }, [hasProject])

  const filteredStages = useMemo(() => {
    if (filter === 'all') return constructionStages
    return constructionStages.filter(s => s.status === filter)
  }, [filter])

  const askHozie = () => onNavigate('ai-advisor', { project_id: projectId || boqOverview.projectId })
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <button
          onClick={() => onNavigate('estimate-dashboard')}
          aria-label="Back to estimate"
          className="flex items-center gap-1 text-[#68636D] border-0 bg-transparent cursor-pointer text-[13px]"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        >
          <IcoChevronLeft /> Estimate
        </button>
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Construction Stages</span>
        <button aria-label="Download PDF" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                Construction Stages
              </h1>
              <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                {projectName} · {location} · {area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('estimate-dashboard')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: '"Inter Variable", sans-serif' }}
              >
                <IcoChevronLeft /> Back to estimate
              </button>
              <button
                aria-label="Download PDF"
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: '"Inter Variable", sans-serif' }}
              >
                <IcoDownload /> <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {status === 'no-project' ? (
                <NoProjectState />
              ) : (
                <>
                  {/* Intro */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                    <div>
                      <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                        Construction Roadmap
                      </span>
                      <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                        How your home will be built.
                      </h2>
                      <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 mt-2 max-w-[560px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                        Hozie has organized your project into construction stages so you can understand the sequence, time and major costs involved.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#F3EAFF] self-start shrink-0" style={{ border: '1px solid rgba(243,234,255,0.10)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#722ED1]" style={{ animation: 'hozieStatusPulse 2.5s ease-in-out infinite' }} />
                      <span className="text-[11px] font-medium text-[#722ED1]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>78% AI confidence</span>
                    </div>
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                    <MetricCard eyebrow="Estimated Duration" value="8–10 months" />
                    <MetricCard eyebrow="Construction Stages" value="10" />
                    <MetricCard eyebrow="Estimated Labour" value="210 working days" />
                  </div>

                  {/* Progress */}
                  <div className="bg-white p-5" style={{ border: '1px solid #E3DDD7', borderRadius: 16, animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}>
                    <ProjectProgress percent={18} />
                  </div>

                  {/* Hozie insight */}
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.18s both' }}>
                    <HozieInsightCard
                      message="Foundation and structural work are the most critical stages. Delays here can affect the entire construction schedule."
                      actionLabel="Ask Hozie →"
                      onAction={askHozie}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.22s both' }}>
                    <FilterChips value={filter} onChange={setFilter} />
                    <ViewToggle view={view} onChange={setView} />
                  </div>

                  {/* Stages */}
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.26s both' }}>
                    {status === 'error' ? (
                      <ErrorState onRetry={() => setStatus('loading')} />
                    ) : status === 'loading' ? (
                      <div className="flex flex-col gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonStage key={i} />)}
                      </div>
                    ) : filteredStages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-14 text-center bg-white rounded-[16px] border border-[#E3DDD7]">
                        <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>No stages match this filter.</p>
                      </div>
                    ) : view === 'timeline' ? (
                      <div className="flex flex-col gap-4 sm:gap-3">
                        {filteredStages.map((stage, i) => (
                          <div key={stage.id} className="flex gap-3 sm:gap-4">
                            <StageIndicator status={stage.status} isLast={i === filteredStages.length - 1} />
                            <StageCard
                              stage={stage}
                              expanded={expandedId === stage.id}
                              onToggle={() => setExpandedId(cur => cur === stage.id ? null : stage.id)}
                              onAskHozie={askHozie}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white overflow-hidden" style={{ border: '1px solid #E3DDD7', borderRadius: 16 }}>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse" style={{ minWidth: 560 }}>
                            <thead>
                              <tr style={{ backgroundColor: '#F4F0EC' }}>
                                {['#', 'Stage', 'Status', 'Duration', 'Cost', 'Action'].map((h, i) => (
                                  <th
                                    key={h}
                                    scope="col"
                                    className={['px-4 py-3 text-left text-[12px] sm:text-[12px] uppercase tracking-[0.08em] text-[#68636D]', i === 3 ? 'hidden sm:table-cell' : '', i === 5 ? 'text-right' : ''].join(' ')}
                                    style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStages.map(stage => (
                                <StageListRow key={stage.id} stage={stage} onOpen={() => { setView('timeline'); setExpandedId(stage.id) }} />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          </main>

          {status === 'ready' && (
            <div
              className="sticky bottom-0 z-20 bg-white border-t border-[#E3DDD7] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}
            >
              <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>10 STAGES · 18% COMPLETE</span>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => onNavigate('labour-estimate', { project_name: projectName, location })}
                  className="flex-1 sm:flex-none h-11 px-5 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors"
                  style={{ fontFamily: '"Inter Variable", sans-serif' }}
                >
                  Back to Labour
                </button>
                <button
                  onClick={() => onNavigate('cost-assumptions', { project_name: projectName, location })}
                  className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
                  style={{ backgroundColor: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
                >
                  Continue to Cost Assumptions →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
