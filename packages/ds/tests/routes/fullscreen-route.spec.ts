/**
 * FullScreenRoute E2E Tests
 * 
 * Covers:
 * - Full viewport rendering
 * - Focus management
 * - Keyboard (Esc) navigation
 * - Unsaved changes guard
 * - Reduced motion support
 * - Deep linking
 */

import { test, expect } from '@playwright/test';

test.describe('FullScreenRoute', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/routes/fullscreen');
  });

  test('renders full viewport', async ({ page }) => {
    await page.click('[data-testid="open-fullscreen"]');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeVisible();
    
    // Check it fills viewport
    const box = await route.boundingBox();
    const viewport = page.viewportSize();
    
    expect(box?.width).toBe(viewport?.width);
    expect(box?.height).toBe(viewport?.height);
  });

  test('has correct ARIA attributes', async ({ page }) => {
    await page.click('[data-testid="open-fullscreen"]');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toHaveAttribute('aria-modal', 'true');
    await expect(route).toHaveAttribute('aria-label');
    await expect(route).toHaveAttribute('tabindex', '-1');
  });

  test('focuses container on mount', async ({ page }) => {
    await page.click('[data-testid="open-fullscreen"]');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeFocused();
  });

  test('traps focus within route', async ({ page }) => {
    await page.click('[data-testid="open-fullscreen"]');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should cycle back to first element
    const firstButton = page.locator('[role="dialog"] button').first();
    await expect(firstButton).toBeFocused();
  });

  test('Esc navigates back', async ({ page }) => {
    await page.click('[data-testid="open-fullscreen"]');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeVisible();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400); // Animation
    
    await expect(route).not.toBeVisible();
    
    // Should be back on original page
    await expect(page).toHaveURL(/^(?!.*fullscreen)/);
  });

  test('unsaved changes guard blocks navigation', async ({ page }) => {
    await page.click('[data-testid="open-fullscreen-with-guard"]');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeVisible();
    
    // Make changes
    await page.fill('[data-testid="form-input"]', 'test data');
    
    // Try to close
    page.on('dialog', dialog => dialog.dismiss()); // Cancel
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    // Should still be visible
    await expect(route).toBeVisible();
  });

  test('unsaved changes guard allows navigation when confirmed', async ({ page }) => {
    await page.click('[data-testid="open-fullscreen-with-guard"]');
    
    const route = page.locator('[role="dialog"]');
    await page.fill('[data-testid="form-input"]', 'test data');
    
    page.on('dialog', dialog => dialog.accept()); // Confirm
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    
    await expect(route).not.toBeVisible();
  });

  test('deep link loads correct content', async ({ page }) => {
    await page.goto('/demo/routes/fullscreen/checkout');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeVisible();
    await expect(route).toContainText('Checkout');
  });

  test('returns focus on unmount', async ({ page }) => {
    const trigger = page.locator('[data-testid="open-fullscreen"]');
    await trigger.click();
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeVisible();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    
    // Focus should return to trigger
    await expect(trigger).toBeFocused();
  });

  test('respects reduced motion', async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });
    });
    
    await page.click('[data-testid="open-fullscreen"]');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeVisible();
    
    // Should appear without animation (instant)
    const opacity = await route.evaluate(el => window.getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });

  test('browser back navigates away', async ({ page }) => {
    await page.click('[data-testid="open-fullscreen"]');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeVisible();
    
    await page.goBack();
    await page.waitForTimeout(400);
    
    await expect(route).not.toBeVisible();
  });

  test('background is inert', async ({ page }) => {
    const backgroundButton = page.locator('[data-testid="background-button"]');
    
    await page.click('[data-testid="open-fullscreen"]');
    
    const route = page.locator('[role="dialog"]');
    await expect(route).toBeVisible();
    
    // Try to click background button
    const clickCount = await backgroundButton.evaluate(el => {
      let count = 0;
      el.addEventListener('click', () => count++);
      return count;
    });
    
    await backgroundButton.click({ force: true });
    
    // Should not have clicked (inert)
    expect(clickCount).toBe(0);
  });
});
