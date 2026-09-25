// ─── Estimate Builder + customer sharing tests — S27 ───────────────────────

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { eq } from 'drizzle-orm'

import { buildApp } from '../app.js'
import { closeDb, getDb } from '../db/client.js'
import { estimateItems } from '../db/schema.js'
import {
  cleanupTestUser,
  createTestSessionToken,
  createTestUser,
  loadTestEnv,
  sessionCookieHeader,
  uniqueName,
} from '../testUtils.js'

const env = loadTestEnv()

test(
  'estimate builder: items, totals, version immutability, S26 rate, customer share',
  { skip: !env && 'DATABASE_URL not configured' },
  async t => {
    const app = await buildApp(env!)
    const owner = await createTestUser(env!)
    const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
    const customer = await createTestUser(env!)
    const customerCookie = sessionCookieHeader(await createTestSessionToken(env!, customer.id))
    const outsider = await createTestUser(env!)
    const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

    let organizationId = ''
    let projectId = ''
    let estimateId = ''
    let version1Id = ''
    let cementItemId = ''
    let masonItemId = ''
    const customerEmail = `s27-${uniqueName('cust').replace(/\s+/g, '-')}@example.com`

    after(async () => {
      await app.close()
      await cleanupTestUser(env!, owner.id)
      await cleanupTestUser(env!, customer.id)
      await cleanupTestUser(env!, outsider.id)
      await closeDb()
    })

    await t.test('setup org, project, customer, estimate, org rate', async () => {
      const orgRes = await app.inject({
        method: 'POST',
        url: '/api/v1/organizations',
        headers: { cookie: ownerCookie },
        payload: { name: uniqueName('S27 Org') },
      })
      assert.equal(orgRes.statusCode, 201)
      organizationId = orgRes.json().data.organization.id

      const projectRes = await app.inject({
        method: 'POST',
        url: '/api/v1/projects',
        headers: { cookie: ownerCookie },
        payload: {
          name: uniqueName('S27 Site'),
          organizationId,
          location: 'Hyderabad, Telangana',
        },
      })
      assert.equal(projectRes.statusCode, 201)
      projectId = projectRes.json().data.project.id

      const profile = await app.inject({
        method: 'POST',
        url: '/api/v1/customer-profile',
        headers: { cookie: customerCookie },
        payload: { fullName: 'S27 Customer', email: customerEmail },
      })
      assert.equal(profile.statusCode, 201, profile.body)

      const invite = await app.inject({
        method: 'PUT',
        url: `/api/v1/projects/${projectId}/customer`,
        headers: { cookie: ownerCookie },
        payload: { email: customerEmail },
      })
      assert.equal(invite.statusCode, 200, invite.body)

      const accept = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/customer/accept`,
        headers: { cookie: customerCookie },
      })
      assert.equal(accept.statusCode, 200, accept.body)

      const est = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates`,
        headers: { cookie: ownerCookie },
        payload: {
          name: 'Villa Estimate',
          pricingMethod: 'detailed_boq',
          areaSqft: 2000,
        },
      })
      assert.equal(est.statusCode, 201, est.body)
      estimateId = est.json().data.estimate.id
      version1Id = est.json().data.estimate.currentVersionId

      const rate = await app.inject({
        method: 'POST',
        url: `/api/v1/organizations/${organizationId}/rates`,
        headers: { cookie: ownerCookie },
        payload: {
          kind: 'material',
          name: 'Cement',
          unit: 'bags',
          ratePaise: 42500,
          effectiveFrom: '2026-09-01',
          sourceType: 'organization_price_book',
        },
      })
      assert.equal(rate.statusCode, 201, rate.body)
    })

    await t.test('create material item without rate — amount null, needsRate', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items`,
        headers: { cookie: ownerCookie },
        payload: {
          name: 'Cement',
          category: 'material',
          quantity: 850,
          unit: 'bags',
        },
      })
      assert.equal(res.statusCode, 201, res.body)
      const item = res.json().data.item
      cementItemId = item.id
      assert.equal(item.quantity, 850)
      assert.equal(item.ratePaise, null)
      assert.equal(item.amountPaise, null)
      assert.equal(item.needsRate, true)
    })

    await t.test('resolve S26 rate onto item — snapshot preserved', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${cementItemId}/resolve-rate`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(res.statusCode, 200, res.body)
      const item = res.json().data.item
      assert.equal(item.ratePaise, 42500)
      assert.equal(item.amountPaise, 36125000) // 850 * 425
      assert.equal(item.rateSource, 'organization_price_book')
      assert.equal(item.effectiveDate, '2026-09-01')
    })

    await t.test('quantity edit recalculates amount; labour item totals', async () => {
      const patch = await app.inject({
        method: 'PATCH',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${cementItemId}`,
        headers: { cookie: ownerCookie },
        payload: { quantity: 900 },
      })
      assert.equal(patch.statusCode, 200, patch.body)
      assert.equal(patch.json().data.item.amountPaise, 38250000) // 900 * 425

      const labour = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items`,
        headers: { cookie: ownerCookie },
        payload: {
          name: 'Mason',
          category: 'labour',
          quantity: 120,
          unit: 'day',
          rate: 900,
        },
      })
      assert.equal(labour.statusCode, 201, labour.body)
      masonItemId = labour.json().data.item.id
      assert.equal(labour.json().data.item.amountPaise, 10800000)
      assert.equal(labour.json().data.item.rateSource, 'manual_override')

      const detail = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(detail.statusCode, 200)
      const summary = detail.json().data.estimate.summary
      assert.equal(summary.itemCount, 2)
      assert.equal(summary.materialTotalPaise, 38250000)
      assert.equal(summary.labourTotalPaise, 10800000)
      assert.equal(summary.grandTotalPaise, 49050000)
      assert.equal(summary.readyToShare, true)
      assert.equal(summary.missingRateCount, 0)
    })

    await t.test('unshared draft is invisible to customer', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/shared`,
        headers: { cookie: customerCookie },
      })
      assert.equal(res.statusCode, 404)
    })

    await t.test('share pins version; customer sees safe payload', async () => {
      const share = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/share`,
        headers: { cookie: ownerCookie },
        payload: {},
      })
      assert.equal(share.statusCode, 200, share.body)
      assert.equal(share.json().data.estimate.status, 'shared')
      assert.equal(share.json().data.estimate.sharedVersionId, version1Id)

      const customerView = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/shared`,
        headers: { cookie: customerCookie },
      })
      assert.equal(customerView.statusCode, 200, customerView.body)
      const body = customerView.json().data.estimate
      assert.equal(body.versionNumber, 1)
      assert.equal(body.grandTotal, 490500)
      assert.ok(Array.isArray(body.items))
      assert.equal(body.items.length, 2)
      // No internal provenance on customer payload
      assert.equal(body.items[0].rateSource, undefined)
      assert.equal(body.items[0].confidence, undefined)
      assert.equal(body.items[0].sourceReference, undefined)
      assert.match(body.disclaimer, /estimate/i)
    })

    await t.test('outsider cannot view shared estimate', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/shared`,
        headers: { cookie: outsiderCookie },
      })
      assert.equal(res.statusCode, 404)
    })

    await t.test('new version copies items; old version immutable after edits', async () => {
      const v2 = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/versions`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(v2.statusCode, 201, v2.body)
      const estimate = v2.json().data.estimate
      assert.equal(estimate.currentVersionNumber, 2)
      assert.notEqual(estimate.currentVersionId, version1Id)
      // Customer share still pinned to v1
      assert.equal(estimate.sharedVersionId, version1Id)

      const cementV2 = estimate.items.find((i: { name: string }) => i.name === 'Cement')
      assert.ok(cementV2)

      const patch = await app.inject({
        method: 'PATCH',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${cementV2.id}`,
        headers: { cookie: ownerCookie },
        payload: { quantity: 1000 },
      })
      assert.equal(patch.statusCode, 200)
      assert.equal(patch.json().data.item.amountPaise, 42500000)

      // Version 1 cement row unchanged
      const db = getDb(env!)
      const v1Items = await db
        .select()
        .from(estimateItems)
        .where(eq(estimateItems.estimateVersionId, version1Id))
      const v1Cement = v1Items.find(i => i.name === 'Cement')
      assert.ok(v1Cement)
      assert.equal(v1Cement!.quantityMilli, 900_000)
      assert.equal(v1Cement!.ratePaise, 42500)
      assert.equal(v1Cement!.amountPaise, 38250000)

      // Customer still sees version 1 totals
      const customerView = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/shared`,
        headers: { cookie: customerCookie },
      })
      assert.equal(customerView.statusCode, 200)
      assert.equal(customerView.json().data.estimate.versionNumber, 1)
      assert.equal(customerView.json().data.estimate.grandTotal, 490500)
    })

    await t.test('org rate change does not mutate estimate snapshot', async () => {
      const newer = await app.inject({
        method: 'POST',
        url: `/api/v1/organizations/${organizationId}/rates`,
        headers: { cookie: ownerCookie },
        payload: {
          kind: 'material',
          name: 'Cement',
          unit: 'bags',
          ratePaise: 45000,
          effectiveFrom: '2026-09-25',
          sourceType: 'organization_price_book',
        },
      })
      assert.equal(newer.statusCode, 201, newer.body)

      const db = getDb(env!)
      const v1Cement = (
        await db.select().from(estimateItems).where(eq(estimateItems.estimateVersionId, version1Id))
      ).find(i => i.name === 'Cement')
      assert.equal(v1Cement!.ratePaise, 42500)
      assert.equal(v1Cement!.effectiveDate, '2026-09-01')
    })

    await t.test('incomplete estimate cannot be shared', async () => {
      const est2 = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates`,
        headers: { cookie: ownerCookie },
        payload: { name: 'Incomplete', pricingMethod: 'detailed_boq' },
      })
      assert.equal(est2.statusCode, 201)
      const id2 = est2.json().data.estimate.id
      await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${id2}/items`,
        headers: { cookie: ownerCookie },
        payload: { name: 'Steel', category: 'material', quantity: 10, unit: 'MT' },
      })
      const share = await app.inject({
        method: 'POST',
        url: `/api/v1/projects/${projectId}/estimates/${id2}/share`,
        headers: { cookie: ownerCookie },
        payload: {},
      })
      assert.equal(share.statusCode, 400)
      assert.equal(share.json().error.code, 'ESTIMATE_INCOMPLETE')
    })

    await t.test('delete item on current version', async () => {
      const del = await app.inject({
        method: 'DELETE',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${masonItemId}`,
        headers: { cookie: ownerCookie },
      })
      // masonItemId is from v1 — current is v2, so delete should 404
      assert.equal(del.statusCode, 404)

      const detail = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}`,
        headers: { cookie: ownerCookie },
      })
      const masonV2 = detail.json().data.estimate.items.find((i: { name: string }) => i.name === 'Mason')
      assert.ok(masonV2)
      const del2 = await app.inject({
        method: 'DELETE',
        url: `/api/v1/projects/${projectId}/estimates/${estimateId}/items/${masonV2.id}`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(del2.statusCode, 204)
    })
  },
)

test('estimate summary helpers do not fabricate totals', async () => {
  const { buildEstimateSummary, serializeEstimateItem } = await import('./projectEstimates.types.js')
  const summary = buildEstimateSummary([], 1500)
  assert.equal(summary.grandTotalPaise, null)
  assert.equal(summary.costPerSqftPaise, null)
  assert.equal(summary.readyToShare, false)
})
