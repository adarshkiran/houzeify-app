import { useEffect, useMemo, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import ConfidenceBadge from '@/shared/components/ConfidenceBadge'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import {
  materialCalcDefinitions,
  defaultProjectInput,
  defaultAssumptionsFor,
  calculateMaterialQuantity,
  getBOQComparisonForMaterial,
  CONSTRUCTION_LEVEL_MULTIPLIER,
  type MaterialCalcId,
  type MaterialCalcDefinition,
  type MaterialCalcResult,
  type MaterialAssumptions,
  type ProjectCalcInput,
  type ConstructionLevel,
  type CalculatorMode,
} from '@/data/materialCalculator'
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
const IcoChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5l4 4 4-4"/>
  </svg>
)
const IcoWarning = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2L15 14H1L8 2z"/><line x1="8" y1="6.5" x2="8" y2="9.5"/><circle cx="8" cy="11.5" r="0.6" fill="currentColor" stroke="none"/>
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

// Per-material icons — simple, distinguishable silhouettes at the app's standard 18px scale.
const MATERIAL_ICONS: Record<MaterialCalcId, React.ReactNode> = {
  cement: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h10l1 10.5a1 1 0 01-1 1.1H4a1 1 0 01-1-1.1L4 4z"/><line x1="4.6" y1="7.5" x2="13.4" y2="7.5"/>
    </svg>
  ),
  steel: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="15" x2="15" y2="3"/><path d="M3 15c0-1.5 1-1.5 1.5-2.5S4 11 5 10s1.5.5 2.5-.5S7 8 8 7s1.5.5 2.5-.5S10 5 11 4s1.5.5 2.5-.5"/>
    </svg>
  ),
  sand: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 14.5c1-6 4-9 6.5-9s5.5 3 6.5 9z"/><line x1="2" y1="14.5" x2="16" y2="14.5"/>
    </svg>
  ),
  aggregate: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l2.5-4L9 8l2-4.5L15 8l-1.5 5.5H4z"/>
    </svg>
  ),
  'aac-blocks': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4.5" width="6" height="4.5"/><rect x="8" y="4.5" width="6" height="4.5"/>
      <rect x="5" y="9" width="6" height="4.5"/>
    </svg>
  ),
  concrete: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5l6-2.5L15 5v2L9 9.5 3 7z"/><path d="M3 7v6l6 2.5V9.5"/><path d="M15 7v6l-6 2.5"/>
    </svg>
  ),
  mortar: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3l7 7"/><path d="M9 2.5l6.5 6.5-2 2L7 4.5z"/><path d="M4 12l2 2-2.5 2.5L1 14z"/>
    </svg>
  ),
}

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

function SectionCard({ eyebrow, tag, children }: { eyebrow: string; tag?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>{eyebrow}</span>
        {tag}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: first ? 'none' : '1px solid #FFFFFF' }}>
      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

