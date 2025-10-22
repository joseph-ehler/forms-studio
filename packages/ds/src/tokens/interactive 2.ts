/**
 * Interactive Element Tokens - Accessibility + UX
 * 
 * Touch targets, icon sizes, interactive element dimensions.
 * Ensures WCAG 2.1 compliance (44x44px minimum touch target).
 */

export const INTERACTIVE_TOKENS = {
  // Minimum heights for touch targets
  minHeight: {
    mobile: '48px',    // iOS safe: 44px + 4px breathing room
    desktop: '40px',   // Desktop can be slightly smaller
    compact: '36px',   // Compact mode (use sparingly)
  },
  
  // Minimum widths for touch targets
  minWidth: {
    touch: '44px',     // WCAG 2.1 AA minimum
    button: '88px',    // Comfortable button minimum
  },
  
  // Icon sizes
  iconSize: {
    xs: '12px',   // Tiny indicators
    sm: '16px',   // Small icons in inputs
    md: '20px',   // Default icon size
    lg: '24px',   // Large icons
    xl: '32px',   // Hero icons
  },
  
  // Focus ring
  focusRing: {
    width: '2px',
    offset: '2px',
    color: 'rgb(59, 130, 246)', // blue-500
  },
  
  // Border widths
  border: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
} as const;

export type MinHeightKey = keyof typeof INTERACTIVE_TOKENS.minHeight;
export type IconSizeKey = keyof typeof INTERACTIVE_TOKENS.iconSize;

export const getMinHeight = (size: MinHeightKey): string => INTERACTIVE_TOKENS.minHeight[size];
export const getIconSize = (size: IconSizeKey): string => INTERACTIVE_TOKENS.iconSize[size];
