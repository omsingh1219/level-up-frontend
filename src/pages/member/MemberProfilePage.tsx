import React, { useState } from 'react';
import { User, Phone, Mail, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, Badge } from '@/components/ui/Badge';
import { updateUserProfile } from '@/services/authService';

export const MemberProfilePage: React.FC = () => {
  const { profile, gym, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Communication Preferences
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [emailOptIn, setEmailOptIn] = useState(true);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    try {
      setSaving(true);
      setMsg(null);
      await updateUserProfile(profile.uid, {
        name,
        phone,
      });
      await refreshProfile();
      setMsg('Profile details updated successfully.');
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Member Profile & Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal details and communication preferences
        </p>
      </div>

      <Card className="space-y-4">
        {msg && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
            {msg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Registered Email (Cannot be changed directly)"
            value={profile?.email || ''}
            disabled
            className="opacity-60 cursor-not-allowed"
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 ..."
            icon={<Phone className="w-4 h-4" />}
          />

          {/* Immutable Fields Notice */}
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security Protected Fields</span>
            </div>
            <p>
              Your role (<strong>MEMBER</strong>) and Gym Membership status are securely managed by <strong>{gym?.name || 'Gym Admin'}</strong>.
            </p>
          </div>

          {/* Communication Preferences */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            <p className="text-xs font-semibold text-white">Communication Preferences:</p>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Receive Membership Expiry Reminders via WhatsApp</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={emailOptIn}
                onChange={(e) => setEmailOptIn(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Receive Important Updates & Receipts via Email</span>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <Button type="submit" isLoading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
