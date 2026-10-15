import React, { useState, useEffect } from 'react';
import { Eye, Coffee, Activity, Sun, Clock, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { sound } from '@/utils/sound';

export const NonScreenBreakGuide: React.FC = () => {
  const { today, logGameSession, triggerConfetti } = useLevelUp();

  const [secondsLeft, setSecondsLeft] = useState<number>(300); // 5 mins
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            sound.playTimerComplete();
            triggerConfetti();

            logGameSession({
              gameType: 'breathing',
              gameTitle: 'Non-Screen Rest Break',
              date: today,
              durationSeconds: 300,
              score: '5-Minute Zero Screen Reset',
              difficulty: 'Physical Rest',
              notes: 'Eye rest and mobility stretch.',
            });
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, today, logGameSession, triggerConfetti]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const PROTOCOLS = [
    {
      title: '20-20-20 Eye Rest Rule',
      desc: 'Look away from your screen at an object at least 20 feet away for 20 seconds to relax your eye ciliary muscles.',
      icon: Eye,
      color: 'text-indigo-500',
    },
    {
      title: 'Tall Glass of Cold Water',
      desc: 'Head to the kitchen or water dispenser. Mild dehydration impairs cognitive speed by up to 15%.',
      icon: Coffee,
      color: 'text-cyan-500',
    },
    {
      title: 'Neck & Upper-Back Release',
      desc: 'Roll your shoulders backwards 10 times, gently tilt head ear-to-shoulder, and open chest to reverse hunched posture.',
      icon: Activity,
      color: 'text-emerald-500',
    },
    {
      title: 'Natural Daylight & Fresh Air',
      desc: 'Step out onto a balcony, porch, or glance out the window. Natural light resets retinal circadian alertness.',
      icon: Sun,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* 5-Min Timer Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111115] border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
        <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
          Offline Rest Timer
        </span>
        <div className="text-5xl sm:text-6xl font-mono font-black my-2 text-zinc-900 dark:text-white">
          {timeStr}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          Push your chair back, step away from this device, and complete the physical protocols below.
        </p>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Start 5-Min Offline Break'}</span>
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(300);
            }}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Protocols Grid */}
      <div className="space-y-3">
        {PROTOCOLS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-3 text-xs"
            >
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                <Icon className={`w-4 h-4 ${p.color}`} />
              </div>
              <div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100">{p.title}</div>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
