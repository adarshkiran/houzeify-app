// ─── Project estimates foundation tests ────────────────────────────────────

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('project estimates: create/list/get, Version 1 draft, authorization', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

  let organizationId = ''
  let projectId = ''
  let estimateId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, viewer.id)
    await cleanupTestUser(env!, outsider.id)
    await closeDb()
  })

  await t.test('setup: org + project', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Est Org') },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    const db = getDb(env!)
    await db.insert(organizationMembers).values([
      { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
    ])

    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Est Site'), organizationId, location: 'Hyderabad, Telangana' },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id
  })

  await t.test('empty list for new project', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/estimates`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json().data.estimates, [])
  })

  await t.test('outsider list is 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/estimates`,
      headers: { cookie: outsiderCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('invalid create rejected', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/estimates`,
      headers: { cookie: ownerCookie },
      payload: { name: '', pricingMethod: 'detailed_boq' },
    })
    assert.ok(res.statusCode === 400 || res.statusCode === 422)
  })

  await t.test('viewer cannot create (mutation boundary)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/estimates`,
      headers: { cookie: viewerCookie },
      payload: { name: 'Viewer estimate', pricingMethod: 'detailed_boq' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('owner creates estimate with Detailed BOQ — Version 1 Draft', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/estimates`,
      headers: { cookie: ownerCookie },
      payload: { name: 'Foundation estimate', pricingMethod: 'detailed_boq' },
    })
    assert.equal(res.statusCode, 201)
    const estimate = res.json().data.estimate
    estimateId = estimate.id
    assert.equal(estimate.name, 'Foundation estimate')
    assert.equal(estimate.status, 'draft')
    assert.equal(estimate.pricingMethod, 'detailed_boq')
    assert.equal(estimate.projectId, projectId)
    assert.equal(estimate.organizationId, organizationId)
    assert.equal(estimate.location, 'Hyderabad, Telangana')
    assert.equal(estimate.currency, 'INR')
    assert.equal(estimate.totalAmount, null)
    assert.equal(estimate.currentVersionNumber, 1)
    assert.equal(estimate.currentVersion?.versionNumber, 1)
    assert.equal(estimate.currentVersion?.status, 'draft')
    assert.equal(estimate.itemCount, 0)
  })

  await t.test('list returns created estimate', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/estimates`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const list = res.json().data.estimates
    assert.equal(list.length, 1)
    assert.equal(list[0].id, estimateId)
    assert.equal(list[0].pricingMethod, 'detailed_boq')
    assert.equal(list[0].totalAmount, null)
  })

  await t.test('get estimate by id', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/estimates/${estimateId}`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.estimate.id, estimateId)
  })

  await t.test('viewer can list (read access)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/estimates`,
      headers: { cookie: viewerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.estimates.length, 1)
  })

  await t.test('outsider cannot get estimate', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/estimates/${estimateId}`,
      headers: { cookie: outsiderCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('pricing method rate_per_sqft persists', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/estimates`,
      headers: { cookie: ownerCookie },
      payload: { name: 'Sqft estimate', pricingMethod: 'rate_per_sqft', areaSqft: 2000 },
    })
    assert.equal(res.statusCode, 201)
    assert.equal(res.json().data.estimate.pricingMethod, 'rate_per_sqft')
    assert.equal(res.json().data.estimate.areaSqft, 2000)
  })
})
