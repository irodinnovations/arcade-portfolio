import type { Particle, Vec2 } from './types';

const MAX_PARTICLES = 500;

export class ParticleSystem {
  private particles: Particle[] = [];

  update(deltaTime: number): void {
    const dt = deltaTime / 16.67; // Normalize to 60fps

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      
      // Physics
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= p.friction;
      p.vy *= p.friction;
      
      // Life
      p.life -= deltaTime;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    for (const p of this.particles) {
      const lifeRatio = p.life / p.maxLife;
      const alpha = Math.min(1, lifeRatio * 2);
      const size = p.size * (0.5 + lifeRatio * 0.5);

      ctx.globalAlpha = alpha;

      switch (p.type) {
        case 'spark':
          this.drawSpark(ctx, p, size);
          break;
        case 'explosion':
          this.drawExplosion(ctx, p, size, lifeRatio);
          break;
        case 'trail':
          this.drawTrail(ctx, p, size);
          break;
        case 'pickup':
          this.drawPickup(ctx, p, size, lifeRatio);
          break;
        case 'star':
          this.drawStar(ctx, p, size);
          break;
        case 'smoke':
          this.drawSmoke(ctx, p, size, lifeRatio);
          break;
      }
    }

    ctx.restore();
  }

  private drawSpark(ctx: CanvasRenderingContext2D, p: Particle, size: number): void {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.shadowColor = p.color;
    ctx.shadowBlur = size * 3;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  private drawExplosion(ctx: CanvasRenderingContext2D, p: Particle, size: number, lifeRatio: number): void {
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
    gradient.addColorStop(0, p.color);
    gradient.addColorStop(0.4, p.color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * (2 - lifeRatio), 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTrail(ctx: CanvasRenderingContext2D, p: Particle, size: number): void {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPickup(ctx: CanvasRenderingContext2D, p: Particle, size: number, lifeRatio: number): void {
    ctx.fillStyle = p.color;
    ctx.font = `${size * 2}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', p.x, p.y - (1 - lifeRatio) * 20);
  }

  private drawStar(ctx: CanvasRenderingContext2D, p: Particle, size: number): void {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, size, size);
  }

  private drawSmoke(ctx: CanvasRenderingContext2D, p: Particle, size: number, lifeRatio: number): void {
    ctx.fillStyle = p.color;
    ctx.globalAlpha *= 0.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * (1 + (1 - lifeRatio)), 0, Math.PI * 2);
    ctx.fill();
  }

  // Spawn methods
  spawnExplosion(x: number, y: number, color: string, count: number = 20, power: number = 1): void {
    for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = (2 + Math.random() * 4) * power;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 300 + Math.random() * 200,
        maxLife: 500,
        size: 3 + Math.random() * 4,
        color,
        type: 'explosion',
        gravity: 0.05,
        friction: 0.96,
      });
    }

    // Core flash
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 150,
      maxLife: 150,
      size: 30 * power,
      color: '#ffffff',
      type: 'explosion',
      gravity: 0,
      friction: 1,
    });
  }

  spawnSparks(x: number, y: number, color: string, count: number = 8): void {
    for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 200 + Math.random() * 200,
        maxLife: 400,
        size: 2 + Math.random() * 2,
        color,
        type: 'spark',
        gravity: 0.02,
        friction: 0.98,
      });
    }
  }

  spawnTrail(x: number, y: number, color: string): void {
    if (this.particles.length >= MAX_PARTICLES) return;

    this.particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 1 + Math.random(),
      life: 150,
      maxLife: 150,
      size: 3 + Math.random() * 2,
      color,
      type: 'trail',
      gravity: 0,
      friction: 0.95,
    });
  }

  spawnPickupEffect(x: number, y: number, color: string): void {
    for (let i = 0; i < 8 && this.particles.length < MAX_PARTICLES; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2 - 1,
        life: 400,
        maxLife: 400,
        size: 10,
        color,
        type: 'pickup',
        gravity: -0.02,
        friction: 0.95,
      });
    }
  }

  spawnDamageNumbers(x: number, y: number, damage: number): void {
    // Visual damage indicator
    this.spawnSparks(x, y, '#ff4444', 5);
  }

  spawnSmoke(x: number, y: number): void {
    if (this.particles.length >= MAX_PARTICLES) return;

    this.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.5 - Math.random() * 0.5,
      life: 500,
      maxLife: 500,
      size: 8 + Math.random() * 8,
      color: 'rgba(100, 100, 100, 0.3)',
      type: 'smoke',
      gravity: -0.01,
      friction: 0.99,
    });
  }

  clear(): void {
    this.particles = [];
  }

  get count(): number {
    return this.particles.length;
  }
}
