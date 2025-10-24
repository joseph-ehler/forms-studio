/**
 * Recipe Contract Validation Utilities
 * 
 * Ensures overlay recipes maintain required ARIA roles, props, and structure.
 * Use in Jest tests to validate recipe implementations.
 */

import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

export interface OverlayRecipeContract {
  /** Must have role="dialog" or role="listbox" */
  hasDialogOrListbox: boolean
  /** Must have aria-modal when dialog */
  hasAriaModal: boolean
  /** Must have aria-label or aria-labelledby */
  hasAccessibleName: boolean
  /** Options must have role="option" */
  optionsHaveRole: boolean
  /** Multiselect must have aria-multiselectable */
  multiHasAriaMulti: boolean
  /** Search input exists if search enabled */
  hasSearchWhenEnabled: boolean
}

export interface RecipeContractOptions {
  /** Expected recipe type */
  type: 'select' | 'multiselect' | 'date' | 'color' | 'custom'
  /** Is search enabled? */
  searchEnabled?: boolean
  /** Is multiselect? */
  isMulti?: boolean
  /** Expected option count */
  expectedOptions?: number
}

/**
 * Validates an overlay recipe meets contract requirements
 * 
 * @example
 * ```ts
 * test('SelectField meets overlay contract', () => {
 *   const { container } = render(<SelectField {...props} />)
 *   const contract = validateRecipeContract(container, { type: 'select' })
 *   
 *   expect(contract.hasDialogOrListbox).toBe(true)
 *   expect(contract.hasAccessibleName).toBe(true)
 * })
 * ```
 */
export function validateRecipeContract(
  container: HTMLElement,
  options: RecipeContractOptions
): OverlayRecipeContract {
  const results: OverlayRecipeContract = {
    hasDialogOrListbox: false,
    hasAriaModal: false,
    hasAccessibleName: false,
    optionsHaveRole: false,
    multiHasAriaMulti: false,
    hasSearchWhenEnabled: false,
  }

  // Check for dialog or listbox
  const dialog = container.querySelector('[role="dialog"]')
  const listbox = container.querySelector('[role="listbox"]')
  results.hasDialogOrListbox = !!(dialog || listbox)

  // If dialog, check aria-modal
  if (dialog) {
    results.hasAriaModal = dialog.getAttribute('aria-modal') === 'true'
  }

  // Check accessible name
  const hasLabel = !!(
    dialog?.getAttribute('aria-label') ||
    dialog?.getAttribute('aria-labelledby') ||
    listbox?.getAttribute('aria-label') ||
    listbox?.getAttribute('aria-labelledby')
  )
  results.hasAccessibleName = hasLabel

  // Check option roles
  const options = container.querySelectorAll('[role="option"]')
  if (options.length > 0) {
    results.optionsHaveRole = true
    
    // Verify all have required attrs
    const allValid = Array.from(options).every(opt => {
      return opt.hasAttribute('aria-selected')
    })
    results.optionsHaveRole = allValid
  }

  // Check multiselect aria
  if (options.isMulti && listbox) {
    results.multiHasAriaMulti = listbox.getAttribute('aria-multiselectable') === 'true'
  }

  // Check search input
  if (options.searchEnabled) {
    const searchInput = container.querySelector('input[type="search"]')
    results.hasSearchWhenEnabled = !!searchInput
  }

  return results
}

/**
 * Assert all contract requirements are met
 * Throws if any validation fails
 */
export function assertRecipeContract(
  container: HTMLElement,
  options: RecipeContractOptions
): void {
  const contract = validateRecipeContract(container, options)
  const errors: string[] = []

  if (!contract.hasDialogOrListbox) {
    errors.push('Missing role="dialog" or role="listbox"')
  }

  if (!contract.hasAccessibleName) {
    errors.push('Missing aria-label or aria-labelledby')
  }

  if (options.expectedOptions && !contract.optionsHaveRole) {
    errors.push('Options missing role="option" or aria-selected')
  }

  if (options.isMulti && !contract.multiHasAriaMulti) {
    errors.push('Multiselect missing aria-multiselectable="true"')
  }

  if (options.searchEnabled && !contract.hasSearchWhenEnabled) {
    errors.push('Search enabled but no input[type="search"] found')
  }

  if (errors.length > 0) {
    throw new Error(
      `Recipe contract violations for ${options.type}:\n  - ${errors.join('\n  - ')}`
    )
  }
}

