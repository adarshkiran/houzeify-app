// ─── Service photo upload — validate → upload → lightweight reference ───────
// UI demonstration data only — there is no backend yet. This module is the
// sole seam a real image-storage service replaces: screens must never read
// file bytes inline, only go through uploadServicePhoto() here.
//
// The pattern mirrors portfolio.ts (validate → upload → { id, url, fileName,
// fileSize } reference) rather than storing raw image bytes on a record. It
// lived in serviceRequest.ts while the RFQ flow existed; it now stands alone
// because the customer booking flow (BookingDetailsScreen) is its only user.

export interface ServiceRequestPhoto {
  id: string
  url: string
  fileName: string
  fileSize: number
}

export const MAX_SERVICE_PHOTOS = 5
const MAX_PHOTO_SIZE_MB = 10
const SUPPORTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface PhotoValidationResult {
  valid: boolean
  error?: string
}

export function validateServicePhotoFile(file: File): PhotoValidationResult {
  if (!SUPPORTED_PHOTO_TYPES.includes(file.type)) return { valid: false, error: 'Please choose a JPG, PNG or WEBP image.' }
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) return { valid: false, error: `Image must be smaller than ${MAX_PHOTO_SIZE_MB} MB.` }
  return { valid: true }
}

let photoCounter = 0
function nextPhotoId(): string {
  photoCounter += 1
  return `service-photo-${Date.now()}-${photoCounter}`
}

export interface UploadedPhotoResult {
  photoId: string
  url: string
  metadata: { fileName: string; fileSize: number }
}

/** The photo upload service — screens must never read file bytes inline;
 *  this is the sole seam a real storage upload replaces. */
export function uploadServicePhoto(file: File): Promise<UploadedPhotoResult> {
  return new Promise((resolve, reject) => {
    const validation = validateServicePhotoFile(file)
    if (!validation.valid) {
      reject(new Error(validation.error))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        photoId: nextPhotoId(),
        url: String(reader.result),
        metadata: { fileName: file.name, fileSize: file.size },
      })
    }
    reader.onerror = () => reject(new Error('Could not read this image.'))
    reader.readAsDataURL(file)
  })
}
