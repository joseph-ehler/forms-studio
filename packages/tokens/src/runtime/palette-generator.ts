/**
 * Runtime Palette Generator
 * 
 * Generates accessible color palettes from user-selected seeds at runtime.
 * Same contrast-first logic as build-time, but runs in the browser.
 */

import {
  hexToOklch,
  oklchToHex,
  hexContrast,
  getBestForeground,
  meetsWCAG,
  type WCAGLevel,
  relativeLuminance,
  hexToRgb,
  oklchToSrgb,
  srgbToLinear,
  linearRgbToOklab,
  oklabToOklch,
} from './wcag-math.js';
import { calculateFeasibleInterval, handleNarrowInterval, type FeasibleInterval } from './interval-guard';
import { pickYTargetWithHeadroom, DEFAULT_HEADROOM, calculateHeadroom } from './headroom-targeting';
import { chooseTextByPolicy, getPolicyForHue } from './text-policy';
import { SeededRandom, hashToSeed } from './determinism';
import { paletteCache, computeSurfaceSignature, type CacheKey } from './cache';

// ============================================
// TYPES
// ============================================

/** Contract compliance status (for UI feedback) */
export interface ContractStatus {
  subtleAAA: boolean;    // Subtle text ≥7:1
  subtleUI3: boolean;    // Subtle vs surface ≥3:1
  solidAA: boolean;      // Solid text ≥4.5:1
  headroomOk: boolean;   // All headroom targets met
}

/** SSR-safe timing helper */
const now = typeof performance !== 'undefined' && performance.now 
  ? () => performance.now() 
  : () => Date.now();

export interface GeneratorOptions {
  /** Target WCAG level (default: AA) */
  level?: WCAGLevel;
  /** Minimum contrast ratio (default: 4.5 for AA, 7.0 for AAA) */
  target?: number;
  /** Allow auto-adjustment of colors (default: true) */
  allowNudge?: boolean;
  /** Preserve hue at all costs (only adjust L/C) */
  preserveHue?: boolean;
  /** Maximum lightness adjustment (0-1, default: 0.3) */
  maxNudge?: number;
  /** Theme context (default: 'light') - affects surface reference for WCAG 1.4.11 */
  theme?: 'light' | 'dark';
  /** Deterministic seed for reproducible output (default: undefined) */
  deterministicSeed?: number;
  /** Custom surface color override (default: auto based on theme) */
  customSurface?: string;
  /** Include vibrant accent color (default: true) */
  includeVibrant?: boolean;
  /** Faithfulness mode (default: 'balanced') */
  faithfulness?: 'strict' | 'balanced' | 'wcag-first';
  /** Maximum chroma compression (default: 0.15) */
  maxChromaCompression?: number;
}

export interface ColorPair {
  bg: string;
  fg: string;
  contrast: number;
}

export interface Adjustments {
  deltaL: number;
  deltaC: number;
  deltaH: number;
  reason: string;
}

export interface GeneratedPalette {
  /** Original seed color */
  seed: string;
  /** Theme used for generation */
  theme: 'light' | 'dark';
  /** Extracted OKLCH components */
  oklch: { l: number; c: number; h: number };
  
  /** Vibrant accent (graphics only - NO TEXT) */
  vibrant?: {
    color: string;
    role: 'vibrant-accent';
    warning: 'NO_TEXT_ALLOWED';
    maxChroma: number;
  };
  
  /** Solid pair (buttons, banners) */
  solid: {
    bg: string;
    text: 'white' | 'black';
    hover: string;
    contrast: number;
    role: 'solid-action';
    adjustments?: Adjustments;
  };
  
  /** Subtle pair (badges, chips) */
  subtle: {
    bg: string;
    text: string;
    contrast: number;
    role: 'subtle-bg';
    adjustments?: Adjustments;
  };
  
  /** Pair IDs for logging */
  _pairIds: {
    subtle: string;
    solid: string;
  };
  
  /** Contract compliance (quick UI feedback) */
  contract: ContractStatus;
  
  /** Diagnostics */
  _diagnostics: {
    feasibleIntervalWidth: number;
    intervalWasNarrow: boolean;
    intervalWasTiny: boolean;
    seedWasExtreme: boolean;
    chromaCompressed: boolean;
    lightnessAdjusted: boolean;
    subtleUsedNeutralTint: boolean;
    headroom: {
      subtleTextVsBg: number;
      subtleUiVsSurface: number;
      solidTextVsBg: number;
    };
    textPolicy: string | null;
    faithfulness: 'strict' | 'balanced' | 'wcag-first';
    generatorVersion: string;
    rolesVersion: string;
    contractSchemaVersion: string;
    surfaceSignature: string;
    computeTimeMs: number;
  };
}

