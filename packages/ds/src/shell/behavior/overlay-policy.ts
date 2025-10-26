/**
 * Overlay Policy (Layer 4: Behavior)
 * 
 * Single source of truth for overlay stack management.
 * Owns: scrim, z-order, scroll lock, inert underlay.
 * 
 * Phase 1: Stub created
 * Phase 2: Extract from scattered hooks
 * Phase 3: Event bus integration
 */

import { type ShellMode } from '../core/environment';
import { emitShellEvent } from './shell-events';

/**
 * Overlay Policy (Layer 4: Behavior)
 * 
 * Manages overlay stack, scrim coordination, z-index, inert, and scroll-lock.
 * Ensures exactly one backdrop active at a time.
 * 
 * Rules:
 * - Only topmost BLOCKING overlay gets scrim + lock + inert
 * - Non-blocking overlays (Popover) never claim these
 * - Stack operations are O(1) (Map + array)
 * - Body lock is refcounted (multiple overlays can stack)
 */

export interface OverlayHandle {
  close: () => void;
}

interface OverlayEntry {
  id: string;
  blocking: boolean;
  onClose?: () => void;
}

// Module-level state (single owner)
const overlayStack = new Map<string, OverlayEntry>();
const overlayOrder: string[] = [];
let scrollLockCount = 0;
let underlayRoot: HTMLElement | null = null;

/**
 * Register overlay in global stack
 * 
 * Returns handle with close() method
 * 
 * @example
 * ```tsx
 * const handle = pushOverlay({ 
 *   id: 'modal-123', 
 *   blocking: true, 
 *   onClose: () => console.log('closed') 
 * });
 * 
 * // Later
 * handle.close();
 * ```
 */
export function pushOverlay(options: {
  id: string;
  blocking: boolean;
  onClose?: () => void;
}): OverlayHandle {
  const { id, blocking, onClose } = options;
  
  // Dev-only: Warn about duplicate IDs
  if (process.env.NODE_ENV !== 'production' && overlayStack.has(id)) {
    console.warn(`[overlay-policy] Duplicate overlay id "${id}" ignored. Use unique IDs.`);
    return { close: () => {} };
  }
  
  // Add to stack
  overlayStack.set(id, { id, blocking, onClose });
  overlayOrder.push(id);
  
  // Update system effects if this is now topmost blocking
  updateSystemEffects();
  
  // Emit overlay:open event
  emitShellEvent({
    type: 'overlay:open' as const,
    id,
    blocking,
  });
  
  // Dev-only: Log stack changes
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[overlay-policy] Stack:', overlayOrder, 'Topmost blocking:', getTopmostBlocking()?.id);
  }
  
  return {
    close: () => {
      // Remove from stack
      overlayStack.delete(id);
      const idx = overlayOrder.indexOf(id);
      if (idx !== -1) overlayOrder.splice(idx, 1);
      
      // Update system effects
      updateSystemEffects();
      
      // Emit overlay:close event
      emitShellEvent({
        type: 'overlay:close',
        id,
      });
      
      // Dev-only: Log stack changes
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[overlay-policy] Stack after close:', overlayOrder);
      }
      
      // Call onClose callback
      onClose?.();
    },
  };
}

/**
 * Get topmost blocking overlay (internal)
 */
function getTopmostBlocking(): OverlayEntry | null {
  // Walk backwards to find first blocking overlay
  for (let i = overlayOrder.length - 1; i >= 0; i--) {
    const entry = overlayStack.get(overlayOrder[i]);
    if (entry?.blocking) return entry;
  }
  return null;
}

/**
 * Update system effects based on stack state
 * 
 * Only topmost blocking overlay gets scrim + lock + inert
 */
function updateSystemEffects(): void {
  const topmost = getTopmostBlocking();
  const shouldLock = topmost !== null;
  
  // Body scroll lock (refcounted)
  setBodyScrollLock(shouldLock);
  
  // Underlay inert (boolean)
  setUnderlayInert(shouldLock);
}

/**
 * Apply body scroll lock (refcounted)
 * 
 * Multiple overlays can request lock; only unlocks when count reaches 0
 * Uses documentElement (not body) for iOS/Safari compatibility
 */
export function setBodyScrollLock(active: boolean): void {
  if (typeof window === 'undefined') return;
  
  if (active) {
    if (scrollLockCount === 0) {
      // First lock: apply overflow hidden + overscroll-behavior + compensate scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'contain'; // Prevent iOS bounce
      
      if (scrollbarWidth > 0) {
        document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    scrollLockCount++;
  } else {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    
    if (scrollLockCount === 0) {
      // Last unlock: restore
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
      document.documentElement.style.paddingRight = '';
    }
  }
}

/**
 * Set the underlay root element (call once from AppShell)
 * 
 * Ensures we inert the correct container and don't accidentally inert overlay portals
 */
export function setUnderlayRoot(element: HTMLElement | null): void {
  underlayRoot = element;
}

/**
 * Apply inert to underlay (main content)
 * 
 * Prevents interaction with underlay when modal is open
 * Uses explicit underlayRoot if set, otherwise falls back to app markers
 */
export function setUnderlayInert(active: boolean): void {
  if (typeof document === 'undefined') return;
  
  // Prefer explicitly-set root, then fall back to known markers
  const root =
    underlayRoot ??
    document.getElementById('app-root') ??
    document.getElementById('storybook-root') ??
    document.body; // Last resort

  if (!root) return;

  if (active) {
    // Prevent inerting overlay portal: ensure portal is NOT a descendant of root
    root.setAttribute('inert', '');
    root.setAttribute('aria-hidden', 'true'); // Fallback for older browsers
  } else {
    root.removeAttribute('inert');
    root.removeAttribute('aria-hidden');
  }
}

/**
 * Check if overlay is topmost blocking (for shell usage)
 */
export function isTopmostBlocking(id: string): boolean {
  const topmost = getTopmostBlocking();
  return topmost?.id === id;
}

/**
 * Debug helpers (dev-only)
 * 
 * Exposed for testing canaries
 */
export const __overlayDebug =
  process.env.NODE_ENV !== 'production'
    ? {
        getOrder: () => [...overlayOrder],
        getTopmostBlocking: () => getTopmostBlocking()?.id ?? null,
        getLockCount: () => scrollLockCount,
        getStackSize: () => overlayStack.size,
      }
    : undefined;