/**
 * Validates DS primitive usage (no positioning/portal in recipe)
 */
export function assertNoDSLeakage(component: ReactElement): void {
  const { container } = render(component)
  
  // Check for inline positioning styles (should use DS primitives instead)
  const allElements = container.querySelectorAll('*')
  const violations: string[] = []

  allElements.forEach((el) => {
    const style = (el as HTMLElement).style
    
    // Check for forbidden inline positioning
    if (style.position === 'fixed' || style.position === 'absolute') {
      violations.push(`Element has inline position: ${style.position}`)
    }
    
    if (style.zIndex) {
      violations.push(`Element has inline z-index: ${style.zIndex}`)
    }
    
    // Check for transform (should use translate)
    if (style.transform && style.transform.includes('translate')) {
      violations.push('Element uses transform (should use translate CSS property)')
    }
  })

  if (violations.length > 0) {
    throw new Error(
      `DS responsibility leakage detected:\n  - ${violations.join('\n  - ')}\n\n` +
      `Recipes should use DS primitives (OverlayPicker/OverlaySheet) instead of manual positioning.`
    )
  }
}

/**
 * Validates touch target sizing (WCAG compliance)
 */
export function assertTouchTargets(
  container: HTMLElement,
  minHeight: number = 48
): void {
  const options = container.querySelectorAll('[role="option"]')
  const violations: string[] = []

  options.forEach((opt, idx) => {
    const rect = opt.getBoundingClientRect()
    if (rect.height < minHeight) {
      violations.push(
        `Option ${idx} height ${rect.height}px < ${minHeight}px (WCAG AAA)`
      )
    }
  })

  if (violations.length > 0) {
    throw new Error(
      `Touch target violations:\n  - ${violations.join('\n  - ')}`
    )
  }
}

/**
 * Validates scroll lock is applied when overlay open
 */
export function assertScrollLock(isOpen: boolean): void {
  const html = document.documentElement
  const htmlOverflow = html.style.overflow
  const bodyOverflow = document.body.style.overflow

  if (isOpen) {
    if (htmlOverflow !== 'hidden' && bodyOverflow !== 'hidden') {
      throw new Error(
        `Scroll lock not applied when overlay open.\n` +
        `Expected: documentElement.style.overflow === 'hidden'\n` +
        `Actual: ${htmlOverflow}`
      )
    }
  } else {
    if (htmlOverflow === 'hidden' || bodyOverflow === 'hidden') {
      throw new Error(
        `Scroll lock not released when overlay closed.\n` +
        `Expected: overflow restored\n` +
        `Actual: html=${htmlOverflow}, body=${bodyOverflow}`
      )
    }
  }
}

/**
 * Example usage in tests:
 * 
 * ```ts
 * describe('SelectField contract', () => {
 *   test('meets overlay recipe contract', () => {
 *     const { container } = render(
 *       <SelectField name="test" options={options} />
 *     )
 *     
 *     // Open overlay
 *     fireEvent.click(screen.getByRole('button'))
 *     
 *     // Validate contract
 *     assertRecipeContract(container, {
 *       type: 'select',
 *       searchEnabled: true,
 *       expectedOptions: 5
 *     })
 *     
 *     // Validate no DS leakage
 *     assertNoDSLeakage(<SelectField {...props} />)
 *     
 *     // Validate touch targets
 *     assertTouchTargets(container, 48)
 *     
 *     // Validate scroll lock
 *     assertScrollLock(true)
 *   })
 * })
 * ```
 */
