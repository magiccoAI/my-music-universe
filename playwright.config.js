// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 300000, // 5 minutes for full cinematic tour
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    video: {
      mode: 'on', 
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 },
    launchOptions: {
        slowMo: 150, // Slower actions for better video smoothness
        args: [
            '--hide-scrollbars',
            '--disable-infobars',
            '--start-fullscreen', // Optional: try to force fullscreen look
        ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: {
    command: 'npx cross-env PORT=3005 npm start',
    url: 'http://localhost:3005',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
