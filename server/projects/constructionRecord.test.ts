import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { resetObjectStorageCache } from '../storage/objectStorage.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

process.env.STORAGE_PROVIDER = 'local'
process.env.MEDIA_LOCAL_ROOT = mkdtempSync(path.join(tmpdir(), 'houzeify-c18-record-'))
resetObjectStorageCache()

const env = loadTestEnv()

const TINY_PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')

function multipartDoc(fields: { fileName?: string; category?: string; title?: string }) {
  const boundary = '----HouzefiyC18Doc'
  const fileName = fields.fileName ?? `${uniqueName('plan')}.pdf`
  const category = fields.category ?? 'plans'
  const chunks: Buffer[] = []
  function addField(name: string, value: string) {
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
    ))
  }
  addField('category', category)
  if (fields.title !== undefined) addField('title', fields.title)
  chunks.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`,
  ))
  chunks.push(TINY_PDF)
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`))
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat(chunks),
  }
}

test('C18 construction-record: company package, customer shared-only, isolation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const customer = await createTestUser(env!)
  const customerCookie = sessionCookieHeader(await createTestSessionToken(env!, customer.id))
  const other = await createTestUser(env!)
  const otherCookie = sessionCookieHeader(await createTestSessionToken(env!, other.id))
  const ownerB = await createTestUser(env!)
  const ownerBCookie = sessionCookieHeader(await createTestSessionToken(env!, ownerB.id))

  const users = [owner, customer, other, ownerB]
  let projectId = ''
  let projectBId = ''
  const email = `c18-${uniqueName('cust').replace(' ', '-')}@example.com`

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup project, progress, docs, customer accept', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C18 Org') },
    })
    const organizationId = orgRes.json().data.organization.id
    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: {
        name: uniqueName('C18 Villa'),
        organizationId,
        stage: 'foundation',
        status: 'active',
        summary: 'Internal company summary',
      },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id

    const internalProgress = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: { date: '2026-05-01', stage: 'foundation', title: 'Internal footing note' },
    })
    assert.equal(internalProgress.statusCode, 201)

    const published = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: { date: '2026-05-02', stage: 'foundation', title: 'Slab poured' },
    })
    assert.equal(published.statusCode, 201)
    const progressId = published.json().data.progress.id
    const shareProgress = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(shareProgress.statusCode, 200)

    const internalDoc = multipartDoc({ title: 'Internal costs', fileName: 'costs.pdf' })
    const internalDocRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/documents`,
      headers: { cookie: ownerCookie, ...internalDoc.headers },
      payload: internalDoc.payload,
    })
    assert.equal(internalDocRes.statusCode, 201)

    const sharedDoc = multipartDoc({ title: 'GA Plan', fileName: 'ga.pdf' })
    const sharedDocRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/documents`,
      headers: { cookie: ownerCookie, ...sharedDoc.headers },
      payload: sharedDoc.payload,
    })
    assert.equal(sharedDocRes.statusCode, 201)
    const shareDoc = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}/documents/${sharedDocRes.json().data.document.id}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(shareDoc.statusCode, 200)

    await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: customerCookie },
      payload: { fullName: 'C18 Customer', email },
    })
    const invite = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email },
    })
    assert.equal(invite.statusCode, 200)

    const orgB = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerBCookie },
      payload: { name: uniqueName('C18 Org B') },
    })
    const projectB = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerBCookie },
      payload: { name: uniqueName('Other Site'), organizationId: orgB.json().data.organization.id, stage: 'masonry' },
    })
    projectBId = projectB.json().data.project.id
  })

  await t.test('unauthenticated → 401', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/construction-record` })
    assert.equal(res.statusCode, 401)
  })

  await t.test('invited customer (not accepted) → 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/construction-record`,
      headers: { cookie: customerCookie },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('company record includes ops + internal progress/docs', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/construction-record`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 200)
    const record = res.json().data.record
    assert.equal(record.audience, 'company')
    assert.equal(record.project.summary, 'Internal company summary')
    assert.equal(record.stage.currentId, 'foundation')
    assert.ok(record.operations)
    assert.equal(record.progress.totalCount, 2)
    assert.equal(record.progress.publishedCount, 1)
    assert.equal(record.documents.totalActive, 2)
    assert.equal(record.documents.sharedWithCustomer, 1)
    assert.ok(record.timeline.some((s: { state: string }) => s.state === 'current'))
  })

  await t.test('customer accept then shared-only record (no ops/BOQ/summary leak)', async () => {
    const accept = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/customer/accept`,
      headers: { cookie: customerCookie },
    })
    assert.equal(accept.statusCode, 200)

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/construction-record`,
      headers: { cookie: customerCookie },
    })
    assert.equal(res.statusCode, 200)
    const record = res.json().data.record
    assert.equal(record.audience, 'customer')
    assert.equal(record.project.summary, null)
    assert.equal(record.operations, undefined)
    assert.equal(record.progress.totalCount, 1)
    assert.equal(record.progress.recent[0].title, 'Slab poured')
    assert.equal(record.progress.recent[0].visibility, undefined)
    assert.equal(record.documents.totalActive, 1)
    assert.equal(record.documents.recent[0].title, 'GA Plan')
    assert.equal(record.documents.recent[0].visibility, undefined)
  })

  await t.test('outsider and cross-project → 404', async () => {
    const outsider = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/construction-record`,
      headers: { cookie: otherCookie },
    })
    assert.equal(outsider.statusCode, 404)

    const cross = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectBId}/construction-record`,
      headers: { cookie: customerCookie },
    })
    assert.equal(cross.statusCode, 404)

    const crossOrg = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/construction-record`,
      headers: { cookie: ownerBCookie },
    })
    assert.equal(crossOrg.statusCode, 404)
  })

  await t.test('malformed project id → 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/projects/not-a-uuid/construction-record',
      headers: { cookie: ownerCookie },
    })
    assert.equal(res.statusCode, 400)
  })
})
