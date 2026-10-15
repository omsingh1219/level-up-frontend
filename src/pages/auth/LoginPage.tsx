import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { seedDemoData } from '@/utils/seedData';

export const LoginPage: React.FC = () => {
  const { signIn, setDevUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await signIn(email, password);

      if (profile.role === 'MEMBER') {
        navigate('/member');
      } else if (profile.role === 'ADMIN' && !profile.gymId) {
        navigate('/onboarding');
      } else {
        navigate(from === '/login' ? '/admin' : from);
      }
    } catch (err: any) {
      console.warn('Login error:', err);
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo user quick login
  const handleQuickLogin = (role: 'ADMIN' | 'STAFF' | 'MEMBER') => {
    if (role === 'ADMIN') {
      setEmail('admin@ironforge.fit');
      setPassword('password123');
      setDevUser({
        uid: 'admin-ironforge-01',
        name: 'Vikram Rathore',
        email: 'admin@ironforge.fit',
        phone: '+91 98765 43210',
        role: 'ADMIN',
        gymId: 'ironforge-demo-gym',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, {
        gymId: 'ironforge-demo-gym',
        name: 'IronForge Fitness Center',
        ownerUid: 'admin-ironforge-01',
        phone: '+91 98765 43210',
        email: 'admin@ironforge.fit',
        address: 'Plot 42, 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        timezone: 'Asia/Kolkata',
        openingHours: '05:30 - 22:30',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      navigate('/admin');
    } else if (role === 'STAFF') {
      setEmail('pooja.hegde@ironforge.fit');
      setPassword('password123');
      setDevUser({
        uid: 'staff-ironforge-01',
        name: 'Pooja Hegde',
        email: 'pooja.hegde@ironforge.fit',
        phone: '+91 98222 11001',
        role: 'STAFF',
        gymId: 'ironforge-demo-gym',
        permissions: ['members.read', 'members.write', 'renewals.read', 'renewals.write', 'complaints.read', 'complaints.write', 'products.read'],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      navigate('/admin');
    } else {
      setEmail('rahul.sharma@example.com');
      setPassword('password123');
      setDevUser({
        uid: 'member-demo-rahul',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 99881 12341',
        role: 'MEMBER',
        gymId: 'ironforge-demo-gym',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      navigate('/member');
    }
  };

  const handleRunSeed = async () => {
    try {
      setSeeding(true);
      setError(null);
      const res = await seedDemoData();
      setSeedSuccess(`Database populated with Demo Gym "${res.gymId}" and 20 members!`);
      handleQuickLogin('ADMIN');
    } catch (err: any) {
      setError(`Seed error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            GymOS
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="mt-2 text-xs text-zinc-400">
          Manage your fitness center, members, and operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
              {error}
            </div>
          )}

          {seedSuccess && (
            <div className="mb-6 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400">
              {seedSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourgym.com"
              icon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                Instant Development & QA Logins
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="px-2 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 text-[11px] font-medium text-zinc-200 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Gym Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('STAFF')}
                className="px-2 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 text-[11px] font-medium text-zinc-200 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Gym Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('MEMBER')}
                className="px-2 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 text-[11px] font-medium text-zinc-200 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Member
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={handleRunSeed}
                disabled={seeding}
                className="w-full py-1.5 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {seeding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Populate Demo Gym & 20 Members into Database</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Create a gym account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
