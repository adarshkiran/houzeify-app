import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import ConstructionStageProgression from '@/shared/components/ConstructionStageProgression'
import { useProjectAudience } from '@/data/customerProjectsState'
import { useProjects } from '@/data/projectState'
import { isServerProjectId } from '@/data/projectIds'
import { describeCustomerViewError, getCustomerViewTimeline, type CustomerViewTimelineStage } from '@/data/customerViewApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

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

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [timeline, setTimeline] = useState<CustomerViewTimelineStage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [timelineRefresh, setTimelineRefresh] = useState(0)

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

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="timeline" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ProjectSubNav active="timeline" projectId={projectId} projectName={projectName} variant={variant} onNavigate={onNavigate} />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[820px] mx-auto flex flex-col gap-5 min-w-0">
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Timeline</p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName ?? 'Project'}</h1>
                <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  {variant === 'customer'
                    ? 'Your project’s construction journey — updated when the company advances the project stage.'
                    : 'Timeline follows the project’s overall construction stage. Daily progress entries can tag a different stage for that day’s update.'}
                </p>
              </div>
              {status === 'idle' || status === 'loading' ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading timeline…</p>
              ) : status === 'error' ? (
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
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
                  <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-1" style={{ fontFamily: FONT_HEAD }}>Project construction stage</h2>
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
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
