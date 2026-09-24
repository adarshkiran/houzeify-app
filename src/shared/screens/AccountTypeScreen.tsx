import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  ACCOUNT_TYPE_OPTIONS,
  ACCOUNT_TYPE_CONTENT,
  PROFESSIONAL_ACCOUNT_TYPE_CONTENT,
  isAccountTypeValid,
  nextScreenForAccountType,
  createAccountStructure,
  type AccountType,
  type AccountTypeFeatureSet,
} from '@/data/accountType'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const FeatureCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="var(--hz-primary-soft)" /><path d="M4 7L6 9L10 4.5" stroke="var(--hz-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IndividualIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="14" cy="9" r="4.2" /><path d="M4.5 24c0-4.7 4.2-8 9.5-8s9.5 3.3 9.5 8" />
  </svg>
)
const OrganizationIcon = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8.5" r="3.2" /><circle cx="19" cy="8.5" r="3.2" />
    <path d="M2.5 22c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" /><path d="M14.8 15.9c3.4.4 5.7 2.9 5.7 6.1" />
  </svg>
)
const HomeownerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7.5L8 2.5L14 7.5" /><path d="M3.5 6.5V13.5H12.5V6.5" />
  </svg>
)
const ProfessionalBadgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4c0 0 2 0.4 2.4 2.4C13.8 8.4 12.2 10 10 10.4L6.5 14L3 10.4L6.5 6.8C6.5 6.8 8 4 11 4Z" /><line x1="6.5" y1="6.8" x2="2.5" y2="13" /><circle cx="3.2" cy="12.4" r="1.4" />
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h10M8 3l4 4-4 4" /></svg>
)

const ACCOUNT_TYPE_ICONS: Record<AccountType, React.ReactNode> = {
  individual: <IndividualIcon />,
  organization: <OrganizationIcon />,
}

// ─── Account type card ────────────────────────────────────────────────────

