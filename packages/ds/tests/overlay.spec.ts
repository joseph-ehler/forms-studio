/**
 * Overlay Primitive Tests - Tiny Viewport Coverage
 * 
 * Guards against regression in:
 * - Footer visibility on constrained viewports
 * - Overlay bottom ≤ viewport bottom
 * - Scroll container height calculation
 * - Focus trap + return focus
 * - Pointer event handling
 * 
 * Run: npx playwright test overlay.spec.ts
 */

import { test, expect } from '@playwright/test'

const TINY_VIEWPORT = { width: 375, height: 480 }
const MOBILE_VIEWPORT = { width: 375, height: 667 }

test.describe('OverlayPicker - Constrained Viewport', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to your demo/storybook page
    await page.goto('http://localhost:3000') // Update with your demo URL
  })

  test('DatePicker footer is visible on tiny screen', async ({ page }) => {
    await page.setViewportSize(TINY_VIEWPORT)
    
    // Open date picker
    await page.click('[data-testid="date-input"]') // Update selector
    
    // Wait for overlay to render
    const overlay = page.locator('[data-overlay="picker"]')
    await expect(overlay).toBeVisible()
    
    // Assert footer is visible
    const footer = overlay.locator('[data-role="footer"]')
    await expect(footer).toBeVisible()
    
    // Assert overlay bottom ≤ viewport bottom
    const overlayBox = await overlay.boundingBox()
    if (overlayBox) {
      expect(overlayBox.y + overlayBox.height).toBeLessThanOrEqual(TINY_VIEWPORT.height)
    }
  })

  test('DateRangePicker footer is visible on tiny screen', async ({ page }) => {
    await page.setViewportSize(TINY_VIEWPORT)
    
    await page.click('[data-testid="date-range-input"]')
    
    const overlay = page.locator('[data-overlay="picker"]')
    await expect(overlay).toBeVisible()
    
    const footer = overlay.locator('[data-role="footer"]')
    await expect(footer).toBeVisible()
  })

  test('SelectField footer is visible on tiny screen', async ({ page }) => {
    await page.setViewportSize(TINY_VIEWPORT)
    
    await page.click('[data-testid="select-input"]')
    
    const overlay = page.locator('[data-overlay="picker"]')
    await expect(overlay).toBeVisible()
    
    const footer = overlay.locator('[data-role="footer"]')
    await expect(footer).toBeVisible()
  })

  test('Content is scrollable when constrained', async ({ page }) => {
    await page.setViewportSize(TINY_VIEWPORT)
    
    await page.click('[data-testid="date-input"]')
    
    const overlay = page.locator('[data-overlay="picker"]')
    const content = overlay.locator('[data-role="content"]')
    
    // Check if content has scroll
    const isScrollable = await content.evaluate((el) => {
      return el.scrollHeight > el.clientHeight
    })
    
    expect(isScrollable).toBe(true)
  })

  test('debugOverlay reports correct layout', async ({ page }) => {
    await page.setViewportSize(TINY_VIEWPORT)
    
    await page.click('[data-testid="date-input"]')
    
    // Run debug function in console
    const debugInfo = await page.evaluate(() => {
      const el = document.querySelector('[data-overlay="picker"]') as HTMLElement
      if (!el) return null
      
      return {
        maxH: el.getAttribute('data-max-h'),
        cssVar: getComputedStyle(el).getPropertyValue('--overlay-max-h'),
        computed: getComputedStyle(el).maxHeight,
      }
    })
    
    expect(debugInfo).not.toBeNull()
    expect(debugInfo?.maxH).toBeTruthy()
    expect(debugInfo?.cssVar).toBeTruthy()
    expect(debugInfo?.computed).toBeTruthy()
  })
})

test.describe('OverlayPicker - Focus Management', () => {
  test('Focus trap keeps Tab within overlay', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    await page.click('[data-testid="date-input"]')
    
    const overlay = page.locator('[data-overlay="picker"]')
    await expect(overlay).toBeVisible()
    
    // Tab through all focusable elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Check focus is still inside overlay
    const focusedEl = await page.evaluate(() => {
      const active = document.activeElement
      const overlay = document.querySelector('[data-overlay="picker"]')
      return overlay?.contains(active)
    })
    
    expect(focusedEl).toBe(true)
  })

  test('Return focus to anchor on close', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    const input = page.locator('[data-testid="date-input"]')
    await input.click()
    
    // Close with Escape
    await page.keyboard.press('Escape')
    
    // Check focus returned to input
    const isFocused = await input.evaluate((el) => el === document.activeElement)
    expect(isFocused).toBe(true)
  })
})

test.describe('OverlayPicker - Event Handling', () => {
  test('Outside click closes overlay', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    await page.click('[data-testid="date-input"]')
    
    const overlay = page.locator('[data-overlay="picker"]')
    await expect(overlay).toBeVisible()
    
    // Click outside
    await page.click('body', { position: { x: 10, y: 10 } })
    
    await expect(overlay).not.toBeVisible()
  })

  test('Clicking footer does not close overlay', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    await page.click('[data-testid="date-input"]')
    
    const overlay = page.locator('[data-overlay="picker"]')
    const footer = overlay.locator('[data-role="footer"]')
    
    // Click footer background (not buttons)
    await footer.click({ position: { x: 5, y: 5 } })
    
    // Overlay should still be visible
    await expect(overlay).toBeVisible()
  })

  test('Escape key closes overlay', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    await page.click('[data-testid="date-input"]')
    
    const overlay = page.locator('[data-overlay="picker"]')
    await expect(overlay).toBeVisible()
    
    await page.keyboard.press('Escape')
    
    await expect(overlay).not.toBeVisible()
  })
})

test.describe('OverlaySheet - Mobile', () => {
  test('Sheet renders with backdrop on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)
    await page.goto('http://localhost:3000')
    
    await page.click('[data-testid="mobile-sheet-trigger"]')
    
    const backdrop = page.locator('[aria-hidden="true"]').first()
    await expect(backdrop).toBeVisible()
    
    const sheet = page.locator('[role="dialog"][aria-modal="true"]')
    await expect(sheet).toBeVisible()
  })

  test('Sheet has correct z-index stacking', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)
    await page.goto('http://localhost:3000')
    
    await page.click('[data-testid="mobile-sheet-trigger"]')
    
    const zIndexes = await page.evaluate(() => {
      const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement
      const sheet = document.querySelector('[role="dialog"][aria-modal="true"]') as HTMLElement
      
      return {
        backdrop: getComputedStyle(backdrop).zIndex,
        sheet: getComputedStyle(sheet).zIndex,
      }
    })
    
    expect(parseInt(zIndexes.backdrop)).toBeLessThan(parseInt(zIndexes.sheet))
  })
})
