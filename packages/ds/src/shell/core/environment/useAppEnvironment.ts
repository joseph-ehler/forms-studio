/**
 * AppEnvironment Hook
 * 
 * Single source of truth for device capabilities, breakpoints, and density.
 * Publishes mode (desktop/tablet/mobile), pointer type, and density level.
 * 
 * Used by AppShell to set CSS vars and data-* attributes for adaptive UIs.
 */

import { useEffect, useMemo, useState } from 'react';
import { isCapacitor } from '../../../capabilities/platform';
import { getShellEnvironmentOverride, subscribeToEnvironmentChanges } from './setShellEnvironment';

export type ShellMode = 'mobile' | 'tablet' | 'desktop';
export type PointerType = 'fine' | 'coarse';
export type DensityLevel = 'compact' | 'comfortable';

export interface Breakpoints {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}

export interface AppEnvironment {
  /** Shell layout mode (determines nav/panel behavior) */
  mode: ShellMode;
  /** Pointer modality (fine = mouse, coarse = touch) */
  pointer: PointerType;
  /** Density level (auto-derived from pointer unless overridden) */
  density: DensityLevel;
  /** Current viewport width */
  viewportWidth: number;
  /** Is running in Capacitor native container */
  isNative: boolean;
  /** Safe area insets (for notches/home indicators) */
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const DEFAULT_BREAKPOINTS: Required<Breakpoints> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Detects app environment and publishes layout mode, pointer type, and density.
 * 
 * @param breakpoints - Custom breakpoints (optional)
 * @param densityOverride - Override auto density (optional)
 * 
 * @example
 * ```tsx
 * const env = useAppEnvironment();
 * // { mode: 'desktop', pointer: 'fine', density: 'compact' }
 * ```
 */
export function useAppEnvironment(
  breakpoints?: Breakpoints,
  densityOverride?: DensityLevel
): AppEnvironment {
  const bp = { ...DEFAULT_BREAKPOINTS, ...breakpoints };

  // Check for test override
  const override = getShellEnvironmentOverride();

  // Subscribe to override changes (evented store pattern)
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeToEnvironmentChanges(() => {
      forceUpdate((n) => n + 1);
    });
    return unsubscribe;
  }, []);

  // Viewport width (SSR-safe, overridable)
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Pointer type (static after mount, overridable)
  const pointer: PointerType = useMemo(() => {
    if (override?.pointer) return override.pointer;
    if (typeof window === 'undefined') return 'fine';
    return matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';
  }, [override?.pointer]);

  // Safe area insets (for Capacitor/native apps)
  const safeArea = useMemo(() => {
    if (typeof window === 'undefined' || !isCapacitor) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const getInset = (name: string): number => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(
        `env(safe-area-inset-${name}, 0px)`
      );
      return parseInt(value, 10) || 0;
    };

    return {
      top: getInset('top'),
      bottom: getInset('bottom'),
      left: getInset('left'),
      right: getInset('right'),
    };
  }, []);

  // Resize listener
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Compute mode based on viewport width (overridable)
  const mode: ShellMode = useMemo(() => {
    if (override?.mode) return override.mode;
    if (viewportWidth < bp.md) return 'mobile';
    if (viewportWidth < bp.lg) return 'tablet';
    return 'desktop';
  }, [override?.mode, viewportWidth, bp.md, bp.lg]);

  // Density: test override > prop override > auto from pointer
  const density: DensityLevel = useMemo(() => {
    if (override?.density) return override.density;
    if (densityOverride) return densityOverride;
    return pointer === 'coarse' ? 'comfortable' : 'compact';
  }, [override?.density, pointer, densityOverride]);

  return {
    mode,
    pointer,
    density,
    viewportWidth,
    isNative: isCapacitor,
    safeArea,
  };
}
