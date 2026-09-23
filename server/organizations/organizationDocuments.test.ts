import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { resetObjectStorageCache } from '../storage/objectStorage.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

process.env.STORAGE_PROVIDER = 'local'
resetObjectStorageCache()

const env = loadTestEnv()

const TINY_PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')

function multipartDoc(fields: { fileName?: string; category?: string; title?: string }) {
  const boundary = '----HouzefiyC22Doc'
  const fileName = fields.fileName ?? `${uniqueName('plan')}.pdf`
  const category = fields.category ?? 'plans'
  const chunks: Buffer[] = []
  function addField(name: string, value: string) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`))
  }
  addField('category', category)
  if (fields.title !== undefined) addField('title', fields.title)
  chunks.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`,
    ),
  )
  chunks.push(TINY_PDF)
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`))
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat(chunks),
  }
}

test('C22 organization documents-summary: membership, document fields, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const ownerB = await createTestUser(env!)
  const ownerBCookie = sessionCookieHeader(await createTestSessionToken(env!, ownerB.id))

  const users = [owner, outsider, viewer, ownerB]
  let organizationId = ''
  let organizationBId = ''
  let projectAId = ''
  let projectEmptyId = ''
  let projectBId = ''
  let sharedDocId = ''

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup orgs, projects, documents', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C22 Org A'), type: 'construction-company' },
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

    const orgBRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerBCookie },
      payload: { name: uniqueName('C22 Org B'), type: 'construction-company' },
    })
    assert.equal(orgBRes.statusCode, 201)
    organizationBId = orgBRes.json().data.organization.id

    const projectA = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C22 Villa A'),
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
        name: uniqueName('C22 Empty Docs'),
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
        name: uniqueName('C22 Villa B'),
        organizationId: organizationBId,
        stage: 'masonry',
        status: 'active',
      },
    })
    assert.equal(projectB.statusCode, 201)
    projectBId = projectB.json().data.project.id

    const internal = multipartDoc({ title: 'Internal GA Plan', category: 'plans' })
    const internalRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/documents`,
      headers: { cookie: ownerCookie, ...internal.headers },
      payload: internal.payload,
    })
    assert.equal(internalRes.statusCode, 201)

    const shared = multipartDoc({ title: 'Shared Contract', category: 'contracts' })
    const sharedRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectAId}/documents`,
      headers: { cookie: ownerCookie, ...shared.headers },
      payload: shared.payload,
    })
    assert.equal(sharedRes.statusCode, 201)
    sharedDocId = sharedRes.json().data.document.id
    const publish = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectAId}/documents/${sharedDocId}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(publish.statusCode, 200)

    const orgBDoc = multipartDoc({ title: 'Org B Secret Plan', category: 'plans' })
    const orgBUpload = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectBId}/documents`,
      headers: { cookie: ownerBCookie, ...orgBDoc.headers },
      payload: orgBDoc.payload,
    })
    assert.equal(orgBUpload.statusCode, 201)
  })

  await t.test('unauthenticated → 401', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/documents-summary`,
    })
    assert.equal(res.statusCode, 401)
  })

  await t.test('outsider → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/documents-summary`,
      headers: { cookie: outsiderCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('invalid organization id → 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/organizations/not-a-uuid/documents-summary',
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('cross-organization access → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationBId}/documents-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer-role member can read documents summary', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/documents-summary`,
      headers: { cookie: viewerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.organizationId, organizationId)
    assert.equal(summary.totals.projectCount, 2)
    assert.equal(summary.totals.projectsWithDocuments, 1)
    assert.equal(summary.totals.activeDocuments, 2)
    assert.equal(summary.totals.sharedWithCustomer, 1)

    const villa = summary.projects.find((p: { id: string }) => p.id === projectAId)
    assert.ok(villa)
    assert.equal(villa.activeCount, 2)
    assert.equal(villa.sharedWithCustomerCount, 1)
    assert.ok(villa.recent.length >= 1)
    assert.ok(villa.recent.some((d: { title: string }) => d.title === 'Shared Contract'))
    assert.ok(villa.recent.some((d: { visibility: string }) => d.visibility === 'customer'))
    assert.equal(villa.recent[0].storageRef, undefined)

    const empty = summary.projects.find((p: { id: string }) => p.id === projectEmptyId)
    assert.ok(empty)
    assert.equal(empty.activeCount, 0)
    assert.deepEqual(empty.recent, [])

    assert.equal(
      summary.projects.some((p: { id: string }) => p.id === projectBId),
      false,
    )
    assert.equal(JSON.stringify(summary).includes('Org B Secret Plan'), false)
  })

  await t.test('owner can read and documents-first sort puts documented project first', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/documents-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.projects[0].id, projectAId)
    assert.ok(summary.projects[0].activeCount >= summary.projects[1].activeCount)
  })

  await t.test('archived document disappears from summary', async () => {
    const archive = await app.inject({
      method: 'DELETE',
      url: `/api/v1/projects/${projectAId}/documents/${sharedDocId}`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(archive.statusCode, 204)

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/documents-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const summary = res.json().data.summary
    assert.equal(summary.totals.activeDocuments, 1)
    assert.equal(summary.totals.sharedWithCustomer, 0)
    const villa = summary.projects.find((p: { id: string }) => p.id === projectAId)
    assert.equal(villa.activeCount, 1)
    assert.equal(
      villa.recent.some((d: { id: string }) => d.id === sharedDocId),
      false,
    )
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

  await t.test('C21 workforce-summary still works (regression)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/organizations/${organizationId}/workforce-summary`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.summary.organizationId, organizationId)
  })
})
