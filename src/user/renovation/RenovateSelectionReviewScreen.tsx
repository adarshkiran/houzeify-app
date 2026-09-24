// ─── Renovate → Review Your Selection ────────────────────────────────────
// Screen 12 of the Renovate journey — reached after picking a Package, a
// Professional, or accepting a Custom Proposal alike. Same Field/
// SectionCard summary pattern as ProjectOverviewScreen's own award-summary
// block.

import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { getRenovationPackage } from '@/data/renovationPackages'
import { getRenovationProfessional } from '@/data/renovationProfessionals'
import { formatINR } from '@/data/materials'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
      {title && <h2 className="text-[13px] font-semibold text-[var(--hz-ink)] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
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

export default function RenovateSelectionReviewScreen({
  onNavigate,
  packageId,
  professionalId,
  isCustomProposal,
  customPrice,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  packageId?: string
  professionalId?: string
  isCustomProposal?: string
  customPrice?: string
}) {
  const pkg = packageId ? getRenovationPackage(packageId) : undefined
  const pro = professionalId && professionalId !== 'custom-quote-professional' ? getRenovationProfessional(professionalId) : undefined
  const isCustom = isCustomProposal === 'true'

  const professionalName = pro?.name ?? (isCustom ? 'Assigned renovation professional' : undefined)
  const price = pkg?.price ?? (customPrice ? Number(customPrice) : pro?.startingPrice)
  const scope = pkg?.scope ?? (isCustom ? 'Full renovation scope, sized to your project by an on-site assessment.' : pro ? `Renovation services across: ${pro.specializations.join(', ')}` : undefined)
  const materials = pkg?.materials.join(', ') ?? (isCustom ? 'Finalized during the site assessment.' : 'Selected together with your professional.')
  const timeline = pkg?.timeline ?? (isCustom ? '6–8 weeks' : '4–6 weeks')
  const warranty = pkg ? '90-day workmanship warranty' : isCustom ? 'Covered under the custom proposal terms' : '30-day workmanship warranty'

  function handleContinue() {
    onNavigate('renovate-book', {
      renovation_selection_title: pkg?.title ?? professionalName ?? 'Renovation',
      renovation_selection_price: String(price ?? 0),
      renovation_selection_timeline: timeline,
    })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-proceed')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
            <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-proceed')} className="text-[13px] text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[720px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Review Your Selection</h2>
              </div>

              <SectionCard>
                <div className="grid grid-cols-2 gap-4">
                  {professionalName && <Field label="Professional" value={professionalName} />}
                  {pkg && <Field label="Package" value={pkg.title} />}
                  <Field label="Price" value={price !== undefined ? formatINR(price) : undefined} />
                  <Field label="Timeline" value={timeline} />
                  <Field label="Warranty" value={warranty} />
                  {isCustom && <Field label="Additional charges" value="None beyond this proposal" />}
                </div>
              </SectionCard>

              <SectionCard title="Scope">
                <p className="text-[13.5px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{scope}</p>
              </SectionCard>

              <SectionCard title="Materials">
                <p className="text-[13.5px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{materials}</p>
              </SectionCard>

              <button
                onClick={handleContinue}
                className="h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[260px] bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]"
                style={{ fontFamily: FONT_BODY }}
              >
                Continue to Book →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
