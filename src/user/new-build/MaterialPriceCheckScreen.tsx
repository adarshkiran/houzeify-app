import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import {
  getMaterialPrice,
  calculatePriceImpact,
  getPriceHistory,
  getPriceConfidence,
  priceFactors,
  formatLakh,
  type MaterialPrice,
  type PriceStatus,
} from '@/data/materialPrice'
import { buildMaterialDetail } from '@/data/materialDetail'
import { defaultProjectInput, type MaterialCalcId } from '@/data/materialCalculator'
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
const IcoChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3L5 7l4 4"/>
  </svg>
)
const IcoRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 7A5 5 0 013 9.5M2 7a5 5 0 019-2.5"/><path d="M2 4v3h3M12 10v-3h-3"/>
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
const IcoCheck = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_META: Record<PriceStatus, { label: string; bg: string; fg: string }> = {
  'within-range': { label: 'Within expected range', bg: 'var(--hz-primary-soft)', fg: 'var(--hz-primary)' },
  'above-range': { label: 'Above reference range', bg: '#FEF3C7', fg: '#D97706' },
  'below-range': { label: 'Below reference range', bg: '#CAC7C6', fg: '#808080' },
}

// ─── Header ─────────────────────────────────────────────────────────────────

function PriceCheckHeader({ price, projectName, location, onBack, onRefresh, refreshing }: {
  price: MaterialPrice; projectName: string; location: string; onBack: () => void; onRefresh: () => void; refreshing: boolean
}) {
  return (
    <div className="flex flex-col gap-4" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Material Price Check</span>
          <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.1]" style={{ fontFamily: FONT_HEAD }}>Is your material rate still realistic?</h1>
          <p className="text-[14px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
            Compare the rate used in your estimate with the latest available regional reference price.
          </p>
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{projectName} · {location} · {defaultProjectInput.builtUpArea.toLocaleString('en-IN')} sq ft</span>
          <span className="text-[12px] font-semibold" style={{ color: 'var(--hz-ink)', fontFamily: FONT_BODY }}>{price.materialName} · {buildMaterialDetail(price.materialId).packaging ?? price.unit}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onBack} className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] border border-[var(--hz-border)] text-[12px] font-medium text-[var(--hz-ink)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all" style={{ fontFamily: FONT_BODY }}>
            <IcoChevronLeft /> Back to Material
          </button>
          <button onClick={onRefresh} disabled={refreshing} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all disabled:opacity-60" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
            <IcoRefresh /> {refreshing ? 'Refreshing…' : 'Refresh Price'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Price hero ──────────────────────────────────────────────────────────────

function PriceHero({ price }: { price: MaterialPrice }) {
  const diff = price.referenceMid - price.estimateRate
  const pct = price.estimateRate ? (diff / price.estimateRate) * 100 : 0
  const meta = STATUS_META[price.status]
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-5" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-4 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Estimate Rate</span>
          <span className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] leading-none" style={{ fontFamily: FONT_HEAD }}>₹{price.estimateRate.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>/ {price.unit === 'bags' ? 'bag' : price.unit}</span>
        </div>
        <div className="flex flex-col gap-1 p-4 rounded-[12px]" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
          <span className="text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>Current Reference</span>
          <span className="text-[24px] sm:text-[28px] font-semibold leading-none" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>₹{price.referenceMid.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>/ {price.unit === 'bags' ? 'bag' : price.unit}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-[12px] p-4" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-[0.06em] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Difference</span>
          <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{diff >= 0 ? '+' : ''}₹{diff.toLocaleString('en-IN')} / {price.unit === 'bags' ? 'bag' : price.unit}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase tracking-[0.06em] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Percentage</span>
          <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{pct >= 0 ? '+' : ''}{pct.toFixed(1)}%</span>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold" style={{ backgroundColor: meta.bg, color: meta.fg, fontFamily: FONT_BODY }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.fg }} aria-hidden="true" /> {meta.label}
        </span>
      </div>
    </div>
  )
}

// ─── Price range ─────────────────────────────────────────────────────────────

function PriceRange({ price }: { price: MaterialPrice }) {
  const span = price.referenceHigh - price.referenceLow || 1
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - price.referenceLow) / span) * 100))
  const estPct = pct(price.estimateRate)
  const midPct = pct(price.referenceMid)

  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.08s both' }}>
      <SectionCard eyebrow="Reference Range">
        <div className="relative pt-2 pb-6" role="img" aria-label={`Reference range ₹${price.referenceLow} to ₹${price.referenceHigh}. Your estimate rate of ₹${price.estimateRate} and the reference midpoint of ₹${price.referenceMid} both fall within this range.`}>
          <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--hz-surface)' }} />
          <div
            className="absolute top-2 w-3.5 h-3.5 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${midPct}%`, backgroundColor: 'var(--hz-primary)', border: '2px solid var(--hz-surface)', boxShadow: '0 0 0 1px var(--hz-primary)' }}
            aria-hidden="true"
          />
          <div
            className="absolute top-2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${estPct}%`, backgroundColor: 'var(--hz-black)' }}
            aria-hidden="true"
          />
          <span className="absolute text-[11px] text-[var(--hz-ink-subtle)] top-6" style={{ left: 0, fontFamily: FONT_MONO }}>₹{price.referenceLow.toLocaleString('en-IN')}</span>
          <span className="absolute text-[11px] text-[var(--hz-ink-subtle)] top-6 -translate-x-1/2" style={{ left: '100%', transform: 'translateX(-100%)', fontFamily: FONT_MONO }}>₹{price.referenceHigh.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-black)' }} /> Estimate rate: ₹{price.estimateRate.toLocaleString('en-IN')}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--hz-primary)' }} /> Reference midpoint: ₹{price.referenceMid.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>Reference range, not a guaranteed supplier price.</p>
      </SectionCard>
    </div>
  )
}

