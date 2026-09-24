import { useEffect, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import {
  defaultBOQItemId,
  type BOQItem,
  type CostSensitivityFactor,
} from '@/data/boqDetail'
// Customer Implementation 10I — project-scoped BOQ access layer; see
// boqGeneration.ts for the Estimate → BOQ derivation method.
import { getBOQItemForProject, getBOQCategoryForProject, getRelatedBOQItemsForProject, getEstimateVersionForBOQ, getBOQForProject, getBOQActiveVersionForProject } from '@/data/boqGeneration'
import { formatDateLabel, type EstimateVersion } from '@/data/estimateVersions'
import type { ImpactLevel } from '@/data/costAssumptions'
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
const IcoChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3l4 4-4 4"/>
  </svg>
)
const IcoArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="1.5" x2="7" y2="10.5"/><path d="M3.5 7.5L7 11l3.5-3.5"/>
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



// ─── Small shared bits ─────────────────────────────────────────────────────────

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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-[12px] min-w-0" style={{ backgroundColor: '#FFFFFF' }}>
      <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D] truncate" style={{ fontFamily: FONT_MONO }}>{label}</span>
      <span className="text-[15px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{value}</span>
    </div>
  )
}

const IMPACT_META: Record<Exclude<ImpactLevel, 'baseline'>, { label: string; bg: string; fg: string }> = {
  low: { label: 'LOW', bg: '#CAC7C6', fg: '#808080' },
  medium: { label: 'MEDIUM', bg: '#F3EAFF', fg: '#722ED1' },
  high: { label: 'HIGH', bg: '#722ED1', fg: '#FFFFFF' },
}

function SensitivityRow({ factor }: { factor: CostSensitivityFactor }) {
  const fillPct = factor.impact === 'high' ? 90 : factor.impact === 'medium' ? 55 : 25
  const meta = IMPACT_META[factor.impact]
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[#242326] w-[140px] sm:w-[150px] shrink-0 truncate" style={{ fontFamily: FONT_BODY }}>{factor.factor}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="h-full rounded-full" style={{ width: `${fillPct}%`, backgroundColor: factor.impact === 'high' ? '#722ED1' : '#F3EAFF' }} />
      </div>
      <span className="text-[11px] font-semibold w-[64px] text-right shrink-0" style={{ fontFamily: FONT_MONO, color: meta.fg === '#FFFFFF' ? '#722ED1' : meta.fg }}>
        {meta.label}
      </span>
    </div>
  )
}

// ─── Breadcrumb ─────────────────────────────────────────────────────────────

function Breadcrumb({ categoryName, itemName, onBOQ }: { categoryName: string; itemName: string; onBOQ: () => void }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] flex-wrap min-w-0" style={{ fontFamily: FONT_BODY }}>
      <button onClick={onBOQ} className="border-0 bg-transparent cursor-pointer p-0 hover:underline shrink-0" style={{ color: '#68636D' }}>Detailed BOQ</button>
      <span aria-hidden="true" style={{ color: '#CAC7C6' }}>/</span>
      <button onClick={onBOQ} className="border-0 bg-transparent cursor-pointer p-0 hover:underline shrink-0" style={{ color: '#68636D' }}>{categoryName}</button>
      <span aria-hidden="true" style={{ color: '#CAC7C6' }}>/</span>
      <span className="font-semibold truncate" style={{ color: '#242326' }}>{itemName}</span>
    </nav>
  )
}

// ─── Header ─────────────────────────────────────────────────────────────────

