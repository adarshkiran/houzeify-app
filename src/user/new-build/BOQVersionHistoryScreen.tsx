import { useEffect, useMemo, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { formatINR } from '@/data/materials'
import {
  getVersionChanges,
  compareVersions,
  type BOQVersionComparison,
} from '@/data/boqVersionHistory'
import type { BOQVersion, BOQVersionStatus } from '@/data/boqEdit'
// Customer Implementation 10I/10L — project-scoped BOQ access layer; see
// boqGeneration.ts for the Estimate → BOQ derivation method and the real
// (not fixture-only) version comparison.
import { getBOQVersionsForProject, getBOQActiveVersionForProject, getEstimateVersionForBOQ, compareBOQVersionsForProject } from '@/data/boqGeneration'
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
const IcoArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1.5" y1="7" x2="10.5" y2="7"/><path d="M7 3.5L10.5 7 7 10.5"/>
  </svg>
)
const IcoCompare = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2v10M5 12L2 9M5 12l3-3"/>
    <path d="M11 14V4M11 4l3 3M11 4L8 7"/>
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
const IcoEmptyBox = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8"/><line x1="12" y1="13" x2="12" y2="21"/>
  </svg>
)
const IcoClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l10 10M13 3L3 13"/>
  </svg>
)
const IcoPlus = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="1.5" x2="7" y2="12.5"/><line x1="1.5" y1="7" x2="12.5" y2="7"/>
  </svg>
)
const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

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

