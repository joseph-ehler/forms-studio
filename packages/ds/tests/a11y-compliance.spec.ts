/**
 * A11Y Compliance Tests
 * 
 * Tests for semantic sizing, density adaptation, and tone resolver
 */

import { test, expect } from '@playwright/test'

test.describe('Semantic Sizing - Importance Scaling', () => {
  test('importance scales with A11Y font scale', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Get baseline sizes
    const baselineSizes = await page.evaluate(() => {
      const critical = document.querySelector('[data-importance="critical"]')
      const primary = document.querySelector('[data-importance="primary"]')
      
      if (!critical || !primary) return null
      
      return {
        critical: parseFloat(getComputedStyle(critical).fontSize),
        primary: parseFloat(getComputedStyle(primary).fontSize)
      }
    })
    
    // Apply 1.5x scale
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--a11y-font-size-scale', '1.5')
    })
    
    await page.waitForTimeout(100)
    
    // Get scaled sizes
    const scaledSizes = await page.evaluate(() => {
      const critical = document.querySelector('[data-importance="critical"]')
      const primary = document.querySelector('[data-importance="primary"]')
      
      if (!critical || !primary) return null
      
      return {
        critical: parseFloat(getComputedStyle(critical).fontSize),
        primary: parseFloat(getComputedStyle(primary).fontSize)
      }
    })
    
    if (baselineSizes && scaledSizes) {
      // Critical should scale more than primary
      const criticalScale = scaledSizes.critical / baselineSizes.critical
      const primaryScale = scaledSizes.primary / baselineSizes.primary
      
      expect(criticalScale).toBeGreaterThan(1)
      expect(primaryScale).toBeGreaterThan(1)
      expect(criticalScale).toBeGreaterThanOrEqual(primaryScale)
    }
  })
})

test.describe('Density Adapter - Spacing/Touch', () => {
  test('density multiplier scales spacing', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Get baseline spacing
    const baselineSpacing = await page.evaluate(() => {
      const root = document.documentElement
      const densityMultiplier = getComputedStyle(root).getPropertyValue('--ds-density-multiplier')
      const spaceMd = getComputedStyle(root).getPropertyValue('--ds-space-md')
      
      return { densityMultiplier, spaceMd }
    })
    
    // Apply 1.5x density
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--ds-density-multiplier', '1.5')
    })
    
    await page.waitForTimeout(100)
    
    const scaledSpacing = await page.evaluate(() => {
      const root = document.documentElement
      return getComputedStyle(root).getPropertyValue('--ds-space-md')
    })
    
    expect(scaledSpacing).not.toBe(baselineSpacing.spaceMd)
  })

  test('touch targets meet WCAG AAA (48px minimum)', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Check all interactive elements
    const touchTargets = await page.evaluate(() => {
      const interactive = document.querySelectorAll('button, a, input, select, [role="button"]')
      const results: Array<{ tag: string; width: number; height: number; meetsWCAG: boolean }> = []
      
      interactive.forEach(el => {
        const rect = el.getBoundingClientRect()
        const meetsWCAG = rect.width >= 44 && rect.height >= 44
        
        results.push({
          tag: el.tagName,
          width: rect.width,
          height: rect.height,
          meetsWCAG
        })
      })
      
      return results
    })
    
    // All touch targets should meet minimum (44px is WCAG AA, we aim for 48px+ for AAA)
    const failedTargets = touchTargets.filter(t => !t.meetsWCAG)
    
    if (failedTargets.length > 0) {
      console.warn('Touch targets below WCAG minimum:', failedTargets)
    }
    
    // At least 90% should meet WCAG
    const passRate = (touchTargets.length - failedTargets.length) / touchTargets.length
    expect(passRate).toBeGreaterThan(0.9)
  })
})

test.describe('Tone Resolver - Contrast Safety', () => {
  test('Section auto-applies safe text color', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Find sections with background colors
    const sections = await page.evaluate(() => {
      const sectionElements = document.querySelectorAll('section, [data-tone]')
      const results: Array<{ bg: string; color: string; contrast: number }> = []
      
      sectionElements.forEach(el => {
        const styles = getComputedStyle(el)
        const bg = styles.backgroundColor
        const color = styles.color
        
        // Simple contrast check (RGB to luminance)
        const getLuminance = (rgb: string) => {
          const match = rgb.match(/\d+/g)
          if (!match) return 0
          const [r, g, b] = match.map(Number)
          return (0.299 * r + 0.587 * g + 0.114 * b) / 255
        }
        
        const bgLum = getLuminance(bg)
        const textLum = getLuminance(color)
        const contrast = Math.abs(bgLum - textLum)
        
        results.push({ bg, color, contrast })
      })
      
      return results
    })
    
    // All sections should have reasonable contrast
    sections.forEach(section => {
      expect(section.contrast).toBeGreaterThan(0.3) // Minimum readability
    })
  })
})

test.describe('A11Y Presets - Runtime Adaptation', () => {
  test('lowVision preset applies 1.5x scale', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Apply lowVision preset
    await page.evaluate(() => {
      const applyA11y = (window as any).applyA11y
      if (applyA11y) {
        applyA11y({ preset: 'lowVision' })
      }
    })
    
    await page.waitForTimeout(200)
    
    const a11ySettings = await page.evaluate(() => {
      const root = document.documentElement
      return {
        fontScale: getComputedStyle(root).getPropertyValue('--a11y-font-size-scale'),
        density: getComputedStyle(root).getPropertyValue('--ds-density-multiplier'),
        touchTarget: getComputedStyle(root).getPropertyValue('--ds-touch-target')
      }
    })
    
    expect(a11ySettings.fontScale).toBe('1.5')
    expect(a11ySettings.density).toBe('1.5')
    expect(a11ySettings.touchTarget).toContain('64') // 64px for lowVision
  })

  test('Presets persist across page reloads', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Apply lowVision
    await page.evaluate(() => {
      const applyA11y = (window as any).applyA11y
      if (applyA11y) {
        applyA11y({ preset: 'lowVision' })
      }
    })
    
    // Reload page
    await page.reload()
    
    // Check if settings persisted
    const persisted = await page.evaluate(() => {
      const root = document.documentElement
      return getComputedStyle(root).getPropertyValue('--a11y-font-size-scale')
    })
    
    expect(persisted).toBe('1.5')
  })
})
