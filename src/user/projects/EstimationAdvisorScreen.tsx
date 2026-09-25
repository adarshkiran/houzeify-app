// ─── AI Estimation Advisor — S23 guided structured inputs (no LLM) ─────────

import { useId, useMemo, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import EstimationSubNav from '@/shared/components/EstimationSubNav'
import { useProjects } from '@/data/projectState'
import {
  ESTIMATION_ADVISOR_COPY,
} from '@/data/estimationAdvisorShell'
import {
  advisorInputsToCreateBody,
  listMissingAdvisorFields,
  type EstimationAdvisorInputs,
} from '@/data/estimationAdvisorInputs'
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
const inputStyle = {
  border: '1px solid var(--hz-border)',
  fontFamily: FONT_BODY,
  backgroundColor: 'var(--hz-surface)',
}

type Step = 'start' | 'questions' | 'review'

const FIELD_LABELS: Record<string, string> = {
  estimateName: 'Estimate name',
  location: 'Project location',
  pricingMethod: 'Pricing method',
}

export default function EstimationAdvisorScreen({
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
  const { getProject } = useProjects()
  const project = projectId ? getProject(projectId) : undefined
  const displayProjectName = project?.name || projectName || '—'

  const [step, setStep] = useState<Step>('start')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputs, setInputs] = useState<EstimationAdvisorInputs>(() => ({
    estimateName: '',
    projectType: '',
    location: project?.location || '',
    areaSqft: null,
    floors: null,
    constructionScope: '',
    pricingMethod: 'detailed_boq',
    drawingsAvailable: null,
    requirementsNotes: '',
  }))

  const nameId = useId()
  const typeId = useId()
  const locationId = useId()
  const areaId = useId()
  const floorsId = useId()
  const scopeId = useId()
  const methodId = useId()
  const drawingsId = useId()
  const notesId = useId()

  const missing = useMemo(() => listMissingAdvisorFields(inputs), [inputs])
  const canGenerate = missing.length === 0 && !!projectId

  function navSeed(extra?: Record<string, string>): Record<string, string> | undefined {
    if (!projectId) return undefined
    const seed: Record<string, string> = { project_id: projectId }
    if (displayProjectName !== '—') seed.project_name = displayProjectName
    const org = organizationId || project?.organizationId
    if (org) seed.organization_id = org
    if (estimateId) seed.estimate_id = estimateId
    if (extra) Object.assign(seed, extra)
    return seed
  }

  function patch<K extends keyof EstimationAdvisorInputs>(key: K, value: EstimationAdvisorInputs[K]) {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  async function handleGenerate() {
    if (!projectId || !canGenerate || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const estimate = await createProjectEstimate(projectId, advisorInputsToCreateBody(inputs))
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
        <PartnerNavRail active="estimation" organizationId={organizationId} onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
              {ESTIMATION_ADVISOR_COPY.eyebrow}
            </p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
              {ESTIMATION_ADVISOR_COPY.title}
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
              {ESTIMATION_ADVISOR_COPY.subtitle}
            </p>

            <EstimationSubNav
              active="advisor"
              projectId={projectId}
              projectName={displayProjectName !== '—' ? displayProjectName : projectName}
              organizationId={organizationId || project?.organizationId || undefined}
              estimateId={estimateId}
              onNavigate={onNavigate}
            />

            {step === 'start' && (
              <section className="mt-6 rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5 max-w-2xl">
                <p className="text-[14px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                  {ESTIMATION_ADVISOR_COPY.body}
                </p>
                <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0 mt-3" style={{ fontFamily: FONT_BODY }}>
                  Project: <span className="text-[var(--hz-ink)] font-semibold">{displayProjectName}</span>
                </p>
                <p
                  className="text-[12.5px] m-0 mt-4 rounded-[12px] px-3 py-2"
                  style={{
                    fontFamily: FONT_BODY,
                    backgroundColor: 'var(--hz-primary-wash)',
                    color: 'var(--hz-ink-muted)',
                    border: '1px solid var(--hz-primary-soft)',
                  }}
                >
                  {ESTIMATION_ADVISOR_COPY.disclaimer}
                </p>
                <button
                  type="button"
                  className={`min-h-11 mt-5 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                  style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                  onClick={() => setStep('questions')}
                  disabled={!projectId}
                >
                  Start Advisor
                </button>
              </section>
            )}

            {step !== 'start' && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  {step === 'questions' && (
                    <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                      <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                        Project information
                      </h2>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block sm:col-span-2" htmlFor={nameId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Estimate name <span className="text-[var(--hz-danger)]">*</span>
                          </span>
                          <input
                            id={nameId}
                            className={`${inputClass} mt-1.5`}
                            style={inputStyle}
                            value={inputs.estimateName}
                            onChange={e => patch('estimateName', e.target.value)}
                            placeholder="e.g. Foundation package"
                          />
                        </label>
                        <label className="block" htmlFor={typeId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Project type
                          </span>
                          <input
                            id={typeId}
                            className={`${inputClass} mt-1.5`}
                            style={inputStyle}
                            value={inputs.projectType}
                            onChange={e => patch('projectType', e.target.value)}
                            placeholder="e.g. New home"
                          />
                        </label>
                        <label className="block" htmlFor={locationId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Location <span className="text-[var(--hz-danger)]">*</span>
                          </span>
                          <input
                            id={locationId}
                            className={`${inputClass} mt-1.5`}
                            style={inputStyle}
                            value={inputs.location}
                            onChange={e => patch('location', e.target.value)}
                          />
                        </label>
                        <label className="block" htmlFor={areaId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Built-up area (sq.ft)
                          </span>
                          <input
                            id={areaId}
                            type="number"
                            min={1}
                            className={`${inputClass} mt-1.5`}
                            style={inputStyle}
                            value={inputs.areaSqft ?? ''}
                            onChange={e => {
                              const n = Number.parseInt(e.target.value, 10)
                              patch('areaSqft', Number.isFinite(n) && n > 0 ? n : null)
                            }}
                          />
                        </label>
                        <label className="block" htmlFor={floorsId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Number of floors
                          </span>
                          <input
                            id={floorsId}
                            type="number"
                            min={1}
                            className={`${inputClass} mt-1.5`}
                            style={inputStyle}
                            value={inputs.floors ?? ''}
                            onChange={e => {
                              const n = Number.parseInt(e.target.value, 10)
                              patch('floors', Number.isFinite(n) && n > 0 ? n : null)
                            }}
                          />
                        </label>
                        <label className="block sm:col-span-2" htmlFor={scopeId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Construction level / scope
                          </span>
                          <input
                            id={scopeId}
                            className={`${inputClass} mt-1.5`}
                            style={inputStyle}
                            value={inputs.constructionScope}
                            onChange={e => patch('constructionScope', e.target.value)}
                            placeholder="e.g. Structure + finishes"
                          />
                        </label>
                        <label className="block" htmlFor={methodId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Pricing method <span className="text-[var(--hz-danger)]">*</span>
                          </span>
                          <select
                            id={methodId}
                            className={`${inputClass} mt-1.5`}
                            style={inputStyle}
                            value={inputs.pricingMethod}
                            onChange={e => patch('pricingMethod', e.target.value as EstimatePricingMethod)}
                          >
                            {ESTIMATE_PRICING_METHODS.map(m => (
                              <option key={m} value={m}>
                                {ESTIMATE_PRICING_METHOD_LABELS[m]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block" htmlFor={drawingsId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Drawings / plans available?
                          </span>
                          <select
                            id={drawingsId}
                            className={`${inputClass} mt-1.5`}
                            style={inputStyle}
                            value={
                              inputs.drawingsAvailable == null ? '' : inputs.drawingsAvailable ? 'yes' : 'no'
                            }
                            onChange={e => {
                              const v = e.target.value
                              patch('drawingsAvailable', v === '' ? null : v === 'yes')
                            }}
                          >
                            <option value="">Not set</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </label>
                        <label className="block sm:col-span-2" htmlFor={notesId}>
                          <span className="text-[12.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>
                            Other requirements
                          </span>
                          <textarea
                            id={notesId}
                            rows={3}
                            className={`w-full mt-1.5 px-3.5 py-2.5 rounded-[10px] text-[13.5px] outline-none resize-y ${FOCUS}`}
                            style={inputStyle}
                            value={inputs.requirementsNotes}
                            onChange={e => patch('requirementsNotes', e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                          style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                          onClick={() => setStep('review')}
                        >
                          Continue to review
                        </button>
                        <button
                          type="button"
                          className={`min-h-11 px-4 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                          style={{ backgroundColor: 'transparent', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}
                          onClick={() => setStep('start')}
                        >
                          Back
                        </button>
                      </div>
                    </section>
                  )}

                  {step === 'review' && (
                    <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-5">
                      <h2 className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                        Review
                      </h2>
                      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                        Confirm inputs before creating a Draft estimate. No line items or totals are invented.
                      </p>
                      <dl className="mt-4 space-y-3 m-0">
                        {(
                          [
                            ['Estimate name', inputs.estimateName],
                            ['Project type', inputs.projectType || '—'],
                            ['Location', inputs.location],
                            ['Built-up area', inputs.areaSqft != null ? `${inputs.areaSqft} sq.ft` : '—'],
                            ['Floors', inputs.floors != null ? String(inputs.floors) : '—'],
                            ['Scope', inputs.constructionScope || '—'],
                            ['Pricing method', ESTIMATE_PRICING_METHOD_LABELS[inputs.pricingMethod]],
                            [
                              'Drawings available',
                              inputs.drawingsAvailable == null
                                ? '—'
                                : inputs.drawingsAvailable
                                  ? 'Yes'
                                  : 'No',
                            ],
                            ['Notes', inputs.requirementsNotes || '—'],
                          ] as const
                        ).map(([label, value]) => (
                          <div key={label} className="flex justify-between gap-4">
                            <dt className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                              {label}
                            </dt>
                            <dd className="text-[14px] text-[var(--hz-ink)] m-0 text-right" style={{ fontFamily: FONT_BODY }}>
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {error && (
                        <p className="text-[13px] text-[#B91C1C] m-0 mt-4" role="alert" style={{ fontFamily: FONT_BODY }}>
                          {error}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={!canGenerate || submitting}
                          className={`min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 ${FOCUS} ${
                            !canGenerate || submitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
                          onClick={() => void handleGenerate()}
                        >
                          {submitting ? 'Creating…' : 'Generate Estimation Inputs'}
                        </button>
                        <button
                          type="button"
                          className={`min-h-11 px-4 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer ${FOCUS}`}
                          style={{ backgroundColor: 'transparent', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}
                          onClick={() => setStep('questions')}
                        >
                          Edit answers
                        </button>
                      </div>
                    </section>
                  )}
                </div>

                <aside className="space-y-4">
                  <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
                    <h3 className="text-[13px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                      Collected
                    </h3>
                    <ul className="mt-2 m-0 pl-4 text-[13px] text-[var(--hz-ink-muted)] space-y-1" style={{ fontFamily: FONT_BODY }}>
                      {inputs.estimateName.trim() && <li>Estimate name (User)</li>}
                      {inputs.projectType.trim() && <li>Project type (User)</li>}
                      {inputs.location.trim() && <li>Location (User)</li>}
                      {inputs.areaSqft != null && <li>Built-up area (User)</li>}
                      {inputs.floors != null && <li>Floors (User)</li>}
                      {inputs.constructionScope.trim() && <li>Scope (User)</li>}
                      <li>Pricing method (User)</li>
                      {inputs.drawingsAvailable != null && <li>Drawings flag (User)</li>}
                      {inputs.requirementsNotes.trim() && <li>Notes (User)</li>}
                    </ul>
                  </section>
                  <section className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4">
                    <h3 className="text-[13px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                      Missing
                    </h3>
                    {missing.length === 0 ? (
                      <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                        Required fields complete.
                      </p>
                    ) : (
                      <ul className="mt-2 m-0 pl-4 text-[13px] text-[var(--hz-ink-muted)] space-y-1" style={{ fontFamily: FONT_BODY }}>
                        {missing.map(m => (
                          <li key={m}>{FIELD_LABELS[m] || m}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                  <section
                    className="rounded-[16px] p-4"
                    style={{
                      backgroundColor: 'var(--hz-primary-wash)',
                      border: '1px solid var(--hz-primary-soft)',
                    }}
                  >
                    <h3 className="text-[13px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                      Suggestions
                    </h3>
                    <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-primary)] m-0 mt-1" style={{ fontFamily: FONT_MONO }}>
                      Guided suggestion
                    </p>
                    <ul className="mt-2 m-0 pl-4 text-[13px] text-[var(--hz-ink-muted)] space-y-1.5" style={{ fontFamily: FONT_BODY }}>
                      <li>Upload House Plan when drawings are ready — separate from this Advisor.</li>
                      <li>Open Material Calculator anytime for quantities.</li>
                      <li>Use Price Intelligence for organization and project rates — Estimate Builder comes later.</li>
                    </ul>
                  </section>
                </aside>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
