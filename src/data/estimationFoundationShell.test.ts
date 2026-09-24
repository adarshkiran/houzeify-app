import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { PROJECT_NAV_ROUTES } from './constructionNav.ts'
import { ESTIMATE_FOUNDATION_NOTE, ESTIMATE_ROUTES } from './estimationFoundationShell.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

describe('estimation foundation shell', () => {
  it('registers Estimates on ProjectSubNav via constructionNav', () => {
    assert.equal(PROJECT_NAV_ROUTES.estimates, ESTIMATE_ROUTES.list)
    assert.match(ESTIMATE_FOUNDATION_NOTE, /Foundation only/)
  })

  it('keeps BOQ route separate from Estimates', () => {
    assert.equal(PROJECT_NAV_ROUTES.boq, 'project-boq')
    assert.notEqual(PROJECT_NAV_ROUTES.boq, PROJECT_NAV_ROUTES.estimates)
  })

  it('wires estimate screens in App.tsx', () => {
    const app = readFileSync(join(root, 'src/App.tsx'), 'utf8')
    for (const id of Object.values(ESTIMATE_ROUTES)) {
      assert.match(app, new RegExp(`\\| '${id}'`))
      assert.match(app, new RegExp(`screen === '${id}'`))
    }
  })
})
