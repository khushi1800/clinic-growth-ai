import type { ClinicContext, AppointmentRequest } from '../ai/types';
import { ChannelRegistry, SendResult } from './channels';

export type ReminderTiming = '24h_before' | '2h_before' | 'same_day_morning' | 'post_visit_review';

export interface ScheduledAppointmentReminder {
  id: string;
  appointmentId: string;
  clinicId: string;
  patientName: string;
  patientPhone: string;
  doctorName?: string;
  service?: string;
  appointmentDateTime: string; // ISO string
  timing: ReminderTiming;
  channel: 'whatsapp' | 'sms';
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentAt?: string;
  messageText?: string;
  sendResult?: SendResult;
}

/**
 * Service to manage and dispatch automated dental appointment reminders.
 */
export class AppointmentReminderService {
  private reminders: Map<string, ScheduledAppointmentReminder> = new Map();

  /**
   * Generates tailored reminder message text.
   */
  public generateReminderText(
    appointment: AppointmentRequest,
    timing: ReminderTiming,
    clinicContext: ClinicContext
  ): string {
    const clinicName = clinicContext.name;
    const phone = clinicContext.phone || clinicContext.whatsappPhone || '';
    const address = clinicContext.address || '';

    switch (timing) {
      case '24h_before':
        return (
          `🦷 *Appointment Reminder - ${clinicName}*\n\n` +
          `Namaste ${appointment.patientName},\n` +
          `This is a friendly reminder for your dental appointment tomorrow:\n\n` +
          `📅 *Date:* ${appointment.preferredDate}\n` +
          `⏰ *Time:* ${appointment.preferredTimeSlot}\n` +
          `👨‍⚕️ *Doctor:* ${appointment.doctorName || 'Senior Dental Consultant'}\n` +
          `📍 *Clinic:* ${clinicName}, ${address}\n\n` +
          `To confirm your arrival, please reply with *1*.\n` +
          `If you need to reschedule, reply with *2* or call us at ${phone}.\n` +
          `We look forward to seeing you!`
        );

      case '2h_before':
        return (
          `⏰ *See You Soon! - ${clinicName}*\n\n` +
          `Hi ${appointment.patientName},\n` +
          `Your appointment is coming up in about 2 hours at *${appointment.preferredTimeSlot}*.\n\n` +
          `📍 *Address:* ${address}\n` +
          `🗺️ *Maps Link:* ${clinicContext.mapsUrl || 'Opposite main metro pillar'}\n` +
          `🅿️ *Parking:* Dedicated clinic parking available.\n\n` +
          `Please feel free to call ${phone} if you need directions.`
        );

      case 'same_day_morning':
        return (
          `☀️ *Good Morning from ${clinicName}!*\n\n` +
          `Hi ${appointment.patientName}, your dental visit is scheduled for today at *${appointment.preferredTimeSlot}*.\n` +
          `Please arrive 10 minutes early. Have a wonderful day!`
        );

      case 'post_visit_review':
        return (
          `🌟 *How was your visit at ${clinicName}?*\n\n` +
          `Dear ${appointment.patientName},\n` +
          `Thank you for trusting us with your smile today! We hope your treatment went smoothly and comfortably.\n\n` +
          `Would you take 30 seconds to rate your experience? Your feedback helps us care for you better:\n` +
          `⭐ Review link: https://g.page/r/${clinicContext.clinicId}/review\n\n` +
          `If you have any post-procedure discomfort, our care team is just a message away!`
        );

      default:
        return `Reminder: Your appointment is scheduled on ${appointment.preferredDate} at ${appointment.preferredTimeSlot}.`;
    }
  }

  /**
   * Schedules reminders for an appointment (e.g. 24h before and 2h before).
   */
  public scheduleRemindersForAppointment(
    appointment: AppointmentRequest & { appointmentId: string; appointmentDateTime: string },
    clinicContext: ClinicContext
  ): ScheduledAppointmentReminder[] {
    const created: ScheduledAppointmentReminder[] = [];

    const timings: ReminderTiming[] = ['24h_before', '2h_before'];

    for (const timing of timings) {
      const id = `rem_${appointment.appointmentId}_${timing}`;
      const messageText = this.generateReminderText(appointment, timing, clinicContext);

      const reminder: ScheduledAppointmentReminder = {
        id,
        appointmentId: appointment.appointmentId,
        clinicId: clinicContext.clinicId,
        patientName: appointment.patientName,
        patientPhone: appointment.phone,
        doctorName: appointment.doctorName,
        service: appointment.service,
        appointmentDateTime: appointment.appointmentDateTime,
        timing,
        channel: 'whatsapp',
        status: 'pending',
        messageText,
      };

      this.reminders.set(id, reminder);
      created.push(reminder);
    }

    return created;
  }

  /**
   * Dispatches a specific scheduled reminder via WhatsApp (or SMS fallback).
   */
  public async dispatchReminder(reminderId: string): Promise<SendResult> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      throw new Error(`Reminder ${reminderId} not found`);
    }

    if (reminder.status === 'cancelled') {
      return {
        success: false,
        messageId: '',
        channel: reminder.channel,
        to: reminder.patientPhone,
        timestamp: new Date().toISOString(),
        error: 'Reminder was cancelled',
        mock: true,
        deliveryStatus: 'failed',
      };
    }

    const channelInstance = ChannelRegistry.getChannel(reminder.channel);
    const result = await channelInstance.sendMessage(
      reminder.patientPhone,
      reminder.messageText || '',
      {
        appointmentId: reminder.appointmentId,
        timing: reminder.timing,
      }
    );

    if (result.success) {
      reminder.status = 'sent';
      reminder.sentAt = result.timestamp;
      reminder.sendResult = result;
    } else {
      reminder.status = 'failed';
    }

    this.reminders.set(reminderId, reminder);
    return result;
  }

  /**
   * Handles incoming interactive reply from patient (e.g., "1" to confirm, "2" to reschedule).
   */
  public handlePatientReply(
    patientPhone: string,
    replyText: string
  ): {
    action: 'confirmed' | 'reschedule_requested' | 'cancelled' | 'unknown';
    responseMessage: string;
  } {
    const normalized = replyText.trim().toLowerCase();

    if (normalized === '1' || normalized.includes('confirm') || normalized.includes('yes') || normalized.includes('aa raha hu')) {
      return {
        action: 'confirmed',
        responseMessage:
          'Thank you! Your appointment is confirmed. We look forward to seeing you. Please arrive 10 minutes early.',
      };
    }

    if (normalized === '2' || normalized.includes('reschedule') || normalized.includes('change time') || normalized.includes('time change')) {
      return {
        action: 'reschedule_requested',
        responseMessage:
          'No problem at all! What day and time would work better for you? Or you may call our reception directly.',
      };
    }

    if (normalized.includes('cancel') || normalized.includes('nahi aa paunga')) {
      return {
        action: 'cancelled',
        responseMessage:
          'Your appointment has been cancelled as requested. Whenever you are ready to book again, just drop us a message!',
      };
    }

    return {
      action: 'unknown',
      responseMessage:
        'Thank you for your message. Our reception team will review and get in touch with you shortly.',
    };
  }

  public getRemindersForAppointment(appointmentId: string): ScheduledAppointmentReminder[] {
    return Array.from(this.reminders.values()).filter((r) => r.appointmentId === appointmentId);
  }

  public cancelRemindersForAppointment(appointmentId: string): void {
    for (const reminder of this.reminders.values()) {
      if (reminder.appointmentId === appointmentId && reminder.status === 'pending') {
        reminder.status = 'cancelled';
      }
    }
  }
}
