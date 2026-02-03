'use client';

import type { GameState } from './types';

interface GameHUDProps {
  state: GameState;
  onFireBomb: () => void;
  onPause?: () => void;
}

export function GameHUD({ state, onFireBomb, onPause }: GameHUDProps) {
  const { phase, score, waveTimer, player } = state;
  const healthPercent = (player.health / player.maxHealth) * 100;
  const isBossPhase = phase === 'boss';
  const canFireBomb = isBossPhase && player.bombs > 0;

  return (
    <>
      {/* Top HUD - simplified for mobile */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-3 pb-4 pt-2">
        {/* Compact row: Score | Phase | Bombs/Pause */}
        <div className="flex items-center justify-between gap-2">
          {/* Score - compact */}
          <div className="min-w-0 flex-shrink-0">
            <span className="font-orbitron text-lg font-bold text-white md:text-2xl">
              {score.toString().padStart(6, '0')}
            </span>
          </div>

          {/* Phase indicator - center */}
          <div className="flex-shrink-0 text-center">
            <span
              className={`font-orbitron text-sm font-bold md:text-lg ${
                isBossPhase
                  ? 'animate-pulse text-red-500'
                  : 'text-amber-400'
              }`}
            >
              {isBossPhase ? 'BOSS!' : waveTimer}
            </span>
          </div>

          {/* Bombs + Pause - compact */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="font-orbitron text-lg font-bold text-orange-400 md:text-2xl">
              💣{player.bombs}
            </span>
            
            {onPause && (
              <button
                onClick={onPause}
                className="pointer-events-auto rounded border border-white/30 bg-black/50 p-1.5 text-white/70 transition-colors hover:bg-white/10"
                aria-label="Pause game"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Health bar - under the top row */}
        <div className="mx-auto mt-2 w-full max-w-[200px]">
          <div className="relative h-3 overflow-hidden rounded-full border border-white/30 bg-black/50">
            <div
              className={`h-full transition-all duration-300 ${
                healthPercent > 50
                  ? 'bg-gradient-to-r from-green-600 to-green-400'
                  : healthPercent > 25
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                    : 'animate-pulse bg-gradient-to-r from-red-600 to-red-400'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {Math.ceil(player.health)}/{player.maxHealth}
            </span>
          </div>
        </div>

        {/* Status indicators - inline */}
        <div className="mt-1 flex justify-center gap-3 text-xs font-bold">
          {player.invincibleTimer > 0 && (
            <span className="animate-pulse text-cyan-400">INVINCIBLE</span>
          )}
          {player.shielded && (
            <span className="text-blue-400">⛨ SHIELD</span>
          )}
        </div>
      </div>

      {/* Fire bomb button - FIXED at bottom of screen */}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <button
          onClick={onFireBomb}
          disabled={!canFireBomb}
          className={`
            rounded-xl border-2 px-8 py-4 font-orbitron text-lg font-bold uppercase tracking-wider shadow-lg
            transition-all duration-200 active:scale-95
            ${
              canFireBomb
                ? 'border-orange-500 bg-orange-600/90 text-white hover:bg-orange-500'
                : 'border-gray-600 bg-gray-800/80 text-gray-400'
            }
          `}
        >
          {isBossPhase
            ? `💣 FIRE BOMB (${player.bombs})`
            : `💣 × ${player.bombs}`}
        </button>
      </div>
    </>
  );
}