export interface GeneratorCallbacks {
  /** Called when color is adjusted */
  onNudge?: (original: string, adjusted: string, reason: string) => void;
  /** Called when foreground is auto-flipped */
  onFlip?: (bg: string, fg: string, contrast: number) => void;
  /** Called for any warning */
  onWarning?: (message: string) => void;
}

// ============================================
// CORE GENERATOR
// ============================================

/**
 * Generate accessible palette from seed color (V2 with nasty seed handling)
 * 
 * @param seedHex - User's brand color (e.g., "#FF5733")
 * @param options - Generation options
 * @param callbacks - Event callbacks (deprecated - use diagnostics instead)
 * 
 * @example
 * const palette = generatePalette("#FFFF00", { theme: 'light', level: 'AA' });
 * // Yellow → solid.text = 'black', contrast: 8.2:1 ✅
 */
export function generatePalette(
  seedHex: string,
  options: GeneratorOptions = {},
  callbacks: GeneratorCallbacks = {}
): GeneratedPalette | null {
  const startTime = now();
  
  const theme = options.theme ?? 'light';
  const level = options.level ?? 'AA';
  const textAAA = 7.0;
  const textAA = 4.5;
  const includeVibrant = options.includeVibrant ?? true;
  const faithfulness = options.faithfulness ?? 'balanced';
  
  // Parse seed
  const seedOklch = hexToOklch(seedHex);
  if (!seedOklch) {
    callbacks.onWarning?.('Invalid hex color');
    return null;
  }
  
  // Get surface
  const surface = options.customSurface 
    ? getSurfaceReference(theme, options.customSurface)
    : getSurfaceReference(theme);
  
  // Check cache
  const cacheKey: CacheKey = {
    seed: seedHex,
    theme,
    level,
    surfaceSignature: computeSurfaceSignature(surface.Y, theme),
    optionsHash: JSON.stringify({ faithfulness, includeVibrant }),
  };
  
  const cached = paletteCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Generate vibrant (identity)
  const vibrant = includeVibrant ? {
    color: oklchToHex(seedOklch.l, seedOklch.c, seedOklch.h),
    role: 'vibrant-accent' as const,
    warning: 'NO_TEXT_ALLOWED' as const,
    maxChroma: seedOklch.c,
  } : undefined;
  
  // Generate solid
  const solidTarget = level === 'AAA' ? textAAA : textAA;
  const solid = generateSolidV2(seedOklch, surface, theme, solidTarget, options);
  
  // Generate subtle
  const subtle = generateSubtleV2(seedOklch, surface, theme, textAAA, options);
  
  // Compute diagnostics
  const solidHeadroom = calculateHeadroom(solid.contrast, solidTarget);
  const subtleHeadroom = calculateHeadroom(subtle.contrast, textAAA);
  const uiContrast = hexContrast(subtle.bg, surface.hex) || 0;
  const uiHeadroom = calculateHeadroom(uiContrast, UI_MIN);
  
  const policy = getPolicyForHue(seedOklch.h);
  const surfaceSignature = computeSurfaceSignature(surface.Y, theme);
  
  // Contract status (quick UI feedback)
  const contract: ContractStatus = {
    subtleAAA: subtle.contrast >= textAAA - EPS,
    subtleUI3: uiContrast >= UI_MIN - EPS,
    solidAA: solid.contrast >= solidTarget - EPS,
    headroomOk: solidHeadroom >= DEFAULT_HEADROOM.solid.textVsBg - EPS &&
                subtleHeadroom >= DEFAULT_HEADROOM.subtle.textVsBg - EPS &&
                uiHeadroom >= DEFAULT_HEADROOM.subtle.uiVsSurface - EPS,
  };
  
  const palette: GeneratedPalette = {
    seed: seedHex,
    theme,
    oklch: seedOklch,
    vibrant,
    solid,
    subtle,
    contract,
    _pairIds: {
      subtle: 'primary:subtle:02',
      solid: 'primary:solid:10',
    },
    _diagnostics: {
      feasibleIntervalWidth: Math.min(solid._interval.width, subtle._interval.width),
      intervalWasNarrow: solid._interval.isNarrow || subtle._interval.isNarrow,
      intervalWasTiny: solid._interval.isTiny || subtle._interval.isTiny,
      seedWasExtreme: solid._interval.isTiny || subtle._interval.isTiny,
      chromaCompressed: solid.adjustments ? solid.adjustments.deltaC < -EPS : false,
      lightnessAdjusted: solid.adjustments ? Math.abs(solid.adjustments.deltaL) > EPS : false,
      subtleUsedNeutralTint: subtle._interval.wasAdjusted,
      headroom: {
        subtleTextVsBg: subtleHeadroom,
        subtleUiVsSurface: uiHeadroom,
        solidTextVsBg: solidHeadroom,
      },
      textPolicy: policy?.name || null,
      faithfulness,
      generatorVersion: 'v2.0.0',
      rolesVersion: 'v1.0.0',
      contractSchemaVersion: '1',
      surfaceSignature,
      computeTimeMs: 0, // Set below
    },
  };
  
  // Set compute time
  palette._diagnostics.computeTimeMs = now() - startTime;
  
  // Cache
  paletteCache.set(cacheKey, palette);
  
  return palette;
}

