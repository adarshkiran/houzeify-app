import { useEffect, useMemo } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { getAwardedBid } from '@/data/bids'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 070 — Project Team ──────────────────────────────────────────────
// A HOMEOWNER screen reached from 068 (Project Workspace). Shows WHO is
// involved in this project: the homeowner (existing account data) and, once
// awarded, the selected contractor (bids.ts's getAwardedBid() +
// contractorDirectory.ts's getContractorListingById() — the exact same
// derivation already proven in 066-069). No ProjectTeam/ProjectMember model
// exists anywhere in the codebase (confirmed via grep) and none is created
// here — a contractor reaching status 'accepted' is not a second membership
// record, just this screen reading that same fact. This is NOT 089/090/091
// (organization team administration) — purely a read view of this one
// project's people.

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
const IcoHome = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5L9 3l6 5.5" /><path d="M4.5 7.5V15h9V7.5" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

interface ProjectTeamScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  propertyType?: string
  location?: string
  projectStage?: string
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

export default function ProjectTeamScreen({
  role,
  userId,
  projectId,
  projectName,
  propertyType: _propertyType,
  location,
  projectStage: _projectStage,
  fullName,
  preferredName,
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
}: ProjectTeamScreenProps) {
  // Houzeify 2.0 Module 03 — see ProjectWorkspaceScreen.tsx's identical
  // comment: a project can now belong to a company, so a professional
  // must be able to open one of their organization's real projects here
  // too, not just a homeowner.
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

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0'

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
            Back to Workspace
          </button>
        </div>
      </div>
    )
  }

  // 12G-D — real projectData identity only (bridged from CustomerProfile);
  // no hardcoded homeownerProfile fixture fallback.
  const ownerName = fullName || preferredName || 'Homeowner'

  const name = listing?.name ?? 'Professional'
  const kind = listing?.kind ?? (awardedBid?.organizationId ? 'organization' : 'individual')
  const initials = kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')

  function viewContractorProfile() {
    if (!awardedBid) return
    onNavigate('contractor-profile', {
      professional_id: awardedBid.organizationId ? '' : awardedBid.userId,
      organization_id: awardedBid.organizationId ?? '',
      project_id: projectId as string,
    })
  }

  function goToMessages() {
    onNavigate('project-messages', { project_id: projectId as string })
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">

      <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToWorkspace} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Project Workspace
          </button>
        </div>
      </header>

      <ProjectSubNav active="team" projectId={projectId} projectName={projectName} onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[760px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Team</p>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
            {location && (
              <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                <IcoMapPin /> {location}
              </span>
            )}
            <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>People and professionals involved in this project.</p>
          </div>

          {/* Project owner */}
          <SectionCard title="Project Owner">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center shrink-0" style={{ fontFamily: FONT_HEAD }}>
                <IcoHome />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{ownerName}</p>
                <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>Homeowner</p>
              </div>
            </div>
          </SectionCard>

          {/* Selected contractor */}
          {awardedBid && (
            <SectionCard title="Contractor">
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
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-[0.03em]" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontFamily: FONT_MONO }}>
                      SELECTED
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button type="button" onClick={viewContractorProfile} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                    View Profile →
                  </button>
                  <button type="button" onClick={goToMessages} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                    Message →
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Additional project professionals — no project-member model exists
              anywhere in the codebase (confirmed via grep), so this is always
              the honest empty state, never fabricated members. */}
          <SectionCard title="Project Professionals">
            {awardedBid ? (
              <div className="flex flex-col gap-1">
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Your selected contractor is now part of this project.</p>
                <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No additional project professionals have been added yet.</p>
              </div>
            ) : (
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No additional team members yet.</p>
            )}
          </SectionCard>
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
