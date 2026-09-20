import assert from 'node:assert/strict'
import { test } from 'node:test'
import { InvalidPhoneNumberError, normalizePhoneNumber } from './phone.js'

test('normalizePhoneNumber: accepts a bare 10-digit number', () => {
  assert.equal(normalizePhoneNumber('9876543210'), '+919876543210')
})

test('normalizePhoneNumber: accepts +91 with spaces', () => {
  assert.equal(normalizePhoneNumber('+91 98765 43210'), '+919876543210')
})

test('normalizePhoneNumber: accepts +91XXXXXXXXXX with no spaces', () => {
  assert.equal(normalizePhoneNumber('+919876543210'), '+919876543210')
})

test('normalizePhoneNumber: accepts a bare 91-prefixed 12-digit number', () => {
  assert.equal(normalizePhoneNumber('919876543210'), '+919876543210')
})

test('normalizePhoneNumber: formatting variants all resolve to the same identity', () => {
  const variants = ['9876543210', '+91 9876543210', '+919876543210', '91-9876543210', '91 98765 43210']
  const normalized = new Set(variants.map(normalizePhoneNumber))
  assert.equal(normalized.size, 1)
  assert.equal([...normalized][0], '+919876543210')
})

test('normalizePhoneNumber: rejects a number not starting with 6-9', () => {
  assert.throws(() => normalizePhoneNumber('5876543210'), InvalidPhoneNumberError)
})

test('normalizePhoneNumber: rejects too few digits', () => {
  assert.throws(() => normalizePhoneNumber('98765'), InvalidPhoneNumberError)
})

test('normalizePhoneNumber: rejects too many digits', () => {
  assert.throws(() => normalizePhoneNumber('98765432101234'), InvalidPhoneNumberError)
})

test('normalizePhoneNumber: rejects non-numeric input', () => {
  assert.throws(() => normalizePhoneNumber('not-a-phone'), InvalidPhoneNumberError)
})

test('normalizePhoneNumber: rejects empty/missing input', () => {
  assert.throws(() => normalizePhoneNumber(''), InvalidPhoneNumberError)
  assert.throws(() => normalizePhoneNumber(undefined), InvalidPhoneNumberError)
  assert.throws(() => normalizePhoneNumber(null), InvalidPhoneNumberError)
})
