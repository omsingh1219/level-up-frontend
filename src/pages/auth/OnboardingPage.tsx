import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Building2, MapPin, Clock, Globe, Phone, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createGym } from '@/services/gymService';

export const OnboardingPage: React.FC = () => {
  const { profile, setDevUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(profile?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(profile?.email || 'admin@mygym.com');
  const [address, setAddress] = useState('Plot 12, Main Commercial Avenue');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [country, setCountry] = useState('India');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [openingHours, setOpeningHours] = useState('06:00 - 22:00');
  const [seedPlans, setSeedPlans] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !address || !city) {
      setError('Please provide all gym location and contact details.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const ownerUid = profile?.uid || 'admin-local';

      const createdGym = await createGym({
        name,
        phone,
        email,
        address,
        city,
        state,
        country,
        timezone,
        openingHours,
      }, ownerUid, seedPlans);

      const updatedProfile = {
        uid: ownerUid,
        name: profile?.name || 'Gym Admin',
        email: profile?.email || email,
        phone: profile?.phone || phone,
        role: 'ADMIN' as const,
        gymId: createdGym.gymId,
        active: true,
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDevUser(updatedProfile, createdGym);
      navigate('/admin');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err?.message || 'Failed to complete gym setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Step Indicator Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 mx-auto mb-4">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to GymOS!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            Let's configure your fitness facility to launch your management dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Gym Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. IronForge Fitness Club"
              icon={<Building2 className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Contact Phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
              />
              <Input
                label="Official Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Street Address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="State"
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <Input
                label="Country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" /> Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/90 text-sm text-zinc-100 p-2 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (Universal)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                </select>
              </div>

              <Input
                label="Operating Hours"
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="06:00 - 22:00"
                icon={<Clock className="w-4 h-4" />}
              />
            </div>

            {/* Initial Plans Option */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 mt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seedPlans}
                  onChange={(e) => setSeedPlans(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Seed Standard Membership Plans
                  </span>
                  <span className="text-[11px] text-zinc-400 leading-normal">
                    Automatically initializes 1 Month (₹1,500), 3 Months (₹4,000), 6 Months (₹7,500), and Annual (₹13,000) plans. You can adjust prices anytime.
                  </span>
                </div>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              size="lg"
              isLoading={loading}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Complete Setup & Open Dashboard
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
