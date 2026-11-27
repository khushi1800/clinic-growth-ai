/**
 * WHITE BOX UNIT TESTS: AI Provider Factory & GoogleAIProvider
 * Tests: getAIProvider selection logic, GoogleAIProvider.hasApiKey, formatContents filtering
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { getAIProvider, GoogleAIProvider, MockAIProvider } from '../../src/lib/ai/provider.js'

// ═══════════════════════ getAIProvider Factory ═══════════════════════

test('getAIProvider: returns MockAIProvider when no API key and type is auto', () => {
  const provider = getAIProvider({ type: 'auto' })
  assert.ok(provider instanceof MockAIProvider, 'Should return MockAIProvider when no API key')
})

test('getAIProvider: returns MockAIProvider when no options provided', () => {
  const provider = getAIProvider()
  assert.ok(provider instanceof MockAIProvider, 'Should default to MockAIProvider')
})

test('getAIProvider: returns MockAIProvider when type is explicitly "mock"', () => {
  const provider = getAIProvider({ type: 'mock' })
  assert.ok(provider instanceof MockAIProvider, 'type=mock should force MockAIProvider')
})

test('getAIProvider: returns GoogleAIProvider when type is "google"', () => {
  const provider = getAIProvider({ type: 'google' })
  assert.ok(provider instanceof GoogleAIProvider, 'type=google should return GoogleAIProvider')
})

test('getAIProvider: returns GoogleAIProvider when type is auto and apiKey is provided', () => {
  const provider = getAIProvider({ type: 'auto', apiKey: 'test-key-12345' })
  assert.ok(provider instanceof GoogleAIProvider, 'Should use GoogleAIProvider when apiKey is present')
})

test('getAIProvider: returns MockAIProvider when type is auto and apiKey is empty string', () => {
  const provider = getAIProvider({ type: 'auto', apiKey: '' })
  assert.ok(provider instanceof MockAIProvider, 'Empty apiKey string should fallback to Mock')
})

test('getAIProvider: returns MockAIProvider when type is auto and apiKey is whitespace only', () => {
  const provider = getAIProvider({ type: 'auto', apiKey: '   ' })
  assert.ok(provider instanceof MockAIProvider, 'Whitespace-only apiKey should fallback to Mock')
})

// ═══════════════════════ GoogleAIProvider.hasApiKey ═══════════════════════

test('GoogleAIProvider.hasApiKey: returns false when constructed without key', () => {
  const provider = new GoogleAIProvider('')
  assert.equal(provider.hasApiKey(), false)
})

test('GoogleAIProvider.hasApiKey: returns true when constructed with valid key', () => {
  const provider = new GoogleAIProvider('AIzaSyXXXXXXXXXX')
  assert.equal(provider.hasApiKey(), true)
})

test('GoogleAIProvider.hasApiKey: returns false when key is whitespace only', () => {
  const provider = new GoogleAIProvider('   ')
  assert.equal(provider.hasApiKey(), false)
})

// ═══════════════════════ GoogleAIProvider.generateResponse error ═══════════════════════

test('GoogleAIProvider.generateResponse: throws when no API key configured', async () => {
  const provider = new GoogleAIProvider('')
  await assert.rejects(
    () => provider.generateResponse([{ role: 'user', content: 'hello' }], 'system prompt'),
    { message: /API key is not configured/ },
    'Should throw descriptive error about missing API key'
  )
})

test('GoogleAIProvider.generateStream: throws when no API key configured', async () => {
  const provider = new GoogleAIProvider('')
  const gen = provider.generateStream([{ role: 'user', content: 'hello' }], 'prompt')
  await assert.rejects(
    () => gen.next(),
    { message: /API key is not configured/ },
    'Should throw descriptive error about missing API key'
  )
})
