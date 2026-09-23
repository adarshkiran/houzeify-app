// ─── Project Documents route tests — Module 07 / C16 ───────────────────────
// Real database-backed, via app.inject(). C16 stores real file bytes via
// object storage (`fileAvailable` true, content GET). storageRef never appears
// in API responses.
//
// Authorization contract under test:
//   - list / create  = any project participant (creator or ANY org member,
//                      including `viewer`)
//   - update / archive = the uploader, OR the project creator, OR an org
//                      member with role owner/admin
//   - content GET = company access, or customer when visibility=customer
//   - anything else (outsider, other-org member, non-uploading viewer) gets
//     404 — NEVER 403.

import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers, projectDocuments } from '../db/schema.js'
import { resetObjectStorageCache } from '../storage/objectStorage.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'

process.env.STORAGE_PROVIDER = 'local'
process.env.MEDIA_LOCAL_ROOT = mkdtempSync(path.join(tmpdir(), 'houzeify-c16-docs-'))
resetObjectStorageCache()

const env = loadTestEnv()

const TINY_PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
const TINY_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  0xff, 0xd9,
])
const TINY_DWG = Buffer.from('AC1027\x00binary-dwg-stub')
const TINY_DXF = Buffer.from('0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nEOF\n')

const CATEGORIES = ['plans', 'estimates-boq', 'contracts', 'approvals', 'invoices', 'site-documents', 'other'] as const

function multipartDoc(fields: {
  fileName?: string
  category?: string
  title?: string
  description?: string
  body?: Buffer
  contentType?: string
}) {
  const boundary = '----HouzefiyC16Doc'
  const fileName = fields.fileName ?? `${uniqueName('floor-plan')}.pdf`
  const category = fields.category ?? 'plans'
  const body = fields.body ?? TINY_PDF
  const contentType = fields.contentType ?? 'application/pdf'
  const chunks: Buffer[] = []
  function addField(name: string, value: string) {
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
    ))
  }
  addField('category', category)
  if (fields.title !== undefined) addField('title', fields.title)
  if (fields.description !== undefined) addField('description', fields.description)
  chunks.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`,
  ))
  chunks.push(body)
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`))
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat(chunks),
  }
}

