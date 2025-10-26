/**
 * @intstudio/ds - Design System Core
 * 
 * High-value route shells + hooks + tokens
 */

// Components
export { ThemeToggle } from './components/ThemeToggle';

// Re-export types and components from sub-modules
export * from './fb';
export * from './routes';
export * from './primitives';
export * from './capabilities';

// Routes (macro UX)
export * from './routes/flow-scaffold';
export * from './routes/full-screen-route';
export * from './routes/route-panel';

// Hooks (behavioral logic)
export { useDeviceType, useTheme } from './shell/core/environment';
export { useFocusTrap } from './hooks/useFocusTrap';
export { useOverlayPolicy } from './hooks/useOverlayPolicy';
export { useStackPolicy } from './hooks/useStackPolicy';
export { useTelemetry } from './hooks/useTelemetry';

// Utils
export * from './utils/modality';

// AppShell (macro layout coordinator)
export * from './shell';

// Tokens (re-export for convenience)
export * from './tokens';
