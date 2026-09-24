import { useMemo, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  comparePlanWithEstimate,
  calculateRevisedRange,
  formatLakh,
  confidenceLabel,
  statusLabel,
  categoryLabel,
  categorySubtotal,
  impactBreakdownLines,
  type PlanEstimateComparison,
  type ComparisonItem,
  type ComparisonCategory,
} from '@/data/planEstimateComparison'
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
const IcoBack = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3L4.5 8L10 13"/>
  </svg>
)
const IcoDownload = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2.5v9M5.5 8l3.5 3.5L12.5 8"/><path d="M3 14h12"/>
  </svg>
)
const IcoChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 5.25L7 8.75l3.5-3.5"/>
  </svg>
)
const IcoClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l8 8M11 3L3 11"/>
  </svg>
)
const IcoShield = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2l6 2.5v4c0 4-2.5 6.7-6 7.5-3.5-.8-6-3.5-6-7.5v-4L9 2z"/><path d="M6.3 9l1.8 1.8 3.6-3.6"/>
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

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  matched: { bg: '#DCFCE7', color: 'var(--hz-success)', dot: 'var(--hz-success)' },
  review: { bg: '#FEF3C7', color: '#D97706', dot: '#D97706' },
  'significant-difference': { bg: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', dot: 'var(--hz-primary)' },
  unavailable: { bg: 'var(--hz-border-strong)', color: 'var(--hz-ink-subtle)', dot: '#A1A1A1' },
}

function StatusBadge({ status }: { status: ComparisonItem['status'] }) {
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
        <span className="text-[12px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>{value}% · {confidenceLabel(value)}</span>
      </div>
      <div className="h-1.5 w-full bg-[var(--hz-surface-muted)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--hz-primary)] rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ─── Comparison summary ───────────────────────────────────────────────────────

function ComparisonSummary({ cmp }: { cmp: PlanEstimateComparison }) {
  const deltaPct = Math.round(((cmp.planAreaSqft - cmp.estimateAreaSqft) / cmp.estimateAreaSqft) * 1000) / 10
  return (
    <div className="w-full bg-[var(--hz-surface)] rounded-[24px] border border-[var(--hz-border)] p-6 sm:p-8 flex flex-col gap-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Plan Area</span>
          <span className="text-[22px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{cmp.planAreaSqft.toLocaleString('en-IN')} sq ft</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Estimate Area</span>
          <span className="text-[22px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{cmp.estimateAreaSqft.toLocaleString('en-IN')} sq ft</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Difference</span>
          <span className="text-[22px] font-semibold leading-none" style={{ color: '#D97706', fontFamily: FONT_HEAD }}>+{cmp.planAreaSqft - cmp.estimateAreaSqft} sq ft</span>
          <span className="text-[11px] text-[#D97706]" style={{ fontFamily: FONT_BODY }}>+{deltaPct}%</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Overall Impact</span>
          <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[12px] font-semibold uppercase" style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontFamily: FONT_MONO }}>{cmp.overallImpact}</span>
        </div>
      </div>

      <div className="h-px bg-[var(--hz-surface-muted)] w-full" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>BOQ Items Affected</span>
          <span className="text-[20px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{cmp.affectedItemCount}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Material Items</span>
          <span className="text-[20px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{cmp.comparisons.filter(c => c.status !== 'matched' && c.impactType === 'material').length}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Labour Items</span>
          <span className="text-[20px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{cmp.comparisons.filter(c => c.status !== 'matched' && c.impactType === 'labour').length}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Estimated Cost Impact</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full uppercase font-semibold" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_MONO }}>Preliminary</span>
          </div>
          <span className="text-[20px] font-semibold leading-none" style={{ color: '#D97706', fontFamily: FONT_HEAD }}>+₹{cmp.potentialImpact.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Comparison status metrics ───────────────────────────────────────────────

function ComparisonStatusMetrics({ cmp }: { cmp: PlanEstimateComparison }) {
  const items = [
    { label: 'Matched', value: cmp.matchedItemCount, style: STATUS_STYLES.matched },
    { label: 'Needs Review', value: cmp.reviewItemCount + cmp.significantItemCount, style: STATUS_STYLES.review },
    { label: 'Significant Difference', value: cmp.significantItemCount, style: STATUS_STYLES['significant-difference'] },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {items.map(i => (
        <div key={i.label} className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{i.label}</span>
            <span className="text-[22px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{i.value} items</span>
          </div>
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: i.style.dot }} aria-hidden="true" />
        </div>
      ))}
    </div>
  )
}

