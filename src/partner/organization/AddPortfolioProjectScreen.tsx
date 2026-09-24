import { useEffect, useMemo, useRef, useState } from 'react'
import { getContractorListingById, type ContractorDirectoryInput } from '@/data/contractorDirectory'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'
import { SERVICE_CATEGORY_LABELS, type ServiceCategoryType } from '@/data/serviceCategories'
import type { AccountType } from '@/data/accountType'
import {
  PROJECT_TYPE_OPTIONS,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_STATUS_LABELS,
  COMPANY_ROLE_OPTIONS,
  COMPANY_ROLE_LABELS,
  VISIBILITY_OPTIONS,
  VISIBILITY_LABELS,
  VISIBILITY_DESCRIPTIONS,
  DESCRIPTION_MAX,
  MAX_IMAGES_PER_PROJECT,
  validatePortfolioForm,
  isPortfolioFormValid,
  uploadPortfolioImage,
  getPortfolioProjects,
  addPortfolioProject,
  type PortfolioFormValues,
  type PortfolioImage,
  type PortfolioVisibility,
  type AreaUnit,
} from '@/data/portfolio'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Inter Variable", sans-serif'
const FONT_HEAD = '"Geist Variable", sans-serif'

// ─── Screen 085 — Add Portfolio Project ─────────────────────────────────────
// A PROFESSIONAL screen reached from 084. Creates ONE new PortfolioProject
// through the existing addPortfolioProject() seam — no second model, no
// second store, no new validation system. Every field, validation rule,
// image-upload behavior and visibility option below mirrors Screen 026's
// own (module-private) ProjectFormModal exactly, per the confirmed 085
// diagnostic — portfolio.ts/validatePortfolioForm()/
// isPortfolioFormValid()/uploadPortfolioImage() are reused verbatim.
//
// OWNERSHIP: PortfolioProject only ever supports organizationId (confirmed
// by the diagnostic) — never a professionalId. The real id is derived via
// the exact same getContractorListingById() mechanism 084/081/061 already
// use. When that resolves to no real organizationId (every individual
// professional in this app's current flows, or an organization account
// that hasn't actually completed Create Organization), this screen shows
// the honest unsupported state instead of ever saving under a fabricated
// id — never 'user-id'/'professional-id'/'proj-001' or any substitute.

const EMPTY_DRAFT: PortfolioFormValues = {
  name: '', projectType: null, status: null, location: '', year: '', area: '', areaUnit: 'sqft', unitCount: '', description: '', companyRole: null, relatedServiceCategory: null,
}


const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5" /></svg>
)
// Same small icon set as Screen 026's ProjectFormModal — duplicated locally
// per this codebase's established per-screen convention.
const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 3L11 11M11 3L3 11" /></svg>
)
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 11V2.5M5 5.5L8 2.5L11 5.5" /><path d="M2.5 10.5V13a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2.5" /></svg>
)
const ArrowLeftIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 2.5L3 6l4.5 3.5" /></svg>
)
const ArrowRightIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5L9 6l-4.5 3.5" /></svg>
)
const StarIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="currentColor"><path d="M5 0.5l1.3 2.8l3 0.4l-2.2 2.1l0.5 3l-2.6-1.4l-2.6 1.4l0.5-3l-2.2-2.1l3-0.4Z" /></svg>
)

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[13px] font-semibold text-[var(--hz-ink)]" style={{ fontFamily: FONT_BODY }}>{children}</label>
      {optional && <span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
    </div>
  )
}
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p id={id} role="alert" className="text-[12px] mt-1.5 m-0" style={{ color: '#D97706', fontFamily: FONT_BODY }}>{message}</p>
}
function TextInput({ id, value, onChange, placeholder, error, describedBy, type = 'text' }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean; describedBy?: string; type?: string
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={error}
      aria-describedby={describedBy}
      className={['w-full h-[44px] px-3.5 rounded-[10px] border bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] outline-none transition-colors', error ? 'border-[#D97706]' : 'border-[var(--hz-border)] focus:border-[var(--hz-primary)]'].join(' ')}
      style={{ fontFamily: FONT_BODY }}
    />
  )
}
function ChipGroup<T extends string>({ options, labels, value, onChange, ariaLabel }: {
  options: T[]; labels: Record<T, string>; value: T | null; onChange: (v: T) => void; ariaLabel: string
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={value === opt}
          onClick={() => onChange(opt)}
          className="flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-semibold cursor-pointer border transition-all"
          style={{
            fontFamily: FONT_BODY,
            backgroundColor: value === opt ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
            borderColor: value === opt ? 'var(--hz-primary)' : '#CAC7C6',
            color: value === opt ? 'var(--hz-primary)' : 'var(--hz-black)',
          }}
        >
          {value === opt && <span className="w-3 h-3 rounded-full bg-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={7} /></span>}
          {labels[opt]}
        </button>
      ))}
    </div>
  )
}

