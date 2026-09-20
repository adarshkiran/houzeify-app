// ─── Construction stage ids — server-side validation only ─────────────────
// Mirrors src/data/constructionStages.ts's 10 stage ids exactly. This file
// intentionally carries IDS ONLY — never names/labels/order/durations —
// src/data/constructionStages.ts remains the single source of truth for
// everything display-related; this list exists only because the frontend
// file is unreachable from server/ (confirmed during Module 04) and AJV
// needs a concrete enum to validate against. Keep in sync by hand if
// constructionStages.ts's id set ever changes — there are only 10.
export const VALID_STAGE_IDS = [
  'pre-construction',
  'foundation',
  'structure',
  'masonry',
  'mep',
  'plastering',
  'flooring',
  'doors-windows',
  'painting',
  'final-finishing',
] as const

export type ValidStageId = (typeof VALID_STAGE_IDS)[number]
