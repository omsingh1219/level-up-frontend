import React, { useState, useEffect } from 'react';
import { Settings, Building2, Clock, Globe, Bell, Shield, Play, CheckCircle2, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, Badge } from '@/components/ui/Badge';
import { updateGym } from '@/services/gymService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { runExpiryAutomationForGym, type ExpiryAutomationRunResult } from '@/services/expiryAutomationService';
import type { AutomationSettings } from '@/types';

export const SettingsPage: React.FC = () => {
  const { gym, profile, refreshGym } = useAuth();
  const [activeTab, setActiveTab] = useState<'GYM' | 'AUTOMATION' | 'INTEGRATIONS'>('GYM');

  // Gym Profile Form State
  const [gymName, setGymName] = useState(gym?.name || '');
  const [phone, setPhone] = useState(gym?.phone || '');
  const [email, setEmail] = useState(gym?.email || '');
  const [address, setAddress] = useState(gym?.address || '');
  const [city, setCity] = useState(gym?.city || '');
  const [timezone, setTimezone] = useState(gym?.timezone || 'Asia/Kolkata');
  const [openingHours, setOpeningHours] = useState(gym?.openingHours || '06:00 - 22:00');
  const [savingGym, setSavingGym] = useState(false);
  const [gymSaveMsg, setGymSaveMsg] = useState<string | null>(null);

  // Automation Settings State
  const [reminderDays, setReminderDays] = useState<number[]>([7, 3, 1, 0]);
  const [notifyExpired, setNotifyExpired] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [savingAutomation, setSavingAutomation] = useState(false);
  const [automationMsg, setAutomationMsg] = useState<string | null>(null);

  // Test run
  const [runningSweep, setRunningSweep] = useState(false);
  const [sweepResult, setSweepResult] = useState<ExpiryAutomationRunResult | null>(null);

  const gymId = gym?.gymId || profile?.gymId || '';

  useEffect(() => {
    if (!gymId) return;
    const loadAutomation = async () => {
      try {
        const snap = await getDoc(doc(db, 'gyms', gymId, 'automationSettings', 'config'));
        if (snap.exists()) {
          const data = snap.data() as AutomationSettings;
          if (data.reminderDaysBefore) setReminderDays(data.reminderDaysBefore);
          if (data.notifyOnExpired !== undefined) setNotifyExpired(data.notifyOnExpired);
          if (data.sendWhatsAppReminders !== undefined) setSendWhatsApp(data.sendWhatsAppReminders);
          if (data.sendEmailReminders !== undefined) setSendEmail(data.sendEmailReminders);
          if (data.sendInAppReminders !== undefined) setSendInApp(data.sendInAppReminders);
        }
      } catch (e) {
        console.warn('Failed to load automation settings:', e);
      }
    };
    loadAutomation();
  }, [gymId]);

  const handleSaveGymProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    try {
      setSavingGym(true);
      setGymSaveMsg(null);
      await updateGym(gymId, {
        name: gymName,
        phone,
        email,
        address,
        city,
        timezone,
        openingHours,
      }, profile?.uid || 'admin');

      await refreshGym();
      setGymSaveMsg('Gym organization settings saved successfully.');
    } catch (e: any) {
      setGymSaveMsg(`Error: ${e.message}`);
    } finally {
      setSavingGym(false);
    }
  };

  const handleSaveAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    try {
      setSavingAutomation(true);
      setAutomationMsg(null);
      await updateDoc(doc(db, 'gyms', gymId, 'automationSettings', 'config'), {
        reminderDaysBefore: reminderDays,
        notifyOnExpired: notifyExpired,
        sendWhatsAppReminders: sendWhatsApp,
        sendEmailReminders: sendEmail,
        sendInAppReminders: sendInApp,
        updatedAt: new Date().toISOString(),
      });
      setAutomationMsg('Expiry reminder automation rules updated.');
    } catch (e: any) {
      setAutomationMsg(`Error: ${e.message}`);
    } finally {
      setSavingAutomation(false);
    }
  };

  const handleRunManualSweep = async () => {
    if (!gymId) return;
    try {
      setRunningSweep(true);
      const res = await runExpiryAutomationForGym(gymId);
      setSweepResult(res);
    } catch (e) {
      console.error('Sweep error:', e);
    } finally {
      setRunningSweep(false);
    }
  };

  const toggleDayThreshold = (day: number) => {
    if (reminderDays.includes(day)) {
      setReminderDays(reminderDays.filter(d => d !== day));
    } else {
      setReminderDays([...reminderDays, day].sort((a, b) => b - a));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Gym & Automation Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure facility information, scheduled reminder intervals, and channels
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="border-b border-zinc-800 flex gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('GYM')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'GYM'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Gym Organization Profile
        </button>
        <button
          onClick={() => setActiveTab('AUTOMATION')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'AUTOMATION'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Expiry Automation Engine
        </button>
        <Link
          to="/admin/settings/whatsapp"
          className="pb-3 text-zinc-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Business API Settings
        </Link>
      </div>

      {/* Tab 1: Gym Organization Profile */}
      {activeTab === 'GYM' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm font-semibold text-white">Facility Details</h2>
              <p className="text-xs text-zinc-400">Public profile and location information for this gym.</p>
            </div>
            <Badge variant="emerald">Tenant ID: {gymId}</Badge>
          </div>

          {gymSaveMsg && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
              {gymSaveMsg}
            </div>
          )}

          <form onSubmit={handleSaveGymProfile} className="space-y-4 pt-2">
            <Input
              label="Gym Name *"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Contact Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Input
              label="Street Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 p-2.5 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                </select>
              </div>
              <Input
                label="Operating Hours"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <Button type="submit" isLoading={savingGym}>
                Save Facility Details
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 2: Expiry Automation Engine */}
      {activeTab === 'AUTOMATION' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-sm font-semibold text-white">Daily Expiry Reminder Rules</h2>
                <p className="text-xs text-zinc-400">
                  Cloud Functions evaluate active memberships daily against these thresholds.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRunManualSweep}
                isLoading={runningSweep}
                icon={<Play className="w-3.5 h-3.5 text-amber-400" />}
              >
                Run Sweep Now
              </Button>
            </div>

            {sweepResult && (
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 flex items-center justify-between">
                <span>
                  Sweep executed: Scanned <strong>{sweepResult.scannedCount}</strong>, sent <strong>{sweepResult.remindersSent}</strong>, skipped <strong>{sweepResult.duplicateSkipped}</strong> duplicates.
                </span>
                <button onClick={() => setSweepResult(null)} className="font-bold ml-2">×</button>
              </div>
            )}

            {automationMsg && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
                {automationMsg}
              </div>
            )}

            <form onSubmit={handleSaveAutomation} className="space-y-6 pt-2">
              <div>
                <label className="block text-xs font-semibold text-white mb-2">
                  Reminder Schedules (Days Before Expiry):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[14, 7, 5, 3, 2, 1, 0].map((d) => {
                    const isSelected = reminderDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDayThreshold(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {d === 0 ? 'Day of Expiry (0d)' : `${d} Days Before`}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-zinc-500 mt-2">
                  Idempotency keys prevent members from receiving repeated reminders on job retries.
                </p>
              </div>

              {/* Channel Toggles */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <p className="text-xs font-semibold text-white">Outbound Dispatch Channels:</p>

                <label className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={sendInApp}
                    onChange={(e) => setSendInApp(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Send In-App Notifications (Member Bell Icon & Notification Center)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Send WhatsApp Messages (Requires Meta Cloud API configuration)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Send Transactional Emails (Requires Resend / SMTP configuration)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={notifyExpired}
                    onChange={(e) => setNotifyExpired(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Send Expiration Notice 1 day after membership has lapsed</span>
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-800">
                <Button type="submit" isLoading={savingAutomation}>
                  Save Automation Rules
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
