/**
 * Shell Behavior Layer (Layer 4)
 * 
 * Policies and orchestration: "when X, do Y" rules.
 * Independent of visuals - only structure and system effects.
 * 
 * Phase 1: Stubs created
 * Phase 2: Extract from scattered hooks + shells
 */

// Overlay management (scrim, stack, z-index, inert, scroll-lock)
export * from './overlay-policy';

// Layout decisions (persistent vs off-canvas, push vs overlay)
export * from './layout-policy';

// Focus management (trap, return, Tab loop)
export * from './focus-policy';

// Variant translation (props → data-* + CSS vars)
export * from './variant-resolver';

// Keyboard shortcuts (global broker with scope priority)
export * from './shortcut-broker';

// Shell events (observability, analytics, haptics)
export * from './shell-events';