// ─── Price source ────────────────────────────────────────────────────────────

function PriceSourceCard({ price }: { price: MaterialPrice }) {
  const detail = buildMaterialDetail(price.materialId)
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
      <SectionCard eyebrow="Price Source">
        <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Regional market reference</span>
        <div className="flex flex-col">
          <Row first label="Location" value={price.location} />
          <Row label="Material" value={price.materialName} />
          {detail.packaging && <Row label="Pack size" value={detail.packaging} />}
          <Row label="Last checked" value={formatDate(price.lastChecked)} />
          <Row label="Reference range" value={`₹${price.referenceLow.toLocaleString('en-IN')}–₹${price.referenceHigh.toLocaleString('en-IN')} / ${price.unit === 'bags' ? 'bag' : price.unit}`} />
          <Row label="Price status" value="Current reference" />
        </div>
        <p className="text-[11px] text-[var(--hz-ink-subtle)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          This is a planning reference, not a verified supplier quote or live market price.
        </p>
      </SectionCard>
    </div>
  )
}

// ─── Cost impact ─────────────────────────────────────────────────────────────

function CostImpactCard({ price }: { price: MaterialPrice }) {
  const detail = buildMaterialDetail(price.materialId)
  const impact = calculatePriceImpact(detail.quantity, price.estimateRate, price.referenceMid)
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.13s both' }}>
      <SectionCard eyebrow="Cost Impact">
        <div className="flex flex-col">
          <Row first label="Current BOQ quantity" value={`${detail.quantity.toLocaleString('en-IN')} ${detail.unit}`} />
          <Row label="Estimate rate" value={`₹${impact.estimateRate.toLocaleString('en-IN')}`} />
          <Row label="Estimated material cost" value={formatINR(impact.estimateCost)} />
          <Row label="At reference midpoint" value={`₹${impact.referenceRate.toLocaleString('en-IN')}`} />
          <Row label="Revised indicative cost" value={formatINR(impact.referenceCost)} />
          <Row label="Difference" value={`${impact.difference >= 0 ? '+' : ''}${formatINR(impact.difference)}`} />
        </div>
        <div className="rounded-[12px] p-4 flex flex-col gap-1" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
          <span className="text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--hz-primary)', fontFamily: FONT_MONO }}>Project Impact</span>
          <span className="text-[26px] font-semibold leading-none" style={{ color: 'var(--hz-primary)', fontFamily: FONT_HEAD }}>{impact.difference >= 0 ? '+' : ''}{formatINR(impact.difference)}</span>
        </div>
        <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          This is the estimated impact if the entire BOQ quantity is purchased at the reference midpoint.
        </p>
      </SectionCard>
    </div>
  )
}