function fmtQty(n: number): string {
  return n % 1 === 0 ? n.toLocaleString('en-IN') : n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// ─── Calculator mode ─────────────────────────────────────────────────────────

function CalculatorMode({ mode, onChange }: { mode: CalculatorMode; onChange: (m: CalculatorMode) => void }) {
  return (
    <div role="radiogroup" aria-label="Calculator mode" className="inline-flex items-center gap-1 p-1 rounded-[10px] w-fit" style={{ backgroundColor: '#F4F0EC' }}>
      {(['project', 'custom'] as CalculatorMode[]).map(m => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className="h-9 px-5 rounded-[8px] text-[13px] font-semibold cursor-pointer border-0 capitalize transition-colors"
          style={{
            fontFamily: FONT_BODY,
            backgroundColor: mode === m ? '#FFFFFF' : 'transparent',
            color: mode === m ? '#722ED1' : '#808080',
            boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

// ─── Project / custom inputs ─────────────────────────────────────────────────

function ProjectInputsPanel({ location }: { location: string }) {
  return (
    <div className="flex flex-col">
      <Row first label="Built-up area" value={`${defaultProjectInput.builtUpArea.toLocaleString('en-IN')} sq ft`} />
      <Row label="Floors" value="G+1" />
      <Row label="Construction level" value={defaultProjectInput.constructionLevel} />
      <Row label="Location" value={location} />
    </div>
  )
}

function CustomInputsPanel({ input, onChange }: { input: ProjectCalcInput; onChange: (i: ProjectCalcInput) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="mc-area" className="text-[12px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>Built-up area</label>
        <div className="flex items-center gap-2">
          <input
            id="mc-area"
            type="number"
            inputMode="numeric"
            min="0"
            value={input.builtUpArea}
            onChange={e => onChange({ ...input, builtUpArea: e.target.value === '' ? 0 : Number(e.target.value) })}
            className="h-10 px-3 rounded-[10px] border border-[#E3DDD7] text-[13px] text-[#242326] outline-none focus:border-[#722ED1] transition-colors bg-white"
            style={{ maxWidth: 160 }}
          />
          <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>sq ft</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mc-floors" className="text-[12px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>Floor count</label>
        <input
          id="mc-floors"
          type="number"
          inputMode="numeric"
          min="1"
          value={input.floors}
          onChange={e => onChange({ ...input, floors: e.target.value === '' ? 1 : Number(e.target.value) })}
          className="h-10 px-3 rounded-[10px] border border-[#E3DDD7] text-[13px] text-[#242326] outline-none focus:border-[#722ED1] transition-colors bg-white"
          style={{ maxWidth: 160 }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>Construction type</span>
        <div role="radiogroup" aria-label="Construction type" className="inline-flex items-center gap-1 p-1 rounded-[10px] w-fit" style={{ backgroundColor: '#F4F0EC' }}>
          {(Object.keys(CONSTRUCTION_LEVEL_MULTIPLIER) as ConstructionLevel[]).map(level => (
            <button
              key={level}
              role="radio"
              aria-checked={input.constructionLevel === level}
              onClick={() => onChange({ ...input, constructionLevel: level })}
              className="h-8 px-3.5 rounded-[8px] text-[12px] font-semibold cursor-pointer border-0 transition-colors"
              style={{
                fontFamily: FONT_BODY,
                backgroundColor: input.constructionLevel === level ? '#FFFFFF' : 'transparent',
                color: input.constructionLevel === level ? '#722ED1' : '#808080',
                boxShadow: input.constructionLevel === level ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Material card ───────────────────────────────────────────────────────────

function MaterialCard({ material, result, selected, onSelect }: {
  material: MaterialCalcDefinition
  result: MaterialCalcResult | null
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="text-left flex flex-col gap-3 p-4 rounded-[14px] bg-white cursor-pointer transition-all"
      style={{
        border: selected ? '2px solid #722ED1' : '1px solid #CAC7C6',
        boxShadow: selected ? '0 4px 16px rgba(243,234,255,0.10)' : 'none',
      }}
    >
      <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}>
        {MATERIAL_ICONS[material.id]}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{material.name}</span>
        {result ? (
          <span className="text-[18px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>
            {fmtQty(result.quantity)} <span className="text-[12px] font-normal text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{result.unit}</span>
          </span>
        ) : (
          <span className="text-[13px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Not calculated</span>
        )}
      </div>
      <span className="text-[11px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>View calculation →</span>
    </button>
  )
}

// ─── Calculation panel ───────────────────────────────────────────────────────

function CalculationPanel({
  material, result, assumptions, onAssumptionsChange, onResetAssumptions, isCustomAssumptions, onAskHozie, onViewFullDetail,
}: {
  material: MaterialCalcDefinition
  result: MaterialCalcResult
  assumptions: MaterialAssumptions
  onAssumptionsChange: (a: MaterialAssumptions) => void
  onResetAssumptions: () => void
  isCustomAssumptions: boolean
  onAskHozie: () => void
  onViewFullDetail: () => void
}) {
  const [showAdjust, setShowAdjust] = useState(false)
  const boqComparison = getBOQComparisonForMaterial(material.id, result.quantity)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}>
            {MATERIAL_ICONS[material.id]}
          </span>
          <span className="text-[16px] font-semibold text-[#242326] uppercase tracking-[0.02em]" style={{ fontFamily: FONT_HEAD }}>{material.name}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#722ED1' }} aria-hidden="true" /> AI Estimate
        </span>
      </div>

      <div className="rounded-[14px] p-5 flex flex-col gap-1" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
        <span className="text-[9px] uppercase tracking-[0.08em]" style={{ color: '#722ED1', fontFamily: FONT_MONO }}>Estimated Quantity</span>
        <span className="text-[32px] font-semibold leading-none" style={{ color: '#722ED1', fontFamily: FONT_HEAD }}>
          {fmtQty(result.quantity)} <span className="text-[16px] font-normal">{result.unit}</span>
        </span>
        {result.approxWeightMT != null && (
          <span className="text-[12px] text-[#68636D] mt-1" style={{ fontFamily: FONT_BODY }}>Approximate weight: {result.approxWeightMT} MT</span>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#9A949D] pb-1" style={{ fontFamily: FONT_MONO }}>Calculation Basis</span>
        <Row first label="Built-up area" value={`${defaultProjectInput.builtUpArea.toLocaleString('en-IN')} sq ft`} />
        <Row label="Construction type" value={material.constructionTypeLabel} />
        <Row label="Estimated consumption" value={`${assumptions.consumptionFactor} ${material.consumptionUnit}`} />
      </div>

      <div className="rounded-[12px] p-4 flex flex-col gap-1" style={{ backgroundColor: '#FFFFFF' }}>
        <span className="text-[12px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
          {defaultProjectInput.builtUpArea.toLocaleString('en-IN')} × {assumptions.consumptionFactor} <span aria-hidden="true">≈</span> {result.rawQuantity.toLocaleString('en-IN')} {material.unit}
        </span>
        <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
          Rounded: {fmtQty(result.quantity)} {material.unit}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Estimated Range</span>
          <ConfidenceBadge level={result.confidence} />
        </div>
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
          {fmtQty(result.minQuantity)} — {fmtQty(result.maxQuantity)} {material.unit}
        </span>
        <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Actual quantity can vary based on structural design, concrete mix, wall thickness, wastage and site conditions.
        </p>
      </div>

      {boqComparison && (
        <div className="rounded-[12px] p-4 flex flex-col gap-2" style={{ backgroundColor: '#F4F0EC' }}>
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#68636D]" style={{ fontFamily: FONT_MONO }}>Compare with BOQ</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>BOQ quantity</span>
              <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{boqComparison.boqQuantity} {boqComparison.boqUnit}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Calculator</span>
              <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{boqComparison.calculatorQuantity} {boqComparison.boqUnit}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Difference</span>
              <span className="text-[13px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>{boqComparison.difference > 0 ? '+' : ''}{boqComparison.difference} {boqComparison.boqUnit}</span>
            </div>
          </div>
          <p className="text-[11px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>The BOQ quantity is not automatically changed by this calculator.</p>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-1" style={{ borderTop: '1px solid #FFFFFF' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setShowAdjust(s => !s)} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
            {showAdjust ? 'Hide assumptions' : 'Adjust assumptions'}
          </button>
          {isCustomAssumptions && (
            <button onClick={onResetAssumptions} className="text-[11px] font-medium cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#9A949D', fontFamily: FONT_BODY }}>
              Reset to default
            </button>
          )}
        </div>

        {showAdjust && (
          <div className="flex flex-col gap-4 rounded-[12px] p-4" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mc-factor" className="flex items-center justify-between text-[12px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                <span>Consumption</span>
                <span className="font-semibold">{assumptions.consumptionFactor} {material.consumptionUnit}</span>
              </label>
              <input
                id="mc-factor"
                type="range"
                min={(material.consumptionFactor * 0.6).toFixed(2)}
                max={(material.consumptionFactor * 1.4).toFixed(2)}
                step={0.01}
                value={assumptions.consumptionFactor}
                onChange={e => onAssumptionsChange({ ...assumptions, consumptionFactor: Number(e.target.value) })}
                style={{ accentColor: '#722ED1' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mc-wastage" className="flex items-center justify-between text-[12px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                <span>Wastage</span>
                <span className="font-semibold">{assumptions.wastagePct}%</span>
              </label>
              <input
                id="mc-wastage"
                type="range"
                min={0}
                max={20}
                step={1}
                value={assumptions.wastagePct}
                onChange={e => onAssumptionsChange({ ...assumptions, wastagePct: Number(e.target.value) })}
                style={{ accentColor: '#722ED1' }}
              />
            </div>
            <Row first label="Unit" value={material.unit} />
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button onClick={onViewFullDetail} className="flex-1 h-10 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>
          Full material detail →
        </button>
        <button onClick={onAskHozie} className="flex-1 h-10 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
          Ask Hozie
        </button>
      </div>
    </div>
  )
}

// ─── Material summary ───────────────────────────────────────────────────────

function MaterialSummary({ results }: { results: Map<MaterialCalcId, MaterialCalcResult> }) {
  const rows = materialCalcDefinitions.filter(m => m.includeInSummary)
  return (
    <SectionCard eyebrow="Material Summary">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 480 }}>
          <thead>
            <tr>
              {['Material', 'Quantity', 'Unit', 'Estimated Cost'].map((h, i) => (
                <th key={h} scope="col" className={['px-2 py-2 text-left text-[9px] uppercase tracking-[0.08em] text-[#9A949D]', i === 3 ? 'text-right' : ''].join(' ')} style={{ fontFamily: FONT_MONO }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(m => {
              const r = results.get(m.id)
              return (
                <tr key={m.id} style={{ borderTop: '1px solid #FFFFFF' }}>
                  <td className="px-2 py-2.5 text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{m.name}</td>
                  <td className="px-2 py-2.5 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{r ? fmtQty(r.quantity) : '—'}</td>
                  <td className="px-2 py-2.5 text-[12px] uppercase tracking-[0.04em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{m.unit}</td>
                  <td className="px-2 py-2.5 text-[13px] font-semibold text-[#242326] text-right" style={{ fontFamily: FONT_HEAD }}>{r ? formatINR(r.estimatedCost) : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0">
        Demonstration values only. Concrete and mortar are excluded from this summary — they're derived volumes of the cement, sand and aggregate already listed above, and including them would double-count the same material.
      </p>
    </SectionCard>
  )
}

// ─── Hozie insight ───────────────────────────────────────────────────────────

function HozieInsight({ onAnalyzePlan }: { onAnalyzePlan: () => void }) {
  return (
    <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Insight</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
        "Steel quantity depends heavily on structural design. Once you upload the structural drawings, Hozie can replace this preliminary estimate with a more project-specific quantity."
      </p>
      <button onClick={onAnalyzePlan} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>Analyze my plan →</button>
    </div>
  )
}

// ─── BOQ connection ──────────────────────────────────────────────────────────

function BOQConnection({ onViewBOQ }: { onViewBOQ: () => void }) {
  return (
    <SectionCard eyebrow={`Linked to BOQ V${boqActiveVersion.versionNumber}`}>
      <div className="flex flex-col">
        <Row first label="Estimate" value={`Version ${boqActiveVersion.estimateVersionId.replace('est-v', '')}`} />
        <Row label="BOQ" value={`Version ${boqActiveVersion.versionNumber}`} />
        <Row label="Built-up area" value={`${defaultProjectInput.builtUpArea.toLocaleString('en-IN')} sq ft`} />
        <Row label="Construction level" value={defaultProjectInput.constructionLevel} />
      </div>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        The calculator uses these project details by default. Calculated quantities don't automatically change the BOQ.
      </p>
      <button onClick={onViewBOQ} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>View BOQ →</button>
    </SectionCard>
  )
}

// ─── Important note ──────────────────────────────────────────────────────────

function ImportantNote() {
  return (
    <div className="rounded-[12px] p-4 flex items-start gap-3" style={{ backgroundColor: '#FEF3C7' }}>
      <span className="shrink-0 mt-0.5" style={{ color: '#D97706' }}><IcoWarning /></span>
      <p className="text-[12px] text-[#D97706] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        These are preliminary planning calculations, not engineering-certified quantities. Final quantities should be validated against architectural, structural and MEP drawings, the final BOQ and your engineer's specifications.
      </p>
    </div>
  )
}

// ─── Mobile bottom sheet ──────────────────────────────────────────────────────

function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
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
      <div onClick={onClose} aria-hidden="true" className={['lg:hidden fixed inset-0 bg-black transition-opacity duration-200 z-40', open ? 'opacity-30 pointer-events-auto' : 'opacity-0 pointer-events-none'].join(' ')} />
      <div
        role="dialog"
        aria-modal="true"
        className={[
          'lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[20px] max-h-[86vh] flex flex-col transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        style={{ boxShadow: '0 -8px 40px rgba(36,35,38,0.12)' }}
      >
        <div className="flex items-center justify-end px-5 py-3 border-b border-[#E3DDD7] shrink-0">
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer border-0 bg-transparent transition-colors"><IcoClose /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function CalculatingPanel() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-14">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3EAFF', animation: 'aiIconGlow 1.6s ease-in-out infinite' }}>
        <HIcon size={26} />
      </div>
      <span className="text-[12px] uppercase tracking-[0.10em]" style={{ fontFamily: FONT_MONO, color: '#722ED1' }}>Hozie is calculating material requirements…</span>
    </div>
  )
}

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-14 bg-white rounded-[16px] border border-[#E3DDD7]">
      <span style={{ color: '#DC2626' }}><IcoAlert /></span>
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Unable to calculate material quantities.</p>
      <button onClick={onRetry} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>Try again</button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'initial' | 'calculating' | 'results' | 'error'

export default function MaterialCalculatorScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  /** Real id from projectData.project_id, if one already exists in this
   *  session. Always preferred over boqActiveVersion.projectId ('proj-001'). */
  projectId?: string
}) {
  const [mode, setMode] = useState<CalculatorMode>('project')
  const [customInput, setCustomInput] = useState<ProjectCalcInput>({ ...defaultProjectInput })
  const [status, setStatus] = useState<ScreenStatus>('initial')
  const [selectedId, setSelectedId] = useState<MaterialCalcId | null>(null)
  const [assumptionsById, setAssumptionsById] = useState<Record<string, MaterialAssumptions>>({})
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeProject: ProjectCalcInput = mode === 'project' ? defaultProjectInput : customInput

  const getAssumptions = (m: MaterialCalcDefinition): MaterialAssumptions => assumptionsById[m.id] ?? defaultAssumptionsFor(m)

  const results = useMemo(() => {
    const map = new Map<MaterialCalcId, MaterialCalcResult>()
    if (status !== 'results') return map
    for (const m of materialCalcDefinitions) {
      map.set(m.id, calculateMaterialQuantity(activeProject, m, getAssumptions(m)))
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeProject, assumptionsById])

  // 11E — calculateMaterialQuantity() (invoked by the `results` useMemo above)
  // is a synchronous formula, not a real async calculation — so confirming
  // resolves immediately rather than behind an artificial delay. 'calculating'
  // and 'error' stay defined but unreachable, same as elsewhere in this
  // codebase, in case a real async engine or failure path is ever wired.
  const calculate = () => setStatus('results')

  const reset = () => {
    setStatus('initial')
    setSelectedId(null)
    setAssumptionsById({})
    setSheetOpen(false)
  }

  const selectMaterial = (id: MaterialCalcId) => {
    setSelectedId(id)
    setSheetOpen(true)
  }

  const goBOQ = () => onNavigate('detailed-boq')
  const analyzePlan = () => onNavigate('upload-plan')
  const resolvedProjectId = projectId || boqActiveVersion.projectId
  const askHozie = (materialId?: MaterialCalcId) => onNavigate('ai-advisor', { ...(materialId ? { material_id: materialId } : {}), project_id: resolvedProjectId })
  const viewFullDetail = (materialId: MaterialCalcId) => onNavigate('material-detail', { material_id: materialId })

  const selectedMaterial = selectedId ? materialCalcDefinitions.find(m => m.id === selectedId) ?? null : null
  const selectedResult = selectedMaterial ? results.get(selectedMaterial.id) ?? null : null
  const selectedAssumptions = selectedMaterial ? getAssumptions(selectedMaterial) : null

  const panelFor = (material: MaterialCalcDefinition, result: MaterialCalcResult) => (
    <CalculationPanel
      material={material}
      result={result}
      assumptions={getAssumptions(material)}
      onAssumptionsChange={a => setAssumptionsById(prev => ({ ...prev, [material.id]: a }))}
      onResetAssumptions={() => setAssumptionsById(prev => { const next = { ...prev }; delete next[material.id]; return next })}
      isCustomAssumptions={!!assumptionsById[material.id]}
      onAskHozie={() => askHozie(material.id)}
      onViewFullDetail={() => viewFullDetail(material.id)}
    />
  )
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Material Calculator</span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>BOQ V{boqActiveVersion.versionNumber}</span>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="calc" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Material Calculator</h1>
              <span className="text-[13px] text-[#68636D] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#722ED1' }} /> BOQ V{boqActiveVersion.versionNumber} · ACTIVE
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 pb-24 lg:pb-8">

              <div className="flex flex-col gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Material Calculator</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>How much material do you need?</h1>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[620px]" style={{ fontFamily: FONT_BODY }}>
                  Estimate the major construction materials required for your project. Hozie uses your project details and construction assumptions to provide approximate quantities.
                </p>
                <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{projectName} · {defaultProjectInput.builtUpArea.toLocaleString('en-IN')} sq ft</span>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left: calculator controls */}
                <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-4" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.08s both' }}>
                  <CalculatorMode mode={mode} onChange={m => { setMode(m); reset() }} />
                  <SectionCard eyebrow={mode === 'project' ? 'Project Details' : 'Custom Inputs'}>
                    {mode === 'project' ? <ProjectInputsPanel location={location} /> : <CustomInputsPanel input={customInput} onChange={setCustomInput} />}
                    <button
                      onClick={calculate}
                      className="hidden lg:block w-full h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
                      style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
                    >
                      {mode === 'project' ? 'Calculate materials →' : 'Calculate →'}
                    </button>
                  </SectionCard>
                  {status === 'results' && (
                    <button onClick={reset} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#68636D', fontFamily: FONT_BODY }}>
                      Reset calculation
                    </button>
                  )}
                  <div className="hidden lg:block"><ImportantNote /></div>
                </div>

                {/* Right: results */}
                <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-6">
                  {status === 'initial' && (
                    <div className="flex flex-col items-center justify-center text-center gap-2 py-14 bg-white rounded-[16px] border border-dashed" style={{ borderColor: '#E3DDD7' }}>
                      <span style={{ color: '#9A949D' }}><IcoCalc /></span>
                      <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Run the calculator to see estimated quantities for cement, steel, sand and more.</p>
                    </div>
                  )}

                  {status === 'calculating' && <CalculatingPanel />}
                  {status === 'error' && <ErrorPanel onRetry={calculate} />}

                  {status === 'results' && (
                    <>
                      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: '#16A34A', fontFamily: FONT_BODY }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }} /> Material estimate ready ✓
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                        {materialCalcDefinitions.map(m => (
                          <MaterialCard key={m.id} material={m} result={results.get(m.id) ?? null} selected={selectedId === m.id} onSelect={() => selectMaterial(m.id)} />
                        ))}
                      </div>

                      {/* Desktop inline panel */}
                      {selectedMaterial && selectedResult && selectedAssumptions && (
                        <div className="hidden lg:block bg-white rounded-[16px] border-2 p-5 sm:p-6" style={{ borderColor: '#722ED1', animation: 'welcomeFadeUp 0.4s ease-out both' }}>
                          {panelFor(selectedMaterial, selectedResult)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {status === 'results' && (
                <>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}><MaterialSummary results={results} /></div>
                  <div className="flex flex-col lg:flex-row gap-4 items-start" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.17s both' }}>
                    <div className="w-full lg:flex-1"><HozieInsight onAnalyzePlan={analyzePlan} /></div>
                    <div className="w-full lg:flex-1"><BOQConnection onViewBOQ={goBOQ} /></div>
                  </div>
                </>
              )}

              <div className="lg:hidden"><ImportantNote /></div>
            </div>
          </main>

          {/* Sticky calculate button (mobile) */}
          {status !== 'results' && (
            <div className="lg:hidden sticky bottom-0 z-20 bg-white border-t border-[#E3DDD7] px-4 py-3" style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}>
              <button
                onClick={calculate}
                disabled={status === 'calculating'}
                className="w-full h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-60"
                style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
              >
                {mode === 'project' ? 'Calculate materials →' : 'Calculate →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <BottomSheet open={sheetOpen && !!selectedMaterial} onClose={() => setSheetOpen(false)}>
        {selectedMaterial && selectedResult && selectedAssumptions && panelFor(selectedMaterial, selectedResult)}
      </BottomSheet>
    </div>
  )
}
