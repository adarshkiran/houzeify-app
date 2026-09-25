/** S23 — AI Estimation Advisor shell (guided inputs; no LLM). */

import { ESTIMATE_ROUTES } from './estimationFoundationShell.ts'
import { ESTIMATION_HOUSE_PLAN_ROUTE } from './estimationHousePlanShell.ts'

export const ESTIMATION_ADVISOR_ROUTE = 'project-estimate-advisor' as const

export type EstimationSubNavKind = 'route' | 'soon' | 'external'

export interface EstimationSubNavItem {
  id: string
  label: string
  kind: EstimationSubNavKind
  /** AppScreen id when kind === 'route' | 'external' */
  dest?: string
}

export const ESTIMATION_SUB_NAV_ITEMS: EstimationSubNavItem[] = [
  { id: 'overview', label: 'Overview', kind: 'route', dest: ESTIMATE_ROUTES.overview },
  { id: 'advisor', label: 'AI Estimation Advisor', kind: 'route', dest: ESTIMATION_ADVISOR_ROUTE },
  { id: 'upload-plan', label: 'Upload House Plan', kind: 'route', dest: ESTIMATION_HOUSE_PLAN_ROUTE },
  {
    id: 'material-calculator',
    label: 'Material Calculator',
    kind: 'external',
    dest: 'material-calculator',
  },
  { id: 'estimates', label: 'Estimates', kind: 'route', dest: ESTIMATE_ROUTES.list },
  { id: 'price-intelligence', label: 'Price Intelligence', kind: 'soon' },
  { id: 'price-book', label: 'Price Book', kind: 'soon' },
]

/** Always false until a real LLM/API backend ships for estimation. */
export function isEstimationAdvisorLlmReady(): boolean {
  return false
}

export const ESTIMATION_ADVISOR_COPY = {
  eyebrow: 'AI Estimation Advisor',
  title: 'AI Estimation Advisor',
  subtitle: 'Guided estimation workflow',
  body: 'Answer a few questions to structure project inputs for an estimate.',
  disclaimer:
    'Guided estimation flow — AI-powered analysis will be available in a future release. No market prices or fabricated totals are generated here.',
} as const
