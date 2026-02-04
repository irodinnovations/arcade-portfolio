import type { GameState, GameDimensions, Enemy, Bullet, Drop, Particle } from './types';

interface Sprites {
  player: HTMLImageElement;
  boss: HTMLImageElement;
  background: HTMLImageElement;
  bomb?: HTMLImageElement;
  health?: HTMLImageElement;
  shield?: HTMLImageElement;
  explosion?: HTMLImageElement;
  bulletPlayer?: HTMLImageElement;
  bulletEnemy?: HTMLImageElement;
}

// Star field for parallax scrolling
const stars: { x: number; y: number; size: number; speed: number }[] = [];
for (let i = 0; i < 60; i++) {
  stars.push({
    x: Math.random() * 800,
    y: Math.random() * 1000,
    size: 0.5 + Math.random() * 1.5,
    speed: 0.3 + Math.random() * 1.2,
  });
}

/**
 * Draw the game background with parallax stars
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  dimensions: GameDimensions,
  sprites: Sprites
): void {
  // Background image or gradient
  if (sprites.background.complete && sprites.background.naturalWidth > 0) {
    ctx.drawImage(sprites.background, 0, 0, dimensions.width, dimensions.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0d0d25');
    gradient.addColorStop(1, '#050510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  // Parallax scrolling stars
  const time = Date.now();
  for (const star of stars) {
    star.y = (star.y + star.speed * 0.5) % dimensions.height;
    const twinkle = 0.4 + Math.sin(time * 0.003 + star.x) * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.beginPath();
    ctx.arc(star.x % dimensions.width, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle grid overlay
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let x = 0; x < dimensions.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, dimensions.height);
    ctx.stroke();
  }
}

/**
 * Draw the player ship with trail and effects
 */
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  sprites: Sprites
): void {
  const { player } = state;

  // Draw trail
  ctx.save();
  for (let i = 0; i < player.trail.length; i++) {
    const t = player.trail[i];
    if (!t) continue;
    const alpha = (1 - i / player.trail.length) * 0.4;
    const size = 4 - i * 0.5;
    ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y + player.height / 2, Math.max(1, size), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Invincibility flash - blink effect
  if (player.invincibleTimer > 0) {
    if (Math.floor(player.invincibleTimer / 80) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
  }

  // Engine exhaust
  const exhaustSize = 8 + Math.random() * 6;
  const gradient = ctx.createRadialGradient(
    player.x, player.y + player.height / 2 + 8, 0,
    player.x, player.y + player.height / 2 + 8, exhaustSize
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.3, 'rgba(0, 255, 136, 0.8)');
  gradient.addColorStop(0.6, 'rgba(0, 200, 100, 0.4)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(player.x, player.y + player.height / 2 + 8, exhaustSize, 0, Math.PI * 2);
  ctx.fill();

  // Ship sprite - already oriented pointing UP, no rotation needed
  if (sprites.player.complete && sprites.player.naturalWidth > 0) {
    ctx.save();
    // Glow effect
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 20;
    
    ctx.drawImage(
      sprites.player,
      player.x - player.width / 2,
      player.y - player.height / 2,
      player.width,
      player.height
    );
    ctx.restore();
  } else {
    // Fallback triangle ship
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 22);
    ctx.lineTo(player.x + 18, player.y + 18);
    ctx.lineTo(player.x, player.y + 10);
    ctx.lineTo(player.x - 18, player.y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Shield effect
  if (player.shielded) {
    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.2;
    ctx.strokeStyle = `rgba(0, 200, 255, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ccff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner glow
    ctx.fillStyle = `rgba(0, 200, 255, 0.1)`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

/**
 * Draw the boss with health bar and effects
 */
export function drawBoss(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  dimensions: GameDimensions,
  sprites: Sprites
): void {
  const { boss } = state;
  if (state.phase !== 'boss') return;

  const healthPercent = boss.health / boss.maxHealth;
  const scale = 1 + Math.sin(Date.now() * 0.003) * 0.04;
  const size = boss.width * scale;

  // Entrance fade
  ctx.globalAlpha = Math.min(1, boss.enterProgress);

  // Rage aura - gets more intense at low health
  const auraIntensity = 0.2 + (1 - healthPercent) * 0.3;
  const auraColor = healthPercent < 0.3 ? '255, 50, 50' : '255, 100, 50';
  
  for (let i = 3; i > 0; i--) {
    const auraSize = size * (0.7 + i * 0.15);
    const pulse = Math.sin(Date.now() * 0.005 + i) * 0.1;
    ctx.fillStyle = `rgba(${auraColor}, ${auraIntensity - i * 0.05 + pulse})`;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, auraSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hit flash
  if (boss.hitFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${boss.hitFlash / 200})`;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boss sprite
  ctx.save();
  ctx.shadowColor = boss.hitFlash > 0 ? '#ffffff' : (healthPercent < 0.3 ? '#ff3333' : '#ff6633');
  ctx.shadowBlur = boss.hitFlash > 0 ? 40 : 25;
  
  if (sprites.boss.complete && sprites.boss.naturalWidth > 0) {
    ctx.drawImage(
      sprites.boss,
      boss.x - size / 2,
      boss.y - size / 2,
      size,
      size
    );
  } else {
    ctx.fillStyle = boss.hitFlash > 0 ? '#ffffff' : '#ff6633';
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.globalAlpha = 1;

  // Boss health bar
  const barWidth = 220;
  const barHeight = 14;
  const barX = (dimensions.width - barWidth) / 2;
  const barY = 55;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8);

  // Border with glow
  const borderColor = healthPercent < 0.3 ? '#ff3333' : '#ff4444';
  ctx.strokeStyle = borderColor;
  ctx.shadowColor = borderColor;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2;
  ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
  ctx.shadowBlur = 0;

  // Health gradient
  const healthGradient = ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
  if (healthPercent < 0.3) {
    healthGradient.addColorStop(0, '#ff3333');
    healthGradient.addColorStop(1, '#cc0000');
  } else if (healthPercent < 0.5) {
    healthGradient.addColorStop(0, '#ff6666');
    healthGradient.addColorStop(1, '#ff3333');
  } else {
    healthGradient.addColorStop(0, '#ff6666');
    healthGradient.addColorStop(0.5, '#ff4444');
    healthGradient.addColorStop(1, '#cc2222');
  }
  ctx.fillStyle = healthGradient;
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

  // Shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight / 2);

  // Label
  ctx.fillStyle = healthPercent < 0.3 ? '#ff3333' : '#ff4444';
  ctx.font = 'bold 12px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RODNEY', dimensions.width / 2, barY - 8);
  
  // Health percent indicator
  ctx.font = 'bold 10px Orbitron, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${Math.ceil(healthPercent * 100)}%`, dimensions.width / 2, barY + barHeight / 2 + 4);
}

/**
 * Draw an enemy with hit effects
 */
export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  const { x, y, width, type, hitFlash } = enemy;

  const colors: Record<string, { main: string; glow: string }> = {
    carrier: { main: '#ffaa00', glow: '#ffcc44' },
    shooter: { main: '#ff4444', glow: '#ff6666' },
    worker: { main: '#aa44ff', glow: '#cc66ff' },
  };
  const color = colors[type] ?? colors.worker!;

  ctx.save();
  ctx.shadowColor = color!.glow;
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

  // Type indicators
  if (type === 'shooter') {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 7);
    ctx.lineTo(x - 3, y - 5);
    ctx.moveTo(x + 8, y - 7);
    ctx.lineTo(x + 3, y - 5);
    ctx.stroke();
  } else if (type === 'carrier') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x - 6, y + 4, 12, 6);
  }

  ctx.restore();
}

