/**
 * BLACK BOX TESTS: MockAIProvider Full Scenario Flows
 * Tests dental symptom inquiry, pricing, booking, Hinglish, doctors, greeting, handoff
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { MockAIProvider, DEFAULT_MOCK_CLINIC_CONTEXT } from '../../src/lib/ai/mock-provider.js'
import type { ChatMessage } from '../../src/lib/ai/types.js'

const provider = new MockAIProvider({ simulatedDelayMs: 0, clinicContext: DEFAULT_MOCK_CLINIC_CONTEXT })

function msg(role: 'user' | 'assistant', content: string): ChatMessage {
  return { role, content, timestamp: new Date().toISOString() }
}

// ═══════════════════════ Dental Symptom Flow ═══════════════════════

test('MockAI Scenario: Dental pain inquiry triggers symptom handler and asks for contact', async () => {
  const response = await provider.generateResponse([msg('user', 'I have terrible tooth pain since yesterday')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('pain') || lower.includes('discomfort') || lower.includes('sorry'), 'Should acknowledge tooth pain')
  assert.ok(lower.includes('name') || lower.includes('contact') || lower.includes('phone'), 'Should ask for contact details')
})

test('MockAI Scenario: Cavity keyword triggers symptom handler', async () => {
  const response = await provider.generateResponse([msg('user', 'I think I have a cavity in my back tooth')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('x-ray') || lower.includes('specialist') || lower.includes('pain') || lower.includes('sorry'), 'Should mention evaluation')
})

test('MockAI Scenario: Sensitivity keyword triggers symptom handler', async () => {
  const response = await provider.generateResponse([msg('user', 'My teeth are very sensitive to cold water')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('sensitivity') || lower.includes('specialist') || lower.includes('sorry') || lower.includes('pain'), 'Should handle sensitivity complaint')
})

// ═══════════════════════ Pricing Flow ═══════════════════════

test('MockAI Scenario: Root canal pricing inquiry returns RCT price', async () => {
  const response = await provider.generateResponse([msg('user', 'How much does root canal cost?')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('3,500') || lower.includes('5,500') || lower.includes('rct'), 'Should include RCT pricing range')
  assert.ok(lower.includes('pricing') || lower.includes('price') || lower.includes('cost') || lower.includes('₹'), 'Should mention pricing context')
})

test('MockAI Scenario: Implant pricing inquiry', async () => {
  const response = await provider.generateResponse([msg('user', 'How much does a dental implant cost?')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('25,000') || lower.includes('45,000') || lower.includes('implant'), 'Should include implant pricing')
})

test('MockAI Scenario: General pricing inquiry shows full price list', async () => {
  const response = await provider.generateResponse([msg('user', 'What are your charges?')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('pricing') || lower.includes('price') || lower.includes('₹'), 'Should show pricing information')
})

test('MockAI Scenario: Hinglish pricing "kitna kharcha aayega?"', async () => {
  const response = await provider.generateResponse([msg('user', 'RCT ka kitna kharcha aayega?')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('3,500') || lower.includes('pricing') || lower.includes('₹'), 'Should respond to Hinglish pricing query')
})

// ═══════════════════════ Booking Flow ═══════════════════════

test('MockAI Scenario: Booking with partial info (no phone) → asks for contact', async () => {
  const response = await provider.generateResponse([msg('user', 'I want to book an appointment for tomorrow')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('phone') || lower.includes('name') || lower.includes('mobile') || lower.includes('contact'), 'Should ask for missing contact info')
})

test('MockAI Scenario: Complete booking (name + phone + date) → confirms appointment', async () => {
  const response = await provider.generateResponse(
    [msg('user', 'My name is Priya Kapoor, phone 9845012345, book for tomorrow morning')],
    '',
    { temperature: 0 }
  )
  const lower = response.content.toLowerCase()
  assert.ok(
    lower.includes('priya') || lower.includes('appointment') || lower.includes('confirmation') || lower.includes('captured'),
    'Should confirm appointment details'
  )
  assert.ok(lower.includes('9845012345') || lower.includes('tomorrow'), 'Should echo back provided details')
})

// ═══════════════════════ Hinglish Language Support ═══════════════════════

test('MockAI Scenario: Hinglish dental complaint "dant me dard hai"', async () => {
  const response = await provider.generateResponse([msg('user', 'mujhe dant me bahut dard hai')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  // "dard" triggers symptom handler since it matches "pain" check... let's check if lower actually has "dard" in the patterns
  // Actually "dard" is in the isDentalSymptom check
  assert.ok(lower.includes('specialist') || lower.includes('x-ray') || lower.includes('sorry') || lower.includes('pain'), 'Should handle Hindi tooth pain complaint')
})

// ═══════════════════════ Doctor Inquiry ═══════════════════════

test('MockAI Scenario: Doctor inquiry lists available specialists', async () => {
  const response = await provider.generateResponse([msg('user', 'Who are the doctors available?')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('dr.') || lower.includes('doctor') || lower.includes('specialist'), 'Should list doctors')
  assert.ok(lower.includes('arjun') || lower.includes('priya'), 'Should include doctor names from context')
})

// ═══════════════════════ Hours & Location ═══════════════════════

test('MockAI Scenario: Location inquiry returns branch addresses and hours', async () => {
  const response = await provider.generateResponse([msg('user', 'Where is the clinic located?')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('indiranagar') || lower.includes('koramangala') || lower.includes('bengaluru'), 'Should contain clinic branch addresses')
  assert.ok(lower.includes('hours') || lower.includes('timing') || lower.includes('monday') || lower.includes('saturday'), 'Should contain operating hours')
})

// ═══════════════════════ Human Handoff ═══════════════════════

test('MockAI Scenario: "talk to human" triggers handoff response', async () => {
  const response = await provider.generateResponse([msg('user', 'I want to talk to human receptionist')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('connect') || lower.includes('phone') || lower.includes('speak') || lower.includes('staff'), 'Should offer human connection')
  assert.ok(response.content.includes('action_data'), 'Should include action data for escalation')
})

// ═══════════════════════ Greeting (Fresh Conversation) ═══════════════════════

test('MockAI Scenario: First greeting introduces Maya (BUG-002: history includes current user message so Maya greeting is unreachable via generateResponse)', { todo: 'BUG-002: MockAIProvider.generateResponse includes current message in userHistory, making fresh greeting dead code' }, async () => {
  const response = await provider.generateResponse([msg('user', 'Hi')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('maya') || lower.includes('namaste') || lower.includes('welcome'), 'Should introduce AI receptionist')
  assert.ok(lower.includes('appointment') || lower.includes('help') || lower.includes('assist'), 'Should offer help options')
})

// ═══════════════════════ Prescription Guardrail ═══════════════════════

test('MockAI Scenario: Prescription request triggers guardrail', async () => {
  const response = await provider.generateResponse([msg('user', 'Please prescribe me some antibiotics for my tooth infection')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('prescrib') || lower.includes('prohibited') || lower.includes('doctor'), 'Should refuse prescription')
})

// ═══════════════════════ Emergency Triage ═══════════════════════

test('MockAI Scenario: Emergency symptoms trigger urgent advisory', async () => {
  const response = await provider.generateResponse([msg('user', 'I am having heavy bleeding from my mouth after tooth extraction')], '', { temperature: 0 })
  const lower = response.content.toLowerCase()
  assert.ok(lower.includes('urgent') || lower.includes('emergency') || lower.includes('⚠️'), 'Should show urgency markers')
  assert.ok(lower.includes('hotline') || lower.includes('hospital') || lower.includes('emergency'), 'Should provide emergency contact info')
})

// ═══════════════════════ Multi-turn Continuity ═══════════════════════

test('MockAI Scenario: Multi-turn conversation — branch question then branch answer', async () => {
  // Turn 1: User books, AI asks for branch
  const turn1 = await provider.generateResponse(
    [msg('user', 'I want to book an appointment')],
    '',
    { temperature: 0 }
  )

  // Turn 2: User answers with branch name
  const turn2 = await provider.generateResponse(
    [
      msg('user', 'I want to book an appointment'),
      msg('assistant', turn1.content),
      msg('user', 'Koramangala branch please'),
    ],
    '',
    { temperature: 0 }
  )

  const lower2 = turn2.content.toLowerCase()
  // Should acknowledge branch selection and ask for date/time or contact
  assert.ok(
    lower2.includes('koramangala') || lower2.includes('branch') || lower2.includes('date') || lower2.includes('time') || lower2.includes('phone'),
    'Should continue conversation flow after branch selection'
  )
})
