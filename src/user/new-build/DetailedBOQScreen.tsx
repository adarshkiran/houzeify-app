import { useEffect, useMemo, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import ConfidenceBadge from '@/shared/components/ConfidenceBadge'
import MetricCard from '@/shared/components/MetricCard'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import { type BOQItem, type BOQCategoryDetailed } from '@/data/boqDetail'
// Customer Implementation 10I — project-scoped BOQ access layer; see
// boqGeneration.ts for the Estimate → BOQ derivation method.
import { getBOQCategoriesForProject, getBOQForProject, getEstimateVersionForBOQ } from '@/data/boqGeneration'
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
const IcoExport = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="10" height="10" rx="1.5"/><path d="M5 7h4M7 5l2 2-2 2"/>
  </svg>
)
const IcoHistory = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7.5" r="5.5"/><path d="M7 4.5v3l2.2 1.3"/><path d="M2.2 3.5L1.8 6l2.3-.6"/>
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
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="6.5" r="4.5"/><line x1="10" y1="10" x2="13.5" y2="13.5"/>
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
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8"/><line x1="12" y1="13" x2="12" y2="21"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
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



// ─── Toolbar ──────────────────────────────────────────────────────────────────

type SortKey = 'category' | 'cost' | 'quantity' | 'name'
type CostFilter = 'both' | 'materials' | 'labour'
type ViewMode = 'table' | 'compact'

