/**
 * Playwright Config - Sheet System Tests
 * 
 * Focused test suite for SheetDialog, SheetPanel, and Device Resolver.
 * Runs on multiple devices to ensure responsive behavior works correctly.
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],
  
  // Parallel execution
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  
  // Retry on CI
  retries: process.env.CI ? 2 : 0,
  
  // Reporter
  reporter: process.env.CI 
    ? [['html'], ['github']]
    : [['html'], ['list']],
  
  // Shared settings
  use: {
    baseURL: 'http://localhost:6006', // Storybook
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // Projects (device matrix)
  projects: [
    // Desktop
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5']
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 13']
      },
    },
    {
      name: 'Mobile Safari Small',
      use: { 
        ...devices['iPhone SE']
      },
    },
    
    // Tablet
    {
      name: 'Tablet Chrome',
      use: {
        ...devices['Galaxy Tab S4']
      },
    },
    {
      name: 'Tablet Safari',
      use: {
        ...devices['iPad Pro']
      },
    },
  ],
  
  // Local dev server
  webServer: {
    command: 'pnpm storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
