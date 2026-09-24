// ─── Screen 03 / C23 / S14 — Company Site Operations ────────────────────────
// PartnerNavRail Site Operations — organization index of open tasks & issues.
// S14: client filters (project / type / status / overdue) + project jump UX.
// Read-only — no attendance, checklists, GPS, or Live Site. C23 API unchanged.

import { useEffect, useMemo, useState } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { constructionStages } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import { resolveCompanyRollupPhase } from '@/data/companyRollupPhase'
import { useOrganizationRollup } from '@/data/useOrganizationRollup'
import {
  describeOrganizationOpsError,
  formatOpsPriority,
  formatOpsStatus,
  getOrganizationOpsSummary,
  type OrganizationOpsProject,
  type OrganizationOpsTask,
} from '@/data/organizationOpsApi'
import {
  collectOpsStatuses,
  countFilteredOpenWork,
  DEFAULT_OPS_FILTERS,
  filterOpsProjects,
  isTaskOverdue,
  type FilteredOpsProject,
  type OpsFilterState,
  type OpsWorkTypeFilter,
} from '@/data/companySiteOpsFilters'
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

function stageLabel(stage: string | null): string {
  if (!stage) return 'Stage not set'
  return constructionStages.find(s => s.id === stage)?.name ?? stage
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 min-w-[72px]">
      <span className="text-[10.5px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>
        {label}
      </span>
      <span className="text-[17px] sm:text-[18px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
        {value}
      </span>
    </div>
  )
}

function selectClassName() {
  return 'min-h-11 h-11 px-3 rounded-[10px] border border-[#E3DDD7] bg-white text-[13px] text-[#242326] outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] cursor-pointer'
}

function OpsFiltersBar({
  projects,
  statuses,
  filters,
  onChange,
  resultCount,
}: {
  projects: OrganizationOpsProject[]
  statuses: string[]
  filters: OpsFilterState
  onChange: (next: OpsFilterState) => void
  resultCount: { tasks: number; issues: number; overdue: number }
}) {
  const hasActive =
    filters.projectId !== 'all'
    || filters.type !== 'all'
    || filters.status !== 'all'
    || filters.overdueOnly

  return (
    <section
      className="rounded-[14px] bg-white p-4 sm:p-5 flex flex-col gap-3"
      style={{ border: '1px solid #E3DDD7' }}
      aria-label="Filter open work"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-[12px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>
          Filters
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_OPS_FILTERS)}
            className="min-h-11 px-3 rounded-[10px] border-0 bg-transparent text-[13px] font-medium text-[#722ED1] cursor-pointer hover:underline"
            style={{ fontFamily: FONT_BODY }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Project</span>
          <select
            className={selectClassName()}
            style={{ fontFamily: FONT_BODY }}
            value={filters.projectId}
            onChange={e => onChange({ ...filters, projectId: e.target.value as OpsFilterState['projectId'] })}
            aria-label="Filter by project"
          >
            <option value="all">All projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Type</span>
          <select
            className={selectClassName()}
            style={{ fontFamily: FONT_BODY }}
            value={filters.type}
            onChange={e => onChange({ ...filters, type: e.target.value as OpsWorkTypeFilter })}
            aria-label="Filter by work type"
          >
            <option value="all">Tasks &amp; issues</option>
            <option value="tasks">Tasks only</option>
            <option value="issues">Issues only</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Status</span>
          <select
            className={selectClassName()}
            style={{ fontFamily: FONT_BODY }}
            value={filters.status}
            onChange={e => onChange({ ...filters, status: e.target.value as OpsFilterState['status'] })}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{formatOpsStatus(s)}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 min-h-11 mt-auto cursor-pointer">
          <input
            type="checkbox"
            className="size-5 accent-[#722ED1] cursor-pointer"
            checked={filters.overdueOnly}
            onChange={e => onChange({ ...filters, overdueOnly: e.target.checked })}
            aria-label="Show overdue tasks only"
          />
          <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>
            Overdue tasks only
          </span>
        </label>
      </div>

      <p className="text-[12.5px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }} aria-live="polite">
        Showing {resultCount.tasks} task{resultCount.tasks === 1 ? '' : 's'}
        {' · '}
        {resultCount.issues} issue{resultCount.issues === 1 ? '' : 's'}
        {resultCount.overdue > 0 ? ` · ${resultCount.overdue} overdue` : ''}
      </p>
    </section>
  )
}

function TaskMeta({ task }: { task: OrganizationOpsTask }) {
  const overdue = isTaskOverdue(task)
  return (
    <span className="text-[12px] text-[#68636D] shrink-0 flex flex-wrap items-center gap-1.5" style={{ fontFamily: FONT_BODY }}>
      <span>{formatOpsStatus(task.status)} · {formatOpsPriority(task.priority)}</span>
      {task.dueDate && (
        <span className={overdue ? 'font-semibold text-[#DC2626]' : ''}>
          · Due {task.dueDate}{overdue ? ' · Overdue' : ''}
        </span>
      )}
    </span>
  )
}

