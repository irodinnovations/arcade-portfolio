import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile.replace('.png', '-nobg.png');

async function removeDarkBackground(input, output) {
  console.log(`Processing: ${input}`);
  
  const image = sharp(input);
  const { width, height, channels } = await image.metadata();
  
  // Get raw pixel data
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  console.log(`Image: ${info.width}x${info.height}, channels: ${info.channels}`);
  
  // Create new buffer with transparency
  const newData = Buffer.from(data);
  
  // Define checkerboard colors (dark gray shades DALL-E uses for "transparent")
  const isCheckerboard = (r, g, b) => {
    // Typical checkerboard colors are around (32,32,32) and (48,48,48)
    // Or very dark colors
    const brightness = (r + g + b) / 3;
    const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;
    return isGray && brightness < 60;
  };
  
  let transparentPixels = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    if (isCheckerboard(r, g, b)) {
      // Make transparent
      newData[i + 3] = 0;
      transparentPixels++;
    }
  }
  
  console.log(`Made ${transparentPixels} pixels transparent (${((transparentPixels / (info.width * info.height)) * 100).toFixed(1)}%)`);
  
  // Write output
  await sharp(newData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(output);
  
  console.log(`Saved: ${output}`);
}

removeDarkBackground(inputFile, outputFile).catch(console.error);
