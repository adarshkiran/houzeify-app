// ─── Estimation module Overview — main Side Nav entry ──────────────────────

import { useEffect, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import EstimationSubNav from '@/shared/components/EstimationSubNav'
import { useProjects } from '@/data/projectState'
import { ESTIMATE_ROUTES } from '@/data/estimationFoundationShell'
import { ESTIMATION_ADVISOR_ROUTE } from '@/data/estimationAdvisorShell'
import {
  describeEstimateError,
  ESTIMATE_STATUS_LABELS,
  formatEstimateInr,
  listProjectEstimates,
  type ProjectEstimate,
} from '@/data/projectEstimatesApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'

export default function EstimationOverviewScreen({
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
  const { projects, status, getProject } = useProjects()
  const selected = projectId ? getProject(projectId) : undefined
  const displayName = selected?.name || projectName
  const [recent, setRecent] = useState<ProjectEstimate[]>([])
  const [recentStatus, setRecentStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [recentError, setRecentError] = useState<string | null>(null)

  function seed(extra?: Record<string, string>): Record<string, string> | undefined {
    const id = projectId || selected?.id
    if (!id) return organizationId ? { organization_id: organizationId } : undefined
    const s: Record<string, string> = { project_id: id }
    const name = displayName || selected?.name
    if (name) s.project_name = name
    const org = organizationId || selected?.organizationId
    if (org) s.organization_id = org
    if (extra) Object.assign(s, extra)
    return s
  }

  function selectProject(id: string, name: string) {
    onNavigate(ESTIMATE_ROUTES.overview, {
      project_id: id,
      project_name: name,
      ...(organizationId ? { organization_id: organizationId } : {}),
    })
  }

  useEffect(() => {
    if (!projectId) {
      setRecent([])
      setRecentStatus('idle')
      return
    }
    let cancelled = false
    setRecentStatus('loading')
    setRecentError(null)
    void listProjectEstimates(projectId)
      .then(list => {
        if (cancelled) return
        setRecent(list.slice(0, 5))
        setRecentStatus('loaded')
      })
      .catch(err => {
        if (cancelled) return
        setRecent([])
        setRecentStatus('error')
        setRecentError(describeEstimateError(err))
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <PartnerNavRail active="estimation" organizationId={organizationId} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
              Estimation
            </p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
              Overview
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1 max-w-xl" style={{ fontFamily: FONT_BODY }}>
              Start a new estimation, review recent drafts, and open tools. Full list management stays on Estimates.
            </p>

            <EstimationSubNav
              active="overview"
              projectId={projectId}
              projectName={displayName}
              organizationId={organizationId}
              onNavigate={onNavigate}
            />

            {projectId && (
              <>
                <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-2xl">
                  <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                    {displayName || 'Selected project'}
                  </h2>
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                    New Estimation opens the AI Estimation Advisor. No fabricated totals.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                      style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                      onClick={() => onNavigate(ESTIMATION_ADVISOR_ROUTE, seed())}
                    >
                      + New Estimation
                    </button>
                    <button
                      type="button"
                      className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                      style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }}
                      onClick={() => onNavigate(ESTIMATE_ROUTES.list, seed())}
                    >
                      All estimates
                    </button>
                  </div>
                </section>

                <section className="mt-4 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-2xl">
                  <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                    Recent estimates
                  </h2>
                  {recentStatus === 'loading' ? (
                    <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-3" role="status" style={{ fontFamily: FONT_BODY }}>
                      Loading…
                    </p>
                  ) : null}
                  {recentStatus === 'error' ? (
                    <p className="text-[14px] text-[#B91C1C] m-0 mt-3" style={{ fontFamily: FONT_BODY }}>
                      {recentError}
                    </p>
                  ) : null}
                  {recentStatus === 'loaded' && recent.length === 0 ? (
                    <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-3" style={{ fontFamily: FONT_BODY }}>
                      No estimates yet for this project.
                    </p>
                  ) : null}
                  {recent.length > 0 ? (
                    <ul className="mt-3 m-0 p-0 list-none space-y-2">
                      {recent.map(est => (
                        <li key={est.id}>
                          <button
                            type="button"
                            className={`w-full min-h-11 text-left px-3.5 rounded-[10px] text-[13.5px] border cursor-pointer ${FOCUS}`}
                            style={{
                              fontFamily: FONT_BODY,
                              borderColor: 'var(--hz-border)',
                              backgroundColor: 'var(--hz-page)',
                              color: 'var(--hz-ink)',
                            }}
                            onClick={() =>
                              onNavigate(ESTIMATE_ROUTES.dashboard, seed({ estimate_id: est.id }))
                            }
                          >
                            <span className="font-semibold">{est.name}</span>
                            <span className="block text-[12px] text-[var(--hz-ink-muted)] mt-0.5">
                              {ESTIMATE_STATUS_LABELS[est.status] || est.status}
                              {' · '}
                              {formatEstimateInr(est.totalAmount)}
                              {' · '}
                              Updated {new Date(est.updatedAt).toLocaleString('en-IN')}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              </>
            )}

            {!projectId && (
              <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-2xl">
                <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Choose a project
                </h2>
                <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  Estimation tools need a project context. Select a company project to continue.
                </p>
                {status === 'loading' && (
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-4" style={{ fontFamily: FONT_BODY }} role="status">
                    Loading projects…
                  </p>
                )}
                {status === 'loaded' && projects.length === 0 && (
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-4" style={{ fontFamily: FONT_BODY }}>
                    No projects yet. Create one from Projects, then return here.
                  </p>
                )}
                {status === 'loaded' && projects.length > 0 && (
                  <ul className="mt-4 m-0 p-0 list-none space-y-2">
                    {projects.map(p => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={`w-full min-h-11 text-left px-3.5 rounded-[10px] text-[13.5px] font-semibold border cursor-pointer ${FOCUS}`}
                          style={{
                            fontFamily: FONT_BODY,
                            borderColor: 'var(--hz-border)',
                            backgroundColor: 'var(--hz-page)',
                            color: 'var(--hz-ink)',
                          }}
                          onClick={() => selectProject(p.id, p.name)}
                        >
                          {p.name}
                          {p.location ? (
                            <span className="block text-[12px] font-normal text-[var(--hz-ink-muted)] mt-0.5">{p.location}</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
