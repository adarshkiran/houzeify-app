// ─── Daily Progress API layer — Module 04 ──────────────────────────────────
// Mirrors projectApi.ts's shape exactly. Backend contract read directly
// from server/projects/dailyProgress.routes.ts and dailyProgress.types.ts.

import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from './apiClient'

export interface DailyProgressPhoto {
  id: string
  dailyProgressId: string
  fileName: string
  mimeType: string
  size: number
  uploadedBy: string
  storageRef: string
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
  createdAt: string
  updatedAt: string
}

export interface DailyProgressInput {
  date: string
  stage?: string
  title: string
  description?: string
}

export interface DailyProgressPhotoInput {
  fileName: string
  mimeType: string
  size: number
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

export async function updateDailyProgress(projectId: string, progressId: string, patch: Partial<DailyProgressInput>): Promise<DailyProgress> {
  const res = await apiPatch<DailyProgressEnvelope>(`/api/v1/projects/${projectId}/daily-progress/${progressId}`, patch)
  return res.data.progress
}

export async function deleteDailyProgress(projectId: string, progressId: string): Promise<void> {
  await apiDelete<null>(`/api/v1/projects/${projectId}/daily-progress/${progressId}`)
}

/** `input` never has a storageRef field — the server always mints it from
 *  the new photo row's own id (dailyProgress.service.ts). */
export async function addDailyProgressPhoto(projectId: string, progressId: string, input: DailyProgressPhotoInput): Promise<DailyProgressPhoto> {
  const res = await apiPost<DailyProgressPhotoEnvelope>(`/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`, input)
  return res.data.photo
}

export function describeDailyProgressError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  switch (err.code) {
    case 'EMPTY_PATCH':
    case 'UNAUTHENTICATED':
    case 'NETWORK_ERROR':
    case 'NOT_FOUND':
    case 'INVALID_ID':
      return err.message
    default:
      return 'Something went wrong. Please try again.'
  }
}
