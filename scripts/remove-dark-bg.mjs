import sharp from 'sharp';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile.replace('.png', '-nobg.png');
const threshold = parseInt(process.argv[4]) || 45;

async function removeDarkBackground(input, output) {
  console.log(`Processing: ${input} (brightness threshold: ${threshold})`);
  
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { width, height } = info;
  console.log(`Image: ${width}x${height}`);
  
  const newData = Buffer.from(data);
  let transparentCount = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate brightness
    const brightness = (r + g + b) / 3;
    
    // Check if it's a dark pixel (likely background)
    // Also check if it's a grayish dark (checkerboard pattern)
    const isGrayish = Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
    
    if (brightness < threshold && isGrayish) {
      newData[i + 3] = 0; // Make transparent
      transparentCount++;
    }
  }
  
  console.log(`Made ${transparentCount} pixels transparent (${((transparentCount / (width * height)) * 100).toFixed(1)}%)`);
  
  // Save with optimization
  await sharp(newData, {
    raw: { width, height, channels: 4 }
  })
  .png({ compressionLevel: 9 })
  .toFile(output);
  
  console.log(`Saved: ${output}`);
}

removeDarkBackground(inputFile, outputFile).catch(console.error);
