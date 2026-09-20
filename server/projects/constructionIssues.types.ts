// ─── Construction Issue types + response serialization — Module 05 ────────
import type { ConstructionIssueRow } from '../db/schema.js'

export function serializeConstructionIssue(row: ConstructionIssueRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    reportedBy: row.reportedBy,
    title: row.title,
    description: row.description,
    stage: row.stage,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assigneeId,
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
