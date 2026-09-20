// ─── Customer profile route tests — 12G-B ──────────────────────────────────
// Real database-backed integration tests via Fastify's own app.inject()
// (no HTTP server actually bound) — skipped cleanly, never faked, when
// DATABASE_URL isn't configured (see testUtils.loadTestEnv).

import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { buildApp } from '../app.js'
import { closeDb } from '../db/client.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader } from '../testUtils.js'

const env = loadTestEnv()

test('customer profile: create, read, update, duplicate rejection, ownership, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const userA = await createTestUser(env!)
  const tokenA = await createTestSessionToken(env!, userA.id)
  const cookieA = sessionCookieHeader(tokenA)
  const userB = await createTestUser(env!)
  const tokenB = await createTestSessionToken(env!, userB.id)
  const cookieB = sessionCookieHeader(tokenB)

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, userA.id)
    await cleanupTestUser(env!, userB.id)
    // Releases the postgres.js connection pool — getDb() caches it at
    // module scope, independent of app.close(), and its open sockets
    // otherwise keep this test process alive indefinitely after all tests
    // finish (discovered the hard way: the very first full test run hung).
    await closeDb()
  })

  await t.test('unauthenticated GET is rejected', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/customer-profile' })
    assert.equal(res.statusCode, 401)
  })

  await t.test('GET before creation is 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/customer-profile', headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('client-supplied userId in the body never takes effect — silently stripped, ownership still comes from the session', async () => {
    // Fastify's default AJV config sets removeAdditional:true, which — combined
    // with additionalProperties:false — silently strips an unlisted property
    // rather than raising a 400 for it. The request still succeeds; what
    // matters is that the created profile's userId is userA's real session
    // identity, never the injected userB.id.
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: cookieA },
      payload: { fullName: 'Test Homeowner', preferredName: 'Tester', location: 'Hyderabad', userId: userB.id },
    })
    assert.equal(res.statusCode, 201)
    const body = res.json()
    assert.equal(body.data.customerProfile.userId, userA.id, 'ownership is the authenticated session, never the injected userId')
    assert.notEqual(body.data.customerProfile.userId, userB.id)
    assert.equal(body.data.customerProfile.fullName, 'Test Homeowner')
  })

  await t.test('duplicate creation is rejected', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: cookieA },
      payload: { fullName: 'Second Attempt' },
    })
    assert.equal(res.statusCode, 409)
  })

  await t.test('authenticated user reads their own profile', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/customer-profile', headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.customerProfile.fullName, 'Test Homeowner')
  })

  await t.test('authenticated user updates their own profile', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/customer-profile',
      headers: { cookie: cookieA },
      payload: { preferredName: 'Updated Name' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.customerProfile.preferredName, 'Updated Name')
    // Untouched fields survive a partial PATCH.
    assert.equal(res.json().data.customerProfile.fullName, 'Test Homeowner')
  })

  await t.test('User B cannot read User A profile via /customer-profile — it is always "my own"', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/customer-profile', headers: { cookie: cookieB } })
    // User B has no profile of their own — proves the endpoint is scoped to
    // request.user.id, never able to return User A's data to User B.
    assert.equal(res.statusCode, 404)
    const bodyA = await app.inject({ method: 'GET', url: '/api/v1/customer-profile', headers: { cookie: cookieA } })
    assert.equal(bodyA.json().data.customerProfile.userId, userA.id)
  })
})
