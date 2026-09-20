// ─── Project Workforce types + response serialization — Module 06 ─────────
import type { ProjectWorkforceMemberRow } from '../db/schema.js'

export interface ProjectWorkforceMemberInput {
  userId: string
  role: string
}

export interface ProjectWorkforceMemberPatch {
  role?: string
}

export function serializeProjectWorkforceMember(row: ProjectWorkforceMemberRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    role: row.role,
    status: row.status,
    addedBy: row.addedBy,
    removedAt: row.removedAt ? row.removedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
