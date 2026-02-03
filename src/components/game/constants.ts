// Game constants

// Timing
export const WAVE_DURATION = 45; // seconds
export const GLITCH_DURATION = 7000; // ms
export const GLITCH_PHASE_1 = 3000; // Random symbols
export const GLITCH_PHASE_2 = 5000; // Warning
export const TAUNT_COOLDOWN = 4000; // ms between taunts

// Player
export const PLAYER_SPEED = 6;
export const PLAYER_SIZE = 50;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_FIRE_RATE = 150; // ms

// Boss
export const BOSS_SIZE = 120;
export const BOSS_MAX_HEALTH = 200;  // Doubled for harder fight
export const BOSS_SPEED = 3;  // Faster movement
export const BOSS_PATTERN_DURATION = 90; // Faster pattern changes
export const BOSS_ATTACK_CHANCE = 0.05;  // More frequent attacks
export const BOMB_DAMAGE = 25;  // Slightly higher so 8 bombs to kill

// Enemies
export const ENEMY_SPAWN_RATE = 800; // ms
export const ENEMY_SIZE = 30;
export const CARRIER_SIZE = 40;
export const ENEMY_SPEED_MIN = 1.5;
export const ENEMY_SPEED_MAX = 3;
export const SHOOTER_FIRE_RATE = 1500; // ms

// Bullets
export const BULLET_SPEED = 10;
export const BOMB_SPEED = 8;
export const ENEMY_BULLET_SPEED = 4;
export const BOSS_BULLET_SPEED = 5;

// Drops
export const DROP_SPEED = 2;
export const DROP_CHANCE = 0.25;  // Slightly higher to compensate for harder boss
export const HEALTH_RESTORE = 30;
export const PICKUP_RADIUS = 45;
export const DROP_MAGNETIZE_RANGE = 80;  // When drops start pulling toward player

// Damage
export const ENEMY_COLLISION_DAMAGE = 15;  // Slightly reduced
export const ENEMY_BULLET_DAMAGE = 12;
export const INVINCIBILITY_TIME = 1000;  // 1 second of invincibility after hit
export const HIT_PAUSE_DURATION = 50;  // 50ms freeze frame on enemy kill

// Glitch symbols
export const GLITCH_SYMBOLS = '▓▒░█▄▀■□▪▫●○◐◑◒◓◔◕◖◗★☆✦✧⚡⚠⬡⬢⯃⯂';

// Voice files
export const WAVE_TAUNTS = ['run', 'escape', 'see', 'ideas', 'coward'] as const;
export const BOSS_TAUNTS = ['coward', 'laugh', 'ideas', 'run', 'escape'] as const;
