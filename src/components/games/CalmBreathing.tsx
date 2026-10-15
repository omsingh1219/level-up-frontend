import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { sound } from '@/utils/sound';

type BreathingPattern = 'box' | 'relax';

export const CalmBreathing: React.FC = () => {
  const { today, logGameSession, triggerConfetti } = useLevelUp();

  const [pattern, setPattern] = useState<BreathingPattern>('box');
  const [targetMinutes, setTargetMinutes] = useState<number>(2);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);

  // Box: 4s Inhale, 4s Hold, 4s Exhale, 4s Rest
  // Relax (4-7-8): 4s Inhale, 7s Hold, 8s Exhale
  const phaseDurations = pattern === 'box'
    ? { Inhale: 4, Hold: 4, Exhale: 4, Rest: 4 }
    : { Inhale: 4, Hold: 7, Exhale: 8, Rest: 0 };

  const activeRef = useRef(isActive);
  activeRef.current = isActive;

  useEffect(() => {
    let timer: any = null;
    if (isActive) {
      timer = setInterval(() => {
        setTotalSecondsElapsed((prev) => {
          const next = prev + 1;
          if (next >= targetMinutes * 60) {
            handleComplete();
          }
          return next;
        });

        setPhaseSecondsLeft((currentSeconds) => {
          if (currentSeconds > 1) {
            return currentSeconds - 1;
          }

          // Advance Phase
          setPhase((currentPhase) => {
            if (pattern === 'box') {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Rest';
              setCompletedCycles((c) => c + 1);
              return 'Inhale';
            } else {
              // 4-7-8
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              setCompletedCycles((c) => c + 1);
              return 'Inhale';
            }
          });

          return 4; // default reset
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, pattern, targetMinutes]);

  // Sync phase duration
  useEffect(() => {
    setPhaseSecondsLeft(phaseDurations[phase] || 4);
  }, [phase, pattern]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('Inhale');
    setPhaseSecondsLeft(phaseDurations['Inhale']);
    setCompletedCycles(0);
    setTotalSecondsElapsed(0);
    sound.playSuccess();
  };

  const handlePauseResume = () => {
    setIsActive(!isActive);
  };

  const handleStop = () => {
    setIsActive(false);
    if (totalSecondsElapsed >= 30) {
      handleComplete();
    } else {
      setTotalSecondsElapsed(0);
      setCompletedCycles(0);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    sound.playTimerComplete();
    triggerConfetti();

    logGameSession({
      gameType: 'breathing',
      gameTitle: pattern === 'box' ? 'Calm Box Breathing' : '4-7-8 Relaxing Breath',
      date: today,
      durationSeconds: totalSecondsElapsed || 60,
      score: `${completedCycles} complete breathing cycles (${Math.round(totalSecondsElapsed / 60)}m)`,
      difficulty: pattern === 'box' ? 'Box 4-4-4-4' : 'Relax 4-7-8',
      notes: 'Parasympathetic nervous system reset.',
    });
  };

  // Compute visual circle scale
  let circleScale = 'scale-75';
  let circleRing = 'border-emerald-500/30 bg-emerald-500/10';
  if (phase === 'Inhale') {
    circleScale = 'scale-125';
    circleRing = 'border-emerald-500/60 bg-emerald-500/20 shadow-lg shadow-emerald-500/20';
  } else if (phase === 'Hold') {
    circleScale = 'scale-125 ring-4 ring-indigo-500/30';
    circleRing = 'border-indigo-500/60 bg-indigo-500/20 shadow-lg shadow-indigo-500/20';
  } else if (phase === 'Exhale') {
    circleScale = 'scale-75';
    circleRing = 'border-cyan-500/50 bg-cyan-500/10';
  } else if (phase === 'Rest') {
    circleScale = 'scale-75 ring-2 ring-zinc-500/20';
    circleRing = 'border-zinc-500/30 bg-zinc-500/10';
  }

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      {/* Configuration Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPattern('box');
              setIsActive(false);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
              pattern === 'box'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            Box (4-4-4-4)
          </button>
          <button
            onClick={() => {
              setPattern('relax');
              setIsActive(false);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
              pattern === 'relax'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            4-7-8 Deep Calm
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 5].map((m) => (
            <button
              key={m}
              onClick={() => {
                setTargetMinutes(m);
                setIsActive(false);
              }}
              className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                targetMinutes === m
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Main Animated Breathing Orb */}
      <div className="py-8 flex flex-col items-center justify-center">
        <div
          className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out select-none ${circleScale} ${circleRing}`}
        >
          <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            {isActive ? phase : 'Ready'}
          </span>
          {isActive && (
            <span className="font-mono text-xs font-bold text-zinc-500 mt-1">
              {phaseSecondsLeft}s
            </span>
          )}
        </div>

        <div className="mt-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {isActive ? (
            <span>
              {phase === 'Inhale'
                ? 'Inhale gently through your nose, expanding your belly...'
                : phase === 'Hold'
                ? 'Hold your breath gently, keeping shoulders relaxed...'
                : phase === 'Exhale'
                ? 'Exhale smoothly and completely through your mouth...'
                : 'Rest in quiet stillness before the next breath...'}
            </span>
          ) : (
            <span>Soothes your sympathetic fight-or-flight response. Click start below.</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Begin {targetMinutes}-Min Session</span>
          </button>
        ) : (
          <>
            <button
              onClick={handlePauseResume}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold text-xs cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>End & Log</span>
            </button>
          </>
        )}
      </div>

      {completedCycles > 0 && (
        <div className="text-xs text-emerald-500 font-semibold">
          ✓ {completedCycles} full cycles completed ({totalSecondsElapsed}s elapsed)
        </div>
      )}
    </div>
  );
};
