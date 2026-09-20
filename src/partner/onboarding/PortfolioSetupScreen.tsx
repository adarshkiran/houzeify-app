import { useEffect, useRef, useState } from 'react'
import HIcon from '@/shared/components/HIcon'
import logoHorizontal from '@/imports/Logo/Houzeify HLogo.svg'
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
  addPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
  getPortfolioProjects,
  calculatePortfolioSummary,
  portfolioStatusLabel,
  type ProjectType,
  type ProjectStatus,
  type CompanyRole,
  type PortfolioVisibility,
  type AreaUnit,
  type PortfolioImage,
  type PortfolioProject,
  type PortfolioFormValues,
} from '@/data/portfolio'
import { SERVICE_CATEGORY_LABELS, type ServiceCategoryType } from '@/data/serviceCategories'
import { PROFESSIONAL_TYPE_CONTENT, type ProfessionalType } from '@/data/professionalType'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const ORG_ID_FALLBACK = 'org-demo-001'


// ─── Icons ──────────────────────────────────────────────────────────────

const CheckIcon = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="2.5" x2="8" y2="13.5" /><line x1="2.5" y1="8" x2="13.5" y2="8" /></svg>
)
const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 3L11 11M11 3L3 11" /></svg>
)
const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.1 0L4 19" /></svg>
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
const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7.5" width="10" height="6.5" rx="1.4" /><path d="M5 7.5V5.2a3 3 0 0 1 6 0V7.5" /></svg>
)

// ─── Shared bits ────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }}>{children}</label>
      {optional && <span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Optional</span>}
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
      className={['w-full h-[44px] px-3.5 rounded-[10px] border bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors', error ? 'border-[#D97706]' : 'border-[#E3DDD7] focus:border-[#722ED1]'].join(' ')}
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
            backgroundColor: value === opt ? '#F3EAFF' : '#FFFFFF',
            borderColor: value === opt ? '#722ED1' : '#CAC7C6',
            color: value === opt ? '#722ED1' : '#1E1E1E',
          }}
        >
          {value === opt && <span className="w-3 h-3 rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={7} /></span>}
          {labels[opt]}
        </button>
      ))}
    </div>
  )
}

const EMPTY_DRAFT: PortfolioFormValues = {
  name: '', projectType: null, status: null, location: '', year: '', area: '', areaUnit: 'sqft', unitCount: '', description: '', companyRole: null, relatedServiceCategory: null,
}

// Display label for a related-service slug — falls back to the raw slug for
// any value outside the known catalogue rather than hiding it.
function serviceCategoryLabel(slug: string): string {
  return SERVICE_CATEGORY_LABELS[slug as ServiceCategoryType] ?? slug
}

function statusDotColor(status: ProjectStatus): string {
  if (status === 'completed') return '#16A34A'
  if (status === 'ongoing') return '#D97706'
  return '#A1A1A1'
}

// ─── Project card ──────────────────────────────────────────────────────

