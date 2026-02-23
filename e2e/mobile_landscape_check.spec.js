
const { test, expect, devices } = require('@playwright/test');

test.use({
  browserName: 'chromium',
  viewport: { width: 844, height: 390 }, // iPhone 13 Landscape equivalent
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
});

test('Mobile Landscape Layout Check', async ({ page }) => {
  // 1. Go to Home Page
  console.log('Navigating to Home Page...');
  await page.goto('./');
  
  // Wait for loading or enter button
  const universeBtn = page.getByText('探索音乐封面宇宙');
  await universeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await universeBtn.click();

  // Handle "First Time Visit" Modal if it appears
  const modalBtn = page.getByRole('button', { name: '了解了，开始探索' });
  await modalBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
      console.log('Intro modal did not appear or was already dismissed');
  });
  if (await modalBtn.isVisible()) {
      await modalBtn.click();
  }

  // 2. Wait for MusicUniverse to load
  console.log('Waiting for MusicUniverse...');
  await page.waitForURL('**/music-universe');
  // Wait for canvas or some element to stabilize
  await page.waitForSelector('canvas', { state: 'visible', timeout: 30000 });
  await page.waitForTimeout(2000); 

  // Screenshot 1: Music Universe Default (Night) - Check Theme Buttons Position
  console.log('Taking screenshot: 1-music-universe-landscape.png');
  await page.screenshot({ path: 'e2e/screenshots/1-music-universe-landscape.png' });

  // 3. Switch to Evening Theme and Check Control Panel
  console.log('Switching to Evening Theme...');
  const eveningBtn = page.getByLabel('切换到傍晚主题');
  await eveningBtn.click();
  
  // Open Evening Theme Control (Palette)
  console.log('Opening Evening Theme Control...');
  const paletteBtn = page.getByLabel('调色板');
  await paletteBtn.waitFor({ state: 'visible', timeout: 15000 });
  await paletteBtn.click();
  await page.waitForTimeout(1000); // Wait for modal animation

  // Screenshot 2: Evening Theme with Control Panel
  console.log('Taking screenshot: 2-evening-control-landscape.png');
  await page.screenshot({ path: 'e2e/screenshots/2-evening-control-landscape.png' });
  
  // 4. Go to Connections Page
  console.log('Navigating to Connections Page...');
  // Open menu or click link. 
  // The NavigationBar has a menu button or links.
  // In mobile, it might be a hamburger menu.
  // `UniverseNavigation.jsx` handles this.
  
  // Let's just navigate by URL to be faster and safer
  await page.goto('./connections');
  await page.waitForTimeout(2000);
  
  // Screenshot 3: Connections Page - Check "Expand Graph" button
  console.log('Taking screenshot: 3-connections-landscape.png');
  await page.screenshot({ path: 'e2e/screenshots/3-connections-landscape.png' });
});
