import { useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
import {
  HOME_INTENT_HEADER_CONTENT,
  HOME_TYPE_OPTIONS,
  HOME_INTENT_STAGE_OPTIONS,
  HOME_BHK_OPTIONS,
  HOME_FLOOR_COUNT_OPTIONS,
  IMPROVEMENT_TYPE_OPTIONS,
  HOME_AREA_LABELS,
  HOME_AREA_OPTIONS,
  SERVICE_NEED_OPTIONS,
  serviceNeedLabel,
  isHomeIntentValid,
  getHomeIntentSummaryLines,
  homeIntentSummaryTitle,
  createHomeIntent,
  type PrimaryIntent,
  type HomeType,
  type ConstructionStage,
  type HomeBHK,
  type HomeFloorCount,
  type ImprovementType,
  type HomeArea,
  type ServiceCategory,
  type ServiceNeed,
  type HomeIntentFormValues,
  type LegacyServiceCategory,
} from '@/data/constructionIntent'
import { getCleaningCategories, getCategoriesForEntry, usesFreeTextIntent, type ServiceCategoryMeta } from '@/data/homeServices'
import { resolveServiceEntry, type ServiceEntry } from '@/data/serviceEntry'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

const HOMEOWNER_INTENTS: PrimaryIntent[] = ['build-home', 'improve-home', 'home-service']

// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 9 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

// ─── Shared bits ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-ink-subtle)] block mb-2" style={{ fontFamily: FONT_MONO }}>{children}</span>
}

// Single-select option card — radio semantics.
function OptionCard({ title, description, selected, onSelect }: { title: string; description: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={[
        'relative text-left flex flex-col gap-1 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer h-full',
        selected ? 'bg-[#F9F5FF] border-2 border-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] border border-[var(--hz-border)] hover:bg-[var(--hz-surface)] hover:border-[var(--hz-primary)]',
      ].join(' ')}
    >
      <span className={['text-[13.5px] font-semibold leading-tight', selected ? 'text-[var(--hz-primary)]' : 'text-[var(--hz-ink)]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>{title}</span>
      <span className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>{description}</span>
      {selected && (
        <span className="absolute top-3 right-3 w-[16px] h-[16px] rounded-full bg-[var(--hz-primary)] flex items-center justify-center" aria-hidden="true">
          <CheckIcon />
        </span>
      )}
    </button>
  )
}

// Multi-select option card — checkbox semantics.
function MultiOptionCard({ title, description, selected, onToggle }: { title: string; description: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={[
        'relative text-left flex flex-col gap-1 rounded-[14px] p-4 transition-all duration-200 outline-none cursor-pointer h-full',
        selected ? 'bg-[#F9F5FF] border-2 border-[var(--hz-primary)]' : 'bg-[var(--hz-surface)] border border-[var(--hz-border)] hover:bg-[var(--hz-surface)] hover:border-[var(--hz-primary)]',
      ].join(' ')}
    >
      <span className={['text-[13.5px] font-semibold leading-tight', selected ? 'text-[var(--hz-primary)]' : 'text-[var(--hz-ink)]'].join(' ')} style={{ fontFamily: FONT_HEAD }}>{title}</span>
      <span className="text-[12px] text-[var(--hz-ink-muted)] leading-[1.45]" style={{ fontFamily: FONT_BODY }}>{description}</span>
      {selected && (
        <span className="absolute top-3 right-3 w-[16px] h-[16px] rounded-[5px] bg-[var(--hz-primary)] flex items-center justify-center" aria-hidden="true">
          <CheckIcon />
        </span>
      )}
    </button>
  )
}

function Chip({ label, selected, onToggle, multi }: { label: string; selected: boolean; onToggle: () => void; multi?: boolean }) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      onClick={onToggle}
      className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-all border"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: selected ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
        borderColor: selected ? 'var(--hz-primary)' : '#CAC7C6',
        color: selected ? 'var(--hz-primary)' : 'var(--hz-black)',
      }}
    >
      {selected && <span className={['flex items-center justify-center shrink-0 bg-[var(--hz-primary)]', multi ? 'w-[14px] h-[14px] rounded-[4px]' : 'w-[14px] h-[14px] rounded-full'].join(' ')} aria-hidden="true"><CheckIcon size={8} /></span>}
      {label}
    </button>
  )
}

