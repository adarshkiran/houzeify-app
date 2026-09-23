// ─── C16 project document file validation ───────────────────────────────────
// Server-side extension, size, and magic-byte checks. Frontend validation is
// not the security boundary. DWG/DXF get extension + size + non-image/pdf
// rejection (full CAD parsers are out of scope).

import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../projects/documentFileTypes.js'

export { MAX_DOCUMENT_SIZE_BYTES }

const EXT_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  dwg: 'application/acad',
  dxf: 'image/vnd.dxf',
}

export type ValidatedDocument = {
  mimeType: string
  extension: string
  size: number
  fileName: string
}

function extensionOf(fileName: string): string | null {
  const dot = fileName.lastIndexOf('.')
  if (dot < 0) return null
  return fileName.slice(dot + 1).toLowerCase()
}

function detectPdf(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-'
}

function detectPng(buffer: Buffer): boolean {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  )
}

function detectJpeg(buffer: Buffer): boolean {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
}

/** Autodesk DWG binary versions often start with "AC10". */
function detectDwg(buffer: Buffer): boolean {
  if (buffer.length < 6) return false
  const head = buffer.toString('ascii', 0, 6)
  return head.startsWith('AC10')
}

/** DXF group-code text commonly begins with "0" then SECTION. */
function detectDxf(buffer: Buffer): boolean {
  const sample = buffer.toString('utf8', 0, Math.min(buffer.length, 256)).replace(/^\uFEFF/, '')
  return /^\s*0\s*[\r\n]+\s*SECTION\b/i.test(sample)
}

export function sanitizeDocumentFileName(name: string): string {
  const trimmed = name.trim().replace(/[\u0000-\u001f\u007f]/g, '')
  const base = trimmed.slice(0, 255) || 'document'
  return base
}

export function validateProjectDocumentBuffer(
  buffer: Buffer,
  fileName: string,
  claimedMimeType?: string,
): ValidatedDocument {
  if (!buffer.length) {
    throw Object.assign(new Error('Empty file.'), { code: 'INVALID_FILE', statusCode: 400 })
  }
  if (buffer.length > MAX_DOCUMENT_SIZE_BYTES) {
    throw Object.assign(new Error('Document exceeds the 25 MB upload limit.'), {
      code: 'FILE_TOO_LARGE',
      statusCode: 400,
    })
  }

  const ext = extensionOf(fileName)
  if (!ext || !(ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) {
    throw Object.assign(
      new Error(`This file type isn't supported. Allowed: ${ALLOWED_DOCUMENT_EXTENSIONS.join(', ')}.`),
      { code: 'UNSUPPORTED_FILE_TYPE', statusCode: 400 },
    )
  }

  const safeName = sanitizeDocumentFileName(fileName)
  let mimeType = EXT_MIME[ext] || 'application/octet-stream'

  if (ext === 'pdf') {
    if (!detectPdf(buffer)) {
      throw Object.assign(new Error('File content does not look like a PDF.'), {
        code: 'MIME_MISMATCH',
        statusCode: 400,
      })
    }
    mimeType = 'application/pdf'
  } else if (ext === 'png') {
    if (!detectPng(buffer)) {
      throw Object.assign(new Error('File content does not look like a PNG.'), {
        code: 'MIME_MISMATCH',
        statusCode: 400,
      })
    }
    mimeType = 'image/png'
  } else if (ext === 'jpg' || ext === 'jpeg') {
    if (!detectJpeg(buffer)) {
      throw Object.assign(new Error('File content does not look like a JPEG.'), {
        code: 'MIME_MISMATCH',
        statusCode: 400,
      })
    }
    mimeType = 'image/jpeg'
  } else if (ext === 'dwg') {
    if (detectPdf(buffer) || detectPng(buffer) || detectJpeg(buffer)) {
      throw Object.assign(new Error('File content does not match the DWG extension.'), {
        code: 'MIME_MISMATCH',
        statusCode: 400,
      })
    }
    if (!detectDwg(buffer)) {
      throw Object.assign(new Error('Only binary DWG files are supported.'), {
        code: 'UNSUPPORTED_FILE_TYPE',
        statusCode: 400,
      })
    }
    mimeType = 'application/acad'
  } else if (ext === 'dxf') {
    if (detectPdf(buffer) || detectPng(buffer) || detectJpeg(buffer)) {
      throw Object.assign(new Error('File content does not match the DXF extension.'), {
        code: 'MIME_MISMATCH',
        statusCode: 400,
      })
    }
    if (!detectDxf(buffer)) {
      throw Object.assign(new Error('Only text DXF files are supported.'), {
        code: 'UNSUPPORTED_FILE_TYPE',
        statusCode: 400,
      })
    }
    mimeType = 'image/vnd.dxf'
  }

  if (claimedMimeType) {
    const claim = claimedMimeType === 'image/jpg' ? 'image/jpeg' : claimedMimeType
    // Allow common aliases; reject when claim is a different concrete family.
    const imageFamily = new Set(['image/png', 'image/jpeg'])
    const pdfFamily = new Set(['application/pdf'])
    if (pdfFamily.has(claim) && mimeType !== 'application/pdf') {
      throw Object.assign(new Error('File content does not match the declared type.'), {
        code: 'MIME_MISMATCH',
        statusCode: 400,
      })
    }
    if (imageFamily.has(claim) && claim !== mimeType) {
      throw Object.assign(new Error('File content does not match the declared type.'), {
        code: 'MIME_MISMATCH',
        statusCode: 400,
      })
    }
  }

  return {
    mimeType,
    extension: ext === 'jpeg' ? 'jpg' : ext,
    size: buffer.length,
    fileName: safeName,
  }
}
