/**
 * ENUM CONSTANTS VALIDATION TESTS
 * Verifies all enums in src/types/enums.ts have correct values and structure
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  StaffRole,
  LeadSource,
  LeadStatus,
  AppointmentStatus,
  ConversationChannel,
  ConversationStatus,
  MessageRole,
  FollowupStatus,
  SalesStatus,
  CustomerPlan,
  CustomerStatus,
  FinanceType,
  ReviewRequestStatus,
} from '../../src/types/enums.js'

test('StaffRole: contains owner, admin, receptionist, doctor', () => {
  assert.equal(StaffRole.OWNER, 'owner')
  assert.equal(StaffRole.ADMIN, 'admin')
  assert.equal(StaffRole.RECEPTIONIST, 'receptionist')
  assert.equal(StaffRole.DOCTOR, 'doctor')
  assert.equal(Object.keys(StaffRole).length, 4)
})

test('LeadSource: contains all 6 lead sources', () => {
  assert.equal(LeadSource.WEBSITE, 'website')
  assert.equal(LeadSource.WHATSAPP, 'whatsapp')
  assert.equal(LeadSource.PHONE, 'phone')
  assert.equal(LeadSource.WALK_IN, 'walk_in')
  assert.equal(LeadSource.REFERRAL, 'referral')
  assert.equal(LeadSource.AI_CHAT, 'ai_chat')
  assert.equal(Object.keys(LeadSource).length, 6)
})

test('LeadStatus: contains all 7 lifecycle stages', () => {
  assert.equal(LeadStatus.NEW, 'new')
  assert.equal(LeadStatus.CONTACTED, 'contacted')
  assert.equal(LeadStatus.INTERESTED, 'interested')
  assert.equal(LeadStatus.APPOINTMENT_REQUESTED, 'appointment_requested')
  assert.equal(LeadStatus.APPOINTMENT_CONFIRMED, 'appointment_confirmed')
  assert.equal(LeadStatus.CONVERTED, 'converted')
  assert.equal(LeadStatus.LOST, 'lost')
  assert.equal(Object.keys(LeadStatus).length, 7)
})

test('AppointmentStatus: contains all 6 statuses', () => {
  assert.equal(AppointmentStatus.REQUESTED, 'requested')
  assert.equal(AppointmentStatus.CONFIRMED, 'confirmed')
  assert.equal(AppointmentStatus.COMPLETED, 'completed')
  assert.equal(AppointmentStatus.CANCELLED, 'cancelled')
  assert.equal(AppointmentStatus.NO_SHOW, 'no_show')
  assert.equal(AppointmentStatus.RESCHEDULED, 'rescheduled')
  assert.equal(Object.keys(AppointmentStatus).length, 6)
})

test('ConversationChannel: contains whatsapp, web_chat, email, phone', () => {
  assert.equal(ConversationChannel.WHATSAPP, 'whatsapp')
  assert.equal(ConversationChannel.WEB_CHAT, 'web_chat')
  assert.equal(ConversationChannel.EMAIL, 'email')
  assert.equal(ConversationChannel.PHONE, 'phone')
  assert.equal(Object.keys(ConversationChannel).length, 4)
})

test('ConversationStatus: contains active, closed, escalated', () => {
  assert.equal(ConversationStatus.ACTIVE, 'active')
  assert.equal(ConversationStatus.CLOSED, 'closed')
  assert.equal(ConversationStatus.ESCALATED, 'escalated')
  assert.equal(Object.keys(ConversationStatus).length, 3)
})

test('MessageRole: contains user, assistant, system', () => {
  assert.equal(MessageRole.USER, 'user')
  assert.equal(MessageRole.ASSISTANT, 'assistant')
  assert.equal(MessageRole.SYSTEM, 'system')
  assert.equal(Object.keys(MessageRole).length, 3)
})

test('FollowupStatus: contains pending, sent, failed, cancelled', () => {
  assert.equal(FollowupStatus.PENDING, 'pending')
  assert.equal(FollowupStatus.SENT, 'sent')
  assert.equal(FollowupStatus.FAILED, 'failed')
  assert.equal(FollowupStatus.CANCELLED, 'cancelled')
  assert.equal(Object.keys(FollowupStatus).length, 4)
})

test('SalesStatus: contains all 9 sales pipeline stages', () => {
  assert.equal(SalesStatus.RESEARCHED, 'researched')
  assert.equal(SalesStatus.CONTACTED, 'contacted')
  assert.equal(SalesStatus.INTERESTED, 'interested')
  assert.equal(SalesStatus.DEMO_SCHEDULED, 'demo_scheduled')
  assert.equal(SalesStatus.DEMO_DONE, 'demo_done')
  assert.equal(SalesStatus.PROPOSAL_SENT, 'proposal_sent')
  assert.equal(SalesStatus.NEGOTIATING, 'negotiating')
  assert.equal(SalesStatus.WON, 'won')
  assert.equal(SalesStatus.LOST, 'lost')
  assert.equal(Object.keys(SalesStatus).length, 9)
})

test('CustomerPlan: contains standard and premium', () => {
  assert.equal(CustomerPlan.STANDARD, 'standard')
  assert.equal(CustomerPlan.PREMIUM, 'premium')
  assert.equal(Object.keys(CustomerPlan).length, 2)
})

test('CustomerStatus: contains trial, active, churned, cancelled', () => {
  assert.equal(CustomerStatus.TRIAL, 'trial')
  assert.equal(CustomerStatus.ACTIVE, 'active')
  assert.equal(CustomerStatus.CHURNED, 'churned')
  assert.equal(CustomerStatus.CANCELLED, 'cancelled')
  assert.equal(Object.keys(CustomerStatus).length, 4)
})

test('FinanceType: contains all 7 finance categories', () => {
  assert.equal(FinanceType.REVENUE_SETUP, 'revenue_setup')
  assert.equal(FinanceType.REVENUE_RECURRING, 'revenue_recurring')
  assert.equal(FinanceType.EXPENSE_SOFTWARE, 'expense_software')
  assert.equal(FinanceType.EXPENSE_API, 'expense_api')
  assert.equal(FinanceType.EXPENSE_CONTRACTOR, 'expense_contractor')
  assert.equal(FinanceType.EXPENSE_MARKETING, 'expense_marketing')
  assert.equal(FinanceType.EXPENSE_OTHER, 'expense_other')
  assert.equal(Object.keys(FinanceType).length, 7)
})

test('ReviewRequestStatus: contains sent, responded, expired', () => {
  assert.equal(ReviewRequestStatus.SENT, 'sent')
  assert.equal(ReviewRequestStatus.RESPONDED, 'responded')
  assert.equal(ReviewRequestStatus.EXPIRED, 'expired')
  assert.equal(Object.keys(ReviewRequestStatus).length, 3)
})
