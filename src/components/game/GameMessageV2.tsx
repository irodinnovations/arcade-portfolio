'use client';

import { useEffect, useState } from 'react';
import type { GameStats } from './engine';

interface GameMessageProps {
  type: 'victory' | 'defeat';
  stats: GameStats;
  onRetry: () => void;
  onQuit: () => void;
}

export function GameMessageV2({ type, stats, onRetry, onQuit }: GameMessageProps) {
  const isVictory = type === 'victory';
  const [showStats, setShowStats] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score counter
  useEffect(() => {
    const target = stats.score;
    const duration = 1500;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setAnimatedScore(Math.floor(target * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
      setShowStats(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [stats.score]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Background */}
      <div
        className={`absolute inset-0 ${
          isVictory
            ? 'bg-gradient-to-br from-green-900/90 via-black/95 to-cyan-900/90'
            : 'bg-gradient-to-br from-red-900/90 via-black/95 to-red-950/90'
        }`}
      />

      {/* Animated particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isVictory ? (
          // Victory sparkles
          [...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              <span className="text-xl">✨</span>
            </div>
          ))
        ) : (
          // Defeat embers
          [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 animate-pulse rounded-full bg-red-500/50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))
        )}
      </div>

      {/* Content card */}
      <div
        className={`relative mx-4 max-w-lg transform animate-[slideUp_0.5s_ease-out] rounded-2xl border p-8 backdrop-blur-md ${
          isVictory
            ? 'border-green-500/30 bg-black/60 shadow-[0_0_50px_rgba(0,255,100,0.3)]'
            : 'border-red-500/30 bg-black/60 shadow-[0_0_50px_rgba(255,0,0,0.2)]'
        }`}
      >
        {/* Title */}
        <h2
          className={`mb-6 text-center font-orbitron text-5xl font-black uppercase tracking-wider ${
            isVictory
              ? 'animate-pulse text-green-400 drop-shadow-[0_0_30px_rgba(0,255,100,0.8)]'
              : 'text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]'
          }`}
        >
          {isVictory ? '🏆 VICTORY! 🏆' : '💀 DEFEATED 💀'}
        </h2>

        {/* Message */}
        <p className="mb-6 text-center text-lg text-white/80">
          {isVictory
            ? 'You defeated Rodney the Builder!'
            : stats.bombsUsed === 0 && stats.waveTimer <= 0
              ? "You had no bombs to fight the Builder!"
              : 'The Builder wins this time...'}
        </p>

        {/* Score */}
        <div className="mb-6 text-center">
          <span className="font-rajdhani text-sm uppercase tracking-widest text-amber-400/60">
            Final Score
          </span>
          <div
            className={`font-orbitron text-5xl font-bold tabular-nums ${
              isVictory ? 'text-amber-300' : 'text-amber-400/80'
            }`}
          >
            {animatedScore.toLocaleString()}
          </div>
        </div>

        {/* Stats grid */}
        <div
          className={`mb-8 grid grid-cols-2 gap-4 transition-all duration-500 ${
            showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <StatItem
            label="Enemies Defeated"
            value={stats.enemiesKilled}
            icon="💥"
          />
          <StatItem label="Max Combo" value={`x${stats.maxCombo}`} icon="🔥" />
          <StatItem label="Bombs Used" value={stats.bombsUsed} icon="💣" />
          <StatItem label="Damage Taken" value={stats.damageTaken} icon="❤️‍🩹" />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onRetry}
            className="group relative overflow-hidden rounded-xl border-2 border-cyan-400 bg-gradient-to-b from-cyan-500/20 to-cyan-600/20 px-8 py-3 font-orbitron font-bold uppercase tracking-wider text-cyan-300 shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:border-cyan-300 hover:shadow-cyan-500/40 active:scale-95"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="relative">🔄 Try Again</span>
          </button>

          <button
            onClick={onQuit}
            className="rounded-xl border border-gray-500 bg-gray-800/50 px-8 py-3 font-orbitron font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 hover:border-gray-400 hover:bg-gray-700/50 active:scale-95"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
      <div className="mb-1 text-xl">{icon}</div>
      <div className="font-orbitron text-lg font-bold text-white">{value}</div>
      <div className="font-rajdhani text-xs uppercase tracking-wider text-white/50">
        {label}
      </div>
    </div>
  );
}
