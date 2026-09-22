// ─── Project Workforce route tests — Module 06 ─────────────────────────────
// Real database-backed, via app.inject(). Mirrors constructionTasks.test.ts's
// exact structure: creator access, org-member-can-read (including a
// viewer), creator-or-mutation-role for add/edit/remove, outsider blocked
// everywhere with 404 (not 403), invalid role/userId rejected, duplicate
// active assignment rejected, and an explicit cross-organization isolation
// check.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers, projectWorkforceMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('project workforce: add/list/edit/remove, organization authorization, validation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const admin = await createTestUser(env!)
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, admin.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const orgBUser = await createTestUser(env!)
  const orgBCookie = sessionCookieHeader(await createTestSessionToken(env!, orgBUser.id))

  let organizationId = ''
  let projectId = ''
  let memberRowId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, viewer.id)
    await cleanupTestUser(env!, admin.id)
    await cleanupTestUser(env!, outsider.id)
    await cleanupTestUser(env!, orgBUser.id)
    await closeDb()
  })

  await t.test('setup: Organization A + a project under it, add viewer and admin members', async () => {
    const orgRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Org A') },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    const db = getDb(env!)
    await db.insert(organizationMembers).values([
      { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      { organizationId, userId: admin.id, role: 'admin', status: 'active', joinedAt: new Date() },
    ])

    const projectRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site A'), organizationId },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id
  })

  await t.test('unauthenticated add is rejected', async () => {
    const res = await app.inject({ method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, payload: { userId: viewer.id, role: 'Electrician' } })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider cannot list (404, not 403)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member CAN read the list (broad read boundary)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json().data.members, [])
  })

  await t.test('viewer-role member CANNOT add (mutation role required)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: viewerCookie },
      payload: { userId: viewer.id, role: 'Electrician' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin-role member CAN add a workforce member', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: adminCookie },
      payload: { userId: viewer.id, role: 'Electrician' },
    })
    assert.equal(res.statusCode, 201)
    const member = res.json().data.member
    assert.equal(member.userId, viewer.id)
    assert.equal(member.role, 'Electrician')
    assert.equal(member.status, 'active')
    assert.equal(member.addedBy, admin.id)
    memberRowId = member.id
  })

  await t.test('owner can list and sees the admin-added member', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    const members = res.json().data.members
    assert.equal(members.length, 1)
    assert.equal(members[0].id, memberRowId)
  })

  await t.test('required field validated: empty role rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie },
      payload: { userId: admin.id, role: '' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid userId rejected — a real user who is NOT an authorized project participant', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie },
      payload: { userId: outsider.id, role: 'Plumber' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('duplicate active assignment rejected (409)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie },
      payload: { userId: viewer.id, role: 'Site Supervisor' },
    })
    assert.equal(res.statusCode, 409)
  })

  await t.test('owner can edit role', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: ownerCookie },
      payload: { role: 'Lead Electrician' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.member.role, 'Lead Electrician')
  })

  await t.test('viewer-role member CANNOT edit role (mutation role required)', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: viewerCookie },
      payload: { role: 'Something Else' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('outsider cannot remove', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('owner can remove (soft-remove)', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 204)
  })

  await t.test('removed row persists with status removed and removedAt set (soft-delete, not a hard DELETE)', async () => {
    const rows = await getDb(env!).select().from(projectWorkforceMembers)
      .where(eq(projectWorkforceMembers.id, memberRowId))
    assert.equal(rows.length, 1)
    assert.equal(rows[0].status, 'removed')
    assert.ok(rows[0].removedAt)
  })

  await t.test('removed member no longer appears in the active list', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json().data.members, [])
  })

  await t.test('removing an already-removed row returns 404', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/workforce/${memberRowId}`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('re-adding the same person after removal succeeds (new row, history preserved)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: ownerCookie },
      payload: { userId: viewer.id, role: 'Electrician' },
    })
    assert.equal(res.statusCode, 201)
    assert.notEqual(res.json().data.member.id, memberRowId)
  })

  await t.test('cross-organization isolation: Org B member cannot list Org A project workforce', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgBRes.statusCode, 201)
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: orgBCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('TABLE C: a suspended admin loses workforce mutation access; reactivating restores it', async () => {
    const db = getDb(env!)
    await db.update(organizationMembers).set({ status: 'suspended' }).where(eq(organizationMembers.userId, admin.id))

    // Target is admin's own (active-org-member) id — while admin is
    // suspended the actor-level mutation check must fail first, before
    // the target-participant check is ever reached.
    const whileSuspended = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: adminCookie },
      payload: { userId: admin.id, role: 'Site Engineer' },
    })
    assert.equal(whileSuspended.statusCode, 404)

    await db.update(organizationMembers).set({ status: 'active' }).where(eq(organizationMembers.userId, admin.id))
    const afterReactivate = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/workforce`, headers: { cookie: adminCookie },
      payload: { userId: admin.id, role: 'Site Engineer' },
    })
    assert.equal(afterReactivate.statusCode, 201)
  })
})
