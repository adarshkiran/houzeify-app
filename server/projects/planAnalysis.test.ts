// ─── Plan analysis foundation tests — S24 ──────────────────────────────────

import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { resetObjectStorageCache } from '../storage/objectStorage.js'
import {
  cleanupTestUser,
  createTestSessionToken,
  createTestUser,
  loadTestEnv,
  sessionCookieHeader,
  uniqueName,
} from '../testUtils.js'
import {
  isPlanAnalysisEngineReady,
  PLAN_ANALYSIS_ENGINE_UNAVAILABLE_MESSAGE,
} from './planAnalysis.service.js'

process.env.STORAGE_PROVIDER = 'local'
process.env.MEDIA_LOCAL_ROOT = mkdtempSync(path.join(tmpdir(), 'houzeify-s24-plan-'))
resetObjectStorageCache()

const env = loadTestEnv()

const TINY_PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n')

function multipartDoc(fields: {
  fileName?: string
  category?: string
  title?: string
  body?: Buffer
  contentType?: string
}) {
  const boundary = '----HouzefiyS24Plan'
  const fileName = fields.fileName ?? `${uniqueName('house-plan')}.pdf`
  const category = fields.category ?? 'plans'
  const body = fields.body ?? TINY_PDF
  const contentType = fields.contentType ?? 'application/pdf'
  const chunks: Buffer[] = []
  function addField(name: string, value: string) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ),
    )
  }
  addField('category', category)
  if (fields.title !== undefined) addField('title', fields.title)
  chunks.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`,
    ),
  )
  chunks.push(body)
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`))
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat(chunks),
  }
}

test('isPlanAnalysisEngineReady is false (no fabricated OCR)', () => {
  assert.equal(isPlanAnalysisEngineReady(), false)
})

