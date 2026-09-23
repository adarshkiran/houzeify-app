import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('C20 organization reports-summary: membership, C18 package fields, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const ownerB = await createTestUser(env!)
  const ownerBCookie = sessionCookieHeader(await createTestSessionToken(env!, ownerB.id))

  const users = [owner, outsider, viewer, ownerB]
  let organizationId = ''
  let organizationBId = ''
  let projectAId = ''
  let projectBId = ''

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup orgs, projects, progress, task, issue', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C20 Org A'), type: 'construction-company' },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    await getDb(env!).insert(organizationMembers).values({
      organizationId,
      userId: viewer.id,
      role: 'viewer',
      status: 'active',
    })

    const orgBRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerBCookie },
      payload: { name: uniqueName('C20 Org B'), type: 'construction-company' },
    })
    assert.equal(orgBRes.statusCode, 201)
    organizationBId = orgBRes.json().data.organization.id

    const projectA = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C20 Villa A'),
        organizationId,
        stage: 'structure',
        status: 'active',
        location: 'Bengaluru',
      },
    })
    assert.equal(projectA.statusCode, 201)
    projectAId = projectA.json().data.project.id

    const projectEmpty = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C20 Empty'),
        organizationId,
        stage: 'foundation',
        status: 'active',
      },
    })
    assert.equal(projectEmpty.statusCode, 201)

    const projectB = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerBCookie },
      payload: {
        name: uniqueName('C20 Villa B'),
        organizationId: organizationBId,
        stage: 'masonry',
        status: 'active',
      },
    })
    assert.equal(projectB.statusCode, 201)
    projectBId = projectB.json().data.project.id

    const progress = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: { date: '2026-09-21', title: 'C20 slab update', stage: 'structure' },
    })
    assert.equal(progress.statusCode, 201)
    const progressId = progress.json().data.progress.id
    const publish = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectAId}/daily-progress/${progressId}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(publish.statusCode, 200)

    const task = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/tasks`,
      headers: { cookie: ownerCookie },
      payload: { title: 'C20 open task' },
    })
    assert.equal(task.statusCode, 201)

    const issue = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/issues`,
      headers: { cookie: ownerCookie },
      payload: { title: 'C20 open issue', priority: 'high' },
    })
    assert.equal(issue.statusCode, 201)
  })

  await t.test('unauthenticated → 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/reports-summary`,
    })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/reports-summary`,
      headers: { cookie: outsiderCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('cross-organization → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationBId}/reports-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('malformed organization id → 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/organizations/not-a-uuid/reports-summary',
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 400)
    assert.equal(res.json().error.code, 'INVALID_ID')
  })

  await t.test('owner summary uses C18 package fields and ranks by stage', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/reports-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.organizationId, organizationId)
    assert.equal(summary.totals.projectCount, 2)
    assert.equal(summary.totals.progressUpdates, 1)
    assert.equal(summary.totals.sharedProgress, 1)
    assert.equal(summary.totals.openTasks, 1)
    assert.equal(summary.totals.openIssues, 1)
    assert.equal(summary.projects.length, 2)
    assert.ok(!summary.projects.some((p: { id: string }) => p.id === projectBId))

    const withWork = summary.projects.find((p: { id: string }) => p.id === projectAId)
    assert.ok(withWork)
    assert.equal(withWork.progress.totalCount, 1)
    assert.equal(withWork.progress.publishedCount, 1)
    assert.equal(withWork.operations.tasksOpen, 1)
    assert.equal(withWork.operations.issuesOpen, 1)
    assert.equal(withWork.stageName, 'Structure')
    // structure (3) ranks above foundation (2)
    assert.equal(summary.projects[0].id, projectAId)
  })

  await t.test('viewer member can read reports summary', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/reports-summary`,
      headers: { cookie: viewerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.summary.totals.projectCount, 2)
  })

  await t.test('C19 progress-summary still works on same org', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/progress-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.summary.totals.updateCount, 1)
  })
})
