// ============================================================
// Clinic Growth AI — Enum Constants
// src/types/enums.ts
// ============================================================

export const StaffRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
} as const;
export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

export const LeadSource = {
  WEBSITE: 'website',
  WHATSAPP: 'whatsapp',
  PHONE: 'phone',
  WALK_IN: 'walk_in',
  REFERRAL: 'referral',
  AI_CHAT: 'ai_chat',
} as const;
export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

export const LeadStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  INTERESTED: 'interested',
  APPOINTMENT_REQUESTED: 'appointment_requested',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  CONVERTED: 'converted',
  LOST: 'lost',
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

export const AppointmentStatus = {
  REQUESTED: 'requested',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled',
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const ConversationChannel = {
  WHATSAPP: 'whatsapp',
  WEB_CHAT: 'web_chat',
  EMAIL: 'email',
  PHONE: 'phone',
} as const;
export type ConversationChannel = (typeof ConversationChannel)[keyof typeof ConversationChannel];

export const ConversationStatus = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
} as const;
export type ConversationStatus = (typeof ConversationStatus)[keyof typeof ConversationStatus];

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

export const FollowupStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;
export type FollowupStatus = (typeof FollowupStatus)[keyof typeof FollowupStatus];

export const SalesStatus = {
  RESEARCHED: 'researched',
  CONTACTED: 'contacted',
  INTERESTED: 'interested',
  DEMO_SCHEDULED: 'demo_scheduled',
  DEMO_DONE: 'demo_done',
  PROPOSAL_SENT: 'proposal_sent',
  NEGOTIATING: 'negotiating',
  WON: 'won',
  LOST: 'lost',
} as const;
export type SalesStatus = (typeof SalesStatus)[keyof typeof SalesStatus];

export const CustomerPlan = {
  STANDARD: 'standard',
  PREMIUM: 'premium',
} as const;
export type CustomerPlan = (typeof CustomerPlan)[keyof typeof CustomerPlan];

export const CustomerStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  CHURNED: 'churned',
  CANCELLED: 'cancelled',
} as const;
export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus];

export const FinanceType = {
  REVENUE_SETUP: 'revenue_setup',
  REVENUE_RECURRING: 'revenue_recurring',
  EXPENSE_SOFTWARE: 'expense_software',
  EXPENSE_API: 'expense_api',
  EXPENSE_CONTRACTOR: 'expense_contractor',
  EXPENSE_MARKETING: 'expense_marketing',
  EXPENSE_OTHER: 'expense_other',
} as const;
export type FinanceType = (typeof FinanceType)[keyof typeof FinanceType];

export const ReviewRequestStatus = {
  SENT: 'sent',
  RESPONDED: 'responded',
  EXPIRED: 'expired',
} as const;
export type ReviewRequestStatus = (typeof ReviewRequestStatus)[keyof typeof ReviewRequestStatus];