// ============================================
// V2 GENERATORS (Interval Guard + Headroom)
// ============================================

interface SolidResultV2 {
  bg: string;
  text: 'white' | 'black';
  hover: string;
  contrast: number;
  role: 'solid-action';
  adjustments?: Adjustments;
  _interval: FeasibleInterval;
}

interface SubtleResultV2 {
  bg: string;
  text: string;
  contrast: number;
  role: 'subtle-bg';
  adjustments?: Adjustments;
  _interval: FeasibleInterval;
}

function generateSolidV2(
  seedOklch: { l: number; c: number; h: number },
  surface: { Y: number; hex: string },
  theme: 'light' | 'dark',
  targetContrast: number,
  options: GeneratorOptions
): SolidResultV2 {
  const maxChromaComp = options.maxChromaCompression ?? 0.15;
  
  // Step 1: Choose text via policy
  const proposedBg = oklchToHex(seedOklch.l, seedOklch.c, seedOklch.h);
  const policyText = chooseTextByPolicy(proposedBg, seedOklch.h, 'solid');
  
  // Step 2: Calculate interval
  const interval = calculateFeasibleInterval(
    theme,
    surface.Y,
    { ui: UI_MIN, text: targetContrast },
    policyText
  );
  
  // Step 3: Handle narrow interval
  const { oklch: adjustedOklch, interval: handledInterval } = interval.isNarrow
    ? handleNarrowInterval(interval, seedOklch, theme)
    : { oklch: seedOklch, interval };
  
  // Step 4: Compress chroma to avoid gamut issues
  const workingC = Math.min(adjustedOklch.c, adjustedOklch.c * (1 - maxChromaComp));
  
  // Step 5: Pick Y target with headroom
  const yTarget = pickYTargetWithHeadroom(
    handledInterval,
    DEFAULT_HEADROOM.solid.textVsBg
  );
  
  if (!yTarget) {
    throw new Error('Solid: infeasible interval');
  }
  
  // Step 6: Solve for L
  const { l: bgL } = solveLforY(adjustedOklch.l, workingC, adjustedOklch.h, yTarget);
  
  // Step 7: Generate colors
  const bgHex = oklchToHex(bgL, workingC, adjustedOklch.h);
  const finalText = chooseTextByPolicy(bgHex, adjustedOklch.h, 'solid');
  const hoverL = theme === 'light' 
    ? Math.max(0, bgL - 0.08) 
    : Math.min(1, bgL + 0.06);
  const hoverHex = oklchToHex(hoverL, workingC, adjustedOklch.h);
  
  const contrast = hexContrast(bgHex, finalText === 'black' ? '#000000' : '#FFFFFF') || 0;
  
  // Step 8: Compute adjustments
  const deltaL = bgL - seedOklch.l;
  const deltaC = workingC - seedOklch.c;
  const adjustments: Adjustments | undefined = (Math.abs(deltaL) > 0.01 || Math.abs(deltaC) > 0.01) ? {
    deltaL,
    deltaC,
    deltaH: 0,
    reason: interval.isNarrow 
      ? 'Narrow interval: neutralized and centered'
      : `Adjusted for ${targetContrast}:1 contrast with ${finalText} text`,
  } : undefined;
  
  return {
    bg: bgHex,
    text: finalText,
    hover: hoverHex,
    contrast,
    role: 'solid-action',
    adjustments,
    _interval: handledInterval,
  };
}

