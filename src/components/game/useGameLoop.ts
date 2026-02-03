'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { GameState, GameDimensions, Bullet, Enemy, Drop } from './types';
import {
  BULLET_SPEED,
  DROP_SPEED,
  PICKUP_RADIUS,
  HEALTH_RESTORE,
  ENEMY_COLLISION_DAMAGE,
  SHOOTER_FIRE_RATE,
  BOSS_PATTERN_DURATION,
  BOSS_ATTACK_CHANCE,
  BOMB_DAMAGE,
} from './constants';
import { bulletHitsEntity, circleCollision, constrainToBounds } from './collision';
import { createBullet, createDrop, createEnemyBullet, getEnemyScore, shouldDropLoot } from './entities';

interface UseGameLoopProps {
  state: GameState;
  dimensions: GameDimensions;
  onStateUpdate: (updater: (state: GameState) => GameState) => void;
  onVictory: () => void;
  onDefeat: () => void;
  onShake: () => void;
  playSound: (type: 'tick' | 'select' | 'launch') => void;
  playVoice: (name: string) => void;
}

export function useGameLoop({
  state,
  dimensions,
  onStateUpdate,
  onVictory,
  onDefeat,
  onShake,
  playSound,
  playVoice,
}: UseGameLoopProps) {
  const frameRef = useRef<number>(0);
  const isRunning = useRef(false);

  const updateGame = useCallback(() => {
    if (!isRunning.current) return;

    onStateUpdate((currentState) => {
      if (!currentState.active || currentState.phase === 'glitch') {
        return currentState;
      }

      const newState = { ...currentState };
      const { player, boss, keys } = newState;

      // Move player
      if (keys.left) player.x -= player.speed;
      if (keys.right) player.x += player.speed;
      if (keys.up) player.y -= player.speed;
      if (keys.down) player.y += player.speed;

      // Constrain player to bottom half
      constrainToBounds(
        player,
        dimensions.width,
        dimensions.height,
        dimensions.height * 0.5
      );

      // Auto-fire
      const now = Date.now();
      if (now - player.lastShot >= player.fireRate) {
        player.lastShot = now;
        newState.bullets = [
          ...newState.bullets,
          createBullet(player.x, player.y - player.height / 2),
        ];
        playSound('tick');
      }

      // Update player bullets
      newState.bullets = newState.bullets.filter((bullet) => {
        bullet.y -= bullet.speed;
        return bullet.y > -20;
      });

      // Update enemies
      const remainingEnemies: Enemy[] = [];
      const newDrops: Drop[] = [...newState.drops];

      for (const enemy of newState.enemies) {
        enemy.y += enemy.speed;

        // Shooter fires
        if (enemy.type === 'shooter' && now - enemy.lastShot > SHOOTER_FIRE_RATE) {
          enemy.lastShot = now;
          newState.bossBullets = [
            ...newState.bossBullets,
            createEnemyBullet(enemy.x, enemy.y + 15),
          ];
        }

        // Check bullet hits
        let enemyHit = false;
        newState.bullets = newState.bullets.filter((bullet) => {
          if (bulletHitsEntity(bullet, enemy, 5)) {
            enemy.health -= bullet.damage;
            enemyHit = true;
            if (enemy.health <= 0) {
              newState.score += getEnemyScore(enemy.type);
              if (shouldDropLoot(enemy.type)) {
                newDrops.push(createDrop(enemy.x, enemy.y));
              }
            }
            return false;
          }
          return true;
        });

        // Check player collision
        if (circleCollision(player, enemy, 10)) {
          if (!player.shielded) {
            player.health -= ENEMY_COLLISION_DAMAGE;
            onShake();
            if (player.health <= 0) {
              playVoice('laugh');
              onDefeat();
              return { ...newState, active: false, phase: 'defeat' };
            }
          } else {
            player.shielded = false;
          }
          continue; // Remove enemy
        }

        // Keep enemy if alive and on screen
        if (enemy.health > 0 && enemy.y < dimensions.height + 50) {
          remainingEnemies.push(enemy);
        }
      }

      newState.enemies = remainingEnemies;

      // Update drops
      newState.drops = newDrops.filter((drop) => {
        drop.y += DROP_SPEED;
        drop.pulse += 0.1;

        // Check pickup
        const dx = player.x - drop.x;
        const dy = player.y - drop.y;
        if (Math.sqrt(dx * dx + dy * dy) < PICKUP_RADIUS) {
          playSound('select');
          if (drop.type === 'bomb') {
            player.bombs++;
          } else if (drop.type === 'health') {
            player.health = Math.min(player.maxHealth, player.health + HEALTH_RESTORE);
          } else if (drop.type === 'shield') {
            player.shielded = true;
          }
          return false;
        }

        return drop.y < dimensions.height + 20;
      });

      // Update boss bullets (enemy fire)
      newState.bossBullets = newState.bossBullets.filter((bullet) => {
        bullet.y += bullet.speed;

        // Check player hit
        if (bulletHitsEntity(bullet, player, player.width / 2)) {
          if (!player.shielded) {
            player.health -= 15;
            if (player.health <= 0) {
              playVoice('laugh');
              onDefeat();
              newState.active = false;
              newState.phase = 'defeat';
            }
          } else {
            player.shielded = false;
          }
          return false;
        }

        return bullet.y < dimensions.height + 10;
      });

      // Boss phase logic
      if (newState.phase === 'boss') {
        // Animate boss entrance
        if (boss.y < 80) {
          boss.y += 2;
        } else {
          boss.active = true;

          // Boss movement pattern
          boss.patternTimer++;
          if (boss.patternTimer > BOSS_PATTERN_DURATION) {
            boss.pattern = (boss.pattern + 1) % 3;
            boss.patternTimer = 0;
            if (Math.random() < 0.4) {
              const taunts = ['coward', 'laugh', 'ideas', 'run', 'escape'] as const;
              const taunt = taunts[Math.floor(Math.random() * taunts.length)];
              if (taunt) playVoice(taunt);
            }
          }

          // Move boss
          if (boss.pattern === 0) {
            boss.x += Math.sin(Date.now() * 0.002) * 3;
          } else if (boss.pattern === 1) {
            boss.x += (player.x - boss.x) * 0.02;
          }
          boss.x = Math.max(
            boss.width / 2,
            Math.min(dimensions.width - boss.width / 2, boss.x)
          );

          // Boss attacks
          if (Math.random() < BOSS_ATTACK_CHANCE) {
            for (let i = -1; i <= 1; i++) {
              newState.bossBullets.push({
                x: boss.x + i * 30,
                y: boss.y + 60,
                speed: 5,
                damage: 15,
                isEnemy: true,
              });
            }
          }
        }

        // Check bomb hits on boss
        newState.bullets = newState.bullets.filter((bullet) => {
          if (!bullet.isBomb) return true;

          if (bulletHitsEntity(bullet, boss, 20)) {
            boss.health -= bullet.damage;
            onShake();
            playSound('select');

            if (boss.health <= 0) {
              onVictory();
              return false;
            }
            return false;
          }
          return true;
        });
      }

      return newState;
    });

    frameRef.current = requestAnimationFrame(updateGame);
  }, [dimensions, onStateUpdate, onVictory, onDefeat, onShake, playSound, playVoice]);

  const start = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;
    frameRef.current = requestAnimationFrame(updateGame);
  }, [updateGame]);

  const stop = useCallback(() => {
    isRunning.current = false;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop, isRunning: isRunning.current };
}
