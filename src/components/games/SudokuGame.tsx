import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Lightbulb, Clock, CheckCircle2, Trophy, AlertCircle } from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { sound } from '@/utils/sound';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

// Valid 9x9 Sudoku solutions and puzzles for each difficulty
const PUZZLES: Record<Difficulty, { initial: number[][]; solution: number[][] }> = {
  Easy: {
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  Medium: {
    initial: [
      [0, 0, 0, 6, 0, 0, 4, 0, 0],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 0, 0, 0, 9, 1, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 1, 8, 0, 0, 0, 3],
      [0, 0, 0, 3, 0, 6, 0, 4, 5],
      [0, 4, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 1, 0, 0],
    ],
    solution: [
      [5, 8, 1, 6, 7, 2, 4, 3, 9],
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 1, 6],
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 8, 5, 2, 4],
      [6, 2, 7, 4, 3, 5, 1, 9, 8],
    ],
  },
  Hard: {
    initial: [
      [0, 0, 0, 0, 0, 0, 0, 1, 2],
      [0, 0, 0, 0, 3, 5, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 0, 0, 0, 0, 0, 7, 0],
      [0, 0, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 5, 4, 0, 0, 0, 0],
      [1, 8, 0, 0, 0, 0, 0, 0, 0],
    ],
    solution: [
      [6, 7, 3, 8, 9, 4, 5, 1, 2],
      [9, 4, 8, 2, 3, 5, 1, 6, 7],
      [5, 2, 1, 6, 7, 8, 4, 3, 9],
      [7, 5, 4, 9, 8, 2, 6, 0, 1],
      [8, 3, 9, 7, 1, 6, 2, 5, 4],
      [2, 1, 6, 4, 5, 3, 9, 7, 8],
      [4, 9, 5, 1, 2, 7, 3, 8, 6],
      [3, 6, 7, 5, 4, 1, 8, 9, 0],
      [1, 8, 2, 3, 6, 9, 7, 4, 5],
    ],
  },
};

