// ─── Portfolio Setup — typed data model + service ───────────────────────────
// UI demonstration data only — there is no backend yet. This module is the
// seam a real "portfolio" API and a real image-storage service replace; the
// screen must only ever read/write this data through the functions here,
// never inline in a component.
//
// IMPORTANT PRODUCT RULE — a portfolio project is a showcase record, NOT a
// construction project workspace. "Mantoor Residency · Completed 2025" is a
// portfolio entry; "Mantoor Residency Construction" (a real project with a
// BOQ, estimate, plan, etc.) is a separate entity this module never touches.
// A portfolio project may optionally link to a workspace later — it never
// creates one.

export type ProjectType = 'residential' | 'villa' | 'apartment' | 'commercial' | 'renovation' | 'other'
export type ProjectStatus = 'completed' | 'ongoing' | 'upcoming'
export type CompanyRole = 'developer' | 'general-contractor' | 'builder' | 'project-manager' | 'architect' | 'interior-designer' | 'consultant' | 'other'
export type PortfolioVisibility = 'public' | 'private'
export type AreaUnit = 'sqft' | 'sqm'

export interface PortfolioImage {
  id: string
  url: string
  fileName: string
  fileSize: number
}

export interface PortfolioProject {
  id: string
  organizationId: string
  name: string
  projectType: ProjectType
  status: ProjectStatus
  location: string
  year: number | null
  area: number | null
  areaUnit: AreaUnit
  unitCount: number | null
  description: string
  companyRole: CompanyRole
  /** Optional tag into the organization's own already-selected service
   *  categories (Screen 024's real ServiceCategoryType slugs) — never a
   *  second, invented portfolio taxonomy. Screens supply the option list
   *  from the org's actual selections; this module stores whatever slug
   *  it's given, or null when the professional didn't tag one. */
  relatedServiceCategory: string | null
  coverImageId: string | null
  images: PortfolioImage[]
  visibility: PortfolioVisibility
  createdAt: string
  updatedAt: string
}

// ─── Catalogues ────────────────────────────────────────────────────────────

export const PROJECT_TYPE_OPTIONS: ProjectType[] = ['residential', 'villa', 'apartment', 'commercial', 'renovation', 'other']
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  residential: 'Residential',
  villa: 'Villa',
  apartment: 'Apartment',
  commercial: 'Commercial',
  renovation: 'Renovation',
  other: 'Other',
}

export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ['completed', 'ongoing', 'upcoming']
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: 'Completed',
  ongoing: 'Ongoing',
  upcoming: 'Upcoming',
}

export const COMPANY_ROLE_OPTIONS: CompanyRole[] = ['developer', 'general-contractor', 'builder', 'project-manager', 'architect', 'interior-designer', 'consultant', 'other']
export const COMPANY_ROLE_LABELS: Record<CompanyRole, string> = {
  developer: 'Developer',
  'general-contractor': 'General Contractor',
  builder: 'Builder',
  'project-manager': 'Project Manager',
  architect: 'Architect',
  'interior-designer': 'Interior Designer',
  consultant: 'Consultant',
  other: 'Other',
}

export const VISIBILITY_OPTIONS: PortfolioVisibility[] = ['public', 'private']
export const VISIBILITY_LABELS: Record<PortfolioVisibility, string> = { public: 'Public', private: 'Private' }
export const VISIBILITY_DESCRIPTIONS: Record<PortfolioVisibility, string> = {
  public: 'Visible on your organization profile.',
  private: 'Visible only to your organization.',
}

export const DESCRIPTION_MAX = 500
export const MAX_IMAGES_PER_PROJECT = 6

// ─── Validation ──────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
export const YEAR_MIN = 1990
export const YEAR_MAX = CURRENT_YEAR + 3

export interface PortfolioFormValues {
  name: string
  projectType: ProjectType | null
  status: ProjectStatus | null
  location: string
  year: string
  area: string
  areaUnit: AreaUnit
  unitCount: string
  description: string
  companyRole: CompanyRole | null
  relatedServiceCategory: string | null
}

export interface PortfolioFormErrors {
  name?: string
  projectType?: string
  status?: string
  location?: string
  year?: string
  area?: string
  companyRole?: string
  description?: string
}

export function validatePortfolioForm(values: PortfolioFormValues, existingNames: string[]): PortfolioFormErrors {
  const errors: PortfolioFormErrors = {}
  const name = values.name.trim()
  if (name.length === 0) errors.name = 'Project name is required.'
  else if (existingNames.some(n => n.toLowerCase() === name.toLowerCase())) errors.name = 'You already have a portfolio project with this name.'

  if (values.projectType === null) errors.projectType = 'Please choose a project type.'
  if (values.status === null) errors.status = 'Please choose a project status.'
  if (values.location.trim().length === 0) errors.location = 'Location is required.'

  // Year completed is optional — only validated when the professional
  // actually enters one.
  if (values.year.trim()) {
    const year = Number(values.year)
    if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) errors.year = `Please enter a year between ${YEAR_MIN} and ${YEAR_MAX}.`
  }

  if (values.area.trim().length > 0) {
    const area = Number(values.area)
    if (!Number.isFinite(area) || area <= 0) errors.area = 'Area must be greater than zero.'
  }

  if (values.companyRole === null) errors.companyRole = 'Please choose your company’s role.'
  if (values.description.length > DESCRIPTION_MAX) errors.description = `Description must be under ${DESCRIPTION_MAX} characters.`

  return errors
}

export function isPortfolioFormValid(values: PortfolioFormValues, existingNames: string[]): boolean {
  return Object.keys(validatePortfolioForm(values, existingNames)).length === 0
}

// ─── Image service ─────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE_MB = 10
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface ImageValidationResult {
  valid: boolean
  error?: string
}

