/**
 * Overlay/Sheet Acceptance Criteria Tests
 * 
 * Validates all acceptance criteria from the overlay/sheet audit:
 * A. Sheet fixed to bottom
 * B. Scroll lock
 * C. Search input adornments
 * D. List item touch targets
 */

import { test, expect } from '@playwright/test'

test.describe('Overlay/Sheet Acceptance Criteria', () => {
  
  // =============================================================================
  // ACCEPTANCE CRITERIA A: Sheet Fixed to Bottom
  // =============================================================================
  
  test.describe('A. Sheet positioning (mobile)', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE
    
    test('sheet bottom edge stays anchored to viewport', async ({ page }) => {
      // Open a SelectField with sheet overlay
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const sheet = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(sheet).toBeVisible()
      
      // Verify positioning
      const box = await sheet.boundingClientRect()
      const viewport = page.viewportSize()!
      
      expect(box.bottom).toBe(viewport.height) // Anchored to bottom
      
      // Verify CSS properties
      const styles = await sheet.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          position: computed.position,
          insetBlockEnd: computed.insetBlockEnd,
          translate: computed.translate,
        }
      })
      
      expect(styles.position).toBe('fixed')
      expect(styles.insetBlockEnd).toBe('0px')
      expect(styles.translate).toContain('0px') // Initial state
    })
    
    test('dragging adjusts height but maintains bottom anchor', async ({ page }) => {
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const sheet = page.locator('[role="dialog"][aria-modal="true"]')
      const dragHandle = sheet.locator('[data-role="drag-handle"]')
      
      // Get initial position
      const initialBox = await sheet.boundingClientRect()
      const viewport = page.viewportSize()!
      
      // Drag down 50px
      await dragHandle.hover()
      await page.mouse.down()
      await page.mouse.move(viewport.width / 2, initialBox.top + 50)
      await page.mouse.up()
      
      // Bottom should still be anchored
      const afterBox = await sheet.boundingClientRect()
      expect(afterBox.bottom).toBe(viewport.height)
      
      // Translate should reflect offset
      const translate = await sheet.evaluate((el) => 
        window.getComputedStyle(el).translate
      )
      expect(translate).toMatch(/0px\s+\d+px/) // Y offset applied
    })
    
    test('keyboard appearance preserves anchoring', async ({ page, context }) => {
      // This test requires real mobile emulation
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const sheet = page.locator('[role="dialog"][aria-modal="true"]')
      const searchInput = sheet.locator('input[type="search"]')
      
      // Focus search (triggers keyboard on real device)
      await searchInput.focus()
      
      // Sheet should still be anchored
      const box = await sheet.boundingClientRect()
      expect(box.bottom).toBeLessThanOrEqual(page.viewportSize()!.height)
    })
  })
  
  // =============================================================================
  // ACCEPTANCE CRITERIA B: Scroll Lock
  // =============================================================================
  
  test.describe('B. Scroll lock', () => {
    
    test('html overflow locked when overlay open', async ({ page }) => {
      await page.goto('/demo/select-field')
      
      // Before open: scroll enabled
      const beforeOverflow = await page.evaluate(() => 
        document.documentElement.style.overflow
      )
      expect(beforeOverflow).not.toBe('hidden')
      
      // Open overlay
      await page.click('[data-testid="select-trigger"]')
      await page.waitForSelector('[role="dialog"][aria-modal="true"]')
      
      // After open: scroll locked
      const afterOverflow = await page.evaluate(() => 
        document.documentElement.style.overflow
      )
      expect(afterOverflow).toBe('hidden')
    })
    
    test('scroll lock released when overlay closes', async ({ page }) => {
      await page.goto('/demo/select-field')
      
      // Open
      await page.click('[data-testid="select-trigger"]')
      await page.waitForSelector('[role="dialog"][aria-modal="true"]')
      
      // Close
      await page.keyboard.press('Escape')
      await page.waitForSelector('[role="dialog"][aria-modal="true"]', { state: 'hidden' })
      
      // Scroll unlocked
      const overflow = await page.evaluate(() => 
        document.documentElement.style.overflow
      )
      expect(overflow).not.toBe('hidden')
    })
    
    test('only one scroll lock applied (no double-lock)', async ({ page }) => {
      await page.goto('/demo/select-field')
      
      // Track all overflow changes
      const overflowChanges: string[] = []
      await page.exposeFunction('trackOverflow', (value: string) => {
        overflowChanges.push(value)
      })
      
      await page.evaluate(() => {
        const observer = new MutationObserver(() => {
          (window as any).trackOverflow(document.documentElement.style.overflow)
        })
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['style']
        })
      })
      
      // Open/close
      await page.click('[data-testid="select-trigger"]')
      await page.waitForTimeout(100)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
      
      // Should only see one 'hidden' and one restore (not duplicates)
      const hiddenCount = overflowChanges.filter(v => v === 'hidden').length
      expect(hiddenCount).toBe(1) // Single lock source
    })
  })
  
  // =============================================================================
  // ACCEPTANCE CRITERIA C: Search Input + Icon
  // =============================================================================
  
  test.describe('C. Search input adornments', () => {
    
    test('search icon never overlaps input text', async ({ page }) => {
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const searchInput = page.locator('input[type="search"]')
      const searchIcon = page.locator('.ds-input-adorn-left svg')
      
      await expect(searchInput).toBeVisible()
      await expect(searchIcon).toBeVisible()
      
      // Check padding
      const paddingLeft = await searchInput.evaluate((el) => 
        window.getComputedStyle(el).paddingLeft
      )
      expect(parseInt(paddingLeft)).toBeGreaterThanOrEqual(36) // Enough for icon
      
      // Type text and verify no overlap
      await searchInput.fill('Test search query that is quite long')
      
      const inputBox = await searchInput.boundingClientRect()
      const iconBox = await searchIcon.boundingClientRect()
      
      // Icon should be left of input content area
      expect(iconBox.right).toBeLessThan(inputBox.left + parseInt(paddingLeft))
    })
    
    test('text never touches left edge', async ({ page }) => {
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const searchInput = page.locator('input[type="search"]')
      await searchInput.fill('A')
      
      const paddingLeft = await searchInput.evaluate((el) => 
        parseInt(window.getComputedStyle(el).paddingLeft)
      )
      
      expect(paddingLeft).toBeGreaterThanOrEqual(36)
    })
    
    test('works in RTL mode', async ({ page }) => {
      await page.goto('/demo/select-field')
      
      // Set RTL
      await page.evaluate(() => {
        document.documentElement.dir = 'rtl'
      })
      
      await page.click('[data-testid="select-trigger"]')
      
      const searchInput = page.locator('input[type="search"]')
      const searchIcon = page.locator('.ds-input-adorn-left svg')
      
      // In RTL, left adornment should appear on right
      const inputBox = await searchInput.boundingClientRect()
      const iconBox = await searchIcon.boundingClientRect()
      
      // Icon should be on the right in RTL
      expect(iconBox.left).toBeGreaterThan(inputBox.right - 50)
    })
  })
  
  // =============================================================================
  // ACCEPTANCE CRITERIA D: List Item Touch Targets
  // =============================================================================
  
  test.describe('D. List item sizing', () => {
    
    test('minimum item height >= 48px', async ({ page }) => {
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const options = page.locator('[role="option"]')
      await expect(options.first()).toBeVisible()
      
      const count = await options.count()
      
      // Check all visible options
      for (let i = 0; i < Math.min(count, 5); i++) {
        const option = options.nth(i)
        const box = await option.boundingClientRect()
        
        expect(box.height).toBeGreaterThanOrEqual(48) // WCAG AAA
      }
    })
    
    test('list has 8px padding', async ({ page }) => {
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const list = page.locator('[role="listbox"]')
      await expect(list).toBeVisible()
      
      const padding = await list.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          top: parseInt(computed.paddingTop),
          bottom: parseInt(computed.paddingBottom),
        }
      })
      
      expect(padding.top).toBeGreaterThanOrEqual(8)
      expect(padding.bottom).toBeGreaterThanOrEqual(8)
    })
    
    test('hover scrim works in light theme', async ({ page }) => {
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const option = page.locator('[role="option"]').first()
      const scrim = option.locator('.ds-hover-scrim')
      
      // Initially invisible
      let opacity = await scrim.evaluate((el) => 
        window.getComputedStyle(el).opacity
      )
      expect(parseFloat(opacity)).toBe(0)
      
      // Hover
      await option.hover()
      await page.waitForTimeout(200) // Transition
      
      opacity = await scrim.evaluate((el) => 
        window.getComputedStyle(el).opacity
      )
      expect(parseFloat(opacity)).toBe(1)
    })
    
    test('selected + hover layering correct', async ({ page }) => {
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const selectedOption = page.locator('[role="option"][aria-selected="true"]')
      await expect(selectedOption).toBeVisible()
      
      // Get background before hover
      const bgBefore = await selectedOption.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      )
      
      // Hover selected item
      await selectedOption.hover()
      await page.waitForTimeout(200)
      
      // Scrim should darken (not replace) background
      const scrim = selectedOption.locator('.ds-hover-scrim')
      const scrimBg = await scrim.evaluate((el) => 
        window.getComputedStyle(el).background
      )
      
      expect(scrimBg).toContain('rgba(0, 0, 0, 0.1)') // Dark scrim over selected
    })
  })
  
  // =============================================================================
  // INTEGRATION: Full Flow
  // =============================================================================
  
  test.describe('Integration: Full interaction flow', () => {
    
    test('complete keyboard flow', async ({ page }) => {
      await page.goto('/demo/select-field')
      
      // Focus trigger
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter') // Open
      
      // Verify opened
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      
      // Tab should loop within overlay
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Escape closes
      await page.keyboard.press('Escape')
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()
      
      // Focus returns to trigger
      const activeElement = await page.evaluate(() => 
        document.activeElement?.getAttribute('data-testid')
      )
      expect(activeElement).toBe('select-trigger')
    })
    
    test('viewport resize maintains positioning', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/demo/select-field')
      await page.click('[data-testid="select-trigger"]')
      
      const sheet = page.locator('[role="dialog"]')
      
      // Resize viewport (simulates keyboard appearance)
      await page.setViewportSize({ width: 375, height: 400 })
      await page.waitForTimeout(100)
      
      // Sheet should still be visible and anchored
      await expect(sheet).toBeVisible()
      
      const box = await sheet.boundingClientRect()
      expect(box.bottom).toBe(400) // Anchored to new viewport height
    })
  })
})
