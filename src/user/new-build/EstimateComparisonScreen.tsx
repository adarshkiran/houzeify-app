import { useMemo, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import {
  estimateScenarios,
  comparisonRows,
  hozieRecommendation,
  type EstimateScenario,
  type QualityLevel,
} from '@/data/estimateScenarios'
import { boqOverview } from '@/data/boqOverview'
import Sidebar from '@/shared/components/Sidebar'
import { getHouseRequirementsForProject } from '@/data/houseRequirements'
import { calculateRevisedEstimate, type MaterialTier } from '@/data/estimateRevision'

// Same tier→material mapping convention as houseRequirements.ts's
// FINISH_TO_MATERIAL_TIER — QualityLevel here has no 'luxury' rung, so this
// is the simple 3-way version of that same mapping.
const QUALITY_TO_MATERIAL_TIER: Record<QualityLevel, MaterialTier> = {
  basic: 'economy',
  standard: 'standard',
  premium: 'premium',
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5l4 4 4-4"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoCheckSmall = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#722ED1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
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



// ─── Recommended badge ────────────────────────────────────────────────────────

function RecommendedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-semibold tracking-[0.04em] uppercase"
      style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: '"Sometype Mono:SemiBold", monospace' }}
    >
      <span aria-hidden="true">✦</span> Hozie Recommends
    </span>
  )
}

// ─── Feature list ─────────────────────────────────────────────────────────────

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="flex flex-col gap-2 m-0 p-0" style={{ listStyle: 'none' }}>
      {features.map(f => (
        <li key={f} className="flex items-start gap-2 text-[13px] text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          <span className="shrink-0 mt-0.5" style={{ color: '#722ED1' }}><IcoCheckSmall /></span>
          {f}
        </li>
      ))}
    </ul>
  )
}

// ─── Scenario card ────────────────────────────────────────────────────────────

