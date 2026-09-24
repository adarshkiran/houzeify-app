import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import {
  versionOne,
  versionTwo,
  versionTwoChanges,
  reviewChecklist,
  formatDateLabel,
  getEstimateVersionsForProject,
  lockEstimateVersion,
  type EstimateVersion,
  type VersionChange,
} from '@/data/estimateVersions'
import { boqOverview } from '@/data/boqOverview'
import Sidebar from '@/shared/components/Sidebar'

// Diffs two versions' assumptions into the same {label, from, to} shape
// versionTwoChanges already uses — real per-project revisions don't carry a
// precomputed changes list (estimateRevision.ts's own RevisionChange[] is
// scoped to one calculateRevisedEstimate() call, not persisted per version),
// so this reconstructs an equivalent one from what's actually different
// between the two real, stored EstimateVersion records.
function diffVersions(previous: EstimateVersion, current: EstimateVersion): VersionChange[] {
  const changes: VersionChange[] = []
  if (previous.assumptions.builtUpArea !== current.assumptions.builtUpArea) {
    changes.push({ label: 'Built-up area', from: `${previous.assumptions.builtUpArea.toLocaleString('en-IN')} sq ft`, to: `${current.assumptions.builtUpArea.toLocaleString('en-IN')} sq ft` })
  }
  if (previous.assumptions.floors !== current.assumptions.floors) {
    changes.push({ label: 'Floors', from: previous.assumptions.floors, to: current.assumptions.floors })
  }
  if (previous.assumptions.finishingLevel !== current.assumptions.finishingLevel) {
    changes.push({ label: 'Finishing', from: previous.assumptions.finishingLevel, to: current.assumptions.finishingLevel })
  }
  if (previous.assumptions.materialQuality !== current.assumptions.materialQuality) {
    changes.push({ label: 'Material quality', from: previous.assumptions.materialQuality, to: current.assumptions.materialQuality })
  }
  return changes
}

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
const IcoChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5l4 4 4-4"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoLock = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6.5" width="8" height="6" rx="1.2"/><path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2"/>
  </svg>
)
const IcoClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l10 10M13 3L3 13"/>
  </svg>
)
const IcoAlert = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5L18 17H2L10 2.5z"/><line x1="10" y1="8" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoInfo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6.5"/><line x1="8" y1="7.2" x2="8" y2="11"/><circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
        active ? 'bg-[var(--hz-primary-soft)] text-[var(--hz-primary)]' : 'bg-transparent text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] hover:text-[var(--hz-ink)]',
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



// ─── Metric card ──────────────────────────────────────────────────────────────

function MiniCard({ eyebrow, value }: { eyebrow: string; value: string }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[14px] border border-[var(--hz-border)] p-4 flex flex-col gap-1.5 min-w-0">
      <span className="text-[12px] tracking-[0.08em] text-[var(--hz-ink-subtle)] uppercase truncate" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{eyebrow}</span>
      <span className="text-[16px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{value}</span>
    </div>
  )
}

// ─── Estimate hero ────────────────────────────────────────────────────────────

function EstimateHero({ locked, v2 }: { locked: boolean; v2: EstimateVersion }) {
  return (
    <div
      className="rounded-[20px] p-6 sm:p-8 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(135deg, rgba(243,234,255,0.10) 0%, var(--hz-surface) 55%)',
        border: '1px solid var(--hz-border)',
        boxShadow: '0 4px 32px rgba(114,46,209,0.08)',
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Final Estimated Cost</span>
        <span
          className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.04em]"
          style={{ backgroundColor: locked ? 'var(--hz-primary)' : 'var(--hz-primary-soft)', color: locked ? 'var(--hz-surface)' : 'var(--hz-primary)', fontFamily: '"Sometype Mono:SemiBold", monospace' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: locked ? '#fff' : 'var(--hz-primary)' }} />
          {locked ? 'Locked' : 'Ready for review'}
        </span>
      </div>
      <span className="text-[36px] sm:text-[46px] font-semibold leading-none" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-primary)' }}>
        {formatINR(v2.minCost)} — {formatINR(v2.maxCost)}
      </span>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          Estimated average: <strong style={{ color: 'var(--hz-ink)' }}>{formatINR(v2.averageCost)}</strong>
        </span>
        <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          Cost per sq ft: <strong style={{ color: 'var(--hz-ink)' }}>₹{v2.costPerSqFtMin.toLocaleString('en-IN')} — ₹{v2.costPerSqFtMax.toLocaleString('en-IN')}</strong>
        </span>
        <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          AI confidence: <strong style={{ color: 'var(--hz-ink)' }}>{v2.confidence}%</strong>
        </span>
      </div>
    </div>
  )
}

