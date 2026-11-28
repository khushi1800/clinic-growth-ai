import type {
  ChatMessage,
  ClinicContext,
  ReceptionistResult,
  Action,
  LeadData,
  AppointmentRequest,
} from './types';
import { AIProvider, getAIProvider } from './provider';
import {
  RECEPTIONIST_SYSTEM_PROMPT,
  checkEmergencySymptoms,
  LEAD_QUALIFICATION_PROMPT,
  APPOINTMENT_CONFIRMATION_PROMPT,
} from './prompts';
import {
  extractPhone,
  extractName,
  extractDatePreference,
  extractTimePreference,
  extractBranch,
} from './mock-provider';

export interface HandleMessageInput {
  clinicId: string;
  conversationId: string;
  userMessage: string;
  clinicContext: ClinicContext;
  conversationHistory: ChatMessage[];
  provider?: AIProvider;
}

/**
 * Extracts and cleans action_data JSON blocks from the raw response string.
 */
export function parseActionData(rawText: string): {
  cleanedText: string;
  actionData?: {
    leadData?: Partial<LeadData>;
    actions?: Action[];
    shouldEscalate?: boolean;
    escalationReason?: string;
    suggestedQuickReplies?: string[];
  };
} {
  const match = rawText.match(/<action_data>([\s\S]*?)<\/action_data>/i);

  if (!match) {
    return { cleanedText: rawText.trim() };
  }

  const cleanedText = rawText.replace(/<action_data>[\s\S]*?<\/action_data>/gi, '').trim();
  const jsonStr = match[1].trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return { cleanedText, actionData: parsed };
  } catch (err) {
    console.warn('[AI Receptionist] Could not parse action_data JSON block:', err, jsonStr);
    return { cleanedText };
  }
}

/**
 * Classifies high-level user intent from message text
 */
export function classifyIntent(
  message: string
): 'emergency' | 'booking' | 'pricing' | 'hours_location' | 'doctor' | 'handoff' | 'general' {
  const lower = message.toLowerCase();

  if (checkEmergencySymptoms(message).isEmergency) return 'emergency';
  if (
    lower.includes('talk to human') ||
    lower.includes('speak to human') ||
    lower.includes('real person') ||
    lower.includes('agent') ||
    lower.includes('receptionist se baat')
  ) {
    return 'handoff';
  }
  if (
    lower.includes('book') ||
    lower.includes('appointment') ||
    lower.includes('slot') ||
    lower.includes('milna')
  ) {
    return 'booking';
  }
  if (
    lower.includes('cost') ||
    lower.includes('price') ||
    lower.includes('fee') ||
    lower.includes('rate') ||
    lower.includes('kitna') ||
    lower.includes('rct') ||
    lower.includes('charges')
  ) {
    return 'pricing';
  }
  if (
    lower.includes('timing') ||
    lower.includes('hours') ||
    lower.includes('open') ||
    lower.includes('where') ||
    lower.includes('location') ||
    lower.includes('address')
  ) {
    return 'hours_location';
  }
  if (lower.includes('doctor') || lower.includes('dentist') || lower.includes('specialist')) {
    return 'doctor';
  }

  return 'general';
}

/**
 * Core AI Receptionist message handler.
 * Takes incoming patient message, clinic context, and conversation history,
 * executes safety triage and AI inference, and outputs structured actions and clean text.
 */
