import { useEffect } from 'react'
import { organizationInitials, ORGANIZATION_TYPE_LABELS, type OrganizationType } from '@/data/organization'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 092 — Organization Profile ──────────────────────────────────────
// A PROFESSIONAL, organization-only screen reached from 088. A minimal
// identity/profile preview — NOT a duplicate of 081 (services/portfolio/
// reviews/verification), 088 (business contact/team/roles), or 022 (the
// Company Information form). Per the completed diagnostic, the two fields
// genuinely unique to this screen are projectData.organization_type (021's
// own taxonomy — never confused with company_type, 022's separate one) and
// projectData.about (the organization branch's real "about the company"
// text from Screen 020 — never silently replaced with service_description,
// a different real field 081 already reads). No organization store exists,
// so there is no editor here — only navigation back to the real source
// screens (020/021) that already collect this data.


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

interface OrganizationProfileScreenProps {
  role?: string
  accountType?: string
  organizationId?: string
  companyName?: string
  logoUrl?: string
  location?: string
  companyOwner?: string
  organizationType?: string
  about?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function OrganizationProfileScreen({
  role,
  accountType,
  organizationId,
  companyName,
  logoUrl,
  location,
  companyOwner,
  organizationType,
  about,
  onNavigate,
}: OrganizationProfileScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer'

  function goToSettings() {
    onNavigate('organization-settings')
  }

  // Organization-only screen — an individual professional (or missing
  // context) never gets a fabricated organization here.
  const isOrganization = accountType === 'organization'
  const hasOrganization = isOrganization && Boolean(organizationId && companyName)

  if (!hasOrganization) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-[420px]">
          <p className="text-[15px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Organization information unavailable.</p>
          <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Organization profile information is available for professional organizations.</p>
          <button type="button" onClick={goToSettings} className={selectClass} style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
            ← Organization Settings
          </button>
        </div>
      </div>
    )
  }

  const initials = organizationInitials(companyName as string)
  const organizationTypeLabel = organizationType && organizationType in ORGANIZATION_TYPE_LABELS
    ? ORGANIZATION_TYPE_LABELS[organizationType as OrganizationType]
    : undefined

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      <header className="shrink-0 relative z-10 bg-white" style={{ borderBottom: '1px solid #F4F0EC' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToSettings} className="flex items-center gap-1.5 text-[13px] font-medium text-[#68636D] hover:text-[#242326] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Organization Settings
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[640px] mx-auto flex flex-col gap-6">
          {/* Identity hero */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="w-14 h-14 rounded-[14px] object-cover shrink-0" style={{ border: '1px solid #E3DDD7' }} />
            ) : (
              <div className="w-14 h-14 rounded-[14px] bg-[#F3EAFF] text-[#722ED1] flex items-center justify-center text-[15px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
                {initials}
              </div>
            )}
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Organization Profile</p>
              <h1 className="text-[20px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{companyName}</h1>
            </div>
          </div>

          {/* Identity summary */}
          <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Organization Name" value={companyName} />
              <Field label="Organization Type" value={organizationTypeLabel} />
              <Field label="Location" value={location} />
              <Field label="Primary Contact" value={companyOwner} />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button type="button" onClick={() => onNavigate('create-organization')} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
                Edit Organization →
              </button>
            </div>
          </div>

          {/* About */}
          <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>About the Organization</p>
            <p className="text-[13.5px] text-[#242326] m-0 mb-4 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
              {about ? about : 'No organization description provided yet.'}
            </p>
            <button type="button" onClick={() => onNavigate('professional-profile-setup')} className="text-[12.5px] font-semibold text-[#722ED1] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Edit About →
            </button>
          </div>

          {/* Organization information — technical, not the visual focus */}
          {organizationId && (
            <div className="rounded-[16px] p-4" style={{ border: '1px dashed #E3DDD7', backgroundColor: '#FFFFFF' }}>
              <p className="text-[10.5px] tracking-[0.06em] uppercase text-[#9A949D] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Organization ID</p>
              <p className="text-[12px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{organizationId}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
