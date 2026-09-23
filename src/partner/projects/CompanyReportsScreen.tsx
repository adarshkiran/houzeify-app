// ─── C20 — Company Reports / Construction Record Index ─────────────────────
// PartnerNavRail Reports — organization index of C18 Construction Records.
// Replaces Coming Soon for `company-reports`. Deep-links into Record + Progress.

import { useEffect, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { constructionStages } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import {
  describeOrganizationReportsError,
  formatBoqRupees,
  getOrganizationReportsSummary,
  type OrganizationReportsProject,
  type OrganizationReportsSummary,
} from '@/data/organizationReportsApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

function stageLabel(stage: string | null, fallbackName?: string | null): string {
  if (fallbackName) return fallbackName
  if (!stage) return 'Stage not set'
  return constructionStages.find(s => s.id === stage)?.name ?? stage
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 min-w-[72px]">
      <span className="text-[10.5px] tracking-[0.06em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>
        {label}
      </span>
      <span className="text-[17px] sm:text-[18px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
        {value}
      </span>
    </div>
  )
}

function ProjectReportCard({
  project,
  onOpenRecord,
  onOpenProgress,
}: {
  project: OrganizationReportsProject
  onOpenRecord: () => void
  onOpenProgress: () => void
}) {
  const status = isProjectStatus(project.status) ? PROJECT_STATUS_LABELS[project.status] : null
  const stageText =
    project.stageIndex != null
      ? `Stage ${project.stageIndex} of ${project.stageTotal} · ${stageLabel(project.stage, project.stageName)}`
      : stageLabel(project.stage, project.stageName)

  return (
    <article className="rounded-[14px] bg-white p-4 sm:p-5 flex flex-col gap-4" style={{ border: '1px solid #E3DDD7' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-1">
          <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#242326] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>
            {project.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
            <span>{stageText}</span>
            {project.location && <span>· {project.location}</span>}
          </div>
        </div>
        {status && (
          <span
            className="shrink-0 px-2 py-1 rounded-full text-[10.5px] font-semibold tracking-[0.03em]"
            style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}
          >
            {status.toUpperCase()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Updates" value={project.progress.totalCount} />
        <Stat label="Shared" value={project.progress.publishedCount} />
        <Stat label="Photos" value={project.progress.photoCount} />
        <Stat label="Videos" value={project.progress.videoCount} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-[12px] px-3 py-3" style={{ backgroundColor: '#FAF8F6' }}>
        <Stat label="Documents" value={project.documents.totalActive} />
        <Stat label="Docs shared" value={project.documents.sharedWithCustomer} />
        <Stat label="Workforce" value={project.workforceActiveCount} />
        <Stat
          label="BOQ"
          value={project.operations.boqItemCount > 0 ? formatBoqRupees(project.operations.boqTotalAmountPaise) : '—'}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
        <span>
          Tasks open {project.operations.tasksOpen} / {project.operations.tasksTotal}
        </span>
        <span>
          Issues open {project.operations.issuesOpen} / {project.operations.issuesTotal}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenRecord}
          className="min-h-[44px] px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
          style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
        >
          Open Record
        </button>
        <button
          type="button"
          onClick={onOpenProgress}
          className="min-h-[44px] px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer"
          style={{ backgroundColor: 'white', color: '#722ED1', border: '1px solid #D4C4F0', fontFamily: FONT_BODY }}
        >
          Open Progress
        </button>
      </div>
    </article>
  )
}

export default function CompanyReportsScreen({
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
  const currentOrganization = organizations.currentOrganization
  const organizationId = currentOrganization?.id ?? null

  const [summary, setSummary] = useState<OrganizationReportsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!organizationId) {
      setSummary(null)
      setError(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getOrganizationReportsSummary(organizationId)
      .then(row => {
        if (!cancelled) {
          setSummary(row)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setSummary(null)
          setError(describeOrganizationReportsError(err))
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [organizationId])

  if (!isProfessional) return null

  function openProject(project: OrganizationReportsProject, screen: 'project-reports' | 'project-progress') {
    onNavigate(screen, {
      project_id: project.id,
      project_name: project.name,
      project_type: project.type ?? '',
      location: project.location ?? '',
      property_type: project.propertyType ?? '',
      project_stage: project.stage ?? '',
      project_status: project.status ?? '',
      organization_id: organizationId ?? '',
      company_name: currentOrganization?.name ?? summary?.organizationName ?? '',
    })
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <PartnerNavRail active="reports" onNavigate={onNavigate} organizationId={organizationId ?? undefined} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-[64px] shrink-0 items-center px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
          <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
            Reports
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-12 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>
                Construction Records
              </span>
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                {currentOrganization?.name ?? 'Your company'}
              </h2>
              <p className="text-[13.5px] text-[#68636D] m-0 max-w-[580px]" style={{ fontFamily: FONT_BODY }}>
                An index of each project’s Construction Record — stage, progress, documents, and company operations.
              </p>
            </div>

            {!currentOrganization ? (
              <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Organization information unavailable.
                </p>
                <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
                  Reports belong to your company workspace — set up your organization first.
                </p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                  Loading company reports…
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }} role="alert">
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Couldn’t load reports
                </p>
                <p className="text-[13px] text-[#68636D] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                  {error}
                </p>
              </div>
            ) : summary && summary.projects.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-4 rounded-[16px] bg-white p-10" style={{ border: '1px solid #E3DDD7' }}>
                <HIcon size={36} />
                <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                  No construction projects yet.
                </p>
                <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>
                  Create a project to start building Construction Records for your company.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('create-construction-project')}
                  className="min-h-[44px] px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                  style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                >
                  Create Project
                </button>
              </div>
            ) : summary ? (
              <>
                <section
                  className="rounded-[14px] bg-white p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                  style={{ border: '1px solid #E3DDD7' }}
                  aria-label="Company construction record totals"
                >
                  <Stat label="Projects" value={summary.totals.projectCount} />
                  <Stat label="Updates" value={summary.totals.progressUpdates} />
                  <Stat label="Shared updates" value={summary.totals.sharedProgress} />
                  <Stat label="Photos / Videos" value={`${summary.totals.photos} / ${summary.totals.videos}`} />
                  <Stat label="Documents" value={summary.totals.activeDocuments} />
                  <Stat label="Docs shared" value={summary.totals.sharedDocuments} />
                  <Stat label="Open tasks" value={summary.totals.openTasks} />
                  <Stat label="Open issues" value={summary.totals.openIssues} />
                </section>

                <div className="flex flex-col gap-4">
                  {summary.projects.map(project => (
                    <ProjectReportCard
                      key={project.id}
                      project={project}
                      onOpenRecord={() => openProject(project, 'project-reports')}
                      onOpenProgress={() => openProject(project, 'project-progress')}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
