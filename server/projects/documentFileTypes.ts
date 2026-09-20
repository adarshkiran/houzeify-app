// ─── Project document file rules — server-side validation only ────────────
// Hand-mirrored from src/data/documentUpload.ts (SUPPORTED_EXTENSIONS,
// MAX_FILE_SIZE_MB) and src/data/projectDocumentsStore.ts (the seven
// document categories). Those frontend files are unreachable from server/,
// and AJV needs concrete values to validate against — same precedent as
// constructionStageIds.ts. KEEP IN SYNC BY HAND if either frontend file's
// rules ever change. Display labels/order live only in the frontend files.

/** Lowercase file extensions accepted for a project document. */
export const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'dwg', 'dxf'] as const

/** 25 MB — documentUpload.ts's MAX_FILE_SIZE_MB * 1024 * 1024. */
export const MAX_DOCUMENT_SIZE_BYTES = 26_214_400

export const DOCUMENT_CATEGORIES = [
  'plans',
  'estimates-boq',
  'contracts',
  'approvals',
  'invoices',
  'site-documents',
  'other',
] as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]
