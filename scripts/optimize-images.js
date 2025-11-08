const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDirs = [
    path.join(__dirname, '..', 'public', 'images'),
    path.join(__dirname, '..', 'public', 'covers'),
    path.join(__dirname, '..', 'public', 'images', 'music-report-spcl-1026') // Add the new directory
];
const outputDir = path.join(__dirname, '..', 'public', 'optimized-images');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
    for (const inputDir of inputDirs) {
        fs.readdir(inputDir, (err, files) => {
            if (err) {
                console.error(`Error reading input directory ${inputDir}:`, err);
                return;
            }

            files.forEach(async (file) => {
                const inputFile = path.join(inputDir, file);
                const baseName = path.parse(file).name;
                const ext = path.parse(file).ext.toLowerCase();

                // 检查是否是图片文件 (这里只处理 jpg, png)
                if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                    try {
                        // Standard WebP version
                        const standardOutputFile = path.join(outputDir, `${baseName}.webp`);
                        await sharp(inputFile)
                            .webp({ quality: 80 }) // 转换为 WebP 格式，质量为 80
                            .toFile(standardOutputFile);
                        console.log(`Optimized ${file} to ${path.basename(standardOutputFile)}`);

                        // Mobile WebP version (e.g., half width, quality 60)
                        const mobileOutputFile = path.join(outputDir, `${baseName}-mobile.webp`);
                        const metadata = await sharp(inputFile).metadata();
                        const mobileWidth = metadata.width ? Math.round(metadata.width * 0.5) : undefined; // Reduce width by half

                        await sharp(inputFile)
                            .resize(mobileWidth) // Resize for mobile
                            .webp({ quality: 60 }) // Lower quality for mobile
                            .toFile(mobileOutputFile);
                        console.log(`Optimized mobile version of ${file} to ${path.basename(mobileOutputFile)}`);

                    } catch (error) {
                        console.error(`Error optimizing ${file}:`, error);
                    }
                }
            });
        });
    }
}

optimizeImages();