/**
 * SheetPanel Back Button Semantics Tests
 * 
 * Validates:
 * - Esc/Back collapses to lower snap
 * - Esc/Back at min snap closes
 * - URL binding updates on snap changes
 */

import { test, expect } from '@playwright/test'

test.describe('SheetPanel Back Semantics', () => {
  
  test('back/esc semantics: collapse → close', async ({ page }) => {
    // Open story with SheetPanel at 0.5 snap
    await page.goto('/story/map-panel')
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Verify panel is visible at initial snap
    await expect(panel).toBeVisible()
    await expect(panel).toHaveAttribute('data-snap', /0\.(5|50)/)
    
    // Press Esc → should collapse to lower snap (0.25)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(350) // Wait for transition
    await expect(panel).toHaveAttribute('data-snap', /0\.(25|2)/)
    
    // Press Esc again → should close (already at min)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
  })
  
  test('back button collapses panel', async ({ page }) => {
    await page.goto('/story/map-panel?snap=0.90')
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Verify at high snap
    await expect(panel).toBeVisible()
    await expect(panel).toHaveAttribute('data-snap', /0\.(9|90)/)
    
    // Browser back → should collapse to 0.5
    await page.goBack()
    await page.waitForTimeout(350)
    
    // Should still be visible but at lower snap
    await expect(panel).toBeVisible()
    await expect(panel).toHaveAttribute('data-snap', /0\.(5|50)/)
  })
  
  test('URL binding updates on snap change', async ({ page }) => {
    await page.goto('/story/map-panel?snap=0.50')
    
    // Verify URL has snap parameter
    await expect(page).toHaveURL(/snap=0\.50/)
    
    // Simulate snap change (via exposed window helper)
    await page.evaluate(() => {
      // Assumes story exposes setSnap on window
      (window as any).setSheetSnap?.(0.9)
    })
    
    await page.waitForTimeout(350)
    
    // URL should update
    await expect(page).toHaveURL(/snap=0\.9/)
  })
  
  test('drag to snap updates URL', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip() // Only run on mobile/touch
    }
    
    await page.goto('/story/map-panel?snap=0.50')
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Get panel position
    const box = await panel.boundingClientRect()
    const dragHandle = panel.locator('[data-handle]')
    
    // Swipe up to higher snap
    await dragHandle.hover()
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y - 200, { steps: 10 })
    await page.mouse.up()
    
    await page.waitForTimeout(350)
    
    // Should snap to 0.9 and URL should update
    await expect(panel).toHaveAttribute('data-snap', /0\.(9|90)/)
    await expect(page).toHaveURL(/snap=0\.9/)
  })
  
  test('onBackPressure can prevent collapse', async ({ page }) => {
    // Story with unsaved changes dialog
    await page.goto('/story/map-panel-unsaved')
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Mark form as dirty
    await page.click('[data-testid="make-dirty"]')
    
    // Press Esc
    await page.keyboard.press('Escape')
    
    // Should show confirmation dialog, not collapse
    const confirmDialog = page.locator('[role="alertdialog"]')
    await expect(confirmDialog).toBeVisible()
    await expect(confirmDialog).toContainText(/unsaved changes/i)
    
    // Panel should still be at same snap
    await expect(panel).toHaveAttribute('data-snap', /0\.(5|50)/)
  })
  
  test('velocity flick down closes at min snap', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/story/map-panel?snap=0.25')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    const box = await panel.boundingClientRect()
    
    // Fast swipe down
    await panel.hover()
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + 300, { steps: 3 }) // Fast!
    await page.mouse.up()
    
    await page.waitForTimeout(400)
    
    // Should close
    await expect(panel).toBeHidden()
  })
})

test.describe('SheetPanel Gesture Routing', () => {
  
  test('low snap: sheet owns drag', async ({ page }) => {
    await page.goto('/story/map-panel?snap=0.25')
    const panel = page.locator('[data-testid="sheet-panel"]')
    const map = page.locator('[data-testid="map-container"]')
    
    // Drag on panel at low snap should move sheet, not map
    await panel.hover()
    await page.mouse.down()
    await page.mouse.move(200, 200, { steps: 5 })
    await page.mouse.up()
    
    // Panel should have moved (snapped up or down)
    // Map should NOT have panned (verify map position unchanged)
    const mapMoved = await map.evaluate((el: any) => el.dataset.panned === 'true')
    expect(mapMoved).toBe(false)
  })
  
  test('high snap + scrolled content: sheet owns drag', async ({ page }) => {
    await page.goto('/story/map-panel?snap=0.90')
    const panel = page.locator('[data-testid="sheet-panel"]')
    const content = panel.locator('[data-testid="panel-content"]')
    
    // Scroll content down a bit
    await content.evaluate((el) => { el.scrollTop = 100 })
    
    // Drag should scroll content, not move map
    await content.hover()
    await page.mouse.down()
    await page.mouse.move(200, 300, { steps: 5 })
    await page.mouse.up()
    
    // Content should have scrolled
    const scrollTop = await content.evaluate((el) => el.scrollTop)
    expect(scrollTop).toBeGreaterThan(0)
  })
  
  test('high snap + at top: canvas owns drag', async ({ page }) => {
    await page.goto('/story/map-panel?snap=0.90')
    const panel = page.locator('[data-testid="sheet-panel"]')
    const content = panel.locator('[data-testid="panel-content"]')
    const map = page.locator('[data-testid="map-container"]')
    
    // Ensure content at top
    await content.evaluate((el) => { el.scrollTop = 0 })
    
    // Drag should pan map, not move sheet
    await map.hover()
    await page.mouse.down()
    await page.mouse.move(250, 250, { steps: 10 })
    await page.mouse.up()
    
    // Map should have panned
    const mapMoved = await map.evaluate((el: any) => el.dataset.panned === 'true')
    expect(mapMoved).toBe(true)
    
    // Panel should still be at same snap
    await expect(panel).toHaveAttribute('data-snap', /0\.(9|90)/)
  })
})
