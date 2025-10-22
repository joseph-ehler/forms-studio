/**
 * A11y - Accessibility Layer
 * 
 * Accessibility presets, focus primitives, ARIA helpers
 */

export { applyA11y } from './applyA11y'
export type { A11yProfile, A11yPreset } from './a11yProfiles'
export { A11Y_PROFILES, A11Y_PRESETS } from './a11yProfiles'

// Focus utilities
export { srAnnounce } from './sr-announce'
export { getInputModality } from './input-modality'
export { validateA11y } from './a11y-validator'

// TODO: Add focus primitives
// - FocusZone
// - FocusTrap
// - FocusScope
