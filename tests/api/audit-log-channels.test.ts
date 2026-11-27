/**
 * AUDIT LOG & CHANNEL TESTS
 * Tests: getChannelAuditLogs filtering, clearChannelAuditLogs, audit log ordering
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getChannelAuditLogs,
  clearChannelAuditLogs,
  MockWhatsAppChannel,
  MockEmailChannel,
  MockSMSChannel,
  ChannelRegistry,
} from '../../src/lib/automation/channels.js'

// ═══════════════════════ Audit Log Population ═══════════════════════

test('Audit Log: messages are recorded in audit log after sending', async () => {
  clearChannelAuditLogs()

  const wa = new MockWhatsAppChannel()
  await wa.sendMessage('+919876543210', 'Test WA message')

  const email = new MockEmailChannel()
  await email.sendMessage('test@example.com', 'Test email message')

  const sms = new MockSMSChannel()
  await sms.sendMessage('+919876543210', 'Test SMS message')

  const allLogs = getChannelAuditLogs()
  assert.ok(allLogs.length >= 3, 'Should have at least 3 audit log entries')
})

// ═══════════════════════ Audit Log Filtering by Channel ═══════════════════════

test('Audit Log: filter by channel "whatsapp" returns only WA entries', async () => {
  clearChannelAuditLogs()

  const wa = new MockWhatsAppChannel()
  await wa.sendMessage('+919876543210', 'WA message')

  const email = new MockEmailChannel()
  await email.sendMessage('test@example.com', 'Email message')

  const waLogs = getChannelAuditLogs({ channel: 'whatsapp' })
  assert.ok(waLogs.length >= 1, 'Should have whatsapp logs')
  assert.ok(waLogs.every((l) => l.channel === 'whatsapp'), 'All filtered logs should be whatsapp')
})

test('Audit Log: filter by channel "email" returns only email entries', async () => {
  clearChannelAuditLogs()

  const email = new MockEmailChannel()
  await email.sendMessage('test@example.com', 'Email message')

  const wa = new MockWhatsAppChannel()
  await wa.sendMessage('+919876543210', 'WA message')

  const emailLogs = getChannelAuditLogs({ channel: 'email' })
  assert.ok(emailLogs.length >= 1)
  assert.ok(emailLogs.every((l) => l.channel === 'email'))
})

// ═══════════════════════ Audit Log Filtering by Recipient ═══════════════════════

test('Audit Log: filter by recipient returns matching entries', async () => {
  clearChannelAuditLogs()

  const wa = new MockWhatsAppChannel()
  await wa.sendMessage('+919876543210', 'Message to patient A')
  await wa.sendMessage('+918765432109', 'Message to patient B')

  const logsA = getChannelAuditLogs({ recipient: '9876543210' })
  assert.ok(logsA.length >= 1, 'Should find logs for patient A')
  assert.ok(logsA.every((l) => l.to.includes('9876543210')))
})

// ═══════════════════════ Combined Filters ═══════════════════════

test('Audit Log: combined channel + recipient filter', async () => {
  clearChannelAuditLogs()

  const wa = new MockWhatsAppChannel()
  await wa.sendMessage('+919876543210', 'WA to A')

  const email = new MockEmailChannel()
  await email.sendMessage('test@example.com', 'Email to B')

  const result = getChannelAuditLogs({ channel: 'whatsapp', recipient: '9876543210' })
  assert.ok(result.length >= 1)
  assert.equal(result[0].channel, 'whatsapp')
  assert.ok(result[0].to.includes('9876543210'))
})

// ═══════════════════════ Clear Audit Logs ═══════════════════════

test('clearChannelAuditLogs: empties the log array', async () => {
  const wa = new MockWhatsAppChannel()
  await wa.sendMessage('+919876543210', 'Some message')

  assert.ok(getChannelAuditLogs().length > 0, 'Should have logs before clearing')

  clearChannelAuditLogs()
  assert.equal(getChannelAuditLogs().length, 0, 'Should have zero logs after clearing')
})

// ═══════════════════════ Audit Log Ordering (newest first) ═══════════════════════

test('Audit Log: newest entries appear first (unshift ordering)', async () => {
  clearChannelAuditLogs()

  const wa = new MockWhatsAppChannel()
  await wa.sendMessage('+919876543210', 'First message')
  // Small delay to ensure different timestamps
  await new Promise((r) => setTimeout(r, 10))
  await wa.sendMessage('+918765432109', 'Second message')

  const logs = getChannelAuditLogs()
  assert.ok(logs.length >= 2)
  // Second message (newer) should be at index 0
  assert.ok(logs[0].to.includes('8765432109'), 'Newest message should be first')
  assert.ok(logs[1].to.includes('9876543210'), 'Older message should be second')
})

// ═══════════════════════ ChannelRegistry.getChannel ═══════════════════════

test('ChannelRegistry: returns correct channel instances', () => {
  const wa = ChannelRegistry.getChannel('whatsapp')
  assert.equal(wa.getChannelType(), 'whatsapp')
  assert.equal(wa.getStatus(), 'mock')

  const email = ChannelRegistry.getChannel('email')
  assert.equal(email.getChannelType(), 'email')

  const sms = ChannelRegistry.getChannel('sms')
  assert.equal(sms.getChannelType(), 'sms')
})

// ═══════════════════════ Failed message audit logging ═══════════════════════

test('Audit Log: failed WhatsApp message (invalid number) is logged', async () => {
  clearChannelAuditLogs()

  const wa = new MockWhatsAppChannel()
  const result = await wa.sendMessage('12345', 'Should fail')

  assert.equal(result.success, false)
  assert.ok(result.error, 'Should have an error message')

  const logs = getChannelAuditLogs()
  assert.ok(logs.length >= 1, 'Failed messages should also be logged')
  assert.equal(logs[0].success, false)
  assert.equal(logs[0].deliveryStatus, 'failed')
})

test('Audit Log: failed email (invalid address) is logged', async () => {
  clearChannelAuditLogs()

  const email = new MockEmailChannel()
  const result = await email.sendMessage('not-an-email', 'Should fail')

  assert.equal(result.success, false)
  assert.ok(result.error)

  const logs = getChannelAuditLogs()
  assert.ok(logs.length >= 1)
  assert.equal(logs[0].success, false)
})
