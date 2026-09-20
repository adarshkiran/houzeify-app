// ─── AI Advisor — conversation model + deterministic reply engine ───────────
// UI demonstration data only — there is no LLM backend yet. getAdvisorReply()
// is the seam a real AI call replaces; the screen must only ever generate a
// reply through this function, never inline in the component.
//
// No Conversation/Message model existed anywhere in the codebase, so these
// are new — kept intentionally small and matching the brief's own shape.
// Everything else (intent typing, routing table, next-action ladder, project
// stage labels) is reused directly from homeownerDashboard.ts, Screen 012's
// own configuration module, rather than redefined here.

import {
  type HomeownerIntent,
  type HomeownerDashboardState,
  DASHBOARD_ROUTES,
  getNextAction,
} from './homeownerDashboard'

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  userId: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}

export function createConversation(userId: string, projectId?: string): Conversation {
  const now = new Date().toISOString()
  return { id: nextId('conv'), userId, projectId, createdAt: now, updatedAt: now }
}

export function createMessage(conversationId: string, role: MessageRole, content: string): Message {
  return { id: nextId('msg'), conversationId, role, content, createdAt: new Date().toISOString() }
}

// ─── Context bar ────────────────────────────────────────────────────────────
// "🏠 Adarsh's Home Project / Hyderabad · 3 BHK" when a project exists,
// "🏠 Homeowner / Hyderabad" otherwise — never an invented property detail
// (no bedroom count is tracked anywhere, so it's simply omitted, not guessed).

export interface AdvisorContextSummary {
  primaryLabel: string
  locationLabel?: string
  intentLabel: string
}

export const INTENT_LABEL: Record<HomeownerIntent, string> = {
  'build-home': 'Building a new home',
  'improve-home': 'Improving my home',
  'home-service': 'Home service',
}

export function getContextSummary(state: HomeownerDashboardState): AdvisorContextSummary {
  const locationLabel = [state.city, state.state].filter(Boolean).join(', ') || undefined
  return {
    primaryLabel: state.hasProject && state.projectName ? `${state.preferredName}'s ${state.projectName}` : 'Homeowner',
    locationLabel,
    intentLabel: INTENT_LABEL[state.primaryIntent],
  }
}

// ─── Suggested questions — verbatim per intent, never generic ─────────────

export const SUGGESTED_QUESTIONS: Record<HomeownerIntent, string[]> = {
  'build-home': [
    'How much will my house cost?',
    'What should I do before construction starts?',
    'Can you review my estimate?',
    'What materials will I need?',
    'How do I find a good contractor?',
  ],
  'improve-home': [
    'How much will this renovation cost?',
    'Which improvements should I prioritize?',
    'Can I renovate within my budget?',
    'Which professionals do I need?',
    'Can you compare these quotes?',
  ],
  'home-service': [
    'How much should this service cost?',
    'What should I ask a contractor?',
    'How do I choose a professional?',
    'Is this quote reasonable?',
    'What should I check before hiring?',
  ],
}

// ─── Deterministic reply engine ────────────────────────────────────────────
// Every branch below only ever references state already present on
// HomeownerDashboardState — never a fabricated price, contractor or project
// value. "Estimated" / "approximate" language throughout; nothing is ever
// presented as a guaranteed price.

export interface AdvisorAction {
  label: string
  dest: string
}

export interface AdvisorReply {
  content: string
  actions: AdvisorAction[]
}

function findServiceDest(intent: HomeownerIntent): string {
  if (intent === 'home-service' || intent === 'improve-home') return DASHBOARD_ROUTES.homeServices
  return DASHBOARD_ROUTES.createProject
}

function findServiceLabel(intent: HomeownerIntent): string {
  if (intent === 'home-service') return 'Find a Service'
  if (intent === 'improve-home') return 'Plan Improvement'
  return 'Create Project'
}