function ScenarioCard({
  scenario, emphasized, selected, onSelect,
}: {
  scenario: EstimateScenario
  emphasized: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      className="flex-1 min-w-0 flex flex-col gap-4 p-5 sm:p-6 transition-all duration-200"
      style={{
        background: emphasized ? 'linear-gradient(180deg, #F9F5FF 0%, #FFFFFF 55%)' : '#FFFFFF',
        border: emphasized ? '2px solid #722ED1' : '1px solid #E3DDD7',
        borderRadius: 20,
        boxShadow: emphasized ? '0 10px 30px -12px rgba(114,46,209,0.22)' : '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-[12px] font-semibold tracking-[0.10em] uppercase"
          style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: emphasized ? '#722ED1' : '#A1A1A1' }}
        >
          {scenario.name}
        </span>
        {scenario.recommended && <RecommendedBadge />}
        {selected && !scenario.recommended && (
          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#722ED1', color: '#fff', fontFamily: '"Inter Variable", sans-serif' }}>
            <IcoCheck /> Selected
          </span>
        )}
      </div>

      <p className="text-[13px] text-[#68636D] leading-[1.55] m-0 min-h-[54px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        {scenario.description}
      </p>

      <div className="flex flex-col gap-1">
        <span className="text-[22px] sm:text-[24px] font-semibold leading-tight" style={{ fontFamily: '"Geist Variable", sans-serif', color: '#242326' }}>
          {formatINR(scenario.minCost)} — {formatINR(scenario.maxCost)}
        </span>
        <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
          Approx. ₹{scenario.costPerSqFtMin.toLocaleString('en-IN')} — ₹{scenario.costPerSqFtMax.toLocaleString('en-IN')} / sq ft
        </span>
      </div>

      <div className="h-px" style={{ backgroundColor: '#EFE9E2' }} />

      <FeatureList features={scenario.features} />

      <div className="mt-auto flex flex-col gap-3 pt-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Best For</span>
          <span className="text-[13px] text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{scenario.bestFor}</span>
        </div>
        <button
          onClick={onSelect}
          aria-pressed={selected}
          className="h-11 rounded-[12px] text-[13px] font-semibold cursor-pointer transition-all active:scale-[0.99]"
          style={{
            fontFamily: '"Inter Variable", sans-serif',
            ...(selected
              ? { backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none' }
              : emphasized
                ? { backgroundColor: '#722ED1', color: '#FFFFFF', border: 'none' }
                : { backgroundColor: 'transparent', color: '#722ED1', border: '1.5px solid #722ED1' }),
          }}
        >
          {selected ? '✓ Selected' : `Choose ${scenario.name}`}
        </button>
      </div>
    </div>
  )
}

// ─── Cost impact bars ─────────────────────────────────────────────────────────

function CostImpact({ scenarios }: { scenarios: EstimateScenario[] }) {
  const overallMin = Math.min(...scenarios.map(s => s.minCost))
  const overallMax = Math.max(...scenarios.map(s => s.maxCost))
  const span = overallMax - overallMin

  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4">
      <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Cost Impact</span>
      <div className="flex flex-col gap-4">
        {scenarios.map(s => {
          const left = ((s.minCost - overallMin) / span) * 100
          const width = ((s.maxCost - s.minCost) / span) * 100
          return (
            <div key={s.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: '#242326' }}>{s.name}</span>
                <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{formatINR(s.minCost)} — {formatINR(s.maxCost)}</span>
              </div>
              <div className="relative h-2.5 rounded-full" style={{ backgroundColor: '#F4F0EC' }}>
                <div
                  className="absolute top-0 h-full rounded-full"
                  style={{ left: `${left}%`, width: `${Math.max(width, 3)}%`, backgroundColor: s.recommended ? '#722ED1' : '#F3EAFF' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Hozie recommendation card ────────────────────────────────────────────────

function RecommendationBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-[#242326] w-[92px] shrink-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(243,234,255,0.10)' }}>
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: '#722ED1' }} />
      </div>
      <span className="text-[12px] font-semibold w-[30px] text-right shrink-0" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: '#722ED1' }}>{percent}%</span>
    </div>
  )
}

function HozieRecommendationCard({ scenarios, onAskWhy }: { scenarios: EstimateScenario[]; onAskWhy: () => void }) {
  const rec = scenarios.find(s => s.id === hozieRecommendation.recommendedId)
  return (
    <div
      className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-4"
      style={{ background: 'linear-gradient(135deg, #F9F5FF 0%, #FFFFFF 100%)', border: '1px solid rgba(243,234,255,0.10)' }}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Recommends</span>
      </div>

      <span className="text-[26px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: '#242326' }}>{rec?.name}</span>

      <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>“{hozieRecommendation.note}”</p>

      <div className="flex flex-col gap-2.5">
        <RecommendationBar label="Cost balance" percent={hozieRecommendation.costBalance} />
        <RecommendationBar label="Quality" percent={hozieRecommendation.quality} />
        <RecommendationBar label="Value" percent={hozieRecommendation.value} />
      </div>

      <button
        onClick={onAskWhy}
        className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
        style={{ color: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Ask Hozie why →
      </button>
    </div>
  )
}

// ─── Comparison table (desktop) + accordion (mobile) ─────────────────────────

function ComparisonTableDesktop() {
  return (
    <div className="hidden md:block bg-white overflow-hidden" style={{ border: '1px solid #E3DDD7', borderRadius: 16 }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 560 }}>
          <thead>
            <tr style={{ backgroundColor: '#F4F0EC' }}>
              <th scope="col" className="px-4 py-3 text-left text-[12px] sm:text-[12px] uppercase tracking-[0.08em] text-[#68636D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>What Changes?</th>
              {estimateScenarios.map(s => (
                <th key={s.id} scope="col" className="px-4 py-3 text-left text-[12px] sm:text-[12px] uppercase tracking-[0.08em]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: s.recommended ? '#722ED1' : '#808080' }}>
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, i) => (
              <tr key={row.label} style={{ borderTop: i === 0 ? 'none' : '1px solid #FFFFFF' }}>
                <td className="px-4 py-3.5">
                  <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{row.label}</span>
                </td>
                {(['basic', 'standard', 'premium'] as QualityLevel[]).map(key => (
                  <td key={key} className="px-4 py-3.5">
                    <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{row.values[key]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ComparisonAccordionMobile() {
  const [openLabel, setOpenLabel] = useState<string | null>(null)
  return (
    <div className="md:hidden flex flex-col gap-2">
      {comparisonRows.map(row => {
        const open = openLabel === row.label
        return (
          <div key={row.label} className="bg-white overflow-hidden" style={{ border: '1px solid #E3DDD7', borderRadius: 12 }}>
            <button
              onClick={() => setOpenLabel(cur => cur === row.label ? null : row.label)}
              aria-expanded={open}
              aria-label={`${open ? 'Collapse' : 'Expand'} ${row.label} comparison`}
              className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer border-0 bg-transparent"
            >
              <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{row.label}</span>
              <span className="shrink-0 transition-transform duration-200" style={{ color: '#68636D', transform: open ? 'rotate(180deg)' : 'none' }}><IcoChevronDown /></span>
            </button>
            {open && (
              <div className="px-4 pb-3.5 grid grid-cols-3 gap-2 border-t border-[#FFFFFF] pt-3">
                {(['basic', 'standard', 'premium'] as QualityLevel[]).map(key => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-[12px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{key}</span>
                    <span className="text-[12px] text-[#242326]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{row.values[key]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Disclaimer ───────────────────────────────────────────────────────────────

function DisclaimerCard() {
  const factors = ['floor plan', 'structural design', 'material brands', 'site conditions', 'market prices', 'contractor pricing', 'finishing selections']
  return (
    <div className="rounded-[14px] p-4 sm:p-5 flex gap-3" style={{ backgroundColor: '#F4F0EC' }}>
      <span className="shrink-0 text-[#9A949D] mt-0.5"><IcoInfo /></span>
      <p className="text-[11px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        These are planning scenarios, not final quotations. Final costs can change based on {factors.join(', ')}.
      </p>
    </div>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-[20px] border border-[#E3DDD7] p-6 flex flex-col gap-3">
      <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: '30%' }} />
      <div className="h-6 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: '70%' }} />
      <div className="h-3 rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', width: '90%' }} />
      <div className="h-9 rounded-[10px] animate-pulse mt-4" style={{ backgroundColor: '#F4F0EC' }} />
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
        Unable to generate construction options. Try again.
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

type ScreenStatus = 'loading' | 'ready' | 'error'

export default function EstimateComparisonScreen({
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
  // 11D — scenarios below are derived synchronously from projectId/House
  // Requirements (no async work happens), so status starts 'ready'
  // immediately rather than behind an artificial delay. 'error' stays
  // defined but unreachable, same as elsewhere in this codebase, in case a
  // real failure path is ever wired.
  const [status, setStatus] = useState<ScreenStatus>('ready')
  const [selectedId, setSelectedId] = useState<QualityLevel | null>(null)

  // Real, requirements-driven scenarios when this project has real House
  // Requirements — same calculateRevisedEstimate() engine, varying only
  // quality/finish/material per tier while keeping the SAME real
  // builtUpArea/floors, so the comparison reflects this actual project.
  // Narrative fields (features/materials/finishes/assumptions/bestFor)
  // are never fabricated per-project — those stay the static, honest
  // descriptions of what each tier generally means. Falls back to the
  // original static numbers when no real project is in context.
  const scenarios = useMemo<EstimateScenario[]>(() => {
    const req = projectId ? getHouseRequirementsForProject(projectId) : undefined
    if (!req) return estimateScenarios
    return estimateScenarios.map(s => {
      const result = calculateRevisedEstimate({
        constructionQuality: s.qualityLevel,
        builtUpArea: req.builtUpArea,
        floors: req.floors,
        finishingLevel: s.qualityLevel,
        materialQuality: QUALITY_TO_MATERIAL_TIER[s.qualityLevel],
        contingency: 5,
      })
      return { ...s, minCost: result.minTotal, maxCost: result.maxTotal, costPerSqFtMin: Math.round(result.costPerSqFt * 0.93), costPerSqFtMax: Math.round(result.costPerSqFt * 1.07) }
    })
  }, [projectId])

  const selectedScenario = useMemo(() => scenarios.find(s => s.id === selectedId) ?? null, [scenarios, selectedId])
  const askHozie = () => onNavigate('ai-advisor', { project_id: projectId || boqOverview.projectId })
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <button
          onClick={() => onNavigate('cost-assumptions')}
          aria-label="Back to estimate"
          className="flex items-center gap-1 text-[#68636D] border-0 bg-transparent cursor-pointer text-[13px]"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        >
          <IcoChevronLeft /> Estimate
        </button>
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Estimate Options</span>
        <button aria-label="Download PDF" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                Estimate Options
              </h1>
              <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                {projectName} · {location} · {area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('cost-assumptions')}
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
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Intro */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <div>
                  <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                    Estimate Options
                  </span>
                  <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                    Choose your construction level.
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 mt-2 max-w-[560px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                    Compare material quality, finishes and estimated costs before you finalize your project estimate.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#F3EAFF] self-start shrink-0" style={{ border: '1px solid rgba(243,234,255,0.10)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#722ED1]" style={{ animation: 'hozieStatusPulse 2.5s ease-in-out infinite' }} />
                  <span className="text-[11px] font-medium text-[#722ED1]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>86% AI confidence</span>
                </div>
              </div>

              {status === 'error' ? (
                <ErrorState onRetry={() => setStatus('loading')} />
              ) : (
                <>
                  {/* Comparison cards */}
                  <div className="flex flex-col md:flex-row gap-4 items-stretch" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                    {status === 'loading'
                      ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                      : scenarios.map(s => (
                        <ScenarioCard
                          key={s.id}
                          scenario={s}
                          emphasized={selectedId ? selectedId === s.id : s.recommended}
                          selected={selectedId === s.id}
                          onSelect={() => setSelectedId(cur => cur === s.id ? null : s.id)}
                        />
                      ))}
                  </div>

                  {status === 'ready' && (
                    <>
                      {/* Comparison table */}
                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.16s both' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>What Changes?</span>
                        </div>
                        <ComparisonTableDesktop />
                        <ComparisonAccordionMobile />
                      </div>

                      {/* Cost impact + Hozie recommendation */}
                      <div className="grid lg:grid-cols-2 gap-4" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.2s both' }}>
                        <CostImpact scenarios={scenarios} />
                        <HozieRecommendationCard scenarios={scenarios} onAskWhy={askHozie} />
                      </div>

                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.24s both' }}>
                        <DisclaimerCard />
                      </div>
                    </>
                  )}
                </>
              )}

            </div>
          </main>

          {/* Selection footer */}
          {status === 'ready' && (
            <div
              className="sticky bottom-0 z-20 bg-white border-t border-[#E3DDD7] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}
            >
              {selectedScenario ? (
                <>
                  <div className="flex flex-col">
                    <span className="text-[12px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Selected</span>
                    <span className="text-[16px] font-semibold uppercase" style={{ fontFamily: '"Geist Variable", sans-serif', color: '#722ED1' }}>{selectedScenario.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedId(null)}
                      className="flex-1 sm:flex-none h-11 px-5 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors"
                      style={{ fontFamily: '"Inter Variable", sans-serif' }}
                    >
                      Change selection
                    </button>
                    <button
                      onClick={() => onNavigate('estimate-revision', { project_name: projectName, location, quality_level: selectedScenario.id, ...(projectId ? { project_id: projectId } : {}) })}
                      className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
                      style={{ backgroundColor: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
                    >
                      Continue with {selectedScenario.name} →
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-[13px] text-[#9A949D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                  Select a construction level to continue.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
