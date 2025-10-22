/**
 * Semantic Sizing System
 * 
 * Maps importance/intent to visual hierarchy.
 * Automatically adapts to A11Y needs while preserving meaning.
 * 
 * Philosophy:
 * - Code expresses WHAT (importance), not HOW (pixels)
 * - A11Y scaling preserves relative hierarchy
 * - Self-documenting: "critical" > "primary" > "secondary"
 */

/**
 * Importance levels - express semantic meaning
 */
export type Importance = 
  | 'critical'   // Most important: Hero headlines, alerts, CTAs
  | 'primary'    // Page titles, main headings
  | 'secondary'  // Section titles, subheadings
  | 'tertiary'   // Card titles, labels
  | 'minor'      // Captions, helper text

/**
 * Semantic size scale
 * Maps importance → base size (before A11Y scaling)
 */
export const SEMANTIC_SIZES: Record<Importance, {
  fontSize: string
  lineHeight: number
  fontWeight: number
  letterSpacing: string
}> = {
  critical: {
    fontSize: '2.25rem',  // 36px
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  primary: {
    fontSize: '1.875rem', // 30px
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  secondary: {
    fontSize: '1.5rem',   // 24px
    lineHeight: 1.3,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  tertiary: {
    fontSize: '1.125rem', // 18px
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: 'normal',
  },
  minor: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
    fontWeight: 500,
    letterSpacing: 'normal',
  },
}

/**
 * A11Y scaling multipliers by importance
 * 
 * These apply ON TOP of base size when A11Y scale is active.
 * Ensures hierarchy is preserved (critical stays bigger than primary).
 */
export const A11Y_IMPORTANCE_MULTIPLIERS: Record<Importance, number> = {
  critical: 1.5,   // Extra emphasis for critical items
  primary: 1.3,    // Strong emphasis
  secondary: 1.15, // Moderate emphasis
  tertiary: 1.0,   // Base scale
  minor: 0.95,     // Slightly smaller (but still scales with --a11y-font-size-scale)
}

/**
 * Get computed size for importance level
 * Combines semantic size + A11Y multiplier
 */
export function getSemanticSize(importance: Importance, a11yScale: number = 1): {
  fontSize: string
  lineHeight: number
  fontWeight: number
  letterSpacing: string
} {
  const base = SEMANTIC_SIZES[importance]
  const multiplier = A11Y_IMPORTANCE_MULTIPLIERS[importance]
  
  // Total scale = base × importance multiplier × global a11y scale
  const totalScale = multiplier * a11yScale
  
  // Parse base font size
  const baseSize = parseFloat(base.fontSize)
  const unit = base.fontSize.replace(/[\d.]/g, '')
  
  return {
    fontSize: `${baseSize * totalScale}${unit}`,
    lineHeight: base.lineHeight,
    fontWeight: base.fontWeight,
    letterSpacing: base.letterSpacing,
  }
}

/**
 * Map traditional size to importance (backward compatibility)
 */
export function sizeToImportance(size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): Importance {
  switch (size) {
    case 'xl': return 'critical'
    case 'lg': return 'primary'
    case 'md': return 'secondary'
    case 'sm': return 'tertiary'
    case 'xs': return 'minor'
    default: return 'secondary'
  }
}

/**
 * CSS custom properties for semantic sizing
 */
export function generateSemanticSizeCSS(): string {
  return Object.entries(SEMANTIC_SIZES)
    .map(([importance, styles]) => {
      const multiplier = A11Y_IMPORTANCE_MULTIPLIERS[importance as Importance]
      return `
  --ds-semantic-${importance}-size: calc(${styles.fontSize} * ${multiplier} * var(--a11y-font-size-scale, 1));
  --ds-semantic-${importance}-line: calc(${styles.lineHeight} * var(--a11y-line-height-multiplier, 1));
  --ds-semantic-${importance}-weight: ${styles.fontWeight};
  --ds-semantic-${importance}-spacing: calc(${styles.letterSpacing} + var(--a11y-letter-spacing-em, 0em));
      `.trim()
    })
    .join('\n  ')
}
