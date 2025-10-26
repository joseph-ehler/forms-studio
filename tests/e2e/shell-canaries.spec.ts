/**
 * Shell Canaries - Critical behavior validation
 * 
 * These tests ensure core shell behaviors never regress:
 * - Environment override works
 * - Single scrim enforced with stacked overlays
 * - Z-order matches token strata
 * - Container queries trigger layout changes
 */

import { test, expect } from '@playwright/test';

test.describe('Shell Canaries', () => {
  test('mode flips via environment override', async ({ page }) => {
    await page.goto('/');
    
    // Override to mobile
    await page.evaluate(() => window.__setShellEnvironment?.({ mode: 'mobile', pointer: 'coarse' }));
    await expect(page.locator('html')).toHaveAttribute('data-shell-mode', 'mobile');
    
    // Override to desktop
    await page.evaluate(() => window.__setShellEnvironment?.({ mode: 'desktop', pointer: 'fine' }));
    await expect(page.locator('html')).toHaveAttribute('data-shell-mode', 'desktop');
  });

  test('only one scrim with stacked overlays', async ({ page }) => {
    await page.goto('/overlay-playground');
    
    // Open drawer (blocking overlay)
    await page.click('[data-test="open-drawer"]');
    
    // Open modal on top (blocking overlay)
    await page.click('[data-test="open-modal"]');
    
    // Should still be only ONE scrim
    await expect(page.locator('[data-overlay-backdrop]')).toHaveCount(1);
    
    // Check lock count via debug helper
    const lock = await page.evaluate(() => (window as any).__overlayDebug?.getLockCount?.());
    expect(lock).toBe(1);
  });

  test('z-order matches token strata', async ({ page }) => {
    await page.goto('/overlay-playground');
    
    // Open modal (z: --z-shell)
    await page.click('[data-test="open-modal"]');
    
    // Open popover (z: --z-popover)
    await page.click('[data-test="open-popover"]');
    
    // Get computed z-index values
    const zShell = await page.$eval('[data-overlay-sheet]', n => getComputedStyle(n as HTMLElement).zIndex);
    const zPop = await page.$eval('[data-popover]', n => getComputedStyle(n as HTMLElement).zIndex);
    
    // Popover should be above shell
    expect(Number(zPop)).toBeGreaterThan(Number(zShell));
  });

  test('container query in AppShell.Main flips layout', async ({ page }) => {
    await page.goto('/cq-demo');
    
    // Set viewport to trigger smaller container size
    await page.setViewportSize({ width: 900, height: 800 });
    await expect(page.locator('[data-cq="main"] .cards')).toHaveClass(/cols-2/);
    
    // Wider viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('[data-cq="main"] .cards')).toHaveClass(/cols-4/);
  });
});
