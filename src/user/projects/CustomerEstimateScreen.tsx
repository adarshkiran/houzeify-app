// ─── Customer shared estimate view — S27 ───────────────────────────────────
// Logged-in linked homeowner only. Shows the pinned shared version without
// internal rate provenance. No acceptance / payment in S27.

import { useCallback, useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import {
  describeEstimateError,
  formatEstimateInr,
  getCustomerSharedEstimate,
  type CustomerEstimate,
} from '@/data/projectEstimatesApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'

export default function CustomerEstimateScreen({
  projectId,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const [estimate, setEstimate] = useState<CustomerEstimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      setError('Missing project context.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      setEstimate(await getCustomerSharedEstimate(projectId))
    } catch (err) {
      setEstimate(null)
      setError(describeEstimateError(err))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <Sidebar active="estimate" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
              Estimate
            </p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
              Shared estimate
            </h1>

            {loading && (
              <p className="mt-4 text-[14px] text-[var(--hz-ink-muted)]" role="status" style={{ fontFamily: FONT_BODY }}>
                Loading estimate…
              </p>
            )}
            {!loading && error && (
              <div className="mt-4 rounded-[12px] px-4 py-3 max-w-xl" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  No estimate has been shared for this project yet, or you do not have access.
                </p>
                <button type="button" className={`min-h-11 mt-3 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }} onClick={() => void load()}>
                  Try again
                </button>
              </div>
            )}
            {!loading && estimate && (
              <div className="mt-6 max-w-3xl space-y-4">
                <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>{estimate.organizationName}</p>
                  <h2 className="text-[18px] font-semibold m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{estimate.name}</h2>
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                    {estimate.projectName}
                    {estimate.location ? ` · ${estimate.location}` : ''}
                  </p>
                  <p className="text-[28px] font-semibold m-0 mt-4" style={{ fontFamily: FONT_HEAD }}>
                    {formatEstimateInr(estimate.grandTotal)}
                  </p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                    Version {estimate.versionNumber} · Prepared {new Date(estimate.preparedAt).toLocaleDateString()}
                  </p>
                </section>

                <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                  <h3 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Summary</h3>
                  <dl className="mt-3 space-y-2 m-0 text-[13.5px]" style={{ fontFamily: FONT_BODY }}>
                    <div className="flex justify-between"><dt className="text-[var(--hz-ink-muted)] m-0">Materials</dt><dd className="m-0 font-semibold">{formatEstimateInr(estimate.materialTotal)}</dd></div>
                    <div className="flex justify-between"><dt className="text-[var(--hz-ink-muted)] m-0">Labour</dt><dd className="m-0 font-semibold">{formatEstimateInr(estimate.labourTotal)}</dd></div>
                    <div className="flex justify-between"><dt className="text-[var(--hz-ink-muted)] m-0">Other</dt><dd className="m-0 font-semibold">{formatEstimateInr(estimate.otherTotal)}</dd></div>
                    {estimate.costPerSqft != null && (
                      <div className="flex justify-between"><dt className="text-[var(--hz-ink-muted)] m-0">₹ / sq.ft</dt><dd className="m-0 font-semibold">{formatEstimateInr(estimate.costPerSqft)}</dd></div>
                    )}
                  </dl>
                </section>

                <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                  <h3 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Line items</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-[13px]" style={{ fontFamily: FONT_BODY }}>
                      <thead>
                        <tr className="text-[var(--hz-ink-muted)]">
                          <th className="py-2 pr-2 font-semibold">Item</th>
                          <th className="py-2 pr-2 font-semibold">Qty</th>
                          <th className="py-2 pr-2 font-semibold">Rate</th>
                          <th className="py-2 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimate.items.map(item => (
                          <tr key={item.id} className="border-t border-[var(--hz-border)]">
                            <td className="py-2 pr-2">
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-[11.5px] text-[var(--hz-ink-muted)] capitalize">{item.category || ''}</div>
                            </td>
                            <td className="py-2 pr-2">{item.quantity ?? '—'} {item.unit || ''}</td>
                            <td className="py-2 pr-2">{formatEstimateInr(item.rate)}</td>
                            <td className="py-2">{formatEstimateInr(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 max-w-2xl" style={{ fontFamily: FONT_BODY }}>{estimate.disclaimer}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
