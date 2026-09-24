import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  UX_A11Y_CONTRAST,
  UX_A11Y_MIN_TOUCH_PX,
  UX_A11Y_SUBNAV,
  UX_A11Y_VIEWPORTS,
} from './uxAccessibilityShell.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel: string) => readFileSync(join(root, rel), 'utf8')

describe('S22 UX accessibility shell', () => {
  it('covers roadmap viewports and 44px touch minimum', () => {
    assert.deepEqual([...UX_A11Y_VIEWPORTS], [320, 375, 430, 768, 1024, 1440])
    assert.equal(UX_A11Y_MIN_TOUCH_PX, 44)
  })

  it('keeps ProjectSubNav overflow, edge fades, touch, and focus-visible', () => {
    const src = read('src/shared/components/ProjectSubNav.tsx')
    assert.match(src, new RegExp(UX_A11Y_SUBNAV.overflowClass))
    assert.match(src, /min-h-11/)
    assert.match(src, /focus-visible/)
    assert.match(src, /Edge fades/)
    assert.match(src, /scrollPaddingInline/)
    // Fades remain useful through tablet widths where company tabs overflow
    assert.match(src, /xl:hidden/)
  })

  it('raises light-mode muted / subtle ink contrast for readable UI text', () => {
    const css = read('src/index.css')
    assert.match(css, /--hz-ink-subtle:\s*#6F6A73/)
    assert.match(css, /--muted-foreground:\s*oklch\(0\.45/)
    // Focus ring must not stay the weak light-mode gray
    assert.match(css, /--ring:\s*oklch\(0\.491 0\.27 292/)
  })

  it('keeps AppNavShell expanded items at min-h-11 with focus-visible rings', () => {
    const src = read('src/shared/components/AppNavShell.tsx')
    assert.match(src, /focus-visible:ring-2/)
    assert.match(src, /min-h-11/)
    assert.match(src, /collapsed \? 'justify-center min-w-11 min-h-11/)
    assert.match(src, /: 'justify-start w-full min-h-11/)
  })

  it('avoids low-contrast #808080 on Tasks/Issues filter chips', () => {
    for (const rel of [
      'src/user/projects/ProjectTasksScreen.tsx',
      'src/user/projects/ProjectIssuesScreen.tsx',
    ]) {
      const src = read(rel)
      assert.doesNotMatch(src, new RegExp(UX_A11Y_CONTRAST.forbidLowContrastGrayHex, 'i'))
      assert.match(src, /min-h-11/)
      assert.match(src, /focus-visible/)
    }
  })
})