export const SudokuGame: React.FC = () => {
  const { today, logGameSession, triggerConfetti } = useLevelUp();

  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [board, setBoard] = useState<number[][]>(() =>
    PUZZLES.Easy.initial.map((row) => [...row])
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [mistakes, setMistakes] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const currentPuzzle = PUZZLES[difficulty];

  // Reset or Switch difficulty
  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    setDifficulty(diff);
    setBoard(PUZZLES[diff].initial.map((row) => [...row]));
    setSelectedCell(null);
    setHintsLeft(3);
    setMistakes(0);
    setElapsedSeconds(0);
    setIsWon(false);
    setStartTime(Date.now());
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isWon]);

  // Check victory
  const checkWinCondition = useCallback(
    (currentBoard: number[][]) => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (currentBoard[r][c] !== currentPuzzle.solution[r][c]) {
            return false;
          }
        }
      }
      return true;
    },
    [currentPuzzle.solution]
  );

  // Set number in selected cell
  const handleInputNumber = useCallback(
    (num: number) => {
      if (!selectedCell || isWon) return;
      const [r, c] = selectedCell;

      // Cannot modify initial given numbers
      if (currentPuzzle.initial[r][c] !== 0) return;

      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = num;
      setBoard(newBoard);

      if (num !== 0 && num !== currentPuzzle.solution[r][c]) {
        setMistakes((m) => m + 1);
        sound.playTick();
      } else if (num !== 0) {
        sound.playSuccess();
      }

      if (num !== 0 && checkWinCondition(newBoard)) {
        setIsWon(true);
        sound.playTimerComplete();
        triggerConfetti();

        const duration = Math.floor((Date.now() - startTime) / 1000);
        logGameSession({
          gameType: 'sudoku',
          gameTitle: 'Sudoku Number Puzzle',
          date: today,
          durationSeconds: duration,
          score: `Solved in ${Math.floor(duration / 60)}m ${duration % 60}s (${mistakes} errors)`,
          difficulty,
          notes: `Cleared 9x9 Sudoku on ${difficulty} difficulty.`,
        });
      }
    },
    [selectedCell, isWon, currentPuzzle, board, checkWinCondition, startTime, difficulty, mistakes, today, logGameSession, triggerConfetti]
  );

  // Use hint
  const handleUseHint = () => {
    if (hintsLeft <= 0 || isWon) return;

    // Find empty cell or mistaken cell
    const candidates: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (
          currentPuzzle.initial[r][c] === 0 &&
          board[r][c] !== currentPuzzle.solution[r][c]
        ) {
          candidates.push([r, c]);
        }
      }
    }

    if (candidates.length === 0) return;
    const [hr, hc] = candidates[Math.floor(Math.random() * candidates.length)];
    const correctVal = currentPuzzle.solution[hr][hc];

    const newBoard = board.map((row) => [...row]);
    newBoard[hr][hc] = correctVal;
    setBoard(newBoard);
    setSelectedCell([hr, hc]);
    setHintsLeft((h) => h - 1);
    sound.playSuccess();

    if (checkWinCondition(newBoard)) {
      setIsWon(true);
      sound.playTimerComplete();
      triggerConfetti();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon) return;
      if (e.key >= '1' && e.key <= '9') {
        handleInputNumber(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleInputNumber(0);
      } else if (e.key === 'ArrowUp' && selectedCell && selectedCell[0] > 0) {
        setSelectedCell([selectedCell[0] - 1, selectedCell[1]]);
      } else if (e.key === 'ArrowDown' && selectedCell && selectedCell[0] < 8) {
        setSelectedCell([selectedCell[0] + 1, selectedCell[1]]);
      } else if (e.key === 'ArrowLeft' && selectedCell && selectedCell[1] > 0) {
        setSelectedCell([selectedCell[0], selectedCell[1] - 1]);
      } else if (e.key === 'ArrowRight' && selectedCell && selectedCell[1] < 8) {
        setSelectedCell([selectedCell[0], selectedCell[1] + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isWon, handleInputNumber]);

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-500">Difficulty:</span>
          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => startNewGame(d)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                difficulty === d
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-zinc-500">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</span>
          </div>

          <div className="text-zinc-500">
            Errors: <strong className="text-rose-500">{mistakes}</strong>
          </div>

          <button
            onClick={() => startNewGame()}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            title="Reset Puzzle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <div className="font-bold text-sm">Sudoku Solved!</div>
              <div>Completed on {difficulty} in {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s.</div>
            </div>
          </div>
          <button
            onClick={() => startNewGame()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
          >
            Play Next
          </button>
        </div>
      )}

      {/* 9x9 SUDOKU BOARD */}
      <div className="aspect-square w-full max-w-[420px] mx-auto border-2 border-zinc-400 dark:border-zinc-700 rounded-lg overflow-hidden grid grid-cols-9 bg-white dark:bg-[#111115] shadow-xs">
        {board.map((row, rIdx) =>
          row.map((cellVal, cIdx) => {
            const isInitial = currentPuzzle.initial[rIdx][cIdx] !== 0;
            const isSelected = selectedCell?.[0] === rIdx && selectedCell?.[1] === cIdx;
            const isError =
              !isInitial && cellVal !== 0 && cellVal !== currentPuzzle.solution[rIdx][cIdx];

            // Border styling for 3x3 box borders
            const isRightBoxBorder = (cIdx + 1) % 3 === 0 && cIdx !== 8;
            const isBottomBoxBorder = (rIdx + 1) % 3 === 0 && rIdx !== 8;

            return (
              <button
                key={`${rIdx}-${cIdx}`}
                onClick={() => setSelectedCell([rIdx, cIdx])}
                className={`flex items-center justify-center font-mono font-bold text-sm sm:text-base transition-colors cursor-pointer border-r border-b border-zinc-200 dark:border-zinc-800 ${
                  isRightBoxBorder ? 'border-r-2 border-r-zinc-400 dark:border-r-zinc-600' : ''
                } ${
                  isBottomBoxBorder ? 'border-b-2 border-b-zinc-400 dark:border-b-zinc-600' : ''
                } ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500 ring-inset'
                    : isInitial
                    ? 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-900 dark:text-zinc-100'
                    : isError
                    ? 'bg-rose-500/10 text-rose-500'
                    : cellVal !== 0
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
                aria-label={`Row ${rIdx + 1}, Column ${cIdx + 1}, Value ${cellVal || 'empty'}`}
              >
                {cellVal !== 0 ? cellVal : ''}
              </button>
            );
          })
        )}
      </div>

      {/* Number Keypad & Action Bar */}
      <div className="flex items-center justify-between gap-1 max-w-[420px] mx-auto pt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleInputNumber(num)}
            className="flex-1 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-mono font-bold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => handleInputNumber(0)}
          className="px-2.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold cursor-pointer"
          title="Clear Cell"
        >
          ✕
        </button>

        <button
          onClick={handleUseHint}
          disabled={hintsLeft <= 0}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            hintsLeft > 0
              ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
              : 'opacity-40 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
          }`}
          title="Use Hint"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{hintsLeft}</span>
        </button>
      </div>

      <p className="text-[11px] text-zinc-400 text-center">
        Tip: You can use your computer's number keys 1–9 and Backspace to enter numbers directly.
      </p>
    </div>
  );
};
