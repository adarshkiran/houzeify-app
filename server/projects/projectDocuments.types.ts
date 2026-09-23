// ─── Project Documents types + response serialization — Module 07 / C16 ───
// `storageRef` is NEVER part of a response. `fileAvailable` / `contentUrl`
// derive from retrievable local:// or s3:// refs. Legacy internal:// → unavailable.
import type { ProjectDocumentRow } from '../db/schema.js'
import { isRetrievableStorageRef } from '../storage/objectStorage.js'

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

export function documentContentPath(projectId: string, documentId: string): string {
  return `/api/v1/projects/${projectId}/documents/${documentId}/content`
}

export function serializeProjectDocument(row: ProjectDocumentRow) {
  const fileAvailable = isRetrievableStorageRef(row.storageRef)
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
    fileAvailable,
    contentUrl: fileAvailable ? documentContentPath(row.projectId, row.id) : null,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
