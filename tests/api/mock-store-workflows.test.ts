import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEMO_CLINIC,
  DEMO_BRANCHES,
  DEMO_STAFF,
  DEMO_FAQS,
  DEMO_LEADS,
  DEMO_APPOINTMENTS,
  DEMO_CONVERSATIONS,
  DEMO_FOLLOWUP_RULES,
  DEMO_ADMIN_PROSPECTS,
  DEMO_ADMIN_CUSTOMERS,
  DEMO_FINANCE_RECORDS,
} from '../../src/hooks/useMockData.js'

test('Mock Store Entity Schema: Verifies data integrity across all entities', () => {
  // Clinic validation
  assert.ok(DEMO_CLINIC.id)
  assert.ok(DEMO_CLINIC.name)
  assert.ok(DEMO_CLINIC.phone)
  assert.ok(DEMO_CLINIC.business_hours)
  assert.equal(typeof DEMO_CLINIC.business_hours, 'object')
  assert.ok(DEMO_CLINIC.settings.emergency_contact)

  // Branches validation
  assert.ok(DEMO_BRANCHES.length >= 2, 'Should have at least 2 branches for multi-branch support')
  for (const b of DEMO_BRANCHES) {
    assert.equal(b.clinic_id, DEMO_CLINIC.id)
    assert.ok(b.name)
    assert.ok(b.address)
  }

  // Staff validation
  assert.ok(DEMO_STAFF.length >= 3, 'Should have clinic owner, doctor, and receptionist')
  const roles = DEMO_STAFF.map(s => s.role)
  assert.ok(roles.includes('owner'))
  assert.ok(roles.includes('doctor'))
  assert.ok(roles.includes('receptionist'))

  // FAQs validation
  assert.ok(DEMO_FAQS.length > 0)
  for (const faq of DEMO_FAQS) {
    assert.equal(faq.clinic_id, DEMO_CLINIC.id)
    assert.ok(faq.question)
    assert.ok(faq.answer)
  }

  // Leads validation
  assert.ok(DEMO_LEADS.length > 0)
  for (const lead of DEMO_LEADS) {
    assert.equal(lead.clinic_id, DEMO_CLINIC.id)
    assert.ok(lead.name)
    assert.ok(lead.status)
  }

  // Appointments validation
  assert.ok(DEMO_APPOINTMENTS.length > 0)
  for (const apt of DEMO_APPOINTMENTS) {
    assert.equal(apt.clinic_id, DEMO_CLINIC.id)
    assert.ok(apt.patient_name)
    assert.ok(apt.appointment_date)
    assert.ok(apt.appointment_time)
  }

  // Conversations validation
  assert.ok(DEMO_CONVERSATIONS.length > 0)
  for (const conv of DEMO_CONVERSATIONS) {
    assert.equal(conv.clinic_id, DEMO_CLINIC.id)
    assert.ok(conv.channel)
  }

  // Follow-up rules validation
  assert.ok(DEMO_FOLLOWUP_RULES.length > 0)
  for (const rule of DEMO_FOLLOWUP_RULES) {
    assert.equal(rule.clinic_id, DEMO_CLINIC.id)
    assert.ok(rule.name)
  }

  // Admin prospects & customers validation
  assert.ok(DEMO_ADMIN_PROSPECTS.length > 0)
  assert.ok(DEMO_ADMIN_CUSTOMERS.length > 0)
  for (const cust of DEMO_ADMIN_CUSTOMERS) {
    assert.ok(cust.clinic_name)
    assert.ok(cust.health_score >= 0 && cust.health_score <= 100)
    assert.ok(cust.plan)
  }

  // Finance records validation
  assert.ok(DEMO_FINANCE_RECORDS.length > 0)
  for (const fin of DEMO_FINANCE_RECORDS) {
    assert.ok(fin.amount > 0)
    assert.ok(fin.type)
    assert.ok(fin.date)
  }
})