/**
 * Draw a bullet with effects
 */
export function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
  const { x, y, isBomb, isEnemy, trail } = bullet;

  if (isBomb) {
    // Bomb trail
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      if (!t) continue;
      const alpha = (1 - i / trail.length) * 0.6;
      ctx.fillStyle = `rgba(255, 102, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 10 - i, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bomb body with glow
    ctx.save();
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 25;

    const bombGradient = ctx.createRadialGradient(x, y, 0, x, y, 14);
    bombGradient.addColorStop(0, '#ffffff');
    bombGradient.addColorStop(0.2, '#ffee00');
    bombGradient.addColorStop(0.5, '#ff6600');
    bombGradient.addColorStop(1, '#cc3300');
    ctx.fillStyle = bombGradient;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
  } else if (isEnemy) {
    // Enemy bullet trail
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      if (!t) continue;
      const alpha = (1 - i / trail.length) * 0.4;
      ctx.fillStyle = `rgba(255, 0, 102, ${alpha})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 5 - i, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.shadowColor = '#ff0066';
    ctx.shadowBlur = 15;

    const enemyGradient = ctx.createRadialGradient(x, y, 0, x, y, 7);
    enemyGradient.addColorStop(0, '#ffffff');
    enemyGradient.addColorStop(0.4, '#ff4488');
    enemyGradient.addColorStop(1, '#ff0066');
    ctx.fillStyle = enemyGradient;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
  } else {
    // Player bullet - elongated laser
    ctx.save();
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 12;

    const laserGradient = ctx.createLinearGradient(x, y - 10, x, y + 4);
    laserGradient.addColorStop(0, '#ffffff');
    laserGradient.addColorStop(0.3, '#00ffcc');
    laserGradient.addColorStop(1, 'rgba(0, 255, 204, 0.2)');
    ctx.fillStyle = laserGradient;
    ctx.fillRect(x - 2, y - 10, 4, 14);
    ctx.restore();
  }
}

