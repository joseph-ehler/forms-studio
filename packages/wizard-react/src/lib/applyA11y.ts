/**
 * Accessibility Runtime API
 * 
 * Apply accessibility profiles at runtime by manipulating CSS custom properties.
 * Zero rebuilds, instant updates, persisted to localStorage.
 */

import type { A11yProfile, TouchTarget } from './a11yProfiles'
import { getDensityFromA11yScale, getTouchTargetFromA11yScale, DENSITY_MULTIPLIERS } from './densityAdapter'

const STORAGE_KEY = 'ds-a11y-preferences'

/**
 * Touch target size map
 */
const TOUCH_TARGET_MAP: Record<TouchTarget, string> = {
  min: '44px',         // WCAG minimum
  comfortable: '48px', // Recommended
  relaxed: '56px',     // Large
  large: '64px',       // Extra large
}

/**
 * Apply accessibility profile to the document
 * 
 * Modifies CSS custom properties on :root to reshape the entire DS.
 * 
 * @example
 * applyA11y({ sizeScale: 1.25, lineHeight: 1.4 })
 * 
 * @example
 * applyA11y(A11Y_PRESETS.dyslexia)
 */
export function applyA11y(profile: A11yProfile): void {
  const root = document.documentElement
  
  // Font family preset
  if (profile.font !== undefined) {
    root.setAttribute('data-a11y-font', profile.font)
  }
  
  // Font size scale + auto-adapt density and touch targets
  if (profile.sizeScale !== undefined) {
    root.style.setProperty('--a11y-font-size-scale', String(profile.sizeScale))
    
    // Auto-calculate density from font scale (unless explicitly set)
    if (profile.density === undefined) {
      const densityPreset = getDensityFromA11yScale(profile.sizeScale)
      const densityMultiplier = DENSITY_MULTIPLIERS[densityPreset]
      root.style.setProperty('--ds-density-multiplier', String(densityMultiplier))
    }
    
    // Auto-calculate touch target from font scale (unless explicitly set)
    if (profile.touchTarget === undefined) {
      const touchTarget = getTouchTargetFromA11yScale(profile.sizeScale)
      root.style.setProperty('--ds-touch-target', `${touchTarget}px`)
    }
  }
  
  // Line height multiplier
  if (profile.lineHeight !== undefined) {
    root.style.setProperty('--a11y-line-height-multiplier', String(profile.lineHeight))
  }
  
  // Letter spacing
  if (profile.letterSpacingEm !== undefined) {
    root.style.setProperty('--a11y-letter-spacing-em', `${profile.letterSpacingEm}em`)
  }
  
  // Word spacing
  if (profile.wordSpacingEm !== undefined) {
    root.style.setProperty('--a11y-word-spacing-em', `${profile.wordSpacingEm}em`)
  }
  
  // Reading measure
  if (profile.measureCh !== undefined) {
    root.style.setProperty('--a11y-measure-ch', `${profile.measureCh}ch`)
  }
  
  // Reduced motion
  if (profile.reducedMotion !== undefined) {
    root.setAttribute('data-a11y-motion', profile.reducedMotion ? 'off' : 'on')
    root.style.setProperty('--a11y-reduced-motion-scale', profile.reducedMotion ? '0' : '1')
  }
  
  // Focus ring width
  if (profile.focusRingPx !== undefined) {
    root.style.setProperty('--a11y-focus-ring-width', `${profile.focusRingPx}px`)
  }
  
  // Touch target size
  if (profile.touchTarget !== undefined) {
    root.style.setProperty('--a11y-touch-min', TOUCH_TARGET_MAP[profile.touchTarget])
  }
  
  // Density multiplier
  if (profile.density !== undefined) {
    root.style.setProperty('--a11y-density-multiplier', String(profile.density))
  }
  
  // Underline links
  if (profile.underlineLinks !== undefined) {
    root.style.setProperty('--a11y-underline-links', profile.underlineLinks ? '1' : '0')
  }
  
  // High contrast
  if (profile.highContrast !== undefined) {
    root.style.setProperty('--a11y-high-contrast', profile.highContrast ? '1' : '0')
  }
  
  // Colorblind safe
  if (profile.colorblindSafe !== undefined) {
    root.style.setProperty('--a11y-colorblind-safe', profile.colorblindSafe ? '1' : '0')
  }
  
  // Reading ruler
  if (profile.readingRuler !== undefined) {
    root.setAttribute('data-a11y-reading-ruler', profile.readingRuler ? 'on' : 'off')
  }
  
  // Paragraph focus
  if (profile.paragraphFocus !== undefined) {
    root.setAttribute('data-a11y-paragraph-focus', profile.paragraphFocus ? 'on' : 'off')
  }
  
  // Text alignment
  if (profile.textAlign !== undefined) {
    root.style.setProperty('--a11y-text-align', profile.textAlign)
  }
  
  // Hyphenation
  if (profile.hyphenation !== undefined) {
    root.style.setProperty('--a11y-hyphenation', profile.hyphenation)
  }
}