// ─── Price comparison ────────────────────────────────────────────────────────

function PriceComparison({ price }: { price: MaterialPrice }) {
  const detail = buildMaterialDetail(price.materialId)
  const rows = [
    ['Houzeify Estimate', price.estimateRate],
    ['Reference Low', price.referenceLow],
    ['Reference Mid', price.referenceMid],
    ['Reference High', price.referenceHigh],
  ] as const
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.16s both' }}>
      <SectionCard eyebrow="Price Comparison">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 380 }}>
            <thead>
              <tr>
                <th scope="col" className="px-2 py-2 text-left text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}></th>
                <th scope="col" className="px-2 py-2 text-right text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Rate</th>
                <th scope="col" className="px-2 py-2 text-right text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Project Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, rate]) => (
                <tr key={label} style={{ borderTop: '1px solid var(--hz-surface)', backgroundColor: label === 'Houzeify Estimate' ? 'var(--hz-surface)' : undefined }}>
                  <td className="px-2 py-2.5 text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{label}</td>
                  <td className="px-2 py-2.5 text-[13px] text-[var(--hz-ink)] text-right" style={{ fontFamily: FONT_BODY }}>₹{rate.toLocaleString('en-IN')}</td>
                  <td className="px-2 py-2.5 text-[13px] font-semibold text-[var(--hz-ink)] text-right" style={{ fontFamily: FONT_HEAD }}>{formatLakh(rate * detail.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>Uses the same BOQ quantity ({detail.quantity.toLocaleString('en-IN')} {detail.unit}) for every row.</p>
      </SectionCard>
    </div>
  )
}

// ─── Why prices change ───────────────────────────────────────────────────────

