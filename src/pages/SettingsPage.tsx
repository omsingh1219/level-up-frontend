import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Database,
  Download,
  Upload,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { sound } from '@/utils/sound';
import { testSupabaseConnection } from '@/services/supabaseClient';

export const SettingsPage: React.FC = () => {
  const {
    data,
    updateProfile,
    setTheme,
    exportDataJson,
    exportSummaryCsv,
    importDataJson,
    resetToDemoData,
    triggerCloudSync,
  } = useLevelUp();

  // Profile Form state
  const [name, setName] = useState(data.profile.name);
  const [email, setEmail] = useState(data.profile.email);
  const [college, setCollege] = useState(data.profile.college);
  const [major, setMajor] = useState(data.profile.major);
  const [year, setYear] = useState(data.profile.year);
  const [semester, setSemester] = useState(data.profile.semester);
  const [targetGpa, setTargetGpa] = useState(data.profile.targetGpa);
  const [studyTarget, setStudyTarget] = useState(data.profile.dailyStudyTargetHours);
  const [codingGoal, setCodingGoal] = useState(data.profile.dailyCodingGoal);
  const [pomodoroFocus, setPomodoroFocus] = useState(data.profile.defaultPomodoroFocus);
  const [soundEnabled, setSoundEnabled] = useState(data.profile.soundEnabled);
  const [dailyIntention, setDailyIntention] = useState(data.profile.dailyFocusIntention);

  // Supabase Cloud Sync form state
  const [sbUrl, setSbUrl] = useState(data.profile.supabaseUrl || '');
  const [sbKey, setSbKey] = useState(data.profile.supabaseAnonKey || '');
  const [syncEnabled, setSyncEnabled] = useState(data.profile.cloudSyncEnabled);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Profile Save Banner
  const [savedBanner, setSavedBanner] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // SQL snippet copy state
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      college: college.trim(),
      major: major.trim(),
      year: year.trim(),
      semester: semester.trim(),
      targetGpa: targetGpa.trim(),
      dailyStudyTargetHours: Number(studyTarget),
      dailyCodingGoal: Number(codingGoal),
      defaultPomodoroFocus: Number(pomodoroFocus),
      soundEnabled,
      dailyFocusIntention: dailyIntention.trim(),
      supabaseUrl: sbUrl.trim() || undefined,
      supabaseAnonKey: sbKey.trim() || undefined,
      cloudSyncEnabled: syncEnabled,
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!sbUrl || !sbKey) {
      setTestResult({ status: 'error', message: 'Please enter both Supabase URL and Anon Key' });
      return;
    }
    setTestResult({ status: 'testing', message: 'Testing connection to Supabase...' });
    const res = await testSupabaseConnection(sbUrl, sbKey);
    if (res.success) {
      setTestResult({ status: 'success', message: res.message });
    } else {
      setTestResult({ status: 'error', message: res.message });
    }
  };

  const handleManualSync = async () => {
    const res = await triggerCloudSync();
    if (res.success) {
      setTestResult({ status: 'success', message: 'Successfully backed up to Supabase Cloud!' });
    } else {
      setTestResult({ status: 'error', message: res.message });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJson(content);
        if (ok) {
          setImportStatus('Data successfully restored from backup!');
        } else {
          setImportStatus('Invalid JSON backup file format.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const SUPABASE_SQL_SNIPPET = `-- Run this in your Supabase SQL Editor to enable cloud backup for LEVEL UP:
CREATE TABLE IF NOT EXISTS public.levelup_backups (
    user_id TEXT PRIMARY KEY,
    profile_name TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payload JSONB NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.levelup_backups ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon access for your application's user
CREATE POLICY "Allow public backup upserts" 
ON public.levelup_backups 
FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile & System Settings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure academic targets, theme, audio feedback, and cloud database synchronization.
          </p>
        </div>

        {savedBanner && (
          <span className="text-xs text-emerald-500 font-bold animate-fade-in flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* STUDENT PROFILE SECTION */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/60 font-bold text-xs uppercase tracking-wider text-zinc-500">
            <User className="w-4 h-4 text-emerald-500" />
            <span>Student Academic Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Major / Degree Program
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Target CGPA / GPA Goal
              </label>
              <input
                type="text"
                value={targetGpa}
                onChange={(e) => setTargetGpa(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
              Daily Focus Intention (Banner on Dashboard)
            </label>
            <input
              type="text"
              value={dailyIntention}
              onChange={(e) => setDailyIntention(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* DAILY TARGETS & PREFERENCES */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/60 font-bold text-xs uppercase tracking-wider text-zinc-500">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Productivity & Pomodoro Defaults</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                step="0.5"
                value={studyTarget}
                onChange={(e) => setStudyTarget(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Daily Coding Goal (Problems)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={codingGoal}
                onChange={(e) => setCodingGoal(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Default Pomodoro Sprint (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="90"
                step="5"
                value={pomodoroFocus}
                onChange={(e) => setPomodoroFocus(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Theme & Audio toggles */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Interface Theme</div>
                <div className="text-[11px] text-zinc-400">Notion/Linear dark or light mode</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                    data.profile.theme !== 'light'
                      ? 'bg-zinc-900 text-white border-zinc-700'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                    data.profile.theme === 'light'
                      ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Web Audio Synthesizer</div>
                <div className="text-[11px] text-zinc-400">Tone chimes on sprint complete & habits</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) sound.playSuccess();
                }}
                className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SUPABASE CLOUD SYNC CONFIGURATION */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-zinc-500">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Supabase PostgreSQL Cloud Synchronization</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                syncEnabled
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              {syncEnabled ? 'Cloud Sync Enabled' : 'Local Storage Mode'}
            </span>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Connect your own Supabase PostgreSQL database to sync daily records across your phone, tablet, and laptop.
            All client credentials remain safely stored in your browser session.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableSyncCheck"
                checked={syncEnabled}
                onChange={(e) => setSyncEnabled(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="enableSyncCheck" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Enable Automatic Cloud Sync
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Test Connection
              </button>

              <button
                type="button"
                onClick={handleManualSync}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Sync Now
              </button>
            </div>
          </div>

          {testResult.status !== 'idle' && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.status === 'success'
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                  : testResult.status === 'error'
                  ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {testResult.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : testResult.status === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Collapsible Supabase SQL Schema Helper */}
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Supabase SQL Table Schema & RLS Policy</span>
              </div>
              <button
                type="button"
                onClick={copySql}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded bg-zinc-950 text-zinc-300 font-mono text-[10px] overflow-x-auto max-h-36">
              {SUPABASE_SQL_SNIPPET}
            </pre>
          </div>
        </div>

        {/* SAVE PROFILE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>

      {/* DATA BACKUP, EXPORT & RESTORE */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800/60 font-bold text-xs uppercase tracking-wider text-zinc-500">
          <Download className="w-4 h-4 text-indigo-500" />
          <span>Local Data Management & Full Export</span>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Export your complete student history, habits, coding logs, and reflections as offline files.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportDataJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Full JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={exportSummaryCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export 30-Day CSV Report</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-amber-500" />
            <span>Import JSON Backup</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all records to fresh realistic demo student data?')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer ml-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Demo Data</span>
          </button>
        </div>

        {importStatus && (
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
};
