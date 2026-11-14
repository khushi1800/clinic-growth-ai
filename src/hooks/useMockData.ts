import { useSyncExternalStore } from 'react';
import type {
  Clinic,
  ClinicBranch,
  ClinicStaff,
  ClinicFaq,
  Lead,
  LeadActivity,
  Appointment,
  Conversation,
  Message,
  FollowUpRule,
  Prospect,
  Customer,
  FinanceRecord,
} from '@/types/database';

export const DEMO_CLINIC: Clinic = {
  id: 'clinic-demo-01',
  name: 'Smile Dental Clinic [DEMO]',
  slug: 'smile-dental',
  phone: '+91 98450 12345',
  email: 'contact@smiledentalcare.demo',
  website: 'https://smiledentalcare.demo',
  address: '#42, 12th Main Road, HAL 2nd Stage, Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  business_hours: {
    monday: { open: '09:00', close: '20:00', isOpen: true },
    tuesday: { open: '09:00', close: '20:00', isOpen: true },
    wednesday: { open: '09:00', close: '20:00', isOpen: true },
    thursday: { open: '09:00', close: '20:00', isOpen: true },
    friday: { open: '09:00', close: '20:00', isOpen: true },
    saturday: { open: '09:30', close: '19:00', isOpen: true },
    sunday: { open: '10:00', close: '14:00', isOpen: true },
  },
  settings: {
    ai_receptionist_enabled: true,
    auto_reminders: true,
    whatsapp_notifications: true,
    emergency_contact: '+91 98450 99999',
    avg_consultation_fee: '₹600',
  },
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-11-01T12:00:00Z',
};

export const DEMO_BRANCHES: ClinicBranch[] = [
  {
    id: 'branch-01',
    clinic_id: 'clinic-demo-01',
    name: 'Indiranagar Main Clinic',
    address: '#42, 12th Main, Indiranagar, Bengaluru',
    phone: '+91 98450 12345',
    is_active: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'branch-02',
    clinic_id: 'clinic-demo-01',
    name: 'Koramangala Center',
    address: '80 Feet Road, 4th Block, Koramangala, Bengaluru',
    phone: '+91 98450 67890',
    is_active: true,
    created_at: '2026-04-10T10:00:00Z',
    updated_at: '2026-04-10T10:00:00Z',
  },
];

