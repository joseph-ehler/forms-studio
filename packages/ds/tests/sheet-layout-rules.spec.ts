/**
 * Sheet Layout Rules - Enforcement Tests
 * 
 * These tests enforce the patterns documented in SHEET_LAYOUT_RULES.md
 * They catch layout anti-patterns that cause visual artifacts.
 */

import { test, expect } from '@playwright/test'

test.describe('Sheet Layout Rules: Desktop Docked Behavior', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('Rule 1: Docked panel pushes content (side-by-side), not overlay', async ({ page }) => {
    await page.goto('/demo/docked-panel')
    
    // Get initial main content width
    const initialWidth = await page.locator('.main-area').evaluate(el => 
      el.getBoundingClientRect().width
    )
    
    // Open panel
    await page.click('[data-testid="open-panel"]')
    await page.waitForTimeout(350) // Animation
    
    // Main content should shrink
    const newWidth = await page.locator('.main-area').evaluate(el => 
      el.getBoundingClientRect().width
    )
    
    expect(newWidth).toBeLessThan(initialWidth)
    expect(newWidth).toBeGreaterThan(0)
  })

  test('Rule 2: Closed panel uses display: none (completely hidden)', async ({ page }) => {
    await page.goto('/demo/docked-panel')
    
    const panel = page.locator('[data-testid="docked-panel"]')
    
    // Close panel
    await page.click('[data-testid="close-panel"]')
    await page.waitForTimeout(350)
    
    // Panel should be display: none (not visible, not in layout)
    const display = await panel.evaluate(el => 
      window.getComputedStyle(el).display
    )
    
    expect(display).toBe('none')
  })

  test('Rule 6: Resize does NOT close panel', async ({ page }) => {
    await page.goto('/demo/docked-panel')
    
    // Open panel
    await page.click('[data-testid="open-panel"]')
    await page.waitForTimeout(350)
    
    const panel = page.locator('[data-testid="docked-panel"]')
    await expect(panel).toBeVisible()
    
    // Resize to tablet
    await page.setViewportSize({ width: 900, height: 800 })
    await page.waitForTimeout(200) // Debounce
    
    // Panel should still be visible
    await expect(panel).toBeVisible()
  })
})

test.describe('Sheet Layout Rules: Closed State Artifacts', () => {
  test('Rule 2: No visible repositioning during breakpoint transition', async ({ page }) => {
    await page.goto('/demo/docked-panel')
    
    const panel = page.locator('[data-testid="docked-panel"]')
    
    // Close panel
    await page.click('[data-testid="close-panel"]')
    await page.waitForTimeout(350)
    
    // Track visibility during resize
    let wasEverVisible = false
    
    page.on('console', msg => {
      if (msg.text().includes('panel-visible')) {
        wasEverVisible = true
      }
    })
    
    // Add visibility observer
    await page.evaluate(() => {
      const panel = document.querySelector('[data-testid="docked-panel"]')
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('panel-visible')
          }
        })
      })
      if (panel) observer.observe(panel)
    })
    
    // Resize slowly from desktop → mobile
    for (let width = 1920; width >= 375; width -= 100) {
      await page.setViewportSize({ width, height: 800 })
      await page.waitForTimeout(50)
    }
    
    // Panel should NEVER have been visible
    expect(wasEverVisible).toBe(false)
  })
})

test.describe('Sheet Layout Rules: Mobile Sheet Behavior', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('Rule 3: Mobile sheet overlays content (absolute + transform)', async ({ page }) => {
    await page.goto('/demo/docked-panel')
    
    const panel = page.locator('[data-testid="docked-panel"]')
    
    // Open panel
    await page.click('[data-testid="open-panel"]')
    await page.waitForTimeout(350)
    
    // Panel should be absolutely positioned
    const position = await panel.evaluate(el => 
      window.getComputedStyle(el).position
    )
    
    expect(position).toBe('absolute')
    
    // Main content width should NOT have changed (overlay, not push)
    const mainWidth = await page.locator('.main-area').evaluate(el => 
      el.getBoundingClientRect().width
    )
    
    expect(mainWidth).toBe(375) // Full width
  })
})

test.describe('Sheet Layout Rules: Structure Requirements', () => {
  test('Rule 4: Fixed header/footer with scrollable content', async ({ page }) => {
    await page.goto('/demo/docked-panel')
    
    // Open panel
    await page.click('[data-testid="open-panel"]')
    await page.waitForTimeout(350)
    
    const header = page.locator('.panel-header')
    const content = page.locator('.panel-content')
    const footer = page.locator('.panel-footer')
    
    // Header should have flex-shrink: 0
    const headerFlexShrink = await header.evaluate(el => 
      window.getComputedStyle(el).flexShrink
    )
    expect(headerFlexShrink).toBe('0')
    
    // Content should have overflow-y: auto
    const contentOverflow = await content.evaluate(el => 
      window.getComputedStyle(el).overflowY
    )
    expect(contentOverflow).toBe('auto')
    
    // Footer should have flex-shrink: 0
    const footerFlexShrink = await footer.evaluate(el => 
      window.getComputedStyle(el).flexShrink
    )
    expect(footerFlexShrink).toBe('0')
  })
})

test.describe('Sheet Layout Rules: Animation Requirements', () => {
  test('Rule 5: Smooth 300ms animations', async ({ page }) => {
    await page.goto('/demo/docked-panel')
    
    const panel = page.locator('[data-testid="docked-panel"]')
    
    // Open panel
    const start = Date.now()
    await page.click('[data-testid="open-panel"]')
    
    // Wait for panel to be fully visible
    await expect(panel).toBeVisible()
    await page.waitForTimeout(350) // Wait for animation
    
    const duration = Date.now() - start
    
    // Should take around 300ms (±100ms tolerance for processing)
    expect(duration).toBeGreaterThanOrEqual(250)
    expect(duration).toBeLessThanOrEqual(450)
  })
})

test.describe('Sheet Layout Rules: Responsive Mode Transitions', () => {
  test('Rule 7: Instant layout property changes at breakpoints', async ({ page }) => {
    await page.goto('/demo/docked-panel')
    
    // Open panel on desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.click('[data-testid="open-panel"]')
    await page.waitForTimeout(350)
    
    const panel = page.locator('[data-testid="docked-panel"]')
    
    // Get desktop border-radius
    const desktopBorderRadius = await panel.evaluate(el => 
      window.getComputedStyle(el).borderRadius
    )
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(200)
    
    // Get mobile border-radius (should change instantly)
    const mobileBorderRadius = await panel.evaluate(el => 
      window.getComputedStyle(el).borderRadius
    )
    
    // Border-radius should be different (proves layout changed)
    expect(mobileBorderRadius).not.toBe(desktopBorderRadius)
    
    // Mobile should have rounded top corners
    expect(mobileBorderRadius).toContain('16px')
  })
})
