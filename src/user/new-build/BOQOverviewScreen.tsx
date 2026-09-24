import { useEffect, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import { boqGenerationSteps, type BOQStatus, type BOQCategory, type BOQGroup, type BOQOverviewData } from '@/data/boqOverview'
// Customer Implementation 10I — project-scoped BOQ access layer. Every
// display value below now comes from the current project's own derived
// BOQ (getBOQForProject/getBOQGroupsForProject), never the raw boqOverview
// fixture directly — see boqGeneration.ts for the derivation method.
import { getBOQForProject, getBOQGroupsForProject, getEstimateVersionForBOQ } from '@/data/boqGeneration'
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
const IcoArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="7" x2="12" y2="7"/><path d="M8 3l4 4-4 4"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.2l3 3 6-6.4"/>
  </svg>
)
const IcoAlert = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2.5L18 17H2L10 2.5z"/><line x1="10" y1="8" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
)
const IcoDoc = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2h6l3 3v9H4z"/><path d="M10 2v3h3"/><line x1="6" y1="9" x2="11" y2="9"/><line x1="6" y1="11.5" x2="11" y2="11.5"/>
  </svg>
)

// Category icon set — minimal, geometric, distinct per category
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'site-preparation': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="14" x2="15" y2="14"/><path d="M3 14V9l3-3 3 3v5"/><path d="M9 14V6l3-3 3 3v8"/>
    </svg>
  ),
  foundation: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="12" height="3.5"/><path d="M4 10V6.5M8 10V6.5M12 10V6.5"/><line x1="2" y1="6.5" x2="14" y2="6.5"/>
    </svg>
  ),
  'rcc-structure': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="2" x2="3" y2="14"/><line x1="13" y1="2" x2="13" y2="14"/><line x1="3" y1="5" x2="13" y2="5"/><line x1="3" y1="11" x2="13" y2="11"/>
    </svg>
  ),
  masonry: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2.5" width="6" height="3.5"/><rect x="7" y="2.5" width="6" height="3.5"/>
      <rect x="4" y="6.5" width="6" height="3.5"/><rect x="10" y="6.5" width="5" height="3.5"/><rect x="1" y="10.5" width="5" height="3.5"/>
    </svg>
  ),
  plastering: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="1"/><path d="M2 6h12M2 10h12"/>
    </svg>
  ),
  flooring: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="5.5" height="5.5"/><rect x="9" y="1.5" width="5.5" height="5.5"/>
      <rect x="1.5" y="9" width="5.5" height="5.5"/><rect x="9" y="9" width="5.5" height="5.5"/>
    </svg>
  ),
  'doors-windows': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="1.5" width="10" height="13"/><line x1="8" y1="1.5" x2="8" y2="14.5"/><circle cx="6.5" cy="8" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  electrical: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5 3 9h4l-1 5.5 6-8H8l1-5Z"/>
    </svg>
  ),
  plumbing: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v5a3 3 0 003 3h1v4"/><path d="M13 2v5a3 3 0 01-3 3"/><line x1="5" y1="14" x2="9" y2="14"/>
    </svg>
  ),
  painting: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 1.5l4 4-8 8H3v-3.5l7.5-8.5Z"/><line x1="8" y1="4" x2="12" y2="8"/>
    </svg>
  ),
  'fixtures-finishing': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="3"/><path d="M8 8v6M5 14h6"/>
    </svg>
  ),
  'external-works': (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14 6 4l4 7 2-3 2 6"/>
    </svg>
  ),
}

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



// ─── BOQ Hero ─────────────────────────────────────────────────────────────────

