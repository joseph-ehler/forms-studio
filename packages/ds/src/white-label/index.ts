/**
 * White Label Module Exports
 * Manual barrel - files export multiple functions, not single named exports
 */

export { ContrastBadge } from './ContrastBadge';
export * from './contrastValidator';  // exports getContrastRatio, meetsWCAG, nudgeToAA, etc.
export * from './toneResolver';  // exports detectToneFromColor, Tone, TONE_THRESHOLD, etc.
export { useContrastGuard } from './useContrastGuard';
