// ─── Organization route tests — 12G-B ──────────────────────────────────────
// Real database-backed, via app.inject(). Duplicate-membership is tested at
// the database layer directly (see the last test) — there is no API surface
// that can trigger it yet (Phase 13 deliberately excludes invitation
// acceptance), so a direct insert against the unique constraint is the
// honest way to prove it, not a guessed HTTP flow that doesn't exist.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('organizations: create, owner membership, membership-scoped access, multi-org, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

  let organizationAId = ''
  let organizationBId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, outsider.id)
    await closeDb()
  })

  await t.test('unauthenticated create is rejected', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/organizations', payload: { name: 'Nope' } })
    assert.equal(res.statusCode, 401)
  })

  await t.test('authenticated user creates Organization A — a client-supplied ownerId never takes effect, becomes owner atomically', async () => {
    // Fastify's default AJV config (removeAdditional:true +
    // additionalProperties:false) silently strips an unlisted ownerId
    // rather than 400ing for it — the request still succeeds; what matters
    // is that the created organization's real owner is the authenticated
    // session, never the injected id.
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Organization A'), type: 'family-business', ownerId: outsider.id },
    })
    assert.equal(res.statusCode, 201)
    const org = res.json().data.organization
    assert.equal(org.ownerId, owner.id, 'ownership is the authenticated session, never the injected ownerId')
    assert.notEqual(org.ownerId, outsider.id)
    organizationAId = org.id

    const members = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationAId}/members`, headers: { cookie: ownerCookie } })
    assert.equal(members.statusCode, 200)
    const rows = members.json().data.members
    assert.equal(rows.length, 1)
    assert.equal(rows[0].userId, owner.id)
    assert.equal(rows[0].role, 'owner')
    assert.equal(rows[0].status, 'active')
  })

  await t.test('organization appears in the owner\'s list', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/organizations', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    const ids = res.json().data.organizations.map((o: { id: string }) => o.id)
    assert.ok(ids.includes(organizationAId))
  })

  await t.test('member (owner) can read the organization', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationAId}`, headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
  })

  await t.test('non-member cannot read the organization (404, not 403 — existence not confirmed)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationAId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('non-member does not see the organization in their own list', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/organizations', headers: { cookie: outsiderCookie } })
    const ids = res.json().data.organizations.map((o: { id: string }) => o.id)
    assert.ok(!ids.includes(organizationAId))
  })

  await t.test('non-member cannot read the member list either', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationAId}/members`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('owner can update the organization', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationAId}`,
      headers: { cookie: ownerCookie },
      payload: { location: 'Hyderabad' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.organization.location, 'Hyderabad')
  })

  await t.test('non-member mutation is rejected (404 — not a member at all)', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationAId}`,
      headers: { cookie: outsiderCookie },
      payload: { location: 'Should not apply' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('a real member with an insufficient role cannot mutate (403 — distinct from the 404 non-member case)', async () => {
    // No invite/join API exists yet (deliberately, Phase 13) — this
    // membership is seeded directly to test the role check itself.
    const db = getDb(env!)
    await db.insert(organizationMembers).values({
      organizationId: organizationAId,
      userId: outsider.id,
      role: 'viewer',
      status: 'active',
    })

    const read = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationAId}`, headers: { cookie: outsiderCookie } })
    assert.equal(read.statusCode, 200, 'a viewer can still read')

    const mutate = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationAId}`,
      headers: { cookie: outsiderCookie },
      payload: { location: 'Should be forbidden' },
    })
    assert.equal(mutate.statusCode, 403, 'a viewer cannot mutate')

    // Confirmed roster now has 2 members — proves membership listing
    // reflects real membership, not just the owner.
    const members = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationAId}/members`, headers: { cookie: ownerCookie } })
    assert.equal(members.json().data.members.length, 2)

    // Clean up this seeded membership so it doesn't affect later tests.
    await db.delete(organizationMembers).where(eq(organizationMembers.userId, outsider.id))
  })

  await t.test('same user creates Organization B — multi-organization membership', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Organization B') },
    })
    assert.equal(res.statusCode, 201)
    organizationBId = res.json().data.organization.id
    assert.notEqual(organizationBId, organizationAId)

    const list = await app.inject({ method: 'GET', url: '/api/v1/organizations', headers: { cookie: ownerCookie } })
    const ids = list.json().data.organizations.map((o: { id: string }) => o.id)
    assert.ok(ids.includes(organizationAId) && ids.includes(organizationBId), 'user belongs to both organizations at once')
  })

  await t.test('duplicate membership is rejected at the database level', async () => {
    const db = getDb(env!)
    await assert.rejects(
      db.insert(organizationMembers).values({
        organizationId: organizationAId,
        userId: owner.id, // already a member (the owner) — same org+user pair
        role: 'admin',
        status: 'active',
      }),
    )
  })
})
