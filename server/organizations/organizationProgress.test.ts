import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('C19 organization progress-summary: membership, isolation, aggregates', { skip: !env && 'DATABASE_URL not configured' }, async t => {
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

  await t.test('setup two orgs with progress on org A only', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C19 Org A'), type: 'construction-company' },
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
      payload: { name: uniqueName('C19 Org B'), type: 'construction-company' },
    })
    assert.equal(orgBRes.statusCode, 201)
    organizationBId = orgBRes.json().data.organization.id

    const projectA = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C19 Villa A'),
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
        name: uniqueName('C19 Empty'),
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
        name: uniqueName('C19 Villa B'),
        organizationId: organizationBId,
        stage: 'masonry',
        status: 'active',
      },
    })
    assert.equal(projectB.statusCode, 201)
    projectBId = projectB.json().data.project.id

    const progressInternal = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: {
        date: '2026-09-20',
        title: 'Internal slab pour',
        stage: 'structure',
      },
    })
    assert.equal(progressInternal.statusCode, 201)

    const progressShared = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: {
        date: '2026-09-21',
        title: 'Shared shuttering update',
        stage: 'structure',
      },
    })
    assert.equal(progressShared.statusCode, 201)
    const sharedId = progressShared.json().data.progress.id
    const publish = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectAId}/daily-progress/${sharedId}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(publish.statusCode, 200)

    const foreignProgress = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectBId}/daily-progress`,
      headers: { cookie: ownerBCookie },
      payload: {
        date: '2026-09-22',
        title: 'Other org update',
        stage: 'masonry',
      },
    })
    assert.equal(foreignProgress.statusCode, 201)
  })

  await t.test('unauthenticated → 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/progress-summary`,
    })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/progress-summary`,
      headers: { cookie: outsiderCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('cross-organization → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationBId}/progress-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('malformed organization id → 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/organizations/not-a-uuid/progress-summary',
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 400)
    assert.equal(res.json().error.code, 'INVALID_ID')
  })

  await t.test('owner summary aggregates only this org and ranks by latest date', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/progress-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.organizationId, organizationId)
    assert.equal(summary.totals.projectCount, 2)
    assert.equal(summary.totals.projectsWithUpdates, 1)
    assert.equal(summary.totals.updateCount, 2)
    assert.equal(summary.totals.sharedWithCustomerCount, 1)
    assert.equal(summary.projects.length, 2)
    assert.ok(!summary.projects.some((p: { id: string }) => p.id === projectBId))

    const withUpdates = summary.projects.find((p: { id: string }) => p.id === projectAId)
    assert.ok(withUpdates)
    assert.equal(withUpdates.updateCount, 2)
    assert.equal(withUpdates.sharedWithCustomerCount, 1)
    assert.equal(withUpdates.latestUpdate.title, 'Shared shuttering update')
    assert.equal(withUpdates.latestUpdate.visibility, 'customer')
    assert.equal(summary.projects[0].id, projectAId)
  })

  await t.test('viewer member can read progress summary', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/progress-summary`,
      headers: { cookie: viewerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.summary.totals.updateCount, 2)
  })
})
