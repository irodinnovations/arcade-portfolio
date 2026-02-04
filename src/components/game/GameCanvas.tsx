'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { GameState, GameDimensions } from './types';
import {
  drawBackground,
  drawPlayer,
  drawBoss,
  drawEnemy,
  drawBullet,
  drawDrop,
  drawParticles,
  drawInstructions,
} from './renderer';

interface GameCanvasProps {
  state: GameState;
  dimensions: GameDimensions;
}

interface Sprites {
  player: HTMLImageElement;
  boss: HTMLImageElement;
  background: HTMLImageElement;
  bomb: HTMLImageElement;
  health: HTMLImageElement;
  shield: HTMLImageElement;
  explosion: HTMLImageElement;
  enemyWorker: HTMLImageElement;
  enemyShooter: HTMLImageElement;
  enemyCarrier: HTMLImageElement;
}

export function GameCanvas({ state, dimensions }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<Sprites | null>(null);
  const animFrameRef = useRef<number>(0);

  // Load all sprites
  useEffect(() => {
    const sprites: Sprites = {
      player: new Image(),
      boss: new Image(),
      background: new Image(),
      bomb: new Image(),
      health: new Image(),
      shield: new Image(),
      explosion: new Image(),
      enemyWorker: new Image(),
      enemyShooter: new Image(),
      enemyCarrier: new Image(),
    };

    sprites.player.src = '/images/game/player-ship.png';
    sprites.boss.src = '/images/game/boss-rodney.png';
    sprites.background.src = '/images/game/background.webp';
    sprites.bomb.src = '/images/game/bomb-pickup.png';
    sprites.health.src = '/images/game/health-pickup.png';
    sprites.shield.src = '/images/game/shield-pickup.png';
    sprites.explosion.src = '/images/game/explosion-sprite.png';
    sprites.enemyWorker.src = '/images/game/enemy-worker.png';
    sprites.enemyShooter.src = '/images/game/enemy-shooter.png';
    sprites.enemyCarrier.src = '/images/game/enemy-carrier.png';

    spritesRef.current = sprites;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const sprites = spritesRef.current;

    if (!canvas || !ctx || !sprites) return;

    // Clear and draw background
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    drawBackground(ctx, dimensions, sprites);

    // Draw particles (behind entities)
    drawParticles(ctx, state.particles);

    // Draw drops with sprites
    for (const drop of state.drops) {
      drawDrop(ctx, drop, sprites);
    }

    // Draw enemies
    for (const enemy of state.enemies) {
      drawEnemy(ctx, enemy, sprites);
    }

    // Draw player bullets
    for (const bullet of state.bullets) {
      drawBullet(ctx, bullet);
    }

    // Draw boss bullets / enemy fire
    for (const bullet of state.bossBullets) {
      drawBullet(ctx, bullet);
    }

    // Draw boss
    drawBoss(ctx, state, dimensions, sprites);

    // Draw player
    drawPlayer(ctx, state, sprites);

    // Draw instructions
    drawInstructions(ctx, state.phase, dimensions);

    // Continue animation
    animFrameRef.current = requestAnimationFrame(render);
  }, [state, dimensions]);

  // Start render loop
  useEffect(() => {
    if (state.phase === 'glitch' || (!state.active && state.phase !== 'paused')) {
      return;
    }

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state.phase, state.active, render]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="block touch-none rounded-lg"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        boxShadow: '0 0 40px rgba(0, 255, 136, 0.2)',
      }}
    />
  );
}
