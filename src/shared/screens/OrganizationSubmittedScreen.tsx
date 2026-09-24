import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { COMPANY_TYPE_LABELS, companyInitials, type CompanyType } from '@/data/companyInformation'
import {
  VERIFICATION_STATUS_LABELS,
  buildOrganizationSetupStatus,
  parseVerificationStatus,
  parseListCount,
  parseIntSafe,
} from '@/data/organizationSetup'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const DEFAULT_COMPANY_NAME = 'Mantoor Developers'
const DEFAULT_COMPANY_TYPE: CompanyType = 'developer'
const DEFAULT_LOCATION = 'Hyderabad, Telangana'
const ORG_ID_FALLBACK = 'org-demo-001'


// ─── Icons ──────────────────────────────────────────────────────────────

const BigCheckIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none"><path d="M8 17.5L14 23.5L26 10.5" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14S2 9.6 2 6a6 6 0 1 1 12 0c0 3.6-6 8-6 8Z" /><circle cx="8" cy="6" r="2" /></svg>
)
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9c-4-1.5-7-4.5-7-9V6Z" /><path d="M9 12l2 2l4-4" /></svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M8 3l4 4-4 4" /></svg>
)
const CreateProjectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 5v8l-9 5l-9-5V8Z" /><line x1="12" y1="12" x2="12" y2="21" /><line x1="12" y1="12" x2="20" y2="7.5" /><line x1="12" y1="12" x2="4" y2="7.5" /></svg>
)
const WorkspaceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="4" x2="8" y2="9" /></svg>
)
const TeamIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><circle cx="17" cy="9" r="2.4" /><path d="M3.5 21c0-3.3 2.5-5.7 5.5-5.7s5.5 2.4 5.5 5.7" /><path d="M15 15.4c2.4.3 4 2.2 4 4.6" /></svg>
)

// ─── Shared bits ────────────────────────────────────────────────────────

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#16A34A', fontFamily: FONT_BODY }}>
        <span className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center" aria-hidden="true"><CheckIcon size={8} /></span>
        {done ? 'Complete' : ''}
      </span>
    </div>
  )
}

