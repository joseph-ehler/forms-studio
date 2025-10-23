/**
 * White-Label - Brand System
 * 
 * Brand packs, contrast validation, tone resolution
 */

export { validateContrast, autoFixContrast, getContrastRatio, meetsWCAG } from './contrastValidator'
export { useContrastGuard } from './useContrastGuard'
export { resolveTone, getToneStyles, type Tone } from './toneResolver'

export { ContrastBadge } from './ContrastBadge'

// TODO: Add brand system
// - applyBrand()
// - brandValidator
// - runtime brand API
