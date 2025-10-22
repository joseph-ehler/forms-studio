/**
 * Dark Theme Token Overrides
 * 
 * Same structure as light theme COLOR_TOKENS,
 * but with inverted values for dark backgrounds.
 * 
 * Usage:
 * <html data-theme="dark">
 *   // CSS vars automatically swap
 * </html>
 */

export const DARK_COLOR_TOKENS = {
  // Semantic colors (adjusted for dark backgrounds)
  semantic: {
    success: 'rgb(74, 222, 128)',      // green-400 (lighter for dark)
    successBg: 'rgb(20, 83, 45)',       // green-900
    successBorder: 'rgb(34, 197, 94)',  // green-500
    
    warning: 'rgb(250, 204, 21)',       // yellow-400
    warningBg: 'rgb(113, 63, 18)',      // yellow-900
    warningBorder: 'rgb(234, 179, 8)',  // yellow-600
    
    error: 'rgb(248, 113, 113)',        // red-400
    errorBg: 'rgb(127, 29, 29)',        // red-900
    errorBorder: 'rgb(239, 68, 68)',    // red-500
    
    info: 'rgb(96, 165, 250)',          // blue-400
    infoBg: 'rgb(30, 58, 138)',         // blue-900
    infoBorder: 'rgb(59, 130, 246)',    // blue-500
  },
  
  // Neutral colors (inverted for dark)
  neutral: {
    text: 'rgb(243, 244, 246)',         // gray-100 - primary text
    textMuted: 'rgb(156, 163, 175)',    // gray-400 - secondary text
    textDisabled: 'rgb(107, 114, 128)', // gray-500 - disabled text
    textPlaceholder: 'rgb(107, 114, 128)', // gray-500 - placeholder
    
    border: 'rgb(75, 85, 99)',          // gray-600 - default border
    borderHover: 'rgb(107, 114, 128)',  // gray-500 - hover border
    borderFocus: 'rgb(96, 165, 250)',   // blue-400 - focus border
    
    bg: 'rgb(31, 41, 55)',              // gray-800 - default background
    bgHover: 'rgb(55, 65, 81)',         // gray-700 - hover background
    bgDisabled: 'rgb(55, 65, 81)',      // gray-700 - disabled background
    bgSubtle: 'rgb(75, 85, 99)',        // gray-600 - subtle background
  },
  
  // Interactive colors (adjusted for visibility on dark)
  interactive: {
    // Primary (main CTA)
    primary: 'rgb(59, 130, 246)',       // blue-500
    primaryHover: 'rgb(96, 165, 250)',  // blue-400
    primaryActive: 'rgb(37, 99, 235)',  // blue-600
    primaryBg: 'rgb(30, 58, 138)',      // blue-900
    
    // Secondary (outlined/subtle)
    secondary: 'rgb(156, 163, 175)',    // gray-400
    secondaryHover: 'rgb(209, 213, 219)', // gray-300
    secondaryActive: 'rgb(243, 244, 246)', // gray-100
    secondaryBg: 'rgb(55, 65, 81)',     // gray-700
    
    // Danger (destructive actions)
    danger: 'rgb(239, 68, 68)',         // red-500
    dangerHover: 'rgb(248, 113, 113)',  // red-400
    dangerActive: 'rgb(220, 38, 38)',   // red-600
    dangerBg: 'rgb(127, 29, 29)',       // red-900
    
    // Success (confirmations)
    success: 'rgb(34, 197, 94)',        // green-500
    successHover: 'rgb(74, 222, 128)',  // green-400
    successActive: 'rgb(22, 163, 74)',  // green-600
    successBg: 'rgb(20, 83, 45)',       // green-900
    
    // Warning (caution)
    warning: 'rgb(234, 179, 8)',        // yellow-600
    warningHover: 'rgb(250, 204, 21)',  // yellow-400
    warningActive: 'rgb(202, 138, 4)',  // yellow-700
    warningBg: 'rgb(113, 63, 18)',      // yellow-900
    
    // Link (text-only)
    link: 'rgb(96, 165, 250)',          // blue-400
    linkHover: 'rgb(147, 197, 253)',    // blue-300
    linkActive: 'rgb(59, 130, 246)',    // blue-500
    
    // Focus
    focus: 'rgb(96, 165, 250)',         // blue-400
    focusRing: 'rgba(96, 165, 250, 0.2)', // blue-400 with alpha (more visible in dark)
  },
  
  // Special colors
  special: {
    overlay: 'rgba(0, 0, 0, 0.8)',      // Darker overlay for dark mode
    shadow: 'rgba(0, 0, 0, 0.4)',       // Stronger shadows for dark mode
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
  },
} as const;

/**
 * Dark Theme Shadow Overrides
 * Shadows need to be stronger in dark mode for visibility
 */
export const DARK_SHADOW_TOKENS = {
  hover: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 4px 8px -2px rgba(0, 0, 0, 0.2)',
    medium: '0 2px 4px 0 rgba(0, 0, 0, 0.4), 0 8px 16px -4px rgba(0, 0, 0, 0.3)',
    strong: '0 4px 6px 0 rgba(0, 0, 0, 0.5), 0 12px 24px -6px rgba(0, 0, 0, 0.4)',
  },
  active: {
    subtle: '0 1px 1px 0 rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
    medium: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 4px 8px -2px rgba(0, 0, 0, 0.2)',
  },
  focus: '0 0 0 3px rgba(96, 165, 250, 0.25)',  // Stronger focus ring
  focusError: '0 0 0 3px rgba(248, 113, 113, 0.25)',
} as const;

/**
 * Dark Theme Glassmorphism
 * Glass effect works differently on dark backgrounds
 */
export const DARK_GLASS_TOKENS = {
  presets: {
    subtle: {
      background: 'rgba(31, 41, 55, 0.7)',  // gray-800
      backdropFilter: 'blur(8px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    standard: {
      background: 'rgba(31, 41, 55, 0.8)',
      backdropFilter: 'blur(12px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    heavy: {
      background: 'rgba(31, 41, 55, 0.9)',
      backdropFilter: 'blur(16px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    dark: {
      background: 'rgba(17, 24, 39, 0.8)',  // gray-900
      backdropFilter: 'blur(12px) saturate(150%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
} as const;

export type DarkColorKey = keyof typeof DARK_COLOR_TOKENS.neutral;
export type DarkSemanticKey = keyof typeof DARK_COLOR_TOKENS.semantic;
export type DarkInteractiveKey = keyof typeof DARK_COLOR_TOKENS.interactive;
