/**
 * Glassmorphism Tokens - Modern Glass Effect
 * 
 * Creates frosted glass aesthetic with:
 * - Backdrop blur
 * - Semi-transparent backgrounds
 * - Subtle borders
 * - Soft shadows
 */

export const GLASS_TOKENS = {
  // Blur amounts
  blur: {
    none: '0px',
    xs: '4px',      // Subtle frosting
    sm: '8px',      // Light glass
    md: '12px',     // Standard glass
    lg: '16px',     // Heavy frosting
    xl: '24px',     // Ultra blur
  },
  
  // Background opacity (for glass effect)
  // Use with background-color: rgba(255, 255, 255, OPACITY)
  opacity: {
    light: 0.7,     // Mostly transparent
    medium: 0.8,    // Balanced
    heavy: 0.9,     // Mostly opaque
    solid: 1.0,     // No transparency
  },
  
  // Border styles for glass
  border: {
    light: '1px solid rgba(255, 255, 255, 0.18)',   // Subtle edge
    medium: '1px solid rgba(255, 255, 255, 0.25)',  // Defined edge
    heavy: '1px solid rgba(255, 255, 255, 0.4)',    // Strong edge
  },
  
  // Complete glass presets
  presets: {
    // Subtle glass (light blur, high transparency)
    subtle: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(8px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    
    // Standard glass (medium blur, medium transparency)
    standard: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
    },
    
    // Heavy glass (strong blur, low transparency)
    heavy: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
    },
    
    // Dark glass
    dark: {
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
} as const;

export type BlurKey = keyof typeof GLASS_TOKENS.blur;
export type OpacityKey = keyof typeof GLASS_TOKENS.opacity;
export type GlassPresetKey = keyof typeof GLASS_TOKENS.presets;

export const getBlur = (size: BlurKey): string => GLASS_TOKENS.blur[size];
export const getGlassOpacity = (level: OpacityKey): number => GLASS_TOKENS.opacity[level];
export const getGlassPreset = (preset: GlassPresetKey) => GLASS_TOKENS.presets[preset];
