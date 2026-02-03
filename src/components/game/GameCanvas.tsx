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
}

export function GameCanvas({ state, dimensions }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<Sprites | null>(null);
  const animFrameRef = useRef<number>(0);

  // Load sprites
  useEffect(() => {
    const sprites: Sprites = {
      player: new Image(),
      boss: new Image(),
      background: new Image(),
    };

    sprites.player.src = '/images/game/player-ship.webp';
    sprites.boss.src = '/images/game/boss-rodney.webp';
    sprites.background.src = '/images/game/background.webp';

    spritesRef.current = sprites;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const sprites = spritesRef.current;

    if (!canvas || !ctx || !sprites) return;

    // Draw background
    drawBackground(ctx, dimensions, sprites);

    // Draw drops
    for (const drop of state.drops) {
      drawDrop(ctx, drop);
    }

    // Draw enemies
    for (const enemy of state.enemies) {
      drawEnemy(ctx, enemy);
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
    if (state.phase === 'glitch' || !state.active) {
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
      className="block touch-none"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    />
  );
}