function BOQHero({ overview, onViewDetailed }: { overview: BOQOverviewData; onViewDetailed: () => void }) {
  return (
    <div
      className="rounded-[20px] p-6 sm:p-8 flex flex-col gap-5"
      style={{ background: 'linear-gradient(135deg, rgba(243,234,255,0.10) 0%, #ffffff 55%)', border: '1px solid #E3DDD7', boxShadow: '0 4px 32px rgba(114,46,209,0.08)' }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', animation: 'aiIconGlow 2.4s ease-in-out infinite' }}>
            <HIcon size={20} />
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: '"Sometype Mono:SemiBold", monospace', padding: '4px 10px', borderRadius: 999 }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }} /> BOQ Ready
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Estimated BOQ Value</span>
        <span className="text-[36px] sm:text-[44px] font-semibold leading-none" style={{ fontFamily: '"Geist Variable", sans-serif', color: '#722ED1' }}>
          {formatINR(overview.totalValue)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          ['Items', String(overview.itemCount)],
          ['Material items', String(overview.materialItemCount)],
          ['Labour items', String(overview.labourItemCount)],
        ].map(([label, val]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[20px] sm:text-[24px] font-semibold text-[#242326]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{val}</span>
            <span className="text-[11px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>AI confidence:</span>
        <span className="text-[13px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: '#722ED1' }}>{overview.confidence}%</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={onViewDetailed}
          className="h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
          style={{ backgroundColor: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
        >
          View detailed BOQ →
        </button>
        <button
          className="h-11 px-6 rounded-[12px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        >
          Download BOQ PDF
        </button>
      </div>
    </div>
  )
}

// ─── What is BOQ ──────────────────────────────────────────────────────────────

function WhatIsBOQCard() {
  const benefits = ['Compare contractor quotations', 'Understand material requirements', 'Track construction costs', 'Identify scope differences']
  return (
    <div className="bg-white rounded-[14px] border border-[#E3DDD7] p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
      <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F4F0EC', color: '#68636D' }}><IcoDoc /></span>
      <div className="flex flex-col gap-2">
        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>What is a BOQ?</span>
        <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          A Bill of Quantities breaks your construction project into measurable work items, materials, quantities and estimated costs.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          {benefits.map(b => (
            <span key={b} className="text-[11px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>• {b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Breakdown group cards ────────────────────────────────────────────────────

function BOQGroupCard({ group, onView }: { group: BOQGroup; onView: () => void }) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E3DDD7] p-4 sm:p-5 flex flex-col gap-2">
      <span className="text-[12px] tracking-[0.08em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>{group.label}</span>
      <span className="text-[20px] font-semibold text-[#242326]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(group.estimatedValue)}</span>
      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{group.itemCount} items</span>
      <button
        onClick={onView}
        className="self-start mt-1 text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
        style={{ color: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
      >
        View →
      </button>
    </div>
  )
}

// ─── Category list ────────────────────────────────────────────────────────────

function CategoryRow({ cat, onOpen }: { cat: BOQCategory; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer border-0 bg-white hover:bg-[#FFFFFF] transition-colors"
      style={{ borderBottom: '1px solid #FFFFFF' }}
      aria-label={`Open ${cat.name} category`}
    >
      <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F4F0EC', color: '#68636D' }}>
        {CATEGORY_ICONS[cat.id]}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-semibold text-[#242326] block" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{cat.name}</span>
        <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{cat.itemCount} items</span>
      </div>
      <span className="text-[13px] font-semibold text-[#242326] shrink-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{formatINR(cat.estimatedValue)}</span>
      <span
        className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full shrink-0"
        style={{
          backgroundColor: cat.status === 'ready' ? '#DCFCE7' : '#FEF3C7',
          color: cat.status === 'ready' ? '#16A34A' : '#D97706',
          fontFamily: '"Inter Variable", sans-serif',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.status === 'ready' ? '#16A34A' : '#D97706' }} />
        {cat.status === 'ready' ? 'Ready' : 'Needs review'}
      </span>
      <span className="text-[#9A949D] shrink-0"><IcoArrowRight /></span>
    </button>
  )
}

// ─── Hozie check ──────────────────────────────────────────────────────────────

function HozieCheckCard({ estimateVersionNumber, onAnalyzePlan }: { estimateVersionNumber?: number; onAnalyzePlan: () => void }) {
  return (
    <div className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Check</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        “Your BOQ is based on {estimateVersionNumber ? `Estimate Version ${estimateVersionNumber}` : 'your Estimate'}. Material quantities should be reviewed against the final floor plan and structural drawings before contractor bidding.”
      </p>
      <button
        onClick={onAnalyzePlan}
        className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
        style={{ color: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Analyze my plan →
      </button>
    </div>
  )
}

// ─── Contractor readiness ─────────────────────────────────────────────────────

function ReadinessCard({ onContinue }: { onContinue: () => void }) {
  const items = [
    { label: 'BOQ generated', done: true },
    { label: 'Estimate locked', done: true },
    { label: 'Project details', done: true },
    { label: 'Floor plan', done: false },
    { label: 'Structural drawings', done: false },
  ]
  const doneCount = items.filter(i => i.done).length
  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Ready For Contractor Bids</span>
        <span className="text-[12px] font-semibold" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: '#722ED1' }}>{doneCount} / {items.length}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F3EAFF' }}>
        <div className="h-full rounded-full" style={{ width: `${(doneCount / items.length) * 100}%`, backgroundColor: '#722ED1' }} />
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[13px]" style={{ fontFamily: '"Inter Variable", sans-serif', color: item.done ? '#1E1E1E' : '#A1A1A1' }}>{item.label}</span>
            {item.done ? (
              <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#722ED1' }}><IcoCheck /></span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: '"Inter Variable", sans-serif' }}>Recommended</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-[12px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        Complete the recommended documents before requesting contractor bids for better quotation accuracy.
      </p>
      <button
        onClick={onContinue}
        className="h-11 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
        style={{ backgroundColor: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Continue to Plan Analysis →
      </button>
    </div>
  )
}

// ─── Next steps ───────────────────────────────────────────────────────────────

function NextStepCard({ title, description, onClick, emphasized, muted }: {
  title: string; description: string; onClick: () => void; emphasized?: boolean; muted?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="text-left flex flex-col gap-2 p-4 sm:p-5 rounded-[14px] cursor-pointer transition-all"
      style={{
        backgroundColor: emphasized ? '#F9F5FF' : '#FFFFFF',
        border: emphasized ? '1.5px solid #722ED1' : '1px solid #CAC7C6',
        opacity: muted ? 0.72 : 1,
      }}
    >
      <span className="text-[14px] font-semibold" style={{ fontFamily: '"Geist Variable", sans-serif', color: emphasized ? '#722ED1' : '#1E1E1E' }}>{title}</span>
      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{description}</span>
    </button>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function GeneratingPanel() {
  const [stepIdx, setStepIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStepIdx(i => Math.min(i + 1, boqGenerationSteps.length - 1)), 600)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3EAFF', animation: 'aiIconGlow 1.6s ease-in-out infinite' }}>
        <HIcon size={28} />
      </div>
      <span className="text-[12px] uppercase tracking-[0.10em]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: '#722ED1' }}>Hozie is preparing your BOQ…</span>
      <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif', transition: 'opacity .2s' }}>{boqGenerationSteps[stepIdx]}</span>
    </div>
  )
}

// Customer Implementation 10I — genuine "no BOQ yet" state, reached when
// this project has no Estimate to derive a BOQ from (never a proj-001
// fallback). Gives BOQStatus's own 'no-boq' value, previously declared but
// unreachable, real UI.
function NoEstimatePanel({ onGoEstimate }: { onGoEstimate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-white rounded-[16px] border border-[#E3DDD7]">
      <span style={{ color: '#9A949D' }}><IcoAlert /></span>
      <p className="text-[14px] text-[#68636D] m-0 max-w-[360px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
        This project doesn&apos;t have an Estimate yet — a BOQ is generated from your Estimate, so complete that first.
      </p>
      <button
        onClick={onGoEstimate}
        className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0"
        style={{ backgroundColor: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Go to Estimate
      </button>
    </div>
  )
}

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-white rounded-[16px] border border-[#E3DDD7]">
      <span style={{ color: '#DC2626' }}><IcoAlert /></span>
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Unable to generate BOQ.</p>
      <button
        onClick={onRetry}
        className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0"
        style={{ backgroundColor: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Try again
      </button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BOQOverviewScreen({
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
   *  boqOverview.projectId ('proj-001'); getBOQForProject returns
   *  undefined for an absent/no-Estimate project and this screen shows a
   *  genuine no-BOQ state instead of a substitute project's data. */
  projectId?: string
}) {
  // Customer Implementation 10I — this project's own derived BOQ (or the
  // proj-001 reference fixture, unchanged, for that one legacy id).
  const overview = getBOQForProject(projectId)
  const groups = getBOQGroupsForProject(projectId)
  const estimateVersion = getEstimateVersionForBOQ(projectId)
  // Customer Implementation 10L — BOQ derivation is a synchronous, in-memory
  // computation (see boqGeneration.ts); there is no real async "generating"
  // step to wait for, so status reflects the actual, already-known data
  // availability immediately instead of behind an artificial 2.4s timer.
  // 'generating' is kept as a type value only for the (currently never
  // reached) case a real async generation step is introduced later.
  const [status, setStatus] = useState<BOQStatus>(overview ? 'ready' : 'no-boq')

  useEffect(() => {
    setStatus(overview ? 'ready' : 'no-boq')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const viewDetailedBOQ = () => onNavigate('detailed-boq')
  const analyzePlan = () => onNavigate('upload-plan')
  const openEstimate = () => onNavigate('final-estimate')
  const openCategory = () => onNavigate('detailed-boq')
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <button
          onClick={() => onNavigate('final-estimate')}
          aria-label="Back to estimate"
          className="flex items-center gap-1 text-[#68636D] border-0 bg-transparent cursor-pointer text-[13px]"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        >
          <IcoChevronLeft /> Estimate
        </button>
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>BOQ Overview</span>
        <button aria-label="Download PDF" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="boq" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                Bill of Quantities
              </h1>
              <span className="text-[13px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                {projectName} · {location} · {area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] px-2.5 py-1.5 rounded-full" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                {estimateVersion ? `ESTIMATE V${estimateVersion.versionNumber} · ${estimateVersion.status.toUpperCase()}` : 'ESTIMATE'}
              </span>
              <button
                onClick={() => onNavigate('final-estimate')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: '"Inter Variable", sans-serif' }}
              >
                <IcoChevronLeft /> Back to estimate
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Intro */}
              <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <span className="text-[12px] tracking-[0.10em] text-[#722ED1] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                  Bill of Quantities
                </span>
                <h2 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                  Your construction plan is ready.
                </h2>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 mt-2 max-w-[600px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                  Hozie has converted your locked estimate into a structured Bill of Quantities covering materials, labour and major construction activities.
                </p>
              </div>

              {/* Customer Implementation 10L — 'generating'/'error' removed:
                  BOQ derivation is synchronous (boqGeneration.ts), so this
                  screen's status can now only ever genuinely be 'ready' or
                  'no-boq' (see the useState/useEffect above). GeneratingPanel
                  and ErrorPanel stay defined, unused, for a real future async
                  step rather than being deleted outright. */}

              {status === 'no-boq' && (
                <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                  <NoEstimatePanel onGoEstimate={openEstimate} />
                </div>
              )}

              {status === 'ready' && overview && groups && (
                <>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                    <BOQHero overview={overview} onViewDetailed={viewDetailedBOQ} />
                  </div>

                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}>
                    <WhatIsBOQCard />
                  </div>

                  {/* Breakdown groups */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.18s both' }}>
                    {groups.map(g => <BOQGroupCard key={g.id} group={g} onView={openCategory} />)}
                  </div>

                  {/* Two-column: categories left, insight/readiness right */}
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="flex flex-col gap-3 w-full min-w-0" style={{ flex: '58 58 0', animation: 'welcomeFadeUp 0.4s ease-out 0.22s both' }}>
                      <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>BOQ Categories</span>
                      <div className="bg-white rounded-[16px] overflow-hidden" style={{ border: '1px solid #E3DDD7' }}>
                        {overview.categories.map(cat => <CategoryRow key={cat.id} cat={cat} onOpen={openCategory} />)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full lg:shrink-0" style={{ flex: '42 42 0', minWidth: 0 }}>
                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.26s both' }}>
                        <HozieCheckCard estimateVersionNumber={estimateVersion?.versionNumber} onAnalyzePlan={analyzePlan} />
                      </div>
                      <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.3s both' }}>
                        <ReadinessCard onContinue={analyzePlan} />
                      </div>
                    </div>
                  </div>

                  {/* Next steps */}
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.34s both' }}>
                    <span className="text-[12px] tracking-[0.10em] text-[#9A949D] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Next Steps</span>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <NextStepCard title="View Detailed BOQ" description="Review every work item." onClick={viewDetailedBOQ} emphasized />
                      <NextStepCard title="Analyze Floor Plan" description="Improve quantity accuracy." onClick={analyzePlan} />
                      <NextStepCard title="Find Contractors" description="Request quotations when ready." onClick={() => onNavigate('ai-advisor', { project_id: overview.projectId })} muted />
                    </div>
                  </div>

                  {/* Version information */}
                  <div className="bg-white rounded-[16px] border border-[#E3DDD7] p-5 flex flex-wrap items-center justify-between gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.38s both' }}>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Based on: <strong style={{ color: '#242326' }}>{estimateVersion ? `Estimate Version ${estimateVersion.versionNumber}` : 'your Estimate'}</strong></span>
                      <span className="text-[12px] text-[#68636D]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>Created: <strong style={{ color: '#242326' }}>{overview.createdAt}</strong></span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#722ED1]" /> Active
                      </span>
                    </div>
                    <button
                      onClick={openEstimate}
                      className="text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
                      style={{ color: '#722ED1', fontFamily: '"Inter Variable", sans-serif' }}
                    >
                      View estimate →
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
