// ─── Price Intelligence API integration tests — S26 ────────────────────────

import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { buildApp } from '../app.js'
import { closeDb } from '../db/client.js'
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
  'price intelligence: create rates, history close, resolve hierarchy, auth',
  { skip: !env && 'DATABASE_URL not configured' },
  async t => {
    const app = await buildApp(env!)
    const owner = await createTestUser(env!)
    const ownerCookie = sessionCookieHeader(await createTestSessionToken(env!, owner.id))
    const outsider = await createTestUser(env!)
    const outsiderCookie = sessionCookieHeader(await createTestSessionToken(env!, outsider.id))

    let organizationId = ''
    let projectId = ''

    after(async () => {
      await app.close()
      await cleanupTestUser(env!, owner.id)
      await cleanupTestUser(env!, outsider.id)
      await closeDb()
    })

    await t.test('setup org + project', async () => {
      const orgRes = await app.inject({
        method: 'POST',
        url: '/api/v1/organizations',
        headers: { cookie: ownerCookie },
        payload: { name: uniqueName('Price Org') },
      })
      assert.equal(orgRes.statusCode, 201)
      organizationId = orgRes.json().data.organization.id

      const projectRes = await app.inject({
        method: 'POST',
        url: '/api/v1/projects',
        headers: { cookie: ownerCookie },
        payload: {
          name: uniqueName('Price Site'),
          organizationId,
          location: 'Hyderabad, Telangana',
        },
      })
      assert.equal(projectRes.statusCode, 201)
      projectId = projectRes.json().data.project.id
    })

    await t.test('outsider cannot list rates', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/organizations/${organizationId}/rates`,
        headers: { cookie: outsiderCookie },
      })
      assert.equal(res.statusCode, 404)
    })

    await t.test('create organization global cement rate', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/organizations/${organizationId}/rates`,
        headers: { cookie: ownerCookie },
        payload: {
          kind: 'material',
          name: 'Cement',
          unit: 'bags',
          ratePaise: 39000,
          effectiveFrom: '2026-01-01',
          sourceType: 'organization_price_book',
        },
      })
      assert.equal(res.statusCode, 201, res.body)
      assert.equal(res.json().data.rate.ratePaise, 39000)
    })

    await t.test('newer rate closes previous open-ended history', async () => {
      const res = await app.inject({
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
      assert.equal(res.statusCode, 201, res.body)

      const list = await app.inject({
        method: 'GET',
        url: `/api/v1/organizations/${organizationId}/rates?name=Cement`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(list.statusCode, 200)
      const rates = list.json().data.rates as Array<{ ratePaise: number; effectiveFrom: string; effectiveTo: string | null }>
      assert.ok(rates.length >= 2)
      const older = rates.find(r => r.ratePaise === 39000)
      const newer = rates.find(r => r.ratePaise === 42500)
      assert.ok(older)
      assert.ok(newer)
      assert.equal(older!.effectiveTo, '2026-08-31')
      assert.equal(newer!.effectiveTo, null)
    })

    await t.test('resolve returns current org rate', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/organizations/${organizationId}/rates/resolve?name=Cement&unit=bags&asOf=2026-09-15`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(res.statusCode, 200)
      const resolved = res.json().data.resolved
      assert.equal(resolved.found, true)
      assert.equal(resolved.ratePaise, 42500)
      assert.equal(resolved.sourceType, 'organization_price_book')
    })

    await t.test('project-specific rate wins over org rate', async () => {
      const create = await app.inject({
        method: 'POST',
        url: `/api/v1/organizations/${organizationId}/rates`,
        headers: { cookie: ownerCookie },
        payload: {
          kind: 'material',
          name: 'Cement',
          unit: 'bags',
          ratePaise: 46000,
          effectiveFrom: '2026-09-01',
          projectId,
        },
      })
      assert.equal(create.statusCode, 201, create.body)

      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/organizations/${organizationId}/rates/resolve?name=Cement&unit=bags&projectId=${projectId}&asOf=2026-09-15`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(res.statusCode, 200)
      const resolved = res.json().data.resolved
      assert.equal(resolved.found, true)
      assert.equal(resolved.ratePaise, 46000)
      assert.equal(resolved.sourceType, 'project_specific')
    })

    await t.test('market reference create rejected while disconnected', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/v1/organizations/${organizationId}/rates`,
        headers: { cookie: ownerCookie },
        payload: {
          kind: 'material',
          name: 'Steel',
          unit: 'MT',
          ratePaise: 7000000,
          effectiveFrom: '2026-09-01',
          sourceType: 'market_reference',
        },
      })
      assert.equal(res.statusCode, 400)
    })

    await t.test('unresolved when no matching rate', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/organizations/${organizationId}/rates/resolve?name=Tiles&unit=sqft&asOf=2026-09-15`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(res.statusCode, 200)
      assert.equal(res.json().data.resolved.found, false)
    })

    await t.test('price intelligence status shows disconnected market/AI', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/organizations/${organizationId}/price-intelligence`,
        headers: { cookie: ownerCookie },
      })
      assert.equal(res.statusCode, 200)
      assert.equal(res.json().data.sources.marketReference, false)
      assert.equal(res.json().data.sources.aiReference, false)
      assert.ok(res.json().data.catalog.materials.includes('Cement'))
    })
  },
)
