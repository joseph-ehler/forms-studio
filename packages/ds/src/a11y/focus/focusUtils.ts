/**
 * Focus Utilities
 * 
 * Shared helpers for focus management primitives.
 * Used by FocusTrap, FocusScope, and RovingFocus.
 */

/**
 * FOCUSABLE_SELECTOR
 * 
 * Standard selector for all focusable elements.
 * Matches WCAG 2.1 definition of interactive elements.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details > summary',
].join(', ')

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(el => {
    // Filter out hidden elements
    return (
      el.offsetWidth > 0 &&
      el.offsetHeight > 0 &&
      window.getComputedStyle(el).visibility !== 'hidden'
    )
  })
}

/**
 * Get first focusable element
 */
export function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container)
  return elements[0] || null
}

/**
 * Get last focusable element
 */
export function getLastFocusable(container: HTMLElement): HTMLElement | null {
  const elements = getFocusableElements(container)
  return elements[elements.length - 1] || null
}

/**
 * Get next focusable element (for arrow key nav)
 */
export function getNextFocusable(
  container: HTMLElement,
  current: HTMLElement,
  loop = false
): HTMLElement | null {
  const elements = getFocusableElements(container)
  const currentIndex = elements.indexOf(current)
  
  if (currentIndex === -1) return elements[0] || null
  
  const nextIndex = currentIndex + 1
  
  if (nextIndex >= elements.length) {
    return loop ? elements[0] : null
  }
  
  return elements[nextIndex]
}

/**
 * Get previous focusable element (for arrow key nav)
 */
export function getPreviousFocusable(
  container: HTMLElement,
  current: HTMLElement,
  loop = false
): HTMLElement | null {
  const elements = getFocusableElements(container)
  const currentIndex = elements.indexOf(current)
  
  if (currentIndex === -1) return elements[elements.length - 1] || null
  
  const prevIndex = currentIndex - 1
  
  if (prevIndex < 0) {
    return loop ? elements[elements.length - 1] : null
  }
  
  return elements[prevIndex]
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  return element.matches(FOCUSABLE_SELECTOR)
}

/**
 * Focus element with optional restore
 */
export function focusElement(
  element: HTMLElement | null,
  options?: FocusOptions
): void {
  if (!element) return
  
  // Use requestAnimationFrame to ensure element is ready
  requestAnimationFrame(() => {
    element.focus(options)
  })
}

/**
 * Store and restore focus
 */
export function createFocusStore() {
  let previousElement: Element | null = null
  
  return {
    store: () => {
      previousElement = document.activeElement
    },
    restore: () => {
      if (previousElement instanceof HTMLElement) {
        focusElement(previousElement)
      }
    },
    clear: () => {
      previousElement = null
    },
    get: () => previousElement,
  }
}

/**
 * Focus scope ID generator
 */
let scopeIdCounter = 0
export function generateScopeId(): string {
  return `focus-scope-${++scopeIdCounter}`
}
