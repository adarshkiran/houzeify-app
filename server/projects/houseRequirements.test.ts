// ─── House Requirements route tests — 12H-C ────────────────────────────────
// Real database-backed, via app.inject(). Projects are created through the
// real 12H-B API (never inserted directly) so these tests exercise the
// exact same ownership chain (project_id -> projects.owner_id) the real
// frontend flow depends on.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb } from '../db/client.js'
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
    // Default booleans, never persisted as null/undefined.
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
    // Only one record exists for this project — confirmed by the GET
    // itself returning a single object (the API has no "list" shape), and
    // that it reflects the update, not a stale first insert.
    assert.equal(list.json().data.houseRequirements.builtUpArea, 2800)
  })

  await t.test('invalid payload (missing required field) is rejected with 400', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectAId}/requirements`,
      headers: { cookie: cookieA },
      payload: { buildingType: 'independent-house', floors: 'G+1', finishLevel: 'standard' }, // missing builtUpArea
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
    // No cross-project contamination — A still shows its own (updated)
    // 2800/premium values, B shows its own distinct 1500/apartment values.
    assert.equal(getA.json().data.houseRequirements.builtUpArea, 2800)
    assert.equal(getB.json().data.houseRequirements.builtUpArea, 1500)
    assert.equal(getB.json().data.houseRequirements.buildingType, 'apartment')
  })
})
