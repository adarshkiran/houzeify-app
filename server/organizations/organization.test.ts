// ─── Organization route tests — 12G-B ──────────────────────────────────────
// Real database-backed, via app.inject(). Duplicate-membership is tested at
// the database layer directly (see the last test) — there is no API surface
// that can trigger it yet (Phase 13 deliberately excludes invitation
// acceptance), so a direct insert against the unique constraint is the
// honest way to prove it, not a guessed HTTP flow that doesn't exist.

import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, test } from 'node:test'
import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers, partnerProfiles } from '../db/schema.js'
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

// ─── TABLE C: member management (add/patch/remove) + status enforcement ────
test('organizations: TABLE C member management and status enforcement', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const member = await createTestUser(env!)
  const memberCookie = sessionCookieHeader(await createTestSessionToken(env!, member.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

  const memberEmail = `table-c-member-${randomUUID().slice(0, 8)}@example.com`
  const db = getDb(env!)
  await db.insert(partnerProfiles).values({
    userId: member.id,
    professionalType: 'builder-construction-company',
    fullName: 'Table C Member',
    accountType: 'individual',
    contactEmail: memberEmail,
  })

  let organizationId = ''
  let ownerMemberId = ''
  let memberRowId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, member.id)
    await cleanupTestUser(env!, outsider.id)
    await closeDb()
  })

  await t.test('owner creates the organization', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Table C Org') },
    })
    assert.equal(res.statusCode, 201)
    organizationId = res.json().data.organization.id
    const members = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationId}/members`, headers: { cookie: ownerCookie } })
    ownerMemberId = members.json().data.members[0].id
  })

  await t.test('a non-member cannot add a member (404)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/members`,
      headers: { cookie: outsiderCookie },
      payload: { email: memberEmail, role: 'viewer' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('adding an unknown email 404s (USER_NOT_FOUND)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/members`,
      headers: { cookie: ownerCookie },
      payload: { email: `no-such-partner-${randomUUID().slice(0, 8)}@example.com`, role: 'viewer' },
    })
    assert.equal(res.statusCode, 404)
    assert.equal(res.json().error.code, 'USER_NOT_FOUND')
  })

  await t.test('the owner adds the real member — active immediately, no accept step', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/members`,
      headers: { cookie: ownerCookie },
      payload: { email: memberEmail.toUpperCase(), role: 'team-member' },
    })
    assert.equal(res.statusCode, 201)
    const added = res.json().data.member
    assert.equal(added.userId, member.id)
    assert.equal(added.role, 'team-member')
    assert.equal(added.status, 'active')
    memberRowId = added.id

    const list = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationId}/members`, headers: { cookie: ownerCookie } })
    assert.equal(list.json().data.members.length, 2)

    const asMember = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationId}`, headers: { cookie: memberCookie } })
    assert.equal(asMember.statusCode, 200, 'the newly added member can read immediately')
  })

  await t.test('adding the same person again is rejected (409 ALREADY_MEMBER)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/members`,
      headers: { cookie: ownerCookie },
      payload: { email: memberEmail, role: 'viewer' },
    })
    assert.equal(res.statusCode, 409)
    assert.equal(res.json().error.code, 'ALREADY_MEMBER')
  })

  await t.test('a team-member cannot add or patch members (403)', async () => {
    const add = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/members`,
      headers: { cookie: memberCookie },
      payload: { email: memberEmail, role: 'viewer' },
    })
    assert.equal(add.statusCode, 403)

    const patch = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationId}/members/${memberRowId}`,
      headers: { cookie: memberCookie },
      payload: { role: 'admin' },
    })
    assert.equal(patch.statusCode, 403)
  })

  await t.test('the owner promotes the member to admin', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationId}/members/${memberRowId}`,
      headers: { cookie: ownerCookie },
      payload: { role: 'admin' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.member.role, 'admin')
  })

  await t.test('role cannot be set to owner through this endpoint (400)', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationId}/members/${memberRowId}`,
      headers: { cookie: ownerCookie },
      payload: { role: 'owner' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('suspending a member revokes their access (status enforcement)', async () => {
    const suspend = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationId}/members/${memberRowId}`,
      headers: { cookie: ownerCookie },
      payload: { status: 'suspended' },
    })
    assert.equal(suspend.statusCode, 200)
    assert.equal(suspend.json().data.member.status, 'suspended')

    const read = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationId}`, headers: { cookie: memberCookie } })
    assert.equal(read.statusCode, 404, 'a suspended membership row must not continue granting access')

    const members = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationId}/members`, headers: { cookie: memberCookie } })
    assert.equal(members.statusCode, 404, 'suspended member cannot even list the roster')
  })

  await t.test('reactivating restores access', async () => {
    const reactivate = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationId}/members/${memberRowId}`,
      headers: { cookie: ownerCookie },
      payload: { status: 'active' },
    })
    assert.equal(reactivate.statusCode, 200)

    const read = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationId}`, headers: { cookie: memberCookie } })
    assert.equal(read.statusCode, 200)
  })

  await t.test('the sole owner cannot be demoted or removed (409 LAST_OWNER)', async () => {
    const demote = await app.inject({
      method: 'PATCH',
      url: `/api/v1/organizations/${organizationId}/members/${ownerMemberId}`,
      headers: { cookie: ownerCookie },
      payload: { status: 'suspended' },
    })
    assert.equal(demote.statusCode, 409)
    assert.equal(demote.json().error.code, 'LAST_OWNER')

    const remove = await app.inject({
      method: 'DELETE',
      url: `/api/v1/organizations/${organizationId}/members/${ownerMemberId}`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(remove.statusCode, 409)
    assert.equal(remove.json().error.code, 'LAST_OWNER')
  })

  await t.test('removing a non-owner member succeeds and revokes access', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/organizations/${organizationId}/members/${memberRowId}`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 204)

    const read = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationId}`, headers: { cookie: memberCookie } })
    assert.equal(read.statusCode, 404)

    // listOrganizationMembers is intentionally unfiltered by status (the
    // roster shows removed rows too, for audit/reactivation purposes) —
    // it's the ACCESS check (findMembership, asserted above) that enforces
    // status:'active', not the listing itself.
    const members = await app.inject({ method: 'GET', url: `/api/v1/organizations/${organizationId}/members`, headers: { cookie: ownerCookie } })
    const rows = members.json().data.members as { id: string; status: string }[]
    assert.equal(rows.length, 2, 'the removed row is still listed, soft-deleted')
    const removedRow = rows.find(r => r.id === memberRowId)
    assert.equal(removedRow?.status, 'removed')
  })

  await t.test('re-adding a previously removed member reactivates their row', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/organizations/${organizationId}/members`,
      headers: { cookie: ownerCookie },
      payload: { email: memberEmail, role: 'viewer' },
    })
    assert.equal(res.statusCode, 201)
    const readded = res.json().data.member
    assert.equal(readded.id, memberRowId, 'the same row is reactivated, not a duplicate')
    assert.equal(readded.status, 'active')
    assert.equal(readded.role, 'viewer')
  })
})
