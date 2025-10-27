/**
 * Feasible Interval Guard
 * Ensures WCAG compliance by finding the intersection of UI and text constraints
 */

// Using inline OKLCH type to match palette-generator.ts
export type OklchColor = { l: number; c: number; h: number };

export const INTERVAL_WIDTH_THRESHOLD = 0.02; // τ in Y space
export const HEADROOM = 0.01;
export const EPS = 1e-3;

export interface FeasibleInterval {
  yMin: number;
  yMax: number;
  width: number;
  isNarrow: boolean;  // width < τ
  isTiny: boolean;    // width < τ/2
  wasAdjusted: boolean;
}

/**
 * Calculate UI constraint bounds (WCAG 1.4.11)
 * Bg must have ≥3:1 contrast vs surface
 */
export function uiBoundsForSurface(
  theme: 'light' | 'dark',
  surfaceY: number,
  minContrast = 3.0
): { yMin: number; yMax: number } {
  
  if (theme === 'light') {
    // Subtle must be DARKER than surface
    // CR = (L1 + 0.05) / (L2 + 0.05) ≥ 3.0
    // L1 = surface, L2 = bg
    const yMax = ((surfaceY + 0.05) / minContrast) - 0.05;
    return { yMin: 0, yMax: Math.max(0, yMax) };
  } else {
    // Subtle must be BRIGHTER than surface
    // CR = (L1 + 0.05) / (L2 + 0.05) ≥ 3.0
    // L1 = bg, L2 = surface
    const yMin = (minContrast * (surfaceY + 0.05)) - 0.05;
    return { yMin: Math.max(0, yMin), yMax: 1 };
  }
}

/**
 * Calculate text constraint bounds (WCAG 1.4.3)
 * Bg must have ≥4.5:1 (AA) or ≥7.0:1 (AAA) with text
 */
export function textBoundsForFg(
  fg: 'black' | 'white',
  minContrast = 4.5
): { yMin: number; yMax: number } {
  
  const fgY = fg === 'black' ? 0 : 1;
  
  if (fg === 'black') {
    // Bg must be BRIGHT enough for black text
    // CR = (Ybg + 0.05) / (0 + 0.05) ≥ 4.5
    const yMin = (minContrast * 0.05) - 0.05;
    return { yMin: Math.max(0, yMin), yMax: 1 };
  } else {
    // Bg must be DARK enough for white text
    // CR = (1 + 0.05) / (Ybg + 0.05) ≥ 4.5
    const yMax = (1.05 / minContrast) - 0.05;
    return { yMin: 0, yMax: Math.max(0, yMax) };
  }
}

/**
 * Calculate feasible interval (intersection of UI and text constraints)
 */
export function calculateFeasibleInterval(
  theme: 'light' | 'dark',
  surfaceY: number,
  targetContrast: { ui: number; text: number },
  fg: 'black' | 'white'
): FeasibleInterval {
  
  const uiBounds = uiBoundsForSurface(theme, surfaceY, targetContrast.ui);
  const textBounds = textBoundsForFg(fg, targetContrast.text);
  
  // Intersection
  const yMin = Math.max(uiBounds.yMin, textBounds.yMin);
  const yMax = Math.min(uiBounds.yMax, textBounds.yMax);
  const width = Math.max(0, yMax - yMin);
  
  return {
    yMin,
    yMax,
    width,
    isNarrow: width < INTERVAL_WIDTH_THRESHOLD,
    isTiny: width < INTERVAL_WIDTH_THRESHOLD / 2,
    wasAdjusted: false,
  };
}

/**
 * Handle narrow intervals by neutralizing to tinted neutral
 * Keeps hue for "scent" but compresses chroma heavily
 */
export function handleNarrowInterval(
  interval: FeasibleInterval,
  seedOklch: OklchColor,
  theme: 'light' | 'dark'
): { oklch: OklchColor; interval: FeasibleInterval } {
  
  if (!interval.isNarrow) {
    return { oklch: seedOklch, interval };
  }
  
  // Strategy: Keep hue, compress chroma to ≤0.10, center in interval
  const neutralizedC = Math.min(seedOklch.c, 0.10);
  const centerY = (interval.yMin + interval.yMax) / 2;
  
  // Estimate L from center Y (will refine with binary search)
  // Simplified: assume linear relationship for neutralized colors
  const estimatedL = Math.sqrt(centerY);
  
  return {
    oklch: {
      l: estimatedL,
      c: neutralizedC,
      h: seedOklch.h, // Preserve hue for "scent"
    },
    interval: {
      ...interval,
      wasAdjusted: true,
    },
  };
}
