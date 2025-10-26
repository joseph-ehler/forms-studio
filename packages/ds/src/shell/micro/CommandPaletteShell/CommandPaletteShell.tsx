/**
 * CommandPaletteShell - ⌘K Command Interface (Layer 5: Micro Shell)
 * 
 * High-priority overlay for global commands. Composes:
 * - overlay-policy (blocking stack)
 * - focus-policy (trap + restore)
 * - shortcut-broker (⌘K registration, 'palette' scope - highest)
 * - shell-events (analytics)
 * - haptics (selection feedback on native)
 * 
 * @example
 * ```tsx
 * <CommandPaletteShell
 *   open={open}
 *   onOpenChange={setOpen}
 *   commands={[
 *     { id: '1', label: 'New Document', onSelect: () => {} },
 *     { id: '2', label: 'Open Settings', onSelect: () => {} },
 *   ]}
 * />
 * ```
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import Fuse from 'fuse.js';
import { pushOverlay } from '../../behavior/overlay-policy';
import { trapFocus, captureFocus, restoreFocus } from '../../behavior/focus-policy';
import { registerShortcut } from '../../behavior/shortcut-broker';
import { emitShellEvent } from '../../behavior/shell-events';
import { useHaptics, useAppEnvironment } from '../../core/environment';
import './CommandPaletteShell.css';

export interface Command {
  id: string;
  label: string;
  description?: string;    // Subtitle text
  shortcut?: string;       // "⌘N" or "Ctrl+Shift+P"
  icon?: React.ReactNode;
  keywords?: string[];
  category?: string;       // "Navigation", "Actions", etc.
  onSelect: () => void;
}

export interface CommandProvider {
  id: string;
  search: (query: string) => Promise<Command[]>;
  placeholder?: string;
}

export interface CommandPaletteShellProps {
  /** Is palette open? */
  open: boolean;
  /** Open state change handler */
  onOpenChange: (open: boolean) => void;
  /** Available commands */
  commands: Command[];
  /** Command selection handler (optional, in addition to cmd.onSelect) */
  onCommandSelect?: (command: Command) => void;
  /** Search input placeholder */
  placeholder?: string;
  /** Overlay ID for analytics (default: 'command-palette') */
  id?: string;
  /** Async command providers */
  providers?: CommandProvider[];
  /** Max recent commands to track (default: 5) */
  maxRecent?: number;
  /** Debounce ms for provider search (default: 200) */
  debounceMs?: number;
}

