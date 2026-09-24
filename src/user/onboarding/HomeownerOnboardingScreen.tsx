import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  INTENT_HEADER_CONTENT,
  PLOT_STATUS_OPTIONS,
  CONSTRUCTION_STAGE_OPTIONS,
  HAS_HOUSE_PLAN_OPTIONS,
  HOME_STATUS_OPTIONS,
  IMPROVEMENT_INTENT_OPTIONS,
  SERVICE_URGENCY_OPTIONS,
  isOnboardingFormValid,
  getSummaryLines,
  createHomeownerOnboarding,
  type PrimaryIntent,
  type PlotStatus,
  type ConstructionStage,
  type HasHousePlan,
  type HomeStatus,
  type ImprovementIntent,
  type ServiceUrgency,
  type OnboardingFormValues,
} from '@/data/homeownerOnboarding'
import { getCleaningCategories, getCategoriesForEntry, type ServiceCategoryMeta } from '@/data/homeServices'
import { resolveServiceEntry, type ServiceEntry } from '@/data/serviceEntry'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const INTENT_LABELS: Record<PrimaryIntent, string> = {
  'build-home': 'Build a new home',
  'improve-home': 'Improve my home',
  'home-service': 'Home service',
}


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5.5" r="3" /><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /></svg>
)

// ─── Shared bits ────────────────────────────────────────────────────────

function QuestionLabel({ index, question }: { index: number; question: string }) {
  return (
    <div className="flex flex-col gap-1 mb-3">
      <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Question {index}</span>
      <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{question}</span>
    </div>
  )
}

function OptionCard({ title, description, selected, onSelect }: { title: string; description: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        'relative text-left flex flex-col gap-1 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer h-full',
        selected ? 'bg-[#F9F5FF] border-2 border-[#722ED1]' : 'bg-white border border-[#E3DDD7] hover:bg-[#FFFFFF] hover:border-[#722ED1]',
      ].join(' ')}
    >
      <span className={['text-[13.5px] font-semibold leading-tight', selected ? 'text-[#722ED1]' : 'text-[#242326]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>{title}</span>
      <span className="text-[12px] text-[#68636D] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>{description}</span>
      {selected && (
        <span className="absolute top-3 right-3 w-[16px] h-[16px] rounded-full bg-[#722ED1] flex items-center justify-center" aria-hidden="true">
          <CheckIcon size={9} />
        </span>
      )}
    </button>
  )
}

function ServiceChip({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? '#F3EAFF' : '#FFFFFF',
        borderColor: selected ? '#722ED1' : '#CAC7C6',
        color: selected ? '#722ED1' : '#1E1E1E',
      }}
    >
      {selected && <span className="w-[14px] h-[14px] rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>}
      {label}
    </button>
  )
}

type SubmitStage = 'idle' | 'submitting'

// ─── Main screen ──────────────────────────────────────────────────────────

