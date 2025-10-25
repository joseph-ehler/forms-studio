/**
 * @intstudio/ds - Design System Core
 * 
 * High-value route shells + hooks + tokens
 */

// Components
export { ThemeToggle } from './components/ThemeToggle';

// Routes (macro UX)
export * from './routes/flow-scaffold';
export * from './routes/full-screen-route';
export * from './routes/route-panel';

// Hooks (behavioral logic)
export { useDeviceType } from './hooks/useDeviceType';
export { useFocusTrap } from './hooks/useFocusTrap';
export { useOverlayPolicy } from './hooks/useOverlayPolicy';
export { useStackPolicy } from './hooks/useStackPolicy';
export { useTelemetry } from './hooks/useTelemetry';
export { useTheme } from './hooks/useTheme';

// Utils
export * from './utils/modality';

// Tokens (re-export for convenience)
export * from './tokens';
