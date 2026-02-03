'use client';

import type { GameState } from './types';

interface GameHUDProps {
  state: GameState;
  onFireBomb: () => void;
}

export function GameHUD({ state, onFireBomb }: GameHUDProps) {
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

        {/* Bombs */}
        <div className="flex flex-col items-end">
          <span className="font-orbitron text-xs uppercase tracking-wider text-orange-400/70">
            Bombs
          </span>
          <span className="font-orbitron text-2xl font-bold text-orange-400">
            💣 {player.bombs}
          </span>
        </div>
      </div>

      {/* Health bar */}
      <div className="mx-auto mt-2 w-48 max-w-[60%]">
        <div className="h-3 overflow-hidden rounded-full border border-white/30 bg-black/50">
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
        </div>
      </div>

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
            ? `💣 FIRE BOMB${player.bombs === 0 ? ' (NONE!)' : '!'}`
            : '💣 COLLECT BOMBS!'}
        </button>
      </div>
    </div>
  );
}
