// ─── C15 construction evidence validation (photo + video) ───────────────────
// Single validation entry for Daily Progress evidence uploads.

import {
  MAX_CONSTRUCTION_PHOTO_BYTES,
  validateConstructionPhotoBuffer,
  type ValidatedImage,
} from './imageValidation.js'
import {
  MAX_CONSTRUCTION_VIDEO_BYTES,
  validateConstructionVideoBuffer,
  type ValidatedVideo,
} from './videoValidation.js'

export {
  MAX_CONSTRUCTION_PHOTO_BYTES,
  sanitizeOriginalFileName,
  validateConstructionPhotoBuffer,
} from './imageValidation.js'
export { MAX_CONSTRUCTION_VIDEO_BYTES, validateConstructionVideoBuffer } from './videoValidation.js'

/** Multipart must allow the larger of photo/video limits (videos). */
export const MAX_CONSTRUCTION_EVIDENCE_BYTES = Math.max(
  MAX_CONSTRUCTION_PHOTO_BYTES,
  MAX_CONSTRUCTION_VIDEO_BYTES,
)

export type ValidatedConstructionMedia = (ValidatedImage & { kind: 'photo' }) | ValidatedVideo

function looksLikeVideoClaim(mime?: string): boolean {
  return Boolean(mime && mime.startsWith('video/'))
}

function looksLikeImageClaim(mime?: string): boolean {
  return Boolean(mime && (mime.startsWith('image/') || mime === 'image/jpg'))
}

/**
 * Validate construction evidence bytes. Prefers claimed type when present;
 * otherwise tries image then video detection.
 */
export function validateConstructionEvidenceBuffer(
  buffer: Buffer,
  claimedMimeType?: string,
): ValidatedConstructionMedia {
  if (looksLikeVideoClaim(claimedMimeType)) {
    return validateConstructionVideoBuffer(buffer, claimedMimeType)
  }
  if (looksLikeImageClaim(claimedMimeType)) {
    const image = validateConstructionPhotoBuffer(buffer, claimedMimeType)
    return { ...image, kind: 'photo' }
  }
  // No useful claim — try image, then video.
  try {
    const image = validateConstructionPhotoBuffer(buffer, claimedMimeType)
    return { ...image, kind: 'photo' }
  } catch (imageErr) {
    try {
      return validateConstructionVideoBuffer(buffer, claimedMimeType)
    } catch {
      throw imageErr
    }
  }
}

export function mediaKindFromMime(mimeType: string): 'photo' | 'video' {
  return mimeType.startsWith('video/') ? 'video' : 'photo'
}
