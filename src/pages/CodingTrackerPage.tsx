import React, { useState } from 'react';
import {
  Code2,
  Plus,
  Calendar,
  ExternalLink,
  Flame,
  CheckCircle2,
  Trash2,
  BarChart2,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { CodingPlatform, CodingDifficulty, DsaTopic } from '@/types/levelup';

export const CodingTrackerPage: React.FC = () => {
  const { data, today, addCodingProblem, deleteCodingProblem } = useLevelUp();

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<CodingPlatform>('LeetCode');
  const [difficulty, setDifficulty] = useState<CodingDifficulty>('Medium');
  const [topic, setTopic] = useState<DsaTopic>('Dynamic Programming');
  const [problemUrl, setProblemUrl] = useState('');
  const [solutionNotes, setSolutionNotes] = useState('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(30);

  // Filters
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  const topicsList: DsaTopic[] = [
    'Arrays',
    'Strings',
    'Two Pointers',
    'Sliding Window',
    'Linked Lists',
    'Stacks & Queues',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Binary Search',
    'Heap & Priority Queue',
    'Backtracking',
    'Greedy',
    'Bit Manipulation',
    'Tries',
    'Math & Geometry',
    'Other',
  ];

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCodingProblem({
      date: today,
      title: title.trim(),
      platform,
      difficulty,
      topic,
      problemUrl: problemUrl.trim() || undefined,
      solutionNotes: solutionNotes.trim() || undefined,
      timeSpentMinutes: Number(timeSpentMinutes) || undefined,
    });

    setTitle('');
    setProblemUrl('');
    setSolutionNotes('');
    setShowModal(false);
  };

  // Filtered problems
  const filteredProblems = data.codingProblems.filter((p) => {
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false;
    return true;
  });

  // Daily coding goal
  const solvedToday = data.codingProblems.filter((p) => p.date === today).length;
  const goal = data.profile.dailyCodingGoal || 2;
  const goalPercent = Math.min(100, Math.round((solvedToday / goal) * 100));

  // Difficulty counts
  const easyCount = data.codingProblems.filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = data.codingProblems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = data.codingProblems.filter((p) => p.difficulty === 'Hard').length;
  const totalCount = data.codingProblems.length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coding & DSA Problem Tracker</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Log algorithmic problem solving, review patterns, and build technical interview mastery.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Solved Problem</span>
        </button>
      </div>

      {/* DAILY GOAL & STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Daily Goal Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Daily Coding Goal</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {solvedToday}
            </span>
            <span className="text-xs text-zinc-400">/ {goal} problems today</span>
          </div>
          <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>

        {/* Easy Problems */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500 font-medium">Easy Problems</div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-500">{easyCount}</div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {totalCount > 0 ? Math.round((easyCount / totalCount) * 100) : 0}% of portfolio
          </div>
        </div>

        {/* Medium Problems */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500 font-medium">Medium Problems</div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-500">{mediumCount}</div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {totalCount > 0 ? Math.round((mediumCount / totalCount) * 100) : 0}% of portfolio
          </div>
        </div>

        {/* Hard Problems */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="text-xs text-zinc-500 font-medium">Hard Problems</div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-500">{hardCount}</div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {totalCount > 0 ? Math.round((hardCount / totalCount) * 100) : 0}% of portfolio
          </div>
        </div>
      </div>

      {/* TOPIC MASTERY BREAKDOWN STRIP */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Top Algorithm Patterns Practiced</h2>
          </div>
          <span className="text-xs text-zinc-500">{totalCount} total problems cataloged</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {topicsList.slice(0, 10).map((top) => {
            const count = data.codingProblems.filter((p) => p.topic === top).length;
            if (count === 0) return null;
            return (
              <div
                key={top}
                onClick={() => setSelectedTopic(selectedTopic === top ? 'All' : top)}
                className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedTopic === top
                    ? 'bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-700'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <span className="font-medium">{top}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROBLEMS LOG TABLE */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-bold tracking-tight">Solved Problems Log</h2>

          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value="All">All Topics</option>
              {topicsList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold">
              <th className="py-2.5 px-3">Problem</th>
              <th className="py-2.5 px-2">Platform</th>
              <th className="py-2.5 px-2">Difficulty</th>
              <th className="py-2.5 px-2">Topic</th>
              <th className="py-2.5 px-3">Key Solution Concept</th>
              <th className="py-2.5 px-2">Date</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                  No coding problems found matching this filter.{' '}
                  <button onClick={() => setShowModal(true)} className="text-emerald-500 underline font-medium">
                    Log your first problem
                  </button>
                </td>
              </tr>
            ) : (
              filteredProblems.map((prob) => (
                <tr key={prob.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-1.5">
                      <span>{prob.title}</span>
                      {prob.problemUrl && (
                        <a
                          href={prob.problemUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-emerald-500"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[10px]">
                      {prob.platform}
                    </span>
                  </td>

                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        prob.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : prob.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  </td>

                  <td className="py-3 px-2">
                    <span className="text-zinc-500 text-[11px]">{prob.topic}</span>
                  </td>

                  <td className="py-3 px-3 max-w-xs truncate text-zinc-500 dark:text-zinc-400 text-[11px]" title={prob.solutionNotes}>
                    {prob.solutionNotes || '—'}
                  </td>

                  <td className="py-3 px-2 text-zinc-400 text-[11px] whitespace-nowrap">
                    {prob.date === today ? 'Today' : prob.date}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => deleteCodingProblem(prob.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* LOG PROBLEM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4">Log Solved Coding Problem</h3>
            <form onSubmit={handleAddProblem} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3Sum (LeetCode 15)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as CodingPlatform)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="NeetCode">NeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="GFG">GeeksforGeeks</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as CodingDifficulty)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Topic / Pattern
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as DsaTopic)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                >
                  {topicsList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Problem URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={problemUrl}
                  onChange={(e) => setProblemUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
                  Key Intuition / Solution Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sort array then use 2 pointers. Skip duplicate elements."
                  value={solutionNotes}
                  onChange={(e) => setSolutionNotes(e.target.value)}
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
                  Log Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
