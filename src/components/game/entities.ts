import type { Enemy, EnemyType, Bullet, Drop, DropType, GameDimensions } from './types';
import {
  ENEMY_SIZE,
  CARRIER_SIZE,
  ENEMY_SPEED_MIN,
  ENEMY_SPEED_MAX,
  BULLET_SPEED,
  BOMB_SPEED,
  BOMB_DAMAGE,
} from './constants';

/**
 * Create a new enemy
 */
export function createEnemy(dimensions: GameDimensions): Enemy {
  const types: EnemyType[] = ['worker', 'worker', 'worker', 'shooter', 'carrier'];
  const type = types[Math.floor(Math.random() * types.length)] ?? 'worker';
  const size = type === 'carrier' ? CARRIER_SIZE : ENEMY_SIZE;

  return {
    x: Math.random() * (dimensions.width - 40) + 20,
    y: -30,
    width: size,
    height: size,
    type,
    speed: ENEMY_SPEED_MIN + Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN),
    health: type === 'carrier' ? 3 : 1,
    lastShot: 0,
  };
}

/**
 * Create a player bullet
 */
export function createBullet(x: number, y: number): Bullet {
  return {
    x,
    y,
    speed: BULLET_SPEED,
    damage: 1,
    isBomb: false,
  };
}

/**
 * Create a bomb (special bullet)
 */
export function createBomb(x: number, y: number): Bullet {
  return {
    x,
    y,
    speed: BOMB_SPEED,
    damage: BOMB_DAMAGE,
    isBomb: true,
  };
}

/**
 * Create an enemy bullet
 */
export function createEnemyBullet(x: number, y: number, speed: number = 4): Bullet {
  return {
    x,
    y,
    speed,
    damage: 15,
    isEnemy: true,
  };
}

/**
 * Create a boss bullet
 */
export function createBossBullet(x: number, y: number): Bullet {
  return {
    x,
    y,
    speed: 5,
    damage: 15,
    isEnemy: true,
  };
}

/**
 * Create a loot drop
 */
export function createDrop(x: number, y: number): Drop {
  const types: DropType[] = ['bomb', 'bomb', 'health', 'shield'];
  return {
    x,
    y,
    type: types[Math.floor(Math.random() * types.length)] ?? 'bomb',
    pulse: 0,
  };
}

/**
 * Get score for enemy type
 */
export function getEnemyScore(type: EnemyType): number {
  return type === 'carrier' ? 50 : 10;
}

/**
 * Check if enemy should drop loot
 */
export function shouldDropLoot(type: EnemyType): boolean {
  return type === 'carrier' || Math.random() < 0.2;
}