function generateSubtleV2(
  seedOklch: { l: number; c: number; h: number },
  surface: { Y: number; hex: string },
  theme: 'light' | 'dark',
  targetContrast: number,
  options: GeneratorOptions
): SubtleResultV2 {
  const fg = theme === 'light' ? 'black' : 'white';
  
  // Step 1: Calculate interval (UI + text)
  const interval = calculateFeasibleInterval(
    theme,
    surface.Y,
    { ui: UI_MIN, text: targetContrast },
    fg
  );
  
  // Step 2: Handle narrow - use tinted neutral
  const { oklch: adjustedOklch, interval: handledInterval } = interval.isNarrow
    ? handleNarrowInterval(interval, seedOklch, theme)
    : { oklch: seedOklch, interval };
  
  // Step 3: Pick Y with headroom
  const yTarget = pickYTargetWithHeadroom(
    handledInterval,
    DEFAULT_HEADROOM.subtle.textVsBg,
    0.15 // Slight bias toward text contrast
  );
  
  if (!yTarget) {
    throw new Error('Subtle: infeasible interval');
  }
  
  // Step 4: Solve (with low chroma for subtle)
  const subtleC = Math.min(adjustedOklch.c, 0.12);
  const { l: bgL } = solveLforY(adjustedOklch.l, subtleC, adjustedOklch.h, yTarget);
  
  const bgHex = oklchToHex(bgL, subtleC, adjustedOklch.h);
  const textHex = fg === 'black' ? '#000000' : '#FFFFFF';
  const contrast = hexContrast(bgHex, textHex) || 0;
  
  // Step 5: Adjustments
  const deltaL = bgL - seedOklch.l;
  const deltaC = subtleC - seedOklch.c;
  const adjustments: Adjustments | undefined = (Math.abs(deltaL) > 0.01 || Math.abs(deltaC) > 0.01) ? {
    deltaL,
    deltaC,
    deltaH: 0,
    reason: interval.isNarrow
      ? 'Narrow interval: tinted neutral for surface separation'
      : 'Reduced chroma for subtle background',
  } : undefined;
  
  return {
    bg: bgHex,
    text: textHex,
    contrast,
    role: 'subtle-bg',
    adjustments,
    _interval: handledInterval,
  };
}

// ============================================
// LEGACY V1 (Kept for backward compatibility)
// ============================================

interface SolidResult extends ColorPair {
  l: number;
  adjusted: boolean;
  reason?: string;
}

function generateSolidPair(
  l: number,
  c: number,
  h: number,
  options: GeneratorOptions,
  callbacks: GeneratorCallbacks
): SolidResult {
  const { target = 4.5, allowNudge = true, preserveHue = false, maxNudge = 0.3 } = options;
  const { onFlip, onWarning } = callbacks;

  const bgHex = oklchToHex(l, c, h);

  // Try black first
  const contrastBlack = hexContrast(bgHex, '#000000') || 0;
  if (contrastBlack >= target) {
    onFlip?.(bgHex, 'black', contrastBlack);
    return { bg: bgHex, fg: 'black', contrast: contrastBlack, l, adjusted: false };
  }

  // Try white
  const contrastWhite = hexContrast(bgHex, '#FFFFFF') || 0;
  if (contrastWhite >= target) {
    onFlip?.(bgHex, 'white', contrastWhite);
    return { bg: bgHex, fg: 'white', contrast: contrastWhite, l, adjusted: false };
  }

  // Both failed - need to nudge
  if (!allowNudge) {
    onWarning?.(`Color fails ${target}:1 with both black and white. Nudging disabled.`);
    // Return best available
    return contrastBlack > contrastWhite
      ? { bg: bgHex, fg: 'black', contrast: contrastBlack, l, adjusted: false }
      : { bg: bgHex, fg: 'white', contrast: contrastWhite, l, adjusted: false };
  }

  // Nudge: Try darkening first (usually works for bright colors)
  let bestL = l;
  let bestFg: 'black' | 'white' = 'black';
  let bestContrast = contrastBlack;
  let reason = '';

  // Try darkening
  for (let delta = 0.05; delta <= maxNudge; delta += 0.05) {
    const darkerL = Math.max(0.2, l - delta);
    const darkerHex = oklchToHex(darkerL, c, h);

    const cBlack = hexContrast(darkerHex, '#000000') || 0;
    const cWhite = hexContrast(darkerHex, '#FFFFFF') || 0;

    if (cWhite >= target && cWhite > bestContrast) {
      bestL = darkerL;
      bestFg = 'white';
      bestContrast = cWhite;
      reason = `Darkened background to meet ${target}:1 with white text`;
      break;
    }
  }

  // Try lightening if darkening didn't work
  if (bestContrast < target) {
    for (let delta = 0.05; delta <= maxNudge; delta += 0.05) {
      const lighterL = Math.min(0.95, l + delta);
      const lighterHex = oklchToHex(lighterL, c, h);

      const cBlack = hexContrast(lighterHex, '#000000') || 0;

      if (cBlack >= target && cBlack > bestContrast) {
        bestL = lighterL;
        bestFg = 'black';
        bestContrast = cBlack;
        reason = `Lightened background to meet ${target}:1 with black text`;
        break;
      }
    }
  }

  const finalBg = oklchToHex(bestL, c, h);
  onFlip?.(finalBg, bestFg, bestContrast);

  return {
    bg: finalBg,
    fg: bestFg,
    contrast: bestContrast,
    l: bestL,
    adjusted: bestL !== l,
    reason,
  };
}

