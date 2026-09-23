// ─── Daily Progress route tests — Module 04 ─────────────────────────────────
// Real database-backed, via app.inject(). Mirrors
// project.organization.test.ts's structure exactly: creator access, org-
// member-can-create (including a viewer), creator-or-mutation-role for
// update/delete, outsider blocked everywhere with 404 (not 403), photo
// metadata attach with server-generated storageRef, and date-format
// validation.

import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { resetObjectStorageCache } from '../storage/objectStorage.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function multipartFile(filename: string, body: Buffer, contentType: string) {
  const boundary = '----HouzefiyTestBoundary7MA4YWxkTrZu0gW'
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`,
  )
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`)
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat([head, body, tail]),
  }
}

function multipartPng(filename: string) {
  return multipartFile(filename, TINY_PNG, 'image/png')
}

process.env.STORAGE_PROVIDER = 'local'
process.env.MEDIA_LOCAL_ROOT = mkdtempSync(path.join(tmpdir(), 'houzeify-dp-'))
resetObjectStorageCache()

const env = loadTestEnv()

test('daily progress: create/list/update/delete, organization authorization, photo metadata', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const admin = await createTestUser(env!)
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, admin.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

  let organizationId = ''
  let projectId = ''
  let progressId = ''

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, viewer.id)
    await cleanupTestUser(env!, admin.id)
    await cleanupTestUser(env!, outsider.id)
    await closeDb()
    resetObjectStorageCache()
  })

  await t.test('setup: create Organization A + a project under it, add viewer and admin members', async () => {
    const orgRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Org A') },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    const db = getDb(env!)
    await db.insert(organizationMembers).values([
      { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      { organizationId, userId: admin.id, role: 'admin', status: 'active', joinedAt: new Date() },
    ])

    const projectRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site A'), organizationId },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id
  })

  await t.test('outsider cannot create progress (404, not fabricated)', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: outsiderCookie },
      payload: { date: '2026-02-01', title: 'Should not exist' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('viewer (real org member, not just owner) CAN create progress', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: viewerCookie },
      payload: { date: '2026-02-01', stage: 'foundation', title: 'Footing poured', description: 'North and east footings complete.' },
    })
    assert.equal(res.statusCode, 201)
    const row = res.json().data.progress
    assert.equal(row.title, 'Footing poured')
    assert.equal(row.stage, 'foundation')
    assert.equal(row.createdBy, viewer.id)
    assert.equal(row.projectId, projectId)
    assert.deepEqual(row.photos, [])
    progressId = row.id
  })

  await t.test('invalid date format is rejected with 400', async () => {
    const res = await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: ownerCookie },
      payload: { date: '01-02-2026', title: 'Bad date' },
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('outsider cannot list progress (404)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin (real org member) can list progress and sees the viewer-created entry', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: adminCookie } })
    assert.equal(res.statusCode, 200)
    const ids = res.json().data.progress.map((p: { id: string }) => p.id)
    assert.ok(ids.includes(progressId))
  })

  await t.test('viewer role CANNOT update their own... wait, viewer CAN update THEIR OWN entry (creator rule)', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: viewerCookie },
      payload: { title: 'Footing poured (updated by creator)' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.progress.title, 'Footing poured (updated by creator)')
  })

  await t.test('outsider cannot update the entry (404)', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: outsiderCookie },
      payload: { title: 'Hijacked' },
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('admin (not the creator) CAN update the entry — org mutation-role rule', async () => {
    const res = await app.inject({
      method: 'PATCH', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: adminCookie },
      payload: { stage: 'structure' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.progress.stage, 'structure')
  })

  await t.test('add real photo via multipart — stored persistently, not internal://', async () => {
    const { headers, payload } = multipartPng('footing-01.png')
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers: { cookie: viewerCookie, ...headers },
      payload,
    })
    assert.equal(res.statusCode, 201)
    const photo = res.json().data.photo
    assert.equal(photo.fileName, 'footing-01.png')
    assert.equal(photo.fileAvailable, true)
    assert.ok(photo.storageRef.startsWith('local://'))
    assert.ok(photo.contentUrl)

    const content = await app.inject({
      method: 'GET',
      url: photo.contentUrl,
      headers: { cookie: ownerCookie },
    })
    assert.equal(content.statusCode, 200)
    assert.equal(content.headers['content-type'], 'image/png')
    assert.ok(Buffer.from(content.rawPayload).equals(TINY_PNG))

    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: ownerCookie } })
    const entry = listRes.json().data.progress.find((p: { id: string }) => p.id === progressId)
    assert.equal(entry.photos.length, 1)
    assert.equal(entry.photos[0].fileName, 'footing-01.png')
  })

  await t.test('non-image multipart payload is rejected with 400', async () => {
    const { headers, payload } = multipartFile('site.pdf', Buffer.from('%PDF-1.4'), 'application/pdf')
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers: { cookie: viewerCookie, ...headers },
      payload,
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('oversized photo is rejected with 400', async () => {
    const huge = Buffer.concat([TINY_PNG, Buffer.alloc(15 * 1024 * 1024)])
    const { headers, payload } = multipartFile('huge.png', huge, 'image/png')
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers: { cookie: viewerCookie, ...headers },
      payload,
    })
    assert.equal(res.statusCode, 400)
  })

  await t.test('outsider cannot delete the entry (404)', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: outsiderCookie } })
    assert.equal(res.statusCode, 404)
  })

  await t.test('creator (viewer) can delete their own entry', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`, headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 204)

    const listRes = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: ownerCookie } })
    const ids = listRes.json().data.progress.map((p: { id: string }) => p.id)
    assert.ok(!ids.includes(progressId))
  })

  await t.test('malformed project id is rejected with 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/projects/not-a-uuid/daily-progress', headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 400)
  })

  await t.test('TABLE C: a suspended admin loses daily-progress access; reactivating restores it', async () => {
    const db = getDb(env!)
    await db.update(organizationMembers).set({ status: 'suspended' }).where(eq(organizationMembers.userId, admin.id))

    const listWhileSuspended = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: adminCookie } })
    assert.equal(listWhileSuspended.statusCode, 404)

    await db.update(organizationMembers).set({ status: 'active' }).where(eq(organizationMembers.userId, admin.id))
    const listAfterReactivate = await app.inject({ method: 'GET', url: `/api/v1/projects/${projectId}/daily-progress`, headers: { cookie: adminCookie } })
    assert.equal(listAfterReactivate.statusCode, 200)
  })
})