export async function handleMessage(input: {
  clinicId: string;
  conversationId: string;
  userMessage: string;
  clinicContext: ClinicContext;
  conversationHistory: ChatMessage[];
  provider?: AIProvider;
}): Promise<ReceptionistResult> {
  const { clinicId, userMessage, clinicContext, conversationHistory } = input;
  const provider = input.provider || getAIProvider({ clinicContext });

  // 1. SAFETY FIRST: Deterministic Medical Red-Flag Screening
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

    const emergencyResponse =
      `⚠️ **URGENT DENTAL ADVISORY** ⚠️\n\n` +
      `I understand you are experiencing severe symptoms: **${emergencyCheck.reason}**.\n\n` +
      `As an AI assistant, I cannot provide emergency clinical care. **Please seek immediate medical or dental attention:**\n\n` +
      `🚨 **Clinic Emergency Hotline:** ${clinicContext.emergencyContact || clinicContext.phone || 'Front Desk'}\n` +
      `📍 **Clinic Address:** ${clinicContext.address || 'Central Clinic'}\n\n` +
      `If you have trouble swallowing or uncontrolled bleeding, please head to the nearest hospital emergency room immediately. I have flagged this directly to our senior team.`;

    return {
      response: emergencyResponse,
      actions: [emergencyAction],
      leadData: {
        concern: userMessage,
        urgency: 'emergency',
        status: 'escalated',
      },
      shouldEscalate: true,
      escalationReason: emergencyCheck.reason,
      suggestedQuickReplies: ['Call Emergency Line', 'Get Directions to Clinic', 'Speak with Doctor Now'],
      confidenceScore: 0.99,
      intent: 'emergency',
    };
  }

  // 2. Assemble Context and Messages for AI Provider
  const systemPrompt = RECEPTIONIST_SYSTEM_PROMPT(clinicContext);
  const fullMessages: ChatMessage[] = [
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    },
  ];

  // 3. Generate Response from AI Provider (Google or Mock)
  let rawContent = '';
  try {
    const aiResponse = await provider.generateResponse(fullMessages, systemPrompt, {
      temperature: 0.3,
      maxTokens: 1024,
    });
    rawContent = aiResponse.content;
  } catch (err: unknown) {
    console.error('[AI Receptionist] Provider error:', err);
    // Graceful fallback to MockAIProvider if network or API key fails
    const fallbackProvider = getAIProvider({ type: 'mock', clinicContext });
    const fallbackResponse = await fallbackProvider.generateResponse(fullMessages, systemPrompt);
    rawContent = fallbackResponse.content;
  }

  // 4. Parse Structured Action Data from AI response
  const { cleanedText, actionData } = parseActionData(rawContent);

  // 5. Secondary Safety & Lead Extraction Layer (Heuristics safety net)
  // Only inspect user messages for patient identity to prevent assistant greetings ("I am Maya") from being extracted as customer name
  const userMessagesText = fullMessages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');
  const allUserText = `${userMessagesText} ${userMessage}`.trim();

  const isInvalidPatientName = (name?: string | null): boolean => {
    if (!name) return true;
    const lower = name.trim().toLowerCase();
    return (
      lower === 'maya' ||
      lower.includes('maya') ||
      lower === 'ai' ||
      lower === 'bot' ||
      lower === 'assistant' ||
      lower === 'receptionist' ||
      lower === 'doctor' ||
      lower === 'dentist' ||
      lower === 'clinic'
    );
  };

  const rawActionName = actionData?.leadData?.name;
  const validActionName = isInvalidPatientName(rawActionName) ? null : rawActionName;

  const detectedPhone =
    actionData?.leadData?.phone || extractPhone(userMessage) || extractPhone(allUserText);
  const detectedName =
    validActionName || extractName(userMessage) || extractName(allUserText) || null;
  const detectedBranch =
    actionData?.leadData?.preferredBranch ||
    extractBranch(userMessage, clinicContext.branches) ||
    extractBranch(allUserText, clinicContext.branches) ||
    null;
  const detectedDate = actionData?.leadData?.preferredDate || extractDatePreference(userMessage);
  const detectedTime = actionData?.leadData?.preferredTime || extractTimePreference(userMessage);

  const actions: Action[] = actionData?.actions ? [...actionData.actions] : [];

  // If phone is found and no create_lead action exists yet, inject it
  if (detectedPhone && !actions.some((a) => a.type === 'create_lead')) {
    actions.push({
      type: 'create_lead',
      payload: {
        clinicId,
        name: detectedName || 'Prospective Patient',
        phone: detectedPhone,
        preferredBranch: detectedBranch || undefined,
        source: 'ai_chat',
        status: detectedDate ? 'appointment_requested' : 'contacted',
      },
    });
  }

  // If date & phone are both present, ensure request_appointment action is queued
  if (detectedDate && detectedPhone && !actions.some((a) => a.type === 'request_appointment')) {
    actions.push({
      type: 'request_appointment',
      payload: {
        clinicId,
        patientName: detectedName || 'Patient',
        phone: detectedPhone,
        preferredDate: detectedDate,
        preferredTime: detectedTime || 'Morning Slot',
        branchName: detectedBranch || clinicContext.branches?.[0]?.name || 'Main Clinic',
      },
    });
  }

  const combinedLeadData: Partial<LeadData> = {
    name: detectedName || undefined,
    phone: detectedPhone || undefined,
    preferredBranch: detectedBranch || undefined,
    preferredDate: detectedDate || undefined,
    preferredTime: detectedTime || undefined,
    concern: actionData?.leadData?.concern || undefined,
    serviceRequested: actionData?.leadData?.serviceRequested || undefined,
    urgency: actionData?.leadData?.urgency || 'normal',
    status: detectedDate ? 'appointment_requested' : detectedPhone ? 'contacted' : 'new',
  };

  const shouldEscalate = Boolean(
    actionData?.shouldEscalate ||
      actions.some((a) => a.type === 'escalate') ||
      classifyIntent(userMessage) === 'handoff'
  );

  const escalationReason =
    actionData?.escalationReason ||
    (classifyIntent(userMessage) === 'handoff' ? 'Patient requested human front-desk team' : undefined);

  // Default smart chips if none provided by AI
  let quickReplies = actionData?.suggestedQuickReplies;
  if (!quickReplies || quickReplies.length === 0) {
    if (detectedDate && !detectedPhone) {
      quickReplies = ['Share Phone Number', 'Change Date', 'Speak with Receptionist'];
    } else if (detectedPhone && detectedDate) {
      quickReplies = ['Confirm Booking', 'Add Special Request', 'Clinic Location'];
    } else {
      quickReplies = ['Book Appointment', 'Check Treatment Costs', 'Timings & Address', 'Speak to Receptionist'];
    }
  }

  return {
    response: cleanedText || rawContent,
    actions,
    leadData: combinedLeadData,
    shouldEscalate,
    escalationReason,
    suggestedQuickReplies: quickReplies,
    confidenceScore: 0.95,
    intent: actionData?.leadData?.urgency === 'emergency' ? 'emergency' : 'inquiry',
  };
}

