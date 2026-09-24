import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  projectInputs,
  costAssumptions,
  sensitivityFactors,
  missingInformation,
  estimateConfidence,
  type CostAssumption,
  type ImpactLevel,
} from '@/data/costAssumptions'
import { boqOverview } from '@/data/boqOverview'
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5l4 4 4-4"/>
  </svg>
)
const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2l3 3L5 12H2v-3L9 2z"/>
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



// ─── Section eyebrow tag — distinguishes input vs assumption vs missing info ──

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center h-5 px-2 rounded-[5px] text-[12px] font-semibold tracking-[0.08em] uppercase"
      style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: '"Sometype Mono:SemiBold", monospace' }}
    >
      {children}
    </span>
  )
}

// ─── Impact badge — never color-only, always a text label ───────────────────

const IMPACT_META: Record<ImpactLevel, { label: string; bg: string; fg: string; border?: string }> = {
  low: { label: 'LOW', bg: '#CAC7C6', fg: '#808080' },
  medium: { label: 'MEDIUM', bg: 'var(--hz-primary-soft)', fg: 'var(--hz-primary)' },
  high: { label: 'HIGH', bg: 'var(--hz-primary)', fg: 'var(--hz-surface)' },
  baseline: { label: 'BASELINE', bg: 'var(--hz-surface)', fg: '#808080', border: 'var(--hz-border)' },
}

function ImpactBadge({ impact, label }: { impact: ImpactLevel; label?: string }) {
  const meta = IMPACT_META[impact]
  return (
    <span
      className="inline-flex items-center h-5 px-2.5 rounded-full text-[12px] font-semibold tracking-[0.04em] whitespace-nowrap"
      style={{ backgroundColor: meta.bg, color: meta.fg, border: meta.border ? `1px solid ${meta.border}` : 'none', fontFamily: '"Sometype Mono:SemiBold", monospace' }}
    >
      {(label ?? meta.label).toUpperCase()}
    </span>
  )
}

// ─── Project Inputs card (USER INPUT) ────────────────────────────────────────

