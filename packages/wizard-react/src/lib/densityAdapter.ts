/**
 * Density & Touch Target Adapter
 * 
 * Automatically scales spacing, touch targets, and layout density
 * based on A11Y settings (font scale, low vision preset, etc.)
 * 
 * Philosophy:
 * - Everything scales together (cohesive feel)
 * - Touch targets meet WCAG AAA (48px minimum)
 * - Spacing prevents cramped layouts at large text
 * - Auto-adapts, zero config
 */

/**
 * Touch target sizes (WCAG AAA: 48px minimum, AA: 44px)
 */
export const TOUCH_TARGETS = {
  /** Minimum (WCAG AA) */
  min: 44,
  /** Standard (WCAG AAA) */
  standard: 48,
  /** Comfortable */
  comfortable: 56,
  /** Large (low vision) */
  large: 64,
} as const

/**
 * Density presets
 */
export type DensityPreset = 'compact' | 'normal' | 'comfortable' | 'spacious'

/**
 * Density multipliers for spacing
 */
export const DENSITY_MULTIPLIERS: Record<DensityPreset, number> = {
  compact: 0.75,      // Tight spacing
  normal: 1.0,        // Default
  comfortable: 1.25,  // Extra breathing room
  spacious: 1.5,      // Low vision / large text
}

/**
 * Compute density preset from A11Y scale
 */
export function getDensityFromA11yScale(fontScale: number): DensityPreset {
  if (fontScale >= 1.5) return 'spacious'
  if (fontScale >= 1.25) return 'comfortable'
  if (fontScale <= 0.875) return 'compact'
  return 'normal'
}

/**
 * Compute touch target size from A11Y scale
 */
export function getTouchTargetFromA11yScale(fontScale: number): number {
  if (fontScale >= 1.5) return TOUCH_TARGETS.large
  if (fontScale >= 1.25) return TOUCH_TARGETS.comfortable
  if (fontScale >= 1.1) return TOUCH_TARGETS.standard
  return TOUCH_TARGETS.min
}

/**
 * Apply density multiplier to a spacing value
 */
export function scaleDensity(baseValue: number | string, multiplier: number): string {
  if (typeof baseValue === 'string') {
    // Parse rem/px values
    const match = baseValue.match(/^([\d.]+)(rem|px|em)$/)
    if (match) {
      const [, value, unit] = match
      return `${parseFloat(value) * multiplier}${unit}`
    }
    return baseValue
  }
  return `${baseValue * multiplier}px`
}

/**
 * Get adaptive spacing styles
 */
export function getAdaptiveSpacing(
  baseGap: string,
  densityMultiplier: number
): {
  gap: string
  '--adaptive-gap': string
} {
  const adaptiveGap = `calc(${baseGap} * ${densityMultiplier})`
  return {
    gap: adaptiveGap,
    '--adaptive-gap': adaptiveGap,
  }
}

/**
 * Get adaptive touch target styles
 */
export function getAdaptiveTouchTarget(
  touchTarget: number
): {
  minHeight: string
  minWidth: string
  '--touch-target-size': string
} {
  return {
    minHeight: `${touchTarget}px`,
    minWidth: `${touchTarget}px`,
    '--touch-target-size': `${touchTarget}px`,
  }
}

/**
 * Watch A11Y scale and return current density settings
 */
export function useAdaptiveDensity(): {
  fontScale: number
  density: DensityPreset
  densityMultiplier: number
  touchTarget: number
} {
  if (typeof window === 'undefined') {
    return {
      fontScale: 1,
      density: 'normal',
      densityMultiplier: 1,
      touchTarget: TOUCH_TARGETS.min,
    }
  }

  const fontScale = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--a11y-font-size-scale') || '1'
  )

  const density = getDensityFromA11yScale(fontScale)
  const densityMultiplier = DENSITY_MULTIPLIERS[density]
  const touchTarget = getTouchTargetFromA11yScale(fontScale)

  return {
    fontScale,
    density,
    densityMultiplier,
    touchTarget,
  }
}

/**
 * CSS custom properties for density system
 */
export function generateDensityCSS(fontScale: number = 1): string {
  const density = getDensityFromA11yScale(fontScale)
  const multiplier = DENSITY_MULTIPLIERS[density]
  const touchTarget = getTouchTargetFromA11yScale(fontScale)

  return `
  --ds-density-preset: ${density};
  --ds-density-multiplier: ${multiplier};
  --ds-touch-target: ${touchTarget}px;
  
  /* Adaptive spacing */
  --ds-space-xs: calc(0.25rem * ${multiplier});
  --ds-space-sm: calc(0.5rem * ${multiplier});
  --ds-space-md: calc(1rem * ${multiplier});
  --ds-space-lg: calc(1.5rem * ${multiplier});
  --ds-space-xl: calc(2rem * ${multiplier});
  --ds-space-2xl: calc(3rem * ${multiplier});
  
  /* Adaptive padding */
  --ds-padding-xs: calc(0.5rem * ${multiplier});
  --ds-padding-sm: calc(0.75rem * ${multiplier});
  --ds-padding-md: calc(1rem * ${multiplier});
  --ds-padding-lg: calc(1.5rem * ${multiplier});
  --ds-padding-xl: calc(2rem * ${multiplier});
  `.trim()
}
