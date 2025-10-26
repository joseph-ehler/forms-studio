/**
 * Shortcut Broker (Layer 4: Behavior)
 * 
 * One place to register keyboard shortcuts with scope precedence.
 * Higher-priority scopes (palette, modal) override lower ones (page).
 * 
 * @example
 * ```tsx
 * // In ModalShell
 * useEffect(() => {
 *   if (open) {
 *     return registerShortcut('Escape', 'modal', onClose);
 *   }
 * }, [open, onClose]);
 * 
 * // In PageShell
 * registerShortcut('ctrl+s', 'page', handleSave);
 * 
 * // In AppShell
 * registerShortcut('cmd+k', 'palette', openCommandPalette);
 * ```
 */

export type ShortcutScope = 'palette' | 'modal' | 'drawer' | 'page';

interface ShortcutRegistration {
  combo: string;
  scope: ShortcutScope;
  callback: () => void;
  id: string;
}

// Scope priority (higher index = higher priority)
let scopePriority: ShortcutScope[] = ['page', 'drawer', 'modal', 'palette'];

// Active registrations
const registrations = new Map<string, ShortcutRegistration[]>();

// ID counter
let nextId = 0;

/**
 * Normalize keyboard combo for consistent matching
 */
function normalizeCombo(combo: string): string {
  return combo
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('command', 'meta')
    .replace('cmd', 'meta')
    .replace('ctrl', 'control')
    .replace('opt', 'alt')
    .replace('option', 'alt');
}

/**
 * Check if keyboard event matches combo
 */
function matchesCombo(event: KeyboardEvent, combo: string): boolean {
  const normalized = normalizeCombo(combo);
  const parts = normalized.split('+');
  
  // Last part is the key
  const key = parts[parts.length - 1];
  const modifiers = parts.slice(0, -1);
  
  // Check key match
  const keyMatch = event.key.toLowerCase() === key || event.code.toLowerCase() === key;
  if (!keyMatch) return false;
  
  // Check modifiers
  const hasCtrl = modifiers.includes('control');
  const hasMeta = modifiers.includes('meta');
  const hasAlt = modifiers.includes('alt');
  const hasShift = modifiers.includes('shift');
  
  return (
    event.ctrlKey === hasCtrl &&
    event.metaKey === hasMeta &&
    event.altKey === hasAlt &&
    event.shiftKey === hasShift
  );
}

/**
 * Get priority order for a scope
 */
function getScopePriority(scope: ShortcutScope): number {
  return scopePriority.indexOf(scope);
}

/**
 * Handle keyboard event
 */
function handleKeyDown(event: KeyboardEvent): void {
  // Find all matching registrations
  const matches: ShortcutRegistration[] = [];
  
  registrations.forEach((regs) => {
    regs.forEach((reg) => {
      if (matchesCombo(event, reg.combo)) {
        matches.push(reg);
      }
    });
  });
  
  if (matches.length === 0) return;
  
  // Sort by priority (highest first)
  matches.sort((a, b) => getScopePriority(b.scope) - getScopePriority(a.scope));
  
  // Execute highest-priority match
  const winner = matches[0];
  event.preventDefault();
  event.stopPropagation();
  winner.callback();
  
  // Emit event for observability
  if (typeof window !== 'undefined' && (window as any).__emitShellEvent) {
    (window as any).__emitShellEvent({
      type: 'shortcut:trigger',
      combo: winner.combo,
      scope: winner.scope,
    });
  }
}

// Install global listener (once)
if (typeof window !== 'undefined') {
  let installed = false;
  
  function ensureListener() {
    if (!installed) {
      window.addEventListener('keydown', handleKeyDown, true); // Capture phase
      installed = true;
    }
  }
  
  ensureListener();
}

/**
 * Register a keyboard shortcut
 * 
 * @param combo - Keyboard combination (e.g., 'Escape', 'cmd+k', 'ctrl+shift+p')
 * @param scope - Scope for priority (palette > modal > drawer > page)
 * @param callback - Function to call when shortcut is triggered
 * @returns Cleanup function to unregister
 * 
 * @example
 * ```tsx
 * const unregister = registerShortcut('cmd+k', 'palette', openCommandPalette);
 * // Later...
 * unregister();
 * ```
 */
export function registerShortcut(
  combo: string,
  scope: ShortcutScope,
  callback: () => void
): () => void {
  const normalized = normalizeCombo(combo);
  const id = `shortcut-${nextId++}`;
  
  const registration: ShortcutRegistration = {
    combo: normalized,
    scope,
    callback,
    id,
  };
  
  // Add to registrations map
  if (!registrations.has(normalized)) {
    registrations.set(normalized, []);
  }
  registrations.get(normalized)!.push(registration);
  
  // Return cleanup
  return () => {
    const list = registrations.get(normalized);
    if (list) {
      const index = list.findIndex((r) => r.id === id);
      if (index !== -1) {
        list.splice(index, 1);
      }
      if (list.length === 0) {
        registrations.delete(normalized);
      }
    }
  };
}

/**
 * Set scope priority order
 * 
 * @param order - Array of scopes from lowest to highest priority
 * 
 * @example
 * ```tsx
 * // Default: ['page', 'drawer', 'modal', 'palette']
 * setScopePriority(['page', 'modal', 'palette', 'drawer']);
 * ```
 */
export function setScopePriority(order: ShortcutScope[]): void {
  scopePriority = [...order];
}

/**
 * Get current scope priority order
 */
export function getScopePriorityOrder(): ShortcutScope[] {
  return [...scopePriority];
}

/**
 * Debug helper (dev-only)
 */
export const __shortcutDebug =
  process.env.NODE_ENV !== 'production'
    ? {
        getRegistrations: () => {
          const result: Record<string, ShortcutRegistration[]> = {};
          registrations.forEach((value, key) => {
            result[key] = value;
          });
          return result;
        },
        getActiveCount: () => {
          let count = 0;
          registrations.forEach((value) => {
            count += value.length;
          });
          return count;
        },
        clear: () => {
          registrations.clear();
        },
      }
    : undefined;
