// ─── Screen 02 — Create Construction Project (KEEP polish) ───────────────────
// Canonical company project creation from Company Projects.
// Fields match server project model only. organizationId comes from
// useProjects() / active org membership — never trusted from the form.

import { useEffect, useId, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { useProjects } from '@/data/projectState'
import { describeProjectError } from '@/data/projectApi'
import { constructionStages } from '@/data/constructionStages'
import { isProjectScheduleValid } from '@/data/companyProjectForm'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const PROJECT_TYPE_OPTIONS: { id: 'new-build' | 'renovation'; label: string; description: string }[] = [
  { id: 'new-build', label: 'New Construction', description: 'Building a new structure from the ground up.' },
  { id: 'renovation', label: 'Renovation', description: 'Renovating, remodeling or extending an existing structure.' },
]

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
)

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
      {children}
      {optional && <span className="text-[var(--hz-ink-subtle)] font-normal ml-1">Optional</span>}
    </label>
  )
}

const inputClass = 'w-full min-h-11 h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'
const inputStyle = { border: '1px solid var(--hz-border)', fontFamily: FONT_BODY }

export default function CreateConstructionProjectScreen({
  role,
  onNavigate,
}: {
  role?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessional = role === undefined || role === 'professional'
  useEffect(() => {
    if (role !== undefined && !isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate, role])

  const organizations = useOrganizations()
  const projects = useProjects()
  const currentOrganization = organizations.currentOrganization

  const nameId = useId()
  const descriptionId = useId()
  const stageId = useId()
  const locationId = useId()
  const startId = useId()
  const endId = useId()

  const [name, setName] = useState('')
  const [type, setType] = useState<'new-build' | 'renovation'>('new-build')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(currentOrganization?.location ?? '')
  const [timelineStart, setTimelineStart] = useState('')
  const [timelineCompletion, setTimelineCompletion] = useState('')
  const [stage, setStage] = useState(constructionStages[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scheduleInvalid = !isProjectScheduleValid(timelineStart, timelineCompletion)

  const canSubmit =
    Boolean(currentOrganization) &&
    name.trim().length >= 2 &&
    !scheduleInvalid &&
    !submitting

  function goBack() {
    onNavigate('company-projects')
  }

  async function handleSubmit() {
    if (!canSubmit || !currentOrganization) return
    setSubmitting(true)
    setError(null)
    try {
      const project = await projects.createProject({
        name: name.trim(),
        type,
        location: location.trim() || undefined,
        summary: description.trim() || undefined,
        timelineStart: timelineStart.trim() || undefined,
        timelineCompletion: timelineCompletion.trim() || undefined,
        stage: stage || undefined,
        status: 'planning',
      })
      onNavigate('project-workspace', {
        project_id: project.id,
        project_name: project.name,
        project_type: project.type ?? '',
        location: project.location ?? '',
        project_stage: project.stage ?? '',
        project_status: project.status ?? '',
        timeline_start: project.timelineStart ?? '',
        timeline_completion: project.timelineCompletion ?? '',
        summary: project.summary ?? '',
        organization_id: project.organizationId ?? '',
        company_name: currentOrganization?.name ?? '',
      })
    } catch (err) {
      setError(describeProjectError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (role !== undefined && !isProfessional) return null

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FBF9F7' }}>
      <PartnerNavRail active="projects" onNavigate={onNavigate} organizationId={currentOrganization?.id} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
          <div className="flex items-center min-h-14 h-14 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 min-h-11 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
              style={{ fontFamily: FONT_BODY }}
            >
              <IcoBack /> Projects
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
          <div className="max-w-[640px] mx-auto flex flex-col gap-6">
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>New Construction Project</p>
              <h1 className="text-[22px] sm:text-[24px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Create a project</h1>
              {currentOrganization && (
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>For {currentOrganization.name}</p>
              )}
            </div>

            {!currentOrganization ? (
              <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }}>
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Organization information unavailable.</p>
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
                  A construction project must belong to your company workspace.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('create-organization')}
                  className="min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white"
                  style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                >
                  Set up organization
                </button>
              </div>
            ) : (
              <>
                <section className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-4" style={{ border: '1px solid var(--hz-border)' }} aria-labelledby="s02-info-heading">
                  <h2 id="s02-info-heading" className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Project Information</h2>
                  <div>
                    <FieldLabel htmlFor={nameId}>Project Name</FieldLabel>
                    <input
                      id={nameId}
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Whitefield Residency"
                      autoComplete="off"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={descriptionId} optional>Description</FieldLabel>
                    <textarea
                      id={descriptionId}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Briefly describe the scope of this project."
                      rows={3}
                      className="w-full px-3.5 py-3 rounded-[10px] text-[13.5px] outline-none resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
                      style={inputStyle}
                    />
                  </div>
                </section>

                <section className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-3" style={{ border: '1px solid var(--hz-border)' }} aria-labelledby="s02-type-heading">
                  <h2 id="s02-type-heading" className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Construction Type</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Construction type">
                    {PROJECT_TYPE_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={type === option.id}
                        onClick={() => setType(option.id)}
                        className="text-left rounded-[12px] p-3.5 cursor-pointer transition-colors min-h-[88px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
                        style={{
                          border: type === option.id ? '1.5px solid var(--hz-primary)' : '1px solid var(--hz-border)',
                          backgroundColor: type === option.id ? '#F9F5FF' : 'var(--hz-surface)',
                        }}
                      >
                        <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{option.label}</p>
                        <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{option.description}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-1">
                    <FieldLabel htmlFor={stageId} optional>Current Construction Stage</FieldLabel>
                    <select
                      id={stageId}
                      value={stage}
                      onChange={e => setStage(e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    >
                      {constructionStages.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </section>

                <section className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-4" style={{ border: '1px solid var(--hz-border)' }} aria-labelledby="s02-location-heading">
                  <h2 id="s02-location-heading" className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Location</h2>
                  <div>
                    <FieldLabel htmlFor={locationId} optional>Project Address / Location</FieldLabel>
                    <input
                      id={locationId}
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Whitefield, Bengaluru"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </section>

                <section className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-4" style={{ border: '1px solid var(--hz-border)' }} aria-labelledby="s02-schedule-heading">
                  <h2 id="s02-schedule-heading" className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>Schedule</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel htmlFor={startId} optional>Planned Start Date</FieldLabel>
                      <input id={startId} type="date" value={timelineStart} onChange={e => setTimelineStart(e.target.value)} className={inputClass} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel htmlFor={endId} optional>Planned Completion Date</FieldLabel>
                      <input id={endId} type="date" value={timelineCompletion} onChange={e => setTimelineCompletion(e.target.value)} className={inputClass} style={inputStyle} />
                    </div>
                  </div>
                  {scheduleInvalid && (
                    <p className="text-[12.5px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }} role="alert">
                      Completion date must be on or after the start date.
                    </p>
                  )}
                </section>

                {error && (
                  <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
                    <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3">
                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => { void handleSubmit() }}
                    className="min-h-11 h-11 px-6 rounded-[12px] text-[13.5px] font-semibold border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A22A8]"
                    style={{
                      backgroundColor: canSubmit ? 'var(--hz-primary)' : 'var(--hz-border)',
                      color: canSubmit ? 'white' : 'var(--hz-ink-subtle)',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      fontFamily: FONT_BODY,
                    }}
                  >
                    {submitting ? 'Creating…' : 'Create Project'}
                  </button>
                  <button
                    type="button"
                    onClick={goBack}
                    className="min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-[var(--hz-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
                    style={{ border: '1px solid var(--hz-border)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