function NextStepCard({ icon, title, description, highlighted, onClick }: { icon: React.ReactNode; title: string; description: string; highlighted?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative text-left flex flex-col gap-2 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer h-full',
        highlighted ? 'bg-[#F9F5FF] border-2 border-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] border border-[var(--hz-border)] hover:bg-[var(--hz-surface)] hover:border-[var(--hz-primary)]',
      ].join(' ')}
    >
      {highlighted && (
        <span className="absolute top-3 right-3 h-[18px] px-1.5 rounded-full text-[9px] font-semibold tracking-[0.04em] uppercase bg-[var(--hz-primary)] text-white flex items-center" style={{ fontFamily: FONT_MONO }}>Recommended</span>
      )}
      <div className={['w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0', highlighted ? 'bg-[var(--hz-surface)] text-[var(--hz-primary)]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-muted)]'].join(' ')}>{icon}</div>
      <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{title}</span>
      <span className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>{description}</span>
    </button>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-[20px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{value}</span>
      <span className="text-[10px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{label}</span>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function OrganizationSubmittedScreen({
  organizationId = ORG_ID_FALLBACK,
  companyName,
  companyOwnerName,
  companyType,
  location,
  verificationStatus,
  portfolioProjectCount,
  invitedCount,
  serviceLocations,
  coverageType,
  professionalType,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  companyOwnerName?: string
  companyType?: string
  location?: string
  verificationStatus?: string
  portfolioProjectCount?: string
  invitedCount?: string
  serviceLocations?: string
  coverageType?: string
  professionalType?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const resolvedCompanyName = companyName || DEFAULT_COMPANY_NAME
  // 12G-D — the real primary-contact name from the org creation flow,
  // never the ORGANIZATION_OWNER_NAME fixture unconditionally shown here.
  const resolvedOwnerName = companyOwnerName || 'Organization Owner'
  const resolvedCompanyType = (companyType as CompanyType) || DEFAULT_COMPANY_TYPE
  const resolvedLocation = location || DEFAULT_LOCATION
  const resolvedVerification = parseVerificationStatus(verificationStatus)
  const isProfessionalContext = Boolean(professionalType)
  const setupStatus = buildOrganizationSetupStatus(organizationId, resolvedVerification, isProfessionalContext)

  const teamMemberCount = parseIntSafe(invitedCount)
  const portfolioCount = parseIntSafe(portfolioProjectCount)
  const serviceAreaLabel = coverageType === 'pan-india' ? 'All India' : String(parseListCount(serviceLocations))
  const previewInitials = companyInitials(resolvedCompanyName)

  // Real Screen 029 doesn't exist yet, but 'professional-dashboard' now has
  // a minimal placeholder render block (App.tsx) so the canonical
  // role === 'professional' route always lands somewhere real.
  function goToDashboard() {
    onNavigate('professional-dashboard', { organization_id: organizationId, company_name: resolvedCompanyName })
  }
  function createProject() {
    onNavigate('create-construction-project')
  }
  function inviteTeam() {
    onNavigate('team-setup', { organization_id: organizationId, company_name: resolvedCompanyName })
  }
  function viewVerification() {
    onNavigate('business-verification', { organization_id: organizationId, company_name: resolvedCompanyName })
  }
  // No standalone organization/profile screen exists yet either — Business
  // Verification is the closest existing screen that actually displays the
  // organization's own saved profile info (name, owner, location, status).
  function viewOrganizationProfile() {
    onNavigate('business-verification', { organization_id: organizationId, company_name: resolvedCompanyName })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col items-center gap-7" style={{ maxWidth: 900 }}>

          {/* Success visual */}
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="relative w-[84px] h-[84px] flex items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(243,234,255,0.10)', filter: 'blur(18px)' }} />
              <span className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--hz-primary)', boxShadow: '0 8px 30px rgba(243,234,255,0.10)' }}>
                <BigCheckIcon />
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[12px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Organization Setup</span>
              <h1 className="text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
                Your organization is ready to go
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[540px]" style={{ fontFamily: FONT_BODY }}>
                Your organization profile has been submitted. We&apos;ll review your information and let you know when your profile is ready for homeowners.
              </p>
            </div>
          </div>

          {/* Organization card */}
          <div className="w-full rounded-[18px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5 sm:p-6 flex flex-col items-center gap-3 text-center" style={{ maxWidth: 480, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <span className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[17px] font-semibold text-[var(--hz-primary)]" style={{ backgroundColor: 'var(--hz-primary-soft)' }}>{previewInitials}</span>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[18px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>{resolvedCompanyName}</span>
              <span className="text-[13px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{COMPANY_TYPE_LABELS[resolvedCompanyType]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>
              <PinIcon /> {resolvedLocation}
            </div>
            <div className="flex items-center gap-2 pt-2 mt-1 border-t border-[var(--hz-border)] w-full justify-center flex-wrap">
              <span className="text-[12px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Owner</span>
              <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{resolvedOwnerName}</span>
              <span className="text-[#CAC7C6]">·</span>
              <span className="flex items-center gap-1.5 h-6 px-2 rounded-full text-[10.5px] font-semibold tracking-[0.04em] uppercase" style={{ fontFamily: FONT_MONO, backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Active
              </span>
            </div>
          </div>

          {/* Setup summary + verification notice */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ maxWidth: 720 }}>
            <div className="rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] p-5 flex flex-col gap-1" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] mb-1" style={{ fontFamily: FONT_MONO }}>Setup Complete</span>
              <div className="flex flex-col divide-y divide-[#CAC7C6]">
                {isProfessionalContext && <ChecklistRow label="Professional profile" done={setupStatus.professionalProfileComplete} />}
                <ChecklistRow label="Organization information" done={setupStatus.companyInformationComplete} />
                <ChecklistRow label="Services" done={setupStatus.servicesComplete} />
                <ChecklistRow label="Service locations" done={setupStatus.serviceLocationsComplete} />
                <ChecklistRow label="Portfolio" done={setupStatus.portfolioComplete} />
                <ChecklistRow label="Team" done={setupStatus.teamSetupComplete} />
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>Business verification</span>
                  {resolvedVerification === 'verified' ? (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: '#16A34A', fontFamily: FONT_BODY }}>
                      <span className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center" aria-hidden="true"><CheckIcon size={8} /></span>
                      {VERIFICATION_STATUS_LABELS[resolvedVerification]}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: resolvedVerification === 'pending' ? '#D97706' : '#999999', fontFamily: FONT_BODY }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: resolvedVerification === 'pending' ? '#D97706' : '#999999' }} />
                      {VERIFICATION_STATUS_LABELS[resolvedVerification]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {resolvedVerification !== 'verified' && (
              <div className="rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--hz-primary)] shrink-0"><ShieldIcon /></span>
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>
                    {resolvedVerification === 'pending' ? 'Verification Pending' : 'Business Verification'}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--hz-ink)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                  {resolvedVerification === 'pending'
                    ? 'Your organization is being reviewed. You can continue setting up your profile while verification is in progress.'
                    : 'Your organization is currently unverified. You can complete verification later from Organization Settings.'}
                </p>
                <button type="button" onClick={viewVerification} className="self-start text-[13px] font-semibold text-[var(--hz-primary)] cursor-pointer bg-transparent border-0 hover:underline p-0" style={{ fontFamily: FONT_BODY }}>
                  {resolvedVerification === 'pending' ? 'View verification status →' : 'Verify business →'}
                </button>
              </div>
            )}
          </div>

          {/* Hozie welcome */}
          <div className="w-full flex items-center gap-3 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] px-5 py-4" style={{ maxWidth: 720, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="shrink-0"><HIcon size={36} /></div>
            <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
              <span className="text-[var(--hz-ink)] font-semibold" style={{ fontFamily: FONT_HEAD }}>Welcome to Houzeify, {resolvedCompanyName}.</span>{' '}
              Your organization workspace is ready. You can now create projects, manage estimates, collaborate with your team and use Hozie for construction guidance.
            </p>
          </div>

          {/* Organization stats */}
          <div className="w-full grid grid-cols-4 gap-3 rounded-[16px] bg-[var(--hz-surface)] border border-[var(--hz-border)] py-4 px-2" style={{ maxWidth: 720, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <StatBlock label="Projects" value="0" />
            <StatBlock label="Team Members" value={String(teamMemberCount)} />
            <StatBlock label="Portfolio Projects" value={String(portfolioCount)} />
            <StatBlock label="Service Areas" value={serviceAreaLabel} />
          </div>

          {/* Next steps */}
          <div className="w-full flex flex-col gap-3" style={{ maxWidth: 900 }}>
            <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] text-center" style={{ fontFamily: FONT_MONO }}>What you can do next</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NextStepCard icon={<CreateProjectIcon />} title="Create Project" description="Start a construction project." highlighted onClick={createProject} />
              <NextStepCard icon={<WorkspaceIcon />} title="View Organization Profile" description="See your saved organization details." onClick={viewOrganizationProfile} />
              <NextStepCard icon={<TeamIcon />} title="Invite Team" description="Continue building your organization team." onClick={inviteTeam} />
            </div>
          </div>

          {/* Primary actions — onboarding is complete; neither action returns into it */}
          <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto pt-1">
            <button
              onClick={goToDashboard}
              aria-label="Go to your professional dashboard"
              className="h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 px-6 flex items-center justify-center gap-2 bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99] w-full sm:w-auto"
              style={{ fontFamily: FONT_BODY }}
            >
              Go to Professional Dashboard <ArrowRightIcon />
            </button>
            <button
              onClick={viewOrganizationProfile}
              aria-label="View your organization profile"
              className="h-[52px] text-[13.5px] font-medium rounded-[12px] px-5 cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink)] hover:border-[var(--hz-primary)] transition-colors w-full sm:w-auto"
              style={{ fontFamily: FONT_BODY }}
            >
              View Organization Profile →
            </button>
          </div>
          <p className="text-[12px] text-[var(--hz-ink-subtle)] text-center m-0" style={{ fontFamily: FONT_BODY }}>
            You can add or edit your profile any time from your dashboard.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 flex justify-center items-center gap-2.5 pb-6 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
