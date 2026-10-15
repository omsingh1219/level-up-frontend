import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, Card } from '@/components/ui/Badge';
import {
  getWhatsAppSettings,
  updateWhatsAppSettings,
  getWhatsAppEnvStatus,
  sendWhatsAppExpiryReminder
} from '@/services/whatsappService';
import { formatReadableDateTime } from '@/utils/dateUtils';
import type { WhatsAppConfig } from '@/types';

export const WhatsAppSettingsPage: React.FC = () => {
  const { gym, profile } = useAuth();
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState('+91 99881 12341');
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  // Form State
  const [phoneId, setPhoneId] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');

  const gymId = gym?.gymId || profile?.gymId || '';
  const env = getWhatsAppEnvStatus();

  const loadSettings = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const data = await getWhatsAppSettings(gymId);
      setConfig(data);
      setPhoneId(data.phoneNumberId || env.phoneNumberId || '');
      setBusinessAccountId(data.businessAccountId || '');
    } catch (err) {
      console.error('Error loading WhatsApp settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [gymId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    try {
      setSaving(true);
      await updateWhatsAppSettings(gymId, {
        phoneNumberId: phoneId,
        businessAccountId,
        status: env.isConfigured || phoneId ? 'CONFIGURED' : 'UNCONFIGURED',
      });
      await loadSettings();
    } catch (e: any) {
      console.error('Failed to save WhatsApp config:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!gymId || !testPhone) return;
    try {
      setSendingTest(true);
      setTestResult(null);

      const res = await sendWhatsAppExpiryReminder(gymId, testPhone, {
        memberName: 'Fitness Athlete',
        gymName: gym?.name || 'IronForge Fitness',
        daysRemaining: 7,
        expiryDate: '2026-10-15',
      });

      if (res.unconfigured) {
        setTestResult({
          success: false,
          msg: 'WhatsApp integration is not configured. Please supply WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in your environment or server configuration.',
        });
      } else if (res.success) {
        setTestResult({
          success: true,
          msg: `Test message dispatched successfully! Provider message ID: ${res.messageId}`,
        });
      } else {
        setTestResult({
          success: false,
          msg: `WhatsApp API Error: ${res.error}`,
        });
      }
      await loadSettings();
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: `Execution error: ${err.message}`,
      });
    } finally {
      setSendingTest(false);
    }
  };

  const isConnected = env.isConfigured || config?.status === 'VERIFIED';

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          WhatsApp Business API Integration
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Automate outbound WhatsApp membership renewal reminders and alerts directly through Meta Graph API
        </p>
      </div>

      {/* Integration Status Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isConnected
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-zinc-900 border-zinc-800 text-zinc-300'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-amber-400'}`}>
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Integration Status:</h2>
              <Badge variant={isConnected ? 'emerald' : 'amber'}>
                {isConnected ? 'CONNECTED' : 'NOT CONFIGURED'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {isConnected
                ? 'Meta Cloud API credentials detected. Automatic WhatsApp reminders are enabled.'
                : 'WhatsApp integration is not configured. In-app notifications will continue working.'}
            </p>
          </div>
        </div>

        <div className="text-right text-xs shrink-0">
          <span className="text-zinc-500 block text-[10px]">API Version</span>
          <span className="font-mono text-zinc-300 font-semibold">{env.apiVersion}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration Form */}
        <Card className="space-y-4">
          <h3 className="text-sm font-semibold text-white">API Credentials Setup</h3>
          <p className="text-xs text-zinc-400">
            Configure your Meta Developer App phone number and account credentials.
          </p>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <Input
              label="WhatsApp Phone Number ID"
              placeholder="e.g. 109876543210987"
              value={phoneId}
              onChange={(e) => setPhoneId(e.target.value)}
              helperText="Obtain from Meta for Developers -> WhatsApp -> API Setup"
            />

            <Input
              label="WhatsApp Business Account ID (WABA ID)"
              placeholder="e.g. 102938475610293"
              value={businessAccountId}
              onChange={(e) => setBusinessAccountId(e.target.value)}
            />

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Server token configured via <code>.env</code>
              </span>
              <Button type="submit" size="sm" isLoading={saving}>
                Save Settings
              </Button>
            </div>
          </form>

          {/* Message History Metrics */}
          <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Last Successful Dispatch:</span>
              <span className="text-zinc-200">
                {config?.lastSuccessfulMessageAt ? formatReadableDateTime(config.lastSuccessfulMessageAt) : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Last Failed Attempt:</span>
              <span className="text-zinc-200">
                {config?.lastFailedMessageAt ? formatReadableDateTime(config.lastFailedMessageAt) : 'None'}
              </span>
            </div>
            {config?.lastErrorMessage && (
              <p className="text-[11px] text-red-400 p-2 rounded bg-red-500/10 border border-red-500/20 mt-2">
                Last Error: {config.lastErrorMessage}
              </p>
            )}
          </div>
        </Card>

        {/* Right: Message Template Preview & Outbound Test */}
        <div className="space-y-6">
          {/* Template Preview */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Active Template Preview</h3>
              <Badge variant="emerald">Approved Template</Badge>
            </div>
            <p className="text-xs text-zinc-400 font-mono">membership_expiring (en)</p>

            {/* WhatsApp Chat Bubble Mockup */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <div className="max-w-xs bg-emerald-950/60 border border-emerald-500/30 rounded-2xl rounded-tl-none p-3.5 text-xs text-zinc-200 shadow-sm leading-relaxed space-y-2">
                <p>Hi <strong>Rahul Sharma</strong> 👋</p>
                <p>Your <strong>{gym?.name || 'IronForge Fitness'}</strong> membership will expire in <strong>7</strong> days.</p>
                <p className="text-[11px] text-zinc-300">Expiry date: <strong>2026-10-15</strong></p>
                <p className="text-[11px] text-zinc-400">Please contact the gym reception to renew your membership. Thank you.</p>
                <span className="text-[9px] text-zinc-500 block text-right">09:41 AM ✓✓</span>
              </div>
            </div>
          </Card>

          {/* Outbound Test Trigger */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Send Test Reminder</h3>
            <p className="text-xs text-zinc-400">
              Verify your WhatsApp connection by dispatching a test template message.
            </p>

            <div className="flex gap-2">
              <Input
                placeholder="+91 ..."
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
              <Button
                size="sm"
                onClick={handleSendTestMessage}
                isLoading={sendingTest}
                icon={<Send className="w-4 h-4" />}
                className="shrink-0"
              >
                Send Test
              </Button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                testResult.success
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}>
                {testResult.msg}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
