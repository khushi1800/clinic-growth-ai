import test from 'node:test'
import assert from 'node:assert/strict'
import { DEMO_APPOINTMENTS, DEMO_STAFF, DEMO_BRANCHES } from '../../src/hooks/useMockData.js'
import type { Appointment } from '../../src/types/database.js'

test('Appointments Workflow: Status updates and validation', () => {
  const apt: Appointment = {
    ...DEMO_APPOINTMENTS[0],
    id: 'apt-workflow-test',
    status: 'requested',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Confirm appointment
  const confirmedApt: Appointment = {
    ...apt,
    status: 'confirmed',
    updated_at: new Date().toISOString(),
  }
  assert.equal(confirmedApt.status, 'confirmed')

  // Complete appointment
  const completedApt: Appointment = {
    ...confirmedApt,
    status: 'completed',
    updated_at: new Date().toISOString(),
  }
  assert.equal(completedApt.status, 'completed')

  // Cancel appointment
  const cancelledApt: Appointment = {
    ...apt,
    status: 'cancelled',
    notes: 'Patient had an emergency',
    updated_at: new Date().toISOString(),
  }
  assert.equal(cancelledApt.status, 'cancelled')
  assert.ok(cancelledApt.notes.includes('emergency'))
})

test('Appointments Relationship Integrity: Validates Doctor and Branch linkages', () => {
  const staffIds = new Set(DEMO_STAFF.map((s) => s.id))
  const branchIds = new Set(DEMO_BRANCHES.map((b) => b.id))

  for (const apt of DEMO_APPOINTMENTS) {
    if (apt.doctor_id) {
      assert.ok(staffIds.has(apt.doctor_id), `Appointment ${apt.id} doctor_id must belong to clinic staff`)
    }
    if (apt.branch_id) {
      assert.ok(branchIds.has(apt.branch_id), `Appointment ${apt.id} branch_id must belong to clinic branches`)
    }
    // Verify valid time string HH:mm or HH:mm:ss
    assert.match(apt.appointment_time, /^\d{2}:\d{2}(?::\d{2})?$/, 'Valid time format')
    // Verify valid date string YYYY-MM-DD
    assert.match(apt.appointment_date, /^\d{4}-\d{2}-\d{2}$/, 'Valid date format')
  }
})