export function validatePortfolioImageFile(file: File): ImageValidationResult {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) return { valid: false, error: 'Please choose a JPG, PNG or WEBP image.' }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return { valid: false, error: `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.` }
  return { valid: true }
}

let imageCounter = 0
function nextImageId(): string {
  imageCounter += 1
  return `portfolio-image-${Date.now()}-${imageCounter}`
}

export interface UploadedImageResult {
  imageId: string
  url: string
  metadata: { fileName: string; fileSize: number; fileType: string }
}

/** The image upload service — screens must never read file bytes inline;
 *  this is the sole seam a real storage upload replaces. Never exposes the
 *  storage implementation to the UI beyond a usable preview URL. */
export function uploadPortfolioImage(file: File): Promise<UploadedImageResult> {
  return new Promise((resolve, reject) => {
    const validation = validatePortfolioImageFile(file)
    if (!validation.valid) {
      reject(new Error(validation.error));
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        imageId: nextImageId(),
        url: typeof reader.result === 'string' ? reader.result : '',
        metadata: { fileName: file.name, fileSize: file.size, fileType: file.type },
      })
    }
    reader.onerror = () => reject(new Error('Could not read the selected image.'))
    reader.readAsDataURL(file)
  })
}

// ─── Portfolio service ─────────────────────────────────────────────────────
// In-memory demo store — the seam a real backend replaces.

let projectCounter = 0
function nextProjectId(): string {
  projectCounter += 1
  return `portfolio-project-${Date.now()}-${projectCounter}`
}

const allProjects: PortfolioProject[] = []

export interface PortfolioProjectInput {
  organizationId: string
  name: string
  projectType: ProjectType
  status: ProjectStatus
  location: string
  year: number | null
  area: number | null
  areaUnit: AreaUnit
  unitCount: number | null
  description: string
  companyRole: CompanyRole
  relatedServiceCategory: string | null
  images: PortfolioImage[]
  coverImageId: string | null
  visibility: PortfolioVisibility
}

export function getPortfolioProjects(organizationId: string): PortfolioProject[] {
  return allProjects.filter(p => p.organizationId === organizationId)
}

/** Assembles and stores a new portfolio project — the sole seam a real
 *  "create portfolio project" API call replaces. */
export function addPortfolioProject(data: PortfolioProjectInput): PortfolioProject {
  const now = new Date().toISOString()
  const project: PortfolioProject = {
    id: nextProjectId(),
    organizationId: data.organizationId,
    name: data.name.trim(),
    projectType: data.projectType,
    status: data.status,
    location: data.location.trim(),
    year: data.year,
    area: data.area,
    areaUnit: data.areaUnit,
    unitCount: data.unitCount,
    description: data.description.trim(),
    companyRole: data.companyRole,
    relatedServiceCategory: data.relatedServiceCategory,
    coverImageId: data.coverImageId ?? data.images[0]?.id ?? null,
    images: data.images,
    visibility: data.visibility,
    createdAt: now,
    updatedAt: now,
  }
  allProjects.push(project)
  return project
}

export function updatePortfolioProject(id: string, data: PortfolioProjectInput): PortfolioProject | undefined {
  const index = allProjects.findIndex(p => p.id === id)
  if (index === -1) return undefined
  const now = new Date().toISOString()
  const updated: PortfolioProject = {
    ...allProjects[index],
    name: data.name.trim(),
    projectType: data.projectType,
    status: data.status,
    location: data.location.trim(),
    year: data.year,
    area: data.area,
    areaUnit: data.areaUnit,
    unitCount: data.unitCount,
    description: data.description.trim(),
    companyRole: data.companyRole,
    relatedServiceCategory: data.relatedServiceCategory,
    coverImageId: data.coverImageId ?? data.images[0]?.id ?? null,
    images: data.images,
    visibility: data.visibility,
    updatedAt: now,
  }
  allProjects[index] = updated
  return updated
}

export function deletePortfolioProject(id: string): void {
  const index = allProjects.findIndex(p => p.id === id)
  if (index !== -1) allProjects.splice(index, 1)
}

export function setPortfolioCover(projectId: string, imageId: string): PortfolioProject | undefined {
  const project = allProjects.find(p => p.id === projectId)
  if (!project) return undefined
  project.coverImageId = imageId
  project.updatedAt = new Date().toISOString()
  return project
}

// ─── Summary ────────────────────────────────────────────────────────────

export interface PortfolioSummary {
  totalProjects: number
  completed: number
  ongoing: number
  upcoming: number
  totalArea: number
  areaUnit: AreaUnit
  yearsActiveLabel: string | null
}

/** Computes summary figures purely from the given projects — never invents
 *  values when a project omits area or year data. */
export function calculatePortfolioSummary(projects: PortfolioProject[]): PortfolioSummary {
  const completed = projects.filter(p => p.status === 'completed').length
  const ongoing = projects.filter(p => p.status === 'ongoing').length
  const upcoming = projects.filter(p => p.status === 'upcoming').length
  const totalArea = projects.reduce((sum, p) => sum + (p.area ?? 0), 0)
  const years = projects.map(p => p.year).filter((y): y is number => y !== null && Number.isFinite(y))
  const yearsActiveLabel = years.length === 0 ? null : years.length === 1 ? String(years[0]) : `${Math.min(...years)}–${Math.max(...years)}`

  return {
    totalProjects: projects.length,
    completed,
    ongoing,
    upcoming,
    totalArea,
    areaUnit: projects[0]?.areaUnit ?? 'sqft',
    yearsActiveLabel,
  }
}

export function portfolioStatusLabel(count: number): string {
  if (count === 0) return 'Getting started'
  if (count < 3) return 'Building it up'
  return 'Great portfolio'
}