function ProjectCard({ project, onEdit, onRemove }: { project: PortfolioProject; onEdit: () => void; onRemove: () => void }) {
  const cover = project.images.find(i => i.id === project.coverImageId) ?? project.images[0] ?? null
  return (
    <div className="flex flex-col rounded-[16px] bg-white border border-[#E3DDD7] overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="h-[130px] flex items-center justify-center shrink-0" style={{ backgroundColor: '#F4F0EC' }}>
        {cover ? (
          <img src={cover.url} alt={`${project.name} cover`} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[#CAC7C6]"><ImageIcon /></span>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[14px] font-semibold text-[#242326] leading-tight" style={{ fontFamily: FONT_HEAD }}>{project.name}</span>
          {project.visibility === 'private' && (
            <span className="flex items-center gap-1 h-[20px] px-1.5 rounded-full text-[10px] font-semibold shrink-0" style={{ fontFamily: FONT_BODY, backgroundColor: '#F4F0EC', color: '#68636D' }}>
              <LockIcon /> Private
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap text-[12px]" style={{ fontFamily: FONT_BODY }}>
          <span className="text-[#68636D]">{PROJECT_TYPE_LABELS[project.projectType]}</span>
          <span className="text-[#CAC7C6]">·</span>
          <span className="flex items-center gap-1 font-semibold" style={{ color: statusDotColor(project.status) === '#16A34A' ? '#16A34A' : statusDotColor(project.status) === '#D97706' ? '#D97706' : '#808080' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusDotColor(project.status) }} />
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
          {project.year !== null && (
            <>
              <span className="text-[#CAC7C6]">·</span>
              <span className="text-[#68636D]">{project.year}</span>
            </>
          )}
        </div>
        <div className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>
          📍 {project.location}{project.area ? ` · ${project.area.toLocaleString('en-IN')} ${project.areaUnit === 'sqft' ? 'sq ft' : 'sq m'}` : ''}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] text-[#722ED1] font-semibold" style={{ fontFamily: FONT_BODY }}>{COMPANY_ROLE_LABELS[project.companyRole]}</span>
          {project.relatedServiceCategory && (
            <>
              <span className="text-[#CAC7C6] text-[12px]">·</span>
              <span className="text-[12px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{serviceCategoryLabel(project.relatedServiceCategory)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2 mt-1 border-t border-[#E3DDD7]">
          <button type="button" onClick={onEdit} className="h-8 px-3 rounded-[8px] text-[12px] font-semibold cursor-pointer border border-[#E3DDD7] bg-white text-[#242326] hover:border-[#722ED1] transition-colors" style={{ fontFamily: FONT_BODY }}>Edit</button>
          <button type="button" onClick={onRemove} className="h-8 px-3 rounded-[8px] text-[12px] font-semibold cursor-pointer border border-[#E3DDD7] bg-white text-[#DC2626] hover:border-[#DC2626] transition-colors" style={{ fontFamily: FONT_BODY }}>Remove</button>
        </div>
      </div>
    </div>
  )
}

// ─── Project form modal ────────────────────────────────────────────────

function ProjectFormModal({
  mode, initialValues, initialImages, initialCoverId, initialVisibility, existingNames, availableServiceCategories, onCancel, onSave,
}: {
  mode: 'add' | 'edit'
  initialValues: PortfolioFormValues
  initialImages: PortfolioImage[]
  initialCoverId: string | null
  initialVisibility: PortfolioVisibility
  existingNames: string[]
  /** The organization's own already-selected service categories (from
   *  Screen 024) — the only options offered here, never the full catalogue,
   *  so tagging a project never implies a service the org hasn't set up. */
  availableServiceCategories: ServiceCategoryType[]
  onCancel: () => void
  onSave: (values: PortfolioFormValues, images: PortfolioImage[], coverId: string | null, visibility: PortfolioVisibility) => void
}) {
  const [values, setValues] = useState<PortfolioFormValues>(initialValues)
  const [images, setImages] = useState<PortfolioImage[]>(initialImages)
  const [coverId, setCoverId] = useState<string | null>(initialCoverId)
  const [visibility, setVisibility] = useState<PortfolioVisibility>(initialVisibility)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [attemptedSave, setAttemptedSave] = useState(false)
  const [imageError, setImageError] = useState<string | undefined>(undefined)
  const [uploading, setUploading] = useState(false)
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const errors = validatePortfolioForm(values, existingNames)
  const showError = (field: keyof typeof errors) => (touched[field] || attemptedSave) && !!errors[field]
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

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
    if (!isPortfolioFormValid(values, existingNames)) return
    onSave(values, images, coverId, visibility)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="fixed inset-x-3 top-3 bottom-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-6 sm:bottom-6 sm:w-[560px] bg-white rounded-[18px] z-50 flex flex-col overflow-hidden"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3DDD7] shrink-0">
          <h2 id="project-form-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>
            {mode === 'edit' ? 'Edit portfolio project' : 'Add portfolio project'}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E3DDD7] bg-white text-[#9A949D] hover:text-[#68636D] cursor-pointer">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <div>
            <FieldLabel>Project name</FieldLabel>
            <TextInput id="pf-name" value={values.name} onChange={v => setValues(p => ({ ...p, name: v }))} placeholder="e.g. Mantoor Residency" error={showError('name')} describedBy={showError('name') ? 'pf-name-error' : undefined} />
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
                <div role="radiogroup" aria-label="Area unit" className="flex items-center p-1 rounded-[8px] shrink-0" style={{ backgroundColor: '#F4F0EC' }}>
                  {(['sqft', 'sqm'] as AreaUnit[]).map(u => (
                    <button key={u} type="button" role="radio" aria-checked={values.areaUnit === u} onClick={() => setValues(p => ({ ...p, areaUnit: u }))}
                      className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold cursor-pointer border-0 transition-all"
                      style={{ fontFamily: FONT_BODY, backgroundColor: values.areaUnit === u ? '#FFFFFF' : 'transparent', color: values.areaUnit === u ? '#722ED1' : '#808080' }}
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
                      backgroundColor: values.relatedServiceCategory === cat ? '#F3EAFF' : '#FFFFFF',
                      borderColor: values.relatedServiceCategory === cat ? '#722ED1' : '#CAC7C6',
                      color: values.relatedServiceCategory === cat ? '#722ED1' : '#1E1E1E',
                    }}
                  >
                    {values.relatedServiceCategory === cat && <span className="w-3 h-3 rounded-full bg-[#722ED1] flex items-center justify-center shrink-0" aria-hidden="true"><CheckIcon size={7} /></span>}
                    {serviceCategoryLabel(cat)}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#9A949D] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Which of your services does this project demonstrate? Tap again to clear.</p>
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
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3DDD7] focus:border-[#722ED1] bg-white text-[13.5px] text-[#242326] placeholder:text-[#CAC7C6] outline-none transition-colors resize-none"
              style={{ fontFamily: FONT_BODY }}
            />
            <div className="flex justify-end mt-1"><span className="text-[11px] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{values.description.length}/{DESCRIPTION_MAX}</span></div>
          </div>

          <div>
            <FieldLabel optional>Project images</FieldLabel>
            <div className="flex flex-wrap gap-2.5">
              {images.map((img, i) => (
                <div key={img.id} className="relative w-[84px] h-[84px] rounded-[10px] overflow-hidden border" style={{ borderColor: coverId === img.id ? '#722ED1' : '#CAC7C6', borderWidth: coverId === img.id ? 2 : 1 }}>
                  <img src={img.url} alt={`Project photo ${i + 1}`} className="w-full h-full object-cover" />
                  {coverId === img.id && (
                    <span className="absolute top-1 left-1 flex items-center gap-0.5 h-[16px] px-1 rounded-full bg-[#722ED1] text-white" style={{ fontFamily: FONT_MONO, fontSize: '9px' }}>
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
                  className="w-[84px] h-[84px] rounded-[10px] border border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer text-[#722ED1] transition-colors"
                  style={{ borderColor: isDraggingPhoto ? '#722ED1' : '#CAC7C6', backgroundColor: isDraggingPhoto ? '#F9F5FF' : 'transparent' }}
                >
                  {uploading ? (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#722ED1" strokeWidth="2" strokeOpacity="0.25" /><path d="M8 2a6 6 0 0 1 6 6" stroke="#722ED1" strokeWidth="2" strokeLinecap="round" /></svg>
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
            <p className="text-[11px] text-[#9A949D] mt-1.5 m-0" style={{ fontFamily: FONT_BODY }}>Up to {MAX_IMAGES_PER_PROJECT} images · JPG, PNG or WEBP · up to 10 MB each · drag & drop or browse. The first image is the cover by default.</p>
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
                  style={{ backgroundColor: visibility === v ? '#F9F5FF' : '#FFFFFF', borderColor: visibility === v ? '#722ED1' : '#CAC7C6', borderWidth: visibility === v ? 2 : 1 }}
                >
                  <span className="text-[13px] font-semibold" style={{ fontFamily: FONT_HEAD, color: visibility === v ? '#722ED1' : '#1E1E1E' }}>{VISIBILITY_LABELS[v]}</span>
                  <span className="text-[11.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{VISIBILITY_DESCRIPTIONS[v]}</span>
                  {visibility === v && <span className="absolute top-2.5 right-2.5 w-[15px] h-[15px] rounded-full bg-[#722ED1] flex items-center justify-center" aria-hidden="true"><CheckIcon size={8} /></span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-[#E3DDD7] shrink-0">
          <button type="button" onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button type="button" onClick={handleSave} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 bg-[#722ED1] hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>Save project</button>
        </div>
      </div>
    </>
  )
}

function DeleteProjectModal({ projectName, onCancel, onConfirm }: { projectName: string; onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="delete-project-title" aria-describedby="delete-project-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="delete-project-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Remove portfolio project?</h2>
        <p id="delete-project-desc" className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>
          This will remove &ldquo;{projectName}&rdquo; from your public company portfolio. It will not delete any project workspace.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Cancel</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 bg-[#DC2626] hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>Remove project</button>
        </div>
      </div>
    </>
  )
}

function SkipPortfolioModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-30 z-40" aria-hidden="true" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="skip-portfolio-title" aria-describedby="skip-portfolio-desc"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] bg-white rounded-[16px] z-50 p-6 flex flex-col gap-4"
        style={{ boxShadow: '0 20px 60px rgba(36,35,38,0.25)' }}
      >
        <h2 id="skip-portfolio-title" className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Skip portfolio setup?</h2>
        <p id="skip-portfolio-desc" className="text-[13px] text-[#68636D] leading-[1.6] m-0" style={{ fontFamily: FONT_BODY }}>You can add projects later from your organization profile.</p>
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
          <button onClick={onCancel} className="h-10 px-4 rounded-[10px] border border-[#E3DDD7] text-[#242326] text-[13px] font-medium cursor-pointer bg-transparent hover:bg-[#F4F0EC] transition-colors" style={{ fontFamily: FONT_BODY }}>Continue adding projects</button>
          <button ref={confirmRef} onClick={onConfirm} className="h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold cursor-pointer border-0 bg-[#722ED1] hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>Skip</button>
        </div>
      </div>
    </>
  )
}

type SubmitStage = 'idle' | 'submitting'

// Read-only "already answered" context chip — mirrors the same pattern
// established on Screens 020–025, reused here rather than a new component.
function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] px-4 py-3" style={{ backgroundColor: '#F4F0EC' }}>
      <span className="text-[10px] tracking-[0.08em] uppercase text-[#68636D]" style={{ fontFamily: FONT_MONO }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}

function HozieAssist({ onAskHozie }: { onAskHozie: () => void }) {
  return (
    <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5 flex-wrap" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      <div className="shrink-0"><HIcon size={32} /></div>
      <p className="text-[13px] text-[#68636D] leading-[1.55] m-0 flex-1 min-w-[220px]" style={{ fontFamily: FONT_BODY }}>
        <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>Need help writing a project description?</span>
      </p>
      <button
        onClick={onAskHozie}
        className="h-9 px-3.5 rounded-[9px] border border-[#E3DDD7] text-[#722ED1] text-[12.5px] font-semibold cursor-pointer hover:bg-[#F3EAFF] hover:border-[#722ED1] transition-all bg-white shrink-0"
        style={{ fontFamily: FONT_BODY }}
      >
        Ask Hozie →
      </button>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────

export default function PortfolioSetupScreen({
  organizationId = ORG_ID_FALLBACK,
  companyName,
  companyLocation,
  accountType,
  professionalType,
  professionalTypeOther,
  serviceCategories,
  primaryService,
  serviceLocations,
  primaryLocation,
  coverageType,
  onNavigate,
}: {
  organizationId?: string
  companyName?: string
  companyLocation?: string
  accountType?: string
  professionalType?: string
  professionalTypeOther?: string
  serviceCategories?: string
  primaryService?: string
  serviceLocations?: string
  primaryLocation?: string
  coverageType?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const isProfessionalContext = Boolean(professionalType)
  const isIndividual = accountType === 'individual'
  const professionalTypeLabel = professionalType === 'other'
    ? (professionalTypeOther || 'Other')
    : PROFESSIONAL_TYPE_CONTENT[professionalType as ProfessionalType]?.title ?? 'Not set'

  const resolvedCompanyName = companyName || 'Mantoor Developers'
  const services = (serviceCategories ? serviceCategories.split(',') : []).filter(Boolean)
  const availableServiceCategories = services.filter((s): s is ServiceCategoryType => s in SERVICE_CATEGORY_LABELS)
  const locations = (serviceLocations ? serviceLocations.split(',') : []).filter(Boolean)

  const carryContext = (extra?: Record<string, string>) => ({
    ...(professionalType ? { professional_type: professionalType } : {}),
    ...(professionalTypeOther ? { professional_type_other: professionalTypeOther } : {}),
    ...(accountType ? { account_type: accountType } : {}),
    ...(companyLocation ? { location: companyLocation } : {}),
    ...(companyName ? { company_name: companyName } : {}),
    ...(serviceCategories ? { service_categories: serviceCategories } : {}),
    ...(primaryService ? { primary_service: primaryService } : {}),
    ...(serviceLocations ? { service_locations: serviceLocations } : {}),
    ...(primaryLocation ? { primary_location: primaryLocation } : {}),
    ...(coverageType ? { coverage_type: coverageType } : {}),
    ...extra,
  })

  const [projects, setProjects] = useState<PortfolioProject[]>(() => getPortfolioProjects(organizationId))
  const [modalMode, setModalMode] = useState<'closed' | 'add' | 'edit'>('closed')
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null)
  const [deletingProject, setDeletingProject] = useState<PortfolioProject | null>(null)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [stage, setStage] = useState<SubmitStage>('idle')

  const summary = calculatePortfolioSummary(projects)

  function openAddModal() {
    setEditingProject(null)
    setModalMode('add')
  }
  function openEditModal(project: PortfolioProject) {
    setEditingProject(project)
    setModalMode('edit')
  }
  function closeModal() {
    setModalMode('closed')
    setEditingProject(null)
  }

  function handleSaveProject(values: PortfolioFormValues, images: PortfolioImage[], coverId: string | null, visibility: PortfolioVisibility) {
    const input = {
      organizationId,
      name: values.name,
      projectType: values.projectType as ProjectType,
      status: values.status as ProjectStatus,
      location: values.location,
      year: values.year.trim() ? Number(values.year) : null,
      area: values.area.trim() ? Number(values.area) : null,
      areaUnit: values.areaUnit,
      unitCount: values.unitCount.trim() ? Number(values.unitCount) : null,
      description: values.description,
      companyRole: values.companyRole as CompanyRole,
      relatedServiceCategory: values.relatedServiceCategory,
      images,
      coverImageId: coverId,
      visibility,
    }
    if (modalMode === 'edit' && editingProject) {
      const updated = updatePortfolioProject(editingProject.id, input)
      if (updated) setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    } else {
      const created = addPortfolioProject(input)
      setProjects(prev => [...prev, created])
    }
    closeModal()
  }

  function confirmDelete() {
    if (!deletingProject) return
    deletePortfolioProject(deletingProject.id)
    setProjects(prev => prev.filter(p => p.id !== deletingProject.id))
    setDeletingProject(null)
  }

  function handleBack() {
    onNavigate('service-locations', carryContext({ organization_id: organizationId }))
  }

  function handleAskHozie() {
    onNavigate('ai-advisor', carryContext({
      onboarding_context: 'portfolio-setup',
      organization_id: organizationId,
    }))
  }

  function handleEditServices() {
    onNavigate('service-categories', carryContext({ organization_id: organizationId }))
  }

  function handleEditLocations() {
    onNavigate('service-locations', carryContext({ organization_id: organizationId }))
  }

  function proceed() {
    if (stage === 'submitting') return
    setStage('submitting')
    setTimeout(() => {
      onNavigate('team-setup', carryContext({
        organization_id: organizationId,
        portfolio_project_count: String(projects.length),
      }))
    }, 500)
  }

  const existingNamesFor = (excludeId?: string) => projects.filter(p => p.id !== excludeId).map(p => p.name)

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <header className="shrink-0 relative z-10">
        <div className="flex items-center justify-between h-14 lg:h-[64px] px-5 sm:px-8 lg:px-12">
          <img src={logoHorizontal} alt="Houzeify" className="h-7 w-auto" style={{ mixBlendMode: 'multiply' }} />
          {!isProfessionalContext && (
            <span className="text-[12px] tracking-[0.08em] text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Step 6 of 6</span>
          )}
        </div>
        {!isProfessionalContext && (
          <div className="h-[2px] bg-[#F4F0EC] w-full">
            <div className="h-full bg-[#722ED1] transition-all duration-500" style={{ width: '100%' }} />
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 lg:py-10 pb-28 lg:pb-10 relative z-10 w-full">
        <div className="w-full flex flex-col gap-7" style={{ maxWidth: 1100 }}>

          {/* Intro */}
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[12px] tracking-[0.12em] uppercase text-[#722ED1] font-semibold" style={{ fontFamily: FONT_MONO }}>Portfolio</span>
            <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#242326] leading-[1.08] tracking-[-0.02em] m-0" style={{ fontFamily: FONT_HEAD }}>
              Showcase your work
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#68636D] leading-[1.65] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              Add a few projects that show homeowners what you can do.
            </p>
            <p className="text-[12.5px] text-[#9A949D] leading-[1.5] m-0 max-w-[560px]" style={{ fontFamily: FONT_BODY }}>
              You can add projects now or complete your portfolio later.
            </p>
          </div>

          {/* Professional-context summary chips — never re-ask */}
          {isProfessionalContext && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SummaryChip label="Professional Type" value={professionalTypeLabel} />
              <SummaryChip label="Operating As" value={isIndividual ? 'Individual Professional' : 'Organization / Company'} />
            </div>
          )}

          {/* Hozie assist */}
          {isProfessionalContext ? (
            <HozieAssist onAskHozie={handleAskHozie} />
          ) : (
            <div className="w-full flex items-center gap-3 bg-white border border-[#E3DDD7] rounded-[16px] px-5 py-3.5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
              <div className="shrink-0"><HIcon size={32} /></div>
              <p className="text-[13px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                <span className="text-[#242326] font-semibold" style={{ fontFamily: FONT_HEAD }}>A strong portfolio helps people understand your experience.</span>{' '}
                You can add projects now or finish your portfolio later.
              </p>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

            {/* Left — status, add project, grid */}
            <div className="flex flex-col gap-5 order-1">

              {/* Portfolio status */}
              <div className="flex items-center justify-between flex-wrap gap-3 rounded-[16px] bg-white border border-[#E3DDD7] p-4" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Portfolio</span>
                  <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{projects.length} project{projects.length === 1 ? '' : 's'} added</span>
                  <span className="text-[11.5px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>Recommended: add 2–3 projects</span>
                </div>
                <span className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11.5px] font-semibold" style={{ fontFamily: FONT_BODY, backgroundColor: '#F4F0EC', color: '#68636D' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projects.length === 0 ? '#A1A1A1' : '#722ED1' }} />
                  {portfolioStatusLabel(projects.length)}
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-3 rounded-[16px] bg-white border border-dashed border-[#E3DDD7] p-8">
                  <span className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: '#F3EAFF', color: '#722ED1' }}><ImageIcon /></span>
                  <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Showcase your work</span>
                  <p className="text-[13px] text-[#68636D] leading-[1.6] m-0 max-w-[360px]" style={{ fontFamily: FONT_BODY }}>Projects you add here will appear on your professional profile.</p>
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-1 w-full sm:w-auto">
                    <button onClick={openAddModal} className="h-11 px-4 rounded-[10px] text-[13.5px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center" style={{ fontFamily: FONT_BODY }}>
                      <PlusIcon /> Add your first project
                    </button>
                    <button onClick={() => setShowSkipModal(true)} className="h-11 px-4 rounded-[10px] text-[13.5px] font-medium cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors w-full sm:w-auto" style={{ fontFamily: FONT_BODY }}>
                      Skip for now
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>Your projects</span>
                    <button onClick={openAddModal} className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer border-0 bg-[#722ED1] text-white hover:brightness-90 transition-all" style={{ fontFamily: FONT_BODY }}>
                      <PlusIcon /> Add project
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map(project => (
                      <ProjectCard key={project.id} project={project} onEdit={() => openEditModal(project)} onRemove={() => setDeletingProject(project)} />
                    ))}
                  </div>
                </>
              )}

              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-3 pt-1">
                <button
                  onClick={proceed}
                  disabled={stage === 'submitting'}
                  className="h-[52px] text-[14px] font-semibold rounded-[12px] transition-all duration-200 px-6 flex items-center justify-center gap-2 bg-[#722ED1] text-white cursor-pointer hover:brightness-90 active:scale-[0.99] disabled:opacity-70"
                  style={{ fontFamily: FONT_BODY }}
                >
                  {stage === 'submitting' ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3" /><path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                      Saving…
                    </>
                  ) : projects.length > 0 ? 'Save portfolio & continue →' : 'Continue without portfolio →'}
                </button>
                <button onClick={handleBack} disabled={stage === 'submitting'} className="h-[52px] text-[13.5px] font-medium rounded-[12px] px-5 cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] hover:border-[#A1A1A1] transition-colors disabled:opacity-60" style={{ fontFamily: FONT_BODY }}>
                  ← Back
                </button>
              </div>
            </div>

            {/* Right — portfolio summary (sticky) */}
            <div className="order-2 lg:sticky lg:top-6 flex flex-col gap-5">
              {/* Compact profile preview — reuses the same project cover/name
                  data shown in the grid; there is no standalone public
                  profile page in this codebase yet, so this stays an
                  in-screen preview rather than linking to one. */}
              <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Your Profile</span>
                <span className="text-[15px] font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{resolvedCompanyName}</span>
                {projects.length > 0 ? (
                  (() => {
                    const featured = projects[0]
                    const cover = featured.images.find(i => i.id === featured.coverImageId) ?? featured.images[0] ?? null
                    return (
                      <div className="flex items-center gap-3 pt-1 border-t border-[#E3DDD7]">
                        <div className="w-12 h-12 rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: '#F4F0EC' }}>
                          {cover ? <img src={cover.url} alt={`${featured.name} cover`} className="w-full h-full object-cover" /> : <span className="text-[#CAC7C6]"><ImageIcon /></span>}
                        </div>
                        <span className="text-[13px] font-semibold text-[#242326] truncate" style={{ fontFamily: FONT_BODY }}>{featured.name}</span>
                      </div>
                    )
                  })()
                ) : (
                  <p className="text-[12.5px] text-[#9A949D] m-0 pt-1 border-t border-[#E3DDD7]" style={{ fontFamily: FONT_BODY }}>Your portfolio will appear here once you add a project.</p>
                )}
              </div>

              {/* Service context — read-only, matches Screen 025's pattern */}
              {isProfessionalContext && (
                <div className="rounded-[14px] bg-white border border-[#E3DDD7] p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Your Services</span>
                    <button type="button" onClick={handleEditServices} className="text-[11.5px] font-semibold text-[#722ED1] cursor-pointer bg-transparent border-0 hover:underline shrink-0" style={{ fontFamily: FONT_BODY }}>Edit services</button>
                  </div>
                  {services.length === 0 ? (
                    <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No services selected yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {services.map(s => (
                        <span key={s} className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{serviceCategoryLabel(s)}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Location context — read-only, matches Screen 025's pattern */}
              {isProfessionalContext && (
                <div className="rounded-[14px] bg-white border border-[#E3DDD7] p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Service Areas</span>
                    <button type="button" onClick={handleEditLocations} className="text-[11.5px] font-semibold text-[#722ED1] cursor-pointer bg-transparent border-0 hover:underline shrink-0" style={{ fontFamily: FONT_BODY }}>Edit locations</button>
                  </div>
                  {locations.length === 0 ? (
                    <p className="text-[13px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>No service areas selected yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {locations.map(l => (
                        <span key={l} className="text-[12.5px] text-[#68636D]" style={{ fontFamily: FONT_BODY }}>{l}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {projects.length > 0 ? (
                <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-3" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Portfolio Summary</span>
                  <div className="flex flex-col divide-y divide-[#CAC7C6]">
                    <SummaryRow label="Projects" value={String(summary.totalProjects)} />
                    <SummaryRow label="Completed" value={String(summary.completed)} />
                    <SummaryRow label="Ongoing" value={String(summary.ongoing)} />
                    {summary.upcoming > 0 && <SummaryRow label="Upcoming" value={String(summary.upcoming)} />}
                    {summary.totalArea > 0 && <SummaryRow label="Total area" value={`${summary.totalArea.toLocaleString('en-IN')} ${summary.areaUnit === 'sqft' ? 'sq ft' : 'sq m'}`} />}
                    {summary.yearsActiveLabel && <SummaryRow label="Years active" value={summary.yearsActiveLabel} />}
                  </div>
                </div>
              ) : (
                <div className="rounded-[18px] bg-white border border-[#E3DDD7] p-5 flex flex-col gap-2" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                  <span className="text-[10px] tracking-[0.10em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>Portfolio Summary</span>
                  <p className="text-[12.5px] text-[#9A949D] m-0" style={{ fontFamily: FONT_BODY }}>Your summary will appear here once you add a project.</p>
                </div>
              )}

              <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-[12px] border" style={{ borderColor: 'rgba(243,234,255,0.10)', backgroundColor: '#F9F5FF' }}>
                <p className="text-[12.5px] text-[#68636D] leading-[1.55] m-0" style={{ fontFamily: FONT_BODY }}>
                  Your portfolio isn&apos;t required to finish setup — you can add projects any time from your organization profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky actions */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E3DDD7] px-5 py-3 flex items-center gap-2.5" style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button onClick={handleBack} disabled={stage === 'submitting'} className="h-[48px] px-4 rounded-[12px] text-[13px] font-medium cursor-pointer border border-[#E3DDD7] bg-white text-[#68636D] disabled:opacity-60 shrink-0" style={{ fontFamily: FONT_BODY }}>
          ← Back
        </button>
        <button onClick={proceed} disabled={stage === 'submitting'} className="flex-1 h-[48px] text-[13.5px] font-semibold rounded-[12px] transition-all duration-200 flex items-center justify-center gap-2 bg-[#722ED1] text-white cursor-pointer disabled:opacity-70" style={{ fontFamily: FONT_BODY }}>
          {stage === 'submitting' ? 'Saving…' : projects.length > 0 ? 'Save portfolio & continue →' : 'Continue without portfolio →'}
        </button>
      </div>

      {/* Footer (desktop only) */}
      <footer className="hidden lg:flex shrink-0 justify-center items-center gap-2.5 pb-5 relative z-10">
        {(['PLAN', 'BUILD', 'IMPROVE', 'CARE'] as const).map((item, i, arr) => (
          <span key={item} className="flex items-center gap-2.5">
            <span className="text-[12px] tracking-[0.08em] uppercase text-[#9A949D]" style={{ fontFamily: FONT_MONO }}>{item}</span>
            {i < arr.length - 1 && <span className="text-[12px] text-[#722ED1]" style={{ fontFamily: FONT_MONO }}>/</span>}
          </span>
        ))}
      </footer>

      {(modalMode === 'add' || modalMode === 'edit') && (
        <ProjectFormModal
          mode={modalMode === 'edit' ? 'edit' : 'add'}
          initialValues={editingProject ? {
            name: editingProject.name,
            projectType: editingProject.projectType,
            status: editingProject.status,
            location: editingProject.location,
            year: editingProject.year != null ? String(editingProject.year) : '',
            area: editingProject.area != null ? String(editingProject.area) : '',
            areaUnit: editingProject.areaUnit,
            unitCount: editingProject.unitCount != null ? String(editingProject.unitCount) : '',
            description: editingProject.description,
            companyRole: editingProject.companyRole,
            relatedServiceCategory: editingProject.relatedServiceCategory,
          } : { ...EMPTY_DRAFT, location: companyLocation || '' }}
          initialImages={editingProject?.images ?? []}
          initialCoverId={editingProject?.coverImageId ?? null}
          initialVisibility={editingProject?.visibility ?? 'public'}
          existingNames={existingNamesFor(editingProject?.id)}
          availableServiceCategories={availableServiceCategories}
          onCancel={closeModal}
          onSave={handleSaveProject}
        />
      )}

      {deletingProject && (
        <DeleteProjectModal projectName={deletingProject.name} onCancel={() => setDeletingProject(null)} onConfirm={confirmDelete} />
      )}

      {showSkipModal && (
        <SkipPortfolioModal onCancel={() => setShowSkipModal(false)} onConfirm={() => { setShowSkipModal(false); proceed() }} />
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12px] text-[#9A949D]" style={{ fontFamily: FONT_BODY }}>{label}</span>
      <span className="text-[13px] font-semibold text-[#242326] text-right" style={{ fontFamily: FONT_BODY }}>{value}</span>
    </div>
  )
}
