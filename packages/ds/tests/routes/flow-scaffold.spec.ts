/**
 * FlowScaffold + useSubFlow E2E Tests
 * 
 * Covers:
 * - Step navigation (forward/back)
 * - URL binding (?step=)
 * - Progress announcements
 * - Invalid step handling
 * - Browser back/forward
 */

import { test, expect } from '@playwright/test';

test.describe('FlowScaffold + useSubFlow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/routes/flow');
  });

  test('renders with correct initial step', async ({ page }) => {
    await page.click('[data-testid="start-flow"]');
    
    // Should be on step 1
    await expect(page).toHaveURL(/step=name/);
    await expect(page.locator('[id="flow-title"]')).toContainText('Create project');
    await expect(page.locator('[aria-live="polite"]')).toContainText('Step 1 of 3');
  });

  test('step forward updates URL and content', async ({ page }) => {
    await page.click('[data-testid="start-flow"]');
    
    await page.click('[data-testid="next-button"]');
    await page.waitForTimeout(200); // Debounce
    
    await expect(page).toHaveURL(/step=details/);
    await expect(page.locator('[aria-live="polite"]')).toContainText('Step 2 of 3');
  });

  test('step back updates URL and content', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=details');
    
    await page.click('[data-testid="back-button"]');
    await page.waitForTimeout(200);
    
    await expect(page).toHaveURL(/step=name/);
    await expect(page.locator('[aria-live="polite"]')).toContainText('Step 1 of 3');
  });

  test('back button hidden on first step', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=name');
    
    const backButton = page.locator('.ds-flow__back');
    await expect(backButton).not.toBeVisible();
  });

  test('back button visible on subsequent steps', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=details');
    
    const backButton = page.locator('.ds-flow__back');
    await expect(backButton).toBeVisible();
  });

  test('progress announcements are accessible', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=name');
    
    const progress = page.locator('[aria-live="polite"]');
    await expect(progress).toHaveAttribute('aria-live', 'polite');
    await expect(progress).toContainText('Step 1 of 3');
  });

  test('invalid step falls back to first', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=invalid');
    
    // Should show first step
    await expect(page.locator('[aria-live="polite"]')).toContainText('Step 1 of 3');
    
    // Dev warning logged (check console)
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warn') logs.push(msg.text());
    });
    
    await page.reload();
    await page.waitForTimeout(100);
    
    expect(logs.some(log => log.includes('Invalid step'))).toBe(true);
  });

  test('browser back navigates to previous step', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=name');
    
    await page.click('[data-testid="next-button"]');
    await page.waitForTimeout(200);
    await expect(page).toHaveURL(/step=details/);
    
    await page.goBack();
    await expect(page).toHaveURL(/step=name/);
  });

  test('browser forward navigates to next step', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=name');
    
    await page.click('[data-testid="next-button"]');
    await page.waitForTimeout(200);
    
    await page.goBack();
    await expect(page).toHaveURL(/step=name/);
    
    await page.goForward();
    await expect(page).toHaveURL(/step=details/);
  });

  test('deep link loads correct step', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=invite');
    
    await expect(page.locator('[aria-live="polite"]')).toContainText('Step 3 of 3');
    await expect(page.locator('.ds-flow__content')).toContainText('invite');
  });

  test('footer renders when provided', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=name');
    
    const footer = page.locator('.ds-flow__footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Next');
  });

  test('last step shows finish button', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=invite');
    
    await expect(page.locator('[data-testid="finish-button"]')).toBeVisible();
  });

  test('rapid step changes are debounced', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=name');
    
    // Click next multiple times rapidly
    await page.click('[data-testid="next-button"]');
    await page.click('[data-testid="next-button"]');
    await page.click('[data-testid="next-button"]');
    
    await page.waitForTimeout(200); // Debounce settles
    
    // Should only advance once (debounced)
    await expect(page).toHaveURL(/step=details/);
  });

  test('title is properly associated', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=name');
    
    const title = page.locator('[id="flow-title"]');
    const container = page.locator('[aria-labelledby="flow-title"]');
    
    await expect(title).toBeVisible();
    await expect(container).toBeVisible();
  });

  test('Esc does not close flow', async ({ page }) => {
    await page.goto('/demo/routes/flow?step=name');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    // Should still be on flow page
    await expect(page).toHaveURL(/\/flow/);
  });
});
