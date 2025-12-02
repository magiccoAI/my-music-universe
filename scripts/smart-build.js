const { execSync } = require('child_process');

const isVercel = process.env.VERCEL === '1';

console.log('---------------------------------------------------');
console.log('Smart Build Script');
console.log('Environment:', isVercel ? 'Vercel' : 'Standard / GitHub Pages');

// Determine the build command
// For Vercel: Force PUBLIC_URL to '/' to ensure SPA routing works correctly
// For GitHub Pages: Use default behavior (respects "homepage" in package.json)
const command = isVercel 
  ? 'cross-env NODE_ENV=production PUBLIC_URL=/ craco build'
  : 'cross-env NODE_ENV=production craco build';

console.log('Executing:', command);
console.log('---------------------------------------------------');

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed');
  process.exit(1);
}
