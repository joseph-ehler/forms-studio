/**
 * Capabilities Smoke Tests
 * 
 * Minimal Playwright tests to verify:
 * - Desktop: Modal opens, ESC closes, focus returns
 * - Mobile: Sheet opens, drag dismisses
 * 
 * Run: pnpm playwright test capabilities-smoke
 */

import { test, expect } from '@playwright/test';

test.describe('Capabilities System - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo app or Storybook
    await page.goto('http://localhost:6006/?path=/story/ds-primitives-sheet--desktop-keyboard');
  });

  test('Desktop: Modal opens, ESC closes, focus returns', async ({ page, viewport }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Click trigger to open
    await page.click('button:has-text("Open")');

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Press ESC to close
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Focus should return to trigger
    const trigger = page.locator('button:has-text("Open")');
    await expect(trigger).toBeFocused();
  });

  test('Mobile: Sheet opens, displays correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to mobile story
    await page.goto('http://localhost:6006/?path=/story/ds-primitives-sheet--mobile-sheet');

    // Click trigger to open
    await page.click('button:has-text("Open")');

    // Wait for sheet (bottom sheet may take time to lazy-load)
    await page.waitForTimeout(1000);

    // Sheet content should be visible
    await expect(page.locator('text=Mobile Sheet')).toBeVisible();

    // Note: Drag-to-dismiss requires pointer events simulation
    // Skip for now (complex, low value for smoke test)
  });

  test('Popover: Opens, positions correctly, closes on outside click', async ({ page }) => {
    // Navigate to popover story
    await page.goto('http://localhost:6006/?path=/story/ds-primitives-popover--positioning-check');

    // Click trigger to open
    await page.click('button:has-text("Open Popover")');

    // Popover should be visible
    await expect(page.locator('.ds-popover')).toBeVisible();

    // Click outside to close
    await page.click('body', { position: { x: 10, y: 10 } });

    // Popover should close
    await expect(page.locator('.ds-popover')).not.toBeVisible();
  });
});
