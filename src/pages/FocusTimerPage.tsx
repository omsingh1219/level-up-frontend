import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Bell,
  BookOpen,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { SessionType } from '@/types/levelup';
import { sound } from '@/utils/sound';

export const FocusTimerPage: React.FC = () => {
  const { data, today, logStudySession, deleteStudySession, getStudyMinutesOnDate, getWeeklyStudyMinutes } = useLevelUp();

  // Mode: Focus, Short Break, Long Break
  const [sessionType, setSessionType] = useState<SessionType>('focus');

  // Custom durations in minutes
  const [focusDuration, setFocusDuration] = useState<number>(data.profile.defaultPomodoroFocus || 25);
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(data.profile.defaultPomodoroShortBreak || 5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(data.profile.defaultPomodoroLongBreak || 15);

  // Active duration in seconds
  const getInitialSeconds = (type: SessionType) => {
    if (type === 'focus') return focusDuration * 60;
    if (type === 'short_break') return shortBreakDuration * 60;
    return longBreakDuration * 60;
  };

  const [timeLeft, setTimeLeft] = useState<number>(getInitialSeconds('focus'));
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Link to Subject / Task
  const [selectedSubject, setSelectedSubject] = useState<string>('Operating Systems');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Notification permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Accurate timing reference using timestamp delta to avoid tab drift
  const endTimeRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Handle duration changes when not running
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getInitialSeconds(sessionType));
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration, sessionType]);

  // Main Timer Loop using Delta Timestamps
  useEffect(() => {
    let intervalId: any = null;

    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
        startTimeRef.current = Date.now();
      }

      intervalId = setInterval(() => {
        const remaining = Math.max(0, Math.round((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(intervalId);
          setIsRunning(false);
          endTimeRef.current = null;
          handleSessionCompletion();
        }
      }, 500);
    } else {
      endTimeRef.current = null;
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, timeLeft]);

  const handleSessionCompletion = () => {
    // Play audio notification
    sound.playTimerComplete();

    // Trigger browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Completed! 🎉', {
        body:
          sessionType === 'focus'
            ? `Great focus session on ${selectedSubject}! Time for a well-deserved break.`
            : 'Break is over! Ready for the next deep work sprint?',
        icon: '/favicon.ico',
      });
    }

    // If it was a focus session, automatically log it!
    if (sessionType === 'focus') {
      const durationMins = focusDuration;
      const now = new Date();
      logStudySession({
        date: today,
        startTime: new Date(now.getTime() - durationMins * 60000).toISOString(),
        endTime: now.toISOString(),
        durationMinutes: durationMins,
        subject: selectedSubject,
        taskId: selectedTaskId || undefined,
        sessionType: 'focus',
        notes: sessionNotes || undefined,
      });
      setSessionNotes('');
      // Suggest short break
      setSessionType('short_break');
      setTimeLeft(shortBreakDuration * 60);
    } else {
      // Suggest returning to focus
      setSessionType('focus');
      setTimeLeft(focusDuration * 60);
    }
  };

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      endTimeRef.current = null;
    } else {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    setTimeLeft(getInitialSeconds(sessionType));
  };

  const handleSkip = () => {
    handleReset();
    if (sessionType === 'focus') {
      setSessionType('short_break');
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setSessionType('focus');
      setTimeLeft(focusDuration * 60);
    }
  };

  const requestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
    }
  };

  // Format time MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress percentage
  const totalSeconds = getInitialSeconds(sessionType);
  const progressPercent = Math.min(100, Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100));

  // Study Stats
  const todayStudyMins = getStudyMinutesOnDate(today);
  const weeklyStudyMins = getWeeklyStudyMinutes();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Session Timer</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pomodoro focus engine with drift-free background tab precision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifPermission !== 'granted' && (
            <button
              onClick={requestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          <button
            onClick={() => sound.playTimerComplete()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Test chime tone"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Test Chime</span>
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500">Today's Focus</div>
          <div className="text-xl font-black mt-1 text-zinc-900 dark:text-white">
            {(todayStudyMins / 60).toFixed(1)} hrs
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500">7-Day Focus</div>
          <div className="text-xl font-black mt-1 text-emerald-500">
            {(weeklyStudyMins / 60).toFixed(1)} hrs
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500">Daily Target</div>
          <div className="text-xl font-black mt-1 text-indigo-500">
            {data.profile.dailyStudyTargetHours} hrs
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500">Sessions Today</div>
          <div className="text-xl font-black mt-1 text-amber-500">
            {data.studySessions.filter((s) => s.date === today && s.sessionType === 'focus').length} sprints
          </div>
        </div>
      </div>

      {/* MAIN TIMER CARD */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-md text-center relative overflow-hidden">
        {/* Session Type Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 mb-6">
          <button
            onClick={() => {
              setSessionType('focus');
              setIsRunning(false);
              setTimeLeft(focusDuration * 60);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sessionType === 'focus'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Deep Focus ({focusDuration}m)
          </button>
          <button
            onClick={() => {
              setSessionType('short_break');
              setIsRunning(false);
              setTimeLeft(shortBreakDuration * 60);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sessionType === 'short_break'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Short Break ({shortBreakDuration}m)
          </button>
          <button
            onClick={() => {
              setSessionType('long_break');
              setIsRunning(false);
              setTimeLeft(longBreakDuration * 60);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sessionType === 'long_break'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Long Break ({longBreakDuration}m)
          </button>
        </div>

        {/* Big Digital Clock Display */}
        <div className="my-6">
          <div className="text-6xl sm:text-8xl font-black tracking-tight font-mono text-zinc-900 dark:text-white select-none">
            {formattedTime}
          </div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {sessionType === 'focus' ? 'Focus Sprint In Progress' : 'Recharge & Rest'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden mb-8">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              sessionType === 'focus' ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleStartPause}
            className={`px-8 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Session</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleSkip}
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Skip to Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Session Subject Selector */}
        {sessionType === 'focus' && (
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/60 max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                Active Subject
              </label>
              <input
                type="text"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                Link to Task (Optional)
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">No linked task</option>
                {data.tasks
                  .filter((t) => t.status !== 'completed')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* COMPLETED SESSION HISTORY */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-3">
          <h2 className="text-sm font-bold tracking-tight">Recent Focus Sprints History</h2>
          <span className="text-xs text-zinc-500">Automatically logged upon session completion</span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {data.studySessions.slice(0, 7).map((ss) => (
            <div key={ss.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  {ss.durationMinutes}m
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">{ss.subject}</div>
                  <div className="text-[10px] text-zinc-400">
                    {ss.date} • {ss.notes || 'Focused study block'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {ss.durationMinutes} mins
                </span>
                <button
                  onClick={() => deleteStudySession(ss.id)}
                  className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer"
                  title="Delete session log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {data.studySessions.length === 0 && (
            <div className="py-8 text-center text-zinc-400 text-xs">
              No sessions completed yet. Start your first sprint above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
