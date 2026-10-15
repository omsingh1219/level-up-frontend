import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
  Edit3,
  TrendingUp,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useLevelUp, getLocalDateString } from '@/contexts/LevelUpContext';
import { Habit, HabitCategory, HabitFrequency } from '@/types/levelup';

export const HabitsPage: React.FC = () => {
  const {
    data,
    today,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    toggleHabitLog,
    isHabitDoneOnDate,
    getHabitStreak,
    getHabitCompletionRate,
  } = useLevelUp();

  // Selected Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showArchived, setShowArchived] = useState(false);

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Study');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);
  const [color, setColor] = useState('emerald');

  const categories: (HabitCategory | 'All')[] = [
    'All',
    'Study',
    'Coding',
    'Fitness',
    'Mindset',
    'Health',
    'Digital Detox',
  ];

  // Filtered habits
  const displayedHabits = data.habits.filter((h) => {
    if (h.archived !== showArchived) return false;
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    return true;
  });

  const openAddModal = () => {
    setEditingHabitId(null);
    setTitle('');
    setDescription('');
    setCategory('Study');
    setFrequency('daily');
    setTargetDaysPerWeek(7);
    setColor('emerald');
    setShowModal(true);
  };

  const openEditModal = (h: Habit) => {
    setEditingHabitId(h.id);
    setTitle(h.title);
    setDescription(h.description || '');
    setCategory(h.category);
    setFrequency(h.frequency);
    setTargetDaysPerWeek(h.targetDaysPerWeek);
    setColor(h.color);
    setShowModal(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingHabitId) {
      updateHabit(editingHabitId, {
        title: title.trim(),
        description: description.trim(),
        category,
        frequency,
        targetDaysPerWeek: Number(targetDaysPerWeek),
        color,
      });
    } else {
      addHabit({
        title: title.trim(),
        description: description.trim(),
        category,
        frequency,
        targetDaysPerWeek: Number(targetDaysPerWeek),
        color,
        icon: 'CheckSquare',
        archived: false,
      });
    }
    setShowModal(false);
  };

  // Generate the last 14 days for the quick horizontal table tracker
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dStr = getLocalDateString(d);
    return {
      dateStr: dStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNum: d.getDate(),
      isToday: dStr === today,
    };
  });

  // Calculate heatmap data for the past 60 days
  const heatmapDays = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (59 - i));
    const dStr = getLocalDateString(d);
    const activeHabitIds = data.habits.filter((h) => !h.archived).map((h) => h.id);
    const completedCount = data.habitLogs.filter(
      (l) => l.date === dStr && l.completed && activeHabitIds.includes(l.habitId)
    ).length;
    const ratio = activeHabitIds.length > 0 ? completedCount / activeHabitIds.length : 0;
    return {
      dateStr: dStr,
      completedCount,
      ratio,
    };
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Build unshakeable daily consistency without guilt or judgment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showArchived
                ? 'bg-zinc-800 text-white border-zinc-700'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5 inline mr-1" />
            <span>{showArchived ? 'Showing Archived' : 'Archived'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* HEATMAP / CONSISTENCY MATRIX */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>60-Day Habit Matrix & Consistency Heatmap</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-zinc-100 dark:bg-zinc-800" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/30" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500/60" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[500px]">
            {heatmapDays.map((hd) => {
              let bg = 'bg-zinc-100 dark:bg-zinc-800/60';
              if (hd.ratio > 0.75) bg = 'bg-emerald-500';
              else if (hd.ratio > 0.5) bg = 'bg-emerald-500/70';
              else if (hd.ratio > 0.25) bg = 'bg-emerald-500/40';
              else if (hd.completedCount > 0) bg = 'bg-emerald-500/20';

              return (
                <div
                  key={hd.dateStr}
                  title={`${hd.dateStr}: ${hd.completedCount} habits completed`}
                  className={`w-3.5 h-3.5 rounded-xs ${bg} transition-colors hover:ring-1 hover:ring-emerald-400 cursor-pointer`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 14-DAY QUICK CHECK-OFF TABLE */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold tracking-tight">14-Day Rapid Check-In</h2>
            <p className="text-xs text-zinc-500">Click any date block to toggle or backfill completion</p>
          </div>
        </div>

        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold">
              <th className="py-2.5 px-3 w-56">Habit</th>
              <th className="py-2.5 px-2 text-center w-24">Streak</th>
              {last14Days.map((d) => (
                <th
                  key={d.dateStr}
                  className={`py-2 text-center w-8 ${
                    d.isToday ? 'text-emerald-500 font-bold bg-emerald-500/5 rounded-t' : ''
                  }`}
                >
                  <div className="text-[10px] uppercase">{d.dayName}</div>
                  <div className="text-xs">{d.dayNum}</div>
                </th>
              ))}
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {displayedHabits.length === 0 ? (
              <tr>
                <td colSpan={17} className="py-8 text-center text-zinc-400 text-xs">
                  No habits found for this filter.{' '}
                  <button onClick={openAddModal} className="text-emerald-500 underline font-medium">
                    Create your first habit
                  </button>
                </td>
              </tr>
            ) : (
              displayedHabits.map((habit) => {
                const { currentStreak, longestStreak } = getHabitStreak(habit.id);
                const completionRate = getHabitCompletionRate(habit.id, 14);

                return (
                  <tr key={habit.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{habit.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800">{habit.category}</span>
                        <span>{habit.frequency}</span>
                        <span>•</span>
                        <span className="text-emerald-500 font-medium">{completionRate}% 14d</span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>{currentStreak}d</span>
                      </div>
                    </td>

                    {/* 14 Day Toggles */}
                    {last14Days.map((d) => {
                      const isDone = isHabitDoneOnDate(habit.id, d.dateStr);
                      return (
                        <td
                          key={d.dateStr}
                          className={`py-2 text-center ${d.isToday ? 'bg-emerald-500/5' : ''}`}
                        >
                          <button
                            onClick={() => toggleHabitLog(habit.id, d.dateStr)}
                            className={`w-6 h-6 rounded-md mx-auto flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-900'
                            }`}
                            title={`${habit.title} on ${d.dateStr}: ${isDone ? 'Completed' : 'Missed'}`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(habit)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          title="Edit Habit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => archiveHabit(habit.id)}
                          className="p-1 rounded text-zinc-400 hover:text-amber-500"
                          title={habit.archived ? 'Unarchive' : 'Archive'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-500"
                          title="Delete Habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* POSITIVE RESILIENCE NOTICE */}
      <div className="p-4 rounded-xl bg-linear-to-r from-emerald-500/10 via-zinc-900/10 to-indigo-500/10 border border-emerald-500/20 text-xs flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">Discipline Principle: Never Miss Twice.</span>
          <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
            Missing one day is an accident; missing twice is the start of a new habit. If you miss a day, don't spiral or
            abandon your goals — simply check in today and keep your system moving forward.
          </p>
        </div>
      </div>

      {/* ADD / EDIT HABIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">
              {editingHabitId ? 'Edit Habit' : 'Create New Habit'}
            </h3>
            <form onSubmit={handleSaveHabit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 15 pages of system architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Description / Intention
                </label>
                <textarea
                  rows={2}
                  placeholder="Why is this habit critical for your growth?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HabitCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Study">Study</option>
                    <option value="Coding">Coding</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Health">Health</option>
                    <option value="Digital Detox">Digital Detox</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="daily">Every Day (7/7)</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="custom">Custom Weekly Target</option>
                  </select>
                </div>
              </div>

              {frequency === 'custom' && (
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Target Days Per Week (1 to 7)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={targetDaysPerWeek}
                    onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  {editingHabitId ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