function BOQItemHeader({ item, categoryName, onBOQ, onEdit }: {
  item: BOQItem; categoryName: string; onBOQ: () => void; onEdit: () => void
}) {
  return (
    <div className="flex flex-col gap-4" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
      <Breadcrumb categoryName={categoryName} itemName={item.name} onBOQ={onBOQ} />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>
            BOQ Item · {String(item.itemNumber).padStart(2, '0')}
          </span>
          <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] m-0 leading-[1.1]" style={{ fontFamily: FONT_HEAD }}>{item.name}</h1>
          <p className="text-[14px] text-[#68636D] leading-[1.6] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>{item.description}</p>
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em] w-fit" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#722ED1' }} aria-hidden="true" /> AI Estimated
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onBOQ} className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border border-[#E3DDD7] text-[12px] font-medium text-[#242326] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all" style={{ fontFamily: FONT_BODY }}>
            <IcoChevronLeft /> Back to BOQ
          </button>
          <button onClick={onEdit} className="h-9 px-4 rounded-[10px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
            Edit Item
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Item summary ───────────────────────────────────────────────────────────

function BOQItemSummary({ item }: { item: BOQItem }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.08s both' }}>
      <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>Item Summary</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Quantity" value={`${item.quantity.toLocaleString('en-IN')} ${item.unit}`} />
          <StatTile label="Material Rate" value={`₹${item.materialRate.toLocaleString('en-IN')} / ${item.unit}`} />
          <StatTile label="Material Cost" value={formatINR(item.materialCost)} />
          <StatTile label="Labour Cost" value={formatINR(item.labourCost)} />
        </div>
        <div className="rounded-[14px] p-5 flex flex-col gap-1" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
          <span className="text-[9px] uppercase tracking-[0.08em]" style={{ color: '#722ED1', fontFamily: FONT_MONO }}>Total Item Cost</span>
          <span className="text-[32px] sm:text-[38px] font-semibold leading-none" style={{ color: '#722ED1', fontFamily: FONT_HEAD }}>{formatINR(item.totalCost)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Cost calculation ───────────────────────────────────────────────────────

function CostCalculationCard({ item }: { item: BOQItem }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.11s both' }}>
      <SectionCard
        eyebrow="Cost Calculation"
        tag={<span className="text-[9px] uppercase tracking-[0.06em] px-2 py-1 rounded-[6px]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>AI Estimated Cost</span>}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#68636D]" style={{ fontFamily: FONT_MONO }}>Material</span>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
              {item.quantity.toLocaleString('en-IN')} {item.unit} × ₹{item.materialRate.toLocaleString('en-IN')} / {item.unit}
            </span>
            <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>= {formatINR(item.materialCost)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-4" style={{ borderTop: '1px solid #FFFFFF' }}>
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#68636D]" style={{ fontFamily: FONT_MONO }}>Labour</span>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>Estimated labour</span>
            <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{formatINR(item.labourCost)}</span>
          </div>
        </div>

        <div className="rounded-[12px] p-4 flex items-center justify-between" style={{ backgroundColor: '#F9F5FF' }}>
          <span className="text-[13px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_HEAD }}>Total</span>
          <span className="text-[20px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_HEAD }}>{formatINR(item.totalCost)}</span>
        </div>

        <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          This is an AI-estimated cost based on regional reference rates — not a guaranteed market quotation. Confirm final pricing with your contractor or supplier before procurement.
        </p>
      </SectionCard>
    </div>
  )
}

// ─── Calculation basis ──────────────────────────────────────────────────────

function BasisRow({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: first ? 'none' : '1px solid #FFFFFF' }}>
      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

function CalculationFlow() {
  const steps = ['Project requirements', 'Quantity estimate', 'Regional rate', 'Material + labour cost']
  return (
    <div className="flex flex-col items-stretch gap-1.5 py-1">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-col items-center gap-1.5">
          <div className="w-full text-center py-2 px-3 rounded-[10px] text-[12px] font-medium" style={{ backgroundColor: '#F4F0EC', color: '#242326', fontFamily: FONT_BODY }}>{s}</div>
          {i < steps.length - 1 && (
            <span aria-hidden="true" className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}>
              <IcoArrowDown />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function CalculationBasisCard({ item, estimateVersion }: { item: BOQItem; estimateVersion?: EstimateVersion }) {
  const area = estimateVersion ? `${estimateVersion.assumptions.builtUpArea.toLocaleString('en-IN')} sq ft` : '—'
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}>
      <SectionCard eyebrow="How Hozie Calculated This">
        <div className="flex flex-col">
          <BasisRow first label="Project area" value={area} />
          <BasisRow label="Floors" value={estimateVersion?.assumptions.floors ?? '—'} />
          <BasisRow label="Construction level" value={estimateVersion?.assumptions.constructionLevel ?? '—'} />
          <BasisRow label="Structural assumption" value={item.calculationBasis} />
          <BasisRow label="Estimated quantity" value={`${item.quantity.toLocaleString('en-IN')} ${item.unit}`} />
          <BasisRow label="Price basis" value={item.priceBasis ?? 'Regional planning estimate'} />
        </div>
        <CalculationFlow />
        <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Hozie starts from your project's size and construction level, estimates how much of this item is typically needed for a project like yours, then applies a regional reference rate to arrive at material and labour cost.
        </p>
      </SectionCard>
    </div>
  )
}

// ─── Specification ──────────────────────────────────────────────────────────

const STRUCTURAL_CATEGORY_IDS = new Set(['foundation', 'rcc-structure'])

function SpecificationCard({ item, categoryId }: { item: BOQItem; categoryId: string }) {
  const spec = item.materials?.[0]
  const note = STRUCTURAL_CATEGORY_IDS.has(categoryId)
    ? 'Final reinforcement quantity and grade must be confirmed by the structural engineer and structural drawings.'
    : 'Final quantity and specification must be confirmed against approved drawings before procurement.'

  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.17s both' }}>
      <SectionCard eyebrow="Specification">
        <div className="flex flex-col">
          <BasisRow first label="Material" value={spec?.material ?? item.name} />
          {spec?.grade && <BasisRow label="Grade" value={spec.grade} />}
          {spec?.application && <BasisRow label="Application" value={spec.application} />}
        </div>

        {!!item.applications?.length && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Used In</span>
            <div className="flex flex-wrap gap-1.5">
              {item.applications.map(a => (
                <span key={a} className="px-2.5 py-1 rounded-full text-[11px]" style={{ backgroundColor: '#F4F0EC', color: '#242326', fontFamily: FONT_BODY }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[12px] p-3.5" style={{ backgroundColor: '#FEF3C7' }}>
          <p className="text-[12px] text-[#D97706] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{note}</p>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Rate information ───────────────────────────────────────────────────────

function RateInformationCard({ item }: { item: BOQItem }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.09s both' }}>
      <SectionCard eyebrow="Rate Information">
        <div className="flex flex-col">
          <BasisRow first label="Current reference rate" value={`₹${item.materialRate.toLocaleString('en-IN')} / ${item.unit}`} />
          {item.rateMin != null && item.rateMax != null && (
            <BasisRow label="Rate range" value={`₹${item.rateMin.toLocaleString('en-IN')} — ₹${item.rateMax.toLocaleString('en-IN')} / ${item.unit}`} />
          )}
          <BasisRow label="Rate basis" value={item.priceBasis ?? 'Regional planning estimate'} />
          <BasisRow label="Location" value={item.location ?? 'Hyderabad'} />
          <BasisRow label="Price status" value="Reference estimate" />
        </div>
        <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Rate may change based on supplier, brand, quantity, delivery and market conditions.
        </p>
      </SectionCard>
    </div>
  )
}

// ─── AI confidence ───────────────────────────────────────────────────────────

const CONFIDENCE_LABEL: Record<BOQItem['confidence'], string> = { high: 'High', medium: 'Medium', low: 'Low' }

function AIConfidenceCard({ item }: { item: BOQItem }) {
  const score = item.confidenceScore ?? 0
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.12s both' }}>
      <div className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-4" style={{ background: 'linear-gradient(135deg, #F9F5FF 0%, #FFFFFF 100%)', border: '1px solid rgba(243,234,255,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
          <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Confidence</span>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-[40px] font-semibold leading-none" style={{ fontFamily: FONT_HEAD, color: '#722ED1' }}>{score}%</span>
          <span className="text-[13px] text-[#68636D] mb-1" style={{ fontFamily: FONT_BODY }}>{CONFIDENCE_LABEL[item.confidence]}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(243,234,255,0.10)' }}>
          <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: '#722ED1' }} />
        </div>

        {!!item.confidenceWhy?.length && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Why</span>
            <ul className="flex flex-col gap-1.5 m-0 p-0" style={{ listStyle: 'none' }}>
              {item.confidenceWhy.map(f => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                  <span aria-hidden="true" style={{ color: '#722ED1' }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!!item.confidenceImprove?.length && (
          <div className="flex flex-col gap-1.5 pt-1" style={{ borderTop: '1px solid rgba(243,234,255,0.10)' }}>
            <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>What Can Improve Accuracy</span>
            <ul className="flex flex-col gap-1.5 m-0 p-0" style={{ listStyle: 'none' }}>
              {item.confidenceImprove.map(f => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                  <span aria-hidden="true" style={{ color: '#9A949D' }}>—</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Cost sensitivity ────────────────────────────────────────────────────────

function CostSensitivityCard({ item }: { item: BOQItem }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.15s both' }}>
      <SectionCard eyebrow="What Can Change This Cost?">
        <div className="flex flex-col gap-3">
          {(item.costSensitivity ?? []).map(f => <SensitivityRow key={f.factor} factor={f} />)}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Related items ───────────────────────────────────────────────────────────

function RelatedBOQItems({ items, onOpen }: { items: BOQItem[]; onOpen: (id: string) => void }) {
  if (items.length === 0) return null
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.18s both' }}>
      <SectionCard eyebrow="Related Items">
        <div className="flex flex-col">
          {items.map((r, i) => (
            <button
              key={r.id}
              onClick={() => onOpen(r.id)}
              className="w-full flex items-center justify-between gap-3 py-3 text-left cursor-pointer border-0 bg-transparent hover:bg-[#FFFFFF] transition-colors -mx-1 px-1 rounded-[8px]"
              style={{ borderTop: i === 0 ? 'none' : '1px solid #FFFFFF' }}
            >
              <span className="text-[13px] font-medium text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{r.name}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{formatINR(r.totalCost)}</span>
                <span style={{ color: '#9A949D' }}><IcoChevronRight /></span>
              </span>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Hozie action ───────────────────────────────────────────────────────────

function HozieAction({ item, onAskHozie }: { item: BOQItem; onAskHozie: () => void }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.2s both' }}>
      <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
          <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Ask Hozie</span>
        </div>
        <p className="text-[14px] text-[#242326] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
          "Why do I need {item.quantity.toLocaleString('en-IN')} {item.unit} of {item.name.toLowerCase()}?"
        </p>
        <button onClick={onAskHozie} className="self-start h-9 px-4 rounded-[10px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
          Ask Hozie →
        </button>
      </div>
    </div>
  )
}

// ─── Version info ───────────────────────────────────────────────────────────

function VersionInfo({ estimateVersion, boqVersionNumber, boqCreatedAt }: { estimateVersion?: EstimateVersion; boqVersionNumber?: number; boqCreatedAt?: string }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.22s both' }}>
      <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-wrap">
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase shrink-0" style={{ fontFamily: FONT_MONO }}>Version</span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Customer Implementation 10L — BOQ uses its own real version
              number, not the Estimate's (they diverge the moment a BOQ edit
              exists — Estimate correctly never changes; BOQ does). */}
          {[
            ['Estimate', estimateVersion ? `Version ${estimateVersion.versionNumber}` : '—'],
            ['BOQ', boqVersionNumber ? `Version ${boqVersionNumber}` : '—'],
            ['Item', 'Active'],
            ['Created', boqCreatedAt ? formatDateLabel(boqCreatedAt) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}:</span>
              <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function SkeletonBlock({ h = 14, w = '60%' }: { h?: number; w?: string }) {
  return <div className="rounded-full animate-pulse" style={{ backgroundColor: '#FFFFFF', height: h, width: w }} />
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
      <div className="flex flex-col gap-3">
        <SkeletonBlock h={10} w="30%" />
        <SkeletonBlock h={30} w="45%" />
        <SkeletonBlock h={12} w="55%" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[16px] border border-[#E3DDD7] p-6 flex flex-col gap-3">
          <SkeletonBlock h={10} w="25%" />
          <SkeletonBlock h={16} w="70%" />
          <SkeletonBlock h={16} w="50%" />
        </div>
      ))}
    </div>
  )
}

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-white rounded-[16px] border border-[#E3DDD7]">
      <span style={{ color: '#DC2626' }}><IcoAlert /></span>
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Unable to load this BOQ item.</p>
      <button onClick={onRetry} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>Try again</button>
    </div>
  )
}

function NotFoundPanel({ onBOQ }: { onBOQ: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-white rounded-[16px] border border-[#E3DDD7]">
      <span style={{ color: '#9A949D' }}><IcoEmptyBox /></span>
      <p className="text-[14px] text-[#68636D] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>This BOQ item is no longer available in the active version.</p>
      <button onClick={onBOQ} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>Back to BOQ</button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'loading' | 'ready' | 'error' | 'not-found'

export default function BOQItemDetailScreen({
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
   *  boqOverview.projectId ('proj-001'); a project with no BOQ/item lands
   *  on the existing 'not-found' state instead of a substitute project's
   *  item. */
  projectId?: string
}) {
  const resolvedId = itemId ?? defaultBOQItemId
  // Customer Implementation 10L — the item lookup below is a synchronous,
  // in-memory read (boqGeneration.ts), so status reflects it immediately
  // rather than behind an artificial 500ms timer.
  const [status, setStatus] = useState<ScreenStatus>(() => (getBOQItemForProject(projectId, resolvedId) ? 'ready' : 'not-found'))

  useEffect(() => {
    setStatus(getBOQItemForProject(projectId, resolvedId) ? 'ready' : 'not-found')
  }, [resolvedId, projectId])

  const item = getBOQItemForProject(projectId, resolvedId)
  const category = item ? getBOQCategoryForProject(projectId, item.categoryId) : undefined
  const related = item ? getRelatedBOQItemsForProject(projectId, item) : []
  const overview = getBOQForProject(projectId)
  // Customer Implementation 10L — the real active BOQ version, for the
  // header badge below. Was previously (10I) using the Estimate's own
  // versionNumber for BOTH halves of "ESTIMATE V{n} · BOQ V{n}" — Estimate
  // correctly never changes from a BOQ edit, but that meant the badge kept
  // showing "BOQ V1" forever even after real BOQ edits created V2/V3.
  const activeBOQVersion = getBOQActiveVersionForProject(projectId)
  const estimateVersion = getEstimateVersionForBOQ(projectId)

  const goBOQ = () => onNavigate('detailed-boq')
  const goEdit = () => item && onNavigate('boq-edit', { boq_item_id: item.id })
  const openRelated = (id: string) => onNavigate('boq-item-detail', { boq_item_id: id })
  const viewEstimate = () => onNavigate('estimate-dashboard')
  const askHozie = () => item && onNavigate('ai-advisor', {
    project_id: projectId ?? '',
    estimate_version_id: overview?.estimateVersionId ?? '',
    boq_version_id: overview?.id ?? '',
    boq_item_id: item.id,
  })
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <button onClick={goBOQ} aria-label="Back to Detailed BOQ" className="flex items-center gap-1 text-[#68636D] border-0 bg-transparent cursor-pointer text-[13px]" style={{ fontFamily: FONT_BODY }}>
          <IcoChevronLeft /> BOQ
        </button>
        <span className="text-[15px] font-semibold text-[#242326] truncate px-2" style={{ fontFamily: FONT_HEAD }}>BOQ Item</span>
        <button onClick={goEdit} aria-label="Edit item" className="w-8 h-8 flex items-center justify-center text-[#722ED1] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="boq" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>BOQ Item Detail</h1>
              <span className="text-[13px] text-[#68636D] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span className="text-[11px] px-2.5 py-1.5 rounded-full shrink-0" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
              {estimateVersion ? `ESTIMATE V${estimateVersion.versionNumber}` : 'ESTIMATE'}
              {activeBOQVersion ? ` · BOQ V${activeBOQVersion.versionNumber}` : ''}
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Customer Implementation 10L — 'loading'/'error' removed:
                  the item lookup is synchronous, so status can now only
                  genuinely be 'ready' or 'not-found'. LoadingSkeleton/
                  ErrorPanel stay defined, unused, for a real future async
                  step rather than being deleted outright. */}

              {status === 'not-found' && (
                <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                  <NotFoundPanel onBOQ={goBOQ} />
                </div>
              )}

              {status === 'ready' && item && category && (
                <>
                  <BOQItemHeader item={item} categoryName={category.name} onBOQ={goBOQ} onEdit={goEdit} />

                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-6">
                      <BOQItemSummary item={item} />
                      <CostCalculationCard item={item} />
                      <CalculationBasisCard item={item} estimateVersion={estimateVersion} />
                      <SpecificationCard item={item} categoryId={category.id} />
                    </div>

                    <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6">
                      <RateInformationCard item={item} />
                      <AIConfidenceCard item={item} />
                      <CostSensitivityCard item={item} />
                      <RelatedBOQItems items={related} onOpen={openRelated} />
                    </div>
                  </div>

                  <HozieAction item={item} onAskHozie={askHozie} />
                  <VersionInfo estimateVersion={estimateVersion} boqVersionNumber={activeBOQVersion?.versionNumber} boqCreatedAt={overview?.createdAt} />

                  <div className="flex flex-col sm:flex-row gap-2.5 pb-1" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.24s both' }}>
                    <button onClick={goBOQ} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>
                      Back to BOQ
                    </button>
                    <button onClick={viewEstimate} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>
                      View Estimate
                    </button>
                    <button className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors flex items-center justify-center gap-1.5" style={{ fontFamily: FONT_BODY }}>
                      <IcoDownload /> Download Item Details
                    </button>
                    <button onClick={goEdit} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
                      Edit Item
                    </button>
                  </div>
                </>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
