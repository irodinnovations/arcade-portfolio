import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

async function createOgImage() {
  const width = 1200;
  const height = 630;
  const bgColor = '#050810';
  const logoSize = 280;
  
  // Create dark background
  const background = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: bgColor
    }
  });

  // Load and resize the logo
  const logo = await sharp(join(publicDir, 'images', 'rj-logo.png'))
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Create text as SVG
  const textSvg = `
    <svg width="${width}" height="${height}">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900');
        .title { 
          fill: white; 
          font-family: 'Arial Black', 'Orbitron', sans-serif; 
          font-size: 64px; 
          font-weight: 900;
          text-anchor: middle;
          letter-spacing: 8px;
        }
        .subtitle {
          fill: #5080b0;
          font-family: Arial, sans-serif;
          font-size: 24px;
          text-anchor: middle;
          letter-spacing: 4px;
        }
      </style>
      <text x="${width/2}" y="520" class="title">RODNEY JOHN</text>
      <text x="${width/2}" y="570" class="subtitle">AN IROD INNOVATIONS EXPERIENCE</text>
    </svg>
  `;

  // Composite everything
  const logoTop = Math.floor((height - logoSize) / 2) - 60; // Move logo up a bit to make room for text
  const logoLeft = Math.floor((width - logoSize) / 2);

  await background
    .composite([
      {
        input: logo,
        top: logoTop,
        left: logoLeft,
      },
      {
        input: Buffer.from(textSvg),
        top: 0,
        left: 0,
      }
    ])
    .png()
    .toFile(join(publicDir, 'images', 'og-image.png'));

  console.log('✅ OG image created at public/images/og-image.png');
}

createOgImage().catch(console.error);