interface AddPortfolioProjectScreenProps {
  role?: string
  userId?: string
  organizationId?: string
  companyName?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  location?: string
  serviceCategories?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}

export default function AddPortfolioProjectScreen({
  role,
  userId,
  organizationId,
  companyName,
  accountType,
  professionalType,
  professionalTypeOther,
  location,
  serviceCategories,
  onNavigate,
}: AddPortfolioProjectScreenProps) {
  const isProfessional = role === 'professional'
  useEffect(() => {
    if (!isProfessional) onNavigate('dashboard-home')
  }, [isProfessional, onNavigate])
  if (!isProfessional) return null

  const isOrganization = accountType === 'organization'
  const resolvedUserId = userId || 'user-demo-001'

  const directoryInput: ContractorDirectoryInput = {
    userId: resolvedUserId,
    accountType: accountType as AccountType | undefined,
    organizationId,
    companyName,
    professionalType: professionalType as ProfessionalType | undefined,
    location,
    serviceCategories,
    serviceLocations: undefined,
    verificationStatus: undefined,
    portfolioProjectCount: undefined,
    serviceDescription: undefined,
  }
  const listingId = isOrganization ? (organizationId ?? resolvedUserId) : resolvedUserId
  const listing = useMemo(
    () => getContractorListingById(listingId, directoryInput),
    [listingId, directoryInput.accountType, directoryInput.organizationId, directoryInput.companyName, directoryInput.professionalType,
      directoryInput.location, directoryInput.serviceCategories]
  )
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : (professionalType ? PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title : undefined)

  // The exact same key 084/061 already gate on — never a fabricated
  // substitute. Individuals never have a real one in this app's flows.
  const resolvedOrganizationId = listing?.organizationId ?? null

  const availableServiceCategories = useMemo(
    () => (serviceCategories ? serviceCategories.split(',') : []).filter((s): s is ServiceCategoryType => s in SERVICE_CATEGORY_LABELS),
    [serviceCategories]
  )
  const existingNames = useMemo(
    () => (resolvedOrganizationId ? getPortfolioProjects(resolvedOrganizationId).map(p => p.name) : []),
    [resolvedOrganizationId]
  )

  const [values, setValues] = useState<PortfolioFormValues>(EMPTY_DRAFT)
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [coverId, setCoverId] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<PortfolioVisibility>('public')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [imageError, setImageError] = useState<string | undefined>(undefined)
  const [uploading, setUploading] = useState(false)
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const errors = validatePortfolioForm(values, existingNames)
  const showError = (field: keyof typeof errors) => (touched[field] || attemptedSave) && !!errors[field]
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const selectClass = 'h-10 px-5 rounded-[12px] text-[13.5px] font-semibold border-0'

  function goToPortfolio() {
    onNavigate('portfolio')
  }

  // ─── Individual / no-organization safety — never save under a fake id ────
  if (!resolvedOrganizationId) {
    return (
      <div className="min-h-full flex flex-col relative items-center justify-center gap-4 px-6" style={{ backgroundColor: 'var(--hz-surface)' }}>
        <div className="relative z-10 flex flex-col items-center gap-3 text-center max-w-[420px]">
          <p className="text-[15px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Portfolio projects are currently available for organization profiles.</p>
          <p className="text-[13px] text-[var(--hz-ink-muted)] m-0" style={{ fontFamily: FONT_BODY }}>
            {isOrganization
              ? 'Complete your organization setup to start adding portfolio projects.'
              : 'Individual professional profiles don’t support portfolio projects yet.'}
          </p>
          <button type="button" onClick={goToPortfolio} className={selectClass} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY }}>
            Back to Portfolio
          </button>
        </div>
      </div>
    )
  }

  async function uploadFiles(fileList: FileList | File[] | null) {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return
    const room = MAX_IMAGES_PER_PROJECT - images.length
    if (room <= 0) {
      setImageError(`You can add up to ${MAX_IMAGES_PER_PROJECT} images per project.`)
      return
    }
    setImageError(undefined)
    setUploading(true)
    const toUpload = files.slice(0, room)
    for (const file of toUpload) {
      try {
        const result = await uploadPortfolioImage(file)
        const img: PortfolioImage = { id: result.imageId, url: result.url, fileName: result.metadata.fileName, fileSize: result.metadata.fileSize }
        setImages(prev => {
          const next = [...prev, img]
          setCoverId(prevCover => prevCover ?? next[0].id)
          return next
        })
      } catch (err) {
        setImageError(err instanceof Error ? err.message : 'Could not upload this image.')
      }
    }
    setUploading(false)
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    await uploadFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  async function handlePhotoDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDraggingPhoto(false)
    await uploadFiles(e.dataTransfer.files)
  }
  function removeImage(id: string) {
    setImages(prev => {
      const next = prev.filter(i => i.id !== id)
      setCoverId(prevCover => (prevCover === id ? (next[0]?.id ?? null) : prevCover))
      return next
    })
  }
  function moveImage(id: string, direction: -1 | 1) {
    setImages(prev => {
      const index = prev.findIndex(i => i.id === id)
      const target = index + direction
      if (index === -1 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function handleSave() {
    setAttemptedSave(true)
    setSaveError(false)
    if (!isPortfolioFormValid(values, existingNames)) return
    // Never reached without a real organizationId — the whole form is
    // gated behind the early "no organization" return above — but this
    // keeps the create call honest even if that guard is ever refactored.
    if (!resolvedOrganizationId) { setSaveError(true); return }
    try {
      addPortfolioProject({
        organizationId: resolvedOrganizationId,
        name: values.name,
        projectType: values.projectType!,
        status: values.status!,
        location: values.location,
        year: values.year.trim() ? Number(values.year) : null,
        area: values.area.trim() ? Number(values.area) : null,
        areaUnit: values.areaUnit,
        unitCount: values.unitCount.trim() ? Number(values.unitCount) : null,
        description: values.description,
        companyRole: values.companyRole!,
        relatedServiceCategory: values.relatedServiceCategory,
        images,
        coverImageId: coverId,
        visibility,
      })
      goToPortfolio()
    } catch {
      setSaveError(true)
    }
  }

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: 'var(--hz-surface)' }}>

      <header className="shrink-0 relative z-10 bg-[var(--hz-surface)]" style={{ borderBottom: '1px solid var(--hz-surface-muted)' }}>
        <div className="flex items-center h-14 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goToPortfolio} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
            <IcoBack /> Portfolio
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-6 py-8">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <div>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[var(--hz-primary)] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Add Portfolio Project</p>
            <h1 className="text-[20px] font-semibold text-[var(--hz-ink)] m-0" style={{ fontFamily: FONT_HEAD }}>Showcase your completed and ongoing work.</h1>
            <p className="text-[12.5px] text-[var(--hz-ink-muted)] m-0 mt-1" style={{ fontFamily: FONT_BODY }}>
              {companyName || 'Your organization'}{professionalTypeLabel ? ` · ${professionalTypeLabel}` : ''}
            </p>
          </div>

          <div className="rounded-[16px] bg-[var(--hz-surface)] p-5 flex flex-col gap-4" style={{ border: '1px solid var(--hz-border)' }}>
            <div>
              <FieldLabel>Project name</FieldLabel>
              <TextInput id="pf-name" value={values.name} onChange={v => { setValues(p => ({ ...p, name: v })); setSaveError(false) }} placeholder="e.g. Mantoor Residency" error={showError('name')} describedBy={showError('name') ? 'pf-name-error' : undefined} />
              {showError('name') && <FieldError id="pf-name-error" message={errors.name} />}
            </div>

            <div>
              <FieldLabel>Project type</FieldLabel>
              <ChipGroup options={PROJECT_TYPE_OPTIONS} labels={PROJECT_TYPE_LABELS} value={values.projectType} onChange={v => { setValues(p => ({ ...p, projectType: v })); markTouched('projectType') }} ariaLabel="Project type" />
              {showError('projectType') && <FieldError id="pf-type-error" message={errors.projectType} />}
            </div>

            <div>
              <FieldLabel>Project status</FieldLabel>
              <ChipGroup options={PROJECT_STATUS_OPTIONS} labels={PROJECT_STATUS_LABELS} value={values.status} onChange={v => { setValues(p => ({ ...p, status: v })); markTouched('status') }} ariaLabel="Project status" />
              {showError('status') && <FieldError id="pf-status-error" message={errors.status} />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel>Location</FieldLabel>
                <TextInput id="pf-location" value={values.location} onChange={v => setValues(p => ({ ...p, location: v }))} placeholder="e.g. Hyderabad, Telangana" error={showError('location')} describedBy={showError('location') ? 'pf-location-error' : undefined} />
                {showError('location') && <FieldError id="pf-location-error" message={errors.location} />}
              </div>
              <div>
                <FieldLabel optional>Year completed</FieldLabel>
                <TextInput id="pf-year" type="number" value={values.year} onChange={v => setValues(p => ({ ...p, year: v }))} placeholder="e.g. 2025" error={showError('year')} describedBy={showError('year') ? 'pf-year-error' : undefined} />
                {showError('year') && <FieldError id="pf-year-error" message={errors.year} />}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FieldLabel optional>Project size</FieldLabel>
                <div className="flex items-center gap-2">
                  <div className="flex-1"><TextInput id="pf-area" type="number" value={values.area} onChange={v => setValues(p => ({ ...p, area: v }))} placeholder="e.g. 12000" error={showError('area')} describedBy={showError('area') ? 'pf-area-error' : undefined} /></div>
                  <div role="radiogroup" aria-label="Area unit" className="flex items-center p-1 rounded-[8px] shrink-0" style={{ backgroundColor: 'var(--hz-surface-muted)' }}>
                    {(['sqft', 'sqm'] as AreaUnit[]).map(u => (
                      <button key={u} type="button" role="radio" aria-checked={values.areaUnit === u} onClick={() => setValues(p => ({ ...p, areaUnit: u }))}
                        className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold cursor-pointer border-0 transition-all"
                        style={{ fontFamily: FONT_BODY, backgroundColor: values.areaUnit === u ? 'var(--hz-surface)' : 'transparent', color: values.areaUnit === u ? 'var(--hz-primary)' : '#808080' }}
                      >{u === 'sqft' ? 'sq ft' : 'sq m'}</button>
                    ))}
                  </div>
                </div>
                {showError('area') && <FieldError id="pf-area-error" message={errors.area} />}
              </div>
              <div>
                <FieldLabel optional>Number of units</FieldLabel>
                <TextInput id="pf-units" type="number" value={values.unitCount} onChange={v => setValues(p => ({ ...p, unitCount: v }))} placeholder="e.g. 24" />
              </div>
            </div>

            <div>
              <FieldLabel>Your role in this project</FieldLabel>
              <ChipGroup options={COMPANY_ROLE_OPTIONS} labels={COMPANY_ROLE_LABELS} value={values.companyRole} onChange={v => { setValues(p => ({ ...p, companyRole: v })); markTouched('companyRole') }} ariaLabel="Your role in this project" />
              {showError('companyRole') && <FieldError id="pf-role-error" message={errors.companyRole} />}
            </div>

            {availableServiceCategories.length > 0 && (
              <div>
                <FieldLabel optional>Related service</FieldLabel>
                <div role="radiogroup" aria-label="Related service" className="flex flex-wrap gap-1.5">
                  {availableServiceCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      role="radio"
                      aria-checked={values.relatedServiceCategory === cat}
                      onClick={() => setValues(p => ({ ...p, relatedServiceCategory: p.relatedServiceCategory === cat ? null : cat }))}
                      className="flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-semibold cursor-pointer border transition-all"
                      style={{
                        fontFamily: FONT_BODY,
                        backgroundColor: values.relatedServiceCategory === cat ? 'var(--hz-primary-soft)' : 'var(--hz-surface)',
                        borderColor: values.relatedServiceCategory === cat ? 'var(--hz-primary)' : '#CAC7C6',
                        color: values.relatedServiceCategory === cat ? 'var(--hz-primary)' : 'var(--hz-black)',
                      }}
                    >
                      {values.relatedServiceCategory === cat && <span className="w-3 h-3 rounded-full bg-[var(--hz-primary)] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={7} /></span>}
                      {SERVICE_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--hz-ink-subtle)] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Which of your services does this project demonstrate? Tap again to clear.</p>
              </div>
            )}

            <div>
              <FieldLabel optional>About this project</FieldLabel>
              <textarea
                id="pf-description"
                value={values.description}
                onChange={e => setValues(p => ({ ...p, description: e.target.value.slice(0, DESCRIPTION_MAX) }))}
                placeholder="Briefly describe the project, scope and your company's involvement."
                rows={3}
                maxLength={DESCRIPTION_MAX}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[var(--hz-border)] focus:border-[var(--hz-primary)] bg-[var(--hz-surface)] text-[13.5px] text-[var(--hz-ink)] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none"
                style={{ fontFamily: FONT_BODY }}
              />
              <div className="flex justify-end mt-1"><span className="text-[11px] text-[var(--hz-ink-subtle)]" style={{ fontFamily: FONT_MONO }}>{values.description.length}/{DESCRIPTION_MAX}</span></div>
            </div>

            <div>
              <FieldLabel optional>Project images</FieldLabel>
              <div className="flex flex-wrap gap-2.5">
                {images.map((img, i) => (
                  <div key={img.id} className="relative w-[84px] h-[84px] rounded-[10px] overflow-hidden border" style={{ borderColor: coverId === img.id ? 'var(--hz-primary)' : '#CAC7C6', borderWidth: coverId === img.id ? 2 : 1 }}>
                    <img src={img.url} alt={`Project photo ${i + 1}`} className="w-full h-full object-cover" />
                    {coverId === img.id && (
                      <span className="absolute top-1 left-1 flex items-center gap-0.5 h-[16px] px-1 rounded-full bg-[var(--hz-primary)] text-white" style={{ fontFamily: FONT_MONO, fontSize: '9px' }}>
                        <StarIcon size={7} /> Cover
                      </span>
                    )}
                    <button type="button" onClick={() => removeImage(img.id)} aria-label={`Remove image ${i + 1}`} className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-black/60 text-white cursor-pointer border-0">
                      <CloseIcon />
                    </button>
                    <div className="absolute bottom-1 inset-x-1 flex items-center justify-between gap-1">
                      <button type="button" onClick={() => moveImage(img.id, -1)} disabled={i === 0} aria-label="Move image earlier" className="flex items-center justify-center w-5 h-5 rounded-full bg-black/60 text-white cursor-pointer border-0 disabled:opacity-30">
                        <ArrowLeftIcon />
                      </button>
                      {coverId !== img.id && (
                        <button type="button" onClick={() => setCoverId(img.id)} className="h-5 px-1.5 rounded-full bg-black/60 text-white cursor-pointer border-0" style={{ fontFamily: FONT_MONO, fontSize: '8px' }}>SET COVER</button>
                      )}
                      <button type="button" onClick={() => moveImage(img.id, 1)} disabled={i === images.length - 1} aria-label="Move image later" className="flex items-center justify-center w-5 h-5 rounded-full bg-black/60 text-white cursor-pointer border-0 disabled:opacity-30">
                        <ArrowRightIcon />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length < MAX_IMAGES_PER_PROJECT && (
                  <label
                    htmlFor="pf-image-input"
                    onDragEnter={e => { e.preventDefault(); setIsDraggingPhoto(true) }}
                    onDragOver={e => e.preventDefault()}
                    onDragLeave={e => { e.preventDefault(); setIsDraggingPhoto(false) }}
                    onDrop={handlePhotoDrop}
                    className="w-[84px] h-[84px] rounded-[10px] border border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer text-[var(--hz-primary)] transition-colors"
                    style={{ borderColor: isDraggingPhoto ? 'var(--hz-primary)' : '#CAC7C6', backgroundColor: isDraggingPhoto ? '#F9F5FF' : 'transparent' }}
                  >
                    {uploading ? (
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--hz-primary)" strokeWidth="2" strokeOpacity="0.25" /><path d="M8 2a6 6 0 0 1 6 6" stroke="var(--hz-primary)" strokeWidth="2" strokeLinecap="round" /></svg>
                    ) : (
                      <>
                        <UploadIcon />
                        <span className="text-[10px] font-semibold text-center leading-tight px-1" style={{ fontFamily: FONT_BODY }}>Drop or add photo</span>
                      </>
                    )}
                  </label>
                )}
                <input ref={fileInputRef} id="pf-image-input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFilesSelected} className="sr-only" />
              </div>
              <p className="text-[11px] text-[var(--hz-ink-subtle)] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Up to {MAX_IMAGES_PER_PROJECT} images · JPG, PNG or WEBP · up to 10 MB each · drag & drop or browse. The first image is the cover by default.</p>
              {imageError && <FieldError id="pf-image-error" message={imageError} />}
            </div>

            <div>
              <FieldLabel>Portfolio visibility</FieldLabel>
              <div role="radiogroup" aria-label="Portfolio visibility" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VISIBILITY_OPTIONS.map(v => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={visibility === v}
                    onClick={() => setVisibility(v)}
                    className="relative text-left flex flex-col gap-0.5 rounded-[10px] p-3 border transition-all cursor-pointer"
                    style={{ backgroundColor: visibility === v ? '#F9F5FF' : 'var(--hz-surface)', borderColor: visibility === v ? 'var(--hz-primary)' : '#CAC7C6', borderWidth: visibility === v ? 2 : 1 }}
                  >
                    <span className="text-[13px] font-semibold" style={{ fontFamily: FONT_HEAD, color: visibility === v ? 'var(--hz-primary)' : 'var(--hz-black)' }}>{VISIBILITY_LABELS[v]}</span>
                    <span className="text-[11.5px] text-[var(--hz-ink-muted)]" style={{ fontFamily: FONT_BODY }}>{VISIBILITY_DESCRIPTIONS[v]}</span>
                    {visibility === v && <span className="absolute top-2.5 right-2.5 w-[15px] h-[15px] rounded-full bg-[var(--hz-primary)] flex items-center justify-center" aria-hidden="true"><CheckIcon size={8} /></span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {saveError && (
            <p className="text-[12.5px] text-[var(--hz-danger)] m-0" style={{ fontFamily: FONT_BODY }}>
              Couldn't save this portfolio project. <button type="button" onClick={handleSave} className="underline cursor-pointer border-0 bg-transparent p-0 text-[var(--hz-danger)]">Try again</button>
            </p>
          )}

          <div className="flex items-center gap-3 pb-4">
            <button type="button" onClick={handleSave} className={selectClass} style={{ backgroundColor: 'var(--hz-primary)', color: 'white', fontFamily: FONT_BODY, cursor: 'pointer' }}>
              Add Portfolio Project
            </button>
            <button type="button" onClick={goToPortfolio} className="text-[13px] font-medium text-[var(--hz-ink-muted)] hover:text-[var(--hz-ink)] cursor-pointer border-0 bg-transparent p-0" style={{ fontFamily: FONT_BODY }}>
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
