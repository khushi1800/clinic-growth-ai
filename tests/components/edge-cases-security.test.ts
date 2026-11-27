/**
 * EDGE CASE & SECURITY TESTS
 * Tests: empty input, XSS, long messages, null context, unicode names, malformed action data
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { handleMessage, parseActionData } from '../../src/lib/ai/receptionist.js'
import { MockAIProvider, DEFAULT_MOCK_CLINIC_CONTEXT, extractPhone, extractName } from '../../src/lib/ai/mock-provider.js'
import type { ClinicContext } from '../../src/lib/ai/types.js'

const mockClinicContext: ClinicContext = {
  clinicId: 'clinic-edge-test',
  name: 'Edge Case Dental',
  phone: '+919876543210',
  email: 'test@edgedental.com',
  address: '123 Test St',
  businessHours: { 'Mon-Sat': '9 AM - 8 PM' },
}

// ═══════════════════════ Empty / Blank Input ═══════════════════════

test('Edge Case: Empty message does not crash handleMessage', async () => {
  const result = await handleMessage({
    clinicId: mockClinicContext.clinicId,
    conversationId: 'conv-edge-1',
    userMessage: '',
    clinicContext: mockClinicContext,
    conversationHistory: [],
  })
  assert.ok(result.response, 'Should return a non-empty response even for empty input')
  assert.ok(typeof result.response === 'string', 'Response should be a string')
})

test('Edge Case: Whitespace-only message does not crash', async () => {
  const result = await handleMessage({
    clinicId: mockClinicContext.clinicId,
    conversationId: 'conv-edge-2',
    userMessage: '   \n\t  ',
    clinicContext: mockClinicContext,
    conversationHistory: [],
  })
  assert.ok(result.response, 'Should return a response for whitespace input')
})

// ═══════════════════════ XSS / HTML Injection ═══════════════════════

test('Security: XSS script tag in message does not appear raw in response', async () => {
  const xssMessage = '<script>alert("xss")</script> I want an appointment'
  const result = await handleMessage({
    clinicId: mockClinicContext.clinicId,
    conversationId: 'conv-xss-1',
    userMessage: xssMessage,
    clinicContext: mockClinicContext,
    conversationHistory: [],
  })
  // The response should NOT echo back raw <script> tags
  assert.ok(!result.response.includes('<script>'), 'Response must not contain raw <script> tag')
})

test('Security: HTML injection in patient name does not propagate raw', async () => {
  const htmlMessage = 'My name is <img src=x onerror=alert(1)> and I need a checkup'
  const result = await handleMessage({
    clinicId: mockClinicContext.clinicId,
    conversationId: 'conv-xss-2',
    userMessage: htmlMessage,
    clinicContext: mockClinicContext,
    conversationHistory: [],
  })
  // extractName should return null for HTML because <img> doesn't match name patterns
  assert.notEqual(result.leadData?.name, '<img src=x onerror=alert(1)>')
})

// ═══════════════════════ Very Long Message ═══════════════════════

test('Edge Case: Very long message (5000+ chars) handled gracefully', async () => {
  const longMessage = 'I have tooth pain. '.repeat(300) // ~5700 chars
  const result = await handleMessage({
    clinicId: mockClinicContext.clinicId,
    conversationId: 'conv-long-1',
    userMessage: longMessage,
    clinicContext: mockClinicContext,
    conversationHistory: [],
  })
  assert.ok(result.response, 'Should return a valid response for very long input')
  assert.ok(result.response.length > 0, 'Response should not be empty')
})

// ═══════════════════════ Null/Undefined Context Fields ═══════════════════════

test('Edge Case: Minimal clinic context (no optional fields) does not crash', async () => {
  const minimalContext: ClinicContext = {
    clinicId: 'clinic-minimal',
    name: 'Minimal Clinic',
    phone: '+919876543210',
    email: 'min@clinic.com',
    address: '1 Main St',
    businessHours: 'Mon-Fri: 9-5',
  }

  const result = await handleMessage({
    clinicId: minimalContext.clinicId,
    conversationId: 'conv-minimal-1',
    userMessage: 'What are your timings?',
    clinicContext: minimalContext,
    conversationHistory: [],
  })
  assert.ok(result.response, 'Should handle minimal context gracefully')
})

test('Edge Case: Clinic context with no doctors or services still works', async () => {
  const bareContext: ClinicContext = {
    clinicId: 'clinic-bare',
    name: 'Bare Clinic',
    phone: '+919876543210',
    email: 'bare@clinic.com',
    address: '2 Main St',
    businessHours: { 'Mon-Fri': '9 AM - 5 PM' },
    doctors: [],
    services: [],
    branches: [],
  }

  const result = await handleMessage({
    clinicId: bareContext.clinicId,
    conversationId: 'conv-bare-1',
    userMessage: 'Who are the doctors available?',
    clinicContext: bareContext,
    conversationHistory: [],
  })
  assert.ok(result.response, 'Should respond even with no doctors')
})

// ═══════════════════════ Unicode / Emoji in Names ═══════════════════════

test('Edge Case: Unicode emoji in message does not crash extractors', () => {
  assert.equal(extractPhone('call me 🏥 9876543210 🦷'), '9876543210')
  assert.equal(extractName('my name is 🦷 Rahul'), null) // emoji breaks the pattern
})

test('Edge Case: Hindi Devanagari text in extractPhone returns null (no digit match)', () => {
  assert.equal(extractPhone('मेरा नंबर है'), null)
})

// ═══════════════════════ Multiple Phone Numbers ═══════════════════════

test('Edge Case: Multiple phone numbers → extracts first valid one', () => {
  const result = extractPhone('Primary: 9876543210, Alternate: 8765432109')
  assert.equal(result, '9876543210', 'Should extract the first valid phone number')
})

// ═══════════════════════ parseActionData Edge Cases ═══════════════════════

test('parseActionData: returns raw text when no action_data block present', () => {
  const result = parseActionData('Hello, how can I help you?')
  assert.equal(result.cleanedText, 'Hello, how can I help you?')
  assert.equal(result.actionData, undefined)
})

test('parseActionData: extracts and parses valid action_data JSON', () => {
  const raw = 'Some text <action_data>{"shouldEscalate": true}</action_data>'
  const result = parseActionData(raw)
  assert.equal(result.cleanedText, 'Some text')
  assert.equal(result.actionData?.shouldEscalate, true)
})

test('parseActionData: handles malformed JSON in action_data gracefully', () => {
  const raw = 'Some text <action_data>{invalid json}</action_data>'
  const result = parseActionData(raw)
  assert.equal(result.cleanedText, 'Some text')
  assert.equal(result.actionData, undefined, 'Should return undefined for malformed JSON')
})

test('parseActionData: handles nested action_data with complex JSON', () => {
  const actionObj = {
    leadData: { name: 'Test', phone: '9876543210' },
    actions: [{ type: 'create_lead', payload: { clinicId: 'c1' } }],
    shouldEscalate: false,
    suggestedQuickReplies: ['Book', 'Price'],
  }
  const raw = `Response text\n\n<action_data>\n${JSON.stringify(actionObj, null, 2)}\n</action_data>`
  const result = parseActionData(raw)
  assert.equal(result.cleanedText, 'Response text')
  assert.equal(result.actionData?.leadData?.name, 'Test')
  assert.equal(result.actionData?.actions?.length, 1)
  assert.equal(result.actionData?.suggestedQuickReplies?.length, 2)
})

// ═══════════════════════ SQL-like Patterns in Input ═══════════════════════

test('Security: SQL injection-like input does not break message processing', async () => {
  const sqlMessage = "Robert'; DROP TABLE patients;-- I need a checkup"
  const result = await handleMessage({
    clinicId: mockClinicContext.clinicId,
    conversationId: 'conv-sql-1',
    userMessage: sqlMessage,
    clinicContext: mockClinicContext,
    conversationHistory: [],
  })
  assert.ok(result.response, 'Should produce a valid response without crashing')
  assert.ok(!result.response.includes('DROP TABLE'), 'Should not echo SQL injection verbatim in response text')
})

// ═══════════════════════ Special Characters in Messages ═══════════════════════

test('Edge Case: Message with special regex characters does not crash', async () => {
  const regexMessage = 'What is [the] cost (of) RCT? \\d+ $100 ^start .* end?'
  const result = await handleMessage({
    clinicId: mockClinicContext.clinicId,
    conversationId: 'conv-regex-1',
    userMessage: regexMessage,
    clinicContext: mockClinicContext,
    conversationHistory: [],
  })
  assert.ok(result.response, 'Should handle regex special characters without crashing')
})
