import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Home,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  Bell,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPopover } from '@/components/ui/NotificationPopover';

export const MemberLayout: React.FC = () => {
  const { profile, gym, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/member', icon: Home, exact: true },
    { label: 'My Membership', path: '/member/membership', icon: CreditCard },
    { label: 'Gym Store', path: '/member/products', icon: ShoppingBag },
    { label: 'Report a Problem', path: '/member/problems', icon: AlertCircle },
    { label: 'Profile & Consent', path: '/member/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
              GymOS <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Member</span>
            </h1>
            <p className="text-[11px] text-zinc-400">{gym?.name || 'Fitness Member'}</p>
          </div>
        </div>

        {/* Member Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right side: Notifications & Sign out */}
        <div className="flex items-center gap-2">
          <NotificationPopover />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Bottom Bar for Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-zinc-900/95 border-t border-zinc-800/80 backdrop-blur-lg z-30 flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
