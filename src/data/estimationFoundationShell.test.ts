import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { COMPANY_NAV_ROUTES, PROJECT_NAV_ROUTES } from './constructionNav.ts'
import { ESTIMATE_FOUNDATION_NOTE, ESTIMATE_ROUTES } from './estimationFoundationShell.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

describe('estimation foundation shell', () => {
  it('registers Estimation on company Side Nav, not Project Workspace', () => {
    assert.equal(COMPANY_NAV_ROUTES.estimation, ESTIMATE_ROUTES.overview)
    assert.equal('estimates' in PROJECT_NAV_ROUTES, false)
    assert.match(ESTIMATE_FOUNDATION_NOTE, /Foundation/)
    assert.match(ESTIMATE_FOUNDATION_NOTE, /S24|house plan|analyzer/i)
  })

  it('keeps BOQ on Project Workspace separate from Estimation module', () => {
    assert.equal(PROJECT_NAV_ROUTES.boq, 'project-boq')
    assert.notEqual(PROJECT_NAV_ROUTES.boq, ESTIMATE_ROUTES.list)
  })

  it('wires estimate screens in App.tsx', () => {
    const app = readFileSync(join(root, 'src/App.tsx'), 'utf8')
    for (const id of Object.values(ESTIMATE_ROUTES)) {
      assert.match(app, new RegExp(`\\| '${id}'`))
      assert.match(app, new RegExp(`screen === '${id}'`))
    }
  })
})
