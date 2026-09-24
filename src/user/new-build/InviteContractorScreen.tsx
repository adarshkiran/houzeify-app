import { useEffect, useMemo, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import HIcon from '@/shared/components/HIcon'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { companyInitials } from '@/data/companyInformation'
import { profileInitials } from '@/data/professionalProfile'
import type { AccountType } from '@/data/accountType'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { getActiveBidForProfessional } from '@/data/bids'
import { getActiveInvitation, createInvitation, MESSAGE_MAX } from '@/data/invitations'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 062 — Invite Contractor ─────────────────────────────────────────
// A HOMEOWNER screen — invites ONE specific professional (found via
// 060/061) to review a project and submit a proposal. This is explicitly
// NOT a bid, NOT an award, and NOT a selection — it only ever creates a
// ProjectInvitation (invitations.ts), status 'pending'. Reuses the SAME
// contractorDirectory.ts listing lookup 060/061 already use — never a
// second directory. Reuses bids.ts's real store for the "already bid"
// check — never a duplicate bid model.

const CURRENT_USER_ID = 'user-demo-001' // established demo-identity convention

// No screen in this codebase ever actually writes projectData.project_id —
// Create Project only ever sets project_name/property_type/location, and
// boqOverview.ts's own projectId ('proj-001') is a local constant BOQ/
// Estimate screens read directly, never threading it back into the shared
// data bag via onNavigate. So a real projectId is realistically never
// present by the time a homeowner reaches Invite Contractor from Find
// Contractors → Contractor Profile — even though a real project (real
// name, real location) genuinely exists. Rather than block the entire
// screen on a field nothing populates, this reuses that SAME fixed id
// boqOverview.ts already treats as "the current project" — never a
// fabricated id, just the one this demo already has — as the fallback
// once a real project is confirmed to exist (projectName present).
const DEFAULT_PROJECT_ID = 'proj-001'


const IcoMapPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12.5S11.5 8.6 11.5 5.5A4.5 4.5 0 007 1 4.5 4.5 0 002.5 5.5C2.5 8.6 7 12.5 7 12.5z" /><circle cx="7" cy="5.5" r="1.5" /></svg>
)
const CheckBadgeIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="var(--hz-success)" /><path d="M4 7l2 2 4-4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const InfoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#A1A1A1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="14" cy="14" r="11" /><line x1="14" y1="12.5" x2="14" y2="19" /><circle cx="14" cy="9" r="0.6" fill="#A1A1A1" stroke="none" /></svg>
)

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
      {title && <h2 className="text-[13px] font-semibold text-[var(--hz-ink)] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{title}</h2>}
      {children}
    </div>
  )
}