export default function HomeownerOnboardingScreen({
  primaryIntent,
  serviceEntry,
  initialName,
  onNavigate,
}: {
  primaryIntent?: string
  /** Which of the two service destinations (Screen 007) this session
   *  entered through — only meaningful for primaryIntent === 'home-service'. */
  serviceEntry?: string
  initialName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const intent: PrimaryIntent = (primaryIntent === 'improve-home' || primaryIntent === 'home-service') ? primaryIntent : 'build-home'
  const headerContent = INTENT_HEADER_CONTENT[intent]
  const entry: ServiceEntry = resolveServiceEntry(serviceEntry)

  // The real category list for this session's service destination — never
  // both catalogues at once. Sourced once from homeServices.ts's single
  // canonical catalogue, never a second, screen-local category list.
  const serviceCategoryOptions: ServiceCategoryMeta[] = intent === 'home-service'
    ? (entry === 'cleaning' ? getCleaningCategories() : getCategoriesForEntry('home-services'))
    : []

  const [name, setName] = useState(initialName ?? '')
  const [plotStatus, setPlotStatus] = useState<PlotStatus | null>(null)
  const [constructionStage, setConstructionStage] = useState<ConstructionStage | null>(null)
  const [hasHousePlan, setHasHousePlan] = useState<HasHousePlan | null>(null)
  const [homeStatus, setHomeStatus] = useState<HomeStatus | null>(null)
  const [improvementIntent, setImprovementIntent] = useState<ImprovementIntent | null>(null)
  const [serviceCategory, setServiceCategory] = useState<string | null>(null)
  const [serviceUrgency, setServiceUrgency] = useState<ServiceUrgency | null>(null)
  const [stage, setStage] = useState<SubmitStage>('idle')

  const formValues: OnboardingFormValues = {
    name, primaryIntent: intent, plotStatus, constructionStage, hasHousePlan, homeStatus, improvementIntent, serviceCategory, serviceUrgency,
  }
  const canContinue = isOnboardingFormValid(formValues)
  // getSummaryLines() no longer resolves the service-category label itself
  // (avoids a circular import into homeServices.ts) — prepend its real name
  // here, from the same canonical list rendered below.
  const selectedCategory = intent === 'home-service' && serviceCategory
    ? serviceCategoryOptions.find(c => c.id === serviceCategory)
    : undefined
  const summaryLines = selectedCategory
    ? [selectedCategory.name, ...getSummaryLines(formValues)]
    : getSummaryLines(formValues)

  function handleBack() {
    // Reached straight from HomeownerProfileScreen (Screen 009) in the real
    // flow today — the former Screen 007 (PrimaryIntentScreen) fork this
    // used to return to was removed as an orphaned, no-longer-reachable step.
    onNavigate('homeowner-profile')
  }

  function handleContinue() {
    if (!canContinue || stage === 'submitting') return
    setStage('submitting')
    const record = createHomeownerOnboarding(formValues, 'user-demo-001')
    setTimeout(() => {
      onNavigate('homeowner-profile', {
        user_id: record.userId,
        user_role: 'homeowner',
        // homeowner_name is preserved exactly as before (real answer, kept
        // per data-preservation requirement). full_name is the existing
        // canonical name field every other screen already reads (App.tsx's
        // `projectData.full_name ?? homeownerProfile.fullName` pattern) —
        // writing it here is what actually makes Screen 009 (and everything
        // downstream of it) see what the user just typed, using the field
        // that already exists rather than inventing a second name model.
        homeowner_name: record.name,
        full_name: record.name,
        primary_intent: record.primaryIntent,
        plot_status: record.plotStatus ?? '',
        construction_stage: record.constructionStage ?? '',
        has_house_plan: record.hasHousePlan ?? '',
        home_status: record.homeStatus ?? '',
        improvement_intent: record.improvementIntent ?? '',
        service_category: record.serviceCategory ?? '',
        service_urgency: record.serviceUrgency ?? '',
        ...(intent === 'home-service' ? { service_entry: entry } : {}),
      })
    }, 600)
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <span className="text-[12px] tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 1 of 4</span>
        </div>
        <div className="h-[2px] bg-[#F4F0EC] w-full">
          <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: '25%' }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 1000 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Homeowner Setup</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              {headerContent.title}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[540px]" style={{ fontFamily: FONT_BODY }}>
              {headerContent.description}
            </p>
          </div>

          {/* Hozie intro */}
          <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5" style={{ maxWidth: 700, margin: '0 auto', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="shrink-0"><HIcon size={32} /></div>
            <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>{headerContent.hozieMessage}</p>
          </div>

          {/* Intent-specific questions */}
          <div className="flex flex-col gap-6">
            {intent === 'build-home' && (
              <>
                <div>
                  <QuestionLabel index={1} question="Do you already have a plot?" />
                  <div role="radiogroup" aria-label="Do you already have a plot?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PLOT_STATUS_OPTIONS.map(opt => (
                      <OptionCard key={opt.value} title={opt.title} description={opt.description} selected={plotStatus === opt.value} onSelect={() => setPlotStatus(opt.value)} />
                    ))}
                  </div>
                </div>
                <div>
                  <QuestionLabel index={2} question="Where are you in your construction journey?" />
                  <div role="radiogroup" aria-label="Where are you in your construction journey?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CONSTRUCTION_STAGE_OPTIONS.map(opt => (
                      <OptionCard key={opt.value} title={opt.title} description={opt.description} selected={constructionStage === opt.value} onSelect={() => setConstructionStage(opt.value)} />
                    ))}
                  </div>
                </div>
                <div>
                  <QuestionLabel index={3} question="Do you already have a house plan?" />
                  <div role="radiogroup" aria-label="Do you already have a house plan?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HAS_HOUSE_PLAN_OPTIONS.map(opt => (
                      <OptionCard key={opt.value} title={opt.title} description={opt.description} selected={hasHousePlan === opt.value} onSelect={() => setHasHousePlan(opt.value)} />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#9A949D] mt-2 m-0" style={{ fontFamily: FONT_BODY }}>You&apos;ll be able to upload your plan later — no need to do that here.</p>
                </div>
              </>
            )}

            {intent === 'improve-home' && (
              <>
                <div>
                  <QuestionLabel index={1} question="What best describes your home?" />
                  <div role="radiogroup" aria-label="What best describes your home?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HOME_STATUS_OPTIONS.map(opt => (
                      <OptionCard key={opt.value} title={opt.title} description={opt.description} selected={homeStatus === opt.value} onSelect={() => setHomeStatus(opt.value)} />
                    ))}
                  </div>
                </div>
                <div>
                  <QuestionLabel index={2} question="What are you looking to do?" />
                  <div role="radiogroup" aria-label="What are you looking to do?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {IMPROVEMENT_INTENT_OPTIONS.map(opt => (
                      <OptionCard key={opt.value} title={opt.title} description={opt.description} selected={improvementIntent === opt.value} onSelect={() => setImprovementIntent(opt.value)} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {intent === 'home-service' && (
              <>
                <div>
                  <QuestionLabel index={1} question={entry === 'cleaning' ? 'What would you like cleaned?' : 'What kind of help do you need?'} />
                  <div role="radiogroup" aria-label={entry === 'cleaning' ? 'What would you like cleaned?' : 'What kind of help do you need?'} className="flex flex-wrap gap-2">
                    {serviceCategoryOptions.map(cat => (
                      <ServiceChip key={cat.id} label={cat.name} selected={serviceCategory === cat.id} onSelect={() => setServiceCategory(cat.id)} />
                    ))}
                  </div>
                </div>
                <div>
                  <QuestionLabel index={2} question="How urgent is the work?" />
                  <div role="radiogroup" aria-label="How urgent is the work?" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {SERVICE_URGENCY_OPTIONS.map(opt => (
                      <OptionCard key={opt.value} title={opt.title} description={opt.description} selected={serviceUrgency === opt.value} onSelect={() => setServiceUrgency(opt.value)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Your name */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Your Name</span>
            <div className="max-w-[360px] w-full flex items-center border rounded-[12px] bg-white h-[48px] overflow-hidden transition-colors border-[#E3DDD7] focus-within:border-[#722ED1]">
              <div className="flex items-center pl-3.5 pr-2 shrink-0 text-[#9A949D]"><UserIcon /></div>
              <input
                id="onboarding-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 h-full pr-4 text-[14px] text-[#242326] placeholder:text-[#CAC7C6] bg-transparent outline-none border-none"
                style={{ fontFamily: FONT_BODY }}
              />
            </div>
          </div>

          {/* Personalization summary */}
          {summaryLines.length > 0 && (
            <div className="w-full rounded-[16px] p-5 flex flex-col gap-2.5" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[7px] bg-white flex items-center justify-center shrink-0"><HIcon size={16} /></span>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>Your Starting Point</span>
              </div>
              <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{INTENT_LABELS[intent]}</span>
              <div className="flex flex-col gap-1.5">
                {summaryLines.map(line => (
                  <div key={line} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>
                    <span className="text-[13px] text-[#242326]" style={{ fontFamily: FONT_BODY }}>{line}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#722ED1] opacity-80 m-0 mt-1" style={{ fontFamily: FONT_BODY }}>Hozie will use this to personalize your next steps.</p>
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
                  canContinue ? 'bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]' : 'bg-[#F4F0EC] text-[#9A949D] cursor-pointer',
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
                ) : 'Continue →'}
              </button>
              <button
                onClick={handleBack}
                disabled={stage === 'submitting'}
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors disabled:opacity-60"
                style={{ fontFamily: FONT_BODY }}
              >
                ← Back
              </button>
            </div>
            <p className="text-[11px] text-[#9A949D] text-center m-0 max-w-[420px]" style={{ fontFamily: FONT_BODY }}>
              Your information is used to personalize your Houzeify experience. You can change these details later.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 flex justify-center items-center gap-2.5 pb-5 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>
    </div>
  )
}
