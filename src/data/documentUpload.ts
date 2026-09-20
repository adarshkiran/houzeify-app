// ─── Plan Upload — typed data model + service ───────────────────────────────
// UI demonstration data only — there's no backend or real CAD/AI processing
// yet. This module is the seam a real storage/upload API replaces; screens
// must only ever create or validate documents through the functions here,
// never embed upload/validation logic directly in UI components.

export type DocumentType = 'floor-plan' | 'structural-plan' | 'elevation' | 'section' | 'electrical' | 'plumbing' | 'other'
export type DocumentStatus = 'uploading' | 'uploaded' | 'validating' | 'ready' | 'analyzing' | 'completed' | 'error'

export interface ProjectDocument {
  id: string
  projectId: string
  name: string
  type: DocumentType
  mimeType: string
  size: number
  pageCount?: number
  status: DocumentStatus
  uploadedAt: string
  previewUrl?: string
  analysisStatus?: 'pending' | 'in-progress' | 'complete'
  errorMessage?: string
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'floor-plan': 'Floor Plan',
  'structural-plan': 'Structural Plan',
  elevation: 'Elevation',
  section: 'Section',
  electrical: 'Electrical Plan',
  plumbing: 'Plumbing Plan',
  other: 'Other',
}

export const DOCUMENT_TYPE_OPTIONS: DocumentType[] = [
  'floor-plan', 'structural-plan', 'elevation', 'section', 'electrical', 'plumbing', 'other',
]

export const SUPPORTED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'dwg', 'dxf']
export const MAX_FILE_SIZE_MB = 25
export const MAX_FILES = 5
const MIN_IMAGE_DIMENSION_PX = 500 // below this, flag as possibly too low-resolution to analyse

export interface FileValidationResult {
  valid: boolean
  error?: string
}

function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

/** The validation service — screens read validity through this, never inline-check file.type/size. */
export function validateFile(file: File): FileValidationResult {
  const ext = getExtension(file.name)
  if (!ext || !SUPPORTED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: "This file type isn't supported. Upload PDF, JPG, PNG, DWG or DXF." }
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: 'This file is larger than 25 MB.' }
  }
  if (file.size === 0) {
    return { valid: false, error: "We couldn't read this file. Try uploading another copy." }
  }
  return { valid: true }
}

/** Best-effort, resolution-only check for raster images — never blocks upload, just flags a heads-up. */
export function checkImageResolution(file: File): Promise<string | null> {
  const ext = getExtension(file.name)
  if (!['png', 'jpg', 'jpeg'].includes(ext)) return Promise.resolve(null)
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width < MIN_IMAGE_DIMENSION_PX || img.height < MIN_IMAGE_DIMENSION_PX) {
        resolve('This image may be difficult to analyse. Upload a higher-resolution plan if possible.')
      } else {
        resolve(null)
      }
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

export function inferDocumentType(fileName: string): DocumentType {
  const lower = fileName.toLowerCase()
  if (lower.includes('structural') || lower.includes('struct')) return 'structural-plan'
  if (lower.includes('elevation')) return 'elevation'
  if (lower.includes('section')) return 'section'
  if (lower.includes('electrical')) return 'electrical'
  if (lower.includes('plumb')) return 'plumbing'
  if (lower.includes('floor') || lower.includes('plan')) return 'floor-plan'
  return 'floor-plan'
}

export function isPreviewableImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function isPdf(mimeType: string, name: string): boolean {
  return mimeType === 'application/pdf' || getExtension(name) === 'pdf'
}

export function isCad(name: string): boolean {
  const ext = getExtension(name)
  return ext === 'dwg' || ext === 'dxf'
}

/** Mock page-count estimate for PDFs only — a real backend would read the actual page count. */
function estimatePageCount(file: File): number | undefined {
  if (!isPdf(file.type, file.name)) return undefined
  const mb = file.size / (1024 * 1024)
  return Math.max(1, Math.min(12, Math.round(mb / 1.6) || 1))
}

let counter = 0
function nextId(): string {
  counter += 1
  return `doc-${Date.now()}-${counter}`
}

/** The upload service — creates the initial document record. Progress/status transitions after
 *  this are simulated in the UI layer (no real network), but the record shape itself is owned here
 *  so it stays swappable for a real storage/API implementation later. */
export function createProjectDocument(file: File, projectId: string): ProjectDocument {
  return {
    id: nextId(),
    projectId,
    name: file.name,
    type: inferDocumentType(file.name),
    mimeType: file.type || (isCad(file.name) ? 'application/octet-stream' : 'application/octet-stream'),
    size: file.size,
    pageCount: estimatePageCount(file),
    status: 'uploading',
    uploadedAt: new Date().toISOString(),
    previewUrl: isPreviewableImage(file.type) ? URL.createObjectURL(file) : undefined,
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
