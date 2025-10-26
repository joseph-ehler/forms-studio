/**
 * Shell Events Bus (Layer 4: Behavior)
 * 
 * Centralized event emission for observability, analytics, and decoupled actions.
 * Allows haptics, telemetry, and other cross-cutting concerns without coupling.
 * 
 * @example
 * ```tsx
 * // In overlay-policy.ts
 * emitShellEvent({ type: 'overlay:open', id: 'my-modal', blocking: true });
 * 
 * // In AppShell.tsx
 * useEffect(() => {
 *   return onShellEvent((event) => {
 *     if (event.type === 'overlay:open') {
 *       analytics.track('Overlay Opened', { id: event.id });
 *     }
 *   });
 * }, []);
 * ```
 */

export type ShellEvent =
  | { type: 'overlay:open'; id: string; blocking: boolean; timestamp: number }
  | { type: 'overlay:close'; id: string; timestamp: number }
  | { type: 'sheet:bucket'; id: string; bucket: 'peek' | 'work' | 'owned'; timestamp: number }
  | { type: 'nav:toggle'; open: boolean; timestamp: number }
  | { type: 'panel:toggle'; id: string; open: boolean; timestamp: number }
  | { type: 'shortcut:trigger'; combo: string; scope: string; timestamp: number };

// Helper type for emitting events (without timestamp)
export type ShellEventInput =
  | { type: 'overlay:open'; id: string; blocking: boolean }
  | { type: 'overlay:close'; id: string }
  | { type: 'sheet:bucket'; id: string; bucket: 'peek' | 'work' | 'owned' }
  | { type: 'nav:toggle'; open: boolean }
  | { type: 'panel:toggle'; id: string; open: boolean }
  | { type: 'shortcut:trigger'; combo: string; scope: string };

// Event listeners
const listeners = new Set<(event: ShellEvent) => void>();

// Event log (dev-only, limited size)
const eventLog: ShellEvent[] = [];
const MAX_LOG_SIZE = 100;

/**
 * Subscribe to shell events
 * 
 * @param callback - Function to call when events are emitted
 * @returns Cleanup function to unsubscribe
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   const unsubscribe = onShellEvent((event) => {
 *     console.log('Shell event:', event);
 *   });
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function onShellEvent(callback: (event: ShellEvent) => void): () => void {
  listeners.add(callback);
  
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Emit a shell event
 * 
 * Automatically adds timestamp and notifies all listeners.
 * 
 * @param event - Event to emit (without timestamp)
 * 
 * @example
 * ```tsx
 * emitShellEvent({
 *   type: 'overlay:open',
 *   id: 'my-modal',
 *   blocking: true,
 * });
 * ```
 */
export function emitShellEvent(event: ShellEventInput): void {
  const fullEvent: ShellEvent = {
    ...event,
    timestamp: Date.now(),
  } as ShellEvent;
  
  // Add to log (dev-only, circular buffer)
  if (process.env.NODE_ENV !== 'production') {
    eventLog.push(fullEvent);
    if (eventLog.length > MAX_LOG_SIZE) {
      eventLog.shift();
    }
  }
  
  // Notify all listeners
  listeners.forEach((listener) => {
    try {
      listener(fullEvent);
    } catch (error) {
      // Catch errors to prevent one bad listener from breaking others
      if (process.env.NODE_ENV !== 'production') {
        console.error('[ShellEvents] Listener error:', error);
      }
    }
  });
}

/**
 * Debug helpers (dev-only)
 */
export const __shellEventsDebug =
  process.env.NODE_ENV !== 'production'
    ? {
        /**
         * Get recent event log
         */
        getEventLog: (): readonly ShellEvent[] => {
          return [...eventLog];
        },
        
        /**
         * Clear event log
         */
        clearLog: (): void => {
          eventLog.length = 0;
        },
        
        /**
         * Get active listener count
         */
        getListenerCount: (): number => {
          return listeners.size;
        },
        
        /**
         * Get events of a specific type
         */
        getEventsByType: (type: ShellEvent['type']): readonly ShellEvent[] => {
          return eventLog.filter((e) => e.type === type);
        },
      }
    : undefined;

/**
 * Expose emitShellEvent globally for use in non-React code
 * (e.g., shortcut-broker.ts)
 */
if (typeof window !== 'undefined') {
  (window as any).__emitShellEvent = emitShellEvent;
}
