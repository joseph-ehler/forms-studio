/**
 * Accessibility Profiles - Preset Configurations
 * 
 * Named presets for common accessibility needs.
 * Users can mix-and-match or apply entire profiles.
 */

export type TouchTarget = 'min' | 'comfortable' | 'relaxed' | 'large'
export type A11yFont = 'default' | 'dyslexia' | 'hyperlegible'

export interface A11yProfile {
  /** Font family preset */
  font?: A11yFont
  
  /** Font size scale (1.0 = base, up to 1.5) */
  sizeScale?: number
  
  /** Line height multiplier (1.0..1.5) */
  lineHeight?: number
  
  /** Letter spacing in em (0..0.05) */
  letterSpacingEm?: number
  
  /** Word spacing in em (0..0.1) */
  wordSpacingEm?: number
  
  /** Reading measure in ch (55..85) */
  measureCh?: number
  
  /** Disable animations */
  reducedMotion?: boolean
  
  /** Focus ring width in px */
  focusRingPx?: number
  
  /** Minimum touch target size */
  touchTarget?: TouchTarget
  
  /** Density multiplier (0.9..1.2) */
  density?: number
  
  /** Force underline on all links */
  underlineLinks?: boolean
  
  /** High contrast mode */
  highContrast?: boolean
  
  /** Colorblind-safe colors */
  colorblindSafe?: boolean
  
  /** Reading ruler (highlight current line) */
  readingRuler?: boolean
  
  /** Paragraph focus (dim unfocused) */
  paragraphFocus?: boolean
  
  /** Text alignment (force left for dyslexia) */
  textAlign?: 'left' | 'justify'
  
  /** Hyphenation (off for dyslexia) */
  hyphenation?: 'auto' | 'none'
}

/**
 * Preset Accessibility Profiles
 * 
 * One-click configurations for common needs.
 */
export const A11Y_PRESETS: Record<string, A11yProfile> = {
  /**
   * Default - System defaults
   */
  default: {
    sizeScale: 1,
    lineHeight: 1,
    measureCh: 65,
  },
  
  /**
   * Readable - Enhanced readability
   * Good for extended reading sessions
   */
  readable: {
    sizeScale: 1.1,
    lineHeight: 1.3,
    measureCh: 65,
    letterSpacingEm: 0.01,
  },
  
  /**
   * Dyslexia - Optimized for dyslexic readers
   * OpenDyslexic font + enhanced spacing + forced left-align
   */
  dyslexia: {
    font: 'dyslexia',
    sizeScale: 1.15,
    lineHeight: 1.35,
    letterSpacingEm: 0.02,
    wordSpacingEm: 0.03,
    measureCh: 70,
    underlineLinks: true,
    textAlign: 'left',
    hyphenation: 'none',
  },
  
  /**
   * Hyperlegible - Atkinson Hyperlegible font
   * Designed for low vision readers
   */
  hyperlegible: {
    font: 'hyperlegible',
    sizeScale: 1.1,
    lineHeight: 1.3,
    measureCh: 65,
  },
  
  /**
   * Low Vision - Large text + high contrast
   * For users with visual impairments
   */
  lowVision: {
    sizeScale: 1.5,
    lineHeight: 1.4,
    measureCh: 55,
    underlineLinks: true,
    touchTarget: 'relaxed',
    focusRingPx: 4,        // Thicker focus ring (3→4px)
    highContrast: true,
    density: 1.3,          // More spacing (1.2→1.3)
  },
  
  /**
   * Motion Safe - Animations disabled
   * For users sensitive to motion
   */
  motionSafe: {
    reducedMotion: true,
  },
  
  /**
   * Colorblind Safe - Deuteranopia-safe colors
   * Red/green colorblind friendly
   */
  colorblindSafe: {
    colorblindSafe: true,
    underlineLinks: true,
  },
  
  /**
   * Focus Mode - Reading aids enabled
   * Paragraph focus + reading ruler
   */
  focusMode: {
    readingRuler: true,
    paragraphFocus: true,
    sizeScale: 1.1,
    lineHeight: 1.4,
  },
  
  /**
   * Compact - Dense layout
   * For users who prefer more content on screen
   */
  compact: {
    density: 0.9,
    lineHeight: 1.2,
  },
  
  /**
   * Spacious - Generous spacing
   * For users who need breathing room
   */
  spacious: {
    density: 1.2,
    lineHeight: 1.4,
    sizeScale: 1.1,
  },
}

/**
 * Get a preset by name
 */
export function getA11yPreset(name: string): A11yProfile {
  return A11Y_PRESETS[name] || A11Y_PRESETS.default
}

/**
 * Merge multiple profiles
 */
export function mergeA11yProfiles(...profiles: A11yProfile[]): A11yProfile {
  return profiles.reduce((acc, profile) => ({ ...acc, ...profile }), {})
}
