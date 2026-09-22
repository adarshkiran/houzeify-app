import { useEffect, useMemo, useState, type ReactNode } from 'react'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useProjects } from '@/data/projectState'
import { useProjectAudience } from '@/data/customerProjectsState'
import { useDailyProgress } from '@/data/dailyProgressState'
import { useTasks } from '@/data/tasksState'
import { useIssues } from '@/data/issuesState'
import { useProjectWorkforce } from '@/data/projectWorkforceState'
import { useProjectDocuments } from '@/data/projectDocumentsState'
import { useProjectBoq } from '@/data/projectBoqState'
import { getProjectCustomer, type ProjectCustomer } from '@/data/projectCustomerApi'
import { getCustomerViewTimeline, type CustomerViewTimelineStage } from '@/data/customerViewApi'
import { stageById } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import { formatInr } from '@/data/boqFormat'
import { isServerProjectId } from '@/data/projectIds'
import { PROJECT_NAV_ROUTES } from '@/data/constructionNav'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5 min-w-0" style={{ border: '1px solid #E3DDD7' }}>
      {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}

function TextLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex items-center min-h-[44px] text-[13px] font-semibold text-[#722ED1] cursor-pointer border-0 bg-transparent p-0"
      style={{ fontFamily: FONT_BODY }}
    >
      {label}
    </button>
  )
}

