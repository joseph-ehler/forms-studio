/**
 * UnderlayEffects - CSS-driven parallax/blur/scale/dim effects
 * 
 * Sets CSS custom properties once; CSS reads --sheet-snap to interpolate effects.
 * No RAF loop = better performance + respects prefers-reduced-motion automatically.
 * 
 * @example
 * ```tsx
 * <UnderlayEffects blur={[0, 12]} scale={[1, 0.98]} dim={[0, 0.08]} />
 * <Sheet>...</Sheet>
 * <div className="ds-underlay-dimmer" aria-hidden />
 * ```
 */

import { useEffect } from 'react';

export type UnderlayEffectsProps = {
  /**
   * Blur range [min, max] in pixels
   * Applied via backdrop-filter on .ds-sheet-overlay--blur
   * @default [0, 12]
   */
  blur?: [number, number];

  /**
   * Scale range [min, max] (1 = no scale)
   * Applied to underlay root (#app-root, #storybook-root)
   * @default [1, 0.98]
   */
  scale?: [number, number];

  /**
   * Dim overlay range [min, max] (0-1 alpha)
   * Applied to .ds-underlay-dimmer element
   * @default [0, 0.08]
   */
  dim?: [number, number];
};

/**
 * Set CSS custom properties for underlay effects
 * CSS reads --sheet-snap (0-1) to interpolate values
 * 
 * No JS animation loop - pure CSS interpolation via calc()
 */
export function UnderlayEffects({
  blur = [0, 12],
  scale = [1, 0.98],
  dim = [0, 0.08],
}: UnderlayEffectsProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Publish effect ranges to CSS
    root.style.setProperty('--ue-blur-min', `${blur[0]}px`);
    root.style.setProperty('--ue-blur-max', `${blur[1]}px`);
    root.style.setProperty('--ue-scale-min', String(scale[0]));
    root.style.setProperty('--ue-scale-max', String(scale[1]));
    root.style.setProperty('--ue-dim-min', String(dim[0]));
    root.style.setProperty('--ue-dim-max', String(dim[1]));

    return () => {
      root.style.removeProperty('--ue-blur-min');
      root.style.removeProperty('--ue-blur-max');
      root.style.removeProperty('--ue-scale-min');
      root.style.removeProperty('--ue-scale-max');
      root.style.removeProperty('--ue-dim-min');
      root.style.removeProperty('--ue-dim-max');
    };
  }, [blur, scale, dim]);

  return null;
}