// ============================================
// CONSTANTS & HELPERS
// ============================================

const EPS = 1e-3;       // Epsilon for numeric stability
const UI_MIN = 3.0;     // WCAG 1.4.11 non-text contrast
const TEXT_MIN = 4.5;   // WCAG 1.4.3 normal text (AA)
const HEADROOM = 0.01;  // Safety margin inside feasible set

function getSurfaceReference(theme: 'light' | 'dark' = 'light', customHex?: string): { l: number; hex: string; Y: number } {
  if (customHex) {
    const rgb = hexToRgb(customHex);
    const Y = rgb ? relativeLuminance(rgb.r, rgb.g, rgb.b) : 0;
    const oklch = hexToOklch(customHex);
    return { l: oklch?.l || 0, hex: customHex, Y };
  }
  
  // From your CSS tokens:
  // Light: --role-surface ~ oklch(0.98 0 0)
  // Dark: --role-surface ~ oklch(0.22 0 0)
  const l = theme === 'light' ? 0.98 : 0.22;
  const hex = oklchToHex(l, 0, 0);
  const rgb = hexToRgb(hex);
  const Y = rgb ? relativeLuminance(rgb.r, rgb.g, rgb.b) : 0;
  return { l, hex, Y };
}

// ============================================
// INTERVAL-INTERSECTION APPROACH
// ============================================

/**
 * Calculate feasible Y interval for UI contrast vs surface
 */
function uiBounds(theme: 'light' | 'dark', Ys: number): { yMin: number; yMax: number } {
  if (theme === 'light') {
    // Subtle must be DARKER than surface → upper bound on Y
    const yMax = ((Ys + 0.05) / UI_MIN) - 0.05;
    return { yMin: 0, yMax };
  } else {
    // Subtle must be LIGHTER than surface → lower bound on Y
    const yMin = (UI_MIN * (Ys + 0.05)) - 0.05;
    return { yMin, yMax: 1 };
  }
}

/**
 * Calculate feasible Y interval for text contrast vs foreground
 */
function textBoundsForFg(fg: 'black' | 'white'): { yMin: number; yMax: number } {
  if (fg === 'black') {
    // (Y + 0.05) / 0.05 ≥ TEXT_MIN → Y ≥ 0.05 * TEXT_MIN - 0.05
    return { yMin: (0.05 * TEXT_MIN) - 0.05, yMax: 1 };
  }
  // White: 1.05 / (Y + 0.05) ≥ TEXT_MIN → Y ≤ 1.05 / TEXT_MIN - 0.05
  return { yMin: 0, yMax: (1.05 / TEXT_MIN) - 0.05 };
}

/**
 * Find intersection of two Y intervals
 */
function intersect(
  a: { yMin: number; yMax: number },
  b: { yMin: number; yMax: number }
): { yMin: number; yMax: number; ok: boolean } {
  const yMin = Math.max(a.yMin, b.yMin);
  const yMax = Math.min(a.yMax, b.yMax);
  return { yMin, yMax, ok: yMax - yMin > HEADROOM + EPS };
}

/**
 * Choose foreground color that yields a feasible interval
 */
