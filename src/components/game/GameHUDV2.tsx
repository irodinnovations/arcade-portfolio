'use client';

import type { GamePhase, GameStats, Player } from './engine';

interface GameHUDProps {
  stats: GameStats;
  phase: GamePhase;
  player: Player | null;
  onFireBomb: () => void;
}

export function GameHUDV2({ stats, phase, player, onFireBomb }: GameHUDProps) {
  const isBossPhase = phase === 'boss';
  const healthPercent = player ? (player.health / player.maxHealth) * 100 : 100;
  const bombs = player?.bombs ?? 0;
  const canFireBomb = isBossPhase && bombs > 0;

  return (
    <div className="pointer-events-none absolute inset-0 p-4">
      {/* Top bar */}
      <div className="flex items-start justify-between">
        {/* Score section */}
        <div className="flex flex-col">
          <span className="font-rajdhani text-xs uppercase tracking-widest text-cyan-400/60">
            Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron text-3xl font-bold tabular-nums text-white drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
              {stats.score.toLocaleString().padStart(8, '0')}
            </span>
            {stats.currentCombo > 1 && (
              <span className="animate-pulse font-orbitron text-sm font-bold text-amber-400">
                x{stats.currentCombo}
              </span>
            )}
          </div>
        </div>

        {/* Phase timer / Boss indicator */}
        <div className="flex flex-col items-center">
          {isBossPhase ? (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-1">
              <span className="animate-pulse font-orbitron text-lg font-bold uppercase tracking-wider text-red-400 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                ⚔ BOSS BATTLE ⚔
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="font-rajdhani text-xs uppercase tracking-widest text-amber-400/60">
                Boss arrives in
              </span>
              <span
                className={`font-orbitron text-2xl font-bold tabular-nums ${
                  stats.waveTimer <= 10
                    ? 'animate-pulse text-orange-400'
                    : 'text-amber-300'
                }`}
              >
                {Math.ceil(stats.waveTimer)}
              </span>
            </div>
          )}
        </div>

        {/* Bombs section */}
        <div className="flex flex-col items-end">
          <span className="font-rajdhani text-xs uppercase tracking-widest text-orange-400/60">
            Bombs
          </span>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(bombs, 5))].map((_, i) => (
              <span
                key={i}
                className="text-2xl drop-shadow-[0_0_8px_rgba(255,100,0,0.5)]"
              >
                💣
              </span>
            ))}
            {bombs > 5 && (
              <span className="font-orbitron text-lg text-orange-400">
                +{bombs - 5}
              </span>
            )}
            {bombs === 0 && (
              <span className="font-orbitron text-lg text-gray-500">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Health bar - centered below top bar */}
      <div className="mx-auto mt-3 max-w-[200px]">
        <div className="relative">
          {/* Background */}
          <div className="h-4 overflow-hidden rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
            {/* Health fill */}
            <div
              className={`h-full transition-all duration-300 ${
                healthPercent > 60
                  ? 'bg-gradient-to-r from-green-600 via-green-500 to-green-400'
                  : healthPercent > 30
                    ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400'
                    : 'animate-pulse bg-gradient-to-r from-red-600 via-red-500 to-red-400'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
            {/* Shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </div>

          {/* Health text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-orbitron text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {player ? Math.ceil(player.health) : 100} / {player?.maxHealth ?? 100}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom - Fire bomb button (mobile) */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-4 flex justify-center">
        <button
          onClick={onFireBomb}
          disabled={!canFireBomb}
          className={`
            group relative overflow-hidden rounded-xl px-8 py-4 font-orbitron font-bold uppercase tracking-wider
            transition-all duration-200 active:scale-95
            ${
              canFireBomb
                ? 'border-2 border-orange-400 bg-gradient-to-b from-orange-500/30 to-orange-600/30 text-orange-300 shadow-lg shadow-orange-500/30 hover:border-orange-300 hover:shadow-orange-500/50'
                : 'cursor-not-allowed border border-gray-600 bg-gray-800/50 text-gray-500'
            }
          `}
        >
          {/* Animated background for enabled state */}
          {canFireBomb && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/20" />
          )}

          <span className="relative">
            {isBossPhase
              ? bombs > 0
                ? '💣 FIRE BOMB!'
                : '💣 NO BOMBS!'
              : '💣 COLLECT BOMBS'}
          </span>
        </button>
      </div>

      {/* Instructions */}
      {phase === 'wave' && (
        <div className="absolute inset-x-0 bottom-20 text-center">
          <p className="font-rajdhani text-sm text-white/40">
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
              ← → ↑ ↓
            </kbd>{' '}
            or{' '}
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
              WASD
            </kbd>{' '}
            to move • Collect{' '}
            <span className="text-orange-400">💣</span> to fight the boss
          </p>
        </div>
      )}

      {phase === 'boss' && (
        <div className="absolute inset-x-0 bottom-20 text-center">
          <p className="font-rajdhani text-sm text-white/40">
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-xs">
              SPACE
            </kbd>{' '}
            to fire bomb at the boss!
          </p>
        </div>
      )}
    </div>
  );
}
