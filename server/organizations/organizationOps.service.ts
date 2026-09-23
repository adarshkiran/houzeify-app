// ─── C23 — Organization Ops summary (company Site Operations rail) ─────────
// Open tasks & issues rollup across an organization's projects.
// Read-only. Membership-gated. Reuses construction_tasks / construction_issues.
// Does not invent attendance, checklists, material requests, or Live Site.

import { and, desc, eq, inArray, ne } from 'drizzle-orm'
import type { Env } from '../config/env.js'
import { getDb } from '../db/client.js'
import { constructionIssues, constructionTasks, projects } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { getOrganizationForMember } from './organization.service.js'

const OPEN_ITEM_LIMIT = 5

export interface OrganizationOpsTaskRow {
  id: string
  title: string
  status: string
  priority: string | null
  stage: string | null
  dueDate: string | null
  updatedAt: string
}

export interface OrganizationOpsIssueRow {
  id: string
  title: string
  status: string
  priority: string | null
  stage: string | null
  updatedAt: string
}

export interface OrganizationOpsProjectRow {
  id: string
  name: string
  location: string | null
  propertyType: string | null
  stage: string | null
  status: string | null
  type: string | null
  openTaskCount: number
  openIssueCount: number
  highOpenIssueCount: number
  openTasks: OrganizationOpsTaskRow[]
  openIssues: OrganizationOpsIssueRow[]
}

export interface OrganizationOpsSummary {
  organizationId: string
  organizationName: string
  generatedAt: string
  totals: {
    projectCount: number
    projectsWithOpenWork: number
    openTasks: number
    openIssues: number
    highOpenIssues: number
  }
  projects: OrganizationOpsProjectRow[]
}

export async function getOrganizationOpsSummary(
  env: Env,
  organizationId: string,
  userId: string,
): Promise<OrganizationOpsSummary> {
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
        projectsWithOpenWork: 0,
        openTasks: 0,
        openIssues: 0,
        highOpenIssues: 0,
      },
      projects: [],
    }
  }

  const projectIds = orgProjects.map(p => p.id)

  const openTaskRows = await db
    .select()
    .from(constructionTasks)
    .where(and(inArray(constructionTasks.projectId, projectIds), ne(constructionTasks.status, 'completed')))
    .orderBy(desc(constructionTasks.updatedAt))

  const openIssueRows = await db
    .select()
    .from(constructionIssues)
    .where(and(inArray(constructionIssues.projectId, projectIds), ne(constructionIssues.status, 'resolved')))
    .orderBy(desc(constructionIssues.updatedAt))

  const tasksByProject = new Map<string, typeof openTaskRows>()
  for (const row of openTaskRows) {
    const list = tasksByProject.get(row.projectId) ?? []
    list.push(row)
    tasksByProject.set(row.projectId, list)
  }

  const issuesByProject = new Map<string, typeof openIssueRows>()
  for (const row of openIssueRows) {
    const list = issuesByProject.get(row.projectId) ?? []
    list.push(row)
    issuesByProject.set(row.projectId, list)
  }

  let openTasks = 0
  let openIssues = 0
  let highOpenIssues = 0

  const projectRows: OrganizationOpsProjectRow[] = orgProjects.map(project => {
    const tasks = tasksByProject.get(project.id) ?? []
    const issues = issuesByProject.get(project.id) ?? []
    const highCount = issues.filter(i => i.priority === 'high').length
    openTasks += tasks.length
    openIssues += issues.length
    highOpenIssues += highCount
    return {
      id: project.id,
      name: project.name,
      location: project.location,
      propertyType: project.propertyType,
      stage: project.stage,
      status: project.status,
      type: project.type,
      openTaskCount: tasks.length,
      openIssueCount: issues.length,
      highOpenIssueCount: highCount,
      openTasks: tasks.slice(0, OPEN_ITEM_LIMIT).map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        stage: task.stage,
        dueDate: task.dueDate,
        updatedAt: task.updatedAt.toISOString(),
      })),
      openIssues: issues.slice(0, OPEN_ITEM_LIMIT).map(issue => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
        stage: issue.stage,
        updatedAt: issue.updatedAt.toISOString(),
      })),
    }
  })

  // Open-work first: projects with open items, then by name.
  projectRows.sort((a, b) => {
    const aOpen = a.openTaskCount + a.openIssueCount
    const bOpen = b.openTaskCount + b.openIssueCount
    if (aOpen !== bOpen) return bOpen - aOpen
    return a.name.localeCompare(b.name)
  })

  return {
    organizationId: organization.id,
    organizationName: organization.name,
    generatedAt: new Date().toISOString(),
    totals: {
      projectCount: orgProjects.length,
      projectsWithOpenWork: projectRows.filter(p => p.openTaskCount + p.openIssueCount > 0).length,
      openTasks,
      openIssues,
      highOpenIssues,
    },
    projects: projectRows,
  }
}
