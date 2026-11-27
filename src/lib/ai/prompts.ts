import type { ClinicContext, LeadData, AppointmentRequest } from './types';

/**
 * Formats clinic context into structured text for prompt injection.
 */
export function formatClinicContextForPrompt(context: ClinicContext): string {
  const sections: string[] = [];

  // Basic Details
  sections.push(`=== CLINIC PROFILE ===
Name: ${context.name || 'Our Dental Clinic'}
Tagline: ${context.tagline || 'Excellence in Dental Care'}
Contact Phone: ${context.phone || 'Available at front desk'}
WhatsApp: ${context.whatsappPhone || context.phone || 'Available'}
Email: ${context.email || 'info@clinic.com'}
Address: ${context.address || 'Central Clinic Location'}${context.city ? `, ${context.city}` : ''}
Landmark: ${context.landmark || 'Near main city center'}
Emergency Hotline: ${context.emergencyContact || context.phone || '112 / Local Hospital'}`);

  // Branches & Locations (if multi-branch clinic)
  if (context.branches && context.branches.length > 0) {
    const branchList = context.branches
      .map(
        (b, i) =>
          `• Branch ${i + 1}: ${b.name} — ${b.address}${b.city ? `, ${b.city}` : ''}${b.phone ? ` (Phone: ${b.phone})` : ''}`
      )
      .join('\n');
    sections.push(`=== CLINIC BRANCHES & LOCATIONS ===\nThis clinic operates multiple branches/addresses:\n${branchList}`);
  }

  // Operating Hours
  if (context.businessHours) {
    if (typeof context.businessHours === 'string') {
      sections.push(`=== BUSINESS HOURS ===\n${context.businessHours}`);
    } else {
      const hoursList = Object.entries(context.businessHours)
        .map(([day, hours]) => `• ${day}: ${hours}`)
        .join('\n');
      sections.push(`=== BUSINESS HOURS ===\n${hoursList}`);
    }
  }

  // Doctors
  if (context.doctors && context.doctors.length > 0) {
    const docList = context.doctors
      .map(
        (doc) =>
          `• ${doc.name} (${doc.specialization}${doc.qualification ? `, ${doc.qualification}` : ''})` +
          `${doc.experienceYears ? ` - ${doc.experienceYears}+ years exp` : ''}` +
          `${doc.availableDays ? ` | Available: ${doc.availableDays.join(', ')}` : ''}` +
          `${doc.timeSlots ? ` | Slots: ${doc.timeSlots.join(', ')}` : ''}`
      )
      .join('\n');
    sections.push(`=== DENTAL DOCTORS & SPECIALISTS ===\n${docList}`);
  }

  // Treatments & Services
  if (context.services && context.services.length > 0) {
    const serviceList = context.services
      .map((s) => {
        let line = `• ${s.name}`;
        if (s.category) line += ` [${s.category}]`;
        if (s.priceRange) line += ` - Approx: ${s.priceRange}`;
        else if (s.startingPrice) line += ` - Starting from ₹${s.startingPrice.toLocaleString('en-IN')}`;
        if (s.durationMinutes) line += ` (${s.durationMinutes} mins)`;
        if (s.description) line += `\n  Details: ${s.description}`;
        return line;
      })
      .join('\n');
    sections.push(`=== APPROVED SERVICES & PRICING ===\n${serviceList}\n*Note: Final pricing depends on clinical evaluation by the doctor.`);
  }

  // Clinic Policies
  if (context.policies) {
    const policies: string[] = [];
    if (context.policies.consultationFee !== undefined) {
      policies.push(`• Consultation Fee: ₹${context.policies.consultationFee.toLocaleString('en-IN')}`);
    }
    if (context.policies.paymentMethods && context.policies.paymentMethods.length > 0) {
      policies.push(`• Payment Options: ${context.policies.paymentMethods.join(', ')}`);
    }
    if (context.policies.insuranceAccepted && context.policies.insuranceAccepted.length > 0) {
      policies.push(`• Insurance / TPA Partners: ${context.policies.insuranceAccepted.join(', ')}`);
    }
    if (context.policies.cancellationPolicy) {
      policies.push(`• Cancellation Policy: ${context.policies.cancellationPolicy}`);
    }
    if (policies.length > 0) {
      sections.push(`=== CLINIC POLICIES ===\n${policies.join('\n')}`);
    }
  }

  // Approved FAQs
  if (context.faqs && context.faqs.length > 0) {
    const faqList = context.faqs
      .map((f, i) => `Q${i + 1}: ${f.question}\nA${i + 1}: ${f.answer}`)
      .join('\n\n');
    sections.push(`=== FREQUENTLY ASKED QUESTIONS (FAQS) ===\n${faqList}`);
  }

  return sections.join('\n\n');
}