function fmtL(n: number): string {
  return `₹${(n / 100000).toFixed(1)}L`
}
function formatSigned(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '' : '±'
  return `${sign}${formatINR(n)}`
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Status badge — never color-only ────────────────────────────────────────

const STATUS_META: Record<BOQVersionStatus, { label: string; bg: string; fg: string; dot: string }> = {
  active: { label: 'Active', bg: '#F3EAFF', fg: '#722ED1', dot: '#722ED1' },
  draft: { label: 'Draft', bg: '#CAC7C6', fg: '#808080', dot: '#A1A1A1' },
  superseded: { label: 'Superseded', bg: '#F7F5F3', fg: '#A1A1A1', dot: '#CAC7C6' },
}

function StatusBadge({ status }: { status: BOQVersionStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap"
      style={{ backgroundColor: meta.bg, color: meta.fg, fontFamily: FONT_MONO }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} aria-hidden="true" /> {meta.label}
    </span>
  )
}

// ─── Active BOQ card ─────────────────────────────────────────────────────────

function ActiveBOQCard({ version, estimateVersionNumber, onView, onDownload }: { version: BOQVersion; estimateVersionNumber?: number; onView: () => void; onDownload: () => void }) {
  return (
    <div
      className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-5"
      style={{ border: '2px solid #722ED1', backgroundColor: '#F3EAFF' }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Active BOQ</span>
        <StatusBadge status={version.status} />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>BOQ Version {version.versionNumber}</h2>
        <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
          Created {formatDate(version.createdAt)} · Based on {estimateVersionNumber ? `Estimate Version ${estimateVersionNumber}` : 'your Estimate'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1 p-3 rounded-[12px] bg-white/70">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Value</span>
          <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{fmtL(version.totalValue ?? 0)}</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-[12px] bg-white/70">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Items</span>
          <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{version.itemCount}</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-[12px] bg-white/70">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>AI Confidence</span>
          <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{version.confidence}%</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: '#16A34A', fontFamily: FONT_BODY }}>
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#16A34A' }} /> Ready for contractor review
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button onClick={onView} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
          View active BOQ →
        </button>
        <button onClick={onDownload} className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] border border-[#722ED1] text-[#722ED1] text-[13px] font-medium cursor-pointer bg-white hover:bg-[#F9F5FF] transition-colors" style={{ fontFamily: FONT_BODY }}>
          Download PDF
        </button>
      </div>
    </div>
  )
}

// ─── Version timeline card ───────────────────────────────────────────────────

function BOQVersionCard({ version, versions, projectId, estimateVersionNumber, isFirst, onView, onCompare, onDownload, onCreateRevision }: {
  version: BOQVersion
  versions: BOQVersion[]
  projectId?: string
  estimateVersionNumber?: number
  isFirst: boolean
  onView: () => void
  onCompare: () => void
  onDownload: () => void
  onCreateRevision: () => void
}) {
  // Customer Implementation 10J — look up the parent within THIS project's
  // own version list, not the proj-001-only getParentVersion/
  // getBOQVersionById helpers (which only ever search the static reference
  // fixture and would silently find nothing for a real edited project's
  // versions, even though a real parent sits right there in `versions`).
  const parent = versions.find(v => v.id === version.parentVersionId)
  // Customer Implementation 10L — real item-level diff between this
  // project's own stored snapshots when both exist (any real homeowner
  // edit); falls back to the curated fixture diff only for proj-001's
  // original, untouched history (which was never given real per-item
  // snapshots — see compareBOQVersionsForProject's own doc comment).
  const diff = parent
    ? (compareBOQVersionsForProject(projectId, parent.id, version.id) ?? compareVersions(parent, version))
    : null
  const changes = diff ? [...diff.added, ...diff.modified, ...diff.removed] : getVersionChanges(version.id)
  const canCompare = !!parent || versions.some(v => v.parentVersionId === version.id)

  return (
    <div className="relative pl-8 sm:pl-10" style={{ animation: 'welcomeFadeUp 0.4s ease-out both' }}>
      {/* Timeline rail */}
      <span
        aria-hidden="true"
        className="absolute left-[9px] sm:left-[11px] top-1 w-3 h-3 rounded-full"
        style={{ backgroundColor: version.status === 'active' ? '#722ED1' : '#CAC7C6', boxShadow: version.status === 'active' ? '0 0 0 4px #F3EAFF' : 'none' }}
      />
      {!isFirst && (
        <span aria-hidden="true" className="absolute left-[14px] sm:left-[16px] -top-6 w-px h-6" style={{ backgroundColor: '#F4F0EC' }} />
      )}

      <div
        className="bg-white rounded-[16px] p-5 flex flex-col gap-4"
        style={{ border: version.status === 'active' ? '2px solid #722ED1' : '1px solid #CAC7C6' }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[16px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Version {version.versionNumber}</span>
            <StatusBadge status={version.status} />
          </div>
          <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Created {formatDate(version.createdAt)}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Estimate</span>
            <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{estimateVersionNumber ? `Version ${estimateVersionNumber}` : '—'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>BOQ Value</span>
            <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{fmtL(version.totalValue ?? 0)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Items</span>
            <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{version.itemCount}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Changes</span>
            {diff ? (
              <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                {diff.itemCountDiff !== 0 ? `${diff.itemCountDiff > 0 ? '+' : ''}${diff.itemCountDiff} items · ` : ''}{formatSigned(diff.totalValueDiff)}
              </span>
            ) : (
              <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>—</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D] shrink-0 pt-0.5" style={{ fontFamily: FONT_MONO }}>Reason</span>
          <p className="text-[13px] text-[#242326] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>{version.changeSummary}</p>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap pt-1" style={{ borderTop: '1px solid #FFFFFF' }}>
          <span className="text-[11px] text-[#9A949D] pt-3" style={{ fontFamily: FONT_BODY }}>Created by {version.createdBy}{changes.length > 0 ? ` · ${changes.length} line changes` : ''}</span>
          <div className="flex items-center gap-2 pt-3 flex-wrap">
            <button onClick={onView} className="h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] font-medium text-[#242326] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-colors" style={{ fontFamily: FONT_BODY }}>
              View
            </button>
            {canCompare && (
              <button onClick={onCompare} className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] font-medium text-[#242326] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-colors" style={{ fontFamily: FONT_BODY }}>
                <IcoCompare /> Compare
              </button>
            )}
            <button onClick={onDownload} className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] font-medium text-[#242326] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-colors" style={{ fontFamily: FONT_BODY }}>
              <IcoDownload /> Download
            </button>
            {version.status === 'active' && (
              <button onClick={onCreateRevision} className="h-8 px-3 rounded-[8px] text-white text-[12px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>
                Create revision
              </button>
            )}
          </div>
        </div>

        {version.status !== 'active' && (
          <p className="text-[11px] text-[#9A949D] leading-[1.5] m-0 italic" style={{ fontFamily: FONT_BODY }}>
            Historical versions can't be edited directly — create a new version based on this one instead.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Estimate ↔ BOQ relationship ─────────────────────────────────────────────

function VersionRelationship({ versions, estimateVersionNumber, onOpenEstimate }: { versions: BOQVersion[]; estimateVersionNumber?: number; onOpenEstimate: (estId: string) => void }) {
  const chronological = [...versions].sort((a, b) => a.versionNumber - b.versionNumber)
  const estimateGroups = new Map<string, BOQVersion[]>()
  for (const v of chronological) {
    const list = estimateGroups.get(v.estimateVersionId) ?? []
    list.push(v)
    estimateGroups.set(v.estimateVersionId, list)
  }

  return (
    <SectionCard eyebrow="Estimate ↔ BOQ Relationship">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 flex-wrap">
        {[...estimateGroups.entries()].map(([estId, boqs]) => (
          <div key={estId} className="flex flex-col items-start gap-2">
            <button
              onClick={() => onOpenEstimate(estId)}
              className="text-[13px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
              style={{ color: '#242326', fontFamily: FONT_HEAD }}
            >
              {estimateVersionNumber ? `Estimate V${estimateVersionNumber}` : 'Estimate'}
            </button>
            {boqs.map((v, i) => (
              <div key={v.id} className="flex flex-col items-start gap-1">
                {i === 0 ? (
                  <span aria-hidden="true" className="text-[#9A949D]"><IcoArrowDown /></span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="text-[#9A949D]"><IcoArrowDown /></span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-[5px]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>BOQ adjustment only</span>
                  </span>
                )}
                <span
                  className="text-[12px] px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: v.status === 'active' ? '#F3EAFF' : '#F7F5F3',
                    color: v.status === 'active' ? '#722ED1' : '#808080',
                    fontFamily: FONT_MONO,
                  }}
                >
                  BOQ V{v.versionNumber}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Readiness ────────────────────────────────────────────────────────────────

function BOQReadiness({ version }: { version: BOQVersion }) {
  const r = version.readiness
  if (!r) return null
  const items: { label: string; done: boolean }[] = [
    { label: 'Estimate locked', done: r.estimateLocked },
    { label: 'BOQ generated', done: r.boqGenerated },
    { label: 'BOQ reviewed', done: r.boqReviewed },
    { label: 'Plan analysed', done: r.planAnalysed },
    { label: 'Structural drawings', done: r.structuralDrawings },
    { label: 'Contractor ready', done: r.contractorReady },
  ]
  return (
    <SectionCard eyebrow="Current BOQ Readiness">
      <div className="flex flex-col gap-2">
        {items.map(i => (
          <div key={i.label} className="flex items-center justify-between">
            <span className="text-[13px]" style={{ fontFamily: FONT_BODY, color: i.done ? '#1E1E1E' : '#A1A1A1' }}>{i.label}</span>
            {i.done ? (
              <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#722ED1' }}><IcoCheck /></span>
            ) : (
              <span className="w-[18px] h-[18px] rounded-full border" style={{ borderColor: '#E3DDD7' }} />
            )}
          </div>
        ))}
      </div>
      <p className="text-[12px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
        Complete plan analysis and structural validation before sending this BOQ to contractors.
      </p>
    </SectionCard>
  )
}

// ─── Hozie insight ───────────────────────────────────────────────────────────

function HozieInsight({ message, onAskHozie }: { message: string; onAskHozie: () => void }) {
  return (
    <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-white flex items-center justify-center shrink-0"><HIcon size={20} /></span>
        <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>Hozie Check</span>
      </div>
      <p className="text-[13px] text-[#242326] leading-[1.6] m-0 italic" style={{ fontFamily: FONT_BODY }}>
        "{message}"
      </p>
      <button onClick={onAskHozie} className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline" style={{ color: '#722ED1', fontFamily: FONT_BODY }}>Ask Hozie →</button>
    </div>
  )
}

// ─── Change list ─────────────────────────────────────────────────────────────

function ChangeRow({ label, badge, badgeColor, children }: { label: string; badge: string; badgeColor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 py-3" style={{ borderTop: '1px solid #FFFFFF' }}>
      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-[5px]" style={{ backgroundColor: badgeColor, color: '#FFFFFF', fontFamily: FONT_MONO }}>{badge}</span>
        <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function ChangeList({ comparison }: { comparison: BOQVersionComparison }) {
  const [expanded, setExpanded] = useState(true)
  const hasDetail = comparison.added.length + comparison.modified.length + comparison.removed.length > 0

  return (
    <div className="bg-white rounded-[16px] border border-[#E3DDD7] overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer border-0 bg-transparent"
      >
        <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>What changed?</span>
        <span className="flex items-center gap-3">
          <span className="text-[11px]" style={{ fontFamily: FONT_BODY, color: '#68636D' }}>
            Added {comparison.added.length} · Modified {comparison.modified.length} · Removed {comparison.removed.length}
          </span>
          <span className="text-[#68636D] transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}><IcoChevronDown /></span>
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 flex flex-col">
          {!hasDetail && (
            <p className="text-[12px] text-[#9A949D] m-0 py-3" style={{ fontFamily: FONT_BODY }}>
              Detailed line-item changes aren't available for this comparison — only version-level totals.
            </p>
          )}
          {comparison.added.map(c => (
            <ChangeRow key={c.id} label={c.itemName} badge="Added" badgeColor="#722ED1">
              <div className="flex items-center justify-between text-[12px]" style={{ fontFamily: FONT_BODY, color: '#68636D' }}>
                <span>New item{c.newValue ? ` · ${c.newValue}` : ''}</span>
                <span className="font-semibold" style={{ color: '#242326' }}>{formatSigned(c.costDifference)}</span>
              </div>
            </ChangeRow>
          ))}
          {comparison.modified.map(c => (
            <ChangeRow key={c.id} label={c.itemName} badge="Modified" badgeColor="#D97706">
              <div className="flex items-center justify-between text-[12px]" style={{ fontFamily: FONT_BODY, color: '#68636D' }}>
                <span>{c.field}: {c.oldValue} <span aria-hidden="true">→</span> {c.newValue}</span>
                <span className="font-semibold" style={{ color: '#242326' }}>{formatSigned(c.costDifference)}</span>
              </div>
            </ChangeRow>
          ))}
          {comparison.removed.map(c => (
            <ChangeRow key={c.id} label={c.itemName} badge="Removed" badgeColor="#A1A1A1">
              <div className="flex items-center justify-between text-[12px]" style={{ fontFamily: FONT_BODY, color: '#68636D' }}>
                <span>Removed from BOQ</span>
                <span className="font-semibold" style={{ color: '#242326' }}>{formatSigned(c.costDifference)}</span>
              </div>
            </ChangeRow>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Version comparison overlay ──────────────────────────────────────────────

function VersionComparisonOverlay({ comparison, onClose }: { comparison: BOQVersionComparison; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const { from, to } = comparison
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-title"
        className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto z-50 w-full sm:w-[560px] bg-white flex flex-col"
        style={{ boxShadow: '-8px 0 40px rgba(36,35,38,0.12)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3DDD7] shrink-0">
          <span id="compare-title" className="text-[10px] uppercase tracking-[0.10em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Version Comparison</span>
          <button ref={closeRef} onClick={onClose} aria-label="Close comparison" className="w-8 h-8 rounded-full flex items-center justify-center text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer border-0 bg-transparent transition-colors"><IcoClose /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[15px] font-semibold text-[#68636D]" style={{ fontFamily: FONT_HEAD }}>BOQ V{from.versionNumber}</span>
            <span className="text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>vs</span>
            <span className="text-[15px] font-semibold" style={{ fontFamily: FONT_HEAD, color: '#722ED1' }}>BOQ V{to.versionNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Total value', fmtL(from.totalValue ?? 0), fmtL(to.totalValue ?? 0), formatSigned(comparison.totalValueDiff)],
              ['Items', String(from.itemCount ?? 0), String(to.itemCount ?? 0), `${comparison.itemCountDiff > 0 ? '+' : ''}${comparison.itemCountDiff}`],
              ['Material cost', fmtL(from.materialCost ?? 0), fmtL(to.materialCost ?? 0), formatSigned(comparison.materialCostDiff)],
              ['Labour cost', fmtL(from.labourCost ?? 0), fmtL(to.labourCost ?? 0), formatSigned(comparison.labourCostDiff)],
            ].map(([label, before, after, diff]) => (
              <div key={label} className="flex flex-col gap-1 p-3 rounded-[12px]" style={{ backgroundColor: '#FFFFFF' }}>
                <span className="text-[9px] uppercase tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{label}</span>
                <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
                  {before} <span aria-hidden="true" style={{ color: '#9A949D' }}>→</span> <span className="font-semibold">{after}</span>
                </span>
                <span className="text-[11px] font-semibold" style={{ color: '#722ED1', fontFamily: FONT_MONO }}>{diff}</span>
              </div>
            ))}
          </div>

          <ChangeList comparison={comparison} />
        </div>
      </div>
    </>
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
        <SkeletonBlock h={10} w="20%" />
        <SkeletonBlock h={30} w="40%" />
        <SkeletonBlock h={12} w="60%" />
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
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Unable to load BOQ history. Try again.</p>
      <button onClick={onRetry} className="h-9 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}>Try again</button>
    </div>
  )
}

function NoVersionsPanel() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 bg-white rounded-[16px] border border-[#E3DDD7]">
      <span style={{ color: '#9A949D' }}><IcoEmptyBox /></span>
      <p className="text-[14px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No BOQ versions have been created yet.</p>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type ScreenStatus = 'loading' | 'ready' | 'no-versions' | 'error'

export default function BOQVersionHistoryScreen({
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
   *  boqActiveVersion.projectId ('proj-001'); a project with no BOQ shows
   *  the existing 'no-versions' state instead of a substitute project's
   *  history. */
  projectId?: string
}) {
  // Customer Implementation 10I — this project's own version list (a
  // single real "active" version for a real project — see boqGeneration.ts;
  // 10I is not the version-persistence task, so no history/diffing beyond
  // the proj-001 compatibility case is fabricated here). Empty for an
  // absent/no-Estimate project — never the proj-001 fixture as a fallback.
  const versions = getBOQVersionsForProject(projectId)
  const activeVersion = getBOQActiveVersionForProject(projectId)
  // Customer Implementation 10J — a real project's estimateVersionId is a
  // generated id (est-<timestamp>-<n>), not the old 'est-v1'/'est-v2'
  // fixture format the version cards' own '.replace(\"est-v\", \"\")' display
  // logic assumed; resolving the real Estimate's versionNumber directly
  // (same Estimate throughout every BOQ revision — see boqGeneration.ts)
  // is the honest fix rather than parsing an id that was never meant to be
  // display text.
  const estimateVersionNumber = getEstimateVersionForBOQ(projectId)?.versionNumber

  // Customer Implementation 10L — versions are already resolved
  // synchronously above, so status reflects that immediately rather than
  // behind an artificial 550ms timer.
  const [status, setStatus] = useState<ScreenStatus>(versions.length > 0 ? 'ready' : 'no-versions')
  const [compareOpen, setCompareOpen] = useState<BOQVersionComparison | null>(null)

  useEffect(() => {
    setStatus(versions.length > 0 ? 'ready' : 'no-versions')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const goBOQ = () => onNavigate('detailed-boq')
  const viewVersion = (_v: BOQVersion) => onNavigate('detailed-boq')
  const askHozie = () => activeVersion && onNavigate('ai-advisor', {
    boq_version_id: activeVersion.id,
    estimate_version_id: activeVersion.estimateVersionId,
    project_id: projectId ?? '',
  })
  const createRevision = () => onNavigate('boq-edit')
  const openEstimate = (_estId: string) => onNavigate('estimate-dashboard')

  const openCompare = (version: BOQVersion) => {
    // Customer Implementation 10J/10L — see the matching note in
    // BOQVersionCard: real diff first, fixture diff only as a fallback for
    // proj-001's untouched history.
    const parent = versions.find(v => v.id === version.parentVersionId)
    if (parent) { setCompareOpen(compareBOQVersionsForProject(projectId, parent.id, version.id) ?? compareVersions(parent, version)); return }
    const child = versions.find(v => v.parentVersionId === version.id)
    if (child) setCompareOpen(compareBOQVersionsForProject(projectId, version.id, child.id) ?? compareVersions(version, child))
  }

  const downloadVersion = (_v: BOQVersion | undefined) => { /* no backend yet — PDF export is out of scope for this demo */ }
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
        <button onClick={goBOQ} aria-label="Back to BOQ" className="flex items-center gap-1 text-[#68636D] border-0 bg-transparent cursor-pointer text-[13px]" style={{ fontFamily: FONT_BODY }}>
          <IcoChevronLeft /> BOQ
        </button>
        <span className="text-[15px] font-semibold text-[#242326] truncate px-2" style={{ fontFamily: FONT_HEAD }}>BOQ History</span>
        <button onClick={() => downloadVersion(activeVersion)} aria-label="Download current BOQ" className="w-8 h-8 flex items-center justify-center text-[#68636D] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="boq" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-white border-b border-[#E3DDD7]">
            <div className="flex flex-col gap-0.5 min-w-0">
              <h1 className="text-[20px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>BOQ Version History</h1>
              <span className="text-[13px] text-[#68636D] truncate" style={{ fontFamily: FONT_BODY }}>{projectName} · {location} · {area}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={goBOQ} className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all" style={{ fontFamily: FONT_BODY }}>
                <IcoChevronLeft /> Back to BOQ
              </button>
              <button onClick={() => downloadVersion(activeVersion)} className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E3DDD7] text-[12px] text-[#68636D] hover:bg-[#F4F0EC] cursor-pointer bg-transparent transition-all" style={{ fontFamily: FONT_BODY }}>
                <IcoDownload /> Download current BOQ
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              <div className="flex flex-col gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <span className="text-[10px] tracking-[0.10em] text-[#722ED1] uppercase" style={{ fontFamily: FONT_MONO }}>BOQ History</span>
                <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#242326] m-0 leading-[1.08]" style={{ fontFamily: FONT_HEAD }}>Your BOQ versions.</h1>
                <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[600px]" style={{ fontFamily: FONT_BODY }}>
                  Track how your Bill of Quantities has changed as your project details, estimate and construction assumptions are refined.
                </p>
                <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{projectName} · {location} · {area}</span>
              </div>

              {/* Customer Implementation 10L — 'loading'/'error' removed:
                  versions are resolved synchronously above, so status can
                  now only genuinely be 'ready' or 'no-versions'.
                  LoadingSkeleton/ErrorPanel stay defined, unused, for a real
                  future async step rather than being deleted outright. */}
              {status === 'no-versions' && <NoVersionsPanel />}

              {status === 'ready' && activeVersion && (
                <>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.08s both' }}>
                    <ActiveBOQCard version={activeVersion} estimateVersionNumber={estimateVersionNumber} onView={goBOQ} onDownload={() => downloadVersion(activeVersion)} />
                  </div>

                  <div className="flex flex-col gap-2" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.11s both' }}>
                    <span className="text-[10px] tracking-[0.10em] text-[#9A949D] uppercase px-1" style={{ fontFamily: FONT_MONO }}>Version Timeline</span>
                    <div className="flex flex-col gap-5">
                      {versions.map((v, i) => (
                        <BOQVersionCard
                          key={v.id}
                          version={v}
                          versions={versions}
                          projectId={projectId}
                          estimateVersionNumber={estimateVersionNumber}
                          isFirst={i === 0}
                          onView={() => viewVersion(v)}
                          onCompare={() => openCompare(v)}
                          onDownload={() => downloadVersion(v)}
                          onCreateRevision={createRevision}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.14s both' }}>
                    <VersionRelationship versions={versions} estimateVersionNumber={estimateVersionNumber} onOpenEstimate={openEstimate} />
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-start" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.17s both' }}>
                    <div className="w-full lg:flex-1"><BOQReadiness version={activeVersion} /></div>
                    <div className="w-full lg:flex-1">
                      <HozieInsight
                        // Customer Implementation 10I/10J — three cases:
                        // (1) a genuinely homeowner-edited active version
                        // (10J) gets an honest message built from that
                        // version's own real changeSummary — never a
                        // fabricated narrative; (2) the untouched proj-001
                        // reference fixture (still createdBy: 'Hozie AI'
                        // with its own real 3-version history) keeps its
                        // original, genuinely-true "Version 3 vs Version 2"
                        // example exactly as 10I wrote it; (3) a real
                        // project with no edits yet (single synthesized
                        // version) gets the honest generic message.
                        message={activeVersion?.createdBy === 'Homeowner edit'
                          ? `Version ${activeVersion.versionNumber} is your current BOQ. You changed: ${activeVersion.changeSummary || 'an item'}. Version ${activeVersion.versionNumber - 1} remains available for comparison.`
                          : versions.length > 1
                            ? 'Version 3 is your current BOQ because you adjusted the reinforcement quantity and a labour rate. Version 2 remains available for comparison.'
                            : 'This BOQ was generated from your current Estimate. Ask me if you want to review or adjust anything in it.'}
                        onAskHozie={askHozie}
                      />
                    </div>
                  </div>

                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.2s both' }}>
                    <button
                      onClick={createRevision}
                      className="w-full sm:w-auto h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
                    >
                      <IcoPlus /> Create new BOQ revision →
                    </button>
                  </div>
                </>
              )}

            </div>
          </main>
        </div>
      </div>

      {compareOpen && <VersionComparisonOverlay comparison={compareOpen} onClose={() => setCompareOpen(null)} />}
    </div>
  )
}
