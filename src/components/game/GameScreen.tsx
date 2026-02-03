'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, GameDimensions, Particle } from './types';
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

const ASPECT_RATIO = 600 / 700;

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

  // Responsive canvas dimensions - scale to viewport properly
  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = window.innerWidth - 20;
      const maxHeight = window.innerHeight - 100;

      let width = maxWidth;
      let height = width / ASPECT_RATIO;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * ASPECT_RATIO;
      }

      // Ensure minimum size for playability
      width = Math.max(320, Math.floor(width));
      height = Math.max(373, Math.floor(height));

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

  // Spawn particles helper
  const spawnParticles = useCallback((x: number, y: number, color: string, count: number = 8) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 4,
      });
    }
    setGameState((s) => ({
      ...s,
      particles: [...s.particles, ...particles],
    }));
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
    spawnParticles,
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

    // Enemy spawning with progressive difficulty
    let spawnRate = ENEMY_SPAWN_RATE;
    const spawnEnemy = () => {
      setGameState((s) => {
        if (!s.active || s.phase !== 'wave') return s;
        
        // Increase spawn rate over time
        const progress = 1 - s.waveTimer / WAVE_DURATION;
        const enemyCount = Math.floor(1 + progress * 2); // 1-3 enemies at once
        const newEnemies = [];
        for (let i = 0; i < enemyCount; i++) {
          newEnemies.push(createEnemy(dimensions));
        }
        
        return {
          ...s,
          enemies: [...s.enemies, ...newEnemies],
        };
      });
      
      // Speed up spawning as wave progresses
      enemySpawnRef.current = setTimeout(spawnEnemy, spawnRate * (0.5 + Math.random() * 0.5));
    };
    
    enemySpawnRef.current = setTimeout(spawnEnemy, spawnRate);
  }, [dimensions, startLoop, playVoice, onShake]);

  // Glitch sequence complete handler
  const handleGlitchComplete = useCallback(() => {
    startWavePhase();
  }, [startWavePhase]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState((s) => {
      if (s.phase === 'paused') {
        startLoop();
        return { ...s, phase: s.previousPhase || 'wave', previousPhase: null };
      } else if (s.phase === 'wave' || s.phase === 'boss') {
        stopLoop();
        return { ...s, phase: 'paused', previousPhase: s.phase };
      }
      return s;
    });
  }, [startLoop, stopLoop]);

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
      // Escape to skip glitch or quit
      if (e.key === 'Escape') {
        if (gameState.phase === 'glitch') {
          handleGlitchComplete();
        } else if (gameState.phase === 'paused') {
          handleQuit();
        } else {
          handleQuit();
        }
        return;
      }

      // P to pause
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
      }

      if (!gameState.active || gameState.phase === 'paused') return;

      setGameState((s) => {
        const keys = { ...s.keys };

        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
        if (e.key === 'ArrowUp' || e.key === 'w') keys.up = true;
        if (e.key === 'ArrowDown' || e.key === 's') keys.down = true;

        if (e.key === ' ' && s.phase === 'boss' && s.player.bombs > 0) {
          handleFireBomb();
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
  }, [isVisible, gameState.phase, gameState.active, handleFireBomb, handleQuit, handleGlitchComplete, togglePause]);

  // Touch controls with SNAPPY response
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const handleTouch = (e: TouchEvent) => {
      if (!gameState.active || gameState.phase === 'paused') return;
      e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;
      const rect = containerRef.current!.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      // Scale touch to canvas coordinates
      const scaleX = dimensions.width / rect.width;
      const scaleY = dimensions.height / rect.height;
      const canvasX = touchX * scaleX;
      const canvasY = touchY * scaleY;

      setGameState((s) => {
        const player = { ...s.player };
        const targetY = Math.max(dimensions.height * 0.5, canvasY);
        
        // SNAPPY lerp - 0.35 is much more responsive than 0.15
        const lerpFactor = 0.35;
        player.x += (canvasX - player.x) * lerpFactor;
        player.y += (targetY - player.y) * lerpFactor;
        
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
  }, [isVisible, gameState.active, gameState.phase, dimensions]);

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
        <div 
          className="relative"
          style={{
            transform: `translate(${gameState.screenShake.x}px, ${gameState.screenShake.y}px)`,
          }}
        >
          <GameCanvas state={gameState} dimensions={dimensions} />
          <GameHUD state={gameState} onFireBomb={handleFireBomb} onPause={togglePause} />
        </div>
      )}

      {/* Pause overlay */}
      {gameState.phase === 'paused' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              PAUSED
            </h2>
            <p className="text-white/60 mb-6">Press P to resume or ESC to quit</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors"
              >
                RESUME
              </button>
              <button
                onClick={handleQuit}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
              >
                QUIT
              </button>
            </div>
          </div>
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

      {/* Controls hint */}
      {gameState.phase !== 'glitch' &&
        gameState.phase !== 'victory' &&
        gameState.phase !== 'defeat' &&
        gameState.phase !== 'paused' && (
          <div className="absolute bottom-2 text-xs text-white/30">
            ESC to quit • P to pause
          </div>
        )}
    </div>
  );
}
