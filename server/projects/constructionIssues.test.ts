// ─── Construction Issue route tests — Module 05 ─────────────────────────────
// Same structure as constructionTasks.test.ts, plus Issue-specific coverage:
// resolvedAt is server-controlled (a client-supplied value in the request
// body has no effect — rejected by the schema, additionalProperties:false).

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('construction issues: create/list/update/delete, organization authorization, validation, server-controlled resolvedAt', { skip: !env && 'DATABASE_URL not configured' }, async t => {
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
  let issueId = ''

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
      payload: { name: uniqueName('Org A2') },
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
      payload: { name: uniqueName('Site A2'), organizationId },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id
  })

  await t.test('outsider cannot list (404)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('outsider cannot create', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: outsiderCookie },
      payload: { title: 'Outsider issue' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member CAN report an issue', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: viewerCookie },
      payload: { title: 'Waterproofing leakage near north bathroom wall', priority: 'high', stage: 'plastering' },
    })
    assert.equal(res.statusCode, 201)
    const issue = res.json().data.issue
    assert.equal(issue.status, 'open')
    assert.equal(issue.reportedBy, viewer.id)
    assert.equal(issue.resolvedAt, null)
    issueId = issue.id
  })

  await t.test('owner can list and sees the reported issue', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.issues.length, 1)
  })

  await t.test('required field validated: empty title rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: ownerCookie },
      payload: { title: '' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid stage rejected', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: ownerCookie },
      payload: { title: 'x', stage: 'not-a-real-stage' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid status rejected', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: ownerCookie },
      payload: { status: 'closed' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid assignee rejected', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: ownerCookie },
      payload: { assigneeId: outsider.id },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('client-supplied resolvedAt is ignored — server computes its own value, only on the transition to resolved', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: ownerCookie },
      payload: { status: 'in_progress', resolvedAt: '2020-01-01T00:00:00.000Z' },
    })
    assert.equal(res.statusCode, 200)
    const issue = res.json().data.issue
    assert.equal(issue.status, 'in_progress')
    assert.equal(issue.resolvedAt, null)
  })

  await t.test('outsider cannot update', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: outsiderCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin (mutation role) can update status to in_progress; resolvedAt stays null', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: adminCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.issue.status, 'in_progress')
    assert.equal(res.json().data.issue.resolvedAt, null)
  })

  await t.test('transitioning to resolved sets resolvedAt server-side', async () => {
    const before = Date.now()
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: adminCookie },
      payload: { status: 'resolved' },
    })
    assert.equal(res.statusCode, 200)
    const issue = res.json().data.issue
    assert.equal(issue.status, 'resolved')
    assert.ok(issue.resolvedAt)
    assert.ok(new Date(issue.resolvedAt).getTime() >= before)
  })

  await t.test('reopening a resolved issue clears resolvedAt server-side', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: adminCookie },
      payload: { status: 'in_progress' },
    })
    assert.equal(res.statusCode, 200)
    const issue = res.json().data.issue
    assert.equal(issue.status, 'in_progress')
    assert.equal(issue.resolvedAt, null)
  })

  await t.test('malformed project id rejected', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects/not-a-uuid/issues', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('malformed issue id rejected', async () => {
    const res = await app.inject({ method: 'PATCH', url: `/api/v1/projects/${projectId}/issues/not-a-uuid`, headers: { cookie: ownerCookie }, payload: { status: 'open' } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('cross-organization isolation: Organization B user gets 404', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B2') },
    })
    assert.equal(orgBRes.statusCode, 201)
    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: orgBCookie } })
    assert.equal(listRes.statusCode, 404)
    const createRes = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/issues`, headers: { cookie: orgBCookie },
      payload: { title: 'Should not be created' },
    })
    assert.equal(createRes.statusCode, 404)
  })

  await t.test('outsider cannot delete', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('creator (viewer) can delete their own reported issue', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/issues/${issueId}`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 204)
  })
})
