// ─── Project Documents API layer — Module 07 / C16 ─────────────────────────
// Create is multipart FormData (real bytes). Contract from
// server/projects/projectDocuments.types.ts (serializeProjectDocument).

import { ApiError, apiDelete, apiGet, apiPatch, apiPostFormData } from './apiClient'
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
  contentUrl: string | null
  visibility?: 'internal' | 'customer'
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface CreateProjectDocumentInput {
  category: DocumentCategory
  file: File
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

/** C16 — upload real document bytes. Field name must be `file`. */
export async function createProjectDocument(
  projectId: string,
  input: CreateProjectDocumentInput,
): Promise<ProjectDocumentDto> {
  const form = new FormData()
  form.append('file', input.file, input.file.name)
  form.append('category', input.category)
  if (input.title) form.append('title', input.title)
  if (input.description) form.append('description', input.description)
  const res = await apiPostFormData<ProjectDocumentEnvelope>(`/api/v1/projects/${projectId}/documents`, form)
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

export function describeDocumentError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'VALIDATION_ERROR':
      case 'EMPTY_PATCH':
      case 'INVALID_FILE':
      case 'UNSUPPORTED_FILE_TYPE':
      case 'FILE_TOO_LARGE':
      case 'MIME_MISMATCH':
      case 'MEDIA_UNAVAILABLE':
        return err.message
      case 'NOT_FOUND':
        return "You don't have permission to change this document, or it was already archived."
      case 'NETWORK_ERROR':
        return err.message
      case 'FST_ERR_VALIDATION':
        return "Some details aren't valid. Check the title, category and file, then try again."
    }
    if (err.status === 400) return "Some details aren't valid. Check the title, category and file, then try again."
  }
  return 'Something went wrong. Please try again.'
}
