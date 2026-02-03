'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Background() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      {/* Gradient background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(0, 212, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse at 30% 70%, rgba(0, 100, 200, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(0, 150, 255, 0.05) 0%, transparent 40%),
            linear-gradient(180deg, #050810 0%, #0a1020 50%, #050810 100%)
          `,
        }}
        aria-hidden="true"
      />

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
    </>
  );
}
