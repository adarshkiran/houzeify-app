// ─── House Requirements route tests — 12H-C / C13 ──────────────────────────
// Real database-backed, via app.inject(). C13: authorization is org-aware
// (requireProjectAccess / requireProjectMutation), not creator-only.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

const VALID_REQUIREMENTS = {
  buildingType: 'independent-house',
  builtUpArea: 2400,
  floors: 'G+1',
  finishLevel: 'standard',
}

test('house requirements: 1:1 with project, owner-scoped access, upsert, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const userA = await createTestUser(env!)
  const cookieA = sessionCookieHeader(await createTestSessionToken(env!, userA.id))
  const userB = await createTestUser(env!)
  const cookieB = sessionCookieHeader(await createTestSessionToken(env!, userB.id))

  let projectAId = ''
  let projectBId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, userA.id)
    await cleanupTestUser(env!, userB.id)
    await closeDb()
  })

  await t.test('setup: User A creates Project A', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: cookieA },
      payload: { name: uniqueName('Project A'), type: 'new-build' },
    })
    assert.equal(res.statusCode, 201)
    projectAId = res.json().data.project.id
  })

  await t.test('unauthenticated GET is rejected', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}/requirements` })
    assert.equal(res.statusCode, 401)
  })

  await t.test('unauthenticated PUT is rejected', async () => {
    const res = await app.inject({ method: 'PUT', url: `/api/v1/projects/${projectAId}/requirements`, payload: VALID_REQUIREMENTS })
    assert.equal(res.statusCode, 401)
  })

  await t.test('GET before any PUT is an honest 404 (no requirements yet)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}/requirements`, headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('PUT cannot target a nonexistent project', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/v1/projects/00000000-0000-0000-0000-000000000000/requirements',
      headers: { cookie: cookieA },
      payload: VALID_REQUIREMENTS,
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('User A creates requirements for Project A — a client-supplied projectId/ownerId never takes effect', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectAId}/requirements`,
      headers: { cookie: cookieA },
      payload: { ...VALID_REQUIREMENTS, plotArea: 3000, bedrooms: 3, specialRequirements: ['pooja-room', 'lift'], projectId: 'not-real', ownerId: userB.id },
    })
    assert.equal(res.statusCode, 200)
    const reqs = res.json().data.houseRequirements
    assert.equal(reqs.projectId, projectAId, 'projectId always resolved from the URL, never the body')
    assert.equal(reqs.builtUpArea, 2400)
    assert.equal(reqs.plotArea, 3000)
    assert.equal(reqs.bedrooms, 3)
    assert.deepEqual(reqs.specialRequirements, ['pooja-room', 'lift'])
    assert.equal(reqs.hasLivingRoom, true)
    assert.equal(reqs.hasUtilityArea, false)
  })

  await t.test('User A reads back the persisted requirements', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}/requirements`, headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.houseRequirements.builtUpArea, 2400)
  })

  await t.test('User B cannot GET Project A requirements (404, not 403)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}/requirements`, headers: { cookie: cookieB } })
    assert.equal(res.statusCode, 404)
  })

  await t.test("User B's PUT does not modify Project A's requirements", async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectAId}/requirements`,
      headers: { cookie: cookieB },
      payload: { ...VALID_REQUIREMENTS, builtUpArea: 9999 },
    })
    assert.equal(res.statusCode, 404)

    const check = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}/requirements`, headers: { cookie: cookieA } })
    assert.equal(check.json().data.houseRequirements.builtUpArea, 2400)
  })

  await t.test('revisiting: a second PUT for the same project updates in place — exactly one row, never a duplicate', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectAId}/requirements`,
      headers: { cookie: cookieA },
      payload: { ...VALID_REQUIREMENTS, builtUpArea: 2800, finishLevel: 'premium' },
    })
    assert.equal(res.statusCode, 200)
    const updated = res.json().data.houseRequirements
    assert.equal(updated.builtUpArea, 2800)
    assert.equal(updated.finishLevel, 'premium')

    const list = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}/requirements`, headers: { cookie: cookieA } })
    assert.equal(list.json().data.houseRequirements.builtUpArea, 2800)
  })

  await t.test('invalid payload (missing required field) is rejected with 400', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectAId}/requirements`,
      headers: { cookie: cookieA },
      payload: { buildingType: 'independent-house', floors: 'G+1', finishLevel: 'standard' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('invalid enum value is rejected with 400', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectAId}/requirements`,
      headers: { cookie: cookieA },
      payload: { ...VALID_REQUIREMENTS, buildingType: 'castle' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('malformed project id is rejected with 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects/not-a-uuid/requirements', headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('multiple projects: User A creates Project B with its own, separate requirements', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: cookieA },
      payload: { name: uniqueName('Project B'), type: 'new-build' },
    })
    projectBId = createRes.json().data.project.id

    const putRes = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectBId}/requirements`,
      headers: { cookie: cookieA },
      payload: { ...VALID_REQUIREMENTS, builtUpArea: 1500, buildingType: 'apartment' },
    })
    assert.equal(putRes.statusCode, 200)

    const [getA, getB] = await Promise.all([
      app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}/requirements`, headers: { cookie: cookieA } }),
      app.inject({ method: 'GET', url: `/api/v1/projects/${projectBId}/requirements`, headers: { cookie: cookieA } }),
    ])
    assert.equal(getA.json().data.houseRequirements.builtUpArea, 2800)
    assert.equal(getB.json().data.houseRequirements.builtUpArea, 1500)
    assert.equal(getB.json().data.houseRequirements.buildingType, 'apartment')
  })
})

