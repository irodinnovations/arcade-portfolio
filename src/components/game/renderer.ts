import type { GameState, GameDimensions, Enemy, Bullet, Drop } from './types';

interface Sprites {
  player: HTMLImageElement;
  boss: HTMLImageElement;
  background: HTMLImageElement;
}

/**
 * Draw the game background
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  dimensions: GameDimensions,
  sprites: Sprites
): void {
  if (sprites.background.complete && sprites.background.naturalWidth > 0) {
    ctx.drawImage(sprites.background, 0, 0, dimensions.width, dimensions.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  } else {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  // Scrolling stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 47) % dimensions.width;
    const y = ((i * 89) + Date.now() * 0.05) % dimensions.height;
    ctx.fillRect(x, y, 1 + (i % 2), 1 + (i % 2));
  }
}

/**
 * Draw the player ship
 */
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  sprites: Sprites
): void {
  const { player } = state;

  if (sprites.player.complete && sprites.player.naturalWidth > 0) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(-Math.PI / 4);
    ctx.drawImage(
      sprites.player,
      -player.width / 2,
      -player.height / 2,
      player.width,
      player.height
    );
    ctx.restore();
  } else {
    // Fallback triangle ship
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 20);
    ctx.lineTo(player.x + 15, player.y + 15);
    ctx.lineTo(player.x - 15, player.y + 15);
    ctx.closePath();
    ctx.fill();
  }

  // Shield effect
  if (player.shielded) {
    ctx.strokeStyle = `rgba(0, 200, 255, ${0.5 + Math.sin(Date.now() * 0.01) * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Engine glow
  ctx.fillStyle = `rgba(0, 255, 100, ${0.5 + Math.random() * 0.3})`;
  ctx.beginPath();
  ctx.arc(
    player.x,
    player.y + player.height / 2 + 5,
    6 + Math.random() * 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

/**
 * Draw the boss
 */
export function drawBoss(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  dimensions: GameDimensions,
  sprites: Sprites
): void {
  const { boss } = state;
  if (state.phase !== 'boss') return;

  const bossScale = boss.width * (1 + Math.sin(Date.now() * 0.003) * 0.05);

  // Boss aura
  ctx.fillStyle = `rgba(255, 100, 50, ${0.2 + Math.sin(Date.now() * 0.005) * 0.1})`;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, bossScale * 0.8, 0, Math.PI * 2);
  ctx.fill();

  if (sprites.boss.complete && sprites.boss.naturalWidth > 0) {
    ctx.drawImage(
      sprites.boss,
      boss.x - bossScale / 2,
      boss.y - bossScale / 2,
      bossScale,
      bossScale
    );
  } else {
    // Fallback circle boss
    ctx.fillStyle = '#ff6633';
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Boss health bar
  ctx.fillStyle = '#333';
  ctx.fillRect(dimensions.width / 2 - 100, 60, 200, 12);
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(
    dimensions.width / 2 - 100,
    60,
    200 * (boss.health / boss.maxHealth),
    12
  );
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(dimensions.width / 2 - 100, 60, 200, 12);
}

/**
 * Draw an enemy
 */
export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  const colors: Record<string, string> = {
    carrier: '#ffaa00',
    shooter: '#ff4444',
    worker: '#aa44ff',
  };

  ctx.fillStyle = colors[enemy.type] || '#aa44ff';
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.width / 2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(enemy.x - 6, enemy.y - 3, 4, 0, Math.PI * 2);
  ctx.arc(enemy.x + 6, enemy.y - 3, 4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a bullet
 */
export function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
  if (bullet.isBomb) {
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (bullet.isEnemy) {
    ctx.fillStyle = '#ff0066';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(bullet.x - 2, bullet.y, 4, 12);
  }
}

/**
 * Draw a drop
 */
export function drawDrop(ctx: CanvasRenderingContext2D, drop: Drop): void {
  const glow = 0.7 + Math.sin(drop.pulse) * 0.3;
  ctx.globalAlpha = glow;
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const emojis: Record<string, string> = {
    bomb: '💣',
    health: '❤️',
    shield: '🛡️',
  };
  ctx.fillText(emojis[drop.type] || '?', drop.x, drop.y);
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
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '11px Rajdhani, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const instructions =
    phase === 'boss'
      ? 'Arrow keys to move • SPACE to fire bomb at boss!'
      : 'Arrow keys to move • Collect 💣 bombs to fight the boss!';

  ctx.fillText(instructions, dimensions.width / 2, dimensions.height - 8);
}

/**
 * Draw glitch text
 */
export function drawGlitchText(
  ctx: CanvasRenderingContext2D,
  text: string,
  dimensions: GameDimensions,
  isWarning: boolean = false
): void {
  ctx.fillStyle = isWarning ? '#ff4444' : '#00ff88';
  ctx.font = 'bold 48px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glitch effect with offsets
  if (!isWarning) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillText(text, dimensions.width / 2 + 2, dimensions.height / 2);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.fillText(text, dimensions.width / 2 - 2, dimensions.height / 2);
    ctx.restore();
  }

  ctx.fillStyle = isWarning ? '#ff4444' : '#00ff88';
  ctx.fillText(text, dimensions.width / 2, dimensions.height / 2);
}
