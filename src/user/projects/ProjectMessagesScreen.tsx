import { useEffect } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import HIcon from '@/shared/components/HIcon'
import { useProjectAudience } from '@/data/customerProjectsState'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 071 — Project Messages (C12) ────────────────────────────────────
// Project-scoped conversation overview. There is still no human-to-human
// conversation store in this codebase (only Hozie's AI chat model). C12
// removes the awarded-bid / contractorDirectory participant card — Messages
// must not require an awarded bid to render. Honest empty state only.
// C14 — mounts ProjectSubNav with audience variant (was missing).

const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const IcoMessages = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4.5A1.5 1.5 0 013.5 3h11A1.5 1.5 0 0116 4.5v7a1.5 1.5 0 01-1.5 1.5H6l-3.5 3v-3H3.5A1.5 1.5 0 012 11.5v-7z" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      {title && <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>{title}</p>}
      {children}
    </div>
  )
}

interface ProjectMessagesScreenProps {
  role?: string
  userId?: string
  projectId?: string
  projectName?: string
  location?: string
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

export default function ProjectMessagesScreen({
  role,
  projectId,
  projectName,
  location,
  onNavigate,
}: ProjectMessagesScreenProps) {
  const canViewProject = role === 'homeowner' || role === 'professional'
  const audience = useProjectAudience(projectId)
  const variant = audience === 'customer' ? 'customer' : 'company'
  useEffect(() => {
    if (!canViewProject) onNavigate('welcome')
  }, [canViewProject, onNavigate])
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

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="questions" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ProjectSubNav projectId={projectId} projectName={projectName} variant={variant} onNavigate={onNavigate} />

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[760px] mx-auto flex flex-col gap-6 min-w-0">
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Messages</p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0 break-words" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
                {location && (
                  <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                    <IcoMapPin /> {location}
                  </span>
                )}
                <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Messages and conversations related to this project.</p>
              </div>

              <SectionCard>
                <div className="flex flex-col items-center text-center gap-2 py-6">
                  <span className="w-11 h-11 rounded-full flex items-center justify-center text-[#9A949D]" style={{ backgroundColor: '#F4F0EC' }}>
                    <IcoMessages />
                  </span>
                  <p className="text-[14px] font-semibold text-[#242326] m-0 mt-1" style={{ fontFamily: FONT_HEAD }}>No messages yet</p>
                  <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Your project conversations will appear here.</p>
                </div>
              </SectionCard>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
