// ─── Estimate generation + final/lock — Post-S27 Slice 1 ───────────────────

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { estimateItems, estimates } from '../db/schema.js'
import {
  cleanupTestUser,
  createTestSessionToken,
  createTestUser,
  loadTestEnv,
  sessionCookieHeader,
  uniqueName,
} from '../testUtils.js'
import { buildSummaryMaterialQuantities } from './materialQuantityFormulas.js'

const env = loadTestEnv()

test('material quantity formulas: cement scales with area', () => {
  const small = buildSummaryMaterialQuantities({
    builtUpArea: 1000,
    floors: 2,
    constructionLevel: 'Standard',
    location: 'Hyderabad',
  })
  const large = buildSummaryMaterialQuantities({
    builtUpArea: 2000,
    floors: 2,
    constructionLevel: 'Standard',
    location: 'Hyderabad',
  })
  const cementSmall = small.find(q => q.name === 'Cement')!
  const cementLarge = large.find(q => q.name === 'Cement')!
  assert.ok(cementSmall.quantity > 0)
  assert.ok(cementLarge.quantity > cementSmall.quantity)
  assert.equal(cementSmall.unit, 'bags')
})

test(
  'estimate generate + finalize + lock: rates snapshot, mutate rejected, version fork',
  { skip: !env && 'DATABASE_URL not configured' },
  async t => {
    const app = await buildApp(env!)
    const owner = await createTestUser(env!)
    const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))

    let organizationId = ''
    let projectId = ''
    let estimateId = ''
    let lockedRatePaise = 0

    after(async () => {
      await app.close()
      await cleanupTestUser(env!, owner.id)
      await closeDb()
    })

    await t.test('setup org, project, cement rate, empty estimate', async () => {
      const orgRes = await app.inject({
        method: 'POST',
        url: '/api/v1/organizations',
        headers: { cookie: ownerCookie },
        payload: { name: uniqueName('Gen Org') },
      })
      assert.equal(orgRes.statusCode, 201)
      organizationId = orgRes.json().data.organization.id

      const projectRes = await app.inject({
        method: 'POST',
        url: '/api/v1/projects',
        headers: { cookie: ownerCookie },
        payload: {
          name: uniqueName('Gen Site'),
          organizationId,
          location: 'Hyderabad, Telangana',
        },
      })
      assert.equal(projectRes.statusCode, 201)
      projectId = projectRes.json().data.project.id

      const rateRes = await app.inject({
        method: 'POST',
        url: `/api/v1/organizations/${organizationId}/rates`,
        headers: { cookie: ownerCookie },
        payload: {
          kind: 'material',
          name: 'Cement',
          unit: 'bags',
          ratePaise: 45000,
          effectiveFrom: '2026-01-01',
        },
      })
      assert.equal(rateRes.statusCode, 201, rateRes.body)

      const estRes = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates`,
        headers: { cookie: ownerCookie },
        payload: {
          name: uniqueName('Generated Estimate'),
          pricingMethod: 'detailed_boq',
          location: 'Hyderabad, Telangana',
          areaSqft: 2000,
        },
      })
      assert.equal(estRes.statusCode, 201, estRes.body)
      estimateId = estRes.json().data.estimate.id
    })

    await t.test('generate seeds materials; cement rate resolved; others may be unresolved', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/generate`,
        headers: { cookie: ownerCookie },
        payload: {
          builtUpArea: 2000,
          floors: 2,
          constructionLevel: 'Standard',
        },
      })
      assert.equal(res.statusCode, 200, res.body)
      const body = res.json().data
      assert.deepEqual(body.stagesCompleted, ['requirements', 'quantities', 'rates', 'summary'])
      assert.equal(body.quantitiesSeeded, 5)
      assert.ok(body.ratesResolved >= 1)
      assert.ok(body.ratesUnresolved >= 0)

      const items = body.estimate.items as Array<{
        name: string
        category: string
        quantity: number
        ratePaise: number | null
        rateSource: string | null
      }>
      assert.ok(items.length >= 5)
      const cement = items.find(i => i.name === 'Cement')!
      assert.equal(cement.category, 'material')
      assert.ok(cement.quantity > 0)
      assert.equal(cement.ratePaise, 45000)
      assert.equal(cement.rateSource, 'organization_price_book')
      lockedRatePaise = cement.ratePaise!

      const unresolved = items.filter(i => i.ratePaise == null)
      // Honest: no fabricated market/AI rates for unknown materials.
      for (const u of unresolved) {
        assert.equal(u.rateSource, null)
      }
    })

    await t.test('finalize sets final and remains editable', async () => {
      // Fill remaining rates so lock can succeed later.
      const detail = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(detail.statusCode, 200)
      const items = detail.json().data.estimate.items as Array<{ id: string; ratePaise: number | null }>
      for (const item of items) {
        if (item.ratePaise != null) continue
        const patch = await app.inject({
          method: 'PATCH',
          url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${item.id}`,
          headers: { cookie: ownerCookie },
          payload: { rate: 100 },
        })
        assert.equal(patch.statusCode, 200, patch.body)
      }

      const fin = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/finalize`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(fin.statusCode, 200, fin.body)
      assert.equal(fin.json().data.estimate.status, 'final')

      const stillEdit = await app.inject({
        method: 'PATCH',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${items[0].id}`,
        headers: { cookie: ownerCookie },
        payload: { notes: 'still editable when final' },
      })
      assert.equal(stillEdit.statusCode, 200, stillEdit.body)
    })

    await t.test('lock freezes mutate APIs; price book change does not alter locked rate', async () => {
      const lock = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/lock`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(lock.statusCode, 200, lock.body)
      assert.equal(lock.json().data.estimate.status, 'locked')
      assert.ok(lock.json().data.estimate.lockedAt)
      assert.equal(lock.json().data.estimate.lockedBy, owner.id)

      const detail = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}`,
        headers: { cookie: ownerCookie },
      })
      const cement = (detail.json().data.estimate.items as Array<{ id: string; name: string }>).find(
        i => i.name === 'Cement',
      )!

      const blocked = await app.inject({
        method: 'PATCH',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${cement.id}`,
        headers: { cookie: ownerCookie },
        payload: { rate: 999 },
      })
      assert.equal(blocked.statusCode, 409)
      assert.equal(blocked.json().error.code, 'ESTIMATE_LOCKED')

      const genBlocked = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/generate`,
        headers: { cookie: ownerCookie },
        payload: { replaceItems: true, builtUpArea: 2000 },
      })
      assert.equal(genBlocked.statusCode, 409)

      // New price book rate must not change locked snapshot.
      const newRate = await app.inject({
        method: 'POST',
        url: `/api/v1/organizations/${organizationId}/rates`,
        headers: { cookie: ownerCookie },
        payload: {
          kind: 'material',
          name: 'Cement',
          unit: 'bags',
          ratePaise: 99900,
          effectiveFrom: '2026-09-25',
        },
      })
      assert.equal(newRate.statusCode, 201, newRate.body)

      const after = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}`,
        headers: { cookie: ownerCookie },
      })
      const cementAfter = (
        after.json().data.estimate.items as Array<{ name: string; ratePaise: number }>
      ).find(i => i.name === 'Cement')!
      assert.equal(cementAfter.ratePaise, lockedRatePaise)
    })

    await t.test('new version from locked unlocks parent; prior version unchanged', async () => {
      const db = getDb(env!)
      const beforeRows = await db.select().from(estimates).where(eq(estimates.id, estimateId))
      const lockedVersionId = beforeRows[0]!.currentVersionId!
      const lockedItems = await db
        .select()
        .from(estimateItems)
        .where(eq(estimateItems.estimateVersionId, lockedVersionId))
      const lockedCement = lockedItems.find(i => i.name === 'Cement')!

      const fork = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/versions`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(fork.statusCode, 201, fork.body)
      assert.equal(fork.json().data.estimate.status, 'draft')
      assert.equal(fork.json().data.estimate.lockedAt, null)
      assert.notEqual(fork.json().data.estimate.currentVersionId, lockedVersionId)

      const stillLocked = await db
        .select()
        .from(estimateItems)
        .where(eq(estimateItems.id, lockedCement.id))
      assert.equal(stillLocked[0]!.ratePaise, lockedRatePaise)

      // New version is editable.
      const newCement = (
        fork.json().data.estimate.items as Array<{ id: string; name: string }>
      ).find(i => i.name === 'Cement')!
      const edit = await app.inject({
        method: 'PATCH',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${newCement.id}`,
        headers: { cookie: ownerCookie },
        payload: { notes: 'revised after lock' },
      })
      assert.equal(edit.statusCode, 200, edit.body)
    })
  },
)
