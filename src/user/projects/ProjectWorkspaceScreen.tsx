import { useEffect, useMemo } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { projectStageLabel } from '@/data/homeownerDashboard'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { getAwardedBid, formatBidDuration } from '@/data/bids'
import { getAgreementForProject } from '@/data/agreements'
import { getEstimateVersionsForProject } from '@/data/estimateVersions'
import { getPaymentsForProject } from '@/data/payments'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 068 — Project Workspace (shell) ─────────────────────────────────
// A HOMEOWNER screen — the command center reached after 067 confirms an
// award. This is a UI SHELL over the existing project fields (projectData)
// and the existing Bid/contractor stores — no WorkspaceProject/
// ProjectWorkspace/WorkspaceStore model exists or is created here. "The
// project" is exactly what 062-067 already treat it as: projectId/
// projectName/propertyType/location threaded through projectData, plus
// whichever bid on that project (if any) has reached status 'accepted'
// (bids.ts's own getAwardedBid()). Navigation into 069-074 is registered
// but their contents are never built here — every one of those routes is a
// safe forward reference, matching this app's established convention.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IcoOverview = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="14" height="14" rx="2" /><line x1="2" y1="7" x2="16" y2="7" /><line x1="7" y1="7" x2="7" y2="16" /></svg>
)
const IcoTeam = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.25" /><path d="M2 15v-1a4.5 4.5 0 019 0v1" /><circle cx="13" cy="6.5" r="1.9" /><path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" /></svg>
)
const IcoMessages = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4.5A1.5 1.5 0 013.5 3h11A1.5 1.5 0 0116 4.5v7a1.5 1.5 0 01-1.5 1.5H6l-3.5 3v-3H3.5A1.5 1.5 0 012 11.5v-7z" /></svg>
)
const IcoDocuments = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M11 2v4h4" /></svg>
)
const IcoTasks = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="12" height="12" rx="2" /><path d="M6 9l2 2 4-4" /></svg>
)
const IcoProgress = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M9 5v4l3 2" /></svg>
)
const IcoAgreement = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2h6l3 3v9a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 014 14.5v-11A1.5 1.5 0 015.5 2z" /><path d="M6.5 8.5l2 2 3.5-4" /></svg>
)
const IcoFinalEstimate = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="12" height="14" rx="1.5" /><line x1="6" y1="6.5" x2="12" y2="6.5" /><line x1="6" y1="9.5" x2="12" y2="9.5" /><line x1="6" y1="12.5" x2="10" y2="12.5" /></svg>
)
const IcoStages = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13h12" /><path d="M5 13V9a4 4 0 018 0v4" /><line x1="9" y1="4" x2="9" y2="6.5" /></svg>
)
const IcoPayments = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15.5V9.5L9 3l6 6.5v6" /><path d="M6.5 15.5V11h5v4.5" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}

interface WorkspaceCard {
  id: string
  label: string
  icon: React.ReactNode
  dest: string
}

function NavCard({ card, onClick }: { card: WorkspaceCard; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-[14px] bg-white p-4 text-left cursor-pointer hover:border-[#722ED1] transition-colors"
      style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
    >
      <span className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}>
        {card.icon}
      </span>
      <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{card.label}</span>
    </button>
  )
}

