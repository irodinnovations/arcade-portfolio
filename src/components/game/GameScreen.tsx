'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, GameDimensions } from './types';
import { createInitialState, resetGameState } from './gameState';
import { createEnemy, createBomb } from './entities';
import { useGameLoop } from './useGameLoop';
import { useGameAudio } from './useGameAudio';
import { GlitchOverlay } from './GlitchOverlay';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { GameMessage } from './GameMessage';
import { WAVE_DURATION, ENEMY_SPAWN_RATE } from './constants';

interface GameScreenProps {
  isVisible: boolean;
  muted: boolean;
  playSound: (type: 'tick' | 'select' | 'launch' | 'navigate' | 'countdown') => void;
  onQuit: () => void;
  onShake: () => void;
}

export function GameScreen({
  isVisible,
  muted,
  playSound,
  onQuit,
  onShake,
}: GameScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enemySpawnRef = useRef<NodeJS.Timeout | null>(null);

  const [dimensions, setDimensions] = useState<GameDimensions>({
    width: 600,
    height: 700,
  });

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(dimensions)
  );

  const { playVoice } = useGameAudio({ muted });

  // Calculate canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(600, window.innerWidth - 20);
      const height = Math.min(700, window.innerHeight - 100);
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle victory
  const handleVictory = useCallback(() => {
    setGameState((s) => ({ ...s, active: false, phase: 'victory' }));
    playSound('launch');
    waveTimerRef.current && clearInterval(waveTimerRef.current);
    enemySpawnRef.current && clearInterval(enemySpawnRef.current);
  }, [playSound]);

  // Handle defeat
  const handleDefeat = useCallback(() => {
    setGameState((s) => ({ ...s, active: false, phase: 'defeat' }));
    waveTimerRef.current && clearInterval(waveTimerRef.current);
    enemySpawnRef.current && clearInterval(enemySpawnRef.current);
  }, []);

  // Game loop
  const { start: startLoop, stop: stopLoop } = useGameLoop({
    state: gameState,
    dimensions,
    onStateUpdate: setGameState,
    onVictory: handleVictory,
    onDefeat: handleDefeat,
    onShake,
    playSound: playSound as (type: 'tick' | 'select' | 'launch') => void,
    playVoice,
  });

  // Start the wave phase
  const startWavePhase = useCallback(() => {
    setGameState((s) => ({
      ...resetGameState(s, dimensions),
      phase: 'wave',
      active: true,
    }));

    startLoop();

    // Wave timer countdown
    waveTimerRef.current = setInterval(() => {
      setGameState((s) => {
        if (!s.active || s.phase !== 'wave') return s;

        const newTimer = s.waveTimer - 1;

        // Random taunts
        if (Math.random() < 0.15) {
          const taunts = ['run', 'escape', 'see', 'ideas', 'coward'] as const;
          const taunt = taunts[Math.floor(Math.random() * taunts.length)];
          if (taunt) playVoice(taunt);
        }

        if (newTimer <= 0) {
          // Transition to boss phase
          waveTimerRef.current && clearInterval(waveTimerRef.current);
          enemySpawnRef.current && clearInterval(enemySpawnRef.current);
          playVoice('beware');
          onShake();
          return {
            ...s,
            waveTimer: 0,
            phase: 'boss',
            enemies: [], // Clear remaining enemies
          };
        }

        return { ...s, waveTimer: newTimer };
      });
    }, 1000);

    // Enemy spawning
    enemySpawnRef.current = setInterval(() => {
      setGameState((s) => {
        if (!s.active || s.phase !== 'wave') return s;
        return {
          ...s,
          enemies: [...s.enemies, createEnemy(dimensions)],
        };
      });
    }, ENEMY_SPAWN_RATE);
  }, [dimensions, startLoop, playVoice, onShake]);

  // Glitch sequence complete handler
  const handleGlitchComplete = useCallback(() => {
    startWavePhase();
  }, [startWavePhase]);

  // Fire bomb
  const handleFireBomb = useCallback(() => {
    setGameState((s) => {
      if (s.phase !== 'boss' || s.player.bombs <= 0) return s;

      playSound('launch');
      playVoice('coward');

      return {
        ...s,
        player: { ...s.player, bombs: s.player.bombs - 1 },
        bullets: [
          ...s.bullets,
          createBomb(s.player.x, s.player.y - s.player.height / 2),
        ],
      };
    });
  }, [playSound, playVoice]);

  // Retry game
  const handleRetry = useCallback(() => {
    setGameState(createInitialState(dimensions));
  }, [dimensions]);

  // Quit game
  const handleQuit = useCallback(() => {
    stopLoop();
    waveTimerRef.current && clearInterval(waveTimerRef.current);
    enemySpawnRef.current && clearInterval(enemySpawnRef.current);
    onQuit();
  }, [stopLoop, onQuit]);

  // Keyboard input
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.phase === 'glitch' && e.key === 'Escape') {
        handleGlitchComplete();
        return;
      }

      if (!gameState.active) return;

      setGameState((s) => {
        const keys = { ...s.keys };

        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
        if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true;
        if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;

        if (e.key === ' ' && s.phase === 'boss' && s.player.bombs > 0) {
          handleFireBomb();
        }

        if (e.key === 'Escape') {
          handleQuit();
        }

        return { ...s, keys };
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setGameState((s) => {
        const keys = { ...s.keys };

        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
        if (e.key === 'ArrowUp' || e.key === 'w') keys.up = false;
        if (e.key === 'ArrowDown' || e.key === 's') keys.down = false;

        return { ...s, keys };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isVisible, gameState.phase, gameState.active, handleFireBomb, handleQuit, handleGlitchComplete]);

  // Touch controls
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const handleTouch = (e: TouchEvent) => {
      if (!gameState.active) return;
      e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;
      const rect = containerRef.current!.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      setGameState((s) => {
        const player = { ...s.player };
        const targetY = Math.max(dimensions.height * 0.5, touchY);
        player.x += (touchX - player.x) * 0.15;
        player.y += (targetY - player.y) * 0.15;
        return { ...s, player };
      });
    };

    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouch, { passive: false });
    container.addEventListener('touchmove', handleTouch, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchmove', handleTouch);
    };
  }, [isVisible, gameState.active, dimensions.height]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoop();
      waveTimerRef.current && clearInterval(waveTimerRef.current);
      enemySpawnRef.current && clearInterval(enemySpawnRef.current);
    };
  }, [stopLoop]);

  // Initialize game when becoming visible
  useEffect(() => {
    if (isVisible) {
      setGameState(createInitialState(dimensions));
    }
  }, [isVisible, dimensions]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050510]"
    >
      {/* Glitch sequence */}
      <GlitchOverlay
        active={gameState.phase === 'glitch'}
        onComplete={handleGlitchComplete}
        playSound={playSound as (type: 'navigate' | 'countdown' | 'launch') => void}
        playVoice={playVoice}
        onShake={onShake}
      />

      {/* Game canvas */}
      {gameState.phase !== 'glitch' && (
        <div className="relative">
          <GameCanvas state={gameState} dimensions={dimensions} />
          <GameHUD state={gameState} onFireBomb={handleFireBomb} />
        </div>
      )}

      {/* Victory / Defeat message */}
      {(gameState.phase === 'victory' || gameState.phase === 'defeat') && (
        <GameMessage
          type={gameState.phase}
          score={gameState.score}
          hasBombs={gameState.player.bombs > 0}
          wasBossPhase={gameState.waveTimer === 0}
          onRetry={handleRetry}
          onQuit={handleQuit}
        />
      )}

      {/* ESC hint */}
      {gameState.phase !== 'glitch' &&
        gameState.phase !== 'victory' &&
        gameState.phase !== 'defeat' && (
          <div className="absolute bottom-2 text-xs text-white/30">
            ESC to quit
          </div>
        )}
    </div>
  );
}
