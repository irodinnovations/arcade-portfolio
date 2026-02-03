// Game type definitions

export type GamePhase = 'glitch' | 'wave' | 'boss' | 'victory' | 'defeat' | 'paused';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity extends Vector2D {
  width: number;
  height: number;
}

export interface Player extends Entity {
  speed: number;
  health: number;
  maxHealth: number;
  bombs: number;
  shielded: boolean;
  fireRate: number;
  lastShot: number;
  invincibleTimer: number;
  trail: { x: number; y: number }[];
}

export interface Boss extends Entity {
  health: number;
  maxHealth: number;
  active: boolean;
  speed: number;
  pattern: number;
  patternTimer: number;
  hitFlash: number;
  enterProgress: number;
}

export type EnemyType = 'worker' | 'shooter' | 'carrier';

export interface Enemy extends Entity {
  type: EnemyType;
  speed: number;
  health: number;
  lastShot: number;
  hitFlash: number;
}

export interface Bullet extends Vector2D {
  speed: number;
  damage: number;
  isBomb?: boolean;
  isEnemy?: boolean;
  trail: { x: number; y: number }[];
}

export type DropType = 'bomb' | 'health' | 'shield';

export interface Drop extends Vector2D {
  type: DropType;
  pulse: number;
  magnetized: boolean;
}

export interface KeyState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  bomb: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  phase: GamePhase;
  active: boolean;
  score: number;
  waveTimer: number;
  player: Player;
  boss: Boss;
  bullets: Bullet[];
  enemies: Enemy[];
  drops: Drop[];
  bossBullets: Bullet[];
  keys: KeyState;
  glitchTimer: number;
  lastTauntTime: number;
  particles: Particle[];
  hitPause: number;
  screenShake: { x: number; y: number; intensity: number };
  previousPhase: GamePhase | null;
}

export interface GameDimensions {
  width: number;
  height: number;
}

// Voice types
export type VoiceType = 'beware' | 'run' | 'escape' | 'see' | 'ideas' | 'coward' | 'laugh';
