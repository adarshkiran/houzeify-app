// ─── C20 — Organization Reports summary (company Reports rail) ─────────────
// Indexes each organization project's Construction Record package for the
// company Reports screen. Reuses C18 getConstructionRecord — does not invent
// a second construction-record model. Read-only. Membership-gated.

import type { Env } from '../config/env.js'
import { HttpError } from '../errors/httpError.js'
import { getOrganizationForMember } from './organization.service.js'
import { listProjectsForOrganization } from '../projects/project.service.js'
import { getConstructionRecord } from '../projects/constructionRecord.service.js'

export interface OrganizationReportsProjectRow {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  stageIndex: number | null
  stageTotal: number
  stageName: string | null
  progress: {
    totalCount: number
    publishedCount: number
    photoCount: number
    videoCount: number
  }
  documents: {
    totalActive: number
    sharedWithCustomer: number
  }
  workforceActiveCount: number
  operations: {
    tasksOpen: number
    tasksTotal: number
    issuesOpen: number
    issuesTotal: number
    boqItemCount: number
    boqTotalAmountPaise: number
  }
}

export interface OrganizationReportsSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    progressUpdates: number
    sharedProgress: number
    photos: number
    videos: number
    activeDocuments: number
    sharedDocuments: number
    openTasks: number
    openIssues: number
  }
  projects: OrganizationReportsProjectRow[]
}

type ConstructionRecordShape = {
  project: {
    id: string
    name: string
    location: string | null
    propertyType: string | null
    status: string | null
    stage: string | null
  }
  stage: {
    currentId: string | null
    currentName: string | null
    index: number | null
    total: number
  }
  progress: {
    totalCount: number
    publishedCount: number
    photoCount: number
    videoCount: number
  }
  documents: {
    totalActive: number
    sharedWithCustomer: number
  }
  workforce: { activeCount: number }
  operations?: {
    tasks: { total: number; open: number; completed: number }
    issues: { total: number; open: number; highOpen: number }
    boq: { sectionCount: number; itemCount: number; totalAmountPaise: number }
  }
}

export async function getOrganizationReportsSummary(
  env: Env,
  organizationId: string,
  userId: string,
): Promise<OrganizationReportsSummary> {
  const organization = await getOrganizationForMember(env, organizationId, userId)
  if (!organization) {
    throw new HttpError('NOT_FOUND', 'Organization not found.', 404)
  }

  const orgProjects = await listProjectsForOrganization(env, organizationId, userId)

  const projects: OrganizationReportsProjectRow[] = []
  let progressUpdates = 0
  let sharedProgress = 0
  let photos = 0
  let videos = 0
  let activeDocuments = 0
  let sharedDocuments = 0
  let openTasks = 0
  let openIssues = 0

  for (const project of orgProjects) {
    const record = (await getConstructionRecord(env, project.id, userId)) as ConstructionRecordShape
    const ops = record.operations
    const row: OrganizationReportsProjectRow = {
      id: project.id,
      name: project.name,
      location: project.location,
      propertyType: project.propertyType,
      stage: project.stage,
      status: project.status,
      type: project.type,
      stageIndex: record.stage.index,
      stageTotal: record.stage.total,
      stageName: record.stage.currentName,
      progress: {
        totalCount: record.progress.totalCount,
        publishedCount: record.progress.publishedCount,
        photoCount: record.progress.photoCount,
        videoCount: record.progress.videoCount,
      },
      documents: {
        totalActive: record.documents.totalActive,
        sharedWithCustomer: record.documents.sharedWithCustomer,
      },
      workforceActiveCount: record.workforce.activeCount,
      operations: {
        tasksOpen: ops?.tasks.open ?? 0,
        tasksTotal: ops?.tasks.total ?? 0,
        issuesOpen: ops?.issues.open ?? 0,
        issuesTotal: ops?.issues.total ?? 0,
        boqItemCount: ops?.boq.itemCount ?? 0,
        boqTotalAmountPaise: ops?.boq.totalAmountPaise ?? 0,
      },
    }
    projects.push(row)
    progressUpdates += row.progress.totalCount
    sharedProgress += row.progress.publishedCount
    photos += row.progress.photoCount
    videos += row.progress.videoCount
    activeDocuments += row.documents.totalActive
    sharedDocuments += row.documents.sharedWithCustomer
    openTasks += row.operations.tasksOpen
    openIssues += row.operations.issuesOpen
  }

  // Prefer projects further along the stage journey, then by name.
  projects.sort((a, b) => {
    const ai = a.stageIndex ?? -1
    const bi = b.stageIndex ?? -1
    if (ai !== bi) return bi - ai
    return a.name.localeCompare(b.name)
  })

  return {
    organizationId: organization.id,
    organizationName: organization.name,
    generatedAt: new Date().toISOString(),
    totals: {
      projectCount: orgProjects.length,
      progressUpdates,
      sharedProgress,
      photos,
      videos,
      activeDocuments,
      sharedDocuments,
      openTasks,
      openIssues,
    },
    projects,
  }
}
