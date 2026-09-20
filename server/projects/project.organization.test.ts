// ─── Project ↔ Organization authorization tests — Module 03 ────────────────
// Real database-backed, via app.inject(). Exercises exactly the two
// scenarios the ticket calls out: a member of Organization A can list/
// create/view/update (when permitted) Organization A's projects; a
// non-member of Organization A must not be able to do any of those, even
// with a real, valid organization id. Membership rows for roles the current
// API can't create yet (viewer/admin, since there is no invite endpoint)
// are inserted directly against the DB, same convention
// organization.test.ts already uses for its own not-yet-API-reachable
// scenarios.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('projects: organization-scoped create/list/access, membership authorization', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!) // Organization A's owner
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!) // real member, 'viewer' role
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const admin = await createTestUser(env!) // real member, 'admin' role
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, admin.id))
  const outsider = await createTestUser(env!) // not a member of Organization A at all
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

  let organizationId = ''
  let projectId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, viewer.id)
    await cleanupTestUser(env!, admin.id)
    await cleanupTestUser(env!, outsider.id)
    await closeDb()
  })

  await t.test('setup: create Organization A, add viewer and admin members directly (no invite API yet)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Org A') },
    })
    assert.equal(res.statusCode, 201)
    organizationId = res.json().data.organization.id

    const db = getDb(env!)
    await db.insert(organizationMembers).values([
      { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      { organizationId, userId: admin.id, role: 'admin', status: 'active', joinedAt: new Date() },
    ])
  })

  await t.test('outsider cannot create a project under Organization A (404, not fabricated)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: outsiderCookie },
      payload: { name: 'Should not exist', organizationId },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('org owner creates a project under Organization A', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('HQ Site'), type: 'new-build', organizationId, status: 'planning', timelineStart: '2026-01-01' },
    })
    assert.equal(res.statusCode, 201)
    const project = res.json().data.project
    assert.equal(project.organizationId, organizationId)
    assert.equal(project.ownerId, owner.id, 'creator is recorded as ownerId — distinct from organizationId')
    assert.equal(project.status, 'planning')
    projectId = project.id
  })

  await t.test('outsider cannot list Organization A projects (404)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects?organizationId=${organizationId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer (real member) CAN list Organization A projects', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects?organizationId=${organizationId}`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 200)
    const ids = res.json().data.projects.map((p: { id: string }) => p.id)
    assert.ok(ids.includes(projectId))
  })

  await t.test('outsider cannot directly GET the project (404, not 403)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer (real member, did not create it) CAN GET the project — read broadens to any org member', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.project.id, projectId)
  })

  await t.test("viewer role CANNOT PATCH the project — mutation stays owner/admin-only", async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}`,
      headers: { cookie: viewerCookie },
      payload: { name: 'Hijacked by viewer' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin role (did not create it) CAN PATCH the project — org admin/owner mutation, reusing organization.service.ts\'s own MUTATION_ROLES', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}`,
      headers: { cookie: adminCookie },
      payload: { status: 'active', stage: 'foundation' },
    })
    assert.equal(res.statusCode, 200)
    const updated = res.json().data.project
    assert.equal(updated.status, 'active')
    assert.equal(updated.stage, 'foundation')
  })

  await t.test("outsider's PATCH does not modify the project", async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}`,
      headers: { cookie: outsiderCookie },
      payload: { name: 'Hijacked by outsider' },
    })
    assert.equal(res.statusCode, 404)
    const check = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}`, headers: { cookie: ownerCookie } })
    assert.notEqual(check.json().data.project.name, 'Hijacked by outsider')
  })

  await t.test('creator (owner) can still PATCH their own organization project directly', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}`,
      headers: { cookie: ownerCookie },
      payload: { timelineCompletion: '2026-12-01' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.project.timelineCompletion, '2026-12-01')
  })

  await t.test("owner's default (no organizationId query) project list is unaffected — still their own owner-scoped list, unchanged from 12H-B", async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    const ids = res.json().data.projects.map((p: { id: string }) => p.id)
    assert.ok(ids.includes(projectId), 'the project they created is still in their own owner-scoped list too')
  })

  await t.test('malformed organizationId query param is rejected with 400, not a raw DB error', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects?organizationId=not-a-uuid', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 400)
  })
})
