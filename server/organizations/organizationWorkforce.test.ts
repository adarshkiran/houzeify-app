import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers, partnerProfiles } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const env = loadTestEnv()

test('C21 organization workforce-summary: membership, roster fields, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const admin = await createTestUser(env!)
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, admin.id))
  const ownerB = await createTestUser(env!)
  const ownerBCookie = sessionCookieHeader(await createTestSessionToken(env!, ownerB.id))

  const users = [owner, outsider, viewer, admin, ownerB]
  let organizationId = ''
  let organizationBId = ''
  let projectAId = ''
  let projectEmptyId = ''
  let projectBId = ''

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup orgs, projects, workforce assignments, partner display name', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C21 Org A'), type: 'construction-company' },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    await getDb(env!).insert(organizationMembers).values([
      { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      { organizationId, userId: admin.id, role: 'admin', status: 'active', joinedAt: new Date() },
    ])

    await getDb(env!).insert(partnerProfiles).values({
      userId: viewer.id,
      fullName: 'Viewer Full',
      displayName: 'Site Viewer',
      contactEmail: `viewer-${viewer.id.slice(0, 8)}@example.com`,
      professionalType: 'contractor',
      accountType: 'individual',
    })

    const orgBRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerBCookie },
      payload: { name: uniqueName('C21 Org B'), type: 'construction-company' },
    })
    assert.equal(orgBRes.statusCode, 201)
    organizationBId = orgBRes.json().data.organization.id

    const projectA = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C21 Villa A'),
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
        name: uniqueName('C21 Empty Crew'),
        organizationId,
        stage: 'foundation',
        status: 'active',
      },
    })
    assert.equal(projectEmpty.statusCode, 201)
    projectEmptyId = projectEmpty.json().data.project.id

    const projectB = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerBCookie },
      payload: {
        name: uniqueName('C21 Villa B'),
        organizationId: organizationBId,
        stage: 'masonry',
        status: 'active',
      },
    })
    assert.equal(projectB.statusCode, 201)
    projectBId = projectB.json().data.project.id

    const addRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/workforce`,
      headers: { cookie: adminCookie },
      payload: { userId: viewer.id, role: 'Electrician' },
    })
    assert.equal(addRes.statusCode, 201)

    // Soft-remove then re-add would be a new row; for isolation we also assign
    // on org B so cross-org leakage can be asserted.
    await getDb(env!).insert(organizationMembers).values({
      organizationId: organizationBId,
      userId: admin.id,
      role: 'admin',
      status: 'active',
      joinedAt: new Date(),
    })
    // Admin is not org B owner — need ownerB to add. Use ownerB as crew on B.
    const addB = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectBId}/workforce`,
      headers: { cookie: ownerBCookie },
      payload: { userId: ownerB.id, role: 'Site Supervisor' },
    })
    assert.equal(addB.statusCode, 201)
  })

  await t.test('unauthenticated → 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/workforce-summary`,
    })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/workforce-summary`,
      headers: { cookie: outsiderCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('invalid organization id → 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/organizations/not-a-uuid/workforce-summary',
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('cross-organization access → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationBId}/workforce-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member can read workforce summary', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/workforce-summary`,
      headers: { cookie: viewerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.organizationId, organizationId)
    assert.equal(summary.totals.projectCount, 2)
    assert.equal(summary.totals.projectsWithCrew, 1)
    assert.equal(summary.totals.assignmentCount, 1)
    assert.equal(summary.totals.uniquePeopleCount, 1)

    const villa = summary.projects.find((p: { id: string }) => p.id === projectAId)
    assert.ok(villa)
    assert.equal(villa.activeCount, 1)
    assert.equal(villa.members.length, 1)
    assert.equal(villa.members[0].displayName, 'Site Viewer')
    assert.equal(villa.members[0].role, 'Electrician')
    assert.ok(villa.members[0].assignedAt)
    // No emails / userIds in roster payload
    assert.equal(villa.members[0].userId, undefined)
    assert.equal(villa.members[0].email, undefined)

    const empty = summary.projects.find((p: { id: string }) => p.id === projectEmptyId)
    assert.ok(empty)
    assert.equal(empty.activeCount, 0)
    assert.deepEqual(empty.members, [])

    // Org B crew must not appear
    const leaked = summary.projects.some((p: { id: string }) => p.id === projectBId)
    assert.equal(leaked, false)
    const leakedName = JSON.stringify(summary).includes('Site Supervisor')
    assert.equal(leakedName, false)
  })

  await t.test('owner can read and crew-first sort puts assigned project first', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/workforce-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.projects[0].id, projectAId)
    assert.ok(summary.projects[0].activeCount >= summary.projects[1].activeCount)
  })

  await t.test('soft-removed assignment disappears from summary', async () => {
    const list = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectAId}/workforce`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(list.statusCode, 200)
    const memberId = list.json().data.members[0].id
    const remove = await app.inject({
      method: 'DELETE',
      url: `/api/v1/projects/${projectAId}/workforce/${memberId}`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(remove.statusCode, 204)

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/workforce-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.totals.assignmentCount, 0)
    assert.equal(summary.totals.projectsWithCrew, 0)
    const villa = summary.projects.find((p: { id: string }) => p.id === projectAId)
    assert.equal(villa.activeCount, 0)
  })

  await t.test('C19 progress-summary still works (regression)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/progress-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.summary.organizationId, organizationId)
  })

  await t.test('C20 reports-summary still works (regression)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/reports-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.summary.organizationId, organizationId)
  })
})
