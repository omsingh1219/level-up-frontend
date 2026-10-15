import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  CreditCard,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  BarChart3,
  Bell,
  Settings,
  UserCog,
  History,
  LogOut,
  Search,
  Menu,
  X,
  MessageSquareShare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { GlobalSearchModal } from '@/components/ui/GlobalSearchModal';

export const AdminLayout: React.FC = () => {
  const { profile, gym, signOut, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Members', path: '/admin/members', icon: Users, permission: 'members.read' as const },
    { label: 'Plans', path: '/admin/plans', icon: CreditCard },
    { label: 'Renewals', path: '/admin/renewals', icon: RefreshCw, permission: 'renewals.read' as const },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag, permission: 'products.read' as const },
    { label: 'Problems & Repairs', path: '/admin/problems', icon: AlertCircle, permission: 'complaints.read' as const },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, permission: 'analytics.read' as const },
    { label: 'Staff Team', path: '/admin/staff', icon: UserCog, adminOnly: true },
    { label: 'Audit Logs', path: '/admin/audit', icon: History, adminOnly: true },
    { label: 'WhatsApp & Settings', path: '/admin/settings', icon: Settings, adminOnly: true },
  ];

  const visibleItems = navItems.filter(item => {
    if (item.adminOnly && profile?.role !== 'ADMIN') return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="font-bold text-white tracking-tight">GymOS</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationPopover />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900/95 border-r border-zinc-800/80 backdrop-blur-xl flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">GymOS</h1>
              <p className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                {gym?.name || 'Management'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                {profile?.name ? profile.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{profile?.name || 'Administrator'}</p>
                <span className="inline-block text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                  {profile?.role || 'ADMIN'}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span>Search GymOS...</span>
              <kbd className="ml-4 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 rounded">
                ⌘K
              </kbd>
            </button>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">{gym?.name || 'GymOS Tenant'}</span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationPopover />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
