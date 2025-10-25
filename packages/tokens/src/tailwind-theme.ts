/**
 * Tailwind Theme Configuration
 * 
 * Bridges design tokens to Tailwind utilities.
 * Import this in your tailwind.config.js
 */

export const tokensTheme = {
  colors: {
    // OKLCH 12-step ramps (generative, white-label ready)
    primary: {
      1: 'var(--ds-primary-1)',   2: 'var(--ds-primary-2)',   3: 'var(--ds-primary-3)',
      4: 'var(--ds-primary-4)',   5: 'var(--ds-primary-5)',   6: 'var(--ds-primary-6)',
      7: 'var(--ds-primary-7)',   8: 'var(--ds-primary-8)',   9: 'var(--ds-primary-9)',
      10: 'var(--ds-primary-10)', 11: 'var(--ds-primary-11)', 12: 'var(--ds-primary-12)',
      DEFAULT: 'var(--ds-primary-10)',
      hover: 'var(--ds-role-primary-hover)',
      subtle: 'var(--ds-primary-2)',
    },
    neutral: {
      1: 'var(--ds-neutral-1)',   2: 'var(--ds-neutral-2)',   3: 'var(--ds-neutral-3)',
      4: 'var(--ds-neutral-4)',   5: 'var(--ds-neutral-5)',   6: 'var(--ds-neutral-6)',
      7: 'var(--ds-neutral-7)',   8: 'var(--ds-neutral-8)',   9: 'var(--ds-neutral-9)',
      10: 'var(--ds-neutral-10)', 11: 'var(--ds-neutral-11)', 12: 'var(--ds-neutral-12)',
    },
    success: {
      1: 'var(--ds-success-1)',   2: 'var(--ds-success-2)',   3: 'var(--ds-success-3)',
      4: 'var(--ds-success-4)',   5: 'var(--ds-success-5)',   6: 'var(--ds-success-6)',
      7: 'var(--ds-success-7)',   8: 'var(--ds-success-8)',   9: 'var(--ds-success-9)',
      10: 'var(--ds-success-10)', 11: 'var(--ds-success-11)', 12: 'var(--ds-success-12)',
      DEFAULT: 'var(--ds-success-10)',
      hover: 'var(--ds-role-success-hover)',
      subtle: 'var(--ds-success-2)',
    },
    warning: {
      1: 'var(--ds-warning-1)',   2: 'var(--ds-warning-2)',   3: 'var(--ds-warning-3)',
      4: 'var(--ds-warning-4)',   5: 'var(--ds-warning-5)',   6: 'var(--ds-warning-6)',
      7: 'var(--ds-warning-7)',   8: 'var(--ds-warning-8)',   9: 'var(--ds-warning-9)',
      10: 'var(--ds-warning-10)', 11: 'var(--ds-warning-11)', 12: 'var(--ds-warning-12)',
      DEFAULT: 'var(--ds-warning-10)',
      hover: 'var(--ds-role-warning-hover)',
      subtle: 'var(--ds-warning-2)',
    },
    danger: {
      1: 'var(--ds-danger-1)',    2: 'var(--ds-danger-2)',    3: 'var(--ds-danger-3)',
      4: 'var(--ds-danger-4)',    5: 'var(--ds-danger-5)',    6: 'var(--ds-danger-6)',
      7: 'var(--ds-danger-7)',    8: 'var(--ds-danger-8)',    9: 'var(--ds-danger-9)',
      10: 'var(--ds-danger-10)',  11: 'var(--ds-danger-11)',  12: 'var(--ds-danger-12)',
      DEFAULT: 'var(--ds-danger-10)',
      hover: 'var(--ds-role-danger-hover)',
      subtle: 'var(--ds-danger-2)',
    },
    info: {
      1: 'var(--ds-info-1)',      2: 'var(--ds-info-2)',      3: 'var(--ds-info-3)',
      4: 'var(--ds-info-4)',      5: 'var(--ds-info-5)',      6: 'var(--ds-info-6)',
      7: 'var(--ds-info-7)',      8: 'var(--ds-info-8)',      9: 'var(--ds-info-9)',
      10: 'var(--ds-info-10)',    11: 'var(--ds-info-11)',    12: 'var(--ds-info-12)',
      DEFAULT: 'var(--ds-info-10)',
      hover: 'var(--ds-role-info-hover)',
      subtle: 'var(--ds-info-2)',
    },

    // Semantic aliases (keep for backwards compat)
    surface: {
      base: 'var(--ds-role-bg)',
      raised: 'var(--ds-role-surface)',
      sunken: 'var(--ds-neutral-3)',
      overlay: 'var(--ds-role-bg)',
    },
    text: {
      DEFAULT: 'var(--ds-role-text)',
      subtle: 'var(--ds-neutral-10)',
      muted: 'var(--ds-neutral-8)',
      inverse: 'white',
    },
    border: {
      subtle: 'var(--ds-neutral-5)',
      medium: 'var(--ds-role-border)',
      strong: 'var(--ds-neutral-8)',
    },
  },
  
  spacing: {
    0: 'var(--ds-space-0)',
    1: 'var(--ds-space-1)',
    2: 'var(--ds-space-2)',
    3: 'var(--ds-space-3)',
    4: 'var(--ds-space-4)',
    5: 'var(--ds-space-5)',
    6: 'var(--ds-space-6)',
    8: 'var(--ds-space-8)',
    10: 'var(--ds-space-10)',
    12: 'var(--ds-space-12)',
    16: 'var(--ds-space-16)',
    20: 'var(--ds-space-20)',
    24: 'var(--ds-space-24)',
  },
  
  borderRadius: {
    sm: 'var(--ds-radius-sm)',
    DEFAULT: 'var(--ds-radius-md)',
    md: 'var(--ds-radius-md)',
    lg: 'var(--ds-radius-lg)',
    xl: 'var(--ds-radius-xl)',
    full: 'var(--ds-radius-full)',
  },
  
  boxShadow: {
    none: 'var(--ds-shadow-none)',
    'overlay-sm': 'var(--ds-shadow-overlay-sm)',
    'overlay-md': 'var(--ds-shadow-overlay-md)',
    'overlay-lg': 'var(--ds-shadow-overlay-lg)',
    'overlay-xl': 'var(--ds-shadow-overlay-xl)',
  },
  
  zIndex: {
    base: 'var(--ds-z-base)',
    dropdown: 'var(--ds-z-dropdown)',
    sticky: 'var(--ds-z-sticky)',
    panel: 'var(--ds-z-panel)',
    overlay: 'var(--ds-z-overlay)',
    modal: 'var(--ds-z-modal)',
    popover: 'var(--ds-z-popover)',
    toast: 'var(--ds-z-toast)',
    tooltip: 'var(--ds-z-tooltip)',
  },
  
  fontSize: {
    xs: ['var(--ds-text-xs)', { lineHeight: 'var(--ds-leading-tight)' }],
    sm: ['var(--ds-text-sm)', { lineHeight: 'var(--ds-leading-normal)' }],
    base: ['var(--ds-text-base)', { lineHeight: 'var(--ds-leading-normal)' }],
    lg: ['var(--ds-text-lg)', { lineHeight: 'var(--ds-leading-normal)' }],
    xl: ['var(--ds-text-xl)', { lineHeight: 'var(--ds-leading-tight)' }],
    '2xl': ['var(--ds-text-2xl)', { lineHeight: 'var(--ds-leading-tight)' }],
    '3xl': ['var(--ds-text-3xl)', { lineHeight: 'var(--ds-leading-tight)' }],
    '4xl': ['var(--ds-text-4xl)', { lineHeight: 'var(--ds-leading-tight)' }],
  },
  
  fontFamily: {
    sans: 'var(--ds-font-sans)',
    mono: 'var(--ds-font-mono)',
  },
  
  fontWeight: {
    normal: 'var(--ds-weight-normal)',
    medium: 'var(--ds-weight-medium)',
    semibold: 'var(--ds-weight-semibold)',
    bold: 'var(--ds-weight-bold)',
  },
  
  transitionDuration: {
    fast: 'var(--ds-transition-fast)',
    DEFAULT: 'var(--ds-transition-base)',
    slow: 'var(--ds-transition-slow)',
  },
} as const;

/**
 * Tailwind config extension
 * 
 * Usage in tailwind.config.js:
 * ```js
 * import { tokensTheme } from '@intstudio/tokens/tailwind-theme';
 * 
 * export default {
 *   theme: {
 *     extend: tokensTheme
 *   }
 * }
 * ```
 */
export default tokensTheme;
