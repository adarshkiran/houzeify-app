import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { projectStageLabel } from '@/data/homeownerDashboard'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { getAwardedBid, formatBidAmount, formatBidDuration } from '@/data/bids'
import { getHouseRequirementsForProject } from '@/data/houseRequirements'
import { getLatestEstimateVersion } from '@/data/estimateVersions'
import { getPaymentsForProject } from '@/data/payments'
import { constructionStages } from '@/data/constructionStages'
import { PROJECT_STATUS_LABELS, isProjectStatus } from '@/data/projectStatus'
import { useDailyProgress } from '@/data/dailyProgressState'
import { useProjectAudience } from '@/data/customerProjectsState'
import { describeCustomerViewError, getCustomerView, type CustomerViewHeader } from '@/data/customerViewApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 069 — Project Overview ──────────────────────────────────────────
// A HOMEOWNER screen reached from 068 (Project Workspace). Purely a detailed
// READ view over the same fields 062-068 already treat as "the project"
// (projectData: projectId/projectName/propertyType/location/projectStage)
// plus the awarded Bid (bids.ts's own getAwardedBid()) and the winning
// professional's directory listing (contractorDirectory.ts). No Project/
// ProjectOverview model is created. No budget/description/created-date field
// exists anywhere in projectData — those are shown with their required
// honest fallback copy, never fabricated. The one exception: "Project
// Created" is derived from the real timestamp already embedded in projectId
// itself (CreateProjectScreen.tsx mints ids as `project-<epoch-ms>-<n>`) —
// this is reading real data, not inventing a date.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Extracts the real creation instant embedded in a projectId minted by
 *  CreateProjectScreen.tsx (`project-<epoch-ms>-<counter>`). Returns
 *  undefined for any id that doesn't match — never a guess. */
function projectCreatedAtLabel(projectId?: string): string | undefined {
  if (!projectId) return undefined
  const match = /^project-(\d+)-\d+$/.exec(projectId)
  if (!match) return undefined
  const ms = Number(match[1])
  if (!Number.isFinite(ms)) return undefined
  return formatDate(new Date(ms).toISOString())
}

/** Houzeify 2.0 Module 03 — a project's `stage` field means one of two
 *  things depending on who created it: for a homeowner's own project, a
 *  pre-construction readiness snapshot (projectStageLabel()'s existing
 *  vocabulary); for a company-created construction project, a real
 *  construction-phase id from constructionStages.ts's existing taxonomy.
 *  This tries the real taxonomy first (an exact id match), falling back to
 *  the homeowner label — never guesses which kind of project it is. */
function resolvedStageLabel(stage: string | undefined): string | undefined {
  if (!stage) return undefined
  const realStage = constructionStages.find(s => s.id === stage)
  if (realStage) return realStage.name
  return projectStageLabel(stage)
}


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#16A34A" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IcoTeam = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.25" /><path d="M2 15v-1a4.5 4.5 0 019 0v1" /><circle cx="13" cy="6.5" r="1.9" /><path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" /></svg>
)
const IcoMessages = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4.5A1.5 1.5 0 013.5 3h11A1.5 1.5 0 0116 4.5v7a1.5 1.5 0 01-1.5 1.5H6l-3.5 3v-3H3.5A1.5 1.5 0 012 11.5v-7z" /></svg>
)
const IcoDocuments = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M11 2v4h4" /></svg>
)
const IcoTasks = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="12" height="12" rx="2" /><path d="M6 9l2 2 4-4" /></svg>
)
const IcoProgress = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M9 5v4l3 2" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <h2 className="text-[13px] font-semibold text-[#242326] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{value ?? '—'}</p>
    </div>
  )
}

interface ActionCard {
  id: string
  label: string
  icon: React.ReactNode
  dest: string
}

const ACTION_CARDS: ActionCard[] = [
  { id: 'team', label: 'Project Team', icon: <IcoTeam />, dest: 'project-team' },
  { id: 'messages', label: 'Messages', icon: <IcoMessages />, dest: 'project-messages' },
  { id: 'documents', label: 'Documents', icon: <IcoDocuments />, dest: 'project-documents' },
  { id: 'tasks', label: 'Tasks', icon: <IcoTasks />, dest: 'project-tasks' },
  { id: 'progress', label: 'Progress', icon: <IcoProgress />, dest: 'project-progress' },
]

