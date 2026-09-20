import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  PROFESSIONAL_TYPE_OPTIONS,
  PROFESSIONAL_TYPE_CONTENT,
  PROFESSIONAL_TYPE_OTHER_MAX,
  isProfessionalTypeSelectionValid,
  type ProfessionalType,
} from '@/data/professionalType'
import { hasSpecializations } from '@/data/professionalSpecialization'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" fill="none"><path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

const IcoBuilder = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="8" height="14" /><rect x="15" y="4" width="8" height="20" /><line x1="8" y1="14" x2="10" y2="14" /><line x1="8" y1="18" x2="10" y2="18" /><line x1="18" y1="8" x2="20" y2="8" /><line x1="18" y1="12" x2="20" y2="12" /><line x1="18" y1="16" x2="20" y2="16" /></svg>)
const IcoGeneralContractor = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4c0 0 2.5 0.5 3 3c0.5 2.5-1.5 4.5-4 5l-5 5l-5-5l5-5c0 0 2-3 6-3Z" /><line x1="11" y1="12" x2="4" y2="19" /><circle cx="5.5" cy="17.5" r="2" /><circle cx="14" cy="20" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="22" r="1.4" fill="currentColor" stroke="none" /></svg>)
const IcoSpecialistContractor = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4C22 4 24.5 4.5 25 7C25.5 9.5 23.5 11.5 21 12L16 17L11 12L16 7C16 7 18 4 22 4Z"/><line x1="11" y1="12" x2="4" y2="25"/><circle cx="5.5" cy="23.5" r="2"/></svg>)
const IcoArchitect = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="14" cy="9" r="3.5"/><path d="M14 12.5L9 26M14 12.5L19 26"/><line x1="10.5" y1="22" x2="17.5" y2="22"/><line x1="14" y1="2" x2="14" y2="5.5"/></svg>)
const IcoInteriorDesigner = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3L25 10L12 22.5C10.5 24 8 24.5 6.5 23C5 21.5 5.5 19 7 17.5L18 3Z"/><circle cx="6.5" cy="22.5" r="2.5"/><line x1="15" y1="6" x2="22" y2="13"/></svg>)
const IcoHomeServicePro = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3.5h9v6a4.5 4.5 0 004.5 4.5v0a4.5 4.5 0 004.5-4.5v-2" transform="translate(-4 2) scale(0.85)"/><path d="M6 4h7v5a3.5 3.5 0 01-3.5 3.5v0A3.5 3.5 0 016 9V4z"/><path d="M9.5 12.5V22M6 22h7"/></svg>)
const IcoSupplier = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4L24 9.5V18.5L14 24L4 18.5V9.5L14 4Z"/><line x1="14" y1="4" x2="14" y2="24"/><line x1="4" y1="9.5" x2="24" y2="9.5"/><line x1="4" y1="14" x2="14" y2="18.5"/><line x1="24" y1="14" x2="14" y2="18.5"/></svg>)
const IcoBeautyWellness = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3.5l1.8 5.8L21.5 11l-5.7 1.7L14 18.5l-1.8-5.8L6.5 11l5.7-1.7L14 3.5Z"/><path d="M21 18l0.9 2.9L24.8 22l-2.9 0.9L21 25.8l-0.9-2.9L17.2 22l2.9-0.9L21 18Z"/></svg>)
const IcoOtherType = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="14" r="1.6" fill="currentColor" stroke="none"/><circle cx="14" cy="14" r="1.6" fill="currentColor" stroke="none"/><circle cx="21" cy="14" r="1.6" fill="currentColor" stroke="none"/></svg>)

const PROFESSIONAL_TYPE_ICONS: Record<ProfessionalType, React.ReactNode> = {
  'builder-construction-company': <IcoBuilder />,
  'general-contractor': <IcoGeneralContractor />,
  'specialist-contractor': <IcoSpecialistContractor />,
  'architect-designer': <IcoArchitect />,
  'interior-designer': <IcoInteriorDesigner />,
  'home-service-professional': <IcoHomeServicePro />,
  'beauty-wellness-professional': <IcoBeautyWellness />,
  'supplier-material-provider': <IcoSupplier />,
  other: <IcoOtherType />,
}

// ─── Selectable card — radio semantics, subtle border, never large-filled ──

function ProfessionalTypeCard({ type, selected, onSelect }: { type: ProfessionalType; selected: boolean; onSelect: () => void }) {
  const content = PROFESSIONAL_TYPE_CONTENT[type]
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={content.title}
      onClick={onSelect}
      className={[
        'relative text-left flex items-start gap-3.5 rounded-[16px] p-4 sm:p-5 transition-all duration-150 outline-none cursor-pointer',
        selected
          ? 'bg-[#F9F5FF] border-[1.5px] border-[#722ED1]'
          : 'bg-white border border-[#E3DDD7] hover:border-[#E3DDD7] hover:bg-[#FFFFFF]',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={['w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0', selected ? 'bg-white text-[#722ED1]' : 'bg-[#F4F0EC] text-[#68636D]'].join(' ')}
      >
        {PROFESSIONAL_TYPE_ICONS[type]}
      </span>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className={['text-[14.5px] font-semibold leading-snug', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
          {content.title}
        </span>
        <p className="text-[12.5px] text-[#68636D] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
          {content.description}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: selected ? '#722ED1' : 'transparent', border: selected ? 'none' : '1.5px solid #CAC7C6' }}
      >
        {selected && <CheckIcon size={10} />}
      </span>
    </button>
  )
}

// ─── "Other" free-text field ────────────────────────────────────────────

function OtherTypeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-[16px] border border-[#E3DDD7] bg-white p-4 sm:p-5 flex flex-col gap-2">
      <label htmlFor="professional-type-other" className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>
        Tell us what best describes your work.
      </label>
      <input
        id="professional-type-other"
        type="text"
        value={value}
        maxLength={PROFESSIONAL_TYPE_OTHER_MAX}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Civil consultant, landscape contractor..."
        className="w-full h-11 px-3.5 rounded-[10px] border border-[#E3DDD7] bg-white text-[13.5px] text-[#242326] placeholder-[#9A949D] outline-none focus:border-[#722ED1] focus:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all"
        style={{ fontFamily: FONT_BODY }}
      />
      <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Professional type · required</span>
    </div>
  )
}

