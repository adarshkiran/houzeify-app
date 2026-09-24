import { useEffect, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import ConfidenceBadge from '@/shared/components/ConfidenceBadge'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import {
  buildMaterialDetail,
  getImportantNote,
  getRelatedMaterials,
  getMaterialBOQConnection,
  type MaterialDetail,
} from '@/data/materialDetail'
import { defaultProjectInput, type MaterialCalcId } from '@/data/materialCalculator'
import { boqOverview } from '@/data/boqOverview'
import { boqActiveVersion } from '@/data/boqVersionHistory'
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

function fmtQty(n: number): string {
  return n % 1 === 0 ? n.toLocaleString('en-IN') : n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const IMPACT_META: Record<Exclude<ImpactLevel, 'baseline'>, { label: string; bg: string; fg: string }> = {
  low: { label: 'LOW', bg: '#CAC7C6', fg: '#808080' },
  medium: { label: 'MEDIUM', bg: 'var(--hz-primary-soft)', fg: 'var(--hz-primary)' },
  high: { label: 'HIGH', bg: 'var(--hz-primary)', fg: 'var(--hz-surface)' },
}

// ─── Breadcrumb ─────────────────────────────────────────────────────────────

function Breadcrumb({ materialName, onCalculator }: { materialName: string; onCalculator: () => void }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] flex-wrap min-w-0" style={{ fontFamily: FONT_BODY }}>
      <button onClick={onCalculator} className="border-0 bg-transparent cursor-pointer p-0 hover:underline shrink-0" style={{ color: 'var(--hz-ink-muted)' }}>Material Calculator</button>
      <span aria-hidden="true" style={{ color: '#CAC7C6' }}>/</span>
      <span className="font-semibold" style={{ color: 'var(--hz-ink)' }}>{materialName}</span>
    </nav>
  )
}

// ─── Header ─────────────────────────────────────────────────────────────────

function MaterialDetailHeader({ detail, onBack, onCheckPrice }: { detail: MaterialDetail; onBack: () => void; onCheckPrice: () => void }) {
  return (
    <div className="flex flex-col gap-4" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
      <Breadcrumb materialName={detail.name} onCalculator={onBack} />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Material Detail</span>
          <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.1]" style={{ fontFamily: FONT_HEAD }}>{detail.name}</h1>
          <p className="text-[14px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
            Estimated {detail.name.toLowerCase()} requirement for your current project and construction assumptions.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onBack} className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all" style={{ fontFamily: FONT_BODY }}>
            <IcoChevronLeft /> Back to Calculator
          </button>
          <button onClick={onCheckPrice} className="h-9 px-4 rounded-[10px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
            Check Market Price
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Material hero ───────────────────────────────────────────────────────────

function MaterialHero({ detail }: { detail: MaterialDetail }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}>
          {MATERIAL_ICONS[detail.id]}
        </span>
        <span className="text-[10px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: FONT_MONO }}>Estimated Requirement</span>
      </div>

      <div className="rounded-[14px] p-5 flex flex-col gap-1" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
        <span className="text-[36px] sm:text-[42px] font-semibold leading-none" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>
          {fmtQty(detail.quantity)} <span className="text-[18px] font-normal">{detail.unit}</span>
        </span>
        <span className="text-[12px] text-[var(--hz-ink-muted)] mt-1" style={{ fontFamily: FONT_BODY }}>
          Range: {fmtQty(detail.minQuantity)} — {fmtQty(detail.maxQuantity)} {detail.unit}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {detail.packaging && (
          <div className="flex flex-col gap-0.5 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
            <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Unit</span>
            <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{detail.packaging}</span>
          </div>
        )}
        <div className="flex flex-col gap-0.5 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Estimated Cost</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{formatINR(detail.estimatedCost)}</span>
        </div>
        <div className="flex flex-col gap-0.5 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>AI Confidence</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)] capitalize" style={{ fontFamily: FONT_BODY }}>{detail.confidence} · {detail.confidenceScore}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── Project context ─────────────────────────────────────────────────────────

