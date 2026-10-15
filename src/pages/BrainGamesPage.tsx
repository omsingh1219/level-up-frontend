import React, { useState } from 'react';
import {
  Gamepad2,
  Grid,
  Zap,
  Type,
  HelpCircle,
  Wind,
  Coffee,
  Trophy,
  History,
  Trash2,
  Sparkles,
  Info,
} from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { MemoryMatchGame } from '@/components/games/MemoryMatchGame';
import { SudokuGame } from '@/components/games/SudokuGame';
import { ReactionTimeGame } from '@/components/games/ReactionTimeGame';
import { WordScrambleGame } from '@/components/games/WordScrambleGame';
import { LogicPuzzlesGame } from '@/components/games/LogicPuzzlesGame';
import { CalmBreathing } from '@/components/games/CalmBreathing';
import { NonScreenBreakGuide } from '@/components/games/NonScreenBreakGuide';

type GameTab = 'memory' | 'sudoku' | 'reaction' | 'word' | 'logic' | 'breathing' | 'nonscreen';

export const BrainGamesPage: React.FC = () => {
  const { data, deleteGameSession } = useLevelUp();

  const [activeTab, setActiveTab] = useState<GameTab>('memory');

  const TABS = [
    { id: 'memory', label: 'Memory Match', icon: Grid, badge: '4x4' },
    { id: 'sudoku', label: 'Sudoku', icon: Gamepad2, badge: '3 Levels' },
    { id: 'reaction', label: 'Reaction Test', icon: Zap, badge: 'Reflex' },
    { id: 'word', label: 'Word Scramble', icon: Type, badge: 'CS Words' },
    { id: 'logic', label: 'Logic Puzzles', icon: HelpCircle, badge: 'Puzzles' },
    { id: 'breathing', label: 'Calm Breathing', icon: Wind, badge: 'Breath' },
    { id: 'nonscreen', label: 'Non-Screen Break', icon: Coffee, badge: 'Physical' },
  ];

  const gameSessions = data.gameSessions || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brain Games & Rest Breaks</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Reset mental fatigue between deep focus sprints with short puzzles, reflex tests, and mindful breathing.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Non-addictive, intentional study breaks</span>
        </div>
      </div>

      {/* GAME SELECTOR PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as GameTab)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-white dark:bg-[#111115] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-emerald-500" />
              <span>{tab.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected
                    ? 'bg-white/20 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE GAME CANVAS CONTAINER */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        {activeTab === 'memory' && <MemoryMatchGame />}
        {activeTab === 'sudoku' && <SudokuGame />}
        {activeTab === 'reaction' && <ReactionTimeGame />}
        {activeTab === 'word' && <WordScrambleGame />}
        {activeTab === 'logic' && <LogicPuzzlesGame />}
        {activeTab === 'breathing' && <CalmBreathing />}
        {activeTab === 'nonscreen' && <NonScreenBreakGuide />}
      </div>

      {/* USER GAME SESSIONS HISTORY TABLE */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/80 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold tracking-tight">Personal Break & Game History</h2>
          </div>
          <span className="text-xs text-zinc-400">{gameSessions.length} sessions logged</span>
        </div>

        <table className="w-full text-left text-xs min-w-[650px]">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-semibold">
              <th className="py-2.5 px-3">Activity</th>
              <th className="py-2.5 px-2">Type</th>
              <th className="py-2.5 px-2">Duration</th>
              <th className="py-2.5 px-3">Score / Result</th>
              <th className="py-2.5 px-2">Date</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {gameSessions.map((session) => (
              <tr key={session.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                  {session.gameTitle}
                </td>
                <td className="py-3 px-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-500">
                    {session.gameType}
                  </span>
                </td>
                <td className="py-3 px-2 text-zinc-500">
                  {session.durationSeconds >= 60
                    ? `${Math.floor(session.durationSeconds / 60)}m ${session.durationSeconds % 60}s`
                    : `${session.durationSeconds}s`}
                </td>
                <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                  {session.score}
                </td>
                <td className="py-3 px-2 text-zinc-400 text-[11px] whitespace-nowrap">
                  {session.date}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => deleteGameSession(session.id)}
                    className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {gameSessions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                  No break games or exercises recorded yet. Play a round above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-zinc-400 text-center">
        * Note: These activities provide quick restful cognitive diversion. They are not intended as clinical diagnostic
        or medical tools.
      </p>
    </div>
  );
};
