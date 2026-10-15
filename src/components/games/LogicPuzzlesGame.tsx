import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, ChevronRight, HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { sound } from '@/utils/sound';

interface Puzzle {
  id: string;
  title: string;
  category: string;
  question: string;
  hint: string;
  solution: string;
  options?: string[];
  correctAnswer: string;
}

const PUZZLES: Puzzle[] = [
  {
    id: 'puz-1',
    title: 'The 3 Light Switches & Attic Bulb',
    category: 'Lateral Logic',
    question:
      'You are downstairs with 3 switches (A, B, C) that control a single incandescent lightbulb in the attic. You can only walk upstairs once to check the bulb. How can you figure out with certainty which switch controls the bulb?',
    hint: 'Lightbulbs emit more than just light; they also emit physical heat over time.',
    options: [
      'Turn on A for 10 minutes, turn it off, turn on B, then go upstairs.',
      'Turn on all three switches together.',
      'Turn on A and B, wait 1 minute, turn off A.',
      'Flip switches randomly and measure electricity meter downstairs.',
    ],
    correctAnswer: 'Turn on A for 10 minutes, turn it off, turn on B, then go upstairs.',
    solution:
      'Turn on Switch A for 10 minutes, then turn it off. Turn on Switch B and immediately walk upstairs into the attic. If the bulb is ON, Switch B controls it. If the bulb is OFF but WARM to the touch, Switch A controls it. If the bulb is OFF and COLD, Switch C controls it.',
  },
  {
    id: 'puz-2',
    title: 'The 5L and 3L Water Jugs',
    category: 'Algorithmic State Search',
    question:
      'You have an unlimited supply of water, an empty 5-liter jug, and an empty 3-liter jug. Neither jug has measurement markings. How can you measure exactly 4 liters into the 5-liter jug?',
    hint: 'Think about filling the 3L jug and pouring it into the 5L jug twice.',
    options: [
      'Fill 3L, pour into 5L; fill 3L again, fill 5L to brim (leaving 1L in 3L); empty 5L, pour 1L into 5L; fill 3L and add it (1L + 3L = 4L).',
      'Fill 5L halfway by eye and add 1.5L from 3L.',
      'Fill 5L, pour into 3L, dump out 3L, and guess remainder.',
      'Submerge both jugs simultaneously.',
    ],
    correctAnswer:
      'Fill 3L, pour into 5L; fill 3L again, fill 5L to brim (leaving 1L in 3L); empty 5L, pour 1L into 5L; fill 3L and add it (1L + 3L = 4L).',
    solution:
      '1. Fill the 3L jug and pour all of it into the 5L jug (5L jug has 3L).\n2. Fill the 3L jug again and pour into the 5L jug until full. Since it only needed 2L, exactly 1L remains in the 3L jug.\n3. Empty the 5L jug.\n4. Pour the 1L from the 3L jug into the 5L jug.\n5. Fill the 3L jug full and pour it into the 5L jug. 1L + 3L = exactly 4 Liters!',
  },
  {
    id: 'puz-3',
    title: '8 Coins and the Balance Scale',
    category: 'Binary & Divide-and-Conquer',
    question:
      'You have 8 coins that look identical, but 1 coin is counterfeit and weighs slightly less than the other 7. Using a mechanical balance scale, what is the minimum number of weighings guaranteed to find the fake coin?',
    hint: 'Divide the coins into 3 groups (3, 3, 2) rather than 2 groups of 4.',
    options: ['2 weighings', '3 weighings', '4 weighings', '1 weighing'],
    correctAnswer: '2 weighings',
    solution:
      'Weighing 1: Weigh 3 coins against 3 coins, leaving 2 aside. If they balance, the fake coin is one of the 2 unweighed coins (weigh them against each other in Weighing 2 to find it). If one side of 3 is lighter, the fake is in that set of 3. Weighing 2: Take 2 coins from the light set of 3 and weigh them against each other. If one is lighter, that is it; if they balance, the 3rd coin is fake. Exactly 2 weighings guaranteed!',
  },
  {
    id: 'puz-4',
    title: 'The Bridge and Torch at Night',
    category: 'Optimization & Scheduling',
    question:
      'Four people (A, B, C, D) must cross a narrow rope bridge at night with only 1 torch. A takes 1 min, B takes 2 mins, C takes 7 mins, and D takes 10 mins. At most 2 people can cross at a time, moving at the slower person pace. The torch must be carried back and forth. What is the minimum time needed for all 4 to cross?',
    hint: 'Have the two slowest people (C and D) cross together so you do not pay their time cost twice.',
    options: ['17 minutes', '19 minutes', '21 minutes', '15 minutes'],
    correctAnswer: '17 minutes',
    solution:
      '1. A and B cross first (2 min).\n2. A returns with torch (1 min, total 3 min).\n3. C and D cross together (10 min, total 13 min).\n4. B returns with torch (2 min, total 15 min).\n5. A and B cross together (2 min, total 17 min).',
  },
];