test(
  'plan analyses: upload document → create analysis unavailable → patch review → auth',
  { skip: !env && 'DATABASE_URL not configured' },
  async t => {
    const app = await buildApp(env!)
    const owner = await createTestUser(env!)
    const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
    const viewer = await createTestUser(env!)
    const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
    const outsider = await createTestUser(env!)
    const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

    let organizationId = ''
    let projectId = ''
    let documentId = ''
    let analysisId = ''

    const analysesUrl = (pid: string) => `/api/v1/projects/${pid}/plan-analyses`
    const analysisUrl = (pid: string, aid: string) => `/api/v1/projects/${pid}/plan-analyses/${aid}`
    const docsUrl = (pid: string) => `/api/v1/projects/${pid}/documents`

    after(async () => {
      await app.close()
      await cleanupTestUser(env!, owner.id)
      await cleanupTestUser(env!, viewer.id)
      await cleanupTestUser(env!, outsider.id)
      await closeDb()
      resetObjectStorageCache()
    })

    await t.test('setup: org + project + viewer', async () => {
      const orgRes = await app.inject({
        method: 'POST',
        url: '/api/v1/organizations',
        headers: { cookie: ownerCookie },
        payload: { name: uniqueName('Plan Org') },
      })
      assert.equal(orgRes.statusCode, 201)
      organizationId = orgRes.json().data.organization.id

      const db = getDb(env!)
      await db.insert(organizationMembers).values([
        { organizationId, userId: viewer.id, role: 'viewer', status: 'active', joinedAt: new Date() },
      ])

      const projectRes = await app.inject({
        method: 'POST',
        url: '/api/v1/projects',
        headers: { cookie: ownerCookie },
        payload: {
          name: uniqueName('Plan Site'),
          organizationId,
          location: 'Hyderabad, Telangana',
        },
      })
      assert.equal(projectRes.statusCode, 201)
      projectId = projectRes.json().data.project.id
    })

    await t.test('empty list for new project', async () => {
      const res = await app.inject({
        method: 'GET',
        url: analysesUrl(projectId),
        headers: { cookie: ownerCookie },
      })
      assert.equal(res.statusCode, 200)
      assert.deepEqual(res.json().data.analyses, [])
    })

    await t.test('outsider list is 404', async () => {
      const res = await app.inject({
        method: 'GET',
        url: analysesUrl(projectId),
        headers: { cookie: outsiderCookie },
      })
      assert.equal(res.statusCode, 404)
    })

    await t.test('upload house plan document', async () => {
      const { headers, payload } = multipartDoc({
        category: 'plans',
        title: 'Ground floor PDF',
        fileName: `${uniqueName('gf')}.pdf`,
      })
      const res = await app.inject({
        method: 'POST',
        url: docsUrl(projectId),
        headers: { cookie: ownerCookie, ...headers },
        payload,
      })
      assert.equal(res.statusCode, 201, res.body)
      documentId = res.json().data.document.id
    })

    await t.test('create analysis returns unavailable — no fabricated extraction', async () => {
      const res = await app.inject({
        method: 'POST',
        url: analysesUrl(projectId),
        headers: { cookie: ownerCookie },
        payload: { documentId },
      })
      assert.equal(res.statusCode, 201, res.body)
      const analysis = res.json().data.analysis
      analysisId = analysis.id
      assert.equal(analysis.status, 'unavailable')
      assert.equal(analysis.engineMessage, PLAN_ANALYSIS_ENGINE_UNAVAILABLE_MESSAGE)
      assert.equal(analysis.sourceDocumentId, documentId)
      assert.equal(analysis.projectId, projectId)
      assert.equal(analysis.organizationId, organizationId)
      assert.equal(analysis.extractedData.projectType, null)
      assert.equal(analysis.extractedData.builtUpAreaSqft, null)
      assert.equal(analysis.extractedData.floors, null)
      assert.deepEqual(analysis.extractedData.spaces, [])
      assert.deepEqual(analysis.extractedData.openings, [])
      assert.deepEqual(analysis.extractedData.dimensions, [])
    })

    await t.test('viewer can list and get analysis', async () => {
      const list = await app.inject({
        method: 'GET',
        url: analysesUrl(projectId),
        headers: { cookie: viewerCookie },
      })
      assert.equal(list.statusCode, 200)
      assert.equal(list.json().data.analyses.length, 1)

      const get = await app.inject({
        method: 'GET',
        url: analysisUrl(projectId, analysisId),
        headers: { cookie: viewerCookie },
      })
      assert.equal(get.statusCode, 200)
      assert.equal(get.json().data.analysis.id, analysisId)
    })

    await t.test('viewer cannot patch (mutation boundary)', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: analysisUrl(projectId, analysisId),
        headers: { cookie: viewerCookie },
        payload: {
          extractedData: {
            projectType: 'G+1 residential',
            builtUpAreaSqft: 1800,
            floors: 2,
            spaces: [],
            openings: [],
            dimensions: [],
            notes: 'viewer edit',
          },
        },
      })
      assert.equal(res.statusCode, 404)
    })

    await t.test('owner can save reviewed / user-edited fields', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: analysisUrl(projectId, analysisId),
        headers: { cookie: ownerCookie },
        payload: {
          extractedData: {
            projectType: 'G+1 residential',
            builtUpAreaSqft: 1850,
            floors: 2,
            spaces: [
              { id: 's1', name: 'Master Bedroom', kind: 'bedroom', source: 'user' },
              { id: 's2', name: 'Kitchen', kind: 'kitchen', source: 'user' },
            ],
            openings: [{ id: 'o1', kind: 'door', label: 'Main door', source: 'user' }],
            dimensions: [
              { id: 'd1', label: 'Plot width', value: '30', unit: 'ft', source: 'user' },
            ],
            notes: 'Manual review until analyzer is connected.',
          },
        },
      })
      assert.equal(res.statusCode, 200, res.body)
      const data = res.json().data.analysis.extractedData
      assert.equal(data.projectType, 'G+1 residential')
      assert.equal(data.builtUpAreaSqft, 1850)
      assert.equal(data.floors, 2)
      assert.equal(data.spaces.length, 2)
      assert.equal(data.spaces[0].source, 'user')
      assert.equal(data.openings.length, 1)
      assert.equal(data.dimensions.length, 1)
      assert.match(data.notes, /Manual review/)
      // Status stays unavailable — we did not fabricate engine completion
      assert.equal(res.json().data.analysis.status, 'unavailable')
    })

    await t.test('missing documentId rejected', async () => {
      const res = await app.inject({
        method: 'POST',
        url: analysesUrl(projectId),
        headers: { cookie: ownerCookie },
        payload: {},
      })
      assert.equal(res.statusCode, 400)
    })
  },
)
