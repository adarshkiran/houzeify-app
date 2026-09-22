import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useTasks } from '@/data/tasksState'
import type { ConstructionTask, TaskPriority, TaskStatus } from '@/data/tasksApi'
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_PRIORITIES, TASK_PRIORITY_LABELS, describeTaskError } from '@/data/tasksApi'
import { constructionStages } from '@/data/constructionStages'
import { listOrganizationMembers, type OrganizationMember } from '@/data/organizationApi'
import { useAuth } from '@/data/authState'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 073 — Project Tasks ─────────────────────────────────────────────
// A HOMEOWNER/professional screen reached from 068-072 and from Project
// Workspace's own sub-nav. Simple work-item tracking for ONE project — not
// a Gantt chart, not a scheduling engine.
//
// Module 05 / Task 7 — this screen's body is now driven entirely by the
// real construction_tasks backend (useTasks, from tasksState.ts) instead of
// the old in-memory src/data/projectTasks.ts fixture store. Status/priority
// vocabulary, the `stage` field and the assignee identity now all come from
// the real backend contract (tasksApi.ts) rather than a hand-rolled model.
// Every task is scoped to the real projectId already threaded since 060 —
// never proj-001/DEFAULT_PROJECT_ID. No tasks are ever auto-generated from
// project type/BOQ/estimate/stage — the list is only ever what a real
// create() call has produced.
//
// Assignee picker scoping (Concern, see task-7-report.md): the project
// owner's userId is not among this screen's own props (App.tsx passes
// fullName/preferredName for display, never an id), so the picker cannot
// safely offer "the owner" as a distinct assignable option without
// inventing a prop. It is scoped to the project's real organization
// membership only (listOrganizationMembers, when organizationId is
// present) — the realistic company-project case this module targets.
// Member identity display follows this module's established convention
// (already shipped in TeamManagementScreen.tsx): "You" for the current
// user's own id, "Member <first 8 chars of id>" otherwise — never a
// fabricated display name.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoCheck = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IcoTasks = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="12" height="12" rx="2" /><path d="M6 9l2 2 4-4" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

const PRIORITY_COLORS: Record<TaskPriority, { bg: string; fg: string }> = {
  low: { bg: '#CAC7C6', fg: '#808080' },
  medium: { bg: '#FEF3C7', fg: '#D97706' },
  high: { bg: '#FEE2E2', fg: '#DC2626' },
}

// Established convention (TeamManagementScreen.tsx) — the backend never
// joins a member row to a real display name, so a member identity is
// always rendered as "You" (the caller's own id) or a short id fragment,
// never free text.
function memberLabel(candidateUserId: string, currentUserId: string): string {
  return candidateUserId === currentUserId ? 'You' : `Member ${candidateUserId.slice(0, 8)}`
}

// Mirrors ProjectProgressScreen.tsx's own formatEntryDate()/'en-IN'
// convention so a due date reads identically across the project's screens.
function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Resolves a task's `stage` (a constructionStages.ts id) to its display
// name, falling back to the raw value on an unrecognized id — never
// silently drops real data.
function stageLabel(stage: string | null | undefined): string | undefined {
  if (!stage) return undefined
  return constructionStages.find(s => s.id === stage)?.name ?? stage
}

type FilterTab = 'all' | TaskStatus

interface ProjectTasksScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  location?: string
  fullName?: string
  preferredName?: string
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

