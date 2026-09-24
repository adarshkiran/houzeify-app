import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  PROJECT_MESSAGES_ROUTE,
  PROJECT_MESSAGES_SHELL,
  isProjectMessagesPersistenceReady,
} from './projectMessagesShell.ts'

describe('PROJECT_MESSAGES_ROUTE', () => {
  it('keeps Messages/Questions on project-messages', () => {
    assert.equal(PROJECT_MESSAGES_ROUTE, 'project-messages')
  })
})

describe('isProjectMessagesPersistenceReady', () => {
  it('stays false until a real conversation store exists (S16 gate)', () => {
    assert.equal(isProjectMessagesPersistenceReady(), false)
  })
})

describe('PROJECT_MESSAGES_SHELL', () => {
  it('exposes honest empty-shell copy without inventing a feed', () => {
    assert.equal(PROJECT_MESSAGES_SHELL.eyebrow, 'Questions')
    assert.match(PROJECT_MESSAGES_SHELL.emptyTitle, /not available yet/i)
    assert.match(PROJECT_MESSAGES_SHELL.emptyBody, /when messaging is ready/i)
    assert.ok(!/demo|sample|fake|placeholder conversation/i.test(PROJECT_MESSAGES_SHELL.emptyBody))
  })
})
