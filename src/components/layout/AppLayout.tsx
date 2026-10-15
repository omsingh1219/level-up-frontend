import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  ShieldCheck,
  ListTodo,
  Timer,
  GraduationCap,
  Code2,
  Briefcase,
  EyeOff,
  BarChart3,
  Calendar,
  Settings,
  Sun,
  Moon,
  Flame,
  Plus,
  Menu,
  X,
  Sparkles,
  Zap,
  Gamepad2,
  HeartHandshake,
  Coffee,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { QuickBreakModal } from '@/components/QuickBreakModal';

export const AppLayout: React.FC = () => {
  const { data, setTheme, currentOverallStreak, tasksRemainingToday, dailyCompletionPercentage } = useLevelUp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickBreakOpen, setQuickBreakOpen] = useState(false);
  const navigate = useNavigate();

  const isDark = data.profile.theme !== 'light';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/habits', label: 'Habit Tracker', icon: CheckSquare },
    { to: '/discipline', label: 'Daily Discipline', icon: ShieldCheck },
    {
      to: '/tasks',
      label: 'Study Planner',
      icon: ListTodo,
      badge: tasksRemainingToday > 0 ? tasksRemainingToday : undefined,
    },
    { to: '/timer', label: 'Focus Timer', icon: Timer },
    { to: '/exams', label: 'Exam Planner', icon: GraduationCap },
    { to: '/coding', label: 'Coding Tracker', icon: Code2 },
    { to: '/career', label: 'Projects & Career', icon: Briefcase },
    { to: '/distractions', label: 'Distraction Journal', icon: EyeOff },
    { to: '/games', label: 'Brain Games & Breaks', icon: Gamepad2 },
    { to: '/companion', label: 'AI Companion', icon: HeartHandshake },
    { to: '/analytics', label: 'Weekly Review', icon: BarChart3 },
    { to: '/history', label: 'History Calendar', icon: Calendar },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm tracking-wider shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
                <span>LEVEL UP</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  OS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-[130px]">
                {data.profile.college || 'Student OS'}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold"
            title={`${currentOverallStreak} Day Consistency Streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{currentOverallStreak}</span>
          </div>
        </div>

        {/* Student Mini Card */}
        <div className="px-3 pt-3 pb-1">
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/50 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {data.profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate text-zinc-800 dark:text-zinc-200">
                {data.profile.name}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1">
                <span>{data.profile.year}</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">{dailyCompletionPercentage}% Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/60 space-y-2">
          {/* Quick Focus Button */}
          <button
            onClick={() => navigate('/timer')}
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Launch Pomodoro</span>
          </button>

          {/* Theme & Sync Status */}
          <div className="flex items-center justify-between pt-1 text-xs text-zinc-500 dark:text-zinc-400 px-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Toggle Light / Dark mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <span className="text-[10px] flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${data.profile.cloudSyncEnabled ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              <span>{data.profile.cloudSyncEnabled ? 'Cloud' : 'Local'}</span>
            </span>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE SIDE MENU */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-[#0c0c0e] z-50 transform transition-transform duration-200 ease-in-out border-r border-zinc-200 dark:border-zinc-800 flex flex-col lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-sm">LEVEL UP OS</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
            <Flame className="w-4 h-4 fill-current" />
            <span>{currentOverallStreak}d Streak</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-14 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Daily Intention Banner */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-xl truncate">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Today's Focus:</span>
              <span className="truncate italic">"{data.profile.dailyFocusIntention}"</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Break Button */}
            <button
              onClick={() => setQuickBreakOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-medium transition-colors cursor-pointer"
              title="Take a Quick Break"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick Break</span>
            </button>

            {/* Quick Task Shortcut */}
            <button
              onClick={() => navigate('/tasks')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Add Task</span>
            </button>

            {/* Quick Study Session */}
            <button
              onClick={() => navigate('/timer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Focus</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Toggle Dark/Light Mode"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Quick Break Launcher Modal */}
      <QuickBreakModal isOpen={quickBreakOpen} onClose={() => setQuickBreakOpen(false)} />
    </div>
  );
};
