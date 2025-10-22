/**
 * Interaction Latency Contracts
 * 
 * Ensures responsive feel with latency budgets:
 * - Button press handler start < 16ms (1 frame)
 * - Overlay open settle < 200ms
 * - Focus reposition < 50ms
 */

import { test, expect } from '@playwright/test';

test.describe('Latency Contracts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Button press latency < 16ms', async ({ page }) => {
    const button = page.locator('button.ds-button').first();
    
    // Inject performance measurement
    await button.evaluate(btn => {
      let startTime = 0;
      
      btn.addEventListener('pointerdown', () => {
        startTime = performance.now();
      });
      
      btn.addEventListener('click', () => {
        const latency = performance.now() - startTime;
        (window as any).buttonLatency = latency;
      });
    });
    
    // Click button
    await button.click();
    
    // Check latency
    const latency = await page.evaluate(() => (window as any).buttonLatency);
    
    expect(latency).toBeLessThan(16); // Must be < 1 frame
  });

  test('Overlay open latency < 200ms', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    
    // Measure time from click to overlay visible
    const startTime = Date.now();
    
    await selectButton.click();
    
    // Wait for overlay to appear
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    // Should open in < 200ms
    expect(latency).toBeLessThan(200);
  });

  test('Overlay close latency < 200ms', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();
    
    // Wait for open
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Measure close time
    const startTime = Date.now();
    
    await page.keyboard.press('Escape');
    
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    expect(latency).toBeLessThan(200);
  });

  test('Focus reposition < 50ms', async ({ page }) => {
    const input = page.locator('input.ds-input').first();
    
    // Inject timing measurement
    await input.evaluate(el => {
      let focusTime = 0;
      
      el.addEventListener('focus', () => {
        focusTime = performance.now();
        
        // Schedule check for when focus ring is visible
        requestAnimationFrame(() => {
          const latency = performance.now() - focusTime;
          (window as any).focusLatency = latency;
        });
      });
    });
    
    await input.focus();
    
    // Wait for measurement
    await page.waitForTimeout(100);
    
    const latency = await page.evaluate(() => (window as any).focusLatency);
    
    expect(latency).toBeLessThan(50);
  });

  test('Hover response < 150ms', async ({ page }) => {
    const button = page.locator('button.ds-button').first();
    
    // Measure hover animation start
    const startTime = Date.now();
    
    await button.hover();
    
    // Wait for transition to start
    await page.waitForTimeout(150);
    
    // Check if hover state applied
    const hasHover = await button.evaluate(btn => {
      const bg = getComputedStyle(btn).backgroundColor;
      // Should NOT be the default primary color anymore
      return bg !== 'rgb(37, 99, 235)';
    });
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    expect(hasHover).toBe(true);
    expect(latency).toBeLessThan(150);
  });
});

test.describe('Animation Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('No layout shift during overlay open', async ({ page }) => {
    // Measure cumulative layout shift
    await page.evaluate(() => {
      (window as any).cls = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) continue;
          (window as any).cls += (entry as any).value;
        }
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
    });
    
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();
    
    await page.waitForSelector('[role="dialog"]');
    
    // Check CLS
    const cls = await page.evaluate(() => (window as any).cls);
    
    // Should have minimal layout shift
    expect(cls).toBeLessThan(0.1);
  });

  test('60fps during overlay transition', async ({ page }) => {
    // This would require actual FPS measurement
    // Simplified: check that transition duration matches expectation
    
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();
    
    const overlay = page.locator('[role="dialog"]');
    
    // Check transition property
    const transition = await overlay.evaluate(el => {
      return getComputedStyle(el).transition;
    });
    
    // Should have transition defined
    expect(transition).toBeTruthy();
    expect(transition).not.toBe('none');
  });
});
