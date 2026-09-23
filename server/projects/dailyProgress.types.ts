// ─── Daily Progress DTOs — Module 04 / C15 ──────────────────────────────────

import type { DailyProgressPhotoRow, DailyProgressRow } from '../db/schema.js'
import { isRetrievableStorageRef } from '../storage/objectStorage.js'

export function progressPhotoContentPath(projectId: string, photoId: string): string {
  return `/api/v1/projects/${projectId}/daily-progress-photos/${photoId}/content`
}

export function serializeDailyProgressPhoto(row: DailyProgressPhotoRow, projectId: string) {
  const fileAvailable = isRetrievableStorageRef(row.storageRef)
  return {
    id: row.id,
    dailyProgressId: row.dailyProgressId,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    uploadedBy: row.uploadedBy,
    /** Opaque; clients should prefer contentUrl. Kept for company debugging. */
    storageRef: row.storageRef,
    fileAvailable,
    contentUrl: fileAvailable ? progressPhotoContentPath(projectId, row.id) : null,
    createdAt: row.createdAt.toISOString(),
  }
}

export function serializeDailyProgress(row: DailyProgressRow, photos: DailyProgressPhotoRow[] = []) {
  return {
    id: row.id,
    projectId: row.projectId,
    createdBy: row.createdBy,
    date: row.date,
    stage: row.stage,
    title: row.title,
    description: row.description,
    photos: photos.map(photo => serializeDailyProgressPhoto(photo, row.projectId)),
    visibility: row.visibility,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    publishedBy: row.publishedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
