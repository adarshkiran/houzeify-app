import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateSessionToken, hashSessionToken } from './session.js'

test('generateSessionToken: returns a high-entropy, URL-safe string', () => {
  const token = generateSessionToken()
  // 32 raw bytes -> base64url, no padding: 43 chars.
  assert.equal(token.length, 43)
  assert.match(token, /^[A-Za-z0-9_-]+$/)
})

test('generateSessionToken: distinct on every call', () => {
  const tokens = new Set(Array.from({ length: 100 }, () => generateSessionToken()))
  assert.equal(tokens.size, 100)
})

test('hashSessionToken: deterministic sha256 hex digest', () => {
  const token = 'fixed-test-token-value'
  const hashA = hashSessionToken(token)
  const hashB = hashSessionToken(token)
  assert.equal(hashA, hashB)
  assert.match(hashA, /^[0-9a-f]{64}$/)
})

test('hashSessionToken: never equals the raw token, and different tokens hash differently', () => {
  const tokenA = generateSessionToken()
  const tokenB = generateSessionToken()
  assert.notEqual(hashSessionToken(tokenA), tokenA)
  assert.notEqual(hashSessionToken(tokenA), hashSessionToken(tokenB))
})
