import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Wind, Gamepad2, Eye, X, ArrowRight, Sparkles } from 'lucide-react';

interface QuickBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickBreakModal: React.FC<QuickBreakModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (tab: string) => {
    onClose();
    navigate('/games');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Take a Quick Break</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Restore your working memory and reset your nervous system without falling into addictive scrolling loops.
        </p>

        <div className="space-y-2.5">
          {/* Option 1: Calm Breathing */}
          <div
            onClick={() => handleSelect('breathing')}
            className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">2-Minute Calm Box Breathing</div>
                <div className="text-[11px] text-zinc-400">Lowers cortisol and grounds your nervous system</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
          </div>

          {/* Option 2: Brain Games */}
          <div
            onClick={() => handleSelect('games')}
            className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Play Quick Brain Game</div>
                <div className="text-[11px] text-zinc-400">Memory Match, Sudoku, or Reaction Speed test</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
          </div>

          {/* Option 3: Non-Screen Break */}
          <div
            onClick={() => handleSelect('nonscreen')}
            className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 bg-zinc-50/50 dark:bg-zinc-900/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">5-Minute Non-Screen Eye Rest</div>
                <div className="text-[11px] text-zinc-400">20-20-20 rule, cold water, and shoulder mobility</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