test('house requirements C13: org-aware access, inactive denied, cross-org denied', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const creator = await createTestUser(env!)
  const creatorCookie = sessionCookieHeader(await createTestSessionToken(env!, creator.id))
  const adminMember = await createTestUser(env!)
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, adminMember.id))
  const viewerMember = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewerMember.id))
  const inactiveMember = await createTestUser(env!)
  const inactiveCookie = sessionCookieHeader(await createTestSessionToken(env!, inactiveMember.id))
  const orgBUser = await createTestUser(env!)
  const orgBCookie = sessionCookieHeader(await createTestSessionToken(env!, orgBUser.id))
  const customer = await createTestUser(env!)
  const customerCookie = sessionCookieHeader(await createTestSessionToken(env!, customer.id))

  const users = [creator, adminMember, viewerMember, inactiveMember, orgBUser, customer]
  let projectId = ''
  let organizationId = ''

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup: org project + members', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: creatorCookie },
      payload: { name: uniqueName('HR Org') },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    const now = new Date()
    await getDb(env!).insert(organizationMembers).values([
      { organizationId, userId: adminMember.id, role: 'admin', status: 'active', joinedAt: now },
      { organizationId, userId: viewerMember.id, role: 'viewer', status: 'active', joinedAt: now },
      { organizationId, userId: inactiveMember.id, role: 'admin', status: 'suspended', joinedAt: now },
    ])

    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: creatorCookie },
      payload: { name: uniqueName('HR Site'), organizationId, type: 'new-build' },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id

    // Seed requirements as creator so GET tests have a row.
    const putRes = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: creatorCookie },
      payload: VALID_REQUIREMENTS,
    })
    assert.equal(putRes.statusCode, 200)

    // Org B exists but is unrelated.
    const orgBRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Other Org') },
    })
    assert.equal(orgBRes.statusCode, 201)
  })

  await t.test('active org admin can GET and PUT requirements (non-creator)', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: adminCookie },
    })
    assert.equal(getRes.statusCode, 200)
    assert.equal(getRes.json().data.houseRequirements.builtUpArea, 2400)

    const putRes = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: adminCookie },
      payload: { ...VALID_REQUIREMENTS, builtUpArea: 2600 },
    })
    assert.equal(putRes.statusCode, 200)
    assert.equal(putRes.json().data.houseRequirements.builtUpArea, 2600)
  })

  await t.test('active org viewer can GET but cannot PUT (mutation roles only)', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: viewerCookie },
    })
    assert.equal(getRes.statusCode, 200)

    const putRes = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: viewerCookie },
      payload: { ...VALID_REQUIREMENTS, builtUpArea: 9999 },
    })
    assert.equal(putRes.statusCode, 404)

    const check = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: creatorCookie },
    })
    assert.equal(check.json().data.houseRequirements.builtUpArea, 2600)
  })

  await t.test('suspended org member is denied GET and PUT (404)', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: inactiveCookie },
    })
    assert.equal(getRes.statusCode, 404)

    const putRes = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: inactiveCookie },
      payload: VALID_REQUIREMENTS,
    })
    assert.equal(putRes.statusCode, 404)
  })

  await t.test('unrelated organization member is denied (404)', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: orgBCookie },
    })
    assert.equal(getRes.statusCode, 404)

    const putRes = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: orgBCookie },
      payload: VALID_REQUIREMENTS,
    })
    assert.equal(putRes.statusCode, 404)
  })

  await t.test('customer (no company access) is denied house requirements (404)', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/requirements`,
      headers: { cookie: customerCookie },
    })
    assert.equal(getRes.statusCode, 404)
  })

  await t.test('project UUID tampering remains 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/projects/00000000-0000-4000-8000-000000000099/requirements',
      headers: { cookie: adminCookie },
    })
    assert.equal(res.statusCode, 404)
  })
})
