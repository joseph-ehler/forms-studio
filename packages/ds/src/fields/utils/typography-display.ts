/**
 * Typography Display Utilities
 * 
 * Handles resolution of typography visibility based on:
 * 1. Explicit typographyDisplay config
 * 2. Typography variant presets
 * 3. Sensible defaults
 * 
 * This ensures foolproof behavior where everything shows by default.
 */

import type { TypographyDisplay, TypographyVariant } from '../types'

/**
 * Variant Presets
 * 
 * Pre-configured display patterns for common use cases.
 */
const TYPOGRAPHY_VARIANTS: Record<TypographyVariant, TypographyDisplay> = {
  // Default: Show everything (safest)
  default: {
    showLabel: true,
    showDescription: true,
    showError: true,
    showRequired: true,
    showOptional: false,
  },
  
  // Minimal: Just label and errors
  minimal: {
    showLabel: true,
    showDescription: false,
    showError: true,
    showRequired: false,
    showOptional: false,
  },
  
  // Compact: Label only
  compact: {
    showLabel: true,
    showDescription: false,
    showError: false,
    showRequired: false,
    showOptional: false,
  },
  
  // Hidden: No typography (input only)
  hidden: {
    showLabel: false,
    showDescription: false,
    showError: false,
    showRequired: false,
    showOptional: false,
  },
  
  // Error Only: Show errors only
  'error-only': {
    showLabel: false,
    showDescription: false,
    showError: true,
    showRequired: false,
    showOptional: false,
  },
}

/**
 * Resolve Typography Display Settings
 * 
 * Priority:
 * 1. Explicit typographyDisplay props (highest priority)
 * 2. Typography variant preset
 * 3. Defaults (show everything)
 * 
 * @param display - Explicit display config
 * @param variant - Variant preset
 * @returns Resolved display settings
 */
export function resolveTypographyDisplay(
  display?: TypographyDisplay,
  variant?: TypographyVariant
): Required<TypographyDisplay> {
  // Start with defaults (everything visible)
  const defaults: Required<TypographyDisplay> = {
    showLabel: true,
    showDescription: true,
    showError: true,
    showRequired: true,
    showOptional: false,
  }
  
  // Apply variant preset if provided
  const variantSettings = variant ? TYPOGRAPHY_VARIANTS[variant] : {}
  
  // Merge: defaults <- variant <- explicit display
  return {
    ...defaults,
    ...variantSettings,
    ...display,
  }
}

/**
 * Check if typography element should be shown
 * 
 * @param key - Typography element key
 * @param display - Display config
 * @param variant - Variant preset
 * @returns True if element should be shown
 */
export function shouldShow(
  key: keyof TypographyDisplay,
  display?: TypographyDisplay,
  variant?: TypographyVariant
): boolean {
  const resolved = resolveTypographyDisplay(display, variant)
  return resolved[key]
}

/**
 * Get Typography Display from JSON
 * 
 * Extracts typography configuration from field JSON.
 * Supports both top-level and nested configs.
 * 
 * @param json - Field JSON configuration
 * @returns Typography display settings
 */
export function getTypographyFromJSON(json: any): {
  display?: TypographyDisplay
  variant?: TypographyVariant
} {
  if (!json) return {}
  
  return {
    display: json.typographyDisplay || json.typography?.display,
    variant: json.typographyVariant || json.typography?.variant,
  }
}
