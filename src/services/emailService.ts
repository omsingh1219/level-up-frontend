import type { EmailConfig } from '@/types';

export interface EmailSendResult {
  success: boolean;
  unconfigured?: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Transactional email service abstraction
 */
export async function sendEmailReminder(
  recipientEmail: string,
  subject: string,
  bodyHtml: string
): Promise<EmailSendResult> {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER || 'NONE';
  const apiKey = import.meta.env.VITE_EMAIL_PROVIDER_API_KEY || '';

  if (provider === 'NONE' || !apiKey) {
    return {
      success: false,
      unconfigured: true,
      error: 'Email provider is not configured. Set VITE_EMAIL_PROVIDER and VITE_EMAIL_PROVIDER_API_KEY to enable.',
    };
  }

  try {
    // Modular provider dispatch (e.g. Resend, SendGrid)
    if (provider.toUpperCase() === 'RESEND') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: import.meta.env.VITE_EMAIL_FROM || 'GymOS <notifications@gymos.app>',
          to: [recipientEmail],
          subject,
          html: bodyHtml,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data?.message || 'Failed to dispatch via Resend' };
      }
      return { success: true, messageId: data?.id };
    }

    return {
      success: false,
      error: `Unsupported provider: ${provider}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error sending email',
    };
  }
}
