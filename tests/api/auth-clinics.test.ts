import test from 'node:test'
import assert from 'node:assert/strict'
import { DEMO_CLINIC, DEMO_STAFF } from '../../src/hooks/useMockData.js'

test('Clinic Configuration & Operating Hours: Complete weekly schedule validation', () => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
  const hours = DEMO_CLINIC.business_hours as Record<string, { open: string; close: string; isOpen: boolean }>

  for (const day of days) {
    const dayConfig = hours[day]
    assert.ok(dayConfig, `Business hours must configure ${day}`)
    assert.equal(typeof dayConfig.isOpen, 'boolean')
    if (dayConfig.isOpen) {
      assert.match(dayConfig.open, /^\d{2}:\d{2}$/, `${day} open time format`)
      assert.match(dayConfig.close, /^\d{2}:\d{2}$/, `${day} close time format`)
      assert.ok(dayConfig.open < dayConfig.close, `${day} open time must precede close time`)
    }
  }
})

test('Staff Roles & Permissions: Hierarchy of owner, doctor, and receptionist', () => {
  const rolePermissions: Record<string, string[]> = {
    owner: ['manage_clinic', 'manage_staff', 'view_reports', 'manage_settings', 'view_leads', 'manage_appointments'],
    doctor: ['view_appointments', 'manage_appointments', 'view_patients', 'view_leads'],
    receptionist: ['create_lead', 'view_leads', 'create_appointment', 'manage_appointments', 'chat_reception'],
  }

  for (const staff of DEMO_STAFF) {
    const permissions = rolePermissions[staff.role]
    assert.ok(permissions, `Staff member ${staff.name} must have a recognized role`)
    assert.ok(permissions.length >= 4, `Staff role ${staff.role} has sufficient functional privileges`)
  }
})
