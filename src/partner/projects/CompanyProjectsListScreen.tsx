// ─── Screen 02 — Company Projects List (KEEP polish) ─────────────────────────
// PartnerNavRail Projects. Organization-scoped real projects via useProjects().
// Opens project-workspace. Create → create-construction-project.
// Screen 02: empty / loading / error / responsive / a11y polish only —
// no new project model, no fake rows.

import { useEffect } from 'react'
import HIcon from '@/shared/components/HIcon'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { useProjects } from '@/data/projectState'
import type { Project } from '@/data/projectApi'
import { constructionStages } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const PROJECT_TYPE_LABELS: Record<string, string> = {
  'new-build': 'New Build',
  renovation: 'Renovation',
}

function stageLabel(stage: string | null): string | undefined {
  if (!stage) return undefined
  return constructionStages.find(s => s.id === stage)?.name ?? stage
}

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4l5 5-5 5" /></svg>
)

function ProjectRow({ project, onClick }: { project: Project; onClick: () => void }) {
  const status = isProjectStatus(project.status) ? PROJECT_STATUS_LABELS[project.status] : null
  const stage = stageLabel(project.stage)
  const typeLabel = project.type ? PROJECT_TYPE_LABELS[project.type] : null
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open project ${project.name}`}
      className="w-full flex items-center justify-between gap-3 rounded-[14px] bg-[var(--hz-surface)] p-4 text-left cursor-pointer min-h-[72px] hover:border-[var(--hz-primary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
      style={{ border: '1px solid var(--hz-border)', fontFamily: FONT_BODY }}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-[14.5px] font-semibold text-[var(--hz-ink)] break-words" style={{ fontFamily: FONT_HEAD }}>{project.name}</span>
          {typeLabel && (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_MONO }}>
              {typeLabel.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {stage && <span className="text-[12.5px] text-[var(--hz-ink-muted)]">{stage}</span>}
          {project.location && (
            <span className="flex items-center gap-1 text-[12.5px] text-[var(--hz-ink-muted)] min-w-0">
              <IcoMapPin /> <span className="break-words">{project.location}</span>
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap" style={{ backgroundColor: status ? 'var(--hz-primary-soft)' : 'var(--hz-surface-muted)', color: status ? 'var(--hz-primary)' : 'var(--hz-ink-subtle)', fontFamily: FONT_MONO }}>
          {(status ?? 'STATUS NOT SET').toUpperCase()}
        </span>
        <span className="text-[var(--hz-ink-subtle)]" aria-hidden="true"><IcoChevronRight /></span>
      </div>
    </button>
  )
}

function CreateProjectButton({ onClick, fullWidth }: { onClick: () => void; fullWidth?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A22A8]',
        fullWidth ? 'w-full sm:w-auto' : '',
      ].join(' ')}
      style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
    >
      Create Project
    </button>
  )
}

export default function CompanyProjectsListScreen({
  role,
  onNavigate,
}: {
  role?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])

  const organizations = useOrganizations()
  const { status, projects, errorMessage, refreshProjects } = useProjects()
  if (!isProfessional) return null

  const currentOrganization = organizations.currentOrganization

  function openProject(project: Project) {
    onNavigate('project-workspace', {
      project_id: project.id,
      project_name: project.name,
      project_type: project.type ?? '',
      location: project.location ?? '',
      property_type: project.propertyType ?? '',
      project_stage: project.stage ?? '',
      project_status: project.status ?? '',
      timeline_start: project.timelineStart ?? '',
      timeline_completion: project.timelineCompletion ?? '',
      summary: project.summary ?? '',
      organization_id: project.organizationId ?? '',
      company_name: currentOrganization?.name ?? '',
    })
  }

  function startNewProject() {
    onNavigate('create-construction-project')
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: 'var(--hz-page)' }}>
      <PartnerNavRail active="projects" onNavigate={onNavigate} organizationId={currentOrganization?.id} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between gap-3 px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
          <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>Projects</h1>
          {currentOrganization && status === 'loaded' && (
            <CreateProjectButton onClick={startNewProject} />
          )}
        </header>

        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-24 md:pb-12 flex flex-col gap-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="flex flex-col gap-2 min-w-0">
                <p className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-primary)] m-0" style={{ fontFamily: FONT_MONO }}>
                  Company Projects
                </p>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
                  {currentOrganization?.name ?? 'Your company'}
                </h2>
                <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                  Construction projects in this organization — open a project to continue its Digital Construction Record.
                </p>
              </div>
              {currentOrganization && status === 'loaded' && (
                <div className="md:hidden shrink-0">
                  <CreateProjectButton onClick={startNewProject} fullWidth />
                </div>
              )}
            </div>

            {!currentOrganization ? (
              <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }}>
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Organization information unavailable.</p>
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
                  Projects belong to your company workspace — set up your organization first.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('create-organization')}
                  className="min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A22A8]"
                  style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                >
                  Set up organization
                </button>
              </div>
            ) : status === 'idle' || status === 'loading' ? (
              <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }} aria-live="polite">
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Loading company projects…</p>
              </div>
            ) : status === 'error' ? (
              <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }} role="alert">
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Couldn’t load projects</p>
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                  {errorMessage || 'Something went wrong loading your company’s projects. Please try again.'}
                </p>
                <button
                  type="button"
                  onClick={() => { void refreshProjects() }}
                  className="min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A22A8]"
                  style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
                >
                  Try again
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-[var(--hz-surface)] p-10" style={{ border: '1px solid var(--hz-border)' }}>
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>No construction projects yet.</p>
                <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                  Create your first construction project to start the Digital Construction Record for this company.
                </p>
                <CreateProjectButton onClick={startNewProject} />
              </div>
            ) : (
              <section className="flex flex-col gap-3" aria-label={`${projects.length} company project${projects.length === 1 ? '' : 's'}`}>
                <p className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>
                  {projects.length} project{projects.length === 1 ? '' : 's'}
                </p>
                {projects.map(project => (
                  <ProjectRow key={project.id} project={project} onClick={() => openProject(project)} />
                ))}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
