import type { DailyProgressPhotoRow, DailyProgressRow, ProjectDocumentRow, ProjectRow } from '../db/schema.js'
import { isRetrievableStorageRef } from '../storage/objectStorage.js'
import { progressPhotoContentPath } from './dailyProgress.types.js'

export const CONSTRUCTION_STAGE_ORDER = [
  { id: 'pre-construction', name: 'Pre-Construction' },
  { id: 'foundation', name: 'Foundation' },
  { id: 'structure', name: 'Structure' },
  { id: 'masonry', name: 'Masonry' },
  { id: 'mep', name: 'MEP' },
  { id: 'plastering', name: 'Plastering' },
  { id: 'flooring', name: 'Flooring' },
  { id: 'doors-windows', name: 'Doors & Windows' },
  { id: 'painting', name: 'Painting' },
  { id: 'final-finishing', name: 'Final Finishing' },
] as const

export function serializeCustomerProgressPhoto(row: DailyProgressPhotoRow, projectId: string) {
  const fileAvailable = isRetrievableStorageRef(row.storageRef)
  return {
    id: row.id,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    fileAvailable,
    contentUrl: fileAvailable ? progressPhotoContentPath(projectId, row.id) : null,
    createdAt: row.createdAt.toISOString(),
  }
}

export function serializeCustomerProgress(row: DailyProgressRow, photos: DailyProgressPhotoRow[] = []) {
  return {
    id: row.id,
    projectId: row.projectId,
    date: row.date,
    stage: row.stage,
    title: row.title,
    description: row.description,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    photos: photos.map(photo => serializeCustomerProgressPhoto(photo, row.projectId)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function serializeCustomerDocument(row: ProjectDocumentRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    category: row.category,
    title: row.title,
    description: row.description,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    fileAvailable: !row.storageRef.startsWith('internal://'),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function serializeCustomerHeader(
  project: ProjectRow,
  organizationName: string | null,
  latest: ReturnType<typeof serializeCustomerProgress> | null,
) {
  return {
    id: project.id,
    name: project.name,
    location: project.location,
    propertyType: project.propertyType,
    stage: project.stage,
    status: project.status,
    timelineStart: project.timelineStart,
    timelineCompletion: project.timelineCompletion,
    organizationName,
    latestProgress: latest
      ? { id: latest.id, date: latest.date, title: latest.title, stage: latest.stage }
      : null,
  }
}
