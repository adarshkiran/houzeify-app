// ─── Construction Task route tests — Module 05 ──────────────────────────────
// Real database-backed, via app.inject(). Mirrors dailyProgress.test.ts's
// exact structure: creator access, org-member-can-create (including a
// viewer), creator-or-mutation-role for update/delete, outsider blocked
// everywhere with 404 (not 403), invalid id/stage/status/priority/assignee
// rejected, and an explicit cross-organization isolation check.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('construction tasks: create/list/update/delete, organization authorization, validation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
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
  let taskId = ''

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

  await t.test('unauthenticated create is rejected', async () => {
    const res = await app.inject({ method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, payload: { title: 'x' } })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider cannot list (404, not 403)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('outsider cannot create', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: outsiderCookie },
      payload: { title: 'Outsider task' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member CAN create (broad create boundary, matches daily progress)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: viewerCookie },
      payload: { title: 'Install first-floor conduit', priority: 'high', stage: 'mep' },
    })
    assert.equal(res.statusCode, 201)
    const task = res.json().data.task
    assert.equal(task.title, 'Install first-floor conduit')
    assert.equal(task.status, 'todo')
    assert.equal(task.createdBy, viewer.id)
    taskId = task.id
  })

  await t.test('owner can list and sees the viewer-created task', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    const tasks = res.json().data.tasks
    assert.equal(tasks.length, 1)
    assert.equal(tasks[0].id, taskId)
  })

  await t.test('required field validated: empty title rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie },
      payload: { title: '' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid stage rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie },
      payload: { title: 'x', stage: 'not-a-real-stage' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid status rejected on patch', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: ownerCookie },
      payload: { status: 'not-a-real-status' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid priority rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie },
      payload: { title: 'x', priority: 'urgent' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid assignee rejected — a real user who is NOT an authorized project participant', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: ownerCookie },
      payload: { assigneeId: outsider.id },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('valid assignee (real org member) accepted', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: ownerCookie },
      payload: { assigneeId: admin.id },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.task.assigneeId, admin.id)
  })

  await t.test('outsider cannot update', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: outsiderCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer (creator) can update their own task', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: viewerCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.task.status, 'in_progress')
  })

  await t.test('admin (mutation role, not creator) can also update', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: adminCookie },
      payload: { status: 'blocked' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.task.status, 'blocked')
  })

  await t.test('outsider cannot delete', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('malformed project id rejected (400, not a raw DB error)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects/not-a-uuid/tasks', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('malformed task id rejected', async () => {
    const res = await app.inject({ method: 'PATCH', url: `/api/v1/projects/${projectId}/tasks/not-a-uuid`, headers: { cookie: ownerCookie }, payload: { status: 'completed' } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('cross-organization isolation: Organization B user gets 404 on Organization A project tasks', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgBRes.statusCode, 201)
    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: orgBCookie } })
    assert.equal(listRes.statusCode, 404)
    const createRes = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: orgBCookie },
      payload: { title: 'Should not be created' },
    })
    assert.equal(createRes.statusCode, 404)
  })

  await t.test('creator (viewer) can delete their own task', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/tasks/${taskId}`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 204)
    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/tasks`, headers: { cookie: ownerCookie } })
    assert.equal(listRes.json().data.tasks.length, 0)
  })
})
