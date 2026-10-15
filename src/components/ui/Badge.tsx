import React from 'react';
import { cn } from './Button';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'red' | 'blue' | 'zinc' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'zinc',
  size = 'sm',
  className,
}) => {
  const variants = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    zinc: 'bg-zinc-800 text-zinc-300 border-zinc-700/50',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-full border',
    md: 'text-xs px-2.5 py-1 font-medium rounded-md border',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 shrink-0', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm backdrop-blur-sm transition-all',
        onClick && 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-900',
        className
      )}
    >
      {children}
    </div>
  );
};
