import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useProjectAudience } from '@/data/customerProjectsState'
import { isServerProjectId } from '@/data/projectIds'
import { PROJECT_NAV_ROUTES } from '@/data/constructionNav'
import { formatInr } from '@/data/boqFormat'
import { stageById } from '@/data/constructionStages'
import {
  describeConstructionRecordError,
  getConstructionRecord,
  type ConstructionRecord,
} from '@/data/constructionRecordApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]'

function stageLabel(stage: string | null | undefined): string {
  if (!stage) return 'Not set'
  return stageById(stage)?.name ?? stage
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[16px] bg-white p-5 min-w-0 print:break-inside-avoid" style={{ border: '1px solid #E3DDD7' }}>
      <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[15px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{value}</p>
    </div>
  )
}

export default function ProjectConstructionRecordScreen({
  projectId,
  projectName,
  role,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  role?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const audience = useProjectAudience(projectId)
  const variant = audience === 'customer' ? 'customer' : 'company'
  const isCompany = role === 'professional' || variant === 'company'
  const serverProject = isServerProjectId(projectId)

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [record, setRecord] = useState<ConstructionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadRecord = useCallback(async () => {
    if (!serverProject || !projectId) {
      setStatus('loaded')
      setRecord(null)
      setError(null)
      return
    }
    setStatus('loading')
    setError(null)
    try {
      const row = await getConstructionRecord(projectId)
      setRecord(row)
      setStatus('loaded')
    } catch (err) {
      setRecord(null)
      setError(describeConstructionRecordError(err))
      setStatus('error')
    }
  }, [serverProject, projectId])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (!serverProject || !projectId) {
        if (!cancelled) {
          setStatus('loaded')
          setRecord(null)
          setError(null)
        }
        return
      }
      if (!cancelled) {
        setStatus('loading')
        setError(null)
      }
      try {
        const row = await getConstructionRecord(projectId)
        if (!cancelled) {
          setRecord(row)
          setStatus('loaded')
        }
      } catch (err) {
        if (!cancelled) {
          setRecord(null)
          setError(describeConstructionRecordError(err))
          setStatus('error')
        }
      }
    })()
    return () => { cancelled = true }
  }, [serverProject, projectId])

  function navTo(dest: string) {
    onNavigate(dest, projectId ? { project_id: projectId } : undefined)
  }

  const linkClass = `mt-3 inline-flex items-center min-h-[44px] text-[13px] font-semibold text-[#722ED1] cursor-pointer border-0 bg-transparent p-0 print:hidden ${FOCUS_RING}`

  const chrome = (
    <>
      {isCompany && variant === 'company' ? (
        <PartnerNavRail active="projects" onNavigate={onNavigate} />
      ) : (
        <Sidebar active="documents" onNavigate={onNavigate} />
      )}
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <ProjectSubNav
          active="reports"
          projectId={projectId}
          projectName={projectName}
          variant={variant}
          onNavigate={onNavigate}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
          <div className="max-w-[880px] mx-auto flex flex-col gap-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>
                  Construction Record
                </p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>
                  {record?.project.name ?? projectName ?? 'Project'}
                </h1>
                <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  {variant === 'customer'
                    ? 'A shared summary of your project’s construction record — progress, documents, and stage.'
                    : 'Assembled from this project’s live construction record. Internal ops stay company-only.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={status !== 'loaded' || !record}
                className={`inline-flex items-center justify-center min-h-[44px] px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 print:hidden shrink-0 ${FOCUS_RING}`}
                style={{
                  backgroundColor: '#722ED1',
                  color: 'white',
                  fontFamily: FONT_BODY,
                  opacity: status !== 'loaded' || !record ? 0.5 : 1,
                  cursor: status !== 'loaded' || !record ? 'not-allowed' : 'pointer',
                }}
              >
                Print / Save PDF
              </button>
            </div>

            <p className="text-[12px] text-[#68636D] m-0 -mt-2 print:hidden" style={{ fontFamily: FONT_BODY }}>
              Print uses your browser’s print dialog. This is not a separate PDF export service.
            </p>

            {!serverProject ? (
              <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                Construction Record is available for server projects only.
              </p>
            ) : status === 'idle' || status === 'loading' ? (
              <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading construction record…</p>
            ) : status === 'error' ? (
              <div
                className="rounded-[12px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}
                role="alert"
              >
                <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
                <button
                  type="button"
                  onClick={() => { void loadRecord() }}
                  className={`h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 shrink-0 ${FOCUS_RING}`}
                  style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                >
                  Try again
                </button>
              </div>
            ) : !record ? (
              <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No construction record is available.</p>
            ) : (
              <>
                <Section title="Project">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                    <Stat label="Organization" value={record.project.organizationName ?? '—'} />
                    <Stat label="Location" value={record.project.location ?? '—'} />
                    <Stat label="Property type" value={record.project.propertyType ?? '—'} />
                    <Stat label="Status" value={record.project.status ?? '—'} />
                    <Stat
                      label="Project stage"
                      value={
                        record.stage.index
                          ? `Stage ${record.stage.index} of ${record.stage.total} · ${record.stage.currentName ?? '—'}`
                          : stageLabel(record.project.stage)
                      }
                    />
                    <Stat label="Planned start" value={formatDate(record.project.timelineStart)} />
                    <Stat label="Expected completion" value={formatDate(record.project.timelineCompletion)} />
                    <Stat label="Generated" value={formatDate(record.generatedAt)} />
                  </div>
                  {record.audience === 'company' && record.project.summary?.trim() && (
                    <p className="text-[13px] text-[#242326] m-0 mt-4 break-words" style={{ fontFamily: FONT_BODY }}>
                      {record.project.summary}
                    </p>
                  )}
                </Section>

                <Section title="Stage journey">
                  <ol className="flex flex-col md:flex-row md:overflow-x-auto gap-3 m-0 p-0 list-none min-w-0" aria-label="Construction stage journey">
                    {record.timeline.map(item => {
                      const color = item.state === 'current' ? '#722ED1' : item.state === 'completed' ? '#15803D' : '#68636D'
                      const bg = item.state === 'current' ? '#F8E3BD' : item.state === 'completed' ? '#C6F6D5' : '#F4F0EC'
                      return (
                        <li key={item.id} className="md:min-w-[140px] rounded-[14px] p-3 min-w-0" style={{ backgroundColor: bg }}>
                          <p className="text-[11px] tracking-[0.06em] uppercase m-0" style={{ fontFamily: FONT_MONO, color }}>{item.state}</p>
                          <p className="text-[13px] font-semibold text-[#242326] m-0 mt-1 break-words" style={{ fontFamily: FONT_HEAD }}>{item.name}</p>
                        </li>
                      )
                    })}
                  </ol>
                  <button type="button" onClick={() => navTo(PROJECT_NAV_ROUTES.timeline)} className={linkClass} style={{ fontFamily: FONT_BODY }}>
                    Open Timeline →
                  </button>
                </Section>

                <Section title="Daily progress & evidence">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 min-w-0 mb-4">
                    <Stat label="Updates" value={record.progress.totalCount} />
                    <Stat label="Shared with customer" value={record.progress.publishedCount} />
                    <Stat label="Photos" value={record.progress.photoCount} />
                    <Stat label="Videos" value={record.progress.videoCount} />
                  </div>
                  {record.progress.recent.length === 0 ? (
                    <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No progress updates in this record yet.</p>
                  ) : (
                    <ul className="m-0 p-0 list-none flex flex-col gap-3">
                      {record.progress.recent.map(item => (
                        <li key={item.id} className="min-w-0" style={{ borderTop: '1px solid #F4F0EC', paddingTop: 12 }}>
                          <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                            {formatDate(item.date)} · {stageLabel(item.stage)}
                            {item.visibility ? ` · ${item.visibility}` : ''}
                          </p>
                          <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1 break-words" style={{ fontFamily: FONT_HEAD }}>{item.title}</p>
                          <p className="text-[12px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                            {item.photoCount} photo{item.photoCount === 1 ? '' : 's'} · {item.videoCount} video{item.videoCount === 1 ? '' : 's'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button type="button" onClick={() => navTo(PROJECT_NAV_ROUTES.progress)} className={linkClass} style={{ fontFamily: FONT_BODY }}>
                    Open Progress →
                  </button>
                </Section>

                <Section title="Documents">
                  <div className="grid grid-cols-2 gap-4 min-w-0 mb-4">
                    <Stat label={record.audience === 'customer' ? 'Shared documents' : 'Active documents'} value={record.documents.totalActive} />
                    {record.audience === 'company' && (
                      <Stat label="Shared with customer" value={record.documents.sharedWithCustomer} />
                    )}
                  </div>
                  {record.documents.recent.length === 0 ? (
                    <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No documents in this record yet.</p>
                  ) : (
                    <ul className="m-0 p-0 list-none flex flex-col gap-2">
                      {record.documents.recent.map(doc => (
                        <li key={doc.id} className="min-w-0">
                          <p className="text-[14px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{doc.title}</p>
                          <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                            {doc.category} · {doc.fileName}{doc.visibility ? ` · ${doc.visibility}` : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button type="button" onClick={() => navTo(PROJECT_NAV_ROUTES.documents)} className={linkClass} style={{ fontFamily: FONT_BODY }}>
                    Open Documents →
                  </button>
                </Section>

                <Section title="Workforce">
                  <Stat label="Active site team" value={record.workforce.activeCount} />
                  {record.workforce.members.length === 0 ? (
                    <p className="text-[13px] text-[#68636D] m-0 mt-3" style={{ fontFamily: FONT_BODY }}>No active workforce members listed.</p>
                  ) : (
                    <ul className="m-0 mt-3 p-0 list-none flex flex-col gap-2">
                      {record.workforce.members.map((member, i) => (
                        <li key={`${member.displayName}-${member.role}-${i}`} className="text-[13px] text-[#242326] break-words" style={{ fontFamily: FONT_BODY }}>
                          <span className="font-semibold" style={{ fontFamily: FONT_HEAD }}>{member.displayName}</span>
                          <span className="text-[#68636D]"> · {member.role}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                {record.audience === 'company' && record.operations && (
                  <Section title="Operations (company only)">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
                      <div>
                        <p className="text-[12px] text-[#68636D] m-0 mb-2" style={{ fontFamily: FONT_MONO }}>TASKS</p>
                        <Stat label="Open" value={record.operations.tasks.open} />
                        <p className="text-[12px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                          {record.operations.tasks.completed} completed · {record.operations.tasks.total} total
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] text-[#68636D] m-0 mb-2" style={{ fontFamily: FONT_MONO }}>ISSUES</p>
                        <Stat label="Open" value={record.operations.issues.open} />
                        <p className="text-[12px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                          {record.operations.issues.highOpen} high priority · {record.operations.issues.total} total
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] text-[#68636D] m-0 mb-2" style={{ fontFamily: FONT_MONO }}>BILL OF QUANTITIES</p>
                        <Stat
                          label="Amount"
                          value={formatInr(record.operations.boq.totalAmountPaise / 100)}
                        />
                        <p className="text-[12px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
                          {record.operations.boq.itemCount} items · {record.operations.boq.sectionCount} sections
                        </p>
                      </div>
                    </div>
                  </Section>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FBF9F7' }}>
      <div className="flex flex-1 min-h-0 relative z-10">{chrome}</div>
    </div>
  )
}
