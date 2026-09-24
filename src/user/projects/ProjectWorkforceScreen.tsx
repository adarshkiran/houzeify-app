import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useProjectWorkforce, type ProjectWorkforceMember } from '@/data/projectWorkforceState'
import { listOrganizationMembers, type OrganizationMember } from '@/data/organizationApi'
import { ApiError } from '@/data/apiClient'
import { useAuth } from '@/data/authState'
import { useProjectAudience } from '@/data/customerProjectsState'
import { listCustomerViewWorkforce, type CustomerViewWorkforceMember } from '@/data/customerViewApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen — Project Workforce (Module 06 / Task 5) ────────────────────────
// A HOMEOWNER/professional screen reached from Project Workspace's sub-nav
// (ProjectSubNav's "Workforce" tab). Sibling of ProjectTasksScreen.tsx and
// ProjectIssuesScreen.tsx (Module 05) — same shell, same visual language,
// same guard/hook structure — driven by the real project_workforce_members
// backend (useProjectWorkforce, from projectWorkforceState.ts, Task 4)
// rather than any in-memory fixture. Every member row is scoped to the real
// projectId already threaded since 060 — never proj-001/DEFAULT_PROJECT_ID.
//
// This screen answers "who is on the site team for this project" — NOT
// attendance/GPS/movement tracking, which is explicitly out of scope for
// this whole module (see constructionNav.ts's corrected placeholder copy,
// Task 5 Step 4). No attendance/check-in affordance exists anywhere here.
//
// Org-member picker + identity resolution: reused verbatim from
// ProjectTasksScreen.tsx/ProjectIssuesScreen.tsx (both read in full before
// writing this file) — listOrganizationMembers, a plain async function
// (not a new hook), and the same memberLabel() convention established in
// TeamManagementScreen.tsx: "You" for the current user's own id, "Member
// <first 8 chars of id>" otherwise — never a fabricated display name.
//
// Mutation-capable gate: Tasks/Issues were read in full specifically to
// find a finer-grained "can this signed-in user mutate" client-side check
// beyond `canViewProject` (role === 'homeowner' || role === 'professional')
// — neither screen has one. Both let any project-viewing homeowner/
// professional create tasks/issues freely, relying on the server's own
// authorization (project owner, or an org member with a mutation role) to
// reject anything it shouldn't, surfaced back through the mutation's own
// try/catch. That IS "how ProjectTasksScreen.tsx/ProjectIssuesScreen.tsx
// already determine this client-side" — so this screen reuses the exact
// same `canViewProject` value as its mutation gate (canManageWorkforce)
// rather than inventing a second, more granular org-role check that has no
// precedent anywhere on the frontend (TeamManagementScreen.tsx displays
// other members' roles but never gates on the *current* user's own org
// role). The read-only empty-state copy below is kept per the brief for
// forward compatibility even though, with today's gate, it is not reached
// by any role this screen already renders for.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention

const ROLE_SUGGESTIONS = ['Site Supervisor', 'Electrician', 'Plumber', 'Mason', 'Carpenter', 'Painter', 'General Labour', 'Other']

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoWorkforce = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.25" /><path d="M2 15v-1a4.5 4.5 0 019 0v1" /><circle cx="13" cy="6.5" r="1.9" /><path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

// Established convention (TeamManagementScreen.tsx, carried into
// ProjectTasksScreen.tsx/ProjectIssuesScreen.tsx) — the backend never joins
// a member row to a real display name, so a member identity is always
// rendered as "You" (the caller's own id) or a short id fragment, never
// free text.
function memberLabel(candidateUserId: string, currentUserId: string): string {
  return candidateUserId === currentUserId ? 'You' : `Member ${candidateUserId.slice(0, 8)}`
}