export function CommandPaletteShell({
  open,
  onOpenChange,
  commands,
  onCommandSelect,
  placeholder = 'Type a command…',
  id = 'command-palette',
  providers,
  maxRecent = 5,
  debounceMs = 200,
}: CommandPaletteShellProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const lastFocused = React.useRef<HTMLElement | null>(null);
  const haptics = useHaptics();
  const env = useAppEnvironment();
  const isMobile = env.mode === 'mobile';
  
  // Track keyboard navigation mode to prevent mouse hover conflicts
  const isKeyboardNav = React.useRef(false);

  // Dynamic commands & loading state
  const [dynamicCommands, setDynamicCommands] = React.useState<Command[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Recent commands
  const RECENT_KEY = React.useMemo(() => `${id}:recent`, [id]);
  const [recentIds, setRecentIds] = React.useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const trackRecent = React.useCallback((cmdId: string) => {
    const updated = [cmdId, ...recentIds.filter((i) => i !== cmdId)].slice(0, maxRecent);
    setRecentIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    }
  }, [recentIds, maxRecent, RECENT_KEY]);

  // Create portal container on mount (before render)
  const [portalContainer] = React.useState(() => {
    if (typeof document === 'undefined') return null;
    const div = document.createElement('div');
    return div;
  });

  React.useEffect(() => {
    if (!portalContainer) return;
    
    // Append container to body on mount
    document.body.appendChild(portalContainer);
    
    return () => {
      // Clean up on unmount
      if (portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
    };
  }, [portalContainer]);

  // Debounced provider search
  React.useEffect(() => {
    if (!providers || providers.length === 0) {
      setDynamicCommands([]);
      setIsLoading(false);
      return;
    }
    if (!query) {
      setDynamicCommands([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setIsLoading(true);
        const results = await Promise.all(providers.map((p) => p.search(query)));
        if (!cancelled) setDynamicCommands(results.flat());
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, debounceMs);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [providers, query, debounceMs]);

  // Register ⌘K shortcut (ALWAYS active, not just when open)
  React.useEffect(() => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
    const unregister = registerShortcut(
      isMac ? 'Meta+k' : 'Control+k', 
      'palette', 
      () => onOpenChange(true)
    );
    return () => unregister?.();
  }, [onOpenChange]);

  // Overlay behavior when open
  React.useEffect(() => {
    if (!open || !portalContainer) return;
    
    // Register with overlay stack (blocking, highest priority)
    const handle = pushOverlay({ 
      id, 
      blocking: true, 
      onClose: () => onOpenChange(false) 
    });

    // Capture focus for restoration
    lastFocused.current = captureFocus() as HTMLElement | null;
    
    // Focus trap
    const cleanupTrap = portalContainer ? trapFocus(portalContainer, {
      onEscape: () => onOpenChange(false),
    }) : () => {};

    // Emit analytics event
    emitShellEvent({ type: 'overlay:open', id, blocking: true });

    // Focus input on mount
    const raf = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      cleanupTrap();
      handle.close();
      restoreFocus(lastFocused.current);
      emitShellEvent({ type: 'overlay:close', id });
    };
  }, [open, portalContainer, id, onOpenChange]);

  // Build combined command list (recent + static + dynamic)
  const baseCommands = React.useMemo(() => {
    const byId = new Map<string, Command>();
    [...commands, ...dynamicCommands].forEach((c) => byId.set(c.id, c));
    const recent = recentIds.map((id) => byId.get(id)).filter(Boolean) as Command[];
    return { recent, all: [...commands, ...dynamicCommands] };
  }, [commands, dynamicCommands, recentIds]);

  // Fuse instance for fuzzy search
  const fuse = React.useMemo(() => {
    return new Fuse(baseCommands.all, {
      keys: ['label', 'keywords', 'description'],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [baseCommands.all]);

  // Filter via fuzzy search
  const filtered = React.useMemo(() => {
    if (!query) return baseCommands.all;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, baseCommands.all]);

  // Group by category (with optional "Recent" section)
  const grouped = React.useMemo(() => {
    const groups: Record<string, Command[]> = {};
    if (!query && baseCommands.recent.length > 0) {
      groups['Recent'] = baseCommands.recent;
    }
    for (const c of filtered) {
      const cat = c.category || 'Other';
      (groups[cat] ??= []).push(c);
    }
    return groups;
  }, [filtered, baseCommands.recent, query]);

  // Scroll active item into view when index changes (before early return!)
  React.useEffect(() => {
    if (!open) return;
    const activeElement = document.getElementById(filtered[active]?.id);
    if (activeElement) {
      activeElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [active, filtered, open]);

  if (!open || !portalContainer) return null;

  // Optional provider placeholder override
  const effectivePlaceholder =
    (!query && providers && providers.find((p) => p.placeholder)?.placeholder) ||
    placeholder;

  const onSelect = (cmd: Command) => {
    // Haptics on selection (native only, no-op on web)
    haptics.selection();
    
    // Emit shortcut event
    emitShellEvent({ type: 'shortcut:trigger', combo: 'cmd+k', scope: 'palette' });
    
    // Call handlers
    onCommandSelect?.(cmd);
    cmd.onSelect();
    
    // Track in recent
    trackRecent(cmd.id);
    
    // Close palette
    onOpenChange(false);
  };

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    // Skip if user is composing (IME/international keyboards)
    if (e.nativeEvent.isComposing) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      isKeyboardNav.current = true;
      setActive((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      isKeyboardNav.current = true;
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) onSelect(cmd);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  const onMouseMove = () => {
    // Disable keyboard nav mode when mouse moves
    isKeyboardNav.current = false;
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // Reset keyboard nav mode when typing
    isKeyboardNav.current = false;
  };

  return createPortal(
    <div className="ds-cp-overlay" data-testid="cp-overlay">
      <div 
        className="ds-cp-container" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Command palette"
        data-mobile={isMobile ? 'true' : 'false'}
      >
        <div className="ds-cp-input-row">
          <input
            ref={inputRef}
            className="ds-cp-input"
            placeholder={effectivePlaceholder}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={onKeyDown}
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="ds-cp-loading">
            <span className="ds-cp-spinner" />
            <span>Searching…</span>
          </div>
        )}

        <ul 
          className="ds-cp-list" 
          role="listbox" 
          aria-activedescendant={filtered[active]?.id}
          data-mobile={isMobile ? 'true' : 'false'}
          onMouseMove={onMouseMove}
        >
          {Object.entries(grouped).map(([category, cmds]) => {
            let globalIdx = 0;
            for (const [cat] of Object.entries(grouped)) {
              if (cat === category) break;
              globalIdx += grouped[cat].length;
            }
            
            return (
              <React.Fragment key={category}>
                <li className="ds-cp-category">{category}</li>
                {cmds.map((cmd, localIdx) => {
                  const idx = globalIdx + localIdx;
                  return (
                    <li
                      key={cmd.id}
                      id={cmd.id}
                      role="option"
                      className={`ds-cp-item ${idx === active ? 'is-active' : ''}`}
                      onMouseEnter={() => {
                        // Only update active on hover if not using keyboard nav
                        if (!isKeyboardNav.current) {
                          setActive(idx);
                        }
                      }}
                      onClick={() => onSelect(cmd)}
                    >
                      {cmd.icon && <span className="ds-cp-icon">{cmd.icon}</span>}
                      <div className="ds-cp-text">
                        <span className="ds-cp-label">{cmd.label}</span>
                        {cmd.description && (
                          <span className="ds-cp-description">{cmd.description}</span>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="ds-cp-shortcut">{cmd.shortcut}</kbd>
                      )}
                    </li>
                  );
                })}
              </React.Fragment>
            );
          })}
          {filtered.length === 0 && !isLoading && (
            <div className="ds-cp-empty-state">
              <span className="ds-cp-empty-icon">🔍</span>
              <p className="ds-cp-empty-title">No commands found</p>
              <p className="ds-cp-empty-hint">Try different keywords or check spelling</p>
            </div>
          )}
        </ul>
        <div className="ds-cp-footer">
          <span className="ds-cp-hint"><kbd>↑↓</kbd> Navigate</span>
          <span className="ds-cp-hint"><kbd>Enter</kbd> Select</span>
          <span className="ds-cp-hint"><kbd>Esc</kbd> Close</span>
        </div>
      </div>
      <div 
        className="ds-cp-scrim" 
        onClick={() => onOpenChange(false)} 
      />
    </div>,
    portalContainer
  );
}
