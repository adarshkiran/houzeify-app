import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  HOZIE_HONEST_COPY,
  HOZIE_ROUTE,
  isHozieLlmReady,
} from './hozieAdvisorShell.ts'
import { getAdvisorReply } from './aiAdvisor.ts'
import type { HomeownerDashboardState } from './homeownerDashboard.ts'

const baseState: HomeownerDashboardState = {
  primaryIntent: 'build-home',
  preferredName: 'Ada',
  city: 'Hyderabad',
  state: 'Telangana',
  hasProject: false,
  hasPlan: false,
  hasEstimate: false,
  hasBoq: false,
  hasBids: false,
}

describe('HOZIE_ROUTE', () => {
  it('keeps Hozie on ai-advisor', () => {
    assert.equal(HOZIE_ROUTE, 'ai-advisor')
  })
})

describe('isHozieLlmReady', () => {
  it('stays false until a real LLM backend exists (S19 gate)', () => {
    assert.equal(isHozieLlmReady(), false)
  })
})

describe('HOZIE_HONEST_COPY', () => {
  it('labels replies as guided mock guidance, not a live model', () => {
    assert.match(HOZIE_HONEST_COPY.disclaimer, /not a live AI model/i)
    assert.match(HOZIE_HONEST_COPY.subtitle, /guided/i)
    assert.ok(!/chatgpt|openai|claude|gpt-4/i.test(HOZIE_HONEST_COPY.disclaimer))
  })
})

describe('getAdvisorReply seam', () => {
  it('returns deterministic guidance without inventing a live model call', () => {
    const reply = getAdvisorReply('What should I do next?', baseState)
    assert.ok(reply.content.length > 0)
    assert.ok(Array.isArray(reply.actions))
  })
})
