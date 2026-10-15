import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sendResetPassword } from '@/services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      await sendResetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">GymOS</span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-2 text-xs text-zinc-400">
          Enter your registered email and we'll send you recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Check Your Email</h3>
              <p className="text-xs text-zinc-400 mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <Link to="/login">
                <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400">
                  {error}
                </div>
              )}
              <Input
                label="Registered Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                icon={<Mail className="w-4 h-4" />}
              />
              <Button type="submit" className="w-full" isLoading={loading} icon={<ArrowRight className="w-4 h-4" />}>
                Send Reset Link
              </Button>
              <div className="text-center mt-4">
                <Link to="/login" className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
