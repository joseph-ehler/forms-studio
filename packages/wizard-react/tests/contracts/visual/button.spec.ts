/**
 * Visual Contract Tests - Button Variants
 * 
 * Screenshots all button states and variants.
 * Fails on >1% pixel diff from baseline.
 */

import { test, expect } from '@playwright/test';

test.describe('Button Visual Contracts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  // Primary Button States
  test('ds-button primary - default state', async ({ page }) => {
    const button = page.locator('button.ds-button').first();
    await expect(button).toHaveScreenshot('button-primary-default.png', {
      maxDiffPixels: 10,
    });
  });

  test('ds-button primary - hover state', async ({ page }) => {
    const button = page.locator('button.ds-button').first();
    await button.hover();
    await page.waitForTimeout(200); // Wait for transition
    await expect(button).toHaveScreenshot('button-primary-hover.png', {
      maxDiffPixels: 10,
    });
  });

  test('ds-button primary - focus state', async ({ page }) => {
    const button = page.locator('button.ds-button').first();
    await button.focus();
    await expect(button).toHaveScreenshot('button-primary-focus.png', {
      maxDiffPixels: 10,
    });
  });

  test('ds-button primary - disabled state', async ({ page }) => {
    const button = page.locator('button.ds-button[disabled]').first();
    await expect(button).toHaveScreenshot('button-primary-disabled.png', {
      maxDiffPixels: 10,
    });
  });

  // All Variants - Default State
  const variants = ['secondary', 'ghost', 'danger', 'success', 'warning', 'link'];
  
  for (const variant of variants) {
    test(`ds-button--${variant} default state`, async ({ page }) => {
      const button = page.locator(`.ds-button--${variant}`).first();
      await expect(button).toHaveScreenshot(`button-${variant}-default.png`, {
        maxDiffPixels: 10,
      });
    });

    test(`ds-button--${variant} hover state`, async ({ page }) => {
      const button = page.locator(`.ds-button--${variant}`).first();
      await button.hover();
      await page.waitForTimeout(200);
      await expect(button).toHaveScreenshot(`button-${variant}-hover.png`, {
        maxDiffPixels: 10,
      });
    });
  }
});

test.describe('Button Visual Contracts - Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Apply dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
  });

  test('ds-button primary - dark default', async ({ page }) => {
    const button = page.locator('button.ds-button').first();
    await expect(button).toHaveScreenshot('button-primary-dark-default.png', {
      maxDiffPixels: 10,
    });
  });

  test('ds-button primary - dark hover', async ({ page }) => {
    const button = page.locator('button.ds-button').first();
    await button.hover();
    await page.waitForTimeout(200);
    await expect(button).toHaveScreenshot('button-primary-dark-hover.png', {
      maxDiffPixels: 10,
    });
  });
});
