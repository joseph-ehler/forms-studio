/**
 * Motion & Surface Tokens (Layer 1: Tokens)
 * 
 * Standardized motion durations, easing curves, and surface properties.
 * Ensures consistent animation feel across all shells.
 * Automatically respects prefers-reduced-motion.
 */

/**
 * Motion duration tokens (in milliseconds)
 */
export const motionDuration = {
  /** Quick transitions (toast, tooltip) - 120ms */
  duration1: 120,
  
  /** Standard transitions (sheet, drawer, modal) - 200ms */
  duration2: 200,
  
  /** Slow transitions (page transitions, large modals) - 300ms */
  duration3: 300,
  
  /** Instant (for reduced motion fallback) - 0ms */
  instant: 0,
} as const;

/**
 * Motion easing curves (cubic-bezier)
 */
export const motionEasing = {
  /** Standard ease - Material Design standard */
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  
  /** Decelerate - Elements entering screen */
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  
  /** Accelerate - Elements leaving screen */
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  /** Spring - Natural bounce feel for sheets */
  spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  
  /** Linear - For reduced motion */
  linear: 'linear',
} as const;

/**
 * Surface/overlay colors
 */
export const surfaceColors = {
  /** Standard scrim background (50% black in oklab) */
  scrimBg: 'color-mix(in oklab, black 50%, transparent)',
  
  /** Light scrim background (30% black) */
  scrimBgLight: 'color-mix(in oklab, black 30%, transparent)',
  
  /** Heavy scrim background (70% black) */
  scrimBgHeavy: 'color-mix(in oklab, black 70%, transparent)',
} as const;

/**
 * Generate CSS custom properties for motion tokens
 */
export function generateMotionCSS(): string {
  return `
    :root {
      /* Duration tokens */
      --motion-duration-1: ${motionDuration.duration1}ms;
      --motion-duration-2: ${motionDuration.duration2}ms;
      --motion-duration-3: ${motionDuration.duration3}ms;
      
      /* Easing tokens */
      --motion-ease-standard: ${motionEasing.standard};
      --motion-ease-decelerate: ${motionEasing.decelerate};
      --motion-ease-accelerate: ${motionEasing.accelerate};
      --motion-spring-sheet: ${motionEasing.spring};
      
      /* Surface tokens */
      --overlay-scrim-bg: ${surfaceColors.scrimBg};
      --overlay-scrim-bg-light: ${surfaceColors.scrimBgLight};
      --overlay-scrim-bg-heavy: ${surfaceColors.scrimBgHeavy};
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      :root {
        --motion-duration-1: 0ms;
        --motion-duration-2: 0ms;
        --motion-duration-3: 0ms;
        --motion-spring-sheet: ${motionEasing.linear};
      }
    }
  `.trim();
}

/**
 * TypeScript-friendly motion token access
 */
export const motionTokens = {
  duration: motionDuration,
  easing: motionEasing,
  surface: surfaceColors,
} as const;
