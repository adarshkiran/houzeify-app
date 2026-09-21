import { useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { useOrganizations } from '@/data/organizationState'
import { useCustomerProfile } from '@/data/customerProfileState'
import { usePartnerProfile } from '@/data/partnerProfileState'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 098 — Account Settings ──────────────────────────────────────────
// SHARED between both personas — Account Settings is legitimately relevant
// to homeowners and professionals alike, so this screen deliberately has no
// reverse guard, only per-section role branching after the canonical
// `role` is resolved (never re-derived from primary_intent/professional_type/
// account_type). An account-level navigation hub, never a second profile
// editor: "Profile" and "Preferences" cards only ever link out to the real
// screens that own that content (096/homeowner-profile, 097) — nothing here
// duplicates their fields. Email is shown only where a genuine source
// exists: 12G-D — the real backend CustomerProfile's `email` for
// homeowners, and the real backend PartnerProfile's `contactEmail` for
// individual professionals — omitted entirely for organization
// professionals, since no personal account-level email exists for that
// case (022's company email belongs to 088/092's organization identity,
// never conflated here). Previously read the static homeownerProfile.ts
// fixture and the legacy professionalProfile.ts local store, both of
// which could show a stale/wrong identity (the fixture's fixed demo
// email, or a professionalProfile.ts record wiped by a page refresh) —
// this now reads the same live provider state every other real profile
// screen in the app already uses. Undefined (never a fabricated email)
// when the corresponding profile hasn't loaded/doesn't exist yet.
// "Sign out" reuses the exact onNavigate('welcome') action already used by
// HomeownerProfileScreen.tsx — the one real sign-out affordance in this
// codebase — not a new fabricated implementation. No password/security/
// billing/deletion controls exist anywhere in this codebase, so none are
// shown here, not even as "coming soon" stubs.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2.5L9.5 7L5 11.5" /></svg>
)
const IcoLogout = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 15.5H4a1.5 1.5 0 01-1.5-1.5V4A1.5 1.5 0 014 2.5h3"/><path d="M12 12.5l4-3.5-4-3.5"/><line x1="16" y1="9" x2="6.5" y2="9"/>
  </svg>
)

function SectionCard({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{eyebrow}</p>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[13px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-medium text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

function NavRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-between gap-3 py-2.5 cursor-pointer border-0 bg-transparent text-left">
      <span className="text-[13.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{label}</span>
      <span className="text-[#9A949D]"><IcoChevronRight /></span>
    </button>
  )
}

function SignOutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="account-signout-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="account-signout-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Sign out of Houzeify?</h2>
        <p className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>You can sign back in anytime to access your projects.</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 hover:brightness-90 transition-all" style={{ backgroundColor: '#DC2626', fontFamily: FONT_BODY }}>Sign out</button>
        </div>
      </div>
    </>
  )
}

interface AccountSettingsScreenProps {
  role?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function AccountSettingsScreen({
  role,
  accountType,
  professionalType,
  professionalTypeOther,
  onNavigate,
}: AccountSettingsScreenProps) {
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const isProfessional = role === 'professional'
  const isOrganization = accountType === 'organization'
  const customerProfile = useCustomerProfile()
  const partnerProfile = usePartnerProfile()
  const { currentOrganization } = useOrganizations()

  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)

  // Email — only ever from a real, correctly-scoped source. Never the
  // organization's own business email (that belongs to 088/092), and never
  // a fixture/stale-local-store fallback (see 12G-D's header comment).
  const email = isProfessional
    ? (isOrganization ? undefined : partnerProfile.profile?.contactEmail ?? undefined)
    : customerProfile.profile?.email ?? undefined

  function goBack() {
    onNavigate(isProfessional ? 'personal-profile' : 'homeowner-profile')
  }

  function goToProfile() {
    onNavigate(isProfessional ? 'personal-profile' : 'homeowner-profile')
  }

  function goToPreferences() {
    onNavigate('preferences')
  }

  function signOutConfirmed() {
    setShowSignOutModal(false)
    onNavigate('welcome')
  }

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Shared screen (see header comment): professionals get the
            company PartnerNavRail (Settings highlighted), homeowners get the
            customer Sidebar ("profile" is the closest item there since
            Account Settings is a profile sub-page). */}
        {isProfessional
          ? <PartnerNavRail active="settings" onNavigate={onNavigate} organizationId={currentOrganization?.id} />
          : <Sidebar active="profile" onNavigate={onNavigate} />}

        <div className="flex flex-col flex-1 min-h-0">
          <header className="shrink-0 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
            <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
              <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                <IcoBack /> {isProfessional ? 'Personal Profile' : 'Profile'}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[560px] mx-auto flex flex-col gap-6">
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Account Settings</p>
                <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Account Settings</h1>
              </div>

              {/* Account information — only genuinely real fields */}
              <SectionCard eyebrow="Account">
                <div className="flex flex-col divide-y" style={{ borderColor: '#FFFFFF' }}>
                  {email && <InfoRow label="Email" value={email} />}
                  <InfoRow label="Role" value={isProfessional ? 'Professional' : 'Homeowner'} />
                  {isProfessional && (
                    <InfoRow label="Account Type" value={isOrganization ? 'Organization' : 'Individual'} />
                  )}
                  {isProfessional && professionalTypeLabel && (
                    <InfoRow label="Professional Type" value={professionalTypeLabel} />
                  )}
                </div>
              </SectionCard>

              {/* Profile — navigation only, never a duplicate editor */}
              <SectionCard eyebrow="Profile">
                <NavRow label={isProfessional ? 'Personal Profile →' : 'Profile →'} onClick={goToProfile} />
              </SectionCard>

              {/* Preferences — homeowner only, since 097 itself has no
                  professional-side support (no preference model exists for
                  professionals). Not shown for professionals rather than
                  linking to a screen that would just redirect them away. */}
              {!isProfessional && (
                <SectionCard eyebrow="Preferences">
                  <NavRow label="Preferences →" onClick={goToPreferences} />
                </SectionCard>
              )}

              {/* Sign out — reuses the one real sign-out action already
                  established elsewhere in this codebase. */}
              <SectionCard eyebrow="Account Actions">
                <button type="button" onClick={() => setShowSignOutModal(true)} className="w-full flex items-center gap-2.5 py-2 cursor-pointer border-0 bg-transparent text-left" style={{ color: '#DC2626' }}>
                  <IcoLogout />
                  <span className="text-[13px] font-medium" style={{ fontFamily: FONT_BODY }}>Sign out</span>
                </button>
              </SectionCard>
            </div>
          </main>
        </div>
      </div>

      {showSignOutModal && <SignOutModal onCancel={() => setShowSignOutModal(false)} onConfirm={signOutConfirmed} />}
    </div>
  )
}
