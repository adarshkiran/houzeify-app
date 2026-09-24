// ─── Screen 03 / C20 — Company Reports (KEEP polish) ────────────────────────
// PartnerNavRail Reports — organization index of C18 Construction Records.

import { useEffect } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { constructionStages } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import { resolveCompanyRollupPhase } from '@/data/companyRollupPhase'
import { useOrganizationRollup } from '@/data/useOrganizationRollup'
import {
  describeOrganizationReportsError,
  formatBoqRupees,
  getOrganizationReportsSummary,
  type OrganizationReportsProject,
} from '@/data/organizationReportsApi'
import {
  COMPANY_ROLLUP_CANVAS,
  CompanyRollupEmptyProjects,
  CompanyRollupError,
  CompanyRollupLoading,
  CompanyRollupNoOrg,
  companyRollupPrimaryBtnClass,
  companyRollupSecondaryBtnClass,
} from '@/partner/projects/companyRollupShell'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

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
          <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
            {project.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
            <span className="break-words">{stageText}</span>
            {project.location && <span className="break-words">· {project.location}</span>}
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
          className={companyRollupPrimaryBtnClass}
          style={{ backgroundColor: '#722ED1', fontFamily: FONT_BODY }}
        >
          Open Record
        </button>
        <button
          type="button"
          onClick={onOpenProgress}
          className={companyRollupSecondaryBtnClass}
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

  const { summary, loading, error, reload } = useOrganizationRollup(
    organizationId,
    getOrganizationReportsSummary,
    describeOrganizationReportsError,
  )

  if (!isProfessional) return null

  const phase = resolveCompanyRollupPhase({
    hasOrganization: Boolean(currentOrganization),
    loading,
    error,
    projectCount: summary ? summary.projects.length : null,
  })

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
    <div className="h-full flex" style={{ backgroundColor: COMPANY_ROLLUP_CANVAS }}>
      <PartnerNavRail active="reports" onNavigate={onNavigate} organizationId={organizationId ?? undefined} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-[64px] shrink-0 items-center px-6 lg:px-10 bg-white border-b border-[#E3DDD7]">
          <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
            Reports
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-24 md:pb-12 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] tracking-[0.06em] uppercase text-[#722ED1] m-0" style={{ fontFamily: FONT_MONO }}>
                Company Reports
              </p>
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
                {currentOrganization?.name ?? 'Your company'}
              </h2>
              <p className="text-[13.5px] text-[#68636D] m-0 max-w-[580px]" style={{ fontFamily: FONT_BODY }}>
                An index of each project’s Construction Record — stage, progress, documents, and company operations.
              </p>
            </div>

            {phase === 'no-org' && (
              <CompanyRollupNoOrg
                body="Reports belong to your company workspace — set up your organization first."
                onSetup={() => onNavigate('create-organization')}
              />
            )}
            {phase === 'loading' && <CompanyRollupLoading label="Loading company reports…" />}
            {phase === 'error' && (
              <CompanyRollupError
                title="Couldn’t load reports"
                message={error || 'Something went wrong loading company reports. Please try again.'}
                onRetry={reload}
              />
            )}
            {phase === 'empty-projects' && (
              <CompanyRollupEmptyProjects
                body="Create a project to start building Construction Records for your company."
                onCreate={() => onNavigate('create-construction-project')}
              />
            )}
            {phase === 'ready' && summary && (
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
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
