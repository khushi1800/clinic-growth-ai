/**
 * WHITE BOX & INTEGRATION TESTS: Follow-up Automation Execution Pipeline
 * Tests: interpolateTemplate, executeRule, processBatch, getExecutionHistory, inactive rule skipping
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { FollowupAutomationService, getDefaultFollowupRules, globalOptOutRegistry } from '../../src/lib/automation/followup.js'
import { clearChannelAuditLogs } from '../../src/lib/automation/channels.js'
import type { ClinicContext, FollowupRule, LeadData } from '../../src/lib/ai/types.js'

const testClinicContext: ClinicContext = {
  clinicId: 'clinic_test_fu',
  name: 'Test Dental Clinic',
  phone: '+919876543210',
  whatsappPhone: '+919876543210',
  email: 'info@testdental.com',
  address: '123 Test Road, Testville',
  businessHours: { 'Mon-Sat': '9:00 AM - 8:00 PM' },
}

const testLead: Partial<LeadData> & { id: string } = {
  id: 'lead_test_1',
  name: 'Rahul Sharma',
  phone: '+919876543210',
  concern: 'tooth pain',
  serviceRequested: 'root canal',
}

const testRule: FollowupRule = {
  id: 'rule_test_1',
  clinicId: 'clinic_test_fu',
  name: 'Test Follow-up Rule',
  triggerEvent: 'lead_created_no_booking',
  delayHours: 2,
  channel: 'whatsapp',
  template: 'Hi {{patient_name}}, thank you for reaching out to {{clinic_name}} regarding {{concern}}! Call us at {{clinic_phone}} for {{service}}.',
  active: true,
}

// ═══════════════════════ interpolateTemplate ═══════════════════════

test('interpolateTemplate: replaces all template tags correctly', () => {
  const service = new FollowupAutomationService()
  const result = service.interpolateTemplate(testRule.template, testLead, testClinicContext)

  assert.ok(result.includes('Rahul Sharma'), 'Should replace {{patient_name}}')
  assert.ok(result.includes('Test Dental Clinic'), 'Should replace {{clinic_name}}')
  assert.ok(result.includes('tooth pain'), 'Should replace {{concern}}')
  assert.ok(result.includes('+919876543210'), 'Should replace {{clinic_phone}}')
  assert.ok(result.includes('root canal'), 'Should replace {{service}}')
  assert.ok(!result.includes('{{'), 'No unreplaced tags should remain')
})

test('interpolateTemplate: uses defaults when lead data is missing', () => {
  const service = new FollowupAutomationService()
  const emptyLead: Partial<LeadData> = {}
  const result = service.interpolateTemplate(testRule.template, emptyLead, testClinicContext)

  assert.ok(result.includes('Valued Patient'), 'Should use "Valued Patient" default for missing name')
  assert.ok(result.includes('your dental consultation'), 'Should use default concern text')
  assert.ok(result.includes('dental care'), 'Should use default service text')
})

// ═══════════════════════ executeRule ═══════════════════════

test('executeRule: sends message via channel and records execution with status "sent" (template fallback)', async () => {
  const service = new FollowupAutomationService()
  globalOptOutRegistry.clear()
  clearChannelAuditLogs()
  service.clearHistory()

  // Force template interpolation fallback (note: MockAIProvider otherwise returns receptionist greeting)
  const offlineProvider = {
    generateResponse: async () => { throw new Error('offline') },
    generateStream: async function* () { yield '' },
  }

  const { execution, sendResult } = await service.executeRule(testRule, testLead, testClinicContext, offlineProvider)

  assert.equal(execution.status, 'sent', 'Execution should be marked as sent')
  assert.equal(execution.channel, 'whatsapp')
  assert.ok(execution.messageBody.includes('Rahul Sharma'), 'Message body should contain patient name')
  assert.ok(sendResult, 'Should have a send result')
  assert.equal(sendResult!.success, true)
})

test('executeRule: skips opted-out recipient', async () => {
  const service = new FollowupAutomationService()
  service.clearHistory()
  globalOptOutRegistry.clear()
  globalOptOutRegistry.optOut('+919876543210')

  const { execution, sendResult } = await service.executeRule(testRule, testLead, testClinicContext)

  assert.equal(execution.status, 'cancelled_opt_out', 'Should skip opted-out recipient')
  assert.equal(sendResult, undefined, 'No message should be sent')

  globalOptOutRegistry.clear()
})

test('executeRule: skips converted lead', async () => {
  const service = new FollowupAutomationService()
  service.clearHistory()
  globalOptOutRegistry.clear()

  const convertedLead = { ...testLead, status: 'converted' as const }
  const { execution } = await service.executeRule(testRule, convertedLead, testClinicContext)

  assert.equal(execution.status, 'cancelled_converted')
})

test('executeRule: skips when staff has intervened', async () => {
  const service = new FollowupAutomationService()
  service.clearHistory()
  globalOptOutRegistry.clear()

  const staffLead = { ...testLead, staffIntervened: true }
  const { execution } = await service.executeRule(testRule, staffLead, testClinicContext)

  assert.equal(execution.status, 'cancelled_staff_intervention')
})

test('executeRule: skips inactive rule', async () => {
  const service = new FollowupAutomationService()
  service.clearHistory()
  globalOptOutRegistry.clear()

  const inactiveRule = { ...testRule, active: false }
  const { execution } = await service.executeRule(inactiveRule, testLead, testClinicContext)

  // Inactive rule should be skipped
  assert.ok(
    execution.status !== 'sent',
    'Inactive rule should not produce a sent status'
  )
})

// ═══════════════════════ processBatch ═══════════════════════

test('processBatch: processes multiple rules × leads, skips inactive rules', async () => {
  const service = new FollowupAutomationService()
  service.clearHistory()
  globalOptOutRegistry.clear()
  clearChannelAuditLogs()

  const leads = [
    { id: 'lead_a', name: 'Patient A', phone: '+919876543210' },
    { id: 'lead_b', name: 'Patient B', phone: '+918765432109' },
  ]

  const rules: FollowupRule[] = [
    { ...testRule, id: 'rule_active_1', active: true },
    { ...testRule, id: 'rule_inactive', active: false },
  ]

  const results = await service.processBatch(rules, leads, testClinicContext)

  // Only active rule should run → 1 rule × 2 leads = 2 executions
  assert.equal(results.length, 2, 'Should execute active rule for each lead')
  assert.ok(results.every((r) => r.status === 'sent'), 'All results should be sent')
})

// ═══════════════════════ getExecutionHistory ═══════════════════════

test('getExecutionHistory: filters by clinicId', async () => {
  const service = new FollowupAutomationService()
  service.clearHistory()
  globalOptOutRegistry.clear()

  await service.executeRule(testRule, testLead, testClinicContext)
  await service.executeRule(testRule, testLead, { ...testClinicContext, clinicId: 'other_clinic' })

  const filtered = service.getExecutionHistory({ clinicId: 'clinic_test_fu' })
  assert.equal(filtered.length, 1)
  assert.equal(filtered[0].clinicId, 'clinic_test_fu')
})

test('getExecutionHistory: filters by status', async () => {
  const service = new FollowupAutomationService()
  service.clearHistory()
  globalOptOutRegistry.clear()

  await service.executeRule(testRule, testLead, testClinicContext)

  globalOptOutRegistry.optOut('+919876543210')
  await service.executeRule(testRule, testLead, testClinicContext)

  const sent = service.getExecutionHistory({ status: 'sent' })
  assert.equal(sent.length, 1)

  globalOptOutRegistry.clear()
})

// ═══════════════════════ getDefaultFollowupRules ═══════════════════════

test('getDefaultFollowupRules: returns standard dental practice rules', () => {
  const rules = getDefaultFollowupRules('clinic_123')
  assert.ok(rules.length >= 4, 'Should have at least 4 default rules')
  assert.ok(rules.every((r) => r.clinicId === 'clinic_123'), 'All rules should have the given clinicId')
  assert.ok(rules.every((r) => r.active === true), 'All default rules should be active')
  assert.ok(rules.every((r) => r.channel === 'whatsapp'), 'Default rules use whatsapp channel')
  assert.ok(rules.some((r) => r.triggerEvent === 'lead_created_no_booking'), 'Should have lead_created trigger')
  assert.ok(rules.some((r) => r.triggerEvent === 'no_show_recovery'), 'Should have no_show trigger')
  assert.ok(rules.some((r) => r.triggerEvent === 'recall_6_month_checkup'), 'Should have 6-month recall trigger')
})
