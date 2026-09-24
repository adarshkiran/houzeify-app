import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  NOTIFICATIONS_ROUTE,
  NOTIFICATIONS_SHELL,
  isNotificationEventsReady,
} from './notificationsShell.ts'

describe('NOTIFICATIONS_ROUTE', () => {
  it('keeps Notifications on notifications', () => {
    assert.equal(NOTIFICATIONS_ROUTE, 'notifications')
  })
})

describe('isNotificationEventsReady', () => {
  it('stays false until notification events exist (S17 gate)', () => {
    assert.equal(isNotificationEventsReady(), false)
  })
})

describe('NOTIFICATIONS_SHELL', () => {
  it('exposes honest empty-shell copy without inventing a feed', () => {
    assert.equal(NOTIFICATIONS_SHELL.eyebrow, 'Notifications')
    assert.match(NOTIFICATIONS_SHELL.emptyTitle, /not available yet/i)
    assert.match(NOTIFICATIONS_SHELL.emptyBody, /when notification events are ready/i)
    assert.ok(!/demo|sample|fake|unread count/i.test(NOTIFICATIONS_SHELL.emptyBody))
  })
})
