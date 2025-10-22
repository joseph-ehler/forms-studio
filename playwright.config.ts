import { defineConfig, devices } from '@playwright/test';

/**
 * Cascade OS - Playwright Configuration
 * 
 * Smoke tests for overlay system at mobile viewport (375×480)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Mobile (375×480)',
      use: { 
        viewport: { width: 375, height: 480 },
      },
    },
    {
      name: 'Desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run dev server before starting tests */
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  //   stdout: 'ignore',
  //   stderr: 'pipe',
  // },
  // 
  // For now, start dev server manually:
  // Terminal 1: pnpm dev
  // Terminal 2: pnpm test:overlay-smoke
});
