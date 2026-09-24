// ─── Screen 15 — Project Settings (NEW) ───────────────────────────────────────
// Edit project name, construction stage, and location on the real projects row.
// Entry: ProjectSubNav Settings (replaces Coming Soon). Company mutators only
// (existing PATCH ACL: creator or org owner/admin). Customers cannot mutate.

import { useEffect, useId, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useAuth } from '@/data/authState'
import { useProjects } from '@/data/projectState'
import { describeProjectError, type Project } from '@/data/projectApi'
import { constructionStages } from '@/data/constructionStages'
import {
  buildProjectSettingsPatch,
  isProjectSettingsDirty,
  isProjectSettingsNameValid,
} from '@/data/projectSettingsForm'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'
const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]'
const inputClass = `w-full min-h-11 h-11 px-3.5 rounded-[10px] text-[13.5px] outline-none transition-colors ${FOCUS_RING}`
const inputStyle = { border: '1px solid var(--hz-border)', fontFamily: FONT_BODY, backgroundColor: 'var(--hz-surface)' }

function FieldLabel({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_HEAD }}>
      {children}
      {optional && <span className="text-[var(--hz-ink-subtle)] font-normal ml-1">Optional</span>}
    </label>
  )
}

function fieldsFromProject(project: Project) {
  return {
    name: project.name,
    stage: project.stage ?? '',
    location: project.location ?? '',
  }
}

export default function ProjectSettingsScreen({
  role,
  projectId,
  projectName,
  onNavigate,
}: {
  role?: string
  projectId?: string
  projectName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isCompanyUser = role === undefined || role === 'professional'
  const { status: authStatus } = useAuth()
  const { status: projectsStatus, getProject, updateProject, errorMessage: projectsError, refreshProjects } = useProjects()
  const projectsLoading =
    authStatus === 'loading'
    || projectsStatus === 'loading'
    || (authStatus === 'authenticated' && projectsStatus === 'idle')

  const nameId = useId()
  const stageId = useId()
  const locationId = useId()

  const project = projectId ? getProject(projectId) : undefined
  const [name, setName] = useState('')
  const [stage, setStage] = useState('')
  const [location, setLocation] = useState('')
  const [hydratedId, setHydratedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState(false)

  useEffect(() => {
    if (role !== undefined && !isCompanyUser) return
    if (!project || project.id === hydratedId) return
    const fields = fieldsFromProject(project)
    setName(fields.name)
    setStage(fields.stage)
    setLocation(fields.location)
    setHydratedId(project.id)
    setError(null)
    setSavedNotice(false)
  }, [project, hydratedId, isCompanyUser, role])

  const saved = project ? fieldsFromProject(project) : { name: '', stage: '', location: '' }
  const draft = { name, stage, location }
  const dirty = project ? isProjectSettingsDirty(saved, draft) : false
  const nameValid = isProjectSettingsNameValid(name)
  const canSave = Boolean(project) && dirty && nameValid && !submitting

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!project || !canSave) return
    const patch = buildProjectSettingsPatch(saved, draft)
    if (!patch) return
    setSubmitting(true)
    setError(null)
    setSavedNotice(false)
    try {
      const updated = await updateProject(project.id, patch)
      setName(updated.name)
      setStage(updated.stage ?? '')
      setLocation(updated.location ?? '')
      setHydratedId(updated.id)
      setSavedNotice(true)
      onNavigate('project-settings', {
        project_id: updated.id,
        project_name: updated.name,
        location: updated.location ?? '',
        project_stage: updated.stage ?? '',
      })
    } catch (err) {
      setError(describeProjectError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col relative h-full" style={{ backgroundColor: 'var(--hz-page)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ProjectSubNav
            active="settings"
            projectId={projectId}
            projectName={project?.name ?? projectName}
            onNavigate={onNavigate}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
            <div className="max-w-[560px] mx-auto flex flex-col gap-6 min-w-0">
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
                  Project Settings
                </p>
                <h1 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
                  {project?.name ?? projectName ?? 'Project'}
                </h1>
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  Update the project name, construction stage, and location stored on this project.
                </p>
              </div>

              {!isCompanyUser ? (
                <div className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-2" style={{ border: '1px solid var(--hz-border)' }} role="status">
                  <HIcon size={28} />
                  <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>View only</p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                    Project settings can only be changed by the construction company that manages this project.
                  </p>
                </div>
              ) : !projectId ? (
                <div className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-2" style={{ border: '1px solid var(--hz-border)' }}>
                  <HIcon size={28} />
                  <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>No project selected</p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                    Open a project from your company Projects list, then use Settings in the project tabs.
                  </p>
                </div>
              ) : projectsLoading ? (
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }} aria-live="polite">
                  Loading project settings…
                </p>
              ) : authStatus !== 'authenticated' ? (
                <div className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-2" style={{ border: '1px solid var(--hz-border)' }} role="status">
                  <HIcon size={28} />
                  <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Sign in to edit settings</p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                    Project settings load from your company workspace after you sign in.
                  </p>
                </div>
              ) : projectsStatus === 'error' ? (
                <div className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-3" style={{ border: '1px solid var(--hz-border)' }} role="alert">
                  <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Couldn’t load project</p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                    {projectsError || 'Something went wrong loading this project. Please try again.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => { void refreshProjects() }}
                    className={`min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white self-start ${FOCUS_RING}`}
                    style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                  >
                    Try again
                  </button>
                </div>
              ) : !project ? (
                <div className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-2" style={{ border: '1px solid var(--hz-border)' }}>
                  <HIcon size={28} />
                  <p className="text-[14px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found</p>
                  <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
                    This project isn’t in your company workspace, or you don’t have access to edit it.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSave} className="flex flex-col gap-5">
                  <section
                    className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-4"
                    style={{ border: '1px solid var(--hz-border)' }}
                    aria-labelledby="s15-settings-heading"
                  >
                    <h2 id="s15-settings-heading" className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>
                      Editable fields
                    </h2>
                    <div>
                      <FieldLabel htmlFor={nameId}>Project Name</FieldLabel>
                      <input
                        id={nameId}
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); setSavedNotice(false) }}
                        autoComplete="off"
                        required
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor={stageId} optional>Construction Stage</FieldLabel>
                      <select
                        id={stageId}
                        value={stage}
                        onChange={e => { setStage(e.target.value); setSavedNotice(false) }}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="">Not set</option>
                        {constructionStages.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel htmlFor={locationId} optional>Location</FieldLabel>
                      <input
                        id={locationId}
                        type="text"
                        value={location}
                        onChange={e => { setLocation(e.target.value); setSavedNotice(false) }}
                        placeholder="Address or area"
                        autoComplete="street-address"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  </section>

                  {error && (
                    <p className="text-[13px] text-[var(--hz-danger)] m-0" style={{ fontFamily: FONT_BODY }} role="alert">
                      {error}
                    </p>
                  )}
                  {savedNotice && !error && (
                    <p className="text-[13px] text-[var(--hz-success)] m-0" style={{ fontFamily: FONT_BODY }} role="status">
                      Settings saved. Changes persist after refresh.
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <button
                      type="submit"
                      disabled={!canSave}
                      className={`min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 text-white ${FOCUS_RING} ${canSave ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                      style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                    >
                      {submitting ? 'Saving…' : 'Save changes'}
                    </button>
                    {!dirty && !savedNotice && (
                      <p className="text-[12.5px] text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_BODY }}>
                        No unsaved changes
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
