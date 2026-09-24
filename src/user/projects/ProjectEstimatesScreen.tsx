// ─── Project Estimates list — estimation foundation ────────────────────────

import { useCallback, useEffect, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import {
  describeEstimateError,
  ESTIMATE_PRICING_METHOD_LABELS,
  ESTIMATE_STATUS_LABELS,
  listProjectEstimates,
  type ProjectEstimate,
} from '@/data/projectEstimatesApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'
const PRIMARY_BTN = `min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 ${FOCUS}`

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

export default function ProjectEstimatesScreen({
  projectId,
  projectName,
  organizationId,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  organizationId?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const [estimates, setEstimates] = useState<ProjectEstimate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      setError('Missing project.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await listProjectEstimates(projectId)
      setEstimates(list)
    } catch (err) {
      setEstimates([])
      setError(describeEstimateError(err) || "We couldn't load estimates. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  const seed = projectId
    ? { project_id: projectId, ...(projectName ? { project_name: projectName } : {}), ...(organizationId ? { organization_id: organizationId } : {}) }
    : undefined

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <PartnerNavRail active="projects" organizationId={organizationId} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ProjectSubNav
            active="estimates"
            projectId={projectId}
            projectName={projectName}
            onNavigate={onNavigate}
            action={
              <button
                type="button"
                className={PRIMARY_BTN}
                style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                onClick={() => onNavigate('project-estimate-create', seed)}
              >
                Create Estimate
              </button>
            }
          />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
              Estimates
            </p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
              {projectName || 'Project'}
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1 max-w-xl" style={{ fontFamily: FONT_BODY }}>
              Create and manage construction estimates for this project. Totals appear after items are added.
            </p>

            {loading && (
              <p className="mt-8 text-[14px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }} role="status">
                Loading estimates…
              </p>
            )}

            {!loading && error && (
              <div className="mt-8 rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
                <button type="button" onClick={() => void load()} className={`${PRIMARY_BTN} mt-3`} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && estimates.length === 0 && (
              <div className="mt-10 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] px-6 py-10 text-center max-w-lg">
                <h2 className="text-[18px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                  No estimates yet
                </h2>
                <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  Create an estimate to start building project costs.
                </p>
                <button
                  type="button"
                  className={`${PRIMARY_BTN} mt-5`}
                  style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                  onClick={() => onNavigate('project-estimate-create', seed)}
                >
                  Create Estimate
                </button>
              </div>
            )}

            {!loading && !error && estimates.length > 0 && (
              <div className="mt-8 overflow-x-auto rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)]">
                <table className="w-full min-w-[720px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--hz-border)]">
                      {['Estimate', 'Customer', 'Status', 'Pricing', 'Total', 'Version', 'Updated', ''].map(h => (
                        <th key={h || 'action'} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {estimates.map(est => (
                      <tr key={est.id} className="border-b border-[var(--hz-border)] last:border-0">
                        <td className="px-4 py-3 text-[14px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{est.name}</td>
                        <td className="px-4 py-3 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{est.customerLabel || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex min-h-8 items-center px-2.5 rounded-full text-[12px] font-semibold" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_BODY }}>
                            {ESTIMATE_STATUS_LABELS[est.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                          {ESTIMATE_PRICING_METHOD_LABELS[est.pricingMethod]}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                          {est.totalAmount == null ? '—' : `${est.currency} ${est.totalAmount}`}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                          {est.currentVersionNumber != null ? `v${est.currentVersionNumber}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
                          {formatUpdated(est.updatedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className={`min-h-11 px-3 rounded-[10px] text-[13px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                            style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                            onClick={() =>
                              onNavigate('project-estimate-workspace', {
                                ...seed!,
                                estimate_id: est.id,
                              })
                            }
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
