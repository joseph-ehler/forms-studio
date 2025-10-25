/**
 * Button Runtime Audit - Dev-mode sanity checks
 * 
 * Detects computed style anomalies that static analysis might miss:
 * - Transparent backgrounds on solid buttons
 * - Missing focus rings
 * - Low contrast (optional)
 * 
 * Enable in browser console:
 * window.__DS_AUDIT = true;
 * 
 * Then interact with buttons to see warnings.
 */

declare global {
  interface Window {
    __DS_AUDIT?: boolean;
  }
}

/**
 * Audit a button element's computed styles
 * Only runs in dev mode when window.__DS_AUDIT is true
 */
export function auditButton(el: HTMLElement): void {
  // Skip in production or when audit is disabled
  if (process.env.NODE_ENV === 'production' || !(window as any).__DS_AUDIT) {
    return;
  }

  const cs = getComputedStyle(el);
  const bg = cs.backgroundColor;
  const fg = cs.color;
  const ring = cs.boxShadow;
  const variant = el.dataset.variant;

  // Check 1: Transparent background on non-ghost/non-secondary buttons
  const isTransparent = bg.includes('rgba(0, 0, 0, 0)') || bg === 'transparent';
  if (isTransparent && variant !== 'ghost' && variant !== 'secondary') {
    console.warn(
      '[Button Audit] Transparent background on non-ghost/non-secondary button:',
      el,
      `\nVariant: ${variant}`,
      `\nComputed bg: ${bg}`
    );
  }

  // Check 2: Focus ring present when focused
  if (el.matches(':focus-visible')) {
    if (!ring || ring === 'none') {
      console.warn(
        '[Button Audit] No focus ring on :focus-visible button:',
        el,
        `\nVariant: ${variant}`,
        `\nComputed boxShadow: ${ring}`
      );
    }
  }

  // Check 3: Contrast check (approximate, for quick debugging)
  // Note: This is a simplified heuristic, not WCAG-accurate
  if (bg && fg && !isTransparent) {
    const bgLuminance = approximateLuminance(bg);
    const fgLuminance = approximateLuminance(fg);
    const contrast = calculateContrast(bgLuminance, fgLuminance);

    // UI elements need 3:1 minimum
    if (contrast < 3) {
      console.warn(
        '[Button Audit] Low contrast detected:',
        el,
        `\nVariant: ${variant}`,
        `\nContrast: ${contrast.toFixed(2)}:1 (minimum 3:1)`,
        `\nForeground: ${fg}`,
        `\nBackground: ${bg}`
      );
    }
  }

  // Check 4: Missing skin variables
  const style = (el as HTMLElement).style;
  const requiredVars = ['--btn-fg', '--btn-bg', '--btn-hover-bg', '--btn-active-bg'];
  const missing = requiredVars.filter(v => !style.getPropertyValue(v));
  
  if (missing.length > 0) {
    console.warn(
      '[Button Audit] Missing skin variables:',
      el,
      `\nVariant: ${variant}`,
      `\nMissing: ${missing.join(', ')}`
    );
  }
}

/**
 * Approximate relative luminance from CSS color string
 * Simplified version - not production-accurate
 */
function approximateLuminance(color: string): number {
  // Extract RGB values (simplified parser)
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return 0.5; // fallback

  const r = parseInt(match[1]) / 255;
  const g = parseInt(match[2]) / 255;
  const b = parseInt(match[3]) / 255;

  // sRGB to linear RGB (simplified)
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // Relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two luminance values
 */
function calculateContrast(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
