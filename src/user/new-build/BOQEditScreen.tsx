import { useEffect, useMemo, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import { defaultBOQItemId, type BOQItem } from '@/data/boqDetail'
// Customer Implementation 10I/10J — project-scoped BOQ access + mutation
// layer; see boqGeneration.ts for the Estimate → BOQ derivation method and
// the real edit/version-persistence logic.
import { getBOQItemForProject, getBOQCategoryForProject, getBOQForProject, getBOQActiveVersionForProject, updateBOQItemForProject } from '@/data/boqGeneration'
import {
  calculateBOQItem,
  type BOQItemChanges,
  type BOQItemScope,
  type BOQFieldChange,
  type BOQVersion,
} from '@/data/boqEdit'
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
const IcoArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="1.5" x2="7" y2="10.5"/><path d="M3.5 7.5L7 11l3.5-3.5"/>
  </svg>
)
const IcoWarning = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L15 14H1L8 2z"/><line x1="8" y1="6.5" x2="8" y2="9.5"/><circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoCheckSolid = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <circle cx="15" cy="15" r="15" fill="var(--hz-primary)" />
    <path d="M9 15.5l4 4 8-8.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)
const IcoAlert = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5L18 17H2L10 2.5z"/><line x1="10" y1="8" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l10 10M13 3L3 13"/>
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



// ─── Small shared bits ─────────────────────────────────────────────────────────

function SectionCard({ eyebrow, tag, children }: { eyebrow: string; tag?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: FONT_MONO }}>{eyebrow}</span>
        {tag}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: first ? 'none' : '1px solid var(--hz-surface)' }}>
      <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[var(--hz-ink)] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

function formatSigned(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '' : '±'
  return `${sign}${formatINR(n)}`
}
function formatSignedPct(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '' : '±'
  return `${sign}${n.toFixed(1)}%`
}

// ─── Breadcrumb ─────────────────────────────────────────────────────────────

function Breadcrumb({ categoryName, itemName, onBOQ, onItem }: {
  categoryName: string; itemName: string; onBOQ: () => void; onItem: () => void
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] flex-wrap min-w-0" style={{ fontFamily: FONT_BODY }}>
      <button onClick={onBOQ} className="border-0 bg-transparent cursor-pointer p-0 hover:underline shrink-0" style={{ color: 'var(--hz-ink-muted)' }}>Detailed BOQ</button>
      <span aria-hidden="true" style={{ color: 'var(--hz-border-strong)' }}>/</span>
      <button onClick={onBOQ} className="border-0 bg-transparent cursor-pointer p-0 hover:underline shrink-0" style={{ color: 'var(--hz-ink-muted)' }}>{categoryName}</button>
      <span aria-hidden="true" style={{ color: 'var(--hz-border-strong)' }}>/</span>
      <button onClick={onItem} className="border-0 bg-transparent cursor-pointer p-0 hover:underline shrink-0 truncate max-w-[220px]" style={{ color: 'var(--hz-ink-muted)' }}>{itemName}</button>
      <span aria-hidden="true" style={{ color: 'var(--hz-border-strong)' }}>/</span>
      <span className="font-semibold" style={{ color: 'var(--hz-ink)' }}>Edit</span>
    </nav>
  )
}

// ─── Item summary (compact) ─────────────────────────────────────────────────

function BOQItemSummaryCompact({ item, categoryName }: { item: BOQItem; categoryName: string }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 flex-wrap" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.06s both' }}>
      <div className="min-w-0">
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] block truncate" style={{ fontFamily: FONT_HEAD }}>{item.name}</span>
        <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Category: {categoryName}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {[
          ['Current quantity', `${item.quantity.toLocaleString('en-IN')} ${item.unit}`],
          ['Current total', formatINR(item.totalCost)],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{label}</span>
            <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{value}</span>
          </div>
        ))}
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-primary)' }} aria-hidden="true" /> AI Estimated
        </span>
      </div>
    </div>
  )
}

// ─── Validation message ─────────────────────────────────────────────────────

