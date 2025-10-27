/**
 * Headroom Targeting
 * Picks Y target inside feasible interval to maximize safety margin
 */

import type { FeasibleInterval } from './interval-guard';
import { HEADROOM } from './interval-guard';

export interface HeadroomTargets {
  subtle: {
    uiVsSurface: number;  // Above 3.0:1
    textVsBg: number;     // Above 7.0:1 (AAA) or 4.5:1 (AA)
  };
  solid: {
    textVsBg: number;     // Above 4.5:1 (AA)
  };
}

export const DEFAULT_HEADROOM: HeadroomTargets = {
  subtle: {
    uiVsSurface: 0.2,  // Aim for 3.2:1 minimum
    textVsBg: 0.3,     // Aim for 7.3:1 (AAA) or 4.8:1 (AA)
  },
  solid: {
    textVsBg: 0.2,     // Aim for 4.7:1 minimum
  },
};

/**
 * Pick Y target inside intersection to maximize headroom
 * 
 * Strategy:
 * - Bias toward center with slight preference for text contrast
 * - In light mode: aim LOW in interval (darker = better text contrast)
 * - In dark mode: aim LOW in interval (darker relative to inverted scale)
 * 
 * @param interval - Feasible Y interval
 * @param headroomTarget - Desired headroom above minimum
 * @param bias - 0..0.5, where 0 = yMin, 0.5 = center, closer to 0 = more text contrast
 * @returns Target Y value, or null if interval is empty
 */
export function pickYTargetWithHeadroom(
  interval: FeasibleInterval,
  headroomTarget: number,
  bias = 0.15  // Slight bias toward more text contrast
): number | null {
  
  const width = interval.width;
  
  if (width <= 0) {
    return null;
  }
  
  // Calculate available headroom
  const availableHeadroom = width / 2;
  const actualHeadroom = Math.min(headroomTarget, availableHeadroom);
  
  // Position within interval (bias toward lower end = darker = better text)
  // bias = 0.15 means 35% from yMin (slightly below center)
  const position = 0.5 - bias; // 0.35 when bias = 0.15
  const adjustedWidth = width - 2 * actualHeadroom;
  
  const y = interval.yMin + actualHeadroom + (adjustedWidth * position);
  
  // Clamp within safe bounds
  return Math.max(
    interval.yMin + HEADROOM,
    Math.min(interval.yMax - HEADROOM, y)
  );
}

/**
 * Calculate achieved headroom after generating palette
 */
export function calculateHeadroom(
  achievedContrast: number,
  targetContrast: number
): number {
  return Math.max(0, achievedContrast - targetContrast);
}

/**
 * Check if headroom meets target
 */
export function meetsHeadroomTarget(
  achievedContrast: number,
  targetContrast: number,
  headroomTarget: number,
  epsilon = 1e-3
): boolean {
  const headroom = calculateHeadroom(achievedContrast, targetContrast);
  return headroom >= headroomTarget - epsilon;
}
