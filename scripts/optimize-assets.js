const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outputDirImages = path.join(__dirname, '../public/images');
const outputDirOptimized = path.join(__dirname, '../public/optimized-images');

if (!fs.existsSync(outputDirOptimized)) {
    fs.mkdirSync(outputDirOptimized, { recursive: true });
}

async function processFile(filename, desktopWidth, mobileWidth, quality = 80) {
    const inputFile = path.join(outputDirImages, filename);
    if (!fs.existsSync(inputFile)) {
        console.log(`Skipping ${filename} (not found)`);
        return;
    }

    try {
        const metadata = await sharp(inputFile).metadata();
        console.log(`Processing ${filename} (${metadata.width}x${metadata.height}, ${(fs.statSync(inputFile).size / 1024 / 1024).toFixed(2)} MB)`);

        const name = path.parse(filename).name;

        // Desktop WebP (Saved to optimized-images)
        const dWidth = Math.min(metadata.width, desktopWidth);
        await sharp(inputFile)
            .resize(dWidth, null, { withoutEnlargement: true })
            .webp({ quality: quality })
            .toFile(path.join(outputDirOptimized, `${name}.webp`));
        console.log(`  -> Generated optimized-images/${name}.webp`);

        // Also save a copy to public/images for backward compatibility (optional, but good for direct replacements)
        // Only if it's a huge saving or we want to replace usages
        if (filename === 'snow-bg.jpg') {
             await sharp(inputFile)
            .resize(dWidth, null, { withoutEnlargement: true })
            .webp({ quality: quality })
            .toFile(path.join(outputDirImages, `${name}.webp`));
            console.log(`  -> Generated images/${name}.webp`);
        }

        // Mobile WebP
        if (mobileWidth) {
             await sharp(inputFile)
            .resize(mobileWidth, null, { withoutEnlargement: true })
            .webp({ quality: Math.max(quality - 5, 60) })
            .toFile(path.join(outputDirOptimized, `${name}-mobile.webp`));
            console.log(`  -> Generated optimized-images/${name}-mobile.webp`);
        }

    } catch (err) {
        console.error(`Error processing ${filename}:`, err);
    }
}

async function main() {
    console.log('Starting asset optimization...');
    
    // 1. Snow Background (High Quality, 4K max)
    await processFile('snow-bg.jpg', 3840, 1080, 80);

    // 2. WeChat QRCode (Small, 512px is enough for a popup)
    await processFile('wechat-qrcode.png', 512, 300, 80);

    // 3. Panorama (1.1MB -> optimize)
    await processFile('自然风光_期末的延时_07_全景.jpg', 2560, 1080, 80);
    
    console.log('Optimization complete.');
}

main();