function ProjectContext({ projectName, location }: { projectName: string; location: string }) {
  const items = [
    ['Project', projectName],
    ['Built-up Area', `${defaultProjectInput.builtUpArea.toLocaleString('en-IN')} sq ft`],
    ['Construction Level', defaultProjectInput.constructionLevel],
    ['Location', location],
    ['BOQ Version', `V${boqActiveVersion.versionNumber}`],
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="bg-[var(--hz-surface)] rounded-[12px] border border-[var(--hz-border)] p-3.5 flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)] truncate" style={{ fontFamily: FONT_MONO }}>{label}</span>
          <span className="text-[13px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: FONT_HEAD }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Calculation basis ──────────────────────────────────────────────────────

function CalculationFlow({ detail }: { detail: MaterialDetail }) {
  const steps = [
    `${defaultProjectInput.builtUpArea.toLocaleString('en-IN')} sq ft`,
    `× ${detail.consumptionFactor} ${detail.unit} / sq ft`,
    `+ ${detail.wastage}% wastage`,
    `≈ ${fmtQty(detail.quantity)} ${detail.unit}`,
  ]
  return (
    <div className="flex flex-col items-stretch gap-1.5 py-1">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-col items-center gap-1.5">
          <div
            className="w-full text-center py-2 px-3 rounded-[10px] text-[12px]"
            style={i === steps.length - 1
              ? { backgroundColor: '#F9F5FF', color: 'var(--hz-primary)', fontWeight: 600, border: '1px solid rgba(243,234,255,0.10)', fontFamily: FONT_HEAD }
              : { backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
          >
            {s}
          </div>
          {i < steps.length - 1 && (
            <span aria-hidden="true" className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}>
              <IcoArrowDown />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function CalculationBasis({ detail }: { detail: MaterialDetail }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.11s both' }}>
      <SectionCard
        eyebrow="How Hozie Estimated This"
        tag={<span className="text-[9px] uppercase tracking-[0.06em] px-2 py-1 rounded-[6px]" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_MONO }}>Preliminary AI Estimate</span>}
      >
        <div className="flex flex-col">
          <Row first label="Built-up area" value={`${defaultProjectInput.builtUpArea.toLocaleString('en-IN')} sq ft`} />
          <Row label="Estimated consumption" value={`${detail.consumptionFactor} ${detail.unit} / sq ft`} />
          <Row label="Base quantity" value={`${detail.rawQuantity.toLocaleString('en-IN')} ${detail.unit}`} />
          <Row label="Wastage" value={`${detail.wastage}%`} />
          <Row label="Final estimate" value={`≈ ${fmtQty(detail.quantity)} ${detail.unit}`} />
        </div>
        <CalculationFlow detail={detail} />
      </SectionCard>
    </div>
  )
}

// ─── Specification ──────────────────────────────────────────────────────────

function MaterialSpecification({ detail }: { detail: MaterialDetail }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}>
      <SectionCard eyebrow="Specification">
        <div className="flex flex-col">
          <Row first label="Material" value={detail.name} />
          {detail.suggestedType && <Row label="Suggested type" value={detail.suggestedType} />}
          {detail.packaging && <Row label="Packaging" value={detail.packaging} />}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Typical Use</span>
          <div className="flex flex-wrap gap-1.5">
            {detail.applications.map(a => (
              <span key={a} className="px-2.5 py-1 rounded-full text-[11px]" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>{a}</span>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] p-3.5" style={{ backgroundColor: '#FEF3C7' }}>
          <p className="text-[12px] text-[#D97706] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{getImportantNote(detail.id)}</p>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Usage breakdown ─────────────────────────────────────────────────────────

const USAGE_COLORS = ['var(--hz-primary)', 'var(--hz-primary-soft)', '#CAEBFF', '#C6F6D5']

function UsageBreakdown({ detail }: { detail: MaterialDetail }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.17s both' }}>
      <SectionCard eyebrow="Where It's Used">
        <div className="h-3 rounded-full overflow-hidden flex" role="img" aria-label="Approximate usage distribution">
          {detail.usageBreakdown.map((u, i) => (
            <div key={u.label} style={{ width: `${u.percent}%`, backgroundColor: USAGE_COLORS[i % USAGE_COLORS.length] }} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {detail.usageBreakdown.map((u, i) => (
            <div key={u.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: USAGE_COLORS[i % USAGE_COLORS.length] }} aria-hidden="true" />
                {u.label.toUpperCase()}
              </span>
              <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>~{u.percent}%</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>Approximate distribution.</p>
      </SectionCard>
    </div>
  )
}

// ─── Wastage ─────────────────────────────────────────────────────────────────

function WastageCard({ detail, onAdjust, adjusting, wastageValue, onWastageChange, onResetWastage }: {
  detail: MaterialDetail
  onAdjust: () => void
  adjusting: boolean
  wastageValue: number
  onWastageChange: (v: number) => void
  onResetWastage: () => void
}) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.09s both' }}>
      <SectionCard eyebrow="Wastage Allowance">
        <span className="text-[28px] font-semibold leading-none" style={{ color: 'var(--hz-ink)', fontFamily: FONT_HEAD }}>{detail.wastage}%</span>
        <Row first label="Expected range" value={`${detail.wastageRangeMin}–${detail.wastageRangeMax}%`} />
        <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Wastage can vary depending on storage, handling, mixing practices and site conditions.
        </p>
        <div className="flex items-center justify-between">
          <button onClick={onAdjust} className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
            {adjusting ? 'Hide' : 'Adjust wastage →'}
          </button>
          {adjusting && wastageValue !== detail.wastage && (
            <button onClick={onResetWastage} className="text-[11px] font-medium cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-ink-subtle)', fontFamily: FONT_BODY }}>Reset</button>
          )}
        </div>
        {adjusting && (
          <div className="flex flex-col gap-2 rounded-[12px] p-4" style={{ backgroundColor: 'var(--hz-surface)' }}>
            <label htmlFor="md-wastage" className="flex items-center justify-between text-[12px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
              <span>Wastage</span>
              <span className="font-semibold">{wastageValue}%</span>
            </label>
            <input id="md-wastage" type="range" min={0} max={20} step={1} value={wastageValue} onChange={e => onWastageChange(Number(e.target.value))} style={{ accentColor: 'var(--hz-primary)' }} />
            <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>This updates the estimate shown here only — it doesn't change the active BOQ.</p>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

// ─── Price ───────────────────────────────────────────────────────────────────

function MaterialPriceCard({ detail, onCheckPrice, priceUnavailable }: { detail: MaterialDetail; onCheckPrice: () => void; priceUnavailable: boolean }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.12s both' }}>
      <SectionCard eyebrow="Reference Price">
        {priceUnavailable ? (
          <div className="flex items-center gap-3 rounded-[12px] p-4" style={{ backgroundColor: '#FEF3C7' }}>
            <span className="shrink-0" style={{ color: '#D97706' }}><IcoAlert /></span>
            <p className="text-[12px] text-[#D97706] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
              Current reference price is unavailable. Your existing estimate remains unchanged.
            </p>
          </div>
        ) : (
          <>
            <span className="text-[26px] font-semibold leading-none" style={{ color: 'var(--hz-ink)', fontFamily: FONT_HEAD }}>
              ₹{detail.unitRate.toLocaleString('en-IN')} <span className="text-[13px] font-normal text-[var(--hz-ink-muted)]">/ {detail.unit === 'bags' ? 'bag' : detail.unit}</span>
            </span>
            <div className="flex flex-col">
              <Row first label="Reference range" value={`₹${detail.rateMin.toLocaleString('en-IN')} — ₹${detail.rateMax.toLocaleString('en-IN')} / ${detail.unit === 'bags' ? 'bag' : detail.unit}`} />
              <Row label="Estimated material cost" value={formatINR(detail.estimatedCost)} />
              <Row label="Price basis" value={detail.priceBasis} />
              <Row label="Location" value={detail.location} />
              <Row label="Status" value="Reference price" />
            </div>
            <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
              Actual supplier prices may vary based on brand, grade, order quantity, delivery and market conditions.
            </p>
          </>
        )}
        <button onClick={onCheckPrice} className="w-full h-10 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
          Check current market price →
        </button>
      </SectionCard>
    </div>
  )
}

// ─── BOQ connection ──────────────────────────────────────────────────────────

function BOQConnectionCard({ detail, onViewBOQItem, onViewBOQ, onCompare }: {
  detail: MaterialDetail
  onViewBOQItem: (itemId: string) => void
  onViewBOQ: () => void
  onCompare: (itemId: string) => void
}) {
  const conn = getMaterialBOQConnection(detail)
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.15s both' }}>
      <SectionCard eyebrow={conn.type === 'item' ? 'Linked BOQ Item' : 'BOQ Connection'}>
        {conn.type === 'item' ? (
          <>
            <div className="flex flex-col">
              <Row first label={conn.itemName} value={`${conn.boqQuantity} ${conn.unit}`} />
              <Row label="BOQ estimated cost" value={formatINR(conn.boqCost)} />
              <Row label="BOQ" value={`Version ${boqActiveVersion.versionNumber}`} />
            </div>
            {conn.difference !== 0 && (
              <div className="rounded-[12px] p-4 flex flex-col gap-2" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Calculator</span>
                    <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{conn.calculatorQuantity} {conn.unit}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>BOQ</span>
                    <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{conn.boqQuantity} {conn.unit}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Difference</span>
                    <span className="text-[13px] font-semibold" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>{conn.difference > 0 ? '+' : ''}{conn.difference} {conn.unit}</span>
                  </div>
                </div>
                <button onClick={() => onCompare(conn.itemId)} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
                  Compare quantities →
                </button>
              </div>
            )}
            <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>This calculator does not automatically change the BOQ.</p>
            <button onClick={() => onViewBOQItem(conn.itemId)} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
              View BOQ item →
            </button>
          </>
        ) : (
          <>
            <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
              {detail.name} is a raw material spread across several BOQ line items rather than one — roughly in the same proportions shown above.
            </p>
            <div className="flex flex-col">
              {conn.categories.map((c, i) => (
                <Row key={c.label} first={i === 0} label={c.label} value={`~${c.percent}%`} />
              ))}
            </div>
            <button onClick={onViewBOQ} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
              View BOQ →
            </button>
          </>
        )}
      </SectionCard>
    </div>
  )
}

// ─── AI confidence ───────────────────────────────────────────────────────────

function AIConfidenceCard({ detail, onImprove }: { detail: MaterialDetail; onImprove: () => void }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.18s both' }}>
      <div className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-4" style={{ background: 'linear-gradient(135deg, #F9F5FF 0%, var(--hz-surface) 100%)', border: '1px solid rgba(243,234,255,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
          <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Confidence</span>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-[40px] font-semibold leading-none" style={{ fontFamily: FONT_HEAD, color: 'var(--hz-primary)' }}>{detail.confidenceScore}%</span>
          <span className="text-[13px] text-[var(--hz-ink-muted)] mb-1 capitalize" style={{ fontFamily: FONT_BODY }}>{detail.confidence} confidence</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(243,234,255,0.10)' }}>
          <div className="h-full rounded-full" style={{ width: `${detail.confidenceScore}%`, backgroundColor: 'var(--hz-primary)' }} />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Why</span>
          <ul className="flex flex-col gap-1.5 m-0 p-0" style={{ listStyle: 'none' }}>
            {detail.confidenceWhy.map(f => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                <span aria-hidden="true" style={{ color: 'var(--hz-primary)' }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-1.5 pt-1" style={{ borderTop: '1px solid rgba(243,234,255,0.10)' }}>
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Accuracy Can Improve With</span>
          <ul className="flex flex-col gap-1.5 m-0 p-0" style={{ listStyle: 'none' }}>
            {detail.confidenceImprove.map(f => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                <span aria-hidden="true" style={{ color: 'var(--hz-ink-subtle)' }}>—</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={onImprove} className="h-10 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
          Improve estimate →
        </button>
      </div>
    </div>
  )
}

// ─── Cost sensitivity ────────────────────────────────────────────────────────

function SensitivityRow({ factor, impact }: { factor: string; impact: Exclude<ImpactLevel, 'baseline'> }) {
  const fillPct = impact === 'high' ? 90 : impact === 'medium' ? 55 : 25
  const meta = IMPACT_META[impact]
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[var(--hz-ink)] w-[140px] shrink-0 truncate" style={{ fontFamily: FONT_BODY }}>{factor}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="h-full rounded-full" style={{ width: `${fillPct}%`, backgroundColor: impact === 'high' ? 'var(--hz-primary)' : 'var(--hz-primary-soft)' }} />
      </div>
      <span className="text-[11px] font-semibold w-[64px] text-right shrink-0" style={{ fontFamily: FONT_MONO, color: meta.fg === 'var(--hz-surface)' ? 'var(--hz-primary)' : meta.fg }}>{meta.label}</span>
    </div>
  )
}

function CostSensitivity({ detail }: { detail: MaterialDetail }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.2s both' }}>
      <SectionCard eyebrow="What Can Change This Material Cost?">
        <div className="flex flex-col gap-3">
          {detail.costSensitivity.map(f => <SensitivityRow key={f.factor} factor={f.factor} impact={f.impact} />)}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Related materials ───────────────────────────────────────────────────────

function RelatedMaterials({ detail, onOpen }: { detail: MaterialDetail; onOpen: (id: MaterialCalcId) => void }) {
  const related = getRelatedMaterials(detail)
  if (related.length === 0) return null
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.23s both' }}>
      <SectionCard eyebrow="Related Materials">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {related.map(r => (
            <button
              key={r.id}
              onClick={() => onOpen(r.id)}
              className="text-left flex flex-col gap-2 p-3.5 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface)] hover:border-[var(--hz-primary)] hover:bg-[var(--hz-surface)] cursor-pointer transition-all"
            >
              <span className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}>
                {MATERIAL_ICONS[r.id]}
              </span>
              <span className="text-[11px] uppercase tracking-[0.04em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{r.name}</span>
              <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{fmtQty(r.quantity)} {r.unit}</span>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Hozie action ───────────────────────────────────────────────────────────

function HozieAction({ detail, onAskHozie }: { detail: MaterialDetail; onAskHozie: () => void }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.26s both' }}>
      <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
          <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Ask Hozie</span>
        </div>
        <p className="text-[14px] text-[var(--hz-ink)] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
          "What type of {detail.name.toLowerCase()} should I use for my house?"
        </p>
        <button onClick={onAskHozie} className="self-start h-9 px-4 rounded-[10px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
          Ask Hozie →
        </button>
      </div>
    </div>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function SkeletonBlock({ h = 14, w = '60%' }: { h?: number; w?: string }) {
  return <div className="rounded-full animate-pulse" style={{ backgroundColor: 'var(--hz-surface)', height: h, width: w }} />
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
      <div className="flex flex-col gap-3">
        <SkeletonBlock h={10} w="20%" />
        <SkeletonBlock h={30} w="40%" />
        <SkeletonBlock h={12} w="60%" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-6 flex flex-col gap-3">
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
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)]">
      <span style={{ color: 'var(--hz-danger)' }}><IcoAlert /></span>
      <p className="text-[14px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Unable to load material details.</p>
      <button onClick={onRetry} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Try again</button>
    </div>
  )
}

function NotFoundPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)]">
      <span style={{ color: 'var(--hz-ink-subtle)' }}><IcoEmptyBox /></span>
      <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>This material isn't available in the calculator.</p>
      <button onClick={onBack} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Back to Calculator</button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'loading' | 'ready' | 'error' | 'not-found'

const VALID_IDS: MaterialCalcId[] = ['cement', 'steel', 'sand', 'aggregate', 'aac-blocks', 'concrete', 'mortar']

export default function MaterialDetailScreen({
  onNavigate,
  projectName = '3 BHK G+1 House',
  location = 'Hyderabad',
  materialId,
  projectId,
}: {
  onNavigate: (s: string, data?: Record<string, string>) => void
  projectName?: string
  location?: string
  materialId?: string
  /** Real id from projectData.project_id, if one already exists in this
   *  session. Always preferred over boqOverview.projectId ('proj-001'). */
  projectId?: string
}) {
  const resolvedId = (VALID_IDS.includes(materialId as MaterialCalcId) ? materialId : 'cement') as MaterialCalcId
  // 11D — buildMaterialDetail() below is a synchronous, in-memory lookup, so
  // status resolves immediately rather than behind an artificial delay.
  // 'error' stays defined but unreachable, same as elsewhere in this
  // codebase, in case a real failure path is ever wired. The effect still
  // resets adjustingWastage/wastageValue on identity change — that reset was
  // never about timing, only about not carrying one material's in-progress
  // wastage edit over to the next.
  const [status, setStatus] = useState<ScreenStatus>(() => (VALID_IDS.includes(resolvedId) ? 'ready' : 'not-found'))
  const [adjustingWastage, setAdjustingWastage] = useState(false)
  const [wastageValue, setWastageValue] = useState<number | null>(null)

  useEffect(() => {
    setStatus(VALID_IDS.includes(resolvedId) ? 'ready' : 'not-found')
    setAdjustingWastage(false)
    setWastageValue(null)
  }, [resolvedId])

  const baseDetail = buildMaterialDetail(resolvedId)
  const detail = wastageValue != null ? buildMaterialDetail(resolvedId, defaultProjectInput, wastageValue) : baseDetail

  const goCalculator = () => onNavigate('material-calculator')
  const checkPrice = () => onNavigate('material-price-check', { material_id: detail.id })
  const viewBOQItem = (itemId: string) => onNavigate('boq-item-detail', { boq_item_id: itemId })
  const compareQuantities = (itemId: string) => onNavigate('boq-item-detail', { boq_item_id: itemId })
  const viewBOQ = () => onNavigate('detailed-boq')
  const improveEstimate = () => onNavigate('upload-plan')
  const openRelated = (id: MaterialCalcId) => onNavigate('material-detail', { material_id: id })
  const askHozie = () => onNavigate('ai-advisor', {
    project_id: projectId || boqOverview.projectId,
    estimate_version_id: boqActiveVersion.estimateVersionId,
    boq_version_id: boqActiveVersion.id,
    material_id: detail.id,
  })
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <button onClick={goCalculator} aria-label="Back to Material Calculator" className="flex items-center gap-1 text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer text-[13px]" style={{ fontFamily: FONT_BODY }}>
          <IcoChevronLeft /> Calculator
        </button>
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] truncate px-2" style={{ fontFamily: FONT_HEAD }}>{status === 'ready' ? detail.name : 'Material Detail'}</span>
        <span className="w-8" />
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Material Detail</h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--hz-primary)' }} /> BOQ V{boqActiveVersion.versionNumber} · ACTIVE
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {status === 'loading' && <LoadingSkeleton />}
              {status === 'error' && <ErrorPanel onRetry={() => setStatus('loading')} />}
              {status === 'not-found' && <NotFoundPanel onBack={goCalculator} />}

              {status === 'ready' && (
                <>
                  <MaterialDetailHeader detail={detail} onBack={goCalculator} onCheckPrice={checkPrice} />

                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.08s both' }}><MaterialHero detail={detail} /></div>

                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.09s both' }}>
                    <ProjectContext projectName={projectName} location={location} />
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-6">
                      <CalculationBasis detail={detail} />
                      <MaterialSpecification detail={detail} />
                      <UsageBreakdown detail={detail} />
                    </div>

                    <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
                      <MaterialPriceCard detail={detail} onCheckPrice={checkPrice} priceUnavailable={false} />
                      <WastageCard
                        detail={baseDetail}
                        adjusting={adjustingWastage}
                        onAdjust={() => setAdjustingWastage(a => !a)}
                        wastageValue={wastageValue ?? baseDetail.wastage}
                        onWastageChange={setWastageValue}
                        onResetWastage={() => setWastageValue(null)}
                      />
                      <BOQConnectionCard detail={detail} onViewBOQItem={viewBOQItem} onViewBOQ={viewBOQ} onCompare={compareQuantities} />
                      <AIConfidenceCard detail={detail} onImprove={improveEstimate} />
                      <CostSensitivity detail={detail} />
                    </div>
                  </div>

                  <RelatedMaterials detail={detail} onOpen={openRelated} />
                  <HozieAction detail={detail} onAskHozie={askHozie} />
                </>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
