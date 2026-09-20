import { useEffect } from 'react'
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, type MemberRole } from '@/data/teamSetup'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 091 — Roles & Permissions ───────────────────────────────────────
// A PROFESSIONAL screen reached from 088/089. READ-ONLY reference screen —
// per the completed 090/091 diagnostic, no persisted OrganizationMember, no
// member ID, no persisted role assignment, and no permission enforcement
// exists anywhere in this codebase. This screen therefore only ever
// displays teamSetup.ts's own static ROLE_LABELS/ROLE_DESCRIPTIONS/
// ROLE_PERMISSIONS taxonomy — never a role attached to a specific person,
// never a member count, never an "assign role" control, since none of
// those have any real data or function to back them.

const ROLE_ORDER: MemberRole[] = ['owner', 'admin', 'project-manager', 'team-member', 'viewer']


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6Z" /><path d="M9 12l2 2l4-4" /></svg>
)
const IcoInfo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5" /><line x1="8" y1="7.2" x2="8" y2="11.2" /><circle cx="8" cy="4.8" r="0.2" fill="currentColor" /></svg>
)
const IcoCheck = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

interface RolesPermissionsScreenProps {
  role?: string
  companyName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function RolesPermissionsScreen({
  role,
  companyName,
  onNavigate,
}: RolesPermissionsScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  function goToTeamManagement() {
    onNavigate('team-management')
  }

  const linkClass = 'text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0'

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      <header className="shrink-0 relative z-10 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToTeamManagement} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Team Management
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[820px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Roles &amp; Permissions</p>
            <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Manage how organization roles are structured and what each role can access.</h1>
            {companyName && (
              <p className="text-[13px] text-[#68636D] m-0 mt-1.5" style={{ fontFamily: FONT_BODY }}>{companyName}</p>
            )}
          </div>

          {/* Reference-only notice */}
          <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px] border" style={{ borderColor: 'rgba(243,234,255,0.10)', backgroundColor: '#F9F5FF' }}>
            <span className="text-[#722ED1] mt-0.5 shrink-0"><IcoInfo /></span>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Reference Only</span>
              <p className="text-[12.5px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                Role definitions are currently shown for reference. Member roles and permissions will become assignable once team membership is persisted. These role definitions describe the permissions available to organizations — individual member assignments are not yet persisted.
              </p>
            </div>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ROLE_ORDER.map(r => (
              <div key={r} className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}><IcoShield /></span>
                  <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0" style={{ fontFamily: FONT_MONO }}>{ROLE_LABELS[r]}</p>
                </div>
                <p className="text-[13px] text-[#68636D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>{ROLE_DESCRIPTIONS[r]}</p>
                <p className="text-[10.5px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-2" style={{ fontFamily: FONT_MONO }}>Permissions</p>
                <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
                  {ROLE_PERMISSIONS[r].map(p => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="w-[15px] h-[15px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
                        <span style={{ color: '#16A34A' }}><IcoCheck /></span>
                      </span>
                      <span className="text-[12.5px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button type="button" onClick={goToTeamManagement} className={linkClass} style={{ fontFamily: FONT_BODY }}>
              ← Team Management
            </button>
            <button type="button" onClick={() => onNavigate('organization-settings')} className={linkClass} style={{ fontFamily: FONT_BODY }}>
              Organization Settings →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
