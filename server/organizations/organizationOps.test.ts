import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('C23 organization ops-summary: membership, open work fields, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
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
  let projectEmptyId = ''
  let projectBId = ''
  let openTaskId = ''
  let openIssueId = ''

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup orgs, projects, tasks, issues', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C23 Org A'), type: 'construction-company' },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    await getDb(env!).insert(organizationMembers).values({
      organizationId,
      userId: viewer.id,
      role: 'viewer',
      status: 'active',
      joinedAt: new Date(),
    })

    const orgBRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerBCookie },
      payload: { name: uniqueName('C23 Org B'), type: 'construction-company' },
    })
    assert.equal(orgBRes.statusCode, 201)
    organizationBId = orgBRes.json().data.organization.id

    const projectA = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C23 Villa A'),
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
        name: uniqueName('C23 Quiet Site'),
        organizationId,
        stage: 'foundation',
        status: 'active',
      },
    })
    assert.equal(projectEmpty.statusCode, 201)
    projectEmptyId = projectEmpty.json().data.project.id

    const projectB = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerBCookie },
      payload: {
        name: uniqueName('C23 Villa B'),
        organizationId: organizationBId,
        stage: 'masonry',
        status: 'active',
      },
    })
    assert.equal(projectB.statusCode, 201)
    projectBId = projectB.json().data.project.id

    const openTask = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/tasks`,
      headers: { cookie: ownerCookie },
      payload: { title: 'C23 open slab pour', priority: 'high', status: 'in_progress' },
    })
    assert.equal(openTask.statusCode, 201)
    openTaskId = openTask.json().data.task.id

    const doneTask = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/tasks`,
      headers: { cookie: ownerCookie },
      payload: { title: 'C23 completed setup', status: 'completed' },
    })
    assert.equal(doneTask.statusCode, 201)

    const openIssue = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/issues`,
      headers: { cookie: ownerCookie },
      payload: { title: 'C23 waterproofing leak', priority: 'high' },
    })
    assert.equal(openIssue.statusCode, 201)
    openIssueId = openIssue.json().data.issue.id

    const resolvedIssue = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/issues`,
      headers: { cookie: ownerCookie },
      payload: { title: 'C23 resolved crack', priority: 'low' },
    })
    assert.equal(resolvedIssue.statusCode, 201)
    const resolvedId = resolvedIssue.json().data.issue.id
    const resolve = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectAId}/issues/${resolvedId}`,
      headers: { cookie: ownerCookie },
      payload: { status: 'resolved' },
    })
    assert.equal(resolve.statusCode, 200)

    const orgBTask = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectBId}/tasks`,
      headers: { cookie: ownerBCookie },
      payload: { title: 'Org B secret task' },
    })
    assert.equal(orgBTask.statusCode, 201)
  })

  await t.test('unauthenticated → 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/ops-summary`,
    })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/ops-summary`,
      headers: { cookie: outsiderCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('invalid organization id → 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/organizations/not-a-uuid/ops-summary',
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('cross-organization access → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationBId}/ops-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member can read ops summary', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/ops-summary`,
      headers: { cookie: viewerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.organizationId, organizationId)
    assert.equal(summary.totals.projectCount, 2)
    assert.equal(summary.totals.projectsWithOpenWork, 1)
    assert.equal(summary.totals.openTasks, 1)
    assert.equal(summary.totals.openIssues, 1)
    assert.equal(summary.totals.highOpenIssues, 1)

    const villa = summary.projects.find((p: { id: string }) => p.id === projectAId)
    assert.ok(villa)
    assert.equal(villa.openTaskCount, 1)
    assert.equal(villa.openIssueCount, 1)
    assert.equal(villa.highOpenIssueCount, 1)
    assert.equal(villa.openTasks[0].id, openTaskId)
    assert.equal(villa.openTasks[0].title, 'C23 open slab pour')
    assert.equal(villa.openTasks[0].status, 'in_progress')
    assert.equal(villa.openIssues[0].id, openIssueId)
    assert.equal(villa.openIssues[0].priority, 'high')

    const quiet = summary.projects.find((p: { id: string }) => p.id === projectEmptyId)
    assert.ok(quiet)
    assert.equal(quiet.openTaskCount, 0)
    assert.equal(quiet.openIssueCount, 0)

    assert.equal(
      summary.projects.some((p: { id: string }) => p.id === projectBId),
      false,
    )
    assert.equal(JSON.stringify(summary).includes('Org B secret task'), false)
    assert.equal(JSON.stringify(summary).includes('C23 completed setup'), false)
    assert.equal(JSON.stringify(summary).includes('C23 resolved crack'), false)
  })

  await t.test('owner can read and open-work-first sort puts busy project first', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/ops-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.projects[0].id, projectAId)
  })

  await t.test('completing the open task removes it from summary', async () => {
    const complete = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectAId}/tasks/${openTaskId}`,
      headers: { cookie: ownerCookie },
      payload: { status: 'completed' },
    })
    assert.equal(complete.statusCode, 200)

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/ops-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.totals.openTasks, 0)
    const villa = summary.projects.find((p: { id: string }) => p.id === projectAId)
    assert.equal(villa.openTaskCount, 0)
    assert.equal(villa.openIssueCount, 1)
  })

  await t.test('C19–C22 summaries still work (regression)', async () => {
    for (const path of ['progress-summary', 'reports-summary', 'workforce-summary', 'documents-summary']) {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/organizations/${organizationId}/${path}`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(res.statusCode, 200, path)
      assert.equal(res.json().data.summary.organizationId, organizationId, path)
    }
  })
})
