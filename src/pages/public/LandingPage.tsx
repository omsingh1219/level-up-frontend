import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Users,
  RefreshCw,
  Bell,
  AlertCircle,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Navigation */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            GymOS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <Link to="/features" className="hover:text-white transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-20 md:py-28 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Multi-Tenant Gym Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl">
          Your Gym, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Managed Smarter.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Manage members, automate renewals, handle problems and keep your gym organized from one powerful, production-ready platform.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link to="/signup">
            <Button size="lg" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
              Start Free Today
            </Button>
          </Link>
          <Link to="/features">
            <Button size="lg" variant="secondary">
              See How It Works
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Tenant Isolation</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Scheduled Expiry Reminders</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> WhatsApp Integration</span>
        </div>
      </section>

      {/* Core Feature Highlights */}
      <section className="px-6 md:px-12 py-20 bg-zinc-900/50 border-y border-zinc-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">Engineered for Fitness Businesses</h2>
            <p className="mt-3 text-sm text-zinc-400">Everything gym owners and members need in one unified ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Member Management</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Centralized database of all members, contact details, emergency information, join dates, and membership status.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Renewal Automation</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Deterministic daily scheduler automatically triggers 7-day, 3-day, and same-day notifications with duplicate protection.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Channel Alerts</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Real-time in-app notifications, official Meta WhatsApp Cloud API integration, and transactional email reminders.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Problem Reporting</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Members report equipment, cleanliness, and facility issues with photos & videos uploaded securely to Firebase Storage.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gym Store & Products</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Display supplements, apparel, and merchandise with real-time inventory counts and category filters.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real Analytics</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Live metrics computed from Firestore: monthly revenue, growth velocity, plan distribution, and retention rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Pricing Section */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Transparent Pricing</h2>
          <p className="mt-2 text-xs font-semibold text-amber-400 uppercase tracking-widest">
            Demo pricing — configure before launch
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Tier */}
          <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/70 flex flex-col">
            <h3 className="text-lg font-bold text-white">Starter</h3>
            <p className="text-xs text-zinc-400 mt-1">For single boutique fitness studios</p>
            <div className="mt-6 mb-6">
              <span className="text-3xl font-extrabold text-white">₹499</span>
              <span className="text-xs text-zinc-400"> / month</span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-300 flex-1 mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 150 Active Members</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated In-App Reminders</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Member Problem Reports</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic Analytics</li>
            </ul>
            <Link to="/signup">
              <Button variant="secondary" className="w-full">Choose Starter</Button>
            </Link>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="p-7 rounded-2xl border-2 border-emerald-500/80 bg-zinc-900 flex flex-col relative shadow-xl shadow-emerald-950/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-extrabold uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-lg font-bold text-white">Pro</h3>
            <p className="text-xs text-zinc-400 mt-1">For growing gym businesses</p>
            <div className="mt-6 mb-6">
              <span className="text-3xl font-extrabold text-white">₹999</span>
              <span className="text-xs text-zinc-400"> / month</span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-300 flex-1 mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Members</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> WhatsApp Cloud API Integration</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gym Store & Product Management</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Staff Delegation (Up to 5 staff)</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Advanced Growth Charts</li>
            </ul>
            <Link to="/signup">
              <Button variant="primary" className="w-full">Get Started with Pro</Button>
            </Link>
          </div>

          {/* Business Tier */}
          <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/70 flex flex-col">
            <h3 className="text-lg font-bold text-white">Business</h3>
            <p className="text-xs text-zinc-400 mt-1">For high-volume multi-facility gyms</p>
            <div className="mt-6 mb-6">
              <span className="text-3xl font-extrabold text-white">₹1,499</span>
              <span className="text-xs text-zinc-400"> / month</span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-300 flex-1 mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Pro</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Staff Accounts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority Support & Custom Setup</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Audit Log History</li>
            </ul>
            <Link to="/signup">
              <Button variant="secondary" className="w-full">Choose Business</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 py-8 px-6 md:px-12 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} GymOS. All rights reserved. Built for professional fitness operators.</p>
          <div className="flex gap-6 text-zinc-400">
            <Link to="/features" className="hover:text-white">Features</Link>
            <Link to="/pricing" className="hover:text-white">Pricing</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/login" className="hover:text-white">Portal Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
