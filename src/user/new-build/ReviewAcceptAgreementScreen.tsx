// ─── Review & Accept Agreement — Flow 04 (New Build) ────────────────────────
// A condensed re-statement of Project Agreement plus the one explicit,
// hard-to-accidentally-trigger action this whole flow needs: accepting the
// agreement. Mirrors FinalEstimateScreen's own "ready to lock"/confirm
// pattern (an explicit checkbox + a button that stays disabled until it's
// checked) rather than a single click — never a bare "Accept" button a
// homeowner could tap by mistake.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { getAgreementForProject, acceptAgreement } from '@/data/agreements'
import { formatBidAmount } from '@/data/bids'

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

export default function ReviewAcceptAgreementScreen({
  onNavigate,
  projectId,
  projectName,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  projectId?: string
  projectName?: string
}) {
  const agreement = projectId ? getAgreementForProject(projectId) : undefined
  const [acknowledged, setAcknowledged] = useState(false)
  const [accepted, setAccepted] = useState(agreement?.status === 'accepted')

  function handleAccept() {
    if (!acknowledged || !agreement) return
    acceptAgreement(agreement.id)
    setAccepted(true)
  }
  function handleContinue() {
    onNavigate('payment-advance', { project_id: projectId as string, project_stage: 'agreement-accepted' })
  }

  if (!projectId || !agreement) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <HIcon size={36} />
        <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Agreement not found.</p>
        <button type="button" onClick={() => onNavigate('project-agreement', projectId ? { project_id: projectId } : undefined)} className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0" style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
          View Agreement
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
      <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => onNavigate('project-agreement', { project_id: projectId })} className="text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>← Back to Agreement</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[640px] mx-auto flex flex-col gap-5">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Review & Accept</p>
            <h1 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your Project'}</h1>
          </div>

          <SectionCard title="Agreement Summary">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contractor" value={agreement.contractorName} />
              <Field label="Total Cost" value={formatBidAmount(agreement.totalCost)} />
              <Field label="Timeline" value={agreement.timeline} />
              <Field label="Status" value={accepted ? 'Accepted' : 'Pending your acceptance'} />
            </div>
          </SectionCard>

          <SectionCard title="Payment Schedule">
            <p className="text-[13px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>{agreement.paymentTerms}</p>
          </SectionCard>

          {!accepted ? (
            <div className="rounded-[16px] p-5 flex flex-col gap-4" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[var(--hz-primary)] cursor-pointer shrink-0"
                />
                <span className="text-[13px] text-[var(--hz-ink)] leading-[1.5]" style={{ fontFamily: FONT_BODY }}>
                  I have reviewed the scope, cost, timeline and payment terms above, and I accept this agreement.
                </span>
              </label>
              <button
                onClick={handleAccept}
                disabled={!acknowledged}
                className="h-[48px] rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 transition-all"
                style={{ backgroundColor: acknowledged ? 'var(--hz-primary)' : 'var(--hz-surface-muted)', color: acknowledged ? 'var(--hz-surface)' : 'var(--hz-ink-subtle)', fontFamily: FONT_BODY }}
              >
                Accept Agreement
              </button>
            </div>
          ) : (
            <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#DCFCE7' }}>
              <p className="text-[13.5px] font-semibold m-0" style={{ color: 'var(--hz-success)', fontFamily: FONT_HEAD }}>Agreement accepted ✓</p>
              <button
                onClick={handleContinue}
                className="h-[48px] rounded-[12px] text-white text-[13.5px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
                style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
              >
                Continue to Payment →
              </button>
            </div>
          )}
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
