/**
 * Overlay Design Tokens
 * 
 * Centralized constants for ALL overlay primitives.
 * Change these once → entire platform follows.
 * 
 * Future: Export to CSS custom properties for runtime theming.
 */

export const OVERLAY_TOKENS = {
  /** Z-index for all overlay containers (portal + sheet) */
  zIndex: {
    backdrop: 1000,
    overlay: 1001,
    sheet: 1002,
  },

  /** Default positioning offsets */
  offset: {
    default: 6,
    compact: 4,
    spacious: 12,
  },

  /** Max height constraints */
  maxHeight: {
    default: 560,
    mobile: 480,
    desktop: 720,
    /** Viewport percentage fallback for tiny screens */
    viewportPercent: 0.9,
  },

  /** Collision detection padding */
  collision: {
    padding: 8,
    flipPadding: 8,
    shiftPadding: 8,
  },

  /** Animation durations (ms) */
  animation: {
    open: 200,
    close: 150,
    backdropFade: 300,
  },

  /** Focus trap behavior */
  focus: {
    trapEnabled: true,
    returnEnabled: true,
    /** Delay before focusing first element (prevents flash) */
    initialFocusDelay: 10,
  },

  /** Debug mode */
  debug: {
    /** Enable auto-logging in development */
    autoLog: false,
    /** Log to console on every layout computation */
    logLayoutChanges: false,
  },
} as const

/**
 * Helper to get responsive max height based on viewport
 */
export function getResponsiveMaxHeight(viewportHeight: number): number {
  // Mobile
  if (viewportHeight < 600) {
    return Math.min(OVERLAY_TOKENS.maxHeight.mobile, viewportHeight * OVERLAY_TOKENS.maxHeight.viewportPercent)
  }
  
  // Tablet
  if (viewportHeight < 900) {
    return Math.min(OVERLAY_TOKENS.maxHeight.default, viewportHeight * OVERLAY_TOKENS.maxHeight.viewportPercent)
  }
  
  // Desktop
  return Math.min(OVERLAY_TOKENS.maxHeight.desktop, viewportHeight * OVERLAY_TOKENS.maxHeight.viewportPercent)
}

/**
 * Helper to get z-index token (type-safe)
 */
export function getZIndex(layer: keyof typeof OVERLAY_TOKENS.zIndex): number {
  return OVERLAY_TOKENS.zIndex[layer]
}

/**
 * Export CSS custom properties for runtime theming
 * Usage in component: <div style={cssVars} />
 */
export const cssVars: React.CSSProperties = {
  '--overlay-z-backdrop': String(OVERLAY_TOKENS.zIndex.backdrop),
  '--overlay-z-overlay': String(OVERLAY_TOKENS.zIndex.overlay),
  '--overlay-z-sheet': String(OVERLAY_TOKENS.zIndex.sheet),
  '--overlay-offset-default': `${OVERLAY_TOKENS.offset.default}px`,
  '--overlay-max-height-default': `${OVERLAY_TOKENS.maxHeight.default}px`,
  '--overlay-collision-padding': `${OVERLAY_TOKENS.collision.padding}px`,
  '--overlay-animation-open': `${OVERLAY_TOKENS.animation.open}ms`,
  '--overlay-animation-close': `${OVERLAY_TOKENS.animation.close}ms`,
} as React.CSSProperties
