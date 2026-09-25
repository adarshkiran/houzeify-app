// ─── Estimate generation loading — Post-S27 Slice 1 ────────────────────────
// Shows only real backend stages. No fabricated AI analysis copy.

import { useEffect, useRef, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import EstimationSubNav from '@/shared/components/EstimationSubNav'
import { ESTIMATE_ROUTES } from '@/data/estimationFoundationShell'
import {
  describeEstimateError,
  generateProjectEstimate,
  type EstimateConstructionLevel,
} from '@/data/projectEstimatesApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const STAGE_LABELS: Record<string, string> = {
  requirements: 'Analyzing project requirements',
  quantities: 'Preparing construction quantities',
  rates: 'Resolving applicable rates',
  summary: 'Preparing estimate summary',
}

export default function EstimateLoadingScreen({
  projectId,
  projectName,
  organizationId,
  estimateId,
  builtUpArea,
  floors,
  constructionLevel,
  location,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  organizationId?: string
  estimateId?: string
  builtUpArea?: string
  floors?: string
  constructionLevel?: string
  location?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const [activeStage, setActiveStage] = useState<string>('requirements')
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    if (!projectId || !estimateId) {
      setError('Missing estimate context.')
      return
    }
    started.current = true

    void (async () => {
      try {
        setActiveStage('requirements')
        const area = builtUpArea ? Number(builtUpArea) : undefined
        const floorN = floors ? Number(floors) : undefined
        const level = (constructionLevel === 'Basic' ||
        constructionLevel === 'Standard' ||
        constructionLevel === 'Premium'
          ? constructionLevel
          : 'Standard') as EstimateConstructionLevel

        setActiveStage('quantities')
        const result = await generateProjectEstimate(projectId, estimateId, {
          builtUpArea: area && area > 0 ? area : undefined,
          floors: floorN && floorN > 0 ? floorN : undefined,
          constructionLevel: level,
          location: location || undefined,
          replaceItems: true,
        })
        setActiveStage(result.stagesCompleted.at(-1) || 'summary')

        onNavigate(ESTIMATE_ROUTES.dashboard, {
          project_id: projectId,
          ...(projectName ? { project_name: projectName } : {}),
          ...(organizationId ? { organization_id: organizationId } : {}),
          estimate_id: estimateId,
        })
      } catch (err) {
        setError(describeEstimateError(err))
      }
    })()
  }, [
    projectId,
    estimateId,
    builtUpArea,
    floors,
    constructionLevel,
    location,
    projectName,
    organizationId,
    onNavigate,
  ])

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
              Estimate
            </p>
            <h1
              className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0"
              style={{ fontFamily: FONT_HEAD }}
            >
              Preparing estimate
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
              Calculating material quantities and resolving organization rates. No fabricated AI analysis.
            </p>

            <EstimationSubNav
              active="estimates"
              projectId={projectId}
              projectName={projectName}
              organizationId={organizationId}
              estimateId={estimateId}
              onNavigate={onNavigate}
            />

            <section className="mt-6 max-w-lg rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
              {error ? (
                <div>
                  <p className="text-[14px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>
                    {error}
                  </p>
                  <button
                    type="button"
                    className="min-h-11 mt-4 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer"
                    style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                    onClick={() =>
                      onNavigate(ESTIMATE_ROUTES.workspace, {
                        project_id: projectId || '',
                        estimate_id: estimateId || '',
                        ...(organizationId ? { organization_id: organizationId } : {}),
                      })
                    }
                  >
                    Open builder
                  </button>
                </div>
              ) : (
                <ul className="m-0 p-0 list-none space-y-3">
                  {Object.entries(STAGE_LABELS).map(([id, label]) => {
                    const done =
                      Object.keys(STAGE_LABELS).indexOf(id) <
                      Object.keys(STAGE_LABELS).indexOf(activeStage)
                    const current = id === activeStage
                    return (
                      <li
                        key={id}
                        className="text-[14px]"
                        style={{
                          fontFamily: FONT_BODY,
                          color: current || done ? 'var(--hz-ink)' : 'var(--hz-ink-muted)',
                          fontWeight: current ? 600 : 400,
                        }}
                      >
                        {done ? '✓ ' : current ? '… ' : '○ '}
                        {label}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
