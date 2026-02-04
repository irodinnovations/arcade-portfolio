import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '../public/images/game/new-assets/worker-helper.png');
const outputDir = path.join(__dirname, '../public/images/game');

// Enemy color schemes matching the game's current colors
const variants = [
  { name: 'enemy-worker.png', tint: { r: 170, g: 68, b: 255 } },    // Purple - worker
  { name: 'enemy-shooter.png', tint: { r: 255, g: 68, b: 68 } },    // Red - shooter  
  { name: 'enemy-carrier.png', tint: { r: 255, g: 170, b: 0 } },    // Orange/gold - carrier
];

async function createVariants() {
  console.log('Loading source image:', inputPath);
  
  for (const variant of variants) {
    const outputPath = path.join(outputDir, variant.name);
    
    // Apply color tint while preserving alpha
    // Use modulate for hue shift + tint for color overlay
    await sharp(inputPath)
      .tint(variant.tint)
      .toFile(outputPath);
    
    console.log(`Created: ${variant.name}`);
  }
  
  console.log('\nAll variants created successfully!');
}

createVariants().catch(console.error);
