const sharp = require('sharp');
const path = require('path');

async function generateProfessionalOGImage() {
  const width = 1200;
  const height = 630;
  
  // Create SVG with professional branding (no "experience" tagline)
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#0a1628;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#050810;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
      
      <!-- Subtle grid pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2545" stroke-width="0.5"/>
      </pattern>
      <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.3"/>
      
      <!-- Accent line at top -->
      <rect x="0" y="0" width="${width}" height="4" fill="url(#accentGradient)"/>
      
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
            font-weight="400" 
            fill="#00d4ff" 
            text-anchor="middle"
            letter-spacing="2">Operations Performance &amp; Analytics</text>
      
      <!-- Decorative line -->
      <line x1="${width/2 - 150}" y1="${height/2 + 80}" 
            x2="${width/2 + 150}" y2="${height/2 + 80}" 
            stroke="#1a2545" stroke-width="2"/>
      
      <!-- Bottom tagline -->
      <text x="${width/2}" y="${height/2 + 130}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="18" 
            font-weight="400" 
            fill="#5080b0" 
            text-anchor="middle"
            letter-spacing="1">10+ Years Building Dashboards, Automating Workflows, Driving Results</text>
      
      <!-- URL at bottom -->
      <text x="${width/2}" y="${height - 40}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="16" 
            font-weight="400" 
            fill="#5080b0" 
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
