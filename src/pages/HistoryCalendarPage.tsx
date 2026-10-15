import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  ListTodo,
  EyeOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { useLevelUp, getLocalDateString } from '@/contexts/LevelUpContext';

export const HistoryCalendarPage: React.FC = () => {
  const {
    data,
    today,
    selectedHistoryDate,
    setSelectedHistoryDate,
    getDailyRecord,
    isHabitDoneOnDate,
    toggleHabitLog,
    toggleDisciplineItem,
    saveDailyReflection,
  } = useLevelUp();

  // Active viewing/browsing month & year
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // Editable reflection state for selected date
  const selectedRecord = getDailyRecord(selectedHistoryDate);
  const [wentWell, setWentWell] = useState(selectedRecord?.reflection?.wentWell || '');
  const [distracted, setDistracted] = useState(selectedRecord?.reflection?.distracted || '');
  const [improveTomorrow, setImproveTomorrow] = useState(selectedRecord?.reflection?.improveTomorrow || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when selectedHistoryDate changes
  React.useEffect(() => {
    const rec = getDailyRecord(selectedHistoryDate);
    setWentWell(rec?.reflection?.wentWell || '');
    setDistracted(rec?.reflection?.distracted || '');
    setImproveTomorrow(rec?.reflection?.improveTomorrow || '');
    setSaveSuccess(false);
  }, [selectedHistoryDate, getDailyRecord]);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyReflection(selectedHistoryDate, {
      wentWell,
      distracted,
      improveTomorrow,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  // Empty offset slots
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const dateStr = getLocalDateString(dateObj);
    calendarDays.push({
      dayNum: d,
      dateStr,
      isToday: dateStr === today,
      isSelected: dateStr === selectedHistoryDate,
      isFuture: dateStr > today,
    });
  }

  // Selected date detailed metrics
  const activeHabits = data.habits.filter((h) => !h.archived);
  const habitsDoneOnSelectedDate = activeHabits.filter((h) => isHabitDoneOnDate(h.id, selectedHistoryDate));

  const activeDisciplineItems = data.disciplineItems.filter((i) => i.active);
  const checkedDisciplineIds = selectedRecord ? selectedRecord.checkedDisciplineItemIds : [];

  const studySessionsOnDate = data.studySessions.filter((s) => s.date === selectedHistoryDate);
  const totalStudyMinutesOnDate = studySessionsOnDate.reduce((acc, s) => acc + s.durationMinutes, 0);

  const codingOnDate = data.codingProblems.filter((p) => p.date === selectedHistoryDate);
  const tasksOnDate = data.tasks.filter((t) => t.deadline === selectedHistoryDate);
  const completedTasksOnDate = tasksOnDate.filter((t) => t.status === 'completed');

  const distractionsOnDate = data.distractionLogs.filter((d) => d.date === selectedHistoryDate);
  const totalDistractionMinutesOnDate = distractionsOnDate.reduce((acc, d) => acc + d.minutesSpent, 0);

  // Month Name
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Persistent Daily History & Audit Calendar</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Select any past date to inspect its complete saved record, habit checks, study logs, and reflections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedHistoryDate(today);
              const t = new Date();
              setCurrentMonth(t.getMonth());
              setCurrentYear(t.getFullYear());
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
          >
            Jump to Today ({today})
          </button>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: CALENDAR NAVIGATOR (LEFT) & DAY SUMMARY DRILLDOWN (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CALENDAR MONTH GRID (5 COLS) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          {/* Month Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
            <h2 className="text-sm font-bold">{monthName}</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-10" />;
              }

              const rec = getDailyRecord(item.dateStr);
              const hasData =
                Boolean(rec) ||
                data.habitLogs.some((l) => l.date === item.dateStr && l.completed) ||
                data.studySessions.some((s) => s.date === item.dateStr);

              const isSelected = item.dateStr === selectedHistoryDate;
              const isToday = item.dateStr === today;

              let dotColor = 'bg-zinc-200 dark:bg-zinc-800';
              if (rec && rec.percentage >= 75) dotColor = 'bg-emerald-500';
              else if (rec && rec.percentage > 0) dotColor = 'bg-amber-500';
              else if (hasData) dotColor = 'bg-indigo-500';

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedHistoryDate(item.dateStr)}
                  disabled={item.isFuture}
                  className={`h-11 rounded-lg flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    item.isFuture
                      ? 'opacity-30 cursor-not-allowed bg-transparent'
                      : isSelected
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold shadow-xs'
                      : isToday
                      ? 'border-2 border-emerald-500 bg-emerald-500/5 font-bold text-emerald-600 dark:text-emerald-400'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="text-xs">{item.dayNum}</span>
                  {!item.isFuture && hasData && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-emerald-400' : dotColor
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>High discipline (&gt;75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span>No entry</span>
            </div>
          </div>
        </div>

        {/* DAY RECORD DETAILED SUMMARY (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Day Overview Banner */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Full Day Summary: {selectedHistoryDate} {selectedHistoryDate === today ? '(Today)' : ''}
                </h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500">
                {selectedRecord ? `${selectedRecord.percentage}% Discipline Score` : 'No Checklist Record'}
              </span>
            </div>

            {/* Quick Metrics for Selected Date */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="text-[10px] text-zinc-400">Habits Checked</div>
                <div className="text-base font-bold mt-0.5 text-zinc-900 dark:text-zinc-100">
                  {habitsDoneOnSelectedDate.length} / {activeHabits.length}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="text-[10px] text-zinc-400">Study Hours</div>
                <div className="text-base font-bold mt-0.5 text-emerald-500">
                  {(totalStudyMinutesOnDate / 60).toFixed(1)} hrs
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="text-[10px] text-zinc-400">Coding Solved</div>
                <div className="text-base font-bold mt-0.5 text-indigo-500">
                  {codingOnDate.length} problems
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="text-[10px] text-zinc-400">Distractions</div>
                <div className="text-base font-bold mt-0.5 text-rose-500">
                  {totalDistractionMinutesOnDate} mins
                </div>
              </div>
            </div>
          </div>

          {/* HABITS & DISCIPLINE CHECKLIST ON THAT DATE */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Habits Executed on {selectedHistoryDate} (Tap to correct/edit)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeHabits.map((habit) => {
                const isDone = isHabitDoneOnDate(habit.id, selectedHistoryDate);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabitLog(habit.id, selectedHistoryDate)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      isDone
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                        : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                          isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3 h-3 fill-current" />}
                      </div>
                      <span className="truncate">{habit.title}</span>
                    </div>

                    <span className="text-[10px] font-semibold">{isDone ? 'Done' : 'Missed'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STUDY SESSIONS ON THAT DATE */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Study Sprints on {selectedHistoryDate} ({studySessionsOnDate.length} sessions)
            </h3>

            <div className="space-y-2">
              {studySessionsOnDate.map((ss) => (
                <div
                  key={ss.id}
                  className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{ss.subject}</span>
                    {ss.notes && <span className="text-zinc-400 text-[11px]">— {ss.notes}</span>}
                  </div>
                  <span className="font-bold text-emerald-500">{ss.durationMinutes} mins</span>
                </div>
              ))}

              {studySessionsOnDate.length === 0 && (
                <div className="py-3 text-center text-zinc-400 text-xs">
                  No study sessions recorded on this date.
                </div>
              )}
            </div>
          </div>

          {/* REFLECTION SAVED ON THAT DATE */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Daily Reflection ({selectedHistoryDate})
              </h3>
              {saveSuccess && (
                <span className="text-xs text-emerald-500 font-semibold animate-fade-in">
                  ✓ Saved successfully
                </span>
              )}
            </div>

            <form onSubmit={handleSaveReflection} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                  What went well?
                </label>
                <textarea
                  rows={2}
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="No reflection recorded yet..."
                  className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-rose-500 block mb-1">
                  What distracted me?
                </label>
                <textarea
                  rows={2}
                  value={distracted}
                  onChange={(e) => setDistracted(e.target.value)}
                  placeholder="No reflection recorded yet..."
                  className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-indigo-500 block mb-1">
                  What will I improve tomorrow?
                </label>
                <textarea
                  rows={2}
                  value={improveTomorrow}
                  onChange={(e) => setImproveTomorrow(e.target.value)}
                  placeholder="No reflection recorded yet..."
                  className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Update Historical Reflection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
