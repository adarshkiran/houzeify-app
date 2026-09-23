// ─── C15C construction video validation ─────────────────────────────────────
// Extends C15A magic-byte style checks for short site videos. Frontend
// validation is not the security boundary.

export const MAX_CONSTRUCTION_VIDEO_BYTES = 100 * 1024 * 1024

export const ALLOWED_VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

const EXT_BY_MIME: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
}

export type ValidatedVideo = {
  mimeType: string
  extension: string
  size: number
  kind: 'video'
}

/** ISO BMFF / MP4 / QuickTime — `ftyp` box at offset 4. */
function detectIsoBmffMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  if (buffer.toString('ascii', 4, 8) !== 'ftyp') return null
  const brand = buffer.toString('ascii', 8, 12)
  // QuickTime major brand
  if (brand === 'qt  ') return 'video/quicktime'
  // Common MP4 / ISO brands
  if (
    brand === 'isom' ||
    brand === 'iso2' ||
    brand === 'mp41' ||
    brand === 'mp42' ||
    brand === 'avc1' ||
    brand === 'M4V ' ||
    brand === 'MSNV'
  ) {
    return 'video/mp4'
  }
  // Compatible brands list may follow; accept ftyp as MP4-family when claimed as such later
  return 'video/mp4'
}

function detectWebm(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  )
}

export function detectVideoMime(buffer: Buffer): string | null {
  if (detectWebm(buffer)) return 'video/webm'
  return detectIsoBmffMime(buffer)
}

export function validateConstructionVideoBuffer(
  buffer: Buffer,
  claimedMimeType?: string,
): ValidatedVideo {
  if (!buffer.length) {
    throw Object.assign(new Error('Empty file.'), { code: 'INVALID_FILE', statusCode: 400 })
  }
  if (buffer.length > MAX_CONSTRUCTION_VIDEO_BYTES) {
    throw Object.assign(new Error('Video exceeds the 100 MB upload limit.'), {
      code: 'FILE_TOO_LARGE',
      statusCode: 400,
    })
  }
  const detected = detectVideoMime(buffer)
  if (!detected || !ALLOWED_VIDEO_MIME_TYPES.has(detected)) {
    throw Object.assign(new Error('Only MP4, WebM, and QuickTime construction videos are supported.'), {
      code: 'UNSUPPORTED_FILE_TYPE',
      statusCode: 400,
    })
  }
  if (claimedMimeType) {
    const normalized =
      claimedMimeType === 'video/mov' ? 'video/quicktime' : claimedMimeType
    if (ALLOWED_VIDEO_MIME_TYPES.has(normalized)) {
      // MP4 and QuickTime both use ftyp; allow that family match.
      const mp4Family = new Set(['video/mp4', 'video/quicktime'])
      if (mp4Family.has(normalized) && mp4Family.has(detected)) {
        // Prefer claimed when both are ISO BMFF family
        return {
          mimeType: normalized,
          extension: EXT_BY_MIME[normalized],
          size: buffer.length,
          kind: 'video',
        }
      }
      if (normalized !== detected) {
        throw Object.assign(new Error('File content does not match the declared video type.'), {
          code: 'MIME_MISMATCH',
          statusCode: 400,
        })
      }
    }
  }
  return {
    mimeType: detected,
    extension: EXT_BY_MIME[detected],
    size: buffer.length,
    kind: 'video',
  }
}
