// ─── Daily Progress API layer — Module 04 / C15 ─────────────────────────────
// Photo upload is multipart FormData (real bytes). JSON metadata-only upload
// is no longer accepted by the server.

import { ApiError, apiDelete, apiGet, apiPatch, apiPost, apiPostFormData } from './apiClient'

export interface DailyProgressPhoto {
  id: string
  dailyProgressId: string
  fileName: string
  mimeType: string
  mediaKind: 'photo' | 'video'
  size: number
  uploadedBy: string
  storageRef: string
  fileAvailable: boolean
  contentUrl: string | null
  createdAt: string
}

export interface DailyProgress {
  id: string
  projectId: string
  createdBy: string
  date: string
  stage: string | null
  title: string
  description: string | null
  photos: DailyProgressPhoto[]
  visibility?: 'internal' | 'customer'
  publishedAt?: string | null
  publishedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface DailyProgressInput {
  date: string
  stage?: string
  title: string
  description?: string
}

interface DailyProgressListEnvelope {
  data: { progress: DailyProgress[] }
}
interface DailyProgressEnvelope {
  data: { progress: DailyProgress }
}
interface DailyProgressPhotoEnvelope {
  data: { photo: DailyProgressPhoto }
}

export async function listDailyProgress(projectId: string): Promise<DailyProgress[]> {
  const res = await apiGet<DailyProgressListEnvelope>(`/api/v1/projects/${projectId}/daily-progress`)
  return res.data.progress
}

export async function createDailyProgress(projectId: string, input: DailyProgressInput): Promise<DailyProgress> {
  const res = await apiPost<DailyProgressEnvelope>(`/api/v1/projects/${projectId}/daily-progress`, input)
  return res.data.progress
}

export async function updateDailyProgress(projectId: string, progressId: string, patch: Partial<DailyProgressInput> & { visibility?: 'internal' | 'customer' }): Promise<DailyProgress> {
  const res = await apiPatch<DailyProgressEnvelope>(`/api/v1/projects/${projectId}/daily-progress/${progressId}`, patch)
  return res.data.progress
}

export async function deleteDailyProgress(projectId: string, progressId: string): Promise<void> {
  await apiDelete<null>(`/api/v1/projects/${projectId}/daily-progress/${progressId}`)
}

/** C15/C15C — upload real photo or video bytes. Field name must be `file`. */
export async function addDailyProgressPhoto(projectId: string, progressId: string, file: File): Promise<DailyProgressPhoto> {
  const form = new FormData()
  form.append('file', file, file.name)
  const res = await apiPostFormData<DailyProgressPhotoEnvelope>(
    `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
    form,
  )
  return res.data.photo
}

/** C15D — remove a single construction evidence item (photo or video). */
export async function deleteDailyProgressPhoto(projectId: string, photoId: string): Promise<void> {
  await apiDelete<null>(`/api/v1/projects/${projectId}/daily-progress-photos/${photoId}`)
}

export function describeDailyProgressError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  switch (err.code) {
    case 'EMPTY_PATCH':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
    case 'NOT_FOUND':
    case 'INVALID_ID':
    case 'INVALID_FILE':
    case 'UNSUPPORTED_FILE_TYPE':
    case 'FILE_TOO_LARGE':
    case 'MIME_MISMATCH':
    case 'MEDIA_UNAVAILABLE':
    case 'STORAGE_DELETE_FAILED':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
