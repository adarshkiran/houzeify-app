// ─── Project route tests — 12H-B ────────────────────────────────────────────
// Real database-backed, via app.inject(). Ownership is the whole point of
// this phase, so isolation is tested exhaustively: list scoping, direct-get
// scoping, update scoping, and multi-project ordering — not just the happy
// path.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb } from '../db/client.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('projects: create, ownership, owner-scoped access, multi-project ordering, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const userA = await createTestUser(env!)
  const cookieA = sessionCookieHeader(await createTestSessionToken(env!, userA.id))
  const userB = await createTestUser(env!)
  const cookieB = sessionCookieHeader(await createTestSessionToken(env!, userB.id))

  let projectAId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, userA.id)
    await cleanupTestUser(env!, userB.id)
    await closeDb()
  })

  await t.test('unauthenticated create is rejected', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/projects', payload: { name: 'Nope' } })
    assert.equal(res.statusCode, 401)
  })

  await t.test('unauthenticated list is rejected', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects' })
    assert.equal(res.statusCode, 401)
  })

  await t.test('User A creates Project A — a client-supplied ownerId never takes effect', async () => {
    // Fastify's default AJV config silently strips an unlisted ownerId
    // rather than 400ing — the request still succeeds; what matters is
    // that the created project's real owner is the authenticated session.
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: cookieA },
      payload: { name: uniqueName('Project A'), type: 'new-build', location: 'Hyderabad, Telangana', ownerId: userB.id },
    })
    assert.equal(res.statusCode, 201)
    const project = res.json().data.project
    assert.equal(project.ownerId, userA.id, 'ownership is the authenticated session, never the injected ownerId')
    assert.notEqual(project.ownerId, userB.id)
    assert.equal(project.type, 'new-build')
    projectAId = project.id
  })

  await t.test("User A's list contains Project A", async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects', headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 200)
    const ids = res.json().data.projects.map((p: { id: string }) => p.id)
    assert.ok(ids.includes(projectAId))
  })

  await t.test("User B's list does NOT contain Project A", async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects', headers: { cookie: cookieB } })
    assert.equal(res.statusCode, 200)
    const ids = res.json().data.projects.map((p: { id: string }) => p.id)
    assert.ok(!ids.includes(projectAId))
  })

  await t.test('User B cannot directly access Project A (404, not 403 — existence not confirmed)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}`, headers: { cookie: cookieB } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('User A can directly access Project A', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}`, headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.project.id, projectAId)
  })

  await t.test("User B's PATCH does not modify Project A", async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectAId}`,
      headers: { cookie: cookieB },
      payload: { name: 'Hijacked name' },
    })
    assert.equal(res.statusCode, 404)

    const check = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}`, headers: { cookie: cookieA } })
    assert.notEqual(check.json().data.project.name, 'Hijacked name')
  })

  await t.test("User A's PATCH updates Project A, and updated_at changes", async () => {
    const before = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectAId}`, headers: { cookie: cookieA } })
    const beforeUpdatedAt = before.json().data.project.updatedAt

    await new Promise(resolve => setTimeout(resolve, 10))

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectAId}`,
      headers: { cookie: cookieA },
      payload: { name: 'Renamed Project A', stage: 'requirements-completed' },
    })
    assert.equal(res.statusCode, 200)
    const updated = res.json().data.project
    assert.equal(updated.name, 'Renamed Project A')
    assert.equal(updated.stage, 'requirements-completed')
    assert.notEqual(updated.updatedAt, beforeUpdatedAt)
  })

  await t.test('empty PATCH is rejected', async () => {
    const res = await app.inject({ method: 'PATCH', url: `/api/v1/projects/${projectAId}`, headers: { cookie: cookieA }, payload: {} })
    assert.equal(res.statusCode, 400)
  })

  await t.test('malformed project id is rejected (400, not a raw DB error)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects/not-a-uuid', headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('multiple projects: creates B and C for User A, verifies ordering (updated_at DESC)', async () => {
    const resB = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: cookieA },
      payload: { name: uniqueName('Project B') },
    })
    assert.equal(resB.statusCode, 201)
    await new Promise(resolve => setTimeout(resolve, 10))

    const resC = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: cookieA },
      payload: { name: uniqueName('Project C') },
    })
    assert.equal(resC.statusCode, 201)

    const list = await app.inject({ method: 'GET', url: '/api/v1/projects', headers: { cookie: cookieA } })
    const projects = list.json().data.projects as { id: string; updatedAt: string }[]
    // Most-recently-updated first — Project C (created/updated last) must
    // sort before Project B, which sorts before the just-renamed Project A.
    const ids = projects.map(p => p.id)
    assert.ok(ids.indexOf(resC.json().data.project.id) < ids.indexOf(resB.json().data.project.id))
    // Every project in User A's list genuinely belongs to User A only —
    // re-confirms isolation holds with more than one real project present.
    assert.equal(projects.length, 3)
  })

  await t.test("User B's list still only contains User B's own (zero) projects", async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects', headers: { cookie: cookieB } })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.projects.length, 0)
  })
})
