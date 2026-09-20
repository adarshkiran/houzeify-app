import { useEffect, useMemo } from 'react'
import Sidebar from '@/shared/components/Sidebar'
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

// ─── Screen 071 — Project Messages (conversation list) ─────────────────────
// A HOMEOWNER screen reached from 068/069/070. Project-scoped conversation
// OVERVIEW. (11C: the global Messages/Conversation Detail screens — 094/095
// — this comment used to reference as this screen's eventual detail view
// were retired for having zero real production entry point anywhere and no
// real conversation data model behind them. This screen was already never
// actually calling into 095 — see the empty-list note below — so nothing
// here changes functionally; only the stale reference is removed.)
//
// ARCHITECTURE SEARCH (done before writing this file): the only existing
// Message/Conversation model in this codebase is src/data/aiAdvisor.ts's
// `Conversation`/`Message` — the Hozie AI-chat model (`role: 'user' |
// 'assistant'`, no persistent store, no participant/recipient concept). It
// represents a homeowner talking to the AI assistant, not a homeowner
// talking to a contractor/professional — reusing it here would misrepresent
// AI chat sessions as human project conversations, so it is deliberately
// NOT reused. No other Message/Conversation/ConversationDetail/message
// store exists anywhere (confirmed via repo-wide search). There is
// therefore no existing per-project, human-to-human conversation-creation
// architecture to hook into: every conversation list here is genuinely
// empty, and "Start Conversation" / "New Message" / "Message Contractor"
// CTAs are correctly omitted per the brief's own instruction to omit them
// when no such architecture exists, rather than inventing one.

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
  userId,
  projectId,
  projectName,
  location,
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
}: ProjectMessagesScreenProps) {
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

  const name = listing?.name ?? 'Professional'
  const kind = listing?.kind ?? (awardedBid?.organizationId ? 'organization' : 'individual')
  const initials = kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = listing?.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing.professionalType].title : (kind === 'organization' ? 'Organization' : 'Individual Professional')

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

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[760px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project Messages</p>
            <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName}</h1>
            {location && (
              <span className="flex items-center gap-1.5 text-[13px] text-[#68636D] mt-1.5" style={{ fontFamily: FONT_BODY }}>
                <IcoMapPin /> {location}
              </span>
            )}
            <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Messages and conversations related to this project.</p>
          </div>

          {/* Selected contractor — the primary project communication
              participant once awarded. No real conversation exists (no
              human-to-human conversation architecture in this codebase),
              so no "Start Conversation" CTA is shown — never invented. */}
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
                    <p className="text-[12.5px] text-[#9A949D] m-0 mt-1.5" style={{ fontFamily: FONT_BODY }}>No messages yet.</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Conversation list — genuinely empty: no conversation/message
              store tied to projects and participants exists anywhere in
              the codebase, so there is nothing real to list or filter. */}
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
