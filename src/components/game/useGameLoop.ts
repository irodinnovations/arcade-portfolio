'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { GameState, GameDimensions, Bullet, Enemy, Drop, Particle } from './types';
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
  INVINCIBILITY_TIME,
  HIT_PAUSE_DURATION,
  DROP_MAGNETIZE_RANGE,
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
  spawnParticles: (x: number, y: number, color: string, count?: number) => void;
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
  spawnParticles,
}: UseGameLoopProps) {
  const frameRef = useRef<number>(0);
  const isRunning = useRef(false);
  const lastFrameTime = useRef(performance.now());

  const updateGame = useCallback(() => {
    if (!isRunning.current) return;

    const now = performance.now();
    const deltaTime = Math.min(now - lastFrameTime.current, 32); // Cap at ~30fps min
    lastFrameTime.current = now;

    onStateUpdate((currentState) => {
      if (!currentState.active || currentState.phase === 'glitch' || currentState.phase === 'paused') {
        return currentState;
      }

      // Hit pause - freeze game briefly for impact
      if (currentState.hitPause > 0) {
        return {
          ...currentState,
          hitPause: currentState.hitPause - deltaTime,
        };
      }

      const newState = { ...currentState };
      const { player, boss, keys } = newState;

      // Update player trail
      player.trail = [{ x: player.x, y: player.y }, ...player.trail.slice(0, 5)];

      // Update invincibility timer
      if (player.invincibleTimer > 0) {
        player.invincibleTimer -= deltaTime;
      }

      // Update screen shake
      if (newState.screenShake.intensity > 0) {
        newState.screenShake.intensity *= 0.9;
        newState.screenShake.x = (Math.random() - 0.5) * newState.screenShake.intensity;
        newState.screenShake.y = (Math.random() - 0.5) * newState.screenShake.intensity;
        if (newState.screenShake.intensity < 0.5) {
          newState.screenShake = { x: 0, y: 0, intensity: 0 };
        }
      }

      // Update particles
      newState.particles = newState.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.life -= 0.02;
        p.vx *= 0.98;
        p.vy *= 0.98;
        return p.life > 0;
      });

      // Move player
      const speed = player.speed * (deltaTime / 16);
      if (keys.left) player.x -= speed;
      if (keys.right) player.x += speed;
      if (keys.up) player.y -= speed;
      if (keys.down) player.y += speed;

      // Constrain player to bottom half
      constrainToBounds(
        player,
        dimensions.width,
        dimensions.height,
        dimensions.height * 0.5
      );

      // Auto-fire
      const nowMs = Date.now();
      if (nowMs - player.lastShot >= player.fireRate) {
        player.lastShot = nowMs;
        newState.bullets = [
          ...newState.bullets,
          createBullet(player.x, player.y - player.height / 2),
        ];
        playSound('tick');
      }

      // Update player bullets with trails
      newState.bullets = newState.bullets.filter((bullet) => {
        // Update trail for bombs
        if (bullet.isBomb) {
          bullet.trail = [{ x: bullet.x, y: bullet.y }, ...bullet.trail.slice(0, 8)];
        }
        bullet.y -= bullet.speed;
        return bullet.y > -20;
      });

      // Update enemies
      const remainingEnemies: Enemy[] = [];
      const newDrops: Drop[] = [...newState.drops];

      for (const enemy of newState.enemies) {
        enemy.y += enemy.speed;
        
        // Decrease hit flash
        if (enemy.hitFlash > 0) {
          enemy.hitFlash -= deltaTime;
        }

        // Shooter fires
        if (enemy.type === 'shooter' && nowMs - enemy.lastShot > SHOOTER_FIRE_RATE) {
          enemy.lastShot = nowMs;
          newState.bossBullets = [
            ...newState.bossBullets,
            createEnemyBullet(enemy.x, enemy.y + 15),
          ];
        }

        // Check bullet hits
        let enemyKilled = false;
        newState.bullets = newState.bullets.filter((bullet) => {
          if (!bullet.isBomb && bulletHitsEntity(bullet, enemy, 5)) {
            enemy.health -= bullet.damage;
            enemy.hitFlash = 100;
            
            // Spawn impact sparks
            spawnParticles(bullet.x, bullet.y, '#00ffcc', 4);
            
            if (enemy.health <= 0) {
              newState.score += getEnemyScore(enemy.type);
              
              // Spawn explosion particles
              spawnParticles(enemy.x, enemy.y, enemy.type === 'carrier' ? '#ffaa00' : '#aa44ff', 12);
              
              // Hit pause for satisfying kills
              newState.hitPause = HIT_PAUSE_DURATION;
              
              if (shouldDropLoot(enemy.type)) {
                newDrops.push(createDrop(enemy.x, enemy.y));
              }
              enemyKilled = true;
            }
            return false;
          }
          return true;
        });

        if (enemyKilled) continue;

        // Check player collision (only if not invincible)
        if (player.invincibleTimer <= 0 && circleCollision(player, enemy, 10)) {
          if (!player.shielded) {
            player.health -= ENEMY_COLLISION_DAMAGE;
            player.invincibleTimer = INVINCIBILITY_TIME;
            
            // Screen shake on damage
            newState.screenShake = { x: 0, y: 0, intensity: 15 };
            onShake();
            
            // Spawn damage particles
            spawnParticles(player.x, player.y, '#ff4444', 8);
            
            if (player.health <= 0) {
              playVoice('laugh');
              onDefeat();
              return { ...newState, active: false, phase: 'defeat' };
            }
          } else {
            player.shielded = false;
            spawnParticles(player.x, player.y, '#00ccff', 10);
          }
          continue; // Remove enemy
        }

        // Keep enemy if alive and on screen
        if (enemy.health > 0 && enemy.y < dimensions.height + 50) {
          remainingEnemies.push(enemy);
        }
      }

      newState.enemies = remainingEnemies;

      // Update drops with magnetization
      newState.drops = newDrops.filter((drop) => {
        drop.pulse += 0.1;
        
        // Check distance to player
        const dx = player.x - drop.x;
        const dy = player.y - drop.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Magnetize when in lower portion of screen
        if (drop.y > dimensions.height * 0.6 || dist < DROP_MAGNETIZE_RANGE) {
          drop.magnetized = true;
          // Pull toward player
          drop.x += dx * 0.08;
          drop.y += dy * 0.08;
        } else {
          drop.y += DROP_SPEED;
        }

        // Check pickup
        if (dist < PICKUP_RADIUS) {
          playSound('select');
          
          // Pickup particles
          const colors = { bomb: '#ff6600', health: '#ff4444', shield: '#00ccff' };
          spawnParticles(drop.x, drop.y, colors[drop.type], 10);
          
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

      // Update boss bullets (enemy fire) with trails
      newState.bossBullets = newState.bossBullets.filter((bullet) => {
        bullet.trail = [{ x: bullet.x, y: bullet.y }, ...bullet.trail.slice(0, 3)];
        bullet.y += bullet.speed;

        // Check player hit (only if not invincible)
        if (player.invincibleTimer <= 0 && bulletHitsEntity(bullet, player, player.width / 2)) {
          if (!player.shielded) {
            player.health -= 12;
            player.invincibleTimer = INVINCIBILITY_TIME;
            
            newState.screenShake = { x: 0, y: 0, intensity: 10 };
            spawnParticles(player.x, player.y, '#ff0066', 6);
            
            if (player.health <= 0) {
              playVoice('laugh');
              onDefeat();
              newState.active = false;
              newState.phase = 'defeat';
            }
          } else {
            player.shielded = false;
            spawnParticles(player.x, player.y, '#00ccff', 10);
          }
          return false;
        }

        return bullet.y < dimensions.height + 10;
      });

      // Boss phase logic
      if (newState.phase === 'boss') {
        // Decrease hit flash
        if (boss.hitFlash > 0) {
          boss.hitFlash -= deltaTime;
        }

        // Animate boss entrance
        if (boss.enterProgress < 1) {
          boss.enterProgress += 0.02;
          boss.y = -150 + (230 * boss.enterProgress);
        } else {
          boss.active = true;

          // Boss movement pattern - MORE AGGRESSIVE
          boss.patternTimer++;
          if (boss.patternTimer > BOSS_PATTERN_DURATION) {
            boss.pattern = (boss.pattern + 1) % 4; // Added pattern 3
            boss.patternTimer = 0;
            if (Math.random() < 0.5) {
              const taunts = ['coward', 'laugh', 'ideas', 'run', 'escape'] as const;
              const taunt = taunts[Math.floor(Math.random() * taunts.length)];
              if (taunt) playVoice(taunt);
            }
          }

          // Health-based rage mode
          const healthPercent = boss.health / boss.maxHealth;
          const rageMultiplier = healthPercent < 0.3 ? 2 : healthPercent < 0.5 ? 1.5 : 1;

          // Move boss based on pattern
          if (boss.pattern === 0) {
            // Sine wave
            boss.x += Math.sin(Date.now() * 0.003 * rageMultiplier) * 4;
          } else if (boss.pattern === 1) {
            // Chase player
            boss.x += (player.x - boss.x) * 0.03 * rageMultiplier;
          } else if (boss.pattern === 2) {
            // Dash across screen
            const targetX = boss.patternTimer < BOSS_PATTERN_DURATION / 2 
              ? dimensions.width * 0.2 
              : dimensions.width * 0.8;
            boss.x += (targetX - boss.x) * 0.05;
          } else {
            // Erratic
            boss.x += (Math.random() - 0.5) * 8 * rageMultiplier;
          }

          boss.x = Math.max(
            boss.width / 2,
            Math.min(dimensions.width - boss.width / 2, boss.x)
          );

          // Boss attacks - MORE AGGRESSIVE when low health
          const attackChance = BOSS_ATTACK_CHANCE * rageMultiplier;
          if (Math.random() < attackChance) {
            // Random taunt when attacking (15% chance)
            if (Math.random() < 0.15) {
              const taunts = ['coward', 'laugh', 'ideas', 'run', 'escape', 'see'] as const;
              const taunt = taunts[Math.floor(Math.random() * taunts.length)];
              if (taunt) playVoice(taunt);
            }
            
            // Spread shot
            const bulletCount = healthPercent < 0.5 ? 5 : 3;
            for (let i = 0; i < bulletCount; i++) {
              const spread = (i - Math.floor(bulletCount / 2)) * 25;
              newState.bossBullets.push({
                x: boss.x + spread,
                y: boss.y + 60,
                speed: 5 + (1 - healthPercent) * 2,
                damage: 15,
                isEnemy: true,
                trail: [],
              });
            }
          }

          // Rage mode special attack - aimed shots
          if (healthPercent < 0.3 && Math.random() < 0.02) {
            // Fire directly at player
            const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
            for (let i = -1; i <= 1; i++) {
              const bulletAngle = angle + i * 0.2;
              newState.bossBullets.push({
                x: boss.x,
                y: boss.y + 60,
                speed: 7,
                damage: 20,
                isEnemy: true,
                trail: [],
                // We'd need to add vx/vy to Bullet type for angled shots
              });
            }
          }
        }

        // Check bomb hits on boss
        newState.bullets = newState.bullets.filter((bullet) => {
          if (!bullet.isBomb) return true;

          if (bulletHitsEntity(bullet, boss, 30)) {
            boss.health -= bullet.damage;
            boss.hitFlash = 200;
            
            // BIG explosion
            spawnParticles(boss.x, boss.y, '#ff6600', 20);
            spawnParticles(boss.x, boss.y, '#ffcc00', 15);
            
            // Major screen shake
            newState.screenShake = { x: 0, y: 0, intensity: 25 };
            newState.hitPause = HIT_PAUSE_DURATION * 2;
            
            onShake();
            playSound('select');

            if (boss.health <= 0) {
              // Victory explosion
              for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                  spawnParticles(
                    boss.x + (Math.random() - 0.5) * 100,
                    boss.y + (Math.random() - 0.5) * 100,
                    '#ff6600',
                    15
                  );
                }, i * 100);
              }
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
  }, [dimensions, onStateUpdate, onVictory, onDefeat, onShake, playSound, playVoice, spawnParticles]);

  const start = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;
    lastFrameTime.current = performance.now();
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
