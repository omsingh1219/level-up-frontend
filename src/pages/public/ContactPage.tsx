import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <label className="text-xs text-zinc-400 font-medium">Support Email</label>
              <p className="text-sm font-semibold text-emerald-400">support@gymos.app</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <label className="text-xs text-zinc-400 font-medium">WhatsApp Assistance</label>
              <p className="text-sm font-semibold text-white">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <label className="text-xs text-zinc-400 font-medium">Headquarters</label>
              <p className="text-sm text-zinc-300">Bengaluru, Karnataka, India</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