/**
 * Scores and qualifies leads using AI or deterministic rules
 */
export async function qualifyLead(
  conversation: ChatMessage[],
  clinicContext: ClinicContext,
  provider?: AIProvider
): Promise<{
  score: number;
  urgency: 'emergency' | 'high' | 'normal' | 'low';
  intent: string;
  notes: string;
}> {
  const activeProvider = provider || getAIProvider({ clinicContext });
  const conversationText = conversation.map((m) => `${m.role}: ${m.content}`).join('\n');
  const prompt = LEAD_QUALIFICATION_PROMPT(conversationText, clinicContext);

  try {
    const response = await activeProvider.generateResponse(
      [{ role: 'user', content: 'Qualify this dental lead based on the transcript.' }],
      prompt,
      { temperature: 0.1 }
    );

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 60,
        urgency: parsed.urgency || 'normal',
        intent: parsed.intent || 'routine_inquiry',
        notes: parsed.summaryNotes || 'Lead evaluated by AI qualification module.',
      };
    }
  } catch (err) {
    console.warn('[AI Receptionist] AI Lead qualification fallback to heuristics:', err);
  }

  // Heuristic fallback
  const userText = conversation
    .filter((c) => c.role === 'user')
    .map((c) => c.content)
    .join(' ');
  const phone = extractPhone(userText);
  const date = extractDatePreference(userText);
  let score = 30;
  if (phone) score += 35;
  if (date) score += 25;

  return {
    score: Math.min(score, 95),
    urgency: checkEmergencySymptoms(userText).isEmergency ? 'emergency' : 'normal',
    intent: date ? 'high_intent_booking' : phone ? 'interested' : 'routine_inquiry',
    notes: 'Heuristic qualification: Contact or appointment preference registered.',
  };
}

/**
 * Formats a clean appointment confirmation message ready to dispatch via WhatsApp or SMS
 */
export async function generateAppointmentConfirmationMessage(
  appointment: AppointmentRequest,
  clinicContext: ClinicContext,
  provider?: AIProvider
): Promise<string> {
  const activeProvider = provider || getAIProvider({ clinicContext });
  const prompt = APPOINTMENT_CONFIRMATION_PROMPT(appointment, clinicContext);

  try {
    const res = await activeProvider.generateResponse(
      [{ role: 'user', content: 'Generate the appointment confirmation message now.' }],
      prompt,
      { temperature: 0.2 }
    );
    if (res.content && res.content.trim().length > 0) {
      return res.content.trim();
    }
  } catch {
    // Fall back to structured template
  }

  return (
    `✅ *Appointment Confirmed - ${clinicContext.name}*\n\n` +
    `Dear ${appointment.patientName},\n` +
    `Your appointment has been successfully scheduled:\n` +
    `📅 *Date:* ${appointment.preferredDate}\n` +
    `⏰ *Time:* ${appointment.preferredTimeSlot}\n` +
    `👨‍⚕️ *Doctor:* ${appointment.doctorName || 'Senior Dental Specialist'}\n` +
    `📍 *Location:* ${clinicContext.address || 'Clinic Reception'}\n\n` +
    `ℹ️ *Tips:*\n` +
    `• Please arrive 10 minutes prior to your slot.\n` +
    `• Bring any previous dental X-rays or prescriptions.\n\n` +
    `Need to reschedule? Reply directly to this WhatsApp message or call ${clinicContext.phone || ''}.`
  );
}
