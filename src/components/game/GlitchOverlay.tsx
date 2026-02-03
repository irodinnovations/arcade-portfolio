'use client';

import { useState, useEffect } from 'react';
import { GLITCH_SYMBOLS, GLITCH_PHASE_1, GLITCH_PHASE_2, GLITCH_DURATION } from './constants';

interface GlitchOverlayProps {
  active: boolean;
  onComplete: () => void;
  playSound: (type: 'navigate' | 'countdown' | 'launch') => void;
  playVoice: (name: string) => void;
  onShake: () => void;
}

export function GlitchOverlay({
  active,
  onComplete,
  playSound,
  playVoice,
  onShake,
}: GlitchOverlayProps) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'glitch' | 'warning' | 'reveal' | 'done'>('glitch');

  useEffect(() => {
    if (!active) {
      setPhase('glitch');
      setText('');
      return;
    }

    // Phase 1: Random glitch symbols (0-3s)
    const glitchInterval = setInterval(() => {
      let glitchText = '';
      for (let i = 0; i < 15; i++) {
        glitchText += GLITCH_SYMBOLS[Math.floor(Math.random() * GLITCH_SYMBOLS.length)];
      }
      setText(glitchText);
      if (Math.random() < 0.2) playSound('navigate');
    }, 100);

    // Phase 2: Warning (3-5s)
    const warningTimer = setTimeout(() => {
      setPhase('warning');
      playSound('countdown');
    }, GLITCH_PHASE_1);

    // Phase 3: Reveal (5-7s)
    const revealTimer = setTimeout(() => {
      clearInterval(glitchInterval);
      setPhase('reveal');
      setText('BEWARE, I BUILD!');
      playVoice('beware');
      playSound('launch');
      onShake();
    }, GLITCH_PHASE_2);

    // Complete
    const completeTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, GLITCH_DURATION);

    return () => {
      clearInterval(glitchInterval);
      clearTimeout(warningTimer);
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [active, onComplete, playSound, playVoice, onShake]);

  if (!active || phase === 'done') return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-all duration-300
        ${phase === 'warning' ? 'bg-red-900/90' : 'bg-black/95'}
      `}
    >
      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)]" />

      {/* Glitch text container */}
      <div className="relative">
        {/* Red offset */}
        <div
          className={`
            absolute font-orbitron font-bold text-red-500/50
            ${phase === 'reveal' ? 'text-4xl md:text-6xl' : 'text-2xl md:text-4xl'}
          `}
          style={{
            transform: phase !== 'reveal' ? 'translate(2px, -2px)' : 'translate(3px, -3px)',
          }}
        >
          {text}
        </div>

        {/* Cyan offset */}
        <div
          className={`
            absolute font-orbitron font-bold text-cyan-500/50
            ${phase === 'reveal' ? 'text-4xl md:text-6xl' : 'text-2xl md:text-4xl'}
          `}
          style={{
            transform: phase !== 'reveal' ? 'translate(-2px, 2px)' : 'translate(-3px, 3px)',
          }}
        >
          {text}
        </div>

        {/* Main text */}
        <div
          className={`
            relative font-orbitron font-bold
            ${phase === 'reveal' ? 'text-4xl md:text-6xl' : 'text-2xl md:text-4xl'}
            ${phase === 'warning' ? 'text-red-400' : 'text-green-400'}
            ${phase === 'reveal' ? 'animate-pulse text-amber-400' : ''}
          `}
          style={{
            textShadow:
              phase === 'reveal'
                ? '0 0 20px rgba(255, 180, 0, 0.8), 0 0 40px rgba(255, 100, 0, 0.5)'
                : '0 0 10px currentColor',
          }}
        >
          {text}
        </div>
      </div>

      {/* Warning flash */}
      {phase === 'warning' && (
        <div className="absolute inset-0 animate-pulse bg-red-500/10" />
      )}

      {/* Skip hint */}
      <div className="absolute bottom-8 text-center text-sm text-white/50">
        Press ESC to skip
      </div>
    </div>
  );
}