interface ProjectWorkspaceScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  /** 'new-build' | 'renovation' — real value set at project-creation time
   *  (HouseRequirementsScreen / RenovateProjectCreatedScreen) via
   *  projects.ts's own Project.type. Only used here to decide whether the
   *  Construction Stages card makes sense to show; never changes anything
   *  else about this screen. */
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
  userId,
  projectId,
  projectName,
  projectType,
  propertyType,
  location,
  projectStage,
  organizationId,
  companyName,
  accountType,
  professionalType,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  serviceDescription,
  onNavigate,
}: ProjectWorkspaceScreenProps) {
  // Houzeify 2.0 Module 03 — a project can now belong to a company
  // (organizationId set), so a professional opening one of their
  // organization's real projects must reach this screen too, not just a
  // homeowner opening their own. The real authorization boundary is the
  // backend project API (project.service.ts's getProjectForAccess/
  // listProjectsForOrganization) — this screen itself only ever renders
  // whatever project fields were legitimately threaded through
  // navigation, same as before; this gate just stops a genuinely invalid
  // role (neither) from landing here, never a homeowner-only wall.
  const canViewProject = role === 'homeowner' || role === 'professional'
  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])
  if (!canViewProject) return null

  const hasProject = Boolean(projectId && projectName)

  const awardedBid = useMemo(() => (projectId ? getAwardedBid(projectId) : undefined), [projectId])

  const directoryInput: ContractorDirectoryInput = {
    userId: userId || CURRENT_USER_ID,
    accountType: accountType as AccountType | undefined,
    organizationId,
    companyName,
    professionalType: professionalType as ProfessionalType | undefined,
    location,
    serviceCategories,
    serviceLocations,
    verificationStatus,
    portfolioProjectCount,
    serviceDescription,
  }

  const listing = useMemo(
    () => (awardedBid ? getContractorListingById(awardedBid.organizationId ?? awardedBid.userId, directoryInput) : undefined),
    [awardedBid, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceLocations, directoryInput.verificationStatus,
      directoryInput.portfolioProjectCount, directoryInput.serviceDescription]
  )

  const statusLabel = awardedBid ? 'Contractor Selected' : (projectStageLabel(projectStage) ?? 'Not started')
  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'

  // "Back" now returns to the real Projects list (projects-list) — the
  // list is the natural place every project-workspace visit is reached
  // from now (Sidebar "Projects" → list → click a project → here), so
  // this is a better "back" than the old single-ambient-project's
  // contractor-selected detour.
  function goBack() {
    onNavigate('projects-list')
  }
  // Explicitly clears the currently-open project from projectData before
  // starting House Requirements — otherwise (its bag never resets itself)
  // House Requirements would reuse THIS project's id (its own "resume an
  // existing project" convention) and silently overwrite it instead of
  // minting a genuinely new, separate project. Same fix as Projects List's
  // own "Create a Project" button.
  function createProject() {
    onNavigate('house-requirements', {
      project_id: '', project_name: '', project_type: '', project_stage: '',
      location: '', property_type: '',
    })
  }

  if (!hasProject) {
    // The Projects list's own empty state, reached directly if a homeowner
    // somehow lands here with no project selected. Create Project (035) is
    // still fully intact; it's just no longer part of the guided New Build
    // journey (Flow 04 starts at House Requirements instead) — this is its
    // other real entry point.
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No active project yet.</p>
          <p className="text-[13px] text-[#68636D] m-0 max-w-[320px]" style={{ fontFamily: FONT_BODY }}>Start a new project to begin planning, estimating and finding professionals.</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={goBack} className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white" style={{ border: '1px solid #E3DDD7', color: '#68636D', fontFamily: FONT_BODY }}>
              Back
            </button>
            <button type="button" onClick={createProject} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
              Create a Project
            </button>
          </div>
        </div>
      </div>
    )
  }

  const name = listing?.name ?? 'Professional'
  const kind = listing?.kind ?? (awardedBid?.organizationId ? 'organization' : 'individual')
  const initials = kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')

  function viewContractor() {
    if (!awardedBid) return
    onNavigate('contractor-profile', {
      professional_id: awardedBid.organizationId ? '' : awardedBid.userId,
      organization_id: awardedBid.organizationId ?? '',
      project_id: projectId as string,
    })
  }

  function navTo(dest: string) {
    onNavigate(dest, { project_id: projectId as string })
  }

  // Agreement + Final Estimate only appear once they genuinely exist for
  // this project (Flow 04 — New Build) — never dead cards for a project
  // that never went through Award Contractor/Estimate Revision (e.g. a
  // Home Services booking), matching this screen's own "never invent what
  // isn't real" convention elsewhere.
  const hasAgreement = Boolean(projectId && getAgreementForProject(projectId))
  const hasEstimateVersions = Boolean(projectId && getEstimateVersionsForProject(projectId).length > 0)
  const hasPayments = Boolean(projectId && getPaymentsForProject(projectId).length > 0)
  // Construction Stages is a New Build-specific concept (Foundation,
  // Roofing, etc.) — showing it for a Renovation project would be exactly
  // the "force renovation into an unrelated system" this flow is meant to
  // avoid, so it's gated on the real project type set at creation time.
  const showStages = projectType === 'new-build'

  const workspaceCards: WorkspaceCard[] = [
    { id: 'overview', label: 'Project Overview', icon: <IcoOverview />, dest: 'project-overview' },
    { id: 'team', label: 'Project Team', icon: <IcoTeam />, dest: 'project-team' },
    { id: 'messages', label: 'Messages', icon: <IcoMessages />, dest: 'project-messages' },
    { id: 'documents', label: 'Documents', icon: <IcoDocuments />, dest: 'project-documents' },
    { id: 'tasks', label: 'Tasks', icon: <IcoTasks />, dest: 'project-tasks' },
    { id: 'progress', label: 'Progress', icon: <IcoProgress />, dest: 'project-progress' },
    ...(showStages ? [{ id: 'stages', label: 'Construction Stages', icon: <IcoStages />, dest: 'construction-stages' }] : []),
    ...(hasAgreement ? [{ id: 'agreement', label: 'Agreement', icon: <IcoAgreement />, dest: 'project-agreement' }] : []),
    ...(hasEstimateVersions ? [{ id: 'final-estimate', label: 'Final Estimate', icon: <IcoFinalEstimate />, dest: 'final-estimate' }] : []),
    ...(hasAgreement || hasPayments ? [{ id: 'payments', label: 'Payments', icon: <IcoPayments />, dest: 'payment-advance' }] : []),
  ]

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">

      <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Back
          </button>
          <button
            type="button"
            onClick={createProject}
            className="h-9 px-4 rounded-[10px] text-[12.5px] font-semibold cursor-pointer border-0"
            style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
          >
            Create a Project
          </button>
        </div>
      </header>

      <ProjectSubNav active="overview" projectId={projectId} projectName={projectName} onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[1000px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Workspace</p>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {propertyType && <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{propertyType}</span>}
              {location && (
                <span className="flex items-center gap-1.5 text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> {location}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: awardedBid ? '#DCFCE7' : '#CAC7C6', color: awardedBid ? '#16A34A' : '#808080', fontFamily: FONT_MONO }}>
                {statusLabel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Selected contractor */}
          {awardedBid && (
            <SectionCard title="Selected Contractor">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{name}</p>
                      {listing?.verificationStatus === 'verified' && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A]" style={{ fontFamily: FONT_BODY }}><CheckBadgeIcon /> Verified</span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{typeLabel} · {kind === 'organization' ? 'Organization' : 'Individual'}</p>
                  </div>
                </div>
                <button type="button" onClick={viewContractor} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0 shrink-0" style={{ fontFamily: FONT_BODY }}>
                  View Contractor →
                </button>
              </div>
            </SectionCard>
          )}

          {/* Overview preview — compact, never duplicating 069 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SectionCard>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Status</p>
              <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{statusLabel}</p>
            </SectionCard>
            <SectionCard>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Estimated Duration</p>
              <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{awardedBid ? formatBidDuration(awardedBid.duration, awardedBid.durationUnit) : '—'}</p>
            </SectionCard>
            <SectionCard>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Location</p>
              <p className="text-[13.5px] font-semibold text-[#242326] m-0 truncate">{location || '—'}</p>
            </SectionCard>
            <SectionCard>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Progress</p>
              <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Not started</p>
            </SectionCard>
          </div>

          {/* Workspace navigation */}
          <div>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>Workspace</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {workspaceCards.map(card => (
                <NavCard key={card.id} card={card} onClick={() => navTo(card.dest)} />
              ))}
            </div>
          </div>

          {/* Quick summaries — honest empty states, no fabricated counts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SectionCard title="Messages">
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No messages yet.</p>
              <button type="button" onClick={() => navTo('project-messages')} className="mt-2 text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>View Messages →</button>
            </SectionCard>
            <SectionCard title="Documents">
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No documents yet.</p>
              <button type="button" onClick={() => navTo('project-documents')} className="mt-2 text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>View Documents →</button>
            </SectionCard>
            <SectionCard title="Tasks">
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No tasks yet.</p>
              <button type="button" onClick={() => navTo('project-tasks')} className="mt-2 text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>View Tasks →</button>
            </SectionCard>
          </div>
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
