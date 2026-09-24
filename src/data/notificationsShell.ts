/** Screen 17 — Notifications honest empty shell (gated).
 *
 *  Roadmap Phase 6: implement real notifications ONLY after notification
 *  events exist (C25 greenfield). Until then this module owns the empty-shell
 *  contract — never invent cards, unread counts, or timestamps.
 */

export const NOTIFICATIONS_ROUTE = 'notifications' as const

/** Always false until a real notification events + API ships. */
export function isNotificationEventsReady(): boolean {
  return false
}

export const NOTIFICATIONS_SHELL = {
  eyebrow: 'Notifications',
  intro: 'Stay on top of important updates from your construction projects.',
  emptyTitle: 'Notifications not available yet',
  emptyBody:
    'Project alerts will appear here when notification events are ready. No invented cards or unread badges are shown.',
} as const
