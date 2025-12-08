const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const directories = [
  'public/images',
  'public/images/music-report-spcl-1026'
];

async function optimizeImages() {
  for (const dir of directories) {
    const fullDir = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullDir)) {
      console.log(`Directory not found: ${fullDir}`);
      continue;
    }

    const files = fs.readdirSync(fullDir);
    
    for (const file of files) {
      if (file.match(/\.(png|jpg|jpeg)$/i)) {
        const inputPath = path.join(fullDir, file);
        const outputPath = path.join(fullDir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
        
        if (fs.existsSync(outputPath)) {
          console.log(`Skipping ${file}, webp already exists.`);
          continue;
        }

        try {
          console.log(`Optimizing ${file}...`);
          await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);
          console.log(`Generated ${outputPath}`);
        } catch (error) {
          console.error(`Error converting ${file}:`, error);
        }
      }
    }
  }
}

optimizeImages();
