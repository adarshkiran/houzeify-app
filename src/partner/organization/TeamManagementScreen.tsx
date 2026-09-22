import { useEffect, useMemo, useState } from 'react'
import { companyInitials } from '@/data/companyInformation'
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type MemberRole } from '@/data/teamSetup'
import { listOrganizationMembers, type OrganizationMember } from '@/data/organizationApi'
import { useAuth } from '@/data/authState'
import PartnerNavRail from '@/shared/components/PartnerNavRail'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 089 — Team Management ───────────────────────────────────────────
// A PROFESSIONAL screen reached from 088 (now also the canonical "Team"
// destination from PartnerNavRail — see constructionNav.ts's Module 02 fix).
//
// Houzeify 2.0 Module 02 — a real backend organization_members table (and a
// working GET /:organizationId/members route) now exists (12G-B), so
// "Confirmed Members" below is real, live data — never fabricated. It
// currently ever shows exactly one row (the owner, created atomically with
// the organization; see organization.service.ts's createOrganization()),
// since no invite-a-member API exists yet — invitations still only ever
// produce the session-local snapshot Screen 027 (Team Setup) forwards
// forward: invited_count, invited_emails, team_summary. "Invited People"
// stays deliberately distinct from "Confirmed Members" — inviting someone
// is not the same as them being an active, persisted member. Role
// definitions (Section 4) are teamSetup.ts's own static reference table.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoMail = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3.5" width="12" height="9" rx="1.5" /><path d="M2.5 4.5L8 9l5.5-4.5" /></svg>
)
const IcoTeam = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.25" /><path d="M2 15v-1a4.5 4.5 0 019 0v1" /><circle cx="13" cy="6.5" r="1.9" /><path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" /></svg>
)
const IcoShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6Z" /><path d="M9 12l2 2l4-4" /></svg>
)