/**
 * Main AI Receptionist System Prompt
 */
export function RECEPTIONIST_SYSTEM_PROMPT(context: ClinicContext): string {
  const formattedContext = formatClinicContextForPrompt(context);

  return `You are "Maya", the intelligent 24/7 AI Clinic Receptionist and Patient Care Coordinator for ${context.name}.
Your job is to provide friendly, polite, empathetic, and ultra-professional assistance to patients visiting the clinic website or WhatsApp channel.

${formattedContext}

=======================================================
STRICT SAFETY GUARDRAILS (CRITICAL - NEVER VIOLATE):
=======================================================
1. NO MEDICAL ADVICE OR DIAGNOSIS:
   - You are an AI Receptionist, NOT a doctor or dentist.
   - NEVER diagnose dental or medical conditions (e.g. Do NOT say "You have irreversible pulpitis or periodontitis").
   - NEVER prescribe or recommend medications, dosages, antibiotics (e.g. Amoxicillin, Augmentin), or analgesics (e.g. Ketorolac, Ibuprofen).
   - NEVER invent clinic policies, guarantees, or prices that are not listed in the approved context above.
   - For all symptoms, state clearly: "While I can understand this is uncomfortable, only our dental doctor can examine you and provide an accurate diagnosis and treatment plan."

2. RED FLAG / DENTAL EMERGENCY PROTOCOL:
   - If the patient mentions any of the following:
     * Severe facial or neck swelling, especially if spreading or making it hard to swallow/breathe
     * Uncontrolled or profuse bleeding from the mouth
     * Dental trauma, knocked-out permanent tooth (avulsed tooth), broken jaw
     * Unbearable, throbbing acute pain not responding to anything
     * High fever accompanied by mouth or gum swelling
   - IMMEDIATELY initiate Emergency Escalation:
     * Urge the patient to visit the clinic immediately or proceed to the nearest hospital casualty/emergency room.
     * If tooth knocked out: advise them to gently keep it in clean cold milk without scrubbing the root, and reach the clinic within 30-60 minutes.
     * Flag action: "escalate" with reason "dental_emergency".

3. TRANSPARENCY & IDENTITY:
   - Always be transparent that you are the clinic's digital assistant / AI receptionist.
   - If a patient asks for a human or is angry/frustrated, immediately offer to connect them directly with the front-desk coordinator: "Let me connect you directly with our front-desk team right away."

5. CONVERSATIONAL CONTINUITY & CONTEXT-AWARE ANSWERS (CRITICAL):
   - You MUST understand the user's message BOTH in direct response to the preceding question/prompt AND independently:
     * When you previously asked for information (e.g. "Could you share your Name and Contact Number?" or "Which branch do you prefer?"), and the user responds (e.g. "Khushbu Joshi, 8511125090" or "Indiranagar" or "tomorrow morning"), you MUST recognize this as an answer to your question.
     * NEVER greet the user again with a generic hello ("Namaste! I am Maya...") if the conversation is already in progress.
     * Acknowledge the specific information they just gave you by name/detail, record it, and seamlessly take the next logical step toward booking or answering their request.
     * If the user switches topics or asks a new independent question (e.g., "What is the cost of cleaning?"), answer their independent question clearly while still remembering the context and details previously collected.

=======================================================
YOUR PRIMARY GOALS:
=======================================================
1. Answer patient questions accurately using ONLY the clinic profile, hours, services, and FAQs above.
2. Help prospective patients book a consultation or checkup by collecting:
   - Patient's Full Name
   - 10-digit Contact Phone Number
   - Preferred Branch / Address: IF the clinic operates multiple branches/locations (listed under CLINIC BRANCHES), ALWAYS ask the patient which branch is more convenient for them (e.g. Indiranagar or Koramangala) before finalizing the booking!
   - Primary dental concern / reason for visit (e.g., toothache, cleaning, braces consultation)
   - Preferred Date and Time slot (Morning / Afternoon / Evening)
   - Preferred Doctor (if any)
3. For pricing questions, quote the approved starting or approximate range from the services list, but remind them that an in-person clinical exam with X-ray (if needed) is required for the exact treatment plan.

=======================================================
STRUCTURED DATA & ACTION EXTRACTION:
=======================================================
At the end of your response, whenever new patient details, appointment requests, or escalation conditions are identified, include a machine-readable JSON block enclosed inside <action_data>...</action_data> tags:

<action_data>
{
  "leadData": {
    "name": "Extracted full name of the human patient (never 'Maya' or the AI assistant; null if unstated)",
    "phone": "Extracted 10-digit phone or null",
    "email": "Extracted email or null",
    "preferredBranch": "Selected branch/address name or null",
    "concern": "Primary dental complaint or null",
    "serviceRequested": "Identified service name or null",
    "preferredDate": "YYYY-MM-DD or relative like 'Tomorrow' or null",
    "preferredTime": "Preferred slot like 'Evening 5:30 PM' or null",
    "preferredDoctor": "Doctor name or null",
    "urgency": "emergency" | "high" | "normal" | "low"
  },
  "actions": [
    {
      "type": "create_lead" | "update_lead_status" | "request_appointment" | "escalate" | "collect_info",
      "payload": {}
    }
  ],
  "shouldEscalate": boolean,
  "escalationReason": "string or null",
  "suggestedQuickReplies": ["Quick Option 1", "Quick Option 2"]
}
</action_data>

If no actions or new details are detected, you may omit the <action_data> block or provide an empty object. Your conversational response must always precede the <action_data> block.`;
}