type SubmitStage = 'idle' | 'submitting'

// ─── Empty/error state — no valid homeowner intent ────────────────────────

function MissingIntentView({ onNavigate }: { onNavigate: (screen: string, data?: Record<string, string>) => void }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center relative px-5 py-10" style={{ backgroundColor: 'var(--hz-surface)' }}>
      <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-[420px]">
        <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto mb-2" style={{ mixBlendMode: 'multiply' }} />
        <p className="text-[15px] text-[var(--hz-ink)] leading-[1.6] m-0" style={{ fontFamily: FONT_HEAD }}>Let&apos;s start by choosing what you&apos;d like to do.</p>
        {/* The former Screen 007 (PrimaryIntentScreen) this recovered to was
            removed as an orphaned, no-longer-reachable step — 'account-created'
            is the real current entry point into both the homeowner and
            professional paths. */}
        <button
          onClick={() => onNavigate('account-created')}
          className="h-[48px] px-5 rounded-[12px] text-[14px] font-semibold cursor-pointer border-0 bg-[var(--hz-primary)] text-white hover:brightness-90 transition-all"
          style={{ fontFamily: FONT_BODY }}
        >
          Choose your goal →
        </button>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function HomeIntentScreen({
  primaryIntent,
  constructionStage: initialConstructionStage,
  homeType: initialHomeType,
  homeBHK: initialHomeBHK,
  homeBuiltUpArea: initialHomeBuiltUpArea,
  homeFloorCount: initialHomeFloorCount,
  serviceCategory: initialServiceCategory,
  serviceEntry,
  location,
  signupFlow,
  onNavigate,
}: {
  primaryIntent?: string
  constructionStage?: string
  /** Real values already saved from a previous visit to this screen — used
   *  only to pre-fill the fields below when re-entering (e.g. via Screen
   *  035's "Edit in Your Home" link), never to change what this screen
   *  collects or how. */
  homeType?: string
  homeBHK?: string
  homeBuiltUpArea?: string
  homeFloorCount?: string
  serviceCategory?: string
  /** Which of the two service destinations (Screen 007) this session
   *  entered through — 'cleaning' | 'home-services'. Only meaningful for
   *  intent === 'home-service'; ignored otherwise. Never a role, never a
   *  second PrimaryIntent. */
  serviceEntry?: string
  location?: string
  /** Set (to 'true') only when LocationSetupScreen's signup-time branch
   *  forced primaryIntent to 'build-home' to reach this screen (there was
   *  no real 3-way choice upstream) — changes nothing about the form
   *  itself, only handleContinue's destination below: saves the details
   *  for future projects and goes to Home, instead of this screen's usual
   *  create-project handoff. */
  signupFlow?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const intent = HOMEOWNER_INTENTS.includes(primaryIntent as PrimaryIntent) ? (primaryIntent as PrimaryIntent) : null

  if (!intent) {
    return <MissingIntentView onNavigate={onNavigate} />
  }

  return (
    <HomeIntentForm
      intent={intent}
      initialConstructionStage={initialConstructionStage}
      initialHomeType={initialHomeType}
      initialHomeBHK={initialHomeBHK}
      initialHomeBuiltUpArea={initialHomeBuiltUpArea}
      initialHomeFloorCount={initialHomeFloorCount}
      initialServiceCategory={initialServiceCategory}
      serviceEntry={resolveServiceEntry(serviceEntry)}
      location={location}
      signupFlow={signupFlow}
      onNavigate={onNavigate}
    />
  )
}

function HomeIntentForm({
  intent,
  initialConstructionStage,
  initialHomeType,
  initialHomeBHK,
  initialHomeBuiltUpArea,
  initialHomeFloorCount,
  initialServiceCategory,
  serviceEntry,
  location,
  signupFlow,
  onNavigate,
}: {
  intent: PrimaryIntent
  initialConstructionStage?: string
  initialHomeType?: string
  initialHomeBHK?: string
  initialHomeBuiltUpArea?: string
  initialHomeFloorCount?: string
  initialServiceCategory?: string
  serviceEntry: ServiceEntry
  location?: string
  signupFlow?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  // The real category list for this session's service destination — the
  // enforcement point ensuring a Cleaning session only ever sees cleaning
  // categories and a Home Services session only ever sees home-service
  // categories, never both. Sourced once, from the SAME canonical catalogue
  // homeServices.ts already defines — never a third, screen-local list.
  const serviceCategoryOptions: ServiceCategoryMeta[] = intent === 'home-service'
    ? (serviceEntry === 'cleaning' ? getCleaningCategories() : getCategoriesForEntry('home-services'))
    : []
  const headerContent = HOME_INTENT_HEADER_CONTENT[intent]

  const [homeType, setHomeType] = useState<HomeType | null>(
    () => (HOME_TYPE_OPTIONS.some(o => o.value === initialHomeType) ? (initialHomeType as HomeType) : null),
  )
  // Read-only here — "Where are you in your construction journey?" is
  // already asked and answered on Screen 008 (Homeowner Setup); this
  // screen carries that same value through rather than asking it a second
  // time. No setter: nothing on this screen ever changes it.
  const constructionStage: ConstructionStage | null = HOME_INTENT_STAGE_OPTIONS.some(o => o.value === initialConstructionStage)
    ? (initialConstructionStage as ConstructionStage)
    : null
  const [homeBHK, setHomeBHK] = useState<HomeBHK | null>(
    () => (HOME_BHK_OPTIONS.some(o => o.value === initialHomeBHK) ? (initialHomeBHK as HomeBHK) : null),
  )
  const [homeBuiltUpArea, setHomeBuiltUpArea] = useState(initialHomeBuiltUpArea ?? '')
  const [homeFloorCount, setHomeFloorCount] = useState<HomeFloorCount | null>(
    () => (HOME_FLOOR_COUNT_OPTIONS.some(o => o.value === initialHomeFloorCount) ? (initialHomeFloorCount as HomeFloorCount) : null),
  )
  const [improvementTypes, setImprovementTypes] = useState<ImprovementType[]>([])
  const [homeAreas, setHomeAreas] = useState<HomeArea[]>([])
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | null>(
    () => (serviceCategoryOptions.some(c => c.id === initialServiceCategory) ? (initialServiceCategory as ServiceCategory) : null),
  )
  const [serviceNeed, setServiceNeed] = useState<ServiceNeed | null>(null)
  const [otherDescription, setOtherDescription] = useState('')
  const [stage, setStage] = useState<SubmitStage>('idle')

  const formValues: HomeIntentFormValues = {
    primaryIntent: intent, homeType, constructionStage, homeBHK, homeBuiltUpArea, homeFloorCount,
    improvementTypes, homeAreas, serviceCategory, serviceNeed, otherDescription,
  }
  const canContinue = isHomeIntentValid(formValues)
  // getHomeIntentSummaryLines() only knows the 16 legacy categories (never
  // fabricates a label for a new one) — for a real new-taxonomy selection,
  // prepend its real name from the same canonical list rendered above,
  // rather than showing an incomplete summary.
  const selectedNewCategory = intent === 'home-service' && serviceCategory
    ? serviceCategoryOptions.find(c => c.id === serviceCategory)
    : undefined
  const summaryLines = selectedNewCategory
    ? [selectedNewCategory.name, ...getHomeIntentSummaryLines(formValues, location)]
    : getHomeIntentSummaryLines(formValues, location)

  function toggleImprovement(type: ImprovementType) {
    setImprovementTypes(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]))
  }
  function toggleArea(area: HomeArea) {
    setHomeAreas(prev => (prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]))
  }
  function selectServiceCategory(cat: ServiceCategory) {
    setServiceCategory(cat)
    setServiceNeed(null)
  }

  function handleBack() {
    onNavigate('location-setup')
  }

  function handleContinue() {
    if (!canContinue || stage === 'submitting') return
    setStage('submitting')
    const record = createHomeIntent(formValues, 'user-demo-001')
    setTimeout(() => {
      const sharedFields = {
        primary_intent: record.primaryIntent,
        home_type: record.homeType ?? '',
        construction_stage: record.constructionStage ?? '',
        home_bhk: record.homeBHK ?? '',
        home_built_up_area: record.homeBuiltUpArea,
        home_floor_count: record.homeFloorCount ?? '',
        improvement_types: record.improvementTypes.join(','),
        home_areas: record.homeAreas.join(','),
        service_category: record.serviceCategory ?? '',
        service_need: record.serviceNeed ?? '',
        other_description: record.otherDescription,
        ...(intent === 'home-service' ? { service_entry: serviceEntry } : {}),
        // Closes the loop opened by BuildOrImproveScreen/PrimaryIntentScreen
        // setting this — Screen 011 is always the last step of the
        // onboarding-style chain, so it's the right place to clear it
        // regardless of which intent brought the user here.
        onboarding_flow: '',
      }

      // Signup-time entry (LocationSetupScreen's !primaryIntent branch,
      // forcing 'build-home' just to reach this screen): the details are
      // just being saved for future projects, not starting one right now
      // — so this goes straight to Home instead of Create Project, and
      // clears signup_flow the same way onboarding_flow is cleared above.
      if (signupFlow) {
        onNavigate('dashboard-home', { ...sharedFields, signup_flow: '' })
        return
      }

      // build-home and improve-home: instead of landing back on the
      // dashboard, carry into Screen 035 (Create Project) — which already
      // exists specifically for this handoff (its own props/comments read
      // home_type/construction_stage/home_bhk/home_built_up_area/
      // home_floor_count straight out of projectData as a read-only summary
      // of what was just collected here). 035 is where the user types a
      // real project name and confirms property type/location before its
      // own existing "Continue" carries on into 041 Estimate Loading → 042
      // Construction Estimate — so this reuses that whole existing chain
      // rather than skipping past it and fabricating a project name here.
      // home-service keeps the original, unchanged destination
      // (dashboard-home) — booking a service provider isn't a project.
      if (intent === 'build-home' || intent === 'improve-home') {
        // Clears whatever project_id/name was last active in projectData
        // (its cumulative bag never resets itself) — otherwise Create
        // Project's own `initialProjectId || nextProjectId()` convenience
        // (meant for resuming the SAME project across a Back/Continue
        // round-trip) would instead reuse a DIFFERENT, already-existing
        // project's id here, silently overwriting it. Same fix as Build &
        // Renovate's / Projects List's own "start a new project" entries.
        onNavigate('create-project', { ...sharedFields, project_id: '', project_name: '', project_type: '', project_stage: '' })
        return
      }

      onNavigate('dashboard-home', sharedFields)
    }, 500)
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <span className="text-[12px] tracking-[0.08em] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>Step 4 of 4</span>
        </div>
        <div className="h-[2px] bg-[var(--hz-surface-muted)] w-full">
          <div className="h-full bg-[var(--hz-primary)] transition-all duration-500" style={{ width: '100%' }} />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 1000 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[var(--hz-primary)] font-semibold" style={{ fontFamily: FONT_MONO }}>{headerContent.eyebrow}</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[var(--hz-ink)] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              {headerContent.title}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[var(--hz-ink-muted)] leading-[1.65] m-0 max-w-[540px]" style={{ fontFamily: FONT_BODY }}>
              {headerContent.description}
            </p>
          </div>

          {/* Hozie intro */}
          <div className="w-full flex items-center gap-3 bg-[var(--hz-surface)] border border-[var(--hz-border)] rounded-[16px] px-5 py-3.5" style={{ maxWidth: 700, margin: '0 auto', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            <div className="shrink-0"><HIcon size={32} /></div>
            <p className="text-[13px] text-[var(--hz-ink-muted)] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>{headerContent.hozieMessage}</p>
          </div>

          {/* Intent-specific questions */}
          <div className="flex flex-col gap-6">
            {intent === 'build-home' && (
              <>
                <div>
                  <SectionLabel>What are you planning to build?</SectionLabel>
                  <div role="radiogroup" aria-label="What are you planning to build?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HOME_TYPE_OPTIONS.map(opt => (
                      <OptionCard key={opt.value} title={opt.title} description={opt.description} selected={homeType === opt.value} onSelect={() => setHomeType(opt.value)} />
                    ))}
                  </div>
                </div>
                {/* ─── Batch B — basic "Your Home" attributes ──────────────
                    All three optional, none block Continue. "I don't know
                    yet" / "Not decided yet" are real, honest answers, never
                    silently skipped in favour of a guessed default. */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <SectionLabel>How many bedrooms?</SectionLabel>
                    <span className="text-[11px] text-[var(--hz-ink-subtle)] -mt-2" style={{ fontFamily: FONT_BODY }}>Optional</span>
                  </div>
                  <div role="radiogroup" aria-label="How many bedrooms?" className="flex flex-wrap gap-2">
                    {HOME_BHK_OPTIONS.map(opt => (
                      <Chip key={opt.value} label={opt.label} selected={homeBHK === opt.value} onToggle={() => setHomeBHK(opt.value)} />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <SectionLabel>Roughly how big is it?</SectionLabel>
                    <span className="text-[11px] text-[var(--hz-ink-subtle)] -mt-2" style={{ fontFamily: FONT_BODY }}>Optional</span>
                  </div>
                  <div className="flex items-center gap-2 max-w-[280px]">
                    <input
                      id="home-built-up-area"
                      type="text"
                      inputMode="numeric"
                      value={homeBuiltUpArea}
                      onChange={e => setHomeBuiltUpArea(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 1800"
                      aria-label="Approximate built-up area in square feet"
                      className="w-full h-11 px-3.5 rounded-[10px] border border-[var(--hz-border)] focus:border-[var(--hz-primary)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] outline-none transition-colors"
                      style={{ fontFamily: FONT_BODY }}
                    />
                    <span className="text-[12.5px] text-[var(--hz-ink-muted)] shrink-0" style={{ fontFamily: FONT_BODY }}>sq ft</span>
                  </div>
                  <p className="text-[11px] text-[var(--hz-ink-subtle)] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Approximate is fine — leave blank if you're not sure yet.</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <SectionLabel>How many floors?</SectionLabel>
                    <span className="text-[11px] text-[var(--hz-ink-subtle)] -mt-2" style={{ fontFamily: FONT_BODY }}>Optional</span>
                  </div>
                  <div role="radiogroup" aria-label="How many floors?" className="flex flex-wrap gap-2">
                    {HOME_FLOOR_COUNT_OPTIONS.map(opt => (
                      <Chip key={opt.value} label={opt.label} selected={homeFloorCount === opt.value} onToggle={() => setHomeFloorCount(opt.value)} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {intent === 'improve-home' && (
              <>
                <div>
                  <SectionLabel>What would you like to improve?</SectionLabel>
                  <div role="group" aria-label="What would you like to improve?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {IMPROVEMENT_TYPE_OPTIONS.map(opt => (
                      <MultiOptionCard key={opt.value} title={opt.title} description={opt.description} selected={improvementTypes.includes(opt.value)} onToggle={() => toggleImprovement(opt.value)} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <SectionLabel>Which part of your home?</SectionLabel>
                    <span className="text-[11px] text-[var(--hz-ink-subtle)] -mt-2" style={{ fontFamily: FONT_BODY }}>Optional</span>
                  </div>
                  <div role="group" aria-label="Which part of your home?" className="flex flex-wrap gap-2">
                    {HOME_AREA_OPTIONS.map(area => (
                      <Chip key={area} label={HOME_AREA_LABELS[area]} selected={homeAreas.includes(area)} onToggle={() => toggleArea(area)} multi />
                    ))}
                  </div>
                </div>
              </>
            )}

            {intent === 'home-service' && (
              <>
                <div>
                  <SectionLabel>{serviceEntry === 'cleaning' ? 'What would you like cleaned?' : 'What service do you need?'}</SectionLabel>
                  <div role="radiogroup" aria-label={serviceEntry === 'cleaning' ? 'What would you like cleaned?' : 'What service do you need?'} className="flex flex-wrap gap-2">
                    {serviceCategoryOptions.map(cat => (
                      <Chip key={cat.id} label={cat.name} selected={serviceCategory === cat.id} onToggle={() => selectServiceCategory(cat.id)} />
                    ))}
                  </div>
                  {serviceCategory && usesFreeTextIntent(serviceCategory) && (
                    <div className="mt-3">
                      <label htmlFor="other-description" className="text-[13px] font-semibold text-[var(--hz-ink)] mb-1.5 block" style={{ fontFamily: FONT_BODY }}>Tell us what you need</label>
                      <textarea
                        id="other-description"
                        value={otherDescription}
                        onChange={e => setOtherDescription(e.target.value)}
                        placeholder="Briefly describe the service you're looking for."
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--hz-border)] focus:border-[var(--hz-primary)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none max-w-[500px]"
                        style={{ fontFamily: FONT_BODY }}
                      />
                    </div>
                  )}
                </div>

                {/* Structured "what do you want to do?" chips only apply to
                    the legacy categories that still have real
                    install/replace/repair-style options configured — every
                    category introduced by the Home Services / Cleaning
                    Services split is a single, atomic, bookable service
                    (usesFreeTextIntent === true for all of them), so this
                    section simply doesn't render for the new taxonomy. */}
                {serviceCategory && !usesFreeTextIntent(serviceCategory) && (
                  <div>
                    <SectionLabel>What do you want to do?</SectionLabel>
                    <div role="radiogroup" aria-label="What do you want to do?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SERVICE_NEED_OPTIONS.map(need => (
                        <OptionCard
                          key={need}
                          title={serviceNeedLabel(need, serviceCategory as LegacyServiceCategory)}
                          description=""
                          selected={serviceNeed === need}
                          onSelect={() => setServiceNeed(need)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Summary */}
          {summaryLines.length > 0 && (
            <div className="w-full rounded-[16px] p-5 flex flex-col gap-2.5" style={{ backgroundColor: '#F9F5FF', border: '1px solid rgba(243,234,255,0.10)' }}>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-[7px] bg-[var(--hz-surface)] flex items-center justify-center shrink-0"><HIcon size={16} /></span>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[var(--hz-primary)]" style={{ fontFamily: FONT_MONO }}>{homeIntentSummaryTitle(intent)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {summaryLines.map((line, i) => (
                  <div key={`${line}-${i}`} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={8} /></span>
                    <span className="text-[13px] text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{line}</span>
                  </div>
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
                  canContinue ? 'bg-[var(--hz-primary)] text-white cursor-pointer hover:brightness-90 active:scale-[0.99]' : 'bg-[var(--hz-surface-muted)] text-[var(--hz-ink-subtle)] cursor-pointer',
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
                className="h-[52px] text-[13.5px] font-medium rounded-[12px] w-full sm:w-auto px-5 cursor-pointer border border-[var(--hz-border)] bg-[var(--hz-surface)] text-[var(--hz-ink-muted)] hover:border-[#A1A1A1] transition-colors disabled:opacity-60"
                style={{ fontFamily: FONT_BODY }}
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
