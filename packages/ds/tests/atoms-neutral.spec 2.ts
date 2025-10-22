/**
 * Atoms Neutrality Test
 * 
 * Ensures all typography and interactive atoms have margin: 0
 * (containers own spacing, not atoms)
 */

import { test, expect } from '@playwright/test'

test.describe('Atoms Neutrality', () => {
  test.beforeEach(async ({ page }) => {
    // Create test page with all atoms
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="../dist/index.css">
      </head>
      <body>
        <div class="ds-display-2xl">Display 2XL</div>
        <div class="ds-display-xl">Display XL</div>
        <div class="ds-heading-xl">Heading XL</div>
        <div class="ds-heading-lg">Heading LG</div>
        <div class="ds-heading-md">Heading MD</div>
        <div class="ds-body-md">Body MD</div>
        <div class="ds-body-sm">Body SM</div>
        <label class="ds-label">Label</label>
        <div class="ds-helper">Helper Text</div>
        <div class="ds-caption">Caption</div>
        <button class="ds-button">Button</button>
      </body>
      </html>
    `)
  })

  const atoms = [
    { name: 'Display 2XL', selector: '.ds-display-2xl' },
    { name: 'Display XL', selector: '.ds-display-xl' },
    { name: 'Heading XL', selector: '.ds-heading-xl' },
    { name: 'Heading LG', selector: '.ds-heading-lg' },
    { name: 'Heading MD', selector: '.ds-heading-md' },
    { name: 'Body MD', selector: '.ds-body-md' },
    { name: 'Body SM', selector: '.ds-body-sm' },
    { name: 'Label', selector: '.ds-label' },
    { name: 'Helper', selector: '.ds-helper' },
    { name: 'Caption', selector: '.ds-caption' },
  ]

  for (const atom of atoms) {
    test(`${atom.name} has margin: 0`, async ({ page }) => {
      const margin = await page.$eval(
        atom.selector,
        el => getComputedStyle(el).margin
      )
      
      expect(margin).toBe('0px')
    })
  }

  test('Button has no external margins', async ({ page }) => {
    const marginTop = await page.$eval(
      '.ds-button',
      el => getComputedStyle(el).marginTop
    )
    const marginBottom = await page.$eval(
      '.ds-button',
      el => getComputedStyle(el).marginBottom
    )
    
    expect(marginTop).toBe('0px')
    expect(marginBottom).toBe('0px')
  })
})
