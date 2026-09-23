// ─── C24 — Project Activity History (synthesized chronology) ───────────────
// Read-only time-ordered events from existing construction tables.
// Complements C18 Construction Record (dossier) — does not invent an event log.
// Company: operational + shared events. Customer: shared progress/docs/evidence only.

import { and, desc, eq, inArray } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  constructionIssues,
  constructionTasks,
  customerProfiles,
  dailyProgress,
  dailyProgressPhotos,
  partnerProfiles,
  projectDocuments,
  projectWorkforceMembers,
} from '../db/schema.js'
import { mediaKindFromMime } from '../storage/mediaValidation.js'
import { requireCompanyOrCustomerRead } from './projectAccess.js'

const ACTIVITY_LIMIT = 50

export type ProjectActivityKind =
  | 'progress'
  | 'evidence'
  | 'task'
  | 'task_completed'
  | 'issue'
  | 'issue_resolved'
  | 'document'
  | 'workforce'

export interface ProjectActivityEvent {
  id: string
  kind: ProjectActivityKind
  title: string
  summary: string | null
  occurredAt: string
  stage: string | null
  visibility: 'internal' | 'customer' | null
  entityId: string
}

export interface ProjectActivityFeed {
  projectId: string
  projectName: string
  audience: 'company' | 'customer'
  generatedAt: string
  events: ProjectActivityEvent[]
}

function toIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString()
  return new Date(value).toISOString()
}

