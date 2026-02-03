import type { GameState, GameDimensions } from './types';
import {
  PLAYER_SPEED,
  PLAYER_SIZE,
  PLAYER_MAX_HEALTH,
  PLAYER_FIRE_RATE,
  BOSS_SIZE,
  BOSS_MAX_HEALTH,
  BOSS_SPEED,
} from './constants';

export function createInitialState(dimensions: GameDimensions): GameState {
  return {
    phase: 'glitch',
    active: true,
    score: 0,
    waveTimer: 45,
    glitchTimer: 0,
    lastTauntTime: 0,
    particles: [],
    hitPause: 0,
    screenShake: { x: 0, y: 0, intensity: 0 },
    previousPhase: null,
    player: {
      x: dimensions.width / 2,
      y: dimensions.height - 80,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      speed: PLAYER_SPEED,
      health: PLAYER_MAX_HEALTH,
      maxHealth: PLAYER_MAX_HEALTH,
      bombs: 0,
      shielded: false,
      fireRate: PLAYER_FIRE_RATE,
      lastShot: 0,
      invincibleTimer: 0,
      trail: [],
    },
    boss: {
      x: dimensions.width / 2,
      y: -150,
      width: BOSS_SIZE,
      height: BOSS_SIZE,
      health: BOSS_MAX_HEALTH,
      maxHealth: BOSS_MAX_HEALTH,
      active: false,
      speed: BOSS_SPEED,
      pattern: 0,
      patternTimer: 0,
      hitFlash: 0,
      enterProgress: 0,
    },
    bullets: [],
    enemies: [],
    drops: [],
    bossBullets: [],
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      bomb: false,
    },
  };
}

export function resetGameState(
  state: GameState,
  dimensions: GameDimensions
): GameState {
  const initial = createInitialState(dimensions);
  return {
    ...initial,
    phase: 'wave',
    glitchTimer: 0,
  };
}
