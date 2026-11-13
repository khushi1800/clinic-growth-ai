/**
 * AI & Receptionist Type Definitions for Clinic Growth AI
 */

export type Role = 'system' | 'user' | 'assistant' | 'function';

export interface ChatMessage {
  id?: string;
  role: Role;
  content: string;
  name?: string;
  timestamp?: string;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  stream?: boolean;
  stopSequences?: string[];
  apiKey?: string;
}

export interface AIResponse {
  content: string;
  raw?: unknown;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
}

export interface ClinicDoctor {
  id: string;
  name: string;
  specialization: string; // e.g. "Orthodontist", "Endodontist", "Implantologist", "General Dentist"
  qualification?: string; // e.g. "BDS, MDS"
  experienceYears?: number;
  availableDays?: string[]; // e.g. ["Monday", "Wednesday", "Friday"]
  timeSlots?: string[]; // e.g. ["10:00 AM - 01:00 PM", "05:00 PM - 08:30 PM"]
}

export interface ClinicService {
  id: string;
  name: string;
  category?: 'Preventive' | 'Orthodontics' | 'Endodontics' | 'Prosthodontics' | 'Cosmetic' | 'Surgery' | 'Pediatric';
  description?: string;
  startingPrice?: number; // In INR
  priceRange?: string; // e.g. "₹2,500 - ₹5,000"
  durationMinutes?: number;
  commonQuestions?: string[];
}

export interface ClinicFAQ {
  question: string;
  answer: string;
  category?: 'pricing' | 'timing' | 'location' | 'treatments' | 'insurance' | 'general';
}

export interface ClinicContext {
  clinicId: string;
  name: string;
  tagline?: string;
  phone?: string;
  whatsappPhone?: string;
  email?: string;
  address?: string;
  city?: string;
  landmark?: string;
  mapsUrl?: string;
  businessHours?: Record<string, string> | string;
  doctors?: ClinicDoctor[];
  services?: ClinicService[];
  faqs?: ClinicFAQ[];
  emergencyContact?: string;
  locationDirections?: string;
  policies?: {
    cancellationPolicy?: string;
    insuranceAccepted?: string[];
    paymentMethods?: string[]; // e.g. ["UPI", "Credit/Debit Card", "Cash", "Bajaj Finserv EMI"]
    consultationFee?: number; // In INR
  };
}

export type ActionType =
  | 'create_lead'
  | 'update_lead_status'
  | 'request_appointment'
  | 'confirm_appointment'
  | 'escalate'
  | 'record_faq_miss'
  | 'send_notification'
  | 'collect_info';

export interface Action {
  type: ActionType;
  payload: Record<string, any>;
  reason?: string;
}

export interface LeadData {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  concern?: string;
  serviceRequested?: string;
  preferredDate?: string;
  preferredTime?: string;
  preferredDoctor?: string;
  preferredDoctorId?: string;
  source?: 'website' | 'whatsapp' | 'phone' | 'walk_in' | 'ai_chat';
  urgency?: 'emergency' | 'high' | 'normal' | 'low';
  score?: number; // 1-100 lead score
  status?:
    | 'new'
    | 'contacted'
    | 'interested'
    | 'appointment_requested'
    | 'appointment_confirmed'
    | 'converted'
    | 'escalated'
    | 'lost';
  language?: 'en' | 'hi' | 'hinglish';
  extractedNotes?: string;
}

export interface ReceptionistResult {
  response: string;
  actions: Action[];
  leadData?: Partial<LeadData>;
  shouldEscalate: boolean;
  escalationReason?: string;
  suggestedQuickReplies?: string[];
  confidenceScore?: number;
  intent?: 'inquiry' | 'booking' | 'pricing' | 'emergency' | 'cancellation' | 'complaint' | 'general';
}

export interface AppointmentRequest {
  patientName: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  doctorId?: string;
  doctorName?: string;
  service?: string;
  notes?: string;
  clinicId?: string;
}

export interface FollowupRule {
  id: string;
  clinicId: string;
  name: string;
  triggerEvent:
    | 'lead_created_no_booking'
    | 'appointment_reminder'
    | 'post_appointment_review'
    | 'no_show_recovery'
    | 'recall_6_month_checkup';
  delayHours: number;
  channel: 'whatsapp' | 'sms' | 'email';
  template: string;
  active: boolean;
}

export interface FollowupExecution {
  id: string;
  clinicId: string;
  leadId: string;
  ruleId: string;
  channel: 'whatsapp' | 'sms' | 'email';
  recipientPhoneOrEmail: string;
  messageBody: string;
  status:
    | 'scheduled'
    | 'sent'
    | 'failed'
    | 'cancelled_opt_out'
    | 'cancelled_converted'
    | 'cancelled_staff_intervention';
  scheduledAt: string;
  sentAt?: string;
  reason?: string;
}
