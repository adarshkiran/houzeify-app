import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { projectStageLabel } from '@/data/homeownerDashboard'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import { useProjects } from '@/data/projectState'
import { useDailyProgress } from '@/data/dailyProgressState'
import { updateDailyProgress } from '@/data/dailyProgressApi'
import { useProjectAudience } from '@/data/customerProjectsState'
import { describeCustomerViewError, listCustomerViewProgress } from '@/data/customerViewApi'
import { constructionStages } from '@/data/constructionStages'
import type { DailyProgress } from '@/data/dailyProgressApi'
import AuthenticatedImage from '@/shared/components/AuthenticatedImage'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 074 — Project Progress ──────────────────────────────────────────
// Shared between the homeowner and professional viewers (reached from
// 068-073 for the homeowner). Answers "how is construction progressing" —
// NOT 073 (Project Tasks), which answers "what needs to be done". Per its
// own explicit rule, task completion is never converted into construction
// progress here. Both roles can view progress here, and (as of Module 04)
// both can create a new Daily Progress entry via the "Add Progress Update"
// action: creation is gated by project-level authorization, not by role —
// getProjectForAccess (reused from Module 03) always authorizes a project's
// own creator, so a homeowner logging progress on their own project is
// legitimate. There is no separate role-based permission system here.
//
// Module 04 / Task 6 — this screen's body is now driven entirely by the
// real daily_progress backend (useDailyProgress). constructionStages.ts
// supplies the stage taxonomy and ordering for the stage strip below; its
// own per-stage `status` field is illustrative demo data only (see that
// file's header comment) and is deliberately never read here — a project's
// real current stage is derived from the latest real Daily Progress entry
// instead.
//
// C12 — removed getAwardedBid / contractorDirectory. Project status comes
// from the canonical Project.status field (or stage fallback), never from
// legacy bid/award/payment state.

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoProgress = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M9 5v4l3 2" /></svg>
)
const IcoPhoto = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="3.5" width="13" height="10" rx="1.5" />
    <circle cx="8" cy="8.5" r="2.4" />
    <path d="M5.5 3.5l1-1.5h3l1 1.5" />
  </svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{label}</p>
      <p className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{value}</p>
    </div>
  )
}

// Resolves a stage value to its display name. A Daily Progress entry's own
// `stage` is always a real constructionStages.ts id, but the `projectStage`
// fallback (used only when no entry exists yet) can instead be a homeowner
// project's LIFECYCLE vocabulary value (e.g. 'contractor-selected') — a
// completely different taxonomy. Mirrors ProjectOverviewScreen.tsx's own
// resolvedStageLabel() exactly: try the real construction-stage taxonomy
// first, then fall back to projectStageLabel()'s lifecycle vocabulary
// (which itself falls back to the raw string as an absolute last resort —
// never silently drops real data).
function stageLabel(stage: string | null | undefined): string | undefined {
  if (!stage) return undefined
  const realStage = constructionStages.find(s => s.id === stage)
  if (realStage) return realStage.name
  return projectStageLabel(stage)
}

type FeedBucketKey = 'today' | 'yesterday' | 'earlier'
const FEED_BUCKET_LABELS: Record<FeedBucketKey, string> = { today: 'Today', yesterday: 'Yesterday', earlier: 'Earlier' }

function feedBucketKey(dateStr: string): FeedBucketKey {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const entryDay = new Date(`${dateStr}T00:00:00`)
  entryDay.setHours(0, 0, 0, 0)
  if (entryDay.getTime() === today.getTime()) return 'today'
  if (entryDay.getTime() === yesterday.getTime()) return 'yesterday'
  return 'earlier'
}

function formatEntryDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  // 'en-IN' to match ProjectOverviewScreen.tsx's own formatDate() — this
  // codebase's established date-format convention — so the same
  // DailyProgress.date reads identically on both screens.
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Module 04 / Task 9 fix round 1 (Finding 5) — server/projects/
// dailyProgress.routes.ts's requireValidId() rejects any non-UUID
// projectId with exactly `HttpError('INVALID_ID', 'Invalid project id.', 400)`.
// CreateProjectScreen.tsx mints local project ids as
// `project-<epoch-ms>-<n>` (never a UUID), so any such project hits this
// 400 on every real Daily Progress fetch — not a genuine network/server
// failure, just a project that will never have real Daily Progress data.
// useDailyProgress (dailyProgressState.ts) only surfaces the raw
// `ApiError.message` string, not its `code`, so matching this exact
// literal is the most reliable signal available here without touching the
// hook (out of scope for this fix). A genuine network/server error
// (NETWORK_ERROR, 5xx, NOT_FOUND, etc.) never produces this exact string,
// so this can't misclassify those.
const INVALID_PROJECT_ID_MESSAGE = 'Invalid project id.'
function isInvalidProjectIdError(message: string | null): boolean {
  return message === INVALID_PROJECT_ID_MESSAGE
}

interface FeedGroup {
  key: FeedBucketKey
  label: string
  entries: DailyProgress[]
}

// `entries` is already sorted newest-first by the backend (Task 3's
// listDailyProgressForProject), so a stable per-bucket partition preserves
// that order within each group — no re-sort needed.
function groupFeedByDate(entries: DailyProgress[]): FeedGroup[] {
  const buckets: Record<FeedBucketKey, DailyProgress[]> = { today: [], yesterday: [], earlier: [] }
  for (const entry of entries) buckets[feedBucketKey(entry.date)].push(entry)
  return (['today', 'yesterday', 'earlier'] as const)
    .filter(key => buckets[key].length > 0)
    .map(key => ({ key, label: FEED_BUCKET_LABELS[key], entries: buckets[key] }))
}

interface ProjectProgressScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
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

