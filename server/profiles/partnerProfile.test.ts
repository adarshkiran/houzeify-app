// ─── Partner profile route tests — 12G-B ───────────────────────────────────
// Same real-DB, app.inject() pattern as customerProfile.test.ts.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { buildApp } from '../app.js'
import { closeDb } from '../db/client.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader } from '../testUtils.js'

const env = loadTestEnv()

test('partner profile: create, read, update, duplicate rejection, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const userA = await createTestUser(env!)
  const cookieA = sessionCookieHeader(await createTestSessionToken(env!, userA.id))
  const userB = await createTestUser(env!)
  const cookieB = sessionCookieHeader(await createTestSessionToken(env!, userB.id))

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, userA.id)
    await cleanupTestUser(env!, userB.id)
    await closeDb()
  })

  await t.test('invalid professionalType is rejected (existing 9-value taxonomy only)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/partner-profile',
      headers: { cookie: cookieA },
      payload: { professionalType: 'not-a-real-type', fullName: 'Test Pro', accountType: 'individual' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('authenticated user creates their partner profile', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/partner-profile',
      headers: { cookie: cookieA },
      payload: { professionalType: 'home-service-professional', fullName: 'Test Pro', accountType: 'individual' },
    })
    assert.equal(res.statusCode, 201)
    const body = res.json().data.partnerProfile
    assert.equal(body.userId, userA.id)
    assert.equal(body.professionalType, 'home-service-professional')
    assert.equal(body.accountType, 'individual')
  })

  await t.test('duplicate creation is rejected', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/partner-profile',
      headers: { cookie: cookieA },
      payload: { professionalType: 'general-contractor', fullName: 'Second', accountType: 'individual' },
    })
    assert.equal(res.statusCode, 409)
  })

  await t.test('authenticated user reads their own profile', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/partner-profile', headers: { cookie: cookieA } })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.partnerProfile.fullName, 'Test Pro')
  })

  await t.test('authenticated user updates their own profile', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/partner-profile',
      headers: { cookie: cookieA },
      payload: { about: 'Updated about text long enough to be meaningful.' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.partnerProfile.about, 'Updated about text long enough to be meaningful.')
  })

  await t.test('User B has no profile — proves isolation (never returns User A data)', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/partner-profile', headers: { cookie: cookieB } })
    assert.equal(res.statusCode, 404)
  })
})
