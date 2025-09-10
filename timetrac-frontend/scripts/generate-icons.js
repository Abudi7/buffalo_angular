const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes required for iOS App Store
const iconSizes = [
  // iPhone
  { size: 40, filename: 'AppIcon-20@2x.png' },      // 20x20 @2x
  { size: 60, filename: 'AppIcon-20@3x.png' },      // 20x20 @3x
  { size: 58, filename: 'AppIcon-29@2x.png' },      // 29x29 @2x
  { size: 87, filename: 'AppIcon-29@3x.png' },      // 29x29 @3x
  { size: 80, filename: 'AppIcon-40@2x.png' },      // 40x40 @2x
  { size: 120, filename: 'AppIcon-40@3x.png' },     // 40x40 @3x
  { size: 120, filename: 'AppIcon-60@2x.png' },     // 60x60 @2x
  { size: 180, filename: 'AppIcon-60@3x.png' },     // 60x60 @3x
  
  // iPad
  { size: 20, filename: 'AppIcon-20.png' },         // 20x20 @1x
  { size: 40, filename: 'AppIcon-20@2x.png' },      // 20x20 @2x (reuse)
  { size: 29, filename: 'AppIcon-29.png' },         // 29x29 @1x
  { size: 58, filename: 'AppIcon-29@2x.png' },      // 29x29 @2x (reuse)
  { size: 40, filename: 'AppIcon-40.png' },         // 40x40 @1x
  { size: 80, filename: 'AppIcon-40@2x.png' },      // 40x40 @2x (reuse)
  { size: 76, filename: 'AppIcon-76.png' },         // 76x76 @1x
  { size: 152, filename: 'AppIcon-76@2x.png' },     // 76x76 @2x
  { size: 167, filename: 'AppIcon-83.5@2x.png' },   // 83.5x83.5 @2x
  
  // App Store
  { size: 1024, filename: 'AppIcon-1024.png' }      // 1024x1024
];

async function generateIcons() {
  const inputPath = path.join(__dirname, '../src/assets/icon/app-icon.svg');
  const outputDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');
  
  console.log('Generating iOS app icons...');
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputDir}`);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const icon of iconSizes) {
    const outputPath = path.join(outputDir, icon.filename);
    
    try {
      await sharp(inputPath)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${icon.filename} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${icon.filename}:`, error.message);
    }
  }
  
  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);
