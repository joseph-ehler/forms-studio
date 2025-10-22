/**
 * Typography Tokens - Single Source of Truth
 * 
 * ALL typography constants live here.
 * Consumers use type-safe helpers, never raw values.
 */

export const TYPO_TOKENS = {
  font: {
    body: '"Inter", system-ui, -apple-system, sans-serif',
    mono: '"SF Mono", "Fira Code", "Consolas", monospace',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
  line: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  ramps: {
    label: {
      sm: { size: 14, weight: 600 } as const,
      md: { size: 16, weight: 600 } as const,
    },
    helper: {
      sm: { size: 14, weight: 400 } as const,
      md: { size: 16, weight: 400 } as const,
    },
    caption: {
      xs: { size: 12, weight: 400 } as const,
    },
  },
} as const;

// Type-safe accessors
export type LabelSize = keyof typeof TYPO_TOKENS.size;
export type LabelWeight = keyof typeof TYPO_TOKENS.weight;
export type FontFamily = keyof typeof TYPO_TOKENS.font;

export const getTypoSize = (size: LabelSize): number => TYPO_TOKENS.size[size];
export const getTypoWeight = (weight: LabelWeight): number => TYPO_TOKENS.weight[weight];
export const getTypoFont = (family: FontFamily): string => TYPO_TOKENS.font[family];

// Type-safe ramp accessors
export const getLabelRamp = (size: 'sm' | 'md') => TYPO_TOKENS.ramps.label[size];
export const getHelperRamp = (size: 'sm' | 'md') => TYPO_TOKENS.ramps.helper[size];