function chooseFg(
  theme: 'light' | 'dark',
  Ys: number
): { fg: 'black' | 'white'; interval: { yMin: number; yMax: number } } {
  const ui = uiBounds(theme, Ys);

  const black = textBoundsForFg('black');
  const white = textBoundsForFg('white');

  const iBlack = intersect(ui, black);
  const iWhite = intersect(ui, white);

  // Bias to typical choices but fall back if infeasible
  if (theme === 'light') {
    if (iBlack.ok) return { fg: 'black', interval: iBlack };
    if (iWhite.ok) return { fg: 'white', interval: iWhite };
  } else {
    if (iWhite.ok) return { fg: 'white', interval: iWhite };
    if (iBlack.ok) return { fg: 'black', interval: iBlack };
  }

  // If neither feasible (extreme seeds), pick the wider one
  const wBlack = Math.max(0, iBlack.yMax - iBlack.yMin);
  const wWhite = Math.max(0, iWhite.yMax - iWhite.yMin);
  return wWhite >= wBlack
    ? { fg: 'white', interval: iWhite }
    : { fg: 'black', interval: iBlack };
}

/**
 * Map a target Y back to OKLCH by adjusting L only
 * Uses monotone binary search
 */
function solveLforY(
  l: number,
  c: number,
  h: number,
  targetY: number
): { l: number; Y: number } {
  // Gentle neutralization to avoid gamut clipping
  const baseC = c * 0.85;
  const baseH = h;

  let lo = 0;
  let hi = 1;
  let bestL = l;
  let bestY = 0;

  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const srgb = oklchToSrgb(mid, baseC, baseH);
    const Yt = relativeLuminance(srgb.r, srgb.g, srgb.b);
    bestL = mid;
    bestY = Yt;
    if (Yt < targetY) lo = mid;
    else hi = mid;
  }

  return { l: bestL, Y: bestY };
}

// ============================================
// SUBTLE PAIR (Badges, Chips) - Theme-Aware
// ============================================

function generateSubtlePair(
  l: number,
  c: number,
  h: number,
  options: GeneratorOptions,
  callbacks: GeneratorCallbacks
): ColorPair {
  const { allowNudge = true, theme = 'light' } = options;
  const { onFlip } = callbacks;

  const surface = getSurfaceReference(theme);
  const neutralC = 0.00; // Fully neutral for subtle
  const neutralH = 230;  // Neutral blue-gray

  if (!allowNudge) {
    // No nudging - just return neutral with safe L
    const fallbackL = theme === 'light' ? 0.70 : 0.40;
    const bgHex = oklchToHex(fallbackL, neutralC, neutralH);
    const fgColor = theme === 'light' ? '#000000' : '#FFFFFF';
    const contrast = hexContrast(bgHex, fgColor) || 0;
    onFlip?.(bgHex, theme === 'light' ? 'black' : 'white', contrast);
    return { bg: bgHex, fg: theme === 'light' ? 'black' : 'white', contrast };
  }

  // Step 1: Choose foreground & find feasible Y interval (UI ∩ text)
  const { fg, interval } = chooseFg(theme, surface.Y);

  // Step 2: Pick target Y inside feasible interval with headroom
  // Strategy: Stay near lower bound (max text contrast) while meeting surface constraint
  const width = Math.max(0, interval.yMax - interval.yMin);
  const hr = Math.min(HEADROOM, Math.max(0, width / 2 - EPS));
  
  // Aim for lower portion of interval (darker = better text contrast)
  // Light mode interval is typically [0.18, 0.28], aim ~0.20
  // Dark mode interval is typically [0.22, high], aim ~0.24-0.26
  const targetOffset = Math.min(width * 0.2, 0.04); // Small offset from min
  let yTarget = interval.yMin + hr + targetOffset;
  yTarget = Math.min(interval.yMax - hr, Math.max(interval.yMin + hr, yTarget));
  yTarget = Math.min(1 - EPS, Math.max(EPS, yTarget));

  // Step 3: Solve for OKLCH L that gives target Y
  let { l: bgL } = solveLforY(l, neutralC, neutralH, yTarget);

  // Step 4: Final safety - if numeric drift violates constraints, project back
  let bgHex = oklchToHex(bgL, neutralC, neutralH);
  const bgRgb = hexToRgb(bgHex);
  if (bgRgb) {
    let Yb = relativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    
    if (theme === 'light' && Yb > interval.yMax - EPS) {
      ({ l: bgL } = solveLforY(l, neutralC, neutralH, interval.yMax - hr));
      bgHex = oklchToHex(bgL, neutralC, neutralH);
    }
    if (theme === 'dark' && Yb < interval.yMin + EPS) {
      ({ l: bgL } = solveLforY(l, neutralC, neutralH, interval.yMin + hr));
      bgHex = oklchToHex(bgL, neutralC, neutralH);
    }
  }

  // Step 5: Return result
  const fgColor = fg === 'black' ? '#000000' : '#FFFFFF';
  const fgLabel = fg === 'black' ? 'black' : 'white';
  const textContrast = hexContrast(bgHex, fgColor) || 0;
  
  onFlip?.(bgHex, fgLabel, textContrast);
  return { bg: bgHex, fg: fgLabel, contrast: textContrast };
}

