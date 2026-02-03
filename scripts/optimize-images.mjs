import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SOURCE_DIR = '/home/moltbot/clawd/arcade-portfolio/assets';
const OUTPUT_DIR = '/home/moltbot/clawd/arcade-portfolio-v2/public/images/mascots';

// Map of source files to output names (optimized selection)
const mascotImages = {
  'rodney-final.png': 'rodney-final.webp',
  'mascot-roadmap-v4b.png': 'mascot-roadmap.webp',
  'mascot-omr-v5.png': 'mascot-omr.webp',
  'mascot-plex-final.png': 'mascot-plex.webp',
  'mascot-hub-v2.png': 'mascot-hub.webp',
  'mascot-arcade-v3.png': 'mascot-arcade.webp',
  'mascot-recorder-final.png': 'mascot-recorder.webp',
  'mascot-vibe-v3.png': 'mascot-vibe.webp',
  'mascot-mystery-v3.png': 'mascot-mystery.webp',
  'rj-logo-v1.png': 'rj-logo.webp',
};

const gameImages = {
  'game-player-ship.png': '/home/moltbot/clawd/arcade-portfolio-v2/public/images/game/player-ship.webp',
  'game-boss-rodney.png': '/home/moltbot/clawd/arcade-portfolio-v2/public/images/game/boss-rodney.webp',
  'game-crystal.png': '/home/moltbot/clawd/arcade-portfolio-v2/public/images/game/crystal.webp',
  'game-background.png': '/home/moltbot/clawd/arcade-portfolio-v2/public/images/game/background.webp',
};

async function optimizeImage(sourcePath, outputPath, maxWidth = 600) {
  try {
    const stats = await fs.stat(sourcePath);
    console.log(`Processing: ${path.basename(sourcePath)} (${(stats.size / 1024).toFixed(1)}KB)`);

    await sharp(sourcePath)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const newStats = await fs.stat(outputPath);
    console.log(`  → ${path.basename(outputPath)} (${(newStats.size / 1024).toFixed(1)}KB)`);
    
    return { before: stats.size, after: newStats.size };
  } catch (error) {
    console.error(`Error processing ${sourcePath}:`, error.message);
    return { before: 0, after: 0 };
  }
}

async function main() {
  // Ensure output directories exist
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir('/home/moltbot/clawd/arcade-portfolio-v2/public/images/game', { recursive: true });

  let totalBefore = 0;
  let totalAfter = 0;

  console.log('\\nOptimizing mascot images...\\n');
  
  for (const [source, output] of Object.entries(mascotImages)) {
    const sourcePath = path.join(SOURCE_DIR, source);
    const outputPath = path.join(OUTPUT_DIR, output);
    
    try {
      await fs.access(sourcePath);
      const result = await optimizeImage(sourcePath, outputPath);
      totalBefore += result.before;
      totalAfter += result.after;
    } catch {
      console.log(`  Skipping ${source} (not found)`);
    }
  }

  console.log('\\nOptimizing game images...\\n');
  
  for (const [source, outputPath] of Object.entries(gameImages)) {
    const sourcePath = path.join(SOURCE_DIR, source);
    
    try {
      await fs.access(sourcePath);
      const result = await optimizeImage(sourcePath, outputPath, 512);
      totalBefore += result.before;
      totalAfter += result.after;
    } catch {
      console.log(`  Skipping ${source} (not found)`);
    }
  }

  console.log('\\n=== Summary ===');
  console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(2)}MB`);
  console.log(`After:  ${(totalAfter / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Saved:  ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`);
}

main().catch(console.error);
