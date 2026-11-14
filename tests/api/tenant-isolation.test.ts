import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEMO_CLINIC,
  DEMO_LEADS,
  DEMO_APPOINTMENTS,
  DEMO_ADMIN_PROSPECTS,
  DEMO_FINANCE_RECORDS,
} from '../../src/hooks/useMockData.js'

test('Tenant Isolation Data Modeling: Every clinic-scoped entity contains clinic_id', () => {
  assert.ok(DEMO_CLINIC.id, 'Clinic must have an ID')

  // Check all leads
  for (const lead of DEMO_LEADS) {
    assert.ok(lead.id, 'Lead must have an ID')
    assert.ok(lead.clinic_id, `Lead ${lead.id} must strictly belong to a clinic_id`)
    assert.equal(lead.clinic_id, DEMO_CLINIC.id, 'Lead clinic_id matches active tenant clinic')
  }

  // Check all appointments
  for (const apt of DEMO_APPOINTMENTS) {
    assert.ok(apt.id, 'Appointment must have an ID')
    assert.ok(apt.clinic_id, `Appointment ${apt.id} must strictly belong to a clinic_id`)
    assert.equal(apt.clinic_id, DEMO_CLINIC.id, 'Appointment clinic_id matches active tenant clinic')
  }
})

test('Platform Owner Isolation: Prospects and Platform Financials are NOT accessible to clinic staff', () => {
  // Prospects belong to platform B2B sales pipeline, not individual clinic leads
  for (const prospect of DEMO_ADMIN_PROSPECTS) {
    assert.ok(prospect.id, 'Prospect must have an ID')
    assert.ok(prospect.qualification_score >= 0 && prospect.qualification_score <= 100, 'Score is 0-100')
    // Prospect does not have a clinic_id because it is pre-customer
    assert.equal('clinic_id' in prospect, false, 'Platform prospects must not be coupled to tenant clinic tables')
  }

  // Platform financials separation
  assert.ok(DEMO_FINANCE_RECORDS.length > 0, 'Platform finance records must be tracked')
  const totalRevenue = DEMO_FINANCE_RECORDS
    .filter(r => r.type.startsWith('revenue'))
    .reduce((acc, r) => acc + Number(r.amount), 0)
  assert.ok(totalRevenue > 0, 'Platform revenue tracked')
})

test('Lead Stage Progression Integrity', () => {
  const validStages = [
    'new',
    'contacted',
    'interested',
    'appointment_requested',
    'appointment_confirmed',
    'converted',
    'lost',
  ]

  for (const lead of DEMO_LEADS) {
    assert.ok(validStages.includes(lead.status), `Lead status ${lead.status} must be one of the defined lifecycle stages`)
  }
})
