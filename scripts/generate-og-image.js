const sharp = require('sharp');
const path = require('path');

async function generateProfessionalOGImage() {
  const width = 1200;
  const height = 630;
  
  // Create SVG with pure black/white branding to match site
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Pure black background -->
      <rect width="${width}" height="${height}" fill="#000000"/>
      
      <!-- Accent line at top -->
      <rect x="0" y="0" width="${width}" height="4" fill="#ffffff"/>
      
      <!-- Main text: RODNEY JOHN -->
      <text x="${width/2}" y="${height/2 - 40}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="72" 
            font-weight="700" 
            fill="#ffffff" 
            text-anchor="middle"
            letter-spacing="8">RODNEY JOHN</text>
      
      <!-- Tagline: Operations Performance & Analytics -->
      <text x="${width/2}" y="${height/2 + 40}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="28" 
            font-weight="500" 
            fill="#ffffff" 
            text-anchor="middle"
            letter-spacing="2">Operations Performance &amp; Analytics</text>
      
      <!-- Decorative line -->
      <line x1="${width/2 - 150}" y1="${height/2 + 80}" 
            x2="${width/2 + 150}" y2="${height/2 + 80}" 
            stroke="#333333" stroke-width="2"/>
      
      <!-- Bottom tagline -->
      <text x="${width/2}" y="${height/2 + 130}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="18" 
            font-weight="400" 
            fill="#999999" 
            text-anchor="middle"
            letter-spacing="1">10+ Years Building Dashboards, Automating Workflows, Driving Results</text>
      
      <!-- URL at bottom -->
      <text x="${width/2}" y="${height - 40}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="16" 
            font-weight="400" 
            fill="#999999" 
            text-anchor="middle">rodneyjohn.com</text>
    </svg>
  `;
  
  const outputPath = path.join(__dirname, '../public/images/og-image-professional.png');
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log('✅ Professional OG image created:', outputPath);
  
  // Also overwrite the main og-image.png
  const mainPath = path.join(__dirname, '../public/images/og-image.png');
  await sharp(Buffer.from(svg))
    .png()
    .toFile(mainPath);
  
  console.log('✅ Main og-image.png replaced');
  
  return outputPath;
}

generateProfessionalOGImage().catch(console.error);