// ─── Hozie assist ───────────────────────────────────────────────────────

function HozieAssist({ onAskHozie }: { onAskHozie: () => void }) {
  return (
    <div className="w-full flex items-center gap-3.5 bg-white border border-[#E3DDD7] rounded-[16px] px-4 py-3.5 flex-wrap" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="w-9 h-9 rounded-[11px] bg-[#F3EAFF] flex items-center justify-center shrink-0"><HIcon size={22} /></div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-[180px]">
        <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Not sure which option fits?</span>
      </div>
      <button onClick={onAskHozie} className="h-8 px-3.5 rounded-[9px] border border-[#E3DDD7] text-[#722ED1] text-[12px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0" style={{ fontFamily: FONT_BODY }}>
        Ask Hozie →
      </button>
    </div>
  )
}

// ─── Main screen ────────────────────────────────────────────────────────────
// Screen 018 — Professional Type. A pure classification step for the
// PROFESSIONAL onboarding path only (primaryIntent.ts's 'professional'
// intent) — never entered by the homeowner flow. Asks WHO the professional
// is, never WHAT services they offer (that's the next, not-yet-built step —
// see professionalType.ts's header comment for why this is a new,
// non-duplicate taxonomy).

export default function ProfessionalTypeScreen({
  onNavigate,
  accountType,
  companyName,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  /** Carried forward only if an earlier step already set it — nothing on
   *  today's professional path does yet, so this is a defensive, optional
   *  reuse hook, never a re-ask. */
  accountType?: string
  companyName?: string
}) {
  const [type, setType] = useState<ProfessionalType | null>(null)
  const [otherText, setOtherText] = useState('')

  const canContinue = isProfessionalTypeSelectionValid(type, otherText)
  const isOrganization = accountType === 'organization'

  function handleBack() {
    // The former Screen 007 (PrimaryIntentScreen) fork was removed — this
    // screen is now reached straight from AccountCreatedScreen's own
    // "I'm a professional / business" link, so Back returns there.
    onNavigate('account-created')
  }

  function handleContinue() {
    if (!type || !canContinue) return
    const sharedFields = {
      professional_type: type,
      ...(type === 'other' ? { professional_type_other: otherText.trim() } : {}),
    }
    // Only 4 of the 9 types are genuinely a bucket of several distinct
    // trades (see professionalSpecialization.ts) — those route through the
    // new Specialization step first. Every other type's destination is
    // completely unchanged: straight to 019 — Individual vs Organization
    // (the existing 'account-type' screen).
    if (hasSpecializations(type)) {
      onNavigate('professional-specialization', sharedFields)
      return
    }
    onNavigate('account-type', sharedFields)
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', {
      onboarding_context: 'professional-type',
      ...(type ? { professional_type: type } : {}),
    })
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-center h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-6" style={{ maxWidth: 900 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Professional Profile</span>
            <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#242326] leading-[1.1] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              What type of professional are you?
            </h1>
            <p className="text-[14px] text-[#68636D] leading-[1.6] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              {isOrganization
                ? "Tell us what best describes your company's role so we can show your team the right opportunities and tools."
                : 'Tell us what best describes your role so we can show you the right opportunities and tools.'}
              {companyName ? ` (${companyName})` : ''}
            </p>
          </div>

          {/* Option cards */}
          <div role="radiogroup" aria-label="What type of professional are you?" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PROFESSIONAL_TYPE_OPTIONS.map(option => (
              <ProfessionalTypeCard key={option} type={option} selected={type === option} onSelect={() => setType(option)} />
            ))}
          </div>

          {type === 'other' && <OtherTypeField value={otherText} onChange={setOtherText} />}

          {/* Why we ask */}
          <p className="text-center text-[12.5px] text-[#9A949D] leading-[1.55] m-0 max-w-[520px] mx-auto" style={{ fontFamily: FONT_BODY }}>
            Your professional type helps Houzeify show you relevant projects, service requests and opportunities.
          </p>

          <HozieAssist onAskHozie={handleAskHozie} />

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row-reverse items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                aria-label="Continue"
                className={[
                  'h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 w-full sm:w-[220px]',
                  'flex items-center justify-center gap-2',
                  canContinue
                    ? 'bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]'
                    : 'bg-[#F4F0EC] text-[#9A949D] cursor-not-allowed',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                Continue →
              </button>
              <button
                onClick={handleBack}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors"
                style={{ fontFamily: FONT_BODY }}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
