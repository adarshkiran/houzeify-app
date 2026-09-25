// ─── Create Estimate — estimation foundation ───────────────────────────────

import { useId, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import EstimationSubNav from '@/shared/components/EstimationSubNav'
import { useProjects } from '@/data/projectState'
import {
  createProjectEstimate,
  describeEstimateError,
  ESTIMATE_PRICING_METHOD_LABELS,
  ESTIMATE_PRICING_METHODS,
  type EstimatePricingMethod,
} from '@/data/projectEstimatesApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'
const inputClass = `w-full min-h-11 h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none transition-colors ${FOCUS}`
const inputStyle = { border: '1px solid var(--hz-border)', fontFamily: FONT_BODY, backgroundColor: 'var(--hz-surface)' }

export default function CreateEstimateScreen({
  projectId,
  projectName,
  organizationId,
  initialAreaSqft,
  initialLocation,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  organizationId?: string
  /** Optional handoff from Material Calculator (S25) — area only, no pricing. */
  initialAreaSqft?: string
  initialLocation?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const { getProject } = useProjects()
  const project = projectId ? getProject(projectId) : undefined
  const nameId = useId()
  const methodId = useId()
  const locationId = useId()
  const areaId = useId()

  const [name, setName] = useState('')
  const [pricingMethod, setPricingMethod] = useState<EstimatePricingMethod>('detailed_boq')
  const [location, setLocation] = useState(initialLocation || project?.location || '')
  const [areaSqft, setAreaSqft] = useState(initialAreaSqft || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayProjectName = project?.name || projectName || '—'
  function navSeed(extra?: Record<string, string>): Record<string, string> | undefined {
    if (!projectId) return undefined
    const seed: Record<string, string> = { project_id: projectId }
    if (displayProjectName !== '—') seed.project_name = displayProjectName
    const org = organizationId || project?.organizationId || undefined
    if (org) seed.organization_id = org
    if (extra) Object.assign(seed, extra)
    return seed
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId || !name.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const area =
        pricingMethod !== 'detailed_boq' && areaSqft.trim()
          ? Number.parseInt(areaSqft, 10)
          : undefined
      const estimate = await createProjectEstimate(projectId, {
        name: name.trim(),
        pricingMethod,
        location: location.trim() || undefined,
        areaSqft: Number.isFinite(area) && area! > 0 ? area : undefined,
      })
      onNavigate('project-estimate-workspace', navSeed({ estimate_id: estimate.id }))
    } catch (err) {
      setError(describeEstimateError(err) || "We couldn't create the estimate. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0">
        <PartnerNavRail active="estimation" organizationId={organizationId || project?.organizationId || undefined} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
              New Estimate
            </p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
              Create Estimate
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1 max-w-xl" style={{ fontFamily: FONT_BODY }}>
              Linked to this project. You will start on Version 1 as Draft. No totals until items are added.
            </p>

            <EstimationSubNav
              active="estimates"
              projectId={projectId}
              projectName={displayProjectName === '—' ? projectName : displayProjectName}
              organizationId={organizationId || project?.organizationId || undefined}
              onNavigate={onNavigate}
            />

            {!projectId && (
              <p className="mt-6 text-[14px] text-[var(--hz-danger)]" role="alert">Missing project context.</p>
            )}

            {projectId && (
              <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 sm:p-6">
                <div>
                  <label className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                    Project
                  </label>
                  <p className="text-[14px] text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_BODY }}>{displayProjectName}</p>
                </div>

                <div>
                  <label htmlFor={nameId} className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                    Estimate Name
                  </label>
                  <input
                    id={nameId}
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="e.g. Foundation package"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label htmlFor={methodId} className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                    Pricing Method
                  </label>
                  <select
                    id={methodId}
                    value={pricingMethod}
                    onChange={e => setPricingMethod(e.target.value as EstimatePricingMethod)}
                    className={inputClass}
                    style={inputStyle}
                  >
                    {ESTIMATE_PRICING_METHODS.map(m => (
                      <option key={m} value={m}>{ESTIMATE_PRICING_METHOD_LABELS[m]}</option>
                    ))}
                  </select>
                  <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-1.5" style={{ fontFamily: FONT_BODY }}>
                    {pricingMethod === 'detailed_boq' && 'Quantity × Rate = Amount for line items (calculator comes later).'}
                    {pricingMethod === 'rate_per_sqft' && 'Built-up area × rate/sq.ft (calculator comes later).'}
                    {pricingMethod === 'hybrid' && 'Mix of detailed lines and sq.ft components (calculator comes later).'}
                  </p>
                </div>

                <div>
                  <label htmlFor={locationId} className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                    Project Location <span className="text-[var(--hz-ink-subtle)] font-normal">Optional</span>
                  </label>
                  <input
                    id={locationId}
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    maxLength={300}
                  />
                </div>

                {(pricingMethod === 'rate_per_sqft' || pricingMethod === 'hybrid') && (
                  <div>
                    <label htmlFor={areaId} className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
                      Built-up Area (sq.ft) <span className="text-[var(--hz-ink-subtle)] font-normal">Optional</span>
                    </label>
                    <input
                      id={areaId}
                      type="number"
                      min={1}
                      step={1}
                      value={areaSqft}
                      onChange={e => setAreaSqft(e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                )}

                <div>
                  <p className="text-[13px] font-semibold text-[var(--hz-ink)] m-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Currency</p>
                  <p className="text-[14px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>INR (default)</p>
                </div>

                {error && (
                  <p className="text-[13px] text-[var(--hz-danger)] m-0" role="alert" style={{ fontFamily: FONT_BODY }}>{error}</p>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={submitting || !name.trim()}
                    className={`min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer disabled:opacity-50 ${FOCUS}`}
                    style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                  >
                    {submitting ? 'Saving…' : 'Create Estimate'}
                  </button>
                  <button
                    type="button"
                    className={`min-h-11 h-11 px-4 rounded-[12px] text-[13.5px] font-medium border-0 cursor-pointer bg-transparent text-[var(--hz-ink-muted)] ${FOCUS}`}
                    style={{ fontFamily: FONT_BODY }}
                    onClick={() => onNavigate('project-estimates', navSeed())}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
