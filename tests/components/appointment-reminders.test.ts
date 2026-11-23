import test from 'node:test'
import assert from 'node:assert/strict'
import { AppointmentReminderService } from '../../src/lib/automation/reminders.js'
import type { ClinicContext, AppointmentRequest } from '../../src/lib/ai/types.js'

const mockClinic: ClinicContext = {
  clinicId: 'clinic-rem-1',
  name: 'Smile Dental Indiranagar',
  phone: '+91 98450 12345',
  whatsappPhone: '+91 98450 12345',
  email: 'contact@smiledental.demo',
  address: '#42 12th Main Road, Indiranagar, Bengaluru',
}

const mockAppointment: AppointmentRequest & { appointmentId: string; appointmentDateTime: string } = {
  appointmentId: 'apt-test-101',
  patientName: 'Ananya Deshmukh',
  phone: '+919876543210',
  preferredDate: '2026-11-20',
  preferredTimeSlot: '11:00 AM',
  doctorName: 'Dr. Rohan Sharma',
  service: 'Root Canal Treatment',
  appointmentDateTime: '2026-11-20T11:00:00Z',
}

test('Reminder Generation: Generates tailored text for all reminder stages', () => {
  const service = new AppointmentReminderService()

  // 24h Before
  const text24h = service.generateReminderText(mockAppointment, '24h_before', mockClinic)
  assert.ok(text24h.includes('Ananya Deshmukh'), 'Contains patient name')
  assert.ok(text24h.includes('2026-11-20'), 'Contains date')
  assert.ok(text24h.includes('11:00 AM'), 'Contains time slot')
  assert.ok(text24h.includes('Dr. Rohan Sharma'), 'Contains doctor')
  assert.ok(text24h.includes('reply with *1*'), 'Contains interactive 1-confirm prompt')
  assert.ok(text24h.includes('reply with *2*'), 'Contains interactive 2-reschedule prompt')

  // 2h Before
  const text2h = service.generateReminderText(mockAppointment, '2h_before', mockClinic)
  assert.ok(text2h.includes('2 hours'), 'Contains 2 hours notice')
  assert.ok(text2h.includes('#42 12th Main Road'), 'Contains clinic address')

  // Same Day Morning
  const textMorning = service.generateReminderText(mockAppointment, 'same_day_morning', mockClinic)
  assert.ok(textMorning.includes('Good Morning'), 'Contains morning greeting')

  // Post Visit Review
  const textReview = service.generateReminderText(mockAppointment, 'post_visit_review', mockClinic)
  assert.ok(textReview.includes('review'), 'Contains review request link')
  assert.ok(textReview.includes('https://g.page/r/clinic-rem-1/review'), 'Contains clinic Google review URL')
})

test('Reminder Scheduling: Schedules 24h and 2h reminders for an appointment', () => {
  const service = new AppointmentReminderService()
  const scheduled = service.scheduleRemindersForAppointment(mockAppointment, mockClinic)

  assert.equal(scheduled.length, 2, 'Should schedule two reminders (24h and 2h)')
  assert.equal(scheduled[0].timing, '24h_before')
  assert.equal(scheduled[1].timing, '2h_before')
  assert.equal(scheduled[0].status, 'pending')
  assert.equal(scheduled[1].status, 'pending')

  const retrieved = service.getRemindersForAppointment(mockAppointment.appointmentId)
  assert.equal(retrieved.length, 2, 'Can retrieve scheduled reminders by appointmentId')
})

test('Reminder Dispatch: Dispatches reminder via channel and updates status to sent', async () => {
  const service = new AppointmentReminderService()
  const [rem24h] = service.scheduleRemindersForAppointment(mockAppointment, mockClinic)

  const result = await service.dispatchReminder(rem24h.id)
  assert.equal(result.success, true, 'Dispatch should succeed for valid phone')
  assert.equal(result.deliveryStatus, 'delivered')

  const updatedReminders = service.getRemindersForAppointment(mockAppointment.appointmentId)
  assert.equal(updatedReminders[0].status, 'sent')
  assert.ok(updatedReminders[0].sentAt, 'sentAt timestamp is recorded')
})

test('Reminder Cancellation: Cancels pending reminders when appointment is cancelled', async () => {
  const service = new AppointmentReminderService()
  service.scheduleRemindersForAppointment(mockAppointment, mockClinic)

  service.cancelRemindersForAppointment(mockAppointment.appointmentId)
  const cancelledReminders = service.getRemindersForAppointment(mockAppointment.appointmentId)
  assert.equal(cancelledReminders[0].status, 'cancelled')
  assert.equal(cancelledReminders[1].status, 'cancelled')

  // Attempting to dispatch a cancelled reminder fails gracefully
  const result = await service.dispatchReminder(cancelledReminders[0].id)
  assert.equal(result.success, false)
  assert.equal(result.error, 'Reminder was cancelled')
})

test('Interactive Patient Replies: Accurately classifies patient SMS/WhatsApp response', () => {
  const service = new AppointmentReminderService()
  const phone = '+91 98765 43210'

  // Confirm responses
  for (const text of ['1', 'Confirm', 'Yes I am coming', 'aa raha hu', 'CONFIRMED']) {
    const res = service.handlePatientReply(phone, text)
    assert.equal(res.action, 'confirmed', `"${text}" must classify as confirmed`)
    assert.ok(res.responseMessage.includes('confirmed'))
  }

  // Reschedule responses
  for (const text of ['2', 'reschedule please', 'can I change time?', 'time change']) {
    const res = service.handlePatientReply(phone, text)
    assert.equal(res.action, 'reschedule_requested', `"${text}" must classify as reschedule_requested`)
    assert.ok(res.responseMessage.includes('better for you'))
  }

  // Cancel responses
  for (const text of ['cancel my visit', 'nahi aa paunga sorry']) {
    const res = service.handlePatientReply(phone, text)
    assert.equal(res.action, 'cancelled', `"${text}" must classify as cancelled`)
    assert.ok(res.responseMessage.includes('cancelled'))
  }

  // Unknown responses
  const resUnknown = service.handlePatientReply(phone, 'What is the color of the clinic door?')
  assert.equal(resUnknown.action, 'unknown')
  assert.ok(resUnknown.responseMessage.includes('reception team'))
})