interface ProjectOverviewScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  propertyType?: string
  location?: string
  projectStage?: string
  /** Module 03 — this project's own lifecycle status (planning/active/
   *  on-hold/completed/archived), real and company-set only; a
   *  homeowner's own project has none, and its existing live-derived
   *  `statusLabel` (below) stays unaffected. */
  projectStatus?: string
  timelineStart?: string
  timelineCompletion?: string
  /** Real, already-saved on the backend for both a Renovation project
   *  (RenovateProjectCreatedScreen's own scopeSummary) and a company
   *  construction project (CreateConstructionProjectScreen's Description
   *  field) — this screen just never displayed it before Module 03. */
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

function CompanyProjectOverview({
  role,
  userId,
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
  companyName,
  accountType,
  professionalType,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  serviceDescription,
  onNavigate,
}: ProjectOverviewScreenProps) {
  // Houzeify 2.0 Module 03 — see ProjectWorkspaceScreen.tsx's identical
  // comment: a project can now belong to a company, so a professional
  // must be able to open one of their organization's real projects here
  // too, not just a homeowner.
  const canViewProject = role === 'homeowner' || role === 'professional'

  // Finding 1 fix (Task 9 round 1, extended in round 2) — every hook in
  // this component (this useEffect, the three useMemo calls below, and
  // useDailyProgress) must run unconditionally, before BOTH early-return
  // guards below (the `canViewProject` guard immediately below and the
  // `hasProject` guard further down) — Rules of Hooks. Each of these
  // already handles undefined/falsy props (projectId, awardedBid)
  // gracefully, so gathering them here next to this component's other
  // top-of-body hooks is a pure reorder — no behavior change.
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

  const createdLabel = useMemo(() => projectCreatedAtLabel(projectId), [projectId])

  const audience = useProjectAudience(projectId)
  const isCustomer = audience === 'customer'
  const { progress: dailyProgressEntries } = useDailyProgress(isCustomer ? undefined : projectId)

  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])
  if (!canViewProject) return null

  const hasProject = Boolean(projectId && projectName)

  const statusLabel = awardedBid ? 'Contractor Selected' : (projectStageLabel(projectStage) ?? 'Not started')
  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'
  const latestDailyProgress = dailyProgressEntries[0]

  function goToWorkspace() {
    onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)
  }

  if (!hasProject) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Project not found.</p>
          <button type="button" onClick={goToWorkspace} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            Back
          </button>
        </div>
      </div>
    )
  }

  // Real Financial data — Requirements' expected budget, the latest locked
  // Final Estimate version, and any recorded payments — all already
  // project-keyed stores (houseRequirements.ts / estimateVersions.ts /
  // payments.ts) built for Flow 04/06; this screen previously showed
  // "Budget not specified" unconditionally because none of those existed
  // yet when it was first written.
  const requirements = projectId ? getHouseRequirementsForProject(projectId) : undefined
  const latestEstimate = projectId ? getLatestEstimateVersion(projectId) : undefined
  const payments = projectId ? getPaymentsForProject(projectId) : []
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)

  const name = listing?.name ?? 'Professional'
  const kind = listing?.kind ?? (awardedBid?.organizationId ? 'organization' : 'individual')
  const initials = kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')

  function navTo(dest: string) {
    onNavigate(dest, { project_id: projectId as string })
  }

  const timelineEntries: { label: string; value: string }[] = []
  if (createdLabel) timelineEntries.push({ label: 'Project Created', value: createdLabel })
  if (awardedBid) timelineEntries.push({ label: 'Contractor Selected', value: formatDate(awardedBid.updatedAt) })
  if (awardedBid?.proposedStartDate) timelineEntries.push({ label: 'Proposed Start', value: formatDate(awardedBid.proposedStartDate) })

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">

      <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToWorkspace} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Project Workspace
          </button>
        </div>
      </header>

      <ProjectSubNav active="overview" projectId={projectId} projectName={projectName} variant={isCustomer ? 'customer' : 'company'} onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[1000px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Overview</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <SectionCard title="Project Details">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Project Name" value={projectName} />
                  {/* Module 03 — shown only for a company-owned project;
                      companyName arrives real from projectData, never
                      fabricated for a homeowner's own project. */}
                  {companyName && <Field label="Organization" value={companyName} />}
                  <Field label="Property Type" value={propertyType} />
                  <Field label="Location" value={location} />
                  <Field label="Construction Stage" value={resolvedStageLabel(projectStage)} />
                  {isProjectStatus(projectStatus) && <Field label="Status" value={PROJECT_STATUS_LABELS[projectStatus]} />}
                  {timelineStart && <Field label="Planned Start" value={formatDate(timelineStart)} />}
                  {timelineCompletion && <Field label="Planned Completion" value={formatDate(timelineCompletion)} />}
                  {createdLabel && <Field label="Created" value={createdLabel} />}
                </div>
              </SectionCard>

              <SectionCard title="Latest Update">
                {latestDailyProgress ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{latestDailyProgress.title}</p>
                    {/* Stage rendered as the same pill-badge the Daily
                        Progress feed uses (ProjectProgressScreen.tsx), so
                        the same data reads identically on both screens. */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {resolvedStageLabel(latestDailyProgress.stage ?? undefined) && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#F4F0EC', color: '#68636D', fontFamily: FONT_MONO }}>
                          {resolvedStageLabel(latestDailyProgress.stage ?? undefined)!.toUpperCase()}
                        </span>
                      )}
                      <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
                        {formatDate(latestDailyProgress.date)}
                        {latestDailyProgress.photos.length > 0 && ` · ${latestDailyProgress.photos.length} photo${latestDailyProgress.photos.length === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => navTo('project-progress')} className="self-start text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                      View All Progress →
                    </button>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No progress updates yet.</p>
                )}
              </SectionCard>

              <SectionCard title="About This Project">
                {summary ? (
                  <p className="text-[13px] text-[#242326] m-0" style={{ fontFamily: FONT_BODY }}>{summary}</p>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No project description provided.</p>
                )}
              </SectionCard>

              <SectionCard title="Project Budget">
                {requirements && (requirements.budgetExpected != null || requirements.budgetMin != null || requirements.budgetMax != null) ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expected Budget" value={requirements.budgetExpected != null ? `₹${requirements.budgetExpected.toLocaleString('en-IN')}` : undefined} />
                    <Field
                      label="Budget Range"
                      value={
                        requirements.budgetMin != null || requirements.budgetMax != null
                          ? `${requirements.budgetMin != null ? `₹${requirements.budgetMin.toLocaleString('en-IN')}` : '—'} – ${requirements.budgetMax != null ? `₹${requirements.budgetMax.toLocaleString('en-IN')}` : '—'}`
                          : undefined
                      }
                    />
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Budget not specified.</p>
                )}
              </SectionCard>

              <SectionCard title="Final Estimate">
                {latestEstimate ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Estimate Range" value={`${formatBidAmount(latestEstimate.minCost)} – ${formatBidAmount(latestEstimate.maxCost)}`} />
                    <Field label="Version" value={`v${latestEstimate.versionNumber}${latestEstimate.status === 'active' ? ' · Locked' : ''}`} />
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No estimate generated yet.</p>
                )}
              </SectionCard>

              <SectionCard title="Payments">
                {payments.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Amount Paid" value={formatBidAmount(totalPaid)} />
                    <Field label="Payment Status" value={payments.some(p => p.status === 'completed') ? 'Advance Paid' : 'Pending'} />
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No payments recorded yet.</p>
                )}
              </SectionCard>

              <SectionCard title="Project Timeline">
                {timelineEntries.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {timelineEntries.map(entry => (
                      <div key={entry.label} className="flex items-center justify-between gap-3">
                        <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{entry.label}</p>
                        <p className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{entry.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Timeline not available yet.</p>
                )}
              </SectionCard>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              <SectionCard title="Selected Contractor">
                {awardedBid ? (
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
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No contractor selected yet.</p>
                )}
              </SectionCard>

              <SectionCard title="Awarded Bid">
                {awardedBid ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Bid Amount" value={isCustomer ? '—' : formatBidAmount(awardedBid.amount)} />
                      <Field label="Duration" value={formatBidDuration(awardedBid.duration, awardedBid.durationUnit)} />
                      <Field label="Proposed Start" value={awardedBid.proposedStartDate ? formatDate(awardedBid.proposedStartDate) : 'Not specified'} />
                      <Field label="Submitted" value={formatDate(awardedBid.createdAt)} />
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No bid awarded yet.</p>
                )}
              </SectionCard>

              <SectionCard title="Next Step">
                <p className="text-[13px] text-[#68636D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>
                  {awardedBid
                    ? 'Coordinate with your selected contractor from the project workspace.'
                    : 'Once you select a contractor, their details will appear here.'}
                </p>
                <button type="button" onClick={goToWorkspace} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                  Go to Project Workspace →
                </button>
              </SectionCard>
            </div>
          </div>

          {/* Project actions — nav-only, no feature implementation here */}
          <div>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>Project Actions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(isCustomer ? ACTION_CARDS.filter(card => card.id === 'documents' || card.id === 'progress') : ACTION_CARDS).map(card => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => navTo(card.dest)}
                  className="flex items-center gap-3 rounded-[14px] bg-white p-4 text-left cursor-pointer hover:border-[#722ED1] transition-colors"
                  style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                >
                  <span className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}>
                    {card.icon}
                  </span>
                  <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{card.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}

// ─── Customer Overview (Module 08 §8 / §12) ─────────────────────────────────
// A linked customer never sees the estimate / bid / payments / contractor
// shell above — only the customer-safe header served by
// GET /projects/:id/customer-view, restricted to the spec §8 allow-list:
// name, location, property type, status, stage, timeline dates and the
// organization's display name. No project `summary`, no organizationId.

function formatCustomerDate(value: string | null): string {
  if (!value) return '—'
  return Number.isNaN(Date.parse(value)) ? value : formatDate(value)
}

function CustomerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{value}</p>
    </div>
  )
}

function CustomerOverview({
  projectId,
  projectName,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [header, setHeader] = useState<CustomerViewHeader | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setStatus('loading')
    getCustomerView(projectId)
      .then(row => {
        if (cancelled) return
        setHeader(row)
        setStatus('loaded')
      })
      .catch(err => {
        if (cancelled) return
        setError(describeCustomerViewError(err))
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [projectId, attempt])

  function goToWorkspace() {
    onNavigate('project-workspace', projectId ? { project_id: projectId } : undefined)
  }

  const title = header?.name ?? projectName ?? 'Project'
  const stageLabel = header?.stage ? resolvedStageLabel(header.stage) ?? header.stage : null
  const statusLabel = header?.status
    ? (isProjectStatus(header.status) ? PROJECT_STATUS_LABELS[header.status] : header.status)
    : null

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
            <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
              <button type="button" onClick={goToWorkspace} className="flex items-center gap-1.5 min-h-11 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                <IcoBack /> Project Workspace
              </button>
            </div>
          </header>

          <ProjectSubNav active="overview" projectId={projectId} projectName={projectName} variant="customer" onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[820px] mx-auto flex flex-col gap-6 min-w-0">
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Overview</p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{title}</h1>
              </div>

              {!projectId ? (
                <SectionCard>
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Project not found.</p>
                </SectionCard>
              ) : status === 'loading' ? (
                <SectionCard>
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading project…</p>
                </SectionCard>
              ) : status === 'error' ? (
                <div className="rounded-[12px] px-4 py-3 flex flex-col items-start gap-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                  <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
                  <button
                    type="button"
                    onClick={() => setAttempt(n => n + 1)}
                    className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                    style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                  >
                    Try again
                  </button>
                </div>
              ) : !header ? (
                <SectionCard>
                  <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>No project details have been shared with you yet.</p>
                </SectionCard>
              ) : (
                <SectionCard title="Project Details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <CustomerField label="Project" value={header.name} />
                    <CustomerField label="Builder" value={header.organizationName ?? '—'} />
                    <CustomerField label="Location" value={header.location ?? '—'} />
                    <CustomerField label="Property Type" value={header.propertyType ?? '—'} />
                    <CustomerField label="Status" value={statusLabel ?? '—'} />
                    <CustomerField label="Current Stage" value={stageLabel ?? '—'} />
                    <CustomerField label="Start Date" value={formatCustomerDate(header.timelineStart)} />
                    <CustomerField label="Expected Completion" value={formatCustomerDate(header.timelineCompletion)} />
                  </div>
                </SectionCard>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ProjectOverviewScreen(props: ProjectOverviewScreenProps) {
  const audience = useProjectAudience(props.projectId)
  const canViewProject = props.role === 'homeowner' || props.role === 'professional'
  if (audience === 'customer' && canViewProject) {
    return <CustomerOverview projectId={props.projectId} projectName={props.projectName} onNavigate={props.onNavigate} />
  }
  return <CompanyProjectOverview {...props} />
}
