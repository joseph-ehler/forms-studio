/**
 * Panels State Management
 * 
 * Manages active panels (right sidebar, inspector, AI assistant, etc.).
 * Auto-wires panel state across AppShell without manual prop drilling.
 */

import * as React from 'react';

export type PanelId = string;

export interface PanelState {
  id: PanelId;
  title: string;
  closeable?: boolean;
  persistent?: boolean;
}

export interface PanelsContextValue {
  /** Currently active panels */
  panels: PanelState[];
  /** Open a panel */
  open: (panel: PanelState) => void;
  /** Close a panel */
  close: (id: PanelId) => void;
  /** Toggle a panel (open if closed, close if open) */
  toggle: (panel: PanelState) => void;
  /** Close all closeable panels */
  closeAll: () => void;
  /** Is specific panel active? */
  isActive: (id: PanelId) => boolean;
}

const PanelsContext = React.createContext<PanelsContextValue | null>(null);

/**
 * Panels Provider (internal - used by AppShell)
 */
export function PanelsProvider({ children }: { children: React.ReactNode }) {
  const [panels, setPanels] = React.useState<PanelState[]>([]);

  const open = React.useCallback((panel: PanelState) => {
    setPanels((prev) => {
      // Don't duplicate
      if (prev.some((p) => p.id === panel.id)) {
        return prev;
      }
      return [...prev, panel];
    });
  }, []);

  const close = React.useCallback((id: PanelId) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggle = React.useCallback((panel: PanelState) => {
    setPanels((prev) => {
      const exists = prev.some((p) => p.id === panel.id);
      if (exists) {
        return prev.filter((p) => p.id !== panel.id);
      }
      return [...prev, panel];
    });
  }, []);

  const closeAll = React.useCallback(() => {
    setPanels((prev) => prev.filter((p) => p.persistent));
  }, []);

  const isActive = React.useCallback(
    (id: PanelId) => panels.some((p) => p.id === id),
    [panels]
  );

  const value = React.useMemo(
    () => ({ panels, open, close, toggle, closeAll, isActive }),
    [panels, open, close, toggle, closeAll, isActive]
  );

  return <PanelsContext.Provider value={value}>{children}</PanelsContext.Provider>;
}

/**
 * Access panels state from anywhere in AppShell
 * 
 * @example
 * ```tsx
 * const { panels, open, close, toggle } = usePanels();
 * 
 * // Open inspector panel
 * open({ id: 'inspector', title: 'Inspector', closeable: true });
 * 
 * // Toggle AI assistant
 * toggle({ id: 'ai-assistant', title: 'AI Assistant' });
 * ```
 */
export function usePanels(): PanelsContextValue {
  const ctx = React.useContext(PanelsContext);
  if (!ctx) {
    throw new Error('usePanels must be used within AppShell');
  }
  return ctx;
}
