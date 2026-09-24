// ─── Renovate → Review requirements ──────────────────────────────────────
// Screen 07 of the Renovate journey — "Review your renovation". Same
// Field/SectionCard summary pattern as ProjectOverviewScreen. Every row's
// "Edit" link just navigates back to the step that owns that data — since
// every Renovate screen's own data lives in the same projectData bag
// (App.tsx's navigateTo merges rather than replaces), re-continuing from
// that step overwrites the same keys in place, no separate "draft" model
// needed.

import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { RENOVATION_AREA_LABELS, type RenovationArea } from './RenovateSelectAreaScreen'
import { REQUIREMENT_LABELS, type RequirementTag } from './RenovateRequirementsScreen'
import { RENOVATION_BUDGET_LABELS, RENOVATION_FINISH_LABELS, type RenovationBudgetRange, type RenovationFinish } from '@/data/renovationEstimate'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const TOTAL_STEPS = 9

function SectionCard({ title, editDest, onNavigate, children }: { title: string; editDest: string; onNavigate: (s: string) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-3" style={{ border: '1px solid var(--hz-border)' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{title}</h2>
        <button onClick={() => onNavigate(editDest)} className="text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
          Edit
        </button>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{value ?? '—'}</p>
    </div>
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

export default function RenovateReviewScreen({
  onNavigate,
  renovationAreas,
  location,
  builtUpArea,
  budgetRange,
  budgetCustom,
  finish,
  goal,
  requirementTags,
  photosCount,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  renovationAreas?: string
  location?: string
  builtUpArea?: string
  budgetRange?: string
  budgetCustom?: string
  finish?: string
  goal?: string
  requirementTags?: string
  photosCount?: string
}) {
  const areas = (renovationAreas?.split(',').filter(Boolean) as RenovationArea[]) ?? []
  const tags = (requirementTags?.split(',').filter(Boolean) as RequirementTag[]) ?? []
  const projectTitle = areas.length === 1 ? `${RENOVATION_AREA_LABELS[areas[0]]} Renovation` : areas.length > 1 ? `${areas.map(a => RENOVATION_AREA_LABELS[a]).join(' + ')} Renovation` : 'Renovation'
  const budgetLabel = budgetRange === 'custom' && budgetCustom ? `₹${Number(budgetCustom).toLocaleString('en-IN')}` : (RENOVATION_BUDGET_LABELS as Record<string, string>)[budgetRange ?? ''] ?? undefined
  const finishLabel = (RENOVATION_FINISH_LABELS as Record<string, string>)[finish ?? ''] ?? undefined
  const requirementItems = [goal?.trim(), ...tags.map(t => REQUIREMENT_LABELS[t])].filter(Boolean) as string[]
  const photosLabel = photosCount && Number(photosCount) > 0 ? `${photosCount} uploaded` : 'None uploaded'

  function handleGenerate() {
    onNavigate('renovate-ai-plan')
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-upload')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-upload')} className="text-[13px] text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <div className="hidden md:block h-[2px] bg-[var(--hz-surface-muted)] w-full shrink-0">
            <div className="h-full bg-[var(--hz-primary)] transition-all duration-500" style={{ width: `${(6 / TOTAL_STEPS) * 100}%` }} />
          </div>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[720px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Step 6 of {TOTAL_STEPS}</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Review your renovation</h2>
              </div>

              <SectionCard title="Project" editDest="renovate-select-area" onNavigate={onNavigate}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Project" value={projectTitle} />
                  <Field label="Location" value={location} />
                </div>
              </SectionCard>

              <SectionCard title="Space" editDest="renovate-space-details" onNavigate={onNavigate}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Area" value={builtUpArea ? `${builtUpArea} sq.ft` : undefined} />
                </div>
              </SectionCard>

              <SectionCard title="Budget & timeline" editDest="renovate-budget-timeline" onNavigate={onNavigate}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Budget" value={budgetLabel} />
                  <Field label="Finish" value={finishLabel} />
                </div>
              </SectionCard>

              <SectionCard title="Requirements" editDest="renovate-requirements" onNavigate={onNavigate}>
                {requirementItems.length > 0 ? (
                  <ul className="flex flex-col gap-1.5 m-0 pl-4">
                    {requirementItems.map(item => (
                      <li key={item} className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[13px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>No requirements added yet.</span>
                )}
              </SectionCard>

              <SectionCard title="Photos" editDest="renovate-upload" onNavigate={onNavigate}>
                <Field label="Photos" value={photosLabel} />
              </SectionCard>

              <button
                onClick={handleGenerate}
                className="h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[280px] bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]"
                style={{ fontFamily: FONT_BODY }}
              >
                Generate Renovation Plan →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
