import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  getEstimateRevision,
  formatLakh,
  formatChange,
  type EstimateRevision,
} from '@/data/estimateV3Revision'
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
const IcoCheckOutline = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8.5l3.2 3.2L13 4.5"/>
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
const IcoClose = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l8 8M11 3L3 11"/>
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



// ─── Shared bits ────────────────────────────────────────────────────────────

function SectionCard({ eyebrow, tag, children, className }: { eyebrow: string; tag?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={['bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>{eyebrow}</span>
        {tag}
      </div>
      {children}
    </div>
  )
}

function ChangeText({ amount }: { amount: number }) {
  if (amount === 0) return <span className="text-[12px] font-medium" style={{ color: '#9A949D', fontFamily: FONT_MONO }}>₹0</span>
  return <span className="text-[12px] font-semibold" style={{ color: amount > 0 ? '#D97706' : '#16A34A', fontFamily: FONT_MONO }}>{formatChange(amount)}</span>
}

// ─── Update summary ───────────────────────────────────────────────────────────

function UpdateSummary({ rev }: { rev: EstimateRevision }) {
  const change = rev.newTotal - rev.previousTotal
  const changePct = Math.round((change / rev.previousTotal) * 1000) / 10
  return (
    <div className="w-full bg-white rounded-[24px] border border-[#E3DDD7] p-6 sm:p-8 flex flex-col gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Current Estimate</span>
          <span className="text-[22px] font-semibold text-[#242326] leading-none" style={{ fontFamily: FONT_HEAD }}>{formatLakh(rev.previousRange.min)} — {formatLakh(rev.previousRange.max)}</span>
          <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Estimate V2 · Active</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Updated Estimate</span>
          <span className="text-[22px] font-semibold leading-none" style={{ color: '#722ED1', fontFamily: FONT_HEAD }}>{formatLakh(rev.newRange.min)} — {formatLakh(rev.newRange.max)}</span>
          <span className="text-[11px] text-[#722ED1]" style={{ fontFamily: FONT_BODY }}>Estimate V3 · Draft</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Change</span>
          <span className="text-[22px] font-semibold leading-none" style={{ color: '#D97706', fontFamily: FONT_HEAD }}>+₹{change.toLocaleString('en-IN')}</span>
          <span className="text-[11px]" style={{ color: '#D97706', fontFamily: FONT_BODY }}>+{changePct}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-[#FFFFFF]">
        <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-semibold" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>Preliminary</span>
        <p className="text-[11px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>This is a preliminary updated estimate, not a final construction quotation.</p>
      </div>
    </div>
  )
}

// ─── Approved changes ─────────────────────────────────────────────────────────

function ApprovedChanges({ rev, className }: { rev: EstimateRevision; className?: string }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? rev.approvedChanges : rev.approvedChanges.slice(0, 5)
  return (
    <SectionCard
      eyebrow="Approved Changes"
      tag={<span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{rev.approvedChanges.length} changes applied</span>}
      className={className}
    >
      <ul className="flex flex-col divide-y m-0 p-0" style={{ listStyle: 'none', borderColor: '#FFFFFF' }}>
        {visible.map(c => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{c.label}</span>
              <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{c.currentValue} → {c.planValue}</span>
            </div>
            <span className="text-[13px] font-semibold shrink-0" style={{ color: '#D97706', fontFamily: FONT_MONO }}>+₹{c.impact.toLocaleString('en-IN')}</span>
          </li>
        ))}
      </ul>
      {rev.approvedChanges.length > 5 && (
        <button onClick={() => setShowAll(v => !v)} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>
          {showAll ? 'Show fewer ←' : 'View all changes →'}
        </button>
      )}
    </SectionCard>
  )
}

// ─── Estimate breakdown table ─────────────────────────────────────────────────

function EstimateBreakdown({ rev, className }: { rev: EstimateRevision; className?: string }) {
  return (
    <SectionCard eyebrow="Estimate Breakdown" className={className}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontFamily: FONT_BODY }}>
          <thead>
            <tr className="border-b border-[#E3DDD7]">
              {['Category', 'Current V2', 'Updated V3', 'Change'].map(h => (
                <th key={h} className="text-left py-2 px-2 text-[10px] uppercase tracking-[0.06em] text-[#9A949D] font-medium" style={{ fontFamily: FONT_MONO }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rev.categoryBreakdown.map(row => (
              <tr key={row.category} className="border-b border-[#FFFFFF] last:border-b-0">
                <td className="py-2.5 px-2 text-[13px] text-[#242326]">{row.label}</td>
                <td className="py-2.5 px-2 text-[13px] text-[#68636D]" style={{ fontFamily: FONT_MONO }}>{formatLakh(row.before)}</td>
                <td className="py-2.5 px-2 text-[13px] text-[#242326] font-medium" style={{ fontFamily: FONT_MONO }}>{formatLakh(row.after)}</td>
                <td className="py-2.5 px-2"><ChangeText amount={row.after - row.before} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Demonstration values — real values come from the estimate calculation service.</p>
    </SectionCard>
  )
}

// ─── Cost summary ─────────────────────────────────────────────────────────────

function CostRow({ label, before, after }: { label: string; before: number; after: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{label}</span>
      <div className="flex items-center justify-between gap-2 text-[13px]" style={{ fontFamily: FONT_BODY }}>
        <span className="text-[#68636D]">V2: <strong style={{ color: '#242326' }}>{formatLakh(before)}</strong></span>
        <span className="text-[#722ED1]">V3: <strong>{formatLakh(after)}</strong></span>
        <ChangeText amount={after - before} />
      </div>
    </div>
  )
}

function CostSummary({ rev, className }: { rev: EstimateRevision; className?: string }) {
  const totalBefore = rev.materialCostBefore + rev.labourCostBefore
  const totalAfter = rev.materialCostAfter + rev.labourCostAfter
  return (
    <SectionCard eyebrow="Cost Summary" className={className}>
      <CostRow label="Material" before={rev.materialCostBefore} after={rev.materialCostAfter} />
      <CostRow label="Labour" before={rev.labourCostBefore} after={rev.labourCostAfter} />
      <div className="pt-2 border-t border-[#FFFFFF]">
        <CostRow label="Total" before={totalBefore} after={totalAfter} />
      </div>
      <div className="pt-2 border-t border-[#FFFFFF] flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Final Project Estimate Range</span>
        <div className="flex items-center justify-between gap-2 text-[13px]" style={{ fontFamily: FONT_BODY }}>
          <span className="text-[#68636D]">V2: <strong style={{ color: '#242326' }}>{formatLakh(rev.previousRange.min)}—{formatLakh(rev.previousRange.max)}</strong></span>
          <span className="text-[#722ED1]">V3: <strong>{formatLakh(rev.newRange.min)}—{formatLakh(rev.newRange.max)}</strong></span>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── What changed / didn't change ─────────────────────────────────────────────

const KEY_ASSUMPTION_CHANGES = [
  { label: 'Built-up area', from: '2,600 sq ft', to: '2,640 sq ft' },
  { label: 'Flooring area', from: '2,400 sq ft', to: '2,440 sq ft' },
  { label: 'Plastering', from: '7,800 sq ft', to: '8,050 sq ft' },
  { label: 'Painting', from: '8,100 sq ft', to: '8,350 sq ft' },
  { label: 'AAC blocks', from: '2,850', to: '2,910' },
  { label: 'Electrical points', from: '78', to: '82' },
]

function WhatChanged({ className }: { className?: string }) {
  return (
    <SectionCard eyebrow="Hozie Updated" className={className}>
      <ul className="flex flex-col divide-y m-0 p-0" style={{ listStyle: 'none', borderColor: '#FFFFFF' }}>
        {KEY_ASSUMPTION_CHANGES.map(c => (
          <li key={c.label} className="flex items-center justify-between gap-3 py-2">
            <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{c.label}</span>
            <span className="text-[13px] font-medium text-[#242326]" style={{ fontFamily: FONT_BODY }}>{c.from} → <span style={{ color: '#722ED1' }}>{c.to}</span></span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>{KEY_ASSUMPTION_CHANGES.length} quantity assumptions updated.</p>
    </SectionCard>
  )
}

function WhatDidNotChange({ rev, className }: { rev: EstimateRevision; className?: string }) {
  return (
    <SectionCard eyebrow="No Change" className={className}>
      <div className="flex flex-wrap gap-2">
        {rev.unchangedCategories.map(c => (
          <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_BODY }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#16A34A' }} aria-hidden="true" /> {c}
          </span>
        ))}
      </div>
      <p className="text-[12px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>These items were not affected by the approved plan changes.</p>
    </SectionCard>
  )
}

// ─── Hozie card ────────────────────────────────────────────────────────────────

function HozieUpdateCard({ rev, onAskHozie, className }: { rev: EstimateRevision; onAskHozie: () => void; className?: string }) {
  const change = rev.newTotal - rev.previousTotal
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-3', className].filter(Boolean).join(' ')} style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Updated Your Estimate</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
        "The plan showed approximately 40 sq ft more built-up area than the current project assumption. Based on the changes you approved, the preliminary estimate increases by approximately ₹{change.toLocaleString('en-IN')}."
      </p>
      <button onClick={onAskHozie} className="self-start h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
        Ask Hozie →
      </button>
    </div>
  )
}

// ─── Confidence ───────────────────────────────────────────────────────────────

function EstimateConfidence({ rev, className }: { rev: EstimateRevision; className?: string }) {
  const improvement = rev.confidenceAfter - rev.confidenceBefore
  return (
    <SectionCard eyebrow="Updated Estimate Confidence" className={className}>
      <div className="flex items-end gap-3">
        <span className="text-[32px] font-semibold text-[#242326] leading-none" style={{ fontFamily: FONT_HEAD }}>{rev.confidenceAfter}%</span>
        <span className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_MONO }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#16A34A' }} aria-hidden="true" /> High
        </span>
      </div>
      <div className="flex items-center gap-4 text-[12px]" style={{ fontFamily: FONT_BODY }}>
        <span className="text-[#68636D]">Previous: <strong style={{ color: '#242326' }}>{rev.confidenceBefore}%</strong></span>
        <span style={{ color: '#16A34A' }}>Improvement: <strong>+{improvement}%</strong></span>
      </div>
      <p className="text-[12px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Plan-derived measurements were incorporated into the calculation.</p>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Confidence reflects the completeness and clarity of the available project information. It is not a construction cost guarantee.
      </p>
    </SectionCard>
  )
}

// ─── Assumptions ──────────────────────────────────────────────────────────────

function AssumptionList({ rev, className }: { rev: EstimateRevision; className?: string }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Built-up area', value: `${rev.assumptions.builtUpArea.toLocaleString('en-IN')} sq ft` },
    { label: 'Floors', value: rev.assumptions.floors },
    { label: 'Construction level', value: rev.assumptions.constructionLevel },
    { label: 'Location', value: rev.assumptions.location },
    { label: 'Plan source', value: rev.assumptions.planSource },
    { label: 'BOQ source', value: rev.assumptions.boqSource },
    { label: 'Price basis', value: rev.assumptions.priceBasis },
  ]
  return (
    <SectionCard eyebrow="Updated Assumptions" className={className}>
      <ul className="flex flex-col divide-y m-0 p-0" style={{ listStyle: 'none', borderColor: '#FFFFFF' }}>
        {rows.map(r => (
          <li key={r.label} className="flex items-center justify-between gap-3 py-2">
            <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{r.label}</span>
            <span className="text-[13px] font-medium text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{r.value}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>These assumptions are view-only here. Adjustments can be made from the Estimate Revision tool.</p>
    </SectionCard>
  )
}

// ─── Version cards ─────────────────────────────────────────────────────────────

function VersionCreation({ rev, active, className }: { rev: EstimateRevision; active: boolean; className?: string }) {
  return (
    <SectionCard eyebrow="Version Creation" className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 rounded-[12px] p-4" style={{ backgroundColor: '#FFFFFF' }}>
          <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Current Version</span>
          <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Estimate V2</span>
          <span
            className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.04em]"
            style={{ backgroundColor: active ? '#CAC7C6' : '#DCFCE7', color: active ? '#808080' : '#16A34A', fontFamily: FONT_MONO }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: active ? '#A1A1A1' : '#16A34A' }} aria-hidden="true" />
            {active ? 'Superseded' : 'Active'}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-[12px] p-4" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
          <span className="text-[10px] uppercase tracking-[0.06em] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>New Version</span>
          <span className="text-[15px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_HEAD }}>Estimate V3</span>
          <span
            className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.04em]"
            style={{ backgroundColor: active ? '#DCFCE7' : '#F3EAFF', color: active ? '#16A34A' : '#722ED1', fontFamily: FONT_MONO }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: active ? '#16A34A' : '#722ED1' }} aria-hidden="true" />
            {active ? 'Active' : 'Draft'}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-[12px]" style={{ fontFamily: FONT_BODY }}>
        <div className="flex items-center justify-between"><span className="text-[#68636D]">Parent</span><span className="text-[#242326] font-medium">Estimate V2</span></div>
        <div className="flex items-center justify-between"><span className="text-[#68636D]">Source</span><span className="text-[#242326] font-medium">Plan Analysis V1</span></div>
        <div className="flex items-center justify-between"><span className="text-[#68636D]">Approved changes</span><span className="text-[#242326] font-medium">{rev.approvedChanges.length}</span></div>
      </div>
      <p className="text-[11px] text-[#9A949D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Estimate V2 {active ? 'remains available in version history.' : 'remains unchanged.'}</p>
    </SectionCard>
  )
}

// ─── Review before activating ─────────────────────────────────────────────────

const READY_CHECKLIST = [
  'Include approved plan measurements',
  'Recalculate affected quantities',
  'Recalculate material costs',
  'Recalculate labour costs',
  'Preserve Estimate V2',
  'Update the linked BOQ after activation',
]

function ReviewBeforeActivating({ onCreate, onBack, className }: { onCreate: () => void; onBack: () => void; className?: string }) {
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-4 bg-white border border-[#E3DDD7]', className].filter(Boolean).join(' ')}>
      <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Ready to create Estimate V3?</span>
      <ul className="flex flex-col gap-2 m-0 p-0" style={{ listStyle: 'none' }}>
        {READY_CHECKLIST.map(item => (
          <li key={item} className="flex items-center gap-2 text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
            <span className="shrink-0" style={{ color: '#16A34A' }}><IcoCheckOutline /></span> {item}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2.5 pt-1">
        <button onClick={onCreate} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
          Create Estimate V3 →
        </button>
        <button onClick={onBack} className="h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>
          Go back and adjust changes
        </button>
      </div>
    </div>
  )
}

// ─── Confirmation modal ────────────────────────────────────────────────────────

function CreateEstimateModal({ rev, onCancel, onConfirm }: { rev: EstimateRevision; onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  const change = rev.newTotal - rev.previousTotal
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-v3-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="create-v3-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Create Estimate V3</h2>
          <button onClick={onCancel} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer border-0 bg-transparent transition-colors"><IcoClose /></button>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>New estimate</span>
          <span className="text-[18px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_HEAD }}>{formatLakh(rev.newRange.min)} — {formatLakh(rev.newRange.max)}</span>
        </div>
        <div className="flex items-center justify-between text-[13px]" style={{ fontFamily: FONT_BODY }}>
          <span className="text-[#68636D]">Change</span>
          <span className="font-semibold" style={{ color: '#D97706' }}>+₹{change.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex flex-col gap-1 text-[12px]" style={{ fontFamily: FONT_BODY }}>
          <span className="text-[#68636D]">Based on:</span>
          <span className="text-[#242326] font-medium">Plan Analysis V1 · {rev.approvedChanges.length} approved changes</span>
        </div>
        <p className="text-[12px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Estimate V2 will remain available in version history.</p>
        <div className="flex gap-2.5 justify-end pt-1">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
            Create & Activate V3
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Success + BOQ notice ──────────────────────────────────────────────────────

function UpdateSuccess({ rev, onViewEstimate, onViewVersionHistory, className }: {
  rev: EstimateRevision
  onViewEstimate: () => void
  onViewVersionHistory: () => void
  className?: string
}) {
  const change = rev.newTotal - rev.previousTotal
  return (
    <div className={['w-full bg-white rounded-[24px] border border-[#E3DDD7] px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-5', className].filter(Boolean).join(' ')} style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}><IcoCheck /></span>
      <div className="flex flex-col gap-1.5">
        <span className="text-[14px] font-semibold uppercase tracking-[0.06em]" style={{ color: '#16A34A', fontFamily: FONT_MONO }}>Estimate V3 Active ✓</span>
        <p className="text-[14px] text-[#242326] leading-[1.6] m-0 max-w-[440px]" style={{ fontFamily: FONT_BODY }}>Your estimate has been updated using the approved plan findings.</p>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Previous</span>
          <span className="text-[14px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{formatLakh(rev.previousRange.min)}–{formatLakh(rev.previousRange.max)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Current</span>
          <span className="text-[14px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>{formatLakh(rev.newRange.min)}–{formatLakh(rev.newRange.max)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Change</span>
          <span className="text-[14px] font-semibold" style={{ color: '#D97706', fontFamily: FONT_BODY }}>+₹{change.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button onClick={onViewEstimate} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
          View Updated Estimate →
        </button>
        <button onClick={onViewVersionHistory} className="h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>
          View Version History
        </button>
      </div>
    </div>
  )
}

function BOQUpdateNotice({ onUpdateBOQ, className }: { onUpdateBOQ: () => void; className?: string }) {
  return (
    <div className={['rounded-[16px] p-5 sm:p-6 flex flex-col gap-3 bg-white border border-[#E3DDD7]', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: FONT_MONO }}>BOQ Relationship</span>
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>BOQ V{boqActiveVersion.versionNumber + 1} · Draft</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
        Based on Estimate V3. Your BOQ can now be regenerated using the updated estimate.
      </p>
      <button onClick={onUpdateBOQ} className="self-start h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
        Update BOQ →
      </button>
    </div>
  )
}

// ─── Error / calculating states ────────────────────────────────────────────────

function EstimateError({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <div role="alert" className="w-full max-w-[560px] mx-auto bg-white rounded-[24px] border border-[#E3DDD7] px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <span className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}><IcoWarning /></span>
      <h2 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>We couldn't create the updated estimate.</h2>
      <p className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>Estimate V2 remains unchanged.</p>
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1 w-full sm:w-auto">
        <button onClick={onBack} className="h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Back</button>
        <button onClick={onRetry} className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>Try again</button>
      </div>
    </div>
  )
}

function CalculatingPanel({ label }: { label: string }) {
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col items-center text-center gap-4 py-16">
      <div className="w-14 h-14 rounded-[16px] flex items-center justify-center" style={{ backgroundColor: '#F3EAFF', animation: 'estimatePulse 2s ease-in-out infinite' }}>
        <HIcon size={32} />
      </div>
      <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type PageStatus = 'preparing' | 'calculating' | 'ready' | 'creating' | 'active' | 'error'

export default function EstimateUpdateScreen({
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
  // 11E — rev below is a synchronous, in-memory derivation (getEstimateRevision
  // always builds its demo revision immediately, no real recalculation backend
  // exists yet per this module's own header comment), so status starts 'ready'
  // immediately rather than behind an artificial 'preparing'→'calculating'
  // delay. 'error' stays defined but unreachable, same as elsewhere in this
  // codebase, in case a real failure path is ever wired.
  const [rev] = useState<EstimateRevision>(() => getEstimateRevision(documentId, projectId))
  const [status, setStatus] = useState<PageStatus>('ready')
  const [showModal, setShowModal] = useState(false)
  const changeSectionRef = useRef<HTMLDivElement>(null)

  const askHozie = () => onNavigate('ai-advisor', {
    project_id: projectId || boqOverview.projectId,
    estimate_version_id: rev.parentEstimateVersionId,
    new_estimate_version_id: `${rev.parentEstimateVersionId}-v3`,
    plan_analysis_id: rev.planAnalysisId,
    approved_changes: String(rev.approvedChanges.length),
  })
  const backToComparison = () => onNavigate('plan-vs-estimate', { document_id: documentId ?? '', project_id: rev.projectId })
  // 11E — same reasoning as the mount status above: nothing async happens
  // between 'error' and 'ready', so retry resolves immediately.
  const retry = () => setStatus('ready')
  const scrollToChanges = () => changeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const createV3 = () => setShowModal(true)
  // 11E — getEstimateRevision()/rev is already fully computed; "creating"
  // Estimate V3 is a local status flip, not a real write to any store (per
  // estimateV3Revision.ts's own header: "no real recalculation backend yet").
  // Confirming in the modal is the real user action — the page reflects it
  // immediately rather than behind an artificial 900ms delay, matching how
  // BOQEditScreen's own confirm-create flow was made synchronous in 10L.
  const confirmCreate = () => {
    setShowModal(false)
    setStatus('active')
  }

  const viewUpdatedEstimate = () => onNavigate('estimate-dashboard')
  const viewVersionHistory = () => onNavigate('estimate-comparison')
  const updateBOQ = () => onNavigate('boq-overview')

  if (status === 'error') {
 return (
      <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
        <div className="flex flex-1 min-h-0 relative z-10">
          <Sidebar active="build" onNavigate={onNavigate} />
          <div className="flex flex-col flex-1 min-h-0">
            <main className="flex-1 overflow-y-auto flex items-center justify-center px-4">
              <EstimateError onRetry={retry} onBack={backToComparison} />
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Estimate Update</span>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: status === 'active' ? '#DCFCE7' : '#F3EAFF', color: status === 'active' ? '#16A34A' : '#722ED1', fontFamily: FONT_MONO }}>
          {status === 'active' ? 'ACTIVE' : 'DRAFT'}
        </span>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Estimate Update</h1>
              <span className="text-[13px] text-[#68636D] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location}</span>
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full shrink-0"
              style={{ backgroundColor: status === 'active' ? '#DCFCE7' : '#F3EAFF', color: status === 'active' ? '#16A34A' : '#722ED1', fontFamily: FONT_MONO }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: status === 'active' ? '#16A34A' : '#722ED1' }} aria-hidden="true" />
              {status === 'active' ? 'Estimate V3 Active' : 'Estimate V3 · Draft'}
            </span>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 pb-28 lg:pb-8">

              {/* Page header */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Estimate Update</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>Your estimate is ready to update.</h1>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[620px]" style={{ fontFamily: FONT_BODY }}>
                  Hozie has applied the plan findings you approved. Review the updated estimate before making it active.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                  <span className="text-[12px] text-[#242326] font-medium" style={{ fontFamily: FONT_BODY }}>{projectName} · {location} · 2,600 sq ft</span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                    <span className="shrink-0" style={{ color: '#722ED1' }}><IcoFile /></span> House_Floor_Plan.pdf
                  </span>
                  <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Estimate V2 → Estimate V3 · Draft</span>
                </div>
              </div>

              {status === 'preparing' && <CalculatingPanel label="Preparing your updated estimate…" />}
              {status === 'calculating' && <CalculatingPanel label="Hozie is recalculating your estimate…" />}

              {(status === 'ready' || status === 'creating' || status === 'active') && (
                <>
                  <UpdateSummary rev={rev} />

                  <div ref={changeSectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-6">
                    <ApprovedChanges rev={rev} className="lg:self-start" />
                    <CostSummary rev={rev} className="lg:self-start" />
                  </div>

                  <EstimateBreakdown rev={rev} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <WhatChanged className="lg:self-start" />
                    <WhatDidNotChange rev={rev} className="lg:self-start" />
                  </div>

                  <HozieUpdateCard rev={rev} onAskHozie={askHozie} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EstimateConfidence rev={rev} className="lg:self-start" />
                    <AssumptionList rev={rev} className="lg:self-start" />
                  </div>

                  <VersionCreation rev={rev} active={status === 'active'} />

                  {status === 'ready' && (
                    <ReviewBeforeActivating onCreate={createV3} onBack={scrollToChanges} />
                  )}

                  {status === 'creating' && <CalculatingPanel label="Creating Estimate V3…" />}

                  {status === 'active' && (
                    <>
                      <UpdateSuccess rev={rev} onViewEstimate={viewUpdatedEstimate} onViewVersionHistory={viewVersionHistory} />
                      <BOQUpdateNotice onUpdateBOQ={updateBOQ} />
                    </>
                  )}
                </>
              )}
            </div>
          </main>

          {/* Sticky action (mobile) */}
          {status === 'ready' && (
            <div className="lg:hidden sticky bottom-0 z-20 bg-white border-t border-[#E3DDD7] px-4 py-3 flex items-center gap-2.5" style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}>
              <button onClick={createV3} className="flex-1 h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
                Create Estimate V3 →
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && <CreateEstimateModal rev={rev} onCancel={() => setShowModal(false)} onConfirm={confirmCreate} />}
    </div>
  )
}