function AccountTypeCard({ accountType, content, selected, onSelect }: { accountType: AccountType; content: AccountTypeFeatureSet; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={content.title}
      onClick={onSelect}
      className={[
        'relative text-left flex flex-col gap-4 rounded-[18px] p-5 sm:p-6 transition-all duration-200 outline-none cursor-pointer h-full',
        selected ? 'bg-[#F9F5FF] border-2 border-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] border border-[var(--hz-border)] hover:bg-[var(--hz-surface)] hover:border-[var(--hz-primary)]',
      ].join(' ')}
      style={{ boxShadow: selected ? '0 4px 18px rgba(243,234,255,0.10)' : '0 1px 8px rgba(0,0,0,0.03)' }}
    >
      {selected && (
        <span className="absolute top-4 right-4 w-[22px] h-[22px] rounded-full bg-[var(--hz-primary)] flex items-center justify-center" aria-hidden="true">
          <CheckIcon size={11} />
        </span>
      )}

      <div className={['w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0', selected ? 'bg-[var(--hz-surface)] text-[var(--hz-primary)]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-muted)]'].join(' ')}>
        {ACCOUNT_TYPE_ICONS[accountType]}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={['text-[18px] font-semibold leading-tight', selected ? 'text-[var(--hz-primary)]' : 'text-[var(--hz-ink)]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
          {content.title}
        </span>
        <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
          {content.description}
        </p>
      </div>

      <ul className="flex flex-col gap-2 list-none m-0 p-0">
        {content.features.map(feature => (
          <li key={feature} className="flex items-center gap-2">
            <FeatureCheckIcon />
            <span className="text-[12.5px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{feature}</span>
          </li>
        ))}
      </ul>

      <span className="mt-auto pt-2 text-[11.5px] text-[var(--hz-ink-subtle)] italic" style={{ fontFamily: FONT_BODY }}>
        {content.exampleLabel}
      </span>
    </button>
  )
}

// ─── Ask Hozie — actionable card, professional context only (019's own
// spec asks for a real CTA here, unlike the existing passive intro above) ──

function AskHozieCard({ onAskHozie }: { onAskHozie: () => void }) {
  return (
    <div className="w-full flex items-center gap-3.5 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] px-4 py-3.5 flex-wrap" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="w-9 h-9 rounded-[11px] bg-[var(--hz-primary-soft)] flex items-center justify-center shrink-0"><HIcon size={22} /></div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-[180px]">
        <span className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Not sure which option fits?</span>
      </div>
      <button onClick={onAskHozie} className="h-8 px-3.5 rounded-[9px] border border-[var(--hz-border)] text-[var(--hz-primary)] text-[12px] font-semibold cursor-pointer hover:bg-[var(--hz-primary-soft)] hover:border-[var(--hz-primary)] transition-all bg-[var(--hz-surface)] shrink-0" style={{ fontFamily: FONT_BODY }}>
        Ask Hozie →
      </button>
    </div>
  )
}

type SubmitStage = 'idle' | 'submitting'

// ─── Main screen ──────────────────────────────────────────────────────────

export default function AccountTypeScreen({
  onNavigate,
  role,
  professionalType,
  professionalTypeOther,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  /** The canonical top-level persona ('homeowner' | 'professional'),
   *  resolved once on Screen 007 and passed down by App.tsx. This is the
   *  ONLY thing that decides whether this screen (and its routing below)
   *  behaves as the professional or homeowner path — never re-derived from
   *  Boolean(professionalType), which is a secondary attribute only. */
  role?: string
  professionalType?: string
  professionalTypeOther?: string
}) {
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [stage, setStage] = useState<SubmitStage>('idle')

  const canContinue = isAccountTypeValid(accountType)
  const isProfessional = role === 'professional'
  const content = isProfessional ? PROFESSIONAL_ACCOUNT_TYPE_CONTENT : ACCOUNT_TYPE_CONTENT
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title

  function handleBack() {
    // This screen is only ever reached via the professional onboarding
    // chain today (Professional Type → Account Type) — the `isProfessional`
    // branch below is the real path; 'account-created' is a safe fallback
    // for a direct/dev-switcher jump, replacing the removed Screen 007
    // (PrimaryIntentScreen) destination.
    onNavigate(isProfessional ? 'professional-type' : 'account-created')
  }

  function handleContinue() {
    if (!accountType) return
    setStage('submitting')
    const resolvedRole = isProfessional ? 'professional' : 'homeowner'
    const record = createAccountStructure(accountType, 'user-demo-001', resolvedRole)
    const nextScreen = nextScreenForAccountType(accountType, resolvedRole)
    setTimeout(() => {
      onNavigate(nextScreen, {
        account_id: record.id,
        account_type: record.accountType,
        role: record.role,
        // Preserved for the rest of the professional onboarding flow —
        // never re-asked once already known.
        ...(professionalType ? { professional_type: professionalType } : {}),
        ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
      })
    }, 500)
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', {
      onboarding_context: 'account-type',
      ...(professionalType ? { professional_type: professionalType } : {}),
    })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          {!isProfessional && (
            <span className="text-[12px] tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Step 4 of 4</span>
          )}
        </div>
        {!isProfessional && (
          <div className="h-[2px] bg-[var(--hz-surface-muted)] w-full">
            <div className="h-full bg-[var(--hz-primary)] transition-all duration-500" style={{ width: '100%' }} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: isProfessional ? 850 : 900 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>
              {isProfessional ? 'Professional Profile' : 'Account Type'}
            </span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              {isProfessional ? 'How do you operate?' : 'How will you use Houzeify?'}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[540px]" style={{ fontFamily: FONT_BODY }}>
              {isProfessional
                ? 'Tell us how you provide your services so we can set up your professional profile correctly.'
                : 'Choose how you want to manage your Houzeify account. You can change this later.'}
            </p>
          </div>

          {/* Professional type context — carried from Screen 018, never re-asked */}
          {isProfessional && professionalTypeLabel && (
            <div className="w-full flex items-center gap-3 rounded-[14px] px-4 sm:px-5 py-3.5" style={{ backgroundColor: 'var(--hz-surface-muted)', maxWidth: 560, margin: '0 auto' }}>
              <span className="text-[10.5px] tracking-[0.08em] uppercase text-[var(--hz-ink-muted)] shrink-0" style={{ fontFamily: FONT_MONO }}>Professional Type</span>
              <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[var(--hz-surface)] border border-[var(--hz-border)] text-[var(--hz-ink)] font-semibold text-[12px]" style={{ fontFamily: FONT_BODY }}>
                <ProfessionalBadgeIcon /> {professionalTypeLabel}
              </span>
            </div>
          )}

          {/* Hozie intro — unchanged for the homeowner path */}
          {!isProfessional && (
            <div className="w-full flex items-center gap-3 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] px-5 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="shrink-0"><HIcon size={32} /></div>
              <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                <span className="text-[var(--hz-ink)] font-semibold" style={{ fontFamily: FONT_HEAD }}>One account can manage one or more construction projects.</span>{' '}
                Choose whether you&apos;re managing your projects personally or as part of an organization.
              </p>
            </div>
          )}

          {/* Account type cards */}
          <div role="radiogroup" aria-label={isProfessional ? 'How do you operate?' : 'How will you use Houzeify?'} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACCOUNT_TYPE_OPTIONS.map(type => (
              <AccountTypeCard key={type} accountType={type} content={content[type]} selected={accountType === type} onSelect={() => setAccountType(type)} />
            ))}
          </div>

          {isProfessional && <AskHozieCard onAskHozie={handleAskHozie} />}

          {/* Role stays the same — homeowner path only; the professional
              context strip above already covers the equivalent framing. */}
          {!isProfessional && (
            <div className="flex items-start gap-3 px-4 sm:px-5 py-4 rounded-[14px]" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_MONO }}>Your role stays the same</span>
                <div className="flex flex-wrap items-center gap-2 text-[13px]" style={{ fontFamily: FONT_BODY }}>
                  <span className="text-[var(--hz-ink-muted)]">You are currently registered as</span>
                  <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[var(--hz-surface)] border border-[var(--hz-border)] text-[var(--hz-ink)] font-semibold text-[12px]">
                    <HomeownerIcon /> Homeowner
                  </span>
                </div>
                <p className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
                  Account type controls how your workspace is organized — it doesn&apos;t change your role.
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[12px] mt-1" style={{ fontFamily: FONT_BODY }}>
                  <span className="h-6 px-2 rounded-full bg-[var(--hz-surface)] border border-[var(--hz-border)] text-[var(--hz-ink)]">Homeowner</span>
                  <span className="text-[var(--hz-ink-subtle)]">+</span>
                  <span className="h-6 px-2 rounded-full bg-[var(--hz-surface)] border border-[var(--hz-border)] text-[var(--hz-ink)]">
                    {accountType === 'organization' ? 'Organization account' : accountType === 'individual' ? 'Individual account' : 'Individual / Organization account'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Why we ask — professional path only, per Screen 019's own spec */}
          {isProfessional && (
            <p className="text-center text-[12.5px] text-[var(--hz-ink-subtle)] leading-[1.55] m-0 max-w-[520px] mx-auto" style={{ fontFamily: FONT_BODY }}>
              This helps us set up the right profile, permissions and business tools for you.
            </p>
          )}

          {/* Dynamic preview */}
          {accountType === 'individual' && (
            <div className="w-full rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)', animation: 'welcomeFadeUp 0.3s ease-out both' }}>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[7px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={16} /></span>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>Your Workspace</span>
              </div>
              <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
                {isProfessional ? 'Personal professional workspace' : 'Personal homeowner workspace'}
              </span>
              <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>Hozie will organize your:</p>
              <div className="flex flex-wrap gap-2">
                {(isProfessional
                  ? ['Professional profile', 'Leads & bids', 'Service requests', 'Portfolio', 'Client conversations']
                  : ['Projects', 'Estimates', 'BOQs', 'Plans', 'Materials', 'Contractor conversations']
                ).map(item => (
                  <span key={item} className="h-8 px-3 rounded-full flex items-center text-[12px] font-semibold" style={{ fontFamily: FONT_BODY, backgroundColor: 'var(--hz-surface)', color: 'var(--hz-ink)', border: '1px solid var(--hz-border)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {accountType === 'organization' && (
            <div className="w-full rounded-[16px] p-5 flex flex-col gap-3" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)', animation: 'welcomeFadeUp 0.3s ease-out both' }}>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[7px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={16} /></span>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>Your Next Step</span>
              </div>
              <span className="text-[13.5px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>Set up your organization.</span>
              <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>You&apos;ll be able to add:</p>
              <div className="flex flex-wrap gap-2">
                {['Organization name', 'Organization type', 'Team members', 'Organization details'].map(item => (
                  <span key={item} className="h-8 px-3 rounded-full flex items-center text-[12px] font-semibold" style={{ fontFamily: FONT_BODY, backgroundColor: 'var(--hz-surface)', color: 'var(--hz-ink)', border: '1px solid var(--hz-border)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleContinue}
                disabled={!canContinue || stage === 'submitting'}
                aria-label="Continue"
                className={[
                  'h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 w-full sm:w-[220px]',
                  'flex items-center justify-center gap-2',
                  canContinue
                    ? 'bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]'
                    : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-subtle)] cursor-pointer',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                {stage === 'submitting' ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Setting up…
                  </>
                ) : (
                  <>Continue <ArrowRightIcon /></>
                )}
              </button>
              <button
                onClick={handleBack}
                disabled={stage === 'submitting'}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors disabled:opacity-60"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 flex justify-center items-center gap-2.5 pb-5 relative z-10">
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
