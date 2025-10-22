/**
 * Color Tokens - Semantic, Neutral, Interactive
 * 
 * ALL color values live here.
 * Organized by purpose, not arbitrary names.
 */

export const COLOR_TOKENS = {
  // Semantic colors (state/feedback)
  semantic: {
    success: 'rgb(22, 163, 74)',     // green-600
    successBg: 'rgb(220, 252, 231)',  // green-100
    successBorder: 'rgb(134, 239, 172)', // green-300
    
    warning: 'rgb(234, 179, 8)',      // yellow-600
    warningBg: 'rgb(254, 249, 195)',  // yellow-100
    warningBorder: 'rgb(253, 224, 71)', // yellow-300
    
    error: 'rgb(220, 38, 38)',        // red-600
    errorBg: 'rgb(254, 242, 242)',    // red-100
    errorBorder: 'rgb(252, 165, 165)', // red-300
    
    info: 'rgb(37, 99, 235)',         // blue-600
    infoBg: 'rgb(219, 234, 254)',     // blue-100
    infoBorder: 'rgb(147, 197, 253)',  // blue-300
  },
  
  // Neutral colors (text, borders, backgrounds)
  neutral: {
    text: 'rgb(17, 24, 39)',          // gray-900 - primary text
    textMuted: 'rgb(107, 114, 128)',  // gray-500 - secondary text
    textDisabled: 'rgb(156, 163, 175)', // gray-400 - disabled text
    textPlaceholder: 'rgb(156, 163, 175)', // gray-400 - placeholder
    
    border: 'rgb(209, 213, 219)',     // gray-300 - default border
    borderHover: 'rgb(156, 163, 175)', // gray-400 - hover border
    borderFocus: 'rgb(59, 130, 246)',  // blue-500 - focus border
    
    bg: 'rgb(255, 255, 255)',         // white - default background
    bgHover: 'rgb(249, 250, 251)',    // gray-50 - hover background
    bgDisabled: 'rgb(249, 250, 251)', // gray-50 - disabled background
    bgSubtle: 'rgb(243, 244, 246)',   // gray-100 - subtle background
  },
  
  // Interactive colors (buttons, links, actions)
  interactive: {
    // Primary (main CTA)
    primary: 'rgb(37, 99, 235)',      // blue-600
    primaryHover: 'rgb(29, 78, 216)', // blue-700
    primaryActive: 'rgb(30, 64, 175)', // blue-800
    primaryBg: 'rgb(219, 234, 254)',  // blue-100
    
    // Secondary (outlined/subtle)
    secondary: 'rgb(75, 85, 99)',     // gray-600
    secondaryHover: 'rgb(55, 65, 81)', // gray-700
    secondaryActive: 'rgb(31, 41, 55)', // gray-800
    secondaryBg: 'rgb(249, 250, 251)', // gray-50
    
    // Danger (destructive actions)
    danger: 'rgb(220, 38, 38)',       // red-600
    dangerHover: 'rgb(185, 28, 28)',  // red-700
    dangerActive: 'rgb(153, 27, 28)', // red-800
    dangerBg: 'rgb(254, 242, 242)',   // red-100
    
    // Success (confirmations)
    success: 'rgb(22, 163, 74)',      // green-600
    successHover: 'rgb(21, 128, 61)', // green-700
    successActive: 'rgb(22, 101, 52)', // green-800
    successBg: 'rgb(220, 252, 231)',  // green-100
    
    // Warning (caution)
    warning: 'rgb(234, 179, 8)',      // yellow-600
    warningHover: 'rgb(202, 138, 4)', // yellow-700
    warningActive: 'rgb(161, 98, 7)', // yellow-800
    warningBg: 'rgb(254, 249, 195)',  // yellow-100
    
    // Link (text-only)
    link: 'rgb(37, 99, 235)',         // blue-600
    linkHover: 'rgb(29, 78, 216)',    // blue-700
    linkActive: 'rgb(30, 64, 175)',   // blue-800
    
    // Focus
    focus: 'rgb(59, 130, 246)',       // blue-500 - focus ring
    focusRing: 'rgba(59, 130, 246, 0.1)', // blue-500 with alpha - focus ring bg
  },
  
  // Special colors
  special: {
    overlay: 'rgba(0, 0, 0, 0.5)',    // Modal backdrop
    shadow: 'rgba(0, 0, 0, 0.1)',     // Shadow color
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
  },
} as const;

export type SemanticColorKey = keyof typeof COLOR_TOKENS.semantic;
export type NeutralColorKey = keyof typeof COLOR_TOKENS.neutral;
export type InteractiveColorKey = keyof typeof COLOR_TOKENS.interactive;

export const getSemanticColor = (key: SemanticColorKey): string => COLOR_TOKENS.semantic[key];
export const getNeutralColor = (key: NeutralColorKey): string => COLOR_TOKENS.neutral[key];
export const getInteractiveColor = (key: InteractiveColorKey): string => COLOR_TOKENS.interactive[key];
