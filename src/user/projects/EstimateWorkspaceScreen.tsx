// ─── Estimate Builder workspace — S27 ──────────────────────────────────────
// Extends the S22 workspace into editable items, S26 rate resolve, versions,
// and customer share. Does not implement BOQ / lock / acceptance.

import { useCallback, useEffect, useId, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import EstimationSubNav from '@/shared/components/EstimationSubNav'
import {
  ESTIMATION_ADVISOR_ROUTE,
} from '@/data/estimationAdvisorShell'
import {
  createEstimateItem,
  createEstimateVersion,
  deleteEstimateItem,
  describeEstimateError,
  ESTIMATE_PRICING_METHOD_LABELS,
  ESTIMATE_STATUS_LABELS,
  formatEstimateInr,
  formatPaiseAsInr,
  getEstimateCustomerPreview,
  getProjectEstimate,
  patchEstimateItem,
  resolveEstimateItemRate,
  shareProjectEstimate,
  type CustomerEstimate,
  type EstimateItem,
  type ProjectEstimate,
} from '@/data/projectEstimatesApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'
const inputClass = `w-full min-h-10 h-10 px-3 rounded-[10px] text-[13px] outline-none ${FOCUS}`
const inputStyle = {
  border: '1px solid var(--hz-border)',
  fontFamily: FONT_BODY,
  backgroundColor: 'var(--hz-surface)',
}

function rateSourceLabel(source: string | null): string {
  if (!source) return '—'
  return source.replace(/_/g, ' ')
}

export default function EstimateWorkspaceScreen({
  projectId,
  projectName,
  organizationId,
  estimateId,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  organizationId?: string
  estimateId?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const [estimate, setEstimate] = useState<ProjectEstimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<CustomerEstimate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [addName, setAddName] = useState('')
  const [addCategory, setAddCategory] = useState<'material' | 'labour' | 'other'>('material')
  const [addQty, setAddQty] = useState('')
  const [addUnit, setAddUnit] = useState('bags')
  const [addRate, setAddRate] = useState('')

  const nameId = useId()
  const qtyId = useId()

  const load = useCallback(async () => {
    if (!projectId || !estimateId) {
      setLoading(false)
      setError('Missing estimate context.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      setEstimate(await getProjectEstimate(projectId, estimateId))
    } catch (err) {
      setEstimate(null)
      setError(describeEstimateError(err))
    } finally {
      setLoading(false)
    }
  }, [projectId, estimateId])

  useEffect(() => {
    void load()
  }, [load])

  const seed = projectId
    ? {
        project_id: projectId,
        ...(projectName ? { project_name: projectName } : {}),
        ...(organizationId ? { organization_id: organizationId } : {}),
        ...(estimateId ? { estimate_id: estimateId } : {}),
      }
    : undefined

  async function runAction(fn: () => Promise<void>) {
    setBusy(true)
    setActionError(null)
    try {
      await fn()
      await load()
    } catch (err) {
      setActionError(describeEstimateError(err))
    } finally {
      setBusy(false)
    }
  }

  async function onAddItem() {
    if (!projectId || !estimateId) return
    const quantity = addQty.trim() ? Number(addQty) : null
    const rate = addRate.trim() ? Number(addRate) : null
    await runAction(async () => {
      await createEstimateItem(projectId, estimateId, {
        name: addName,
        category: addCategory,
        quantity,
        unit: addUnit || null,
        rate,
      })
      setAddName('')
      setAddQty('')
      setAddRate('')
    })
  }

  async function onQtyBlur(item: EstimateItem, value: string) {
    if (!projectId || !estimateId) return
    const quantity = value.trim() === '' ? null : Number(value)
    if (quantity != null && (!Number.isFinite(quantity) || quantity <= 0)) return
    if (quantity === item.quantity) return
    await runAction(async () => {
      await patchEstimateItem(projectId, estimateId, item.id, { quantity })
    })
  }

  async function onRateBlur(item: EstimateItem, value: string) {
    if (!projectId || !estimateId) return
    const rate = value.trim() === '' ? null : Number(value)
    if (rate != null && (!Number.isFinite(rate) || rate < 0)) return
    if (rate === item.rate) return
    await runAction(async () => {
      await patchEstimateItem(projectId, estimateId, item.id, { rate })
    })
  }

  const summary = estimate?.summary
  const incomplete =
    summary != null
      ? summary.missingQuantityCount + summary.missingRateCount
      : 0

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <PartnerNavRail active="estimation" organizationId={organizationId} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            {loading && (
              <p className="text-[14px] text-[var(--hz-ink-muted)]" role="status" style={{ fontFamily: FONT_BODY }}>
                Loading estimate…
              </p>
            )}
            {!loading && error && (
              <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
                <button type="button" onClick={() => void load()} className={`min-h-11 mt-3 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
                  Try again
                </button>
              </div>
            )}
            {!loading && estimate && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
                      Estimate Builder
                    </p>
                    <h1 className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                      {estimate.name}
                    </h1>
                    <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                      {estimate.projectName}
                      {estimate.customerLabel ? ` · ${estimate.customerLabel}` : ''}
                      {estimate.location ? ` · ${estimate.location}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex min-h-8 items-center px-2.5 rounded-full text-[12px] font-semibold" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
                        {ESTIMATE_STATUS_LABELS[estimate.status]}
                      </span>
                      <span className="inline-flex min-h-8 items-center px-2.5 rounded-full text-[12px] font-semibold" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}>
                        Version {estimate.currentVersionNumber ?? '—'}
                      </span>
                      {estimate.sharedVersionNumber != null && (
                        <span className="inline-flex min-h-8 items-center px-2.5 rounded-full text-[12px] font-semibold" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}>
                          Shared v{estimate.sharedVersionNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={`min-h-11 px-3 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`} style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }} onClick={() => onNavigate('project-estimates', seed)}>
                      All estimates
                    </button>
                    <button type="button" className={`min-h-11 px-3 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`} style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }} onClick={() => onNavigate(ESTIMATION_ADVISOR_ROUTE, seed)}>
                      Advisor
                    </button>
                  </div>
                </div>

                <EstimationSubNav
                  active="estimates"
                  projectId={projectId}
                  projectName={estimate.projectName || projectName}
                  organizationId={organizationId}
                  estimateId={estimateId}
                  onNavigate={onNavigate}
                />

                {actionError && (
                  <p className="mt-4 text-[13px] text-[var(--hz-danger,#b42318)]" role="alert" style={{ fontFamily: FONT_BODY }}>
                    {actionError}
                  </p>
                )}

                {incomplete > 0 && (
                  <p className="mt-4 text-[13.5px] text-[var(--hz-ink-muted)]" role="status" style={{ fontFamily: FONT_BODY }}>
                    {incomplete} item{incomplete === 1 ? '' : 's'} need pricing or quantities before this estimate can be shared.
                  </p>
                )}

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 xl:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                        Estimate items
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          className={`min-h-10 px-3 rounded-[10px] text-[12.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                          style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY, opacity: busy ? 0.7 : 1 }}
                          onClick={() => void runAction(async () => {
                            if (!projectId || !estimateId) return
                            setEstimate(await createEstimateVersion(projectId, estimateId))
                          })}
                        >
                          Create new version
                        </button>
                        <button
                          type="button"
                          disabled={busy || !summary?.readyToShare}
                          className={`min-h-10 px-3 rounded-[10px] text-[12.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                          style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY, opacity: busy || !summary?.readyToShare ? 0.6 : 1 }}
                          onClick={() => void runAction(async () => {
                            if (!projectId || !estimateId) return
                            setEstimate(await shareProjectEstimate(projectId, estimateId))
                          })}
                        >
                          Share with customer
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          className={`min-h-10 px-3 rounded-[10px] text-[12.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                          style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                          onClick={() => void runAction(async () => {
                            if (!projectId || !estimateId) return
                            const p = await getEstimateCustomerPreview(projectId, estimateId)
                            setPreview(p)
                            setShowPreview(true)
                          })}
                        >
                          Customer preview
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-left text-[13px]" style={{ fontFamily: FONT_BODY }}>
                        <thead>
                          <tr className="text-[var(--hz-ink-muted)]">
                            <th className="py-2 pr-2 font-semibold">Item</th>
                            <th className="py-2 pr-2 font-semibold">Qty</th>
                            <th className="py-2 pr-2 font-semibold">Unit</th>
                            <th className="py-2 pr-2 font-semibold">Rate</th>
                            <th className="py-2 pr-2 font-semibold">Amount</th>
                            <th className="py-2 pr-2 font-semibold">Source</th>
                            <th className="py-2 font-semibold"> </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(estimate.items ?? []).map(item => (
                            <tr key={item.id} className="border-t border-[var(--hz-border)] align-top">
                              <td className="py-2.5 pr-2">
                                <div className="font-semibold text-[var(--hz-ink)]">{item.name}</div>
                                <div className="text-[11.5px] text-[var(--hz-ink-muted)] capitalize">{item.category || 'other'}</div>
                                {item.needsRate && (
                                  <div className="text-[11.5px] text-[var(--hz-danger,#b42318)] mt-0.5">Rate unavailable</div>
                                )}
                              </td>
                              <td className="py-2.5 pr-2 min-w-[88px]">
                                <input
                                  className={inputClass}
                                  style={inputStyle}
                                  defaultValue={item.quantity ?? ''}
                                  key={`${item.id}-q-${item.updatedAt}`}
                                  onBlur={e => void onQtyBlur(item, e.target.value)}
                                  aria-label={`${item.name} quantity`}
                                />
                              </td>
                              <td className="py-2.5 pr-2">{item.unit || '—'}</td>
                              <td className="py-2.5 pr-2 min-w-[100px]">
                                <input
                                  className={inputClass}
                                  style={inputStyle}
                                  defaultValue={item.rate ?? ''}
                                  key={`${item.id}-r-${item.updatedAt}`}
                                  onBlur={e => void onRateBlur(item, e.target.value)}
                                  aria-label={`${item.name} rate`}
                                />
                              </td>
                              <td className="py-2.5 pr-2 whitespace-nowrap">{formatEstimateInr(item.amount)}</td>
                              <td className="py-2.5 pr-2 text-[12px] text-[var(--hz-ink-muted)]">
                                {rateSourceLabel(item.rateSource)}
                                {item.effectiveDate ? (
                                  <div className="text-[11px]">Eff. {item.effectiveDate}</div>
                                ) : null}
                              </td>
                              <td className="py-2.5">
                                <div className="flex flex-col gap-1">
                                  {item.needsRate && (
                                    <button
                                      type="button"
                                      disabled={busy}
                                      className={`min-h-9 px-2 rounded-[8px] text-[11.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                                      style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                                      onClick={() => void runAction(async () => {
                                        if (!projectId || !estimateId) return
                                        await resolveEstimateItemRate(projectId, estimateId, item.id)
                                      })}
                                    >
                                      Resolve rate
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    disabled={busy}
                                    className={`min-h-9 px-2 rounded-[8px] text-[11.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                                    style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}
                                    onClick={() => void runAction(async () => {
                                      if (!projectId || !estimateId) return
                                      await deleteEstimateItem(projectId, estimateId, item.id)
                                    })}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(estimate.items ?? []).length === 0 && (
                            <tr>
                              <td colSpan={7} className="py-6 text-[var(--hz-ink-muted)]">
                                No items yet. Add materials or labour below. Quantities can come from the Material Calculator; rates from Price Intelligence.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 rounded-[12px] border border-[var(--hz-border)] bg-[var(--hz-surface-muted)] p-4">
                      <h3 className="text-[13.5px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Add item</h3>
                      <div className="mt-3 grid sm:grid-cols-5 gap-2">
                        <div className="sm:col-span-2">
                          <label htmlFor={nameId} className="block text-[12px] font-semibold mb-1">Name</label>
                          <input id={nameId} className={inputClass} style={inputStyle} value={addName} onChange={e => setAddName(e.target.value)} placeholder="Cement" />
                        </div>
                        <div>
                          <label className="block text-[12px] font-semibold mb-1">Category</label>
                          <select className={inputClass} style={inputStyle} value={addCategory} onChange={e => setAddCategory(e.target.value as typeof addCategory)}>
                            <option value="material">Material</option>
                            <option value="labour">Labour</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor={qtyId} className="block text-[12px] font-semibold mb-1">Qty</label>
                          <input id={qtyId} className={inputClass} style={inputStyle} value={addQty} onChange={e => setAddQty(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[12px] font-semibold mb-1">Unit</label>
                          <input className={inputClass} style={inputStyle} value={addUnit} onChange={e => setAddUnit(e.target.value)} />
                        </div>
                      </div>
                      <div className="mt-2 grid sm:grid-cols-5 gap-2">
                        <div>
                          <label className="block text-[12px] font-semibold mb-1">Rate ₹ (optional)</label>
                          <input className={inputClass} style={inputStyle} value={addRate} onChange={e => setAddRate(e.target.value)} placeholder="Leave blank to resolve" />
                        </div>
                        <div className="sm:col-span-4 flex items-end">
                          <button
                            type="button"
                            disabled={busy || !addName.trim()}
                            className={`min-h-10 px-4 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                            style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY, opacity: busy || !addName.trim() ? 0.6 : 1 }}
                            onClick={() => void onAddItem()}
                          >
                            Add to estimate
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="flex flex-col gap-4">
                    <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                      <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Summary</h2>
                      <dl className="mt-4 space-y-3 m-0">
                        <div className="flex justify-between gap-4">
                          <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0">Grand total</dt>
                          <dd className="text-[15px] font-semibold m-0">{formatPaiseAsInr(summary?.grandTotalPaise)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0">Materials</dt>
                          <dd className="text-[13px] m-0">{formatPaiseAsInr(summary?.materialTotalPaise ?? 0)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0">Labour</dt>
                          <dd className="text-[13px] m-0">{formatPaiseAsInr(summary?.labourTotalPaise ?? 0)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0">Other</dt>
                          <dd className="text-[13px] m-0">{formatPaiseAsInr(summary?.otherTotalPaise ?? 0)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0">₹ / sq.ft</dt>
                          <dd className="text-[13px] m-0">{formatPaiseAsInr(summary?.costPerSqftPaise)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0">Items</dt>
                          <dd className="text-[13px] m-0">{summary?.itemCount ?? 0}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0">Pricing method</dt>
                          <dd className="text-[13px] m-0">{ESTIMATE_PRICING_METHOD_LABELS[estimate.pricingMethod]}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0">Area</dt>
                          <dd className="text-[13px] m-0">{estimate.areaSqft != null ? `${estimate.areaSqft} sq.ft` : '—'}</dd>
                        </div>
                      </dl>
                    </section>

                    <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                      <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Versions</h2>
                      <ul className="mt-3 m-0 p-0 list-none space-y-2">
                        {(estimate.versions ?? []).map(v => (
                          <li key={v.id} className="rounded-[10px] border border-[var(--hz-border)] px-3 py-2 text-[13px]" style={{ backgroundColor: v.id === estimate.currentVersionId ? 'var(--hz-primary-soft)' : 'var(--hz-surface-muted)' }}>
                            <div className="font-semibold">Version {v.versionNumber}</div>
                            <div className="text-[12px] text-[var(--hz-ink-muted)]">
                              {ESTIMATE_STATUS_LABELS[v.status]} · {v.itemCount} items · {formatPaiseAsInr(v.totalAmountPaise)}
                            </div>
                            {v.id === estimate.sharedVersionId && (
                              <div className="text-[11.5px] text-[var(--hz-primary)] mt-0.5">Pinned for customer</div>
                            )}
                          </li>
                        ))}
                        {(estimate.versions ?? []).length === 0 && (
                          <li className="text-[13px] text-[var(--hz-ink-muted)]">Version list loads with builder detail.</li>
                        )}
                      </ul>
                    </section>
                  </div>
                </div>

                {showPreview && preview && (
                  <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-3xl" aria-label="Customer preview">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>Customer preview</h2>
                      <button type="button" className={`min-h-9 px-3 rounded-[8px] text-[12px] font-semibold border-0 cursor-pointer ${FOCUS}`} style={{ backgroundColor: 'var(--hz-surface-muted)' }} onClick={() => setShowPreview(false)}>
                        Close
                      </button>
                    </div>
                    <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-2">{preview.organizationName} · {preview.projectName}</p>
                    <p className="text-[22px] font-semibold m-0 mt-3" style={{ fontFamily: FONT_HEAD }}>{formatEstimateInr(preview.grandTotal)}</p>
                    <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-1">Version {preview.versionNumber} · {new Date(preview.preparedAt).toLocaleDateString()}</p>
                    <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-3">{preview.disclaimer}</p>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