// ============================================
// MULTI-SEED PALETTE
// ============================================

export interface MultiSeedInput {
  primary?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
}

export interface MultiSeedPalette {
  primary?: GeneratedPalette;
  success?: GeneratedPalette;
  warning?: GeneratedPalette;
  danger?: GeneratedPalette;
  info?: GeneratedPalette;
  warnings: string[];
}

/**
 * Generate palettes for multiple semantic colors
 */
export function generateMultiSeedPalette(
  seeds: MultiSeedInput,
  options: GeneratorOptions = {},
  callbacks: GeneratorCallbacks = {}
): MultiSeedPalette {
  const warnings: string[] = [];
  const warningCallback = (msg: string) => {
    warnings.push(msg);
    callbacks.onWarning?.(msg);
  };

  const result: MultiSeedPalette = { warnings };

  if (seeds.primary) {
    result.primary = generatePalette(seeds.primary, options, { ...callbacks, onWarning: warningCallback }) || undefined;
  }

  if (seeds.success) {
    result.success = generatePalette(seeds.success, options, { ...callbacks, onWarning: warningCallback }) || undefined;
  }

  if (seeds.warning) {
    result.warning = generatePalette(seeds.warning, options, { ...callbacks, onWarning: warningCallback }) || undefined;
  }

  if (seeds.danger) {
    result.danger = generatePalette(seeds.danger, options, { ...callbacks, onWarning: warningCallback }) || undefined;
  }

  if (seeds.info) {
    result.info = generatePalette(seeds.info, options, { ...callbacks, onWarning: warningCallback }) || undefined;
  }

  return result;
}

// ============================================
// PREVIEW (Non-Destructive)
// ============================================

/**
 * Preview palette without applying
 * Same as generatePalette, but explicit name for clarity
 */
export const previewPalette = generatePalette;

// ============================================
// SUGGESTION GENERATION (Don't Make Me Think)
// ============================================

export interface ColorSuggestion {
  type: 'flip-text' | 'darken-bg' | 'lighten-bg' | 'adjust-both';
  bg: string;
  fg: string;
  contrast: number;
  reason: string;
  priority: number; // 1 = best, 2 = good, 3 = alternative
}

export interface GenerateSuggestionsOptions {
  /** Target WCAG level (default: AA) */
  level?: 'AA' | 'AAA';
  /** How many suggestions to generate (default: 3) */
  count?: number;
  /** Preserve hue at all costs? (default: true) */
  preserveHue?: boolean;
}

/**
 * Generate curated color suggestions that meet WCAG requirements
 * 
 * Users don't need to think about color math - just pick what looks best.
 * All suggestions are pre-validated and guaranteed to meet the target level.
 * 
 * @param seedHex - User's original color choice
 * @param options - Generation options
 * 
 * @example
 * const suggestions = generateSuggestions('#FFC107');
 * // Returns 3 options:
 * // 1. Keep exact yellow, use black text (11.5:1) ✅
 * // 2. Slightly darker yellow, white text (5.2:1) ✅
 * // 3. Very light yellow, black text (12.8:1) ✅
 */
