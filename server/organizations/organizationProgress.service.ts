// ─── C19 — Organization Progress summary (company Progress rail) ───────────
// Assembles per-project daily progress + evidence counts for an organization.
// Read-only. Membership-gated. Does not invent attendance, Live Site, or a
// second media store.

import { desc, eq, inArray } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { dailyProgress, dailyProgressPhotos, projects } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { mediaKindFromMime } from '../storage/mediaValidation.js'
import { getOrganizationForMember } from '../organizations/organization.service.js'

export interface OrganizationProgressLatestUpdate {
  id: string
  date: string
  title: string
  stage: string | null
  visibility: string
  createdAt: string
}

export interface OrganizationProgressProjectRow {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  updateCount: number
  sharedWithCustomerCount: number
  photoCount: number
  videoCount: number
  latestUpdate: OrganizationProgressLatestUpdate | null
}

export interface OrganizationProgressSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    projectsWithUpdates: number
    updateCount: number
    sharedWithCustomerCount: number
    photoCount: number
    videoCount: number
  }
  projects: OrganizationProgressProjectRow[]
}

export async function getOrganizationProgressSummary(
  env: Env,
  organizationId: string,
  userId: string,
): Promise<OrganizationProgressSummary> {
  const organization = await getOrganizationForMember(env, organizationId, userId)
  if (!organization) {
    throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  }

  const db = getDb(env)
  const orgProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, organizationId))
    .orderBy(desc(projects.updatedAt))

  if (orgProjects.length === 0) {
    return {
      organizationId: organization.id,
      organizationName: organization.name,
      generatedAt: new Date().toISOString(),
      totals: {
        projectCount: 0,
        projectsWithUpdates: 0,
        updateCount: 0,
        sharedWithCustomerCount: 0,
        photoCount: 0,
        videoCount: 0,
      },
      projects: [],
    }
  }

  const projectIds = orgProjects.map(p => p.id)

  const progressRows = await db
    .select()
    .from(dailyProgress)
    .where(inArray(dailyProgress.projectId, projectIds))
    .orderBy(desc(dailyProgress.date), desc(dailyProgress.createdAt))

  const progressIds = progressRows.map(r => r.id)
  const mediaRows =
    progressIds.length > 0
      ? await db.select().from(dailyProgressPhotos).where(inArray(dailyProgressPhotos.dailyProgressId, progressIds))
      : []

  const mediaByProgress = new Map<string, { photos: number; videos: number }>()
  for (const media of mediaRows) {
    const bucket = mediaByProgress.get(media.dailyProgressId) ?? { photos: 0, videos: 0 }
    if (mediaKindFromMime(media.mimeType) === 'video') bucket.videos += 1
    else bucket.photos += 1
    mediaByProgress.set(media.dailyProgressId, bucket)
  }

  type Agg = {
    updateCount: number
    sharedWithCustomerCount: number
    photoCount: number
    videoCount: number
    latest: (typeof progressRows)[number] | null
  }

  const byProject = new Map<string, Agg>()
  for (const id of projectIds) {
    byProject.set(id, {
      updateCount: 0,
      sharedWithCustomerCount: 0,
      photoCount: 0,
      videoCount: 0,
      latest: null,
    })
  }

  for (const row of progressRows) {
    const agg = byProject.get(row.projectId)
    if (!agg) continue
    agg.updateCount += 1
    if (row.visibility === 'customer') agg.sharedWithCustomerCount += 1
    const media = mediaByProgress.get(row.id)
    if (media) {
      agg.photoCount += media.photos
      agg.videoCount += media.videos
    }
    if (!agg.latest) agg.latest = row
  }

  let totalUpdates = 0
  let totalShared = 0
  let totalPhotos = 0
  let totalVideos = 0
  let projectsWithUpdates = 0

  const projectSummaries: OrganizationProgressProjectRow[] = orgProjects.map(project => {
    const agg = byProject.get(project.id)!
    totalUpdates += agg.updateCount
    totalShared += agg.sharedWithCustomerCount
    totalPhotos += agg.photoCount
    totalVideos += agg.videoCount
    if (agg.updateCount > 0) projectsWithUpdates += 1

    return {
      id: project.id,
      name: project.name,
      location: project.location,
      propertyType: project.propertyType,
      stage: project.stage,
      status: project.status,
      type: project.type,
      updateCount: agg.updateCount,
      sharedWithCustomerCount: agg.sharedWithCustomerCount,
      photoCount: agg.photoCount,
      videoCount: agg.videoCount,
      latestUpdate: agg.latest
        ? {
            id: agg.latest.id,
            date: agg.latest.date,
            title: agg.latest.title,
            stage: agg.latest.stage,
            visibility: agg.latest.visibility,
            createdAt: agg.latest.createdAt.toISOString(),
          }
        : null,
    }
  })

  // Surface projects with recent evidence first, then by project updatedAt order already used.
  projectSummaries.sort((a, b) => {
    const aDate = a.latestUpdate?.date ?? ''
    const bDate = b.latestUpdate?.date ?? ''
    if (aDate !== bDate) return bDate.localeCompare(aDate)
    return a.name.localeCompare(b.name)
  })

  return {
    organizationId: organization.id,
    organizationName: organization.name,
    generatedAt: new Date().toISOString(),
    totals: {
      projectCount: orgProjects.length,
      projectsWithUpdates,
      updateCount: totalUpdates,
      sharedWithCustomerCount: totalShared,
      photoCount: totalPhotos,
      videoCount: totalVideos,
    },
    projects: projectSummaries,
  }
}
