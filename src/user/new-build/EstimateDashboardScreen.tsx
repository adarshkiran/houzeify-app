import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import Sidebar from '@/shared/components/Sidebar'
import { getLatestEstimateVersion } from '@/data/estimateVersions'

// ─── Sidebar Icons ─────────────────────────────────────────────────────────────

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
    <line x1="4" y1="15.5" x2="4" y2="9"/><line x1="7.5" y1="15.5" x2="7.5" y2="5"/>
    <line x1="11" y1="15.5" x2="11" y2="8"/><line x1="14.5" y1="15.5" x2="14.5" y2="3"/>
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

// ─── Action/header icons ───────────────────────────────────────────────────────

const IcoEdit = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 2.5l2 2L5 12H3v-2L10.5 2.5z"/>
  </svg>
)
const IcoDownload = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 2v8M4.5 7l3 3 3-3"/>
    <path d="M2 12h11"/>
  </svg>
)
const IcoMore = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="4" cy="8" r="1.2" fill="currentColor"/>
    <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="8" r="1.2" fill="currentColor"/>
  </svg>
)
const IcoArrow = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="7" x2="12" y2="7"/><path d="M8 3.5l4 3.5-4 3.5"/>
  </svg>
)

// ─── Action card icons ─────────────────────────────────────────────────────────

const IcoBOQLg = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="16" height="18" rx="2"/>
    <line x1="7" y1="8" x2="15" y2="8"/><line x1="7" y1="12" x2="15" y2="12"/><line x1="7" y1="16" x2="12" y2="16"/>
  </svg>
)
const IcoCalcLg = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="16" height="18" rx="2"/>
    <rect x="6" y="5" width="10" height="4" rx="0.8"/>
    <circle cx="7.5" cy="13" r="1" fill="currentColor" stroke="none"/>
    <circle cx="11" cy="13" r="1" fill="currentColor" stroke="none"/>
    <circle cx="14.5" cy="13" r="1" fill="currentColor" stroke="none"/>
    <circle cx="7.5" cy="17" r="1" fill="currentColor" stroke="none"/>
    <circle cx="11" cy="17" r="1" fill="currentColor" stroke="none"/>
    <circle cx="14.5" cy="17" r="1" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoPlanLg = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="18" height="18" rx="2.5"/>
    <line x1="2" y1="9" x2="20" y2="9"/>
    <line x1="9" y1="9" x2="9" y2="20"/>
    <line x1="13" y1="12.5" x2="17" y2="12.5"/>
    <line x1="13" y1="15.5" x2="17" y2="15.5"/>
  </svg>
)
const IcoContractors = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="7" r="3"/>
    <path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
    <circle cx="16" cy="8" r="2.5"/>
    <path d="M20 20c0-2.8-1.8-5-4-5.5"/>
  </svg>
)

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      title={label}
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



// ─── Mobile Top Bar ───────────────────────────────────────────────────────────

function MobileTopBar({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0">
      <div className="flex items-center gap-2.5">
        <button onClick={() => onNavigate('dashboard-home')} className="border-0 bg-transparent cursor-pointer p-0"><HIcon size={26} /></button>
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Estimate</span>
      </div>
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
        <button className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoMore /></button>
      </div>
    </div>
  )
}

// ─── Cost Breakdown Bar ───────────────────────────────────────────────────────

const DEFAULT_BREAKDOWN_ITEMS = [
  { label: 'Materials',   percent: 56, amount: '₹18.2L', color: '#7C3AED' },
  { label: 'Labour',      percent: 26, amount: '₹8.4L',  color: 'var(--hz-success)' },
  { label: 'Finishing',   percent: 13, amount: '₹4.1L',  color: '#D97706' },
  { label: 'Contingency', percent:  5, amount: '₹1.7L',  color: '#8C8C8C' },
]

