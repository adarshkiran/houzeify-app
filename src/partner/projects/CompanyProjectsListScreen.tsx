// ─── Company Projects List — Houzeify 2.0 Module 03 ─────────────────────────
// The real canonical entry point for PartnerNavRail's "Projects" item —
// replaces the Module 01 ComingSoonScreen placeholder ('company-projects')
// now that a real organization-scoped project backend exists (see
// server/projects/project.service.ts's listProjectsForOrganization() and
// this screen's own data source, useProjects(), which is organization-aware
// as of this module — src/data/projectState.tsx). Lists only the active
// organization's real projects — never another organization's, never a
// fabricated one to make the screen look populated. Reuses the exact visual
// pattern already established by the homeowner ProjectsListScreen (card
// list, empty state, "Create a Project" CTA) rather than inventing a new
// one — only the nav shell (PartnerNavRail instead of Sidebar) and the
// status/stage source (the project's own real `status`/`stage` fields,
// never the homeowner-only resolveProjectStatus() bid/agreement/payment
// derivation, which has no meaning for a company project) differ.

import { useEffect } from 'react'
import HIcon from '@/shared/components/HIcon'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { useProjects } from '@/data/projectState'
import type { Project } from '@/data/projectApi'
import { constructionStages } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const PROJECT_TYPE_LABELS: Record<string, string> = {
  'new-build': 'New Build',
  renovation: 'Renovation',
}

function stageLabel(stage: string | null): string | undefined {
  if (!stage) return undefined
  return constructionStages.find(s => s.id === stage)?.name ?? stage
}

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4l5 5-5 5" /></svg>
)

function ProjectRow({ project, onClick }: { project: Project; onClick: () => void }) {
  const status = isProjectStatus(project.status) ? PROJECT_STATUS_LABELS[project.status] : null
  const stage = stageLabel(project.stage)
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
          {project.type && PROJECT_TYPE_LABELS[project.type] && (
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
              {PROJECT_TYPE_LABELS[project.type].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {stage && <span className="text-[12.5px] text-[#68636D]">{stage}</span>}
          {project.location && (
            <span className="flex items-center gap-1 text-[12.5px] text-[#68636D]">
              <IcoMapPin /> {project.location}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap" style={{ backgroundColor: status ? '#F3EAFF' : '#F4F0EC', color: status ? '#722ED1' : '#9A949D', fontFamily: FONT_MONO }}>
          {(status ?? 'STATUS NOT SET').toUpperCase()}
        </span>
        <span className="text-[#9A949D]"><IcoChevronRight /></span>
      </div>
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
  const { status, projects } = useProjects()
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
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <PartnerNavRail active="projects" onNavigate={onNavigate} organizationId={currentOrganization?.id} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-[64px] shrink-0 items-center justify-between px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
          <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Projects</h1>
          {currentOrganization && (
            <button
              type="button"
              onClick={startNewProject}
              className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
              style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
            >
              Create Project
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>
                {currentOrganization ? currentOrganization.name : 'Your Projects'}
              </span>
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                {projects.length > 0 ? `${projects.length} project${projects.length === 1 ? '' : 's'}` : 'No construction projects yet'}
              </h2>
              <p className="text-[13.5px] text-[#68636D] m-0 max-w-[520px]" style={{ fontFamily: FONT_BODY }}>
                Every construction project your company creates shows up here.
              </p>
            </div>

            {!currentOrganization ? (
              <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Organization information unavailable.</p>
                <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Projects belong to your company workspace — set up your organization first.</p>
              </div>
            ) : status === 'idle' || status === 'loading' ? (
              <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading your projects…</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No construction projects yet.</p>
                <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Create your first construction project to start building your project record.</p>
                <button
                  type="button"
                  onClick={startNewProject}
                  className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                  style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map(project => (
                  <ProjectRow key={project.id} project={project} onClick={() => openProject(project)} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
