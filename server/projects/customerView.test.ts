import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { organizationMembers } from '../db/schema.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader, uniqueName } from '../testUtils.js'
import { resolveProjectAccess } from './projectAccess.js'

const env = loadTestEnv()

test('customer-view: published progress, documents, isolation, no BOQ leak', { skip: !env && 'DATABASE_URL not configured' }, async t => {
  const app = await buildApp(env!)
  const owner = await createTestUser(env!)
  const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
  const viewer = await createTestUser(env!)
  const viewerCookie = sessionCookieHeader(await createTestSessionToken(env!, viewer.id))
  const customer = await createTestUser(env!)
  const customerCookie = sessionCookieHeader(await createTestSessionToken(env!, customer.id))
  const other = await createTestUser(env!)
  const otherCookie = sessionCookieHeader(await createTestSessionToken(env!, other.id))

  const users = [owner, viewer, customer, other]
  let projectId = ''
  const email = `view-${uniqueName('m08')}@example.com`

  after(async () => {
    await app.close()
    for (const user of users) await cleanupTestUser(env!, user.id)
    await closeDb()
  })

  await t.test('setup + invite + accept', async () => {
    const orgRes = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Org View') },
    })
    const organizationId = orgRes.json().data.organization.id
    await getDb(env!).insert(organizationMembers).values({
      organizationId,
      userId: viewer.id,
      role: 'viewer',
      status: 'active',
      joinedAt: new Date(),
    })
    const projectRes = await app.inject({
      method: 'POST',
      url: '/api/v1/projects',
      headers: { cookie: ownerCookie },
      payload: { name: uniqueName('Site'), organizationId, stage: 'structure' },
    })
    projectId = projectRes.json().data.project.id

    await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie: customerCookie },
      payload: { fullName: 'View Customer', email },
    })

    const invite = await app.inject({
      method: 'PUT',
      url: `/api/v1/projects/${projectId}/customer`,
      headers: { cookie: ownerCookie },
      payload: { email },
    })
    assert.equal(invite.statusCode, 200)

    const invitedView = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view`,
      headers: { cookie: customerCookie },
    })
    assert.equal(invitedView.statusCode, 404)

    const accept = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/customer/accept`,
      headers: { cookie: customerCookie },
    })
    assert.equal(accept.statusCode, 200)

    const access = await resolveProjectAccess(env!, projectId, customer.id)
    assert.equal(access?.kind, 'customer')
  })

  await t.test('progress default internal; owner publish; viewer cannot; unpublished hidden', async () => {
    const created = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/daily-progress`,
      headers: { cookie: ownerCookie },
      payload: { date: '2026-04-01', stage: 'structure', title: 'Slab poured' },
    })
    assert.equal(created.statusCode, 201)
    assert.equal(created.json().data.progress.visibility, 'internal')
    const progressId = created.json().data.progress.id

    const viewerPatch = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`,
      headers: { cookie: viewerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(viewerPatch.statusCode, 404)

    const hidden = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view/progress`,
      headers: { cookie: customerCookie },
    })
    assert.equal(hidden.json().data.progress.length, 0)

    const publish = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(publish.statusCode, 200)
    assert.equal(publish.json().data.progress.visibility, 'customer')
    assert.ok(publish.json().data.progress.publishedAt)

    const shown = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view/progress`,
      headers: { cookie: customerCookie },
    })
    assert.equal(shown.statusCode, 200)
    assert.equal(shown.json().data.progress.length, 1)
    assert.equal(shown.json().data.progress[0].title, 'Slab poured')
    assert.equal(shown.json().data.progress[0].storageRef, undefined)
    assert.equal(shown.json().data.progress[0].photos[0], undefined)

    const header = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view`,
      headers: { cookie: customerCookie },
    })
    assert.equal(header.statusCode, 200)
    assert.equal(header.json().data.project.summary, undefined)
    assert.equal(header.json().data.project.latestProgress.title, 'Slab poured')

    const companyPreview = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view`,
      headers: { cookie: ownerCookie },
    })
    assert.equal(companyPreview.statusCode, 200)

    const unpublish = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}/daily-progress/${progressId}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'internal' },
    })
    assert.equal(unpublish.statusCode, 200)
    const gone = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view/progress`,
      headers: { cookie: customerCookie },
    })
    assert.equal(gone.json().data.progress.length, 0)
  })

  await t.test('documents default internal; shared visible; timeline current; BOQ/tasks 404', async () => {
    const doc = await app.inject({
      method: 'POST',
      url: `/api/v1/projects/${projectId}/documents`,
      headers: { cookie: ownerCookie },
      payload: { category: 'plans', fileName: 'plan.pdf', mimeType: 'application/pdf', size: 1024, title: 'GA Plan' },
    })
    assert.equal(doc.statusCode, 201)
    assert.equal(doc.json().data.document.visibility, 'internal')
    const documentId = doc.json().data.document.id

    const empty = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view/documents`,
      headers: { cookie: customerCookie },
    })
    assert.equal(empty.json().data.documents.length, 0)

    const share = await app.inject({
      method: 'PATCH',
      url: `/api/v1/projects/${projectId}/documents/${documentId}`,
      headers: { cookie: ownerCookie },
      payload: { visibility: 'customer' },
    })
    assert.equal(share.statusCode, 200)

    const shared = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view/documents`,
      headers: { cookie: customerCookie },
    })
    assert.equal(shared.json().data.documents.length, 1)
    assert.equal(shared.json().data.documents[0].title, 'GA Plan')

    const timeline = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view/timeline`,
      headers: { cookie: customerCookie },
    })
    assert.equal(timeline.statusCode, 200)
    const current = timeline.json().data.timeline.find((s: { state: string }) => s.state === 'current')
    assert.equal(current.id, 'structure')

    const workforce = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view/workforce`,
      headers: { cookie: customerCookie },
    })
    assert.equal(workforce.statusCode, 200)
    for (const member of workforce.json().data.workforce) {
      assert.equal(member.email, undefined)
      assert.ok(member.displayName)
      assert.ok(member.role !== undefined)
    }

    for (const path of [`/tasks`, `/issues`, `/boq`]) {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}${path}`,
        headers: { cookie: customerCookie },
      })
      assert.equal(res.statusCode, 404, path)
    }

    const stranger = await app.inject({
      method: 'GET',
      url: `/api/v1/projects/${projectId}/customer-view`,
      headers: { cookie: otherCookie },
    })
    assert.equal(stranger.statusCode, 404)
  })
})
