import React, { useState, useEffect } from 'react';
import { RotateCcw, Lightbulb, CheckCircle2, Trophy, HelpCircle, ArrowRight } from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { sound } from '@/utils/sound';

interface WordItem {
  word: string;
  hint: string;
  category: string;
}

const WORDS: WordItem[] = [
  { word: 'ALGORITHM', hint: 'A step-by-step procedure for solving a mathematical or computational problem.', category: 'CS' },
  { word: 'RECURSION', hint: 'A programming concept where a function invokes itself to solve smaller subproblems.', category: 'Coding' },
  { word: 'DISCIPLINE', hint: 'The practice of training yourself to do what matters most over instant gratification.', category: 'Mindset' },
  { word: 'CONSISTENCY', hint: 'Doing the required work day after day, regardless of fleeting motivation.', category: 'Productivity' },
  { word: 'DATABASE', hint: 'An organized collection of structured data stored electronically.', category: 'Systems' },
  { word: 'HEURISTIC', hint: 'A practical method or mental shortcut that is not guaranteed to be optimal but sufficient for immediate goals.', category: 'Logic' },
  { word: 'SYNAPSE', hint: 'The junction between two nerve cells across which impulses pass.', category: 'Neuroscience' },
  { word: 'COMPILER', hint: 'A program that translates source code into machine-executable instructions.', category: 'Systems' },
  { word: 'DOPAMINE', hint: 'A neurotransmitter involved in reward, motivation, and goal pursuit.', category: 'Biology' },
  { word: 'PARADIGM', hint: 'A typical example or pattern of something; a model or worldview.', category: 'Philosophy' },
];

export const WordScrambleGame: React.FC = () => {
  const { today, logGameSession, triggerConfetti } = useLevelUp();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scrambled, setScrambled] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const currentWordObj = WORDS[currentIndex];

  const scramble = (w: string): string => {
    const letters = w.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    // Prevent accidental match
    if (letters.join('') === w) return scramble(w);
    return letters.join('');
  };

  useEffect(() => {
    setScrambled(scramble(currentWordObj.word));
    setUserInput('');
    setShowHint(false);
    setIsCorrect(false);
  }, [currentIndex, currentWordObj.word]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    if (userInput.trim().toUpperCase() === currentWordObj.word) {
      sound.playSuccess();
      setIsCorrect(true);
      const nextScore = score + 1;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);

      if (nextStreak === 3 || nextStreak === 5) {
        triggerConfetti();
      }

      logGameSession({
        gameType: 'word_scramble',
        gameTitle: 'Word Scramble',
        date: today,
        durationSeconds: 30,
        score: `Word solved: ${currentWordObj.word} (${nextScore} total)`,
        difficulty: currentWordObj.category,
        notes: `Current streak: ${nextStreak}`,
      });
    } else {
      sound.playTick();
    }
  };

  const nextWord = () => {
    setCurrentIndex((prev) => (prev + 1) % WORDS.length);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-4">
          <div>
            Score: <strong className="text-emerald-500">{score}</strong>
          </div>
          <div>
            Streak: <strong className="text-amber-500">{streak} 🔥</strong>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {currentWordObj.category}
          </span>
        </div>

        <button
          onClick={nextWord}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Scramble Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111115] border border-zinc-200 dark:border-zinc-800 text-center shadow-xs">
        <div className="text-xs text-zinc-400 font-semibold mb-3 uppercase tracking-wider">
          Unscramble this concept:
        </div>

        {/* Scrambled letter tiles */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-4">
          {scrambled.split('').map((letter, i) => (
            <span
              key={i}
              className="w-9 h-11 sm:w-10 sm:h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-mono font-black text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 shadow-xs"
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2 max-w-sm mx-auto">
          <input
            type="text"
            required
            autoFocus
            disabled={isCorrect}
            placeholder="Type unscrambled word..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.toUpperCase())}
            className="flex-1 px-3 py-2 text-xs font-mono font-bold tracking-widest text-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />

          {!isCorrect ? (
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              Check
            </button>
          ) : (
            <button
              type="button"
              onClick={nextWord}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {isCorrect && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Correct! Excellent cognitive decoding.</span>
          </div>
        )}

        {/* Hint Section */}
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Hint' : 'Need a Clue?'}</span>
          </button>

          {showHint && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 max-w-md italic">
              "{currentWordObj.hint}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
