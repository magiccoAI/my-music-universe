// @ts-check
const { test, expect } = require('@playwright/test');

test('record full cinematic tour', async ({ page }) => {
  // --- 1. SETUP & HOME PAGE ---
  
  // Hide scrollbars via CSS injection for cleaner recording
  await page.addStyleTag({ content: 'body::-webkit-scrollbar { display: none; }' });

  // Go to Home
  await page.goto('./');
  await page.waitForLoadState('networkidle');
  
  // Wait for initial animations (Stars/Meteor)
  await page.waitForTimeout(3000);

  // Smooth scroll down to show the content
  await page.evaluate(() => {
    window.scrollTo({ top: 400, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);

  // Scroll to "Story Signal" button
  const aboutBtn = page.getByText('来自设计者的信号：关于这个网站');
  await aboutBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  // Open About Modal
  await aboutBtn.click();
  await page.waitForTimeout(1000);
  
  // Scroll inside the modal (About content)
  const modalContent = page.locator('.overflow-y-auto');
  if (await modalContent.isVisible()) {
      await modalContent.evaluate(el => el.scrollTo({ top: 300, behavior: 'smooth' }));
      await page.waitForTimeout(2000);
      await modalContent.evaluate(el => el.scrollTo({ top: 600, behavior: 'smooth' }));
      await page.waitForTimeout(2000);
  }

  // Close Modal
  await page.getByText('CLOSE SIGNAL').click();
  await page.waitForTimeout(1000);

  // Scroll back up to the main button
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await page.waitForTimeout(1500);

  // --- 2. MUSIC UNIVERSE EXPLORATION ---

  // Click to enter
  const universeBtn = page.getByText('探索音乐封面宇宙');
  await universeBtn.hover();
  await page.waitForTimeout(500);
  await universeBtn.click();

  // Handle "First Time Visit" Modal if it appears
  const modalBtn = page.getByRole('button', { name: '了解了，开始探索' });
  await modalBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
      console.log('Intro modal did not appear or was already dismissed');
  });
  if (await modalBtn.isVisible()) {
      await modalBtn.click();
  }

  // Wait for 3D Scene to load
  await page.waitForURL('**/music-universe');
  // Give it extra time for textures/models to load
  await page.waitForSelector('canvas', { state: 'visible', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Helper function to simulate camera orbit
  const orbitCamera = async (duration = 3000) => {
      await page.mouse.move(960, 540);
      await page.mouse.down();
      // Smooth drag
      await page.mouse.move(1200, 540, { steps: 30 });
      await page.waitForTimeout(duration);
      await page.mouse.up();
  };

  // --- SCENE 1: NIGHT (DEFAULT) ---
  // Explore default view
  await orbitCamera(2000);

  // Switch to "Aurora" (Night Mode)
  // Need to find the button. Based on code: aria-label="极光之夜"
  await page.getByLabel('极光之夜').click();
  await page.waitForTimeout(4000); // Wait for transition
  await orbitCamera(3000); // Look around aurora

  // Toggle Aurora Variant (if available)
  // Button text: "切换到灵动极光" or similar logic in code
  // The button is inside a group, let's try to find it by text content if possible or location
  // Code says: "切换到灵动极光" inside a div that appears on hover.
  // We might just skip this subtle interaction and move to Deep Space.

  // Switch to "Deep Space"
  await page.getByLabel('纯净星空').click();
  await page.waitForTimeout(4000);
  await orbitCamera(3000);

  // --- SCENE 2: EVENING ---
  // Switch to Evening Theme
  await page.getByLabel('切换到傍晚主题').click();
  await page.waitForTimeout(5000); // Evening transition is slow (1s)
  await orbitCamera(3000);

  // Open "Twilight Tuner" (Palette)
  await page.getByLabel('调色板').click();
  await page.waitForTimeout(2000);
  // Maybe change a preset? 
  // Let's just close it
  await page.getByLabel('调色板').click(); 

  // --- SCENE 3: DAY ---
  // Switch to Day Theme
  await page.getByLabel('切换到白天主题').click();
  await page.waitForTimeout(4000);
  
  // 3.1 Normal Day (Clouds) - Default
  await orbitCamera(2000);

  // 3.2 Snow Mode
  await page.getByLabel('飘雪').click();
  await page.waitForTimeout(4000);
  // Look up to see snow?
  await page.mouse.move(960, 540);
  await page.mouse.down();
  await page.mouse.move(960, 300, { steps: 20 }); // Look up
  await page.mouse.up();
  await page.waitForTimeout(2000);

  // 3.3 Rainbow Mode
  await page.getByLabel('彩虹草地').click();
  await page.waitForTimeout(4000);
  await orbitCamera(2000);
  // Toggle Rain
  // The rain button appears when Rainbow mode is active.
  // aria-label: "开始下雨" or "停止下雨"
  // It might be hidden or small, let's try
  const rainBtn = page.getByTitle('开始下雨');
  if (await rainBtn.isVisible()) {
      await rainBtn.click();
      await page.waitForTimeout(3000); // Watch rain
  }

  // 3.4 Meadow (Snow Mountain) Mode
  await page.getByLabel('雪山').click();
  await page.waitForTimeout(5000); // Load bg
  await orbitCamera(3000);

  // --- 3. ARCHIVE PAGE ---
  await page.goto('./archive');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Scroll down the timeline
  await page.evaluate(() => {
    window.scrollBy({ top: 1000, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    window.scrollBy({ top: 1000, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);

  // Filter interaction (if visible)
  // Let's assume there are year/tag buttons.
  // Based on `ArchivePage.jsx` (not read, but assuming standard layout).
  // Let's just scroll back up quickly.
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);

  // --- 4. ENDING ---
  // Go back to Home for a clean finish
  await page.goto('./');
  await page.waitForTimeout(2000);
});
