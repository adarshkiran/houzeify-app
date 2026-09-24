import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  LIVE_SITE_COMING_SOON,
  LIVE_SITE_COMPANY_ROUTE,
  LIVE_SITE_PROJECT_ROUTE,
  LIVE_SITE_ROUTES,
  isLiveSiteCameraInfraReady,
} from './liveSiteShell.ts'

describe('LIVE_SITE_ROUTES', () => {
  it('keeps company and project Live Site on Coming Soon routes', () => {
    assert.equal(LIVE_SITE_COMPANY_ROUTE, 'live-site')
    assert.equal(LIVE_SITE_PROJECT_ROUTE, 'project-live-site')
    assert.deepEqual([...LIVE_SITE_ROUTES], ['live-site', 'project-live-site'])
  })
})

describe('isLiveSiteCameraInfraReady', () => {
  it('stays false until camera and storage architecture exists (S18 gate)', () => {
    assert.equal(isLiveSiteCameraInfraReady(), false)
  })
})

describe('LIVE_SITE_COMING_SOON', () => {
  it('keeps Coming Soon copy and distinguishes Daily Progress photos', () => {
    assert.equal(LIVE_SITE_COMING_SOON.company.title, 'Live Site')
    assert.equal(LIVE_SITE_COMING_SOON.project.title, 'Live Site')
    assert.match(LIVE_SITE_COMING_SOON.company.description, /Daily Progress photos are not Live Site/i)
    assert.match(LIVE_SITE_COMING_SOON.project.description, /Daily Progress/i)
    assert.ok(!/demo feed|sample camera|fake stream/i.test(LIVE_SITE_COMING_SOON.company.description))
    assert.ok(!/demo feed|sample camera|fake stream/i.test(LIVE_SITE_COMING_SOON.project.description))
  })
})
