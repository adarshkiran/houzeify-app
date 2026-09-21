// ─── Projects — list screen ──────────────────────────────────────────────
// Reached from the Sidebar's "Projects" nav item. Lists every project the
// homeowner has started — both New Build (House Requirements) and
// Renovation (Renovate → Project Created) register into the same
// projects.ts store — and lets them jump back into any one of them via
// Project Workspace, or start a new one. Never fabricates projects — an
// honest empty state when the list is empty, matching this codebase's own
// "never invent what isn't real" convention.
//
// Status shown per project is LIVE (projects.ts's resolveProjectStatus),
// derived from the same real bids/agreements/payments stores the Project
// Workspace itself already reads — never the stale value stored at project-
// creation time — so a project correctly moves through its lifecycle here
// too, not just inside its own workspace. Active/Completed is a plain
// two-section grouping of the existing card, not a new tab system.

import { useEffect } from 'react'
import HIcon from '@/shared/components/HIcon'
import Sidebar from '@/shared/components/Sidebar'
// 12H-B — the real project LIST now comes from useProjects() (backend-
// backed, owner-scoped — see src/data/projectState.tsx). resolveProjectStatus/
// isCompletedStatus stay imported from the old projects.ts unchanged: both
// are pure, derived functions (never store reads) over bids/agreements/
// payments, which are untouched this phase — they work identically on a
// real backend project id, matching 12H-A's own migration recommendation.
import { resolveProjectStatus, isCompletedStatus, type ProjectType } from '@/data/projects'
import type { Project } from '@/data/projectApi'
import { useProjects } from '@/data/projectState'
import { useCustomerProjects } from '@/data/customerProjectsState'
import { projectStageLabel } from '@/data/homeownerDashboard'
import { getHouseRequirementsForProject } from '@/data/houseRequirements'
// 12H-C — see projectSubtitle()'s own comment and the cache-warming effect
// below for why this is consulted here.
import { useHouseRequirements } from '@/data/houseRequirementsState'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

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
      <button onClick={() => onNavigate('dashboard-home')} className="text-[13px] text-[#68636D] border-0 bg-transparent cursor-pointer" style={{ fontFamily: FONT_BODY }}>Back</button>
    </div>
  )
}

/** A short "what is this project" line — real per-project requirements for
 *  New Build (looked up live from houseRequirements.ts, so later edits stay
 *  reflected), or the lightweight scope summary Renovation saved onto the
 *  Project record itself (it has no per-project requirements store of its
 *  own — see projects.ts's Project.summary doc comment). */
function projectSubtitle(project: Project): string | undefined {
  if (project.type === 'new-build') {
    const req = getHouseRequirementsForProject(project.id)
    if (!req) return undefined
    return [req.bhk ? `${req.bhk} BHK` : undefined, req.floors].filter(Boolean).join(' · ') || undefined
  }
  return project.summary ?? undefined
}

function ProjectRow({ project, onClick }: {
  project: Project
  onClick: () => void
}) {
  const status = resolveProjectStatus(project.id, project.stage ?? undefined)
  const subtitle = projectSubtitle(project)
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 rounded-[14px] bg-white p-4 text-left cursor-pointer hover:border-[#722ED1] transition-colors"
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
          {(projectStageLabel(status) ?? status).toUpperCase()}
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

export default function ProjectsListScreen({
  onNavigate,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // 12H-B — real, owner-scoped backend list. `status` distinguishes "still
  // loading" from a genuinely empty list — the empty state below must never
  // flash for a homeowner who actually has real projects still in flight.
  const { status, projects } = useProjects()
  const shared = useCustomerProjects()
  const activeProjects = projects.filter(p => !isCompletedStatus(resolveProjectStatus(p.id, p.stage ?? undefined)))
  const completedProjects = projects.filter(p => isCompletedStatus(resolveProjectStatus(p.id, p.stage ?? undefined)))

  // 12H-C — projectSubtitle() below reads House Requirements synchronously
  // from the legacy mirror store (unchanged), which is only ever real after
  // a fetch has happened for that project. App.tsx's own bridge effect only
  // warms the single ambient "current" project — this list can show many
  // projects at once, so it warms the rest itself. Fire-and-forget: each
  // call is a no-op once that project's requirements are already cached, so
  // this is safe to run on every render the list changes.
  const houseRequirementsCache = useHouseRequirements()
  useEffect(() => {
    for (const project of projects) houseRequirementsCache.ensureLoaded(project.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  function openProject(project: Project) {
    onNavigate('project-workspace', {
      project_id: project.id,
      project_name: project.name,
      project_type: project.type ?? '',
      location: project.location ?? '',
      property_type: project.propertyType ?? '',
      project_stage: project.stage ?? '',
    })
  }

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
                className="flex items-center gap-1.5 h-10 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white"
                style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}
              >
                <IcoBack /> Back
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Your Projects</span>
                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                  {projects.length > 0 ? `${projects.length} project${projects.length === 1 ? '' : 's'}` : 'No projects yet'}
                </h2>
                <p className="text-[13.5px] text-[#68636D] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                  Every project you're part of on Houzeify shows up here — pick one up where you left off.
                </p>
              </div>

              {status === 'idle' || status === 'loading' ? (
                <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading your projects…</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                  <HIcon size={36} />
                  <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No active project yet.</p>
                  <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Projects your builder shares with you will show up here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-7">
                  <ProjectGroup label="Active" projects={activeProjects} onOpen={openProject} />
                  <ProjectGroup label="Completed" projects={completedProjects} onOpen={openProject} />
                </div>
              )}

              {shared.status === 'loading' || shared.status === 'idle' ? null : shared.projects.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] tracking-[0.08em] uppercase text-[#68636D]" style={{ fontFamily: FONT_MONO }}>Shared with you ({shared.projects.length})</span>
                  <div className="flex flex-col gap-3">
                    {shared.projects.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onNavigate(item.customerStatus === 'invited' ? 'dashboard-home' : 'project-overview', {
                          project_id: item.id,
                          project_name: item.name,
                          location: item.location ?? '',
                          project_stage: item.stage ?? '',
                        })}
                        className="w-full flex items-center justify-between gap-3 rounded-[14px] bg-white p-4 text-left cursor-pointer min-h-11"
                        style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                      >
                        <div className="min-w-0">
                          <span className="text-[14.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{item.name}</span>
                          <p className="text-[12.5px] text-[#68636D] m-0 mt-1">{item.customerStatus === 'invited' ? 'Invite pending' : (item.organizationName ?? 'Shared project')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
