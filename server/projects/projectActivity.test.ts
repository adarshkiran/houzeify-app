import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb } from '../db/client.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('C24 project activity: chronology, audience, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const customer = await createTestUser(env!)
  const customerCookie = sessionCookieHeader(await createTestSessionToken(env!, customer.id))
  const invited = await createTestUser(env!)
  const invitedCookie = sessionCookieHeader(await createTestSessionToken(env!, invited.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const ownerB = await createTestUser(env!)
  const ownerBCookie = sessionCookieHeader(await createTestSessionToken(env!, ownerB.id))

  const users = [owner, customer, invited, outsider, ownerB]
  let organizationId = ''
  let projectId = ''
  let projectBId = ''
  let inviteProjectId = ''
  const customerEmail = `c24-${uniqueName('cust').replace(' ', '-')}@example.com`
  const invitedEmail = `c24-${uniqueName('inv').replace(' ', '-')}@example.com`

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup project with progress, task, issue, customers', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: customerCookie },
      payload: { fullName: 'C24 Customer', email: customerEmail },
    })
    await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: invitedCookie },
      payload: { fullName: 'C24 Invited', email: invitedEmail },
    })

    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C24 Org') },
    })
    organizationId = orgRes.json().data.organization.id

    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C24 Villa'),
        organizationId,
        type: 'new-build',
        stage: 'structure',
        status: 'active',
      },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id

    const sharedProgress = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: { date: '2026-09-23', title: 'C24 slab pour update' },
    })
    assert.equal(sharedProgress.statusCode, 201)
    const shareProgress = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}/daily-progress/${sharedProgress.json().data.progress.id}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(shareProgress.statusCode, 200)

    const internalProgress = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: { date: '2026-09-22', title: 'C24 internal note' },
    })
    assert.equal(internalProgress.statusCode, 201)

    const taskRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/tasks`,
      headers: { cookie: ownerCookie },
      payload: { title: 'C24 pour slab', priority: 'high', status: 'in_progress' },
    })
    assert.equal(taskRes.statusCode, 201)

    const issueRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/issues`,
      headers: { cookie: ownerCookie },
      payload: { title: 'C24 water seepage', priority: 'high' },
    })
    assert.equal(issueRes.statusCode, 201)

    // Accepted customer
    const invite = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email: customerEmail },
    })
    assert.equal(invite.statusCode, 200)
    const accept = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/customer/accept`,
      headers: { cookie: customerCookie },
    })
    assert.equal(accept.statusCode, 200)

    // Separate project for invited-only denial (one customer per project)
    const inviteProject = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C24 Invite Villa'),
        organizationId,
        type: 'new-build',
      },
    })
    assert.equal(inviteProject.statusCode, 201)
    inviteProjectId = inviteProject.json().data.project.id
    const inviteOnly = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${inviteProjectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email: invitedEmail },
    })
    assert.equal(inviteOnly.statusCode, 200)

    const orgB = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerBCookie },
      payload: { name: uniqueName('C24 Other Org') },
    })
    assert.equal(orgB.statusCode, 201)
    const projectB = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerBCookie },
      payload: {
        name: uniqueName('C24 Other Villa'),
        organizationId: orgB.json().data.organization.id,
        type: 'new-build',
      },
    })
    assert.equal(projectB.statusCode, 201)
    projectBId = projectB.json().data.project.id
  })

  await t.test('unauthenticated → 401', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/activity` })
    assert.equal(res.statusCode, 401)
  })

  await t.test('invalid project id → 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/projects/not-a-uuid/activity',
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('outsider → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/activity`,
      headers: { cookie: outsiderCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('cross-project → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectBId}/activity`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('company activity includes task, issue, shared + internal progress', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/activity`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const activity = res.json().data.activity
    assert.equal(activity.audience, 'company')
    const titles = activity.events.map((e: { title: string }) => e.title)
    assert.ok(titles.includes('C24 pour slab'))
    assert.ok(titles.includes('C24 water seepage'))
    assert.ok(titles.includes('C24 slab pour update'))
    assert.ok(titles.includes('C24 internal note'))
    const kinds = new Set(activity.events.map((e: { kind: string }) => e.kind))
    assert.ok(kinds.has('task'))
    assert.ok(kinds.has('issue'))
    assert.ok(kinds.has('progress'))
    for (let i = 1; i < activity.events.length; i++) {
      assert.ok(
        new Date(activity.events[i - 1].occurredAt).getTime() >= new Date(activity.events[i].occurredAt).getTime(),
      )
    }
  })

  await t.test('customer activity is shared-only (no tasks/issues/internal progress)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/activity`,
      headers: { cookie: customerCookie },
    })
    assert.equal(res.statusCode, 200)
    const activity = res.json().data.activity
    assert.equal(activity.audience, 'customer')
    const titles = activity.events.map((e: { title: string }) => e.title)
    assert.ok(titles.includes('C24 slab pour update'))
    assert.ok(!titles.includes('C24 internal note'))
    assert.ok(!titles.includes('C24 pour slab'))
    assert.ok(!titles.includes('C24 water seepage'))
    const kinds = new Set(activity.events.map((e: { kind: string }) => e.kind))
    assert.ok(!kinds.has('task'))
    assert.ok(!kinds.has('issue'))
  })

  await t.test('invited (not accepted) customer → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${inviteProjectId}/activity`,
      headers: { cookie: invitedCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('C23 ops-summary still works (regression)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/ops-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.ok(res.json().data.summary.totals.openTasks >= 1)
  })
})
