import { useEffect, useMemo, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import ConfidenceBadge from '@/shared/components/ConfidenceBadge'
import MetricCard from '@/shared/components/MetricCard'
import HozieInsightCard from '@/shared/components/HozieInsightCard'
import EstimateFooter from '@/shared/components/EstimateFooter'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import { labourCategories, labourEstimates, type LabourCategory, type LabourEstimate } from '@/data/labour'
import { boqOverview } from '@/data/boqOverview'
import Sidebar from '@/shared/components/Sidebar'
import { getLatestEstimateVersion } from '@/data/estimateVersions'

function formatLakh(amountRupees: number): string {
  return `₹${(amountRupees / 100000).toFixed(1)}L`
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
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="6.5" r="4.5"/><line x1="10" y1="10" x2="13.5" y2="13.5"/>
  </svg>
)
const IcoChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 4.5L6 8l3.5-3.5"/>
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
const IcoEmptyBox = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8"/><line x1="12" y1="13" x2="12" y2="21"/>
  </svg>
)
const IcoWorkers = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="5" r="2.2"/><path d="M1.5 14c0-2.6 1.8-4 4-4s4 1.4 4 4"/>
    <circle cx="11" cy="5.5" r="1.8" strokeWidth="1.2"/><path d="M9.8 10.3c1.8.3 3.2 1.6 3.2 3.7" strokeWidth="1.2"/>
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



// ─── Filters ──────────────────────────────────────────────────────────────────

type SortKey = 'cost' | 'workers' | 'duration'

function SelectField({ label, value, onChange, options, minWidth = 132 }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  minWidth?: number
}) {
  return (
    <label className="relative flex items-center shrink-0" style={{ minWidth }}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full h-9 pl-3 pr-8 rounded-[10px] border border-[#E3DDD7] bg-white text-[13px] text-[#242326] cursor-pointer outline-none hover:border-[#E3DDD7] focus:border-[#722ED1] transition-colors"
        style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[#68636D]"><IcoChevronDown /></span>
    </label>
  )
}

function LabourFilters({
  search, onSearch, category, onCategory, sort, onSort,
}: {
  search: string; onSearch: (v: string) => void
  category: 'all' | LabourCategory; onCategory: (v: 'all' | LabourCategory) => void
  sort: SortKey; onSort: (v: SortKey) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
      <label className="relative flex-1 min-w-0 flex items-center">
        <span className="sr-only">Search workers</span>
        <span className="absolute left-3 text-[#9A949D]"><IcoSearch /></span>
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search workers..."
          className="w-full h-9 pl-9 pr-3 rounded-[10px] border border-[#E3DDD7] bg-white text-[13px] text-[#242326] placeholder:text-[#9A949D] outline-none focus:border-[#722ED1] transition-colors"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
        />
      </label>

      <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0" style={{ scrollbarWidth: 'none' }}>
        <SelectField
          label="Filter by trade category"
          value={category}
          onChange={v => onCategory(v as 'all' | LabourCategory)}
          options={[{ value: 'all', label: 'All trades' }, ...labourCategories.map(c => ({ value: c, label: c }))]}
          minWidth={132}
        />
        <SelectField
          label="Sort by"
          value={sort}
          onChange={v => onSort(v as SortKey)}
          options={[
            { value: 'cost', label: 'Sort: Cost' },
            { value: 'workers', label: 'Sort: Workers' },
            { value: 'duration', label: 'Sort: Duration' },
          ]}
          minWidth={140}
        />
      </div>
    </div>
  )
}

// ─── Table (desktop) ────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-[#FFFFFF]">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-4" style={{ height: 64 }}>
          <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: i === 0 ? '70%' : '50%' }} />
        </td>
      ))}
    </tr>
  )
}

function LabourTableRow({ item, onOpen }: { item: LabourEstimate; onOpen: (m: LabourEstimate) => void }) {
  return (
    <tr
      onClick={() => onOpen(item)}
      className="border-b border-[#FFFFFF] cursor-pointer transition-colors hover:bg-[#FFFFFF]"
      style={{ minHeight: 64 }}
    >
      <td className="px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.trade}</span>
          <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.categoryLabel ?? item.category}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-[13px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.workers}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.estimatedDays} days</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{formatINR(item.dailyRate)}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{formatINR(item.estimatedCost)}</span>
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <ConfidenceBadge level={item.confidence} />
      </td>
      <td className="px-4 py-4 text-right">
        <button
          onClick={e => { e.stopPropagation(); onOpen(item) }}
          aria-label={`View details for ${item.trade}`}
          className="inline-flex items-center gap-1 text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
          style={{ color: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}
        >
          <span className="hidden lg:inline">View details →</span>
          <span className="lg:hidden" aria-hidden="true">→</span>
        </button>
      </td>
    </tr>
  )
}