function CostBreakdownCard({ items }: { items: typeof DEFAULT_BREAKDOWN_ITEMS }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Where Your Money Goes</span>
        <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Mid-range estimate</span>
      </div>

      {/* Segmented bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {items.map(item => (
          <div
            key={item.label}
            className="transition-all duration-700"
            style={{ flex: item.percent, backgroundColor: item.color }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map(item => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5 pl-4">
              <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{item.amount}</span>
              <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{item.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[14px] border border-[var(--hz-border)] overflow-hidden flex" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      {color && <div className="w-1 shrink-0" style={{ backgroundColor: color, opacity: 0.85 }} />}
      <div className="flex-1 px-4 py-4 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          {color && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />}
          <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{label}</span>
        </div>
        <span className="text-[20px] sm:text-[22px] font-semibold leading-none" style={{ fontFamily: '"Geist Variable", sans-serif', color: color ?? 'var(--hz-black)' }}>{value}</span>
        {sub && <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{sub}</span>}
      </div>
    </div>
  )
}

// ─── Hozie Insight Card ───────────────────────────────────────────────────────

function HozieInsightCard({ onNavigate }: { onNavigate?: (s: string) => void }) {
  return (
    <div className="rounded-[16px] px-5 py-4 flex flex-col gap-3" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0">
          <HIcon size={20} />
        </div>
        <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Insight</span>
      </div>
      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.7] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        &ldquo;Your estimate has the biggest cost sensitivity in materials and finishing. Choosing construction quality carefully can significantly change the final budget.&rdquo;
      </p>
      <button
        onClick={() => onNavigate?.('cost-breakdown')}
        className="self-start h-9 px-4 rounded-[10px] text-[12.5px] font-semibold text-white cursor-pointer border-0 hover:brightness-90 active:scale-[0.99] transition-all"
        style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Explore cost drivers →
      </button>
    </div>
  )
}

// ─── Next Action Card ─────────────────────────────────────────────────────────

function ActionCard({ icon, title, desc, onClick }: {
  icon: React.ReactNode; title: string; desc: string; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-3 p-4 sm:p-5 rounded-[14px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-left cursor-pointer transition-all duration-150 hover:bg-[var(--hz-primary-wash)] hover:border-[var(--hz-primary)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_color-mix(in oklch, var(--hz-primary) 14%, transparent)] group outline-none"
    >
      <div className="flex items-center justify-between">
        <span className="w-10 h-10 rounded-[12px] bg-[var(--hz-surface-muted)] flex items-center justify-center text-[var(--hz-ink-muted)] group-hover:bg-[var(--hz-surface)] group-hover:text-[var(--hz-primary)] transition-all">
          {icon}
        </span>
        <span className="text-[var(--hz-border-strong)] group-hover:text-[var(--hz-primary)] transition-colors"><IcoArrow /></span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{title}</span>
        <span className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.5]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{desc}</span>
      </div>
    </button>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

function formatLakh(amountRupees: number): string {
  return `₹${(amountRupees / 100000).toFixed(1)}L`
}

export default function EstimateDashboardScreen({
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
   *  session — carried so downstream navigation (BOQ, Materials, AI Advisor)
   *  can stay tied to the same real project. Never fabricated when absent. */
  projectId?: string
}) {
  // Real, requirements-driven numbers when this project has a real Estimate
  // Version (created by EstimateLoadingScreen from real HouseRequirements) —
  // falls back to the original hardcoded demo figures otherwise, so this
  // screen still previews correctly with no real project in context (dev
  // switcher, etc).
  const version = projectId ? getLatestEstimateVersion(projectId) : undefined
  const heroRange = version ? `${formatLakh(version.minCost)} — ${formatLakh(version.maxCost)}` : '₹29.8L — ₹35.2L'
  const perSqFtRange = version ? `₹${version.costPerSqFtMin.toLocaleString('en-IN')} — ₹${version.costPerSqFtMax.toLocaleString('en-IN')} / sq ft` : '₹1,240 — ₹1,467 / sq ft'
  const confidence = version?.confidence ?? 86
  const breakdown = version?.costBreakdown
  const materialsAmount = breakdown ? formatLakh(breakdown.materialCost) : '₹18.2L'
  const labourAmount = breakdown ? formatLakh(breakdown.labourCost) : '₹8.4L'
  const finishingAmount = breakdown ? formatLakh(breakdown.finishingCost) : '₹4.1L'
  const avgTotal = version?.averageCost ?? 3250000
  const materialsPct = breakdown ? Math.round((breakdown.materialCost / avgTotal) * 100) : 56
  const labourPct = breakdown ? Math.round((breakdown.labourCost / avgTotal) * 100) : 26
  const finishingPct = breakdown ? Math.round((breakdown.finishingCost / avgTotal) * 100) : 13
  const contingencyAmount = breakdown ? formatLakh(breakdown.contingencyCost) : '₹1.7L'
  const contingencyPct = breakdown ? Math.round((breakdown.contingencyCost / avgTotal) * 100) : 5
  const breakdownItems = breakdown
    ? [
        { label: 'Materials', percent: materialsPct, amount: materialsAmount, color: '#7C3AED' },
        { label: 'Labour', percent: labourPct, amount: labourAmount, color: 'var(--hz-success)' },
        { label: 'Finishing', percent: finishingPct, amount: finishingAmount, color: '#D97706' },
        { label: 'Contingency', percent: contingencyPct, amount: contingencyAmount, color: '#8C8C8C' },
      ]
    : DEFAULT_BREAKDOWN_ITEMS

  function goFindContractors() {
    onNavigate('find-contractors', projectId ? { project_id: projectId } : undefined)
  }

  const nextActions = [
    { icon: <IcoBOQLg />, title: 'View BOQ', desc: 'See materials and quantities.', onClick: () => onNavigate('boq-overview', projectId ? { project_id: projectId } : undefined) },
    { icon: <IcoCalcLg />, title: 'Material Calculator', desc: 'Check material requirements.', onClick: () => onNavigate('material-calculator', projectId ? { project_id: projectId } : undefined) },
    { icon: <IcoPlanLg />, title: 'Analyze Plan', desc: 'Upload your floor plan.', onClick: () => onNavigate('upload-plan', projectId ? { project_id: projectId } : undefined) },
    { icon: <IcoContractors />, title: 'Find Contractors', desc: 'Get project bids.', onClick: goFindContractors },
  ]
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      <MobileTopBar onNavigate={onNavigate} />

      {/* Body */}
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        {/* Main */}
        <div className="flex flex-col flex-1 min-h-0">

          {/* Desktop Header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                Construction Estimate
              </h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                {projectName} · {location} · {area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] transition-all cursor-pointer bg-transparent" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                <IcoEdit /> Edit project
              </button>
              <button className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] transition-all cursor-pointer bg-transparent" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                <IcoDownload /> <span className="hidden sm:inline">Download PDF</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[var(--hz-border)] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] transition-all cursor-pointer bg-transparent">
                <IcoMore />
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-5">

              {/* Estimate Hero */}
              <div
                className="bg-[var(--hz-surface)] rounded-[20px] border border-[var(--hz-border)] p-6 sm:p-8 flex flex-col gap-4"
                style={{
                  boxShadow: '0 2px 24px rgba(243,234,255,0.07), 0 1px 4px rgba(0,0,0,0.04)',
                  animation: 'welcomeFadeUp 0.45s ease-out 0.05s both',
                  background: 'linear-gradient(135deg, var(--hz-primary-soft) 0%, var(--hz-surface) 50%)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: numbers */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>AI Estimate</span>
                    </div>
                    <div>
                      <div className="text-[36px] sm:text-[42px] font-semibold text-[var(--hz-primary)] leading-none" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                        {heroRange}
                      </div>
                      <div className="text-[13px] text-[var(--hz-ink-muted)] mt-1.5" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                        Estimated construction cost
                      </div>
                    </div>
                    <div className="text-[16px] sm:text-[18px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                      {perSqFtRange}
                    </div>
                  </div>

                  {/* Right: confidence */}
                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--hz-primary-soft)]" style={{ border: '1px solid var(--hz-primary-soft)' }}>
                      <span
                        className="w-2 h-2 rounded-full bg-[var(--hz-primary)] shrink-0"
                        style={{ animation: 'hozieStatusPulse 2.5s ease-in-out infinite' }}
                      />
                      <span className="text-[12px] font-medium text-[var(--hz-primary)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                        {confidence}% confidence
                      </span>
                    </div>
                    {/* Confidence bar */}
                    <div className="flex flex-col gap-1 w-full sm:w-[160px]">
                      <div className="h-1.5 bg-[var(--hz-surface-muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--hz-primary)] rounded-full" style={{ width: `${confidence}%` }} />
                      </div>
                      <span className="text-[12px] text-[var(--hz-ink-subtle)] sm:text-right" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>AI CONFIDENCE SCORE</span>
                    </div>
                  </div>
                </div>

                {/* Divider + disclaimer */}
                <div className="border-t border-[var(--hz-border)]" />
                <p className="text-[12px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                  Based on current project details and regional construction assumptions for {location}. Final cost depends on design, materials, and contractor rates.
                </p>
              </div>

              {/* Summary Metrics */}
              <div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.12s both' }}
              >
                <MetricCard label="Built-up Area" value={area} />
                <MetricCard label="Materials" value={materialsAmount} sub={`${materialsPct}% of total`} color="#7C3AED" />
                <MetricCard label="Labour" value={labourAmount} sub={`${labourPct}% of total`} color="var(--hz-success)" />
                <MetricCard label="Finishing" value={finishingAmount} sub={`${finishingPct}% of total`} color="#D97706" />
              </div>

              {/* Cost Breakdown */}
              <div style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.18s both' }}>
                <CostBreakdownCard items={breakdownItems} />
              </div>

              {/* Hozie Insight */}
              <div style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.24s both' }}>
                <HozieInsightCard onNavigate={onNavigate} />
              </div>

              {/* Next Actions */}
              <div
                className="flex flex-col gap-3"
                style={{ animation: 'welcomeFadeUp 0.45s ease-out 0.3s both' }}
              >
                <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Next Steps</span>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {nextActions.map(a => (
                    <ActionCard key={a.title} icon={a.icon} title={a.title} desc={a.desc} onClick={a.onClick} />
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p
                className="text-[10px] text-[var(--hz-ink-subtle)] leading-[1.7] m-0"
                style={{ fontFamily: '"Inter Variable", sans-serif', animation: 'welcomeFadeUp 0.4s ease-out 0.36s both' }}
              >
                AI-generated estimate based on the information provided and current assumptions. Actual costs may vary based on design, material selection, labour rates, site conditions and contractor pricing.
              </p>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
