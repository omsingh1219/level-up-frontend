import React, { useState } from 'react';
import {
  EyeOff,
  Plus,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Trash2,
  Smile,
  Shield,
  Activity,
  ArrowRight,
  Heart,
  Coffee,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { DistractionActivity, DistractionTrigger } from '@/types/levelup';

const HEALTHY_REPLACEMENTS = [
  { action: '5-Minute Brisk Walk', desc: 'Step away from all screens and get natural light.', icon: Activity },
  { action: 'Drink a Tall Glass of Cold Water', desc: 'Hydration often eliminates false urges caused by fatigue.', icon: Coffee },
  { action: '20 Slow Deep Belly Breaths', desc: 'Regulates your nervous system and stops impulsive dopamine seeking.', icon: Heart },
  { action: '15 Push-ups or Bodyweight Squats', desc: 'Redirects nervous physical energy into physical strength.', icon: Sparkles },
  { action: 'Read 2 Pages of Physical Book', desc: 'Engages high-order thinking without blue-light hyperstimulation.', icon: Shield },
];

export const DistractionJournalPage: React.FC = () => {
  const { data, today, logDistraction, deleteDistraction, getStudyMinutesOnDate, getDistractionMinutesOnDate } = useLevelUp();

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [activity, setActivity] = useState<DistractionActivity>('Instagram Reels');
  const [minutesSpent, setMinutesSpent] = useState(25);
  const [urgeLevel, setUrgeLevel] = useState(3);
  const [trigger, setTrigger] = useState<DistractionTrigger>('Procrastination');
  const [isIntentional, setIsIntentional] = useState(false);
  const [notes, setNotes] = useState('');

  // Urge Surfer interactive tool
  const [showUrgeSurfer, setShowUrgeSurfer] = useState(false);
  const [urgeTimer, setUrgeTimer] = useState(180); // 3 minutes urge delay
  const [urgeActive, setUrgeActive] = useState(false);

  // Filter
  const todayDistractionMinutes = getDistractionMinutesOnDate(today);
  const todayStudyMinutes = getStudyMinutesOnDate(today);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutesSpent <= 0) return;

    logDistraction({
      date: today,
      activity,
      minutesSpent: Number(minutesSpent),
      urgeLevel: Number(urgeLevel),
      trigger,
      isIntentionalRecreation: isIntentional,
      notes: notes.trim() || undefined,
    });

    setNotes('');
    setShowModal(false);
  };

  // Compare study hours vs distraction hours
  const studyHours = (todayStudyMinutes / 60).toFixed(1);
  const distractionHours = (todayDistractionMinutes / 60).toFixed(1);

  // Trigger frequency analysis
  const triggerCounts: Record<string, number> = {};
  data.distractionLogs.forEach((dl) => {
    triggerCounts[dl.trigger] = (triggerCounts[dl.trigger] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Distraction & Screen-Time Journal</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Break impulsive dopamine loops, understand behavioral triggers, and reclaim focus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUrgeSurfer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Urge Surfer Mode</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Distraction</span>
          </button>
        </div>
      </div>

      {/* COMPARISON METRICS: STUDY VS DISTRACTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Focus */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500 font-medium">Focused Study Time Today</div>
          <div className="mt-2 text-3xl font-black text-emerald-500">{studyHours} hrs</div>
          <div className="mt-2 text-[11px] text-zinc-400">Deep cognitive work logged</div>
        </div>

        {/* Today's Distraction */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500 font-medium">Logged Screen / Game Distraction</div>
          <div className="mt-2 text-3xl font-black text-rose-500">{distractionHours} hrs</div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {todayDistractionMinutes} minutes lost to scrolling/games
          </div>
        </div>

        {/* Focus-to-Distraction Ratio */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500 font-medium">Focus vs Distraction Ratio</div>
          <div className="mt-2 text-3xl font-black text-indigo-500">
            {todayDistractionMinutes > 0
              ? `${(todayStudyMinutes / todayDistractionMinutes).toFixed(1)}x`
              : 'Infinity (Clean Day!)'}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">Target: maintain 3.0x or higher</div>
        </div>
      </div>

      {/* HEALTHY REPLACEMENTS / URGE SURFING RECOMMENDATIONS */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Healthy Replacements When You Feel the Urge to Scroll
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Dopamine Reset Protocols</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HEALTHY_REPLACEMENTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.action}
                className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                  <Icon className="w-4 h-4 text-emerald-500" />
                  <span>{item.action}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISTRACTIONS LOG TABLE */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-4">
          <h2 className="text-sm font-bold tracking-tight">Recent Distraction Entries</h2>
          <span className="text-xs text-zinc-500">Includes both unintentional slips and intentional recreation</span>
        </div>

        <table className="w-full text-left text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold">
              <th className="py-2.5 px-3">Activity</th>
              <th className="py-2.5 px-2">Duration</th>
              <th className="py-2.5 px-2">Urge Level</th>
              <th className="py-2.5 px-2">Trigger</th>
              <th className="py-2.5 px-2">Type</th>
              <th className="py-2.5 px-3">Context / Notes</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {data.distractionLogs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">{log.activity}</td>
                <td className="py-3 px-2 font-mono font-bold text-rose-500">{log.minutesSpent} mins</td>
                <td className="py-3 px-2">
                  <span className="text-amber-500 font-bold">{log.urgeLevel} / 5</span>
                </td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-semibold">
                    {log.trigger}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      log.isIntentionalRecreation
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {log.isIntentionalRecreation ? 'Intentional Rest' : 'Unconscious Slip'}
                  </span>
                </td>
                <td className="py-3 px-3 text-zinc-500 text-[11px] max-w-xs truncate">{log.notes || '—'}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => deleteDistraction(log.id)}
                    className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {data.distractionLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                  No distractions logged. Stay disciplined!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* URGE SURFER MODAL */}
      {showUrgeSurfer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center">
            <Shield className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold mb-1">Ride the Urge Wave</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Neurological urges naturally peak and subside within 3 to 5 minutes if you do not feed them. Sit with the
              feeling without judgment.
            </p>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                The 3-Minute Pause
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Close your eyes. Inhale deeply for 4 seconds, hold for 4 seconds, exhale for 4 seconds. Notice where in
                your body you feel the restlessness.
              </p>
            </div>

            <button
              onClick={() => setShowUrgeSurfer(false)}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              The Urge Passed — Return to Deep Work
            </button>
          </div>
        </div>
      )}

      {/* LOG DISTRACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Log Distraction or Screen Time</h3>
            <form onSubmit={handleLog} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Activity *
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as DistractionActivity)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Gaming (BGMI/Valorant)">Gaming (BGMI / Valorant / PC)</option>
                  <option value="Twitter / X">Twitter / X</option>
                  <option value="Reddit Doomscroll">Reddit Doomscroll</option>
                  <option value="Streaming / Netflix">Streaming / Netflix</option>
                  <option value="Random Web Browsing">Random Web Browsing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Minutes Spent *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={minutesSpent}
                    onChange={(e) => setMinutesSpent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Urge Intensity (1-5)
                  </label>
                  <select
                    value={urgeLevel}
                    onChange={(e) => setUrgeLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>1 - Very Mild</option>
                    <option value={2}>2 - Mild</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Strong</option>
                    <option value={5}>5 - Overwhelming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Primary Trigger
                </label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as DistractionTrigger)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Procrastination">Procrastination / Avoiding Hard Task</option>
                  <option value="Boredom">Boredom</option>
                  <option value="Stress">Stress / Anxiety</option>
                  <option value="Fatigue">Physical or Mental Fatigue</option>
                  <option value="Autopilot Habit">Autopilot Habit (Reached for phone)</option>
                  <option value="Loneliness">Loneliness</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recreationCheck"
                  checked={isIntentional}
                  onChange={(e) => setIsIntentional(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="recreationCheck" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  This was planned, guilt-free recreational rest
                </label>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Reflection Note
                </label>
                <textarea
                  rows={2}
                  placeholder="What was happening right before you picked up your device?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

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
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