function LabourTable({ items, loading, onOpen }: { items: LabourEstimate[]; loading: boolean; onOpen: (m: LabourEstimate) => void }) {
  return (
    <div className="hidden md:block bg-white overflow-hidden" style={{ border: '1px solid #E3DDD7', borderRadius: 16 }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 720 }}>
          <thead>
            <tr style={{ backgroundColor: '#F4F0EC' }}>
              {['Trade', 'Workers', 'Estimated Days', 'Rate / Day', 'Estimated Cost', 'Confidence', 'Action'].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={['px-4 py-3 text-left text-[12px] sm:text-[12px] uppercase tracking-[0.08em] text-[#68636D]', i === 5 ? 'hidden lg:table-cell' : '', i === 6 ? 'text-right' : ''].join(' ')}
                  style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : items.map(item => <LabourTableRow key={item.id} item={item} onOpen={onOpen} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Cards (mobile) ───────────────────────────────────────────────────────────

function LabourCard({ item, onOpen }: { item: LabourEstimate; onOpen: (m: LabourEstimate) => void }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E3DDD7] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[14px] font-semibold text-[#242326] truncate" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.trade}</span>
          <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.categoryLabel ?? item.category}</span>
        </div>
        <ConfidenceBadge level={item.confidence} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Workers</span>
          <span className="text-[13px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.workers}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Duration</span>
          <span className="text-[13px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.estimatedDays} days</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Rate/day</span>
          <span className="text-[13px] text-[#242326]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{formatINR(item.dailyRate)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimated Cost</span>
          <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{formatINR(item.estimatedCost)}</span>
        </div>
      </div>
      <button
        onClick={() => onOpen(item)}
        aria-label={`View details for ${item.trade}`}
        className="h-9 rounded-[10px] border border-[#E3DDD7] text-[12px] font-semibold cursor-pointer bg-transparent hover:bg-[#FFFFFF] transition-colors"
        style={{ color: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        View details →
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[14px] border border-[#E3DDD7] p-4 flex flex-col gap-3">
      <div className="h-3.5 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: '55%' }} />
      <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: '35%' }} />
      <div className="h-9 rounded-[10px] animate-pulse" style={{ backgroundColor: '#F4F0EC' }} />
    </div>
  )
}

// ─── Empty / Error states ───────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center bg-white rounded-[16px] border border-[#E3DDD7]">
      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F4F0EC', color: '#9A949D' }}>
        <IcoEmptyBox />
      </div>
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        No labour trades match your filters.
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center bg-white rounded-[16px] border border-[#E3DDD7]">
      <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
        <IcoAlert />
      </div>
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
        Unable to load labour estimate. Try again.
      </p>
      <button
        onClick={onRetry}
        className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0"
        style={{ backgroundColor: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}
      >
        Retry
      </button>
    </div>
  )
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function LabourDetailDrawer({ item, onClose, onAskHozie }: { item: LabourEstimate | null; onClose: () => void; onAskHozie: () => void }) {
  const open = item !== null
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={['fixed inset-0 bg-black transition-opacity duration-200 z-40', open ? 'opacity-30 pointer-events-auto' : 'opacity-0 pointer-events-none'].join(' ')}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item ? `${item.trade} details` : 'Labour details'}
        className={[
          'fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:bottom-0 md:top-0',
          'w-full md:w-[420px] max-h-[85vh] md:max-h-none',
          'bg-white z-50 flex flex-col rounded-t-[20px] md:rounded-t-none md:rounded-l-[20px]',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full',
        ].join(' ')}
        style={{ boxShadow: '-8px 0 40px rgba(36,35,38,0.12)' }}
      >
        {item && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3DDD7] shrink-0">
              <span className="text-[12px] uppercase tracking-[0.10em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Labour Detail</span>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close labour details"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer border-0 bg-transparent transition-colors"
              >
                <IcoClose />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
              <div>
                <h2 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{item.trade}</h2>
                <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>Trade: {item.categoryLabel ?? item.category}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: '#FFFFFF' }}>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimated Workers</span>
                  <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{item.workers}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: '#FFFFFF' }}>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimated Duration</span>
                  <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{item.estimatedDays} working days</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-[12px] col-span-2" style={{ backgroundColor: '#FFFFFF' }}>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Rate</span>
                  <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>{formatINR(item.dailyRate)} / day</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 p-4 rounded-[12px]" style={{ backgroundColor: '#F9F5FF' }}>
                <span className="text-[12px] uppercase tracking-[0.08em] text-[#722ED1]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimated Cost</span>
                <span className="text-[26px] font-semibold" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif', color: '#722ED1' }}>{formatINR(item.estimatedCost)}</span>
                <span className="text-[12px] text-[#722ED1]/70" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                  {item.workers} workers × {item.estimatedDays} days × {formatINR(item.dailyRate)}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Calculation basis</span>
                <p className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>{item.calculationBasis}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Confidence</span>
                  <ConfidenceBadge level={item.confidence} />
                </div>
              </div>

              <HozieInsightCard message={`“${item.note}”`} />
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-[#E3DDD7] flex gap-2.5">
              <button
                className="flex-1 h-10 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors"
                style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
              >
                Edit assumption
              </button>
              <button
                onClick={onAskHozie}
                className="flex-1 h-10 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
                style={{ backgroundColor: '#722ED1', fontFamily: '"Open Sans:Regular", sans-serif' }}
              >
                Ask Hozie
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─── Labour cost summary (with share-of-total progress) ─────────────────────

function LabourCostSummary({ total, range, sharePct }: { total: string; range: string; sharePct: number }) {
  return (
    <div
      className="bg-white rounded-[20px] border border-[#E3DDD7] p-6 sm:p-7 flex flex-col gap-4"
      style={{
        boxShadow: '0 2px 24px rgba(243,234,255,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        background: 'linear-gradient(135deg, rgba(243,234,255,0.10) 0%, #ffffff 55%)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
            Estimated Labour Cost
          </span>
          <div className="text-[34px] sm:text-[40px] font-semibold leading-none" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif', color: '#242326' }}>
            {total}
          </div>
          <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
            Expected range: {range}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Labour Share</span>
          <span className="text-[20px] font-semibold" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif', color: '#722ED1' }}>{sharePct}%</span>
          <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>of total construction estimate</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F3EAFF' }}>
        <div className="h-full rounded-full" style={{ width: `${sharePct}%`, backgroundColor: '#722ED1', transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'loading' | 'ready' | 'error'

export default function LabourEstimateScreen({
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
  // 11D — data below is derived synchronously from projectId/estimateVersions.ts
  // (no async work happens), so status starts 'ready' immediately rather than
  // behind an artificial delay. 'error' stays defined but unreachable, same as
  // elsewhere in this codebase, in case a real failure path is ever wired.
  const [status, setStatus] = useState<ScreenStatus>('ready')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | LabourCategory>('all')
  const [sort, setSort] = useState<SortKey>('cost')
  const [selected, setSelected] = useState<LabourEstimate | null>(null)

  // Real, requirements-driven total when this project has a real Estimate
  // Version — same "scale the static rows to the real total" approach as
  // MaterialEstimateScreen, so individual labour categories stay genuine
  // line items sized to this project rather than replaced outright.
  const version = projectId ? getLatestEstimateVersion(projectId) : undefined
  const realLabourCost = version?.costBreakdown.labourCost
  const staticLabourSum = useMemo(() => labourEstimates.reduce((s, i) => s + i.estimatedCost, 0), [])
  const labourScaleFactor = realLabourCost ? realLabourCost / staticLabourSum : 1
  const totalLabourLabel = realLabourCost ? formatLakh(realLabourCost) : '₹8.4L'
  const totalLabourRange = realLabourCost
    ? `${formatLakh(Math.round(realLabourCost * 0.93))} — ${formatLakh(Math.round(realLabourCost * 1.095))}`
    : '₹7.8L — ₹9.2L'
  const avgTotal = version?.averageCost ?? 3250000
  const labourSharePct = realLabourCost ? Math.round((realLabourCost / avgTotal) * 100) : 28

  const filtered = useMemo(() => {
    let list = labourEstimates.map(i => (labourScaleFactor === 1 ? i : { ...i, estimatedCost: Math.round(i.estimatedCost * labourScaleFactor) }))
    if (category !== 'all') list = list.filter(i => i.category === category)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(i => i.trade.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    }
    const sorted = [...list]
    if (sort === 'cost') sorted.sort((a, b) => b.estimatedCost - a.estimatedCost)
    else if (sort === 'workers') sorted.sort((a, b) => b.workers - a.workers)
    else sorted.sort((a, b) => b.estimatedDays - a.estimatedDays)
    return sorted
  }, [search, category, sort, labourScaleFactor])

  const isEmpty = status === 'ready' && filtered.length === 0
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <button
          onClick={() => onNavigate('estimate-dashboard')}
          aria-label="Back to estimate"
          className="flex items-center gap-1 text-[#68636D] border-0 bg-transparent cursor-pointer text-[13px]"
          style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
        >
          <IcoChevronLeft /> Estimate
        </button>
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>Labour Estimate</span>
        <button aria-label="Download PDF" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
                Labour Estimate
              </h1>
              <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                {projectName} · {location} · {area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('estimate-dashboard')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
              >
                <IcoChevronLeft /> Back to estimate
              </button>
              <button
                aria-label="Download PDF"
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}
              >
                <IcoDownload /> <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Intro */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <div>
                  <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                    Labour Estimate
                  </span>
                  <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: '"Google Sans Flex:SemiBold", sans-serif' }}>
                    Who will build it.
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 mt-2 max-w-[520px]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>
                    Hozie estimates the workers, working days and labour cost required for your project.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#F3EAFF] self-start shrink-0" style={{ border: '1px solid rgba(243,234,255,0.10)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#722ED1]" style={{ animation: 'hozieStatusPulse 2.5s ease-in-out infinite' }} />
                  <span className="text-[11px] font-medium text-[#722ED1]" style={{ fontFamily: '"Open Sans:Regular", sans-serif' }}>82% AI confidence</span>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                <MetricCard eyebrow="Total Labour Cost" value={totalLabourLabel} icon={<IcoWorkers />} />
                <MetricCard eyebrow="Workers" value="8" />
                <MetricCard eyebrow="Estimated Days" value="210" />
                <MetricCard eyebrow="Average Daily Cost" value="₹4,000" />
              </div>

              {/* Hozie insight */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}>
                <HozieInsightCard
                  message="Masonry and structural work currently account for the largest share of labour cost. Increasing crew size may reduce duration but can increase daily labour expense."
                  actionLabel="Ask Hozie →"
                  onAction={() => onNavigate('ai-advisor', { project_id: projectId || boqOverview.projectId })}
                />
              </div>

              {/* Filters */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.18s both' }}>
                <LabourFilters
                  search={search} onSearch={setSearch}
                  category={category} onCategory={setCategory}
                  sort={sort} onSort={setSort}
                />
              </div>

              {/* Table / cards / states */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.22s both' }}>
                {status === 'error' ? (
                  <ErrorState onRetry={() => setStatus('loading')} />
                ) : isEmpty ? (
                  <EmptyState />
                ) : (
                  <>
                    <LabourTable items={filtered} loading={status === 'loading'} onOpen={setSelected} />
                    <div className="md:hidden flex flex-col gap-3">
                      {status === 'loading'
                        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                        : filtered.map(item => <LabourCard key={item.id} item={item} onOpen={setSelected} />)}
                    </div>
                  </>
                )}
              </div>

              {/* Labour cost summary */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.26s both' }}>
                <LabourCostSummary total={totalLabourLabel} range={totalLabourRange} sharePct={labourSharePct} />
              </div>

            </div>
          </main>

          <EstimateFooter
            label="Estimated Labour Cost"
            value={totalLabourLabel}
            range={`RANGE ${totalLabourRange}`}
            // Flow 04 (New Build) canonical order: Labour Estimate → Estimate
            // Comparison → Estimate Revision → Final Estimate. Previously went
            // to 'construction-stages', which isn't part of that canonical
            // journey — that screen is untouched and still fully reachable
            // elsewhere, just no longer the default next step from here.
            primaryLabel="Continue to Estimate Comparison →"
            onPrimary={() => onNavigate('estimate-comparison', { project_name: projectName, location, ...(projectId ? { project_id: projectId } : {}) })}
            secondaryLabel="Back to Materials"
            onSecondary={() => onNavigate('material-estimate', { project_name: projectName, location })}
          />
        </div>
      </div>

      <LabourDetailDrawer item={selected} onClose={() => setSelected(null)} onAskHozie={() => onNavigate('ai-advisor', { project_id: projectId || boqOverview.projectId })} />
    </div>
  )
}
