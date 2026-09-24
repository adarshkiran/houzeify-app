// ─── Projects — list screen ──────────────────────────────────────────────
// S12 — Customer My Projects lists linked/shared projects from
// useCustomerProjects (real loading/error/empty). Owner-scoped projects from
// useProjects remain a secondary section when present. Shared opens preserve
// project_id into Overview (invites return to Home to accept).

import { useEffect } from 'react'
import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
import { resolveProjectStatus, isCompletedStatus, type ProjectType } from '@/data/projects'
import type { Project } from '@/data/projectApi'
import { useProjects } from '@/data/projectState'
import { useAuth } from '@/data/authState'
import { useCustomerProjects } from '@/data/customerProjectsState'
import { projectStageLabel } from '@/data/homeownerDashboard'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import { getHouseRequirementsForProject } from '@/data/houseRequirements'
import { useHouseRequirements } from '@/data/houseRequirementsState'
import {
  customerHomeProjectNavData,
  customerProjectsListHeading,
  customerProjectsListOpenDestination,
  partitionCustomerHomeProjects,
  type CustomerHomeProject,
} from '@/data/customerProjectsList'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  'new-build': 'New Build',
  renovation: 'Renovation',
}

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4l5 5-5 5" /></svg>
)
const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)

function MobileTopBar({ onNavigate }: { onNavigate: (screen: string, data?: Record<string, string>) => void }) {
  return (
    <div className="flex md:hidden h-14 items-center justify-between px-4 bg-white border-b border-[#E3DDD7] shrink-0 z-10">
      <div className="flex items-center gap-2.5">
        <HIcon size={26} />
        <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Projects</span>
      </div>
      <button type="button" onClick={() => onNavigate('dashboard-home')} className="min-h-11 text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2 rounded-[8px] px-2" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

function projectSubtitle(project: Project): string | undefined {
  if (project.type === 'new-build') {
    const req = getHouseRequirementsForProject(project.id)
    if (!req) return undefined
    return [req.bhk ? `${req.bhk} BHK` : undefined, req.floors].filter(Boolean).join(' · ') || undefined
  }
  return project.summary ?? undefined
}

function statusDisplayLabel(statusId: string): string {
  if (isProjectStatus(statusId)) return PROJECT_STATUS_LABELS[statusId]
  return projectStageLabel(statusId) ?? statusId
}

function ProjectRow({ project, onClick }: {
  project: Project
  onClick: () => void
}) {
  const status = resolveProjectStatus(project.status, project.stage)
  const subtitle = projectSubtitle(project)
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 rounded-[14px] bg-white p-4 text-left cursor-pointer hover:border-[#722ED1] transition-colors min-h-11 outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2"
      style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14.5px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{project.name}</span>
          {project.type && (project.type === 'new-build' || project.type === 'renovation') && (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
              {PROJECT_TYPE_LABELS[project.type].toUpperCase()}
            </span>
          )}
        </div>
        {subtitle && <span className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{subtitle}</span>}
        <div className="flex items-center gap-3 flex-wrap">
          {project.propertyType && <span className="text-[12.5px] text-[#68636D]">{project.propertyType}</span>}
          {project.location && (
            <span className="flex items-center gap-1 text-[12.5px] text-[#68636D]">
              <IcoMapPin /> {project.location}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>
          {statusDisplayLabel(status).toUpperCase()}
        </span>
        <span className="text-[#9A949D]"><IcoChevronRight /></span>
      </div>
    </button>
  )
}

function ProjectGroup({ label, projects, onOpen }: { label: string; projects: Project[]; onOpen: (p: Project) => void }) {
  if (projects.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{label} ({projects.length})</span>
      <div className="flex flex-col gap-3">
        {projects.map(project => (
          <ProjectRow key={project.id} project={project} onClick={() => onOpen(project)} />
        ))}
      </div>
    </div>
  )
}

function SharedProjectRow({
  project,
  onOpen,
}: {
  project: CustomerHomeProject
  onOpen: (project: CustomerHomeProject) => void
}) {
  const invited = project.customerStatus === 'invited'
  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className="w-full flex items-center justify-between gap-3 rounded-[14px] bg-white p-4 text-left cursor-pointer hover:border-[#722ED1] transition-colors min-h-11 outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2"
      style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
    >
      <div className="min-w-0 flex flex-col gap-1">
        <span className="text-[14.5px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_HEAD }}>{project.name}</span>
        <p className="text-[12.5px] text-[#68636D] m-0">
          {invited
            ? 'Invite pending — join from Home'
            : [project.stage, project.organizationName].filter(Boolean).join(' · ') || 'Shared project'}
        </p>
        {project.location && (
          <span className="flex items-center gap-1 text-[12.5px] text-[#68636D]">
            <IcoMapPin /> {project.location}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap" style={{ backgroundColor: invited ? '#F4F0EC' : '#F3EAFF', color: invited ? '#68636D' : '#722ED1', fontFamily: FONT_MONO }}>
          {invited ? 'INVITED' : 'SHARED'}
        </span>
        <span className="text-[#9A949D]"><IcoChevronRight /></span>
      </div>
    </button>
  )
}

export default function ProjectsListScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const { status: authStatus } = useAuth()
  const { status, projects, refreshProjects } = useProjects()
  const shared = useCustomerProjects()
  const { invited, active, hasAny: hasShared } = partitionCustomerHomeProjects(shared.projects)
  const linkedCount = invited.length + active.length
  const activeProjects = projects.filter(p => !isCompletedStatus(resolveProjectStatus(p.status, p.stage)))
  const completedProjects = projects.filter(p => isCompletedStatus(resolveProjectStatus(p.status, p.stage)))

  const houseRequirementsCache = useHouseRequirements()
  useEffect(() => {
    for (const project of projects) houseRequirementsCache.ensureLoaded(project.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  function openOwnerProject(project: Project) {
    onNavigate('project-workspace', {
      project_id: project.id,
      project_name: project.name,
      project_type: project.type ?? '',
      location: project.location ?? '',
      property_type: project.propertyType ?? '',
      project_stage: project.stage ?? '',
    })
  }

  function openSharedProject(project: CustomerHomeProject) {
    const dest = customerProjectsListOpenDestination(project)
    onNavigate(dest, customerHomeProjectNavData(project))
  }

  const sharedLoading =
    authStatus === 'loading'
    || shared.status === 'loading'
    || (authStatus === 'authenticated' && shared.status === 'idle')
  const sharedError = shared.status === 'error'
  const ownerLoading = status === 'idle' || status === 'loading'

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <MobileTopBar onNavigate={onNavigate} />
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
          <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Projects</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('dashboard-home')}
                className="flex items-center gap-1.5 min-h-11 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2"
                style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}
              >
                <IcoBack /> Back
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-24 md:pb-12" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Your Projects</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                  {sharedLoading ? 'Loading projects…' : customerProjectsListHeading(linkedCount)}
                </h2>
                <p className="text-[13.5px] text-[#68636D] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                  Projects your builder shares with you show up here — open Overview to follow construction progress.
                </p>
              </div>

              {/* S12 primary — linked / shared customer projects */}
              {sharedLoading ? (
                <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }} role="status" aria-live="polite">
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading your linked projects…</p>
                </div>
              ) : sharedError ? (
                <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }} role="alert">
                  <HIcon size={36} />
                  <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Couldn’t load projects</p>
                  <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
                    {shared.errorMessage ?? 'Something went wrong loading your linked projects. Please try again.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => { void shared.refresh() }}
                    className="min-h-11 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-medium cursor-pointer hover:brightness-90 transition-all border-0 outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Try again
                  </button>
                </div>
              ) : !hasShared ? (
                <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                  <HIcon size={36} />
                  <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No linked projects yet</p>
                  <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
                    When a builder shares a project with you, it will appear here with Overview, Progress, and Record.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {invited.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>
                        Invites ({invited.length})
                      </span>
                      <div className="flex flex-col gap-3">
                        {invited.map(project => (
                          <SharedProjectRow key={project.id} project={project} onOpen={openSharedProject} />
                        ))}
                      </div>
                    </div>
                  )}
                  {active.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>
                        Shared with you ({active.length})
                      </span>
                      <div className="flex flex-col gap-3">
                        {active.map(project => (
                          <SharedProjectRow key={project.id} project={project} onOpen={openSharedProject} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Owner-scoped builds — secondary; unchanged company/owner path */}
              {!ownerLoading && status !== 'error' && projects.length > 0 && (
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Your builds</span>
                    <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                      Projects you own open in Project Workspace.
                    </p>
                  </div>
                  <div className="flex flex-col gap-7">
                    <ProjectGroup label="Active" projects={activeProjects} onOpen={openOwnerProject} />
                    <ProjectGroup label="Completed" projects={completedProjects} onOpen={openOwnerProject} />
                  </div>
                </div>
              )}
              {status === 'error' && projects.length === 0 && !hasShared && !sharedLoading && !sharedError && (
                <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }} role="alert">
                  <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Couldn’t load owned projects</p>
                  <button
                    type="button"
                    onClick={() => { void refreshProjects() }}
                    className="min-h-11 px-5 rounded-[10px] bg-[#722ED1] text-white text-[13px] font-medium cursor-pointer border-0"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