export const DEMO_STAFF: ClinicStaff[] = [
  {
    id: 'staff-01',
    clinic_id: 'clinic-demo-01',
    user_id: 'usr-01',
    role: 'owner',
    name: 'Dr. Rohan Sharma, MDS',
    email: 'rohan@smiledentalcare.demo',
    phone: '+91 98450 11111',
    is_active: true,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'staff-02',
    clinic_id: 'clinic-demo-01',
    user_id: 'usr-02',
    role: 'doctor',
    name: 'Dr. Pooja Iyer, BDS',
    email: 'pooja@smiledentalcare.demo',
    phone: '+91 98450 22222',
    is_active: true,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'staff-03',
    clinic_id: 'clinic-demo-01',
    user_id: 'usr-03',
    role: 'receptionist',
    name: 'Kavitha Murthy',
    email: 'reception@smiledentalcare.demo',
    phone: '+91 98450 33333',
    is_active: true,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
];

export const DEMO_FAQS: ClinicFaq[] = [
  {
    id: 'faq-01',
    clinic_id: 'clinic-demo-01',
    question: 'How much does a Root Canal Treatment (RCT) cost?',
    answer: 'Standard anterior RCT starts from ₹4,500. Molar root canal with rotary endodontics ranges from ₹6,500 to ₹8,500 depending on complexity. Crown/cap charges are extra depending on zirconia or PFM choice.',
    category: 'Treatments & Pricing',
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'faq-02',
    clinic_id: 'clinic-demo-01',
    question: 'Are you open on Sundays?',
    answer: 'Yes! Our Indiranagar branch is open on Sundays from 10:00 AM to 02:00 PM for scheduled appointments and emergency cases.',
    category: 'Clinic Timings',
    sort_order: 2,
    is_active: true,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'faq-03',
    clinic_id: 'clinic-demo-01',
    question: 'Do you offer dental implant consultations with 3D CBCT scan?',
    answer: 'Yes, Dr. Rohan Sharma is an implantologist with 14+ years experience. We provide digital CBCT scans and guided implant surgery options starting at ₹25,000 per implant unit.',
    category: 'Treatments & Pricing',
    sort_order: 3,
    is_active: true,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'faq-04',
    clinic_id: 'clinic-demo-01',
    question: 'Is teeth whitening painful or harmful to enamel?',
    answer: 'No. We use gentle in-clinic LED laser whitening systems approved by IDA. Mild temporary sensitivity may occur for 24 hours, but enamel remains completely undamaged.',
    category: 'Cosmetic',
    sort_order: 4,
    is_active: true,
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-05T10:00:00Z',
  },
];

export const DEMO_LEADS: (Lead & {
  last_activity?: string;
  treatment_interest?: string;
  source_channel?: string;
})[] = [
  {
    id: 'lead-01',
    clinic_id: 'clinic-demo-01',
    name: 'Aarav Mehta',
    phone: '+91 98201 44219',
    email: 'aarav.mehta@gmail.com',
    source: 'ai_chat',
    status: 'appointment_requested',
    assigned_to: 'staff-01',
    notes: 'Severe molar ache since 2 days, requested urgent Saturday RCT slot with Dr. Rohan.',
    treatment_interest: 'Root Canal Treatment (Molar)',
    last_activity: 'AI Receptionist collected complaint and proposed Saturday 11:30 AM slot.',
    created_at: '2026-11-13T14:30:00Z',
    updated_at: '2026-11-13T14:35:00Z',
  },
  {
    id: 'lead-02',
    clinic_id: 'clinic-demo-01',
    name: 'Priya Nair',
    phone: '+91 97410 88231',
    email: 'priya.nair@outlook.com',
    source: 'whatsapp',
    status: 'interested',
    assigned_to: 'staff-02',
    notes: 'Enquired about teeth whitening packages for upcoming family wedding next month.',
    treatment_interest: 'Laser Teeth Whitening',
    last_activity: 'Sent whitening pricing brochure via WhatsApp automated response.',
    created_at: '2026-11-13T11:15:00Z',
    updated_at: '2026-11-13T11:20:00Z',
  },
  {
    id: 'lead-03',
    clinic_id: 'clinic-demo-01',
    name: 'Rajesh Kumar',
    phone: '+91 94480 32190',
    email: 'rajesh.kumar@tcs.com',
    source: 'website',
    status: 'appointment_confirmed',
    assigned_to: 'staff-01',
    notes: 'Needs single tooth replacement with titanium implant. Prefers morning appointments.',
    treatment_interest: 'Dental Implant Consultation',
    last_activity: 'Appointment booked for tomorrow at 10:00 AM. Confirmation sent.',
    created_at: '2026-11-12T16:00:00Z',
    updated_at: '2026-11-13T09:00:00Z',
  },
  {
    id: 'lead-04',
    clinic_id: 'clinic-demo-01',
    name: 'Ananya Sen',
    phone: '+91 99160 55321',
    email: 'ananya.sen@designco.in',
    source: 'ai_chat',
    status: 'contacted',
    assigned_to: 'staff-03',
    notes: 'Asked about clear aligner duration and EMI options. Willing to visit for digital scan.',
    treatment_interest: 'Invisible Aligners',
    last_activity: 'Follow-up automated sequence scheduled for Friday.',
    created_at: '2026-11-12T18:45:00Z',
    updated_at: '2026-11-12T18:50:00Z',
  },
  {
    id: 'lead-05',
    clinic_id: 'clinic-demo-01',
    name: 'Vikram Patil',
    phone: '+91 96110 77123',
    email: 'vikram.patil@yahoo.co.in',
    source: 'phone',
    status: 'converted',
    assigned_to: 'staff-01',
    notes: 'Emergency wisdom tooth extraction completed successfully. Follow-up review scheduled.',
    treatment_interest: 'Wisdom Tooth Extraction',
    last_activity: 'Payment completed ₹5,500. Post-op WhatsApp guide sent.',
    created_at: '2026-11-10T10:00:00Z',
    updated_at: '2026-11-12T15:30:00Z',
  },
  {
    id: 'lead-06',
    clinic_id: 'clinic-demo-01',
    name: 'Sneha Reddy',
    phone: '+91 98860 12894',
    email: 'sneha.reddy@techm.com',
    source: 'whatsapp',
    status: 'new',
    assigned_to: null,
    notes: 'Asked for pediatric checkup for 6-year-old child with cavities.',
    treatment_interest: 'Pediatric Dental Examination',
    last_activity: 'Captured through WhatsApp AI bot 15 mins ago.',
    created_at: '2026-11-14T09:15:00Z',
    updated_at: '2026-11-14T09:15:00Z',
  },
  {
    id: 'lead-07',
    clinic_id: 'clinic-demo-01',
    name: 'Amit Verma',
    phone: '+91 97310 99441',
    email: 'amit.verma@freelance.org',
    source: 'referral',
    status: 'lost',
    assigned_to: 'staff-03',
    notes: 'Moved to another city (Pune); cancelled follow-up consultation.',
    treatment_interest: 'Routine Dental Scaling',
    last_activity: 'Marked as lost after second follow-up call.',
    created_at: '2026-11-05T12:00:00Z',
    updated_at: '2026-11-11T14:00:00Z',
  },
];

export const DEMO_ACTIVITIES: LeadActivity[] = [
  {
    id: 'act-01',
    lead_id: 'lead-01',
    activity_type: 'ai_conversation',
    description: 'Patient contacted AI assistant reporting sharp pain in lower right molar for 48 hours.',
    created_by: 'AI Receptionist',
    created_at: '2026-11-13T14:30:00Z',
  },
  {
    id: 'act-02',
    lead_id: 'lead-01',
    activity_type: 'triage_flag',
    description: 'AI detected pain level high (8/10), flagged as priority consultation and suggested immediate slot.',
    created_by: 'AI Receptionist',
    created_at: '2026-11-13T14:32:00Z',
  },
  {
    id: 'act-03',
    lead_id: 'lead-01',
    activity_type: 'slot_proposed',
    description: 'Offered Saturday 11:30 AM slot with Dr. Rohan Sharma.',
    created_by: 'AI Receptionist',
    created_at: '2026-11-13T14:34:00Z',
  },
];

export const DEMO_APPOINTMENTS: (Appointment & {
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  treatment: string;
  branch_name: string;
})[] = [
  {
    id: 'apt-01',
    clinic_id: 'clinic-demo-01',
    lead_id: 'lead-03',
    branch_id: 'branch-01',
    doctor_id: 'staff-01',
    patient_name: 'Rajesh Kumar',
    patient_phone: '+91 94480 32190',
    doctor_name: 'Dr. Rohan Sharma',
    treatment: 'Single Titanium Implant Consultation',
    branch_name: 'Indiranagar Main Clinic',
    appointment_date: '2026-11-15',
    appointment_time: '10:00:00',
    duration_minutes: 45,
    status: 'confirmed',
    notes: 'Patient brings previous OPG X-ray from 2025.',
    created_at: '2026-11-13T09:00:00Z',
    updated_at: '2026-11-13T09:00:00Z',
  },
  {
    id: 'apt-02',
    clinic_id: 'clinic-demo-01',
    lead_id: 'lead-01',
    branch_id: 'branch-01',
    doctor_id: 'staff-01',
    patient_name: 'Aarav Mehta',
    patient_phone: '+91 98201 44219',
    doctor_name: 'Dr. Rohan Sharma',
    treatment: 'Acute Pulpitis - Rotary RCT Session 1',
    branch_name: 'Indiranagar Main Clinic',
    appointment_date: '2026-11-15',
    appointment_time: '11:30:00',
    duration_minutes: 60,
    status: 'requested',
    notes: 'Urgent pain relief requested. Needs local anesthesia.',
    created_at: '2026-11-13T14:35:00Z',
    updated_at: '2026-11-13T14:35:00Z',
  },
  {
    id: 'apt-03',
    clinic_id: 'clinic-demo-01',
    lead_id: 'lead-05',
    branch_id: 'branch-01',
    doctor_id: 'staff-02',
    patient_name: 'Vikram Patil',
    patient_phone: '+91 96110 77123',
    doctor_name: 'Dr. Pooja Iyer',
    treatment: 'Post-Extraction Suture Removal & Checkup',
    branch_name: 'Indiranagar Main Clinic',
    appointment_date: '2026-11-16',
    appointment_time: '17:00:00',
    duration_minutes: 20,
    status: 'confirmed',
    notes: 'Healing check 5 days post wisdom extraction.',
    created_at: '2026-11-12T15:35:00Z',
    updated_at: '2026-11-12T15:35:00Z',
  },
  {
    id: 'apt-04',
    clinic_id: 'clinic-demo-01',
    lead_id: 'lead-04',
    branch_id: 'branch-02',
    doctor_id: 'staff-02',
    patient_name: 'Ananya Sen',
    patient_phone: '+91 99160 55321',
    doctor_name: 'Dr. Pooja Iyer',
    treatment: 'Intraoral 3D Scan for Clear Aligners',
    branch_name: 'Koramangala Center',
    appointment_date: '2026-11-18',
    appointment_time: '14:30:00',
    duration_minutes: 30,
    status: 'requested',
    notes: 'Requested Koramangala branch after office hours.',
    created_at: '2026-11-13T19:00:00Z',
    updated_at: '2026-11-13T19:00:00Z',
  },
];

export const DEMO_CONVERSATIONS: (Conversation & {
  lead_name: string;
  lead_phone: string;
  last_message: string;
  is_escalated: boolean;
  messages: Message[];
})[] = [
  {
    id: 'conv-01',
    clinic_id: 'clinic-demo-01',
    lead_id: 'lead-01',
    channel: 'whatsapp',
    started_at: '2026-11-13T14:30:00Z',
    ended_at: null,
    status: 'active',
    lead_name: 'Aarav Mehta',
    lead_phone: '+91 98201 44219',
    last_message: 'Can I get an appointment with Dr. Sharma tomorrow morning around 11:30?',
    is_escalated: true,
    messages: [
      {
        id: 'msg-01',
        conversation_id: 'conv-01',
        role: 'user',
        content: 'Hi, I have severe pain in my lower tooth since yesterday. Can I get an appointment with Dr. Sharma tomorrow morning?',
        metadata: {},
        created_at: '2026-11-13T14:30:10Z',
      },
      {
        id: 'msg-02',
        conversation_id: 'conv-01',
        role: 'assistant',
        content: 'Namaste Aarav! I am Maya, AI assistant at Smile Dental Clinic. I am sorry to hear you are in pain. Is there any visible swelling on your cheek or gums, or difficulty swallowing?',
        metadata: { triage_check: 'red_flags_negative' },
        created_at: '2026-11-13T14:30:25Z',
      },
      {
        id: 'msg-03',
        conversation_id: 'conv-01',
        role: 'user',
        content: 'No swelling yet, but it throbs badly when drinking hot or cold water. Cannot sleep.',
        metadata: {},
        created_at: '2026-11-13T14:31:10Z',
      },
      {
        id: 'msg-04',
        conversation_id: 'conv-01',
        role: 'assistant',
        content: 'Understood. That sounds like acute pulpitis requiring prompt evaluation. Dr. Rohan Sharma has an opening tomorrow (Saturday) at 11:30 AM at our Indiranagar clinic. Shall I reserve this slot for you?',
        metadata: { slot_reserved: '2026-11-15 11:30' },
        created_at: '2026-11-13T14:31:35Z',
      },
      {
        id: 'msg-05',
        conversation_id: 'conv-01',
        role: 'user',
        content: 'Yes please reserve 11:30 AM. How much will the first checkup cost?',
        metadata: {},
        created_at: '2026-11-13T14:32:00Z',
      },
      {
        id: 'msg-06',
        conversation_id: 'conv-01',
        role: 'assistant',
        content: 'The consultation and digital diagnosis fee is ₹600. If an RVG X-ray is required, it is ₹300. I have locked your 11:30 AM appointment and notified Dr. Sharma\'s team! Our clinic is at #42, 12th Main Indiranagar.',
        metadata: { appointment_status: 'requested', intent: 'booking_complete' },
        created_at: '2026-11-13T14:32:30Z',
      },
    ],
  },
  {
    id: 'conv-02',
    clinic_id: 'clinic-demo-01',
    lead_id: 'lead-02',
    channel: 'whatsapp',
    started_at: '2026-11-13T11:15:00Z',
    ended_at: '2026-11-13T11:25:00Z',
    status: 'closed',
    lead_name: 'Priya Nair',
    lead_phone: '+91 97410 88231',
    last_message: 'Thanks! I will review the package details with my fiancé and book next week.',
    is_escalated: false,
    messages: [
      {
        id: 'msg-11',
        conversation_id: 'conv-02',
        role: 'user',
        content: 'Hello, what are your charges for bridal teeth whitening?',
        metadata: {},
        created_at: '2026-11-13T11:15:00Z',
      },
      {
        id: 'msg-12',
        conversation_id: 'conv-02',
        role: 'assistant',
        content: 'Hello Priya! Congratulations on the wedding! 🎉 We offer two options: 1) In-Office Laser Whitening (1 hour session, up to 7 shades lighter) for ₹8,500. 2) Couple Bridal Glow package with scaling + polish for ₹14,000.',
        metadata: {},
        created_at: '2026-11-13T11:15:30Z',
      },
      {
        id: 'msg-13',
        conversation_id: 'conv-02',
        role: 'user',
        content: 'Thanks! I will review the package details with my fiancé and book next week.',
        metadata: {},
        created_at: '2026-11-13T11:18:00Z',
      },
    ],
  },
  {
    id: 'conv-03',
    clinic_id: 'clinic-demo-01',
    lead_id: 'lead-06',
    channel: 'web_chat',
    started_at: '2026-11-14T09:15:00Z',
    ended_at: null,
    status: 'active',
    lead_name: 'Sneha Reddy',
    lead_phone: '+91 98860 12894',
    last_message: 'Do you have female dentists who handle pediatric teeth cleaning?',
    is_escalated: false,
    messages: [
      {
        id: 'msg-21',
        conversation_id: 'conv-03',
        role: 'user',
        content: 'Do you have female dentists who handle pediatric teeth cleaning?',
        metadata: {},
        created_at: '2026-11-14T09:15:00Z',
      },
      {
        id: 'msg-22',
        conversation_id: 'conv-03',
        role: 'assistant',
        content: 'Yes absolutely! Dr. Pooja Iyer specializes in pediatric care and gentle preventive dentistry for young children. Our clinic is child-friendly with comfortable treatment chairs. What is the age of your child?',
        metadata: {},
        created_at: '2026-11-14T09:15:20Z',
      },
    ],
  },
];

export const DEMO_FOLLOWUP_RULES: FollowUpRule[] = [
  {
    id: 'rule-01',
    clinic_id: 'clinic-demo-01',
    name: 'After-Hours Missed Lead WhatsApp Instant Reply',
    trigger_event: 'new_lead_after_hours',
    delay_hours: 0,
    message_template: 'Namaste {{name}}, thank you for reaching out to Smile Dental Clinic. We received your enquiry and our clinical coordinator will reach out first thing at 9:00 AM.',
    channel: 'whatsapp',
    is_active: true,
    max_attempts: 1,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'rule-02',
    clinic_id: 'clinic-demo-01',
    name: 'Unconfirmed Consultation Nudge (24h Delay)',
    trigger_event: 'lead_interested_unbooked',
    delay_hours: 24,
    message_template: 'Hi {{name}}, we noticed you enquired about {{treatment}}. Would you like Dr. Rohan to answer any questions or check weekend availability for you?',
    channel: 'whatsapp',
    is_active: true,
    max_attempts: 2,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'rule-03',
    clinic_id: 'clinic-demo-01',
    name: 'Post-Treatment 24h Recovery Check & Google Review',
    trigger_event: 'appointment_completed',
    delay_hours: 24,
    message_template: 'Hi {{name}}, how is your tooth feeling today after your visit with Dr. {{doctor}}? If you had a pleasant experience, please consider rating us on Google: https://g.page/smiledental/review',
    channel: 'whatsapp',
    is_active: true,
    max_attempts: 1,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
];

// Admin / Owner level mock data
export const DEMO_ADMIN_PROSPECTS: Prospect[] = [
  {
    id: 'prospect-01',
    clinic_name: 'Apex Orthodontics & Dental Spa',
    location: 'Bandra West, Mumbai',
    website: 'https://apexortho.in',
    contact_phone: '+91 98200 88123',
    contact_email: 'dr.desai@apexortho.in',
    source_url: 'Google Maps Top 10 Mumbai',
    research_date: '2026-11-01',
    qualification_score: 92,
    sales_status: 'demo_scheduled',
    last_interaction_at: '2026-11-12T11:00:00Z',
    next_action: 'Present live AI Receptionist demo via Google Meet on Friday 3 PM',
    notes: 'Busy high-ticket aesthetic clinic with 3 associate dentists. Missing 15-20 calls daily on weekends.',
    created_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'prospect-02',
    clinic_name: 'DentaCare SuperSpecialty',
    location: 'HSR Layout, Bengaluru',
    website: 'https://dentacareblr.com',
    contact_phone: '+91 99001 23456',
    contact_email: 'admin@dentacareblr.com',
    source_url: 'IDA Bengaluru Directory',
    research_date: '2026-11-03',
    qualification_score: 85,
    sales_status: 'proposal_sent',
    last_interaction_at: '2026-11-11T16:00:00Z',
    next_action: 'Follow up on ₹19,999/mo Premium Plan proposal',
    notes: 'Interested in multi-branch WhatsApp routing and automated reminder system.',
    created_at: '2026-11-03T10:00:00Z',
  },
  {
    id: 'prospect-03',
    clinic_name: 'CureWhite Dental Clinic',
    location: 'Jubilee Hills, Hyderabad',
    website: 'https://curewhite.com',
    contact_phone: '+91 97011 44556',
    contact_email: 'info@curewhite.com',
    source_url: 'Practo Top Rated Hyderabad',
    research_date: '2026-11-05',
    qualification_score: 78,
    sales_status: 'contacted',
    last_interaction_at: '2026-11-10T14:30:00Z',
    next_action: 'Send ROI calculator showing saved chair-time revenue',
    notes: 'Doctor currently relies on single front desk girl who leaves at 6 PM.',
    created_at: '2026-11-05T10:00:00Z',
  },
  {
    id: 'prospect-04',
    clinic_name: 'BrightSmiles Dental Care',
    location: 'Connaught Place, New Delhi',
    website: 'https://brightsmilesdelhi.com',
    contact_phone: '+91 98110 99887',
    contact_email: 'contact@brightsmilesdelhi.com',
    source_url: 'Delhi Dental Council directory',
    research_date: '2026-11-08',
    qualification_score: 88,
    sales_status: 'negotiating',
    last_interaction_at: '2026-11-13T10:00:00Z',
    next_action: 'Final contract signing with setup fee waiver discussion',
    notes: 'Wants integration with existing local billing software.',
    created_at: '2026-11-08T10:00:00Z',
  },
];

export const DEMO_ADMIN_CUSTOMERS: (Customer & {
  clinic_name: string;
  city: string;
  doctor_name: string;
})[] = [
  {
    id: 'cust-01',
    clinic_id: 'clinic-demo-01',
    prospect_id: null,
    clinic_name: 'Smile Dental Clinic [DEMO]',
    city: 'Bengaluru',
    doctor_name: 'Dr. Rohan Sharma',
    plan: 'premium',
    monthly_rate: 19999,
    setup_fee: 9999,
    start_date: '2026-02-01',
    trial_end_date: null,
    status: 'active',
    health_score: 95,
    next_renewal: '2026-12-01',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'cust-02',
    clinic_id: 'clinic-02',
    prospect_id: null,
    clinic_name: 'Dr. Rao\'s Micro Endodontics',
    city: 'Chennai',
    doctor_name: 'Dr. S. Rao',
    plan: 'standard',
    monthly_rate: 14999,
    setup_fee: 9999,
    start_date: '2026-03-15',
    trial_end_date: null,
    status: 'active',
    health_score: 88,
    next_renewal: '2026-11-15',
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'cust-03',
    clinic_id: 'clinic-03',
    prospect_id: null,
    clinic_name: 'Lotus Aesthetic Smiles',
    city: 'Pune',
    doctor_name: 'Dr. Ananya Kulkarni',
    plan: 'premium',
    monthly_rate: 19999,
    setup_fee: 9999,
    start_date: '2026-05-01',
    trial_end_date: null,
    status: 'active',
    health_score: 92,
    next_renewal: '2026-12-01',
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'cust-04',
    clinic_id: 'clinic-04',
    prospect_id: null,
    clinic_name: 'Pearl Family Dentistry',
    city: 'Ahmedabad',
    doctor_name: 'Dr. Manish Patel',
    plan: 'standard',
    monthly_rate: 14999,
    setup_fee: 9999,
    start_date: '2026-06-10',
    trial_end_date: null,
    status: 'active',
    health_score: 82,
    next_renewal: '2026-12-10',
    created_at: '2026-06-10T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'cust-05',
    clinic_id: 'clinic-05',
    prospect_id: null,
    clinic_name: 'Kolkata Dental Specialists',
    city: 'Kolkata',
    doctor_name: 'Dr. Sourav Banerjee',
    plan: 'standard',
    monthly_rate: 14999,
    setup_fee: 9999,
    start_date: '2026-08-01',
    trial_end_date: null,
    status: 'active',
    health_score: 78,
    next_renewal: '2026-12-01',
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'cust-06',
    clinic_id: 'clinic-06',
    prospect_id: null,
    clinic_name: 'Elite Aligners Hub',
    city: 'Gurugram',
    doctor_name: 'Dr. Meenakshi Gupta',
    plan: 'premium',
    monthly_rate: 19999,
    setup_fee: 9999,
    start_date: '2026-09-01',
    trial_end_date: null,
    status: 'active',
    health_score: 96,
    next_renewal: '2026-12-01',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
  },
];

export const DEMO_FINANCE_RECORDS: FinanceRecord[] = [
  {
    id: 'fin-01',
    type: 'revenue_recurring',
    amount: 19999,
    description: 'Monthly SaaS subscription - Smile Dental Clinic',
    date: '2026-11-01',
    customer_id: 'cust-01',
    created_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'fin-02',
    type: 'revenue_recurring',
    amount: 19999,
    description: 'Monthly SaaS subscription - Lotus Aesthetic Smiles',
    date: '2026-11-01',
    customer_id: 'cust-03',
    created_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'fin-03',
    type: 'revenue_recurring',
    amount: 14999,
    description: 'Monthly SaaS subscription - Kolkata Dental Specialists',
    date: '2026-11-01',
    customer_id: 'cust-05',
    created_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'fin-04',
    type: 'revenue_recurring',
    amount: 19999,
    description: 'Monthly SaaS subscription - Elite Aligners Hub',
    date: '2026-11-01',
    customer_id: 'cust-06',
    created_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'fin-05',
    type: 'expense_api',
    amount: 4500,
    description: 'Google Gemini 1.5 Flash API Consumption (LLM Tokens)',
    date: '2026-11-02',
    customer_id: null,
    created_at: '2026-11-02T10:00:00Z',
  },
  {
    id: 'fin-06',
    type: 'expense_api',
    amount: 7200,
    description: 'WhatsApp Business Cloud API Messaging Charges (Meta)',
    date: '2026-11-03',
    customer_id: null,
    created_at: '2026-11-03T10:00:00Z',
  },
  {
    id: 'fin-07',
    type: 'expense_software',
    amount: 3500,
    description: 'Supabase Database & Auth Cloud Infrastructure',
    date: '2026-11-04',
    customer_id: null,
    created_at: '2026-11-04T10:00:00Z',
  },
];

interface MockStoreState {
  clinic: Clinic;
  branches: ClinicBranch[];
  staff: ClinicStaff[];
  faqs: ClinicFaq[];
  leads: any[];
  appointments: any[];
  conversations: any[];
  followUpRules: FollowUpRule[];
  prospects: Prospect[];
  customers: any[];
  financeRecords: FinanceRecord[];
}

const STORAGE_KEY = 'cga_mock_store_v2';

const defaultState: MockStoreState = {
  clinic: DEMO_CLINIC,
  branches: DEMO_BRANCHES,
  staff: DEMO_STAFF,
  faqs: DEMO_FAQS,
  leads: DEMO_LEADS,
  appointments: DEMO_APPOINTMENTS,
  conversations: DEMO_CONVERSATIONS,
  followUpRules: DEMO_FOLLOWUP_RULES,
  prospects: DEMO_ADMIN_PROSPECTS,
  customers: DEMO_ADMIN_CUSTOMERS,
  financeRecords: DEMO_FINANCE_RECORDS,
};

function loadStore(): MockStoreState {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          clinic: { ...defaultState.clinic, ...(parsed.clinic || {}) },
          appointments: Array.isArray(parsed.appointments) && parsed.appointments.length > 0 ? parsed.appointments : defaultState.appointments,
          leads: Array.isArray(parsed.leads) && parsed.leads.length > 0 ? parsed.leads : defaultState.leads,
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved mock data:', e);
    }
  }
  return defaultState;
}

