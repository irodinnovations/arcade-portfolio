'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', className = '', ...props }, ref) {
    const baseClasses =
      'px-6 py-2 font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 rounded disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#050810]';

    const variantClasses =
      variant === 'primary'
        ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] hover:-translate-y-0.5'
        : 'bg-transparent text-white border border-[#1a2545] hover:border-cyan-400 hover:text-cyan-400';

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${className}`}
        {...props}
      />
    );
  }
);
