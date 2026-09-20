import { useEffect } from 'react'
import { profileInitials } from '@/data/professionalProfile'
import { usePartnerProfile } from '@/data/partnerProfileState'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

// ─── Screen 096 — Personal Profile ──────────────────────────────────────────
// A PROFESSIONAL, INDIVIDUAL-account screen. The private/account-facing
// identity view for an individual professional — NOT a duplicate of 020
// (the real editor), 081 (the public listing), 092 (organization identity)
// or 088 (organization administration).
//
// 12G-D — migrated off the legacy professionalProfile.ts local store
// (getProfessionalProfile(OWNER_ID)) onto the real backend PartnerProfile
// (usePartnerProfile()). The legacy store is an in-memory Map that resets
// on every page refresh, so this screen used to show "Profile not set up
// yet" for a real professional with a real, backend-persisted PartnerProfile
// the moment they reloaded the page — the same class of bug 12G-C3 already
// fixed for CompanyProfileScreen/organizations. profileInitials() (the pure
// helper, not the store) is still used for the avatar. No inline editor:
// the only real writer of this data remains Screen 020
// (ProfessionalProfileSetupScreen), unchanged by this fix.


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{value}</p>
    </div>
  )
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

interface PersonalProfileScreenProps {
  role?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function PersonalProfileScreen({
  role,
  accountType,
  professionalType,
  professionalTypeOther,
  onNavigate,
}: PersonalProfileScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  const partnerProfile = usePartnerProfile()
  if (!isProfessional) return null

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer'

  function goToDashboard() {
    onNavigate('professional-dashboard')
  }

  // Organization accounts never use this model — Screen 092 is their real
  // identity equivalent, and no organization information is duplicated here.
  const isOrganization = accountType === 'organization'
  if (isOrganization) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-[420px]">
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Personal profile is available for individual professionals.</p>
          <button type="button" onClick={() => onNavigate('organization-profile')} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            View Organization Profile →
          </button>
        </div>
      </div>
    )
  }

  // 12G-D — 'idle'/'loading' is a real, distinct state from 'not-found':
  // showing the "Profile not set up yet" CTA while the real PartnerProfile
  // is still being fetched would wrongly tell an existing professional
  // their profile doesn't exist. A brief, honest loading state instead.
  if (partnerProfile.status === 'idle' || partnerProfile.status === 'loading') {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading your profile…</p>
      </div>
    )
  }

  const profile = partnerProfile.profile

  if (!profile) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-[420px]">
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Profile not set up yet</p>
          <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Complete your professional profile to add your personal information.</p>
          <button type="button" onClick={() => onNavigate('professional-profile-setup')} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            Set Up Profile →
          </button>
        </div>
      </div>
    )
  }

  const displayName = profile.displayName || profile.fullName
  const initials = profileInitials(displayName)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      <header className="shrink-0 relative z-10 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToDashboard} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Professional Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[640px] mx-auto flex flex-col gap-6">
          {/* Identity hero — no profile-image field exists on the real
              backend PartnerProfile (12G-B's schema), so this is always the
              initials circle now, never a fabricated/stale photo. */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[15px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
              {initials}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Personal Profile</p>
              <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{displayName}</h1>
              {professionalTypeLabel && (
                <p className="text-[12.5px] text-[#68636D] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel}</p>
              )}
            </div>
          </div>

          {/* Contact information */}
          {(profile.contactEmail || profile.contactPhone) && (
            <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" value={profile.contactEmail ?? undefined} />
                <Field label="Phone" value={profile.contactPhone ?? undefined} />
              </div>
            </div>
          )}

          {/* About */}
          <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>About</p>
            <p className="text-[13.5px] text-[#242326] m-0 mb-4 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
              {profile.about ? profile.about : 'No description provided yet.'}
            </p>
            <button type="button" onClick={() => onNavigate('professional-profile-setup')} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Edit Profile →
            </button>
          </div>

          {/* Profile metadata — real createdAt only */}
          <div className="rounded-[16px] p-4" style={{ border: '1px dashed #E3DDD7', backgroundColor: '#FFFFFF' }}>
            <p className="text-[10.5px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Profile Created</p>
            <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{formatCreatedAt(profile.createdAt)}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
