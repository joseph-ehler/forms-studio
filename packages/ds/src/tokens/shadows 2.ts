/**
 * Shadow Tokens - Flat + Floating Elevation System
 * 
 * Philosophy:
 * - FLAT by default (no resting shadows)
 * - Shadows ONLY on interaction (hover/active)
 * - Two-layer approach: hard edge + soft depth
 * - Inset + Y-offset for realistic floating effect
 * 
 * Layer 1: Hard edge shadow (tight, defined)
 * Layer 2: Soft depth shadow (spread, blurred, offset)
 */

export const SHADOW_TOKENS = {
  // Flat (default resting state)
  none: 'none',
  
  // Hover states - Floating effect
  // Format: hard edge + soft depth
  hover: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',     // Gentle lift
    medium: '0 2px 4px 0 rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.12)',    // Clear elevation
    strong: '0 4px 6px 0 rgba(0, 0, 0, 0.20), 0 12px 24px -6px rgba(0, 0, 0, 0.16)',   // Prominent float
  },
  
  // Active/pressed states - Closer to surface
  active: {
    subtle: '0 1px 1px 0 rgba(0, 0, 0, 0.10), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',     // Nearly flat
    medium: '0 1px 2px 0 rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',     // Slight depth
  },
  
  // Semantic shadows
  focus: '0 0 0 3px rgba(59, 130, 246, 0.15)',              // Focus ring (increased opacity)
  focusError: '0 0 0 3px rgba(220, 38, 38, 0.15)',          // Error focus ring
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',           // Inset (pressed buttons)
  
  // Legacy (for transition period)
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

export type ShadowKey = keyof typeof SHADOW_TOKENS;
export type HoverShadowKey = keyof typeof SHADOW_TOKENS.hover;
export type ActiveShadowKey = keyof typeof SHADOW_TOKENS.active;

export const getShadow = (size: ShadowKey): string => SHADOW_TOKENS[size] as string;
export const getHoverShadow = (size: HoverShadowKey): string => SHADOW_TOKENS.hover[size];
export const getActiveShadow = (size: ActiveShadowKey): string => SHADOW_TOKENS.active[size];