export default function ProjectProgressScreen({
  role,
  projectId,
  projectName,
  location,
  projectStage,
  onNavigate,
}: ProjectProgressScreenProps) {
  // Houzeify 2.0 Module 03 — see ProjectWorkspaceScreen.tsx's identical
  // comment: a project can now belong to a company, so a professional
  // must be able to open one of their organization's real projects here
  // too, not just a homeowner.
  const canViewProject = role === 'homeowner' || role === 'professional'
  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])

  const hasProject = Boolean(projectId && projectName)

  const { getProject } = useProjects()
  const projectRecord = projectId ? getProject(projectId) : undefined
  const recordStatus = projectRecord?.status ?? null
  const recordStage = projectRecord?.stage ?? projectStage
  const statusLabel = isProjectStatus(recordStatus)
    ? PROJECT_STATUS_LABELS[recordStatus]
    : (projectStageLabel(recordStage) ?? (recordStatus ? String(recordStatus) : 'Status not set'))

  const audience = useProjectAudience(projectId)
  const isCustomer = audience === 'customer'
  const { status: progressStatus, progress: companyProgress, errorMessage, refresh } = useDailyProgress(isCustomer ? undefined : projectId)
  const [sharedProgress, setSharedProgress] = useState<DailyProgress[]>([])
  const [shareBusyId, setShareBusyId] = useState<string | null>(null)
  const [openPhoto, setOpenPhoto] = useState<{
    title: string
    date: string
    stage: string | null
    fileName: string
    fileAvailable: boolean
    contentUrl: string | null
  } | null>(null)
  // The customer fetch below is independent of useDailyProgress (inert for
  // customers), so it tracks its own loading / error state.
  const [customerStatus, setCustomerStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [customerAttempt, setCustomerAttempt] = useState(0)

  useEffect(() => {
    if (!isCustomer || !projectId) return
    let cancelled = false
    setCustomerStatus('loading')
    setCustomerError(null)
    listCustomerViewProgress(projectId).then(rows => {
      if (cancelled) return
      setSharedProgress(rows.map(row => ({
        id: row.id,
        projectId: row.projectId,
        createdBy: '',
        date: row.date,
        stage: row.stage,
        title: row.title,
        description: row.description,
        photos: row.photos.map(photo => ({
          id: photo.id,
          dailyProgressId: row.id,
          fileName: photo.fileName,
          mimeType: photo.mimeType,
          size: photo.size,
          uploadedBy: '',
          storageRef: '',
          fileAvailable: photo.fileAvailable,
          contentUrl: photo.contentUrl,
          createdAt: photo.createdAt,
        })),
        visibility: 'customer' as const,
        publishedAt: row.publishedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })))
      setCustomerStatus('loaded')
    }).catch(err => {
      if (cancelled) return
      setSharedProgress([])
      setCustomerError(describeCustomerViewError(err))
      setCustomerStatus('error')
    })
    return () => { cancelled = true }
  }, [isCustomer, projectId, customerAttempt])

  useEffect(() => {
    if (!openPhoto) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenPhoto(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPhoto])

  const progress = isCustomer ? sharedProgress : companyProgress
  const latestEntry = progress[0]

  // Per the ticket's own formula: prefer the latest real entry's stage,
  // falling back to the project's own Project.stage only when no entry
  // exists yet at all (not when an entry exists with a null stage).
  const currentStageLabel = latestEntry ? stageLabel(latestEntry.stage) : stageLabel(recordStage)
  const currentStageId = latestEntry ? latestEntry.stage : recordStage
  const currentStageIdx = currentStageId ? constructionStages.findIndex(s => s.id === currentStageId) : -1

  const feedGroups = useMemo(() => groupFeedByDate(progress), [progress])

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'

  function goToWorkspace() {
    onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)
  }

  // Hooks above this point must run on every render (Module 05 Task 8 pattern).
  if (!canViewProject) return null

  if (!hasProject) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
          <button type="button" onClick={goToWorkspace} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            Back to Workspace
          </button>
        </div>
      </div>
    )
  }

  function navTo(dest: string) {
    onNavigate(dest, { project_id: projectId as string })
  }

  const isLoading = isCustomer
    ? customerStatus === 'loading'
    : progressStatus === 'idle' || progressStatus === 'loading'

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">

      <ProjectSubNav
        active="progress"
        projectId={projectId}
        projectName={projectName}
        variant={isCustomer ? 'customer' : 'company'}
        action={!isCustomer ? (
          <button
            type="button"
            onClick={() => onNavigate('create-daily-progress', projectId ? { project_id: projectId } : undefined)}
            className="min-h-11 h-11 px-4 rounded-[10px] text-[13px] font-semibold cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-[#722ED1] focus-visible:ring-offset-2"
            style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
          >
            Add Progress Update
          </button>
        ) : undefined}
        onNavigate={onNavigate}
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[820px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Progress</p>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> {location}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: isProjectStatus(recordStatus) ? '#F3EAFF' : '#F4F0EC', color: isProjectStatus(recordStatus) ? '#722ED1' : '#68636D', fontFamily: FONT_MONO }}>
                {statusLabel.toUpperCase()}
              </span>
              {currentStageLabel && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
                  {currentStageLabel.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Construction-stage strip — position within constructionStages.ts's
              existing order, derived from the latest real entry (or the
              project's own stage when nothing has been logged yet). Reuses
              the same filled-bar visual language as the old "Overall
              Progress" bar, just segmented per stage. */}
          <SectionCard title="Construction Stage">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{currentStageLabel ?? 'Not started yet'}</p>
              {currentStageIdx >= 0 && (
                <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Stage {currentStageIdx + 1} of {constructionStages.length}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {constructionStages.map((s, i) => (
                <div
                  key={s.id}
                  title={s.name}
                  className="flex-1 h-1.5 rounded-full"
                  style={{ backgroundColor: currentStageIdx >= 0 && i <= currentStageIdx ? '#722ED1' : '#F4F0EC' }}
                />
              ))}
            </div>
          </SectionCard>

          {/* Finding 5 fix — a malformed/local project id (e.g. a
              homeowner project that was never given a real backend UUID)
              will never have real Daily Progress data; that's not an
              alarming failure worth a red banner, just the same empty
              state as "no entries yet" (rendered below, since `progress`
              stays [] on any fetch error). A genuine network/server error
              still surfaces here, matching ProjectOverviewScreen.tsx's own
              handling of this exact failure class. */}
          {progressStatus === 'error' && errorMessage && !isInvalidProjectIdError(errorMessage) && (
            <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
              <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{errorMessage}</p>
            </div>
          )}

          {isCustomer && customerStatus === 'error' && customerError && (
            <div className="rounded-[12px] px-4 py-3 flex flex-col items-start gap-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
              <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{customerError}</p>
              <button
                type="button"
                onClick={() => setCustomerAttempt(n => n + 1)}
                className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Progress feed — real Daily Progress entries only, grouped by
              date (Today / Yesterday / Earlier). */}
          {isLoading ? (
            <SectionCard>
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#9A949D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoProgress />
                </span>
                <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Loading progress…</p>
              </div>
            </SectionCard>
          ) : isCustomer && customerStatus === 'error' ? null : progress.length === 0 ? (
            <SectionCard>
              <div className="flex flex-col items-center text-center gap-2 py-8">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#9A949D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoProgress />
                </span>
                <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>{isCustomer ? 'Nothing shared yet' : 'No progress updates yet'}</p>
                <p className="text-[13px] text-[#68636D] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>{isCustomer ? 'Your builder has not published a progress update yet.' : "Start documenting construction progress to build your project's digital record."}</p>
                {!isCustomer && (
                <button
                  type="button"
                  onClick={() => onNavigate('create-daily-progress', projectId ? { project_id: projectId } : undefined)}
                  className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 mt-2"
                  style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                >
                  Add Progress Update
                </button>
                )}
              </div>
            </SectionCard>
          ) : (
            <div className="flex flex-col gap-6">
              {feedGroups.map(group => (
                <SectionCard key={group.key} title={group.label}>
                  <div className="flex flex-col gap-4">
                    {group.entries.map((entry, i) => (
                      <div
                        key={entry.id}
                        className={i < group.entries.length - 1 ? 'pb-4' : ''}
                        style={i < group.entries.length - 1 ? { borderBottom: '1px solid #F4F0EC' } : undefined}
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{entry.title}</p>
                              {stageLabel(entry.stage) && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
                                  {stageLabel(entry.stage)!.toUpperCase()}
                                </span>
                              )}
                            </div>
                            {entry.description && (
                              <p className="text-[12.5px] text-[#68636D] m-0 mt-1 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>{entry.description}</p>
                            )}
                            {entry.photos.length > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center gap-1.5 text-[#9A949D] mb-2">
                                  <IcoPhoto />
                                  <span className="text-[12px]" style={{ fontFamily: FONT_BODY }}>
                                    {entry.photos.length} construction photo{entry.photos.length === 1 ? '' : 's'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {entry.photos.map(photo => (
                                    <button
                                      key={photo.id}
                                      type="button"
                                      onClick={() =>
                                        setOpenPhoto({
                                          title: entry.title,
                                          date: entry.date,
                                          stage: entry.stage,
                                          fileName: photo.fileName,
                                          fileAvailable: photo.fileAvailable,
                                          contentUrl: photo.contentUrl,
                                        })
                                      }
                                      aria-label={`Open construction photo for ${entry.title}`}
                                      className="p-0 border-0 bg-transparent cursor-pointer rounded-[10px] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1] min-h-11"
                                    >
                                      <AuthenticatedImage
                                        contentUrl={photo.fileAvailable ? photo.contentUrl : null}
                                        alt={`Construction evidence: ${entry.title}`}
                                        className="w-full aspect-square object-cover rounded-[10px]"
                                        unavailableLabel={photo.fileAvailable === false ? 'Historical photo unavailable' : 'Photo unavailable'}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-[12px] text-[#9A949D] m-0 shrink-0" style={{ fontFamily: FONT_BODY }}>{formatEntryDate(entry.date)}</p>
                        </div>
                        {!isCustomer && projectId && (
                          <button
                            type="button"
                            disabled={shareBusyId === entry.id}
                            onClick={() => {
                              const next = entry.visibility === 'customer' ? 'internal' : 'customer'
                              setShareBusyId(entry.id)
                              updateDailyProgress(projectId, entry.id, { visibility: next })
                                .then(() => refresh())
                                .finally(() => setShareBusyId(null))
                            }}
                            className="mt-3 h-11 px-3 rounded-[10px] text-[12.5px] font-semibold cursor-pointer border-0"
                            style={{ backgroundColor: entry.visibility === 'customer' ? '#C6F6D5' : '#F3EAFF', color: '#242326', fontFamily: FONT_BODY }}
                          >
                            {entry.visibility === 'customer' ? 'Shared' : 'Share with customer'}
                          </button>
                        )}
                        {isCustomer && (
                          <p className="text-[11px] tracking-[0.04em] uppercase text-[#15803D] m-0 mt-2" style={{ fontFamily: FONT_MONO }}>Shared with you</p>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ))}
            </div>
          )}

          {/* Project summary */}
          <SectionCard title="Project Summary">
            <div className="flex flex-col gap-3">
              <SummaryRow label="Project" value={projectName as string} />
              <SummaryRow label="Status" value={statusLabel} />
              <SummaryRow label="Current Stage" value={currentStageLabel ?? 'Not started yet'} />
              <SummaryRow label="Progress Entries" value={String(progress.length)} />
              <SummaryRow label="Expected Completion" value="Not available" />
            </div>
          </SectionCard>

          {/* Connections — nav-only, no duplicated data */}
          <div className="flex items-center gap-4 flex-wrap">
            {!isCustomer && (
              <button type="button" onClick={() => navTo('project-tasks')} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                View Project Tasks →
              </button>
            )}
            <button type="button" onClick={() => navTo('project-documents')} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Project Documents →
            </button>
            {!isCustomer && (
              <button type="button" onClick={() => navTo('project-team')} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                Project Team →
              </button>
            )}
          </div>
        </div>
      </main>
        </div>
      </div>
      {openPhoto && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="progress-photo-title"
          onClick={e => {
            if (e.target === e.currentTarget) setOpenPhoto(null)
          }}
        >
          <div className="w-full max-w-[520px] rounded-[16px] bg-white p-5 min-w-0">
            <h2 id="progress-photo-title" className="text-[16px] font-semibold m-0" style={{ fontFamily: FONT_HEAD }}>{openPhoto.title}</h2>
            <p className="text-[13px] text-[#68636D] mt-2 mb-3" style={{ fontFamily: FONT_BODY }}>
              {formatEntryDate(openPhoto.date)}
              {stageLabel(openPhoto.stage) ? ` · ${stageLabel(openPhoto.stage)}` : ''}
              {' · Daily progress evidence'}
            </p>
            <AuthenticatedImage
              contentUrl={openPhoto.fileAvailable ? openPhoto.contentUrl : null}
              alt={`Construction evidence: ${openPhoto.title}`}
              className="w-full max-h-[60vh] object-contain rounded-[12px] bg-[#F4F0EC]"
              unavailableLabel={openPhoto.fileAvailable === false ? 'Historical photo unavailable' : 'Photo unavailable'}
            />
            <button
              type="button"
              onClick={() => setOpenPhoto(null)}
              className="mt-4 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
              style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
