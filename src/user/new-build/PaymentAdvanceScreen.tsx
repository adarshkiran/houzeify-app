// ─── Payment / Advance — Flow 04 (New Build) ────────────────────────────────
// Reached from Review & Accept Agreement. No real payment gateway is
// integrated anywhere in this codebase (repo-wide search before writing
// payments.ts found zero existing Payment model) and CheckoutScreen.tsx's
// own payment step is Home Services-specific with nothing reusable to
// extend — so this uses the same simulated-processing convention already
// established by FinalEstimateScreen's own lock-confirm (setTimeout, no
// real gateway), landing on a real, queryable Payment record via
// payments.ts rather than a fake success message with nothing behind it.
// Advance is 20% of the agreement's total cost — a plain, disclosed
// percentage, not a hidden number.

import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { getAgreementForProject } from '@/data/agreements'
import { formatBidAmount } from '@/data/bids'
import { createPayment, completePayment, getPaymentsForProject, type Payment } from '@/data/payments'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const ADVANCE_PERCENT = 20

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{value}</span>
    </div>
  )
}

type Stage = 'idle' | 'processing' | 'success'

export default function PaymentAdvanceScreen({
  onNavigate,
  projectId,
  projectName,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  projectId?: string
  projectName?: string
}) {
  const agreement = projectId ? getAgreementForProject(projectId) : undefined
  const [stage, setStage] = useState<Stage>('idle')
  const [reference, setReference] = useState<string | null>(null)

  const advanceAmount = agreement ? Math.round((agreement.totalCost * ADVANCE_PERCENT) / 100) : 0

  // Real, project-specific payment history (payments.ts's own
  // getPaymentsForProject) — checked on every visit, not just right after
  // paying, so returning to this screen later (Projects → workspace →
  // Payments) shows what was actually paid instead of asking to pay the
  // advance a second time.
  const existingPayments = projectId ? getPaymentsForProject(projectId) : []
  const completedPayments = existingPayments.filter((p: Payment) => p.status === 'completed')
  const hasPaidAdvance = completedPayments.length > 0
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = agreement ? Math.max(0, agreement.totalCost - totalPaid) : 0

  function handlePay() {
    if (!agreement || !projectId) return
    setStage('processing')
    const payment = createPayment({ projectId, agreementId: agreement.id, amount: advanceAmount, method: 'UPI (test mode)' })
    setTimeout(() => {
      const completed = completePayment(payment.id)
      setReference(completed?.referenceId ?? payment.referenceId)
      setStage('success')
    }, 900)
  }

  function handleContinue() {
    onNavigate('project-workspace', { project_id: projectId as string, project_stage: 'project-ready' })
  }

  if (!projectId || !agreement) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <HIcon size={36} />
        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No accepted agreement found.</p>
      </div>
    )
  }

  // Already paid — a returning visit (e.g. from the Project Workspace's
  // "Payments" card) shows real history instead of the checkout form, so
  // the advance can never be silently charged twice.
  if (hasPaidAdvance && stage === 'idle') {
    return (
      <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FAF9F7' }}>
        <div className="flex flex-1 min-h-0 relative z-10">
          <Sidebar active="build" onNavigate={onNavigate} />
          <div className="flex flex-col flex-1 min-h-0">
        <header className="shrink-0 bg-white h-16 flex items-center justify-between px-4 sm:px-6" style={{ borderBottom: '1px solid #E3DDD7' }}>
          <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Payments</span>
          <button type="button" onClick={handleContinue} className="text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>Back</button>
        </header>
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
          <div className="max-w-[520px] mx-auto flex flex-col gap-5">
            <div>
              <span className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Payment Summary</span>
              <h1 className="text-[22px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your Project'}</h1>
            </div>

            <div className="rounded-[16px] bg-white overflow-hidden" style={{ border: '1px solid #E3DDD7' }}>
              <InfoRow label="Total Project Amount" value={formatBidAmount(agreement.totalCost)} />
              <div style={{ borderTop: '1px solid #F4F0EC' }}><InfoRow label="Amount Paid" value={formatBidAmount(totalPaid)} /></div>
              <div style={{ borderTop: '1px solid #F4F0EC' }}>
                <InfoRow
                  label="Payment Status"
                  value={
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: remaining === 0 ? '#DCFCE7' : '#FEF3C7', color: remaining === 0 ? '#16A34A' : '#D97706', fontFamily: FONT_MONO }}>
                    {(remaining === 0 ? 'PAID IN FULL' : 'ADVANCE PAID').toUpperCase()}
                  </span>
                  }
                />
              </div>
              <div style={{ borderTop: '1px solid #F4F0EC' }}><InfoRow label="Amount Remaining" value={formatBidAmount(remaining)} /></div>
            </div>

            <div className="rounded-[16px] bg-white overflow-hidden" style={{ border: '1px solid #E3DDD7' }}>
              <div className="px-5 pt-4 pb-1">
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Payment History</span>
              </div>
              {completedPayments.map((p: Payment, i: number) => (
                <div key={p.id} style={i > 0 ? { borderTop: '1px solid #F4F0EC' } : undefined}>
                  <InfoRow label={`${formatDate(p.paidAt ?? p.createdAt)} · ${p.method}`} value={formatBidAmount(p.amount)} />
                </div>
              ))}
            </div>

            {remaining > 0 && (
              <p className="text-[12px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>
                The remaining balance follows the payment schedule in your accepted agreement.
              </p>
            )}

            <button
              onClick={handleContinue}
              className="h-[52px] rounded-[12px] text-white text-[14px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
              style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
            >
              Go to Project Workspace →
            </button>
          </div>
        </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FAF9F7' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="build" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
      <header className="shrink-0 bg-white h-16 flex items-center px-4 sm:px-6" style={{ borderBottom: '1px solid #E3DDD7' }}>
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Payment / Advance</span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[520px] mx-auto flex flex-col gap-5">
          {stage !== 'success' ? (
            <>
              <div>
                <span className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Advance Payment</span>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your Project'}</h1>
              </div>

              <div className="rounded-[16px] bg-white overflow-hidden" style={{ border: '1px solid #E3DDD7' }}>
                <InfoRow label="Total Project Cost" value={formatBidAmount(agreement.totalCost)} />
                <div style={{ borderTop: '1px solid #F4F0EC' }}><InfoRow label={`Advance (${ADVANCE_PERCENT}%)`} value={formatBidAmount(advanceAmount)} /></div>
                <div style={{ borderTop: '1px solid #F4F0EC' }}><InfoRow label="Payment Method" value="UPI (test mode)" /></div>
              </div>

              <p className="text-[12px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>
                This is a test/mock payment — no real transaction is processed. The remaining balance follows the payment schedule in your accepted agreement.
              </p>

              <button
                onClick={handlePay}
                disabled={stage === 'processing'}
                className="h-[52px] rounded-[12px] text-white text-[14px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
              >
                {stage === 'processing' ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Processing…
                  </>
                ) : `Pay ${formatBidAmount(advanceAmount)} →`}
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center gap-3 pt-4">
                <span className="w-[56px] h-[56px] rounded-full flex items-center justify-center" style={{ backgroundColor: '#722ED1' }}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M6 13.5L11 18.5L20 8.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Payment successful</h1>
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Your advance payment has been recorded.</p>
              </div>
              <div className="rounded-[16px] bg-white overflow-hidden" style={{ border: '1px solid #E3DDD7' }}>
                <InfoRow label="Amount Paid" value={formatBidAmount(advanceAmount)} />
                <div style={{ borderTop: '1px solid #F4F0EC' }}><InfoRow label="Reference ID" value={reference ?? '—'} /></div>
              </div>
              <button
                onClick={handleContinue}
                className="h-[52px] rounded-[12px] text-white text-[14px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all"
                style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
              >
                Go to Project Workspace →
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
