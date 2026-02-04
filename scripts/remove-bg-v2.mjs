import sharp from 'sharp';

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile.replace('.png', '-clean.png');
const tolerance = parseInt(process.argv[4]) || 40;

async function removeBackground(input, output) {
  console.log(`Processing: ${input} (tolerance: ${tolerance})`);
  
  const image = sharp(input);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { width, height } = info;
  console.log(`Image: ${width}x${height}`);
  
  const newData = Buffer.from(data);
  const visited = new Set();
  
  const getPixelIndex = (x, y) => (y * width + x) * 4;
  
  const getPixel = (x, y) => {
    const i = getPixelIndex(x, y);
    return [data[i], data[i+1], data[i+2], data[i+3]];
  };
  
  const colorDistance = (c1, c2) => {
    return Math.sqrt(
      Math.pow(c1[0] - c2[0], 2) +
      Math.pow(c1[1] - c2[1], 2) +
      Math.pow(c1[2] - c2[2], 2)
    );
  };
  
  // Sample background colors from corners
  const corners = [
    [0, 0], [width-1, 0], [0, height-1], [width-1, height-1],
    [10, 10], [width-11, 10], [10, height-11], [width-11, height-11]
  ];
  
  const bgColors = corners.map(([x, y]) => getPixel(x, y));
  console.log('Background samples:', bgColors.slice(0, 4).map(c => `rgb(${c[0]},${c[1]},${c[2]})`));
  
  const isBackground = (x, y) => {
    const pixel = getPixel(x, y);
    // Check if similar to any background color
    for (const bg of bgColors) {
      if (colorDistance(pixel, bg) < tolerance) return true;
    }
    // Also check for dark pixels (common in DALL-E "transparent" renders)
    const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3;
    if (brightness < 35) return true;
    return false;
  };
  
  // Flood fill from edges
  const queue = [];
  
  // Add all edge pixels
  for (let x = 0; x < width; x++) {
    queue.push([x, 0]);
    queue.push([x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y]);
    queue.push([width - 1, y]);
  }
  
  let transparentCount = 0;
  
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const key = `${x},${y}`;
    
    if (visited.has(key)) continue;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    
    visited.add(key);
    
    if (isBackground(x, y)) {
      // Make transparent
      const i = getPixelIndex(x, y);
      newData[i + 3] = 0;
      transparentCount++;
      
      // Add neighbors
      queue.push([x-1, y], [x+1, y], [x, y-1], [x, y+1]);
    }
  }
  
  console.log(`Made ${transparentCount} pixels transparent (${((transparentCount / (width * height)) * 100).toFixed(1)}%)`);
  
  await sharp(newData, {
    raw: { width, height, channels: 4 }
  })
  .png()
  .toFile(output);
  
  console.log(`Saved: ${output}`);
}

removeBackground(inputFile, outputFile).catch(console.error);