// Mirrors ProjectProgressScreen.tsx's own formatEntryDate()/'en-IN'
// convention (and ProjectTasksScreen.tsx's own formatDueDate()) so a date
// reads identically across the project's screens.
function formatAddedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Same convention as describeTaskError()/describeIssueError() (tasksApi.ts/
// issuesApi.ts) — projectWorkforceState.ts (Task 4) deliberately exposes no
// describe*Error() of its own (its mutation calls propagate raw thrown
// errors, see its own header comment), so this screen defines the same
// shape locally rather than reaching into that file.
//
// This function is ONLY ever called from a mutation's own catch block
// (handleAddMember / WorkforceMemberCard's handleSave / handleRemove) —
// never from the initial-load path, whose 404 ("you can't see this
// project at all") is surfaced as-is via the hook's own `error` string
// (see the `{error && ...}` banner below). That's why it's safe to
// special-case 404 here: `canManageWorkforce` deliberately mirrors
// Tasks/Issues and lets any project-viewing homeowner/professional see
// the Add/Edit/Remove affordances, but the backend additionally requires
// project-owner or org mutation-role (owner/admin) and rejects anyone
// else with a plain 404 "Project not found." — which is confusing here
// since the project's name is right there on screen. Swap that specific
// case for a real permissions message; leave every other status/code
// (400 "not an authorized participant", 409 "already on the site team",
// network errors, etc.) exactly as before.
function describeWorkforceError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return "You don't have permission to manage this project's site team."
    return err.message
  }
  return 'Something went wrong. Please try again.'
}

