// ─── Renovate → Get a Custom Quote ───────────────────────────────────────
// Screen 11C of the Renovate journey. Represents Request Site Visit →
// Professional Assigned → Site Visit Scheduled → Site Assessment → Custom
// Proposal → Review → Accept as sequential states within one screen
// (rather than 5-6 near-empty screen files), using the same simulated-
// delay convention ConstructionIntentScreen/EstimateLoadingScreen already
// use (setTimeout, no real backend). Never called a "Bid" anywhere — the
// end result of this chain is always a "Custom Proposal".

import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { RENOVATION_AREA_LABELS, type RenovationArea } from './RenovateSelectAreaScreen'
import { formatINR } from '@/data/materials'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const IcoCheck = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{value ?? '—'}</p>
    </div>
  )
}

type QuoteStage = 'summary' | 'requesting' | 'scheduled' | 'assessing' | 'proposal-ready'

const STAGE_STEPS: { id: QuoteStage; label: string }[] = [
  { id: 'requesting', label: 'Professional Assigned' },
  { id: 'scheduled', label: 'Site Visit Scheduled' },
  { id: 'assessing', label: 'Site Assessment' },
  { id: 'proposal-ready', label: 'Custom Proposal' },
]

function MobileTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Renovate</span>
      </div>
      <button onClick={onBack} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

export default function RenovateCustomQuoteScreen({
  onNavigate,
  renovationAreas,
  location,
  builtUpArea,
  estimateMin,
  estimateMax,
  finish,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  renovationAreas?: string
  location?: string
  builtUpArea?: string
  estimateMin?: string
  estimateMax?: string
  finish?: string
}) {
  const [stage, setStage] = useState<QuoteStage>('summary')
  const areas = (renovationAreas?.split(',').filter(Boolean) as RenovationArea[]) ?? []
  const projectTitle = areas.length > 0 ? `${areas.map(a => RENOVATION_AREA_LABELS[a]).join(' + ')} Renovation` : 'Renovation'

  useEffect(() => {
    if (stage === 'requesting') {
      const t = setTimeout(() => setStage('scheduled'), 1200)
      return () => clearTimeout(t)
    }
    if (stage === 'scheduled') {
      const t = setTimeout(() => setStage('assessing'), 1200)
      return () => clearTimeout(t)
    }
    if (stage === 'assessing') {
      const t = setTimeout(() => setStage('proposal-ready'), 1400)
      return () => clearTimeout(t)
    }
  }, [stage])

  const proposalPrice = estimateMin && estimateMax ? Math.round((Number(estimateMin) + Number(estimateMax)) / 2) : 400_000

  function requestSiteVisit() {
    setStage('requesting')
  }

  function acceptProposal() {
    onNavigate('renovate-selection-review', {
      renovation_professional_id: 'custom-quote-professional',
      renovation_package_id: '',
      renovation_custom_proposal: 'true',
      renovation_selection_price: String(proposalPrice),
    })
  }

  const currentStepIndex = STAGE_STEPS.findIndex(s => s.id === stage)
  const isProposalReady = stage === 'proposal-ready'

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onBack={() => onNavigate('renovate-proceed')} />

      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />

        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Renovate</h1>
            <button onClick={() => onNavigate('renovate-proceed')} className="text-[13px] text-[#68636D] hover:text-[#242326] transition-colors cursor-pointer border-0 bg-transparent" style={{ fontFamily: FONT_BODY }}>
              Back
            </button>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[720px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Custom Quote</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Get a Custom Quote</h2>
                <p className="text-[13.5px] text-[#68636D] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                  Your renovation has requirements that may need a professional assessment before the final price can be determined.
                </p>
              </div>

              <SectionCard title="Project summary">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Project" value={projectTitle} />
                  <Field label="Location" value={location} />
                  <Field label="Area" value={builtUpArea ? `${builtUpArea} sq.ft` : undefined} />
                  <Field label="Preliminary estimate" value={estimateMin && estimateMax ? `${formatINR(Number(estimateMin))} – ${formatINR(Number(estimateMax))}` : undefined} />
                </div>
              </SectionCard>

              {stage === 'summary' && (
                <button
                  onClick={requestSiteVisit}
                  className="h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[240px] bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Request Site Visit →
                </button>
              )}

              {stage !== 'summary' && (
                <SectionCard title="Status">
                  <div className="flex flex-col gap-3">
                    {STAGE_STEPS.map((step, i) => {
                      const isFinalStep = step.id === 'proposal-ready'
                      const done = i < currentStepIndex || (isFinalStep && isProposalReady)
                      const active = i === currentStepIndex && !isProposalReady
                      return (
                        <div key={step.id} className="flex items-center gap-3">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: done ? '#722ED1' : active ? '#F3EAFF' : '#F4F0EC' }}
                          >
                            {done ? (
                              <IcoCheck />
                            ) : (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active ? '#722ED1' : '#CAC7C6', animation: active ? 'hozieStatusPulse 1.6s ease-in-out infinite' : undefined }} />
                            )}
                          </span>
                          <span className="text-[13.5px]" style={{ fontFamily: FONT_HEAD, color: done ? '#242326' : active ? '#722ED1' : '#9A949D' }}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </SectionCard>
              )}

              {stage === 'proposal-ready' && (
                <>
                  <SectionCard title="Custom Proposal">
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Proposed price" value={formatINR(proposalPrice)} />
                        <Field label="Timeline" value="6–8 weeks" />
                      </div>
                      <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                        Based on the site assessment, this proposal covers your full renovation scope with a dedicated professional, sized to your project's specific requirements.
                      </p>
                    </div>
                  </SectionCard>

                  <button
                    onClick={acceptProposal}
                    className="h-[52px] px-6 rounded-[12px] text-[14px] font-semibold transition-all duration-150 border-0 w-full sm:w-auto sm:min-w-[240px] bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Accept Proposal →
                  </button>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
