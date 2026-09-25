/** S24 — Estimation House Plan / Plan Analyzer shell helpers. */

export const ESTIMATION_HOUSE_PLAN_ROUTE = 'estimation-house-plan' as const

export const HOUSE_PLAN_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'

export const HOUSE_PLAN_MAX_BYTES = 26_214_400 // 25 MB — matches document upload

const HOUSE_PLAN_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png'])
const HOUSE_PLAN_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png'])

/** Client-side gate before multipart upload. Server re-validates. */
export function isSupportedHousePlanFile(file: File): boolean {
  if (HOUSE_PLAN_MIME.has(file.type)) return true
  const lower = file.name.toLowerCase()
  for (const ext of HOUSE_PLAN_EXTENSIONS) {
    if (lower.endsWith(ext)) return true
  }
  return false
}

export function housePlanFileRejectReason(file: File): string | null {
  if (!isSupportedHousePlanFile(file)) {
    return 'House plans must be PDF, JPG, JPEG, or PNG.'
  }
  if (file.size <= 0) return 'The selected file is empty.'
  if (file.size > HOUSE_PLAN_MAX_BYTES) return 'House plans must be 25 MB or smaller.'
  return null
}

/** Always false until a real document vision / OCR service is connected. */
export function isPlanAnalysisEngineReady(): boolean {
  return false
}

export const ESTIMATION_HOUSE_PLAN_COPY = {
  eyebrow: 'Plan Analyzer',
  title: 'Upload House Plan',
  subtitle: 'Upload a floor plan so Houzeify can extract construction information.',
  body: 'Supported formats: PDF, JPG, JPEG, PNG. After upload, start analysis to create a saved plan analysis you can review and edit.',
  analyzerUnavailable:
    'Plan uploaded successfully. Analysis will be available when the document analysis service is connected.',
  futureHandoff:
    'Use plan values in the Material Calculator when ready. Estimate Builder pricing remains a later step.',
} as const
