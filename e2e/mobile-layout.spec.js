const { test, expect } = require('@playwright/test');

test.describe('Mobile Layout Tests', () => {
  
  test('Portrait Mode: Viewport Height and Bottom Elements', async ({ page }) => {
    // Emulate iPhone 12 Pro Portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('role=main', { state: 'visible', timeout: 30000 });

    // 1. Verify --app-height is applied
    const appHeight = await page.evaluate(() => {
      const doc = document.documentElement;
      return getComputedStyle(doc).getPropertyValue('--app-height');
    });
    // It might be empty initially until resize/load, but the hook runs on mount.
    // In headless, window.innerHeight should be 844px.
    console.log('App Height:', appHeight);
    expect(appHeight).toContain('px');

    const mainContainerStyle = await page.locator('role=main').evaluate((el) => {
        return el.style.height;
    });
    expect(mainContainerStyle).toBe('var(--app-height, 100vh)');

    // 2. Verify Theme Switcher Position (Bottom in Portrait)
    // We look for the container of the theme buttons. 
    // Since there are no unique IDs, we'll find the container that has 'absolute' and 'bottom-' classes
    // or better, find the buttons "白天", "傍晚", "深夜" and check their container.
    
    // Let's assume the buttons are present. Note: they might need interaction to show if in a menu, 
    // but based on code they seem to be always there or conditional on theme.
    // Default theme might be 'evening' or 'day'.
    
    // Let's just wait for one known button or the container.
    // The container has class `absolute bottom-[max(3rem,env(safe-area-inset-bottom))]`
    
    // We can use a locator that matches the specific class logic we added
    const themeSwitcher = page.locator('div.absolute.left-1\\/2.-translate-x-1\\/2').first();
    await expect(themeSwitcher).toBeVisible();

    const box = await themeSwitcher.boundingBox();
    if (box) {
        // Should be near the bottom
        // 844 - box.y - box.height should be around 3rem (48px) + safe area (0 in simulator usually unless configured)
        const bottomSpace = 844 - (box.y + box.height);
        console.log('Portrait Bottom Space:', bottomSpace);
        expect(bottomSpace).toBeGreaterThan(40); // > 3rem roughly
    }
  });

  test('Landscape Mode: Layout Adjustments', async ({ page }) => {
    // Emulate iPhone 12 Pro Landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');
    
    // Wait for load
    await page.waitForSelector('role=main', { state: 'visible', timeout: 30000 });

    // 1. Verify Theme Switcher Position (Top in Landscape)
    // Class should be `landscape:top-20` which means 5rem = 80px.
    const themeSwitcher = page.locator('div.absolute.left-1\\/2.-translate-x-1\\/2').first();
    await expect(themeSwitcher).toBeVisible();

    const box = await themeSwitcher.boundingBox();
    if (box) {
        // Should be near the top
        console.log('Landscape Top Y:', box.y);
        // top-20 is 5rem. 1rem = 16px usually. So 80px.
        // Allowing some margin for error/rendering
        expect(box.y).toBeCloseTo(80, 5); 
    }

    // 2. Verify Right-side Functional Buttons
    // They should have `landscape:bottom-[max(2rem,env(safe-area-inset-bottom))]`
    // Find the container with `right-4`
    const rightButtons = page.locator('div.absolute.right-4.flex-col').first();
    await expect(rightButtons).toBeVisible();
    
    const rightBox = await rightButtons.boundingBox();
    if (rightBox) {
        // 390 - (y + height) should be >= 2rem (32px)
        const bottomSpace = 390 - (rightBox.y + rightBox.height);
        console.log('Landscape Right Buttons Bottom Space:', bottomSpace);
        expect(bottomSpace).toBeGreaterThanOrEqual(30);
    }
  });
});
