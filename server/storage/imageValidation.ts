// ─── C15 image validation ───────────────────────────────────────────────────
// Server-side MIME, size, and magic-byte checks. Frontend validation is not
// the security boundary.

export const MAX_CONSTRUCTION_PHOTO_BYTES = 15 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type ValidatedImage = {
  mimeType: string
  extension: string
  size: number
}

export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png'
  }
  // RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }
  return null
}

export function validateConstructionPhotoBuffer(
  buffer: Buffer,
  claimedMimeType?: string,
): ValidatedImage {
  if (!buffer.length) {
    throw Object.assign(new Error('Empty file.'), { code: 'INVALID_FILE', statusCode: 400 })
  }
  if (buffer.length > MAX_CONSTRUCTION_PHOTO_BYTES) {
    throw Object.assign(new Error('Photo exceeds the 15 MB upload limit.'), {
      code: 'FILE_TOO_LARGE',
      statusCode: 400,
    })
  }
  const detected = detectImageMime(buffer)
  if (!detected || !ALLOWED_IMAGE_MIME_TYPES.has(detected)) {
    throw Object.assign(new Error('Only JPEG, PNG, and WebP construction photos are supported.'), {
      code: 'UNSUPPORTED_FILE_TYPE',
      statusCode: 400,
    })
  }
  if (claimedMimeType) {
    const normalizedClaim =
      claimedMimeType === 'image/jpg' ? 'image/jpeg' : claimedMimeType
    if (ALLOWED_IMAGE_MIME_TYPES.has(normalizedClaim) && normalizedClaim !== detected) {
      throw Object.assign(new Error('File content does not match the declared image type.'), {
        code: 'MIME_MISMATCH',
        statusCode: 400,
      })
    }
  }
  return {
    mimeType: detected,
    extension: EXT_BY_MIME[detected],
    size: buffer.length,
  }
}

export function sanitizeOriginalFileName(name: string): string {
  const base = name.replace(/[/\\]/g, '').trim() || 'photo'
  return base.slice(0, 255)
}
