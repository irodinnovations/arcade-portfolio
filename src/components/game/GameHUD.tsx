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
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-2">
      {/* Top HUD */}
      <div className="flex items-center justify-between">
        {/* Score */}
        <div className="flex flex-col items-start">
          <span className="font-orbitron text-xs uppercase tracking-wider text-cyan-400/70">
            Score
          </span>
          <span className="font-orbitron text-2xl font-bold text-white">
            {score.toString().padStart(6, '0')}
          </span>
        </div>

        {/* Phase indicator */}
        <div className="flex flex-col items-center">
          <span
            className={`font-orbitron text-lg font-bold ${
              isBossPhase
                ? 'animate-pulse text-red-500'
                : 'text-amber-400'
            }`}
          >
            {isBossPhase ? 'BOSS BATTLE!' : `BOSS IN: ${waveTimer}`}
          </span>
        </div>

        {/* Bombs + Pause */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-end">
            <span className="font-orbitron text-xs uppercase tracking-wider text-orange-400/70">
              Bombs
            </span>
            <span className="font-orbitron text-2xl font-bold text-orange-400">
              {player.bombs}
            </span>
          </div>
          
          {/* Pause button */}
          {onPause && (
            <button
              onClick={onPause}
              className="pointer-events-auto mt-1 rounded-md border border-white/30 bg-black/50 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Pause game"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Health bar */}
      <div className="mx-auto mt-2 w-48 max-w-[60%]">
        <div className="relative h-4 overflow-hidden rounded-full border border-white/30 bg-black/50">
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
          {/* Health text */}
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {Math.ceil(player.health)} / {player.maxHealth}
          </span>
        </div>
      </div>

      {/* Invincibility indicator */}
      {player.invincibleTimer > 0 && (
        <div className="mx-auto mt-1 animate-pulse text-center text-xs font-bold text-cyan-400">
          INVINCIBLE!
        </div>
      )}

      {/* Shield indicator */}
      {player.shielded && (
        <div className="mx-auto mt-1 text-center text-xs font-bold text-blue-400">
          ⛨ SHIELD ACTIVE
        </div>
      )}

      {/* Fire bomb button (mobile) */}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2">
        <button
          onClick={onFireBomb}
          disabled={!canFireBomb}
          className={`
            rounded-lg border-2 px-6 py-3 font-orbitron font-bold uppercase tracking-wider
            transition-all duration-200
            ${
              canFireBomb
                ? 'border-orange-500 bg-orange-500/20 text-orange-400 hover:bg-orange-500/40 active:scale-95'
                : 'cursor-not-allowed border-gray-600 bg-gray-800/50 text-gray-500'
            }
          `}
        >
          {isBossPhase
            ? `FIRE BOMB${player.bombs === 0 ? ' (NONE!)' : ` (${player.bombs})`}`
            : 'COLLECT BOMBS!'}
        </button>
      </div>
    </div>
  );
}
