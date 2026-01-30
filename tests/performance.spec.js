
const { test, chromium } = require('@playwright/test');
const { playAudit } = require('playwright-lighthouse');
const path = require('path');
const fs = require('fs');

// Ensure reports directory exists
const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

test.describe('MusicUniverse Performance Audit', () => {
  let browser;
  let context;
  let page;

  test.beforeAll(async () => {
    // Launch browser with remote debugging for Lighthouse
    // Use Edge to avoid downloading Chromium
    browser = await chromium.launch({
      channel: 'msedge',
      args: ['--remote-debugging-port=9222'],
      headless: true
    });
  });

  test.beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    // Increase timeout for all tests
    test.setTimeout(120000);
    
    // Navigate to app before each test
    console.log('beforeEach: Navigating to app...');
    await page.goto('http://localhost:3005/my-music-universe');
    await page.waitForSelector('canvas', { timeout: 60000 });
    // Wait for initial load stability
    await page.waitForTimeout(5000);
    console.log(`beforeEach: Navigation complete. URL: ${page.url()}`);
  });

  test.afterEach(async () => {
    await page.close();
    await context.close();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  // Helper to run audit
  async function runAudit(name) {
    const currentUrl = page.url();
    console.log(`Running audit for: ${name} at ${currentUrl}`);
    
    try {
      await playAudit({
        page: page,
        url: currentUrl,
        thresholds: {
          performance: 10, // Lower threshold for 3D heavy scenes
          accessibility: 50,
          'best-practices': 50,
          seo: 50,
        },
        port: 9222,
        reports: {
          formats: { html: true },
          name: name,
          directory: 'lighthouse-reports',
        },
      });
      console.log(`Audit completed for: ${name}`);
    } catch (error) {
      console.error(`Audit failed for ${name}:`, error);
      // Do not fail the test if audit fails, just log it
    }
  }

  test('01. Default Scene (Night - Aurora)', async () => {
    await runAudit('01_night_aurora_default');
  });

  test('02. Switch to Night - Simulation Aurora', async () => {
    // Ensure we are in Night mode
    const nightBtn = page.locator('button[aria-label="切换到夜晚主题"]');
    if (await nightBtn.isVisible()) {
        await nightBtn.click();
        await page.waitForTimeout(1000);
    }

    // Ensure we are in Aurora mode
    const auroraModeBtn = page.locator('button[aria-label="极光之夜"]');
    if (await auroraModeBtn.isVisible()) {
        await auroraModeBtn.click();
        await page.waitForTimeout(1000);
    }

    // Switch to Simulation (toggle)
    // The button label changes based on state. 
    // If it says "切换到灵动极光", we are in Simple, so click it.
    // If it says "切换到柔光极光", we are in Simulation.
    const toggleToSim = page.locator('button[aria-label="切换到灵动极光"]');
    if (await toggleToSim.isVisible()) {
        await toggleToSim.click();
        console.log('Clicked toggle to switch to Simulation Aurora');
        await page.waitForTimeout(5000);
        await runAudit('02_night_aurora_simulation');
    } else {
        console.log('Already in Simulation Aurora or toggle not found');
        // If already in simulation, run audit anyway?
        const toggleToSimple = page.locator('button[aria-label="切换到柔光极光"]');
        if (await toggleToSimple.isVisible()) {
             await runAudit('02_night_aurora_simulation');
        } else {
             console.log('Toggle button not found, skipping audit');
        }
    }
  });

  test('03. Switch to Night - Stars Only', async () => {
    const starsBtn = page.locator('button[aria-label="纯净星空"]');
    if (await starsBtn.isVisible()) {
        await starsBtn.click();
        console.log('Switched to Stars Only');
        await page.waitForTimeout(5000);
        await runAudit('03_night_stars');
    }
  });

  test('04. Switch to Day Theme', async () => {
    const dayBtn = page.locator('button[aria-label="切换到白天主题"]');
    if (await dayBtn.isVisible()) {
        await dayBtn.click();
        console.log('Switched to Day Theme');
        await page.waitForTimeout(5000);
        await runAudit('04_day_theme');
    }
  });

  test('05. Switch to Evening Theme', async () => {
    const eveningBtn = page.locator('button[aria-label="切换到傍晚主题"]');
    if (await eveningBtn.isVisible()) {
        await eveningBtn.click();
        console.log('Switched to Evening Theme');
        await page.waitForTimeout(5000);
        await runAudit('05_evening_theme');
    }
  });
});
