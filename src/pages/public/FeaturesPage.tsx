import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Users, RefreshCw, Bell, AlertCircle, ShoppingBag, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-white">GymOS</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
          <Link to="/signup"><Button variant="primary" size="sm">Get Started</Button></Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Full System Capabilities</h1>
          <p className="mt-4 text-base text-zinc-400 max-w-2xl mx-auto">
            Deep dive into the operational modules powering modern fitness centers.
          </p>
        </div>

        <div className="space-y-12">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col md:flex-row gap-6 items-start">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Member Lifecycle & Contact Hub</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Track full profile records, communication preferences, emergency contacts, registration history, and active membership status. Instant real-time search across names, phone numbers, and emails with granular status filters.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col md:flex-row gap-6 items-start">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Deterministic Expiry Automation</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Cloud-scheduled daily workers evaluate every active membership against configured reminder thresholds (7 days, 3 days, 1 day, and expiry day). Cryptographic idempotency keys ensure no member receives duplicate notifications during job retries.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col md:flex-row gap-6 items-start">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Official Meta WhatsApp Business Cloud API</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Outbound WhatsApp reminder templates delivered straight to members' smartphones. Includes real-time delivery status webhooks, graceful unconfigured handling, and message delivery audit logging.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col md:flex-row gap-6 items-start">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Maintenance & Equipment Problem Management</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Members submit broken machines, cleaning requirements, and facility requests with photo and video attachments uploaded to isolated Cloud Storage buckets. Admins update status (In Progress, Resolved) with automatic notifications sent back to members.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link to="/signup">
            <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>Experience GymOS Now</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};
