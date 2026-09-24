// ─── Renovate → Estimated Renovation Cost ────────────────────────────────
// Screen 09 of the Renovate journey — "Estimated Renovation Cost". Same
// EstimateHero range display + CostSummary breakdown-row pattern as
// FinalEstimateScreen, plus the real shared EstimateFooter/MetricCard
// components — no new estimation visual style. The finish chip is
// editable right here ("modify major specifications and update the
// estimate") and recomputes the range/breakdown live via
// renovationEstimate.ts's own pure calc.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import EstimateFooter from '@/shared/components/EstimateFooter'
import {
  estimateRenovationCost,
  RENOVATION_FINISH_OPTIONS, RENOVATION_FINISH_LABELS,
  type RenovationBudgetRange, type RenovationFinish,
} from '@/data/renovationEstimate'
import { formatINR } from '@/data/materials'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const TOTAL_STEPS = 9

const CheckIcon = ({ size = 8 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function Chip({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
        borderColor: selected ? 'var(--hz-primary)' : '#CAC7C6',
        color: selected ? 'var(--hz-primary)' : 'var(--hz-black)',
      }}
    >
      {selected && <span className="w-[14px] h-[14px] rounded-full bg-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon /></span>}
      {label}
    </button>
  )
}

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-[var(--hz-surface)] border-b border-[var(--hz-border)] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Renovate</span>
      </div>
      <button onClick={onBack} className="text-[13px] text-[var(--hz-ink-muted)] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function RenovateEstimateScreen({
  onNavigate,
  budgetRange,
  budgetCustom,
  finish,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  budgetRange?: string
  budgetCustom?: string
  finish?: string
}) {
  const [selectedFinish, setSelectedFinish] = useState<RenovationFinish>((finish as RenovationFinish) ?? 'standard')
  const range = (budgetRange as RenovationBudgetRange) ?? '3l-5l'
  const custom = budgetCustom ? Number(budgetCustom) : undefined
  const estimate = estimateRenovationCost(range, selectedFinish, custom)

  function handleContinue() {
    onNavigate('renovate-proceed', {
      renovation_finish: selectedFinish,
      renovation_estimate_min: String(estimate.minCost),
      renovation_estimate_max: String(estimate.maxCost),
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-ai-plan')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-ai-plan')} className="text-[13px] text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <div className="hidden md:block h-[2px] bg-[var(--hz-surface-muted)] w-full shrink-0">
            <div className="h-full bg-[var(--hz-primary)] transition-all duration-500" style={{ width: `${(9 / TOTAL_STEPS) * 100}%` }} />
          </div>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[720px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Step {TOTAL_STEPS} of {TOTAL_STEPS}</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Estimated Renovation Cost</h2>
              </div>

              <div
                className="rounded-[20px] p-6 sm:p-8 flex flex-col gap-3"
                style={{ background: 'linear-gradient(135deg, rgba(243,234,255,0.10) 0%, var(--hz-surface) 55%)', border: '1px solid var(--hz-border)', boxShadow: '0 4px 32px rgba(114,46,209,0.08)' }}
              >
                <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: FONT_MONO }}>Estimated Renovation Cost</span>
                <span className="text-[36px] sm:text-[46px] font-semibold leading-none" style={{ fontFamily: FONT_HEAD, color: 'var(--hz-primary)' }}>
                  {formatINR(estimate.minCost)} – {formatINR(estimate.maxCost)}
                </span>
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                  Preliminary estimate based on your requirements, location, area, and selected finish.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Modify finish to update estimate</span>
                <div role="radiogroup" aria-label="Finish" className="flex flex-wrap gap-2">
                  {RENOVATION_FINISH_OPTIONS.map(opt => (
                    <Chip key={opt} label={RENOVATION_FINISH_LABELS[opt]} selected={selectedFinish === opt} onSelect={() => setSelectedFinish(opt)} />
                  ))}
                </div>
              </div>

              <div className="bg-[var(--hz-surface)] rounded-[16px] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col gap-3">
                <span className="text-[12px] tracking-[0.10em] text-[var(--hz-ink-subtle)] uppercase" style={{ fontFamily: FONT_MONO }}>Cost Breakdown</span>
                <div className="flex flex-col">
                  {estimate.breakdown.map((row, i) => (
                    <div key={row.category} className="flex items-center justify-between py-2.5" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hz-surface-muted)' }}>
                      <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{row.category}</span>
                      <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{formatINR(row.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          <EstimateFooter
            label="Estimated Cost"
            value={`${formatINR(estimate.minCost)} – ${formatINR(estimate.maxCost)}`}
            primaryLabel="Continue →"
            onPrimary={handleContinue}
          />
        </div>
      </div>
    </div>
  )
}