test('project documents: create/list/edit/archive, ownership authorization, validation', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!) // Org A owner AND project creator
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!) // Org A `viewer` — an uploader
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const viewer2 = await createTestUser(env!) // Org A `viewer` — NOT an uploader
  const viewer2Cookie = sessionCookieHeader(await createTestSessionToken(env!, viewer2.id))
  const admin = await createTestUser(env!) // Org A `admin`
  const adminCookie = sessionCookieHeader(await createTestSessionToken(env!, admin.id))
  const outsider = await createTestUser(env!) // no membership anywhere
  const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))
  const orgBUser = await createTestUser(env!) // owns Org B
  const orgBCookie = sessionCookieHeader(await createTestSessionToken(env!, orgBUser.id))

  let organizationId = ''
  let projectId = ''
  let project2Id = ''

  // Shared ids threaded through the sequential sub-tests.
  let viewerDocId = '' // uploaded by viewer (title/description supplied)
  let ownerDocId = '' // uploaded by owner, with client-forged server fields
  let untitledDocId = '' // uploaded by owner, no title
  let untitledFileName = ''
  let archiveDocId = '' // uploaded by viewer, archived by its uploader
  let project2DocId = '' // lives in project 2

  const docsUrl = (pid: string) => `/api/v1/projects/${pid}/documents`
  const docUrl = (pid: string, did: string) => `/api/v1/projects/${pid}/documents/${did}`

  async function listIds(pid: string, cookie: string): Promise<string[]> {
    const res = await app.inject({ method: 'GET', url: docsUrl(pid), headers: { cookie } })
    assert.equal(res.statusCode, 200)
    return res.json().data.documents.map((d: { id: string }) => d.id)
  }

  async function createDoc(pid: string, cookie: string, overrides: Record<string, unknown> = {}) {
    const { headers, payload } = multipartDoc({
      fileName: (overrides.fileName as string) || undefined,
      category: (overrides.category as string) || undefined,
      title: overrides.title as string | undefined,
      description: overrides.description as string | undefined,
      body: (overrides.body as Buffer) || undefined,
      contentType: (overrides.mimeType as string) || undefined,
    })
    const res = await app.inject({ method: 'POST', url: docsUrl(pid), headers: { cookie, ...headers }, payload })
    assert.equal(res.statusCode, 201, res.body)
    return res.json().data.document as Record<string, unknown> & { id: string; fileName: string; contentUrl?: string }
  }

  after(async () => {
    await app.close()
    await cleanupTestUser(env!, owner.id)
    await cleanupTestUser(env!, viewer.id)
    await cleanupTestUser(env!, viewer2.id)
    await cleanupTestUser(env!, admin.id)
    await cleanupTestUser(env!, outsider.id)
    await cleanupTestUser(env!, orgBUser.id)
    await closeDb()
    resetObjectStorageCache()
  })

  await t.test('setup: Organization A + two projects under it, add viewer/viewer2/admin members', async () => {
    const orgRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Org A') },
    })
    assert.equal(orgRes.statusCode, 201)
    organizationId = orgRes.json().data.organization.id

    const db = getDb(env!)
    await db.insert(organizationMembers).values([
      { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      { organizationId, userId: viewer2.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      { organizationId, userId: admin.id, role: 'admin', status: 'active', joinedAt: new Date() },
    ])

    const projectRes = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site A'), organizationId },
    })
    assert.equal(projectRes.statusCode, 201)
    projectId = projectRes.json().data.project.id

    const project2Res = await app.inject({
      method: 'POST', url: '/api/v1/projects', headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site A2'), organizationId },
    })
    assert.equal(project2Res.statusCode, 201)
    project2Id = project2Res.json().data.project.id
  })

  // 1 ─────────────────────────────────────────────────────────────────────
  await t.test('unauthenticated POST is rejected (401)', async () => {
    const { headers, payload } = multipartDoc({})
    const res = await app.inject({ method: 'POST', url: docsUrl(projectId), headers, payload })
    assert.equal(res.statusCode, 401)
  })

  // 3 + 4 ─────────────────────────────────────────────────────────────────
  await t.test('viewer-role member CAN list (broad read boundary)', async () => {
    const res = await app.inject({ method: 'GET', url: docsUrl(projectId), headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json().data.documents, [])
  })

  await t.test('viewer-role member CAN create; response has server-set fields and no storageRef', async () => {
    const fileName = `${uniqueName('site-plan')}.pdf`
    const { headers, payload } = multipartDoc({
      category: 'plans', fileName, title: 'Ground floor plan', description: 'Rev A',
    })
    const res = await app.inject({
      method: 'POST', url: docsUrl(projectId), headers: { cookie: viewerCookie, ...headers }, payload,
    })
    assert.equal(res.statusCode, 201)
    const doc = res.json().data.document
    assert.ok(doc.id)
    assert.equal(doc.projectId, projectId)
    assert.equal(doc.uploadedBy, viewer.id) // server-set = the caller
    assert.equal(doc.status, 'active')
    assert.equal(doc.fileAvailable, true)
    assert.ok(doc.contentUrl)
    assert.equal(doc.category, 'plans')
    assert.equal(doc.title, 'Ground floor plan')
    assert.equal(doc.description, 'Rev A')
    assert.equal(doc.fileName, fileName)
    assert.equal(doc.mimeType, 'application/pdf')
    assert.equal(doc.size, TINY_PDF.length)
    assert.ok(doc.createdAt)
    assert.ok(doc.updatedAt)
    assert.equal('storageRef' in doc, false)
    assert.equal('storage_ref' in doc, false)
    viewerDocId = doc.id

    const bytes = await app.inject({ method: 'GET', url: doc.contentUrl, headers: { cookie: viewerCookie } })
    assert.equal(bytes.statusCode, 200)
    assert.equal(bytes.headers['content-type'], 'application/pdf')
    assert.ok(Buffer.from(bytes.rawPayload).equals(TINY_PDF))
  })

  // 2 (needs a real document id, so it runs after the first create) ───────
  await t.test('outsider cannot list, create, edit or archive (404, not 403)', async () => {
    const list = await app.inject({ method: 'GET', url: docsUrl(projectId), headers: { cookie: outsiderCookie } })
    assert.equal(list.statusCode, 404)
    const forged = multipartDoc({})
    const create = await app.inject({ method: 'POST', url: docsUrl(projectId), headers: { cookie: outsiderCookie, ...forged.headers }, payload: forged.payload })
    assert.equal(create.statusCode, 404)
    const patch = await app.inject({
      method: 'PATCH', url: docUrl(projectId, viewerDocId), headers: { cookie: outsiderCookie }, payload: { title: 'Hijacked' },
    })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: docUrl(projectId, viewerDocId), headers: { cookie: outsiderCookie } })
    assert.equal(del.statusCode, 404)

    // …and none of it had any effect: the document is untouched and no
    // outsider-created row exists.
    const rows = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.projectId, projectId))
    assert.equal(rows.length, 1)
    assert.equal(rows[0].id, viewerDocId)
    assert.equal(rows[0].title, 'Ground floor plan')
    assert.equal(rows[0].status, 'active')
  })

  // 5 ─────────────────────────────────────────────────────────────────────
  await t.test('multipart create stores local:// ref; client cannot set storage ownership fields', async () => {
    const { headers, payload } = multipartDoc({ title: 'Forged fields' })
    const res = await app.inject({
      method: 'POST', url: docsUrl(projectId), headers: { cookie: ownerCookie, ...headers }, payload,
    })
    assert.equal(res.statusCode, 201)
    const doc = res.json().data.document
    assert.equal(doc.uploadedBy, owner.id)
    assert.notEqual(doc.uploadedBy, viewer.id)
    assert.equal(doc.status, 'active')
    assert.equal(doc.fileAvailable, true)
    assert.equal('storageRef' in doc, false)
    ownerDocId = doc.id

    const rows = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.id, ownerDocId))
    assert.equal(rows.length, 1)
    assert.ok(rows[0].storageRef.startsWith('local://'))
    assert.equal(rows[0].uploadedBy, owner.id)
    assert.equal(rows[0].status, 'active')
    assert.ok((await listIds(projectId, ownerCookie)).includes(ownerDocId))
  })

  // 7 ─────────────────────────────────────────────────────────────────────
  await t.test('title defaults to fileName when omitted', async () => {
    untitledFileName = `${uniqueName('contract')}.pdf`
    const { headers, payload } = multipartDoc({ category: 'contracts', fileName: untitledFileName })
    const res = await app.inject({
      method: 'POST', url: docsUrl(projectId), headers: { cookie: ownerCookie, ...headers }, payload,
    })
    assert.equal(res.statusCode, 201)
    const doc = res.json().data.document
    assert.equal(doc.title, untitledFileName)
    assert.equal(doc.fileName, untitledFileName)
    untitledDocId = doc.id
  })

  // 6 ─────────────────────────────────────────────────────────────────────
  await t.test('list returns active documents newest first', async () => {
    const res = await app.inject({ method: 'GET', url: docsUrl(projectId), headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 200)
    const docs = res.json().data.documents
    // Created order: viewerDoc → ownerDoc → untitledDoc; so newest first is the reverse.
    assert.deepEqual(docs.map((d: { id: string }) => d.id), [untitledDocId, ownerDocId, viewerDocId])
    for (const d of docs) {
      assert.equal(d.status, 'active')
      assert.equal(d.fileAvailable, true)
      assert.ok(d.contentUrl)
      assert.equal('storageRef' in d, false)
    }
    const stamps = docs.map((d: { createdAt: string }) => new Date(d.createdAt).getTime())
    assert.deepEqual([...stamps].sort((a, b) => b - a), stamps)
  })

  // 8 ─────────────────────────────────────────────────────────────────────
  await t.test('validation: create rejects invalid category / extension / fake PDF (400)', async () => {
    const cases = [
      multipartDoc({ category: 'photos' }),
      multipartDoc({ fileName: 'installer.exe', body: TINY_PDF }),
      multipartDoc({ fileName: 'notes.docx', body: TINY_PDF }),
      multipartDoc({ fileName: 'floorplan', body: TINY_PDF }),
      multipartDoc({ fileName: 'fake.pdf', body: Buffer.from('not-a-pdf') }),
      multipartDoc({ fileName: 'a.pdf.exe', body: TINY_PDF }),
    ]
    for (const { headers, payload } of cases) {
      const res = await app.inject({ method: 'POST', url: docsUrl(projectId), headers: { cookie: ownerCookie, ...headers }, payload })
      assert.equal(res.statusCode, 400, res.body)
    }
  })

  await t.test('validation: rejected creates persisted nothing; allowed types succeed', async () => {
    const before = (await listIds(projectId, ownerCookie)).length
    assert.equal(before, 3)

    const samples: Array<[string, string, Buffer, string]> = [
      ['plans', 'a.pdf', TINY_PDF, 'application/pdf'],
      ['estimates-boq', 'b.png', TINY_PNG, 'image/png'],
      ['contracts', 'c.jpg', TINY_JPEG, 'image/jpeg'],
      ['approvals', 'd.jpeg', TINY_JPEG, 'image/jpeg'],
      ['invoices', 'e.dwg', TINY_DWG, 'application/acad'],
      ['site-documents', 'f.dxf', TINY_DXF, 'image/vnd.dxf'],
      ['other', 'g.pdf', TINY_PDF, 'application/pdf'],
    ]
    for (const [category, fileName, body, contentType] of samples) {
      const { headers, payload } = multipartDoc({ category, fileName: `${uniqueName('doc')}-${fileName}`, body, contentType })
      const res = await app.inject({ method: 'POST', url: docsUrl(projectId), headers: { cookie: ownerCookie, ...headers }, payload })
      assert.equal(res.statusCode, 201, `${category}/${fileName}: ${res.body}`)
      assert.equal(res.json().data.document.category, category)
      assert.equal(res.json().data.document.fileAvailable, true)
    }
    assert.equal((await listIds(projectId, ownerCookie)).length, before + samples.length)
  })

  await t.test('uppercase extension PLAN.PDF is accepted (extension check is case-insensitive)', async () => {
    const doc = await createDoc(projectId, ownerCookie, { fileName: 'PLAN.PDF' })
    assert.equal(doc.fileName, 'PLAN.PDF')
    assert.equal(doc.title, 'PLAN.PDF')
    // Archive it so later count-based assertions stay unaffected.
    const del = await app.inject({ method: 'DELETE', url: docUrl(projectId, doc.id), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 204)
  })

  // 9 ─────────────────────────────────────────────────────────────────────
  await t.test('uploader (viewer-role member) CAN edit own document', async () => {
    const res = await app.inject({
      method: 'PATCH', url: docUrl(projectId, viewerDocId), headers: { cookie: viewerCookie },
      payload: { title: 'Ground floor plan v2' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.document.title, 'Ground floor plan v2')
    assert.equal(res.json().data.document.id, viewerDocId)
  })

  await t.test('uploader (viewer-role member) CAN archive own document', async () => {
    archiveDocId = (await createDoc(projectId, viewerCookie, { category: 'invoices' })).id
    const res = await app.inject({ method: 'DELETE', url: docUrl(projectId, archiveDocId), headers: { cookie: viewerCookie } })
    assert.equal(res.statusCode, 204)
  })

  // 10 ────────────────────────────────────────────────────────────────────
  await t.test("a different viewer-role member CANNOT edit another user's document (404)", async () => {
    const res = await app.inject({
      method: 'PATCH', url: docUrl(projectId, viewerDocId), headers: { cookie: viewer2Cookie },
      payload: { title: 'Not mine' },
    })
    assert.equal(res.statusCode, 404)
    const rows = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.id, viewerDocId))
    assert.equal(rows[0].title, 'Ground floor plan v2')
  })

  await t.test("a different viewer-role member CANNOT archive another user's document (404)", async () => {
    const res = await app.inject({ method: 'DELETE', url: docUrl(projectId, viewerDocId), headers: { cookie: viewer2Cookie } })
    assert.equal(res.statusCode, 404)
    const rows = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.id, viewerDocId))
    assert.equal(rows[0].status, 'active')
  })

  await t.test('...but that same viewer CAN still read the document in the list', async () => {
    assert.ok((await listIds(projectId, viewer2Cookie)).includes(viewerDocId))
  })

  // 11 ────────────────────────────────────────────────────────────────────
  await t.test("admin-role member CAN edit another user's document", async () => {
    const res = await app.inject({
      method: 'PATCH', url: docUrl(projectId, viewerDocId), headers: { cookie: adminCookie },
      payload: { title: 'Edited by admin' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.document.title, 'Edited by admin')
    assert.equal(res.json().data.document.uploadedBy, viewer.id) // uploader unchanged
  })

  await t.test("project creator CAN edit another user's document", async () => {
    const res = await app.inject({
      method: 'PATCH', url: docUrl(projectId, viewerDocId), headers: { cookie: ownerCookie },
      payload: { title: 'Edited by creator' },
    })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json().data.document.title, 'Edited by creator')
  })

  await t.test("admin-role member CAN archive another user's document", async () => {
    const doc = await createDoc(projectId, viewerCookie, { category: 'approvals' })
    const res = await app.inject({ method: 'DELETE', url: docUrl(projectId, doc.id), headers: { cookie: adminCookie } })
    assert.equal(res.statusCode, 204)
    assert.equal((await listIds(projectId, ownerCookie)).includes(doc.id), false)
  })

  await t.test("project creator CAN archive another user's document", async () => {
    const doc = await createDoc(projectId, viewerCookie, { category: 'site-documents' })
    const res = await app.inject({ method: 'DELETE', url: docUrl(projectId, doc.id), headers: { cookie: ownerCookie } })
    assert.equal(res.statusCode, 204)
    assert.equal((await listIds(projectId, ownerCookie)).includes(doc.id), false)
  })

  // 12 ────────────────────────────────────────────────────────────────────
  await t.test('PATCH with an empty body is rejected (400 EMPTY_PATCH)', async () => {
    const res = await app.inject({ method: 'PATCH', url: docUrl(projectId, ownerDocId), headers: { cookie: ownerCookie }, payload: {} })
    assert.equal(res.statusCode, 400)
    assert.equal(res.json().error.code, 'EMPTY_PATCH')
  })

  await t.test('PATCH validates fields (invalid category, blank title → 400)', async () => {
    const badCategory = await app.inject({
      method: 'PATCH', url: docUrl(projectId, ownerDocId), headers: { cookie: ownerCookie }, payload: { category: 'photos' },
    })
    assert.equal(badCategory.statusCode, 400)
    const blankTitle = await app.inject({
      method: 'PATCH', url: docUrl(projectId, ownerDocId), headers: { cookie: ownerCookie }, payload: { title: '   ' },
    })
    assert.equal(blankTitle.statusCode, 400)
  })

  await t.test('PATCH changes only title / description / category; file metadata and ownership are immutable', async () => {
    const before = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.id, ownerDocId))
    const res = await app.inject({
      method: 'PATCH', url: docUrl(projectId, ownerDocId), headers: { cookie: ownerCookie },
      payload: {
        title: 'Renamed', description: 'Now with a description', category: 'estimates-boq',
        // Forged immutable fields must be ignored, not applied.
        fileName: 'renamed.pdf', size: 1, uploadedBy: viewer.id, status: 'archived', storageRef: 'evil://x',
      },
    })
    assert.equal(res.statusCode, 200)
    const doc = res.json().data.document
    assert.equal(doc.title, 'Renamed')
    assert.equal(doc.description, 'Now with a description')
    assert.equal(doc.category, 'estimates-boq')
    assert.equal(doc.id, ownerDocId)
    assert.equal(doc.projectId, projectId)
    assert.equal(doc.uploadedBy, owner.id)
    assert.equal(doc.fileName, before[0].fileName)
    assert.equal(doc.mimeType, before[0].mimeType)
    assert.equal(doc.size, before[0].size)
    assert.equal(doc.status, 'active')
    assert.equal('storageRef' in doc, false)

    const after = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.id, ownerDocId))
    assert.equal(after[0].storageRef, before[0].storageRef)
    assert.equal(after[0].fileName, before[0].fileName)
    assert.equal(after[0].size, before[0].size)
    assert.equal(after[0].uploadedBy, owner.id)
    assert.equal(after[0].status, 'active')
  })

  // 13 ────────────────────────────────────────────────────────────────────
  await t.test('archived document is absent from the active list', async () => {
    assert.equal((await listIds(projectId, ownerCookie)).includes(archiveDocId), false)
    assert.equal((await listIds(projectId, viewerCookie)).includes(archiveDocId), false)
  })

  await t.test('archived row persists with status archived and archivedAt set (soft-delete, not a hard DELETE)', async () => {
    const rows = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.id, archiveDocId))
    assert.equal(rows.length, 1)
    assert.equal(rows[0].status, 'archived')
    assert.ok(rows[0].archivedAt)
  })

  // 14 ────────────────────────────────────────────────────────────────────
  await t.test('archiving an already-archived document returns 404', async () => {
    const byUploader = await app.inject({ method: 'DELETE', url: docUrl(projectId, archiveDocId), headers: { cookie: viewerCookie } })
    assert.equal(byUploader.statusCode, 404)
    const byOwner = await app.inject({ method: 'DELETE', url: docUrl(projectId, archiveDocId), headers: { cookie: ownerCookie } })
    assert.equal(byOwner.statusCode, 404)
  })

  // 15 ────────────────────────────────────────────────────────────────────
  await t.test('malformed project id → 400 INVALID_ID', async () => {
    const list = await app.inject({ method: 'GET', url: docsUrl('not-a-uuid'), headers: { cookie: ownerCookie } })
    assert.equal(list.statusCode, 400)
    assert.equal(list.json().error.code, 'INVALID_ID')
    const badId = multipartDoc({})
    const create = await app.inject({ method: 'POST', url: docsUrl('not-a-uuid'), headers: { cookie: ownerCookie, ...badId.headers }, payload: badId.payload })
    assert.equal(create.statusCode, 400)
    assert.equal(create.json().error.code, 'INVALID_ID')
  })

  await t.test('malformed document id → 400 INVALID_ID', async () => {
    const patch = await app.inject({
      method: 'PATCH', url: docUrl(projectId, 'not-a-uuid'), headers: { cookie: ownerCookie }, payload: { title: 'x' },
    })
    assert.equal(patch.statusCode, 400)
    assert.equal(patch.json().error.code, 'INVALID_ID')
    const del = await app.inject({ method: 'DELETE', url: docUrl(projectId, 'not-a-uuid'), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 400)
    assert.equal(del.json().error.code, 'INVALID_ID')
  })

  await t.test('nonexistent (valid UUID) project → 404', async () => {
    const missing = randomUUID()
    const list = await app.inject({ method: 'GET', url: docsUrl(missing), headers: { cookie: ownerCookie } })
    assert.equal(list.statusCode, 404)
    const missingMp = multipartDoc({})
    const create = await app.inject({ method: 'POST', url: docsUrl(missing), headers: { cookie: ownerCookie, ...missingMp.headers }, payload: missingMp.payload })
    assert.equal(create.statusCode, 404)
  })

  await t.test('nonexistent (valid UUID) document in an accessible project → 404', async () => {
    const patch = await app.inject({
      method: 'PATCH', url: docUrl(projectId, randomUUID()), headers: { cookie: ownerCookie }, payload: { title: 'x' },
    })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: docUrl(projectId, randomUUID()), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 404)
  })

  // 16 ────────────────────────────────────────────────────────────────────
  await t.test("a document id from a DIFFERENT accessible project → 404 (no cross-project mutation)", async () => {
    project2DocId = (await createDoc(project2Id, ownerCookie, { title: 'Belongs to project 2' })).id

    // Owner can access BOTH projects, yet the document is not addressable through project 1.
    const patch = await app.inject({
      method: 'PATCH', url: docUrl(projectId, project2DocId), headers: { cookie: ownerCookie }, payload: { title: 'Cross-project edit' },
    })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: docUrl(projectId, project2DocId), headers: { cookie: ownerCookie } })
    assert.equal(del.statusCode, 404)

    // It is unchanged and still active in its own project, and never leaks into project 1's list.
    const rows = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.id, project2DocId))
    assert.equal(rows[0].title, 'Belongs to project 2')
    assert.equal(rows[0].status, 'active')
    assert.deepEqual(await listIds(project2Id, ownerCookie), [project2DocId])
    assert.equal((await listIds(projectId, ownerCookie)).includes(project2DocId), false)
  })

  // 17 ────────────────────────────────────────────────────────────────────
  await t.test('cross-organization isolation: Org B member cannot list, create, edit or archive Org A project documents', async () => {
    const orgBRes = await app.inject({
      method: 'POST', url: '/api/v1/organizations', headers: { cookie: orgBCookie },
      payload: { name: uniqueName('Org B') },
    })
    assert.equal(orgBRes.statusCode, 201)

    const list = await app.inject({ method: 'GET', url: docsUrl(projectId), headers: { cookie: orgBCookie } })
    assert.equal(list.statusCode, 404)
    const orgBMp = multipartDoc({})
    const create = await app.inject({ method: 'POST', url: docsUrl(projectId), headers: { cookie: orgBCookie, ...orgBMp.headers }, payload: orgBMp.payload })
    assert.equal(create.statusCode, 404)
    const patch = await app.inject({
      method: 'PATCH', url: docUrl(projectId, ownerDocId), headers: { cookie: orgBCookie }, payload: { title: 'Cross-org' },
    })
    assert.equal(patch.statusCode, 404)
    const del = await app.inject({ method: 'DELETE', url: docUrl(projectId, ownerDocId), headers: { cookie: orgBCookie } })
    assert.equal(del.statusCode, 404)

    // …and none of it had any effect: the target document is untouched and
    // no Org B-created row exists in the project.
    const target = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.id, ownerDocId))
    assert.equal(target[0].title, 'Renamed')
    assert.equal(target[0].status, 'active')
    assert.equal(target[0].archivedAt, null)
    const orgBRows = await getDb(env!).select().from(projectDocuments).where(eq(projectDocuments.uploadedBy, orgBUser.id))
    assert.equal(orgBRows.length, 0)
  })

  await t.test('C16: shared customer can retrieve document bytes; internal denied', async () => {
    const customer = await createTestUser(env!)
    const customerCookie = sessionCookieHeader(await createTestSessionToken(env!, customer.id))
    const email = `c16-${uniqueName('d').replace(' ', '-')}@example.com`
    await app.inject({
      method: 'POST', url: '/api/v1/customer-profile', headers: { cookie: customerCookie },
      payload: { fullName: 'C16 Customer', email },
    })
    await app.inject({
      method: 'PUT', url: `/api/v1/projects/${projectId}/customer`, headers: { cookie: ownerCookie },
      payload: { email },
    })
    await app.inject({
      method: 'POST', url: `/api/v1/projects/${projectId}/customer/accept`, headers: { cookie: customerCookie },
    })

    const list = await app.inject({ method: 'GET', url: docsUrl(projectId), headers: { cookie: ownerCookie } })
    const internalDoc = list.json().data.documents.find((d: { id: string }) => d.id === ownerDocId)
    assert.ok(internalDoc?.contentUrl)
    const denied = await app.inject({ method: 'GET', url: internalDoc.contentUrl, headers: { cookie: customerCookie } })
    assert.equal(denied.statusCode, 404)

    await app.inject({
      method: 'PATCH', url: docUrl(projectId, ownerDocId), headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    const allowed = await app.inject({ method: 'GET', url: internalDoc.contentUrl, headers: { cookie: customerCookie } })
    assert.equal(allowed.statusCode, 200)
    assert.ok(Buffer.from(allowed.rawPayload).equals(TINY_PDF))

    await cleanupTestUser(env!, customer.id)
  })
})

