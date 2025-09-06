const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const optimizedDir = path.join(publicDir, 'optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

const imageOptimizationConfig = {
  'OTW TP.png': {
    sizes: [
      { width: 200, suffix: '-desktop' },
      { width: 150, suffix: '-mobile' },
      { width: 100, suffix: '-thumb' }
    ],
    formats: ['webp', 'avif']
  },
  'OTW Homebuyers.png': {
    sizes: [
      { width: 400, suffix: '-large' },
      { width: 200, suffix: '-medium' },
      { width: 100, suffix: '-small' }
    ],
    formats: ['webp', 'avif']
  },
  '5Star.png': {
    sizes: [
      { width: 120, suffix: '' }
    ],
    formats: ['webp', 'avif']
  },
  'SatGuar.png': {
    sizes: [
      { width: 120, suffix: '' }
    ],
    formats: ['webp', 'avif']
  },
  'OTW Banner.png': {
    sizes: [
      { width: 1920, suffix: '-full' },
      { width: 1200, suffix: '-desktop' },
      { width: 768, suffix: '-tablet' },
      { width: 375, suffix: '-mobile' }
    ],
    formats: ['webp', 'avif']
  }
};

async function optimizeImage(imageName, config) {
  const inputPath = path.join(publicDir, imageName);
  
  if (!fs.existsSync(inputPath)) {
    console.log(`Skipping ${imageName} - file not found`);
    return;
  }
  
  const baseName = path.basename(imageName, path.extname(imageName));
  
  for (const sizeConfig of config.sizes) {
    for (const format of config.formats) {
      const outputName = `${baseName}${sizeConfig.suffix}.${format}`;
      const outputPath = path.join(optimizedDir, outputName);
      
      try {
        const pipeline = sharp(inputPath)
          .resize(sizeConfig.width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          });
        
        if (format === 'webp') {
          await pipeline.webp({ quality: 85 }).toFile(outputPath);
        } else if (format === 'avif') {
          await pipeline.avif({ quality: 80 }).toFile(outputPath);
        }
        
        const stats = fs.statSync(outputPath);
        const originalStats = fs.statSync(inputPath);
        const reduction = ((1 - stats.size / originalStats.size) * 100).toFixed(1);
        
        console.log(`✓ Created ${outputName} (${(stats.size / 1024).toFixed(1)}KB, -${reduction}%)`);
      } catch (error) {
        console.error(`Error optimizing ${imageName} to ${format}:`, error.message);
      }
    }
  }
  
  // Also create an optimized PNG version
  const optimizedPngPath = path.join(optimizedDir, imageName);
  try {
    await sharp(inputPath)
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(optimizedPngPath);
    
    const stats = fs.statSync(optimizedPngPath);
    const originalStats = fs.statSync(inputPath);
    const reduction = ((1 - stats.size / originalStats.size) * 100).toFixed(1);
    
    console.log(`✓ Optimized ${imageName} (${(stats.size / 1024).toFixed(1)}KB, -${reduction}%)`);
  } catch (error) {
    console.error(`Error optimizing PNG ${imageName}:`, error.message);
  }
}

async function optimizeAllImages() {
  console.log('Starting image optimization...\n');
  
  for (const [imageName, config] of Object.entries(imageOptimizationConfig)) {
    console.log(`Processing ${imageName}...`);
    await optimizeImage(imageName, config);
    console.log('');
  }
  
  console.log('Image optimization complete!');
  console.log(`Optimized images saved to: ${optimizedDir}`);
}

optimizeAllImages().catch(console.error);