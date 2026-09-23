// ─── Screen 05 — Project Overview (SHARED KEEP polish) ──────────────────────
// Project record / summary — not the operational Workspace hub (Screen 04).
// Company: canonical project via useProjects(). Customer: customer-view header.
// C11 removed bid/contractor/estimate/payment content; do not reintroduce it.

import { useEffect, useState, type ReactNode } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useProjects } from '@/data/projectState'
import { useOrganizations } from '@/data/organizationState'
import { useProjectAudience, useCustomerProjects } from '@/data/customerProjectsState'
import { useDailyProgress } from '@/data/dailyProgressState'
import {
  describeCustomerViewError,
  getCustomerView,
  type CustomerViewHeader,
} from '@/data/customerViewApi'
import { constructionStages, stageById } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import { isServerProjectId } from '@/data/projectIds'
import { PROJECT_NAV_ROUTES } from '@/data/constructionNav'
import { projectTypeLabel } from '@/data/projectOverviewRecord'
import type { Project } from '@/data/projectApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'
const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]'
const TEXT_ACTION = `inline-flex items-center min-h-11 cursor-pointer border-0 bg-transparent p-0 rounded-[6px] text-[13px] font-semibold text-[#722ED1] ${FOCUS_RING}`
const PRIMARY_BTN = `h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 min-h-11 ${FOCUS_RING}`

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5 min-w-0" style={{ border: '1px solid #E3DDD7' }}>
      {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{value?.trim() ? value : 'Not set'}</p>
    </div>
  )
}

function SkeletonLines({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-3 rounded-full bg-[#F4F0EC]" style={{ width: i === rows - 1 ? '55%' : '100%' }} />
      ))}
    </div>
  )
}

function formatDisplayDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function stageName(stage: string | null | undefined): string | undefined {
  if (!stage) return undefined
  return stageById(stage)?.name ?? stage
}

function stageInPlanLabel(stage: string | null | undefined): string {
  if (!stage) return 'Not set'
  const idx = constructionStages.findIndex(item => item.id === stage)
  if (idx < 0) return stageById(stage)?.name ?? stage
  return `Stage ${idx + 1} of ${constructionStages.length} · ${constructionStages[idx].name}`
}

interface ProjectOverviewScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  propertyType?: string
  location?: string
  projectStage?: string
  projectStatus?: string
  timelineStart?: string
  timelineCompletion?: string
  summary?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  professionalType?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  serviceDescription?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

