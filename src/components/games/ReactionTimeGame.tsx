import React, { useState, useRef, useEffect } from 'react';
import { Zap, RotateCcw, Trophy, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { sound } from '@/utils/sound';

type GameState = 'idle' | 'waiting' | 'ready' | 'early' | 'result';

export const ReactionTimeGame: React.FC = () => {
  const { today, logGameSession, triggerConfetti } = useLevelUp();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const timerRef = useRef<any>(null);
  const greenTimestampRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClickArea = () => {
    if (gameState === 'idle' || gameState === 'result' || gameState === 'early') {
      // Start waiting state
      setGameState('waiting');
      const randomDelay = Math.floor(Math.random() * 2500) + 1500; // 1.5s - 4.0s

      timerRef.current = setTimeout(() => {
        setGameState('ready');
        greenTimestampRef.current = performance.now();
      }, randomDelay);
    } else if (gameState === 'waiting') {
      // Clicked too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('early');
      sound.playTick();
    } else if (gameState === 'ready') {
      // Successful click
      const diff = Math.round(performance.now() - greenTimestampRef.current);
      setReactionTime(diff);
      sound.playSuccess();

      const newAttempts = [...attempts, diff];
      setAttempts(newAttempts);

      if (!bestTime || diff < bestTime) {
        setBestTime(diff);
      }

      setGameState('result');

      // If finished 5 rounds, celebrate and log
      if (newAttempts.length === 5) {
        const avg = Math.round(newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length);
        triggerConfetti();
        logGameSession({
          gameType: 'reaction',
          gameTitle: 'Reaction Time Test',
          date: today,
          durationSeconds: 30,
          score: `${avg} ms 5-round average`,
          difficulty: 'Standard',
          notes: `Personal best: ${Math.min(...newAttempts)} ms`,
        });
      }
    }
  };

  const resetAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState('idle');
    setReactionTime(null);
    setAttempts([]);
  };

  const average =
    attempts.length > 0
      ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
      : null;

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Header metrics */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-4">
          <div>
            Round: <strong className="text-zinc-900 dark:text-zinc-100">{attempts.length} / 5</strong>
          </div>
          {bestTime && (
            <div className="text-emerald-500 font-semibold">
              Best: {bestTime} ms
            </div>
          )}
          {average && (
            <div className="text-indigo-500 font-semibold">
              Average: {average} ms
            </div>
          )}
        </div>

        <button
          onClick={resetAll}
          className="flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Interactive Touch Surface */}
      <div
        onClick={handleClickArea}
        className={`h-72 sm:h-80 rounded-2xl flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none transition-all duration-150 ${
          gameState === 'idle'
            ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md'
            : gameState === 'waiting'
            ? 'bg-rose-600 text-white'
            : gameState === 'ready'
            ? 'bg-emerald-500 text-zinc-950 font-black scale-[1.01] shadow-xl'
            : gameState === 'early'
            ? 'bg-amber-500 text-zinc-950'
            : 'bg-indigo-600 text-white'
        }`}
      >
        {gameState === 'idle' && (
          <>
            <Zap className="w-12 h-12 mb-3 text-amber-400 animate-pulse" />
            <div className="text-xl sm:text-2xl font-black">Reaction Speed Test</div>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs">
              When the screen turns <strong className="text-emerald-400">GREEN</strong>, click as fast as humanly possible.
            </p>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-xs font-semibold">
              Tap anywhere to start
            </div>
          </>
        )}

        {gameState === 'waiting' && (
          <>
            <div className="w-4 h-4 rounded-full bg-white animate-ping mb-3" />
            <div className="text-2xl sm:text-3xl font-black">Wait for green...</div>
            <p className="text-xs text-rose-200 mt-2">Do not click yet!</p>
          </>
        )}

        {gameState === 'ready' && (
          <>
            <div className="text-4xl sm:text-5xl font-black tracking-tight">CLICK NOW!</div>
          </>
        )}

        {gameState === 'early' && (
          <>
            <AlertCircle className="w-12 h-12 mb-2 text-zinc-950" />
            <div className="text-2xl font-black">Too early!</div>
            <p className="text-xs mt-1">You clicked while the screen was still red.</p>
            <div className="mt-3 text-xs font-bold underline">Click to try again</div>
          </>
        )}

        {gameState === 'result' && (
          <>
            <div className="text-5xl sm:text-6xl font-mono font-black">{reactionTime} ms</div>
            <div className="text-xs uppercase tracking-wider font-semibold mt-2 text-indigo-200">
              {reactionTime! < 200
                ? '⚡ Elite Reflexes!'
                : reactionTime! < 250
                ? '✨ Fast Reaction!'
                : reactionTime! < 300
                ? '👍 Solid Reflexes'
                : 'Pacing yourself'}
            </div>
            <p className="text-xs mt-4 text-white/80">Click anywhere for next attempt</p>
          </>
        )}
      </div>

      {/* Attempts History Pills */}
      {attempts.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          {attempts.map((t, idx) => (
            <span
              key={idx}
              className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
            >
              #{idx + 1}: {t}ms
            </span>
          ))}
        </div>
      )}

      <p className="text-[11px] text-zinc-400 text-center">
        The average human reaction time to visual stimuli is roughly 250 milliseconds.
      </p>
    </div>
  );
};
