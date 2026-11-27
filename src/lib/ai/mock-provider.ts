import type { AIProvider } from './provider';
import type { ChatMessage, AIOptions, AIResponse, ClinicContext, Action, ClinicBranchContext } from './types';
import { checkEmergencySymptoms } from './prompts';

export interface MockAIProviderOptions {
  simulatedDelayMs?: number;
  clinicContext?: ClinicContext;
}

/**
 * Default fallback clinic context for mock responses when none is supplied.
 */
export const DEFAULT_MOCK_CLINIC_CONTEXT: ClinicContext = {
  clinicId: 'clinic_default_123',
  name: 'Apex Dental Care & Implant Center',
  phone: '+91 98765 43210',
  whatsappPhone: '+91 98765 43210',
  email: 'care@apexdental.com',
  address: 'Shop 104, 1st Floor, Metro Plaza, Sector 18',
  city: 'Noida, Uttar Pradesh',
  landmark: 'Opposite Metro Pillar 42',
  businessHours: {
    'Monday - Saturday': '09:30 AM - 08:30 PM',
    Sunday: '10:00 AM - 02:00 PM (Prior Appointment Only)',
  },
  emergencyContact: '+91 98765 43211',
  branches: [
    {
      id: 'branch-01',
      name: 'Indiranagar Main Clinic',
      address: '#42, 12th Main Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      phone: '+91 98450 12345',
      isMain: true,
    },
    {
      id: 'branch-02',
      name: 'Koramangala Center',
      address: '80 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      phone: '+91 98450 12346',
      isMain: false,
    },
  ],
  doctors: [
    {
      id: 'doc_1',
      name: 'Dr. Arjun Mehta',
      specialization: 'Senior Endodontist & Root Canal Specialist',
      qualification: 'BDS, MDS',
      experienceYears: 12,
      availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
      timeSlots: ['10:00 AM - 01:30 PM', '05:00 PM - 08:00 PM'],
    },
    {
      id: 'doc_2',
      name: 'Dr. Priya Sharma',
      specialization: 'Orthodontist & Clear Aligner Specialist',
      qualification: 'BDS, MDS Ortho',
      experienceYears: 9,
      availableDays: ['Wednesday', 'Friday', 'Sunday'],
      timeSlots: ['11:00 AM - 03:00 PM', '05:00 PM - 08:30 PM'],
    },
  ],
  services: [
    {
      id: 'srv_1',
      name: 'Dental Consultation & Digital X-Ray (RVG)',
      startingPrice: 500,
      priceRange: '₹500',
      durationMinutes: 20,
      description: 'Comprehensive oral examination with HD digital intra-oral X-ray.',
    },
    {
      id: 'srv_2',
      name: 'Advanced Rotary Root Canal Treatment (RCT)',
      startingPrice: 3500,
      priceRange: '₹3,500 - ₹5,500',
      durationMinutes: 45,
      description: 'Single-sitting or multi-sitting painless motorized root canal therapy.',
    },
    {
      id: 'srv_3',
      name: 'Ultrasonic Teeth Cleaning & Polishing (Scaling)',
      startingPrice: 1500,
      priceRange: '₹1,500 - ₹2,500',
      durationMinutes: 30,
      description: 'Plaque and tartar removal with tooth stain polishing.',
    },
    {
      id: 'srv_4',
      name: 'Dental Crown / Cap (Zirconia / Ceramic)',
      startingPrice: 4000,
      priceRange: '₹4,000 - ₹12,000',
      durationMinutes: 30,
      description: 'Metal-free computer milled CAD-CAM zirconia crowns with up to 15-year warranty.',
    },
    {
      id: 'srv_5',
      name: 'Dental Implants',
      startingPrice: 25000,
      priceRange: '₹25,000 - ₹45,000',
      durationMinutes: 60,
      description: 'Permanent titanium tooth root replacement with international implants (Nobel Biocare / Osstem).',
    },
    {
      id: 'srv_6',
      name: 'Invisalign & Clear Aligners Consultation',
      startingPrice: 45000,
      priceRange: '₹45,000 - ₹1,50,000',
      durationMinutes: 45,
      description: 'Invisible teeth straightening aligners with 3D digital simulation.',
    },
  ],
  faqs: [
    {
      question: 'Is root canal treatment painful?',
      answer:
        'Not at all! We use computerized local anesthesia and modern rotary endodontics, making the entire procedure virtually pain-free for 99% of patients.',
    },
    {
      question: 'Do you accept health insurance or Mediclaim?',
      answer:
        'Yes, we provide reimbursement documentation and support cashless claims with major dental corporate wellness and general insurance TPAs.',
    },
    {
      question: 'What are your clinic timings on weekends?',
      answer:
        'We are open on Saturdays from 9:30 AM to 8:30 PM, and on Sundays from 10:00 AM to 2:00 PM by prior appointment.',
    },
    {
      question: 'Where is the clinic located?',
      answer:
        'We are located at Shop 104, 1st Floor, Metro Plaza, Sector 18, Noida, right opposite Metro Pillar 42 with dedicated valet parking.',
    },
  ],
  policies: {
    consultationFee: 500,
    paymentMethods: ['UPI (GPay / PhonePe / Paytm)', 'Credit & Debit Cards', 'Cash', 'No-Cost EMI on Bajaj Finserv'],
    cancellationPolicy: 'Please notify us at least 2 hours in advance to reschedule your appointment at no cost.',
  },
};