interface InviteContractorScreenProps {
  role?: string
  userId?: string
  // The professional/organization being invited — carried from Screen 061.
  professionalId?: string
  organizationId?: string
  // The project the invitation is for — carried from Screen 061.
  projectId?: string
  // The current session's own real professional identity — the same shape
  // 060/061 already use to reconstruct the one real ContractorListing this
  // demo can ever surface.
  companyName?: string
  location?: string
  accountType?: string
  professionalType?: string
  verificationStatus?: string
  serviceCategories?: string
  serviceLocations?: string
  portfolioProjectCount?: string
  serviceDescription?: string
  // The homeowner's own project — read directly from the persistent data
  // bag, the same way 060/061 already read projectName/projectLocation.
  projectName?: string
  propertyType?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function InviteContractorScreen({
  role,
  userId,
  professionalId,
  organizationId,
  projectId,
  companyName,
  location,
  accountType,
  professionalType,
  verificationStatus,
  serviceCategories,
  serviceLocations,
  portfolioProjectCount,
  serviceDescription,
  projectName,
  propertyType,
  onNavigate,
}: InviteContractorScreenProps) {
  const isHomeowner = role === 'homeowner'
  useEffect(() => {
    if (!isHomeowner) onNavigate('professional-dashboard')
  }, [isHomeowner, onNavigate])
  if (!isHomeowner) return null

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

  const viewedId = organizationId || professionalId || ''
  const listing = useMemo(
    () => (viewedId ? getContractorListingById(viewedId, directoryInput) : undefined),
    [viewedId, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories, directoryInput.serviceLocations, directoryInput.verificationStatus,
      directoryInput.portfolioProjectCount, directoryInput.serviceDescription]
  )

  const effectiveProjectId = projectId || (projectName ? DEFAULT_PROJECT_ID : undefined)
  const hasValidContext = Boolean(effectiveProjectId) && Boolean(listing)

  const existingInvitation = useMemo(
    () => (hasValidContext ? getActiveInvitation(effectiveProjectId as string, listing!.professionalId, listing!.organizationId) : undefined),
    [hasValidContext, effectiveProjectId, listing]
  )
  // bids.ts's Bid.opportunityId has no real cross-reference to this app's
  // own project id in the current demo flows (a homeowner's own project and
  // a posted ProjectOpportunity are separate, currently-unconnected
  // pipelines — see this module's own header note) — this is still the
  // correct, real query to run; it simply won't ever find a match until
  // those two flows are wired together, which this task does not do.
  const existingBid = useMemo(
    () => (hasValidContext ? getActiveBidForProfessional(effectiveProjectId as string, CURRENT_USER_ID) : undefined),
    [hasValidContext, effectiveProjectId]
  )

  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function goBackToContractors() {
    onNavigate('find-contractors')
  }

  function handleCancel() {
    onNavigate('contractor-profile', {
      professional_id: professionalId ?? '',
      organization_id: organizationId ?? '',
      ...(projectId ? { project_id: projectId } : {}),
    })
  }

  function handleSend() {
    if (!hasValidContext || sending || existingInvitation || existingBid) return
    setSending(true)
    setError(null)
    try {
      const invitation = createInvitation({
        projectId: effectiveProjectId as string,
        professionalId: listing!.professionalId,
        organizationId: listing!.organizationId,
        invitedByUserId: CURRENT_USER_ID,
        message,
      })
      onNavigate('bids-received', { project_id: effectiveProjectId as string, invitation_id: invitation.id, project_stage: 'bidding' })
    } catch {
      setSending(false)
      setError("Couldn't send the invitation.")
    }
  }

  const inputStyle = { border: '1px solid var(--hz-border)', color: 'var(--hz-ink)', fontFamily: FONT_BODY }

  // ─── Invalid context — missing ids, never crash ──────────────────────
  if (!hasValidContext) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Unable to create invitation.</p>
          <button
            type="button"
            onClick={goBackToContractors}
            className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0"
            style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
          >
            Back to Contractors
          </button>
        </div>
      </div>
    )
  }

  const name = listing!.name
  const initials = listing!.kind === 'organization' ? companyInitials(name) : profileInitials(name)
  const typeLabel = listing!.professionalType ? PROFESSIONAL_TYPE_CONTENT[listing!.professionalType].title : (listing!.kind === 'organization' ? 'Organization' : 'Individual Professional')

  // ─── Already invited ────────────────────────────────────────────────
  if (existingInvitation) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-[380px]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary-soft)' }}><InfoIcon /></div>
          <p className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Invitation already sent</p>
          <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>This professional has already been invited to this project.</p>
          <button
            type="button"
            onClick={() => onNavigate('estimate-dashboard')}
            className="mt-1 h-10 px-5 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0"
            style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
          >
            View Project →
          </button>
        </div>
      </div>
    )
  }

  // ─── Already bid ────────────────────────────────────────────────────
  if (existingBid) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-[380px]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}><CheckBadgeIcon size={22} /></div>
          <p className="text-[16px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Bid already submitted</p>
          <p className="text-[13.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>This professional has already submitted a proposal for this project.</p>
          <button
            type="button"
            onClick={() => onNavigate('project-opportunity-detail', { opportunity_id: effectiveProjectId as string, bid_id: existingBid.id })}
            className="mt-1 h-10 px-5 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0"
            style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
          >
            View Proposal →
          </button>
        </div>
      </div>
    )
  }

  // ─── Form ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="contractors" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0">
      <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="h-14 flex items-center px-4 sm:px-6 lg:px-8">
          <HIcon size={26} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[800px] mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Invite Contractor</h1>
            <p className="text-[13.5px] text-[var(--hz-ink-muted)] mt-1.5 mb-0" style={{ fontFamily: FONT_BODY }}>
              Invite this professional to review your project and submit a proposal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Professional summary */}
            <SectionCard>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[14.5px] font-semibold text-[var(--hz-ink)] m-0 truncate" style={{ fontFamily: FONT_HEAD }}>{name}</p>
                    {listing!.verificationStatus === 'verified' && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--hz-success)]" style={{ fontFamily: FONT_BODY }}><CheckBadgeIcon /> Verified</span>
                    )}
                  </div>
                  <p className="text-[12px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{typeLabel}</p>
                  {listing!.location && (
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink-muted)] mt-1" style={{ fontFamily: FONT_BODY }}>
                      <IcoMapPin /> {listing!.location}
                    </span>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Project summary */}
            <SectionCard>
              <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Project</p>
              <p className="text-[14.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your project'}</p>
              {propertyType && <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>{propertyType}</p>}
              {location && (
                <span className="flex items-center gap-1.5 text-[12px] text-[var(--hz-ink-muted)] mt-1" style={{ fontFamily: FONT_BODY }}>
                  <IcoMapPin /> {location}
                </span>
              )}
            </SectionCard>
          </div>

          {/* Message */}
          <SectionCard title="Message to contractor">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
              placeholder="Hi, I'm interested in discussing this project with you. Please review the project details and submit your proposal."
              rows={5}
              className="w-full rounded-[10px] p-3 text-[13.5px] outline-none resize-none"
              style={inputStyle}
            />
            <p className="text-[11px] text-[var(--hz-ink-subtle)] m-0 mt-1.5 text-right" style={{ fontFamily: FONT_BODY }}>{message.length}/{MESSAGE_MAX}</p>
          </SectionCard>

          {/* Invitation summary */}
          <div className="rounded-[16px] p-5" style={{ backgroundColor: 'var(--hz-primary-wash)', border: '1px solid var(--hz-primary-soft)' }}>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>You Are Inviting</p>
            <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{name}</p>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>To Project</p>
            <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0 mb-3" style={{ fontFamily: FONT_HEAD }}>{projectName || 'Your project'}</p>
            <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
              The professional will receive the invitation and can review the project before deciding whether to submit a bid.
            </p>
          </div>

          {error && (
            <div className="rounded-[12px] p-4" style={{ backgroundColor: '#FEE2E2', border: '1px solid #F3D2D2' }}>
              <p className="text-[13px] font-medium text-[var(--hz-danger)] m-0" style={{ fontFamily: FONT_BODY }}>{error}</p>
              <p className="text-[12px] text-[var(--hz-danger)] m-0 mt-1 opacity-80" style={{ fontFamily: FONT_BODY }}>Your message is still here.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={sending}
              className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-[var(--hz-surface)]"
              style={{ border: '1px solid var(--hz-border)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="h-11 px-6 rounded-[12px] text-[13.5px] font-semibold text-white cursor-pointer border-0 disabled:opacity-60"
              style={{ backgroundColor: 'var(--hz-primary)', fontFamily: FONT_BODY }}
            >
              {sending ? 'Sending...' : error ? 'Try again' : 'Send Invitation →'}
            </button>
          </div>
        </div>
      </main>
        </div>
      </div>
    </div>
  )
}
