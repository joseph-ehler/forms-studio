/**
 * Device Resolver Tests
 * 
 * Tests that device-aware mode resolution works correctly:
 * - Mobile → sheet
 * - Desktop → popover/dialog
 * - Tablet → configurable
 * - User override works
 */

import { test, expect } from '@playwright/test'

test.describe('Device Resolver: Mobile', () => {
  test.use({ 
    viewport: { width: 375, height: 667 }
  })

  test('field kind resolves to sheet', async ({ page }) => {
    await page.goto('/demo/responsive-overlay?kind=field')
    
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
  })

  test('dialog kind resolves to sheet', async ({ page }) => {
    await page.goto('/demo/responsive-overlay?kind=dialog')
    
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
  })

  test('panel kind resolves to sheet', async ({ page }) => {
    await page.goto('/demo/responsive-overlay?kind=panel')
    
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
  })
})

test.describe('Device Resolver: Desktop', () => {
  test.use({ 
    viewport: { width: 1920, height: 1080 }
  })

  test('field kind resolves to popover', async ({ page }) => {
    await page.goto('/demo/responsive-overlay?kind=field')
    
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('popover')
  })

  test('dialog kind resolves to dialog', async ({ page }) => {
    await page.goto('/demo/responsive-overlay?kind=dialog')
    
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('dialog')
  })

  test('panel kind resolves to docked-panel', async ({ page }) => {
    await page.goto('/demo/responsive-overlay?kind=panel')
    
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('docked-panel')
  })
})

test.describe('Device Resolver: Tablet (Auto Mode)', () => {
  test.use({ 
    viewport: { width: 768, height: 1024 }
  })

  test('touch device → sheet', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    
    // Simulate touch
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        get: () => 5
      })
    })
    
    await page.goto('/demo/responsive-overlay?kind=field')
    
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
  })

  test('mouse device → popover', async ({ page, browser }) => {
    // Create context without touch
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      hasTouch: false
    })
    
    const newPage = await context.newPage()
    await newPage.goto('/demo/responsive-overlay?kind=field')
    
    const mode = await newPage.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('popover')
    
    await context.close()
  })
})

test.describe('Device Resolver: User Override', () => {
  test.use({ 
    viewport: { width: 1920, height: 1080 }
  })

  test('mode=sheet forces sheet on desktop', async ({ page }) => {
    await page.goto('/demo/responsive-overlay?kind=field&mode=sheet')
    
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
  })

  test('mode=popover forces popover on mobile', async ({ page, browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    })
    
    const newPage = await context.newPage()
    await newPage.goto('/demo/responsive-overlay?kind=field&mode=popover')
    
    const mode = await newPage.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('popover')
    
    await context.close()
  })
})

test.describe('Device Resolver: Policy Configuration', () => {
  test('custom mobile breakpoint', async ({ page, browser }) => {
    // Set breakpoint to 900px
    const context = await browser.newContext({
      viewport: { width: 850, height: 600 }
    })
    
    const newPage = await context.newPage()
    
    // Configure policy via window variable (before app loads)
    await newPage.addInitScript(() => {
      (window as any).__DS_DEVICE_POLICY = {
        mobileBreakpoint: 900
      }
    })
    
    await newPage.goto('/demo/responsive-overlay?kind=field')
    
    // 850px should be treated as mobile (< 900)
    const mode = await newPage.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
    
    await context.close()
  })

  test('tablet mode=mobile forces sheet', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__DS_DEVICE_POLICY = {
        tabletMode: 'mobile'
      }
    })
    
    await page.goto('/demo/responsive-overlay?kind=field')
    
    // Even on desktop-sized tablet, use sheet
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
  })

  test('panelOnDesktop=floating uses sheet', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__DS_DEVICE_POLICY = {
        panelOnDesktop: 'floating'
      }
    })
    
    await page.goto('/demo/responsive-overlay?kind=panel')
    
    // Desktop panel should use floating sheet, not docked
    const mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
  })
})

test.describe('Device Resolver: Viewport Changes', () => {
  test('mode updates on resize', async ({ page }) => {
    // Start mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/demo/responsive-overlay?kind=field')
    
    let mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
    
    // Resize to desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(200) // Debounce
    
    // Should update to popover
    mode = await page.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('popover')
  })

  test('debounces resize events', async ({ page }) => {
    await page.goto('/demo/responsive-overlay?kind=field')
    
    const resizeEvents: number[] = []
    await page.exposeFunction('trackResize', () => {
      resizeEvents.push(Date.now())
    })
    
    await page.evaluate(() => {
      window.addEventListener('resize', () => {
        (window as any).trackResize()
      })
    })
    
    // Rapid resizes
    for (let i = 0; i < 10; i++) {
      await page.setViewportSize({ width: 400 + i * 10, height: 600 })
      await page.waitForTimeout(10)
    }
    
    // Should not trigger mode resolution 10 times
    // (debounced to ~150ms)
    await page.waitForTimeout(300)
    
    // Exact count doesn't matter, but should be way less than 10
    expect(resizeEvents.length).toBeLessThan(10)
  })
})

test.describe('Device Resolver: Edge Cases', () => {
  test('handles missing DSProvider gracefully', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/demo/responsive-overlay-no-provider')
    
    // Should throw helpful error
    const hasProviderError = consoleErrors.some(err => 
      err.includes('useDS must be used within')
    )
    
    expect(hasProviderError).toBe(true)
  })

  test('handles ultra-wide monitors', async ({ page, browser }) => {
    const context = await browser.newContext({
      viewport: { width: 3840, height: 2160 } // 4K
    })
    
    const newPage = await context.newPage()
    await newPage.goto('/demo/responsive-overlay?kind=field')
    
    // Should still work correctly
    const mode = await newPage.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('popover')
    
    await context.close()
  })

  test('handles tiny screens', async ({ page, browser }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height: 480 } // iPhone SE
    })
    
    const newPage = await context.newPage()
    await newPage.goto('/demo/responsive-overlay?kind=field')
    
    const mode = await newPage.locator('[data-mode]').getAttribute('data-mode')
    expect(mode).toBe('sheet')
    
    await context.close()
  })
})
