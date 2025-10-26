/**
 * Layout Policy (Layer 4: Behavior)
 * 
 * Determines persistent vs off-canvas, push vs overlay behaviors.
 * Resolves shell variants into layout decisions.
 * 
 * TODO (Phase 2): Centralize responsive layout logic
 */

import type { ShellMode } from '../core/environment';

export interface LayoutPolicyInput {
  /** Current shell mode (desktop/tablet/mobile) */
  mode: ShellMode;
  /** Which modes should this element overlay on? */
  overlayOn?: ShellMode[];
  /** Should this element be visible? */
  visible?: boolean;
}

/**
 * Determine if element should be in overlay mode
 */
export function shouldOverlay(input: LayoutPolicyInput): boolean {
  const { mode, overlayOn = [] } = input;
  return overlayOn.includes(mode);
}

/**
 * Determine if element should be persistent (inline in grid)
 */
export function shouldBePersistent(input: LayoutPolicyInput): boolean {
  return !shouldOverlay(input);
}

/**
 * Resolve nav behavior (persistent vs off-canvas)
 */
export function resolveNavBehavior(mode: ShellMode, collapsible: boolean = true): 'persistent' | 'off-canvas' {
  if (mode === 'desktop' && !collapsible) return 'persistent';
  if (mode === 'desktop') return 'persistent'; // Default on desktop
  return 'off-canvas'; // Tablet/mobile
}

/**
 * Resolve panels behavior (inline vs overlay)
 */
export function resolvePanelsBehavior(mode: ShellMode, overlayOn: ShellMode[] = ['mobile', 'tablet']): 'inline' | 'overlay' {
  return overlayOn.includes(mode) ? 'overlay' : 'inline';
}

/**
 * Resolve drawer push vs overlay behavior
 */
export function resolveDrawerBehavior(
  mode: ShellMode,
  desktopBehavior: 'push' | 'overlay' = 'overlay'
): 'push' | 'overlay' {
  if (mode !== 'desktop') return 'overlay'; // Always overlay on mobile/tablet
  return desktopBehavior;
}
