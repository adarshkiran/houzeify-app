/** Screen 19 — Hozie (ai-advisor): mock with honest copy until a real LLM seam.
 *
 *  Roadmap Phase 8: "real AI seam or keep mock with honest copy".
 *  There is no LLM backend today — `getAdvisorReply` in aiAdvisor.ts remains
 *  the only reply seam (deterministic). Do not invent OpenAI/network calls.
 */

export const HOZIE_ROUTE = 'ai-advisor' as const

/** Always false until a real LLM/API backend ships. */
export function isHozieLlmReady(): boolean {
  return false
}

export const HOZIE_HONEST_COPY = {
  eyebrow: 'Hozie',
  greeting: "Hi, I'm Hozie.",
  subtitle: 'Guided construction advice from your project context.',
  body: 'Ask about costs, plans, materials, contractors, or your next step.',
  disclaimer:
    'Replies are guided suggestions from known project context — not a live AI model yet.',
} as const
