// ─── C15 construction media authorization tests ─────────────────────────────

import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb } from '../db/client.js'
import { resetObjectStorageCache } from '../storage/objectStorage.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function multipartPng(filename: string) {
  const boundary = '----HouzefiyC15Boundary'
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: image/png\r\n\r\n`,
  )
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`)
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat([head, TINY_PNG, tail]),
  }
}

process.env.STORAGE_PROVIDER = 'local'
process.env.MEDIA_LOCAL_ROOT = mkdtempSync(path.join(tmpdir(), 'houzeify-c15-'))
resetObjectStorageCache()

const env = loadTestEnv()

test('C15 construction media: upload, retrieve, customer ACL', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const customer = await createTestUser(env!)
  const customerCookie = sessionCookieHeader(await createTestSessionToken(env!, customer.id))
  const outsider = await createTestUser(env!)
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const ownerB = await createTestUser(env!)
  const ownerBCookie = sessionCookieHeader(await createTestSessionToken(env!, ownerB.id))

  let organizationId = ''
  let projectId = ''
  let progressId = ''
  let photoId = ''
  let contentUrl = ''
  const email = `c15-${uniqueName('m').replace(' ', '-')}@example.com`

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, customer.id)
    await cleanupTestUser(env!, outsider.id)
    await cleanupTestUser(env!, ownerB.id)
    await closeDb()
    resetObjectStorageCache()
  })

  await t.test('setup org project + customer invite accept', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C15 Org') },
    })
    organizationId = orgRes.json().data.organization.id
    // Org create already inserts the owner as active member.
    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('C15 Site'), organizationId },
    })
    projectId = projectRes.json().data.project.id

    assert.equal(orgRes.statusCode, 201)
    assert.equal(projectRes.statusCode, 201)
    await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: customerCookie },
      payload: { fullName: 'C15 Customer', email },
    })
    await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email },
    })
  })

  await t.test('invited customer cannot retrieve media (404)', async () => {
    const progressRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: { date: '2026-03-01', stage: 'foundation', title: 'Slab pour' },
    })
    progressId = progressRes.json().data.progress.id
    const { headers, payload } = multipartPng('slab.png')
    const photoRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers: { cookie: ownerCookie, ...headers },
      payload,
    })
    assert.equal(photoRes.statusCode, 201)
    photoId = photoRes.json().data.photo.id
    contentUrl = photoRes.json().data.photo.contentUrl

    await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })

    const denied = await app.inject({
      method: 'GET',
      url: contentUrl,
      headers: { cookie: customerCookie },
    })
    assert.equal(denied.statusCode, 404)
  })

  await t.test('active customer can retrieve published photo bytes', async () => {
    const accept = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/customer/accept`,
      headers: { cookie: customerCookie },
    })
    assert.equal(accept.statusCode, 200)

    const ok = await app.inject({
      method: 'GET',
      url: contentUrl,
      headers: { cookie: customerCookie },
    })
    assert.equal(ok.statusCode, 200)
    assert.ok(Buffer.from(ok.rawPayload).equals(TINY_PNG))

    const feed = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view/progress`,
      headers: { cookie: customerCookie },
    })
    assert.equal(feed.statusCode, 200)
    const photos = feed.json().data.progress[0].photos
    assert.equal(photos[0].fileAvailable, true)
    assert.ok(photos[0].contentUrl)
  })

  await t.test('unrelated customer and company cannot retrieve', async () => {
    const otherCustomer = await createTestUser(env!)
    const otherCookie = sessionCookieHeader(await createTestSessionToken(env!, otherCustomer.id))
    const deniedCustomer = await app.inject({
      method: 'GET',
      url: contentUrl,
      headers: { cookie: otherCookie },
    })
    assert.equal(deniedCustomer.statusCode, 404)

    const orgB = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgB.statusCode, 201)
    const deniedCompany = await app.inject({
      method: 'GET',
      url: contentUrl,
      headers: { cookie: ownerBCookie },
    })
    assert.equal(deniedCompany.statusCode, 404)

    await cleanupTestUser(env!, otherCustomer.id)
  })

  await t.test('cross-project photo id tampering denied', async () => {
    const otherProject = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Other Site'), organizationId },
    })
    const otherProjectId = otherProject.json().data.project.id
    const tamper = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${otherProjectId}/daily-progress-photos/${photoId}/content`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(tamper.statusCode, 404)
  })

  await t.test('outsider cannot upload', async () => {
    const { headers, payload } = multipartPng('evil.png')
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers: { cookie: outsiderCookie, ...headers },
      payload,
    })
    assert.equal(res.statusCode, 404)
  })

  await t.test('unpublished photo hidden from customer', async () => {
    const progressRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: { date: '2026-03-02', title: 'Internal only' },
    })
    const internalId = progressRes.json().data.progress.id
    const { headers, payload } = multipartPng('internal.png')
    const photoRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${internalId}/photos`,
      headers: { cookie: ownerCookie, ...headers },
      payload,
    })
    const internalUrl = photoRes.json().data.photo.contentUrl
    const denied = await app.inject({
      method: 'GET',
      url: internalUrl,
      headers: { cookie: customerCookie },
    })
    assert.equal(denied.statusCode, 404)
  })

  await t.test('C15B: unauthenticated upload and retrieve denied', async () => {
    const { headers, payload } = multipartPng('anon.png')
    const upload = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers,
      payload,
    })
    assert.equal(upload.statusCode, 401)

    const get = await app.inject({
      method: 'GET',
      url: contentUrl,
    })
    assert.equal(get.statusCode, 401)
  })

  await t.test('C15B: photo is linked to Daily Progress, project, stage, and uploader', async () => {
    const list = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/daily-progress`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(list.statusCode, 200)
    const entry = list.json().data.progress.find((p: { id: string }) => p.id === progressId)
    assert.ok(entry)
    assert.equal(entry.projectId, projectId)
    assert.equal(entry.stage, 'foundation')
    assert.equal(entry.photos.length >= 1, true)
    const photo = entry.photos.find((p: { id: string }) => p.id === photoId)
    assert.ok(photo)
    assert.equal(photo.dailyProgressId, progressId)
    assert.equal(photo.uploadedBy, owner.id)
    assert.equal(photo.fileAvailable, true)
    assert.equal(photo.mediaKind, 'photo')
    assert.ok(photo.contentUrl)
  })

  await t.test('C15C: valid MP4 video uploads, persists, and retrieves under same ACL', async () => {
    // Minimal ISO BMFF ftyp box (isom) — enough for magic-byte detection.
    const tinyMp4 = Buffer.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
    ])
    const boundary = '----HouzefiyC15Video'
    const head = Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="site.mp4"\r\n` +
        `Content-Type: video/mp4\r\n\r\n`,
    )
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`)
    const videoRes = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers: { cookie: ownerCookie, 'content-type': `multipart/form-data; boundary=${boundary}` },
      payload: Buffer.concat([head, tinyMp4, tail]),
    })
    assert.equal(videoRes.statusCode, 201)
    const video = videoRes.json().data.photo
    assert.equal(video.mediaKind, 'video')
    assert.equal(video.mimeType, 'video/mp4')
    assert.ok(video.storageRef.includes('/video/'))
    assert.ok(video.contentUrl)

    const bytes = await app.inject({
      method: 'GET',
      url: video.contentUrl,
      headers: { cookie: ownerCookie },
    })
    assert.equal(bytes.statusCode, 200)
    assert.equal(bytes.headers['content-type'], 'video/mp4')
    assert.ok(Buffer.from(bytes.rawPayload).equals(tinyMp4))

    const customerOk = await app.inject({
      method: 'GET',
      url: video.contentUrl,
      headers: { cookie: customerCookie },
    })
    assert.equal(customerOk.statusCode, 200)
  })

  await t.test('C15C: fake video extension / non-video bytes rejected; customer cannot upload', async () => {
    const boundary = '----HouzefiyC15FakeVid'
    const fake = Buffer.from('not-a-video')
    const head = Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="clip.mp4"\r\n` +
        `Content-Type: video/mp4\r\n\r\n`,
    )
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`)
    const bad = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers: { cookie: ownerCookie, 'content-type': `multipart/form-data; boundary=${boundary}` },
      payload: Buffer.concat([head, fake, tail]),
    })
    assert.equal(bad.statusCode, 400)

    const tinyMp4 = Buffer.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
    ])
    const head2 = Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="clip.mp4"\r\n` +
        `Content-Type: video/mp4\r\n\r\n`,
    )
    const customerUpload = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}/photos`,
      headers: { cookie: customerCookie, 'content-type': `multipart/form-data; boundary=${boundary}` },
      payload: Buffer.concat([head2, tinyMp4, tail]),
    })
    assert.equal(customerUpload.statusCode, 404)
  })
})
