// ─── Project DTOs — 12H-B ───────────────────────────────────────────────────

import type { ProjectRow } from '../db/schema.js'

export function serializeProject(row: ProjectRow) {
  return {
    id: row.id,
    ownerId: row.ownerId,
    // Module 03 — organizationId is the new Organization -> Project
    // relationship (nullable: a homeowner's own project has none).
    organizationId: row.organizationId,
    name: row.name,
    type: row.type,
    location: row.location,
    propertyType: row.propertyType,
    stage: row.stage,
    status: row.status,
    timelineStart: row.timelineStart,
    timelineCompletion: row.timelineCompletion,
    summary: row.summary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
