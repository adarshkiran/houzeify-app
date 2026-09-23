// ─── C18 — Project Construction Record package ─────────────────────────────
// Assembles existing Construction Record data for company or customer
// audiences. Does not invent a second media/document store. Customer
// audience is limited to shared/published subsets (reuse customer-view rules).

import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  boqItems,
  boqSections,
  constructionIssues,
  constructionTasks,
  dailyProgress,
  dailyProgressPhotos,
  organizations,
  projectDocuments,
  projectWorkforceMembers,
} from '../db/schema.js'
import { mediaKindFromMime } from '../storage/mediaValidation.js'
import { requireCompanyOrCustomerRead } from './projectAccess.js'
import { getCustomerViewTimeline, listCustomerViewWorkforce } from './customerView.service.js'
import { CONSTRUCTION_STAGE_ORDER } from './customerView.types.js'

const RECENT_LIMIT = 8

async function organizationNameFor(env: Env, organizationId: string | null): Promise<string | null> {
  if (!organizationId) return null
  const db = getDb(env)
  const rows = await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, organizationId)).limit(1)
  return rows[0]?.name ?? null
}

function stageSummary(stageId: string | null) {
  const index = CONSTRUCTION_STAGE_ORDER.findIndex(s => s.id === stageId)
  const current = index >= 0 ? CONSTRUCTION_STAGE_ORDER[index] : null
  return {
    currentId: stageId,
    currentName: current?.name ?? (stageId || null),
    index: index >= 0 ? index + 1 : null,
    total: CONSTRUCTION_STAGE_ORDER.length,
  }
}

export async function getConstructionRecord(env: Env, projectId: string, userId: string) {
  const access = await requireCompanyOrCustomerRead(env, projectId, userId)
  const { project, kind } = access
  const db = getDb(env)
  const organizationName = await organizationNameFor(env, project.organizationId)
  const timeline = await getCustomerViewTimeline(env, projectId, userId)

  const progressWhere =
    kind === 'customer'
      ? and(eq(dailyProgress.projectId, projectId), eq(dailyProgress.visibility, 'customer'))
      : eq(dailyProgress.projectId, projectId)

  const progressRows = await db
    .select()
    .from(dailyProgress)
    .where(progressWhere)
    .orderBy(desc(dailyProgress.date), desc(dailyProgress.createdAt))

  const progressIds = progressRows.map(r => r.id)
  const photoRows =
    progressIds.length > 0
      ? await db.select().from(dailyProgressPhotos).where(inArray(dailyProgressPhotos.dailyProgressId, progressIds))
      : []

  let photoCount = 0
  let videoCount = 0
  const mediaByProgress = new Map<string, { photos: number; videos: number }>()
  for (const media of photoRows) {
    const kindMedia = mediaKindFromMime(media.mimeType)
    const bucket = mediaByProgress.get(media.dailyProgressId) ?? { photos: 0, videos: 0 }
    if (kindMedia === 'video') {
      videoCount += 1
      bucket.videos += 1
    } else {
      photoCount += 1
      bucket.photos += 1
    }
    mediaByProgress.set(media.dailyProgressId, bucket)
  }

  const publishedCount =
    kind === 'customer'
      ? progressRows.length
      : progressRows.filter(r => r.visibility === 'customer').length

  const documentsWhere =
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
    .where(documentsWhere)
    .orderBy(desc(projectDocuments.createdAt))

  const sharedDocumentCount =
    kind === 'customer'
      ? documentRows.length
      : (
          await db
            .select({ count: sql<number>`count(*)::int` })
            .from(projectDocuments)
            .where(
              and(
                eq(projectDocuments.projectId, projectId),
                eq(projectDocuments.status, 'active'),
                eq(projectDocuments.visibility, 'customer'),
              ),
            )
        )[0]?.count ?? 0

  const workforceRows = await db
    .select()
    .from(projectWorkforceMembers)
    .where(and(eq(projectWorkforceMembers.projectId, projectId), eq(projectWorkforceMembers.status, 'active')))

  // Display names only (no emails) — same shape customer-view workforce uses.
  const members = await listCustomerViewWorkforce(env, projectId, userId)
  const workforceSummary = {
    activeCount: kind === 'company' ? workforceRows.length : members.length,
    members: members.slice(0, RECENT_LIMIT),
  }

  const record: Record<string, unknown> = {
    audience: kind,
    generatedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      location: project.location,
      propertyType: project.propertyType,
      status: project.status,
      stage: project.stage,
      timelineStart: project.timelineStart,
      timelineCompletion: project.timelineCompletion,
      summary: kind === 'company' ? project.summary : null,
      organizationName,
    },
    stage: stageSummary(project.stage),
    timeline,
    progress: {
      totalCount: progressRows.length,
      publishedCount,
      photoCount,
      videoCount,
      latest: progressRows[0]
        ? {
            id: progressRows[0].id,
            date: progressRows[0].date,
            title: progressRows[0].title,
            stage: progressRows[0].stage,
            ...(kind === 'company' ? { visibility: progressRows[0].visibility } : {}),
          }
        : null,
      recent: progressRows.slice(0, RECENT_LIMIT).map(row => {
        const media = mediaByProgress.get(row.id) ?? { photos: 0, videos: 0 }
        return {
          id: row.id,
          date: row.date,
          title: row.title,
          stage: row.stage,
          photoCount: media.photos,
          videoCount: media.videos,
          ...(kind === 'company' ? { visibility: row.visibility } : {}),
        }
      }),
    },
    documents: {
      totalActive: documentRows.length,
      sharedWithCustomer: sharedDocumentCount,
      recent: documentRows.slice(0, RECENT_LIMIT).map(doc => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        fileName: doc.fileName,
        ...(kind === 'company' ? { visibility: doc.visibility } : {}),
      })),
    },
    workforce: workforceSummary,
  }

  if (kind === 'company') {
    const tasks = await db.select().from(constructionTasks).where(eq(constructionTasks.projectId, projectId))
    const issues = await db.select().from(constructionIssues).where(eq(constructionIssues.projectId, projectId))
    const openTasks = tasks.filter(t => t.status !== 'completed')
    const openIssues = issues.filter(i => i.status !== 'resolved')
    const sections = await db.select().from(boqSections).where(eq(boqSections.projectId, projectId))
    const items = await db.select().from(boqItems).where(eq(boqItems.projectId, projectId))
    const totalAmountPaise = items.reduce((sum, item) => sum + (item.amountPaise ?? 0), 0)

    record.operations = {
      tasks: {
        total: tasks.length,
        open: openTasks.length,
        completed: tasks.length - openTasks.length,
      },
      issues: {
        total: issues.length,
        open: openIssues.length,
        highOpen: openIssues.filter(i => i.priority === 'high').length,
      },
      boq: {
        sectionCount: sections.length,
        itemCount: items.length,
        totalAmountPaise,
      },
    }
  }

  return record
}