/**
 * Get current accessibility preferences
 */
export function getCurrentA11y(): A11yProfile {
  const root = document.documentElement
  
  return {
    font: (root.getAttribute('data-a11y-font') as any) || 'default',
    sizeScale: parseFloat(root.style.getPropertyValue('--a11y-font-size-scale')) || 1,
    lineHeight: parseFloat(root.style.getPropertyValue('--a11y-line-height-multiplier')) || 1,
    letterSpacingEm: parseFloat(root.style.getPropertyValue('--a11y-letter-spacing-em')) || 0,
    wordSpacingEm: parseFloat(root.style.getPropertyValue('--a11y-word-spacing-em')) || 0,
    measureCh: parseFloat(root.style.getPropertyValue('--a11y-measure-ch')) || 65,
    reducedMotion: root.getAttribute('data-a11y-motion') === 'off',
    highContrast: root.style.getPropertyValue('--a11y-high-contrast') === '1',
    colorblindSafe: root.style.getPropertyValue('--a11y-colorblind-safe') === '1',
    underlineLinks: root.style.getPropertyValue('--a11y-underline-links') === '1',
    readingRuler: root.getAttribute('data-a11y-reading-ruler') === 'on',
    paragraphFocus: root.getAttribute('data-a11y-paragraph-focus') === 'on',
  }
}

/**
 * Save accessibility preferences to localStorage
 */
export function saveA11yPreferences(profile: A11yProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.warn('Failed to save accessibility preferences:', error)
  }
}

/**
 * Load accessibility preferences from localStorage
 */
export function loadA11yPreferences(): A11yProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Failed to load accessibility preferences:', error)
    return null
  }
}

/**
 * Reset accessibility to defaults
 */
export function resetA11y(): void {
  const root = document.documentElement
  
  // Remove attributes
  root.removeAttribute('data-a11y-font')
  root.removeAttribute('data-a11y-motion')
  root.removeAttribute('data-a11y-reading-ruler')
  root.removeAttribute('data-a11y-paragraph-focus')
  
  // Reset custom properties to defaults
  root.style.removeProperty('--a11y-font-size-scale')
  root.style.removeProperty('--a11y-line-height-multiplier')
  root.style.removeProperty('--a11y-letter-spacing-em')
  root.style.removeProperty('--a11y-word-spacing-em')
  root.style.removeProperty('--a11y-measure-ch')
  root.style.removeProperty('--a11y-reduced-motion-scale')
  root.style.removeProperty('--a11y-focus-ring-width')
  root.style.removeProperty('--a11y-touch-min')
  root.style.removeProperty('--a11y-density-multiplier')
  root.style.removeProperty('--a11y-underline-links')
  root.style.removeProperty('--a11y-high-contrast')
  root.style.removeProperty('--a11y-colorblind-safe')
  root.style.removeProperty('--a11y-text-align')
  root.style.removeProperty('--a11y-hyphenation')
  
  // Clear storage
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear accessibility preferences:', error)
  }
}

/**
 * Pre-paint script to avoid FOUC
 * 
 * Add to <head> before any styles load:
 * <script>
 *   (function() {
 *     const stored = localStorage.getItem('ds-a11y-preferences');
 *     if (stored) {
 *       const prefs = JSON.parse(stored);
 *       // Apply critical props immediately
 *       if (prefs.font) document.documentElement.setAttribute('data-a11y-font', prefs.font);
 *       if (prefs.sizeScale) document.documentElement.style.setProperty('--a11y-font-size-scale', prefs.sizeScale);
 *       // ... etc
 *     }
 *   })();
 * </script>
 */
export function generatePrePaintScript(): string {
  return `
(function() {
  try {
    const stored = localStorage.getItem('${STORAGE_KEY}');
    if (stored) {
      const p = JSON.parse(stored);
      const r = document.documentElement;
      if (p.font) r.setAttribute('data-a11y-font', p.font);
      if (p.sizeScale) r.style.setProperty('--a11y-font-size-scale', String(p.sizeScale));
      if (p.lineHeight) r.style.setProperty('--a11y-line-height-multiplier', String(p.lineHeight));
      if (p.reducedMotion) r.setAttribute('data-a11y-motion', 'off');
      if (p.highContrast) r.style.setProperty('--a11y-high-contrast', '1');
    }
  } catch (e) {}
})();
  `.trim()
}
