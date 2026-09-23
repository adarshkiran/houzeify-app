import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import ConstructionStageProgression from '@/shared/components/ConstructionStageProgression'
import { useProjectAudience } from '@/data/customerProjectsState'
import { useProjects } from '@/data/projectState'
import { isServerProjectId } from '@/data/projectIds'
import { describeCustomerViewError, getCustomerViewTimeline, type CustomerViewTimelineStage } from '@/data/customerViewApi'
import {
  describeProjectActivityError,
  formatActivityKind,
  formatActivityWhen,
  getProjectActivity,
  type ProjectActivityEvent,
  type ProjectActivityFeed,
} from '@/data/projectActivityApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

function ActivityList({ events, audience }: { events: ProjectActivityEvent[]; audience: 'company' | 'customer' }) {
  if (events.length === 0) {
    return (
      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
        {audience === 'customer'
          ? 'No shared construction activity yet. Shared progress, evidence, and documents will appear here.'
          : 'No construction activity recorded yet for this project.'}
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-3 m-0 p-0 list-none">
      {events.map(event => (
        <li
          key={event.id}
          className="rounded-[14px] bg-white p-4 flex flex-col gap-1.5 min-w-0"
          style={{ border: '1px solid #E3DDD7' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[10.5px] tracking-[0.06em] uppercase text-[#722ED1]"
              style={{ fontFamily: FONT_MONO }}
            >
              {formatActivityKind(event.kind)}
            </span>
            {event.visibility === 'customer' && (
              <span className="text-[10.5px] tracking-[0.04em] uppercase text-[#15803D]" style={{ fontFamily: FONT_MONO }}>
                Shared
              </span>
            )}
            {event.visibility === 'internal' && audience === 'company' && (
              <span className="text-[10.5px] tracking-[0.04em] uppercase text-[#68636D]" style={{ fontFamily: FONT_MONO }}>
                Internal
              </span>
            )}
          </div>
          <p className="text-[15px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
            {event.title}
          </p>
          {event.summary && (
            <p className="text-[13px] text-[#68636D] m-0 break-words" style={{ fontFamily: FONT_BODY }}>
              {event.summary}
            </p>
          )}
          <p className="text-[12px] text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>
            {formatActivityWhen(event.occurredAt)}
          </p>
        </li>
      ))}
    </ol>
  )
}

export default function ProjectTimelineScreen({
  projectId,
  projectName,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const audience = useProjectAudience(projectId)
  const variant = audience === 'customer' ? 'customer' : 'company'
  const { getProject } = useProjects()
  const record = projectId ? getProject(projectId) : undefined
  const canEditStage = variant === 'company' && isServerProjectId(projectId)
  const organizationId = record?.organizationId ?? undefined

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [timeline, setTimeline] = useState<CustomerViewTimelineStage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [timelineRefresh, setTimelineRefresh] = useState(0)

  const [activityStatus, setActivityStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [activity, setActivity] = useState<ProjectActivityFeed | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setStatus('loading')
    getCustomerViewTimeline(projectId)
      .then(rows => {
        if (!cancelled) {
          setTimeline(rows)
          setStatus('loaded')
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(describeCustomerViewError(err))
          setStatus('error')
        }
      })
    return () => { cancelled = true }
  }, [projectId, timelineRefresh])

  useEffect(() => {
    if (!projectId || !isServerProjectId(projectId)) {
      setActivity(null)
      setActivityStatus('idle')
      setActivityError(null)
      return
    }
    let cancelled = false
    setActivityStatus('loading')
    setActivityError(null)
    getProjectActivity(projectId)
      .then(feed => {
        if (!cancelled) {
          setActivity(feed)
          setActivityStatus('loaded')
        }
      })
      .catch(err => {
        if (!cancelled) {
          setActivity(null)
          setActivityError(describeProjectActivityError(err))
          setActivityStatus('error')
        }
      })
    return () => { cancelled = true }
  }, [projectId, timelineRefresh])

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        {variant === 'company' ? (
          <PartnerNavRail active="projects" onNavigate={onNavigate} organizationId={organizationId} />
        ) : (
          <Sidebar active="timeline" onNavigate={onNavigate} />
        )}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ProjectSubNav active="timeline" projectId={projectId} projectName={projectName} variant={variant} onNavigate={onNavigate} />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[820px] mx-auto flex flex-col gap-8 min-w-0">
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Timeline</p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName ?? 'Project'}</h1>
                <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  {variant === 'customer'
                    ? 'Construction stage journey and shared project activity from the Digital Construction Record.'
                    : 'Construction stage journey plus chronological project activity from progress, evidence, tasks, issues, documents, and workforce.'}
                </p>
              </div>

              <section aria-labelledby="c24-stage-heading" className="flex flex-col gap-4">
                <h2 id="c24-stage-heading" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                  Construction stages
                </h2>
                {status === 'idle' || status === 'loading' ? (
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading timeline…</p>
                ) : status === 'error' ? (
                  <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }} role="alert">{error}</p>
                ) : timeline.length === 0 ? (
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No timeline stages yet for this project.</p>
                ) : (
                  <ol className="flex flex-col md:flex-row md:overflow-x-auto gap-3 m-0 p-0 list-decimal md:list-none">
                    {timeline.map(stage => {
                      const color = stage.state === 'current' ? '#722ED1' : stage.state === 'completed' ? '#15803D' : '#68636D'
                      const bg = stage.state === 'current' ? '#F8E3BD' : stage.state === 'completed' ? '#C6F6D5' : '#F4F0EC'
                      return (
                        <li key={stage.id} className="md:min-w-[160px] rounded-[14px] p-4" style={{ backgroundColor: bg }}>
                          <p className="text-[11px] tracking-[0.06em] uppercase m-0" style={{ fontFamily: FONT_MONO, color }}>{stage.state}</p>
                          <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{stage.name}</p>
                          {stage.latestPublishedDate && (
                            <p className="text-[12px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{stage.latestPublishedDate}</p>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                )}
                {canEditStage && projectId && (
                  <div className="rounded-[16px] bg-white p-5 min-w-0" style={{ border: '1px solid #E3DDD7' }}>
                    <h3 className="text-[13px] font-semibold text-[#242326] m-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Project construction stage</h3>
                    <p className="text-[13px] text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_BODY }}>
                      Changing this updates the Timeline customers see. It does not rewrite stages on past daily progress entries.
                    </p>
                    <ConstructionStageProgression
                      projectId={projectId}
                      currentStage={record?.stage}
                      onStageChanged={() => setTimelineRefresh(n => n + 1)}
                    />
                  </div>
                )}
              </section>

              <section aria-labelledby="c24-activity-heading" className="flex flex-col gap-4">
                <div>
                  <h2 id="c24-activity-heading" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                    Project activity
                  </h2>
                  <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                    {variant === 'customer'
                      ? 'Shared progress, evidence, and documents in chronological order. Company-only tasks and issues are not shown.'
                      : 'Chronological construction history from real project records. Not a Live Site feed or message inbox.'}
                  </p>
                </div>
                {!isServerProjectId(projectId) ? (
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                    Activity history is available for server-backed construction projects.
                  </p>
                ) : activityStatus === 'idle' || activityStatus === 'loading' ? (
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading project activity…</p>
                ) : activityStatus === 'error' ? (
                  <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }} role="alert">{activityError}</p>
                ) : (
                  <ActivityList events={activity?.events ?? []} audience={variant} />
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
