import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { eq } from 'drizzle-orm'
import { organizationMembers, partnerProfiles, projects } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'
import { USER_NOT_FOUND_MESSAGE } from './projectCustomer.types.js'

const env = loadTestEnv()

test('project customer: invite, get, replace, accept, list, remove', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const customer = await createTestUser(env!)
  const customerCookie = sessionCookieHeader(await createTestSessionToken(env!, customer.id))
  const customerB = await createTestUser(env!)
  const customerBCookie = sessionCookieHeader(await createTestSessionToken(env!, customerB.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const partnerOnly = await createTestUser(env!)
  const homeowner = await createTestUser(env!)
  const homeownerCookie = sessionCookieHeader(await createTestSessionToken(env!, homeowner.id))

  const users = [owner, viewer, customer, customerB, outsider, partnerOnly, homeowner]
  let organizationId = ''
  let projectId = ''
  let soloProjectId = ''
  const customerEmail = `cust-${uniqueName('m08').replace(' ', '-')}@example.com`
  const customerBEmail = `custb-${uniqueName('m08').replace(' ', '-')}@example.com`

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup org project, profiles, solo project', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Org M08') },
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

    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Villa'), organizationId, stage: 'foundation' },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id

    const soloRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: homeownerCookie },
      payload: { name: uniqueName('Home') },
    })
    assert.equal(soloRes.statusCode, 201)
    soloProjectId = soloRes.json().data.project.id

    const profileA = await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: customerCookie },
      payload: { fullName: 'Asha Customer', email: customerEmail },
    })
    assert.ok([200, 201].includes(profileA.statusCode), profileA.body)

    const profileB = await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: customerBCookie },
      payload: { fullName: 'Bala Customer', email: customerBEmail },
    })
    assert.ok([200, 201].includes(profileB.statusCode), profileB.body)

    await getDb(env!).insert(partnerProfiles).values({
      userId: partnerOnly.id,
      professionalType: 'architect',
      fullName: 'Partner Only',
      accountType: 'individual',
    })
  })

  await t.test('invite happy path is invited', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email: customerEmail.toUpperCase() },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.customer.status, 'invited')
    assert.equal(res.json().data.customer.userId, customer.id)
  })

  await t.test('company can get the pending customer', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.customer.email, customerEmail)
  })

  await t.test('viewer cannot PUT', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: viewerCookie },
      payload: { email: customerBEmail },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('outsider 404', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: outsiderCookie },
      payload: { email: customerEmail },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('unknown email and partner-only share USER_NOT_FOUND copy', async () => {
    const unknown = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email: 'nobody-m08@example.com' },
    })
    assert.equal(unknown.statusCode, 404)
    assert.equal(unknown.json().error.code, 'USER_NOT_FOUND')
    assert.equal(unknown.json().error.message, USER_NOT_FOUND_MESSAGE)

    const partner = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email: 'partner-only@example.com' },
    })
    assert.equal(partner.statusCode, 404)
    assert.equal(partner.json().error.message, USER_NOT_FOUND_MESSAGE)
  })

  await t.test('org member email is ALREADY_PARTICIPANT', async () => {
    const viewerEmail = `viewer-${uniqueName('m08').replace(' ', '-')}@example.com`
    const profile = await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: viewerCookie },
      payload: { fullName: 'Viewer Person', email: viewerEmail },
    })
    assert.ok([200, 201].includes(profile.statusCode), profile.body)
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email: viewerEmail },
    })
    assert.equal(res.statusCode, 409)
    assert.equal(res.json().error.code, 'ALREADY_PARTICIPANT')
  })

  await t.test('homeowner-owned project is NOT_COMPANY_PROJECT', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${soloProjectId}/customer`,
      headers: { cookie: homeownerCookie },
      payload: { email: customerEmail },
    })
    assert.equal(res.statusCode, 409)
    assert.equal(res.json().error.code, 'NOT_COMPANY_PROJECT')
  })

  await t.test('only invitee can accept; other user 404', async () => {
    const other = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/customer/accept`,
      headers: { cookie: customerBCookie },
    })
    assert.equal(other.statusCode, 404)

    const ok = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/customer/accept`,
      headers: { cookie: customerCookie },
    })
    assert.equal(ok.statusCode, 200)
    assert.equal(ok.json().data.customer.status, 'active')
  })

  await t.test('list as=customer includes the project; combo query 400', async () => {
    const combo = await app.inject({
      method: 'GET',
      url: `/api/v1/projects?as=customer&organizationId=${organizationId}`,
      headers: { cookie: customerCookie },
    })
    assert.equal(combo.statusCode, 400)

    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/projects?as=customer',
      headers: { cookie: customerCookie },
    })
    assert.equal(list.statusCode, 200)
    const ids = list.json().data.projects.map((p: { id: string }) => p.id)
    assert.ok(ids.includes(projectId))
    const row = list.json().data.projects.find((p: { id: string }) => p.id === projectId)
    assert.equal(row.customerStatus, 'active')
    assert.equal(row.summary, undefined)
  })

  await t.test('replace invitee then delete removes access', async () => {
    const replace = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email: customerBEmail },
    })
    assert.equal(replace.statusCode, 200)
    assert.equal(replace.json().data.customer.userId, customerB.id)
    assert.equal(replace.json().data.customer.status, 'invited')

    const del = await app.inject({
      method: 'DELETE',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(del.statusCode, 204)

    const view = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view`,
      headers: { cookie: customerBCookie },
    })
    assert.equal(view.statusCode, 404)

    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/projects?as=customer',
      headers: { cookie: customerBCookie },
    })
    const ids = list.json().data.projects.map((p: { id: string }) => p.id)
    assert.equal(ids.includes(projectId), false)
  })

  await t.test('pending invite lists as an invitation only; accept re-asserts company ownership', async () => {
    const reinvite = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email: customerBEmail },
    })
    assert.equal(reinvite.statusCode, 200)
    assert.equal(reinvite.json().data.customer.status, 'invited')

    const pending = await app.inject({
      method: 'GET',
      url: '/api/v1/projects?as=customer',
      headers: { cookie: customerBCookie },
    })
    assert.equal(pending.statusCode, 200)
    const invited = pending.json().data.projects.find((p: { id: string }) => p.id === projectId)
    assert.equal(invited.customerStatus, 'invited')
    assert.ok(invited.name)
    assert.ok(invited.organizationName)
    assert.ok(invited.invitedAt)
    for (const key of ['location', 'propertyType', 'stage', 'status', 'timelineStart', 'timelineCompletion', 'organizationId', 'acceptedAt']) {
      assert.equal(invited[key], null, key)
    }
    assert.equal(invited.summary, undefined)

    // The project stops being company-owned: accept must 404 and change nothing.
    const db = getDb(env!)
    await db.update(projects).set({ organizationId: null }).where(eq(projects.id, projectId))
    try {
      const blocked = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/customer/accept`,
        headers: { cookie: customerBCookie },
      })
      assert.equal(blocked.statusCode, 404)
    } finally {
      await db.update(projects).set({ organizationId }).where(eq(projects.id, projectId))
    }

    const accept = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/customer/accept`,
      headers: { cookie: customerBCookie },
    })
    assert.equal(accept.statusCode, 200)
    assert.equal(accept.json().data.customer.status, 'active')

    const active = await app.inject({
      method: 'GET',
      url: '/api/v1/projects?as=customer',
      headers: { cookie: customerBCookie },
    })
    const full = active.json().data.projects.find((p: { id: string }) => p.id === projectId)
    assert.equal(full.customerStatus, 'active')
    assert.equal(full.stage, 'foundation')
    assert.equal(full.organizationId, organizationId)
  })
})