let currentStore: MockStoreState = loadStore();
const listeners = new Set<() => void>();

function updateStore(updater: (prev: MockStoreState) => MockStoreState) {
  currentStore = updater(currentStore);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStore));
    } catch (e) {
      console.warn('Failed to persist mock data:', e);
    }
  }
  listeners.forEach(fn => fn());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): MockStoreState {
  return currentStore;
}

export function useMockData() {
  const store = useSyncExternalStore(subscribe, getSnapshot, () => defaultState);

  const setClinic = (clinic: Clinic) => {
    updateStore(prev => ({ ...prev, clinic }));
  };

  const updateBusinessHours = (businessHours: any) => {
    updateStore(prev => ({
      ...prev,
      clinic: {
        ...prev.clinic,
        business_hours: businessHours,
        updated_at: new Date().toISOString(),
      },
    }));
  };

  const addLead = (lead: Partial<Lead>) => {
    const newLead: any = {
      id: `lead-${Date.now()}`,
      clinic_id: store.clinic.id,
      name: lead.name || 'Anonymous Patient',
      phone: lead.phone || null,
      email: lead.email || null,
      source: lead.source || 'ai_chat',
      status: lead.status || 'new',
      assigned_to: lead.assigned_to || null,
      notes: lead.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity: 'Lead captured via form',
      treatment_interest: lead.notes || 'General Consultation',
    };
    updateStore(prev => ({
      ...prev,
      leads: [newLead, ...prev.leads],
    }));
    return newLead;
  };

  const updateLeadStatus = (leadId: string, status: any) => {
    updateStore(prev => ({
      ...prev,
      leads: prev.leads.map(l =>
        l.id === leadId ? { ...l, status, updated_at: new Date().toISOString() } : l
      ),
    }));
  };

  const addAppointment = (apt: Partial<any>) => {
    const newApt = {
      id: `apt-${Date.now()}`,
      clinic_id: store.clinic.id,
      lead_id: apt.lead_id || null,
      branch_id: apt.branch_id || 'branch-01',
      doctor_id: apt.doctor_id || 'staff-01',
      patient_name: apt.patient_name || 'Patient',
      patient_phone: apt.patient_phone || '+91 99999 99999',
      doctor_name: apt.doctor_name || 'Dr. Rohan Sharma',
      treatment: apt.treatment || 'Consultation',
      branch_name: apt.branch_name || 'Indiranagar Main Clinic',
      appointment_date: apt.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: apt.appointment_time || '11:00:00',
      duration_minutes: apt.duration_minutes || 30,
      status: apt.status || 'requested',
      notes: apt.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updateStore(prev => ({
      ...prev,
      appointments: [newApt, ...prev.appointments],
    }));
    return newApt;
  };

  const updateAppointmentStatus = (aptId: string, status: any) => {
    updateStore(prev => ({
      ...prev,
      appointments: prev.appointments.map(a =>
        a.id === aptId ? { ...a, status, updated_at: new Date().toISOString() } : a
      ),
    }));
  };

  const addFaq = (faq: Omit<ClinicFaq, 'id' | 'clinic_id' | 'created_at' | 'updated_at'>) => {
    const newFaq: ClinicFaq = {
      id: `faq-${Date.now()}`,
      clinic_id: store.clinic.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      sort_order: store.faqs.length + 1,
      is_active: faq.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updateStore(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFaq],
    }));
    return newFaq;
  };

  const deleteFaq = (id: string) => {
    updateStore(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== id),
    }));
  };

  const addStaff = (member: Partial<ClinicStaff>) => {
    const newStaff: ClinicStaff = {
      id: `staff-${Date.now()}`,
      clinic_id: store.clinic.id,
      user_id: null,
      role: member.role || 'receptionist',
      name: member.name || 'New Staff',
      email: member.email || null,
      phone: member.phone || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updateStore(prev => ({
      ...prev,
      staff: [...prev.staff, newStaff],
    }));
    return newStaff;
  };

  const addFinanceRecord = (record: Omit<FinanceRecord, 'id' | 'created_at'>) => {
    const newRecord: FinanceRecord = {
      ...record,
      id: `fin-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    updateStore(prev => ({
      ...prev,
      financeRecords: [newRecord, ...prev.financeRecords],
    }));
    return newRecord;
  };

  const resetToDefault = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
    updateStore(() => defaultState);
  };

  return {
    clinic: store.clinic,
    setClinic,
    updateBusinessHours,
    branches: store.branches,
    staff: store.staff,
    addStaff,
    faqs: store.faqs,
    addFaq,
    deleteFaq,
    leads: store.leads,
    addLead,
    updateLeadStatus,
    appointments: store.appointments,
    addAppointment,
    updateAppointmentStatus,
    conversations: store.conversations,
    followUpRules: store.followUpRules,
    prospects: store.prospects,
    customers: store.customers,
    financeRecords: store.financeRecords,
    addFinanceRecord,
    resetToDefault,
  };
}