// ─── Category comparison table ───────────────────────────────────────────────

const CATEGORY_ORDER: ComparisonCategory[] = ['project-area', 'structure', 'masonry', 'flooring', 'plastering', 'painting', 'electrical']

function CategorySection({ category, items, selected, onToggleSelect, onOpenDetail, className }: {
  category: ComparisonCategory
  items: ComparisonItem[]
  selected: Record<string, boolean>
  onToggleSelect: (id: string) => void
  onOpenDetail: (item: ComparisonItem) => void
  className?: string
}) {
  const [expanded, setExpanded] = useState(true)
  const subtotal = categorySubtotal(items, category)
  return (
    <div className={['bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] overflow-hidden', className].filter(Boolean).join(' ')}>
      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer border-0 bg-transparent text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="shrink-0 flex items-center justify-center transition-transform"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', color: 'var(--hz-ink-muted)' }}
          >
            <IcoChevronDown />
          </span>
          <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{categoryLabel(category)}</span>
          <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{items.length} item{items.length > 1 ? 's' : ''}</span>
        </div>
        <span className="text-[13px] font-semibold shrink-0" style={{ color: subtotal > 0 ? '#D97706' : '#A1A1A1', fontFamily: FONT_MONO }}>
          {subtotal > 0 ? `+₹${subtotal.toLocaleString('en-IN')}` : '—'}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--hz-surface)]">
          {/* Desktop table rows */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse" style={{ fontFamily: FONT_BODY }}>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-[var(--hz-surface)] last:border-b-0 hover:bg-[var(--hz-surface)] transition-colors">
                    <td className="py-3 px-4 sm:px-5 w-8">
                      <input
                        type="checkbox"
                        checked={!!selected[item.id]}
                        onChange={() => onToggleSelect(item.id)}
                        aria-label={`Select ${item.label} for review`}
                        className="w-4 h-4 accent-[var(--hz-primary)] cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <button onClick={() => onOpenDetail(item)} className="text-[13px] font-medium text-left cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>
                        {item.label}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-[12px] text-[var(--hz-ink-muted)] whitespace-nowrap">{item.estimateValue}</td>
                    <td className="py-3 px-2 text-[12px] text-[var(--hz-ink)] whitespace-nowrap">{item.planValue}</td>
                    <td className="py-3 px-2 text-[12px] font-medium whitespace-nowrap" style={{ color: '#D97706' }}>{item.difference}</td>
                    <td className="py-3 px-2 text-[12px] font-medium whitespace-nowrap" style={{ color: item.totalImpact > 0 ? '#D97706' : '#A1A1A1' }}>
                      {item.totalImpact > 0 ? `+₹${item.totalImpact.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-2"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex lg:hidden flex-col divide-y" style={{ borderColor: 'var(--hz-surface)' }}>
            {items.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <label className="flex items-start gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={!!selected[item.id]}
                      onChange={() => onToggleSelect(item.id)}
                      aria-label={`Select ${item.label} for review`}
                      className="w-4 h-4 mt-0.5 accent-[var(--hz-primary)] cursor-pointer shrink-0"
                    />
                    <button onClick={() => onOpenDetail(item)} className="text-[13px] font-semibold text-left cursor-pointer border-0 bg-transparent p-0" style={{ color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>
                      {item.label}
                    </button>
                  </label>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center justify-between gap-2 text-[12px] text-[var(--hz-ink-muted)] pl-6" style={{ fontFamily: FONT_BODY }}>
                  <span>{item.estimateValue} → {item.planValue}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pl-6">
                  <span className="text-[11px] font-medium" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{item.difference}</span>
                  <span className="text-[12px] font-semibold" style={{ color: item.totalImpact > 0 ? '#D97706' : '#A1A1A1', fontFamily: FONT_MONO }}>
                    {item.totalImpact > 0 ? `+₹${item.totalImpact.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Matched items ────────────────────────────────────────────────────────────

function MatchedItemsSection({ items, className }: { items: ComparisonItem[]; className?: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={['bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] overflow-hidden', className].filter(Boolean).join(' ')}>
      <button onClick={() => setExpanded(v => !v)} aria-expanded={expanded} className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer border-0 bg-transparent text-left">
        <div className="flex items-center gap-3">
          <span className="shrink-0 flex items-center justify-center transition-transform" style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', color: 'var(--hz-ink-muted)' }}><IcoChevronDown /></span>
          <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>No Significant Change</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.04em]" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)', fontFamily: FONT_MONO }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-success)' }} aria-hidden="true" /> {items.length} matched
        </span>
      </button>
      {expanded && (
        <div className="border-t border-[var(--hz-surface)] p-4 sm:p-5 flex flex-col gap-3">
          <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
            {items.length} BOQ items appear consistent with the current plan analysis. This means no significant difference was found — it is not a professional verification of these items.
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map(i => (
              <span key={i.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-[var(--hz-ink)]" style={{ backgroundColor: 'var(--hz-surface-muted)', fontFamily: FONT_BODY }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-success)' }} aria-hidden="true" />
                {i.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Difference drawer ────────────────────────────────────────────────────────

function DifferenceDrawer({ item, onClose, onViewMeasurement, onViewBOQItem, onAskHozie }: {
  item: ComparisonItem
  onClose: () => void
  onViewMeasurement: () => void
  onViewBOQItem: () => void
  onAskHozie: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diff-drawer-title"
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[var(--hz-surface)] flex flex-col gap-5 p-6 overflow-y-auto"
        style={{ boxShadow: '-8px 0 30px rgba(36,35,38,0.12)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>{categoryLabel(item.category)}</span>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors"><IcoClose /></button>
        </div>
        <h2 id="diff-drawer-title" className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{item.label}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Current estimate</span>
            <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{item.estimateValue}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Plan measurement</span>
            <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{item.planValue}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Difference</span>
            <span className="text-[15px] font-semibold" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{item.difference}</span>
          </div>
          {item.rate && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Current rate</span>
              <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>₹{item.rate} / {item.unit}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 rounded-[12px] p-4" style={{ backgroundColor: 'var(--hz-surface)' }}>
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Potential impact</span>
          <span className="text-[20px] font-semibold" style={{ color: item.totalImpact > 0 ? '#D97706' : '#A1A1A1', fontFamily: FONT_HEAD }}>
            {item.totalImpact > 0 ? `+₹${item.totalImpact.toLocaleString('en-IN')}` : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Confidence</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{item.confidence}% · {confidenceLabel(item.confidence)}</span>
        </div>

        {item.reason && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Reason</span>
            <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{item.reason}</p>
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-2 mt-auto">
          <button onClick={onViewMeasurement} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>
            View plan measurement
          </button>
          <button onClick={onViewBOQItem} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>
            View BOQ item
          </button>
          <button onClick={onAskHozie} className="h-10 px-4 rounded-[10px] text-[12px] font-semibold text-white cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
            Ask Hozie
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Cost impact + breakdown ──────────────────────────────────────────────────

function CostImpactSection({ cmp, className }: { cmp: PlanEstimateComparison; className?: string }) {
  const revised = calculateRevisedRange(cmp.estimateMin, cmp.estimateMax, cmp.potentialImpact)
  return (
    <SectionCard eyebrow="Potential Cost Impact" className={className}>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Material</span>
          <span className="text-[18px] font-semibold" style={{ color: '#D97706', fontFamily: FONT_HEAD }}>+₹{cmp.materialImpact.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Labour</span>
          <span className="text-[18px] font-semibold" style={{ color: '#D97706', fontFamily: FONT_HEAD }}>+₹{cmp.labourImpact.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Total</span>
          <span className="text-[18px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>+₹{cmp.potentialImpact.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="h-px bg-[var(--hz-surface)]" />
      <div className="flex flex-col gap-2 text-[13px]" style={{ fontFamily: FONT_BODY }}>
        <div className="flex items-center justify-between"><span className="text-[var(--hz-ink-muted)]">Current estimate range</span><span className="font-medium text-[var(--hz-ink)]">{formatLakh(cmp.estimateMin)} — {formatLakh(cmp.estimateMax)}</span></div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[var(--hz-ink-muted)]">
            Potential revised range
            <span className="text-[9px] px-1.5 py-0.5 rounded-full uppercase font-semibold" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>Indicative</span>
          </span>
          <span className="font-semibold" style={{ color: 'var(--hz-primary)' }}>{formatLakh(revised.min)} — {formatLakh(revised.max)}</span>
        </div>
      </div>
      <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        This is not a final revised estimate. It becomes official only after you review and approve changes on the next screen.
      </p>
    </SectionCard>
  )
}

function ImpactBreakdown({ cmp, className }: { cmp: PlanEstimateComparison; className?: string }) {
  const lines = impactBreakdownLines(cmp.comparisons)
  const max = Math.max(...lines.map(l => l.amount), 1)
  return (
    <SectionCard eyebrow="Impact Breakdown" className={className}>
      <div className="flex flex-col gap-3">
        {lines.map(l => (
          <div key={l.label} className="flex items-center gap-3">
            <span className="text-[12px] text-[var(--hz-ink)] w-[92px] shrink-0" style={{ fontFamily: FONT_BODY }}>{l.label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--hz-surface)' }}>
              <div className="h-full rounded-full" style={{ width: `${(l.amount / max) * 100}%`, backgroundColor: 'var(--hz-primary)' }} />
            </div>
            <span className="text-[12px] font-semibold w-[80px] text-right shrink-0" style={{ color: '#D97706', fontFamily: FONT_MONO }}>+₹{l.amount.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[var(--hz-surface)]">
        <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>Total</span>
        <span className="text-[15px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>+₹{cmp.potentialImpact.toLocaleString('en-IN')}</span>
      </div>
    </SectionCard>
  )
}

// ─── Hozie explanation ────────────────────────────────────────────────────────

function HozieExplanation({ onAskHozie, className }: { onAskHozie: () => void; className?: string }) {
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-3', className].filter(Boolean).join(' ')} style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Explains</span>
      </div>
      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
        "Your plan shows approximately 40 sq ft more built-up area than the current project estimate. This may increase flooring, plastering, painting and selected material quantities."
      </p>
      <button onClick={onAskHozie} className="self-start h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
        Ask Hozie →
      </button>
    </div>
  )
}

// ─── What should change ───────────────────────────────────────────────────────

function WhatShouldChange({ affectedCount, onReviewAll, onApplyRecommended, onKeepCurrent, className }: {
  affectedCount: number
  onReviewAll: () => void
  onApplyRecommended: () => void
  onKeepCurrent: () => void
  className?: string
}) {
  return (
    <SectionCard eyebrow="What Should Change?" className={className}>
      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Hozie found {affectedCount} items that may need updating.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={onReviewAll} className="flex flex-col items-start gap-1 rounded-[12px] p-4 text-left cursor-pointer border border-[var(--hz-border)] bg-transparent hover:bg-[var(--hz-surface)] transition-colors">
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Review All</span>
          <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Review each proposed change.</span>
        </button>
        <button onClick={onApplyRecommended} className="flex flex-col items-start gap-1 rounded-[12px] p-4 text-left cursor-pointer border-2" style={{ borderColor: 'var(--hz-primary)', backgroundColor: 'var(--hz-primary-wash)' }}>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>Apply Recommended</span>
          <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Apply only high-confidence changes.</span>
        </button>
        <button onClick={onKeepCurrent} className="flex flex-col items-start gap-1 rounded-[12px] p-4 text-left cursor-pointer border border-[var(--hz-border)] bg-transparent hover:bg-[var(--hz-surface)] transition-colors">
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Keep Current Estimate</span>
          <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Keep the existing estimate unchanged.</span>
        </button>
      </div>
    </SectionCard>
  )
}

function ApplyRecommendedModal({ count, onConfirm, onCancel }: { count: number; onConfirm: () => void; onCancel: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-rec-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="apply-rec-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Apply Hozie's recommended changes?</h2>
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          This selects {count} high-confidence items for review. Nothing in your estimate or BOQ changes until you review and create a revision.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Select {count} items</button>
        </div>
      </div>
    </>
  )
}

// ─── Change selection summary + confirmation ─────────────────────────────────

function ChangeSelectionBar({ selectedCount, selectedImpact, onSelectAll, onClearAll, onReview, className }: {
  selectedCount: number
  selectedImpact: number
  onSelectAll: () => void
  onClearAll: () => void
  onReview: () => void
  className?: string
}) {
  return (
    <div className={['bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Selected changes</span>
          <span className="text-[18px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>{selectedCount}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Potential impact</span>
          <span className="text-[18px] font-semibold leading-none" style={{ color: '#D97706', fontFamily: FONT_HEAD }}>+₹{selectedImpact.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <button onClick={onSelectAll} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Select all</button>
        <span className="text-[var(--hz-border-strong)]">·</span>
        <button onClick={onClearAll} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}>Clear all</button>
        <button
          onClick={onReview}
          disabled={selectedCount === 0}
          className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
        >
          Review selected changes →
        </button>
      </div>
    </div>
  )
}

function ChangeReviewPanel({ cmp, selectedCount, selectedImpact, onCreateRevision, onBack }: {
  cmp: PlanEstimateComparison
  selectedCount: number
  selectedImpact: number
  onCreateRevision: () => void
  onBack: () => void
}) {
  const revised = calculateRevisedRange(cmp.estimateMin, cmp.estimateMax, selectedImpact)
  return (
    <div className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-4" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Review Selected Changes</span>
        <button onClick={onBack} className="text-[12px] font-medium cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}>← Back to selection</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Current estimate</span>
          <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{formatLakh(cmp.estimateMin)}–{formatLakh(cmp.estimateMax)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Selected changes</span>
          <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{selectedCount}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Potential impact</span>
          <span className="text-[14px] font-semibold" style={{ color: '#D97706', fontFamily: FONT_BODY }}>+₹{selectedImpact.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Potential revised estimate</span>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>{formatLakh(revised.min)}–{formatLakh(revised.max)}</span>
        </div>
      </div>
      <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Creating a revision builds Estimate V3 (Draft) and BOQ V4 — Estimate V2 and BOQ V3 stay untouched until you confirm.
      </p>
      <button onClick={onCreateRevision} className="self-start h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
        Create Estimate Revision →
      </button>
    </div>
  )
}

// ─── Confidence + validation ──────────────────────────────────────────────────

function ConfidenceSection({ cmp, className }: { cmp: PlanEstimateComparison; className?: string }) {
  return (
    <SectionCard eyebrow="Comparison Confidence" className={className}>
      <div className="flex flex-col gap-3.5">
        <ProgressStat label="Floor area" value={91} />
        <ProgressStat label="Plaster area" value={84} />
        <ProgressStat label="Electrical points" value={72} />
        <div className="pt-1 border-t border-[var(--hz-surface)]">
          <ProgressStat label="Overall" value={cmp.overallConfidence} />
        </div>
      </div>
      <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Confidence reflects how clearly the plan information could be interpreted. It does not replace professional verification.
      </p>
    </SectionCard>
  )
}

function PlanValidationNotice() {
  return (
    <div className="flex items-start gap-3 rounded-[12px] p-4" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
      <span className="shrink-0 mt-0.5" style={{ color: 'var(--hz-ink-muted)' }}><IcoShield /></span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Plan Validation</span>
        <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          AI measurements are preliminary. Before construction or contractor bidding, verify important quantities against the final architectural and structural drawings.
        </p>
      </div>
    </div>
  )
}

// ─── Error / no-differences / loading states ──────────────────────────────────

function ComparisonError({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <div role="alert" className="w-full max-w-[560px] mx-auto bg-[var(--hz-surface)] rounded-[24px] border border-[var(--hz-border)] px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: 'var(--hz-danger)' }}><IcoWarning /></span>
      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Unable to compare the plan with your current estimate.</h2>
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1 w-full sm:w-auto">
        <button onClick={onBack} className="h-11 px-6 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Back to measurements</button>
        <button onClick={onRetry} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Retry</button>
      </div>
    </div>
  )
}

function NoDifferences({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-[560px] mx-auto bg-[var(--hz-surface)] rounded-[24px] border border-[var(--hz-border)] px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)' }}><IcoCheck /></span>
      <h2 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Your plan measurements are consistent with the current estimate.</h2>
      <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>No changes recommended.</p>
      <button onClick={onBack} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Back to measurements</button>
    </div>
  )
}

// ─── Download ─────────────────────────────────────────────────────────────────

function downloadComparison(cmp: PlanEstimateComparison) {
  const lines = [
    `Houzeify — Plan vs Estimate Comparison`,
    `Generated: ${cmp.createdAt}`,
    ``,
    `Plan area: ${cmp.planAreaSqft} sq ft`,
    `Estimate area: ${cmp.estimateAreaSqft} sq ft`,
    `Difference: +${cmp.planAreaSqft - cmp.estimateAreaSqft} sq ft`,
    `Overall impact: ${cmp.overallImpact}`,
    ``,
    `BOQ items affected: ${cmp.affectedItemCount}`,
    `Matched items: ${cmp.matchedItemCount}`,
    `Needs review: ${cmp.reviewItemCount + cmp.significantItemCount}`,
    `Significant difference: ${cmp.significantItemCount}`,
    ``,
    `Potential cost impact: +₹${cmp.potentialImpact.toLocaleString('en-IN')} (material +₹${cmp.materialImpact.toLocaleString('en-IN')}, labour +₹${cmp.labourImpact.toLocaleString('en-IN')})`,
    `Current estimate range: ${formatLakh(cmp.estimateMin)} — ${formatLakh(cmp.estimateMax)}`,
    ``,
    `Affected items:`,
    ...cmp.comparisons.filter(c => c.status !== 'matched').map(c => `  - [${categoryLabel(c.category)}] ${c.label}: ${c.estimateValue} → ${c.planValue} (${c.difference}), impact ${c.totalImpact > 0 ? `+₹${c.totalImpact}` : '—'}, ${c.confidence}% confidence, ${statusLabel(c.status)}`),
    ``,
    `Matched items:`,
    ...cmp.comparisons.filter(c => c.status === 'matched').map(c => `  - ${c.label}`),
    ``,
    `Nothing in this report has been applied to your estimate or BOQ. This is a proposed change set pending your review and approval.`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `plan-vs-estimate-comparison.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PlanVsEstimateScreen({
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
  const [cmp] = useState<PlanEstimateComparison>(() => comparePlanWithEstimate(documentId, projectId))
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [detailItem, setDetailItem] = useState<ComparisonItem | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const changeSectionRef = useRef<HTMLDivElement>(null)

  const affectedItems = useMemo(() => cmp.comparisons.filter(c => c.status !== 'matched'), [cmp.comparisons])
  const matchedItems = useMemo(() => cmp.comparisons.filter(c => c.status === 'matched'), [cmp.comparisons])
  const itemsByCategory = useMemo(() => {
    const map = new Map<ComparisonCategory, ComparisonItem[]>()
    for (const item of affectedItems) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return map
  }, [affectedItems])

  const selectedItems = affectedItems.filter(i => selected[i.id])
  const selectedCount = selectedItems.length
  const selectedImpact = selectedItems.reduce((sum, i) => sum + i.totalImpact, 0)

  const toggleSelect = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  const selectAll = () => setSelected(Object.fromEntries(affectedItems.map(i => [i.id, true])))
  const clearAll = () => setSelected({})

  const scrollToChanges = () => changeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const applyRecommended = () => {
    const recommended = affectedItems.filter(i => i.confidence >= 85 && i.totalImpact > 0)
    setSelected(Object.fromEntries(recommended.map(i => [i.id, true])))
    setShowApplyModal(false)
    scrollToChanges()
  }

  const backToMeasurements = () => onNavigate('plan-measurement', { document_id: cmp.planAnalysisId.replace('analysis-', ''), project_id: cmp.projectId })
  const retry = () => onNavigate('plan-analysis-loading', { document_id: cmp.planAnalysisId.replace('analysis-', ''), project_id: cmp.projectId })
  const askHozie = () => onNavigate('ai-advisor', {
    project_id: projectId || boqOverview.projectId,
    estimate_version_id: boqActiveVersion.estimateVersionId,
    boq_version_id: boqActiveVersion.id,
  })
  const viewMeasurement = () => onNavigate('plan-measurement', { document_id: cmp.planAnalysisId.replace('analysis-', ''), project_id: cmp.projectId })
  const viewBOQItem = (item: ComparisonItem) => onNavigate('boq-item-detail', item.boqItemId ? { boq_item_id: item.boqItemId } : {})
  const createRevision = () => onNavigate('estimate-update', {
    project_id: cmp.projectId,
    document_id: cmp.planAnalysisId.replace('analysis-', ''),
    selected_count: String(selectedCount),
    potential_impact: String(selectedImpact),
  })

  if (cmp.status === 'error') {
 return (
      <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
        <div className="flex flex-1 min-h-0 relative z-10">
          <Sidebar active="plan" onNavigate={onNavigate} />
          <div className="flex flex-col flex-1 min-h-0">
            <main className="flex-1 overflow-y-auto flex items-center justify-center px-4">
              <ComparisonError onRetry={retry} onBack={backToMeasurements} />
            </main>
          </div>
        </div>
      </div>
    )
  }

  if (cmp.status === 'no-differences') {
    return (
      <div className="flex flex-col" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
        <div className="flex flex-1 min-h-0 relative z-10">
          <Sidebar active="plan" onNavigate={onNavigate} />
          <div className="flex flex-col flex-1 min-h-0">
            <main className="flex-1 overflow-y-auto flex items-center justify-center px-4">
              <NoDifferences onBack={backToMeasurements} />
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
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Plan vs Estimate</span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)', fontFamily: FONT_MONO }}>READY</span>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="plan" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Plan vs Estimate</h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)', fontFamily: FONT_MONO }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-success)' }} aria-hidden="true" /> Comparison Ready
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 pb-28 lg:pb-8">

              {/* Page header */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Plan vs Estimate</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>What changed?</h1>
                <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[620px]" style={{ fontFamily: FONT_BODY }}>
                  Hozie compared your plan measurements with the current estimate and identified the differences that may affect your project cost.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                    <span className="shrink-0" style={{ color: 'var(--hz-primary)' }}><IcoFile /></span> House_Floor_Plan.pdf
                  </span>
                  <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Estimate V2 · BOQ V{boqActiveVersion.versionNumber}</span>
                  <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button onClick={backToMeasurements} className="h-9 px-4 rounded-[10px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] cursor-pointer bg-[var(--hz-surface)] hover:bg-[var(--hz-surface-muted)] transition-colors inline-flex items-center gap-1.5" style={{ fontFamily: FONT_BODY }}>
                    <IcoBack /> Back to Measurements
                  </button>
                  <button onClick={() => downloadComparison(cmp)} className="h-9 px-4 rounded-[10px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] cursor-pointer bg-[var(--hz-surface)] hover:bg-[var(--hz-surface-muted)] transition-colors inline-flex items-center gap-1.5" style={{ fontFamily: FONT_BODY }}>
                    <IcoDownload /> Download Comparison
                  </button>
                </div>
              </div>

              <ComparisonSummary cmp={cmp} />
              <ComparisonStatusMetrics cmp={cmp} />

              {/* Category comparison sections */}
              <div ref={changeSectionRef} className="flex flex-col gap-4 scroll-mt-6">
                {CATEGORY_ORDER.filter(c => itemsByCategory.has(c)).map(category => (
                  <CategorySection
                    key={category}
                    category={category}
                    items={itemsByCategory.get(category) ?? []}
                    selected={selected}
                    onToggleSelect={toggleSelect}
                    onOpenDetail={setDetailItem}
                  />
                ))}
              </div>

              <MatchedItemsSection items={matchedItems} />

              <ChangeSelectionBar
                selectedCount={selectedCount}
                selectedImpact={selectedImpact}
                onSelectAll={selectAll}
                onClearAll={clearAll}
                onReview={() => setShowReview(true)}
              />

              {showReview && (
                <ChangeReviewPanel
                  cmp={cmp}
                  selectedCount={selectedCount}
                  selectedImpact={selectedImpact}
                  onCreateRevision={createRevision}
                  onBack={() => setShowReview(false)}
                />
              )}

              <WhatShouldChange
                affectedCount={affectedItems.length}
                onReviewAll={scrollToChanges}
                onApplyRecommended={() => setShowApplyModal(true)}
                onKeepCurrent={backToMeasurements}
              />

              {/* Cost impact + breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CostImpactSection cmp={cmp} className="lg:self-start" />
                <ImpactBreakdown cmp={cmp} className="lg:self-start" />
              </div>

              <HozieExplanation onAskHozie={askHozie} />

              {/* Confidence + validation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConfidenceSection cmp={cmp} className="lg:self-start" />
                <PlanValidationNotice />
              </div>
            </div>
          </main>

          {/* Sticky selection summary (mobile) */}
          <div className="lg:hidden sticky bottom-0 z-20 bg-[var(--hz-surface)] border-t border-[var(--hz-border)] px-4 py-3 flex items-center gap-3" style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}>
            <div className="flex flex-col leading-tight shrink-0">
              <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{selectedCount} changes</span>
              <span className="text-[11px]" style={{ color: '#D97706', fontFamily: FONT_BODY }}>+₹{selectedImpact.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={() => setShowReview(true)}
              disabled={selectedCount === 0}
              className="flex-1 h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
            >
              Review changes →
            </button>
          </div>
        </div>
      </div>

      {detailItem && (
        <DifferenceDrawer
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onViewMeasurement={() => { setDetailItem(null); viewMeasurement() }}
          onViewBOQItem={() => { setDetailItem(null); viewBOQItem(detailItem) }}
          onAskHozie={() => { setDetailItem(null); askHozie() }}
        />
      )}

      {showApplyModal && (
        <ApplyRecommendedModal
          count={affectedItems.filter(i => i.confidence >= 85 && i.totalImpact > 0).length}
          onConfirm={applyRecommended}
          onCancel={() => setShowApplyModal(false)}
        />
      )}
    </div>
  )
}
