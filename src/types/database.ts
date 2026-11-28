// ============================================================
// Clinic Growth AI — Database Row Types
// src/types/database.ts
// ============================================================

import type {
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
} from './enums';

// ---- Clinic ------------------------------------------------

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  business_hours: Record<string, unknown>;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ClinicInsert extends Omit<Clinic, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type ClinicUpdate = Partial<ClinicInsert>;

// ---- Clinic Branch -----------------------------------------

export interface ClinicBranch {
  id: string;
  clinic_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicBranchInsert extends Omit<ClinicBranch, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type ClinicBranchUpdate = Partial<ClinicBranchInsert>;

// ---- Clinic Staff ------------------------------------------

export interface ClinicStaff {
  id: string;
  clinic_id: string;
  user_id: string | null;
  role: StaffRole;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicStaffInsert extends Omit<ClinicStaff, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type ClinicStaffUpdate = Partial<ClinicStaffInsert>;

// ---- Clinic FAQ --------------------------------------------

export interface ClinicFaq {
  id: string;
  clinic_id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicFaqInsert extends Omit<ClinicFaq, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type ClinicFaqUpdate = Partial<ClinicFaqInsert>;

// ---- Lead --------------------------------------------------

export interface Lead {
  id: string;
  clinic_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadInsert extends Omit<Lead, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type LeadUpdate = Partial<LeadInsert>;

// ---- Lead Activity -----------------------------------------

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface LeadActivityInsert extends Omit<LeadActivity, 'id' | 'created_at'> {
  id?: string;
}

// ---- Appointment -------------------------------------------

export interface Appointment {
  id: string;
  clinic_id: string;
  lead_id: string | null;
  branch_id: string | null;
  doctor_id: string | null;
  appointment_date: string; // ISO date string
  appointment_time: string; // HH:MM:SS
  duration_minutes: number;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentInsert extends Omit<Appointment, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type AppointmentUpdate = Partial<AppointmentInsert>;

// ---- Appointment Slot --------------------------------------

export interface AppointmentSlot {
  id: string;
  clinic_id: string;
  branch_id: string | null;
  doctor_id: string | null;
  day_of_week: number; // 0-6
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface AppointmentSlotInsert extends Omit<AppointmentSlot, 'id' | 'created_at'> {
  id?: string;
}

export type AppointmentSlotUpdate = Partial<AppointmentSlotInsert>;

// ---- Conversation ------------------------------------------

export interface Conversation {
  id: string;
  clinic_id: string;
  lead_id: string | null;
  channel: ConversationChannel;
  started_at: string;
  ended_at: string | null;
  status: ConversationStatus;
}

export interface ConversationInsert extends Omit<Conversation, 'id' | 'started_at'> {
  id?: string;
  started_at?: string;
}

export type ConversationUpdate = Partial<ConversationInsert>;

// ---- Message -----------------------------------------------

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MessageInsert extends Omit<Message, 'id' | 'created_at'> {
  id?: string;
}

// ---- Follow-up Rule ----------------------------------------

export interface FollowUpRule {
  id: string;
  clinic_id: string;
  name: string;
  trigger_event: string;
  delay_hours: number;
  message_template: string;
  channel: ConversationChannel;
  is_active: boolean;
  max_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface FollowUpRuleInsert extends Omit<FollowUpRule, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type FollowUpRuleUpdate = Partial<FollowUpRuleInsert>;

// ---- Follow-up Task ----------------------------------------

export interface FollowUpTask {
  id: string;
  clinic_id: string;
  lead_id: string;
  rule_id: string | null;
  scheduled_at: string;
  executed_at: string | null;
  status: FollowupStatus;
  attempt_number: number;
  response: string | null;
  created_at: string;
}

export interface FollowUpTaskInsert extends Omit<FollowUpTask, 'id' | 'created_at'> {
  id?: string;
}

export type FollowUpTaskUpdate = Partial<FollowUpTaskInsert>;

// ---- Review Request ----------------------------------------

export interface ReviewRequest {
  id: string;
  clinic_id: string;
  lead_id: string | null;
  sent_at: string;
  response_at: string | null;
  rating: number | null;
  feedback: string | null;
  status: ReviewRequestStatus;
  created_at: string;
}

export interface ReviewRequestInsert extends Omit<ReviewRequest, 'id' | 'created_at'> {
  id?: string;
}

export type ReviewRequestUpdate = Partial<ReviewRequestInsert>;

// ---- Prospect ----------------------------------------------

export interface Prospect {
  id: string;
  clinic_name: string;
  location: string | null;
  website: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  source_url: string | null;
  research_date: string | null;
  qualification_score: number | null;
  sales_status: SalesStatus;
  last_interaction_at: string | null;
  next_action: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProspectInsert extends Omit<Prospect, 'id' | 'created_at'> {
  id?: string;
}

export type ProspectUpdate = Partial<ProspectInsert>;

// ---- Prospect Activity -------------------------------------

export interface ProspectActivity {
  id: string;
  prospect_id: string;
  activity_type: string;
  description: string | null;
  created_at: string;
}

export interface ProspectActivityInsert extends Omit<ProspectActivity, 'id' | 'created_at'> {
  id?: string;
}

// ---- Customer ----------------------------------------------

export interface Customer {
  id: string;
  clinic_id: string | null;
  prospect_id: string | null;
  plan: CustomerPlan;
  monthly_rate: number;
  setup_fee: number;
  start_date: string;
  trial_end_date: string | null;
  status: CustomerStatus;
  health_score: number | null;
  next_renewal: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsert extends Omit<Customer, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export type CustomerUpdate = Partial<CustomerInsert>;

// ---- Finance Record ----------------------------------------

export interface FinanceRecord {
  id: string;
  type: FinanceType;
  amount: number;
  description: string | null;
  date: string;
  customer_id: string | null;
  created_at: string;
}

export interface FinanceRecordInsert extends Omit<FinanceRecord, 'id' | 'created_at'> {
  id?: string;
}

export type FinanceRecordUpdate = Partial<FinanceRecordInsert>;

// ---- Audit Log ---------------------------------------------

export interface AuditLog {
  id: string;
  clinic_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogInsert extends Omit<AuditLog, 'id' | 'created_at'> {
  id?: string;
}
