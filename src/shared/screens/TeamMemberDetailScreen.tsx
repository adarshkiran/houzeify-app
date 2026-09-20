import { useEffect } from 'react'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 090 — Team Member Detail ────────────────────────────────────────
// A PROFESSIONAL screen reached from 089. Per the completed diagnostic: no
// OrganizationMember store, no member ID, no member lookup, no persisted
// role/status/join-date exists anywhere in this codebase — only a one-time
// snapshot of invited email addresses and an aggregate role-distribution
// string survive Screen 027 unmounting, and neither can be decomposed back
// into a single member's identity. This screen therefore never invents a
// member — even if a memberId prop is ever passed, there is no real lookup
// source behind it, so the honest "not available yet" state is shown
// unconditionally, never a fabricated profile.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
// A subtle, generic profile icon — never an avatar for a specific person,
// since no real member exists to represent.
const IcoProfile = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 19.5a7.5 7.5 0 0115 0" /></svg>
)

interface TeamMemberDetailScreenProps {
  role?: string
  companyName?: string
  /** Reserved for a future real lookup — there is no real source behind
   *  this today (confirmed by the diagnostic), so its presence never
   *  changes what this screen renders. Never given a fabricated fallback
   *  value anywhere this screen is reached from. */
  memberId?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function TeamMemberDetailScreen({
  role,
  companyName,
  onNavigate,
}: TeamMemberDetailScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  function goToTeamManagement() {
    onNavigate('team-management')
  }

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer'

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      <header className="shrink-0 relative z-10 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToTeamManagement} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Back to Team Management
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[560px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Team Member Detail</p>
            {companyName && (
              <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{companyName}</p>
            )}
          </div>

          <div className="rounded-[16px] bg-white p-8 sm:p-10 flex flex-col items-center text-center gap-3" style={{ border: '1px solid #E3DDD7' }}>
            <span className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F4F0EC', color: '#9A949D' }}>
              <IcoProfile />
            </span>
            <h1 className="text-[17px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Team Member Details</h1>
            <p className="text-[14px] font-semibold text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Member details are not available yet.</p>
            <p className="text-[13px] text-[#9A949D] leading-[1.6] m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
              Team member records are not currently persisted in this prototype. Once team membership is connected to the backend, individual member profiles, roles, status and activity can appear here.
            </p>
            <button type="button" onClick={goToTeamManagement} className={`${selectClass} mt-2`} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
              ← Back to Team Management
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