export function getAdvisorReply(query: string, state: HomeownerDashboardState): AdvisorReply {
  const q = query.toLowerCase()
  const projectLabel = state.projectName ?? (state.primaryIntent === 'build-home' ? 'your project' : state.primaryIntent === 'improve-home' ? 'your improvement' : 'your service request')

  const isBoq = /\bboq\b|bill of quantities|scope of work/.test(q)
  const isMaterial = /material/.test(q)
  const isPlan = /\bplan\b|drawing|blueprint|layout/.test(q)
  const isContractor = /contractor|professional|hire|who should i (use|pick)|choose/.test(q)
  const isQuote = /quote/.test(q)
  const isCost = /cost|price|pricing|budget|estimat|reasonable|afford/.test(q)
  const isNextStep = /before|next step|start|prioriti|what should i do/.test(q)

  if (isBoq) {
    if (state.hasProject) {
      return {
        content: `A BOQ breaks ${projectLabel} down into a detailed bill of quantities, so every contractor quotes against the exact same scope of work — that's what keeps their bids comparable.`,
        actions: [{ label: 'View BOQ', dest: DASHBOARD_ROUTES.boqOverview }],
      }
    }
    return {
      content: "A BOQ is generated from your project once it exists — let's create your project first, and I can walk you through the BOQ once it's ready.",
      actions: [{ label: findServiceLabel(state.primaryIntent), dest: findServiceDest(state.primaryIntent) }],
    }
  }

  if (isMaterial) {
    if (state.primaryIntent === 'home-service') {
      return {
        content: "For a single service job, the professional you hire will usually account for materials in their quote. If you'd like a rough sense of quantities beforehand, I can point you to the material calculator.",
        actions: [{ label: 'Ask another question', dest: '' }],
      }
    }
    return {
      content: `Once ${projectLabel} has a BOQ, I can show you exactly what materials you'll need and in what quantity. Until then, the material calculator can give you a rough sense of quantities.`,
      actions: state.hasProject
        ? [{ label: 'View BOQ', dest: DASHBOARD_ROUTES.boqOverview }, { label: 'Material Calculator', dest: 'material-calculator' }]
        : [{ label: 'Material Calculator', dest: 'material-calculator' }],
    }
  }

  if (isPlan && state.primaryIntent === 'build-home') {
    return {
      content: "Uploading your house plan lets me check room layouts, flag anything unusual, and refine your estimate against the real drawing instead of assumptions.",
      actions: [{ label: 'Upload Plan', dest: DASHBOARD_ROUTES.uploadPlan }],
    }
  }

  if (isContractor) {
    if (state.primaryIntent === 'home-service') {
      return {
        content: "I can help you find service professionals near you. Before you hire, it's worth checking their past work, confirming they've priced the full job (not just labour), and getting the scope in writing.",
        actions: [{ label: 'Find a Service', dest: DASHBOARD_ROUTES.homeServices }],
      }
    }
    if (state.primaryIntent === 'improve-home') {
      return {
        content: "I can help you find professionals for your renovation. It's a good idea to get quotes from a few before deciding, and to compare them against the same scope of work.",
        actions: [{ label: 'Find Professionals', dest: DASHBOARD_ROUTES.findContractors }],
      }
    }
    return {
      content: state.hasProject
        ? `Once your BOQ for ${projectLabel} is ready, I can help you find contractors who match your project and compare their bids against it.`
        : "Let's create your project first — once it exists, I can help you find contractors who match it.",
      actions: [{ label: 'Find Contractors', dest: DASHBOARD_ROUTES.findContractors }],
    }
  }

  if (isQuote) {
    return {
      content: "I don't see any quotes on file yet. Once professionals respond, I can help you compare them side by side — same scope, materials and timeline, not just the bottom-line number.",
      actions: [{ label: state.primaryIntent === 'build-home' ? 'Compare Bids' : 'Compare Quotes', dest: DASHBOARD_ROUTES.bidsReceived }],
    }
  }

  if (isCost) {
    if (state.hasEstimate) {
      return {
        content: `Your current estimate for ${projectLabel} is ready to review. It's an approximate range based on the details you've shared so far — not a guaranteed price. Before comparing contractors, I'd recommend reviewing the BOQ so each one quotes against the same scope.`,
        actions: [{ label: 'View Estimate', dest: DASHBOARD_ROUTES.estimateDashboard }, { label: 'View BOQ', dest: DASHBOARD_ROUTES.boqOverview }],
      }
    }
    if (state.hasProject) {
      return {
        content: `I don't have an estimate for ${projectLabel} yet. Once one's generated, I can walk you through the range and what's driving it.`,
        actions: [{ label: 'View Estimate', dest: DASHBOARD_ROUTES.estimateDashboard }],
      }
    }
    return {
      content: state.primaryIntent === 'home-service'
        ? "I can't put together pricing on my own. Tell me what you need and I'll help you find the right professionals and a fair price range."
        : "You don't have a project yet, so there's no estimate to share. Creating one only takes a couple of minutes and I'll guide you through it.",
      actions: [{ label: findServiceLabel(state.primaryIntent), dest: findServiceDest(state.primaryIntent) }],
    }
  }

  // Next-step / general fallback — reuses Screen 012's own next-action
  // ladder rather than a second, competing "what's next" logic.
  const next = getNextAction(state)
  if (isNextStep) {
    return {
      content: `${next.title}. ${next.body}`,
      actions: [{ label: next.ctaLabel.replace(' →', ''), dest: next.ctaDest }],
    }
  }

  return {
    content: `I can help with costs, materials, professionals, plans, quotes or your next step. If you're not sure where to start: ${next.title.toLowerCase()}.`,
    actions: [{ label: next.ctaLabel.replace(' →', ''), dest: next.ctaDest }],
  }
}

