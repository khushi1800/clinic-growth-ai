import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyIntent } from '../../src/lib/ai/receptionist.js'
import { checkEmergencySymptoms } from '../../src/lib/ai/prompts.js'

test('Intent Classification: Distinguishes emergency, handoff, booking, pricing, and FAQs', () => {
  // Emergency
  assert.equal(classifyIntent('heavy bleeding from mouth'), 'emergency')
  assert.equal(classifyIntent('severe swelling and difficulty breathing'), 'emergency')

  // Human handoff
  assert.equal(classifyIntent('I want to talk to human'), 'handoff')
  assert.equal(classifyIntent('Can I speak to real person?'), 'handoff')
  assert.equal(classifyIntent('receptionist se baat karni hai'), 'handoff')

  // Booking
  assert.equal(classifyIntent('Can I book an appointment for tomorrow?'), 'booking')
  assert.equal(classifyIntent('Is there any slot available on Friday?'), 'booking')
  assert.equal(classifyIntent('Doctor se milna hai'), 'booking')

  // Pricing
  assert.equal(classifyIntent('What is the cost of root canal?'), 'pricing')
  assert.equal(classifyIntent('How much is the fee for teeth cleaning?'), 'pricing')
  assert.equal(classifyIntent('RCT charges kitna hai?'), 'pricing')

  // Hours and Location
  assert.equal(classifyIntent('What are your clinic opening hours?'), 'hours_location')
  assert.equal(classifyIntent('Where is the clinic address?'), 'hours_location')
  assert.equal(classifyIntent('Are you open on Sunday?'), 'hours_location')

  // Doctor inquiry
  assert.equal(classifyIntent('Who is the root canal specialist doctor?'), 'doctor')
  assert.equal(classifyIntent('Tell me about the dentist team'), 'doctor')

  // General
  assert.equal(classifyIntent('Hello good morning'), 'general')
})

test('Emergency Symptom Screening: Detects life-threatening and critical dental conditions', () => {
  // Bleeding
  const bleedCheck = checkEmergencySymptoms('Continuous heavy bleeding after extraction')
  assert.equal(bleedCheck.isEmergency, true)
  assert.ok(bleedCheck.reason?.toLowerCase().includes('hemorrhage'))

  // Swelling with breathing difficulty
  const swellingCheck = checkEmergencySymptoms('Huge swelling on jaw and having trouble breathing')
  assert.equal(swellingCheck.isEmergency, true)

  // Knocked out tooth
  const knockedOutCheck = checkEmergencySymptoms('My front tooth got knocked out in an accident')
  assert.equal(knockedOutCheck.isEmergency, true)

  // Non-emergency standard symptom
  const normalCheck = checkEmergencySymptoms('Mild sensitivity while drinking cold water')
  assert.equal(normalCheck.isEmergency, false)
  assert.equal(normalCheck.reason, undefined)
})
