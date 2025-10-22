/**
 * Multi-Brand Token Example
 * 
 * Shows how to create brand-specific token overrides.
 * 
 * Usage:
 * <html data-brand="acme" data-theme="dark">
 *   // Loads ACME brand dark theme
 * </html>
 * 
 * Philosophy:
 * - Same primitives, different values
 * - Tokens per brand/theme combination
 * - Zero code changes, just CSS var swap
 */

import { COLOR_TOKENS } from '../colors';

/**
 * ACME Brand Colors
 * Override primary with brand color
 */
export const ACME_COLOR_TOKENS = {
  ...COLOR_TOKENS,
  
  interactive: {
    ...COLOR_TOKENS.interactive,
    
    // ACME uses orange as primary
    primary: 'rgb(234, 88, 12)',        // orange-600
    primaryHover: 'rgb(194, 65, 12)',   // orange-700
    primaryActive: 'rgb(154, 52, 18)',  // orange-800
    primaryBg: 'rgb(255, 237, 213)',    // orange-100
    
    // Keep rest of colors
    // secondary, danger, success, warning unchanged
  },
} as const;

/**
 * TechCorp Brand Colors
 * Override primary with brand color
 */
export const TECHCORP_COLOR_TOKENS = {
  ...COLOR_TOKENS,
  
  interactive: {
    ...COLOR_TOKENS.interactive,
    
    // TechCorp uses purple as primary
    primary: 'rgb(147, 51, 234)',       // purple-600
    primaryHover: 'rgb(126, 34, 206)',  // purple-700
    primaryActive: 'rgb(107, 33, 168)', // purple-800
    primaryBg: 'rgb(243, 232, 255)',    // purple-100
  },
} as const;

/**
 * Generate CSS variables for a brand
 */
export function generateBrandCSS(brandTokens: typeof COLOR_TOKENS): string {
  return `
    --color-primary: ${brandTokens.interactive.primary};
    --color-primary-hover: ${brandTokens.interactive.primaryHover};
    --color-primary-active: ${brandTokens.interactive.primaryActive};
    --color-primary-bg: ${brandTokens.interactive.primaryBg};
    
    --color-secondary: ${brandTokens.interactive.secondary};
    --color-secondary-hover: ${brandTokens.interactive.secondaryHover};
    --color-secondary-active: ${brandTokens.interactive.secondaryActive};
    
    --color-danger: ${brandTokens.interactive.danger};
    --color-success: ${brandTokens.interactive.success};
    --color-warning: ${brandTokens.interactive.warning};
  `;
}

/**
 * Brand configuration
 */
export const BRANDS = {
  default: COLOR_TOKENS,
  acme: ACME_COLOR_TOKENS,
  techcorp: TECHCORP_COLOR_TOKENS,
} as const;

export type BrandKey = keyof typeof BRANDS;

/**
 * Get brand tokens
 */
export function getBrandTokens(brand: BrandKey): typeof COLOR_TOKENS {
  return BRANDS[brand];
}