function ProjectInputsCard({ onEdit }: { onEdit: (dest: string) => void }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>What Hozie Knows</span>
        <SectionTag>User Input</SectionTag>
      </div>
      <div className="flex flex-col">
        {projectInputs.map((input, i) => (
          <div
            key={input.id}
            className="flex items-center justify-between gap-3 py-3"
            style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hz-surface)' }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{input.label}</span>
              <span className="text-[14px] font-semibold text-[var(--hz-ink)] truncate" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{input.value}</span>
            </div>
            <button
              onClick={() => onEdit(input.editDestination)}
              aria-label={`Edit ${input.label}`}
              className="shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] border border-[var(--hz-border)] text-[11px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors"
              style={{ color: 'var(--hz-ink-muted)', fontFamily: '"Inter Variable", sans-serif' }}
            >
              <IcoEdit /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Assumption card (AI ASSUMPTION) ─────────────────────────────────────────

function AssumptionCard({
  assumption, expanded, onToggle, onAskHozie, selectedQuality, onSelectQuality,
}: {
  assumption: CostAssumption
  expanded: boolean
  onToggle: () => void
  onAskHozie: () => void
  selectedQuality: string
  onSelectQuality: (v: string) => void
}) {
  return (
    <div className="bg-[var(--hz-surface)] overflow-hidden transition-all duration-200" style={{ border: '1px solid var(--hz-border)', borderRadius: 16 }}>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`assumption-panel-${assumption.id}`}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${assumption.name} assumption`}
        className="w-full flex items-start gap-3 p-4 sm:p-5 text-left cursor-pointer border-0 bg-transparent"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>{assumption.name}</span>
            <ImpactBadge impact={assumption.impact} label={assumption.impactLabel} />
          </div>
          <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
            {assumption.id === 'construction-quality' ? selectedQuality : assumption.value}
          </p>
        </div>
        <span
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200"
          style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', transform: expanded ? 'rotate(180deg)' : 'none' }}
        >
          <IcoChevronDown />
        </span>
      </button>

      {expanded && (
        <div id={`assumption-panel-${assumption.id}`} className="px-4 sm:px-5 pb-5 flex flex-col gap-4 border-t border-[var(--hz-surface)] pt-4">
          <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{assumption.description}</p>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Why it matters</span>
              <p className="text-[12px] text-[var(--hz-ink)] leading-[1.55] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{assumption.whyItMatters}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>How it affects the estimate</span>
              <p className="text-[12px] text-[var(--hz-ink)] leading-[1.55] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{assumption.howItAffectsEstimate}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>What can change it</span>
              <p className="text-[12px] text-[var(--hz-ink)] leading-[1.55] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{assumption.whatCanChangeIt}</p>
            </div>
          </div>

          {assumption.items && assumption.items.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {assumption.items.map(item => (
                <span key={item} className="px-2.5 py-1 rounded-full text-[11px]" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: '"Inter Variable", sans-serif' }}>
                  {item}
                </span>
              ))}
            </div>
          )}

          {assumption.editable && assumption.options ? (
            <div className="flex flex-col gap-2">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Change quality</span>
              <div className="flex flex-wrap gap-2">
                {assumption.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => onSelectQuality(opt)}
                    aria-pressed={selectedQuality === opt}
                    className="h-8 px-3.5 rounded-full text-[12px] font-semibold cursor-pointer border transition-colors"
                    style={{
                      fontFamily: '"Inter Variable", sans-serif',
                      backgroundColor: selectedQuality === opt ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
                      color: selectedQuality === opt ? 'var(--hz-primary)' : '#808080',
                      borderColor: selectedQuality === opt ? 'var(--hz-primary)' : '#CAC7C6',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={onAskHozie}
              className="self-start text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
              style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
            >
              Ask Hozie about this →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Cost sensitivity card ────────────────────────────────────────────────────

function SensitivityRow({ factor }: { factor: { name: string; impact: ImpactLevel } }) {
  const fillPct = factor.impact === 'high' ? 90 : factor.impact === 'medium' ? 55 : 25
  const meta = IMPACT_META[factor.impact]
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[var(--hz-ink)] w-[150px] shrink-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{factor.name}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="h-full rounded-full" style={{ width: `${fillPct}%`, backgroundColor: factor.impact === 'high' ? 'var(--hz-primary)' : 'var(--hz-primary-soft)' }} />
      </div>
      <span className="text-[12px] font-semibold w-[74px] text-right shrink-0" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: meta.fg === 'var(--hz-surface)' ? 'var(--hz-primary)' : meta.fg }}>
        {meta.label}
      </span>
    </div>
  )
}

function SensitivityCard() {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4">
      <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>What Could Change Your Cost?</span>
      <div className="flex flex-col gap-3">
        {sensitivityFactors.map(f => <SensitivityRow key={f.id} factor={f} />)}
      </div>
    </div>
  )
}

// ─── Hozie confidence card (ESTIMATE) ────────────────────────────────────────

function ConfidenceCard({ onImprove }: { onImprove: () => void }) {
  return (
    <div
      className="rounded-[16px] p-5 sm:p-6 flex flex-col gap-4"
      style={{ background: 'linear-gradient(135deg, #F9F5FF 0%, var(--hz-surface) 100%)', border: '1px solid rgba(243,234,255,0.10)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[10px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={20} /></span>
          <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Hozie Confidence</span>
        </div>
        <SectionTag>Estimate</SectionTag>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-[40px] font-semibold leading-none" style={{ fontFamily: '"Geist Variable", sans-serif', color: 'var(--hz-primary)' }}>{estimateConfidence.score}%</span>
        <span className="text-[13px] text-[var(--hz-ink-muted)] mb-1" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{estimateConfidence.level}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(243,234,255,0.10)' }}>
        <div className="h-full rounded-full" style={{ width: `${estimateConfidence.score}%`, backgroundColor: 'var(--hz-primary)' }} />
      </div>

      <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{estimateConfidence.summary}</p>

      <ul className="flex flex-col gap-1.5 m-0 p-0" style={{ listStyle: 'none' }}>
        {estimateConfidence.factors.map(f => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
            <span aria-hidden="true" style={{ color: 'var(--hz-primary)' }}>✓</span> {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onImprove}
        className="h-10 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
        style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
      >
        Improve my estimate →
      </button>
    </div>
  )
}

// ─── Missing information card ─────────────────────────────────────────────────

function MissingInfoCard({ onAddNow }: { onAddNow: (id: string) => void }) {
  return (
    <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Information Still Needed</span>
        <SectionTag>Missing Information</SectionTag>
      </div>
      <div className="flex flex-col">
        {missingInformation.map((item, i) => (
          <div key={item.id} className="flex items-center justify-between gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hz-surface)' }}>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>{item.label}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ fontFamily: '"Inter Variable", sans-serif', color: 'var(--hz-ink-subtle)' }}>
                <span className="w-1.5 h-1.5 rounded-full border shrink-0" style={{ borderColor: '#A1A1A1' }} />
                {item.statusText}
              </span>
            </div>
            <button
              onClick={() => onAddNow(item.id)}
              className="shrink-0 text-[12px] font-semibold cursor-pointer border-0 bg-transparent p-0 hover:underline"
              style={{ color: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
            >
              {item.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Disclaimer card ──────────────────────────────────────────────────────────

function DisclaimerCard() {
  const factors = ['site conditions', 'design changes', 'material brands', 'local market prices', 'contractor pricing', 'structural requirements', 'taxes and approvals']
  return (
    <div className="rounded-[14px] p-4 sm:p-5 flex gap-3" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
      <span className="shrink-0 text-[var(--hz-ink-subtle)] mt-0.5"><IcoInfo /></span>
      <div>
        <span className="text-[12px] tracking-[0.08em] uppercase block mb-1.5" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace', color: 'var(--hz-ink-muted)' }}>Important</span>
        <p className="text-[11px] text-[var(--hz-ink-muted)] leading-[1.6] m-0" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
          This is an AI-generated preliminary estimate, not a final construction quotation. Actual cost may vary because of {factors.join(', ')}.
        </p>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CostAssumptionsScreen({
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
  const [expandedId, setExpandedId] = useState<string | null>('construction-quality')
  const [selectedQuality, setSelectedQuality] = useState('Standard')

  const askHozie = () => onNavigate('ai-advisor', { project_id: projectId || boqOverview.projectId })
  const improveEstimate = () => onNavigate('create-project', { project_name: projectName, location })
return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>

      {/* Mobile top bar */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
        <button
          onClick={() => onNavigate('estimate-dashboard')}
          aria-label="Back to estimate"
          className="flex items-center gap-1 text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer text-[13px]"
          style={{ fontFamily: '"Inter Variable", sans-serif' }}
        >
          <IcoChevronLeft /> Estimate
        </button>
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>Cost Assumptions</span>
        <button aria-label="Download PDF" className="w-8 h-8 flex items-center justify-center text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer"><IcoDownload /></button>
      </div>

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-8 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                Cost Assumptions
              </h1>
              <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                {projectName} · {location} · {area}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('estimate-dashboard')}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: '"Inter Variable", sans-serif' }}
              >
                <IcoChevronLeft /> Back to estimate
              </button>
              <button
                aria-label="Download PDF"
                className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[var(--hz-border)] text-[12px] text-[var(--hz-ink-muted)] hover:bg-[var(--hz-surface-muted)] cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: '"Inter Variable", sans-serif' }}
              >
                <IcoDownload /> <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

              {/* Intro */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.05s both' }}>
                <div>
                  <span className="text-[12px] tracking-[0.10em] text-[var(--hz-primary)] uppercase block mb-3" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>
                    Estimate Transparency
                  </span>
                  <h2 className="text-[26px] sm:text-[34px] font-semibold text-[var(--hz-ink)] m-0 leading-[1.1]" style={{ fontFamily: '"Geist Variable", sans-serif' }}>
                    What is this estimate based on?
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 mt-2 max-w-[600px]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>
                    Hozie uses your project details, construction assumptions and regional cost data to create an estimated range. Review these assumptions before using the estimate for decisions.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--hz-primary-soft)] self-start shrink-0" style={{ border: '1px solid rgba(243,234,255,0.10)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--hz-primary)]" style={{ animation: 'hozieStatusPulse 2.5s ease-in-out infinite' }} />
                  <span className="text-[11px] font-medium text-[var(--hz-primary)]" style={{ fontFamily: '"Inter Variable", sans-serif' }}>86% AI confidence</span>
                </div>
              </div>

              {/* Mobile-only: Confidence card comes right after header, before Project Inputs */}
              <div className="lg:hidden" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.08s both' }}>
                <ConfidenceCard onImprove={improveEstimate} />
              </div>

              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Left — Project Inputs + Cost Assumptions */}
                <div className="flex flex-col gap-4 w-full min-w-0" style={{ flex: '62 62 0' }}>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.1s both' }}>
                    <ProjectInputsCard onEdit={dest => onNavigate(dest)} />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: '"Sometype Mono:SemiBold", monospace' }}>Cost Assumptions</span>
                    <SectionTag>AI Assumption</SectionTag>
                  </div>

                  <div className="flex flex-col gap-3">
                    {costAssumptions.map((assumption, i) => (
                      <div key={assumption.id} style={{ animation: `welcomeFadeUp 0.4s ease-out ${0.14 + i * 0.04}s both` }}>
                        <AssumptionCard
                          assumption={assumption}
                          expanded={expandedId === assumption.id}
                          onToggle={() => setExpandedId(cur => cur === assumption.id ? null : assumption.id)}
                          onAskHozie={askHozie}
                          selectedQuality={selectedQuality}
                          onSelectQuality={setSelectedQuality}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right — Sensitivity + Confidence (desktop) + Missing Information */}
                <div className="flex flex-col gap-4 w-full lg:shrink-0 lg:sticky lg:top-6" style={{ flex: '38 38 0', minWidth: 0 }}>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.16s both' }}>
                    <SensitivityCard />
                  </div>
                  <div className="hidden lg:block" style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.2s both' }}>
                    <ConfidenceCard onImprove={improveEstimate} />
                  </div>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.24s both' }}>
                    <MissingInfoCard
                      onAddNow={id => {
                        const dest: Record<string, string> = {
                          'floor-plan': 'upload-plan',
                          'structural-drawings': 'upload-plan',
                          'material-specs': 'material-estimate',
                          'contractor-pricing': 'ai-advisor',
                        }
                        onNavigate(dest[id] ?? 'ai-advisor')
                      }}
                    />
                  </div>
                  <div style={{ animation: 'welcomeFadeUp 0.4s ease-out 0.28s both' }}>
                    <DisclaimerCard />
                  </div>
                </div>
              </div>

            </div>
          </main>

          {/* Bottom actions */}
          <div
            className="sticky bottom-0 z-20 bg-[var(--hz-surface)] border-t border-[var(--hz-border)] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-end gap-2.5"
            style={{ boxShadow: '0 -4px 20px rgba(36,35,38,0.06)' }}
          >
            <button
              onClick={() => onNavigate('estimate-dashboard')}
              className="flex-1 sm:flex-none h-11 px-5 rounded-[12px] border border-[var(--hz-border)] text-[var(--hz-ink)] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[var(--hz-surface-muted)] transition-colors"
              style={{ fontFamily: '"Inter Variable", sans-serif' }}
            >
              Back to estimate
            </button>
            <button
              onClick={improveEstimate}
              className="flex-1 sm:flex-none h-11 px-6 rounded-[12px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
              style={{ backgroundColor: 'var(--hz-primary)', fontFamily: '"Inter Variable", sans-serif' }}
            >
              Improve estimate →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