function OverviewChrome({
  isCompanyUser,
  organizationId,
  projectId,
  projectName,
  subNavVariant,
  onNavigate,
  children,
}: {
  isCompanyUser: boolean
  organizationId?: string
  projectId?: string
  projectName?: string
  subNavVariant: 'company' | 'customer'
  onNavigate: (screen: string, data?: Record<string, string>) => void
  children: ReactNode
}) {
  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FBF9F7' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        {isCompanyUser
          ? <PartnerNavRail active="projects" onNavigate={onNavigate} organizationId={organizationId} />
          : <Sidebar active="projects" onNavigate={onNavigate} />}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          {projectId && (
            <ProjectSubNav
              active="overview"
              projectId={projectId}
              projectName={projectName}
              variant={subNavVariant}
              onNavigate={onNavigate}
            />
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

function StageInPlan({
  stage,
  onViewTimeline,
  canUpdateStage,
}: {
  stage: string | null | undefined
  onViewTimeline: () => void
  canUpdateStage?: boolean
}) {
  return (
    <SectionCard title="Stage in Plan">
      <p className="text-[15px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
        {stageInPlanLabel(stage)}
      </p>
      <button type="button" onClick={onViewTimeline} className={`mt-1 ${TEXT_ACTION}`} style={{ fontFamily: FONT_BODY }}>
        {canUpdateStage ? 'View timeline & update stage' : 'View timeline'}
      </button>
    </SectionCard>
  )
}

function CompanyProjectOverview({
  record,
  fallback,
  projectsError,
  projectsPending,
  onRetryProjects,
  isCompanyUser,
  onNavigate,
}: {
  record?: Project
  fallback: {
    projectId?: string
    projectName?: string
    propertyType?: string
    location?: string
    projectStage?: string
    projectStatus?: string
    timelineStart?: string
    timelineCompletion?: string
    summary?: string
    organizationId?: string
  }
  projectsError?: string | null
  projectsPending?: boolean
  onRetryProjects?: () => void
  isCompanyUser: boolean
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const { organizations } = useOrganizations()
  const projectId = record?.id ?? fallback.projectId
  const serverProject = isServerProjectId(projectId)
  const progressHook = useDailyProgress(serverProject ? projectId : undefined)
  const name = record?.name ?? fallback.projectName
  const location = record?.location ?? fallback.location
  const propertyType = record?.propertyType ?? fallback.propertyType
  const constructionType = projectTypeLabel(record?.type)
  const stage = record?.stage ?? fallback.projectStage
  const status = record?.status ?? fallback.projectStatus ?? null
  const startDate = formatDisplayDate(record?.timelineStart ?? fallback.timelineStart)
  const completionDate = formatDisplayDate(record?.timelineCompletion ?? fallback.timelineCompletion)
  const created = formatDisplayDate(record?.createdAt)
  const updated = formatDisplayDate(record?.updatedAt)
  const summary = record?.summary ?? fallback.summary
  const organizationId = record?.organizationId ?? fallback.organizationId
  const organizationName = organizationId ? organizations.find(org => org.id === organizationId)?.name : undefined
  const resolvedStage = stageName(stage)
  const resolvedStatus = isProjectStatus(status) ? PROJECT_STATUS_LABELS[status] : undefined
  const latest = progressHook.progress[0]
  const latestDate = formatDisplayDate(latest?.date)
  const latestStage = stageName(latest?.stage)

  function navTo(dest: string) {
    onNavigate(dest, projectId ? { project_id: projectId } : undefined)
  }

  return (
    <OverviewChrome
      isCompanyUser={isCompanyUser}
      organizationId={organizationId}
      projectId={projectId}
      projectName={name}
      subNavVariant="company"
      onNavigate={onNavigate}
    >
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
        <div className="max-w-[1000px] mx-auto flex flex-col gap-6 min-w-0">
          {projectsError && (
            <div className="rounded-[12px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
              <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{projectsError}</p>
              {onRetryProjects && (
                <button
                  type="button"
                  onClick={onRetryProjects}
                  className={`${PRIMARY_BTN} shrink-0`}
                  style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Overview</p>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
              {projectsPending && !name ? 'Loading project' : (name ?? 'Project')}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap min-w-0">
              {location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] min-w-0" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> <span className="min-w-0 break-words">{location}</span>
                </span>
              )}
              {propertyType && <span className="text-[13px] text-[#68636D] break-words" style={{ fontFamily: FONT_BODY }}>{propertyType}</span>}
              {resolvedStatus && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>
                  {resolvedStatus.toUpperCase()}
                </span>
              )}
              {resolvedStage && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
                  {resolvedStage.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <SectionCard title="Project Details">
            {projectsPending && !record ? (
              <SkeletonLines rows={5} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <Field label="Project Name" value={name} />
                <Field label="Organization" value={organizationName} />
                <Field label="Construction Type" value={constructionType} />
                <Field label="Property Type" value={propertyType} />
                <Field label="Location" value={location} />
                <Field label="Construction Stage" value={resolvedStage} />
                <Field label="Status" value={resolvedStatus} />
                <Field label="Planned Start" value={startDate} />
                <Field label="Expected Completion" value={completionDate} />
                <Field label="Created" value={created} />
                <Field label="Last Updated" value={updated} />
              </div>
            )}
          </SectionCard>

          <SectionCard title="About This Project">
            {projectsPending && !record ? (
              <SkeletonLines rows={2} />
            ) : summary?.trim() ? (
              <p className="text-[13px] text-[#242326] m-0 break-words" style={{ fontFamily: FONT_BODY }}>{summary}</p>
            ) : (
              <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No project description added.</p>
            )}
          </SectionCard>

          <StageInPlan stage={stage} onViewTimeline={() => navTo(PROJECT_NAV_ROUTES.timeline)} canUpdateStage={isCompanyUser} />

          <SectionCard title="Latest Progress Update">
            {serverProject && (progressHook.status === 'idle' || progressHook.status === 'loading') ? (
              <SkeletonLines rows={3} />
            ) : progressHook.status === 'error' ? (
              <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }} role="alert">
                {progressHook.errorMessage ?? 'Unable to load the latest progress update.'}
              </p>
            ) : !latest ? (
              <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No daily progress recorded yet.</p>
            ) : (
              <>
                <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{latestDate}</p>
                <p className="text-[15px] font-semibold text-[#242326] m-0 mt-1 break-words" style={{ fontFamily: FONT_HEAD }}>{latest.title}</p>
                {latestStage && (
                  <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{latestStage}</p>
                )}
                <button type="button" onClick={() => navTo(PROJECT_NAV_ROUTES.progress)} className={`mt-1 ${TEXT_ACTION}`} style={{ fontFamily: FONT_BODY }}>
                  View progress
                </button>
              </>
            )}
          </SectionCard>
        </div>
      </main>
    </OverviewChrome>
  )
}

function CustomerOverview({
  projectId,
  header,
  status,
  errorMessage,
  onRetry,
  onNavigate,
}: {
  projectId?: string
  header: CustomerViewHeader | null
  status: 'idle' | 'loading' | 'loaded' | 'error'
  errorMessage: string | null
  onRetry?: () => void
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  function navTo(dest: string) {
    onNavigate(dest, projectId ? { project_id: projectId } : undefined)
  }

  const latest = header?.latestProgress
  const latestDate = formatDisplayDate(latest?.date)
  const latestStage = stageName(latest?.stage)
  const resolvedStatus = header && isProjectStatus(header.status) ? PROJECT_STATUS_LABELS[header.status] : undefined
  const hasAnyDetail = Boolean(
    header?.name || header?.organizationName || header?.location || header?.propertyType || header?.status || header?.stage
    || header?.timelineStart || header?.timelineCompletion,
  )

  return (
    <OverviewChrome
      isCompanyUser={false}
      projectId={projectId}
      projectName={header?.name}
      subNavVariant="customer"
      onNavigate={onNavigate}
    >
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
        <div className="max-w-[1000px] mx-auto flex flex-col gap-6 min-w-0">
          {status === 'error' && (
            <div className="rounded-[12px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
              <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{errorMessage ?? 'This project could not be loaded.'}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`${PRIMARY_BTN} shrink-0`}
                  style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Overview</p>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
              {status === 'loading' || status === 'idle' ? 'Loading project' : (header?.name ?? 'Shared project')}
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap min-w-0">
              {header?.location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] min-w-0" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> <span className="min-w-0 break-words">{header.location}</span>
                </span>
              )}
              {header?.propertyType && <span className="text-[13px] text-[#68636D] break-words" style={{ fontFamily: FONT_BODY }}>{header.propertyType}</span>}
              {resolvedStatus && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>
                  {resolvedStatus.toUpperCase()}
                </span>
              )}
              {stageName(header?.stage) && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
                  {stageName(header?.stage)!.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <SectionCard title="Project Details">
            {status === 'idle' || status === 'loading' ? (
              <SkeletonLines />
            ) : !hasAnyDetail ? (
              <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No project details have been shared with you yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <Field label="Project" value={header?.name} />
                <Field label="Builder" value={header?.organizationName} />
                <Field label="Location" value={header?.location} />
                <Field label="Property Type" value={header?.propertyType} />
                <Field label="Status" value={resolvedStatus} />
                <Field label="Stage" value={stageName(header?.stage)} />
                <Field label="Start" value={formatDisplayDate(header?.timelineStart)} />
                <Field label="Expected Completion" value={formatDisplayDate(header?.timelineCompletion)} />
              </div>
            )}
          </SectionCard>

          <StageInPlan stage={header?.stage} onViewTimeline={() => navTo(PROJECT_NAV_ROUTES.timeline)} />

          <SectionCard title="Latest Shared Update">
            {status === 'idle' || status === 'loading' ? (
              <SkeletonLines rows={3} />
            ) : !latest ? (
              <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No updates shared yet.</p>
            ) : (
              <>
                <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{latestDate}</p>
                <p className="text-[15px] font-semibold text-[#242326] m-0 mt-1 break-words" style={{ fontFamily: FONT_HEAD }}>{latest.title}</p>
                {latestStage && (
                  <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{latestStage}</p>
                )}
                <button type="button" onClick={() => navTo(PROJECT_NAV_ROUTES.progress)} className={`mt-1 ${TEXT_ACTION}`} style={{ fontFamily: FONT_BODY }}>
                  View progress
                </button>
              </>
            )}
          </SectionCard>
        </div>
      </main>
    </OverviewChrome>
  )
}

export default function ProjectOverviewScreen({
  role,
  projectId,
  projectName,
  propertyType,
  location,
  projectStage,
  projectStatus,
  timelineStart,
  timelineCompletion,
  summary,
  organizationId,
  onNavigate,
}: ProjectOverviewScreenProps) {
  const canViewProject = role === 'homeowner' || role === 'professional'
  const isCompanyUser = role === 'professional'
  const serverProject = isServerProjectId(projectId)

  const { status: projectsStatus, getProject, errorMessage: projectsError, refreshProjects } = useProjects()
  const customerProjects = useCustomerProjects()
  const audience = useProjectAudience(projectId)
  const record = projectId ? getProject(projectId) : undefined

  const [customerStatus, setCustomerStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [customerHeader, setCustomerHeader] = useState<CustomerViewHeader | null>(null)
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [customerRefresh, setCustomerRefresh] = useState(0)

  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])

  useEffect(() => {
    if (audience !== 'customer' || !projectId || !serverProject) {
      setCustomerHeader(null)
      setCustomerError(null)
      setCustomerStatus('idle')
      return
    }
    let cancelled = false
    setCustomerStatus('loading')
    getCustomerView(projectId)
      .then(row => {
        if (!cancelled) {
          setCustomerHeader(row)
          setCustomerStatus('loaded')
        }
      })
      .catch(err => {
        if (!cancelled) {
          setCustomerHeader(null)
          setCustomerError(describeCustomerViewError(err))
          setCustomerStatus('error')
        }
      })
    return () => { cancelled = true }
  }, [audience, projectId, serverProject, customerRefresh])

  const listsPending =
    projectsStatus === 'idle' || projectsStatus === 'loading'
    || customerProjects.status === 'idle' || customerProjects.status === 'loading'

  if (!canViewProject) return null

  if (audience === 'unknown' && listsPending) {
    return (
      <div className="flex flex-col h-full min-w-0" style={{ backgroundColor: '#FBF9F7' }}>
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
          <div className="max-w-[1000px] mx-auto flex flex-col gap-6 min-w-0">
            <SkeletonLines rows={6} />
          </div>
        </main>
      </div>
    )
  }

  if (audience === 'invited') {
    return (
      <OverviewChrome isCompanyUser={false} projectId={undefined} subNavVariant="customer" onNavigate={onNavigate}>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 min-w-0 pb-24 md:pb-6">
          <HIcon size={36} />
          <h1 className="text-[18px] font-semibold text-[#242326] m-0 text-center" style={{ fontFamily: FONT_HEAD }}>Project not available yet</h1>
          <p className="text-[13px] text-[#68636D] m-0 max-w-[320px] text-center" style={{ fontFamily: FONT_BODY }}>
            This project is not available until the invite is accepted.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('projects-list')}
            className={PRIMARY_BTN}
            style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
          >
            Back to Projects
          </button>
        </main>
      </OverviewChrome>
    )
  }

  if (audience === 'customer') {
    return (
      <CustomerOverview
        projectId={projectId}
        header={customerHeader}
        status={customerStatus === 'idle' ? 'loading' : customerStatus}
        errorMessage={customerError}
        onRetry={() => setCustomerRefresh(n => n + 1)}
        onNavigate={onNavigate}
      />
    )
  }

  const localLegacy = Boolean(projectId && !serverProject && (record || projectName))
  if (audience === 'unknown' && !localLegacy) {
    return (
      <OverviewChrome isCompanyUser={isCompanyUser} organizationId={organizationId} projectId={undefined} subNavVariant="company" onNavigate={onNavigate}>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 min-w-0 pb-24 md:pb-6">
          <HIcon size={36} />
          <h1 className="text-[18px] font-semibold text-[#242326] m-0 text-center" style={{ fontFamily: FONT_HEAD }}>This project is no longer available.</h1>
          <button
            type="button"
            onClick={() => onNavigate(isCompanyUser ? 'company-projects' : 'projects-list', organizationId ? { organization_id: organizationId } : undefined)}
            className={PRIMARY_BTN}
            style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
          >
            Back to Projects
          </button>
        </main>
      </OverviewChrome>
    )
  }

  if (serverProject && projectsStatus === 'loaded' && !record) {
    return (
      <OverviewChrome isCompanyUser={isCompanyUser} organizationId={organizationId} projectId={undefined} subNavVariant="company" onNavigate={onNavigate}>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 min-w-0 pb-24 md:pb-6">
          <HIcon size={36} />
          <h1 className="text-[18px] font-semibold text-[#242326] m-0 text-center" style={{ fontFamily: FONT_HEAD }}>This project is no longer available.</h1>
          <button
            type="button"
            onClick={() => onNavigate(isCompanyUser ? 'company-projects' : 'projects-list', organizationId ? { organization_id: organizationId } : undefined)}
            className={PRIMARY_BTN}
            style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
          >
            Back to Projects
          </button>
        </main>
      </OverviewChrome>
    )
  }

  return (
    <CompanyProjectOverview
      record={record}
      fallback={{
        projectId,
        projectName,
        propertyType,
        location,
        projectStage,
        projectStatus,
        timelineStart,
        timelineCompletion,
        summary,
        organizationId,
      }}
      projectsError={projectsStatus === 'error' ? projectsError : null}
      projectsPending={projectsStatus === 'idle' || projectsStatus === 'loading'}
      onRetryProjects={() => { void refreshProjects() }}
      isCompanyUser={isCompanyUser}
      onNavigate={onNavigate}
    />
  )
}