// ─── Cost summary ─────────────────────────────────────────────────────────────

function CostSummary({ v2 }: { v2: EstimateVersion }) {
  const rows: [string, number][] = [
    ['Materials', v2.costBreakdown.materialCost],
    ['Labour', v2.costBreakdown.labourCost],
    ['Finishing', v2.costBreakdown.finishingCost],
    ['Services', v2.costBreakdown.servicesCost],
    ['Contingency', v2.costBreakdown.contingencyCost],
  ]
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-3">
      <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Cost Summary</span>
      <div className="flex flex-col">
        {rows.map(([label, val], i) => (
          <div key={label} className="flex items-center justify-between py-2.5" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hz-surface)' }}>
            <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{label}</span>
            <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(val)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--hz-surface-muted)' }}>
        <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Total</span>
        <span className="text-[15px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-primary)' }}>
          {formatINR(v2.minCost)} — {formatINR(v2.maxCost)}
        </span>
      </div>
    </div>
  )
}

// ─── What changed ─────────────────────────────────────────────────────────────

function RevisionSummary({ v1, v2, changes, onViewRevision }: { v1: EstimateVersion; v2: EstimateVersion; changes: VersionChange[]; onViewRevision: () => void }) {
  const delta = v2.averageCost - v1.averageCost
  const isIncrease = delta >= 0
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimate Revision</span>
        <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>vs. Version {v1.versionNumber}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {changes.map(c => (
          <div key={c.label} className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{c.label}</span>
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
              {c.from} <IcoArrowRight /> <span style={{ color: 'var(--hz-primary)' }}>{c.to}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="h-px bg-[var(--hz-surface)]" />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-[13px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          <span className="text-[var(--hz-ink-subtle)]">{formatINR(v1.minCost)}–{formatINR(v1.maxCost)}</span>
          <IcoArrowRight />
          <span className="font-semibold" style={{ color: 'var(--hz-primary)' }}>{formatINR(v2.minCost)}–{formatINR(v2.maxCost)}</span>
        </div>
        <span
          className="text-[12px] font-semibold px-2 py-1 rounded-full"
          style={{ backgroundColor: isIncrease ? '#FEE2E2' : '#DCFCE7', color: isIncrease ? 'var(--hz-danger)' : '#16A34A', fontFamily: '"Sometype Mono:SemiBold", monospace' }}
        >
          {isIncrease ? '+' : '−'}{formatINR(Math.abs(delta))} estimated {isIncrease ? 'increase' : 'decrease'}
        </span>
      </div>
      <button
        onClick={onViewRevision}
        className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
        style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
      >
        View revision →
      </button>
    </div>
  )
}

// ─── Hozie review ─────────────────────────────────────────────────────────────

function HozieReview({ v2, onAskHozie }: { v2: EstimateVersion; onAskHozie: () => void }) {
  return (
    <div className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
          <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Review</span>
        </div>
        <span className="text-[13px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-primary)' }}>{v2.confidence}%</span>
      </div>
      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        “Your estimate is ready to use as a planning baseline. For better accuracy, upload the final floor plan and structural drawings before requesting contractor bids.”
      </p>
      <button
        onClick={onAskHozie}
        className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
        style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Ask Hozie →
      </button>
    </div>
  )
}

// ─── Review checklist ─────────────────────────────────────────────────────────

function ReviewChecklist() {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-3">
      <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Before Locking</span>
      <div className="flex flex-col gap-2.5">
        {reviewChecklist.map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span
              className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0"
              style={{ width: 18, height: 18, backgroundColor: item.done ? 'var(--hz-primary)' : 'transparent', border: item.done ? 'none' : '1.5px solid #CAC7C6' }}
            >
              {item.done && <IcoCheck />}
            </span>
            <span className="text-[13px]" style={{ fontFamily: '"Inter Variable", sans-serif', color: item.done ? 'var(--hz-black)' : '#A1A1A1' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Version history ──────────────────────────────────────────────────────────

function VersionHistory({ locked, versions, onCompare }: { locked: boolean; versions: EstimateVersion[]; onCompare: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null)
  // Latest first — versions[] is oldest-first (matches getEstimateVersionsForProject()'s
  // own contract), so the active/current one is the last entry.
  const items = versions
    .slice()
    .reverse()
    .map((v, i) => ({
      v,
      statusLabel: i === 0 ? (locked ? 'Active' : 'Draft · Ready to lock') : 'Previous',
      badgeBg: i === 0 && locked ? 'var(--hz-primary-soft)' : '#CAC7C6',
      badgeFg: i === 0 && locked ? 'var(--hz-primary)' : '#808080',
    }))
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-3">
      <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimate History</span>
      <div className="flex flex-col gap-2">
        {items.map(({ v, statusLabel, badgeBg, badgeFg }) => {
          const open = openId === v.id
          return (
            <div key={v.id} className="rounded-[12px] overflow-hidden" style={{ border: '1px solid var(--hz-surface)' }}>
              <button
                onClick={() => setOpenId(cur => cur === v.id ? null : v.id)}
                aria-expanded={open}
                aria-label={`${open ? 'Collapse' : 'Expand'} Version ${v.versionNumber} details`}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer border-0 bg-transparent"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Version {v.versionNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: badgeBg, color: badgeFg, fontFamily: '"Inter Variable", sans-serif' }}>{statusLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{formatINR(v.minCost)} — {formatINR(v.maxCost)}</span>
                  <span className="text-[var(--hz-ink-subtle)] transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }}><IcoChevronDown /></span>
                </div>
              </button>
              {open && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[var(--hz-surface)] pt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <MiniCard eyebrow="Built-up area" value={`${v.assumptions.builtUpArea.toLocaleString('en-IN')} sq ft`} />
                    <MiniCard eyebrow="Finishing" value={v.assumptions.finishingLevel} />
                    <MiniCard eyebrow="Confidence" value={`${v.confidence}%`} />
                  </div>
                  <button
                    onClick={onCompare}
                    className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
                    style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
                  >
                    Compare →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Disclaimer ───────────────────────────────────────────────────────────────

function DisclaimerCard() {
  const factors = ['final drawings', 'structural requirements', 'material brands', 'site conditions', 'market rates', 'contractor pricing', 'taxes and approvals']
  return (
    <div className="rounded-[14px] p-4 sm:p-5 flex gap-3" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
      <span className="shrink-0 text-[var(--hz-ink-subtle)] mt-0.5"><IcoInfo /></span>
      <p className="text-[11px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        AI-generated planning estimate. Actual project costs may vary based on {factors.join(', ')}.
      </p>
    </div>
  )
}

// ─── Lock confirmation modal ──────────────────────────────────────────────────

type ModalStage = 'closed' | 'confirm' | 'locking' | 'success' | 'error'

function LockModal({ stage, v2, onCancel, onConfirm, onContinueToBoq, onRetry }: {
  stage: ModalStage
  v2: EstimateVersion
  onCancel: () => void
  onConfirm: () => void
  onContinueToBoq: () => void
  onRetry: () => void
}) {
  const open = stage !== 'closed'
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && stage === 'confirm') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, stage, onCancel])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={stage === 'confirm' ? onCancel : undefined}
        className={['fixed inset-0 bg-black transition-opacity duration-200 z-40', open ? 'opacity-30 pointer-events-auto' : 'opacity-0 pointer-events-none'].join(' ')}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lock estimate"
        className={[
          'fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0',
          'w-full sm:w-[420px] max-h-[90vh] sm:max-h-none',
          'bg-[var(--hz-surface)] z-50 flex flex-col rounded-t-[20px] sm:rounded-t-none sm:rounded-l-[20px]',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full',
        ].join(' ')}
        style={{ boxShadow: '-8px 0 40px rgba(36,35,38,0.14)' }}
      >
        {stage === 'confirm' && (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-[0.10em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Confirm</span>
              <button ref={closeRef} onClick={onCancel} aria-label="Cancel locking" className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent"><IcoClose /></button>
            </div>
            <h2 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Lock Estimate Version {v2.versionNumber}?</h2>
            <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
              This version will become your active planning estimate and will be used for BOQ generation and contractor comparisons.
            </p>
            <div className="rounded-[12px] p-4" style={{ backgroundColor: '#F9F5FF' }}>
              <span className="text-[22px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-primary)' }}>
                {formatINR(v2.minCost)} — {formatINR(v2.maxCost)}
              </span>
            </div>
            <div className="flex gap-2.5 mt-1">
              <button onClick={onCancel} className="flex-1 h-11 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                Cancel
              </button>
              <button onClick={onConfirm} className="flex-1 h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>
                Lock estimate
              </button>
            </div>
          </div>
        )}

        {stage === 'locking' && (
          <div className="flex flex-col items-center justify-center text-center gap-3 p-10 flex-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', animation: 'aiIconGlow 1.4s ease-in-out infinite' }}>
              <HIcon size={26} />
            </div>
            <span className="text-[12px] uppercase tracking-[0.10em]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: 'var(--hz-primary)' }}>Locking estimate…</span>
          </div>
        )}

        {stage === 'success' && (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col items-center text-center gap-3 pt-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7', animation: 'successIconReveal 0.4s ease-out both' }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13.5l5.5 5.5L21 7"/></svg>
              </div>
              <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Estimate locked ✓</h2>
              <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Version {v2.versionNumber} is now your active estimate.</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button onClick={onContinueToBoq} className="h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>
                Continue to BOQ →
              </button>
              <button onClick={onCancel} className="h-11 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                Stay on this page
              </button>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col items-center text-center gap-3 pt-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: 'var(--hz-danger)' }}><IcoAlert /></div>
              <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Unable to lock this estimate. Your estimate has not changed.</p>
            </div>
            <div className="flex gap-2.5">
              <button onClick={onCancel} className="flex-1 h-11 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                Close
              </button>
              <button onClick={onRetry} className="flex-1 h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function FinalEstimateScreen({
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
  const resolvedProjectId = projectId || boqOverview.projectId

  // Real per-project version history when this project has one — falls
  // back to the [versionOne, versionTwo] legacy demo pair otherwise, so
  // every sub-component below stays fully preview-able with no real
  // project in context (dev switcher, etc).
  const realVersions = projectId ? getEstimateVersionsForProject(projectId) : []
  const versions: EstimateVersion[] = realVersions.length > 0 ? realVersions : [versionOne, versionTwo]
  const v2 = versions[versions.length - 1]

  // 11G — read the real, already-persisted lock state (v2.lockedAt) on
  // mount instead of always starting unlocked, so a version locked earlier
  // in this session still shows as locked after navigating away and back.
  const [locked, setLocked] = useState(() => Boolean(v2.lockedAt))
  const [lockedAt, setLockedAt] = useState<Date | null>(() => (v2.lockedAt ? new Date(v2.lockedAt) : null))
  const [modalStage, setModalStage] = useState<ModalStage>('closed')
  // A real project with exactly one real version has genuinely never been
  // revised yet — there is no real "previous version" to compare against,
  // so this must NOT fall back to the fake versionOne (that would show a
  // fabricated diff against a version this project never had). Only the
  // legacy no-real-project preview path (realVersions.length === 0) uses
  // the demo versionOne/versionTwo pair.
  const hasRealRevisionHistory = realVersions.length > 1
  const showRevisionCard = hasRealRevisionHistory || realVersions.length === 0
  const v1 = hasRealRevisionHistory ? versions[versions.length - 2] : versionOne
  const changes = hasRealRevisionHistory ? diffVersions(v1, v2) : versionTwoChanges

  const askHozie = () => onNavigate('ai-advisor', { project_id: resolvedProjectId })
  const viewRevision = () => onNavigate('estimate-revision', projectId ? { project_id: projectId } : undefined)
  const compareVersions = () => onNavigate('estimate-comparison', projectId ? { project_id: projectId } : undefined)

  // 11G — lockEstimateVersion() is a synchronous, in-memory store update
  // (same convention as the rest of this codebase's version stores), so the
  // lock is applied and reflected immediately rather than behind an
  // artificial delay. On the legacy no-real-project preview path (v2 is the
  // static versionTwo fixture, never pushed into the real store),
  // lockEstimateVersion() safely returns undefined — locked/lockedAt still
  // update locally so the preview UI behaves exactly as before.
  const confirmLock = () => {
    setModalStage('locking')
    const result = lockEstimateVersion(v2.id)
    setLocked(true)
    setLockedAt(result?.lockedAt ? new Date(result.lockedAt) : new Date())
    setModalStage('success')
  }

  const closeModal = () => setModalStage('closed')
  const continueToBoq = () => {
    setModalStage('closed')
    onNavigate('boq-overview', { project_name: projectName, location, version: String(v2.versionNumber), project_id: resolvedProjectId })
  }
  // Flow 04 (New Build) — the canonical journey's real forward step once the
  // estimate is locked: "Once finalized, this exact estimate becomes the
  // baseline for contractor bidding." Passes the locked version's real
  // numbers through as flattened keys (never a nested object — matches this
  // app's existing projectData convention) so Find Contractors → Invite
  // Contractor → Award Contractor's downstream screens can reference the
  // same final estimate this project was awarded against.
  const goFindContractors = () => {
    onNavigate('find-contractors', {
      project_id: resolvedProjectId,
      project_stage: 'estimate-ready',
      final_estimate_min: String(v2.minCost),
      final_estimate_max: String(v2.maxCost),
      final_estimate_version: String(v2.versionNumber),
    })
  }
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <button
          onClick={() => onNavigate('estimate-revision')}
          aria-label="Back to revision"
          className="flex items-center gap-1 text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer text-[13px]"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        >
          <IcoChevronLeft /> Revision
        </button>
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Final Estimate</span>
        <button aria-label="Download PDF" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                Final Estimate
              </h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                {projectName} · {location} · {area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] px-2.5 py-1.5 rounded-full" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                {locked ? `ACTIVE ESTIMATE · V${v2.versionNumber} · LOCKED` : `ESTIMATE VERSION V${v2.versionNumber} · READY TO LOCK`}
              </span>
              <button
                aria-label="Download PDF"
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: '"Inter Variable", sans-serif' }}
              >
                <IcoDownload /> <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Intro */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                  Final Estimate
                </span>
                <h2 className="text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.08]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                  {locked ? 'Your estimate is locked.' : 'Your estimate is ready.'}
                </h2>
                <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 mt-2 max-w-[600px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                  {locked
                    ? 'This estimate is currently being used as the planning baseline for your project.'
                    : 'Review your current estimate before using it to generate the BOQ and compare contractor bids.'}
                </p>
              </div>

              {/* Hero */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                <EstimateHero locked={locked} v2={v2} />
              </div>

              {locked && lockedAt && (
                <div className="flex items-center gap-2 text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                  <IcoLock /> Locked on {formatDateLabel(lockedAt)}
                </div>
              )}

              {/* Project summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}>
                <MiniCard eyebrow="Built-up area" value={`${v2.assumptions.builtUpArea.toLocaleString('en-IN')} sq ft`} />
                <MiniCard eyebrow="Floors" value={v2.assumptions.floors} />
                <MiniCard eyebrow="Construction level" value={v2.assumptions.constructionLevel} />
                <MiniCard eyebrow="Location" value={v2.assumptions.location} />
                <MiniCard eyebrow="Project type" value={v2.assumptions.projectType} />
              </div>

              {/* Two-column content */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex flex-col gap-4 w-full min-w-0" style={{ flex: '55 55 0' }}>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.18s both' }}><CostSummary v2={v2} /></div>
                  {showRevisionCard && (
                    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.22s both' }}><RevisionSummary v1={v1} v2={v2} changes={changes} onViewRevision={viewRevision} /></div>
                  )}
                  {!locked && <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.26s both' }}><ReviewChecklist /></div>}
                </div>

                <div className="flex flex-col gap-4 w-full lg:shrink-0" style={{ flex: '45 45 0', minWidth: 0 }}>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.2s both' }}>
                    <HozieReview v2={v2} onAskHozie={askHozie} />
                  </div>

                  {!locked ? (
                    <div className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-4" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
                      <div>
                        <h3 className="text-[16px] font-semibold text-[var(--hz-ink)] m-0 mb-1.5" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Ready to lock this estimate?</h3>
                        <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                          Locking creates Estimate Version {v2.versionNumber} as your current project estimate. You can still revise it later and create a new version.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <button
                          onClick={() => setModalStage('confirm')}
                          className="h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
                          style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
                        >
                          Lock &amp; Continue →
                        </button>
                        <button
                          onClick={() => { const m = document.querySelector('main'); m?.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          className="h-11 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors"
                          style={{ fontFamily: '"Inter Variable", sans-serif' }}
                        >
                          Review again
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-3" style={{ backgroundColor: 'var(--hz-surface)', border: '1px solid var(--hz-border)' }}>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary)' }}><IcoCheck /></span>
                        <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Active Estimate — Version {v2.versionNumber}</span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <button
                          onClick={goFindContractors}
                          className="h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
                          style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
                        >
                          Find Contractors →
                        </button>
                        <button
                          onClick={continueToBoq}
                          className="h-11 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors"
                          style={{ fontFamily: '"Inter Variable", sans-serif' }}
                        >
                          View BOQ →
                        </button>
                        <button
                          onClick={viewRevision}
                          className="h-11 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors"
                          style={{ fontFamily: '"Inter Variable", sans-serif' }}
                        >
                          Revise estimate
                        </button>
                        <button
                          className="h-11 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors"
                          style={{ fontFamily: '"Inter Variable", sans-serif' }}
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.3s both' }}>
                    <VersionHistory locked={locked} versions={versions} onCompare={compareVersions} />
                  </div>

                  <DisclaimerCard />
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      <LockModal
        stage={modalStage}
        v2={v2}
        onCancel={closeModal}
        onConfirm={confirmLock}
        onContinueToBoq={continueToBoq}
        onRetry={confirmLock}
      />
    </div>
  )
}
