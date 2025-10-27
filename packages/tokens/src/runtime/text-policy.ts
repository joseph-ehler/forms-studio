/**
 * Text Color Policy Registry
 * Codified rules for text color selection (not detection-based)
 */

import { hexContrast } from './wcag-math';

export interface TextPolicy {
  name: string;
  hueRange: [number, number];
  preferredText: 'black' | 'white';
  fallbackThreshold: number; // Contrast required to use fallback color
  description: string;
}

/**
 * Codified text policies for specific hue ranges
 * Yellow/Amber/Lime almost always need black text
 */
export const TEXT_POLICIES: TextPolicy[] = [
  {
    name: 'Yellow/Amber/Lime',
    hueRange: [35, 85],  // ~60° ± 25°
    preferredText: 'black',
    fallbackThreshold: 7.0, // Only use white if contrast ≥7:1 (extremely rare)
    description: 'Bright yellows require black text for readability',
  },
  {
    name: 'Sky/Mint (Light Pastels)',
    hueRange: [160, 200],
    preferredText: 'black',
    fallbackThreshold: 4.5,
    description: 'Light cyan/mint pastels prefer black text',
  },
  // Default: Most colors prefer white text for solid backgrounds
];

/**
 * Choose text color based on codified policy
 * 
 * @param bgHex - Background color
 * @param hue - Hue in degrees (0-360)
 * @param role - Color role (solid requires ≥4.5:1, subtle requires ≥7:1)
 * @returns 'black' or 'white'
 */
export function chooseTextByPolicy(
  bgHex: string,
  hue: number,
  role: 'solid' | 'subtle'
): 'black' | 'white' {
  
  // Normalize hue to 0-360
  const normalizedHue = ((hue % 360) + 360) % 360;
  
  // Find applicable policy
  const policy = TEXT_POLICIES.find(p => {
    const [min, max] = p.hueRange;
    return normalizedHue >= min && normalizedHue <= max;
  });
  
  // No policy applies - use default (prefer white for most colors)
  if (!policy) {
    const whiteContrast = hexContrast(bgHex, '#FFFFFF') || 0;
    const blackContrast = hexContrast(bgHex, '#000000') || 0;
    return whiteContrast >= blackContrast ? 'white' : 'black';
  }
  
  // Policy applies - check if preferred text meets minimum
  const minContrast = role === 'solid' ? 4.5 : 7.0;
  
  const preferredColor = policy.preferredText === 'black' ? '#000000' : '#FFFFFF';
  const preferredContrast = hexContrast(bgHex, preferredColor) || 0;
  
  // Use preferred if it meets minimum
  if (preferredContrast >= minContrast) {
    return policy.preferredText;
  }
  
  // Check fallback
  const fallback = policy.preferredText === 'black' ? 'white' : 'black';
  const fallbackColor = fallback === 'black' ? '#000000' : '#FFFFFF';
  const fallbackContrast = hexContrast(bgHex, fallbackColor) || 0;
  
  // Use fallback if it meets high threshold
  if (fallbackContrast >= policy.fallbackThreshold) {
    return fallback;
  }
  
  // Neither ideal - use preferred (best effort)
  return policy.preferredText;
}

/**
 * Get applicable policy for a hue
 */
export function getPolicyForHue(hue: number): TextPolicy | null {
  const normalizedHue = ((hue % 360) + 360) % 360;
  return TEXT_POLICIES.find(p => {
    const [min, max] = p.hueRange;
    return normalizedHue >= min && normalizedHue <= max;
  }) || null;
}
