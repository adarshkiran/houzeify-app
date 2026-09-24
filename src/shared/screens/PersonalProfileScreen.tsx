import { useEffect } from 'react'
import { profileInitials } from '@/data/professionalProfile'
import { usePartnerProfile } from '@/data/partnerProfileState'
import { useOrganizations } from '@/data/organizationState'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import PartnerNavRail from '@/shared/components/PartnerNavRail'
import { sharedSettingsHomeRoute } from '@/data/customerProfileSettings'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 096 — Personal Profile ──────────────────────────────────────────
// A PROFESSIONAL, INDIVIDUAL-account screen. The private/account-facing
// identity view for an individual professional — NOT a duplicate of 020
// (the real editor), 081 (the public listing), 092 (organization identity)
// or 088 (organization administration).
//
// 12G-D — migrated off the legacy professionalProfile.ts local store
// onto the real backend PartnerProfile (usePartnerProfile()).
// S13 — SHARED polish: PartnerNavRail dual-rail shell + honest error state.

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[13.5px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{value}</p>
    </div>
  )
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function Shell({
  onNavigate,
  organizationId,
  children,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  organizationId?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: 'var(--hz-surface)' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <PartnerNavRail active="profile" onNavigate={onNavigate} organizationId={organizationId} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
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
  const { currentOrganization } = useOrganizations()
  const partnerProfile = usePartnerProfile()

  useEffect(() => {
    if (!isProfessional) onNavigate(sharedSettingsHomeRoute(role))
  }, [isProfessional, onNavigate, role])

  if (!isProfessional) return null

  const selectClass = 'h-10 min-h-11 px-5 rounded-[12px] text-[13.5px] font-semibold border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2'

  function goToDashboard() {
    onNavigate(sharedSettingsHomeRoute('professional'))
  }

  // Organization accounts never use this model — Screen 092 is their real
  // identity equivalent, and no organization information is duplicated here.
  const isOrganization = accountType === 'organization'
  if (isOrganization) {
    return (
      <Shell onNavigate={onNavigate} organizationId={currentOrganization?.id}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="flex flex-col items-center gap-3 text-center max-w-[420px]">
            <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Personal profile is available for individual professionals.</p>
            <button type="button" onClick={() => onNavigate('organization-profile')} className={selectClass} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
              View Organization Profile →
            </button>
          </div>
        </div>
      </Shell>
    )
  }

  if (partnerProfile.status === 'idle' || partnerProfile.status === 'loading') {
    return (
      <Shell onNavigate={onNavigate} organizationId={currentOrganization?.id}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6" role="status" aria-live="polite">
          <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Loading your profile…</p>
        </div>
      </Shell>
    )
  }

  if (partnerProfile.status === 'error') {
    return (
      <Shell onNavigate={onNavigate} organizationId={currentOrganization?.id}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6" role="alert">
          <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0 text-center" style={{ fontFamily: FONT_HEAD }}>
            Couldn&apos;t load your profile
          </p>
          <p className="text-[13px] text-[var(--hz-ink-muted)] m-0 text-center max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
            {partnerProfile.errorMessage ?? 'Unable to load your profile right now.'}
          </p>
          <button
            type="button"
            onClick={() => { void partnerProfile.refresh() }}
            className={selectClass}
            style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}
          >
            Try again
          </button>
        </div>
      </Shell>
    )
  }

  const profile = partnerProfile.profile

  if (!profile) {
    return (
      <Shell onNavigate={onNavigate} organizationId={currentOrganization?.id}>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div className="flex flex-col items-center gap-3 text-center max-w-[420px]">
            <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Profile not set up yet</p>
            <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Complete your professional profile to add your personal information.</p>
            <button type="button" onClick={() => onNavigate('professional-profile-setup')} className={selectClass} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
              Set Up Profile →
            </button>
          </div>
        </div>
      </Shell>
    )
  }

  const displayName = profile.displayName || profile.fullName
  const initials = profileInitials(displayName)
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)

  return (
    <Shell onNavigate={onNavigate} organizationId={currentOrganization?.id}>
      <header className="shrink-0 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={goToDashboard}
            className="flex items-center gap-1.5 min-h-11 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2"
            style={{ fontFamily: FONT_BODY }}
          >
            <IcoBack /> Professional Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
        <div className="max-w-[640px] mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[var(--hz-primary-soft)] text-[var(--hz-primary)] flex items-center justify-center text-[15px] font-bold shrink-0" style={{ fontFamily: FONT_HEAD }} aria-hidden="true">
              {initials}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Personal Profile</p>
              <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>{displayName}</h1>
              {professionalTypeLabel && (
                <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-0.5" style={{ fontFamily: FONT_BODY }}>{professionalTypeLabel}</p>
              )}
            </div>
          </div>

          {(profile.contactEmail || profile.contactPhone) && (
            <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" value={profile.contactEmail ?? undefined} />
                <Field label="Phone" value={profile.contactPhone ?? undefined} />
              </div>
            </div>
          )}

          <div className="rounded-[16px] bg-[var(--hz-surface)] p-5" style={{ border: '1px solid var(--hz-border)' }}>
            <p className="text-[11px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-3" style={{ fontFamily: FONT_MONO }}>About</p>
            <p className="text-[13.5px] text-[var(--hz-ink)] m-0 mb-4 leading-[1.6]" style={{ fontFamily: FONT_BODY }}>
              {profile.about ? profile.about : 'No description provided yet.'}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('professional-profile-setup')}
              className="min-h-11 text-[12.5px] font-semibold text-[var(--hz-primary)] hover:underline cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--hz-primary)] focus-visible:ring-offset-2"
              style={{ fontFamily: FONT_BODY }}
            >
              Edit Profile →
            </button>
          </div>

          <div className="rounded-[16px] p-4" style={{ border: '1px dashed var(--hz-border)', backgroundColor: 'var(--hz-surface)' }}>
            <p className="text-[10.5px] tracking-[0.06em] uppercase text-[var(--hz-ink-subtle)] m-0 mb-1" style={{ fontFamily: FONT_MONO }}>Profile Created</p>
            <p className="text-[12px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>{formatCreatedAt(profile.createdAt)}</p>
          </div>
        </div>
      </main>
    </Shell>
  )
}
