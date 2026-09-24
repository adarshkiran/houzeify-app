// ─── Professional Specialization ────────────────────────────────────────────
// Inserted between Professional Type (018) and Account Type (019) — but
// only for the 4 professional types that are genuinely a bucket of
// several distinct trades (see professionalSpecialization.ts's own
// SPECIALIZATION_OPTIONS_BY_TYPE). App.tsx only routes here for those 4;
// every other professional type's Continue goes straight to Account Type
// exactly as it always has — this screen changes nothing about that path.
//
// Reuses ProfessionalTypeScreen's own OptionCard/layout pattern verbatim
// (same card shape, same selected styling, same "Other" free-text
// pattern) — no new visual language for a screen that's really the same
// kind of single-choice classification step, one tier down.

import { useEffect, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import {
  specializationOptionsFor,
  SPECIALIZATION_LABELS,
  SPECIALIZATION_DESCRIPTIONS,
  SPECIALIZATION_OTHER_MAX,
  isSpecializationSelectionValid,
  type Specialization,
} from '@/data/professionalSpecialization'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Icons — a small, reused-by-theme set (not one bespoke icon per
// specialization) matching this screen's own "one icon per option" pattern
// without a 22-icon drawing effort for what is otherwise a plain list. ────

const CheckIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 11 11" fill="none"><path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const IcoStructural = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11l10-7l10 7" /><path d="M6 11v13M22 11v13" /><path d="M10 24v-8M14 24v-8M18 24v-8" /></svg>)
const IcoElectrical = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3L5 16h7l-1.5 9L21 12h-7l1.5-9Z" /></svg>)
const IcoRepair = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 5C22 5 24.5 5.5 25 8C25.5 10.5 23.5 12.5 21 13L16 18L11 13L16 8C16 8 18 5 22 5Z" /><line x1="11" y1="13" x2="4" y2="26" /><circle cx="5.5" cy="24.5" r="2" /></svg>)
const IcoHome = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="14" cy="9" r="4.2" /><path d="M4.5 24c0-4.7 4.2-8 9.5-8s9.5 3.3 9.5 8" /></svg>)
const IcoBeauty = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3.5l1.8 5.8L21.5 11l-5.7 1.7L14 18.5l-1.8-5.8L6.5 11l5.7-1.7L14 3.5Z" /><path d="M21 18l0.9 2.9L24.8 22l-2.9 0.9L21 25.8l-0.9-2.9L17.2 22l2.9-0.9L21 18Z" /></svg>)
const IcoSupply = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4L24 9.5V18.5L14 24L4 18.5V9.5L14 4Z" /><line x1="14" y1="4" x2="14" y2="24" /><line x1="4" y1="9.5" x2="24" y2="9.5" /></svg>)
const IcoOther = () => (<svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="14" r="1.6" fill="currentColor" stroke="none" /><circle cx="14" cy="14" r="1.6" fill="currentColor" stroke="none" /><circle cx="21" cy="14" r="1.6" fill="currentColor" stroke="none" /></svg>)

const SPECIALIZATION_ICONS: Record<Specialization, React.ReactNode> = {
  'civil-contractor': <IcoStructural />,
  'structural-contractor': <IcoStructural />,
  electrician: <IcoElectrical />,
  plumber: <IcoRepair />,
  painter: <IcoRepair />,
  carpenter: <IcoRepair />,
  'ac-technician': <IcoRepair />,
  'appliance-repair': <IcoRepair />,
  'cleaning-specialist': <IcoHome />,
  'home-helper': <IcoHome />,
  salon: <IcoBeauty />,
  barber: <IcoBeauty />,
  beautician: <IcoBeauty />,
  'makeup-artist': <IcoBeauty />,
  'massage-therapist': <IcoBeauty />,
  'wellness-professional': <IcoBeauty />,
  'cement-supplier': <IcoSupply />,
  'steel-supplier': <IcoSupply />,
  'tiles-supplier': <IcoSupply />,
  'paint-supplier': <IcoSupply />,
  'electrical-supplier': <IcoSupply />,
  'hardware-supplier': <IcoSupply />,
  'other-specialization': <IcoOther />,
}

// ─── Selectable card — identical shape/behavior to ProfessionalTypeCard ────