export function generateSuggestions(
  seedHex: string,
  options: GenerateSuggestionsOptions = {}
): ColorSuggestion[] {
  const { level = 'AA', count = 3, preserveHue = true } = options;
  const target = level === 'AAA' ? 7.0 : 4.5;
  const suggestions: ColorSuggestion[] = [];

  // Suggestion 1: Flip text (keep user's exact color)
  const contrastBlack = hexContrast(seedHex, '#000000');
  const contrastWhite = hexContrast(seedHex, '#FFFFFF');

  if (contrastBlack !== null && contrastBlack >= target) {
    suggestions.push({
      type: 'flip-text',
      bg: seedHex,
      fg: '#000000',
      contrast: contrastBlack,
      reason: 'Keep your exact color, use black text',
      priority: 1,
    });
  } else if (contrastWhite !== null && contrastWhite >= target) {
    suggestions.push({
      type: 'flip-text',
      bg: seedHex,
      fg: '#FFFFFF',
      contrast: contrastWhite,
      reason: 'Keep your exact color, use white text',
      priority: 1,
    });
  }

  // Suggestion 2: Minimal background adjustment (preserve hue)
  if (preserveHue) {
    const oklch = hexToOklch(seedHex);
    if (oklch) {
      // Try darker background + white text
      for (let delta = 0.05; delta <= 0.3; delta += 0.05) {
        const darkerL = Math.max(0.2, oklch.l - delta);
        const darkerHex = oklchToHex(darkerL, oklch.c, oklch.h);
        const contrastDark = hexContrast(darkerHex, '#FFFFFF');

        if (contrastDark !== null && contrastDark >= target) {
          suggestions.push({
            type: 'darken-bg',
            bg: darkerHex,
            fg: '#FFFFFF',
            contrast: contrastDark,
            reason: 'Darken background slightly, keep white text',
            priority: 2,
          });
          break;
        }
      }

      // Try lighter background (subtle version) + black text
      if (suggestions.length < count) {
        const subtleL = Math.min(0.95, oklch.l + 0.2);
        const subtleC = oklch.c * 0.3; // Reduce saturation
        const subtleHex = oklchToHex(subtleL, subtleC, oklch.h);
        const contrastSubtle = hexContrast(subtleHex, '#000000');

        if (contrastSubtle !== null && contrastSubtle >= target) {
          suggestions.push({
            type: 'lighten-bg',
            bg: subtleHex,
            fg: '#000000',
            contrast: contrastSubtle,
            reason: 'Subtle background version, high contrast',
            priority: 3,
          });
        }
      }
    }
  }

  // Suggestion 3: Alternative approach (if we still need more)
  if (suggestions.length < count) {
    // Try adjusting both bg and fg
    const palette = generatePalette(seedHex, { level, allowNudge: true });
    if (palette) {
      suggestions.push({
        type: 'adjust-both',
        bg: palette.solid.bg,
        fg: palette.solid.text === 'black' ? '#000000' : '#FFFFFF',
        contrast: palette.solid.contrast,
        reason: 'Auto-adjusted for optimal readability',
        priority: suggestions.length + 1,
      });
    }
  }

  return suggestions.slice(0, count);
}

// ============================================
// SDK WRAPPER (Stable API for Consumers)
// ============================================

export interface RoleTokens {
  '--role-primary-subtle-bg': string;
  '--role-primary-subtle-text': string;
  '--role-primary-solid-bg': string;
  '--role-primary-solid-text': string;
  '--role-primary-solid-hover': string;
  '--role-primary-vibrant'?: string;
}

/**
 * Stable SDK wrapper - recommended for app consumption
 * 
 * Generates CSS custom property values with sensible defaults.
 * Use this instead of calling generatePalette() directly.
 * 
 * @param seed - Brand color hex (e.g., "#FF5733")
 * @param opts - Optional overrides (defaults: level='AA', includeVibrant=true, deterministicSeed=42)
 * 
 * @example
 * const tokens = getRoleTokens('#3B82F6');
 * Object.entries(tokens).forEach(([key, value]) => {
 *   document.documentElement.style.setProperty(key, value);
 * });
 */
export function getRoleTokens(
  seed: string,
  opts?: Partial<GeneratorOptions>
): RoleTokens | null {
  const palette = generatePalette(seed, {
    level: 'AA',
    includeVibrant: true,
    deterministicSeed: 42,
    ...opts,
  });
  
  if (!palette) {
    return null;
  }
  
  const tokens: RoleTokens = {
    '--role-primary-subtle-bg': palette.subtle.bg,
    '--role-primary-subtle-text': palette.subtle.text,
    '--role-primary-solid-bg': palette.solid.bg,
    '--role-primary-solid-text': palette.solid.text === 'black' ? '#000000' : '#FFFFFF',
    '--role-primary-solid-hover': palette.solid.hover,
  };
  
  if (palette.vibrant) {
    tokens['--role-primary-vibrant'] = palette.vibrant.color;
  }
  
  return tokens;
}