/**
 * Extracts Indian 10-digit mobile phone numbers from conversational text.
 */
export function extractPhone(text: string): string | null {
  // Matches +91 9876543210, +91-9876543210, 9876543210, 09876543210
  const match = text.match(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}/);
  if (match) {
    return match[0].replace(/[\-\s]/g, '');
  }
  return null;
}

const RESERVED_WORDS = new Set([
  'maya',
  'ai',
  'bot',
  'assistant',
  'receptionist',
  'doctor',
  'dr',
  'dentist',
  'dental',
  'clinic',
  'looking',
  'trying',
  'having',
  'planning',
  'suffering',
  'interested',
  'wondering',
  'asking',
  'calling',
  'seeking',
  'here',
  'new',
  'currently',
  'just',
  'very',
  'feeling',
  'experiencing',
  'getting',
  'going',
  'unable',
  'patient',
  'inquiry',
  'question',
  'consultation',
  'appointment',
  'available',
  'visiting',
  'checking',
  'today',
  'tomorrow',
  'morning',
  'evening',
]);

/**
 * Extracts common Indian patient names from introduction patterns.
 * Explicitly guards against mistaking the AI receptionist (Maya) or common words as patient names.
 */
export function extractName(text: string): string | null {
  const patterns = [
    /(?:my name is|naam hai|mera naam)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
    /(?:call me|patient is|patient name is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
    /(?:i am|this is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
    // Name before phone number, e.g. "Khushbu Joshi, 8511125090" or "Khushbu Joshi - 9876543210" or "Rahul Sharma 9876543210"
    /^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*[,:\-\s]\s*(?:\+91[\-\s]?)?[6-9]\d{9}/i,
    // Just a clean 1-to-2 word human name provided on its own line
    /^([A-Za-z]{2,20}(?:\s+[A-Za-z]{2,20}))$/i,
  ];

  for (const p of patterns) {
    const match = text.match(p);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const firstWord = candidate.split(/\s+/)[0].toLowerCase();
      const fullLower = candidate.toLowerCase();
      if (!RESERVED_WORDS.has(firstWord) && !RESERVED_WORDS.has(fullLower) && !fullLower.includes('maya')) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Extracts preferred clinic branch / location from user message or context.
 */
export function extractBranch(text: string, branches?: ClinicBranchContext[]): string | null {
  if (!branches || branches.length === 0) return null;
  const lower = text.toLowerCase();
  for (const b of branches) {
    const bName = b.name.toLowerCase();
    const bAddr = b.address.toLowerCase();
    const keywords = bName
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['clinic', 'center', 'main', 'road', 'branch'].includes(w));
    if (lower.includes(bName) || keywords.some((k) => lower.includes(k))) {
      return b.name;
    }
    const addrKeywords = bAddr
      .split(/[\s,]+/)
      .filter((w) => w.length > 3 && !['road', 'floor', 'stage', 'main', 'bengaluru', 'bangalore', 'sector'].includes(w));
    if (addrKeywords.some((k) => lower.includes(k))) {
      return b.name;
    }
  }
  return null;
}

/**
 * Extracts preferred booking dates from conversational context.
 */
export function extractDatePreference(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('today') || lower.includes('aaj')) return 'Today';
  if (lower.includes('tomorrow') || lower.includes('kal')) return 'Tomorrow';
  if (lower.includes('day after tomorrow') || lower.includes('parso')) return 'Day After Tomorrow';
  if (lower.includes('saturday') || lower.includes('shanivar')) return 'Saturday';
  if (lower.includes('sunday') || lower.includes('ravivar')) return 'Sunday';
  if (lower.includes('monday') || lower.includes('somvar')) return 'Monday';
  if (lower.includes('tuesday')) return 'Tuesday';
  if (lower.includes('wednesday')) return 'Wednesday';
  if (lower.includes('thursday')) return 'Thursday';
  if (lower.includes('friday')) return 'Friday';

  // Specific date pattern like 15th Nov, 15 November, 2026-11-15
  const dateMatch = text.match(/\b\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i);
  if (dateMatch) return dateMatch[0];

  return null;
}

/**
 * Extracts preferred booking time slots from conversational context.
 */
export function extractTimePreference(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('morning') || lower.includes('subah')) return 'Morning (10:00 AM - 01:00 PM)';
  if (lower.includes('afternoon') || lower.includes('dophar')) return 'Afternoon (01:00 PM - 04:00 PM)';
  if (lower.includes('evening') || lower.includes('shaam')) return 'Evening (05:00 PM - 08:30 PM)';

  // Time pattern like 5pm, 5:30 PM, 11 am
  const timeMatch = text.match(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i);
  if (timeMatch) return timeMatch[0].toUpperCase();

  return null;
}

/**
 * Mock AI Provider that simulates production-grade dental clinic AI receptionist responses.
 */
export class MockAIProvider implements AIProvider {
  private defaultDelay: number;
  private clinicContext: ClinicContext;

  constructor(options?: MockAIProviderOptions) {
    this.defaultDelay = options?.simulatedDelayMs ?? 150;
    this.clinicContext = options?.clinicContext ?? DEFAULT_MOCK_CLINIC_CONTEXT;
  }

  public setClinicContext(context: ClinicContext) {
    this.clinicContext = context;
  }

  private async delay(ms: number) {
    if (ms <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generates a realistic canned response based on intent heuristics.
   */
  public async generateResponse(
    messages: ChatMessage[],
    _systemPrompt?: string,
    options?: AIOptions
  ): Promise<AIResponse> {
    const delayMs = options?.temperature === 0 ? 0 : this.defaultDelay;
    await this.delay(delayMs);

    const lastMessage = messages[messages.length - 1]?.content || '';
    // Pass user messages to history for patient entity extraction so assistant greetings like "I am Maya" are never extracted as the patient name
    const userHistory = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n');

    // Also inspect previous assistant prompt to understand user answers in context
    const assistantMessages = messages.filter((m) => m.role === 'assistant');
    const lastAssistantQuestion = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].content : '';

    const result = this.processMockLogic(lastMessage, userHistory, lastAssistantQuestion);

    return {
      content: result,
      usage: {
        promptTokens: Math.floor(userHistory.length / 4) + 100,
        completionTokens: Math.floor(result.length / 4),
        totalTokens: Math.floor((userHistory.length + result.length) / 4) + 100,
      },
      finishReason: 'stop',
    };
  }

  /**
   * Generates a streaming typewriter simulation of the response.
   */
  public async *generateStream(
    messages: ChatMessage[],
    systemPrompt?: string,
    options?: AIOptions
  ): AsyncGenerator<string> {
    const response = await this.generateResponse(messages, systemPrompt, options);
    const content = response.content;

    // Stream out chunks
    const chunkSize = 8;
    for (let i = 0; i < content.length; i += chunkSize) {
      const slice = content.slice(i, i + chunkSize);
      yield slice;
      await this.delay(20);
    }
  }

  /**
   * Core rule engine for mock scenarios.
   * Understands messages BOTH in accordance with the preceding assistant question and independently.
   */
  public processMockLogic(userMessage: string, history: string, previousAssistantQuestion = ''): string {
    const lower = userMessage.toLowerCase().trim();
    const clinic = this.clinicContext;

    // 1. EMERGENCY TRIAGE (HIGHEST PRIORITY)
    const emergencyCheck = checkEmergencySymptoms(userMessage);
    if (emergencyCheck.isEmergency) {
      const emergencyAction: Action = {
        type: 'escalate',
        payload: {
          urgency: 'emergency',
          reason: emergencyCheck.reason,
          patientMessage: userMessage,
        },
      };

      const actionData = {
        leadData: {
          concern: userMessage,
          urgency: 'emergency',
        },
        actions: [emergencyAction],
        shouldEscalate: true,
        escalationReason: emergencyCheck.reason || 'Medical / Dental Emergency',
        suggestedQuickReplies: ['Call Emergency Hotline', 'Speak with Doctor Now', 'Get Clinic Directions'],
      };

      return (
        `⚠️ **URGENT DENTAL CARE ADVISORY** ⚠️\n\n` +
        `I understand you are experiencing severe symptoms (${emergencyCheck.reason}). Your health and safety are our top priority.\n\n` +
        `Please note: While I am the clinic's digital assistant, **this requires immediate in-person clinical attention**.\n\n` +
        `🚨 **Immediate Steps:**\n` +
        `1. Please call our Emergency Hotline right now at **${clinic.emergencyContact || clinic.phone}**.\n` +
        `2. If you are experiencing difficulty breathing or uncontrollable bleeding, please proceed directly to the nearest hospital emergency room.\n` +
        `3. Our clinic is located at **${clinic.address}**.\n\n` +
        `I have immediately alerted our on-duty senior dental team to stand by for your call.` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // 1.5. MEDICAL DIAGNOSIS / PRESCRIPTION GUARDRAIL (MANDATORY REGULATORY BOUNDARY)
    const isMedicalPrescriptionRequest =
      lower.includes('prescribe') ||
      lower.includes('prescription') ||
      lower.includes('medication') ||
      lower.includes('medicine') ||
      lower.includes('antibiotic') ||
      lower.includes('amoxicillin') ||
      lower.includes('ibuprofen') ||
      lower.includes('painkiller') ||
      lower.includes('paracetamol') ||
      lower.includes('diagnos') ||
      lower.includes('what disease') ||
      lower.includes('what condition');

    if (isMedicalPrescriptionRequest) {
      const actionData = {
        actions: [
          {
            type: 'escalate',
            payload: {
              urgency: 'normal',
              reason: 'Patient requested prescription or clinical medical diagnosis',
            },
          },
        ],
        shouldEscalate: false,
        suggestedQuickReplies: ['Book Doctor Consultation', 'Speak with Dentist', 'Clinic Hours'],
      };

      return (
        `As an AI receptionist, I am strictly prohibited from prescribing medication, recommending specific antibiotics, or diagnosing medical conditions.\n\n` +
        `Prescription medications (such as antibiotics or pain relievers) must be prescribed by a qualified, licensed dental doctor only after an in-person clinical examination and review of your medical history.\n\n` +
        `To relieve your discomfort safely, would you like me to book an urgent consultation slot with our dentist today?` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // 2. CHECK FOR HUMAN HANDOFF REQUEST
    if (
      lower.includes('talk to human') ||
      lower.includes('speak to human') ||
      lower.includes('speak to a real human') ||
      lower.includes('talk to a real human') ||
      lower.includes('human receptionist') ||
      lower.includes('real person') ||
      lower.includes('agent') ||
      lower.includes('receptionist se baat') ||
      lower.includes('connect to staff')
    ) {
      const actionData = {
        actions: [{ type: 'escalate', payload: { reason: 'User requested human receptionist' } }],
        shouldEscalate: true,
        escalationReason: 'User requested human agent handoff',
        suggestedQuickReplies: ['Request Callback', 'View Clinic Phone', 'Continue with AI'],
      };

      return (
        `Certainly! I will gladly connect you with our front-desk reception coordinator.\n\n` +
        `You can speak with our team directly:\n` +
        `📞 Phone: **${clinic.phone}**\n` +
        `💬 WhatsApp: **${clinic.whatsappPhone || clinic.phone}**\n\n` +
        `Could you please share your **Name** and **Contact Number**? I'll have our receptionist ring you right away!` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // Extract any existing patient info
    const extractedPhone = extractPhone(userMessage) || extractPhone(history);
    const rawExtractedName = extractName(userMessage) || extractName(history);
    const extractedName = rawExtractedName && rawExtractedName.toLowerCase() !== 'maya' ? rawExtractedName : null;
    const extractedDate = extractDatePreference(userMessage);
    const extractedTime = extractTimePreference(userMessage);
    const extractedBranch = extractBranch(userMessage, clinic.branches) || extractBranch(history, clinic.branches);
    const hasMultipleBranches = Boolean(clinic.branches && clinic.branches.length > 1);
    const hasContactDetails = Boolean(extractedPhone || (extractedName && !RESERVED_WORDS.has(extractedName.toLowerCase())));

    // Check if user is asking an explicit independent inquiry (Pricing, Location, Hours)
    // Only treat as pure independent query if they aren't explicitly requesting a booking in the same breath
    const hasExplicitBookingWord = lower.includes('book') || lower.includes('appointment');
    const isExplicitIndependentQuestion =
      !hasExplicitBookingWord &&
      (lower.includes('cost') ||
        lower.includes('price') ||
        lower.includes('pricing') ||
        lower.includes('charge') ||
        lower.includes('fee') ||
        lower.includes('how much') ||
        lower.includes('kitna') ||
        lower.includes('kharcha') ||
        lower.includes('open on') ||
        lower.includes('timing') ||
        lower.includes('doctor') ||
        lower.includes('dentist'));

    // 2.3 CONVERSATIONAL CONTINUITY (IN ACCORDANCE WITH PREVIOUS ASSISTANT QUESTION)
    const prevQ = previousAssistantQuestion.toLowerCase();
    const isAnsweringBranchQuestion =
      prevQ.includes('branch') ||
      prevQ.includes('location') ||
      prevQ.includes('indiranagar') ||
      prevQ.includes('koramangala');
    const isAnsweringContactQuestion =
      prevQ.includes('name') ||
      prevQ.includes('phone') ||
      prevQ.includes('contact number');
    const isAnsweringDateTimeQuestion =
      prevQ.includes('time') ||
      prevQ.includes('date') ||
      prevQ.includes('morning') ||
      prevQ.includes('evening') ||
      prevQ.includes('slot');

    // If user asked an independent question, let the independent handlers (pricing/hours/doctors) answer it first!
    if (!isExplicitIndependentQuestion) {
      // If assistant asked for contact details or branch, and user provided them:
      if ((isAnsweringContactQuestion && hasContactDetails) || (isAnsweringBranchQuestion && extractedBranch)) {
        if (hasMultipleBranches && !extractedBranch) {
          const branchList = clinic.branches!
            .map((b, i) => `• **Option ${i + 1} (${b.name}):** ${b.address}`)
            .join('\n');
          const branchQuickReplies = clinic.branches!.map((b) => b.name);

          const actionData = {
            leadData: {
              name: extractedName || undefined,
              phone: extractedPhone || undefined,
              status: 'interested',
            },
            actions: [
              {
                type: 'collect_info',
                payload: { missing: ['preferredBranch'] },
              },
            ],
            shouldEscalate: false,
            suggestedQuickReplies: [...branchQuickReplies, 'Earliest Available Slot'],
          };

          return (
            `Thank you${extractedName ? ` **${extractedName}**` : ''}! I have noted your contact details (${extractedPhone || userMessage}). 🦷\n\n` +
            `Since we have **2 clinic locations**, which branch would be more convenient for you?\n\n` +
            `${branchList}\n\n` +
            `Please reply with your preferred branch location so I can reserve your doctor slot!` +
            `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
          );
        }

        if (extractedBranch && (!extractedDate && !extractedTime)) {
          const actionData = {
            leadData: {
              name: extractedName || undefined,
              phone: extractedPhone || undefined,
              preferredBranch: extractedBranch,
              status: 'interested',
            },
            actions: [
              {
                type: 'collect_info',
                payload: { missing: ['preferredDate', 'preferredTime'] },
              },
            ],
            shouldEscalate: false,
            suggestedQuickReplies: ['Tomorrow Morning', 'Tomorrow Evening', 'This Weekend', 'Earliest Available'],
          };

          return (
            `Noted! I have selected our **${extractedBranch}** branch for you${extractedName ? `, **${extractedName}**` : ''}. 📍\n\n` +
            `When would you like to visit us? We have open slots:\n` +
            `• **Tomorrow Morning** (10:30 AM - 01:00 PM)\n` +
            `• **Tomorrow Evening** (05:00 PM - 08:00 PM)\n` +
            `• **This Saturday / Sunday**\n\n` +
            `Please let me know which date and time suits you best.` +
            `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
          );
        }
      }
    }

    // 2.5 DENTAL SYMPTOM & TOOTHACHE INQUIRY (PAIN, SENSITIVITY, CAVITY)
    const isDentalSymptom =
      lower.includes('pain') ||
      lower.includes('ache') ||
      lower.includes('dard') ||
      lower.includes('toothache') ||
      lower.includes('sensitive') ||
      lower.includes('sensitivity') ||
      lower.includes('cavity') ||
      lower.includes('decay') ||
      lower.includes('bleeding gum') ||
      lower.includes('swelling') ||
      lower.includes('broken tooth') ||
      lower.includes('chipped');

    if (isDentalSymptom) {
      const branchOptions = hasMultipleBranches
        ? `We have 2 clinic branches in **Indiranagar** and **Koramangala**. Which branch is closer to you?\n\n`
        : `Our clinic is located at **${clinic.address}**.\n\n`;

      const actionData = {
        leadData: {
          concern: userMessage,
          urgency: 'high',
          status: 'interested',
        },
        actions: [
          {
            type: 'collect_info',
            payload: { intent: 'dental_symptom', concern: userMessage },
          },
        ],
        shouldEscalate: false,
        suggestedQuickReplies: [
          ...(hasMultipleBranches ? ['Indiranagar Branch', 'Koramangala Branch'] : []),
          'Book Urgent Slot',
          'Root Canal Pricing',
          'Speak with Doctor',
        ],
      };

      return (
        `I am so sorry to hear that you are experiencing tooth pain! 🦷 Tooth discomfort shouldn't be ignored as it often indicates a deep cavity, enamel erosion, or nerve inflammation.\n\n` +
        `Our senior dental specialist can gently evaluate the tooth with a digital X-ray to diagnose the root cause and provide instant pain relief.\n\n` +
        `${branchOptions}` +
        `Could you please share your **Name** and **Contact Number** so I can reserve an immediate consultation slot for you?` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // Check if message is primarily asking about location, address, or operating hours
    const isHoursOrLocationInquiry =
      lower.includes('timing') ||
      lower.includes('hours') ||
      lower.includes('open on') ||
      lower.includes('where are you') ||
      lower.includes('where is the clinic') ||
      lower.includes('location') ||
      lower.includes('address') ||
      lower.includes('branch') ||
      lower.includes('kahan');

    // 3. TIMINGS & LOCATION INQUIRIES (check before booking if explicitly asking about hours/address)
    if (isHoursOrLocationInquiry && !lower.includes('book') && !lower.includes('appointment')) {
      const hoursText =
        typeof clinic.businessHours === 'string'
          ? clinic.businessHours
          : Object.entries(clinic.businessHours || {})
              .map(([d, h]) => `• **${d}:** ${h}`)
              .join('\n');

      let locationText = '';
      let branchReplies: string[] = [];
      if (clinic.branches && clinic.branches.length > 0) {
        locationText = clinic.branches
          .map(
            (b, i) =>
              `📍 **Branch ${i + 1} (${b.name}):** ${b.address}${b.city ? `, ${b.city}` : ''}${
                b.phone ? ` (📞 ${b.phone})` : ''
              }`
          )
          .join('\n\n');
        branchReplies = clinic.branches.map((b) => b.name);
      } else {
        locationText = `📍 **Address:** ${clinic.address}${clinic.landmark ? ` (${clinic.landmark})` : ''}${
          clinic.city ? `, ${clinic.city}` : ''
        }\n📞 **Phone:** ${clinic.phone}`;
      }

      const actionData = {
        actions: [{ type: 'collect_info', payload: { intent: 'hours_and_location' } }],
        shouldEscalate: false,
        suggestedQuickReplies: [...branchReplies, 'Book an Appointment', 'Doctor Specializations'],
      };

      return (
        `Here are the clinic locations and timings for **${clinic.name}**:\n\n` +
        `${locationText}\n\n` +
        `🕒 **Operating Hours:**\n${hoursText}\n\n` +
        (hasMultipleBranches
          ? `We have 2 branches across the city. Which branch is more convenient for you? Would you like to schedule an appointment?`
          : `We have ample parking and are conveniently situated near public transit. Would you like to schedule a visit today or tomorrow?`) +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // 4. APPOINTMENT BOOKING & CONTACT DETAILS FLOW
    const isBookingIntent =
      !isExplicitIndependentQuestion &&
      (lower.includes('book') ||
        lower.includes('appointment') ||
        lower.includes('slot') ||
        lower.includes('consultation') ||
        lower.includes('milna') ||
        hasContactDetails ||
        (extractedName && extractedPhone && (extractedDate || extractedTime)));

    if (!isExplicitIndependentQuestion && (isBookingIntent || hasContactDetails)) {
      // If clinic has multiple branches and patient hasn't picked one yet, ask them to choose!
      if (hasMultipleBranches && !extractedBranch) {
        const branchList = clinic.branches!
          .map((b, i) => `• **Option ${i + 1} (${b.name}):** ${b.address}`)
          .join('\n');

        const branchQuickReplies = clinic.branches!.map((b) => b.name);

        const actionData = {
          leadData: {
            name: extractedName || undefined,
            phone: extractedPhone || undefined,
            preferredDate: extractedDate || undefined,
            preferredTime: extractedTime || undefined,
            status: 'interested',
          },
          actions: [
            {
              type: 'collect_info',
              payload: { missing: ['preferredBranch'] },
            },
          ],
          shouldEscalate: false,
          suggestedQuickReplies: [...branchQuickReplies, 'Earliest Available Slot'],
        };

        return (
          `I would be delighted to schedule your visit with our specialist at **${clinic.name}**! 🦷\n\n` +
          `Since we have **2 clinic locations**, which branch would be more convenient for you?\n\n` +
          `${branchList}\n\n` +
          `${
            !extractedPhone || !extractedName
              ? `Could you also please share your **Full Name** and **10-digit Phone Number**?`
              : `Please reply with your preferred branch location so I can reserve your doctor slot!`
          }` +
          `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
        );
      }

      // Check if we have complete information to book
      if (extractedName && extractedPhone && (extractedDate || extractedTime)) {
        const selectedBranch = extractedBranch || clinic.branches?.[0]?.name || clinic.name;
        const branchAddr = clinic.branches?.find((b) => b.name === selectedBranch)?.address || clinic.address;

        const actionData = {
          leadData: {
            name: extractedName,
            phone: extractedPhone,
            preferredBranch: selectedBranch,
            preferredDate: extractedDate || 'Next Available Slot',
            preferredTime: extractedTime || 'Morning Slot',
            urgency: 'high',
            status: 'appointment_requested',
          },
          actions: [
            {
              type: 'request_appointment',
              payload: {
                patientName: extractedName,
                phone: extractedPhone,
                branchName: selectedBranch,
                date: extractedDate || 'Next Available Slot',
                time: extractedTime || 'Morning Slot',
                clinicId: clinic.clinicId,
              },
            },
            {
              type: 'create_lead',
              payload: {
                name: extractedName,
                phone: extractedPhone,
                preferredBranch: selectedBranch,
                source: 'ai_chat',
                status: 'appointment_requested',
              },
            },
          ],
          shouldEscalate: false,
          suggestedQuickReplies: ['Confirm Slot', 'Reschedule Time', 'Add Tooth Pain Notes'],
        };

        const patientDisplayName = extractedName || 'Valued Patient';
        return (
          `Thank you so much${extractedName ? `, **${extractedName}**` : ''}! 🎉\n\n` +
          `I have captured your appointment request:\n` +
          `• **Patient:** ${patientDisplayName}\n` +
          `• **Contact Number:** ${extractedPhone}\n` +
          `• **Clinic Branch:** ${selectedBranch} (${branchAddr})\n` +
          `• **Preferred Date:** ${extractedDate || 'Earliest slot available'}\n` +
          `• **Preferred Time:** ${extractedTime || '11:00 AM'}\n\n` +
          `Our clinic receptionist is sending an official confirmation SMS/WhatsApp with doctor details and your token number right now. Is there anything specific you would like the doctor to know beforehand?` +
          `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
        );
      }

      // If we have phone but no date
      if (extractedPhone && !extractedDate) {
        const actionData = {
          leadData: {
            name: extractedName || undefined,
            phone: extractedPhone,
            status: 'interested',
          },
          actions: [
            {
              type: 'collect_info',
              payload: { missing: ['preferredDate', 'preferredTime'] },
            },
          ],
          shouldEscalate: false,
          suggestedQuickReplies: ['Tomorrow Morning', 'Tomorrow Evening', 'This Weekend', 'Earliest Available'],
        };

        return (
          `Got your contact number **${extractedPhone}**${extractedName ? `, ${extractedName}` : ''}! 👍\n\n` +
          `When would you like to visit us? We have open slots:\n` +
          `• **Tomorrow Morning** (10:30 AM - 01:00 PM)\n` +
          `• **Tomorrow Evening** (05:00 PM - 08:00 PM)\n` +
          `• **This Saturday / Sunday**\n\n` +
          `Please let me know which date and time suits you best.` +
          `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
        );
      }

      // If we have date/time or intent but missing phone
      const actionData = {
        leadData: {
          name: extractedName || undefined,
          preferredDate: extractedDate || undefined,
          preferredTime: extractedTime || undefined,
          status: 'new',
        },
        actions: [
          {
            type: 'collect_info',
            payload: { missing: ['phone', 'name'] },
          },
        ],
        shouldEscalate: false,
        suggestedQuickReplies: ['Share 10-digit Phone', 'Check Doctor Availability', 'Consultation Charges'],
      };

      return (
        `I would be delighted to schedule your visit with our specialist at ${clinic.name}! 🦷\n\n` +
        `To reserve your slot${extractedDate ? ` for **${extractedDate}**` : ''}, could you please share:\n` +
        `1. Your **Full Name**\n` +
        `2. Your **10-digit Mobile Number** (for appointment SMS/WhatsApp confirmation)\n\n` +
        `Once you share these, I will secure your appointment immediately.` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // 4. PRICING & COST INQUIRIES
    if (
      lower.includes('cost') ||
      lower.includes('price') ||
      lower.includes('pricing') ||
      lower.includes('charge') ||
      lower.includes('fee') ||
      lower.includes('rate') ||
      lower.includes('kitna') ||
      lower.includes('kharcha') ||
      lower.includes('rct') ||
      lower.includes('cleaning') ||
      lower.includes('implant') ||
      lower.includes('braces')
    ) {
      let matchedService = '';
      if (lower.includes('rct') || lower.includes('root canal')) {
        matchedService =
          `• **Advanced Rotary Root Canal Treatment (RCT):** Approx ₹3,500 - ₹5,500 per tooth (painless motorized procedure).\n` +
          `• **Crown / Cap (Zirconia / Ceramic):** Starting from ₹4,000.\n`;
      } else if (lower.includes('clean') || lower.includes('scaling') || lower.includes('polish')) {
        matchedService = `• **Ultrasonic Scaling & Polishing:** ₹1,500 - ₹2,500 (complete mouth cleaning).\n`;
      } else if (lower.includes('implant')) {
        matchedService = `• **Permanent Dental Implant:** ₹25,000 - ₹45,000 (includes titanium implant fixture + abutment + crown).\n`;
      } else if (lower.includes('braces') || lower.includes('aligner') || lower.includes('invisalign')) {
        matchedService =
          `• **Invisible Clear Aligners:** ₹45,000 - ₹1,50,000 (customized 3D digital simulation).\n` +
          `• **Traditional Ceramic / Metal Braces:** Starting from ₹25,000.\n`;
      }

      const generalPricing =
        matchedService ||
        `• **Consultation & Digital RVG X-Ray:** ₹${clinic.policies?.consultationFee || 500}\n` +
        `• **Teeth Cleaning & Polishing:** ₹1,500 - ₹2,500\n` +
        `• **Root Canal Treatment (RCT):** ₹3,500 - ₹5,500\n` +
        `• **Dental Crowns (Zirconia):** ₹4,000 - ₹12,000\n` +
        `• **Dental Implants:** Starting from ₹25,000\n`;

      const actionData = {
        actions: [{ type: 'collect_info', payload: { intent: 'pricing_inquiry' } }],
        shouldEscalate: false,
        suggestedQuickReplies: ['Book ₹500 Consultation', 'Do you offer EMI?', 'Is RCT painful?', 'Clinic Timings'],
      };

      return (
        `Here is our transparent pricing guide at ${clinic.name}:\n\n` +
        `${generalPricing}\n` +
        `💳 **Flexible Payment Options:** We support UPI, Cards, Cash, and **0% Interest No-Cost EMI** on Bajaj Finserv.\n\n` +
        `*Note: The exact treatment plan and pricing depends on clinical evaluation and digital X-ray by the doctor.*\n\n` +
        `Would you like to book a consultation slot to have the doctor evaluate your teeth?` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // 5. TIMINGS & LOCATION INQUIRIES
    if (
      lower.includes('time') ||
      lower.includes('timing') ||
      lower.includes('hours') ||
      lower.includes('open') ||
      lower.includes('sunday') ||
      lower.includes('where') ||
      lower.includes('location') ||
      lower.includes('address') ||
      lower.includes('kahan') ||
      lower.includes('directions')
    ) {
      const hoursText =
        typeof clinic.businessHours === 'string'
          ? clinic.businessHours
          : Object.entries(clinic.businessHours || {})
              .map(([d, h]) => `• **${d}:** ${h}`)
              .join('\n');

      const actionData = {
        actions: [{ type: 'collect_info', payload: { intent: 'hours_and_location' } }],
        shouldEscalate: false,
        suggestedQuickReplies: ['Book an Appointment', 'Doctor Specializations', 'Call Clinic Front Desk'],
      };

      return (
        `Here are the clinic details for **${clinic.name}**:\n\n` +
        `📍 **Address:** ${clinic.address}${clinic.landmark ? ` (${clinic.landmark})` : ''}, ${clinic.city}\n` +
        `📞 **Phone:** ${clinic.phone}\n\n` +
        `🕒 **Operating Hours:**\n${hoursText}\n\n` +
        `We have ample parking and are conveniently situated near public transit. Would you like to schedule a visit today or tomorrow?` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // 6. DOCTORS / SPECIALIST INQUIRIES
    if (
      lower.includes('doctor') ||
      lower.includes('dentist') ||
      lower.includes('specialist') ||
      lower.includes('dr') ||
      lower.includes('experience')
    ) {
      const docsList = (clinic.doctors || [])
        .map(
          (d) =>
            `• **${d.name}** - ${d.specialization} (${d.qualification})\n  Experience: ${d.experienceYears}+ years | Available: ${d.availableDays?.join(', ')}`
        )
        .join('\n\n');

      const actionData = {
        actions: [{ type: 'collect_info', payload: { intent: 'doctor_inquiry' } }],
        shouldEscalate: false,
        suggestedQuickReplies: ['Book with Dr. Arjun Mehta', 'Book with Dr. Priya Sharma', 'Check Consultation Fee'],
      };

      return (
        `We have experienced MDS specialists on our dental team at ${clinic.name}:\n\n` +
        `${docsList}\n\n` +
        `Which specialist would you like to consult with, or would you like to describe your dental concern so I can recommend the right doctor?` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    // 7. GREETING & GENERAL INQUIRY (DEFAULT)
    // If conversation is already underway, do NOT re-introduce Maya with a generic greeting
    if (history.trim().length > 0 || previousAssistantQuestion.trim().length > 0) {
      const actionData = {
        leadData: {
          urgency: 'normal',
        },
        actions: [{ type: 'collect_info', payload: { intent: 'follow_up_inquiry' } }],
        shouldEscalate: false,
        suggestedQuickReplies: ['Book Appointment', 'Pricing & Charges', 'Clinic Timings', 'Speak with Doctor'],
      };

      return (
        `Understood${extractedName ? `, **${extractedName}**` : ''}! 👍\n\n` +
        `How else may I help you with your dental care today? Would you like to check doctor timings, treatment costs, or reserve an appointment slot?` +
        `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
      );
    }

    const actionData = {
      leadData: {
        urgency: 'normal',
      },
      actions: [{ type: 'collect_info', payload: { intent: 'greeting' } }],
      shouldEscalate: false,
      suggestedQuickReplies: ['Book Appointment', 'Treatment Pricing', 'Clinic Hours & Location', 'Tooth Pain / Emergency'],
    };

    return (
      `Namaste! 🙏 I am **Maya**, the 24/7 AI Receptionist at **${clinic.name}**.\n\n` +
      `How may I assist you today? I can help you with:\n` +
      `• 📅 Booking an appointment with our dental specialists\n` +
      `• 💰 Transparent treatment costs (RCT, Implants, Braces, Cleaning)\n` +
      `• 📍 Clinic address, directions, and working hours\n` +
      `• 🚨 Emergency dental guidance and front-desk escalation\n\n` +
      `Please let me know what you need or what dental symptoms you might be experiencing!` +
      `\n\n<action_data>\n${JSON.stringify(actionData, null, 2)}\n</action_data>`
    );
  }
}
