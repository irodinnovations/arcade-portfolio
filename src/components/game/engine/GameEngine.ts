import type {
  GamePhase,
  Player,
  Boss,
  Enemy,
  Bullet,
  Drop,
  GameInput,
  GameStats,
  GameConfig,
  EnemyType,
  DropType,
} from './types';
import { ParticleSystem } from './ParticleSystem';
import { ScreenEffects } from './ScreenEffects';
import { AudioManager } from './AudioManager';
import { Renderer } from './Renderer';

const DEFAULT_CONFIG: GameConfig = {
  width: 600,
  height: 700,
  playerSpeed: 7,
  playerFireRate: 120,
  bulletSpeed: 12,
  enemySpawnRate: 750,
  waveDuration: 45,
};

export class GameEngine {
  // Systems
  public particles: ParticleSystem;
  public effects: ScreenEffects;
  public audio: AudioManager;
  public renderer: Renderer;

  // Game state
  private phase: GamePhase = 'glitch';
  private player!: Player;
  private boss!: Boss;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private drops: Drop[] = [];
  private stats: GameStats;
  private config: GameConfig;

  // Input
  private input: GameInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    bomb: false,
    bombJustPressed: false,
  };
  private prevBomb: boolean = false;

  // Timing
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly FIXED_DT = 1000 / 60; // 60fps fixed timestep
  private enemySpawnTimer: number = 0;
  private glitchTimer: number = 0;

  // Callbacks
  private onPhaseChange?: (phase: GamePhase) => void;
  private onStatsChange?: (stats: GameStats) => void;

  // Sprites
  private sprites: {
    player: HTMLImageElement;
    boss: HTMLImageElement;
    background: HTMLImageElement;
  };

  constructor(canvas: HTMLCanvasElement, config?: Partial<GameConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.particles = new ParticleSystem();
    this.effects = new ScreenEffects();
    this.audio = new AudioManager();
    this.renderer = new Renderer(canvas, this.config.width, this.config.height);

    this.stats = this.createStats();
    this.sprites = this.loadSprites();
    this.initializeEntities();
  }

  private loadSprites() {
    const player = new Image();
    player.src = '/images/game/player-ship.webp';
    const boss = new Image();
    boss.src = '/images/game/boss-rodney.webp';
    const background = new Image();
    background.src = '/images/game/background.webp';
    return { player, boss, background };
  }

  private createStats(): GameStats {
    return {
      score: 0,
      waveTimer: this.config.waveDuration,
      enemiesKilled: 0,
      bombsUsed: 0,
      damageTaken: 0,
      maxCombo: 0,
      currentCombo: 0,
      comboTimer: 0,
    };
  }

  private initializeEntities(): void {
    this.player = {
      x: this.config.width / 2,
      y: this.config.height - 80,
      vx: 0,
      vy: 0,
      width: 50,
      height: 50,
      rotation: 0,
      scale: 1,
      alpha: 1,
      active: true,
      health: 100,
      maxHealth: 100,
      bombs: 0,
      shielded: false,
      shieldTimer: 0,
      invincibleTimer: 0,
      lastShot: 0,
      fireRate: this.config.playerFireRate,
      trail: [],
    };

    this.boss = {
      x: this.config.width / 2,
      y: -150,
      vx: 0,
      vy: 0,
      width: 120,
      height: 120,
      rotation: 0,
      scale: 1,
      alpha: 1,
      active: false,
      health: 100,
      maxHealth: 100,
      pattern: 0,
      patternTimer: 0,
      hitFlash: 0,
      enterProgress: 0,
    };
  }

  // Public API
  setCallbacks(
    onPhaseChange: (phase: GamePhase) => void,
    onStatsChange: (stats: GameStats) => void
  ): void {
    this.onPhaseChange = onPhaseChange;
    this.onStatsChange = onStatsChange;
  }

  setMuted(muted: boolean): void {
    this.audio.setMuted(muted);
  }

  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.renderer.resize(width, height);
  }

  start(): void {
    this.phase = 'glitch';
    this.glitchTimer = 0;
    this.stats = this.createStats();
    this.initializeEntities();
    this.enemies = [];
    this.bullets = [];
    this.drops = [];
    this.particles.clear();
    this.effects.reset();
    this.audio.unlock();
    this.lastTime = performance.now();
    this.onPhaseChange?.(this.phase);
  }

  reset(): void {
    this.start();
  }

  // Input handling
  setInput(input: Partial<GameInput>): void {
    Object.assign(this.input, input);
  }

  handleKeyDown(key: string): void {
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') this.input.left = true;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') this.input.right = true;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') this.input.up = true;
    if (key === 'ArrowDown' || key === 's' || key === 'S') this.input.down = true;
    if (key === ' ') this.input.bomb = true;
  }

  handleKeyUp(key: string): void {
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') this.input.left = false;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') this.input.right = false;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') this.input.up = false;
    if (key === 'ArrowDown' || key === 's' || key === 'S') this.input.down = false;
    if (key === ' ') this.input.bomb = false;
  }

  handleTouch(x: number, y: number): void {
    const targetY = Math.max(this.config.height * 0.5, y);
    this.player.x += (x - this.player.x) * 0.2;
    this.player.y += (targetY - this.player.y) * 0.2;
  }

  // Main update loop
  update(currentTime: number): void {
    const deltaTime = Math.min(currentTime - this.lastTime, 50); // Cap at 50ms
    this.lastTime = currentTime;

    // Handle bomb input edge detection
    this.input.bombJustPressed = this.input.bomb && !this.prevBomb;
    this.prevBomb = this.input.bomb;

    // Update based on phase
    switch (this.phase) {
      case 'glitch':
        this.updateGlitch(deltaTime);
        break;
      case 'wave':
      case 'boss':
        this.updateGameplay(deltaTime);
        break;
      case 'victory':
      case 'defeat':
        this.updateEndScreen(deltaTime);
        break;
    }

    // Always update particles and effects
    this.particles.update(deltaTime);
    this.effects.update(deltaTime);
  }

  private updateGlitch(deltaTime: number): void {
    this.glitchTimer += deltaTime;

    if (this.glitchTimer >= 7000) {
      this.setPhase('wave');
      this.stats.waveTimer = this.config.waveDuration;
    } else if (this.glitchTimer >= 5000) {
      // Reveal phase - nothing special needed
    } else if (this.glitchTimer >= 3000) {
      // Warning phase
    }
  }

  private updateGameplay(deltaTime: number): void {
    const dt = deltaTime * this.effects.timeScale;

    // Update player
    this.updatePlayer(dt);

    // Update bullets
    this.updateBullets(dt);

    // Update enemies (wave phase)
    if (this.phase === 'wave') {
      this.updateEnemies(dt);
      this.updateWaveTimer(deltaTime);
      this.spawnEnemies(dt);
    }

    // Update boss (boss phase)
    if (this.phase === 'boss') {
      this.updateBoss(dt);
    }

    // Update drops
    this.updateDrops(dt);

    // Update combo timer
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= deltaTime;
      if (this.stats.comboTimer <= 0) {
        this.stats.currentCombo = 0;
      }
    }

    // Notify stats change
    this.onStatsChange?.(this.stats);
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    const speed = this.config.playerSpeed * (dt / 16.67);

    // Movement
    if (this.input.left) p.vx = -speed;
    else if (this.input.right) p.vx = speed;
    else p.vx *= 0.8;

    if (this.input.up) p.vy = -speed;
    else if (this.input.down) p.vy = speed;
    else p.vy *= 0.8;

    p.x += p.vx;
    p.y += p.vy;

    // Bounds
    p.x = Math.max(p.width / 2, Math.min(this.config.width - p.width / 2, p.x));
    p.y = Math.max(
      this.config.height * 0.5,
      Math.min(this.config.height - p.height / 2, p.y)
    );

    // Trail
    p.trail.unshift({ x: p.x, y: p.y + p.height / 2 });
    if (p.trail.length > 10) p.trail.pop();

    // Engine particles
    if (Math.random() < 0.5) {
      this.particles.spawnTrail(p.x, p.y + p.height / 2, '#00ff88');
    }

    // Auto-fire
    const now = performance.now();
    if (now - p.lastShot >= p.fireRate) {
      p.lastShot = now;
      this.fireBullet(p.x, p.y - p.height / 2);
    }

    // Fire bomb
    if (this.input.bombJustPressed && this.phase === 'boss' && p.bombs > 0) {
      this.fireBomb();
    }

    // Update timers
    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
    if (p.shieldTimer > 0) {
      p.shieldTimer -= dt;
      if (p.shieldTimer <= 0) p.shielded = false;
    }
  }

  private fireBullet(x: number, y: number): void {
    this.bullets.push({
      x,
      y,
      vx: 0,
      vy: -this.config.bulletSpeed,
      width: 4,
      height: 12,
      rotation: 0,
      scale: 1,
      alpha: 1,
      active: true,
      damage: 1,
      isBomb: false,
      isEnemy: false,
      trail: [],
    });
    this.audio.playSound('tick');
  }

  private fireBomb(): void {
    const p = this.player;
    p.bombs--;
    this.stats.bombsUsed++;

    this.bullets.push({
      x: p.x,
      y: p.y - p.height / 2,
      vx: 0,
      vy: -10,
      width: 20,
      height: 20,
      rotation: 0,
      scale: 1,
      alpha: 1,
      active: true,
      damage: 25,
      isBomb: true,
      isEnemy: false,
      trail: [],
    });

    this.audio.playSound('launch');
    this.audio.playVoice('coward');
    this.effects.shake(5);
  }

  private updateBullets(dt: number): void {
    const speed = dt / 16.67;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b) continue;

      // Movement
      b.x += b.vx * speed;
      b.y += b.vy * speed;

      // Trail for bombs
      if (b.isBomb) {
        b.trail.unshift({ x: b.x, y: b.y });
        if (b.trail.length > 8) b.trail.pop();
        if (Math.random() < 0.3) {
          this.particles.spawnSmoke(b.x, b.y + 10);
        }
      }

      // Check if off-screen
      if (b.y < -20 || b.y > this.config.height + 20) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Collision detection
      if (b.isEnemy) {
        // Enemy bullet hits player
        if (this.checkBulletHitsPlayer(b)) {
          this.bullets.splice(i, 1);
        }
      } else if (b.isBomb && this.phase === 'boss') {
        // Bomb hits boss
        if (this.checkBombHitsBoss(b)) {
          this.bullets.splice(i, 1);
        }
      } else {
        // Player bullet hits enemies
        if (this.checkBulletHitsEnemies(b)) {
          this.bullets.splice(i, 1);
        }
      }
    }
  }

  private checkBulletHitsPlayer(b: Bullet): boolean {
    const p = this.player;
    if (p.invincibleTimer > 0) return false;

    const dx = b.x - p.x;
    const dy = b.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < p.width / 2 + 6) {
      if (p.shielded) {
        p.shielded = false;
        this.particles.spawnExplosion(b.x, b.y, '#00ccff', 10, 0.5);
        this.audio.playSound('hit');
        return true;
      }

      this.damagePlayer(15);
      return true;
    }
    return false;
  }

  private checkBulletHitsEnemies(b: Bullet): boolean {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e) continue;
      const dx = b.x - e.x;
      const dy = b.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < e.width / 2 + 5) {
        e.health -= b.damage;
        e.hitFlash = 100;
        this.particles.spawnSparks(b.x, b.y, this.getEnemyColor(e.type), 5);

        if (e.health <= 0) {
          this.killEnemy(e, i);
        }
        return true;
      }
    }
    return false;
  }

  private checkBombHitsBoss(b: Bullet): boolean {
    const boss = this.boss;
    if (!boss.active) return false;

    const dx = b.x - boss.x;
    const dy = b.y - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < boss.width / 2 + 15) {
      boss.health -= b.damage;
      boss.hitFlash = 200;

      this.particles.spawnExplosion(b.x, b.y, '#ff6600', 30, 1.5);
      this.audio.playSound('explosion');
      this.effects.bigImpact();

      if (boss.health <= 0) {
        this.victory();
      }
      return true;
    }
    return false;
  }

  private updateEnemies(dt: number): void {
    const speed = dt / 16.67;
    const now = performance.now();

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e) continue;

      // Movement
      e.y += e.vy * speed;

      // Hit flash decay
      if (e.hitFlash > 0) e.hitFlash -= dt;

      // Shooter fires
      if (e.type === 'shooter' && now - e.lastShot > 1500) {
        e.lastShot = now;
        this.bullets.push({
          x: e.x,
          y: e.y + e.height / 2,
          vx: 0,
          vy: 5,
          width: 12,
          height: 12,
          rotation: 0,
          scale: 1,
          alpha: 1,
          active: true,
          damage: 15,
          isBomb: false,
          isEnemy: true,
          trail: [],
        });
      }

      // Check player collision
      if (this.player.invincibleTimer <= 0) {
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.player.width / 2 + e.width / 2 - 10) {
          if (this.player.shielded) {
            this.player.shielded = false;
            this.particles.spawnExplosion(e.x, e.y, '#00ccff', 15);
            this.enemies.splice(i, 1);
            continue;
          }

          this.damagePlayer(20);
          this.enemies.splice(i, 1);
          continue;
        }
      }

      // Remove if off-screen
      if (e.y > this.config.height + 50) {
        this.enemies.splice(i, 1);
        this.stats.currentCombo = 0;
      }
    }
  }

  private spawnEnemies(dt: number): void {
    this.enemySpawnTimer += dt;

    if (this.enemySpawnTimer >= this.config.enemySpawnRate) {
      this.enemySpawnTimer = 0;

      const types: EnemyType[] = ['worker', 'worker', 'worker', 'shooter', 'carrier'];
      const type = types[Math.floor(Math.random() * types.length)] ?? 'worker';
      const size = type === 'carrier' ? 40 : 30;

      this.enemies.push({
        x: Math.random() * (this.config.width - 60) + 30,
        y: -30,
        vx: 0,
        vy: 1.5 + Math.random() * 1.5,
        width: size,
        height: size,
        rotation: 0,
        scale: 1,
        alpha: 1,
        active: true,
        type,
        health: type === 'carrier' ? 3 : 1,
        maxHealth: type === 'carrier' ? 3 : 1,
        lastShot: performance.now(),
        hitFlash: 0,
      });
    }
  }

  private killEnemy(e: Enemy, index: number): void {
    const score = e.type === 'carrier' ? 50 : 10;
    this.stats.score += score * (1 + Math.floor(this.stats.currentCombo / 5));
    this.stats.enemiesKilled++;
    this.stats.currentCombo++;
    this.stats.comboTimer = 2000;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.currentCombo);

    this.particles.spawnExplosion(e.x, e.y, this.getEnemyColor(e.type), 15);
    this.audio.playSound('hit');

    // Drop loot
    if (e.type === 'carrier' || Math.random() < 0.2) {
      const types: DropType[] = ['bomb', 'bomb', 'health', 'shield'];
      const type = types[Math.floor(Math.random() * types.length)] ?? 'bomb';
      this.drops.push({
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 2,
        width: 24,
        height: 24,
        rotation: 0,
        scale: 1,
        alpha: 1,
        active: true,
        type,
        pulse: 0,
        magnetized: false,
      });
    }

    this.enemies.splice(index, 1);
  }

  private getEnemyColor(type: EnemyType): string {
    const colors = { worker: '#aa44ff', shooter: '#ff4444', carrier: '#ffaa00' };
    return colors[type];
  }

  private updateBoss(dt: number): void {
    const boss = this.boss;
    const speed = dt / 16.67;

    // Entrance animation
    if (boss.enterProgress < 1) {
      boss.enterProgress += dt * 0.001;
      boss.y = -150 + boss.enterProgress * 230;
      if (boss.enterProgress >= 1) {
        boss.active = true;
        boss.y = 80;
      }
      return;
    }

    // Boss movement patterns
    boss.patternTimer += dt;
    if (boss.patternTimer > 2000) {
      boss.pattern = (boss.pattern + 1) % 3;
      boss.patternTimer = 0;
      if (Math.random() < 0.4) {
        this.audio.playRandomTaunt('boss');
      }
    }

    // Apply pattern
    if (boss.pattern === 0) {
      // Sine wave
      boss.x += Math.sin(performance.now() * 0.002) * 3 * speed;
    } else if (boss.pattern === 1) {
      // Track player
      boss.x += (this.player.x - boss.x) * 0.02 * speed;
    }
    // Pattern 2: Stay still

    // Bounds
    boss.x = Math.max(boss.width / 2, Math.min(this.config.width - boss.width / 2, boss.x));

    // Hit flash decay
    if (boss.hitFlash > 0) boss.hitFlash -= dt;

    // Attack
    if (Math.random() < 0.02) {
      for (let i = -1; i <= 1; i++) {
        this.bullets.push({
          x: boss.x + i * 30,
          y: boss.y + boss.height / 2,
          vx: i * 0.5,
          vy: 6,
          width: 12,
          height: 12,
          rotation: 0,
          scale: 1,
          alpha: 1,
          active: true,
          damage: 15,
          isBomb: false,
          isEnemy: true,
          trail: [],
        });
      }
    }
  }

  private updateDrops(dt: number): void {
    const speed = dt / 16.67;
    const p = this.player;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      if (!d) continue;

      d.pulse += dt * 0.005;
      d.y += d.vy * speed;

      // Magnetize when close
      const dx = p.x - d.x;
      const dy = p.y - d.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 80) {
        d.magnetized = true;
      }

      if (d.magnetized) {
        d.x += dx * 0.15;
        d.y += dy * 0.15;
      }

      // Pickup
      if (dist < 30) {
        this.collectDrop(d);
        this.drops.splice(i, 1);
        continue;
      }

      // Off-screen
      if (d.y > this.config.height + 20) {
        this.drops.splice(i, 1);
      }
    }
  }

  private collectDrop(d: Drop): void {
    const p = this.player;
    const colors = { bomb: '#ff6600', health: '#ff4444', shield: '#00ccff' };

    this.particles.spawnPickupEffect(d.x, d.y, colors[d.type]);
    this.audio.playSound('pickup');

    if (d.type === 'bomb') {
      p.bombs++;
    } else if (d.type === 'health') {
      p.health = Math.min(p.maxHealth, p.health + 25);
      this.effects.flash('#00ff44', 0.2);
    } else if (d.type === 'shield') {
      p.shielded = true;
      p.shieldTimer = 10000;
      this.effects.flash('#00ccff', 0.2);
    }
  }

  private updateWaveTimer(deltaTime: number): void {
    // This is called separately to use real delta time, not scaled
    this.stats.waveTimer -= deltaTime / 1000;

    if (this.stats.waveTimer <= 0) {
      this.setPhase('boss');
    }

    // Random taunts
    if (Math.random() < 0.002) {
      this.audio.playRandomTaunt('wave');
    }
  }

  private damagePlayer(amount: number): void {
    const p = this.player;
    p.health -= amount;
    p.invincibleTimer = 1000;
    this.stats.damageTaken += amount;
    this.stats.currentCombo = 0;

    this.particles.spawnExplosion(p.x, p.y, '#ff4444', 10, 0.8);
    this.audio.playSound('damage');
    this.effects.impact(1);

    if (p.health <= 0) {
      this.defeat();
    }
  }

  private updateEndScreen(dt: number): void {
    // Particles still update, creating ambient effect
    if (this.phase === 'victory') {
      if (Math.random() < 0.1) {
        this.particles.spawnSparks(
          Math.random() * this.config.width,
          Math.random() * this.config.height,
          '#ffd700',
          3
        );
      }
    }
  }

  private setPhase(phase: GamePhase): void {
    const prevPhase = this.phase;
    this.phase = phase;

    if (phase === 'boss') {
      this.enemies = [];
      this.boss.enterProgress = 0;
      this.boss.health = this.boss.maxHealth;
      this.audio.playVoice('beware');
      this.effects.bigImpact();
    }

    this.onPhaseChange?.(phase);
  }

  private victory(): void {
    this.setPhase('victory');
    this.particles.spawnExplosion(this.boss.x, this.boss.y, '#ffd700', 50, 2);
    this.audio.playSound('explosion');
    this.audio.playSound('launch');
    this.effects.victory();
  }

  private defeat(): void {
    this.setPhase('defeat');
    this.audio.playVoice('laugh');
    this.effects.bigImpact();
  }

  skipGlitch(): void {
    if (this.phase === 'glitch') {
      this.glitchTimer = 7000;
    }
  }

  // Rendering
  render(): void {
    this.renderer.clear();
    this.renderer.beginFrame();
    this.effects.applyTransform(this.renderer.ctx);

    // Background
    this.renderer.drawBackground(this.sprites.background);

    // Chromatic aberration effect
    const chromatic = this.effects.chromaticOffset;
    if (chromatic > 0.1) {
      this.renderer.ctx.save();
      this.renderer.ctx.globalCompositeOperation = 'lighter';
      this.renderer.ctx.globalAlpha = 0.1;
      this.renderer.ctx.translate(-chromatic, 0);
      this.renderEntities();
      this.renderer.ctx.translate(chromatic * 2, 0);
      this.renderEntities();
      this.renderer.ctx.restore();
    }

    this.renderEntities();

    // Effects overlay
    this.effects.renderOverlay(this.renderer.ctx, this.config.width, this.config.height);

    // Glitch overlay
    if (this.phase === 'glitch') {
      this.renderer.drawGlitchOverlay(this.glitchTimer);
    }

    this.renderer.endFrame();
  }

  private renderEntities(): void {
    const ctx = this.renderer.ctx;

    // Drops (behind everything)
    for (const d of this.drops) {
      this.renderer.drawDrop(d);
    }

    // Enemies
    for (const e of this.enemies) {
      this.renderer.drawEnemy(e);
    }

    // Bullets
    for (const b of this.bullets) {
      this.renderer.drawBullet(b);
    }

    // Boss
    if (this.phase === 'boss') {
      this.renderer.drawBoss(this.boss, this.sprites.boss);
    }

    // Player
    this.renderer.drawPlayer(this.player, this.sprites.player);

    // Particles
    this.particles.render(ctx);
  }

  // Getters
  getPhase(): GamePhase {
    return this.phase;
  }

  getStats(): GameStats {
    return { ...this.stats };
  }

  getPlayer(): Player {
    return this.player;
  }

  getGlitchProgress(): number {
    return this.glitchTimer / 7000;
  }

  destroy(): void {
    this.particles.clear();
    this.effects.reset();
  }
}
