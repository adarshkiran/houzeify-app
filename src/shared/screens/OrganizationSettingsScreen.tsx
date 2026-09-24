import { useEffect } from 'react'
import HIcon from '@/shared/components/HIcon'
import { companyInitials, COMPANY_TYPE_LABELS, type CompanyType } from '@/data/companyInformation'
import { ROLE_LABELS, ROLE_SHORT_DESCRIPTIONS, ROLE_PERMISSIONS, type MemberRole } from '@/data/teamSetup'
import { getVerificationStatus } from '@/data/businessVerification'
import { VERIFICATION_STATUS_LABELS, parseVerificationStatus } from '@/data/organizationSetup'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 088 — Organization Settings ─────────────────────────────────────
// A PROFESSIONAL screen — an ADMINISTRATIVE SETTINGS HUB, not another
// organization-edit form. Per the completed diagnostic: no Organization
// store/settings store exists anywhere, so this screen reads only the real
// fields already threaded through projectData since 021/022 (organization_id/
// company_name/company_owner/company_type/location/phone/email/website/
// logo_url) — never a fabricated value, never 'org-demo-001' for display.
// Business info editing stays on the real 022 (Company Information); team
// invitations stay on the real 027 (Team Setup). Team Management (089),
// Roles & Permissions (091) and Organization Profile (092) all exist now.
// Roles & Permissions here only ever displays teamSetup.ts's own static
// reference taxonomy — never a real member-role assignment, since no
// invite-a-member API exists yet to assign from (see TeamManagementScreen's
// own header comment for what IS real: the organization_members roster).
// Houzeify 2.0 Module 02 — Verification section added, reading the real
// organizationId-scoped status directly from businessVerification.ts.

const ROLE_ORDER: MemberRole[] = ['owner', 'admin', 'project-manager', 'team-member', 'viewer']


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
const IcoBusiness = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
)
const IcoTeam = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="5.5" r="2.25" /><path d="M2 15v-1a4.5 4.5 0 019 0v1" /><circle cx="13" cy="6.5" r="1.9" /><path d="M11.5 8.6a3.6 3.6 0 014.5 3.5V13" /></svg>
)
const IcoShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6Z" /><path d="M9 12l2 2l4-4" /></svg>
)
const IcoVerified = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7" /><path d="M6 9l2 2 4-4.5" /></svg>
)
const IcoProfile = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="3.2" /><path d="M2.5 15.5a6.5 6.5 0 0113 0" /></svg>
)

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--hz-primary-soft)', color: 'var(--hz-primary)' }}>{icon}</span>
        <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0" style={{ fontFamily: FONT_MONO }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{value}</p>
    </div>
  )
}

