// AAA Game Engine Types

export type GamePhase = 'glitch' | 'wave' | 'boss' | 'victory' | 'defeat';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  alpha: number;
  active: boolean;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  bombs: number;
  shielded: boolean;
  shieldTimer: number;
  invincibleTimer: number;
  lastShot: number;
  fireRate: number;
  trail: Vec2[];
}

export interface Boss extends Entity {
  health: number;
  maxHealth: number;
  pattern: number;
  patternTimer: number;
  hitFlash: number;
  enterProgress: number;
}

export type EnemyType = 'worker' | 'shooter' | 'carrier';

export interface Enemy extends Entity {
  type: EnemyType;
  health: number;
  maxHealth: number;
  lastShot: number;
  hitFlash: number;
}

export interface Bullet extends Entity {
  damage: number;
  isBomb: boolean;
  isEnemy: boolean;
  trail: Vec2[];
}

export type DropType = 'bomb' | 'health' | 'shield';

export interface Drop extends Entity {
  type: DropType;
  pulse: number;
  magnetized: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'explosion' | 'trail' | 'pickup' | 'star' | 'smoke';
  gravity: number;
  friction: number;
}

export interface ScreenEffect {
  shake: number;
  shakeDecay: number;
  flash: number;
  flashColor: string;
  chromatic: number;
  slowmo: number;
}

export interface GameInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  bomb: boolean;
  bombJustPressed: boolean;
}

export interface GameStats {
  score: number;
  waveTimer: number;
  enemiesKilled: number;
  bombsUsed: number;
  damageTaken: number;
  maxCombo: number;
  currentCombo: number;
  comboTimer: number;
}

export interface GameConfig {
  width: number;
  height: number;
  playerSpeed: number;
  playerFireRate: number;
  bulletSpeed: number;
  enemySpawnRate: number;
  waveDuration: number;
}

export type VoiceLine = 'beware' | 'run' | 'escape' | 'see' | 'ideas' | 'coward' | 'laugh';
export type SoundEffect = 'tick' | 'select' | 'launch' | 'navigate' | 'countdown' | 'hit' | 'explosion' | 'pickup' | 'damage';
