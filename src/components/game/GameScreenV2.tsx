'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { GameEngine } from './engine';
import type { GamePhase, GameStats } from './engine';
import { GameHUDV2 } from './GameHUDV2';
import { GameMessageV2 } from './GameMessageV2';

interface GameScreenProps {
  isVisible: boolean;
  muted: boolean;
  onQuit: () => void;
}

export function GameScreenV2({ isVisible, muted, onQuit }: GameScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rafRef = useRef<number>(0);

  const [phase, setPhase] = useState<GamePhase>('glitch');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 700 });

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    const engine = new GameEngine(canvasRef.current, dimensions);
    engine.setMuted(muted);
    engine.setCallbacks(
      (newPhase) => setPhase(newPhase),
      (newStats) => setStats(newStats)
    );
    engineRef.current = engine;
    engine.start();

    // Game loop
    const loop = (time: number) => {
      engine.update(time);
      engine.render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      engine.destroy();
      engineRef.current = null;
    };
  }, [isVisible, dimensions, muted]);

  // Update muted state
  useEffect(() => {
    engineRef.current?.setMuted(muted);
  }, [muted]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(600, window.innerWidth - 20);
      const height = Math.min(700, window.innerHeight - 100);
      setDimensions({ width, height });
      engineRef.current?.resize(width, height);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Keyboard input
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phase === 'glitch') {
          engineRef.current?.skipGlitch();
        } else if (phase === 'wave' || phase === 'boss') {
          onQuit();
        }
        return;
      }
      engineRef.current?.handleKeyDown(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current?.handleKeyUp(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isVisible, phase, onQuit]);

  // Touch input
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const handleTouch = (e: TouchEvent) => {
      if (phase !== 'wave' && phase !== 'boss') return;
      e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;

      const rect = containerRef.current!.getBoundingClientRect();
      const x = (touch.clientX - rect.left) * (dimensions.width / rect.width);
      const y = (touch.clientY - rect.top) * (dimensions.height / rect.height);
      engineRef.current?.handleTouch(x, y);
    };

    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouch, { passive: false });
    container.addEventListener('touchmove', handleTouch, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchmove', handleTouch);
    };
  }, [isVisible, phase, dimensions]);

  // Fire bomb on button press
  const handleFireBomb = useCallback(() => {
    if (phase === 'boss') {
      engineRef.current?.handleKeyDown(' ');
      setTimeout(() => engineRef.current?.handleKeyUp(' '), 50);
    }
  }, [phase]);

  // Retry
  const handleRetry = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050510]"
    >
      {/* Canvas container with proper scaling */}
      <div
        className="relative"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100vw',
          maxHeight: 'calc(100vh - 100px)',
        }}
      >
        <canvas
          ref={canvasRef}
          className="block rounded-lg shadow-2xl shadow-cyan-500/20"
          style={{
            imageRendering: 'pixelated',
          }}
        />

        {/* HUD overlay */}
        {stats && phase !== 'glitch' && (
          <GameHUDV2
            stats={stats}
            phase={phase}
            player={engineRef.current?.getPlayer() ?? null}
            onFireBomb={handleFireBomb}
          />
        )}
      </div>

      {/* Victory / Defeat modal */}
      {(phase === 'victory' || phase === 'defeat') && stats && (
        <GameMessageV2
          type={phase}
          stats={stats}
          onRetry={handleRetry}
          onQuit={onQuit}
        />
      )}

      {/* ESC hint */}
      {phase !== 'glitch' && phase !== 'victory' && phase !== 'defeat' && (
        <div className="absolute bottom-4 text-sm text-white/40">
          <kbd className="rounded border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs">
            ESC
          </kbd>{' '}
          to quit
        </div>
      )}
    </div>
  );
}