function SkeletonLines({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
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

function todayIsoDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isPending(status: string): boolean {
  return status === 'idle' || status === 'loading'
}

interface ProjectWorkspaceScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  projectType?: string
  propertyType?: string
  location?: string
  projectStage?: string
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

export default function ProjectWorkspaceScreen({
  role,
  projectId,
  projectName,
  propertyType,
  location,
  projectStage,
  organizationId,
  onNavigate,
}: ProjectWorkspaceScreenProps) {
  const canViewProject = role === 'homeowner' || role === 'professional'
  const isCompany = role === 'professional'
  const serverProject = isServerProjectId(projectId)

  const { status: projectsStatus, getProject, errorMessage: projectsError } = useProjects()
  const audience = useProjectAudience(projectId)
  const record = projectId ? getProject(projectId) : undefined

  const progressHook = useDailyProgress(serverProject ? projectId : undefined)
  const tasksHook = useTasks(serverProject ? projectId : undefined)
  const issuesHook = useIssues(serverProject ? projectId : undefined)
  const workforceHook = useProjectWorkforce(serverProject && isCompany ? projectId : undefined)
  const documentsHook = useProjectDocuments(serverProject ? projectId : undefined)
  const boqHook = useProjectBoq(serverProject ? projectId : undefined)

  const [timelineStatus, setTimelineStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [timeline, setTimeline] = useState<CustomerViewTimelineStage[]>([])
  const [customerStatus, setCustomerStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [customer, setCustomer] = useState<ProjectCustomer | null>(null)

  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])

  useEffect(() => {
    if (!serverProject || !projectId) {
      setTimeline([])
      setTimelineStatus('loaded')
      return
    }
    let cancelled = false
    setTimelineStatus('loading')
    getCustomerViewTimeline(projectId)
      .then(rows => {
        if (!cancelled) {
          setTimeline(rows)
          setTimelineStatus('loaded')
        }
      })
      .catch(() => {
        if (!cancelled) setTimelineStatus('error')
      })
    return () => { cancelled = true }
  }, [serverProject, projectId])

  useEffect(() => {
    if (!serverProject || !projectId || !isCompany) {
      setCustomer(null)
      setCustomerStatus('loaded')
      return
    }
    let cancelled = false
    setCustomerStatus('loading')
    getProjectCustomer(projectId)
      .then(row => {
        if (!cancelled) {
          setCustomer(row)
          setCustomerStatus('loaded')
        }
      })
      .catch(() => {
        if (!cancelled) setCustomerStatus('error')
      })
    return () => { cancelled = true }
  }, [serverProject, projectId, isCompany])

  const name = record?.name ?? projectName
  const loc = record?.location ?? location
  const type = record?.propertyType ?? propertyType
  const stage = record?.stage ?? projectStage
  const status = record?.status ?? null
  const startDate = formatDisplayDate(record?.timelineStart)
  const completionDate = formatDisplayDate(record?.timelineCompletion)
  const resolvedStage = stageName(stage)
  const resolvedStatus = isProjectStatus(status) ? PROJECT_STATUS_LABELS[status] : undefined

  const latestProgress = progressHook.progress[0]
  const latestProgressDate = formatDisplayDate(latestProgress?.date)
  const latestActivity = latestProgressDate ?? formatDisplayDate(record?.updatedAt)

  const activeTasks = useMemo(() => tasksHook.tasks.filter(t => t.status !== 'completed'), [tasksHook.tasks])
  const overdueTasks = useMemo(() => {
    const today = todayIsoDate()
    return activeTasks.filter(t => t.dueDate && t.dueDate < today)
  }, [activeTasks])
  const openIssues = useMemo(() => issuesHook.issues.filter(i => i.status !== 'resolved'), [issuesHook.issues])
  const highOpenIssues = useMemo(() => openIssues.filter(i => i.priority === 'high'), [openIssues])
  const activeWorkforce = useMemo(() => workforceHook.members.filter(m => m.status === 'active'), [workforceHook.members])

  if (!canViewProject) return null

  function goBack() {
    onNavigate(isCompany ? 'company-projects' : 'projects-list', organizationId ? { organization_id: organizationId } : undefined)
  }

  function navTo(dest: string) {
    onNavigate(dest, projectId ? { project_id: projectId } : undefined)
  }

  const hasProject = Boolean(projectId && name)

  if (!hasProject) {
    return (
      <div className="h-full flex min-w-0" style={{ backgroundColor: '#FFFFFF' }}>
        {isCompany
          ? <PartnerNavRail active="projects" onNavigate={onNavigate} organizationId={organizationId} />
          : <Sidebar active="projects" onNavigate={onNavigate} />}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 min-w-0">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0 text-center" style={{ fontFamily: FONT_HEAD }}>No active project yet.</p>
          <p className="text-[13px] text-[#68636D] m-0 max-w-[320px] text-center" style={{ fontFamily: FONT_BODY }}>Open a project from your Projects list to see its workspace.</p>
          <button type="button" onClick={goBack} className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white min-h-[44px]" style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}>
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  const projectMissingAfterLoad = Boolean(projectId && serverProject && projectsStatus === 'loaded' && !record)

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        {isCompany
          ? <PartnerNavRail active="projects" onNavigate={onNavigate} organizationId={organizationId || record?.organizationId || undefined} />
          : <Sidebar active="projects" onNavigate={onNavigate} />}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">

          <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
            <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8 min-w-0">
              <button type="button" onClick={goBack} className="flex items-center gap-1.5 min-h-[44px] text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                <IcoBack /> Back
              </button>
            </div>
          </header>

          <ProjectSubNav active="overview" projectId={projectId} projectName={name} variant={audience === 'customer' ? 'customer' : 'company'} onNavigate={onNavigate} showWorkspaceHeader={false} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 px-4 sm:px-6 py-8">
            <div className="max-w-[1000px] mx-auto flex flex-col gap-6 min-w-0">
              {projectsStatus === 'error' && projectsError && (
                <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                  <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{projectsError}</p>
                </div>
              )}
              {projectMissingAfterLoad && (
                <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                  <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>This project is no longer available.</p>
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Workspace</p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{name}</h1>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap min-w-0">
                  {loc && (
                    <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] min-w-0" style={{ fontFamily: FONT_BODY }}>
                      <IcoMapPin /> <span className="min-w-0 break-words">{loc}</span>
                    </span>
                  )}
                  {type && <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{type}</span>}
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

              <SectionCard title="Project status">
                {isPending(projectsStatus) ? (
                  <SkeletonLines />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                    {resolvedStatus && (
                      <div className="min-w-0">
                        <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Status</p>
                        <p className="text-[15px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{resolvedStatus}</p>
                      </div>
                    )}
                    {resolvedStage && (
                      <div className="min-w-0">
                        <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Construction stage</p>
                        <p className="text-[15px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{resolvedStage}</p>
                      </div>
                    )}
                    {startDate && (
                      <div className="min-w-0">
                        <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Start</p>
                        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{startDate}</p>
                      </div>
                    )}
                    {completionDate && (
                      <div className="min-w-0">
                        <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Expected completion</p>
                        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{completionDate}</p>
                      </div>
                    )}
                    {latestActivity && (
                      <div className="min-w-0">
                        <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Latest activity</p>
                        <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{latestActivity}</p>
                      </div>
                    )}
                    {!resolvedStatus && !resolvedStage && !startDate && !completionDate && !latestActivity && (
                      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No status details are recorded for this project yet.</p>
                    )}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Construction progress">
                {isPending(timelineStatus) ? (
                  <SkeletonLines rows={4} />
                ) : timelineStatus === 'error' ? (
                  <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>Stage progression could not be loaded.</p>
                ) : timeline.length === 0 ? (
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                    {resolvedStage ? `Current stage: ${resolvedStage}. Stage progression is not available yet.` : 'No construction stage has been set yet.'}
                  </p>
                ) : (
                  <ol className="flex flex-col md:flex-row md:overflow-x-auto gap-3 m-0 p-0 list-none min-w-0">
                    {timeline.map(item => {
                      const color = item.state === 'current' ? '#722ED1' : item.state === 'completed' ? '#15803D' : '#68636D'
                      const bg = item.state === 'current' ? '#F8E3BD' : item.state === 'completed' ? '#C6F6D5' : '#F4F0EC'
                      return (
                        <li key={item.id} className="md:min-w-[148px] rounded-[14px] p-4 min-w-0" style={{ backgroundColor: bg }}>
                          <p className="text-[11px] tracking-[0.06em] uppercase m-0" style={{ fontFamily: FONT_MONO, color }}>{item.state}</p>
                          <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1 break-words" style={{ fontFamily: FONT_HEAD }}>{item.name}</p>
                          {item.latestPublishedDate && (
                            <p className="text-[12px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{formatDisplayDate(item.latestPublishedDate)}</p>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                )}
                {latestProgress && (
                  <p className="text-[12.5px] text-[#68636D] m-0 mt-3" style={{ fontFamily: FONT_BODY }}>
                    Latest update{latestProgressDate ? ` ${latestProgressDate}` : ''}: {latestProgress.title}
                  </p>
                )}
                <TextLink label="View timeline →" onClick={() => navTo(PROJECT_NAV_ROUTES.timeline)} />
              </SectionCard>

              <SectionCard title="Latest daily progress">
                {serverProject && isPending(progressHook.status) ? (
                  <SkeletonLines />
                ) : progressHook.status === 'error' ? (
                  <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{progressHook.errorMessage ?? 'Unable to load daily progress.'}</p>
                ) : !latestProgress ? (
                  <>
                    <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No daily progress recorded yet</p>
                    <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Record your first daily update to keep the project construction record up to date.</p>
                    {isCompany && (
                      <button
                        type="button"
                        onClick={() => navTo('create-daily-progress')}
                        className="mt-3 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 min-h-[44px]"
                        style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                      >
                        Add progress update
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{latestProgressDate}</p>
                    <p className="text-[15px] font-semibold text-[#242326] m-0 mt-1 break-words" style={{ fontFamily: FONT_HEAD }}>{latestProgress.title}</p>
                    {stageName(latestProgress.stage) && (
                      <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{stageName(latestProgress.stage)}</p>
                    )}
                    {latestProgress.description && (
                      <p className="text-[13px] text-[#68636D] m-0 mt-2 break-words" style={{ fontFamily: FONT_BODY }}>{latestProgress.description}</p>
                    )}
                    {latestProgress.photos.length > 0 && (
                      <p className="text-[12.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                        {latestProgress.photos.length} photo{latestProgress.photos.length === 1 ? '' : 's'} attached
                      </p>
                    )}
                    <TextLink label="View all progress →" onClick={() => navTo(PROJECT_NAV_ROUTES.progress)} />
                  </>
                )}
              </SectionCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <SectionCard title="Tasks">
                  {serverProject && isPending(tasksHook.status) ? (
                    <SkeletonLines rows={2} />
                  ) : tasksHook.status === 'error' ? (
                    <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{tasksHook.errorMessage ?? 'Unable to load tasks.'}</p>
                  ) : (
                    <>
                      <p className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{activeTasks.length}</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                        {activeTasks.length === 1 ? 'active task' : 'active tasks'}
                        {overdueTasks.length > 0 ? ` · ${overdueTasks.length} overdue` : ''}
                      </p>
                      <TextLink label="Open tasks →" onClick={() => navTo(PROJECT_NAV_ROUTES.tasks)} />
                    </>
                  )}
                </SectionCard>
                <SectionCard title="Issues">
                  {serverProject && isPending(issuesHook.status) ? (
                    <SkeletonLines rows={2} />
                  ) : issuesHook.status === 'error' ? (
                    <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{issuesHook.errorMessage ?? 'Unable to load issues.'}</p>
                  ) : (
                    <>
                      <p className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{openIssues.length}</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                        {openIssues.length === 1 ? 'open issue' : 'open issues'}
                        {highOpenIssues.length > 0 ? ` · ${highOpenIssues.length} high priority` : ''}
                      </p>
                      <TextLink label="Open issues →" onClick={() => navTo(PROJECT_NAV_ROUTES.issues)} />
                    </>
                  )}
                </SectionCard>
              </div>

              {isCompany && (
                <SectionCard title="Workforce">
                  {serverProject && isPending(workforceHook.status) ? (
                    <SkeletonLines />
                  ) : workforceHook.status === 'error' ? (
                    <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{workforceHook.error ?? 'Unable to load workforce.'}</p>
                  ) : activeWorkforce.length === 0 ? (
                    <>
                      <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No site team recorded yet</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Add people to the site team so the project has a live workforce record.</p>
                      <TextLink label="Manage workforce →" onClick={() => navTo(PROJECT_NAV_ROUTES.workforce)} />
                    </>
                  ) : (
                    <>
                      <p className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{activeWorkforce.length}</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                        {activeWorkforce.length === 1 ? 'active site team member' : 'active site team members'}
                      </p>
                      <ul className="mt-3 m-0 pl-5 flex flex-col gap-1">
                        {activeWorkforce.slice(0, 6).map(member => (
                          <li key={member.id} className="text-[13px] text-[#242326] break-words" style={{ fontFamily: FONT_BODY }}>{member.role}</li>
                        ))}
                      </ul>
                      {activeWorkforce.length > 6 && (
                        <p className="text-[12.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>+{activeWorkforce.length - 6} more</p>
                      )}
                      <TextLink label="View workforce →" onClick={() => navTo(PROJECT_NAV_ROUTES.workforce)} />
                    </>
                  )}
                </SectionCard>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <SectionCard title="Documents">
                  {serverProject && isPending(documentsHook.status) ? (
                    <SkeletonLines rows={2} />
                  ) : documentsHook.status === 'error' ? (
                    <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{documentsHook.error ?? 'Unable to load documents.'}</p>
                  ) : (
                    <>
                      <p className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{documentsHook.documents.length}</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                        {documentsHook.documents.length === 1 ? 'document' : 'documents'}
                      </p>
                      <TextLink label="Open documents →" onClick={() => navTo(PROJECT_NAV_ROUTES.documents)} />
                    </>
                  )}
                </SectionCard>
                <SectionCard title="Bill of Quantities">
                  {serverProject && isPending(boqHook.status) ? (
                    <SkeletonLines rows={2} />
                  ) : boqHook.status === 'error' ? (
                    <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{boqHook.error ?? 'Unable to load the Bill of Quantities.'}</p>
                  ) : !boqHook.hasLoaded || boqHook.boq.totals.itemCount === 0 ? (
                    <>
                      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No Bill of Quantities items recorded yet.</p>
                      <TextLink label="Open Bill of Quantities →" onClick={() => navTo(PROJECT_NAV_ROUTES.boq)} />
                    </>
                  ) : (
                    <>
                      <p className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{formatInr(boqHook.boq.totals.total)}</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                        {boqHook.boq.totals.itemCount} {boqHook.boq.totals.itemCount === 1 ? 'item' : 'items'}
                      </p>
                      <TextLink label="Open Bill of Quantities →" onClick={() => navTo(PROJECT_NAV_ROUTES.boq)} />
                    </>
                  )}
                </SectionCard>
              </div>

              {isCompany && (
                <SectionCard title="Customer">
                  {isPending(customerStatus) ? (
                    <SkeletonLines rows={2} />
                  ) : customerStatus === 'error' ? (
                    <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>Customer status could not be loaded.</p>
                  ) : customer?.status === 'active' ? (
                    <>
                      <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Customer connected</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>A homeowner is linked and can see published progress and shared documents.</p>
                    </>
                  ) : customer?.status === 'invited' ? (
                    <>
                      <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Customer invite pending</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>An invite has been sent. They are not connected until they accept.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No customer connected</p>
                      <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Link a homeowner so they can follow published construction progress.</p>
                    </>
                  )}
                  <TextLink label="Manage customer →" onClick={() => navTo(PROJECT_NAV_ROUTES.customer)} />
                </SectionCard>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
