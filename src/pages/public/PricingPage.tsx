import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PricingPage: React.FC = () => {
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
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Flexible SaaS Subscription</h1>
          <p className="mt-3 text-sm font-semibold text-amber-400 uppercase tracking-widest">
            Demo pricing — configure before launch
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/70 flex flex-col">
            <h3 className="text-lg font-bold text-white">Starter</h3>
            <p className="text-xs text-zinc-400 mt-1">Single location gym</p>
            <div className="my-6">
              <span className="text-4xl font-black text-white">₹499</span>
              <span className="text-xs text-zinc-400"> / month</span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-300 flex-1 mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 150 members</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic renewals & alerts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Member problem tickets</li>
            </ul>
            <Link to="/signup"><Button variant="secondary" className="w-full">Choose Starter</Button></Link>
          </div>

          <div className="p-7 rounded-2xl border-2 border-emerald-500/80 bg-zinc-900 flex flex-col relative shadow-xl shadow-emerald-950/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-extrabold uppercase">
              Recommended
            </div>
            <h3 className="text-lg font-bold text-white">Pro</h3>
            <p className="text-xs text-zinc-400 mt-1">Growing gym centers</p>
            <div className="my-6">
              <span className="text-4xl font-black text-white">₹999</span>
              <span className="text-xs text-zinc-400"> / month</span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-300 flex-1 mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited active members</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> WhatsApp Cloud API integration</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> In-gym store & product catalog</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5 staff delegate accounts</li>
            </ul>
            <Link to="/signup"><Button variant="primary" className="w-full">Start Pro Trial</Button></Link>
          </div>

          <div className="p-7 rounded-2xl border border-zinc-800 bg-zinc-900/70 flex flex-col">
            <h3 className="text-lg font-bold text-white">Business</h3>
            <p className="text-xs text-zinc-400 mt-1">High volume enterprise gyms</p>
            <div className="my-6">
              <span className="text-4xl font-black text-white">₹1,499</span>
              <span className="text-xs text-zinc-400"> / month</span>
            </div>
            <ul className="space-y-3 text-xs text-zinc-300 flex-1 mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Pro</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited staff logins</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full audit logs & export</li>
            </ul>
            <Link to="/signup"><Button variant="secondary" className="w-full">Choose Business</Button></Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-white">GymOS</span>
        </Link>
        <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
      </header>

      <main className="flex-1 max-w-xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-3">Get In Touch</h1>
        <p className="text-sm text-zinc-400 mb-8">Need custom gym setup, WhatsApp Business onboarding, or multi-branch deployment?</p>
        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 text-left space-y-4">
          <div>
            <label className="text-xs text-zinc-400 font-medium">Support Email</label>
            <p className="text-sm font-semibold text-emerald-400">support@gymos.app</p>
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-medium">WhatsApp Assistance</label>
            <p className="text-sm font-semibold text-white">+91 98765 43210</p>
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-medium">Headquarters</label>
            <p className="text-sm text-zinc-300">Bengaluru, Karnataka, India</p>
          </div>
        </div>
      </main>
    </div>
  );
};
