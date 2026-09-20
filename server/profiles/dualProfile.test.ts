// ─── Dual-profile test — 12G-B ──────────────────────────────────────────────
// The mandatory proof of the approved identity model: a single authenticated
// User can hold BOTH a CustomerProfile and a PartnerProfile at once.

import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { buildApp } from '../app.js'
import { closeDb } from '../db/client.js'
import { cleanupTestUser, createTestSessionToken, createTestUser, loadTestEnv, sessionCookieHeader } from '../testUtils.js'

const env = loadTestEnv()

test('one User can have both a CustomerProfile and a PartnerProfile simultaneously', { skip: !env && 'DATABASE_URL not configured' }, async () => {
  const app = await buildApp(env!)
  const user = await createTestUser(env!)
  const cookie = sessionCookieHeader(await createTestSessionToken(env!, user.id))

  try {
    const customerRes = await app.inject({
      method: 'POST',
      url: '/api/v1/customer-profile',
      headers: { cookie },
      payload: { fullName: 'Dual Identity Person' },
    })
    assert.equal(customerRes.statusCode, 201)

    const partnerRes = await app.inject({
      method: 'POST',
      url: '/api/v1/partner-profile',
      headers: { cookie },
      payload: { professionalType: 'interior-designer', fullName: 'Dual Identity Person', accountType: 'individual' },
    })
    assert.equal(partnerRes.statusCode, 201)

    // Both now coexist for the same user — not a role switch, not a
    // one-replaces-the-other, exactly the approved model.
    const getCustomer = await app.inject({ method: 'GET', url: '/api/v1/customer-profile', headers: { cookie } })
    const getPartner = await app.inject({ method: 'GET', url: '/api/v1/partner-profile', headers: { cookie } })
    assert.equal(getCustomer.statusCode, 200)
    assert.equal(getPartner.statusCode, 200)
    assert.equal(getCustomer.json().data.customerProfile.userId, user.id)
    assert.equal(getPartner.json().data.partnerProfile.userId, user.id)
  } finally {
    await app.close()
    await cleanupTestUser(env!, user.id)
    await closeDb()
  }
})