export const LogicPuzzlesGame: React.FC = () => {
  const { today, logGameSession, triggerConfetti } = useLevelUp();

  const [activePuzzleId, setActivePuzzleId] = useState<string>(PUZZLES[0].id);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  const activePuzzle = PUZZLES.find((p) => p.id === activePuzzleId) || PUZZLES[0];
  const isAlreadySolved = solvedIds.includes(activePuzzle.id);

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    if (opt === activePuzzle.correctAnswer) {
      sound.playSuccess();
      if (!isAlreadySolved) {
        const nextSolved = [...solvedIds, activePuzzle.id];
        setSolvedIds(nextSolved);
        triggerConfetti();

        logGameSession({
          gameType: 'logic_puzzle',
          gameTitle: 'Logic Puzzle',
          date: today,
          durationSeconds: 60,
          score: `Solved: ${activePuzzle.title}`,
          difficulty: activePuzzle.category,
          notes: `Total puzzles solved: ${nextSolved.length} / ${PUZZLES.length}`,
        });
      }
    } else {
      sound.playTick();
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Puzzle selector pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PUZZLES.map((p, idx) => {
          const solved = solvedIds.includes(p.id);
          const isSelected = p.id === activePuzzle.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setActivePuzzleId(p.id);
                setSelectedOption(null);
                setShowHint(false);
                setShowSolution(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>Puzzle #{idx + 1}</span>
              {solved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Main Puzzle Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111115] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
              {activePuzzle.category}
            </span>
            <h2 className="text-sm sm:text-base font-bold mt-1 text-zinc-900 dark:text-zinc-100">
              {activePuzzle.title}
            </h2>
          </div>

          {isAlreadySolved && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solved</span>
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
          {activePuzzle.question}
        </p>

        {/* Options */}
        {activePuzzle.options && (
          <div className="space-y-2 pt-2">
            {activePuzzle.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === activePuzzle.correctAnswer;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected && isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                      : isSelected && !isCorrect
                      ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="font-mono font-bold text-zinc-400">{String.fromCharCode(65 + i)}.</span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Hint and Solution Controls */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Hint' : 'View Hint'}</span>
          </button>

          <button
            onClick={() => setShowSolution(!showSolution)}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold cursor-pointer"
          >
            {showSolution ? 'Hide Solution' : 'Reveal Solution'}
          </button>
        </div>

        {showHint && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs italic">
            <strong>Hint:</strong> {activePuzzle.hint}
          </div>
        )}

        {showSolution && (
          <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1 text-zinc-700 dark:text-zinc-300">
            <div className="font-bold text-emerald-500">Full Mathematical & Logical Explanation:</div>
            <div className="whitespace-pre-line leading-relaxed">{activePuzzle.solution}</div>
          </div>
        )}
      </div>
    </div>
  );
};
