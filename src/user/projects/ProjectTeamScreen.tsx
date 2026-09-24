import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useAuth } from '@/data/authState'
import { useProjects } from '@/data/projectState'
import { useProjectAudience } from '@/data/customerProjectsState'
import { useProjectWorkforce, type ProjectWorkforceMember } from '@/data/projectWorkforceState'
import { listCustomerViewWorkforce, type CustomerViewWorkforceMember } from '@/data/customerViewApi'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 070 — Project Team (C12) ────────────────────────────────────────
// Who is involved in this project: the project owner (real account props)
// and the real project workforce roster (company API or customer-safe view).
// No bids / contractorDirectory / awarded-contractor marketplace model.

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoHome = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5L9 3l6 5.5" /><path d="M4.5 7.5V15h9V7.5" /></svg>
)
const IcoPeople = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.25" /><path d="M2 15v-1a4.5 4.5 0 019 0v1" /><circle cx="13" cy="6.5" r="1.9" /><path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

function memberLabel(candidateUserId: string, currentUserId: string): string {
  return candidateUserId === currentUserId ? 'You' : `Member ${candidateUserId.slice(0, 8)}`
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
  organizationId: propOrganizationId,
  companyName: propCompanyName,
  onNavigate,
}: ProjectTeamScreenProps) {
  const canViewProject = role === 'homeowner' || role === 'professional'
  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])

  const auth = useAuth()
  const currentUserId = auth.user?.id || userId || ''
  const { getProject } = useProjects()
  const projectRecord = projectId ? getProject(projectId) : undefined
  const organizationId = projectRecord?.organizationId ?? propOrganizationId
  const companyName = propCompanyName

  const audience = useProjectAudience(projectId)
  const isCustomer = audience === 'customer'
  const { status: workforceStatus, members, error: workforceError } = useProjectWorkforce(isCustomer ? undefined : projectId)
  const [customerRoster, setCustomerRoster] = useState<CustomerViewWorkforceMember[]>([])
  const [customerStatus, setCustomerStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  useEffect(() => {
    if (!isCustomer || !projectId) {
      setCustomerRoster([])
      setCustomerStatus('idle')
      return
    }
    let cancelled = false
    setCustomerStatus('loading')
    listCustomerViewWorkforce(projectId)
      .then(rows => {
        if (cancelled) return
        setCustomerRoster(rows)
        setCustomerStatus('loaded')
      })
      .catch(() => {
        if (cancelled) return
        setCustomerRoster([])
        setCustomerStatus('error')
      })
    return () => { cancelled = true }
  }, [isCustomer, projectId])

  if (!canViewProject) return null

  const hasProject = Boolean(projectId && projectName)
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

  const ownerName = fullName || preferredName || 'Project owner'
  const activeMembers: ProjectWorkforceMember[] = members.filter(m => m.status === 'active')
  const companyLoading = !isCustomer && (workforceStatus === 'idle' || workforceStatus === 'loading')
  const companyLoaded = !isCustomer && workforceStatus === 'loaded'
  const customerLoading = isCustomer && (customerStatus === 'idle' || customerStatus === 'loading')
  const customerLoaded = isCustomer && customerStatus === 'loaded'
  const isLoading = companyLoading || customerLoading
  const hasTeamPeople = isCustomer
    ? customerRoster.length > 0
    : activeMembers.length > 0 || Boolean(organizationId && companyName)

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">

      <ProjectSubNav active="team" projectId={projectId} projectName={projectName} variant={isCustomer ? 'customer' : 'company'} onNavigate={onNavigate} />

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

          <SectionCard title="Project Owner">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center shrink-0" style={{ fontFamily: FONT_HEAD }}>
                <IcoHome />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{ownerName}</p>
                <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>
                  {role === 'professional' ? 'Account' : 'Homeowner'}
                </p>
              </div>
            </div>
          </SectionCard>

          {organizationId && companyName && (
            <SectionCard title="Company">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                  {companyName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{companyName}</p>
                  <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>Organization on this project</p>
                </div>
              </div>
            </SectionCard>
          )}

          {!isCustomer && workforceStatus === 'error' && workforceError && (
            <div className="rounded-[12px] px-4 py-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
              <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{workforceError}</p>
            </div>
          )}

          <SectionCard title="Project Professionals">
            {isLoading ? (
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Loading team…</p>
            ) : isCustomer && customerStatus === 'error' ? (
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Team details are unavailable right now.</p>
            ) : customerLoaded && customerRoster.length > 0 ? (
              <div className="flex flex-col gap-3">
                {customerRoster.map((row, index) => (
                  <div key={`${row.displayName}-${row.role}-${index}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F4F0EC] text-[#68636D] flex items-center justify-center shrink-0">
                      <IcoPeople size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{row.displayName}</p>
                      <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{row.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : companyLoaded && activeMembers.length > 0 ? (
              <div className="flex flex-col gap-3">
                {activeMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F4F0EC] text-[#68636D] flex items-center justify-center shrink-0">
                      <IcoPeople size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
                        {memberLabel(member.userId, currentUserId)}
                      </p>
                      <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{member.role}</p>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onNavigate('project-workforce', projectId ? { project_id: projectId } : undefined)}
                  className="self-start text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0 mt-1"
                  style={{ fontFamily: FONT_BODY }}
                >
                  Manage Workforce →
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#9A949D]" style={{ backgroundColor: '#F4F0EC' }}>
                  <IcoPeople />
                </span>
                <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>
                  {hasTeamPeople
                    ? 'No additional team members yet.'
                    : 'No team members have been added to this project yet.'}
                </p>
                {!isCustomer && (
                  <button
                    type="button"
                    onClick={() => onNavigate('project-workforce', projectId ? { project_id: projectId } : undefined)}
                    className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0 mt-1"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    Open Workforce →
                  </button>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
