/**
 * Border Radius Tokens - Visual Coherence
 * 
 * ALL border-radius values live here.
 * Prevents hardcoded rounded-* utilities and ensures consistency.
 */

export const RADIUS_TOKENS = {
  none: '0px',
  xs: '2px',     // Tiny elements, subtle rounding
  sm: '4px',     // Small buttons, badges
  md: '6px',     // Inputs, cards (default)
  lg: '8px',     // Buttons, prominent cards
  xl: '12px',    // Large modals, hero cards
  '2xl': '16px', // Extra large containers
  full: '9999px', // Pills, avatars, fully rounded
} as const;

export type RadiusKey = keyof typeof RADIUS_TOKENS;

export const getRadius = (size: RadiusKey): string => RADIUS_TOKENS[size];