function ProjectOpsCard({
  project,
  onOpenProject,
  onOpenTasks,
  onOpenIssues,
  onOpenRecord,
}: {
  project: FilteredOpsProject
  onOpenProject: () => void
  onOpenTasks: () => void
  onOpenIssues: () => void
  onOpenRecord: () => void
}) {
  const status = isProjectStatus(project.status) ? PROJECT_STATUS_LABELS[project.status] : null
  const openTotal = project.openTaskCount + project.openIssueCount

  return (
    <article className="rounded-[14px] bg-[var(--hz-surface)] p-4 sm:p-5 flex flex-col gap-4" style={{ border: '1px solid var(--hz-border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-1">
          <button
            type="button"
            onClick={onOpenProject}
            className="text-left border-0 bg-transparent p-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] rounded-[6px]"
            aria-label={`Open project ${project.name}`}
          >
            <h2
              className="text-[16px] sm:text-[17px] font-semibold text-[var(--hz-ink)] m-0 break-words hover:text-[var(--hz-primary)] transition-colors"
              style={{ fontFamily: FONT_HEAD }}
            >
              {project.name}
            </h2>
          </button>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
            <span>{stageLabel(project.stage)}</span>
            {project.location && <span className="break-words">· {project.location}</span>}
            {project.overdueTaskCount > 0 && (
              <span className="font-semibold text-[var(--hz-danger)]">
                · {project.overdueTaskCount} overdue
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {status && (
            <span
              className="px-2 py-1 rounded-full text-[10.5px] font-semibold tracking-[0.03em]"
              style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)', fontFamily: FONT_MONO }}
            >
              {status.toUpperCase()}
            </span>
          )}
          <span className="text-[12px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>
            {openTotal} open
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-[12px] px-3 py-3" style={{ backgroundColor: '#FAF8F6' }}>
        <Stat label="Open tasks" value={project.openTaskCount} />
        <Stat label="Open issues" value={project.openIssueCount} />
        <Stat label="High issues" value={project.highOpenIssueCount} />
      </div>

      {project.filteredTasks.length === 0 && project.filteredIssues.length === 0 ? (
        <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
          No open tasks or issues match the current filters on this project.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {project.filteredTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>
                Open tasks
              </h3>
              <ul className="m-0 p-0 list-none flex flex-col gap-2" aria-label={`Open tasks on ${project.name}`}>
                {project.filteredTasks.map(task => (
                  <li
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 rounded-[12px] px-3 py-3 min-h-[44px]"
                    style={{
                      backgroundColor: isTaskOverdue(task) ? '#FEF2F2' : '#FAF8F6',
                      border: isTaskOverdue(task) ? '1px solid #FECACA' : undefined,
                    }}
                  >
                    <span className="text-[14px] font-semibold text-[var(--hz-ink)] break-words min-w-0" style={{ fontFamily: FONT_HEAD }}>
                      {task.title}
                    </span>
                    <TaskMeta task={task} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.filteredIssues.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>
                Open issues
              </h3>
              <ul className="m-0 p-0 list-none flex flex-col gap-2" aria-label={`Open issues on ${project.name}`}>
                {project.filteredIssues.map(issue => (
                  <li
                    key={issue.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 rounded-[12px] px-3 py-3 min-h-[44px]"
                    style={{ backgroundColor: '#FAF8F6' }}
                  >
                    <span className="text-[14px] font-semibold text-[var(--hz-ink)] break-words min-w-0" style={{ fontFamily: FONT_HEAD }}>
                      {issue.title}
                    </span>
                    <span className="text-[12px] text-[var(--hz-ink-muted)] shrink-0" style={{ fontFamily: FONT_BODY }}>
                      {formatOpsStatus(issue.status)} · {formatOpsPriority(issue.priority)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenProject}
          className={companyRollupPrimaryBtnClass}
          style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
        >
          Open Project
        </button>
        <button
          type="button"
          onClick={onOpenTasks}
          className={companyRollupSecondaryBtnClass}
          style={{ backgroundColor: 'white', color: '#722ED1', border: '1px solid #D4C4F0', fontFamily: FONT_BODY }}
        >
          Open Tasks
        </button>
        <button
          type="button"
          onClick={onOpenIssues}
          className={companyRollupSecondaryBtnClass}
          style={{ backgroundColor: 'white', color: 'var(--hz-primary)', border: '1px solid #D4C4F0', fontFamily: FONT_BODY }}
        >
          Open Issues
        </button>
        <button
          type="button"
          onClick={onOpenRecord}
          className={companyRollupSecondaryBtnClass}
          style={{ backgroundColor: 'white', color: 'var(--hz-primary)', border: '1px solid #D4C4F0', fontFamily: FONT_BODY }}
        >
          Open Record
        </button>
      </div>
    </article>
  )
}

export default function CompanyOpenWorkScreen({
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
    getOrganizationOpsSummary,
    describeOrganizationOpsError,
  )

  const [filters, setFilters] = useState<OpsFilterState>(DEFAULT_OPS_FILTERS)

  const statuses = useMemo(
    () => (summary ? collectOpsStatuses(summary.projects) : []),
    [summary],
  )

  const filteredProjects = useMemo(
    () => (summary ? filterOpsProjects(summary, filters) : []),
    [summary, filters],
  )

  const resultCount = useMemo(
    () => countFilteredOpenWork(filteredProjects),
    [filteredProjects],
  )

  if (!isProfessional) return null

  const phase = resolveCompanyRollupPhase({
    hasOrganization: Boolean(currentOrganization),
    loading,
    error,
    projectCount: summary ? summary.projects.length : null,
  })

  function openProject(
    project: OrganizationOpsProject,
    screen: 'project-overview' | 'project-tasks' | 'project-issues' | 'project-reports',
  ) {
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
      <PartnerNavRail active="site-operations" onNavigate={onNavigate} organizationId={organizationId ?? undefined} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-[64px] shrink-0 items-center px-6 lg:px-10 bg-[var(--hz-surface)] border-b border-[var(--hz-border)]">
          <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
            Site Operations
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="max-w-[880px] mx-auto px-5 sm:px-8 lg:px-10 pt-8 pb-24 md:pb-12 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] tracking-[0.06em] uppercase text-[var(--hz-primary)] m-0" style={{ fontFamily: FONT_MONO }}>
                Site Operations
              </p>
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-[var(--hz-ink)] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
                {currentOrganization?.name ?? 'Your company'}
              </h2>
              <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0 max-w-[580px]" style={{ fontFamily: FONT_BODY }}>
                Open tasks and issues across every project in this organization. Filter by project, type, status, or overdue due dates. Attendance, checklists, and Live Site are not part of this view.
              </p>
            </div>

            {phase === 'no-org' && (
              <CompanyRollupNoOrg
                body="Site operations belong to your company workspace — set up your organization first."
                onSetup={() => onNavigate('create-organization')}
              />
            )}
            {phase === 'loading' && <CompanyRollupLoading label="Loading site operations…" />}
            {phase === 'error' && (
              <CompanyRollupError
                title="Couldn’t load site operations"
                message={error || 'Something went wrong loading site operations. Please try again.'}
                onRetry={reload}
              />
            )}
            {phase === 'empty-projects' && (
              <CompanyRollupEmptyProjects
                body="Create a project to track open tasks and issues for your company."
                onCreate={() => onNavigate('create-construction-project')}
              />
            )}
            {phase === 'ready' && summary && (
              <>
                <section
                  className="rounded-[14px] bg-[var(--hz-surface)] p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
                  style={{ border: '1px solid var(--hz-border)' }}
                  aria-label="Company open work totals"
                >
                  <Stat label="Projects" value={summary.totals.projectCount} />
                  <Stat label="With open work" value={summary.totals.projectsWithOpenWork} />
                  <Stat label="Open tasks" value={summary.totals.openTasks} />
                  <Stat label="Open issues" value={summary.totals.openIssues} />
                  <Stat label="High issues" value={summary.totals.highOpenIssues} />
                </section>

                <OpsFiltersBar
                  projects={summary.projects}
                  statuses={statuses}
                  filters={filters}
                  onChange={setFilters}
                  resultCount={resultCount}
                />

                {summary.totals.openTasks + summary.totals.openIssues === 0 ? (
                  <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-[var(--hz-surface)] p-8" style={{ border: '1px solid var(--hz-border)' }}>
                    <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>
                      No open tasks or issues.
                    </p>
                    <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                      Open a project’s Tasks or Issues screen to create work items. Open items will appear here across the company.
                    </p>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white p-8" style={{ border: '1px solid #E3DDD7' }}>
                    <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                      No matching open work.
                    </p>
                    <p className="text-[13px] text-[#68636D] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>
                      Try clearing filters or choosing a different project, type, or status.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFilters(DEFAULT_OPS_FILTERS)}
                      className={companyRollupSecondaryBtnClass}
                      style={{ backgroundColor: 'white', color: '#722ED1', border: '1px solid #D4C4F0', fontFamily: FONT_BODY }}
                    >
                      Clear filters
                    </button>
                  </div>
                ) : null}

                <div className="flex flex-col gap-4">
                  {filteredProjects.map(project => (
                    <ProjectOpsCard
                      key={project.id}
                      project={project}
                      onOpenProject={() => openProject(project, 'project-overview')}
                      onOpenTasks={() => openProject(project, 'project-tasks')}
                      onOpenIssues={() => openProject(project, 'project-issues')}
                      onOpenRecord={() => openProject(project, 'project-reports')}
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
