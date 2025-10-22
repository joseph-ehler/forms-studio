/**
 * Semantic Color Tokens
 * 
 * The ONLY tokens components should use.
 * These map to CSS variables that resolve to brand/theme-specific values.
 * 
 * Philosophy: Components depend on ROLES (button.bg), not PALETTES (blue-600)
 */

export const SEMANTIC_COLOR_TOKENS = {
  /**
   * Text colors
   */
  text: {
    primary: 'var(--ds-color-text-primary)',
    secondary: 'var(--ds-color-text-secondary)',
    muted: 'var(--ds-color-text-muted)',
    inverted: 'var(--ds-color-text-inverted)',
    link: 'var(--ds-color-text-link)',
    linkHover: 'var(--ds-color-text-link-hover)',
  },
  
  /**
   * Surface colors (backgrounds)
   */
  surface: {
    base: 'var(--ds-color-surface-base)',
    subtle: 'var(--ds-color-surface-subtle)',
    raised: 'var(--ds-color-surface-raised)',
    overlay: 'var(--ds-color-surface-overlay)',
    glass: 'var(--ds-color-surface-glass)',
  },
  
  /**
   * Border colors
   */
  border: {
    subtle: 'var(--ds-color-border-subtle)',
    strong: 'var(--ds-color-border-strong)',
    focus: 'var(--ds-color-border-focus)',
    error: 'var(--ds-color-border-error)',
  },
  
  /**
   * State colors (semantic roles)
   */
  state: {
    info: 'var(--ds-color-state-info)',
    success: 'var(--ds-color-state-success)',
    warning: 'var(--ds-color-state-warning)',
    danger: 'var(--ds-color-state-danger)',
  },
  
  /**
   * Interactive - Primary
   */
  interactive: {
    primary: {
      bg: 'var(--ds-color-primary-bg)',
      bgHover: 'var(--ds-color-primary-bg-hover)',
      bgActive: 'var(--ds-color-primary-bg-active)',
      text: 'var(--ds-color-primary-text)',
      ring: 'var(--ds-color-primary-ring)',
    },
    secondary: {
      bg: 'var(--ds-color-secondary-bg)',
      bgHover: 'var(--ds-color-secondary-bg-hover)',
      bgActive: 'var(--ds-color-secondary-bg-active)',
      text: 'var(--ds-color-secondary-text)',
      ring: 'var(--ds-color-secondary-ring)',
    },
    ghost: {
      bg: 'var(--ds-color-ghost-bg)',
      bgHover: 'var(--ds-color-ghost-bg-hover)',
      bgActive: 'var(--ds-color-ghost-bg-active)',
      text: 'var(--ds-color-ghost-text)',
      ring: 'var(--ds-color-ghost-ring)',
    },
  },
} as const;

/**
 * Type helper for semantic tokens
 */
export type SemanticColorToken = typeof SEMANTIC_COLOR_TOKENS;