function ValidationMessage({ warnings, onAskHozie }: { warnings: string[]; onAskHozie: () => void }) {
  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--hz-success)', fontFamily: FONT_BODY }}>
        <IcoCheck /> Within expected range
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {warnings.map(w => (
        <div key={w} role="alert" className="flex items-start gap-1.5 text-[12px]" style={{ color: '#D97706', fontFamily: FONT_BODY }}>
          <span className="shrink-0 mt-[1px]"><IcoWarning /></span> {w}
        </div>
      ))}
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>You can still keep this change.</span>
        <button onClick={onAskHozie} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Ask Hozie</button>
      </div>
    </div>
  )
}

// ─── Field shell ─────────────────────────────────────────────────────────────

function FieldShell({ n, label, htmlFor, current, children, message }: {
  n: string; label: string; htmlFor: string; current?: string; children: React.ReactNode; message?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 py-4" style={{ borderTop: n === '01' ? 'none' : '1px solid var(--hz-surface)' }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label htmlFor={htmlFor} className="flex items-center gap-2 text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
          <span className="text-[10px] font-normal text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>FIELD {n}</span>
          {label}
        </label>
        {current && <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Current: {current}</span>}
      </div>
      {children}
      {message}
    </div>
  )
}

const inputClass = "w-full h-10 px-3 rounded-[10px] border text-[13px] text-[var(--hz-ink)] outline-none transition-colors bg-[var(--hz-surface)]"

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'form' | 'review' | 'saving' | 'success' | 'error'

const FIELD_LABELS: Record<keyof BOQItemChanges, string> = {
  quantity: 'Quantity',
  materialRate: 'Material Rate',
  labourCost: 'Labour Rate',
  specification: 'Specification',
  materialSelection: 'Material',
  scope: 'Scope',
}

export default function BOQEditScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  itemId,
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  itemId?: string
  /** Real id from projectData.project_id, if one already exists in this
   *  session. Customer Implementation 10I — no longer falls back to
   *  boqOverview.projectId ('proj-001'); a project with no BOQ/item falls
   *  into the existing "item not available" empty state below instead of
   *  showing a substitute project's item. */
  projectId?: string
}) {
  const resolvedId = itemId ?? defaultBOQItemId
  const item = getBOQItemForProject(projectId, resolvedId)
  const category = item ? getBOQCategoryForProject(projectId, item.categoryId) : undefined

  if (!item || !category) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
        <span style={{ color: 'var(--hz-ink-subtle)' }}><IcoAlert /></span>
        <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>This BOQ item is no longer available in the active version.</p>
        <button onClick={() => onNavigate('detailed-boq')} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Back to BOQ</button>
      </div>
    )
  }

  return <BOQEditScreenInner item={item} category={category} onNavigate={onNavigate} projectName={projectName} location={location} projectId={projectId} />
}

