'use client';

import Image from 'next/image';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StartScreenProps {
  onStart: () => void;
  isExiting: boolean;
}

export function StartScreen({ onStart, isExiting }: StartScreenProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-[#050810] transition-all duration-500 ${
        isExiting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      }`}
      onClick={onStart}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onStart();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Press to start and view portfolio"
    >
      {/* Tech circles */}
      <div
        className="fixed inset-0 z-[1] overflow-hidden opacity-30"
        aria-hidden="true"
      >
        <div
          className={`absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400 opacity-20 ${
            reducedMotion ? '' : 'animate-[rotate_60s_linear_infinite]'
          }`}
        />
        <div
          className={`absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400 opacity-15 ${
            reducedMotion
              ? ''
              : 'animate-[rotate_45s_linear_infinite_reverse]'
          }`}
        />
        <div
          className={`absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400 opacity-10 ${
            reducedMotion ? '' : 'animate-[rotate_30s_linear_infinite]'
          }`}
        />
      </div>

      <div className="relative z-[2] text-center">
        {/* Logo */}
        <div
          className={`mx-auto mb-8 h-[200px] w-[200px] ${
            reducedMotion ? '' : 'animate-[float_3s_ease-in-out_infinite]'
          }`}
        >
          <Image
            src="/images/rj-logo.png"
            alt="RJ Logo"
            width={200}
            height={200}
            priority
            className="drop-shadow-[0_0_30px_rgba(0,212,255,0.5)]"
          />
        </div>

        {/* Title */}
        <h1 className="mb-2 font-orbitron text-[clamp(2rem,8vw,4rem)] font-black uppercase tracking-[0.15em] text-white [text-shadow:0_0_20px_rgba(0,212,255,0.5),0_0_40px_rgba(0,212,255,0.3)]">
          Rodney John
        </h1>

        {/* Subtitle */}
        <p className="mb-4 font-rajdhani text-[clamp(0.9rem,2.5vw,1.3rem)] font-medium uppercase tracking-[0.3em] text-amber-400">
          Operations Performance Manager
        </p>
        <p className="mb-16 font-rajdhani text-[clamp(0.7rem,2vw,1rem)] font-normal tracking-[0.2em] text-[#5080b0]">
          Analytics & Reporting Systems • Building Data Teams Trust
        </p>

        {/* Press Start */}
        <p
          className={`font-orbitron text-[clamp(0.9rem,2.5vw,1.3rem)] font-semibold uppercase tracking-[0.3em] text-cyan-400 ${
            reducedMotion ? '' : 'animate-[pulseGlow_1.5s_ease-in-out_infinite]'
          }`}
        >
          Press Start
        </p>
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-sm tracking-wider text-[#5080b0]">
        © 2026 RODNEY JOHN — ALL RIGHTS RESERVED
      </p>
    </div>
  );
}