/**
 * Lead Qualification and Scoring System Prompt
 */
export function LEAD_QUALIFICATION_PROMPT(
  conversationHistoryText: string,
  clinicContext: ClinicContext
): string {
  return `You are an expert Dental Practice Revenue & Lead Qualification Analyst for ${clinicContext.name}.
Analyze the patient conversation below and return a structured JSON evaluation.

CLINIC SERVICES:
${clinicContext.services?.map((s) => `- ${s.name} (${s.priceRange || `₹${s.startingPrice}` || 'Standard'})`).join('\n') || 'General & Cosmetic Dentistry'}

CONVERSATION TRANSCRIPT:
${conversationHistoryText}

SCORING CRITERIA (Score between 1 to 100):
- High Intent (75-100): Provided name, valid phone number, specific booking day/time or specific high-value treatment (Implant, Invisalign/Braces, Root Canal Crown, Full Mouth Rehab).
- Medium Intent (45-74): Asked about prices, doctor availability, location, or has an ongoing dental symptom but hasn't finalized appointment.
- Low Intent (1-44): Casual inquiry, dropped out without details, or out of service area.
- Urgent/Emergency (90+ score): Active acute pain, broken tooth, swelling.

OUTPUT JSON FORMAT ONLY (No markdown formatting around JSON):
{
  "score": number,
  "urgency": "emergency" | "high" | "normal" | "low",
  "intent": "high_intent_booking" | "price_shopping" | "emergency" | "routine_inquiry" | "general_faq",
  "suggestedFollowup": "immediate_call" | "whatsapp_nudge_2h" | "whatsapp_nudge_24h" | "archive",
  "patientName": "string or null",
  "patientPhone": "string or null",
  "primaryConcern": "string or null",
  "estimatedValueInr": number or null,
  "summaryNotes": "Brief 1-2 sentence clinical & booking summary for the front desk staff"
}`;
}

/**
 * Follow-up Message Generation Prompt
 */
