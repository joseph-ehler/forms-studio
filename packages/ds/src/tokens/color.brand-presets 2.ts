/**
 * Brand Presets
 * 
 * Maps brand identities to Tailwind palette selections.
 * Each brand can choose a neutral hue + brand hue.
 * 
 * Philosophy: Brands are just palette swaps, components never know
 */

export type TailwindHue =
  | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime'
  | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky'
  | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia'
  | 'pink' | 'rose';

export interface BrandPalette {
  neutralHue: TailwindHue;
  brandHue: TailwindHue;
  name: string;
  description?: string;
}

/**
 * Curated brand presets (golden set for full contract testing)
 */
export const BRAND_PRESETS = {
  /**
   * Default - Classic blue
   */
  default: {
    neutralHue: 'neutral',
    brandHue: 'blue',
    name: 'Default',
    description: 'Classic blue with neutral grays',
  },
  
  /**
   * ACME - Vibrant violet
   */
  acme: {
    neutralHue: 'zinc',
    brandHue: 'violet',
    name: 'ACME',
    description: 'Bold violet with zinc grays',
  },
  
  /**
   * TechCorp - Professional emerald
   */
  techcorp: {
    neutralHue: 'slate',
    brandHue: 'emerald',
    name: 'TechCorp',
    description: 'Clean emerald with slate grays',
  },
  
  /**
   * Sunset - Warm rose
   */
  sunset: {
    neutralHue: 'stone',
    brandHue: 'rose',
    name: 'Sunset',
    description: 'Warm rose with stone grays',
  },
} as const;

export type BrandKey = keyof typeof BRAND_PRESETS;

/**
 * Get brand palette configuration
 */
export function getBrandPalette(brand: BrandKey): BrandPalette {
  return BRAND_PRESETS[brand];
}

/**
 * All available brands
 */
export const AVAILABLE_BRANDS: BrandKey[] = Object.keys(BRAND_PRESETS) as BrandKey[];
