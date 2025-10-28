const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '..', 'public', 'images');
const outputDir = path.join(__dirname, '..', 'public', 'optimized-images');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error('Error reading input directory:', err);
            return;
        }

        files.forEach(async (file) => {
            const inputFile = path.join(inputDir, file);
            const outputFile = path.join(outputDir, `${path.parse(file).name}.webp`);

            // 检查是否是图片文件 (这里只处理 jpg, png)
            if (['.jpg', '.jpeg', '.png'].includes(path.parse(file).ext.toLowerCase())) {
                try {
                    await sharp(inputFile)
                        .webp({ quality: 80 }) // 转换为 WebP 格式，质量为 80
                        .toFile(outputFile);
                    console.log(`Optimized ${file} to ${path.basename(outputFile)}`);
                } catch (error) {
                    console.error(`Error optimizing ${file}:`, error);
                }
            }
        });
    });
}

optimizeImages();