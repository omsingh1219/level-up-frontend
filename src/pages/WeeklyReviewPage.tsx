import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Trophy,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Code2,
  Sparkles,
  Save,
  Plus,
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLevelUp, getLocalDateString } from '@/contexts/LevelUpContext';
import { WeeklyReview } from '@/types/levelup';

export const WeeklyReviewPage: React.FC = () => {
  const {
    data,
    today,
    saveWeeklyReview,
    getStudyMinutesOnDate,
    getDistractionMinutesOnDate,
    isHabitDoneOnDate,
    getHabitStreak,
  } = useLevelUp();

  // Selected week offset (0 = current week, -1 = last week, etc.)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Compute start (Monday) and end (Sunday) of selected week
  const refDate = new Date();
  refDate.setDate(refDate.getDate() + weekOffset * 7);

  // Find Monday
  const day = refDate.getDay();
  const diffToMon = refDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(refDate.setDate(diffToMon));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const startStr = getLocalDateString(monday);
  const endStr = getLocalDateString(sunday);
  const weekId = `week-${startStr}`;

  // Existing review or defaults
  const existingReview = data.weeklyReviews.find((r) => r.id === weekId || r.startDate === startStr);

  const [win, setWin] = useState(existingReview?.win || '');
  const [obstacle, setObstacle] = useState(existingReview?.obstacle || '');
  const [focusNextWeek, setFocusNextWeek] = useState(existingReview?.focusNextWeek || '');
  const [nextWeekGoals, setNextWeekGoals] = useState(
    existingReview?.nextWeekGoals || [
      { id: '1', text: 'Maintain 4.5+ average daily focus hours', completed: false },
      { id: '2', text: 'Solve 10 LeetCode problems (Graphs & Trees)', completed: false },
      { id: '3', text: 'Complete OS Memory Management revision & past papers', completed: false },
    ]
  );
  const [newGoalText, setNewGoalText] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);

  // Update inputs when week changes
  React.useEffect(() => {
    const r = data.weeklyReviews.find((rw) => rw.id === weekId || rw.startDate === startStr);
    setWin(r?.win || '');
    setObstacle(r?.obstacle || '');
    setFocusNextWeek(r?.focusNextWeek || '');
    if (r?.nextWeekGoals) {
      setNextWeekGoals(r.nextWeekGoals);
    }
  }, [weekId, startStr, data.weeklyReviews]);

  // Aggregate stats across the 7 days of the selected week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return getLocalDateString(d);
  });

  // Total study minutes in week
  const totalStudyMinutes = weekDays.reduce((acc, dStr) => acc + getStudyMinutesOnDate(dStr), 0);
  const studyHours = (totalStudyMinutes / 60).toFixed(1);

  // Focus sessions count in week
  const focusSessionsCount = data.studySessions.filter(
    (s) => weekDays.includes(s.date) && s.sessionType === 'focus'
  ).length;

  // Coding problems solved in week
  const codingSolvedCount = data.codingProblems.filter((p) => weekDays.includes(p.date)).length;

  // Distraction minutes in week
  const totalDistractionMinutes = weekDays.reduce((acc, dStr) => acc + getDistractionMinutesOnDate(dStr), 0);
  const distractionHours = (totalDistractionMinutes / 60).toFixed(1);

  // Task completion rate in week
  const weekTasks = data.tasks.filter((t) => weekDays.includes(t.deadline));
  const completedWeekTasks = weekTasks.filter((t) => t.status === 'completed').length;
  const taskRate = weekTasks.length > 0 ? Math.round((completedWeekTasks / weekTasks.length) * 100) : 100;

  // Habit consistency in week
  const activeHabits = data.habits.filter((h) => !h.archived);
  let totalHabitSlots = activeHabits.length * 7;
  let totalHabitCompleted = 0;
  const habitPerformances: Record<string, number> = {};

  activeHabits.forEach((h) => {
    let count = 0;
    weekDays.forEach((dStr) => {
      if (isHabitDoneOnDate(h.id, dStr)) {
        count++;
        totalHabitCompleted++;
      }
    });
    habitPerformances[h.id] = count;
  });

  const habitRate = totalHabitSlots > 0 ? Math.round((totalHabitCompleted / totalHabitSlots) * 100) : 0;

  // Most consistent & most missed habit
  const sortedHabits = [...activeHabits].sort(
    (a, b) => (habitPerformances[b.id] || 0) - (habitPerformances[a.id] || 0)
  );
  const mostConsistentHabit = sortedHabits[0];
  const mostMissedHabit = sortedHabits[sortedHabits.length - 1];

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const review: WeeklyReview = {
      id: weekId,
      weekNumber: 42,
      year: 2026,
      startDate: startStr,
      endDate: endStr,
      win,
      obstacle,
      focusNextWeek,
      nextWeekGoals,
      createdAt: new Date().toISOString(),
    };
    saveWeeklyReview(review);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setNextWeekGoals((prev) => [
      ...prev,
      { id: `goal-${Date.now()}`, text: newGoalText.trim(), completed: false },
    ]);
    setNewGoalText('');
  };

  const toggleGoal = (id: string) => {
    setNextWeekGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const removeGoal = (id: string) => {
    setNextWeekGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* HEADER WITH WEEK SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Review & Analytics</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Audit your consistency, review actual outputs, and align your priorities for next week.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {startStr} to {endStr} {weekOffset === 0 ? '(Current Week)' : ''}
          </div>

          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            disabled={weekOffset >= 0}
            className={`p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors ${
              weekOffset >= 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
            }`}
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 CORE WEEKLY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Study Hours */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Weekly Study Hours</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            {studyHours} hrs
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {focusSessionsCount} completed Pomodoro sprints
          </div>
        </div>

        {/* Habits Consistency Rate */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Habits Executed</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-indigo-500">{habitRate}%</div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {totalHabitCompleted} of {totalHabitSlots} planned check-ins
          </div>
        </div>

        {/* Coding Problems */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>DSA Problems Solved</span>
            <Code2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-500">{codingSolvedCount}</div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {(codingSolvedCount / 7).toFixed(1)} problems/day average
          </div>
        </div>

        {/* Distraction Screen Time */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Logged Distraction</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-500">{distractionHours} hrs</div>
          <div className="mt-2 text-[11px] text-zinc-400">
            Focus-to-screen ratio: {(totalStudyMinutes / Math.max(1, totalDistractionMinutes)).toFixed(1)}x
          </div>
        </div>
      </div>

      {/* HABIT INSIGHTS: MOST CONSISTENT & WEAK SPOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
            <Trophy className="w-4 h-4" />
            <span>Most Consistent Habit This Week</span>
          </div>
          {mostConsistentHabit ? (
            <div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mt-1">
                {mostConsistentHabit.title}
              </div>
              <div className="text-zinc-500 mt-0.5">
                Completed on {habitPerformances[mostConsistentHabit.id] || 0} of 7 days (
                {Math.round(((habitPerformances[mostConsistentHabit.id] || 0) / 7) * 100)}% reliability)
              </div>
            </div>
          ) : (
            <div className="text-zinc-400">No habit records</div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
          <div className="flex items-center gap-2 text-rose-500 font-bold mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Area for Environmental Redesign</span>
          </div>
          {mostMissedHabit ? (
            <div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm mt-1">
                {mostMissedHabit.title}
              </div>
              <div className="text-zinc-500 mt-0.5">
                Missed on {7 - (habitPerformances[mostMissedHabit.id] || 0)} of 7 days. Reduce friction or adjust
                timing.
              </div>
            </div>
          ) : (
            <div className="text-zinc-400">No habit records</div>
          )}
        </div>
      </div>

      {/* GUIDED 3-QUESTION REFLECTION */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold tracking-tight">Weekly Reflection & Strategic Audit</h2>
          </div>
          {savedBanner && (
            <span className="text-xs text-emerald-500 font-semibold animate-fade-in">
              ✓ Weekly review saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveReview} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block">
              1. What was your single biggest win or breakthrough this week?
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Mastered Dynamic Programming Knapsack patterns and cleared 28 study hours."
              value={win}
              onChange={(e) => setWin(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-rose-500 block">
              2. What was the main friction point, obstacle, or time sink?
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Lost 2.5 hours on Thursday night binge-watching tech YouTube videos."
              value={obstacle}
              onChange={(e) => setObstacle(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-indigo-500 block">
              3. What is your #1 non-negotiable focus for next week?
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Revise OS Virtual Memory Page Replacement and solve 12 LeetCode medium questions."
              value={focusNextWeek}
              onChange={(e) => setFocusNextWeek(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Weekly Review</span>
            </button>
          </div>
        </form>
      </div>

      {/* GOALS FOR NEXT WEEK */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
          <h2 className="text-sm font-bold tracking-tight">Key Objectives for the Upcoming Week</h2>
          <span className="text-xs text-zinc-500">Check off as you accomplish them</span>
        </div>

        <div className="space-y-2 mb-4">
          {nextWeekGoals.map((g) => (
            <div
              key={g.id}
              className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                g.completed
                  ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-70'
                  : 'bg-zinc-50/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleGoal(g.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                    g.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {g.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <span
                  className={`text-xs font-medium ${
                    g.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {g.text}
                </span>
              </div>

              <button
                onClick={() => removeGoal(g.id)}
                className="text-zinc-400 hover:text-rose-500 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddGoal} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new weekly objective..."
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};
