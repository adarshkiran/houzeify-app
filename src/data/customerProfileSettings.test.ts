import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CUSTOMER_PROFILE_HOZIE_USES,
  CUSTOMER_PROFILE_ROUTE,
  SHARED_SETTINGS_ROUTES,
  customerProfileProjectsLoading,
  customerSidebarSettingsActive,
  pickCustomerProfileCurrentProject,
  sharedSettingsHomeRoute,
} from './customerProfileSettings.ts'

describe('CUSTOMER_PROFILE_ROUTE', () => {
  it('keeps Customer Profile on homeowner-profile', () => {
    assert.equal(CUSTOMER_PROFILE_ROUTE, 'homeowner-profile')
  })
})

describe('SHARED_SETTINGS_ROUTES', () => {
  it('covers dual-rail Settings cluster without inventing screens', () => {
    assert.deepEqual([...SHARED_SETTINGS_ROUTES], [
      'account-settings',
      'personal-profile',
      'plans-billing',
      'ai-advisor',
    ])
  })
})

describe('pickCustomerProfileCurrentProject', () => {
  it('prefers active linked projects over invites', () => {
    const invited = { id: 'a', customerStatus: 'invited' }
    const active = { id: 'b', customerStatus: 'active' }
    assert.equal(pickCustomerProfileCurrentProject([invited, active])?.id, 'b')
  })

  it('falls back to an invite when no active project exists', () => {
    const invited = { id: 'a', customerStatus: 'invited' }
    assert.equal(pickCustomerProfileCurrentProject([invited])?.id, 'a')
  })

  it('returns null when the customer has no linked projects', () => {
    assert.equal(pickCustomerProfileCurrentProject([]), null)
  })
})

describe('sharedSettingsHomeRoute', () => {
  it('routes professionals to Company Home and customers to Customer Home', () => {
    assert.equal(sharedSettingsHomeRoute('professional'), 'professional-dashboard')
    assert.equal(sharedSettingsHomeRoute('homeowner'), 'dashboard-home')
    assert.equal(sharedSettingsHomeRoute(undefined), 'dashboard-home')
  })
})

describe('customerProfileProjectsLoading', () => {
  it('does not treat unauthenticated idle as loading', () => {
    assert.equal(customerProfileProjectsLoading('unauthenticated', 'idle'), false)
    assert.equal(customerProfileProjectsLoading('authenticated', 'idle'), true)
    assert.equal(customerProfileProjectsLoading('authenticated', 'loaded'), false)
    assert.equal(customerProfileProjectsLoading('loading', 'idle'), true)
  })
})

describe('customerSidebarSettingsActive', () => {
  it('highlights Settings in the customer navBottom', () => {
    assert.equal(customerSidebarSettingsActive(), 'settings')
  })
})

describe('CUSTOMER_PROFILE_HOZIE_USES', () => {
  it('avoids estimate, build, contractor, and home-services oriented chips', () => {
    const joined = CUSTOMER_PROFILE_HOZIE_USES.join(' ').toLowerCase()
    for (const banned of ['estimate', 'contractor', 'home services', 'material', 'plan analysis', 'cost']) {
      assert.equal(joined.includes(banned), false, `unexpected legacy chip language: ${banned}`)
    }
    assert.ok(CUSTOMER_PROFILE_HOZIE_USES.length >= 2)
  })
})