function SectionCard({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      <div className="flex items-center gap-2.5 mb-3">
        {icon && <span className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}>{icon}</span>}
        <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

const ROLE_ORDER: MemberRole[] = ['owner', 'admin', 'project-manager', 'team-member', 'viewer']

interface TeamManagementScreenProps {
  role?: string
  organizationId?: string
  companyName?: string
  companyOwner?: string
  invitedCount?: string
  invitedEmails?: string
  teamSummary?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function TeamManagementScreen({
  role,
  organizationId,
  companyName,
  companyOwner,
  invitedCount,
  invitedEmails,
  teamSummary,
  onNavigate,
}: TeamManagementScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])

  const auth = useAuth()
  const [members, setMembers] = useState<OrganizationMember[] | null>(null)
  const [membersStatus, setMembersStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  useEffect(() => {
    if (!organizationId) return
    let cancelled = false
    setMembersStatus('loading')
    listOrganizationMembers(organizationId)
      .then(result => {
        if (cancelled) return
        setMembers(result)
        setMembersStatus('loaded')
      })
      .catch(() => {
        if (!cancelled) setMembersStatus('error')
      })
    return () => { cancelled = true }
  }, [organizationId])

  if (!isProfessional) return null

  function goToSettings() {
    onNavigate('organization-settings')
  }

  const hasOrganization = Boolean(organizationId && companyName)

  if (!hasOrganization) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Organization information unavailable.</p>
          <button type="button" onClick={goToSettings} className="h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer" style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            ← Back to Organization Settings
          </button>
        </div>
      </div>
    )
  }

  const initials = companyInitials(companyName as string)

  // Real emails only — trimmed, empties dropped. Never a reconstructed
  // member list; these are exactly the strings 027 forwarded.
  const emails = useMemo(
    () => (invitedEmails ?? '').split(',').map(e => e.trim()).filter(Boolean),
    [invitedEmails]
  )

  const hasInvitedCount = invitedCount !== undefined && invitedCount !== ''
  const hasTeamSummary = Boolean(teamSummary)

  function goToTeamSetup() {
    onNavigate('team-setup')
  }

  const linkClass = 'text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0'

  return (
    <div className="h-full flex" style={{ backgroundColor: '#FFFFFF' }}>
      <PartnerNavRail active="team" onNavigate={onNavigate} organizationId={organizationId} />
      <div className="flex-1 flex flex-col min-w-0 relative">

      <header className="shrink-0 relative z-10 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToSettings} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Organization Settings
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
              {initials}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Team Management</p>
              <h1 className="text-[19px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{companyName}</h1>
              {companyOwner && (
                <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>Organization Owner: {companyOwner}</p>
              )}
            </div>
          </div>

          {/* Team Overview */}
          <SectionCard title="Team Overview">
            {hasInvitedCount ? (
              <div>
                <p className="text-[26px] font-bold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{invitedCount}</p>
                <p className="text-[12.5px] text-[#68636D] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Invitations Sent</p>
              </div>
            ) : (
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No team invitations have been recorded in this session.</p>
            )}
          </SectionCard>

          {/* Confirmed Members — real organization_members backend data
              (Module 02), never the session-local invite snapshot below. */}
          <SectionCard icon={<IcoTeam />} title="Confirmed Members">
            {membersStatus === 'loading' && (
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Loading members…</p>
            )}
            {membersStatus === 'error' && (
              <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Unable to load your team's members right now.</p>
            )}
            {membersStatus === 'loaded' && members && (
              <div className="flex flex-col gap-2">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between gap-3 rounded-[10px] px-3.5 py-2.5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3DDD7' }}>
                    <span className="text-[13px] font-medium text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>
                      {member.userId === auth.user?.id ? 'You' : `Member ${member.userId.slice(0, 8)}`}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: '#F3EAFF', color: '#722ED1', fontFamily: FONT_MONO }}>
                        {ROLE_LABELS[member.role as MemberRole] ?? member.role}
                      </span>
                      <span className="text-[11px] font-semibold" style={{ color: '#68636D', fontFamily: FONT_MONO }}>{member.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Invited People */}
          <SectionCard icon={<IcoMail />} title="Invited People">
            {emails.length > 0 ? (
              <>
                <div className="flex flex-col gap-2 mb-4">
                  {emails.map(email => (
                    <div key={email} className="flex items-center justify-between gap-3 rounded-[10px] px-3.5 py-2.5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3DDD7' }}>
                      <span className="text-[13px] font-medium text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{email}</span>
                      <span className="text-[11px] font-semibold shrink-0" style={{ color: '#68636D', fontFamily: FONT_MONO }}>Invitation sent</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11.5px] text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>
                  These are people who were invited — not confirmed active team members.
                </p>
                <button type="button" onClick={goToTeamSetup} className={linkClass} style={{ fontFamily: FONT_BODY }}>
                  Manage Invitations →
                </button>
              </>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>No team invitations yet.</p>
                <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Invite people through Team Setup to begin building your team.</p>
                <button type="button" onClick={goToTeamSetup} className={`${linkClass} mt-1`} style={{ fontFamily: FONT_BODY }}>
                  Manage Invitations →
                </button>
              </div>
            )}
          </SectionCard>

          {/* Team Summary */}
          {hasTeamSummary && (
            <SectionCard icon={<IcoTeam />} title="Team Summary">
              <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{teamSummary}</p>
              <p className="text-[11.5px] text-[#9A949D] m-0 mt-1.5" style={{ fontFamily: FONT_BODY }}>Summary from the most recent Team Setup invitation flow.</p>
            </SectionCard>
          )}

          {/* Team Roles — reference only */}
          <SectionCard icon={<IcoShield />} title="Team Roles">
            <p className="text-[12px] text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>
              Role definitions are currently shown for reference. Member roles are not yet persisted.
            </p>
            <div className="flex flex-col gap-3 mb-4">
              {ROLE_ORDER.map(r => (
                <div key={r} className="pb-3" style={{ borderBottom: r !== 'viewer' ? '1px solid #CAC7C6' : 'none' }}>
                  <p className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{ROLE_LABELS[r]}</p>
                  <p className="text-[12px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{ROLE_DESCRIPTIONS[r]}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onNavigate('roles-permissions')} className={linkClass} style={{ fontFamily: FONT_BODY }}>
              Roles &amp; Permissions →
            </button>
          </SectionCard>

          {/* Future member detail — no real member id exists, so this is a
              disabled future-state affordance, never a fake id passed to
              a route that would need one to mean anything. */}
          <div className="rounded-[16px] p-5 flex items-center justify-between gap-3 flex-wrap" style={{ border: '1px dashed #E3DDD7', backgroundColor: '#FFFFFF' }}>
            <div>
              <p className="text-[13px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Team Member Details</p>
              <p className="text-[12px] text-[#9A949D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>Available once invited people become confirmed members.</p>
            </div>
            <span className="h-9 px-3.5 rounded-[10px] text-[12.5px] font-semibold flex items-center" style={{ backgroundColor: '#F4F0EC', color: '#9A949D', fontFamily: FONT_BODY }}>
              Coming soon
            </span>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