/**
 * Draw a drop pickup with proper icons (NO EMOJIS!)
 */
export function drawDrop(ctx: CanvasRenderingContext2D, drop: Drop, sprites?: Sprites): void {
  const { x, y, type, pulse, magnetized } = drop;

  const glow = 0.7 + Math.sin(pulse) * 0.3;
  const scale = 1 + Math.sin(pulse * 1.5) * 0.15;
  const bob = Math.sin(pulse * 2) * 4;
  const size = 20 * scale;

  ctx.save();
  ctx.globalAlpha = glow;

  // Glow circle
  const colors: Record<string, string> = {
    bomb: '#ff6600',
    health: '#ff4444',
    shield: '#00ccff',
  };
  const color = colors[type] || '#ffffff';
  
  ctx.shadowColor = color;
  ctx.shadowBlur = magnetized ? 30 : 18;
  ctx.fillStyle = color + '55';
  ctx.beginPath();
  ctx.arc(x, y + bob, size + 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Draw sprite or fallback icon
  const spriteMap: Record<string, keyof Sprites | undefined> = {
    bomb: 'bomb',
    health: 'health',
    shield: 'shield',
  };
  const spriteKey = spriteMap[type];
  const sprite = spriteKey ? sprites?.[spriteKey] : undefined;

  if (sprite?.complete && sprite?.naturalWidth > 0) {
    ctx.drawImage(sprite, x - size / 2, y + bob - size / 2, size, size);
  } else {
    // Fallback: Draw geometric icons instead of emojis
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    if (type === 'bomb') {
      // Bomb: Circle with fuse
      ctx.beginPath();
      ctx.arc(x, y + bob, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Fuse
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + bob - size / 2);
      ctx.lineTo(x + 5, y + bob - size / 2 - 8);
      ctx.stroke();
      // Spark
      const sparkSize = 3 + Math.sin(pulse * 4) * 2;
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(x + 5, y + bob - size / 2 - 8, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'health') {
      // Health: Cross/plus
      ctx.fillRect(x - size / 6, y + bob - size / 2, size / 3, size);
      ctx.fillRect(x - size / 2, y + bob - size / 6, size, size / 3);
      ctx.stroke();
    } else if (type === 'shield') {
      // Shield: Chevron shape
      ctx.beginPath();
      ctx.moveTo(x, y + bob - size / 2);
      ctx.lineTo(x + size / 2, y + bob - size / 4);
      ctx.lineTo(x + size / 2, y + bob + size / 4);
      ctx.lineTo(x, y + bob + size / 2);
      ctx.lineTo(x - size / 2, y + bob + size / 4);
      ctx.lineTo(x - size / 2, y + bob - size / 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draw particles
 */
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw game instructions
 */
export function drawInstructions(
  ctx: CanvasRenderingContext2D,
  phase: string,
  dimensions: GameDimensions
): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '12px Rajdhani, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const instructions =
    phase === 'boss'
      ? 'Arrow keys to move • SPACE to fire bomb at boss!'
      : 'Arrow keys to move • Collect bombs to fight the boss!';

  ctx.fillText(instructions, dimensions.width / 2, dimensions.height - 10);
}
