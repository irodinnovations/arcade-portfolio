import type { Player, Boss, Enemy, Bullet, Drop } from './types';

const GLITCH_SYMBOLS = '▓▒░█▄▀■□▪▫●○◐◑◒◓◔◕◖◗★☆✦✧⚡⚠⬡⬢⯃⯂';

export class Renderer {
  public ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private width: number;
  private height: number;
  private starPositions: { x: number; y: number; size: number; speed: number }[] = [];
  private time: number = 0;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = canvas.getContext('2d', { alpha: false })!;

    // Initialize stars
    for (let i = 0; i < 60; i++) {
      this.starPositions.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear(): void {
    this.ctx.fillStyle = '#050510';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  beginFrame(): void {
    this.ctx.save();
    this.time = performance.now();
  }

  endFrame(): void {
    this.ctx.restore();
  }

  drawBackground(sprite: HTMLImageElement): void {
    // Background image
    if (sprite.complete && sprite.naturalWidth > 0) {
      this.ctx.drawImage(sprite, 0, 0, this.width, this.height);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Scrolling stars with parallax
    for (const star of this.starPositions) {
      star.y = (star.y + star.speed * 0.5) % this.height;

      const twinkle = 0.5 + Math.sin(this.time * 0.003 + star.x) * 0.3;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    // Subtle grid overlay
    this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawPlayer(player: Player, sprite: HTMLImageElement): void {
    const ctx = this.ctx;
    const { x, y, width, height, invincibleTimer, shielded, trail } = player;

    // Trail effect
    ctx.save();
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      if (!t) continue;
      const alpha = (1 - i / trail.length) * 0.3;
      ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4 - i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Invincibility flash
    if (invincibleTimer > 0 && Math.floor(invincibleTimer / 80) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Ship sprite or fallback
    if (sprite.complete && sprite.naturalWidth > 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);

      // Glow behind ship
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, width);
      glow.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(-width, -width, width * 2, width * 2);

      ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
      ctx.restore();
    } else {
      // Fallback ship
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(x, y - 22);
      ctx.lineTo(x + 18, y + 18);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x - 18, y + 18);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Engine exhaust
    const exhaustSize = 8 + Math.random() * 6;
    const gradient = ctx.createRadialGradient(x, y + height / 2 + 8, 0, x, y + height / 2 + 8, exhaustSize);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.3, 'rgba(0, 255, 136, 0.8)');
    gradient.addColorStop(0.6, 'rgba(0, 200, 100, 0.4)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y + height / 2 + 8, exhaustSize, 0, Math.PI * 2);
    ctx.fill();

    // Shield
    if (shielded) {
      const shieldPulse = 0.6 + Math.sin(this.time * 0.01) * 0.2;
      ctx.strokeStyle = `rgba(0, 200, 255, ${shieldPulse})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ccff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, width * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Inner shield glow
      ctx.fillStyle = `rgba(0, 200, 255, 0.1)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }

  drawBoss(boss: Boss, sprite: HTMLImageElement): void {
    const ctx = this.ctx;
    const { x, y, width, health, maxHealth, hitFlash, enterProgress } = boss;

    // Boss scale animation
    const scale = 1 + Math.sin(this.time * 0.003) * 0.03;
    const size = width * scale;

    // Entrance effect
    if (enterProgress < 1) {
      ctx.globalAlpha = enterProgress;
    }

    // Aura layers
    for (let i = 3; i > 0; i--) {
      const auraSize = size * (0.7 + i * 0.15);
      const pulse = Math.sin(this.time * 0.005 + i) * 0.1;
      ctx.fillStyle = `rgba(255, 100, 50, ${0.1 - i * 0.02 + pulse})`;
      ctx.beginPath();
      ctx.arc(x, y, auraSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hit flash
    if (hitFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${hitFlash / 200})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boss sprite or fallback
    if (sprite.complete && sprite.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = hitFlash > 0 ? '#ffffff' : '#ff6633';
      ctx.shadowBlur = hitFlash > 0 ? 30 : 20;
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      ctx.restore();
    } else {
      ctx.fillStyle = hitFlash > 0 ? '#ffffff' : '#ff6633';
      ctx.shadowColor = '#ff6633';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;

    // Health bar (fancy)
    this.drawBossHealthBar(health, maxHealth);
  }

  private drawBossHealthBar(health: number, maxHealth: number): void {
    const ctx = this.ctx;
    const barWidth = 220;
    const barHeight = 16;
    const x = (this.width - barWidth) / 2;
    const y = 55;
    const healthPercent = health / maxHealth;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 5, y - 5, barWidth + 10, barHeight + 10);

    // Border glow
    ctx.strokeStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, barWidth + 4, barHeight + 4);
    ctx.shadowBlur = 0;

    // Health gradient
    const gradient = ctx.createLinearGradient(x, y, x + barWidth * healthPercent, y);
    gradient.addColorStop(0, '#ff6666');
    gradient.addColorStop(0.5, '#ff4444');
    gradient.addColorStop(1, '#cc2222');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight / 2);

    // Boss label
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RODNEY', this.width / 2, y - 10);
  }

  drawEnemy(enemy: Enemy): void {
    const ctx = this.ctx;
    const { x, y, width, type, hitFlash } = enemy;

    const colors = {
      worker: { main: '#aa44ff', glow: '#cc66ff' },
      shooter: { main: '#ff4444', glow: '#ff6666' },
      carrier: { main: '#ffaa00', glow: '#ffcc44' },
    };
    const color = colors[type];

    // Glow
    ctx.save();
    ctx.shadowColor = color.glow;
    ctx.shadowBlur = hitFlash > 0 ? 25 : 12;

    // Hit flash
    if (hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = color.main;
    }

    // Body
    ctx.beginPath();
    ctx.arc(x, y, width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    const innerGradient = ctx.createRadialGradient(x, y - 3, 0, x, y, width / 2);
    innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    innerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGradient;
    ctx.fill();

    ctx.shadowBlur = 0;

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - 5, y - 2, 3, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 1, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 3, 1, 0, Math.PI * 2);
    ctx.fill();

    // Type indicator
    if (type === 'shooter') {
      // Angry eyebrows
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 7);
      ctx.lineTo(x - 3, y - 5);
      ctx.moveTo(x + 8, y - 7);
      ctx.lineTo(x + 3, y - 5);
      ctx.stroke();
    } else if (type === 'carrier') {
      // Cargo indicator
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x - 6, y + 3, 12, 6);
    }

    ctx.restore();
  }

  drawBullet(bullet: Bullet): void {
    const ctx = this.ctx;
    const { x, y, isBomb, isEnemy, trail } = bullet;

    if (isBomb) {
      // Bomb trail
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        if (!t) continue;
        const alpha = (1 - i / trail.length) * 0.5;
        ctx.fillStyle = `rgba(255, 102, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 8 - i, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bomb body
      ctx.save();
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 20;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#ffcc00');
      gradient.addColorStop(0.6, '#ff6600');
      gradient.addColorStop(1, '#cc3300');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else if (isEnemy) {
      // Enemy bullet
      ctx.save();
      ctx.shadowColor = '#ff0066';
      ctx.shadowBlur = 15;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 7);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.4, '#ff4488');
      gradient.addColorStop(1, '#ff0066');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else {
      // Player bullet
      ctx.save();
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 10;

      // Elongated laser
      const gradient = ctx.createLinearGradient(x, y - 8, x, y + 4);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#00ffcc');
      gradient.addColorStop(1, 'rgba(0, 255, 204, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 2, y - 8, 4, 12);

      ctx.restore();
    }
  }

  drawDrop(drop: Drop): void {
    const ctx = this.ctx;
    const { x, y, type, pulse, magnetized } = drop;

    const glow = 0.7 + Math.sin(pulse) * 0.3;
    const scale = 1 + Math.sin(pulse * 1.5) * 0.1;
    const bob = Math.sin(pulse * 2) * 3;

    ctx.save();
    ctx.globalAlpha = glow;

    // Glow circle
    const colors = {
      bomb: '#ff6600',
      health: '#ff4444',
      shield: '#00ccff',
    };
    ctx.shadowColor = colors[type];
    ctx.shadowBlur = magnetized ? 25 : 15;
    ctx.fillStyle = colors[type] + '44';
    ctx.beginPath();
    ctx.arc(x, y + bob, 18 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    ctx.shadowBlur = 0;
    ctx.font = `${24 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const emojis = { bomb: '💣', health: '❤️', shield: '🛡️' };
    ctx.fillText(emojis[type], x, y + bob);

    ctx.restore();
  }

  drawGlitchOverlay(timer: number): void {
    const ctx = this.ctx;
    const progress = timer / 7000;

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, this.width, this.height);

    for (let y = 0; y < this.height; y += 3) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + Math.random() * 0.1})`;
      ctx.fillRect(0, y, this.width, 1);
    }

    // Phase text
    let text = '';
    let color = '#00ff88';

    if (timer < 3000) {
      // Random glitch symbols
      for (let i = 0; i < 15; i++) {
        text += GLITCH_SYMBOLS[Math.floor(Math.random() * GLITCH_SYMBOLS.length)];
      }
    } else if (timer < 5000) {
      // Warning
      text = '⚠ WARNING ⚠';
      color = '#ff4444';

      // Flash effect
      ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + Math.sin(timer * 0.02) * 0.1})`;
      ctx.fillRect(0, 0, this.width, this.height);
    } else {
      // Reveal
      text = 'BEWARE, I BUILD!';
      color = '#ffd700';
    }

    // RGB split effect
    ctx.font = 'bold 36px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (timer < 5000) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillText(text, this.width / 2 + 3, this.height / 2);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.fillText(text, this.width / 2 - 3, this.height / 2);
    }

    // Main text
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = timer >= 5000 ? 30 : 15;
    ctx.fillText(text, this.width / 2, this.height / 2);
    ctx.shadowBlur = 0;

    // Instructions
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '14px Rajdhani, sans-serif';
    ctx.fillText('Press ESC to skip', this.width / 2, this.height - 40);
  }
}
