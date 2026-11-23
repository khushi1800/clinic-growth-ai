import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MockWhatsAppChannel,
  MockEmailChannel,
  MockSMSChannel,
  ChannelRegistry,
  getChannelAuditLogs,
  clearChannelAuditLogs,
} from '../../src/lib/automation/channels.js'

test('WhatsApp Channel: Delivers to valid Indian mobile numbers', async () => {
  clearChannelAuditLogs()
  const channel = new MockWhatsAppChannel()

  // Test valid phone formats
  const validNumbers = ['9876543210', '+919876543210', '+91 9845012345', '7012345678', '8888899999']
  for (const phone of validNumbers) {
    const res = await channel.sendMessage(phone, 'Your dental checkup is scheduled!')
    assert.equal(res.success, true, `Should succeed for valid phone ${phone}`)
    assert.equal(res.channel, 'whatsapp')
    assert.equal(res.deliveryStatus, 'delivered')
    assert.ok(res.messageId.startsWith('wa_mock_'))
  }

  // Audit logs recorded
  const logs = getChannelAuditLogs({ channel: 'whatsapp' })
  assert.equal(logs.length, validNumbers.length)
})

test('WhatsApp Channel: Rejects invalid phone numbers with descriptive error', async () => {
  clearChannelAuditLogs()
  const channel = new MockWhatsAppChannel()

  const invalidNumbers = ['123', 'abcdef', '1234567890'] // 1234567890 doesn't start with 6-9
  for (const invalid of invalidNumbers) {
    const res = await channel.sendMessage(invalid, 'Hello')
    assert.equal(res.success, false, `Should reject invalid phone ${invalid}`)
    assert.equal(res.deliveryStatus, 'failed')
    assert.ok(res.error?.includes('Invalid Indian phone number format'))
  }
})

test('Email Channel: Delivers to valid emails and rejects invalid formats', async () => {
  clearChannelAuditLogs()
  const emailChannel = new MockEmailChannel()

  // Valid email
  const validRes = await emailChannel.sendMessage('patient@example.com', 'Your appointment details', {
    subject: 'Dental Appointment Confirmation',
  })
  assert.equal(validRes.success, true)
  assert.equal(validRes.channel, 'email')
  assert.equal(validRes.deliveryStatus, 'sent')
  assert.equal(validRes.metadata?.subject, 'Dental Appointment Confirmation')

  // Invalid email
  const invalidRes = await emailChannel.sendMessage('not-an-email', 'Test content')
  assert.equal(invalidRes.success, false)
  assert.equal(invalidRes.deliveryStatus, 'failed')
  assert.ok(invalidRes.error?.includes('Invalid email address format'))
})

test('SMS Channel: Computes character segments and applies TRAI/DLT headers', async () => {
  clearChannelAuditLogs()
  const smsChannel = new MockSMSChannel()

  // Short SMS <= 160 chars
  const shortMsg = 'Your OTP for Smile Dental Clinic is 549120. Valid for 10 minutes.'
  const resShort = await smsChannel.sendMessage('9845012345', shortMsg)
  assert.equal(resShort.success, true)
  assert.equal(resShort.channel, 'sms')
  assert.equal(resShort.metadata?.smsParts, 1)

  // Long SMS > 160 chars
  const longMsg = 'Namaste from Smile Dental Clinic! Your root canal appointment with Dr. Priya Sharma is booked for tomorrow at 11:30 AM at our Indiranagar branch. Please arrive 10 minutes prior with any past prescriptions and digital X-rays.'
  const resLong = await smsChannel.sendMessage('9845012345', longMsg)
  assert.equal(resLong.success, true)
  assert.equal(resLong.metadata?.smsParts, 2, 'Message over 160 chars should count as 2 SMS segments')
  assert.ok(resLong.metadata?.dltTemplateId, 'Should include DLT template ID')
})

test('Channel Registry: Returns correct channel singletons', () => {
  const wa = ChannelRegistry.getChannel('whatsapp')
  assert.equal(wa.getChannelType(), 'whatsapp')

  const email = ChannelRegistry.getChannel('email')
  assert.equal(email.getChannelType(), 'email')

  const sms = ChannelRegistry.getChannel('sms')
  assert.equal(sms.getChannelType(), 'sms')
})
