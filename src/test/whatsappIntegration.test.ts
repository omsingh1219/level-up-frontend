import { describe, it, expect, vi } from 'vitest';
import { sendWhatsAppExpiryReminder, getWhatsAppEnvStatus } from '../services/whatsappService';

describe('WhatsApp Integration Service Layer', () => {
  it('correctly reports unconfigured state when environment credentials are absent', async () => {
    // When no tokens provided in test environment
    const result = await sendWhatsAppExpiryReminder('demo-gym', '+91 99881 12341', {
      memberName: 'Test Member',
      gymName: 'Demo Gym',
      daysRemaining: 7,
      expiryDate: '2026-10-31',
    });

    expect(result.success).toBe(false);
    expect(result.unconfigured).toBe(true);
    expect(result.error).toContain('WhatsApp integration is not configured');
  });

  it('correctly reports environment configuration status', () => {
    const envStatus = getWhatsAppEnvStatus();
    expect(envStatus).toHaveProperty('isConfigured');
    expect(envStatus).toHaveProperty('apiVersion');
    expect(envStatus.apiVersion).toBe('v18.0');
  });
});
