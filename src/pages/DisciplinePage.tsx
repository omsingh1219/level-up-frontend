import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  MessageSquare,
} from 'lucide-react';
import { useLevelUp, getLocalDateString } from '@/contexts/LevelUpContext';

export const DisciplinePage: React.FC = () => {
  const {
    data,
    today,
    addDisciplineItem,
    updateDisciplineItem,
    deleteDisciplineItem,
    toggleDisciplineItem,
    saveDailyReflection,
    getDailyRecord,
  } = useLevelUp();

  // Selected date for viewing / editing discipline log
  const [activeDate, setActiveDate] = useState<string>(today);

  // New checklist item modal/form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'detox' | 'study' | 'coding' | 'health' | 'routine'>('detox');

  // Reflection form state
  const currentRecord = getDailyRecord(activeDate);
  const [wentWell, setWentWell] = useState(currentRecord?.reflection?.wentWell || '');
  const [distracted, setDistracted] = useState(currentRecord?.reflection?.distracted || '');
  const [improveTomorrow, setImproveTomorrow] = useState(currentRecord?.reflection?.improveTomorrow || '');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // When date changes, update reflection inputs
  React.useEffect(() => {
    const rec = getDailyRecord(activeDate);
    setWentWell(rec?.reflection?.wentWell || '');
    setDistracted(rec?.reflection?.distracted || '');
    setImproveTomorrow(rec?.reflection?.improveTomorrow || '');
    setReflectionSaved(false);
  }, [activeDate, getDailyRecord]);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReflection(activeDate, {
      wentWell,
      distracted,
      improveTomorrow,
    });
    setReflectionSaved(true);
    setTimeout(() => setReflectionSaved(false), 3000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    addDisciplineItem(newItemText.trim(), newItemCategory);
    setNewItemText('');
    setShowAddModal(false);
  };

  // Date navigation
  const shiftDate = (days: number) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + days);
    setActiveDate(getLocalDateString(d));
  };

  // Calculations for active date
  const activeItems = data.disciplineItems.filter((i) => i.active);
  const checkedIds = currentRecord ? currentRecord.checkedDisciplineItemIds : [];
  const score = checkedIds.length;
  const total = activeItems.length || 1;
  const percentage = Math.round((score / total) * 100);

  // Missed-task analysis across the last 14 days
  const missedStats: Record<string, number> = {};
  activeItems.forEach((i) => {
    missedStats[i.id] = 0;
  });

  const refDate = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dStr = getLocalDateString(d);
    const rec = getDailyRecord(dStr);
    const cIds = rec ? rec.checkedDisciplineItemIds : [];
    activeItems.forEach((item) => {
      if (!cIds.includes(item.id)) {
        missedStats[item.id] = (missedStats[item.id] || 0) + 1;
      }
    });
  }

  const sortedMissed = [...activeItems].sort(
    (a, b) => (missedStats[b.id] || 0) - (missedStats[a.id] || 0)
  );

  return (
    <div className="space-y-6">
      {/* HEADER WITH DATE SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Discipline & Habits</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Non-negotiable standards for focus, digital detox, and personal sovereignty.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={activeDate}
            onChange={(e) => setActiveDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
          />

          <button
            onClick={() => shiftDate(1)}
            disabled={activeDate >= today}
            className={`p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors ${
              activeDate >= today
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
            }`}
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {activeDate !== today && (
            <button
              onClick={() => setActiveDate(today)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              Jump to Today
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Rule</span>
          </button>
        </div>
      </div>

      {/* DAILY DISCIPLINE SCORE SUMMARY BANNER */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Discipline Record for {activeDate === today ? 'Today' : activeDate}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
              {score} / {total}
            </span>
            <span className="text-sm font-semibold text-zinc-500">Standards Met ({percentage}%)</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {percentage === 100
              ? 'Flawless execution! You held the line against all distractions.'
              : percentage >= 75
              ? 'Solid discipline. You protected the majority of your highest priorities.'
              : 'Every single completed check is a victory. Focus on the next small win.'}
          </p>
        </div>

        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5">
            <span>Daily Execution Rate</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage === 100 ? 'bg-emerald-500' : percentage >= 75 ? 'bg-indigo-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* MAIN CHECKLIST & MISSED ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHECKLIST (2 COLUMNS) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-3">
            <h2 className="text-sm font-bold tracking-tight">Active Discipline Standards</h2>
            <span className="text-xs text-zinc-400">Click to toggle on {activeDate}</span>
          </div>

          <div className="space-y-2.5">
            {activeItems.map((item) => {
              const isChecked = checkedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleDisciplineItem(item.id, activeDate)}
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/70 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <div>
                      <span
                        className={`text-xs font-semibold ${
                          isChecked ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {item.category}
                    </span>
                    {!item.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDisciplineItem(item.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-500"
                        title="Delete custom rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MISSED TASK ANALYSIS & WEAK SPOT FINDER (1 COLUMN) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold tracking-tight">14-Day Weak-Spot Analysis</h3>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 mb-3">
              Items most frequently missed over the last 2 weeks. Focus your attention on mastering these:
            </p>

            <div className="space-y-2.5">
              {sortedMissed.slice(0, 4).map((item) => {
                const missedCount = missedStats[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                      <span className="truncate pr-2">{item.text}</span>
                      <span className="text-rose-500 shrink-0 font-bold">{missedCount}d missed</span>
                    </div>
                    <div className="mt-1.5 w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.round((missedCount / 14) * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-500">
            <strong>Self-Compassion Rule:</strong> A missed checklist item is diagnostic feedback, not a moral failure.
            Identify the trigger and adjust tomorrow's environment.
          </div>
        </div>
      </div>

      {/* DAILY REFLECTION SECTION */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold tracking-tight">
              Daily Reflection Journal ({activeDate === today ? 'Today' : activeDate})
            </h2>
          </div>
          {reflectionSaved && (
            <span className="text-xs text-emerald-500 font-semibold animate-fade-in">
              ✓ Reflection saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveReflection} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
              1. What went well today?
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Cleared 2 hours of deep work on OS Virtual Memory with phone in other room."
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-rose-500 block">
              2. What distracted or held me back?
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Scrolled YouTube after lunch for 25 mins out of boredom."
              value={distracted}
              onChange={(e) => setDistracted(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-indigo-500 block">
              3. What will I improve tomorrow?
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Immediately start 25-minute Pomodoro timer right after lunch."
              value={improveTomorrow}
              onChange={(e) => setImproveTomorrow(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Reflection</span>
            </button>
          </div>
        </form>
      </div>

      {/* ADD CUSTOM DISCIPLINE RULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Add Custom Discipline Standard</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Rule Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. No caffeine after 2:00 PM"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Category
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="detox">Digital Detox</option>
                  <option value="study">Deep Study</option>
                  <option value="coding">Coding & Problem Solving</option>
                  <option value="health">Physical Health & Energy</option>
                  <option value="routine">Evening & Sleep Routine</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Add Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