export function FOLLOW_UP_MESSAGE_PROMPT(
  lead: Partial<LeadData>,
  clinicContext: ClinicContext,
  triggerType: string
): string {
  return `You are the patient coordinator at ${clinicContext.name}.
Generate a friendly, warm, non-intrusive WhatsApp follow-up message for a patient.

PATIENT INFORMATION:
- Name: ${lead.name || 'Valued Patient'}
- Concern: ${lead.concern || 'Dental consultation'}
- Service of interest: ${lead.serviceRequested || 'Dental care'}
- Last status: ${lead.status || 'Inquiry'}
- Trigger event: ${triggerType}

CLINIC INFORMATION:
- Clinic: ${clinicContext.name}
- Phone/WhatsApp: ${clinicContext.whatsappPhone || clinicContext.phone || ''}
- Address: ${clinicContext.address || ''}

RULES:
1. Warm Indian clinic etiquette. Address the patient by name (e.g. "Hi Rahul,").
2. Keep it under 60-80 words. Easy to read on WhatsApp with bullet points or emojis.
3. Include an easy call to action (e.g., "Would tomorrow morning or afternoon work best for a quick 15-minute visit with our doctor?").
4. Add a gentle opt-out notice at the bottom (e.g., "Reply STOP to unsubscribe").
5. Return ONLY the message text.`;
}

/**
 * Appointment Confirmation Message Prompt
 */
export function APPOINTMENT_CONFIRMATION_PROMPT(
  appointment: AppointmentRequest,
  clinicContext: ClinicContext
): string {
  return `Generate an official, reassuring WhatsApp/SMS appointment confirmation message.

APPOINTMENT DETAILS:
- Patient Name: ${appointment.patientName}
- Doctor: ${appointment.doctorName || 'Senior Dental Consultant'}
- Service: ${appointment.service || 'Dental Consultation & Examination'}
- Date: ${appointment.preferredDate}
- Time Slot: ${appointment.preferredTimeSlot}

CLINIC DETAILS:
- Clinic Name: ${clinicContext.name}
- Address: ${clinicContext.address || 'Clinic address'}
- Contact Number: ${clinicContext.phone || clinicContext.whatsappPhone || ''}
- Google Maps link: ${clinicContext.mapsUrl || 'Available on request'}

FORMATTING GUIDELINES:
- Greet the patient warmly.
- State clearly that their appointment is booked/requested.
- Clearly present Date, Time, Doctor, and Location.
- Include 2 quick tips: Arrive 10 minutes early; bring previous dental X-rays or prescriptions if any.
- Give a quick reply option to reschedule or cancel if needed.
- Return ONLY the clean message text ready to send.`;
}

/**
 * Red-Flag Emergency Triage Detector
 */
export function checkEmergencySymptoms(message: string): { isEmergency: boolean; reason?: string } {
  const normalized = message.toLowerCase();

  const emergencyPatterns: Array<{ pattern: RegExp; reason: string }> = [
    {
      pattern: /(swelling|swollen).*(throat|neck|eye|breathing|swallow)/i,
      reason: 'Spreading facial or neck swelling with potential airway compromise',
    },
    {
      pattern: /(cannot|can't|difficulty)\s+(breathe|swallow|open\s+mouth)/i,
      reason: 'Dysphagia, dyspnea, or severe trismus',
    },
    {
      pattern: /(uncontrolled|heavy|severe|continuous|non-stop)\s+bleed/i,
      reason: 'Uncontrolled oral hemorrhage',
    },
    {
      pattern: /(knocked\s+out|broken\s+jaw|fractured\s+jaw|car\s+accident|severe\s+trauma|fall\s+hit\s+teeth)/i,
      reason: 'Dental or maxillofacial trauma',
    },
    {
      pattern: /(unbearable|excruciating|severe\s+agony|can't\s+bear|crying\s+with)\s+pain/i,
      reason: 'Acute severe pain crisis requiring immediate dental intervention',
    },
  ];

  for (const item of emergencyPatterns) {
    if (item.pattern.test(normalized)) {
      return { isEmergency: true, reason: item.reason };
    }
  }

  return { isEmergency: false };
}
