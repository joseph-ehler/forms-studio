/**
 * @intstudio/ds - Design System Core
 * 
 * High-value route shells + hooks + tokens
 */

// Routes (macro UX)
export * from './routes/FullScreenRoute';
export * from './routes/RoutePanel';
export * from './routes/FlowScaffold';

// Hooks (behavioral logic)
export { useFocusTrap } from './hooks/useFocusTrap';
export { useOverlayPolicy } from './hooks/useOverlayPolicy';
export { useStackPolicy } from './hooks/useStackPolicy';
export { useTelemetry } from './hooks/useTelemetry';
export { useDeviceType } from './hooks/useDeviceType';

// Tokens (re-export for convenience)
export * from './tokens';
