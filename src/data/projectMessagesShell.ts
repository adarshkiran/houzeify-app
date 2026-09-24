/** Screen 16 — Project Messages / Questions honest empty shell (gated).
 *
 *  Roadmap Phase 6: implement real messaging ONLY after message persistence
 *  exists (C25 greenfield). Until then this module owns the empty-shell
 *  contract — never invent threads, senders, or unread counts.
 */

export const PROJECT_MESSAGES_ROUTE = 'project-messages' as const

/** Always false until a real conversation store + API ships. */
export function isProjectMessagesPersistenceReady(): boolean {
  return false
}

export const PROJECT_MESSAGES_SHELL = {
  eyebrow: 'Questions',
  intro: 'Ask and follow project questions with your construction company here.',
  emptyTitle: 'Messaging not available yet',
  emptyBody:
    'Project questions and conversations will appear here when messaging is ready. No invented threads or unread counts are shown.',
  missingProjectTitle: 'No project selected',
  missingProjectBody: 'Open a project first, then use Questions to view project messages.',
} as const
