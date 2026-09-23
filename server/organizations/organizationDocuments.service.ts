// ─── C22 — Organization Documents summary (company Documents rail) ─────────
// Active construction-document rollup across an organization's projects.
// Read-only. Membership-gated. Reuses project_documents (C16). Does not
// invent a second document store or company-level upload.

import { and, desc, eq, inArray } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { projectDocuments, projects } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getOrganizationForMember } from './organization.service.js'

const RECENT_LIMIT = 5

export interface OrganizationDocumentsRecentRow {
  id: string
  title: string
  category: string
  fileName: string
  visibility: string
  createdAt: string
}

export interface OrganizationDocumentsProjectRow {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  activeCount: number
  sharedWithCustomerCount: number
  recent: OrganizationDocumentsRecentRow[]
}

export interface OrganizationDocumentsSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    projectsWithDocuments: number
    activeDocuments: number
    sharedWithCustomer: number
  }
  projects: OrganizationDocumentsProjectRow[]
}

export async function getOrganizationDocumentsSummary(
  env: Env,
  organizationId: string,
  userId: string,
): Promise<OrganizationDocumentsSummary> {
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
        projectsWithDocuments: 0,
        activeDocuments: 0,
        sharedWithCustomer: 0,
      },
      projects: [],
    }
  }

  const projectIds = orgProjects.map(p => p.id)
  const documentRows = await db
    .select()
    .from(projectDocuments)
    .where(and(inArray(projectDocuments.projectId, projectIds), eq(projectDocuments.status, 'active')))
    .orderBy(desc(projectDocuments.createdAt))

  const docsByProject = new Map<string, typeof documentRows>()
  for (const row of documentRows) {
    const list = docsByProject.get(row.projectId) ?? []
    list.push(row)
    docsByProject.set(row.projectId, list)
  }

  let sharedWithCustomer = 0
  const projectRows: OrganizationDocumentsProjectRow[] = orgProjects.map(project => {
    const docs = docsByProject.get(project.id) ?? []
    const sharedCount = docs.filter(d => d.visibility === 'customer').length
    sharedWithCustomer += sharedCount
    return {
      id: project.id,
      name: project.name,
      location: project.location,
      propertyType: project.propertyType,
      stage: project.stage,
      status: project.status,
      type: project.type,
      activeCount: docs.length,
      sharedWithCustomerCount: sharedCount,
      recent: docs.slice(0, RECENT_LIMIT).map(doc => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        fileName: doc.fileName,
        visibility: doc.visibility,
        createdAt: doc.createdAt.toISOString(),
      })),
    }
  })

  // Documents-first: projects with active docs, then by name.
  projectRows.sort((a, b) => {
    if (a.activeCount !== b.activeCount) return b.activeCount - a.activeCount
    return a.name.localeCompare(b.name)
  })

  return {
    organizationId: organization.id,
    organizationName: organization.name,
    generatedAt: new Date().toISOString(),
    totals: {
      projectCount: orgProjects.length,
      projectsWithDocuments: projectRows.filter(p => p.activeCount > 0).length,
      activeDocuments: documentRows.length,
      sharedWithCustomer,
    },
    projects: projectRows,
  }
}
