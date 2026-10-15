import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { useLevelUp } from '@/contexts/LevelUpContext';
import { sound } from '@/utils/sound';

interface CardItem {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = [
  { symbol: '💻', name: 'Terminal' },
  { symbol: '⚡', name: 'Algorithm' },
  { symbol: '🧠', name: 'Synapse' },
  { symbol: '💾', name: 'Database' },
  { symbol: '🌐', name: 'Network' },
  { symbol: '🚀', name: 'Deploy' },
  { symbol: '🔒', name: 'Crypto' },
  { symbol: '⚙️', name: 'Compiler' },
];

export const MemoryMatchGame: React.FC = () => {
  const { today, logGameSession, triggerConfetti } = useLevelUp();

  const generateCards = (): CardItem[] => {
    const deck = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        id: index,
        symbol: item.symbol,
        name: item.name,
        isFlipped: false,
        isMatched: false,
      }));
    return deck;
  };

  const [cards, setCards] = useState<CardItem[]>(generateCards);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, isWon]);

  // Check matching pair
  useEffect(() => {
    if (selectedCards.length === 2) {
      const [firstIdx, secondIdx] = selectedCards;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      setMoves((m) => m + 1);

      if (firstCard.name === secondCard.name) {
        sound.playSuccess();
        setCards((prev) =>
          prev.map((c, idx) =>
            idx === firstIdx || idx === secondIdx ? { ...c, isMatched: true, isFlipped: true } : c
          )
        );
        setMatches((m) => {
          const nextMatches = m + 1;
          if (nextMatches === SYMBOLS.length) {
            handleWin();
          }
          return nextMatches;
        });
        setSelectedCards([]);
      } else {
        const timeout = setTimeout(() => {
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
        }, 850);
        return () => clearTimeout(timeout);
      }
    }
  }, [selectedCards, cards]);

  const handleWin = () => {
    setIsWon(true);
    sound.playTimerComplete();
    triggerConfetti();

    const duration = Math.floor((Date.now() - startTime) / 1000);
    logGameSession({
      gameType: 'memory',
      gameTitle: 'Memory Match',
      date: today,
      durationSeconds: duration,
      score: `${moves + 1} moves in ${duration}s`,
      difficulty: 'Standard (4x4)',
      notes: `Matched all ${SYMBOLS.length} pairs cleanly.`,
    });
  };

  const handleCardClick = (index: number) => {
    if (selectedCards.length >= 2) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    sound.playTick();
    setCards((prev) => prev.map((c, idx) => (idx === index ? { ...c, isFlipped: true } : c)));
    setSelectedCards((prev) => [...prev, index]);
  };

  const restartGame = () => {
    setCards(generateCards());
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setIsWon(false);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Game Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Time: <strong className="text-zinc-900 dark:text-zinc-100">{elapsedSeconds}s</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <span>Moves: <strong className="text-zinc-900 dark:text-zinc-100">{moves}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <span>Pairs: <strong className="text-emerald-500">{matches} / {SYMBOLS.length}</strong></span>
          </div>
        </div>

        <button
          onClick={restartGame}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <div className="font-bold text-sm">Working Memory Victory!</div>
              <div>Completed in {moves} moves ({elapsedSeconds} seconds). Session saved to your history!</div>
            </div>
          </div>
          <button
            onClick={restartGame}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
          >
            Play Again
          </button>
        </div>
      )}

      {/* 4x4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
        {cards.map((card, index) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={isRevealed || isWon}
              className={`h-20 sm:h-24 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none text-2xl sm:text-3xl ${
                card.isMatched
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 opacity-90 scale-95'
                  : isRevealed
                  ? 'bg-zinc-100 dark:bg-zinc-800 border-indigo-500/50 scale-100 shadow-md ring-1 ring-indigo-500/20'
                  : 'bg-white dark:bg-[#141418] border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:scale-[1.02] shadow-xs'
              }`}
              aria-label={isRevealed ? card.name : `Card ${index + 1}`}
            >
              {isRevealed ? (
                <>
                  <span>{card.symbol}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-zinc-500 mt-1 font-mono">
                    {card.name}
                  </span>
                </>
              ) : (
                <span className="text-zinc-300 dark:text-zinc-700 text-sm font-black">?</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-zinc-400 text-center">
        Short visual memory match break. Flip two cards at a time to find identical tech pairs.
      </p>
    </div>
  );
};
