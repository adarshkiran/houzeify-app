// ─── Daily Progress DTOs — Module 04 ────────────────────────────────────────

import type { DailyProgressPhotoRow, DailyProgressRow } from '../db/schema.js'

export function serializeDailyProgressPhoto(row: DailyProgressPhotoRow) {
  return {
    id: row.id,
    dailyProgressId: row.dailyProgressId,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    uploadedBy: row.uploadedBy,
    storageRef: row.storageRef,
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
    photos: photos.map(serializeDailyProgressPhoto),
    visibility: row.visibility,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    publishedBy: row.publishedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
