import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  HOME_SERVICES_KEPT_COMING_SOON,
  HOME_SERVICES_REMOVE_OUT_OF_SCOPE,
  HOME_SERVICES_REMOVED_ROUTES,
} from './homeServicesRemoveShell.ts'
import { BD_PROTECTED_ROUTES } from './businessDevelopmentShell.ts'
import { DASHBOARD_ROUTES } from './homeownerDashboard.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const appTsx = readFileSync(join(root, 'src/App.tsx'), 'utf8')

describe('S21 Home Services REMOVE shell', () => {
  it('removes exactly the Home Services catalogue + booking family (41 ids)', () => {
    assert.equal(HOME_SERVICES_REMOVED_ROUTES.length, 41)
    assert.ok(HOME_SERVICES_REMOVED_ROUTES.includes('home-services'))
    assert.ok(HOME_SERVICES_REMOVED_ROUTES.includes('my-bookings'))
    assert.ok(HOME_SERVICES_REMOVED_ROUTES.includes('saved-addresses'))
    assert.ok(HOME_SERVICES_REMOVED_ROUTES.includes('service-category-detail'))
  })

  it('keeps home-services-coming-soon as the demoted Services entry', () => {
    assert.equal(HOME_SERVICES_KEPT_COMING_SOON, 'home-services-coming-soon')
    assert.equal(DASHBOARD_ROUTES.homeServices, HOME_SERVICES_KEPT_COMING_SOON)
    assert.match(appTsx, /screen === 'home-services-coming-soon'/)
    assert.match(appTsx, /ComingSoonScreen placeholderId="home-services-coming-soon"/)
  })

  it('unwires removed routes from App.tsx (no imports, union, or render)', () => {
    for (const id of HOME_SERVICES_REMOVED_ROUTES) {
      assert.doesNotMatch(
        appTsx,
        new RegExp(`from '@/user/home-services`),
        `App must not import home-services module for ${id}`,
      )
      assert.doesNotMatch(appTsx, new RegExp(`\\| '${id}'`), `AppScreen union must drop ${id}`)
      assert.doesNotMatch(appTsx, new RegExp(`screen === '${id}'`), `render must drop ${id}`)
      assert.doesNotMatch(appTsx, new RegExp(`id: '${id}'`), `SCREEN_GROUPS must drop ${id}`)
    }
  })

  it('does not wrap the app in CustomerCartProvider / CustomerAddressProvider', () => {
    assert.doesNotMatch(appTsx, /CustomerCartProvider/)
    assert.doesNotMatch(appTsx, /CustomerAddressProvider/)
  })

  it('does not remove BD protected routes or out-of-scope legacy families', () => {
    for (const id of BD_PROTECTED_ROUTES) {
      assert.match(appTsx, new RegExp(`\\| '${id}'`))
      assert.match(appTsx, new RegExp(`screen === '${id}'`))
    }
    for (const id of HOME_SERVICES_REMOVE_OUT_OF_SCOPE) {
      assert.match(appTsx, new RegExp(`\\| '${id}'`))
    }
  })

  it('deletes the home-services screen folder from the tree', () => {
    let exists = true
    try {
      readFileSync(join(root, 'src/user/home-services/HomeServicesScreen.tsx'))
    } catch {
      exists = false
    }
    assert.equal(exists, false)
  })
})