export default function ProjectTasksScreen({
  role,
  userId,
  projectId,
  projectName,
  location,
  organizationId,
  onNavigate,
}: ProjectTasksScreenProps) {
  // Houzeify 2.0 Module 03 — see ProjectWorkspaceScreen.tsx's identical
  // comment: a project can now belong to a company, so a professional
  // must be able to open one of their organization's real projects here
  // too, not just a homeowner.
  const canViewProject = role === 'homeowner' || role === 'professional'
  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])

  const hasProject = Boolean(projectId && projectName)
  const auth = useAuth()
  const currentUserId = auth.user?.id || userId || CURRENT_USER_ID

  const { status: tasksStatus, tasks, errorMessage, create, update: updateTaskApi } = useTasks(projectId)

  // Assignable members — real organization roster only (see Concern in the
  // header comment above). listOrganizationMembers is a plain async
  // function, matching TeamManagementScreen.tsx's own direct-call pattern,
  // not a new global hook.
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([])
  useEffect(() => {
    if (!organizationId) {
      setOrgMembers([])
      return
    }
    let cancelled = false
    listOrganizationMembers(organizationId)
      .then(members => { if (!cancelled) setOrgMembers(members) })
      .catch(() => { if (!cancelled) setOrgMembers([]) })
    return () => { cancelled = true }
  }, [organizationId])

  const [filter, setFilter] = useState<FilterTab>('all')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [stage, setStage] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [titleError, setTitleError] = useState<string | undefined>()
  const [createError, setCreateError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'
  const inputClass = 'w-full h-10 px-3 rounded-[10px] text-[13.5px] outline-none'
  const inputStyle = { border: '1px solid #E3DDD7', fontFamily: FONT_BODY, backgroundColor: 'white' }

  function goToWorkspace() {
    onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)
  }

  // All hooks above this point must run on every render — see Module 05
  // Task 8 fix-round-1: these two early returns previously sat between
  // hook calls, which is a Rules-of-Hooks violation (a changing
  // canViewProject value across renders of the same mounted instance would
  // change how many hooks ran). Both guards now sit after every hook.
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

  const isLoading = tasksStatus === 'idle' || tasksStatus === 'loading'

  const counts: Record<FilterTab, number> = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  const visibleTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  function resetForm() {
    setTitle('')
    setDescription('')
    setAssigneeId('')
    setStage('')
    setDueDate('')
    setPriority('')
    setTitleError(undefined)
    setCreateError(null)
  }

  async function handleCreate() {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('Title is required.')
      return
    }
    if (!projectId) {
      setCreateError('No project selected.')
      return
    }
    try {
      await create({
        title: trimmedTitle,
        description: description.trim() || undefined,
        stage: stage || undefined,
        priority: priority || undefined,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
      })
      resetForm()
      setShowForm(false)
    } catch (err) {
      setCreateError(describeTaskError(err))
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    setActionError(null)
    try {
      await updateTaskApi(taskId, { status })
    } catch (err) {
      setActionError(describeTaskError(err))
    }
  }

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    ...TASK_STATUSES.map(s => ({ id: s as FilterTab, label: TASK_STATUS_LABELS[s] })),
  ]

  const bannerError = errorMessage || actionError

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">

      <ProjectSubNav active="tasks" projectId={projectId} projectName={projectName} onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[820px] mx-auto flex flex-col gap-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Tasks</p>
              <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
              {location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> {location}
                </span>
              )}
              <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Track work items and responsibilities for this project.</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowForm(s => !s); setCreateError(null) }}
              className={selectClass}
              style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
            >
              + New Task
            </button>
          </div>

          {/* New task form */}
          {showForm && (
            <SectionCard title="New Task">
              <div className="flex flex-col gap-3">
                <div>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Task title"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setTitleError(undefined) }}
                  />
                  {titleError && <p className="text-[12px] text-[#DC2626] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{titleError}</p>}
                </div>
                <textarea
                  className="w-full px-3 py-2 rounded-[10px] text-[13.5px] outline-none resize-none"
                  style={{ ...inputStyle, height: 72 }}
                  placeholder="Description (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <select className={inputClass} style={inputStyle} value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                    <option value="">Assign to (optional)</option>
                    {orgMembers.map(m => (
                      <option key={m.userId} value={m.userId}>{memberLabel(m.userId, currentUserId)}</option>
                    ))}
                  </select>
                  <select className={inputClass} style={inputStyle} value={stage} onChange={e => setStage(e.target.value)}>
                    <option value="">Stage (optional)</option>
                    {constructionStages.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className={inputClass}
                    style={inputStyle}
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                  <select className={inputClass} style={inputStyle} value={priority} onChange={e => setPriority(e.target.value as TaskPriority | '')}>
                    <option value="">Priority (optional)</option>
                    {TASK_PRIORITIES.map(p => (
                      <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                {createError && <p className="text-[12.5px] text-[#DC2626] m-0" style={{ fontFamily: FONT_BODY }}>{createError} <button type="button" onClick={handleCreate} className="underline cursor-pointer border-0 bg-transparent p-0 text-[#DC2626]">Try again</button></p>}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleCreate} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                    Create Task
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                    Cancel
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {bannerError && (
            <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
              <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{bannerError}</p>
            </div>
          )}

          {/* Summary + filters — doubles as the summary row: each tab
              carries its own live count (Total/To Do/In Progress/Blocked/
              Completed), so a separate stat-tile row would only repeat the
              same numbers. */}
          {!isLoading && tasks.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filterTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className="h-8 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border-0"
                  style={{
                    fontFamily: FONT_BODY,
                    backgroundColor: filter === tab.id ? '#722ED1' : '#CAC7C6',
                    color: filter === tab.id ? 'white' : '#808080',
                  }}
                >
                  {tab.label} {counts[tab.id]}
                </button>
              ))}
            </div>
          )}

          {/* Task list */}
          {isLoading ? (
            <SectionCard>
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#9A949D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoTasks />
                </span>
                <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Loading tasks…</p>
              </div>
            </SectionCard>
          ) : tasks.length === 0 ? (
            <SectionCard>
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#9A949D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoTasks />
                </span>
                <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>No tasks yet</p>
                <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Start tracking the work that needs to happen on this project.</p>
                <button type="button" onClick={() => setShowForm(true)} className={`${selectClass} mt-2`} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                  Add Task
                </button>
              </div>
            </SectionCard>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleTasks.map(task => (
                <TaskCard key={task.id} task={task} currentUserId={currentUserId} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, currentUserId, onStatusChange }: { task: ConstructionTask; currentUserId: string; onStatusChange: (id: string, status: TaskStatus) => void }) {
  const isCompleted = task.status === 'completed'
  const stageName = stageLabel(task.stage)
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7', opacity: isCompleted ? 0.75 : 1 }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isCompleted && <IcoCheck />}
            <p
              className="text-[14px] font-semibold text-[#242326] m-0"
              style={{ fontFamily: FONT_HEAD, textDecoration: isCompleted ? 'line-through' : 'none' }}
            >
              {task.title}
            </p>
            {stageName && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
                {stageName.toUpperCase()}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{task.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {task.priority && (
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em]" style={{ backgroundColor: PRIORITY_COLORS[task.priority].bg, color: PRIORITY_COLORS[task.priority].fg, fontFamily: FONT_MONO }}>
                {TASK_PRIORITY_LABELS[task.priority].toUpperCase()}
              </span>
            )}
            {task.assigneeId && (
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Assigned to: <strong className="text-[#242326]">{memberLabel(task.assigneeId, currentUserId)}</strong></span>
            )}
            {task.dueDate && (
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>Due: {formatDueDate(task.dueDate)}</span>
            )}
          </div>
        </div>
        <select
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="h-8 px-2.5 rounded-[8px] text-[12px] font-semibold cursor-pointer outline-none shrink-0"
          style={{ fontFamily: FONT_BODY, border: '1px solid #E3DDD7', backgroundColor: '#FFFFFF', color: '#242326' }}
        >
          {TASK_STATUSES.map(s => (
            <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