export async function getProjectActivity(
  env: Env,
  projectId: string,
  userId: string,
): Promise<ProjectActivityFeed> {
  const access = await requireCompanyOrCustomerRead(env, projectId, userId)
  const { project, kind } = access
  const db = getDb(env)
  const events: ProjectActivityEvent[] = []

  const progressWhere =
    kind === 'customer'
      ? and(eq(dailyProgress.projectId, projectId), eq(dailyProgress.visibility, 'customer'))
      : eq(dailyProgress.projectId, projectId)

  const progressRows = await db
    .select()
    .from(dailyProgress)
    .where(progressWhere)
    .orderBy(desc(dailyProgress.createdAt))

  for (const row of progressRows) {
    events.push({
      id: `progress:${row.id}`,
      kind: 'progress',
      title: row.title?.trim() || 'Daily progress update',
      summary: row.date ? `Progress date ${row.date}` : null,
      occurredAt: toIso(row.createdAt),
      stage: row.stage,
      visibility: row.visibility === 'customer' ? 'customer' : 'internal',
      entityId: row.id,
    })
  }

  const progressIds = progressRows.map(r => r.id)
  if (progressIds.length > 0) {
    const mediaRows = await db
      .select()
      .from(dailyProgressPhotos)
      .where(inArray(dailyProgressPhotos.dailyProgressId, progressIds))
      .orderBy(desc(dailyProgressPhotos.createdAt))

    const progressById = new Map(progressRows.map(r => [r.id, r]))
    for (const media of mediaRows) {
      const parent = progressById.get(media.dailyProgressId)
      if (!parent) continue
      const mediaKind = mediaKindFromMime(media.mimeType)
      events.push({
        id: `evidence:${media.id}`,
        kind: 'evidence',
        title: mediaKind === 'video' ? 'Construction video added' : 'Construction photo added',
        summary: parent.title?.trim() || null,
        occurredAt: toIso(media.createdAt),
        stage: parent.stage,
        visibility: parent.visibility === 'customer' ? 'customer' : 'internal',
        entityId: media.id,
      })
    }
  }

  if (kind === 'company') {
    const taskRows = await db
      .select()
      .from(constructionTasks)
      .where(eq(constructionTasks.projectId, projectId))
      .orderBy(desc(constructionTasks.createdAt))

    for (const task of taskRows) {
      events.push({
        id: `task:${task.id}`,
        kind: 'task',
        title: task.title,
        summary: `Task · ${task.status.replace(/_/g, ' ')}`,
        occurredAt: toIso(task.createdAt),
        stage: task.stage,
        visibility: 'internal',
        entityId: task.id,
      })
      if (task.status === 'completed') {
        events.push({
          id: `task_completed:${task.id}`,
          kind: 'task_completed',
          title: task.title,
          summary: 'Task completed',
          occurredAt: toIso(task.updatedAt),
          stage: task.stage,
          visibility: 'internal',
          entityId: task.id,
        })
      }
    }

    const issueRows = await db
      .select()
      .from(constructionIssues)
      .where(eq(constructionIssues.projectId, projectId))
      .orderBy(desc(constructionIssues.createdAt))

    for (const issue of issueRows) {
      events.push({
        id: `issue:${issue.id}`,
        kind: 'issue',
        title: issue.title,
        summary: `Issue · ${issue.status.replace(/_/g, ' ')}${issue.priority ? ` · ${issue.priority}` : ''}`,
        occurredAt: toIso(issue.createdAt),
        stage: issue.stage,
        visibility: 'internal',
        entityId: issue.id,
      })
      if (issue.status === 'resolved' && issue.resolvedAt) {
        events.push({
          id: `issue_resolved:${issue.id}`,
          kind: 'issue_resolved',
          title: issue.title,
          summary: 'Issue resolved',
          occurredAt: toIso(issue.resolvedAt),
          stage: issue.stage,
          visibility: 'internal',
          entityId: issue.id,
        })
      }
    }

    const workforceRows = await db
      .select()
      .from(projectWorkforceMembers)
      .where(eq(projectWorkforceMembers.projectId, projectId))
      .orderBy(desc(projectWorkforceMembers.createdAt))

    const workforceUserIds = [...new Set(workforceRows.map(r => r.userId))]
    const nameByUser = new Map<string, string>()
    if (workforceUserIds.length > 0) {
      const partners = await db
        .select({ userId: partnerProfiles.userId, displayName: partnerProfiles.displayName, fullName: partnerProfiles.fullName })
        .from(partnerProfiles)
        .where(inArray(partnerProfiles.userId, workforceUserIds))
      for (const row of partners) {
        nameByUser.set(row.userId, row.displayName?.trim() || row.fullName.trim() || 'Team member')
      }
      const customers = await db
        .select({ userId: customerProfiles.userId, preferredName: customerProfiles.preferredName, fullName: customerProfiles.fullName })
        .from(customerProfiles)
        .where(inArray(customerProfiles.userId, workforceUserIds))
      for (const row of customers) {
        if (!nameByUser.has(row.userId)) {
          nameByUser.set(row.userId, row.preferredName?.trim() || row.fullName.trim() || 'Team member')
        }
      }
    }

    for (const member of workforceRows) {
      const name = nameByUser.get(member.userId) ?? 'Team member'
      events.push({
        id: `workforce:${member.id}`,
        kind: 'workforce',
        title: `${name} assigned`,
        summary: member.role,
        occurredAt: toIso(member.createdAt),
        stage: null,
        visibility: 'internal',
        entityId: member.id,
      })
    }
  }

  const documentWhere =
    kind === 'customer'
      ? and(
          eq(projectDocuments.projectId, projectId),
          eq(projectDocuments.status, 'active'),
          eq(projectDocuments.visibility, 'customer'),
        )
      : and(eq(projectDocuments.projectId, projectId), eq(projectDocuments.status, 'active'))

  const documentRows = await db
    .select()
    .from(projectDocuments)
    .where(documentWhere)
    .orderBy(desc(projectDocuments.createdAt))

  for (const doc of documentRows) {
    events.push({
      id: `document:${doc.id}`,
      kind: 'document',
      title: doc.title,
      summary: `${doc.category} · ${doc.visibility === 'customer' ? 'Shared' : 'Internal'}`,
      occurredAt: toIso(doc.createdAt),
      stage: null,
      visibility: doc.visibility === 'customer' ? 'customer' : 'internal',
      entityId: doc.id,
    })
  }

  events.sort((a, b) => {
    const delta = new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    if (delta !== 0) return delta
    return a.id.localeCompare(b.id)
  })

  return {
    projectId: project.id,
    projectName: project.name,
    audience: kind,
    generatedAt: new Date().toISOString(),
    events: events.slice(0, ACTIVITY_LIMIT),
  }
}
