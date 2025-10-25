/**
 * @intstudio/tokens
 * 
 * Design tokens package - CSS variables and Tailwind theme
 */

// Re-export Tailwind theme for convenience
export { default as tailwindTheme } from './tailwind-theme';

// Type-safe token access helpers
export * from './typed';

// Token constants (for JS consumption)
export const tokens = {
  space: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  touchTarget: '44px',
  focusRing: '2px',
  zIndex: {
    base: 0,
    dropdown: 50,
    sticky: 60,
    panel: 70,
    overlay: 80,
    modal: 90,
    popover: 95,
    toast: 100,
    tooltip: 110,
  },
} as const;

export type TokenSpace = keyof typeof tokens.space;
export type TokenZIndex = keyof typeof tokens.zIndex;
