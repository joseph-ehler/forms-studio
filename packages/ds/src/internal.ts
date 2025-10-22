/**
 * @intstudio/ds - Internal Exports
 * 
 * TEST-ONLY EXPORTS
 * 
 * This file exports internal utilities, debug helpers, and implementation
 * details that tests need but external consumers should never import.
 * 
 * ⚠️ WARNING: These exports are NOT part of the public API and may change
 * without notice. Do not import from this file in application code!
 */

// Debug utilities
export { debugTypography } from './utils/debug-typography'
export { validateA11y } from './a11y/a11y-validator'

// Internal utilities (for testing)
export { getSemanticSize } from './utils/semanticSizing'
export { adaptDensity } from './utils/densityAdapter'
export { getLayoutConfig } from './utils/layoutConfig'

// Test helpers (add as needed)
// export { renderWithTheme } from './test-utils/renderWithTheme'
// export { mockBrandContext } from './test-utils/mockBrandContext'
