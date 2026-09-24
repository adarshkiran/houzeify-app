// ─── Estimate workspace overview — estimation foundation ───────────────────
// Hozie entry is a seam only — no LLM calls.

import { useCallback, useEffect, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import {
  describeEstimateError,
  ESTIMATE_PRICING_METHOD_LABELS,
  ESTIMATE_STATUS_LABELS,
  getProjectEstimate,
  type ProjectEstimate,
} from '@/data/projectEstimatesApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'

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

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <PartnerNavRail active="projects" organizationId={organizationId} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ProjectSubNav
            active="estimates"
            projectId={projectId}
            projectName={estimate?.projectName || projectName}
            onNavigate={onNavigate}
            action={
              <button
                type="button"
                className={`min-h-11 px-3 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                onClick={() => onNavigate('project-estimates', seed)}
              >
                All estimates
              </button>
            }
          />
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
                      Estimate
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
                        Version {estimate.currentVersionNumber ?? estimate.currentVersion?.versionNumber ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Estimate sections">
                  {[
                    { id: 'overview', label: 'Overview', active: true },
                    { id: 'advisor', label: 'AI Advisor', comingSoon: true },
                    { id: 'items', label: 'Items', comingSoon: true },
                    { id: 'versions', label: 'Versions', comingSoon: true },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={tab.active}
                      disabled={tab.comingSoon}
                      className={`min-h-11 px-3.5 rounded-full text-[12.5px] font-semibold border-0 shrink-0 ${FOCUS} ${tab.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{
                        fontFamily: FONT_BODY,
                        backgroundColor: tab.active ? 'var(--hz-primary)' : 'var(--hz-border-strong)',
                        color: tab.active ? 'white' : 'var(--hz-ink-muted)',
                      }}
                      title={tab.comingSoon ? 'Coming soon' : undefined}
                    >
                      {tab.label}
                      {tab.comingSoon ? ' · Soon' : ''}
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                    <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Estimate Summary</h2>
                    <dl className="mt-4 space-y-3 m-0">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Estimated Total</dt>
                        <dd className="text-[14px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_BODY }}>
                          {estimate.totalAmount == null ? 'Not calculated yet' : `${estimate.currency} ${estimate.totalAmount}`}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>₹/sq.ft</dt>
                        <dd className="text-[14px] text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_BODY }}>—</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Pricing Method</dt>
                        <dd className="text-[14px] text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_BODY }}>
                          {ESTIMATE_PRICING_METHOD_LABELS[estimate.pricingMethod]}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Project Area</dt>
                        <dd className="text-[14px] text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_BODY }}>
                          {estimate.areaSqft != null ? `${estimate.areaSqft} sq.ft` : '—'}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                    <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Next Steps</h2>
                    <ol className="mt-3 m-0 pl-5 text-[14px] text-[var(--hz-ink-muted)] space-y-2" style={{ fontFamily: FONT_BODY }}>
                      <li>Define project requirements</li>
                      <li>Add estimate items</li>
                      <li>Review pricing</li>
                      <li>Generate estimate</li>
                    </ol>
                  </section>

                  <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 lg:col-span-2">
                    <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                      Build estimate with Hozie
                    </h2>
                    <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-2 max-w-2xl" style={{ fontFamily: FONT_BODY }}>
                      Answer a few questions and Hozie will help structure the estimate. The AI Estimation Advisor is not connected yet — no model is called from this screen.
                    </p>
                    <button
                      type="button"
                      disabled
                      className={`min-h-11 mt-4 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 opacity-60 cursor-not-allowed ${FOCUS}`}
                      style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                      title="Coming soon"
                    >
                      Coming soon
                    </button>
                  </section>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
