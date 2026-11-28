import type {
  ClinicContext,
  LeadData,
  FollowupRule,
  FollowupExecution,
} from '../ai/types';
import { AIProvider, getAIProvider } from '../ai/provider';
import { FOLLOW_UP_MESSAGE_PROMPT } from '../ai/prompts';
import { ChannelRegistry, SendResult } from './channels';

/**
 * Global opt-out / DND registry to ensure patient privacy and compliance.
 */
class OptOutRegistry {
  private optedOutSet = new Set<string>();

  public optOut(recipient: string): void {
    const clean = recipient.replace(/[-\s+]/g, '').toLowerCase();
    this.optedOutSet.add(clean);
  }

  public optIn(recipient: string): void {
    const clean = recipient.replace(/[-\s+]/g, '').toLowerCase();
    this.optedOutSet.delete(clean);
  }

  public isOptedOut(recipient: string): boolean {
    const clean = recipient.replace(/[-\s+]/g, '').toLowerCase();
    return this.optedOutSet.has(clean);
  }

  public clear(): void {
    this.optedOutSet.clear();
  }
}

export const globalOptOutRegistry = new OptOutRegistry();

/**
 * Follow-up Automation Engine
 */
export class FollowupAutomationService {
  private executions: FollowupExecution[] = [];

  /**
   * Evaluates whether a lead is eligible to receive an automated follow-up.
   */
  public evaluateEligibility(
    lead: Partial<LeadData> & {
      staffIntervened?: boolean;
      convertedAt?: string;
    },
    rule: FollowupRule
  ): { eligible: boolean; ineligibleReason?: FollowupExecution['status'] } {
    const recipient = lead.phone || lead.email || '';

    // 1. Consent / Opt-Out Check
    if (globalOptOutRegistry.isOptedOut(recipient)) {
      return { eligible: false, ineligibleReason: 'cancelled_opt_out' };
    }

    // 2. Staff Intervention Check
    // If clinic staff has stepped in to handle the patient, halt bot follow-ups
    if (lead.staffIntervened) {
      return { eligible: false, ineligibleReason: 'cancelled_staff_intervention' };
    }

    // 3. Conversion / Booking Check
    // If the patient already booked or converted, cancel automated lead nudges
    if (
      lead.status === 'converted' ||
      lead.status === 'appointment_confirmed' ||
      lead.convertedAt
    ) {
      return { eligible: false, ineligibleReason: 'cancelled_converted' };
    }

    // 4. Rule Active Check
    if (!rule.active) {
      return { eligible: false, ineligibleReason: 'cancelled_staff_intervention' };
    }

    return { eligible: true };
  }

  /**
   * Generates a personalized message using AI provider or dynamic template fallback.
   */
  public async generatePersonalizedMessage(
    lead: Partial<LeadData>,
    rule: FollowupRule,
    clinicContext: ClinicContext,
    provider?: AIProvider
  ): Promise<string> {
    const activeProvider = provider || getAIProvider({ clinicContext });

    // Try AI generation first
    try {
      const prompt = FOLLOW_UP_MESSAGE_PROMPT(lead, clinicContext, rule.triggerEvent);
      const res = await activeProvider.generateResponse(
        [{ role: 'user', content: `Generate follow-up for trigger: ${rule.triggerEvent}` }],
        prompt,
        { temperature: 0.3 }
      );

      if (res.content && res.content.trim().length > 0) {
        return res.content.trim();
      }
    } catch (err) {
      console.warn('[Followup Service] AI message generation fallback to template:', err);
    }

    // Reliable fallback template interpolation
    return this.interpolateTemplate(rule.template, lead, clinicContext);
  }

  /**
   * Interpolates template tags like {{patient_name}}, {{clinic_name}}, etc.
   */
  public interpolateTemplate(
    template: string,
    lead: Partial<LeadData>,
    clinicContext: ClinicContext
  ): string {
    const replacements: Record<string, string> = {
      '{{patient_name}}': lead.name || 'Valued Patient',
      '{{clinic_name}}': clinicContext.name,
      '{{clinic_phone}}': clinicContext.whatsappPhone || clinicContext.phone || '',
      '{{concern}}': lead.concern || 'your dental consultation',
      '{{service}}': lead.serviceRequested || 'dental care',
    };

    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.split(key).join(value);
    }