// ─── Construction plan advice — Build New journey's "AI Construction Plan"
// screen ─────────────────────────────────────────────────────────────────
// Same deterministic-reply convention as getAdvisorReply() above — no live
// LLM call, real signals only — kept in this one module (not a second,
// screen-local heuristic) so there's exactly one place in the app that
// owns every "Hozie says..." narrative. Covers a question getAdvisorReply()
// itself isn't built to answer ("should I use a package or get a custom
// proposal for THIS project's specific floors/features/description"), so
// it's its own function rather than a forced branch of the keyword matcher.

export type ConstructionPath = 'package' | 'custom-proposal'

const CONSTRUCTION_CUSTOM_SIGNAL_KEYWORDS = [
  'basement', 'sloped', 'slope', 'custom architecture', 'custom design', 'unusual', 'irregular plot',
  'heritage', 'retrofit', 'earthquake', 'seismic', 'cantilever', 'unconventional',
]
const CONSTRUCTION_CUSTOM_SIGNAL_FEATURES = ['Swimming Pool', 'Home Theatre', 'Smart Home']

export interface ConstructionPlanAdviceInput {
  /** e.g. 'G+1', 'G+2' — this flow's own floor-count chip value. */
  floorCount?: string
  /** Additional-feature labels picked on the Requirements screen. */
  featureLabels?: string[]
  /** The homeowner's own free-text description of what they want to build. */
  freeText?: string
  /** Finish level — used only for the approach narrative, never the decision. */
  finish?: string
}

export interface ConstructionPlanAdvice {
  /** The "Recommended Plan" narrative shown at the top of the AI Plan screen. */
  approach: string
  recommendedPath: ConstructionPath
  /** "Your project looks suitable for a builder package" / "...several
   *  custom requirements..." — see the spec's own AI_DECISION_LOGIC
   *  examples. Never gates the "How would you like to build?" options —
   *  only recommends one; the homeowner can still pick any of the three. */
  recommendationMessage: string
}

export function getConstructionPlanAdvice(input: ConstructionPlanAdviceInput): ConstructionPlanAdvice {
  const approach = input.freeText?.trim()
    ? input.freeText.trim()
    : `A ${input.floorCount ?? 'G+1'} home, built to a ${input.finish ?? 'standard'} finish level.`

  // A project is flagged custom-proposal only when it combines a taller
  // build (G+2 or more) with at least one genuine complexity signal (a
  // premium/structural feature, or a complexity keyword in the free text)
  // — never on a single weak signal alone.
  const floors = input.floorCount ?? ''
  const isTallerBuild = /g\s*\+\s*[2-9]/i.test(floors)

  const features = input.featureLabels ?? []
  const hasComplexFeature = features.some(f => CONSTRUCTION_CUSTOM_SIGNAL_FEATURES.includes(f))

  const text = (input.freeText ?? '').toLowerCase()
  const hasComplexKeyword = CONSTRUCTION_CUSTOM_SIGNAL_KEYWORDS.some(k => text.includes(k))

  const recommendedPath: ConstructionPath = hasComplexKeyword || (isTallerBuild && hasComplexFeature) ? 'custom-proposal' : 'package'

  const recommendationMessage = recommendedPath === 'package'
    ? 'Your project looks suitable for a builder package — transparent pricing with a defined scope.'
    : 'Your project has several custom requirements. A site assessment and custom proposal would give you a more accurate price.'

  return { approach, recommendedPath, recommendationMessage }
}
