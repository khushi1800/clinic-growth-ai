import test from 'node:test'
import assert from 'node:assert/strict'
import * as authApi from '../../src/api/auth.js'
import * as clinicsApi from '../../src/api/clinics.js'
import * as leadsApi from '../../src/api/leads.js'
import * as appointmentsApi from '../../src/api/appointments.js'
import * as conversationsApi from '../../src/api/conversations.js'
import * as followupsApi from '../../src/api/followups.js'
import * as prospectsApi from '../../src/api/prospects.js'
import * as customersApi from '../../src/api/customers.js'
import * as financeApi from '../../src/api/finance.js'
import * as reportsApi from '../../src/api/reports.js'
import * as seedApi from '../../src/api/seed.js'

test('API Contracts: All required service methods are exported', () => {
  // Auth API
  assert.equal(typeof authApi.signIn, 'function')
  assert.equal(typeof authApi.signUp, 'function')
  assert.equal(typeof authApi.signOut, 'function')
  assert.equal(typeof authApi.getCurrentUser, 'function')

  // Clinics API
  assert.equal(typeof clinicsApi.getClinic, 'function')
  assert.equal(typeof clinicsApi.updateClinic, 'function')
  assert.equal(typeof clinicsApi.getBranches, 'function')
  assert.equal(typeof clinicsApi.getStaff, 'function')
  assert.equal(typeof clinicsApi.getFaqs, 'function')

  // Leads API
  assert.equal(typeof leadsApi.getLeads, 'function')
  assert.equal(typeof leadsApi.getLead, 'function')
  assert.equal(typeof leadsApi.createLead, 'function')
  assert.equal(typeof leadsApi.updateLead, 'function')
  assert.equal(typeof leadsApi.transitionLeadStatus, 'function')

  // Appointments API
  assert.equal(typeof appointmentsApi.getAppointments, 'function')
  assert.equal(typeof appointmentsApi.createAppointment, 'function')
  assert.equal(typeof appointmentsApi.updateAppointment, 'function')
  assert.equal(typeof appointmentsApi.confirmAppointment, 'function')
  assert.equal(typeof appointmentsApi.cancelAppointment, 'function')
  assert.equal(typeof appointmentsApi.getAvailableSlots, 'function')

  // Conversations API
  assert.equal(typeof conversationsApi.getConversations, 'function')
  assert.equal(typeof conversationsApi.getMessages, 'function')
  assert.equal(typeof conversationsApi.addMessage, 'function')

  // Follow-ups API
  assert.equal(typeof followupsApi.getFollowUpRules, 'function')
  assert.equal(typeof followupsApi.createFollowUpRule, 'function')
  assert.equal(typeof followupsApi.getFollowUpTasks, 'function')

  // Prospects API (Admin)
  assert.equal(typeof prospectsApi.getProspects, 'function')
  assert.equal(typeof prospectsApi.createProspect, 'function')
  assert.equal(typeof prospectsApi.advanceProspectStatus, 'function')

  // Customers API (Admin)
  assert.equal(typeof customersApi.getCustomers, 'function')
  assert.equal(typeof customersApi.getCustomer, 'function')
  assert.equal(typeof customersApi.updateHealthScore, 'function')

  // Finance API (Admin)
  assert.equal(typeof financeApi.getFinanceRecords, 'function')
  assert.equal(typeof financeApi.createFinanceRecord, 'function')
  assert.equal(typeof financeApi.getMonthSummary, 'function')

  // Reports API
  assert.equal(typeof reportsApi.getDashboardStats, 'function')
  assert.equal(typeof reportsApi.getLeadFunnel, 'function')

  // Seed API
  assert.equal(typeof seedApi.seedDemoData, 'function')
  assert.equal(typeof seedApi.clearDemoData, 'function')
})