    return result;
  }

  /**
   * Executes a single follow-up rule for a lead.
   */
  public async executeRule(
    rule: FollowupRule,
    lead: Partial<LeadData> & {
      id?: string;
      staffIntervened?: boolean;
      convertedAt?: string;
    },
    clinicContext: ClinicContext,
    provider?: AIProvider
  ): Promise<{ execution: FollowupExecution; sendResult?: SendResult }> {
    const leadId = lead.id || `lead_${Date.now()}`;
    const recipient = lead.phone || lead.email || '';
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const scheduledAt = new Date().toISOString();

    const eligibility = this.evaluateEligibility(lead, rule);

    if (!eligibility.eligible) {
      const skippedExecution: FollowupExecution = {
        id: executionId,
        clinicId: clinicContext.clinicId,
        leadId,
        ruleId: rule.id,
        channel: rule.channel,
        recipientPhoneOrEmail: recipient,
        messageBody: '',
        status: eligibility.ineligibleReason || 'cancelled_staff_intervention',
        scheduledAt,
        reason: `Follow-up stopped: condition matched [${eligibility.ineligibleReason}]`,
      };

      this.executions.unshift(skippedExecution);
      return { execution: skippedExecution };
    }

    // Generate message content
    const message = await this.generatePersonalizedMessage(lead, rule, clinicContext, provider);

    // Dispatch via channel
    const channel = ChannelRegistry.getChannel(rule.channel);
    const sendResult = await channel.sendMessage(recipient, message, {
      clinicId: clinicContext.clinicId,
      ruleId: rule.id,
      leadId,
    });

    const execution: FollowupExecution = {
      id: executionId,
      clinicId: clinicContext.clinicId,
      leadId,
      ruleId: rule.id,
      channel: rule.channel,
      recipientPhoneOrEmail: recipient,
      messageBody: message,
      status: sendResult.success ? 'sent' : 'failed',
      scheduledAt,
      sentAt: sendResult.success ? sendResult.timestamp : undefined,
      reason: sendResult.error,
    };

    this.executions.unshift(execution);
    return { execution, sendResult };
  }

  /**
   * Batch processes pending follow-up rules for a set of clinic leads.
   */
  public async processBatch(
    rules: FollowupRule[],
    leads: Array<Partial<LeadData> & { id?: string; staffIntervened?: boolean; convertedAt?: string }>,
    clinicContext: ClinicContext,
    provider?: AIProvider
  ): Promise<FollowupExecution[]> {
    const results: FollowupExecution[] = [];

    for (const rule of rules) {
      if (!rule.active) continue;

      for (const lead of leads) {
        const { execution } = await this.executeRule(rule, lead, clinicContext, provider);
        results.push(execution);
      }
    }

    return results;
  }

  public getExecutionHistory(filter?: {
    clinicId?: string;
    leadId?: string;
    status?: FollowupExecution['status'];
  }): FollowupExecution[] {
    return this.executions.filter((e) => {
      if (filter?.clinicId && e.clinicId !== filter.clinicId) return false;
      if (filter?.leadId && e.leadId !== filter.leadId) return false;
      if (filter?.status && e.status !== filter.status) return false;
      return true;
    });
  }

  public clearHistory(): void {
    this.executions.length = 0;
  }
}

/**
 * Standard default follow-up rules for dental practices.
 */
export function getDefaultFollowupRules(clinicId: string): FollowupRule[] {
  return [
    {
      id: 'rule_nudge_2h',
      clinicId,
      name: '2-Hour Quick Nudge (Inquired but didn’t book)',
      triggerEvent: 'lead_created_no_booking',
      delayHours: 2,
      channel: 'whatsapp',
      template:
        'Hi {{patient_name}}, thank you for reaching out to {{clinic_name}} regarding {{concern}}! We have a few consultation slots open for tomorrow. Would morning or evening suit you better?',
      active: true,
    },
    {
      id: 'rule_nudge_24h',
      clinicId,
      name: '24-Hour Re-engagement Offer',
      triggerEvent: 'lead_created_no_booking',
      delayHours: 24,
      channel: 'whatsapp',
      template:
        'Namaste {{patient_name}}! Dr. Arjun at {{clinic_name}} has 2 reserved slots open tomorrow. Reply YES if you would like us to hold one for your {{service}} checkup!',
      active: true,
    },
    {
      id: 'rule_no_show_recovery',
      clinicId,
      name: 'Missed Appointment Rescheduling Nudge',
      triggerEvent: 'no_show_recovery',
      delayHours: 2,
      channel: 'whatsapp',
      template:
        'Hi {{patient_name}}, we missed seeing you today at {{clinic_name}}! We understand plans change unexpectedly. Would you like to reschedule your visit for later this week?',
      active: true,
    },
    {
      id: 'rule_6_month_recall',
      clinicId,
      name: '6-Month Preventive Dental Cleaning Recall',
      triggerEvent: 'recall_6_month_checkup',
      delayHours: 4320, // 180 days
      channel: 'whatsapp',
      template:
        'Namaste {{patient_name}}! It has been 6 months since your last dental visit at {{clinic_name}}. Regular preventive scaling keeps your teeth bright and cavity-free. Book your 6-month checkup today!',
      active: true,
    },
  ];
}
