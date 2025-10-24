/**
 * Browser Compatibility Utilities
 * 
 * Feature detection and fallbacks for cross-platform overlay support
 */

/**
 * Check if CSS translate property is supported
 * Safari <14.1, Chrome <104 don't support it
 */
export const supportsTranslate = (): boolean => {
  if (typeof window === 'undefined') return true
  if (typeof CSS === 'undefined' || !CSS.supports) return false
  
  try {
    return CSS.supports('translate', '0')
  } catch {
    return false
  }
}

/**
 * Check if inert attribute is supported
 * Polyfill needed for Safari <15.5, Firefox <112
 */
export const supportsInert = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'inert' in HTMLElement.prototype
}

/**
 * Check if visualViewport API is available
 * iOS Safari 13+, Android Chrome 61+
 */
export const supportsVisualViewport = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'visualViewport' in window
}

/**
 * Detect iOS for scroll lock strategy
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

/**
 * Get safe translate value (uses transform fallback if needed)
 */
export const getTranslateStyle = (
  x: number | string = 0,
  y: number | string = 0
): { translate?: string; transform?: string } => {
  const xVal = typeof x === 'number' ? `${x}px` : x
  const yVal = typeof y === 'number' ? `${y}px` : y
  
  if (supportsTranslate()) {
    return { translate: `${xVal} ${yVal}` }
  }
  
  // Fallback for older browsers
  return { transform: `translate3d(${xVal}, ${yVal}, 0)` }
}
