import React, { forwardRef } from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-zinc-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'block w-full rounded-lg border bg-zinc-900/90 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner transition-colors',
              'focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500',
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500'
                : 'border-zinc-800 hover:border-zinc-700',
              icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-zinc-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