interface ProjectWorkforceScreenProps {
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

export default function ProjectWorkforceScreen({
  role,
  userId,
  projectId,
  projectName,
  location,
  organizationId,
  onNavigate,
}: ProjectWorkforceScreenProps) {
  // Houzeify 2.0 Module 03 — see ProjectWorkspaceScreen.tsx's identical
  // comment: a project can now belong to a company, so a professional must
  // be able to open one of their organization's real projects here too,
  // not just a homeowner.
  const canViewProject = role === 'homeowner' || role === 'professional'
  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])

  const hasProject = Boolean(projectId && projectName)
  const auth = useAuth()
  const currentUserId = auth.user?.id || userId || CURRENT_USER_ID

  const audience = useProjectAudience(projectId)
  const isCustomer = audience === 'customer'
  const { status: workforceStatus, members, error, addMember, updateRole, removeMember, refetch } = useProjectWorkforce(isCustomer ? undefined : projectId)
  const [customerRoster, setCustomerRoster] = useState<CustomerViewWorkforceMember[]>([])
  useEffect(() => {
    if (!isCustomer || !projectId) return
    listCustomerViewWorkforce(projectId).then(setCustomerRoster).catch(() => setCustomerRoster([]))
  }, [isCustomer, projectId])

  // Assignable members — real organization roster only, same
  // listOrganizationMembers() direct-call pattern as ProjectTasksScreen.tsx/
  // ProjectIssuesScreen.tsx (not a new global hook).
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([])
  useEffect(() => {
    if (!organizationId) {
      setOrgMembers([])
      return
    }
    let cancelled = false
    listOrganizationMembers(organizationId)
      .then(result => { if (!cancelled) setOrgMembers(result) })
      .catch(() => { if (!cancelled) setOrgMembers([]) })
    return () => { cancelled = true }
  }, [organizationId])

  // See header comment — reuses the exact same client-side gate
  // ProjectTasksScreen.tsx/ProjectIssuesScreen.tsx already use to decide
  // whether the signed-in user can mutate.
  const canManageWorkforce = canViewProject && !isCustomer

  const [showForm, setShowForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [roleInput, setRoleInput] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  const selectClass = 'min-h-11 h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]'
  const inputClass = 'w-full h-10 px-3 rounded-[10px] text-[13.5px] outline-none'
  const inputStyle = { border: '1px solid #E3DDD7', fontFamily: FONT_BODY, backgroundColor: 'white' }

  function goToWorkspace() {
    onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)
  }

  // All hooks above this point must run on every render — see Module 05
  // Task 8 fix-round-1 (mirrored here): these guards sit after every hook,
  // never between them.
  if (!canViewProject) return null

  if (!hasProject) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FBF9F7' }}>
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

  const isLoading = workforceStatus === 'idle' || workforceStatus === 'loading'

  // Options = the project's organization members minus anyone already
  // actively on the site team (the backend's own GET already returns only
  // status: 'active' rows — see projectWorkforce.service.ts's
  // listWorkforceForProject — so `members` here is always the active set).
  const activeMemberUserIds = new Set(members.filter(m => m.status === 'active').map(m => m.userId))
  const availableOrgMembers = orgMembers.filter(m => !activeMemberUserIds.has(m.userId))

  function resetAddForm() {
    setSelectedUserId('')
    setRoleInput('')
    setAddError(null)
  }

  async function handleAddMember() {
    if (!selectedUserId) {
      setAddError('Select a person to add.')
      return
    }
    const trimmedRole = roleInput.trim()
    if (!trimmedRole) {
      setAddError('Role is required.')
      return
    }
    try {
      await addMember({ userId: selectedUserId, role: trimmedRole })
      resetAddForm()
      setShowForm(false)
    } catch (err) {
      // Task 4 (confirmed, not a bug): addMember's own fetch errors are
      // uncaught promise rejections unless the caller wraps it — this
      // try/catch is that wrap, so a 409 ("already on the site team") or
      // 400 ("not an authorized participant") response surfaces here
      // inline near the form instead of being silently swallowed.
      setAddError(describeWorkforceError(err))
    }
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FBF9F7' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">

      <ProjectSubNav active="workforce" projectId={projectId} projectName={projectName} variant={isCustomer ? 'customer' : 'company'} onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-8 pb-24 md:pb-8">
        <div className="max-w-[820px] mx-auto flex flex-col gap-6 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Workforce</p>
              <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
              {location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> {location}
                </span>
              )}
              <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>The on-site crew and team members for this project.</p>
            </div>
            {canManageWorkforce && (
              <button
                type="button"
                onClick={() => { setShowForm(s => !s); setAddError(null) }}
                className={selectClass}
                style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
              >
                + Add to Site Team
              </button>
            )}
          </div>

          {/* Add-member form */}
          {canManageWorkforce && showForm && (
            <SectionCard title="Add to Site Team">
              <div className="flex flex-col gap-4">
                <select className={inputClass} style={inputStyle} value={selectedUserId} onChange={e => { setSelectedUserId(e.target.value); setAddError(null) }}>
                  <option value="">Select a person</option>
                  {availableOrgMembers.map(m => (
                    <option key={m.userId} value={m.userId}>{memberLabel(m.userId, currentUserId)}</option>
                  ))}
                </select>
                {availableOrgMembers.length === 0 && (
                  // Covers both a homeowner-owned project (no organizationId
                  // to fetch org members from at all) and an org project
                  // whose whole roster is already on the site team — without
                  // this, the picker is a silent dead end: just an
                  // unhelpful "Select a person" with nothing to select.
                  <p className="text-[12.5px] text-[#68636D] m-0 -mt-2" style={{ fontFamily: FONT_BODY }}>
                    No organization members are available to add.
                  </p>
                )}
                <div>
                  <label className="sr-only" htmlFor="workforce-role">Role</label>
                  <input
                    id="workforce-role"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Role (e.g. Site Supervisor)"
                    value={roleInput}
                    onChange={e => { setRoleInput(e.target.value); setAddError(null) }}
                    aria-invalid={Boolean(addError && !roleInput.trim())}
                  />
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {ROLE_SUGGESTIONS.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setRoleInput(suggestion)}
                        className="min-h-11 h-11 px-3 rounded-full text-[11.5px] font-semibold cursor-pointer border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
                        style={{ fontFamily: FONT_BODY, backgroundColor: '#F4F0EC', color: '#68636D' }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                {addError && <p className="text-[12.5px] text-[#DC2626] m-0" style={{ fontFamily: FONT_BODY }} role="alert">{addError}</p>}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleAddMember} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                    Add Member
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); resetAddForm() }} className="text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent py-2.5 -my-2.5" style={{ fontFamily: FONT_BODY }}>
                    Cancel
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {error && (
            <div className="rounded-[12px] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }} role="alert">
              <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
              {!isCustomer && (
                <button
                  type="button"
                  onClick={() => { void refetch() }}
                  className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1]"
                  style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {/* Site team list */}
          {isCustomer ? (
            <div className="flex flex-col gap-3">
              {customerRoster.length === 0 ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No site team has been added for this project yet.</p>
              ) : customerRoster.map(member => (
                <div key={`${member.displayName}-${member.role}`} className="rounded-[14px] bg-white p-4" style={{ border: '1px solid #E3DDD7' }}>
                  <p className="text-[14px] font-semibold m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{member.displayName}</p>
                  <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{member.role}</p>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <SectionCard>
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#68636D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoWorkforce />
                </span>
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading site team…</p>
              </div>
            </SectionCard>
          ) : workforceStatus === 'error' ? null : members.length === 0 ? (
            <SectionCard>
              <div className="flex flex-col items-center text-center gap-2 py-6">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#68636D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoWorkforce />
                </span>
                {canManageWorkforce ? (
                  <>
                    <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>No site team members yet.</p>
                    <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Add the people working on this project to build its site team.</p>
                    <button type="button" onClick={() => setShowForm(true)} className={`${selectClass} mt-2`} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                      Add to Site Team
                    </button>
                  </>
                ) : (
                  <p className="text-[13px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>No site team has been added for this project yet.</p>
                )}
              </div>
            </SectionCard>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {members.map(member => (
                <WorkforceMemberCard
                  key={member.id}
                  member={member}
                  currentUserId={currentUserId}
                  canManage={canManageWorkforce}
                  onSave={updateRole}
                  onRemove={removeMember}
                />
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

function WorkforceMemberCard({
  member,
  currentUserId,
  canManage,
  onSave,
  onRemove,
}: {
  member: ProjectWorkforceMember
  currentUserId: string
  canManage: boolean
  onSave: (id: string, role: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [roleValue, setRoleValue] = useState(member.role)
  const [editError, setEditError] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)

  async function handleSave() {
    const trimmed = roleValue.trim()
    if (!trimmed) {
      setEditError('Role is required.')
      return
    }
    try {
      await onSave(member.id, trimmed)
      setIsEditing(false)
      setEditError(null)
    } catch (err) {
      // Task 4 (confirmed, not a bug): updateRole's own fetch errors are
      // uncaught promise rejections unless the caller wraps it — this
      // try/catch is that wrap, surfacing a 400/404 inline on this row
      // instead of silently swallowing it, and keeping the row in its
      // editing state so the user can correct and retry.
      setEditError(describeWorkforceError(err))
    }
  }

  async function handleRemove() {
    setRemoveError(null)
    try {
      await onRemove(member.id)
      // On success the member disappears from the parent's `members` list
      // on the next render (refetch() inside removeMember) — no local
      // "removed" state needed here.
    } catch (err) {
      setRemoveError(describeWorkforceError(err))
    }
  }

  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
            {memberLabel(member.userId, currentUserId)}
          </p>
          {isEditing ? (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <input
                className="h-9 px-3 rounded-[10px] text-[13px] outline-none"
                style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY, backgroundColor: 'white', width: 220 }}
                value={roleValue}
                onChange={e => { setRoleValue(e.target.value); setEditError(null) }}
              />
              <button type="button" onClick={handleSave} className="h-9 px-3.5 rounded-[10px] text-[12.5px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                Save
              </button>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setRoleValue(member.role); setEditError(null) }}
                className="text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent py-2.5 -my-2.5"
                style={{ fontFamily: FONT_BODY }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{member.role}</p>
          )}
          <p className="text-[12px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Added {formatAddedDate(member.createdAt)}</p>
          {editError && <p className="text-[12px] text-[#DC2626] m-0 mt-1.5" style={{ fontFamily: FONT_BODY }}>{editError}</p>}
          {removeError && <p className="text-[12px] text-[#DC2626] m-0 mt-1.5" style={{ fontFamily: FONT_BODY }}>{removeError}</p>}
        </div>
        {canManage && !isEditing && (
          <div className="flex items-center gap-4 shrink-0">
            <button type="button" onClick={() => setIsEditing(true)} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent py-2.5 -my-2.5" style={{ fontFamily: FONT_BODY }}>
              Edit role
            </button>
            <button type="button" onClick={handleRemove} className="text-[12.5px] font-semibold text-[#DC2626] hover:underline cursor-pointer border-0 bg-transparent py-2.5 -my-2.5" style={{ fontFamily: FONT_BODY }}>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