interface OrganizationSettingsScreenProps {
  role?: string
  organizationId?: string
  companyName?: string
  companyOwner?: string
  companyType?: string
  location?: string
  phone?: string
  email?: string
  website?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function OrganizationSettingsScreen({
  role,
  organizationId,
  companyName,
  companyOwner,
  companyType,
  location,
  phone,
  email,
  website,
  onNavigate,
}: OrganizationSettingsScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0'

  function goToProfile() {
    onNavigate('company-profile')
  }

  // No organization store exists — organizationId/companyName only ever
  // arrive real, from projectData (021/022), never fabricated here. An
  // individual professional (no organization) or missing context both land
  // here honestly, never a fake org.
  const hasOrganization = Boolean(organizationId && companyName)

  if (!hasOrganization) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <HIcon size={36} />
          <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Organization information unavailable.</p>
          <button type="button" onClick={goToProfile} className={selectClass} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
            ← Back to Profile
          </button>
        </div>
      </div>
    )
  }

  const initials = companyInitials(companyName as string)
  const companyTypeLabel = companyType && companyType in COMPANY_TYPE_LABELS ? COMPANY_TYPE_LABELS[companyType as CompanyType] : undefined

  const hasBusinessInfo = Boolean(phone || email || website || location || companyTypeLabel)

  // Module 02 — company verification is already organization-scoped
  // (businessVerification.ts's own store, keyed by organizationId), so this
  // reads the real current status directly rather than trusting a
  // projectData snapshot that was never threaded to this screen.
  const verification = getVerificationStatus(organizationId as string)
  const resolvedVerification = parseVerificationStatus(verification.status)

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      <header className="shrink-0 relative z-10 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToProfile} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Back
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[13px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }}>
              {initials}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Organization Settings</p>
              <h1 className="text-[19px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{companyName}</h1>
            </div>
          </div>

          {/* Organization summary */}
          <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Organization Name" value={companyName} />
              <Field label="Owner / Primary Contact" value={companyOwner} />
              <Field label="Organization ID" value={organizationId} />
            </div>
          </div>

          {/* Business Information */}
          <SectionCard icon={<IcoBusiness />} title="Business Information">
            {hasBusinessInfo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Field label="Phone" value={phone} />
                <Field label="Email" value={email} />
                <Field label="Website" value={website} />
                <Field label="Location" value={location} />
                <Field label="Company Type" value={companyTypeLabel} />
              </div>
            ) : (
              <p className="text-[13px] text-[var(--hz-ink-subtle)] m-0 mb-4" style={{ fontFamily: FONT_BODY }}>No business information added yet.</p>
            )}
            <button type="button" onClick={() => onNavigate('company-information')} className="text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Edit Business Information →
            </button>
          </SectionCard>

          {/* Verification — real organizationId-scoped status (Module 02) */}
          <SectionCard icon={<IcoVerified />} title="Verification">
            <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0 mb-4" style={{ fontFamily: FONT_HEAD }}>
              {resolvedVerification === 'not-started' ? 'Verification not started.' : VERIFICATION_STATUS_LABELS[resolvedVerification]}
            </p>
            <button type="button" onClick={() => onNavigate('business-verification')} className="text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              {resolvedVerification === 'not-started' ? 'Start Verification →' : 'View Verification →'}
            </button>
          </SectionCard>

          {/* Team */}
          <SectionCard icon={<IcoTeam />} title="Team">
            <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mb-4" style={{ fontFamily: FONT_BODY }}>Manage the people who work with your organization.</p>
            <button type="button" onClick={() => onNavigate('team-management')} className="text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Manage Team →
            </button>
          </SectionCard>

          {/* Roles & Permissions */}
          <SectionCard icon={<IcoShield />} title="Roles &amp; Permissions">
            <p className="text-[12px] text-[var(--hz-ink-subtle)] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>Reference only — not yet assigned to any team member.</p>
            <div className="flex flex-col gap-3 mb-4">
              {ROLE_ORDER.map(role => (
                <div key={role} className="pb-3" style={{ borderBottom: role !== 'viewer' ? '1px solid var(--hz-border-strong)' : 'none' }}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{ROLE_LABELS[role]}</span>
                    <span className="text-[11.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{ROLE_SHORT_DESCRIPTIONS[role]}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {ROLE_PERMISSIONS[role].map(p => (
                      <span key={p} className="px-2 py-0.5 rounded-full text-[10.5px] font-medium" style={{ backgroundColor: 'var(--hz-surface-muted)', color: 'var(--hz-ink-muted)', fontFamily: FONT_BODY }}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onNavigate('roles-permissions')} className="text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Roles &amp; Permissions →
            </button>
          </SectionCard>

          {/* Organization Profile */}
          <SectionCard icon={<IcoProfile />} title="Organization Profile">
            <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 mb-4" style={{ fontFamily: FONT_BODY }}>Controls your organization's public-facing professional identity.</p>
            <button type="button" onClick={() => onNavigate('organization-profile')} className="text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Organization Profile →
            </button>
          </SectionCard>
        </div>
      </main>
    </div>
  )
}
