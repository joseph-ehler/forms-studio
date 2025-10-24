/**
 * DS Routes - Macro/Meso navigation components
 * 
 * Escalation hierarchy:
 * - Micro: SheetDialog (max depth 2)
 * - Meso: FlowScaffold (sub-flows within route)
 * - Macro: FullScreenRoute (focused tasks)
 * 
 * Plus: RoutePanel for desktop persistent UI
 */

export { FullScreenRoute } from './FullScreenRoute';
export type { FullScreenRouteProps } from './FullScreenRoute';

export { FlowScaffold, useSubFlow } from './FlowScaffold';
export type { FlowScaffoldProps, SubFlowState } from './FlowScaffold';

export { RoutePanel } from './RoutePanel';
export type { RoutePanelProps } from './RoutePanel';
