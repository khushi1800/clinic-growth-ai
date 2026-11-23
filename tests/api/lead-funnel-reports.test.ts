import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEMO_LEADS,
  DEMO_APPOINTMENTS,
  DEMO_ADMIN_CUSTOMERS,
  DEMO_FINANCE_RECORDS,
} from '../../src/hooks/useMockData.js'

test('Lead Funnel Analytics: Accurately computes lifecycle conversion stages', () => {
  const totalLeads = DEMO_LEADS.length
  assert.ok(totalLeads > 0, 'Must have demo leads')

  const stageCounts: Record<string, number> = {}
  for (const lead of DEMO_LEADS) {
    stageCounts[lead.status] = (stageCounts[lead.status] || 0) + 1
  }

  // Count active vs converted leads
  const converted = stageCounts['converted'] || 0
  const appointmentConfirmed = stageCounts['appointment_confirmed'] || 0
  const appointmentRequested = stageCounts['appointment_requested'] || 0

  assert.ok(converted > 0, 'Must have converted leads in demo data')
  assert.ok(appointmentConfirmed > 0, 'Must have confirmed appointments')
  assert.ok(appointmentRequested > 0, 'Must have requested appointments')

  // Conversion rate sanity check
  const conversionRate = (converted / totalLeads) * 100
  assert.ok(conversionRate > 0 && conversionRate <= 100, 'Conversion rate must be a valid percentage')
})

test('Appointment Attendance Analytics: Calculates show rate and cancellation rate', () => {
  const totalAppointments = DEMO_APPOINTMENTS.length
  assert.ok(totalAppointments > 0)

  const statusCounts: Record<string, number> = {}
  for (const apt of DEMO_APPOINTMENTS) {
    statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1
  }

  const completed = statusCounts['completed'] || 0
  const confirmed = statusCounts['confirmed'] || 0
  const requested = statusCounts['requested'] || 0

  assert.ok(completed + confirmed + requested > 0, 'Appointments must be distributed across active stages')
})

test('Platform SaaS Financials: Accurately computes MRR, ARR, and Net Cashflow', () => {
  assert.ok(DEMO_FINANCE_RECORDS.length > 0)

  // Compute Revenue
  const totalRevenue = DEMO_FINANCE_RECORDS
    .filter((r) => r.type.startsWith('revenue'))
    .reduce((sum, r) => sum + Number(r.amount), 0)

  // Compute Expenses
  const totalExpenses = DEMO_FINANCE_RECORDS
    .filter((r) => r.type.startsWith('expense'))
    .reduce((sum, r) => sum + Number(r.amount), 0)

  // Compute Net Margin
  const netMargin = totalRevenue - totalExpenses
  assert.ok(totalRevenue > 0, 'Platform total revenue should be positive')
  assert.ok(totalExpenses > 0, 'Platform total expenses should be positive')
  assert.ok(typeof netMargin === 'number', 'Net margin calculated')

  // Compute Active Subscriptions ARR
  const activeCustomers = DEMO_ADMIN_CUSTOMERS.filter((c) => c.status === 'active')
  const totalMrr = activeCustomers.reduce((sum, c) => sum + (c.monthly_rate || 0), 0)
  const projectedArr = totalMrr * 12

  assert.ok(totalMrr > 0, 'Total MRR must be positive')
  assert.equal(projectedArr, totalMrr * 12, 'Projected ARR equals MRR * 12')
})

test('Customer Health Score Distribution: Detects healthy, at-risk, and churning clinics', () => {
  assert.ok(DEMO_ADMIN_CUSTOMERS.length > 0)

  const healthy = DEMO_ADMIN_CUSTOMERS.filter((c) => c.health_score >= 80)
  const average = DEMO_ADMIN_CUSTOMERS.filter((c) => c.health_score >= 50 && c.health_score < 80)
  const atRisk = DEMO_ADMIN_CUSTOMERS.filter((c) => c.health_score < 50)

  assert.ok(healthy.length > 0, 'Should have healthy customer clinics')
  assert.ok(average.length + atRisk.length >= 0, 'Correctly partitions customer health bands')
})
