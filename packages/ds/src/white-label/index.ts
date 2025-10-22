/**
 * White-Label - Brand System
 * 
 * Brand packs, contrast validation, tone resolution
 */

export { validateContrast, ContrastResult } from './contrastValidator'
export { useContrastGuard } from './useContrastGuard'
export { resolveTone, getToneStyles } from './toneResolver'
export type { Tone } from './toneResolver'

export { ContrastBadge } from './ContrastBadge'
export type { ContrastBadgeProps } from './ContrastBadge'

// TODO: Add brand system
// - applyBrand()
// - brandValidator
// - runtime brand API
