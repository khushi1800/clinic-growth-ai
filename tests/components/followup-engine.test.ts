import test from 'node:test'
import assert from 'node:assert/strict'
import {
  globalOptOutRegistry,
  FollowupAutomationService,
  getDefaultFollowupRules,
} from '../../src/lib/automation/followup.js'

test('Consent & Opt-Out: Strict DND/STOP handling', () => {
  const service = new FollowupAutomationService()
  const phone = '+919876543210'
  const rules = getDefaultFollowupRules('clinic-1')
  const rule = rules[0]

  // Clear registry
  globalOptOutRegistry.clear()

  const lead = {
    id: 'lead-1',
    phone,
    status: 'new' as const,
    staffIntervened: false,
  }

  const check1 = service.evaluateEligibility(lead, rule)
  assert.equal(check1.eligible, true, 'Should allow follow-up for normal opted-in lead')

  // Opt out
  globalOptOutRegistry.optOut(phone)
  assert.equal(globalOptOutRegistry.isOptedOut(phone), true, 'Number marked opted out')

  const check2 = service.evaluateEligibility(lead, rule)
  assert.equal(check2.eligible, false, 'Should block follow-up once phone opted out')
  assert.equal(check2.ineligibleReason, 'cancelled_opt_out')
})

test('Conversion Suppression: Never follow up with converted or completed patients', () => {
  const service = new FollowupAutomationService()
  const rules = getDefaultFollowupRules('clinic-1')
  const rule = rules[0]

  globalOptOutRegistry.clear()

  const convertedLead = {
    id: 'lead-2',
    phone: '+919845011111',
    status: 'converted' as const,
    staffIntervened: false,
  }

  const check1 = service.evaluateEligibility(convertedLead, rule)
  assert.equal(check1.eligible, false, 'Must suppress automated follow-ups once lead is converted')
  assert.equal(check1.ineligibleReason, 'cancelled_converted')

  // Staff intervention
  const intervenedLead = {
    id: 'lead-3',
    phone: '+919845022222',
    status: 'interested' as const,
    staffIntervened: true,
  }

  const check2 = service.evaluateEligibility(intervenedLead, rule)
  assert.equal(check2.eligible, false, 'Must suppress automated follow-ups if staff intervened')
  assert.equal(check2.ineligibleReason, 'cancelled_staff_intervention')
})

test('Default follow-up rules validation', () => {
  const rules = getDefaultFollowupRules('clinic-test')
  assert.ok(rules.length >= 2, 'Should provide standard follow-up rules for clinic')
  for (const r of rules) {
    assert.ok(r.name)
    assert.ok(r.delayHours >= 0)
    assert.ok(r.template)
    assert.equal(r.active, true)
  }
})
