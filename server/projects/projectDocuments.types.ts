// ─── Project Documents types + response serialization — Module 07 ─────────
// Documents are METADATA ONLY: no file bytes are stored, so `storageRef` is
// a server-internal placeholder and is NEVER part of a response.
// `fileAvailable` derives from it: true only once a real (non-`internal://`)
// storage reference exists.
import type { ProjectDocumentRow } from '../db/schema.js'

export interface ProjectDocumentInput {
  category: string
  fileName: string
  mimeType: string
  size: number
  title?: string
  description?: string
}

export interface ProjectDocumentPatch {
  title?: string
  description?: string
  category?: string
  visibility?: 'internal' | 'customer'
}

export function serializeProjectDocument(row: ProjectDocumentRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    uploadedBy: row.uploadedBy,
    category: row.category,
    title: row.title,
    description: row.description,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    fileAvailable: !row.storageRef.startsWith('internal://'),
    visibility: row.visibility,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
