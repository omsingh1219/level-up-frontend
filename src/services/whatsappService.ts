import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { WhatsAppConfig } from '@/types';

export interface WhatsAppSendResult {
  success: boolean;
  unconfigured?: boolean;
  messageId?: string;
  error?: string;
}

export interface MembershipExpiringTemplateParams {
  memberName: string;
  gymName: string;
  daysRemaining: number;
  expiryDate: string;
}

/**
 * Checks if WhatsApp API is properly configured for the current environment
 */
export function getWhatsAppEnvStatus(): {
  isConfigured: boolean;
  phoneNumberId?: string;
  apiVersion?: string;
} {
  const token = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '';
  const phoneId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '';
  const apiVersion = import.meta.env.VITE_WHATSAPP_API_VERSION || 'v18.0';

  return {
    isConfigured: Boolean(token && phoneId),
    phoneNumberId: phoneId || undefined,
    apiVersion,
  };
}

/**
 * Dispatches a template WhatsApp message via official Meta Graph API.
 * If credentials are missing, gracefully reports unconfigured state without throwing fatal exceptions.
 */
export async function sendWhatsAppExpiryReminder(
  gymId: string,
  recipientPhone: string,
  params: MembershipExpiringTemplateParams
): Promise<WhatsAppSendResult> {
  const token = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '';
  const phoneId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '';
  const apiVersion = import.meta.env.VITE_WHATSAPP_API_VERSION || 'v18.0';

  if (!token || !phoneId) {
    console.warn('[WhatsAppService] WhatsApp integration is not configured. Outbound message skipped.');
    return {
      success: false,
      unconfigured: true,
      error: 'WhatsApp integration is not configured. Please supply API credentials in Settings or .env',
    };
  }

  // Format standard E.164 phone number: remove non-digits
  const cleanPhone = recipientPhone.replace(/[^\d+]/g, '').replace(/^\+/, '');

  // Official Meta Cloud API payload for Template Messages
  const payload = {
    messaging_product: 'whatsapp',
    to: cleanPhone,
    type: 'template',
    template: {
      name: 'membership_expiring',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.memberName },
            { type: 'text', text: params.gymName },
            { type: 'text', text: String(params.daysRemaining) },
            { type: 'text', text: params.expiryDate },
          ],
        },
      ],
    },
  };

  try {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || `HTTP ${response.status}: Failed to dispatch WhatsApp message`;
      await recordWhatsAppStatus(gymId, false, errorMsg);
      return { success: false, error: errorMsg };
    }

    const messageId = data?.messages?.[0]?.id || 'delivered';
    await recordWhatsAppStatus(gymId, true);
    return { success: true, messageId };
  } catch (error: any) {
    const msg = error?.message || 'Network exception during WhatsApp API request';
    await recordWhatsAppStatus(gymId, false, msg);
    return { success: false, error: msg };
  }
}

/**
 * Updates WhatsApp configuration status in gym automation settings
 */
async function recordWhatsAppStatus(gymId: string, success: boolean, errorMessage?: string): Promise<void> {
  try {
    const settingsRef = doc(db, 'gyms', gymId, 'automationSettings', 'config');
    const now = new Date().toISOString();
    if (success) {
      await updateDoc(settingsRef, {
        'whatsappConfig.lastSuccessfulMessageAt': now,
        'whatsappConfig.status': 'VERIFIED',
      });
    } else {
      await updateDoc(settingsRef, {
        'whatsappConfig.lastFailedMessageAt': now,
        'whatsappConfig.lastErrorMessage': errorMessage || 'Unknown error',
        'whatsappConfig.status': 'ERROR',
      });
    }
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Fetches current gym WhatsApp integration settings
 */
export async function getWhatsAppSettings(gymId: string): Promise<WhatsAppConfig> {
  try {
    const settingsRef = doc(db, 'gyms', gymId, 'automationSettings', 'config');
    const snap = await getDoc(settingsRef);
    if (snap.exists() && snap.data().whatsappConfig) {
      return snap.data().whatsappConfig as WhatsAppConfig;
    }
  } catch (e) {
    console.warn('[WhatsAppService] Error fetching WhatsApp settings:', e);
  }

  const env = getWhatsAppEnvStatus();
  return {
    phoneNumberId: env.phoneNumberId || '',
    businessAccountId: '',
    status: env.isConfigured ? 'CONFIGURED' : 'UNCONFIGURED',
  };
}

/**
 * Updates gym WhatsApp configuration in Firestore
 */
export async function updateWhatsAppSettings(
  gymId: string,
  config: Partial<WhatsAppConfig>
): Promise<void> {
  const settingsRef = doc(db, 'gyms', gymId, 'automationSettings', 'config');
  await updateDoc(settingsRef, {
    whatsappConfig: config,
    updatedAt: new Date().toISOString(),
  });
}
