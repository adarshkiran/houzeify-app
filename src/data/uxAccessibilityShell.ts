/** Screen 22 — Final UX / Accessibility pass (Phase 9).
 *
 *  Roadmap: "Contrast, focus, touch targets, ProjectSubNav overflow across 320–1440"
 *  Scope is product chrome + shared tokens — not S23 audit, not legacy REMOVE.
 */

export const UX_A11Y_VIEWPORTS = [320, 375, 430, 768, 1024, 1440] as const

/** WCAG 2.1 AA minimum interactive target (CSS px). */
export const UX_A11Y_MIN_TOUCH_PX = 44

export const UX_A11Y_FOCUS = {
  /** Shell / SubNav controls must expose a visible keyboard focus ring. */
  requireFocusVisible: true,
} as const

export const UX_A11Y_CONTRAST = {
  /** Meaningful UI text should use ink / ink-muted, not ink-subtle alone. */
  preferMutedOverSubtleForBody: true,
  /** Inactive filter chips must not use raw #808080. */
  forbidLowContrastGrayHex: '#808080',
} as const

export const UX_A11Y_SUBNAV = {
  overflowClass: 'overflow-x-auto',
  edgeFadeDiscoverability: true,
  tabMinHeightClass: 'min-h-11',
} as const
