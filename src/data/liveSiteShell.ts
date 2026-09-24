/** Screen 18 — Live Site Coming Soon contract (gated on camera infra).
 *
 *  Roadmap Phase 7: implement real Live Site ONLY after camera + storage
 *  architecture exists. Until then KEEP COMING SOON for both company and
 *  project routes. Daily Progress photos ≠ Live Site — never treat progress
 *  media as a camera feed.
 */

export const LIVE_SITE_COMPANY_ROUTE = 'live-site' as const
export const LIVE_SITE_PROJECT_ROUTE = 'project-live-site' as const

export const LIVE_SITE_ROUTES = [LIVE_SITE_COMPANY_ROUTE, LIVE_SITE_PROJECT_ROUTE] as const

/** Always false until camera/capture/storage architecture ships. */
export function isLiveSiteCameraInfraReady(): boolean {
  return false
}

export const LIVE_SITE_COMING_SOON = {
  company: {
    title: 'Live Site',
    description:
      'Live cameras, captures, and time-lapse will appear here once camera and storage architecture is ready. Daily Progress photos are not Live Site.',
  },
  project: {
    title: 'Live Site',
    description:
      'Live camera feeds and time-lapse for this project will appear here once camera infrastructure is ready. Daily Progress photo evidence is separate — not a live camera feed.',
  },
} as const
