// ─── Shared project-access helper tests — Module 07 ────────────────────────
// Real database-backed. Organizations and projects are created through
// app.inject(); members are inserted into organization_members directly;
// the helper functions are then called directly against the real DB. The
// helper adds no new rule — these tests pin the existing Module 03/05/06
// boundary: READ = creator or any org member (any role); MUTATE = creator or
// an org member whose role is in ORGANIZATION_MUTATION_ROLES; everyone else
// gets a 404 (never 403).

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers, projects, type ProjectRow } from '../db/schema.js'
import { HttpError } from '../errors/httpError.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'
import { getProjectForAccess } from './project.service.js'
import { canMutateAtProjectLevel, requireProjectAccess, requireProjectMutation, resolveProjectAccess } from './projectAccess.js'

const env = loadTestEnv()

function assertNotFound(err: unknown): true {
  assert.ok(err instanceof HttpError, 'expected an HttpError')
  assert.equal(err.statusCode, 404)
  assert.equal(err.code, 'NOT_FOUND')
  assert.equal(err.message, 'Project not found.')
  return true
}

test('project access helper: read vs mutate boundaries, 404 for everyone else', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const creator = await createTestUser(env!)
  const creatorCookie = sessionCookieHeader(await createTestSessionToken(env!, creator.id))
  const orgOwnerMember = await createTestUser(env!)
  const adminMember = await createTestUser(env!)
  const viewerMember = await createTestUser(env!)
  const teamMember = await createTestUser(env!)
  const managerMember = await createTestUser(env!)
  const outsider = await createTestUser(env!)
  const orgBUser = await createTestUser(env!)
  const orgBCookie = sessionCookieHeader(await createTestSessionToken(env!, orgBUser.id))
  const homeowner = await createTestUser(env!)
  const homeownerCookie = sessionCookieHeader(await createTestSessionToken(env!, homeowner.id))

  const users = [creator, orgOwnerMember, adminMember, viewerMember, teamMember, managerMember, outsider, orgBUser, homeowner]

  let orgProject: ProjectRow
  let soloProject: ProjectRow

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  async function loadProject(id: string): Promise<ProjectRow> {
    const rows = await getDb(env!).select().from(projects).where(eq(projects.id, id)).limit(1)
    assert.ok(rows[0], 'project row exists')
    return rows[0]
  }

  await t.test('setup: Organization A + project, members of every role, Organization B, a no-organization project', async () => {
    const orgRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: creatorCookie },
      payload: { name: uniqueName('Org A') },
    })
    assert.equal(orgRes.statusCode, 201)
    const organizationId = orgRes.json().data.organization.id as string

    const now = new Date()
    await getDb(env!).insert(organizationMembers).values([
      { organizationId, userId: orgOwnerMember.id, role: 'owner', status: 'active', joinedAt: now },
      { organizationId, userId: adminMember.id, role: 'admin', status: 'active', joinedAt: now },
      { organizationId, userId: viewerMember.id, role: 'viewer', status: 'active', joinedAt: now },
      { organizationId, userId: teamMember.id, role: 'team-member', status: 'active', joinedAt: now },
      { organizationId, userId: managerMember.id, role: 'project-manager', status: 'active', joinedAt: now },
    ])

    const projectRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: creatorCookie },
      payload: { name: uniqueName('Site A'), organizationId },
    })
    assert.equal(projectRes.statusCode, 201)
    orgProject = await loadProject(projectRes.json().data.project.id)
    assert.equal(orgProject.organizationId, organizationId)

    // Organization B — orgBUser owns it and is NOT a member of Organization A.
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgBRes.statusCode, 201)

    // A project with no organization — only its creator relates to it.
    const soloRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: homeownerCookie },
      payload: { name: uniqueName('Home Site') },
    })
    assert.equal(soloRes.statusCode, 201)
    soloProject = await loadProject(soloRes.json().data.project.id)
    assert.equal(soloProject.organizationId, null)
  })

  await t.test('project creator can access and mutate an organization project', async () => {
    const project = await requireProjectAccess(env!, orgProject.id, creator.id)
    assert.equal(project.id, orgProject.id)
    assert.equal(await canMutateAtProjectLevel(env!, project, creator.id), true)
    await requireProjectMutation(env!, project, creator.id)
  })

  for (const [label, getUser] of [
    ['owner', () => orgOwnerMember],
    ['admin', () => adminMember],
  ] as const) {
    await t.test(`org ${label} member can access and mutate`, async () => {
      const user = getUser()
      const project = await requireProjectAccess(env!, orgProject.id, user.id)
      assert.equal(project.id, orgProject.id)
      assert.equal(await canMutateAtProjectLevel(env!, project, user.id), true)
      await requireProjectMutation(env!, project, user.id)
    })
  }

  for (const [label, getUser] of [
    ['viewer', () => viewerMember],
    ['team-member', () => teamMember],
    ['project-manager', () => managerMember],
  ] as const) {
    await t.test(`org ${label} member can access but cannot mutate`, async () => {
      const user = getUser()
      const project = await requireProjectAccess(env!, orgProject.id, user.id)
      assert.equal(project.id, orgProject.id)
      assert.equal(await canMutateAtProjectLevel(env!, project, user.id), false)
      await assert.rejects(() => requireProjectMutation(env!, project, user.id), assertNotFound)
    })
  }

  await t.test('outsider gets 404 on access, and cannot mutate', async () => {
    await assert.rejects(() => requireProjectAccess(env!, orgProject.id, outsider.id), assertNotFound)
    assert.equal(await canMutateAtProjectLevel(env!, orgProject, outsider.id), false)
    await assert.rejects(() => requireProjectMutation(env!, orgProject, outsider.id), assertNotFound)
  })

  await t.test('Organization B member gets 404 on an Organization A project, and cannot mutate', async () => {
    await assert.rejects(() => requireProjectAccess(env!, orgProject.id, orgBUser.id), assertNotFound)
    assert.equal(await canMutateAtProjectLevel(env!, orgProject, orgBUser.id), false)
    await assert.rejects(() => requireProjectMutation(env!, orgProject, orgBUser.id), assertNotFound)
  })

  await t.test('non-existent project id gets 404', async () => {
    await assert.rejects(() => requireProjectAccess(env!, '00000000-0000-4000-8000-000000000000', creator.id), assertNotFound)
  })

  await t.test('project with no organization: only its creator can access and mutate', async () => {
    const project = await requireProjectAccess(env!, soloProject.id, homeowner.id)
    assert.equal(project.id, soloProject.id)
    assert.equal(await canMutateAtProjectLevel(env!, project, homeowner.id), true)
    await requireProjectMutation(env!, project, homeowner.id)

    // Even an org owner/admin from elsewhere has no path in.
    await assert.rejects(() => requireProjectAccess(env!, soloProject.id, creator.id), assertNotFound)
    await assert.rejects(() => requireProjectAccess(env!, soloProject.id, adminMember.id), assertNotFound)
    assert.equal(await canMutateAtProjectLevel(env!, soloProject, adminMember.id), false)
    await assert.rejects(() => requireProjectMutation(env!, soloProject, adminMember.id), assertNotFound)
    await assert.rejects(() => requireProjectMutation(env!, soloProject, outsider.id), assertNotFound)
  })

  await t.test('resolveProjectAccess: creator and org members are company-kind', async () => {
    for (const user of [creator, orgOwnerMember, adminMember, viewerMember, teamMember, managerMember]) {
      const access = await resolveProjectAccess(env!, orgProject.id, user.id)
      assert.ok(access)
      assert.equal(access.kind, 'company')
      assert.equal(access.project.id, orgProject.id)
    }
  })

  await t.test('resolveProjectAccess: outsider is undefined; requireProjectAccess still 404', async () => {
    assert.equal(await resolveProjectAccess(env!, orgProject.id, outsider.id), undefined)
    await assert.rejects(() => requireProjectAccess(env!, orgProject.id, outsider.id), assertNotFound)
  })

  await t.test('getProjectForAccess is unchanged: same company rows, no outsider access', async () => {
    assert.equal((await getProjectForAccess(env!, orgProject.id, creator.id))?.id, orgProject.id)
    assert.equal((await getProjectForAccess(env!, orgProject.id, viewerMember.id))?.id, orgProject.id)
    assert.equal(await getProjectForAccess(env!, orgProject.id, outsider.id), undefined)
    assert.equal((await getProjectForAccess(env!, soloProject.id, homeowner.id))?.id, soloProject.id)
    assert.equal(await getProjectForAccess(env!, soloProject.id, creator.id), undefined)
  })
})
