// ─── Estimate Dashboard — Post-S27 Slice 1 ─────────────────────────────────
// API-backed summary, category views, Final / Lock. No BOQ create.

import { useCallback, useEffect, useMemo, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import EstimationSubNav from '@/shared/components/EstimationSubNav'
import { ESTIMATE_ROUTES } from '@/data/estimationFoundationShell'
import { ESTIMATION_ADVISOR_ROUTE } from '@/data/estimationAdvisorShell'
import {
  createEstimateVersion,
  describeEstimateError,
  ESTIMATE_STATUS_LABELS,
  finalizeProjectEstimate,
  formatEstimateInr,
  formatPaiseAsInr,
  getProjectEstimate,
  lockProjectEstimate,
  type EstimateItem,
  type ProjectEstimate,
} from '@/data/projectEstimatesApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'

type Tab = 'overview' | 'materials' | 'labour' | 'other'

function itemsByCategory(items: EstimateItem[] | undefined, category: string): EstimateItem[] {
  return (items || []).filter(i => (i.category || '').toLowerCase() === category)
}

export default function EstimateDashboardScreen({
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
  const [tab, setTab] = useState<Tab>('overview')

  const seed = useMemo(() => {
    if (!projectId || !estimateId) return undefined
    return {
      project_id: projectId,
      estimate_id: estimateId,
      ...(projectName ? { project_name: projectName } : {}),
      ...(organizationId ? { organization_id: organizationId } : {}),
    }
  }, [projectId, estimateId, projectName, organizationId])

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

  const locked = estimate?.status === 'locked'
  const summary = estimate?.summary
  const missing =
    (summary?.missingQuantityCount || 0) + (summary?.missingRateCount || 0)

  async function runAction(fn: () => Promise<ProjectEstimate>) {
    if (!projectId || !estimateId || busy) return
    setBusy(true)
    setActionError(null)
    try {
      setEstimate(await fn())
    } catch (err) {
      setActionError(describeEstimateError(err))
    } finally {
      setBusy(false)
    }
  }

  function ItemTable({ items }: { items: EstimateItem[] }) {
    if (items.length === 0) {
      return (
        <p className="text-[14px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
          No items in this category.
        </p>
      )
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]" style={{ fontFamily: FONT_BODY }}>
          <thead>
            <tr className="text-[var(--hz-ink-muted)] border-b border-[var(--hz-border)]">
              <th className="py-2 pr-3 font-semibold">Item</th>
              <th className="py-2 pr-3 font-semibold">Qty</th>
              <th className="py-2 pr-3 font-semibold">Unit</th>
              <th className="py-2 pr-3 font-semibold">Rate</th>
              <th className="py-2 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-[var(--hz-border)]">
                <td className="py-2.5 pr-3 text-[var(--hz-ink)]">
                  {item.name}
                  {item.needsRate ? (
                    <span className="block text-[11px] text-[#B45309]">Needs rate</span>
                  ) : null}
                </td>
                <td className="py-2.5 pr-3">{item.quantity ?? '—'}</td>
                <td className="py-2.5 pr-3">{item.unit ?? '—'}</td>
                <td className="py-2.5 pr-3">{formatEstimateInr(item.rate)}</td>
                <td className="py-2.5">{formatEstimateInr(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <PartnerNavRail active="estimation" organizationId={organizationId} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <p
              className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5"
              style={{ fontFamily: FONT_MONO }}
            >
              Estimate Dashboard
            </p>
            <h1
              className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0"
              style={{ fontFamily: FONT_HEAD }}
            >
              {estimate?.name || 'Estimate'}
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
              {(estimate?.projectName || projectName || 'Project') +
                (estimate?.location ? ` · ${estimate.location}` : '')}
            </p>

            <EstimationSubNav
              active="estimates"
              projectId={projectId}
              projectName={projectName || estimate?.projectName}
              organizationId={organizationId}
              estimateId={estimateId}
              onNavigate={onNavigate}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={`min-h-10 px-4 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                onClick={() => seed && onNavigate(ESTIMATE_ROUTES.list, seed)}
              >
                All estimates
              </button>
              <button
                type="button"
                className={`min-h-10 px-4 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                onClick={() => seed && onNavigate(ESTIMATE_ROUTES.workspace, seed)}
              >
                {locked ? 'View builder' : 'Open builder'}
              </button>
              <button
                type="button"
                className={`min-h-10 px-4 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                onClick={() => seed && onNavigate(ESTIMATION_ADVISOR_ROUTE, seed)}
              >
                Advisor
              </button>
            </div>

            {loading ? (
              <p className="mt-6 text-[14px] text-[var(--hz-ink-muted)]" role="status" style={{ fontFamily: FONT_BODY }}>
                Loading estimate…
              </p>
            ) : error ? (
              <p className="mt-6 text-[14px] text-[#B91C1C]" style={{ fontFamily: FONT_BODY }}>
                {error}
              </p>
            ) : estimate && summary ? (
              <>
                <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
                    <p className="text-[12px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                      Estimated total
                    </p>
                    <p className="text-[22px] font-semibold m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                      {formatPaiseAsInr(summary.grandTotalPaise)}
                    </p>
                  </div>
                  <div className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
                    <p className="text-[12px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                      Cost / sq.ft
                    </p>
                    <p className="text-[22px] font-semibold m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                      {formatPaiseAsInr(summary.costPerSqftPaise)}
                    </p>
                  </div>
                  <div className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
                    <p className="text-[12px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                      Status
                    </p>
                    <p className="text-[18px] font-semibold m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                      {ESTIMATE_STATUS_LABELS[estimate.status] || estimate.status}
                    </p>
                    {estimate.lockedAt ? (
                      <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                        Locked {new Date(estimate.lockedAt).toLocaleString('en-IN')}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
                    <p className="text-[12px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                      Data quality
                    </p>
                    <p className="text-[18px] font-semibold m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>
                      {missing === 0 ? 'Complete' : `${missing} items need attention`}
                    </p>
                  </div>
                </section>

                <section className="mt-4 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
                  <h2 className="text-[15px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>
                    Cost breakdown
                  </h2>
                  <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 m-0">
                    <div>
                      <dt className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                        Materials
                      </dt>
                      <dd className="text-[16px] font-semibold m-0 mt-0.5" style={{ fontFamily: FONT_HEAD }}>
                        {formatPaiseAsInr(summary.materialTotalPaise)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                        Labour
                      </dt>
                      <dd className="text-[16px] font-semibold m-0 mt-0.5" style={{ fontFamily: FONT_HEAD }}>
                        {formatPaiseAsInr(summary.labourTotalPaise)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                        Other
                      </dt>
                      <dd className="text-[16px] font-semibold m-0 mt-0.5" style={{ fontFamily: FONT_HEAD }}>
                        {formatPaiseAsInr(summary.otherTotalPaise)}
                      </dd>
                    </div>
                  </dl>
                </section>

                <div className="mt-4 flex flex-wrap gap-2" role="tablist">
                  {(
                    [
                      ['overview', 'Overview'],
                      ['materials', 'Material estimate'],
                      ['labour', 'Labour estimate'],
                      ['other', 'Other'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={tab === id}
                      className={`min-h-10 px-4 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                      style={{
                        backgroundColor: tab === id ? 'var(--hz-primary)' : 'var(--hz-surface-muted)',
                        color: tab === id ? 'white' : 'var(--hz-ink)',
                        fontFamily: FONT_BODY,
                      }}
                      onClick={() => setTab(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <section className="mt-3 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
                  {tab === 'overview' ? (
                    <p className="text-[14px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                      Version {estimate.currentVersionNumber ?? '—'} · {summary.itemCount} items. Use the tabs for
                      category detail, or open the builder to edit quantities and rates
                      {locked ? ' after creating a new version' : ''}.
                    </p>
                  ) : null}
                  {tab === 'materials' ? <ItemTable items={itemsByCategory(estimate.items, 'material')} /> : null}
                  {tab === 'labour' ? <ItemTable items={itemsByCategory(estimate.items, 'labour')} /> : null}
                  {tab === 'other' ? <ItemTable items={itemsByCategory(estimate.items, 'other')} /> : null}
                </section>

                {actionError ? (
                  <p className="mt-3 text-[13px] text-[#B91C1C]" style={{ fontFamily: FONT_BODY }}>
                    {actionError}
                  </p>
                ) : null}

                <section className="mt-4 flex flex-wrap gap-2">
                  {!locked && estimate.status !== 'final' ? (
                    <button
                      type="button"
                      disabled={busy || summary.itemCount === 0}
                      className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer disabled:opacity-50 ${FOCUS}`}
                      style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                      onClick={() =>
                        void runAction(() => finalizeProjectEstimate(projectId!, estimateId!))
                      }
                    >
                      Mark final
                    </button>
                  ) : null}
                  {!locked ? (
                    <button
                      type="button"
                      disabled={busy || !summary.readyToShare}
                      className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer disabled:opacity-50 ${FOCUS}`}
                      style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                      onClick={() => void runAction(() => lockProjectEstimate(projectId!, estimateId!))}
                    >
                      Lock estimate
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                      style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                      onClick={() =>
                        void runAction(() => createEstimateVersion(projectId!, estimateId!))
                      }
                    >
                      Create new version
                    </button>
                  )}
                  {!locked ? (
                    <button
                      type="button"
                      disabled={busy}
                      className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                      style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                      onClick={() =>
                        void runAction(() => createEstimateVersion(projectId!, estimateId!))
                      }
                    >
                      Revise (new version)
                    </button>
                  ) : null}
                </section>

                {locked ? (
                  <p className="mt-3 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                    Locked estimates cannot be edited. Create a new version to revise. BOQ generation is the next
                    product phase.
                  </p>
                ) : !summary.readyToShare ? (
                  <p className="mt-3 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                    Lock requires all quantities and rates. Open the builder to resolve missing rates.
                  </p>
                ) : null}
              </>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
}
