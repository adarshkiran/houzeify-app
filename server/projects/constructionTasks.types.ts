// ─── Construction Task types + response serialization — Module 05 ─────────
import type { ConstructionTaskRow } from '../db/schema.js'

export function serializeConstructionTask(row: ConstructionTaskRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    createdBy: row.createdBy,
    title: row.title,
    description: row.description,
    stage: row.stage,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assigneeId,
    dueDate: row.dueDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
