import { and, desc, eq, inArray } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import {
  customerProfiles,
  dailyProgress,
  dailyProgressPhotos,
  organizations,
  partnerProfiles,
  projectDocuments,
  projectWorkforceMembers,
  type DailyProgressPhotoRow,
  type DailyProgressRow,
} from '../db/schema.js'
import { requireCompanyOrCustomerRead } from './projectAccess.js'
import {
  CONSTRUCTION_STAGE_ORDER,
  serializeCustomerDocument,
  serializeCustomerHeader,
  serializeCustomerProgress,
} from './customerView.types.js'

async function organizationNameFor(env: Env, organizationId: string | null): Promise<string | null> {
  if (!organizationId) return null
  const db = getDb(env)
  const rows = await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, organizationId)).limit(1)
  return rows[0]?.name ?? null
}

async function loadPublishedProgress(
  env: Env,
  projectId: string,
): Promise<{ progress: DailyProgressRow[]; photosByProgressId: Map<string, DailyProgressPhotoRow[]> }> {
  const db = getDb(env)
  const rows = await db
    .select()
    .from(dailyProgress)
    .where(and(eq(dailyProgress.projectId, projectId), eq(dailyProgress.visibility, 'customer')))
    .orderBy(desc(dailyProgress.date), desc(dailyProgress.createdAt))

  const photosByProgressId = new Map<string, DailyProgressPhotoRow[]>()
  if (rows.length > 0) {
    const photoRows = await db
      .select()
      .from(dailyProgressPhotos)
      .where(inArray(dailyProgressPhotos.dailyProgressId, rows.map(r => r.id)))
    for (const photo of photoRows) {
      const list = photosByProgressId.get(photo.dailyProgressId) ?? []
      list.push(photo)
      photosByProgressId.set(photo.dailyProgressId, list)
    }
  }
  return { progress: rows, photosByProgressId }
}

export async function getCustomerViewHeader(env: Env, projectId: string, userId: string) {
  const { project } = await requireCompanyOrCustomerRead(env, projectId, userId)
  const { progress, photosByProgressId } = await loadPublishedProgress(env, projectId)
  const latestRow = progress[0]
  const latest = latestRow ? serializeCustomerProgress(latestRow, photosByProgressId.get(latestRow.id) ?? []) : null
  const organizationName = await organizationNameFor(env, project.organizationId)
  return serializeCustomerHeader(project, organizationName, latest)
}

export async function listCustomerViewProgress(env: Env, projectId: string, userId: string) {
  await requireCompanyOrCustomerRead(env, projectId, userId)
  const { progress, photosByProgressId } = await loadPublishedProgress(env, projectId)
  return progress.map(row => serializeCustomerProgress(row, photosByProgressId.get(row.id) ?? []))
}

export async function listCustomerViewDocuments(env: Env, projectId: string, userId: string) {
  await requireCompanyOrCustomerRead(env, projectId, userId)
  const db = getDb(env)
  const rows = await db
    .select()
    .from(projectDocuments)
    .where(
      and(
        eq(projectDocuments.projectId, projectId),
        eq(projectDocuments.status, 'active'),
        eq(projectDocuments.visibility, 'customer'),
      ),
    )
    .orderBy(desc(projectDocuments.createdAt), desc(projectDocuments.id))
  return rows.map(serializeCustomerDocument)
}

export async function listCustomerViewWorkforce(env: Env, projectId: string, userId: string) {
  await requireCompanyOrCustomerRead(env, projectId, userId)
  const db = getDb(env)
  const members = await db
    .select()
    .from(projectWorkforceMembers)
    .where(and(eq(projectWorkforceMembers.projectId, projectId), eq(projectWorkforceMembers.status, 'active')))
    .orderBy(projectWorkforceMembers.createdAt)

  return Promise.all(
    members.map(async member => {
      const partner = await db
        .select({ displayName: partnerProfiles.displayName, fullName: partnerProfiles.fullName })
        .from(partnerProfiles)
        .where(eq(partnerProfiles.userId, member.userId))
        .limit(1)
      const customer = await db
        .select({ fullName: customerProfiles.fullName })
        .from(customerProfiles)
        .where(eq(customerProfiles.userId, member.userId))
        .limit(1)
      const displayName = partner[0]?.displayName?.trim() || partner[0]?.fullName || customer[0]?.fullName || 'Team member'
      return { displayName, role: member.role }
    }),
  )
}

export async function getCustomerViewTimeline(env: Env, projectId: string, userId: string) {
  const { project } = await requireCompanyOrCustomerRead(env, projectId, userId)
  const { progress } = await loadPublishedProgress(env, projectId)
  const currentIndex = CONSTRUCTION_STAGE_ORDER.findIndex(s => s.id === project.stage)
  const datesByStage = new Map<string, string>()
  for (const row of progress) {
    if (!row.stage) continue
    if (!datesByStage.has(row.stage)) datesByStage.set(row.stage, row.date)
  }

  return CONSTRUCTION_STAGE_ORDER.map((stage, index) => {
    let state: 'completed' | 'current' | 'upcoming' = 'upcoming'
    if (currentIndex < 0) {
      state = 'upcoming'
    } else if (index < currentIndex) {
      state = 'completed'
    } else if (index === currentIndex) {
      state = 'current'
    }
    return {
      id: stage.id,
      name: stage.name,
      state,
      latestPublishedDate: datesByStage.get(stage.id) ?? null,
    }
  })
}
