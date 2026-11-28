/**
 * Channel Abstraction & Mock Channels for Clinic Growth AI
 */

export interface SendResult {
  success: boolean;
  messageId: string;
  channel: 'whatsapp' | 'email' | 'sms';
  to: string;
  timestamp: string;
  error?: string;
  mock: boolean;
  deliveryStatus: 'sent' | 'delivered' | 'read' | 'queued' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface MessageChannel {
  sendMessage(to: string, message: string, metadata?: Record<string, unknown>): Promise<SendResult>;
  getStatus(): 'connected' | 'mock';
  getChannelType(): 'whatsapp' | 'email' | 'sms';
}

// In-memory message dispatch log for audits, testing, and UI preview
const channelAuditLogs: SendResult[] = [];

export function getChannelAuditLogs(filter?: {
  channel?: 'whatsapp' | 'email' | 'sms';
  recipient?: string;
}): SendResult[] {
  return channelAuditLogs.filter((log) => {
    if (filter?.channel && log.channel !== filter.channel) return false;
    if (filter?.recipient && !log.to.includes(filter.recipient)) return false;
    return true;
  });
}

export function clearChannelAuditLogs(): void {
  channelAuditLogs.length = 0;
}

/**
 * Mock WhatsApp Channel
 * Simulates WhatsApp Business API / Cloud API messaging for Indian mobile numbers
 */
export class MockWhatsAppChannel implements MessageChannel {
  private channelType = 'whatsapp' as const;

  public getChannelType(): 'whatsapp' {
    return this.channelType;
  }

  public getStatus(): 'connected' | 'mock' {
    return 'mock';
  }

  public async sendMessage(
    to: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<SendResult> {
    const cleanTo = to.trim();
    const messageId = `wa_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date().toISOString();

    // Indian mobile phone number sanity check (10 digits, optional +91 prefix)
    const isValidPhone = /(?:\+91[-\s]?)?[6-9]\d{9}/.test(cleanTo);

    if (!isValidPhone && !cleanTo.includes('@')) {
      const failedResult: SendResult = {
        success: false,
        messageId,
        channel: 'whatsapp',
        to: cleanTo,
        timestamp,
        error: `Invalid Indian phone number format: "${cleanTo}". Expected 10 digits starting with 6-9.`,
        mock: true,
        deliveryStatus: 'failed',
        metadata,
      };
      console.warn(`[MOCK WhatsApp CHANNEL - ERROR]`, failedResult);
      channelAuditLogs.unshift(failedResult);
      return failedResult;
    }

    const result: SendResult = {
      success: true,
      messageId,
      channel: 'whatsapp',
      to: cleanTo,
      timestamp,
      mock: true,
      deliveryStatus: 'delivered',
      metadata: {
        ...metadata,
        provider: 'MockWhatsAppCloudAPI',
        simulatedReadAt: new Date(Date.now() + 5000).toISOString(),
      },
    };

    console.log(
      `%c[MOCK WhatsApp CHANNEL] 💬 To: ${cleanTo} | ID: ${messageId}\nMessage:\n${message}`,
      'color: #25D366; font-weight: bold;'
    );

    channelAuditLogs.unshift(result);
    return result;
  }
}

/**
 * Mock Email Channel
 * Simulates transactional email dispatch (e.g. via SendGrid / Resend)
 */
export class MockEmailChannel implements MessageChannel {
  private channelType = 'email' as const;

  public getChannelType(): 'email' {
    return this.channelType;
  }

  public getStatus(): 'connected' | 'mock' {
    return 'mock';
  }

  public async sendMessage(
    to: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<SendResult> {
    const cleanTo = to.trim();
    const messageId = `email_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date().toISOString();

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanTo);

    if (!isValidEmail) {
      const failedResult: SendResult = {
        success: false,
        messageId,
        channel: 'email',
        to: cleanTo,
        timestamp,
        error: `Invalid email address format: "${cleanTo}".`,
        mock: true,
        deliveryStatus: 'failed',
        metadata,
      };
      console.warn(`[MOCK EMAIL CHANNEL - ERROR]`, failedResult);
      channelAuditLogs.unshift(failedResult);
      return failedResult;
    }

    const result: SendResult = {
      success: true,
      messageId,
      channel: 'email',
      to: cleanTo,
      timestamp,
      mock: true,
      deliveryStatus: 'sent',
      metadata: {
        ...metadata,
        provider: 'MockEmailRelay',
        subject: metadata?.subject || 'Update from Dental Clinic',
      },
    };

    console.log(
      `%c[MOCK EMAIL CHANNEL] ✉️ To: ${cleanTo} | Subject: ${result.metadata?.subject}\nBody:\n${message}`,
      'color: #3b82f6; font-weight: bold;'
    );

    channelAuditLogs.unshift(result);
    return result;
  }
}

/**
 * Mock SMS Channel
 * Simulates Indian TRAI/DLT compliant SMS gateway (e.g. Gupshup, Textlocal, Msg91)
 */
export class MockSMSChannel implements MessageChannel {
  private channelType = 'sms' as const;

  public getChannelType(): 'sms' {
    return this.channelType;
  }

  public getStatus(): 'connected' | 'mock' {
    return 'mock';
  }

  public async sendMessage(
    to: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<SendResult> {
    const cleanTo = to.trim();
    const messageId = `sms_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const timestamp = new Date().toISOString();

    const charCount = message.length;
    const parts = Math.ceil(charCount / 160) || 1;

    const result: SendResult = {
      success: true,
      messageId,
      channel: 'sms',
      to: cleanTo,
      timestamp,
      mock: true,
      deliveryStatus: 'sent',
      metadata: {
        ...metadata,
        provider: 'MockTRAISMSGateway',
        charCount,
        smsParts: parts,
        dltTemplateId: metadata?.dltTemplateId || 'DLT_11071612345678',
      },
    };

    console.log(
      `%c[MOCK SMS CHANNEL] 📱 To: ${cleanTo} | Length: ${charCount} chars (${parts} segment) | DLT: ${result.metadata?.dltTemplateId}\nText: ${message}`,
      'color: #f59e0b; font-weight: bold;'
    );

    channelAuditLogs.unshift(result);
    return result;
  }
}

/**
 * Channel Registry & Factory
 */
export class ChannelRegistry {
  private static whatsapp = new MockWhatsAppChannel();
  private static email = new MockEmailChannel();
  private static sms = new MockSMSChannel();

  public static getChannel(type: 'whatsapp' | 'email' | 'sms'): MessageChannel {
    switch (type) {
      case 'whatsapp':
        return this.whatsapp;
      case 'email':
        return this.email;
      case 'sms':
        return this.sms;
      default:
        return this.whatsapp;
    }
  }
}
