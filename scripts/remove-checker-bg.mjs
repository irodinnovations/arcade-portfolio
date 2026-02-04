import sharp from 'sharp';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile.replace('.png', '-nobg.png');

async function removeCheckerBackground(input, output) {
  console.log(`Processing: ${input}`);
  
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { width, height } = info;
  console.log(`Image: ${width}x${height}`);
  
  const newData = Buffer.from(data);
  
  // Sample corners to get checker colors
  const getPixel = (x, y) => {
    const i = (y * width + x) * 4;
    return { r: data[i], g: data[i+1], b: data[i+2] };
  };
  
  // Sample multiple points in corners
  const cornerSamples = [];
  for (let i = 0; i < 20; i++) {
    cornerSamples.push(getPixel(i, i));
    cornerSamples.push(getPixel(width - 1 - i, i));
    cornerSamples.push(getPixel(i, height - 1 - i));
    cornerSamples.push(getPixel(width - 1 - i, height - 1 - i));
  }
  
  // Find the two checker colors (dark and light gray)
  const brightnesses = cornerSamples.map(p => (p.r + p.g + p.b) / 3);
  const avgBrightness = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length;
  
  // Checker colors are typically: dark ~45-55, light ~95-115
  const darkThreshold = 70;
  const lightThreshold = 140;
  
  console.log(`Average corner brightness: ${avgBrightness.toFixed(1)}`);
  
  let transparentCount = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const brightness = (r + g + b) / 3;
    const isGrayish = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
    
    // Remove if it matches checker pattern colors (dark gray or light gray)
    if (isGrayish) {
      if (brightness < darkThreshold || (brightness > 85 && brightness < lightThreshold)) {
        newData[i + 3] = 0;
        transparentCount++;
      }
    }
  }
  
  console.log(`Made ${transparentCount} pixels transparent (${((transparentCount / (width * height)) * 100).toFixed(1)}%)`);
  
  await sharp(newData, {
    raw: { width, height, channels: 4 }
  })
  .png({ compressionLevel: 9 })
  .toFile(output);
  
  console.log(`Saved: ${output}`);
}

removeCheckerBackground(inputFile, outputFile).catch(console.error);
