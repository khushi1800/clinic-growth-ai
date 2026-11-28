import test from 'node:test'
import assert from 'node:assert/strict'
import {
  qualifyLead,
  generateAppointmentConfirmationMessage,
  parseActionData,
} from '../../src/lib/ai/receptionist.js'
import type { ClinicContext, ChatMessage, AppointmentRequest } from '../../src/lib/ai/types.js'
import type { AIProvider } from '../../src/lib/ai/provider.js'

const mockClinic: ClinicContext = {
  clinicId: 'clinic-qual-1',
  name: 'Smile Dental Clinic',
  phone: '+91 98450 12345',
  email: 'contact@smiledentalcare.demo',
  address: '#42, 12th Main Road, Indiranagar, Bengaluru',
}

test('Lead Qualification: AI Evaluation & Heuristic Fallback', async () => {
  // Scenario 1: Default mock AI evaluation
  const chatHistory: ChatMessage[] = [
    { id: '1', role: 'user', content: 'Do you offer teeth whitening?', timestamp: new Date().toISOString() },
  ]
  const aiResult = await qualifyLead(chatHistory, mockClinic)
  assert.ok(aiResult.score >= 50, 'AI evaluation assigns a baseline qualification score')
  assert.equal(aiResult.urgency, 'normal')
  assert.ok(aiResult.notes)

  // Scenario 2: Heuristic fallback when provider is offline
  const offlineProvider = {
    generateResponse: async () => {
      throw new Error('AI Provider offline')
    },
  }

  // Low intent (no phone, no date)
  const lowResult = await qualifyLead(chatHistory, mockClinic, offlineProvider as unknown as AIProvider)
  assert.equal(lowResult.score, 30)
  assert.equal(lowResult.intent, 'routine_inquiry')

  // Medium intent with phone (+35 points)
  const medHistory: ChatMessage[] = [
    { id: '1', role: 'user', content: 'My phone is 9876543210', timestamp: new Date().toISOString() },
  ]
  const medResult = await qualifyLead(medHistory, mockClinic, offlineProvider as unknown as AIProvider)
  assert.equal(medResult.score, 65)
  assert.equal(medResult.intent, 'interested')

  // High intent with phone and date preference (+35 + 25 = 90 points)
  const highHistory: ChatMessage[] = [
    { id: '1', role: 'user', content: 'Book me for tomorrow morning. Phone 9876543210', timestamp: new Date().toISOString() },
  ]
  const highResult = await qualifyLead(highHistory, mockClinic, offlineProvider as unknown as AIProvider)
  assert.equal(highResult.score, 90)
  assert.equal(highResult.intent, 'high_intent_booking')
})

test('Appointment Confirmation Generation: Formats structured template on offline fallback', async () => {
  const request: AppointmentRequest = {
    patientName: 'Devika Nair',
    phone: '+91 98450 12345',
    preferredDate: '2026-11-25',
    preferredTimeSlot: '04:30 PM',
    doctorName: 'Dr. Priya Sharma',
    service: 'Teeth Scaling',
  }

  const offlineProvider = {
    generateResponse: async () => {
      throw new Error('Provider offline')
    },
  }

  const message = await generateAppointmentConfirmationMessage(request, mockClinic, offlineProvider as unknown as AIProvider)
  assert.ok(message.includes('Appointment Confirmed'), 'Header confirmed')
  assert.ok(message.includes('Devika Nair'), 'Includes patient name')
  assert.ok(message.includes('2026-11-25'), 'Includes date')
  assert.ok(message.includes('04:30 PM'), 'Includes time slot')
  assert.ok(message.includes('Dr. Priya Sharma'), 'Includes doctor name')
  assert.ok(message.includes('#42, 12th Main Road'), 'Includes clinic address')
  assert.ok(message.includes('arrive 10 minutes prior'), 'Includes preparation tips')
})

test('parseActionData: Safely extracts JSON block and handles edge cases', () => {
  // Clean JSON block
  const rawWithBlock = `Certainly! I have noted your details.\n<action_data>\n{\n  "leadData": { "name": "Deepak", "phone": "9845011111" },\n  "shouldEscalate": false\n}\n</action_data>`
  const parsed1 = parseActionData(rawWithBlock)
  assert.equal(parsed1.cleanedText, 'Certainly! I have noted your details.')
  assert.equal(parsed1.actionData?.leadData?.name, 'Deepak')
  assert.equal(parsed1.actionData?.leadData?.phone, '9845011111')

  // No action_data block
  const rawPlain = 'Thank you for reaching out. How may I help you?'
  const parsed2 = parseActionData(rawPlain)
  assert.equal(parsed2.cleanedText, rawPlain)
  assert.equal(parsed2.actionData, undefined)

  // Malformed JSON block does not throw
  const rawMalformed = 'Message before.<action_data>{ invalid json here }'
  const parsed3 = parseActionData(rawMalformed)
  assert.ok(parsed3.cleanedText.length > 0)
})