function WhyPricesChange() {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.19s both' }}>
      <SectionCard eyebrow="Why Prices Change">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {priceFactors.map(f => (
            <div key={f.label} className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: 'var(--hz-surface)' }}>
              <span className="text-[12px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{f.label}</span>
              <span className="text-[11px] text-[var(--hz-ink-muted)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>{f.description}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Hozie price insight ─────────────────────────────────────────────────────

function HoziePriceInsight({ price, onAskHozie }: { price: MaterialPrice; onAskHozie: () => void }) {
  const diff = price.referenceMid - price.estimateRate
  const text = diff === 0
    ? `The current reference midpoint matches the rate used in your estimate exactly. Your existing ${price.materialName.toLowerCase()} allowance is well aligned.`
    : `The current reference midpoint is only ₹${Math.abs(diff)} ${diff > 0 ? 'higher' : 'lower'} than the rate used in your estimate. Your existing ${price.materialName.toLowerCase()} allowance is therefore still within a reasonable planning range.`
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.22s both' }}>
      <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
          <span className="text-[10px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Price Insight</span>
        </div>
        <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>"{text}"</p>
        <button onClick={onAskHozie} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Ask Hozie →</button>
      </div>
    </div>
  )
}

// ─── Price confidence ────────────────────────────────────────────────────────

function PriceConfidenceCard({ price }: { price: MaterialPrice }) {
  const info = getPriceConfidence(price.materialId)
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.25s both' }}>
      <SectionCard eyebrow="Price Data Confidence">
        <div className="flex items-end gap-2">
          <span className="text-[32px] font-semibold leading-none" style={{ fontFamily: FONT_HEAD, color: 'var(--hz-primary)' }}>{info.score}%</span>
          <span className="text-[13px] text-[var(--hz-ink-muted)] mb-1 capitalize" style={{ fontFamily: FONT_BODY }}>{info.level}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--hz-surface)' }}>
          <div className="h-full rounded-full" style={{ width: `${info.score}%`, backgroundColor: 'var(--hz-primary)' }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Based On</span>
          <ul className="flex flex-col gap-1.5 m-0 p-0" style={{ listStyle: 'none' }}>
            {info.basedOn.map(f => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                <span aria-hidden="true" style={{ color: 'var(--hz-primary)' }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-1.5 pt-1" style={{ borderTop: '1px solid var(--hz-surface)' }}>
          <span className="text-[9px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Improve Accuracy With</span>
          <ul className="flex flex-col gap-1.5 m-0 p-0" style={{ listStyle: 'none' }}>
            {info.improveWith.map(f => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                <span aria-hidden="true" style={{ color: 'var(--hz-ink-subtle)' }}>—</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Price history ───────────────────────────────────────────────────────────

function PriceHistoryCard({ materialId }: { materialId: MaterialCalcId }) {
  const history = getPriceHistory(materialId)
  if (!history || history.length === 0) return null
  const max = Math.max(...history.map(h => h.rate))
  const min = Math.min(...history.map(h => h.rate))
  const span = max - min || 1
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.28s both' }}>
      <SectionCard eyebrow="Price Trend">
        <div className="flex items-end gap-3 h-24" role="img" aria-label={`Reference price trend: ${history.map(h => `${h.month} ₹${h.rate}`).join(', ')}`}>
          {history.map(h => (
            <div key={h.month} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
              <span className="text-[11px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>₹{h.rate}</span>
              <div className="w-full rounded-t-[6px]" style={{ height: `${((h.rate - min) / span) * 60 + 12}px`, backgroundColor: 'var(--hz-primary)', opacity: 0.35 + ((h.rate - min) / span) * 0.55 }} />
              <span className="text-[10px] text-[var(--hz-ink-subtle)] uppercase tracking-[0.04em]" style={{ fontFamily: FONT_MONO }}>{h.month}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>Reference trend only.</p>
      </SectionCard>
    </div>
  )
}

// ─── Update rate ─────────────────────────────────────────────────────────────

function UpdateRateCard({ price, onUseReferenceRate }: { price: MaterialPrice; onUseReferenceRate: () => void }) {
  return (
    <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.31s both' }}>
      <SectionCard eyebrow="Rate Update">
        <div className="flex flex-col">
          <Row first label="Current estimate" value={`₹${price.estimateRate.toLocaleString('en-IN')} / ${price.unit === 'bags' ? 'bag' : price.unit}`} />
          <Row label="Reference midpoint" value={`₹${price.referenceMid.toLocaleString('en-IN')} / ${price.unit === 'bags' ? 'bag' : price.unit}`} />
        </div>
        <button onClick={onUseReferenceRate} className="w-full h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
          Use reference rate
        </button>
        <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>This creates a new estimate revision — it never changes the active BOQ directly.</p>
      </SectionCard>
    </div>
  )
}

function UpdateRateModal({ price, onCancel, onConfirm }: { price: MaterialPrice; onCancel: () => void; onConfirm: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    if (e.shiftKey && document.activeElement === closeRef.current) { e.preventDefault(); confirmRef.current?.focus() }
    else if (!e.shiftKey && document.activeElement === confirmRef.current) { e.preventDefault(); closeRef.current?.focus() }
  }
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-update-title"
        onKeyDown={onKeyDown}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-[var(--hz-surface)] rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="rate-update-title" className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Use ₹{price.referenceMid.toLocaleString('en-IN')} / {price.unit === 'bags' ? 'bag' : price.unit} for a revised estimate?</h2>
          <button ref={closeRef} onClick={onCancel} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer border-0 bg-transparent transition-colors shrink-0"><IcoClose /></button>
        </div>
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          This creates a new estimate revision using the reference rate — the active BOQ stays unchanged unless you confirm the revision.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Create estimate revision</button>
        </div>
      </div>
    </>
  )
}

// ─── Disclaimer ──────────────────────────────────────────────────────────────

function PriceDisclaimer() {
  return (
    <div className="rounded-[12px] p-4 flex items-start gap-3" style={{ backgroundColor: '#FEF3C7' }}>
      <span className="shrink-0 mt-0.5" style={{ color: '#D97706' }}><IcoAlert /></span>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-[0.06em] font-semibold" style={{ color: '#D97706', fontFamily: FONT_MONO }}>Reference Price Notice</span>
        <p className="text-[12px] text-[#D97706] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          Market prices can vary by supplier, brand, quantity, location, delivery, taxes and timing. This screen provides planning references and is not a supplier quotation.
        </p>
      </div>
    </div>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function SkeletonBlock({ h = 14, w = '60%' }: { h?: number; w?: string }) {
  return <div className="rounded-full animate-pulse" style={{ backgroundColor: 'var(--hz-surface)', height: h, width: w }} />
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-14">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)', animation: 'aiIconGlow 1.6s ease-in-out infinite' }}>
        <HIcon size={26} />
      </div>
      <span className="text-[12px] uppercase tracking-[0.10em]" style={{ fontFamily: FONT_MONO, color: 'var(--hz-primary)' }}>{label}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
      <div className="flex flex-col gap-3">
        <SkeletonBlock h={10} w="20%" />
        <SkeletonBlock h={30} w="45%" />
        <SkeletonBlock h={12} w="60%" />
      </div>
      <LoadingPanel label="Checking current reference rate…" />
      {Array.from({ length: 2 }).map((_, i) => (
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
      <p className="text-[14px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Unable to retrieve material pricing.</p>
      <button onClick={onRetry} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Try again</button>
    </div>
  )
}

function PriceUnavailablePanel() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)]">
      <span style={{ color: 'var(--hz-ink-subtle)' }}><IcoAlert /></span>
      <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 max-w-[380px]" style={{ fontFamily: FONT_BODY }}>Current reference pricing is unavailable. Your existing estimate remains unchanged.</p>
    </div>
  )
}

function StaleBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEF3C7' }}>
      <span className="shrink-0" style={{ color: '#D97706' }}><IcoAlert /></span>
      <p className="text-[12px] text-[#D97706] m-0" style={{ fontFamily: FONT_BODY }}>Price data may be outdated. Treat this rate as a planning reference.</p>
    </div>
  )
}

// ─── Success panel ───────────────────────────────────────────────────────────

function RevisionSuccessPanel({ onViewBOQ, onBack }: { onViewBOQ: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-16 bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] max-w-[480px] mx-auto w-full">
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary)' }}>
        <span style={{ color: 'white' }}><IcoCheck /></span>
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Estimate revision started</h2>
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
          Opening a new BOQ revision using the reference rate. Your active BOQ hasn't been changed.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button onClick={onBack} className="h-10 px-5 rounded-[10px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors" style={{ fontFamily: FONT_BODY }}>Stay Here</button>
        <button onClick={onViewBOQ} className="h-10 px-5 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}>Continue to Revision →</button>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'loading' | 'ready' | 'refreshing' | 'price-unavailable' | 'error'

const VALID_IDS: MaterialCalcId[] = ['cement', 'steel', 'sand', 'aggregate', 'aac-blocks', 'concrete', 'mortar']

export default function MaterialPriceCheckScreen({
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
  // 11E — getMaterialPrice() below is a synchronous, deterministic, in-memory
  // lookup (no live market API, no randomized/timestamp-based variance), so
  // status resolves immediately rather than behind an artificial delay on
  // mount/material-change. 'error'/'price-unavailable' stay defined but
  // unreachable, same as elsewhere in this codebase.
  const [status, setStatus] = useState<ScreenStatus>('ready')
  const [showStale] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showRevisionSuccess, setShowRevisionSuccess] = useState(false)

  useEffect(() => {
    setStatus('ready')
  }, [resolvedId])

  const price = getMaterialPrice(resolvedId, location)

  const goBack = () => onNavigate('material-detail', { material_id: resolvedId })
  // 11E — "Refresh" re-reads the same deterministic getMaterialPrice() call
  // above; there is no live source that could return a different value, so
  // the refresh resolves immediately rather than simulating a fake lookup.
  const refresh = () => setStatus('ready')
  const askHozie = () => onNavigate('ai-advisor', {
    project_id: projectId || boqOverview.projectId,
    estimate_version_id: boqActiveVersion.estimateVersionId,
    boq_version_id: boqActiveVersion.id,
    material_id: price.materialId,
  })
  const confirmUseReferenceRate = () => {
    setShowUpdateModal(false)
    setShowRevisionSuccess(true)
  }
  const continueToRevision = () => {
    const detail = buildMaterialDetail(price.materialId)
    onNavigate('boq-edit', detail.boqItemId ? { boq_item_id: detail.boqItemId } : {})
  }
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <button onClick={goBack} aria-label="Back to material" className="flex items-center gap-1 text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer text-[13px]" style={{ fontFamily: FONT_BODY }}>
          <IcoChevronLeft /> {price.materialName}
        </button>
        <span className="text-[15px] font-semibold text-[var(--hz-ink)] truncate px-2" style={{ fontFamily: FONT_HEAD }}>Price Check</span>
        <button onClick={refresh} aria-label="Refresh price" className="w-8 h-8 flex items-center justify-center text-[var(--hz-primary)] border-0 bg-transparent cursor-pointer"><IcoRefresh /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Material Price Check</h1>
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

              {(status === 'ready' || status === 'refreshing' || status === 'price-unavailable') && !showRevisionSuccess && (
                <>
                  <PriceCheckHeader price={price} projectName={projectName} location={location} onBack={goBack} onRefresh={refresh} refreshing={status === 'refreshing'} />

                  {showStale && <StaleBanner />}

                  {status === 'refreshing' ? (
                    <LoadingPanel label="Updating reference price…" />
                  ) : status === 'price-unavailable' ? (
                    <PriceUnavailablePanel />
                  ) : (
                    <>
                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.07s both' }}><PriceHero price={price} /></div>

                      <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-6">
                          <PriceComparison price={price} />
                          <PriceRange price={price} />
                          <CostImpactCard price={price} />
                        </div>

                        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
                          <PriceSourceCard price={price} />
                          <WhyPricesChange />
                          <HoziePriceInsight price={price} onAskHozie={askHozie} />
                          <UpdateRateCard price={price} onUseReferenceRate={() => setShowUpdateModal(true)} />
                        </div>
                      </div>

                      <PriceConfidenceCard price={price} />
                      <PriceHistoryCard materialId={price.materialId} />
                      <PriceDisclaimer />
                    </>
                  )}
                </>
              )}

              {showRevisionSuccess && (
                <div style={{ animation: 'welcomeFadeUp 0.4s ease-out both' }}>
                  <RevisionSuccessPanel onBack={() => setShowRevisionSuccess(false)} onViewBOQ={continueToRevision} />
                </div>
              )}

            </div>
          </main>
        </div>
      </div>

      {showUpdateModal && (
        <UpdateRateModal price={price} onCancel={() => setShowUpdateModal(false)} onConfirm={confirmUseReferenceRate} />
      )}
    </div>
  )
}
