/**
 * Shell Environment Override (Testing/Storybook)
 * 
 * Allows deterministic environment for visual regression and E2E tests.
 * Without this, viewport detection can be flaky.
 * 
 * Uses evented store pattern so React hooks can respond reliably.
 */

export interface ShellEnvironmentOverride {
  mode?: 'desktop' | 'tablet' | 'mobile';
  pointer?: 'fine' | 'coarse';
  density?: 'compact' | 'comfortable';
}

let override: ShellEnvironmentOverride | null = null;
const listeners = new Set<() => void>();

/**
 * Set a deterministic shell environment for testing
 * 
 * Notifies all subscribers (like useAppEnvironment) to re-compute
 * 
 * @example
 * ```tsx
 * // In Storybook
 * setShellEnvironment({ mode: 'mobile', pointer: 'coarse' });
 * 
 * // In Playwright
 * await page.evaluate(() => {
 *   window.__setShellEnvironment({ mode: 'tablet' });
 * });
 * 
 * // Reset
 * setShellEnvironment(null);
 * ```
 */
export function setShellEnvironment(env: ShellEnvironmentOverride | null): void {
  override = env;
  
  // Notify all subscribers
  listeners.forEach((listener) => listener());
  
  // Also dispatch custom event for backward compat
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('shell-environment-override', { detail: env }));
  }
}

/**
 * Subscribe to environment changes
 * 
 * Used by useAppEnvironment to re-render when override changes
 * 
 * @returns Unsubscribe function
 */
export function subscribeToEnvironmentChanges(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Get current environment override (if any)
 * 
 * Used internally by useAppEnvironment()
 */
export function getShellEnvironmentOverride(): ShellEnvironmentOverride | null {
  return override;
}

/**
 * Check if environment is overridden (useful for dev tools)
 */
export function isShellEnvironmentOverridden(): boolean {
  return override !== null;
}

// Expose to window for Playwright/console access
declare global {
  interface Window {
    __setShellEnvironment?: (env: ShellEnvironmentOverride | null) => void;
    __getShellEnvironment?: () => ShellEnvironmentOverride | null;
  }
}

if (typeof window !== 'undefined') {
  window.__setShellEnvironment = setShellEnvironment;
  window.__getShellEnvironment = getShellEnvironmentOverride;
}
