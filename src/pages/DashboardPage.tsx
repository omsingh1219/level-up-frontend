import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Clock,
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Timer,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Coffee,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { QuickBreakModal } from '@/components/QuickBreakModal';

const MOTIVATIONAL_QUOTES = [
  { quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { quote: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
  { quote: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { quote: 'Focus is a muscle. The more you practice saying no to distractions, the easier deep work becomes.', author: 'Cal Newport' },
  { quote: 'Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.', author: 'John C. Maxwell' },
];

export const DashboardPage: React.FC = () => {
  const {
    data,
    today,
    dailyCompletionPercentage,
    habitsCompletedToday,
    totalHabitsToday,
    studyTimeTodayHours,
    tasksCompletedToday,
    tasksRemainingToday,
    currentOverallStreak,
    longestOverallStreak,
    toggleHabitLog,
    isHabitDoneOnDate,
    toggleTaskStatus,
    toggleDisciplineItem,
    getDailyRecord,
    addTask,
    logStudySession,
  } = useLevelUp();

  const navigate = useNavigate();

  // Quote State
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Quick Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [newMinutes, setNewMinutes] = useState(45);

  // Quick Study Log Modal
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studySubject, setStudySubject] = useState('Operating Systems');
  const [studyMinutes, setStudyMinutes] = useState(60);
  const [studyNotes, setStudyNotes] = useState('');

  // Quick Break Modal
  const [showBreakModal, setShowBreakModal] = useState(false);

  // Greetings logic
  const hour = new Date().getHours();
  let greetingTime = 'Good morning';
  if (hour >= 12 && hour < 17) greetingTime = 'Good afternoon';
  else if (hour >= 17) greetingTime = 'Good evening';

  // Format today's date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      subject: newSubject.trim() || 'General',
      category: 'University',
      priority: newPriority,
      status: 'todo',
      deadline: today,
      estimatedMinutes: Number(newMinutes) || 45,
      isTopThreeToday: true,
    });
    setNewTitle('');
    setNewSubject('');
    setShowTaskModal(false);
  };

  const handleLogStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (studyMinutes <= 0) return;
    const now = new Date();
    logStudySession({
      date: today,
      startTime: new Date(now.getTime() - studyMinutes * 60000).toISOString(),
      endTime: now.toISOString(),
      durationMinutes: Number(studyMinutes),
      subject: studySubject,
      sessionType: 'focus',
      notes: studyNotes,
    });
    setStudyNotes('');
    setShowStudyModal(false);
  };

  // Top 3 Priorities
  const topThreeTasks = data.tasks.filter((t) => t.isTopThreeToday).slice(0, 3);

  // Active Habits
  const activeHabits = data.habits.filter((h) => !h.archived);

  // Upcoming Exams
  const upcomingExams = [...data.exams]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 3);

  // Today's discipline record
  const todayRecord = getDailyRecord(today);
  const disciplineScore = todayRecord ? todayRecord.dailyScore : 0;
  const disciplineTotal = data.disciplineItems.filter((i) => i.active).length;

  return (
    <div className="space-y-6">
      {/* HERO SECTION & GREETING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greetingTime}, {data.profile.name}!
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            You're currently on a{' '}
            <span className="font-semibold text-amber-500">{currentOverallStreak}-day streak</span>. Let's make today count.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => setShowStudyModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Study Time</span>
          </button>

          <button
            onClick={() => navigate('/timer')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5 text-emerald-500" />
            <span>Pomodoro</span>
          </button>

          <button
            onClick={() => setShowBreakModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5 text-indigo-500" />
            <span>Quick Break</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Daily Completion Meter */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Daily Progress</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {dailyCompletionPercentage}%
            </span>
            <span className="text-xs text-zinc-400">composite</span>
          </div>
          <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${dailyCompletionPercentage}%` }}
            />
          </div>
        </div>

        {/* Study Time vs Target */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Study Hours</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {studyTimeTodayHours}h
            </span>
            <span className="text-xs text-zinc-400">/ {data.profile.dailyStudyTargetHours}h target</span>
          </div>
          <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((studyTimeTodayHours / data.profile.dailyStudyTargetHours) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Habits Checked */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Habits Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {habitsCompletedToday}
            </span>
            <span className="text-xs text-zinc-400">/ {totalHabitsToday} active</span>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Discipline: {disciplineScore}/{disciplineTotal}</span>
            <span className="text-emerald-500 font-medium">
              {totalHabitsToday > 0 ? Math.round((habitsCompletedToday / totalHabitsToday) * 100) : 0}%
            </span>
          </p>
        </div>

        {/* Streaks */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Discipline Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-500">
              {currentOverallStreak}
            </span>
            <span className="text-xs text-zinc-400">days in a row</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Best record: <strong className="text-zinc-800 dark:text-zinc-200">{longestOverallStreak} days</strong></span>
          </div>
        </div>
      </div>

      {/* TODAY'S TOP 3 PRIORITIES & MOTIVATIONAL BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Priorities (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold tracking-tight">Today's Top 3 Priorities</h2>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View all tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {topThreeTasks.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs">
                  No priority tasks pinned for today.{' '}
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="text-emerald-500 underline font-medium cursor-pointer"
                  >
                    Add one now
                  </button>
                </div>
              ) : (
                topThreeTasks.map((task, idx) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                        isDone
                          ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/40 opacity-70'
                          : 'bg-zinc-50/50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            #{idx + 1}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              isDone ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {task.subject}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right text-[11px] text-zinc-400 shrink-0">
                        <span>{task.estimatedMinutes}m est</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
            <span>
              {tasksCompletedToday} of {tasksCompletedToday + tasksRemainingToday} tasks completed today
            </span>
            <button
              onClick={() => setShowTaskModal(true)}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Priority</span>
            </button>
          </div>
        </div>

        {/* Motivational Quote & Intention Card (1 Column) */}
        <div className="p-5 rounded-xl bg-linear-to-br from-indigo-900/20 via-zinc-900 to-emerald-950/20 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Daily Wisdom</span>
              </div>
              <button
                onClick={nextQuote}
                className="p-1 hover:text-white rounded transition-colors cursor-pointer"
                title="Next Quote"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <blockquote className="text-sm italic font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
              "{MOTIVATIONAL_QUOTES[quoteIndex].quote}"
            </blockquote>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-2 text-right">
              — {MOTIVATIONAL_QUOTES[quoteIndex].author}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-zinc-200/40 dark:border-zinc-800/60">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Today's Intention
            </div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {data.profile.dailyFocusIntention || 'Conquer your core objectives with unwavering focus.'}
            </p>
          </div>
        </div>
      </div>

      {/* QUICK HABIT CHECKLIST & UPCOMING EXAMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Habit Tracker Checklist */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div>
              <h2 className="text-sm font-bold tracking-tight">Today's Habits</h2>
              <p className="text-xs text-zinc-500">Tap to toggle completion</p>
            </div>
            <button
              onClick={() => navigate('/habits')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Manage Habits</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {activeHabits.slice(0, 5).map((habit) => {
              const isDone = isHabitDoneOnDate(habit.id, today);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabitLog(habit.id, today)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isDone
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{habit.title}</div>
                      <div className="text-[10px] text-zinc-400">{habit.category}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isDone ? 'Completed' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Exams & Syllabus Urgency */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div>
              <h2 className="text-sm font-bold tracking-tight">Upcoming Exams & Deadlines</h2>
              <p className="text-xs text-zinc-500">Days remaining countdown</p>
            </div>
            <button
              onClick={() => navigate('/exams')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Exam Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {upcomingExams.map((exam) => {
              const daysLeft = Math.ceil(
                (new Date(exam.examDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
              );
              const isUrgent = daysLeft <= 7;

              // Calculate revised percentage
              const totalTopics = exam.units.flatMap((u) => u.topics).length;
              const revisedTopics = exam.units
                .flatMap((u) => u.topics)
                .filter((t) => t.status === 'revised').length;
              const percent = totalTopics > 0 ? Math.round((revisedTopics / totalTopics) * 100) : 0;

              return (
                <div
                  key={exam.id}
                  className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>{exam.subject}</span>
                        {exam.code && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {exam.code}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {exam.examDate} at {exam.examTime}
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1 ${
                        isUrgent
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{daysLeft} days left</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>
                      Syllabus: {revisedTopics}/{totalTopics} topics revised
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{percent}%</span>
                  </div>
                  <div className="mt-1 w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isUrgent ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* QUICK TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Add Today's Priority Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Page Replacement Numericals"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Subject / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="Operating Systems"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STUDY LOG MODAL */}
      {showStudyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Log Completed Study Session</h3>
            <form onSubmit={handleLogStudy} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Subject / Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Normalization & 3NF"
                  value={studySubject}
                  onChange={(e) => setStudySubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Duration (Minutes) *
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={studyMinutes}
                  onChange={(e) => setStudyMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Key Concepts Covered (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What did you learn or revise?"
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStudyModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Log Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Break Launcher Modal */}
      <QuickBreakModal isOpen={showBreakModal} onClose={() => setShowBreakModal(false)} />
    </div>
  );
};