function SpecializationCard({ specialization, selected, onSelect }: { specialization: Specialization; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={SPECIALIZATION_LABELS[specialization]}
      onClick={onSelect}
      className={[
        'relative text-left flex items-start gap-3.5 rounded-[16px] p-4 sm:p-5 transition-all duration-150 outline-none cursor-pointer',
        selected
          ? 'bg-[#F9F5FF] border-[1.5px] border-[var(--hz-primary)]'
          : 'bg-[var(--hz-surface)] border border-[var(--hz-border)] hover:border-[var(--hz-border)] hover:bg-[var(--hz-surface)]',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={['w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0', selected ? 'bg-[var(--hz-surface)] text-[var(--hz-primary)]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-muted)]'].join(' ')}
      >
        {SPECIALIZATION_ICONS[specialization]}
      </span>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className={['text-[14.5px] font-semibold leading-snug', selected ? 'text-[var(--hz-primary)]' : 'text-[var(--hz-ink)]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>
          {SPECIALIZATION_LABELS[specialization]}
        </span>
        <p className="text-[12.5px] text-[var(--hz-ink-muted)] leading-[1.5] m-0" style={{ fontFamily: FONT_BODY }}>
          {SPECIALIZATION_DESCRIPTIONS[specialization]}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: selected ? 'var(--hz-primary)' : 'transparent', border: selected ? 'none' : '1.5px solid #CAC7C6' }}
      >
        {selected && <CheckIcon size={10} />}
      </span>
    </button>
  )
}

function OtherSpecializationField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-[16px] border border-[var(--hz-border)] bg-[var(--hz-surface)] p-4 sm:p-5 flex flex-col gap-2">
      <label htmlFor="specialization-other" className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_HEAD }}>
        Tell us what best describes your specialty.
      </label>
      <input
        id="specialization-other"
        type="text"
        value={value}
        maxLength={SPECIALIZATION_OTHER_MAX}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Waterproofing specialist, pest control..."
        className="w-full h-11 px-3.5 rounded-[10px] border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder-[var(--hz-ink-subtle)] outline-none focus:border-[var(--hz-primary)] focus:shadow-[0_0_0_3px_rgba(114,46,209,0.08)] transition-all"
        style={{ fontFamily: FONT_BODY }}
      />
      <span className="text-[11.5px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Specialty · required</span>
    </div>
  )
}

function HozieAssist({ onAskHozie }: { onAskHozie: () => void }) {
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

// ─── Main screen ────────────────────────────────────────────────────────────

export default function ProfessionalSpecializationScreen({
  onNavigate,
  professionalType,
  professionalTypeOther,
}: {
  onNavigate: (screen: string, data?: Record<string, string>) => void
  professionalType?: string
  professionalTypeOther?: string
}) {
  const options = specializationOptionsFor(professionalType)
  const typeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title ?? 'your profession'

  const [specialization, setSpecialization] = useState<Specialization | null>(null)
  const [otherText, setOtherText] = useState('')

  const canContinue = isSpecializationSelectionValid(specialization, otherText)

  function handleBack() {
    onNavigate('professional-type')
  }

  function handleContinue() {
    if (!specialization || !canContinue) return
    onNavigate('account-type', {
      professional_type: professionalType ?? '',
      ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
      specialization,
      ...(specialization === 'other-specialization' ? { specialization_other: otherText.trim() } : {}),
    })
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', {
      onboarding_context: 'professional-specialization',
      ...(professionalType ? { professional_type: professionalType } : {}),
    })
  }

  // Defensive fallback — if this screen is somehow reached for a
  // professional type with no specialization list (shouldn't happen given
  // App.tsx only routes here for the 4 types that have one), skip forward
  // rather than showing an empty grid. Runs as an effect, never during
  // render, since onNavigate updates the parent's state.
  useEffect(() => {
    if (options.length === 0) {
      onNavigate('account-type', {
        professional_type: professionalType ?? '',
        ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length])
  if (options.length === 0) return null

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
        <div className="w-full flex flex-col gap-6" style={{ maxWidth: 900 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>Professional Profile</span>
            <h1 className="text-[26px] sm:text-[32px] font-semibold text-[var(--hz-ink)] leading-[1.1] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              What's your specialty?
            </h1>
            <p className="text-[14px] text-[var(--hz-ink-muted)] leading-[1.6] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              You told us you're a {typeLabel} — tell us more specifically what you do so we can show you the most relevant opportunities.
            </p>
          </div>

          {/* Option cards */}
          <div role="radiogroup" aria-label="What's your specialty?" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {options.map(option => (
              <SpecializationCard key={option} specialization={option} selected={specialization === option} onSelect={() => setSpecialization(option)} />
            ))}
          </div>

          {specialization === 'other-specialization' && <OtherSpecializationField value={otherText} onChange={setOtherText} />}

          {/* Why we ask */}
          <p className="text-center text-[12.5px] text-[var(--hz-ink-subtle)] leading-[1.55] m-0 max-w-[520px] mx-auto" style={{ fontFamily: FONT_BODY }}>
            Your specialty helps Houzeify show you the most relevant service requests and opportunities.
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
                    ? 'bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]'
                    : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-subtle)] cursor-not-allowed',
                ].join(' ')}
                style={{ fontFamily: FONT_BODY }}
              >
                Continue →
              </button>
              <button
                onClick={handleBack}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors"
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
