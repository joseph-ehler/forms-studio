/**
 * Shell Core - State Management
 * 
 * Shell state hooks (nav, panels, etc.)
 */

export { usePanels, PanelsProvider } from './usePanels';
export type { PanelId, PanelState, PanelsContextValue } from './usePanels';

export { useLoadingState, useGlobalLoadingState, loadingState } from './useLoadingState';
