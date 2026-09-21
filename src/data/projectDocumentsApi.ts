// ─── Project Documents API layer — Module 07 ───────────────────────────────
// Documents are metadata only (no file bytes). Contract read directly from
// server/projects/projectDocuments.types.ts (serializeProjectDocument).

import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from './apiClient'
import type { DocumentCategory } from './projectDocumentsStore'

export interface ProjectDocumentDto {
  id: string
  projectId: string
  uploadedBy: string
  category: DocumentCategory
  title: string
  description: string | null
  fileName: string
  mimeType: string
  size: number
  fileAvailable: boolean
  visibility?: 'internal' | 'customer'
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface CreateProjectDocumentInput {
  category: DocumentCategory
  fileName: string
  mimeType: string
  size: number
  title?: string
  description?: string
}

export interface UpdateProjectDocumentInput {
  title?: string
  description?: string
  category?: DocumentCategory
  visibility?: 'internal' | 'customer'
}

interface ProjectDocumentListEnvelope {
  data: { documents: ProjectDocumentDto[] }
}
interface ProjectDocumentEnvelope {
  data: { document: ProjectDocumentDto }
}

export async function listProjectDocuments(projectId: string): Promise<ProjectDocumentDto[]> {
  const res = await apiGet<ProjectDocumentListEnvelope>(`/api/v1/projects/${projectId}/documents`)
  return res.data.documents
}

export async function createProjectDocument(
  projectId: string,
  input: CreateProjectDocumentInput,
): Promise<ProjectDocumentDto> {
  const res = await apiPost<ProjectDocumentEnvelope>(`/api/v1/projects/${projectId}/documents`, input)
  return res.data.document
}

export async function updateProjectDocument(
  projectId: string,
  id: string,
  patch: UpdateProjectDocumentInput,
): Promise<ProjectDocumentDto> {
  const res = await apiPatch<ProjectDocumentEnvelope>(`/api/v1/projects/${projectId}/documents/${id}`, patch)
  return res.data.document
}

/** Soft-archives the document (server returns 204). */
export async function archiveProjectDocument(projectId: string, id: string): Promise<void> {
  await apiDelete<null>(`/api/v1/projects/${projectId}/documents/${id}`)
}

/** Plain-language message for a failed documents mutation. Branches on the
 *  error `code` first: a NOT_FOUND may be a stale row (already archived) or a
 *  project the user can't change, so it is deliberately not labelled as only
 *  a permissions problem. */
export function describeDocumentError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'VALIDATION_ERROR':
      case 'EMPTY_PATCH':
        return err.message
      case 'NOT_FOUND':
        return "You don't have permission to change this document, or it was already archived."
      case 'NETWORK_ERROR':
        return err.message
      case 'FST_ERR_VALIDATION':
        return "Some details aren't valid. Check the title, category and file, then try again."
    }
    // Any other 400 is a request the server rejected as malformed — never
    // show its technical message.
    if (err.status === 400) return "Some details aren't valid. Check the title, category and file, then try again."
  }
  return 'Something went wrong. Please try again.'
}