function BOQEditScreenInner({ item, category, onNavigate, projectName, location, projectId }: {
  item: BOQItem
  category: { id: string; name: string }
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName: string
  location: string
  projectId?: string
}) {
  // Customer Implementation 10I — this project's own derived BOQ overview
  // and current version, replacing the hardcoded boqOverview/boqVersionTwo
  // globals every reference below used to point at regardless of project.
  const overview = getBOQForProject(projectId)
  const activeVersion = getBOQActiveVersionForProject(projectId)

  const materialOptions = useMemo(() => {
    const hasGrade = !!item.materials?.[0]?.grade
    return hasGrade ? [item.name, item.materials![0].grade!, 'Fe550', 'Other'] : [item.name, 'Standard', 'Premium', 'Other']
  }, [item])

  const original: Required<BOQItemChanges> = {
    quantity: item.quantity,
    materialRate: item.materialRate,
    labourCost: item.labourCost,
    specification: item.specification,
    materialSelection: materialOptions[0],
    scope: 'included',
  }

  const [form, setForm] = useState<Required<BOQItemChanges>>(original)
  const [status, setStatus] = useState<ScreenStatus>('form')
  const [recalculating, setRecalculating] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [pendingDest, setPendingDest] = useState<{ dest: string; data?: Record<string, string> } | null>(null)
  const [createdVersion, setCreatedVersion] = useState<BOQVersion | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const modalCloseRef = useRef<HTMLButtonElement>(null)

  // Recalculation is synchronous/always-correct; this flag is a cosmetic "Hozie is thinking" beat.
  useEffect(() => {
    if (status !== 'form') return
    setRecalculating(true)
    const t = setTimeout(() => setRecalculating(false), 450)
    return () => clearTimeout(t)
  }, [form.quantity, form.materialRate, form.labourCost, form.scope, status])

  const changes: BOQItemChanges = {
    quantity: form.quantity,
    materialRate: form.materialRate,
    labourCost: form.labourCost,
    scope: form.scope,
  }
  const result = useMemo(() => calculateBOQItem(item, changes), [item, form.quantity, form.materialRate, form.labourCost, form.scope])

  const fieldsChanged: (keyof BOQItemChanges)[] = (Object.keys(original) as (keyof BOQItemChanges)[]).filter(k => {
    if (k === 'quantity' || k === 'materialRate') return Math.abs((form[k] as number) - (original[k] as number)) > 1e-6
    if (k === 'labourCost') return Math.round(form.labourCost) !== Math.round(original.labourCost)
    return form[k] !== original[k]
  })
  const isDirty = fieldsChanged.length > 0

  const fieldChangeRows: BOQFieldChange[] = (Object.keys(FIELD_LABELS) as (keyof BOQItemChanges)[]).map(k => {
    const changed = fieldsChanged.includes(k)
    const fmt = (v: BOQItemChanges[typeof k]): string => {
      if (k === 'quantity') return `${v} ${item.unit}`
      if (k === 'materialRate') return `₹${Number(v).toLocaleString('en-IN')} / ${item.unit}`
      if (k === 'labourCost') return formatINR(Number(v))
      if (k === 'scope') return String(v).charAt(0).toUpperCase() + String(v).slice(1)
      if (k === 'specification') return changed ? 'Updated' : 'No change'
      return String(v)
    }
    return { field: k, label: FIELD_LABELS[k], before: fmt(original[k]), after: fmt(form[k]), changed }
  })

  const attemptNavigate = (dest: string, data?: Record<string, string>) => {
    if (isDirty && status === 'form') {
      setPendingDest({ dest, data })
      return
    }
    onNavigate(dest, data)
  }

  const resetChanges = () => {
    setForm(original)
    setConfirmingReset(false)
  }
  const handleResetClick = () => {
    if (!isDirty) return
    if (fieldsChanged.length > 1) setConfirmingReset(true)
    else resetChanges()
  }

  const askHozie = (extra?: Record<string, string>) => onNavigate('ai-advisor', {
    project_id: projectId ?? '',
    estimate_version_id: overview?.estimateVersionId ?? '',
    boq_version_id: activeVersion?.id ?? '',
    boq_item_id: item.id,
    old_value: fieldChangeRows.find(c => c.changed)?.before ?? '',
    new_value: fieldChangeRows.find(c => c.changed)?.after ?? '',
    ...extra,
  })

  const goReview = () => setStatus('review')
  const cancelReview = () => setStatus('form')

  const confirmCreateVersion = () => {
    const summary = fieldChangeRows.filter(c => c.changed).map(c => `${c.label}: ${c.before} → ${c.after}`).join('; ')
    // Customer Implementation 10J/10L — the real mutation: applies `form`'s
    // edits to this project's BOQ, recalculates item/category/BOQ totals,
    // and creates a new, immutable, project-scoped BOQ version as the
    // active one (see boqGeneration.ts's updateBOQItemForProject). This is
    // a synchronous, in-memory write — no real "saving…" delay exists, so
    // it no longer pretends one does with an artificial setTimeout; status
    // moves straight from the review step to the real result.
    const created = updateBOQItemForProject(projectId, item.id, form, summary || 'Item revised.')
    if (created) {
      setCreatedVersion(created.version)
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  const viewUpdatedBOQ = () => onNavigate('detailed-boq')

  const hozieExplanation = useMemo(() => {
    if (!isDirty) return "Edit any field on the left and I'll show you the cost impact here before anything is saved."
    if (form.scope === 'excluded') return `Marking this item as Excluded removes it from the active BOQ total — a reduction of ${formatINR(item.totalCost)}.`
    const qtyChanged = Math.abs(form.quantity - original.quantity) > 1e-6
    const rateChanged = Math.abs(form.materialRate - original.materialRate) > 1e-6
    if (qtyChanged && !rateChanged) {
      const dir = form.quantity > original.quantity ? 'increased' : 'decreased'
      const costDir = result.costDifference >= 0 ? 'increases' : 'decreases'
      return `Your quantity ${dir} from ${original.quantity} ${item.unit} to ${form.quantity} ${item.unit}. This ${costDir} the estimated item cost by approximately ${formatINR(Math.abs(result.costDifference))}.`
    }
    if (rateChanged && !qtyChanged) {
      const dir = form.materialRate > original.materialRate ? 'increased' : 'decreased'
      const costDir = result.costDifference >= 0 ? 'increases' : 'decreases'
      return `Your material rate ${dir} from ₹${original.materialRate.toLocaleString('en-IN')} to ₹${form.materialRate.toLocaleString('en-IN')} per ${item.unit}. This ${costDir} the estimated item cost by approximately ${formatINR(Math.abs(result.costDifference))}.`
    }
    const costDir = result.costDifference >= 0 ? 'increases' : 'decreases'
    return `Your edits ${costDir} the estimated item cost by approximately ${formatINR(Math.abs(result.costDifference))} (${formatSignedPct(result.percentageDifference)}).`
  }, [form, original, item, result, isDirty])

  // Focus trap for the unsaved-changes modal
  useEffect(() => {
    if (!pendingDest) return
    modalCloseRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPendingDest(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [pendingDest])

  const goBOQ = () => attemptNavigate('detailed-boq')
  const goItem = () => attemptNavigate('boq-item-detail', { boq_item_id: item.id })
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <button onClick={goItem} aria-label="Back to item" className="flex items-center gap-1 text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer text-[13px]" style={{ fontFamily: FONT_BODY }}>
          <IcoChevronLeft /> Item
        </button>
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] truncate px-2" style={{ fontFamily: FONT_HEAD }}>Edit BOQ Item</span>
        <span className="w-8" />
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="boq" onNavigate={attemptNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Edit BOQ Item</h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] px-2.5 py-1.5 rounded-full" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_MONO }}>{activeVersion ? `BOQ VERSION ${activeVersion.versionNumber}` : 'BOQ VERSION'}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)', fontFamily: FONT_MONO }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--hz-success)' }} /> ACTIVE
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {status !== 'success' && (
                <div className="flex flex-col gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                  <Breadcrumb categoryName={category.name} itemName={item.name} onBOQ={goBOQ} onItem={goItem} />
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex flex-col gap-2 min-w-0">
                      <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Edit BOQ Item</span>
                      <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.1]" style={{ fontFamily: FONT_HEAD }}>Adjust this item.</h1>
                      <p className="text-[14px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
                        Change the quantity, specification or pricing assumptions. Hozie will recalculate the item and show the cost impact before saving.
                      </p>
                    </div>
                    <div className="flex md:hidden items-center gap-2 shrink-0">
                      <span className="text-[11px] px-2.5 py-1.5 rounded-full" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_MONO }}>{activeVersion ? `BOQ V${activeVersion.versionNumber} · ACTIVE` : 'BOQ · ACTIVE'}</span>
                    </div>
                  </div>
                </div>
              )}

              {status === 'form' && (
                <>
                  <BOQItemSummaryCompact item={item} categoryName={category.name} />

                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left: edit form */}
                    <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-6">
                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.09s both' }}>
                        <SectionCard eyebrow="Edit Form">
                          <div className="flex flex-col">
                            <FieldShell n="01" label="Quantity" htmlFor="f-qty" current={`${original.quantity} ${item.unit}`}>
                              <div className="flex items-center gap-2">
                                <input
                                  ref={firstFieldRef}
                                  id="f-qty"
                                  type="number"
                                  inputMode="decimal"
                                  step="0.1"
                                  min="0"
                                  value={form.quantity}
                                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
                                  className={inputClass}
                                  style={{ borderColor: 'var(--hz-border)', maxWidth: 160 }}
                                  aria-describedby="f-qty-current"
                                />
                                <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{item.unit}</span>
                              </div>
                              <span id="f-qty-current" className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Current {original.quantity} {item.unit}</span>
                              <ValidationMessage warnings={result.validationWarnings.filter(w => w.toLowerCase().includes('quantity'))} onAskHozie={() => askHozie()} />
                            </FieldShell>

                            <FieldShell n="02" label="Material" htmlFor="f-material" current={original.materialSelection}>
                              <div className="relative" style={{ maxWidth: 320 }}>
                                <select
                                  id="f-material"
                                  value={form.materialSelection}
                                  onChange={e => setForm(f => ({ ...f, materialSelection: e.target.value }))}
                                  className="appearance-none w-full h-10 pl-3 pr-8 rounded-[10px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13px] text-[var(--hz-ink)] cursor-pointer outline-none hover:border-[var(--hz-border)] focus:border-[var(--hz-primary)] transition-colors"
                                  style={{ fontFamily: FONT_BODY }}
                                >
                                  {materialOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--hz-ink-muted)]"><IcoChevronDown /></span>
                              </div>
                            </FieldShell>

                            <FieldShell n="03" label="Specification" htmlFor="f-spec">
                              <textarea
                                id="f-spec"
                                value={form.specification}
                                maxLength={500}
                                onChange={e => setForm(f => ({ ...f, specification: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2.5 rounded-[10px] border text-[13px] text-[var(--hz-ink)] outline-none transition-colors bg-[var(--hz-surface)] resize-none"
                                style={{ borderColor: 'var(--hz-border)', fontFamily: FONT_BODY }}
                                aria-describedby="f-spec-count"
                              />
                              <span id="f-spec-count" className="text-[11px] text-[var(--hz-ink-subtle)] self-end" style={{ fontFamily: FONT_BODY }}>{form.specification.length} / 500 characters</span>
                            </FieldShell>

                            <FieldShell n="04" label="Material Rate" htmlFor="f-rate" current={`₹${original.materialRate.toLocaleString('en-IN')} / ${item.unit}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>₹</span>
                                <input
                                  id="f-rate"
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  value={form.materialRate}
                                  onChange={e => setForm(f => ({ ...f, materialRate: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
                                  className={inputClass}
                                  style={{ borderColor: result.validationWarnings.some(w => w.includes('rate')) ? '#F0B429' : 'var(--hz-border-strong)', maxWidth: 160 }}
                                  aria-describedby="f-rate-range"
                                />
                                <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>/ {item.unit}</span>
                              </div>
                              {item.rateMin != null && item.rateMax != null && (
                                <span id="f-rate-range" className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>
                                  Reference range ₹{item.rateMin.toLocaleString('en-IN')} — ₹{item.rateMax.toLocaleString('en-IN')} / {item.unit}
                                </span>
                              )}
                              <ValidationMessage warnings={result.validationWarnings.filter(w => w.includes('rate'))} onAskHozie={() => askHozie()} />
                            </FieldShell>

                            <FieldShell n="05" label="Labour Rate" htmlFor="f-labour" current={formatINR(original.labourCost)}>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>₹</span>
                                <input
                                  id="f-labour"
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  value={form.labourCost}
                                  onChange={e => setForm(f => ({ ...f, labourCost: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
                                  className={inputClass}
                                  style={{ borderColor: 'var(--hz-border)', maxWidth: 160 }}
                                  aria-describedby="f-labour-help"
                                />
                              </div>
                              <span id="f-labour-help" className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Estimated labour cost for this item.</span>
                            </FieldShell>

                            <FieldShell n="06" label="Scope" htmlFor="f-scope">
                              <div role="radiogroup" aria-label="Scope" id="f-scope" className="inline-flex items-center gap-1 p-1 rounded-[10px] w-fit" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                                {(['included', 'excluded', 'optional'] as BOQItemScope[]).map(opt => (
                                  <button
                                    key={opt}
                                    role="radio"
                                    aria-checked={form.scope === opt}
                                    onClick={() => setForm(f => ({ ...f, scope: opt }))}
                                    className="h-8 px-3.5 rounded-[8px] text-[12px] font-semibold cursor-pointer border-0 capitalize transition-colors"
                                    style={{
                                      fontFamily: FONT_BODY,
                                      backgroundColor: form.scope === opt ? 'var(--hz-surface)' : 'transparent',
                                      color: form.scope === opt ? 'var(--hz-primary)' : '#808080',
                                      boxShadow: form.scope === opt ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                                    }}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                              {form.scope === 'excluded' && (
                                <div role="alert" className="flex items-start gap-1.5 text-[12px] mt-1" style={{ color: '#D97706', fontFamily: FONT_BODY }}>
                                  <span className="shrink-0 mt-[1px]"><IcoWarning /></span> This item will be removed from the active BOQ total.
                                </div>
                              )}
                            </FieldShell>
                          </div>
                        </SectionCard>
                      </div>
                    </div>

                    {/* Right: live cost impact + calc + hozie */}
                    <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                        <LiveCostImpactCard item={item} form={form} result={result} recalculating={recalculating} unit={item.unit} />
                      </div>
                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.13s both' }}>
                        <CalculationExplanationCard form={form} result={result} unit={item.unit} />
                      </div>
                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.16s both' }}>
                        <HozieExplanationCard text={hozieExplanation} onAskHozie={() => askHozie()} />
                      </div>
                    </div>
                  </div>

                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.19s both' }}>
                    <ChangeSummaryCard rows={fieldChangeRows} isDirty={isDirty} />
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.22s both' }}>
                    {confirmingReset ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Reset {fieldsChanged.length} changed fields?</span>
                        <button onClick={resetChanges} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-danger)', fontFamily: FONT_BODY }}>Confirm reset</button>
                        <button onClick={() => setConfirmingReset(false)} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}>Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={handleResetClick}
                        disabled={!isDirty}
                        className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                        style={{ color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}
                      >
                        Reset changes
                      </button>
                    )}
                    <button
                      onClick={goReview}
                      disabled={!isDirty}
                      className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                    >
                      Review Changes →
                    </button>
                  </div>
                </>
              )}

              {status === 'review' && (
                <ReviewChangesPanel
                  item={item}
                  result={result}
                  fieldChangeRows={fieldChangeRows.filter(c => c.changed)}
                  nextVersionNumber={(activeVersion?.versionNumber ?? 0) + 1}
                  onCancel={cancelReview}
                  onConfirm={confirmCreateVersion}
                />
              )}

              {status === 'saving' && (
                <div className="flex flex-col items-center justify-center gap-3 py-20 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)]" style={{ animation: 'welcomeFadeUp 0.4s ease-out both' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', animation: 'aiIconGlow 1.6s ease-in-out infinite' }}>
                    <HIcon size={26} />
                  </div>
                  <span className="text-[12px] uppercase tracking-[0.10em]" style={{ fontFamily: FONT_MONO, color: 'var(--hz-primary)' }}>Creating BOQ Version {(activeVersion?.versionNumber ?? 0) + 1}…</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)]" style={{ animation: 'welcomeFadeUp 0.4s ease-out both' }}>
                  <span style={{ color: 'var(--hz-danger)' }}><IcoAlert /></span>
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>Unable to recalculate this item. Your existing BOQ remains unchanged.</p>
                  <button onClick={() => setStatus('review')} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Try again</button>
                </div>
              )}

              {status === 'success' && createdVersion && (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-16 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] max-w-[520px] mx-auto w-full" style={{ animation: 'welcomeFadeUp 0.4s ease-out both' }}>
                  <IcoCheckSolid />
                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>BOQ Version {createdVersion.versionNumber} created</h2>
                    <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 max-w-[380px]" style={{ fontFamily: FONT_BODY }}>
                      {/* Customer Implementation 10J — the new version is now
                          the real active BOQ; the previous one (versionNumber
                          - 1, since versions always increment by exactly 1)
                          is preserved, unchanged, in Version History. */}
                      This is now your active BOQ. Version {createdVersion.versionNumber - 1} has been saved to your version history.
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1.5 rounded-full" style={{ backgroundColor: '#DCFCE7', color: 'var(--hz-success)', fontFamily: FONT_MONO }}>
                    BOQ VERSION {createdVersion.versionNumber} · ACTIVE
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto pt-2">
                    <button onClick={() => onNavigate('boq-item-detail', { boq_item_id: item.id })} className="h-10 px-5 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>
                      Back to Item
                    </button>
                    <button onClick={viewUpdatedBOQ} className="h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
                      View updated BOQ →
                    </button>
                  </div>
                </div>
              )}

            </div>
          </main>

          {/* Sticky revised-cost bar (mobile) */}
          {status === 'form' && (
            <div className="lg:hidden sticky bottom-0 z-20 bg-[var(--hz-surface)] border-t border-[var(--hz-border)] px-4 py-3 flex items-center justify-between gap-3" style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Revised Total</span>
                <span className="text-[18px] font-semibold" style={{ fontFamily: FONT_HEAD, color: 'var(--hz-primary)' }}>{formatINR(result.totalCost)}</span>
              </div>
              <button
                onClick={goReview}
                disabled={!isDirty}
                className="h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
              >
                Review Changes →
              </button>
            </div>
          )}
        </div>
      </div>

      {pendingDest && (
        <UnsavedChangesModal
          closeRef={modalCloseRef}
          onStay={() => setPendingDest(null)}
          onDiscard={() => {
            const dest = pendingDest
            resetChanges()
            setPendingDest(null)
            if (dest) onNavigate(dest.dest, dest.data)
          }}
        />
      )}
    </div>
  )
}

// ─── Live cost impact ───────────────────────────────────────────────────────

function LiveCostImpactCard({ item, form, result, recalculating, unit }: {
  item: BOQItem; form: Required<BOQItemChanges>; result: ReturnType<typeof calculateBOQItem>; recalculating: boolean; unit: string
}) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: FONT_MONO }}>Live Cost Impact</span>
        {recalculating && (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.06em]" style={{ color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--hz-primary)', animation: 'aiIconGlow 1s ease-in-out infinite' }} /> Recalculating
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Current</span>
        <Row first label="Quantity" value={`${item.quantity.toLocaleString('en-IN')} ${unit}`} />
        <Row label="Material" value={formatINR(item.materialCost)} />
        <Row label="Labour" value={formatINR(item.labourCost)} />
        <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid var(--hz-surface-muted)' }}>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Total</span>
          <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{formatINR(item.totalCost)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center" aria-hidden="true">
        <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}><IcoArrowDown /></span>
      </div>

      <div className="flex flex-col gap-1.5 rounded-[12px] p-4" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
        <span className="text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>Revised</span>
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Quantity</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{form.quantity.toLocaleString('en-IN')} {unit}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Material</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{formatINR(result.materialCost)}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>Labour</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{formatINR(result.labourCost)}</span>
        </div>
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--hz-primary-soft)' }}>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>Total</span>
          <span className="text-[18px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>{formatINR(result.totalCost)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[12px] px-4 py-3" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
        <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Change</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{formatSigned(result.costDifference)}</span>
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{formatSignedPct(result.percentageDifference)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Calculation explanation ─────────────────────────────────────────────────

function CalculationExplanationCard({ form, result, unit }: { form: Required<BOQItemChanges>; result: ReturnType<typeof calculateBOQItem>; unit: string }) {
  return (
    <SectionCard eyebrow="How The New Cost Was Calculated">
      <div className="flex flex-col items-stretch gap-2">
        {[
          `${form.quantity.toLocaleString('en-IN')} ${unit} (Quantity)`,
          `× ₹${form.materialRate.toLocaleString('en-IN')} / ${unit} (Material Rate)`,
          `+ ${formatINR(result.labourCost)} (Labour)`,
        ].map(line => (
          <div key={line} className="text-center py-2 px-3 rounded-[10px] text-[12px]" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>{line}</div>
        ))}
        <div className="text-center py-2.5 px-3 rounded-[10px] text-[13px] font-semibold" style={{ backgroundColor: 'var(--hz-primary-wash)', color: 'var(--hz-primary)', fontFamily: FONT_HEAD, border: '1px solid var(--hz-primary-soft)' }}>
          = {formatINR(result.totalCost)} (Revised Item Cost)
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Hozie explanation ───────────────────────────────────────────────────────

function HozieExplanationCard({ text, onAskHozie }: { text: string; onAskHozie: () => void }) {
  return (
    <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Explains</span>
      </div>
      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>"{text}"</p>
      <button onClick={onAskHozie} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Ask Hozie why →</button>
    </div>
  )
}

// ─── Change summary ─────────────────────────────────────────────────────────

function ChangeSummaryCard({ rows, isDirty }: { rows: BOQFieldChange[]; isDirty: boolean }) {
  return (
    <SectionCard eyebrow="Change Summary">
      {!isDirty ? (
        <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>No changes yet — edit a field above to see what will be saved.</p>
      ) : (
        <div className="flex flex-col">
          {rows.map((r, i) => (
            <div key={r.field} className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hz-surface)' }}>
              <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{r.label}</span>
              {r.changed ? (
                <span className="text-[13px] font-semibold text-[var(--hz-ink)] text-right" style={{ fontFamily: FONT_BODY }}>
                  {r.before} <span style={{ color: 'var(--hz-ink-subtle)' }}>→</span> <span style={{ color: 'var(--hz-primary)' }}>{r.after}</span>
                </span>
              ) : (
                <span className="text-[12px] text-[var(--hz-ink-subtle)] text-right" style={{ fontFamily: FONT_BODY }}>No change</span>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

// ─── Review changes ─────────────────────────────────────────────────────────

function ReviewChangesPanel({ item, result, fieldChangeRows, nextVersionNumber, onCancel, onConfirm }: {
  item: BOQItem
  result: ReturnType<typeof calculateBOQItem>
  fieldChangeRows: BOQFieldChange[]
  nextVersionNumber: number
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="max-w-[640px] mx-auto w-full flex flex-col gap-6" style={{ animation: 'welcomeFadeUp 0.4s ease-out both' }}>
      <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Review BOQ Change</span>
          <h2 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Confirm your changes to {item.name}</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
            <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Current</span>
            <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{formatINR(item.totalCost)}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
            <span className="text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>Revised</span>
            <span className="text-[15px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>{formatINR(result.totalCost)}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
            <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Change</span>
            <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{formatSigned(result.costDifference)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Changed Fields</span>
          <div className="flex flex-col">
            {fieldChangeRows.map((r, i) => (
              <div key={r.field} className="flex items-center justify-between gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hz-surface)' }}>
                <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{r.label}</span>
                <span className="text-[13px] font-semibold text-[var(--hz-ink)] text-right" style={{ fontFamily: FONT_BODY }}>{r.before} <span style={{ color: 'var(--hz-ink-subtle)' }}>→</span> <span style={{ color: 'var(--hz-primary)' }}>{r.after}</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[12px] p-4" style={{ backgroundColor: '#FEF3C7' }}>
          <span className="shrink-0" style={{ color: '#D97706' }}><IcoWarning /></span>
          <p className="text-[12px] text-[#D97706] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
            {/* Customer Implementation 10J — confirming now genuinely creates
                the new active BOQ (real, project-scoped persistence); the
                previous version is preserved, unchanged, in Version History
                — no longer a discarded "draft" that never took effect. */}
            Confirming creates <strong>BOQ Version {nextVersionNumber}</strong> and makes it your active BOQ. The current version will be preserved in your version history.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button onClick={onCancel} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
            Create BOQ Version {nextVersionNumber}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Unsaved changes modal ───────────────────────────────────────────────────

function UnsavedChangesModal({ onStay, onDiscard, closeRef }: {
  onStay: () => void; onDiscard: () => void; closeRef: React.RefObject<HTMLButtonElement | null>
}) {
  const discardRef = useRef<HTMLButtonElement>(null)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const first = closeRef.current
    const last = discardRef.current
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onStay} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        aria-describedby="unsaved-desc"
        onKeyDown={onKeyDown}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="unsaved-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Unsaved changes</h2>
          <button ref={closeRef} onClick={onStay} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors"><IcoClose /></button>
        </div>
        <p id="unsaved-desc" className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          You have changes that haven't been saved.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onStay} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Stay</button>
          <button ref={discardRef} onClick={onDiscard} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-danger)', fontFamily: FONT_BODY }}>Discard changes</button>
        </div>
      </div>
    </>
  )
}