function SelectField({ label, value, onChange, options, minWidth = 140 }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; minWidth?: number
}) {
  return (
    <label className="relative flex items-center shrink-0" style={{ minWidth }}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full h-9 pl-3 pr-8 rounded-[10px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13px] text-[var(--hz-ink)] cursor-pointer outline-none hover:border-[var(--hz-border)] focus:border-[var(--hz-primary)] transition-colors"
        style={{ fontFamily: '"Inter Variable", sans-serif' }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-[var(--hz-ink-muted)]"><IcoChevronDown /></span>
    </label>
  )
}

function BOQToolbar({
  categories, search, onSearch, category, onCategory, costFilter, onCostFilter, sort, onSort, view, onView,
}: {
  categories: BOQCategoryDetailed[]
  search: string; onSearch: (v: string) => void
  category: 'all' | string; onCategory: (v: string) => void
  costFilter: CostFilter; onCostFilter: (v: CostFilter) => void
  sort: SortKey; onSort: (v: SortKey) => void
  view: ViewMode; onView: (v: ViewMode) => void
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2.5">
      <label className="relative flex-1 min-w-0 flex items-center">
        <span className="sr-only">Search BOQ items</span>
        <span className="absolute left-3 text-[var(--hz-ink-subtle)]"><IcoSearch /></span>
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search BOQ items..."
          className="w-full h-9 pl-9 pr-3 rounded-[10px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13px] text-[var(--hz-ink)] placeholder:text-[var(--hz-ink-subtle)] outline-none focus:border-[var(--hz-primary)] transition-colors"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        />
      </label>
      <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <SelectField
          label="Filter by category" value={category} onChange={onCategory}
          options={[{ value: 'all', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
          minWidth={160}
        />
        <SelectField
          label="Filter by cost type" value={costFilter} onChange={v => onCostFilter(v as CostFilter)}
          options={[{ value: 'both', label: 'Materials + Labour' }, { value: 'materials', label: 'Materials' }, { value: 'labour', label: 'Labour' }]}
          minWidth={168}
        />
        <SelectField
          label="Sort by" value={sort} onChange={v => onSort(v as SortKey)}
          options={[{ value: 'category', label: 'Sort: Category' }, { value: 'cost', label: 'Sort: Cost' }, { value: 'quantity', label: 'Sort: Quantity' }, { value: 'name', label: 'Sort: Item Name' }]}
          minWidth={148}
        />
        <div role="tablist" aria-label="View mode" className="inline-flex items-center gap-0.5 p-0.5 rounded-[10px] shrink-0" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
          {(['table', 'compact'] as ViewMode[]).map(v => (
            <button
              key={v} role="tab" aria-selected={view === v} onClick={() => onView(v)}
              className="h-8 px-3 rounded-[8px] text-[12px] font-semibold cursor-pointer border-0 capitalize"
              style={{
                fontFamily: '"Inter Variable", sans-serif',
                backgroundColor: view === v ? 'var(--hz-surface)' : 'transparent',
                color: view === v ? 'var(--hz-primary)' : '#808080',
                boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Item row (desktop) ───────────────────────────────────────────────────────

function ItemRow({ item, costFilter, compact, onOpen }: { item: BOQItem; costFilter: CostFilter; compact: boolean; onOpen: () => void }) {
  const py = compact ? 'py-2' : 'py-3.5'
  return (
    <tr onClick={onOpen} className="cursor-pointer hover:bg-[var(--hz-surface)] transition-colors" style={{ borderTop: '1px solid var(--hz-surface)' }}>
      <td className={`px-4 ${py}`}>
        <span className="text-[12px] font-semibold text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{String(item.itemNumber).padStart(2, '0')}</span>
      </td>
      <td className={`px-4 ${py}`}>
        <span className="text-[13px] font-semibold text-[var(--hz-ink)] block" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.name}</span>
        {!compact && <span className="hidden lg:block text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.description}</span>}
      </td>
      <td className={`px-4 ${py}`}>
        <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.quantity.toLocaleString('en-IN')}</span>
      </td>
      <td className={`px-4 ${py}`}>
        <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{item.unit}</span>
      </td>
      {costFilter !== 'labour' && (
        <td className={`px-4 ${py}`}>
          <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{formatINR(item.materialCost)}</span>
        </td>
      )}
      {costFilter !== 'materials' && (
        <td className={`px-4 ${py}`}>
          <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{formatINR(item.labourCost)}</span>
        </td>
      )}
      <td className={`px-4 ${py} text-right`}>
        <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(item.totalCost)}</span>
      </td>
    </tr>
  )
}

// ─── Item card (mobile) ────────────────────────────────────────────────────────

function ItemCard({ item, onOpen }: { item: BOQItem; onOpen: () => void }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[12px] border border-[var(--hz-border)] p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[12px] font-semibold text-[var(--hz-ink-subtle)] block" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{String(item.itemNumber).padStart(2, '0')}</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.name}</span>
        </div>
        <span className="text-[14px] font-semibold text-[var(--hz-ink)] shrink-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(item.totalCost)}</span>
      </div>
      <div className="flex items-center gap-4 text-[12px]" style={{ fontFamily: '"Inter Variable", sans-serif', color: 'var(--hz-ink-muted)' }}>
        <span>{item.quantity.toLocaleString('en-IN')} {item.unit}</span>
        <span>Mat. {formatINR(item.materialCost)}</span>
        <span>Lab. {formatINR(item.labourCost)}</span>
      </div>
      <button
        onClick={onOpen}
        className="h-8 rounded-[8px] border border-[var(--hz-border)] text-[12px] font-semibold cursor-pointer bg-transparent hover:bg-[var(--hz-surface)] transition-colors"
        style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
      >
        View details →
      </button>
    </div>
  )
}

// ─── Category section ──────────────────────────────────────────────────────────

function CategorySection({
  category, items, expanded, onToggle, costFilter, sort, view, onOpenItem,
}: {
  category: BOQCategoryDetailed
  items: BOQItem[]
  expanded: boolean
  onToggle: () => void
  costFilter: CostFilter
  sort: SortKey
  view: ViewMode
  onOpenItem: (item: BOQItem) => void
}) {
  const sortedItems = useMemo(() => {
    const list = [...items]
    if (sort === 'cost') list.sort((a, b) => b.totalCost - a.totalCost)
    else if (sort === 'quantity') list.sort((a, b) => b.quantity - a.quantity)
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [items, sort])

  const columns = ['#', 'Item', 'Quantity', 'Unit']
  if (costFilter !== 'labour') columns.push('Material Cost')
  if (costFilter !== 'materials') columns.push('Labour Cost')
  columns.push('Total')

  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] overflow-hidden" style={{ border: '1px solid var(--hz-border)' }}>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`boq-cat-${category.id}`}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${category.name} category`}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left cursor-pointer border-0 bg-transparent"
        style={{ backgroundColor: 'var(--hz-surface-muted)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[12px] font-semibold text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{String(category.order).padStart(2, '0')}</span>
          <span className="text-[14px] font-semibold text-[var(--hz-ink)] uppercase tracking-[0.02em]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{category.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{items.length} items</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(category.totalCost)}</span>
          <span className="text-[var(--hz-ink-muted)] transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}><IcoChevronDown /></span>
        </div>
      </button>

      {expanded && (
        <div id={`boq-cat-${category.id}`}>
          {items.length === 0 ? (
            <p className="text-[13px] text-[var(--hz-ink-subtle)] text-center py-8 m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>No items in this category.</p>
          ) : view === 'table' ? (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 680 }}>
                <thead>
                  <tr>
                    {columns.map((h, i) => (
                      <th key={h} scope="col" className={['px-4 py-2.5 text-left text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]', i === columns.length - 1 ? 'text-right' : ''].join(' ')} style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map(item => (
                    <ItemRow key={item.id} item={item} costFilter={costFilter} compact={false} onOpen={() => onOpenItem(item)} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 680 }}>
                <tbody>
                  {sortedItems.map(item => (
                    <ItemRow key={item.id} item={item} costFilter={costFilter} compact onOpen={() => onOpenItem(item)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="md:hidden flex flex-col gap-2.5 p-3">
            {sortedItems.map(item => <ItemCard key={item.id} item={item} onOpen={() => onOpenItem(item)} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Item detail drawer ────────────────────────────────────────────────────────

function ItemDetailDrawer({ item, categoryName, onClose, onAskHozie, onViewFullDetails, onEditItem }: {
  item: BOQItem | null; categoryName: string; onClose: () => void; onAskHozie: () => void; onViewFullDetails: () => void; onEditItem: () => void
}) {
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
        aria-label={item ? `${item.name} details` : 'BOQ item details'}
        className={[
          'fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:bottom-0 md:top-0',
          'w-full md:w-[420px] max-h-[88vh] md:max-h-none',
          'bg-[var(--hz-surface)] z-50 flex flex-col rounded-t-[20px] md:rounded-t-none md:rounded-l-[20px]',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full',
        ].join(' ')}
        style={{ boxShadow: '-8px 0 40px rgba(36,35,38,0.12)' }}
      >
        {item && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hz-border)] shrink-0">
              <span className="text-[12px] uppercase tracking-[0.10em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>BOQ Item {String(item.itemNumber).padStart(2, '0')}</span>
              <button ref={closeRef} onClick={onClose} aria-label="Close item details" className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors">
                <IcoClose />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{item.name}</h2>
                  <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Category: {categoryName}</span>
                </div>
                <button
                  onClick={onViewFullDetails}
                  className="shrink-0 text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline whitespace-nowrap"
                  style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
                >
                  View full details →
                </button>
              </div>

              <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Quantity</span>
                  <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{item.quantity.toLocaleString('en-IN')} {item.unit}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Material Rate</span>
                  <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>₹{item.materialRate.toLocaleString('en-IN')} / {item.unit}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Material Cost</span>
                  <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(item.materialCost)}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Labour Cost</span>
                  <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(item.labourCost)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 p-4 rounded-[12px]" style={{ backgroundColor: 'var(--hz-primary-wash)' }}>
                <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-primary)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Total</span>
                <span className="text-[26px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-primary)' }}>{formatINR(item.totalCost)}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Specification</span>
                <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.specification}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Calculation basis</span>
                <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.calculationBasis}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Confidence</span>
                <ConfidenceBadge level={item.confidence} />
              </div>

              <div className="rounded-[12px] p-4 flex flex-col gap-2" style={{ backgroundColor: 'var(--hz-primary-wash)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-[8px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={14} /></span>
                  <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-primary)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Note</span>
                </div>
                <p className="text-[12px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                  “Final {item.name.toLowerCase()} quantity must be confirmed against structural drawings.”
                </p>
              </div>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-[var(--hz-border)] flex gap-2.5">
              <button onClick={onEditItem} className="flex-1 h-10 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                Edit item
              </button>
              <button onClick={onAskHozie} className="flex-1 h-10 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>
                Ask Hozie
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─── Hozie check ──────────────────────────────────────────────────────────────

function HozieCheckCard({ onAskHozie, onAnalyzePlan }: { onAskHozie: () => void; onAnalyzePlan: () => void }) {
  return (
    <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Check</span>
      </div>
      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        “Your BOQ is ready for review. Structural quantities should be validated against the final structural drawings before contractor bidding.”
      </p>
      <div className="flex items-center gap-4">
        <button onClick={onAskHozie} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>Ask Hozie</button>
        <button onClick={onAnalyzePlan} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>Analyze Plan →</button>
      </div>
    </div>
  )
}

// ─── Readiness ────────────────────────────────────────────────────────────────

function ReadinessStrip() {
  const items = [
    { label: 'Estimate locked', done: true },
    { label: 'BOQ generated', done: true },
    { label: 'Items reviewed', done: false },
    { label: 'Floor plan analyzed', done: false },
    { label: 'Structural drawings', done: false },
  ]
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 flex flex-col gap-3">
      <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>BOQ Readiness</span>
      <div className="flex flex-col gap-2">
        {items.map(i => (
          <div key={i.label} className="flex items-center justify-between">
            <span className="text-[13px]" style={{ fontFamily: '"Inter Variable", sans-serif', color: i.done ? 'var(--hz-black)' : '#A1A1A1' }}>{i.label}</span>
            {i.done ? (
              <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary)' }}><IcoCheck /></span>
            ) : (
              <span className="w-[18px] h-[18px] rounded-full border" style={{ borderColor: 'var(--hz-border)' }} />
            )}
          </div>
        ))}
      </div>
      <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        Complete plan analysis before sending this BOQ to contractors.
      </p>
    </div>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function SkeletonCategory() {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 flex flex-col gap-2">
      <div className="h-3.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--hz-surface)', width: '30%' }} />
      <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--hz-surface)', width: '55%' }} />
    </div>
  )
}

function GeneratingPanel() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', animation: 'aiIconGlow 1.6s ease-in-out infinite' }}>
        <HIcon size={26} />
      </div>
      <span className="text-[12px] uppercase tracking-[0.10em]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: 'var(--hz-primary)' }}>Hozie is preparing your detailed BOQ…</span>
    </div>
  )
}

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)]">
      <span style={{ color: 'var(--hz-danger)' }}><IcoAlert /></span>
      <p className="text-[14px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Unable to load the BOQ. Try again.</p>
      <button onClick={onRetry} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>Try again</button>
    </div>
  )
}

// Customer Implementation 10I — genuine "no BOQ yet" state (this project
// has no Estimate to derive one from), never a proj-001 fallback.
function NoBOQPanel({ onGoBOQOverview }: { onGoBOQOverview: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)]">
      <span style={{ color: 'var(--hz-ink-subtle)' }}><IcoAlert /></span>
      <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>This project doesn&apos;t have an Estimate yet — a BOQ is generated from your Estimate.</p>
      <button onClick={onGoBOQOverview} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>Back to BOQ</button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'loading' | 'ready' | 'error' | 'no-boq'

export default function DetailedBOQScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  area = '2,600 sq ft',
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  area?: string
  /** Real id from projectData.project_id, if one already exists in this
   *  session. Customer Implementation 10I — no longer falls back to
   *  boqOverview.projectId ('proj-001'); a project with no Estimate shows
   *  a genuine no-BOQ state instead of a substitute project's data. */
  projectId?: string
}) {
  // Customer Implementation 10I — this project's own derived BOQ (or the
  // proj-001 reference fixture, unchanged, for that one legacy id).
  const categories = getBOQCategoriesForProject(projectId)
  const overview = getBOQForProject(projectId)
  const estimateVersion = getEstimateVersionForBOQ(projectId)

  // Customer Implementation 10L — categories are already resolved
  // synchronously above (boqGeneration.ts is an in-memory computation, not
  // a real async fetch), so status reflects that immediately rather than
  // behind an artificial 650ms timer.
  const [status, setStatus] = useState<ScreenStatus>(categories ? 'ready' : 'no-boq')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [costFilter, setCostFilter] = useState<CostFilter>('both')
  const [sort, setSort] = useState<SortKey>('category')
  const [view, setView] = useState<ViewMode>('table')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set((categories ?? []).slice(0, 2).map(c => c.id)))
  const [selectedItem, setSelectedItem] = useState<BOQItem | null>(null)

  useEffect(() => {
    setStatus(categories ? 'ready' : 'no-boq')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const isSearching = search.trim().length > 0
  const query = search.trim().toLowerCase()

  const visibleCategories = useMemo(() => {
    return (categories ?? []).filter(c => category === 'all' || c.id === category)
  }, [categories, category])

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, BOQItem[]>()
    for (const cat of visibleCategories) {
      const items = cat.items.filter(item => !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))
      map.set(cat.id, items)
    }
    return map
  }, [visibleCategories, query])

  const totalVisibleItems = useMemo(() => [...itemsByCategory.values()].reduce((s, arr) => s + arr.length, 0), [itemsByCategory])

  const selectedCategoryName = selectedItem ? (categories ?? []).find(c => c.id === selectedItem.categoryId)?.name ?? '' : ''

  const toggleCategory = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const viewDetailed = () => onNavigate('boq-overview')
  const analyzePlan = () => onNavigate('upload-plan')
  const askHozie = () => onNavigate('ai-advisor', { project_id: projectId ?? '' })

  const finishingCost = estimateVersion?.costBreakdown.finishingCost ?? 0
  const servicesCost = estimateVersion?.costBreakdown.servicesCost ?? 0
  const contingencyCost = estimateVersion?.costBreakdown.contingencyCost ?? 0
  const boqSubtotal = (estimateVersion?.costBreakdown.materialCost ?? 0) + (estimateVersion?.costBreakdown.labourCost ?? 0)
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <button onClick={() => onNavigate('boq-overview')} aria-label="Back to BOQ overview" className="flex items-center gap-1 text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer text-[13px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          <IcoChevronLeft /> BOQ
        </button>
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Detailed BOQ</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onNavigate('boq-version-history')} aria-label="Version history" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoHistory /></button>
          <button aria-label="Download PDF" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="boq" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Detailed BOQ</h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{projectName} · {location} · {area}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] px-2.5 py-1.5 rounded-full" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{estimateVersion ? `ESTIMATE V${estimateVersion.versionNumber} · ${estimateVersion.status.toUpperCase()}` : 'ESTIMATE'}</span>
              <button onClick={() => onNavigate('boq-overview')} className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                <IcoChevronLeft /> BOQ Overview
              </button>
              <button onClick={() => onNavigate('boq-version-history')} className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                <IcoHistory /> <span className="hidden lg:inline">Version History</span>
              </button>
              <button aria-label="Download PDF" className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                <IcoDownload /> <span className="hidden lg:inline">PDF</span>
              </button>
              <button aria-label="Export BOQ" className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                <IcoExport /> <span className="hidden lg:inline">Export</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Intro */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Bill of Quantities</span>
                <h2 className="text-[28px] sm:text-[34px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.08]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Detailed BOQ</h2>
                <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 mt-2 max-w-[600px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                  Review every material, labour and construction activity included in your current estimate.
                </p>
              </div>

              {/* Customer Implementation 10L — 'loading'/'error' removed:
                  categories are resolved synchronously above, so status can
                  now only genuinely be 'ready' or 'no-boq'. SkeletonCategory/
                  ErrorPanel stay defined, unused, for a real future async
                  step rather than being deleted outright. */}

              {status === 'no-boq' && (
                <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                  <NoBOQPanel onGoBOQOverview={viewDetailed} />
                </div>
              )}

              {status === 'ready' && overview && (
                <>
                  {/* Summary metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                    <MetricCard eyebrow="Total BOQ Value" value={formatINR(overview.totalValue)} />
                    <MetricCard eyebrow="Total Items" value={String(overview.itemCount)} />
                    <MetricCard eyebrow="Material Items" value={String(overview.materialItemCount)} />
                    <MetricCard eyebrow="Labour Items" value={String(overview.labourItemCount)} />
                    <MetricCard eyebrow="AI Confidence" value={`${overview.confidence}%`} />
                  </div>

                  {/* BOQ status */}
                  <div className="flex flex-wrap items-center gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.12s both' }}>
                    <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)', fontFamily: '"Inter Variable", sans-serif' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--hz-success)' }} /> Ready for review
                    </span>
                    <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Based on {estimateVersion ? `Estimate Version ${estimateVersion.versionNumber}` : 'your Estimate'}</span>
                  </div>

                  {/* Toolbar */}
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}>
                    <BOQToolbar
                      categories={categories ?? []}
                      search={search} onSearch={setSearch}
                      category={category} onCategory={setCategory}
                      costFilter={costFilter} onCostFilter={setCostFilter}
                      sort={sort} onSort={setSort}
                      view={view} onView={setView}
                    />
                  </div>

                  {/* Categories */}
                  {isSearching && totalVisibleItems === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)]">
                      <span style={{ color: 'var(--hz-ink-subtle)' }}><IcoEmptyBox /></span>
                      <p className="text-[14px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>No BOQ items match your search.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.18s both' }}>
                      {visibleCategories.map(cat => {
                        const items = itemsByCategory.get(cat.id) ?? []
                        if (isSearching && items.length === 0) return null
                        return (
                          <CategorySection
                            key={cat.id}
                            category={cat}
                            items={items}
                            expanded={isSearching || expanded.has(cat.id)}
                            onToggle={() => toggleCategory(cat.id)}
                            costFilter={costFilter}
                            sort={sort}
                            view={view}
                            onOpenItem={setSelectedItem}
                          />
                        )
                      })}
                    </div>
                  )}

                  {/* Hozie check */}
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.22s both' }}>
                    <HozieCheckCard onAskHozie={askHozie} onAnalyzePlan={analyzePlan} />
                  </div>

                  {/* Two-column: totals + readiness */}
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="w-full bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-3" style={{ flex: '58 58 0', animation: 'welcomeFadeUp 0.4s ease-out 0.26s both' }}>
                      <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Totals{estimateVersion ? ` — Estimate Version ${estimateVersion.versionNumber}` : ''}</span>
                      <div className="flex flex-col">
                        {[
                          ['Material subtotal', estimateVersion?.costBreakdown.materialCost ?? 0],
                          ['Labour subtotal', estimateVersion?.costBreakdown.labourCost ?? 0],
                        ].map(([label, val], i) => (
                          <div key={label as string} className="flex items-center justify-between py-2" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hz-surface)' }}>
                            <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{label}</span>
                            <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(val as number)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid var(--hz-surface-muted)' }}>
                          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>BOQ subtotal</span>
                          <span className="text-[13px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-primary)' }}>{formatINR(boqSubtotal)}</span>
                        </div>
                        {[
                          ['Finishing', finishingCost],
                          ['Services', servicesCost],
                          ['Contingency', contingencyCost],
                        ].map(([label, val]) => (
                          <div key={label as string} className="flex items-center justify-between py-2" style={{ borderTop: '1px solid var(--hz-surface)' }}>
                            <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{label}</span>
                            <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(val as number)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-[12px] p-4 flex flex-col gap-1 mt-1" style={{ backgroundColor: 'var(--hz-primary-wash)' }}>
                        <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-primary)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimated Project Total</span>
                        <span className="text-[22px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-primary)' }}>{estimateVersion ? `${formatINR(estimateVersion.minCost)} — ${formatINR(estimateVersion.maxCost)}` : formatINR(overview.totalValue)}</span>
                      </div>
                    </div>

                    <div className="w-full" style={{ flex: '42 42 0', animation: 'welcomeFadeUp 0.4s ease-out 0.3s both' }}>
                      <ReadinessStrip />
                    </div>
                  </div>

                  {/* Primary actions */}
                  <div className="flex flex-col sm:flex-row gap-2.5" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.34s both' }}>
                    <button onClick={analyzePlan} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}>
                      Continue to Plan Analysis →
                    </button>
                    <button className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                      Download BOQ PDF
                    </button>
                    <button onClick={viewDetailed} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                      Back to BOQ Overview
                    </button>
                  </div>
                </>
              )}

            </div>
          </main>
        </div>
      </div>

      <ItemDetailDrawer
        item={selectedItem}
        categoryName={selectedCategoryName}
        onClose={() => setSelectedItem(null)}
        onAskHozie={askHozie}
        onViewFullDetails={() => selectedItem && onNavigate('boq-item-detail', { boq_item_id: selectedItem.id })}
        onEditItem={() => selectedItem && onNavigate('boq-edit', { boq_item_id: selectedItem.id })}
      />
    </div>
  )
}
